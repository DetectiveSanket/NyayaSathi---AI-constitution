// src/store/ragSlice.js - Redux slice for RAG state management
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [], // Current active conversation messages
  messagesByConversation: {}, // Messages stored per conversationId: { [conversationId]: Message[] }
  retrievedChunks: [],
  loading: false,
  selectedDocumentId: null,
  lastMode: null, // "auto" | "contextual" | null
  summary: null,
  documents: [], // List of uploaded documents
  currentLanguage: "english",
  autoSummarize: false, // Auto-summarize toggle
  // Conversation management
  currentConversationId: null,
  conversations: [], // List of recent conversations
  conversationsLoading: false,
  userName: null, // User name (if logged in)
};

const ragSlice = createSlice({
  name: "rag",
  initialState,
  reducers: {
    // Initialize messagesByConversation if it doesn't exist (for migration from old state)
    initializeMessagesByConversation: (state) => {
      if (!state.messagesByConversation) {
        state.messagesByConversation = {};
      }
    },
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
    setMessages: (state, action) => {
      // Replace all messages (used when loading a conversation)
      state.messages = action.payload || [];
    },
    setMessagesForConversation: (state, action) => {
      // Store messages for a specific conversation
      const { conversationId, messages } = action.payload;
      if (conversationId) {
        // Ensure messagesByConversation exists
        if (!state.messagesByConversation) {
          state.messagesByConversation = {};
        }
        state.messagesByConversation[conversationId] = messages || [];
      }
    },
    loadMessagesForConversation: (state, action) => {
      // Load messages for a conversation into active messages
      const conversationId = action.payload;
      // Ensure messagesByConversation exists
      if (!state.messagesByConversation) {
        state.messagesByConversation = {};
      }
      if (conversationId && state.messagesByConversation[conversationId]) {
        state.messages = [...state.messagesByConversation[conversationId]];
      } else {
        state.messages = [];
      }
    },
    clearChunks: (state) => {
      state.retrievedChunks = [];
    },
    setCurrentConversationId: (state, action) => {
      state.currentConversationId = action.payload;
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    updateConversationInList: (state, action) => {
      const { conversationId, updates } = action.payload;
      const index = state.conversations.findIndex((c) => c.conversationId === conversationId);
      if (index !== -1) {
        state.conversations[index] = { ...state.conversations[index], ...updates };
      }
    },
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        (c) => c.conversationId !== action.payload
      );
    },
    setConversationsLoading: (state, action) => {
      state.conversationsLoading = action.payload;
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setAutoSummarize: (state, action) => {
      state.autoSummarize = action.payload;
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
  setMessages,
  initializeMessagesByConversation,
  setMessagesForConversation,
  loadMessagesForConversation,
  clearChunks,
  setCurrentConversationId,
  setConversations,
  addConversation,
  updateConversationInList,
  removeConversation,
  setConversationsLoading,
  setUserName,
  setAutoSummarize,
} = ragSlice.actions;

export default ragSlice.reducer;

