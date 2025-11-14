import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Model {
  id: string;
  name: string;
  description: string;
  speed: "Fast" | "Moderate" | "Slow";
  pricing: "Standard" | "Premium" | "Enterprise";
  tags: string[];
  recommended?: boolean;
}

interface ModelSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

const models: Model[] = [
  {
    id: "legal-ai-v1",
    name: "Legal-AI v1",
    description: "Specialized for Indian legal documents and case law",
    speed: "Fast",
    pricing: "Standard",
    tags: ["Legal", "Indian Law", "General Purpose"],
    recommended: true
  },
  {
    id: "legal-ai-pro",
    name: "Legal-AI Pro",
    description: "Advanced model with enhanced reasoning for complex legal analysis",
    speed: "Moderate",
    pricing: "Premium",
    tags: ["Advanced", "Complex Analysis", "Research"]
  },
  {
    id: "marathi-docgpt",
    name: "Marathi-DocGPT",
    description: "Optimized for Marathi language legal documents",
    speed: "Fast",
    pricing: "Standard",
    tags: ["Marathi", "Documents", "Translation"]
  },
  {
    id: "contract-analyzer",
    name: "Contract Analyzer",
    description: "Specialized in contract review and risk assessment",
    speed: "Moderate",
    pricing: "Premium",
    tags: ["Contracts", "Risk Analysis", "Business"]
  }
];

const ModelSelectionModal = ({ open, onOpenChange, selectedModel, onSelectModel }: ModelSelectionModalProps) => {
  const { toast } = useToast();
  
  const handleSelectModel = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    onSelectModel(modelId);
    toast({
      description: `Switched to ${model?.name}`,
      duration: 2000,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-surface border-border p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-2xl font-semibold text-foreground">Select Model</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-100px)] px-6 py-4">
          <div className="space-y-4 pb-4">
            {models.map((model) => {
              const isSelected = selectedModel === model.id;
              
              return (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:border-primary/50 hover:shadow-md ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-lg" 
                      : "border-border/50 bg-surface-elevated/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Model name and badge */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">{model.name}</h3>
                        {model.recommended && (
                          <Badge className="bg-accent text-accent-foreground border-0 px-2.5 py-0.5">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {model.description}
                      </p>
                      
                      {/* Speed and Pricing */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-foreground/80">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{model.speed}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground/80">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{model.pricing}</span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {model.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelectionModal;