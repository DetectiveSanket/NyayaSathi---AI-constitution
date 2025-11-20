// src/services/llm/llmAdapter.js
import { generateReply as agentReply } from "../agents/agentAdapter.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateReply({ message, conversationId, userId }) {
  return agentReply({ message, userId });
}

// ---------------------------------------------------------
// NEW: googleGenerate → Used by summarization controller
// ---------------------------------------------------------
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function googleGenerate(_model, prompt) {
  try {
    // Always use gemini-2.0-flash
    const gemini = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await gemini.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini generation error:", err);
    throw new Error("Gemini model failed to generate response");
  }
}

export async function listModels() {
  return [
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash (Google Generative AI)",
      description: "Fast, accurate, suitable for legal assistants",
    }
  ];
}
