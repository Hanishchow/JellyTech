/* =============================================================================
   The scene that carries the medusae.

   Deliberately vanilla three rather than react-three-fiber: this renders every
   frame and never re-renders as React, so a reconciler in the loop would be
   pure overhead. React owns the container element and nothing inside it.

   The lifecycle rules are the ones the old implementation got wrong: stop when
   the tab is hidden, stop when the canvas leaves the viewport, honour
   prefers-reduced-motion, and dispose the context on teardown rather than
   leaving it for the garbage collector. Browsers cap live WebGL contexts at
   around sixteen, and a route you can navigate in and out of will exhaust that
   in a minute if it leaks.

   THE SCENE OWNS ITS CANVAS, AND THAT IS NOT A DETAIL

   It creates its own <canvas> and appends it to the container, rather than
   rendering into one React put there. Because teardown calls
   forceContextLoss(), and a canvas whose context has been force-lost can never
   provide another one: getContext returns null for the rest of that element's
   life.

   React StrictMode mounts every effect twice in development. Sharing React's
   canvas therefore meant the first mount took the context, the cleanup poisoned
   the element, and the second mount got null and threw inside three before it
   drew a single frame. A fresh canvas per mount makes that impossible, and
   costs one DOM node.
   ============================================================================= */

import * as THREE from "three";
import { createMedusa, type MedusaOptions } from "./medusa";

export interface MedusaSceneOptions {
  /** How many animals. Scaled down on small viewports. */
  count?: number;
  glow?: string;
  bright?: string;
  /** Clear colour behind them. */
  ground?: string;
}

/** Deterministic, so the composition is identical on every load. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMedusaScene(
  container: HTMLElement,
  options: MedusaSceneOptions = {}
) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block";

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    // No WebGL at all. The caller keeps whatever was behind the container.
    return { destroy() {}, ok: false };
  }

  container.appendChild(canvas);

  const glow = new THREE.Color(options.glow ?? "#9d4edd");
  const bright = new THREE.Color(options.bright ?? "#c77dff");

  renderer.setClearColor(new THREE.Color(options.ground ?? "#07050c"), 1);
  // Capped rather than honoured: this is a background, and a retina display
  // asking for 3x would triple the fill cost of something nobody is looking
  // straight at.
  renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 600);
  camera.position.set(0, 6, 120);
  camera.lookAt(0, -6, 0);

  const rand = rng(0x9d4edd);
  const animals: ReturnType<typeof createMedusa>[] = [];
  const drift: { speed: number; sway: number; phase: number; baseX: number }[] = [];

  function populate() {
    const wide = container.clientWidth >= 900;
    const count = options.count ?? (wide ? 5 : 3);

    for (let i = 0; i < count; i++) {
      const radius = 5 + rand() * 7;
      const config: MedusaOptions = {
        radius,
        height: radius * 0.82,
        period: 3.6 + rand() * 2.4,
        phase: rand(),
        // Smaller animals read as further away, so they are dimmer.
        opacity: 0.35 + (radius / 12) * 0.5,
      };

      const medusa = createMedusa({ glow, bright }, config);
      const x = (rand() * 2 - 1) * 55;
      medusa.group.position.set(x, (rand() * 2 - 1) * 40, -rand() * 90);
      medusa.group.rotation.y = rand() * Math.PI * 2;
      // A slight lean, so they are not all upright like lamps.
      medusa.group.rotation.z = (rand() * 2 - 1) * 0.22;

      scene.add(medusa.group);
      animals.push(medusa);
      drift.push({
        speed: 1.6 + (radius / 12) * 4,
        sway: 2 + rand() * 5,
        phase: rand() * Math.PI * 2,
        baseX: x,
      });
    }
  }

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;
  let last = 0;
  let clock = 0;
  let running = false;

  function draw() {
    for (let i = 0; i < animals.length; i++) {
      for (const uniforms of animals[i]!.uniforms) {
        uniforms.uTime!.value = clock;
      }
      const d = drift[i]!;
      const group = animals[i]!.group;
      group.position.y += d.speed * (1 / 60);
      group.position.x = d.baseX + Math.sin(clock * 0.22 + d.phase) * d.sway;
      // Wrap below once it has cleared the top, with a new horizontal position
      // so the field never visibly repeats.
      if (group.position.y > 55) {
        group.position.y = -60;
        d.baseX = (Math.random() * 2 - 1) * 55;
      }
    }
    renderer.render(scene, camera);
  }

  function frame(now: number) {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    clock += dt;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce.matches) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const onResize = () => resize();
  const onVisibility = () => (document.hidden ? stop() : start());
  const onMotionPref = () => {
    if (reduce.matches) {
      stop();
      draw();   // one still frame, rather than an empty canvas
    } else {
      start();
    }
  };

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => (entry?.isIntersecting ? start() : stop()),
          { threshold: 0 }
        )
      : null;

  resize();
  populate();
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reduce.addEventListener("change", onMotionPref);
  observer?.observe(container);

  if (reduce.matches) draw();
  else start();

  return {
    ok: true,
    destroy() {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onMotionPref);
      observer?.disconnect();
      for (const animal of animals) {
        scene.remove(animal.group);
        animal.dispose();
      }
      // Hands the context back rather than waiting for collection; browsers
      // allow only a handful at a time.
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
