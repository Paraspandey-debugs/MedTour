import { PageHead } from "@/components/ui";

export const metadata = { title: "Terms of use", description: "Terms for using the MedTour demo prototype." };

export default function TermsPage() {
  return (
    <>
      <PageHead eyebrow="Legal" title="Terms of use">
        MedTour is a demo prototype. By using it you agree to the points below.
      </PageHead>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6 text-sm leading-relaxed text-muted">
        <p className="rounded-xl border border-sand bg-terracottaSoft px-4 py-3">
          Not reviewed by a lawyer. Replace with proper terms before any real-world launch.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><b className="text-ink">Not medical advice.</b> Nothing on MedTour is medical advice, diagnosis or treatment. Always consult a qualified clinician. In an emergency, contact your local emergency services.</li>
          <li><b className="text-ink">Sample data.</b> Hospitals, doctors, prices, ratings and outcomes are fictional or illustrative. Do not rely on them to make real decisions.</li>
          <li><b className="text-ink">Estimates, not quotes.</b> Costs and the complication buffer are estimates. Real prices depend on your clinical situation and the hospital.</li>
          <li><b className="text-ink">No real transactions.</b> Escrow, milestone payments and quote forwarding are simulations or planned features, not live services.</li>
          <li><b className="text-ink">Acceptable use.</b> Do not abuse the service, scrape it at volume, or upload other people's health records without permission.</li>
          <li><b className="text-ink">No warranty.</b> The service is provided as is, with no guarantee of availability or accuracy.</li>
        </ul>
      </div>
    </>
  );
}
