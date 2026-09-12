/**
 * Enterprise ATS Screening Engine & Data Types for Pakistani Market.
 * 
 * Provides deterministic AI evaluation for candidate resumes
 * against job criteria, generating match scores, strengths, weaknesses,
 * skill gap analysis, executive summaries, and application strength ratings.
 */

export type Stage =
  | "Applied"
  | "Screening"
  | "CV Reviewed"
  | "Shortlisted"
  | "Interview"
  | "Final Interview"
  | "Final Review"
  | "Offer"
  | "Selected"
  | "Hired"
  | "Rejected"
  | "Not Selected";

export type ScreeningResult = "Pass" | "Review" | "Reject";

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  city: string;
  website: string;
  linkedinUrl?: string | undefined;
  size: string;
  verified: boolean;
  status: "approved" | "pending" | "rejected" | "suspended";
  description: string;
  benefits?: string[] | undefined;
}

export interface Job {
  id: string;
  companyId?: string | undefined;
  company: string;
  companyLogo?: string | undefined;
  isVerifiedCompany: boolean;
  isCorporateListing: boolean;
  title: string;
  department: string;
  city: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary: string;
  salaryMinPKR: number;
  salaryMaxPKR: number;
  salaryDisplayPKR: string;
  preferredDegree?: string | undefined;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  optionalSkills: string[];
  minExperience: number;
  /** 0-100: percentage of score determined by skills (remainder by experience) */
  skillsWeight: number;
  deadline: number; // Expiration timestamp in ms
  status: "active" | "archived" | "closed";
  createdAt: number;
  vacancies?: number | undefined;
}

export interface InterviewSchedule {
  id: string;
  date: string;
  time: string;
  type: "Technical" | "Behavioral" | "System Design" | "HR Screening" | "Executive";
  interviewer: string;
  notes?: string | undefined;
  meetingLink?: string | undefined;
}

export interface StatusHistoryItem {
  stage: Stage;
  timestamp: number;
  note?: string | undefined;
  updatedBy?: string | undefined;
}

export interface Screening {
  matchScore: number;
  matchedRequired: string[];
  matchedOptional: string[];
  missingRequired: string[];
  experienceYears: number;
  explanation: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  result: ScreeningResult;
  evaluatedAt: number;
}

export interface Candidate {
  id: string;
  username?: string | undefined;
  userId?: string | undefined; // Links to candidate account if logged in
  jobId: string;
  companyId?: string | undefined;
  name: string;
  email: string;
  phone: string;
  city: string;
  location: string;
  portfolioUrl?: string | undefined;
  githubUrl?: string | undefined;
  linkedinUrl?: string | undefined;
  resumeFileName?: string | undefined;
  resumeFileType?: string | undefined;
  resumeText: string;
  coverLetter?: string | undefined;
  stage: Stage;
  appliedAt: number;
  updatedAt: number;
  screening?: Screening | undefined;
  cvScore?: number | undefined;
  manualStage: boolean;
  withdrawn?: boolean | undefined;
  currentSalaryPKR?: number | undefined;
  expectedSalaryPKR?: number | undefined;
  notes: string;
  interviews: InterviewSchedule[];
  history: StatusHistoryItem[];
  triggers: { at: number; message: string }[];
}

export const PIPELINE_STAGES: Stage[] = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Final Interview",
  "Offer",
  "Hired",
  "Rejected",
];

export const STAGES: Stage[] = PIPELINE_STAGES;

export const ALL_STAGES: Stage[] = [
  "Applied",
  "Screening",
  "CV Reviewed",
  "Shortlisted",
  "Interview",
  "Final Interview",
  "Final Review",
  "Offer",
  "Selected",
  "Hired",
  "Rejected",
  "Not Selected",
];

/** Helper to check if a job deadline has passed */
export function isJobExpired(deadline: number): boolean {
  return Date.now() > deadline;
}

/** Helper to compute days left until application deadline */
export function getDaysUntilDeadline(deadline: number): number {
  const diffMs = deadline - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/** Normalize skill names for comparison (e.g. "Node.js" -> "nodejs", "C++" -> "c++") */
export const normalizeSkill = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9+#]/g, "").trim();

/** Check if resume contains a given skill keyword */
export function hasSkill(resume: string, skill: string): boolean {
  const r = resume.toLowerCase();
  const s = skill.toLowerCase();
  
  if (r.includes(s)) return true;
  
  const normR = normalizeSkill(resume);
  const normS = normalizeSkill(skill);
  return normS.length > 1 && normR.includes(normS);
}

/** Extract the highest "N years experience" pattern from resume text */
export function extractExperience(resume: string): number {
  const matches = [...resume.matchAll(/(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)/gi)];
  const years = matches.map((m) => parseFloat(m[1]!));
  return years.length ? Math.max(...years) : 0;
}

/**
 * Deterministic AI screening engine.
 * Computes match score, checks skill gaps, analyzes experience,
 * and generates structured feedback.
 */
export function screenCandidate(candidate: Candidate, job: Job): Screening {
  const resume = candidate.resumeText;
  const matchedRequired = job.requiredSkills.filter((s) => hasSkill(resume, s));
  const matchedOptional = job.optionalSkills.filter((s) => hasSkill(resume, s));
  const missingRequired = job.requiredSkills.filter((s) => !matchedRequired.includes(s));
  
  let experienceYears = extractExperience(resume);
  if (experienceYears === 0) {
    if (resume.toLowerCase().includes("senior") || resume.toLowerCase().includes("lead")) {
      experienceYears = 5;
    } else if (resume.toLowerCase().includes("mid-level") || resume.toLowerCase().includes("engineer")) {
      experienceYears = 3;
    } else {
      experienceYears = 1;
    }
  }

  // --- Skills component calculation (0 - 1)
  const reqRatio = job.requiredSkills.length
    ? matchedRequired.length / job.requiredSkills.length
    : 1;
  const optRatio = job.optionalSkills.length
    ? matchedOptional.length / job.optionalSkills.length
    : 0;
  
  // Required skills are weighted heavily (85%), bonus skills add up to 15%
  const skillsScore = Math.min(1, reqRatio * 0.85 + optRatio * 0.15);

  // --- Experience component (0 - 1)
  const expScore =
    job.minExperience <= 0 ? 1 : Math.min(1.2, experienceYears / job.minExperience);
  const normalizedExpScore = Math.min(1, expScore);

  const w = Math.min(100, Math.max(0, job.skillsWeight)) / 100;
  const matchScore = Math.round(
    (skillsScore * w + normalizedExpScore * (1 - w)) * 100
  );

  const result: ScreeningResult =
    matchScore >= 75 && missingRequired.length <= 1
      ? "Pass"
      : matchScore >= 45
      ? "Review"
      : "Reject";

  // Build AI strengths
  const strengths: string[] = [];
  if (matchedRequired.length === job.requiredSkills.length) {
    strengths.push(`Complete match across all ${job.requiredSkills.length} required core competencies.`);
  } else if (matchedRequired.length > 0) {
    strengths.push(`Demonstrated proficiency in key required skills: ${matchedRequired.join(", ")}.`);
  }
  if (experienceYears >= job.minExperience) {
    strengths.push(`Exceeds experience target with ${experienceYears} years in software engineering roles.`);
  }
  if (matchedOptional.length > 0) {
    strengths.push(`Brings desirable domain knowledge in ${matchedOptional.join(", ")}.`);
  }
  if (candidate.portfolioUrl || candidate.githubUrl) {
    strengths.push("Provided external portfolio / GitHub repository for technical verification.");
  }
  if (strengths.length === 0) {
    strengths.push("Foundational technical vocabulary present in CV profile.");
  }

  // Build AI weaknesses / gaps
  const weaknesses: string[] = [];
  if (missingRequired.length > 0) {
    weaknesses.push(`Lacks explicit experience with required skills: ${missingRequired.join(", ")}.`);
  }
  if (experienceYears < job.minExperience) {
    weaknesses.push(`Experience (${experienceYears} yrs) is below the recommended ${job.minExperience} years threshold.`);
  }
  if (matchedOptional.length === 0 && job.optionalSkills.length > 0) {
    weaknesses.push(`No demonstrated exposure to secondary stack items (${job.optionalSkills.slice(0, 2).join(", ")}).`);
  }
  if (weaknesses.length === 0) {
    weaknesses.push("No critical gaps identified for this role.");
  }

  // Executive summary
  const summary =
    result === "Pass"
      ? `Strong candidate profile matching ${Math.round(reqRatio * 100)}% of essential criteria with ${experienceYears}+ years proven industry experience. Recommended to advance directly to technical assessment.`
      : result === "Review"
      ? `Promising applicant with partial skill alignment (${matchedRequired.length}/${job.requiredSkills.length} required). Suitable for preliminary screening to evaluate transferable competencies.`
      : `Substantial skill misalignment with missing critical competencies (${missingRequired.slice(0, 3).join(", ")}). Profile does not meet the baseline criteria for this position.`;

  const explanation = [
    `Matched ${matchedRequired.length}/${job.requiredSkills.length} required skills (${matchedRequired.join(", ") || "none"})`,
    missingRequired.length ? `missing ${missingRequired.join(", ")}` : null,
    matchedOptional.length ? `bonus skills: ${matchedOptional.join(", ")}` : null,
    `${experienceYears} yrs experience vs ${job.minExperience} yrs target`,
    `Score weight: ${job.skillsWeight}% skills / ${100 - job.skillsWeight}% experience`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    matchScore,
    matchedRequired,
    matchedOptional,
    missingRequired,
    experienceYears,
    explanation,
    summary,
    strengths,
    weaknesses,
    result,
    evaluatedAt: Date.now(),
  };
}

/** Automatically determine initial stage upon screening unless manually adjusted */
export function autoStage(result: ScreeningResult): Stage {
  if (result === "Pass") return "Screening";
  if (result === "Reject") return "Rejected";
  return "Applied";
}
