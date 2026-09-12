import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  MapPin,
  Sparkles,
  User,
  Video,
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
import { aiServices } from "@/lib/ai-services";
import type { Candidate, InterviewSchedule, Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

export function InterviewsScheduleView() {
  const { isolatedInterviews, currentUser } = useAts();

  // AI Interview Prep Modal state
  const [prepModalOpen, setPrepModalOpen] = useState(false);
  const [activeInterviewItem, setActiveInterviewItem] = useState<{
    candidate: Candidate;
    interview: InterviewSchedule;
    job?: Job | undefined;
  } | null>(null);

  const isCandidate = currentUser.role === "candidate";

  // Metrics
  const technicalCount = isolatedInterviews.filter((i) => i.interview.type === "Technical").length;
  const hrCount = isolatedInterviews.filter((i) => i.interview.type === "HR Screening").length;
  const systemDesignCount = isolatedInterviews.filter((i) => i.interview.type === "System Design").length;

  const handleOpenMeeting = (link?: string) => {
    if (link) {
      window.open(link, "_blank");
    } else {
      window.open("https://meet.google.com/new", "_blank");
      toast.info("Opening Google Meet room for your session.");
    }
  };

  const handleOpenAiPrep = (item: {
    candidate: Candidate;
    interview: InterviewSchedule;
    job?: Job | undefined;
  }) => {
    setActiveInterviewItem(item);
    setPrepModalOpen(true);
  };

  // Generate dynamic questions for the active interview
  const prepQuestions = useMemo(() => {
    if (!activeInterviewItem?.job) return null;
    return aiServices.generateInterviewQuestions({
      role: activeInterviewItem.job.title,
      level: `${activeInterviewItem.job.minExperience}+ yrs exp`,
      skills: activeInterviewItem.job.requiredSkills,
    });
  }, [activeInterviewItem]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Calendar className="h-3.5 w-3.5" />
              <span>{isCandidate ? "Candidate Interview Hub" : "Company Interview Schedule"}</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              {isCandidate ? "Upcoming Interviews & Prep" : "Scheduled Interviews & Evaluation"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {isCandidate
                ? "Track scheduled video interviews, access Google Meet rooms, and review AI-generated STAR interview questions."
                : "Monitor scheduled candidate interviews across your company's pipeline and review technical discussion guides."}
            </p>
          </div>

          <Badge variant="outline" className="text-xs px-3 py-1 font-mono self-start sm:self-auto">
            {isolatedInterviews.length} Scheduled
          </Badge>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card/60 p-3.5">
            <div className="text-xs text-muted-foreground font-medium">Total Interviews</div>
            <div className="mt-1 text-2xl font-bold text-foreground font-display">
              {isolatedInterviews.length}
            </div>
            <div className="text-[11px] text-muted-foreground">Synchronized with calendar</div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5">
            <div className="text-xs text-muted-foreground font-medium">Technical Rounds</div>
            <div className="mt-1 text-2xl font-bold text-primary font-display">
              {technicalCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Coding & problem-solving</div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5">
            <div className="text-xs text-muted-foreground font-medium">HR & Culture Fit</div>
            <div className="mt-1 text-2xl font-bold text-foreground font-display">
              {hrCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Compensation & values</div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5">
            <div className="text-xs text-muted-foreground font-medium">Architecture / Exec</div>
            <div className="mt-1 text-2xl font-bold text-foreground font-display">
              {systemDesignCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Senior calibration</div>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      {isolatedInterviews.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground mb-3">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground text-base">No Scheduled Interviews</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            {isCandidate
              ? "You do not have any interviews scheduled yet. Once an employer reviews your CV and advances your stage to 'Interview', your meeting details and prep guides will appear here."
              : "No upcoming interviews scheduled for your company pipeline. Advance qualified candidates to the 'Interview' stage on the Kanban board to schedule rounds."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {isolatedInterviews.map((item, idx) => {
            const { candidate, interview, job } = item;
            return (
              <div
                key={interview.id || idx}
                className="rounded-2xl border bg-card p-5 shadow-xs transition hover:border-primary/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                  {/* Date Badge */}
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[11px] font-semibold text-primary uppercase">
                      {interview.date ? new Date(interview.date).toLocaleDateString("en-PK", { month: "short" }) : "DATE"}
                    </span>
                    <span className="text-xl font-bold text-primary font-display">
                      {interview.date ? new Date(interview.date).getDate() : "--"}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-foreground font-display truncate">
                        {job?.title || "Job Requisition"}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {job?.company || "Pakistani Employer"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs bg-primary/5 text-primary border-primary/20"
                      >
                        {interview.type}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {interview.time || "Scheduled Time"}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Interviewer: {interview.interviewer || "Lead Recruiter"}
                      </span>
                      {!isCandidate && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-foreground">
                            Candidate: {candidate.name} ({candidate.city})
                          </span>
                        </>
                      )}
                    </div>

                    {interview.notes && (
                      <p className="text-xs text-muted-foreground pt-1 italic">
                        "{interview.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAiPrep(item)}
                    className="text-xs h-9 gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    AI Prep Questions
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleOpenMeeting(interview.meetingLink)}
                    className="text-xs h-9 gap-1.5"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Join Video Room
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Interview Prep Modal */}
      <Dialog open={prepModalOpen} onOpenChange={setPrepModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {activeInterviewItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Interview Prep Guide: {activeInterviewItem.job?.title}
                </DialogTitle>
                <DialogDescription>
                  Tailored questions and STAR response coaching specifically calibrated for {activeInterviewItem.job?.company}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Interview Snapshot */}
                <div className="rounded-xl border bg-muted/30 p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Format:</span>{" "}
                    <strong className="text-foreground">{activeInterviewItem.interview.type}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Interviewer:</span>{" "}
                    <strong className="text-foreground">{activeInterviewItem.interview.interviewer}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>{" "}
                    <strong className="text-foreground">{activeInterviewItem.job?.city}</strong>
                  </div>
                </div>

                {/* Questions List */}
                {prepQuestions && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Technical & Architectural Evaluation Questions
                    </h4>

                    {prepQuestions.technical.map((item, idx) => (
                      <div key={`tech-${idx}`} className="rounded-xl border bg-card p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            Q{idx + 1}: {item.q}
                          </span>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            Technical
                          </Badge>
                        </div>

                        <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground space-y-1">
                          <div className="font-semibold text-foreground">Ideal Candidate Answer:</div>
                          <p>{item.targetAnswer}</p>
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium pt-1">
                            ⚠️ Red Flag: {item.redFlags}
                          </div>
                        </div>
                      </div>
                    ))}

                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">
                      Behavioral & Collaboration Questions
                    </h4>

                    {prepQuestions.behavioral.map((item, idx) => (
                      <div key={`behav-${idx}`} className="rounded-xl border bg-card p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            Q{idx + 1}: {item.q}
                          </span>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            Behavioral
                          </Badge>
                        </div>

                        <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground space-y-1">
                          <div className="font-semibold text-foreground">Ideal Candidate Answer:</div>
                          <p>{item.targetAnswer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-xl border bg-primary/5 p-3.5 text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Salary Negotiation Guidance (Pakistan Market)
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Target range for this position: <strong className="text-foreground">{activeInterviewItem.job?.salaryDisplayPKR}</strong>. Be transparent about expected bonuses, health insurance, and provident fund benefits.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
