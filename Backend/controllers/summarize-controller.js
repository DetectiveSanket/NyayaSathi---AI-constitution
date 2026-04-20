// controllers/summarize-controller.js
import DocumentChunk from "../models/documentChunk.js";
import Document from "../models/document.js";
import { googleGenerate } from "../services/llm/llmAdapter.js";
import {
  getLanguageInstruction,
  getLanguageLabel,
  normalizeLanguage,
  supportedLanguages,
} from "../utils/language.js";
// Fallback: Pinecone-based fetch (used only if MongoDB has no stored chunks)
import { fetchDocumentChunksFromPinecone } from "../services/embeddingService.js";
import { saveConversationMessage } from "../services/conversationService.js";

const SUMMARY_TYPES = {
  short: {
    label: "short",
    instructions: "Keep it concise (≤3 sentences) highlighting only the most critical legal points.",
  },
  medium: {
    label: "medium",
    instructions: "Provide a balanced ~5 sentence summary covering facts, issues, and holding.",
  },
  detailed: {
    label: "detailed",
    instructions:
      "Write a comprehensive summary covering context, arguments, holdings, and implications.",
  },
};

const DEFAULT_SUMMARY_TYPE = "medium";

const normalizeSummaryType = (value) => {
  const key = value?.toString().toLowerCase();
  if (key && SUMMARY_TYPES[key]) return key;
  return DEFAULT_SUMMARY_TYPE;
};

/**
 * Summarizes a specific document.
 *
 * Strategy (in priority order):
 *   1. Read all DocumentChunk records from MongoDB (complete, ordered, no vector search).
 *   2. If MongoDB has no chunks for this doc, fall back to Pinecone query.
 *
 * This fixes the bug where the old Pinecone-only approach returned
 * "I could not find relevant information …" because similarity search
 * missed chunks that were not near the query vector.
 */
export async function summarizeDocument(req, res) {
  try {
    // Accept both 'summaryType' and 'length' for frontend compatibility
    const {
      documentId,
      summaryType,
      length,
      summaryLength,
      language = "english",
      conversationId,
    } = req.body;
    const rawSummaryType = summaryType || length || summaryLength || DEFAULT_SUMMARY_TYPE;

    if (!documentId) {
      return res.status(400).json({ message: "documentId is required" });
    }

    const summaryKey = normalizeSummaryType(rawSummaryType);
    const summaryConfig = SUMMARY_TYPES[summaryKey];
    const langKey = normalizeLanguage(language);
    const languageInstruction = getLanguageInstruction(langKey);
    const languageLabel = getLanguageLabel(langKey);

    console.log("📄 Summarizing document:", documentId, "type:", summaryKey, "lang:", langKey);

    // ── STEP 1: Prefer MongoDB chunks (complete, ordered) ─────────────────────
    let chunksText = null;
    let chunksUsed = 0;

    const mongoChunks = await DocumentChunk.find({ documentId })
      .sort({ order: 1 })
      .lean();

    if (mongoChunks && mongoChunks.length > 0) {
      const filtered = mongoChunks.filter((c) => c.text?.trim().length > 0);
      chunksText = filtered.map((c) => c.text).join("\n");
      chunksUsed = filtered.length;
      console.log(`✅ MongoDB chunks fetched: ${chunksUsed}`);
    } else {
      // ── STEP 2: Fallback – Pinecone (may be incomplete) ────────────────────
      console.warn("⚠️ No MongoDB chunks found, falling back to Pinecone…");
      const matches = await fetchDocumentChunksFromPinecone({
        documentId,
        maxChunks: 200,
      });

      if (!matches.length) {
        return res.status(404).json({
          message:
            "No document content found. Please make sure the document has been processed (chunked & embedded) before summarizing.",
        });
      }

      const sorted = matches
        .map((m) => ({
          text: m.metadata?.text || "",
          order: typeof m.metadata?.order === "number" ? m.metadata.order : Number((m.id || "").split("#")[1]) || 0,
        }))
        .filter((c) => c.text.trim().length > 0)
        .sort((a, b) => a.order - b.order);

      chunksText = sorted.map((c) => c.text).join("\n");
      chunksUsed = sorted.length;
      console.log(`✅ Pinecone chunks fetched: ${chunksUsed}`);
    }

    // ── STEP 3: Get document filename for the prompt ───────────────────────────
    let docName = "Legal Document";
    try {
      const docMeta = await Document.findById(documentId).select("filename").lean();
      if (docMeta?.filename) docName = docMeta.filename;
    } catch (_) {}

    // ── STEP 4: Build prompt & call LLM ───────────────────────────────────────
    const finalPrompt = `You are a legal document assistant.

Summarize the following legal document titled "${docName}".

Summary style: ${summaryKey}.
${summaryConfig.instructions}
Respond in ${languageLabel}. ${languageInstruction}

Document content:
${chunksText}`;

    const summary = await googleGenerate(
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      finalPrompt
    );

    if (conversationId) {
      const userId = req.user?._id?.toString() || req.user?.userId?.toString() || "anonymous";
      try {
        await saveConversationMessage(conversationId, userId, { role: "user", content: `Summarize "${docName}" in ${languageLabel}` });
        await saveConversationMessage(conversationId, userId, { role: "assistant", content: summary });
      } catch(dbErr) {
        console.warn("⚠️ Failed to persist summary to conversation history:", dbErr.message);
      }
    }

    return res.json({
      documentId,
      summaryType: summaryKey,
      summary,
      language: langKey,
      supportedLanguages,
      chunksUsed,
      documentName: docName,
    });
  } catch (err) {
    console.error("❌ Summarization error:", err);
    return res.status(500).json({ message: err.message });
  }
}

