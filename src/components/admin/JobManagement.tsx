import { useState } from "react";
import {
  Archive,
  Briefcase,
  CheckCircle2,
  Edit2,
  MapPin,
  Plus,
  RotateCcw,
  Sparkles,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

export function JobManagement() {
  const { jobs, createJob, updateJob, archiveJob, restoreJob, candidates, companies } = useAts();

  // Create/Edit Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("Systems Limited");
  const [department, setDepartment] = useState("Engineering");
  const [city, setCity] = useState("Karachi");
  const [location, setLocation] = useState("Karachi, Pakistan");
  const [type, setType] = useState<any>("Full-time");
  const [salaryMinPKR, setSalaryMinPKR] = useState(150000);
  const [salaryMaxPKR, setSalaryMaxPKR] = useState(240000);
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [optionalSkills, setOptionalSkills] = useState("");
  const [minExperience, setMinExperience] = useState(3);
  const [skillsWeight, setSkillsWeight] = useState(70);

  const handleOpenCreate = () => {
    setEditingJob(null);
    setTitle("");
    setCompany(companies[0]?.name || "Systems Limited");
    setDepartment("Engineering");
    setCity("Karachi");
    setLocation("Karachi, Pakistan");
    setType("Full-time");
    setSalaryMinPKR(150000);
    setSalaryMaxPKR(240000);
    setDeadlineDays(30);
    setDescription("");
    setResponsibilities("");
    setRequiredSkills("React, TypeScript, Tailwind CSS");
    setOptionalSkills("Next.js, PostgreSQL, Docker");
    setMinExperience(3);
    setSkillsWeight(70);
    setDialogOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setDepartment(job.department);
    setCity(job.city || "Karachi");
    setLocation(job.location);
    setType(job.type);
    setSalaryMinPKR(job.salaryMinPKR || 150000);
    setSalaryMaxPKR(job.salaryMaxPKR || 240000);
    const diffDays = Math.max(1, Math.round((job.deadline - Date.now()) / (24 * 60 * 60 * 1000)));
    setDeadlineDays(diffDays);
    setDescription(job.description);
    setResponsibilities(job.responsibilities.join("\n"));
    setRequiredSkills(job.requiredSkills.join(", "));
    setOptionalSkills(job.optionalSkills.join(", "));
    setMinExperience(job.minExperience);
    setSkillsWeight(job.skillsWeight);
    setDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Job title is required");
      return;
    }

    const reqList = requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const optList = optionalSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const respList = responsibilities
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const minPKR = Number(salaryMinPKR) || 120000;
    const maxPKR = Number(salaryMaxPKR) || 220000;
    const salaryDisplay = `PKR ${(minPKR / 1000).toFixed(0)}k - ${(maxPKR / 1000).toFixed(0)}k / month`;
    const targetComp = companies.find((c) => c.name === company);
    const deadlineMs = Date.now() + Math.max(1, Number(deadlineDays) || 30) * 24 * 60 * 60 * 1000;

    if (editingJob) {
      updateJob(editingJob.id, {
        title: title.trim(),
        company: company || editingJob.company,
        department,
        city,
        location: location || `${city}, Pakistan`,
        type,
        salary: salaryDisplay,
        salaryMinPKR: minPKR,
        salaryMaxPKR: maxPKR,
        salaryDisplayPKR: salaryDisplay,
        deadline: deadlineMs,
        description: description.trim() || `Position for ${title} in the ${department} team.`,
        responsibilities: respList.length ? respList : ["Collaborate with team to build great products."],
        requiredSkills: reqList.length ? reqList : ["General Skills"],
        optionalSkills: optList,
        minExperience,
        skillsWeight,
      });
    } else {
      createJob({
        title: title.trim(),
        company: company || "Systems Limited",
        companyLogo: targetComp?.logo || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80",
        isVerifiedCompany: targetComp ? targetComp.verified : true,
        isCorporateListing: true,
        department,
        city,
        location: location || `${city}, Pakistan`,
        type,
        salary: salaryDisplay,
        salaryMinPKR: minPKR,
        salaryMaxPKR: maxPKR,
        salaryDisplayPKR: salaryDisplay,
        deadline: deadlineMs,
        description: description.trim() || `Exciting opportunity for a ${title} to join ${company}.`,
        responsibilities: respList.length ? respList : ["Develop scalable features", "Collaborate cross-functionally"],
        requiredSkills: reqList.length ? reqList : ["React", "TypeScript"],
        optionalSkills: optList,
        minExperience,
        skillsWeight,
        status: "active",
      });
    }

    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Job Openings & AI Screening Criteria
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure open listings, define required skill taxonomies, and customize AI match weights.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="text-xs gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Create New Job Posting
        </Button>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow>
              <TableHead className="font-bold">Position Title</TableHead>
              <TableHead className="font-bold">Department</TableHead>
              <TableHead className="font-bold">Location & Type</TableHead>
              <TableHead className="font-bold">AI Weighting</TableHead>
              <TableHead className="font-bold">Applicants</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {jobs.map((job) => {
              const jobCandidates = candidates.filter((c) => c.jobId === job.id);

              return (
                <TableRow key={job.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-bold text-foreground text-xs">{job.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[220px]">
                        {job.requiredSkills.slice(0, 3).join(", ")}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {job.department}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium text-foreground">{job.location}</span>
                    <p className="text-[10px] text-muted-foreground">{job.type}</p>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs font-semibold">
                      {job.skillsWeight}% Skills / {100 - job.skillsWeight}% Exp
                    </span>
                    <p className="text-[10px] text-muted-foreground">Min {job.minExperience} yrs</p>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono font-bold">
                      {jobCandidates.length}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        job.status === "active"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {job.status === "active" ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(job)}
                        className="h-7 text-xs gap-1"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>

                      {job.status === "active" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => archiveJob(job.id)}
                          className="h-7 text-xs text-muted-foreground hover:text-destructive"
                          title="Archive job"
                        >
                          <Archive className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => restoreJob(job.id)}
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                          title="Restore job"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingJob ? "Edit Job Posting & Criteria" : "Post New Job Opening"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define the role specifics, required competencies, and deterministic AI scoring weights.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Hiring Company</Label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name} {c.verified ? "✓" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Job Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="AI & Data">AI & Data</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Product">Product Management</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">City / Hub</Label>
                <Select value={city} onValueChange={(val) => {
                  setCity(val);
                  setLocation(val === "Remote" ? "Remote (Pakistan)" : `${val}, Pakistan`);
                }}>
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Faisalabad", "Multan", "Remote"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Employment Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Application Deadline (Days from today)</Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(Number(e.target.value))}
                  placeholder="30"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Min Salary (PKR / Month)</Label>
                <Input
                  type="number"
                  step={10000}
                  value={salaryMinPKR}
                  onChange={(e) => setSalaryMinPKR(Number(e.target.value))}
                  placeholder="150000"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Max Salary (PKR / Month)</Label>
                <Input
                  type="number"
                  step={10000}
                  value={salaryMaxPKR}
                  onChange={(e) => setSalaryMaxPKR(Number(e.target.value))}
                  placeholder="250000"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Required Core Skills (comma separated)</Label>
                <Input
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="React, TypeScript, Tailwind CSS"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Optional / Bonus Skills</Label>
                <Input
                  value={optionalSkills}
                  onChange={(e) => setOptionalSkills(e.target.value)}
                  placeholder="Next.js, Docker, PostgreSQL"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Minimum Experience (Years)</Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={minExperience}
                  onChange={(e) => setMinExperience(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs flex justify-between">
                  <span>AI Criteria Weighting</span>
                  <span className="font-mono text-primary font-bold">
                    {skillsWeight}% Skills / {100 - skillsWeight}% Exp
                  </span>
                </Label>
                <Slider
                  value={[skillsWeight]}
                  min={10}
                  max={90}
                  step={5}
                  onValueChange={([v]) => setSkillsWeight(v ?? 70)}
                  className="pt-2"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Role Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the role mission..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Key Responsibilities (One per line)</Label>
              <Textarea
                rows={3}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="Architect new frontend features&#10;Lead design system reviews"
                className="text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingJob ? "Save Changes" : "Create Position"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
