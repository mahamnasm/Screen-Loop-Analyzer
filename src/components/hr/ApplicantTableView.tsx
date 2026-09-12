import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Search,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ALL_STAGES, type Candidate, type Stage } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

import { CandidateEvaluationModal } from "./CandidateEvaluationModal";

export function ApplicantTableView() {
  const { isolatedCandidates, isolatedJobs, moveCandidate } = useAts();

  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"score" | "date" | "name">("score");
  const [sortAsc, setSortAsc] = useState(false);

  // Selected candidate for modal review
  const [evalCandidate, setEvalCandidate] = useState<Candidate | null>(null);
  const [evalOpen, setEvalOpen] = useState(false);

  const filteredCandidates = useMemo(() => {
    return isolatedCandidates
      .filter((c) => {
        if (stageFilter !== "all" && c.stage !== stageFilter) return false;
        if (jobFilter !== "all" && c.jobId !== jobFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = c.name.toLowerCase().includes(q);
          const matchesEmail = c.email.toLowerCase().includes(q);
          const matchesSkill = c.screening?.matchedRequired.some((s) =>
            s.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesEmail && !matchesSkill) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === "score") {
          diff = (b.screening?.matchScore ?? -1) - (a.screening?.matchScore ?? -1);
        } else if (sortField === "date") {
          diff = b.appliedAt - a.appliedAt;
        } else if (sortField === "name") {
          diff = a.name.localeCompare(b.name);
        }
        return sortAsc ? -diff : diff;
      });
  }, [isolatedCandidates, stageFilter, jobFilter, searchQuery, sortField, sortAsc]);

  const getJobInfo = (jobId: string) => {
    const j = isolatedJobs.find((item) => item.id === jobId);
    return {
      title: j?.title || "General Role",
      company: j?.company || "Systems Limited",
      salary: j?.salaryDisplayPKR || "PKR 150k - 220k / month",
    };
  };

  const scoreTone = (score: number) => {
    if (score >= 75)
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold";
    if (score >= 50)
      return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold";
    return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold";
  };

  const toggleSort = (field: "score" | "date" | "name") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="rounded-2xl border bg-card p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search candidate name, email, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>

          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-52 h-8 text-xs bg-background">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs ({isolatedJobs.length})</SelectItem>
              {isolatedJobs.map((j) => (
                <SelectItem key={j.id} value={j.id} className="text-xs">
                  {j.title} ({j.company})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40 h-8 text-xs bg-background">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {ALL_STAGES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredCandidates.length}</strong> applicant{filteredCandidates.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-1 font-bold">
                  Candidate <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="font-bold">Applied Position</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("score")}
              >
                <div className="flex items-center gap-1 font-bold">
                  AI Match <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="font-bold">Pipeline Stage</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("date")}
              >
                <div className="flex items-center gap-1 font-bold">
                  Submitted <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {filteredCandidates.map((c) => {
              const s = c.screening;
              const jobInfo = getJobInfo(c.jobId);

              return (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-xs">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          @{c.username || c.name.toLowerCase().replace(/\s+/g, ".")} · {c.city}, Pakistan
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-xs text-primary">{jobInfo.company}</span>
                    <p className="font-medium text-foreground text-xs">{jobInfo.title}</p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold font-mono">{jobInfo.salary}</p>
                  </TableCell>

                  <TableCell>
                    {s ? (
                      <Badge className={`font-mono font-bold text-xs ${scoreTone(s.matchScore)}`}>
                        {s.matchScore}%
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Select
                      value={c.stage}
                      onValueChange={(stg) => moveCandidate(c.id, stg as Stage)}
                    >
                      <SelectTrigger className="h-7 text-xs w-36 bg-background">
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
                  </TableCell>

                  <TableCell className="text-muted-foreground font-mono text-[11px]">
                    {new Date(c.appliedAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEvalCandidate(c);
                        setEvalOpen(true);
                      }}
                      className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-3.5 w-3.5" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredCandidates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                  No applicants matching current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CandidateEvaluationModal
        candidate={evalCandidate}
        open={evalOpen}
        onOpenChange={setEvalOpen}
      />
    </div>
  );
}
