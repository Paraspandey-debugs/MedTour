import { PageHead } from "@/components/ui";

export const metadata = {
  title: "Privacy Policy",
  description: "Comprehensive privacy policy detailing how MedTour collects, processes, protects, and de-identifies healthcare data.",
};

const UPDATED = "19 November 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHead eyebrow="Governance & Compliance" title="Privacy Policy">
        A transparent disclosure of how MedTour collects, processes, and protects your personal and clinical
        information. Last updated {UPDATED}.
      </PageHead>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 space-y-10 text-sm leading-relaxed text-ink/90">
        {/* Service notice */}
        <div className="rounded-2xl border border-sand bg-terracottaSoft p-5 text-ink space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <p className="font-semibold text-sm">Our approach to privacy</p>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            MedTour is a cross-border healthcare navigation service. Client-side de-identification, rate limiting and
            PostgreSQL Row-Level Security (RLS) protect your account and clinical data. This policy explains what we
            collect, how we use it and the safeguards we apply.
          </p>
        </div>

        {/* 1. Controller & Scope */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">1. Data Controller &amp; Scope</h2>
          <p className="text-muted leading-relaxed">
            This Privacy Policy applies to all services, web applications, and APIs provided under the MedTour platform
            (&quot;MedTour&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). When you navigate our provider directories, upload medical
            prescriptions, estimate procedure expenses, or request hospital quotes, MedTour acts as the data controller
            for personal account details and the technical processor for clinical document evaluations.
          </p>
        </section>

        {/* 2. Data Categories */}
        <section className="card p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-2xl text-ink">2. Categories of Information We Process</h2>
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="p-4 rounded-xl border border-line bg-sand/20 space-y-1.5">
              <p className="font-semibold text-ink text-sm">Account &amp; Contact Credentials</p>
              <p className="text-xs text-muted leading-relaxed">
                Email address, encrypted authentication hashes managed by Supabase Auth, and user account IDs.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-line bg-sand/20 space-y-1.5">
              <p className="font-semibold text-ink text-sm">Quote &amp; Hospital Inquiries</p>
              <p className="text-xs text-muted leading-relaxed">
                Target hospital, surgical procedure of interest, preferred travel month, and patient travel notes.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-line bg-sand/20 space-y-1.5">
              <p className="font-semibold text-ink text-sm">Clinical &amp; Prescription Records</p>
              <p className="text-xs text-muted leading-relaxed">
                Doctor prescription slips, lab panels (HbA1c, BMI, BP, Creatinine), diagnosis notes, and attached scans (PDF, PNG, JPG).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-line bg-sand/20 space-y-1.5">
              <p className="font-semibold text-ink text-sm">Technical &amp; Telemetry Data</p>
              <p className="text-xs text-muted leading-relaxed">
                IP addresses (used transiently for abuse prevention and rate-limiting windows), browser user-agents, and referral paths.
              </p>
            </div>
          </div>
        </section>

        {/* 3. In-Browser De-identification */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">3. Client-Side PHI De-identification</h2>
          <p className="text-muted leading-relaxed">
            MedTour employs a client-side de-identification pipeline executed in your browser runtime before any clinical
            text is transmitted to our servers:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted text-xs leading-relaxed">
            <li>
              <b className="text-ink">Pasted Report Text:</b> Evaluated against pattern filters that redact full patient names,
              medical record numbers (MRNs), phone numbers, email addresses, and specific calendar dates prior to network dispatch.
            </li>
            <li>
              <b className="text-ink">Uploaded Files &amp; Scans:</b> Scanned prescription images and PDFs are processed via
              Google Gemini&apos;s multimodal vision API to extract clinical parameters. While images cannot be scrubbed by browser
              text regex, they are transmitted via encrypted HTTPS TLS 1.3 directly to the secured Gemini API endpoint.
            </li>
          </ul>
        </section>

        {/* 4. Sub-processors */}
        <section className="card p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-2xl text-ink">4. Sub-processors &amp; Cloud Infrastructure</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-line bg-white space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">Supabase Inc. (Database &amp; Authentication)</p>
                <span className="text-[11px] bg-sand px-2 py-0.5 rounded font-mono text-muted">PostgreSQL · RLS</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Stores authenticated user credentials and quote requests. Database tables enforce strict PostgreSQL Row-Level
                Security (RLS) policies ensuring users can only query their own records.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-line bg-white space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">Google LLC (Gemini API &amp; AI Studio)</p>
                <span className="text-[11px] bg-sand px-2 py-0.5 rounded font-mono text-muted">Gemini 3.1 Flash Lite</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Executes structured clinical parameter extraction, risk coefficient calculation, and assistant responses.
                Data submitted via the API is not used to train foundational AI models under Google Cloud enterprise terms.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Legal Basis */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">5. Legal Basis for Processing (GDPR &amp; DPDP)</h2>
          <p className="text-muted leading-relaxed">
            We process your personal and medical information under the following legal frameworks:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted text-xs leading-relaxed">
            <li><b className="text-ink">Explicit User Consent:</b> Granted when uploading a prescription, entering biomarker values, or initiating an AI assistant conversation.</li>
            <li><b className="text-ink">Contractual Pre-Steps:</b> Compiling hospital comparisons, scheduling timelines, and generating quote requests upon your request.</li>
            <li><b className="text-ink">Legitimate Interests:</b> Mitigating DDoS attacks, enforcing request rate limits (e.g. 15 requests/minute), and diagnosing application errors.</li>
          </ul>
        </section>

        {/* 6. Data Retention */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">6. Data Retention &amp; Deletion</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted text-xs leading-relaxed">
            <li><b className="text-ink">Transient Clinical Analysis:</b> Medical reports and prescription scans are analyzed ephemerally and are not permanently archived in our database unless you explicitly save a care plan to your account.</li>
            <li><b className="text-ink">Quote Inquiries:</b> Stored in your user dashboard for 180 days or until you choose to delete your account.</li>
            <li><b className="text-ink">Account Erasure:</b> You may request immediate deletion of your profile, quotes, and saved data at any time through the project administrator.</li>
          </ul>
        </section>

        {/* 7. Patient Rights */}
        <section className="card p-6 sm:p-8 space-y-3">
          <h2 className="font-display text-2xl text-ink">7. Your Privacy Rights</h2>
          <p className="text-muted leading-relaxed">
            Regardless of your country of residence, you have full ownership over your medical travel data:
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2 pt-1 text-xs">
            <div className="p-3 rounded-lg border border-line bg-sand/15">
              <b>Right of Access &amp; Portability:</b> Export your saved estimates, timeline records, and quotes in structured JSON format.
            </div>
            <div className="p-4 rounded-lg border border-line bg-sand/15">
              <b>Right to Erasure:</b> Completely scrub all records associated with your email address upon request.
            </div>
            <div className="p-3 rounded-lg border border-line bg-sand/15">
              <b>Right to Rectification:</b> Update clinical notes, home country, or procedure preferences at any time.
            </div>
            <div className="p-3 rounded-lg border border-line bg-sand/15">
              <b>Right to Revoke Consent:</b> Immediately discontinue document evaluation without affecting standard directory browsing.
            </div>
          </div>
        </section>

        {/* 8. Contact Information */}
        <section className="card p-6 sm:p-8 space-y-2">
          <h2 className="font-display text-2xl text-ink">8. Contact &amp; Governance</h2>
          <p className="text-muted text-xs leading-relaxed">
            If you have questions regarding this Privacy Policy, wish to exercise your data protection rights, or want to
            request complete deletion of your records, contact the MedTour development team at:
          </p>
          <p className="font-mono text-xs text-teal font-semibold pt-1">privacy@medtour.org</p>
        </section>
      </div>
    </>
  );
}
