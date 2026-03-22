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
const DEFAULT_GEN_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
    
    // Check for quota exceeded error (429)
    if (err.status === 429 || err.message?.includes("quota") || err.message?.includes("429")) {
      const error = new Error("AI service quota exceeded. Please try again later or upgrade your plan.");
      error.code = "QUOTA_EXCEEDED";
      error.status = 429;
      throw error;
    }
    
    // Check for network/connection errors
    if (err.message?.includes("fetch") || err.message?.includes("network")) {
      const error = new Error("Unable to connect to AI service. Please check your internet connection.");
      error.code = "NETWORK_ERROR";
      error.status = 503;
      throw error;
    }
    
    // Generic error
    const error = new Error("AI model failed to generate response. Please try again.");
    error.code = "GENERATION_ERROR";
    error.status = 500;
    throw error;
  }
}

export async function listModels() {
  return [
    {
      id: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      name: `Gemini (${process.env.GEMINI_MODEL || "gemini-2.5-flash"})`,
      description: "Fast, balanced model used for reasoning and summarization.",
    },
  ];
}
