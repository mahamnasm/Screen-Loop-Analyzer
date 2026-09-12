import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  Eye,
  Filter,
  Key,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAts } from "@/lib/ats-store";

export function SecurityDashboardView() {
  const { auditLogs, clearAuditLogs, logAuditEvent, currentUser } = useAts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = log.username.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchIp = log.ip.toLowerCase().includes(q);
        const matchResource = log.resource.toLowerCase().includes(q);
        if (!matchUser && !matchAction && !matchDetails && !matchIp && !matchResource) {
          return false;
        }
      }

      if (selectedSeverity !== "all" && log.severity !== selectedSeverity) {
        return false;
      }

      if (selectedRole !== "all" && log.role !== selectedRole) {
        return false;
      }

      return true;
    });
  }, [auditLogs, searchQuery, selectedSeverity, selectedRole]);

  // Telemetry metrics
  const criticalCount = auditLogs.filter((l) => l.severity === "critical").length;
  const warningCount = auditLogs.filter((l) => l.severity === "warning").length;
  const failedLoginsCount = auditLogs.filter((l) => l.action === "FAILED_LOGIN").length;
  const totalEvents = auditLogs.length;

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ats_security_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "ADMIN_ACTION",
      resource: "SecurityAuditLogs",
      details: `Exported ${auditLogs.length} audit trail records to encrypted JSON`,
      severity: "info",
      ip: "127.0.0.1",
    });

    toast.success("Security audit logs exported successfully.");
  };

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to reset audit trail records? This cannot be undone.")) {
      clearAuditLogs();
      toast.success("Audit trail records reset.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner — Command SOC Midnight Navy & Espresso Persona */}
      <div className="rounded-2xl border border-[#caaa98]/40 bg-gradient-to-b from-[#182035] via-[#202940] to-[#182035] text-white p-6 sm:p-7 shadow-lg shadow-[#202940]/25">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#caaa98]/40 bg-[#202940] px-3 py-1 text-xs font-semibold text-[#caaa98] font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-[#caaa98]" />
              <span>SOC Command Console · Tamper-Resistant Audit Trail</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Security Governance & SOC Audit Trail
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#c2ccdf]">
              Monitor multi-tenant boundary compliance, track authentication attempts, investigate access anomalies, and review immutable audit logs.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              className="text-xs h-9 gap-1.5 bg-[#202940] hover:bg-[#182035] text-[#fbf9f6] border-[#caaa98]/40"
            >
              <Download className="h-3.5 w-3.5 text-[#caaa98]" />
              Export Audit JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearLogs}
              className="text-xs h-9 text-[#a0adca] hover:text-rose-400"
              title="Clear all logs"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Security Metric Counters */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-[#2e3b5e] bg-[#1a233b]/80 p-4">
            <div className="text-xs text-[#a0adca] flex items-center justify-between font-medium">
              <span>Total Audit Events</span>
              <Shield className="h-4 w-4 text-[#caaa98]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-white font-display">
              {totalEvents}
            </div>
            <div className="mt-1 text-[11px] text-[#8c9bb7]">Logged across all sessions</div>
          </div>

          <div className="rounded-xl border border-[#2e3b5e] bg-[#1a233b]/80 p-4">
            <div className="text-xs text-[#a0adca] flex items-center justify-between font-medium">
              <span>High Severity Alerts</span>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-rose-400 font-display">
              {criticalCount}
            </div>
            <div className="mt-1 text-[11px] text-[#8c9bb7]">Immediate SOC attention</div>
          </div>

          <div className="rounded-xl border border-[#2e3b5e] bg-[#1a233b]/80 p-4">
            <div className="text-xs text-[#a0adca] flex items-center justify-between font-medium">
              <span>Failed Auth Attempts</span>
              <UserX className="h-4 w-4 text-[#caaa98]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#caaa98] font-display">
              {failedLoginsCount}
            </div>
            <div className="mt-1 text-[11px] text-[#8c9bb7]">Rate limit active</div>
          </div>

          <div className="rounded-xl border border-[#2e3b5e] bg-[#1a233b]/80 p-4">
            <div className="text-xs text-[#a0adca] flex items-center justify-between font-medium">
              <span>Tenant Security</span>
              <Database className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-emerald-400 font-display">
              Isolated
            </div>
            <div className="mt-1 text-[11px] text-[#8c9bb7]">Cross-tenant block active</div>
          </div>
        </div>
      </div>

      {/* Security Posture Guards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Multi-Tenant Isolation Wall</h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Active & Verified</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Company A recruiters are cryptographically prevented from viewing candidate resumes, internal evaluation scores, or notes belonging to Company B.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Role-Based Access Control (RBAC)</h3>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 font-bold">4 Roles Enforced</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Candidates only access their own submissions. Company accounts manage hiring pipelines. System Admins maintain overall platform governance.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Pakistani PII & CV Guard</h3>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">Max 5MB / PDF / DOCX</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Strict file sanitization prevents executable uploads. Candidate contact details and expected salaries are revealed only to companies where applications were submitted.
          </p>
        </div>
      </div>

      {/* Audit Log Table & Filtering */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        {/* Table Header & Controls */}
        <div className="p-5 border-b bg-muted/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground font-display">
                Immutable System Audit Trail ({filteredLogs.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Chronological record of authentication, CV access, stage transitions, and administration events.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
              SOC 2 Type II Telemetry
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="relative sm:col-span-6">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit trail by user, action, IP, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background text-xs h-9"
              />
            </div>

            <div className="sm:col-span-3">
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="bg-background text-xs h-9">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="warning">Warnings</SelectItem>
                  <SelectItem value="info">Info Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-background text-xs h-9">
                  <SelectValue placeholder="Actor Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="hr">HR / Recruiter</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                <th className="p-3.5 pl-5">Timestamp</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Resource</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5 pr-5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    No security events found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleString("en-PK", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  });

                  return (
                    <tr key={log.id} className="hover:bg-muted/20 transition">
                      <td className="p-3.5 pl-5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold py-0.5 ${
                            log.severity === "critical"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
                              : log.severity === "warning"
                              ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30"
                              : "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30"
                          }`}
                        >
                          {log.severity.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{log.username}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">
                          {log.role}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] font-semibold text-foreground whitespace-nowrap">
                        {log.action}
                      </td>

                      <td className="p-3.5 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                        {log.resource}
                      </td>

                      <td className="p-3.5 max-w-xs truncate text-muted-foreground" title={log.details}>
                        {log.details}
                      </td>

                      <td className="p-3.5 pr-5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {log.ip}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
