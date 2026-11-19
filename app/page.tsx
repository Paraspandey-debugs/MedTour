import Link from "next/link";
import { COUNTRIES, HOMES, HOSPITALS, TREATMENTS, hospitalById, usd } from "@/lib/data";
import { trueCost } from "@/lib/engine";
import { LINE_COLORS } from "@/components/ui";

const IDEAS = [
  {
    tag: "Care Passport",
    href: "/match",
    title: "Your report, read and explained",
    body: "Paste a medical report. We extract the values that matter, flag your personal risk factors in plain language and rank hospitals - showing exactly why each one scored as it did.",
    proof: "Explainable matching, not a black box",
  },
  {
    tag: "TrueCost",
    href: "/cost",
    title: "The price tag plus the price of risk",
    body: "Every quote adds flights, recovery stay, visa, insurance - and a risk reserve: the hospital's audited complication rate, adjusted for you, multiplied by what a complication costs.",
    proof: "The lowest sticker price is not always the lowest bill",
  },
  {
    tag: "Fit-to-Fly",
    href: "/journey",
    title: "An itinerary built around healing",
    body: "Return flights are locked behind a medical clearance gate. Try to leave early and the planner blocks it and tells you why. Your risk factors stretch the window automatically.",
    proof: "Travel planned by recovery, not by fare",
  },
  {
    tag: "Outcome Escrow",
    href: "/security",
    title: "Hospitals are paid as you recover",
    body: "Your money sits in escrow and is released at admission, discharge and - the last 15% - only after your outcome check back home. Hospitals must accept this to reach Platinum.",
    proof: "The hospital's incentive is aligned with yours",
  },
  {
    tag: "24/7 Concierge",
    href: "/coordinator",
    title: "Continuous care across borders",
    body: "Aria clinical AI concierge paired with human coordinator desks, offline mobile companion apps for iOS/Android, and real-time live surgical tracking for family back home.",
    proof: "Never left alone in a foreign healthcare system",
  },
  {
    tag: "Zero-Knowledge Vault",
    href: "/security",
    title: "Client-side privacy protection",
    body: "In-browser redaction scrubs HIPAA 18 identifiers before any data leaves your machine. Transparent multi-currency pricing locks exchange rates for 90 days.",
    proof: "Zero health data leakage, zero FX markups",
  },
];

const STEPS = [
  ["Share a report", "Paste or pick a sample. Nothing leaves your browser in this prototype."],
  ["Compare TrueCost", "See 12 audited hospitals side by side against treatment at home."],
  ["Plan the journey", "Visa, flights, recovery stay and follow-ups on one clinical timeline."],
  ["Pay by milestone", "Escrow releases as care is delivered, with an outcome holdback."],
];

export default function Home() {
  const t = TREATMENTS.find((x) => x.id === "bariatric")!;
  const cheap = hospitalById("anatolia")!;
  const safe = hospitalById("baja")!;
  const o = { companion: true, riskMultiplier: 1.64 };
  const a = trueCost(t, cheap, HOMES.US, o);
  const b = trueCost(t, safe, HOMES.US, o);
  const max = Math.max(a.total, b.total, a.homeTotal);
  const countries = new Set(HOSPITALS.map((h) => h.country)).size;

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-16 grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
        <div>
          <p className="eyebrow">Better Healthcare · Global Access · Healthier Tomorrow</p>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl leading-[1.02] tracking-tight">
            The price of surgery abroad isn&apos;t the <em className="text-coral not-italic">price tag</em>.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-xl">
            MedTour connects you with verified hospitals in {countries} countries - and prices in what
            others leave out: your own medical risk, the days you can&apos;t fly, and what happens if
            something goes wrong.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/match" className="btn btn-primary">Analyse my report</Link>
            <Link href="/cost" className="btn btn-ghost">Compare TrueCost</Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            {[
              [HOSPITALS.length, "audited hospitals"],
              ["6", "verification checks"],
              ["15%", "outcome holdback"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl num">{n}</dt>
                <dd className="text-xs text-muted mt-1">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-6 sm:p-7 shadow-[0_30px_60px_-30px_rgba(16,41,44,.35)]">
          <div className="flex items-center justify-between">
            <p className="eyebrow">TrueCost · live example</p>
            <span className="text-xs text-muted">🇺🇸 → gastric sleeve</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            A 41-year-old with a BMI of 48.8, travelling with a companion. Same operation, two hospitals.
          </p>
          <div className="mt-5 space-y-5">
            {[
              { h: cheap, c: a, note: "Lowest sticker price" },
              { h: safe, c: b, note: "Lowest TrueCost" },
            ].map(({ h, c, note }) => (
              <div key={h.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-sm">
                    {COUNTRIES[h.country].flag} {h.name}
                  </p>
                  <p className="font-display text-xl num">{usd(c.total)}</p>
                </div>
                <div className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-sand">
                  {c.lines.map((l) => (
                    <span key={l.key} style={{ width: `${(l.amount / max) * 100}%`, background: LINE_COLORS[l.key] }} />
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {note} · sticker {usd(c.sticker)} · risk reserve{" "}
                  <span className="text-coral font-semibold">{usd(c.riskReserve)}</span>
                </p>
              </div>
            ))}
            <div>
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-sm">🇺🇸 Private treatment at home</p>
                <p className="font-display text-xl num">{usd(a.homeTotal)}</p>
              </div>
              <div className="mt-1.5 h-3 rounded-full bg-ink/80" style={{ width: `${(a.homeTotal / max) * 100}%` }} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
            <span><i className="inline-block size-2 rounded-full mr-1" style={{ background: LINE_COLORS.procedure }} />Procedure</span>
            <span><i className="inline-block size-2 rounded-full mr-1" style={{ background: LINE_COLORS.stay }} />Travel &amp; stay</span>
            <span><i className="inline-block size-2 rounded-full mr-1" style={{ background: LINE_COLORS.risk }} />Risk reserve</span>
          </div>
        </div>
      </section>

      <section className="bg-deep text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <p className="eyebrow !text-mint">What makes MedTour different</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl max-w-2xl">
            Directories list hospitals. We underwrite the decision.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {IDEAS.map((i, n) => (
              <Link
                key={i.tag}
                href={i.href}
                className="group rounded-2xl border border-white/15 bg-white/5 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-mint text-deep px-2.5 py-0.5 text-xs font-bold">{i.tag}</span>
                  <span className="font-display text-white/30 text-2xl num">0{n + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl">{i.title}</h3>
                <p className="mt-2 text-sm text-white/75">{i.body}</p>
                <p className="mt-4 text-sm font-semibold text-mint">
                  {i.proof} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">From report to recovery, on one thread</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t2, d], i) => (
            <li key={t2} className="card p-5">
              <span className="font-display text-coral text-lg num">{i + 1}</span>
              <p className="mt-2 font-semibold">{t2}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-mint p-8 sm:p-12 grid gap-8 md:grid-cols-[1.3fr_1fr] items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Hospitals, hotels, airlines and insurers</h2>
            <p className="mt-3 text-deep/80 max-w-lg">
              MedTour is a two-sided platform. Providers earn international patients by opening their
              outcome data to audit; travel and insurance partners plug into the journey timeline.
            </p>
          </div>
          <div className="flex md:justify-end gap-3 flex-wrap">
            <Link href="/partners" className="btn btn-primary">See the verification workflow</Link>
            <Link href="/hospitals" className="btn btn-ghost">Browse hospitals &amp; doctors</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16">
        <div className="rounded-3xl border-2 border-coral/30 bg-blush/40 p-8 sm:p-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-widest text-coral font-bold px-3 py-1 rounded-full bg-coral/10">
              Academic Evaluation Hub · Group No. 19
            </span>
            <h3 className="font-display text-2xl sm:text-3xl mt-3 text-ink">
              Defending MedTour&apos;s Unique Innovations
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Designed specifically for university examination: explore mathematical formulas, algorithmic proofs,
              the Nash equilibrium of our 85/15 outcome escrow, and our Professor Q&amp;A Defense Matrix.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/defense" className="btn btn-primary !bg-coral hover:!bg-coral/90 text-white">
              Open Defense Dossier →
            </Link>
            <Link href="/coordinator" className="btn btn-ghost">
              24/7 Concierge &amp; Mobile App
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
