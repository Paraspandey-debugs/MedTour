import Link from "next/link";
import { HOSPITALS, TREATMENTS, hospitalById, usd } from "@/lib/data";
import { trueCost } from "@/lib/engine";

const INNOVATIONS = [
  {
    step: "01 · Personal Risk",
    title: "Biomarker-Driven Pricing",
    body: "We derive your personal risk multiplier from lab values and price complication reserves directly into hospital rankings.",
    href: "/match",
    tag: "Care Passport",
  },
  {
    step: "02 · Clinical Safety",
    title: "Fit-to-Fly Safety Gate",
    body: "Return flights are locked behind anatomical healing and DVT thresholds so patients never fly home prematurely.",
    href: "/journey",
    tag: "Fit-to-Fly",
  },
  {
    step: "03 · Outcome Escrow",
    title: "15% Day-30 Holdback",
    body: "Hospitals receive their final tranche only after your Day-30 post-return check clears without unresolved complications.",
    href: "/security",
    tag: "Outcome Escrow",
  },
  {
    step: "04 · 24/7 Concierge",
    title: "Continuous Cross-Border Care",
    body: "Aria clinical AI concierge paired with human coordinator desks, offline mobile apps, and live family theatre tracking.",
    href: "/coordinator",
    tag: "Care Concierge",
  },
  {
    step: "05 · Privacy Vault",
    title: "Zero-Knowledge PHI Scrubbing",
    body: "In-browser redaction strips direct identifiers (name, DOB, MRN) before any data leaves your browser session.",
    href: "/security",
    tag: "Security Vault",
  },
  {
    step: "06 · Trust Ledger",
    title: "6-Stage Sequential Audit",
    body: "Provider listings cannot be bought with advertising; ranking is earned through verified clinical audits.",
    href: "/hospitals",
    tag: "Verified Ledger",
  },
];

const STEPS = [
  ["Share a report", "Paste or pick a sample. Client-side PHI de-identification protects your data."],
  ["Compare TrueCost", "See audited hospitals side by side against wait times and private costs at home."],
  ["Plan the journey", "Visa, flights, recovery stay and follow-ups on one clinically-gated timeline."],
  ["Pay by milestone", "Escrow releases as care is delivered, with a 15% post-return holdback."],
];

export default function Home() {
  const t = TREATMENTS.find((x) => x.id === "bariatric")!;
  const cheap = hospitalById("anatolia")!;
  const safe = hospitalById("baja")!;
  const o = { companion: true, riskMultiplier: 1.64 };
  const a = trueCost(t, cheap, { id: "US", name: "United States", flag: "🇺🇸", waitWeeks: 3, flight: { IN: 1200, TH: 1300, TR: 900, SG: 1400, MY: 1350, AE: 1100, MX: 400, KR: 1300 }, hours: { IN: 17, TH: 20, TR: 11, SG: 19, MY: 21, AE: 14, MX: 4, KR: 14 } }, o);
  const b = trueCost(t, safe, { id: "US", name: "United States", flag: "🇺🇸", waitWeeks: 3, flight: { IN: 1200, TH: 1300, TR: 900, SG: 1400, MY: 1350, AE: 1100, MX: 400, KR: 1300 }, hours: { IN: 17, TH: 20, TR: 11, SG: 19, MY: 21, AE: 14, MX: 4, KR: 14 } }, o);
  const countries = new Set(HOSPITALS.map((h) => h.country)).size;

  return (
    <>
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-tealBrand mb-5">
              Better Healthcare &middot; Global Access &middot; Healthier Tomorrow
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.25rem] leading-[1.03] tracking-tight text-ink mb-6">
              The price of surgery abroad isn&apos;t the{" "}
              <span className="text-terracotta">price tag</span>.
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-xl mb-8">
              MedTour connects you with verified hospitals in {countries} countries — and prices in what others leave out:
              your own medical risk, the days you can&apos;t fly, and what happens if something goes wrong.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-12">
              <Link
                href="/match"
                className="inline-flex items-center justify-center bg-tealBrand text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-tealDeep transition-colors"
              >
                Analyse my report
              </Link>
              <Link
                href="/cost"
                className="inline-flex items-center justify-center bg-surface text-ink border border-sand text-sm font-medium px-6 py-3 rounded-full hover:border-ink/30 transition-colors"
              >
                Compare TrueCost
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-sand max-w-md">
              <div>
                <p className="font-serif text-3xl text-ink leading-none mb-1">{HOSPITALS.length}</p>
                <p className="text-xs text-muted">audited hospitals</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-ink leading-none mb-1">6</p>
                <p className="text-xs text-muted">verification checks</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-ink leading-none mb-1">15%</p>
                <p className="text-xs text-muted">outcome holdback</p>
              </div>
            </div>
          </div>

          {/* Right Column: TrueCost Live Example Card */}
          <div className="lg:col-span-6">
            <div className="bg-surface border border-sand rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_-15px_rgba(11,70,63,0.08)]">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-tealBrand">
                  TrueCost &middot; Live Example
                </span>
                <span className="text-xs font-medium text-muted bg-cream px-2.5 py-1 rounded-full border border-sand">
                  US &rarr; Gastric Sleeve
                </span>
              </div>

              <p className="text-sm text-muted leading-relaxed mb-7">
                A 41-year-old with a BMI of 48.8, travelling with a companion. Same operation, two hospitals.
              </p>

              {/* Item 1: Anatolia */}
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-cream border border-sand text-muted">TR</span>
                    <span className="text-sm font-semibold text-ink">Anatolia Smile &amp; Surgery</span>
                  </div>
                  <span className="font-serif text-2xl text-ink">{usd(a.total)}</span>
                </div>
                <div className="w-full h-2.5 bg-cream rounded-full overflow-hidden flex">
                  <div className="bg-tealBrand h-full" style={{ width: "24%" }} />
                  <div className="bg-tealSoft h-full" style={{ width: "14%" }} />
                  <div className="bg-terracotta h-full" style={{ width: "7%" }} />
                </div>
                <p className="text-xs text-muted mt-1.5">
                  Lowest sticker price &middot; sticker {usd(a.sticker)} &middot;{" "}
                  <span className="text-terracotta font-medium">risk reserve {usd(a.riskReserve)}</span>
                </p>
              </div>

              {/* Item 2: Baja */}
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-cream border border-sand text-muted">MX</span>
                    <span className="text-sm font-semibold text-ink">Baja Pacific Surgical</span>
                  </div>
                  <span className="font-serif text-2xl text-ink">{usd(b.total)}</span>
                </div>
                <div className="w-full h-2.5 bg-cream rounded-full overflow-hidden flex">
                  <div className="bg-tealBrand h-full" style={{ width: "26%" }} />
                  <div className="bg-tealSoft h-full" style={{ width: "11%" }} />
                  <div className="bg-terracotta h-full" style={{ width: "6%" }} />
                </div>
                <p className="text-xs text-muted mt-1.5">
                  Lowest TrueCost &middot; sticker {usd(b.sticker)} &middot;{" "}
                  <span className="text-terracotta font-medium">risk reserve {usd(b.riskReserve)}</span>
                </p>
              </div>

              {/* Item 3: US Home */}
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-cream border border-sand text-muted">US</span>
                    <span className="text-sm font-semibold text-ink">Private treatment at home</span>
                  </div>
                  <span className="font-serif text-2xl text-ink">{usd(a.homeTotal)}</span>
                </div>
                <div className="w-full h-2.5 bg-cream rounded-full overflow-hidden flex">
                  <div className="bg-ink/75 h-full" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-sand text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tealBrand" /> Procedure
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tealSoft" /> Travel &amp; stay
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-terracotta" /> Risk reserve
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* NEW TO MEDICAL TOURISM? PLAIN-ENGLISH PATIENT GUIDE */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-surface border border-sand p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-tealBrand bg-cream px-3 py-1 rounded-full border border-sand">
              Beginner&apos;s Guide
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-3">
              New to Seeking Healthcare Abroad?
            </h2>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Traveling for elective surgery can save 50% to 80% while avoiding months of public waitlists.
              Here is how MedTour ensures your care is safe, transparent, and medically accountable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-cream/50 border border-sand/80">
              <span className="size-8 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-xs mb-3">
                1
              </span>
              <h3 className="font-semibold text-ink text-base">Verified Quality</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Only JCI and NABH-accredited international hospitals. Every surgeon&apos;s caseload and complication rate is audited.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cream/50 border border-sand/80">
              <span className="size-8 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-xs mb-3">
                2
              </span>
              <h3 className="font-semibold text-ink text-base">No Surprise Bills</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                TrueCost calculates your flights, companion hotel nights, meals, and an estimated safety reserve so you know total costs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cream/50 border border-sand/80">
              <span className="size-8 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-xs mb-3">
                3
              </span>
              <h3 className="font-semibold text-ink text-base">Safe Return Flights</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Our Fit-to-Fly gate blocks you from flying home too early, protecting you against blood clots and surgical pressure injuries.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cream/50 border border-sand/80">
              <span className="size-8 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-xs mb-3">
                4
              </span>
              <h3 className="font-semibold text-ink text-base">Payment Protection</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Funds sit in escrow. The hospital only receives the final 15% after your Day-30 follow-up back home confirms you are healing well.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATOR SECTION (DARK TEAL BAND) */}
      <section className="bg-tealDeep text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-tealSoft mb-3">
            What Makes MedTour Different
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl leading-[1.08] max-w-2xl mb-12">
            Directories list hospitals.<br />
            We underwrite the decision.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INNOVATIONS.map((inn) => (
              <Link
                key={inn.title}
                href={inn.href}
                className="group rounded-2xl border border-white/15 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-tealSoft">
                      {inn.step}
                    </p>
                    <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-white/80">
                      {inn.tag}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl mb-2 text-white">{inn.title}</h3>
                  <p className="text-sm text-white/75 leading-relaxed">
                    {inn.body}
                  </p>
                </div>
                <p className="mt-5 text-xs font-semibold text-tealSoft flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore feature &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-[0.14em] uppercase text-tealBrand mb-3">
          Clinical Journey Flow
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-10">
          From report to recovery, on one continuous thread
        </h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([stepTitle, stepDesc], i) => (
            <li key={stepTitle} className="bg-surface border border-sand rounded-2xl p-6">
              <span className="font-serif text-terracotta text-2xl font-bold num">{i + 1}</span>
              <p className="mt-3 font-semibold text-ink text-base">{stepTitle}</p>
              <p className="mt-1 text-sm text-muted leading-relaxed">{stepDesc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* PARTNER ECOSYSTEM */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="rounded-3xl bg-sand/60 border border-sand p-8 sm:p-12 grid gap-8 md:grid-cols-[1.3fr_1fr] items-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink">
              Hospitals, recovery stays, airlines &amp; insurers
            </h2>
            <p className="mt-3 text-muted max-w-lg leading-relaxed text-sm">
              MedTour is a two-sided platform. Providers earn international patients by opening their
              outcome data to sequential audit; travel and insurance partners plug into the clinical timeline.
            </p>
          </div>
          <div className="flex md:justify-end gap-3 flex-wrap">
            <Link href="/partners" className="btn btn-primary">See the verification workflow</Link>
            <Link href="/hospitals" className="btn btn-ghost">Browse hospitals &amp; doctors</Link>
          </div>
        </div>
      </section>
    </>
  );
}
