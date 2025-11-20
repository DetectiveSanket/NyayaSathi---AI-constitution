// src/services/ragService.js - RAG API service layer
import api from "./api.js";

/**
 * Query RAG endpoint - supports auto and contextual modes
 * @param {string} query - User question
 * @param {Object} options - { topK, documentId, language }
 * @returns {Promise<{answer, chunks, mode, language}>}
 */
export async function queryRag(query, options = {}) {
  try {
    const { topK = 4, documentId, language = "english" } = options;
    const response = await api.post("/rag/query", {
      query,
      topK,
      documentId,
      language,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to query RAG";
    throw new Error(message);
  }
}

/**
 * Summarize a document
 * @param {string} documentId - Document ID
 * @param {string} length - "short" | "medium" | "detailed"
 * @param {string} language - "english" | "hindi" | "marathi"
 * @returns {Promise<{summary, summaryType, chunksUsed, language}>}
 */
export async function summarizeDocument(documentId, length = "short", language = "english") {
  try {
    const response = await api.post("/rag/summarize", {
      documentId,
      length,
      language,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to summarize document";
    throw new Error(message);
  }
}

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} language - Target language
 * @returns {Promise<{translation, language, label}>}
 */
export async function translateText(text, language = "english") {
  try {
    const response = await api.post("/rag/translate", {
      text,
      language,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to translate text";
    throw new Error(message);
  }
}

/**
 * Process a document (extract, chunk, embed, store in Pinecone)
 * @param {string} documentId - Document ID
 * @returns {Promise<{documentId, chunksCount, message}>}
 */
export async function processDocument(documentId) {
  try {
    const response = await api.post(`/rag/process/${documentId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to process document";
    throw new Error(message);
  }
}

/**
 * Get presigned URL for document upload
 * @param {string} filename - File name
 * @param {string} contentType - MIME type
 * @returns {Promise<{presignedUrl, s3Key, documentId}>}
 */
export async function getPresignedUrl(filename, contentType) {
  try {
    const response = await api.get("/docs/presign", {
      params: { filename, contentType },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to get presigned URL";
    throw new Error(message);
  }
}

/**
 * Upload file to S3 using presigned URL
 * @param {string} presignedUrl - Presigned PUT URL
 * @param {File} file - File to upload
 * @returns {Promise<void>}
 */
export async function uploadToS3(presignedUrl, file) {
  try {
    await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
}

/**
 * Get document metadata
 * @param {string} documentId - Document ID
 * @returns {Promise<Document>}
 */
export async function getDocument(documentId) {
  try {
    const response = await api.get(`/docs/${documentId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to get document";
    throw new Error(message);
  }
}

/**
 * List all documents (if endpoint exists)
 * @returns {Promise<Array<Document>>}
 */
export async function listDocuments() {
  try {
    const response = await api.get("/docs");
    return response.data;
  } catch (error) {
    // If endpoint doesn't exist, return empty array
    if (error.response?.status === 404) {
      return [];
    }
    const message = error.response?.data?.message || error.message || "Failed to list documents";
    throw new Error(message);
  }
}

