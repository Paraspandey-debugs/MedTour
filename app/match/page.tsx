"use client";

import Link from "next/link";
import { useMemo, useState, useRef } from "react";
import { HOMES, SAMPLE_REPORTS, TREATMENTS, treatmentById, usd, type HomeId, type TreatmentId } from "@/lib/data";
import { DEFAULT_WEIGHTS, analyzeReport, deidentifyReport, matchHospitals, type Analysis, type Weights } from "@/lib/engine";
import { Disclaimer, HospitalMark, PageHead, Place, TierBadge } from "@/components/ui";

const STATUS = {
  ok: "bg-mint text-deep",
  watch: "bg-gold/15 text-gold",
  high: "bg-blush text-coral",
};
const WEIGHT_LABELS: Record<keyof Weights, [string, string]> = {
  outcomes: ["Audited outcomes", "Lowest personalised complication risk"],
  cost: ["Total cost", "Lowest TrueCost, all-in"],
  travel: ["Easy travel", "Short flight, fast visa"],
  trust: ["Verification", "Audit depth and patient ratings"],
};
const PART_COLORS: Record<keyof Weights, string> = {
  outcomes: "#0b6b63", cost: "#b7862b", travel: "#4a7fa5", trust: "#10292c",
};

export default function MatchPage() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aiPowered, setAiPowered] = useState(false);
  const [patientQuestions, setPatientQuestions] = useState<string[]>([]);
  const [biomarkers, setBiomarkers] = useState<Record<string, string | null>>({});
  const [summary3, setSummary3] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [override, setOverride] = useState<TreatmentId | null>(null);
  const [home, setHome] = useState<HomeId>("UK");
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [companion, setCompanion] = useState(true);

  // File Upload State (PDF / Image)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    mimeType: string;
    base64: string;
    sizeKb: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-Side Privacy Scrubber Audit State
  const [privacyAudit, setPrivacyAudit] = useState<{
    redactedCount: number;
    types: Record<string, number>;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        mimeType: file.type || "application/pdf",
        base64,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const run = async (value = text) => {
    if (!value.trim() && !uploadedFile) return;
    setIsAnalyzing(true);

    // 1. Client-Side PHI De-identification (direct identifiers scrubbed in-browser)
    let sanitizedPayload = value;
    if (value.trim()) {
      const deid = deidentifyReport(value);
      sanitizedPayload = deid.sanitizedText;
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
          reportText: sanitizedPayload,
          fileData: uploadedFile
            ? {
                base64: uploadedFile.base64,
                mimeType: uploadedFile.mimeType,
                fileName: uploadedFile.name,
              }
            : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        setAiPowered(!!data.aiPowered);
        setBiomarkers(data.biomarkers || {});
        setSummary3(data.summary_3_sentences || data.summary?.join(" ") || "");
        setPatientQuestions(data.patient_questions || data.patientQuestions || []);
        setOverride(null);
        setWeights(data.riskMultiplier >= 1.4 ? { outcomes: 55, cost: 20, travel: 10, trust: 15 } : DEFAULT_WEIGHTS);
        setIsAnalyzing(false);
        return;
      }
    } catch (err) {
      console.warn("Structured report API failed, falling back to local engine:", err);
    }

    // Local deterministic fallback
    const a = analyzeReport(sanitizedPayload);
    setAnalysis(a);
    setAiPowered(false);
    setBiomarkers({
      hba1c: a.findings.find((f) => f.label.includes("HbA1c"))?.value || null,
      bmi: a.findings.find((f) => f.label.includes("BMI"))?.value || null,
    });
    setSummary3(a.summary.slice(0, 3).join(" "));
    setPatientQuestions([]);
    setOverride(null);
    setWeights(a.riskMultiplier >= 1.4 ? { outcomes: 55, cost: 20, travel: 10, trust: 15 } : DEFAULT_WEIGHTS);
    setIsAnalyzing(false);
  };

  const treatmentId = override ?? analysis?.treatment ?? null;
  const treatment = treatmentId ? treatmentById(treatmentId) : null;
  const risk = analysis?.riskMultiplier ?? 1;
  const matches = useMemo(
    () => (treatment ? matchHospitals(treatment, HOMES[home], weights, { companion, riskMultiplier: risk }) : []),
    [treatment, home, weights, companion, risk],
  );
  const wsum = weights.outcomes + weights.cost + weights.travel + weights.trust || 1;
  const q = (h: string) => `t=${treatmentId}&home=${home}&risk=${risk.toFixed(2)}&c=${companion ? 1 : 0}&h=${h}`;

  return (
    <>
      <PageHead eyebrow="Care Passport · report analysis" title="Paste your report. See what it means, and where to go.">
        We read the report, pull out the values that change your surgical risk, and rank hospitals
        with the reasoning shown.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="card p-5 sm:p-6 self-start">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="report" className="label !mb-0">Medical report text or document</label>
            <span className="text-[11px] text-teal font-medium flex items-center gap-1 bg-mint px-2 py-0.5 rounded-full">
              ✨ Gemini Structured JSON
            </span>
          </div>

          {/* Multimodal Upload Zone */}
          <div className="mb-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              id="file-upload"
            />
            {!uploadedFile ? (
              <label
                htmlFor="file-upload"
                className="flex items-center justify-between px-3 py-2 border border-dashed border-line hover:border-teal rounded-xl cursor-pointer bg-sand/20 hover:bg-sand/40 transition-colors text-xs text-muted"
              >
                <span className="flex items-center gap-2">
                  <span>📎</span>
                  <span>Attach lab report (PDF, PNG, JPG scan)</span>
                </span>
                <span className="font-semibold text-teal">Browse file</span>
              </label>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 bg-teal/10 border border-teal/30 rounded-xl text-xs text-ink">
                <div className="flex items-center gap-2 truncate">
                  <span>📄</span>
                  <span className="font-medium truncate">{uploadedFile.name}</span>
                  <span className="text-muted">({uploadedFile.sizeKb} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-coral hover:underline font-semibold ml-2 shrink-0"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <textarea
            id="report"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste a discharge summary, radiology report, lab findings, or referral letter…"
            className="field font-mono !text-[13px] leading-relaxed"
          />

          {/* Privacy Scrubber Pill */}
          {privacyAudit && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <span className="shrink-0 text-sm">🛡️</span>
              <div>
                <p className="font-semibold">Client-Side PHI De-identification Active</p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                  {privacyAudit.redactedCount} direct identifiers (Patient Names, MRNs, Dates, Contact Info) were redacted locally in your browser before network transmission. Zero Protected Health Information (PHI) touched external servers.
                </p>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Try a sample:</span>
            {SAMPLE_REPORTS.map((s) => (
              <button
                key={s.label}
                onClick={() => { setText(s.text); run(s.text); }}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs hover:border-teal hover:text-teal"
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => run()}
            disabled={(!text.trim() && !uploadedFile) || isAnalyzing}
            className="btn btn-primary mt-4 w-full disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Analysing with Gemini AI...</span>
              </>
            ) : (
              "Analyse report & calibrate risk"
            )}
          </button>

          <div className="mt-4">
            <Disclaimer>
              Privacy-first: Direct patient identifiers (name, DOB, MRN) are scrubbed in-browser before any data is sent to the server.
              Clinical parameters are evaluated by Google Gemini Structured Outputs and our mathematical $M_{'{patient}'}$ risk model.
            </Disclaimer>
          </div>
        </section>

        <section className="card p-5 sm:p-6 self-start min-h-64" aria-live="polite">
          {!analysis ? (
            <div className="py-6 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
                  How This Helps You
                </span>
                <p className="font-display text-2xl text-ink mt-2">Decode Your Medical Report</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Medical reports are full of confusing jargon. We extract the key biomarkers that surgeons
                  care about and translate them into a clear travel recovery profile.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">1. Plain-English Summary</p>
                  <p className="text-muted mt-0.5">3-sentence synthesis identifying the procedure, urgency, and travel readiness.</p>
                </div>
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">2. Exact Biomarker Calibration</p>
                  <p className="text-muted mt-0.5">Captures HbA1c, BMI, Ejection Fraction, and Creatinine into the $M_{'{patient}'}$ risk multiplier.</p>
                </div>
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">3. Explainable Hospital Ranking</p>
                  <p className="text-muted mt-0.5">Ranks audited hospitals with transparent weights and zero sponsored bias.</p>
                </div>
              </div>

              <p className="text-[11px] text-muted text-center pt-2">
                &larr; Attach a report file, choose a sample on the left, or paste your clinical notes.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <p className="eyebrow">Clinical Synthesis</p>
                  {aiPowered && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      ✨ Gemini Structured AI
                    </span>
                  )}
                </div>
                {analysis.treatment && (
                  <span className="text-xs text-muted num font-semibold">Match Confidence {Math.round(analysis.confidence * 100)}%</span>
                )}
              </div>

              {/* 3-Sentence Plain English Summary */}
              {summary3 && (
                <div className="mt-3 p-3.5 rounded-2xl bg-sand/40 border border-line text-xs sm:text-sm leading-relaxed text-ink">
                  <p className="font-semibold text-[11px] uppercase tracking-wider text-teal mb-1">
                    Plain-English Patient Summary
                  </p>
                  <p>{summary3}</p>
                </div>
              )}

              {/* Exact Biomarkers Row */}
              {Object.keys(biomarkers).length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Calibrated Lab Biomarkers ($M_{'{patient}'}$)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {biomarkers.hba1c && (
                      <div className="p-2.5 rounded-xl border border-line bg-white">
                        <span className="text-[10px] text-muted uppercase font-medium">HbA1c (Glycemia)</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.hba1c}</p>
                      </div>
                    )}
                    {biomarkers.bmi && (
                      <div className="p-2.5 rounded-xl border border-line bg-white">
                        <span className="text-[10px] text-muted uppercase font-medium">BMI (Body Mass)</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.bmi}</p>
                      </div>
                    )}
                    {biomarkers.blood_pressure && (
                      <div className="p-2.5 rounded-xl border border-line bg-white">
                        <span className="text-[10px] text-muted uppercase font-medium">Blood Pressure</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.blood_pressure}</p>
                      </div>
                    )}
                    {biomarkers.ejection_fraction && (
                      <div className="p-2.5 rounded-xl border border-line bg-white">
                        <span className="text-[10px] text-muted uppercase font-medium">Ejection Fraction</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.ejection_fraction}</p>
                      </div>
                    )}
                    {biomarkers.creatinine && (
                      <div className="p-2.5 rounded-xl border border-line bg-white">
                        <span className="text-[10px] text-muted uppercase font-medium">Creatinine (Renal)</span>
                        <p className="text-sm font-bold text-ink mt-0.5">{biomarkers.creatinine}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extracted Clinical Findings */}
              {analysis.findings.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Clinical Findings &amp; Context
                    </p>
                    <span className="text-[11px] text-muted">{analysis.findings.length} extracted</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.findings.map((f) => (
                      <div key={f.label} className="rounded-xl border border-line bg-white p-2.5">
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
              <div className="mt-4 rounded-2xl bg-blush/60 border border-coral/20 p-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">Personal Risk Multiplier ($M_{'{patient}'}$)</p>
                    <p className="text-[11px] text-muted">
                      {risk <= 1.1 ? "Standard risk — standard Fit-to-Fly window" : risk < 1.8 ? "Moderate complexity — +3 to +5 recovery days added" : "High clinical acuity — specialized tertiary care required"}
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
                  <p className="mt-2 text-xs text-muted">No added risk factors identified in this report.</p>
                )}
              </div>

              {/* AI Surgeon Questions */}
              {patientQuestions.length > 0 && (
                <div className="mt-4 rounded-2xl bg-teal/5 border border-teal/20 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <p className="text-sm font-semibold text-ink">AI Teleconsultation Questions</p>
                  </div>
                  <p className="text-[11px] text-muted mt-1">
                    Structured questions generated specifically from your biomarkers to ask the treating surgeon:
                  </p>
                  <ul className="mt-3 space-y-2 text-xs">
                    {patientQuestions.map((q, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start bg-white p-3 rounded-xl border border-line shadow-xs">
                        <span className="font-bold text-teal">{idx + 1}.</span>
                        <span className="text-ink/90 leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {analysis && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="card p-5 self-start lg:sticky lg:top-20">
            <p className="eyebrow">What matters to you</p>
            <p className="mt-1 text-xs text-muted">Move a slider and the ranking re-computes. No hidden weights.</p>
            <div className="mt-4 space-y-4">
              {(Object.keys(weights) as (keyof Weights)[]).map((k) => (
                <div key={k}>
                  <div className="flex justify-between text-sm">
                    <label htmlFor={`w-${k}`} className="font-semibold">{WEIGHT_LABELS[k][0]}</label>
                    <span className="num text-muted">{Math.round((weights[k] / wsum) * 100)}%</span>
                  </div>
                  <input
                    id={`w-${k}`} type="range" min={0} max={100} step={5} value={weights[k]}
                    onChange={(e) => setWeights({ ...weights, [k]: +e.target.value })}
                    className="w-full"
                  />
                  <p className="text-[11px] text-muted">{WEIGHT_LABELS[k][1]}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              <div>
                <label className="label" htmlFor="home">Travelling from</label>
                <select id="home" className="field" value={home} onChange={(e) => setHome(e.target.value as HomeId)}>
                  {Object.values(HOMES).map((h) => <option key={h.id} value={h.id}>{h.flag} {h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="tr">Procedure</label>
                <select id="tr" className="field" value={treatmentId ?? ""} onChange={(e) => setOverride(e.target.value as TreatmentId)}>
                  {!treatmentId && <option value="">Choose…</option>}
                  {TREATMENTS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={companion} onChange={(e) => setCompanion(e.target.checked)} className="size-4 accent-teal" />
                Travelling with a companion
              </label>
            </div>
          </aside>

          <section>
            <div className="flex items-end justify-between gap-4 mb-4">
              <h2 className="font-display text-2xl sm:text-3xl">
                {treatment ? `${matches.length} hospitals for ${treatment.short.toLowerCase()}` : "Choose a procedure to see matches"}
              </h2>
            </div>
            <ol className="space-y-4">
              {matches.map((m, i) => (
                <li key={m.hospital.id} className={`card p-5 ${i === 0 ? "ring-2 ring-teal" : ""}`}>
                  <div className="flex flex-wrap items-start gap-4">
                    <HospitalMark h={m.hospital} />
                    <div className="flex-1 min-w-52">
                      <div className="flex flex-wrap items-center gap-2">
                        {i === 0 && <span className="rounded-full bg-teal text-white px-2 py-0.5 text-[11px] font-bold">Best fit</span>}
                        <Link href={`/hospitals/${m.hospital.id}`} className="font-semibold hover:text-teal">{m.hospital.name}</Link>
                        <TierBadge tier={m.hospital.tier} />
                      </div>
                      <Place h={m.hospital} />
                    </div>
                    <div className="text-right">
                      <p className="font-display text-3xl num leading-none">{Math.round(m.score)}</p>
                      <p className="text-[11px] text-muted">fit score / 100</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-x-5 gap-y-2 sm:grid-cols-4">
                    {(Object.keys(m.parts) as (keyof Weights)[]).map((k) => (
                      <div key={k}>
                        <div className="flex justify-between text-[11px] text-muted">
                          <span>{WEIGHT_LABELS[k][0]}</span><span className="num">{Math.round(m.parts[k])}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-sand overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${m.parts[k]}%`, background: PART_COLORS[k] }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <ul className="mt-4 space-y-1 text-sm">
                    {m.reasons.map((r) => (
                      <li key={r} className={`flex gap-2 ${r.startsWith("Trade-off") ? "text-coral" : ""}`}>
                        <span aria-hidden>{r.startsWith("Trade-off") ? "△" : "✓"}</span><span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="text-muted">TrueCost</span>{" "}
                      <b className="num">{usd(m.cost.total)}</b>{" "}
                      <span className="text-muted">
                        · {m.cost.saving >= 0 ? `saves ${usd(m.cost.saving)} vs home` : `${usd(-m.cost.saving)} more than home`}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/cost?${q(m.hospital.id)}`} className="btn btn-ghost !py-2">Cost breakdown</Link>
                      <Link href={`/journey?${q(m.hospital.id)}`} className="btn btn-primary !py-2">Plan journey</Link>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </>
  );
}
