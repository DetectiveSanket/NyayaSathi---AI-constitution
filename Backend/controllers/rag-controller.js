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
import {
  getLanguageInstruction,
  getLanguageLabel,
  normalizeLanguage,
  supportedLanguages,
} from "../utils/language.js";
import { googleGenerate } from "../services/llm/llmAdapter.js";
import { saveMessage, getMemory, clearMemory as clearUserMemory } from "../services/memoryService.js";
import {
  createConversation,
  getConversation,
  saveConversationMessage,
  generateConversationTitle,
  updateConversation,
} from "../services/conversationService.js";

const CHUNK_SIZE_TOKENS = 500;
const CHUNK_OVERLAP_TOKENS = 100;
const DEFAULT_TOP_K = 4;
const MAX_CONTEXT_CHARS = 15000;
const SIMPLE_QUERY_MAX_WORDS = 12;
const SIMPLE_QUERY_MAX_CHARS = 80;

const contextualKeywords =
  /\b(document|file|section|article|clause|paragraph|page|context|upload|case|petition|act|statute|reference|above|chunk)\b/i;
const simplePrefixes =
  /^(what|who|when|where|why|how|define|explain|tell me about|give me|summarize)\b/i;

const DEFAULT_RAG_MODEL = process.env.RAG_MODEL || "gemini-2.0-flash";
const TRANSLATE_MODEL = "gemini-2.0-flash";

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
    order: typeof match.metadata?.order === "number" ? match.metadata.order : 0,
  }));

const isContextualQuery = (text = "") => contextualKeywords.test(text);

const isSimpleQuery = (text = "") => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (isContextualQuery(trimmed)) return false;

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= SIMPLE_QUERY_MAX_WORDS || trimmed.length <= SIMPLE_QUERY_MAX_CHARS) {
    return true;
  }

  return simplePrefixes.test(trimmed);
};

const buildSimpleAnswerPrompt = ({ query, languageLabel, languageInstruction, memoryContext = "" }) =>
  [
    "You are NyayaSathi, an AI legal assistant.",
    "Provide a concise answer using general legal knowledge. Do NOT reference uploaded documents.",
    "If the user asks about a specific law, explain it in simple terms and provide relevant references.",
    

    memoryContext, // Include conversation memory if available
    `User now asks: ${query}`,
    `Respond in ${languageLabel}.`,
    languageInstruction,
  ].join("\n");

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
      chunkDocs.map(({ chunkId, documentId, text, page, order }) => ({
        chunkId,
        documentId: documentId.toString(),
        text,
        page,
        order,
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
    const { query, topK = DEFAULT_TOP_K, documentId, language = "english", conversationId } = req.body || {};

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query text is required." });
    }

    // Get user ID from auth middleware (supports both regular auth and public RAG tokens)
    const userId = req.user?.userId?.toString() || req.user?._id?.toString() || "anonymous";

    // Handle conversation ID - create new if not provided
    let currentConversationId = conversationId;
    let isNewConversation = false;

    if (!currentConversationId) {
      // Create new conversation
      const newConversation = await createConversation(userId, {
        firstMessage: query,
      });
      currentConversationId = newConversation.conversationId;
      isNewConversation = true;

      // Auto-generate title from first message
      const title = await generateConversationTitle(query);
      await updateConversation(currentConversationId, userId, { title });
    } else {
      // Verify conversation exists and belongs to user
      const existing = await getConversation(currentConversationId, userId);
      if (!existing) {
        // Create new if not found
        const newConversation = await createConversation(userId, {
          conversationId: currentConversationId,
          firstMessage: query,
        });
        currentConversationId = newConversation.conversationId;
        isNewConversation = true;
      }
    }

    const langKey = normalizeLanguage(language);
    const languageInstruction = getLanguageInstruction(langKey);
    const languageLabel = getLanguageLabel(langKey);

    if (isSimpleQuery(query)) {
      // AUTO MODE: Use memory
      const memory = await getMemory(userId);
      
      // Format memory for prompt
      let memoryContext = "";
      if (memory.length > 0) {
        const memoryText = memory
          .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
          .join("\n");
        memoryContext = `\n\nHere is the conversation memory (last ${memory.length} turns):\n${memoryText}\n`;
      }

      const simplePrompt = buildSimpleAnswerPrompt({ 
        query, 
        languageInstruction, 
        languageLabel,
        memoryContext,
      });
      const simpleAnswer = await googleGenerate(DEFAULT_RAG_MODEL, simplePrompt);

      // Save messages to memory
      await saveMessage(userId, "user", query);
      await saveMessage(userId, "assistant", simpleAnswer);

      // Save to conversation
      await saveConversationMessage(currentConversationId, userId, {
        role: "user",
        content: query,
        metadata: { mode: "auto", language: langKey, memoryUsed: true },
      });
      await saveConversationMessage(currentConversationId, userId, {
        role: "assistant",
        content: simpleAnswer,
        metadata: { mode: "auto", language: langKey, memoryUsed: true },
      });

      return res.status(200).json({
        answer: simpleAnswer,
        chunks: [],
        language: langKey,
        supportedLanguages,
        mode: "auto",
        memoryUsed: true,
        conversationId: currentConversationId,
        isNewConversation,
      });
    }

    // CONTEXTUAL MODE: NO memory used

    const userEmbedding = await embedQueryText(query);

    const matches = await querySimilarChunks({
      vector: userEmbedding,
      topK: Math.min(Math.max(Number(topK) || DEFAULT_TOP_K, 1), 20),
      filter: documentId ? { documentId: documentId.toString() } : undefined,
    });

    if (!matches.length) {
      return res.status(200).json({
        answer: "I could not find relevant information for that question.",
        chunks: [],
        language: langKey,
        supportedLanguages,
        mode: "context",
        memoryUsed: false,
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

    // Build prompt with conversation history
    // CONTEXTUAL MODE: NO memory - only use document chunks
    const prompt = [
      "You are NyayaSathi, an AI legal assistant.",
      `Answer the user's question strictly using the provided context chunks. Respond in ${languageLabel}.`,
      "If the context does not contain the answer, say you do not have enough information.",
      languageInstruction,
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

    // DO NOT save to memory in contextual mode

    // Save to conversation
    await saveConversationMessage(currentConversationId, userId, {
      role: "user",
      content: query,
      metadata: { mode: "context", language: langKey, chunks: normalized, memoryUsed: false },
    });
    await saveConversationMessage(currentConversationId, userId, {
      role: "assistant",
      content: answer,
      metadata: { mode: "context", language: langKey, chunks: normalized, memoryUsed: false },
    });

    return res.status(200).json({
      answer,
      chunks: normalized,
      language: langKey,
      supportedLanguages,
      mode: "context",
      memoryUsed: false,
      conversationId: currentConversationId,
      isNewConversation,
    });
  } catch (err) {
    console.error("❌ RAG query error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const translateResponse = async (req, res) => {
  try {
    const { text, language = "english" } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ message: "Text is required for translation." });
    }

    const langKey = normalizeLanguage(language);
    const label = getLanguageLabel(langKey);
    const instruction = getLanguageInstruction(langKey);

    const prompt = [
      "Translate the following response for the NyayaSathi assistant.",
      instruction,
      "",
      `Target language: ${label}`,
      "Text:",
      text,
    ].join("\n");

    const translation = await googleGenerate(TRANSLATE_MODEL, prompt);

    return res.status(200).json({
      translation,
      language: langKey,
      label,
    });
  } catch (err) {
    console.error("❌ Translation error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Clear conversation memory for the authenticated user
 */
export const clearMemory = async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId?.toString() || "anonymous";

    await clearUserMemory(userId);

    return res.status(200).json({
      message: "Conversation memory cleared successfully",
    });
  } catch (err) {
    console.error("❌ Clear memory error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Create a public RAG session token for anonymous chatbot access
 */
export const createRagSession = async (req, res) => {
  try {
    const jwt = await import('jsonwebtoken');
    const sessionId = `rag_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const token = jwt.default.sign(
      {
        sessionId,
        type: "rag_public",
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET || "fallback-secret",
      {
        expiresIn: "30d", // 30 days expiration
      }
    );

    return res.status(200).json({
      token,
      sessionId,
      expiresIn: "30d",
    });
  } catch (err) {
    console.error("❌ Create RAG session error:", err);
    return res.status(500).json({ message: err.message });
  }
};
