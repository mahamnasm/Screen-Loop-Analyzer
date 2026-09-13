import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Github,
  Info,
  Layers,
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CareerBridgeLogo } from "./CareerBridgeBranding";

interface MobileAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileAppDownloadModal({ open, onOpenChange }: MobileAppModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone app
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Installing Screenloop ATS to your mobile device!");
        setDeferredPrompt(null);
      }
    } else {
      toast.info("Instant Mobile Install Instructions", {
        description: "Open this site on Android Chrome, tap the 3 dots menu ⋮, and select 'Install App' or 'Add to Home Screen'.",
      });
    }
  };

  const apkDownloadUrl = "https://github.com/mahamnasm/Screen-Loop-Analyzer/releases";
  const actionsUrl = "https://github.com/mahamnasm/Screen-Loop-Analyzer/actions";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border-[#caaa98]/40 bg-[#fbf9f6] dark:bg-[#182035] text-foreground">
        {/* Header with Executive Brand Horizon */}
        <div className="bg-gradient-to-r from-[#182035] via-[#202940] to-[#182035] text-white p-6 relative overflow-hidden border-b border-[#caaa98]/30">
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#caaa98] to-[#dfbeaa] text-[#202940] shadow-md p-2">
              <Smartphone className="h-full w-full text-[#202940]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-white">
                  Screenloop ATS Mobile
                </span>
                <Badge className="bg-[#caaa98]/20 text-[#caaa98] border border-[#caaa98]/50 text-[10px] font-mono">
                  Android .APK v1.0
                </Badge>
              </div>
              <p className="text-xs text-[#c2ccdf] mt-0.5">
                Native Android Application & Progressive Web App (PWA)
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Option 1: Direct APK Download via GitHub Release */}
          <div className="rounded-2xl border border-[#caaa98]/40 bg-white dark:bg-[#202940] p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-[#202940] dark:text-white font-display">
                  <Download className="h-4 w-4 text-emerald-600" />
                  Option 1: Download Android .APK Package
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Built automatically via official GitHub Actions workflow from the native <code className="font-mono text-[#4b4038] dark:text-[#caaa98]">android/</code> Studio codebase.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shrink-0">
                Ready to Sideload
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => window.open(apkDownloadUrl, "_blank")}
                className="h-9 text-xs gap-2 bg-[#202940] hover:bg-[#182035] text-white font-semibold"
              >
                <Github className="h-3.5 w-3.5" />
                <span>Download .APK from Releases</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(actionsUrl, "_blank")}
                className="h-9 text-xs gap-1.5 border-border"
              >
                <span>View Live CI/CD Build Runs</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </Button>
            </div>

            <div className="rounded-xl bg-[#f3ede4] dark:bg-[#182035] p-2.5 text-[10.5px] text-[#4b4038] dark:text-[#caaa98] leading-relaxed">
              💡 <strong>Android Install Step:</strong> After downloading the <code className="font-bold">Screenloop-ATS-Mobile-v1.0.apk</code> file on your Android phone, tap the file in your notification/Downloads and click <em>"Install"</em>. (If prompted, allow <em>"Install unknown apps"</em> for your browser).
            </div>
          </div>

          {/* Option 2: Instant 1-Tap Browser PWA Installation */}
          <div className="rounded-2xl border border-[#e2d8cd] dark:border-[#2d3854] bg-white dark:bg-[#202940] p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-[#202940] dark:text-white font-display">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Option 2: Instant 1-Tap Install (No APK Sideloading Required)
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Installs directly to your Android home screen as a standalone native app with offline caching and full screen view.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/30 shrink-0">
                Recommended
              </Badge>
            </div>

            <Button
              size="sm"
              onClick={handleInstallPwa}
              className="w-full h-9 text-xs gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
            >
              <Smartphone className="h-4 w-4" />
              <span>{isStandalone ? "Already Installed on this Device ✓" : "Install App to Android Home Screen"}</span>
            </Button>
          </div>

          {/* Option 3: Developer Native Android Studio Project */}
          <div className="rounded-2xl border border-[#e2d8cd] dark:border-[#2d3854] bg-white/70 dark:bg-[#202940]/70 p-3.5 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Native Android Studio Project Included</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              The full native Kotlin Android Studio project is located in the <code className="font-mono text-primary font-bold">android/</code> directory of the repository with Gradle wrapper, WebView client, and camera/mic permissions for Google Meet interviews.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
