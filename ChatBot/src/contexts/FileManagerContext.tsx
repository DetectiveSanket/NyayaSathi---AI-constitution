import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ShareSettings {
  shareId?: string;
  allowDownload: boolean;
  allowPreview: boolean;
  expirationDate?: Date;
  password?: string;
  shareLink?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  category: string;
  folder?: string;
  file: File;
  shareSettings?: ShareSettings;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: "uploading" | "complete" | "error";
}

interface FileManagerContextType {
  files: UploadedFile[];
  uploadProgress: UploadProgress[];
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  deleteFile: (fileId: string) => void;
  moveToFolder: (fileId: string, folder: string) => void;
  getFilesByFolder: (folder?: string) => UploadedFile[];
  folders: string[];
  createFolder: (folderName: string) => void;
  updateFileShare: (fileId: string, shareSettings: ShareSettings) => void;
}

const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error("useFileManager must be used within FileManagerProvider");
  }
  return context;
};

export const FileManagerProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [folders, setFolders] = useState<string[]>(["Documents", "Images", "Audio", "Video", "Other"]);
  const { toast } = useToast();

  const categorizeFile = (file: File): string => {
    const type = file.type;
    if (type.startsWith("image/")) return "Images";
    if (type.startsWith("audio/")) return "Audio";
    if (type.startsWith("video/")) return "Video";
    if (type.includes("pdf") || type.includes("document") || type.includes("text")) return "Documents";
    return "Other";
  };

  const uploadFiles = useCallback(async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    
    // Validate file sizes (max 50MB per file)
    const maxSize = 50 * 1024 * 1024;
    const invalidFiles = filesArray.filter(f => f.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast({
        title: "File too large",
        description: `${invalidFiles.length} file(s) exceed 50MB limit`,
        variant: "destructive",
      });
      return;
    }

    // Initialize progress for all files
    const progressEntries = filesArray.map(file => ({
      fileId: `${Date.now()}-${file.name}`,
      progress: 0,
      status: "uploading" as const,
    }));
    setUploadProgress(prev => [...prev, ...progressEntries]);

    // Simulate upload with progress
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const fileId = progressEntries[i].fileId;
      
      try {
        // Create object URL for preview
        const url = URL.createObjectURL(file);
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev =>
            prev.map(p => p.fileId === fileId ? { ...p, progress } : p)
          );
        }

        // Add to files list
        const uploadedFile: UploadedFile = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          url,
          uploadedAt: new Date(),
          category: categorizeFile(file),
          file,
        };

        setFiles(prev => [...prev, uploadedFile]);
        
        // Mark as complete
        setUploadProgress(prev =>
          prev.map(p => p.fileId === fileId ? { ...p, status: "complete" } : p)
        );

        toast({
          title: "Upload complete",
          description: `${file.name} uploaded successfully`,
        });
      } catch (error) {
        setUploadProgress(prev =>
          prev.map(p => p.fileId === fileId ? { ...p, status: "error" } : p)
        );
        
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    // Clear completed progress after 2 seconds
    setTimeout(() => {
      setUploadProgress(prev => 
        prev.filter(p => p.status !== "complete")
      );
    }, 2000);
  }, [toast]);

  const deleteFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      URL.revokeObjectURL(file.url);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        description: "File deleted successfully",
      });
    }
  }, [files, toast]);

  const moveToFolder = useCallback((fileId: string, folder: string) => {
    setFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, folder } : f)
    );
    toast({
      description: `Moved to ${folder}`,
    });
  }, [toast]);

  const getFilesByFolder = useCallback((folder?: string) => {
    if (!folder) return files;
    return files.filter(f => f.folder === folder);
  }, [files]);

  const createFolder = useCallback((folderName: string) => {
    if (!folders.includes(folderName)) {
      setFolders(prev => [...prev, folderName]);
      toast({
        description: `Folder "${folderName}" created`,
      });
    }
  }, [folders, toast]);

  const updateFileShare = useCallback((fileId: string, shareSettings: ShareSettings) => {
    setFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, shareSettings } : f)
    );
    toast({
      description: "Share settings updated",
    });
  }, [toast]);

  return (
    <FileManagerContext.Provider
      value={{
        files,
        uploadProgress,
        uploadFiles,
        deleteFile,
        moveToFolder,
        getFilesByFolder,
        folders,
        createFolder,
        updateFileShare,
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
};
