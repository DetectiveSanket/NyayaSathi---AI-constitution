import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Share2, Clock, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UploadedFile } from "@/contexts/FileManagerContext";

interface FileShareModalProps {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FileShareModal = ({ file, isOpen, onClose }: FileShareModalProps) => {
  const [shareSettings, setShareSettings] = useState({
    allowDownload: true,
    allowPreview: true,
    expirationDays: "7",
    password: "",
    requirePassword: false,
  });
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareLink = () => {
    if (!file) return;
    
    // Generate a unique share ID
    const shareId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/share/${shareId}`;
    
    setShareLink(link);
    
    toast({
      title: "Share link generated",
      description: "Link copied to clipboard",
    });
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const getExpirationDate = () => {
    const days = parseInt(shareSettings.expirationDays);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString();
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share File
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Info */}
          <div className="p-3 bg-surface-elevated rounded-lg border border-border">
            <p className="font-medium text-foreground truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.category}
            </p>
          </div>

          {/* Share Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-foreground/70" />
                <Label htmlFor="allow-download" className="text-sm">Allow downloads</Label>
              </div>
              <Switch
                id="allow-download"
                checked={shareSettings.allowDownload}
                onCheckedChange={(checked) =>
                  setShareSettings({ ...shareSettings, allowDownload: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-foreground/70" />
                <Label htmlFor="allow-preview" className="text-sm">Allow preview</Label>
              </div>
              <Switch
                id="allow-preview"
                checked={shareSettings.allowPreview}
                onCheckedChange={(checked) =>
                  setShareSettings({ ...shareSettings, allowPreview: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration" className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-foreground/70" />
                Link expires in
              </Label>
              <Select
                value={shareSettings.expirationDays}
                onValueChange={(value) =>
                  setShareSettings({ ...shareSettings, expirationDays: value })
                }
              >
                <SelectTrigger className="bg-surface-elevated border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-elevated border-border">
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
              {shareSettings.expirationDays !== "never" && (
                <p className="text-xs text-muted-foreground">
                  Expires on {getExpirationDate()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="require-password" className="text-sm">Password protection</Label>
                <Switch
                  id="require-password"
                  checked={shareSettings.requirePassword}
                  onCheckedChange={(checked) =>
                    setShareSettings({ ...shareSettings, requirePassword: checked })
                  }
                />
              </div>
              {shareSettings.requirePassword && (
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={shareSettings.password}
                  onChange={(e) =>
                    setShareSettings({ ...shareSettings, password: e.target.value })
                  }
                  className="bg-surface-elevated border-border"
                />
              )}
            </div>
          </div>

          {/* Generated Link */}
          {shareLink && (
            <div className="space-y-2">
              <Label className="text-sm">Share link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="bg-surface-elevated border-border font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!shareLink ? (
            <Button onClick={generateShareLink} className="gap-2">
              <Share2 className="w-4 h-4" />
              Generate Link
            </Button>
          ) : (
            <Button onClick={copyToClipboard} className="gap-2">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
