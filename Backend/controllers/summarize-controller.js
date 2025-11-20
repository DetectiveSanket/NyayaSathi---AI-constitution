// controllers/summarize-controller.js
import { embedQueryText, querySimilarChunks } from "../services/embeddingService.js";
import { googleGenerate } from "../services/llm/llmAdapter.js";
import {
  getLanguageInstruction,
  getLanguageLabel,
  normalizeLanguage,
  supportedLanguages,
} from "../utils/language.js";

/**
 * Summarizes a specific document using:
 * 1. Query embedding
 * 2. Similar chunk retrieval from Pinecone
 * 3. Gemini LLM summarization
 */
export async function summarizeDocument(req, res) {
  try {
    const { documentId, summaryType = "short", language = "english" } = req.body;

    if (!documentId) {
      return res.status(400).json({ message: "documentId is required" });
    }

    console.log("📄 Summarizing document:", documentId);

    // ------------------------------------
    // 1. Create a summarization prompt
    // ------------------------------------
    const basePrompt = summaryType === "long"
      ? "Give me a detailed summary of this legal document."
      : "Summarize this document in a short and clear way.";

    // ------------------------------------
    // 2. Convert prompt → embedding
    // ------------------------------------
    const queryVector = await embedQueryText(basePrompt);

    // ------------------------------------
    // 3. Retrieve relevant chunks from Pinecone
    // ------------------------------------
    const matches = await querySimilarChunks({
      vector: queryVector,
      topK: 8,
      filter: { documentId }, // Get only this document’s chunks
    });

    if (matches.length === 0) {
      return res.status(404).json({ message: "No chunks found for this document" });
    }

    const combinedText = matches.map((m) => m.metadata.text).join("\n");

    console.log("📌 Chunks retrieved:", matches.length);

    // ------------------------------------
    // 4. Run final summarization through Gemini
    // ------------------------------------
    const langKey = normalizeLanguage(language);
    const languageInstruction = getLanguageInstruction(langKey);
    const languageLabel = getLanguageLabel(langKey);

    const finalPrompt = `
You are a legal document assistant.
Summarize the following content.

Summary style: ${summaryType === "long" ? "detailed" : "short"}.
Respond in ${languageLabel}. ${languageInstruction}

Content:
${combinedText}
    `;

    const summary = await googleGenerate("gemini-1.5-flash", finalPrompt);

    // ------------------------------------
    // 5. Respond
    // ------------------------------------
    return res.json({
      documentId,
      summaryType,
      summary,
      language: langKey,
      supportedLanguages,
      chunksUsed: matches.length,
    });

  } catch (err) {
    console.error("❌ Summarization error:", err);
    return res.status(500).json({ message: err.message });
  }
}
