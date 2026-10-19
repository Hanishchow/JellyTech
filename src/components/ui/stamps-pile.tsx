"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { asset } from "@/lib/asset";

// ─── stamp data ───────────────────────────────────────────────────────────────

const STAMPS = [
  { id: "programs", label: "PROGRAMS", num: "01", img: "stamps/stamp-01-programs.jpg", route: "/programs",   desc: "Workshops, hackathons, and hands-on labs",   blurb: "Conferences, workshops, courses and hackathons, each one documented to seed the next." },
  { id: "media",    label: "MEDIA",    num: "02", img: "stamps/stamp-02-media.jpg",    route: "/media",      desc: "Events, tutorials, and behind-the-scenes",  blurb: "Explainers, interviews, a podcast and a magazine, checked for scientific accuracy." },
  { id: "about",    label: "ABOUT",    num: "03", img: "stamps/stamp-03-about.jpg",    route: "/about",      desc: "The story of JELLYTECH",                    blurb: "A student-led, faculty-supervised club at Acharya Institute of Technology." },
  { id: "team",     label: "TEAM",     num: "04", img: "stamps/stamp-04-team.jpg",     route: "/team",       desc: "Our builders, dreamers, and makers",        blurb: "Decentralized teams that keep their own procedures, so the club outlasts any handover." },
  { id: "join",     label: "JOIN",     num: "05", img: "stamps/stamp-05-join.jpg",     route: "/join",       desc: "Applications and how to get involved",      blurb: "A co-curricular club, not a course. Tell us who you are and where you'd help." },
  { id: "lab",      label: "LAB",      num: "06", img: "stamps/stamp-06-lab.jpg",      route: "/lab/medusa", desc: "Projects, research, what we're building",   blurb: "Experimental builds, including the live jellyfish simulation." },
];

const PREVIEW_MS = 2600;
const FLY_MS = 380;

// ─── noise + springs ──────────────────────────────────────────────────────────

function hash(n: number) {
  return ((43758.5453 * Math.sin(12.9898 * n + 78.233)) % 1 + 1) % 1;
}
function smoothNoise(t: number) {
  const n = Math.floor(t), f = t - n, s = f * f * (3 - 2 * f);
  return 2 * (hash(n) + (hash(n + 1) - hash(n)) * s) - 1;
}
function driftSeed(i: number, dim: number) {
  return 1000 * hash(i * (17.3 + 13.7 * dim)) + 500 * dim;
}

const TICK = 1 / 120;

interface Spring { cur: number; tgt: number; vel: number }
function sp(v = 0): Spring { return { cur: v, tgt: v, vel: 0 }; }

// Semi-implicit Euler on a fixed 1/120 s sub-step; k = stiffness, c = damping (per second)
function springStep(s: Spring, k: number, c: number, dt: number) {
  let left = dt;
  while (left > 1e-6) {
    const u = Math.min(TICK, left);
    s.vel += (k * (s.tgt - s.cur) - c * s.vel) * u;
    s.cur += s.vel * u;
    left -= u;
  }
}

// ─── layouts ──────────────────────────────────────────────────────────────────

interface Slot { x: number; y: number; rot: number }

// Full page: a loose pile, every card near the centre
function pileLayout(n: number, W: number, H: number, sw: number, sh: number): Slot[] {
  const cx = W / 2, cy = H / 2 + 8;
  return Array.from({ length: n }, (_, i) => ({
    x: cx + (hash(i * 7.1 + 1.3) - 0.5) * 110 - sw / 2,
    y: cy + (hash(i * 5.3 + 2.7) - 0.5) * 80 - sh / 2,
    rot: (hash(i * 3.7 + 0.4) - 0.5) * 48,
  }));
}

// Corner navigation: a hand of cards fanned so every card shows a tappable edge
function fanLayout(n: number, W: number, H: number, sw: number, sh: number): Slot[] {
  const mid = (n - 1) / 2;
  const step = Math.min(30, (W - sw - 8) / (n - 1));
  return Array.from({ length: n }, (_, i) => {
    const k = i - mid;
    return {
      x: W / 2 + k * step - sw / 2,
      y: H - sh - 14 + k * k * 2.6,
      rot: k * 9 + (hash(i * 3.7 + 0.4) - 0.5) * 5,
    };
  });
}

// ─── WebGL2 drop-shadow (4-pass: vignette → warp → shatter → bokeh) ──────────

const VS_QUAD = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.,1.); }`;

const FS_VIGNETTE = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 fragColor;
uniform float uRadius, uFalloff, uSkew;
uniform vec3 uShadowColor, uBgColor;
uniform vec2 uPos, uRes;
mat2 rot(float a){ return mat2(cos(a),-sin(a),sin(a),cos(a)); }
void main(){
  vec2 ar = vec2(uRes.x/uRes.y, 1.);
  vec2 sk = vec2(uSkew, 1.-uSkew);
  float rHalf = uRadius*.5, inner = rHalf - uFalloff*rHalf*.5, outer = rHalf + uFalloff*rHalf*.5;
  vec2 uv = vUv * ar * rot(0.) * sk;
  vec2 pos = uPos * ar * rot(0.) * sk;
  float r = distance(uv, pos);
  float f = smoothstep(inner, outer, r);
  fragColor = mix(vec4(uBgColor,0.), vec4(uShadowColor,1.), f);
}`;

const FS_WARP = `#version 300 es
precision mediump float;
#define PI3 1.04719755
in vec2 vUv; out vec4 fragColor;
uniform sampler2D tIn;
uniform float uFreq, uAmp, uTime;
uniform vec2 uRes;
void main(){
  vec2 c = vUv*2.-1.;
  float t = uTime*.25, f = 20.*uFreq, a = uAmp*.2;
  float wx = sin((c.y)*f + t*PI3)*a;
  float wy = sin((c.x)*f + t*PI3)*a;
  c += vec2(wx, wy);
  fragColor = texture(tIn, c*.5+.5);
}`;

const FS_SHATTER = `#version 300 es
precision mediump float;
#define PI 3.14159265
in vec2 vUv; out vec4 fragColor;
uniform sampler2D tIn;
uniform float uAmount, uSpread, uAngle, uTime;
uniform vec2 uRes;
vec2 rand2(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }
mat2 rot(float a){ return mat2(cos(a),-sin(a),sin(a),cos(a)); }
void main(){
  vec2 uv = vUv;
  float ar = uRes.x/uRes.y;
  vec2 st = (uv - vec2(.5)) * vec2(ar,1.) * 50.*uAmount;
  st = st * rot(uAngle*2.*PI);
  vec2 is = floor(st), fs = fract(st);
  float md = 15.; vec2 mp;
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 nb = vec2(float(i),float(j));
    vec2 pt = .5 + .5*sin(5. + uTime*.2 + 6.2831*rand2(is+nb));
    float d = length(nb+pt-fs);
    if(d<md){ md=d; mp=pt; }
  }
  vec2 off = (mp*.2*uSpread*2.) - (uSpread*.2);
  fragColor = texture(tIn, uv + off);
}`;

const FS_BOKEH = `#version 300 es
precision highp float;
#define PI 3.14159265
#define PI2 6.28318531
#define ITERS 40.
#define GA 2.39996323
in vec2 vUv; out vec4 fragColor;
uniform sampler2D tIn;
uniform float uAmount;
uniform vec2 uPos, uRes;
vec2 spiral(float th, inout float r){ r+=1./r; return (r-1.)*vec2(cos(th),sin(th)); }
void main(){
  if(uAmount==0.) { fragColor=vec4(0.); return; }
  vec2 px = vec2(1./uRes.x, 1./uRes.y)*.04*.06;
  float r=1.; vec3 acc=vec3(0.); vec3 wt=vec3(0.); float al=0.;
  for(float j=0.;j<GA*ITERS;j+=GA){
    vec2 off = spiral(j,r)*px;
    vec4 s = texture(tIn, vUv+off);
    vec3 bw = vec3(3.) + pow(s.rgb,vec3(7.))*80.;
    acc += s.rgb*bw; wt += bw; al += s.a;
  }
  fragColor = vec4(acc/wt, al/ITERS);
}`;

const FS_COMPOSITE = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D tIn;
uniform vec3 uBg;
void main(){
  vec4 c = texture(tIn, vUv);
  fragColor = vec4(mix(uBg, c.rgb, c.a), 1.);
}`;

function buildShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
  return s;
}
function buildProg(gl: WebGL2RenderingContext, vs: WebGLShader | null, fs: WebGLShader | null, uniforms: string[]) {
  if (!vs || !fs) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const n of uniforms) u[n] = gl.getUniformLocation(p, n);
  return { p, u };
}

interface DappleEngine {
  render(opts: { px: number; py: number; spread: number; scale: number; time: number; w: number; h: number }): void;
  canvas: HTMLCanvasElement;
  dispose(): void;
}

const BG = [0.031, 0.027, 0.098] as const; // #08071a
const SHADOW = [0.12, 0.04, 0.28] as const;

function createDapple(): DappleEngine | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: true });
  if (!ctx) return null;
  const gl: WebGL2RenderingContext = ctx;

  const vs = buildShader(gl, gl.VERTEX_SHADER, VS_QUAD)!;
  const pVig  = buildProg(gl, vs, buildShader(gl, gl.FRAGMENT_SHADER, FS_VIGNETTE)!, ["uRadius","uFalloff","uSkew","uShadowColor","uBgColor","uPos","uRes"]);
  const pWarp = buildProg(gl, vs, buildShader(gl, gl.FRAGMENT_SHADER, FS_WARP)!,    ["tIn","uFreq","uAmp","uTime","uRes"]);
  const pShat = buildProg(gl, vs, buildShader(gl, gl.FRAGMENT_SHADER, FS_SHATTER)!, ["tIn","uAmount","uSpread","uAngle","uTime","uRes"]);
  const pBok  = buildProg(gl, vs, buildShader(gl, gl.FRAGMENT_SHADER, FS_BOKEH)!,   ["tIn","uAmount","uPos","uRes"]);
  const pComp = buildProg(gl, vs, buildShader(gl, gl.FRAGMENT_SHADER, FS_COMPOSITE)!,["tIn","uBg"]);
  if (!pVig || !pWarp || !pShat || !pBok || !pComp) return null;

  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let fboW = 0, fboH = 0;
  let fbos: Array<{ tex: WebGLTexture; fbo: WebGLFramebuffer }> = [];

  function ensureFbos(w: number, h: number) {
    if (w === fboW && h === fboH) return;
    for (const f of fbos) { gl.deleteTexture(f.tex); gl.deleteFramebuffer(f.fbo); }
    fbos = [];
    for (let i = 0; i < 2; i++) {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      fbos.push({ tex, fbo });
    }
    fboW = w; fboH = h;
  }

  return {
    canvas,
    render({ px, py, spread, scale, time, w, h }) {
      const W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h));
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      ensureFbos(W, H);
      gl.viewport(0, 0, W, H);
      gl.bindVertexArray(vao);

      const radius = 0.354 * (spread / 0.45);
      const cellAmt = Math.min(3, Math.max(1, 560 / H));
      const cellSize = 0.534 / (Math.max(0.2, scale) * cellAmt);
      const warpT = time % (2 * Math.PI / 0.26177);
      const shatT = time % (10 * Math.PI);

      gl.useProgram(pVig.p);
      gl.uniform1f(pVig.u.uRadius, radius);
      gl.uniform1f(pVig.u.uFalloff, 1.0);
      gl.uniform1f(pVig.u.uSkew, 0.54);
      gl.uniform3fv(pVig.u.uShadowColor, SHADOW);
      gl.uniform3fv(pVig.u.uBgColor, BG);
      gl.uniform2f(pVig.u.uPos, px, py);
      gl.uniform2f(pVig.u.uRes, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[0].fbo);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.useProgram(pWarp.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbos[0].tex);
      gl.uniform1i(pWarp.u.tIn, 0);
      gl.uniform1f(pWarp.u.uFreq, 0.35);
      gl.uniform1f(pWarp.u.uAmp, 1.18);
      gl.uniform1f(pWarp.u.uTime, warpT);
      gl.uniform2f(pWarp.u.uRes, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[1].fbo);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.useProgram(pShat.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbos[1].tex);
      gl.uniform1i(pShat.u.tIn, 0);
      gl.uniform1f(pShat.u.uAmount, cellSize);
      gl.uniform1f(pShat.u.uSpread, spread);
      gl.uniform1f(pShat.u.uAngle, 0.1222);
      gl.uniform1f(pShat.u.uTime, shatT);
      gl.uniform2f(pShat.u.uRes, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[0].fbo);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.useProgram(pBok.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbos[0].tex);
      gl.uniform1i(pBok.u.tIn, 0);
      gl.uniform1f(pBok.u.uAmount, 0.75);
      gl.uniform2f(pBok.u.uPos, px, py);
      gl.uniform2f(pBok.u.uRes, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[1].fbo);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.useProgram(pComp.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbos[1].tex);
      gl.uniform1i(pComp.u.tIn, 0);
      gl.uniform3fv(pComp.u.uBg, BG);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() { gl.getExtension("WEBGL_lose_context")?.loseContext(); },
  };
}

// ─── Three.js relief (full mode only) ─────────────────────────────────────────

interface Relief { canvas: HTMLCanvasElement; tick(t: number): void; dispose(): void }

// three.js is imported on first hover of the full-size pile, so the homepage's
// compact pile never pulls the engine into the entry bundle.
async function makeRelief(imgSrc: string, sw: number, sh: number): Promise<Relief> {
  const THREE = await import("three");
  const canvas = document.createElement("canvas");
  canvas.width = sw * 2; canvas.height = sh * 2;
  Object.assign(canvas.style, {
    position: "absolute", inset: "0",
    width: "100%", height: "100%",
    pointerEvents: "none", opacity: "0",
    transition: "opacity 0.25s ease",
    borderRadius: "2px", mixBlendMode: "screen",
  });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setSize(sw * 2, sh * 2, false);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();
  const fov = 18;
  const h = 0.5 / Math.tan(fov * Math.PI / 360);
  const camera = new THREE.PerspectiveCamera(fov, sw / sh, 0.1, 100);
  camera.position.set(0, 0, h); camera.lookAt(0, 0, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const mkPanel = (w: number, ht: number, intensity: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, ht),
      new THREE.MeshLambertMaterial({ color: 0, emissive: 0xffffff, emissiveIntensity: intensity })
    );
    m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
  };
  mkPanel(1.4, 4.5, 18, -2.2, 3.2, 5);
  mkPanel(1.0, 3.0, 5,  2.8, -1.8, 4.5);
  mkPanel(6.0, 3.0, 1.5, 0, 5.5, 2);
  mkPanel(6.0, 3.0, 0.7, 0, -5,  2.5);
  envScene.add(new THREE.Mesh(
    new THREE.SphereGeometry(20),
    new THREE.MeshLambertMaterial({ color: 0, emissive: 0xffffff, emissiveIntensity: 0.02, side: THREE.BackSide })
  ));
  const envTex = pmrem.fromScene(envScene, 0.08).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 1.0;

  const tex = new THREE.TextureLoader().load(imgSrc);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;

  const geo = new THREE.PlaneGeometry(1, 1, 128, 128);
  const mat = new THREE.MeshPhysicalMaterial({
    map: tex,
    displacementMap: tex,
    displacementScale: 0.04,
    displacementBias: 0,
    roughness: 0.12,
    metalness: 0.0,
    clearcoat: 0.88,
    clearcoatRoughness: 0.05,
    iridescence: 0.25,
    iridescenceIOR: 1.45,
    specularIntensity: 1.0,
    envMapIntensity: 1.0,
    alphaTest: 0.5,
    color: new THREE.Color(0xffffff),
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(sw / sh, 1, 1);
  scene.add(mesh);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9a8f7d, 0.35);
  scene.add(dirLight, hemi);

  function tick(t: number) {
    const s = t * 0.00022;
    dirLight.position.set(-0.3 + 0.4 * Math.cos(s), 0.45 - 0.3 * Math.sin(s * 0.65), 0.6).normalize();
    renderer.render(scene, camera);
  }

  function dispose() {
    geo.dispose(); mat.dispose(); tex.dispose();
    envTex.dispose(); pmrem.dispose(); renderer.dispose();
  }

  return { canvas, tick, dispose };
}

// ─── focus blur layers (full mode DOF) ────────────────────────────────────────

function makeFocusLayers(container: HTMLElement) {
  const layers: HTMLDivElement[] = [];
  for (const blur of [18, 11, 5]) {
    const d = document.createElement("div");
    Object.assign(d.style, {
      position: "absolute", inset: "0", pointerEvents: "none",
      opacity: "0", transition: "opacity 0.3s ease",
      backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`,
      maskImage: "radial-gradient(circle at 50% 50%, transparent 0px, black 150px)",
      WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 0px, black 150px)",
    });
    container.appendChild(d);
    layers.push(d);
  }
  return layers;
}

function setFocus(layers: HTMLDivElement[], x: number, y: number, active: boolean, cr: DOMRect) {
  const cx = ((x - cr.left) / cr.width) * 100;
  const cy = ((y - cr.top)  / cr.height) * 100;
  const g = `radial-gradient(circle at ${cx}% ${cy}%, transparent 0px, black 170px)`;
  for (const l of layers) {
    l.style.maskImage = l.style.webkitMaskImage = g;
    l.style.opacity = active ? "1" : "0";
  }
}

// ─── component ────────────────────────────────────────────────────────────────

interface StampsPileProps {
  /** Corner-navigation mode: small fanned hand, no WebGL, tap-to-preview then tap-to-open. */
  compact?: boolean;
  className?: string;
}

export function StampsPile({ compact = false, className }: StampsPileProps) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<((i: number) => void) | null>(null);
  const [active, setActive] = useState(-1);
  const [activeKey, setActiveKey] = useState(0);

  useEffect(() => {
    const container = sceneRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SW = compact ? 108 : 200;
    const SH = Math.round((SW * 556) / 444);
    const f = SW / 200;

    let W = container.clientWidth;
    let H = container.clientHeight;
    let slots = compact ? fanLayout(STAMPS.length, W, H, SW, SH) : pileLayout(STAMPS.length, W, H, SW, SH);

    let dapple: DappleEngine | null = null;
    let focusLayers: HTMLDivElement[] = [];
    if (!compact) {
      try { dapple = createDapple(); } catch (e) { console.warn("dapple init failed", e); }
      if (dapple) {
        Object.assign(dapple.canvas.style, {
          position: "absolute", inset: "0", width: "100%", height: "100%",
          pointerEvents: "none", zIndex: "1",
        });
        container.appendChild(dapple.canvas);
      }
      focusLayers = makeFocusLayers(container);
    }

    let hoveredIdx = -1;
    let selected = -1;
    let flyIdx = -1;
    let navigating = false;
    let dismissTimer = 0;
    let goTimer = 0;
    let visible = true;
    let disposed = false;

    const held = (i: number) => hoveredIdx === i || selected === i || flyIdx === i;

    const show = (i: number) => { setActive(i); if (i >= 0) setActiveKey((k) => k + 1); };

    const states = STAMPS.map((stamp, i) => {
      const baseZ = compact ? i + 2 : Math.round(hash(i * 11.3 + 4.1) * 8) + 2;

      const wrap = document.createElement("div");
      wrap.dataset.stampId = stamp.id;
      wrap.tabIndex = 0;
      wrap.setAttribute("role", "link");
      wrap.setAttribute("aria-label", `${stamp.label.charAt(0)}${stamp.label.slice(1).toLowerCase()}: ${stamp.desc}`);
      Object.assign(wrap.style, {
        position: "absolute",
        width: SW + "px",
        left: slots[i].x + "px",
        top: slots[i].y + "px",
        aspectRatio: `${SW} / ${SH}`,
        perspective: "1200px",
        cursor: "pointer",
        zIndex: String(baseZ),
        willChange: "transform",
        outline: "none",
        touchAction: "manipulation",
        transition: "filter 0.3s ease",
      });

      const paper = document.createElement("div");
      Object.assign(paper.style, {
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d", willChange: "transform",
        borderRadius: "3px", background: "#ece6d8",
        boxShadow: "0 4px 24px rgba(0,0,0,0.55)",
      });

      const inset = Math.max(4, Math.round(9 * f));
      const imgWrap = document.createElement("div");
      Object.assign(imgWrap.style, { position: "absolute", inset: inset + "px", overflow: "hidden", borderRadius: "1px" });
      const img = document.createElement("img");
      img.src = asset(stamp.img); img.alt = ""; img.draggable = false;
      Object.assign(img.style, { display: "block", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" });
      imgWrap.appendChild(img);

      const band = Math.round(14 * f * 10) / 10;
      const dot = Math.round(5 * f * 10) / 10;
      const maskImg = [
        `linear-gradient(to right,  black 0,black ${band}px,transparent ${band}px,transparent calc(100% - ${band}px),black calc(100% - ${band}px),black 100%)`,
        `linear-gradient(to bottom, black 0,black ${band}px,transparent ${band}px,transparent calc(100% - ${band}px),black calc(100% - ${band}px),black 100%)`,
      ].join(",");
      const frame = document.createElement("div");
      Object.assign(frame.style, {
        position: "absolute", inset: `-${Math.round(10 * f)}px`,
        borderRadius: "5px", pointerEvents: "none", zIndex: "2",
        backgroundImage: `radial-gradient(circle, #08071a ${dot}px, transparent ${dot}px)`,
        backgroundSize: `${band}px ${band}px`,
        WebkitMaskImage: maskImg, WebkitMaskComposite: "source-over",
        maskImage: maskImg, maskComposite: "add",
      });

      paper.append(imgWrap, frame);

      if (!compact) {
        const labelEl = document.createElement("div");
        Object.assign(labelEl.style, {
          position: "absolute", bottom: "4px", right: "6px",
          fontFamily: "'Space Mono',monospace", fontSize: "6px", letterSpacing: "0.16em",
          color: "rgba(40,20,10,0.7)", textTransform: "uppercase", pointerEvents: "none", zIndex: "3",
        });
        labelEl.textContent = stamp.label;
        const numEl = document.createElement("div");
        Object.assign(numEl.style, {
          position: "absolute", top: "4px", left: "6px",
          fontFamily: "'Space Mono',monospace", fontSize: "6px", letterSpacing: "0.1em",
          color: "rgba(40,20,10,0.45)", pointerEvents: "none", zIndex: "3",
        });
        numEl.textContent = stamp.num;
        paper.append(labelEl, numEl);
      }

      wrap.append(paper);
      container.appendChild(wrap);

      let relief: Relief | null = null;
      let loading = false;

      const state = {
        wrap, paper,
        posX: sp(), posY: sp(),
        rot: sp(slots[i].rot), scale: sp(1),
        tiltX: sp(), tiltY: sp(),
        seedX: driftSeed(i, 0), seedY: driftSeed(i, 1), seedR: driftSeed(i, 2),
        base: slots[i].rot, baseZ, hovered: false,
        get relief() { return relief; },
        showRelief() {
          if (relief) { relief.canvas.style.opacity = "1"; return; }
          if (loading) return;
          loading = true;
          makeRelief(asset(stamp.img), SW, SH)
            .then((r) => {
              if (disposed) { r.dispose(); return; }
              relief = r;
              paper.appendChild(r.canvas);
              if (state.hovered) r.canvas.style.opacity = "1";
            })
            .catch(() => { loading = false; });
        },
        disposeRelief() { relief?.dispose(); relief = null; },
      };
      return state;
    });

    // ── selection (compact) ──
    const rest = (s: (typeof states)[number]) => {
      s.scale.tgt = 1; s.rot.tgt = s.base; s.tiltX.tgt = 0; s.tiltY.tgt = 0;
      s.wrap.style.zIndex = String(s.baseZ);
      s.paper.style.outline = "";
    };

    const deselect = () => {
      window.clearTimeout(dismissTimer);
      if (selected === -1) return;
      selected = -1;
      show(-1);
      states.forEach((s) => { rest(s); s.wrap.style.filter = ""; });
    };

    const select = (i: number) => {
      window.clearTimeout(dismissTimer);
      selected = i; hoveredIdx = -1;
      show(i);
      states.forEach((s, j) => {
        if (j === i) {
          s.scale.tgt = 1.4; s.rot.tgt = 0; s.posY.tgt = -SH * 0.2;
          s.wrap.style.zIndex = "40"; s.wrap.style.filter = "";
          s.paper.style.outline = "1.5px solid rgba(157,100,235,0.85)";
        } else {
          rest(s);
          s.wrap.style.filter = "brightness(0.42) saturate(0.5)";
        }
      });
      dismissTimer = window.setTimeout(deselect, PREVIEW_MS);
    };

    // ── navigation ──
    const go = (i: number) => {
      if (navigating) return;
      navigating = true; flyIdx = i;
      window.clearTimeout(dismissTimer);
      const s = states[i];
      s.wrap.style.zIndex = "50"; s.wrap.style.filter = "";
      if (compact) {
        show(-1);
        s.scale.tgt = 2.3; s.rot.tgt = 0; s.posY.tgt = -SH * 0.45;
        states.forEach((o) => {
          o.wrap.style.transition = "opacity 0.32s ease, filter 0.3s ease";
          o.wrap.style.opacity = "0";
        });
      } else {
        s.scale.tgt = 1.75;
        const stampCX = slots[i].x + SW / 2;
        const stampCY = slots[i].y + SH / 2;
        s.posX.tgt = (container.clientWidth / 2 - stampCX) * 0.35;
        s.posY.tgt = (container.clientHeight / 2 - stampCY) * 0.35;
      }
      goTimer = window.setTimeout(() => navigate(STAMPS[i].route), reduced ? 60 : FLY_MS);
    };
    goRef.current = go;

    // ── events ──
    states.forEach((state, i) => {
      const { wrap } = state;

      wrap.addEventListener("pointerenter", (e) => {
        if (navigating || e.pointerType !== "mouse") return;
        if (compact) {
          if (selected !== -1) return;
          hoveredIdx = i; state.hovered = true;
          state.scale.tgt = 1.14; state.rot.tgt = state.base * 0.4;
          wrap.style.zIndex = "25";
          return;
        }
        state.hovered = true; hoveredIdx = i;
        state.scale.tgt = 1.2; state.rot.tgt = state.base * 0.15;
        wrap.style.zIndex = "30";
        state.showRelief();
        setFocus(focusLayers, e.clientX, e.clientY, true, container.getBoundingClientRect());
        states.forEach((st, j) => {
          if (j !== i) {
            st.wrap.style.filter = "blur(4px) brightness(0.32) saturate(0.15)";
            st.wrap.style.pointerEvents = "none";
          }
        });
      });

      wrap.addEventListener("pointermove", (e) => {
        if (navigating || e.pointerType !== "mouse") return;
        const tiltMax = compact ? (selected === i ? 12 : 0) : (state.hovered ? 20 : 0);
        if (!tiltMax) return;
        const r = wrap.getBoundingClientRect();
        state.tiltX.tgt = -((e.clientY - r.top) / r.height - 0.5) * 2 * tiltMax;
        state.tiltY.tgt =  ((e.clientX - r.left) / r.width - 0.5) * 2 * tiltMax;
        if (!compact) setFocus(focusLayers, e.clientX, e.clientY, true, container.getBoundingClientRect());
      });

      wrap.addEventListener("pointerleave", () => {
        if (!state.hovered) return;
        state.hovered = false;
        if (hoveredIdx === i) hoveredIdx = -1;
        if (navigating) return;
        if (compact) { if (selected !== i) rest(state); return; }
        rest(state);
        if (state.relief) state.relief.canvas.style.opacity = "0";
        setFocus(focusLayers, 0, 0, false, container.getBoundingClientRect());
        states.forEach((st) => { st.wrap.style.filter = ""; st.wrap.style.pointerEvents = ""; });
      });

      const activate = () => {
        if (navigating) return;
        if (compact && selected !== i) { select(i); return; }
        go(i);
      };
      wrap.addEventListener("click", activate);
      wrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
      });
    });

    // Outside tap / Escape closes the preview
    const onDocPointerDown = (e: PointerEvent) => {
      if (selected !== -1 && !rootRef.current?.contains(e.target as Node)) deselect();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") deselect(); };
    if (compact) {
      document.addEventListener("pointerdown", onDocPointerDown);
      document.addEventListener("keydown", onKey);
    }

    const mx = { x: -9999, y: -9999 };
    const onWindowMove = (e: PointerEvent) => { mx.x = e.clientX; mx.y = e.clientY; };
    if (!compact) window.addEventListener("pointermove", onWindowMove);

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(container);

    const amp = reduced ? { x: 0, y: 0, r: 0 } : compact ? { x: 6, y: 5, r: 2 } : { x: 22, y: 16, r: 6.5 };

    let last = 0, raf = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) { last = t; return; }
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const tt = t * 0.0006;
      const cr = container.getBoundingClientRect();

      if (dapple) {
        if (hoveredIdx >= 0) {
          const s = states[hoveredIdx];
          dapple.render({
            px: 0.5 + (mx.x - cr.left - cr.width / 2) / cr.width * 0.6,
            py: 0.5 - (mx.y - cr.top - cr.height / 2) / cr.height * 0.6,
            spread: 0.45, scale: s.scale.cur, time: t * 0.001, w: cr.width, h: cr.height,
          });
        } else {
          dapple.render({ px: 0.5, py: 0.5, spread: 0.1, scale: 1, time: t * 0.001, w: cr.width, h: cr.height });
        }
      }

      states.forEach((s, i) => {
        const isHeld = held(i);
        if (!isHeld) {
          if (compact) { s.posX.tgt = 0; s.posY.tgt = 0; }
          else {
            const dx = mx.x - (cr.left + slots[i].x + SW / 2);
            const dy = mx.y - (cr.top + slots[i].y + SH / 2);
            const k = 0.05 / (1 + (dx * dx + dy * dy) / 60000);
            s.posX.tgt = dx * k; s.posY.tgt = dy * k;
          }
        }

        const dX = isHeld ? 0 : smoothNoise(tt + s.seedX) * amp.x;
        const dY = isHeld ? 0 : smoothNoise(tt + s.seedY) * amp.y;
        const dR = isHeld ? 0 : smoothNoise(tt * 0.55 + s.seedR) * amp.r;

        springStep(s.posX, 120, 18, dt);
        springStep(s.posY, 120, 18, dt);
        springStep(s.rot, 100, 16, dt);
        springStep(s.scale, 140, 18, dt);
        springStep(s.tiltX, 160, 20, dt);
        springStep(s.tiltY, 160, 20, dt);

        s.wrap.style.transform = `translate(${s.posX.cur + dX}px,${s.posY.cur + dY}px) rotate(${s.rot.cur + dR}deg)`;
        s.paper.style.transform = `perspective(900px) scale(${s.scale.cur}) rotateX(${s.tiltX.cur}deg) rotateY(${s.tiltY.cur}deg)`;

        const lift = (s.scale.cur - 1) * 55 * (compact ? 0.6 : 1);
        const sha = Math.min(0.2 + (s.scale.cur - 1) * 0.6, 0.85);
        s.paper.style.boxShadow = `0 ${lift + 4}px ${lift + 20}px rgba(0,0,0,${sha.toFixed(2)}), 0 2px 8px rgba(0,0,0,0.35)`;

        s.relief?.tick(t);
      });
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      W = container.clientWidth; H = container.clientHeight;
      slots = compact ? fanLayout(STAMPS.length, W, H, SW, SH) : pileLayout(STAMPS.length, W, H, SW, SH);
      states.forEach((s, i) => {
        s.base = slots[i].rot;
        s.wrap.style.left = slots[i].x + "px";
        s.wrap.style.top = slots[i].y + "px";
        if (!held(i)) s.rot.tgt = s.base;
      });
    });
    ro.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(dismissTimer);
      window.clearTimeout(goTimer);
      io.disconnect(); ro.disconnect();
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onWindowMove);
      goRef.current = null;
      dapple?.dispose();
      states.forEach((s) => s.disposeRelief());
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, [navigate, compact]);

  const stamp = active >= 0 ? STAMPS[active] : null;

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", userSelect: "none" }}
    >
      <style>{`
        .jt-pile-panel{position:absolute;left:0;bottom:calc(100% + 12px);width:min(17rem,calc(100vw - 3rem));text-align:left;cursor:pointer;
          padding:14px 16px 16px;border-radius:4px;overflow:hidden;color:#e9e3f7;
          background:rgba(10,8,28,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
          border:1px solid rgba(160,120,240,.28);box-shadow:0 14px 40px rgba(0,0,0,.5);
          animation:jt-pile-in .22s ease-out both;z-index:60}
        @media (min-width:768px){.jt-pile-panel{left:calc(100% + 16px);bottom:0}}
        .jt-pile-timer{position:absolute;left:0;bottom:0;height:2px;width:100%;transform-origin:left;
          background:linear-gradient(90deg,rgba(157,100,235,.9),rgba(120,180,255,.7));animation:jt-pile-timer ${PREVIEW_MS}ms linear forwards}
        @keyframes jt-pile-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes jt-pile-timer{from{transform:scaleX(1)}to{transform:scaleX(0)}}
        @media (prefers-reduced-motion:reduce){.jt-pile-panel{animation:none}.jt-pile-timer{animation-duration:0.01ms}}
      `}</style>

      <div ref={sceneRef} style={{ position: "absolute", inset: 0 }} />

      {compact && stamp && (
        <button
          key={activeKey}
          type="button"
          className="jt-pile-panel"
          onClick={() => goRef.current?.(active)}
        >
          <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.22em", color: "rgba(190,160,255,.8)" }}>
            {stamp.num} · {stamp.label}
          </span>
          <span style={{ display: "block", marginTop: 8, fontSize: 15, lineHeight: 1.3, fontWeight: 500 }}>
            {stamp.desc}
          </span>
          <span style={{ display: "block", marginTop: 6, fontSize: 12.5, lineHeight: 1.5, color: "rgba(220,212,245,.68)" }}>
            {stamp.blurb}
          </span>
          <span style={{ display: "block", marginTop: 12, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(160,200,255,.85)" }}>
            Tap again to open →
          </span>
          <span className="jt-pile-timer" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
