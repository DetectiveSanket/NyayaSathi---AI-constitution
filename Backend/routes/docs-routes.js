// src/routes/docsRoutes.js
import express from "express";
import { presignUpload, serverUpload, uploadMiddleware, getDocument } from "../controllers/docs-controller.js";
import { protect } from "../middleware/auth.js";
import { ragAuth } from "../middleware/ragAuth.js"; // Allow RAG sessions too
const router = express.Router();

// Presign (frontend will call this to get URL) - allow both regular auth and RAG sessions
router.get("/presign", ragAuth, presignUpload);

// Server-side upload fallback (multipart/form-data)
router.post("/upload", protect, uploadMiddleware, serverUpload);

// Get metadata
router.get("/:id", ragAuth, getDocument);

export default router;
