# 🚀 Evaluator.ai - Enterprise-Grade AI Exam Evaluation Platform

<p align="center">
  <img src="./frontend/src/assets/logo.jpeg" alt="Evaluator.ai Logo" width="200"/>
</p>

Transform academic grading with multimodal AI evaluation, automated rubrics, and seamless Human-in-the-Loop (HITL) overrides.

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Architecture](#architecture)
- [Engineering Challenges Overcome](#engineering-challenges-overcome)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Detailed API Reference](#detailed-api-reference)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)

---

## 🎯 Overview

Evaluator.ai is an intelligent, automated grading platform designed for educational institutions. It handles both traditional Multiple Choice Questions (MCQs) and complex Descriptive (handwritten) answers.

By leveraging cutting-edge multimodal Large Language Models (LLMs), the platform reads student handwriting, compares it against a teacher's "Gold Standard" Model Answer, assigns a calculated score, and generates highly detailed, constructive feedback—all while allowing the teacher to retain ultimate control via manual overrides.

---

## 🔍 Problem Statement

### The Challenge

- 📝 **Subjectivity & Fatigue:** Manual grading of descriptive answers is highly subjective and exhausts educators.
- ⏳ **Delayed Feedback:** Students wait weeks for exam results, severing the learning loop.
- 🤖 **Legacy Tech Failures:** Traditional OCR systems fail miserably at reading messy student handwriting or diagrams.
- 📊 **Administrative Overhead:** Setting papers, aligning to syllabi, and calculating batch-wise analytics takes up valuable teaching time.

---

## 💡 Solution

Evaluator.ai automates the examination lifecycle:

```
Teacher Creates Exam (Model Answers + Time-Locks)
         ↓
Student Uploads Handwritten Answer Sheets / Selects MCQs
         ↓
AI Vision Agent (Handwriting Extraction)
         ↓
AI Evaluator Agent (Scores against Model Answer + Generates Feedback)
         ↓
Teacher Dashboard (Split-screen review & Human Override)
         ↓
Time-Lock Expires → Student Views Detailed Analytics
```

### Key Value Propositions

- ✅ **Automated Descriptive Grading:** Near-instant evaluation of essays and technical answers.
- ✅ **Bulletproof Security:** Strict time-locks prevent students from accessing exams early or viewing results before the release date.
- ✅ **Human-in-the-Loop (HITL):** Teachers can seamlessly override AI scores and leave personal remarks.
- ✅ **AI Exam Generator:** Instantly generate new test papers based on syllabi and Past Year Questions (PYQs).

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│             Frontend (React + Vite)                 │
│  - Teacher Dashboard, Split-Screen Grader           │
│  - Student Exam Portal, Result Analytics            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓ HTTP/REST (Express.js)
┌─────────────────────────────────────────────────────┐
│             Backend Pipeline (Node.js)              │
│  - Role-Based Access Control (RBAC)                 │
│  - Background Evaluation Workers                    │
│  - Supabase Auth & Storage Integration              │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ↓                          ↓
    ┌────────────────┐        ┌──────────────────┐
    │ Gemini 2.5 Pro │        │ Gemini 2.5 Flash │
    │ (Vision / OCR) │        │ (Evaluation)     │
    └────────────────┘        └──────────────────┘
           ↓                          ↓
    ┌───────────────────────────────────────────┐
    │     Database (PostgreSQL + Prisma)        │
    │     - Users, Submissions, Answers         │
    └───────────────────────────────────────────┘
```

---

## 🛡️ Engineering Challenges Overcome

### 1. The Handwriting OCR Bottleneck

**The Problem:** Initially, we attempted to extract text from student uploads using traditional OCR engines like Tesseract and Google Cloud Vision. However, these systems struggled heavily with:
- Messy, cursive, or overlapping student handwriting.
- Mathematical symbols and pseudo-code.
- Images uploaded at rotated or skewed angles.

**The Solution:** We entirely ripped out the legacy OCR pipeline and implemented a Multimodal LLM approach. We built an `ocrAgent` that passes the raw base64 image directly to Google Gemini 2.5 Flash with a strict transcription prompt. The LLM's spatial reasoning easily deciphers messy handwriting, completely bypassing traditional OCR limitations and yielding near-perfect text extraction for the evaluation phase.

### 2. Database Normalization vs. Query Speed

**The Problem:** The initial architecture used complex JSON arrays to store evaluation rubrics (`matchedConcepts`, `missedConcepts`). This caused parsing errors and made PostgreSQL queries incredibly slow and difficult to maintain.

**The Solution:** We refactored the database schema to use a single `model_answer` standard. The AI directly compares the student text to this string, outputting a pure integer score and an `ai_feedback` text block. This flattened the database relations, vastly improved query speed, and eliminated JSON parsing crashes.

---

## ✨ Features

### Teacher Features

- **AI Question Generator:** Paste a syllabus and PYQs to generate a JSON array of new questions, exportable directly to Excel (.xlsx).
- **Split-Screen Review:** View the student's raw upload, the AI's feedback, and the Model Answer side-by-side.
- **One-Click Overrides:** Manually adjust scores and leave `teacher_feedback` without breaking the original AI evaluation data.

### Student Features

- **Cohort-Based Routing:** Assignments are automatically routed based on the student's Academic Year and Batch.
- **Dynamic UI Rendering:** The Results View intelligently swaps between MCQ layouts (with color-coded correctness) and Descriptive layouts (with uploaded images and detailed feedback).
- **Real-time Status Updates:** Dashboard badges indicate whether an exam is `Live`, `Pending Results`, or `Graded`.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express 5** | Core API server framework |
| **Prisma ORM** | Type-safe database interactions |
| **PostgreSQL** | Primary relational database |
| **Google GenAI SDK** | Integration with primary Gemini models (Vision & Text) |
| **OpenAI SDK** | Used for routing requests to Groq (Llama fallback models) |
| **Supabase JS** | Handles secure file uploads directly to Supabase Storage buckets (replaced Multer) and Auth |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19 + Vite 8** | High-performance UI framework and blazing-fast build tool |
| **Tailwind CSS 4** | Utility-first styling for a sleek, modern UI |
| **React Router v7** | Client-side routing for seamless dashboard navigation |
| **Lucide React** | Clean, consistent iconography across the application |
| **XLSX** | Browser-side Excel (`.xlsx`) generation for the AI Exam Setter |
| **React Hot Toast** | Elegant, real-time toast notifications for user feedback |
| **Supabase JS** | Frontend authentication state management |

### Infrastructure
- **Supabase Auth:** JWT-based user authentication.
- **Supabase Storage:** Secure, scalable hosting for student exam paper image uploads.

---

## 🖧 Detailed API Reference

All routes are protected by `requireAuth` (JWT validation). Role-specific routes utilize `requireStudent` or `requireTeacher` middleware to enforce strict RBAC.

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/sync` | Any | Syncs the Supabase user to the PostgreSQL User table upon first login. |

### 2. Assignments (`/api/assignments`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/` | Teacher | Creates a new assignment with questions, model answers, and time-locks. |
| GET | `/student` | Student | Fetches all assignments targeted to the student's Department, Year, and Batch. |
| GET | `/:id` | Any | Fetches assignment details (Sanitizes `model_answer` for students if exam is live). |
| GET | `/:id/result` | Student | Fetches evaluated results. Protected by `release_marks_at` time-lock. |

### 3. Submissions (`/api/submissions` or `/api/submit`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/submit` | Student | Receives student answers. Triggers immediate grading for MCQs or background AI evaluation for Descriptive tests. Prevents double submissions. |

### 4. Teacher Operations (`/api/teacher`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/dashboard` | Teacher | Retrieves overview stats, active exams, and pending evaluations. |
| GET | `/assignments/:id` | Teacher | Retrieves all student submissions for a specific assignment. |
| GET | `/submissions/:submissionId` | Teacher | Fetches a full student submission for split-screen review. |
| PATCH | `/submissions/:subId/answers/:ansId/override` | Teacher | Updates the score and appends `teacher_feedback`. Recalculates total score. |
| POST | `/generate-questions` | Teacher | Calls the LLM Agent to generate new questions based on provided syllabus/PYQs. |

### 5. File Uploads (`/api/upload`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/` | Student | Uploads `examFile` to Supabase Storage via Multer memory buffer and returns the public URL. |

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Supabase Project (Auth & Storage buckets configured)
- Google Gemini API Key

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/evaluator-ai.git
cd evaluator-ai
```

### Step 2: Backend Setup

```bash
cd backend
npm install

# Generate Prisma Client
npx prisma generate

# Push schema to PostgreSQL
npx prisma db push
```

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/evaluator"
DIRECT_URL="postgresql://postgres:password@localhost:5432/evaluator"

GEMINI_API_KEY="your_google_gemini_key"

SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

PORT=3000
```

### Frontend (`frontend/.env`)

```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_anon_key"
VITE_API_URL="http://localhost:3000"
```

---

## 🎮 Running the Application

**Start the Backend Server:**

```bash
cd backend
npm run dev
# Server running on http://localhost:3000
```

**Start the Frontend Client:**

```bash
cd frontend
npm run dev
# Client running on http://localhost:5173
```

---

## 📁 Project Structure

```text
EXAM-EVALUATOR/
├── backend/                             # Node.js + Express Backend
│   ├── prisma/
│   │   ├── schema.prisma                # PostgreSQL database models
│   │   └── seed.js                      # Initial database seeding
│   ├── src/
│   │   ├── agents/                      # LLM Integration (Google Gemini)
│   │   │   ├── generatorAgent.js        # AI Exam Setter
│   │   │   ├── llmAgent.js              # AI Evaluation & Feedback
│   │   │   └── ocrAgent.js              # AI Handwriting Extraction (Vision)
│   │   ├── config/
│   │   │   └── supabase.js              # Supabase storage client
│   │   ├── controllers/                 # API request handling logic
│   │   │   ├── assignment.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── submission.controller.js
│   │   │   ├── teacher.controller.js
│   │   │   └── upload.controller.js
│   │   ├── middlewares/                 # Security & RBAC
│   │   │   ├── auth.middleware.js       # JWT validation
│   │   │   └── role.middleware.js       # Student/Teacher access control
│   │   ├── repositories/                # Prisma Database interactions
│   │   │   ├── assignment.repository.js
│   │   │   ├── submission.repository.js
│   │   │   ├── teacher.repository.js
│   │   │   └── user.repository.js
│   │   ├── routes/                      # Express API endpoints
│   │   │   ├── assignment.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── submit.routes.js
│   │   │   ├── teacher.routes.js
│   │   │   └── upload.routes.js
│   │   └── services/                    # Business logic & Workers
│   │       ├── ai.evaluator.js          # Descriptive grading pipeline
│   │       ├── auth.service.js
│   │       ├── mcq.evaluator.js         # Instant MCQ grading
│   │       └── storage.service.js       # File upload handling
│   ├── app.js                           # Express app configuration
│   ├── server.js                        # Server entry point
│   ├── eng.traineddata                  # Legacy Tesseract data (Deprecated)
│   └── .env                             # Backend environment variables
│
└── frontend/                            # React + Vite Frontend
    ├── public/
    ├── src/
    │   ├── assets/                      # Static images and icons
    │   ├── components/
    │   │   └── ProtectedRoute.jsx       # Auth wrapper for routes
    │   ├── context/
    │   │   └── AuthContext.jsx          # Global user authentication state
    │   ├── lib/
    │   │   └── supabase.js              # Supabase frontend client
    │   ├── pages/                       # React Route Components
    │   │   ├── AssignmentView.jsx       # Teacher assignment details
    │   │   ├── Auth.jsx                 # Login / Registration
    │   │   ├── CreateAssignment.jsx     # Teacher exam creation
    │   │   ├── GenerateQuestionsView.jsx# AI Question generator
    │   │   ├── Home.jsx                 # Landing page
    │   │   ├── ResultsView.jsx          # Student exam analytics
    │   │   ├── StudentDashboard.jsx     # Student portal
    │   │   ├── SubmissionReview.jsx     # Teacher split-screen grader
    │   │   ├── TakeTest.jsx             # Student exam interface
    │   │   └── TeacherDashboard.jsx     # Teacher portal
    │   ├── App.jsx                      # Main router setup
    │   ├── main.jsx                     # React DOM rendering
    │   ├── App.css                      # Component-specific styles
    │   └── index.css                    # Tailwind CSS configuration
    ├── index.html
    ├── eslint.config.js                 # Linter rules
    └── .env                             # Frontend environment variables
```

---

## 🔮 Future Industry Roadmap: Scaling to Competitive Exams

While Evaluator.ai is currently optimized for university and K-12 academic grading, our core multimodal architecture is built to scale into India's multi-billion dollar competitive coaching industry. 

Our upcoming development phases will introduce specialized AI pipelines for the country's most high-stakes examinations:

### 🎯 UPSC (Civil Services Examination)
* **Long-Form Essay Evaluation:** Fine-tuning the LLM to grade 250-word mains answers against complex UPSC rubrics (evaluating analytical depth, ethical reasoning, and multidimensional perspectives).
* **Multi-Page Handwriting Stitching:** Advanced vision agents capable of reading 20-page continuous essay booklets with high accuracy.
* **Current Affairs Integration:** RAG (Retrieval-Augmented Generation) pipelines to ensure the AI evaluates answers against the most up-to-date socio-economic and political data.

### 📐 JEE (Joint Entrance Examination)
* **Step-by-Step Derivation Tracking:** Moving beyond final-answer checking to evaluate the *methodology* of complex Physics and Calculus problems. 
* **Spatial & Diagram Reasoning:** Allowing the AI to grade student-drawn circuit diagrams, free-body diagrams, and organic chemistry mechanisms.
* **Partial Marking Logic:** Implementing strict, customizable partial marking schemes based on standard JEE Advanced guidelines.

### 🧬 NEET (National Eligibility cum Entrance Test)
* **High-Volume OMR + Descriptive Hybrid:** Combining ultra-fast Optical Mark Recognition for standard MCQs with our Vision LLM for newly introduced theoretical or descriptive formats.
* **Syllabus-Aligned Question Generation:** Upgrading the `generatorAgent` to specifically pull from NCERT textbooks, ensuring AI-generated mock tests are perfectly aligned with NTA (National Testing Agency) standards.

### 🏢 B2B Coaching Center Solutions
* **Multi-Tenant Architecture:** Allowing massive coaching institutes (e.g., Kota-based centers) to manage 10,000+ students, segmenting analytics by branch, batch, and individual performance.
* **Same-Day Mock Test Results:** Reducing the grading turnaround time from 4 days to 4 hours, giving students actionable feedback before their next class.

---

**Made with 💡 and ☕ by the Evaluator.ai Team**

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Ensure Prisma schema changes are migrated: `npx prisma migrate dev`
3. Commit your changes: `git commit -m "feat: added new evaluator logic"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.