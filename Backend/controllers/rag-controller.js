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

// More specific contextual keywords - only trigger when clearly document-related
// NOTE: "section", "article", "act", "statute" are removed as they're common in general legal questions
const contextualKeywords = /\b(document|file|upload|chunk|resume|cv|project|uploaded|pdf|docx|uploaded\s+file)\b/i;

// Patterns that explicitly indicate document queries (must reference uploaded documents)
const documentQueryPatterns = [
  /\b(in|from|of|within)\s+(the\s+)?(resume|cv|document|file|pdf|uploaded|project|uploaded\s+file|my\s+(resume|document|file))\b/i,
  /\b(resume|cv|document|file|pdf|uploaded|project|uploaded\s+file)\s+(mentions|contains|has|includes|shows|describes|explains|says|states|about)\b/i,
  /\b(tell me|what|show me|find|search|look for|extract|get|retrieve)\s+.*\s+(in|from|of)\s+(the\s+)?(resume|cv|document|file|pdf|uploaded|project|uploaded\s+file|my\s+(resume|document|file))\b/i,
  /\b(what|which|where)\s+(is|are|does|do)\s+.*\s+(in|from|of)\s+(the\s+)?(resume|cv|document|file|pdf|uploaded|project|uploaded\s+file|my\s+(resume|document|file))\b/i,
];

// Patterns that indicate general questions (should use auto mode)
const generalQuestionPatterns = [
  /^(who|what|when|where|why|how|tell me about|explain|define|describe)\s+(you|yourself|your|are you|is this|is that|can you|do you|will you)\b/i,
  /\b(how are you|who are you|what are you|tell me about you|about yourself|your role|your purpose|your function)\b/i,
  /\b(in general|generally|overall|basically|basically speaking|in simple terms|simply|just|only)\b/i,
  /\b(not asking|not about|not from|not in|don't need|don't want|no need|no document|no file)\b/i,
  // General legal questions about sections, acts, statutes (not about uploaded documents)
  /\b(section|article|clause|paragraph|act|statute|ipc|penal\s+code|indian\s+penal\s+code)\s+\d+/i,
  /\b(what|which|how|when|where|why)\s+(is|are|does|do|can|will|should)\s+.*\s+(section|article|act|statute|ipc|penal\s+code)/i,
  /\b(section|article|act|statute)\s+\d+\s+.*\s+(punishment|penalty|fine|imprisonment|what|which|how)/i,
  /\b(if|when)\s+.*\s+(section|article|act|statute)\s+\d+/i,
];

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

/**
 * Check if query is clearly about documents (contextual mode)
 */
const isContextualQuery = (text = "") => {
  const trimmed = text.trim().toLowerCase();
  
  // First check: explicit document keywords (resume, cv, uploaded file, etc.)
  if (contextualKeywords.test(trimmed)) {
    // But make sure it's not a general question about the keyword itself
    const generalAboutDocument = /^(what|who|when|where|why|how|tell me about|explain|define)\s+(is|are|does|do|can|will)\s+(a|an|the)?\s*(document|file|pdf|resume|cv)\b/i;
    if (generalAboutDocument.test(text)) {
      return false; // General question about documents, not querying a document
    }
    // Check if it's asking about uploaded documents specifically
    const uploadedDocPattern = /\b(uploaded|my|the)\s+(document|file|pdf|resume|cv|project)\b/i;
    if (uploadedDocPattern.test(trimmed)) {
      return true; // Asking about uploaded document
    }
    // If keyword appears but not in document context, it might be general
    return false; // Be conservative - only trigger if clearly about uploaded docs
  }
  
  // Second check: document query patterns (must explicitly reference uploaded documents)
  for (const pattern of documentQueryPatterns) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if query is a general question (auto mode)
 */
const isGeneralQuestion = (text = "") => {
  const trimmed = text.trim();
  
  // Check for explicit general question patterns
  for (const pattern of generalQuestionPatterns) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  
  // Check for simple prefixes without document references
  if (simplePrefixes.test(trimmed)) {
    // Make sure it doesn't contain document keywords
    if (!contextualKeywords.test(trimmed)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Determine if query should use simple/auto mode
 * Returns true for auto mode, false for contextual mode
 */
const isSimpleQuery = async (text = "", documentId = null) => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  
  // If documentId is explicitly provided, ALWAYS use contextual mode
  if (documentId) {
    console.log("🔍 Document ID provided, forcing contextual mode");
    return false;
  }
  
  // Priority 1: Check for explicit general question patterns (including legal questions)
  if (isGeneralQuestion(trimmed)) {
    console.log("✅ General question pattern detected, using auto mode");
    return true;
  }
  
  // Priority 2: Check for explicit document query patterns
  // Only trigger if clearly asking about uploaded documents
  if (isContextualQuery(trimmed)) {
    console.log("🔍 Document query pattern detected, using contextual mode");
    return false;
  }
  
  // Priority 2.5: Check if it's a general legal question (about laws, sections, acts)
  // These should use auto mode, not contextual
  const generalLegalPattern = /\b(what|which|how|when|where|why|if|tell me|explain|describe)\s+.*\s+(section|article|act|statute|ipc|penal\s+code|indian\s+penal\s+code)\s+(\d+|means|is|about)/i;
  if (generalLegalPattern.test(trimmed) && !isContextualQuery(trimmed)) {
    console.log("✅ General legal question detected, using auto mode");
    return true;
  }
  
  // Priority 3: Use LLM-based classification for ambiguous queries
  // This helps with edge cases where pattern matching isn't enough
  try {
    const classificationPrompt = `You are a query classifier. Determine if the user's question is asking about:
1. GENERAL KNOWLEDGE, LEGAL QUESTIONS, or ABOUT YOU (use "auto")
2. SPECIFIC CONTENT FROM AN UPLOADED DOCUMENT (use "contextual")

User query: "${trimmed}"

Respond with ONLY one word: "auto" or "contextual"

Examples (use "auto"):
- "who are you" → auto
- "tell me about you" → auto  
- "how are you" → auto
- "what is Section 154 of IPC" → auto (general legal question)
- "if someone came under Section 154, what punishment?" → auto (general legal question)
- "what is the punishment for Section 302?" → auto (general legal question)
- "explain Indian Penal Code Section 154" → auto (general legal question)
- "what is a document" → auto

Examples (use "contextual"):
- "tell me about bikes project in resume" → contextual (asks about uploaded document)
- "what is mentioned in the document" → contextual (asks about uploaded document)
- "find information about X in the file" → contextual (asks about uploaded document)
- "what does my resume say about X" → contextual (asks about uploaded document)

Key rule: Questions about legal sections, acts, statutes, or general legal knowledge should use "auto", NOT "contextual".
Only use "contextual" if the question explicitly asks about content from an uploaded document/resume/file.

Classification:`;

    const classification = await googleGenerate("gemini-2.0-flash", classificationPrompt);
    const normalized = classification.trim().toLowerCase();
    
    if (normalized.includes("auto")) {
      console.log("✅ LLM classified as auto mode");
      return true;
    } else if (normalized.includes("contextual")) {
      console.log("🔍 LLM classified as contextual mode");
      return false;
    }
  } catch (error) {
    console.warn("⚠️ LLM classification failed, falling back to pattern matching:", error.message);
  }
  
  // Fallback: Use simple heuristics
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= SIMPLE_QUERY_MAX_WORDS || trimmed.length <= SIMPLE_QUERY_MAX_CHARS) {
    // Short queries are likely general questions unless they contain document keywords
    if (!contextualKeywords.test(trimmed)) {
      console.log("✅ Short query without document keywords, using auto mode");
      return true;
    }
  }

  // Default to contextual if ambiguous (safer for document queries)
  console.log("⚠️ Ambiguous query, defaulting to contextual mode");
  return false;
};

const buildSimpleAnswerPrompt = ({ query, languageLabel, languageInstruction, memoryContext = "" }) =>
  [
    "You are NyayaSathi, an AI legal assistant designed to help users with legal questions and information.",
    "",
    "Your role:",
    "- Answer general questions about yourself, your capabilities, and legal concepts",
    "- Provide helpful, friendly, and informative responses",
    "- Use your general knowledge to answer questions",
    "- Be conversational and natural in your responses",
    "",
    "Important guidelines:",
    "- If asked about yourself (e.g., 'who are you', 'tell me about you'), introduce yourself as NyayaSathi, an AI legal assistant",
    "- If asked general questions, answer using your knowledge base",
    "- Do NOT reference uploaded documents unless the user explicitly asks about document content",
    "- If the user asks about a specific law, explain it in simple terms and provide relevant references",
    "- Be flexible and adapt to the user's intent",
    "",
    memoryContext ? `Conversation context:\n${memoryContext}\n` : "",
    `User question: ${query}`,
    "",
    `Please respond in ${languageLabel}.`,
    languageInstruction,
    "",
    "Provide a clear, helpful, and natural response:",
  ].filter(Boolean).join("\n");

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

    // Check if query should use simple mode (only if no documentId and no contextual keywords)
    const shouldUseSimpleMode = await isSimpleQuery(query, documentId);
    
    console.log("🔍 Query analysis:", {
      query,
      documentId: documentId || "none",
      mode: shouldUseSimpleMode ? "auto" : "contextual",
    });

    if (shouldUseSimpleMode) {
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
        mode: "contextual",
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
      "",
      "Instructions:",
      "- Answer the user's question using ONLY the provided context chunks from uploaded documents",
      "- If the context does not contain relevant information, respond: 'I do not have enough information to answer this question based on the uploaded documents.'",
      "- Do NOT use general knowledge or make assumptions",
      "- Be specific and cite relevant parts of the context when possible",
      "",
      `Respond in ${languageLabel}.`,
      languageInstruction,
      "",
      `Context from documents:\n${contextString}`,
      "",
      `User question: ${query}`,
      "",
      "Answer based on the context provided:",
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
      metadata: { mode: "contextual", language: langKey, chunks: normalized, memoryUsed: false },
    });
    await saveConversationMessage(currentConversationId, userId, {
      role: "assistant",
      content: answer,
      metadata: { mode: "contextual", language: langKey, chunks: normalized, memoryUsed: false },
    });

    return res.status(200).json({
      answer,
      chunks: normalized,
      language: langKey,
      supportedLanguages,
      mode: "contextual",
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
