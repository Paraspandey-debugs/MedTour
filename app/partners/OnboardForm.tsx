"use client";

import { useState } from "react";
import { VERIFICATION_STEPS } from "@/lib/data";

export default function OnboardForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState<boolean[]>(VERIFICATION_STEPS.map((_, i) => i < 2));
  const [sent, setSent] = useState(false);

  // Steps are sequential: the tier is set by the first check a hospital cannot yet pass.
  const firstGap = ready.indexOf(false);
  const passed = firstGap === -1 ? ready.length : firstGap;
  const tier = passed === 6 ? "Platinum" : passed === 5 ? "Gold" : passed >= 4 ? "Verified" : null;

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-2xl">Application drafted for {name}</p>
        <p className="mt-2 text-sm text-muted">
          {tier
            ? `On the evidence declared you would list as ${tier}. An auditor would now request documents for each check.`
            : "You would enter the audit queue. Listing begins once four checks are passed."}
        </p>
        <p className="mt-3 text-xs text-muted">Prototype: nothing was submitted or stored.</p>
        <button className="btn btn-ghost mt-4" onClick={() => setSent(false)}>Edit application</button>
      </div>
    );
  }

  return (
    <form
      className="card p-5 sm:p-6"
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
    >
      <h3 className="font-display text-2xl">Check your listing tier</h3>
      <p className="mt-1 text-sm text-muted">Tick what your hospital can evidence today.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="hn">Hospital name</label>
          <input id="hn" required className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="he">International desk email</label>
          <input id="he" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <fieldset className="mt-4 space-y-2">
        <legend className="label">Evidence available</legend>
        {VERIFICATION_STEPS.map((s, i) => (
          <label key={s.key} className="flex items-start gap-2.5 text-sm rounded-lg border border-line bg-white p-2.5">
            <input
              type="checkbox" className="mt-0.5 size-4 accent-teal" checked={ready[i]}
              onChange={(e) => setReady(ready.map((r, n) => (n === i ? e.target.checked : r)))}
            />
            <span>
              <b>{i + 1}. {s.label}</b>
              <span className="block text-xs text-muted">{s.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" aria-live="polite">
          Provisional tier:{" "}
          <b className={tier ? "text-teal" : "text-coral"}>{tier ?? `not listed yet (${passed}/4 required checks in order)`}</b>
        </p>
        <button className="btn btn-primary">Draft application</button>
      </div>
    </form>
  );
}
