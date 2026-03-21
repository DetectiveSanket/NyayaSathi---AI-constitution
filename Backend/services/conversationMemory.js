// src/services/conversationMemory.js - Conversation memory management using Redis
import { getRedisClient } from "./redisClient.js";

const MAX_TURNS = 20; // Store last 20 user-assistant turns
const MEMORY_TTL = 24 * 60 * 60; // 24 hours in seconds

/**
 * Generate Redis key for conversation memory
 * @param {string} userId - User ID
 * @param {string} conversationId - Optional conversation ID (defaults to 'default')
 * @returns {string}
 */
function getMemoryKey(userId, conversationId = "default") {
  return `conversation:${userId}:${conversationId}`;
}

/**
 * Add a turn (user query + assistant response) to conversation memory
 * @param {string} userId - User ID
 * @param {string} userQuery - User's query
 * @param {string} assistantResponse - Assistant's response
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<void>}
 */
export async function addTurnToMemory(userId, userQuery, assistantResponse, conversationId = "default") {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, skipping memory storage");
      return;
    }

    const key = getMemoryKey(userId, conversationId);
    const turn = {
      user: userQuery,
      assistant: assistantResponse,
      timestamp: new Date().toISOString(),
    };

    // Add to list (left push to maintain chronological order)
    await client.lPush(key, JSON.stringify(turn));

    // Trim to keep only last MAX_TURNS
    await client.lTrim(key, 0, MAX_TURNS - 1);

    // Set expiration
    await client.expire(key, MEMORY_TTL);

    console.log(`✅ Added turn to memory for user ${userId}`);
  } catch (error) {
    console.error("❌ Error adding turn to memory:", error.message);
    // Don't throw - memory is optional
  }
}

/**
 * Get conversation history (last N turns)
 * @param {string} userId - User ID
 * @param {number} limit - Number of turns to retrieve (default: MAX_TURNS)
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<Array<{user: string, assistant: string, timestamp: string}>>}
 */
export async function getConversationHistory(userId, limit = MAX_TURNS, conversationId = "default") {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, returning empty history");
      return [];
    }

    const key = getMemoryKey(userId, conversationId);
    const rawTurns = await client.lRange(key, 0, limit - 1);

    // Parse JSON strings and reverse to get chronological order (oldest first)
    const turns = rawTurns
      .map((turn) => {
        try {
          return JSON.parse(turn);
        } catch {
          return null;
        }
      })
      .filter((turn) => turn !== null)
      .reverse(); // Reverse to get oldest first

    console.log(`📖 Retrieved ${turns.length} turns from memory for user ${userId}`);
    return turns;
  } catch (error) {
    console.error("❌ Error retrieving conversation history:", error.message);
    return [];
  }
}

/**
 * Format conversation history for LLM prompt
 * @param {Array<{user: string, assistant: string}>} history - Conversation history
 * @returns {string} - Formatted conversation context
 */
export function formatHistoryForPrompt(history) {
  if (!history || history.length === 0) {
    return "";
  }

  const formatted = history
    .map((turn, index) => {
      return `Previous Turn ${index + 1}:
User: ${turn.user}
Assistant: ${turn.assistant}`;
    })
    .join("\n\n");

  return `\n\nPrevious Conversation Context (last ${history.length} turns):\n${formatted}\n`;
}

/**
 * Clear conversation memory for a user
 * @param {string} userId - User ID
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<void>}
 */
export async function clearConversationMemory(userId, conversationId = "default") {
  try {
    const client = await getRedisClient();
    if (!client) {
      return;
    }

    const key = getMemoryKey(userId, conversationId);
    await client.del(key);
    console.log(`🗑️ Cleared conversation memory for user ${userId}`);
  } catch (error) {
    console.error("❌ Error clearing conversation memory:", error.message);
  }
}

/**
 * Get conversation count (number of turns stored)
 * @param {string} userId - User ID
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<number>}
 */
export async function getConversationCount(userId, conversationId = "default") {
  try {
    const client = await getRedisClient();
    if (!client) {
      return 0;
    }

    const key = getMemoryKey(userId, conversationId);
    return await client.lLen(key);
  } catch (error) {
    console.error("❌ Error getting conversation count:", error.message);
    return 0;
  }
}

