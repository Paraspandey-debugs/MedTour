"use client";

import Link from "next/link";
import { useState } from "react";
import { COUNTRIES, DOCTORS, HOSPITALS, TREATMENTS, hospitalById, offers, pct, priceAt, treatmentById, usd, type Tier } from "@/lib/data";
import { complicationAt } from "@/lib/engine";
import { HospitalMark, PageHead, Place, TierBadge } from "@/components/ui";

export default function HospitalsPage() {
  const [viewMode, setViewMode] = useState<"hospitals" | "doctors">("hospitals");
  const [q, setQ] = useState("");
  const [tid, setTid] = useState("all");
  const [country, setCountry] = useState("all");
  const [tier, setTier] = useState<"all" | Tier>("all");

  const t = tid === "all" ? null : treatmentById(tid);
  const countries = [...new Set(HOSPITALS.map((h) => h.country))];
  const list = HOSPITALS.filter(
    (h) =>
      (!t || offers(h, t)) &&
      (country === "all" || h.country === country) &&
      (tier === "all" || h.tier === tier) &&
      `${h.name} ${h.city} ${COUNTRIES[h.country].name} ${h.specialties.join(" ")}`.toLowerCase().includes(q.toLowerCase()),
  ).sort((a, b) => (t ? priceAt(a, t) - priceAt(b, t) : b.rating - a.rating));

  const filteredDoctors = DOCTORS.filter((d) => {
    const hosp = hospitalById(d.hospitalId);
    if (!hosp) return false;
    const matchesCountry = country === "all" || hosp.country === country;
    const matchesTier = tier === "all" || hosp.tier === tier;
    const matchesSpecialty = !t || d.specialties.includes(t.specialty);
    const matchesQuery = `${d.name} ${d.title} ${d.education} ${hosp.name} ${hosp.city}`
      .toLowerCase()
      .includes(q.toLowerCase());
    return matchesCountry && matchesTier && matchesSpecialty && matchesQuery;
  }).sort((a, b) => b.rating - a.rating);

  return (
    <>
      <PageHead eyebrow="Verified provider directory" title="Every hospital here opened its books.">
        Listing is earned through a six-step audit. The badge shows how far each hospital has gone -
        and the detail page shows which checks it passed.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* PATIENT SAFETY GUIDE */}
        <div className="rounded-2xl border border-sand bg-surface p-4 sm:p-5 mb-5 shadow-sm text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-semibold text-teal uppercase tracking-wider text-[11px]">
              Patient Safety Standard
            </span>
            <span className="text-muted">100% International Desk &amp; English Coverage</span>
          </div>
          <p className="text-ink/80 leading-relaxed">
            <b>How are hospitals verified?</b> Every facility listed here is audited against 6 sequential quality gates.
            Accreditations such as <b>JCI (USA)</b>, <b>NABH (India)</b>, and <b>TEMOS (Europe)</b> ensure rigorous
            operating theatre hygiene, patient privacy, and audited complication rate reporting.
          </p>
        </div>

        <div className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="q">Search</label>
            <input id="q" className="field" placeholder="Hospital, city, specialty" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="t">Procedure</label>
            <select id="t" className="field" value={tid} onChange={(e) => setTid(e.target.value)}>
              <option value="all">Any procedure</option>
              {TREATMENTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="c">Country</label>
            <select id="c" className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="all">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="v">Verification</label>
            <select id="v" className="field" value={tier} onChange={(e) => setTier(e.target.value as "all" | Tier)}>
              <option value="all">Any tier</option>
              <option>Platinum</option><option>Gold</option><option>Verified</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("hospitals")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                viewMode === "hospitals" ? "bg-teal text-white" : "bg-white border border-line text-muted hover:text-ink"
              }`}
            >
              Hospitals ({list.length})
            </button>
            <button
              onClick={() => setViewMode("doctors")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                viewMode === "doctors" ? "bg-teal text-white" : "bg-white border border-line text-muted hover:text-ink"
              }`}
            >
              Specialists &amp; Surgeons ({filteredDoctors.length})
            </button>
          </div>
          <p className="text-xs text-muted">
            {viewMode === "hospitals"
              ? t ? `Offering ${t.short.toLowerCase()}, lowest package price first` : "Ranked by patient rating & audit depth"
              : "Board-certified international faculty with audited caseloads"}
          </p>
        </div>

        {viewMode === "hospitals" ? (
          list.length === 0 ? (
            <div className="card mt-6 p-10 text-center">
              <p className="font-display text-xl">No hospitals match those filters</p>
              <button className="btn btn-ghost mt-4" onClick={() => { setQ(""); setTid("all"); setCountry("all"); setTier("all"); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {list.map((h) => (
                <li key={h.id}>
                  <Link href={`/hospitals/${h.id}`} className="card p-5 block h-full hover:border-teal transition-colors">
                    <div className="flex gap-4">
                      <HospitalMark h={h} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{h.name}</p>
                          <TierBadge tier={h.tier} steps={h.stepsPassed} />
                        </div>
                        <Place h={h} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted">{h.blurb}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {h.specialties.map((s) => (
                        <span key={s} className="rounded-full bg-sand px-2 py-0.5 text-[11px]">{s}</span>
                      ))}
                      {h.accreditations.map((a) => (
                        <span key={a} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">{a}</span>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-line flex justify-between text-sm">
                      <span>★ <b className="num">{h.rating}</b> <span className="text-muted num">({h.reviews.toLocaleString("en-US")})</span></span>
                      {t ? (
                        <span className="num">
                          <b>{usd(priceAt(h, t))}</b>{" "}
                          <span className="text-muted">· {pct(complicationAt(h, t, 1))} complications</span>
                        </span>
                      ) : (
                        <span className="text-muted num">{h.intlPatients.toLocaleString("en-US")} intl. patients / yr</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : (
          filteredDoctors.length === 0 ? (
            <div className="card mt-6 p-10 text-center">
              <p className="font-display text-xl">No specialists match those filters</p>
              <button className="btn btn-ghost mt-4" onClick={() => { setQ(""); setTid("all"); setCountry("all"); setTier("all"); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredDoctors.map((doc) => {
                const hosp = hospitalById(doc.hospitalId)!;
                return (
                  <li key={doc.id} className="card p-5 flex flex-col justify-between hover:border-teal transition-colors">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">{doc.name}</h3>
                            <span className="rounded-full bg-mint text-teal font-semibold text-[11px] px-2 py-0.5">
                              ★ {doc.rating}
                            </span>
                          </div>
                          <p className="text-xs text-muted">{doc.title}</p>
                          <Link href={`/hospitals/${hosp.id}`} className="text-xs text-teal font-medium hover:underline mt-0.5 inline-block">
                            {COUNTRIES[hosp.country].flag} {hosp.name} · {hosp.city}
                          </Link>
                        </div>
                        <TierBadge tier={hosp.tier} />
                      </div>

                      <p className="mt-3 text-xs text-muted leading-relaxed">{doc.bio}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {doc.credentials.map((cred) => (
                          <span key={cred} className="rounded-md bg-sand/80 px-2 py-0.5 text-[11px] text-muted font-medium">
                            {cred}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="space-x-3 text-muted">
                        <span>Caseload: <b className="text-ink num">{doc.surgeriesPerformed.toLocaleString("en-US")}</b></span>
                        <span>Audited comp: <b className="text-teal num">{pct(doc.auditedComplicationRate)}</b></span>
                        <span>Notice: <b className="text-ink num">{doc.availableDaysNotice}d</b></span>
                      </div>
                      <Link
                        href={`/journey?h=${hosp.id}&t=${t?.id || TREATMENTS.find(tr => doc.specialties.includes(tr.specialty))?.id || "knee"}`}
                        className="text-teal font-semibold hover:underline"
                      >
                        Book consult →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        )}
      </div>
    </>
  );
}
