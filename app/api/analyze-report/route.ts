import { NextResponse } from "next/server";
import { z } from "zod";
import { geminiAnalyzeStructuredReport } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const MAX_REPORT_TEXT = 20_000;
const MAX_FILE_B64 = Math.ceil((5 * 1024 * 1024 * 4) / 3); // ~5 MB raw → ~6.7 MB base64
const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

const BodySchema = z.object({
  reportText: z.string().max(MAX_REPORT_TEXT, "reportText exceeds 20 000 characters").optional(),
  fileData: z
    .object({
      base64: z.string().max(MAX_FILE_B64, "File exceeds 5 MB limit"),
      mimeType: z.string(),
      fileName: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  // 1. Rate limiting — supports both authenticated users and prospective guest patients
  let rateKey = `analyze:ip:${getClientIp(request)}`;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      rateKey = `analyze:user:${user.id}`;
    }
  } catch {
    // If Supabase is unavailable or fails, fallback to IP rate limiting
    rateKey = `analyze:ip:${getClientIp(request)}`;
  }

  // Rate limit: 15 req/min
  if (rateLimit(rateKey, 15)) {
    return NextResponse.json(
      { error: "Too many report analysis requests. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  // 2. Validate body
  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await request.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 3. Ensure either report text or file data was provided
  const hasText = typeof body.reportText === "string" && body.reportText.trim().length > 0;
  const hasFile = !!body.fileData?.base64;

  if (!hasText && !hasFile) {
    return NextResponse.json(
      { error: "Please upload a prescription or provide clinical report text to analyse." },
      { status: 400 }
    );
  }

  // 4. Validate file MIME type if file is provided
  if (body.fileData) {
    const normalizedMime = body.fileData.mimeType.toLowerCase().trim();
    const isValidMime = ALLOWED_MIME.some((m) => normalizedMime === m || normalizedMime.startsWith(m));
    if (!isValidMime) {
      return NextResponse.json(
        { error: "Accepted document formats: PDF, PNG, JPG, JPEG, and WEBP (up to 5 MB)." },
        { status: 400 }
      );
    }
    body.fileData.mimeType = normalizedMime;
  }

  try {
    const result = await geminiAnalyzeStructuredReport({
      reportText: body.reportText || "",
      fileData: body.fileData
        ? {
            base64: body.fileData.base64,
            mimeType: body.fileData.mimeType,
            fileName: body.fileData.fileName,
          }
        : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/analyze-report:", error);
    return NextResponse.json(
      { error: "Prescription analysis could not be completed. Please ensure the document is clear and readable, or try again." },
      { status: 500 }
    );
  }
}
