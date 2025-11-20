import express from "express";
import { processDocument, queryRag, translateResponse } from "../controllers/rag-controller.js";
import { summarizeDocument } from "../controllers/summarize-controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// SINGLE ENDPOINT → complete RAG pipeline
router.post("/process/:documentId", protect, processDocument);
router.post("/query", protect, queryRag);

router.post("/summarize", summarizeDocument);
router.post("/translate", translateResponse);


export default router;
