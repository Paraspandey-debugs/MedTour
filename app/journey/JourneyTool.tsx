"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { COUNTRIES, HOSPITALS, TREATMENTS, homeById, hospitalById, offers, treatmentById, usd } from "@/lib/data";
import { buildJourney, trueCost, type Step } from "@/lib/engine";
import { Disclaimer } from "@/components/ui";

const KIND: Record<Step["kind"], { dot: string; label: string }> = {
  prep: { dot: "bg-gold", label: "Prepare" },
  travel: { dot: "bg-[#4a7fa5]", label: "Travel" },
  care: { dot: "bg-teal", label: "Hospital" },
  recover: { dot: "bg-[#8cc4b6]", label: "Recover" },
  gate: { dot: "bg-coral", label: "Clearance" },
  home: { dot: "bg-ink", label: "At home" },
};

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const isoIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function JourneyTool() {
  const sp = useSearchParams();
  const [tid, setTid] = useState(treatmentById(sp.get("t")).id as string);
  const [hid, setHid] = useState(sp.get("h") ?? "");
  const [start, setStart] = useState(() => isoIn(7));
  const [risk, setRisk] = useState(() => Math.min(2.5, Math.max(1, parseFloat(sp.get("risk") ?? "1") || 1)));
  const [stay, setStay] = useState<number | null>(null); // days after procedure; null = earliest safe
  const companion = sp.get("c") !== "0";
  const home = homeById(sp.get("home"));

  const t = treatmentById(tid);
  const options = HOSPITALS.filter((h) => offers(h, t));
  const h = options.find((x) => x.id === hid) ?? hospitalById(options[0].id)!;
  const c = COUNTRIES[h.country];

  const startDate = new Date((start || isoIn(7)) + "T00:00:00");
  const safe = buildJourney(t, h, startDate, risk);
  const gate = safe.earliestFlyHome - safe.procedureDay;
  const j = buildJourney(t, h, startDate, risk, stay ?? undefined);
  const requested = stay ?? gate;
  const cost = trueCost(t, h, home, { companion, riskMultiplier: risk });
  const tranches = j.steps.filter((s) => s.escrow);
  const flyOut = j.steps.find((s) => s.kind === "travel")!;
  const flyHome = j.steps.filter((s) => s.kind === "travel").at(-1)!;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4 self-start lg:sticky lg:top-20">
        <div className="card p-5 space-y-4">
          <div>
            <label className="label" htmlFor="t">Procedure</label>
            <select id="t" className="field" value={tid} onChange={(e) => { setTid(e.target.value); setStay(null); }}>
              {TREATMENTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="h">Hospital</label>
            <select id="h" className="field" value={h.id} onChange={(e) => { setHid(e.target.value); setStay(null); }}>
              {options.map((x) => <option key={x.id} value={x.id}>{COUNTRIES[x.country].flag} {x.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="d">Booking date</label>
            <input id="d" type="date" className="field" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <div className="flex justify-between">
              <label className="label" htmlFor="risk">Personal risk multiplier</label>
              <span className="text-sm font-semibold text-coral num">{risk.toFixed(2)}×</span>
            </div>
            <input id="risk" type="range" min={1} max={2.5} step={0.05} value={risk} onChange={(e) => { setRisk(+e.target.value); setStay(null); }} className="w-full" />
            <p className="text-[11px] text-muted">
              Higher risk adds recovery days before flying{safe.extraDays ? ` (+${safe.extraDays} for you)` : ""}.
            </p>
          </div>
        </div>

        <div className="card p-5">
          <p className="eyebrow">Outcome Escrow</p>
          <p className="mt-1 text-sm text-muted">
            Package <b className="text-ink num">{usd(cost.sticker)}</b>, paid to the hospital only as care is delivered.
          </p>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full">
            {tranches.map((s, i) => (
              <span key={s.day} style={{ width: `${s.escrow!.pct}%`, background: ["#b7862b", "#0b6b63", "#4a9b8f", "#d9552f"][i] }} />
            ))}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {tranches.map((s, i) => (
              <li key={s.day} className="flex items-start justify-between gap-3">
                <span className="flex gap-2">
                  <i className="mt-1.5 size-2 rounded-full shrink-0" style={{ background: ["#b7862b", "#0b6b63", "#4a9b8f", "#d9552f"][i] }} />
                  <span>
                    {s.escrow!.label}
                    <span className="block text-xs text-muted">{fmt(s.date)}</span>
                  </span>
                </span>
                <span className="num font-semibold">{usd((cost.sticker * s.escrow!.pct) / 100)}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Fly out", fmt(flyOut.date), `${home.hours[h.country]}h to ${h.city}`],
            ["Procedure", fmt(j.steps.find((s) => s.day === j.procedureDay && s.kind === "care")!.date), h.name],
            ["Fly home", fmt(flyHome.date), `day ${j.flyHomeDay - j.procedureDay} after surgery`],
            ["Days abroad", flyHome.day - flyOut.day + 1, `visa ready in ${c.visaDays}d`],
          ].map(([l, v, s]) => (
            <div key={l} className="card p-4">
              <dt className="text-xs text-muted">{l}</dt>
              <dd className="font-display text-2xl num mt-1">{v}</dd>
              <dd className="text-xs text-muted truncate">{s}</dd>
            </div>
          ))}
        </dl>

        <div className={`mt-4 rounded-2xl p-5 sm:p-6 border ${j.blocked ? "bg-blush border-coral/40" : "bg-mint border-teal/20"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl sm:text-2xl">
                {j.blocked ? "Return flight blocked for safety" : "Return flight medically cleared"}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {j.blocked ? "Premature air travel carries severe hypoxia and deep-vein thrombosis (DVT) risks" : "Approved by clinical recovery guidelines for this procedure"}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${j.blocked ? "bg-coral text-white" : "bg-teal text-white"}`}>
              Fit-to-Fly gate: Day {gate} post-op
            </span>
          </div>
          <label htmlFor="stay" className="mt-3 block text-sm font-semibold">
            I want to fly home <b className="num text-teal">{requested}</b> day{requested === 1 ? "" : "s"} after the procedure
          </label>
          <input
            id="stay" type="range" min={1} max={gate + 10} value={requested}
            onChange={(e) => setStay(+e.target.value)} className="w-full mt-1"
          />
          <p className="mt-2 text-xs sm:text-sm text-ink/90 leading-relaxed">
            {j.blocked ? (
              <>
                <b className="text-coral">MedTour will not book this flight.</b> Day {requested} is {gate - requested} day{gate - requested === 1 ? "" : "s"} before
                safe clearance. The itinerary automatically holds you at your partner recovery hotel until day {gate}. {t.fitToFlyWhy}
              </>
            ) : (
              <>
                ✓ Day {requested} is safe for long-haul commercial flight. {t.fitToFlyWhy}
                {safe.extraDays > 0 && ` Your personalized risk multiplier added ${safe.extraDays} safety day${safe.extraDays > 1 ? "s" : ""} to standard recovery.`}
              </>
            )}
          </p>
        </div>

        {/* CLINICAL PHASES EXPLAINER */}
        <div className="mt-4 p-4 rounded-2xl bg-surface border border-sand text-xs space-y-2">
          <p className="font-semibold text-ink">Understanding Your 4 Journey Phases:</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-muted">
            <span className="p-2 rounded-lg bg-cream/60 border border-sand"><b>1. Prepare:</b> Medical dossier review &amp; expedited visa.</span>
            <span className="p-2 rounded-lg bg-cream/60 border border-sand"><b>2. Care:</b> Hospital admission &amp; procedure by chief surgeon.</span>
            <span className="p-2 rounded-lg bg-cream/60 border border-sand"><b>3. Recovery:</b> Monitored hotel stay until Fit-to-Fly gate clears.</span>
            <span className="p-2 rounded-lg bg-cream/60 border border-sand"><b>4. Outcome:</b> Day-30 checkup &amp; final escrow release.</span>
          </div>
        </div>

        <ol className="mt-6 relative">
          <span className="absolute left-[7px] top-2 bottom-2 w-px bg-line" aria-hidden />
          {j.steps.map((s) => (
            <li key={`${s.day}-${s.title}`} className="relative pl-8 pb-5 last:pb-0">
              <span className={`absolute left-0 top-1.5 size-[15px] rounded-full ring-4 ring-cream ${KIND[s.kind].dot}`} aria-hidden />
              <div className={`card p-4 ${s.kind === "gate" ? "border-coral/50" : ""}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-xs text-muted num">
                    {fmt(s.date)} · {KIND[s.kind].label}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted">{s.detail}</p>
                {s.escrow && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold num">
                    Escrow · {s.escrow.label} · {s.escrow.pct}% ({usd((cost.sticker * s.escrow.pct) / 100)})
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 card p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">All-in estimate for this journey: <span className="num">{usd(cost.total)}</span></p>
            <p className="text-sm text-muted">{cost.nights} hotel nights{companion ? ", with a companion" : ""}, from {home.name}.</p>
          </div>
          <Link href={`/cost?t=${tid}&h=${h.id}&home=${home.id}&risk=${risk.toFixed(2)}&c=${companion ? 1 : 0}`} className="btn btn-ghost">
            See cost breakdown
          </Link>
        </div>
        <div className="mt-4">
          <Disclaimer>
            Recovery windows are illustrative planning defaults, not clinical guidance. The treating
            surgeon gives the actual clearance to fly.
          </Disclaimer>
        </div>
      </section>
    </div>
  );
}
