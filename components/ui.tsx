import { COUNTRIES, usd, type Hospital, type Tier } from "@/lib/data";
import type { TrueCost } from "@/lib/engine";

const TIER_LABEL: Record<Tier, string> = { Platinum: "Platinum", Gold: "Gold", Verified: "Entry" };

const TIER_STYLE: Record<Tier, string> = {
  Platinum: "bg-ink text-white",
  Gold: "bg-gold/15 text-gold border border-gold/40",
  Verified: "bg-mint text-deep",
};

export function TierBadge({ tier, steps }: { tier: Tier; steps?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_STYLE[tier]}`}
      title="Illustrative sample tier. No real audit has taken place."
    >
      {TIER_LABEL[tier]} tier
      {steps ? <span className="opacity-70 font-normal">{steps}/6 sample</span> : null}
    </span>
  );
}

export function HospitalMark({ h, size = "size-11" }: { h: Hospital; size?: string }) {
  const initials = h.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  return (
    <span
      className={`${size} shrink-0 grid place-items-center rounded-xl font-display text-white text-sm`}
      style={{ background: `linear-gradient(135deg, hsl(${h.hue} 45% 34%), hsl(${h.hue + 30} 50% 24%))` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Place({ h }: { h: Hospital }) {
  const c = COUNTRIES[h.country];
  return (
    <span className="text-sm text-muted">
      {c.flag} {h.city}, {c.name}
    </span>
  );
}

export const LINE_COLORS: Record<string, string> = {
  procedure: "#0b6b63",
  flights: "#4a9b8f",
  stay: "#8cc4b6",
  living: "#c3dfd4",
  visa: "#d8c9a8",
  fee: "#b7a37a",
  risk: "#d9552f",
};

/** Stacked bar of every cost line, scaled against `max` so bars are comparable. */
export function CostBar({ cost, max }: { cost: TrueCost; max: number }) {
  return (
    <div
      className="flex h-3.5 w-full overflow-hidden rounded-full bg-sand"
      role="img"
      aria-label={`Total ${usd(cost.total)}, of which complication buffer ${usd(cost.riskReserve)}`}
    >
      {cost.lines.map((l) => (
        <span
          key={l.key}
          title={`${l.label}: ${usd(l.amount)}`}
          style={{ width: `${(l.amount / max) * 100}%`, background: LINE_COLORS[l.key] }}
        />
      ))}
    </div>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-tight max-w-3xl">{title}</h1>
      {children ? <p className="mt-4 max-w-2xl text-muted text-lg">{children}</p> : null}
    </div>
  );
}

export function Disclaimer({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted border-l-2 border-line pl-3">{children}</p>;
}
