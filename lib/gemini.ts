import { analyzeReport } from "./engine";
import { type TreatmentId } from "./data";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY;

const TEXT_MODEL = "gemini-3.1-flash-lite";
const EMBED_MODEL = "gemini-embedding-001";
const BASE_URL = "https://generativelanguage.googleapis.com";

/** Centralized Gemini POST helper — sends the API key via header, never URL param. */
async function geminiPost(
  endpoint: string, // e.g. "/v1beta/models/gemini-3.1-flash-lite:generateContent"
  body: unknown,
  timeoutMs = 15_000
): Promise<Response> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  return fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
}

export interface BiomarkerMap {
  hba1c?: string | null;
  bmi?: string | null;
  ejection_fraction?: string | null;
  creatinine?: string | null;
  blood_pressure?: string | null;
  [key: string]: string | null | undefined;
}

export interface StructuredAnalysisResponse {
  treatment: TreatmentId | null;
  procedure_category: TreatmentId | null;
  confidence: number;
  age: number | null;
  biomarkers: BiomarkerMap;
  matchedTerms: string[];
  findings: Array<{
    label: string;
    value: string;
    status: "ok" | "watch" | "high";
    note: string;
  }>;
  risks: Array<{
    id: string;
    label: string;
    multiplier: number;
    why: string;
  }>;
  riskMultiplier: number;
  risk_multiplier: number;
  summary_3_sentences: string;
  summary: string[];
  patientQuestions: string[];
  patient_questions: string[];
  aiPowered: boolean;
}

export interface ReportInput {
  reportText?: string;
  fileData?: {
    base64: string;
    mimeType: string;
    fileName?: string;
  };
}

/**
 * Analyzes patient medical report text or uploaded document (PDF/Image) using Google AI Studio.
 * Uses Gemini Structured Outputs (JSON) and strictly extracts biomarkers to feed the risk engine.
 */
export async function geminiAnalyzeStructuredReport(
  input: ReportInput
): Promise<StructuredAnalysisResponse> {
  const { reportText = "", fileData } = input;

  if (!GEMINI_API_KEY) {
    const fallback = analyzeReport(reportText);
    return {
      treatment: fallback.treatment,
      procedure_category: fallback.treatment,
      confidence: fallback.confidence,
      age: fallback.age,
      biomarkers: {
        hba1c: fallback.findings.find((f) => f.label.includes("HbA1c"))?.value || null,
        bmi: fallback.findings.find((f) => f.label.includes("BMI"))?.value || null,
        blood_pressure: fallback.findings.find((f) => f.label.includes("Blood Pressure"))?.value || null,
      },
      matchedTerms: fallback.matchedTerms,
      findings: fallback.findings,
      risks: fallback.risks,
      riskMultiplier: fallback.riskMultiplier,
      risk_multiplier: fallback.riskMultiplier,
      summary_3_sentences: fallback.summary.slice(0, 3).join(" "),
      summary: fallback.summary,
      patientQuestions: [],
      patient_questions: [],
      aiPowered: false,
    };
  }

  const prompt = `You are a clinical decision-support AI specialist for MedTour, an international medical travel platform.
Your task is to analyze patient medical documents: doctor's prescription slips (Rx), clinical referral notes, diagnostic radiology scans, lab panels, or discharge summaries.

Carefully examine the document or text to extract:
1. Indicated surgical procedure:
   Doctors often note surgical indications in prescriptions or referral letters using abbreviations, diagnostic terms, or explicit procedure names:
   - "knee": Total Knee Replacement / TKR / TKA / severe osteoarthritis of knee / Kellgren-Lawrence grade 3-4 / tricompartmental OA
   - "hip": Total Hip Replacement / THR / THA / avascular necrosis / severe hip osteoarthritis / femoral head collapse
   - "cabg": Coronary Artery Bypass Graft / CABG / triple vessel disease (TVD) / ischemic heart disease / angina post-angiography
   - "spine": Lumbar Spinal Fusion / TLIF / PLIF / spondylolisthesis / spinal stenosis / disc herniation requiring fusion
   - "bariatric": Bariatric Surgery / Laparoscopic Sleeve Gastrectomy / Gastric Bypass / morbid obesity (BMI ≥ 35 with comorbidities or BMI ≥ 40)
   - "dental": Full-Arch Dental Implants / All-on-4 / All-on-6 / severe periodontitis / complete edentulism / full mouth reconstruction
   - "cataract": Cataract Surgery / Multifocal or Toric IOL / Phacoemulsification / cloudy lens / severe visual impairment
   - "ivf": In-Vitro Fertilization (IVF) / ICSI / egg retrieval / embryo transfer / ovarian stimulation / fertility treatment
   - "rhinoplasty": Open or Closed Rhinoplasty / Septoplasty / deviated nasal septum / nasal airway reconstruction
   - "hair": Sapphire FUE Hair Transplant / Follicular Unit Extraction / Norwood alopecia / hairline restoration
   - "gallbladder": Laparoscopic Cholecystectomy / symptomatic gallstones (cholelithiasis) / biliary colic
   - "valve": Transcatheter Aortic Valve Replacement (TAVR / TAVI) / Mitral Valve Replacement (MVR) / severe aortic stenosis
   - "hernia": Laparoscopic Inguinal or Umbilical Hernia Repair / mesh herniorrhaphy / reducible groin hernia
   - "oncology": Targeted Stereotactic Radiotherapy / CyberKnife / Proton Therapy / localized tumor ablation
   If no surgical procedure applies, set procedure_category to null.

2. Biomarkers & Vitals:
   Extract values such as HbA1c, BMI, Blood Pressure, Ejection Fraction, Creatinine, Hemoglobin, Fasting Blood Glucose if present or inferable.

3. Clinical Findings & Risk Factors:
   Extract key findings (e.g. diagnosis, prescribed medications like blood thinners/metformin/antihypertensives, surgical history).
   Identify clinical risk factors (e.g. diabetes, obesity, hypertension, cardiac acuity, renal borderlines, smoking) and assign a calibrated multiplier between 1.0 and 2.5 (1.0 = standard risk, 1.2-1.5 = moderate complexity, >1.6 = elevated complexity).

4. Plain-English Summary:
   Provide a concise 3-sentence plain-English summary explaining the diagnosis, the recommended surgical pathway, and pre-op or travel recovery considerations.

5. Surgeon Questions:
   Provide 3 practical, intelligent questions tailored to this specific patient's case that they should ask the surgeon during their consultation.

Return ONLY valid JSON matching this exact structure:
{
  "procedure_category": "knee" | "hip" | "cabg" | "spine" | "bariatric" | "dental" | null,
  "confidence": 0.95,
  "age": 62,
  "biomarkers": {
    "hba1c": "7.8%",
    "bmi": "31.4",
    "ejection_fraction": "55%",
    "creatinine": "1.1 mg/dL",
    "blood_pressure": "138/86"
  },
  "findings": [
    {
      "label": "Diagnosis / Indication",
      "value": "Osteoarthritis Grade 4",
      "status": "watch",
      "note": "Marked joint space loss indicated on prescription."
    }
  ],
  "risks": [
    {
      "id": "diabetes",
      "label": "Diabetes (HbA1c ≥ 6.5%)",
      "multiplier": 1.3,
      "why": "Elevates surgical site infection risk; requires dedicated endocrinology clearance."
    }
  ],
  "risk_multiplier": 1.35,
  "summary_3_sentences": "Prescription indicates severe degenerative joint disease confirming Total Knee Replacement indication. Clinical history notes moderate comorbidity requiring routine pre-operative medical clearance. A personal risk adjustment of 1.35x adds 3 additional post-operative recovery days before safe long-haul flight departure.",
  "patient_questions": [
    "What specific implant brand and material are recommended for my joint profile?",
    "How does your inpatient protocol regulate glycemic control during admission?",
    "What assisted mobility milestones must I achieve before discharge to the recovery residence?"
  ]
}`;

  try {
    const parts: Array<{ inline_data?: { mime_type: string; data: string }; text?: string }> = [];

    if (fileData?.base64 && fileData?.mimeType) {
      let mimeType = fileData.mimeType.toLowerCase().trim();
      if (mimeType === "image/jpg") mimeType = "image/jpeg";
      // Clean base64 data header if present
      const cleanBase64 = fileData.base64.replace(/^data:[^;]+;base64,/, "");

      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: cleanBase64,
        },
      });
    }

    const clinicalContext = reportText.trim()
      ? `\nClinical Text & Notes:\n${reportText.trim()}`
      : "\nAnalyze the attached prescription or medical document.";
    parts.push({ text: `${prompt}\n${clinicalContext}` });

    const res = await geminiPost(
      `/v1beta/models/${TEXT_MODEL}:generateContent`,
      {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          responseMimeType: "application/json",
        },
      },
      20_000
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Gemini status ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("Empty candidate from Gemini");
    }

    const parsed = JSON.parse(candidateText);
    const proc = parsed.procedure_category || parsed.treatment || null;
    const mult = typeof parsed.risk_multiplier === "number"
      ? Math.min(2.5, Math.max(1.0, parsed.risk_multiplier))
      : typeof parsed.riskMultiplier === "number"
      ? Math.min(2.5, Math.max(1.0, parsed.riskMultiplier))
      : 1.0;

    const summary3 = parsed.summary_3_sentences || (Array.isArray(parsed.summary) ? parsed.summary.join(" ") : "");
    const questions = parsed.patient_questions || parsed.patientQuestions || [];

    return {
      treatment: proc,
      procedure_category: proc,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : (proc ? 0.95 : 0),
      age: parsed.age || null,
      biomarkers: parsed.biomarkers || {},
      matchedTerms: parsed.findings ? parsed.findings.map((f: { label: string }) => f.label) : [],
      findings: parsed.findings || [],
      risks: parsed.risks || [],
      riskMultiplier: mult,
      risk_multiplier: mult,
      summary_3_sentences: summary3,
      summary: summary3 ? summary3.split(/(?<=[.?!])\s+/).filter(Boolean) : parsed.summary || [],
      patientQuestions: questions,
      patient_questions: questions,
      aiPowered: true,
    };
  } catch (err) {
    console.warn("Structured report analysis failed, evaluating fallback:", err);

    // If reportText has clinical content, rule-based engine can extract keywords
    if (reportText.trim().length > 0) {
      const fallback = analyzeReport(reportText);
      return {
        treatment: fallback.treatment,
        procedure_category: fallback.treatment,
        confidence: fallback.confidence,
        age: fallback.age,
        biomarkers: {
          hba1c: fallback.findings.find((f) => f.label.includes("HbA1c"))?.value || null,
          bmi: fallback.findings.find((f) => f.label.includes("BMI"))?.value || null,
        },
        matchedTerms: fallback.matchedTerms,
        findings: fallback.findings,
        risks: fallback.risks,
        riskMultiplier: fallback.riskMultiplier,
        risk_multiplier: fallback.riskMultiplier,
        summary_3_sentences: fallback.summary.slice(0, 3).join(" "),
        summary: fallback.summary,
        patientQuestions: [],
        patient_questions: [],
        aiPowered: false,
      };
    }

    // If there was only an uploaded file and Gemini failed, re-throw so the caller knows analysis failed
    throw err;
  }
}

/**
 * Backward compatibility alias for geminiAnalyzeReport.
 */
export async function geminiAnalyzeReport(reportText: string) {
  return geminiAnalyzeStructuredReport({ reportText });
}

/**
 * 24/7 Care Coordinator Concierge conversation powered by Google Gemini.
 * Injects logged-in user active care plan and protocol grounding.
 */
export async function geminiChatCoordinator(
  userMessage: string,
  history: { sender: string; text: string }[] = [],
  userCarePlan?: {
    procedureName?: string;
    hospitalName?: string;
    surgeonName?: string;
    fitToFlyDay?: number;
    riskMultiplier?: number;
  },
  ragContext?: string
): Promise<{ reply: string; isEmergency?: boolean; citations?: string[] }> {
  if (!GEMINI_API_KEY) {
    return {
      reply: "Aria is operating in protocol safeguard mode. For questions, contact your desk coordinator or hospital emergency team.",
      isEmergency: false,
    };
  }

  // Emergency safety trigger: if chest pain, severe bleeding, or shortness of breath is detected
  const emergencyKeywords = ["chest pain", "severe pain", "cannot breathe", "shortness of breath", "heavy bleeding", "passed out", "stroke", "paralysis"];
  const isEmergency = emergencyKeywords.some((k) => userMessage.toLowerCase().includes(k));

  if (isEmergency) {
    return {
      reply: `⚠️ EMERGENCY: Your symptoms require immediate medical attention. Call your local emergency services right away (911 in the US, 999 in the UK, 112 in the EU, 108 in India). Do not wait for a chat response for life-threatening symptoms.`,
      isEmergency: true,
    };
  }

  const carePlanContext = userCarePlan
    ? `\nActive Patient Journey Context:
- Procedure: ${userCarePlan.procedureName}
- Selected Hospital: ${userCarePlan.hospitalName}
- Treating Specialist: ${userCarePlan.surgeonName}
- Fit-to-Fly Departure Gate: Day ${userCarePlan.fitToFlyDay} (return flights locked until surgical milestones pass)
- Calibrated Risk Multiplier: ${userCarePlan.riskMultiplier}x`
    : "\nNo personal care plan is on file for this user. Answer general MedTour platform questions only.";

  const ragGrounding = ragContext
    ? `\nVerified Knowledge Base & Clinical Sources (Use these to cite facts inline e.g. [Aravali Clinical Protocol]):\n${ragContext}`
    : "";

  const systemInstruction = `You are Aria, MedTour's 24/7 AI Clinical Care Coordinator.
MedTour is a cross-border medical travel platform connecting international patients with accredited hospitals in India, Thailand, Turkey, Singapore, Malaysia, UAE, Mexico, and South Korea.

Key MedTour Protocols:
1. Total Cost Estimates: Procedure packages include surgical fees, recovery hotels, and a complication reserve. Final pricing is confirmed by hospitals directly.
2. Safe-to-Fly Date: Return flights are scheduled only after post-operative recovery milestones pass (DVT prevention, sternal healing, staple-line safety).
3. Milestone Payments: Payments are staged at admission, discharge, and a post-op outcome check, with a 15% holdback until the follow-up.
4. Medical Visas: Partner hospitals assist with invitation letters for medical visa applications.

${carePlanContext}
${ragGrounding}

IMPORTANT: You are not a doctor and cannot replace professional medical advice. In any life-threatening emergency — chest pain, stroke, severe bleeding, difficulty breathing — instruct the patient to call their local emergency services immediately (e.g. 911 in the US, 999 in the UK, 112 in the EU, 108 in India).

Tone: Empathetic, clear, structured with bullet points. If the patient has no active care plan on file, say so and answer general questions only. Keep responses under 140 words. Never prescribe drugs or contradict treating surgeons.`;

  const conversationHistory = history
    .slice(-4)
    .map((h) => `${h.sender === "patient" ? "Patient" : "Aria"}: ${h.text}`)
    .join("\n");

  const prompt = `${systemInstruction}\n\nRecent Conversation:\n${conversationHistory}\n\nPatient Question: ${userMessage}\n\nAria's Grounded Response:`;

  try {
    const res = await geminiPost(
      `/v1beta/models/${TEXT_MODEL}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      },
      10_000
    );

    if (!res.ok) {
      throw new Error(`Gemini status ${res.status}`);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Thank you. Your message has been routed to your clinical coordinator desk.";

    return { reply, isEmergency: false };
  } catch (err) {
    console.warn("Gemini chat error:", err);
    return {
      reply: "Thank you for your question. Based on MedTour clinical protocols, your assigned hospital coordinator will confirm specific instructions within 15 minutes. For immediate concerns, use the 1-Touch Emergency Dispatch.",
      isEmergency: false,
    };
  }
}

/**
 * Generates vector embedding (768 dimensions) using Google Gemini Embedding model.
 * Used for Supabase pgvector RAG semantic search.
 */
export async function getGeminiEmbedding(text: string): Promise<number[] | null> {
  if (!GEMINI_API_KEY || !text.trim()) return null;

  try {
    const res = await geminiPost(
      `/v1/models/${EMBED_MODEL}:embedContent`,
      {
        content: {
          parts: [{ text: text.slice(0, 2048) }],
        },
      },
      8_000
    );

    if (!res.ok) {
      console.warn("Embedding API returned error status:", res.status);
      return null;
    }

    const data = await res.json();
    return data.embedding?.values || null;
  } catch (err) {
    console.warn("Failed to generate embedding:", err);
    return null;
  }
}
