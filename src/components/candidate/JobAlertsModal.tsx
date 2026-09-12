import { useState, useEffect } from "react";
import { Bell, Check, Clock, Mail, MapPin, Send, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAts } from "@/lib/ats-store";

interface JobAlertsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobAlertsModal({ open, onOpenChange }: JobAlertsModalProps) {
  const { currentUser, activeJobs, logAuditEvent } = useAts();

  const storageKey = `screenloop_job_alerts_${currentUser.username}`;

  const [email, setEmail] = useState(currentUser.email);
  const [keywords, setKeywords] = useState(currentUser.title || "Software Engineer");
  const [city, setCity] = useState("all");
  const [minSalary, setMinSalary] = useState("150000");
  const [frequency, setFrequency] = useState("daily");
  const [department, setDepartment] = useState("all");
  const [enabled, setEnabled] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.keywords) setKeywords(parsed.keywords);
        if (parsed.city) setCity(parsed.city);
        if (parsed.minSalary) setMinSalary(parsed.minSalary);
        if (parsed.frequency) setFrequency(parsed.frequency);
        if (parsed.department) setDepartment(parsed.department);
        if (typeof parsed.enabled === "boolean") setEnabled(parsed.enabled);
      }
    } catch {
      // ignore parsing error
    }
  }, [storageKey]);

  // Compute matching job count for preview
  const matchingJobs = activeJobs.filter((j) => {
    if (keywords.trim()) {
      const q = keywords.toLowerCase();
      const match =
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (city !== "all" && j.city !== city) return false;
    if (department !== "all" && j.department !== department) return false;
    if (Number(minSalary) > 0 && j.salaryMaxPKR < Number(minSalary)) return false;
    return true;
  });

  const handleSave = () => {
    if (!email || !email.includes("@")) {
      toast.error("Please provide a valid email address for alerts");
      return;
    }

    const payload = {
      email,
      keywords,
      city,
      minSalary,
      frequency,
      department,
      enabled,
      updatedAt: Date.now(),
    };

    localStorage.setItem(storageKey, JSON.stringify(payload));
    toast.success("Job alert preferences saved successfully!", {
      description: enabled
        ? `Alerts will be delivered to ${email} (${frequency} digest).`
        : "Job alerts have been paused.",
    });
    onOpenChange(false);
  };

  const handleSendTestEmail = () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address first");
      return;
    }

    setIsSendingTest(true);

    setTimeout(() => {
      setIsSendingTest(false);

      logAuditEvent({
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        action: "JOB_ALERT_DISPATCHED",
        resource: `Job Alerts (${email})`,
        details: `Dispatched test email job alert for '${keywords}' with ${matchingJobs.length} matched active roles`,
        severity: "info",
        ip: "127.0.0.1",
      });

      toast.success("Test alert email dispatched!", {
        description: `Sent to ${email}. Found ${matchingJobs.length} active matching jobs in Pakistan.`,
      });
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Email Job Alerts</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Direct Inbox Notifications
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Receive instant or periodic email updates when verified Pakistani jobs match your skills and salary.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Subscription Status Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                enabled ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
              }`}
            />
            <div>
              <p className="font-semibold text-foreground">
                {enabled ? "Alerts Active" : "Alerts Paused"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {enabled ? `Matching ${matchingJobs.length} active opportunities` : "No emails will be sent"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Enable Alerts</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3.5 py-1 text-xs">
          <div>
            <Label htmlFor="alert-email" className="text-xs font-semibold">
              Recipient Email Address
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="alert-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="pl-8 text-xs h-9 bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="alert-keywords" className="text-xs font-semibold">
                Job Title / Keywords
              </Label>
              <Input
                id="alert-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. React, Full Stack, Python"
                className="mt-1 text-xs h-9 bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Target Pakistani City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="mt-1 text-xs h-9 bg-background">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pakistan Cities</SelectItem>
                  <SelectItem value="Karachi">Karachi</SelectItem>
                  <SelectItem value="Lahore">Lahore</SelectItem>
                  <SelectItem value="Islamabad">Islamabad</SelectItem>
                  <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                  <SelectItem value="Peshawar">Peshawar</SelectItem>
                  <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                  <SelectItem value="Multan">Multan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Minimum Monthly Salary (PKR)</Label>
              <Select value={minSalary} onValueChange={setMinSalary}>
                <SelectTrigger className="mt-1 text-xs h-9 bg-background">
                  <SelectValue placeholder="Salary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Salary</SelectItem>
                  <SelectItem value="50000">PKR 50,000+ / mo</SelectItem>
                  <SelectItem value="100000">PKR 100,000+ / mo</SelectItem>
                  <SelectItem value="150000">PKR 150,000+ / mo</SelectItem>
                  <SelectItem value="250000">PKR 250,000+ / mo</SelectItem>
                  <SelectItem value="350000">PKR 350,000+ / mo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Notification Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="mt-1 text-xs h-9 bg-background">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant (Immediate upon posting)</SelectItem>
                  <SelectItem value="daily">Daily Morning Digest (9:00 AM PKT)</SelectItem>
                  <SelectItem value="weekly">Weekly Summary (Mondays)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Real-time Match Preview */}
          <div className="rounded-xl border bg-muted/20 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <div className="text-[11px]">
                <span className="font-semibold text-foreground">
                  {matchingJobs.length} Current Matching Jobs
                </span>
                <span className="text-muted-foreground ml-1">
                  ready for dispatch in your selected criteria.
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSendingTest}
              onClick={handleSendTestEmail}
              className="h-7 text-xs gap-1 whitespace-nowrap shadow-2xs"
            >
              <Send className="h-3 w-3" />
              {isSendingTest ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-2 pt-2 border-t flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="text-xs bg-primary text-primary-foreground font-semibold"
          >
            Save Job Alert Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
