import { useState } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  Copy,
  HelpCircle,
  Lightbulb,
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
import { aiServices } from "@/lib/ai-services";
import { useAts } from "@/lib/ats-store";

interface AiInterviewQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName?: string;
  defaultRole?: string;
}

export function AiInterviewQuestionsModal({
  open,
  onOpenChange,
  candidateName,
  defaultRole = "Full Stack Engineer",
}: AiInterviewQuestionsModalProps) {
  const [role, setRole] = useState(defaultRole);
  const [experienceLevel, setExperienceLevel] = useState("Mid-level (3-5 yrs)");
  const [focusArea, setFocusArea] = useState<"Technical & System Design" | "Behavioral & Culture Fit" | "Problem Solving" | "Pakistani Tech Industry Dynamics">("Technical & System Design");
  const [skills, setSkills] = useState("React, TypeScript, Node.js, PostgreSQL");

  const [questions, setQuestions] = useState<{
    technical: { q: string; targetAnswer: string; redFlags: string }[];
    behavioral: { q: string; targetAnswer: string; redFlags: string }[];
    problemSolving: { q: string; targetAnswer: string; redFlags: string }[];
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const result = aiServices.generateInterviewQuestions({
      role,
      level: experienceLevel,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setQuestions(result);
    toast.success("Interview questionnaire generated!");
  };

  const handleCopy = () => {
    if (!questions) return;
    let text = `AI INTERVIEW QUESTIONNAIRE FOR: ${role} (${experienceLevel})\n\n`;
    text += "=== TECHNICAL QUESTIONS ===\n";
    questions.technical.forEach((q, i) => {
      text += `${i + 1}. ${q.q}\n   Target: ${q.targetAnswer}\n   Red Flag: ${q.redFlags}\n\n`;
    });
    text += "=== BEHAVIORAL QUESTIONS ===\n";
    questions.behavioral.forEach((q, i) => {
      text += `${i + 1}. ${q.q}\n   Target: ${q.targetAnswer}\n   Red Flag: ${q.redFlags}\n\n`;
    });
    text += "=== PROBLEM SOLVING & SYSTEM DESIGN ===\n";
    questions.problemSolving.forEach((q, i) => {
      text += `${i + 1}. ${q.q}\n   Target: ${q.targetAnswer}\n   Red Flag: ${q.redFlags}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Interview questions copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                AI Interview Question Assistant
              </DialogTitle>
              <DialogDescription className="text-xs">
                Generate targeted technical, architectural, and behavioral questions with evaluation rubrics and red flag alerts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Controls */}
          <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Target Role</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior (1-2 yrs)">Junior (1-2 yrs)</SelectItem>
                    <SelectItem value="Mid-level (3-5 yrs)">Mid-level (3-5 yrs)</SelectItem>
                    <SelectItem value="Senior (5-8 yrs)">Senior (5-8 yrs)</SelectItem>
                    <SelectItem value="Lead / Architect (8+ yrs)">Lead / Architect (8+ yrs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Primary Focus</Label>
                <Select value={focusArea} onValueChange={(v: any) => setFocusArea(v)}>
                  <SelectTrigger className="text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical & System Design">Technical & System Design</SelectItem>
                    <SelectItem value="Behavioral & Culture Fit">Behavioral & Culture Fit</SelectItem>
                    <SelectItem value="Problem Solving">Problem Solving</SelectItem>
                    <SelectItem value="Pakistani Tech Industry Dynamics">Pakistani Industry Dynamics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Key Technologies to Probe</Label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, GraphQL, Docker, PostgreSQL"
                className="bg-background text-xs"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button size="sm" onClick={handleGenerate} className="text-xs gap-1.5 font-semibold bg-purple-600 hover:bg-purple-700 text-white">
                <Sparkles className="h-3.5 w-3.5" /> Generate Evaluation Questions
              </Button>
            </div>
          </div>

          {/* Questions Result */}
          {questions && (
            <div className="space-y-4">
              {/* Technical Section */}
              <div className="rounded-2xl border bg-card p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <h4 className="font-bold text-sm text-foreground">Technical Competency & Code Quality</h4>
                </div>
                <div className="space-y-3">
                  {questions.technical.map((item, i) => (
                    <div key={i} className="rounded-xl border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <p className="text-xs font-semibold text-foreground leading-relaxed">{item.q}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-800 dark:text-emerald-300">
                          <strong className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                            ✓ Look For (Strong Answer)
                          </strong>
                          {item.targetAnswer}
                        </div>
                        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-rose-800 dark:text-rose-300">
                          <strong className="block text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">
                            ✕ Red Flag Alert
                          </strong>
                          {item.redFlags}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral Section */}
              <div className="rounded-2xl border bg-card p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b pb-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <h4 className="font-bold text-sm text-foreground">Behavioral, Ownership & Team Collaboration</h4>
                </div>
                <div className="space-y-3">
                  {questions.behavioral.map((item, i) => (
                    <div key={i} className="rounded-xl border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <p className="text-xs font-semibold text-foreground leading-relaxed">{item.q}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-800 dark:text-emerald-300">
                          <strong className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                            ✓ Look For (Strong Answer)
                          </strong>
                          {item.targetAnswer}
                        </div>
                        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-rose-800 dark:text-rose-300">
                          <strong className="block text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">
                            ✕ Red Flag Alert
                          </strong>
                          {item.redFlags}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problem Solving */}
              <div className="rounded-2xl border bg-card p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b pb-2">
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                  <h4 className="font-bold text-sm text-foreground">System Design & Problem Solving Under Pressure</h4>
                </div>
                <div className="space-y-3">
                  {questions.problemSolving.map((item, i) => (
                    <div key={i} className="rounded-xl border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-[11px] font-bold text-purple-600">
                          {i + 1}
                        </span>
                        <p className="text-xs font-semibold text-foreground leading-relaxed">{item.q}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-800 dark:text-emerald-300">
                          <strong className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                            ✓ Look For (Strong Answer)
                          </strong>
                          {item.targetAnswer}
                        </div>
                        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-rose-800 dark:text-rose-300">
                          <strong className="block text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">
                            ✕ Red Flag Alert
                          </strong>
                          {item.redFlags}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied All" : "Copy Interview Script"}
                </Button>

                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
