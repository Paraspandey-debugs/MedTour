import { NextResponse } from "next/server";
import { geminiAnalyzeStructuredReport } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportText, fileData } = body;

    if (!reportText && !fileData?.base64) {
      return NextResponse.json(
        { error: "Either medical report text or an uploaded file is required." },
        { status: 400 }
      );
    }

    const result = await geminiAnalyzeStructuredReport({
      reportText: typeof reportText === "string" ? reportText : "",
      fileData: fileData?.base64
        ? {
            base64: fileData.base64,
            mimeType: fileData.mimeType || "image/jpeg",
            fileName: fileData.fileName,
          }
        : undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/analyze-report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze medical report" },
      { status: 500 }
    );
  }
}
