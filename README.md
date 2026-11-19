# MedTour

**Better Healthcare, Global Access, Healthier Tomorrow** · Group No. 19

A medical-tourism platform prototype built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4.

```bash
npm install
npm run dev      # http://localhost:3000
```

## The idea in one line

Existing medical-tourism sites are **directories**: they list hospitals and sticker prices.
MedTour is a **decision and risk engine**: it prices in the patient's own medical risk, plans travel
around healing, and pays the hospital only as the patient recovers.

## What is new (and where to demo it)

| # | Innovation | What it does | Why it is different | Page |
|---|---|---|---|---|
| 1 | **Care Passport** - explainable report analysis | Reads a medical report, extracts lab values, flags risk factors, and produces a *personal risk multiplier*. Ranks hospitals with a visible score breakdown and adjustable weights. | Matching is transparent: every score shows its parts, its reasons and its trade-off. No black box. | `/match` |
| 2 | **TrueCost** - risk-adjusted pricing | Total = package + flights + stay + visa/insurance + fee + **risk reserve** (hospital complication rate × personal risk × cost of treating a complication). | Competitors compare sticker prices. TrueCost shows when the cheapest sticker is not the cheapest trip, and shows rank changes. | `/cost` |
| 3 | **Fit-to-Fly** - recovery-aware itinerary | The return flight sits behind a medical clearance gate per procedure; personal risk adds days. Try to fly early and the planner refuses and explains why. | Travel planners optimise fares; this one optimises safe recovery. | `/journey` |
| 4 | **Outcome Escrow** - milestone payments | 10% held at booking, 40% released on admission, 35% on discharge, **15% held back until the post-return outcome check**. | Aligns the hospital's incentive with the patient's result, and the platform earns commission only when milestones are met. | `/security`, `/journey` |
| 5 | **24/7 Clinical Care Concierge & Mobile Companion** | Aria AI concierge paired with human desks, live family theatre status tracking, and native iOS/Android offline companion simulator. | No patient is ever left abandoned in an unfamiliar healthcare system. | `/coordinator` |
| 6 | **Zero-Knowledge Privacy Vault** | In-browser client-side regex scrubs HIPAA 18 identifiers before transmission; multi-currency settlement with 90-day FX locks. | Demonstrates strict compliance with HIPAA Safe Harbor and GDPR Article 9. | `/security` |
| 7 | **Specialists Directory & Verification Ledger** | Verified database of world-class surgical specialists with audited caseloads and 6-stage sequential hospital verification ledger. | Roster cannot be bought with advertising; earned through sequential clinical audit. | `/hospitals`, `/hospitals/[id]` |
| 8 | **HealthMiles & Discharge-Verified Trust** | Rewards patients with HealthMiles across recovery journeys; reviews require an unforgeable cryptographic discharge hash. | Zero fake reviews or astroturfing; aligns patient community trust. | `/loyalty` |
| 9 | **Academic Defense Dossier** | Formal mathematical proofs, game theory equilibrium, and 8-question professor Q&A matrix designed for course examination. | Provides airtight academic defensibility for university evaluation. | `/defense` |

The four patient features share one number - the **personal risk multiplier** - which flows from the
report into the ranking, the price and the recovery timeline. That link is the core of the concept.

## Suggested 4-minute demo for the Professor

1. `/match` → click the **Coronary artery disease** sample. Point at the 2.18× personal risk multiplier and explainable trade-off breakdown.
2. Drag **Total cost** to maximum - the ranking reorders live. Click **Cost breakdown**.
3. `/cost` → drag the risk slider and watch the risk reserve and trip length grow, showing how rank inversion occurs.
4. `/journey` → drag "I want to fly home" left until the flight is **blocked** by the Fit-to-Fly clinical safety gate.
5. `/coordinator` → ask Aria a medication or flight question; switch between iOS & Android simulator tabs (Care Passport QR, Vitals Tracker, 1-touch Emergency SOS).
6. `/security` → test client-side PHI de-identification and trigger "Simulate Dispute" on the 15% outcome escrow holdback.
7. `/hospitals` → toggle between "Hospitals" and "Specialists & Surgeons" with audited complication rates.
8. `/defense` → present the formal mathematical formulations and Professor Q&A Defense Matrix!

## Coverage of the brief

- Verified provider directory + doctors & specialists + onboarding workflow: `/hospitals`, `/hospitals/[id]`, `/partners`
- AI report analysis & matching: `/match`
- Transparent cost estimator & multi-currency engine: `/cost`, `/security`
- End-to-end travel planner (visa, stay, transport, itinerary, follow-ups): `/journey`
- Care coordination, 24/7 assistance & mobile companion apps (iOS/Android): `/coordinator`
- User engagement, reviews, loyalty HealthMiles & special offers: `/loyalty`, `/partners`
- Security, zero-knowledge privacy vault & milestone escrow: `/security`
- Academic innovation defense dossier: `/defense`

## Structure

```
lib/data.ts      treatments, countries, hospitals, doctors, currencies, special packages, sample reports
lib/engine.ts    analyzeReport · trueCost · matchHospitals · buildJourney · deidentifyReport · escrow & loyalty
app/             pages (match, hospitals, cost, journey, coordinator, security, loyalty, defense, partners)
components/      Nav and shared UI
```
