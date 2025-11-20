// src/store/ragSlice.js - Redux slice for RAG state management
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  retrievedChunks: [],
  loading: false,
  selectedDocumentId: null,
  lastMode: null, // "auto" | "contextual" | null
  summary: null,
  documents: [], // List of uploaded documents
  currentLanguage: "english",
};

const ragSlice = createSlice({
  name: "rag",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setChunks: (state, action) => {
      state.retrievedChunks = action.payload;
    },
    setMode: (state, action) => {
      state.lastMode = action.payload;
    },
    setSelectedDocument: (state, action) => {
      state.selectedDocumentId = action.payload;
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDocuments: (state, action) => {
      state.documents = action.payload;
    },
    addDocument: (state, action) => {
      state.documents.push(action.payload);
    },
    setCurrentLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.retrievedChunks = [];
      state.lastMode = null;
      state.summary = null;
    },
    clearChunks: (state) => {
      state.retrievedChunks = [];
    },
  },
});

export const {
  addMessage,
  setChunks,
  setMode,
  setSelectedDocument,
  setSummary,
  setLoading,
  setDocuments,
  addDocument,
  setCurrentLanguage,
  clearMessages,
  clearChunks,
} = ragSlice.actions;

export default ragSlice.reducer;

