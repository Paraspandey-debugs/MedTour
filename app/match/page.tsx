"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  COUNTRIES,
  HOMES,
  SAMPLE_REPORTS,
  TREATMENTS,
  doctorsByHospital,
  hospitalById,
  treatmentById,
  usd,
  pct,
  type CountryId,
  type Doctor,
  type HomeId,
  type Hospital,
  type Specialty,
  type Treatment,
  type TreatmentId,
} from "@/lib/data";
import {
  DEFAULT_WEIGHTS,
  analyzeReport,
  deidentifyReport,
  matchHospitals,
  type Analysis,
  type Match,
  type Weights,
} from "@/lib/engine";
import { Disclaimer, HospitalMark, PageHead, Place, TierBadge } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

const WEIGHT_LABELS: Record<keyof Weights, [string, string]> = {
  outcomes: ["Outcome data", "Lowest personalised complication risk"],
  cost: ["Total cost", "Lowest Total cost, all-in"],
  travel: ["Easy travel", "Short flight, fast visa"],
  trust: ["Verification", "Audit depth and patient ratings"],
};

const PART_COLORS: Record<keyof Weights, string> = {
  outcomes: "#0b6b63",
  cost: "#b7862b",
  travel: "#4a7fa5",
  trust: "#10292c",
};

const SPECIALTY_CATEGORIES: { id: "all" | Specialty; label: string; icon: string }[] = [
  { id: "all", label: "All Specialties", icon: "🌐" },
  { id: "Orthopaedics", label: "Orthopaedics", icon: "🦴" },
  { id: "Cardiac", label: "Cardiology", icon: "🫀" },
  { id: "Spine", label: "Spine Surgery", icon: "🩺" },
  { id: "Bariatric", label: "Bariatric / Weight", icon: "⚖️" },
  { id: "Cosmetics", label: "Cosmetic & Plastic", icon: "✨" },
  { id: "Dental", label: "Dental Surgery", icon: "🦷" },
  { id: "Ophthalmology", label: "Ophthalmology", icon: "👁️" },
  { id: "Fertility", label: "Fertility / IVF", icon: "👶" },
  { id: "General Surgery", label: "General Surgery", icon: "🔬" },
  { id: "Oncology", label: "Oncology", icon: "🎗️" },
];

const POPULAR_CORRIDORS = [
  {
    from: "UK" as HomeId,
    fromName: "United Kingdom",
    fromFlag: "🇬🇧",
    to: "TH" as CountryId,
    toName: "Thailand",
    toFlag: "🇹🇭",
    procedureId: "hip" as TreatmentId,
    title: "Hip Replacement in Bangkok",
    savings: "$21,000",
    packagePrice: "$11,500",
    highlight: "JCI Accredited · 14-day luxury recovery suite · Zero NHS waitlist",
  },
  {
    from: "US" as HomeId,
    fromName: "United States",
    fromFlag: "🇺🇸",
    to: "MX" as CountryId,
    toName: "Mexico",
    toFlag: "🇲🇽",
    procedureId: "bariatric" as TreatmentId,
    title: "Gastric Sleeve in Tijuana",
    savings: "$15,200",
    packagePrice: "$4,800",
    highlight: "San Diego shuttle transfer · ASMBS Surgeon · 70% package savings",
  },
  {
    from: "CA" as HomeId,
    fromName: "Canada",
    fromFlag: "🇨🇦",
    to: "IN" as CountryId,
    toName: "India",
    toFlag: "🇮🇳",
    procedureId: "knee" as TreatmentId,
    title: "Robotic Knee Replacement in Delhi",
    savings: "$17,500",
    packagePrice: "$6,500",
    highlight: "Robotic navigation · Immediate surgical admission vs 28-week wait",
  },
  {
    from: "AU" as HomeId,
    fromName: "Australia",
    fromFlag: "🇦🇺",
    to: "MY" as CountryId,
    toName: "Malaysia",
    toFlag: "🇲🇾",
    procedureId: "cabg" as TreatmentId,
    title: "Heart Bypass (CABG) in George Town",
    savings: "$28,500",
    packagePrice: "$13,500",
    highlight: "Direct flights · English native medical team · 98.8% success rate",
  },
  {
    from: "UK" as HomeId,
    fromName: "United Kingdom",
    fromFlag: "🇬🇧",
    to: "TR" as CountryId,
    toName: "Türkiye",
    toFlag: "🇹🇷",
    procedureId: "dental" as TreatmentId,
    title: "All-on-4 Full Dental Restoration in Istanbul",
    savings: "$11,500",
    packagePrice: "$4,500",
    highlight: "Straumann Swiss implants · 3-hour flight · Free companion stay",
  },
  {
    from: "US" as HomeId,
    fromName: "United States",
    fromFlag: "🇺🇸",
    to: "KR" as CountryId,
    toName: "South Korea",
    toFlag: "🇰🇷",
    procedureId: "prostate" as TreatmentId,
    title: "Robotic Da Vinci Prostatectomy in Seoul",
    savings: "$47,000",
    packagePrice: "$17,500",
    highlight: "University Teaching Hospital · Robotic nerve-sparing protocol",
  },
];

interface UploadedDoc {
  name: string;
  mimeType: string;
  base64: string;
  sizeKb: number;
  isImage: boolean;
  previewUrl?: string;
}

export default function MatchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 text-muted">Loading matches…</div>}>
      <MatchPageInner />
    </Suspense>
  );
}

function MatchPageInner() {
  const searchParams = useSearchParams();

  // Parse URL query parameters
  const queryTreatment = searchParams.get("t") || searchParams.get("procedure");
  const queryHome = searchParams.get("home") || searchParams.get("from");
  const queryCompanion = searchParams.get("c") || searchParams.get("companion");
  const queryRisk = searchParams.get("risk");

  const [tab, setTab] = useState<"upload" | "text">("upload");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aiPowered, setAiPowered] = useState(false);
  const [patientQuestions, setPatientQuestions] = useState<string[]>([]);
  const [biomarkers, setBiomarkers] = useState<Record<string, string | null>>({});
  const [summary3, setSummary3] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Active procedure state: null represents browsing explorer mode
  const [override, setOverride] = useState<TreatmentId | "browse" | null>(
    queryTreatment === "browse" ? "browse" : (TREATMENTS.some((t) => t.id === queryTreatment) ? (queryTreatment as TreatmentId) : "knee")
  );

  const initialHome: HomeId = queryHome && queryHome in HOMES ? (queryHome as HomeId) : "UK";
  const [home, setHome] = useState<HomeId>(initialHome);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [companion, setCompanion] = useState(queryCompanion === "0" ? false : true);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showOverridePicker, setShowOverridePicker] = useState(false);

  // Procedure Explorer Filter State
  const [procedureSearch, setProcedureSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<"all" | Specialty>("all");

  // Multi-Hospital Comparison State (Gap 3)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Video Consultation Booking Modal State (Gap 1)
  const [videoModalHospital, setVideoModalHospital] = useState<Hospital | null>(null);

  // Visa Invitation & Official Quote Modal State (Gap 5)
  const [visaModalData, setVisaModalData] = useState<{ hospital: Hospital; match: Match } | null>(null);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<UploadedDoc | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-Side Privacy Scrubber Audit State
  const [privacyAudit, setPrivacyAudit] = useState<{
    redactedCount: number;
    types: Record<string, number>;
  } | null>(null);

  // Pre-load from Onboarding Profile if available in localStorage/cookie
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedProfileStr = localStorage.getItem("medtour_onboarding_profile");
        if (savedProfileStr && !queryTreatment && !queryHome) {
          const profile = JSON.parse(savedProfileStr);
          if (profile.procedureId && TREATMENTS.some((t) => t.id === profile.procedureId)) {
            setOverride(profile.procedureId as TreatmentId);
          }
          if (profile.locationId && profile.locationId in HOMES) {
            setHome(profile.locationId as HomeId);
          }
          if (typeof profile.companion === "boolean") {
            setCompanion(profile.companion);
          }
          if (profile.geminiAnalysis?.riskMultiplier) {
            setAnalysis((prev) => ({
              treatment: (profile.procedureId as TreatmentId) || "knee",
              confidence: profile.geminiAnalysis.confidence || 0.9,
              matchedTerms: [],
              age: typeof profile.age === "number" ? profile.age : null,
              findings: [],
              risks: [],
              riskMultiplier: profile.geminiAnalysis.riskMultiplier || 1.0,
              summary: [profile.geminiAnalysis.summary || "Calibrated clinical intake profile."],
              ...prev,
            }));
          }
        }
      } catch {
        // Ignore localStorage parse errors
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [queryTreatment, queryHome]);

  // Animated analysis progress ticker
  useEffect(() => {
    if (!isAnalyzing) return;
    const timer = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  // Process a selected or dropped file
  const processFile = (file: File) => {
    setFileError(null);
    setApiError(null);

    // Limit to 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError(`"${file.name}" is ${Math.round(file.size / (1024 * 1024))} MB. Maximum allowed size is 5 MB.`);
      return;
    }

    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    if (!isImage && !isPdf) {
      setFileError("Please upload a medical prescription scan or PDF (accepted: PDF, PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;

      // If WebP, convert to standard JPEG via in-memory canvas for 100% Gemini compatibility
      if (file.type === "image/webp" || /\.webp$/i.test(file.name)) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
            setUploadedFile({
              name: file.name.replace(/\.webp$/i, ".jpg"),
              mimeType: "image/jpeg",
              base64: jpegDataUrl,
              sizeKb: Math.round(file.size / 1024),
              isImage: true,
              previewUrl: jpegDataUrl,
            });
            return;
          }
        };
        img.src = rawDataUrl;
      } else {
        setUploadedFile({
          name: file.name,
          mimeType: file.type || (isPdf ? "application/pdf" : "image/jpeg"),
          base64: rawDataUrl,
          sizeKb: Math.round(file.size / 1024),
          isImage,
          previewUrl: isImage ? rawDataUrl : undefined,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setTab("upload");
      processFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runAnalysis = async (explicitText?: string) => {
    const textToAnalyze = typeof explicitText === "string" ? explicitText : (tab === "text" ? text : notes);
    if (!textToAnalyze.trim() && !uploadedFile) {
      setApiError("Please upload a prescription or paste clinical notes to analyse.");
      return;
    }

    setAnalysisStep(0);
    setIsAnalyzing(true);
    setApiError(null);

    // 1. Client-side PHI de-identification for text
    let sanitizedText = textToAnalyze;
    if (textToAnalyze.trim()) {
      const deid = deidentifyReport(textToAnalyze);
      sanitizedText = deid.sanitizedText;
      if (deid.redactedCount > 0) {
        setPrivacyAudit({
          redactedCount: deid.redactedCount,
          types: deid.redactedTypes,
        });
      } else {
        setPrivacyAudit(null);
      }
    }

    try {
      const res = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText: sanitizedText,
          fileData: uploadedFile
            ? {
                base64: uploadedFile.base64,
                mimeType: uploadedFile.mimeType,
                fileName: uploadedFile.name,
              }
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      setAnalysis(data);
      setAiPowered(!!data.aiPowered);
      setBiomarkers(data.biomarkers || {});
      setSummary3(data.summary_3_sentences || data.summary?.join(" ") || "");
      setPatientQuestions(data.patient_questions || data.patientQuestions || []);
      setOverride(null);
      setShowOverridePicker(false);
      setWeights(
        (data.riskMultiplier || data.risk_multiplier || 1) >= 1.4
          ? { outcomes: 55, cost: 20, travel: 10, trust: 15 }
          : DEFAULT_WEIGHTS
      );
      setIsAnalyzing(false);
      return;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Prescription analysis could not be completed.";
      console.warn("API report analysis error:", err);

      // If text exists, fallback to deterministic engine
      if (sanitizedText.trim()) {
        const fallback = analyzeReport(sanitizedText);
        setAnalysis(fallback);
        setAiPowered(false);
        setBiomarkers({
          hba1c: fallback.findings.find((f) => f.label.includes("HbA1c"))?.value || null,
          bmi: fallback.findings.find((f) => f.label.includes("BMI"))?.value || null,
        });
        setSummary3(fallback.summary.slice(0, 3).join(" "));
        setPatientQuestions([]);
        setOverride(null);
        setWeights(fallback.riskMultiplier >= 1.4 ? { outcomes: 55, cost: 20, travel: 10, trust: 15 } : DEFAULT_WEIGHTS);
        setIsAnalyzing(false);
        setApiError("Using local clinical parser (Gemini service timed out or unavailable).");
        return;
      }

      setIsAnalyzing(false);
      setApiError(message);
    }
  };

  const loadSample = (sampleText: string) => {
    setText(sampleText);
    setTab("text");
    removeFile();
    runAnalysis(sampleText);
  };

  // Determine active procedure
  const isBrowsing = override === "browse";
  const activeTreatmentId: TreatmentId | null = isBrowsing ? null : (override ?? analysis?.treatment ?? "knee");
  const treatment: Treatment | null = activeTreatmentId ? treatmentById(activeTreatmentId) : null;
  const risk = queryRisk ? parseFloat(queryRisk) : (analysis?.riskMultiplier ?? 1);

  const homeData = HOMES[home] || HOMES.UK;

  const matches = useMemo(
    () => (treatment ? matchHospitals(treatment, homeData, weights, { companion, riskMultiplier: risk }) : []),
    [treatment, homeData, weights, companion, risk]
  );

  const wsum = weights.outcomes + weights.cost + weights.travel + weights.trust || 1;
  const q = (h: string) => `t=${activeTreatmentId || "knee"}&home=${home}&risk=${risk.toFixed(2)}&c=${companion ? 1 : 0}&h=${h}`;

  // Multi-hospital comparison toggle (Gap 3)
  const toggleCompare = (hospitalId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(hospitalId)) return prev.filter((id) => id !== hospitalId);
      if (prev.length >= 3) {
        return [...prev.slice(1), hospitalId];
      }
      return [...prev, hospitalId];
    });
  };

  // Filtered procedures for browsing mode
  const filteredProcedures = useMemo(() => {
    return TREATMENTS.filter((t) => {
      const matchesSpecialty = selectedSpecialty === "all" || t.specialty === selectedSpecialty;
      const matchesSearch =
        !procedureSearch.trim() ||
        t.name.toLowerCase().includes(procedureSearch.toLowerCase()) ||
        t.short.toLowerCase().includes(procedureSearch.toLowerCase()) ||
        t.keywords.some((k) => k.toLowerCase().includes(procedureSearch.toLowerCase()));
      return matchesSpecialty && matchesSearch;
    });
  }, [selectedSpecialty, procedureSearch]);

  return (
    <>
      <PageHead
        eyebrow="Clinical Analysis & Matching"
        title="Compare accredited international hospitals."
      >
        Upload a prescription scan or lab report to personalize surgical risk, or explore verified hospital
        quotations and side-by-side clinical outcomes across global destinations.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6">
        <MedicalDisclaimer />
      </div>

      {/* Clinical Dossier Upload / Intake Section */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left Column: Upload & Input Card */}
        <section className="card p-5 sm:p-6 self-start space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="font-semibold text-ink text-base">Your Medical Document</h2>
            <span className="text-[11px] text-teal font-medium flex items-center gap-1 bg-mint px-2.5 py-0.5 rounded-full">
              ✨ Gemini Multimodal Vision
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-sand/40 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === "upload" ? "bg-white text-ink shadow-xs font-semibold" : "text-muted hover:text-ink"
              }`}
            >
              <span>📄</span>
              <span>Upload Prescription / Scan</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("text")}
              className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === "text" ? "bg-white text-ink shadow-xs font-semibold" : "text-muted hover:text-ink"
              }`}
            >
              <span>✍️</span>
              <span>Paste Clinical Text</span>
            </button>
          </div>

          {/* Tab 1: Multimodal File Upload */}
          {tab === "upload" && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-teal bg-teal/5 scale-[1.01]"
                    : uploadedFile
                    ? "border-teal/50 bg-mint/30"
                    : "border-line hover:border-teal/50 hover:bg-sand/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="space-y-2">
                    {uploadedFile.isImage && uploadedFile.previewUrl ? (
                      <div className="mx-auto size-20 rounded-xl overflow-hidden border border-line shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadedFile.previewUrl}
                          alt="Uploaded document thumbnail"
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-4xl block">📑</span>
                    )}
                    <p className="font-semibold text-xs text-ink truncate max-w-xs mx-auto">
                      {uploadedFile.name}
                    </p>
                    <p className="text-[11px] text-muted">
                      {uploadedFile.sizeKb} KB · Ready for Multimodal Vision
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-xs text-coral hover:underline font-medium pt-1"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-3">
                    <span className="text-3xl block">📤</span>
                    <p className="font-semibold text-xs text-ink">
                      Click to upload or drag &amp; drop prescription scan
                    </p>
                    <p className="text-[11px] text-muted">
                      Supports high-resolution camera photos, PNG, JPG, or PDF (up to 5 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Optional Doctor Clinical Notes */}
              <div>
                <label htmlFor="upload-notes" className="label text-xs">
                  Additional clinical notes or diagnosis (optional)
                </label>
                <textarea
                  id="upload-notes"
                  rows={2}
                  className="field text-xs resize-none"
                  placeholder="e.g. Doctor recommended total knee replacement; experiencing morning stiffness for 2 years."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Freeform Medical Text Input */}
          {tab === "text" && (
            <div className="space-y-2">
              <label htmlFor="clinical-text" className="label text-xs">
                Clinical report findings, EHR summary, or doctor prescription
              </label>
              <textarea
                id="clinical-text"
                rows={6}
                className="field text-xs font-mono resize-y"
                placeholder="Paste consultation report, MRI/CT summary, lab values (HbA1c, BP, BMI), or diagnosis..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}

          {/* File/API Error Alerts */}
          {fileError && (
            <div className="p-3 rounded-xl bg-blush border border-coral/30 text-xs text-coral font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{fileError}</span>
            </div>
          )}
          {apiError && (
            <div className="p-3 rounded-xl bg-blush border border-coral/30 text-xs text-coral font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          {/* Privacy scrubber notice */}
          {privacyAudit && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <span className="text-emerald-600 text-base">🛡️</span>
              <div>
                <p className="font-semibold">Client-Side De-identification Active</p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                  {privacyAudit.redactedCount} direct personal identifiers (names, dates, contact records) were scrubbed
                  locally in your browser before server communication.
                </p>
              </div>
            </div>
          )}

          {/* Clinical case picker */}
          <div className="pt-2 border-t border-line">
            <span className="text-[11px] text-muted block mb-1.5">Or load a pre-seeded clinical case:</span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_REPORTS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => loadSample(s.text)}
                  className="rounded-lg border border-line bg-sand/30 hover:bg-sand/60 px-2.5 py-1 text-xs text-ink hover:text-teal hover:border-teal/40 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => runAnalysis()}
            disabled={isAnalyzing || (tab === "upload" && !uploadedFile && !notes.trim()) || (tab === "text" && !text.trim())}
            className="btn btn-primary w-full disabled:opacity-40 flex items-center justify-center gap-2 font-semibold !py-3 text-sm shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Analysing with Gemini AI...</span>
              </>
            ) : (
              <span>Analyse prescription &amp; calibrate risk ✨</span>
            )}
          </button>

          <Disclaimer>
            Informational clinical decision support. Zero data is sold or stored without explicit authorization.
          </Disclaimer>
        </section>

        {/* Right Column: Interactive Processing & Synthesis Card */}
        <section className="card p-5 sm:p-6 self-start min-h-80" aria-live="polite">
          {/* State 1: Active Analyzing Workflow */}
          {isAnalyzing ? (
            <div className="py-8 space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-block p-3 rounded-full bg-teal/10 text-teal text-2xl animate-pulse">
                  🩺
                </span>
                <p className="font-display text-xl text-ink">Analyzing Clinical Document</p>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Gemini multimodal AI is reading your prescription scan and evaluating surgical parameters...
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 max-w-md mx-auto pt-2">
                {[
                  { title: "Client-side de-identification", desc: "Scrubbing direct identifiers in-browser" },
                  { title: "Multimodal prescription scan", desc: "Reading doctor notes, diagnosis & medications" },
                  { title: "Clinical biomarker extraction", desc: "Extracting HbA1c, BMI & surgical risk parameters" },
                  { title: "Risk calibration & matching", desc: "Computing travel recovery days & hospital fits" },
                ].map((step, idx) => {
                  const isDone = analysisStep > idx;
                  const isCurrent = analysisStep === idx;
                  return (
                    <div
                      key={step.title}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-teal/10 border-teal/40 scale-[1.01]"
                          : isDone
                          ? "bg-sand/30 border-line opacity-90"
                          : "border-line/40 opacity-40"
                      }`}
                    >
                      <span className="size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-white border border-line">
                        {isDone ? "✓" : isCurrent ? "⏳" : idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-xs text-ink">{step.title}</p>
                        <p className="text-[11px] text-muted">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : analysis ? (
            /* State 2: Completed Clinical Synthesis View */
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <h2 className="font-semibold text-ink text-base">Calibrated Clinical Synthesis</h2>
                </div>
                {aiPowered && (
                  <span className="text-[11px] bg-teal/10 text-teal font-semibold px-2.5 py-0.5 rounded-full border border-teal/20">
                    Gemini Vision 2.5
                  </span>
                )}
              </div>

              {/* 3-Sentence Executive Summary */}
              {summary3 && (
                <div className="p-3.5 rounded-xl bg-sand/30 border border-line text-xs text-ink leading-relaxed">
                  <span className="font-bold text-teal block mb-1 uppercase tracking-wider text-[10px]">
                    Clinical Summary
                  </span>
                  {summary3}
                </div>
              )}

              {/* Biomarkers & Risk Factor Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-line">
                  <span className="text-[10px] text-muted uppercase font-semibold block">HbA1c</span>
                  <p className="font-bold text-sm text-ink num mt-0.5">
                    {biomarkers.hba1c ? biomarkers.hba1c : "Not specified"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-line">
                  <span className="text-[10px] text-muted uppercase font-semibold block">BMI</span>
                  <p className="font-bold text-sm text-ink num mt-0.5">
                    {biomarkers.bmi ? biomarkers.bmi : "Not specified"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-line">
                  <span className="text-[10px] text-muted uppercase font-semibold block">Age</span>
                  <p className="font-bold text-sm text-ink num mt-0.5">
                    {analysis.age ? `${analysis.age} yrs` : "Adult"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-line">
                  <span className="text-[10px] text-muted uppercase font-semibold block">Risk Multiplier</span>
                  <p className="font-bold text-sm text-coral num mt-0.5">
                    {analysis.riskMultiplier.toFixed(2)}×
                  </p>
                </div>
              </div>

              {/* Detected Procedure Highlight Banner */}
              {treatment && (
                <div className="p-4 rounded-xl bg-mint/40 border border-teal/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-teal uppercase font-bold tracking-wider">
                      Identified Procedure
                    </span>
                    <p className="font-display text-lg text-ink font-semibold">
                      {treatment.name}
                    </p>
                    <p className="text-xs text-muted">
                      Specialty: {treatment.specialty} · Earliest safe flight: Day {treatment.fitToFlyDay}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOverridePicker(!showOverridePicker)}
                    className="btn btn-ghost !py-1.5 !px-3 text-xs border border-teal/40 bg-white"
                  >
                    {showOverridePicker ? "Close" : "Change procedure ▾"}
                  </button>
                </div>
              )}

              {/* Procedure Override Dropdown if toggled */}
              {showOverridePicker && (
                <div className="p-3.5 rounded-xl bg-white border border-line space-y-2">
                  <p className="text-xs font-semibold text-ink">Select procedure override:</p>
                  <select
                    className="field text-xs"
                    value={activeTreatmentId || ""}
                    onChange={(e) => {
                      setOverride(e.target.value as TreatmentId);
                      setShowOverridePicker(false);
                    }}
                  >
                    {TREATMENTS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Patient Preparation Questions */}
              {patientQuestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-line">
                  <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <span>💡</span> Questions to ask your surgeon during tele-consultation:
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted pl-1">
                    {patientQuestions.map((qText, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal font-bold shrink-0">•</span>
                        <span>{qText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* State 3: Idle Educational State */
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <span className="text-base">✨</span>
                <h2 className="font-semibold text-ink text-base">Multimodal Clinical Parser</h2>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Upload a prescription photo or hospital referral letter. Our clinical multimodal model
                identifies your indicated surgical procedure, extracts risk-relevant biomarkers, and customizes
                post-operative flight gates.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">1. Surgical Procedure Identification</p>
                  <p className="text-muted mt-0.5">Detects the recommended procedure and surgical specialty from handwritten notes or clinical diagnosis.</p>
                </div>
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">2. Biomarker Extraction (HbA1c &amp; BMI)</p>
                  <p className="text-muted mt-0.5">Flags metabolic and clinical parameters that impact wound healing, infection risk, and safe flight clearance.</p>
                </div>
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">3. Transparent Fit Scoring</p>
                  <p className="text-muted mt-0.5">Ranks verified hospital partners according to clinical complication history, all-in costs, and travel ease.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Hospital Matches & Explorer Section */}
      <div id="hospital-matches" className="mx-auto max-w-6xl px-4 sm:px-6 mt-12 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Sidebar: Controls & Personalization */}
        <aside className="card p-5 self-start lg:sticky lg:top-20 space-y-4">
          <div>
            <p className="eyebrow">Personalized Ranking</p>
            <p className="mt-1 text-xs text-muted">Adjust weights to reflect what matters most to your journey.</p>
          </div>

          <div className="space-y-3.5 pt-1">
            {(Object.keys(weights) as (keyof Weights)[]).map((k) => (
              <div key={k}>
                <div className="flex justify-between text-sm">
                  <label htmlFor={`w-${k}`} className="font-semibold text-xs text-ink">{WEIGHT_LABELS[k][0]}</label>
                  <span className="num text-muted text-xs">{Math.round((weights[k] / wsum) * 100)}%</span>
                </div>
                <input
                  id={`w-${k}`}
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={weights[k]}
                  onChange={(e) => setWeights({ ...weights, [k]: +e.target.value })}
                  className="w-full accent-teal"
                />
                <p className="text-[11px] text-muted">{WEIGHT_LABELS[k][1]}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 pt-3 border-t border-line">
            <div>
              <label className="label" htmlFor="home-country">Travelling from ({Object.keys(HOMES).length} countries)</label>
              <select id="home-country" className="field text-xs" value={home} onChange={(e) => setHome(e.target.value as HomeId)}>
                {Object.values(HOMES).map((h) => (
                  <option key={h.id} value={h.id}>{h.flag} {h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="treatment-select">Procedure ({TREATMENTS.length} seeded)</label>
                <button
                  type="button"
                  onClick={() => setOverride("browse")}
                  className="text-[11px] text-teal font-semibold hover:underline"
                >
                  Browse all 20 ⊞
                </button>
              </div>
              <select
                id="treatment-select"
                className="field text-xs"
                value={isBrowsing ? "browse" : (activeTreatmentId || "")}
                onChange={(e) => {
                  if (e.target.value === "browse") {
                    setOverride("browse");
                  } else {
                    setOverride(e.target.value as TreatmentId);
                  }
                }}
              >
                <option value="browse">🔍 Browse all 20 procedures &amp; corridors...</option>
                {TREATMENTS.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={companion}
                onChange={(e) => setCompanion(e.target.checked)}
                className="size-4 accent-teal rounded-sm"
              />
              Travelling with a companion
            </label>
          </div>

          {/* Quick Info Box */}
          <div className="pt-3 border-t border-line space-y-2 text-xs text-muted">
            <div className="flex items-center justify-between">
              <span>Home waitlist:</span>
              <span className="font-semibold text-ink num">~{homeData.waitWeeks} weeks</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Selected for comparison:</span>
              <span className="font-semibold text-teal num">{selectedForCompare.length} / 3</span>
            </div>
            {selectedForCompare.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="btn btn-primary w-full !py-2 text-xs font-semibold shadow-xs"
              >
                Open Side-by-Side Comparison &rarr;
              </button>
            )}
          </div>
        </aside>

        {/* Right Main Content Area */}
        <section className="space-y-6">
          {/* Top Header & Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">
                {isBrowsing
                  ? "Explore Procedures & Top Medical Corridors"
                  : `${matches.length} accredited hospitals for ${treatment?.short.toLowerCase()}`}
              </h2>
              <p className="text-xs text-muted mt-1">
                {isBrowsing
                  ? "Select a surgical specialty or click any procedure card below to view ranked hospital matches and pricing."
                  : analysis
                  ? `Ranked with your personalized risk adjustment (${risk.toFixed(2)}×), real return flight costs from ${homeData.name}, and audited clinical tier.`
                  : `Ranked by baseline clinical outcomes, total all-in trip costs from ${homeData.name}, and verified hospital accreditation.`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setOverride(isBrowsing ? (activeTreatmentId || "knee") : "browse")}
                className="btn btn-ghost !py-1.5 !px-3 text-xs border border-line bg-white"
              >
                {isBrowsing ? "← Return to Hospital Matches" : "⊞ Explore All 20 Procedures"}
              </button>
            </div>
          </div>

          {/* Quick Procedure Switcher Pills (When in Match Mode) */}
          {!isBrowsing && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setOverride("browse")}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 bg-sand/60 hover:bg-sand text-ink border border-line"
              >
                🔍 Browse All (20)
              </button>
              {TREATMENTS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOverride(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    activeTreatmentId === t.id
                      ? "bg-teal text-white font-semibold shadow-xs"
                      : "bg-white border border-line text-muted hover:text-ink hover:border-teal/40"
                  }`}
                >
                  {t.short}
                </button>
              ))}
            </div>
          )}

          {/* VIEW MODE A: BROWSING PROCEDURE EXPLORER (Solves the empty void screenshot!) */}
          {isBrowsing ? (
            <div className="space-y-8">
              {/* Search & Specialty Filter Controls */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={procedureSearch}
                    onChange={(e) => setProcedureSearch(e.target.value)}
                    placeholder="Search 20 surgical procedures (e.g. knee, lasik, bypass, bariatric, implants, shoulder)..."
                    className="field !py-3 !pl-10 !pr-4 text-xs w-full shadow-xs"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
                  {procedureSearch && (
                    <button
                      type="button"
                      onClick={() => setProcedureSearch("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Specialty category filter chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {SPECIALTY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedSpecialty(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                        selectedSpecialty === cat.id
                          ? "bg-ink text-white font-semibold shadow-xs"
                          : "bg-white border border-line text-muted hover:text-ink hover:border-teal/40"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 20 Procedure Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredProcedures.map((proc) => {
                  const offeringHospitals = matchHospitals(proc, homeData, weights, { companion, riskMultiplier: 1.0 });
                  const bestPrice = offeringHospitals.length > 0 ? offeringHospitals[0].cost.total : 0;
                  const maxSaving = offeringHospitals.length > 0 ? Math.max(0, offeringHospitals[0].cost.saving) : 0;

                  return (
                    <div
                      key={proc.id}
                      className="card p-5 hover:border-teal/50 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-mint text-deep">
                            {proc.specialty}
                          </span>
                          <span className="text-[11px] text-muted">
                            {offeringHospitals.length} accredited hospitals
                          </span>
                        </div>

                        <div>
                          <h3 className="font-display text-lg text-ink font-semibold group-hover:text-teal transition-colors">
                            {proc.name}
                          </h3>
                          <p className="text-xs text-muted mt-1 leading-snug">
                            {proc.fitToFlyWhy}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-muted">
                          <div className="bg-sand/30 p-2 rounded-lg">
                            <span className="block text-[10px] uppercase font-bold text-muted">Hospital</span>
                            <span className="font-semibold text-ink num">{proc.hospitalDays} nights</span>
                          </div>
                          <div className="bg-sand/30 p-2 rounded-lg">
                            <span className="block text-[10px] uppercase font-bold text-muted">Recovery</span>
                            <span className="font-semibold text-ink num">{proc.localRecoveryDays} days</span>
                          </div>
                          <div className="bg-sand/30 p-2 rounded-lg">
                            <span className="block text-[10px] uppercase font-bold text-muted">Fit to Fly</span>
                            <span className="font-semibold text-ink num">Day {proc.fitToFlyDay}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] text-muted block">All-in trip from:</span>
                          <span className="font-bold text-base num text-ink">{usd(bestPrice)}</span>
                          {maxSaving > 0 && (
                            <span className="text-[11px] text-emerald-700 font-semibold block">
                              Saves up to {usd(maxSaving)} vs home
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setOverride(proc.id)}
                          className="btn btn-primary !py-2 !px-4 text-xs font-semibold shadow-xs"
                        >
                          View Hospitals &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Popular Medical Corridors Showcase */}
              <div className="space-y-4 pt-6 border-t border-line">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl text-ink">Popular International Care Corridors</h3>
                    <p className="text-xs text-muted">High-volume medical routes with established flight connections and consular visa agreements.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {POPULAR_CORRIDORS.map((corridor, idx) => (
                    <div
                      key={idx}
                      className="card p-4 hover:border-teal/40 transition-all flex flex-col justify-between bg-white"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink flex items-center gap-1.5">
                            <span>{corridor.fromFlag}</span>
                            <span>{corridor.from}</span>
                            <span className="text-muted">✈️</span>
                            <span>{corridor.toFlag}</span>
                            <span>{corridor.to}</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Saves {corridor.savings}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-ink">{corridor.title}</h4>
                        <p className="text-[11px] text-muted">{corridor.highlight}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-line flex items-center justify-between">
                        <span className="text-xs font-bold text-ink num">{corridor.packagePrice}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setHome(corridor.from);
                            setOverride(corridor.procedureId);
                          }}
                          className="text-xs text-teal font-semibold hover:underline"
                        >
                          Select Corridor &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* VIEW MODE B: MATCHED HOSPITALS LIST */
            matches.length === 0 ? (
              <div className="card p-8 text-center space-y-3">
                <p className="font-display text-xl text-ink">No hospitals currently listed for this corridor</p>
                <p className="text-xs text-muted max-w-md mx-auto">
                  No partner hospitals currently provide {treatment?.name} under the selected origin or filters.
                </p>
                <button
                  type="button"
                  onClick={() => setOverride("browse")}
                  className="btn btn-primary text-xs"
                >
                  Browse all 20 procedures
                </button>
              </div>
            ) : (
              <ol className="space-y-4">
                {matches.map((m, i) => {
                  const isCompared = selectedForCompare.includes(m.hospital.id);
                  return (
                    <li key={m.hospital.id} className={`card p-5 ${i === 0 ? "ring-2 ring-teal" : ""}`}>
                      <div className="flex flex-wrap items-start gap-4">
                        <HospitalMark h={m.hospital} />
                        <div className="flex-1 min-w-52">
                          <div className="flex flex-wrap items-center gap-2">
                            {i === 0 && (
                              <span className="rounded-full bg-teal text-white px-2 py-0.5 text-[11px] font-bold">
                                Best fit
                              </span>
                            )}
                            <Link href={`/hospitals/${m.hospital.id}`} className="font-semibold hover:text-teal text-base">
                              {m.hospital.name}
                            </Link>
                            <TierBadge tier={m.hospital.tier} />
                            {m.hospital.accreditations.map((acc) => (
                              <span key={acc} className="text-[10px] font-bold bg-sand/60 px-2 py-0.5 rounded-md text-ink">
                                🎖️ {acc}
                              </span>
                            ))}
                          </div>
                          <Place h={m.hospital} />
                        </div>

                        {/* Fit Score & Compare Toggle Button */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleCompare(m.hospital.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isCompared
                                ? "bg-teal text-white border-teal shadow-xs"
                                : "bg-white hover:bg-sand/40 border-line text-ink"
                            }`}
                          >
                            <span>{isCompared ? "✓" : "+"}</span>
                            <span>{isCompared ? "Compared" : "Compare"}</span>
                          </button>

                          <div className="text-right">
                            <p className="font-display text-3xl num leading-none text-ink">{Math.round(m.score)}</p>
                            <p className="text-[11px] text-muted">fit score / 100</p>
                          </div>
                        </div>
                      </div>

                      {/* Component Parts Progress Bars */}
                      <div className="mt-4 grid gap-x-5 gap-y-2 sm:grid-cols-4">
                        {(Object.keys(m.parts) as (keyof Weights)[]).map((k) => (
                          <div key={k}>
                            <div className="flex justify-between text-[11px] text-muted">
                              <span>{WEIGHT_LABELS[k][0]}</span>
                              <span className="num font-semibold">{Math.round(m.parts[k])}</span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-sand overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${m.parts[k]}%`, background: PART_COLORS[k] }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reasons and Trade-offs list */}
                      <ul className="mt-4 space-y-1 text-xs">
                        {m.reasons.map((r) => (
                          <li key={r} className={`flex gap-2 ${r.startsWith("Trade-off") ? "text-coral font-medium" : "text-muted"}`}>
                            <span aria-hidden>{r.startsWith("Trade-off") ? "△" : "✓"}</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Footer with Cost and Gap Feature CTAs (Video Booking & Visa Pack) */}
                      <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm">
                          <span className="text-muted">Total trip cost</span>{" "}
                          <b className="num text-base font-bold text-ink">{usd(m.cost.total)}</b>{" "}
                          <span className="text-muted text-xs">
                            · {m.cost.saving >= 0 ? `saves ${usd(m.cost.saving)} vs ${home}` : `${usd(-m.cost.saving)} above ${home}`}
                          </span>
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {/* Gap 1: Video Consult Button */}
                          <button
                            type="button"
                            onClick={() => setVideoModalHospital(m.hospital)}
                            className="btn btn-ghost !py-1.5 !px-3 text-xs border border-line bg-white hover:border-teal/50 flex items-center gap-1.5 font-medium"
                          >
                            <span>🎥</span>
                            <span>Video consult</span>
                          </button>

                          {/* Gap 5: Official Visa Letter & Quote Button */}
                          <button
                            type="button"
                            onClick={() => setVisaModalData({ hospital: m.hospital, match: m })}
                            className="btn btn-ghost !py-1.5 !px-3 text-xs border border-line bg-white hover:border-teal/50 flex items-center gap-1.5 font-medium"
                          >
                            <span>📄</span>
                            <span>Visa pack &amp; quote</span>
                          </button>

                          <Link
                            href={`/hospitals/${m.hospital.id}#quote`}
                            className="btn btn-primary !py-1.5 !px-3 text-xs"
                          >
                            Request quote
                          </Link>

                          <Link
                            href={`/cost?${q(m.hospital.id)}`}
                            className="btn btn-ghost !py-1.5 !px-3 text-xs border border-line"
                          >
                            Cost breakdown
                          </Link>

                          <Link
                            href={`/journey?${q(m.hospital.id)}`}
                            className="btn btn-ghost !py-1.5 !px-3 text-xs border border-line"
                          >
                            Safe-to-fly
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )
          )}
        </section>
      </div>

      {/* FLOATING COMPARISON DOCK (When 1+ hospitals selected) */}
      {selectedForCompare.length > 0 && (
        <aside
          aria-label="Hospital comparison dock"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-ink/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-2xl w-[94vw] border border-white/10 animate-fade-in"
        >
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs font-bold text-mint uppercase tracking-wider shrink-0">
              Comparing ({selectedForCompare.length}/3):
            </span>
            {selectedForCompare.map((hId) => {
              const h = hospitalById(hId);
              return (
                <span
                  key={hId}
                  className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs text-white shrink-0"
                >
                  <span className="truncate max-w-28">{h?.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(hId)}
                    className="text-white/60 hover:text-white font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="btn btn-primary !py-2 !px-4 text-xs font-bold shadow-md whitespace-nowrap"
            >
              Compare side-by-side &rarr;
            </button>
            <button
              type="button"
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-white/60 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        </aside>
      )}

      {/* MODAL 1: SIDE-BY-SIDE HOSPITAL COMPARISON MATRIX (Gap 3) */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="eyebrow">Multi-Clinic Proposal Analysis</span>
                <h3 className="font-display text-2xl text-ink font-semibold mt-1">
                  Side-by-Side Hospital Comparison Matrix
                </h3>
                <p className="text-xs text-muted">
                  Benchmarked for {treatment?.name} departing from {homeData.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="size-8 rounded-full bg-sand/40 hover:bg-sand text-ink text-sm flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className="py-3 px-4 font-semibold text-muted uppercase text-[10px] w-44">Parameters</th>
                    {selectedForCompare.map((hId) => {
                      const h = hospitalById(hId);
                      const m = matches.find((x) => x.hospital.id === hId);
                      return (
                        <th key={hId} className="py-3 px-4 min-w-56 align-top">
                          <div className="flex items-center gap-2">
                            {h && <HospitalMark h={h} size="size-8" />}
                            <div>
                              <p className="font-bold text-sm text-ink">{h?.name}</p>
                              {h && <Place h={h} />}
                            </div>
                          </div>
                          {m && (
                            <div className="mt-2 flex items-center justify-between bg-mint/40 p-2 rounded-lg">
                              <span className="text-[11px] font-bold text-teal">Overall Fit Score</span>
                              <span className="font-display text-lg text-ink font-bold num">{Math.round(m.score)}/100</span>
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {/* Total Cost & Package Inclusions */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-ink">Total Package Cost</td>
                    {selectedForCompare.map((hId) => {
                      const m = matches.find((x) => x.hospital.id === hId);
                      return (
                        <td key={hId} className="py-3 px-4">
                          <p className="font-bold text-base text-ink num">{m ? usd(m.cost.total) : "—"}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            {m && m.cost.saving > 0 ? `Saves ${usd(m.cost.saving)} (${pct(m.cost.saving / (m.cost.homeTotal || 1), 0)})` : "At par with local"}
                          </p>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Hospital Base Price */}
                  <tr className="bg-sand/10">
                    <td className="py-3 px-4 font-medium text-muted">Hospital Procedure Quote</td>
                    {selectedForCompare.map((hId) => {
                      const m = matches.find((x) => x.hospital.id === hId);
                      return (
                        <td key={hId} className="py-3 px-4 num font-semibold text-ink">
                          {m ? usd(m.cost.sticker) : "—"}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Accreditations & Quality Tier */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-ink">Quality Tier &amp; Accreditation</td>
                    {selectedForCompare.map((hId) => {
                      const h = hospitalById(hId);
                      return (
                        <td key={hId} className="py-3 px-4">
                          {h && <TierBadge tier={h.tier} steps={h.stepsPassed} />}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {h?.accreditations.map((acc) => (
                              <span key={acc} className="text-[10px] bg-sand/50 px-1.5 py-0.5 rounded font-medium text-ink">
                                🎖️ {acc}
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Complication Risk Index */}
                  <tr className="bg-sand/10">
                    <td className="py-3 px-4 font-medium text-muted">Audited Complication Multiplier</td>
                    {selectedForCompare.map((hId) => {
                      const h = hospitalById(hId);
                      return (
                        <td key={hId} className="py-3 px-4">
                          <span className="font-bold num text-ink">{h ? `${h.riskIdx.toFixed(2)}×` : "—"}</span>
                          <span className="text-[10px] text-muted ml-1.5">
                            {h && h.riskIdx < 0.85 ? "(Ultra-low audited risk)" : "(Standard baseline)"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Flights & Hours */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-ink">Flight Duration &amp; Return Fare</td>
                    {selectedForCompare.map((hId) => {
                      const h = hospitalById(hId);
                      const fare = h ? homeData.flight[h.country] : 0;
                      const hrs = h ? homeData.hours[h.country] : 0;
                      return (
                        <td key={hId} className="py-3 px-4">
                          <p className="font-semibold text-ink">{hrs} hrs flight · {usd(fare * (companion ? 2 : 1))}</p>
                          <p className="text-[10px] text-muted mt-0.5">Return economy for {companion ? "2 travelers" : "1 patient"}</p>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Recovery Timeline */}
                  <tr className="bg-sand/10">
                    <td className="py-3 px-4 font-medium text-muted">Inpatient &amp; Recovery Stay</td>
                    {selectedForCompare.map((hId) => {
                      return (
                        <td key={hId} className="py-3 px-4 text-xs">
                          <p className="font-medium text-ink">
                            {treatment?.hospitalDays} inpatient nights + {treatment?.localRecoveryDays} local hotel nights
                          </p>
                          <p className="text-[10px] text-muted mt-0.5">Earliest safe flight: Day {treatment?.fitToFlyDay}</p>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Verified Reviews */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-ink">Verified Reviews &amp; Volume</td>
                    {selectedForCompare.map((hId) => {
                      const h = hospitalById(hId);
                      return (
                        <td key={hId} className="py-3 px-4">
                          <p className="font-bold text-ink">★ {h?.rating.toFixed(1)} ({h?.reviews} reviews)</p>
                          <p className="text-[10px] text-muted mt-0.5">~{h?.intlPatients.toLocaleString()} intl patients/year</p>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Lead Specialist Profile */}
                  <tr className="bg-sand/10">
                    <td className="py-3 px-4 font-medium text-muted">Featured Operating Specialist</td>
                    {selectedForCompare.map((hId) => {
                      const docs = doctorsByHospital(hId);
                      const doc = docs[0];
                      return (
                        <td key={hId} className="py-3 px-4">
                          {doc ? (
                            <div>
                              <p className="font-bold text-ink">{doc.name}</p>
                              <p className="text-[11px] text-muted">{doc.title}</p>
                              <p className="text-[10px] text-teal font-semibold mt-0.5">
                                {doc.experienceYears} yrs exp · {doc.surgeriesPerformed.toLocaleString()} cases
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted">Chief Medical Faculty</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Action CTAs */}
                  <tr>
                    <td className="py-4 px-4 font-semibold text-ink">Immediate Actions</td>
                    {selectedForCompare.map((hId) => {
                      const h = hospitalById(hId);
                      const m = matches.find((x) => x.hospital.id === hId);
                      return (
                        <td key={hId} className="py-4 px-4 space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCompareModal(false);
                              if (h) setVideoModalHospital(h);
                            }}
                            className="btn btn-primary w-full !py-1.5 text-xs font-semibold"
                          >
                            Book video consult 🎥
                          </button>
                          {h && m && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowCompareModal(false);
                                setVisaModalData({ hospital: h, match: m });
                              }}
                              className="btn btn-ghost w-full !py-1.5 text-xs border border-line bg-white"
                            >
                              Download visa pack 📄
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="btn btn-ghost !py-2 !px-5 text-xs"
              >
                Close comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIRTUAL TELE-CONSULTATION SCHEDULING (Gap 1) */}
      {videoModalHospital && (
        <VideoConsultModal
          hospital={videoModalHospital}
          treatment={treatment}
          homeData={homeData}
          onClose={() => setVideoModalHospital(null)}
        />
      )}

      {/* MODAL 3: EMBASSY MEDICAL VISA & TREATMENT PROPOSAL GENERATOR (Gap 5) */}
      {visaModalData && (
        <VisaInvitationModal
          hospital={visaModalData.hospital}
          match={visaModalData.match}
          treatment={treatment}
          homeData={homeData}
          companion={companion}
          onClose={() => setVisaModalData(null)}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: Video Consultation Booking Modal (Feature Gap 1)
   ───────────────────────────────────────────────────────────────────────────── */
function VideoConsultModal({
  hospital,
  treatment,
  homeData,
  onClose,
}: {
  hospital: Hospital;
  treatment: Treatment | null;
  homeData: { id: HomeId; name: string; flag: string };
  onClose: () => void;
}) {
  const doctors = doctorsByHospital(hospital.id);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || "");
  const [date, setDate] = useState("2026-12-05");
  const [slot, setSlot] = useState("14:00 London GMT (21:00 Bangkok ICT)");
  const [questions, setQuestions] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  const selectedDoctor: Doctor | undefined = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="card max-w-xl w-full p-6 sm:p-8 space-y-5 bg-white shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎥</span>
            <div>
              <h3 className="font-display text-xl text-ink font-semibold">
                Pre-Travel Specialist Video Consult
              </h3>
              <p className="text-xs text-muted">
                30-min encrypted tele-consultation with {hospital.name} {treatment ? `for ${treatment.name}` : ""}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-sand/40 hover:bg-sand text-ink text-sm flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {isBooked ? (
          <div className="py-6 text-center space-y-4">
            <span className="size-14 rounded-full bg-mint text-deep text-2xl flex items-center justify-center mx-auto">
              ✓
            </span>
            <div>
              <h4 className="font-display text-xl text-ink font-bold">Video Consultation Confirmed!</h4>
              <p className="text-xs text-muted max-w-sm mx-auto mt-1">
                Your appointment with <b>{selectedDoctor?.name}</b> is confirmed for <b>{date}</b> at <b>{slot}</b>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sand/30 border border-line text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-muted">Doctor:</span>
                <span className="font-semibold text-ink">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hospital:</span>
                <span className="font-semibold text-ink">{hospital.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Encrypted Room:</span>
                <span className="font-mono text-teal font-semibold">meet.medtour.global/conf-8924</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">WhatsApp Reminder:</span>
                <span className="font-semibold text-ink">Enabled (24h &amp; 1h prior)</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary !py-2 !px-6 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4 text-xs">
            {/* Doctor Picker */}
            <div>
              <label htmlFor="select-doctor" className="label text-xs font-semibold">
                Select Operating Specialist
              </label>
              {doctors.length > 0 ? (
                <select
                  id="select-doctor"
                  className="field text-xs"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.title} ({d.experienceYears} yrs experience)
                    </option>
                  ))}
                </select>
              ) : (
                <p className="p-2.5 rounded-lg bg-sand/30 text-ink">
                  Chief Surgical Faculty, International Patient Desk
                </p>
              )}
            </div>

            {/* Doctor Highlight */}
            {selectedDoctor && (
              <div className="p-3 rounded-xl bg-mint/30 border border-teal/20 text-xs flex items-center gap-3">
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <p className="font-semibold text-ink">{selectedDoctor.name}</p>
                  <p className="text-[11px] text-muted">{selectedDoctor.education}</p>
                  <p className="text-[10px] text-teal font-semibold">
                    Audited Complication: {(selectedDoctor.auditedComplicationRate * 100).toFixed(1)}% · {selectedDoctor.surgeriesPerformed} procedures
                  </p>
                </div>
              </div>
            )}

            {/* Date & Time Slot Converter */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="consult-date" className="label text-xs font-semibold">Preferred Consultation Date</label>
                <input
                  id="consult-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="field text-xs"
                />
              </div>

              <div>
                <label htmlFor="consult-slot" className="label text-xs font-semibold">
                  Time Slot (Auto-converted to {homeData.flag} {homeData.name})
                </label>
                <select
                  id="consult-slot"
                  className="field text-xs"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                >
                  <option value="10:00 London GMT (17:00 Bangkok ICT)">10:00 AM London (17:00 Local Hospital Time)</option>
                  <option value="14:00 London GMT (21:00 Bangkok ICT)">02:00 PM London (21:00 Local Hospital Time)</option>
                  <option value="17:00 London GMT (00:00 Bangkok ICT)">05:00 PM London (Midnight Local Time)</option>
                </select>
              </div>
            </div>

            {/* Medical Questions for Doctor */}
            <div>
              <label htmlFor="consult-questions" className="label text-xs font-semibold">
                Clinical questions or concerns for the surgeon
              </label>
              <textarea
                id="consult-questions"
                rows={3}
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                placeholder="e.g. Can you review my recent MRI? What type of implants do you recommend for my age and activity level?"
                className="field text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-line">
              <span className="text-[11px] text-muted">
                🛡️ Compliant with HIPAA &amp; Cross-Border Tele-health regulations.
              </span>
              <button
                type="submit"
                className="btn btn-primary !py-2.5 !px-5 text-xs font-semibold shadow-xs"
              >
                Confirm Video Consult &rarr;
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: Official Embassy Medical Visa & Treatment Proposal Generator (Feature Gap 5)
   ───────────────────────────────────────────────────────────────────────────── */
function VisaInvitationModal({
  hospital,
  match,
  treatment,
  homeData,
  companion,
  onClose,
}: {
  hospital: Hospital;
  match: Match;
  treatment: Treatment | null;
  homeData: { id: HomeId; name: string; flag: string };
  companion: boolean;
  onClose: () => void;
}) {
  const [patientName, setPatientName] = useState("Jane Doe");
  const [passportNum, setPassportNum] = useState("GBR98421045");
  const [companionName, setCompanionName] = useState("David Doe");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="card max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 space-y-6 bg-white shadow-2xl">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between border-b border-line pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h3 className="font-display text-lg text-ink font-semibold">
                Official Treatment Proposal &amp; Embassy Visa Pack
              </h3>
              <p className="text-xs text-muted">
                Hospital-issued guarantee letter formatted for medical visa applications.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary !py-1.5 !px-4 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span>🖨️</span>
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full bg-sand/40 hover:bg-sand text-ink text-sm flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="border border-line rounded-2xl p-6 sm:p-8 space-y-6 bg-white text-ink text-xs font-serif leading-relaxed print:border-none print:p-0">
          {/* Hospital Letterhead Header */}
          <div className="flex items-start justify-between border-b-2 border-ink pb-4">
            <div>
              <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
                {hospital.name}
              </h4>
              <p className="text-[11px] text-muted mt-0.5 font-sans">
                {hospital.city}, {COUNTRIES[hospital.country].name} · International Patient Services Desk
              </p>
              <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] font-sans">
                {hospital.accreditations.map((acc) => (
                  <span key={acc} className="font-bold border border-ink/40 px-1.5 py-0.2 rounded">
                    Accredited: {acc}
                  </span>
                ))}
                <span className="font-bold border border-ink/40 px-1.5 py-0.2 rounded">
                  Licence Reg: MOH-{hospital.country}-98214
                </span>
              </div>
            </div>
            <div className="text-right font-sans text-[11px]">
              <p className="font-bold">Document Ref: MT-{hospital.id.toUpperCase()}-2026-V8</p>
              <p className="text-muted">Issue Date: 21 November 2026</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                90-Day Price Lock Valid
              </span>
            </div>
          </div>

          {/* Consular Addressing */}
          <div className="font-sans space-y-1">
            <p className="font-bold text-xs uppercase tracking-wider text-muted">TO: CONSULAR &amp; MEDICAL VISA SECTION</p>
            <p className="text-xs">
              Embassy / High Commission of {COUNTRIES[hospital.country].name} in {homeData.name} ({homeData.flag})
            </p>
          </div>

          {/* Letter Body */}
          <div className="space-y-3 font-sans text-xs">
            <p>
              This official document confirms that <b>{patientName}</b> (Passport No: <b>{passportNum}</b>),
              citizen of {homeData.name}, has been clinically evaluated and accepted for inpatient surgical care at{" "}
              <b>{hospital.name}</b>.
            </p>

            {companion && (
              <p>
                The hospital furthermore confirms that <b>{companionName}</b> is designated as the primary accompanying
                medical caregiver and attendant for the complete duration of the treatment and convalescence.
              </p>
            )}
          </div>

          {/* Treatment & Clinical Protocol */}
          <div className="font-sans border border-line rounded-xl p-4 bg-sand/20 space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wider text-[11px] text-teal">
              Clinical Treatment Protocol
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted block text-[10px] uppercase">Procedure:</span>
                <span className="font-bold text-ink">{treatment?.name}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px] uppercase">Specialty Department:</span>
                <span className="font-bold text-ink">{treatment?.specialty}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px] uppercase">Hospital Inpatient Stay:</span>
                <span className="font-bold text-ink">{treatment?.hospitalDays} nights (Private ICU/Suite)</span>
              </div>
              <div>
                <span className="text-muted block text-[10px] uppercase">Post-Op Local Recovery:</span>
                <span className="font-bold text-ink">{treatment?.localRecoveryDays} days in city</span>
              </div>
              <div>
                <span className="text-muted block text-[10px] uppercase">Fit-to-Fly Clearance:</span>
                <span className="font-bold text-ink">Day {treatment?.fitToFlyDay} post-surgery</span>
              </div>
              <div>
                <span className="text-muted block text-[10px] uppercase">Total Recommended Stay:</span>
                <span className="font-bold text-ink">
                  {(treatment?.hospitalDays || 0) + (treatment?.localRecoveryDays || 0) + 2} days
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Price-Locked Financial Guarantee */}
          <div className="font-sans space-y-2">
            <p className="font-bold uppercase tracking-wider text-[11px] text-teal">
              Itemized Quotation &amp; Escrow Deposit Staging
            </p>
            <table className="w-full text-xs border border-line rounded-lg overflow-hidden">
              <thead className="bg-sand/40 border-b border-line text-left">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 text-right">Coverage / Inclusions</th>
                  <th className="p-2 text-right">Quoted USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="p-2 font-medium">Surgical Procedure Package</td>
                  <td className="p-2 text-right text-muted">Surgeon, anaesthesia, implants, operating theatre</td>
                  <td className="p-2 text-right font-bold num">{usd(match.cost.sticker)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Convalescence Suite (Nights)</td>
                  <td className="p-2 text-right text-muted">Partner recovery hotel with nurse check-ins</td>
                  <td className="p-2 text-right font-bold num">
                    {usd(match.cost.lines.find((l: { key: string; amount: number }) => l.key === "stay")?.amount || 0)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Medical Travel Complication Shield</td>
                  <td className="p-2 text-right text-muted">Emergency extension &amp; secondary surgical buffer</td>
                  <td className="p-2 text-right font-bold num">
                    {usd(match.cost.lines.find((l: { key: string; amount: number }) => l.key === "risk")?.amount || 0)}
                  </td>
                </tr>
                <tr className="bg-sand/30 font-bold">
                  <td className="p-2 font-display text-sm">Total Guaranteed All-In Package</td>
                  <td className="p-2 text-right text-xs text-emerald-800">
                    Saves {usd(match.cost.saving)} vs {homeData.name}
                  </td>
                  <td className="p-2 text-right font-display text-sm num text-ink">{usd(match.cost.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature & Seal Block */}
          <div className="font-sans pt-6 border-t border-line flex justify-between items-end text-xs">
            <div className="space-y-1">
              <div className="h-10 w-32 border-b border-ink/60 flex items-center justify-center font-display italic text-muted">
                Dr. Somchai Prasert
              </div>
              <p className="font-bold text-ink">Medical Director &amp; Head of International Care</p>
              <p className="text-[11px] text-muted">{hospital.name}</p>
            </div>
            <div className="size-20 rounded-full border-2 border-dashed border-teal/40 flex items-center justify-center text-center p-2 text-[9px] text-teal font-bold uppercase tracking-wider">
              Official Clinical Seal
            </div>
          </div>
        </div>

        {/* Input Details Controls (Hidden when printed) */}
        <div className="p-4 rounded-xl bg-sand/30 border border-line space-y-3 text-xs print:hidden">
          <p className="font-bold text-ink">Customize Patient Details on this Letter:</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="modal-patient-name" className="label text-[11px]">Patient Full Name</label>
              <input
                id="modal-patient-name"
                className="field text-xs"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="modal-passport-num" className="label text-[11px]">Passport Number</label>
              <input
                id="modal-passport-num"
                className="field text-xs"
                value={passportNum}
                onChange={(e) => setPassportNum(e.target.value)}
              />
            </div>
            {companion && (
              <div>
                <label htmlFor="modal-companion-name" className="label text-[11px]">Companion / Caregiver Name</label>
                <input
                  id="modal-companion-name"
                  className="field text-xs"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
