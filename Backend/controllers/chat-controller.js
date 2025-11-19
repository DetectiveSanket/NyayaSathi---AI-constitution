// src/controllers/chatController.js
import Conversation from "../models/Conversation.js";
import Message from "../models/message.js";
import { generateReply } from "../services/llm/llmAdapter.js";

export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { message, conversationId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required." });
    }

    let convoId = conversationId;

    // If conversation doesn't exist → create new conversation
    let conversation;
    if (!convoId) {
      conversation = await Conversation.create({
        user: userId,
        title: message.slice(0, 40),
      });

      convoId = conversation._id;
    } else {
      conversation = await Conversation.findOne({
        _id: convoId,
        user: userId,
      });

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
    }

    // Save user's message
    const userMessage = await Message.create({
      conversation: convoId,
      sender: "user",
      text: message,
    });

    // Generate agent reply
    const llmResult = await generateReply({
      message,
      conversationId: convoId,
      userId,
    });

    // Save assistant's message
    const assistantMessage = await Message.create({
      conversation: convoId,
      sender: "assistant",
      text: llmResult.text,
      meta: llmResult.meta,
    });

    return res.status(200).json({
      conversationId: convoId,
      reply: llmResult.text,
      messageId: assistantMessage._id,
      meta: llmResult.meta,
    });

  } catch (error) {
    console.error("Chat error:", error);
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 });

    return res.status(200).json({ conversation, messages });

  } catch (error) {
    next(error);
  }
};

export const listModels = async (req, res, next) => {
  try {
    const models = await import("../services/llm/llmAdapter.js")
      .then(m => m.listModels());

    return res.status(200).json({ models });

  } catch (error) {
    next(error);
  }
};
