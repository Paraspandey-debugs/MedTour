import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ weight: "400", variable: "--font-serif", subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "MedTour — Compare the real cost of surgery abroad", template: "%s · MedTour" },
  description:
    "Compare the total trip cost of planned surgery abroad across hospitals: procedure, flights, recovery stay, visa and a complication buffer. Demo prototype with sample data.",
  openGraph: {
    type: "website",
    siteName: "MedTour",
    title: "MedTour — Compare the real cost of surgery abroad",
    description: "Choose a procedure and where you live, then compare the total trip cost across hospitals. Demo prototype with sample data.",
  },
  twitter: { card: "summary", title: "MedTour — Compare the real cost of surgery abroad" },
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
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg">Skip to content</a>
        {/* Demo prototype banner */}
        <div className="w-full bg-tealDeep text-white text-center text-xs py-1.5 px-4 leading-snug z-50">
          <strong>Demo prototype.</strong> Hospitals, doctors, prices and ratings are illustrative sample data, not real providers or quotes.
        </div>
        <Nav user={navUser} />
        <main id="main" className="flex-1">{children}</main>
        <footer className="mt-24 border-t border-sand bg-surface">
          <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr] text-sm">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Logo className="h-6 w-auto shrink-0" />
                <span className="font-serif text-2xl tracking-tight text-ink">MedTour</span>
              </div>
              <p className="text-muted max-w-sm text-sm leading-relaxed">
                Compare the real cost of planned surgery abroad.
              </p>
              <p className="mt-4 text-xs text-muted max-w-sm leading-relaxed">
                Demo prototype. Hospitals, prices and outcome figures are illustrative sample data.
                Informational only, not medical or financial advice. Costs and risk figures are estimates.
              </p>
            </div>
            <nav aria-label="Product">
              <p className="font-semibold text-ink mb-3 text-sm">Product</p>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link href="/hospitals" className="hover:text-ink transition-colors">Compare hospitals</Link></li>
                <li><Link href="/match" className="hover:text-ink transition-colors">Analyse my report</Link></li>
                <li><Link href="/cost" className="hover:text-ink transition-colors">Total cost calculator</Link></li>
                <li><Link href="/journey" className="hover:text-ink transition-colors">Trip plan</Link></li>
                <li><Link href="/tourism" className="hover:text-ink transition-colors">Destinations &amp; tourism</Link></li>
                <li><Link href="/coordinator" className="hover:text-ink transition-colors">Ask the assistant</Link></li>
              </ul>
            </nav>
            <nav aria-label="More">
              <p className="font-semibold text-ink mb-3 text-sm">More</p>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link href="/security" className="hover:text-ink transition-colors">Security &amp; privacy</Link></li>
                <li><Link href="/loyalty" className="hover:text-ink transition-colors">Offers &amp; rewards (preview)</Link></li>
                <li><Link href="/partners" className="hover:text-ink transition-colors">For hospitals (preview)</Link></li>
                <li><Link href="/privacy" className="hover:text-ink transition-colors">Privacy policy</Link></li>
                <li><Link href="/terms" className="hover:text-ink transition-colors">Terms of use</Link></li>
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
