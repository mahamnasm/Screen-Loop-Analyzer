import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  Layers,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Video,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cvAnalyzer } from "@/lib/ai-services";
import { isJobExpired, type Job } from "@/lib/ats-engine";
import { CareerBridgeLogo, CareerBridgeHorizonStrip } from "@/components/shared/CareerBridgeBranding";
import { useAts } from "@/lib/ats-store";

import { ApplyModal } from "./ApplyModal";
import { CvAnalyzerModal } from "./CvAnalyzerModal";
import { CvImproverModal } from "./CvImproverModal";
import { JobCvMatchModal } from "./JobCvMatchModal";
import { JobDetailsModal } from "./JobDetailsModal";

interface CandidateDashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export function CandidateDashboardOverview({ onNavigateTab }: CandidateDashboardOverviewProps) {
  const { currentUser, candidateApplications, activeJobs, savedJobs } = useAts();

  // Modals
  const [cvAnalyzerOpen, setCvAnalyzerOpen] = useState(false);
  const [matchJob, setMatchJob] = useState<Job | null>(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [improverJob, setImproverJob] = useState<Job | null>(null);
  const [improverOpen, setImproverOpen] = useState(false);
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    let score = 30; // base
    if (currentUser.name) score += 15;
    if (currentUser.phone) score += 15;
    if (currentUser.city) score += 15;
    if (currentUser.bio && currentUser.bio.length > 30) score += 25;
    return Math.min(100, score);
  }, [currentUser]);

  // General CV score estimate
  const generalCvScore = useMemo(() => {
    if (currentUser.bio) {
      return cvAnalyzer(currentUser.bio).cvScore;
    }
    return 78; // baseline
  }, [currentUser.bio]);

  // Upcoming interviews across all applications
  const upcomingInterviews = useMemo(() => {
    return candidateApplications.flatMap((app) =>
      app.interviews.map((int) => ({
        ...int,
        jobId: app.jobId,
        candidateName: app.name,
      }))
    );
  }, [candidateApplications]);

  // Recommended jobs with explicit reasons
  const recommendedJobs = useMemo(() => {
    return activeJobs.slice(0, 3).map((job, idx) => {
      const matchedSkill = job.requiredSkills[0] || "Software Engineering";
      const secondSkill = job.requiredSkills[1] || "Problem Solving";
      const reason =
        idx === 0
          ? `Recommended because this matches your experience in ${matchedSkill} and ${secondSkill}.`
          : idx === 1
          ? `High hiring demand in ${job.city} for candidates with ${matchedSkill} proficiency.`
          : `Competitive PKR compensation matching your profile preferences in ${job.department}.`;

      return { job, reason };
    });
  }, [activeJobs]);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner — CareerBridge Panoramic Aesthetic */}
      <div
        className="rounded-2xl border border-[#caaa98]/40 p-6 sm:p-8 shadow-xl relative overflow-hidden text-white"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(20, 27, 45, 0.92) 0%, rgba(75, 64, 56, 0.85) 100%), url('/images/careerbridge_hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Subtle dot grid and glowing rim accents */}
        <div className="absolute -bottom-6 -right-6 w-48 h-36 careerbridge-dot-grid opacity-30 pointer-events-none rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-60 h-0.5 bg-gradient-to-l from-[#caaa98]/80 via-[#caaa98]/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1b233a]/80 backdrop-blur-md px-3 py-0.5 text-xs font-semibold text-[#caaa98] border border-[#caaa98]/40 shadow-xs">
                <CareerBridgeLogo className="h-3.5 w-3.5 text-[#caaa98]" />
                <span>Screenloop CareerBridge · Pakistan</span>
              </div>
              <span className="text-[11px] text-white/70 font-mono hidden sm:inline">
                Better Talent | Stronger Companies
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              Your Next Opportunity<br />
              Is <span className="bg-gradient-to-r from-[#caaa98] via-[#dfbeaa] to-[#f5dfd0] bg-clip-text text-transparent">Closer</span> Than You Think
            </h1>

            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
              We connect talented individuals with top companies across Pakistan and beyond.
              Welcome back, <strong className="text-white">{currentUser.name}</strong> (@{currentUser.username}).
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3.5 shrink-0">
            <div className="flex flex-col items-start md:items-end select-none">
              <span className="font-script text-3xl sm:text-4xl text-[#fbf9f6] tracking-wide drop-shadow-md transform -rotate-2">
                Building Better Futures
              </span>
              <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-[#caaa98] to-transparent rounded-full mt-0.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCvAnalyzerOpen(true)}
                className="text-xs gap-1.5 shadow-xs border-[#caaa98]/60 bg-white/10 hover:bg-[#caaa98]/20 text-white backdrop-blur-md"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#caaa98]" />
                AI CV Review
              </Button>
              <Button
                size="sm"
                onClick={() => onNavigateTab("jobs")}
                className="text-xs gap-1.5 shadow-xs bg-[#202940] hover:bg-[#182035] text-[#fbf9f6] border border-[#caaa98]/40 font-semibold"
              >
                <Briefcase className="h-3.5 w-3.5 text-[#caaa98]" />
                Find Jobs
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Frosted Circular Action Discs matching reference image */}
        <div className="mt-7 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <div
            onClick={() => onNavigateTab("jobs")}
            className="flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full glass-pill flex items-center justify-center text-[#caaa98] group-hover:text-white group-hover:border-[#caaa98] shadow-lg shadow-black/25 mb-2 transition">
              <Search className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-[#caaa98] transition">Find Jobs</span>
            <span className="text-[10px] text-white/60 mt-0.5">{activeJobs.length} Live Roles</span>
          </div>

          <div
            onClick={() => onNavigateTab("my-cv")}
            className="flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full glass-pill flex items-center justify-center text-[#caaa98] group-hover:text-white group-hover:border-[#caaa98] shadow-lg shadow-black/25 mb-2 transition">
              <FileCheck className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-[#caaa98] transition">Build Profile</span>
            <span className="text-[10px] text-white/60 mt-0.5">Manage Resume</span>
          </div>

          <div
            onClick={() => onNavigateTab("applications")}
            className="flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full glass-pill flex items-center justify-center text-[#caaa98] group-hover:text-white group-hover:border-[#caaa98] shadow-lg shadow-black/25 mb-2 transition">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-[#caaa98] transition">Get Hired</span>
            <span className="text-[10px] text-white/60 mt-0.5">{candidateApplications.length} Applications</span>
          </div>

          <div
            onClick={() => onNavigateTab("salary-guide")}
            className="flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full glass-pill flex items-center justify-center text-[#caaa98] group-hover:text-white group-hover:border-[#caaa98] shadow-lg shadow-black/25 mb-2 transition">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-[#caaa98] transition">Grow Career</span>
            <span className="text-[10px] text-white/60 mt-0.5">PKR Salary Guide</span>
          </div>
        </div>

        {/* CareerBridge Horizon Footer Strip */}
        <CareerBridgeHorizonStrip className="mt-5" />
      </div>

      {/* 4 Stat Cards — CareerBridge Executive Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completion */}
        <div className="careerbridge-card-elevation rounded-2xl border border-[#e2d8cd] bg-card p-5 shadow-xs space-y-2.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4b4038] uppercase tracking-wider">
              Profile Completeness
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#202940]/5 text-[#202940] flex items-center justify-center group-hover:scale-110 transition border border-[#202940]/10">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold text-[#202940]">
              {profileCompletion}%
            </span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
          <p className="text-[11px] text-muted-foreground pt-0.5">
            Complete profile yields 2.5x more interview invitations
          </p>
        </div>

        {/* CV Score Card */}
        <div className="careerbridge-card-elevation rounded-2xl border border-[#e2d8cd] bg-card p-5 shadow-xs space-y-2.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4b4038] uppercase tracking-wider">
              AI CV Benchmark
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition border border-emerald-500/20">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              {generalCvScore}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">/ 100</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCvAnalyzerOpen(true)}
            className="h-6 p-0 text-xs text-[#202940] hover:text-[#caaa98] hover:underline justify-start font-semibold"
          >
            Review & Improve CV →
          </Button>
        </div>

        {/* Active Applications */}
        <div className="careerbridge-card-elevation rounded-2xl border border-[#e2d8cd] bg-card p-5 shadow-xs space-y-2.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4b4038] uppercase tracking-wider">
              My Applications
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#202940]/5 text-[#202940] flex items-center justify-center group-hover:scale-110 transition border border-[#202940]/10">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-[#202940]">
            {candidateApplications.length}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab("applications")}
            className="h-6 p-0 text-xs text-[#202940] hover:text-[#caaa98] hover:underline justify-start font-semibold"
          >
            Track Application Status →
          </Button>
        </div>

        {/* Saved Jobs */}
        <div className="careerbridge-card-elevation rounded-2xl border border-[#e2d8cd] bg-card p-5 shadow-xs space-y-2.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4b4038] uppercase tracking-wider">
              Saved Roles
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center group-hover:scale-110 transition border border-amber-500/20">
              <BookmarkCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-[#202940]">
            {savedJobs.length}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab("saved")}
            className="h-6 p-0 text-xs text-[#202940] hover:text-[#caaa98] hover:underline justify-start font-semibold"
          >
            View Bookmarked Jobs →
          </Button>
        </div>
      </div>

      {/* Upcoming Interviews Alert if any */}
      {upcomingInterviews.length > 0 && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Upcoming Interview: {upcomingInterviews[0]!.type}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {upcomingInterviews[0]!.date} at {upcomingInterviews[0]!.time} · Interviewer: {upcomingInterviews[0]!.interviewer}
                </p>
              </div>
            </div>

            {upcomingInterviews[0]!.meetingLink && (
              <a
                href={upcomingInterviews[0]!.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
              >
                <Video className="h-3.5 w-3.5" /> Join Video Call
              </a>
            )}
          </div>
        </div>
      )}

      {/* Recommended Jobs for You */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Recommended Roles For Your Profile
            </h3>
            <p className="text-xs text-muted-foreground">
              Curated opportunities matched against your skills and experience level in Pakistan.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab("jobs")}
            className="text-xs"
          >
            View All Jobs →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedJobs.map(({ job, reason }) => (
            <div
              key={job.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-4 sm:p-5 shadow-xs transition hover:border-primary/60 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {job.company}
                  </Badge>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {job.salaryDisplayPKR}
                  </span>
                </div>

                <h4
                  onClick={() => {
                    setDetailsJob(job);
                    setDetailsOpen(true);
                  }}
                  className="mt-2.5 font-display text-base font-bold text-foreground hover:text-primary transition cursor-pointer"
                >
                  {job.title}
                </h4>

                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.city}
                  </span>
                  <span>·</span>
                  <span>{job.minExperience}+ yrs exp</span>
                </div>

                {/* Clear reason why recommended */}
                <div className="mt-3 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground leading-relaxed">
                  💡 <strong className="text-foreground">Why: </strong>
                  {reason}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMatchJob(job);
                    setMatchOpen(true);
                  }}
                  className="text-xs h-8 gap-1"
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                  Compare CV
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    setApplyJob(job);
                    setApplyOpen(true);
                  }}
                  className="text-xs h-8"
                >
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CvAnalyzerModal open={cvAnalyzerOpen} onOpenChange={setCvAnalyzerOpen} />

      <JobCvMatchModal
        job={matchJob}
        open={matchOpen}
        onOpenChange={setMatchOpen}
        onApplyClick={(j) => {
          setApplyJob(j);
          setApplyOpen(true);
        }}
        onImproveCvClick={(j) => {
          setImproverJob(j);
          setImproverOpen(true);
        }}
      />

      <CvImproverModal
        job={improverJob}
        open={improverOpen}
        onOpenChange={setImproverOpen}
      />

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
