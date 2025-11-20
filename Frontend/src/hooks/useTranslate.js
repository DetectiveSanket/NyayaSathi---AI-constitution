// src/hooks/useTranslate.js - Hook for text translation
import { useState, useCallback, useRef } from "react";
import { translateText } from "../services/ragService.js";

/**
 * Hook for translating text
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} - { translate, loading, error, cancel }
 */
export function useTranslate(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const translate = useCallback(
    async (text, language = "english") => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const result = await translateText(text, language);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err) {
        if (err.name === "AbortError") {
          return null;
        }
        const errorMessage = err.message || "Failed to translate text";
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

  return { translate, loading, error, cancel };
}

