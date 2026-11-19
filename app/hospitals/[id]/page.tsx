import Link from "next/link";
import { notFound } from "next/navigation";
import { COUNTRIES, HOMES, HOSPITALS, TREATMENTS, VERIFICATION_STEPS, doctorsByHospital, hospitalById, offers, pct, priceAt, usd, type HomeId } from "@/lib/data";
import { complicationAt, trueCost } from "@/lib/engine";
import { CostBar, HospitalMark, Place, TierBadge } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import QuoteForm from "@/components/QuoteForm";
import { createClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return HOSPITALS.map((h) => ({ id: h.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const h = hospitalById((await params).id);
  return { title: h?.name ?? "Hospital" };
}

const REVIEWS = [
  ["Coordinator met us at arrivals and stayed reachable on chat the whole trip.", "Sample review (illustrative, not a real patient)"],
  ["The quote did not change by a single dollar. That alone was worth it.", "Sample review (illustrative, not a real patient)"],
];

export default async function HospitalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ procedure?: string; from?: string }>;
}) {
  const h = hospitalById((await params).id);
  if (!h) notFound();
  const sp = await searchParams;
  const c = COUNTRIES[h.country];
  const offered = TREATMENTS.filter((t) => offers(h, t));
  const t = offered.find((x) => x.id === sp.procedure) ?? offered[0];
  const homeId: HomeId = (Object.keys(HOMES) as HomeId[]).includes(sp.from as HomeId) ? (sp.from as HomeId) : "US";
  const home = HOMES[homeId];
  const cost = trueCost(t, h, home, { companion: true, riskMultiplier: 1.0 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
      <Link href="/hospitals" className="text-sm text-muted hover:text-teal">← All hospitals</Link>
      <div className="mt-4 flex flex-wrap items-start gap-5">
        <HospitalMark h={h} size="size-16" />
        <div className="flex-1 min-w-64">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight">{h.name}</h1>
            <TierBadge tier={h.tier} steps={h.stepsPassed} />
            <span className="text-[10px] font-medium text-muted border border-sand rounded px-1.5 py-0.5">Sample listing</span>
          </div>
          <Place h={h} />
          <p className="mt-3 max-w-2xl text-muted">{h.blurb}</p>
        </div>
      </div>

      <section className="mt-6 card p-5 sm:p-6 grid gap-5 md:grid-cols-[1fr_auto] items-center" aria-label="Estimated total cost">
        <div>
          <p className="text-xs text-muted">{t.name} · from {home.name} · with a companion</p>
          <p className="mt-1 font-serif text-4xl num">{usd(cost.total)} <span className="text-base font-sans text-muted">estimated total trip cost</span></p>
          <div className="mt-3 max-w-xl"><CostBar cost={cost} max={cost.total} /></div>
          <p className="mt-2 text-xs text-muted">
            Includes hospital price {usd(cost.sticker)}, flights, a {cost.nights}-night recovery stay, visa and insurance, and a {usd(cost.riskReserve)} complication buffer. Sample estimate, not a quote.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <a href="#quote" className="btn btn-primary min-h-11">Request a quote</a>
          <Link href={`/cost?t=${t.id}&h=${h.id}&home=${homeId}`} className="text-sm text-teal font-semibold hover:underline">See full cost breakdown →</Link>
        </div>
      </section>

      <div className="mt-4"><MedicalDisclaimer /></div>

      <dl className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Patient rating", `★ ${h.rating}`, `${h.reviews.toLocaleString("en-US")} sample reviews`],
          ["International patients", h.intlPatients.toLocaleString("en-US"), "per year"],
          ["Medical visa", `${c.visaDays} day${c.visaDays > 1 ? "s" : ""}`, c.visaFee ? `${usd(c.visaFee)} fee` : "no fee"],
          ["Languages", h.languages.length, h.languages.join(", ")],
        ].map(([l, v, s]) => (
          <div key={l} className="card p-4">
            <dt className="text-xs text-muted">{l}</dt>
            <dd className="mt-1 font-display text-2xl num">{v}</dd>
            <dd className="text-xs text-muted">{s}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-2xl">Procedures and complication rates (sample)</h2>
          <p className="mt-1 text-sm text-muted">Sample package prices. In a live product, a written quote from the hospital would confirm the price.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-line">
                  <th className="py-2 font-medium">Procedure</th>
                  <th className="py-2 font-medium text-right">Package</th>
                  <th className="py-2 font-medium text-right">Complications</th>
                  <th className="py-2 font-medium text-right">Platform avg.</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {offered.map((t) => {
                  const rate = complicationAt(h, t, 1);
                  const better = rate < t.baseComplication;
                  return (
                    <tr key={t.id} className="border-b border-line last:border-0">
                      <td className="py-3 font-semibold">{t.name}</td>
                      <td className="py-3 text-right num">{usd(priceAt(h, t))}</td>
                      <td className={`py-3 text-right num font-semibold ${better ? "text-teal" : "text-coral"}`}>{pct(rate)}</td>
                      <td className="py-3 text-right num text-muted">{pct(t.baseComplication)}</td>
                      <td className="py-3 text-right">
                        <Link href={`/cost?t=${t.id}&h=${h.id}&home=${homeId}`} className="text-teal font-semibold hover:underline whitespace-nowrap">
                          Total cost →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {doctorsByHospital(h.id).length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl">Specialists (sample profiles)</h2>
                  <p className="mt-0.5 text-sm text-muted">Illustrative caseload and credentials. Not verified.</p>
                </div>
                <span className="text-xs text-muted font-medium bg-sand px-2.5 py-1 rounded-full">
                  {doctorsByHospital(h.id).length} on roster
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {doctorsByHospital(h.id).map((doc) => (
                  <div key={doc.id} className="rounded-xl border border-line bg-white p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{doc.name}</p>
                          <p className="text-xs text-muted">{doc.title}</p>
                        </div>
                        <span className="text-xs font-semibold text-teal bg-mint px-2 py-0.5 rounded-full whitespace-nowrap">
                          ★ {doc.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted line-clamp-2">{doc.bio}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {doc.credentials.map((c) => (
                          <span key={c} className="text-[10px] bg-sand/80 px-2 py-0.5 rounded text-muted font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
                      <span>Caseload: <b className="text-ink num">{doc.surgeriesPerformed.toLocaleString("en-US")}</b> procedures</span>
                      <span>Complication rate: <b className="text-teal num">{pct(doc.auditedComplicationRate)}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="mt-8 font-display text-2xl">What patients say</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {REVIEWS.map(([text, who]) => (
              <figure key={who} className="rounded-xl bg-white border border-line p-4">
                <blockquote className="text-sm">“{text}”</blockquote>
                <figcaption className="mt-2 text-xs text-muted">{who}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Reviews on this page are illustrative samples. A live product would only accept reviews it can verify.
          </p>
        </section>

        <aside className="card p-5 sm:p-6 self-start">
          <h2 className="font-display text-2xl">Planned verification checks</h2>
          <p className="mt-1 text-sm text-muted">What a real MedTour check would cover. The progress shown is illustrative sample data; no real audit has taken place.</p>
          <ol className="mt-4 space-y-3">
            {VERIFICATION_STEPS.map((s, i) => {
              const done = i < h.stepsPassed;
              return (
                <li key={s.key} className="flex gap-3">
                  <span className={`mt-0.5 size-5 shrink-0 grid place-items-center rounded-full text-[11px] font-bold ${done ? "bg-teal text-white" : "border border-line text-muted"}`}>
                    {done ? "✓" : i + 1}
                  </span>
                  <div className={done ? "" : "opacity-55"}>
                    <p className="text-sm font-semibold">{s.label}{done ? "" : " - pending"}</p>
                    <p className="text-xs text-muted">{s.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <Link href={`/journey?h=${h.id}&t=${offered[0].id}`} className="btn btn-primary w-full mt-6">
            Open trip plan
          </Link>
        </aside>
      </div>

      <div className="mt-8 max-w-2xl pb-4">
        <QuoteForm
          hospitalId={h.id}
          hospitalName={h.name}
          procedures={offered.map((o) => ({ id: o.id, name: o.name }))}
          defaultProcedure={t.id}
          defaultEmail={user?.email ?? ""}
        />
      </div>
    </div>
  );
}
