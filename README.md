# MedTour

**Compare the real cost of planned surgery abroad.**

Pick a procedure and the country you live in. MedTour shows the total trip cost for each hospital: procedure, flights,
recovery stay, visa and insurance, and a buffer for complications. Then you can request a quote.

> **This is a demo prototype.** Hospitals, doctors, prices, ratings, accreditations and complication rates are
> **illustrative sample data**. No hospital has been audited or onboarded, no payments exist, and quote requests are
> saved to your account but **not sent to any hospital**. Nothing here is medical advice.

## What is real today

| Feature | Status |
|---|---|
| Total-cost comparison (`/hospitals`, `/cost`) | Working, calculated from sample prices |
| Hospital and specialist listings | Sample data |
| Report analysis (`/match`) | Working, AI-assisted (Google Gemini), informational only |
| Quote requests (`/hospitals/[id]`, `/dashboard`) | Working, stored in Supabase, not forwarded |
| AI assistant (`/coordinator`) | Working, general information only, requires sign-in |
| Trip plan (`/journey`) | Working, day-by-day timeline from sample rules |
| Milestone payments / escrow (`/security`) | **Planned**, simulation only |
| Rewards, reviews, hospital onboarding (`/loyalty`, `/partners`) | **Concept previews** |

## Main flow

1. `/` choose a procedure and your home country
2. `/hospitals?procedure=…&from=…` ranked by total trip cost (sort by rating or shortest trip)
3. `/hospitals/[id]` cost summary and **Request a quote**
4. `/dashboard` your saved quote requests

Optional: `/match` adjusts the estimate to your health data. `/journey` shows when it is safe to fly home.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres, Auth, RLS, pgvector),
Google Gemini (`gemini-3.1-flash-lite`), Zod, Vitest.

## Setup

Prerequisites: Node.js 20+, a Supabase project, a Google AI Studio key.

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                  # http://localhost:3000
```

### Environment variables

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public (anon) key |
| `GEMINI_API_KEY` | Server-side only. Report analysis, assistant, smart search |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for sitemap, robots and OpenGraph |
| `SUPABASE_SERVICE_ROLE_KEY` | Only for `npm run seed`. Never used by app code |

### Database

Run in the Supabase SQL editor, in this order:

1. `supabase/seed.sql` (tables, RLS, sample data, quote requests), **or** apply `supabase/migrations/*.sql` to an existing project
2. Optionally `npm run seed` to upsert hospitals and doctors with the service-role key

Security model: hospitals, doctors, treatments and the knowledge base are **read-only** for clients. Users can only
read their own dossiers, vault records and quote requests. Anyone may insert a quote request (validated in the API and
by table checks).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (engine, `safeNext`) |
| `npm run seed` | Seed hospitals and doctors (needs service-role key) |

CI (`.github/workflows/ci.yml`) runs install, lint, typecheck, tests and build.

## Project structure

```
app/            pages and API routes (api/quote, api/analyze-report, api/ai/chat, api/smart-search)
components/     Nav, HomeSearch, QuoteForm, MedicalDisclaimer, shared UI
lib/data.ts     sample treatments, hospitals, doctors, currencies
lib/engine.ts   cost, matching, journey and redaction logic
lib/supabase/   server/browser clients, session proxy, data access
supabase/       seed.sql and migrations
tests/          unit tests
```

## Before a real launch

Replace sample data with real, sourced providers; run real verification; get privacy policy and terms reviewed by a
lawyer; add email verification and an admin tool for managing listings; move rate limiting to Redis/Upstash; have a
clinician review the risk and cost model.
