"use client";

import { useRef } from "react";

/**
 * A field no person will ever see or reach by keyboard. Scripts that fill in
 * every input they find will fill this one in, and the form quietly drops the
 * submission. It is a speed bump for crude bots, not a defence against a
 * determined one; the database's write cap is what limits the rest.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
    >
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/** Milliseconds since the form first rendered. People are slower than scripts. */
export function useFormClock() {
  const opened = useRef(Date.now());
  return () => Date.now() - opened.current;
}

const TOO_FAST_MS = 2500;

export function looksAutomated(data: FormData, elapsedMs: number) {
  return String(data.get("website") ?? "") !== "" || elapsedMs < TOO_FAST_MS;
}

/** The message under a field, wired up so screen readers announce it. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}
