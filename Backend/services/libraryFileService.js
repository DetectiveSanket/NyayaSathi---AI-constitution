import mongoose from "mongoose";
import LibraryFile from "../models/libraryFile.js";

/**
 * Classify library file type from MIME (and optional filename extension).
 */
export function inferFileTypeFromMime(mimeType, originalName = "") {
  const mime = (mimeType || "").toLowerCase();
  const ext = (originalName.split(".").pop() || "").toLowerCase();

  const docMimes = /pdf|msword|wordprocessingml|plain|^text\//;
  const docExts = ["pdf", "doc", "docx", "txt", "rtf"];
  if (mime.match(docMimes) || docExts.includes(ext)) return "document";

  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) {
    return "image";
  }
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext)) {
    return "audio";
  }
  if (mime.startsWith("video/") || ["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) {
    return "video";
  }
  return "other";
}

export function buildPublicS3Url(s3Key) {
  if (!s3Key) return "";
  const base = process.env.S3_PUBLIC_URL_BASE;
  if (base) {
    return `${String(base).replace(/\/$/, "")}/${s3Key}`;
  }
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION || "us-east-1";
  if (!bucket) return "";
  const encodedKey = s3Key.split("/").map(encodeURIComponent).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

/**
 * Upsert a library row for this user + s3Key; refresh metadata and merge conversation ids.
 * @param {import('mongoose').Document} doc - Document model instance or lean with user, filename, etc.
 */
export async function upsertLibraryFileFromDocument(doc, { fileSize, extraConversationId } = {}) {
  const userId = doc.user;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  const mimeType = doc.contentType || "application/octet-stream";
  const size = fileSize != null && !Number.isNaN(Number(fileSize)) ? Number(fileSize) : doc.size || 0;
  const fileType = inferFileTypeFromMime(mimeType, doc.filename || doc.originalname || "");
  const s3Url = buildPublicS3Url(doc.s3Key);

  const conv = extraConversationId || doc.conversationId;
  const convAdd = conv ? [String(conv)] : [];

  const filter = { userId, s3Key: doc.s3Key };

  const existing = await LibraryFile.findOne(filter);
  if (existing) {
    const updateOps = {
      $set: {
        isDeleted: false,
        originalName: doc.filename,
        mimeType,
        size,
        s3Url,
        fileType,
        documentId: doc._id,
      },
    };
    if (convAdd.length) {
      updateOps.$addToSet = { conversationIds: { $each: convAdd } };
    }
    return LibraryFile.findOneAndUpdate({ _id: existing._id }, updateOps, { new: true });
  }

  return LibraryFile.create({
    userId,
    documentId: doc._id,
    originalName: doc.filename,
    mimeType,
    size,
    s3Key: doc.s3Key,
    s3Url,
    fileType,
    conversationIds: convAdd,
    uploadedAt: new Date(),
    isDeleted: false,
  });
}
