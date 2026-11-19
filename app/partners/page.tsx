import { VERIFICATION_STEPS } from "@/lib/data";
import { PageHead } from "@/components/ui";
import OnboardForm from "./OnboardForm";

export const metadata = { title: "For partners" };

const PARTNERS = [
  ["Hospitals & clinics", "Reach international patients by publishing audited outcomes. Better outcomes rank higher - you compete on quality, not ad spend."],
  ["Hotels & recovery stays", "Receive bookings with exact dates from the clinical timeline, including accessibility needs."],
  ["Airlines & transport", "Fit-to-Fly clearance arrives with the booking, so assistance and seating are arranged up front."],
  ["Insurers", "Price complication cover from the same risk reserve the patient sees - one shared, transparent number."],
  ["Governments & tourism boards", "Aggregate, anonymised demand and outcome data for accreditation and visa policy."],
];

const REVENUE = [
  ["Hospital commission", "Per completed treatment, collected from escrow at release."],
  ["Patient service fee", "3% of the package, capped at $400. Waived for Plus members."],
  ["Travel & insurance partners", "Referral revenue on hotel nights, flights and complication cover."],
  ["MedTour Plus", "Subscription for priority coordinators and exclusive offers."],
  ["Sponsored placement", "Clearly labelled, and never changes the fit score."],
];
const COSTS = [
  "Platform, cloud and AI infrastructure",
  "Care coordinators and 24/7 support",
  "Hospital audits and partner onboarding",
  "Marketing and patient acquisition",
  "Legal, compliance and insurance",
];

const PLANS = [
  { name: "MedTour", price: "Free", note: "3% service fee per booking", items: ["Report analysis and matching", "TrueCost comparison", "Journey planner and escrow", "24/7 chat support"] },
  { name: "MedTour Plus", price: "$19 / month", note: "Service fee waived", featured: true, items: ["Dedicated care coordinator", "Priority surgeon video consults", "Partner hotel and lounge offers", "Loyalty credit on follow-up care", "Family companion view"] },
];

export default function PartnersPage() {
  return (
    <>
      <PageHead eyebrow="For hospitals and partners" title="Earn patients by proving outcomes.">
        MedTour is a two-sided platform. The verification workflow below is what gives the patient
        side its trust - and what a hospital must pass to be listed.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section>
          <h2 className="font-display text-2xl">Verification and onboarding workflow</h2>
          <ol className="mt-4 space-y-3">
            {VERIFICATION_STEPS.map((s, i) => (
              <li key={s.key} className="card p-4 flex gap-4">
                <span className="font-display text-2xl text-coral num w-6">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{s.label}</p>
                    <span className="text-[11px] rounded-full bg-sand px-2 py-0.5">
                      {i < 4 ? "Required to list" : i === 4 ? "Gold" : "Platinum"}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-0.5">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted">
            Hospitals are re-audited every 12 months. A lapsed audit drops the tier automatically.
          </p>
        </section>
        <OnboardForm />
      </div>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-16">
        <h2 className="font-display text-3xl">Who plugs into the journey</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map(([t, d]) => (
            <div key={t} className="card p-5">
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-6xl px-4 sm:px-6 mt-16 scroll-mt-20">
        <h2 className="font-display text-3xl">Plans for patients</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 max-w-3xl">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded-2xl p-6 ${p.featured ? "bg-deep text-white" : "card"}`}>
              <p className="font-semibold">{p.name}</p>
              <p className="mt-2 font-display text-3xl num">{p.price}</p>
              <p className={`text-sm ${p.featured ? "text-white/70" : "text-muted"}`}>{p.note}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.items.map((i) => <li key={i} className="flex gap-2"><span aria-hidden>✓</span>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="model" className="mx-auto max-w-6xl px-4 sm:px-6 mt-16 scroll-mt-20">
        <h2 className="font-display text-3xl">Business model</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="card p-5 sm:p-6">
            <p className="eyebrow">Revenue streams</p>
            <dl className="mt-3 divide-y divide-line">
              {REVENUE.map(([t, d]) => (
                <div key={t} className="py-3 grid sm:grid-cols-[200px_1fr] gap-1">
                  <dt className="font-semibold text-sm">{t}</dt>
                  <dd className="text-sm text-muted">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-5 sm:p-6">
            <p className="eyebrow">Cost structure</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {COSTS.map((c) => <li key={c} className="flex gap-2"><span className="text-coral">●</span>{c}</li>)}
            </ul>
            <p className="mt-5 text-sm text-muted">
              Because commission is taken from escrow at release, MedTour only earns when the
              patient&apos;s milestones are actually met.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
