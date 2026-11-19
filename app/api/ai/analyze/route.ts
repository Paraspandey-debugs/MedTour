import { NextResponse } from "next/server";
import { geminiAnalyzeStructuredReport } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportText, fileData } = body;

    if (!reportText && !fileData?.base64) {
      return NextResponse.json(
        { error: "Medical report text or document is required." },
        { status: 400 }
      );
    }

    const result = await geminiAnalyzeStructuredReport({
      reportText: typeof reportText === "string" ? reportText : "",
      fileData,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to analyze report" },
      { status: 500 }
    );
  }
}
