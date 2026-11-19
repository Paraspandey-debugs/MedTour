import Link from "next/link";
import { Suspense } from "react";
import { PageHead } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import JourneyTool from "./JourneyTool";

export const metadata = { title: "Trip plan", description: "A day-by-day trip plan for planned surgery abroad, including when it is safe to fly home. Sample data." };

export default function JourneyPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <Link href="/hospitals" className="text-sm text-muted hover:text-teal">← Back to results</Link>
      </div>
      <PageHead eyebrow="Trip plan" title="A trip plan that waits until it is safe to fly home.">
        A day-by-day timeline of visa, flights, surgery, recovery stay and follow-ups. The return flight
        is only planned for after the recovery period for your procedure. Payment stages shown are an illustration of a planned feature; no payments exist yet.
      </PageHead>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6">
        <MedicalDisclaimer />
      </div>
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 sm:px-6 text-muted">Loading planner…</div>}>
        <JourneyTool />
      </Suspense>
    </>
  );
}
