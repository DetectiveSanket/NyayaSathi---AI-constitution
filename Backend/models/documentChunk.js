import mongoose from "mongoose";

const DocumentChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
  chunkId: { type: String, required: true },
  text: { type: String, required: true },
  page: { type: Number, default: 1 },
  order: { type: Number, required: true }, // maintains order
  createdAt: { type: Date, default: Date.now }
});

const DocumentChunk = mongoose.model("DocumentChunk", DocumentChunkSchema);

export default DocumentChunk;
