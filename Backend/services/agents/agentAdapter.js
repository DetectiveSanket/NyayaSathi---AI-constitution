// src/services/agent/agentAdapter.js
import { agentGraph } from "./agentGraph.js";

/**
 * Generate reply from the LangGraph legal agent.
 *
 * @param {Object} options
 * @param {string} options.message
 * @returns {Promise<{ text: string, meta: object }>}
 */
export async function generateReply({ message, userId }) {
  if (!message) {
    throw new Error("Message is required.");
  }

  // Run graph
  const result = await agentGraph.invoke({
    user_message: message,
  });

  return {
    text: result.output,
    meta: {
      provider: "google-genai",
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    },
  };
}
