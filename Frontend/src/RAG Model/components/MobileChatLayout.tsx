import { useState } from "react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Menu, X } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import MessageBubble from "./MessageBubble";
import ChatComposer from "./ChatComposer";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import WelcomeSuggestions from "./WelcomeSuggestions";
import { Eye, EyeOff, Search } from "lucide-react";
import { Input } from "../components/ui/input";

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
}

interface MobileChatLayoutProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  chatSidebarProps?: any;
  onExportChat?: (format: 'txt' | 'pdf') => void;
  searchProps?: any;
}

const MobileChatLayout = ({ messages, isLoading, onSendMessage, chatSidebarProps, onExportChat, searchProps }: MobileChatLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { searchQuery, setSearchQuery, isSearchVisible, setIsSearchVisible, clearSearch, resultCount } = searchProps || {};

  return (
    <div className="h-[100dvh] overflow-hidden bg-background text-foreground font-inter flex flex-col">
      {/* Mobile Header via ChatHeader */}
      <ChatHeader 
        onExportChat={onExportChat}
        selectedDocumentId={chatSidebarProps?.selectedDocumentId}
        leftContent={
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-surface-elevated w-8 h-8 p-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="p-0 w-80 bg-surface border-border"
            >
              <div className="h-full">
                <ChatSidebar 
                  {...chatSidebarProps}
                  onSelectConversation={(id: string) => {
                    if (chatSidebarProps?.onSelectConversation) {
                      chatSidebarProps.onSelectConversation(id);
                    }
                    setSidebarOpen(false);
                  }}
                  onNewChat={() => {
                    if (chatSidebarProps?.onNewChat) {
                      chatSidebarProps.onNewChat();
                    }
                    setSidebarOpen(false);
                  }}
                  onToggleCollapse={() => {
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      {/* Mobile Legal Document Analysis Row */}
      <div className="px-4 py-2 border-b border-border/50 bg-gradient-surface backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-foreground">Legal Document Analysis</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchVisible?.(!isSearchVisible)}
                className="h-6 text-[10px] px-2 flex items-center gap-1 bg-surface-elevated/60 hover:bg-surface-elevated border-border/50"
              >
                {isSearchVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {isSearchVisible ? "Hide" : "Search"}
              </Button>
              <Badge variant="secondary" className="bg-surface-elevated/80 text-[10px] px-1.5 py-0 border-border/30">Active</Badge>
            </div>
          </div>
          {isSearchVisible && (
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery?.(e.target.value)}
                className="pl-8 pr-8 bg-surface-elevated/60 border-border/50 focus:border-primary/50 h-8 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-surface-chat"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4 min-h-full flex flex-col justify-end">
          {(searchQuery?.trim()) && (
            <div className="flex items-center justify-between bg-surface-elevated/60 border border-border/50 rounded-lg p-2 mb-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Search className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground truncate">
                  Search: <strong>"{searchQuery}"</strong> ({resultCount} results)
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearSearch} className="h-6 w-6 p-0 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
          
          {messages.length === 0 && !searchQuery?.trim() ? (
            <div className="flex-1 flex flex-col justify-center items-center py-6">
              <WelcomeSuggestions onSelect={(text) => onSendMessage(text)} />
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {/* Mobile Thinking Indicator */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <div className="w-4 h-4 text-primary-foreground">🤖</div>
                </div>
                <div className="bg-gradient-primary text-primary-foreground p-3 rounded-radius-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Mobile Composer - Fixed at bottom */}
      <div className="bg-surface border-t border-border flex-shrink-0 w-full z-10 pb-safe">
        <ChatComposer onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default MobileChatLayout;