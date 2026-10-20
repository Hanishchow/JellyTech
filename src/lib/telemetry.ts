/* =============================================================================
   First-party page counts and error reports.

   Written to two insert-only tables in the club's own InsForge project (see
   insforge/migrations/003_hardening.sql). There is no third-party script and no
   cookie, and nothing identifying is stored: a page path, the host a visitor
   arrived from (once per visit), a time. Not the IP address, not an id, not the
   signed-in member. The privacy page says exactly this, so change one and the
   other together.

   Everything fails silently. A broken counter must never be the reason a page
   breaks, and the error reporter in particular must not report its own failures.
   ============================================================================= */

import { insforge } from "@/lib/insforge";

const MAX_ERRORS_PER_VISIT = 10;

let lastPath: string | null = null;
let firstView = true;
let errorsSent = 0;
const seenErrors = new Set<string>();

/** Off in development, off without a backend, and off when the browser says Do Not Track. */
function active() {
  if (!import.meta.env.PROD || !insforge) return false;
  const dnt =
    navigator.doNotTrack ??
    (window as unknown as { doNotTrack?: string }).doNotTrack;
  return dnt !== "1" && dnt !== "yes";
}

function clip(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

/** The part of the referrer worth keeping: where from, never which page. */
function referrerHost(): string | null {
  if (!firstView || !document.referrer) return null;
  try {
    const host = new URL(document.referrer).hostname;
    return host && host !== window.location.hostname ? clip(host, 100) : null;
  } catch {
    return null;
  }
}

export function trackPageView(pathname: string) {
  // The panel and the lab benches are for the team, not the audience.
  if (pathname.startsWith("/admin") || pathname.startsWith("/lab")) return;
  if (!active() || pathname === lastPath) return;
  lastPath = pathname;

  const row = { path: clip(pathname, 200), referrer_host: referrerHost() };
  firstView = false;

  try {
    void Promise.resolve(insforge!.database.from("page_views").insert(row)).catch(() => {});
  } catch {
    /* a counter is not worth a crash */
  }
}

export function reportError(message: string, source?: string) {
  if (!active() || errorsSent >= MAX_ERRORS_PER_VISIT) return;

  const text = clip(message.trim() || "Unknown error", 500);
  // The same fault in a render loop would otherwise fill the table in a second.
  if (seenErrors.has(text)) return;
  seenErrors.add(text);
  errorsSent += 1;

  try {
    const row = {
      message: text,
      source: source ? clip(source, 200) : null,
      path: clip(window.location.pathname, 200),
    };
    void Promise.resolve(insforge!.database.from("client_errors").insert(row)).catch(() => {});
  } catch {
    /* never report the reporter */
  }
}

/** Messages that are the browser or an extension talking, not this site's code. */
const NOISE = [/ResizeObserver loop/i, /^Script error\.?$/i, /Non-Error promise rejection/i];

/** Where a script lives, without the host or query string. */
function where(file?: string, line?: number) {
  if (!file) return undefined;
  try {
    const path = new URL(file, window.location.href).pathname;
    return line ? `${path}:${line}` : path;
  } catch {
    return undefined;
  }
}

export function installErrorReporting() {
  window.addEventListener("error", (event) => {
    if (NOISE.some((rule) => rule.test(event.message))) return;
    reportError(event.message, where(event.filename, event.lineno));
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "";
    if (!message || NOISE.some((rule) => rule.test(message))) return;
    reportError(`Unhandled rejection: ${message}`);
  });
}
