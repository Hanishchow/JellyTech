"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { asset } from "@/lib/asset";

/**
 * A bench for camera framing, at /lab/framing.
 *
 * The question is not "can the camera be randomised" but "does every roll look
 * deliberate". One good sample proves nothing; the useful test is pulling the
 * lever twenty times and watching for the one that crops the bell or stares
 * down the top of it. So this rolls on demand and prints what it rolled, and
 * the ranges live in App.FRAMING where they can be tightened against whatever
 * this turns up.
 *
 * Nothing here changes the home page. If the ranges hold, the hero opts in by
 * passing { randomFraming: true } to startBackground.
 */
const SCRIPTS = [
  "static/medusae/lib/three/three.js",
  "static/medusae/libs.develop.js",
  "static/medusae/shader-chunks.develop.js",
  "static/medusae/shaders.develop.js",
  "static/medusae/app.develop.js",
];

/** Re-exported from the ambient declaration, for readability below. */
type Framing = MedusaFraming;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[data-sim="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = asset(src);
    script.dataset.sim = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function LabFramingPage() {
  const [framing, setFraming] = useState<Framing | null>(null);
  const [ready, setReady] = useState(false);
  const [rolls, setRolls] = useState(0);

  const roll = useCallback(() => {
    const next = window.App?.randomFraming?.();
    if (!next || !window.App?.scene) return;
    window.App.frameCamera?.(window.App.scene, next);
    setFraming(next);
    setRolls((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    SCRIPTS.reduce(
      (chain, src) => chain.then(() => (cancelled ? undefined : loadScript(src))),
      Promise.resolve<void>(undefined)
    )
      .then(() => {
        if (cancelled) return;
        const scene = window.App?.startBackground?.({ randomFraming: true });
        if (!scene) return;
        setReady(true);
        setFraming(
          (window.App?.scene as { framing?: Framing } | undefined)?.framing ?? null
        );
      })
      .catch(() => setReady(false));

    return () => {
      cancelled = true;
      window.App?.stopBackground?.();
    };
  }, []);

  // Space bar, because pulling the lever twenty times should not mean twenty
  // trips to a button.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        roll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roll]);

  const ranges = window.App?.FRAMING;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a060e]">
      <div id="container" className="pointer-events-none fixed inset-0" />
      <div id="container-graphs" className="hidden" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <div className="pointer-events-auto max-w-xs">
          <p className="label">Lab · framing</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Randomised angle and zoom, within bounds. Roll it repeatedly and
            watch for one that looks like a mistake.
          </p>

          {framing && (
            <dl className="mt-5 space-y-1 font-mono text-[11px] text-ink">
              <div className="flex justify-between gap-6">
                <dt className="text-ink-faint">AZIMUTH</dt>
                <dd>{framing.azimuth.toFixed(1)}°</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-ink-faint">ELEVATION</dt>
                <dd>
                  {framing.elevation.toFixed(1)}°
                  {ranges && (
                    <span className="ml-2 text-ink-faint">
                      [{ranges.elevation[0]}–{ranges.elevation[1]}]
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-ink-faint">ZOOM</dt>
                <dd>
                  {framing.distance.toFixed(3)}×
                  {ranges && (
                    <span className="ml-2 text-ink-faint">
                      [{ranges.distance[0]}–{ranges.distance[1]}]
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-6 pt-2">
                <dt className="text-ink-faint">ROLLS</dt>
                <dd>{rolls}</dd>
              </div>
            </dl>
          )}

          <button
            type="button"
            onClick={roll}
            disabled={!ready}
            className="mt-6 border border-glow/50 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-glow-bright transition-colors hover:bg-glow hover:text-white disabled:opacity-40"
          >
            {ready ? "Roll again · space" : "Starting…"}
          </button>
        </div>

        <Link
          to="/"
          className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.12em] text-glow-bright"
        >
          Back to site
        </Link>
      </div>
    </div>
  );
}
