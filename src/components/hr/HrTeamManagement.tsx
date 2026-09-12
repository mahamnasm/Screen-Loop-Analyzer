import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAts } from "@/lib/ats-store";

export function HrTeamManagement() {
  const { currentUser, companies, getCompanyTeam, inviteTeamMember, removeTeamMember } = useAts();

  // Active company
  const currentCompany = useMemo(() => {
    return (
      companies.find((c) => c.id === currentUser.companyId || c.name === currentUser.company) ||
      companies[0]
    );
  }, [companies, currentUser]);

  const companyId = currentCompany?.id || "comp-sys-01";
  const teamMembers = getCompanyTeam(companyId);

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"HR Admin" | "Recruiter" | "Hiring Manager">("Recruiter");
  const [department, setDepartment] = useState("Engineering");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in both name and company email.");
      return;
    }
    inviteTeamMember({
      name: name.trim(),
      username: email.trim().split("@")[0] || `rec_${Date.now()}`,
      email: email.trim(),
      role: "hr",
      companyRole: role,
      department,
    });
    setName("");
    setEmail("");
    setRole("Recruiter");
    setDepartment("Engineering");
    setInviteOpen(false);
  };

  const handleRemove = (memberId: string, memberName: string) => {
    if (memberId === currentUser.id) {
      toast.error("You cannot remove your own active account.");
      return;
    }
    removeTeamMember(memberId);
  };

  // Metrics
  const hrAdminsCount = teamMembers.filter((m) => m.companyRole === "HR Admin").length;
  const recruitersCount = teamMembers.filter((m) => m.companyRole === "Recruiter").length;
  const hiringManagersCount = teamMembers.filter((m) => m.companyRole === "Hiring Manager").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border bg-gradient-to-b from-card via-card to-muted/30 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Building2 className="h-3.5 w-3.5" />
              <span>{currentCompany?.name || "Company"} Recruitment Team</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground font-display">
              Team Members & Role Governance
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Manage internal recruiters, hiring managers, and assign hiring department scopes for isolated candidate pipelines.
            </p>
          </div>

          <Button onClick={() => setInviteOpen(true)} className="gap-2 shrink-0">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card/60 p-3.5">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5 text-primary" />
              Total Members
            </div>
            <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
              {teamMembers.length}
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Shield className="h-3.5 w-3.5 text-primary" />
              HR Admins
            </div>
            <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
              {hrAdminsCount}
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              Recruiters
            </div>
            <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
              {recruitersCount}
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Hiring Managers
            </div>
            <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
              {hiringManagersCount}
            </div>
          </div>
        </div>
      </div>

      {/* Team Member List */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              Authorized Recruitment Roster
            </h3>
            <p className="text-xs text-muted-foreground">
              Members have scoped access to {currentCompany?.name}'s job listings and candidates only.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {teamMembers.length} Active Accounts
          </Badge>
        </div>

        <div className="divide-y divide-border">
          {teamMembers.map((member) => {
            const isSelf = member.id === currentUser.id;
            return (
              <div
                key={member.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {member.name}
                      </span>
                      {isSelf && (
                        <Badge variant="secondary" className="text-[10px] py-0">
                          You
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 ${
                          member.companyRole === "HR Admin"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : member.companyRole === "Hiring Manager"
                            ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                        }`}
                      >
                        {member.companyRole || "Recruiter"}
                      </Badge>
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                      <span>·</span>
                      <span>{member.city || "Pakistan"}</span>
                      {member.assignedDepartments && member.assignedDepartments.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[11px] text-foreground">
                            Depts: {member.assignedDepartments.join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSelf}
                    onClick={() => handleRemove(member.id, member.name)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title={isSelf ? "Cannot remove current logged in user" : "Remove team member"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Add a recruiter or hiring manager to {currentCompany?.name}. They will only have access to this company's postings and candidate pool.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInvite} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="memberName" className="text-xs font-semibold">
                Full Name *
              </Label>
              <Input
                id="memberName"
                placeholder="e.g. Sara Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="memberEmail" className="text-xs font-semibold">
                Corporate Email Address *
              </Label>
              <Input
                id="memberEmail"
                type="email"
                placeholder="sara.ahmed@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role Scope</Label>
                <Select
                  value={role}
                  onValueChange={(val: "HR Admin" | "Recruiter" | "Hiring Manager") => setRole(val)}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                    <SelectItem value="Hiring Manager">Hiring Manager</SelectItem>
                    <SelectItem value="HR Admin">HR Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-3 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Data Isolation Notice:</span> Newly invited members receive access credentials scoped strictly to {currentCompany?.name}. Multi-tenant rules prevent cross-company access.
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs h-9 gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                Send Access Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
