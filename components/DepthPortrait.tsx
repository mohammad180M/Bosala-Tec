'use client';

import { useEffect, useRef, useState } from 'react';
import { detectMobileProfile } from '@/lib/mobileProfile';

export interface DepthPortraitTunables {
  strength: number;
  spotlight: number;
  depthContrast: number;
  parallaxMul: number;
  grain: number;
  trackWindow: boolean;
}

interface DepthPortraitProps extends Partial<DepthPortraitTunables> {
  src: string;
  depthSrc: string;
  alt?: string;
  className?: string;
}

const DEFAULT_TUNABLES: DepthPortraitTunables = {
  strength: 0.038,
  spotlight: 0.65,
  depthContrast: 1.6,
  parallaxMul: 2.0,
  grain: 0.03,
  trackWindow: false,
};

const VERT =
  '#version 300 es\n' +
  'in vec2 a_position;\n' +
  'out vec2 vUv;\n' +
  'void main() {\n' +
  '  vUv = a_position * 0.5 + 0.5;\n' +
  '  vUv.y = 1.0 - vUv.y;\n' +
  '  gl_Position = vec4(a_position, 0.0, 1.0);\n' +
  '}\n';

const FRAG =
  '#version 300 es\n' +
  'precision highp float;\n' +
  'uniform sampler2D u_texture;\n' +
  'uniform sampler2D u_depthMap;\n' +
  'uniform vec2 u_mouse;\n' +
  'uniform vec2 u_resolution;\n' +
  'uniform vec2 u_imageSize;\n' +
  'uniform float u_strength;\n' +
  'uniform float u_time;\n' +
  'uniform float u_depthContrast;\n' +
  'uniform float u_spotlightBoost;\n' +
  'uniform float u_parallaxMul;\n' +
  'uniform float u_grain;\n' +
  'in vec2 vUv;\n' +
  'out vec4 outColor;\n' +
  'float hash(vec3 p) {\n' +
  '  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);\n' +
  '}\n' +
  'vec2 coverUv(vec2 uv) {\n' +
  '  float canvasAspect = u_resolution.x / u_resolution.y;\n' +
  '  float imageAspect = u_imageSize.x / u_imageSize.y;\n' +
  '  vec2 s = vec2(1.0);\n' +
  '  if (canvasAspect > imageAspect) {\n' +
  '    s.y = imageAspect / canvasAspect;\n' +
  '  } else {\n' +
  '    s.x = canvasAspect / imageAspect;\n' +
  '  }\n' +
  '  return (uv - 0.5) * s + 0.5;\n' +
  '}\n' +
  'void main() {\n' +
  '  vec2 uv = coverUv(vUv);\n' +
  '  float rawDepth = texture(u_depthMap, uv).r;\n' +
  '  float depth = clamp((rawDepth - 0.5) * u_depthContrast + 0.5, 0.0, 1.0);\n' +
  '  vec2 offset = u_mouse * (depth - 0.5) * u_strength * u_parallaxMul;\n' +
  '  vec2 duv = clamp(uv - offset, vec2(0.001), vec2(0.999));\n' +
  '  vec4 color = texture(u_texture, duv);\n' +
  '  float aspect = u_resolution.x / u_resolution.y;\n' +
  '  vec2 pixelPos = (vUv - 0.5) * vec2(aspect, 1.0) * 2.0;\n' +
  '  vec2 mousePos = u_mouse * vec2(aspect, 1.0);\n' +
  '  float dist = length(pixelPos - mousePos);\n' +
  '  float spotlight = smoothstep(1.2, 0.0, dist);\n' +
  '  float sampledDepth = clamp((texture(u_depthMap, duv).r - 0.5) * u_depthContrast + 0.5, 0.0, 1.0);\n' +
  '  float boost = spotlight * sampledDepth * u_spotlightBoost;\n' +
  '  color.rgb += boost * vec3(0.54, 0.17, 0.89);\n' +
  '  float vig = smoothstep(1.25, 0.35, length(vUv - 0.5) * 1.6);\n' +
  '  color.rgb *= mix(0.82, 1.0, vig);\n' +
  '  color.rgb += (hash(vec3(vUv * u_resolution.xy, u_time)) - 0.5) * u_grain;\n' +
  '  outColor = vec4(color.rgb, 1.0);\n' +
  '}\n';

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  label: string
): WebGLShader {
  if (gl.isContextLost()) {
    throw new Error(`${label}: WebGL context is lost`);
  }
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error(`${label}: createShader returned null`);
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? '(no driver log)';
    gl.deleteShader(shader);
    throw new Error(`${label} compile failed: ${log}`);
  }
  return shader;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('createProgram returned null');
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? '(no driver log)';
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${log}`);
  }
  return program;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function createTexture(gl: WebGL2RenderingContext, img: HTMLImageElement) {
  const tex = gl.createTexture();
  if (!tex) throw new Error('createTexture returned null');
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  return tex;
}

export default function DepthPortrait({
  src,
  depthSrc,
  alt = '',
  className = '',
  strength = DEFAULT_TUNABLES.strength,
  spotlight = DEFAULT_TUNABLES.spotlight,
  depthContrast = DEFAULT_TUNABLES.depthContrast,
  parallaxMul = DEFAULT_TUNABLES.parallaxMul,
  grain = DEFAULT_TUNABLES.grain,
  trackWindow = DEFAULT_TUNABLES.trackWindow,
}: DepthPortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  const tunablesRef = useRef<DepthPortraitTunables>(DEFAULT_TUNABLES);
  tunablesRef.current = {
    strength,
    spotlight,
    depthContrast,
    parallaxMul,
    grain,
    trackWindow,
  };

  useEffect(() => {
    setFailed(false);

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });

    if (!gl || gl.isContextLost()) {
      setFailed(true);
      return;
    }

    let raf = 0;
    let running = false;
    let disposed = false;
    let texColor: WebGLTexture | null = null;
    let texDepth: WebGLTexture | null = null;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const imageSize = { w: 1, h: 1 };
    const start = performance.now();
    const uniforms: Record<string, WebGLUniformLocation | null> = {};

    let program: WebGLProgram;
    let vao: WebGLVertexArrayObject;
    let vbo: WebGLBuffer;

    try {
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERT, 'vertex');
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG, 'fragment');
      program = linkProgram(gl, vs, fs);

      for (const name of [
        'u_texture',
        'u_depthMap',
        'u_mouse',
        'u_resolution',
        'u_imageSize',
        'u_strength',
        'u_time',
        'u_depthContrast',
        'u_spotlightBoost',
        'u_parallaxMul',
        'u_grain',
      ]) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }

      vao = gl.createVertexArray()!;
      vbo = gl.createBuffer()!;
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      const aPos = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
    } catch {
      setFailed(true);
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isTouchDevice =
      navigator.maxTouchPoints > 0 || detectMobileProfile();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: w, clientHeight: h } = container;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const draw = () => {
      if (disposed || gl.isContextLost() || !texColor || !texDepth) return;

      const elapsed = (performance.now() - start) * 0.001;
      const t = tunablesRef.current;
      if (isTouchDevice) {
        mouse.x = Math.sin(elapsed * 0.6) * 0.12;
        mouse.y = Math.cos(elapsed * 0.45) * 0.08;
      } else {
        const k = t.trackWindow ? 0.11 : 0.07;
        mouse.x += (mouse.tx - mouse.x) * k;
        mouse.y += (mouse.ty - mouse.y) * k;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform2f(uniforms.u_mouse, mouse.x, mouse.y);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.u_imageSize, imageSize.w, imageSize.h);
      gl.uniform1f(uniforms.u_strength, reducedMotion ? 0 : t.strength);
      gl.uniform1f(uniforms.u_time, (performance.now() - start) * 0.001);
      gl.uniform1f(uniforms.u_depthContrast, t.depthContrast);
      gl.uniform1f(uniforms.u_spotlightBoost, t.spotlight);
      gl.uniform1f(uniforms.u_parallaxMul, t.parallaxMul);
      gl.uniform1f(uniforms.u_grain, t.grain);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texColor);
      gl.uniform1i(uniforms.u_texture, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texDepth);
      gl.uniform1i(uniforms.u_depthMap, 1);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (!running && !disposed && texColor && texDepth) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0.05 }
    );
    io.observe(container);

    const onMove = (e: PointerEvent) => {
      const useWindow = tunablesRef.current.trackWindow;
      if (useWindow) {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
        return;
      }
      const r = container.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => {
      mouse.tx = 0;
      mouse.ty = 0;
    };

    const useWindow = tunablesRef.current.trackWindow;
    if (!isTouchDevice) {
      if (useWindow) {
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerleave', onLeave);
      } else {
        container.addEventListener('pointermove', onMove);
        container.addEventListener('pointerleave', onLeave);
      }
    }

    let texturesReady = false;

    Promise.all([loadImage(src), loadImage(depthSrc)])
      .then(([imgColor, imgDepth]) => {
        if (disposed || gl.isContextLost()) return;

        imageSize.w = imgColor.naturalWidth;
        imageSize.h = imgColor.naturalHeight;
        texColor = createTexture(gl, imgColor);
        texDepth = createTexture(gl, imgDepth);
        texturesReady = true;
        resize();
        startLoop();
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      stopLoop();
      io.disconnect();
      ro.disconnect();
      if (!isTouchDevice) {
        if (useWindow) {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerleave', onLeave);
        } else {
          container.removeEventListener('pointermove', onMove);
          container.removeEventListener('pointerleave', onLeave);
        }
      }
      if (texturesReady) {
        if (texColor) gl.deleteTexture(texColor);
        if (texDepth) gl.deleteTexture(texDepth);
      }
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, [src, depthSrc]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}
    >
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={800}
          height={800}
          className="h-full w-full object-cover"
        />
      ) : (
        <canvas
          ref={canvasRef}
          aria-label={alt}
          role="img"
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}
