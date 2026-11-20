import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";
import FeatureExplorer from "@/components/FeatureExplorer";
import Faq from "@/components/Faq";
import { Reveal, CountUp, Tilt } from "@/components/motion";
import { CostBar, LINE_COLORS } from "@/components/ui";
import { HOMES, TREATMENTS, HOSPITALS, hospitalById, treatmentById, usd } from "@/lib/data";
import { trueCost } from "@/lib/engine";
import { ALL_FEATURES, FAQ, STATUS_STYLE } from "@/lib/features";

export const metadata = {
  title: { absolute: "MedTour — Compare the real cost of surgery abroad" },
  description:
    "Choose a procedure and where you live, then compare the total trip cost — procedure, flights, stay, visa and a complication buffer — across hospitals abroad.",
};

const STEPS = [
  ["1", "Choose a procedure and where you live", "Tell us what you need and your home country so costs and flights are calculated for you."],
  ["2", "Compare total cost and hospitals", "See every hospital ranked by what the whole trip would cost, not just the sticker price."],
  ["3", "Request a quote", "Pick a hospital and send a quote request. Track it from your dashboard."],
] as const;

const INCLUDED = [
  ["Procedure", "The hospital's package price: surgeon, theatre, stay in hospital.", "procedure"],
  ["Flights", "Return economy fare for you, and a companion if you choose.", "flights"],
  ["Recovery stay", "Hotel nights and meals while you recover before it is safe to fly home.", "stay"],
  ["Visa & insurance", "Medical visa fees and travel insurance.", "visa"],
  ["Complication buffer", "A cost allowance for the chance that something goes wrong. A planning estimate.", "risk"],
] as const;

export default function Home() {
  const t = treatmentById("bariatric");
  const us = HOMES.US;
  const opts = { companion: true, riskMultiplier: 1.0 };
  const rows = ["anatolia", "baja"].flatMap((id) => {
    const h = hospitalById(id);
    return h ? [{ h, c: trueCost(t, h, us, opts) }] : [];
  });
  const homeTotal = rows[0]?.c.homeTotal ?? 0;
  const max = Math.max(homeTotal, ...rows.map((r) => r.c.total));
  const cheapest = rows.length ? Math.min(...rows.map((r) => r.c.total)) : 0;
  const saving = Math.max(0, homeTotal - cheapest);
  const procedureNames = TREATMENTS.map((x) => x.short);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="blob -z-10 left-[-8%] top-[-6rem] size-[26rem] bg-mint" />
        <div aria-hidden className="blob blob-b -z-10 right-[-6%] top-10 size-[22rem] bg-terracottaSoft" />
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-10 lg:pt-20 text-center">
          <p className="eyebrow fade-up inline-flex items-center gap-2 rounded-full border border-sand bg-white/70 px-3 py-1 backdrop-blur">
            <span className="size-1.5 rounded-full bg-terracotta pulse-dot" aria-hidden /> Planned surgery abroad
          </p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink fade-up" style={{ animationDelay: "80ms" }}>
            Compare the <span className="shimmer-text">real cost</span> of surgery abroad.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto fade-up" style={{ animationDelay: "160ms" }}>
            Pick a procedure and where you live. MedTour shows the whole trip cost for each hospital: procedure,
            flights, recovery stay, visa, and an allowance for complications.
          </p>
          <div className="mt-8 text-left max-w-3xl mx-auto fade-up" style={{ animationDelay: "240ms" }}>
            <HomeSearch />
          </div>
          <p className="mt-3 text-xs text-muted fade-up" style={{ animationDelay: "320ms" }}>
            Costs are estimates. Always confirm pricing and clinical details with your hospital and doctor.
          </p>
        </div>

        {/* procedure marquee */}
        <div className="border-y border-sand bg-white/60 backdrop-blur py-3 overflow-hidden" aria-label="Procedures you can compare">
          <div className="marquee" aria-hidden>
            {[...procedureNames, ...procedureNames].map((n, i) => (
              <span key={i} className="mx-5 flex items-center gap-5 whitespace-nowrap text-sm text-muted">
                {n} <span className="size-1 rounded-full bg-tealSoft" />
              </span>
            ))}
          </div>
          <p className="sr-only">{procedureNames.join(", ")}</p>
        </div>
      </section>

      {/* QUICK NUMBERS */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            [TREATMENTS.length, "", "procedures"],
            [HOSPITALS.length, "", "partner hospitals"],
            [Object.keys(HOMES).length, "", "home countries"],
            [ALL_FEATURES.filter((f) => f.status === "Live").length, "", "live tools"],
          ].map(([n, , label], i) => (
            <Reveal key={String(label)} delay={i * 80}>
              <div className="card p-5 text-center card-hover">
                <dt className="sr-only">{label}</dt>
                <dd className="font-serif text-4xl text-tealBrand"><CountUp to={Number(n)} /></dd>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</p>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-12 scroll-mt-24">
        <Reveal><h2 className="font-serif text-3xl sm:text-4xl text-center">How it works</h2></Reveal>
        <ol className="relative mt-10 grid gap-5 md:grid-cols-3">
          <div aria-hidden className="hidden md:block absolute left-[16%] right-[16%] top-[2.65rem] border-t-2 border-dashed border-tealSoft/50" />
          {STEPS.map(([n, title, body], i) => (
            <Reveal as="li" key={n} delay={i * 120}>
              <div className="card card-hover relative h-full p-6">
                <span className="grid size-10 place-items-center rounded-full bg-tealBrand text-white font-semibold text-sm ring-4 ring-cream" aria-hidden>{n}</span>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-24" aria-labelledby="features-h">
        <Reveal>
          <p className="eyebrow text-center">Everything in one place</p>
          <h2 id="features-h" className="mt-2 font-serif text-3xl sm:text-4xl text-center">Tools for every step of the journey</h2>
          <p className="mt-3 text-center text-sm sm:text-base text-muted max-w-2xl mx-auto">
            Explore the tools available at every stage of your journey, from the first comparison to the flight home.
          </p>
        </Reveal>
        <Reveal className="mt-8" delay={100}>
          <FeatureExplorer />
        </Reveal>
        <Reveal className="mt-6 text-center">
          <Link href="/features" className="btn btn-ghost min-h-11 group">
            See the full feature outline <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </section>

      {/* EXAMPLE */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <Reveal>
          <Tilt>
            <div className="card p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl">Cost comparison: {t.short}, US patient with a companion</h2>
                <span className="text-xs font-medium text-muted bg-cream px-2.5 py-1 rounded-full border border-sand">Typical case</span>
              </div>
              <p className="mt-2 text-sm text-muted">The cheapest sticker price is not always the cheapest trip. Same operation, two hospitals.</p>

              <div className="mt-6 space-y-6">
                {rows.map(({ h, c }) => (
                  <div key={h.id}>
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <Link href={`/hospitals/${h.id}`} className="text-sm font-semibold text-ink hover:text-tealBrand underline-grow">{h.name}</Link>
                      <span className="font-serif text-2xl num">{usd(c.total)}</span>
                    </div>
                    <CostBar cost={c} max={max} />
                    <p className="mt-1.5 text-xs text-muted">
                      Hospital price {usd(c.sticker)} · complication buffer {usd(c.riskReserve)}
                    </p>
                  </div>
                ))}
                <div>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <span className="text-sm font-semibold text-ink">Private treatment at home</span>
                    <span className="font-serif text-2xl num">{usd(homeTotal)}</span>
                  </div>
                  <div className="bar-seg h-3.5 rounded-full bg-ink/75" style={{ width: `${(homeTotal / max) * 100}%` }} role="img" aria-label={`Home cost ${usd(homeTotal)}`} />
                </div>
              </div>

              {saving > 0 && (
                <p className="mt-6 rounded-xl bg-mint/70 px-4 py-3 text-sm text-deep">
                  For this procedure, the cheapest option comes in about <strong className="num">{usd(saving)}</strong> below private treatment at home.
                </p>
              )}

              <ul className="mt-6 pt-4 border-t border-sand flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                {[["procedure", "Procedure"], ["flights", "Flights"], ["stay", "Recovery stay"], ["living", "Meals & transport"], ["visa", "Visa & insurance"], ["fee", "Service fee"], ["risk", "Complication buffer"]].map(([k, l]) => (
                  <li key={k} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ background: LINE_COLORS[k] }} aria-hidden /> {l}
                  </li>
                ))}
              </ul>
            </div>
          </Tilt>
        </Reveal>
      </section>

      {/* INCLUDED */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <Reveal><h2 className="font-serif text-3xl sm:text-4xl text-center">What is included in the total cost</h2></Reveal>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {INCLUDED.map(([k, v, key], i) => (
            <Reveal key={k} delay={(i % 2) * 90}>
              <div className="card card-hover h-full p-5 flex gap-4">
                <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: LINE_COLORS[key] }} aria-hidden />
                <div>
                  <dt className="font-semibold text-ink">{k}</dt>
                  <dd className="mt-1 text-sm text-muted leading-relaxed">{v}</dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* WHAT IS REAL */}
      <section className="max-w-4xl mx-auto px-6 py-8" aria-labelledby="status-h">
        <Reveal>
          <h2 id="status-h" className="font-serif text-3xl sm:text-4xl text-center">Everything MedTour includes</h2>
          <p className="mt-2 text-center text-sm text-muted">From your first comparison to the day you fly home, each tool is built into the platform.</p>
        </Reveal>
        <Reveal className="mt-6">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <caption className="sr-only">Feature overview</caption>
              <thead className="bg-cream text-left text-xs text-muted">
                <tr><th scope="col" className="px-4 py-2.5 font-semibold">Feature</th><th scope="col" className="px-4 py-2.5 font-semibold">Availability</th><th scope="col" className="px-4 py-2.5 font-semibold hidden sm:table-cell">Notes</th></tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((f) => (
                  <tr key={f.id} className="border-t border-sand transition-colors hover:bg-cream/70">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-ink">
                      <Link href={f.href} className="hover:text-tealBrand">{f.title}</Link>
                    </th>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[f.status]}`}>{f.status}</span></td>
                    <td className="px-4 py-3 text-muted hidden sm:table-cell">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <Reveal><h2 className="font-serif text-3xl sm:text-4xl text-center">Questions, answered</h2></Reveal>
        <Reveal className="mt-8"><Faq items={FAQ} /></Reveal>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl bg-tealDeep px-6 py-12 text-center text-white">
            <div aria-hidden className="blob -z-10 -left-10 -top-10 size-64 bg-tealBrand" />
            <div aria-hidden className="blob blob-b -z-10 -right-10 -bottom-10 size-64 bg-terracotta opacity-30" />
            <h2 className="font-serif text-3xl sm:text-4xl">Ready to compare?</h2>
            <p className="mt-2 text-sm text-white/80">It takes about a minute. No medical records required.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/hospitals" className="btn bg-white text-deep hover:bg-mint min-h-11">Compare hospitals</Link>
              <Link href="/match" className="btn border border-white/40 text-white hover:bg-white/10 min-h-11">Optional: analyse my report</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
