import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Eye,
  FileText,
  MessageSquare,
  MoreVertical,
  MoveRight,
  Sparkles,
  User,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ALL_STAGES, type Candidate, type Stage } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

interface CandidateCardProps {
  candidate: Candidate;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onDragStart: () => void;
  onViewEvaluation: (candidate: Candidate) => void;
}

export function CandidateCard({
  candidate,
  selectable = false,
  selected = false,
  onSelect,
  onDragStart,
  onViewEvaluation,
}: CandidateCardProps) {
  const { jobs, moveCandidate, currentUser, logAuditEvent } = useAts();

  const handleStartGoogleMeet = (e: React.MouseEvent) => {
    e.stopPropagation();
    const meetUrl = candidate.interviews[0]?.meetingLink || "https://meet.google.com/new";
    window.open(meetUrl, "_blank", "noopener,noreferrer");
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "GOOGLE_MEET_STARTED",
      resource: `Candidate #${candidate.id} (${candidate.name})`,
      details: `Started real Google Meet video conference with ${candidate.name}`,
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success(`Google Meet opened for ${candidate.name}!`);
  };
  const targetJob = jobs.find((j) => j.id === candidate.jobId) || jobs[0]!;
  const s = candidate.screening;

  const scoreTone = (score: number) => {
    if (score >= 75)
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold";
    if (score >= 50)
      return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold";
    return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold";
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", candidate.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      className="group relative cursor-grab rounded-xl border bg-card p-3.5 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md active:cursor-grabbing"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          {selectable && onSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(Boolean(checked))}
              className="mt-1"
            />
          )}

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div className="min-w-0">
            <h4
              onClick={() => onViewEvaluation(candidate)}
              className="truncate text-xs sm:text-sm font-bold text-foreground hover:text-primary transition cursor-pointer"
            >
              {candidate.name}
            </h4>
            <p className="truncate text-[11px] text-muted-foreground">
              {candidate.email}
            </p>
          </div>
        </div>

        {/* AI Score Badge */}
        {s ? (
          <Badge className={`text-[10px] px-1.5 py-0.5 ${scoreTone(s.matchScore)}`}>
            {s.matchScore}%
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            Pending
          </Badge>
        )}
      </div>

      {/* Target Job & Experience */}
      <div className="mt-2.5 flex items-center justify-between gap-1 text-[11px] text-muted-foreground border-t pt-2">
        <span className="truncate font-medium text-foreground/80 max-w-[150px]">
          {targetJob.title}
        </span>
        <span className="shrink-0 font-mono text-[10px]">
          {s?.experienceYears ?? 0}+ yrs exp
        </span>
      </div>

      {/* Matched Skill Badges */}
      {s && s.matchedRequired.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {s.matchedRequired.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
            >
              {skill}
            </span>
          ))}
          {s.matchedRequired.length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{s.matchedRequired.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Recruiter Note snippet */}
      {candidate.notes && (
        <div className="mt-2 rounded-md bg-muted/40 p-1.5 text-[11px] text-muted-foreground italic flex items-start gap-1">
          <MessageSquare className="h-3 w-3 text-primary shrink-0 mt-0.5" />
          <span className="line-clamp-1">{candidate.notes}</span>
        </div>
      )}

      {/* Interview alert if scheduled */}
      {candidate.interviews.length > 0 && (
        <div className="mt-2 rounded-md bg-primary/10 border border-primary/25 px-2 py-1 text-[10px] text-primary font-semibold flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          <span>{candidate.interviews[0]!.type}: {candidate.interviews[0]!.date}</span>
        </div>
      )}

      {/* Card Action Toolbar */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t text-[11px]">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewEvaluation(candidate)}
            className="h-7 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/10 flex items-center gap-1"
          >
            <Eye className="h-3.5 w-3.5" /> Review
          </Button>

          {(candidate.stage === "Interview" || candidate.interviews.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartGoogleMeet}
              className="h-7 px-2 text-[10px] gap-1 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              title="Start Google Meet"
            >
              <Video className="h-3 w-3 text-emerald-600" /> Meet
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <DropdownMenuItem
              onClick={handleStartGoogleMeet}
              className="cursor-pointer text-emerald-700 dark:text-emerald-400 font-semibold"
            >
              <Video className="mr-2 h-3.5 w-3.5 text-emerald-600" />
              <span>Start Google Meet</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">
              Quick Move Stage
            </DropdownMenuLabel>
            {ALL_STAGES.map((stg) => (
              <DropdownMenuItem
                key={stg}
                disabled={stg === candidate.stage}
                onClick={() => moveCandidate(candidate.id, stg)}
                className="cursor-pointer"
              >
                <MoveRight className="mr-2 h-3.5 w-3.5" />
                <span>{stg}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
