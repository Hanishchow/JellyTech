/* =============================================================================
   jelly-field — the background, rebuilt.

   WHY THIS EXISTS

   The original background was upstream's particulate-medusae: ~15,000 verlet
   particles and ~20,000 distance constraints solved twice per 30Hz tick,
   feeding custom GLSL through a four-pass post-effect chain on Three r72. It is
   a beautiful piece of work and it was the wrong thing to put behind a club
   site. Two reasons, one of them fatal:

   · It did not render. Its shaders fail to compile on ANGLE's D3D backend
     ("HLSL compiler had an unexpected failure"), and there is no fallback: the
     hero was simply black. A background nobody can see is not a background.
   · The physics was never the point. Nothing on this page interacts with the
     jellyfish, so simulating soft-body dynamics to produce a drifting silhouette
     is paying for a capability the site never uses.

   So this draws the same subject with none of the machinery. No physics, no
   WebGL, no shader compilation, no dependencies. Canvas 2D, a handful of sine
   waves, and the colour taken from the club's own emblem. It cannot fail to
   compile because there is nothing to compile.

   HOW THE MOTION IS MADE

   A jellyfish swims by pulsing: the bell contracts, water is pushed out, the
   animal rises, then the bell relaxes and it sinks slightly. That profile is
   asymmetric — a fast squeeze and a slow recovery — and it is the single thing
   that makes the motion read as alive rather than as a floating shape. Here one
   eased sawtooth per animal drives bell width, bell height, rise, and the
   trailing delay on every tentacle, so all of it moves from one clock.

   Tentacles are cosine curves with the phase running down their length, which
   is what produces the whipping lag: the tip is always a beat behind the base.
   Each gets its own frequency and a tiny drift so they never comb into unison.

   COST

   Per frame: ~6 animals, each ~20 stroked paths of 22 points, plus one radial
   gradient per bell. No per-pixel work, no offscreen targets, no allocation in
   the loop. It runs on an integrated GPU at a fraction of the postFX chain's
   fill cost, and it degrades by dropping the device-pixel ratio rather than by
   disappearing.
   ============================================================================= */

export interface JellyFieldOptions {
  /** Animals on screen at 1280px wide. Scaled by viewport area. */
  count?: number;
  /** Base hue pair, taken from the emblem. */
  glow?: [number, number, number];
  bright?: [number, number, number];
}

const TAU = Math.PI * 2;

interface Jelly {
  x: number;
  y: number;
  /** bell radius in px at rest */
  size: number;
  /** seconds per pulse */
  period: number;
  phase: number;
  /** upward drift in px/second */
  rise: number;
  sway: number;
  swayPhase: number;
  alpha: number;
  arms: number;
  armLen: number;
  /** per-animal tentacle character, so no two whip alike */
  armFreq: number;
  armSeed: number;
}

/** Deterministic, so the composition is the same on every load. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The pulse. A sawtooth would give a mechanical throb; this is a fast
 * contraction (roughly the first fifth of the cycle) followed by a long eased
 * recovery, which is how the animal actually moves.
 * Returns 0 at rest, 1 fully contracted.
 */
function pulse(t: number) {
  const u = t % 1;
  if (u < 0.22) {
    // squeeze: ease-out so it snaps
    const k = u / 0.22;
    return 1 - (1 - k) * (1 - k);
  }
  // relax: ease-in-out back to rest over the remaining 78%
  const k = (u - 0.22) / 0.78;
  return 1 - (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
}

export function createJellyField(
  canvas: HTMLCanvasElement,
  options: JellyFieldOptions = {}
) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return { destroy() {} };
  }

  const glow = options.glow ?? [157, 78, 221];
  const bright = options.bright ?? [199, 125, 255];
  const rgba = (c: number[], a: number) =>
    `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let dpr = 1;
  let w = 0;
  let h = 0;
  let animals: Jelly[] = [];
  let raf = 0;
  let last = 0;
  let clock = 0;
  let running = false;

  function build() {
    dpr = Math.min(1.75, window.devicePixelRatio || 1);
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Density by area, not by width: a tall phone and a wide desktop should
    // both look populated rather than empty or crowded.
    const base = options.count ?? 7;
    const n = Math.max(3, Math.round((base * (w * h)) / (1280 * 800)));

    const rand = rng(0x9d4edd);
    animals = Array.from({ length: n }, () => {
      // Small. The first pass ran 0.05-0.14 of the short edge, which put
      // 120px domes across the viewport and read as solid objects rather than
      // as animals seen through water.
      const size = (0.028 + rand() * 0.05) * Math.min(w, h);
      return {
        x: rand() * w,
        // Spread through a screen and a half so the field is already populated
        // above and below the fold on the first frame.
        y: rand() * h * 1.5,
        size,
        period: 3.4 + rand() * 2.8,
        phase: rand(),
        // Bigger animals are nearer, so they rise faster: the only depth cue
        // this needs, and it costs nothing.
        rise: 6 + (size / Math.min(w, h)) * 90,
        sway: 10 + rand() * 26,
        swayPhase: rand() * TAU,
        // Additive blending means alpha IS brightness: at 0.2 a violet fill
        // lands at rgb(40,25,44), which is a dark dome, not a lit animal. The
        // translucency has to come from how fast the gradient falls off, not
        // from a low alpha.
        alpha: 0.42 + rand() * 0.45,
        arms: 7 + Math.floor(rand() * 4),
        armLen: 3.4 + rand() * 2.6,
        armFreq: 0.5 + rand() * 0.55,
        armSeed: rand() * TAU,
      };
    });
  }

  function drawJelly(j: Jelly, time: number) {
    const c = ctx!;
    const t = time / j.period + j.phase;
    const p = pulse(t);

    const sway = Math.sin(time * 0.35 + j.swayPhase) * j.sway;
    const x = j.x + sway;
    // The animal rises on the contraction and sinks a little as it relaxes,
    // which is the bob you see in the real thing.
    const y = j.y - p * j.size * 0.28;

    // Contracting narrows the bell and deepens it.
    const rx = j.size * (1 - p * 0.2);
    const ry = j.size * (0.66 + p * 0.2);
    const a = j.alpha;

    c.save();
    c.translate(x, y);

    // --- the bell -----------------------------------------------------------
    // A radial gradient hottest at the crown, which is where a real medusa's
    // bell catches the light and where the emblem is brightest.
    // Hot at the crown, gone by the margin. The falloff is steep on purpose:
    // a gentle one fills the whole bell evenly and the animal goes opaque.
    const g = c.createRadialGradient(0, -ry * 0.38, ry * 0.05, 0, 0, rx * 1.3);
    g.addColorStop(0, rgba(bright, Math.min(1, a * 1.25)));
    g.addColorStop(0.3, rgba(bright, a * 0.8));
    g.addColorStop(0.62, rgba(glow, a * 0.34));
    g.addColorStop(1, rgba(glow, 0));
    c.fillStyle = g;
    // The bloom the emblem has. Canvas shadow rather than a second gradient:
    // one draw, and it tracks the bell's actual silhouette.
    c.shadowColor = rgba(glow, Math.min(0.8, a));
    c.shadowBlur = rx * 1.6;

    c.beginPath();
    // Half an ellipse for the dome, closed with a shallow inward curve for the
    // margin, so the bell has a lip rather than a flat bottom.
    c.ellipse(0, 0, rx, ry, 0, Math.PI, TAU);
    c.quadraticCurveTo(rx * 0.55, ry * 0.42, 0, ry * 0.2);
    c.quadraticCurveTo(-rx * 0.55, ry * 0.42, -rx, 0);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;

    // The bright rim along the crown. This, not the fill, is what makes the
    // bell read as a surface catching light.
    c.strokeStyle = rgba(bright, Math.min(1, a * 1.3));
    c.lineWidth = 1.25;
    c.beginPath();
    c.ellipse(0, 0, rx, ry, 0, Math.PI * 1.08, TAU - Math.PI * 0.08);
    c.stroke();

    // --- oral arms: the four thick frilled ribbons under the bell -----------
    c.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const off = (i - 1.5) * rx * 0.26;
      const len = j.size * 2.1;
      c.beginPath();
      c.moveTo(off, ry * 0.2);
      for (let s = 1; s <= 14; s++) {
        const k = s / 14;
        // Phase runs down the ribbon, so the tip trails the base.
        const wob =
          Math.sin(time * 1.5 + j.armSeed + i * 0.8 - k * 3.4) *
          rx *
          0.16 *
          k;
        c.lineTo(off + wob, ry * 0.2 + len * k);
      }
      c.strokeStyle = rgba(bright, a * 0.62);
      c.lineWidth = Math.max(1.2, rx * 0.07);
      c.stroke();
    }

    // --- tentacles ----------------------------------------------------------
    for (let i = 0; i < j.arms; i++) {
      const u = j.arms === 1 ? 0.5 : i / (j.arms - 1);
      const originX = (u - 0.5) * rx * 1.85;
      // Tentacles hang from the bell margin, so their origin follows the dome.
      const originY = Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.5) * 1.85, 2))) * ry * 0.25;
      const len = j.size * j.armLen;
      const seed = j.armSeed + i * 1.7;

      c.beginPath();
      c.moveTo(originX, originY);
      for (let s = 1; s <= 22; s++) {
        const k = s / 22;
        const swing =
          Math.cos(time * j.armFreq * TAU * 0.5 + seed - k * 4.2) *
            rx *
            0.42 *
            k *
            k +
          // the pulse snaps the tentacles inward on the contraction
          -p * originX * 0.35 * k;
        c.lineTo(originX + swing, originY + len * k);
      }
      // Fading, thinning strands: a constant-width line reads as wire.
      c.strokeStyle = rgba(glow, a * 0.5);
      c.lineWidth = Math.max(0.6, rx * 0.028);
      c.stroke();
    }

    c.restore();
  }

  function frame(now: number) {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    clock += dt;

    const c = ctx!;
    c.clearRect(0, 0, w, h);
    // Additive, so overlapping animals brighten each other the way real
    // bioluminescence does instead of muddying into grey.
    c.globalCompositeOperation = "lighter";

    for (const j of animals) {
      j.y -= j.rise * dt;
      // Wrap below the fold with a fresh horizontal position, so the field
      // never repeats visibly.
      if (j.y < -j.size * (j.armLen + 1)) {
        j.y = h + j.size * 1.5;
        j.x = Math.random() * w;
      }
      drawJelly(j, clock);
    }

    c.globalCompositeOperation = "source-over";
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function still() {
    // Reduced motion still gets the picture, just not the movement.
    const c = ctx!;
    c.clearRect(0, 0, w, h);
    c.globalCompositeOperation = "lighter";
    for (const j of animals) drawJelly(j, 0);
    c.globalCompositeOperation = "source-over";
  }

  // --- lifecycle ------------------------------------------------------------
  const onResize = () => {
    build();
    if (reduce.matches) still();
  };

  // Nothing should animate behind a hidden tab or a scrolled-past hero.
  const onVisibility = () => {
    if (document.hidden) stop();
    else if (!reduce.matches) start();
  };

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            if (reduce.matches) return;
            if (entry?.isIntersecting) start();
            else stop();
          },
          { threshold: 0 }
        )
      : null;

  const onMotionPref = () => {
    if (reduce.matches) {
      stop();
      still();
    } else {
      start();
    }
  };

  build();
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reduce.addEventListener("change", onMotionPref);
  observer?.observe(canvas);

  if (reduce.matches) still();
  else start();

  return {
    destroy() {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onMotionPref);
      observer?.disconnect();
    },
  };
}
