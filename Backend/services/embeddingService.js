// services/embeddingService.js
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";

import dotenv from "dotenv";
dotenv.config();

// 1. Initialize Google Embedding Model
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "text-embedding-004",
});

// 2. Initialize Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index(process.env.PINECONE_INDEX);

/**
 * Takes text chunks → converts to embeddings → upserts to Pinecone
 * @param {Array} chunks - [{ chunkId, documentId, text, page }]
 */
export async function embedDocumentChunks(chunks = []) {
  try {
    console.log("📌 Embedding started. Chunk count:", chunks.length);

    const vectors = await Promise.all(
      chunks.map(async (chunk) => {
        const vector = await embeddings.embedQuery(chunk.text);

        return {
          id: chunk.chunkId,
          values: vector,
          metadata: {
            documentId: chunk.documentId,
            text: chunk.text,
            page: chunk.page,
          },
        };
      })
    );

    console.log("📌 Upserting into Pinecone...");
    await index.upsert(vectors);

    console.log("✅ Embedding + Upsert Completed!");
    return { success: true, chunkCount: chunks.length };

  } catch (err) {
    console.error("❌ Embedding Error:", err);
    return { success: false, error: err.message };
  }
}
