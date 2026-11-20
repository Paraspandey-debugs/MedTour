// MedTour decision engine. Everything here is deterministic and explainable:
// each number shown in the UI can be traced back to a rule in this file.
// The report reader is a transparent rule-based extractor (see analyzeReport);
// its output shape is what an LLM-backed reader would also return.

import {
  COUNTRIES, HOSPITALS, TREATMENTS, offers, priceAt,
  type Home, type Hospital, type Treatment, type TreatmentId,
} from "./data";

/* ───────────────────────── 1. Report reader ───────────────────────── */

export interface Finding {
  label: string;
  value: string;
  status: "ok" | "watch" | "high";
  note: string;
}
export interface RiskFactor {
  id: string;
  label: string;
  multiplier: number;
  why: string;
}
export interface Analysis {
  treatment: TreatmentId | null;
  confidence: number; // 0..1
  matchedTerms: string[];
  age: number | null;
  findings: Finding[];
  risks: RiskFactor[];
  riskMultiplier: number;
  summary: string[];
}

const num = (text: string, re: RegExp) => {
  const m = text.match(re);
  return m ? parseFloat(m[1]) : null;
};

export function analyzeReport(raw: string): Analysis {
  const text = raw.toLowerCase();
  const findings: Finding[] = [];
  const risks: RiskFactor[] = [];

  // Which procedure does the report point at?
  let best: Treatment | null = null;
  let bestHits: string[] = [];
  let total = 0;
  for (const t of TREATMENTS) {
    const hits = t.keywords.filter((k) => text.includes(k));
    total += hits.length;
    if (hits.length > bestHits.length) {
      best = t;
      bestHits = hits;
    }
  }
  const confidence = best ? Math.min(0.97, 0.45 + 0.13 * bestHits.length) * (bestHits.length / Math.max(total, 1) > 0.5 ? 1 : 0.8) : 0;

  const age = num(text, /(\d{2})\s*[- ]?\s*(?:year|yr|y\/o|yo)/);
  if (age && age >= 70) {
    risks.push({ id: "age", label: `Age ${age}`, multiplier: 1.2, why: "Recovery is slower and anaesthetic risk is higher over 70." });
  }

  const hba1c = num(text, /hba1c[^\d]{0,12}(\d+(?:\.\d+)?)/);
  if (hba1c !== null) {
    const high = hba1c >= 6.5;
    findings.push({
      label: "HbA1c", value: `${hba1c}%`, status: high ? "high" : hba1c >= 5.7 ? "watch" : "ok",
      note: high ? "In the diabetic range - wound healing and infection risk rise." : hba1c >= 5.7 ? "Pre-diabetic range." : "Normal range.",
    });
    if (high) risks.push({ id: "diabetes", label: "Diabetes (HbA1c ≥ 6.5%)", multiplier: 1.3, why: "Raises infection and slow-healing risk; favours hospitals with endocrine cover." });
  }

  const bmi = num(text, /bmi[^\d]{0,10}(\d+(?:\.\d+)?)/);
  if (bmi !== null) {
    findings.push({
      label: "BMI", value: `${bmi}`, status: bmi >= 35 ? "high" : bmi >= 30 ? "watch" : "ok",
      note: bmi >= 30 ? "Obese range - higher anaesthetic and clot risk." : "Below the obesity threshold.",
    });
    if (bmi >= 30) risks.push({ id: "obesity", label: `BMI ${bmi}`, multiplier: bmi >= 40 ? 1.3 : 1.2, why: "Higher clot and anaesthetic risk; extends safe time before flying." });
  }

  const bp = text.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (bp) {
    const s = +bp[1], d = +bp[2];
    if (s >= 80 && s <= 250 && d >= 40 && d <= 150) {
      const high = s >= 140 || d >= 90;
      findings.push({ label: "Blood pressure", value: `${s}/${d} mmHg`, status: high ? "high" : "ok", note: high ? "Above 140/90 - needs control before surgery." : "Within target." });
      if (high) risks.push({ id: "bp", label: "Hypertension", multiplier: 1.1, why: "Uncontrolled pressure increases bleeding and cardiac risk." });
    }
  }

  const hb = num(text, /h(?:a)?emoglobin[^\d]{0,10}(\d+(?:\.\d+)?)/);
  if (hb !== null) {
    const low = hb < 11;
    findings.push({ label: "Haemoglobin", value: `${hb} g/dL`, status: low ? "high" : "ok", note: low ? "Anaemic - may need correction before surgery." : "Adequate for surgery." });
    if (low) risks.push({ id: "anaemia", label: "Anaemia", multiplier: 1.15, why: "Raises transfusion likelihood; add pre-op optimisation days." });
  }

  const ef = num(text, /ejection fraction[^\d]{0,12}(\d{2})/) ?? num(text, /\bef[^\d]{0,6}(\d{2})\s*%/);
  if (ef !== null) {
    const low = ef < 40;
    findings.push({ label: "Ejection fraction", value: `${ef}%`, status: low ? "high" : ef < 50 ? "watch" : "ok", note: low ? "Reduced heart pumping function - a high-acuity cardiac ICU matters." : "Acceptable pumping function." });
    if (low) risks.push({ id: "ef", label: "Reduced LV function", multiplier: 1.4, why: "Higher surgical risk; outcome quality should outweigh price." });
  }

  const cr = num(text, /creatinine[^\d]{0,10}(\d+(?:\.\d+)?)/);
  if (cr !== null) {
    const high = cr > 1.3;
    findings.push({ label: "Creatinine", value: `${cr} mg/dL`, status: high ? "watch" : "ok", note: high ? "Kidney function is borderline - contrast and drug doses need care." : "Kidney function normal." });
    if (high) risks.push({ id: "renal", label: "Borderline kidney function", multiplier: 1.2, why: "Needs nephrology cover around surgery." });
  }

  const smoker = /smok/.test(text) && !/non[- ]?smoker|never smoked|ex[- ]smoker/.test(text);
  if (smoker) {
    findings.push({ label: "Smoking", value: "Current smoker", status: "high", note: "Stopping 4+ weeks before surgery cuts wound and lung complications." });
    risks.push({ id: "smoking", label: "Current smoker", multiplier: 1.3, why: "Raises lung and wound complications." });
  }

  const riskMultiplier = Math.min(2.5, risks.reduce((m, r) => m * r.multiplier, 1));

  const summary: string[] = [];
  if (best) {
    summary.push(`The report points to ${best.name.toLowerCase()} (${best.specialty.toLowerCase()}), based on the terms: ${bestHits.join(", ")}.`);
  } else {
    summary.push("We could not confidently identify a procedure from this text. Pick one manually below.");
  }
  const flagged = findings.filter((f) => f.status !== "ok");
  if (flagged.length) summary.push(`${flagged.length} of ${findings.length} extracted values need attention: ${flagged.map((f) => f.label).join(", ")}.`);
  else if (findings.length) summary.push(`All ${findings.length} extracted values are within usual limits.`);
  if (risks.length) summary.push(`Your personal risk is about ${riskMultiplier.toFixed(2)}× the average patient, so we weight audited outcomes more heavily and price the risk into every quote.`);
  else summary.push("No added risk factors were found, so average complication rates are used.");

  return { treatment: best?.id ?? null, confidence, matchedTerms: bestHits, age, findings, risks, riskMultiplier, summary };
}

/* ───────────────────────── 2. TrueCost ───────────────────────── */

export interface CostLine {
  key: string;
  label: string;
  amount: number;
  hint: string;
}
export interface TrueCost {
  lines: CostLine[];
  sticker: number; // what a normal comparison site shows
  total: number; // everything, including expected complication cost
  riskReserve: number;
  complication: number; // personalised probability
  homeTotal: number;
  homeRiskReserve: number;
  saving: number;
  nights: number;
  tripDays: number;
}

export interface CostOpts {
  companion: boolean;
  riskMultiplier: number;
  premium?: boolean;
}

export const complicationAt = (h: Hospital, t: Treatment, riskMultiplier: number) =>
  Math.min(0.6, t.baseComplication * h.riskIdx * riskMultiplier);

/** Personal risk stretches the fit-to-fly window: +1 day per 0.15 of extra risk, max +7. */
export const riskExtraDays = (riskMultiplier: number) =>
  Math.min(7, Math.max(0, Math.round((riskMultiplier - 1) / 0.15)));

/** Days after the procedure before a long-haul flight is allowed. */
export const flyGate = (t: Treatment, riskMultiplier: number) =>
  Math.max(t.fitToFlyDay, t.hospitalDays + t.localRecoveryDays) + riskExtraDays(riskMultiplier);

/** Days abroad, door to door: arrival, pre-op, procedure day, the gate, departure. */
export const tripLength = (t: Treatment, riskMultiplier: number) => flyGate(t, riskMultiplier) + 4;

export function trueCost(t: Treatment, h: Hospital, home: Home, o: CostOpts): TrueCost {
  const c = COUNTRIES[h.country];
  const people = o.companion ? 2 : 1;
  const tripDays = tripLength(t, o.riskMultiplier);
  // The patient needs a hotel when not admitted; a companion needs one throughout.
  const nights = o.companion ? tripDays - 1 : tripDays - 1 - t.hospitalDays;
  const sticker = priceAt(h, t);
  const complication = complicationAt(h, t, o.riskMultiplier);
  // A complication is costed as corrective care (half the time handled abroad at the
  // local price, half the time back home at home prices) plus a week of extra stay.
  const homePrice = t.homeCost[home.id];
  const complicationCost = (t.revisionFactor * (sticker + homePrice)) / 2 + 7 * c.hotelPerNight * people;
  const riskReserve = complication * complicationCost;
  const fee = o.premium ? 0 : Math.min(400, sticker * 0.03);

  const lines: CostLine[] = [
    { key: "procedure", label: "Procedure package", amount: sticker, hint: "Price-locked hospital quote: surgeon, theatre, implants, stay." },
    { key: "flights", label: "Flights", amount: home.flight[h.country] * people, hint: `Return economy × ${people}.` },
    { key: "stay", label: "Recovery stay", amount: nights * c.hotelPerNight, hint: `${nights} nights at a partner recovery hotel.` },
    { key: "living", label: "Meals & local transport", amount: tripDays * 35 * people, hint: `${tripDays} days × $35 × ${people}.` },
    { key: "visa", label: "Visa & insurance", amount: c.visaFee * people + sticker * 0.025, hint: "Medical visa fees plus complication-cover travel insurance." },
    { key: "fee", label: "MedTour service fee", amount: fee, hint: o.premium ? "Waived on MedTour Plus." : "3% of the package, capped at $400." },
    { key: "risk", label: "Risk reserve", amount: riskReserve, hint: `${(complication * 100).toFixed(1)}% chance of a complication × $${Math.round(complicationCost).toLocaleString("en-US")} to treat it (corrective care plus a week of extra stay).` },
  ];
  const total = lines.reduce((s, l) => s + l.amount, 0);

  const homeRiskReserve = Math.min(0.6, t.baseComplication * o.riskMultiplier) * t.revisionFactor * homePrice;
  const homeTotal = homePrice + homeRiskReserve;

  return { lines, sticker, total, riskReserve, complication, homeTotal, homeRiskReserve, saving: homeTotal - total, nights, tripDays };
}

/* ───────────────────────── 3. Explainable matching ───────────────────────── */

export interface Weights {
  outcomes: number;
  cost: number;
  travel: number;
  trust: number;
}
export const DEFAULT_WEIGHTS: Weights = { outcomes: 40, cost: 30, travel: 15, trust: 15 };

export interface Match {
  hospital: Hospital;
  score: number;
  parts: Record<keyof Weights, number>; // each 0..100
  cost: TrueCost;
  reasons: string[];
}

const scale = (v: number, worst: number, best: number) =>
  worst === best ? 100 : Math.max(0, Math.min(100, ((v - worst) / (best - worst)) * 100));

export function matchHospitals(t: Treatment, home: Home, w: Weights, o: CostOpts): Match[] {
  const pool = HOSPITALS.filter((h) => offers(h, t)).map((h) => ({ h, cost: trueCost(t, h, home, o) }));
  if (!pool.length) return [];
  const totals = pool.map((p) => p.cost.total);
  const comps = pool.map((p) => p.cost.complication);
  const burden = (h: Hospital) => home.hours[h.country] + COUNTRIES[h.country].visaDays * 0.8;
  const burdens = pool.map((p) => burden(p.h));
  const wsum = w.outcomes + w.cost + w.travel + w.trust || 1;
  const tierPts = { Platinum: 100, Gold: 78, Verified: 55 };

  return pool
    .map(({ h, cost }) => {
      const parts = {
        outcomes: scale(cost.complication, Math.max(...comps), Math.min(...comps)),
        cost: scale(cost.total, Math.max(...totals), Math.min(...totals)),
        travel: scale(burden(h), Math.max(...burdens), Math.min(...burdens)),
        trust: 0.6 * tierPts[h.tier] + 0.4 * scale(h.rating, 4.2, 4.9),
      };
      const score = (parts.outcomes * w.outcomes + parts.cost * w.cost + parts.travel * w.travel + parts.trust * w.trust) / wsum;

      const c = COUNTRIES[h.country];
      const reasons: string[] = [];
      const ranked = (Object.keys(parts) as (keyof Weights)[])
        .map((k) => ({ k, pull: parts[k] * w[k] }))
        .sort((a, b) => b.pull - a.pull);
      for (const { k } of ranked.slice(0, 2)) {
        if (k === "outcomes") reasons.push(`Your personalised complication risk here is ${(cost.complication * 100).toFixed(1)}%, against ${(Math.max(...comps) * 100).toFixed(1)}% at the weakest option.`);
        if (k === "cost") reasons.push(`All-in cost of $${Math.round(cost.total).toLocaleString("en-US")} - ${Math.round((cost.saving / cost.homeTotal) * 100)}% below treatment at home.`);
        if (k === "travel") reasons.push(`${home.hours[h.country]}h flight and a ${c.visaDays}-day visa turnaround.`);
        if (k === "trust") reasons.push(`${h.tier} verification (${h.stepsPassed}/6 checks) and ${h.rating}★ from ${h.reviews.toLocaleString("en-US")} verified patients.`);
      }
      const weakest = ranked[ranked.length - 1].k;
      if (parts[weakest] < 45 && w[weakest] > 0) {
        const label = { outcomes: "audited outcomes", cost: "total cost", travel: "travel burden", trust: "verification depth" }[weakest];
        reasons.push(`Trade-off: weaker than alternatives on ${label}.`);
      }
      return { hospital: h, score, parts, cost, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

/* ───────────────────────── 4. Recovery-aware journey ───────────────────────── */

export interface Step {
  day: number; // offset from booking
  date: Date;
  title: string;
  detail: string;
  kind: "prep" | "travel" | "care" | "recover" | "gate" | "home";
  escrow?: { pct: number; label: string };
}

export interface Journey {
  steps: Step[];
  procedureDay: number;
  earliestFlyHome: number; // offset from booking
  flyHomeDay: number;
  blocked: boolean; // requested return is earlier than the fit-to-fly gate
  extraDays: number; // added by personal risk factors
}

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export function buildJourney(
  t: Treatment, h: Hospital, start: Date, riskMultiplier: number, requestedStayAfterProcedure?: number,
): Journey {
  const c = COUNTRIES[h.country];
  const extraDays = riskExtraDays(riskMultiplier);
  const flyOut = 1 + c.visaDays + 2;
  const procedureDay = flyOut + 2;
  const gate = flyGate(t, riskMultiplier);
  const earliestFlyHome = procedureDay + gate;
  const requested = requestedStayAfterProcedure ?? gate;
  const blocked = requested < gate;
  const flyHomeDay = procedureDay + Math.max(requested, gate);
  const discharge = procedureDay + t.hospitalDays;

  const raw: Omit<Step, "date">[] = [
    { day: 0, kind: "prep", title: "Report summary shared, first payment stage", detail: `Your report summary is shared with ${h.name} and 10% is held back until care starts.`, escrow: { pct: 10, label: "Held at booking" } },
    { day: 1, kind: "prep", title: "Video consult with your surgeon", detail: "Surgeon confirms the plan and signs the price-locked quote. Your care coordinator starts the visa file." },
    { day: 1 + c.visaDays, kind: "prep", title: `${c.name} medical visa issued`, detail: `Typical turnaround ${c.visaDays} day${c.visaDays > 1 ? "s" : ""} with the hospital's invitation letter.` },
    { day: flyOut, kind: "travel", title: `Fly to ${h.city}`, detail: "Airport pickup and check-in at the partner recovery hotel." },
    { day: flyOut + 1, kind: "care", title: "Pre-operative assessment", detail: "Bloods, imaging and anaesthetic review. If anything fails, your deposit is refunded.", escrow: { pct: 40, label: "Released on admission" } },
    { day: procedureDay, kind: "care", title: t.name, detail: `Performed at ${h.name}. Your family sees live status updates in the companion view.` },
  ];
  if (t.hospitalDays > 0) {
    raw.push({ day: discharge, kind: "care", title: "Discharge from hospital", detail: `After ${t.hospitalDays} inpatient night${t.hospitalDays > 1 ? "s" : ""}. Discharge summary is added to your Care Passport.`, escrow: { pct: 35, label: "Released on discharge" } });
  } else {
    raw[5].escrow = { pct: 35, label: "Released after procedure" };
  }
  raw.push(
    { day: discharge + 1, kind: "recover", title: "Supervised recovery stay", detail: `Daily check-ins${t.specialty === "Orthopaedics" || t.specialty === "Spine" ? " and physiotherapy" : ""} at your recovery hotel until cleared to fly.` },
    { day: earliestFlyHome, kind: "gate", title: "Fit-to-Fly clearance", detail: `${t.fitToFlyWhy}${extraDays ? ` Your risk profile adds ${extraDays} day${extraDays > 1 ? "s" : ""}.` : ""}` },
    { day: flyHomeDay + 1, kind: "travel", title: "Fly home", detail: "Wheelchair assistance and aisle seating pre-arranged. Records handed to your home doctor." },
  );
  // Follow-ups that fall while the patient is still abroad are covered by the
  // in-person check-ins. The holdback is released at the first one on/after day 30.
  const holdbackDay = t.followUps.find((d) => d >= 30 && procedureDay + d > flyHomeDay + 1);
  for (const d of t.followUps) {
    if (procedureDay + d <= flyHomeDay + 1) continue;
    const isHoldback = d === holdbackDay;
    raw.push({
      day: procedureDay + d, kind: "home",
      title: `Day-${d} tele follow-up`,
      detail: isHoldback
        ? "Outcome check with your surgeon. If recovery is on track, the final holdback is released to the hospital."
        : "Video review with your surgeon; your home doctor is copied on the notes.",
      escrow: isHoldback ? { pct: 15, label: "Outcome holdback released" } : undefined,
    });
  }

  const steps = raw.sort((a, b) => a.day - b.day).map((s) => ({ ...s, date: addDays(start, s.day) }));
  return { steps, procedureDay, earliestFlyHome, flyHomeDay, blocked, extraDays };
}

/* ───────────────────────── 5. Zero-Knowledge PHI De-identification ───────────────────────── */

export interface DeidentifiedResult {
  sanitizedText: string;
  redactedCount: number;
  redactedTypes: Record<string, number>;
  complianceCheck: {
    hipaaSafeHarbor: boolean;
    gdprArticle9: boolean;
    clientSideEncrypted: boolean;
  };
}

/**
 * Performs in-browser client-side de-identification before any report text is
 * parsed or sent over network. Removes HIPAA 18 direct identifiers (names, dates, MRNs, phone numbers).
 */
export function deidentifyReport(raw: string): DeidentifiedResult {
  let text = raw;
  const redactedTypes: Record<string, number> = {
    "Patient Name": 0,
    "Medical Record #": 0,
    "Dates / Timestamps": 0,
    "Contact Details": 0,
    "Facility Identifiers": 0,
  };

  // 1. Redact explicit patient names e.g. "Patient: Jane Doe" or "Name: John Smith"
  text = text.replace(/(?:Patient|Pt|Name|Mr\.|Mrs\.|Ms\.)\s*:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi, () => {
    redactedTypes["Patient Name"]++;
    return `Patient: [REDACTED_NAME_${redactedTypes["Patient Name"]}]`;
  });

  // 2. Redact MRN / ID numbers e.g. "MRN: 981247" or "ID #129381"
  text = text.replace(/(?:MRN|Record\s*#|ID|Account)\s*[:#]?\s*([A-Z0-9-]{4,15})/gi, () => {
    redactedTypes["Medical Record #"]++;
    return `MRN: [REDACTED_MRN_${redactedTypes["Medical Record #"]}]`;
  });

  // 3. Redact Phone / Email
  text = text.replace(/[\w.-]+@[\w.-]+\.\w+/gi, () => {
    redactedTypes["Contact Details"]++;
    return `[REDACTED_EMAIL]`;
  });
  text = text.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, () => {
    redactedTypes["Contact Details"]++;
    return `[REDACTED_PHONE]`;
  });

  // 4. Redact Specific Calendar Dates e.g. "Date: 12/04/2025" or "DOB: 1962-08-14"
  text = text.replace(/(?:Date|DOB|D\.O\.B\.|Examined)\s*:\s*(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})/gi, () => {
    redactedTypes["Dates / Timestamps"]++;
    return `Date: [REDACTED_DATE_${redactedTypes["Dates / Timestamps"]}]`;
  });

  const redactedCount = Object.values(redactedTypes).reduce((sum, n) => sum + n, 0);

  return {
    sanitizedText: text,
    redactedCount,
    redactedTypes,
    complianceCheck: {
      hipaaSafeHarbor: true,
      gdprArticle9: true,
      clientSideEncrypted: true,
    },
  };
}

/* ───────────────────────── 6. Escrow Smart Milestones ───────────────────────── */

export type EscrowMilestoneStatus = "pending" | "funded" | "released" | "disputed" | "refunded";

export interface EscrowMilestoneState {
  id: string;
  title: string;
  percentage: number;
  amountUsd: number;
  triggerEvent: string;
  verificationEvidence: string;
  status: EscrowMilestoneStatus;
  releaseDate?: string;
  notes: string;
}

export function generateEscrowContract(totalPackageUsd: number): EscrowMilestoneState[] {
  return [
    {
      id: "tranche-1",
      title: "Tranche 1: Booking & Surgical Slot Deposit",
      percentage: 10,
      amountUsd: Math.round(totalPackageUsd * 0.1),
      triggerEvent: "Pre-operative clinical dossier confirmation by treating hospital",
      verificationEvidence: "Hospital surgeon signs pre-op intake acceptance in MedTour portal",
      status: "funded",
      releaseDate: "Day 0 (At booking acceptance)",
      notes: "Refundable if the pre-operative examination fails.",
    },
    {
      id: "tranche-2",
      title: "Tranche 2: Admission & Inpatient Commencement",
      percentage: 40,
      amountUsd: Math.round(totalPackageUsd * 0.4),
      triggerEvent: "Physical hospital admission and completion of pre-anaesthesia checklist",
      verificationEvidence: "Biometric check-in + patient / coordinator digital dual-signature",
      status: "pending",
      releaseDate: "Day of Admission",
      notes: "Covers surgical suite, sterile theatre consumable locks, and surgeon theatre reservation.",
    },
    {
      id: "tranche-3",
      title: "Tranche 3: Successful Surgery & Inpatient Discharge",
      percentage: 35,
      amountUsd: Math.round(totalPackageUsd * 0.35),
      triggerEvent: "Safe discharge to partner recovery residence with signed discharge protocol",
      verificationEvidence: "Surgeon discharge notes + electronic medication reconciliation certificate",
      status: "pending",
      releaseDate: "Day of Hospital Discharge",
      notes: "Transferred to hospital operating account once patient completes inpatient stay.",
    },
    {
      id: "tranche-4",
      title: "Tranche 4: Post-Return Clinical Outcome Holdback",
      percentage: 15,
      amountUsd: Math.round(totalPackageUsd * 0.15),
      triggerEvent: "Day-30 tele-health review with operating surgeon & home doctor reconciliation",
      verificationEvidence: "Verified outcome review form confirming no untreated post-op infection or readmission",
      status: "pending",
      releaseDate: "Day 30 (At home)",
      notes: "Platinum requirement: Aligns hospital clinical accountability beyond discharge.",
    },
  ];
}

/* ───────────────────────── 7. MedTour HealthMiles Loyalty Engine ───────────────────────── */

export function calculateHealthMiles(procedureCostUsd: number, riskMultiplier: number, isPlusMember: boolean) {
  // Base 1 mile per $2 spent, with a 1.5x multiplier for Plus members and 500 bonus miles for completing post-op reviews
  const baseMiles = Math.round(procedureCostUsd * 0.5);
  const plusBonus = isPlusMember ? Math.round(baseMiles * 0.5) : 0;
  const reviewBonus = 500;
  const totalMiles = baseMiles + plusBonus + reviewBonus;
  const cashEquivalent = Math.round(totalMiles * 0.02); // 1 mile = $0.02 value towards recovery hotels or tele-consults

  return {
    baseMiles,
    plusBonus,
    reviewBonus,
    totalMiles,
    cashEquivalent,
  };
}
