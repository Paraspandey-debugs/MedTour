"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Globe, { GlobeLocation } from "@/components/Globe";
import { HOMES, HomeId, TREATMENTS, TreatmentId, usd } from "@/lib/data";
import { saveOnboardingProfile, type OnboardingProfilePayload } from "./actions";

// Extensive list of international medical travel origin countries
export const GLOBAL_ORIGINS: (GlobeLocation & { code: string; phoneCode: string })[] = [
  { id: "US", code: "US", name: "United States", country: "United States", flag: "🇺🇸", lat: 37.0902, lng: -95.7129, phoneCode: "+1" },
  { id: "UK", code: "GB", name: "United Kingdom", country: "United Kingdom", flag: "🇬🇧", lat: 55.3781, lng: -3.4360, phoneCode: "+44" },
  { id: "CA", code: "CA", name: "Canada", country: "Canada", flag: "🇨🇦", lat: 56.1304, lng: -106.3468, phoneCode: "+1" },
  { id: "AU", code: "AU", name: "Australia", country: "Australia", flag: "🇦🇺", lat: -25.2744, lng: 133.7751, phoneCode: "+61" },
  { id: "AE", code: "AE", name: "United Arab Emirates", country: "UAE", flag: "🇦🇪", lat: 23.4241, lng: 53.8478, phoneCode: "+971" },
  { id: "SA", code: "SA", name: "Saudi Arabia", country: "Saudi Arabia", flag: "🇸🇦", lat: 23.8859, lng: 45.0792, phoneCode: "+966" },
  { id: "KW", code: "KW", name: "Kuwait", country: "Kuwait", flag: "🇰🇼", lat: 29.3117, lng: 47.4818, phoneCode: "+965" },
  { id: "QA", code: "QA", name: "Qatar", country: "Qatar", flag: "🇶🇦", lat: 25.3548, lng: 51.1839, phoneCode: "+974" },
  { id: "OM", code: "OM", name: "Oman", country: "Oman", flag: "🇴🇲", lat: 21.4735, lng: 55.9754, phoneCode: "+968" },
  { id: "NG", code: "NG", name: "Nigeria", country: "Nigeria", flag: "🇳🇬", lat: 9.0820, lng: 8.6753, phoneCode: "+234" },
  { id: "KE", code: "KE", name: "Kenya", country: "Kenya", flag: "🇰🇪", lat: -0.0236, lng: 37.9062, phoneCode: "+254" },
  { id: "ZA", code: "ZA", name: "South Africa", country: "South Africa", flag: "🇿🇦", lat: -30.5595, lng: 22.9375, phoneCode: "+27" },
  { id: "GH", code: "GH", name: "Ghana", country: "Ghana", flag: "🇬🇭", lat: 7.9465, lng: -1.0232, phoneCode: "+233" },
  { id: "EG", code: "EG", name: "Egypt", country: "Egypt", flag: "🇪🇬", lat: 26.8206, lng: 30.8025, phoneCode: "+20" },
  { id: "DE", code: "DE", name: "Germany", country: "Germany", flag: "🇩🇪", lat: 51.1657, lng: 10.4515, phoneCode: "+49" },
  { id: "FR", code: "FR", name: "France", country: "France", flag: "🇫🇷", lat: 46.2276, lng: 2.2137, phoneCode: "+33" },
  { id: "IE", code: "IE", name: "Ireland", country: "Ireland", flag: "🇮🇪", lat: 53.1424, lng: -7.6921, phoneCode: "+353" },
  { id: "NL", code: "NL", name: "Netherlands", country: "Netherlands", flag: "🇳🇱", lat: 52.1326, lng: 5.2913, phoneCode: "+31" },
  { id: "CH", code: "CH", name: "Switzerland", country: "Switzerland", flag: "🇨🇭", lat: 46.8182, lng: 8.2275, phoneCode: "+41" },
  { id: "IT", code: "IT", name: "Italy", country: "Italy", flag: "🇮🇹", lat: 41.8719, lng: 12.5674, phoneCode: "+39" },
  { id: "ES", code: "ES", name: "Spain", country: "Spain", flag: "🇪🇸", lat: 40.4637, lng: -3.7492, phoneCode: "+34" },
  { id: "SE", code: "SE", name: "Sweden", country: "Sweden", flag: "🇸🇪", lat: 60.1282, lng: 18.6435, phoneCode: "+46" },
  { id: "NO", code: "NO", name: "Norway", country: "Norway", flag: "🇳🇴", lat: 60.4720, lng: 8.4689, phoneCode: "+47" },
  { id: "NZ", code: "NZ", name: "New Zealand", country: "New Zealand", flag: "🇳🇿", lat: -40.9006, lng: 174.8860, phoneCode: "+64" },
  { id: "SG", code: "SG", name: "Singapore", country: "Singapore", flag: "🇸🇬", lat: 1.3521, lng: 103.8198, phoneCode: "+65" },
  { id: "MY", code: "MY", name: "Malaysia", country: "Malaysia", flag: "🇲🇾", lat: 4.2105, lng: 101.9758, phoneCode: "+60" },
  { id: "JP", code: "JP", name: "Japan", country: "Japan", flag: "🇯🇵", lat: 36.2048, lng: 138.2529, phoneCode: "+81" },
  { id: "KR", code: "KR", name: "South Korea", country: "South Korea", flag: "🇰🇷", lat: 35.9078, lng: 127.7669, phoneCode: "+82" },
  { id: "IN", code: "IN", name: "India", country: "India", flag: "🇮🇳", lat: 20.5937, lng: 78.9629, phoneCode: "+91" },
  { id: "PK", code: "PK", name: "Pakistan", country: "Pakistan", flag: "🇵🇰", lat: 30.3753, lng: 69.3451, phoneCode: "+92" },
  { id: "BD", code: "BD", name: "Bangladesh", country: "Bangladesh", flag: "🇧🇩", lat: 23.6850, lng: 90.3563, phoneCode: "+880" },
  { id: "BR", code: "BR", name: "Brazil", country: "Brazil", flag: "🇧🇷", lat: -14.2350, lng: -51.9253, phoneCode: "+55" },
  { id: "MX", code: "MX", name: "Mexico", country: "Mexico", flag: "🇲🇽", lat: 23.6345, lng: -102.5528, phoneCode: "+52" },
  { id: "CO", code: "CO", name: "Colombia", country: "Colombia", flag: "🇨🇴", lat: 4.5709, lng: -74.2973, phoneCode: "+57" },
  { id: "AR", code: "AR", name: "Argentina", country: "Argentina", flag: "🇦🇷", lat: -38.4161, lng: -63.6167, phoneCode: "+54" },
  { id: "TR", code: "TR", name: "Türkiye", country: "Türkiye", flag: "🇹🇷", lat: 38.9637, lng: 35.2433, phoneCode: "+90" },
  { id: "IL", code: "IL", name: "Israel", country: "Israel", flag: "🇮🇱", lat: 31.0461, lng: 34.8516, phoneCode: "+972" },
];

export const ORIGIN_LOCATIONS = GLOBAL_ORIGINS.slice(0, 8);

const BASE_COMORBIDITIES = [
  { id: "diabetes", label: "Type 2 Diabetes / Glycemia", icon: "🩸" },
  { id: "hypertension", label: "Hypertension / High BP", icon: "💓" },
  { id: "cardiac", label: "Cardiovascular History", icon: "❤️" },
  { id: "bmi_high", label: "High BMI / Obesity", icon: "⚖️" },
  { id: "respiratory", label: "Asthma / Respiratory", icon: "🫁" },
  { id: "smoking", label: "Active Smoker / Nicotine", icon: "🚬" },
  { id: "anticoagulant", label: "On Blood Thinners", icon: "💊" },
  { id: "kidney", label: "Renal / Kidney Condition", icon: "🩺" },
  { id: "prior_surgery", label: "Prior Surgical Complications", icon: "🔪" },
  { id: "none", label: "Clean Medical History (None)", icon: "✨" },
];

export interface UploadedFileItem {
  id: string;
  name: string;
  sizeKb: number;
  docType: "Prescription" | "MRI/CT Scan" | "Lab Panel" | "Physician Letter" | "Other";
  mimeType: string;
  base64?: string;
  isImage: boolean;
  previewUrl?: string;
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // STEP 1: Flexible Location State
  const [location, setLocation] = useState<GlobeLocation>(GLOBAL_ORIGINS[0]);
  const [originSearch, setOriginSearch] = useState<string>("");
  const [customCity, setCustomCity] = useState<string>("");
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  // STEP 2: Flexible Procedure / Care Need State
  const [procedureSearch, setProcedureSearch] = useState<string>("");
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>("All");
  const [procedureId, setProcedureId] = useState<TreatmentId>("knee");
  const [isCustomProcedure, setIsCustomProcedure] = useState<boolean>(false);
  const [customProcedureName, setCustomProcedureName] = useState<string>("");
  const [customSpecialty, setCustomSpecialty] = useState<string>("Orthopaedics");

  // STEP 3: Patient Demographics & Travel Logistics
  const [fullName, setFullName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("female");
  const [phoneOrWhatsapp, setPhoneOrWhatsapp] = useState<string>("");
  const [contactPreference, setContactPreference] = useState<"whatsapp" | "email" | "phone">("whatsapp");
  const [hasPassport, setHasPassport] = useState<boolean>(true);
  const [passportExpiry, setPassportExpiry] = useState<string>("valid_over_6m");

  const [companion, setCompanion] = useState<boolean>(true);
  const [companionCount, setCompanionCount] = useState<number>(1);
  const [companionRelationship, setCompanionRelationship] = useState<string>("Spouse / Partner");
  const [timeline, setTimeline] = useState<string>("planned");
  const [budgetRange, setBudgetRange] = useState<string>("10k_to_25k");
  const [preferredDestinations, setPreferredDestinations] = useState<string[]>(["TH", "IN", "TR"]);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [primaryPriority, setPrimaryPriority] = useState<"outcomes" | "cost" | "travel">("outcomes");

  // STEP 4: Multi-File Clinical Dossier & Medical Background
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isAnalyzingReport, setIsAnalyzingReport] = useState<boolean>(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<{
    confidence: number;
    treatment?: string;
    riskMultiplier?: number;
    summary?: string;
  } | null>(null);

  const [clinicalNotes, setClinicalNotes] = useState<string>("");
  const [medications, setMedications] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>([]);
  const [customConditionInput, setCustomConditionInput] = useState<string>("");
  const [customComorbidities, setCustomComorbidities] = useState<string[]>([]);
  const [hba1cVal, setHba1cVal] = useState<string>("");
  const [bloodPressureVal, setBloodPressureVal] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered countries list
  const filteredOrigins = useMemo(() => {
    const q = originSearch.toLowerCase().trim();
    if (!q) return GLOBAL_ORIGINS;
    return GLOBAL_ORIGINS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [originSearch]);

  // Distinct specialties list for filter tabs
  const specialties = useMemo(() => {
    const set = new Set<string>();
    TREATMENTS.forEach((t) => set.add(t.specialty));
    return ["All", ...Array.from(set)];
  }, []);

  // Filtered procedures list
  const filteredProcedures = useMemo(() => {
    return TREATMENTS.filter((t) => {
      const matchesSpec = selectedSpecialtyFilter === "All" || t.specialty === selectedSpecialtyFilter;
      const q = procedureSearch.toLowerCase().trim();
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q) || t.keywords.some((k) => k.includes(q));
      return matchesSpec && matchesSearch;
    });
  }, [selectedSpecialtyFilter, procedureSearch]);

  // Selected procedure object
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

  // Handle GPS detection
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
        let closest = GLOBAL_ORIGINS[0];
        let minDist = Infinity;

        GLOBAL_ORIGINS.forEach((loc) => {
          const d = Math.hypot(loc.lat - latitude, loc.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = loc;
          }
        });

        setLocation({
          id: closest.id,
          name: `${closest.name} (GPS ${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°)`,
          country: closest.country,
          flag: "📍",
          lat: latitude,
          lng: longitude,
        });
        setIsDetectingLocation(false);
        setGeoMessage(`Detected GPS location: ${closest.name}`);
      },
      () => {
        setIsDetectingLocation(false);
        setGeoMessage("Could not access GPS. Please select your country below.");
      },
      { timeout: 8000 }
    );
  };

  // Multi-File upload handler
  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedFiles.length + files.length > 5) {
      setFileError("You can upload a maximum of 5 documents in your initial dossier.");
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 12 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds 12 MB limit.`);
        return;
      }

      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newItem: UploadedFileItem = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
          docType: file.name.toLowerCase().includes("mri") || file.name.toLowerCase().includes("scan") ? "MRI/CT Scan" : file.name.toLowerCase().includes("lab") ? "Lab Panel" : "Prescription",
          mimeType: file.type || "application/pdf",
          base64: dataUrl,
          isImage,
          previewUrl: isImage ? dataUrl : undefined,
        };

        setUploadedFiles((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateDocType = (id: string, docType: UploadedFileItem["docType"]) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, docType } : f))
    );
  };

  // Trigger Gemini Analysis on uploaded dossier
  const triggerAiAnalysis = async () => {
    if (uploadedFiles.length === 0 && !clinicalNotes.trim()) {
      setFileError("Please upload at least one document or write clinical notes first.");
      return;
    }

    setIsAnalyzingReport(true);
    setFileError(null);

    try {
      const primaryDoc = uploadedFiles[0];
      const res = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText: clinicalNotes,
          fileData: primaryDoc
            ? {
                base64: primaryDoc.base64,
                mimeType: primaryDoc.mimeType,
                fileName: primaryDoc.name,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setGeminiAnalysis({
        confidence: data.confidence || 0.92,
        treatment: data.treatment,
        riskMultiplier: data.riskMultiplier || 1.0,
        summary: data.summary_3_sentences || data.summary?.join(" ") || "Clinical dossier processed successfully.",
      });

      if (data.treatment && TREATMENTS.some((t) => t.id === data.treatment)) {
        setProcedureId(data.treatment as TreatmentId);
        setIsCustomProcedure(false);
      }

      if (data.biomarkers?.hba1c && !hba1cVal) setHba1cVal(data.biomarkers.hba1c);
      if (data.biomarkers?.blood_pressure && !bloodPressureVal) setBloodPressureVal(data.biomarkers.blood_pressure);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Document analysis timed out.";
      setFileError(msg);
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  // Custom comorbidity tag addition
  const addCustomComorbidity = () => {
    const tag = customConditionInput.trim();
    if (!tag) return;
    if (!customComorbidities.includes(tag)) {
      setCustomComorbidities((prev) => [...prev, tag]);
    }
    setCustomConditionInput("");
  };

  const toggleBaseComorbidity = (id: string) => {
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

  const toggleAccessibility = (item: string) => {
    setAccessibilityNeeds((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleDestinationPref = (code: string) => {
    setPreferredDestinations((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  // Complete Onboarding & Save
  const handleCompleteOnboarding = async () => {
    setIsSaving(true);
    try {
      const payload: OnboardingProfilePayload = {
        fullName,
        age,
        gender,
        phoneOrWhatsapp,
        contactPreference,
        hasPassport,
        passportExpiry,
        locationId: location.id,
        originCountry: location.country,
        originCity: customCity || location.name,
        originFlag: location.flag,
        originLat: location.lat,
        originLng: location.lng,
        procedureId,
        isCustomProcedure,
        customProcedureName: isCustomProcedure ? customProcedureName : undefined,
        customSpecialty: isCustomProcedure ? customSpecialty : undefined,
        companion,
        companionCount: companion ? companionCount : 0,
        companionRelationship: companion ? companionRelationship : undefined,
        timeline,
        budgetRange,
        preferredDestinations,
        accessibilityNeeds,
        primaryPriority,
        clinicalNotes,
        comorbidities: selectedComorbidities,
        customComorbidities,
        medications,
        allergies,
        biomarkers: {
          hba1c: hba1cVal,
          bmi: computedBmi || undefined,
          bloodPressure: bloodPressureVal,
          weightKg,
          heightCm,
        },
        uploadedDocumentsSummary: uploadedFiles.map((f) => ({
          name: f.name,
          sizeKb: f.sizeKb,
          docType: f.docType,
          mimeType: f.mimeType,
        })),
        geminiAnalysis: geminiAnalysis || undefined,
      };

      await saveOnboardingProfile(payload);
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
              {currentStep === 1 && "Global Origin & 3D Flight Corridors"}
              {currentStep === 2 && "Surgical Procedure & Custom Diagnosis"}
              {currentStep === 3 && "Patient Identity & Travel Logistics"}
              {currentStep === 4 && "Multi-Scan Dossier & Clinical Background"}
              {currentStep === 5 && "Your Personalized Medical Travel Passport"}
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

      {/* STEP 1: Global Origin, Search & 3D WebGL Globe */}
      {currentStep === 1 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                Step 1: Origin Location
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Where in the world are you travelling from?
              </h2>
              <p className="text-xs text-muted mt-1">
                Select from 40+ global origin countries or type any custom city. The 3D globe calculates flight hours and direct medical corridors.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="btn btn-ghost !text-xs !py-2 border border-line text-ink hover:border-teal flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <span>{isDetectingLocation ? "⏳" : "🎯"}</span>
              <span>{isDetectingLocation ? "Detecting GPS..." : "Auto-Detect My GPS"}</span>
            </button>
          </div>

          {geoMessage && (
            <div className="p-3 rounded-xl bg-mint/50 border border-teal/20 text-xs text-deep flex items-center gap-2">
              <span>ℹ️</span> {geoMessage}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
            {/* Left Column: Search & Flexible Country Grid */}
            <div className="space-y-4">
              {/* Country Search Bar */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
                <input
                  type="text"
                  value={originSearch}
                  onChange={(e) => setOriginSearch(e.target.value)}
                  placeholder="Search countries, regions (e.g. Canada, Germany, Saudi Arabia)..."
                  className="field !pl-9 !py-2 text-xs w-full"
                />
                {originSearch && (
                  <button
                    type="button"
                    onClick={() => setOriginSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Scrollable Country Selector Grid */}
              <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                <div className="grid grid-cols-2 gap-2">
                  {filteredOrigins.map((loc) => {
                    const isSelected = location.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setLocation(loc);
                          setGeoMessage(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-teal text-white border-teal shadow-md scale-[1.01]"
                            : "bg-white border-line text-ink hover:border-teal/40 hover:bg-sand/20"
                        }`}
                      >
                        <span className="text-xl shrink-0">{loc.flag}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-ink"}`}>
                            {loc.name}
                          </p>
                          <p className={`text-[10px] ${isSelected ? "text-white/80" : "text-muted"}`}>
                            {loc.phoneCode}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Freeform Specific City / Airport Input */}
              <div className="pt-2 border-t border-line">
                <label htmlFor="custom-city" className="text-xs font-semibold text-ink block mb-1">
                  Specific Departure City / Airport <span className="text-muted font-normal">(Optional)</span>
                </label>
                <input
                  id="custom-city"
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="e.g. Manchester (MAN), Toronto (YYZ), Lagos (LOS), Houston (IAH)..."
                  className="field !text-xs"
                />
              </div>

              {/* Active Corridors Preview Card */}
              <div className="p-3.5 rounded-2xl bg-sand/30 border border-line space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    Flight Corridors from {location.flag} {customCity || location.name}:
                  </span>
                  <span className="text-[10px] text-teal font-bold bg-mint px-2 py-0.5 rounded-full">
                    3D Flight Arcs
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-line/60">
                    <span className="text-muted block text-[10px]">🇹🇭 Bangkok</span>
                    <span className="font-bold text-ink">{homeData.hours.TH}h direct</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-line/60">
                    <span className="text-muted block text-[10px]">🇮🇳 New Delhi</span>
                    <span className="font-bold text-ink">{homeData.hours.IN}h direct</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-line/60">
                    <span className="text-muted block text-[10px]">🇹🇷 Istanbul</span>
                    <span className="font-bold text-ink">{homeData.hours.TR}h direct</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: WebGL 3D Globe with Flight Arcs */}
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

      {/* STEP 2: Flexible Surgical Care Need or Custom Diagnosis */}
      {currentStep === 2 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                Step 2: Care Need
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                What procedure or treatment are you planning?
              </h2>
              <p className="text-xs text-muted mt-1">
                Choose from our standard specialties or type any custom medical diagnosis or surgery.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomProcedure(!isCustomProcedure)}
              className="btn btn-ghost !text-xs !py-1.5 border border-line text-ink hover:border-teal shrink-0 self-start sm:self-auto"
            >
              {isCustomProcedure ? "← Choose from standard list" : "+ Custom / Unlisted Procedure"}
            </button>
          </div>

          {/* If Custom Procedure Mode */}
          {isCustomProcedure ? (
            <div className="p-5 rounded-2xl bg-teal/5 border border-teal/25 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <h3 className="font-display text-lg font-bold text-ink">
                  Enter Your Specific Medical Diagnosis or Surgery
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="custom-proc-name" className="text-xs font-semibold text-ink block mb-1">
                    Specific Surgery / Treatment Name *
                  </label>
                  <input
                    id="custom-proc-name"
                    type="text"
                    value={customProcedureName}
                    onChange={(e) => setCustomProcedureName(e.target.value)}
                    placeholder="e.g. Anterior Cruciate Ligament (ACL) Reconstruction, Dental Zirconia Crowns..."
                    className="field !text-xs"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="custom-spec" className="text-xs font-semibold text-ink block mb-1">
                    Surgical Specialty
                  </label>
                  <select
                    id="custom-spec"
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    className="field !text-xs"
                  >
                    <option value="Orthopaedics">Orthopaedics &amp; Joint</option>
                    <option value="Cardiac">Cardiac &amp; Vascular</option>
                    <option value="Spine">Spine &amp; Neurosurgery</option>
                    <option value="Bariatric">Bariatric &amp; Metabolic</option>
                    <option value="Dental">Advanced Dental</option>
                    <option value="Ophthalmology">Ophthalmology &amp; Eye</option>
                    <option value="Fertility">Reproductive Fertility &amp; IVF</option>
                    <option value="Cosmetics">Aesthetic &amp; Reconstructive</option>
                    <option value="General Surgery">General Surgery</option>
                    <option value="Oncology">Surgical Oncology</option>
                    <option value="Other">Other Specialty</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Our clinical matching engine will match your custom request with accredited specialist departments across our 12 partner institutions.
              </p>
            </div>
          ) : (
            /* Standard Filterable Procedure Grid */
            <div className="space-y-4">
              {/* Search & Specialty Filter Tabs */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={procedureSearch}
                  onChange={(e) => setProcedureSearch(e.target.value)}
                  placeholder="Search procedures, implants, or surgical keywords..."
                  className="field !py-2 text-xs w-full"
                />

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  {specialties.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedSpecialtyFilter(spec)}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                        selectedSpecialtyFilter === spec
                          ? "bg-teal text-white shadow-xs font-semibold"
                          : "bg-white border border-line text-muted hover:text-ink hover:border-teal/40"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 max-h-96 overflow-y-auto pr-1">
                {filteredProcedures.map((t) => {
                  const isSelected = procedureId === t.id && !isCustomProcedure;
                  const homeCost = t.homeCost[location.id as keyof typeof t.homeCost] || t.homeCost.US;
                  const intlCost = t.price.TH || t.price.IN || 5000;
                  const savings = Math.max(0, homeCost - intlCost);

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setProcedureId(t.id);
                        setIsCustomProcedure(false);
                      }}
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
            </div>
          )}

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
              <span>Continue to Patient Details</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Patient Identity, Companion & Travel Logistics */}
      {currentStep === 3 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
              Step 3: Patient Profile &amp; Logistics
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
              Who is travelling and what are your travel preferences?
            </h2>
            <p className="text-xs text-muted mt-1">
              Medical coordinators and hospital international desks require patient demographic information to prepare visa sponsorship letters and tailored hospital suites.
            </p>
          </div>

          <div className="space-y-6">
            {/* Part 3A: Patient Identity & WhatsApp */}
            <div className="p-4 rounded-2xl bg-sand/20 border border-line space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-ink">
                Patient Demographics &amp; Contact
              </h3>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label htmlFor="p-name" className="text-xs font-semibold text-ink block mb-1">
                    Legal Name (as on passport) *
                  </label>
                  <input
                    id="p-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="field !text-xs"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="p-age" className="text-xs font-semibold text-ink block mb-1">
                    Age / Year of Birth *
                  </label>
                  <input
                    id="p-age"
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 54"
                    className="field !text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="p-gender" className="text-xs font-semibold text-ink block mb-1">
                    Biological Sex / Gender
                  </label>
                  <select
                    id="p-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="field !text-xs"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div>
                  <label htmlFor="p-phone" className="text-xs font-semibold text-ink block mb-1">
                    WhatsApp / Mobile Number * <span className="text-muted font-normal">(for coordinator liaison)</span>
                  </label>
                  <input
                    id="p-phone"
                    type="tel"
                    value={phoneOrWhatsapp}
                    onChange={(e) => setPhoneOrWhatsapp(e.target.value)}
                    placeholder="e.g. +44 7911 123456 or +1 415 555 2671"
                    className="field !text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="p-contact-pref" className="text-xs font-semibold text-ink block mb-1">
                    Preferred Communication Channel
                  </label>
                  <select
                    id="p-contact-pref"
                    value={contactPreference}
                    onChange={(e) => setContactPreference(e.target.value as typeof contactPreference)}
                    className="field !text-xs"
                  >
                    <option value="whatsapp">WhatsApp Message (Fastest)</option>
                    <option value="email">Email only</option>
                    <option value="phone">Scheduled Phone Call</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Part 3B: Companion Setup */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                Travelling Companions / Family Attendants:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {[
                  { count: 0, label: "Solo (0 Companions)", sub: "Dedicated hospital nurse" },
                  { count: 1, label: "1 Companion", sub: "Spouse / Relative" },
                  { count: 2, label: "2 Attendants", sub: "Family attendants" },
                  { count: 3, label: "3+ Group", sub: "Multi-occupancy suite" },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => {
                      setCompanion(item.count > 0);
                      setCompanionCount(item.count);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      (item.count === 0 && !companion) || (companion && companionCount === item.count)
                        ? "bg-teal text-white border-teal font-semibold shadow-xs"
                        : "bg-white border-line text-ink hover:border-teal/40"
                    }`}
                  >
                    <p className="font-semibold">{item.label}</p>
                    <p className={`text-[10px] mt-0.5 ${(item.count === 0 && !companion) || (companion && companionCount === item.count) ? "text-white/80" : "text-muted"}`}>
                      {item.sub}
                    </p>
                  </button>
                ))}
              </div>

              {companion && (
                <div className="mt-3">
                  <label htmlFor="companion-rel" className="text-xs font-semibold text-ink block mb-1">
                    Companion Relationship &amp; Room Preference
                  </label>
                  <input
                    id="companion-rel"
                    type="text"
                    value={companionRelationship}
                    onChange={(e) => setCompanionRelationship(e.target.value)}
                    placeholder="e.g. Spouse, Adult Child, Caregiver, Double-occupancy suite needed..."
                    className="field !text-xs"
                  />
                </div>
              )}
            </div>

            {/* Passport & Primary Priority */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                  International Passport Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasPassport(true);
                      setPassportExpiry("valid_over_6m");
                    }}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      hasPassport ? "bg-teal text-white border-teal font-semibold" : "bg-white border-line text-ink"
                    }`}
                  >
                    ✓ Valid (6+ months)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHasPassport(false);
                      setPassportExpiry("applying_now");
                    }}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      !hasPassport ? "bg-teal text-white border-teal font-semibold" : "bg-white border-line text-ink"
                    }`}
                  >
                    Applying / Renewing
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                  Primary Journey Priority
                </label>
                <select
                  value={primaryPriority}
                  onChange={(e) => setPrimaryPriority(e.target.value as typeof primaryPriority)}
                  className="field !text-xs"
                >
                  <option value="outcomes">Lowest Complication Risk &amp; JCI Accreditation</option>
                  <option value="cost">Lowest Total All-in Package Cost</option>
                  <option value="travel">Shortest Flight &amp; Fast Medical Visa</option>
                </select>
              </div>
            </div>

            {/* Preferred Medical Destinations */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                Preferred Medical Destinations <span className="text-muted font-normal">(select all that interest you)</span>
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { code: "TH", name: "🇹🇭 Thailand (Bangkok / Phuket)" },
                  { code: "IN", name: "🇮🇳 India (Delhi / Mumbai / Chennai)" },
                  { code: "TR", name: "🇹🇷 Türkiye (Istanbul / Antalya)" },
                  { code: "KR", name: "🇰🇷 South Korea (Seoul)" },
                  { code: "SG", name: "🇸🇬 Singapore" },
                  { code: "MY", name: "🇲🇾 Malaysia (Penang)" },
                  { code: "AE", name: "🇦🇪 UAE (Dubai)" },
                  { code: "MX", name: "🇲🇽 Mexico (Tijuana)" },
                ].map((d) => {
                  const isChecked = preferredDestinations.includes(d.code);
                  return (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => toggleDestinationPref(d.code)}
                      className={`px-3 py-1.5 rounded-xl border transition-all font-medium ${
                        isChecked
                          ? "bg-teal text-white border-teal shadow-xs font-semibold"
                          : "bg-white border-line text-ink hover:border-teal/40"
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Part 3C: Departure Timeline & Target Budget */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                  Target Travel Window
                </label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="field !text-xs"
                >
                  <option value="urgent">⚡ Urgent / Next 2 to 4 Weeks</option>
                  <option value="planned">🗓️ Planned / 1 to 3 Months</option>
                  <option value="flexible">⏳ 3 to 6 Months</option>
                  <option value="exploring">💡 Flexible / Budget &amp; Season Dependent</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                  Estimated Total Trip Budget (All-in)
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="field !text-xs"
                >
                  <option value="under_10k">Under $10,000 USD</option>
                  <option value="10k_to_25k">$10,000 – $25,000 USD (Standard package)</option>
                  <option value="25k_to_50k">$25,000 – $50,000 USD (Complex quaternary)</option>
                  <option value="vip_flexible">$50,000+ USD (Executive VIP care)</option>
                </select>
              </div>
            </div>

            {/* Part 3D: Special Assistance & Dietary Needs */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                Accessibility, Mobility &amp; Dietary Requirements:
              </label>

              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  "♿ Wheelchair / Ramp Assistance",
                  "🚑 Airport Stretcher Transfer",
                  "🗣️ Arabic / French Hospital Translator",
                  "🥗 Halal / Kosher Meals",
                  "🥑 Pure Vegetarian / Vegan",
                  "🍳 Kitchenette for Companion Cooking",
                  "🛏️ Step-free Walk-in Shower Suite",
                ].map((item) => {
                  const isChecked = accessibilityNeeds.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAccessibility(item)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        isChecked
                          ? "bg-teal text-white border-teal shadow-xs font-semibold"
                          : "bg-white border-line text-ink hover:border-teal/40"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
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

      {/* STEP 4: Flexible Multi-File Upload & Clinical Background */}
      {currentStep === 4 && (
        <div className="card p-6 sm:p-8 space-y-6 fade-up border-2 border-teal/20 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                Step 4: Clinical Dossier &amp; Multi-Scan Upload
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Attach Medical Scans &amp; Health Background
              </h2>
              <p className="text-xs text-muted mt-1">
                Upload multiple scans (MRI, CT, lab panels, prescriptions). You can also add custom comorbidities and known lab values.
              </p>
            </div>
            <span className="text-xs text-teal font-semibold bg-mint px-3 py-1 rounded-full border border-teal/20 self-start sm:self-auto">
              🔒 HIPAA De-identified
            </span>
          </div>

          {/* Part 4A: Multi-File Dropzone & File List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-ink block">
                Attach Medical Records <span className="text-muted font-normal">(Up to 5 files: PDF, PNG, JPG, WEBP)</span>
              </label>
              <span className="text-[11px] text-muted font-mono">{uploadedFiles.length}/5 files attached</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMultipleFiles}
              multiple
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              id="multi-scan-input"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-line hover:border-teal/60 rounded-2xl p-5 text-center cursor-pointer bg-sand/10 hover:bg-sand/30 transition-all"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
            >
              <div className="size-10 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto text-lg mb-1.5">
                📁
              </div>
              <p className="font-semibold text-xs text-ink">
                Drag &amp; drop multiple scans, MRI reports, or lab slips here
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                Supports multiple files (up to 12 MB each). Client-side sanitization strips patient IDs and names.
              </p>
              <button
                type="button"
                className="btn btn-ghost !text-xs !py-1 !px-3 mt-2 border border-line"
              >
                + Browse and add documents
              </button>
            </div>

            {/* List of Attached Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 pt-1">
                {uploadedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-line bg-white shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{f.isImage ? "🖼️" : "📄"}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{f.name}</p>
                        <p className="text-[10px] text-muted font-mono">{f.sizeKb} KB</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={f.docType}
                        onChange={(e) => updateDocType(f.id, e.target.value as UploadedFileItem["docType"])}
                        className="field !text-[11px] !py-1 !px-2 bg-sand/20"
                      >
                        <option value="Prescription">Doctor Prescription</option>
                        <option value="MRI/CT Scan">MRI / CT Scan</option>
                        <option value="Lab Panel">Lab Blood Panel</option>
                        <option value="Physician Letter">Physician Referral</option>
                        <option value="Other">Other Diagnostic</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="text-coral hover:text-red-700 font-bold px-2 py-1 text-xs"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={triggerAiAnalysis}
                  disabled={isAnalyzingReport}
                  className="btn btn-secondary !text-xs !py-1.5 !px-3 font-semibold flex items-center gap-1.5 mt-2"
                >
                  <span>{isAnalyzingReport ? "⏳" : "✨"}</span>
                  <span>{isAnalyzingReport ? "Analyzing Dossier with Gemini..." : "Audit Dossier with Gemini Multimodal AI"}</span>
                </button>
              </div>
            )}

            {fileError && (
              <div className="p-3 rounded-xl bg-coral/15 border border-coral/30 text-xs text-coral font-medium">
                {fileError}
              </div>
            )}

            {geminiAnalysis && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>✓ Gemini Clinical Analysis Verified</span>
                  <span>Match Confidence: {Math.round(geminiAnalysis.confidence * 100)}%</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">{geminiAnalysis.summary}</p>
              </div>
            )}
          </div>

          {/* Part 4B: Comorbidities (Preset + Custom Tags) */}
          <div className="space-y-3 pt-2 border-t border-line">
            <label className="text-xs font-semibold text-ink block">
              Pre-Existing Medical Conditions &amp; Comorbidities:
            </label>

            <div className="flex flex-wrap gap-2">
              {BASE_COMORBIDITIES.map((item) => {
                const isSelected = selectedComorbidities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleBaseComorbidity(item.id)}
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

              {/* Render custom tag pills */}
              {customComorbidities.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal/15 text-teal border border-teal/30 flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => setCustomComorbidities((prev) => prev.filter((t) => t !== tag))}
                    className="hover:text-coral font-bold ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Condition Adder Input */}
            <div className="flex gap-2 max-w-md pt-1">
              <input
                type="text"
                value={customConditionInput}
                onChange={(e) => setCustomConditionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomComorbidity();
                  }
                }}
                placeholder="Type custom condition (e.g. Hypothyroidism, Glaucoma, Pacemaker)..."
                className="field !text-xs !py-1.5 flex-1"
              />
              <button
                type="button"
                onClick={addCustomComorbidity}
                className="btn btn-ghost !text-xs !py-1.5 !px-3 border border-line"
              >
                + Add Condition
              </button>
            </div>
          </div>

          {/* Part 4C: Medications & Allergies */}
          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-line">
            <div>
              <label htmlFor="meds-flexible" className="text-xs font-semibold text-ink block mb-1">
                Current Medications <span className="text-muted font-normal">(e.g. Metformin, Aspirin, Statins)</span>
              </label>
              <input
                id="meds-flexible"
                type="text"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                className="field !text-xs"
              />
            </div>

            <div>
              <label htmlFor="allergies-flexible" className="text-xs font-semibold text-ink block mb-1">
                Known Drug / Material Allergies <span className="text-muted font-normal">(e.g. Penicillin, Latex)</span>
              </label>
              <input
                id="allergies-flexible"
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Latex, None known (NKDA)"
                className="field !text-xs"
              />
            </div>
          </div>

          {/* Part 4D: Known Lab Biomarkers */}
          <div className="pt-2 border-t border-line space-y-2">
            <label className="text-xs font-semibold text-ink block">
              Recent Clinical Biomarkers <span className="text-muted font-normal">(Optional)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label htmlFor="hba1c-f" className="text-[11px] text-muted block mb-1">HbA1c (%)</label>
                <input
                  id="hba1c-f"
                  type="text"
                  value={hba1cVal}
                  onChange={(e) => setHba1cVal(e.target.value)}
                  placeholder="e.g. 5.8%"
                  className="field !text-xs"
                />
              </div>

              <div>
                <label htmlFor="bp-f" className="text-[11px] text-muted block mb-1">Blood Pressure</label>
                <input
                  id="bp-f"
                  type="text"
                  value={bloodPressureVal}
                  onChange={(e) => setBloodPressureVal(e.target.value)}
                  placeholder="e.g. 120/80"
                  className="field !text-xs"
                />
              </div>

              <div>
                <label htmlFor="h-f" className="text-[11px] text-muted block mb-1">Height (cm)</label>
                <input
                  id="h-f"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 175"
                  className="field !text-xs"
                />
              </div>

              <div>
                <label htmlFor="w-f" className="text-[11px] text-muted block mb-1">Weight (kg)</label>
                <input
                  id="w-f"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 75"
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

          {/* Part 4E: Doctor Notes or Clinical Questions */}
          <div className="pt-2 border-t border-line">
            <label htmlFor="notes-f" className="text-xs font-semibold text-ink block mb-1">
              Physician Notes, Diagnosis Summary or Questions for the Surgeon
            </label>
            <textarea
              id="notes-f"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Recommended total joint replacement due to severe osteoarthritic cartilage loss in right knee. Looking for minimally invasive robotic option..."
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
              <span>{isSaving ? "Saving Dossier..." : "Generate Medical Passport"}</span>
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
                Medical Travel Passport for {fullName || "Patient"}
              </h2>
              <p className="text-xs text-muted mt-1">
                Customized for departure from {customCity || location.name} to our verified international medical corridors.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
              ✓ Profile Verified &amp; Saved
            </span>
          </div>

          {/* Highlights Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-3.5 rounded-2xl bg-sand/30 border border-line">
              <span className="text-[10px] uppercase font-bold text-muted block">Departure Origin</span>
              <p className="font-bold text-sm text-ink mt-1 flex items-center gap-1.5 truncate">
                <span>{location.flag}</span> <span>{customCity || location.name}</span>
              </p>
              <p className="text-[11px] text-muted mt-0.5">{phoneOrWhatsapp ? `📞 ${phoneOrWhatsapp}` : location.country}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand/30 border border-line">
              <span className="text-[10px] uppercase font-bold text-muted block">Intended Care</span>
              <p className="font-bold text-sm text-ink mt-1 truncate">
                {isCustomProcedure ? customProcedureName || "Custom Surgery" : selectedProcedure.short}
              </p>
              <p className="text-[11px] text-teal font-semibold mt-0.5">
                {isCustomProcedure ? customSpecialty : selectedProcedure.specialty}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand/30 border border-line">
              <span className="text-[10px] uppercase font-bold text-muted block">Travel Style</span>
              <p className="font-bold text-sm text-ink mt-1">
                {companion ? `👥 ${companionCount} Companion${companionCount > 1 ? "s" : ""}` : "👤 Solo Traveler"}
              </p>
              <p className="text-[11px] text-muted mt-0.5 capitalize">{timeline} departure</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand/30 border border-line">
              <span className="text-[10px] uppercase font-bold text-muted block">Estimated Savings</span>
              <p className="font-bold text-sm text-coral num mt-1">
                ~{usd((selectedProcedure.homeCost.US || 30000) - (selectedProcedure.price.TH || 8000))}
              </p>
              <p className="text-[11px] text-muted mt-0.5">Package savings vs US private</p>
            </div>
          </div>

          {/* Clinical Profile Summary Banner */}
          {(selectedComorbidities.length > 0 || customComorbidities.length > 0 || medications || hba1cVal || uploadedFiles.length > 0) && (
            <div className="p-4 rounded-2xl bg-teal/5 border border-teal/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink uppercase text-[10px] tracking-wider text-teal">
                  Calibrated Clinical Dossier
                </span>
                <span className="text-[10px] text-muted">
                  {uploadedFiles.length > 0 ? `${uploadedFiles.length} document${uploadedFiles.length > 1 ? "s" : ""} attached` : "Self-reported profile"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedComorbidities.map((c) => (
                  <span key={c} className="bg-white border border-teal/20 px-2 py-0.5 rounded-md text-[11px] text-ink font-medium">
                    {BASE_COMORBIDITIES.find((opt) => opt.id === c)?.label || c}
                  </span>
                ))}
                {customComorbidities.map((c) => (
                  <span key={c} className="bg-white border border-teal/20 px-2 py-0.5 rounded-md text-[11px] text-ink font-medium">
                    🏷️ {c}
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
                  Compare ranked hospitals for {isCustomProcedure ? customProcedureName : selectedProcedure.short} from {customCity || location.name}.
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
