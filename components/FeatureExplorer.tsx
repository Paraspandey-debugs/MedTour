"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { FEATURE_GROUPS, STATUS_STYLE } from "@/lib/features";
import FeatureIcon from "@/components/Icons";

/** Tabbed feature outline: pick a group, then a feature, and see what it does. */
export default function FeatureExplorer() {
  const uid = useId();
  const [gi, setGi] = useState(0);
  const [fi, setFi] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const group = FEATURE_GROUPS[gi];
  const feature = group.features[Math.min(fi, group.features.length - 1)];

  function pickGroup(i: number) {
    setGi(i);
    setFi(0);
  }

  function onKey(e: React.KeyboardEvent, i: number) {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % FEATURE_GROUPS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + FEATURE_GROUPS.length) % FEATURE_GROUPS.length;
    else return;
    e.preventDefault();
    pickGroup(next);
    tabsRef.current[next]?.focus();
  }

  return (
    <div className="card overflow-hidden shadow-[0_20px_50px_-30px_rgba(11,70,63,0.35)]">
      <div role="tablist" aria-label="Feature groups" className="flex overflow-x-auto border-b border-sand bg-cream/60">
        {FEATURE_GROUPS.map((g, i) => (
          <button
            key={g.id}
            ref={(el) => {
              tabsRef.current[i] = el;
            }}
            role="tab"
            id={`${uid}-tab-${g.id}`}
            aria-selected={i === gi}
            aria-controls={`${uid}-panel`}
            tabIndex={i === gi ? 0 : -1}
            onClick={() => pickGroup(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative whitespace-nowrap px-5 py-3.5 text-sm font-semibold transition-colors ${
              i === gi ? "text-tealBrand" : "text-muted hover:text-ink"
            }`}
          >
            {g.label}
            <span
              className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-tealBrand transition-transform duration-300 origin-left ${
                i === gi ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${group.id}`} className="grid md:grid-cols-[minmax(0,17rem)_1fr]">
        <div key={group.id} className="border-b md:border-b-0 md:border-r border-sand p-3 sm:p-4 fade-up">
          <p className="px-2 pb-2 text-xs text-muted">{group.blurb}</p>
          <ul className="space-y-1">
            {group.features.map((f, i) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setFi(i)}
                  aria-pressed={i === fi}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                    i === fi ? "bg-mint text-deep font-semibold" : "text-ink hover:bg-cream"
                  }`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${i === fi ? "bg-tealBrand text-white" : "bg-sand/70 text-tealBrand"}`}>
                    <FeatureIcon name={f.icon} className="size-4" />
                  </span>
                  <span className="leading-tight">{f.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div key={feature.id} className="p-5 sm:p-8 fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[feature.status]}`}>{feature.status}</span>
            <span className="text-xs text-muted">{feature.note}</span>
          </div>
          <h3 className="mt-3 font-serif text-3xl text-ink">{feature.title}</h3>
          <p className="mt-1 text-tealBrand font-medium">{feature.tagline}</p>
          <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed max-w-xl">{feature.description}</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {feature.highlights.map((h, i) => (
              <li key={h} className="flex items-start gap-2 text-sm text-ink fade-up" style={{ animationDelay: `${80 + i * 60}ms` }}>
                <svg viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-tealBrand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
                {h}
              </li>
            ))}
          </ul>
          <Link href={feature.href} className="btn btn-primary mt-7 min-h-11 group">
            {feature.cta}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
