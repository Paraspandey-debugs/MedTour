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

/**
 * Seeds hospitals and doctors into Supabase table.
 * Returns { success, count, error }.
 */
export async function seedDatabase() {
  try {
    const supabase = createClient();

    const hospitalRows = HOSPITALS.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      country: h.country,
      specialties: h.specialties,
      accreditations: h.accreditations,
      price_idx: h.priceIdx,
      risk_idx: h.riskIdx,
      languages: h.languages,
      intl_patients: h.intlPatients,
      rating: h.rating,
      reviews: h.reviews,
      tier: h.tier,
      steps_passed: h.stepsPassed,
      last_audit: h.lastAudit,
      blurb: h.blurb,
      hue: h.hue,
    }));

    const { error: hError } = await supabase.from("hospitals").upsert(hospitalRows, { onConflict: "id" });
    if (hError) {
      return { success: false, error: hError.message };
    }

    const doctorRows = DOCTORS.map((d) => ({
      id: d.id,
      name: d.name,
      title: d.title,
      hospital_id: d.hospitalId,
      specialties: d.specialties,
      experience_years: d.experienceYears,
      surgeries_performed: d.surgeriesPerformed,
      audited_complication_rate: d.auditedComplicationRate,
      credentials: d.credentials,
      education: d.education,
      languages: d.languages,
      rating: d.rating,
      reviews_count: d.reviewsCount,
      available_days_notice: d.availableDaysNotice,
      bio: d.bio,
    }));

    const { error: dError } = await supabase.from("doctors").upsert(doctorRows, { onConflict: "id" });
    if (dError) {
      return { success: false, error: dError.message };
    }

    return { success: true, count: hospitalRows.length + doctorRows.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
