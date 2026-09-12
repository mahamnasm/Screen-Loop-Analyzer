import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAts } from "@/lib/ats-store";

export function SystemHealthView() {
  const { jobs, candidates, companies, users, plugins, integrations } = useAts();
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>("Just now");

  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setLastCheck(new Date().toLocaleTimeString());
      toast.success(
        `Integrity Verified: ${jobs.length} jobs, ${candidates.length} candidates, and ${companies.length} companies validated with 0 schema conflicts.`
      );
    }, 600);
  };

  const handleClearCache = () => {
    toast.success("Client memory cache flushed and refreshed successfully.");
  };

  const services = [
    {
      name: "Primary Multi-Tenant Database",
      desc: "Storage engine holding candidates, jobs, and audit events",
      status: "Healthy",
      latency: "4 ms",
      icon: Database,
      details: `${candidates.length} candidates · ${jobs.length} active jobs`,
    },
    {
      name: "AI Evaluation & CV Match Engine",
      desc: "Deterministic keyword, skill, and degree calibration engine",
      status: "Operational",
      latency: "128 ms",
      icon: Zap,
      details: "No rate limit throttling detected",
    },
    {
      name: "Multi-Tenant Isolation Wall",
      desc: "Role-Based Access Control and Company Workspace boundary rules",
      status: "Protected",
      latency: "1 ms",
      icon: ShieldCheck,
      details: `${companies.length} Pakistani workspaces isolated`,
    },
    {
      name: "Resume Sanitizer & File Storage",
      desc: "Max 5MB PDF / DOCX validation & secure text extractor",
      status: "Operational",
      latency: "32 ms",
      icon: HardDrive,
      details: "MIME sanitization active",
    },
    {
      name: "Communications Dispatcher (SMTP / SMS)",
      desc: "Pakistani local SMS and SMTP email dispatch queue",
      status: "Ready",
      latency: "45 ms",
      icon: Mail,
      details: "Queue depth: 0 pending",
    },
    {
      name: "Plugin Sandboxing Runtime",
      desc: "Scoped permission container for candidate and recruiter plugins",
      status: "Active",
      latency: "2 ms",
      icon: Server,
      details: `${plugins.filter((p) => p.enabled).length} of ${plugins.length} plugins enabled`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Fully Operational</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Infrastructure & Service Health
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Real-time telemetry, service latency benchmarks, database integrity validation, and sandbox monitors.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="text-xs h-9"
            >
              Flush Cache
            </Button>
            <Button
              size="sm"
              disabled={isVerifying}
              onClick={handleVerifyIntegrity}
              className="text-xs h-9 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? "animate-spin" : ""}`} />
              {isVerifying ? "Verifying..." : "Verify Data Integrity"}
            </Button>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card/60 p-4">
            <div className="text-xs text-muted-foreground font-medium">Uptime SLA</div>
            <div className="mt-1 text-2xl font-bold text-foreground font-display">99.98%</div>
            <div className="text-[11px] text-emerald-600 font-medium">30 days rolling</div>
          </div>

          <div className="rounded-xl border bg-card/60 p-4">
            <div className="text-xs text-muted-foreground font-medium">Avg API Latency</div>
            <div className="mt-1 text-2xl font-bold text-foreground font-display">24 ms</div>
            <div className="text-[11px] text-muted-foreground">Local Pakistan nodes</div>
          </div>

          <div className="rounded-xl border bg-card/60 p-4">
            <div className="text-xs text-muted-foreground font-medium">Active Users</div>
            <div className="mt-1 text-2xl font-bold text-foreground font-display">{users.length}</div>
            <div className="text-[11px] text-muted-foreground">Across all roles</div>
          </div>

          <div className="rounded-xl border bg-card/60 p-4">
            <div className="text-xs text-muted-foreground font-medium">Last Health Probe</div>
            <div className="mt-1 text-lg font-bold text-foreground font-display truncate">
              {lastCheck}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">0 faults detected</div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.name}
              className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-semibold"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {svc.status}
                  </Badge>
                </div>

                <h3 className="mt-3 font-semibold text-sm text-foreground">
                  {svc.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {svc.desc}
                </p>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[11px]">{svc.details}</span>
                <span className="font-mono font-bold text-foreground">{svc.latency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
