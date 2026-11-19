"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHead, Disclaimer } from "@/components/ui";

const INNOVATIONS = [
  {
    num: "01",
    tag: "Care Passport & MAUT Engine",
    title: "Glass-Box Explainable Matching vs. Black-Box Ad Algorithms",
    description:
      "Legacy medical travel platforms are paid ad-brokers: hospitals pay for premium placement, and matching algorithms are proprietary black boxes. MedTour implements Multi-Attribute Utility Theory (MAUT) with deterministic clinical risk factor extraction.",
    formula: "M_{patient} = \\min\\left(2.5, \\prod_{k \\in \\text{Risks}} m_k\\right)",
    details: [
      "Deterministic lab biomarker extraction (HbA1c ≥ 6.5%, EF < 40%, Creatinine > 1.3 mg/dL, BMI, BP).",
      "Explicit personal risk multiplier (M_patient) dynamically calibrates hospital rankings.",
      "Transparent weight sliders with real-time recalculation and automated trade-off disclosures.",
    ],
  },
  {
    num: "02",
    tag: "TrueCost Actuarial Engine",
    title: "Risk-Adjusted Actuarial Costing vs. Deceptive Sticker Prices",
    description:
      "Comparing hospitals solely on sticker price is clinically and financially dangerous. MedTour creates the first actuarial model that prices in the patient's own complication probability.",
    formula: "\\text{TrueCost} = P_{\\text{pkg}} + P_{\\text{flights}} + P_{\\text{stay}} + P_{\\text{visa}} + P_{\\text{fee}} + \\mathbf{Reserve_{risk}}",
    details: [
      "Reserve_risk = Complication_Probability × Expected_Corrective_Cost.",
      "Demonstrates rank inversion: a $5,000 procedure with 6% complication can cost more all-in than an $8,000 procedure with 1.2% complication.",
      "Direct comparison with home country elective surgery wait times (up to 28 weeks in Canada/UK).",
    ],
  },
  {
    num: "03",
    tag: "Fit-to-Fly Dynamic Gate",
    title: "Recovery-Aware Travel Gating vs. Unregulated Leisure Booking",
    description:
      "Medical tourists are not vacationers. Flying too early causes hypobaric hypoxia, venous thromboembolism (DVT), and staple-line dehiscence. MedTour implements a dynamic safety gate that physically blocks booking premature departures.",
    formula: "\\text{Gate}(T, M) = \\max(D_{\\text{base}}, D_{\\text{hosp}} + D_{\\text{rehab}}) + \\min\\left(7, \\left\\lfloor\\frac{M - 1}{0.15}\\right\\rfloor\\right)",
    details: [
      "Standard clinical windows enforced per procedure (e.g. 21 days for CABG, 14 days for joint replacement).",
      "Personal risk multiplier actively stretches recovery days before flight departure.",
      "Attempting to fly earlier triggers a clinical hard-stop with anatomical explanations.",
    ],
  },
  {
    num: "04",
    tag: "Outcome Escrow (10/40/35/15)",
    title: "Milestone-Linked Financial Settlement vs. 100% Upfront Wire Transfers",
    description:
      "The fundamental flaw of cross-border healthcare is moral hazard: once a foreign hospital receives 100% upfront payment, their financial incentive to support post-discharge recovery evaporates.",
    formula: "\\text{Settlement} = 10\\% \\text{ (Deposit)} + 40\\% \\text{ (Admission)} + 35\\% \\text{ (Discharge)} + \\mathbf{15\\% \\text{ (Day-30 Holdback)}}",
    details: [
      "10% booking deposit refundable if pre-op hospital physical examination fails.",
      "Crucial 15% outcome holdback retained in escrow until Day-30 tele-review verification.",
      "Incentivizes hospital post-operative continuity; platinum hospital tier requires accepting this escrow.",
    ],
  },
  {
    num: "05",
    tag: "Verification Ledger",
    title: "6-Stage Cryptographic Audit Trail vs. Purchased Badges",
    description:
      "Hospital listing cannot be purchased. It must be earned sequentially across 6 stringent verification gates, culminating in audited outcome records and escrow acceptance.",
    formula: "\\text{Tier} = f(\\text{Licence} \\to \\text{Accreditation} \\to \\text{Outcomes} \\to \\text{Inspection} \\to \\text{Price-Lock} \\to \\text{Escrow})",
    details: [
      "Sequential verification: failure at Step 3 prevents Gold or Platinum listing.",
      "Mandatory 12-month re-audit frequency; lapsed audits automatically downgrade provider tier.",
      "Outcome records cross-referenced against JCI, NABH, and TEMOS accreditation databases.",
    ],
  },
];

const PROFESSOR_FAQS = [
  {
    q: "Is MedTour's AI report analysis practicing medicine without a license?",
    a: "No. MedTour is architected under FDA Software as a Medical Device (SaMD) Class I Clinical Decision Support (CDS) guidelines. The engine does not diagnose or prescribe. It performs deterministic clinical parameter extraction (lab ranges, surgical keywords) and explicitly states that all surgical clearances and surgical plans must be confirmed in writing by licensed treating surgeons prior to booking.",
  },
  {
    q: "Why would reputable hospitals agree to a 15% payment holdback for 30 days?",
    a: "Top tertiary hospitals (such as JCI-accredited academic institutes) face high patient acquisition costs (CAC) through traditional brokers ($1,500-$3,000 per patient). MedTour reduces CAC by over 60% and guarantees pre-cleared, medically documented international patients. In exchange, top hospitals view the 15% holdback as a low-cost trust badge that earns them Platinum tier status and higher volume.",
  },
  {
    q: "How does MedTour protect itself against adverse selection (only high-risk patients traveling)?",
    a: "The TrueCost engine actively prices in risk. If a patient's risk multiplier exceeds 2.2x, the risk reserve scales proportionally, making low-acuity budget clinics financially unviable for them and directing them toward high-volume tertiary hospitals with surgical ICUs. Extreme contraindications (e.g. EF < 25%, acute uncompensated organ failure) trigger non-travel recommendations.",
  },
  {
    q: "How does MedTour comply with international privacy regulations across borders (HIPAA vs. GDPR)?",
    a: "MedTour implements zero-knowledge client-side PHI de-identification. Before report text leaves the browser session, all HIPAA 18 direct identifiers (names, dates, MRNs, phone numbers) are scrubbed via in-browser regex. The central matcher only receives an anonymized clinical profile. The patient retains the cryptographic decryption key locally on their device.",
  },
  {
    q: "What if the patient's home doctor refuses to participate in post-operative care?",
    a: "This is a documented challenge in medical tourism. MedTour solves this by bundling a dedicated tele-health follow-up protocol with the operating surgeon (at Day 14, 30, and 90) and generating standardized HL7/FHIR cross-border continuity summaries (including implant serial numbers and pathology), which legally integrate into national electronic health record systems.",
  },
  {
    q: "How does the platform earn revenue if it charges no listing fees to hospitals?",
    a: "MedTour aligns its business model with successful patient outcomes: (1) Hospital commission collected from escrow upon successful milestone discharge, (2) 3% patient service fee (capped at $400), (3) Travel and recovery hotel partner commissions, and (4) MedTour Plus subscription ($19/mo) for dedicated concierges and waived fees.",
  },
];

export default function DefensePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <>
      <PageHead
        eyebrow="Academic Defense Dossier · Group No. 19"
        title="Why MedTour is a Defensible, Groundbreaking Innovation"
      >
        A comprehensive academic and clinical justification of MedTour&apos;s decision and risk engine,
        system architecture, and business model defensibility.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
        {/* Core Thesis Card */}
        <section className="rounded-3xl bg-deep text-white p-6 sm:p-10 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs uppercase tracking-widest text-mint font-bold px-3 py-1 rounded-full bg-white/10">
              Core Architectural Thesis
            </span>
            <span className="text-xs text-white/70">Course Capstone · Group No. 19</span>
          </div>

          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-white max-w-3xl leading-snug">
            Moving Medical Tourism from an Unregulated Advertising Directory to an Actuarial Decision Engine
          </h2>

          <p className="mt-4 text-base text-white/80 max-w-3xl leading-relaxed">
            Existing medical tourism websites operate as travel agencies selling surgery like holiday packages.
            They hide complication risks, ignore flight physiology, and leave patients stranded the moment
            they return home. MedTour transforms cross-border healthcare by introducing
            <b> personalized risk multiplication</b>, <b>actuarial pricing</b>, <b>recovery-gated travel clearance</b>,
            and <b>outcome-linked financial escrow</b>.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-6 text-center">
            <div>
              <p className="font-display text-3xl text-mint num">5</p>
              <p className="text-xs text-white/60 mt-1">Core Breakthroughs</p>
            </div>
            <div>
              <p className="font-display text-3xl text-mint num">15%</p>
              <p className="text-xs text-white/60 mt-1">Day-30 Outcome Escrow</p>
            </div>
            <div>
              <p className="font-display text-3xl text-mint num">0%</p>
              <p className="text-xs text-white/60 mt-1">Ad-Sponsored Ranking Bias</p>
            </div>
            <div>
              <p className="font-display text-3xl text-mint num">100%</p>
              <p className="text-xs text-white/60 mt-1">Explainable Math Formulation</p>
            </div>
          </div>
        </section>

        {/* Section 1: The 5 Proprietary Innovations */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Defensible Product Innovations</p>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">The Five Pillars of Differentiation</h2>
            </div>
          </div>

          <div className="grid gap-6">
            {INNOVATIONS.map((inn) => (
              <div key={inn.num} className="card p-6 sm:p-8 bg-paper">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-3xl text-coral font-bold num">{inn.num}</span>
                    <span className="text-xs uppercase tracking-wider bg-sand px-2.5 py-0.5 rounded font-bold text-muted">
                      {inn.tag}
                    </span>
                  </div>
                  <span className="text-xs text-muted font-medium">Algorithmic Moat</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl mt-3">{inn.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{inn.description}</p>

                <div className="mt-4 rounded-xl bg-ink text-white p-3.5 font-mono text-xs overflow-x-auto">
                  <span className="text-mint font-semibold">// Formal Formulation:</span>
                  <p className="mt-1 text-white/90">{inn.formula}</p>
                </div>

                <ul className="mt-4 grid gap-2 sm:grid-cols-3 text-xs text-ink/80 pt-2 border-t border-line">
                  {inn.details.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-teal font-bold">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Comparison Matrix Table */}
        <section className="card p-6 sm:p-8">
          <p className="eyebrow">Competitive Moat</p>
          <h2 className="font-display text-2xl sm:text-3xl mt-1">
            MedTour vs. Legacy Medical Tourism Aggregators
          </h2>
          <p className="mt-2 text-sm text-muted">
            Direct feature-by-feature comparison against traditional platforms (e.g., Bookimed, PlacidWay, WhatClinic).
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted uppercase">
                  <th className="py-3 font-semibold">Evaluation Dimension</th>
                  <th className="py-3 font-semibold text-muted">Legacy Aggregators</th>
                  <th className="py-3 font-semibold text-teal">MedTour Decision Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs">
                <tr>
                  <td className="py-3.5 font-semibold">Pricing Model</td>
                  <td className="py-3.5 text-muted">Sticker price only (ignores complications, hidden fees)</td>
                  <td className="py-3.5 font-semibold text-teal">TrueCost actuarial model with personalized risk reserve</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold">Provider Ranking</td>
                  <td className="py-3.5 text-muted">Pay-to-play: hospitals paying highest commissions rank first</td>
                  <td className="py-3.5 font-semibold text-teal">Explainable MAUT: weighted by outcomes, risk, and audit depth</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold">Travel Planning</td>
                  <td className="py-3.5 text-muted">Unregulated tourist booking; no clinical flight clearance</td>
                  <td className="py-3.5 font-semibold text-teal">Fit-to-Fly dynamic gate that blocks medically unsafe departures</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold">Payment Terms</td>
                  <td className="py-3.5 text-muted">100% upfront wire transfer directly to hospital</td>
                  <td className="py-3.5 font-semibold text-teal">Outcome Escrow (10/40/35) with 15% Day-30 clinical holdback</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold">Health Data Privacy</td>
                  <td className="py-3.5 text-muted">Medical reports emailed or uploaded to unencrypted databases</td>
                  <td className="py-3.5 font-semibold text-teal">Zero-knowledge client-side PHI de-identification (HIPAA Safe Harbor)</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-semibold">Post-Operative Care</td>
                  <td className="py-3.5 text-muted">Zero responsibility once patient exits foreign hospital</td>
                  <td className="py-3.5 font-semibold text-teal">24/7 Care Coordinator desk + Day-14/30/90 tele-consults</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Anticipated Professor Q&A Matrix */}
        <section className="card p-6 sm:p-8 bg-paper">
          <p className="eyebrow">Academic Defense Preparation</p>
          <h2 className="font-display text-2xl sm:text-3xl mt-1">
            Professor Q&amp;A Anticipation Matrix
          </h2>
          <p className="mt-2 text-sm text-muted">
            Click any question to view the airtight academic, clinical, and financial defense.
          </p>

          <div className="mt-6 space-y-3">
            {PROFESSOR_FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-line bg-white p-4 transition-colors">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-semibold text-sm sm:text-base gap-3"
                  >
                    <span>{faq.q}</span>
                    <span className="text-teal font-bold text-lg">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-line/60 text-xs text-muted leading-relaxed">
                      <p className="text-ink font-normal">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex gap-3">
            <Link href="/match" className="btn btn-primary text-xs">
              Live Demo: Report Matcher →
            </Link>
            <Link href="/cost" className="btn btn-ghost text-xs">
              Live Demo: TrueCost Engine →
            </Link>
          </div>
          <Link href="/partners#model" className="text-xs text-teal font-semibold hover:underline">
            View Platform Unit Economics &amp; Partner Model →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-12">
        <Disclaimer>
          MedTour Academic Defense Dossier is prepared for course project evaluation by Group No. 19.
          All mathematical models, clinical gates, and escrow frameworks are proprietary conceptual designs.
        </Disclaimer>
      </div>
    </>
  );
}
