import mongoose from "mongoose";

const FILE_TYPES = ["document", "image", "audio", "video", "other"];

const libraryFileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: false,
    },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    s3Key: { type: String, required: true },
    s3Url: { type: String },
    fileType: {
      type: String,
      enum: FILE_TYPES,
      required: true,
    },
    /** Conversation thread ids (same string ids as Document.conversationId) */
    conversationIds: [{ type: String }],
    uploadedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: false }
);

libraryFileSchema.index({ userId: 1, s3Key: 1 });

const LibraryFile = mongoose.model("LibraryFile", libraryFileSchema);
export default LibraryFile;
