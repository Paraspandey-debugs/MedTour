import { createClient } from "./client";
import { HOSPITALS, DOCTORS, type Hospital, type Doctor, type Specialty, type CountryId, type Tier } from "@/lib/data";

interface HospitalRow {
  id: string;
  name: string;
  city: string;
  country: string;
  specialties: string[];
  accreditations: string[];
  price_idx: string | number;
  risk_idx: string | number;
  languages: string[];
  intl_patients: number;
  rating: string | number;
  reviews: number;
  tier: string;
  steps_passed: number;
  last_audit: string;
  blurb: string;
  hue: number;
}

interface DoctorRow {
  id: string;
  name: string;
  title: string;
  hospital_id: string;
  specialties: string[];
  experience_years: number;
  surgeries_performed: number;
  audited_complication_rate: string | number;
  credentials: string[];
  education: string | string[];
  languages: string[];
  rating: string | number;
  reviews_count: number;
  available_days_notice: number;
  bio: string;
}

const isProd = process.env.NODE_ENV === "production";

/**
 * Fetches all hospitals from Supabase public.hospitals table.
 * In development, falls back to local data if the table is pending.
 * In production, throws an error if the database query fails.
 */
export async function getHospitals(): Promise<Hospital[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("hospitals").select("*");

    if (error) {
      if (isProd) {
        throw new Error(`Failed to load hospitals from database: ${error.message}`);
      }
      console.warn("Falling back to local hospital dataset:", error.message);
      return HOSPITALS;
    }

    if (!data || data.length === 0) {
      if (isProd) {
        throw new Error("No hospital data returned from database");
      }
      return HOSPITALS;
    }

    return (data as HospitalRow[]).map((row): Hospital => ({
      id: row.id,
      name: row.name,
      city: row.city,
      country: row.country as CountryId,
      specialties: row.specialties as Specialty[],
      accreditations: row.accreditations,
      priceIdx: typeof row.price_idx === "number" ? row.price_idx : parseFloat(row.price_idx),
      riskIdx: typeof row.risk_idx === "number" ? row.risk_idx : parseFloat(row.risk_idx),
      languages: row.languages,
      intlPatients: row.intl_patients,
      rating: typeof row.rating === "number" ? row.rating : parseFloat(row.rating),
      reviews: row.reviews,
      tier: row.tier as Tier,
      stepsPassed: row.steps_passed,
      lastAudit: row.last_audit,
      blurb: row.blurb,
      hue: row.hue,
    }));
  } catch (err) {
    if (isProd) throw err;
    console.warn("Falling back to local hospital dataset:", err);
    return HOSPITALS;
  }
}

/**
 * Fetches specialist surgeons from Supabase public.doctors table.
 * In development, falls back to local data if the table is pending.
 * In production, throws an error if the database query fails.
 */
export async function getDoctors(): Promise<Doctor[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("doctors").select("*");

    if (error) {
      if (isProd) {
        throw new Error(`Failed to load doctors from database: ${error.message}`);
      }
      console.warn("Falling back to local doctor dataset:", error.message);
      return DOCTORS;
    }

    if (!data || data.length === 0) {
      if (isProd) {
        throw new Error("No doctor data returned from database");
      }
      return DOCTORS;
    }

    return (data as DoctorRow[]).map((row): Doctor => ({
      id: row.id,
      name: row.name,
      title: row.title,
      hospitalId: row.hospital_id,
      specialties: row.specialties as Specialty[],
      experienceYears: row.experience_years,
      surgeriesPerformed: row.surgeries_performed,
      auditedComplicationRate:
        typeof row.audited_complication_rate === "number"
          ? row.audited_complication_rate
          : parseFloat(row.audited_complication_rate),
      credentials: row.credentials,
      education: Array.isArray(row.education) ? row.education.join(", ") : (row.education || ""),
      languages: row.languages,
      rating: typeof row.rating === "number" ? row.rating : parseFloat(row.rating),
      reviewsCount: row.reviews_count,
      availableDaysNotice: row.available_days_notice,
      bio: row.bio,
    }));
  } catch (err) {
    if (isProd) throw err;
    console.warn("Falling back to local doctor dataset:", err);
    return DOCTORS;
  }
}
