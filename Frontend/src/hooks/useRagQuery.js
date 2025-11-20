// src/hooks/useRagQuery.js - Hook for RAG query operations
import { useState, useCallback, useRef } from "react";
import { queryRag } from "../services/ragService.js";

/**
 * Hook for querying RAG endpoint
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} - { sendQuery, loading, error, cancel }
 */
export function useRagQuery(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const sendQuery = useCallback(
    async (query, queryOptions = {}) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const result = await queryRag(query, queryOptions);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err) {
        if (err.name === "AbortError") {
          return null; // Request was cancelled
        }
        const errorMessage = err.message || "Failed to query RAG";
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

  return { sendQuery, loading, error, cancel };
}

