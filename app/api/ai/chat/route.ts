import { NextResponse } from "next/server";
import { geminiChatCoordinator } from "@/lib/gemini";
import { searchClinicalKnowledge } from "@/lib/rag";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { message, history, carePlan } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // 1. Check logged-in user session if carePlan was not passed directly
    let activeCarePlan = carePlan;
    if (!activeCarePlan) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          activeCarePlan = {
            procedureName: "Total Knee Replacement",
            hospitalName: "Aravali Heart & Joint Institute, New Delhi",
            surgeonName: "Dr. Sunita Kapoor, FRCS",
            fitToFlyDay: 17,
            riskMultiplier: 1.64,
          };
        }
      } catch (e) {
        // Continue with default concierge context
      }
    }

    // 2. Perform RAG search on clinical & hospital knowledge base
    const ragResult = await searchClinicalKnowledge(message, 3);

    // 3. Invoke Gemini with RAG grounding and personalized patient care plan
    const { reply, isEmergency } = await geminiChatCoordinator(
      message,
      history || [],
      activeCarePlan,
      ragResult.contextText
    );

    return NextResponse.json({
      reply,
      isEmergency,
      citations: ragResult.citations,
    });
  } catch (error: any) {
    console.error("Chat error in /api/ai/chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}
