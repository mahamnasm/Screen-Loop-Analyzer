import { useState } from "react";
import {
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isJobExpired, type Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

import { ApplyModal } from "./ApplyModal";
import { JobDetailsModal } from "./JobDetailsModal";

export function SavedJobsView() {
  const { savedJobs, toggleSaveJob, candidateApplications } = useAts();

  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  const appliedJobIds = new Set(candidateApplications.map((a) => a.jobId));

  if (savedJobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center bg-card">
        <BookmarkCheck className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold text-foreground text-base">No saved jobs yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Bookmark interesting job postings on the Job Board to easily review and apply for them later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Saved Job Postings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your bookmarked opportunities across top Pakistani tech companies.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {savedJobs.length} Saved Role{savedJobs.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedJobs.map((job) => {
          const hasApplied = appliedJobIds.has(job.id);
          const isClosed = isJobExpired(job.deadline) || job.status === "closed";

          return (
            <div
              key={job.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition hover:border-primary/60 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-[11px]">
                    {job.company}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSaveJob(job.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    title="Remove from saved jobs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <h3
                  onClick={() => {
                    setDetailsJob(job);
                    setDetailsOpen(true);
                  }}
                  className="mt-2.5 font-display text-base font-bold text-foreground hover:text-primary transition cursor-pointer"
                >
                  {job.title}
                </h3>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.city}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground/80">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    {job.salaryDisplayPKR}
                  </span>
                </div>

                <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDetailsJob(job);
                    setDetailsOpen(true);
                  }}
                  className="text-xs h-8"
                >
                  Details
                </Button>

                <Button
                  size="sm"
                  disabled={isClosed}
                  onClick={() => {
                    setApplyJob(job);
                    setApplyOpen(true);
                  }}
                  className="text-xs h-8"
                >
                  {isClosed
                    ? "Closed"
                    : hasApplied
                    ? "Applied ✓"
                    : "Apply Now"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <JobDetailsModal
        job={detailsJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onApplyClick={(j) => {
          setApplyJob(j);
          setApplyOpen(true);
        }}
      />

      <ApplyModal
        job={applyJob}
        open={applyOpen}
        onOpenChange={setApplyOpen}
      />
    </div>
  );
}
