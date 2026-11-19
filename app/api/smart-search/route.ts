import { NextResponse } from "next/server";
import { HOSPITALS, DOCTORS, priceAt, treatmentById } from "@/lib/data";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODEL_NAME = "gemini-3.1-flash-lite";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        filters: null,
        explanation: "Operating in standard filter mode.",
      });
    }

    const prompt = `You are MedTour's intelligent hospital and specialist surgeon search parser.
Convert the patient's natural language search query into structured search filters.

Valid procedure IDs:
- "knee" (Total Knee Replacement, Orthopaedics)
- "hip" (Total Hip Replacement, Orthopaedics)
- "cabg" (Coronary Artery Bypass, Cardiac)
- "spine" (Lumbar Spinal Fusion, Spine)
- "bariatric" (Gastric Sleeve Surgery, Bariatric)
- "dental" (Full-Arch Dental Implants, Dental)

Valid country codes:
- "IN" (India)
- "TH" (Thailand)
- "TR" (Turkey)
- "SG" (Singapore)
- "MY" (Malaysia)
- "AE" (United Arab Emirates)
- "MX" (Mexico)
- "KR" (South Korea)

Valid accreditations: "JCI", "NABH", "TEMOS", "MSQH", "HA Thailand", "CSG Mexico", "KOIHA"
Valid tiers: "Platinum", "Gold", "Verified"

Return ONLY valid JSON in this exact format:
{
  "procedure": "knee" | "hip" | "cabg" | "spine" | "bariatric" | "dental" | null,
  "country": "IN" | "TH" | "TR" | "SG" | "MY" | "AE" | "MX" | "KR" | null,
  "maxPriceUsd": number | null,
  "accreditation": string | null,
  "tier": "Platinum" | "Gold" | "Verified" | null,
  "explanation": "Brief 1-sentence explanation of what criteria were matched"
}

Query: "${query}"`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini status ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(candidateText);

    return NextResponse.json({
      filters: parsed,
      explanation: parsed.explanation || "AI-structured search applied.",
    });
  } catch (error: any) {
    console.warn("Smart search error, fallback:", error);
    return NextResponse.json({
      filters: null,
      explanation: "Standard keyword search applied.",
    });
  }
}
