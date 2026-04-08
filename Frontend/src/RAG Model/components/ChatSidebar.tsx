import { useState, useEffect, Suspense, lazy } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { 
  Plus, 
  Library, 
  Search, 
  MoreVertical, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  FileText,
  Clock,
  Edit3,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Play,
  Share,
  Settings,
  X,
  FileCheck,
  ScrollText
} from "lucide-react";

//* Components that are dynamically imported to avoid circular dependencies with contexts
// import { DocumentLibraryModal } from "./DocumentLibraryModal";
// import { EditProfileModal } from "./EditProfileModal";
// import { SettingsModal } from "./SettingsModal";

// Lazy load modals to avoid circular dependencies and improve initial load time
const DocumentLibraryModal = lazy(() => import("./DocumentLibraryModal"));
const EditProfileModal = lazy(() => import("./EditProfileModal"));
const SettingsModal = lazy(() => import("./SettingsModal"));

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { listDocuments, deleteConversation } from "../../services/ragService.js";
import {
  setDocuments,
  addDocument,
  setCurrentConversationId,
  removeConversation,
  setUserName,
  setConversations,
  setMessages,
} from "../../store/ragSlice.js";
import { logoutUser } from "../../features/auth/authThunks.js";
import { localLogout } from "../../store/authSlice.js";
import { useToast } from "../hooks/use-toast";
import { getRagToken } from "../../services/api.js";

interface ChatItem {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

interface ChatSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSearch?: (query: string) => void;
  retrievedChunks?: Array<{
    chunkId: string;
    text: string;
    page: number;
    score?: number;
    documentId?: string;
  }>;
  selectedDocumentId?: string | null;
  onSelectDocument?: (documentId: string | null) => void;
  onNewChat?: () => void;
  onSelectConversation?: (conversationId: string) => void;
}

const ChatSidebar = ({ 
  isCollapsed = false, 
  onToggleCollapse, 
  onSearch,
  retrievedChunks = [],
  selectedDocumentId,
  onSelectDocument,
  onNewChat,
  onSelectConversation,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showChunks, setShowChunks] = useState(false);
  const [documents, setDocumentsLocal] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ragState = useSelector((state: any) => state.rag) || {};
  const authState = useSelector((state: any) => state.auth) || {};
  const { toast } = useToast();

  // Load documents on mount (only if user is authenticated)
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        // Only load if we have a regular auth token, not just RAG token
        const ragToken = getRagToken();
        // For now, skip document loading for public RAG sessions
        // Documents require authentication
        // const docs = await listDocuments();
        // setDocumentsLocal(docs);
      } catch (error) {
        // Endpoint might not exist, that's ok
        console.log("Documents endpoint not available");
      }
    };
    loadDocuments();
  }, []);

  // Handle search with debounce effect
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Convert conversations from Redux to ChatItem format
  const recentChats: ChatItem[] = (ragState.conversations || []).map((conv: any) => {
    const date = new Date(conv.lastMessageAt || conv.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let timestamp = "Just now";
    if (diffDays > 0) {
      timestamp = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      timestamp = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins > 0) {
        timestamp = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      }
    }

    return {
      id: conv.conversationId,
      title: conv.title || "New Conversation",
      timestamp,
      preview: conv.firstMessage || conv.preview || "New conversation",
    };
  });

  // Filter chats based on local search query
  const filteredChats = searchQuery.trim()
    ? recentChats.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentChats;

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className="w-14 bg-surface border-r border-border flex flex-col items-center py-4 space-y-4 relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onToggleCollapse}
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 hover:bg-surface-elevated absolute top-2 right-[-16px] z-10 bg-surface border border-border rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Expand sidebar</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="w-10 h-10 bg-gradient-primary hover:opacity-90 focus-ring">
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New chat</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 hover:bg-surface-elevated"
                onClick={() => setIsLibraryOpen(true)}
              >
                <Library className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Library</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 hover:bg-surface-elevated"
                onClick={() => onSearch && onSearch("")}
              >
                <Search className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Search Messages</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-80 bg-surface border-r border-border flex flex-col h-full relative">
        {/* Collapse Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onToggleCollapse}
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 hover:bg-surface-elevated absolute top-4 right-[-16px] z-10 bg-surface border border-border rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Collapse sidebar</p>
          </TooltipContent>
        </Tooltip>
      
      {/* New Chat Button */}
      <div className="p-4 border-b border-rounded-lg">
        <Button 
          className="w-full bg-blue-500 hover:opacity-90 focus-ring shadow-md hover-lift "
          size="lg"
          onClick={() => {
            if (onNewChat) {
              onNewChat();
            } else if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent("newChat"));
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Library Section */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-surface-elevated sidebar-item-glow"
          onClick={() => setIsLibraryOpen(true)}
        >
          <Library className="w-4 h-4 mr-3" />
          <span>Library</span>
          <Badge variant="secondary" className="ml-auto bg-accent text-accent-foreground">
            {documents.length}
          </Badge>
        </Button>
        {retrievedChunks.length > 0 && (
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-surface-elevated sidebar-item-glow"
            onClick={() => setShowChunks(!showChunks)}
          >
            <ScrollText className="w-4 h-4 mr-3" />
            <span>Retrieved Chunks</span>
            <Badge variant="secondary" className="ml-auto">
              {retrievedChunks.length}
            </Badge>
          </Button>
        )}
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Documents</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {documents.map((doc: any) => (
              <button
                key={doc._id || doc.id}
                onClick={() => onSelectDocument && onSelectDocument(doc._id || doc.id)}
                className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                  selectedDocumentId === (doc._id || doc.id)
                    ? "bg-primary/20 text-primary font-medium"
                    : "hover:bg-surface-elevated text-foreground/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3 h-3" />
                  <span className="truncate">{doc.filename || doc.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Retrieved Chunks */}
      {showChunks && retrievedChunks.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Retrieved Chunks</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {retrievedChunks.map((chunk, index) => (
              <div
                key={chunk.chunkId || index}
                className="p-2 rounded-md bg-surface-elevated border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => {
                  // Scroll to chunk in main area or highlight
                  toast({
                    description: `Chunk ${index + 1} selected`,
                    duration: 2000,
                  });
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    Chunk {index + 1}
                  </Badge>
                  {chunk.score !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {(chunk.score * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/70 line-clamp-3">
                  {chunk.text}
                </p>
                {chunk.page && (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Page {chunk.page}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-surface-elevated border-border focus:border-primary focus-ring"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearchChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-surface-chat"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            Recent Chats {searchQuery && `(${filteredChats.length} found)`}
          </h3>
          <div className="space-y-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No chats found</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                key={chat.id}
                className={`group p-3 rounded-radius-sm hover:bg-surface-elevated cursor-pointer border border-transparent hover:border-border transition-all sidebar-item-glow hover:rounded-[16px] ${
                  ragState?.currentConversationId === chat.id ? "bg-surface-elevated border-border" : ""
                }`}
                onClick={() => {
                  if (onSelectConversation) {
                    onSelectConversation(chat.id);
                  }
                }}
              >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {chat.title}
                        </h4>
                      </div>

                      <p className="text-xs text-zinc-600 line-clamp-2 mb-2">
                        {chat.preview}
                      </p>

                      <div className="flex items-center text-xs text-zinc-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {chat.timestamp}
                      </div>
                    </div>
                    
                    {/* 3-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 hover:bg-surface-chat rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-48 bg-surface-elevated border-border/50 shadow-lg" 
                        side="right"
                        align="start"
                      >
                        <DropdownMenuItem
                          className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectConversation) {
                              onSelectConversation(chat.id);
                            }
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer text-destructive hover:text-destructive"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await deleteConversation(chat.id);
                              dispatch(removeConversation(chat.id));
                              if (ragState?.currentConversationId === chat.id) {
                                dispatch(setCurrentConversationId(null));
                                localStorage.removeItem("rag_current_conversation_id");
                              }
                              toast({
                                description: "Conversation deleted",
                                duration: 2000,
                              });
                            } catch (error) {
                              toast({
                                title: "Failed to delete conversation",
                                description: error instanceof Error ? error.message : "Unknown error",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start hover:bg-surface-elevated focus-ring"
            >
              <Avatar className="w-8 h-8 mr-3">
                <AvatarImage src={authState?.user?.avatar || ""} alt="User" />
                <AvatarFallback className="bg-blue-500 text-primary-foreground">
                  {(authState?.user?.name || ragState?.userName || "Guest").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">
                  {authState?.user?.name || ragState?.userName || "Guest"}
                </div>
                <div className="text-xs text-zinc-600">
                  {authState?.isAuthenticated ? "Active session" : "Anonymous session"}
                </div>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-0 bg-surface-elevated border-border" 
            side="top"
            align="start"
          >
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-surface-chat"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsEditProfileOpen(true);
                }}
              >
                <User className="w-4 h-4 mr-3" />
                Edit Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-surface-chat"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsSettingsOpen(true);
                }}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-surface-chat"
                onClick={() => {
                  setIsProfileOpen(false);
                  const isDark = document.documentElement.classList.contains("dark");
                  if (isDark) {
                    document.documentElement.classList.remove("dark");
                    toast({
                      description: "Switched to light theme",
                      duration: 2000,
                    });
                  } else {
                    document.documentElement.classList.add("dark");
                    toast({
                      description: "Switched to dark theme",
                      duration: 2000,
                    });
                  }
                }}
              >
                <Sun className="w-4 h-4 mr-3" />
                Toggle Theme
              </Button>
              <div className="my-1 h-px bg-border" />
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-surface-chat text-destructive"
                onClick={async () => {
                  setIsProfileOpen(false);
                  // Clear RAG state immediately so the next user doesn't see stale data
                  dispatch(setConversations([]));
                  dispatch(setMessages([]));
                  dispatch(setCurrentConversationId(null));
                  try {
                    await dispatch(logoutUser() as any).unwrap();
                    dispatch(localLogout());
                    // Clear browser-local tokens
                    localStorage.removeItem("rag_public_session_token");
                    localStorage.removeItem("rag_current_conversation_id");
                    toast({
                      description: "Logged out successfully",
                      duration: 2000,
                    });
                    navigate("/login", { replace: true });
                  } catch (error: any) {
                    // Even if backend fails, clear local state
                    dispatch(localLogout());
                    localStorage.removeItem("rag_public_session_token");
                    localStorage.removeItem("rag_current_conversation_id");
                    toast({
                      description: "Logged out",
                      duration: 2000,
                    });
                    navigate("/login", { replace: true });
                  }
                }}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Modals */}
      <Suspense fallback={"Loading library..."}>
        <DocumentLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />
      </Suspense>

      <Suspense fallback={"Loading profile editor..."}>
        <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      </Suspense>

      <Suspense fallback={"Loading settings..."}>
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </Suspense>
      </div>
    </TooltipProvider>
  );
};

export default ChatSidebar;