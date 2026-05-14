import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, FileText, Trash2, Eye } from "lucide-react";
import { FilePreviewModal } from "./FilePreviewModal";
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
import { getLibraryFiles, deleteLibraryFile, getLibraryStats } from "../../services/libraryService.js";
import { useToast } from "../hooks/use-toast";

export type LibraryFileRow = {
  _id: string;
  documentId?: string | null;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url?: string;
  fileType: string;
  uploadedAt: string;
};

/** Drag payload prefix — keep in sync with ChatComposer drop handler */
export const LIBRARY_DND_PREFIX = "nyayasathi-library:";

function formatBytes(bytes: number): string {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) {
    const kb = n / 1024;
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function fileTypeEmoji(fileType: string): string {
  switch (fileType) {
    case "document":
      return "📄";
    case "image":
      return "🖼️";
    case "audio":
      return "🎵";
    case "video":
      return "🎬";
    default:
      return "📎";
  }
}

interface DocumentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when user clicks a row or chooses to attach — parent can merge into composer */
  onInsertToChat?: (file: LibraryFileRow) => void;
  isAuthenticated?: boolean;
}

export const DocumentLibraryModal = ({
  isOpen,
  onClose,
  onInsertToChat,
  isAuthenticated = false,
}: DocumentLibraryModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");
  const [files, setFiles] = useState<LibraryFileRow[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [listTotal, setListTotal] = useState(0);
  const [stats, setStats] = useState<{ total: number; totalSize: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<LibraryFileRow | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const { toast } = useToast();

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setFiles([]);
      setStats(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ft = fileTypeFilter === "all" ? undefined : fileTypeFilter;
      const [statsRes, listRes] = await Promise.all([
        getLibraryStats(),
        getLibraryFiles(ft, page, 20),
      ]);
      setStats({
        total: statsRes.total ?? 0,
        totalSize: statsRes.totalSize ?? 0,
      });
      setFiles((listRes.files || []) as LibraryFileRow[]);
      setListTotal(listRes.total ?? 0);
      setTotalPages(listRes.totalPages ?? 0);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fileTypeFilter, page]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    setPage(1);
  }, [isOpen, fileTypeFilter]);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, loadData]);

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.originalName.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      await deleteLibraryFile(fileToDelete);
      setFileToDelete(null);
      window.dispatchEvent(new CustomEvent("library-changed"));
      await loadData();
    } catch (e: any) {
      setError(e?.message || "Delete failed");
      setFileToDelete(null);
    }
  };

  const handleRowClick = (file: LibraryFileRow) => {
    if (onInsertToChat) onInsertToChat(file);
  };

  const dragPayload = (file: LibraryFileRow) =>
    `${LIBRARY_DND_PREFIX}${JSON.stringify({
      _id: file._id,
      originalName: file.originalName,
      s3Url: file.s3Url,
      documentId: file.documentId,
      mimeType: file.mimeType,
    })}`;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-5xl max-h-[85vh] bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-foreground">File Library</DialogTitle>
          </DialogHeader>

          {!isAuthenticated ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sign in to view your saved files across all conversations.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-muted" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-surface-elevated border-border focus:border-primary"
                  />
                </div>

                <Select
                  value={fileTypeFilter}
                  onValueChange={(v) => {
                    setPage(1);
                    setFileTypeFilter(v);
                  }}
                >
                  <SelectTrigger className="w-48 bg-surface-elevated border-border">
                    <SelectValue placeholder="All folders" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-border">
                    <SelectItem value="all">All folders</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {stats?.total ?? 0} files <span className="opacity-60">•</span>{" "}
                  {formatBytes(stats?.totalSize ?? 0)} total
                </span>
                {fileTypeFilter !== "all" && (
                  <span className="text-xs opacity-70">
                    Showing {listTotal} in this filter (page {page}
                    {totalPages > 1 ? ` / ${totalPages}` : ""})
                  </span>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground flex flex-wrap items-center justify-between gap-2">
                  <span>Failed to load library. Try again.</span>
                  <Button size="sm" variant="outline" onClick={() => loadData()}>
                    Retry
                  </Button>
                </div>
              )}

              <div className="space-y-2 overflow-y-auto max-h-[50vh] scrollbar-custom">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-lg bg-surface-elevated border border-border animate-pulse"
                      >
                        <div className="h-12 w-12 rounded-lg bg-muted/30" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted/30 rounded w-2/3" />
                          <div className="h-3 bg-muted/20 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No files found</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <div
                      key={file._id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", dragPayload(file));
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated border border-border hover:border-primary/50 transition-all group cursor-pointer"
                      onClick={() => handleRowClick(file)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          handleRowClick(file);
                        }
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="text-2xl select-none" aria-hidden>
                          {fileTypeEmoji(file.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{file.originalName}</h4>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-secondary-muted">{formatBytes(file.size)}</span>
                            <span className="text-xs text-secondary-muted">
                              {file.uploadedAt
                                ? formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!file.s3Url) {
                              toast({
                                title: "Preview unavailable",
                                description: "This file has no public URL configured.",
                                variant: "destructive",
                              });
                              return;
                            }
                            setPreviewFile(file);
                          }}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileToDelete(file._id);
                          }}
                          title="Remove from library"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!loading && totalPages > 1 && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FilePreviewModal
        file={
          previewFile
            ? ({
                id: previewFile._id,
                name: previewFile.originalName,
                type: previewFile.mimeType,
                size: previewFile.size,
                url: previewFile.s3Url || "",
                uploadedAt: new Date(previewFile.uploadedAt),
                category: previewFile.fileType,
              } as any)
            : null
        }
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent className="bg-surface-elevated border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remove from library?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              The file will be hidden from your library. It is not removed from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface-chat border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentLibraryModal;
