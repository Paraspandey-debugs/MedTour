/**
 * Database Seed Script for MedTour
 *
 * Runs locally using the Supabase Service-Role Key.
 * NEVER import this file into frontend or application code.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { HOSPITALS, DOCTORS, TREATMENTS } from "../lib/data";
import { VERIFIED_KNOWLEDGE_CORPUS } from "../lib/rag";

// Parse .env.local if not already in environment
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val.trim();
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL is missing.");
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY is required to seed the database bypassing RLS.");
  console.error("   Provide it as an environment variable:");
  console.error('   SUPABASE_SERVICE_ROLE_KEY="your-service-key" npx tsx scripts/seed.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runSeed() {
  console.log("🌱 Starting MedTour database seeding via Supabase Service Role...");

  // 1. Seed Treatments
  const treatmentRows = TREATMENTS.map((t) => ({
    id: t.id,
    name: t.name,
    short_name: t.short,
    specialty: t.specialty,
    hospital_days: t.days.hospital,
    local_recovery_days: t.days.localRecovery,
    fit_to_fly_day: t.days.fitToFly,
    fit_to_fly_why: t.days.why,
    base_complication: t.baseComplication,
    revision_factor: t.revisionFactor,
  }));

  const { error: tErr } = await supabase.from("treatments").upsert(treatmentRows, { onConflict: "id" });
  if (tErr) {
    console.error("❌ Treatments seeding error:", tErr.message);
  } else {
    console.log(`✓ Seeded ${treatmentRows.length} treatments`);
  }

  // 2. Seed Hospitals
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

  const { error: hErr } = await supabase.from("hospitals").upsert(hospitalRows, { onConflict: "id" });
  if (hErr) {
    console.error("❌ Hospitals seeding error:", hErr.message);
  } else {
    console.log(`✓ Seeded ${hospitalRows.length} hospitals`);
  }

  // 3. Seed Doctors
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

  const { error: dErr } = await supabase.from("doctors").upsert(doctorRows, { onConflict: "id" });
  if (dErr) {
    console.error("❌ Doctors seeding error:", dErr.message);
  } else {
    console.log(`✓ Seeded ${doctorRows.length} doctors`);
  }

  // 4. Seed Clinical Knowledge
  const knowledgeRows = VERIFIED_KNOWLEDGE_CORPUS.map((k) => ({
    category: k.category,
    source: k.source,
    title: k.title,
    content: k.content,
  }));

  const { error: kErr } = await supabase.from("clinical_knowledge").upsert(knowledgeRows, { onConflict: "title" });
  if (kErr) {
    console.warn("⚠️ Clinical knowledge table pending or seeding notice:", kErr.message);
  } else {
    console.log(`✓ Seeded ${knowledgeRows.length} clinical knowledge chunks`);
  }

  console.log("✨ Seeding completed successfully!");
}

runSeed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
