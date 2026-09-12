import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileCheck,
  FileText,
  ShieldCheck,
  Sparkles,
  Wand2,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cvImprover } from "@/lib/ai-services";
import type { Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

interface CvImproverModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CvImproverModal({
  job: initialJob,
  open,
  onOpenChange,
}: CvImproverModalProps) {
  const { activeJobs, currentUser } = useAts();

  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJob?.id || activeJobs[0]?.id || ""
  );

  useEffect(() => {
    if (initialJob) setSelectedJobId(initialJob.id);
  }, [initialJob]);

  const targetJob = activeJobs.find((j) => j.id === selectedJobId) || activeJobs[0];

  const initialCv =
    currentUser.bio && currentUser.bio.length > 50
      ? currentUser.bio
      : `Software Engineer with 5 years experience across React, TypeScript, Node.js, and modern web applications.\nProficient in PostgreSQL, Docker, Git, and REST APIs.\nFAST-NUCES graduate. Built scalable enterprise web portals and e-commerce platforms.`;

  const [sourceCv, setSourceCv] = useState(initialCv);
  const [improvedCv, setImprovedCv] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && targetJob) {
      setIsGenerating(true);
      setTimeout(() => {
        setImprovedCv(cvImprover(sourceCv, targetJob));
        setIsGenerating(false);
      }, 300);
    }
  }, [open, selectedJobId, targetJob]);

  if (!targetJob) return null;

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setImprovedCv(cvImprover(sourceCv, targetJob));
      setIsGenerating(false);
      toast.success("CV re-aligned with target job criteria!");
    }, 350);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedCv);
    setCopied(true);
    toast.success("Copied improved CV to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([improvedCv], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentUser.name.replace(/\s+/g, "_")}_Aligned_CV.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded improved CV text file!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Improve My CV for Target Job
              </DialogTitle>
              <DialogDescription className="text-xs">
                AI restructures and highlights your real experience to match employer requirements without inventing false credentials.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Target Job Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Target Job Posting:
            </label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="text-xs bg-background h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeJobs.map((j) => (
                  <SelectItem key={j.id} value={j.id} className="text-xs">
                    {j.title} · {j.company} ({j.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ethics Banner */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Verified Authenticity Guarantee: </span>
              Our AI engine reorganizes, sharpens, and prioritizes your existing background for {targetJob.company}. It will never hallucinate fake degrees, employers, or skills.
            </div>
          </div>

          {/* Improved CV Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="improved-cv" className="text-xs font-bold flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-primary" />
                Aligned Professional CV (Editable)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs gap-1"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 text-xs gap-1"
                >
                  <Download className="h-3 w-3" /> Download .txt
                </Button>
              </div>
            </div>

            <Textarea
              id="improved-cv"
              rows={12}
              value={improvedCv}
              onChange={(e) => setImprovedCv(e.target.value)}
              className="text-xs font-mono leading-relaxed bg-muted/20"
              disabled={isGenerating}
            />
          </div>

          {/* Actions Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isGenerating ? "Refining..." : "Re-align CV"}
            </Button>

            <Button size="sm" onClick={() => onOpenChange(false)}>
              Done Reviewing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
