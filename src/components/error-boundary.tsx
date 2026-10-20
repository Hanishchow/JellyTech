"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "@/lib/telemetry";

/**
 * Catches a render failure in one page so it shows a message instead of a blank
 * screen, and files the report. The router remounts it per route (via `key`), so
 * leaving the broken page is enough to recover.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const where = info.componentStack?.split("\n").find((line) => line.trim())?.trim();
    reportError(`Render error: ${error.message}`, where);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="mx-auto max-w-page px-6 pb-24 pt-40">
        <p className="label">Something broke</p>
        <h1 className="mt-4 font-display text-heading">This page failed to load.</h1>
        <p className="measure mt-4 text-ink-muted">
          It has been reported to the team automatically. Reloading usually fixes it; if it
          does not, the other pages are unaffected.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border border-glow/40 px-5 py-2.5 text-ink transition-colors hover:bg-glow hover:text-white"
          >
            Reload the page
          </button>
          <a
            href={import.meta.env.BASE_URL}
            className="px-5 py-2.5 text-glow-bright underline underline-offset-4"
          >
            Go to the home page
          </a>
        </div>
      </div>
    );
  }
}
