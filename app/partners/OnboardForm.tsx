"use client";

import { useState } from "react";
import { VERIFICATION_STEPS } from "@/lib/data";

export default function OnboardForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [specialty, setSpecialty] = useState("Orthopaedics");
  const [ready, setReady] = useState<boolean[]>(VERIFICATION_STEPS.map((_, i) => i < 3));
  const [sent, setSent] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  // Steps are sequential: the tier is set by the first check a hospital does not pass.
  const firstGap = ready.indexOf(false);
  const passed = firstGap === -1 ? ready.length : firstGap;
  const tier = passed === 6 ? "Platinum" : passed === 5 ? "Gold" : passed >= 4 ? "Verified" : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setApplicationId(`MTR-HOSP-${new Date().getFullYear()}-${randomCode}`);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="card p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
              Application Drafted
            </span>
            <p className="font-display text-2xl text-ink mt-1">Application for {name}</p>
          </div>
          <span className="text-xs font-mono bg-sand/40 border border-line px-2.5 py-1 rounded-lg text-muted">
            {applicationId}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-line bg-sand/20 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Provisional Listing Tier:</span>
            <span className={`font-bold ${tier ? "text-teal" : "text-coral"}`}>
              {tier ? `${tier} Tier` : "Audit Queue (Under 4 checks passed)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Primary Specialty:</span>
            <span className="font-semibold text-ink">{specialty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Contact Desk:</span>
            <span className="font-mono text-ink">{email}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink">Verification Checklist Status ({passed}/6 passed):</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {VERIFICATION_STEPS.map((s, i) => (
              <div
                key={s.key}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  ready[i] ? "border-teal/30 bg-mint/20 text-deep" : "border-line bg-sand/10 text-muted"
                }`}
              >
                <span className="truncate pr-2">
                  <b>{i + 1}.</b> {s.label}
                </span>
                <span className="shrink-0 font-semibold">{ready[i] ? "✓ Ready" : "Pending"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-teal/5 border border-teal/20 text-xs text-ink/90 space-y-1">
          <p className="font-semibold text-teal">Next Steps in Commercial Pipeline:</p>
          <p className="text-muted text-[11px] leading-relaxed">
            1. An auditor requests primary source documentation for all declared accreditations.
            <br />
            2. Outcome data (e.g. surgical site infection rate) is cross-referenced with your national health registry.
            <br />
            3. Upon sign-off, your facility is listed on MedTour with zero sponsored bias or pay-to-rank manipulation.
          </p>
        </div>

        <p className="text-[11px] text-muted italic">
          Your application summary is ready. Our partnerships team will review your evidence and follow up with next steps.
        </p>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            className="btn btn-ghost flex-1 text-xs"
            onClick={() => setSent(false)}
          >
            Edit Application
          </button>
          <button
            type="button"
            className="btn btn-primary flex-1 text-xs"
            onClick={() => window.print()}
          >
            Print Draft PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="card p-5 sm:p-6 space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="border-b border-line pb-3">
        <h3 className="font-display text-2xl text-ink">Check Your Listing Tier</h3>
        <p className="text-xs text-muted mt-1">
          Find out which tier your healthcare institution or clinic qualifies for based on auditable clinical criteria.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="hn">Hospital or Clinic Name</label>
          <input
            id="hn"
            required
            placeholder="e.g. Bangkok International Hospital"
            className="field !text-xs"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="he">International Patient Desk Email</label>
          <input
            id="he"
            type="email"
            required
            placeholder="coordinator@hospital.org"
            className="field !text-xs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="hp">Desk Phone / WhatsApp</label>
          <input
            id="hp"
            type="tel"
            placeholder="+66 2 310 3000"
            className="field !text-xs"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="hw">Hospital Website</label>
          <input
            id="hw"
            type="url"
            placeholder="https://www.hospital.org"
            className="field !text-xs"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="hs">Primary Center of Surgical Excellence</label>
        <select
          id="hs"
          className="field !text-xs"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          <option value="Orthopaedics">Orthopaedics (Knee &amp; Hip Arthroplasty)</option>
          <option value="Cardiac">Cardiac Surgery (CABG &amp; Valve Replacements)</option>
          <option value="Spine">Spine Surgery (Endoscopic Fusions &amp; Discectomy)</option>
          <option value="Bariatric">Bariatric &amp; Metabolic Surgery</option>
          <option value="Dental">Full-Arch Dental Reconstruction</option>
        </select>
      </div>

      <fieldset className="space-y-2 pt-1">
        <legend className="label">Verification Evidence Ready to Submit</legend>
        <p className="text-[11px] text-muted -mt-1 mb-2">
          Tick the criteria your hospital can prove with third-party certificates today:
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {VERIFICATION_STEPS.map((s, i) => (
            <label
              key={s.key}
              className="flex items-start gap-2.5 text-xs rounded-xl border border-line bg-white hover:border-teal/40 p-3 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-teal rounded-sm"
                checked={ready[i]}
                onChange={(e) =>
                  setReady(ready.map((r, n) => (n === i ? e.target.checked : r)))
                }
              />
              <span className="flex-1 min-w-0">
                <span className="font-semibold text-ink block">
                  {i + 1}. {s.label}
                </span>
                <span className="block text-[11px] text-muted mt-0.5 leading-snug">
                  {s.detail}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="pt-2 border-t border-line flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs">
          <span className="text-muted">Provisional Tier: </span>
          <b className={`font-semibold ${tier ? "text-teal" : "text-coral"}`}>
            {tier ?? `Audit queue (${passed}/4 minimum checks)`}
          </b>
        </div>
        <button type="submit" className="btn btn-primary !text-xs !py-2 !px-4">
          Draft Onboarding Application →
        </button>
      </div>
    </form>
  );
}
