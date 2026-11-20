import { Metadata } from "next";
import OnboardingWizard from "./OnboardingWizard";
import { PageHead } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

export const metadata: Metadata = {
  title: "Welcome to MedTour | Patient Onboarding",
  description:
    "Get started with your personalized medical journey. Select your origin location with our interactive 3D route globe, choose your surgical specialty, and configure your companion recovery plan.",
  openGraph: {
    title: "Welcome to MedTour | Patient Onboarding",
    description:
      "Interactive medical onboarding with live 3D route globe, procedure cost comparisons, and companion recovery planning.",
  },
};

export default function OnboardingPage() {
  return (
    <>
      <PageHead
        eyebrow="Welcome Patient"
        title="Design your cross-border medical journey."
      >
        Tell us where you are starting from and what care you need. Our interactive routing engine pairs your
        origin with verified international medical centers, transparent travel windows, and companion accommodations.
      </PageHead>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 mb-8">
        <MedicalDisclaimer />
      </div>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <OnboardingWizard />
      </main>
    </>
  );
}
