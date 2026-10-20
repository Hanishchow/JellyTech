"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Masthead, Page, Section, Note } from "@/components/layout/editorial";
import { backend } from "@/lib/backend";
import { FieldError } from "@/components/ui/form-bits";
import { checkCode, checkEmail, checkPassword } from "@/lib/validate";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const field =
  "w-full border border-rule bg-ground px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none aria-[invalid=true]:border-destructive";

/** The server will not mail a second code inside this window. */
const RESEND_SECONDS = 60;

type Step = "email" | "code" | "password" | "done";

/**
 * Three steps on one page: ask for a code, prove you have it, choose a new
 * password. The first step answers the same way whether or not the address has
 * an account, so this page cannot be used to find out who is a member.
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  async function send(address: string) {
    setError(null);
    setBusy(true);
    try {
      await backend.requestPasswordReset(address);
      setEmail(address);
      setWait(RESEND_SECONDS);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function onEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const problem = checkEmail(address);
    setFieldError(problem ?? undefined);
    if (problem) return;
    await send(address);
  }

  async function onCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    const problem = checkCode(code);
    setFieldError(problem ?? undefined);
    if (problem) return;

    setError(null);
    setBusy(true);
    try {
      setToken(await backend.confirmResetCode(email, code));
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is not right.");
    } finally {
      setBusy(false);
    }
  }

  async function onPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = String(data.get("password") ?? "");
    const again = String(data.get("again") ?? "");
    const problem =
      checkPassword(next, backend.passwordMinLength) ??
      (next !== again ? "The two passwords do not match." : null);
    setFieldError(problem ?? undefined);
    if (problem) return;

    setError(null);
    setBusy(true);
    try {
      await backend.resetPassword(token, next);
      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not set the new password. Start again from the first step."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <Masthead
        eyebrow="Members"
        title="Reset your password"
        standfirst="Enter the email you joined with. If it has an account, we send a six-digit code to it."
      />

      <Section>
        <div className="max-w-sm border-t border-rule pt-10">
          {step === "email" && (
            <form onSubmit={onEmail} noValidate className="space-y-5">
              <label className="block">
                <span className="label">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  defaultValue={email}
                  aria-invalid={!!fieldError}
                  aria-describedby={fieldError ? "reset-field-error" : undefined}
                  className={cn(field, "mt-2")}
                />
                <FieldError id="reset-field-error" message={fieldError} />
              </label>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <LiquidMetalButton
                type="submit"
                disabled={busy}
                label={busy ? "Sending…" : "Send the code"}
              />
            </form>
          )}

          {step === "code" && (
            <form onSubmit={onCode} noValidate className="space-y-5">
              <p className="text-sm text-ink-muted">
                If <span className="text-ink">{email}</span> has an account, a code is on its
                way. It can take a minute and may land in spam.
              </p>
              <label className="block">
                <span className="label">6-digit code</span>
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  aria-invalid={!!fieldError}
                  aria-describedby={fieldError ? "reset-field-error" : undefined}
                  className={cn(field, "mt-2 tracking-[0.4em]")}
                />
                <FieldError id="reset-field-error" message={fieldError} />
              </label>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <LiquidMetalButton
                type="submit"
                disabled={busy}
                label={busy ? "Checking…" : "Check the code"}
              />
              <p className="text-sm text-ink-muted">
                <button
                  type="button"
                  disabled={busy || wait > 0}
                  onClick={() => send(email)}
                  className="text-glow-bright underline underline-offset-4 disabled:text-ink-faint disabled:no-underline"
                >
                  {wait > 0 ? `Send another code in ${wait}s` : "Send another code"}
                </button>
                {" · "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setFieldError(undefined);
                    setStep("email");
                  }}
                  className="text-glow-bright underline underline-offset-4"
                >
                  Use a different email
                </button>
              </p>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={onPassword} noValidate className="space-y-5">
              <label className="block">
                <span className="label">New password ({backend.passwordMinLength}+ characters)</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={backend.passwordMinLength}
                  maxLength={128}
                  autoComplete="new-password"
                  aria-invalid={!!fieldError}
                  aria-describedby={fieldError ? "reset-field-error" : undefined}
                  className={cn(field, "mt-2")}
                />
              </label>
              <label className="block">
                <span className="label">Type it again</span>
                <input
                  name="again"
                  type="password"
                  required
                  maxLength={128}
                  autoComplete="new-password"
                  aria-invalid={!!fieldError}
                  className={cn(field, "mt-2")}
                />
                <FieldError id="reset-field-error" message={fieldError} />
              </label>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <LiquidMetalButton
                type="submit"
                disabled={busy}
                label={busy ? "Saving…" : "Set new password"}
              />
            </form>
          )}

          {step === "done" && (
            <div className="space-y-5">
              <p className="font-display text-heading">Password changed.</p>
              <p className="text-ink-muted">Sign in with the new one.</p>
              <LiquidMetalButton type="button" onClick={() => navigate("/login")} label="Go to sign in" />
            </div>
          )}

          {step !== "done" && (
            <p className="mt-8 text-sm text-ink-muted">
              Remembered it?{" "}
              <Link to="/login" className="text-glow-bright underline underline-offset-4">
                Back to sign in
              </Link>
              .
            </p>
          )}
        </div>

        {!backend.isLive && (
          <div className="mt-12 max-w-xl">
            <Note>
              Password reset needs the club's live backend, which this build does not
              have, so no code will be sent.
            </Note>
          </div>
        )}
      </Section>
    </Page>
  );
}
