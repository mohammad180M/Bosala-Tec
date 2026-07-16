export const PARTICLE_VERT = `#version 300 es
precision highp float;

in vec3 a_base;
in float a_rand;
in float a_type;
in float a_section;
in float a_aux0;
in float a_aux1;
in float a_aux2;
in vec3 a_color;

uniform float u_time;
uniform float u_scroll;
uniform vec2 u_mouse;
uniform float u_motion;
uniform float u_touchStrength;
uniform vec3 u_galEuler0;
uniform vec3 u_galEuler1;
uniform mat4 u_viewProj;

out float v_alpha;
out vec3 v_color;
out float v_soft;

vec3 randDir(float r) {
  float t = r * 6.2831853;
  float p = fract(r * 1.6180339) * 3.14159265;
  return normalize(vec3(cos(t) * sin(p), sin(t) * sin(p), cos(p)) + 1e-5);
}

vec3 rotateEuler(vec3 p, vec3 e) {
  float cx = cos(e.x), sx = sin(e.x);
  float cy = cos(e.y), sy = sin(e.y);
  float cz = cos(e.z), sz = sin(e.z);
  vec3 p1 = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
  vec3 p2 = vec3(p1.x * cy + p1.z * sy, p1.y, -p1.x * sy + p1.z * cy);
  return vec3(p2.x * cz - p2.y * sz, p2.x * sz + p2.y * cz, p2.z);
}

void main() {
  vec3 pos = a_base;
  float alpha = 1.0;
  vec3 col = a_color;
  float soft = 0.45;
  float repScale = 1.0;
  float sizeBase = 1.6;

  float twinkleRate = 2.2;

  float dissolve = smoothstep(0.0, 0.25, u_scroll);
  float reform = smoothstep(0.85, 1.0, u_scroll);
  float scatter = dissolve * (1.0 - reform);

  if (a_type < 0.5) {
    pos += randDir(a_rand) * scatter * 2.8;
    pos = mix(pos, a_base * 0.82, reform);
    alpha = mix(mix(0.55, 0.15, dissolve), 0.55, reform);
    col = a_color * (0.92 + a_rand * 0.16);
    if (a_aux2 > 0.5) {
      sizeBase = 2.0 + a_rand * 1.0;
    } else {
      sizeBase = 1.45;
    }
  } else if (a_section > 0.5 && a_section < 1.5) {
    float gid = a_aux2;
    float rMax = 2.8;
    float r = length(vec2(a_aux0, a_aux1));
    float radial = 1.5 - clamp(r / rMax, 0.0, 1.0);
    float speed = (0.02 + gid * 0.01) * radial;
    if (gid < 0.5) {
      speed = (0.06 + a_rand * 0.03) * radial;
    }
    float th = atan(a_aux1, a_aux0) + u_time * speed * u_motion;
    vec2 rot = vec2(cos(th) * r, sin(th) * r);
    vec3 local = vec3(rot.x, rot.y, 0.0);
    if (gid < 0.5) {
      float pulse = u_time * (1.6 + a_rand * 0.8) * u_motion;
      float rNorm = r / rMax;
      local.x += cos(pulse + a_rand * 6.28) * 0.09 * rNorm;
      local.y += sin(pulse * 1.18 + a_rand * 4.5) * 0.09 * rNorm;
      local.z += sin(pulse * 0.92 + a_rand * 3.2) * 0.16;
      twinkleRate = 6.2;
    }
    vec3 euler = gid < 0.5 ? u_galEuler0 : u_galEuler1;
    pos = a_base + rotateEuler(local, euler);
    float bright = max(a_color.r, max(a_color.g, a_color.b));
    alpha = bright * 0.9 + a_rand * 0.06;
    if (gid < 0.5) {
      alpha *= 1.45;
      col = a_color * 1.25;
    } else {
      col = a_color;
    }
    soft = 0.72;
    if (bright > 0.35) {
      sizeBase = 2.0 + a_rand * 1.0;
    } else {
      sizeBase = 3.0 + a_rand * 3.0;
    }
    repScale = 0.4;
  } else if (a_type < 1.5 && a_section < 0.5) {
    float t = u_time;
    pos.y += sin(t * 0.13 + a_rand * 6.28) * 0.14 + cos(t * 0.07 + a_rand * 3.1) * 0.1 + u_scroll * 0.35;
    pos.x += cos(t * 0.11 + a_rand * 4.0) * 0.1 + sin(t * 0.16 + a_rand * 5.5) * 0.07;
    pos.z += sin(t * 0.09 + a_rand * 2.8) * 0.06 + cos(t * 0.12 + a_rand * 1.7) * 0.04;
    alpha = 0.1 + a_rand * 0.14;
    vec3 cyan = vec3(0.0, 0.941, 1.0);
    vec3 violet = vec3(0.541, 0.169, 0.886);
    col = mix(cyan, violet, a_rand) * (0.14 + a_rand * 0.1);
    sizeBase = 1.4;
  } else if (a_section > 1.5 && a_section < 2.5) {
    float vis = smoothstep(0.14, 0.30, u_scroll) * (1.0 - smoothstep(0.40, 0.56, u_scroll));
    float ang = a_aux0 + u_time * (0.05 + a_rand * 0.08) * u_motion;
    float r = a_aux1;
    pos = vec3(cos(ang) * r + 5.8, a_aux2, sin(ang) * r - 3.2);
    alpha = vis * (0.14 + a_rand * 0.18);
    col = vec3(0.541, 0.169, 0.886);
  } else if (a_section > 2.5 && a_section < 3.5) {
    float vis = smoothstep(0.48, 0.56, u_scroll) * (1.0 - smoothstep(0.62, 0.70, u_scroll));
    pos = a_base;
    pos.y += sin(u_time * 0.35 + a_aux0) * 0.1 * u_motion;
    alpha = vis * 0.2;
    col = vec3(0.0, 0.941, 1.0);
  } else if (a_section > 3.5 && a_section < 4.5) {
    float vis = smoothstep(0.70, 0.76, u_scroll) * (1.0 - smoothstep(0.82, 0.88, u_scroll));
    pos = a_base;
    pos.x += sin(u_time * 0.25 + a_aux0) * 0.04 * u_motion;
    alpha = vis * 0.22;
    col = vec3(0.0, 0.941, 1.0) * 0.5;
  }

  vec4 clip0 = u_viewProj * vec4(pos, 1.0);
  vec2 ndc = clip0.xy / max(abs(clip0.w), 1e-4);
  vec2 m = u_mouse;
  float rep = u_motion * u_touchStrength * exp(-dot(ndc - m, ndc - m) * 8.0) * 0.35 * repScale;
  pos += normalize(vec3((ndc - m) * rep, 0.0) + vec3(0.0, 0.0, 1e-3)) * rep * 0.6;

  vec4 clip = u_viewProj * vec4(pos, 1.0);
  gl_Position = clip;
  float dist = max(-clip.w, 0.5);
  gl_PointSize = clamp((sizeBase + a_rand * 1.0) * (7.0 / dist) * (a_type < 0.5 ? 0.8 : 1.0), 0.5, 6.5);

  float twinkle = 0.62 + 0.38 * sin(u_time * twinkleRate + a_rand * 40.0);
  v_alpha = alpha * twinkle;
  v_color = col;
  v_soft = soft;
}`;

export const PARTICLE_FRAG = `#version 300 es
precision highp float;
in float v_alpha;
in vec3 v_color;
in float v_soft;
out vec4 outColor;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float core = 1.0 - smoothstep(0.0, v_soft, d);
  outColor = vec4(v_color, core * v_alpha);
}`;
