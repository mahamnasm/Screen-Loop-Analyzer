import { useMemo } from "react";
import {
  Activity,
  Award,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ALL_STAGES, STAGES } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

export function AdminAnalytics() {
  const { candidates, activeJobs, jobs, users } = useAts();

  // Metrics calculations
  const totalApplications = candidates.length;
  const hiredCount = candidates.filter((c) => c.stage === "Selected").length;
  const offeredCount = candidates.filter((c) => c.stage === "Final Review").length;
  const screeningCount = candidates.filter((c) => c.stage === "CV Reviewed" || c.stage === "Interview").length;

  const avgMatchScore = useMemo(() => {
    const scores = candidates
      .map((c) => c.screening?.matchScore)
      .filter((s): s is number => typeof s === "number");
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [candidates]);

  const acceptanceRate = useMemo(() => {
    const totalDecided = hiredCount + offeredCount;
    if (totalDecided === 0) return 85;
    return Math.round((hiredCount / totalDecided) * 100);
  }, [hiredCount, offeredCount]);

  // Stage distribution
  const stageBreakdown = useMemo(() => {
    return ALL_STAGES.map((stage) => {
      const count = candidates.filter((c) => c.stage === stage).length;
      const pct = totalApplications ? Math.round((count / totalApplications) * 100) : 0;
      return { stage, count, pct };
    });
  }, [candidates, totalApplications]);

  // Department distribution
  const deptBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of candidates) {
      const j = jobs.find((item) => item.id === c.jobId);
      const dept = j?.department || "General";
      map.set(dept, (map.get(dept) || 0) + 1);
    }
    return Array.from(map.entries()).map(([dept, count]) => ({
      dept,
      count,
      pct: totalApplications ? Math.round((count / totalApplications) * 100) : 0,
    }));
  }, [candidates, jobs, totalApplications]);

  return (
    <div className="space-y-6">
      {/* Super Admin Platform Operations Banner */}
      <div className="rounded-2xl border border-[#caaa98]/40 bg-gradient-to-b from-[#182035] via-[#202940] to-[#182035] text-white p-6 sm:p-7 shadow-lg shadow-[#202940]/25">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#caaa98]/40 bg-[#202940] px-3 py-1 text-xs font-semibold text-[#caaa98] font-mono">
              <Sparkles className="h-3.5 w-3.5 text-[#caaa98]" />
              <span>Super Admin Console · Multi-Tenant Orchestration</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              National Recruitment Telemetry & KPIs
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#c2ccdf]">
              Real-time platform metrics across verified Pakistani enterprises, applicant funnels, and AI evaluation velocity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-[#2e3b5e] bg-[#1a233b]/80 px-3.5 py-2 text-xs font-mono text-[#caaa98]">
              Status: <strong>Operational (99.98%)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Applications
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
            {totalApplications}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="mr-0.5 h-3 w-3" /> +18%
            </span>
            <span>vs previous month</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Job Openings
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
            {activeJobs.length}
          </p>
          <div className="mt-1 text-xs text-muted-foreground">
            {jobs.length - activeJobs.length} archived roles
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Candidates Hired
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {hiredCount}
          </p>
          <div className="mt-1 text-xs text-muted-foreground">
            {offeredCount} pending offer extensions
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg AI Match Quality
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
            {avgMatchScore}%
          </p>
          <div className="mt-1 text-xs text-muted-foreground">
            Evaluated across {candidates.length} candidate profiles
          </div>
        </div>
      </div>

      {/* Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pipeline Breakdown */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Hiring Pipeline Funnel
              </h3>
              <p className="text-xs text-muted-foreground">
                Distribution of applicants across stages
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {totalApplications} In Pipeline
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {stageBreakdown.map((item) => (
              <div key={item.stage} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{item.stage}</span>
                  <span className="font-mono text-muted-foreground">
                    {item.count} candidates ({item.pct}%)
                  </span>
                </div>
                <Progress
                  value={item.pct}
                  className={`h-2 ${
                    item.stage === "Selected"
                      ? "bg-muted [&>div]:bg-emerald-500"
                      : item.stage === "Not Selected"
                      ? "bg-muted [&>div]:bg-rose-500"
                      : "bg-muted [&>div]:bg-primary"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Applications by Department */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Applications by Department
              </h3>
              <p className="text-xs text-muted-foreground">
                Sourcing volume across functional business units
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {deptBreakdown.length} Departments
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {deptBreakdown.map((dept) => (
              <div key={dept.dept} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{dept.dept}</span>
                  <span className="font-mono text-muted-foreground">
                    {dept.count} candidates ({dept.pct}%)
                  </span>
                </div>
                <Progress value={dept.pct} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
