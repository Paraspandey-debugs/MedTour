import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hospitalById, treatmentById, TREATMENTS } from "@/lib/data";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

export const metadata = {
  title: "Dashboard",
  description: "Your saved quote requests and activity.",
};

interface QuoteRow {
  id: string;
  hospital_id: string;
  procedure: string;
  preferred_month: string | null;
  created_at: string;
}

interface DossierRow {
  id: string;
  treatment_id: string | null;
  hospital_id: string | null;
  risk_multiplier: number | null;
  status: string | null;
  created_at: string;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [quotesRes, dossierRes] = await Promise.all([
    supabase
      .from("quote_requests")
      .select("id, hospital_id, procedure, preferred_month, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("care_dossiers")
      .select("id, treatment_id, hospital_id, risk_multiplier, status, created_at")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const quotes = (quotesRes.data ?? []) as QuoteRow[];
  const dossier = ((dossierRes.data ?? []) as DossierRow[])[0] ?? null;
  const loadError = Boolean(quotesRes.error);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      <div>
        <p className="eyebrow">Your account</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Signed in as <b className="text-ink">{user.email}</b></p>
      </div>

      <MedicalDisclaimer />

      <section className="card p-5 sm:p-6" aria-labelledby="quotes-h">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="quotes-h" className="font-display text-2xl">Your quote requests</h2>
          <Link href="/hospitals" className="btn btn-ghost min-h-11 text-xs">Compare hospitals</Link>
        </div>
        <p className="mt-1 text-xs text-muted">Your requests are kept together here so you can follow up with each hospital in one place.</p>

        {loadError ? (
          <p role="alert" className="mt-4 text-sm text-terracotta">We could not load your requests right now. Please refresh in a moment.</p>
        ) : quotes.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-sand p-6 text-center">
            <p className="text-sm text-ink font-medium">No quote requests yet</p>
            <p className="mt-1 text-sm text-muted">Compare hospitals for your procedure, open one, and use “Request a quote”.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/hospitals" className="btn btn-primary min-h-11">Compare hospitals</Link>
              <Link href="/match" className="btn btn-ghost min-h-11">Analyse a report</Link>
            </div>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-sand">
            {quotes.map((q) => {
              const h = hospitalById(q.hospital_id);
              const known = TREATMENTS.some((t) => t.id === q.procedure);
              return (
                <li key={q.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-semibold text-ink">{h ? h.name : q.hospital_id}</p>
                    <p className="text-xs text-muted">
                      {known ? treatmentById(q.procedure).name : q.procedure}
                      {q.preferred_month ? ` · preferred ${q.preferred_month}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p>Requested {fmt(q.created_at)}</p>
                    {h && <Link href={`/hospitals/${h.id}`} className="text-teal font-semibold hover:underline">View hospital →</Link>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {dossier && (
        <section className="card p-5 sm:p-6" aria-labelledby="dossier-h">
          <h2 id="dossier-h" className="font-display text-2xl">Latest saved plan</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
            <div><dt className="text-xs text-muted">Procedure</dt><dd className="font-semibold">{dossier.treatment_id ? treatmentById(dossier.treatment_id).name : "Not set"}</dd></div>
            <div><dt className="text-xs text-muted">Hospital</dt><dd className="font-semibold">{(dossier.hospital_id && hospitalById(dossier.hospital_id)?.name) || "Not set"}</dd></div>
            <div><dt className="text-xs text-muted">Saved</dt><dd className="font-semibold">{fmt(dossier.created_at)}</dd></div>
          </dl>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Tools">
        {[
          ["/match", "Analyse my report", "Optional: adjusts your cost estimate to your health data."],
          ["/journey", "Trip plan", "A day-by-day plan including when it is safe to fly home."],
          ["/coordinator", "Ask the assistant", "General questions answered by an AI. Not medical advice."],
        ].map(([href, title, body]) => (
          <Link key={href} href={href} className="card p-5 hover:border-ink/30 transition-colors">
            <p className="font-semibold text-ink">{title}</p>
            <p className="mt-1 text-xs text-muted leading-relaxed">{body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
