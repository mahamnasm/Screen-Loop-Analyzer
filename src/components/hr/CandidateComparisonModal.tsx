import { useMemo } from "react";
import { Award, MapPin, Scale } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { aiServices } from "@/lib/ai-services";
import { useAts } from "@/lib/ats-store";

interface CandidateComparisonModalProps {
  candidateIds: string[];
  jobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidateComparisonModal({
  candidateIds,
  jobId,
  open,
  onOpenChange,
}: CandidateComparisonModalProps) {
  const { isolatedCandidates, jobs, moveCandidate } = useAts();

  const selectedCandidates = useMemo(() => {
    return isolatedCandidates.filter((c) => candidateIds.includes(c.id));
  }, [isolatedCandidates, candidateIds]);

  const job = useMemo(() => {
    if (jobId) return jobs.find((j) => j.id === jobId) || jobs[0]!;
    if (selectedCandidates.length > 0) {
      return jobs.find((j) => j.id === selectedCandidates[0]!.jobId) || jobs[0]!;
    }
    return jobs[0]!;
  }, [jobs, jobId, selectedCandidates]);

  const comparison = useMemo(() => {
    if (selectedCandidates.length < 2) return null;
    return aiServices.compareCandidates(selectedCandidates, job);
  }, [selectedCandidates, job]);

  if (selectedCandidates.length < 2) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" /> Candidate Comparison
            </DialogTitle>
            <DialogDescription>
              Please select at least 2 candidates using the checkboxes on the board to run
              side-by-side AI comparative analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center text-xs text-muted-foreground">
            Currently selected: {selectedCandidates.length} candidate(s).
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  AI Candidate Comparative Analysis
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Side-by-side evaluation against{" "}
                  <span className="font-semibold text-foreground">{job.title}</span> ({job.company})
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs font-bold">
              {selectedCandidates.length} Profiles
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Executive Recommendation Banner */}
          {comparison && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Award className="h-4 w-4" />
                <span>Executive Recruiter Verdict</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">{comparison.summary}</p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="font-semibold text-muted-foreground">Top Recommended Fit:</span>
                <Badge className="bg-primary text-primary-foreground font-bold">
                  {comparison.topCandidateName}
                </Badge>
              </div>
            </div>
          )}

          {/* Comparison Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCandidates.map((c) => {
              const score = c.screening?.matchScore ?? 70;
              const isWinner = comparison?.topCandidateId === c.id;

              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-4.5 space-y-4 transition ${
                    isWinner
                      ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                      : "bg-card"
                  }`}
                >
                  {/* Candidate Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {isWinner && (
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold mb-1">
                            ★ Top Match
                          </Badge>
                        )}
                        <h4 className="font-bold text-base text-foreground leading-snug">
                          {c.name}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {c.city}, Pakistan
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs font-bold">
                        {score}%
                      </Badge>
                    </div>

                    <div className="mt-2.5">
                      <Progress value={score} className="h-2" />
                    </div>
                  </div>

                  <Separator />

                  {/* Compensation in PKR */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Compensation Fit (PKR)
                    </span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Expected:</span>
                      <span className="font-semibold text-foreground font-mono">
                        {c.expectedSalaryPKR
                          ? `PKR ${(c.expectedSalaryPKR / 1000).toFixed(0)}k/mo`
                          : "Negotiable"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Budget Fit:</span>
                      <span className="text-emerald-600 font-semibold text-[11px]">
                        Within PKR {(job.salaryMaxPKR / 1000).toFixed(0)}k ceiling
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Skills Matched */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Matched Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {c.screening?.matchedRequired.slice(0, 4).map((s) => (
                        <Badge
                          key={s}
                          className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]"
                        >
                          ✓ {s}
                        </Badge>
                      ))}
                      {(!c.screening || c.screening.matchedRequired.length === 0) && (
                        <span className="text-[11px] text-muted-foreground italic">
                          Standard profile skills
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skill Gaps */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Skill Gaps
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {c.screening?.missingRequired && c.screening.missingRequired.length > 0 ? (
                        c.screening.missingRequired.slice(0, 3).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[10px] text-rose-600 bg-rose-500/10 border-rose-500/20"
                          >
                            ✕ {s}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          No major gaps identified
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Current Stage & Quick Actions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Current Stage:</span>
                      <Badge variant="secondary" className="font-bold text-[11px]">
                        {c.stage}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          moveCandidate(c.id, "Interview");
                          toast.success(`Moved ${c.name} to Interview stage`);
                        }}
                        className="text-xs h-8"
                      >
                        Advance
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          moveCandidate(c.id, "Not Selected");
                          toast.info(`Marked ${c.name} as Not Selected`);
                        }}
                        className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                      >
                        Not Selected
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close Comparison
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
