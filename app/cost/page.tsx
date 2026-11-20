import Link from "next/link";
import { Suspense } from "react";
import { PageHead } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import CostTool from "./CostTool";

export const metadata = { title: "Total cost calculator", description: "Compare the total trip cost of planned surgery abroad across hospitals, including travel, stay and a complication buffer." };

export default function CostPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <Link href="/hospitals" className="text-sm text-muted hover:text-teal">← Back to results</Link>
      </div>
      <PageHead eyebrow="Total cost calculator" title="Compare what you will actually pay, including a buffer for complications.">
        Hospital sticker prices leave out flights, recovery stay, visa and the cost of things going wrong. This
        calculator adds them up for each hospital. Estimates, not guaranteed quotes.
      </PageHead>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6">
        <MedicalDisclaimer />
      </div>
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 sm:px-6 text-muted">Loading estimator…</div>}>
        <CostTool />
      </Suspense>
    </>
  );
}
