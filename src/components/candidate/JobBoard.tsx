import { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
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
import { aiServices } from "@/lib/ai-services";
import { getDaysUntilDeadline, isJobExpired, type Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

import { ApplyModal } from "./ApplyModal";
import { CvImproverModal } from "./CvImproverModal";
import { JobCvMatchModal } from "./JobCvMatchModal";
import { JobDetailsModal } from "./JobDetailsModal";

export function JobBoard() {
  const { activeJobs, jobs, isolatedJobs, candidateApplications, currentUser, toggleSaveJob } =
    useAts();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>("all");
  const [selectedDegree, setSelectedDegree] = useState<string>("all");

  // Inferred candidate qualification for degree matching
  const candidateInferredDegree = useMemo(() => {
    const title = (currentUser.title || "").toLowerCase();
    if (title.includes("engineer") || title.includes("developer") || title.includes("cs")) {
      return "BS Computer Science";
    }
    if (title.includes("market") || title.includes("business") || title.includes("mba")) {
      return "BBA / MBA";
    }
    if (title.includes("finance") || title.includes("account")) {
      return "BS Accounting & Finance";
    }
    return "BS Computer Science";
  }, [currentUser]);

  // Modal states
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [matchJob, setMatchJob] = useState<Job | null>(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [improverJob, setImproverJob] = useState<Job | null>(null);
  const [improverOpen, setImproverOpen] = useState(false);

  // Available Pakistani cities
  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Peshawar",
    "Faisalabad",
    "Multan",
  ];

  // Base jobs strictly isolated by role
  const baseJobs = useMemo(() => {
    if (currentUser.role === "hr" || currentUser.role === "company") {
      return isolatedJobs;
    }
    if (currentUser.role === "candidate") {
      return activeJobs;
    }
    return jobs;
  }, [currentUser.role, isolatedJobs, activeJobs, jobs]);

  // Unique departments
  const departments = useMemo(() => {
    return Array.from(new Set(baseJobs.map((j) => j.department)));
  }, [baseJobs]);

  // Set of applied job IDs
  const appliedJobIds = useMemo(() => {
    return new Set(candidateApplications.map((a) => a.jobId));
  }, [candidateApplications]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return baseJobs.filter((job) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesDept = job.department.toLowerCase().includes(q);
        const matchesCity = job.city.toLowerCase().includes(q);
        const matchesDegree = (job.preferredDegree || "").toLowerCase().includes(q);
        const matchesSkills = job.requiredSkills.some((s) => s.toLowerCase().includes(q));
        if (
          !matchesTitle &&
          !matchesCompany &&
          !matchesDept &&
          !matchesCity &&
          !matchesSkills &&
          !matchesDegree
        ) {
          return false;
        }
      }

      // City filter
      if (selectedCity !== "all" && job.city !== selectedCity) {
        return false;
      }

      // Department filter
      if (selectedDept !== "all" && job.department !== selectedDept) {
        return false;
      }

      // PKR Salary filter
      if (selectedSalaryRange !== "all") {
        if (selectedSalaryRange === "under-50k" && job.salaryMaxPKR > 50000) return false;
        if (
          selectedSalaryRange === "50k-100k" &&
          (job.salaryMinPKR > 100000 || job.salaryMaxPKR < 50000)
        )
          return false;
        if (
          selectedSalaryRange === "100k-150k" &&
          (job.salaryMinPKR > 150000 || job.salaryMaxPKR < 100000)
        )
          return false;
        if (
          selectedSalaryRange === "150k-250k" &&
          (job.salaryMinPKR > 250000 || job.salaryMaxPKR < 150000)
        )
          return false;
        if (selectedSalaryRange === "250k+" && job.salaryMaxPKR < 250000) return false;
      }

      // Preferred Degree filter
      if (selectedDegree !== "all") {
        const pref = (job.preferredDegree || "").toLowerCase();
        if (
          selectedDegree === "bscs" &&
          !(
            pref.includes("computer") ||
            pref.includes("software") ||
            pref.includes("bscs") ||
            pref.includes("it")
          )
        )
          return false;
        if (
          selectedDegree === "business" &&
          !(
            pref.includes("bba") ||
            pref.includes("mba") ||
            pref.includes("marketing") ||
            pref.includes("business")
          )
        )
          return false;
        if (
          selectedDegree === "finance" &&
          !(
            pref.includes("accounting") ||
            pref.includes("finance") ||
            pref.includes("acca") ||
            pref.includes("ca")
          )
        )
          return false;
        if (
          selectedDegree === "engineering" &&
          !(
            pref.includes("mechanical") ||
            pref.includes("electrical") ||
            pref.includes("civil") ||
            pref.includes("mechatronics")
          )
        )
          return false;
        if (
          selectedDegree === "healthcare" &&
          !(
            pref.includes("pharm") ||
            pref.includes("mbbs") ||
            pref.includes("health") ||
            pref.includes("biotech")
          )
        )
          return false;
        if (
          selectedDegree === "supplychain" &&
          !(pref.includes("supply") || pref.includes("logistics") || pref.includes("operations"))
        )
          return false;
      }

      return true;
    });
  }, [baseJobs, searchQuery, selectedCity, selectedDept, selectedSalaryRange, selectedDegree]);

  const handleOpenDetails = (job: Job) => {
    setDetailsJob(job);
    setDetailsOpen(true);
  };

  const handleOpenApply = (job: Job) => {
    setApplyJob(job);
    setApplyOpen(true);
  };

  const handleOpenMatch = (job: Job) => {
    setMatchJob(job);
    setMatchOpen(true);
  };

  const isEmployerRole = currentUser.role === "hr" || currentUser.role === "company";

  return (
    <div className="space-y-6">
      {/* Search & Header Bar */}
      <div className="rounded-2xl border bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-7 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isEmployerRole
                ? `${currentUser.company || "Company"} Isolated Requisition Board`
                : "Verified Pakistani Employer Job Portal"}
            </span>
          </div>
          <h2 className="mt-2.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {isEmployerRole
              ? `Job Openings & Requisitions (${baseJobs.length})`
              : "Explore Open Vacancies Across Pakistan"}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isEmployerRole
              ? `Internal scoped job requisitions for ${currentUser.company || "your organization"}. Candidates applying to these roles will appear in your hiring pipeline.`
              : "Discover roles in Karachi, Lahore, Islamabad, and across Pakistan. Benchmark your CV match score and view transparent monthly PKR compensation."}
          </p>
        </div>

        {/* 5-Column Search & Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="relative sm:col-span-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Job title, company (Systems, 10Pearls...), or skill (React, Python...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background text-xs h-9"
            />
          </div>

          <div className="sm:col-span-2">
            <Select value={selectedDegree} onValueChange={setSelectedDegree}>
              <SelectTrigger className="bg-background text-xs h-9">
                <SelectValue placeholder="Degree / Education" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Qualifications</SelectItem>
                <SelectItem value="bscs">BS Computer Science / IT</SelectItem>
                <SelectItem value="business">BBA / MBA / Marketing</SelectItem>
                <SelectItem value="finance">Accounting / Finance / ACCA</SelectItem>
                <SelectItem value="engineering">Engineering (Mech/Civil/Elec)</SelectItem>
                <SelectItem value="healthcare">Healthcare / PharmD</SelectItem>
                <SelectItem value="supplychain">Supply Chain / Logistics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-background text-xs h-9">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Select value={selectedSalaryRange} onValueChange={setSelectedSalaryRange}>
              <SelectTrigger className="bg-background text-xs h-9">
                <SelectValue placeholder="Salary (PKR)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salary Ranges</SelectItem>
                <SelectItem value="under-50k">Under PKR 50k</SelectItem>
                <SelectItem value="50k-100k">PKR 50k – 100k</SelectItem>
                <SelectItem value="100k-150k">PKR 100k – 150k</SelectItem>
                <SelectItem value="150k-250k">PKR 150k – 250k</SelectItem>
                <SelectItem value="250k+">PKR 250k+ / month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="bg-background text-xs h-9">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Counter strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground border-t pt-3">
          <span>
            Showing <strong className="text-foreground">{filteredJobs.length}</strong> opportunities
            in Pakistan
          </span>
          <span className="text-[11px] italic">
            Salaries shown in PKR (Pakistani Rupee) · Verified local & remote employers
          </span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => {
          const hasApplied = appliedJobIds.has(job.id);
          const isSaved = currentUser.savedJobIds.includes(job.id);
          const isClosed = isJobExpired(job.deadline) || job.status === "closed";
          const daysLeft = getDaysUntilDeadline(job.deadline);

          return (
            <div
              key={job.id}
              className={`flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition hover:border-primary/60 hover:shadow-md ${
                isClosed ? "opacity-75 bg-muted/20" : ""
              }`}
            >
              <div>
                {/* Header: Company + Save Bookmark */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Building2 className="h-3 w-3" />
                      {job.company}
                    </Badge>
                    {job.isVerifiedCompany && (
                      <span title="Verified Pakistani Employer">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSaveJob(job.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    title={isSaved ? "Remove from saved" : "Save this job"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-primary fill-primary/20" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Job Title */}
                <h3
                  onClick={() => handleOpenDetails(job)}
                  className="mt-2.5 font-display text-base font-bold text-foreground hover:text-primary transition cursor-pointer"
                >
                  {job.title}
                </h3>

                {/* Location, Salary in PKR, Experience */}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.city}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                    <DollarSign className="h-3 w-3" />
                    {job.salaryDisplayPKR}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.minExperience}+ yrs exp
                  </span>
                </div>

                {/* Preferred Degree & AI Match Badge */}
                {job.preferredDegree && (
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-muted text-foreground/90 border flex items-center gap-1 font-medium py-0.5"
                    >
                      <GraduationCap className="h-3 w-3 text-primary" />
                      <span className="truncate max-w-[190px]">{job.preferredDegree}</span>
                    </Badge>

                    {aiServices.checkDegreeAlignment(candidateInferredDegree, job.preferredDegree)
                      .aligned && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 flex items-center gap-1 font-bold py-0.5"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>Eligible Degree</span>
                      </Badge>
                    )}
                  </div>
                )}

                {/* Deadline Status Badge */}
                <div className="mt-2.5 flex items-center gap-2">
                  {isClosed ? (
                    <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold">
                      Applications Closed
                    </Badge>
                  ) : daysLeft <= 3 ? (
                    <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
                      Closing in {daysLeft} day{daysLeft === 1 ? "" : "s"}!
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      Closing in {daysLeft} days
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px] font-mono">
                      {s}
                    </Badge>
                  ))}
                  {job.requiredSkills.length > 3 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{job.requiredSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenMatch(job)}
                  className="text-xs h-8 gap-1"
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                  Compare CV
                </Button>

                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDetails(job)}
                    className="text-xs h-8"
                  >
                    Details
                  </Button>

                  <Button
                    size="sm"
                    disabled={isClosed}
                    onClick={() => handleOpenApply(job)}
                    className="text-xs h-8"
                  >
                    {isClosed ? "Closed" : hasApplied ? "Applied ✓" : "Apply Now"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <JobDetailsModal
        job={detailsJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onApplyClick={handleOpenApply}
      />

      <ApplyModal job={applyJob} open={applyOpen} onOpenChange={setApplyOpen} />

      <JobCvMatchModal
        job={matchJob}
        open={matchOpen}
        onOpenChange={setMatchOpen}
        onApplyClick={handleOpenApply}
        onImproveCvClick={(j) => {
          setImproverJob(j);
          setImproverOpen(true);
        }}
      />

      <CvImproverModal job={improverJob} open={improverOpen} onOpenChange={setImproverOpen} />
    </div>
  );
}
