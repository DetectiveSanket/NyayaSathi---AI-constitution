import { useCallback, useState } from "react";
import { useFileManager } from "../contexts/FileManagerContext";
import { Upload, File, X } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { cn } from "@/lib/utils";
import { useDocumentUpload } from "../../hooks/useDocumentUpload.js";
import { useDispatch } from "react-redux";
import { addDocument } from "../../store/ragSlice.js";
import { useToast } from "../hooks/use-toast";

interface FileUploadZoneProps {
  accept?: string;
  maxFiles?: number;
  onClose?: () => void;
}

export const FileUploadZone = ({ accept, maxFiles = 10, onClose }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFiles, uploadProgress } = useFileManager();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { uploadAndProcess, loading: processing, progress: uploadProgressValue } = useDocumentUpload({
    onSuccess: (result) => {
      toast({
        title: "Document processed",
        description: `Document uploaded and processed successfully (${result.chunksCount} chunks)`,
      });
      // Add to documents list
      dispatch(addDocument({
        _id: result.documentId,
        filename: "Uploaded Document",
        processed: true,
      }));
      if (onClose) onClose();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload and process document",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    // For document files (PDF, DOCX), use RAG upload flow
    const documentFiles = files.filter(f => 
      f.type === "application/pdf" || 
      f.type.includes("wordprocessingml") || 
      f.type.includes("msword")
    );
    
    if (documentFiles.length > 0) {
      // Use RAG document upload for PDF/DOCX
      for (const file of documentFiles) {
        await uploadAndProcess(file);
      }
    } else {
      // Use regular file manager for other files
      await uploadFiles(files);
    }
  }, [uploadFiles, maxFiles, uploadAndProcess]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      
      // For document files (PDF, DOCX), use RAG upload flow
      const documentFiles = filesArray.filter(f => 
        f.type === "application/pdf" || 
        f.type.includes("wordprocessingml") || 
        f.type.includes("msword")
      );
      
      if (documentFiles.length > 0) {
        // Use RAG document upload for PDF/DOCX
        for (const file of documentFiles) {
          await uploadAndProcess(file);
        }
      } else {
        // Use regular file manager for other files
        await uploadFiles(files);
      }
    }
  }, [uploadFiles, uploadAndProcess]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-elevated border border-border rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Upload Files</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-surface-chat transition-colors"
            >
              <X className="w-5 h-5 text-foreground/70" />
            </button>
          )}
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-all",
            isDragging
              ? "border-primary bg-primary/5 scale-105"
              : "border-border hover:border-primary/50 hover:bg-surface-chat/50"
          )}
        >
          <Upload className={cn(
            "w-12 h-12 mx-auto mb-4 transition-colors",
            isDragging ? "text-primary" : "text-foreground/50"
          )} />
          <p className="text-foreground font-medium mb-2">
            Drag and drop files here
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            or click to browse
          </p>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 cursor-pointer transition-opacity"
          >
            <Upload className="w-4 h-4" />
            Choose Files
          </label>
          <p className="text-xs text-muted-foreground mt-3">
            Maximum {maxFiles} files, 50MB per file
          </p>
        </div>

        {/* Upload Progress */}
        {(uploadProgress.length > 0 || processing) && (
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-custom">
            {processing && (
              <div className="flex items-center gap-3 p-3 bg-surface-chat rounded-md">
                <File className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    Processing document...
                  </p>
                  <Progress value={uploadProgressValue} className="h-1.5 mt-1" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {uploadProgressValue}%
                </span>
              </div>
            )}
            {uploadProgress.map((progress) => (
              <div
                key={progress.fileId}
                className="flex items-center gap-3 p-3 bg-surface-chat rounded-md"
              >
                <File className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {progress.fileId.split('-').slice(1).join('-')}
                  </p>
                  <Progress value={progress.progress} className="h-1.5 mt-1" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {progress.progress}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
