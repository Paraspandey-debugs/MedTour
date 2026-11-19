"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/match", label: "Care Passport" },
  { href: "/hospitals", label: "Hospitals & Doctors" },
  { href: "/cost", label: "TrueCost" },
  { href: "/journey", label: "Journey" },
  { href: "/coordinator", label: "24/7 Concierge" },
  { href: "/security", label: "Security & Escrow" },
  { href: "/loyalty", label: "Offers & Loyalty" },
  { href: "/partners", label: "Partners" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid place-items-center size-8 rounded-full bg-teal text-white" aria-hidden>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="font-display text-xl tracking-tight">MedTour</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 text-[13px]">
          {LINKS.map((l) => {
            const active = path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-2.5 py-1 ${active ? "bg-mint text-deep font-semibold" : "text-muted hover:text-ink"}`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/defense"
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              path.startsWith("/defense") ? "bg-coral text-white" : "bg-blush text-coral hover:bg-coral hover:text-white"
            } transition-colors ml-1`}
          >
            Defense Dossier
          </Link>
          <Link href="/match" className="btn btn-primary ml-1 !py-1.5 !px-3 text-xs">Analyse Report</Link>
        </nav>
        <button
          className="lg:hidden btn btn-ghost !px-3 !py-2"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-line bg-paper px-4 py-3 grid gap-1 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-mint">
              {l.label}
            </Link>
          ))}
          <Link
            href="/defense"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 bg-blush text-coral font-bold mt-1"
          >
            ★ Academic Defense Dossier (Group 19)
          </Link>
        </nav>
      )}
    </header>
  );
}
