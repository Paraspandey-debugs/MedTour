"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HOMES, SAMPLE_REPORTS, TREATMENTS, treatmentById, usd, type HomeId, type TreatmentId } from "@/lib/data";
import { DEFAULT_WEIGHTS, analyzeReport, matchHospitals, type Analysis, type Weights } from "@/lib/engine";
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
  const [override, setOverride] = useState<TreatmentId | null>(null);
  const [home, setHome] = useState<HomeId>("UK");
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [companion, setCompanion] = useState(true);

  const run = (value = text) => {
    if (!value.trim()) return;
    const a = analyzeReport(value);
    setAnalysis(a);
    setOverride(null);
    // Explainable default: a riskier patient gets outcomes weighted up automatically.
    setWeights(a.riskMultiplier >= 1.4 ? { outcomes: 55, cost: 20, travel: 10, trust: 15 } : DEFAULT_WEIGHTS);
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
          <label htmlFor="report" className="label">Medical report text</label>
          <textarea
            id="report"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={11}
            placeholder="Paste a discharge summary, radiology report or referral letter…"
            className="field font-mono !text-[13px] leading-relaxed"
          />
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
          <button onClick={() => run()} disabled={!text.trim()} className="btn btn-primary mt-4 w-full disabled:opacity-40">
            Analyse report
          </button>
          <div className="mt-4">
            <Disclaimer>
              Prototype: analysis runs in your browser with a transparent rule-based reader and is
              not a diagnosis. A surgeon confirms every plan before booking.
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
                  <p className="text-muted mt-0.5">Identifies the recommended procedure, affected joints or organs, and urgent findings.</p>
                </div>
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">2. Biomarker Extraction</p>
                  <p className="text-muted mt-0.5">Scans HbA1c, Blood Pressure, BMI, and organ functions to forecast surgical recovery.</p>
                </div>
                <div className="p-3 rounded-xl bg-sand/30 border border-line text-xs">
                  <p className="font-semibold text-ink">3. Explainable Hospital Ranking</p>
                  <p className="text-muted mt-0.5">Ranks verified hospitals with visible score breakdowns and zero hidden sponsorships.</p>
                </div>
              </div>

              <p className="text-[11px] text-muted text-center pt-2">
                &larr; Click any sample report on the left or paste your own to begin.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">Plain-language summary</p>
                {analysis.treatment && (
                  <span className="text-xs text-muted num font-semibold">Match Confidence {Math.round(analysis.confidence * 100)}%</span>
                )}
              </div>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                {analysis.summary.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-teal font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              {analysis.findings.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Extracted Health Markers &amp; Clinical Context
                    </p>
                    <span className="text-[11px] text-muted">{analysis.findings.length} findings</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.findings.map((f) => (
                      <div key={f.label} className="rounded-xl border border-line bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted">{f.label}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS[f.status]}`}>
                            {f.status === "ok" ? "Normal Range" : f.status === "watch" ? "Borderline / Watch" : "Attention Required"}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-sm num text-ink">{f.value}</p>
                        <p className="mt-1 text-[11px] text-muted leading-snug">{f.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-2xl bg-blush/60 border border-coral/20 p-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">Personal Risk Multiplier</p>
                    <p className="text-[11px] text-muted">
                      {risk <= 1.1 ? "Standard clinical risk" : risk < 1.8 ? "Moderate clinical complexity" : "Higher surgical acuity"}
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
                  <p className="mt-2 text-xs text-muted">No added risk factors found in this report.</p>
                )}
              </div>
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
