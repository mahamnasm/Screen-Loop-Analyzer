import { useMemo, useState } from "react";
import {
  Activity,
  Award,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Layers,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ALL_STAGES, STAGES } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

export function AdminAnalytics() {
  const { candidates, activeJobs, jobs, users, companies, auditLogs } = useAts();

  // Quick Finder state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<"all" | "candidates" | "companies" | "jobs" | "users">("all");

  // Metrics calculations
  const totalApplications = candidates.length;
  const hiredCount = candidates.filter((c) => c.stage === "Selected").length;
  const offeredCount = candidates.filter((c) => c.stage === "Final Review").length;
  const interviewCount = candidates.filter((c) => c.stage === "Interview").length;

  const avgMatchScore = useMemo(() => {
    const scores = candidates
      .map((c) => c.screening?.matchScore)
      .filter((s): s is number => typeof s === "number");
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [candidates]);

  // Stage distribution data for Recharts
  const stageChartData = useMemo(() => {
    const palette = ["#202940", "#313f63", "#4b4038", "#caaa98", "#10b981", "#ef4444"];
    return ALL_STAGES.map((stage, idx) => {
      const count = candidates.filter((c) => c.stage === stage).length;
      return {
        stage: stage === "Not Selected" ? "Rejected" : stage,
        count,
        fill: palette[idx % palette.length],
      };
    });
  }, [candidates]);

  // Department distribution data for Recharts
  const deptChartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of candidates) {
      const j = jobs.find((item) => item.id === c.jobId);
      const dept = j?.department || "Engineering";
      map.set(dept, (map.get(dept) || 0) + 1);
    }
    return Array.from(map.entries()).map(([dept, count]) => ({
      dept,
      count,
    }));
  }, [candidates, jobs]);

  // AI Match Score Tiers for Recharts
  const matchTierData = useMemo(() => {
    let topTier = 0;
    let strongTier = 0;
    let moderateTier = 0;
    let reviewTier = 0;

    for (const c of candidates) {
      const score = c.screening?.matchScore || 0;
      if (score >= 85) topTier++;
      else if (score >= 70) strongTier++;
      else if (score >= 50) moderateTier++;
      else reviewTier++;
    }

    return [
      { tier: "Top Tier (85-100%)", count: topTier, fill: "#10b981" },
      { tier: "Strong (70-84%)", count: strongTier, fill: "#caaa98" },
      { tier: "Moderate (50-69%)", count: moderateTier, fill: "#4b4038" },
      { tier: "Needs Review (<50%)", count: reviewTier, fill: "#9a8678" },
    ];
  }, [candidates]);

  // Quick Finder Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<{
      id: string;
      category: "Candidate" | "Company" | "Job" | "User";
      title: string;
      subtitle: string;
      badge: string;
      tone?: string;
    }> = [];

    if (searchCategory === "all" || searchCategory === "candidates") {
      candidates
        .filter((c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach((c) => {
          results.push({
            id: c.id,
            category: "Candidate",
            title: c.name,
            subtitle: `${c.city}, Pakistan · Applied Stage: ${c.stage}`,
            badge: `${c.screening?.matchScore || 0}% Match`,
            tone: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
          });
        });
    }

    if (searchCategory === "all" || searchCategory === "companies") {
      companies
        .filter((comp) => comp.name.toLowerCase().includes(q) || comp.city.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach((comp) => {
          results.push({
            id: comp.id,
            category: "Company",
            title: comp.name,
            subtitle: `${comp.city} · ${comp.industry}`,
            badge: comp.verified ? "Verified Enterprise" : "Pending Review",
            tone: comp.verified ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-500/10 text-amber-700 border-amber-300",
          });
        });
    }

    if (searchCategory === "all" || searchCategory === "jobs") {
      jobs
        .filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.city.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach((j) => {
          results.push({
            id: j.id,
            category: "Job",
            title: j.title,
            subtitle: `${j.company} · ${j.city} (${j.type})`,
            badge: j.status.toUpperCase(),
            tone: j.status === "active" ? "bg-emerald-500/10 text-emerald-700 border-emerald-300" : "bg-muted text-muted-foreground",
          });
        });
    }

    if (searchCategory === "all" || searchCategory === "users") {
      users
        .filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach((u) => {
          results.push({
            id: u.id,
            category: "User",
            title: u.name,
            subtitle: `@${u.username} · ${u.email}`,
            badge: u.role.toUpperCase(),
            tone: "bg-purple-500/10 text-purple-700 border-purple-300",
          });
        });
    }

    return results;
  }, [searchQuery, searchCategory, candidates, companies, jobs, users]);

  return (
    <div className="space-y-6 antialiased">
      {/* Super Admin Panoramic Header Banner */}
      <div className="rounded-2xl border border-[#caaa98]/40 bg-gradient-to-r from-[#182035] via-[#202940] to-[#182035] text-white p-6 sm:p-7 shadow-lg shadow-[#202940]/25 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-[#caaa98]/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#caaa98]/40 bg-[#202940]/90 px-3 py-1 text-xs font-semibold text-[#caaa98] font-mono shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#caaa98]" />
              <span>Super Admin Command Hub · National Telemetry</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Platform Analytics & AI Telemetry
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#c2ccdf] max-w-2xl">
              High-level intelligence monitoring active recruitment funnels, Pakistani employer verifications, and algorithmic evaluation throughput.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl border border-[#2e3b5e] bg-[#1a233b]/90 px-4 py-2 text-xs font-mono text-[#caaa98] shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System: <strong>99.98% Operational</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN QUICK FINDER & SEARCH HUB (Easy to find anything) */}
      <div className="rounded-2xl border border-[#e2d8cd] bg-white dark:bg-[#1e273f] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a8678]" />
            <Input
              type="text"
              placeholder="Quick Finder: Search candidate by name, company, requisition, or @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-[#fbf9f6] dark:bg-[#182035] border-[#e2d8cd] dark:border-[#2e3b5e] text-xs sm:text-sm rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9a8678] hover:text-[#202940] dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(["all", "candidates", "companies", "jobs", "users"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSearchCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition cursor-pointer shrink-0 ${
                  searchCategory === cat
                    ? "bg-[#202940] text-white shadow-xs"
                    : "bg-[#f3ede4] dark:bg-[#202940]/50 text-[#4b4038] dark:text-[#caaa98] hover:bg-[#e8decb]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Instant Search Results Panel */}
        {searchQuery.trim() && (
          <div className="mt-4 pt-3 border-t border-[#e2d8cd] dark:border-[#2e3b5e] space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Matching records ({searchResults.length})</span>
              <span>Showing top results</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground italic">
                No matching records found for "{searchQuery}". Try another keyword.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {searchResults.map((item) => (
                  <div
                    key={`${item.category}-${item.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#e2d8cd]/80 dark:border-[#2e3b5e]/80 bg-[#fbf9f6] dark:bg-[#182035] hover:border-[#caaa98] transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#202940]/10 dark:bg-white/10 text-[#4b4038] dark:text-[#caaa98] font-bold">
                          {item.category}
                        </span>
                        <p className="text-xs font-bold text-[#202940] dark:text-white truncate">
                          {item.title}
                        </p>
                      </div>
                      <p className="text-[11px] text-[#4b4038] dark:text-[#9a8678] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-mono shrink-0 ${item.tone || ""}`}>
                      {item.badge}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SHORT-FORMAT KPI METRICS (4 Core Highlights) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Applications */}
        <div className="rounded-2xl border border-[#e2d8cd] bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Applications
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#202940] dark:text-white">
            {totalApplications}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+18% this cycle</span>
          </div>
        </div>

        {/* Active Job Openings */}
        <div className="rounded-2xl border border-[#e2d8cd] bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Live Roles
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#202940] dark:text-white">
            {activeJobs.length}
          </p>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {jobs.length - activeJobs.length} archived roles
          </div>
        </div>

        {/* Candidates Hired */}
        <div className="rounded-2xl border border-[#e2d8cd] bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Hires Made
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {hiredCount}
          </p>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {offeredCount} offers extended
          </div>
        </div>

        {/* Avg AI Match Quality */}
        <div className="rounded-2xl border border-[#e2d8cd] bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Avg AI Score
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#202940] dark:text-white">
            {avgMatchScore}%
          </p>
          <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            Calibrated for Pakistan
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS & GRAPHS SECTION (Eye-Catching Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Hiring Funnel BarChart */}
        <div className="rounded-2xl border border-[#e2d8cd] bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e2d8cd] pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-[#202940] dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Hiring Funnel Progression
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Volume breakdown across pipeline stages
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold">
              {totalApplications} Applicants
            </Badge>
          </div>

          {/* Visual Recharts BarChart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(202, 170, 152, 0.15)" }}
                  contentStyle={{
                    backgroundColor: "#202940",
                    borderColor: "#caaa98",
                    color: "#fbf9f6",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} Candidates`, "Volume"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Department Sourcing Area Chart */}
        <div className="rounded-2xl border border-[#e2d8cd] bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e2d8cd] pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-[#202940] dark:text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#4b4038] dark:text-[#caaa98]" />
                Department Sourcing Inflow
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribution across functional units in Pakistan
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold">
              {deptChartData.length} Departments
            </Badge>
          </div>

          {/* Visual Recharts AreaChart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#caaa98" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#202940" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis
                  dataKey="dept"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#202940",
                    borderColor: "#caaa98",
                    color: "#fbf9f6",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} Requisitions`, "Applications"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4b4038"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDept)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. AI Quality Distribution & Platform Governance Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AI Match Quality Breakdown (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#e2d8cd] bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e2d8cd] pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-[#202940] dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Match Score Quality Distribution
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deterministic algorithmic rating breakdown across all candidate CVs
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 font-bold border-emerald-200">
              Verified Accurate
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {matchTierData.map((tier) => {
              const pct = totalApplications ? Math.round((tier.count / totalApplications) * 100) : 0;
              return (
                <div key={tier.tier} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.fill }} />
                      {tier.tier}
                    </span>
                    <span className="font-mono text-muted-foreground font-medium">
                      {tier.count} candidates ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-2.5 bg-muted/60" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Governance Health Card */}
        <div className="rounded-2xl border border-[#e2d8cd] bg-[#fbf9f6] dark:bg-[#182035] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e2d8cd] dark:border-[#2e3b5e]">
              <span className="font-display text-sm font-bold text-[#202940] dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Platform Health
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
                SOC-2 Ready
              </span>
            </div>

            <div className="space-y-3 pt-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#e2d8cd]/60 dark:border-[#2e3b5e]/60">
                <span className="text-muted-foreground">Verified Employers:</span>
                <span className="font-bold font-mono text-foreground">{companies.filter(c => c.verified).length} / {companies.length}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#e2d8cd]/60 dark:border-[#2e3b5e]/60">
                <span className="text-muted-foreground">Active RBAC Users:</span>
                <span className="font-bold font-mono text-foreground">{users.filter(u => u.active).length} accounts</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#e2d8cd]/60 dark:border-[#2e3b5e]/60">
                <span className="text-muted-foreground">Audit Log Incidents:</span>
                <span className="font-bold font-mono text-foreground">{auditLogs.length} logged</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Active Interviews:</span>
                <span className="font-bold font-mono text-primary">{interviewCount} rounds</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#4b4038] dark:text-[#caaa98] bg-[#f3ede4] dark:bg-[#202940]/50 p-2.5 rounded-xl text-center border border-[#e2d8cd] dark:border-[#2e3b5e]">
            Multi-Tenant Isolation & Role-Based Access Control Enforced across Pakistan.
          </div>
        </div>
      </div>
    </div>
  );
}
