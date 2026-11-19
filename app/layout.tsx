import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import "./globals.css";

const body = Geist({ variable: "--font-body", subsets: ["latin"] });
const display = Fraunces({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "MedTour - Better Healthcare, Global Access", template: "%s · MedTour" },
  description:
    "MedTour connects patients with verified hospitals abroad - with risk-adjusted pricing, recovery-aware travel and outcome-linked payments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="mt-24 border-t border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr] text-sm">
            <div>
              <p className="font-display text-xl">MedTour</p>
              <p className="mt-2 text-muted max-w-sm">
                Better Healthcare, Global Access, Healthier Tomorrow.
              </p>
              <p className="mt-4 text-xs text-muted max-w-sm">
                Academic prototype by Group No. 19. Hospitals, prices and outcome figures are
                illustrative demo data. Nothing here is medical or financial advice.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Patients</p>
              <ul className="space-y-1.5 text-muted">
                <li><Link href="/match" className="hover:text-teal">Care Passport &amp; Report Analysis</Link></li>
                <li><Link href="/hospitals" className="hover:text-teal">Verified Hospitals &amp; Specialists</Link></li>
                <li><Link href="/cost" className="hover:text-teal">TrueCost Estimator</Link></li>
                <li><Link href="/journey" className="hover:text-teal">Fit-to-Fly Journey Planner</Link></li>
                <li><Link href="/coordinator" className="hover:text-teal">24/7 Care Coordinator Concierge</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Trust &amp; Infrastructure</p>
              <ul className="space-y-1.5 text-muted">
                <li><Link href="/security" className="hover:text-teal">Zero-Knowledge Vault &amp; Escrow</Link></li>
                <li><Link href="/loyalty" className="hover:text-teal">HealthMiles &amp; Curated Offers</Link></li>
                <li><Link href="/partners" className="hover:text-teal">Hospital Onboarding Audit</Link></li>
                <li><Link href="/defense" className="text-coral font-semibold hover:underline">Academic Defense Dossier (Group 19)</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
