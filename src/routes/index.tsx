import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminCompanyManagement } from "@/components/admin/AdminCompanyManagement";
import { JobManagement } from "@/components/admin/JobManagement";
import { SecurityDashboardView } from "@/components/admin/SecurityDashboardView";
import { SystemHealthView } from "@/components/admin/SystemHealthView";
import { UserManagement } from "@/components/admin/UserManagement";
import { SignatureLoginPage } from "@/components/auth/SignatureLoginPage";
import { toast } from "sonner";
import { CandidateApplications } from "@/components/candidate/CandidateApplications";
import { CandidateCareerAssistantView } from "@/components/candidate/CandidateCareerAssistantView";
import { CandidateCvView } from "@/components/candidate/CandidateCvView";
import { CandidateDashboardOverview } from "@/components/candidate/CandidateDashboardOverview";
import { CandidatePrivacyCenter } from "@/components/candidate/CandidatePrivacyCenter";
import { InterviewsScheduleView } from "@/components/candidate/InterviewsScheduleView";
import { JobBoard } from "@/components/candidate/JobBoard";
import { SalaryIntelligenceView } from "@/components/candidate/SalaryIntelligenceView";
import { SavedJobsView } from "@/components/candidate/SavedJobsView";
import { CompanyWorkspaceView } from "@/components/company/CompanyWorkspaceView";
import { AiJobDescriptionModal } from "@/components/hr/AiJobDescriptionModal";
import { ApplicantTableView } from "@/components/hr/ApplicantTableView";
import { CompanyNeedsAnalyzerView } from "@/components/hr/CompanyNeedsAnalyzerView";
import { HrAiAssistantView } from "@/components/hr/HrAiAssistantView";
import { HrKanbanBoard } from "@/components/hr/HrKanbanBoard";
import { HrTeamManagement } from "@/components/hr/HrTeamManagement";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { IntegrationsMarketplaceView } from "@/components/shared/IntegrationsMarketplaceView";
import { PluginsMarketplaceView } from "@/components/shared/PluginsMarketplaceView";
import { AtsProvider, useAts } from "@/lib/ats-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Screenloop ATS — Applicant Tracking & AI Evaluation" },
      {
        name: "description",
        content:
          "Screenloop ATS — Applicant Tracking & AI Evaluation platform featuring 4 role-based portals for Candidates, HR Recruiters, Company Workspaces, and Admins across Pakistan.",
      },
      { property: "og:title", content: "Screenloop ATS — Applicant Tracking & AI Evaluation" },
    ],
  }),
  component: () => (
    <AtsProvider>
      <AtsApp />
    </AtsProvider>
  ),
});

function AtsApp() {
  const { currentUser, isAuthenticated, canUserAccessTab, logAuditEvent } = useAts();

  // Active tab state
  const [tab, setTab] = useState<string>("overview");
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize default tab on role changes or user switch
  useEffect(() => {
    if (currentUser.role === "candidate") {
      setTab("overview");
    } else if (currentUser.role === "hr") {
      setTab("kanban");
    } else if (currentUser.role === "company") {
      setTab("company-workspace");
    } else if (currentUser.role === "admin") {
      setTab("analytics");
    }
  }, [currentUser.role, currentUser.id]);

  const handleTabChange = (nextTab: string) => {
    const targetTab =
      nextTab === "default"
        ? currentUser.role === "candidate"
          ? "overview"
          : currentUser.role === "hr"
            ? "kanban"
            : currentUser.role === "company"
              ? "company-workspace"
              : "analytics"
        : nextTab;

    // Strict RBAC Access Check
    if (!canUserAccessTab(currentUser.role, targetTab)) {
      logAuditEvent({
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        action: "UNAUTHORIZED_ACCESS_BLOCKED",
        resource: `/app/${targetTab}`,
        details: `Access restricted: User '${currentUser.username}' (${currentUser.role}) was denied access to view '${targetTab}'`,
        severity: "critical",
        ip: "127.0.0.1",
      });
      toast.error("Access Restricted (RBAC)", {
        description: `Your persona (${currentUser.role.toUpperCase()}) does not possess authorization privileges to view '${targetTab}'. Security incident logged.`,
      });
      return;
    }

    setTab(targetTab);
  };

  // If not mounted on client yet or user is not authenticated, display the Signature Recruitment Login Page
  if (!mounted || !isAuthenticated) {
    return <SignatureLoginPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Global Top Navbar */}
      <Navbar activeTab={tab} onTabChange={handleTabChange} />

      {/* Main Workspace Layout with Vertical Portrait AppSidebar */}
      <div className="flex-1 flex w-full">
        <AppSidebar activeTab={tab} onTabChange={handleTabChange} />

        {/* Dynamic Main Content Surface */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
          {/* ========================================================= */}
          {/* 1. CANDIDATE PORTAL VIEWS */}
          {/* ========================================================= */}
          {currentUser.role === "candidate" && (
            <div className="space-y-6">
              {tab === "overview" && <CandidateDashboardOverview onNavigateTab={handleTabChange} />}
              {tab === "jobs" && <JobBoard />}
              {tab === "my-cv" && <CandidateCvView />}
              {tab === "applications" && <CandidateApplications />}
              {tab === "saved-jobs" && <SavedJobsView />}
              {tab === "interviews" && <InterviewsScheduleView />}
              {tab === "salary-guide" && <SalaryIntelligenceView />}
              {tab === "career-assistant" && <CandidateCareerAssistantView />}
              {tab === "plugins" && <PluginsMarketplaceView />}
              {tab === "privacy-center" && <CandidatePrivacyCenter />}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. HR & RECRUITER ATS PORTAL VIEWS */}
          {/* ========================================================= */}
          {currentUser.role === "hr" && (
            <div className="space-y-6">
              {tab === "kanban" && <HrKanbanBoard />}
              {tab === "applicants" && <ApplicantTableView />}
              {tab === "jobs" && <JobBoard />}
              {tab === "interviews" && <InterviewsScheduleView />}
              {tab === "company-needs" && <CompanyNeedsAnalyzerView />}
              {tab === "hr-assistant" && <HrAiAssistantView />}
              {tab === "hr-team" && <HrTeamManagement />}
              {tab === "plugins" && <PluginsMarketplaceView />}
              {tab === "integrations" && <IntegrationsMarketplaceView />}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. COMPANY WORKSPACE VIEWS */}
          {/* ========================================================= */}
          {currentUser.role === "company" && (
            <div className="space-y-6">
              {tab === "company-workspace" && (
                <CompanyWorkspaceView
                  onNavigateToTab={handleTabChange}
                  onOpenCreateJob={() => setCreateJobModalOpen(true)}
                />
              )}
              {tab === "jobs" && <JobBoard />}
              {tab === "kanban" && <HrKanbanBoard />}
              {tab === "applicants" && <ApplicantTableView />}
              {tab === "interviews" && <InterviewsScheduleView />}
              {tab === "hr-team" && <HrTeamManagement />}
              {tab === "company-needs" && <CompanyNeedsAnalyzerView />}
              {tab === "integrations" && <IntegrationsMarketplaceView />}
              {tab === "plugins" && <PluginsMarketplaceView />}
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. SYSTEM ADMIN VIEWS */}
          {/* ========================================================= */}
          {currentUser.role === "admin" && (
            <div className="space-y-6">
              {tab === "analytics" && <AdminAnalytics />}
              {tab === "companies" && <AdminCompanyManagement />}
              {tab === "users" && <UserManagement />}
              {tab === "job-manager" && <JobManagement />}
              {(tab === "security" || tab === "audit-logs") && <SecurityDashboardView />}
              {tab === "system-health" && <SystemHealthView />}
              {tab === "plugins" && <PluginsMarketplaceView />}
              {tab === "integrations" && <IntegrationsMarketplaceView />}
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AiJobDescriptionModal open={createJobModalOpen} onOpenChange={setCreateJobModalOpen} />

      {/* Screenloop ATS Footer */}
      <footer className="border-t bg-muted/20 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Screenloop ATS</span>
            <span>— Applicant Tracking & AI Evaluation</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Deterministic AI Scoring</span>
            <span>·</span>
            <span>Multi-Tenant Company Isolation</span>
            <span>·</span>
            <span>Pakistani Market Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
