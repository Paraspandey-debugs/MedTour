import Link from "next/link";
import { notFound } from "next/navigation";
import { COUNTRIES, HOSPITALS, TREATMENTS, VERIFICATION_STEPS, doctorsByHospital, hospitalById, offers, pct, priceAt, usd } from "@/lib/data";
import { complicationAt } from "@/lib/engine";
import { HospitalMark, Place, TierBadge } from "@/components/ui";

export function generateStaticParams() {
  return HOSPITALS.map((h) => ({ id: h.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const h = hospitalById((await params).id);
  return { title: h?.name ?? "Hospital" };
}

const REVIEWS = [
  ["Coordinator met us at arrivals and stayed reachable on chat the whole trip.", "Verified patient · stay confirmed by discharge record"],
  ["The quote did not change by a single dollar. That alone was worth it.", "Verified caregiver · payment confirmed via escrow"],
];

export default async function HospitalPage({ params }: { params: Promise<{ id: string }> }) {
  const h = hospitalById((await params).id);
  if (!h) notFound();
  const c = COUNTRIES[h.country];
  const offered = TREATMENTS.filter((t) => offers(h, t));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
      <Link href="/hospitals" className="text-sm text-muted hover:text-teal">← All hospitals</Link>
      <div className="mt-4 flex flex-wrap items-start gap-5">
        <HospitalMark h={h} size="size-16" />
        <div className="flex-1 min-w-64">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight">{h.name}</h1>
            <TierBadge tier={h.tier} steps={h.stepsPassed} />
          </div>
          <Place h={h} />
          <p className="mt-3 max-w-2xl text-muted">{h.blurb}</p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Patient rating", `★ ${h.rating}`, `${h.reviews.toLocaleString("en-US")} verified reviews`],
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
          <h2 className="font-display text-2xl">Procedures and audited outcomes</h2>
          <p className="mt-1 text-sm text-muted">Package prices are locked for 90 days from quote.</p>
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
                        <Link href={`/cost?t=${t.id}&h=${h.id}`} className="text-teal font-semibold hover:underline whitespace-nowrap">
                          TrueCost →
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
                  <h2 className="font-display text-2xl">Verified Specialist Surgeons</h2>
                  <p className="mt-0.5 text-sm text-muted">Audited surgical caseload &amp; credential-verified credentials</p>
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
                      <span>Audited comp: <b className="text-teal num">{pct(doc.auditedComplicationRate)}</b></span>
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
            Only patients whose stay is confirmed by a discharge record can leave a review.
          </p>
        </section>

        <aside className="card p-5 sm:p-6 self-start">
          <h2 className="font-display text-2xl">Verification ledger</h2>
          <p className="mt-1 text-sm text-muted">Last audited {h.lastAudit}</p>
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
            Plan a journey here
          </Link>
        </aside>
      </div>
    </div>
  );
}
