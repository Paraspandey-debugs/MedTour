"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Globe, { GlobeLocation } from "@/components/Globe";
import { HOMES, HomeId, TREATMENTS, TreatmentId, usd } from "@/lib/data";

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

export interface OnboardingState {
  location: GlobeLocation;
  procedureId: TreatmentId;
  companion: boolean;
  timeline: "urgent" | "planned" | "flexible";
  primaryPriority: "outcomes" | "cost" | "travel";
  hasDocuments: boolean;
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // State
  const [location, setLocation] = useState<GlobeLocation>(ORIGIN_LOCATIONS[0]);
  const [procedureId, setProcedureId] = useState<TreatmentId>("knee");
  const [companion, setCompanion] = useState<boolean>(true);
  const [timeline, setTimeline] = useState<"urgent" | "planned" | "flexible">("planned");
  const [primaryPriority, setPrimaryPriority] = useState<"outcomes" | "cost" | "travel">("outcomes");
  const [hasDocuments, setHasDocuments] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

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

  // Handle browser geolocation API
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
        // Find closest supported origin
        let closest = ORIGIN_LOCATIONS[0];
        let minDist = Infinity;

        ORIGIN_LOCATIONS.forEach((loc) => {
          const d = Math.hypot(loc.lat - latitude, loc.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = loc;
          }
        });

        // Set custom GPS detected coordinate
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

  const nextStep = () => {
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
              {currentStep === 4 && "Clinical Records & Scans"}
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

      {/* STEP 1: Current Location & Interactive Globe */}
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
                Your origin determines flight duration, visa processing times, and potential NHS/US private healthcare wait-time savings.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="btn btn-ghost !text-xs !py-2 border border-line text-ink hover:border-teal flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <span>{isDetectingLocation ? "⏳" : "🎯"}</span>
              <span>{isDetectingLocation ? "Detecting..." : "Use Current GPS"}</span>
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
                Select your origin country / city:
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
                          ? "bg-teal text-white border-teal shadow-sm scale-[1.01]"
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
                  <span className="font-semibold text-ink">Corridors from {location.flag} {location.name}:</span>
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
                    ⏱️ Typical elective wait time at home: <b>{homeData.waitWeeks} weeks</b>. MedTour partner hospital wait time: <b>0 weeks</b>.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Interactive 3D Animated Globe Visual */}
            <div className="flex flex-col items-center justify-center p-2 rounded-3xl bg-sand/20 border border-line/80 relative overflow-hidden">
              <Globe selectedLocation={location} size={340} />
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
                Choose from our 14 seeded surgical specialties to calculate your package savings and required recovery days.
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
              <span>Continue to Documents</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Clinical Documents Check */}
      {currentStep === 4 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
              Step 4: Clinical Dossier
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
              Do you have medical scans or prescriptions?
            </h2>
            <p className="text-xs text-muted mt-1">
              MedTour uses Gemini Multimodal Vision to de-identify and extract surgical indications, HbA1c, and BMI for precise risk weighting.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setHasDocuments(true)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                hasDocuments
                  ? "bg-teal text-white border-teal shadow-md"
                  : "bg-white border-line text-ink hover:border-teal/40"
              }`}
            >
              <span className="text-3xl">📄</span>
              <h3 className="font-bold text-sm mt-3">Yes, I have documents to upload</h3>
              <p className={`text-xs mt-1 leading-relaxed ${hasDocuments ? "text-white/80" : "text-muted"}`}>
                I have a prescription, MRI/X-ray report, or physician referral slip ready for AI analysis.
              </p>
              <div className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                hasDocuments ? "bg-white/20 text-white" : "bg-mint text-teal"
              }`}>
                <span>✨ Multimodal Analysis Ready</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHasDocuments(false)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                !hasDocuments
                  ? "bg-teal text-white border-teal shadow-md"
                  : "bg-white border-line text-ink hover:border-teal/40"
              }`}
            >
              <span className="text-3xl">💡</span>
              <h3 className="font-bold text-sm mt-3">Not yet, I am exploring options</h3>
              <p className={`text-xs mt-1 leading-relaxed ${!hasDocuments ? "text-white/80" : "text-muted"}`}>
                I want to compare hospitals, doctors, and total trip package costs first. I can upload reports later.
              </p>
              <div className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                !hasDocuments ? "bg-white/20 text-white" : "bg-sand text-muted"
              }`}>
                <span>Free Initial Comparison</span>
              </div>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-sand/30 border border-line text-xs text-muted flex items-start gap-2.5">
            <span className="text-base">🔒</span>
            <p className="leading-relaxed">
              <b>HIPAA Safe:</b> All medical documents are scrubbed client-side of personal names, insurance identifiers, and addresses before processing.
            </p>
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
              <span>Generate My Medical Passport</span>
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
                Step 5: Welcome to MedTour
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Your Personalized Medical Journey Passport
              </h2>
              <p className="text-xs text-muted mt-1">
                Based on your origin in {location.name} and interest in {selectedProcedure.name}.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
              ✓ Ready for Exploration
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
              ↺ Reset onboarding preferences
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
