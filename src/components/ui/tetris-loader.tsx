"use client";

import { useEffect } from "react";

// The jellyfish hero boots by injecting these scripts on mount. Preloading all
// of them during the loading screen warms the HTTP cache so the hero reveals
// into an already-running simulation instead of a blank canvas.
const HERO_ASSETS = [
  "/static/css/style.css",
  "/static/lib/three/three.js",
  "/static/js/libs.develop.js",
  "/static/js/shader-chunks.develop.js",
  "/static/js/shaders.develop.js",
  "/static/js/app.develop.js",
];

interface TetrisLoaderProps {
  minMs?: number;
  onComplete?: () => void;
}

function preloadAsset(url: string, onDone: () => void) {
  if (document.querySelector<HTMLLinkElement>(`link[rel="preload"][href="${url}"]`)) {
    onDone();
    return;
  }
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = url.endsWith(".css") ? "style" : "script";
  link.href = url;
  link.onload = () => onDone();
  link.onerror = () => onDone();
  document.head.appendChild(link);
}

export function TetrisLoader({ minMs = 4000, onComplete }: TetrisLoaderProps) {
  useEffect(() => {
    const screen = document.getElementById("tl-screen");
    if (!screen) {
      onComplete?.();
      return;
    }

    const pctEl = screen.querySelector<HTMLElement>("[data-tl-pct]");
    const barEl = screen.querySelector<HTMLElement>("[data-tl-bar]");
    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let loadedAssets = 0;
    let rafId = 0;
    let finished = false;
    const t0 = performance.now();

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(rafId);
      screen.classList.add("is-done");
      window.setTimeout(() => {
        screen.parentElement?.removeChild(screen);
        onComplete?.();
      }, 650);
    };

    const tick = () => {
      if (finished) return;
      const shareElapsed = Math.min(1, (performance.now() - t0) / minMs);
      const shareAssets = Math.min(1, loadedAssets / HERO_ASSETS.length);
      // The run never finishes before the real work is done (clamp on assets)
      // and never drags past ~minMs (clamp on elapsed). The tetris line clears
      // exactly at 100.
      const p = Math.max(shareElapsed, shareAssets * 0.9);
      screen.style.setProperty("--p", String(p));
      if (pctEl) pctEl.textContent = String(Math.round(p * 100)).padStart(3, "0");
      if (barEl) barEl.style.width = `${p * 100}%`;
      if (p >= 1) {
        finish();
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    if (reduceMotion) {
      HERO_ASSETS.forEach((url) => preloadAsset(url, () => {}));
      finish();
      return () => cancelAnimationFrame(rafId);
    }

    HERO_ASSETS.forEach((url) => preloadAsset(url, () => (loadedAssets += 1)));
    tick();

    return () => cancelAnimationFrame(rafId);
  }, [minMs, onComplete]);

  return null;
}