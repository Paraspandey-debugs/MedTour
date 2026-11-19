import { NextResponse } from "next/server";
import { geminiAnalyzeReport } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { reportText } = await request.json();

    if (!reportText || typeof reportText !== "string") {
      return NextResponse.json({ error: "Medical report text is required." }, { status: 400 });
    }

    const result = await geminiAnalyzeReport(reportText);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to analyze report" }, { status: 500 });
  }
}
