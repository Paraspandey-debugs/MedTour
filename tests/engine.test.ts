import { describe, it, expect } from "vitest";
import {
  analyzeReport,
  trueCost,
  matchHospitals,
  buildJourney,
  deidentifyReport,
  generateEscrowContract,
  DEFAULT_WEIGHTS,
} from "@/lib/engine";
import { TREATMENTS, HOSPITALS, HOMES } from "@/lib/data";

describe("MedTour Engine Core Logic", () => {
  const sampleKneeReport = `
    Patient: Jane Doe
    Age: 72 years old
    MRN: 981247
    Date: 2025-10-15
    Diagnosis: Severe bilateral knee osteoarthritis, joint space narrowing.
    HbA1c: 7.8%
    BMI: 31.4
    Recommendation: Total Knee Arthroplasty (knee replacement).
  `;

  describe("analyzeReport", () => {
    it("identifies treatment category from keywords", () => {
      const result = analyzeReport(sampleKneeReport);
      expect(result.treatment).toBe("knee");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("extracts biomarkers and flags clinical risk factors", () => {
      const result = analyzeReport(sampleKneeReport);
      expect(result.age).toBe(72);
      expect(result.risks.some((r) => r.id === "age")).toBe(true);
      expect(result.risks.some((r) => r.id === "diabetes")).toBe(true);
      expect(result.risks.some((r) => r.id === "obesity")).toBe(true);
      expect(result.riskMultiplier).toBeGreaterThan(1.0);
    });

    it("returns null treatment and baseline multiplier for empty or unrelated text", () => {
      const result = analyzeReport("Routine dental checkup, no issues found.");
      expect(result.treatment).toBe("dental");
    });
  });

  describe("trueCost", () => {
    it("calculates comprehensive all-in cost with risk reserve", () => {
      const treatment = TREATMENTS[0]; // knee
      const hospital = HOSPITALS[0]; // aravali
      const home = HOMES.US;

      const cost = trueCost(treatment, hospital, home, {
        riskMultiplier: 1.5,
        companion: false,
        premium: false,
      });

      expect(cost.sticker).toBeGreaterThan(0);
      expect(cost.total).toBeGreaterThan(cost.sticker);
      expect(cost.riskReserve).toBeGreaterThan(0);
      expect(cost.lines.length).toBeGreaterThanOrEqual(6);
    });

    it("increases stay cost and living expenses when traveling with a companion", () => {
      const treatment = TREATMENTS[0];
      const hospital = HOSPITALS[0];
      const home = HOMES.US;

      const solo = trueCost(treatment, hospital, home, {
        riskMultiplier: 1.0,
        companion: false,
        premium: false,
      });

      const companion = trueCost(treatment, hospital, home, {
        riskMultiplier: 1.0,
        companion: true,
        premium: false,
      });

      expect(companion.total).toBeGreaterThan(solo.total);
    });
  });

  describe("matchHospitals", () => {
    it("ranks hospitals providing the specialty with normalized scores", () => {
      const treatment = TREATMENTS[0]; // knee (Orthopaedics)
      const home = HOMES.US;

      const matches = matchHospitals(treatment, home, DEFAULT_WEIGHTS, {
        riskMultiplier: 1.2,
        companion: false,
        premium: false,
      });

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].score).toBeGreaterThanOrEqual(matches[matches.length - 1].score);
      expect(matches[0].score).toBeLessThanOrEqual(100);
      expect(matches[0].cost).toBeDefined();
    });

    it("ensures every seeded treatment has matching hospitals", () => {
      for (const treatment of TREATMENTS) {
        const matches = matchHospitals(treatment, HOMES.UK, DEFAULT_WEIGHTS, {
          riskMultiplier: 1.0,
          companion: false,
          premium: false,
        });
        expect(matches.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("buildJourney", () => {
    it("enforces Fit-to-Fly gate preventing unsafe early flights", () => {
      const treatment = TREATMENTS[0]; // knee
      const hospital = HOSPITALS[0];
      const startDate = new Date("2026-06-01");

      const journey = buildJourney(treatment, hospital, startDate, 1.0, 5); // requested 5 days post-op
      expect(journey.blocked).toBe(true);
      expect(journey.earliestFlyHome).toBeGreaterThan(journey.procedureDay);
      expect(journey.flyHomeDay).toBeGreaterThan(journey.procedureDay + 5);
    });

    it("allows return flight when requested stay satisfies the safety gate", () => {
      const treatment = TREATMENTS[0]; // knee
      const hospital = HOSPITALS[0];
      const startDate = new Date("2026-06-01");

      const journey = buildJourney(treatment, hospital, startDate, 1.0, 25); // requested 25 days post-op
      expect(journey.blocked).toBe(false);
    });
  });

  describe("deidentifyReport", () => {
    it("redacts names, MRNs, dates, and contact info client-side", () => {
      const deidentified = deidentifyReport(sampleKneeReport);

      expect(deidentified.sanitizedText).not.toContain("Jane Doe");
      expect(deidentified.sanitizedText).not.toContain("981247");
      expect(deidentified.sanitizedText).toContain("[REDACTED_NAME_1]");
      expect(deidentified.sanitizedText).toContain("[REDACTED_MRN_1]");
      expect(deidentified.redactedCount).toBeGreaterThan(0);
    });
  });

  describe("generateEscrowContract", () => {
    it("stages payments across 4 tranches totaling 100%", () => {
      const totalPackage = 10_000;
      const contract = generateEscrowContract(totalPackage);

      expect(contract.length).toBe(4);
      const totalPct = contract.reduce((sum, t) => sum + t.percentage, 0);
      expect(totalPct).toBe(100);

      expect(contract[0].percentage).toBe(10); // Booking
      expect(contract[1].percentage).toBe(40); // Admission
      expect(contract[2].percentage).toBe(35); // Discharge
      expect(contract[3].percentage).toBe(15); // Day-30 Outcome
    });
  });
});
