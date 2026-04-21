// src/services/memoryService.js - Memory management service using Redis
import { getRedisClient } from "./redisClient.js";

const MAX_MESSAGES = 40; // Store last 40 messages
const MEMORY_TTL = 24 * 60 * 60; // 24 hours in seconds

/**
 * Generate Redis key for user memory
 * @param {string} userId - User ID
 * @returns {string}
 */
function getMemoryKey(userId) {
  return `memory:${userId}`;
}

/**
 * Sanitize content to remove sensitive data
 * @param {string} content - Content to sanitize
 * @returns {string} - Sanitized content
 */
function sanitizeContent(content) {
  if (!content || typeof content !== "string") {
    return "";
  }

  let sanitized = content;

  // Remove email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]");

  // Remove phone numbers (various formats)
  sanitized = sanitized.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[PHONE_REDACTED]");
  sanitized = sanitized.replace(/\d{10,}/g, "[PHONE_REDACTED]");

  // Remove addresses (simple pattern - street numbers)
  sanitized = sanitized.replace(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl)/gi, "[ADDRESS_REDACTED]");

  // Remove credit card numbers (16 digits with optional spaces/dashes)
  sanitized = sanitized.replace(/\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g, "[CARD_REDACTED]");

  // Remove SSN (XXX-XX-XXXX format)
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN_REDACTED]");

  return sanitized;
}

/**
 * Save a message to memory
 * @param {string} userId - User ID
 * @param {string} role - "user" or "assistant"
 * @param {string} content - Message content
 * @returns {Promise<void>}
 */
export async function saveMessage(userId, role, content) {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, skipping memory storage");
      return;
    }

    // ioredis will auto-connect on first command, so we just try the operation
    // and catch errors gracefully

    const key = getMemoryKey(userId);
    const sanitizedContent = sanitizeContent(content);
    
    const message = {
      role,
      content: sanitizedContent,
      ts: Date.now(),
    };

    // Add to list (right push to maintain chronological order)
    await client.rpush(key, JSON.stringify(message));

    // Trim to keep only last MAX_MESSAGES
    await client.ltrim(key, -MAX_MESSAGES, -1);

    // Set expiration
    await client.expire(key, MEMORY_TTL);

    // console.log(`✅ Saved ${role} message to memory for user ${userId}`);
  } catch (error) {
    console.error("❌ Error saving message to memory:", error.message);
    // Don't throw - memory is optional
  }
}

/**
 * Get conversation memory (last 10 messages)
 * @param {string} userId - User ID
 * @returns {Promise<Array<{role: string, content: string, ts: number}>>}
 */
export async function getMemory(userId) {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, returning empty memory");
      return [];
    }

    // ioredis will auto-connect on first command, so we just try the operation
    // and catch errors gracefully

    const key = getMemoryKey(userId);
    const rawMessages = await client.lrange(key, 0, -1);

    // Parse JSON strings and return in chronological order
    const messages = rawMessages
      .map((msg) => {
        try {
          return JSON.parse(msg);
        } catch {
          return null;
        }
      })
      .filter((msg) => msg !== null);

    // console.log(`📖 Retrieved ${messages.length} messages from memory for user ${userId}`);
    return messages;
  } catch (error) {
    console.error("❌ Error retrieving memory:", error.message);
    return [];
  }
}

/**
 * Clear memory for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function clearMemory(userId) {
  try {
    const client = getRedisClient();
    if (!client) {
      return;
    }

    // ioredis will auto-connect on first command

    const key = getMemoryKey(userId);
    await client.del(key);
    // console.log(`🗑️ Cleared memory for user ${userId}`);
  } catch (error) {
    console.error("❌ Error clearing memory:", error.message);
  }
}

