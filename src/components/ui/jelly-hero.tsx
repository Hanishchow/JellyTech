"use client";

import { useEffect, useRef, useState } from "react";
import { createJellyField } from "@/components/ui/jelly-field";
import { StampsPile } from "@/components/ui/stamps-pile";
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

/**
 * Bump when anything under public/static/medusae changes. These files have
 * fixed names, and GitHub Pages lets a browser keep them for ten minutes, so
 * without a version in the URL a visitor could get this component's new code
 * running against the previous deploy's script. The query string makes the two
 * ship together.
 */
const SIM_VERSION = "2026-10-22";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    // Upstream defines its globals once and cannot be re-evaluated cleanly, so
    // a second visit reuses the scripts already in the document.
    if (document.querySelector(`script[data-sim="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = `${asset(src)}?v=${SIM_VERSION}`;
    script.dataset.sim = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`failed to load ${src}`));
    document.body.appendChild(script);
  });
}

/**
 * Resolves once the window has a real size.
 *
 * Upstream reads window.innerWidth/innerHeight exactly once, when the scene is
 * built: the camera distance is `height / 1000` and the post-processing targets
 * are sized from it. A page opened in a window that has not been laid out yet
 * (a background or pre-rendered tab, an unfocused pane) reports 0x0, so the
 * camera is placed at the origin, the targets have zero size, and a narrow-screen
 * framing is chosen because 0 < 768. A resize later fixes the canvas but never
 * re-places the camera, so the animal simply never appears. Waiting costs
 * nothing when the window is already sized, which is nearly always.
 */
function whenSized(isCancelled: () => boolean) {
  return new Promise<void>((resolve) => {
    const ready = () => window.innerWidth > 0 && window.innerHeight > 0;
    if (ready()) return resolve();

    // `resize` is not guaranteed to fire for a window that was never shown, so
    // poll as well.
    const finish = () => {
      window.removeEventListener("resize", check);
      window.clearInterval(timer);
      resolve();
    };
    const check = () => {
      if (isCancelled() || ready()) finish();
    };
    window.addEventListener("resize", check);
    const timer = window.setInterval(check, 200);
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
      .then(() => whenSized(() => cancelled))
      .then(() => {
        if (cancelled) return;
        // Coming back to the home page: the scene from the last visit is still
        // there, paused. Re-use it rather than asking for a second WebGL
        // context; see App.pauseBackground in app.develop.js.
        const host = document.getElementById("container");
        if (host && window.App?.resumeBackground?.(host)) return;
        // Framing is rolled on every load, so no two arrivals are the same
        // photograph. The bounds live in App.FRAMING; /lab/framing is where
        // they get judged.
        if (!window.App?.startBackground?.({ randomFraming: true })) useFallback();
      })
      .catch(() => useFallback());

    return () => {
      cancelled = true;
      // Pause, do not destroy: tearing the context down and rebuilding it on
      // the way back is what left return visits to the home page empty.
      const app = window.App;
      if (app?.pauseBackground) app.pauseBackground();
      else app?.stopBackground?.(); // a script from before pause/resume existed
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

      {/* Section navigation: a fanned hand of stamps in the lower-left corner.
          The jellyfish layer is pointer-events-none, so this sits above it
          without ever touching the animal or the wheel. Bottom-right belongs
          to the music button. */}
      <nav
        aria-label="Sections"
        className="absolute bottom-6 left-4 z-[2] h-[200px] w-[290px] origin-bottom-left scale-[0.78] sm:left-6 sm:scale-100"
      >
        <StampsPile compact />
      </nav>
    </section>
  );
}
