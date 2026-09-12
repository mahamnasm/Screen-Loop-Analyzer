import { Download, Printer, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
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

interface PictureCvPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  candidateName: string;
}

export function PictureCvPreviewModal({
  open,
  onOpenChange,
  imageUrl,
  candidateName,
}: PictureCvPreviewModalProps) {
  const [zoom, setZoom] = useState<number>(1);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${candidateName.replace(/\s+/g, "_")}_CV_PictureFormat.png`;
    link.click();
    toast.success("Picture CV downloaded successfully as PNG image!");
  };

  const handlePrint = () => {
    if (!imageUrl) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${candidateName} - CV Picture Format</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; height: auto; page-break-inside: avoid; }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[92vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-3 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Picture Format CV Preview</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  PNG 1200×1600 High-Res
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Official verified candidate dossier exported in direct image/picture format.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                className="h-8 w-8 p-0 text-xs"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-mono w-12 text-center text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
                className="h-8 w-8 p-0 text-xs"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Picture Container */}
        <div className="flex-1 overflow-auto max-h-[62vh] rounded-xl bg-muted/40 border p-4 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Picture CV"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
              className="max-w-full h-auto rounded-lg shadow-xl border transition-transform duration-200"
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground text-xs">
              Generating high-resolution picture format...
            </div>
          )}
        </div>

        <DialogFooter className="mt-3 pt-3 border-t flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" /> Print Image
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> Download Picture CV (.png)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
