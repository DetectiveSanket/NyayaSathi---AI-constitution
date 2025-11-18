import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, ExternalLink, User, Bot, Clock, Volume2, Pause, Square } from "lucide-react";
import { useTextToSpeech } from "@/contexts/TTSContext";

interface MessageBubbleProps {
  message: {
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
  };
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { speak, pause, resume, stop, isSpeaking, isPaused, currentMessageId } = useTextToSpeech();
  
  const isThisMessageSpeaking = currentMessageId === message.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      description: "Message copied to clipboard",
      duration: 2000,
    });
  };

  const handleSpeak = () => {
    if (!isThisMessageSpeaking) {
      speak(message.content, message.id);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
  };

  if (message.type === "system") {
    return (
      <div className="flex justify-center py-4">
        <div className="px-4 py-2 bg-surface-elevated rounded-full text-sm text-zinc-500 border border-border">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>{message.content}</span>
          </div>
        </div>
      </div>
    );
  }

  const isAssistant = message.type === "assistant";
  const isUser = message.type === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex w-full max-w-none ${isUser ? "justify-end" : "justify-start"}`}>
        <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} space-x-3 ${isUser ? "space-x-reverse" : ""} max-w-[85%]`}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-7 h-7">
              {isAssistant ? (
                <AvatarFallback className="bg-blue-700 text-primary-foreground text-xs">
                  AI
                </AvatarFallback>
              ) : (
                <AvatarFallback className="bg-teal-500 text-secondary-foreground text-xs">
                  U
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div
              className={`px-5 py-4 rounded-2xl shadow-sm ${
                isAssistant
                  ? "bg-surface-elevated text-foreground border border-border/50 hover:border-border/80 transition-colors"
                  : "bg-blue-500 text-primary-foreground shadow-md"
              }`}
            >
              {/* Message text */}
              <div className="text-[15px] leading-relaxed">
                <p className="mb-0 whitespace-pre-wrap font-normal">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-blue-600 animate-pulse ml-1 align-middle" />
                  )}
                </p>
              </div>

              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="text-xs font-medium mb-2 opacity-80">Sources:</div>
                  <div className="flex flex-wrap gap-1">
                    {message.citations.map((citation) => (
                      <Badge
                        key={citation.id}
                        variant="outline"
                        className={`text-xs cursor-pointer transition-all hover:scale-105 ${
                          isAssistant 
                            ? "border-border/50 bg-surface hover:bg-surface-chat" 
                            : "border-primary-foreground/30 bg-primary-foreground/10 hover:bg-primary-foreground/20"
                        }`}
                      >
                        <ExternalLink className="w-2.5 h-2.5 mr-1" />
                        {citation.section}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className={`flex items-center justify-between mt-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              <div className="flex items-center text-xs text-zinc-500">
                <Clock className="w-3 h-3 mr-1" />
                {message.timestamp}
              </div>
              <div className="flex items-center gap-1">
                {isAssistant && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSpeak}
                      className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-surface-elevated rounded-md"
                      title={isThisMessageSpeaking ? (isPaused ? "Resume" : "Pause") : "Read aloud"}
                    >
                      {isThisMessageSpeaking && !isPaused ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    {isThisMessageSpeaking && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStop}
                        className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-surface-elevated rounded-md"
                        title="Stop"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-surface-elevated rounded-md"
                  title="Copy message"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;