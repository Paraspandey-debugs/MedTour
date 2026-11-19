"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { COUNTRIES, DOCTORS, HOMES, HOSPITALS, TREATMENTS, hospitalById, offers, pct, priceAt, treatmentById, usd, type HomeId, type Tier, type Hospital, type Doctor } from "@/lib/data";
import { getHospitals, getDoctors } from "@/lib/supabase/db";
import { complicationAt, trueCost } from "@/lib/engine";
import { CostBar, HospitalMark, PageHead, Place, TierBadge } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

const SMART_SEARCH_PRESETS = [
  "Knee replacement in India under $10,000 with JCI",
  "Heart bypass in Singapore with lowest complication rate",
  "Gastric sleeve in Turkey with TEMOS accreditation",
];

type SortKey = "cost" | "rating" | "trip";

export default function HospitalsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 text-muted">Loading hospitals…</div>}>
      <HospitalsInner />
    </Suspense>
  );
}

function HospitalsInner() {
  const params = useSearchParams();
  const initialProcedure = TREATMENTS.some((x) => x.id === params.get("procedure")) ? (params.get("procedure") as string) : "all";
  const initialHome = (Object.keys(HOMES) as HomeId[]).includes(params.get("from") as HomeId) ? (params.get("from") as HomeId) : "US";
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>(HOSPITALS);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(DOCTORS);
  const [viewMode, setViewMode] = useState<"hospitals" | "doctors">("hospitals");
  const [q, setQ] = useState("");
  const [tid, setTid] = useState(initialProcedure);
  const [homeId, setHomeId] = useState<HomeId>(initialHome);
  const [companion, setCompanion] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("cost");
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbNotice, setDbNotice] = useState<string | null>(null);
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
        setDbNotice("Showing built-in sample listings.");
      } finally {
        setLoadingDb(false);
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
  });

  const home = HOMES[homeId];
  const costOpts = { companion, riskMultiplier: 1.0 };
  const withCost = list.map((h) => ({ h, cost: t ? trueCost(t, h, home, costOpts) : null }));
  const key: SortKey = !t && sortKey !== "rating" ? "rating" : sortKey;
  withCost.sort((a, b) => {
    if (key === "cost" && a.cost && b.cost) return a.cost.total - b.cost.total;
    if (key === "trip" && a.cost && b.cost) return a.cost.tripDays - b.cost.tripDays || a.cost.total - b.cost.total;
    return b.h.rating - a.h.rating;
  });
  const maxTotal = Math.max(1, ...withCost.map((x) => x.cost?.total ?? 0));

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
      <PageHead eyebrow="Compare hospitals" title={t ? `${t.name}: total trip cost` : "Compare hospitals by total trip cost"}>
        {t
          ? `Ranked by what the whole trip would cost from ${home.name}: procedure, flights, recovery stay, visa and a complication buffer.`
          : "Choose a procedure and where you live to see the total trip cost for each hospital."}
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-5"><MedicalDisclaimer /></div>

        {/* PRIMARY CONTROLS */}
        <div className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
          <div>
            <label className="label" htmlFor="t">Procedure</label>
            <select id="t" className="field" value={tid} onChange={(e) => setTid(e.target.value)}>
              <option value="all">Choose a procedure…</option>
              {TREATMENTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="home">I live in</label>
            <select id="home" className="field" value={homeId} onChange={(e) => setHomeId(e.target.value as HomeId)}>
              {Object.values(HOMES).map((x) => <option key={x.id} value={x.id}>{x.flag} {x.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="c">Country to visit</label>
            <select id="c" className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="all">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sort">Sort by</label>
            <select id="sort" className="field" value={key} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              <option value="cost" disabled={!t}>Lowest total cost{!t ? " (choose a procedure)" : ""}</option>
              <option value="rating">Highest rating</option>
              <option value="trip" disabled={!t}>Shortest trip{!t ? " (choose a procedure)" : ""}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2 lg:col-span-4 min-h-11">
            <input type="checkbox" checked={companion} onChange={(e) => setCompanion(e.target.checked)} className="size-4" />
            I am travelling with a companion (adds their flights, stay and meals)
          </label>
        </div>

        {!t && (
          <div className="mb-5 rounded-xl border border-sand bg-mint/50 px-4 py-3 text-sm text-ink" role="status">
            Choose a procedure above to see the total trip cost for each hospital.
          </div>
        )}
        {dbNotice && <p className="mb-3 text-xs text-muted" role="status">{dbNotice}</p>}

        <details className="card p-4 mb-5">
          <summary className="cursor-pointer text-sm font-semibold text-ink min-h-11 flex items-center">Advanced: natural-language search and extra filters</summary>
          <div className="mt-4 space-y-4">
        {/* AI SMART SEARCH BANNER */}
        <div className="rounded-xl p-4 bg-cream border border-sand">
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
                  <span>Searching…</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Smart search</span>
                </>
              )}
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted text-[11px] font-medium mr-1">Try:</span>
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
                <span><b>Filter applied:</b> {aiExplanation}</span>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="q">Keyword</label>
              <input id="q" className="field" placeholder="Hospital, city, specialty" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="v">Sample tier</label>
              <select id="v" className="field" value={tier} onChange={(e) => setTier(e.target.value as "all" | Tier)}>
                <option value="all">Any tier</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Verified">Entry</option>
              </select>
            </div>
          </div>
          </div>
        </details>

        {/* LIST TABS */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("hospitals")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                viewMode === "hospitals" ? "bg-teal text-white" : "bg-white border border-line text-muted hover:text-ink"
              }`}
            >
              Hospitals ({withCost.length})
            </button>
            <button
              onClick={() => setViewMode("doctors")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                viewMode === "doctors" ? "bg-teal text-white" : "bg-white border border-line text-muted hover:text-ink"
              }`}
            >
              Specialists ({filteredDoctors.length})
            </button>
          </div>
          <p className="text-xs text-muted">
            {viewMode === "hospitals"
              ? t ? `Offering ${t.short.toLowerCase()}, ${key === "cost" ? "lowest total cost first" : key === "trip" ? "shortest trip first" : "highest rating first"}` : "Highest rating first"
              : "Sample specialist profiles"}
          </p>
        </div>

        {viewMode === "hospitals" ? (
          loadingDb ? (
            <ul className="mt-6 grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading hospitals">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="card p-5 h-56 animate-pulse bg-sand/40" />
              ))}
            </ul>
          ) : withCost.length === 0 ? (
            <div className="card mt-6 p-10 text-center">
              <p className="font-display text-xl">No hospitals match those criteria</p>
              <p className="mt-1 text-sm text-muted">Try a different country or clear the filters.</p>
              <button className="btn btn-ghost mt-4 min-h-11" onClick={clearAllFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {withCost.map(({ h, cost }, idx) => {
                const price = t ? priceAt(h, t) : null;
                const cr = t ? complicationAt(h, t, 1.0) : null;
                const detailHref = t ? `/hospitals/${h.id}?procedure=${t.id}&from=${homeId}` : `/hospitals/${h.id}`;
                return (
                  <li key={h.id} className="card p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <HospitalMark h={h} />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Link href={detailHref} className="font-semibold hover:text-teal">
                                {h.name}
                              </Link>
                              {t && key === "cost" && idx === 0 && (
                                <span className="text-[10px] font-semibold text-deep bg-mint rounded px-1.5 py-0.5">Lowest total cost</span>
                              )}
                              <span className="text-[10px] font-medium text-muted border border-sand rounded px-1.5 py-0.5">Sample listing</span>
                            </div>
                            <Place h={h} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="num font-bold text-sm">★ {h.rating.toFixed(2)}</p>
                          <p className="text-[11px] text-muted">{h.reviews} sample reviews</p>
                        </div>
                      </div>

                      {cost ? (
                        <div className="mt-4">
                          <p className="text-xs text-muted">Estimated total trip cost</p>
                          <p className="font-serif text-3xl num leading-tight">{usd(cost.total)}</p>
                          <div className="mt-2"><CostBar cost={cost} max={maxTotal} /></div>
                          <p className="mt-2 text-xs text-muted">
                            Hospital price {usd(cost.sticker)} · about {cost.tripDays} days abroad · wait at home ~{home.waitWeeks} weeks
                          </p>
                          <details className="mt-2 text-xs">
                            <summary className="cursor-pointer font-semibold text-teal min-h-8 flex items-center">Cost breakdown</summary>
                            <ul className="mt-1 space-y-1">
                              {cost.lines.map((l) => (
                                <li key={l.key} className="flex justify-between gap-3">
                                  <span className="text-muted">{l.key === "risk" ? "Complication buffer" : l.label}</span>
                                  <span className="num font-medium">{usd(l.amount)}</span>
                                </li>
                              ))}
                              <li className="flex justify-between gap-3 border-t border-line pt-1 font-semibold">
                                <span>Total</span><span className="num">{usd(cost.total)}</span>
                              </li>
                            </ul>
                          </details>
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-muted">{h.specialties.join(" · ")}. Choose a procedure to see the total cost.</p>
                      )}

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
                      <p className="text-xs text-muted">
                        {price && cr ? `Complication rate ${pct(cr)} (sample)` : "Sample data"}
                      </p>
                      <Link href={detailHref} className="btn btn-primary !py-1.5 !px-4 text-xs min-h-11">
                        View &amp; request quote →
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
                            <span className="text-xs bg-sand text-muted font-semibold px-2 py-0.5 rounded-full">
                              Sample profile
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
                          <span className="text-[10px] text-muted block uppercase">Complication rate (sample)</span>
                          <span className="font-semibold text-emerald-700">{pct(d.auditedComplicationRate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                      <span className="text-muted">Notice: ~{d.availableDaysNotice} days</span>
                      <Link href={`/hospitals/${d.hospitalId}`} className="text-teal font-semibold hover:underline">
                        Hospital details &amp; quote →
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
