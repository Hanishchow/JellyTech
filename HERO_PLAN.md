# JellyTech Hero — particulate-medusae analysis (SAVED, NOT BUILT)

> Status: inspection + compute estimate only. No port, no scaffold, no integration.
> Source: https://github.com/milcktoast/particulate-medusae (cloned --depth 1, 2026-09-12)
> License: Artistic-2.0 — fork/adapt allowed, keep attribution to Ash Weeks (milcktoast).

## What it is
Soft-body jellyfish: CPU verlet particle physics (Particulate) driving Three.js
geometry, with custom GLSL hood/tentacle/dust shaders + fullscreen postFX chain.
2014-era stack: Three.js r72, Grunt + Bower, global-namespace JS (no modules/TS).

Key files (in upstream repo):
- `static/js/items/Medusae.js` — geometry + physics + materials (~1091 lines)
- `static/js/items/Dust.js` — 8000 ambient dust points
- `static/js/scenes/MainScene.js` — renderer, postFX chain, fixed-step loop
- `static/js/utils/Looper.js` — fixed-timestep loop (30 Hz physics, interpolated render)
- `static/glsl/shaders/` — bulb, gel, tentacle, tail, dust, lerp shaders
- `static/js/post-processing/LensDirtPass.js` — lens-dirt effect (200 quads, 2048 texture)

## Measured counts (from source params)
- Ring size: `totalSegments = 36` verts per ring
- Tentacles: 3 groups × rings (120 + 110 + 100) = 330 rings × 36 ≈ **11,880 particles**
- Mouth arms: 4×200 + 3×160 + 6×100 ≈ **1,880 particles**
- Bulb ribs (20) + tail ribs (15) rings ≈ **1,260 particles**
- **Medusae total ≈ ~15,000 physics particles**
- Distance constraints ≈ **~18–22k** (ring/radial/skin/brace/pin links)
- Relaxation: **2 iterations/tick** (`ParticleSystem.create(verts, 2)`)
- Timestep: fixed **30 Hz** (`Looper`, `1/30*1000`), render interpolated every rAF
- Dust: **8,000 GPU points** (pure vertex-shader drift, ~zero CPU)
- PostFX per frame: RenderPass → BloomPass (kernel 25, σ8, res 512) →
  LensDirtPass (200 quads / 2048² texture) → Vignette → screen
- Pixel ratio: `clamp(1.5, 2, devicePixelRatio)` — up to **2× DPR** fullscreen
- Audio: WebAudio bg loop + interaction bubbles (recommend: DROP for club site)

## Compute estimate (order-of-magnitude, desktop 1080p)
| Stage | Cost | Notes |
|---|---|---|
| Physics CPU/tick | ~1.5 MFLOP (~1–3 ms) | 15k verlet + 20k constraints × 2 iters @30 Hz ≈ 45 MFLOPS — trivial |
| Vertex GPU | ~25k verts | trivial for any WebGL GPU |
| Fragment/postFX | DOMINANT | 4 fullscreen passes @up to 2× DPR (8.3M px) + 512 bloom + 2048 lens-dirt; fill-rate bound on iGPU/mobile |
| Memory | <30 MB | particle buffers ~5 MB + lens-dirt 2048² RGBA 16 MB + shaders |
| Load | shader compile + buffer upload | ~10 shader programs; first-frame jank is the main risk |

Verdict: physics is cheap; **fill-rate + postFX is the cost**. iGPU/mobile fullscreen
at 2× DPR with bloom + lens-dirt is the worst case. Everything in the hero plan
below attacks exactly that.

## Approved direction (pending site-layout steps from founder)
1. Hero = jellyfish canvas, full-viewport, behind headline + CTA.
2. Animate ONLY while hero owns the scroll (top ~1 viewport): rAF + physics running,
   optional pointer-nudge (raycast repulsor already exists in `nudgeMedusae`).
3. Past threshold: freeze → render one final frame, cancel rAF, stop physics ticks.
   Canvas keeps last frame = free "static element", ~0 CPU/GPU afterwards.
4. Also freeze when: hero off-screen (IntersectionObserver), tab hidden
   (`visibilitychange`), prefers-reduced-motion (show static first frame only).
5. Tetris loader overlay: masks shader compile + buffer upload; init scene behind
   it, render N warm-up frames, reveal on ready (NOT on fixed timeout).
   NOTE: keep loader main-thread-light so it doesn't fight shader compile.
6. Perf budget for the port: DPR cap 1.25–1.5, bloom optional/downscaled,
   lens-dirt OFF or quarter-res, dust 8k → 3–4k, single jellyfish, no audio.
   Target: <3 ms CPU/frame desktop, 60 fps on iGPU, graceful static fallback.

## Port reality check (important for Step 2)
Upstream is Three r72 + globals + Grunt — it will NOT run inside a modern
React + TS + shadcn stack as-is. The port is a rewrite of the sim core against
modern three (npm, modules), as an isolated vanilla-canvas module (NOT
react-three-fiber — avoids reconciler overhead on a per-frame scene):
- Keep: verlet layout/params (counts above), shader looks, Looper pattern.
- Drop: audio, debug UI, color controls, TrackballControls (hero is not a demo page).
- New: scroll-freeze controller, loader handshake, reduced-motion path.

## Log
- Saved 2026-09-12. No code ported, nothing installed, nothing integrated.
- Next: founder gives site layout step by step; hero section spec comes from that.

## Live demo (original upstream, for look/feel review ONLY)
- URL: http://127.0.0.1:8931/index.html (local, serves hand-rolled `develop`
  build of upstream — Grunt 0.4 can't run on Node 24, so the build was
  replicated with `medusae-build.py` + dart-sass + fetched period deps:
  three r72, particulate 0.3.2, noisejs perlin).
- Demo lives OUTSIDE this repo (temp clone) — intentionally not committed here.
- Restart if down: run `medusae-server.py` (pythonw, port 8931).
- Review checklist: jellyfish animating? stats panel counts? PostFX toggle?
  click-jelly nudge? any console errors? Report back before hero port.
