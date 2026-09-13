"use client";

import { useEffect, useRef } from "react";
import { createJellyField } from "@/components/ui/jelly-field";
import { asset } from "@/lib/asset";

/**
 * The hero. A canvas of drifting jellyfish, the emblem, and nothing else:
 * whatever the site has to say begins under the fold.
 *
 * The old implementation loaded five vendored scripts and a WebGL simulation
 * that never rendered on this machine. This one is a single module with no
 * dependencies, no shaders and no physics. See jelly-field.ts for why.
 */
export function JellyHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const field = createJellyField(canvas, { count: 6 });
    return () => field.destroy();
  }, []);

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-ground-deep">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />

      {/* A bloom from the floor of the hero, so the field sits in water rather
          than on a flat black rectangle, and the section below it is entered
          rather than cut to. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 108%, rgb(var(--glow) / 0.28), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ground"
      />

      <img
        src={asset("static/img/emblem-512.png")}
        alt="JellyTech"
        className="absolute left-1/2 top-1/2 w-[min(46vw,30rem)] -translate-x-1/2 -translate-y-1/2 opacity-95"
        style={{ filter: "drop-shadow(0 0 60px rgb(var(--glow) / 0.55))" }}
      />
    </section>
  );
}
