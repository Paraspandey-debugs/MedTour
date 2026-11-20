"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveOnboardingProfile(formData: {
  locationId: string;
  procedureId: string;
  companion: boolean;
  timeline: string;
  primaryPriority: string;
  clinicalNotes?: string;
  comorbidities?: string[];
  medications?: string;
  allergies?: string;
  biomarkers?: {
    hba1c?: string;
    bmi?: string;
    bloodPressure?: string;
  };
}) {
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
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}
