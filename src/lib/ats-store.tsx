/**
 * Screenloop ATS — Applicant Tracking & AI Evaluation
 * Global ATS Store with Role-Based Access Control, Pakistani Market Datasets,
 * Multi-Tenant Company Isolation, Verified Job Openings with Deadlines,
 * 15+ Pakistani Companies, Security Audit Logging, AI Plugins, and Integrations.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  autoStage,
  isJobExpired,
  screenCandidate,
  type Candidate,
  type Company,
  type InterviewSchedule,
  type Job,
  type Stage,
} from "./ats-engine";

export type UserRole = "candidate" | "hr" | "company" | "admin";

export interface UserAccount {
  id: string;
  username: string; // e.g. ali.khan
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  city: string;
  company?: string | undefined;
  companyId?: string | undefined;
  companyRole?: "HR Admin" | "Recruiter" | "Hiring Manager" | undefined;
  assignedDepartments?: string[] | undefined;
  permissions?: string[] | undefined;
  phone?: string | undefined;
  bio?: string | undefined;
  currentSalaryPKR?: number | undefined;
  expectedSalaryPKR?: number | undefined;
  savedJobIds: string[];
  active: boolean;
  password?: string | undefined;
}

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "FAILED_LOGIN"
  | "BRUTE_FORCE_LOCKOUT"
  | "UNAUTHORIZED_ACCESS_BLOCKED"
  | "PASSWORD_CHANGE"
  | "PROFILE_UPDATE"
  | "CV_UPLOAD"
  | "CV_DELETE"
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_WITHDRAWN"
  | "STAGE_CHANGE"
  | "JOB_CREATED"
  | "JOB_UPDATED"
  | "JOB_CLOSED"
  | "CANDIDATE_SHORTLISTED"
  | "CANDIDATE_REJECTED"
  | "INTERVIEW_SCHEDULED"
  | "COMPANY_REGISTERED"
  | "COMPANY_VERIFIED"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "PLUGIN_TOGGLED"
  | "INTEGRATION_CONFIGURED"
  | "JOB_ALERT_DISPATCHED"
  | "GOOGLE_MEET_STARTED"
  | "ADMIN_ACTION";

export interface AuditLogItem {
  id: string;
  timestamp: number;
  userId: string;
  username: string;
  role: UserRole;
  action: AuditAction;
  resource: string;
  details: string;
  severity: "info" | "warning" | "critical";
  ip: string;
}

export type PluginPermission =
  | "READ_PROFILE"
  | "READ_CV"
  | "READ_APPLICATIONS"
  | "READ_COMPANY_DATA"
  | "READ_ANALYTICS"
  | "WRITE_ANALYSIS"
  | "WRITE_JOB"
  | "WRITE_APPLICATION_STATUS";

export interface AtsPlugin {
  id: string;
  name: string;
  description: string;
  targetRole: UserRole;
  category: string;
  author: string;
  version: string;
  enabled: boolean;
  permissions: PluginPermission[];
  icon: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: "Email" | "SMS" | "Messaging" | "Calendar & Video" | "Storage" | "Webhooks";
  description: string;
  status: "Connected" | "Not Connected" | "Needs Setup";
  icon: string;
  targetRole: "hr" | "admin" | "all";
  lastSync?: number | undefined;
  configFields: { key: string; label: string; value: string; isSecret: boolean }[];
}

export interface CandidatePrivacySettings {
  profileVisibility: "public" | "verified_only" | "confidential";
  allowAiProcessing: boolean;
  jobAlerts: boolean;
  dataRetentionDays: number;
}

const DEFAULT_RBAC_KEY = "Pakistan123";

// ============================================================================
// 1. PAKISTANI ENTERPRISE USER ACCOUNTS
// ============================================================================
export const SEED_USERS: UserAccount[] = [
  // CANDIDATES
  {
    id: "u_cand_1",
    username: "ali.khan",
    name: "Ali Khan",
    email: "ali.khan@screenloop.pk",
    role: "candidate",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Senior Full Stack Engineer",
    city: "Karachi",
    phone: "+92 300 1234567",
    bio: "Full-stack developer with 6+ years building scalable SaaS applications using React, TypeScript, Node.js, and PostgreSQL.",
    currentSalaryPKR: 260000,
    expectedSalaryPKR: 350000,
    savedJobIds: ["job_sys_fullstack", "job_10p_react"],
    active: true,
  },
  {
    id: "u_cand_2",
    username: "hamza.ahmed",
    name: "Hamza Ahmed",
    email: "hamza.ahmed@screenloop.pk",
    role: "candidate",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    title: "Frontend Developer",
    city: "Lahore",
    phone: "+92 321 7654321",
    bio: "Passionate UI engineer with 4 years hands-on experience in React, Next.js, and Tailwind CSS. Alumnus of FAST-NUCES Lahore.",
    currentSalaryPKR: 160000,
    expectedSalaryPKR: 220000,
    savedJobIds: ["job_arbi_frontend", "job_10p_react"],
    active: true,
  },
  {
    id: "u_cand_3",
    username: "usman.raza",
    name: "Usman Raza",
    email: "usman.raza@screenloop.pk",
    role: "candidate",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    title: "Backend Engineer (Python / Go)",
    city: "Islamabad",
    phone: "+92 333 4567890",
    bio: "Specialized in microservices architecture, FastAPI, Django, Docker, and PostgreSQL. NUST graduate.",
    currentSalaryPKR: 210000,
    expectedSalaryPKR: 280000,
    savedJobIds: ["job_netsol_backend"],
    active: true,
  },
  {
    id: "u_cand_4",
    username: "ayman.fatima",
    name: "Ayman Fatima",
    email: "ayman.fatima@screenloop.pk",
    role: "candidate",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Lead UI/UX Product Designer",
    city: "Lahore",
    phone: "+92 301 9876543",
    bio: "Product designer with 6 years experience crafting design systems, mobile apps, and enterprise web applications in Figma.",
    currentSalaryPKR: 240000,
    expectedSalaryPKR: 320000,
    savedJobIds: ["job_vdive_uiux"],
    active: true,
  },
  {
    id: "u_cand_5",
    username: "hira.khalid",
    name: "Hira Khalid",
    email: "hira.khalid@screenloop.pk",
    role: "candidate",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    title: "QA Automation Engineer",
    city: "Karachi",
    phone: "+92 345 1122334",
    bio: "Software quality assurance engineer with expertise in Cypress, Selenium, Postman, and automated regression testing.",
    currentSalaryPKR: 140000,
    expectedSalaryPKR: 190000,
    savedJobIds: ["job_folio3_qa"],
    active: true,
  },
  {
    id: "u_cand_6",
    username: "saad.ali",
    name: "Saad Ali",
    email: "saad.ali@screenloop.pk",
    role: "candidate",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    title: "Cloud & DevOps SRE",
    city: "Rawalpindi",
    phone: "+92 312 9988776",
    bio: "Managing AWS, Kubernetes, Terraform, and CI/CD pipelines. Strong focus on infrastructure as code and zero-downtime deployments.",
    currentSalaryPKR: 310000,
    expectedSalaryPKR: 420000,
    savedJobIds: ["job_contour_devops"],
    active: true,
  },
  {
    id: "u_cand_7",
    username: "mahnoor.ahmed",
    name: "Mahnoor Ahmed",
    email: "mahnoor.ahmed@screenloop.pk",
    role: "candidate",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    title: "Data Analyst & BI Specialist",
    city: "Faisalabad",
    phone: "+92 305 6677889",
    bio: "Transforming raw business telemetry into actionable intelligence using Python, PowerBI, SQL, and predictive analytics.",
    currentSalaryPKR: 150000,
    expectedSalaryPKR: 200000,
    savedJobIds: ["job_daraz_data"],
    active: true,
  },
  {
    id: "u_cand_8",
    username: "bilal.sheikh",
    name: "Bilal Sheikh",
    email: "bilal.sheikh@screenloop.pk",
    role: "candidate",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    title: "Mobile Developer (Flutter / Android)",
    city: "Peshawar",
    phone: "+92 334 5544332",
    bio: "Building cross-platform consumer apps using Flutter, Dart, and Firebase with 4+ years on Google Play & App Store.",
    currentSalaryPKR: 175000,
    expectedSalaryPKR: 240000,
    savedJobIds: ["job_confiz_flutter"],
    active: true,
  },

  // RECRUITERS & COMPANY HR (Linked to Companies)
  {
    id: "u_rec_1",
    username: "tariq.recruiter",
    name: "Tariq Mehmood",
    email: "tariq@systemsltd.com",
    role: "hr",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    title: "Talent Acquisition Lead",
    company: "Systems Limited",
    companyId: "comp_systems",
    companyRole: "HR Admin",
    assignedDepartments: ["Engineering", "Infrastructure", "Human Resources"],
    permissions: ["Manage Jobs", "View Applicants", "Shortlist Candidates", "Schedule Interviews", "View Reports"],
    city: "Lahore",
    phone: "+92 42 111 797 836",
    bio: "Leading enterprise engineering talent acquisition across Lahore, Karachi, and Islamabad offices.",
    savedJobIds: [],
    active: true,
  },
  {
    id: "u_rec_2",
    username: "sana.hr",
    name: "Sana Malik",
    email: "sana.malik@10pearls.com",
    role: "hr",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    title: "Senior Technical Recruiter",
    company: "10Pearls",
    companyId: "comp_10pearls",
    companyRole: "HR Admin",
    assignedDepartments: ["Engineering", "Design", "Marketing"],
    permissions: ["Manage Jobs", "View Applicants", "Shortlist Candidates", "Schedule Interviews"],
    city: "Karachi",
    phone: "+92 21 34328844",
    bio: "Hiring React, AI, and cloud engineers for global client engagements at 10Pearls.",
    savedJobIds: [],
    active: true,
  },
  {
    id: "u_rec_3",
    username: "kashif.talent",
    name: "Kashif Nawaz",
    email: "kashif.nawaz@netsol.com",
    role: "hr",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    title: "HR Business Partner",
    company: "NetSol Technologies",
    companyId: "comp_netsol",
    companyRole: "HR Admin",
    assignedDepartments: ["Engineering", "Finance"],
    permissions: ["Manage Jobs", "View Applicants", "Shortlist Candidates", "Schedule Interviews"],
    city: "Lahore",
    phone: "+92 42 111 638 765",
    bio: "Managing technical recruitment for enterprise asset finance software products.",
    savedJobIds: [],
    active: true,
  },
  {
    id: "u_rec_4",
    username: "maryam.people",
    name: "Maryam Siddiqui",
    email: "maryam@arbisoft.com",
    role: "hr",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    title: "People & Culture Specialist",
    company: "Arbisoft",
    companyId: "comp_arbisoft",
    companyRole: "Recruiter",
    assignedDepartments: ["Engineering", "Marketing"],
    permissions: ["View Applicants", "Shortlist Candidates", "Schedule Interviews"],
    city: "Lahore",
    phone: "+92 42 35940001",
    bio: "Cultivating engineering excellence and hiring top graduates across Pakistan.",
    savedJobIds: [],
    active: true,
  },
  {
    id: "u_rec_5",
    username: "omer.hiring",
    name: "Omer Farooq",
    email: "omer.farooq@jazz.com.pk",
    role: "hr",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    title: "Digital Talent Lead",
    company: "Jazz (VEON Microfinance & Telco)",
    companyId: "comp_jazz",
    companyRole: "Hiring Manager",
    assignedDepartments: ["AI & Data", "Infrastructure"],
    permissions: ["View Applicants", "Shortlist Candidates", "Schedule Interviews"],
    city: "Islamabad",
    phone: "+92 51 111 300 300",
    bio: "Hiring for fintech (JazzCash), digital platforms, and cloud infrastructure.",
    savedJobIds: [],
    active: true,
  },

  // COMPANY WORKSPACE ADMINS
  {
    id: "u_comp_1",
    username: "systems.admin",
    name: "Systems Limited Workspace",
    email: "enterprise@systemsltd.com",
    role: "company",
    avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80",
    title: "Enterprise Workspace Admin",
    company: "Systems Limited",
    companyId: "comp_systems",
    companyRole: "HR Admin",
    assignedDepartments: ["All Departments"],
    permissions: ["Manage Jobs", "View Applicants", "Shortlist Candidates", "Schedule Interviews", "View Reports", "Manage Company Profile", "Manage Team"],
    city: "Lahore",
    phone: "+92 42 111 797 836",
    bio: "Managing Systems Limited organizational hiring workspace, recruiter permissions, and talent operations.",
    savedJobIds: [],
    active: true,
  },
  {
    id: "u_comp_2",
    username: "pearls.admin",
    name: "10Pearls Workspace",
    email: "enterprise@10pearls.com",
    role: "company",
    avatar: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=80",
    title: "Enterprise Workspace Admin",
    company: "10Pearls",
    companyId: "comp_10pearls",
    companyRole: "HR Admin",
    assignedDepartments: ["All Departments"],
    permissions: ["Manage Jobs", "View Applicants", "Shortlist Candidates", "Schedule Interviews", "View Reports", "Manage Company Profile", "Manage Team"],
    city: "Karachi",
    phone: "+92 21 34328844",
    bio: "Managing 10Pearls organizational hiring workspace and digital innovation requisitions.",
    savedJobIds: [],
    active: true,
  },

  // SYSTEM ADMIN
  {
    id: "u_admin_1",
    username: "admin",
    name: "Asad Malik",
    email: "admin@screenloop.pk",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Chief Administrator & Platform Architect",
    city: "Islamabad",
    phone: "+92 51 8899000",
    bio: "Overseeing platform compliance, Pakistani company verifications, and recruitment intelligence systems.",
    savedJobIds: [],
    active: true,
  },
];

// ============================================================================
// 2. PAKISTANI COMPANIES DATASET (15 Top Organizations with LinkedIn & Benefits)
// ============================================================================
export const SEED_COMPANIES: Company[] = [
  {
    id: "comp_systems",
    name: "Systems Limited",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80",
    industry: "Information Technology & Enterprise Services",
    city: "Lahore",
    website: "https://systemsltd.com",
    linkedinUrl: "https://www.linkedin.com/company/systems-limited",
    size: "5,000+ Employees",
    verified: true,
    status: "approved",
    description: "Pakistan's premier global technology company, delivering enterprise consulting, software development, and digital transformation services.",
    benefits: ["Provident Fund & Gratuity", "Comprehensive Health Cover", "Annual Performance Bonus", "Certification Sponsorship", "Hybrid Work Model"]
  },
  {
    id: "comp_10pearls",
    name: "10Pearls",
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=80",
    industry: "Digital Product Innovation & AI",
    city: "Karachi",
    website: "https://10pearls.com",
    linkedinUrl: "https://www.linkedin.com/company/10pearls",
    size: "1,500+ Employees",
    verified: true,
    status: "approved",
    description: "Award-winning digital technology partner creating transformative mobile, web, and enterprise AI solutions.",
    benefits: ["Flexible Working Hours", "Medical & Life Insurance", "Sports & Gym Facilities", "Global Mobility Programs"]
  },
  {
    id: "comp_netsol",
    name: "NetSol Technologies",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80",
    industry: "Financial Technology Software",
    city: "Lahore",
    website: "https://netsoltech.com",
    linkedinUrl: "https://www.linkedin.com/company/netsol-technologies-inc-",
    size: "2,000+ Employees",
    verified: true,
    status: "approved",
    description: "Global pioneer in asset finance and leasing software solutions, listed on NASDAQ and PSX.",
    benefits: ["Company Maintained Car for Leads", "Fuel Allowance", "Health Insurance for Family", "Provident Fund"]
  },
  {
    id: "comp_arbisoft",
    name: "Arbisoft",
    logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&auto=format&fit=crop&q=80",
    industry: "Custom Software & EdTech",
    city: "Lahore",
    website: "https://arbisoft.com",
    linkedinUrl: "https://www.linkedin.com/company/arbisoft",
    size: "1,000+ Employees",
    verified: true,
    status: "approved",
    description: "Building world-class software for leading international enterprises, startups, and open-source platforms.",
    benefits: ["Subsidized Annual Company Trips", "Free Catered Meals & Snacks", "Stock Options", "Education Grants"]
  },
  {
    id: "comp_contour",
    name: "Contour Software",
    logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&auto=format&fit=crop&q=80",
    industry: "Constellation Software Division",
    city: "Karachi",
    website: "https://contour-software.com",
    linkedinUrl: "https://www.linkedin.com/company/contour-software",
    size: "3,000+ Employees",
    verified: true,
    status: "approved",
    description: "A subsidiary of Constellation Software Inc., building vertical market software products across 3 Pakistani tech centers.",
    benefits: ["USD Indexation Component", "Family Medical Insurance", "Retirement Funds", "Paternity & Maternity Leave"]
  },
  {
    id: "comp_trg",
    name: "TRG Pakistan",
    logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80",
    industry: "BPO & AI Tech Ventures",
    city: "Karachi",
    website: "https://trgpakistan.com",
    linkedinUrl: "https://www.linkedin.com/company/the-resource-group",
    size: "4,000+ Employees",
    verified: true,
    status: "approved",
    description: "Global holding company focused on investments in technology-enabled services and customer experience artificial intelligence.",
    benefits: ["Performance Incentives", "Medical Insurance", "Pick and Drop Services", "Professional Training"]
  },
  {
    id: "comp_venturedive",
    name: "VentureDive",
    logo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=120&auto=format&fit=crop&q=80",
    industry: "Digital Engineering & Consulting",
    city: "Lahore",
    website: "https://venturedive.com",
    linkedinUrl: "https://www.linkedin.com/company/venturedive",
    size: "800+ Employees",
    verified: true,
    status: "approved",
    description: "Pioneering digital agency that co-created regional unicorns like Careem, delivering impactful software products.",
    benefits: ["Careem Commute Credits", "Mental Wellness Programs", "Wellness Allowances", "Paid Conference Passes"]
  },
  {
    id: "comp_folio3",
    name: "Folio3",
    logo: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=120&auto=format&fit=crop&q=80",
    industry: "ERP, Mobile & AI Solutions",
    city: "Karachi",
    website: "https://folio3.com",
    linkedinUrl: "https://www.linkedin.com/company/folio3",
    size: "1,200+ Employees",
    verified: true,
    status: "approved",
    description: "Silicon Valley and Pakistani engineering firm specializing in NetSuite ERP, computer vision, and mobile engineering.",
    benefits: ["Provident Fund", "Medical Cover", "Work From Home Flexibility", "On-site Recreational Facilities"]
  },
  {
    id: "comp_confiz",
    name: "Confiz",
    logo: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=120&auto=format&fit=crop&q=80",
    industry: "Cloud & Retail Software",
    city: "Lahore",
    website: "https://confiz.com",
    linkedinUrl: "https://www.linkedin.com/company/confiz",
    size: "900+ Employees",
    verified: true,
    status: "approved",
    description: "Empowering global retail brands and Fortune 500 enterprises with cloud native architecture and Microsoft Dynamics.",
    benefits: ["Microsoft Certification Grants", "Annual Recreation Budget", "Health Insurance", "Fuel Subsidies"]
  },
  {
    id: "comp_jazz",
    name: "Jazz (VEON Microfinance & Telco)",
    logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80",
    industry: "Telecom, Fintech & Cloud",
    city: "Islamabad",
    website: "https://jazz.com.pk",
    linkedinUrl: "https://www.linkedin.com/company/jazzpk",
    size: "6,000+ Employees",
    verified: true,
    status: "approved",
    description: "Pakistan's largest digital communications company and operator of JazzCash, the country's top mobile wallet.",
    benefits: ["Staff Mobile Allowance & Devices", "JazzCash Discounts", "Executive Health Club", "Subsidized Car Loans"]
  },
  {
    id: "comp_daraz",
    name: "Daraz (Alibaba Group)",
    logo: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=120&auto=format&fit=crop&q=80",
    industry: "E-Commerce & Supply Chain Logistics",
    city: "Karachi",
    website: "https://daraz.pk",
    linkedinUrl: "https://www.linkedin.com/company/daraz-pk",
    size: "3,500+ Employees",
    verified: true,
    status: "approved",
    description: "Pakistan's leading online shopping marketplace and logistics fulfillment network under Alibaba International.",
    benefits: ["Employee Marketplace Vouchers", "Health Coverage", "Parental Leaves", "Global Alibaba Training"]
  },
  {
    id: "comp_hbl",
    name: "HBL (Habib Bank Limited)",
    logo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop&q=80",
    industry: "Banking & Financial Technology",
    city: "Karachi",
    website: "https://hbl.com",
    linkedinUrl: "https://www.linkedin.com/company/hbl-pakistan",
    size: "15,000+ Employees",
    verified: true,
    status: "approved",
    description: "Largest commercial bank in Pakistan driving financial inclusion, digital retail banking, and microfinance.",
    benefits: ["Concessionary Home & Auto Loans", "Executive Club", "Comprehensive Medical Cover", "Pension Fund"]
  },
  {
    id: "comp_descon",
    name: "Descon Engineering",
    logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&auto=format&fit=crop&q=80",
    industry: "Industrial & Civil Engineering",
    city: "Lahore",
    website: "https://descon.com",
    linkedinUrl: "https://www.linkedin.com/company/descon",
    size: "10,000+ Employees",
    verified: true,
    status: "approved",
    description: "Premier conglomerate operating in engineering, procurement, construction, power, and manufacturing across Pakistan & the Middle East.",
    benefits: ["Site Allowances & Project Bonuses", "Medical Cover", "Transport Facility", "Provident Fund"]
  },
  {
    id: "comp_engro",
    name: "Engro Corporation",
    logo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=120&auto=format&fit=crop&q=80",
    industry: "Conglomerate, Energy & Petrochemicals",
    city: "Karachi",
    website: "https://engro.com",
    linkedinUrl: "https://www.linkedin.com/company/engro-corporation",
    size: "4,000+ Employees",
    verified: true,
    status: "approved",
    description: "One of Pakistan's largest conglomerates with businesses in fertilizers, foods, energy, petrochemicals, and digital telecommunications.",
    benefits: ["Competitive Housing & Utility Allowance", "Medical Protection", "Engro Leadership Academy", "Bonus Scheme"]
  },
  {
    id: "comp_shaukat",
    name: "Shaukat Khanum Memorial Trust",
    logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80",
    industry: "Healthcare & Oncology Research",
    city: "Lahore",
    website: "https://shaukatkhanum.org.pk",
    linkedinUrl: "https://www.linkedin.com/company/shaukat-khanum-memorial-cancer-hospital-and-research-centre",
    size: "3,000+ Employees",
    verified: true,
    status: "approved",
    description: "World-class cancer research center and charitable hospital providing international standard oncology healthcare in Pakistan.",
    benefits: ["On-campus Medical Facilities", "Continuous Professional Development", "Life Insurance", "Subsidized Cafeteria"]
  },
  {
    id: "comp_motive",
    name: "Motive (KeepTruckin)",
    logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80",
    industry: "AI Fleet & IoT Telematics",
    city: "Islamabad",
    website: "https://gomotive.com",
    linkedinUrl: "https://www.linkedin.com/company/gomotive",
    size: "4,000+ Employees",
    verified: true,
    status: "approved",
    description: "Silicon Valley unicorn building AI dashcams, computer vision hardware, and automated fleet management software with major engineering hubs in Islamabad, Lahore, and Karachi.",
    benefits: ["USD-Indexed Compensation", "Global Stock Options", "Free Gourmet Meals", "Premium OPD & IPD Family Cover"]
  },
  {
    id: "comp_careem",
    name: "Careem Pakistan",
    logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&auto=format&fit=crop&q=80",
    industry: "Ride-Hailing & Super App Tech",
    city: "Karachi",
    website: "https://careem.com",
    linkedinUrl: "https://www.linkedin.com/company/careem",
    size: "2,500+ Employees",
    verified: true,
    status: "approved",
    description: "The everyday Everything App of the greater Middle East and Pakistan, revolutionizing mobility and digital payments under Uber Technologies.",
    benefits: ["Careem Ride Credits", "Unlimited Sick Leaves", "Wellness Budget", "Parental Support Allowance"]
  },
  {
    id: "comp_telenor",
    name: "Telenor Pakistan",
    logo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&auto=format&fit=crop&q=80",
    industry: "Telecommunications & Digital Services",
    city: "Islamabad",
    website: "https://telenor.com.pk",
    linkedinUrl: "https://www.linkedin.com/company/telenor-pakistan",
    size: "5,000+ Employees",
    verified: true,
    status: "approved",
    description: "Digital telecommunications leader serving millions of subscribers with nationwide 4G coverage and Easypaisa microfinance services.",
    benefits: ["Mobile & Data Allowance", "Hybrid Work Schedule", "Annual Bonus Scheme", "Daycare Facility"]
  },
  {
    id: "comp_meezan",
    name: "Meezan Bank",
    logo: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=120&auto=format&fit=crop&q=80",
    industry: "Islamic Commercial Banking",
    city: "Karachi",
    website: "https://meezanbank.com",
    linkedinUrl: "https://www.linkedin.com/company/meezan-bank-ltd",
    size: "16,000+ Employees",
    verified: true,
    status: "approved",
    description: "The premier and largest Islamic bank in Pakistan, offering Shariah-compliant retail, corporate, and digital financial solutions.",
    benefits: ["Shariah-compliant Financing", "Provident & Gratuity Funds", "Hospitalization Insurance", "Umrah Support Program"]
  },
  {
    id: "comp_foodpanda",
    name: "foodpanda Pakistan",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80",
    industry: "Quick Commerce & Food Delivery",
    city: "Lahore",
    website: "https://foodpanda.pk",
    linkedinUrl: "https://www.linkedin.com/company/foodpanda",
    size: "3,000+ Employees",
    verified: true,
    status: "approved",
    description: "Pakistan's leading on-demand food and q-commerce delivery platform operating across 40+ Pakistani cities under Delivery Hero.",
    benefits: ["foodpanda Discount Vouchers", "Pandamart Credits", "Comprehensive Medical Insurance", "Performance Incentives"]
  }
];

// ============================================================================
// 3. PAKISTANI JOB OPENINGS (22+ Roles across Diverse Industries & Degrees)
// ============================================================================
const NOW = Date.now();
const ONE_DAY = 1000 * 60 * 60 * 24;

export const SEED_JOBS: Job[] = [
  {
    id: "job_sys_fullstack",
    companyId: "comp_systems",
    company: "Systems Limited",
    companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Senior Full Stack Engineer (React & Node.js)",
    department: "Engineering",
    city: "Lahore",
    location: "Lahore, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 250,000 – 380,000 / month",
    salaryMinPKR: 250000,
    salaryMaxPKR: 380000,
    salaryDisplayPKR: "PKR 250k – 380k / month",
    preferredDegree: "BS Computer Science / Software Engineering",
    description: "Join Systems Limited's enterprise cloud group. You will architect high-volume web portals and API services for global banking and telecom clients.",
    responsibilities: [
      "Lead architectural decisions across React, TypeScript, and Node.js microservices.",
      "Design normalized PostgreSQL database schemas and implement Redis caching layers.",
      "Optimize core web performance, state management, and continuous CI/CD deployments.",
      "Conduct rigorous code reviews and mentor junior developers across our Lahore team.",
    ],
    requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    optionalSkills: ["Docker", "AWS", "Redis", "Tailwind CSS"],
    minExperience: 5,
    skillsWeight: 70,
    deadline: NOW + ONE_DAY * 14,
    status: "active",
    createdAt: NOW - ONE_DAY * 6,
    vacancies: 3,
  },
  {
    id: "job_10p_react",
    companyId: "comp_10pearls",
    company: "10Pearls",
    companyLogo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Frontend Developer (React & Next.js)",
    department: "Engineering",
    city: "Karachi",
    location: "Karachi, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 150,000 – 220,000 / month",
    salaryMinPKR: 150000,
    salaryMaxPKR: 220000,
    salaryDisplayPKR: "PKR 150k – 220k / month",
    preferredDegree: "BS Computer Science / IT",
    description: "Develop fluid, responsive user interfaces for modern healthcare and fintech products at 10Pearls Karachi center.",
    responsibilities: [
      "Build component libraries using React, Next.js, and modern CSS frameworks.",
      "Collaborate with UX researchers and visual designers to deliver pixel-perfect screens.",
      "Integrate RESTful and GraphQL endpoints with client state caching.",
    ],
    requiredSkills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    optionalSkills: ["GraphQL", "Vitest", "Figma", "Redux"],
    minExperience: 3,
    skillsWeight: 75,
    deadline: NOW + ONE_DAY * 10,
    status: "active",
    createdAt: NOW - ONE_DAY * 4,
    vacancies: 2,
  },
  {
    id: "job_netsol_backend",
    companyId: "comp_netsol",
    company: "NetSol Technologies",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Backend Engineer (Python / FastAPI)",
    department: "Engineering",
    city: "Lahore",
    location: "Lahore, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 180,000 – 270,000 / month",
    salaryMinPKR: 180000,
    salaryMaxPKR: 270000,
    salaryDisplayPKR: "PKR 180k – 270k / month",
    preferredDegree: "BS Computer Science / Software Engineering",
    description: "Help build the next generation of NetSol's cloud-native financial services engine using Python, FastAPI, and Kafka.",
    responsibilities: [
      "Develop secure, transactional REST APIs adhering to ISO financial security standards.",
      "Work with asynchronous message queues and event streams.",
      "Write automated integration tests and monitor containerized Docker services.",
    ],
    requiredSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    optionalSkills: ["Redis", "Kafka", "AWS", "Celery"],
    minExperience: 3,
    skillsWeight: 65,
    deadline: NOW + ONE_DAY * 18,
    status: "active",
    createdAt: NOW - ONE_DAY * 8,
    vacancies: 2,
  },
  {
    id: "job_arbi_frontend",
    companyId: "comp_arbisoft",
    company: "Arbisoft",
    companyLogo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Software Engineer (Frontend)",
    department: "Engineering",
    city: "Lahore",
    location: "Lahore, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 140,000 – 210,000 / month",
    salaryMinPKR: 140000,
    salaryMaxPKR: 210000,
    salaryDisplayPKR: "PKR 140k – 210k / month",
    preferredDegree: "BS Computer Science / BS Software Engineering",
    description: "Join Arbisoft's team building massive-scale online education and travel platforms using modern React and web standards.",
    responsibilities: [
      "Develop interactive frontend workflows with robust accessibility and cross-browser support.",
      "Optimize frontend asset delivery and client-side page load times.",
      "Work in fast-paced 2-week agile sprint cycles.",
    ],
    requiredSkills: ["React", "JavaScript", "HTML", "CSS"],
    optionalSkills: ["TypeScript", "Tailwind CSS", "Jest"],
    minExperience: 2,
    skillsWeight: 70,
    deadline: NOW + ONE_DAY * 2,
    status: "active",
    createdAt: NOW - ONE_DAY * 12,
    vacancies: 4,
  },
  {
    id: "job_contour_devops",
    companyId: "comp_contour",
    company: "Contour Software",
    companyLogo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "DevOps & Cloud SRE Engineer",
    department: "Infrastructure",
    city: "Karachi",
    location: "Karachi, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 300,000 – 480,000 / month",
    salaryMinPKR: 300000,
    salaryMaxPKR: 480000,
    salaryDisplayPKR: "PKR 300k – 480k / month",
    preferredDegree: "BS Computer Science / Telecom / Computer Systems",
    description: "Manage high-availability multi-tenant cloud infrastructure across AWS for Constellation Software product lines.",
    responsibilities: [
      "Automate infrastructure provisioning with Terraform and Ansible.",
      "Maintain Kubernetes clusters, ingress controllers, and Prometheus telemetry.",
      "Enforce cloud security baselines, secret rotations, and automated backups.",
    ],
    requiredSkills: ["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD"],
    optionalSkills: ["Prometheus", "Linux", "Python", "ArgoCD"],
    minExperience: 5,
    skillsWeight: 70,
    deadline: NOW + ONE_DAY * 15,
    status: "active",
    createdAt: NOW - ONE_DAY * 10,
    vacancies: 2,
  },
  {
    id: "job_vdive_uiux",
    companyId: "comp_venturedive",
    company: "VentureDive",
    companyLogo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Lead UI/UX Product Designer",
    department: "Design",
    city: "Lahore",
    location: "Lahore, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 220,000 – 340,000 / month",
    salaryMinPKR: 220000,
    salaryMaxPKR: 340000,
    salaryDisplayPKR: "PKR 220k – 340k / month",
    preferredDegree: "Bachelor in Design / Media / Computer Science",
    description: "Design human-centered mobile and web experiences for venture-backed regional and international software products.",
    responsibilities: [
      "Create high-fidelity Figma prototypes, design systems, and user flow architectures.",
      "Conduct user interviews, usability testing, and heuristic evaluations.",
      "Collaborate with engineering teams during design QA and token handoff.",
    ],
    requiredSkills: ["Figma", "UI/UX Design", "Design Systems", "Prototyping"],
    optionalSkills: ["User Research", "Wireframing", "Motion Design"],
    minExperience: 4,
    skillsWeight: 60,
    deadline: NOW + ONE_DAY * 21,
    status: "active",
    createdAt: NOW - ONE_DAY * 7,
    vacancies: 1,
  },
  {
    id: "job_folio3_qa",
    companyId: "comp_folio3",
    company: "Folio3",
    companyLogo: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Senior QA Automation Engineer",
    department: "QA",
    city: "Karachi",
    location: "Karachi, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 180,000 – 260,000 / month",
    salaryMinPKR: 180000,
    salaryMaxPKR: 260000,
    salaryDisplayPKR: "PKR 180k – 260k / month",
    preferredDegree: "BS Computer Science / Software Engineering",
    description: "Own automated test suites and test framework development across mobile and enterprise web projects.",
    responsibilities: [
      "Author robust end-to-end automation test scripts using Cypress and Selenium.",
      "Implement automated API testing in CI/CD pipeline runs.",
      "Log detailed defect reports and coordinate verification with developers.",
    ],
    requiredSkills: ["Selenium / Cypress", "JavaScript / Python", "API Testing", "Jira"],
    optionalSkills: ["Postman", "Performance Testing", "Appium"],
    minExperience: 4,
    skillsWeight: 65,
    deadline: NOW + ONE_DAY * 9,
    status: "active",
    createdAt: NOW - ONE_DAY * 5,
    vacancies: 2,
  },
  {
    id: "job_confiz_flutter",
    companyId: "comp_confiz",
    company: "Confiz",
    companyLogo: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Mobile App Developer (Flutter)",
    department: "Engineering",
    city: "Lahore",
    location: "Lahore, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 160,000 – 240,000 / month",
    salaryMinPKR: 160000,
    salaryMaxPKR: 240000,
    salaryDisplayPKR: "PKR 160k – 240k / month",
    preferredDegree: "BS Computer Science / Software Engineering",
    description: "Build high-performance, cross-platform Android and iOS apps for omnichannel retail customers.",
    responsibilities: [
      "Develop custom UI widgets, animations, and state architectures using Flutter & Bloc.",
      "Integrate native platform channels for camera, Bluetooth, and push notifications.",
      "Publish releases and manage App Store / Google Play deployment pipelines.",
    ],
    requiredSkills: ["Flutter", "Dart", "REST APIs", "State Management (Bloc/Provider)"],
    optionalSkills: ["Firebase", "CI/CD", "Native Android/iOS"],
    minExperience: 3,
    skillsWeight: 70,
    deadline: NOW + ONE_DAY * 16,
    status: "active",
    createdAt: NOW - ONE_DAY * 3,
    vacancies: 3,
  },
  {
    id: "job_jazz_ai",
    companyId: "comp_jazz",
    company: "Jazz (VEON Microfinance & Telco)",
    companyLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "AI & Machine Learning Engineer",
    department: "AI & Data",
    city: "Islamabad",
    location: "Islamabad, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 280,000 – 450,000 / month",
    salaryMinPKR: 280000,
    salaryMaxPKR: 450000,
    salaryDisplayPKR: "PKR 280k – 450k / month",
    preferredDegree: "BS/MS Artificial Intelligence / Computer Science / Data Science",
    description: "Build machine learning models and conversational AI assistants for Jazz customer care and JazzCash fraud detection.",
    responsibilities: [
      "Deploy natural language models and LLM agent pipelines using Python and PyTorch.",
      "Implement real-time feature stores and predictive credit scoring pipelines.",
      "Ensure ethical AI safeguards, latency benchmarks, and low hallucination rates.",
    ],
    requiredSkills: ["Python", "PyTorch", "LLM APIs", "FastAPI"],
    optionalSkills: ["LangChain", "Vector Databases", "Docker", "MLOps"],
    minExperience: 4,
    skillsWeight: 80,
    deadline: NOW + ONE_DAY * 25,
    status: "active",
    createdAt: NOW - ONE_DAY * 2,
    vacancies: 2,
  },
  {
    id: "job_daraz_data",
    companyId: "comp_daraz",
    company: "Daraz (Alibaba Group)",
    companyLogo: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Senior Data & Business Analyst",
    department: "AI & Data",
    city: "Karachi",
    location: "Karachi, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 170,000 – 260,000 / month",
    salaryMinPKR: 170000,
    salaryMaxPKR: 260000,
    salaryDisplayPKR: "PKR 170k – 260k / month",
    preferredDegree: "BS Data Science / Statistics / Economics / Computer Science",
    description: "Deliver analytical insights across e-commerce search, merchant logistics, and promotional campaigns at Daraz.",
    responsibilities: [
      "Write complex SQL queries on BigQuery and build interactive PowerBI dashboards.",
      "Model buyer conversion funnels and provide weekly executive reports.",
      "Conduct A/B testing on user promotions and platform search changes.",
    ],
    requiredSkills: ["SQL", "PowerBI", "Python", "Data Analysis"],
    optionalSkills: ["BigQuery", "Excel Modeling", "Tableau"],
    minExperience: 3,
    skillsWeight: 65,
    deadline: NOW + ONE_DAY * 11,
    status: "active",
    createdAt: NOW - ONE_DAY * 9,
    vacancies: 2,
  },
  {
    id: "job_hbl_security",
    companyId: "comp_hbl",
    company: "HBL (Habib Bank Limited)",
    companyLogo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Cybersecurity Analyst",
    department: "Infrastructure",
    city: "Karachi",
    location: "Karachi, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 190,000 – 300,000 / month",
    salaryMinPKR: 190000,
    salaryMaxPKR: 300000,
    salaryDisplayPKR: "PKR 190k – 300k / month",
    preferredDegree: "BS Cybersecurity / Computer Science / Information Security",
    description: "Monitor and safeguard HBL digital banking infrastructure against cyber threats and security vulnerabilities.",
    responsibilities: [
      "Conduct periodic penetration testing, code security reviews, and vulnerability scans.",
      "Monitor SIEM logs, firewall rules, and respond to security incident alerts.",
      "Ensure adherence to State Bank of Pakistan (SBP) cybersecurity directives.",
    ],
    requiredSkills: ["Cybersecurity", "SIEM", "Network Security", "Penetration Testing"],
    optionalSkills: ["Python", "Linux", "ISO 27001"],
    minExperience: 4,
    skillsWeight: 70,
    deadline: NOW + ONE_DAY * 19,
    status: "active",
    createdAt: NOW - ONE_DAY * 14,
    vacancies: 1,
  },
  {
    id: "job_trg_bde",
    companyId: "comp_trg",
    company: "TRG Pakistan",
    companyLogo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Business Development Executive (IT Sales)",
    department: "Marketing",
    city: "Karachi",
    location: "Karachi, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 90,000 – 140,000 / month",
    salaryMinPKR: 90000,
    salaryMaxPKR: 140000,
    salaryDisplayPKR: "PKR 90k – 140k / month",
    preferredDegree: "BBA / MBA / BS Economics",
    description: "Generate prospective enterprise leads, manage client communications, and assist technology proposals.",
    responsibilities: [
      "Prospect and engage potential business clients across North American and GCC markets.",
      "Schedule discovery calls and coordinate technical presentations with solutions architects.",
      "Maintain active client relationship pipelines on HubSpot CRM.",
    ],
    requiredSkills: ["B2B Sales", "Lead Generation", "Communication", "CRM"],
    optionalSkills: ["HubSpot", "Cold Calling", "Proposal Writing"],
    minExperience: 2,
    skillsWeight: 50,
    deadline: NOW + ONE_DAY * 8,
    status: "active",
    createdAt: NOW - ONE_DAY * 11,
    vacancies: 2,
  },
  {
    id: "job_pesh_flutter_remote",
    companyId: "comp_venturedive",
    company: "VentureDive",
    companyLogo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Junior Flutter Developer",
    department: "Engineering",
    city: "Peshawar",
    location: "Peshawar, Pakistan (Remote)",
    type: "Full-time",
    salary: "PKR 85,000 – 130,000 / month",
    salaryMinPKR: 85000,
    salaryMaxPKR: 130000,
    salaryDisplayPKR: "PKR 85k – 130k / month",
    preferredDegree: "BS Computer Science / Software Engineering / IT",
    description: "Remote Flutter developer position for fresh to junior software engineers in Peshawar and KPK region.",
    responsibilities: [
      "Implement responsive screen layouts according to Figma design files.",
      "Connect mobile screens with REST backend services.",
      "Write unit tests for UI widgets and state logic.",
    ],
    requiredSkills: ["Flutter", "Dart", "Git", "REST APIs"],
    optionalSkills: ["Firebase", "Provider", "Clean Architecture"],
    minExperience: 1,
    skillsWeight: 70,
    deadline: NOW + ONE_DAY * 12,
    status: "active",
    createdAt: NOW - ONE_DAY * 4,
    vacancies: 3,
  },
  {
    id: "job_fsd_php",
    companyId: "comp_systems",
    company: "Systems Limited",
    companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "PHP / Laravel Developer",
    department: "Engineering",
    city: "Faisalabad",
    location: "Faisalabad, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 95,000 – 150,000 / month",
    salaryMinPKR: 95000,
    salaryMaxPKR: 150000,
    salaryDisplayPKR: "PKR 95k – 150k / month",
    preferredDegree: "BS Computer Science / IT / Computer Systems",
    description: "Maintain and upgrade enterprise web applications for domestic industrial and retail clients.",
    responsibilities: [
      "Write clean, scalable backend code in Laravel and MySQL.",
      "Build administrative panels and payment gateway integrations.",
    ],
    requiredSkills: ["PHP", "Laravel", "MySQL", "JavaScript"],
    optionalSkills: ["Vue.js", "Docker", "Tailwind CSS"],
    minExperience: 2,
    skillsWeight: 65,
    deadline: NOW + ONE_DAY * 7,
    status: "active",
    createdAt: NOW - ONE_DAY * 8,
    vacancies: 2,
  },

  // NEW ENTERPRISE JOBS (DIVERSE DISCIPLINES & DEGREES)
  {
    id: "job_daraz_marketing",
    companyId: "comp_daraz",
    company: "Daraz (Alibaba Group)",
    companyLogo: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Digital Marketing & Growth Manager",
    department: "Marketing",
    city: "Karachi",
    location: "Karachi, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 180,000 – 280,000 / month",
    salaryMinPKR: 180000,
    salaryMaxPKR: 280000,
    salaryDisplayPKR: "PKR 180k – 280k / month",
    preferredDegree: "BBA / MBA Marketing / Media Sciences",
    description: "Drive digital consumer acquisition, performance marketing campaigns (Meta, Google, TikTok), and 11.11 mega-sale campaign execution for Daraz Pakistan.",
    responsibilities: [
      "Manage multi-million PKR monthly digital advertising budgets across performance channels.",
      "Analyze ROAS, user cohort retention, and customer acquisition costs (CAC).",
      "Lead cross-functional creative sprints with graphic designers and copywriters.",
    ],
    requiredSkills: ["Digital Marketing", "SEO / SEM", "Google Ads", "Social Media Marketing", "Data Analytics"],
    optionalSkills: ["TikTok Ads", "HubSpot", "A/B Testing", "Content Strategy"],
    minExperience: 4,
    skillsWeight: 60,
    deadline: NOW + ONE_DAY * 22,
    status: "active",
    createdAt: NOW - ONE_DAY * 2,
    vacancies: 2,
  },
  {
    id: "job_hbl_finance",
    companyId: "comp_hbl",
    company: "HBL (Habib Bank Limited)",
    companyLogo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Corporate Financial Analyst",
    department: "Finance",
    city: "Karachi",
    location: "Karachi, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 160,000 – 250,000 / month",
    salaryMinPKR: 160000,
    salaryMaxPKR: 250000,
    salaryDisplayPKR: "PKR 160k – 250k / month",
    preferredDegree: "BS Accounting & Finance / CFA / ACCA / MBA Finance",
    description: "Perform credit appraisal, asset liability analysis, and corporate portfolio financial modeling within HBL Corporate Banking Division.",
    responsibilities: [
      "Prepare three-statement financial models, discounted cash flow (DCF) models, and variance evaluations.",
      "Conduct industry risk assessments adhering to State Bank of Pakistan prudential regulations.",
      "Review client balance sheets and propose structured working capital financing lines.",
    ],
    requiredSkills: ["Financial Modeling", "Accounting", "Corporate Finance", "Excel", "Financial Reporting"],
    optionalSkills: ["PowerBI", "IFRS", "Valuation", "Banking Software"],
    minExperience: 3,
    skillsWeight: 65,
    deadline: NOW + ONE_DAY * 17,
    status: "active",
    createdAt: NOW - ONE_DAY * 5,
    vacancies: 2,
  },
  {
    id: "job_sys_hr",
    companyId: "comp_systems",
    company: "Systems Limited",
    companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Human Resources Executive (Talent Operations)",
    department: "Human Resources",
    city: "Lahore",
    location: "Lahore, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 110,000 – 175,000 / month",
    salaryMinPKR: 110000,
    salaryMaxPKR: 175000,
    salaryDisplayPKR: "PKR 110k – 175k / month",
    preferredDegree: "BBA / MBA Human Resources / Public Administration",
    description: "Manage employee onboarding, talent engagement programs, performance review cycles, and recruiter KPI dashboards across Systems Limited tech units.",
    responsibilities: [
      "Drive smooth end-to-end employee lifecycle experiences for incoming engineering hires.",
      "Facilitate employee retention programs and administer employee satisfaction surveys.",
      "Maintain HR records on enterprise HRMS software and ensure labor compliance.",
    ],
    requiredSkills: ["Human Resources", "Talent Management", "Employee Engagement", "Onboarding", "Communication"],
    optionalSkills: ["HRIS", "Performance Management", "Conflict Resolution"],
    minExperience: 2,
    skillsWeight: 55,
    deadline: NOW + ONE_DAY * 15,
    status: "active",
    createdAt: NOW - ONE_DAY * 4,
    vacancies: 2,
  },
  {
    id: "job_descon_civil",
    companyId: "comp_descon",
    company: "Descon Engineering",
    companyLogo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Civil Project Engineer (Infrastructure)",
    department: "Engineering",
    city: "Lahore",
    location: "Lahore, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 150,000 – 230,000 / month",
    salaryMinPKR: 150000,
    salaryMaxPKR: 230000,
    salaryDisplayPKR: "PKR 150k – 230k / month",
    preferredDegree: "BS Civil Engineering / PEC Registered",
    description: "Supervise structural site execution, quality assurance, contractor scheduling, and site safety on major national industrial infrastructure projects.",
    responsibilities: [
      "Interpret structural blueprints, AutoCAD site drawings, and bill of quantities (BOQ).",
      "Monitor concrete pour quality, soil testing, and reinforcing steel placement.",
      "Coordinate progress milestones with site consultants and maintain daily site logs.",
    ],
    requiredSkills: ["AutoCAD", "Structural Engineering", "Project Management", "Site Supervision", "Civil Engineering"],
    optionalSkills: ["Primavera P6", "Revit", "BOQ Estimation", "Safety Compliance"],
    minExperience: 3,
    skillsWeight: 70,
    deadline: NOW + ONE_DAY * 20,
    status: "active",
    createdAt: NOW - ONE_DAY * 7,
    vacancies: 3,
  },
  {
    id: "job_engro_mech",
    companyId: "comp_engro",
    company: "Engro Corporation",
    companyLogo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Mechanical Reliability Engineer",
    department: "Engineering",
    city: "Karachi",
    location: "Karachi, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 190,000 – 290,000 / month",
    salaryMinPKR: 190000,
    salaryMaxPKR: 290000,
    salaryDisplayPKR: "PKR 190k – 290k / month",
    preferredDegree: "BS Mechanical Engineering / Mechatronics / PEC Registered",
    description: "Ensure operational uptime of rotating machinery, centrifugal pumps, turbines, and pressure vessels at Engro processing complexes.",
    responsibilities: [
      "Formulate predictive maintenance schedules using vibration analysis and thermography.",
      "Conduct root cause failure analyses (RCFA) for critical machinery outages.",
      "Coordinate shutdown maintenance overhauls and liaise with spare parts procurement.",
    ],
    requiredSkills: ["Mechanical Engineering", "Preventive Maintenance", "Pumps & Turbines", "Vibration Analysis", "Safety Standards"],
    optionalSkills: ["SolidWorks", "SAP PM", "Thermodynamics", "Root Cause Analysis"],
    minExperience: 4,
    skillsWeight: 70,
    deadline: NOW + ONE_DAY * 18,
    status: "active",
    createdAt: NOW - ONE_DAY * 3,
    vacancies: 2,
  },
  {
    id: "job_daraz_supply",
    companyId: "comp_daraz",
    company: "Daraz (Alibaba Group)",
    companyLogo: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Supply Chain & Hub Fulfillment Lead",
    department: "Operations",
    city: "Lahore",
    location: "Lahore, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 130,000 – 200,000 / month",
    salaryMinPKR: 130000,
    salaryMaxPKR: 200000,
    salaryDisplayPKR: "PKR 130k – 200k / month",
    preferredDegree: "BS Supply Chain / BBA / Industrial Engineering",
    description: "Oversee warehouse inbound/outbound fulfillment, rider dispatch logistics, and last-mile route efficiency across Punjab regional hubs.",
    responsibilities: [
      "Track order dispatch velocity and resolve logistics bottlenecks within 4-hour SLAs.",
      "Audit warehouse inventory accuracy and manage 3PL courier partnerships.",
      "Lead a team of 40+ warehouse sorting supervisors and dispatchers.",
    ],
    requiredSkills: ["Supply Chain", "Logistics Management", "Warehouse Operations", "Inventory Control", "Process Optimization"],
    optionalSkills: ["WMS Software", "Excel Modeling", "Vendor Negotiation"],
    minExperience: 3,
    skillsWeight: 60,
    deadline: NOW + ONE_DAY * 14,
    status: "active",
    createdAt: NOW - ONE_DAY * 6,
    vacancies: 2,
  },
  {
    id: "job_shaukat_health",
    companyId: "comp_shaukat",
    company: "Shaukat Khanum Memorial Trust",
    companyLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Healthcare Operations Officer",
    department: "Healthcare Administration",
    city: "Lahore",
    location: "Lahore, Pakistan (On-site)",
    type: "Full-time",
    salary: "PKR 120,000 – 185,000 / month",
    salaryMinPKR: 120000,
    salaryMaxPKR: 185000,
    salaryDisplayPKR: "PKR 120k – 185k / month",
    preferredDegree: "MBBS / Healthcare Administration / MBA Hospital Management",
    description: "Coordinate patient clinical pathways, bed management, and accreditation documentation for Joint Commission International (JCI) hospital audits.",
    responsibilities: [
      "Streamline patient outpatient clinic scheduling and reduce emergency department wait times.",
      "Ensure healthcare records and clinical protocols adhere to international quality metrics.",
      "Liaise between senior medical oncology faculty and hospital operational administration.",
    ],
    requiredSkills: ["Healthcare Management", "Hospital Administration", "Clinical Governance", "Quality Assurance", "Communication"],
    optionalSkills: ["Electronic Medical Records (EMR)", "Patient Safety Protocols", "Medical Auditing"],
    minExperience: 3,
    skillsWeight: 65,
    deadline: NOW + ONE_DAY * 16,
    status: "active",
    createdAt: NOW - ONE_DAY * 5,
    vacancies: 1,
  },
  {
    id: "job_arbi_content",
    companyId: "comp_arbisoft",
    company: "Arbisoft",
    companyLogo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Technical Writer & Content Strategist",
    department: "Marketing",
    city: "Lahore",
    location: "Lahore, Pakistan (Hybrid)",
    type: "Full-time",
    salary: "PKR 100,000 – 160,000 / month",
    salaryMinPKR: 100000,
    salaryMaxPKR: 160000,
    salaryDisplayPKR: "PKR 100k – 160k / month",
    preferredDegree: "Mass Communication / English / Computer Science",
    description: "Author comprehensive developer documentation, API guides, engineering whitepapers, and international case studies for Arbisoft software products.",
    responsibilities: [
      "Translate complex technical software architectures into clear, user-friendly documentation.",
      "Write developer tutorials, release notes, and technical blog posts.",
      "Maintain documentation repositories using Markdown and Git.",
    ],
    requiredSkills: ["Technical Writing", "API Documentation", "Content Strategy", "Markdown / Git", "English Proficiency"],
    optionalSkills: ["Swagger / Postman", "Basic Python/JS", "SEO Content"],
    minExperience: 2,
    skillsWeight: 60,
    deadline: NOW + ONE_DAY * 24,
    status: "active",
    createdAt: NOW - ONE_DAY * 1,
    vacancies: 1,
  },

  // ARCHIVED JOB OPENING FOR DEADLINE AUTOMATION AUDIT
  {
    id: "job_closed_sample",
    companyId: "comp_10pearls",
    company: "10Pearls",
    companyLogo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=80",
    isVerifiedCompany: true,
    isCorporateListing: true,
    title: "Intern Software Engineer (Summer 2026)",
    department: "Engineering",
    city: "Islamabad",
    location: "Islamabad, Pakistan (On-site)",
    type: "Contract",
    salary: "PKR 35,000 – 45,000 / month",
    salaryMinPKR: 35000,
    salaryMaxPKR: 45000,
    salaryDisplayPKR: "PKR 35k – 45k / month",
    preferredDegree: "BS Computer Science (Final Year)",
    description: "Paid 3-month summer engineering internship for graduating students from FAST, NUST, and COMSATS.",
    responsibilities: ["Participate in software engineering bootcamps and team sprints."],
    requiredSkills: ["Data Structures", "OOP", "C++ / Java", "Git"],
    optionalSkills: ["Python", "JavaScript"],
    minExperience: 0,
    skillsWeight: 60,
    deadline: NOW - ONE_DAY * 3, // Expired 3 days ago!
    status: "closed",
    createdAt: NOW - ONE_DAY * 30,
    vacancies: 10,
  },
];

// Helper to make realistic Pakistani candidate applications
const makePakistaniCandidate = (
  id: string,
  username: string,
  userId: string | undefined,
  jobId: string,
  name: string,
  email: string,
  phone: string,
  city: string,
  location: string,
  resumeText: string,
  stage: Stage,
  manualStage: boolean,
  notes: string,
  currentSalaryPKR: number,
  expectedSalaryPKR: number,
  portfolioUrl?: string,
  githubUrl?: string,
  interviews: InterviewSchedule[] = [],
): Candidate => {
  const targetJob = SEED_JOBS.find((j) => j.id === jobId) ?? SEED_JOBS[0]!;
  const cand: Candidate = {
    id,
    username,
    userId,
    jobId,
    companyId: targetJob.companyId,
    name,
    email,
    phone,
    city,
    location,
    portfolioUrl,
    githubUrl,
    resumeFileName: `${name.replace(/\s+/g, "_")}_CV.pdf`,
    resumeFileType: "application/pdf",
    resumeText,
    stage,
    appliedAt: NOW - Math.floor(Math.random() * ONE_DAY * 10) - ONE_DAY,
    updatedAt: NOW - Math.floor(Math.random() * ONE_DAY * 2),
    manualStage,
    withdrawn: false,
    currentSalaryPKR,
    expectedSalaryPKR,
    notes,
    interviews,
    history: [
      {
        stage: "Applied",
        timestamp: NOW - ONE_DAY * 7,
        note: "CV submitted via Screenloop portal.",
      },
      ...(stage !== "Applied"
        ? [
            {
              stage,
              timestamp: NOW - ONE_DAY * 2,
              note: `Application progressed to ${stage}.`,
            },
          ]
        : []),
    ],
    triggers: [],
  };

  cand.screening = screenCandidate(cand, targetJob);
  cand.cvScore = cand.screening.matchScore;
  return cand;
};

// ============================================================================
// 4. PAKISTANI CANDIDATES (30+ Applications across tech & corporate roles)
// ============================================================================
export const SEED_CANDIDATES: Candidate[] = [
  makePakistaniCandidate(
    "cand_1",
    "ali.khan",
    "u_cand_1",
    "job_sys_fullstack",
    "Ali Khan",
    "ali.khan@screenloop.pk",
    "+92 300 1234567",
    "Karachi",
    "Karachi, Pakistan",
    "Senior Full Stack Engineer with 6 years experience in React, TypeScript, Node.js, and PostgreSQL. Architected cloud SaaS products with Redis caching layers and Docker containers.",
    "Interview",
    true,
    "Candidate requested virtual Google Meet interview due to current Karachi commute.",
    260000,
    350000,
    "https://alikhan.dev",
    "https://github.com/alikhan",
    [
      {
        id: "int_1",
        date: "2026-09-14",
        time: "14:30 PKT",
        type: "Technical",
        interviewer: "Tariq Mehmood (TA Lead)",
        meetingLink: "https://meet.google.com/scr-sys-tech",
      },
    ]
  ),
  makePakistaniCandidate(
    "cand_2",
    "hamza.ahmed",
    "u_cand_2",
    "job_arbi_frontend",
    "Hamza Ahmed",
    "hamza.ahmed@screenloop.pk",
    "+92 321 7654321",
    "Lahore",
    "Lahore, Pakistan",
    "Frontend Software Engineer with 4 years experience in React, Next.js, JavaScript, HTML, CSS, and Tailwind CSS. Built high-traffic travel portals with Vitest unit testing.",
    "Shortlisted",
    false,
    "Fast-track: strong recommendations from previous project lead at FAST-NUCES alumni circle.",
    160000,
    220000,
    "https://hamzaahmed.tech",
    "https://github.com/hamzaahmed"
  ),
  makePakistaniCandidate(
    "cand_3",
    "usman.raza",
    "u_cand_3",
    "job_netsol_backend",
    "Usman Raza",
    "usman.raza@screenloop.pk",
    "+92 333 4567890",
    "Islamabad",
    "Islamabad, Pakistan",
    "Backend Software Engineer with 3.5 years experience in Python, FastAPI, PostgreSQL, Docker, and Redis. Built low-latency microservices for financial banking clients.",
    "Screening",
    false,
    "Strong portfolio of open-source FastAPI plugins.",
    210000,
    280000,
    "https://usmanraza.io",
    "https://github.com/usmanraza"
  ),
  makePakistaniCandidate(
    "cand_4",
    "ayman.fatima",
    "u_cand_4",
    "job_vdive_uiux",
    "Ayman Fatima",
    "ayman.fatima@screenloop.pk",
    "+92 301 9876543",
    "Lahore",
    "Lahore, Pakistan",
    "Lead UI/UX Designer with 6 years experience in Figma, UI/UX Design, Design Systems, and Prototyping. Led design transformation for regional banking apps and digital wallets.",
    "Interview",
    true,
    "Portfolio is exceptional. Design system architecture presentation impressed committee.",
    240000,
    320000,
    "https://aymandesign.dribbble.com",
    undefined,
    [
      {
        id: "int_2",
        date: "2026-09-15",
        time: "11:00 PKT",
        type: "System Design",
        interviewer: "Head of Product Experience",
        meetingLink: "https://meet.google.com/vdive-design-panel",
      },
    ]
  ),
  makePakistaniCandidate(
    "cand_5",
    "hira.khalid",
    "u_cand_5",
    "job_folio3_qa",
    "Hira Khalid",
    "hira.khalid@screenloop.pk",
    "+92 345 1122334",
    "Karachi",
    "Karachi, Pakistan",
    "Senior QA Automation Engineer with 5 years experience in Selenium / Cypress, JavaScript / Python, API Testing, and Jira. Implemented CI/CD automated regression suites.",
    "Offer",
    true,
    "Background checks cleared. Offer letter generated.",
    140000,
    190000,
    "https://hirakhalid.qa",
    "https://github.com/hirakhalid"
  ),
  makePakistaniCandidate(
    "cand_6",
    "saad.ali",
    "u_cand_6",
    "job_contour_devops",
    "Saad Ali",
    "saad.ali@screenloop.pk",
    "+92 312 9988776",
    "Rawalpindi",
    "Rawalpindi, Pakistan",
    "DevOps & SRE Engineer with 5 years experience in Kubernetes, AWS, Terraform, Docker, and CI/CD. Built automated zero-downtime canary deployment pipelines.",
    "Interview",
    true,
    "Technical assessment score: 96%. High proficiency in Terraform infrastructure modules.",
    310000,
    420000,
    undefined,
    "https://github.com/saadali-ops",
    [
      {
        id: "int_3",
        date: "2026-09-16",
        time: "16:00 PKT",
        type: "Technical",
        interviewer: "Lead Cloud Architect",
        meetingLink: "https://meet.google.com/contour-sre",
      },
    ]
  ),
  makePakistaniCandidate(
    "cand_7",
    "mahnoor.ahmed",
    "u_cand_7",
    "job_daraz_data",
    "Mahnoor Ahmed",
    "mahnoor.ahmed@screenloop.pk",
    "+92 305 6677889",
    "Faisalabad",
    "Faisalabad, Pakistan",
    "Data Analyst with 3 years experience across SQL, PowerBI, Python, and Data Analysis. Experience modeling customer retention metrics and sales dashboards.",
    "Screening",
    false,
    "Impressive dashboard portfolio in PowerBI.",
    150000,
    200000,
    "https://mahnoorahmed.analytics",
    undefined
  ),
  makePakistaniCandidate(
    "cand_8",
    "bilal.sheikh",
    "u_cand_8",
    "job_confiz_flutter",
    "Bilal Sheikh",
    "bilal.sheikh@screenloop.pk",
    "+92 334 5544332",
    "Peshawar",
    "Peshawar, Pakistan",
    "Mobile Application Developer with 4 years experience in Flutter, Dart, REST APIs, and State Management (Bloc/Provider). Published 6 production apps to App Store and Play Store.",
    "Shortlisted",
    true,
    "Clean code samples submitted. Excellent state architecture knowledge.",
    175000,
    240000,
    "https://bilalsheikh.app",
    "https://github.com/bilalsheikh"
  ),
  makePakistaniCandidate(
    "cand_9",
    "zainab.tariq",
    "u_cand_1",
    "job_sys_fullstack",
    "Zainab Tariq",
    "zainab.tariq@example.pk",
    "+92 303 4455667",
    "Multan",
    "Multan, Pakistan",
    "Full Stack Engineer with 5 years experience across React, TypeScript, Node.js, and PostgreSQL. Experience building microfrontends and Dockerized web services.",
    "Shortlisted",
    true,
    "Promising applicant from Multan requesting hybrid/remote balance.",
    200000,
    270000,
    undefined,
    "https://github.com/zainabtariq"
  ),
  makePakistaniCandidate(
    "cand_10",
    "danish.iqbal",
    undefined,
    "job_sys_fullstack",
    "Danish Iqbal",
    "danish.iqbal@example.pk",
    "+92 311 2233445",
    "Lahore",
    "Lahore, Pakistan",
    "Frontend Developer with 3 years experience in React, JavaScript, HTML, and CSS. Learning TypeScript and Node.js.",
    "Applied",
    false,
    "Recent application received. AI evaluation shows partial stack alignment.",
    130000,
    180000,
    undefined,
    "https://github.com/danishiqbal"
  ),
  makePakistaniCandidate(
    "cand_11",
    "ayesha.rehman",
    undefined,
    "job_jazz_ai",
    "Ayesha Rehman",
    "ayesha.rehman@example.pk",
    "+92 332 9988112",
    "Islamabad",
    "Islamabad, Pakistan",
    "AI and Machine Learning Engineer with 5 years experience in Python, PyTorch, LLM APIs, and FastAPI. Developed custom customer support bots and RAG pipelines.",
    "Interview",
    true,
    "Expertise in fine-tuning open source Urdu-English bilingual models.",
    300000,
    420000,
    "https://ayesharehman.ai",
    "https://github.com/ayesharehman"
  ),
  makePakistaniCandidate(
    "cand_12",
    "fawad.alam",
    undefined,
    "job_daraz_marketing",
    "Fawad Alam",
    "fawad.alam@example.pk",
    "+92 322 4455889",
    "Karachi",
    "Karachi, Pakistan",
    "Digital Marketing Growth Lead with 5 years experience running meta ads, SEO, Google Ads, and e-commerce campaigns in Pakistan.",
    "Shortlisted",
    true,
    "Managed over PKR 15M ad spends for top retail brands.",
    170000,
    240000,
    undefined,
    undefined
  ),
  makePakistaniCandidate(
    "cand_13",
    "nida.yasir",
    undefined,
    "job_hbl_finance",
    "Nida Yasir",
    "nida.yasir@example.pk",
    "+92 301 6677881",
    "Karachi",
    "Karachi, Pakistan",
    "ACCA Member and Financial Analyst with 4 years experience in Corporate Finance, Financial Modeling, Accounting, and SBP reporting.",
    "Interview",
    true,
    "Strong command over banking financial regulations and DCF modeling.",
    160000,
    230000,
    undefined,
    undefined
  ),
  makePakistaniCandidate(
    "cand_14",
    "kamran.bhatti",
    undefined,
    "job_hbl_security",
    "Kamran Bhatti",
    "kamran.bhatti@example.pk",
    "+92 315 7766554",
    "Karachi",
    "Karachi, Pakistan",
    "Cybersecurity Analyst with 5 years experience in Cybersecurity, SIEM, Network Security, and Penetration Testing. Certified CEH and CISSP associate.",
    "Final Interview",
    true,
    "Passed strict banking compliance background checks.",
    240000,
    310000,
    undefined,
    undefined
  ),
  makePakistaniCandidate(
    "cand_15",
    "suleman.shah",
    undefined,
    "job_pesh_flutter_remote",
    "Suleman Shah",
    "suleman.shah@example.pk",
    "+92 336 1122449",
    "Peshawar",
    "Peshawar, Pakistan",
    "Junior Flutter Developer with 1.5 years experience in Flutter, Dart, Git, and REST APIs. Built food delivery mobile app for Peshawar merchant union.",
    "Applied",
    false,
    "Great candidate for junior remote opening.",
    80000,
    110000,
    undefined,
    "https://github.com/sulemanshah"
  ),
  makePakistaniCandidate(
    "cand_16",
    "maryam.farooq",
    undefined,
    "job_fsd_php",
    "Maryam Farooq",
    "maryam.farooq@example.pk",
    "+92 308 5544991",
    "Faisalabad",
    "Faisalabad, Pakistan",
    "PHP and Laravel Developer with 3 years experience in PHP, Laravel, MySQL, and JavaScript. Maintained inventory management systems for textile exporters.",
    "Screening",
    false,
    "Solid local experience in Faisalabad industrial sector.",
    90000,
    135000,
    undefined,
    "https://github.com/maryamfarooq"
  ),
  makePakistaniCandidate(
    "cand_17",
    "raheel.vance",
    undefined,
    "job_sys_fullstack",
    "Raheel Qureshi",
    "raheel.qureshi@example.pk",
    "+92 300 9988771",
    "Lahore",
    "Lahore, Pakistan",
    "Experienced software engineer with 2 years in Python and Django. Basic exposure to React.",
    "Rejected",
    true,
    "Insufficient senior full-stack experience for this role.",
    110000,
    160000,
    undefined,
    undefined
  ),
];

// ============================================================================
// 5. SEED AUDIT LOGS (Security & Compliance Tracking)
// ============================================================================
export const SEED_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log_1",
    timestamp: NOW - 1000 * 60 * 12,
    userId: "u_cand_1",
    username: "ali.khan",
    role: "candidate",
    action: "LOGIN",
    resource: "/auth/session",
    details: "Successful 2FA password authentication from Karachi, Pakistan",
    severity: "info",
    ip: "39.40.12.18",
  },
  {
    id: "log_2",
    timestamp: NOW - 1000 * 60 * 45,
    userId: "u_rec_1",
    username: "tariq.recruiter",
    role: "hr",
    action: "STAGE_CHANGE",
    resource: "Candidate #cand_1 (Ali Khan)",
    details: "Applicant moved from 'Screening' to 'Interview' stage",
    severity: "info",
    ip: "182.188.42.10",
  },
  {
    id: "log_3",
    timestamp: NOW - 1000 * 60 * 110,
    userId: "u_admin_1",
    username: "admin.screenloop",
    role: "admin",
    action: "COMPANY_VERIFIED",
    resource: "Company #comp_systems",
    details: "Verified employer checkmark granted after PSX & SECP audit",
    severity: "info",
    ip: "175.107.20.5",
  },
  {
    id: "log_4",
    timestamp: NOW - 1000 * 60 * 240,
    userId: "u_cand_2",
    username: "hamza.ahmed",
    role: "candidate",
    action: "APPLICATION_SUBMITTED",
    resource: "Job #job_arbi_frontend",
    details: "New CV submission with 88% deterministic match score",
    severity: "info",
    ip: "39.45.190.4",
  },
  {
    id: "log_5",
    timestamp: NOW - 1000 * 60 * 360,
    userId: "anon_security_trap",
    username: "anonymous",
    role: "candidate",
    action: "FAILED_LOGIN",
    resource: "/auth/login",
    details: "Exceeded 3 incorrect password attempts for user 'hr.systems' - rate limiter triggered",
    severity: "warning",
    ip: "103.255.4.12",
  },
];

// ============================================================================
// 6. SEED PLUGINS (Role-Scoped AI & ATS Extensions)
// ============================================================================
export const SEED_PLUGINS: AtsPlugin[] = [
  // Candidate Plugins
  {
    id: "cand_cv_assistant",
    name: "AI CV Quality & ATS Ranker",
    description: "Evaluates resume formatting, structure, keyword density, and quantifiable achievements against Pakistani tech standards.",
    targetRole: "candidate",
    category: "Career & CV",
    author: "Screenloop Core AI",
    version: "2.4.0",
    enabled: true,
    permissions: ["READ_PROFILE", "READ_CV", "WRITE_ANALYSIS"],
    icon: "FileCheck",
  },
  {
    id: "cand_interview_coach",
    name: "AI Interview Simulator & STAR Coach",
    description: "Generates tailored mock interview questions with feedback on technical depth and behavioral STAR responses.",
    targetRole: "candidate",
    category: "Interview Prep",
    author: "TalentPrep Labs",
    version: "1.2.0",
    enabled: true,
    permissions: ["READ_PROFILE", "READ_CV", "READ_APPLICATIONS"],
    icon: "Brain",
  },
  {
    id: "cand_salary_advisor",
    name: "Pakistani Salary & Compensation Negotiator",
    description: "Provides realistic PKR benchmarks across Pakistani cities and formulates custom negotiation scripts.",
    targetRole: "candidate",
    category: "Compensation",
    author: "PakTech Benchmarks",
    version: "3.1.0",
    enabled: true,
    permissions: ["READ_PROFILE", "READ_APPLICATIONS"],
    icon: "Coins",
  },
  {
    id: "cand_cover_letter",
    name: "Contextual Cover Letter Generator",
    description: "Drafts tailored cover letters referencing candidate's verified skills without inventing experience.",
    targetRole: "candidate",
    category: "Applications",
    author: "Screenloop AI",
    version: "1.5.0",
    enabled: true,
    permissions: ["READ_PROFILE", "READ_CV", "WRITE_ANALYSIS"],
    icon: "FileText",
  },
  // HR Plugins
  {
    id: "hr_jd_generator",
    name: "Pakistani Tech Requisition Architect",
    description: "Generates production-grade job descriptions tailored to Karachi, Lahore, and Islamabad market talent realities.",
    targetRole: "hr",
    category: "Requisition",
    author: "Screenloop ATS",
    version: "2.0.0",
    enabled: true,
    permissions: ["READ_COMPANY_DATA", "WRITE_JOB"],
    icon: "Briefcase",
  },
  {
    id: "hr_candidate_analyzer",
    name: "Multi-Factor Applicant Matrix Analyzer",
    description: "Performs deep multi-variable candidate scoring, skill gap detection, and red flag warnings.",
    targetRole: "hr",
    category: "Screening",
    author: "Screenloop AI Core",
    version: "2.5.0",
    enabled: true,
    permissions: ["READ_COMPANY_DATA", "READ_APPLICATIONS", "READ_CV", "WRITE_ANALYSIS"],
    icon: "Users",
  },
  {
    id: "hr_interview_assistant",
    name: "Interview Rubric & Red-Flag Generator",
    description: "Prepares role-specific interview rubrics, expected strong answers, and specific Pakistani recruiter red flag indicators.",
    targetRole: "hr",
    category: "Interviews",
    author: "HiringPro Labs",
    version: "1.8.0",
    enabled: true,
    permissions: ["READ_COMPANY_DATA", "READ_APPLICATIONS"],
    icon: "CalendarCheck",
  },
  {
    id: "hr_talent_needs",
    name: "Macro Talent Supply & Regional Demand Radar",
    description: "Analyzes company talent pipeline velocity vs open positions across Pakistani tech hubs.",
    targetRole: "hr",
    category: "Analytics",
    author: "Pakistan IT Board",
    version: "1.4.0",
    enabled: true,
    permissions: ["READ_COMPANY_DATA", "READ_ANALYTICS"],
    icon: "BarChart3",
  },
  // Admin Plugins
  {
    id: "admin_platform_analytics",
    name: "Enterprise KPI & Funnel Telemetry",
    description: "Monitors cross-company aggregate hiring volume, applicant velocity, and regional tech sector growth.",
    targetRole: "admin",
    category: "Platform Intelligence",
    author: "Screenloop Analytics",
    version: "3.2.0",
    enabled: true,
    permissions: ["READ_ANALYTICS"],
    icon: "Sparkles",
  },
  {
    id: "admin_security_monitor",
    name: "Brute-Force & IDOR Defense Sentinel",
    description: "Tracks anomalous API requests, cross-company access violations, and session integrity breaches.",
    targetRole: "admin",
    category: "Cybersecurity",
    author: "CyberGuard PK",
    version: "4.0.1",
    enabled: true,
    permissions: ["READ_ANALYTICS"],
    icon: "ShieldAlert",
  },
  {
    id: "admin_company_verifier",
    name: "SECP & PSX Enterprise Verification Tool",
    description: "Validates Pakistani employer legal registrations, PSX ticker details, and corporate domains.",
    targetRole: "admin",
    category: "Compliance",
    author: "GovTech Pakistan",
    version: "1.1.0",
    enabled: true,
    permissions: ["READ_COMPANY_DATA", "READ_ANALYTICS"],
    icon: "Building2",
  },
];

// ============================================================================
// 7. SEED INTEGRATIONS (Third-party Ecosystem Connectors)
// ============================================================================
export const SEED_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "int_smtp",
    name: "Transactional Email Gateway",
    category: "Email",
    description: "Delivers automated interview invites, application status alerts, and candidate rejection letters via SMTP or SendGrid.",
    status: "Connected",
    icon: "Mail",
    targetRole: "all",
    lastSync: NOW - 1000 * 60 * 30,
    configFields: [
      { key: "smtp_host", label: "SMTP Host", value: "smtp.screenloop.pk", isSecret: false },
      { key: "smtp_port", label: "Port", value: "587", isSecret: false },
      { key: "api_key", label: "API Secret Key", value: "vault:sendgrid_prod_v2", isSecret: true },
    ],
  },
  {
    id: "int_sms",
    name: "Pakistani Telco SMS Gateway",
    category: "SMS",
    description: "Dispatches instant interview reminder SMS alerts to candidate phones via Jazz, Telenor, and Zong SMS APIs.",
    status: "Connected",
    icon: "MessageSquare",
    targetRole: "hr",
    lastSync: NOW - 1000 * 60 * 90,
    configFields: [
      { key: "sender_id", label: "Branded Masking ID", value: "SCREENLOOP", isSecret: false },
      { key: "sms_token", label: "Telco Gateway Token", value: "vault:telco_gateway_v1", isSecret: true },
    ],
  },
  {
    id: "int_whatsapp",
    name: "WhatsApp Business Hiring Alerts",
    category: "Messaging",
    description: "Permits recruiters to dispatch automated WhatsApp interview schedules and candidate confirmations.",
    status: "Needs Setup",
    icon: "PhoneCall",
    targetRole: "hr",
    configFields: [
      { key: "wa_phone", label: "Business WhatsApp Number", value: "+92 300 0000000", isSecret: false },
      { key: "wa_token", label: "Meta Graph API Token", value: "", isSecret: true },
    ],
  },
  {
    id: "int_google_meet",
    name: "Google Meet & Calendar Sync",
    category: "Calendar & Video",
    description: "Automatically generates 1-click video call links and creates calendar invites for candidate interviews.",
    status: "Connected",
    icon: "Video",
    targetRole: "hr",
    lastSync: NOW - 1000 * 60 * 15,
    configFields: [
      { key: "client_id", label: "Google OAuth Client ID", value: "99102-screenloop.apps.googleusercontent.com", isSecret: false },
    ],
  },
  {
    id: "int_s3",
    name: "Cloud Storage CV Vault (AWS S3)",
    category: "Storage",
    description: "Stores encrypted PDF resumes with private pre-signed URLs to protect candidate data from public leaks.",
    status: "Connected",
    icon: "HardDrive",
    targetRole: "admin",
    lastSync: NOW - 1000 * 60 * 5,
    configFields: [
      { key: "bucket_name", label: "S3 Bucket Name", value: "screenloop-pk-cv-vault-prod", isSecret: false },
      { key: "region", label: "AWS Region", value: "me-south-1", isSecret: false },
    ],
  },
  {
    id: "int_webhooks",
    name: "Hiring Webhooks & Slack Alerts",
    category: "Webhooks",
    description: "Emits real-time event webhooks for new applications, offer acceptances, and audit alerts.",
    status: "Needs Setup",
    icon: "Webhook",
    targetRole: "admin",
    configFields: [
      { key: "webhook_url", label: "Target Webhook URL", value: "https://hooks.slack.com/services/T00/B00/X00", isSecret: false },
    ],
  },
];

// ============================================================================
// 8. DEFAULT CANDIDATE PRIVACY SETTINGS
// ============================================================================
export const DEFAULT_PRIVACY_SETTINGS: CandidatePrivacySettings = {
  profileVisibility: "verified_only",
  allowAiProcessing: true,
  jobAlerts: true,
  dataRetentionDays: 365,
};

// Storage Keys
const STORAGE_KEY_AUTH = "screenloop_pk_auth_v5";
const STORAGE_KEY_USERS = "screenloop_pk_users_v4";
const STORAGE_KEY_CURRENT_USER = "screenloop_pk_current_user_v4";
const STORAGE_KEY_COMPANIES = "screenloop_pk_companies_v4";
const STORAGE_KEY_JOBS = "screenloop_pk_jobs_v4";
const STORAGE_KEY_CANDIDATES = "screenloop_pk_candidates_v4";
const STORAGE_KEY_AUDIT_LOGS = "screenloop_pk_audit_logs_v4";
const STORAGE_KEY_PLUGINS = "screenloop_pk_plugins_v4";
const STORAGE_KEY_INTEGRATIONS = "screenloop_pk_integrations_v4";
const STORAGE_KEY_PRIVACY = "screenloop_pk_privacy_v4";

// RBAC Authorization Guard Helper
export function canUserAccessTab(role: UserRole, tab: string): boolean {
  if (role === "admin") return true; // Super admin has universal access

  const candidateTabs = new Set([
    "overview",
    "jobs",
    "my-cv",
    "applications",
    "saved-jobs",
    "interviews",
    "salary-guide",
    "career-assistant",
    "plugins",
    "privacy-center",
  ]);

  const hrTabs = new Set([
    "kanban",
    "applicants",
    "jobs",
    "interviews",
    "company-needs",
    "hr-assistant",
    "hr-team",
    "plugins",
    "integrations",
  ]);

  const companyTabs = new Set([
    "company-workspace",
    "jobs",
    "kanban",
    "applicants",
    "interviews",
    "hr-team",
    "company-needs",
    "integrations",
    "plugins",
  ]);

  if (role === "candidate") return candidateTabs.has(tab);
  if (role === "hr") return hrTabs.has(tab);
  if (role === "company") return companyTabs.has(tab);

  return false;
}

interface AtsContextType {
  // Authentication & Users
  isAuthenticated: boolean;
  currentUser: UserAccount;
  users: UserAccount[];
  switchUser: (userId: string) => void;
  secureSwitchUser: (userId: string, passwordInput: string) => boolean;
  switchRole: (role: UserRole) => void;
  loginWithIdentifier: (identifier: string, password?: string, rememberMe?: boolean) => boolean;
  login: (identifier: string, password?: string, rememberMe?: boolean) => boolean;
  logout: () => void;
  resetUserPassword: (userId: string, newPassword?: string) => void;
  canUserAccessTab: (role: UserRole, tab: string) => boolean;
  register: (user: Omit<UserAccount, "id" | "active" | "savedJobIds">) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  updateCandidateProfile: (updates: Partial<UserAccount>) => void;

  // Companies
  companies: Company[];
  approveCompany: (id: string) => void;
  rejectCompany: (id: string) => void;
  verifyCompany: (id: string) => void;
  registerCompany: (comp: Omit<Company, "id" | "verified" | "status">) => Company;
  updateCompanyProfile: (companyId: string, updates: Partial<Company>) => void;
  getCompanyTeam: (companyId?: string) => UserAccount[];
  inviteTeamMember: (member: { name: string; username: string; email: string; role: "hr"; companyRole: "HR Admin" | "Recruiter" | "Hiring Manager"; department: string }) => void;
  removeTeamMember: (userId: string) => void;

  // Jobs
  jobs: Job[];
  activeJobs: Job[];
  isolatedJobs: Job[];
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  createJob: (jobInput: Omit<Job, "id" | "createdAt">) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  archiveJob: (id: string) => void;
  restoreJob: (id: string) => void;
  closeJob: (id: string) => void;

  // Candidates & Applications
  candidates: Candidate[];
  candidateApplications: Candidate[];
  isolatedCandidates: Candidate[];
  isolatedInterviews: { candidate: Candidate; interview: InterviewSchedule; job?: Job | undefined }[];
  savedJobs: Job[];
  toggleSaveJob: (jobId: string) => void;
  submitApplication: (input: {
    jobId: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    location: string;
    portfolioUrl?: string | undefined;
    githubUrl?: string | undefined;
    linkedinUrl?: string | undefined;
    resumeFileName?: string | undefined;
    resumeText: string;
    coverLetter?: string | undefined;
    expectedSalaryPKR?: number | undefined;
  }) => Candidate;
  withdrawApplication: (id: string) => void;
  moveCandidate: (id: string, stage: Stage, note?: string) => void;
  screenCandidateById: (id: string) => void;
  screenAll: (jobId?: string) => number;
  setNote: (id: string, note: string) => void;
  scheduleInterview: (candidateId: string, interview: Omit<InterviewSchedule, "id">) => void;
  triggerScreening: (ids: string[]) => void;

  // Security Audit Logs
  auditLogs: AuditLogItem[];
  logAuditEvent: (event: Omit<AuditLogItem, "id" | "timestamp">) => void;
  clearAuditLogs: () => void;

  // Plugins & Integrations
  plugins: AtsPlugin[];
  togglePlugin: (pluginId: string) => void;
  integrations: IntegrationItem[];
  updateIntegrationStatus: (id: string, status: "Connected" | "Not Connected" | "Needs Setup", config?: Record<string, string>) => void;

  // Candidate Privacy Center
  privacySettings: CandidatePrivacySettings;
  updatePrivacySettings: (settings: Partial<CandidatePrivacySettings>) => void;
  downloadCandidateData: (username?: string) => void;
  requestAccountDeletion: () => void;

  // Baseline restoration
  restorePlatformDefaults: () => void;
}

const AtsContext = createContext<AtsContextType | null>(null);

export function AtsProvider({ children }: { children: ReactNode }) {
  // 0. High Security Authentication Session (Strict zero auto-login: user must sign in manually with username and password)
  // Priority 1: Check active session in sessionStorage (Strict zero auto-login)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Brute force protection / rate limiting state
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (!isAuthenticated) {
          if (window.sessionStorage) {
            sessionStorage.removeItem("ats_session_active");
            sessionStorage.removeItem("ats_session_user_id");
          }
          if (window.localStorage) {
            localStorage.removeItem("ats_session_remember");
            localStorage.removeItem(STORAGE_KEY_AUTH);
          }
        }
      } catch (e) {
        console.error("Failed to sync auth state", e);
      }
    }
  }, [isAuthenticated]);

  // 1. Users
  const [users, setUsers] = useState<UserAccount[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USERS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load users from localStorage", e);
      }
    }
    return SEED_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    return SEED_USERS[0]!;
  });

  // 2. Companies
  const [companies, setCompanies] = useState<Company[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_COMPANIES);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load companies from localStorage", e);
      }
    }
    return SEED_COMPANIES;
  });

  // 3. Jobs
  const [jobs, setJobs] = useState<Job[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_JOBS);
        if (stored) {
          const parsed: Job[] = JSON.parse(stored);
          return parsed.map((j) =>
            isJobExpired(j.deadline) && j.status === "active"
              ? { ...j, status: "closed" }
              : j
          );
        }
      } catch (e) {
        console.error("Failed to load jobs from localStorage", e);
      }
    }
    return SEED_JOBS;
  });

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // 4. Candidates / Applications
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CANDIDATES);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load candidates from localStorage", e);
      }
    }
    return SEED_CANDIDATES;
  });

  // 5. Security Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load audit logs", e);
      }
    }
    return SEED_AUDIT_LOGS;
  });

  // 6. Plugins
  const [plugins, setPlugins] = useState<AtsPlugin[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_PLUGINS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load plugins", e);
      }
    }
    return SEED_PLUGINS;
  });

  // 7. Integrations
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_INTEGRATIONS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load integrations", e);
      }
    }
    return SEED_INTEGRATIONS;
  });

  // 8. Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<CandidatePrivacySettings>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_PRIVACY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load privacy settings", e);
      }
    }
    return DEFAULT_PRIVACY_SETTINGS;
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users", e);
    }
  }, [users]);

  useEffect(() => {
    try {
      // Security: Strip password before serializing active user to localStorage
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeCurrentUser } = currentUser;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(safeCurrentUser));
    } catch (e) {
      console.error("Failed to save current user", e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    } catch (e) {
      console.error("Failed to save companies", e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error("Failed to save jobs", e);
    }
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
    } catch (e) {
      console.error("Failed to save candidates", e);
    }
  }, [candidates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error("Failed to save audit logs", e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLUGINS, JSON.stringify(plugins));
    } catch (e) {
      console.error("Failed to save plugins", e);
    }
  }, [plugins]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INTEGRATIONS, JSON.stringify(integrations));
    } catch (e) {
      console.error("Failed to save integrations", e);
    }
  }, [integrations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(privacySettings));
    } catch (e) {
      console.error("Failed to save privacy settings", e);
    }
  }, [privacySettings]);

  // Logging Helper
  const logAuditEvent = useCallback((event: Omit<AuditLogItem, "id" | "timestamp">) => {
    const newLog: AuditLogItem = {
      ...event,
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  }, []);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
    toast.success("Audit logs cleared");
  }, []);

  // Multi-Tenant Isolated Getters
  const isolatedJobs = useMemo(() => {
    if (currentUser.role === "candidate") {
      return jobs.filter((j) => j.status === "active");
    }
    if (currentUser.role === "hr" || currentUser.role === "company") {
      return jobs.filter(
        (j) =>
          (currentUser.companyId && j.companyId === currentUser.companyId) ||
          (currentUser.company && j.company.toLowerCase() === currentUser.company.toLowerCase())
      );
    }
    return jobs; // Admin sees all
  }, [jobs, currentUser]);

  const isolatedCandidates = useMemo(() => {
    if (currentUser.role === "candidate") {
      return candidates.filter(
        (c) =>
          !c.withdrawn &&
          (c.userId === currentUser.id ||
            c.username === currentUser.username ||
            c.email.toLowerCase() === currentUser.email.toLowerCase())
      );
    }
    if (currentUser.role === "hr" || currentUser.role === "company") {
      const companyJobIds = new Set(isolatedJobs.map((j) => j.id));
      return candidates.filter(
        (c) =>
          (currentUser.companyId && c.companyId === currentUser.companyId) ||
          companyJobIds.has(c.jobId)
      );
    }
    return candidates; // Admin sees all
  }, [candidates, currentUser, isolatedJobs]);

  const isolatedInterviews = useMemo(() => {
    const list: { candidate: Candidate; interview: InterviewSchedule; job?: Job | undefined }[] = [];
    isolatedCandidates.forEach((c) => {
      const job = jobs.find((j) => j.id === c.jobId);
      c.interviews.forEach((int) => {
        list.push({ candidate: c, interview: int, job });
      });
    });
    return list;
  }, [isolatedCandidates, jobs]);

  // High Security Authentication Methods
  const secureSwitchUser = useCallback(
    (userId: string, passwordInput: string): boolean => {
      const found = users.find((u) => u.id === userId);
      if (!found) {
        toast.error("Account not found");
        return false;
      }
      const expectedPassword = found.password || DEFAULT_RBAC_KEY;
      if (!passwordInput || passwordInput.trim() !== expectedPassword) {
        logAuditEvent({
          userId: currentUser.id,
          username: currentUser.username,
          role: currentUser.role,
          action: "UNAUTHORIZED_ACCESS_BLOCKED",
          resource: `/auth/switch/${found.username}`,
          details: `Security alert: Unauthorized account switch attempt blocked. Incorrect password for '@${found.username}'`,
          severity: "critical",
          ip: "127.0.0.1",
        });
        toast.error("Authentication Denied", {
          description: "Incorrect password for the target account. Session switch blocked.",
        });
        return false;
      }

      setCurrentUser(found);
      setIsAuthenticated(true);
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("ats_session_active", "true");
        sessionStorage.setItem("ats_session_user_id", found.id);
      }
      logAuditEvent({
        userId: found.id,
        username: found.username,
        role: found.role,
        action: "LOGIN",
        resource: "/auth/switch",
        details: `Authenticated account switch to ${found.name} (${found.role.toUpperCase()})`,
        severity: "info",
        ip: "127.0.0.1",
      });
      toast.success(`Switched active user to ${found.name} (@${found.username})`);
      return true;
    },
    [users, currentUser, logAuditEvent]
  );

  const switchUser = useCallback(
    (userId: string) => {
      const found = users.find((u) => u.id === userId);
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.setItem("ats_session_active", "true");
          sessionStorage.setItem("ats_session_user_id", found.id);
        }
      }
    },
    [users]
  );

  const switchRole = useCallback(
    (role: UserRole) => {
      const found = users.find((u) => u.role === role);
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.setItem("ats_session_active", "true");
          sessionStorage.setItem("ats_session_user_id", found.id);
        }
      }
    },
    [users]
  );

  const loginWithIdentifier = useCallback(
    (identifier: string, password?: string, rememberMe = false): boolean => {
      // 1. Check Brute-Force Rate Limiting Lockout
      if (Date.now() < lockoutUntil) {
        const remainingSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
        toast.error("Access Temporarily Locked", {
          description: `Too many consecutive failed attempts. System locked for ${remainingSec}s.`,
        });
        return false;
      }

      const term = identifier.trim().toLowerCase();
      if (!term) {
        toast.error("Username or Email Required", {
          description: "Please enter your registered handle or email address.",
        });
        return false;
      }

      if (!password || !password.trim()) {
        toast.error("Password Required", {
          description: "Please enter your account password to sign in.",
        });
        return false;
      }

      // 2. Lookup user in registry
      const found = users.find(
        (u) =>
          u.username.toLowerCase() === term ||
          u.email.toLowerCase() === term ||
          (term === "admin" && u.role === "admin")
      );

      if (!found) {
        setFailedAttempts((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            setLockoutUntil(Date.now() + 60000);
            logAuditEvent({
              userId: "unknown",
              username: identifier,
              role: "candidate",
              action: "BRUTE_FORCE_LOCKOUT",
              resource: "/auth/login",
              details: `Brute force alert: 5 consecutive failed login attempts on '${identifier}'. IP locked for 60s.`,
              severity: "critical",
              ip: "127.0.0.1",
            });
            toast.error("Brute Force Protection Active", {
              description: "5 consecutive failed attempts. Locked for 60 seconds.",
            });
          }
          return next;
        });

        logAuditEvent({
          userId: "unknown",
          username: identifier,
          role: "candidate",
          action: "FAILED_LOGIN",
          resource: "/auth/login",
          details: `Authentication failed: Account identifier '${identifier}' does not exist.`,
          severity: "warning",
          ip: "127.0.0.1",
        });

        toast.error("Invalid Credentials", {
          description: "Username, email, or password is incorrect.",
        });
        return false;
      }

      // 3. Check account suspension
      if (found.active === false) {
        logAuditEvent({
          userId: found.id,
          username: found.username,
          role: found.role,
          action: "FAILED_LOGIN",
          resource: "/auth/login",
          details: `Access denied: Account '@${found.username}' is suspended by an Administrator.`,
          severity: "critical",
          ip: "127.0.0.1",
        });
        toast.error("Account Suspended", {
          description: "This account has been deactivated by a System Administrator.",
        });
        return false;
      }

      // 4. Strict Password Matching
      const expectedPassword = found.password || DEFAULT_RBAC_KEY;
      if (password !== expectedPassword) {
        setFailedAttempts((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            setLockoutUntil(Date.now() + 60000);
            logAuditEvent({
              userId: found.id,
              username: found.username,
              role: found.role,
              action: "BRUTE_FORCE_LOCKOUT",
              resource: "/auth/login",
              details: `Security alert: 5 failed password attempts on account '@${found.username}'. Locked for 60s.`,
              severity: "critical",
              ip: "127.0.0.1",
            });
            toast.error("Brute Force Protection Active", {
              description: "5 consecutive failed attempts. Account locked for 60 seconds.",
            });
          }
          return next;
        });

        logAuditEvent({
          userId: found.id,
          username: found.username,
          role: found.role,
          action: "FAILED_LOGIN",
          resource: "/auth/login",
          details: `Security Alert: Invalid password entered for account '@${found.username}' (${found.role.toUpperCase()}).`,
          severity: "warning",
          ip: "127.0.0.1",
        });

        toast.error("Invalid Credentials", {
          description: "Username, email, or password is incorrect.",
        });
        return false;
      }

      // 5. Successful Authenticated Login
      setFailedAttempts(0);
      setLockoutUntil(0);
      setCurrentUser(found);
      setIsAuthenticated(true);

      if (typeof window !== "undefined") {
        try {
          if (window.sessionStorage) {
            sessionStorage.setItem("ats_session_active", "true");
            sessionStorage.setItem("ats_session_user_id", found.id);
          }
          if (window.localStorage) {
            localStorage.removeItem("ats_session_remember");
            localStorage.removeItem(STORAGE_KEY_AUTH);
          }
        } catch (e) {
          console.error("Storage write error during login", e);
        }
      }

      logAuditEvent({
        userId: found.id,
        username: found.username,
        role: found.role,
        action: "LOGIN",
        resource: "/auth/login",
        details: `Successful authenticated login for '${found.name}' as ${found.role.toUpperCase()}`,
        severity: "info",
        ip: "127.0.0.1",
      });

      toast.success(`Welcome, ${found.name}!`, {
        description: `Verified login as ${found.role.toUpperCase()} • ${found.title}`,
      });

      return true;
    },
    [users, lockoutUntil, logAuditEvent]
  );

  const logout = useCallback(() => {
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "LOGOUT",
      resource: "/auth/logout",
      details: `Session securely terminated for user '${currentUser.username}' (${currentUser.role})`,
      severity: "info",
      ip: "127.0.0.1",
    });

    setIsAuthenticated(false);

    if (typeof window !== "undefined") {
      try {
        if (window.sessionStorage) {
          sessionStorage.removeItem("ats_session_active");
          sessionStorage.removeItem("ats_session_user_id");
        }
        if (window.localStorage) {
          localStorage.removeItem("ats_session_remember");
          localStorage.removeItem(STORAGE_KEY_AUTH);
          localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        }
      } catch (e) {
        console.error("Storage error during logout", e);
      }
    }

    toast.info("Signed out securely", {
      description: "Your session has been terminated. You must sign in to continue.",
    });
  }, [currentUser, logAuditEvent]);

  const resetUserPassword = useCallback(
    (userId: string, newPassword = DEFAULT_RBAC_KEY) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u))
      );
      logAuditEvent({
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        action: "PASSWORD_CHANGE",
        resource: `User #${userId}`,
        details: `Password reset performed by ${currentUser.username} (${currentUser.role.toUpperCase()})`,
        severity: "info",
        ip: "127.0.0.1",
      });
      toast.success("User password has been reset successfully");
    },
    [currentUser, logAuditEvent]
  );

  const register = useCallback(
    (userInput: Omit<UserAccount, "id" | "active" | "savedJobIds">) => {
      const newUser: UserAccount = {
        ...userInput,
        id: `u_${Date.now()}`,
        savedJobIds: [],
        active: true,
        password: userInput.password || DEFAULT_RBAC_KEY,
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("ats_session_active", "true");
        sessionStorage.setItem("ats_session_user_id", newUser.id);
      }
      logAuditEvent({
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role,
        action: "PROFILE_UPDATE",
        resource: "/auth/register",
        details: `New account registered: @${newUser.username} as ${newUser.role}`,
        severity: "info",
        ip: "127.0.0.1",
      });
      toast.success(`Account created! Welcome to Screenloop ATS, ${newUser.name}.`);
    },
    [logAuditEvent]
  );

  const updateUserRole = useCallback((userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role }));
    }
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "ADMIN_ACTION",
      resource: `User #${userId}`,
      details: `User role updated to ${role.toUpperCase()}`,
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success(`Updated role to ${role.toUpperCase()}`);
  }, [currentUser, logAuditEvent]);

  const toggleUserStatus = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
    toast.success("User active status updated");
  }, []);

  const updateCandidateProfile = useCallback((updates: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
    );
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "PROFILE_UPDATE",
      resource: `Profile #${currentUser.id}`,
      details: "Candidate updated personal profile details",
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success("Profile updated successfully");
  }, [currentUser, logAuditEvent]);

  // Company management
  const approveCompany = useCallback((id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c))
    );
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "COMPANY_APPROVED",
      resource: `Company #${id}`,
      details: "Company registration approved by Administrator",
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success("Company registration approved");
  }, [currentUser, logAuditEvent]);

  const rejectCompany = useCallback((id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "rejected" as const } : c))
    );
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "COMPANY_REJECTED",
      resource: `Company #${id}`,
      details: "Company registration rejected by Administrator",
      severity: "warning",
      ip: "127.0.0.1",
    });
    toast.success("Company registration rejected");
  }, [currentUser, logAuditEvent]);

  const verifyCompany = useCallback((id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, verified: !c.verified } : c))
    );
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "COMPANY_VERIFIED",
      resource: `Company #${id}`,
      details: "Company verified status toggled",
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success("Company verification toggled");
  }, [currentUser, logAuditEvent]);

  const registerCompany = useCallback((compInput: Omit<Company, "id" | "verified" | "status">): Company => {
    const newComp: Company = {
      ...compInput,
      id: `comp_${Date.now()}`,
      verified: false,
      status: "approved",
    };
    setCompanies((prev) => [...prev, newComp]);
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "COMPANY_REGISTERED",
      resource: `Company #${newComp.id}`,
      details: `New company registered: '${newComp.name}' (${newComp.city})`,
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success(`Company '${newComp.name}' registered successfully!`);
    return newComp;
  }, [currentUser, logAuditEvent]);

  const updateCompanyProfile = useCallback((companyId: string, updates: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, ...updates } : c))
    );
    toast.success("Company profile updated successfully");
  }, []);

  const getCompanyTeam = useCallback(
    (companyId?: string) => {
      const cId = companyId || currentUser.companyId;
      return users.filter(
        (u) =>
          (u.role === "hr" || u.role === "company") &&
          ((cId && u.companyId === cId) ||
            (u.company && currentUser.company && u.company.toLowerCase() === currentUser.company.toLowerCase()))
      );
    },
    [users, currentUser]
  );

  const inviteTeamMember = useCallback(
    (member: { name: string; username: string; email: string; role: "hr"; companyRole: "HR Admin" | "Recruiter" | "Hiring Manager"; department: string }) => {
      const newUser: UserAccount = {
        id: `u_rec_${Date.now()}`,
        username: member.username,
        name: member.name,
        email: member.email,
        role: "hr",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        title: `${member.companyRole} (${member.department})`,
        company: currentUser.company || "Enterprise Partner",
        companyId: currentUser.companyId || "comp_systems",
        companyRole: member.companyRole,
        assignedDepartments: [member.department],
        permissions: ["View Applicants", "Shortlist Candidates", "Schedule Interviews"],
        city: currentUser.city || "Lahore",
        phone: "+92 300 0000000",
        bio: `Recruitment team member at ${currentUser.company}.`,
        savedJobIds: [],
        active: true,
      };
      setUsers((prev) => [...prev, newUser]);
      logAuditEvent({
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        action: "ADMIN_ACTION",
        resource: `Team Member #${newUser.username}`,
        details: `Invited ${newUser.name} as ${newUser.companyRole} for ${currentUser.company}`,
        severity: "info",
        ip: "127.0.0.1",
      });
      toast.success(`Recruiter ${member.name} invited successfully!`);
    },
    [currentUser, logAuditEvent]
  );

  const removeTeamMember = useCallback(
    (userId: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Team member removed from workspace");
    },
    []
  );

  // Jobs
  const activeJobs = useMemo(() => jobs.filter((j) => j.status === "active"), [jobs]);

  const createJob = useCallback((jobInput: Omit<Job, "id" | "createdAt">): Job => {
    const compMatch = companies.find((c) => c.name.toLowerCase() === jobInput.company.toLowerCase());
    const newJob: Job = {
      ...jobInput,
      id: `job_${Date.now()}`,
      companyId: compMatch?.id || currentUser.companyId || "comp_systems",
      createdAt: Date.now(),
    };
    setJobs((prev) => [newJob, ...prev]);
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "JOB_CREATED",
      resource: `Job #${newJob.id}`,
      details: `New requisition created: '${newJob.title}' by ${currentUser.name}`,
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success(`Requisition "${newJob.title}" published successfully!`);
    return newJob;
  }, [companies, currentUser, logAuditEvent]);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "JOB_UPDATED",
      resource: `Job #${id}`,
      details: "Job details updated",
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success("Job updated successfully");
  }, [currentUser, logAuditEvent]);

  const archiveJob = useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "archived" as const } : j))
    );
    toast.success("Job archived");
  }, []);

  const restoreJob = useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "active" as const } : j))
    );
    toast.success("Job restored to active listings");
  }, []);

  const closeJob = useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "closed" as const } : j))
    );
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "JOB_CLOSED",
      resource: `Job #${id}`,
      details: "Job closed to further applications",
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success("Job closed to further applications");
  }, [currentUser, logAuditEvent]);

  // Saved Jobs
  const savedJobs = useMemo(() => {
    const ids = new Set(currentUser.savedJobIds || []);
    return jobs.filter((j) => ids.has(j.id));
  }, [jobs, currentUser.savedJobIds]);

  const toggleSaveJob = useCallback((jobId: string) => {
    const currentSaved = new Set(currentUser.savedJobIds || []);
    const isSaved = currentSaved.has(jobId);
    if (isSaved) {
      currentSaved.delete(jobId);
      toast.info("Removed from saved roles");
    } else {
      currentSaved.add(jobId);
      toast.success("Role bookmarked successfully");
    }
    const updatedIds = Array.from(currentSaved);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, savedJobIds: updatedIds } : u))
    );
    setCurrentUser((prev) => ({ ...prev, savedJobIds: updatedIds }));
  }, [currentUser]);

  // Candidate applications & pipeline
  const submitApplication = useCallback((input: {
    jobId: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    location: string;
    portfolioUrl?: string | undefined;
    githubUrl?: string | undefined;
    linkedinUrl?: string | undefined;
    resumeFileName?: string | undefined;
    resumeText: string;
    coverLetter?: string | undefined;
    expectedSalaryPKR?: number | undefined;
  }): Candidate => {
    const targetJob = jobs.find((j) => j.id === input.jobId) ?? jobs[0]!;
    if (isJobExpired(targetJob.deadline) || targetJob.status === "closed") {
      toast.error("Application closed", {
        description: "This position's application deadline has passed and is no longer accepting submissions.",
      });
      throw new Error("Job application deadline has passed");
    }

    const newCandidate: Candidate = {
      id: `cand_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      jobId: input.jobId,
      companyId: targetJob.companyId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      city: input.city,
      location: input.location,
      portfolioUrl: input.portfolioUrl,
      githubUrl: input.githubUrl,
      linkedinUrl: input.linkedinUrl,
      resumeFileName: input.resumeFileName || `${input.name.replace(/\s+/g, "_")}_CV.pdf`,
      resumeFileType: "application/pdf",
      resumeText: input.resumeText,
      coverLetter: input.coverLetter,
      stage: "Applied",
      appliedAt: Date.now(),
      updatedAt: Date.now(),
      manualStage: false,
      withdrawn: false,
      expectedSalaryPKR: input.expectedSalaryPKR,
      notes: "",
      interviews: [],
      history: [
        {
          stage: "Applied",
          timestamp: Date.now(),
          note: "Application submitted via candidate portal.",
          updatedBy: input.name,
        },
      ],
      triggers: [],
    };

    newCandidate.screening = screenCandidate(newCandidate, targetJob);
    newCandidate.cvScore = newCandidate.screening.matchScore;
    newCandidate.stage = autoStage(newCandidate.screening.result);

    setCandidates((prev) => [newCandidate, ...prev]);

    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: "candidate",
      action: "APPLICATION_SUBMITTED",
      resource: `Job #${targetJob.id} (${targetJob.title})`,
      details: `Application submitted by ${input.name} (${input.email}) - Score: ${newCandidate.cvScore}%`,
      severity: "info",
      ip: "127.0.0.1",
    });

    toast.success(`Application submitted to ${targetJob.company}!`, {
      description: `AI ATS Match Score: ${newCandidate.cvScore}%`,
    });

    return newCandidate;
  }, [jobs, currentUser, logAuditEvent]);

  const withdrawApplication = useCallback((id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, withdrawn: true } : c))
    );
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "APPLICATION_WITHDRAWN",
      resource: `Application #${id}`,
      details: "Candidate withdrew application voluntarily",
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.info("Application withdrawn successfully");
  }, [currentUser, logAuditEvent]);

  const moveCandidate = useCallback((id: string, stage: Stage, note?: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const historyItem = {
          stage,
          timestamp: Date.now(),
          note: note || `Stage updated to ${stage}`,
          updatedBy: currentUser.name,
        };
        return {
          ...c,
          stage,
          manualStage: true,
          history: [...c.history, historyItem],
          updatedAt: Date.now(),
        };
      })
    );
    logAuditEvent({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: "STAGE_CHANGE",
      resource: `Candidate #${id}`,
      details: `Candidate progressed to stage '${stage}' by ${currentUser.name}`,
      severity: "info",
      ip: "127.0.0.1",
    });
    toast.success(`Moved candidate to ${stage}`);
  }, [currentUser, logAuditEvent]);

  const screenCandidateById = useCallback((id: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const targetJob = jobs.find((j) => j.id === c.jobId) ?? jobs[0]!;
        const screening = screenCandidate(c, targetJob);
        return {
          ...c,
          screening,
          cvScore: screening.matchScore,
          stage: c.manualStage ? c.stage : autoStage(screening.result),
          updatedAt: Date.now(),
        };
      })
    );
    toast.success("AI screening re-evaluated");
  }, [jobs]);

  const screenAll = useCallback((jobId?: string): number => {
    let count = 0;
    setCandidates((prev) =>
      prev.map((c) => {
        if (jobId && c.jobId !== jobId) return c;
        const targetJob = jobs.find((j) => j.id === c.jobId) ?? jobs[0]!;
        const screening = screenCandidate(c, targetJob);
        count++;
        return {
          ...c,
          screening,
          cvScore: screening.matchScore,
          stage: c.manualStage ? c.stage : autoStage(screening.result),
          updatedAt: Date.now(),
        };
      })
    );
    toast.success(`Screened ${count} candidate(s) successfully`);
    return count;
  }, [jobs]);

  const setNote = useCallback((id: string, note: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: note, updatedAt: Date.now() } : c))
    );
    toast.success("Recruiter note saved");
  }, []);

  const scheduleInterview = useCallback(
    (candidateId: string, interviewInput: Omit<InterviewSchedule, "id">) => {
      const newInterview: InterviewSchedule = {
        ...interviewInput,
        id: `int_${Date.now()}`,
      };

      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c;
          const historyItem = {
            stage: "Interview" as Stage,
            timestamp: Date.now(),
            note: `Interview scheduled: ${interviewInput.type} with ${interviewInput.interviewer} on ${interviewInput.date}`,
            updatedBy: currentUser.name,
          };
          return {
            ...c,
            stage: "Interview",
            manualStage: true,
            interviews: [...c.interviews, newInterview],
            history: [...c.history, historyItem],
            updatedAt: Date.now(),
          };
        })
      );
      logAuditEvent({
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        action: "INTERVIEW_SCHEDULED",
        resource: `Candidate #${candidateId}`,
        details: `${interviewInput.type} interview booked on ${interviewInput.date} at ${interviewInput.time}`,
        severity: "info",
        ip: "127.0.0.1",
      });
      toast.success("Interview scheduled successfully!", {
        description: `${interviewInput.type} on ${interviewInput.date} at ${interviewInput.time}`,
      });
    },
    [currentUser, logAuditEvent]
  );

  const triggerScreening = useCallback((ids: string[]) => {
    const at = Date.now();
    setCandidates((prev) =>
      prev.map((c) =>
        ids.includes(c.id)
          ? {
              ...c,
              triggers: [
                ...c.triggers,
                {
                  at,
                  message: `Screening invitation dispatched to ${c.name} (${c.email})`,
                },
              ],
              updatedAt: at,
            }
          : c
      )
    );
    toast.success(`Screening simulated for ${ids.length} applicant(s)`);
  }, []);

  // Plugins & Integrations controls
  const togglePlugin = useCallback((pluginId: string) => {
    setPlugins((prev) =>
      prev.map((p) => {
        if (p.id === pluginId) {
          const nextState = !p.enabled;
          toast.success(`Plugin '${p.name}' ${nextState ? "Enabled" : "Disabled"}`);
          return { ...p, enabled: nextState };
        }
        return p;
      })
    );
  }, []);

  const updateIntegrationStatus = useCallback(
    (id: string, status: "Connected" | "Not Connected" | "Needs Setup", config?: Record<string, string>) => {
      setIntegrations((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const updatedFields = config
              ? item.configFields.map((f) => (config[f.key] !== undefined ? { ...f, value: config[f.key]! } : f))
              : item.configFields;
            return { ...item, status, lastSync: Date.now(), configFields: updatedFields };
          }
          return item;
        })
      );
      toast.success("Integration settings saved");
    },
    []
  );

  // Privacy Center Methods
  const updatePrivacySettings = useCallback((settings: Partial<CandidatePrivacySettings>) => {
    setPrivacySettings((prev) => ({ ...prev, ...settings }));
    toast.success("Privacy preferences updated");
  }, []);

  const downloadCandidateData = useCallback((username?: string) => {
    const u = username ? users.find((x) => x.username === username) : currentUser;
    if (!u) return;
    const userApps = candidates.filter((c) => c.userId === u.id || c.email === u.email);
    const dataBlob = {
      exportTimestamp: new Date().toISOString(),
      account: u,
      applicationsCount: userApps.length,
      applications: userApps,
      privacySettings,
    };
    const jsonStr = JSON.stringify(dataBlob, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screenloop_data_${u.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Personal data downloaded as JSON");
  }, [currentUser, users, candidates, privacySettings]);

  const requestAccountDeletion = useCallback(() => {
    toast.info("Deletion request lodged", {
      description: "In accordance with data protection guidelines, your account and CV will be purged within 30 days.",
    });
  }, []);

  const candidateApplications = useMemo(() => {
    if (currentUser.role !== "candidate") return candidates;
    return candidates.filter(
      (c) =>
        !c.withdrawn &&
        (c.userId === currentUser.id ||
          c.username === currentUser.username ||
          c.email.toLowerCase() === currentUser.email.toLowerCase())
    );
  }, [candidates, currentUser]);

  const restorePlatformDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    localStorage.removeItem(STORAGE_KEY_COMPANIES);
    localStorage.removeItem(STORAGE_KEY_JOBS);
    localStorage.removeItem(STORAGE_KEY_CANDIDATES);
    localStorage.removeItem(STORAGE_KEY_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEY_PLUGINS);
    localStorage.removeItem(STORAGE_KEY_INTEGRATIONS);
    localStorage.removeItem(STORAGE_KEY_PRIVACY);
    setIsAuthenticated(false);
    setUsers(SEED_USERS);
    setCurrentUser(SEED_USERS.find((u) => u.username === "ali.khan") ?? SEED_USERS[0]!);
    setCompanies(SEED_COMPANIES);
    setJobs(SEED_JOBS);
    setCandidates(SEED_CANDIDATES);
    setAuditLogs(SEED_AUDIT_LOGS);
    setPlugins(SEED_PLUGINS);
    setIntegrations(SEED_INTEGRATIONS);
    setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
    setSelectedJobId(null);
    toast.success("Platform database state restored to enterprise baseline!");
  }, []);

  const value = useMemo<AtsContextType>(
    () => ({
      isAuthenticated,
      currentUser,
      users,
      switchUser,
      secureSwitchUser,
      switchRole,
      loginWithIdentifier,
      login: loginWithIdentifier,
      logout,
      resetUserPassword,
      canUserAccessTab,
      register,
      updateUserRole,
      toggleUserStatus,
      updateCandidateProfile,
      companies,
      approveCompany,
      rejectCompany,
      verifyCompany,
      registerCompany,
      updateCompanyProfile,
      getCompanyTeam,
      inviteTeamMember,
      removeTeamMember,
      jobs,
      activeJobs,
      isolatedJobs,
      selectedJobId,
      setSelectedJobId,
      createJob,
      updateJob,
      archiveJob,
      restoreJob,
      closeJob,
      candidates,
      candidateApplications,
      isolatedCandidates,
      isolatedInterviews,
      savedJobs,
      toggleSaveJob,
      submitApplication,
      withdrawApplication,
      moveCandidate,
      screenCandidateById,
      screenAll,
      setNote,
      scheduleInterview,
      triggerScreening,
      auditLogs,
      logAuditEvent,
      clearAuditLogs,
      plugins,
      togglePlugin,
      integrations,
      updateIntegrationStatus,
      privacySettings,
      updatePrivacySettings,
      downloadCandidateData,
      requestAccountDeletion,
      restorePlatformDefaults,
    }),
    [
      isAuthenticated,
      currentUser,
      users,
      switchUser,
      secureSwitchUser,
      switchRole,
      loginWithIdentifier,
      logout,
      resetUserPassword,
      register,
      updateUserRole,
      toggleUserStatus,
      updateCandidateProfile,
      companies,
      approveCompany,
      rejectCompany,
      verifyCompany,
      registerCompany,
      updateCompanyProfile,
      getCompanyTeam,
      inviteTeamMember,
      removeTeamMember,
      jobs,
      activeJobs,
      isolatedJobs,
      selectedJobId,
      createJob,
      updateJob,
      archiveJob,
      restoreJob,
      closeJob,
      candidates,
      candidateApplications,
      isolatedCandidates,
      isolatedInterviews,
      savedJobs,
      toggleSaveJob,
      submitApplication,
      withdrawApplication,
      moveCandidate,
      screenCandidateById,
      screenAll,
      setNote,
      scheduleInterview,
      triggerScreening,
      auditLogs,
      logAuditEvent,
      clearAuditLogs,
      plugins,
      togglePlugin,
      integrations,
      updateIntegrationStatus,
      privacySettings,
      updatePrivacySettings,
      downloadCandidateData,
      requestAccountDeletion,
      restorePlatformDefaults,
    ]
  );

  return <AtsContext.Provider value={value}>{children}</AtsContext.Provider>;
}

export function useAts() {
  const ctx = useContext(AtsContext);
  if (!ctx) throw new Error("useAts must be used inside <AtsProvider>");
  return ctx;
}
