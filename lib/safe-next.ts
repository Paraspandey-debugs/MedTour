/**
 * Sanitizes redirect targets to prevent open redirect vulnerabilities.
 * Returns `next` only if it starts with a single "/" and not "//" or "/\\",
 * contains no protocol, and doesn't point to /login.
 */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || typeof next !== "string") {
    return fallback;
  }

  const trimmed = next.trim();

  // Must start with exactly one forward slash, not '//' or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Reject backslashes anywhere (browsers sometimes normalize \ to /)
  if (trimmed.includes("\\")) {
    return fallback;
  }

  // Reject any scheme or protocol
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) || trimmed.includes("://")) {
    return fallback;
  }

  try {
    // Parse against a dummy base to inspect the pathname cleanly
    const dummyOrigin = "http://localhost";
    const parsed = new URL(trimmed, dummyOrigin);

    if (parsed.origin !== dummyOrigin) {
      return fallback;
    }

    const cleanPath = parsed.pathname.toLowerCase();
    if (cleanPath === "/login" || cleanPath.startsWith("/login/")) {
      return fallback;
    }

    return trimmed;
  } catch {
    return fallback;
  }
}
