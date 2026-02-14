import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: true,
    language: "english",
    voiceInput: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem("rag_settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...settings, ...parsed });
        } catch (error) {
          console.error("Failed to parse saved settings:", error);
        }
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("rag_settings", JSON.stringify(settings));
      
      // Apply theme if changed
      if (settings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "An error occurred while saving your settings",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm text-secondary-muted cursor-pointer">
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm text-secondary-muted cursor-pointer">
                Enable Notifications
              </Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* General */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">General</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="text-sm text-secondary-muted cursor-pointer">
                Auto-save Chats
              </Label>
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="voice-input" className="text-sm text-secondary-muted cursor-pointer">
                Voice Input
              </Label>
              <Switch
                id="voice-input"
                checked={settings.voiceInput}
                onCheckedChange={(checked) => setSettings({ ...settings, voiceInput: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm text-secondary-muted">
                Preferred Language
              </Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="bg-surface-elevated border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-elevated border-border">
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="marathi">Marathi</SelectItem>
                  <SelectItem value="gujarati">Gujarati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-gradient-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
