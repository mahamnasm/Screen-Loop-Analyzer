import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Lightbulb,
  MapPin,
  Sparkles,
  Wand2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobMatcher, type JobCvMatchResult } from "@/lib/ai-services";
import type { Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

interface JobCvMatchModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyClick?: (job: Job) => void;
  onImproveCvClick?: (job: Job) => void;
}

export function JobCvMatchModal({
  job: initialJob,
  open,
  onOpenChange,
  onApplyClick,
  onImproveCvClick,
}: JobCvMatchModalProps) {
  const { activeJobs, currentUser } = useAts();

  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJob?.id || activeJobs[0]?.id || ""
  );

  useEffect(() => {
    if (initialJob) {
      setSelectedJobId(initialJob.id);
    }
  }, [initialJob]);

  const targetJob = activeJobs.find((j) => j.id === selectedJobId) || activeJobs[0];

  // Candidate CV text default from user bio or realistic sample
  const candidateCv =
    currentUser.bio && currentUser.bio.length > 50
      ? currentUser.bio
      : `Software Engineer with 5 years experience across React, TypeScript, Node.js, and modern web applications.\nProficient in PostgreSQL, Docker, Git, and REST APIs.\nFAST-NUCES graduate. Built scalable enterprise web portals and e-commerce platforms.`;

  const [matchResult, setMatchResult] = useState<JobCvMatchResult | null>(null);

  useEffect(() => {
    if (targetJob) {
      setMatchResult(jobMatcher(candidateCv, targetJob));
    }
  }, [selectedJobId, targetJob, candidateCv]);

  if (!targetJob || !matchResult) return null;

  const strengthTone = (strength: string) => {
    if (strength === "Strong Match")
      return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-bold";
    if (strength === "Good Match")
      return "bg-primary/15 text-primary border-primary/30 font-bold";
    return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Job-Specific CV Match & Benchmark
              </DialogTitle>
              <DialogDescription className="text-xs">
                Compare your actual CV directly against employer requirements before submitting.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Job Selector Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Select Position to Benchmark Against:
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

          {/* Job Overview Pill */}
          <div className="rounded-xl border bg-muted/30 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-foreground text-sm">{targetJob.title}</span>
              <p className="text-muted-foreground mt-0.5">
                {targetJob.company} · {targetJob.location} · {targetJob.salaryDisplayPKR}
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              Min {targetJob.minExperience} yrs exp required
            </Badge>
          </div>

          {/* Score & Strength Hero */}
          <div className="rounded-2xl border bg-gradient-to-r from-card to-muted/40 p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Compatibility
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display text-4xl font-extrabold text-foreground">
                    {matchResult.overallMatch}%
                  </span>
                  <Badge className={`text-xs font-bold uppercase ${strengthTone(matchResult.strength)}`}>
                    Application Strength: {matchResult.strength}
                  </Badge>
                </div>
              </div>

              <div className="w-full sm:w-56 space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Overall Fit</span>
                  <span className="font-mono">{matchResult.overallMatch}%</span>
                </div>
                <Progress value={matchResult.overallMatch} className="h-2.5" />
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed border-t pt-2.5">
              {matchResult.summaryMessage}
            </p>
          </div>

          {/* 4-Pillar Detailed Progress Metrics */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="text-xs font-bold text-foreground">Criteria Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Core Skills Coverage</span>
                  <span className="font-mono font-bold text-primary">{matchResult.skillsMatch}%</span>
                </div>
                <Progress value={matchResult.skillsMatch} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Experience Benchmark</span>
                  <span className="font-mono font-bold text-primary">{matchResult.experienceMatch}%</span>
                </div>
                <Progress value={matchResult.experienceMatch} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Education & Credentials</span>
                  <span className="font-mono font-bold text-primary">{matchResult.educationMatch}%</span>
                </div>
                <Progress value={matchResult.educationMatch} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Requirements Alignment</span>
                  <span className="font-mono font-bold text-primary">{matchResult.requirementsMatch}%</span>
                </div>
                <Progress value={matchResult.requirementsMatch} className="h-2" />
              </div>
            </div>
          </div>

          {/* Skills Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Skills You Have ({matchResult.skillsHave.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matchResult.skillsHave.map((s) => (
                  <Badge key={s} className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs">
                    ✓ {s}
                  </Badge>
                ))}
                {matchResult.skillsHave.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">None detected in CV text</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-amber-500" />
                Skills to Highlight / Improve ({matchResult.skillsToImprove.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matchResult.skillsToImprove.map((s) => (
                  <Badge key={s} className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-xs font-semibold">
                    + {s}
                  </Badge>
                ))}
                {matchResult.skillsToImprove.length === 0 && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    All required skills covered!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Suggestions & Strong Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Strong Points
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {matchResult.strongPoints.map((sp, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{sp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Suggestions Before Applying
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {matchResult.suggestionsBeforeApplying.map((sugg, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{sugg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                if (onImproveCvClick) onImproveCvClick(targetJob);
              }}
              className="text-xs gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              Improve My CV for this Job
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (onApplyClick) onApplyClick(targetJob);
                }}
                className="text-xs"
              >
                Apply for {targetJob.title}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
