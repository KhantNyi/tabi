'use strict';
// ---------- core drawing helpers (everything is drawn in code, no image files) ----------
let W = 320, H = 180; const GY = 152; // view size in world units (fit() resizes it to the screen) and the side-view ground line

const S = 2; // device pixels per world unit: all art is drawn on a half-unit grid
function mk(w, h) {
  const c = document.createElement('canvas');
  c.lw = Math.max(1, Math.ceil(w)); c.lh = Math.max(1, Math.ceil(h));
  c.width = c.lw * S; c.height = c.lh * S;
  c.g = c.getContext('2d'); c.g.imageSmoothingEnabled = false; c.g.scale(S, S);
  return c;
}
// canvases made by mk() are S times larger than their world size, so draw them back at world size
const _di = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function (img, a, b, c, d, e, f, g, h) {
  if (img.lw === undefined) return _di.apply(this, arguments);
  const n = arguments.length;
  if (n === 3) return _di.call(this, img, a, b, img.lw, img.lh);
  if (n === 5) return _di.call(this, img, a, b, c, d);
  return _di.call(this, img, a * S, b * S, c * S, d * S, e, f, g, h);
};
const snap = v => Math.round(v * S) / S;
function RNG(s) {
  return function () {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(snap(x), snap(y), snap(w), snap(h)); }
function P(g, x, y, c) { g.fillStyle = c; g.fillRect(snap(x), snap(y), 1, 1); }
function p1(g, x, y, c) { g.fillStyle = c; g.fillRect(snap(x), snap(y), 1 / S, 1 / S); } // one device pixel
function disc(g, cx, cy, r, c) {
  g.fillStyle = c; const X = Math.round(cx * S), Y = Math.round(cy * S), rr = r * S, m = Math.ceil(rr);
  for (let y = -m; y <= m; y++) {
    const d = rr * rr - y * y; if (d < 0) continue;
    const w = Math.round(Math.sqrt(d));
    g.fillRect((X - w) / S, (Y + y) / S, (2 * w + 1) / S, 1 / S);
  }
}
function ell(g, cx, cy, rx, ry, c) {
  g.fillStyle = c; const X = Math.round(cx * S), Y = Math.round(cy * S), ax = rx * S, ay = ry * S || 1, m = Math.ceil(ay);
  for (let y = -m; y <= m; y++) {
    const d = 1 - (y * y) / (ay * ay); if (d < 0) continue;
    const w = Math.round(ax * Math.sqrt(d));
    g.fillRect((X - w) / S, (Y + y) / S, (2 * w + 1) / S, 1 / S);
  }
}
function _line(g, x0, y0, x1, y1, c, k) { // k = pixel size in world units
  x0 = Math.round(x0 / k); y0 = Math.round(y0 / k); x1 = Math.round(x1 / k); y1 = Math.round(y1 / k);
  g.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (let n = 0; n < 4000; n++) {
    g.fillRect(x0 * k, y0 * k, k, k);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
function line(g, x0, y0, x1, y1, c) { _line(g, x0, y0, x1, y1, c, 1); }       // chunky
function line1(g, x0, y0, x1, y1, c) { _line(g, x0, y0, x1, y1, c, 1 / S); }  // hairline
// hanging wire between two points
function wire(g, x0, y0, x1, y1, sag, c) {
  let px = x0, py = y0;
  const n = Math.max(4, Math.abs(x1 - x0) / 6 | 0);
  for (let i = 1; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag;
    line1(g, px, py, x, y, c); px = x; py = y;
  }
}

// ---------- colour ----------
function hex(c) {
  c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function rgb(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = hex(a), B = hex(b); return rgb(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function dark(c, t = 0.3) { return mix(c, '#1a1030', t); }   // shadows lean purple
function lite(c, t = 0.3) { return mix(c, '#fff3d0', t); }   // highlights lean warm

// ---------- dithered vertical gradient ----------
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function dgrad(g, x, y, w, h, cols) {
  const hh = Math.round(h * S), p = document.createElement('canvas'), n = cols.length - 1; p.width = 4; p.height = hh;
  const pg = p.getContext('2d');
  for (let j = 0; j < hh; j++) {
    const t = j / (hh - 1 || 1) * n; const i = Math.min(n - 1, Math.floor(t));
    const f = Math.max(0, Math.min(1, (t - i - 0.2) / 0.6));
    for (let k = 0; k < 4; k++) { const th = (BAY[(j & 3) * 4 + k] + 0.5) / 16; pg.fillStyle = f > th ? cols[i + 1] : cols[i]; pg.fillRect(k, j, 1, 1); }
  }
  g.save(); g.translate(snap(x), snap(y)); g.scale(1 / S, 1 / S); g.fillStyle = g.createPattern(p, 'repeat'); g.fillRect(0, 0, w * S, hh); g.restore();
}

// ---------- sprite post-processing ----------
function outline(c, col = '#2b1b2e') { // hairline outline; result is 1 world unit larger on every side
  const o = mk(c.lw + 2, c.lh + 2), g = o.g, w = c.width, h = c.height;
  const d = c.g.getImageData(0, 0, w, h).data;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = col;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 0) { g.fillRect(x + S - 1, y + S, 3, 1); g.fillRect(x + S, y + S - 1, 1, 3); }
  }
  _di.call(g, c, S, S); g.restore(); return o;
}
function flip(c) { const o = mk(c.lw, c.lh); o.g.translate(c.lw, 0); o.g.scale(-1, 1); o.g.drawImage(c, 0, 0); return o; }
function tint(c, col, a = 1) { // overlay a colour on the opaque pixels (a=1 gives a silhouette)
  const o = mk(c.lw, c.lh), g = o.g; g.drawImage(c, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, c.lw, c.lh);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; return o;
}
// draw something on a scratch canvas, tint it, then stamp it onto g (for hazy background layers)
function hazy(g, w, h, x, y, col, a, fn) { const c = mk(w, h); fn(c.g); g.drawImage(tint(c, col, a), Math.round(x), Math.round(y)); }

// stepped pixel glow, drawn additively
const _glow = {};
function glowSpr(r, col) {
  const k = r + col; if (_glow[k]) return _glow[k];
  const c = mk(r * 2 + 1, r * 2 + 1), g = c.g;
  for (const [a, k] of [[0.06, 1], [0.07, 0.82], [0.08, 0.64], [0.09, 0.47], [0.10, 0.31], [0.10, 0.16]]) { g.globalAlpha = a; disc(g, r, r, r * k, col); }
  return _glow[k] = c;
}

// ---------- tiny pixel font (5px tall, caps) ----------
const FONT = {};
(function () {
  const d = {
    A: '.#./#.#/###/#.#/#.#', B: '##./#.#/##./#.#/##.', C: '.##/#../#../#../.##', D: '##./#.#/#.#/#.#/##.',
    E: '###/#../##./#../###', F: '###/#../##./#../#..', G: '.##/#../#.#/#.#/.##', H: '#.#/#.#/###/#.#/#.#',
    I: '###/.#./.#./.#./###', J: '..#/..#/..#/#.#/.#.', K: '#.#/#.#/##./#.#/#.#', L: '#../#../#../#../###',
    M: '#...#/##.##/#.#.#/#...#/#...#', N: '#..#/##.#/#.##/#..#/#..#', O: '.#./#.#/#.#/#.#/.#.', P: '##./#.#/##./#../#..',
    Q: '.##./#..#/#..#/#.#./.#.#', R: '##./#.#/##./#.#/#.#', S: '.##/#../.#./..#/##.', T: '###/.#./.#./.#./.#.',
    U: '#.#/#.#/#.#/#.#/###', V: '#.#/#.#/#.#/#.#/.#.', W: '#...#/#...#/#.#.#/##.##/#...#', X: '#.#/#.#/.#./#.#/#.#',
    Y: '#.#/#.#/.#./.#./.#.', Z: '###/..#/.#./#../###',
    0: '###/#.#/#.#/#.#/###', 1: '.#./##./.#./.#./###', 2: '##./..#/.#./#../###', 3: '##./..#/.#./..#/##.',
    4: '#.#/#.#/###/..#/..#', 5: '###/#../##./..#/##.', 6: '.##/#../###/#.#/###', 7: '###/..#/.#./.#./.#.',
    8: '###/#.#/###/#.#/###', 9: '###/#.#/###/..#/##.',
    '.': './././.#'.replace('#', '/#').slice(0, 9), ',': '../../../.#/#.', '!': '#/#/#/./#', '?': '##./..#/.#./.../.#.',
    "'": '#/#/././.', '-': '.../.../###/.../...', ':': './#/./#/.', '/': '..#/..#/.#./#../#..',
    '(': '.#/#./#./#./.#', ')': '#./.#/.#/.#/#.', '+': '.../.#./###/.#./...', '>': '#../.#./..#/.#./#..',
    '<': '..#/.#./#../.#./..#', '&': '.#../#.#./.#../#.#./.#.#', '*': '.#.#./#####/#####/.###./..#..', '~': '..../.#.#/#.#./..../....'
  };
  d['.'] = './././.' + '/#'; d['.'] = ['.', '.', '.', '.', '#'].join('/');
  for (const k in d) { const rows = d[k].split('/'); FONT[k] = { w: rows[0].length, rows, hi: epxGrid((x, y) => rows[y] && rows[y][x] === '#' ? 1 : 0, rows[0].length, 5) }; }
})();
function tw(s, sc = 1) { s = String(s).toUpperCase(); let w = 0; for (const ch of s) { const f = FONT[ch]; w += (f ? f.w : 2) + 1; } return Math.max(0, w - 1) * sc; }
function _txt(g, s, x, y, col, sc) {
  g.fillStyle = col;
  for (const ch of s) {
    const f = FONT[ch]; if (!f) { x += 3 * sc; continue; }
    const h2 = sc / 2; for (let j = 0; j < 10; j++) { const r = f.hi[j]; for (let i = 0; i < f.w * 2; i++) if (r[i]) g.fillRect(x + i * h2, y + j * h2, h2, h2); }
    x += (f.w + 1) * sc;
  }
}
// Text on the main screen is drawn once into a small sprite and reused, since the bitmap font costs one fillRect per pixel.
const _TC = new Map();
function _tspr(key, w, h, fn) { let c = _TC.get(key); if (c) return c; if (_TC.size > 600) _TC.clear(); c = mk(Math.max(1, w), Math.max(1, h)); fn(c.g); _TC.set(key, c); return c; }
const _onScreen = g => typeof ctx !== 'undefined' && g === ctx;
function txt(g, s, x, y, col, sh, sc = 1) {
  s = String(s).toUpperCase(); x = Math.round(x); y = Math.round(y); if (!s) return;
  if (!_onScreen(g)) { if (sh) _txt(g, s, x + sc, y + sc, sh, sc); _txt(g, s, x, y, col, sc); return; }
  g.drawImage(_tspr(s + '|' + col + '|' + (sh || '') + '|' + sc, tw(s, sc) + (sh ? sc : 0), 5 * sc + (sh ? sc : 0), t => { if (sh) _txt(t, s, sc, sc, sh, sc); _txt(t, s, 0, 0, col, sc); }), x, y);
}
function txtC(g, s, cx, y, col, sh, sc = 1) { txt(g, s, cx - tw(s, sc) / 2, y, col, sh, sc); }
function txtO(g, s, cx, y, col, oc, sc = 1) { // centred with full outline
  s = String(s).toUpperCase(); const x = Math.round(cx - tw(s, sc) / 2);
  const o = sc > 2 ? 2 : 1, OFF = [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1], [0, 2], [1, 2], [-1, 2]];
  const draw = (t, x0, y0) => { for (const [a, b] of OFF) _txt(t, s, x0 + a * o, y0 + b * o, oc, sc); _txt(t, s, x0, y0, col, sc); };
  if (!_onScreen(g)) { draw(g, x, y); return; }
  g.drawImage(_tspr('O' + s + '|' + col + '|' + oc + '|' + sc, tw(s, sc) + 2 * o, 5 * sc + 3 * o, t => draw(t, o, o)), x - o, Math.round(y) - o);
}
function wrap(s, maxw) {
  const out = []; let cur = '';
  for (const w of String(s).split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (tw(t) > maxw && cur) { out.push(cur); cur = w; } else cur = t;
  }
  if (cur) out.push(cur); return out;
}

// scale2x: doubles a pixel grid while rounding off stair-steps
function epxGrid(src, w, h) {
  const out = [];
  for (let y = 0; y < h; y++) {
    const a = [], b = [];
    for (let x = 0; x < w; x++) {
      const P = src(x, y), A = src(x, y - 1), B = src(x + 1, y), C = src(x - 1, y), D = src(x, y + 1);
      a.push(C === A && C !== D && A !== B ? A : P, A === B && A !== C && B !== D ? B : P);
      b.push(D === C && D !== B && C !== A ? C : P, B === D && B !== A && D !== C ? D : P);
    }
    out.push(a, b);
  }
  return out;
}
function epx(c) { // smooth a sprite that was drawn on the coarse 1-unit grid
  const w = c.lw, h = c.lh, d = new Uint32Array(c.g.getImageData(0, 0, c.width, c.height).data.buffer);
  const grid = epxGrid((x, y) => x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * S + 1) * c.width + x * S + 1], w, h);
  const o = mk(w, h), im = o.g.createImageData(w * 2, h * 2), q = new Uint32Array(im.data.buffer);
  for (let y = 0; y < h * 2; y++) for (let x = 0; x < w * 2; x++) q[y * w * 2 + x] = grid[y][x];
  o.g.putImageData(im, 0, 0); return o;
}
