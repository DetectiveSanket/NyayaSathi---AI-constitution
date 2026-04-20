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

const MODEL_FALLBACK_CHAIN = [
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    process.env.GEMINI_FALLBACK_1 || "gemini-2.5-pro",
    process.env.GEMINI_FALLBACK_2 || "gemini-1.5-flash",
];

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

    // If a specific custom model is requested that isn't the default, try only that one.
    // Otherwise, use the fallback chain.
    const modelsToTry = modelName && modelName !== DEFAULT_GEN_MODEL 
        ? [modelName] 
        : MODEL_FALLBACK_CHAIN;

    let lastError = null;

    for (const model of modelsToTry) {
        console.log(`🤖 LLM Adapter: Trying model [${model}]...`);
        try {
            const gemini = genAI.getGenerativeModel({ model });
            const result = await gemini.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature,
                    maxOutputTokens,
                },
            });

            console.log(`✅ LLM Adapter: Successfully generated response using [${model}]`);
            return result?.response?.text() ?? "";

        } catch (err) {
            // Check for quota exceeded (429) or high demand/service unavailable (503/500)
            const isQuotaOrOverload = 
                err.status === 429 || 
                err.status === 503 || 
                err.status === 500 ||
                err.message?.includes("quota") || 
                err.message?.includes("429") ||
                err.message?.includes("503") ||
                err.message?.includes("high demand") ||
                err.message?.includes("Service Unavailable") ||
                err.message?.includes("overloaded");

            if (isQuotaOrOverload) {
                console.warn(`⚠️ LLM Adapter: Model [${model}] overloaded or quota hit (${err.status || 'high demand'}). Trying next fallback...`);
                lastError = err;
                continue; // Proceed to the next model in the chain
            }

            console.error(`❌ Gemini generation error with model [${model}]:`, err);

            // 404 = model not found, try next fallback instead of crashing
            if (err.status === 404) {
                console.warn(`⚠️ LLM Adapter: Model [${model}] not found (404). Trying next fallback...`);
                lastError = err;
                continue;
            }

            // Only true network errors (no status code at all)
            if (!err.status && (err.message?.includes("network") || err.message?.includes("ECONNREFUSED") || err.message?.includes("fetch"))) {
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

    // If loop completes without returning, all models in the chain failed due to 429 Quota Exceeded
    console.error("❌ LLM Adapter: All fallback models exhausted. Final error:", lastError?.message);
    const error = new Error("AI service quota exceeded across all available models. Please try again later or upgrade your plan.");
    error.code = "QUOTA_EXCEEDED";
    error.status = 429;
    throw error;
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
