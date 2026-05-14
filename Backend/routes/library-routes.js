import express from "express";
import mongoose from "mongoose";
import LibraryFile from "../models/libraryFile.js";
import { ragAuth } from "../middleware/ragAuth.js";

const router = express.Router();

function requireRealUser(req, res) {
  if (!req.user?._id || req.user.isPublic) {
    res.status(401).json({ message: "Authentication required" });
    return false;
  }
  return true;
}

router.get("/stats", ragAuth, async (req, res, next) => {
  try {
    if (!requireRealUser(req, res)) return;

    const userId = req.user._id;
    const match = { userId, isDeleted: false };

    const [agg] = await LibraryFile.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalSize: { $sum: { $ifNull: ["$size", 0] } },
          document: { $sum: { $cond: [{ $eq: ["$fileType", "document"] }, 1, 0] } },
          image: { $sum: { $cond: [{ $eq: ["$fileType", "image"] }, 1, 0] } },
          audio: { $sum: { $cond: [{ $eq: ["$fileType", "audio"] }, 1, 0] } },
          video: { $sum: { $cond: [{ $eq: ["$fileType", "video"] }, 1, 0] } },
          other: { $sum: { $cond: [{ $eq: ["$fileType", "other"] }, 1, 0] } },
        },
      },
    ]);

    const base = agg || {};
    return res.json({
      total: base.total || 0,
      document: base.document || 0,
      image: base.image || 0,
      audio: base.audio || 0,
      video: base.video || 0,
      other: base.other || 0,
      totalSize: base.totalSize || 0,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/", ragAuth, async (req, res, next) => {
  try {
    if (!requireRealUser(req, res)) return;

    const userId = req.user._id;
    const { fileType } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { userId, isDeleted: false };
    if (fileType && ["document", "image", "audio", "video", "other"].includes(fileType)) {
      query.fileType = fileType;
    }

    const [total, files] = await Promise.all([
      LibraryFile.countDocuments(query),
      LibraryFile.find(query)
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "_id documentId originalName mimeType size s3Key s3Url fileType conversationIds uploadedAt"
        )
        .lean(),
    ]);

    return res.json({
      files,
      total,
      page,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:fileId", ragAuth, async (req, res, next) => {
  try {
    if (!requireRealUser(req, res)) return;

    const { fileId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: "Invalid file id" });
    }

    const updated = await LibraryFile.findOneAndUpdate(
      { _id: fileId, userId: req.user._id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.json({ ok: true, id: updated._id });
  } catch (err) {
    next(err);
  }
});

export default router;
