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
        eyebrow="Account"
        title="Sign in or create an account"
      >
        An account lets you save quote requests, use the assistant and see your activity in one place.
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
                  Open dashboard →
                </Link>
                <Link href="/coordinator" className="btn btn-ghost w-full text-xs">
                  Ask the assistant →
                </Link>
                <Link href="/security" className="btn btn-ghost w-full text-xs">
                  Security &amp; privacy →
                </Link>
              </div>

              <form action={signout} className="pt-4 border-t border-line">
                <button type="submit" className="text-xs text-coral font-semibold hover:underline">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display text-2xl">MedTour Account</h2>
                <p className="text-xs text-muted mt-1">
                  Save quote requests and use the assistant.
                </p>
              </div>

              <LoginForm
                initialError={params.error}
                initialSuccess={params.success}
                nextUrl={safeNext(params.next)}
              />

              <div className="mt-6 pt-4 border-t border-line text-center text-xs text-muted">
                <span>Public pages (</span>
                <Link href="/match" className="text-teal hover:underline font-medium">Analyse my report</Link>
                <span>, </span>
                <Link href="/cost" className="text-teal hover:underline font-medium">Total cost</Link>
                <span>, </span>
                <Link href="/hospitals" className="text-teal hover:underline font-medium">Hospitals</Link>
                <span>, </span>
                <Link href="/journey" className="text-teal hover:underline font-medium">Trip plan</Link>
                <span>) remain open to everyone.</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <Disclaimer>
            Sign-in is handled by Supabase Auth. Your account page and the assistant require you to be signed in.
          </Disclaimer>
        </div>
      </div>
    </>
  );
}
