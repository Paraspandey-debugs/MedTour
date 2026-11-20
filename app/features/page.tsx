import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import FeatureIcon from "@/components/Icons";
import { Reveal } from "@/components/motion";
import { FEATURE_GROUPS, STATUS_STYLE } from "@/lib/features";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every MedTour tool in one place: hospital comparison, total cost calculator, report analysis, AI assistant, quote requests, safe-to-fly trip plan, destination guides and member benefits.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHead eyebrow="Feature outline" title="Everything you need for surgery abroad.">
        Tools grouped by the stage of your journey, from comparing hospitals to the day you fly home.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav aria-label="Feature groups" className="sticky top-16 z-30 -mx-1 mb-10 flex gap-2 overflow-x-auto bg-cream/85 px-1 py-3 backdrop-blur-md">
          {FEATURE_GROUPS.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="btn btn-ghost whitespace-nowrap !py-1.5 text-xs hover:!border-tealBrand hover:!text-tealBrand">
              {g.label}
            </a>
          ))}
        </nav>

        <div className="space-y-16 pb-20">
          {FEATURE_GROUPS.map((g, gi) => (
            <section key={g.id} id={g.id} className="scroll-mt-36" aria-labelledby={`${g.id}-h`}>
              <Reveal>
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-5xl text-tealSoft/70 num" aria-hidden>{String(gi + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 id={`${g.id}-h`} className="font-serif text-3xl">{g.label}</h2>
                    <p className="text-sm text-muted">{g.blurb}</p>
                  </div>
                </div>
              </Reveal>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {g.features.map((f, i) => (
                  <Reveal key={f.id} delay={(i % 2) * 100}>
                    <article className="card card-hover flex h-full flex-col p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid size-11 place-items-center rounded-xl bg-mint text-tealBrand">
                          <FeatureIcon name={f.icon} className="size-5" />
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[f.status]}`}>{f.status}</span>
                      </div>
                      <h3 className="mt-4 font-serif text-2xl text-ink">{f.title}</h3>
                      <p className="mt-0.5 text-sm font-medium text-tealBrand">{f.tagline}</p>
                      <p className="mt-3 text-sm text-muted leading-relaxed">{f.description}</p>
                      <ul className="mt-4 space-y-1.5 text-sm text-ink">
                        {f.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2">
                            <svg viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-tealBrand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M4 10.5l4 4 8-9" />
                            </svg>
                            {h}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs text-muted border-l-2 border-sand pl-3">{f.note}</p>
                      <Link href={f.href} className="btn btn-ghost group mt-5 min-h-11 self-start">
                        {f.cta} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
