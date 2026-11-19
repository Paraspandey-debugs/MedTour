"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/app/login/actions";
import Logo from "@/components/Logo";

export interface NavUser {
  id: string;
  email: string;
}

const MAIN_LINKS = [
  { href: "/hospitals", label: "Compare hospitals" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/security", label: "Security & privacy" },
];

const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/match", label: "Analyse my report" },
  { href: "/journey", label: "Trip plan" },
  { href: "/coordinator", label: "Ask the assistant" },
];

export default function Nav({ user: initialUser }: { user?: NavUser | null }) {
  const path = usePathname();
  const router = useRouter();
  // undefined = no auth event received yet, so fall back to the server-provided user
  const [liveUser, setLiveUser] = useState<NavUser | null | undefined>(undefined);
  const user: NavUser | null = liveUser === undefined ? (initialUser ?? null) : liveUser;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLiveUser(session?.user ? { id: session.user.id, email: session.user.email || "" } : null);
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // Close menus on route change (adjust state during render, not in an effect)
  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) {
    setPrevPath(path);
    setMobileOpen(false);
    setMenuOpen(false);
  }

  // Mobile sheet: Escape closes, Tab is trapped inside, focus moves in on open
  useEffect(() => {
    if (!mobileOpen) return;
    const sheet = sheetRef.current;
    const focusables = () =>
      Array.from(sheet?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Account menu: close on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "PT";
  const linkCls = (href: string) =>
    `whitespace-nowrap text-sm font-medium transition-colors ${
      !href.includes("#") && path.startsWith(href) ? "text-ink font-semibold" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="MedTour home">
          <Logo className="h-7 w-auto shrink-0" />
          <span className="font-serif text-2xl tracking-tight text-ink">MedTour</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:flex items-center gap-7">
          {MAIN_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls(l.href)}>{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div className="relative hidden lg:block" ref={menuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 min-h-11 pl-1.5 pr-3 rounded-full bg-surface border border-sand text-xs text-ink hover:border-ink/40"
              >
                <span className="size-7 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-[10px]" aria-hidden>{initials}</span>
                <span className="max-w-[140px] truncate font-medium">{user.email.split("@")[0]}</span>
                <span aria-hidden>▾</span>
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-sand bg-surface shadow-xl p-2 text-sm">
                  {ACCOUNT_LINKS.map((l) => (
                    <Link key={l.href} role="menuitem" href={l.href} className="block px-3.5 py-2.5 rounded-xl hover:bg-cream">{l.label}</Link>
                  ))}
                  <form action={signout} className="mt-1 pt-1 border-t border-sand">
                    <button type="submit" role="menuitem" className="w-full text-left px-3.5 py-2.5 rounded-xl text-terracotta hover:bg-cream">Sign out</button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden lg:inline-flex items-center min-h-11 px-3 text-sm font-medium text-muted hover:text-ink">Sign in</Link>
              <Link href="/hospitals" className="hidden lg:inline-flex items-center min-h-11 text-sm font-medium bg-tealBrand text-white px-5 rounded-full hover:bg-tealDeep transition-colors">Compare hospitals</Link>
            </>
          )}

          <button
            type="button"
            className="lg:hidden grid place-items-center size-11 text-muted hover:text-ink"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" ref={sheetRef} className="lg:hidden border-t border-sand bg-cream px-4 py-3">
          <nav aria-label="Mobile" className="flex flex-col">
            {MAIN_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="min-h-11 flex items-center text-sm font-medium text-ink">{l.label}</Link>
            ))}
            {user ? (
              <>
                <p className="mt-3 pt-3 border-t border-sand text-[11px] font-semibold uppercase tracking-wider text-muted">Your account</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
                {ACCOUNT_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="min-h-11 flex items-center text-sm font-medium text-ink">{l.label}</Link>
                ))}
                <form action={signout}>
                  <button type="submit" className="min-h-11 text-sm font-medium text-terracotta">Sign out</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="mt-2 pt-3 border-t border-sand min-h-11 flex items-center text-sm font-medium text-tealBrand">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
