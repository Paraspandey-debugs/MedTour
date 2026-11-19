import { Suspense } from "react";
import { PageHead } from "@/components/ui";
import CostTool from "./CostTool";

export const metadata = { title: "TrueCost estimator" };

export default function CostPage() {
  return (
    <>
      <PageHead eyebrow="TrueCost estimator" title="Compare what you will actually pay - including the risk.">
        Other sites rank by sticker price. TrueCost adds travel, stay and a risk reserve built from
        each hospital&apos;s audited complication rate and your own health profile.
      </PageHead>
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 sm:px-6 text-muted">Loading estimator…</div>}>
        <CostTool />
      </Suspense>
    </>
  );
}
