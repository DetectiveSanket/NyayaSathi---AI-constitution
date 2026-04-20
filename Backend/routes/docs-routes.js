// src/routes/docsRoutes.js
import express from "express";
import { presignUpload, serverUpload, uploadMiddleware, getDocument, listDocuments } from "../controllers/docs-controller.js";
import { protect } from "../middleware/auth.js";
import { ragAuth } from "../middleware/ragAuth.js"; // Allow RAG sessions too
const router = express.Router();

// Presign (frontend will call this to get URL) - allow both regular auth and RAG sessions
router.get("/presign", ragAuth, presignUpload);

// List documents for authenticated user
router.get("/list", ragAuth, listDocuments);

// Server-side upload fallback (multipart/form-data)
router.post("/upload", protect, uploadMiddleware, serverUpload);

// Get metadata (must come after /list to avoid :id matching "list")
router.get("/:id", ragAuth, getDocument);

export default router;
