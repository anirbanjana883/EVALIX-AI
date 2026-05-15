# EVALIX AI
<p align="center">
  <img src="./frontend/src/assets/logo.jpeg" alt="Evaluator.ai Logo" width="200"/>
</p>


> Enterprise-Grade AI Exam Evaluation Platform

Transform academic grading with multimodal AI evaluation, RAG-powered syllabus context, automated rubrics, vector-based plagiarism detection, and seamless Human-in-the-Loop (HITL) overrides.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution Workflow](#solution-workflow)
- [Architecture](#architecture)
- [Engineering Challenges Overcome](#engineering-challenges-overcome)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)

---

## Overview

EVALIX AI is an intelligent, automated grading platform designed for educational institutions. It handles both traditional Multiple Choice Questions (MCQs) and complex descriptive (handwritten) answers across multiple pages.

By leveraging cutting-edge multimodal LLMs and Retrieval-Augmented Generation (RAG), the platform reads messy student handwriting, retrieves context directly from the teacher's syllabus via `pgvector`, checks for plagiarism, and calculates a highly accurate score with detailed constructive feedback. It also features an automated **Quarantine Zone** to catch suspected cheating, allowing teachers to retain ultimate control via manual overrides.

---

## Problem Statement

| Challenge | Details |
|---|---|
| Subjectivity & Fatigue | Manual grading of descriptive answers is highly subjective and exhausts educators |
| Legacy OCR Failures | Traditional OCR systems fail on messy handwriting and cannot stitch multi-page answers |
| AI Hallucinations | Out-of-the-box LLMs grade based on internet data, not the specific syllabus taught in class |
| Plagiarism Detection | Hard to detect copied text across hundreds of handwritten submissions |
| Administrative Overhead | Setting papers and notifying students takes valuable teacher time |

---

## Solution Workflow

```
Teacher Creates Exam (Uploads Syllabus for Vector Embeddings)
         ↓
System Dispatches Bulk Email Alerts to Target Cohort
         ↓
Student Uploads Multi-Page Handwritten Answers
         ↓
Background Pipeline Triggered:
  1. OCR Agent         (Multi-page stitching & confidence scoring)
  2. Plagiarism Service (Vector search against peer submissions)
  3. RAG Service        (Retrieves specific syllabus context)
  4. LLM Agent          (Scores & generates structured feedback)
         ↓
Quarantine Check: If Flagged / Plagiarized → Lock Submission
         ↓
Teacher Dashboard (Split-screen review, hits "Override" to unlock)
         ↓
Time-Lock Expires → Student Views Detailed Analytics
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│             Frontend (React + Vite)                 │
│  - Teacher Dashboard, Split-Screen Grader           │
│  - Student Exam Portal, Quarantine Warning UI       │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP / REST (Express.js)
                   ↓
┌─────────────────────────────────────────────────────┐
│             Backend Pipeline (Node.js)              │
│  - RBAC & Mailing Engine (Nodemailer / SendGrid)    │
│  - Multi-page Uploads (Supabase Storage)            │
│  - AI Evaluation Background Workers                 │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ↓                          ↓
  ┌────────────────┐        ┌──────────────────┐
  │ Gemini 2.5 Pro │        │ Gemini 2.5 Flash │
  │ (Vision / OCR) │        │  (Evaluation)    │
  └────────────────┘        └──────────────────┘
           │                          │
           ↓                          ↓
  ┌───────────────────────────────────────────┐
  │    Database (PostgreSQL + Prisma)         │
  │    - Relational Data (Users, Answers)     │
  │    - pgvector (Syllabus & Plagiarism)     │
  └───────────────────────────────────────────┘
```

---

## Engineering Challenges Overcome

### 1. Multi-Page Handwriting Stitching & Confidence Scoring

**Problem:** Students rarely submit answers on a single page. Legacy OCR failed on messy handwriting, and handling multiple images per question broke standard AI pipelines.

**Solution:** The schema was upgraded to accept `file_urls` arrays, iterating through multiple Supabase URLs asynchronously. A Multimodal LLM acts as the OCR agent — transcribing and stitching text across pages while assigning an overall **Confidence Score** to flag unreadable uploads.

---

### 2. Context-Aware Grading (RAG Integration)

**Problem:** AI models would mark answers "correct" based on advanced university-level knowledge, even when it violated the simpler definition taught in a high-school syllabus.

**Solution:** `pgvector` was integrated into the pipeline. When a teacher creates an exam, the syllabus is embedded into 768-dimensional vectors. During evaluation, the `RagService` retrieves the exact formulas or definitions relevant to the student's OCR text and injects them into the LLM prompt — the AI now grades strictly based on what was taught.

---

### 3. The Anti-Cheat Quarantine Zone

**Problem:** If AI blindly releases scores for plagiarized or deeply flawed submissions, academic integrity is compromised.

**Solution:** A strict `requires_review` flag is enforced at the database level. If the AI detects plagiarism via vector similarity, outputs a low confidence score, or flags abnormal answers, the submission enters a **Quarantine Zone**. The student-facing API is blocked from sending scores and displays a "Submission Under Review" warning until the teacher manually overrides and approves the grade.

---

## Core Features

### Teacher Features

- **RAG-Powered AI Exam Generator** — Paste a syllabus to auto-generate questions. The syllabus is vectorized for context-aware grading.
- **Split-Screen Review** — View uploaded images, extracted OCR text, AI structured feedback (Strengths/Weaknesses), and model answer side-by-side.
- **Human-in-the-Loop (HITL) Override** — Adjust scores, leave `teacher_feedback`, and unlock quarantined submissions.

### Student Features

- **Multi-Image Uploads** — Upload 5+ pages for complex descriptive questions.
- **Smart Result Analytics** — Detailed AI breakdowns of missing concepts, or a secure Quarantine UI if flagged.
- **Automated Email Notifications** — Instant alerts when new exams are assigned, and confirmation receipts upon submission.

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express 5 | Core API server framework |
| Prisma ORM + PostgreSQL | Relational database handling |
| pgvector | High-performance vector similarity search (RAG & Plagiarism) |
| Google GenAI SDK | Integrates Gemini 2.5 Flash/Pro for Vision, Embeddings, and Text |
| Supabase JS | Secure file array uploads and Auth |
| Nodemailer | Background dispatch engine for student alerts |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite 8 | High-performance UI framework |
| Tailwind CSS 4 | Utility-first styling |
| Lucide React | Clean, consistent iconography |
| XLSX | Browser-side Excel generation for the AI Exam Setter |

---

## API Reference

### Assignments — `/api/assignments`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/` | Teacher | Creates an assignment, embeds syllabus to pgvector, dispatches bulk emails |
| GET | `/student` | Student | Fetches exams targeted to the student's Year/Batch |
| GET | `/:id/result` | Student | Fetches results; returns restricted data if `is_quarantined` is true |

### Submissions & Uploads — `/api/submit` & `/api/upload`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/upload` | Student | Accepts multiple images (`upload.array`) and returns Supabase URLs |
| POST | `/submit` | Student | Triggers the background AI pipeline (OCR → Plagiarism → RAG → Grading) |

### Teacher Operations — `/api/teacher`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/submissions/:submissionId` | Teacher | Fetches full submission with AI feedback and flagged metrics |
| PATCH | `/answers/:answerId/override` | Teacher | Updates score/feedback and clears the `requires_review` quarantine flag |

---

## Installation & Setup

### Prerequisites

- Node.js v18+
- PostgreSQL with the `pgvector` extension enabled
- Supabase project
- Google Gemini API Key

### Setup

```bash
# Clone the repository
git clone https://github.com/anirbanjana883/EVALIX-AI.git
cd EVALIX-AI

# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

---

## Project Structure

```
EXAM-EVALUATOR/
├── .vscode/
├── backend/
│   ├── node_modules/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── agents/
│   │   │   ├── generatorAgent.js
│   │   │   ├── llmAgent.js
│   │   │   └── ocrAgent.js
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── assignment.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── submission.controller.js
│   │   │   ├── teacher.controller.js
│   │   │   ├── upload.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── repositories/
│   │   │   ├── assignment.repository.js
│   │   │   ├── plagiarism.repository.js
│   │   │   ├── rag.repository.js
│   │   │   ├── submission.repository.js
│   │   │   ├── teacher.repository.js
│   │   │   └── user.repository.js
│   │   ├── routes/
│   │   │   ├── assignment.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── submit.routes.js
│   │   │   ├── teacher.routes.js
│   │   │   ├── upload.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   ├── ai.evaluator.js
│   │   │   ├── auth.service.js
│   │   │   ├── embedding.service.js
│   │   │   ├── mail.service.js
│   │   │   ├── mail.templates.js
│   │   │   ├── mcq.evaluator.js
│   │   │   ├── plagiarism.service.js
│   │   │   ├── rag.service.js
│   │   │   └── storage.service.js
│   │   └── utils/
│   │       └── keyManager.js
│   ├── .env
│   ├── .gitignore
│   ├── app.js
│   ├── eng.traineddata
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── node_modules/
│   ├── public/
│   │   ├── favicon.jpeg
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── logo.jpeg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── favicon.jpeg
│   │   │   ├── logo.jpeg
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── Pricing.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   ├── pages/
│   │   │   ├── AssignmentView.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── CreateAssignment.jsx
│   │   │   ├── GenerateQuestionsView.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ResultsView.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── SubmissionReview.jsx
│   │   │   ├── TakeTest.jsx
│   │   │   └── TeacherDashboard.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── README.md
│   ├── vercel.json
│   └── vite.config.js
└── readme.md
```

---

## Future Roadmap

The core multimodal architecture is built to scale into India's competitive coaching industry:

| Target | Plan |
|---|---|
| **UPSC** | Fine-tune LLM to grade 250-word mains answers against complex rubrics and current affairs via dynamic RAG |
| **JEE / NEET** | Expand the Vision Agent to grade circuit diagrams, free-body diagrams, and organic chemistry mechanisms with partial marking |
| **B2B Multi-Tenant** | Allow large coaching institutes to manage 10,000+ students with same-day mock test results |

---

## Contributing

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Apply any Prisma schema changes
npx prisma db push

# 3. Commit your changes
git commit -m "feat: added new evaluator logic"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

---

Made with 💡 and ☕ by the EVALIX AI Team