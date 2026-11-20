# MedTour

**Compare the real cost of planned surgery abroad.**

Pick a procedure and the country you live in. MedTour shows the total trip cost for each hospital: procedure, flights,
recovery stay, visa and insurance, and a buffer for complications. Then you can request a quote.

> Costs are estimates based on published partner pricing. Always confirm final pricing and clinical details with your
> hospital and doctor. Nothing here is medical advice.

## What MedTour offers

| Feature | Status |
|---|---|
| Total-cost comparison (`/hospitals`, `/cost`) | Live, calculated from current partner pricing |
| Hospital and specialist listings | Verified through the six-step partner audit |
| Report analysis (`/match`) | Live, AI-assisted (Google Gemini), informational only |
| Quote requests (`/hospitals/[id]`, `/dashboard`) | Live, stored in Supabase and sent to the hospital |
| AI assistant (`/coordinator`) | Live, general information only, requires sign-in |
| Trip plan (`/journey`) | Live, day-by-day timeline with a safe-to-fly date |
| Milestone payments (`/security`) | Staged payments held by a licensed escrow partner |
| Rewards, reviews, hospital onboarding (`/loyalty`, `/partners`) | MedTour Plus and partner programmes |

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

1. `supabase/seed.sql` (tables, RLS, seed data, quote requests), **or** apply `supabase/migrations/*.sql` to an existing project
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
lib/data.ts     partner treatments, hospitals, doctors, currencies
lib/engine.ts   cost, matching, journey and redaction logic
lib/supabase/   server/browser clients, session proxy, data access
supabase/       seed.sql and migrations
tests/          unit tests
```

## Operational checklist

Keep provider data sourced and current; maintain the verification audit; get the privacy policy and terms reviewed by
counsel; add email verification and an admin tool for managing listings; move rate limiting to Redis/Upstash; have a
clinician review the risk and cost model.
