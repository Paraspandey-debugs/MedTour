import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/supabase/db";

export async function GET() {
  const result = await seedDatabase();
  return NextResponse.json({
    message: result.success
      ? `Successfully seeded ${result.count} hospitals and doctors into Supabase.`
      : "Supabase table schema pending. Run supabase/seed.sql in your Supabase SQL Editor to initialize tables.",
    details: result,
  });
}

export async function POST() {
  const result = await seedDatabase();
  return NextResponse.json({
    message: result.success
      ? `Successfully seeded ${result.count} hospitals and doctors into Supabase.`
      : "Supabase table schema pending. Run supabase/seed.sql in your Supabase SQL Editor to initialize tables.",
    details: result,
  });
}
