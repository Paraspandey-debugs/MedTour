import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";
import { CostBar, LINE_COLORS } from "@/components/ui";
import { HOMES, hospitalById, treatmentById, usd } from "@/lib/data";
import { trueCost } from "@/lib/engine";

export const metadata = {
  title: { absolute: "MedTour — Compare the real cost of surgery abroad" },
  description:
    "Choose a procedure and where you live, then compare the total trip cost — procedure, flights, stay, visa and a complication buffer — across hospitals abroad. Demo prototype with sample data.",
};

const STEPS = [
  ["1", "Choose a procedure and where you live", "Tell us what you need and your home country so costs and flights are calculated for you."],
  ["2", "Compare total cost and hospitals", "See every hospital ranked by what the whole trip would cost, not just the sticker price."],
  ["3", "Request a quote", "Pick a hospital and send a quote request. In this demo nothing is forwarded to a hospital."],
];

const INCLUDED = [
  ["Procedure", "The hospital's package price: surgeon, theatre, stay in hospital."],
  ["Flights", "Return economy fare for you, and a companion if you choose."],
  ["Recovery stay", "Hotel nights and meals while you recover before it is safe to fly home."],
  ["Visa & insurance", "Medical visa fees and travel insurance."],
  ["Complication buffer", "A cost allowance for the chance that something goes wrong. Illustrative estimate."],
];

const STATUS: [string, string, string][] = [
  ["Total-cost comparison", "Working", "Calculated from sample prices"],
  ["Hospitals and doctors", "Sample data", "Fictional listings for demonstration"],
  ["Report analysis", "Working", "AI-assisted, informational only"],
  ["Quote requests", "Working", "Saved to your account; not sent to hospitals"],
  ["Payments and milestone escrow", "Planned", "Shown as a simulation only"],
  ["Real hospital partnerships", "Planned", "None yet"],
];

const BADGE: Record<string, string> = {
  Working: "bg-mint text-deep",
  "Sample data": "bg-terracottaSoft text-terracotta",
  Planned: "bg-sand text-muted",
};

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

  return (
    <>
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-10 lg:pt-20 text-center">
        <p className="eyebrow">Planned surgery abroad</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink">
          Compare the real cost of surgery abroad.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
          Pick a procedure and where you live. MedTour shows the whole trip cost for each hospital: procedure,
          flights, recovery stay, visa, and an allowance for complications.
        </p>
        <div className="mt-8 text-left max-w-3xl mx-auto">
          <HomeSearch />
        </div>
        <p className="mt-3 text-xs text-muted">
          Demo prototype. Hospitals, prices and ratings are sample data. Not medical advice.
        </p>
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-12 scroll-mt-24">
        <h2 className="font-serif text-3xl text-center">How it works</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map(([n, title, body]) => (
            <li key={n} className="card p-6">
              <span className="grid size-9 place-items-center rounded-full bg-tealBrand text-white font-semibold text-sm" aria-hidden>{n}</span>
              <h3 className="mt-4 font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">Example: {t.short}, US patient with a companion</h2>
            <span className="text-xs font-medium text-muted bg-cream px-2.5 py-1 rounded-full border border-sand">Sample numbers</span>
          </div>
          <p className="mt-2 text-sm text-muted">The cheapest sticker price is not always the cheapest trip. Same operation, two hospitals.</p>

          <div className="mt-6 space-y-6">
            {rows.map(({ h, c }) => (
              <div key={h.id}>
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <Link href={`/hospitals/${h.id}`} className="text-sm font-semibold text-ink hover:text-tealBrand">{h.name}</Link>
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
              <div className="h-3.5 rounded-full bg-ink/75" style={{ width: `${(homeTotal / max) * 100}%` }} role="img" aria-label={`Home cost ${usd(homeTotal)}`} />
            </div>
          </div>

          <ul className="mt-6 pt-4 border-t border-sand flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            {[["procedure", "Procedure"], ["flights", "Flights"], ["stay", "Recovery stay"], ["living", "Meals & transport"], ["visa", "Visa & insurance"], ["fee", "Service fee"], ["risk", "Complication buffer"]].map(([k, l]) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: LINE_COLORS[k] }} aria-hidden /> {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="font-serif text-3xl text-center">What is included in the total cost</h2>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {INCLUDED.map(([k, v]) => (
            <div key={k} className="card p-5">
              <dt className="font-semibold text-ink">{k}</dt>
              <dd className="mt-1 text-sm text-muted leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8" aria-labelledby="status-h">
        <h2 id="status-h" className="font-serif text-3xl text-center">What is real today</h2>
        <p className="mt-2 text-center text-sm text-muted">MedTour is an early prototype. Here is exactly what works and what does not.</p>
        <div className="mt-6 card overflow-hidden">
          <table className="w-full text-sm">
            <caption className="sr-only">Feature status</caption>
            <thead className="bg-cream text-left text-xs text-muted">
              <tr><th scope="col" className="px-4 py-2.5 font-semibold">Feature</th><th scope="col" className="px-4 py-2.5 font-semibold">Status</th><th scope="col" className="px-4 py-2.5 font-semibold hidden sm:table-cell">Notes</th></tr>
            </thead>
            <tbody>
              {STATUS.map(([f, s, n]) => (
                <tr key={f} className="border-t border-sand">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-ink">{f}</th>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[s]}`}>{s}</span></td>
                  <td className="px-4 py-3 text-muted hidden sm:table-cell">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <h2 className="font-serif text-3xl">Ready to compare?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/hospitals" className="btn btn-primary min-h-11">Compare hospitals</Link>
          <Link href="/match" className="btn btn-ghost min-h-11">Optional: analyse my report</Link>
        </div>
      </section>
    </>
  );
}
