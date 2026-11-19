"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { COUNTRIES, DOCTORS, HOSPITALS, TREATMENTS, hospitalById, offers, pct, priceAt, treatmentById, usd, type Tier, type Hospital, type Doctor } from "@/lib/data";
import { getHospitals, getDoctors } from "@/lib/supabase/db";
import { complicationAt } from "@/lib/engine";
import { HospitalMark, PageHead, Place, TierBadge } from "@/components/ui";

const SMART_SEARCH_PRESETS = [
  "Knee replacement in India under $10,000 with JCI",
  "Heart bypass in Singapore with lowest complication rate",
  "Gastric sleeve in Turkey with TEMOS accreditation",
];

export default function HospitalsPage() {
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>(HOSPITALS);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(DOCTORS);
  const [viewMode, setViewMode] = useState<"hospitals" | "doctors">("hospitals");
  const [q, setQ] = useState("");
  const [tid, setTid] = useState("all");
  const [country, setCountry] = useState("all");
  const [tier, setTier] = useState<"all" | Tier>("all");

  // AI Smart Natural Language Filter State
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [accreditationFilter, setAccreditationFilter] = useState<string | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  useEffect(() => {
    async function loadDb() {
      try {
        const [h, d] = await Promise.all([getHospitals(), getDoctors()]);
        if (h && h.length > 0) setHospitalsList(h);
        if (d && d.length > 0) setDoctorsList(d);
      } catch (err) {
        console.warn("Using fallback local provider dataset:", err);
      }
    }
    loadDb();
  }, []);

  const handleSmartSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearchingAi(true);
    setQ(queryText);

    try {
      const res = await fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.filters) {
          const { procedure, country: cCode, maxPriceUsd, accreditation, tier: tTier } = data.filters;
          if (procedure) setTid(procedure);
          if (cCode) setCountry(cCode);
          if (tTier) setTier(tTier);
          if (accreditation) setAccreditationFilter(accreditation);
          if (maxPriceUsd) setMaxPriceFilter(maxPriceUsd);
          setAiExplanation(data.explanation);
          setIsSearchingAi(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Smart search failed:", err);
    }
    setIsSearchingAi(false);
  };

  const clearAllFilters = () => {
    setQ("");
    setTid("all");
    setCountry("all");
    setTier("all");
    setAccreditationFilter(null);
    setMaxPriceFilter(null);
    setAiExplanation(null);
  };

  const t = tid === "all" ? null : treatmentById(tid);
  const countries = [...new Set(hospitalsList.map((h) => h.country))];

  const list = hospitalsList.filter((h) => {
    const matchesTreatment = !t || offers(h, t);
    const matchesCountry = country === "all" || h.country === country;
    const matchesTier = tier === "all" || h.tier === tier;
    const matchesAccreditation = !accreditationFilter || h.accreditations.includes(accreditationFilter);
    const matchesPrice = !maxPriceFilter || !t || priceAt(h, t) <= maxPriceFilter;
    const matchesQuery = !q || !aiExplanation
      ? `${h.name} ${h.city} ${COUNTRIES[h.country].name} ${h.specialties.join(" ")}`.toLowerCase().includes(q.toLowerCase())
      : true;

    return matchesTreatment && matchesCountry && matchesTier && matchesAccreditation && matchesPrice && matchesQuery;
  }).sort((a, b) => (t ? priceAt(a, t) - priceAt(b, t) : b.rating - a.rating));

  const filteredDoctors = doctorsList.filter((d) => {
    const hosp = hospitalById(d.hospitalId);
    if (!hosp) return false;
    const matchesCountry = country === "all" || hosp.country === country;
    const matchesTier = tier === "all" || hosp.tier === tier;
    const matchesSpecialty = !t || d.specialties.includes(t.specialty);
    const matchesQuery = !q || !aiExplanation
      ? `${d.name} ${d.title} ${d.education} ${hosp.name} ${hosp.city}`.toLowerCase().includes(q.toLowerCase())
      : true;
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

        {/* AI SMART SEARCH BANNER */}
        <div className="card p-4 sm:p-5 mb-5 bg-gradient-to-r from-cream to-sand/40 border border-sand">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSmartSearch(q)}
                placeholder="Ask in natural language e.g. 'Knee replacement in India under $10,000 with JCI'…"
                className="field w-full !text-xs !pr-10"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => handleSmartSearch(q)}
              disabled={!q.trim() || isSearchingAi}
              className="btn btn-primary !py-2.5 !px-5 text-xs flex items-center justify-center gap-2 shrink-0"
            >
              {isSearchingAi ? (
                <>
                  <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>AI Parsing...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>AI Smart Match</span>
                </>
              )}
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted text-[11px] font-medium mr-1">Try natural search:</span>
            {SMART_SEARCH_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => handleSmartSearch(preset)}
                className="text-[11px] bg-white border border-line hover:border-teal rounded-full px-2.5 py-1 text-muted hover:text-teal transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Active AI Filter Explanation */}
          {aiExplanation && (
            <div className="mt-3 p-3 rounded-xl bg-teal/10 border border-teal/30 text-xs flex items-center justify-between gap-3 text-ink">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <span><b>AI Filter Applied:</b> {aiExplanation}</span>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-coral hover:underline font-semibold shrink-0"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* STRUCTURED FILTERS */}
        <div className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="q">Keyword Filter</label>
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
            <label className="label" htmlFor="v">Verification Tier</label>
            <select id="v" className="field" value={tier} onChange={(e) => setTier(e.target.value as "all" | Tier)}>
              <option value="all">Any tier</option>
              <option>Platinum</option><option>Gold</option><option>Verified</option>
            </select>
          </div>
        </div>

        {/* LIST TABS */}
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
              <p className="font-display text-xl">No hospitals match those criteria</p>
              <button className="btn btn-ghost mt-4" onClick={clearAllFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {list.map((h) => {
                const price = t ? priceAt(h, t) : null;
                const cr = t ? complicationAt(h, t, 1.0) : null;
                return (
                  <li key={h.id} className="card p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <HospitalMark h={h} />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Link href={`/hospitals/${h.id}`} className="font-semibold hover:text-teal">
                                {h.name}
                              </Link>
                              <TierBadge tier={h.tier} />
                            </div>
                            <Place h={h} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="num font-bold text-sm">★ {h.rating.toFixed(2)}</p>
                          <p className="text-[11px] text-muted">{h.reviews} reviews</p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-muted leading-relaxed">{h.blurb}</p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {h.accreditations.map((a) => (
                          <span key={a} className="rounded-full bg-sand/60 px-2 py-0.5 text-[10px] font-semibold text-ink">
                            {a}
                          </span>
                        ))}
                        {h.languages.map((l) => (
                          <span key={l} className="rounded-full bg-white border border-line px-2 py-0.5 text-[10px] text-muted">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
                      <div>
                        {price ? (
                          <p className="text-sm">
                            <span className="text-muted">From</span>{" "}
                            <b className="num text-base">{usd(price)}</b>
                            {cr && <span className="text-muted text-xs"> · {pct(cr)} comp. rate</span>}
                          </p>
                        ) : (
                          <p className="text-xs text-muted">{h.specialties.join(" · ")}</p>
                        )}
                      </div>
                      <Link href={`/hospitals/${h.id}`} className="btn btn-ghost !py-1.5 !px-3 text-xs">
                        View Dossier →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          filteredDoctors.length === 0 ? (
            <div className="card mt-6 p-10 text-center">
              <p className="font-display text-xl">No specialists match those filters</p>
              <button className="btn btn-ghost mt-4" onClick={clearAllFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredDoctors.map((d) => {
                const hosp = hospitalById(d.hospitalId);
                return (
                  <li key={d.id} className="card p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base text-ink">{d.name}</h3>
                            <span className="text-xs bg-mint text-teal font-semibold px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-teal font-medium mt-0.5">{d.title}</p>
                          {hosp && (
                            <p className="text-xs text-muted mt-1">
                              {hosp.name} · {hosp.city}, {COUNTRIES[hosp.country].name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="num font-bold text-sm">★ {d.rating.toFixed(2)}</p>
                          <p className="text-[11px] text-muted">{d.reviewsCount} reviews</p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-muted leading-relaxed line-clamp-2">{d.bio}</p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-sand/30 p-2.5 rounded-xl border border-line">
                        <div>
                          <span className="text-[10px] text-muted block uppercase">Experience</span>
                          <span className="font-semibold text-ink">{d.experienceYears} Years ({d.surgeriesPerformed}+ surgeries)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block uppercase">Audited Complication</span>
                          <span className="font-semibold text-emerald-700">{pct(d.auditedComplicationRate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                      <span className="text-muted">Notice: ~{d.availableDaysNotice} days</span>
                      <Link href={`/hospitals/${d.hospitalId}`} className="text-teal font-semibold hover:underline">
                        Hospital details &amp; booking →
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
