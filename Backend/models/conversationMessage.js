// Backend/models/conversationMessage.js - Individual message storage
import mongoose from "mongoose";

const conversationMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      mode: {
        type: String,
        enum: ["auto", "contextual"],
      },
      chunks: {
        type: Array,
        default: [],
      },
      language: {
        type: String,
        default: "english",
      },
      memoryUsed: {
        type: Boolean,
        default: false,
      },
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
conversationMessageSchema.index({ conversationId: 1, order: 1 });
conversationMessageSchema.index({ userId: 1, createdAt: -1 });

// Check if model already exists to avoid overwrite error
const ConversationMessage = mongoose.models.ConversationMessage || mongoose.model("ConversationMessage", conversationMessageSchema);

export default ConversationMessage;

