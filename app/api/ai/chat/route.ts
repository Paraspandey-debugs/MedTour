import { NextResponse } from "next/server";
import { geminiChatCoordinator } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const reply = await geminiChatCoordinator(message, history || []);
    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
