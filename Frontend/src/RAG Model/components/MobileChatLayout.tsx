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
}

const MobileChatLayout = ({ messages, isLoading, onSendMessage }: MobileChatLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-[100dvh] overflow-hidden bg-background text-foreground font-inter flex flex-col">
      {/* Mobile Header */}
      <div className="h-14 bg-surface border-b border-border flex items-center px-4 justify-between">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-surface-elevated">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="p-0 w-80 bg-surface border-border"
          >
            <div className="h-full">
              <ChatSidebar />
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold">NyayaSathi</h1>
        
        <Badge variant="secondary" className="bg-surface-elevated text-xs">
          AI v1
        </Badge>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4 min-h-full flex flex-col justify-end">
          {messages.length === 0 ? (
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