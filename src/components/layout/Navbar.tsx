import { useState } from "react";
import {
  BarChart3,
  BookmarkCheck,
  Briefcase,
  Building2,
  ChevronDown,
  Coins,
  Kanban,
  Layers,
  LayoutDashboard,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
  LogOut,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CareerBridgeLogo } from "@/components/shared/CareerBridgeBranding";
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
    candidateApplications,
    isolatedCandidates,
    savedJobs,
  } = useAts();

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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#e2d8cd] bg-[#fbf9f6] shadow-xs">
        {/* Top Verified Super Admin Security & RBAC Enforcement Banner (Admin only) */}
        {currentUser.role === "admin" && (
          <div className="bg-[#f3ede4] border-b border-[#e2d8cd] px-4 py-1.5 text-xs text-[#4b4038] flex flex-wrap items-center justify-between gap-2">
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
              <span className="text-[11px] text-[#4b4038] font-medium hidden md:inline">
                🛡️ Platform Governance & RBAC Active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-6 text-[11px] px-2 text-rose-700 hover:text-rose-800 hover:bg-rose-500/10 font-semibold gap-1"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign Out</span>
              </Button>
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

            {/* Role Badge indicator & Building Better Futures watermark */}
            <div className="hidden lg:flex items-center gap-3">
              {getRoleBadge(currentUser.role)}
              <span className="hidden xl:inline-block font-script text-base text-[#9a8678] select-none -rotate-2">
                Building Better Futures
              </span>
            </div>
          </div>

          {/* Role-specific Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {currentUser.role === "candidate" && (
              <>
                <Button
                  variant={activeTab === "overview" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("overview")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "jobs" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("jobs")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <Briefcase className="mr-1.5 h-4 w-4" />
                  Find Jobs
                </Button>
                <Button
                  variant={activeTab === "applications" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("applications")}
                  className="text-xs sm:text-sm font-medium relative"
                >
                  <Layers className="mr-1.5 h-4 w-4" />
                  My Applications
                  {candidateApplications.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.2 text-[10px] text-primary-foreground font-semibold">
                      {candidateApplications.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant={activeTab === "saved-jobs" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("saved-jobs")}
                  className="text-xs sm:text-sm font-medium relative"
                >
                  <BookmarkCheck className="mr-1.5 h-4 w-4 text-amber-500" />
                  Saved
                  {savedJobs.length > 0 && (
                    <span className="ml-1 rounded-full bg-muted-foreground/20 px-1.5 py-0.2 text-[10px] font-semibold">
                      {savedJobs.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant={activeTab === "salary-guide" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("salary-guide")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <Coins className="mr-1.5 h-4 w-4 text-emerald-600" />
                  PKR Salary Guide
                </Button>
              </>
            )}

            {currentUser.role === "hr" && (
              <>
                <Button
                  variant={activeTab === "kanban" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("kanban")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <Kanban className="mr-1.5 h-4 w-4" />
                  Kanban Pipeline
                </Button>
                <Button
                  variant={activeTab === "applicants" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("applicants")}
                  className="text-xs sm:text-sm font-medium relative"
                >
                  <Users className="mr-1.5 h-4 w-4" />
                  Applicant Table
                  <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.2 text-[10px] font-semibold">
                    {isolatedCandidates.length}
                  </span>
                </Button>
                <Button
                  variant={activeTab === "company-needs" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("company-needs")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <BarChart3 className="mr-1.5 h-4 w-4 text-primary" />
                  Talent Intelligence
                </Button>
              </>
            )}

            {currentUser.role === "admin" && (
              <>
                <Button
                  variant={activeTab === "analytics" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("analytics")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Platform KPIs
                </Button>
                <Button
                  variant={activeTab === "companies" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("companies")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <Building2 className="mr-1.5 h-4 w-4 text-primary" />
                  Pakistani Employers
                </Button>
                <Button
                  variant={activeTab === "users" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("users")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <Users className="mr-1.5 h-4 w-4" />
                  Users & RBAC
                </Button>
                <Button
                  variant={activeTab === "job-manager" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange("job-manager")}
                  className="text-xs sm:text-sm font-medium"
                >
                  <Briefcase className="mr-1.5 h-4 w-4" />
                  Manage Jobs
                </Button>
              </>
            )}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 pl-2 pr-3 py-1 h-9 rounded-full border-border/80 shadow-xs"
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
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
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
    </>
  );
}
