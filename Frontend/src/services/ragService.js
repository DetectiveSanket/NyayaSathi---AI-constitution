// src/services/ragService.js - RAG API service layer
import api, { getRagToken, createRagRequest } from "./api.js";

/**
 * Query RAG endpoint - supports auto and contextual modes
 * @param {string} query - User question
 * @param {Object} options - { topK, documentId, language, conversationId }
 * @returns {Promise<{answer, chunks, mode, language}>}
 */
export async function queryRag(query, options = {}) {
  try {
    const { topK = 4, documentId, language = "english", conversationId } = options;
    const ragToken = getRagToken();
    
    const response = await api.post(
      "/rag/query",
      {
        query,
        topK,
        documentId,
        language,
        conversationId,
      },
      {
        headers: {
          Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
        },
      }
    );
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
    const ragToken = getRagToken();
    const response = await api.post(
      "/rag/summarize",
      {
        documentId,
        length,
        language,
      },
      {
        headers: {
          Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
        },
      }
    );
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
    const ragToken = getRagToken();
    const response = await api.post(
      "/rag/translate",
      {
        text,
        language,
      },
      {
        headers: {
          Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
        },
      }
    );
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
    const ragToken = getRagToken();
    const response = await api.post(
      `/rag/process/${documentId}`,
      {},
      {
        headers: {
          Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
        },
      }
    );
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
    const ragToken = getRagToken();
    const response = await api.get("/docs/presign", {
      params: { filename, contentType },
      headers: {
        Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
      },
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
    // Validate presigned URL
    if (!presignedUrl || typeof presignedUrl !== "string") {
      throw new Error("Invalid presigned URL");
    }

    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file object");
    }

    // Upload to S3 using presigned URL
    // Note: This requires CORS to be configured on the S3 bucket
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      // Don't include credentials for S3 uploads (presigned URLs handle auth)
      credentials: "omit",
      mode: "cors", // Explicitly request CORS mode
      // Don't add any custom headers that might break the presigned URL
    });

    // Check if upload was successful
    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
      } catch {
        errorText = response.statusText;
      }
      
      // Provide helpful error messages
      if (response.status === 403) {
        throw new Error("Upload forbidden: Presigned URL may have expired or CORS is not configured on S3 bucket");
      } else if (response.status === 404) {
        throw new Error("S3 bucket or key not found");
      } else {
        throw new Error(`S3 upload failed (${response.status}): ${errorText || "Unknown error"}`);
      }
    }

    // Success - no body expected for PUT requests to S3
  } catch (error) {
    // Provide more detailed error message
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(`Network error: Unable to connect to S3. This may be due to CORS configuration on your S3 bucket. Please ensure your S3 bucket allows PUT requests from your frontend domain.`);
    }
    
    // Re-throw with original message if it's already our custom error
    if (error.message.includes("S3 upload failed") || error.message.includes("Network error")) {
      throw error;
    }
    
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

/**
 * Create a new conversation
 * @returns {Promise<{conversationId, title, messageCount}>}
 */
export async function createNewConversation(title = null) {
  try {
    const ragToken = getRagToken();
    const response = await api.post(
      "/rag/conversations",
      { title },
      {
        headers: {
          Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
        },
      }
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to create conversation";
    throw new Error(message);
  }
}

/**
 * List user's conversations
 * @returns {Promise<Array<Conversation>>}
 */
export async function listConversations() {
  try {
    const ragToken = getRagToken();
    const response = await api.get("/rag/conversations", {
      headers: {
        Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
      },
    });
    return response.data.conversations || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to list conversations";
    throw new Error(message);
  }
}

/**
 * Get conversation by ID
 * @param {string} conversationId
 * @returns {Promise<Conversation>}
 */
export async function getConversation(conversationId) {
  try {
    const ragToken = getRagToken();
    const response = await api.get(`/rag/conversations/${conversationId}`, {
      headers: {
        Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to get conversation";
    throw new Error(message);
  }
}

/**
 * Get conversation messages
 * @param {string} conversationId
 * @returns {Promise<Array<Message>>}
 */
export async function getConversationMessages(conversationId) {
  try {
    const ragToken = getRagToken();
    const response = await api.get(`/rag/conversations/${conversationId}/messages`, {
      headers: {
        Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
      },
    });
    return response.data.messages || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to get messages";
    throw new Error(message);
  }
}

/**
 * Update conversation (e.g., title)
 * @param {string} conversationId
 * @param {string} title
 * @returns {Promise<Conversation>}
 */
export async function updateConversation(conversationId, title) {
  try {
    const ragToken = getRagToken();
    const response = await api.put(
      `/rag/conversations/${conversationId}`,
      { title },
      {
        headers: {
          Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
        },
      }
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to update conversation";
    throw new Error(message);
  }
}

/**
 * Delete conversation
 * @param {string} conversationId
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId) {
  try {
    const ragToken = getRagToken();
    await api.delete(`/rag/conversations/${conversationId}`, {
      headers: {
        Authorization: ragToken ? `Bearer ${ragToken}` : undefined,
      },
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to delete conversation";
    throw new Error(message);
  }
}

