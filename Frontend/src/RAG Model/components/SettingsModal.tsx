import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import api from "../../services/api.js";
import { SET_PASSWORD_URL } from "../../utils/api.js";
import { fetchProfile } from "../../features/auth/authThunks.js";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: { auth?: { user?: { authProvider?: string } } }) => state.auth?.user);
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: true,
    language: "english",
    voiceInput: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const { toast } = useToast();

  const showSetPassword = authUser?.authProvider === "google";

  useEffect(() => {
    if (!isOpen) {
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

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

  const handleSetPassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setPasswordSaving(true);
    try {
      await api.post(SET_PASSWORD_URL, { password: newPassword });
      await dispatch(fetchProfile() as any);
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password saved", description: "You can now sign in with email and password as well." });
    } catch (e: any) {
      toast({
        title: "Could not set password",
        description: e.response?.data?.message || e.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
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

          {showSetPassword && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Account</h3>
                <p className="text-xs text-secondary-muted">
                  Add a password so you can sign in without Google on any device.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="set-pw" className="text-sm text-secondary-muted">
                    New password
                  </Label>
                  <Input
                    id="set-pw"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-surface-elevated border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set-pw2" className="text-sm text-secondary-muted">
                    Confirm password
                  </Label>
                  <Input
                    id="set-pw2"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-surface-elevated border-border"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={passwordSaving}
                  onClick={handleSetPassword}
                >
                  {passwordSaving ? "Saving…" : "Set password"}
                </Button>
              </div>
              <Separator className="bg-border" />
            </>
          )}

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
