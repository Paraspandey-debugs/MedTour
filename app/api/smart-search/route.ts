import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODEL_NAME = "gemini-3.1-flash-lite";

const BodySchema = z.object({
  query: z.string().min(1).max(500, "Query exceeds 500 characters"),
});

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  // Rate limit by IP: 30 req/min (public route)
  const ip = getClientIp(request);
  if (rateLimit(`smart-search:${ip}`, 30)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  // Validate body
  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await request.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
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
- "cataract" (Cataract Surgery with Multifocal IOL, Ophthalmology)
- "ivf" (In-Vitro Fertilization Cycle, Fertility)
- "rhinoplasty" (Cosmetic Rhinoplasty & Septoplasty, Cosmetics)
- "hair" (FUE Hair Follicle Transplant, Cosmetics)
- "gallbladder" (Laparoscopic Cholecystectomy, General Surgery)
- "valve" (Heart Valve Replacement / TAVR, Cardiac)
- "hernia" (Inguinal Hernia Repair, General Surgery)
- "oncology" (Stereotactic CyberKnife & Proton Radiotherapy, Oncology)

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
  "procedure": "knee" | "hip" | "cabg" | "spine" | "bariatric" | "dental" | "cataract" | "ivf" | "rhinoplasty" | "hair" | "gallbladder" | "valve" | "hernia" | "oncology" | null,
  "country": "IN" | "TH" | "TR" | "SG" | "MY" | "AE" | "MX" | "KR" | null,
  "maxPriceUsd": number | null,
  "accreditation": string | null,
  "tier": "Platinum" | "Gold" | "Verified" | null,
  "explanation": "Brief 1-sentence explanation of what criteria were matched"
}

Query: "${body.query}"`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
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
  } catch (error) {
    console.warn("Smart search error, fallback:", error);
    return NextResponse.json({
      filters: null,
      explanation: "Standard keyword search applied.",
    });
  }
}
