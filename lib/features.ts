// Single source of truth for the product feature outline.
// Used by the homepage FeatureExplorer and the /features page.

export type FeatureStatus = "Live" | "Guided" | "Premium";

export interface Feature {
  id: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  href: string;
  cta: string;
  status: FeatureStatus;
  note: string;
  icon: "scale" | "file" | "calc" | "route" | "globe" | "chat" | "shield" | "gift" | "building" | "inbox";
}

export interface FeatureGroup {
  id: string;
  label: string;
  blurb: string;
  features: Feature[];
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "compare",
    label: "Compare",
    blurb: "See the whole trip cost, not just the sticker price.",
    features: [
      {
        id: "compare-hospitals",
        title: "Hospital comparison",
        tagline: "Every hospital ranked by what the whole trip costs.",
        description:
          "Pick a procedure and your home country. Each hospital gets a total trip cost, and you can sort by lowest cost, rating or shortest trip.",
        highlights: [
          "Stacked cost breakdown per hospital",
          "Sort by cost, rating or trip length",
          "Advanced filters for specialty and accreditation",
          "Open any hospital for a full summary",
        ],
        href: "/hospitals",
        cta: "Compare hospitals",
        status: "Live",
        note: "Calculated from current partner pricing",
        icon: "scale",
      },
      {
        id: "cost-calculator",
        title: "Total cost calculator",
        tagline: "Tune the assumptions and watch the total move.",
        description:
          "Adjust companion travel, stay length and risk, and see how flights, recovery, visa, insurance and a complication buffer change the bottom line.",
        highlights: [
          "Companion on or off",
          "Procedure, flights, stay, visa, insurance in one view",
          "Complication buffer shown as its own line",
          "Side-by-side with private treatment at home",
        ],
        href: "/cost",
        cta: "Open calculator",
        status: "Live",
        note: "Estimates based on published partner packages",
        icon: "calc",
      },
    ],
  },
  {
    id: "understand",
    label: "Understand",
    blurb: "Turn your own health documents into a clearer picture.",
    features: [
      {
        id: "report-analysis",
        title: "Report analysis",
        tagline: "Upload a report, get a personal estimate.",
        description:
          "Drop in a prescription or lab report. AI extracts the likely procedure and key biomarkers, then adjusts the cost and recovery estimate for you.",
        highlights: [
          "PDF, PNG, JPG and WebP supported",
          "Detected procedure with confidence and manual override",
          "Biomarker cards such as HbA1c, BMI and blood pressure",
          "Questions to ask your surgeon",
        ],
        href: "/match",
        cta: "Analyse my report",
        status: "Live",
        note: "AI-assisted, informational only, not medical advice",
        icon: "file",
      },
      {
        id: "assistant",
        title: "AI assistant",
        tagline: "Ask general questions in plain language.",
        description:
          "Aria answers general questions about procedures, travel and recovery. She is an AI, not a clinician, and never replaces your own doctor.",
        highlights: [
          "General information only",
          "Grounded in the built-in clinical knowledge base",
          "Requires sign-in",
          "Clear not-a-clinician labelling",
        ],
        href: "/coordinator",
        cta: "Ask the assistant",
        status: "Live",
        note: "Requires sign-in, general information only",
        icon: "chat",
      },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    blurb: "From requesting a quote to flying home safely.",
    features: [
      {
        id: "quote",
        title: "Quote requests",
        tagline: "Shortlist hospitals and request a quote.",
        description:
          "Send a quote request from any hospital page and track it on your dashboard alongside your saved plans and trip timeline.",
        highlights: [
          "One short form per hospital",
          "Saved to your private dashboard",
          "Protected by row-level security",
          "Track every request in one place",
        ],
        href: "/dashboard",
        cta: "View dashboard",
        status: "Live",
        note: "Stored securely in your MedTour account",
        icon: "inbox",
      },
      {
        id: "trip-plan",
        title: "Safe-to-fly trip plan",
        tagline: "A day-by-day timeline that waits until it is safe.",
        description:
          "Get a timeline covering surgery, hospital stay, local recovery and tele follow-ups, with an earliest safe date to fly home for your procedure.",
        highlights: [
          "Procedure-specific recovery windows",
          "Tele follow-up reminders",
          "Earliest safe-to-fly date with the reason",
          "Companion-friendly schedule",
        ],
        href: "/journey",
        cta: "Build my plan",
        status: "Guided",
        note: "Planning guidance; your surgeon sets the final date",
        icon: "route",
      },
      {
        id: "destinations",
        title: "Destinations and recovery",
        tagline: "Heal somewhere comfortable.",
        description:
          "Browse destination guides with recovery hotels, visa notes, gentle activities and companion itineraries for the leading medical hubs.",
        highlights: [
          "Guides for Thailand, India, Türkiye, Korea, Malaysia and more",
          "Recovery hotels and gentle activities",
          "Companion itineraries",
          "Convalescence budget estimate",
        ],
        href: "/tourism",
        cta: "Explore destinations",
        status: "Guided",
        note: "Curated destination guides",
        icon: "globe",
      },
    ],
  },
  {
    id: "trust",
    label: "Travel with confidence",
    blurb: "Payment protection, rewards and verified partners in one place.",
    features: [
      {
        id: "escrow",
        title: "Milestone payments",
        tagline: "Pay in stages as the journey progresses.",
        description:
          "Payments are released as care is delivered, with a 15% holdback kept until your post-return check. If something goes wrong, the disputed stage is paused for review.",
        highlights: [
          "Funds released at each care milestone",
          "15% holdback until your follow-up",
          "Dispute review when something goes wrong",
          "Full security and privacy overview",
        ],
        href: "/security",
        cta: "See how it works",
        status: "Premium",
        note: "Staged payment overview",
        icon: "shield",
      },
      {
        id: "rewards",
        title: "Offers and rewards",
        tagline: "Get more from every procedure and follow-up.",
        description:
          "Earn HealthMiles on every procedure and redeem them toward recovery hotel upgrades, companion flights and annual follow-ups with your surgeon.",
        highlights: [
          "HealthMiles on every booking",
          "Recovery hotel and companion offers",
          "MedTour Plus bonus miles",
          "Member-only support",
        ],
        href: "/loyalty",
        cta: "Explore rewards",
        status: "Premium",
        note: "MedTour Plus member benefits",
        icon: "gift",
      },
      {
        id: "partners",
        title: "For hospitals",
        tagline: "A verification path for real providers.",
        description:
          "Hospitals join MedTour by completing a six-step verification audit, publishing outcome data and agreeing to fair ranking rules with no pay-to-rank placement.",
        highlights: ["Six-step verification audit", "Outcome and accreditation checks", "Partner onboarding form", "No paid ranking"],
        href: "/partners",
        cta: "See hospital partnership",
        status: "Premium",
        note: "Partner onboarding",
        icon: "building",
      },
    ],
  },
];

export const ALL_FEATURES: Feature[] = FEATURE_GROUPS.flatMap((g) => g.features);

export const STATUS_STYLE: Record<FeatureStatus, string> = {
  Live: "bg-mint text-deep",
  Guided: "bg-terracottaSoft text-terracotta",
  Premium: "bg-sand text-muted",
};

export const FAQ: [string, string][] = [
  [
    "Can I book surgery through MedTour?",
    "Yes. Compare hospitals, request a quote from a hospital page and track every request in your dashboard. For clinical advice, speak with a licensed doctor.",
  ],
  [
    "How is the total trip cost calculated?",
    "We add the hospital package price, return flights, recovery stay, meals and transport, visa and insurance, a service fee, and a complication buffer based on typical risk for the procedure.",
  ],
  [
    "What is the complication buffer?",
    "An allowance for the chance that something goes wrong and needs extra care. It is a planning estimate, not a prediction about you.",
  ],
  [
    "Is the report analysis medical advice?",
    "No. It is AI-assisted and informational only. Always discuss results and decisions with your own doctor.",
  ],
  [
    "What happens to my data?",
    "Your quote requests and saved plans are stored in your account and protected with row-level security. See the privacy policy for how we handle documents.",
  ],
];
