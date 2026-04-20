import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { 
  Plus, 
  Mic, 
  Send, 
  Upload, 
  FileText, 
  Library,
  Languages,
  Volume2,
  Loader2,
  Image,
  Camera,
  Video,
  AudioLines,
  FileCheck2,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import TTSControls from "./TTSControls";
import { FileUploadZone } from "./FileUploadZone";
import { DocumentLibraryModal } from "./DocumentLibraryModal";
import { useFileManager } from "../contexts/FileManagerContext";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, setMode, setSummary, setMessagesForConversation } from "../../store/ragSlice.js";
import { useSummarize } from "../../hooks/useSummarize.js";
import { listUserDocuments } from "../../services/ragService.js";

interface ChatComposerProps {
  onSendMessage: (message: string, language?: string, documentId?: string) => void;
  isLoading?: boolean;
  selectedDocumentId?: string | null;
  onDocumentUploaded?: (documentId: string) => void;
  inputMessageRef?: React.MutableRefObject<{ setMessage?: (msg: string) => void }>;
}

interface DocEntry {
  _id: string;
  filename: string;
  processed?: boolean;
}

const ChatComposer = ({ onSendMessage, isLoading = false, selectedDocumentId, onDocumentUploaded, inputMessageRef }: ChatComposerProps) => {
  const [message, setMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploadType, setUploadType] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // ── Document selector state ───────────────────────────────────────────────
  const [documentsList, setDocumentsList] = useState<DocEntry[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadFiles } = useFileManager();
  const dispatch = useDispatch();
  const ragState = useSelector((state: any) => state.rag);
  const authState = useSelector((state: any) => state.auth);

  // ── Summarize hook ────────────────────────────────────────────────────────
  const { summarize, loading: summarizeLoading } = useSummarize({
    onSuccess: (result) => {
      const docName = documentsList.find(d => d._id === selectedDocId)?.filename || "document";
      const summaryMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: result.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: "contextual",
      };
      dispatch(addMessage(summaryMessage));
      dispatch(setMode("contextual"));
      dispatch(setSummary(result));

      const conversationId = ragState?.currentConversationId;
      if (conversationId) {
        const currentMessages = ragState.messages || [];
        dispatch(setMessagesForConversation({
          conversationId,
          messages: [...currentMessages, summaryMessage],
        }));
      }

      toast({
        title: "Summary generated",
        description: `"${docName}" summarized in ${selectedLanguage} (${result.chunksUsed} chunks)`,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Summarization failed",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    },
  });

  // ── Load document list ────────────────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    let docs: DocEntry[] = [];
    if (authState?.isAuthenticated) {
      try {
        setDocsLoading(true);
        docs = await listUserDocuments();
      } catch (err) {
        // Silently fail API — will fallback to redux docs below
      } finally {
        setDocsLoading(false);
      }
    }

    // Merge with any session documents currently in Redux
    if (ragState?.documents && Array.isArray(ragState.documents)) {
      const reduxDocs = ragState.documents.map((d: any) => ({
        _id: d._id,
        filename: d.filename || d.name || "Document",
        processed: d.processed !== false
      }));
      for (const rd of reduxDocs) {
        if (!docs.find(d => d._id === rd._id)) {
          docs.unshift(rd);
        }
      }
    }

    setDocumentsList(docs);

    // Auto-select logic:
    // 1. If parent passes a selectedDocumentId prop that exists in the list → honour it.
    // 2. Else if we have NO current local selection and there are docs → pick first processed.
    // 3. Never override an existing user selection (don't use selectedDocId in deps).
    setSelectedDocId(prev => {
      if (selectedDocumentId && docs.find((d: DocEntry) => d._id === selectedDocumentId)) {
        return selectedDocumentId;
      }
      if (!prev && docs.length > 0) {
        const firstProcessed = docs.find((d: DocEntry) => d.processed) || docs[0];
        return firstProcessed._id;
      }
      // Preserve existing selection — if still valid
      if (prev && docs.find((d: DocEntry) => d._id === prev)) {
        return prev;
      }
      // Selection no longer in list, fall back to first
      if (docs.length > 0) {
        return (docs.find((d: DocEntry) => d.processed) || docs[0])._id;
      }
      return prev;
    });
  // NOTE: selectedDocId intentionally excluded from deps — including it caused
  // the callback to re-run on every pill click and reset the selection.
  }, [authState?.isAuthenticated, selectedDocumentId, ragState?.documents]);

  // Fetch on mount and when auth or selectedDocumentId change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Keep selectedDocId in sync with incoming prop (when parent selects a doc)
  useEffect(() => {
    if (selectedDocumentId) {
      setSelectedDocId(selectedDocumentId);
      // Add to list if not already present
      setDocumentsList(prev => {
        if (prev.find(d => d._id === selectedDocumentId)) return prev;
        const fromRedux = ragState.documents?.find((d: any) => d._id === selectedDocumentId);
        if (fromRedux) return [fromRedux, ...prev];
        return prev;
      });
    }
  }, [selectedDocumentId]);

  // When a new document is uploaded, refresh the document list
  const handleDocumentUploaded = useCallback(async (documentId: string) => {
    await fetchDocuments();
    setSelectedDocId(documentId);
    if (onDocumentUploaded) onDocumentUploaded(documentId);
  }, [fetchDocuments, onDocumentUploaded]);

  // ── Voice setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      const langMap: { [key: string]: string } = {
        english: 'en-US', hindi: 'hi-IN', marathi: 'mr-IN', tamil: 'ta-IN',
        telugu: 'te-IN', gujarati: 'gu-IN', bengali: 'bn-IN', kannada: 'kn-IN',
        malayalam: 'ml-IN', punjabi: 'pa-IN',
      };
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
        }
        if (finalTranscript) {
          setMessage(prev => {
            const newMessage = prev + finalTranscript;
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
      recognitionRef.current.onerror = () => { setIsListening(false); setIsRecording(false); };
      recognitionRef.current.onend = () => { setIsListening(false); setIsRecording(false); };
    }
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, [selectedLanguage, toast]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  useEffect(() => {
    if (recognitionRef.current) {
      const langMap: { [key: string]: string } = {
        english: 'en-US', hindi: 'hi-IN', marathi: 'mr-IN', tamil: 'ta-IN',
        telugu: 'te-IN', gujarati: 'gu-IN', bengali: 'bn-IN', kannada: 'kn-IN',
        malayalam: 'ml-IN', punjabi: 'pa-IN',
      };
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (inputMessageRef) {
      inputMessageRef.current.setMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
          }
        }, 10);
      };
    }
  }, [inputMessageRef]);

  // ── Summarize handler ─────────────────────────────────────────────────────
  const handleSummarize = () => {
    if (!selectedDocId) {
      toast({
        title: "No document selected",
        description: "Please select a document from the list below before summarizing.",
        variant: "destructive",
      });
      return;
    }
    // Add user-facing message to indicate summarization started
    const docName = documentsList.find(d => d._id === selectedDocId)?.filename || "document";
    dispatch(addMessage({
      id: Date.now().toString(),
      type: "user",
      content: `Summarize "${docName}" in ${selectedLanguage}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    
    summarize(selectedDocId, "medium", selectedLanguage, ragState?.currentConversationId);
  };

  // ── Send handler ──────────────────────────────────────────────────────────
  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), selectedLanguage, selectedDocId || selectedDocumentId || undefined);
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({ title: "Not supported", description: "Speech recognition is not supported in your browser.", variant: "destructive", duration: 3000 });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsRecording(true);
        toast({ description: "Listening... Speak now", duration: 2000 });
      } catch {
        toast({ title: "Error", description: "Could not start voice input.", variant: "destructive", duration: 3000 });
      }
    }
  };

  const handleFileUpload = (accept: string, type: string) => { setUploadType(type); setShowUploadZone(true); };
  const handleQuickFileSelect = (accept: string) => {
    if (fileInputRef.current) { fileInputRef.current.accept = accept; fileInputRef.current.click(); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) { setAttachedFiles(prev => [...prev, ...Array.from(files)]); await uploadFiles(files); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const truncateName = (name: string, max = 22): string =>
    name.length > max ? name.slice(0, max - 1) + "…" : name;

  const languages = [
    { value: "english", label: "English" }, { value: "hindi", label: "Hindi" },
    { value: "marathi", label: "Marathi" }, { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" }, { value: "gujarati", label: "Gujarati" },
    { value: "bengali", label: "Bengali" }, { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" }, { value: "punjabi", label: "Punjabi" },
  ];

  return (
    <TooltipProvider>
      <div className="bg-background border-t border-border/30">

        {/* ── Context bar: Document pills + Language + TTS + Summarize ─────── */}
        <div className="px-4 py-2 border-b border-border/20">
          <div className="flex items-center gap-3 flex-wrap justify-between min-h-[36px]">

            {/* Left: Document pills */}
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              {docsLoading ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading documents…
                </span>
              ) : documentsList.length === 0 ? (
                <span className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  No documents uploaded yet
                </span>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground/70 font-medium whitespace-nowrap">
                    Documents:
                  </span>
                  {documentsList.map((doc) => {
                    const isSelected = doc._id === selectedDocId;
                    return (
                      <button
                        key={doc._id}
                        onClick={() => setSelectedDocId(doc._id)}
                        title={doc.filename}
                        style={isSelected ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 1px var(--primary)' } : {}}
                        className={[
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          "border transition-all duration-150 cursor-pointer",
                          "max-w-[180px] truncate",
                          isSelected
                            ? "bg-primary/15 text-primary border-primary/60"
                            : "bg-surface-chat/60 text-foreground/75 border-border/40 hover:border-primary/40 hover:text-foreground",
                        ].join(" ")}
                      >
                        <FileCheck2 className={`w-3 h-3 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="truncate">{truncateName(doc.filename)}</span>
                        {/* Radio indicator */}
                        <span
                          className={[
                            "w-2 h-2 rounded-full border flex-shrink-0 ml-0.5",
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/40",
                          ].join(" ")}
                        />
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Right: TTS + Language + Summarize */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <TTSControls />

              {/* Language selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost" size="sm"
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
                        onClick={() => { setSelectedLanguage(lang.value); toast({ description: `Language changed to ${lang.label}`, duration: 2000 }); }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedLanguage === lang.value
                            ? "bg-primary/20 text-primary font-medium"
                            : "hover:bg-[#19222e] hover:text-white text-foreground/80"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Voice Output toggle */}
              <Button
                variant="ghost" size="sm"
                className={`hover:bg-surface-chat/60 rounded-md h-7 px-2 flex items-center gap-1.5 transition-all ${voiceEnabled ? "bg-accent/20" : ""}`}
                onClick={() => { const n = !voiceEnabled; setVoiceEnabled(n); toast({ description: n ? "Voice output enabled" : "Voice output disabled", duration: 2000 }); }}
                disabled={isLoading}
                title={voiceEnabled ? "Voice output enabled" : "Voice output disabled"}
              >
                <Volume2 className={`w-4 h-4 transition-colors ${voiceEnabled ? "text-accent" : "text-foreground/70"}`} />
                <span className="text-xs text-foreground/90">{voiceEnabled ? "On" : "Off"}</span>
              </Button>

              {/* ── SUMMARIZE BUTTON ───────────────────────────────────────── */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSummarize}
                    disabled={summarizeLoading || isLoading || !selectedDocId}
                    className={[
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold",
                      "border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40",
                      summarizeLoading
                        ? "bg-primary/20 text-primary border-primary/40 cursor-not-allowed"
                        : selectedDocId
                          ? "bg-primary/15 text-primary border-primary/50 hover:bg-primary/25 hover:border-primary/70 cursor-pointer"
                          : "bg-surface-chat/40 text-muted-foreground border-border/30 cursor-not-allowed opacity-60",
                    ].join(" ")}
                    id="summarize-btn"
                    aria-label="Summarize selected document"
                  >
                    {summarizeLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Summarizing…
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3 h-3" />
                        Summarize
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {selectedDocId
                    ? `Summarize "${truncateName(documentsList.find(d => d._id === selectedDocId)?.filename || "document")}" in ${languages.find(l => l.value === selectedLanguage)?.label}`
                    : "Select a document first"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* ── Main composer ─────────────────────────────────────────────────── */}
        <div className="px-6 py-3">
          <div className="max-w-5xl mx-auto">
            {/* Attached Files */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-surface-elevated/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-sm">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="h-5 w-5 p-0 hover:bg-destructive/20 rounded-full flex-shrink-0"
                    >
                      <span className="text-muted-foreground hover:text-destructive text-lg leading-none">×</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2 bg-surface-elevated/70 backdrop-blur-sm border border-border/50 rounded-3xl px-2 py-1.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
              {/* Upload dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost" size="sm"
                    className="hover:bg-surface-chat/60 rounded-full w-9 h-9 p-0 flex items-center justify-center flex-shrink-0 transition-all"
                    disabled={isLoading} title="Add content"
                  >
                    <Plus className="w-5 h-5 text-foreground/70 hover:text-primary transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-elevated border-border/50 shadow-xl z-[100]" side="top">
                  <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer" onClick={() => handleFileUpload(".pdf,.doc,.docx,.txt,.xlsx,.xls", "document")}>
                    <Upload className="w-4 h-4 mr-2 text-primary" />
                    <div className="flex flex-col"><span className="font-medium">Upload Document</span><span className="text-xs text-muted-foreground">PDF, Word, Excel, TXT</span></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer" onClick={() => handleFileUpload("image/*", "image")}>
                    <Image className="w-4 h-4 mr-2 text-accent" />
                    <div className="flex flex-col"><span className="font-medium">Upload Image</span><span className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP</span></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer" onClick={() => handleQuickFileSelect("image/*")}>
                    <Camera className="w-4 h-4 mr-2" />
                    <div className="flex flex-col"><span className="font-medium">Take Photo</span><span className="text-xs text-muted-foreground">Use device camera</span></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer" onClick={() => handleFileUpload("audio/*", "audio")}>
                    <AudioLines className="w-4 h-4 mr-2 text-accent" />
                    <div className="flex flex-col"><span className="font-medium">Upload Audio</span><span className="text-xs text-muted-foreground">MP3, WAV, M4A</span></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer" onClick={() => handleFileUpload("video/*", "video")}>
                    <Video className="w-4 h-4 mr-2" />
                    <div className="flex flex-col"><span className="font-medium">Upload Video</span><span className="text-xs text-muted-foreground">MP4, MOV, AVI</span></div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer" onClick={() => setShowLibrary(true)}>
                    <Library className="w-4 h-4 mr-2" />
                    <div className="flex flex-col"><span className="font-medium">File Library</span><span className="text-xs text-muted-foreground">View all uploaded files</span></div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Text area */}
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

              {/* Mic */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="sm"
                    className={`hover:bg-surface-chat/60 rounded-full w-9 h-9 p-0 flex items-center justify-center flex-shrink-0 transition-all ${isRecording ? "bg-destructive/20 text-destructive" : ""}`}
                    onClick={handleMicClick} disabled={isLoading}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    <Mic className={`w-4 h-4 transition-colors ${isRecording ? "animate-pulse text-destructive" : "text-foreground/70 hover:text-accent"}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isRecording ? "Stop recording" : "Start voice input"}</p></TooltipContent>
              </Tooltip>

              {/* Send */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:opacity-90 shadow-sm w-9 h-9 p-0 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all duration-200"
                    title="Send message"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Send message</p></TooltipContent>
              </Tooltip>
            </div>

            {/* Listening indicator */}
            {isListening && (
              <div className="flex items-center justify-center gap-2 mt-2 text-accent animate-fade-in">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-xs font-medium">Listening...</span>
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} aria-label="File upload input" title="File upload input" />

        {/* Upload zone modal */}
        {showUploadZone && (
          <FileUploadZone
            accept={uploadType === "document" ? ".pdf,.doc,.docx,.txt,.xlsx,.xls"
              : uploadType === "image" ? "image/*"
              : uploadType === "audio" ? "audio/*"
              : uploadType === "video" ? "video/*"
              : "*"}
            onClose={() => setShowUploadZone(false)}
            onDocumentUploaded={handleDocumentUploaded}
          />
        )}

        {/* Document library modal */}
        <DocumentLibraryModal isOpen={showLibrary} onClose={() => setShowLibrary(false)} />
      </div>
    </TooltipProvider>
  );
};

export default ChatComposer;