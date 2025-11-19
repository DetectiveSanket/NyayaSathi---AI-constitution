// src/controllers/docsController.js
import { randomUUID } from "crypto";
import { getPresignedPutUrl } from "../services/s3Presign.js";
import Document from "../models/document.js";
import s3Client from "../services/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();


const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// 1) Presign endpoint - recommended (frontend uploads directly)
export async function presignUpload(req, res, next) {
  try {
    const { filename, contentType } = req.query;
    if (!filename || !contentType) return res.status(400).json({ message: "filename & contentType required" });

    const ext = filename.split(".").pop();
    const key = `documents/${Date.now()}-${randomUUID()}.${ext}`;

    const url = await getPresignedPutUrl({ Key: key, ContentType: contentType });

    // store metadata record now with not-yet-processed state (optional)
    const doc = await Document.create({
      filename,
      s3Key: key,
      contentType,
      processed: false,
    });

    return res.json({ presignedUrl: url, s3Key: key, documentId: doc._id });
  } catch (err) {
    next(err);
  }
}

// 2) Server-side fallback - multipart/form-data
export const uploadMiddleware = upload.single("file");

export async function serverUpload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const file = req.file;
    const ext = (file.originalname || "file").split(".").pop();
    const key = `documents/${Date.now()}-${randomUUID()}.${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
      ServerSideEncryption: "AES256",
    });

    await s3Client.send(cmd);

    const doc = await Document.create({
      filename: file.originalname,
      s3Key: key,
      contentType: file.mimetype,
      size: file.size,
      processed: false,
    });

    return res.status(201).json({ message: "Uploaded", documentId: doc._id, s3Key: key });
  } catch (err) {
    next(err);
  }
}

// 3) Get document metadata
export async function getDocument(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}
