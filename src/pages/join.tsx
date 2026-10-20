"use client";

import { useEffect, useState } from "react";
import { Masthead, Page, Section, Plates, Note } from "@/components/layout/editorial";
import {
  backend,
  DEPARTMENTS,
  INTERESTS,
  type Department,
  type Interest,
  type PendingAccount,
} from "@/lib/backend";
import { Link } from "react-router-dom";
import { OAuthButtons } from "@/components/ui/oauth-button";
import { ContactForm } from "@/components/ui/contact-form";
import { FieldError, Honeypot, looksAutomated, useFormClock } from "@/components/ui/form-bits";
import { LIMITS, validateApplication, type FieldErrors } from "@/lib/validate";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const WHY = [
  { term: "No biotechnology background required", detail: "The club is biotechnology-led but AIT-wide. Electronics, CS/AI, mechanical, aeronautical and design students all have something to contribute." },
  { term: "No minimum commitment", detail: "Participation is flexible by design. Come to one visit, write one explainer, or run a team. All of it counts." },
  { term: "Any year", detail: "First-years are explicitly welcome; the Cultural & Engagement team exists partly to make sure opportunities reach them." },
];

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Postgraduate", "Faculty / staff"];

const field =
  "w-full border border-rule bg-ground px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none aria-[invalid=true]:border-destructive";

export function JoinPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const elapsed = useFormClock();

  // Someone who signed in with Google already has an account but no
  // membership. They finish the same form, minus the password they would
  // never use.
  const [pending, setPending] = useState<PendingAccount | null>(null);
  const [checkedPending, setCheckedPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    backend
      .pendingAccount()
      .then((found) => {
        if (!cancelled) {
          setPending(found);
          setCheckedPending(true);
        }
      })
      .catch(() => {
        if (!cancelled) setCheckedPending(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (interest: Interest) =>
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest]
    );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const details = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      usn: String(data.get("usn") ?? "").trim() || undefined,
      // A select still on its disabled placeholder is left out of FormData, and
      // String(null) would read as a real answer.
      department: String(data.get("department") ?? "") as Department,
      year: String(data.get("year") ?? ""),
      interests,
      motivation: String(data.get("motivation") ?? "").trim() || undefined,
    };

    const problems = validateApplication(
      {
        ...details,
        password: pending ? undefined : String(data.get("password") ?? ""),
      },
      backend.passwordMinLength
    );
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;

    // A script gets the same "recorded" screen a person does and nothing is stored.
    if (looksAutomated(data, elapsed())) {
      setState("done");
      return;
    }

    setState("sending");
    try {
      if (pending) {
        await backend.completeApplication(details);
      } else {
        await backend.apply({
          ...details,
          password: String(data.get("password") ?? ""),
        });
      }
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("idle");
    }
  }

  return (
    <Page>
      <Masthead
        eyebrow="Join"
        title="Open to every department"
        standfirst="JellyTech is a co-curricular club, not a course. Tell us who you are and which side of the work interests you, and the Cultural & Engagement team will be in touch when the founding intake opens."
      />

      {/* Brand film — full-bleed, its own breathing room */}
      <div className="relative overflow-hidden" style={{ height: "clamp(280px, 55vh, 680px)" }}>
        <video
          src={`${import.meta.env.BASE_URL}brand-film.mp4`}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* fade to ground at top and bottom */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgb(7 5 12) 0%, transparent 18%, transparent 82%, rgb(7 5 12) 100%)",
          }}
        />
      </div>

      <Section title="Who it is for">
        <Plates items={WHY} />
      </Section>

      <Section title="Membership application">
        {checkedPending && !pending && state !== "done" && (
          <div className="max-w-sm border-t border-rule pt-10">
            {/* Coming back to /join rather than /dashboard: the account will
                exist but the membership will not, and this page is where that
                gets finished. */}
            <OAuthButtons
              redirectTo={window.location.origin + import.meta.env.BASE_URL + "join"}
            />
          </div>
        )}

        {pending && (
          <p className="measure border-l-4 border-glow bg-glow/10 px-7 py-6 leading-relaxed text-ink-muted">
            Signed in as <span className="text-ink">{pending.email}</span>. The
            account exists; the club still needs the details below.
          </p>
        )}
        {state === "done" ? (
          <div className="border-t border-rule pt-10">
            <p className="font-display text-heading">Application recorded.</p>
            <p className="measure mt-4 text-ink-muted">
              You will hear from the Cultural &amp; Engagement team once the
              founding intake opens. Your account is active now, so you can sign
              in to the member area any time.
            </p>
            <ol className="measure mt-8 list-decimal space-y-2 pl-5 text-ink-muted marker:text-glow-bright">
              <li>
                Open{" "}
                <Link to="/dashboard" className="text-glow-bright underline underline-offset-4">
                  your member page
                </Link>
                {pending ? "." : " and confirm your email address with a 6-digit code."}
              </li>
              <li>
                Look through{" "}
                <Link to="/programs" className="text-glow-bright underline underline-offset-4">
                  what is coming up
                </Link>{" "}
                and{" "}
                <Link to="/team" className="text-glow-bright underline underline-offset-4">
                  who runs what
                </Link>
                .
              </li>
              <li>Forgot your password later? Use the reset link on the sign-in page.</li>
            </ol>
            {!backend.isLive && (
              <div className="mt-8">
                <Note>
                  Note: the club's backend is not connected yet, so this
                  application is stored in this browser only. Nothing has been
                  sent to anyone. The form is ready to submit for real the moment
                  the backend is linked.
                </Note>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className={cn(
              "relative grid gap-10 pt-10 lg:grid-cols-[1fr_20rem]",
              !pending && "border-t border-rule"
            )}
          >
            <Honeypot />
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Full name</span>
                  <input
                    name="name"
                    required
                    maxLength={LIMITS.name}
                    autoComplete="name"
                    defaultValue={pending?.name ?? ""}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "join-name-error" : undefined}
                    className={cn(field, "mt-2")}
                  />
                  <FieldError id="join-name-error" message={errors.name} />
                </label>
                <label className="block">
                  <span className="label">Email</span>
                  {/* Read-only once Google has vouched for it: the row is keyed
                      to that account either way, so letting the two disagree
                      would only produce a record nobody can be reached at. */}
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={LIMITS.email}
                    autoComplete="email"
                    defaultValue={pending?.email ?? ""}
                    readOnly={!!pending}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "join-email-error" : undefined}
                    className={cn(field, "mt-2", pending && "text-ink-muted")}
                  />
                  <FieldError id="join-email-error" message={errors.email} />
                </label>
                <label className="block">
                  <span className="label">USN (optional)</span>
                  <input
                    name="usn"
                    maxLength={LIMITS.usn}
                    aria-invalid={!!errors.usn}
                    aria-describedby={errors.usn ? "join-usn-error" : undefined}
                    className={cn(field, "mt-2")}
                  />
                  <FieldError id="join-usn-error" message={errors.usn} />
                </label>
                {!pending && (
                  <label className="block">
                    <span className="label">
                      Password ({backend.passwordMinLength}+ characters)
                    </span>
                    {/* Applying creates the account, which is what makes the
                        member area mean anything later. Someone who arrived
                        via Google already has one. */}
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={backend.passwordMinLength}
                      maxLength={128}
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "join-password-error" : undefined}
                      className={cn(field, "mt-2")}
                    />
                    <FieldError id="join-password-error" message={errors.password} />
                  </label>
                )}
                <label className="block">
                  <span className="label">Year</span>
                  <select
                    name="year"
                    required
                    defaultValue=""
                    aria-invalid={!!errors.year}
                    aria-describedby={errors.year ? "join-year-error" : undefined}
                    className={cn(field, "mt-2")}
                  >
                    <option value="" disabled>Select</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <FieldError id="join-year-error" message={errors.year} />
                </label>
              </div>

              <label className="block">
                <span className="label">Department</span>
                <select
                  name="department"
                  required
                  defaultValue=""
                  aria-invalid={!!errors.department}
                  aria-describedby={errors.department ? "join-department-error" : undefined}
                  className={cn(field, "mt-2")}
                >
                  <option value="" disabled>Select</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <FieldError id="join-department-error" message={errors.department} />
              </label>

              <fieldset>
                <legend className="label">Where you would like to contribute</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const active = interests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggle(interest)}
                        aria-pressed={active}
                        className={cn(
                          "border px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-glow bg-glow text-white"
                            : "border-rule text-ink-muted hover:border-glow/60 hover:text-ink"
                        )}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="block">
                <span className="label">Anything you want us to know (optional)</span>
                <textarea
                  name="motivation"
                  rows={4}
                  maxLength={LIMITS.motivation}
                  aria-invalid={!!errors.motivation}
                  aria-describedby={errors.motivation ? "join-motivation-error" : undefined}
                  className={cn(field, "mt-2 resize-y")}
                />
                <FieldError id="join-motivation-error" message={errors.motivation} />
              </label>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <LiquidMetalButton
                type="submit"
                disabled={state === "sending"}
                label={state === "sending" ? "Submitting…" : "Submit application"}
              />
            </div>

            <aside className="space-y-6 border-t border-rule pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div>
                <p className="label">Not applying?</p>
                <p className="measure mt-3 text-sm leading-relaxed text-ink-muted">
                  Speaker suggestions, media pitches, department collaborations
                  and alumni introductions do not need a membership. Use the
                  contact form at the foot of this page.
                </p>
              </div>
              <div>
                <p className="label">Where we are</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Department of Biotechnology<br />
                  Acharya Institute of Technology<br />
                  Bengaluru
                </p>
              </div>
            </aside>
          </form>
        )}
      </Section>

      <Section
        title="Get in touch"
        intro="For anything that is not a membership application: speakers, media, other departments, alumni, funding."
      >
        <ContactForm />
      </Section>
    </Page>
  );
}
