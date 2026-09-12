import { useState } from "react";
import {
  Activity,
  BarChart3,
  BookmarkCheck,
  Boxes,
  Brain,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileCheck,
  FileText,
  Layers,
  LayoutDashboard,
  Link2,
  Lock,
  LogOut,
  Menu,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CareerBridgeLogo } from "@/components/shared/CareerBridgeBranding";
import { useAts, type UserRole } from "@/lib/ats-store";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string | undefined;
  badgeTone?: string | undefined;
}

export function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  const {
    currentUser,
    logout,
    candidateApplications,
    savedJobs,
    isolatedJobs,
    isolatedCandidates,
    isolatedInterviews,
    companies,
    users,
    auditLogs,
  } = useAts();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Define navigation items per role
  const getNavItems = (role: UserRole): { group: string; items: NavItem[] }[] => {
    switch (role) {
      case "candidate":
        return [
          {
            group: "Candidate Portal",
            items: [
              { id: "overview", label: "Dashboard", icon: LayoutDashboard },
              { id: "jobs", label: "Find Jobs", icon: Briefcase, badge: isolatedJobs.length },
              { id: "my-cv", label: "My CV Document", icon: FileText },
              {
                id: "applications",
                label: "My Applications",
                icon: Layers,
                badge: candidateApplications.length,
                badgeTone: "bg-primary text-primary-foreground",
              },
              {
                id: "saved-jobs",
                label: "Saved Roles",
                icon: BookmarkCheck,
                badge: savedJobs.length,
              },
              {
                id: "interviews",
                label: "Interviews",
                icon: Calendar,
                badge: isolatedInterviews.length > 0 ? isolatedInterviews.length : undefined,
              },
            ],
          },
          {
            group: "Career & AI Tools",
            items: [
              { id: "salary-guide", label: "PKR Salary Guide", icon: Coins },
              { id: "career-assistant", label: "Career AI Coach", icon: Brain },
              { id: "plugins", label: "AI Plugins", icon: Boxes },
              { id: "privacy-center", label: "Privacy Center", icon: Lock },
            ],
          },
        ];

      case "hr":
        return [
          {
            group: "Recruiter ATS",
            items: [
              {
                id: "kanban",
                label: "Hiring Pipeline",
                icon: Layers,
                badge: isolatedCandidates.length,
                badgeTone: "bg-primary text-primary-foreground",
              },
              {
                id: "applicants",
                label: "Applicant Table",
                icon: Users,
                badge: isolatedCandidates.length,
              },
              { id: "jobs", label: "Company Jobs", icon: Briefcase, badge: isolatedJobs.length },
              {
                id: "interviews",
                label: "Interviews",
                icon: Calendar,
                badge: isolatedInterviews.length,
              },
            ],
          },
          {
            group: "Intelligence & Team",
            items: [
              { id: "company-needs", label: "Talent Radar", icon: BarChart3 },
              { id: "hr-assistant", label: "Recruiter AI Copilot", icon: Brain },
              { id: "hr-team", label: "HR Team Members", icon: UserCheck },
              { id: "plugins", label: "ATS Plugins", icon: Boxes },
              { id: "integrations", label: "Integrations & APIs", icon: Link2 },
            ],
          },
        ];

      case "company":
        return [
          {
            group: "Company Workspace",
            items: [
              { id: "company-workspace", label: "Company Overview", icon: Building2 },
              { id: "jobs", label: "Requisitions", icon: Briefcase, badge: isolatedJobs.length },
              {
                id: "kanban",
                label: "Pipeline Workflow",
                icon: Layers,
                badge: isolatedCandidates.length,
              },
              { id: "applicants", label: "Applicants", icon: Users },
              { id: "interviews", label: "Interviews", icon: Calendar },
            ],
          },
          {
            group: "Administration & Talent",
            items: [
              { id: "hr-team", label: "Recruitment Team", icon: UserCheck },
              { id: "company-needs", label: "Hiring Intelligence", icon: BarChart3 },
              { id: "integrations", label: "Integrations", icon: Link2 },
              { id: "plugins", label: "AI Plugins", icon: Boxes },
            ],
          },
        ];

      case "admin":
        return [
          {
            group: "Platform Administration",
            items: [
              { id: "analytics", label: "Platform KPIs", icon: Sparkles },
              {
                id: "companies",
                label: "Pakistani Employers",
                icon: Building2,
                badge: companies.length,
              },
              { id: "users", label: "User Accounts & RBAC", icon: Users, badge: users.length },
              {
                id: "job-manager",
                label: "Manage All Jobs",
                icon: Briefcase,
                badge: isolatedJobs.length,
              },
            ],
          },
          {
            group: "Security & Governance",
            items: [
              { id: "security", label: "Security Dashboard", icon: ShieldAlert },
              { id: "system-health", label: "System Health", icon: Activity },
              {
                id: "audit-logs",
                label: "Audit & Access Logs",
                icon: Shield,
                badge: auditLogs.length,
              },
              { id: "plugins", label: "Plugin Governance", icon: Boxes },
              { id: "integrations", label: "API Integrations", icon: Link2 },
            ],
          },
        ];
    }
  };

  const navGroups = getNavItems(currentUser.role);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "candidate":
        return "Candidate";
      case "hr":
        return "HR Recruiter";
      case "company":
        return "Company Admin";
      case "admin":
        return "Super Admin";
    }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-card border-r">
      {/* Brand Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              onTabChange("default");
              if (isMobile) setMobileOpen(false);
            }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#202940] to-[#4b4038] text-[#caaa98] border border-[#caaa98]/40 shadow-md shadow-[#202940]/20 p-1.5">
              <CareerBridgeLogo className="h-full w-full text-[#caaa98]" />
            </div>
            {(!collapsed || isMobile) && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-base font-bold tracking-tight text-foreground">
                    Screenloop
                  </span>
                  <span className="rounded bg-[#202940]/10 px-1 py-0.2 font-mono text-[9px] font-bold text-[#4b4038] uppercase border border-[#caaa98]/40">
                    CareerBridge
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1">
                  Applicant Tracking & AI Evaluation
                </p>
              </div>
            )}
          </div>

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hidden lg:flex"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Company context snippet if HR or Company */}
        {(!collapsed || isMobile) && currentUser.company && (
          <div className="mt-3 rounded-lg border bg-muted/40 p-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground truncate">{currentUser.company}</span>
            </div>
            {currentUser.companyRole && (
              <p className="text-[10px] text-muted-foreground mt-0.5 pl-5">
                Role: {currentUser.companyRole}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {(!collapsed || isMobile) && (
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (isMobile) setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                  </div>

                  {(!collapsed || isMobile) && item.badge !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold font-mono ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : item.badgeTone || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Profile & Switcher Footer */}
      <div className="p-3 border-t bg-muted/20 space-y-2">
        {(!collapsed || isMobile) && (
          <div className="rounded-xl border border-[#caaa98]/30 bg-gradient-to-tr from-[#202940] to-[#3a3028] p-2.5 text-white shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-script text-xs text-[#caaa98]">Building Better Futures</span>
              <CareerBridgeLogo className="h-3.5 w-3.5 text-[#caaa98]" />
            </div>
            <p className="text-[9.5px] text-white/70 mt-0.5 leading-tight">
              Better Talent | Stronger Companies
            </p>
          </div>
        )}

        <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-card border shadow-2xs">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-8 w-8 rounded-full border bg-muted object-cover shrink-0"
          />
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{currentUser.name}</p>
              <p className="text-[10px] text-muted-foreground truncate font-mono">
                @{currentUser.username} · {getRoleLabel(currentUser.role)}
              </p>
            </div>
          )}
        </div>

        {(!collapsed || isMobile) && (
          <div className="space-y-1.5 pt-1">
            {currentUser.role === "candidate" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange("privacy-center")}
                className="w-full h-7 text-[11px] gap-1 px-2 text-muted-foreground hover:text-foreground justify-center"
              >
                <Lock className="h-3 w-3 text-emerald-600" /> Privacy & Compliance Center
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full h-7 text-[11px] gap-1.5 px-2 border-border/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition font-medium"
            >
              <LogOut className="h-3 w-3" /> Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-screen z-30 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Trigger (used in main layout) */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
