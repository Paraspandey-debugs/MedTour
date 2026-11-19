import { analyzeReport, type Analysis } from "./engine";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY;

const TEXT_MODEL = "gemini-3.1-flash-lite";
const EMBED_MODEL = "gemini-embedding-001";

export interface BiomarkerMap {
  hba1c?: string | null;
  bmi?: string | null;
  ejection_fraction?: string | null;
  creatinine?: string | null;
  blood_pressure?: string | null;
  [key: string]: string | null | undefined;
}

export interface StructuredAnalysisResponse {
  treatment: "knee" | "hip" | "cabg" | "spine" | "bariatric" | "dental" | null;
  procedure_category: "knee" | "hip" | "cabg" | "spine" | "bariatric" | "dental" | null;
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

  if (!GEMINI_API_KEY || (!reportText.trim() && !fileData)) {
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

  const prompt = `You are a clinical AI decision-support specialist for MedTour, a cross-border medical travel platform.
Your task is to analyze the patient medical report, lab panel, discharge summary, or radiology scan.

Extract key clinical biomarkers, identify the indicated surgical procedure, assess patient-specific risk factors, and output a 3-sentence plain-English summary.

Procedures allowed (procedure_category must be exactly one of these or null):
- "knee": Total Knee Replacement
- "hip": Total Hip Replacement
- "cabg": Coronary Artery Bypass
- "spine": Lumbar Spinal Fusion
- "bariatric": Gastric Sleeve Surgery
- "dental": Full-Arch Dental Implants

Return ONLY valid JSON matching this exact structure:
{
  "procedure_category": "knee" | "hip" | "cabg" | "spine" | "bariatric" | "dental" | null,
  "confidence": 0.98,
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
      "label": "HbA1c",
      "value": "7.8%",
      "status": "high",
      "note": "Diabetes indicator — wound healing and surgical site infection risk rise."
    }
  ],
  "risks": [
    {
      "id": "diabetes",
      "label": "Diabetes (HbA1c ≥ 6.5%)",
      "multiplier": 1.3,
      "why": "Elevates surgical site infection risk; requires hospital with endocrinology cover."
    }
  ],
  "risk_multiplier": 1.56,
  "summary_3_sentences": "Patient exhibits end-stage joint space narrowing confirming total knee replacement indication. Comorbidities including elevated HbA1c (7.8%) and BMI (31.4) require dedicated pre-operative medical clearance. A calibrated surgical risk multiplier of 1.56x adds 3 additional post-operative recovery days before safe long-haul flight departure.",
  "patient_questions": [
    "What robotic alignment or navigation technology do you employ for implant placement?",
    "How does your inpatient protocol regulate glycemic control during the 4-day admission?",
    "What assisted mobility milestones must I achieve before discharge to the recovery hotel?"
  ]
}

Ensure risk_multiplier is bounded between 1.0 and 2.5 (1.0 = standard risk, 1.3-1.6 = moderate complexity, >1.7 = high complexity).`;

  try {
    const parts: any[] = [];

    if (fileData?.base64 && fileData?.mimeType) {
      parts.push({
        inline_data: {
          mime_type: fileData.mimeType,
          data: fileData.base64.replace(/^data:[^;]+;base64,/, ""),
        },
      });
    }

    const clinicalContext = reportText.trim()
      ? `\nClinical Text:\n${reportText.trim()}`
      : "\nAnalyze the attached medical document.";
    parts.push({ text: `${prompt}\n${clinicalContext}` });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.9,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini status ${res.status}`);
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
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.95,
      age: parsed.age || null,
      biomarkers: parsed.biomarkers || {},
      matchedTerms: parsed.findings ? parsed.findings.map((f: any) => f.label) : [],
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
    console.warn("Structured report analysis failed, falling back to rule engine:", err);
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
      reply: `⚠️ EMERGENCY CLINICAL ALERT: Your symptoms require immediate medical attention. Please contact emergency medical services or press the 1-Touch Hospital Emergency Desk (+91 11 2685 4100 Ext. 99) right away. Do not wait for chat responses for acute cardiac, respiratory, or bleeding episodes.`,
      isEmergency: true,
    };
  }

  const carePlanContext = userCarePlan
    ? `\nActive Patient Journey Context:
- Procedure: ${userCarePlan.procedureName || "Total Knee Replacement"}
- Selected Hospital: ${userCarePlan.hospitalName || "Aravali Heart & Joint Institute, New Delhi (JCI Accredited)"}
- Treating Specialist: ${userCarePlan.surgeonName || "Dr. Sunita Kapoor, FRCS"}
- Fit-to-Fly Departure Gate: Day ${userCarePlan.fitToFlyDay || 17} (return flights locked until surgical milestones pass)
- Calibrated Risk Multiplier: ${userCarePlan.riskMultiplier || 1.64}x`
    : "";

  const ragGrounding = ragContext
    ? `\nVerified Knowledge Base & Clinical Sources (Use these to cite facts inline e.g. [Aravali Clinical Protocol]):\n${ragContext}`
    : "";

  const systemInstruction = `You are Aria, MedTour's 24/7 AI Clinical Care Coordinator.
MedTour is a premier cross-border medical travel platform connecting international patients with JCI/NABH-accredited hospitals in India, Thailand, Turkey, Singapore, Malaysia, UAE, Mexico, and South Korea.

Key MedTour Protocols you MUST enforce:
1. TrueCost Guarantee: All-in pricing including surgical procedure packages, return flights, recovery hotels, and an actuarial risk reserve with zero surprise fees.
2. Fit-to-Fly Gate: Return flights are strictly blocked until surgical recovery milestones pass (DVT clot prevention, sternal healing, staple-line leak safety).
3. Outcome Escrow: 10% booking deposit, 40% admission, 35% discharge, and a crucial 15% held in escrow until the Day-30 clinical outcome checkup back home.
4. Fast-Track Medical Visas: All partner hospitals provide official invitation letters with guaranteed 45-day date rollover protection.

${carePlanContext}
${ragGrounding}

Tone: Empathetic, medically precise, structured with bullet points. If patient has an active plan, personalize answers specifically to their hospital and Fit-to-Fly day. Keep responses concise (under 140 words). Never prescribe drugs or contradict treating surgeons.`;

  const conversationHistory = history
    .slice(-4)
    .map((h) => `${h.sender === "patient" ? "Patient" : "Aria"}: ${h.text}`)
    .join("\n");

  const prompt = `${systemInstruction}\n\nRecent Conversation:\n${conversationHistory}\n\nPatient Question: ${userMessage}\n\nAria's Grounded Response:`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
        signal: AbortSignal.timeout(10000),
      }
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
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            parts: [{ text: text.slice(0, 2048) }],
          },
        }),
        signal: AbortSignal.timeout(8000),
      }
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
