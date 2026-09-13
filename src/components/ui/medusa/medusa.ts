/* =============================================================================
   A medusa, without the simulation.

   WHAT UPSTREAM DOES, AND WHAT THIS DOES INSTEAD

   particulate-medusae builds the animal out of ~15,000 verlet particles tied
   together by ~20,000 distance constraints, relaxed twice per 30Hz tick. The
   shape you see is an emergent property of that solve: the bell contracts
   because the constraints pull it in, and the tentacles trail because they are
   being dragged through a simulated medium.

   The observation this file is built on is that the *look* of a swimming
   medusa is almost entirely one thing: a contraction wave that starts at the
   apex of the bell and travels out to the margin, with everything hanging
   underneath lagging behind it. That is a wave, and a wave has a closed form.
   There is nothing to solve.

   So every vertex here computes its own position from the clock:

     · the bell is a surface of revolution whose profile is evaluated in the
       vertex shader, not baked into the buffer, so the pulse can change the
       shape of the bell rather than merely scaling it;
     · each ring along that profile runs the same pulse delayed by how far it
       sits from the apex, which is the travelling wave, and is what the
       constraint solve was producing the long way round;
     · tentacles read the same delayed pulse at their attachment point, so they
       snap inward when the bell above them contracts, then whip out as it
       relaxes.

   The result is O(vertices) per frame on the GPU with zero CPU work and no
   state carried between frames: pause it, scrub it, resize it, and it is
   always exactly where the clock says it should be.

   WHAT IS LOST

   Honesty matters here. Physics gives you things this does not: the animal
   cannot be pushed, tentacles cannot tangle or collide, and there is no
   secondary motion from momentum. Upstream's raycast nudge has no equivalent.
   For a background nobody interacts with, none of that was ever visible.
   ============================================================================= */

import * as THREE from "three";

export interface MedusaColours {
  /** The brand violet, #9D4EDD by default. */
  glow: THREE.Color;
  /** The brighter lilac used at the crown and along the rim. */
  bright: THREE.Color;
}

/* -----------------------------------------------------------------------------
   Shared GLSL.

   The pulse and the bell profile are defined once and injected into every
   program, because the tentacles have to agree with the bell about where the
   margin is on any given frame. If these two drifted apart the strands would
   detach from the animal.
   -------------------------------------------------------------------------- */

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform float uPeriod;
  uniform float uPhase;
  uniform float uBellRadius;
  uniform float uBellHeight;

  // How far the contraction lags behind, from apex (0) to margin (1), as a
  // fraction of one pulse. This single number is what makes the bell look like
  // it is made of muscle rather than rubber.
  const float WAVE_LAG = 0.34;

  /**
   * One stroke: a fast squeeze over the first fifth, then a long eased
   * recovery. A sine would read as a mechanical throb; the asymmetry is the
   * whole difference between "pulsing" and "alive".
   * Returns 0 at rest, 1 fully contracted.
   */
  float pulse(float t) {
    float u = fract(t);
    if (u < 0.22) {
      float k = u / 0.22;
      return 1.0 - (1.0 - k) * (1.0 - k);   // ease-out: it snaps
    }
    float k = (u - 0.22) / 0.78;
    // ease-in-out back to rest
    float e = k < 0.5 ? 2.0 * k * k : 1.0 - pow(-2.0 * k + 2.0, 2.0) / 2.0;
    return 1.0 - e;
  }

  /** The pulse as felt at height v along the bell, 0 at the apex. */
  float pulseAt(float v) {
    return pulse(uTime / uPeriod + uPhase - v * WAVE_LAG);
  }

  /**
   * The bell's silhouette. v runs 0 (apex) to 1 (margin); returns the radius
   * and the vertical drop at that point, already deformed by the pulse.
   *
   * Contracting does three things at once, and all three matter: the bell
   * narrows, it deepens, and the margin tucks under. Do only the first and it
   * reads as a balloon being squeezed.
   */
  vec2 bellProfile(float v) {
    float p = pulseAt(v);

    float widen = 1.0 - 0.26 * p;
    float deepen = 1.0 + 0.40 * p;

    // A quarter-turn of sine gives the dome; the exponent fattens the shoulder
    // so it reads as a bell rather than a hemisphere.
    float r = pow(sin(v * 1.5707963), 0.78) * uBellRadius * widen;
    float y = -(1.0 - cos(v * 1.5707963)) * uBellHeight * deepen;

    // The margin curls inward on the contraction. Confined to the last third
    // of the profile, which is the part of a real bell that is free to move.
    float margin = smoothstep(0.62, 1.0, v);
    r -= margin * p * uBellRadius * 0.30;
    y -= margin * p * uBellHeight * 0.34;

    return vec2(r, y);
  }
`;

/* -----------------------------------------------------------------------------
   The bell
   -------------------------------------------------------------------------- */

const BELL_VERT = /* glsl */ `
  attribute vec2 aUV;          // x: around, y: apex -> margin

  varying float vV;
  varying float vFacing;
  varying float vRib;

  ${COMMON}

  void main() {
    float u = aUV.x;
    float v = aUV.y;

    vec2 profile = bellProfile(v);
    float angle = u * 6.2831853;

    vec3 pos = vec3(cos(angle) * profile.x, profile.y, sin(angle) * profile.x);

    // Ribs: the radial muscle bands. A shallow scallop around the bell, fading
    // out at the apex where a real bell is smooth.
    float rib = sin(angle * 8.0) * 0.5 + 0.5;
    pos.xz *= 1.0 + rib * 0.035 * smoothstep(0.15, 1.0, v);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // Cheap rim light: how edge-on this vertex is. The bell is translucent, so
    // the silhouette should be the brightest part of it, exactly as in the
    // emblem.
    vec3 toEye = normalize(-mv.xyz);
    vec3 radial = normalize(mat3(modelViewMatrix) * vec3(cos(angle), 0.35, sin(angle)));
    vFacing = 1.0 - abs(dot(radial, toEye));

    vV = v;
    vRib = rib;
    gl_Position = projectionMatrix * mv;
  }
`;

const BELL_FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uGlow;
  uniform vec3 uBright;
  uniform float uOpacity;

  varying float vV;
  varying float vFacing;
  varying float vRib;

  void main() {
    // Hot at the crown, thinning toward the margin: a real bell is thickest
    // and most opaque where the gonads sit, just under the apex.
    float body = mix(0.85, 0.12, smoothstep(0.0, 0.9, vV));
    float rim = pow(vFacing, 2.2) * 1.5;

    vec3 colour = mix(uGlow, uBright, clamp(rim + (1.0 - vV) * 0.45, 0.0, 1.0));
    float alpha = (body * 0.5 + rim * 0.7 + vRib * 0.06) * uOpacity;

    gl_FragColor = vec4(colour * alpha, alpha);
  }
`;

/* -----------------------------------------------------------------------------
   Tentacles and oral arms
   -------------------------------------------------------------------------- */

const STRAND_VERT = /* glsl */ `
  attribute vec3 aStrand;      // x: angle 0..1, y: along 0..1, z: side -1/+1

  uniform float uLength;
  uniform float uWidth;
  uniform float uSwayFreq;
  uniform float uSwayAmp;
  uniform float uAttach;       // where on the bell profile it hangs from

  varying float vAlong;
  varying float vSide;

  ${COMMON}

  void main() {
    float angle = aStrand.x * 6.2831853;
    float t = aStrand.y;
    float side = aStrand.z;

    // Hang from the live margin, so the strands stay attached while the bell
    // moves rather than floating where the rest pose used to be.
    vec2 attach = bellProfile(uAttach);
    float p = pulseAt(uAttach);

    vec3 pos = vec3(cos(angle) * attach.x, attach.y, sin(angle) * attach.x);

    // The strand's own travelling wave: phase runs down its length, so the tip
    // is always a beat behind the base. Amplitude grows as t squared because a
    // tentacle is anchored at one end.
    float wave = sin(uTime * uSwayFreq + angle * 2.3 - t * 5.5);
    float amp = uSwayAmp * t * t;

    pos.x += cos(angle) * wave * amp;
    pos.z += sin(angle) * wave * amp;
    pos.y -= t * uLength;

    // The contraction jets the animal forward, and everything trailing gets
    // pulled in behind it.
    pos.xz *= 1.0 - p * 0.22 * t;
    pos.y += p * uLength * 0.1 * t;

    // Give the ribbon width, perpendicular to the strand, tapering to nothing.
    vec3 across = vec3(-sin(angle), 0.0, cos(angle));
    pos += across * side * uWidth * (1.0 - t * 0.85);

    vAlong = t;
    vSide = side;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const STRAND_FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uGlow;
  uniform vec3 uBright;
  uniform float uOpacity;

  varying float vAlong;
  varying float vSide;

  void main() {
    // Brightest where it leaves the bell, gone by the tip.
    float fade = pow(1.0 - vAlong, 1.6);
    // Soft along the width, so the ribbon has no hard edge.
    float across = 1.0 - abs(vSide);

    vec3 colour = mix(uBright, uGlow, vAlong);
    float alpha = fade * (0.35 + across * 0.65) * uOpacity;

    gl_FragColor = vec4(colour * alpha, alpha);
  }
`;

/* -----------------------------------------------------------------------------
   Buffers
   -------------------------------------------------------------------------- */

/** A (rings x segments) grid over the bell, as one indexed triangle mesh. */
function bellGeometry(segments: number, rings: number) {
  const uv: number[] = [];
  const index: number[] = [];

  for (let r = 0; r <= rings; r++) {
    for (let s = 0; s <= segments; s++) {
      uv.push(s / segments, r / rings);
    }
  }

  const stride = segments + 1;
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * stride + s;
      const b = a + stride;
      index.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  // Position is required by three but never read: every coordinate is computed
  // in the shader from aUV. Supplying zeroes keeps the attribute contract
  // without the CPU ever touching a vertex.
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array((uv.length / 2) * 3), 3)
  );
  geometry.setAttribute("aUV", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  // The shader moves vertices far outside any box three could infer, so the
  // bounds are set by hand and frustum culling left on.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
  return geometry;
}

/** `count` ribbons, each `segments` long, as one indexed mesh. */
function strandGeometry(count: number, segments: number, spread = 1) {
  const strand: number[] = [];
  const index: number[] = [];
  let base = 0;

  for (let i = 0; i < count; i++) {
    // Offset so strands do not all start at the same angle as the arms.
    const angle = ((i + 0.5) / count) * spread;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      strand.push(angle, t, -1);
      strand.push(angle, t, 1);
    }
    for (let s = 0; s < segments; s++) {
      const a = base + s * 2;
      index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
    }
    base += (segments + 1) * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array((strand.length / 3) * 3), 3)
  );
  geometry.setAttribute("aStrand", new THREE.Float32BufferAttribute(strand, 3));
  geometry.setIndex(index);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
  return geometry;
}

export interface MedusaOptions {
  radius?: number;
  height?: number;
  /** Seconds per pulse. */
  period?: number;
  /** 0..1, so a group of them do not beat in unison. */
  phase?: number;
  opacity?: number;
}

/**
 * One animal, as a THREE.Group. Everything animates from `uTime`, so driving it
 * is a single assignment per frame; see medusa-scene.ts.
 */
export function createMedusa(colours: MedusaColours, options: MedusaOptions = {}) {
  const radius = options.radius ?? 10;
  const height = options.height ?? 8;
  const period = options.period ?? 4.2;
  const phase = options.phase ?? 0;
  const opacity = options.opacity ?? 1;

  const shared = {
    uTime: { value: 0 },
    uPeriod: { value: period },
    uPhase: { value: phase },
    uBellRadius: { value: radius },
    uBellHeight: { value: height },
    uGlow: { value: colours.glow },
    uBright: { value: colours.bright },
    uOpacity: { value: opacity },
  };

  const common = {
    transparent: true,
    depthWrite: false,
    // Additive, so overlapping parts brighten each other the way real
    // bioluminescence does instead of compositing into mud.
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  };

  const bell = new THREE.Mesh(
    bellGeometry(64, 28),
    new THREE.ShaderMaterial({
      ...common,
      uniforms: shared,
      vertexShader: BELL_VERT,
      fragmentShader: BELL_FRAG,
    })
  );

  const tentacles = new THREE.Mesh(
    strandGeometry(26, 20),
    new THREE.ShaderMaterial({
      ...common,
      uniforms: {
        ...shared,
        uLength: { value: radius * 5.2 },
        uWidth: { value: radius * 0.018 },
        uSwayFreq: { value: 1.15 },
        uSwayAmp: { value: radius * 0.42 },
        uAttach: { value: 1.0 },
      },
      vertexShader: STRAND_VERT,
      fragmentShader: STRAND_FRAG,
    })
  );

  // The oral arms: fewer, wider, shorter, and hung from inside the margin.
  const arms = new THREE.Mesh(
    strandGeometry(5, 18),
    new THREE.ShaderMaterial({
      ...common,
      uniforms: {
        ...shared,
        uLength: { value: radius * 2.4 },
        uWidth: { value: radius * 0.11 },
        uSwayFreq: { value: 0.8 },
        uSwayAmp: { value: radius * 0.3 },
        uAttach: { value: 0.55 },
      },
      vertexShader: STRAND_VERT,
      fragmentShader: STRAND_FRAG,
    })
  );

  const group = new THREE.Group();
  group.add(bell, arms, tentacles);

  return {
    group,
    /** Every material shares these, so one write moves the whole animal. */
    uniforms: [bell, arms, tentacles].map(
      (mesh) => (mesh.material as THREE.ShaderMaterial).uniforms
    ),
    dispose() {
      for (const mesh of [bell, arms, tentacles]) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
    },
  };
}
