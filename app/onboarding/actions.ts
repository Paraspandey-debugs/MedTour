"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface OnboardingProfilePayload {
  // Identity & Contact
  fullName?: string;
  age?: number | string;
  gender?: string;
  phoneOrWhatsapp?: string;
  contactPreference?: "whatsapp" | "email" | "phone";
  hasPassport?: boolean;
  passportExpiry?: string;

  // Origin & Geolocation
  locationId: string;
  originCountry: string;
  originCity?: string;
  originFlag?: string;
  originLat?: number;
  originLng?: number;

  // Procedure / Care Need
  procedureId: string;
  isCustomProcedure?: boolean;
  customProcedureName?: string;
  customSpecialty?: string;

  // Companion & Logistics
  companion: boolean;
  companionCount?: number;
  companionRelationship?: string;
  timeline: string;
  budgetRange?: string;
  preferredDestinations?: string[];
  accessibilityNeeds?: string[];
  primaryPriority: string;

  // Clinical Dossier & Medical Background
  clinicalNotes?: string;
  comorbidities?: string[];
  customComorbidities?: string[];
  medications?: string;
  allergies?: string;
  biomarkers?: {
    hba1c?: string;
    bmi?: string;
    bloodPressure?: string;
    weightKg?: string;
    heightCm?: string;
  };
  uploadedDocumentsSummary?: {
    name: string;
    sizeKb: number;
    docType: string;
    mimeType: string;
  }[];
  geminiAnalysis?: {
    confidence: number;
    treatment?: string;
    riskMultiplier?: number;
    summary?: string;
  };
}

export async function saveOnboardingProfile(formData: OnboardingProfilePayload) {
  const cookieStore = await cookies();
  cookieStore.set("medtour_onboarding_done", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.updateUser({
      data: {
        onboarding_done: true,
        onboarding_profile: formData,
      },
    });

    // Also persist an initial patient care dossier if table exists
    try {
      await supabase.from("care_dossiers").upsert(
        {
          user_id: user.id,
          treatment_id: formData.procedureId,
          risk_multiplier: formData.geminiAnalysis?.riskMultiplier || 1.0,
          status: "onboarding_completed",
          notes: formData.clinicalNotes || null,
        },
        { onConflict: "user_id" }
      );
    } catch {
      // Non-fatal if table schema varies
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}
