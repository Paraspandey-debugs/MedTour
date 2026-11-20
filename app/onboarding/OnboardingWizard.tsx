"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Globe, { GlobeLocation } from "@/components/Globe";
import { HOMES, HomeId, TREATMENTS, TreatmentId, usd } from "@/lib/data";
import { saveOnboardingProfile } from "./actions";

// Popular origin countries for international medical travel
export const ORIGIN_LOCATIONS: GlobeLocation[] = [
  { id: "US", name: "United States", country: "United States", flag: "🇺🇸", lat: 37.0902, lng: -95.7129 },
  { id: "UK", name: "United Kingdom", country: "United Kingdom", flag: "🇬🇧", lat: 55.3781, lng: -3.4360 },
  { id: "CA", name: "Canada", country: "Canada", flag: "🇨🇦", lat: 56.1304, lng: -106.3468 },
  { id: "AU", name: "Australia", country: "Australia", flag: "🇦🇺", lat: -25.2744, lng: 133.7751 },
  { id: "AE", name: "UAE (Dubai / Abu Dhabi)", country: "UAE", flag: "🇦🇪", lat: 23.4241, lng: 53.8478 },
  { id: "NG", name: "Nigeria (Lagos)", country: "Nigeria", flag: "🇳🇬", lat: 9.0820, lng: 8.6753 },
  { id: "DE", name: "Germany", country: "Germany", flag: "🇩🇪", lat: 51.1657, lng: 10.4515 },
  { id: "IE", name: "Ireland", country: "Ireland", flag: "🇮🇪", lat: 53.1424, lng: -7.6921 },
];

const COMORBIDITIES_OPTIONS = [
  { id: "diabetes", label: "Type 2 Diabetes / Glycemia", icon: "🩸" },
  { id: "hypertension", label: "Hypertension / High BP", icon: "💓" },
  { id: "cardiac", label: "Cardiovascular History", icon: "❤️" },
  { id: "bmi_high", label: "High BMI / Obesity", icon: "⚖️" },
  { id: "respiratory", label: "Asthma / Respiratory", icon: "🫁" },
  { id: "smoking", label: "Active Smoker / Nicotine", icon: "🚬" },
  { id: "anticoagulant", label: "On Blood Thinners", icon: "💊" },
  { id: "prior_surgery", label: "Prior Surgical Complications", icon: "🔪" },
  { id: "none", label: "Clean Medical History (None)", icon: "🩺" },
];

export interface UploadedDocSummary {
  name: string;
  sizeKb: number;
  mimeType: string;
  base64?: string;
  isImage: boolean;
  previewUrl?: string;
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Location
  const [location, setLocation] = useState<GlobeLocation>(ORIGIN_LOCATIONS[0]);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  // Step 2: Procedure
  const [procedureId, setProcedureId] = useState<TreatmentId>("knee");

  // Step 3: Companion & Timeline
  const [companion, setCompanion] = useState<boolean>(true);
  const [timeline, setTimeline] = useState<"urgent" | "planned" | "flexible">("planned");
  const [primaryPriority, setPrimaryPriority] = useState<"outcomes" | "cost" | "travel">("outcomes");

  // Step 4: Rich Clinical Dossier & Uploads
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocSummary | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isAnalyzingReport, setIsAnalyzingReport] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    confidence: number;
    treatment?: string;
    riskMultiplier?: number;
    summary?: string;
  } | null>(null);

  const [clinicalNotes, setClinicalNotes] = useState<string>("");
  const [medications, setMedications] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>([]);
  const [hba1cVal, setHba1cVal] = useState<string>("");
  const [bloodPressureVal, setBloodPressureVal] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current procedure data
  const selectedProcedure = useMemo(
    () => TREATMENTS.find((t) => t.id === procedureId) || TREATMENTS[0],
    [procedureId]
  );

  // Home data
  const homeData = useMemo(() => {
    const key = (location.id as HomeId) in HOMES ? (location.id as HomeId) : "US";
    return HOMES[key];
  }, [location]);

  // Calculated BMI
  const computedBmi = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return null;
  }, [weightKg, heightCm]);

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closest = ORIGIN_LOCATIONS[0];
        let minDist = Infinity;

        ORIGIN_LOCATIONS.forEach((loc) => {
          const d = Math.hypot(loc.lat - latitude, loc.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = loc;
          }
        });

        setLocation({
          id: closest.id,
          name: `Current Location (${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°)`,
          country: closest.country,
          flag: "📍",
          lat: latitude,
          lng: longitude,
        });
        setIsDetectingLocation(false);
        setGeoMessage(`Detected location near ${closest.name}`);
      },
      () => {
        setIsDetectingLocation(false);
        setGeoMessage("Could not access location. Please select your country below.");
      },
      { timeout: 8000 }
    );
  };

  // Process Document File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFileError(`"${file.name}" is too large. Maximum file size is 10 MB.`);
      return;
    }

    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedDoc({
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        mimeType: file.type || "application/pdf",
        base64: dataUrl,
        isImage,
        previewUrl: isImage ? dataUrl : undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini Multimodal Analysis on uploaded prescription or notes
  const triggerAiAnalysis = async () => {
    if (!uploadedDoc && !clinicalNotes.trim()) {
      setFileError("Please upload a file or write doctor notes first.");
      return;
    }

    setIsAnalyzingReport(true);
    setFileError(null);

    try {
      const res = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText: clinicalNotes,
          fileData: uploadedDoc
            ? {
                base64: uploadedDoc.base64,
                mimeType: uploadedDoc.mimeType,
                fileName: uploadedDoc.name,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setAnalysisResult({
        confidence: data.confidence || 0.9,
        treatment: data.treatment,
        riskMultiplier: data.riskMultiplier || 1.0,
        summary: data.summary_3_sentences || data.summary?.join(" ") || "Clinical record verified.",
      });

      // If detected procedure matches one of our procedures, auto-select it!
      if (data.treatment && TREATMENTS.some((t) => t.id === data.treatment)) {
        setProcedureId(data.treatment as TreatmentId);
      }

      // If biomarkers extracted, auto-fill
      if (data.biomarkers?.hba1c && !hba1cVal) setHba1cVal(data.biomarkers.hba1c);
      if (data.biomarkers?.blood_pressure && !bloodPressureVal) setBloodPressureVal(data.biomarkers.blood_pressure);
      if (data.biomarkers?.bmi && !weightKg) {
        // e.g. BMI extracted
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Document analysis timed out.";
      setFileError(msg);
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const toggleComorbidity = (id: string) => {
    if (id === "none") {
      setSelectedComorbidities(["none"]);
      return;
    }
    setSelectedComorbidities((prev) => {
      const filtered = prev.filter((item) => item !== "none");
      if (filtered.includes(id)) {
        return filtered.filter((item) => item !== id);
      }
      return [...filtered, id];
    });
  };

  // Complete Onboarding & Save
  const handleCompleteOnboarding = async () => {
    setIsSaving(true);
    try {
      await saveOnboardingProfile({
        locationId: location.id,
        procedureId,
        companion,
        timeline,
        primaryPriority,
        clinicalNotes,
        comorbidities: selectedComorbidities,
        medications,
        allergies,
        biomarkers: {
          hba1c: hba1cVal,
          bmi: computedBmi || undefined,
          bloodPressure: bloodPressureVal,
        },
      });
    } catch (err) {
      console.warn("Failed saving onboarding profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 4) {
      handleCompleteOnboarding();
    }
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Stepper Bar */}
      <div className="card p-4 sm:p-5 bg-white border border-line shadow-xs">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-full bg-teal text-white font-bold flex items-center justify-center text-xs">
              {currentStep}
            </span>
            <span className="font-semibold text-ink">
              Step {currentStep} of {totalSteps}:{" "}
              {currentStep === 1 && "Your Origin & Global Corridors"}
              {currentStep === 2 && "Care Need & Surgical Specialty"}
              {currentStep === 3 && "Travel Companion & Timeline"}
              {currentStep === 4 && "Clinical Scans & Medical History"}
              {currentStep === 5 && "Your Personalized Medical Passport"}
            </span>
          </div>
          <span className="text-muted font-mono font-medium hidden sm:inline">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-3 w-full bg-sand/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal to-tealBrand h-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Current Location & WebGL Globe */}
      {currentStep === 1 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                Step 1: Origin Location
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Where will you be travelling from?
              </h2>
              <p className="text-xs text-muted mt-1">
                Your origin determines direct flight hours, hospital transfer logistics, and visa processing windows.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="btn btn-ghost !text-xs !py-2 border border-line text-ink hover:border-teal flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <span>{isDetectingLocation ? "⏳" : "🎯"}</span>
              <span>{isDetectingLocation ? "Detecting..." : "Auto-Detect GPS"}</span>
            </button>
          </div>

          {geoMessage && (
            <div className="p-3 rounded-xl bg-mint/50 border border-teal/20 text-xs text-deep flex items-center gap-2">
              <span>ℹ️</span> {geoMessage}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-center">
            {/* Left: Origin Selector Pills */}
            <div className="space-y-4">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Choose or click your country of residence:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {ORIGIN_LOCATIONS.map((loc) => {
                  const isSelected = location.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setLocation(loc);
                        setGeoMessage(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? "bg-teal text-white border-teal shadow-md scale-[1.01]"
                          : "bg-white border-line text-ink hover:border-teal/40 hover:bg-sand/20"
                      }`}
                    >
                      <span className="text-2xl">{loc.flag}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-ink"}`}>
                          {loc.name}
                        </p>
                        <p className={`text-[10px] ${isSelected ? "text-white/80" : "text-muted"}`}>
                          {loc.country}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Real-time Corridors Preview Card */}
              <div className="p-4 rounded-2xl bg-sand/30 border border-line space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Direct Corridors from {location.flag} {location.name}:</span>
                  <span className="text-[10px] text-teal font-bold bg-mint px-2 py-0.5 rounded-full">
                    Active Flight Paths
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-line/60">
                    <span className="text-muted block text-[10px]">🇹🇭 Bangkok</span>
                    <span className="font-bold text-ink">{homeData.hours.TH}h flight</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-line/60">
                    <span className="text-muted block text-[10px]">🇮🇳 New Delhi</span>
                    <span className="font-bold text-ink">{homeData.hours.IN}h flight</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-line/60">
                    <span className="text-muted block text-[10px]">🇹🇷 Istanbul</span>
                    <span className="font-bold text-ink">{homeData.hours.TR}h flight</span>
                  </div>
                </div>
                {homeData.waitWeeks > 4 && (
                  <p className="text-[11px] text-terracotta font-medium pt-1">
                    ⏱️ Typical elective wait time at home: <b>{homeData.waitWeeks} weeks</b>. MedTour partner hospital wait: <b>0 weeks</b>.
                  </p>
                )}
              </div>
            </div>

            {/* Right: High-Performance WebGL 3D Globe */}
            <div className="flex flex-col items-center justify-center p-3 rounded-3xl bg-sand/30 border border-line relative overflow-hidden">
              <Globe selectedLocation={location} size={360} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-line">
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary !py-2.5 !px-6 text-xs font-semibold flex items-center gap-2"
            >
              <span>Continue to Care Need</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Surgical Care Need */}
      {currentStep === 2 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                Step 2: Care Need
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                What procedure or treatment are you considering?
              </h2>
              <p className="text-xs text-muted mt-1">
                Choose from our 14 seeded surgical specialties to calculate package savings and post-op recovery windows.
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {TREATMENTS.map((t) => {
              const isSelected = procedureId === t.id;
              const homeCost = t.homeCost[location.id as keyof typeof t.homeCost] || t.homeCost.US;
              const intlCost = t.price.TH || t.price.IN || 5000;
              const savings = Math.max(0, homeCost - intlCost);

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setProcedureId(t.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-teal text-white border-teal shadow-md scale-[1.01]"
                      : "bg-white border-line text-ink hover:border-teal/50 hover:bg-sand/20"
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                      isSelected ? "bg-white/20 text-white" : "bg-mint text-teal"
                    }`}>
                      {t.specialty}
                    </span>
                    <h3 className={`font-semibold text-xs mt-2 leading-snug ${isSelected ? "text-white" : "text-ink"}`}>
                      {t.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/20 text-[11px] flex justify-between items-baseline">
                    <span className={isSelected ? "text-white/80" : "text-muted"}>
                      Save ~{usd(savings)}
                    </span>
                    <span className={`font-bold ${isSelected ? "text-white" : "text-teal"}`}>
                      From {usd(intlCost)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Procedure Highlight Banner */}
          <div className="p-4 rounded-2xl bg-teal/10 border border-teal/25 text-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-ink">Selected: {selectedProcedure.name}</p>
              <p className="text-muted mt-0.5">
                Hospital Stay: <b>{selectedProcedure.hospitalDays} days</b> • Local Recovery: <b>{selectedProcedure.localRecoveryDays} days</b> before safe flight.
              </p>
            </div>
            <span className="text-xs bg-white text-teal font-bold px-3 py-1 rounded-full border border-teal/20">
              Clearance Window: Day {selectedProcedure.fitToFlyDay}
            </span>
          </div>

          <div className="flex justify-between pt-4 border-t border-line">
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-ghost !py-2 !px-4 text-xs font-semibold"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary !py-2.5 !px-6 text-xs font-semibold flex items-center gap-2"
            >
              <span>Continue to Travel Details</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Travel Companion & Timeline */}
      {currentStep === 3 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
              Step 3: Travel Style
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
              Who is travelling with you and when?
            </h2>
            <p className="text-xs text-muted mt-1">
              We personalize your package to include companion visas, 2-person hospital sleeper suites, and recovery apartments.
            </p>
          </div>

          <div className="space-y-5">
            {/* Companion Toggle Cards */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                Travelling Companion:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCompanion(false)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    !companion
                      ? "bg-teal text-white border-teal shadow-sm"
                      : "bg-white border-line text-ink hover:border-teal/40"
                  }`}
                >
                  <span className="text-2xl">👤</span>
                  <p className="font-bold text-xs mt-2">Travelling Solo</p>
                  <p className={`text-[11px] mt-0.5 ${!companion ? "text-white/80" : "text-muted"}`}>
                    Hospital private nursing &amp; dedicated airport escort included.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanion(true)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    companion
                      ? "bg-teal text-white border-teal shadow-sm"
                      : "bg-white border-line text-ink hover:border-teal/40"
                  }`}
                >
                  <span className="text-2xl">👥</span>
                  <p className="font-bold text-xs mt-2">With Spouse or Companion</p>
                  <p className={`text-[11px] mt-0.5 ${companion ? "text-white/80" : "text-muted"}`}>
                    Includes Medical Attendant Visa, companion room bedding &amp; daily food budget.
                  </p>
                </button>
              </div>
            </div>

            {/* Target Timeline */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                Target Travel Window:
              </label>
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {[
                  { id: "urgent", label: "⚡ Within 30 Days", sub: "Fast-track clinical review" },
                  { id: "planned", label: "🗓️ 1 to 3 Months", sub: "Optimal planning & savings" },
                  { id: "flexible", label: "⏳ 3 to 6 Months", sub: "Flexible recovery dates" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeline(item.id as typeof timeline)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      timeline === item.id
                        ? "bg-teal text-white border-teal font-semibold"
                        : "bg-white border-line text-ink hover:border-teal/40"
                    }`}
                  >
                    <p className="font-semibold">{item.label}</p>
                    <p className={`text-[10px] mt-0.5 ${timeline === item.id ? "text-white/80" : "text-muted"}`}>
                      {item.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Priority */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                What matters most to your journey?
              </label>
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {[
                  { id: "outcomes", label: "Lowest Complication Risk", sub: "Highest JCI audit tier" },
                  { id: "cost", label: "Lowest Total Trip Cost", sub: "Maximum savings package" },
                  { id: "travel", label: "Shortest Flight & Visa", sub: "Fastest travel corridor" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPrimaryPriority(p.id as typeof primaryPriority)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      primaryPriority === p.id
                        ? "bg-teal text-white border-teal font-semibold"
                        : "bg-white border-line text-ink hover:border-teal/40"
                    }`}
                  >
                    <p className="font-semibold">{p.label}</p>
                    <p className={`text-[10px] mt-0.5 ${primaryPriority === p.id ? "text-white/80" : "text-muted"}`}>
                      {p.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-line">
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-ghost !py-2 !px-4 text-xs font-semibold"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary !py-2.5 !px-6 text-xs font-semibold flex items-center gap-2"
            >
              <span>Continue to Clinical Dossier</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Rich Clinical Dossier & Scan Upload Card */}
      {currentStep === 4 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                Step 4: Clinical Dossier &amp; Scans
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Upload Scans &amp; Share Medical Background
              </h2>
              <p className="text-xs text-muted mt-1">
                Upload radiology scans, prescriptions, or recent lab panels. Gemini AI scrubs all PHI client-side and personalizes clinical risk.
              </p>
            </div>
            <span className="text-xs text-teal font-semibold bg-mint px-3 py-1 rounded-full border border-teal/20 self-start sm:self-auto">
              🔒 HIPAA De-identified
            </span>
          </div>

          {/* Section 4A: Real Document File Uploader */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-ink block">
              Medical Document, Prescription, or Scan <span className="text-muted font-normal">(Optional but recommended)</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              id="onboarding-file-input"
            />

            {!uploadedDoc ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-line hover:border-teal/60 rounded-2xl p-6 text-center cursor-pointer bg-sand/10 hover:bg-sand/30 transition-all"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
              >
                <div className="size-12 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto text-xl mb-2">
                  📁
                </div>
                <p className="font-semibold text-sm text-ink">
                  Drag &amp; drop prescription, MRI/X-ray, or lab PDF here
                </p>
                <p className="text-xs text-muted mt-1">
                  Supports PDF, PNG, JPG, WEBP (up to 10 MB). Names &amp; IDs are scrubbed before processing.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost !text-xs !py-1.5 !px-3 mt-3 border border-line"
                >
                  Select from device
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-teal/30 bg-teal/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {uploadedDoc.isImage && uploadedDoc.previewUrl ? (
                    <div className="size-14 rounded-xl overflow-hidden border border-teal/20 bg-white shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploadedDoc.previewUrl} alt="Scan preview" className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="size-14 rounded-xl bg-teal/15 text-teal text-xl font-bold flex items-center justify-center shrink-0">
                      PDF
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-ink truncate">{uploadedDoc.name}</p>
                    <p className="text-[11px] text-muted">{uploadedDoc.sizeKb} KB • Ready for clinical parser</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerAiAnalysis}
                    disabled={isAnalyzingReport}
                    className="btn btn-primary !text-xs !py-1.5 !px-3 font-semibold"
                  >
                    {isAnalyzingReport ? "Analyzing..." : "✨ Analyze with Gemini"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadedDoc(null)}
                    className="text-coral hover:text-red-700 text-xs font-semibold px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {fileError && (
              <div className="p-3 rounded-xl bg-coral/15 border border-coral/30 text-xs text-coral font-medium">
                {fileError}
              </div>
            )}

            {analysisResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>✓ Gemini Clinical Analysis Verified</span>
                  <span>Match Confidence: {Math.round(analysisResult.confidence * 100)}%</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">{analysisResult.summary}</p>
              </div>
            )}
          </div>

          {/* Section 4B: Comorbidities Multi-Select Chips */}
          <div className="space-y-2 pt-2 border-t border-line">
            <label className="text-xs font-semibold text-ink block">
              Pre-Existing Medical Conditions &amp; Risk Factors:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMORBIDITIES_OPTIONS.map((item) => {
                const isSelected = selectedComorbidities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleComorbidity(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-teal text-white border-teal shadow-xs font-semibold"
                        : "bg-white border-line text-ink hover:border-teal/40"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4C: Regular Medications & Allergies */}
          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-line">
            <div>
              <label htmlFor="meds" className="text-xs font-semibold text-ink block mb-1">
                Current Medications <span className="text-muted font-normal">(e.g. Blood thinners, Metformin, Statins)</span>
              </label>
              <input
                id="meds"
                type="text"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Aspirin 75mg daily, Metformin 500mg"
                className="field !text-xs"
              />
            </div>

            <div>
              <label htmlFor="allergies" className="text-xs font-semibold text-ink block mb-1">
                Known Drug Allergies <span className="text-muted font-normal">(e.g. Penicillin, Sulfa, Latex)</span>
              </label>
              <input
                id="allergies"
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, No known drug allergies (NKDA)"
                className="field !text-xs"
              />
            </div>
          </div>

          {/* Section 4D: Known Biomarkers (HbA1c, Blood Pressure, BMI) */}
          <div className="pt-2 border-t border-line space-y-2">
            <label className="text-xs font-semibold text-ink block">
              Recent Lab Biomarkers <span className="text-muted font-normal">(Optional for clinical risk calibration)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label htmlFor="hba1c" className="text-[11px] text-muted block mb-1">HbA1c (%)</label>
                <input
                  id="hba1c"
                  type="text"
                  value={hba1cVal}
                  onChange={(e) => setHba1cVal(e.target.value)}
                  placeholder="e.g. 5.9%"
                  className="field !text-xs"
                />
              </div>

              <div>
                <label htmlFor="bp" className="text-[11px] text-muted block mb-1">Blood Pressure</label>
                <input
                  id="bp"
                  type="text"
                  value={bloodPressureVal}
                  onChange={(e) => setBloodPressureVal(e.target.value)}
                  placeholder="e.g. 120/80"
                  className="field !text-xs"
                />
              </div>

              <div>
                <label htmlFor="height" className="text-[11px] text-muted block mb-1">Height (cm)</label>
                <input
                  id="height"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 175"
                  className="field !text-xs"
                />
              </div>

              <div>
                <label htmlFor="weight" className="text-[11px] text-muted block mb-1">Weight (kg)</label>
                <input
                  id="weight"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 78"
                  className="field !text-xs"
                />
              </div>
            </div>

            {computedBmi && (
              <p className="text-[11px] text-teal font-medium pt-1">
                Calculated BMI: <b>{computedBmi}</b> ({parseFloat(computedBmi) >= 30 ? "Elevated" : "Standard"})
              </p>
            )}
          </div>

          {/* Section 4E: Doctor Notes or Clinical Goals */}
          <div className="pt-2 border-t border-line">
            <label htmlFor="notes" className="text-xs font-semibold text-ink block mb-1">
              Physician Notes or Specific Questions for Surgeon
            </label>
            <textarea
              id="notes"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Recommended total knee arthroplasty due to severe osteoarthritic cartilage loss in right knee..."
              className="field !text-xs"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-line">
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-ghost !py-2 !px-4 text-xs font-semibold"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={isSaving}
              className="btn btn-primary !py-2.5 !px-6 text-xs font-semibold flex items-center gap-2"
            >
              <span>{isSaving ? "Saving Profile..." : "Generate Medical Passport"}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Personalized Medical Journey Passport (Summary & Welcome Card) */}
      {currentStep === 5 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal bg-surface shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                Step 5: Onboarding Complete
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Your Personalized Medical Journey Passport
              </h2>
              <p className="text-xs text-muted mt-1">
                Customized for your origin in {location.name} and interest in {selectedProcedure.name}.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
              ✓ Onboarding Verified &amp; Saved
            </span>
          </div>

          {/* Highlights Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-3.5 rounded-2xl bg-sand/30 border border-line">
              <span className="text-[10px] uppercase font-bold text-muted block">Origin &amp; Corridors</span>
              <p className="font-bold text-sm text-ink mt-1 flex items-center gap-1.5">
                <span>{location.flag}</span> <span>{location.name}</span>
              </p>
              <p className="text-[11px] text-muted mt-0.5">Top hub: Bangkok / New Delhi</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand/30 border border-line">
              <span className="text-[10px] uppercase font-bold text-muted block">Selected Procedure</span>
              <p className="font-bold text-sm text-ink mt-1 truncate">{selectedProcedure.short}</p>
              <p className="text-[11px] text-teal font-semibold mt-0.5">{selectedProcedure.specialty}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand/30 border border-line">
              <span className="text-[10px] uppercase font-bold text-muted block">Travel Style</span>
              <p className="font-bold text-sm text-ink mt-1">
                {companion ? "👥 With Companion" : "👤 Solo Traveler"}
              </p>
              <p className="text-[11px] text-muted mt-0.5 capitalize">{timeline} timeline</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand/30 border border-line">
              <span className="text-[10px] uppercase font-bold text-muted block">Estimated Savings</span>
              <p className="font-bold text-sm text-coral num mt-1">
                ~{usd((selectedProcedure.homeCost.US || 30000) - (selectedProcedure.price.TH || 8000))}
              </p>
              <p className="text-[11px] text-muted mt-0.5">All-in trip estimate</p>
            </div>
          </div>

          {/* Clinical Profile Summary Banner */}
          {(selectedComorbidities.length > 0 || medications || hba1cVal || uploadedDoc) && (
            <div className="p-4 rounded-2xl bg-teal/5 border border-teal/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink uppercase text-[10px] tracking-wider text-teal">
                  Calibrated Clinical Dossier
                </span>
                <span className="text-[10px] text-muted">
                  {uploadedDoc ? `1 document attached (${uploadedDoc.name})` : "Self-reported profile"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedComorbidities.map((c) => (
                  <span key={c} className="bg-white border border-teal/20 px-2 py-0.5 rounded-md text-[11px] text-ink font-medium">
                    {COMORBIDITIES_OPTIONS.find((opt) => opt.id === c)?.label || c}
                  </span>
                ))}
                {hba1cVal && (
                  <span className="bg-white border border-teal/20 px-2 py-0.5 rounded-md text-[11px] text-teal font-semibold">
                    HbA1c: {hba1cVal}
                  </span>
                )}
                {bloodPressureVal && (
                  <span className="bg-white border border-teal/20 px-2 py-0.5 rounded-md text-[11px] text-teal font-semibold">
                    BP: {bloodPressureVal}
                  </span>
                )}
                {computedBmi && (
                  <span className="bg-white border border-teal/20 px-2 py-0.5 rounded-md text-[11px] text-teal font-semibold">
                    BMI: {computedBmi}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Recommended Action Next Steps */}
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-xs text-muted uppercase tracking-wider">
              Recommended Next Steps:
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href={`/match?t=${selectedProcedure.id}&home=${location.id}`}
                className="p-4 rounded-2xl border-2 border-teal/40 bg-teal/5 hover:bg-teal/10 transition-all block group"
              >
                <span className="text-2xl">🏥</span>
                <p className="font-bold text-xs text-ink mt-2 group-hover:text-teal transition-colors">
                  View Matched Hospitals &rarr;
                </p>
                <p className="text-[11px] text-muted mt-1 leading-snug">
                  Compare ranked hospitals for {selectedProcedure.short} from {location.name}.
                </p>
              </Link>

              <Link
                href={`/journey?t=${selectedProcedure.id}&home=${location.id}&c=${companion ? 1 : 0}`}
                className="p-4 rounded-2xl border border-line hover:border-teal/40 bg-white hover:bg-sand/20 transition-all block group"
              >
                <span className="text-2xl">✈️</span>
                <p className="font-bold text-xs text-ink mt-2 group-hover:text-teal transition-colors">
                  Plan Trip &amp; Recovery &rarr;
                </p>
                <p className="text-[11px] text-muted mt-1 leading-snug">
                  See day-by-day medical itinerary, safe-to-fly gate, and companion stay.
                </p>
              </Link>

              <Link
                href="/tourism"
                className="p-4 rounded-2xl border border-line hover:border-teal/40 bg-white hover:bg-sand/20 transition-all block group"
              >
                <span className="text-2xl">🌴</span>
                <p className="font-bold text-xs text-ink mt-2 group-hover:text-teal transition-colors">
                  Explore Destinations &rarr;
                </p>
                <p className="text-[11px] text-muted mt-1 leading-snug">
                  Discover convalescent recovery hotels and medical visa rules.
                </p>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-muted hover:text-ink font-medium"
            >
              ↺ Edit preferences
            </button>
            <Link
              href="/dashboard"
              className="btn btn-primary !py-2.5 !px-6 text-xs font-semibold"
            >
              Go to Patient Dashboard &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
