import { useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Edit,
  ExternalLink,
  Globe,
  GraduationCap,
  Linkedin,
  MapPin,
  Plus,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CareerBridgeLogo, CareerBridgeScriptWatermark } from "@/components/shared/CareerBridgeBranding";
import { isJobExpired, type Company, type Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

interface CompanyWorkspaceViewProps {
  onNavigateToTab?: (tabId: string) => void;
  onOpenCreateJob?: () => void;
}

export function CompanyWorkspaceView({
  onNavigateToTab,
  onOpenCreateJob,
}: CompanyWorkspaceViewProps) {
  const {
    currentUser,
    companies,
    isolatedJobs,
    isolatedCandidates,
    getCompanyTeam,
    updateCompanyProfile,
  } = useAts();

  // Scoped company
  const company = useMemo(() => {
    return (
      companies.find((c) => c.id === currentUser.companyId || c.name === currentUser.company) ||
      companies[0]
    );
  }, [companies, currentUser]);

  const team = getCompanyTeam(company?.id || "comp-sys-01");

  // Metrics
  const activeJobs = isolatedJobs.filter((j) => j.status === "active" && !isJobExpired(j.deadline));
  const hiredCount = isolatedCandidates.filter((c) => c.stage === "Hired").length;
  const interviewingCount = isolatedCandidates.filter(
    (c) => c.stage === "Interview" || c.stage === "Final Interview"
  ).length;

  // Edit Company Profile modal
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(company?.name || "");
  const [editWebsite, setEditWebsite] = useState(company?.website || "");
  const [editLinkedin, setEditLinkedin] = useState(company?.linkedinUrl || "");
  const [editCity, setEditCity] = useState(company?.city || "Lahore");
  const [editSize, setEditSize] = useState(company?.size || "500-1000 employees");
  const [editIndustry, setEditIndustry] = useState(company?.industry || "Technology");
  const [editDescription, setEditDescription] = useState(company?.description || "");
  const [editBenefits, setEditBenefits] = useState((company?.benefits || []).join(", "));

  const handleOpenEdit = () => {
    if (!company) return;
    setEditName(company.name);
    setEditWebsite(company.website);
    setEditLinkedin(company.linkedinUrl || `https://linkedin.com/company/${company.name.toLowerCase().replace(/\s+/g, "-")}`);
    setEditCity(company.city);
    setEditSize(company.size);
    setEditIndustry(company.industry);
    setEditDescription(company.description);
    setEditBenefits((company.benefits || []).join(", "));
    setEditOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    const benefitsArray = editBenefits
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    updateCompanyProfile(company.id, {
      name: editName.trim(),
      website: editWebsite.trim(),
      linkedinUrl: editLinkedin.trim(),
      city: editCity.trim(),
      size: editSize.trim(),
      industry: editIndustry.trim(),
      description: editDescription.trim(),
      benefits: benefitsArray,
    });
    setEditOpen(false);
  };

  if (!company) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No active company profile found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enterprise Workspace Profile Header — Executive Corporate Midnight Navy & Almond */}
      <div
        className="rounded-2xl border border-[#caaa98]/40 p-6 sm:p-7 shadow-xl relative overflow-hidden text-white"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(20, 27, 45, 0.95) 0%, rgba(32, 41, 64, 0.92) 50%, rgba(75, 64, 56, 0.88) 100%), url('/images/careerbridge_hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Subtle decorative dot grid and glowing rim accents */}
        <div className="absolute -bottom-6 -right-6 w-48 h-36 careerbridge-dot-grid opacity-25 pointer-events-none rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-60 h-0.5 bg-gradient-to-l from-[#caaa98]/80 via-[#caaa98]/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20 rounded-2xl border-2 border-[#caaa98]/50 bg-background shadow-xs">
              <AvatarImage src={company.logo} alt={company.name} />
              <AvatarFallback className="rounded-2xl font-display font-bold text-xl bg-[#caaa98]/20 text-[#caaa98]">
                {company.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {company.name}
                </h1>
                {company.verified && (
                  <Badge
                    variant="outline"
                    className="bg-[#caaa98]/20 text-[#caaa98] border-[#caaa98]/40 text-xs flex items-center gap-1 font-semibold"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Pakistani Employer
                  </Badge>
                )}
                <Badge className="bg-[#4b4038] text-[#fbf9f6] border border-[#9a8678]/40 text-xs">
                  {company.industry}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#c2ccdf]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#caaa98]" />
                  {company.city}, Pakistan
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-[#caaa98]" />
                  {company.size}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium text-white">
                  Tenant ID: <code className="text-[#caaa98] font-mono">{company.id}</code>
                </span>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-[#d8dfef] leading-relaxed max-w-2xl">
                {company.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <CareerBridgeScriptWatermark size="sm" className="hidden sm:flex" />

            <div className="flex flex-wrap md:flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEdit}
              className="text-xs h-9 gap-1.5 bg-[#202940] hover:bg-[#182035] text-[#fbf9f6] border-[#caaa98]/40"
            >
              <Edit className="h-3.5 w-3.5 text-[#caaa98]" />
              Edit Profile
            </Button>

            {company.linkedinUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(company.linkedinUrl, "_blank")}
                className="text-xs h-9 gap-1.5 bg-[#202940] hover:bg-[#182035] text-white hover:text-[#caaa98] border-[#caaa98]/40 shadow-xs"
              >
                <Linkedin className="h-3.5 w-3.5 fill-current text-[#caaa98]" />
                <span className="font-medium text-white">LinkedIn Page</span>
                <ExternalLink className="h-3 w-3 opacity-70 text-[#caaa98]" />
              </Button>
            )}

            {company.website && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(company.website.startsWith("http") ? company.website : `https://${company.website}`, "_blank")}
                className="text-xs h-9 gap-1.5 bg-[#202940] hover:bg-[#182035] text-white hover:text-[#caaa98] border-[#caaa98]/40 shadow-xs"
              >
                <Globe className="h-3.5 w-3.5 text-[#caaa98]" />
                <span className="font-medium text-white">Website</span>
                <ExternalLink className="h-3 w-3 opacity-70 text-[#caaa98]" />
              </Button>
            )}
          </div>
        </div>
      </div>

        {/* Benefits & Perks Chips */}
        {company.benefits && company.benefits.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/15">
            <div className="text-xs font-semibold text-[#caaa98] mb-2.5 flex items-center gap-1.5">
              <span>Standard Enterprise Employee Benefits & Perks:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {company.benefits.map((benefit, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[11px] bg-white/10 hover:bg-white/15 text-white border-white/25 py-1 px-2.5 font-medium shadow-xs"
                >
                  <span className="text-[#caaa98] mr-1.5 font-bold">✓</span> {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recruitment Metrics Bar — CareerBridge Executive Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="careerbridge-card-elevation rounded-2xl border border-[#e2d8cd] bg-card p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4b4038] uppercase tracking-wider">Open Requisitions</span>
            <div className="h-8 w-8 rounded-xl bg-[#202940]/5 text-[#202940] flex items-center justify-center group-hover:scale-110 transition border border-[#202940]/10">
              <Briefcase className="h-4 w-4 text-[#202940]" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-[#202940] font-display">
            {activeJobs.length}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {isolatedJobs.length} total listings created
          </p>
        </div>

        <div className="careerbridge-card-elevation rounded-2xl border border-[#e2d8cd] bg-card p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4b4038] uppercase tracking-wider">Total Applicants</span>
            <div className="h-8 w-8 rounded-xl bg-[#202940]/5 text-[#202940] flex items-center justify-center group-hover:scale-110 transition border border-[#202940]/10">
              <Users className="h-4 w-4 text-[#202940]" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-[#202940] font-display">
            {isolatedCandidates.length}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Scoped to {company.name} only
          </p>
        </div>

        <div className="careerbridge-card-elevation rounded-2xl border border-[#e2d8cd] bg-card p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4b4038] uppercase tracking-wider">In Interview Stages</span>
            <div className="h-8 w-8 rounded-xl bg-[#202940]/5 text-[#202940] flex items-center justify-center group-hover:scale-110 transition border border-[#202940]/10">
              <UserCheck className="h-4 w-4 text-[#202940]" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-[#202940] font-display">
            {interviewingCount}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Screened & technical rounds
          </p>
        </div>

        <div className="careerbridge-card-elevation rounded-2xl border border-[#e2d8cd] bg-card p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4b4038] uppercase tracking-wider">Hired Talent</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition border border-emerald-500/20">
              <TrendingUp className="h-4 w-4 text-emerald-700" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-emerald-700 font-display">
            {hiredCount}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Offers accepted in Pakistan
          </p>
        </div>
      </div>

      {/* 2-Column: Active Job Requisitions & Recruitment Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Jobs (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground font-display">
                Company Job Openings ({isolatedJobs.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage roles posted under {company.name}.
              </p>
            </div>
            {onOpenCreateJob && (
              <Button size="sm" onClick={onOpenCreateJob} className="text-xs h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Post New Job
              </Button>
            )}
          </div>

          <div className="rounded-2xl border bg-card divide-y overflow-hidden shadow-xs">
            {isolatedJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No jobs published under this company yet. Click Post New Job to start hiring.
              </div>
            ) : (
              isolatedJobs.map((job) => {
                const applicantsForJob = isolatedCandidates.filter((c) => c.jobId === job.id);
                const isClosed = isJobExpired(job.deadline) || job.status === "closed";

                return (
                  <div
                    key={job.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {job.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 ${
                            isClosed
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                          }`}
                        >
                          {isClosed ? "Closed" : "Active Requisition"}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] py-0">
                          {job.department}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.city}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="h-3 w-3" />
                          {job.salaryDisplayPKR}
                        </span>
                        {job.preferredDegree && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <GraduationCap className="h-3 w-3" />
                              {job.preferredDegree}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-xs font-bold text-foreground">
                          {applicantsForJob.length} Candidates
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Deadline: {job.deadline}
                        </div>
                      </div>

                      {onNavigateToTab && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigateToTab("applicants")}
                          className="text-xs h-8"
                        >
                          View Pipeline
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recruitment Team & Multi-Tenant Scoping (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground font-display">
                Authorized Recruiters ({team.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Company recruitment team roster.
              </p>
            </div>
            {onNavigateToTab && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab("hr-team")}
                className="text-xs h-8 text-primary"
              >
                Manage All
              </Button>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-4 divide-y space-y-3 shadow-xs">
            {team.map((member) => (
              <div key={member.id} className="pt-3 first:pt-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-[10px] font-bold">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {member.companyRole || "Recruiter"}
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                  Active
                </Badge>
              </div>
            ))}

            <div className="pt-3">
              <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Tenant Data Privacy Shield
                </div>
                <p className="text-[11px] leading-relaxed">
                  Only authorized team members above can view resumes and rate applicants for {company.name}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Company Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Edit Company Workspace Profile
            </DialogTitle>
            <DialogDescription>
              Update your corporate information, verified Pakistani headquarters, and employer branding.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Company Name *</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Industry Sector</Label>
                <Input
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Headquarters City</Label>
                <Input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Company Size</Label>
                <Input
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Official Website</Label>
                <Input
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">LinkedIn Profile URL</Label>
                <Input
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Benefits & Perks (Comma-separated)</Label>
              <Input
                value={editBenefits}
                onChange={(e) => setEditBenefits(e.target.value)}
                placeholder="OPD Medical, Fuel Allowance, Provident Fund, Hybrid Work"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Company Bio & Mission</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs h-9 gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
