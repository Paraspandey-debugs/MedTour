import { PageHead } from "@/components/ui";

export const metadata = { title: "Privacy policy", description: "What MedTour collects, why, and who processes it." };

const UPDATED = "19 November 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHead eyebrow="Legal" title="Privacy policy">
        Plain-language summary of how this demo prototype handles your data. Last updated {UPDATED}.
      </PageHead>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-8 text-sm leading-relaxed text-ink/90">
        <p className="rounded-xl border border-sand bg-terracottaSoft px-4 py-3 text-muted">
          This is a prototype. This page is a good-faith description, not a reviewed legal document. Have it reviewed by a
          qualified lawyer before running MedTour with real patients. Health data is sensitive and regulated.
        </p>
        <section>
          <h2 className="font-serif text-2xl mb-2">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><b className="text-ink">Account:</b> your email address and a password (stored hashed by our authentication provider, Supabase).</li>
            <li><b className="text-ink">Quote requests:</b> email, hospital, procedure, preferred month and any message you write.</li>
            <li><b className="text-ink">Reports you analyse:</b> text you paste or a file you upload on the report-analysis page.</li>
            <li><b className="text-ink">Assistant chats:</b> messages you send to the assistant.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-2xl mb-2">Who processes it</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><b className="text-ink">Supabase</b> stores accounts and quote requests.</li>
            <li><b className="text-ink">Google (Gemini API)</b> receives report text, uploaded files and assistant messages to produce analysis and replies.
              Where possible, obvious identifiers in pasted text are redacted in your browser first. Uploaded files cannot be redacted and are sent as-is.
              Do not upload anything you are not comfortable sharing.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-2xl mb-2">What we do not do</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li>We do not sell your data.</li>
            <li>In this demo, quote requests are not sent to any hospital.</li>
            <li>We make no claim of HIPAA, GDPR or India DPDP Act compliance. This is a prototype.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-2xl mb-2">Your choices</h2>
          <p className="text-muted">You can ask for your account and quote requests to be deleted by contacting the project owner. You can stop at any time by not uploading reports.</p>
        </section>
      </div>
    </>
  );
}
