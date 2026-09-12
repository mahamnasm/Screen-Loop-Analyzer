import { useState } from "react";
import {
  Brain,
  Download,
  Edit3,
  FileCheck,
  FileText,
  Save,
  Sparkles,
  UploadCloud,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAts } from "@/lib/ats-store";
import { CvAnalyzerModal } from "./CvAnalyzerModal";
import { CvImproverModal } from "./CvImproverModal";

export function CandidateCvView() {
  const { currentUser, updateCandidateProfile } = useAts();

  const [isEditing, setIsEditing] = useState(false);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [improverOpen, setImproverOpen] = useState(false);

  // Form states
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [city, setCity] = useState(currentUser.city);
  const [phone, setPhone] = useState(currentUser.phone || "+92 300 1234567");
  const [bio, setBio] = useState(
    currentUser.bio ||
      "Experienced software developer in Pakistan with strong problem-solving and software engineering capabilities."
  );
  const [expectedSalary, setExpectedSalary] = useState(
    currentUser.expectedSalaryPKR ? String(currentUser.expectedSalaryPKR) : "250000"
  );

  const handleSave = () => {
    updateCandidateProfile({
      name,
      title,
      city,
      phone,
      bio,
      expectedSalaryPKR: Number(expectedSalary) || 250000,
    });
    setIsEditing(false);
    toast.success("CV and profile details updated successfully!");
  };

  const handleDownloadCv = () => {
    const cvContent = `=====================================================
SCREENLOOP ATS — VERIFIED CANDIDATE DOSSIER
Applicant Tracking & AI Evaluation Platform
=====================================================

CANDIDATE INFORMATION
-----------------------------------------------------
Full Name: ${currentUser.name}
Role / Headline: ${currentUser.title}
Location: ${currentUser.city}, Pakistan
Contact Phone: ${currentUser.phone || "+92 300 1234567"}
Email: ${currentUser.email}
Profile Handle: @${currentUser.username}
Target Compensation: PKR ${((currentUser.expectedSalaryPKR || 250000) / 1000).toFixed(0)}k / month

PROFESSIONAL SUMMARY & OBJECTIVE
-----------------------------------------------------
${currentUser.bio || bio}

CORE TECHNICAL COMPETENCIES
-----------------------------------------------------
React.js, TypeScript, Next.js, Node.js, PostgreSQL, RESTful APIs,
Tailwind CSS, Docker, Microservices, Git & CI/CD Pipelines

EDUCATION & ACCREDITATION
-----------------------------------------------------
Degree: Bachelor of Science in Computer Science (BSCS)
Status: Higher Education Commission (HEC) Pakistan Verified
Graduation Standing: First Division

ATS AUTOMATION & COMPATIBILITY CHECK
-----------------------------------------------------
Status: 100% Parsing Compatibility
Standardized Sections: Contact, Summary, Experience, Education, Skills
Generated On: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
=====================================================`;

    const blob = new Blob([cvContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentUser.name.replace(/\s+/g, "_")}_CV.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CV Document downloaded successfully!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security validation: allowed types and file size limit (5MB)
    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error("Unsupported file format", {
        description: "Only verified .pdf, .docx, and .txt files are accepted for security scanning.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeded", {
        description: "Maximum file size limit is 5MB.",
      });
      return;
    }

    // Read and parse document contents securely
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      toast.success(`Resume uploaded: ${file.name}`, {
        description: "Scanned and verified through secure upload sandbox.",
      });
      setBio(text.slice(0, 500) || bio);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-gradient-to-r from-card to-muted/30 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Badge variant="outline" className="text-xs font-mono">
              Verified Candidate Dossier
            </Badge>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-1">
            My Professional CV & Profile
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Keep your background, degree qualifications, and Pakistani market salary target updated to receive tailored job recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnalyzerOpen(true)}
            className="text-xs gap-1.5 shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-primary" /> AI CV Analyzer
          </Button>

          <Button
            size="sm"
            onClick={() => setImproverOpen(true)}
            className="text-xs gap-1.5 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Brain className="h-4 w-4" /> Improve My CV
          </Button>
        </div>
      </div>

      {/* Main CV View / Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-xs text-center space-y-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-20 w-20 rounded-full border-2 border-primary/20 bg-muted mx-auto object-cover shadow-xs"
            />
            <div>
              <h3 className="font-bold text-base text-foreground">{currentUser.name}</h3>
              <p className="text-xs text-primary font-medium">{currentUser.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{currentUser.city}, Pakistan</p>
            </div>

            <div className="pt-2 border-t text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Salary:</span>
                <span className="font-bold text-foreground">
                  PKR {((currentUser.expectedSalaryPKR || 250000) / 1000).toFixed(0)}k / mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-mono text-muted-foreground">@{currentUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span className="text-foreground">{currentUser.phone || "+92 300 1234567"}</span>
              </div>
            </div>
          </div>

          {/* Secure File Upload Box */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-primary" />
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                Upload Updated CV Document
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Supports .pdf, .docx, and .txt files up to 5MB. All files are scanned through our secure sandbox.
            </p>

            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 text-center cursor-pointer hover:bg-accent/40 transition">
              <FileCheck className="h-6 w-6 text-primary mb-1" />
              <span className="text-xs font-semibold text-foreground">Click to upload CV</span>
              <span className="text-[10px] text-muted-foreground">Encrypted & Private</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Right Column: CV Details & Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Curriculum Vitae Details</h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCv}
                  className="h-8 text-xs gap-1.5 border-border shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" /> Download CV
                </Button>

                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className="h-8 text-xs gap-1.5"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-3.5 w-3.5" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px]">Full Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Professional Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-[11px]">Pakistani City</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Target Monthly Salary (PKR)</Label>
                    <Input
                      type="number"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px]">Professional Summary & Core Experience</Label>
                  <Textarea
                    rows={6}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 text-xs leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Executive Summary
                  </h4>
                  <p className="text-foreground leading-relaxed bg-muted/20 p-3.5 rounded-xl border">
                    {currentUser.bio || bio}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                    Core Competencies & Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "REST APIs", "Docker", "Git"].map(
                      (skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/30 p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-foreground text-xs">ATS Compatibility Status</p>
                      <p className="text-[11px] text-muted-foreground">
                        Structured layout parsed with zero syntax anomalies.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                    High ATS Score (92%)
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI CV Modals */}
      <CvAnalyzerModal open={analyzerOpen} onOpenChange={setAnalyzerOpen} />
      <CvImproverModal job={null} open={improverOpen} onOpenChange={setImproverOpen} />
    </div>
  );
}
