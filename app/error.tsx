"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="card max-w-lg w-full p-8 text-center space-y-5">
        <div className="size-14 rounded-full bg-blush text-coral flex items-center justify-center text-2xl mx-auto">
          ⚠️
        </div>

        <div>
          <h1 className="font-display text-3xl text-ink">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            An unexpected error occurred while loading this page. You can try refreshing or return to the hospital comparison.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary text-xs"
          >
            Try Again
          </button>
          <Link href="/hospitals" className="btn btn-ghost text-xs border border-line">
            Compare Hospitals
          </Link>
          <Link href="/" className="btn btn-ghost text-xs border border-line">
            Return Home
          </Link>
        </div>

        <p className="text-[11px] text-muted pt-2 border-t border-line">
          Informational prototype. In an emergency, contact your local healthcare provider or emergency services.
        </p>
      </div>
    </div>
  );
}
