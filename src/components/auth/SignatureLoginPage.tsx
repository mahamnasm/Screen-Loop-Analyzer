import { useState } from "react";
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CareerBridgeLogo } from "@/components/shared/CareerBridgeBranding";
import { useAts, type UserRole } from "@/lib/ats-store";

export function SignatureLoginPage() {
  const { loginWithIdentifier, register } = useAts();

  // Mode: "signin" | "register"
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Sign in form state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCity, setRegCity] = useState("Karachi");
  const [regTitle, setRegTitle] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("candidate");

  // Forgot Password recovery state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter your username or email");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your account password");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      loginWithIdentifier(identifier.trim(), password);
      setIsLoading(false);
    }, 250);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      toast.error("Please provide both your full name and email address");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    const cleanUsername =
      regUsername.trim().toLowerCase() || regName.trim().toLowerCase().replace(/\s+/g, ".");

    register({
      name: regName.trim(),
      username: cleanUsername,
      email: regEmail.trim(),
      password: regPassword,
      city: regCity,
      title:
        regTitle.trim() ||
        (regRole === "candidate"
          ? "Software Engineer"
          : regRole === "hr"
            ? "Talent Acquisition Partner"
            : "Operations Director"),
      role: regRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`,
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#202940] text-foreground antialiased selection:bg-[#caaa98]/40 selection:text-[#202940]">
      {/* ==================================================================== */}
      {/* LEFT SECTION (55% ON DESKTOP) — Signature CareerBridge Panoramic Hero */}
      {/* ==================================================================== */}
      <div className="w-full lg:w-[55%] min-h-[700px] text-[#fbf9f6] p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2d3854]">
        {/* Scenic Background Image: Islamabad Skyline, Faisal Mosque & Modern Executive Desk */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url('/images/careerbridge_hero.jpg')`,
          }}
        />
        {/* Subtle dual-layer gradient wash to ensure pristine readability of all typography while letting the panoramic window shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141b2d]/85 via-[#182035]/60 to-[#202940]/75 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121727]/95 via-transparent to-[#141b2d]/60 pointer-events-none" />

        {/* Top: Brand Header & Handwritten Signature */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#caaa98] via-[#dfbeaa] to-[#9a8678] text-[#202940] shadow-xl shadow-black/40 border border-[#caaa98]/60 p-2">
              <CareerBridgeLogo className="h-full w-full text-[#202940]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                  Screenloop
                </span>
                <span className="rounded-md bg-[#202940]/85 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#caaa98] border border-[#caaa98]/40">
                  CareerBridge
                </span>
              </div>
              <p className="text-[11px] text-[#caaa98] font-medium tracking-wide">
                Better Talent | Stronger Companies | A Brighter Pakistan
              </p>
              <p className="text-[10px] text-white/70 font-mono tracking-wide">
                Applicant Tracking & AI Evaluation
              </p>
            </div>
          </div>

          {/* Top-Right Calligraphic Script Watermark */}
          <div className="hidden sm:flex flex-col items-end pt-1">
            <span className="font-script text-3xl sm:text-4xl text-[#fbf9f6] tracking-wide drop-shadow-md select-none transform -rotate-2">
              Building Better Futures
            </span>
            <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-[#caaa98] to-transparent rounded-full mt-0.5" />
          </div>
        </div>

        {/* Center: Main Headline, Pitch & 4 Circular Action Discs */}
        <div className="relative z-10 py-8 lg:py-10 space-y-8 max-w-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1b233a]/80 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-[#caaa98] border border-[#caaa98]/30 shadow-sm">
              <Compass className="h-3.5 w-3.5 text-[#caaa98]" />
              <span>National Career & Recruitment Infrastructure</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-[1.18] drop-shadow-lg">
              Your Next Opportunity
              <br />
              Is{" "}
              <span className="bg-gradient-to-r from-[#caaa98] via-[#dfbeaa] to-[#f5dfd0] bg-clip-text text-transparent">
                Closer
              </span>{" "}
              Than You Think
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-lg drop-shadow-sm font-normal">
              We connect talented individuals with top companies across Pakistan and beyond. Whether
              you&apos;re looking for your dream job or the right talent, Screenloop is here to make
              it happen.
            </p>
          </div>

          {/* 4 Frosted Glass Circular Action Discs matching the reference image */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
            {/* 1. Find Jobs */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full glass-pill flex items-center justify-center text-[#caaa98] group-hover:text-white group-hover:border-[#caaa98] shadow-lg shadow-black/25 mb-2 transition">
                <Search className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white group-hover:text-[#caaa98] transition">
                Find Jobs
              </span>
              <span className="text-[10px] text-white/60 mt-0.5">23+ Live Openings</span>
            </div>

            {/* 2. Build Your Profile */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full glass-pill flex items-center justify-center text-[#caaa98] group-hover:text-white group-hover:border-[#caaa98] shadow-lg shadow-black/25 mb-2 transition">
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white group-hover:text-[#caaa98] transition">
                Build Your Profile
              </span>
              <span className="text-[10px] text-white/60 mt-0.5">AI CV Scoring</span>
            </div>

            {/* 3. Get Hired */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full glass-pill flex items-center justify-center text-[#caaa98] group-hover:text-white group-hover:border-[#caaa98] shadow-lg shadow-black/25 mb-2 transition">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white group-hover:text-[#caaa98] transition">
                Get Hired
              </span>
              <span className="text-[10px] text-white/60 mt-0.5">Verified Companies</span>
            </div>

            {/* 4. Grow Your Career */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full glass-pill flex items-center justify-center text-[#caaa98] group-hover:text-white group-hover:border-[#caaa98] shadow-lg shadow-black/25 mb-2 transition">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white group-hover:text-[#caaa98] transition">
                Grow Your Career
              </span>
              <span className="text-[10px] text-white/60 mt-0.5">PKR Salary Guide</span>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Slogan and Geographic Reach with Reference Dot Grid Pattern */}
        <div className="relative z-10 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/80">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="text-white">More Opportunities</span>
            <span className="text-[#caaa98]">|</span>
            <span className="text-[#caaa98] font-bold">Better Matches</span>
            <span className="text-[#caaa98]">|</span>
            <span className="text-white">Brighter Futures</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/70 font-mono">
            <span>Karachi</span>
            <span>·</span>
            <span>Lahore</span>
            <span>·</span>
            <span>Islamabad</span>
            <span>·</span>
            <span>Remote</span>
          </div>
        </div>

        {/* Decorative corner dot grid & glowing rim (matching the mockup) */}
        <div className="absolute -bottom-6 -right-6 w-40 h-32 careerbridge-dot-grid opacity-35 pointer-events-none rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-0.5 bg-gradient-to-l from-[#caaa98]/80 via-[#caaa98]/40 to-transparent pointer-events-none" />
      </div>

      {/* ==================================================================== */}
      {/* RIGHT SECTION (45% ON DESKTOP) — Secure Login & Role Credentials     */}
      {/* ==================================================================== */}
      <div className="w-full lg:w-[45%] bg-[#fbf9f6] text-[#202940] p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Trust Badge at top */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f3ede4] px-3 py-1 text-xs font-semibold text-[#4b4038] border border-[#e2d8cd]">
              <Shield className="h-3.5 w-3.5 text-[#4b4038]" />
              <span>Enterprise ATS Security</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#9a8678] font-medium">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-mono text-[11px]">256-Bit SSL</span>
            </div>
          </div>

          {/* Logo at top of Secure Login Card */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#202940] to-[#4b4038] text-[#caaa98] border border-[#caaa98]/40 shadow-md shadow-[#202940]/20 p-2">
              <CareerBridgeLogo className="h-full w-full text-[#caaa98]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-bold tracking-tight text-[#202940]">
                  Screenloop
                </span>
                <span className="rounded bg-[#caaa98]/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-[#4b4038] border border-[#caaa98]/40">
                  ATS
                </span>
              </div>
              <p className="text-xs text-[#4b4038]">Applicant Tracking & AI Evaluation</p>
            </div>
          </div>

          {/* Welcome Heading */}
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#202940]">
              {authMode === "signin" ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-xs sm:text-sm text-[#4b4038]">
              {authMode === "signin"
                ? "Sign in with your credentials to access your organization workspace, candidate evaluations, and job requisitions."
                : "Join Pakistan's premier recruitment platform as a candidate, recruiter, or partner enterprise."}
            </p>
          </div>

          {/* Mode Tabs (Sign In / Register) */}
          <div className="flex rounded-xl bg-[#f3ede4] p-1 border border-[#e2d8cd]">
            <button
              type="button"
              onClick={() => setAuthMode("signin")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-white text-[#202940] shadow-xs border border-[#e2d8cd]"
                  : "text-[#4b4038] hover:text-[#202940]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "register"
                  ? "bg-white text-[#202940] shadow-xs border border-[#e2d8cd]"
                  : "text-[#4b4038] hover:text-[#202940]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN FORM */}
          {authMode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Username or Email */}
              <div className="space-y-1.5">
                <Label htmlFor="signin-identifier" className="text-xs font-semibold text-[#202940]">
                  Username or Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a8678]" />
                  <Input
                    id="signin-identifier"
                    type="text"
                    required
                    placeholder="Enter your username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-9 h-11 bg-white border-[#e2d8cd] text-[#202940] placeholder:text-[#9a8678] focus-visible:ring-[#caaa98] focus-visible:border-[#caaa98] rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-xs font-semibold text-[#202940]">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs font-medium text-[#4b4038] hover:text-[#202940] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a8678]" />
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 bg-white border-[#e2d8cd] text-[#202940] placeholder:text-[#9a8678] focus-visible:ring-[#caaa98] focus-visible:border-[#caaa98] rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8678] hover:text-[#202940] cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Warm Accent Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#202940] hover:bg-[#182035] text-[#fbf9f6] border border-[#4b4038] hover:border-[#caaa98]/60 font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#202940]/25 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>{isLoading ? "Authenticating..." : "Sign In"}</span>
                <ArrowRight className="h-4 w-4 text-[#caaa98]" />
              </Button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="reg-name" className="text-xs font-semibold text-[#202940]">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a8678]" />
                  <Input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="e.g. Bilal Ahmed"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="pl-9 h-10 bg-white border-[#e2d8cd] text-[#202940] rounded-xl text-xs placeholder:text-[#9a8678] focus-visible:ring-[#caaa98]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="reg-username" className="text-xs font-semibold text-[#202940]">
                    Username
                  </Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="bilal.dev"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="h-10 bg-white border-[#e2d8cd] text-[#202940] rounded-xl text-xs placeholder:text-[#9a8678] focus-visible:ring-[#caaa98]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-city" className="text-xs font-semibold text-[#202940]">
                    City
                  </Label>
                  <Input
                    id="reg-city"
                    type="text"
                    placeholder="Karachi, Lahore, etc."
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="h-10 bg-white border-[#e2d8cd] text-[#202940] rounded-xl text-xs placeholder:text-[#9a8678] focus-visible:ring-[#caaa98]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-email" className="text-xs font-semibold text-[#202940]">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a8678]" />
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="bilal.ahmed@example.pk"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-9 h-10 bg-white border-[#e2d8cd] text-[#202940] rounded-xl text-xs placeholder:text-[#9a8678] focus-visible:ring-[#caaa98]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-password" className="text-xs font-semibold text-[#202940]">
                  Password (min 6 chars)
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a8678]" />
                  <Input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="Create a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-9 h-10 bg-white border-[#e2d8cd] text-[#202940] rounded-xl text-xs placeholder:text-[#9a8678] focus-visible:ring-[#caaa98]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#202940]">Platform Role</Label>
                <RadioGroup
                  value={regRole}
                  onValueChange={(val) => setRegRole(val as UserRole)}
                  className="grid grid-cols-3 gap-1.5 pt-1"
                >
                  <div
                    onClick={() => setRegRole("candidate")}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center cursor-pointer transition ${
                      regRole === "candidate"
                        ? "bg-[#caaa98]/20 border-[#caaa98] text-[#4b4038] font-bold"
                        : "bg-white border-[#e2d8cd] text-[#9a8678]"
                    }`}
                  >
                    <UserCheck className="h-4 w-4 mb-1 text-[#4b4038]" />
                    <span className="text-[11px]">Candidate</span>
                  </div>

                  <div
                    onClick={() => setRegRole("hr")}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center cursor-pointer transition ${
                      regRole === "hr"
                        ? "bg-[#4b4038] border-[#4b4038] text-[#fbf9f6] font-bold"
                        : "bg-white border-[#e2d8cd] text-[#9a8678]"
                    }`}
                  >
                    <Building2 className="h-4 w-4 mb-1" />
                    <span className="text-[11px]">Recruiter</span>
                  </div>

                  <div
                    onClick={() => setRegRole("company")}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center cursor-pointer transition ${
                      regRole === "company"
                        ? "bg-[#202940] border-[#202940] text-[#caaa98] font-bold"
                        : "bg-white border-[#e2d8cd] text-[#9a8678]"
                    }`}
                  >
                    <Briefcase className="h-4 w-4 mb-1" />
                    <span className="text-[11px]">Company</span>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#202940] hover:bg-[#182035] text-[#fbf9f6] border border-[#4b4038] hover:border-[#caaa98]/60 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>Register & Enter ATS</span>
                <ArrowRight className="h-4 w-4 text-[#caaa98]" />
              </Button>
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="text-center pt-2 border-t border-[#e2d8cd]">
            <p className="text-[11px] text-[#4b4038] font-medium">
              🔒 Protected by Role-Based Access Control & SOC Security Logging.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* FORGOT PASSWORD DIALOG (SECURE RECOVERY DISPATCH)                    */}
      {/* ==================================================================== */}
      <Dialog
        open={forgotPasswordOpen}
        onOpenChange={(open) => {
          setForgotPasswordOpen(open);
          if (!open) {
            setResetSent(false);
            setResetInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px] bg-white text-[#202940] border-[#e2d8cd]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4b4038]/10 text-[#4b4038]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#202940]">
                  Account Password Recovery
                </DialogTitle>
                <DialogDescription className="text-xs text-[#9a8678]">
                  Receive an encrypted recovery link via your registered primary email.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {resetSent ? (
            <div className="space-y-3 py-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">Recovery Instructions Dispatched</p>
                  <p className="mt-0.5 text-emerald-700">
                    If an active account is associated with{" "}
                    <span className="font-mono font-medium">{resetInput || "this identifier"}</span>
                    , a single-use cryptographically signed reset token has been transmitted.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[#9a8678]">
                Please inspect your corporate or personal inbox and follow the secured link within
                15 minutes.
              </p>
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="bg-[#202940] hover:bg-[#202940]/90 text-white text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!resetInput.trim()) {
                  toast.error("Please enter your registered email or username");
                  return;
                }
                setResetSent(true);
                toast.success("Password reset request submitted");
              }}
              className="space-y-4 py-2 text-xs text-[#4b4038]"
            >
              <p className="text-xs text-[#4b4038] leading-relaxed">
                Enter your registered corporate email or platform username. We will transmit
                identity verification steps without disclosing account existence.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="reset-id" className="text-xs font-semibold text-[#202940]">
                  Account Identifier / Email
                </Label>
                <Input
                  id="reset-id"
                  type="text"
                  placeholder="e.g. name@company.pk or username"
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value)}
                  className="h-9 text-xs border-[#e2d8cd] focus-visible:ring-[#4b4038]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2d8cd]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="text-xs border-[#e2d8cd]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#4b4038] hover:bg-[#3d332d] text-[#fbf9f6] text-xs font-semibold"
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
