import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { TREATMENTS, hospitalById } from "@/lib/data";

const BodySchema = z.object({
  email: z.string().trim().email().max(254),
  patientName: z.string().trim().max(128).optional(),
  phone: z.string().trim().max(32).optional(),
  companion: z.boolean().optional(),
  hospitalId: z.string().min(1).max(64),
  procedure: z.string().min(1).max(64),
  preferredMonth: z.string().trim().max(32).optional(),
  message: z.string().trim().max(3000).optional(),
  consent: z.literal(true),
});

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 5 requests / 10 min per user (or per IP when signed out)
  if (rateLimit(`quote:${user?.id ?? clientIp(request)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email and tick the consent box." },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!hospitalById(body.hospitalId) || !TREATMENTS.some((t) => t.id === body.procedure)) {
    return NextResponse.json({ error: "Unknown hospital or procedure." }, { status: 400 });
  }

  const compositeMessage = [
    body.patientName ? `Patient Legal Name: ${body.patientName}` : null,
    body.phone ? `WhatsApp / Contact Phone: ${body.phone}` : null,
    body.companion !== undefined ? `Travelling with Companion: ${body.companion ? "Yes" : "Solo"}` : null,
    body.message ? `Clinical Notes: ${body.message}` : null,
  ].filter(Boolean).join("\n\n");

  const { error } = await supabase.from("quote_requests").insert({
    user_id: user?.id ?? null,
    email: body.email,
    hospital_id: body.hospitalId,
    procedure: body.procedure,
    preferred_month: body.preferredMonth || null,
    message: compositeMessage || null,
  });

  if (error) {
    console.error("quote_requests insert failed:", error.code);
    return NextResponse.json({ error: "Could not save your request. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
