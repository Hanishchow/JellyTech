"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { asset } from "@/lib/asset";

/**
 * Upstream particulate-medusae, unmodified, at /lab/original.
 *
 * The point of this route is to settle a question with evidence rather than
 * argument: does the original actually run on this hardware? It was dropped
 * earlier because its shaders would not compile, but that was measured while
 * the browser was in a bad state, and the same browser has since compiled
 * modern shaders without complaint. So it is worth one honest test.
 *
 * The only change to upstream is the one already made: the demo's `index`
 * controller is replaced by `App.startBackground()`, because index wires a
 * control panel whose elements do not exist here and throws on the first one.
 * The physics, the geometry, the shaders and the post-effect chain are
 * untouched.
 */
const SCRIPTS = [
  "static/medusae/lib/three/three.js",
  "static/medusae/libs.develop.js",
  "static/medusae/shader-chunks.develop.js",
  "static/medusae/shaders.develop.js",
  "static/medusae/app.develop.js",
];

type State = "loading" | "running" | "failed";

export function LabOriginalPage() {
  const [state, setState] = useState<State>("loading");
  const [detail, setDetail] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    // Upstream logs shader failures through console.error rather than throwing,
    // so the only way to know whether it really rendered is to listen.
    const problems: string[] = [];
    const realError = console.error;
    console.error = (...args: unknown[]) => {
      problems.push(args.map(String).join(" ").slice(0, 200));
      realError(...args);
    };

    function load(src: string) {
      return new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
          `script[data-lab="${src}"]`
        );
        if (existing) return resolve();
        const script = document.createElement("script");
        script.src = asset(src);
        script.dataset.lab = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`failed to load ${src}`));
        document.body.appendChild(script);
      });
    }

    SCRIPTS.reduce(
      (chain, src) => chain.then(() => (cancelled ? undefined : load(src))),
      Promise.resolve<void>(undefined)
    )
      .then(() => {
        if (cancelled) return;
        const scene = window.App?.startBackground?.();
        // Give it a moment to compile and draw before judging it.
        window.setTimeout(() => {
          if (cancelled) return;
          console.error = realError;
          const shaderTrouble = problems.filter((p) =>
            /shader|program|compile|context/i.test(p)
          );
          setDetail(shaderTrouble.slice(0, 4));
          setState(scene && shaderTrouble.length === 0 ? "running" : "failed");
        }, 2500);
      })
      .catch((err: Error) => {
        console.error = realError;
        setDetail([err.message]);
        setState("failed");
      });

    return () => {
      cancelled = true;
      console.error = realError;
      window.App?.stopBackground?.();
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a060e]">
      {/* Upstream's MainScene reads these two ids on construction. */}
      <div id="container" className="absolute inset-0" />
      <div id="container-graphs" className="hidden" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <div className="pointer-events-auto max-w-sm">
          <p className="label">Lab · upstream, unmodified</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            particulate-medusae as published: verlet physics, r72 shaders, the
            full post-effect chain.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em]">
            {state === "loading" && <span className="text-ink-faint">Compiling…</span>}
            {state === "running" && <span className="text-glow-bright">Running</span>}
            {state === "failed" && <span className="text-signal">Failed on this machine</span>}
          </p>
          {detail.length > 0 && (
            <ul className="mt-3 space-y-1 text-[11px] leading-relaxed text-signal/80">
              {detail.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
        <Link
          to="/lab/medusa"
          className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.12em] text-glow-bright"
        >
          Compare: ours
        </Link>
      </div>
    </div>
  );
}
