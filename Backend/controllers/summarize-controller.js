// controllers/summarize-controller.js
import { fetchDocumentChunksFromPinecone } from "../services/embeddingService.js";
import { googleGenerate } from "../services/llm/llmAdapter.js";
import {
  getLanguageInstruction,
  getLanguageLabel,
  normalizeLanguage,
  supportedLanguages,
} from "../utils/language.js";

const SUMMARY_TYPES = {
  short: {
    label: "short",
    instructions: "Keep it concise (≤3 sentences) highlighting only the most critical legal points.",
    maxChunks: 12,
  },
  medium: {
    label: "medium",
    instructions: "Provide a balanced ~5 sentence summary covering facts, issues, and holding.",
    maxChunks: 40,
  },
  detailed: {
    label: "detailed",
    instructions:
      "Write a comprehensive summary covering context, arguments, holdings, and implications.",
    maxChunks: 120,
  },
};

const DEFAULT_SUMMARY_TYPE = "medium";

const normalizeSummaryType = (value) => {
  const key = value?.toString().toLowerCase();
  if (key && SUMMARY_TYPES[key]) return key;
  return DEFAULT_SUMMARY_TYPE;
};

const parseChunkOrder = (match) => {
  if (typeof match.metadata?.order === "number") return match.metadata.order;
  const parts = match.id?.split("#") || [];
  return Number(parts[1]) || 0;
};

/**
 * Summarizes a specific document by retrieving all of its chunks from Pinecone and
 * prompting Gemini with sequential context.
 */
export async function summarizeDocument(req, res) {
  try {
    const { documentId, summaryType = DEFAULT_SUMMARY_TYPE, language = "english" } = req.body;

    if (!documentId) {
      return res.status(400).json({ message: "documentId is required" });
    }

    const summaryKey = normalizeSummaryType(summaryType);
    const summaryConfig = SUMMARY_TYPES[summaryKey];
    const langKey = normalizeLanguage(language);
    const languageInstruction = getLanguageInstruction(langKey);
    const languageLabel = getLanguageLabel(langKey);

    console.log("📄 Summarizing document:", documentId, "type:", summaryKey);

    const matches = await fetchDocumentChunksFromPinecone({
      documentId,
      maxChunks: summaryConfig.maxChunks,
    });

    if (!matches.length) {
      return res.status(404).json({ message: "No chunks found for this document" });
    }

    const normalized = matches
      .map((match) => ({
        chunkId: match.id,
        text: match.metadata?.text || "",
        page: match.metadata?.page || 1,
        order: parseChunkOrder(match),
      }))
      .filter((chunk) => chunk.text?.trim().length > 0)
      .sort((a, b) => a.order - b.order);

    const combinedText = normalized.map((chunk) => chunk.text).join("\n");

    console.log("📌 Chunks retrieved:", normalized.length);

    const finalPrompt = `
You are a legal document assistant.
Summarize the following content.

Summary style: ${summaryKey}.
${summaryConfig.instructions}
Respond in ${languageLabel}. ${languageInstruction}

Content:
${combinedText}
    `;

    // const summary = await googleGenerate("gemini-2.0-flash", finalPrompt);
    const summary = await googleGenerate(process.env.GEMINI_MODEL || "gemini-2.5-flash", finalPrompt);

    return res.json({
      documentId,
      summaryType: summaryKey,
      summary,
      language: langKey,
      supportedLanguages,
      chunksUsed: normalized.length,
    });
  } catch (err) {
    console.error("❌ Summarization error:", err);
    return res.status(500).json({ message: err.message });
  }
}
