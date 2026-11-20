"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DESTINATION_GUIDES,
  calculateConvalescenceBudget,
  type DestinationGuide,
} from "@/lib/tourism";
import { usd } from "@/lib/data";

const VIBES = [
  "All",
  "Tropical Recovery",
  "Heritage & Culture",
  "Modern Luxury",
  "Scenic Seafront",
  "Quick Cross-Border",
] as const;

export default function TourismExplorer() {
  const [selectedVibe, setSelectedVibe] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeGuide, setActiveGuide] = useState<DestinationGuide | null>(null);
  const [activeTab, setActiveTab] = useState<"stays" | "companion" | "visa" | "practical">("stays");

  // Convalescence Budget Calculator State
  const [calcDestId, setCalcDestId] = useState<string>("bangkok");
  const [calcDays, setCalcDays] = useState<number>(7);
  const [calcCompanion, setCalcCompanion] = useState<boolean>(true);
  const [calcHotelIdx, setCalcHotelIdx] = useState<number>(0);

  // Filtered destination list
  const filteredDestinations = useMemo(() => {
    return DESTINATION_GUIDES.filter((d) => {
      const matchesVibe = selectedVibe === "All" || d.vibe === selectedVibe;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        d.city.toLowerCase().includes(q) ||
        d.countryName.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q);
      return matchesVibe && matchesQuery;
    });
  }, [selectedVibe, searchQuery]);

  // Dynamic budget calculation
  const budget = useMemo(() => {
    return calculateConvalescenceBudget({
      destinationId: calcDestId,
      recoveryDays: calcDays,
      companion: calcCompanion,
      selectedHotelIndex: calcHotelIdx,
    });
  }, [calcDestId, calcDays, calcCompanion, calcHotelIdx]);

  const selectedCalcGuide = useMemo(
    () => DESTINATION_GUIDES.find((d) => d.id === calcDestId) || DESTINATION_GUIDES[0],
    [calcDestId]
  );

  return (
    <div className="space-y-12">
      {/* Search & Vibe Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination, country, or recovery style..."
              className="field !pl-9 !py-2.5 text-sm w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-muted font-medium">
            Showing <span className="font-bold text-ink">{filteredDestinations.length}</span> destinations
          </div>
        </div>

        {/* Vibe filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {VIBES.map((vibe) => (
            <button
              key={vibe}
              type="button"
              onClick={() => setSelectedVibe(vibe)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedVibe === vibe
                  ? "bg-teal text-white shadow-xs font-semibold"
                  : "bg-white border border-line text-muted hover:text-ink hover:border-teal/40"
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>
      </section>

      {/* Destination Cards Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.id}
            className="card overflow-hidden flex flex-col justify-between hover:shadow-md transition-all border border-line hover:border-teal/50 group"
          >
            {/* Header with visual gradient */}
            <div>
              <div className={`p-5 bg-gradient-to-br ${dest.heroImageGradient} text-white relative`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{dest.flag}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-white">
                    {dest.vibe}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold mt-2 text-white">{dest.city}</h3>
                <p className="text-xs text-white/80 font-medium">{dest.countryName}</p>
              </div>

              {/* Tagline & Key Metrics */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-ink/90 leading-relaxed font-medium">{dest.tagline}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-line">
                  <div className="bg-sand/30 p-2 rounded-xl">
                    <span className="text-[10px] text-muted block uppercase font-medium">Medical Visa</span>
                    <span className="font-semibold text-ink text-xs">
                      {dest.visa.processingDays} days • {dest.visa.feeUsd === 0 ? "Free" : `$${dest.visa.feeUsd}`}
                    </span>
                  </div>
                  <div className="bg-sand/30 p-2 rounded-xl">
                    <span className="text-[10px] text-muted block uppercase font-medium">Recovery Stays</span>
                    <span className="font-semibold text-ink text-xs">
                      from ${dest.recoveryHotels[0].pricePerNight}/night
                    </span>
                  </div>
                  <div className="bg-sand/30 p-2 rounded-xl">
                    <span className="text-[10px] text-muted block uppercase font-medium">Companion Score</span>
                    <span className="font-semibold text-teal text-xs">
                      {"★".repeat(dest.companionFriendlyRating)} ({dest.companionFriendlyRating}/5)
                    </span>
                  </div>
                  <div className="bg-sand/30 p-2 rounded-xl">
                    <span className="text-[10px] text-muted block uppercase font-medium">Airport Transfer</span>
                    <span className="font-semibold text-ink text-xs">
                      {dest.practicalities.transferMinutesToMedicalDistrict} mins ({dest.practicalities.airportCode})
                    </span>
                  </div>
                </div>

                <div className="bg-mint/40 border border-teal/20 rounded-xl p-2.5 text-[11px] text-teal">
                  <span className="font-semibold">Top Recovery Experience:</span>{" "}
                  {dest.gentleActivities[0].title}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-5 pt-0 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveGuide(dest);
                  setActiveTab("stays");
                }}
                className="btn btn-secondary flex-1 !text-xs !py-2 font-semibold text-center"
              >
                Explore Tourism Guide ▾
              </button>
              <Link
                href={`/hospitals?country=${dest.countryId}`}
                className="btn btn-ghost !text-xs !py-2 border border-line text-muted hover:text-ink px-3 shrink-0"
                title="View partner hospitals in this destination"
              >
                Hospitals &rarr;
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Expanded Destination Modal / Drawer */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-line"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className={`p-6 bg-gradient-to-r ${activeGuide.heroImageGradient} text-white relative shrink-0`}>
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                aria-label="Close dialog"
              >
                ✕
              </button>

              <div className="flex items-center gap-3">
                <span className="text-4xl">{activeGuide.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      {activeGuide.city}, {activeGuide.countryName}
                    </h2>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                      {activeGuide.vibe}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-2xl">{activeGuide.tagline}</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 overflow-x-auto mt-6 pt-2 border-t border-white/20 scrollbar-none text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("stays")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === "stays" ? "bg-white text-ink shadow-xs" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  🏨 Convalescence &amp; Stays
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("companion")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === "companion" ? "bg-white text-ink shadow-xs" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  👥 Companion 5-Day Itinerary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("visa")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === "visa" ? "bg-white text-ink shadow-xs" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  🛂 Medical Visa &amp; Fast-Track
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("practical")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === "practical" ? "bg-white text-ink shadow-xs" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  🗺️ Practical Guide &amp; Transport
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-ink">
              {/* TAB 1: Convalescence & Stays */}
              {activeTab === "stays" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Vetted Convalescent Accommodations</h3>
                    <p className="text-xs text-muted mt-1">
                      Certified recovery residences with walk-in showers, companion bedding, and dedicated patient support.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {activeGuide.recoveryHotels.map((h, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-line bg-sand/20 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] bg-teal/10 text-teal font-semibold px-2 py-0.5 rounded-full">
                              {h.type}
                            </span>
                            <span className="font-bold text-sm text-ink num">${h.pricePerNight}<span className="text-[10px] text-muted font-normal">/night</span></span>
                          </div>
                          <h4 className="font-semibold text-sm text-ink mt-2">{h.name}</h4>
                          <p className="text-[11px] text-muted mt-0.5">📍 {h.distanceToHospital}</p>
                          
                          <div className="mt-3 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Patient Amenities:</span>
                            <ul className="text-[11px] text-ink/80 space-y-0.5">
                              {h.amenities.map((a, j) => (
                                <li key={j} className="flex items-center gap-1.5">
                                  <span className="text-teal font-bold">✓</span> {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCalcDestId(activeGuide.id);
                            setCalcHotelIdx(i);
                            setActiveGuide(null);
                            const el = document.getElementById("convalescence-calculator");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="btn btn-ghost !text-xs !py-1.5 border border-line text-ink hover:border-teal w-full text-center mt-2"
                        >
                          Calculate Total Stay &rarr;
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Gentle Recovery Activities for Patient */}
                  <div className="pt-4 border-t border-line space-y-3">
                    <h4 className="font-display text-lg font-semibold">Gentle Post-Op Patient Sightseeing</h4>
                    <p className="text-xs text-muted">
                      Low-strain, wheelchair-friendly activities safe for patients during the post-hospital recovery window before flight clearance.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {activeGuide.gentleActivities.map((act, i) => (
                        <div key={i} className="p-3.5 rounded-xl border border-line bg-white shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-teal bg-mint px-2 py-0.5 rounded-full">
                              {act.type}
                            </span>
                            <span className="text-[10px] text-muted font-medium">
                              {act.idealRecoveryStage}
                            </span>
                          </div>
                          <p className="font-semibold text-xs text-ink">{act.title}</p>
                          <p className="text-[11px] text-muted leading-relaxed">{act.description}</p>
                          <div className="flex gap-2 text-[10px] text-muted pt-1">
                            <span>🚶 Walking: <b>{act.walkingLevel}</b></span>
                            {act.wheelchairAccessible && <span className="text-teal font-semibold">♿ Wheelchair OK</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Companion 5-Day Itinerary */}
              {activeTab === "companion" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Companion 5-Day Care &amp; City Itinerary</h3>
                      <p className="text-xs text-muted mt-0.5">
                        Thoughtfully scheduled around hospital admission, surgery day, inpatient stay, and discharge.
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-teal/10 text-teal px-3 py-1 rounded-full self-start">
                      Companion Rating: {activeGuide.companionFriendlyRating}/5 ★
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {activeGuide.companionItinerary.map((plan) => (
                      <div key={plan.day} className="p-4 rounded-2xl border border-line bg-sand/20 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                          <div className="flex items-center gap-2">
                            <span className="size-6 rounded-full bg-teal text-white font-bold text-xs flex items-center justify-center">
                              {plan.day}
                            </span>
                            <span className="font-bold text-xs uppercase tracking-wider text-teal">
                              {plan.phase}
                            </span>
                          </div>
                          <span className="text-[11px] text-coral font-medium bg-blush px-2.5 py-0.5 rounded-full">
                            Patient: {plan.patientStatus}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-ink">{plan.title}</h4>
                          <p className="text-xs text-ink/90 mt-1 leading-relaxed">{plan.activity}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-line text-[11px] text-muted flex items-start gap-2">
                          <span className="text-amber-500 font-bold">💡 Companion Tip:</span>
                          <span>{plan.tip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Medical Visa & Fast-Track */}
              {activeTab === "visa" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Medical Visa &amp; Immigration Protocol</h3>
                    <p className="text-xs text-muted mt-1">
                      Official entry regulations, hospital invitation documents, and accompanying companion rules.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-2xl border border-line bg-sand/20 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-teal tracking-wider">Visa Type &amp; Duration</span>
                      <p className="text-sm font-semibold text-ink">{activeGuide.visa.visaType}</p>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-line">
                          <span className="text-muted">Standard Processing Time</span>
                          <span className="font-semibold text-ink">{activeGuide.visa.processingDays} business days</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-line">
                          <span className="text-muted">Government Fee</span>
                          <span className="font-semibold text-ink">
                            {activeGuide.visa.feeUsd === 0 ? "Free entry" : `$${activeGuide.visa.feeUsd} USD`}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted">Stay Validity</span>
                          <span className="font-semibold text-ink">{activeGuide.visa.validity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-line bg-sand/20 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-teal tracking-wider">Companion Attendant Quota</span>
                      <p className="text-sm font-semibold text-ink">
                        {activeGuide.visa.companionAttendantAllowed
                          ? `Up to ${activeGuide.visa.companionAttendantQuota} family attendants permitted`
                          : "Tourist visa required for companions"}
                      </p>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-line">
                          <span className="text-muted">Airport Fast-Track</span>
                          <span className="font-semibold text-teal">
                            {activeGuide.visa.fastTrackAirportImmigration ? "✓ Available" : "Standard lane"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-line">
                          <span className="text-muted">Extension at Hospital</span>
                          <span className="font-semibold text-ink">Supported by International Desk</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted">Passports Validity</span>
                          <span className="font-semibold text-ink">Minimum 6 months</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal/5 border border-teal/20 space-y-2">
                    <p className="text-xs font-semibold text-ink uppercase tracking-wider">Required Documents Summary</p>
                    <p className="text-xs text-ink/90 leading-relaxed">{activeGuide.visa.requirementsSummary}</p>
                  </div>
                </div>
              )}

              {/* TAB 4: Practical Guide & Transport */}
              {activeTab === "practical" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Local Practicalities &amp; Connectivity</h3>
                    <p className="text-xs text-muted mt-1">
                      Currency, airport distances, mobile connectivity, and local emergency helplines.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="p-3.5 rounded-xl border border-line bg-sand/20">
                      <span className="text-[10px] text-muted uppercase font-bold block">International Airport</span>
                      <p className="text-sm font-bold text-ink mt-0.5">{activeGuide.practicalities.airportCode}</p>
                      <p className="text-[11px] text-muted">{activeGuide.practicalities.airportName}</p>
                      <p className="text-[11px] text-teal font-semibold mt-1">
                        ~{activeGuide.practicalities.transferMinutesToMedicalDistrict} mins to hospital
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-line bg-sand/20">
                      <span className="text-[10px] text-muted uppercase font-bold block">Local Currency</span>
                      <p className="text-sm font-bold text-ink mt-0.5">{activeGuide.practicalities.currencyCode}</p>
                      <p className="text-[11px] text-muted">{activeGuide.practicalities.localCurrency}</p>
                      <p className="text-[11px] text-muted font-mono mt-1">{activeGuide.practicalities.usdRateApprox}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-line bg-sand/20">
                      <span className="text-[10px] text-muted uppercase font-bold block">English Fluency</span>
                      <p className="text-sm font-bold text-ink mt-0.5">{activeGuide.practicalities.englishFluencyLevel}</p>
                      <p className="text-[11px] text-muted mt-0.5">Bilingual hospital staff and dedicated translators.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-line bg-sand/20">
                      <span className="text-[10px] text-muted uppercase font-bold block">Emergency Helplines</span>
                      <p className="text-xs text-ink font-semibold mt-1">Police: {activeGuide.practicalities.emergencyPhone.police}</p>
                      <p className="text-xs text-ink font-semibold">Ambulance: {activeGuide.practicalities.emergencyPhone.ambulance}</p>
                      {activeGuide.practicalities.emergencyPhone.touristPolice && (
                        <p className="text-[10px] text-teal font-medium mt-0.5">
                          Tourist Police: {activeGuide.practicalities.emergencyPhone.touristPolice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Transport & SIM Advice */}
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div className="p-4 rounded-2xl border border-line bg-white space-y-2">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-teal">Ride-Hailing &amp; Taxis</h4>
                      <div className="flex gap-1.5 flex-wrap">
                        {activeGuide.practicalities.rideHailingApps.map((app, i) => (
                          <span key={i} className="text-xs bg-sand/40 border border-line px-2.5 py-1 rounded-lg font-medium text-ink">
                            🚗 {app}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed mt-1">
                        Use app-based hailing for transparent metered fares and credit card payments. Most hospital international wings offer private driver meet-and-greet.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-line bg-white space-y-2">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-teal">Tourist SIM &amp; Connectivity</h4>
                      <p className="text-xs text-ink/90 leading-relaxed">{activeGuide.practicalities.simCardAdvice}</p>
                      <p className="text-[11px] text-muted">
                        High-speed hospital and hotel Wi-Fi is complimentary across all accredited medical partner facilities.
                      </p>
                    </div>
                  </div>

                  {/* Climate & Healing Advice */}
                  <div className="p-4 rounded-2xl bg-sand/30 border border-line space-y-2">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-ink">Seasonal Healing Guidance</h4>
                    <p className="text-xs text-ink font-medium">Best recovery months: {activeGuide.climate.bestMonths}</p>
                    <p className="text-xs text-muted leading-relaxed">{activeGuide.climate.recoveryAdvice}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-line bg-sand/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-muted">
                Need personalized hospital matches in {activeGuide.city}?
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/hospitals?country=${activeGuide.countryId}`}
                  className="btn btn-secondary !text-xs !py-2"
                >
                  View Hospitals in {activeGuide.city}
                </Link>
                <Link
                  href={`/match`}
                  className="btn btn-primary !text-xs !py-2"
                >
                  Match with Your Prescription &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Convalescence Budget Calculator */}
      <section id="convalescence-calculator" className="card p-6 sm:p-8 space-y-6 border-2 border-teal/30 bg-teal/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
              Interactive Tourism Tool
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-2">
              Convalescence &amp; Recovery Vacation Budget Planner
            </h2>
            <p className="text-xs text-muted mt-1">
              Calculate total accommodation, companion meals, VIP airport transfers, and gentle tourism for your post-op stay.
            </p>
          </div>
          <span className="text-xs text-muted self-start sm:self-auto font-mono">
            {selectedCalcGuide.flag} {selectedCalcGuide.city}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label htmlFor="calc-destination" className="label">Destination City</label>
              <select
                id="calc-destination"
                className="field"
                value={calcDestId}
                onChange={(e) => {
                  setCalcDestId(e.target.value);
                  setCalcHotelIdx(0);
                }}
              >
                {DESTINATION_GUIDES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.flag} {d.city}, {d.countryName} ({d.vibe})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="calc-hotel" className="label">Convalescence Accommodation Tier</label>
              <select
                id="calc-hotel"
                className="field"
                value={calcHotelIdx}
                onChange={(e) => setCalcHotelIdx(+e.target.value)}
              >
                {selectedCalcGuide.recoveryHotels.map((h, i) => (
                  <option key={i} value={i}>
                    {h.name} — ${h.pricePerNight}/night ({h.type})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted mt-1">
                📍 {selectedCalcGuide.recoveryHotels[calcHotelIdx]?.distanceToHospital} • Amenities:{" "}
                {selectedCalcGuide.recoveryHotels[calcHotelIdx]?.amenities.slice(0, 3).join(", ")}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="calc-days" className="label">Post-Op Recovery Days in Destination</label>
                <span className="font-bold text-sm text-teal num">{calcDays} days</span>
              </div>
              <input
                id="calc-days"
                type="range"
                min={3}
                max={21}
                step={1}
                value={calcDays}
                onChange={(e) => setCalcDays(+e.target.value)}
                className="w-full accent-teal mt-1"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
                <span>3 days (Minimal)</span>
                <span>7 days (Standard Joint/Spine)</span>
                <span>14 days (Cardiac/Complex)</span>
                <span>21 days</span>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-ink cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={calcCompanion}
                onChange={(e) => setCalcCompanion(e.target.checked)}
                className="size-4 accent-teal rounded-sm"
              />
              Include travelling companion expenses (meals + visa)
            </label>
          </div>

          {/* Budget Output Breakdown */}
          <div className="rounded-2xl bg-white border border-line p-5 space-y-4 shadow-xs">
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Estimated Tourism Budget</p>
                <p className="text-xs text-muted mt-0.5">Post-hospital convalescence &amp; companion care</p>
              </div>
              <div className="text-right">
                <span className="font-display text-3xl font-bold text-teal num">{usd(budget.total)}</span>
                <span className="text-[10px] text-muted block uppercase">All-in USD</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink">
                  {selectedCalcGuide.recoveryHotels[calcHotelIdx]?.name} ({calcDays} nights)
                </span>
                <span className="font-semibold text-ink num">{usd(budget.hotelCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink">Patient specialized post-op nutrition</span>
                <span className="font-semibold text-ink num">{usd(budget.patientPostOpMeals)}</span>
              </div>
              {calcCompanion && (
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-ink">Companion dining &amp; daily allowance</span>
                  <span className="font-semibold text-ink num">{usd(budget.companionDailyFood)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink">Airport VIP meet-and-greet &amp; hospital transfer</span>
                <span className="font-semibold text-ink num">{usd(budget.airportConciergeTransfer)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink">
                  Medical visa fees ({calcCompanion ? "Patient + Attendant" : "Patient only"})
                </span>
                <span className="font-semibold text-ink num">{usd(budget.visaFees)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink">Gentle recovery activities &amp; river/garden passes</span>
                <span className="font-semibold text-ink num">{usd(budget.gentleActivitiesEstimate)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sand/30 border border-line text-[11px] text-muted leading-relaxed">
              💡 <b>Tip:</b> In {selectedCalcGuide.city}, recovery hotel suites cost ~80% less than Western outpatient centers, while offering dedicated nursing and companion kitchens.
            </div>

            <Link
              href={`/journey?home=US&c=${calcCompanion ? 1 : 0}`}
              className="btn btn-primary w-full text-center block !text-xs !py-2.5 font-semibold"
            >
              Build Full Surgical &amp; Travel Journey &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
