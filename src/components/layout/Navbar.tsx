import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  Command,
  Eye,
  FileText,
  Kanban,
  Layers,
  LogOut,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Smartphone,
  UserCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { CareerBridgeLogo } from "@/components/shared/CareerBridgeBranding";
import { MobileAppDownloadModal } from "@/components/shared/MobileAppDownloadModal";
import { useAts, type UserRole } from "@/lib/ats-store";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const {
    currentUser,
    restorePlatformDefaults,
    logout,
    isolatedCandidates,
    isolatedJobs,
    savedJobs,
    candidateApplications,
  } = useAts();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  // Keyboard shortcut ⌘K / Ctrl+K listener for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "candidate":
        return (
          <Badge className="bg-[#caaa98]/20 text-[#4b4038] dark:text-[#caaa98] hover:bg-[#caaa98]/30 border border-[#caaa98]/60 shadow-2xs font-medium">
            <UserCheck className="mr-1 h-3 w-3 text-[#caaa98]" /> Candidate Portal
          </Badge>
        );
      case "hr":
        return (
          <Badge className="bg-[#4b4038] text-[#fbf9f6] hover:bg-[#3d332d] border border-[#9a8678]/40 shadow-2xs font-medium">
            <Kanban className="mr-1 h-3 w-3 text-[#caaa98]" /> HR & Recruiter ATS
          </Badge>
        );
      case "company":
        return (
          <Badge className="bg-[#202940] text-[#caaa98] hover:bg-[#182035] border border-[#caaa98]/40 shadow-2xs font-medium">
            <Building2 className="mr-1 h-3 w-3 text-[#caaa98]" /> Company Workspace
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-[#202940] text-[#fbf9f6] hover:bg-[#182035] border border-[#caaa98] font-mono shadow-2xs font-medium">
            <ShieldAlert className="mr-1 h-3 w-3 text-[#caaa98]" /> Admin Console
          </Badge>
        );
    }
  };

  // Quick navigation destinations per role
  const quickNavDestinations = useMemo(() => {
    switch (currentUser.role) {
      case "candidate":
        return [
          { id: "overview", label: "Dashboard Overview", icon: Sparkles, desc: "Applications summary & AI career metrics" },
          { id: "jobs", label: "Find Jobs & Open Roles", icon: Briefcase, desc: "Explore verified vacancies across Pakistan" },
          { id: "my-cv", label: "My CV Document & Picture Format", icon: FileText, desc: "Download text dossier or picture CV" },
          { id: "applications", label: "My Submitted Applications", icon: Layers, desc: "Track review and interview stages" },
          { id: "interviews", label: "My Scheduled Interviews", icon: Calendar, desc: "Upcoming Google Meet video calls" },
        ];
      case "hr":
        return [
          { id: "kanban", label: "Recruiter Kanban Board", icon: Kanban, desc: "Interactive hiring pipeline & AI screening" },
          { id: "applicants", label: "Applicant Table View", icon: Users, desc: "Review candidate scores and start Google Meet" },
          { id: "jobs", label: "Requisitions & Openings", icon: Briefcase, desc: "Active company job requisitions" },
          { id: "interviews", label: "Interview Schedules", icon: Calendar, desc: "Manage interview calendar & meetings" },
          { id: "company-needs", label: "Talent Needs Analyzer", icon: Sparkles, desc: "Benchmark salary and skill gaps" },
        ];
      case "company":
        return [
          { id: "overview", label: "Company Workspace Overview", icon: Building2, desc: "Organizational hiring telemetry" },
          { id: "jobs", label: "Job Requisitions", icon: Briefcase, desc: "Create and publish requisitions" },
          { id: "applicants", label: "Candidate Applicants", icon: Users, desc: "Manage applicants for active roles" },
        ];
      case "admin":
        return [
          { id: "analytics", label: "Platform Analytics & KPIs", icon: Sparkles, desc: "Hiring funnel, sourcing charts, and metrics" },
          { id: "audit", label: "Security & Audit Logs", icon: ShieldAlert, desc: "SOC-2 compliance and activity log trail" },
          { id: "users", label: "Platform User Accounts", icon: Users, desc: "Manage candidates, recruiters, and admins" },
          { id: "companies", label: "Registered Companies", icon: Building2, desc: "Corporate verification and approval" },
        ];
    }
  }, [currentUser.role]);

  // Filtered items based on searchQuery
  const filteredQuickNav = useMemo(() => {
    if (!searchQuery.trim()) return quickNavDestinations;
    const q = searchQuery.toLowerCase();
    return quickNavDestinations.filter(
      (item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    );
  }, [quickNavDestinations, searchQuery]);

  return (
    <>
      {/* Glassmorphic Navbar Strip for Every Login */}
      <header className="sticky top-0 z-40 w-full border-b border-white/40 dark:border-[#2d3854]/80 bg-white/75 dark:bg-[#202940]/75 backdrop-blur-md shadow-xs transition-all">
        {/* Top Verified Super Admin Security & RBAC Enforcement Banner (Admin only) */}
        {currentUser.role === "admin" && (
          <div className="bg-[#f3ede4]/80 dark:bg-[#182035]/80 backdrop-blur-md border-b border-[#e2d8cd]/70 dark:border-[#2d3854]/70 px-4 py-1.5 text-xs text-[#4b4038] dark:text-[#caaa98] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-semibold text-[#202940]">Super Admin Session:</span>
              <span className="font-bold text-[#202940]">
                {currentUser.name}{" "}
                <span className="font-normal text-[#4b4038]">(@{currentUser.username})</span>
              </span>
              <span className="text-[#9a8678] hidden sm:inline">·</span>
              <span className="hidden sm:inline text-[11px] font-mono text-[#4b4038]">
                {currentUser.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#4b4038] dark:text-[#caaa98] font-medium hidden md:inline">
                🛡️ Platform Governance & RBAC Active
              </span>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onTabChange("default")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#202940] to-[#4b4038] text-[#caaa98] border border-[#caaa98]/40 shadow-md shadow-[#202940]/20 p-1.5">
                <CareerBridgeLogo className="h-full w-full text-[#caaa98]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg font-bold tracking-tight text-[#202940]">
                    Screenloop
                  </span>
                  <span className="hidden sm:inline-block rounded-md bg-[#202940]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#4b4038] uppercase border border-[#caaa98]/40">
                    CareerBridge
                  </span>
                </div>
                <p className="text-[11px] text-[#4b4038] -mt-0.5 hidden sm:block">
                  Applicant Tracking & AI Evaluation
                </p>
              </div>
            </div>

            {/* Role Badge indicator */}
            <div className="hidden lg:flex items-center gap-2.5">
              {getRoleBadge(currentUser.role)}
              <span className="hidden xl:inline-block font-script text-base text-[#9a8678] select-none -rotate-2">
                Building Better Futures
              </span>
            </div>
          </div>

          {/* Center Hub: Live Breadcrumb Context & Quick Global Search */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-lg mx-6">
            {/* Live Breadcrumb Context Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#182035]/70 border border-[#e2d8cd]/80 dark:border-[#2e3b5e]/80 backdrop-blur-md shadow-2xs text-xs text-[#4b4038] dark:text-[#caaa98] shrink-0">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span className="font-semibold text-[#202940] dark:text-[#fbf9f6] capitalize">
                {activeTab.replace(/-/g, " ")}
              </span>
              <span className="text-[#9a8678]">·</span>
              <span className="text-[11px] text-[#9a8678] truncate font-normal">
                {currentUser.role === "admin"
                  ? "Platform Governance"
                  : currentUser.role === "hr"
                    ? `Talent Acquisition (${isolatedCandidates.length} applicants)`
                    : currentUser.role === "company"
                      ? "Enterprise Workspace"
                      : "Candidate Hub"}
              </span>
            </div>

            {/* Quick Global Search Bar */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex-1 flex items-center justify-between gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#182035]/70 border border-[#e2d8cd]/80 dark:border-[#2e3b5e]/80 backdrop-blur-md text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">Quick search...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground border">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* User Profile Management & Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile App .APK Download button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileModalOpen(true)}
              className="h-8 text-xs gap-1.5 px-2.5 rounded-full border-[#caaa98]/60 text-[#4b4038] dark:text-[#caaa98] hover:bg-primary/5 font-semibold shadow-2xs"
              title="Mobile Application & Android APK"
            >
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Mobile App (.APK)</span>
            </Button>

            {/* Mobile search button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="md:hidden h-8 w-8 p-0 rounded-full border-border/80"
              title="Quick Global Search"
            >
              <Search className="h-3.5 w-3.5 text-primary" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 pl-2 pr-3 py-1 h-9 rounded-full border-border/80 shadow-xs hover:border-primary/40 transition"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-6 w-6 rounded-full border bg-muted object-cover"
                  />
                  <span className="text-xs font-semibold max-w-[100px] truncate hidden md:inline">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground font-mono">
                      {currentUser.email}
                    </p>
                    <div className="pt-1">{getRoleBadge(currentUser.role)}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMobileModalOpen(true)}
                  className="cursor-pointer text-primary focus:text-primary font-semibold"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  <span>Download Mobile APK</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={restorePlatformDefaults}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span>Restore Platform Defaults</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs hidden sm:inline-flex items-center gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Global Search Command Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center gap-2">
              <Command className="h-4 w-4 text-primary" />
              <DialogTitle className="text-sm font-bold">Quick Global Search</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Quickly navigate to any platform section or feature.
            </DialogDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to find sections, features, tools..."
                className="pl-9 h-9 text-xs"
              />
            </div>
          </DialogHeader>

          <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
            {filteredQuickNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-accent/60 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                </button>
              );
            })}

            {filteredQuickNav.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No matching sections found for "{searchQuery}".
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Application & APK Modal */}
      <MobileAppDownloadModal
        open={mobileModalOpen}
        onOpenChange={setMobileModalOpen}
      />
    </>
  );
}
