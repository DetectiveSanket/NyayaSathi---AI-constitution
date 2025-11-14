import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Plus, 
  Mic, 
  Send, 
  Upload, 
  Link, 
  FileText, 
  Library,
  Languages,
  Volume2,
  Loader2,
  Image,
  Folder,
  Camera,
  ScanLine,
  Video,
  AudioLines
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TTSControls from "./TTSControls";
import { FileUploadZone } from "./FileUploadZone";
import { DocumentLibraryModal } from "./DocumentLibraryModal";
import { useFileManager } from "@/contexts/FileManagerContext";

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatComposer = ({ onSendMessage, isLoading = false }: ChatComposerProps) => {
  const [message, setMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploadType, setUploadType] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadFiles } = useFileManager();

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Set language based on selected language
      const langMap: { [key: string]: string } = {
        english: 'en-US',
        hindi: 'hi-IN',
        marathi: 'mr-IN',
        tamil: 'ta-IN',
        telugu: 'te-IN',
        gujarati: 'gu-IN',
        bengali: 'bn-IN',
        kannada: 'kn-IN',
        malayalam: 'ml-IN',
        punjabi: 'pa-IN',
      };
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setMessage(prev => {
            const newMessage = prev + finalTranscript;
            // Auto-resize textarea after voice input
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
              }
            }, 10);
            return newMessage;
          });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        toast({
          title: "Voice input error",
          description: "Could not process speech. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage, toast]);

  // Auto-resize textarea when message changes (including voice input)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const langMap: { [key: string]: string } = {
        english: 'en-US',
        hindi: 'hi-IN',
        marathi: 'mr-IN',
        tamil: 'ta-IN',
        telugu: 'te-IN',
        gujarati: 'gu-IN',
        bengali: 'bn-IN',
        kannada: 'kn-IN',
        malayalam: 'ml-IN',
        punjabi: 'pa-IN',
      };
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';
    }
  }, [selectedLanguage]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
      toast({
        description: "Voice input stopped",
        duration: 2000,
      });
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsRecording(true);
        toast({
          description: "Listening... Speak now",
          duration: 2000,
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Error",
          description: "Could not start voice input. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleFileUpload = (accept: string, type: string) => {
    setUploadType(type);
    setShowUploadZone(true);
  };

  const handleQuickFileSelect = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setAttachedFiles(prev => [...prev, ...filesArray]);
      await uploadFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const languages = [
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
    { value: "marathi", label: "Marathi" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "gujarati", label: "Gujarati" },
    { value: "bengali", label: "Bengali" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "punjabi", label: "Punjabi" },
  ];

  return (
    <TooltipProvider>
      <div className="bg-background border-t border-border/30">
      {/* Context Chips - Compact */}
      <div className="px-6 py-2 border-b border-border/20">
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-surface-chat/60 backdrop-blur-sm border-border/30 text-xs font-medium px-2 py-0.5">
              <FileText className="w-3 h-3 mr-1.5 text-primary" />
              <span className="text-foreground/90">Document: IndianPenalCode_Sections.pdf</span>
            </Badge>
          </div>
          
          {/* Language and Voice Controls */}
          <div className="flex items-center gap-2">
            <TTSControls />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-surface-chat/60 rounded-md h-7 px-2 flex items-center gap-1.5 transition-all"
                  disabled={isLoading}
                  title="Select language"
                >
                  <Languages className="w-4 h-4 text-foreground/70" />
                  <span className="text-xs text-foreground/90">{languages.find(l => l.value === selectedLanguage)?.label}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-surface-elevated border-border/50 shadow-xl" side="top">
                <div className="space-y-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setSelectedLanguage(lang.value);
                        toast({
                          description: `Language changed to ${lang.label}`,
                          duration: 2000,
                        });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedLanguage === lang.value
                          ? "bg-primary/20 text-primary font-medium"
                          : "hover:bg-surface-chat text-foreground/80"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="sm"
              className={`hover:bg-surface-chat/60 rounded-md h-7 px-2 flex items-center gap-1.5 transition-all ${
                voiceEnabled ? "bg-accent/20" : ""
              }`}
              onClick={() => {
                const newState = !voiceEnabled;
                setVoiceEnabled(newState);
                toast({
                  description: newState ? "Voice output enabled" : "Voice output disabled",
                  duration: 2000,
                });
              }}
              disabled={isLoading}
              title={voiceEnabled ? "Voice output enabled" : "Voice output disabled"}
            >
              <Volume2 className={`w-4 h-4 transition-colors ${voiceEnabled ? "text-accent" : "text-foreground/70"}`} />
              <span className="text-xs text-foreground/90">{voiceEnabled ? "On" : "Off"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Composer - Compact Single Line */}
      <div className="px-6 py-3">
        <div className="max-w-5xl mx-auto">
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-surface-elevated/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-sm"
                >
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachedFile(index)}
                    className="h-5 w-5 p-0 hover:bg-destructive/20 rounded-full flex-shrink-0"
                  >
                    <span className="text-muted-foreground hover:text-destructive text-lg leading-none">×</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Compact Input with integrated controls */}
          <div className="flex items-center gap-2 bg-surface-elevated/70 backdrop-blur-sm border border-border/50 rounded-3xl px-2 py-1.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
            {/* Upload Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-surface-chat/60 rounded-full w-9 h-9 p-0 flex items-center justify-center flex-shrink-0 transition-all"
                  disabled={isLoading}
                  title="Add content"
                >
                  <Plus className="w-5 h-5 text-foreground/70 hover:text-primary transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-elevated border-border/50 shadow-xl z-[100]" side="top">
                <DropdownMenuItem 
                  className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
                  onClick={() => handleFileUpload(".pdf,.doc,.docx,.txt,.xlsx,.xls", "document")}
                >
                  <Upload className="w-4 h-4 mr-2 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-medium">Upload Document</span>
                    <span className="text-xs text-muted-foreground">PDF, Word, Excel, TXT</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
                  onClick={() => handleFileUpload("image/*", "image")}
                >
                  <Image className="w-4 h-4 mr-2 text-accent" />
                  <div className="flex flex-col">
                    <span className="font-medium">Upload Image</span>
                    <span className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
                  onClick={() => handleQuickFileSelect("image/*")}
                >
                  <Camera className="w-4 h-4 mr-2 text-secondary" />
                  <div className="flex flex-col">
                    <span className="font-medium">Take Photo</span>
                    <span className="text-xs text-muted-foreground">Use device camera</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
                  onClick={() => handleFileUpload("audio/*", "audio")}
                >
                  <AudioLines className="w-4 h-4 mr-2 text-accent" />
                  <div className="flex flex-col">
                    <span className="font-medium">Upload Audio</span>
                    <span className="text-xs text-muted-foreground">MP3, WAV, M4A</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
                  onClick={() => handleFileUpload("video/*", "video")}
                >
                  <Video className="w-4 h-4 mr-2 text-secondary" />
                  <div className="flex flex-col">
                    <span className="font-medium">Upload Video</span>
                    <span className="text-xs text-muted-foreground">MP4, MOV, AVI</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
                  onClick={() => setShowLibrary(true)}
                >
                  <Library className="w-4 h-4 mr-2 text-secondary" />
                  <div className="flex flex-col">
                    <span className="font-medium">File Library</span>
                    <span className="text-xs text-muted-foreground">View all uploaded files</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Text Input - Single Line */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this document or type a question. Press Enter to send, Shift+Enter for new line."
              className="flex-1 min-h-[36px] max-h-[120px] resize-none bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2 text-foreground placeholder:text-muted-foreground/60 text-sm leading-tight scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent hover:scrollbar-thumb-border/60"
              disabled={isLoading}
              rows={1}
            />

            {/* Voice Recording */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`hover:bg-surface-chat/60 rounded-full w-9 h-9 p-0 flex items-center justify-center flex-shrink-0 transition-all ${
                    isRecording ? "bg-destructive/20 text-destructive" : ""
                  }`}
                  onClick={handleMicClick}
                  disabled={isLoading}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <Mic className={`w-4.5 h-4.5 transition-colors ${isRecording ? "animate-pulse text-destructive" : "text-foreground/70 hover:text-accent"}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? "Stop recording" : "Start voice input"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Send Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className="bg-gradient-primary hover:opacity-90 shadow-sm w-9 h-9 p-0 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all duration-200"
                  title="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                  ) : (
                    <Send className="w-4.5 h-4.5 text-white" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Listening Indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 mt-2 text-accent animate-fade-in">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-xs font-medium">Listening...</span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        aria-label="File upload input"
        title="File upload input"
      />

      {/* File Upload Zone Modal */}
      {showUploadZone && (
        <FileUploadZone
          accept={uploadType === "document" ? ".pdf,.doc,.docx,.txt,.xlsx,.xls" 
            : uploadType === "image" ? "image/*"
            : uploadType === "audio" ? "audio/*"
            : uploadType === "video" ? "video/*"
            : "*"}
          onClose={() => setShowUploadZone(false)}
        />
      )}

      {/* Document Library Modal */}
      <DocumentLibraryModal
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
      />
      </div>
    </TooltipProvider>
  );
};

export default ChatComposer;