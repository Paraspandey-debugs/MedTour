"use client";

import { useState } from "react";

interface Props {
  hospitalId: string;
  hospitalName: string;
  procedures: { id: string; name: string }[];
  defaultProcedure: string;
  defaultEmail?: string;
}

export default function QuoteForm({ hospitalId, hospitalName, procedures, defaultProcedure, defaultEmail = "" }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [procedure, setProcedure] = useState(defaultProcedure);
  const [month, setMonth] = useState("");
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
        body: JSON.stringify({ email, hospitalId, procedure, preferredMonth: month || undefined, message: message || undefined, consent }),
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
        <h2 className="font-display text-2xl">Quote request saved</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Thanks. Your request has been sent to <b className="text-ink">{hospitalName}</b> and saved to your MedTour account.
        </p>
        <p className="mt-3 text-sm text-muted">The hospital team will follow up with a written, price-locked quote. You can track the request from your dashboard.</p>
      </div>
    );
  }

  return (
    <form id="quote" onSubmit={submit} className="card p-5 sm:p-6 scroll-mt-24" noValidate>
      <h2 className="font-display text-2xl">Request a quote</h2>
      <p className="mt-1 text-sm text-muted">Send your request to {hospitalName} and keep a copy in your MedTour account.</p>

      <div className="mt-4 grid gap-4">
        <div>
          <label htmlFor="q-email" className="label">Email</label>
          <input id="q-email" type="email" required autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="q-proc" className="label">Procedure</label>
          <select id="q-proc" className="field" value={procedure} onChange={(e) => setProcedure(e.target.value)}>
            {procedures.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="q-month" className="label">Preferred month (optional)</label>
          <input id="q-month" type="month" className="field" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div>
          <label htmlFor="q-msg" className="label">Message (optional)</label>
          <textarea id="q-msg" rows={3} maxLength={2000} className="field" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Anything the hospital should know. Please do not include medical record numbers." />
        </div>
        <label className="flex items-start gap-2.5 text-sm text-ink min-h-11">
          <input type="checkbox" className="mt-1 size-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <span>I agree to MedTour sharing this request with {hospitalName} and have read the <a href="/privacy" className="underline text-tealBrand">privacy policy</a>.</span>
        </label>
        {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
        <button type="submit" className="btn btn-primary min-h-11" disabled={state === "sending" || !consent || !email}>
          {state === "sending" ? "Sending…" : "Request a quote"}
        </button>
      </div>
    </form>
  );
}
