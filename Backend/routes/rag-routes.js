import express from "express";
import { processDocument } from "../controllers/rag-controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// SINGLE ENDPOINT → complete RAG pipeline
router.post("/process/:documentId", protect, processDocument);

export default router;
