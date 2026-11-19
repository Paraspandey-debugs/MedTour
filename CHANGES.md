# Changes in this round (phase 1 review + phase 2 redesign)

## Fixed on top of the earlier security pass
- `npm ci` was failing (peer-dependency conflict: vitest needs `@types/node` >= 22). Bumped to `^22`, so CI can pass.
- Removed remaining false claims that earlier cleanup missed: "zero-knowledge", "AES-256 client redacted", "regulated
  tier-1 bank escrow", "UNCITRAL arbitration", "Independent Medical Review Board", "90-day currency hedge",
  "discharge-verified reviews / anti-astroturfing guarantee", "Dr. Rachel Vance" (invented human coordinator),
  "audited / verified" hospitals and doctors, fake Digital Care Pass token, invented patient stories.
- Assistant greeting no longer says it is "connected to your clinical travel file" or hospital desks.

## New product flow
- New homepage: one sentence, an inline procedure + home-country form, 3-step "How it works", example, what's included,
  and an honest "What is real today" table.
- Nav reduced to Compare hospitals / How it works / Security & privacy / Sign in, with an account menu, accessible
  mobile sheet (focus trap, Escape, route-change close).
- `/hospitals` reads `procedure` and `from`, shows total trip cost per hospital, sorts by lowest cost / rating /
  shortest trip, cost breakdown on expand, skeleton/empty/error states, advanced filters collapsed.
- Hospital page: total cost above the fold, **Request a quote** form -> `/api/quote` -> `quote_requests` table (RLS).
- Dashboard: real quote requests and latest saved plan, no fake data.
- Plain-language renames: Care Passport -> Analyse my report, TrueCost -> Total cost, Fit-to-Fly -> safe-to-fly date,
  risk multiplier -> personal risk adjustment, risk reserve -> complication buffer, Concierge -> assistant.
- Privacy policy and terms pages (templates; need legal review), sitemap, robots, OpenGraph, skip link, footer.

## Prescription & Medical Document Analysis Redesign
- **Fix Blocking Flow**: `/api/analyze-report` now supports guest prospective patients (rate-limited by IP) and authenticated users (rate-limited by User ID) instead of failing with 401.
- **Enhanced Document Ingestion**: Supports drag-and-drop file uploads for PDF, PNG, JPG, JPEG, and WebP (with automatic client-side canvas conversion to JPEG to prevent Gemini WebP errors).
- **Interactive Progress Workflow**: During analysis, displays an animated multi-step progress ticker (HIPAA redaction -> vision scan -> biomarker extraction -> risk calculation) preventing the feeling of the UI being blocked or frozen.
- **Improved UI & Synthesis**:
  - Prominent detected procedure card with match confidence, specialty, and one-click override.
  - Manual procedure selection fallback when a prescription does not explicitly specify a surgical procedure.
  - Calibrated lab biomarker cards (HbA1c, BMI, BP, EF, Creatinine).
  - Risk multiplier meter ($M_{patient}$) with travel recovery day adjustments.
  - AI-generated teleconsultation questions for the treating surgeon.
  - Quick jump button to matched hospital rankings.
  - Clear error alerts with retry capability instead of silent empty fallback.

## You must do manually
1. Apply `supabase/migrations/20261119010000_quote_requests.sql` (and `...000000_fix_rls_policies.sql` if not yet applied).
2. Set `NEXT_PUBLIC_SITE_URL` in production.
3. Rotate Gemini/Supabase keys if they were ever committed or the repo was public with real keys.
4. Have a lawyer review `/privacy` and `/terms`.
