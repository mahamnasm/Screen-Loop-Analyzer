import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  MoveRight,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  UserCheck,
  Video,
  XCircle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ALL_STAGES, type Candidate, type Stage } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

interface CandidateEvaluationModalProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidateEvaluationModal({
  candidate,
  open,
  onOpenChange,
}: CandidateEvaluationModalProps) {
  const { jobs, moveCandidate, setNote, scheduleInterview, screenCandidateById } = useAts();
  const [activeTab, setActiveTab] = useState<"evaluation" | "resume" | "interview">("evaluation");

  // Interview form state
  const [intDate, setIntDate] = useState("");
  const [intTime, setIntTime] = useState("");
  const [intType, setIntType] = useState<any>("Technical");
  const [intInterviewer, setIntInterviewer] = useState("Marcus Vance");
  const [intLink, setIntLink] = useState("https://meet.google.com/scr-interview-live");

  if (!candidate) return null;

  const job = jobs.find((j) => j.id === candidate.jobId) || jobs[0]!;
  const s = candidate.screening;

  const handleStageChange = (nextStage: Stage) => {
    moveCandidate(candidate.id, nextStage);
    toast.success(`Candidate status moved to ${nextStage}`);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intDate || !intTime) {
      toast.error("Please enter a date and time for the interview");
      return;
    }
    scheduleInterview(candidate.id, {
      date: intDate,
      time: intTime,
      type: intType,
      interviewer: intInterviewer,
      meetingLink: intLink,
    });
    setIntDate("");
    setIntTime("");
    setActiveTab("evaluation");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] max-h-[92vh] overflow-y-auto">
        {/* Header with Avatar & Details */}
        <DialogHeader className="border-b pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-base">
                {candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {candidate.name}
                </DialogTitle>
                <DialogDescription className="text-xs flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-medium text-foreground">{job.title}</span>
                  <span>·</span>
                  <span>{candidate.location}</span>
                  <span>·</span>
                  <span className="font-mono">{candidate.email}</span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={candidate.stage}
                onValueChange={(v) => handleStageChange(v as Stage)}
              >
                <SelectTrigger className="h-8 text-xs font-semibold w-36 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STAGES.map((stg) => (
                    <SelectItem key={stg} value={stg} className="text-xs">
                      {stg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => screenCandidateById(candidate.id)}
                className="h-8 text-xs gap-1"
                title="Re-run AI evaluation"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-eval
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evaluation" className="text-xs">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              AI Match & Feedback
            </TabsTrigger>
            <TabsTrigger value="resume" className="text-xs">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Resume Document
            </TabsTrigger>
            <TabsTrigger value="interview" className="text-xs">
              <Calendar className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Interviews & Notes ({candidate.interviews.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AI Evaluation Breakdown */}
          <TabsContent value="evaluation" className="space-y-4 pt-3">
            {s ? (
              <>
                {/* Score Hero Card */}
                <div className="rounded-2xl border bg-gradient-to-r from-card to-muted/40 p-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Overall Compatibility Index
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-4xl font-extrabold text-foreground">
                          {s.matchScore}%
                        </span>
                        <Badge
                          variant={
                            s.result === "Pass"
                              ? "default"
                              : s.result === "Review"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs uppercase font-bold tracking-wider"
                        >
                          Recommendation: {s.result}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Algorithm criteria: {job.skillsWeight}% Skills Match / {100 - job.skillsWeight}% Experience
                      </p>
                    </div>

                    <div className="w-full sm:w-48">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Match Threshold</span>
                        <span className="font-mono">{s.matchScore} / 100</span>
                      </div>
                      <Progress value={s.matchScore} className="h-2.5" />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 rounded-xl border bg-background/80 p-3.5 text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">AI Executive Summary: </span>
                    {s.summary}
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border bg-card p-4 space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Matched Required Skills ({s.matchedRequired.length}/{job.requiredSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {s.matchedRequired.length > 0 ? (
                        s.matchedRequired.map((skill) => (
                          <Badge key={skill} className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs">
                            ✓ {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No required skills identified</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-card p-4 space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-rose-600" />
                      Missing Required Skills ({s.missingRequired.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {s.missingRequired.length > 0 ? (
                        s.missingRequired.map((skill) => (
                          <Badge key={skill} className="bg-rose-500/15 text-rose-600 border-rose-500/30 text-xs">
                            ✕ {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">
                          All required skills satisfied!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border bg-card p-4 space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Identified Strengths
                    </h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {s.strengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border bg-card p-4 space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Areas of Consideration / Gaps
                    </h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {s.weaknesses.map((weak, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center border rounded-xl">
                <p className="text-xs text-muted-foreground">Screening evaluation not available.</p>
                <Button size="sm" onClick={() => screenCandidateById(candidate.id)} className="mt-2 text-xs">
                  Generate AI Evaluation
                </Button>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="rounded-xl border bg-muted/30 p-3.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                Current Pipeline Stage: <strong className="text-foreground">{candidate.stage}</strong>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStageChange("Not Selected")}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  Mark Not Selected
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleStageChange("Interview");
                    setActiveTab("interview");
                  }}
                  className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Calendar className="mr-1.5 h-3.5 w-3.5" /> Schedule Interview
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Resume Document Viewer */}
          <TabsContent value="resume" className="space-y-4 pt-3">
            <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
              {/* Document Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{candidate.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {candidate.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {candidate.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {candidate.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {candidate.portfolioUrl && (
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" /> Portfolio
                    </a>
                  )}
                  {candidate.githubUrl && (
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Github className="h-3.5 w-3.5" /> Code Repo
                    </a>
                  )}
                </div>
              </div>

              {/* Cover Letter if provided */}
              {candidate.coverLetter && (
                <div className="rounded-xl bg-muted/40 p-3.5 text-xs">
                  <p className="font-semibold text-foreground mb-1">Cover Note:</p>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{candidate.coverLetter}"
                  </p>
                </div>
              )}

              {/* Formatted Resume Body */}
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    {candidate.resumeFileName || "Attached_Resume.pdf"}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Extracted Text View
                  </Badge>
                </div>

                <pre className="whitespace-pre-wrap font-sans text-xs text-muted-foreground leading-relaxed">
                  {candidate.resumeText}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Interviews & Notes */}
          <TabsContent value="interview" className="space-y-4 pt-3">
            {/* Recruiter Notes Notepad */}
            <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-xs">
              <Label htmlFor="recruiter-notes" className="text-xs font-bold flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-primary" />
                Recruiter Notes & Feedback (Auto-saved)
              </Label>
              <Textarea
                id="recruiter-notes"
                rows={3}
                placeholder="Log notes from screening calls, salary expectations, interview feedback..."
                value={candidate.notes}
                onChange={(e) => setNote(candidate.id, e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Scheduled Interviews List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Scheduled Interviews ({candidate.interviews.length})
              </h4>

              {candidate.interviews.length === 0 ? (
                <p className="text-xs text-muted-foreground italic rounded-xl border border-dashed p-4 text-center">
                  No interviews scheduled yet. Use the form below to book a session.
                </p>
              ) : (
                <div className="space-y-2">
                  {candidate.interviews.map((int) => (
                    <div
                      key={int.id}
                      className="flex flex-wrap items-center justify-between rounded-xl border bg-card p-3.5 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {int.type} Interview
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {int.date} at {int.time} · Interviewer: {int.interviewer}
                          </p>
                        </div>
                      </div>

                      {int.meetingLink && (
                        <a
                          href={int.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
                        >
                          Join Call <ExternalLink className="h-3 w-3 ml-0.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule New Interview Form */}
            <form onSubmit={handleScheduleSubmit} className="rounded-2xl border bg-muted/30 p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary" /> Book Next Interview Round
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Interview Type</Label>
                  <Select value={intType} onValueChange={setIntType}>
                    <SelectTrigger className="text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR Screening">HR Screening</SelectItem>
                      <SelectItem value="Technical">Technical Pairing</SelectItem>
                      <SelectItem value="System Design">System Design</SelectItem>
                      <SelectItem value="Behavioral">Behavioral / Leadership</SelectItem>
                      <SelectItem value="Executive">Executive Final Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Interviewer</Label>
                  <Input
                    className="text-xs bg-background"
                    value={intInterviewer}
                    onChange={(e) => setIntInterviewer(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    className="text-xs bg-background"
                    value={intDate}
                    onChange={(e) => setIntDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Time (with timezone)</Label>
                  <Input
                    className="text-xs bg-background"
                    value={intTime}
                    onChange={(e) => setIntTime(e.target.value)}
                    placeholder="e.g. 14:00 EST"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Video Meeting Link</Label>
                <Input
                  className="text-xs bg-background"
                  value={intLink}
                  onChange={(e) => setIntLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <Button type="submit" size="sm" className="w-full text-xs">
                Confirm & Add Interview
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
