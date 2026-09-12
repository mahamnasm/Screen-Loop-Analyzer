import { useState } from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  FileCheck2,
  FileText,
  Lightbulb,
  Sparkles,
  UploadCloud,
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cvAnalyzer, type CvAnalysisResult } from "@/lib/ai-services";
import { useAts } from "@/lib/ats-store";

interface CvAnalyzerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CvAnalyzerModal({ open, onOpenChange }: CvAnalyzerModalProps) {
  const { currentUser, updateCandidateProfile } = useAts();

  const [cvText, setCvText] = useState(
    "Senior Full Stack Software Engineer with 6 years experience in React, TypeScript, Node.js, and PostgreSQL.\nBuilt high-traffic e-commerce systems with Docker and Redis.\nFAST-NUCES Karachi graduate.\nMaintained 99.9% uptime across production clusters and led a team of 4 junior developers.\nGitHub: https://github.com/profile | LinkedIn: https://linkedin.com/in/profile"
  );
  const [analysis, setAnalysis] = useState<CvAnalysisResult | null>(() => cvAnalyzer(cvText));
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunAnalysis = () => {
    if (!cvText.trim()) {
      toast.error("Please paste your CV text to analyze");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = cvAnalyzer(cvText.trim());
      setAnalysis(result);
      setIsAnalyzing(false);
      toast.success(`CV Analyzed! Score: ${result.cvScore}/100`);
    }, 400);
  };

  const handleSaveToProfile = () => {
    if (!analysis) return;
    updateCandidateProfile({
      bio: cvText.slice(0, 180) + "...",
    });
    toast.success("CV information and score saved to your candidate profile!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                AI CV Review & Benchmarking
              </DialogTitle>
              <DialogDescription className="text-xs">
                Inspect your CV structure, experience keywords, and clarity to maximize interview callbacks in Pakistan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* CV Input Section */}
          <div className="space-y-1.5">
            <Label htmlFor="cv-text-input" className="text-xs font-semibold flex items-center justify-between">
              <span>Paste Your CV Content</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Text or Document Content
              </span>
            </Label>
            <Textarea
              id="cv-text-input"
              rows={5}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste summary, experience, skills, and education..."
              className="text-xs font-mono"
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-muted-foreground">
                Character count: {cvText.length}
              </span>
              <Button
                size="sm"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !cvText.trim()}
                className="text-xs h-8 gap-1.5 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isAnalyzing ? "Analyzing..." : "Analyze My CV"}
              </Button>
            </div>
          </div>

          {/* Analysis Report */}
          {analysis && (
            <div className="space-y-4 pt-2 border-t">
              {/* Score Hero Card */}
              <div className="rounded-2xl border bg-gradient-to-r from-card via-card to-muted/40 p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Overall CV Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-display text-4xl font-extrabold text-foreground">
                        {analysis.cvScore}
                      </span>
                      <span className="text-muted-foreground text-sm font-semibold">/ 100</span>
                      <Badge
                        variant={
                          analysis.rating === "Excellent"
                            ? "default"
                            : analysis.rating === "Good"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs font-bold uppercase ml-1"
                      >
                        {analysis.rating}
                      </Badge>
                    </div>
                  </div>

                  <div className="w-full sm:w-56 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>CV Readiness</span>
                      <span className="font-mono">{analysis.cvScore}%</span>
                    </div>
                    <Progress value={analysis.cvScore} className="h-2.5" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed border-t pt-2.5">
                  {analysis.explanation}
                </p>
              </div>

              {/* Score Breakdown Bars */}
              <div className="rounded-xl border bg-card p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-foreground">Assessment Factors</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Structure & Organization</span>
                      <span className="font-mono font-semibold">{analysis.breakdown.structureScore} / 20</span>
                    </div>
                    <Progress value={(analysis.breakdown.structureScore / 20) * 100} className="h-1.5" />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Experience Clarity</span>
                      <span className="font-mono font-semibold">{analysis.breakdown.experienceScore} / 25</span>
                    </div>
                    <Progress value={(analysis.breakdown.experienceScore / 25) * 100} className="h-1.5" />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Skills & Keyword Coverage</span>
                      <span className="font-mono font-semibold">{analysis.breakdown.skillsScore} / 25</span>
                    </div>
                    <Progress value={(analysis.breakdown.skillsScore / 25) * 100} className="h-1.5" />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Readability & Formatting</span>
                      <span className="font-mono font-semibold">
                        {analysis.breakdown.clarityScore + analysis.breakdown.formattingScore} / 30
                      </span>
                    </div>
                    <Progress
                      value={((analysis.breakdown.clarityScore + analysis.breakdown.formattingScore) / 30) * 100}
                      className="h-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Detected Skills Badges */}
              <div className="rounded-xl border bg-card p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Detected Technical Competencies ({analysis.detectedSkills.length})</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    ~{analysis.detectedExperienceYears}+ years experience detected
                  </span>
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysis.detectedSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs font-mono">
                      {s}
                    </Badge>
                  ))}
                  {analysis.detectedSkills.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No recognized technical skills found. Be sure to list specific programming languages and tools.
                    </p>
                  )}
                </div>
              </div>

              {/* Strong Points & Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border bg-card p-4 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Strong Points
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {analysis.strongPoints.map((sp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{sp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border bg-card p-4 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-amber-500" /> Actionable Suggestions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {analysis.suggestions.map((sugg, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{sugg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button size="sm" onClick={handleSaveToProfile}>
                  Save to My Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
