import { Suspense } from "react";
import { PageHead } from "@/components/ui";
import JourneyTool from "./JourneyTool";

export const metadata = { title: "Journey planner" };

export default function JourneyPage() {
  return (
    <>
      <PageHead eyebrow="Fit-to-Fly journey · Outcome Escrow" title="A travel plan that waits for your body, and a payment plan that waits for your result.">
        Visa, flights, surgery, recovery stay and follow-ups on one clinical timeline - with the
        return flight locked behind medical clearance.
      </PageHead>
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 sm:px-6 text-muted">Loading planner…</div>}>
        <JourneyTool />
      </Suspense>
    </>
  );
}
