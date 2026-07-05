'use client';

import { useEffect, useRef, useState } from 'react';
import { useScrollStore } from '@/lib/scrollStore';
import { useLoading } from '@/lib/loadingStore';
import { PARTICLE_VERT, PARTICLE_FRAG } from '@/shaders/particleLogo';

import { detectMobileProfile } from '@/lib/mobileProfile';

const SCENE_READY_EVENT = 'bosala:scene-ready';

const LOGO_SCALE = 0.65;
const LOGO_OFFSET: [number, number, number] = [0.55, -0.08, -1.0];
const LOGO_MOBILE_SCALE = 0.55;
const LOGO_MOBILE_OFFSET: [number, number, number] = [0, 1.15, -1.0];
const LOGO_SAMPLE_STEP = 2;
const LOGO_KEEP_PROB = 0.7;
const LOGO_COLOR_BRIGHTNESS = 0.45;
const NODE_COUNT = 350;
const GALAXY_COUNT = 9000;
const GALAXY_TOTAL = GALAXY_COUNT * 2;
const MOBILE_GALAXY_COUNT = 4000;
const MOBILE_AMBIENT = 8000;
const MOBILE_MAX = 35000;
const TEAM_COUNT = 8000;
const PLATFORM_COUNT = 6000;
const STATS_COUNT = 4000;
const MAX_PARTICLES = 117000;

const WORLD_R = 2.15;
const PLATFORM_CENTERS = [-2.8, 0, 2.8];

const CYAN: [number, number, number] = [0, 0.941, 1.0];
const VIOLET: [number, number, number] = [0.541, 0.169, 0.886];
const WARM_WHITE: [number, number, number] = [0.961, 0.961, 0.969];

const GAL_BRIGHTNESS = 0.51;

const GAL_EULER: [[number, number, number], [number, number, number]] = [
  [0.52, -0.38, 0.28],
  [-0.45, 0.62, -0.22],
];

type LogoPixel = {
  px: number;
  py: number;
  r: number;
  g: number;
  b: number;
};

type ParticleArrays = {
  base: Float32Array;
  rand: Float32Array;
  type: Float32Array;
  section: Float32Array;
  aux0: Float32Array;
  aux1: Float32Array;
  aux2: Float32Array;
  color: Float32Array;
  count: number;
};

type BuildCounts = {
  logo: number;
  galaxy: number;
  ambient: number;
  team: number;
  platform: number;
  stats: number;
  total: number;
  ambientStart: number;
};

function gaussian(): number {
  const u = Math.random() || 1e-6;
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function mixColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function scaleColor(
  c: [number, number, number],
  m: number
): [number, number, number] {
  return [c[0] * m, c[1] * m, c[2] * m];
}

function buildLogoPixelPool(): { pixels: LogoPixel[]; scale: number } {
  const S = 640;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const c2 = canvas.getContext('2d');
  if (!c2) return { pixels: [], scale: 1 };

  c2.fillStyle = '#000000';
  c2.fillRect(0, 0, S, S);
  c2.save();
  c2.translate(S / 2, S / 2);
  c2.rotate((-38 * Math.PI) / 180);
  const R = S * 0.3;
  const W = S * 0.075;

  const grad = c2.createLinearGradient(-R, -R, R, R);
  grad.addColorStop(0, '#00F0FF');
  grad.addColorStop(1, '#8A2BE2');

  c2.strokeStyle = grad;
  c2.lineWidth = W;
  c2.lineCap = 'round';
  c2.beginPath();
  c2.arc(0, 0, R, -Math.PI / 2, (148.05 * Math.PI) / 180, false);
  c2.stroke();

  c2.strokeStyle = 'rgba(245,245,247,0.85)';
  c2.lineWidth = S * 0.008;
  c2.beginPath();
  c2.arc(0, 0, R * 0.62, -Math.PI / 2, (149 * Math.PI) / 180, true);
  c2.stroke();
  c2.restore();

  const img = c2.getImageData(0, 0, S, S);
  const pixels: LogoPixel[] = [];
  for (let y = 0; y < S; y += LOGO_SAMPLE_STEP) {
    for (let x = 0; x < S; x += LOGO_SAMPLE_STEP) {
      if (Math.random() > LOGO_KEEP_PROB) continue;
      const idx = (y * S + x) * 4;
      const a = img.data[idx + 3]!;
      if (a < 100) continue;
      pixels.push({
        px: x,
        py: y,
        r: img.data[idx]! / 255,
        g: img.data[idx + 1]! / 255,
        b: img.data[idx + 2]! / 255,
      });
    }
  }

  const scale = WORLD_R / (S * 0.3);
  return { pixels, scale };
}

function canvasToMarkLocal(
  px: number,
  py: number,
  S: number
): [number, number] {
  const rot = (-38 * Math.PI) / 180;
  const dx = px - S / 2;
  const dy = py - S / 2;
  const lx = dx * Math.cos(-rot) - dy * Math.sin(-rot);
  const ly = dx * Math.sin(-rot) + dy * Math.cos(-rot);
  return [lx, ly];
}

function sampleLogoTube(
  p: LogoPixel,
  scale: number,
  strokeHalfWorld: number,
  logoScale: number,
  logoOffset: [number, number, number],
  S = 640
): { x: number; y: number; z: number; color: [number, number, number] } {
  const worldScale = scale * logoScale;
  const [lx, ly] = canvasToMarkLocal(p.px, p.py, S);
  const r = Math.hypot(lx, ly) || 1;
  const nx = lx / r;
  const ny = ly / r;
  const radialOff = gaussian() * 0.25 * strokeHalfWorld;
  const perpZ = gaussian() * 0.55 * strokeHalfWorld;
  const mxl = lx + nx * radialOff;
  const myl = ly + ny * radialOff;

  return {
    x: mxl * worldScale + logoOffset[0],
    y: -myl * worldScale + logoOffset[1],
    z: perpZ + logoOffset[2],
    color: scaleColor([p.r, p.g, p.b], LOGO_COLOR_BRIGHTNESS),
  };
}

function sampleNodeCloud(
  scale: number,
  count: number,
  logoScale: number,
  logoOffset: [number, number, number]
): Array<{ x: number; y: number; z: number; color: [number, number, number] }> {
  const S = 640;
  const R = S * 0.3;
  const W = S * 0.075;
  const na = (233.35 * Math.PI) / 180;
  const nlx = Math.cos(na) * R;
  const nly = Math.sin(na) * R;
  const worldScale = scale * logoScale;
  const cx = nlx * worldScale + logoOffset[0];
  const cy = -nly * worldScale + logoOffset[1];
  const cz = logoOffset[2];
  const sigma = W * 0.55 * scale * logoScale * 0.32;
  const out: Array<{
    x: number;
    y: number;
    z: number;
    color: [number, number, number];
  }> = [];

  for (let n = 0; n < count; n++) {
    out.push({
      x: cx + gaussian() * sigma,
      y: cy + gaussian() * sigma,
      z: cz + gaussian() * sigma * 0.45,
      color: scaleColor(CYAN, LOGO_COLOR_BRIGHTNESS),
    });
  }
  return out;
}

function buildGalaxyGas(
  count: number,
  hue: 'cyan' | 'violet'
): Array<{
  lx: number;
  ly: number;
  gid: number;
  color: [number, number, number];
}> {
  const out: Array<{
    lx: number;
    ly: number;
    gid: number;
    color: [number, number, number];
  }> = [];
  const armN = Math.floor(count * 0.55);
  const coreN = Math.floor(count * 0.25);
  const haloN = count - armN - coreN;
  const aSpiral = 0.08;
  const rMax = 2.8;
  const base = hue === 'cyan' ? CYAN : VIOLET;
  const accent = hue === 'cyan' ? VIOLET : CYAN;
  const gid = hue === 'cyan' ? 0 : 1;

  for (let n = 0; n < armN; n++) {
    const arm = n % 2;
    const theta = Math.random() * 3.5 * Math.PI + arm * Math.PI;
    const armR = aSpiral * Math.exp(0.28 * theta);
    const tangentX = -Math.sin(theta);
    const tangentY = Math.cos(theta);
    const normalX = Math.cos(theta);
    const normalY = Math.sin(theta);
    const perpScatter = gaussian() * 0.16 * armR;
    const alongScatter = gaussian() * 0.06 * armR;
    const lx =
      armR * Math.cos(theta) +
      normalX * perpScatter +
      tangentX * alongScatter;
    const ly =
      armR * Math.sin(theta) +
      normalY * perpScatter +
      tangentY * alongScatter;
    const t = Math.min(Math.hypot(lx, ly) / rMax, 1);
    const col = scaleColor(mixColor(base, accent, t * 0.3), 0.22 * GAL_BRIGHTNESS);
    out.push({ lx, ly, gid, color: col });
  }

  for (let n = 0; n < coreN; n++) {
    const lx = gaussian() * 0.18 * rMax;
    const ly = gaussian() * 0.18 * rMax;
    const dist = Math.hypot(lx, ly);
    const warmMix = Math.exp(-(dist * dist) / (0.05 * rMax * rMax)) * 0.25;
    const col = scaleColor(mixColor(base, WARM_WHITE, warmMix), 0.44 * GAL_BRIGHTNESS);
    out.push({ lx, ly, gid, color: col });
  }

  for (let n = 0; n < haloN; n++) {
    const discR = Math.sqrt(Math.random()) * rMax;
    const theta = Math.random() * Math.PI * 2;
    const lx = discR * Math.cos(theta);
    const ly = discR * Math.sin(theta);
    const t = discR / rMax;
    const col = scaleColor(mixColor(base, accent, t * 0.15), 0.066 * GAL_BRIGHTNESS);
    out.push({ lx, ly, gid, color: col });
  }

  return out;
}

function buildParticles(isMobile: boolean): { particles: ParticleArrays; counts: BuildCounts } {
  const { pixels, scale } = buildLogoPixelPool();
  const S = 640;
  const W = S * 0.075;
  const logoScale = isMobile ? LOGO_MOBILE_SCALE : LOGO_SCALE;
  const logoOffset = isMobile ? LOGO_MOBILE_OFFSET : LOGO_OFFSET;
  const strokeHalfWorld = W * scale * 0.5 * logoScale;

  const logoCount =
    pixels.length > 0 ? pixels.length + NODE_COUNT : NODE_COUNT;

  let galaxyCount: number;
  let ambientCount: number;
  let teamCount: number;
  let platformCount: number;
  let statsCount: number;

  if (isMobile) {
    galaxyCount = MOBILE_GALAXY_COUNT;
    ambientCount = MOBILE_AMBIENT;
    teamCount = 0;
    platformCount = 0;
    statsCount = 0;
  } else {
    galaxyCount = GALAXY_TOTAL;
    teamCount = TEAM_COUNT;
    platformCount = PLATFORM_COUNT;
    statsCount = STATS_COUNT;
    const fixedOther =
      GALAXY_TOTAL + TEAM_COUNT + PLATFORM_COUNT + STATS_COUNT;
    ambientCount = Math.max(0, MAX_PARTICLES - logoCount - fixedOther);
  }

  const count =
    logoCount + galaxyCount + ambientCount + teamCount + platformCount + statsCount;

  if (isMobile && count > MOBILE_MAX) {
    ambientCount = Math.max(0, MOBILE_MAX - logoCount - galaxyCount);
  }

  const finalCount =
    logoCount + galaxyCount + ambientCount + teamCount + platformCount + statsCount;
  const ambientStart = logoCount + galaxyCount;

  const base = new Float32Array(finalCount * 3);
  const rand = new Float32Array(finalCount);
  const type = new Float32Array(finalCount);
  const section = new Float32Array(finalCount);
  const aux0 = new Float32Array(finalCount);
  const aux1 = new Float32Array(finalCount);
  const aux2 = new Float32Array(finalCount);
  const color = new Float32Array(finalCount * 3);

  let i = 0;
  const put = (
    x: number,
    y: number,
    z: number,
    r: number,
    typ: number,
    sec: number,
    col: [number, number, number],
    a0 = 0,
    a1 = 0,
    a2 = 0
  ) => {
    base[i * 3] = x;
    base[i * 3 + 1] = y;
    base[i * 3 + 2] = z;
    rand[i] = r;
    type[i] = typ;
    section[i] = sec;
    aux0[i] = a0;
    aux1[i] = a1;
    aux2[i] = a2;
    color[i * 3] = col[0];
    color[i * 3 + 1] = col[1];
    color[i * 3 + 2] = col[2];
    i++;
  };

  if (pixels.length > 0) {
    for (const p of pixels) {
      const s = sampleLogoTube(
        p,
        scale,
        strokeHalfWorld,
        logoScale,
        logoOffset
      );
      put(s.x, s.y, s.z, Math.random(), 0, 0, s.color, 0, 0, 0);
    }
  }

  const nodeParticles = sampleNodeCloud(scale, NODE_COUNT, logoScale, logoOffset);
  for (const s of nodeParticles) {
    put(s.x, s.y, s.z, Math.random(), 0, 0, s.color, 0, 0, 1);
  }

  const galaxyDefs: Array<{
    center: [number, number, number];
    hue: 'cyan' | 'violet';
  }> = isMobile
    ? [{ center: [4.5, 2.4, -2.6], hue: 'cyan' }]
    : [
        { center: [4.5, 2.1, -2.6], hue: 'cyan' },
        { center: [-4.0, -1.5, -2.6], hue: 'violet' },
      ];

  const perGalaxy = isMobile
    ? MOBILE_GALAXY_COUNT
    : GALAXY_COUNT;

  for (const def of galaxyDefs) {
    const parts = buildGalaxyGas(perGalaxy, def.hue);
    for (const p of parts) {
      put(
        def.center[0],
        def.center[1],
        def.center[2],
        Math.random(),
        1,
        1,
        p.color,
        p.lx,
        p.ly,
        p.gid
      );
    }
  }

  for (let n = 0; n < ambientCount; n++) {
    const t = Math.random();
    put(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 14,
      -3 - Math.random() * 10,
      Math.random(),
      1,
      0,
      mixColor(CYAN, VIOLET, t)
    );
  }

  for (let n = 0; n < teamCount; n++) {
    put(
      0,
      0,
      0,
      Math.random(),
      2,
      2,
      VIOLET,
      Math.random() * Math.PI * 2,
      1.2 + Math.random() * 1.6,
      (Math.random() - 0.5) * 2.2
    );
  }

  const sampleFrame = (cx: number): [number, number, number] => {
    const w = 1.55;
    const d = 0.55;
    const z = -4.2;
    const p = Math.random() * (w * 4 + d * 4);
    if (p < w * 2) return [cx - w + p, (Math.random() - 0.5) * 0.04, z - d];
    if (p < w * 2 + d * 2)
      return [cx + w, (Math.random() - 0.5) * 0.04, z - d + (p - w * 2)];
    if (p < w * 4 + d * 2)
      return [cx + w - (p - w * 2 - d * 2), (Math.random() - 0.5) * 0.04, z + d];
    return [cx - w, (Math.random() - 0.5) * 0.04, z + d - (p - w * 4 - d * 2)];
  };

  for (let n = 0; n < platformCount; n++) {
    const cx = PLATFORM_CENTERS[n % 3]!;
    const [x, y, z] = sampleFrame(cx);
    put(x, y, z, Math.random(), 3, 3, CYAN, Math.random() * 6.28, 0, 0);
  }

  const STATS_BAND_Y = -2.35;
  const STATS_BAND_HALF_W = 2.75;
  const STATS_BAND_HALF_H = 0.15;

  for (let n = 0; n < statsCount; n++) {
    put(
      (Math.random() - 0.5) * STATS_BAND_HALF_W * 2,
      STATS_BAND_Y + (Math.random() - 0.5) * STATS_BAND_HALF_H * 2,
      -3.0,
      Math.random(),
      4,
      4,
      CYAN,
      Math.random() * 6.28,
      0.4 + Math.random() * 0.8,
      0
    );
  }

  const counts: BuildCounts = {
    logo: logoCount,
    galaxy: isMobile ? MOBILE_GALAXY_COUNT : GALAXY_TOTAL,
    ambient: ambientCount,
    team: teamCount,
    platform: platformCount,
    stats: statsCount,
    total: finalCount,
    ambientStart,
  };

  return {
    particles: { base, rand, type, section, aux0, aux1, aux2, color, count: finalCount },
    counts,
  };
}

function perspective(aspect: number, fov: number, near: number, far: number) {
  const f = 1 / Math.tan(fov / 2);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

function lookAt(
  eye: [number, number, number],
  center: [number, number, number],
  up: [number, number, number]
) {
  const [ex, ey, ez] = eye;
  const [cx, cy, cz] = center;
  let zx = ex - cx;
  let zy = ey - cy;
  let zz = ez - cz;
  const zl = Math.hypot(zx, zy, zz) || 1;
  zx /= zl;
  zy /= zl;
  zz /= zl;
  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  const xl = Math.hypot(xx, xy, xz) || 1;
  xx /= xl;
  xy /= xl;
  xz /= xl;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  const out = new Float32Array(16);
  out[0] = xx;
  out[1] = yx;
  out[2] = zx;
  out[4] = xy;
  out[5] = yy;
  out[6] = zy;
  out[8] = xz;
  out[9] = yz;
  out[10] = zz;
  out[12] = -(xx * ex + xy * ey + xz * ez);
  out[13] = -(yx * ex + yy * ey + yz * ez);
  out[14] = -(zx * ex + zy * ey + zz * ez);
  out[15] = 1;
  return out;
}

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[r + 4] * b[c * 4 + 1] +
        a[r + 8] * b[c * 4 + 2] +
        a[r + 12] * b[c * 4 + 3];
    }
  }
  return out;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? 'shader compile failed');
  }
  return sh;
}

export default function ParticleLogoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { progress } = useScrollStore();
  const { setReady } = useLoading();
  const progressRef = useRef(0);
  const smoothScrollRef = useRef(0);
  const readySent = useRef(false);
  const [webglKey, setWebglKey] = useState(0);

  progressRef.current = progress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    let bootRaf = 0;

    const emitSceneReady = () => {
      if (readySent.current) return;
      readySent.current = true;
      setReady();
      window.dispatchEvent(new CustomEvent(SCENE_READY_EVENT));
    };

    const boot = () => {
      if (disposed) return;

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      canvas.style.backgroundColor = '#030303';
      emitSceneReady();
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobileProfile = detectMobileProfile();

    const { particles, counts } = buildParticles(isMobileProfile);
    if (process.env.NODE_ENV === 'development') {
      console.log('[ParticleLogoBackground] particle counts:', counts);
    }

    let drawCount = particles.count;
    let halfAmbient = false;
    let fpsChecked = false;
    let dprCap = isMobileProfile ? 1.5 : 2;
    let lastFrame = performance.now();
    const fpsWindow: number[] = [];
    const fpsWindowMs = 3000;
    let touchStrength = isMobileProfile ? 0 : 1;

    const vs = compile(gl, gl.VERTEX_SHADER, PARTICLE_VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, PARTICLE_FRAG);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const loc = {
      a_base: gl.getAttribLocation(program, 'a_base'),
      a_rand: gl.getAttribLocation(program, 'a_rand'),
      a_type: gl.getAttribLocation(program, 'a_type'),
      a_section: gl.getAttribLocation(program, 'a_section'),
      a_aux0: gl.getAttribLocation(program, 'a_aux0'),
      a_aux1: gl.getAttribLocation(program, 'a_aux1'),
      a_aux2: gl.getAttribLocation(program, 'a_aux2'),
      a_color: gl.getAttribLocation(program, 'a_color'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_scroll: gl.getUniformLocation(program, 'u_scroll'),
      u_mouse: gl.getUniformLocation(program, 'u_mouse'),
      u_motion: gl.getUniformLocation(program, 'u_motion'),
      u_touchStrength: gl.getUniformLocation(program, 'u_touchStrength'),
      u_galEuler0: gl.getUniformLocation(program, 'u_galEuler0'),
      u_galEuler1: gl.getUniformLocation(program, 'u_galEuler1'),
      u_viewProj: gl.getUniformLocation(program, 'u_viewProj'),
    };

    const makeBuffer = (data: Float32Array, locIdx: number, size: number) => {
      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(locIdx);
      gl.vertexAttribPointer(locIdx, size, gl.FLOAT, false, 0, 0);
      return buf;
    };

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const buffers = [
      makeBuffer(particles.base, loc.a_base, 3),
      makeBuffer(particles.rand, loc.a_rand, 1),
      makeBuffer(particles.type, loc.a_type, 1),
      makeBuffer(particles.section, loc.a_section, 1),
      makeBuffer(particles.aux0, loc.a_aux0, 1),
      makeBuffer(particles.aux1, loc.a_aux1, 1),
      makeBuffer(particles.aux2, loc.a_aux2, 1),
      makeBuffer(particles.color, loc.a_color, 3),
    ];
    gl.bindVertexArray(null);

    let raf = 0;
    let firstDrawDone = false;
    let paused = document.hidden;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const start = performance.now();
    let viewProj = new Float32Array(16);

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * d);
      canvas.height = Math.round(h * d);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = canvas.width / canvas.height;
      const proj = perspective(aspect, (35 * Math.PI) / 180, 0.1, 60);
      const t = (performance.now() - start) * 0.001;
      const driftX = isMobileProfile ? Math.sin(t * 0.31) * 0.03 : 0;
      const driftY = isMobileProfile ? Math.cos(t * 0.23) * 0.03 : 0;
      const view = lookAt(
        [driftX, driftY, 7],
        [driftX, driftY, -0.5],
        [0, 1, 0]
      );
      viewProj = multiply(proj, view);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e: PointerEvent) => {
      if (isMobileProfile) return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove);

    const onTouchMove = (e: TouchEvent) => {
      if (!isMobileProfile || !e.touches[0]) return;
      e.preventDefault();
      const touch = e.touches[0];
      pointer.tx = (touch.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = -((touch.clientY / window.innerHeight) * 2 - 1);
      touchStrength = 1;
    };
    const onTouchEnd = () => {
      if (!isMobileProfile) return;
    };
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused && !disposed) {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      disposed = true;
      cancelAnimationFrame(raf);
      canvas.style.backgroundColor = '#030303';
    };
    const onContextRestored = () => {
      setWebglKey((k) => k + 1);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const draw = () => {
      if (disposed || paused) return;
      const now = performance.now();
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const t = (now - start) * 0.001;

      if (isMobileProfile && touchStrength > 0) {
        touchStrength = Math.max(0, touchStrength - dt / 0.8);
      }

      if (isMobileProfile && !fpsChecked) {
        fpsWindow.push(1 / Math.max(dt, 1e-4));
        const elapsed = now - start;
        if (elapsed >= fpsWindowMs) {
          fpsChecked = true;
          const avgFps =
            fpsWindow.reduce((a, b) => a + b, 0) / fpsWindow.length;
          if (avgFps < 40 && counts.ambient > 0) {
            halfAmbient = true;
            drawCount =
              counts.ambientStart + Math.floor(counts.ambient / 2);
            dprCap = 1;
            resize();
          }
        }
      }

      smoothScrollRef.current +=
        (progressRef.current - smoothScrollRef.current) * 0.07;
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      if (isMobileProfile) {
        const driftX = Math.sin(t * 0.31) * 0.03;
        const driftY = Math.cos(t * 0.23) * 0.03;
        const aspect = canvas.width / canvas.height;
        const proj = perspective(aspect, (35 * Math.PI) / 180, 0.1, 60);
        const view = lookAt(
          [driftX, driftY, 7],
          [driftX, driftY, -0.5],
          [0, 1, 0]
        );
        viewProj = multiply(proj, view);
      }

      gl.clearColor(0.012, 0.012, 0.012, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform1f(loc.u_time, t);
      gl.uniform1f(loc.u_scroll, smoothScrollRef.current);
      gl.uniform2f(loc.u_mouse, pointer.x, pointer.y);
      gl.uniform1f(loc.u_motion, reducedMotion ? 0 : 1);
      gl.uniform1f(loc.u_touchStrength, isMobileProfile ? touchStrength : 1);
      gl.uniform3f(
        loc.u_galEuler0,
        GAL_EULER[0][0] + Math.sin(t * 0.38) * 0.07,
        GAL_EULER[0][1] + (reducedMotion ? 0 : t * 0.32),
        GAL_EULER[0][2] + Math.cos(t * 0.28) * 0.06
      );
      gl.uniform3f(
        loc.u_galEuler1,
        GAL_EULER[1][0],
        GAL_EULER[1][1],
        GAL_EULER[1][2]
      );
      gl.uniformMatrix4fv(loc.u_viewProj, false, viewProj);

      gl.drawArrays(gl.POINTS, 0, drawCount);
      if (!firstDrawDone) {
        firstDrawDone = true;
        emitSceneReady();
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    cleanup = () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (!gl.isContextLost()) {
        buffers.forEach((b) => gl.deleteBuffer(b));
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
      }
    };
    };

    bootRaf = requestAnimationFrame(boot);

    return () => {
      disposed = true;
      cancelAnimationFrame(bootRaf);
      cleanup?.();
    };
  }, [setReady, webglKey]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full bg-[#030303]"
      aria-hidden="true"
    />
  );
}
