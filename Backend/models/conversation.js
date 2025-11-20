// Backend/models/conversation.js - Conversation model for persistent chat history
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Index for fast queries
    },
    title: {
      type: String,
      default: "New Conversation",
      maxlength: 200,
    },
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstMessage: {
      type: String,
      maxlength: 500,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient queries
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ conversationId: 1 });

// Check if model already exists to avoid overwrite error
const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

export default Conversation;
