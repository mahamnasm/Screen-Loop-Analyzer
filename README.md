# Smart Hire Hub

You are my coding partner.

We are building a prototype AI-powered Applicant Tracking System (ATS)

GOAL:

Build an ATS where candidates upload their own resumes, the system screens and ranks them against a recruiter-defined Job Description, and recruiters manage candidates through a drag-and-drop Kanban workflow.

CORE FEATURES:

1. Job Creation

- Allow recruiter to define:

  - Job title

  - Required skills

  - Optional skills

  - Minimum experience

  - Weighting for skills vs experience

- Store job criteria for screening.

2. Candidate Resume Upload

- Candidates can submit:

  - Name

  - Email

  - Resume (mock text is fine)

- Create a candidate record with status = Applied.

3. AI Resume Parsing & Screening

For each resume:

- Extract skills and experience

- Compare against job criteria

- Calculate a match_score (0–100) using defined weights

- Generate a short explanation of the match

- Assign screening_result (Pass / Review / Reject)

4. Candidate Ranking

- Rank candidates automatically based on match_score

- Sorting should update dynamically.

5. Kanban Board (Essential)

Create a Kanban board with columns:

- Applied

- Screened

- Shortlisted

- Rejected

Rules:

- All candidates start in Applied

- Passed candidates auto-move to Screened

- Recruiters must be able to drag and drop candidates between columns

- Manual moves override automation

Each candidate card should display:

- Name

- Match score

- Top matched skills

- Experience years

6. Screening Trigger

- Allow recruiter to select candidates in Screened or Shortlisted

- Trigger a simulated screening message

- Log that screening was triggered with timestamp

CONSTRAINTS:

- No real email integrations

- Local/in-memory data

- Focus on workflow clarity and UX

- Drag-and-drop must work smoothly

DELIVERABLE:

- Resume upload

- AI screening + ranking

- Drag-and-drop Kanban board

- Screening trigger simulation

- Clean, commented code

If time permits:

- Score filters

- Candidate notes

- Column counters

Build step by step and keep it workshop-friendly.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2bc6b969-d81a-4b5f-a6db-91ff084cf838).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
