"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/app/login/actions";

export interface NavUser {
  id: string;
  email: string;
}

const PRIMARY_LINKS = [
  { href: "/match", label: "Care Passport" },
  { href: "/hospitals", label: "Hospitals & Doctors" },
  { href: "/cost", label: "TrueCost" },
  { href: "/journey", label: "Journey" },
  { href: "/coordinator", label: "24/7 Concierge" },
];

const PLATFORM_LINKS = [
  { href: "/security", label: "Security & Escrow", desc: "PHI privacy architecture & milestone payment staging" },
  { href: "/loyalty", label: "Offers & Loyalty", desc: "HealthMiles & curated partner packages" },
  { href: "/partners", label: "Partners", desc: "Hospital audit & provider onboarding" },
];

export default function Nav({ user: initialUser }: { user?: NavUser | null }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(initialUser ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setUser(initialUser ?? null);
  }, [initialUser]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
      } else {
        setUser(null);
      }
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "PT";

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-sand">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
          <span className="w-8 h-8 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-lg leading-none">
            +
          </span>
          <span className="font-serif text-2xl tracking-tight text-ink">MedTour</span>
        </Link>

        {/* Primary Navigation (Single Line, No Wrapping) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted">
          {PRIMARY_LINKS.map((link) => {
            const active = path.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap transition-colors ${
                  active ? "text-ink font-semibold" : "hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Secondary Links Grouped in Platform Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="whitespace-nowrap flex items-center gap-1 hover:text-ink transition-colors py-2"
            >
              Platform
              <svg
                className={`w-3.5 h-3.5 opacity-70 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full pt-1 w-64 z-50">
                <div className="bg-surface border border-sand rounded-2xl shadow-xl p-2 text-sm">
                  {PLATFORM_LINKS.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl hover:bg-cream transition-colors"
                    >
                      <p className="font-semibold text-ink text-xs">{p.label}</p>
                      <p className="text-[11px] text-muted leading-tight mt-0.5">{p.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/defense"
            className="hidden sm:inline-flex items-center whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full bg-terracottaSoft text-terracotta hover:bg-terracotta/15 transition-colors"
          >
            Defense Dossier
          </Link>

          {user ? (
            /* Logged in state: Show Dashboard, User Badge, Sign Out */
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className={`whitespace-nowrap text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  path === "/"
                    ? "bg-tealBrand text-white hover:bg-tealDeep shadow-sm"
                    : "bg-surface border border-sand text-ink hover:border-ink/40"
                }`}
              >
                {path === "/" ? "Go to Dashboard →" : "Dashboard"}
              </Link>

              <div
                className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-sand/50 border border-sand text-xs text-ink max-w-[160px] truncate"
                title={user.email}
              >
                <span className="size-6 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {initials}
                </span>
                <span className="truncate text-[11px] font-medium hidden md:inline">
                  {user.email.split("@")[0]}
                </span>
              </div>

              <form action={signout} className="inline">
                <button
                  type="submit"
                  className="whitespace-nowrap text-xs font-medium text-muted hover:text-terracotta px-1.5 py-1 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            /* Logged out state: Show Sign In & Analyse Report */
            <>
              <Link
                href="/login"
                className="whitespace-nowrap text-sm font-medium text-muted hover:text-ink px-2 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/match"
                className="whitespace-nowrap text-sm font-medium bg-tealBrand text-white px-4 py-2 rounded-full hover:bg-tealDeep transition-colors"
              >
                Analyse Report
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-1.5 text-muted hover:text-ink"
            aria-label="Toggle Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-sand bg-cream/98 px-6 py-4 space-y-3">
          {user && (
            <div className="p-3 rounded-2xl bg-surface border border-sand mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-xs">
                  {initials}
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">{user.email}</p>
                  <p className="text-[10px] text-muted">Patient Workspace</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-semibold text-tealBrand hover:underline"
              >
                Open Dashboard →
              </Link>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Navigation</p>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold text-tealBrand"
              >
                Patient Dashboard
              </Link>
            )}
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-ink hover:text-tealBrand"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-sand space-y-1">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Platform Tools</p>
            {PLATFORM_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-ink hover:text-tealBrand"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-sand flex items-center justify-between gap-3">
            <Link
              href="/defense"
              onClick={() => setMobileOpen(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-terracottaSoft text-terracotta"
            >
              ★ Defense Dossier
            </Link>

            {user ? (
              <form action={signout}>
                <button
                  type="submit"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-medium text-terracotta hover:underline"
                >
                  Sign Out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-medium text-muted hover:text-ink"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
