import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "./actions";
import LoginForm from "./LoginForm";
import { Disclaimer, PageHead } from "@/components/ui";
import { safeNext } from "@/lib/safe-next";

export const metadata = {
  title: "Account Login & Access",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    success?: string;
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <PageHead
        eyebrow="Authentication &amp; Access Control"
        title="Secure Patient &amp; Clinician Access"
      >
        Sign in to access protected clinical tools: 24/7 Care Coordinator Concierge and the
        Zero-Knowledge Escrow Security Vault.
      </PageHead>

      <div className="mx-auto max-w-md px-4 sm:px-6 pb-16">
        <div className="card p-6 sm:p-8 shadow-sm bg-paper">
          {user ? (
            <div className="text-center space-y-4">
              <div className="size-12 rounded-full bg-mint text-teal mx-auto grid place-items-center font-bold text-lg">
                ✓
              </div>
              <h2 className="font-display text-2xl">Authenticated Session</h2>
              <p className="text-xs text-muted">
                Signed in as <b className="text-ink">{user.email}</b>
              </p>

              <div className="pt-2 space-y-2">
                <Link href="/dashboard" className="btn btn-primary w-full text-xs">
                  Open Patient Dashboard →
                </Link>
                <Link href="/coordinator" className="btn btn-ghost w-full text-xs">
                  24/7 Care Concierge →
                </Link>
                <Link href="/security" className="btn btn-ghost w-full text-xs">
                  Security &amp; Escrow Vault →
                </Link>
              </div>

              <form action={signout} className="pt-4 border-t border-line">
                <button type="submit" className="text-xs text-coral font-semibold hover:underline">
                  Sign Out of MedTour
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display text-2xl">MedTour Account</h2>
                <p className="text-xs text-muted mt-1">
                  Access protected clinical journey tracking and smart escrow arbitration.
                </p>
              </div>

              <LoginForm
                initialError={params.error}
                initialSuccess={params.success}
                nextUrl={safeNext(params.next)}
              />

              <div className="mt-6 pt-4 border-t border-line text-center text-xs text-muted">
                <span>All public exploration pages (</span>
                <Link href="/match" className="text-teal hover:underline font-medium">Care Passport</Link>
                <span>, </span>
                <Link href="/cost" className="text-teal hover:underline font-medium">TrueCost</Link>
                <span>, </span>
                <Link href="/hospitals" className="text-teal hover:underline font-medium">Hospitals</Link>
                <span>, </span>
                <Link href="/journey" className="text-teal hover:underline font-medium">Journey</Link>
                <span>) remain open to everyone.</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <Disclaimer>
            MedTour authentication is secured by Supabase Auth with encrypted JWT cookie sessions.
            Protected health routes (/coordinator, /security) enforce server-side user verification via proxy.
          </Disclaimer>
        </div>
      </div>
    </>
  );
}
