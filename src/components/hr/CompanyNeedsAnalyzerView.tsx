import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Compass,
  FileText,
  Lightbulb,
  MapPin,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { aiServices } from "@/lib/ai-services";
import { useAts } from "@/lib/ats-store";

export function CompanyNeedsAnalyzerView() {
  const { companies, jobs, candidates, currentUser } = useAts();
  const defaultComp =
    currentUser.role === "hr" || currentUser.role === "company"
      ? currentUser.company || "Systems Limited"
      : companies[0]?.name || "Systems Limited";

  const [selectedCompany, setSelectedCompany] = useState<string>(defaultComp);

  const availableCompanies = useMemo(() => {
    if (currentUser.role === "hr" || currentUser.role === "company") {
      const match = companies.filter(
        (c) => c.name.toLowerCase() === (currentUser.company || "").toLowerCase()
      );
      return match.length > 0 ? match : companies.slice(0, 1);
    }
    return companies;
  }, [companies, currentUser]);

  const companyJobs = useMemo(() => {
    return jobs.filter((j) => j.company.toLowerCase() === selectedCompany.toLowerCase());
  }, [jobs, selectedCompany]);

  const companyCandidates = useMemo(() => {
    const jobIds = new Set(companyJobs.map((j) => j.id));
    return candidates.filter((c) => jobIds.has(c.jobId));
  }, [candidates, companyJobs]);

  const analysis = useMemo(() => {
    return aiServices.analyzeCompanyNeeds(
      selectedCompany,
      companyJobs,
      companyCandidates
    );
  }, [selectedCompany, companyJobs, companyCandidates]);

  return (
    <div className="space-y-6">
      {/* Header & Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Company Talent Needs & Market Intelligence
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Macro talent supply vs demand analysis tailored to the Pakistani tech ecosystem (Karachi, Lahore, Islamabad).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Select Company:</span>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="text-xs w-[220px] bg-background font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCompanies.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name} {c.verified ? "✓" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Open Requisitions
          </span>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">
            {companyJobs.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Active roles published across Pakistani hubs
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Sourced Applicants
          </span>
          <p className="mt-2 font-display text-3xl font-extrabold text-primary">
            {companyCandidates.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {companyJobs.length > 0
              ? (companyCandidates.length / companyJobs.length).toFixed(1)
              : 0}{" "}
            applicants per open position
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Talent Market Temperature
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              High Demand
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Senior software engineers are in short supply
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Average Time to Fill
          </span>
          <p className="mt-2 font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            21 Days
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            4 days faster than Pakistani market baseline
          </p>
        </div>
      </div>

      {/* Strategic AI Insights & Recommendations */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Sparkles className="h-4 w-4" />
          <span>Executive Hiring Diagnosis for {selectedCompany}</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          {analysis.strategicOverview}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {analysis.actionItems.map((item: string, i: number) => (
            <div key={i} className="rounded-xl border bg-card p-3.5 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>Strategy #{i + 1}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Demand vs Supply & Regional Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In-Demand Skill Gaps */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-display text-base font-bold text-foreground">
              Skills Demand vs Pakistani Talent Supply
            </h3>
            <p className="text-xs text-muted-foreground">
              Critical competencies required by open requisitions vs available candidate volume.
            </p>
          </div>

          <div className="space-y-3.5">
            {analysis.skillTrends.map((s: { skill: string; demandScore: number; shortage: boolean }) => (
              <div key={s.skill} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{s.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Demand: {s.demandScore}%
                    </span>
                    <Badge
                      className={`text-[10px] ${
                        s.shortage
                          ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                          : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                      }`}
                    >
                      {s.shortage ? "Talent Shortage" : "Adequate Supply"}
                    </Badge>
                  </div>
                </div>
                <Progress value={s.demandScore} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Regional Hubs & Compensation Intelligence */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-display text-base font-bold text-foreground">
              Regional Talent Hub Distribution
            </h3>
            <p className="text-xs text-muted-foreground">
              Candidate application density and PKR salary sensitivity by city.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Karachi Hub
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Largest pool for Backend, FinTech, and Cloud Infrastructure.
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                38% Volume
              </Badge>
            </div>

            <div className="rounded-xl border p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Lahore Hub
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Dominant for React, Mobile (Flutter/React Native), and AI/Data.
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                34% Volume
              </Badge>
            </div>

            <div className="rounded-xl border p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Islamabad & Rawalpindi
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  High concentration of Security, Defense, and Enterprise Systems.
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                18% Volume
              </Badge>
            </div>

            <div className="rounded-xl border p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-primary" /> Remote / Other Cities
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Peshawar, Faisalabad, Multan with high retention rates.
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                10% Volume
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
