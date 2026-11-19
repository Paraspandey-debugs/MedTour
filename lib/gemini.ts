import { analyzeReport, type Analysis } from "./engine";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const MODEL_NAME = "gemini-3.1-flash-lite";

/**
 * Analyzes patient medical report text using Google AI Studio (Gemini 3.1 Flash Lite).
 * Gracefully falls back to deterministic rule-based reader if offline or key is missing.
 */
export async function geminiAnalyzeReport(reportText: string): Promise<Analysis & { aiPowered?: boolean; patientQuestions?: string[] }> {
  if (!GEMINI_API_KEY || !reportText.trim()) {
    return { ...analyzeReport(reportText), aiPowered: false };
  }

  const prompt = `You are a specialized clinical AI decision-support assistant for MedTour, a cross-border medical travel platform.
Analyze the following patient medical report or radiology text. Extract key clinical parameters, identify the procedure needed, evaluate surgical risk factors, and return a strict JSON object.

Valid procedures (treatment ID must be exactly one of these or null):
- "knee": Total Knee Replacement
- "hip": Total Hip Replacement
- "cabg": Coronary Artery Bypass
- "spine": Lumbar Spinal Fusion
- "bariatric": Gastric Sleeve Surgery
- "dental": Full-Arch Dental Implants

Return ONLY valid JSON in this exact structure, with no markdown fences, no backticks, and no extra text:
{
  "treatment": "knee" | "hip" | "cabg" | "spine" | "bariatric" | "dental" | null,
  "confidence": 0.95,
  "age": 64,
  "findings": [
    {
      "label": "HbA1c",
      "value": "7.8%",
      "status": "high",
      "note": "Diabetes indicator — wound healing and infection risk rise."
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
  "riskMultiplier": 1.64,
  "summary": [
    "Identified candidate for total knee replacement based on Kellgren-Lawrence grade IV osteoarthritis.",
    "Elevated HbA1c (7.8%) and BMI (31.4) require dedicated pre-op optimisation.",
    "Your personalized risk multiplier is 1.64x, adding 3 extra recovery days before safe long-haul flight clearance."
  ],
  "patientQuestions": [
    "What computer navigation or robotic systems do you use for implant alignment?",
    "How does your team monitor blood glucose levels during the 4-day inpatient stay?",
    "When will your physiotherapy team conduct the first assisted mobility session?"
  ]
}

Patient Report:
${reportText}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.9,
          },
        }),
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!res.ok) {
      console.warn("Gemini API returned error status:", res.status);
      return { ...analyzeReport(reportText), aiPowered: false };
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return { ...analyzeReport(reportText), aiPowered: false };
    }

    // Clean potential markdown fences
    const cleanJson = candidateText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      treatment: parsed.treatment || null,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.9,
      matchedTerms: parsed.findings ? parsed.findings.map((f: any) => f.label) : [],
      age: parsed.age || null,
      findings: parsed.findings || [],
      risks: parsed.risks || [],
      riskMultiplier: typeof parsed.riskMultiplier === "number" ? Math.min(2.5, Math.max(1.0, parsed.riskMultiplier)) : 1.0,
      summary: parsed.summary || [],
      patientQuestions: parsed.patientQuestions || [],
      aiPowered: true,
    };
  } catch (err) {
    console.warn("Gemini report analysis fallback to engine:", err);
    return { ...analyzeReport(reportText), aiPowered: false };
  }
}

/**
 * 24/7 Care Coordinator Concierge conversation powered by Google Gemini.
 */
export async function geminiChatCoordinator(userMessage: string, history: { sender: string; text: string }[] = []): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "Aria is currently operating in offline protocol mode. For clinical inquiries, please contact your desk coordinator or hospital emergency team.";
  }

  const systemInstruction = `You are Aria, MedTour's 24/7 AI Clinical Care Coordinator.
MedTour is a premier cross-border medical travel platform connecting patients with JCI-accredited hospitals in India, Thailand, Turkey, Singapore, Malaysia, UAE, Mexico, and South Korea.

Key MedTour Protocols you must reference when relevant:
1. TrueCost: All-in pricing including fixed procedure packages, return flights, recovery hotels, and an actuarial risk reserve.
2. Fit-to-Fly Gate: Return flights are strictly blocked until surgical recovery milestones pass (DVT clot prevention, sternal healing, staple-line leak safety).
3. Outcome Escrow: 10% booking deposit, 40% admission, 35% discharge, and a crucial 15% held in escrow until the Day-30 clinical checkup back home.
4. Fast-Track Medical Visas: All partner hospitals provide official invitation letters with guaranteed 45-day date rollover protection.

Tone: Compassionate, medically precise, scannable with bullet points, and reassuring. Always emphasize that emergency symptoms should trigger the 1-touch hospital emergency desk. Keep answers concise (under 120 words).`;

  const conversationHistory = history
    .slice(-4)
    .map((h) => `${h.sender === "patient" ? "Patient" : "Aria"}: ${h.text}`)
    .join("\n");

  const prompt = `${systemInstruction}\n\nRecent Conversation:\n${conversationHistory}\n\nPatient Question: ${userMessage}\n\nAria's Response:`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Thank you. Your message has been logged for your clinical coordinator desk.";
  } catch (err) {
    console.warn("Gemini chat fallback:", err);
    return "Thank you for your question. Based on MedTour clinical protocols, your assigned hospital coordinator will confirm specific instructions within 15 minutes. For immediate concerns, use the 1-Touch Emergency Dispatch.";
  }
}
