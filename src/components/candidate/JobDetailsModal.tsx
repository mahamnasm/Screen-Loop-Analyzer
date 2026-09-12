import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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
import { Separator } from "@/components/ui/separator";
import { evaluateSalaryFit } from "@/lib/ai-services";
import { getDaysUntilDeadline, isJobExpired, type Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

interface JobDetailsModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyClick: (job: Job) => void;
  onCompareCvClick?: (job: Job) => void;
}

export function JobDetailsModal({
  job,
  open,
  onOpenChange,
  onApplyClick,
  onCompareCvClick,
}: JobDetailsModalProps) {
  const { currentUser } = useAts();

  if (!job) return null;

  const isClosed = isJobExpired(job.deadline) || job.status === "closed";
  const daysLeft = getDaysUntilDeadline(job.deadline);

  // Salary fit comparison
  const salaryFit = evaluateSalaryFit(
    job.salaryMinPKR,
    job.salaryMaxPKR,
    currentUser.expectedSalaryPKR
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-semibold text-xs flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {job.company}
              </Badge>
              {job.isVerifiedCompany && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Employer
                </span>
              )}
            </div>

            {isClosed ? (
              <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-xs font-bold">
                Applications Closed
              </Badge>
            ) : daysLeft <= 3 ? (
              <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-xs font-bold">
                Closing in {daysLeft} day{daysLeft === 1 ? "" : "s"}!
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Closing in {daysLeft} days
              </span>
            )}
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight mt-2">
            {job.title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {job.department} · {job.location} · {job.type}
          </DialogDescription>
        </DialogHeader>

        {/* 4 Summary Highlight Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-1">
          <div className="rounded-xl border bg-muted/40 p-2.5 text-center">
            <MapPin className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-[11px] text-muted-foreground">Location</p>
            <p className="text-xs font-semibold truncate">{job.city}</p>
          </div>
          <div className="rounded-xl border bg-muted/40 p-2.5 text-center">
            <DollarSign className="h-4 w-4 mx-auto text-emerald-700 dark:text-emerald-400 mb-1" />
            <p className="text-[11px] text-muted-foreground">Compensation</p>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">{job.salaryDisplayPKR}</p>
          </div>
          <div className="rounded-xl border bg-muted/40 p-2.5 text-center">
            <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-[11px] text-muted-foreground">Experience</p>
            <p className="text-xs font-semibold">{job.minExperience}+ Years</p>
          </div>
          <div className="rounded-xl border bg-muted/40 p-2.5 text-center">
            <Briefcase className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-[11px] text-muted-foreground">Employment</p>
            <p className="text-xs font-semibold">{job.type}</p>
          </div>
        </div>

        {/* Salary Match Intelligence Widget */}
        <div className={`rounded-xl border p-3.5 space-y-1.5 ${salaryFit.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Pakistani Market Salary Intelligence
            </span>
            <Badge className={`text-[10px] font-bold ${salaryFit.color} bg-background/80`}>
              Fit: {salaryFit.fit}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {salaryFit.description}
          </p>
          <div className="text-[11px] text-muted-foreground flex items-center gap-4 pt-1">
            <span>Posted: <strong>{job.salaryDisplayPKR}</strong></span>
            <span>Your Target: <strong>PKR {((currentUser.expectedSalaryPKR || 250000) / 1000).toFixed(0)}k/mo</strong></span>
          </div>
        </div>

        <div className="space-y-4 text-sm text-foreground/90">
          <div>
            <h4 className="font-semibold text-foreground text-sm">Role Mission</h4>
            <p className="mt-1.5 leading-relaxed text-muted-foreground text-xs sm:text-sm">
              {job.description}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-foreground text-sm">Key Responsibilities</h4>
            <ul className="mt-2 space-y-1.5">
              {job.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-foreground text-sm">Required Technical Stack</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.requiredSkills.map((skill) => (
                <Badge key={skill} variant="default" className="text-xs font-mono">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {job.optionalSkills.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground text-sm">Nice-to-Have Skills</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {job.optionalSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs font-mono">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Criteria Weighting */}
          <div className="rounded-xl border bg-muted/40 p-3 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Transparent Screening Rubric: </span>
              This opening weighs {job.skillsWeight}% on tech skill verification and {100 - job.skillsWeight}% on career experience.
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
          {onCompareCvClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onCompareCvClick(job);
              }}
              className="text-xs gap-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Compare My CV
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              size="sm"
              disabled={isClosed}
              onClick={() => {
                onOpenChange(false);
                onApplyClick(job);
              }}
            >
              {isClosed ? "Applications Closed" : "Apply for this Role"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
