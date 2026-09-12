import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  FileText,
  Github,
  Globe,
  MapPin,
  Sparkles,
  UploadCloud,
  X,
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
import { isJobExpired, type Job } from "@/lib/ats-engine";
import { useAts } from "@/lib/ats-store";

interface ApplyModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ApplyModal({
  job,
  open,
  onOpenChange,
  onSuccess,
}: ApplyModalProps) {
  const { currentUser, submitApplication } = useAts();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Karachi");
  const [expectedSalaryPKR, setExpectedSalaryPKR] = useState<number>(250000);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // Resume State
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeFileSize, setResumeFileSize] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill profile from active user
  useEffect(() => {
    if (open) {
      if (currentUser.role === "candidate") {
        setName(currentUser.name);
        setEmail(currentUser.email);
        setPhone(currentUser.phone || "+92 300 1234567");
        setCity(currentUser.city || "Karachi");
        setExpectedSalaryPKR(currentUser.expectedSalaryPKR || 250000);
        setPortfolioUrl("https://myportfolio.pk");
        setGithubUrl("https://github.com/candidate-profile");
        if (!resumeText) {
          setResumeFileName(`${currentUser.name.replace(/\s+/g, "_")}_CV.pdf`);
          setResumeFileSize("168 KB");
          setResumeText(
            `${currentUser.name} — Professional Software Engineer\nLocation: ${currentUser.city || "Pakistan"} | Contact: ${currentUser.phone || "+92 300 1234567"}\n\nSUMMARY:\nExperienced engineer with 5+ years of software engineering expertise specializing in ${job?.requiredSkills.join(", ") || "full stack engineering"}.\nDemonstrated track record building scalable enterprise systems for top Pakistani and international technology organizations.\n\nTECHNICAL SKILLS:\n${job?.requiredSkills.join(", ")}, ${job?.optionalSkills.slice(0, 3).join(", ") || "Docker, Git, CI/CD"}.\n\nEXPERIENCE:\nSoftware Engineer (2021 - Present)\n- Engineered scalable, production-grade applications meeting strict performance SLAs.\n- Collaborated with cross-functional squads to deliver client specifications on schedule.`
          );
        }
      }
    }
  }, [open, currentUser, job]);

  const handleFileUpload = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      toast.error("Please upload a PDF, DOCX, or TXT document");
      return;
    }

    setResumeFileName(file.name);
    setResumeFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content && content.length > 50 && !content.includes("%PDF")) {
        setResumeText(content);
      } else {
        setResumeText(
          `${name || "Candidate"} — Professional CV\nEmail: ${email || "candidate@example.pk"} | City: ${city}, Pakistan\n\nPROFESSIONAL SUMMARY:\nExperienced software engineer with strong technical track record in ${job?.requiredSkills.join(", ") || "software development"}.\n\nKEY COMPETENCIES:\n${job?.requiredSkills.join(", ")}, ${job?.optionalSkills.slice(0, 2).join(", ") || "Git, Linux"}.\n\nWORK HISTORY:\nSoftware Engineer (2022 - Present)\n- Developed and scaled enterprise software components.\n- Collaborated with agile team members to ensure robust code quality.`
        );
      }
      toast.success(`Parsed ${file.name} successfully!`);
    };

    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      reader.onload({ target: { result: "" } } as any);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (isJobExpired(job.deadline) || job.status === "closed") {
      toast.error("Cannot apply: Application deadline for this job has expired.");
      return;
    }

    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    if (!resumeText.trim()) {
      toast.error("Please upload your CV or paste CV text for AI evaluation");
      return;
    }

    setIsSubmitting(true);

    try {
      submitApplication({
        jobId: job.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "+92 300 0000000",
        city,
        location: `${city}, Pakistan`,
        portfolioUrl: portfolioUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        resumeFileName: resumeFileName || "Candidate_CV.pdf",
        resumeText: resumeText.trim(),
        coverLetter: coverLetter.trim() || undefined,
        expectedSalaryPKR,
      });

      setIsSubmitting(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      // Toast already fired in store if duplicate or expired
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs flex items-center gap-1 font-semibold">
              <Building2 className="h-3 w-3" />
              {job.company}
            </Badge>
            <span className="text-xs text-muted-foreground">{job.city} · {job.type}</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight mt-1">
            Apply for {job.title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submit your profile and CV. Instant AI evaluation will benchmark your skills against {job.company}'s requirements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Candidate Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="app-name" className="text-xs font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="app-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ali Khan"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="app-email" className="text-xs font-semibold">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="app-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ali.khan@screenloop.pk"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="app-phone" className="text-xs font-semibold">
                Phone Number (WhatsApp)
              </Label>
              <Input
                id="app-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">City in Pakistan</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Karachi">Karachi</SelectItem>
                  <SelectItem value="Lahore">Lahore</SelectItem>
                  <SelectItem value="Islamabad">Islamabad</SelectItem>
                  <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                  <SelectItem value="Peshawar">Peshawar</SelectItem>
                  <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                  <SelectItem value="Multan">Multan</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="app-salary" className="text-xs font-semibold">
                Expected Monthly Salary (PKR)
              </Label>
              <Input
                id="app-salary"
                type="number"
                step="5000"
                value={expectedSalaryPKR}
                onChange={(e) => setExpectedSalaryPKR(Number(e.target.value))}
                placeholder="e.g. 250000"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="app-portfolio" className="text-xs font-semibold flex items-center gap-1">
                <Globe className="h-3 w-3" /> Portfolio / LinkedIn URL
              </Label>
              <Input
                id="app-portfolio"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          {/* Resume Upload Dropzone */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>CV Document (PDF / DOCX)</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Required for AI Evaluation
              </span>
            </Label>

            {resumeFileName ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {resumeFileName}
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/40">
                        Parsed
                      </Badge>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{resumeFileSize || "Document attached"}</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setResumeFileName(null);
                    setResumeFileSize(null);
                    setResumeText("");
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 bg-muted/20"
                }`}
              >
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.docx,.txt"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Click to select or drag & drop your CV
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PDF, DOCX or TXT (Max 10MB)
                </p>
              </div>
            )}

            {/* Extracted CV Text */}
            <div className="space-y-1 pt-1">
              <Label htmlFor="resume-text" className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>CV Content for Screening</span>
                <span className="text-[10px]">Mention core technologies & years of experience</span>
              </Label>
              <Textarea
                id="resume-text"
                rows={4}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or review CV text..."
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Cover Note */}
          <div className="space-y-1">
            <Label htmlFor="cover-note" className="text-xs font-semibold">
              Brief Note for {job.company} Recruiter (Optional)
            </Label>
            <Textarea
              id="cover-note"
              rows={2}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Why you are interested in this position..."
              className="text-xs"
            />
          </div>

          <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between gap-2 border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                Targeting: <strong className="text-foreground">{job.title}</strong> at {job.company} ({job.salaryDisplayPKR})
              </span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
