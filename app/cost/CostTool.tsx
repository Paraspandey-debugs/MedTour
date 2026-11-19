"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { HOMES, HOSPITALS, TREATMENTS, homeById, offers, pct, treatmentById, usd, type HomeId } from "@/lib/data";
import { trueCost } from "@/lib/engine";
import { CostBar, Disclaimer, HospitalMark, LINE_COLORS, Place, TierBadge } from "@/components/ui";

export default function CostTool() {
  const sp = useSearchParams();
  const [tid, setTid] = useState(treatmentById(sp.get("t")).id as string);
  const [home, setHome] = useState<HomeId>(homeById(sp.get("home")).id);
  const [companion, setCompanion] = useState(sp.get("c") !== "0");
  const [premium, setPremium] = useState(false);
  const [risk, setRisk] = useState(() => Math.min(2.5, Math.max(1, parseFloat(sp.get("risk") ?? "1") || 1)));
  const [open, setOpen] = useState<string | null>(sp.get("h"));

  const t = treatmentById(tid);
  const h0 = HOMES[home];
  const rows = useMemo(() => {
    const all = HOSPITALS.filter((h) => offers(h, t)).map((h) => ({
      h, cost: trueCost(t, h, h0, { companion, riskMultiplier: risk, premium }),
    }));
    const bySticker = [...all].sort((a, b) => a.cost.sticker - b.cost.sticker).map((r) => r.h.id);
    return all
      .sort((a, b) => a.cost.total - b.cost.total)
      .map((r, i) => ({ ...r, rank: i + 1, stickerRank: bySticker.indexOf(r.h.id) + 1 }));
  }, [t, h0, companion, risk, premium]);

  const homeTotal = rows[0]?.cost.homeTotal ?? 0;
  const max = Math.max(homeTotal, ...rows.map((r) => r.cost.total));
  const reshuffled = rows.filter((r) => r.rank !== r.stickerRank).length;
  const q = (id: string) => `t=${tid}&home=${home}&risk=${risk.toFixed(2)}&c=${companion ? 1 : 0}&h=${id}`;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="card p-5 self-start lg:sticky lg:top-20 space-y-4">
        <div>
          <label className="label" htmlFor="t">Procedure</label>
          <select id="t" className="field" value={tid} onChange={(e) => setTid(e.target.value)}>
            {TREATMENTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="home">Travelling from</label>
          <select id="home" className="field" value={home} onChange={(e) => setHome(e.target.value as HomeId)}>
            {Object.values(HOMES).map((x) => <option key={x.id} value={x.id}>{x.flag} {x.name}</option>)}
          </select>
        </div>
        <div>
          <div className="flex justify-between">
            <label className="label" htmlFor="risk">Personal risk multiplier</label>
            <span className="text-sm font-semibold text-coral num">{risk.toFixed(2)}×</span>
          </div>
          <input id="risk" type="range" min={1} max={2.5} step={0.05} value={risk} onChange={(e) => setRisk(+e.target.value)} className="w-full" />
          <p className="text-[11px] text-muted">
            1.00× is an average patient. <Link href="/match" className="text-teal underline">Analyse a report</Link> to set this from your own results.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={companion} onChange={(e) => setCompanion(e.target.checked)} className="size-4 accent-teal" />
          Travelling with a companion
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} className="size-4 accent-teal" />
          MedTour Plus member (fee waived)
        </label>
        <div className="pt-3 border-t border-line grid gap-1.5 text-xs">
          {rows[0]?.cost.lines.map((l) => (
            <span key={l.key} className="flex items-center gap-2">
              <i className="size-2.5 rounded-sm" style={{ background: LINE_COLORS[l.key] }} />
              {l.label}
            </span>
          ))}
        </div>
      </aside>

      <section>
        {/* NEW USER HELPER CALLOUT */}
        <div className="rounded-2xl border border-sand bg-surface p-5 sm:p-6 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal bg-mint px-2.5 py-0.5 rounded-full">
              Patient Guide to TrueCost
            </span>
            <span className="text-xs text-muted">
              Home baseline: {h0.name} ({usd(homeTotal)})
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-ink">
            Why TrueCost is Different from Traditional Comparison Sites
          </h3>
          <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
            Other sites show only the hospital&apos;s sticker price, hiding flights, recovery hotel stays, companion expenses,
            and the financial cost of managing complications. TrueCost accounts for everything:
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-sand/30 border border-line">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <i className="size-2 rounded-full" style={{ background: LINE_COLORS.procedure }} />
                1. Procedure Package
              </span>
              <p className="text-muted mt-1">Price-locked hospital quote: surgeon, operating theatre, implants, and inpatient stay.</p>
            </div>
            <div className="p-3 rounded-xl bg-sand/30 border border-line">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <i className="size-2 rounded-full" style={{ background: LINE_COLORS.stay }} />
                2. Travel &amp; Recovery
              </span>
              <p className="text-muted mt-1">Flights, partner recovery hotel, meals, companion costs, and medical visa turnaround.</p>
            </div>
            <div className="p-3 rounded-xl bg-sand/30 border border-line">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <i className="size-2 rounded-full" style={{ background: LINE_COLORS.risk }} />
                3. Risk Reserve
              </span>
              <p className="text-muted mt-1">Not an upfront charge! An actuarial cushion so you know the realistic financial buffer if extra care is needed.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-ink text-white p-5 sm:p-6 mb-4">
          <p className="text-sm text-white/70">What sticker price hides</p>
          <p className="mt-1 font-display text-2xl sm:text-3xl">
            {reshuffled > 0
              ? `${reshuffled} of ${rows.length} hospitals change position once risk and travel are priced in.`
              : "For this profile, sticker order and TrueCost order agree."}
          </p>
          <p className="mt-2 text-sm text-white/70">
            Drag the risk slider: as personal risk rises, low-complication hospitals climb the ranking.
          </p>
        </div>

        <ol className="space-y-3">
          {rows.map(({ h, cost, rank, stickerRank }) => {
            const isOpen = open === h.id;
            const move = stickerRank - rank;
            return (
              <li key={h.id} className={`card p-4 sm:p-5 ${rank === 1 ? "ring-2 ring-teal" : ""}`}>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-display text-2xl text-muted num w-7">{rank}</span>
                  <HospitalMark h={h} size="size-10" />
                  <div className="flex-1 min-w-48">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/hospitals/${h.id}`} className="font-semibold hover:text-teal">{h.name}</Link>
                      <TierBadge tier={h.tier} />
                    </div>
                    <Place h={h} />
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl num leading-tight">{usd(cost.total)}</p>
                    <p className="text-[11px] text-muted num">
                      sticker {usd(cost.sticker)} (#{stickerRank})
                      {move !== 0 && (
                        <span className={`ml-1 font-semibold ${move > 0 ? "text-teal" : "text-coral"}`}>
                          {move > 0 ? `▲ ${move}` : `▼ ${-move}`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-3"><CostBar cost={cost} max={max} /></div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <span className="num">
                    Your complication risk <b className="text-ink">{pct(cost.complication)}</b> · risk reserve{" "}
                    <b className="text-coral">{usd(cost.riskReserve)}</b> · {cost.tripDays} days abroad
                  </span>
                  <button onClick={() => setOpen(isOpen ? null : h.id)} aria-expanded={isOpen} className="text-teal font-semibold hover:underline">
                    {isOpen ? "Hide breakdown" : "Itemised breakdown"}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-line">
                    <table className="w-full text-sm">
                      <tbody>
                        {cost.lines.map((l) => (
                          <tr key={l.key} className="border-b border-line/60">
                            <td className="py-2">
                              <span className="flex items-center gap-2 font-medium">
                                <i className="size-2.5 rounded-sm shrink-0" style={{ background: LINE_COLORS[l.key] }} />
                                {l.label}
                              </span>
                              <span className="block text-xs text-muted pl-[18px]">{l.hint}</span>
                            </td>
                            <td className="py-2 text-right num align-top">{usd(l.amount)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td className="py-2 font-semibold">TrueCost</td>
                          <td className="py-2 text-right num font-semibold">{usd(cost.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm">
                        {cost.saving > 0
                          ? <>Saves <b className="text-teal num">{usd(cost.saving)}</b> ({Math.round((cost.saving / cost.homeTotal) * 100)}%) against treatment at home.</>
                          : <>Costs <b className="text-coral num">{usd(-cost.saving)}</b> more than treatment at home.</>}
                      </p>
                      <Link href={`/journey?${q(h.id)}`} className="btn btn-primary !py-2">Plan this journey</Link>
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          <li className="card p-4 sm:p-5 bg-sand/50">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-2xl w-7">{h0.flag}</span>
              <div className="flex-1 min-w-48">
                <p className="font-semibold">Private treatment at home</p>
                <p className="text-sm text-muted">{h0.name} · typical wait {h0.waitWeeks} weeks</p>
              </div>
              <p className="font-display text-2xl num">{usd(homeTotal)}</p>
            </div>
            <div className="mt-3 flex h-3.5 w-full overflow-hidden rounded-full bg-sand">
              <span style={{ width: `${(t.homeCost[home] / max) * 100}%`, background: "#10292c" }} />
              <span style={{ width: `${((homeTotal - t.homeCost[home]) / max) * 100}%`, background: LINE_COLORS.risk }} />
            </div>
            <p className="mt-2 text-xs text-muted">The same risk reserve is applied at home, using the platform-average complication rate.</p>
          </li>
        </ol>

        <div className="mt-5">
          <Disclaimer>
            Risk reserve = hospital complication rate × your risk multiplier × cost of managing a
            complication. It is an expected value, not a charge: MedTour uses it to rank fairly and to
            size the complication insurance. All figures are illustrative.
          </Disclaimer>
        </div>
      </section>
    </div>
  );
}
