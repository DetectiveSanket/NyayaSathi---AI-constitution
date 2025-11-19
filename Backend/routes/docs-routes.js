// src/routes/docsRoutes.js
import express from "express";
import { presignUpload, serverUpload, uploadMiddleware, getDocument } from "../controllers/docs-controller.js";
import { protect } from "../middleware/auth.js"; // optional, if you want only auth users
const router = express.Router();

// Presign (frontend will call this to get URL)
router.get("/presign", protect, presignUpload);

// Server-side upload fallback (multipart/form-data)
router.post("/upload", protect, uploadMiddleware, serverUpload);

// Get metadata
router.get("/:id", protect, getDocument);

export default router;
