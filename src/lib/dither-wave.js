/*
 * dither-wave.js  ·  depth map + dither + glyph waves (WebGL2, no dependencies)
 * Ported from ../dither-wave.js (Field) as an ES module for React.
 *
 * createDitherWave(canvas, options) -> { C, set, addRipple, destroy } or null without WebGL2
 *
 * Pass 1 (low-res, soft): the scene (here: a page-long gradient) -> R depth, G shade/glow, B mask
 * Pass 2 (full-res):      cursor ripples refract the image, palette maps depth, dashed contours,
 *                         plus-grid, ordered dither, glyphs (01 / abcxyz) that flicker faster on
 *                         the wave crests, grain.  (Same shader as the original.)
 *
 * Differences from the original Field:
 *  - new "gradient" mode: dark base, blue diagonal band, warm corner glow; drifts with scrolling.
 *    The old modes (blobs, ring, relief) still work.
 *  - "islands" (gradient mode): a word drawn as a soft height map inside a page element
 *    (options.islands = { text, anchor: '#css-selector', font, amount, warmth }). It rises out of
 *    the dithered sea with contour lines, and scrolls with that element.
 *  - post pass: one added line that tints the scene's warm area (alpha < 1) with warm0/warm1;
 *    scenes that output alpha 1 (all the original ones) look exactly as before
 *  - colours may be hex strings or [r, g, b] arrays (0..1), so they can come from CSS variables
 *  - own frame loop + listeners per instance, removed again by destroy() (React unmount)
 *  - listens to pointer moves on window, so the canvas can sit behind the page content
 *  - touch screens: ripples follow the finger while swiping, a tap makes a ripple, and
 *    scrolling (also momentum scrolling after the finger lifts) keeps leaving ripples
 *
 *  - performance: renders at a reduced resolution (resScale, maxPixels), drops to fpsIdle when no
 *    ripples are running, lowers the resolution by itself if frames come too slowly (adaptive),
 *    skips the ripple maths when no ripple is near a pixel, and caches all layout reads
 *
 * Respects prefers-reduced-motion (still image, no ripples).
 */
import { onFrame } from './ticker';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const toRGB = (c) => (typeof c === 'string' ? hex(c) : c);

const SCENES = {
  blobs: `
    float sdf(vec3 p){
      float t = u_time * .22;
      vec3 a = vec3(sin(t) * .55, cos(t * 1.3) * .32, sin(t * .7) * .3);
      vec3 b = vec3(cos(t * .8) * .5, sin(t * 1.1) * .42, cos(t * .5) * .4);
      vec3 c = vec3(sin(t * .6 + 2.) * .42, -cos(t * .9) * .48, sin(t * 1.2) * .3);
      vec3 m = vec3((u_mouse.x - .5) * 1.4, (u_mouse.y - .5) * .9, .45);
      float d = length(p - a) - .44;
      d = smin(d, length(p - b) - .36, .5); d = smin(d, length(p - c) - .32, .5); d = smin(d, length(p - m) - .16, .55);
      vec3 q = p; q.yz *= rot(1.05 + sin(t) * .2); q.xy *= rot(t * .4);
      d = smin(d, length(vec2(length(q.xz) - 1.05, q.y)) - .045, .3);
      return d;
    }`,
  ring: `
    float sdf(vec3 p){
      float t = u_time * .18;
      p.y -= u_scroll * 2.6;
      vec3 q = p; q.yz *= rot(1.25 + sin(t) * .25); q.xz *= rot(t * .6);
      float tor = length(vec2(length(q.xz) - .95, q.y)) - .07;
      float core = length(p - vec3((u_mouse.x - .5) * .6, (u_mouse.y - .5) * .4, 0.)) - .22;
      float d = smin(tor, core, .25);
      vec3 r = p; r.xy *= rot(.6); r.xz *= rot(-t * .9);
      d = min(d, length(vec2(length(r.xz) - 1.5, r.y)) - .02);
      return d;
    }`,
};

// "Sunrise" gradient (viewport based, drifts slowly with scrolling):
// near-black base, a soft blue band from bottom-left to top-right, and a warm glow
// in the bottom-left corner. R = brightness (mapped through the 4 blue palette colours),
// alpha = 1 - warmth (the post pass tints that part with the two warm colours).
const gradientFS = `#version 300 es
precision highp float;
uniform vec2 u_res, u_mouse; uniform float u_time, u_scroll, u_hover, u_island, u_islandWarm; uniform vec4 u_rect;
uniform sampler2D u_height; out vec4 o;
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;                 // 0,0 = bottom-left
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float s = sin(u_scroll * 6.2832);                  // band sways as you scroll down the page
  vec2 A = vec2(-.15, .02 + .14 * s), B = vec2(asp + .15, 1.08 - .14 * s);
  vec2 ab = B - A; float t = clamp(dot(p - A, ab) / dot(ab, ab), 0., 1.);
  float d = length(p - (A + ab * t));
  float wob = .5 + .5 * sin(uv.x * 9. + u_time * .6) * sin(uv.y * 7. - u_time * .4);
  float band = exp(-d * d / (.055 + .02 * wob)) * (.7 + .3 * abs(t - .5) * 2.);
  vec2 G = vec2(-.08, -.12) - p;                     // glow sits just outside the bottom-left corner
  float glow = exp(-dot(G, G) / .2) * (.85 + .15 * cos(u_scroll * 6.2832));
  // islands: the word's height map, placed in u_rect (canvas uv), shifting slightly with the cursor
  float isl = 0.;
  if (u_island > 0.) {
    vec2 tuv = (uv - u_rect.xy) / u_rect.zw;
    tuv += (u_mouse - .5) * .03 + vec2(sin(uv.y * 40. + u_time * .7), cos(uv.x * 34. - u_time * .5)) * .003;
    if (all(greaterThan(tuv, vec2(0.))) && all(lessThan(tuv, vec2(1.)))) isl = texture(u_height, vec2(tuv.x, 1. - tuv.y)).r;
  }
  float lum = clamp(.02 + band * .62 + glow * .45 + (wob - .5) * .04 + isl * u_island, 0., 1.);
  vec2 dm = (uv - u_mouse) * vec2(asp, 1.);
  float light = exp(-dot(dm, dm) * 6.) * u_hover;
  o = vec4(lum, clamp(mix(lum, wob * .25, .15) + light, 0., 1.), 1., 1. - clamp(glow + isl * u_islandWarm, 0., 1.));
}`;

const reliefFS = `#version 300 es
precision highp float;
uniform vec2 u_res, u_mouse; uniform float u_time, u_scroll; uniform sampler2D u_height; out vec4 o;
void main(){
  vec2 uv = gl_FragCoord.xy / u_res; vec2 m = u_mouse - .5;
  float h0 = texture(u_height, vec2(uv.x, 1. - uv.y)).r;
  vec2 puv = uv - m * h0 * .035;
  float h = texture(u_height, vec2(puv.x, 1. - puv.y)).r;
  vec2 e = 1.5 / u_res;
  float hx = texture(u_height, vec2(puv.x + e.x, 1. - puv.y)).r, hy = texture(u_height, vec2(puv.x, 1. - puv.y - e.y)).r;
  vec3 n = normalize(vec3((h - hx) * 6., (h - hy) * 6., 1.));
  vec3 L = normalize(vec3(m.x * 2.2, m.y * 2.2, .7));
  float sh = clamp(dot(n, L), 0., 1.);
  float wob = .5 + .5 * sin(uv.x * 9. + u_time * .6) * sin(uv.y * 7. - u_time * .4);
  o = vec4(h, mix(sh * h, wob * .25, .15), step(.03, h), 1.);
}`;

const sdfFS = (mode) => `#version 300 es
precision highp float;
uniform vec2 u_res, u_mouse, u_center; uniform float u_time, u_scroll, u_zoom; out vec4 o;
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float smin(float a, float b, float k){ float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }
${SCENES[mode] || SCENES.blobs}
void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * u_res) / u_res.y - u_center;
  vec3 ro = vec3(0., 0., 3.4 / u_zoom), rd = normalize(vec3(uv, -1.7));
  vec2 m = u_mouse - .5; mat2 ry = rot(m.x * .9), rx = rot(-m.y * .6);
  float t = 1., md = 9.; bool hit = false;
  for (int i = 0; i < 56; i++) {
    vec3 p = ro + rd * t; p.xz *= ry; p.yz *= rx;
    float d = sdf(p); md = min(md, d);
    if (d < .002) { hit = true; break; }
    t += d * .9; if (t > 7.) break;
  }
  if (hit) {
    vec3 p = ro + rd * t; p.xz *= ry; p.yz *= rx; vec2 k = vec2(.003, 0.);
    vec3 n = normalize(vec3(sdf(p + k.xyy) - sdf(p - k.xyy), sdf(p + k.yxy) - sdf(p - k.yxy), sdf(p + k.yyx) - sdf(p - k.yyx)));
    float depth = clamp(1. - (t - (3.4 / u_zoom - 1.15)) / 1.7, 0., 1.);
    float rim = pow(1. - abs(n.z), 2.);
    o = vec4(depth, clamp(depth * .6 + rim * .7, 0., 1.), 1., 1.);
  } else o = vec4(0., exp(-md * 5.) * .55, 0., 1.);
}`;

// Post pass: same image as the original; adds the warm tint and skips ripple maths where there is none.
const postFS = `#version 300 es
precision highp float;
uniform sampler2D u_scene, u_atlas; uniform vec2 u_res; uniform float u_time, u_dpr;
uniform vec3 u_trail[20]; uniform vec3 u_c0, u_c1, u_c2, u_c3, u_gcol;
uniform float u_glyph, u_glyphWave, u_cell, u_rate, u_dither, u_levels, u_dcell, u_contour, u_cN, u_plus, u_grain, u_glow, u_refract, u_shade, u_gstart, u_gcount, u_vig, u_wamp;
uniform vec3 u_mark, u_warm0, u_warm1; uniform float u_warmAmt;
out vec4 o;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float b2(vec2 a){ a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
float b4(vec2 a){ return b2(.5 * a) * .25 + b2(a); }
uniform float u_active;   // 1 while any ripple is alive, else the ripple maths is skipped entirely
// ring is a gaussian of width ~118px: beyond |fr| > 360 it is < 0.0001, so skip it (same image, less work)
float wave(vec2 p, inout bool near){ float h = 0.;
  for (int i = 0; i < 20; i++) { vec3 tr = u_trail[i]; float dt = u_time - tr.z; if (tr.z <= 0. || dt < 0. || dt > 4.5) continue;
    float r = length(p - tr.xy), fr = r - dt * 240.; if (abs(fr) > 360.) continue;
    near = true; h += sin(r * .055 - dt * 8.) * exp(-fr * fr / 14000.) * exp(-dt * .9); }
  return h; }
vec3 pal(float x){ x = clamp(x, 0., 1.); return x < .33 ? mix(u_c0, u_c1, x / .33) : (x < .66 ? mix(u_c1, u_c2, (x - .33) / .33) : mix(u_c2, u_c3, (x - .66) / .34)); }
void main(){
  vec2 f = gl_FragCoord.xy / u_dpr, R = u_res / u_dpr;
  float h = 0.; vec2 g = vec2(0.);
  if (u_active > .5) {
    bool near = false; h = wave(f, near) * u_wamp;
    if (near) { bool n2 = false; g = vec2(wave(f + vec2(3., 0.), n2), wave(f + vec2(0., 3.), n2)) * u_wamp - h; }
  }
  vec2 uv = gl_FragCoord.xy / u_res + g * .03 * u_refract;
  vec4 s = texture(u_scene, uv);
  vec4 bl = vec4(0.); float rr = .018;
  for (int i = 0; i < 8; i++) { float a = float(i) * .785; bl += texture(u_scene, uv + vec2(cos(a), sin(a)) * rr * (i < 4 ? 1. : 2.1)); }
  bl /= 8.;
  float depth = s.r;
  float lum = mix(s.r, s.g, u_shade) * .92 + (1. - s.b) * bl.g * u_glow * .95 + bl.r * u_glow * .12 * (1. - s.b * .7) + h * .07;
  vec3 col = pal(lum);
  float warm = 1. - s.a;
  col = mix(col, mix(u_warm0, u_warm1, smoothstep(.45, 1., warm)), smoothstep(.04, .9, warm) * u_warmAmt);
  float lv = depth * u_cN; float cl = 1. - min(abs(fract(lv - .5) - .5) / max(fwidth(lv), 1e-3), 1.);
  float dash = step(.45, fract((f.x + f.y) / 8.));
  col = mix(col, u_mark, cl * dash * u_contour * step(.04, depth) * s.b);
  vec2 pg = mod(f, 56.) - 28.;
  float plus = max(step(abs(pg.x), .5) * step(abs(pg.y), 4.5), step(abs(pg.y), .5) * step(abs(pg.x), 4.5));
  col = mix(col, u_mark, plus * u_plus);
  vec3 q = floor(col * u_levels + b4(floor(f / u_dcell))) / u_levels;
  col = mix(col, q, u_dither);
  vec2 cid = floor(f / u_cell), cuv = fract(f / u_cell);
  float e = clamp(abs(h) * 2.2, 0., 1.);
  float cl2 = texture(u_scene, (cid + .5) * u_cell * u_dpr / u_res).r;
  float bg2 = texture(u_scene, (cid + .5) * u_cell * u_dpr / u_res).g;
  float rate = u_rate + e * 22.;
  float idx = u_gstart + floor(hash(cid + floor(u_time * rate + hash(cid) * 7.)) * u_gcount);
  float gm = texture(u_atlas, vec2((idx + mix(.12, .88, cuv.x)) / 16., 1. - mix(.08, .92, cuv.y))).r;
  float ga = gm * clamp(u_glyph * smoothstep(.12, .85, max(cl2, bg2 * 1.4)) + u_glyphWave * e, 0., 1.);
  col = mix(col, u_gcol, ga);
  col += (hash(f + fract(u_time * 7.) * 91.) - .5) * u_grain;
  vec2 vu = gl_FragCoord.xy / u_res - .5; col *= 1. - dot(vu, vu) * u_vig;
  o = vec4(col, 1.);
}`;

const vs = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

export function createDitherWave(canvas, o = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const C = Object.assign({ mode: 'gradient', scale: 0.5, palette: ['#05060c', '#232842', '#9da3c8', '#f1f1f4'], glyphCol: '#cfd6ff',
    gStart: 0, gCount: 2, glyph: 0.25, glyphWave: 0.9, cell: 10, rate: 1.2, dither: 0.6, levels: 6, ditherCell: 1, contour: 0.35, contourN: 9,
    plus: 0.18, grain: 0.07, glow: 0.8, refract: 1, shadeMix: 0.35, center: [0.2, 0], zoom: 1, mark: '#ebeeff', vignette: 0.55, wamp: 1, hover: 0.12,
    warm: ['#D1601F', '#FECD6D'], warmAmt: 1,
    scrollRipples: true, scrollStep: 40,
    fixed: false,          // canvas is position:fixed at 0,0 (skips layout reads)
    resScale: 1,           // render resolution relative to the (capped) device pixel ratio
    maxPixels: 2.2e6,      // never render more pixels than this per frame
    fpsMax: 60, fpsIdle: 30,
    adaptive: true, minScale: 0.4 }, o);

  // glyph atlas: 16 cells, 32px each
  const atlas = document.createElement('canvas'); atlas.width = 512; atlas.height = 32;
  const drawAtlas = () => { const a = atlas.getContext('2d'); a.clearRect(0, 0, 512, 32); a.fillStyle = '#fff'; a.textAlign = 'center'; a.textBaseline = 'middle';
    a.font = '500 24px "Kode Mono", ui-monospace, monospace'; '01abcxyz{}#/<>+-'.split('').forEach((ch, i) => a.fillText(ch, i * 32 + 16, 17)); };
  drawAtlas();

  const sceneFS = C.mode === 'gradient' ? gradientFS : C.mode === 'relief' ? reliefFS : sdfFS(C.mode);
  const shaders = [];
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(x)); shaders.push(x); return x; };
  const prog = (fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p)); return p; };
  const P1 = prog(sceneFS), P2 = prog(postFS);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const textures = [];
  const mkTex = (filter) => { const t = gl.createTexture(); textures.push(t); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
  const sceneTex = mkTex(gl.LINEAR), fbo = gl.createFramebuffer();
  const atlasTex = mkTex(gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  let alive = true;
  if (document.fonts) document.fonts.ready.then(() => { if (!alive) return; drawAtlas(); gl.bindTexture(gl.TEXTURE_2D, atlasTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas); });
  let heightTex = null;
  const setHeight = (cnv) => { heightTex = heightTex || mkTex(gl.LINEAR); gl.bindTexture(gl.TEXTURE_2D, heightTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cnv); };
  if (C.heightCanvas) setHeight(C.heightCanvas);
  // 1x1 black stand-in so u_height never points at the texture being rendered into
  const blankTex = mkTex(gl.NEAREST); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

  // islands: draw the word as a blurred height map sized to its anchor element
  let islandEl = null, islandSize = '';
  const drawIslands = (w, h) => {
    const I = C.islands, lines = I.text.split('\n');
    const t = document.createElement('canvas'); t.width = Math.max(2, Math.round(w * .5)); t.height = Math.max(2, Math.round(h * .5));
    const y = t.getContext('2d'); y.fillStyle = '#000'; y.fillRect(0, 0, t.width, t.height); y.fillStyle = '#fff';
    const font = I.font || '900 {size}px "Arial Black", Impact, sans-serif';
    let fs = t.height * .8 / lines.length; y.font = font.replace('{size}', fs);
    const widest = Math.max(...lines.map((l) => y.measureText(l).width));
    if (widest > t.width * .96) fs *= (t.width * .96) / widest;
    y.font = font.replace('{size}', fs); y.textBaseline = 'middle'; y.textAlign = 'center';
    const lh = fs * .92, top = t.height / 2 - (lh * (lines.length - 1)) / 2;
    lines.forEach((l, i) => y.fillText(l, t.width / 2, top + lh * i));
    const c = document.createElement('canvas'); c.width = t.width; c.height = t.height; const x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
    x.filter = 'blur(6px)'; x.globalAlpha = .7; x.drawImage(t, 0, 0);       // soft shore
    x.filter = 'blur(1.5px)'; x.globalAlpha = .5; x.globalCompositeOperation = 'lighter'; x.drawImage(t, 0, 0);   // readable letter core
    setHeight(c);
  };
  // The anchor's position is measured only when the page changes (refreshIslands, resize,
  // layout changes), stored relative to the document, and shifted by scrollY each frame.
  let islandDoc = null;
  const refreshIslands = () => {
    islandDoc = null;
    if (!C.islands) return;
    islandEl = document.querySelector(C.islands.anchor);
    if (!islandEl) return;
    const r = islandEl.getBoundingClientRect();
    if (r.width < 2) return;
    islandDoc = { x: r.left, y: r.top + scrollY, w: r.width, h: r.height };
    const key = `${Math.round(r.width)}x${Math.round(r.height)}`;
    if (key !== islandSize) { islandSize = key; drawIslands(r.width, r.height); }
  };
  const islandRect = (cw, ch) => {
    if (!islandDoc) return null;
    const top = islandDoc.y - scrollY;
    if (top + islandDoc.h < 0 || top > ch) return null;
    return [islandDoc.x / cw, 1 - (top + islandDoc.h) / ch, islandDoc.w / cw, islandDoc.h / ch];
  };
  const layoutObserver = new ResizeObserver(() => refreshIslands());
  layoutObserver.observe(document.body);
  if (document.fonts) document.fonts.ready.then(() => { if (alive) { islandSize = ''; refreshIslands(); } });

  // Render resolution: device pixel ratio (capped at 1.25) x quality, never above maxPixels.
  // The canvas is stretched back to full size by CSS; dither and grain hide the difference.
  let quality = C.resScale, dpr = 1, cw = 0, ch = 0;
  let W = 0, H = 0, sw = 0, sh2 = 0;
  const size = () => {
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.25 * (C.dprScale || 1)) * quality;
    dpr = Math.min(dpr, Math.sqrt(C.maxPixels / Math.max(1, cw * ch)));
    const nW = Math.max(2, Math.round(cw * dpr)), nH = Math.max(2, Math.round(ch * dpr));
    if (nW === W && nH === H) return; // e.g. phone address bar showing/hiding
    W = nW; H = nH;
    canvas.width = W; canvas.height = H; sw = Math.max(2, Math.round(W * C.scale)); sh2 = Math.max(2, Math.round(H * C.scale));
    gl.bindTexture(gl.TEXTURE_2D, sceneTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sw, sh2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (C.onResize) C.onResize(setHeight, cw, ch);
  };
  size();
  const onResize = () => { size(); refreshIslands(); };
  // fixed canvas: its rect is simply the viewport, no need to measure it
  const canvasRect = () => (C.fixed ? { left: 0, top: 0, width: cw, height: ch } : canvas.getBoundingClientRect());

  // cursor ripples: a ring buffer of trail points (CSS px, y up)
  const trail = new Float32Array(60); let ti = 0, last = [-999, -999];
  const t0 = performance.now(), now = () => (performance.now() - t0) / 1000;
  let lastRipple = -99, lastInput = -99;
  const addRipple = (x, y) => { if (reduce) return; lastRipple = now(); trail[ti * 3] = x; trail[ti * 3 + 1] = ch - y; trail[ti * 3 + 2] = lastRipple; ti = (ti + 1) % 20; };
  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  // mouse move / finger swipe: a ripple every 26px of movement
  const poke = (cx, cy, force) => {
    pointer.x = cx; pointer.y = cy; lastInput = now();
    const r = canvasRect(), x = cx - r.left, y = cy - r.top;
    if (force || Math.hypot(x - last[0], y - last[1]) > 26) { addRipple(x, y); last = [x, y]; }
  };
  const onMove = (e) => poke(e.clientX, e.clientY);
  const onDown = (e) => poke(e.clientX, e.clientY, true);
  // once the browser takes over a swipe for scrolling, pointer events stop; touch events don't
  const onTouch = (e) => { for (const t of e.touches) poke(t.clientX, t.clientY); };
  // scrolling (wheel, or momentum after the finger lifts): ripples where the pointer/finger last was
  let lastScroll = scrollY, lastScrollT = 0;
  const onScroll = () => {
    const t = performance.now();
    if (Math.abs(scrollY - lastScroll) > C.scrollStep && t - lastScrollT > 60) {
      lastScroll = scrollY; lastScrollT = t;
      const jitter = (Math.random() - 0.5) * 40; // spread the rings a little so they don't stack
      poke(pointer.x + jitter, pointer.y, true);
    }
  };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onDown, { passive: true });
  addEventListener('touchmove', onTouch, { passive: true });
  if (C.scrollRipples) addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize);

  // uniform locations, looked up once
  const cache1 = {}, cache2 = {};
  const U1 = (n) => (n in cache1 ? cache1[n] : (cache1[n] = gl.getUniformLocation(P1, n)));
  const U2 = (n) => (n in cache2 ? cache2[n] : (cache2[n] = gl.getUniformLocation(P2, n)));
  const mouse = [0.5, 0.5];
  let maxScroll = 1;
  const render = () => {
    const r = canvasRect();
    const tx = clamp((pointer.x - r.left) / r.width, 0, 1), ty = 1 - clamp((pointer.y - r.top) / r.height, 0, 1);
    const k = reduce ? 1 : 0.035; mouse[0] += (tx - mouse[0]) * k; mouse[1] += (ty - mouse[1]) * k;
    const t = reduce ? 6 : now();
    gl.useProgram(P1); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, sw, sh2);
    gl.uniform2f(U1('u_res'), sw, sh2); gl.uniform2f(U1('u_mouse'), mouse[0], mouse[1]); gl.uniform1f(U1('u_time'), t);
    gl.uniform1f(U1('u_scroll'), scrollY / maxScroll); gl.uniform1f(U1('u_hover'), reduce ? 0 : C.hover);
    const ir = C.mode === 'gradient' ? islandRect(cw, ch) : null;
    gl.uniform1f(U1('u_island'), ir ? C.islands.amount ?? .3 : 0); gl.uniform1f(U1('u_islandWarm'), ir ? C.islands.warmth ?? .15 : 0);
    if (ir) gl.uniform4f(U1('u_rect'), ir[0], ir[1], ir[2], ir[3]);
    gl.uniform2f(U1('u_center'), C.center[0], C.center[1]); gl.uniform1f(U1('u_zoom'), C.zoom);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, heightTex || blankTex); gl.uniform1i(U1('u_height'), 2);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.useProgram(P2); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneTex); gl.uniform1i(U2('u_scene'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, atlasTex); gl.uniform1i(U2('u_atlas'), 1);
    gl.uniform2f(U2('u_res'), W, H); gl.uniform1f(U2('u_time'), t); gl.uniform1f(U2('u_dpr'), dpr);
    gl.uniform3fv(U2('u_trail'), trail); gl.uniform1f(U2('u_active'), t - lastRipple < 4.6 ? 1 : 0);
    const p = C.palette.map(toRGB); gl.uniform3fv(U2('u_c0'), p[0]); gl.uniform3fv(U2('u_c1'), p[1]); gl.uniform3fv(U2('u_c2'), p[2]); gl.uniform3fv(U2('u_c3'), p[3]);
    gl.uniform3fv(U2('u_gcol'), toRGB(C.glyphCol)); gl.uniform3fv(U2('u_mark'), toRGB(C.mark));
    gl.uniform3fv(U2('u_warm0'), toRGB(C.warm[0])); gl.uniform3fv(U2('u_warm1'), toRGB(C.warm[1])); gl.uniform1f(U2('u_warmAmt'), C.warmAmt);
    const f1 = { u_glyph: C.glyph, u_glyphWave: C.glyphWave, u_cell: C.cell, u_rate: C.rate, u_dither: C.dither, u_levels: C.levels, u_dcell: C.ditherCell, u_contour: C.contour, u_cN: C.contourN,
      u_plus: C.plus, u_grain: C.grain, u_glow: C.glow, u_refract: C.refract, u_shade: C.shadeMix, u_gstart: C.gStart, u_gcount: C.gCount, u_vig: C.vignette, u_wamp: C.wamp };
    for (const n in f1) gl.uniform1f(U2(n), f1[n]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Frame pacing: full fps while ripples run or the pointer moves, fpsIdle otherwise.
  // Adaptive: if full-speed frames keep arriving late, lower the resolution step by step.
  let lastFrame = 0, slow = 0, frames = 0;
  const measureScroll = () => { maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  const scrollObserver = new ResizeObserver(measureScroll); scrollObserver.observe(document.body);
  const stopFrames = onFrame((ts) => {
    if (document.hidden) return;
    const busy = !reduce && (now() - lastRipple < 4.6 || now() - lastInput < 1.5);
    const fps = busy ? C.fpsMax : C.fpsIdle;
    const dt = ts - lastFrame;
    if (dt < 1000 / fps - 2) return;
    if (C.adaptive && busy && lastFrame && dt < 250) {
      frames++; if (dt > 1000 / Math.min(C.fpsMax, 45)) slow++;
      if (frames >= 90) {
        if (slow > 45 && quality > C.minScale) { quality = Math.max(C.minScale, quality * 0.8); size(); }
        frames = slow = 0;
      }
    }
    lastFrame = ts;
    render();
  });

  return {
    C,
    addRipple,
    refreshIslands,
    set: (k, v) => (C[k] = v),
    destroy() {
      alive = false;
      stopFrames();
      layoutObserver.disconnect(); scrollObserver.disconnect();
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      removeEventListener('touchmove', onTouch);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize);
      gl.deleteProgram(P1); gl.deleteProgram(P2); shaders.forEach((s) => gl.deleteShader(s));
      textures.forEach((t) => gl.deleteTexture(t)); gl.deleteFramebuffer(fbo); gl.deleteBuffer(buf);
    },
  };
}
