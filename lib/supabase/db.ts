import { createClient } from "./client";
import { HOSPITALS, DOCTORS, TREATMENTS, type Hospital, type Doctor, type Treatment, type Specialty, type CountryId, type Tier } from "@/lib/data";

/**
 * Fetches all audited hospitals from Supabase public.hospitals table.
 * If the table is not yet created or returns empty, seamlessly falls back
 * to verified local seed dataset in lib/data.ts.
 */
export async function getHospitals(): Promise<Hospital[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("hospitals").select("*");

    if (error || !data || data.length === 0) {
      return HOSPITALS;
    }

    return data.map((row: any): Hospital => ({
      id: row.id,
      name: row.name,
      city: row.city,
      country: row.country as CountryId,
      specialties: row.specialties as Specialty[],
      accreditations: row.accreditations,
      priceIdx: parseFloat(row.price_idx),
      riskIdx: parseFloat(row.risk_idx),
      languages: row.languages,
      intlPatients: row.intl_patients,
      rating: parseFloat(row.rating),
      reviews: row.reviews,
      tier: row.tier as Tier,
      stepsPassed: row.steps_passed,
      lastAudit: row.last_audit,
      blurb: row.blurb,
      hue: row.hue,
    }));
  } catch (err) {
    console.warn("Falling back to local hospital dataset:", err);
    return HOSPITALS;
  }
}

/**
 * Fetches verified specialist surgeons from Supabase public.doctors table.
 * Falls back to DOCTORS in lib/data.ts if database table is pending.
 */
export async function getDoctors(): Promise<Doctor[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("doctors").select("*");

    if (error || !data || data.length === 0) {
      return DOCTORS;
    }

    return data.map((row: any): Doctor => ({
      id: row.id,
      name: row.name,
      title: row.title,
      hospitalId: row.hospital_id,
      specialties: row.specialties as Specialty[],
      experienceYears: row.experience_years,
      surgeriesPerformed: row.surgeries_performed,
      auditedComplicationRate: parseFloat(row.audited_complication_rate),
      credentials: row.credentials,
      education: row.education,
      languages: row.languages,
      rating: parseFloat(row.rating),
      reviewsCount: row.reviews_count,
      availableDaysNotice: row.available_days_notice,
      bio: row.bio,
    }));
  } catch (err) {
    return DOCTORS;
  }
}
