"use client";

import { useState } from "react";

export default function Faq({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="card divide-y divide-sand overflow-hidden">
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm sm:text-base font-semibold text-ink hover:bg-cream/70 transition-colors"
              >
                {q}
                <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-full bg-mint text-deep transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
            </h3>
            <div id={`faq-${i}`} role="region" className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-muted leading-relaxed max-w-2xl">{a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
