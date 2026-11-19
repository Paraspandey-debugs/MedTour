import { NextResponse } from "next/server";
import { z } from "zod";
import { geminiAnalyzeStructuredReport } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const MAX_REPORT_TEXT = 20_000;
const MAX_FILE_B64 = Math.ceil((5 * 1024 * 1024 * 4) / 3); // ~5 MB raw → ~6.7 MB base64
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;

const BodySchema = z.object({
  reportText: z.string().max(MAX_REPORT_TEXT, "reportText exceeds 20 000 characters").optional(),
  fileData: z
    .object({
      base64: z.string().max(MAX_FILE_B64, "File exceeds 5 MB limit"),
      mimeType: z.enum(ALLOWED_MIME, { message: "Only PDF, JPEG and PNG files are accepted" }),
      fileName: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  // 1. Auth guard — must be signed in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // 2. Rate limit: 10 req/min per user
  if (rateLimit(`analyze:${user.id}`, 10)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  // 3. Validate body
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

  if (!body.reportText && !body.fileData?.base64) {
    return NextResponse.json(
      { error: "Either medical report text or an uploaded file is required." },
      { status: 400 }
    );
  }

  try {
    const result = await geminiAnalyzeStructuredReport({
      reportText: typeof body.reportText === "string" ? body.reportText : "",
      fileData: body.fileData?.base64
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
      { error: "Report analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
