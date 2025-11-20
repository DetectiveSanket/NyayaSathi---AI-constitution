// src/hooks/useDocumentUpload.js - Hook for document upload and processing
import { useState, useCallback, useRef } from "react";
import { getPresignedUrl, uploadToS3, processDocument } from "../services/ragService.js";

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
        const { presignedUrl, s3Key, documentId } = await getPresignedUrl(
          file.name,
          file.type
        );

        // Step 2: Upload to S3
        setProgress(30);
        await uploadToS3(presignedUrl, file);
        setProgress(60);

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
    [options]
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

