import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/login/actions";

export const metadata = {
  title: "Patient Workspace — Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "PT";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 flex flex-col lg:flex-row gap-6">

        {/* COMPACT LEFT SIDEBAR / WORKSPACE NAV */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col justify-between rounded-2xl bg-surface border border-sand p-4 sm:p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Patient Workspace
              </p>
              <p className="font-serif text-xl text-ink mt-0.5">Clinical Console</p>
            </div>

            <nav className="space-y-1 text-sm font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sand/60 text-tealBrand font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-tealBrand" />
                Workspace Overview
              </Link>
              <Link
                href="/match"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-ink hover:bg-cream transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sand" />
                Care Passport &amp; Labs
              </Link>
              <Link
                href="/cost"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-ink hover:bg-cream transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sand" />
                TrueCost Calculator
              </Link>
              <Link
                href="/journey"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-ink hover:bg-cream transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sand" />
                Fit-to-Fly Timeline
              </Link>
              <Link
                href="/coordinator"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-ink hover:bg-cream transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sand" />
                24/7 Care Concierge
              </Link>
              <Link
                href="/security"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-ink hover:bg-cream transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sand" />
                Escrow &amp; Privacy Vault
              </Link>
              <Link
                href="/loyalty"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-ink hover:bg-cream transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sand" />
                HealthMiles &amp; Offers
              </Link>
            </nav>
          </div>

          {/* Bottom user card */}
          <div className="pt-4 border-t border-sand mt-6">
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-xs shrink-0">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink truncate">{user.email}</p>
                <p className="text-[10px] text-muted">Patient Account</p>
              </div>
            </div>
            <form action={signout} className="mt-3">
              <button
                type="submit"
                className="w-full text-center text-xs font-medium text-muted hover:text-terracotta border border-sand rounded-lg py-1.5 hover:bg-terracottaSoft/50 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 space-y-6 min-w-0">

          {/* Compact Header */}
          <div className="rounded-2xl bg-surface border border-sand p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-tealBrand bg-cream px-2.5 py-0.5 rounded-full border border-sand">
                  Care Dossier
                </span>
                <span className="text-xs text-muted">Sample workspace</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-ink mt-1.5">
                Patient Workspace
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                Connected to: <b className="text-ink font-semibold">{user.email}</b>. This is a demo workspace with illustrative sample data.
              </p>
            </div>

            <Link
              href="/match"
              className="btn btn-primary text-xs !py-2.5 !px-5 whitespace-nowrap"
            >
              New Risk Analysis &rarr;
            </Link>
          </div>

          {/* NEW USER ONBOARDING BANNER */}
          <div className="rounded-2xl border border-sand bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-tealBrand uppercase tracking-wider">
                Getting Started &middot; 3 Simple Steps
              </span>
              <span className="text-[11px] text-muted">
                Sample Patient File Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink/90 leading-relaxed">
              Welcome to MedTour! This console coordinates your surgical journey across borders.
              Below is an interactive sample care plan. To calibrate with your own records:
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <Link href="/match" className="p-3 rounded-xl bg-cream/70 border border-sand hover:border-tealBrand transition-colors">
                <span className="font-bold text-tealBrand">Step 1 &rarr;</span>
                <p className="font-semibold text-ink mt-0.5">Upload Medical Report</p>
                <p className="text-[11px] text-muted mt-0.5">Extract lab markers &amp; compute personal risk</p>
              </Link>
              <Link href="/cost" className="p-3 rounded-xl bg-cream/70 border border-sand hover:border-tealBrand transition-colors">
                <span className="font-bold text-tealBrand">Step 2 &rarr;</span>
                <p className="font-semibold text-ink mt-0.5">Compare TrueCost</p>
                <p className="text-[11px] text-muted mt-0.5">View all-in price with zero hidden fees</p>
              </Link>
              <Link href="/journey" className="p-3 rounded-xl bg-cream/70 border border-sand hover:border-tealBrand transition-colors">
                <span className="font-bold text-tealBrand">Step 3 &rarr;</span>
                <p className="font-semibold text-ink mt-0.5">Plan Recovery Travel</p>
                <p className="text-[11px] text-muted mt-0.5">Schedule safe return flight &amp; escrow</p>
              </Link>
            </div>
          </div>

          {/* 4-Card Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Card 1: Risk Multiplier */}
            <div className="rounded-2xl bg-surface border border-sand p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                    Risk Multiplier
                  </span>
                  <span className="text-[10px] bg-terracottaSoft text-terracotta font-semibold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="font-serif text-3xl text-ink num">1.64&times;</p>
                <p className="text-xs text-muted mt-1 leading-snug">
                  Calibrated from HbA1c 7.8% &amp; BMI 31.4 (+3 recovery days added).
                </p>
              </div>
              <Link
                href="/match"
                className="mt-3 pt-2.5 border-t border-sand text-xs font-semibold text-tealBrand hover:underline flex items-center justify-between"
              >
                <span>Update Labs</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Card 2: Selected Hospital */}
            <div className="rounded-2xl bg-surface border border-sand p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                    Selected Hospital
                  </span>
                  <span className="text-[10px] bg-sand text-ink font-semibold px-2 py-0.5 rounded-full">
                    Platinum 6/6
                  </span>
                </div>
                <p className="font-serif text-2xl text-ink truncate">Aravali Heart</p>
                <p className="text-xs text-muted mt-1 leading-snug">
                  New Delhi 🇮🇳 · JCI Accredited · Dr. Rajesh Sharma on roster.
                </p>
              </div>
              <Link
                href="/hospitals/aravali"
                className="mt-3 pt-2.5 border-t border-sand text-xs font-semibold text-tealBrand hover:underline flex items-center justify-between"
              >
                <span>View Audit Ledger</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Card 3: Fit-to-Fly Gate */}
            <div className="rounded-2xl bg-surface border border-sand p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                    Fit-to-Fly Gate
                  </span>
                  <span className="text-[10px] bg-terracottaSoft text-terracotta font-semibold px-2 py-0.5 rounded-full">
                    Gate Locked
                  </span>
                </div>
                <p className="font-serif text-3xl text-ink num">Day 17</p>
                <p className="text-xs text-muted mt-1 leading-snug">
                  Earliest safe departure: 17 days after procedure. Early booking blocked.
                </p>
              </div>
              <Link
                href="/journey"
                className="mt-3 pt-2.5 border-t border-sand text-xs font-semibold text-tealBrand hover:underline flex items-center justify-between"
              >
                <span>View Flight Gate</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Card 4: Escrow Holdback */}
            <div className="rounded-2xl bg-surface border border-sand p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                    Escrow Holdback
                  </span>
                  <span className="text-[10px] bg-cream text-tealBrand font-semibold px-2 py-0.5 rounded-full border border-sand">
                    Tranche 4
                  </span>
                </div>
                <p className="font-serif text-3xl text-ink num">15%</p>
                <p className="text-xs text-muted mt-1 leading-snug">
                  $1,875 USD held until Day-30 clinical outcome check back home.
                </p>
              </div>
              <Link
                href="/security"
                className="mt-3 pt-2.5 border-t border-sand text-xs font-semibold text-tealBrand hover:underline flex items-center justify-between"
              >
                <span>Escrow State Machine</span>
                <span>&rarr;</span>
              </Link>
            </div>

          </div>

          {/* 2-Column Main Workspace Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left 7 Cols: Actionable Next Steps Checklist */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl bg-surface border border-sand p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-serif text-xl text-ink">Actionable Journey Checklist</h2>
                    <p className="text-xs text-muted mt-0.5">Sequential milestones for safe international surgery</p>
                  </div>
                  <span className="text-xs font-semibold bg-sand/60 px-2.5 py-1 rounded-full text-ink">
                    3 of 5 Complete
                  </span>
                </div>

                <div className="space-y-3">

                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-sand bg-cream/40">
                    <span className="size-6 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">1. Report Analysis &amp; Biomarker Calibration</p>
                        <span className="text-[10px] text-tealBrand font-semibold">Done</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Clinical findings extracted. Risk multiplier 1.64&times; established from lab biomarkers.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-sand bg-cream/40">
                    <span className="size-6 rounded-full bg-tealBrand text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">2. Actuarial TrueCost Comparison</p>
                        <span className="text-[10px] text-tealBrand font-semibold">Done</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Compared against home wait times (3 weeks private US / 20 weeks UK NHS). Complication reserve priced.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-tealBrand/40 bg-white">
                    <span className="size-6 rounded-full bg-terracotta text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      !
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">3. Confirm Fit-to-Fly Return Flight Date</p>
                        <span className="text-[10px] text-terracotta font-semibold">Action Needed</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Your return flight is gated to Day 17. Verify your partner recovery hotel reservation in New Delhi.
                      </p>
                      <Link
                        href="/journey"
                        className="inline-block mt-2 text-xs font-semibold text-tealBrand hover:underline"
                      >
                        Adjust Flight Gate &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-sand bg-white">
                    <span className="size-6 rounded-full bg-sand text-muted flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      4
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">4. Milestone Escrow Authorization</p>
                        <span className="text-[10px] text-muted font-medium">Pending Tranche 1</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Deposit 10% held in trust; releases 40% on admission, 35% on discharge, 15% post-return.
                      </p>
                      <Link
                        href="/security"
                        className="inline-block mt-2 text-xs font-semibold text-tealBrand hover:underline"
                      >
                        Review Escrow Contract &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-sand bg-white">
                    <span className="size-6 rounded-full bg-sand text-muted flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      5
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">5. 24/7 Care Concierge Briefing</p>
                        <span className="text-[10px] text-muted font-medium">Pre-Flight</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Aria AI concierge &amp; human coordinator assigned. Family tracking token generated.
                      </p>
                      <Link
                        href="/coordinator"
                        className="inline-block mt-2 text-xs font-semibold text-tealBrand hover:underline"
                      >
                        Connect with Concierge &rarr;
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right 5 Cols: Active Care File Summary & Quick Tools */}
            <div className="lg:col-span-5 space-y-4">

              {/* Active Care File Dossier */}
              <div className="rounded-2xl bg-surface border border-sand p-5 sm:p-6 shadow-sm">
                <h3 className="font-serif text-lg text-ink">Active Care Dossier</h3>
                <p className="text-xs text-muted mt-0.5">Treating hospital and clinician assignment</p>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-sand/60">
                    <span className="text-muted">Procedure</span>
                    <span className="font-semibold text-ink">Total Knee Replacement (TKR)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sand/60">
                    <span className="text-muted">Treating Facility</span>
                    <span className="font-semibold text-ink">Aravali Institute (New Delhi)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sand/60">
                    <span className="text-muted">Lead Specialist</span>
                    <span className="font-semibold text-ink">Dr. Sunita Kapoor, FRCS</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sand/60">
                    <span className="text-muted">Clinical Coordinator</span>
                    <span className="font-semibold text-ink">Dr. Rachel Vance (Asia Desk)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-sand/60">
                    <span className="text-muted">Emergency Desk</span>
                    <span className="font-semibold text-terracotta">+91 11 2685 4100 (Ext. 99)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted">Next Tele-Consult</span>
                    <span className="font-semibold text-tealBrand">Tomorrow at 2:00 PM GMT</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-sand flex gap-2">
                  <Link
                    href="/coordinator"
                    className="btn btn-primary w-full text-xs !py-2 text-center"
                  >
                    Open Live Concierge Chat
                  </Link>
                </div>
              </div>

              {/* Quick Tools */}
              <div className="rounded-2xl bg-surface border border-sand p-5 sm:p-6 shadow-sm">
                <h3 className="font-serif text-lg text-ink">Clinical Tools</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/match"
                    className="p-3 rounded-xl border border-sand bg-cream/50 hover:bg-cream transition-colors text-left"
                  >
                    <p className="font-semibold text-ink">Care Passport</p>
                    <p className="text-[11px] text-muted mt-0.5">HL7 / Lab report</p>
                  </Link>
                  <Link
                    href="/cost"
                    className="p-3 rounded-xl border border-sand bg-cream/50 hover:bg-cream transition-colors text-left"
                  >
                    <p className="font-semibold text-ink">TrueCost</p>
                    <p className="text-[11px] text-muted mt-0.5">All-in breakdown</p>
                  </Link>
                  <Link
                    href="/security"
                    className="p-3 rounded-xl border border-sand bg-cream/50 hover:bg-cream transition-colors text-left"
                  >
                    <p className="font-semibold text-ink">Zero-Knowledge</p>
                    <p className="text-[11px] text-muted mt-0.5">HIPAA PHI vault</p>
                  </Link>
                  <Link
                    href="/loyalty"
                    className="p-3 rounded-xl border border-sand bg-cream/50 hover:bg-cream transition-colors text-left"
                  >
                    <p className="font-semibold text-ink">HealthMiles</p>
                    <p className="text-[11px] text-muted mt-0.5">6,750 pts balance</p>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}
