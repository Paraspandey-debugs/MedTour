"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHead, Disclaimer } from "@/components/ui";
import { SPECIAL_PACKAGES, TREATMENTS, hospitalById, usd } from "@/lib/data";
import { calculateHealthMiles } from "@/lib/engine";

export default function LoyaltyPage() {
  const [procedureCost, setProcedureCost] = useState(12000);
  const [isPlus, setIsPlus] = useState(false);
  const [activeTab, setActiveTab] = useState<"loyalty" | "offers" | "reviews">("offers");

  const miles = calculateHealthMiles(procedureCost, 1.0, isPlus);

  return (
    <>
      <PageHead
        eyebrow="User Engagement &amp; Trust"
        title="MedTour HealthMiles, Special Offers &amp; Verified Trust"
      >
        Rewarding patients across their lifetime recovery journey while ensuring every review and special
        offer is anchored in audited clinical transparency.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-line pb-4 mb-8">
          <button
            onClick={() => setActiveTab("offers")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "offers"
                ? "bg-teal text-white"
                : "bg-white border border-line text-muted hover:text-ink"
            }`}
          >
            Curated Special Offers ({SPECIAL_PACKAGES.length})
          </button>
          <button
            onClick={() => setActiveTab("loyalty")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "loyalty"
                ? "bg-teal text-white"
                : "bg-white border border-line text-muted hover:text-ink"
            }`}
          >
            HealthMiles Rewards Calculator
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "reviews"
                ? "bg-teal text-white"
                : "bg-white border border-line text-muted hover:text-ink"
            }`}
          >
            Discharge-Verified Reviews
          </button>
        </div>

        {/* Tab 1: Special Curated Offers */}
        {activeTab === "offers" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {SPECIAL_PACKAGES.map((pkg) => {
                const hosp = hospitalById(pkg.hospitalId)!;
                const treatment = TREATMENTS.find((t) => t.id === pkg.treatmentId)!;
                return (
                  <div
                    key={pkg.id}
                    className="card p-6 flex flex-col justify-between hover:border-teal transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-coral text-white px-2.5 py-0.5 rounded-full">
                          {pkg.badge}
                        </span>
                        <span className="text-xs text-muted font-medium">
                          Expires in {pkg.expiresInDays}d
                        </span>
                      </div>

                      <h3 className="font-display text-xl mt-3 leading-snug">{pkg.title}</h3>
                      <p className="text-xs text-teal font-semibold mt-1">
                        {hosp.name} · {hosp.city}
                      </p>

                      <div className="mt-4 rounded-xl bg-sand/40 p-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted">Special Offer Saving</span>
                          <span className="font-display text-2xl text-coral font-bold num">
                            {pkg.discountPct}% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-muted mt-1">Applied directly to hospital package price</p>
                      </div>

                      <ul className="mt-4 space-y-2 text-xs">
                        {pkg.perks.map((perk, i) => (
                          <li key={i} className="flex items-start gap-2 text-ink/90">
                            <span className="text-teal font-bold">✓</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-line">
                      <Link
                        href={`/journey?h=${hosp.id}&t=${treatment.id}`}
                        className="btn btn-primary w-full text-xs"
                      >
                        Claim Offer &amp; Plan Journey →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card p-6 bg-paper mt-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-display text-xl">Hospital &amp; Hotel Partner Bundling</h4>
                <p className="mt-1 text-xs text-muted max-w-xl">
                  Unlike conventional aggregator discounts, MedTour partner offers are negotiated directly
                  with JCI-accredited surgical institutes and 5-star step-down recovery suites.
                </p>
              </div>
              <Link href="/cost" className="btn btn-ghost text-xs">
                Compare Against Base TrueCost
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: HealthMiles Calculator */}
        {activeTab === "loyalty" && (
          <div className="card p-6 sm:p-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="eyebrow">Patient Loyalty Programme</p>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">
                Earn HealthMiles on Every Procedure
              </h2>
              <p className="mt-2 text-sm text-muted">
                HealthMiles never expire. Redeem them toward partner recovery hotel upgrades, companion flight
                subsidies, or annual tele-consultation check-ins with your international surgeon.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="cost-slider" className="label font-semibold">
                      Estimated Procedure Budget
                    </label>
                    <span className="font-display text-xl text-teal num">{usd(procedureCost)}</span>
                  </div>
                  <input
                    id="cost-slider"
                    type="range"
                    min={3000}
                    max={35000}
                    step={500}
                    value={procedureCost}
                    onChange={(e) => setProcedureCost(+e.target.value)}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>$3,000</span>
                    <span>$18,000</span>
                    <span>$35,000</span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isPlus}
                      onChange={(e) => setIsPlus(e.target.checked)}
                      className="size-4 accent-teal"
                    />
                    <span>
                      MedTour Plus Member (<b>+50% Miles Bonus</b> &amp; Priority Concierge)
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-line space-y-2 text-xs">
                  <p className="font-semibold text-ink">How HealthMiles are Earned:</p>
                  <div className="flex justify-between">
                    <span className="text-muted">Base Points (1 pt per $2 spent)</span>
                    <span className="num font-semibold">{miles.baseMiles.toLocaleString()} pts</span>
                  </div>
                  {isPlus && (
                    <div className="flex justify-between text-teal">
                      <span>MedTour Plus Bonus (50%)</span>
                      <span className="num font-semibold">+{miles.plusBonus.toLocaleString()} pts</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted">
                    <span>Verified Day-30 Post-Op Review Bonus</span>
                    <span className="num font-semibold">+{miles.reviewBonus} pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Reward Card */}
            <div className="rounded-2xl bg-deep text-white p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-mint font-bold">
                    Projected Rewards Balance
                  </span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/80">
                    {isPlus ? "Platinum Tier" : "Silver Tier"}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="font-display text-4xl sm:text-5xl text-mint num">
                    {miles.totalMiles.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/60 mt-1">Total MedTour HealthMiles Earned</p>
                </div>

                <div className="mt-6 rounded-xl bg-white/10 p-3.5 border border-white/10">
                  <p className="text-xs text-white/80">Redemption Credit Value:</p>
                  <p className="font-display text-2xl text-white num mt-0.5">
                    {usd(miles.cashEquivalent)} USD
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">
                    Applicable to recovery hotel suites, lounge access, or future follow-ups.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <Link href="/partners#plans" className="btn btn-primary !bg-mint !text-deep w-full text-xs">
                  Upgrade to MedTour Plus ($19/mo) →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Verified Reviews System */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="card p-6 bg-sand/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl">Discharge-Verified Review Ledger</h3>
                  <p className="text-xs text-muted mt-1">
                    Unlike review sites prone to astroturfing, MedTour reviews require an unforgeable
                    cryptographic hash signed by the treating hospital upon clinical discharge.
                  </p>
                </div>
                <span className="text-xs bg-mint text-deep font-semibold px-3 py-1 rounded-full">
                  100% Anti-Astroturfing Guarantee
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  patient: "David K., 54 (Manchester, UK)",
                  procedure: "Coronary Artery Bypass (CABG)",
                  hospital: "Aravali Heart & Joint Institute, New Delhi",
                  rating: 5,
                  date: "October 2026",
                  text: "Had severe angina and a 20-week wait on the NHS. MedTour coordinated Dr. Sharma at Aravali. The TrueCost was exactly what I paid - no hidden ICU extras. What gave my family total peace of mind was that 15% of the bill was held until my day-30 check back home.",
                  hash: "0x89f2...c81b (NABH Verified Discharge)",
                },
                {
                  patient: "Sarah M., 42 (Calgary, Canada)",
                  procedure: "Laparoscopic Gastric Sleeve",
                  hospital: "Baja Pacific Surgical, Tijuana",
                  rating: 5,
                  date: "September 2026",
                  text: "The Fit-to-Fly gate refused to let me fly home on day 5 because of my high BMI and risk score. At first I was frustrated, but the team explained the leak risk. I stayed 3 extra days at the ocean recovery hotel. That medical gate literally protected my health.",
                  hash: "0x34e1...99a0 (CSG Mexico Verified Discharge)",
                },
              ].map((rev, idx) => (
                <div key={idx} className="card p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{rev.patient}</p>
                        <p className="text-xs text-muted">{rev.procedure}</p>
                      </div>
                      <span className="text-xs font-bold text-teal bg-mint px-2 py-0.5 rounded">
                        ★ {rev.rating}.0
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-ink/90 leading-relaxed italic">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line text-xs">
                    <p className="font-medium text-teal">{rev.hospital}</p>
                    <p className="text-[10px] font-mono text-muted mt-0.5">
                      LEDGER PROOF: {rev.hash} · {rev.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-12">
        <Disclaimer>
          HealthMiles loyalty rewards are governed by MedTour Healthcare Terms. Special package discounts
          are contractually committed by partner institutions under 90-day price locks.
        </Disclaimer>
      </div>
    </>
  );
}
