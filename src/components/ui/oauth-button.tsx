"use client";

import { useState } from "react";
import { backend, type OAuthProvider } from "@/lib/backend";
import { asset } from "@/lib/asset";

/**
 * Third-party sign-in. Renders nothing when the backend offers no providers,
 * which is the case for the browser-local stand-in: a Google button that
 * cannot work is worse than no button.
 *
 * `redirectTo` must be one of the URLs on the project's allow-list, or the
 * provider refuses the round trip. The list lives in the InsForge auth config,
 * not here.
 */
export function OAuthButtons({ redirectTo }: { redirectTo: string }) {
  const [busy, setBusy] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (backend.oauthProviders.length === 0) return null;

  async function start(provider: OAuthProvider) {
    setError(null);
    setBusy(provider);
    try {
      // On success the browser leaves for the provider and never comes back
      // to this function, so there is no success branch to write.
      await backend.startOAuth(provider, redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the provider.");
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {backend.oauthProviders.includes("google") && (
        <button
          type="button"
          onClick={() => start("google")}
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-3 border border-rule bg-ground-raised px-5 py-3 text-base font-medium text-ink transition-colors hover:border-glow/60 hover:bg-glow/10 disabled:opacity-50"
        >
          <GoogleMark />
          {busy === "google" ? "Opening Google…" : "Continue with Google"}
        </button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-rule" />
        <span className="label">or</span>
        <span className="h-px flex-1 bg-rule" />
      </div>
    </div>
  );
}

/**
 * Google requires its mark to be drawn in its own four brand colours, so this
 * is the one place on the site that ignores the palette. Inline rather than
 * from an icon set because no icon library ships the multicolour version.
 */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/** The club's own mark, for the moments a page needs to feel signed. */
export function Emblem({ size = 28 }: { size?: number }) {
  return (
    <img
      src={asset("static/img/emblem-128.png")}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ filter: "drop-shadow(0 0 10px rgb(var(--glow) / 0.6))" }}
    />
  );
}
