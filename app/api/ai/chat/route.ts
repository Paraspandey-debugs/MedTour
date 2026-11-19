import { NextResponse } from "next/server";
import { z } from "zod";
import { geminiChatCoordinator } from "@/lib/gemini";
import { searchClinicalKnowledge } from "@/lib/rag";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const BodySchema = z.object({
  message: z.string().min(1).max(2_000, "Message exceeds 2 000 characters"),
  history: z
    .array(
      z.object({
        sender: z.string(),
        text: z.string().max(2_000),
      })
    )
    .max(20)
    .optional(),
  carePlan: z
    .object({
      procedureName: z.string().optional(),
      hospitalName: z.string().optional(),
      surgeonName: z.string().optional(),
      fitToFlyDay: z.number().optional(),
      riskMultiplier: z.number().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  // 1. Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // 2. Rate limit: 20 req/min per user
  if (rateLimit(`chat:${user.id}`, 20)) {
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

  // 4. Perform RAG search on clinical & hospital knowledge base
  const ragResult = await searchClinicalKnowledge(body.message, 3);

  // 5. Invoke Gemini with RAG grounding and optional care plan
  try {
    const { reply, isEmergency } = await geminiChatCoordinator(
      body.message,
      body.history ?? [],
      body.carePlan,
      ragResult.contextText
    );

    return NextResponse.json({
      reply,
      isEmergency,
      citations: ragResult.citations,
    });
  } catch (error) {
    console.error("Chat error in /api/ai/chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat. Please try again." },
      { status: 500 }
    );
  }
}
