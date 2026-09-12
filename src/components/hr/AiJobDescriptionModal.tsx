import { useState } from "react";
import {
  Briefcase,
  Check,
  Copy,
  FileSpreadsheet,
  PlusCircle,
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
import { Textarea } from "@/components/ui/textarea";
import { aiServices } from "@/lib/ai-services";
import { useAts } from "@/lib/ats-store";

interface AiJobDescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyToJobCreator?: (generatedJob: {
    title: string;
    company: string;
    department: string;
    city: string;
    salaryMinPKR: number;
    salaryMaxPKR: number;
    description: string;
    responsibilities: string[];
    requiredSkills: string[];
    optionalSkills: string[];
    minExperience: number;
  }) => void;
}

export function AiJobDescriptionModal({
  open,
  onOpenChange,
  onApplyToJobCreator,
}: AiJobDescriptionModalProps) {
  const { companies, createJob } = useAts();

  const [roleTitle, setRoleTitle] = useState("Full Stack Developer");
  const [company, setCompany] = useState(companies[0]?.name || "Systems Limited");
  const [department, setDepartment] = useState("Engineering");
  const [city, setCity] = useState("Karachi");
  const [experienceLevel, setExperienceLevel] = useState("Mid-level (3-5 years)");
  const [skills, setSkills] = useState("React, Node.js, TypeScript, PostgreSQL, REST APIs");

  const [generated, setGenerated] = useState<{
    summary: string;
    responsibilities: string[];
    requirements: string[];
    preferred: string[];
    suggestedSalaryPKR: { min: number; max: number; formatted: string };
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!roleTitle.trim()) {
      toast.error("Please specify a role title");
      return;
    }
    const result = aiServices.generateJobDescription({
      title: roleTitle,
      company,
      city,
      level: experienceLevel,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setGenerated(result);
    toast.success("AI Job Description synthesized for Pakistani Market!");
  };

  const handleCopy = () => {
    if (!generated) return;
    const text = `Job Title: ${roleTitle}
Company: ${company}
Location: ${city}, Pakistan
Salary Range: ${generated.suggestedSalaryPKR.formatted}

Summary:
${generated.summary}

Key Responsibilities:
${generated.responsibilities.map((r) => `• ${r}`).join("\n")}

Requirements:
${generated.requirements.map((r) => `• ${r}`).join("\n")}

Preferred Skills:
${generated.preferred.map((p) => `• ${p}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Job description copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateDirectly = () => {
    if (!generated) return;
    const targetComp = companies.find((c) => c.name === company);
    const minExp = experienceLevel.includes("Junior")
      ? 1
      : experienceLevel.includes("Senior")
      ? 5
      : experienceLevel.includes("Lead")
      ? 7
      : 3;

    createJob({
      title: roleTitle.trim(),
      company,
      companyLogo: targetComp?.logo || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80",
      isVerifiedCompany: targetComp ? targetComp.verified : true,
      isCorporateListing: true,
      department,
      city,
      location: city === "Remote" ? "Remote (Pakistan)" : `${city}, Pakistan`,
      type: "Full-time",
      salary: generated.suggestedSalaryPKR.formatted,
      salaryMinPKR: generated.suggestedSalaryPKR.min,
      salaryMaxPKR: generated.suggestedSalaryPKR.max,
      salaryDisplayPKR: generated.suggestedSalaryPKR.formatted,
      description: generated.summary,
      responsibilities: generated.responsibilities,
      requiredSkills: generated.requirements.slice(0, 5),
      optionalSkills: generated.preferred,
      minExperience: minExp,
      skillsWeight: 70,
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
      status: "active",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                AI Job Description Generator
              </DialogTitle>
              <DialogDescription className="text-xs">
                Draft calibrated job requisitions tailored to the Pakistani tech market with realistic PKR salary bands.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Controls Form */}
          <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Job Title / Designation</Label>
                <Input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Hiring Company</Label>
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
                <Label className="text-xs font-semibold">Pakistani City / Hub</Label>
                <Select value={city} onValueChange={setCity}>
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
                <Label className="text-xs font-semibold">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior (1-2 years)">Junior (1-2 years)</SelectItem>
                    <SelectItem value="Mid-level (3-5 years)">Mid-level (3-5 years)</SelectItem>
                    <SelectItem value="Senior (5-8 years)">Senior (5-8 years)</SelectItem>
                    <SelectItem value="Lead / Architect (8+ years)">Lead / Architect (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Target Skills & Tech Stack</Label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Next.js, Node.js"
                className="bg-background text-xs"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button size="sm" onClick={handleGenerate} className="text-xs gap-1.5 font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Generate Job Spec
              </Button>
            </div>
          </div>

          {/* Generated Result Preview */}
          {generated && (
            <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-primary">{company}</span>
                    <Badge variant="secondary" className="text-[11px]">{city}, Pakistan</Badge>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mt-0.5">{roleTitle}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Benchmark Range</span>
                  <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {generated.suggestedSalaryPKR.formatted}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About the Role</h4>
                <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border">
                  {generated.summary}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Responsibilities</h4>
                <ul className="space-y-1 text-xs text-foreground">
                  {generated.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Requirements & Qualifications</h4>
                <ul className="space-y-1 text-xs text-foreground">
                  {generated.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bonus / Nice to Haves</h4>
                <div className="flex flex-wrap gap-1.5">
                  {generated.preferred.map((p, i) => (
                    <Badge key={i} variant="secondary" className="text-[11px]">
                      + {p}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy Job Spec"}
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreateDirectly} className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    <PlusCircle className="h-3.5 w-3.5" /> Publish to Job Board
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
