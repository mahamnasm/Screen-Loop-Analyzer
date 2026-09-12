import { useState } from "react";
import {
  Building2,
  Check,
  KeyRound,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAts, type UserRole } from "@/lib/ats-store";

export function UserManagement() {
  const { users, currentUser, updateUserRole, toggleUserStatus, register, resetUserPassword } = useAts();

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Karachi");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<UserRole>("candidate");

  // Admin password reset modal state
  const [resetModalUser, setResetModalUser] = useState<{ id: string; name: string; username: string } | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const cleanUsername = username.trim().toLowerCase() || name.trim().toLowerCase().replace(/\s+/g, ".");
    register({
      name: name.trim(),
      username: cleanUsername,
      email: email.trim(),
      city: city || "Karachi",
      title: title.trim() || (role === "candidate" ? "Software Engineer" : role === "hr" ? "Recruiter" : "Administrator"),
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`,
    });
    setAddOpen(false);
    setName("");
    setUsername("");
    setEmail("");
    setCity("Karachi");
    setTitle("");
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case "admin":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-bold uppercase">
            <ShieldAlert className="mr-1 h-3 w-3" /> Admin
          </Badge>
        );
      case "hr":
        return (
          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-bold uppercase">
            <Users className="mr-1 h-3 w-3" /> HR Manager
          </Badge>
        );
      case "company":
        return (
          <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold uppercase">
            <Building2 className="mr-1 h-3 w-3" /> Company Admin
          </Badge>
        );
      case "candidate":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold uppercase">
            <UserCheck className="mr-1 h-3 w-3" /> Candidate
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            User Accounts & Access Control (RBAC)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage system users, assign role-based permissions, and configure administrative privileges.
          </p>
        </div>

        <Button onClick={() => setAddOpen(true)} size="sm" className="text-xs gap-1.5 shadow-xs">
          <UserPlus className="h-4 w-4" /> Add User Account
        </Button>
      </div>

      {/* Permissions Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <UserCheck className="h-4 w-4 text-emerald-600" /> Candidate Role
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Can browse open job listings, upload resumes, submit applications, and track application milestones live.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Users className="h-4 w-4 text-primary" /> HR / Recruiter Role
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Full Kanban board management, drag-and-drop status changes, AI score inspections, and interview bookings.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <ShieldAlert className="h-4 w-4 text-purple-600" /> System Admin
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Full platform control, user promotion/demotion, job creation, criteria weighting, and company metrics.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow>
              <TableHead className="font-bold">User</TableHead>
              <TableHead className="font-bold">Title / Designation</TableHead>
              <TableHead className="font-bold">Assigned Role</TableHead>
              <TableHead className="font-bold">Account Status</TableHead>
              <TableHead className="text-right font-bold">Permissions Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {users.map((u) => {
              const isCurrent = currentUser.id === u.id;

              return (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-8 w-8 rounded-full border bg-muted object-cover shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-foreground text-xs flex items-center gap-1">
                          {u.name}
                          {isCurrent && (
                            <span className="rounded bg-primary/10 px-1 py-0.2 text-[9px] text-primary font-bold">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          @{u.username} · {u.email} · {u.city}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">{u.title}</TableCell>

                  <TableCell>{getRoleBadge(u.role)}</TableCell>

                  <TableCell>
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.active
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          u.active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                        }`}
                      />
                      {u.active ? "Active" : "Suspended"}
                    </button>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setResetModalUser({ id: u.id, name: u.name, username: u.username });
                          setAdminNewPassword("");
                        }}
                        className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                        title="Reset user credentials"
                      >
                        <KeyRound className="h-3 w-3 mr-1 text-amber-500" />
                        Reset PW
                      </Button>
                      <Select
                        value={u.role}
                        onValueChange={(newRole) => updateUserRole(u.id, newRole as UserRole)}
                      >
                        <SelectTrigger className="h-7 text-xs w-28 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="candidate">Candidate</SelectItem>
                          <SelectItem value="hr">HR Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add User Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add New User Account</DialogTitle>
            <DialogDescription className="text-xs">
              Create an account and assign their initial platform role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="new-u-name" className="text-xs">Full Name</Label>
                <Input
                  id="new-u-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!username) {
                      setUsername(e.target.value.trim().toLowerCase().replace(/\s+/g, "."));
                    }
                  }}
                  placeholder="e.g. Bilal Sheikh"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="new-u-user" className="text-xs">Username / System Handle</Label>
                <Input
                  id="new-u-user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. bilal.sheikh"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="new-u-email" className="text-xs">Email Address</Label>
                <Input
                  id="new-u-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bilal@screenloop.pk"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">City</Label>
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
            </div>

            <div className="space-y-1">
              <Label htmlFor="new-u-title" className="text-xs">Job Title</Label>
              <Input
                id="new-u-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Full Stack Engineer"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Role Assignment</Label>
              <Select value={role} onValueChange={(r) => setRole(r as UserRole)}>
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate (Job Seeker)</SelectItem>
                  <SelectItem value="hr">HR / Recruiter</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Reset User Password Dialog */}
      <Dialog open={!!resetModalUser} onOpenChange={(open) => !open && setResetModalUser(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Reset User Password</DialogTitle>
                <DialogDescription className="text-xs">
                  Issue a new credential for <span className="font-semibold text-foreground">{resetModalUser?.name}</span> (@{resetModalUser?.username}).
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!resetModalUser) return;
              if (adminNewPassword.length < 6) {
                toast.error("Password must be at least 6 characters long");
                return;
              }
              resetUserPassword(resetModalUser.id, adminNewPassword);
              toast.success(`Password updated for @${resetModalUser.username}`);
              setResetModalUser(null);
              setAdminNewPassword("");
            }}
            className="space-y-4 pt-2 text-xs"
          >
            <div className="space-y-1.5">
              <Label htmlFor="admin-new-pwd" className="text-xs font-semibold">
                New Temporary Password
              </Label>
              <Input
                id="admin-new-pwd"
                type="password"
                required
                placeholder="Enter minimum 6 characters"
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
                className="h-9 text-xs"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                The user will be prompted to update this credential on next sign in.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-8"
                onClick={() => {
                  const temp = "Temp" + Math.floor(100000 + Math.random() * 900000) + "!";
                  setAdminNewPassword(temp);
                  toast.info("Generated secure temporary password");
                }}
              >
                Generate Random
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResetModalUser(null)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs h-8 font-semibold"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
