"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHead, Disclaimer } from "@/components/ui";
import { CURRENCIES, formatCurrency, type CurrencyCode } from "@/lib/data";
import { deidentifyReport, generateEscrowContract, type EscrowMilestoneState } from "@/lib/engine";

export default function SecurityPage() {
  // PHI De-identification state
  const [rawText, setRawText] = useState(
    "Patient: Eleanor Vance, DOB: 1962-07-14, Phone: +1 (555) 382-9104, MRN: #89214-NY.\nHistory: Patient presented for evaluation of severe lumbar radiculopathy. MRI reveals L4-L5 disc extrusion with severe canal stenosis.\nAllergies: Penicillin. Contact email: evance62@healthcare.example.com."
  );
  const [deidentified, setDeidentified] = useState(() => deidentifyReport(rawText));

  // Escrow simulator state
  const [packageAmount, setPackageAmount] = useState(12500);
  const [milestones, setMilestones] = useState<EscrowMilestoneState[]>(() =>
    generateEscrowContract(12500)
  );
  const [disputeTriggered, setDisputeTriggered] = useState(false);

  // Multi-currency state
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");

  const runDeidentification = (val: string) => {
    setRawText(val);
    setDeidentified(deidentifyReport(val));
  };

  const handleUpdateAmount = (amt: number) => {
    setPackageAmount(amt);
    setMilestones(generateEscrowContract(amt));
    setDisputeTriggered(false);
  };

  const handleAdvanceMilestone = (index: number) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, status: "released" } : m))
    );
  };

  const handleSimulateDispute = () => {
    setDisputeTriggered(true);
    setMilestones((prev) =>
      prev.map((m, i) => (i === 3 ? { ...m, status: "disputed" } : m))
    );
  };

  const handleResetEscrow = () => {
    setDisputeTriggered(false);
    setMilestones(generateEscrowContract(packageAmount));
  };

  return (
    <>
      <PageHead
        eyebrow="Security &amp; privacy"
        title="How your data is handled, and what is only a simulation"
      >
        This is a demo prototype. Pasted report text is redacted in your browser where possible before it is analysed.
        Uploaded files cannot be redacted and are sent to Google Gemini as they are. Milestone payments are a planned
        feature, shown here as a simulation only. No real money moves.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
        {/* Section 1: Browser-side redaction demo */}
        <section className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="eyebrow">Privacy Architecture</p>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">
                Browser-side redaction demo
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-sand text-muted font-semibold px-3 py-1 rounded-full">
                Best-effort, pattern-based
              </span>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted max-w-3xl">
            Before pasted report text is sent for analysis, a simple pattern-based filter in your browser removes obvious
            identifiers such as phone numbers, emails, dates and record numbers. It can miss things, such as names written in
            free text, and it is not a guarantee of anonymity. The redacted text is then sent to Google Gemini for analysis.
            Do not paste anything you are not comfortable sharing.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <label htmlFor="raw-phi" className="label">
                Your report text (stays in this browser until you analyse it)
              </label>
              <textarea
                id="raw-phi"
                rows={7}
                value={rawText}
                onChange={(e) => runDeidentification(e.target.value)}
                className="field font-mono !text-xs leading-relaxed"
              />
              <p className="mt-2 text-xs text-muted">
                Edit or type names, phone numbers, or MRNs above to watch the client-side redaction update live.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="label !mb-0">Redacted text (what would be sent for analysis)</span>
                <span className="text-xs font-semibold text-coral num">
                  {deidentified.redactedCount} identifiers scrubbed
                </span>
              </div>
              <div className="rounded-xl border border-line bg-sand/30 p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap h-[178px] overflow-y-auto">
                {deidentified.sanitizedText}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
                {Object.entries(deidentified.redactedTypes).map(([type, count]) => (
                  <span key={type} className="bg-white border border-line px-2 py-0.5 rounded">
                    {type}: <b className="text-ink">{count}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Milestone payment simulator (planned feature) */}
        <section className="card p-6 sm:p-8 bg-paper">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="eyebrow">Financial Protection Infrastructure</p>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">
                Milestone payments: simulation only
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="pkg-amt" className="text-xs font-semibold text-muted">
                Package Size:
              </label>
              <select
                id="pkg-amt"
                className="field !w-auto text-xs py-1"
                value={packageAmount}
                onChange={(e) => handleUpdateAmount(+e.target.value)}
              >
                <option value={7500}>$7,500 (Gastric Sleeve)</option>
                <option value={12500}>$12,500 (Knee Replacement)</option>
                <option value={24000}>$24,000 (Cardiac CABG)</option>
              </select>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted max-w-3xl">
            Medical travel often asks patients to pay everything upfront. The idea behind this planned feature is to release
            payment in stages as care is delivered, keeping a <b>15% holdback</b> until a check after you return home.
            <b> It does not exist yet.</b> No escrow account, bank or payment provider is connected, and the numbers below
            are an illustration of how it could work.
          </p>

          {/* Dispute Alert Banner */}
          {disputeTriggered && (
            <div className="mt-5 rounded-2xl bg-coral/15 border border-coral p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-coral animate-ping" />
                <h3 className="font-display text-lg text-coral font-bold">
                  Simulated dispute: holdback paused
                </h3>
              </div>
              <p className="mt-2 text-xs text-ink/80 leading-relaxed">
                The 15% post-return tranche ({formatCurrency(packageAmount * 0.15, selectedCurrency)}) has been
                <b> held back</b> in this simulation. In a real product, a dispute process like this
                would need a licensed escrow provider and independent clinical review. None exists yet.
              </p>
            </div>
          )}

          {/* Milestone Cards */}
          <div className="mt-6 space-y-4">
            {milestones.map((m, idx) => {
              const isPending = m.status === "pending";
              const isReleased = m.status === "released" || m.status === "funded";
              const isDisputed = m.status === "disputed";

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    isDisputed
                      ? "border-coral bg-blush/60"
                      : isReleased
                      ? "border-teal/50 bg-mint/30"
                      : "border-line bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-7 rounded-full text-xs font-bold grid place-items-center ${
                          isDisputed
                            ? "bg-coral text-white"
                            : isReleased
                            ? "bg-teal text-white"
                            : "bg-sand text-muted"
                        }`}
                      >
                        {isReleased ? "✓" : isDisputed ? "!" : idx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">{m.title}</h4>
                        <p className="text-xs text-muted">{m.releaseDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl num">
                        {formatCurrency(m.amountUsd, selectedCurrency)}
                      </p>
                      <span
                        className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isDisputed
                            ? "bg-coral text-white"
                            : isReleased
                            ? "bg-teal text-white"
                            : "bg-sand text-muted"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-line/60 grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-medium text-muted">Trigger Condition:</span>
                      <p className="text-ink mt-0.5">{m.triggerEvent}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted">Verification Evidence:</span>
                      <p className="text-ink mt-0.5">{m.verificationEvidence}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-muted italic">{m.notes}</span>
                    {isPending && idx < 3 && (
                      <button
                        onClick={() => handleAdvanceMilestone(idx)}
                        className="btn btn-ghost !py-1 !px-3 text-xs"
                      >
                        Verify &amp; Release Tranche
                      </button>
                    )}
                    {isPending && idx === 3 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAdvanceMilestone(idx)}
                          className="btn btn-primary !py-1 !px-3 text-xs"
                        >
                          Approve Day-30 Release
                        </button>
                        <button
                          onClick={handleSimulateDispute}
                          className="btn btn-ghost !py-1 !px-3 text-xs !text-coral !border-coral hover:!bg-coral hover:!text-white"
                        >
                          Simulate a dispute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
            <button onClick={handleResetEscrow} className="btn btn-ghost text-xs">
              Reset simulator
            </button>
            <Link href="/journey" className="btn btn-primary text-xs">
              View on Live Clinical Timeline →
            </Link>
          </div>
        </section>

        {/* Section 3: Cross-Border Multi-Currency Gateway */}
        <section className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="eyebrow">Currency view (illustration)</p>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">
                See sample amounts in another currency
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="currency-sel" className="text-xs font-semibold text-muted">
                Currency:
              </label>
              <select
                id="currency-sel"
                className="field !w-auto text-xs py-1"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-sand/20 p-4">
              <p className="text-xs text-muted uppercase font-medium">Procedure amount (sample)</p>
              <p className="font-display text-2xl num mt-1">
                {formatCurrency(packageAmount * 0.97, selectedCurrency)}
              </p>
              <p className="text-[11px] text-muted mt-1">Illustration only. No funds are held.</p>
            </div>
            <div className="rounded-xl border border-line bg-sand/20 p-4">
              <p className="text-xs text-muted uppercase font-medium">Service fee (sample, 3%)</p>
              <p className="font-display text-2xl num mt-1">
                {formatCurrency(Math.min(400, packageAmount * 0.03), selectedCurrency)}
              </p>
              <p className="text-[11px] text-muted mt-1">Capped at $400 USD in this sample model.</p>
            </div>
            <div className="rounded-xl border border-line bg-sand/20 p-4">
              <p className="text-xs text-muted uppercase font-medium">Sample exchange rate</p>
              <p className="font-display text-2xl num mt-1">
                1 USD = {CURRENCIES[selectedCurrency].rateFromUsd} {selectedCurrency}
              </p>
              <p className="text-[11px] text-muted mt-1">Fixed sample rate. Real rates change daily.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-12">
        <Disclaimer>
          Simulation only. MedTour does not hold, move or guarantee any funds. No escrow, custody, currency hedging or
          dispute-resolution service is operating. Amounts and exchange rates are illustrative samples.
        </Disclaimer>
      </div>
    </>
  );
}
