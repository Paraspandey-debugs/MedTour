import { describe, it, expect } from "vitest";
import { analyzeReport, deidentifyReport } from "@/lib/engine";

describe("Prescription and Medical Report Analysis", () => {
  const samplePrescription = `
    Rx - Orthopaedic Specialty Clinic
    Patient: John Doe, Age: 65
    Date: 12/04/2026
    Diagnosis: Tricompartmental osteoarthritis right knee, severe joint space reduction.
    Medications:
    - Tab Metformin 500mg BID
    - Tab Amlodipine 5mg OD
    - Tab Paracetamol 650mg SOS
    Vitals: BP 142/88 mmHg, BMI 31.2, HbA1c 7.1%
    Advice: Total Knee Arthroplasty (TKR) recommended. Pre-op surgical clearance required.
  `;

  it("de-identifies prescription client-side before transmission", () => {
    const deidentified = deidentifyReport(samplePrescription);
    expect(deidentified.sanitizedText).not.toContain("John Doe");
    expect(deidentified.sanitizedText).toContain("[REDACTED_NAME_1]");
    expect(deidentified.redactedCount).toBeGreaterThan(0);
  });

  it("extracts surgical procedure and biomarkers from prescription", () => {
    const result = analyzeReport(samplePrescription);
    expect(result.treatment).toBe("knee");
    expect(result.confidence).toBeGreaterThan(0.5);

    // Biomarkers & findings
    expect(result.findings.some((f) => f.label.includes("HbA1c"))).toBe(true);
    expect(result.findings.some((f) => f.label.includes("BMI"))).toBe(true);
    expect(result.risks.some((r) => r.id === "diabetes")).toBe(true);
    expect(result.risks.some((r) => r.id === "obesity")).toBe(true);
    expect(result.riskMultiplier).toBeGreaterThan(1.2);
  });

  it("gracefully handles prescriptions without surgical keywords", () => {
    const nonSurgicalRx = "Rx: Tab Cetirizine 10mg OD for allergic rhinitis. No surgery indicated.";
    const result = analyzeReport(nonSurgicalRx);
    expect(result.treatment).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.riskMultiplier).toBe(1.0);
  });
});
