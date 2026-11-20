import { Metadata } from "next";
import TourismExplorer from "./TourismExplorer";
import { PageHead } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

export const metadata: Metadata = {
  title: "Medical Tourism & Destination Convalescence Guides | MedTour",
  description:
    "Explore top medical tourism destinations worldwide. Discover certified post-op recovery residences, companion itineraries, fast-track medical visas, and gentle convalescence activities in Thailand, India, Türkiye, South Korea, Malaysia, and beyond.",
  openGraph: {
    title: "Medical Tourism & Destination Convalescence Guides | MedTour",
    description:
      "Plan your recovery journey abroad. Compare destination climates, e-Medical visa requirements, companion itineraries, and vetted convalescence hotels.",
  },
};

export default function TourismPage() {
  return (
    <>
      <PageHead
        eyebrow="Destinations & Recovery Tourism"
        title="Heal in comfort. Explore medical destinations & convalescence guides."
      >
        A successful medical journey extends beyond the operating theatre. Explore curated convalescent hotels,
        e-Medical visa fast-tracks, 5-day companion itineraries, and gentle recovery activities across the world&apos;s
        leading healthcare hubs.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-8">
        <MedicalDisclaimer />
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <TourismExplorer />
      </main>
    </>
  );
}
