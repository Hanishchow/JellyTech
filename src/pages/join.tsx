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
import { OAuthButtons } from "@/components/ui/oauth-button";
import { ContactForm } from "@/components/ui/contact-form";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const WHY = [
  { term: "No biotechnology background required", detail: "The club is biotechnology-led but AIT-wide. Electronics, CS/AI, mechanical, aeronautical and design students all have something to contribute." },
  { term: "No minimum commitment", detail: "Participation is flexible by design. Come to one visit, write one explainer, or run a team. All of it counts." },
  { term: "Any year", detail: "First-years are explicitly welcome; the Cultural & Engagement team exists partly to make sure opportunities reach them." },
];

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Postgraduate", "Faculty / staff"];

const field =
  "w-full border border-rule bg-ground px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none";

export function JoinPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

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
    setState("sending");

    const data = new FormData(event.currentTarget);
    const details = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      usn: String(data.get("usn") ?? "").trim() || undefined,
      department: String(data.get("department")) as Department,
      year: String(data.get("year")),
      interests,
      motivation: String(data.get("motivation") ?? "").trim() || undefined,
    };

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
        standfirst="JELLYTECH is a co-curricular club, not a course. Tell us who you are and which side of the work interests you, and the Cultural & Engagement team will be in touch when the founding intake opens."
      />

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
            className={cn(
              "grid gap-10 pt-10 lg:grid-cols-[1fr_20rem]",
              !pending && "border-t border-rule"
            )}
          >
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Full name</span>
                  <input
                    name="name"
                    required
                    defaultValue={pending?.name ?? ""}
                    className={cn(field, "mt-2")}
                  />
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
                    defaultValue={pending?.email ?? ""}
                    readOnly={!!pending}
                    className={cn(field, "mt-2", pending && "text-ink-muted")}
                  />
                </label>
                <label className="block">
                  <span className="label">USN (optional)</span>
                  <input name="usn" className={cn(field, "mt-2")} />
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
                      autoComplete="new-password"
                      className={cn(field, "mt-2")}
                    />
                  </label>
                )}
                <label className="block">
                  <span className="label">Year</span>
                  <select name="year" required defaultValue="" className={cn(field, "mt-2")}>
                    <option value="" disabled>Select</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="label">Department</span>
                <select name="department" required defaultValue="" className={cn(field, "mt-2")}>
                  <option value="" disabled>Select</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
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
                <textarea name="motivation" rows={4} className={cn(field, "mt-2 resize-y")} />
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}

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
