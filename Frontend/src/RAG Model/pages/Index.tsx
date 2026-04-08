
import { useState, useRef, useEffect,Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useResponsive } from "../hooks/useResponsive";

//* Components 
// import ChatHeader from "../components/ChatHeader";
// import ChatSidebar from "../components/ChatSidebar";
// import MessageBubble from "../components/MessageBubble";
// import ChatComposer from "../components/ChatComposer";
// import MobileChatLayout from "../components/MobileChatLayout";

// Lazy load components for better performance
const ChatHeader = lazy(() => import("../components/ChatHeader"));
const ChatSidebar = lazy(() => import("../components/ChatSidebar"));
const MessageBubble = lazy(() => import("../components/MessageBubble"));
const ChatComposer = lazy(() => import("../components/ChatComposer"));
const MobileChatLayout = lazy(() => import("../components/MobileChatLayout"));
const WelcomeSuggestions = lazy(() => import("../components/WelcomeSuggestions"));

import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";


import { useToast } from "../hooks/use-toast";
import { Search, X, Eye, EyeOff } from "lucide-react";
import jsPDF from "jspdf";
import { useRagQuery } from "../../hooks/useRagQuery.js";
import { useRagSession } from "../../hooks/useRagSession.js";
import {
  addMessage,
  setChunks,
  setMode,
  setSummary,
  setSelectedDocument,
  clearMessages,
  setMessages,
  initializeMessagesByConversation,
  setMessagesForConversation,
  loadMessagesForConversation,
  setCurrentConversationId,
  setConversations,
  setConversationsLoading,
  setUserName,
} from "../../store/ragSlice.js";
import { setSelectedDocument as setSelectedDocumentAction } from "../../store/ragSlice.js";
import {
  listConversations,
  getConversationMessages,
  createNewConversation,
} from "../../services/ragService.js";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations?: Array<{
    id: string;
    title: string;
    section: string;
    url?: string;
  }>;
  isStreaming?: boolean;
  mode?: "auto" | "contextual";
  chunks?: Array<{
    chunkId: string;
    text: string;
    page: number;
    score?: number;
    documentId?: string;
  }>;
}

const Index = () => {
  const { isMobile } = useResponsive();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const ragState = useSelector((state: any) => state.rag);
  const authState = useSelector((state: any) => state.auth);
  const { init: initRagSession, isLoading: isSessionLoading } = useRagSession();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchFromSidebar, setSearchFromSidebar] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(
    ragState.currentConversationId || null
  );
  const [isRestoringConversation, setIsRestoringConversation] = useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

  // Use Redux messages only - no local fallback
  // If we're creating a new chat, force empty messages
  // Also ensure messages match the current conversationId
  const currentConvId = conversationId || ragState.currentConversationId;
  let messages = (isCreatingNewChat ? [] : (ragState.messages || []));
  
  // Safety check: If we have messages but no conversationId, clear them
  // This prevents showing messages from a previous session
  if (messages.length > 0 && !currentConvId && !isRestoringConversation) {
    console.log("🧹 Clearing orphaned messages (no conversationId)");
    messages = [];
    // Dispatch to actually clear them
    dispatch(setMessages([]));
  }
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const inputMessageRef = useRef<{ setMessage?: (msg: string) => void }>({});

  // Load conversations from backend
  const loadConversations = async () => {
    try {
      dispatch(setConversationsLoading(true));
      const conversations = await listConversations();
      dispatch(setConversations(conversations));
    } catch (error) {
      console.error("Failed to load conversations:", error);
      // Continue without conversations
    } finally {
      dispatch(setConversationsLoading(false));
    }
  };

  // Restore conversation from backend
  const restoreConversation = async (convId: string) => {
    try {
      setIsRestoringConversation(true);
      
      // Ensure messagesByConversation is initialized
      dispatch(initializeMessagesByConversation());
      
      // First, save current conversation messages if we have an active conversation
      if (conversationId && ragState.messages && ragState.messages.length > 0) {
        dispatch(setMessagesForConversation({
          conversationId: conversationId,
          messages: ragState.messages
        }));
      }
      
      const backendMessages = await getConversationMessages(convId);
      
      // Convert backend messages to frontend format
      const restoredMessages: Message[] = backendMessages.map((msg: any) => ({
        id: msg.id || msg._id || Date.now().toString(),
        type: msg.role === "assistant" ? "assistant" : msg.role === "user" ? "user" : "system",
        content: msg.content,
        timestamp: msg.timestamp
          ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: msg.metadata?.mode,
        chunks: msg.metadata?.chunks || [],
      }));

      // REPLACE all messages (not append) - completely clear and set new ones
      dispatch(setMessages(restoredMessages));
      
      // Store messages for this conversation
      dispatch(setMessagesForConversation({
        conversationId: convId,
        messages: restoredMessages
      }));

      // Set conversation ID
      setConversationId(convId);
      dispatch(setCurrentConversationId(convId));
      localStorage.setItem("rag_current_conversation_id", convId);
      
      // Clear input message
      if (inputMessageRef.current.setMessage) {
        inputMessageRef.current.setMessage("");
      }

      toast({
        description: "Conversation restored",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to restore conversation:", error);
      toast({
        title: "Failed to restore conversation",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsRestoringConversation(false);
    }
  };

  // Initialize RAG session on mount (once)
  useEffect(() => {
    const initialize = async () => {
      // Ensure messagesByConversation is initialized (migration guard)
      dispatch(initializeMessagesByConversation());
      await initRagSession();
    };
    initialize().catch((error) => {
      console.error("Failed to initialize RAG session:", error);
    });
  }, []); // Only run on mount

  // Reload conversations whenever the authenticated user changes.
  // This covers: first login, logout+login as same or different user,
  // opening in a new browser tab where the JWT is already in redux-persist.
  useEffect(() => {
    if (!authState?.isAuthenticated || !authState?.user) {
      // Not logged in — clear conversation state so we don’t show stale data
      dispatch(setConversations([]));
      dispatch(setMessages([]));
      dispatch(setCurrentConversationId(null));
      setConversationId(null);
      return;
    }

    // Set user name from auth state
    if (authState?.user?.name) {
      dispatch(setUserName(authState.user.name));
    } else if (authState?.user?.email) {
      dispatch(setUserName(authState.user.email.split("@")[0]));
    }

    // Load this user’s conversations from the backend.
    // We purposely do NOT auto-restore the last conversation from localStorage
    // because localStorage is per-browser and breaks the cross-browser / incognito
    // requirement.  The user can click any conversation in the sidebar to resume it.
    loadConversations();
  }, [authState?.isAuthenticated, authState?.user?._id]); // Runs on login / user switch


  // Update user name when auth state changes
  useEffect(() => {
    if (authState?.user?.name) {
      dispatch(setUserName(authState.user.name));
    } else if (authState?.user?.email) {
      dispatch(setUserName(authState.user.email.split("@")[0]));
    } else if (!authState?.isAuthenticated) {
      dispatch(setUserName("Guest"));
    }
  }, [authState?.user, authState?.isAuthenticated, dispatch]);

  const { sendQuery, loading: queryLoading } = useRagQuery({
    onSuccess: (result) => {
      // Update conversationId if returned
      if (result.conversationId) {
        setConversationId(result.conversationId);
        dispatch(setCurrentConversationId(result.conversationId));
        localStorage.setItem("rag_current_conversation_id", result.conversationId);
        
        // If new conversation, refresh conversation list
        if (result.isNewConversation) {
          loadConversations();
        }
      }
      
      // Add assistant message with answer
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: result.mode,
        chunks: result.chunks || [],
      };
      dispatch(addMessage(assistantMessage));
      dispatch(setChunks(result.chunks || []));
      dispatch(setMode(result.mode || null));
      
      // Update stored messages for this conversation (includes both user and assistant messages)
      if (result.conversationId) {
        // Ensure messagesByConversation is initialized
        dispatch(initializeMessagesByConversation());
        
        // Get current messages from Redux state (which now includes the assistant message)
        const currentMessages = [...(ragState.messages || [])];
        dispatch(setMessagesForConversation({
          conversationId: result.conversationId,
          messages: currentMessages
        }));
      }
      
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Query failed",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  // Watch for conversationId changes and ensure messages are cleared when switching to new conversation
  useEffect(() => {
    // If conversationId changes to a new value (not just null), ensure we're not showing old messages
    // This prevents message leakage when switching conversations
    const currentConvId = conversationId || ragState.currentConversationId;
    
    // If we have a conversationId but messages don't match what's stored for that conversation
    if (currentConvId && ragState.messagesByConversation) {
      const storedMessages = ragState.messagesByConversation[currentConvId];
      // If stored messages exist but current messages don't match, it means we switched conversations
      // Don't auto-load here - let restoreConversation handle it explicitly
    } else if (!currentConvId) {
      // No conversation ID means new chat - ensure messages are empty
      if (ragState.messages && ragState.messages.length > 0) {
        console.log("🧹 No conversation ID, clearing messages");
        dispatch(setMessages([]));
        dispatch(clearMessages());
      }
    }
  }, [conversationId, ragState.currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for new chat event from sidebar
  useEffect(() => {
    const handleNewChatEvent = () => {
      handleNewChat();
    };
    window.addEventListener("newChat", handleNewChatEvent);
    return () => window.removeEventListener("newChat", handleNewChatEvent);
  }, []);

  const handleSendMessage = async (content: string, language?: string, documentId?: string) => {
    // Ensure session is initialized
    if (isSessionLoading) {
      await initRagSession();
    }

    // Remove welcome message if it exists (first user message starts conversation)
    const currentMessages = [...(ragState.messages || [])];
    const welcomeMessageIndex = currentMessages.findIndex(msg => msg.type === "system" && msg.id?.startsWith("welcome-"));
    if (welcomeMessageIndex !== -1) {
      // Remove welcome message
      currentMessages.splice(welcomeMessageIndex, 1);
      dispatch(setMessages(currentMessages));
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    dispatch(addMessage(newMessage));
    
    setIsLoading(true);

    try {
      await sendQuery(content, {
        language: language || ragState.currentLanguage || "english",
        documentId: documentId || ragState.selectedDocumentId || undefined,
        conversationId: conversationId || undefined,
        topK: 4,
      });
    } catch (error) {
      // Error handled in hook's onError
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      // Set flag to prevent any message restoration during new chat creation
      setIsCreatingNewChat(true);
      
      // Ensure messagesByConversation is initialized
      dispatch(initializeMessagesByConversation());
      
      // Save current conversation messages before switching
      if (conversationId && ragState.messages && ragState.messages.length > 0) {
        dispatch(setMessagesForConversation({
          conversationId: conversationId,
          messages: ragState.messages
        }));
      }
      
      // STEP 1: Clear conversation ID to prevent any restoration
      setConversationId(null);
      dispatch(setCurrentConversationId(null));
      localStorage.removeItem("rag_current_conversation_id");
      
      // STEP 2: Clear input message
      if (inputMessageRef.current.setMessage) {
        inputMessageRef.current.setMessage("");
      }
      
      // STEP 3: Create new conversation (async operation)
      const newConversation = await createNewConversation();
      if (newConversation.conversationId) {
        setConversationId(newConversation.conversationId);
        dispatch(setCurrentConversationId(newConversation.conversationId));
        localStorage.setItem("rag_current_conversation_id", newConversation.conversationId);
      }

      // STEP 4: Clear chunks, mode, summary (but keep messages array for welcome message)
      dispatch(setChunks([]));
      dispatch(setMode(null));
      dispatch(setSummary(null));
      
      // STEP 5: Ensure messages are empty so WelcomeSuggestions shows
      dispatch(setMessages([]));

      // STEP 6: Refresh conversation list
      await loadConversations();

      // STEP 7: Clear the flag after everything is done
      setIsCreatingNewChat(false);

      toast({
        description: "New chat started",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to create new chat:", error);
      // Even on error, ensure messages are cleared
      dispatch(setMessages([]));
      dispatch(clearMessages());
      setIsCreatingNewChat(false);
      toast({
        title: "Failed to create new chat",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleExportChat = (format: 'txt' | 'pdf') => {
    const chatContent = messages.map(msg => {
      const typeLabel = msg.type === 'user' ? 'You' : msg.type === 'assistant' ? 'AI Assistant' : 'System';
      return `[${msg.timestamp}] ${typeLabel}:\n${msg.content}\n`;
    }).join('\n---\n\n');

    if (format === 'txt') {
      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export complete",
        description: "Chat history exported as TXT file",
      });
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Chat History Export', margin, yPosition);
      yPosition += 10;
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 15;

      // Messages
      messages.forEach((msg, index) => {
        const typeLabel = msg.type === 'user' ? 'You' : msg.type === 'assistant' ? 'AI Assistant' : 'System';
        
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        // Message header
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${typeLabel} [${msg.timestamp}]`, margin, yPosition);
        yPosition += 7;

        // Message content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(msg.content, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });

        // Citations if any
        if (msg.citations && msg.citations.length > 0) {
          yPosition += 3;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          msg.citations.forEach(citation => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(`📎 ${citation.title} - ${citation.section}`, margin + 5, yPosition);
            yPosition += 5;
          });
        }

        yPosition += 8;

        // Separator line
        if (index < messages.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 8;
        }
      });

      doc.save(`chat-history-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export complete",
        description: "Chat history exported as PDF file",
      });
    }
  };

  const filteredMessages = (searchQuery.trim() || searchFromSidebar.trim())
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes((searchQuery || searchFromSidebar).toLowerCase())
      )
    : messages;

  // Function to handle search from sidebar
  const handleSidebarSearch = (query: string) => {
    setSearchFromSidebar(query);
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearchVisible(true);
    }
  };

  // Clear all search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchFromSidebar("");
  };

  // Handle document upload - auto-populate "summary" if auto-summarize is ON
  const handleDocumentUploaded = (documentId: string) => {
    // Set the uploaded document as selected
    dispatch(setSelectedDocumentAction(documentId));
    
    // If auto-summarize is ON, auto-populate "summary" in input
    if (ragState.autoSummarize && inputMessageRef.current.setMessage) {
      inputMessageRef.current.setMessage("summary");
    }
  };

    if (isMobile) {
        return (
            <Suspense fallback={"Loading mobile layout..."}>
                <MobileChatLayout messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} />
            </Suspense>
        )
    }

  return (
        <div className="min-h-screen bg-background text-foreground font-inter">
            <Suspense fallback={"Loading header..."}>
                <ChatHeader 
                    onExportChat={handleExportChat}
                    lastMode={ragState.lastMode}
                    selectedDocumentId={ragState.selectedDocumentId}
                />
            </Suspense>
        
        <div className="flex h-[calc(100vh-4rem)]">
            <Suspense fallback={"Loading sidebar..."}>
                <ChatSidebar 
                    isCollapsed={sidebarCollapsed} 
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                    onSearch={handleSidebarSearch}
                    retrievedChunks={ragState.retrievedChunks}
                    selectedDocumentId={ragState.selectedDocumentId}
                    onSelectDocument={(docId) => dispatch(setSelectedDocument(docId))}
                    onNewChat={handleNewChat}
                    onSelectConversation={restoreConversation}
                />
            </Suspense>

            <div className="flex-1 flex flex-col relative">
            <div className="px-6 py-5 border-b border-border/50 bg-gradient-surface backdrop-blur-sm">
                <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-semibold text-foreground">Legal Document Analysis</h1>
                    <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSearchVisible(!isSearchVisible)}
                        className="flex items-center gap-2 bg-surface-elevated/60 hover:bg-surface-elevated border-border/50"
                    >
                        {isSearchVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isSearchVisible ? "Hide Search" : "Show Search"}
                    </Button>
                    <Badge variant="secondary" className="bg-surface-elevated/80 text-secondary border-border/30 font-medium">Active Session</Badge>
                    </div>
                </div>
                {/* Search Bar */}
                {isSearchVisible && (
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 bg-surface-elevated/60 border-border/50 focus:border-primary/50 h-9"
                    />
                    {searchQuery && (
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-surface-chat"
                        >
                        <X className="w-4 h-4" />
                        </Button>
                    )}
                    </div>
                )}
                </div>
            </div>
            <div className="flex-1 overflow-hidden pb-32">
                <ScrollArea className="h-full">
                <div className="py-4 space-y-4 min-h-full flex flex-col justify-end">
                    <div className="max-w-4xl mx-auto w-full space-y-6 pb-4 px-6">
                    {(searchQuery.trim() || searchFromSidebar.trim()) && (
                        <div className="flex items-center justify-between bg-surface-elevated/60 border border-border/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground">
                            Searching for: <strong>"{searchQuery || searchFromSidebar}"</strong>
                            </span>
                            <span className="text-xs text-muted-foreground">
                            ({filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''})
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSearch}
                            className="h-7 px-2 hover:bg-surface-chat"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        </div>
                    )}
                    {filteredMessages.length === 0 && (searchQuery.trim() || searchFromSidebar.trim()) ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No messages found matching "{searchQuery || searchFromSidebar}"</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSearch}
                          className="mt-3"
                        >
                          Clear Search
                        </Button>
                      </div>
                    ) : (
                      <>
                        {messages.length === 0 && !searchQuery.trim() && !searchFromSidebar.trim() && (
                          <div className="flex-1 flex flex-col justify-center items-center py-12">
                            <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading suggestions...</div>}>
                              <WelcomeSuggestions onSelect={(text) => handleSendMessage(text)} />
                            </Suspense>
                          </div>
                        )}
                        {filteredMessages.map((message) => (
                          <div key={message.id} className="group">
                            <Suspense fallback={"Loading message..."}>
                              <MessageBubble message={message} />
                            </Suspense>
                          </div>
                        ))}
                      </>
                    )}
                    {(isLoading || queryLoading) && (
                        <div className="flex justify-start">
                        <div className="flex space-x-3 max-w-[85%]">
                            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-primary-foreground">AI</div>
                            <div className="bg-surface-elevated border border-border px-4 py-3 rounded-2xl">
                                <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce animate-bounce-delay-0" />
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce animate-bounce-delay-150" />
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce animate-bounce-delay-300" />
                                </div>
                                <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                                </div>
                            </div>
                        </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                    </div>
                </div>
                </ScrollArea>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border">
                <div className="max-w-4xl mx-auto w-full">
                    <Suspense fallback={"Loading composer..."}>
                        <ChatComposer 
                            onSendMessage={handleSendMessage} 
                            isLoading={isLoading || queryLoading}
                            selectedDocumentId={ragState.selectedDocumentId}
                            onDocumentUploaded={handleDocumentUploaded}
                            inputMessageRef={inputMessageRef}
                        />
                    </ Suspense>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
};

export default Index;
