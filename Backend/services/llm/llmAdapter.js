// src/services/llm/llmAdapter.js
import { generateReply as agentReply } from "../agents/agentAdapter.js";

export async function generateReply({ message, conversationId, userId }) {
  return agentReply({ message, userId });
}

export async function listModels() {
  return [
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash (Google Generative AI)",
      description: "Fast, accurate, suitable for legal assistants",
    }
  ];
}
