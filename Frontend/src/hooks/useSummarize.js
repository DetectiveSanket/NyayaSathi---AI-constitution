// src/hooks/useSummarize.js - Hook for document summarization
import { useState, useCallback, useRef } from "react";
import { summarizeDocument } from "../services/ragService.js";

/**
 * Hook for summarizing documents
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} - { summarize, loading, error, cancel }
 */
export function useSummarize(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const summarize = useCallback(
    async (documentId, length = "short", language = "english") => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const result = await summarizeDocument(documentId, length, language);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err) {
        if (err.name === "AbortError") {
          return null;
        }
        const errorMessage = err.message || "Failed to summarize document";
        setError(errorMessage);
        if (options.onError) {
          options.onError(err);
        }
        throw err;
      } finally {
        setLoading(false);
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
    }
  }, []);

  return { summarize, loading, error, cancel };
}

