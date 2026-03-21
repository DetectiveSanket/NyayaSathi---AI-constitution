// Backend/services/conversationService.js - Conversation management service
import Conversation from "../models/conversation.js";
import ConversationMessage from "../models/conversationMessage.js";
import { getRedisClient } from "./redisClient.js";
import crypto from "crypto";

/**
 * Generate a unique conversation ID
 */
export function generateConversationId() {
  return `conv_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Create a new conversation
 */
export async function createConversation(userId, options = {}) {
  const conversationId = options.conversationId || generateConversationId();
  
  const conversation = await Conversation.create({
    userId,
    conversationId,
    title: options.title || "New Conversation",
    firstMessage: options.firstMessage || null,
    messageCount: 0,
    lastMessageAt: new Date(),
    metadata: options.metadata || {},
  });

  // Cache in Redis for fast access
  const redis = getRedisClient();
  if (redis && redis.status === "ready") {
    try {
      await redis.setex(
        `conversation:${conversationId}`,
        7 * 24 * 60 * 60, // 7 days TTL
        JSON.stringify({
          id: conversation._id.toString(),
          conversationId,
          userId,
          title: conversation.title,
          messageCount: 0,
          lastMessageAt: conversation.lastMessageAt.toISOString(),
        })
      );
    } catch (err) {
      console.warn("⚠️ Failed to cache conversation in Redis:", err.message);
    }
  }

  return conversation;
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId, userId = null) {
  // Try Redis first
  const redis = getRedisClient();
  if (redis && redis.status === "ready") {
    try {
      const cached = await redis.get(`conversation:${conversationId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // If userId provided, verify ownership
        if (userId && parsed.userId !== userId) {
          return null;
        }
        return parsed;
      }
    } catch (err) {
      console.warn("⚠️ Redis get failed, falling back to DB:", err.message);
    }
  }

  // Fallback to MongoDB
  const query = { conversationId };
  if (userId) {
    query.userId = userId;
  }

  const conversation = await Conversation.findOne(query);
  if (!conversation) {
    return null;
  }

  return {
    id: conversation._id.toString(),
    conversationId: conversation.conversationId,
    userId: conversation.userId,
    title: conversation.title,
    firstMessage: conversation.firstMessage,
    messageCount: conversation.messageCount,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

/**
 * List user's conversations (most recent first)
 */
export async function listConversations(userId, limit = 50) {
  const conversations = await Conversation.find({ userId })
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .select("conversationId title firstMessage messageCount lastMessageAt createdAt")
    .lean();

  return conversations.map((conv) => ({
    id: conv._id.toString(),
    conversationId: conv.conversationId,
    title: conv.title,
    firstMessage: conv.firstMessage,
    messageCount: conv.messageCount,
    lastMessageAt: conv.lastMessageAt.toISOString(),
    createdAt: conv.createdAt.toISOString(),
    preview: conv.firstMessage || "New conversation",
  }));
}

/**
 * Update conversation (title, etc.)
 */
export async function updateConversation(conversationId, userId, updates) {
  const conversation = await Conversation.findOneAndUpdate(
    { conversationId, userId },
    { ...updates, updatedAt: new Date() },
    { new: true }
  );

  if (!conversation) {
    return null;
  }

  // Invalidate Redis cache
  const redis = getRedisClient();
  if (redis && redis.status === "ready") {
    try {
      await redis.del(`conversation:${conversationId}`);
    } catch (err) {
      console.warn("⚠️ Failed to invalidate Redis cache:", err.message);
    }
  }

  return {
    id: conversation._id.toString(),
    conversationId: conversation.conversationId,
    title: conversation.title,
    messageCount: conversation.messageCount,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
  };
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId, userId) {
  // Delete messages first
  await ConversationMessage.deleteMany({ conversationId, userId });

  // Delete conversation
  const result = await Conversation.deleteOne({ conversationId, userId });

  // Invalidate Redis cache
  const redis = getRedisClient();
  if (redis && redis.status === "ready") {
    try {
      await redis.del(`conversation:${conversationId}`);
    } catch (err) {
      console.warn("⚠️ Failed to invalidate Redis cache:", err.message);
    }
  }

  return result.deletedCount > 0;
}

/**
 * Save message to conversation
 */
export async function saveConversationMessage(conversationId, userId, message) {
  // Get current message count
  const conversation = await Conversation.findOne({ conversationId, userId });
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const order = conversation.messageCount;

  // Save message
  const savedMessage = await ConversationMessage.create({
    conversationId,
    userId,
    role: message.role,
    content: message.content,
    metadata: message.metadata || {},
    order,
  });

  // Update conversation
  await Conversation.updateOne(
    { conversationId, userId },
    {
      $inc: { messageCount: 1 },
      $set: { lastMessageAt: new Date() },
      ...(order === 0 && message.role === "user" && message.content
        ? { firstMessage: message.content.substring(0, 500) }
        : {}),
    }
  );

  // Cache message in Redis (for recent messages)
  const redis = getRedisClient();
  if (redis && redis.status === "ready") {
    try {
      const messageKey = `conversation:${conversationId}:messages`;
      await redis.lpush(messageKey, JSON.stringify(savedMessage));
      await redis.ltrim(messageKey, 0, 99); // Keep last 100 messages
      await redis.expire(messageKey, 7 * 24 * 60 * 60); // 7 days TTL
    } catch (err) {
      console.warn("⚠️ Failed to cache message in Redis:", err.message);
    }
  }

  return savedMessage;
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(conversationId, userId, limit = 100) {
  // Try Redis first (for recent messages)
  const redis = getRedisClient();
  if (redis && redis.status === "ready") {
    try {
      const messageKey = `conversation:${conversationId}:messages`;
      const cached = await redis.lrange(messageKey, 0, limit - 1);
      if (cached && cached.length > 0) {
        return cached.map((msg) => JSON.parse(msg)).reverse(); // Reverse to get chronological order
      }
    } catch (err) {
      console.warn("⚠️ Redis get messages failed, falling back to DB:", err.message);
    }
  }

  // Fallback to MongoDB
  const messages = await ConversationMessage.find({ conversationId, userId })
    .sort({ order: 1 })
    .limit(limit)
    .lean();

  return messages.map((msg) => ({
    id: msg._id.toString(),
    role: msg.role,
    content: msg.content,
    metadata: msg.metadata || {},
    order: msg.order,
    timestamp: msg.createdAt.toISOString(),
  }));
}

/**
 * Auto-generate conversation title from first user message
 */
export async function generateConversationTitle(firstMessage) {
  if (!firstMessage || firstMessage.length < 10) {
    return "New Conversation";
  }

  // Truncate to reasonable length
  const maxLength = 50;
  if (firstMessage.length <= maxLength) {
    return firstMessage;
  }

  // Try to cut at word boundary
  const truncated = firstMessage.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 20) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

