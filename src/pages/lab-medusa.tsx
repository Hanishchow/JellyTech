"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createMedusaScene } from "@/components/ui/medusa/medusa-scene";

/**
 * A bench for the medusae, at /lab/medusa.
 *
 * Not wired into the hero yet on purpose: the canvas-2D field is what is
 * running in production, and swapping the front page for something unproven is
 * how a site ends up broken for everyone while it is being judged. This route
 * exists so the thing can be looked at on real hardware first.
 */
export function LabMedusaPage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = createMedusaScene(host, { count: 5 });
    setFailed(!scene.ok);
    return () => scene.destroy();
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-ground-deep">
      <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <div className="pointer-events-auto">
          <p className="label">Lab · medusa</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
            Three.js, no physics. The contraction wave is computed per vertex
            from the clock rather than solved.
          </p>
          {failed && (
            <p className="mt-3 max-w-xs text-sm text-signal">
              WebGL is unavailable in this browser, so nothing is drawn here.
            </p>
          )}
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
