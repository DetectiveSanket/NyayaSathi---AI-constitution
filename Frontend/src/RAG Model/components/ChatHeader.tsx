import { useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Home, Share, Download, Settings, ChevronDown, FileDown, FileText, FileSearch, Languages } from "lucide-react";
import ModelSelectionModal from "./ModelSelectionModal";
import { SettingsModal } from "./SettingsModal";
import { useToast } from "../hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { useSummarize } from "../../hooks/useSummarize.js";
import { useSelector } from "react-redux";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface ChatHeaderProps {
  onExportChat?: (format: 'txt' | 'pdf') => void;
  lastMode?: "auto" | "contextual" | null;
  selectedDocumentId?: string | null;
}

const ChatHeader = ({ onExportChat, lastMode, selectedDocumentId }: ChatHeaderProps = {}) => {
  const [selectedModel, setSelectedModel] = useState("legal-ai-v1");
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummarizeOpen, setIsSummarizeOpen] = useState(false);
  const [summaryLength, setSummaryLength] = useState<"short" | "medium" | "detailed">("short");
  const [summaryLanguage, setSummaryLanguage] = useState("english");
  const { toast } = useToast();
  const ragState = useSelector((state: any) => state.rag);

  const { summarize, loading: summarizeLoading } = useSummarize({
    onSuccess: (result) => {
      toast({
        title: "Summary generated",
        description: `Document summarized successfully (${result.chunksUsed} chunks used)`,
      });
      setIsSummarizeOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Summarization failed",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    },
  });

  const handleSummarize = () => {
    if (!selectedDocumentId) {
      toast({
        title: "No document selected",
        description: "Please select a document first",
        variant: "destructive",
      });
      return;
    }
    summarize(selectedDocumentId, summaryLength, summaryLanguage);
  };

  const getModelDisplayName = (modelId: string) => {
    const modelNames: Record<string, string> = {
      "legal-ai-v1": "Legal-AI v1",
      "legal-ai-pro": "Legal-AI Pro",
      "marathi-docgpt": "Marathi-DocGPT",
      "contract-analyzer": "Contract Analyzer"
    };
    return modelNames[modelId] || modelId;
  };

  return (
    <TooltipProvider>
      <header className="h-16 bg-surface border-b border-border flex items-center px-6 justify-between">
        {/* Left side - Home link with logo */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="text-sm font-medium hover:bg-surface-elevated">
            <Home className="w-4 h-4 mr-2" />
            NyayaSathi
          </Button>
        </div>

      {/* Center-right - Model selector and Mode indicator */}
      <div className="flex items-center flex-1 justify-center gap-3">
        {lastMode && (
          <Badge 
            variant={lastMode === "auto" ? "secondary" : "default"}
            className="text-xs"
          >
            {lastMode === "auto" ? "⚡ Auto Mode" : "🔍 Contextual Mode"}
          </Badge>
        )}
        <Button
          onClick={() => setIsModelModalOpen(true)}
          variant="outline"
          className="min-w-[280px] max-w-[320px] bg-surface-elevated border-border hover:bg-surface-chat transition-colors h-10 px-3"
        >
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm text-zinc-600 whitespace-nowrap">Model:</span>
              <span className="text-sm font-medium text-foreground truncate">{getModelDisplayName(selectedModel)}</span>
              {selectedModel === "legal-ai-v1" && (
                <Badge className="bg-accent text-accent-foreground border-0 text-xs px-2 py-0 whitespace-nowrap flex-shrink-0">
                  Recommended
                </Badge>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </Button>
      </div>

      <ModelSelectionModal
        open={isModelModalOpen}
        onOpenChange={setIsModelModalOpen}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-2">
        <Dialog open={isSummarizeOpen} onOpenChange={setIsSummarizeOpen}>
          <DialogTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-surface-elevated focus-ring"
                  aria-label="Summarize document"
                  disabled={!selectedDocumentId}
                >
                  <FileSearch className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Summarize document</p>
              </TooltipContent>
            </Tooltip>
          </DialogTrigger>
          <DialogContent className="bg-surface-elevated border-border">
            <DialogHeader>
              <DialogTitle>Summarize Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Summary Length</label>
                <Select value={summaryLength} onValueChange={(v: any) => setSummaryLength(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={summaryLanguage} onValueChange={setSummaryLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="marathi">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSummarize} 
                disabled={summarizeLoading || !selectedDocumentId}
                className="w-full"
              >
                {summarizeLoading ? "Generating..." : "Generate Summary"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-surface-elevated focus-ring"
              aria-label="Share conversation"
            >
              <Share className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share conversation</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-surface-elevated focus-ring"
                  aria-label="Export conversation"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export conversation</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="bg-surface-elevated border-border/50 shadow-xl" align="end">
            <DropdownMenuItem 
              className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
              onClick={() => {
                if (onExportChat) {
                  onExportChat('txt');
                }
              }}
            >
              <FileText className="w-4 h-4 mr-2 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">Export as TXT</span>
                <span className="text-xs text-muted-foreground">Plain text format</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer"
              onClick={() => {
                if (onExportChat) {
                  onExportChat('pdf');
                }
              }}
            >
              <FileDown className="w-4 h-4 mr-2 text-accent" />
              <div className="flex flex-col">
                <span className="font-medium">Export as PDF</span>
                <span className="text-xs text-muted-foreground">Formatted with timestamps</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-surface-elevated focus-ring"
              aria-label="Settings"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
    </TooltipProvider>
  );
};

export default ChatHeader;