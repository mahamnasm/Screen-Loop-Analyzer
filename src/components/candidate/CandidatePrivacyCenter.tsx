import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  Eye,
  EyeOff,
  Lock,
  Radio,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useAts } from "@/lib/ats-store";

export function CandidatePrivacyCenter() {
  const {
    currentUser,
    candidateApplications,
    privacySettings,
    updatePrivacySettings,
    downloadCandidateData,
    requestAccountDeletion,
  } = useAts();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <Badge variant="outline" className="text-xs font-mono">
              Privacy & Compliance Center
            </Badge>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-1">
            Personal Data & AI Privacy Safeguards
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            You maintain full sovereignty over your resume, personal information, and application records. Control who can view your profile and manage AI processing preferences.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCandidateData(currentUser.username)}
          className="text-xs gap-1.5 shadow-xs"
        >
          <Download className="h-4 w-4 text-primary" /> Download My Data (JSON)
        </Button>
      </div>

      {/* Grid of Privacy Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Data Inventory */}
        <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Stored Data Inventory</h3>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Below is the full scope of data associated with account <strong className="text-foreground">@{currentUser.username}</strong>:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/30 border">
              <div>
                <p className="font-semibold text-foreground">Profile & Identity</p>
                <p className="text-[11px] text-muted-foreground">Full name, email, phone, city, title</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/30 border">
              <div>
                <p className="font-semibold text-foreground">Submitted Applications</p>
                <p className="text-[11px] text-muted-foreground">{candidateApplications.length} active application(s)</p>
              </div>
              <Badge variant="secondary">{candidateApplications.length} Records</Badge>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/30 border">
              <div>
                <p className="font-semibold text-foreground">Curriculum Vitae & Parsing</p>
                <p className="text-[11px] text-muted-foreground">Structured skill tokens & experience metrics</p>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                Encrypted S3
              </Badge>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/30 border">
              <div>
                <p className="font-semibold text-foreground">Audit & Access Telemetry</p>
                <p className="text-[11px] text-muted-foreground">Login timestamps & IP telemetry</p>
              </div>
              <Badge variant="outline">Automated Purge</Badge>
            </div>
          </div>
        </div>

        {/* Section 2: Profile Visibility Control */}
        <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Eye className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Recruiter Visibility Preferences</h3>
          </div>

          <p className="text-xs text-muted-foreground">
            Control which employers across Pakistan are authorized to discover your profile in candidate searches:
          </p>

          <RadioGroup
            value={privacySettings.profileVisibility}
            onValueChange={(val: any) => updatePrivacySettings({ profileVisibility: val })}
            className="space-y-2.5"
          >
            <label className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer hover:bg-accent/40 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="verified_only" className="mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  Verified Employers Only <span className="text-[10px] text-emerald-600">(Recommended)</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Only audited Pakistani organizations verified by platform admins can review your resume.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer hover:bg-accent/40 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="confidential" className="mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Confidential Mode</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Your profile remains hidden from all searches. Only companies you explicitly apply to receive your CV.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer hover:bg-accent/40 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
              <RadioGroupItem value="public" className="mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Public Job Board Discovery</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  All registered Pakistani companies can discover your profile and send interview requests.
                </p>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* Section 3: AI Processing & Telemetry Settings */}
        <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">AI Intelligence & Processing Rules</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">AI Resume Matching & Ranking</p>
                <p className="text-[11px] text-muted-foreground">
                  Allow our deterministic engine to score your skills against job criteria.
                </p>
              </div>
              <Switch
                checked={privacySettings.allowAiProcessing}
                onCheckedChange={(val) => updatePrivacySettings({ allowAiProcessing: val })}
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <div>
                <p className="font-semibold text-foreground">Pakistani Job Alert Notifications</p>
                <p className="text-[11px] text-muted-foreground">
                  Receive email notifications when roles matching your degree or skills are published.
                </p>
              </div>
              <Switch
                checked={privacySettings.jobAlerts}
                onCheckedChange={(val) => updatePrivacySettings({ jobAlerts: val })}
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <div>
                <p className="font-semibold text-foreground">Zero AI Hallucination Policy</p>
                <p className="text-[11px] text-muted-foreground">
                  AI tools are strictly prohibited from generating false work histories or degrees.
                </p>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                Enforced
              </Badge>
            </div>
          </div>
        </div>

        {/* Section 4: Account Rights & Deletion */}
        <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b pb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="font-bold text-sm text-destructive">Account Deletion & Right to Be Forgotten</h3>
            </div>

            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              You have the full legal right to request the permanent deletion of your profile, stored resumes, and application logs. Active applications will be automatically flagged as withdrawn.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="text-xs gap-1.5 w-full sm:w-auto"
            >
              <Trash2 className="h-3.5 w-3.5" /> Request Account & CV Deletion
            </Button>
          </div>
        </div>
      </div>

      {/* Deletion Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Deletion Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to request account deletion? All personal data, uploaded resumes, and active application states for @{currentUser.username} will be permanently scheduled for purging.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                requestAccountDeletion();
                setDeleteModalOpen(false);
              }}
            >
              Confirm Deletion Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
