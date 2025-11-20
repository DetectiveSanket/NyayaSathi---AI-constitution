// src/services/llm/llmAdapter.js
import { generateReply as agentReply } from "../agents/agentAdapter.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY env var is required for Gemini access.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const DEFAULT_GEN_MODEL = "gemini-2.0-flash";

const normalizeModelName = (modelName) => {
  if (modelName && modelName.trim().length > 0 && modelName === DEFAULT_GEN_MODEL) {
    return modelName;
  }
  return DEFAULT_GEN_MODEL;
};

export async function generateReply({ message, conversationId, userId }) {
  return agentReply({ message, userId });
}

export async function googleGenerate(
  modelName = DEFAULT_GEN_MODEL,
  prompt,
  { temperature = 0.2, maxOutputTokens = 1024 } = {}
) {
  if (!prompt) {
    throw new Error("Prompt is required for googleGenerate.");
  }

  try {
    const gemini = genAI.getGenerativeModel({ model: normalizeModelName(modelName) });
    const result = await gemini.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    });

    return result?.response?.text() ?? "";
  } catch (err) {
    console.error("❌ Gemini generation error:", err);
    throw new Error("Gemini model failed to generate response");
  }
}

export async function listModels() {
  return [
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      description: "Fast, balanced model used for reasoning and summarization.",
    },
  ];
}
