import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, FileText, Download, Trash2, Eye, Filter, FolderOpen, FolderPlus, Share2 } from "lucide-react";
import { useFileManager } from "../contexts/FileManagerContext";
import { FilePreviewModal } from "./FilePreviewModal";
import { FileShareModal } from "./FileShareModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

interface DocumentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentLibraryModal = ({ isOpen, onClose }: DocumentLibraryModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [shareFile, setShareFile] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  
  const { files, folders, deleteFile, moveToFolder, createFolder } = useFileManager();

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleDownload = (file: any) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName("");
      setShowNewFolderDialog(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-foreground">File Library</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-muted" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface-elevated border-border focus:border-primary"
                />
              </div>
              
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-48 bg-surface-elevated border-border">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All folders" />
                </SelectTrigger>
                <SelectContent className="bg-surface-elevated border-border">
                  <SelectItem value="all">All folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowNewFolderDialog(true)}
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{filteredFiles.length} files</span>
              <span>•</span>
              <span>{(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB total</span>
            </div>

            {/* Files List */}
            <div className="space-y-2 overflow-y-auto max-h-[50vh] scrollbar-custom">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No files found</p>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated border border-border hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">{file.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary" className="text-xs">{file.category}</Badge>
                          <span className="text-xs text-secondary-muted">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <span className="text-xs text-secondary-muted">
                            {file.uploadedAt.toLocaleDateString()}
                          </span>
                          {file.folder && (
                            <Badge variant="outline" className="text-xs">
                              <FolderOpen className="w-3 h-3 mr-1" />
                              {file.folder}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setPreviewFile(file)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(file)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-primary"
                        onClick={() => setShareFile(file)}
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      
                      <Select
                        value={file.folder || "none"}
                        onValueChange={(folder) => moveToFolder(file.id, folder)}
                      >
                        <SelectTrigger className="h-8 w-24 text-xs">
                          <SelectValue placeholder="Move" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-elevated border-border">
                          {folders.map(folder => (
                            <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setFileToDelete(file.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* File Share Modal */}
      <FileShareModal
        file={shareFile}
        isOpen={!!shareFile}
        onClose={() => setShareFile(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent className="bg-surface-elevated border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete file?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. The file will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface-chat border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (fileToDelete) deleteFile(fileToDelete);
                setFileToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Folder Dialog */}
      <AlertDialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <AlertDialogContent className="bg-surface-elevated border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Create New Folder</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Enter a name for the new folder
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="bg-surface-chat border-border"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface-chat border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-foreground"
              onClick={handleCreateFolder}
            >
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentLibraryModal;
