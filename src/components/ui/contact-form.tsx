"use client";

import { useState } from "react";
import { backend } from "@/lib/backend";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { FieldError, Honeypot, looksAutomated, useFormClock } from "@/components/ui/form-bits";
import { LIMITS, validateContact, type FieldErrors } from "@/lib/validate";

const field =
  "w-full border border-rule bg-ground px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-glow-bright focus:outline-none aria-[invalid=true]:border-destructive";

const SUBJECTS = [
  "General enquiry",
  "Speaker suggestion",
  "Media or press",
  "Department collaboration",
  "Alumni introduction",
  "Sponsorship or funding",
];

/**
 * Enquiries from people who are not applying for membership: speakers, other
 * departments, alumni, press.
 *
 * This is the only genuinely public write on the site. The `messages` table
 * grants INSERT to everyone and SELECT to nobody, so a sender cannot read the
 * inbox back, and the core team reads it with the admin key. Length limits and
 * a per-minute write cap are enforced by the database (migration 003); the
 * checks and the honeypot here are for the person typing and for crude bots.
 */
export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const elapsed = useFormClock();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const message = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "General enquiry"),
      body: String(data.get("body") ?? "").trim(),
    };

    const problems = validateContact(message);
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;

    // A script gets the same "sent" screen a person does and nothing is stored.
    if (looksAutomated(data, elapsed())) {
      setState("done");
      return;
    }

    setState("sending");
    try {
      await backend.contact(message);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="border-t border-rule pt-10">
        <p className="font-display text-heading">Message sent.</p>
        <p className="measure mt-4 text-ink-muted">
          It reaches the core team, who route it to whichever team it belongs to.
          {!backend.isLive &&
            " Note: the backend is not connected in this build, so it went no further than this browser."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative max-w-2xl space-y-6 border-t border-rule pt-10"
    >
      <Honeypot />
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="label">Your name</span>
          <input
            name="name"
            required
            maxLength={LIMITS.name}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={cn(field, "mt-2")}
          />
          <FieldError id="contact-name-error" message={errors.name} />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={LIMITS.email}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={cn(field, "mt-2")}
          />
          <FieldError id="contact-email-error" message={errors.email} />
        </label>
      </div>

      <label className="block">
        <span className="label">What is this about</span>
        <select name="subject" required defaultValue={SUBJECTS[0]} className={cn(field, "mt-2")}>
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label">Message</span>
        <textarea
          name="body"
          rows={5}
          required
          maxLength={LIMITS.message}
          aria-invalid={!!errors.body}
          aria-describedby={errors.body ? "contact-body-error" : undefined}
          className={cn(field, "mt-2 resize-y")}
        />
        <FieldError id="contact-body-error" message={errors.body} />
      </label>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <LiquidMetalButton
        type="submit"
        disabled={state === "sending"}
        label={state === "sending" ? "Sending…" : "Send message"}
      />
    </form>
  );
}
