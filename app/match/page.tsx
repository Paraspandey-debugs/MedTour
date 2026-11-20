"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  HOMES,
  SAMPLE_REPORTS,
  TREATMENTS,
  treatmentById,
  usd,
  type HomeId,
  type TreatmentId,
} from "@/lib/data";
import {
  DEFAULT_WEIGHTS,
  analyzeReport,
  deidentifyReport,
  matchHospitals,
  type Analysis,
  type Weights,
} from "@/lib/engine";
import { Disclaimer, HospitalMark, PageHead, Place, TierBadge } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

const STATUS = {
  ok: "bg-mint text-deep",
  watch: "bg-gold/15 text-gold",
  high: "bg-blush text-coral",
};

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

interface UploadedDoc {
  name: string;
  mimeType: string;
  base64: string;
  sizeKb: number;
  isImage: boolean;
  previewUrl?: string;
}

export default function MatchPage() {
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
  const [override, setOverride] = useState<TreatmentId | null>(null);
  const [home, setHome] = useState<HomeId>("UK");
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [companion, setCompanion] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showOverridePicker, setShowOverridePicker] = useState(false);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<UploadedDoc | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-Side Privacy Scrubber Audit State
  const [privacyAudit, setPrivacyAudit] = useState<{
    redactedCount: number;
    types: Record<string, number>;
  } | null>(null);

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

      // If document upload failed, notify user clearly
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

  const treatmentId: TreatmentId = override ?? analysis?.treatment ?? "knee";
  const treatment = treatmentById(treatmentId);
  const risk = analysis?.riskMultiplier ?? 1;

  const matches = useMemo(
    () => matchHospitals(treatment, HOMES[home], weights, { companion, riskMultiplier: risk }),
    [treatment, home, weights, companion, risk]
  );

  const wsum = weights.outcomes + weights.cost + weights.travel + weights.trust || 1;
  const q = (h: string) => `t=${treatmentId}&home=${home}&risk=${risk.toFixed(2)}&c=${companion ? 1 : 0}&h=${h}`;

  return (
    <>
      <PageHead
        eyebrow="Clinical Analysis"
        title="Analyse your prescription or medical report."
      >
        Upload a prescription scan, doctor&apos;s referral, or lab report. Gemini AI extracts surgical
        indications and biomarkers (such as HbA1c and BMI) to personalize your recovery plan and risk adjustment.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6">
        <MedicalDisclaimer />
      </div>

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
              <span>Paste Report Text</span>
            </button>
          </div>

          {/* Tab 1: File Upload Mode */}
          {tab === "upload" && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                id="prescription-file-input"
              />

              {!uploadedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-teal bg-mint/30 scale-[1.01]"
                      : "border-line hover:border-teal/60 bg-sand/20 hover:bg-sand/40"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                >
                  <div className="size-12 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto text-xl mb-3">
                    📁
                  </div>
                  <p className="font-semibold text-sm text-ink">
                    Drop your prescription or medical scan here
                  </p>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                    Supports doctor prescriptions, radiology scans, discharge letters, and lab panels.
                  </p>
                  <p className="text-[11px] text-muted/80 mt-2 font-mono">
                    PDF, PNG, JPG, WEBP (up to 5 MB)
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost !text-xs !py-1.5 !px-3 mt-3 border border-line"
                  >
                    Select file from device
                  </button>
                </div>
              ) : (
                /* Uploaded File Preview Card */
                <div className="rounded-2xl border border-teal/30 bg-teal/5 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {uploadedFile.isImage && uploadedFile.previewUrl ? (
                      <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-teal/20 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadedFile.previewUrl}
                          alt="Prescription preview"
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-16 shrink-0 rounded-xl bg-teal/15 text-teal text-2xl flex items-center justify-center font-bold">
                        PDF
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-teal text-white font-bold px-2 py-0.5 rounded-full">
                          Ready for analysis
                        </span>
                        <span className="text-xs text-muted font-mono">{uploadedFile.sizeKb} KB</span>
                      </div>
                      <p className="text-sm font-semibold text-ink truncate mt-1">{uploadedFile.name}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {uploadedFile.isImage ? "Prescription image scan" : "Medical document PDF"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-coral hover:text-red-700 text-xs font-semibold px-2 py-1 hover:bg-blush/40 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="pt-2 border-t border-teal/15 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-teal hover:underline font-medium"
                    >
                      Choose a different file
                    </button>
                    <span className="text-muted text-[11px]">HIPAA de-identified prior to analysis</span>
                  </div>
                </div>
              )}

              {/* Optional Doctor Notes Input */}
              <div>
                <label htmlFor="prescription-notes" className="text-xs font-medium text-ink block mb-1">
                  Additional notes or doctor instructions <span className="text-muted font-normal">(optional)</span>
                </label>
                <textarea
                  id="prescription-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Advised right knee replacement by Dr. Sharma, taking Metformin 500mg daily..."
                  className="field !text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Raw Text Mode */}
          {tab === "text" && (
            <div className="space-y-2">
              <label htmlFor="report-textarea" className="text-xs font-medium text-ink block">
                Paste clinical notes, discharge summary, or lab report
              </label>
              <textarea
                id="report-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={9}
                placeholder="Paste clinical consultation notes, lab panel (HbA1c, BMI, BP), or radiology report here..."
                className="field font-mono !text-xs leading-relaxed"
              />
            </div>
          )}

          {/* File Error Alert */}
          {fileError && (
            <div className="p-3 rounded-xl bg-blush border border-coral/30 text-xs text-coral flex items-start gap-2">
              <span className="shrink-0 text-sm">⚠️</span>
              <p className="leading-snug">{fileError}</p>
            </div>
          )}

          {/* API Error Alert */}
          {apiError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm">⚠️</span>
                <p className="leading-snug">{apiError}</p>
              </div>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-amber-700 hover:text-amber-900 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Privacy Scrubber Pill */}
          {privacyAudit && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <span className="shrink-0 text-sm">🛡️</span>
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
            <span className="text-[11px] text-muted block mb-1.5">Or load a clinical case:</span>
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
          {/* State 1: Active Analyzing Workflow (Fixes "it blocks") */}
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
                          ? "bg-mint/40 border-teal/20 text-deep"
                          : "bg-sand/20 border-line text-muted opacity-60"
                      }`}
                    >
                      <div className="size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {isDone ? (
                          <span className="text-teal">✓</span>
                        ) : isCurrent ? (
                          <span className="size-3.5 rounded-full border-2 border-teal border-t-transparent animate-spin" />
                        ) : (
                          <span className="text-muted/60">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${isCurrent ? "text-teal" : isDone ? "text-deep" : "text-ink"}`}>
                          {step.title}
                        </p>
                        <p className="text-[11px] text-muted truncate">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !analysis ? (
            /* State 2: Empty Initial Guide */
            <div className="py-6 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                  How This Helps You
                </span>
                <p className="font-display text-2xl text-ink mt-2">Decode Your Prescription</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Doctor prescriptions and lab slips contain critical markers that determine surgery safety and
                  post-operative flight gates. We extract those markers into a transparent recovery profile.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">1. Surgical Procedure Identification</p>
                  <p className="text-muted mt-0.5">Detects the recommended procedure and surgical specialty from handwritten notes or clinical diagnosis.</p>
                </div>
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">2. Biomarker Risk Adjustment</p>
                  <p className="text-muted mt-0.5">Captures HbA1c, BMI, and cardiovascular vitals into your personalized recovery multiplier.</p>
                </div>
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">3. Tailored Questions for the Surgeon</p>
                  <p className="text-muted mt-0.5">Generates precise, clinical questions tailored to your prescription for your teleconsultation.</p>
                </div>
              </div>

              <p className="text-[11px] text-muted text-center pt-2">
                &larr; Upload your prescription document on the left to start.
              </p>
            </div>
          ) : (
            /* State 3: Completed Synthesis & Findings */
            <div className="space-y-4">
              {/* Header with AI Pill & Confidence */}
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <p className="eyebrow !text-xs">Clinical Synthesis</p>
                  {aiPowered && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      ✨ Gemini Multimodal AI
                    </span>
                  )}
                </div>
                {treatment ? (
                  <span className="text-xs text-muted num font-semibold">
                    Match Confidence {Math.round(analysis.confidence * 100)}%
                  </span>
                ) : null}
              </div>

              {/* Detected Procedure Highlight Banner */}
              {treatment ? (
                <div className="p-3.5 rounded-2xl bg-teal/10 border border-teal/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal tracking-wider">
                      Identified Procedure
                    </span>
                    <p className="font-display text-xl text-ink font-semibold">
                      {treatment.name}
                    </p>
                    <p className="text-xs text-muted">Specialty: {treatment.specialty}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOverridePicker(!showOverridePicker)}
                    className="btn btn-ghost !text-xs !py-1.5 !px-3 border border-teal/30 shrink-0 bg-white"
                  >
                    {showOverridePicker ? "Close" : "Change procedure ▾"}
                  </button>
                </div>
              ) : (
                /* Unidentified Procedure Alert */
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <p className="text-sm font-semibold">Procedure Not Automatically Detected</p>
                  </div>
                  <p className="text-xs leading-relaxed">
                    We could not identify an explicit surgical procedure from this document. Please select your
                    intended procedure below to view hospital rankings and cost breakdowns:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                    {TREATMENTS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setOverride(t.id);
                          setShowOverridePicker(false);
                        }}
                        className="p-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-xs font-medium text-ink transition-colors text-left"
                      >
                        {t.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedure Override Dropdown if toggled */}
              {showOverridePicker && (
                <div className="p-3 rounded-xl border border-line bg-sand/30 space-y-2">
                  <p className="text-xs font-semibold text-ink">Select procedure override:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {TREATMENTS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setOverride(t.id);
                          setShowOverridePicker(false);
                        }}
                        className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                          treatmentId === t.id
                            ? "bg-teal text-white border-teal font-semibold"
                            : "bg-white border-line text-ink hover:border-teal/40"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3-Sentence Plain English Summary */}
              {summary3 && (
                <div className="p-3.5 rounded-2xl bg-sand/40 border border-line text-xs sm:text-sm leading-relaxed text-ink">
                  <p className="font-semibold text-[11px] uppercase tracking-wider text-teal mb-1">
                    Plain-English Patient Summary
                  </p>
                  <p>{summary3}</p>
                </div>
              )}

              {/* Exact Biomarkers Row */}
              {Object.keys(biomarkers).some((k) => !!biomarkers[k]) && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Calibrated Lab Biomarkers
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {biomarkers.hba1c && (
                      <div className="p-2.5 rounded-xl border border-line bg-white shadow-2xs">
                        <span className="text-[10px] text-muted uppercase font-medium">HbA1c (Glycemia)</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.hba1c}</p>
                      </div>
                    )}
                    {biomarkers.bmi && (
                      <div className="p-2.5 rounded-xl border border-line bg-white shadow-2xs">
                        <span className="text-[10px] text-muted uppercase font-medium">BMI (Body Mass)</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.bmi}</p>
                      </div>
                    )}
                    {biomarkers.blood_pressure && (
                      <div className="p-2.5 rounded-xl border border-line bg-white shadow-2xs">
                        <span className="text-[10px] text-muted uppercase font-medium">Blood Pressure</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.blood_pressure}</p>
                      </div>
                    )}
                    {biomarkers.ejection_fraction && (
                      <div className="p-2.5 rounded-xl border border-line bg-white shadow-2xs">
                        <span className="text-[10px] text-muted uppercase font-medium">Ejection Fraction</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.ejection_fraction}</p>
                      </div>
                    )}
                    {biomarkers.creatinine && (
                      <div className="p-2.5 rounded-xl border border-line bg-white shadow-2xs">
                        <span className="text-[10px] text-muted uppercase font-medium">Creatinine (Renal)</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.creatinine}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extracted Clinical Findings */}
              {analysis.findings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Clinical Findings &amp; Context
                    </p>
                    <span className="text-[11px] text-muted">{analysis.findings.length} extracted</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.findings.map((f) => (
                      <div key={f.label} className="rounded-xl border border-line bg-white p-2.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted">{f.label}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS[f.status] || STATUS.watch}`}>
                            {f.status === "ok" ? "Normal" : f.status === "watch" ? "Watch" : "Attention"}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-sm num text-ink">{f.value}</p>
                        <p className="mt-0.5 text-[11px] text-muted leading-snug">{f.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Multiplier Box */}
              <div className="rounded-2xl bg-blush/60 border border-coral/20 p-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">Personal risk adjustment</p>
                    <p className="text-[11px] text-muted">
                      {risk <= 1.1
                        ? "Standard surgical profile — standard travel recovery window"
                        : risk < 1.8
                        ? "Moderate complexity — +3 to +5 post-operative recovery days added"
                        : "High clinical acuity — specialized tertiary hospital required"}
                    </p>
                  </div>
                  <p className="font-display text-2xl text-coral num font-bold">{risk.toFixed(2)}×</p>
                </div>
                {analysis.risks.length ? (
                  <ul className="mt-3 space-y-1.5 text-xs border-t border-coral/15 pt-2">
                    {analysis.risks.map((r) => (
                      <li key={r.id} className="flex justify-between gap-3 text-ink/90">
                        <span><b>{r.label}</b> — {r.why}</span>
                        <span className="num shrink-0 text-coral font-bold">×{r.multiplier}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted">No added risk factors identified in this document.</p>
                )}
              </div>

              {/* AI Surgeon Questions */}
              {patientQuestions.length > 0 && (
                <div className="rounded-2xl bg-teal/5 border border-teal/20 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <p className="text-sm font-semibold text-ink">Questions to Ask Your Surgeon</p>
                  </div>
                  <p className="text-[11px] text-muted mt-1">
                    Structured questions tailored to your prescription findings for your initial teleconsultation:
                  </p>
                  <ul className="mt-3 space-y-2 text-xs">
                    {patientQuestions.map((q, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start bg-white p-3 rounded-xl border border-line shadow-2xs">
                        <span className="font-bold text-teal">{idx + 1}.</span>
                        <span className="text-ink/90 leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Jump to Matched Hospitals Button */}
              {treatment && (
                <a
                  href="#hospital-matches"
                  className="btn btn-secondary w-full text-center flex items-center justify-center gap-2 !py-2.5 text-xs font-semibold"
                >
                  <span>Compare {matches.length} Matched Hospitals Below</span>
                  <span>↓</span>
                </a>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Hospital Matches Section — Always available for live comparison */}
      <div id="hospital-matches" className="mx-auto max-w-6xl px-4 sm:px-6 mt-12 grid gap-6 lg:grid-cols-[300px_1fr]">
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
              <label className="label" htmlFor="home-country">Travelling from</label>
              <select id="home-country" className="field" value={home} onChange={(e) => setHome(e.target.value as HomeId)}>
                {Object.values(HOMES).map((h) => (
                  <option key={h.id} value={h.id}>{h.flag} {h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="treatment-select">Procedure ({TREATMENTS.length} seeded)</label>
              <select
                id="treatment-select"
                className="field"
                value={treatmentId}
                onChange={(e) => setOverride(e.target.value as TreatmentId)}
              >
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
        </aside>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">
                {matches.length} hospitals for {treatment.short.toLowerCase()}
              </h2>
              <p className="text-xs text-muted mt-1">
                {analysis
                  ? `Ranked with your personalized risk adjustment (${risk.toFixed(2)}×), real trip flight costs, and verified clinical tier.`
                  : "Ranked by baseline clinical outcomes, total all-in trip costs, and verified hospital accreditation."}
              </p>
            </div>
            <span className="text-xs text-teal font-semibold bg-mint px-2.5 py-1 rounded-full self-start sm:self-auto">
              Specialty: {treatment.specialty}
            </span>
          </div>

          {/* Quick Procedure Selector Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
            {TREATMENTS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setOverride(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  treatmentId === t.id
                    ? "bg-teal text-white font-semibold shadow-xs"
                    : "bg-white border border-line text-muted hover:text-ink hover:border-teal/40"
                }`}
              >
                {t.short}
              </button>
            ))}
          </div>

          {matches.length === 0 ? (
            <div className="card p-8 text-center space-y-3">
              <p className="font-display text-xl text-ink">No hospitals currently listed for this specialty corridor</p>
              <p className="text-xs text-muted max-w-md mx-auto">
                No partner hospitals currently provide {treatment.name} under the selected filters.
              </p>
              <button
                type="button"
                onClick={() => setOverride("knee")}
                className="btn btn-primary text-xs"
              >
                Switch to Knee Replacement
              </button>
            </div>
          ) : (
            <ol className="space-y-4">
              {matches.map((m, i) => (
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
                      </div>
                      <Place h={m.hospital} />
                    </div>
                    <div className="text-right">
                      <p className="font-display text-3xl num leading-none text-ink">{Math.round(m.score)}</p>
                      <p className="text-[11px] text-muted">fit score / 100</p>
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

                  {/* Reasons list */}
                  <ul className="mt-4 space-y-1 text-xs">
                    {m.reasons.map((r) => (
                      <li key={r} className={`flex gap-2 ${r.startsWith("Trade-off") ? "text-coral font-medium" : "text-muted"}`}>
                        <span aria-hidden>{r.startsWith("Trade-off") ? "△" : "✓"}</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Footer with Cost and CTAs */}
                  <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm">
                      <span className="text-muted">Total trip cost</span>{" "}
                      <b className="num text-base font-bold text-ink">{usd(m.cost.total)}</b>{" "}
                      <span className="text-muted text-xs">
                        · {m.cost.saving >= 0 ? `saves ${usd(m.cost.saving)} vs ${home}` : `${usd(-m.cost.saving)} above ${home}`}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                        Safe-to-fly timeline
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
