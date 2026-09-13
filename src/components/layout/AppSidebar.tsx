import { useState } from "react";
import {
  Activity,
  BarChart3,
  BookmarkCheck,
  Boxes,
  Brain,
  Briefcase,
  GraduationCap,
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
  Smartphone,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CareerBridgeLogo } from "@/components/shared/CareerBridgeBranding";
import { MobileAppDownloadModal } from "@/components/shared/MobileAppDownloadModal";
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
  const [apkModalOpen, setApkModalOpen] = useState(false);

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
              {
                id: "security",
                label: "Security & Audit Trail",
                icon: ShieldAlert,
                badge: auditLogs.length,
              },
              { id: "system-health", label: "System Health", icon: Activity },
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

  // Contextual Role Hub Indicator (eliminates duplication with top Navbar)
  const getHubInfo = (role: UserRole) => {
    switch (role) {
      case "candidate":
        return {
          title: "Candidate Hub",
          subtitle: "Career & AI Workspaces",
          icon: GraduationCap,
          tone: "from-[#202940] to-[#4b4038] text-[#caaa98]",
        };
      case "hr":
        return {
          title: "Recruiter Suite",
          subtitle: currentUser.company ? `${currentUser.company} ATS` : "Talent Acquisition",
          icon: Users,
          tone: "from-[#202940] to-[#3a3028] text-[#caaa98]",
        };
      case "company":
        return {
          title: "Enterprise Portal",
          subtitle: currentUser.company ? `${currentUser.company} Workspace` : "Corporate Operations",
          icon: Building2,
          tone: "from-[#182035] to-[#202940] text-[#caaa98]",
        };
      case "admin":
        return {
          title: "Admin Console",
          subtitle: "Platform Governance & RBAC",
          icon: ShieldAlert,
          tone: "from-[#202940] to-[#182035] text-[#caaa98]",
        };
    }
  };

  const hubInfo = getHubInfo(currentUser.role);
  const HubIcon = hubInfo.icon;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-white/80 dark:bg-[#1a233a]/80 backdrop-blur-xl border-r border-[#e2d8cd]/70 dark:border-[#2d3854]/80 shadow-lg shadow-black/5 selection:bg-primary/20">
      {/* Workspace Hub Indicator (Non-duplicate role context) */}
      <div className="p-3.5 border-b border-[#e2d8cd]/60 dark:border-[#2d3854]/70 bg-white/40 dark:bg-black/10 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
            onClick={() => {
              onTabChange("default");
              if (isMobile) setMobileOpen(false);
            }}
            title={hubInfo.title}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${hubInfo.tone} border border-[#caaa98]/40 shadow-sm p-2`}>
              <HubIcon className="h-full w-full text-[#caaa98]" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-sm font-bold tracking-tight text-[#202940] dark:text-white truncate">
                    {hubInfo.title}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] text-[#4b4038] dark:text-[#caaa98] font-medium truncate">
                  {hubInfo.subtitle}
                </p>
              </div>
            )}
          </div>

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hidden lg:flex shrink-0"
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
              className="h-8 w-8 text-muted-foreground shrink-0"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Scoped Company badge if employer */}
        {(!collapsed || isMobile) && currentUser.company && (
          <div className="mt-2.5 rounded-lg border border-[#e2d8cd]/60 dark:border-[#2d3854]/60 bg-white/60 dark:bg-card/60 p-2 text-xs backdrop-blur-xs">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-bold text-[#202940] dark:text-white truncate">{currentUser.company}</span>
            </div>
            {currentUser.companyRole && (
              <p className="text-[10px] text-[#4b4038] dark:text-[#caaa98] mt-0.5 pl-5 font-mono">
                {currentUser.companyRole}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Links with High Contrast & Glass Accents */}
      <div className="flex-1 px-2.5 py-4 space-y-5">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {(!collapsed || isMobile) && (
              <p className="px-2 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-[#4b4038] dark:text-[#caaa98] font-mono">
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
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
                      : "text-[#342e29] dark:text-[#f3ede4] hover:bg-white/60 dark:hover:bg-white/10 hover:text-foreground font-semibold"
                  }`}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? "text-primary-foreground"
                          : "text-[#4b4038] dark:text-[#caaa98] group-hover:text-foreground"
                      }`}
                    />
                    {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                  </div>

                  {(!collapsed || isMobile) && item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                        isActive
                          ? "bg-primary-foreground/25 text-primary-foreground"
                          : item.badgeTone || "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/20"
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

      {/* User Profile Footer & Sign Out */}
      <div className="p-3 border-t border-[#e2d8cd]/60 dark:border-[#2d3854]/70 bg-white/40 dark:bg-black/10 backdrop-blur-md space-y-2">
        <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-white/70 dark:bg-card/70 border border-[#e2d8cd]/60 dark:border-[#2d3854]/60 shadow-2xs backdrop-blur-xs">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-8 w-8 rounded-full border border-[#caaa98]/40 bg-muted object-cover shrink-0"
          />
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#202940] dark:text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[#4b4038] dark:text-[#caaa98] truncate font-mono">
                @{currentUser.username} · {getRoleLabel(currentUser.role)}
              </p>
            </div>
          )}
        </div>

        {(!collapsed || isMobile) && (
          <div className="space-y-1.5 pt-0.5">
            {currentUser.role === "candidate" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange("privacy-center")}
                className="w-full h-7 text-[11px] gap-1 px-2 text-[#4b4038] dark:text-[#caaa98] hover:text-foreground hover:bg-white/40 justify-center font-medium"
              >
                <Lock className="h-3 w-3 text-emerald-600" /> Privacy & Compliance
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApkModalOpen(true)}
              className="w-full h-7 text-[11px] gap-1.5 px-2 border-[#caaa98]/40 bg-white/50 dark:bg-card/50 text-[#4b4038] dark:text-[#caaa98] hover:bg-primary/10 transition font-bold"
            >
              <Smartphone className="h-3 w-3 text-primary" /> Mobile App (.APK)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full h-7 text-[11px] gap-1.5 px-2 border-[#e2d8cd] dark:border-[#2d3854] text-[#4b4038] dark:text-[#caaa98] hover:text-destructive hover:bg-destructive/10 transition font-bold"
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

      <MobileAppDownloadModal
        open={apkModalOpen}
        onOpenChange={setApkModalOpen}
      />
    </>
  );
}
