// src/hooks/useRagSession.js - Hook for managing public RAG session tokens
import { useState, useEffect } from "react";
import api, { getRagToken, setRagToken } from "../services/api.js";

export const useRagSession = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const init = async () => {
    try {
      let token = getRagToken();

      if (!token) {
        // Request new public session token
        const res = await api.post("/rag/session");
        token = res.data.token;
        setRagToken(token);
      }

      setIsInitialized(true);
      setIsLoading(false);
      return token;
    } catch (error) {
      console.error("❌ Failed to initialize RAG session:", error);
      setIsLoading(false);
      // Return a fallback token to prevent blocking
      const fallbackToken = `rag_fallback_${Date.now()}`;
      setRagToken(fallbackToken);
      return fallbackToken;
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      init();
    }
  }, [isInitialized]);

  return { init, isInitialized, isLoading };
};

