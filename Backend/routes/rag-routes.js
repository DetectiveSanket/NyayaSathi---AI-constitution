import express from "express";
import { processDocument, queryRag, translateResponse, clearMemory, createRagSession } from "../controllers/rag-controller.js";
import { summarizeDocument } from "../controllers/summarize-controller.js";
import {
  createConversationHandler,
  getConversationHandler,
  listConversationsHandler,
  updateConversationHandler,
  deleteConversationHandler,
  getConversationMessagesHandler,
} from "../controllers/conversation-controller.js";
import { ragAuth } from "../middleware/ragAuth.js";

const router = express.Router();

// Public session endpoint - no auth required
router.post("/session", createRagSession);

// RAG endpoints - accept both regular auth and public RAG tokens
router.post("/process/:documentId", ragAuth, processDocument);
router.post("/query", ragAuth, queryRag);
router.post("/summarize", ragAuth, summarizeDocument);
router.post("/translate", ragAuth, translateResponse);
router.delete("/memory", ragAuth, clearMemory); // Clear conversation memory

// Conversation management endpoints
router.post("/conversations", ragAuth, createConversationHandler);
router.get("/conversations", ragAuth, listConversationsHandler);
router.get("/conversations/:conversationId", ragAuth, getConversationHandler);
router.put("/conversations/:conversationId", ragAuth, updateConversationHandler);
router.delete("/conversations/:conversationId", ragAuth, deleteConversationHandler);
router.get("/conversations/:conversationId/messages", ragAuth, getConversationMessagesHandler);

export default router;
