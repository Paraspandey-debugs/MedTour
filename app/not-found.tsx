import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="card max-w-lg w-full p-8 text-center space-y-5">
        <div className="size-14 rounded-full bg-sand/60 text-ink flex items-center justify-center font-display text-2xl mx-auto">
          404
        </div>

        <div>
          <h1 className="font-display text-3xl text-ink">Page Not Found</h1>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            The page you are looking for does not exist, was moved, or has an outdated link.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/" className="btn btn-primary text-xs">
            Return Home
          </Link>
          <Link href="/hospitals" className="btn btn-ghost text-xs border border-line">
            Compare Hospitals
          </Link>
          <Link href="/match" className="btn btn-ghost text-xs border border-line">
            Analyse Report
          </Link>
        </div>

        <div className="pt-4 border-t border-line text-xs text-muted">
          Need assistance? Explore our{" "}
          <Link href="/security" className="text-teal hover:underline font-medium">
            Security &amp; Privacy Overview
          </Link>{" "}
          or{" "}
          <Link href="/terms" className="text-teal hover:underline font-medium">
            Terms of Use
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
