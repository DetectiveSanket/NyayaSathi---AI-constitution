import mongoose from "mongoose";

const legalDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["uploaded", "processed"],
      default: "uploaded",
    },
    tokens: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

export default mongoose.model("LegalDocument", legalDocumentSchema);
