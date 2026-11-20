"use client";

import { useState } from "react";

interface Props {
  hospitalId: string;
  hospitalName: string;
  procedures: { id: string; name: string }[];
  defaultProcedure: string;
  defaultEmail?: string;
}

export default function QuoteForm({
  hospitalId,
  hospitalName,
  procedures,
  defaultProcedure,
  defaultEmail = "",
}: Props) {
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [procedure, setProcedure] = useState(defaultProcedure);
  const [month, setMonth] = useState("");
  const [companion, setCompanion] = useState(true);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patientName || undefined,
          email,
          phone: phone || undefined,
          companion,
          hospitalId,
          procedure,
          preferredMonth: month || undefined,
          message: message || undefined,
          consent,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Something went wrong. Please try again.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="card p-5 sm:p-6" role="status">
        <h2 className="font-display text-2xl text-ink">Quote request submitted</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Thanks {patientName ? <b className="text-ink">{patientName}</b> : "very much"}. Your customized dossier has been sent to the international desk at <b className="text-ink">{hospitalName}</b> and saved to your MedTour account.
        </p>
        <p className="mt-3 text-xs text-muted">
          The chief surgical coordinator will review your request and reply via email or WhatsApp within 24 hours with an itemized, price-locked quote.
        </p>
      </div>
    );
  }

  return (
    <form id="quote" onSubmit={submit} className="card p-5 sm:p-6 scroll-mt-24 space-y-4" noValidate>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-mint px-2 py-0.5 rounded-full">
          Direct Hospital Coordinator Desk
        </span>
        <h2 className="font-display text-2xl mt-1.5">Request a Price-Locked Hospital Quote</h2>
        <p className="mt-0.5 text-xs text-muted">
          Send your clinical request directly to {hospitalName}. Your quote is saved in your account dashboard.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="label !text-xs">Patient Full Name</label>
          <input
            id="q-name"
            type="text"
            placeholder="e.g. Eleanor Vance"
            className="field !text-xs"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="q-email" className="label !text-xs">Email Address *</label>
          <input
            id="q-email"
            type="email"
            required
            autoComplete="email"
            placeholder="e.g. patient@example.com"
            className="field !text-xs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="q-phone" className="label !text-xs">WhatsApp / Mobile <span className="text-muted font-normal">(for instant coordinator quote)</span></label>
          <input
            id="q-phone"
            type="tel"
            placeholder="e.g. +44 7911 123456"
            className="field !text-xs"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="q-proc" className="label !text-xs">Intended Surgical Procedure *</label>
          <select
            id="q-proc"
            className="field !text-xs"
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
          >
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 items-center">
        <div>
          <label htmlFor="q-month" className="label !text-xs">Preferred Travel Month <span className="text-muted font-normal">(optional)</span></label>
          <input
            id="q-month"
            type="month"
            className="field !text-xs"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={companion}
              onChange={(e) => setCompanion(e.target.checked)}
              className="size-4 accent-teal rounded-sm"
            />
            <span>Include Travelling Companion / Attendant Suite</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="q-msg" className="label !text-xs">Medical Background, Scan Findings, or Questions</label>
        <textarea
          id="q-msg"
          rows={3}
          maxLength={3000}
          className="field !text-xs leading-relaxed"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Recommended right knee arthroplasty, taking Metformin for mild diabetes. Looking for robotic surgery options and airport transfer."
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-ink min-h-8">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-teal"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        <span className="leading-snug">
          I agree to MedTour sharing this request with {hospitalName} and have read the{" "}
          <a href="/privacy" className="underline text-tealBrand">privacy policy</a>.
        </span>
      </label>

      {error && <p role="alert" className="text-xs text-coral font-medium">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-primary w-full !py-2.5 text-xs font-semibold"
      >
        {state === "sending" ? "Submitting to Hospital Desk..." : `Request Quote from ${hospitalName}`}
      </button>
    </form>
  );
}
