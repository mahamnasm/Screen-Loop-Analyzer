import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Sparkles,
  Video,
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
import { Separator } from "@/components/ui/separator";
import { STAGES, type Candidate, type Job, type Stage } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

export function CandidateApplications() {
  const { candidateApplications, jobs, withdrawApplication } = useAts();
  const [selectedApp, setSelectedApp] = useState<Candidate | null>(null);

  const getJobForCandidate = (jobId: string): Job => {
    const found = jobs.find((j) => j.id === jobId);
    if (found) return found;
    return (
      jobs[0] || {
        id: jobId,
        companyId: "comp_systems",
        title: "Software Engineer",
        company: "Systems Limited",
        city: "Karachi",
        location: "Karachi, Pakistan",
        department: "Engineering",
        type: "Full-time",
        status: "active",
        salary: "PKR 150K - 250K",
        salaryMinPKR: 150000,
        salaryMaxPKR: 250000,
        salaryDisplayPKR: "PKR 150K - 250K",
        requiredSkills: ["React", "TypeScript", "Node.js"],
        optionalSkills: [],
        minExperience: 2,
        skillsWeight: 70,
        isVerifiedCompany: true,
        isCorporateListing: true,
        preferredDegree: "BS Computer Science",
        deadline: Date.now() + 30 * 86400000,
        description: "Standard role requisition",
        responsibilities: ["Core feature delivery"],
        createdAt: Date.now(),
      }
    );
  };

  const getStageIndex = (stage: Stage) => {
    if (stage === "Not Selected" || (stage as string) === "Rejected") return -1;
    return STAGES.indexOf(stage);
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return <Badge variant="secondary">Evaluating...</Badge>;
    if (score >= 75) {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold">
          {score}% AI Match
        </Badge>
      );
    }
    if (score >= 50) {
      return (
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold">
          {score}% AI Match
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold">
        {score}% AI Match
      </Badge>
    );
  };

  if (candidateApplications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center bg-card">
        <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <h3 className="font-semibold text-foreground text-base">No submitted applications yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Browse open job listings and apply with your resume to track your live hiring stages here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            My Submitted Applications
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time stage tracking synchronized with recruiter decisions & AI screening results.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {candidateApplications.length} Active Application
          {candidateApplications.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="grid gap-5">
        {candidateApplications.map((app) => {
          const job = getJobForCandidate(app.jobId);
          const currentStageIdx = getStageIndex(app.stage);
          const isRejected = app.stage === "Not Selected" || (app.stage as string) === "Rejected";

          return (
            <div
              key={app.id}
              className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs transition hover:border-primary/50 space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-primary">{job.company}</span>
                    <Badge variant="secondary" className="text-[11px]">
                      {job.department}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      · {job.location || job.city}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mt-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-medium text-foreground/80">{job.salaryDisplayPKR}</span>
                    <span>•</span>
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getScoreBadge(app.screening?.matchScore)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApp(app)}
                    className="text-xs h-8"
                  >
                    View Status Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to withdraw this application?")) {
                        withdrawApplication(app.id);
                      }
                    }}
                    className="text-xs h-8 text-rose-700 hover:text-rose-800 hover:bg-rose-500/10 font-medium"
                  >
                    Withdraw
                  </Button>
                </div>
              </div>

              {/* Live Pipeline Stepper */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pipeline Progression
                  </span>
                  <span className="text-xs font-bold text-primary">
                    Current Status: {app.stage}
                  </span>
                </div>

                {isRejected ? (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                        Application Concluded (Not Selected)
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Thank you for your interest. While this role is not a direct match, your
                        profile is retained for upcoming opportunities.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Stepper Dots & Line */}
                    <div className="grid grid-cols-6 gap-1 text-center">
                      {STAGES.map((stg, idx) => {
                        const isPast = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stg} className="flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                                isPast
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : isCurrent
                                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                                    : "bg-muted text-muted-foreground border"
                              }`}
                            >
                              {isPast ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                            </div>
                            <span
                              className={`mt-2 text-[11px] font-medium leading-tight line-clamp-1 ${
                                isCurrent
                                  ? "text-primary font-bold"
                                  : isPast
                                    ? "text-foreground font-semibold"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {stg}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Upcoming Interviews Alert if scheduled */}
              {app.interviews.length > 0 && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Interview Confirmed: {app.interviews[0]!.type}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {app.interviews[0]!.date} at {app.interviews[0]!.time} · Interviewer:{" "}
                        {app.interviews[0]!.interviewer}
                      </p>
                    </div>
                  </div>

                  {app.interviews[0]!.meetingLink && (
                    <a
                      href={app.interviews[0]!.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
                    >
                      <Video className="h-3.5 w-3.5" /> Join Video Call
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Application Status Details Modal */}
      {selectedApp && (
        <Dialog open={Boolean(selectedApp)} onOpenChange={(open) => !open && setSelectedApp(null)}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Application Timeline & AI Evaluation
              </DialogTitle>
              <DialogDescription className="text-xs">
                {getJobForCandidate(selectedApp.jobId).title} · ID: {selectedApp.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Score meter */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold">AI Screening Score</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary">
                    {selectedApp.screening?.matchScore ?? 0}%
                  </span>
                </div>
                <Progress value={selectedApp.screening?.matchScore ?? 0} className="mt-2 h-2" />
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {selectedApp.screening?.summary || "Screening evaluation pending."}
                </p>
              </div>

              {/* Skills breakdown */}
              {selectedApp.screening && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Matched Core Skills</h4>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selectedApp.screening.matchedRequired.map((s) => (
                      <Badge
                        key={s}
                        className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]"
                      >
                        ✓ {s}
                      </Badge>
                    ))}
                    {selectedApp.screening.matchedOptional.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">
                        + {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* History Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Status History Log</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedApp.history.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-xs text-muted-foreground border-l-2 border-primary/40 pl-3 py-1"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground">{h.stage}</span>
                        <p className="text-[11px]">{h.note}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                        {new Date(h.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
