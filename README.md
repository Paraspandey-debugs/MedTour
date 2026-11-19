# MedTour

**Better Healthcare, Global Access, Healthier Tomorrow**

MedTour is a cross-border healthcare platform prototype that helps patients evaluate international medical travel options. Rather than acting as a simple hospital directory with sticker prices, MedTour models patient-specific risk, plans post-operative recovery travel around clinical milestones, and demonstrates milestone-staged payments.

> **Note on Data:** Provider listings, surgeon profiles, prices, accreditations, and complication rates are **illustrative sample data** for prototype demonstration. The risk calculation engine, clinical timeline rules, Google Gemini AI report analysis, and pgvector RAG retrieval are fully implemented functional features.

---

## Key Features

1. **Care Passport (`/match`)** — Upload a medical document or paste clinical notes. Google Gemini extracts key biomarkers, identifies the procedure, computes a personalized surgical risk multiplier, and ranks sample hospitals with explainable scoring.
2. **TrueCost Estimator (`/cost`)** — Models all-in procedure pricing including surgery, recovery lodging, travel, and an actuarial risk reserve based on patient risk and hospital complication rates.
3. **Fit-to-Fly Journey Planner (`/journey`)** — Enforces recovery gates that block flight scheduling until clinically safe post-operative windows pass.
4. **24/7 Care Coordinator Concierge (`/coordinator`)** — Live AI concierge powered by Google Gemini and grounded with RAG clinical knowledge to answer journey and recovery questions.
5. **Privacy Architecture & Milestone Payments (`/security`)** — Demonstrates client-side PHI de-identification and staged milestone escrow release models.
6. **Hospitals & Specialist Directory (`/hospitals`)** — Provider search with natural language query parsing and sample tier ratings.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, pgvector)
- **AI & Embeddings:** Google Gemini 3.1 Flash Lite (`gemini-3.1-flash-lite`), Gemini Embeddings (`gemini-embedding-001`)
- **Validation:** Zod

---

## Getting Started

### 1. Prerequisites

- Node.js 20+
- A Supabase project (with PostgreSQL)
- A Google AI Studio API key

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
GEMINI_API_KEY=your-google-ai-studio-key

# Optional: used only by the offline database seed script (never exposed to app code)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js development server |
| `npm run build` | Builds production application with type checking |
| `npm run start` | Starts production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm run seed` | Seeds Supabase database tables using `SUPABASE_SERVICE_ROLE_KEY` |

---

## Repository Structure

```
├── app/                  # Next.js App Router pages and API route handlers
│   ├── api/              # Secure API routes (/api/analyze-report, /api/ai/chat, /api/smart-search)
│   ├── coordinator/      # 24/7 AI concierge & companion interface
│   ├── cost/             # TrueCost actuarial comparison tool
│   ├── dashboard/        # Authenticated patient workspace
│   ├── hospitals/        # Sample hospital & doctor directory
│   ├── journey/          # Fit-to-Fly journey planner
│   ├── login/            # Supabase authentication (login / signup)
│   ├── match/            # Care Passport & Gemini report analysis
│   └── security/         # PHI privacy & milestone payment architecture
├── components/           # Reusable UI components & navigation
├── lib/
│   ├── data.ts           # Reference clinical datasets, procedures, sample hospitals
│   ├── engine.ts         # Risk scoring, TrueCost actuarial calculation, matching algorithms
│   ├── gemini.ts         # Google Gemini AI integrations with secure header authentication
│   ├── rag.ts            # Clinical knowledge corpus & pgvector RAG semantic search
│   ├── rate-limit.ts     # In-memory sliding-window rate limiter
│   ├── safe-next.ts      # Open-redirect validation helper
│   └── supabase/         # Supabase client, server, and middleware session helpers
├── scripts/              # Offline maintenance scripts (seed.ts)
└── supabase/             # Database schema migrations and seed SQL
```
