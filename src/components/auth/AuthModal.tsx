import { useState } from "react";
import { Check, KeyRound, LogIn, Sparkles, UserCheck, UserPlus, Users } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAts, type UserRole, type UserAccount } from "@/lib/ats-store";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { users, currentUser, login, register, secureSwitchUser } = useAts();
  const [tab, setTab] = useState<"login" | "quick" | "register">("login");

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Account Switch with Password Challenge
  const [targetUser, setTargetUser] = useState<UserAccount | null>(null);
  const [switchPassword, setSwitchPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCity, setRegCity] = useState("Karachi");
  const [regTitle, setRegTitle] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("candidate");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      toast.error("Please enter your username or email address");
      return;
    }
    const success = login(loginIdentifier.trim(), loginPassword);
    if (success) {
      onOpenChange(false);
      setLoginIdentifier("");
      setLoginPassword("");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    const cleanUsername = regUsername.trim().toLowerCase() || regName.trim().toLowerCase().replace(/\s+/g, ".");
    register({
      name: regName.trim(),
      username: cleanUsername,
      email: regEmail.trim(),
      password: regPassword,
      city: regCity || "Karachi",
      title: regTitle.trim() || (regRole === "candidate" ? "Software Engineer" : regRole === "hr" ? "Talent Partner" : "System Admin"),
      role: regRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`,
    });
    onOpenChange(false);
    setRegName("");
    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setRegCity("Karachi");
    setRegTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Authentication & Role Access
              </DialogTitle>
              <DialogDescription>
                Sign in with your enterprise credentials, create an account, or authenticate as a pre-loaded profile.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login" className="text-xs sm:text-sm">
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="quick" className="text-xs sm:text-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs sm:text-sm">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Profiles & Secure Account Switching */}
          <TabsContent value="quick" className="space-y-3 pt-3">
            {targetUser ? (
              <div className="space-y-3 rounded-xl border p-4 bg-muted/20">
                <div className="flex items-center gap-3">
                  <img
                    src={targetUser.avatar}
                    alt={targetUser.name}
                    className="h-10 w-10 rounded-full border bg-muted object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {targetUser.name}
                      </span>
                      <Badge className="text-[10px] uppercase font-bold tracking-wider">
                        {targetUser.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{targetUser.title}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      @{targetUser.username} {targetUser.company ? `· ${targetUser.company}` : ""}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!switchPassword.trim()) {
                      toast.error("Please enter the account password");
                      return;
                    }
                    const ok = secureSwitchUser(targetUser.id, switchPassword);
                    if (ok) {
                      setTargetUser(null);
                      setSwitchPassword("");
                      onOpenChange(false);
                    }
                  }}
                  className="space-y-3 pt-2"
                >
                  <div className="space-y-1">
                    <Label htmlFor="switch-pwd" className="text-xs font-semibold">
                      Account Password Required
                    </Label>
                    <Input
                      id="switch-pwd"
                      type="password"
                      required
                      placeholder="Enter account password"
                      value={switchPassword}
                      onChange={(e) => setSwitchPassword(e.target.value)}
                      className="h-9 text-xs"
                      autoFocus
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Security Protection: Enter password to authenticate session transfer.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetUser(null);
                        setSwitchPassword("");
                      }}
                      className="h-8 text-xs"
                    >
                      Back to List
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-8 text-xs bg-[#202940] hover:bg-[#182035] text-[#fbf9f6] border border-[#4b4038] hover:border-[#caaa98]/50 font-bold cursor-pointer"
                    >
                      Verify & Switch Account
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Select an account to verify credentials and switch your active dashboard:
                </p>

                <div className="grid gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {users.map((u) => {
                    const isCurrent = currentUser.id === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (isCurrent) return;
                          setTargetUser(u);
                          setSwitchPassword("");
                        }}
                        className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition hover:border-primary hover:bg-accent/40 ${
                          isCurrent
                            ? "border-primary/70 bg-primary/5 ring-1 ring-primary/40"
                            : "bg-card cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-10 w-10 rounded-full border bg-muted object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">
                                {u.name}
                              </span>
                              <Badge
                                variant={
                                  u.role === "admin"
                                    ? "destructive"
                                    : u.role === "hr"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-[10px] uppercase font-bold tracking-wider"
                              >
                                {u.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{u.title}</p>
                            <p className="text-[11px] text-muted-foreground/80 font-mono">
                              @{u.username} · {u.city} {u.company ? `· ${u.company}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          {isCurrent ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-primary">
                              <Check className="h-4 w-4" /> Active
                            </span>
                          ) : (
                            <span className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-xs hover:border-primary">
                              Switch →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* Regular Login */}
          <TabsContent value="login" className="space-y-4 pt-3">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="login-id">Username or Email</Label>
                <Input
                  id="login-id"
                  placeholder="e.g. ali.khan or tariq.recruiter"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Encrypted password verified against platform RBAC database.
                </p>
              </div>

              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            </form>
          </TabsContent>

          {/* Registration */}
          <TabsContent value="register" className="space-y-4 pt-3">
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    placeholder="e.g. Bilal Sheikh"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (!regUsername) {
                        setRegUsername(e.target.value.trim().toLowerCase().replace(/\s+/g, "."));
                      }
                    }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-uname">Username</Label>
                  <Input
                    id="reg-uname"
                    placeholder="e.g. bilal.sheikh"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email Address</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="bilal@screenloop.pk"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-city">City</Label>
                  <Input
                    id="reg-city"
                    placeholder="e.g. Karachi or Lahore"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-title">Job Title / Specialty</Label>
                <Input
                  id="reg-title"
                  placeholder="e.g. Full Stack Developer or Talent Partner"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-pwd">Password (min 6 chars)</Label>
                <Input
                  id="reg-pwd"
                  type="password"
                  required
                  placeholder="Create account password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Account Role</Label>
                <RadioGroup
                  value={regRole}
                  onValueChange={(v) => setRegRole(v as UserRole)}
                  className="grid grid-cols-3 gap-2 pt-1"
                >
                  <label className="flex cursor-pointer flex-col items-center justify-between rounded-lg border bg-card p-2.5 text-center hover:bg-accent/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                    <RadioGroupItem value="candidate" className="sr-only" />
                    <UserCheck className="mb-1 h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold">Candidate</span>
                    <span className="text-[10px] text-muted-foreground">Job Seeker</span>
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-between rounded-lg border bg-card p-2.5 text-center hover:bg-accent/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                    <RadioGroupItem value="hr" className="sr-only" />
                    <Users className="mb-1 h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">HR / ATS</span>
                    <span className="text-[10px] text-muted-foreground">Recruiter</span>
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-between rounded-lg border bg-card p-2.5 text-center hover:bg-accent/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                    <RadioGroupItem value="admin" className="sr-only" />
                    <KeyRound className="mb-1 h-4 w-4 text-rose-600" />
                    <span className="text-xs font-semibold">Admin</span>
                    <span className="text-[10px] text-muted-foreground">Full Access</span>
                  </label>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Create Account & Sign In
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
