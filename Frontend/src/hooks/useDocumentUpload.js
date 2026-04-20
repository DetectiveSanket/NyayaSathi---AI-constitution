import { useState, useCallback, useRef } from "react";
import { getPresignedUrl, uploadToS3, processDocument } from "../services/ragService.js";
import { useSelector } from "react-redux";

/**
 * Hook for uploading and processing documents
 * @param {Object} options - { onSuccess, onError, onProgress }
 * @returns {Object} - { uploadAndProcess, loading, error, progress, cancel }
 */
export function useDocumentUpload(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef(null);
  const currentConversationId = useSelector((state) => state.rag.currentConversationId);

  const uploadAndProcess = useCallback(
    async (file) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        // Step 1: Get presigned URL
        setProgress(10);
        let documentId;
        let presignedUrl;
        
        try {
          const presignResult = await getPresignedUrl(file.name, file.type, currentConversationId);
          presignedUrl = presignResult.presignedUrl;
          documentId = presignResult.documentId;
        } catch (presignError) {
          throw new Error(`Failed to get upload URL: ${presignError.message}`);
        }

        // Step 2: Upload to S3
        setProgress(30);
        try {
          await uploadToS3(presignedUrl, file);
          setProgress(60);
        } catch (uploadError) {
          // If direct S3 upload fails, it's likely a CORS issue
          // Provide helpful error message
          if (uploadError.message.includes("Network error") || uploadError.message.includes("CORS")) {
            throw new Error(
              `S3 upload failed due to CORS configuration. ` +
              `Please ensure your S3 bucket has CORS configured to allow PUT requests from your frontend domain. ` +
              `Error: ${uploadError.message}`
            );
          }
          throw uploadError;
        }

        // Step 3: Process document (extract, chunk, embed)
        setProgress(70);
        const processResult = await processDocument(documentId);
        setProgress(100);

        if (options.onSuccess) {
          options.onSuccess({ documentId, ...processResult });
        }

        return { documentId, ...processResult };
      } catch (err) {
        if (err.name === "AbortError") {
          return null;
        }
        const errorMessage = err.message || "Failed to upload and process document";
        setError(errorMessage);
        if (options.onError) {
          options.onError(err);
        }
        throw err;
      } finally {
        setLoading(false);
        setTimeout(() => setProgress(0), 1000);
        abortControllerRef.current = null;
      }
    },
    [options, currentConversationId]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setError(null);
      setProgress(0);
    }
  }, []);

  return { uploadAndProcess, loading, error, progress, cancel };
}

