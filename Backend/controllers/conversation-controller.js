// Backend/controllers/conversation-controller.js - Conversation management endpoints
import {
  createConversation,
  getConversation,
  listConversations,
  updateConversation,
  deleteConversation,
  getConversationMessages,
  generateConversationTitle,
} from "../services/conversationService.js";

/**
 * Create a new conversation
 */
export const createConversationHandler = async (req, res) => {
  try {
    const userId = req.user?.userId?.toString() || req.user?._id?.toString() || "anonymous";
    const { title, conversationId } = req.body || {};

    const conversation = await createConversation(userId, {
      title: title || "New Conversation",
      conversationId,
    });

    return res.status(201).json({
      id: conversation._id.toString(),
      conversationId: conversation.conversationId,
      title: conversation.title,
      messageCount: conversation.messageCount,
      createdAt: conversation.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("❌ Create conversation error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get conversation by ID
 */
export const getConversationHandler = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.userId?.toString() || req.user?._id?.toString() || "anonymous";

    const conversation = await getConversation(conversationId, userId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.status(200).json(conversation);
  } catch (err) {
    console.error("❌ Get conversation error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * List user's conversations
 */
export const listConversationsHandler = async (req, res) => {
  try {
    const userId = req.user?.userId?.toString() || req.user?._id?.toString() || "anonymous";
    const limit = parseInt(req.query.limit) || 50;

    const conversations = await listConversations(userId, limit);

    return res.status(200).json({
      conversations,
      count: conversations.length,
    });
  } catch (err) {
    console.error("❌ List conversations error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update conversation (title, etc.)
 */
export const updateConversationHandler = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.userId?.toString() || req.user?._id?.toString() || "anonymous";
    const { title } = req.body || {};

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const conversation = await updateConversation(conversationId, userId, { title });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.status(200).json(conversation);
  } catch (err) {
    console.error("❌ Update conversation error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Delete conversation
 */
export const deleteConversationHandler = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.userId?.toString() || req.user?._id?.toString() || "anonymous";

    const deleted = await deleteConversation(conversationId, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("❌ Delete conversation error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get conversation messages
 */
export const getConversationMessagesHandler = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.userId?.toString() || req.user?._id?.toString() || "anonymous";
    const limit = parseInt(req.query.limit) || 100;

    const messages = await getConversationMessages(conversationId, userId, limit);

    return res.status(200).json({
      conversationId,
      messages,
      count: messages.length,
    });
  } catch (err) {
    console.error("❌ Get conversation messages error:", err);
    return res.status(500).json({ message: err.message });
  }
};

