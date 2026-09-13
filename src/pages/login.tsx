"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Masthead, Page, Section, Note } from "@/components/layout/editorial";
import { backend } from "@/lib/backend";
import { OAuthButtons } from "@/components/ui/oauth-button";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const field =
  "w-full border border-rule bg-ground px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const data = new FormData(event.currentTarget);
    try {
      await backend.signIn(
        String(data.get("email") ?? ""),
        String(data.get("password") ?? "")
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <Page>
      <Masthead eyebrow="Members" title="Member login" />

      <Section>
        <div className="max-w-sm border-t border-rule pt-10">
          {/* Google lands back on /dashboard, which sorts out for itself
              whether this person is a member yet or still has an application
              to finish. */}
          <OAuthButtons redirectTo={window.location.origin + import.meta.env.BASE_URL + "dashboard"} />
        </div>

        <form onSubmit={onSubmit} className="max-w-sm space-y-5 pt-8">
          <label className="block">
            <span className="label">Email</span>
            <input name="email" type="email" required className={cn(field, "mt-2")} />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input name="password" type="password" required className={cn(field, "mt-2")} />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <LiquidMetalButton
            type="submit"
            disabled={busy}
            label={busy ? "Signing in…" : "Sign in"}
          />

          <p className="text-sm text-ink-muted">
            Not a member yet?{" "}
            <Link to="/join" className="text-glow-bright underline underline-offset-4">
              Apply to join
            </Link>
            .
          </p>
        </form>

        {!backend.isLive && (
          <div className="mt-12 max-w-xl">
            <Note>
              Member accounts are not live yet. Until the club's backend is
              connected, signing in only recognises an application submitted from
              this same browser, and no password is checked. Nothing here is
              secure, and nothing is stored on a server.
            </Note>
          </div>
        )}
      </Section>
    </Page>
  );
}
