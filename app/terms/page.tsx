import { PageHead } from "@/components/ui";

export const metadata = {
  title: "Terms of Use",
  description: "Terms and conditions governing the use of the MedTour cross-border healthcare navigation platform.",
};

const UPDATED = "19 November 2026";

export default function TermsPage() {
  return (
    <>
      <PageHead eyebrow="Legal Agreement" title="Terms of Use">
        Terms and conditions governing your access to and use of the MedTour platform. Last updated {UPDATED}.
      </PageHead>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 space-y-10 text-sm leading-relaxed text-ink/90">
        {/* Service notice */}
        <div className="rounded-2xl border border-sand bg-terracottaSoft p-5 text-ink space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <p className="font-semibold text-sm">Important information</p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            MedTour is a cross-border healthcare navigation service. Hospital profiles, surgeon listings, complication
            statistics and pricing are provided by partner institutions and are estimates, not guaranteed quotes. By using
            the platform, you acknowledge that MedTour is not a medical practice, hospital or financial escrow institution.
          </p>
        </div>

        {/* 1. Acceptance */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">1. Acceptance of Terms</h2>
          <p className="text-muted leading-relaxed">
            By creating an account, browsing hospital directories, utilizing our Total Cost Calculator, uploading prescription
            documents, or submitting quote inquiries, you agree to be bound by these Terms of Use and our Privacy Policy.
            If you do not agree to these terms, you must discontinue use of the platform immediately.
          </p>
        </section>

        {/* 2. Medical Disclaimer */}
        <section className="card p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-2xl text-ink">2. Critical Medical Disclaimers</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-line bg-blush/40 text-xs text-ink space-y-1.5">
              <p className="font-bold text-coral uppercase tracking-wide">Emergency Warning</p>
              <p className="leading-relaxed">
                MedTour is strictly for planned, elective, non-emergency medical travel evaluation. If you are experiencing
                an acute medical emergency, chest pain, stroke symptoms, or severe shortness of breath, contact your local
                emergency services (e.g. 911, 999, 112) or proceed to the nearest emergency department immediately.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line bg-sand/20 text-xs text-muted space-y-1.5">
              <p className="font-semibold text-ink text-sm">No Doctor-Patient Relationship</p>
              <p className="leading-relaxed">
                Use of MedTour, including interactions with our AI assistant Aria and the report analysis tool, does not
                create a doctor-patient, hospital-patient, or confidential medical advisory relationship. All generated
                insights, biomarker calibrations, and recovery timelines are informational decision-support aids.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line bg-sand/20 text-xs text-muted space-y-1.5">
              <p className="font-semibold text-ink text-sm">Independent Clinical Consultation Required</p>
              <p className="leading-relaxed">
                You must always consult a licensed medical practitioner in your home jurisdiction and the treating surgical
                specialist before making any surgical, medication, travel, or therapeutic decisions.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Cost Estimates & Calculations */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">3. Total Cost Estimations &amp; Complication Buffers</h2>
          <p className="text-muted leading-relaxed">
            Our Total Cost calculation models encompass procedure fees, roundtrip flights, local recovery lodging, visa/insurance,
            and an actuarial complication buffer ($M_{'{patient}'}$). You understand and agree that:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted text-xs leading-relaxed">
            <li>
              <b className="text-ink">Estimates Are Non-Binding:</b> Calculated prices are estimates derived from partner
              package pricing and average flight corridors. They do not constitute guaranteed quotes or binding financial offers.
            </li>
            <li>
              <b className="text-ink">Complication Buffers Are Not Insurance:</b> The calculated complication buffer is a recommended
              personal financial reserve to budget for unforeseen medical contingencies; it is not an insurance policy, underwritten indemnity, or financial guarantee.
            </li>
            <li>
              <b className="text-ink">Final Hospital Pricing:</b> The actual cost of your medical procedure is subject to direct
              in-person clinical examination, diagnostic imaging, and formal package documentation issued by the treating hospital.
            </li>
          </ul>
        </section>

        {/* 4. Milestone Payments & Financial Features */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">4. Milestone Staged Payments</h2>
          <p className="text-muted leading-relaxed">
            The platform showcases a milestone staged payment architecture (e.g. 10% slot booking, 40% admission check-in,
            35% discharge to local hotel, and 15% post-return clinical teleconsultation holdback).
          </p>
          <p className="text-xs text-muted leading-relaxed">
            Held amounts are administered by a licensed escrow partner. MedTour does not hold custody of funds, process card
            payments or guarantee international banking transfers. All transfers are made through regulated payment providers
            and are confirmed with you before payment.
          </p>
        </section>

        {/* 5. Hospital Directory & Listings */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">5. Provider Listings &amp; Accreditations</h2>
          <p className="text-muted leading-relaxed">
            Hospital directory entries, surgeon profiles, accreditation badges (e.g. JCI, NABH, TEMOS), and quality tiers
            are published only after a hospital completes our six-step verification audit. Patients remain solely responsible
            for independently verifying the credentials, licensing and facility standards of any hospital or surgeon.
          </p>
        </section>

        {/* 6. User Conduct */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">6. Acceptable Use &amp; Prohibited Conduct</h2>
          <p className="text-muted leading-relaxed">When using the MedTour platform, you agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted text-xs leading-relaxed">
            <li>Upload medical documents, prescriptions, or imaging scans belonging to third parties without lawful authorization.</li>
            <li>Deploy automated bots, scrapers, or crawlers to extract directory pricing, provider profiles, or clinical algorithms.</li>
            <li>Attempt to bypass rate limits, probe undocumented API endpoints, or compromise user authentication mechanisms.</li>
            <li>Utilize the platform for fraudulent inquiries, defamatory claims, or unlawful commercial redistribution.</li>
          </ul>
        </section>

        {/* 7. Limitation of Liability */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">7. Limitation of Liability</h2>
          <p className="text-muted text-xs leading-relaxed">
            To the maximum extent permitted by applicable law, MedTour, its developers, affiliates, and licensors shall not
            be liable for any direct, indirect, incidental, consequential, special, or exemplary damages—including but not
            limited to personal injury, medical complications, travel delays, flight cancellations, loss of profits, or data loss—arising
            from your use of or inability to use the platform, reliance on cost estimates, or interactions with third-party hospitals.
          </p>
        </section>

        {/* 8. Governing Law & Contact */}
        <section className="card p-6 sm:p-8 space-y-2">
          <h2 className="font-display text-2xl text-ink">8. Governing Law &amp; Contact</h2>
          <p className="text-muted text-xs leading-relaxed">
            These Terms of Use shall be governed by and construed in accordance with applicable general law. For inquiries
            regarding these terms or legal notices, contact:
          </p>
          <p className="font-mono text-xs text-teal font-semibold pt-1">legal@medtour.org</p>
        </section>
      </div>
    </>
  );
}
