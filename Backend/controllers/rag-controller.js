import {
  downloadFromS3,
  extractTextFromBuffer,
  cleanText,
} from "../services/documents/extractText.js";
import { TokenTextSplitter } from "@langchain/textsplitters";
import Document from "../models/document.js";
import DocumentChunk from "../models/documentChunk.js";
import {
  embedDocumentChunks,
  embedQueryText,
  querySimilarChunks,
} from "../services/embeddingService.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const CHUNK_SIZE_TOKENS = 500;
const CHUNK_OVERLAP_TOKENS = 100;
const DEFAULT_TOP_K = 5;
const MAX_CONTEXT_CHARS = 15000;

const DEFAULT_RAG_MODEL = process.env.RAG_MODEL || "gemini-2.0-flash";

const ragModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: DEFAULT_RAG_MODEL,
  temperature: 0.2,
  maxOutputTokens: 1024,
});

const tokenSplitter = new TokenTextSplitter({
  encodingName: "cl100k_base",
  chunkSize: CHUNK_SIZE_TOKENS,
  chunkOverlap: CHUNK_OVERLAP_TOKENS,
});

const normalizeMatches = (matches = []) =>
  matches.map((match) => ({
    chunkId: match.id,
    score: match.score,
    text: match.metadata?.text || "",
    documentId: match.metadata?.documentId,
    page: match.metadata?.page || 1,
  }));

export const processDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    // 1. Find doc metadata
    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    console.log("📄 Starting extraction for:", doc.filename);

    // 2. Download file buffer from S3
    const buffer = await downloadFromS3(doc.s3Key);

    if (!buffer || buffer.length === 0) {
      return res.status(500).json({ message: "Downloaded file is empty" });
    }

    // 3. Extract text (PDF or DOCX)
    console.log("🔍 Content-Type:", doc.contentType);
    const rawText = await extractTextFromBuffer(buffer, doc.contentType);
    console.log("📝 Raw text length:", rawText.length);
    console.log("📝 Raw text preview:", rawText.substring(0, 300));

    // 4. Clean text
    const cleaned = cleanText(rawText);
    console.log("🧹 Cleaned text length:", cleaned.length);

    // If PDF had no readable text
    if (!cleaned || cleaned.length === 0) {
      await DocumentChunk.deleteMany({ documentId: doc._id });
      await Document.findByIdAndUpdate(doc._id, { processed: false });

      return res.status(200).json({
        documentId,
        chunksCount: 0,
        chunks: [],
        message: "No readable text found. Document may be scanned (OCR disabled).",
      });
    }

    // 5. Chunk text using token-based splitter (500 tokens w/ 100 overlap)
    const chunkTexts = await tokenSplitter.splitText(cleaned);
    console.log("✂️ Created", chunkTexts.length, "chunks");

    if (!chunkTexts.length) {
      return res.status(200).json({
        documentId,
        chunksCount: 0,
        chunks: [],
        message: "Unable to generate readable chunks from this document.",
      });
    }

    // Persist chunk metadata (one chunk per token window)
    const chunkDocs = chunkTexts.map((text, index) => ({
      documentId: doc._id,
      chunkId: `${doc._id.toString()}#${index}`,
      text,
      page: 1,
      order: index,
    }));

    await DocumentChunk.deleteMany({ documentId: doc._id });
    await DocumentChunk.insertMany(chunkDocs);

    // 6. Generate embeddings + store in Pinecone
    const embeddingResult = await embedDocumentChunks(
      chunkDocs.map(({ chunkId, documentId, text, page }) => ({
        chunkId,
        documentId: documentId.toString(),
        text,
        page,
      }))
    );

    if (!embeddingResult.success) {
      return res.status(500).json({
        message: "Failed to embed document chunks",
        error: embeddingResult.error,
      });
    }

    await Document.findByIdAndUpdate(doc._id, {
      processed: true,
      meta: { chunkCount: chunkDocs.length, lastProcessedAt: new Date() },
    });

    return res.status(200).json({
      documentId,
      chunksCount: chunkDocs.length,
      message: "Document processed successfully and stored in Pinecone.",
    });
  } catch (err) {
    console.error("❌ Extraction error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const queryRag = async (req, res) => {
  try {
    const { query, topK = DEFAULT_TOP_K, documentId } = req.body || {};

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query text is required." });
    }

    const userEmbedding = await embedQueryText(query);

    const matches = await querySimilarChunks({
      vector: userEmbedding,
      topK: Math.min(Number(topK) || DEFAULT_TOP_K, 20),
      filter: documentId ? { documentId: documentId.toString() } : undefined,
    });

    if (!matches.length) {
      return res.status(200).json({
        answer: "I could not find relevant information for that question.",
        chunks: [],
      });
    }

    const normalized = normalizeMatches(matches);
    const contextString = normalized
      .map(
        (match, index) =>
          `Chunk ${index + 1} (score: ${match.score?.toFixed(3) ?? "n/a"})\n${match.text}`
      )
      .join("\n\n")
      .slice(0, MAX_CONTEXT_CHARS);

    const prompt = [
      "You are NyayaSathi, an AI legal assistant.",
      "Answer the user's question strictly using the provided context chunks.",
      "If the context does not contain the answer, say you do not have enough information.",
      "",
      `Context:\n${contextString}`,
      "",
      `Question: ${query}`,
    ].join("\n");

    const completion = await ragModel.invoke(prompt);

    const buildAnswer = (response) => {
      if (!response) return "";
      if (typeof response.content === "string") return response.content;
      if (Array.isArray(response.content)) {
        return response.content
          .map((block) => block?.text || block?.content || "")
          .join("\n")
          .trim();
      }
      return String(response.content ?? "");
    };

    const answer = buildAnswer(completion);

    return res.status(200).json({
      answer,
      chunks: normalized,
    });
  } catch (err) {
    console.error("❌ RAG query error:", err);
    return res.status(500).json({ message: err.message });
  }
};
