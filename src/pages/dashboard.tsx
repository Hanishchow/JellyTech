"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Masthead, Page, Section, Note } from "@/components/layout/editorial";
import { backend, type Member, type PendingAccount } from "@/lib/backend";
import { FieldError } from "@/components/ui/form-bits";
import { checkCode } from "@/lib/validate";
import { cn } from "@/lib/utils";

const field =
  "w-full border border-rule bg-ground px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none aria-[invalid=true]:border-destructive";

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[12rem_1fr] sm:gap-8">
      <dt className="label pt-1">{term}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

/**
 * Soft verification: a member can confirm their address, and the page shows
 * whether they have, but nothing on the site is gated on it. A typo'd address
 * is the thing this is for, not access control.
 */
function EmailVerification({ email, onVerified }: { email: string; onVerified: () => void }) {
  const [asked, setAsked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  async function ask() {
    setError(null);
    setBusy(true);
    try {
      await backend.resendVerification(email);
      setAsked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a code.");
    } finally {
      setBusy(false);
    }
  }

  async function check(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    const problem = checkCode(code);
    setFieldError(problem ?? undefined);
    if (problem) return;

    setError(null);
    setBusy(true);
    try {
      await backend.verifyEmail(email, code);
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is not right.");
    } finally {
      setBusy(false);
    }
  }

  if (!asked) {
    return (
      <div className="space-y-2">
        <p>
          Not confirmed.{" "}
          <button
            type="button"
            onClick={ask}
            disabled={busy}
            className="text-glow-bright underline underline-offset-4 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Email me a code"}
          </button>
        </p>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={check} noValidate className="max-w-xs space-y-3">
      <label className="block">
        <span className="text-ink-muted">Enter the 6-digit code sent to {email}</span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          aria-invalid={!!fieldError}
          aria-describedby={fieldError ? "verify-code-error" : undefined}
          className={cn(field, "mt-2 tracking-[0.4em]")}
        />
        <FieldError id="verify-code-error" message={fieldError} />
      </label>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={busy}
          className="border border-glow/40 px-4 py-2 text-ink transition-colors hover:bg-glow hover:text-white disabled:opacity-50"
        >
          {busy ? "Checking…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={ask}
          disabled={busy}
          className="text-glow-bright underline underline-offset-4 disabled:opacity-50"
        >
          Send another
        </button>
      </div>
    </form>
  );
}

/* --- getting started ------------------------------------------------------ */

const ONBOARDING_KEY = "jellytech.onboarding.v1";

interface OnboardingState {
  done: string[];
  dismissed: boolean;
}

function readOnboarding(): OnboardingState {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (raw) return JSON.parse(raw) as OnboardingState;
  } catch {
    /* private browsing: the checklist just starts fresh each visit */
  }
  return { done: [], dismissed: false };
}

function writeOnboarding(state: OnboardingState) {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  } catch {
    /* nothing worth failing over */
  }
}

/**
 * What a new member should do first. Ticks live in this browser only: it is a
 * nudge, not a record, so it neither needs the database nor can be wrong about
 * the member's real status.
 */
function GettingStarted({ verified }: { verified: boolean | null }) {
  const [state, setState] = useState<OnboardingState>(readOnboarding);

  const steps = [
    ...(verified === false
      ? [{ id: "email", text: "Confirm your email address (above).", to: null, auto: false }]
      : []),
    { id: "team", text: "See who runs what: the nine teams.", to: "/team", auto: false },
    { id: "programs", text: "Look at what is coming up.", to: "/programs", auto: false },
    { id: "media", text: "Read what the media team is publishing.", to: "/media", auto: false },
  ];

  const isDone = (id: string) => state.done.includes(id);
  const mark = (id: string) =>
    setState((current) => {
      if (current.done.includes(id)) return current;
      const next = { ...current, done: [...current.done, id] };
      writeOnboarding(next);
      return next;
    });

  if (state.dismissed) return null;

  return (
    <Section title="Getting started">
      <div className="border-t border-rule pt-10">
        <p className="measure text-ink-muted">
          Your application is in. These take a few minutes and make the first meeting easier.
          The Cultural &amp; Engagement team will write to you when the founding intake opens.
        </p>
        <ul className="mt-6 space-y-3">
          {steps.map((step) => {
            const done = isDone(step.id) || (step.id === "email" && verified === true);
            return (
              <li key={step.id} className="flex items-start gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] leading-none",
                    done ? "border-glow bg-glow text-white" : "border-rule"
                  )}
                >
                  {done ? "✓" : ""}
                </span>
                {step.to ? (
                  <Link
                    to={step.to}
                    onClick={() => mark(step.id)}
                    className={cn(
                      "underline underline-offset-4",
                      done ? "text-ink-muted" : "text-glow-bright"
                    )}
                  >
                    {step.text}
                  </Link>
                ) : (
                  <span className={done ? "text-ink-muted" : "text-ink"}>{step.text}</span>
                )}
                <span className="sr-only">{done ? "(done)" : "(not done yet)"}</span>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() =>
            setState((current) => {
              const next = { ...current, dismissed: true };
              writeOnboarding(next);
              return next;
            })
          }
          className="mt-6 text-xs text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          Hide this checklist
        </button>
      </div>
    </Section>
  );
}

/* --- leaving -------------------------------------------------------------- */

function DeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setError(null);
    setBusy(true);
    try {
      await backend.deleteAccount();
      onDeleted();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete the account. Ask the club to remove it for you."
      );
      setBusy(false);
    }
  }

  return (
    <Section title="Leave the club">
      <div className="border-t border-rule pt-10">
        {!open ? (
          <>
            <p className="measure text-ink-muted">
              You can delete your account and membership record yourself, at any time.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-6 border border-rule px-5 py-2.5 text-sm text-ink-muted transition-colors hover:border-destructive hover:text-destructive"
            >
              Delete my account
            </button>
          </>
        ) : (
          <div className="max-w-md space-y-4">
            <p className="text-ink">This cannot be undone.</p>
            <p className="text-sm text-ink-muted">
              Your sign-in and your membership record (name, email, USN, department, year and
              interests) are erased. Messages you sent the club stay, without a link to you. To
              confirm, type <span className="font-mono text-ink">DELETE</span>.
            </p>
            <input
              aria-label="Type DELETE to confirm"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              className={field}
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy || typed.trim() !== "DELETE"}
                onClick={remove}
                className="border border-destructive px-5 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-destructive"
              >
                {busy ? "Deleting…" : "Delete everything"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setOpen(false);
                  setTyped("");
                  setError(null);
                }}
                className="px-5 py-2.5 text-sm text-ink-muted hover:text-ink"
              >
                Keep my account
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

/* --- page ----------------------------------------------------------------- */

export function DashboardPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [pending, setPending] = useState<PendingAccount | null>(null);
  const [checked, setChecked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // The live backend has to ask the server who this is, so the answer
    // arrives a tick late; `checked` keeps the page from flashing the
    // signed-out state at a member who is in fact signed in.
    let cancelled = false;
    backend
      .currentMember()
      .then(async (found) => {
        if (cancelled) return;
        setMember(found);
        // Arriving from Google: authenticated, but the club has no record yet.
        if (!found) setPending(await backend.pendingAccount());
        else setVerified(await backend.emailVerified().catch(() => null));
        if (!cancelled) setChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setChecked(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked) {
    return (
      <Page>
        <Masthead eyebrow="Members" title="One moment" />
        <Section>
          <p role="status" className="label animate-pulse border-t border-rule pt-8">
            Checking your session…
          </p>
        </Section>
      </Page>
    );
  }

  if (failed) {
    return (
      <Page>
        <Masthead eyebrow="Members" title="Could not load your page" />
        <Section>
          <p role="alert" className="measure border-t border-rule pt-10 text-ink-muted">
            Something went wrong reaching the club's server. Check your connection and{" "}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-glow-bright underline underline-offset-4"
            >
              try again
            </button>
            .
          </p>
        </Section>
      </Page>
    );
  }

  if (!member && pending) {
    return (
      <Page>
        <Masthead
          eyebrow="Members"
          title="One step left"
          standfirst={`Signed in as ${pending.email}. The club has no membership record against this account yet.`}
        />
        <Section>
          <p className="measure border-t border-rule pt-10 text-ink-muted">
            <Link to="/join" className="text-glow-bright underline underline-offset-4">
              Finish the application
            </Link>{" "}
            and this page becomes your membership record. It takes a minute: the
            department, year and which teams interest you.
          </p>
        </Section>
      </Page>
    );
  }

  if (!member) {
    return (
      <Page>
        <Masthead eyebrow="Members" title="Not signed in" />
        <Section>
          <p className="measure border-t border-rule pt-10 text-ink-muted">
            <Link to="/login" className="text-glow-bright underline underline-offset-4">
              Sign in
            </Link>{" "}
            to see your membership, or{" "}
            <Link to="/join" className="text-glow-bright underline underline-offset-4">
              apply to join
            </Link>
            .
          </p>
        </Section>
      </Page>
    );
  }

  return (
    <Page>
      <Masthead eyebrow="Members" title={member.name} />

      <Section title="Your membership">
        <dl className="border-t border-rule">
          <Row term="Status">
            {member.status === "applied" ? "Application received" : "Active member"}
          </Row>
          <Row term="Email">{member.email}</Row>
          {verified !== null && (
            <Row term="Email check">
              {verified ? (
                "Confirmed"
              ) : (
                <EmailVerification
                  email={member.email}
                  onVerified={() => setVerified(true)}
                />
              )}
            </Row>
          )}
          {member.usn && <Row term="USN">{member.usn}</Row>}
          <Row term="Department">{member.department}</Row>
          <Row term="Year">{member.year}</Row>
          <Row term="Interests">
            {member.interests.length ? member.interests.join(", ") : "None selected"}
          </Row>
          <Row term="Applied">
            {new Date(member.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Row>
        </dl>

        <button
          type="button"
          onClick={async () => {
            await backend.signOut();
            navigate("/");
          }}
          className="mt-8 border border-rule px-5 py-2.5 text-sm text-ink-muted transition-colors hover:border-glow/60 hover:text-ink"
        >
          Sign out
        </button>
      </Section>

      {member.status === "applied" && <GettingStarted verified={verified} />}

      <Section title="What appears here next">
        <p className="measure border-t border-rule pt-10 text-ink-muted">
          As the first activities run, this page becomes the member's own
          record: opportunities they are eligible for, activities they have
          attended, work they have published, and the team they belong to.
        </p>
        {!backend.isLive && (
          <div className="mt-8">
            <Note>
              The backend is not connected yet, so everything above was read from
              this browser's local storage rather than from an account.
            </Note>
          </div>
        )}
      </Section>

      <DeleteAccount onDeleted={() => navigate("/")} />
    </Page>
  );
}
