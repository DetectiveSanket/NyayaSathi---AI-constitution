import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { UploadedFile } from "@/contexts/FileManagerContext";

interface FilePreviewModalProps {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal = ({ file, isOpen, onClose }: FilePreviewModalProps) => {
  if (!file) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const renderPreview = () => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg"
        />
      );
    }
    
    if (file.type.startsWith("video/")) {
      return (
        <video
          src={file.url}
          controls
          className="max-w-full max-h-[60vh] mx-auto rounded-lg"
        />
      );
    }
    
    if (file.type.startsWith("audio/")) {
      return (
        <div className="flex items-center justify-center p-12">
          <audio src={file.url} controls className="w-full max-w-md" />
        </div>
      );
    }
    
    if (file.type === "application/pdf") {
      return (
        <iframe
          src={file.url}
          className="w-full h-[60vh] rounded-lg"
          title={file.name}
        />
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground mb-4">
          Preview not available for this file type
        </p>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download to view
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground">{file.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.category}
          </p>
        </DialogHeader>
        
        <div className="overflow-auto scrollbar-custom">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
