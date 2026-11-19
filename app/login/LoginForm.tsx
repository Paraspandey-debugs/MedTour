"use client";

import { useState } from "react";
import { login, signup } from "./actions";

interface LoginFormProps {
  initialError?: string;
  initialSuccess?: string;
  nextUrl?: string;
}

export default function LoginForm({ initialError, initialSuccess, nextUrl = "/dashboard" }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex rounded-full bg-sand/60 p-1 mb-6 border border-line">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
            mode === "login" ? "bg-teal text-white shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
            mode === "signup" ? "bg-teal text-white shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          Create Account
        </button>
      </div>

      {initialError && (
        <div className="mb-4 rounded-xl bg-coral/15 border border-coral/30 p-3 text-xs text-coral font-medium">
          {initialError}
        </div>
      )}

      {initialSuccess && (
        <div className="mb-4 rounded-xl bg-mint border border-teal/30 p-3 text-xs text-deep font-medium">
          {initialSuccess}
        </div>
      )}

      <form
        action={mode === "login" ? login : signup}
        onSubmit={() => setLoading(true)}
        className="space-y-4"
      >
        <input type="hidden" name="next" value={nextUrl} />

        <div>
          <label className="label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="patient@example.com"
            autoComplete="email"
            className="field !text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="label !mb-0" htmlFor="password">
              Password
            </label>
            {mode === "login" && (
              <span className="text-[11px] text-muted">Minimum 6 characters</span>
            )}
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="field !text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full mt-2 disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : mode === "login"
            ? "Sign In to MedTour"
            : "Create Patient Account"}
        </button>
      </form>
    </div>
  );
}
