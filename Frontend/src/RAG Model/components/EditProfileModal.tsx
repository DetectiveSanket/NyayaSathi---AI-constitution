import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "../hooks/use-toast";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

import { Camera } from "lucide-react";
import { updateProfile } from "../../features/auth/authThunks.js";
import { setUserName } from "../../store/ragSlice.js";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const dispatch = useDispatch();
  const authState = useSelector((state: any) => state.auth) || {};
  const user = authState?.user || {};
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    organization: user?.organization || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        organization: user.organization || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(updateProfile(formData)).unwrap();
      // Update RAG state with new name
      dispatch(setUserName(result.name || formData.name));
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        duration: 3000,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.message || "Failed to update profile",
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
          <DialogTitle className="text-2xl font-semibold text-foreground">Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar || ""} alt="User" />
                <AvatarFallback className="bg-blue-600 text-primary-foreground text-2xl">
                  {(formData.name || user?.name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                onClick={() => {
                  toast({
                    description: "Avatar upload coming soon",
                    duration: 2000,
                  });
                }}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-zinc-500">Click to upload profile picture</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-surface-elevated border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-surface-elevated border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-surface-elevated border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="text-sm font-medium text-foreground">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="bg-surface-elevated border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-gradient-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
