"use client";

import { useState } from "react";
import { backend } from "@/lib/backend";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const field =
  "w-full border border-rule bg-ground px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-glow-bright focus:outline-none";

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
 * inbox back, and the core team reads it with the admin key.
 */
export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setState("sending");

    const data = new FormData(event.currentTarget);
    try {
      await backend.contact({
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        subject: String(data.get("subject") ?? "General enquiry"),
        body: String(data.get("body") ?? "").trim(),
      });
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
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6 border-t border-rule pt-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="label">Your name</span>
          <input name="name" required className={cn(field, "mt-2")} />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input name="email" type="email" required className={cn(field, "mt-2")} />
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
        <textarea name="body" rows={5} required className={cn(field, "mt-2 resize-y")} />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <LiquidMetalButton
        type="submit"
        disabled={state === "sending"}
        label={state === "sending" ? "Sending…" : "Send message"}
      />
    </form>
  );
}
