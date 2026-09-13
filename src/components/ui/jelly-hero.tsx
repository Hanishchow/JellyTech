"use client";

import { useEffect, useRef, useState } from "react";
import { createJellyField } from "@/components/ui/jelly-field";
import { asset } from "@/lib/asset";

/**
 * The hero: particulate-medusae, as published.
 *
 * The club's jellyfish is upstream's, unmodified, because it looks better than
 * anything worth rebuilding by hand and it runs. An earlier pass replaced it
 * after concluding its shaders would not compile here; that was measured while
 * the browser had exhausted its WebGL contexts and every context creation was
 * failing, upstream's included. It was fine all along.
 *
 * The single change to upstream is in app.develop.js: its `index` controller is
 * replaced by App.startBackground(), because `index` wires the demo's control
 * panel and throws on the first element that does not exist here. The physics,
 * geometry, shaders and post-effect chain are untouched.
 *
 * If WebGL is genuinely unavailable, the canvas-2D field takes over rather than
 * leaving a black rectangle. That path is cheap to keep, and it is the only
 * thing between a machine without WebGL and an empty front page.
 */
const SIM_SCRIPTS = [
  "static/medusae/lib/three/three.js",
  "static/medusae/libs.develop.js",
  "static/medusae/shader-chunks.develop.js",
  "static/medusae/shaders.develop.js",
  "static/medusae/app.develop.js",
];

declare global {
  interface Window {
    App?: {
      startBackground?: () => unknown;
      stopBackground?: () => void;
    };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    // Upstream defines its globals once and cannot be re-evaluated cleanly, so
    // a second visit reuses the scripts already in the document.
    if (document.querySelector(`script[data-sim="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = asset(src);
    script.dataset.sim = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function JellyHero() {
  const fallbackRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let field: { destroy(): void } | null = null;

    function useFallback() {
      const canvas = fallbackRef.current;
      if (!canvas || cancelled) return;
      setFallback(true);
      field = createJellyField(canvas, { count: 6 });
    }

    SIM_SCRIPTS.reduce(
      (chain, src) => chain.then(() => (cancelled ? undefined : loadScript(src))),
      Promise.resolve<void>(undefined)
    )
      .then(() => {
        if (cancelled) return;
        // startBackground returns null when the renderer cannot be built.
        if (!window.App?.startBackground?.()) useFallback();
      })
      .catch(() => useFallback());

    return () => {
      cancelled = true;
      window.App?.stopBackground?.();
      field?.destroy();
    };
  }, []);

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-ground-deep">
      {/* Upstream's MainScene appends its renderer into #container and reads
          #container-graphs on construction, so both must exist before it
          starts. Fixed rather than absolute, so the animal stays put while the
          page scrolls over it.

          pointer-events-none is load-bearing, not tidiness. MainScene attaches
          THREE.TrackballControls to this element, and TrackballControls binds
          the wheel for zoom and calls preventDefault on it. This div is fixed
          across the whole viewport at every scroll position, so with pointer
          events on, the wheel never reaches the document and the entire site
          cannot be scrolled. Taking the element out of hit-testing lets the
          wheel through; the demo's click-to-nudge goes with it, which a
          background has no use for. */}
      <div id="container" className="pointer-events-none fixed inset-0 z-0" />
      <div id="container-graphs" className="hidden" aria-hidden="true" />

      <canvas
        ref={fallbackRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 h-full w-full"
        style={{ display: fallback ? "block" : "none" }}
      />

      {/* No emblem over the top any more. It sat in the middle of the frame,
          which is exactly where the animal swims, and a logo laid over the
          subject is the one thing guaranteed to spoil both. The mark is in the
          navbar and again in the footer; the hero is the jellyfish. */}

      {/* A bloom from the floor, so it reads as water rather than a flat black
          rectangle, and the section below is entered rather than cut to. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 112%, rgb(var(--glow) / 0.18), transparent 72%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-ground"
      />
    </section>
  );
}
