import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ weight: "400", variable: "--font-serif", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "MedTour — Better Healthcare, Global Access", template: "%s · MedTour" },
  description:
    "MedTour connects patients with verified hospitals abroad — with risk-adjusted pricing, recovery-aware travel and outcome-linked payments.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navUser = user ? { id: user.id, email: user.email || "" } : null;

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-cream text-ink selection:bg-tealBrand selection:text-white">
        <Nav user={navUser} />
        <main className="flex-1">{children}</main>
        <footer className="mt-24 border-t border-sand bg-surface">
          <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr] text-sm">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-base leading-none">
                  +
                </span>
                <span className="font-serif text-2xl tracking-tight text-ink">MedTour</span>
              </div>
              <p className="text-muted max-w-sm text-sm leading-relaxed">
                Better Healthcare, Global Access, Healthier Tomorrow.
              </p>
              <p className="mt-4 text-xs text-muted max-w-sm leading-relaxed">
                Academic prototype by Group No. 19. Hospitals, prices and outcome figures are
                illustrative demo data. Nothing here is medical or financial advice.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink mb-3 text-sm">Patients</p>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link href="/match" className="hover:text-ink transition-colors">Care Passport &amp; Report Analysis</Link></li>
                <li><Link href="/hospitals" className="hover:text-ink transition-colors">Verified Hospitals &amp; Specialists</Link></li>
                <li><Link href="/cost" className="hover:text-ink transition-colors">TrueCost Estimator</Link></li>
                <li><Link href="/journey" className="hover:text-ink transition-colors">Fit-to-Fly Journey Planner</Link></li>
                <li><Link href="/coordinator" className="hover:text-ink transition-colors">24/7 Care Coordinator Concierge</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink mb-3 text-sm">Trust &amp; Infrastructure</p>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link href="/security" className="hover:text-ink transition-colors">Zero-Knowledge Vault &amp; Escrow</Link></li>
                <li><Link href="/loyalty" className="hover:text-ink transition-colors">HealthMiles &amp; Curated Offers</Link></li>
                <li><Link href="/partners" className="hover:text-ink transition-colors">Hospital Onboarding Audit</Link></li>
                <li><Link href="/defense" className="text-terracotta font-semibold hover:underline">Academic Defense Dossier (Group 19)</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
