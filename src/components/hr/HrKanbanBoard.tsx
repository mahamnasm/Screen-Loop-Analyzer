import { useMemo, useState } from "react";
import {
  Archive,
  Brain,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Filter,
  Kanban,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { STAGES, type Candidate, type Stage } from "@/lib/ats-engine";
import { CareerBridgeLogo, CareerBridgeScriptWatermark } from "@/components/shared/CareerBridgeBranding";
import { useAts } from "@/lib/ats-store";

import { AiInterviewQuestionsModal } from "./AiInterviewQuestionsModal";
import { AiJobDescriptionModal } from "./AiJobDescriptionModal";
import { CandidateCard } from "./CandidateCard";
import { CandidateComparisonModal } from "./CandidateComparisonModal";
import { CandidateEvaluationModal } from "./CandidateEvaluationModal";

export function HrKanbanBoard() {
  const {
    isolatedCandidates,
    isolatedJobs,
    selectedJobId,
    setSelectedJobId,
    moveCandidate,
    screenAll,
    triggerScreening,
  } = useAts();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRejected, setShowRejected] = useState(false);

  // Drag & drop states
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  // Evaluation modal
  const [evalCandidate, setEvalCandidate] = useState<Candidate | null>(null);
  const [evalOpen, setEvalOpen] = useState(false);

  // Recruiter AI Tools state
  const [compareOpen, setCompareOpen] = useState(false);
  const [jdOpen, setJdOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);

  // Filter candidates by job, search query, and min score
  const filteredCandidates = useMemo(() => {
    return isolatedCandidates.filter((c) => {
      if (selectedJobId && c.jobId !== selectedJobId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesSkill = c.screening?.matchedRequired.some((s) =>
          s.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesEmail && !matchesSkill) return false;
      }

      if (minScore > 0 && (c.screening?.matchScore ?? 0) < minScore) {
        return false;
      }

      return true;
    });
  }, [isolatedCandidates, selectedJobId, searchQuery, minScore]);

  // Group candidates into stage columns
  const columnMap = useMemo(() => {
    const map = new Map<Stage, Candidate[]>();
    for (const stage of STAGES) {
      const items = filteredCandidates
        .filter((c) => c.stage === stage)
        .sort(
          (a, b) =>
            (b.screening?.matchScore ?? -1) - (a.screening?.matchScore ?? -1)
        );
      map.set(stage, items);
    }
    return map;
  }, [filteredCandidates]);

  const rejectedCandidates = useMemo(() => {
    return filteredCandidates.filter((c) => c.stage === "Not Selected" || (c.stage as string) === "Rejected");
  }, [filteredCandidates]);

  const handleDrop = (stage: Stage) => {
    if (dragId) {
      moveCandidate(dragId, stage);
      toast.success(`Candidate moved to ${stage}`);
    }
    setDragId(null);
    setOverStage(null);
  };

  const handleRunScreening = () => {
    const n = screenAll(selectedJobId || undefined);
    toast.success(
      n
        ? `Automated AI screening completed for ${n} candidate(s)`
        : "All candidates in this view already evaluated"
    );
  };

  const handleTriggerSimulated = () => {
    if (selectedIds.length === 0) {
      toast.error("Select candidate cards using checkboxes first");
      return;
    }
    triggerScreening(selectedIds);
    setSelectedIds([]);
  };

  const handleOpenEvaluation = (candidate: Candidate) => {
    setEvalCandidate(candidate);
    setEvalOpen(true);
  };

  const getStageBadgeStyle = (stage: string) => {
    switch (stage) {
      case "Applied":
        return "bg-[#202940] text-white border border-[#202940]";
      case "Screening":
      case "CV Reviewed":
        return "bg-[#4b4038] text-white border border-[#4b4038]";
      case "Shortlisted":
      case "Interview":
      case "Final Interview":
        return "bg-[#caaa98] text-[#202940] border border-[#9a8678] font-bold";
      case "Offer":
      case "Final Review":
        return "bg-[#202940] text-[#caaa98] border border-[#202940] font-bold";
      case "Hired":
        return "bg-emerald-700 text-white border border-emerald-800 font-bold";
      default:
        return "bg-[#202940] text-white";
    }
  };

  return (
    <div className="space-y-5">
      {/* Control & Filter Toolbar — HR Recruiter Pipeline Persona */}
      <div className="rounded-2xl border border-[#9a8678]/40 bg-card p-4 shadow-xs space-y-3 relative overflow-hidden">
        {/* Top CareerBridge Workflow Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#202940] flex items-center justify-center p-1.5 shadow-xs border border-[#caaa98]/40">
              <CareerBridgeLogo className="h-full w-full text-[#caaa98]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-bold text-[#202940]">
                  Talent Pipeline Workflow
                </span>
                <span className="rounded-md bg-[#202940]/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#4b4038] uppercase border border-[#caaa98]/40">
                  CareerBridge ATS
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Better Talent | Stronger Companies | A Brighter Pakistan
              </p>
            </div>
          </div>

          <div className="hidden sm:block">
            <CareerBridgeScriptWatermark size="sm" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Job Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#4b4038] dark:text-[#caaa98] whitespace-nowrap">
              Target Job Posting:
            </span>
            <Select
              value={selectedJobId || "all"}
              onValueChange={(val) => setSelectedJobId(val === "all" ? null : val)}
            >
              <SelectTrigger className="w-56 h-8 text-xs font-medium bg-background border-[#e2d8cd]">
                <SelectValue placeholder="All Active Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Active Jobs ({isolatedJobs.length})</SelectItem>
                {isolatedJobs.map((j) => (
                  <SelectItem key={j.id} value={j.id} className="text-xs">
                    {j.title} ({j.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick AI Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleRunScreening}
              className="h-8 text-xs gap-1.5 shadow-xs bg-[#4b4038] hover:bg-[#3b322b] text-[#fbf9f6] border border-[#9a8678]/40 font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#caaa98]" /> Run AI Screening
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (selectedIds.length < 2) {
                  toast.info("Select 2 or more candidates to compare side-by-side");
                }
                setCompareOpen(true);
              }}
              className="h-8 text-xs gap-1.5"
            >
              <Scale className="h-3.5 w-3.5 text-primary" /> Compare ({selectedIds.length})
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setJdOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5 text-primary" /> AI Job Spec
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setInterviewOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <Brain className="h-3.5 w-3.5 text-purple-600" /> AI Interview Prep
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleTriggerSimulated}
              disabled={selectedIds.length === 0}
              className="h-8 text-xs gap-1.5"
            >
              Outreach ({selectedIds.length})
            </Button>
          </div>
        </div>

        {/* Search & Min Score Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search candidate name, email, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-3 w-60">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Min AI Score: <strong className="text-foreground font-mono">{minScore}%</strong>
            </span>
            <Slider
              value={[minScore]}
              min={0}
              max={95}
              step={5}
              onValueChange={([val]) => setMinScore(val ?? 0)}
              className="flex-1"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRejected((v) => !v)}
            className="h-8 text-xs text-muted-foreground gap-1.5"
          >
            <Archive className="h-3.5 w-3.5" />
            {showRejected ? "Hide Rejected" : `Archived / Rejected (${rejectedCandidates.length})`}
          </Button>
        </div>
      </div>

      {/* Kanban Board Grid (5 Main Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {STAGES.map((stage) => {
          const items = columnMap.get(stage) || [];
          const isOver = overStage === stage;

          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStage(stage);
              }}
              onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(stage);
              }}
              className={`flex min-h-[480px] flex-col rounded-2xl border bg-muted/30 p-3 transition-all ${
                isOver
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border/70"
              }`}
            >
              {/* Column Header — Color-Coded by Pipeline Stage */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold shadow-2xs ${getStageBadgeStyle(stage)}`}>
                    {stage}
                  </span>
                </div>
                <span className="rounded-full bg-background border px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground shadow-2xs">
                  {items.length}
                </span>
              </div>

              {/* Candidate Cards List */}
              <div className="flex-1 space-y-2.5">
                {items.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    selectable={true}
                    selected={selectedIds.includes(candidate.id)}
                    onSelect={(checked) =>
                      setSelectedIds((prev) =>
                        checked
                          ? [...prev, candidate.id]
                          : prev.filter((id) => id !== candidate.id)
                      )
                    }
                    onDragStart={() => setDragId(candidate.id)}
                    onViewEvaluation={handleOpenEvaluation}
                  />
                ))}

                {items.length === 0 && (
                  <div className="h-32 flex items-center justify-center rounded-xl border border-dashed text-center p-3">
                    <p className="text-[11px] text-muted-foreground italic">
                      Drag candidate here
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsible Rejected / Archive Drawer */}
      {showRejected && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-rose-600" />
              <h3 className="font-display text-sm font-bold text-foreground">
                Rejected / Concluded Applicants ({rejectedCandidates.length})
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Applicants can be dragged back into any active pipeline column anytime
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {rejectedCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onDragStart={() => setDragId(candidate.id)}
                onViewEvaluation={handleOpenEvaluation}
              />
            ))}
            {rejectedCandidates.length === 0 && (
              <p className="col-span-full text-xs text-muted-foreground italic text-center py-4">
                No rejected candidates in this view.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Candidate Resume & AI Evaluation Modal */}
      <CandidateEvaluationModal
        candidate={evalCandidate}
        open={evalOpen}
        onOpenChange={setEvalOpen}
      />

      {/* Candidate Comparison Modal */}
      <CandidateComparisonModal
        candidateIds={selectedIds}
        jobId={selectedJobId}
        open={compareOpen}
        onOpenChange={setCompareOpen}
      />

      {/* AI Job Description Generator Modal */}
      <AiJobDescriptionModal
        open={jdOpen}
        onOpenChange={setJdOpen}
      />

      {/* AI Interview Questions Assistant Modal */}
      <AiInterviewQuestionsModal
        open={interviewOpen}
        onOpenChange={setInterviewOpen}
        defaultRole={isolatedJobs.find((j) => j.id === selectedJobId)?.title || "Full Stack Engineer"}
      />
    </div>
  );
}
