import { useState } from "react";
import { Camera, Check, Image as ImageIcon, Link as LinkIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAts } from "@/lib/ats-store";

interface ProfilePictureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_AVATARS = [
  {
    id: "preset-1",
    label: "Professional 1",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&fit=crop&crop=face",
  },
  {
    id: "preset-2",
    label: "Professional 2",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=face",
  },
  {
    id: "preset-3",
    label: "Professional 3",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&h=250&fit=crop&crop=face",
  },
  {
    id: "preset-4",
    label: "Professional 4",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&h=250&fit=crop&crop=face",
  },
  {
    id: "preset-5",
    label: "Professional 5",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&h=250&fit=crop&crop=face",
  },
  {
    id: "preset-6",
    label: "Professional 6",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&h=250&fit=crop&crop=face",
  },
  {
    id: "preset-7",
    label: "Tech Specialist 1",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&h=250&fit=crop&crop=face",
  },
  {
    id: "preset-8",
    label: "Tech Specialist 2",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&h=250&fit=crop&crop=face",
  },
];

export function ProfilePictureModal({ open, onOpenChange }: ProfilePictureModalProps) {
  const { currentUser, updateCandidateProfile } = useAts();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser.avatar);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("presets");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedAvatar(dataUrl);
        toast.success("Image uploaded! Click 'Save Profile Picture' to confirm.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!selectedAvatar) {
      toast.error("Please select or upload a profile image");
      return;
    }
    updateCandidateProfile({ avatar: selectedAvatar });
    toast.success("Profile picture updated successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Update Profile Picture</DialogTitle>
              <DialogDescription className="text-xs">
                Upload a headshot, select a verified preset avatar, or provide an image URL.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Live Preview Avatar */}
        <div className="my-2 flex flex-col items-center justify-center p-4 rounded-xl bg-muted/30 border border-dashed border-border/80">
          <div className="relative">
            <img
              src={selectedAvatar || currentUser.avatar}
              alt="Profile Preview"
              className="h-24 w-24 rounded-full border-4 border-[#caaa98]/40 object-cover shadow-md bg-muted"
            />
            <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-[10px]">
              ✓
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-foreground">{currentUser.name}</p>
          <p className="text-[11px] text-muted-foreground">{currentUser.title}</p>
        </div>

        {/* Options Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="presets" className="text-xs">
              <ImageIcon className="h-3.5 w-3.5 mr-1" /> Presets
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs">
              <Upload className="h-3.5 w-3.5 mr-1" /> Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs">
              <LinkIcon className="h-3.5 w-3.5 mr-1" /> Image URL
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Preset Avatars */}
          <TabsContent value="presets" className="mt-3">
            <p className="text-[11px] text-muted-foreground mb-2">
              Select one of our curated executive persona avatars:
            </p>
            <div className="grid grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto p-1">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedAvatar(preset.url)}
                  className={`group relative rounded-xl border p-1 transition flex flex-col items-center hover:border-primary ${
                    selectedAvatar === preset.url
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <span className="mt-1 text-[10px] font-medium text-foreground truncate w-full text-center">
                    {preset.label}
                  </span>
                  {selectedAvatar === preset.url && (
                    <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px]">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: Upload File */}
          <TabsContent value="upload" className="mt-3 space-y-3">
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center cursor-pointer hover:bg-accent/40 transition">
              <Upload className="h-8 w-8 text-primary mb-2" />
              <span className="text-xs font-semibold text-foreground">Click to upload photo</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                PNG, JPG, or WebP (Max 5MB)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </TabsContent>

          {/* TAB 3: Direct URL */}
          <TabsContent value="url" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="avatar-url" className="text-xs font-medium">
                Direct Image Link (HTTPS)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="avatar-url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="text-xs h-9"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!customUrl.startsWith("http")) {
                      toast.error("Please enter a valid HTTP or HTTPS URL");
                      return;
                    }
                    setSelectedAvatar(customUrl);
                    toast.success("Custom image URL applied to preview!");
                  }}
                  className="text-xs whitespace-nowrap"
                >
                  Apply
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Paste any publicly accessible image link from LinkedIn, GitHub, or Unsplash.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-2 pt-2 border-t flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="text-xs bg-primary text-primary-foreground font-semibold"
          >
            Save Profile Picture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
