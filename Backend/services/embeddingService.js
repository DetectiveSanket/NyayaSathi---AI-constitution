// services/embeddingService.js
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: process.env.EMBEDDING_MODEL || "gemini-embedding-001",
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX;
if (!indexName) {
  throw new Error("PINECONE_INDEX env var is required.");
}

const index = pc.index(indexName);

export const pineconeIndex = index;

/**
 * Takes text chunks → converts to embeddings → upserts to Pinecone
 * @param {Array} chunks - [{ chunkId, documentId, text, page }]
 */
export async function embedDocumentChunks(chunks = []) {
  try {
    // console.log("📌 Embedding started. Chunk count:", chunks.length);

    const vectors = await Promise.all(
      chunks.map(async (chunk) => {
        const vector = await embeddings.embedQuery(chunk.text);

        return {
          id: chunk.chunkId,
          values: vector.slice(0, 768), // Slice to match Pinecone's 768 dimension
          metadata: {
            documentId: chunk.documentId,
            text: chunk.text,
            page: chunk.page,
            order: typeof chunk.order === "number" ? chunk.order : 0,
          },
        };
      })
    );

    // console.log("📌 Upserting into Pinecone...");
    await index.upsert(vectors);

    // console.log("✅ Embedding + Upsert Completed!");
    return { success: true, chunkCount: chunks.length };

  } catch (err) {
    console.error("❌ Embedding Error:", err);
    return { success: false, error: err.message };
  }
}

export async function embedQueryText(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Text is required for embedding.");
  }
  const vector = await embeddings.embedQuery(text);
  return vector.slice(0, 768); // Slice to match Pinecone dimension
}

export async function querySimilarChunks({ vector, topK = 5, filter } = {}) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Vector embedding is required for Pinecone query.");
  }

  const response = await index.query({
    vector,
    topK,
    includeMetadata: true,
    filter,
  });

  return response.matches || [];
}

export async function fetchDocumentChunksFromPinecone({ documentId, maxChunks = 200 }) {
  if (!documentId) {
    throw new Error("documentId is required to fetch Pinecone chunks.");
  }

  const queryVectorRaw = await embeddings.embedQuery(
    `Summarize the legal document with id ${documentId}`
  );
  const queryVector = queryVectorRaw.slice(0, 768);

  const response = await index.query({
    vector: queryVector,
    topK: maxChunks,
    includeMetadata: true,
    filter: { documentId: documentId.toString() },
  });

  return response.matches || [];
}

export async function deleteDocumentChunksFromPinecone(documentId) {
  if (!documentId) return false;
  try {
    // console.log(`📌 Deleting Pinecone vectors for document: ${documentId}`);
    const matches = await fetchDocumentChunksFromPinecone({ documentId, maxChunks: 10000 });
    const idsToDelete = matches.map(m => m.id).filter(id => !!id);
    
    if (idsToDelete.length > 0) {
      await index.deleteMany(idsToDelete);
      // console.log(`✅ Deleted ${idsToDelete.length} vectors from Pinecone for document: ${documentId}`);
    }
    return true;
  } catch (err) {
    console.error(`❌ Failed to delete Pinecone vectors for document ${documentId}:`, err);
    return false;
  }
}
