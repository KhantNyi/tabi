'use strict';
// ---------- world: building a top-down map, its ground, buildings, rooms and furniture ----------
const T = 16, GR = 0, DT = 1, PV = 2, WA = 3, VL = 4, FR = 5, AS = 6, PL = 7, HARD = [0, 0, 1, 0, 1, 0, 1, 1];
const MAPS = {}, BUILT = {}, SPR = {}, LOOKS = {}, CITIES = {}; // MAPS holds every district and room of every city, so map ids must be unique
let M = null; // the map being built or walked
// ---------- hooks for playing together (src/net/net.js) ----------
// OTHERS: friends' avatars ({ id, name, col, F, map, x, y, dir, mv, wt, ph, act, alpha, say, sayT }); drawWorld draws the
// ones on your map. on()/emit(): moments worth telling friends about ('act', 'photo', 'ride', 'arrived', 'gift', 'say').
// worldTime(): a clock every player agrees on (the wall clock), for things that must match on everyone's screen.
const OTHERS = [], BUS = {};
function on(k, fn) { (BUS[k] = BUS[k] || []).push(fn); }
function emit(k, d) { for (const fn of BUS[k] || []) fn(d); }
function worldTime() { return Date.now() / 1000; }
function newMap(id, tw_, th, indoor) { const w = tw_ * T, h = th * T; return M = { id, w, h, GW: w / 8, GH: h / 8, SW: w / 4, SH: h / 4, TER: new Uint8Array(w * h / 64), SOL: new Uint8Array(w * h / 16), OBJ: [], SHD: [], ACT: [], SPOTS: [], LIGHTS: [], CARS: [], indoor, ground: mk(w, h) }; }
function tset(i, j, t, only) { if (i < 0 || j < 0 || i >= M.GW || j >= M.GH) return; const k = j * M.GW + i; if (only != null && M.TER[k] !== only) return; M.TER[k] = t; }
function tRect(t, x0, y0, x1, y1, only) { for (let j = Math.round(y0 * 2); j < Math.round(y1 * 2); j++) for (let i = Math.round(x0 * 2); i < Math.round(x1 * 2); i++) tset(i, j, t, only); }
function tOval(t, cx, cy, rx, ry) { for (let j = 0; j < M.GH; j++) for (let i = 0; i < M.GW; i++) { const x = (i + 0.5) / 2 - cx, y = (j + 0.5) / 2 - cy; if (x * x / (rx * rx) + y * y / (ry * ry) < 1) tset(i, j, t); } }
function tRoad(t, pts, w, only) {
  for (let j = 0; j < M.GH; j++) for (let i = 0; i < M.GW; i++) {
    const px = (i + 0.5) / 2, py = (j + 0.5) / 2; let best = 1e9;
    for (let k = 1; k < pts.length; k++) { const [ax, ay] = pts[k - 1], [bx, by] = pts[k], dx = bx - ax, dy = by - ay, q = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1))); best = Math.min(best, Math.hypot(px - ax - dx * q, py - ay - dy * q)); }
    if (best < w) tset(i, j, t, only);
  }
}
function block(x0, y0, x1, y1, v = 1) { for (let j = Math.max(0, Math.floor(y0 / 4)); j <= Math.min(M.SH - 1, Math.floor((y1 - 0.01) / 4)); j++) for (let i = Math.max(0, Math.floor(x0 / 4)); i <= Math.min(M.SW - 1, Math.floor((x1 - 0.01) / 4)); i++) M.SOL[j * M.SW + i] = v; }
function solidAt(x, y) { const i = Math.floor(x / 4), j = Math.floor(y / 4); return i < 0 || j < 0 || i >= M.SW || j >= M.SH || M.SOL[j * M.SW + i] === 1; }
function hit(x, y) { for (let j = Math.floor((y - 4) / 4); j <= Math.floor((y - 0.1) / 4); j++) for (let i = Math.floor((x - 4) / 4); i <= Math.floor((x + 3.9) / 4); i++) if (i < 0 || j < 0 || i >= M.SW || j >= M.SH || M.SOL[j * M.SW + i]) return true; return false; }
function terr(x, y) { if (!M.TY) return PV; const X = Math.round(x * S), Y = Math.round(y * S); return X < 0 || Y < 0 || X >= M.DW || Y >= M.DH ? 255 : M.TY[Y * M.DW + X]; }

// ---------- ground painter ----------
function paintGround() {
  const c = M.ground, DW = M.DW = c.width, DH = M.DH = c.height, ty = M.TY = new Uint8Array(DW * DH), acc = new Float32Array(8), GW = M.GW, GH = M.GH, TER = M.TER;
  const cell = (i, j) => TER[Math.max(0, Math.min(GH - 1, j)) * GW + Math.max(0, Math.min(GW - 1, i))];
  const look = (wx, wy) => { const u = wx / 8 - 0.5, v = wy / 8 - 0.5, i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j; acc.fill(0); acc[cell(i, j)] += (1 - fu) * (1 - fv); acc[cell(i + 1, j)] += fu * (1 - fv); acc[cell(i, j + 1)] += (1 - fu) * fv; acc[cell(i + 1, j + 1)] += fu * fv; let b = 0; for (let k = 1; k < 8; k++) if (acc[k] > acc[b]) b = k; return b; };
  for (let Y = 0; Y < DH; Y++) for (let X = 0; X < DW; X++) { const wx = X / S, wy = Y / S; let t = cell(Math.floor(wx / 8), Math.floor(wy / 8)); if (!HARD[t]) { t = look(wx, wy); if (!HARD[t]) { const t2 = look(wx + (vn(X / 22, Y / 22) - 0.5) * 7, wy + (vn(X / 22 + 31, Y / 22 + 17) - 0.5) * 7); if (!HARD[t2]) t = t2; } else t = cell(Math.floor(wx / 8), Math.floor(wy / 8)); } ty[Y * DW + X] = t; }
  const im = c.g.createImageData(DW, DH), px = new Uint32Array(im.data.buffer), at = (X, Y) => ty[Math.max(0, Math.min(DH - 1, Y)) * DW + Math.max(0, Math.min(DW - 1, X))], C = a => a.map(c32);
  const PG = C(['#55a04c', '#64b054', '#74bf5e', '#3c8440', '#8fd070']), PFR = C(['#3d7f48', '#488c4c', '#559a52', '#2c6238', '#6aac5a']), PD = C(['#d0aa72', '#dab87e', '#e4c68e', '#a88454', '#b89662', '#f0d8a4']);
  const PP = C(['#b6b0be', '#c2bcc9', '#aaa5b6', '#8a8496', '#d4cfda', '#77718a']), PVL = C(['#e6dec8', '#d4cab0', '#f4eedc', '#a8a0a8', '#c8beaa']), PW = C(['#3e92c2', '#4aa0ce', '#58aed8', '#2d76a6', '#4a3626', '#7a5c44', '#8c6c50', '#a6dcee']);
  const PA = C(['#4b4b5c', '#525264', '#454556', '#c8c2d2', '#3c3c4c']), PL_ = C(['#dcd4c8', '#cfc6b8', '#b4aa9c', '#eee8dc', '#8a8496']);
  const isG = t => t === GR || t === FR;
  for (let Y = 0; Y < DH; Y++) for (let X = 0; X < DW; X++) {
    const i = Y * DW + X, t = ty[i], h = hsh(X, Y); let col;
    if (isG(t)) {
      const pal = t === GR ? PG : PFR, n = vn(X / 26, Y / 26) * 0.7 + vn(X / 7, Y / 7) * 0.3 + (h - 0.5) * 0.1; col = pal[n < 0.43 ? 0 : n < 0.6 ? 1 : 2];
      if (hsh(X >> 1, (Y >> 2) + 7) < 0.03) col = pal[(X >> 1) % 3 ? 4 : 3];
      let e = 0; for (let d = 1; d <= 2 && !e; d++) { const a = at(X + d, Y), b = at(X - d, Y), cc = at(X, Y + d), dd = at(X, Y - d); if ((!isG(a) && a !== WA) || (!isG(b) && b !== WA) || (!isG(cc) && cc !== WA) || (!isG(dd) && dd !== WA)) e = 1; } if (e) col = pal[3];
    } else if (t === DT) { const n = vn(X / 20, Y / 20) + (h - 0.5) * 0.15; col = PD[n < 0.4 ? 0 : n < 0.68 ? 1 : 2]; if (h < 0.014) col = PD[4]; else if (h > 0.988) col = PD[5]; if (isG(at(X, Y - 2)) || isG(at(X, Y - 4))) col = PD[3]; }
    else if (t === PV) { const row = Y >> 4, xo = X + (row & 1) * 16, k = hsh(xo >> 5, row); col = PP[k < 0.4 ? 0 : k < 0.72 ? 1 : 2]; if ((Y & 15) === 0 || (xo & 31) === 0) col = PP[3]; else if ((Y & 15) === 1 || (xo & 31) === 1) col = PP[4]; else if (h < 0.02) col = PP[3]; const a = at(X, Y - 2), b = at(X, Y + 2), cc = at(X - 2, Y), dd = at(X + 2, Y); if ((a !== PV && a !== AS) || (b !== PV && b !== AS) || (cc !== PV && cc !== AS) || (dd !== PV && dd !== AS)) col = PP[5]; else if (a === AS || b === AS || cc === AS || dd === AS || at(X, Y + 4) === AS) col = PP[4]; }
    else if (t === VL) { col = PVL[h < 0.13 ? 1 : h > 0.86 ? 2 : 0]; if ((Y + Math.round(Math.sin(X / 26) * 3)) % 10 === 0) col = PVL[4]; if (at(X, Y - 3) !== VL || at(X, Y + 3) !== VL || at(X - 3, Y) !== VL || at(X + 3, Y) !== VL) col = PVL[3]; }
    else if (t === AS) { const n = vn(X / 30, Y / 30); col = PA[h < 0.06 ? 4 : n < 0.45 ? 0 : n < 0.7 ? 1 : 2]; if (h > 0.985) col = PA[1]; if (at(X, Y - 3) !== AS) col = PA[4]; }
    else if (t === PL) { const k = ((X >> 4) + (Y >> 4)) & 1; col = PL_[k]; if ((X & 15) === 0 || (Y & 15) === 0) col = PL_[2]; else if ((X & 15) === 1 || (Y & 15) === 1) col = PL_[3]; if (at(X, Y - 2) !== PL || at(X, Y + 2) !== PL || at(X - 2, Y) !== PL || at(X + 2, Y) !== PL) col = PL_[4]; }
    else { let k = 0; for (let d = 1; d <= 12; d++) if (at(X, Y - d) !== WA) { k = d; break; } const n = vn(X / 34, Y / 12) + (h - 0.5) * 0.06; if (k && k <= 2) col = PW[4]; else if (k && k <= 7) col = PW[h < 0.3 ? 6 : 5]; else if (k) col = PW[3]; else if (at(X - 2, Y) !== WA || at(X + 2, Y) !== WA || at(X, Y + 2) !== WA) col = PW[7]; else col = PW[n < 0.42 ? 0 : n < 0.62 ? 1 : 2]; }
    px[i] = col;
  }
  c.g.putImageData(im, 0, 0);
  const g = c.g, rnd = RNG(M.w + M.id.length), FL = ['#fff8e8', '#ffd84a', '#f9a8c8', '#b8a0f0', '#ff8a6a'];
  for (let n = 0; n < M.w * M.h / 110; n++) { const x = snap(rnd() * M.w), y = snap(rnd() * M.h), t = terr(x, y), q = rnd(); if (!isG(t) || !isG(terr(x + 3, y + 2)) || !isG(terr(x - 3, y - 2))) continue; if (q < 0.66) { R(g, x, y, U, 2, '#3c8440'); R(g, x + 1, y + U, U, 1.5, '#8fd070'); } else if (q < 0.86 && t === GR) { const col = FL[n % 5]; for (let k = 0; k < 3; k++) { const fx = x + (rnd() * 8 - 4), fy = y + (rnd() * 5 - 2); R(g, snap(fx) - U, fy, 1.5, 1, col); p1(g, fx, fy + U, '#ffe08a'); } } else { R(g, x, y, 2, 1, '#9a94a8'); R(g, x, y, 1.5, U, '#c8c0d4'); } }
}
// roads: [tileRow, tilesWide] for streets, [tileCol, tilesWide] for avenues
function roads(hs, vs) { M.hs = hs; M.vs = vs || []; for (const [y, n] of hs) tRect(AS, 0, y, M.w / T, y + n); for (const [x, n] of M.vs) tRect(AS, x, 0, x + n, M.h / T); }
function zebra(g, x, y, w, h, vert) { if (vert) for (let k = 2; k < w - 2; k += 6) { R(g, x + k, y, 3, h, '#e8e4f0'); R(g, x + k, y, 3, U, '#ffffff'); } else for (let k = 2; k < h - 2; k += 6) { R(g, x, y + k, w, 3, '#e8e4f0'); R(g, x, y + k, w, U, '#ffffff'); } }
function markRoads() {
  const g = M.ground.g; if (!M.hs) return;
  for (const [y, n] of M.hs) { const yy = y * T + n * 8; for (let x = 4; x < M.w; x += 14) if (!M.vs.some(([vx, vn_]) => x > vx * T - 16 && x < (vx + vn_) * T + 10)) R(g, x, yy - U, 7, 1, '#e8e4f0'); for (const [vx, vn_] of M.vs) { zebra(g, vx * T - 13, y * T + 1, 10, n * T - 2); zebra(g, (vx + vn_) * T + 3, y * T + 1, 10, n * T - 2); } }
  for (const [x, n] of M.vs) { const xx = x * T + n * 8; for (let y = 4; y < M.h; y += 14) if (!M.hs.some(([hy, hn]) => y > hy * T - 16 && y < (hy + hn) * T + 10)) R(g, xx - U, y, 1, 7, '#e8e4f0'); for (const [hy, hn] of M.hs) { zebra(g, x * T + 1, hy * T - 13, n * T - 2, 10, 1); zebra(g, x * T + 1, (hy + hn) * T + 3, n * T - 2, 10, 1); } }
}

// ---------- things ----------
function put(spr, x, y, ox, oy, o) { const e = Object.assign({ spr, x, y, ox, oy }, o || {}); M.OBJ.push(e); return e; }
function clearAt(x, y, rad) { for (let a = 0; a < 9; a++) { const px = a === 8 ? x : x + Math.cos(a * 0.7854) * rad, py = a === 8 ? y : y + Math.sin(a * 0.7854) * rad * 0.7, t = terr(px, py); if ((t !== GR && t !== FR) || solidAt(px, py)) return false; } return true; }
function variants(name, n, fn) { SPR[name] = []; for (let i = 0; i < n; i++) SPR[name].push(fn(RNG(name.length * 131 + i * 17 + 5), i)); }
const one = (name, w, h, fn, ol) => { const c = mk(w, h); fn(c.g); return SPR[name] = ol ? outline(c) : c; };
function plant(kind, x, y, force) {
  if (!force && !clearAt(x, y, 9)) return false;
  const v = SPR[kind], s = v[Math.floor(hsh(x * 3, y * 5) * v.length)];
  if (kind === 'bamboo') { put(s, x, y, 14, 72, { split: 48, sw: 0.9 }); M.SHD.push([x, y, 8, 2.5]); block(x - 3, y - 3, x + 3, y); }
  else if (kind === 'pine') { put(s, x, y, 32, 60, { split: 44, sw: 0.5 }); M.SHD.push([x, y, 13, 3.5]); block(x - 3, y - 4, x + 3, y); }
  else if (kind === 'bush' || kind === 'rock') { put(s, x, y, s.lw / 2, s.lh - 1); M.SHD.push([x, y, 8, 2]); block(x - 5, y - 4, x + 5, y); }
  else { put(s, x, y, 28, 60, { split: 46, sw: 0.6 }); M.SHD.push([x, y, 14, 4]); block(x - 3, y - 4, x + 3, y); }
  return true;
}
function prop(name, x, y, bw, o) {
  const s = SPR[name]; put(s, x, y, s.lw / 2, s.lh - 1, o); if (bw) block(x - bw, y - 5, x + bw, y); M.SHD.push([x, y, Math.min(s.lw / 2, bw || 6) + 2, 2]);
  // every vending machine sells drinks (see MG.vend), and glows on a night street
  if (VENDC[name]) { M.SPOTS.push({ x, y: y + 6, r: 12, label: 'BUY A DRINK', mini: 'vend', vc: VENDC[name] }); if (M.night) M.LIGHTS.push([x, y - 11, 15, '#cfeaff']); }
}
const VENDC = { vend: '#f4f1e6', vend2: '#e0563f', vend3: '#5aa8e0' };
function door(x, y, to, lab) { M.SPOTS.push({ x, y: y + 7, r: 13, label: lab || 'ENTER', door: to }); }
const TWC = ['#8a8aa8', '#a89a94', '#7a8a9a', '#9a8a7a', '#6a7a94', '#b0a8a0', '#8a7a8a'];
function tower(x, y, w, h, o = {}) {
  const c = mk(w + 20, h + 16), g = c.g, b = h + 14, rnd = RNG(x * 7 + y), col = o.c || TWC[(x + y) % TWC.length], shop = o.sign || o.to;
  bldg(g, 10, b, w, h, Object.assign({ lit: M.night ? 0.65 : 0.2, foot: shop ? 26 : 8 }, o, { c: col }), rnd);
  if (shop) {
    const gl = o.glow || '#cfeaff', sc = o.sc || '#e0563f', fr = dark(col, 0.5), mx = 10 + w / 2;
    R(g, 12, b - 20, w - 4, 20, fr); R(g, 13, b - 19, w - 6, 18, gl); R(g, 13, b - 19, w - 6, 4, lite(gl, 0.5)); for (let xx = 22; xx < w + 6; xx += 9) R(g, xx, b - 19, U, 18, fr);
    for (let xx = 15; xx < w + 4; xx += 4) if (Math.abs(xx - mx) > 8) { const hh = 5 + xx * 7 % 5; R(g, xx, b - 1 - hh, 2.5, hh, ['#e0563f', '#f2c14e', '#5aa8e0', '#f06a8c', '#5aa85a'][xx % 5]); }
    R(g, mx - 7, b - 17, 14, 17, fr); R(g, mx - 6, b - 16, 12, 16, lite(gl, 0.35)); R(g, mx - U / 2, b - 16, U, 16, fr); R(g, mx - 6, b - 1, 12, 1, '#8a8496');
    if (o.sign) { const sw = tw(o.sign) + 8, sx = Math.round(mx - sw / 2); R(g, sx - 1, b - 32, sw + 2, 11, '#1d1626'); R(g, sx, b - 31, sw, 9, sc); R(g, sx, b - 31, sw, U, lite(sc, 0.4)); txt(g, o.sign, sx + 4, b - 29, o.st || '#fff8e8'); }
  }
  if (o.vs) vsign(g, 10 + (o.vsx != null ? o.vsx : 2), b - h + 6, o.vs, o.vc || '#ff5a8a', '#1d1626', rnd);
  if (o.scr) { const [sx, sy, sw, sh] = o.scr; R(g, 9 + sx, b - h + sy - 1, sw + 2, sh + 2, '#1d1626'); dgrad(g, 10 + sx, b - h + sy, sw, sh, o.scrc || ['#5ad8f0', '#8a6aff', '#f06a8c']); disc(g, 10 + sx + sw * 0.5, b - h + sy + sh * 0.5, sh * 0.26, '#fff8e8'); }
  if (o.art) o.art(g, 10, b - h, b);
  put(c, x, y, 10 + w / 2, b); block(x - w / 2, y - 14, x + w / 2, y); M.SHD.push([x, y + 1, w / 2 + 3, 3]);
  if (o.to) door(x, y, o.to, o.lab); if (M.night && shop) M.LIGHTS.push([x, y - 10, 30, o.sc || '#ffd98a']);
}
function house(x, y, w, h, o) { const c = mk(w + 24, GY + 2); shopArt(c.g, 12, w, h, o, RNG(x + w)); put(c, x, y, 12 + w / 2, GY); block(x - w / 2, y - 13, x + w / 2, y); M.SHD.push([x, y + 1, w / 2 + 5, 3]); if (o.to) door(x, y, o.to, o.lab); if (M.night) M.LIGHTS.push([x, y - 10, 28, '#ffd98a']); }
// rows of anonymous buildings around a city map, so the edge never shows
function cityEdge(skipTop, depth = 34) {
  const rnd = RNG(M.w * 3 + M.id.length * 7);
  if (!skipTop) for (let x = 20; x < M.w + 10;) { const w = 34 + (rnd() * 4 | 0) * 8; if (!M.vs.some(([vx, n]) => x + w / 2 > vx * T - 6 && x - w / 2 < (vx + n) * T + 6)) tower(x, 58, w, 52 + (rnd() * 6 | 0) * 9, { top: true }); x += w + 4; }
  for (let x = 24; x < M.w + 10;) { const w = 40 + (rnd() * 4 | 0) * 8; tower(x, M.h + 62, w, 62 + (rnd() * 3 | 0) * 6); x += w + 3; }
  for (const x of [14, M.w - 14]) for (let y = 110; y < M.h; y += 46) if (!M.hs.some(([hy, n]) => y > hy * T - 2 && y - 16 < (hy + n) * T)) tower(x, y, 30, 50 + (rnd() * 4 | 0) * 8);
  block(0, 0, M.w, M.hs[0][0] * T - depth); block(0, M.h - 6, M.w, M.h); block(0, 0, 6, M.h); block(M.w - 6, 0, M.w, M.h);
}
function look(name, tint_) { const k = name + (tint_ || ''); return LOOKS[k] || (LOOKS[k] = makeLook(tint_ ? Object.assign({}, NPC_LOOKS[name], NPC_LOOKS[name].robe ? { robe: tint_ } : { shirt: tint_ }) : NPC_LOOKS[name])); }
function npc(name, x, y, o = {}) { const n = Object.assign({ F: look(name, o.tint), x, y, hx: x, hy: y, rad: 0, lines: ['...'], li: 0, dir: 'd', mv: false, wt: 0, ph: (x + y) % 7, wait: 0.5 + (x % 5) * 0.4, rnd: RNG(x * 3 + y), sayT: 0 }, o); M.ACT.push(n); return n; }
const WALK = ['salary', 'office', 'teen', 'kid', 'tourist', 'kimono', 'granny', 'yukata'], WCOL = [null, '#f06a8c', '#5aa8e0', '#f2c14e', '#8a6aff', '#5aa85a', '#e0563f', '#f4f1e6'];
function walker(i, ax, ay, bx, by) { M.ACT.push({ F: look(WALK[i % WALK.length], WCOL[(i * 3 + ax) % WCOL.length | 0]), x: ax + (bx - ax) * ((i * 37 % 100) / 100), y: ay + (by - ay) * ((i * 37 % 100) / 100), pa: [ax, ay], pb: [bx, by], to: i % 2, dir: 'd', mv: true, wt: i, ph: i, sp: 22 + i % 4 * 5, wait: 0, sayT: 0 }); }
function crowd(n, ax, ay, bx, by, jit) { for (let i = 0; i < n; i++) { const j = (hsh(i, ax + ay) - 0.5) * jit, v = Math.abs(bx - ax) < Math.abs(by - ay); walker(i + ax, ax + (v ? j : 0), ay + (v ? 0 : j), bx + (v ? j : 0), by + (v ? 0 : j)); } }
function cars(y, dir, n) { for (let i = 0; i < n; i++) M.CARS.push({ x: (i + hsh(y, i) * 0.6) * M.w / n, y, v: dir * (46 + hsh(i, y) * 20), k: Math.floor(hsh(y + i, 3) * SPR.car.length) }); }
// settle(): run once a map is dressed. Crowd walkers move in straight lines without looking, so each path is checked against
// walls, props and water: a blocked one slides sideways to a clear lane, or is cut short so the walker turns back before the
// obstacle, or is dropped if too little is left. Cats and wandering people that start somewhere blocked step to the nearest
// clear spot.
function settle() {
  const clear = (ax, ay, bx, by) => { const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 3)); for (let i = 0; i <= n; i++) if (hit(ax + (bx - ax) * i / n, ay + (by - ay) * i / n)) return false; return true; };
  const drop = [];
  for (const n of M.ACT) {
    if (n.pa) {
      const [ax, ay] = n.pa, [bx, by] = n.pb; if (clear(ax, ay, bx, by)) continue;
      const len = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / len, ny = (bx - ax) / len; let ok = false;
      for (const o of [3, -3, 6, -6, 9, -9, 12, -12, 16, -16, 20, -20, 24, -24]) if (clear(ax + nx * o, ay + ny * o, bx + nx * o, by + ny * o)) { n.pa = [ax + nx * o, ay + ny * o]; n.pb = [bx + nx * o, by + ny * o]; n.x += nx * o; n.y += ny * o; ok = true; break; }
      if (ok) continue;
      // keep the clear stretch around where the walker is (or the longest clear stretch)
      const N = Math.ceil(len / 3), at = i => [ax + (bx - ax) * i / N, ay + (by - ay) * i / N], free = i => !hit(...at(i));
      let best = null, s = -1; for (let i = 0; i <= N + 1; i++) { if (i <= N && free(i)) { if (s < 0) s = i; } else if (s >= 0) { if (!best || i - 1 - s > best[1] - best[0]) best = [s, i - 1]; s = -1; } }
      if (!best || (best[1] - best[0]) * 3 < 40) { drop.push(n); continue; }
      n.pa = at(best[0] + 1); n.pb = at(best[1] - 1); const t = Math.max(0, Math.min(1, hsh(n.x, n.y))); n.x = n.pa[0] + (n.pb[0] - n.pa[0]) * t; n.y = n.pa[1] + (n.pb[1] - n.pa[1]) * t;
    } else if ((n.cat || n.rad) && hit(n.x, n.y)) {
      search: for (let r = 4; r <= 64; r += 4) for (let a = 0; a < 16; a++) { const x = n.x + Math.cos(a * 0.3927) * r, y = n.y + Math.sin(a * 0.3927) * r * 0.8; if (!hit(x, y) && terr(x, y) !== WA) { n.x = x; n.y = y; if (n.rad) { n.hx = x; n.hy = y; } break search; } }
    }
  }
  if (drop.length) M.ACT = M.ACT.filter(n => !drop.includes(n));
}
function stampSpot(id, x, y, verb, act, lines, r, o) { M.SPOTS.push(Object.assign({ x, y, r: r || 15, label: verb, stamp: id, act, lines }, o)); } // o.frame: what a photo shows
function station(x, y, name) { tower(x, y, 92, 44, { c: '#e8e0d0', sign: name + ' STATION', sc: '#3f9a5a', wc: '#bfe8ff', gx: 7, ww: 4 }); M.SPOTS.push({ x, y: y + 7, r: 14, label: 'TRAINS', train: 1 }); M.st = [x, y + 12]; }

// ---------- rooms ----------
function room(o) {
  const g = M.ground.g, wl = o.wall || '#e8dcc0', f = o.floor || 'wood', rnd = RNG(M.id.length * 9 + 1);
  R(g, 0, 0, 320, 192, '#15101f'); R(g, 8, 4, 304, 44, wl); R(g, 8, 4, 304, 2, lite(wl, 0.35)); R(g, 8, 32, 304, 16, dark(wl, 0.16)); R(g, 8, 32, 304, U, dark(wl, 0.4)); R(g, 8, 46, 304, 2, dark(wl, 0.5));
  if (f === 'wood') { R(g, 8, 48, 304, 138, '#c89a6a'); for (let y = 48; y < 186; y += 8) { R(g, 8, y, 304, U, '#a47a50'); R(g, 8, y + U, 304, U, '#dcb080'); for (let x = 8 + (y * 5 % 37); x < 312; x += 44) R(g, x, y, U, 8, '#a47a50'); } }
  else if (f === 'tile') { for (let y = 48; y < 186; y += 12) for (let x = 8; x < 312; x += 12) { const k = ((x - 8) / 12 + (y - 48) / 12) & 1; R(g, x, y, 12, 12, k ? (o.t1 || '#e8e4ec') : (o.t2 || '#cfc8d8')); R(g, x, y, 12, U, '#f8f6fc'); } }
  else if (f === 'tatami') { for (let y = 48; y < 186; y += 23) for (let x = 8 + ((y - 48) / 23 & 1) * 22; x < 312; x += 44) { R(g, x, y, 44, 23, '#b8c078'); R(g, x, y, 44, 1, '#5a7a48'); R(g, x, y, 1, 23, '#5a7a48'); for (let k = 2; k < 44; k += 2) R(g, x + k, y + 1, U, 22, '#a8b068'); } R(g, 8, 48, 22, 138, '#b8c078'); }
  else { R(g, 8, 48, 304, 138, o.carpet || '#a83a48'); for (let y = 54; y < 186; y += 10) for (let x = 14 + (y / 10 & 1) * 5; x < 312; x += 10) { R(g, x, y, 1, 1, lite(o.carpet || '#a83a48', 0.25)); } }
  R(g, 8, 48, 304, 3, 'rgba(20,10,30,0.25)'); R(g, 146, 184, 28, 8, '#5a3a28'); R(g, 148, 178, 24, 10, o.mat || '#3f7a5a'); R(g, 148, 178, 24, 1, lite(o.mat || '#3f7a5a', 0.3)); txt(g, 'EXIT', 153, 181, '#fff8e8');
  if (o.art) o.art(g, rnd);
  block(0, 0, 320, 50); block(0, 0, 8, 192); block(312, 0, 320, 192); block(0, 186, 148, 192); block(172, 186, 320, 192);
}
function wallShelf(g, x, w, cols, rnd) { R(g, x, 8, w, 36, '#6a4638'); R(g, x + 1, 9, w - 2, 34, '#3a2630'); for (let r = 0; r < 3; r++) { R(g, x, 19 + r * 11, w, 1.5, '#8a5a3a'); for (let xx = x + 2; xx < x + w - 3; xx += 3 + (rnd() * 2 | 0)) { const h = 4 + (rnd() * 5 | 0), c = cols[rnd() * cols.length | 0]; R(g, xx, 19 + r * 11 - h, 2.5, h, c); R(g, xx, 19 + r * 11 - h, U, h, lite(c, 0.3)); } } }
function poster(g, x, y, w, h, c, s) { R(g, x - 1, y - 1, w + 2, h + 2, '#3a2630'); R(g, x, y, w, h, c); R(g, x, y, w, 1, lite(c, 0.4)); if (s) txtC(g, s, x + w / 2, y + (h - 5) / 2, '#fff8e8'); }
function fur(kind, x, y, a, b) {
  const key = kind + (a || '') + (b || ''); let s = SPR[key];
  if (!s) {
    const D = { counter: [a, 18], stool: [8, 9], table: [24, 16], rack: [28, 24], cas: [30, 22], cab: [14, 26], gacha: [12, 22], crane: [26, 36], plant: [12, 20], altar: [64, 44], bones: [76, 46], panda: [22, 22], booth: [30, 20], escal: [44, 40], till: [14, 12], belt: [a, 16], scope: [10, 18], burner: [22, 22] }[kind];
    const c = mk(D[0], D[1]), g = c.g, w = D[0], h = D[1], rnd = RNG(key.length * 7 + (a | 0));
    const CL = ['#e0563f', '#f2c14e', '#5aa8e0', '#f06a8c', '#5aa85a', '#8a6aff', '#f4f1e6', '#3a3a4e'];
    if (kind === 'counter') { R(g, 0, 0, w, 7, b || '#c89a6a'); R(g, 0, 0, w, 1, '#f0d0a0'); R(g, 0, 6, w, 1, '#8a5a3a'); R(g, 0, 7, w, 11, '#8a5a3a'); for (let x = 4; x < w; x += 6) R(g, x, 7, U, 11, '#6a4028'); R(g, 0, 17, w, 1, '#4a2a20'); }
    else if (kind === 'belt') { R(g, 0, 0, w, 9, '#8a8496'); R(g, 0, 0, w, 1, '#c8c0d4'); R(g, 0, 2, w, 5, '#4a4458'); for (let x = 2; x < w; x += 5) R(g, x, 2, U, 5, '#5a5468'); R(g, 0, 9, w, 7, '#c89a6a'); R(g, 0, 9, w, 1, '#f0d0a0'); R(g, 0, 15, w, 1, '#8a5a3a'); }
    else if (kind === 'stool') { R(g, 3.5, 5, 1, 4, '#5a4a48'); ell(g, 4, 3, 3.5, 2.5, a || '#c8382e'); ell(g, 3.5, 2.5, 2, 1, lite(a || '#c8382e', 0.35)); }
    else if (kind === 'table') { R(g, 11, 9, 2, 7, '#6a4028'); R(g, 7, 15, 10, 1, '#6a4028'); ell(g, 12, 6, 11, 5, '#8a5a3a'); ell(g, 12, 5, 11, 4.5, '#c89a6a'); ell(g, 10, 4, 6, 2, '#dcb080'); disc(g, 8, 5, 2, '#f4f1e6'); disc(g, 16, 6, 2, '#f4f1e6'); disc(g, 8, 5, 1, CL[(a | 0) % 6]); }
    else if (kind === 'booth') { R(g, 0, 4, 6, 16, a || '#c8382e'); R(g, 24, 4, 6, 16, a || '#c8382e'); R(g, 0, 4, 6, 2, lite(a || '#c8382e', 0.3)); R(g, 24, 4, 6, 2, lite(a || '#c8382e', 0.3)); R(g, 7, 6, 16, 9, '#c89a6a'); R(g, 7, 6, 16, 1, '#f0d0a0'); R(g, 7, 14, 16, 1, '#8a5a3a'); R(g, 14, 15, 2, 5, '#6a4028'); disc(g, 11, 10, 2, '#f4f1e6'); disc(g, 19, 10, 2, '#f4f1e6'); }
    else if (kind === 'rack') { R(g, 1, 2, 26, 1, '#c8c0d4'); R(g, 1, 2, 1, 22, '#9a94a8'); R(g, 26, 2, 1, 22, '#9a94a8'); R(g, 0, 23, 4, 1, '#6b6478'); R(g, 24, 23, 4, 1, '#6b6478'); for (let i = 0; i < 6; i++) { const c2 = CL[(i + (a | 0)) % 7], x = 3.5 + i * 3.7; R(g, x + 1, 2, U, 2, '#6b6478'); R(g, x, 4, 3, 12 + (i * 3 % 4), c2); R(g, x, 4, U, 12, lite(c2, 0.3)); R(g, x + 2.5, 4, U, 12, dark(c2, 0.25)); } }
    else if (kind === 'cas') { R(g, 0, 12, 30, 10, '#6a4638'); R(g, 0, 12, 30, 1, '#a8744a'); R(g, 0, 21, 30, 1, '#3a2630'); R(g, 1, 0, 28, 12, '#cfeaff'); R(g, 1, 0, 28, 1, '#ffffff'); R(g, 1, 0, U, 12, '#8ab0d0'); R(g, 28.5, 0, U, 12, '#8ab0d0'); for (let i = 0; i < 5; i++) { const c2 = CL[(i * 2 + (a | 0)) % 6], x = 3 + i * 5.2; R(g, x, 5, 3, 6, c2); disc(g, x + 1.5, 4, 1.6, '#f6cfa6'); R(g, x, 2.5, 3, 1.5, CL[(i + 3 + (a | 0)) % 8]); R(g, x - 0.5, 11, 4, 1, '#3a3346'); } R(g, 5, 1, 1, 9, 'rgba(255,255,255,0.5)'); }
    else if (kind === 'cab') { const c2 = a || '#5a4a9a'; R(g, 1, 2, 12, 24, c2); R(g, 1, 2, 12, 1, lite(c2, 0.4)); R(g, 1, 2, 1, 24, lite(c2, 0.2)); R(g, 12, 2, 1, 24, dark(c2, 0.3)); R(g, 2, 0, 10, 3, '#f2c14e'); R(g, 2.5, 5, 9, 8, '#1d1626'); dgrad(g, 3, 5.5, 8, 7, ['#5ad8f0', '#8a6aff', '#f06a8c']); R(g, 5, 8, 2, 2, '#fff8e8'); R(g, 1, 14, 12, 4, dark(c2, 0.2)); R(g, 4, 13, 1, 2, '#e0563f'); p1(g, 9, 15, '#ffd84a'); p1(g, 10.5, 15, '#5ad88a'); R(g, 3, 20, 8, 4, dark(c2, 0.4)); }
    else if (kind === 'gacha') { R(g, 1, 0, 10, 22, '#f4f1e6'); R(g, 1, 0, 10, 1, '#ffffff'); R(g, 10, 0, 1, 22, '#c8c0d0'); for (const yy of [1.5, 11.5]) { R(g, 2, yy, 8, 6, '#cfeaff'); for (let i = 0; i < 5; i++) disc(g, 3.5 + (i * 3 % 5), yy + 2 + (i % 2) * 2.5, 1.3, CL[(i + (a | 0) + yy | 0) % 6]); R(g, 2, yy + 6.5, 8, 2.5, a === 1 ? '#f06a8c' : '#5aa8e0'); disc(g, 6, yy + 7.7, 1, '#f4f1e6'); } R(g, 0, 21, 12, 1, '#6b6478'); }
    else if (kind === 'crane') { const c2 = a || '#f06a8c'; R(g, 0, 0, 26, 5, c2); R(g, 0, 0, 26, 1, lite(c2, 0.4)); txt(g, 'UFO', 7, 0, '#fff8e8'); R(g, 0, 5, 26, 18, '#cfeaff'); R(g, 0, 5, 1, 18, c2); R(g, 25, 5, 1, 18, c2); R(g, 12, 5, U, 5, '#6b6478'); R(g, 10.5, 10, 4, 1, '#9a94a8'); R(g, 10.5, 11, U, 2, '#9a94a8'); R(g, 14, 11, U, 2, '#9a94a8'); for (let i = 0; i < 6; i++) { disc(g, 3.5 + i * 3.8, 20 - (i % 2) * 2, 2.4, CL[i % 6]); p1(g, 3 + i * 3.8, 19 - (i % 2) * 2, '#1d1626'); p1(g, 4.5 + i * 3.8, 19 - (i % 2) * 2, '#1d1626'); } R(g, 3, 6, 1, 14, 'rgba(255,255,255,0.55)'); R(g, 0, 23, 26, 13, c2); R(g, 0, 23, 26, 1, dark(c2, 0.3)); R(g, 4, 26, 8, 4, dark(c2, 0.35)); R(g, 16, 26, 2, 2, '#ffd84a'); R(g, 20, 26, 2, 2, '#5ad88a'); R(g, 0, 35, 26, 1, dark(c2, 0.5)); }
    else if (kind === 'plant') { R(g, 3, 13, 6, 7, '#b8603a'); R(g, 3, 13, 6, 1, '#e08a5a'); R(g, 2, 12, 8, 1.5, '#c8704a'); disc(g, 6, 7, 5, '#2f5d3a'); disc(g, 4, 5, 3, '#4f8a4b'); disc(g, 8, 6, 3, '#4f8a4b'); disc(g, 5, 4, 1.5, '#8fc97a'); }
    else if (kind === 'altar') { R(g, 2, 30, 60, 14, '#7a3a2a'); R(g, 2, 30, 60, 1.5, '#f2c14e'); R(g, 0, 42, 64, 2, '#4a2a20'); R(g, 10, 6, 44, 24, '#3a2228'); R(g, 10, 6, 44, 2, '#f2c14e'); R(g, 10, 6, 2, 24, '#d9b04a'); R(g, 52, 6, 2, 24, '#d9b04a'); ell(g, 32, 24, 11, 6, '#d9b04a'); R(g, 27, 11, 10, 11, '#f2c14e'); disc(g, 32, 10, 4.5, '#f8dc8a'); disc(g, 32, 10, 8, 'rgba(255,220,120,0.25)'); p1(g, 30.5, 10, '#8a5a20'); p1(g, 33, 10, '#8a5a20'); for (const x of [6, 56]) { R(g, x, 22, 2, 8, '#f4f1e6'); R(g, x + 0.5, 19, 1, 3, '#ffb84a'); p1(g, x + 0.75, 18.5, '#fff0b0'); } for (let x = 14; x < 52; x += 4) R(g, x, 33, 2, 2, '#f2c14e'); }
    else if (kind === 'bones') { const k = '#f4eedc', d = '#c8beaa'; R(g, 4, 40, 68, 6, '#6a4638'); R(g, 4, 40, 68, 1, '#a8744a'); for (let i = 0; i < 26; i++) { const t = i / 25, x = 14 + t * 44, y = 16 - Math.sin(t * 3.14) * 6 + t * 6; R(g, x, y, 2, 2, k); if (i > 6 && i < 18) R(g, x, y + 2, 1, 9 - Math.abs(i - 12), d); } for (let i = 0; i < 9; i++) R(g, 58 + i * 1.8, 22 + i * 1.6, 2, 1.5, k); R(g, 4, 6, 10, 7, k); R(g, 2, 9, 4, 4, k); R(g, 6, 8, 2, 2, '#3a2630'); for (let x = 3; x < 10; x += 2) R(g, x, 13, 1, 1.5, k); R(g, 12, 12, 3, 5, k); for (const x of [24, 30, 42, 47]) { R(g, x, 24, 2, 9, k); R(g, x - 1, 32, 2, 8, d); R(g, x - 3, 39, 5, 1, k); } }
    else if (kind === 'panda') { ell(g, 11, 15, 8, 6, '#f8f4ea'); R(g, 3, 13, 5, 7, '#2a2430'); R(g, 14, 13, 5, 7, '#2a2430'); disc(g, 11, 7, 6, '#f8f4ea'); disc(g, 6, 2.5, 2.2, '#2a2430'); disc(g, 16, 2.5, 2.2, '#2a2430'); ell(g, 8.5, 7, 1.6, 2, '#2a2430'); ell(g, 13.5, 7, 1.6, 2, '#2a2430'); p1(g, 8.5, 6.5, '#fff'); p1(g, 13.5, 6.5, '#fff'); R(g, 10.5, 9, 1.5, 1, '#2a2430'); R(g, 16, 6, 1.5, 14, '#5aa85a'); R(g, 17, 8, 3, 1, '#8fc97a'); R(g, 14, 12, 4, 3, '#2a2430'); }
    else if (kind === 'escal') { R(g, 0, 30, 44, 10, '#8a8496'); for (let i = 0; i < 10; i++) { R(g, 4 + i * 3.6, 30 - i * 2.8, 5, 3, '#4a4458'); R(g, 4 + i * 3.6, 30 - i * 2.8, 5, U, '#c8c0d4'); } for (let i = 0; i < 40; i++) { R(g, 2 + i, 26 - i * 0.72, 1, 2, '#1d1626'); R(g, 6 + i * 0.95, 34 - i * 0.72, 1, 6, '#b8b0c6'); } R(g, 34, 0, 10, 3, '#f2c14e'); txt(g, '2F', 36, -1, '#1d1626'); }
    else if (kind === 'till') { R(g, 1, 4, 12, 8, '#3a3a4e'); R(g, 1, 4, 12, 1, '#6a6a80'); R(g, 3, 0, 8, 5, '#2a2a3a'); R(g, 4, 1, 6, 3, '#5ad88a'); for (let i = 0; i < 3; i++) R(g, 3 + i * 3, 7, 2, 1, '#c8c0d4'); }
    else if (kind === 'scope') { R(g, 4, 8, 2, 10, '#6b6478'); R(g, 2, 17, 6, 1, '#4a4458'); R(g, 1, 2, 8, 6, '#c8c0d4'); R(g, 1, 2, 8, 1, '#ffffff'); disc(g, 3, 5, 1.5, '#2a2430'); disc(g, 7, 5, 1.5, '#2a2430'); }
    else if (kind === 'burner') { ell(g, 11, 14, 10, 4, '#3a3346'); R(g, 3, 9, 16, 6, '#6b6478'); R(g, 3, 9, 16, 1, '#c8c0d4'); ell(g, 11, 9, 8, 2.5, '#e8e0d0'); R(g, 5, 15, 2, 6, '#4a4458'); R(g, 15, 15, 2, 6, '#4a4458'); roof(g, 11, 0, 4, 11, 5, '#3d3852'); R(g, 4, 5, 1, 4, '#8a3a2a'); R(g, 17, 5, 1, 4, '#8a3a2a'); for (let i = 0; i < 5; i++) R(g, 7 + i * 2, 7, U, 2, '#c8382e'); }
    s = SPR[key] = kind === 'counter' || kind === 'belt' || kind === 'escal' ? c : outline(c);
  }
  put(s, x, y, s.lw / 2, s.lh - 1);
  if (kind === 'counter' || kind === 'belt') block(x - a / 2, y - 14, x + a / 2, y); else if (kind !== 'stool') block(x - s.lw / 2 + 2, y - 8, x + s.lw / 2 - 2, y);
}

// ---------- shared sprites ----------
const icon = (n, fn) => { const c = mk(12, 12); fn(c.g); ICON[n] = outline(epx(c)); };
function buildSprites() {
  const tr = cols => (rnd, i) => { const c = mk(56, 62); tree(c.g, 28, 60, 25 + i % 3, cols, rnd, { cw: 36 + (i % 2) * 4, ch: 26, n: 14, up: 2 }); return c; };
  variants('sakura', 3, tr(LEAF.sakura)); variants('green', 4, tr(LEAF.green)); variants('green2', 2, tr(LEAF.green2)); variants('maple', 2, tr(LEAF.maple)); variants('ginkgo', 3, tr(LEAF.maple2));
  variants('pine', 3, (rnd, i) => { const c = mk(64, 62); pine(c.g, 32, 60, 40 + i * 3, rnd); return c; });
  variants('bush', 3, (rnd, i) => { const c = mk(26, 16); bush(c.g, 13, 15, 16 + i * 2, i === 2 ? LEAF.sakura : LEAF.green, rnd); return c; });
  variants('rock', 3, (rnd, i) => { const c = mk(22, 14), g = c.g, w = 8 + i * 1.5; ell(g, 11, 9, w, 4.5, '#6b6478'); ell(g, 10, 8, w - 1, 4, '#8c8498'); ell(g, 8.5, 6.5, w * 0.55, 2.2, '#aaa4b8'); p1(g, 7, 6, '#c8c0d4'); if (i !== 1) { ell(g, 14, 9, 3, 1.5, '#6aa85a'); p1(g, 13, 8.5, '#8fd070'); } R(g, 3, 12.5, 16, 1, '#514a60'); return outline(c); });
  one('lantern', 14, 25, g => stoneLantern(g, 6, 24, true, false)); one('bench', 20, 13, g => bench(g, 1, 12)); one('vend', 14, 22, g => vending(g, 1, 21)); one('vend2', 14, 22, g => vending(g, 1, 21, '#e0563f')); one('vend3', 14, 22, g => vending(g, 1, 21, '#5aa8e0'));
  one('lamp', 12, 34, g => streetLamp(g, 8, 33, 30)); one('torii', 60, 50, g => torii(g, 30, 49, 40, 44)); one('toriiW', 84, 70, g => torii(g, 42, 69, 60, 62, '#9a6a40'));
  one('hall', 176, 92, g => templeHall(g, 88, 90, 108, 30, { gold: 1 })); one('hallG', 176, 92, g => templeHall(g, 88, 90, 108, 30, { wall: '#8a5a3a', roof: '#4a8a7a', door: '#6a4028' }));
  one('pagoda', 104, 132, g => pagoda(g, 52, 130, 5, 54, { bh: 11, rh: 8, step: 6 }));
  one('stall', 30, 30, g => { R(g, 2, 12, 26, 18, '#8a5a3a'); R(g, 3, 13, 24, 9, '#ffd98a'); for (let i = 0; i < 6; i++) R(g, 4 + i * 4, 17, 3, 4, ['#e0563f', '#f2c14e', '#f06a8c'][i % 3]); R(g, 2, 22, 26, 2, '#c89a6a'); for (let i = 0; i < 8; i++) R(g, i * 4 - 1, 4, 4, 8, i % 2 ? '#f8f4ea' : '#e0563f'); R(g, -1, 4, 32, 1, '#ffa890'); R(g, -1, 11, 32, 1, '#8a2a24'); });
  SPR.car = ['#e0563f', '#f4f1e6', '#5aa8e0', '#f2c14e', '#3a3a4e', '#5aa85a'].map((c, i) => { const k = mk(30, 15), g = k.g; R(g, 1, 6, 28, 6, c); R(g, 1, 6, 28, 1, lite(c, 0.4)); R(g, 1, 11, 28, 1, dark(c, 0.35)); R(g, 6, 1, 16, 6, c); R(g, 6, 1, 16, 1, lite(c, 0.4)); R(g, 8, 2.5, 5.5, 3.5, '#bfe8ff'); R(g, 14.5, 2.5, 5.5, 3.5, '#bfe8ff'); R(g, 8, 2.5, 5.5, 1, '#ffffff'); disc(g, 7, 12, 2.5, '#1d1626'); disc(g, 22, 12, 2.5, '#1d1626'); disc(g, 7, 12, 1, '#9a94a8'); disc(g, 22, 12, 1, '#9a94a8'); R(g, 27.5, 7.5, 1.5, 2, '#fff0b0'); R(g, 1, 7.5, 1, 2, '#ff5a5a'); if (i === 3) { R(g, 12, -0.5, 4, 2, '#3f9a5a'); R(g, 1, 8.5, 28, 1, '#3a3a4e'); } const o = outline(k); return [o, flip(o)]; });
  SPR.cat = [['#e8a050', '#fff3d0'], ['#f4f1e6', '#3a3346'], ['#8a8498', '#e0dae8']].map(([a, b]) => { const c = mk(13, 12), g = c.g, d = dark(a, 0.25); R(g, 9.5, 7, 1, 3.5, a); R(g, 9.5, 6, 1.5, 1, a); R(g, 3, 6, 6, 5.5, a); R(g, 2.5, 8, 7, 3.5, a); R(g, 3, 6, 1, 5, d); R(g, 4.5, 7.5, 3, 4, b); R(g, 3, 2, 6, 4.5, a); R(g, 2.5, 3, 7, 3, a); R(g, 3, 0.5, 1, 1.5, a); R(g, 3, 1, 2, 1, a); R(g, 8, 0.5, 1, 1.5, a); R(g, 7, 1, 2, 1, a); R(g, 4, 3.5, U, 1, '#3a2434'); R(g, 7.5, 3.5, U, 1, '#3a2434'); p1(g, 5.75, 4.75, '#f09a9a'); return outline(c); });
  one('post', 6, 14, g => { R(g, 1, 0, 3, 14, '#6a4a30'); R(g, 1, 0, 1, 14, '#a8744a'); R(g, 0.5, 0, 4, 1, '#3a2a20'); }, 1);
  one('busstop', 12, 28, g => { R(g, 5, 8, 2, 20, '#6b6478'); disc(g, 6, 5, 5, '#3f7ab0'); disc(g, 6, 5, 3.5, '#f4f1e6'); R(g, 3, 4, 6, 2, '#3f7ab0'); R(g, 2, 26, 8, 2, '#4a4458'); }, 1);
  one('lanternM', 14, 25, g => stoneLantern(g, 6, 24, true, true));
  one('shsign', 26, 28, g => { R(g, 12, 12, 2, 16, '#6b6478'); R(g, 12, 12, U, 16, '#c8c0d4'); R(g, 0, 0, 26, 13, '#1d1626'); R(g, 1, 1, 24, 11, '#3f7ab0'); R(g, 1, 1, 24, U, '#8ac0e8'); R(g, 6, 4, 15, 4, '#f4f1e6'); R(g, 4, 5, 2, 3, '#f4f1e6'); R(g, 3, 6, 1, 2, '#f4f1e6'); R(g, 5, 6.5, 16, 1, '#3f7ab0'); R(g, 7, 4.5, 3, 1.5, '#1d1626'); R(g, 5, 8, 16, U, '#8a8496'); }, 1);
  one('sign', 18, 20, g => { R(g, 8, 8, 2, 12, '#6a4638'); R(g, 8, 8, U, 12, '#a8744a'); R(g, 0, 0, 18, 10, '#3a2630'); R(g, 1, 1, 16, 8, '#e8d8b0'); R(g, 1, 1, 16, U, '#fff8e0'); for (const y of [3, 5, 7]) R(g, 3, y, 9 + (y * 3 % 4), U, '#6a4638'); R(g, 14, 3.5, 1.5, 3, '#c8382e'); }, 1);
  icon('shink', g => { R(g, 2, 3, 10, 6, '#f4f1e6'); R(g, 1, 5, 2, 4, '#f4f1e6'); R(g, 0, 7, 2, 2, '#f4f1e6'); R(g, 2, 7, 10, 1, '#3f7ab0'); R(g, 4, 4, 2, 2, '#2a3a5a'); R(g, 7, 4, 4, 2, '#2a3a5a'); R(g, 1, 9, 11, 1, '#8a8496'); });
  icon('train', g => { R(g, 1, 2, 10, 8, '#5aa85a'); R(g, 1, 2, 10, 1, '#8fd070'); R(g, 2, 4, 3, 3, '#cfeaff'); R(g, 7, 4, 3, 3, '#cfeaff'); R(g, 1, 8, 10, 1, '#f4f1e6'); R(g, 2, 10, 2, 2, '#2a2430'); R(g, 8, 10, 2, 2, '#2a2430'); });
}

// ---------- dressing helpers used by city maps ----------
function woods(y0, y1, top) { const rnd = RNG(M.h + y0); for (let y = y0; y < y1; y += 13) for (const x of [10, 26, M.w - 26, M.w - 10]) plant(rnd() < 0.4 ? 'pine' : 'green', x + rnd() * 8 - 4, y + rnd() * 6, 1); if (top) for (let x = 40; x < M.w - 30; x += 16) for (const y of [34, 48]) plant(rnd() < 0.5 ? 'pine' : 'green', x + rnd() * 8 - 4 + (y > 40 ? 8 : 0), y + rnd() * 5, 1); }
function sideTowers(y0) { const rnd = RNG(M.h); for (const x of [14, M.w - 14]) for (let y = y0; y < M.h; y += 46) if (!M.hs.some(([hy, n]) => y > hy * T - 2 && y - 16 < (hy + n) * T)) tower(x, y, 30, 50 + (rnd() * 4 | 0) * 8); for (let x = 24; x < M.w + 10;) { const w = 40 + (rnd() * 4 | 0) * 8; tower(x, M.h + 62, w, 62 + (rnd() * 3 | 0) * 6); x += w + 3; } block(0, 0, M.w, 30); block(0, M.h - 6, M.w, M.h); block(0, 0, 6, M.h); block(M.w - 6, 0, M.w, M.h); }
function lamps(y, col) { for (let x = 130; x < M.w - 30; x += 96) { prop('lamp', x, y, 2); M.LIGHTS.push([x - 4, y - 28, 20, col || '#ffe8a8']); } }
const eaters = (xs, y, lines) => xs.forEach((x, i) => npc(WALK[(i * 3 + x) % 6], x, y, { dir: 'u', tint: WCOL[(x >> 3) % 8], lines: [lines[i % lines.length]] }));
function plaza(y) { for (let x = 60; x < M.w - 40; x += 92) { plant('ginkgo', x + hsh(x, y) * 24, y, 1); if ((x / 92 | 0) % 2) prop('bench', x + 46, y + 8, 9); else prop('vend', x + 46, y + 4, 6); } crowd(4, 40, y + 22, M.w - 40, y + 22, 6); }

// ---------- shaping a map: wild forest, water, ledges, steps, bridges, walls ----------
// A map is a rectangle of terrain, but the part you can walk is whatever shape lay() carves out of it.
// These helpers give that shape edges and levels, so a place can wind, climb and loop instead of being one flat box.
function blockTer(t) { for (let j = 0; j < M.GH; j++) for (let i = 0; i < M.GW; i++) if (M.TER[j * M.GW + i] === t) block(i * 8, j * 8, i * 8 + 8, j * 8 + 8); }
// wild(): every forest (FR) cell becomes woodland you cannot cross. Trees near the edge are real objects you can walk behind;
// the deep interior is painted straight onto the ground, so a big forest costs nothing to draw.
// gap: how many 8px cells next to a path stay free of trees, so narrow paths are not hidden behind canopies
function wild(kinds, gap = 1) {
  kinds = kinds || ['green', 'pine', 'green', 'green2'];
  const GW = M.GW, GH = M.GH, D = new Uint8Array(GW * GH).fill(99); let q = [];
  for (let k = 0; k < GW * GH; k++) if (M.TER[k] !== FR) { D[k] = 0; q.push(k); }
  for (let d = 1; d < 12 && q.length; d++) { const n = []; for (const k of q) { const i = k % GW, j = k / GW | 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = i + a, y = j + b; if (x < 0 || y < 0 || x >= GW || y >= GH) continue; const m = y * GW + x; if (D[m] > d) { D[m] = d; n.push(m); } } } q = n; }
  for (let k = 0; k < GW * GH; k++) if (D[k] >= 2) { const i = k % GW, j = k / GW | 0; block(i * 8, j * 8, i * 8 + 8, j * 8 + 8); }
  const rnd = RNG(M.w * 7 + M.h), deep = [], dist = (x, y) => D[Math.max(0, Math.min(GH - 1, Math.floor(y / 8))) * GW + Math.max(0, Math.min(GW - 1, Math.floor(x / 8)))];
  for (let y = 8, r = 0; y < M.h + 44; y += 11, r++) for (let x = (r % 2) * 8 - 2; x < M.w + 10; x += 16) {
    const px = Math.round(x + rnd() * 8 - 4), py = Math.round(y + rnd() * 6 - 3), d = dist(px, py), kind = kinds[rnd() * kinds.length | 0]; if (d < gap || (d === gap && rnd() < 0.55)) continue;
    if (d <= 8 && py < M.h) plant(kind, px, py, 1); else deep.push([kind, px, py]);
  }
  const g = M.ground.g; for (const [kind, x, y] of deep) { const v = SPR[kind], sp = v[Math.floor(hsh(x * 3, y * 5) * v.length)]; g.drawImage(sp, x - (kind === 'pine' ? 32 : kind === 'bamboo' ? 14 : 28), y - (kind === 'bamboo' ? 72 : 60)); }
}
// ledge(): a retaining wall or cliff face running left to right through pts (px). The ground north of it reads as higher.
const LEDGE = { rock: ['#8a8496', '#aaa4b8', '#6b6478', '#514a60'], stone: ['#b8b0a4', '#d8d0c4', '#8e887c', '#6a6458'], earth: ['#a8845a', '#c4a070', '#8a6a48', '#5a4630'] };
function ledgeY(pts, x) { for (let k = 1; k < pts.length; k++) { const [ax, ay] = pts[k - 1], [bx, by] = pts[k]; if (x <= bx || k === pts.length - 1) { const t = Math.max(0, Math.min(1, (x - ax) / (bx - ax))); return snap(ay + (by - ay) * t * t * (3 - 2 * t)); } } }
function ledge(pts, h = 12, kind = 'rock') {
  const g = M.ground.g, [c, hi, lo, dk] = LEDGE[kind], x0 = pts[0][0], x1 = pts[pts.length - 1][0];
  for (let x = x0; x < x1; x += U) {
    const y = ledgeY(pts, x), X = Math.round(x * S);
    R(g, x, y, U, h, c);
    if (kind === 'stone') { for (let r = 0; r * 4 < h; r++) { const q = (X + (r & 1) * 9) % 18; R(g, x, y + r * 4, U, U, lo); if (q === 0) R(g, x, y + r * 4, U, 4, lo); else if (q === 1) R(g, x, y + r * 4 + U, U, 3, hi); else if (hsh(X >> 2, r + 40) < 0.2) R(g, x, y + r * 4 + 1.5, U, 1, hi); } }
    else { const n = vn(X / 9, 3.1); R(g, x, y + h * (0.2 + n * 0.5), U, 1 + hsh(X >> 2, 9) * 2, lo); if (hsh(X, 3) < 0.14) R(g, x, y + 2 + hsh(X, 5) * (h - 5), U, 2, hi); if (hsh(X >> 1, 11) < 0.07) R(g, x, y + 1, U, h - 2, lo); }
    R(g, x, y + h - 1.5, U, 1.5, dk); R(g, x, y + h, U, 2.5, 'rgba(20,24,40,0.24)');
    if (kind === 'earth') { R(g, x, y - 1, U, 2.5 + hsh(X >> 1, 2) * 2.5, '#4c9446'); R(g, x, y - 1.5, U, 1, '#8fd070'); } else { R(g, x, y - U, U, 1.5, hi); R(g, x, y - 1, U, U, dk); }
  }
  for (let x = Math.floor(x0 / 4) * 4; x < x1; x += 4) { const y = ledgeY(pts, x + 2); block(x, y - 2, x + 4, y + h - 1); }
}
// steps(): a flight of stairs through a ledge; x is the middle, y the top of the ledge. Keep x and w multiples of 8.
function steps(x, y, w = 24, h = 16, c = '#c8c0b4') {
  const g = M.ground.g, x0 = x - w / 2;
  for (let r = 0; r * 2.5 < h + 3; r++) { const yy = y - 3 + r * 2.5; R(g, x0, yy, w, 2.5, r % 2 ? c : lite(c, 0.18)); R(g, x0, yy, w, U, lite(c, 0.5)); R(g, x0, yy + 2, w, U, dark(c, 0.4)); }
  for (const xx of [x0 - 3, x0 + w]) { R(g, xx, y - 5, 3, h + 6, dark(c, 0.3)); R(g, xx, y - 5, 3, 1, lite(c, 0.3)); R(g, xx, y - 5, U, h + 6, lite(c, 0.1)); R(g, xx, y + h, 3, 1.5, dark(c, 0.55)); }
  block(x0, y - 6, x0 + w, y + h, 0);
}
// bridge(): a deck across water. The rail nearest the camera is a real object, so you walk behind it.
function bridge(x0, y0, x1, y1, col = '#c0442f', wd = '#b8905a') {
  const g = M.ground.g, w = x1 - x0, h = y1 - y0, hz = w >= h, d = dark(col, 0.35), l = lite(col, 0.35);
  R(g, x0, y1, w, 3, 'rgba(20,30,60,0.3)'); R(g, x0, y0, w, h, wd);
  if (hz) { for (let x = x0; x < x1; x += 4) R(g, x, y0, U, h, dark(wd, 0.3)); R(g, x0, y0, w, U, lite(wd, 0.4)); R(g, x0, y0 - 6, w, 1.5, col); R(g, x0, y0 - 6, w, U, l); R(g, x0, y0 - 3, w, 1, d); for (let x = x0; x <= x1 - 2; x += Math.max(8, w / Math.round(w / 12))) { R(g, x, y0 - 8, 2, 8, col); R(g, x, y0 - 8, U, 8, l); R(g, x, y0 - 8, 2, U, '#1d1626'); } }
  else { for (let y = y0; y < y1; y += 4) R(g, x0, y, w, U, dark(wd, 0.3)); for (const x of [x0 - 2, x1]) { R(g, x, y0 - 6, 2, h + 6, col); R(g, x, y0 - 6, U, h + 6, l); for (let y = y0; y <= y1; y += 12) { R(g, x - U, y - 8, 3, 3, d); R(g, x - U, y - 8, 3, U, l); } } }
  block(x0, y0, x1, y1, 0); if (!hz) { block(x0 - 2, y0 + 6, x0, y1 - 6); block(x1, y0 + 6, x1 + 2, y1 - 6); } // you cannot step off the side
  if (hz) { const c = mk(w, 9), q = c.g; R(q, 0, 2, w, 1.5, col); R(q, 0, 2, w, U, l); R(q, 0, 5, w, 1, d); for (let x = 0; x <= w - 2; x += Math.max(8, w / Math.round(w / 12))) { R(q, x, 0, 2, 9, col); R(q, x, 0, U, 9, l); R(q, x, 0, 2, U, '#1d1626'); } put(c, x0 + w / 2, y1 + 3, w / 2, 8); }
}
// walls: wallH runs left to right, wallV runs top to bottom. Leave gaps between calls for gates.
const _walls = {};
function wallH(x0, x1, y, c = '#e8d8b0', rc = '#4a4660') {
  const w = x1 - x0, key = w + c + rc; let s = _walls[key];
  if (!s) { s = _walls[key] = mk(w, 22); const g = s.g; R(g, 0, 7, w, 12, c); for (const yy of [9.5, 12, 14.5]) R(g, 0, yy, w, U, lite(c, 0.6)); R(g, 0, 7, w, 1.5, dark(c, 0.35)); R(g, 0, 19, w, 3, '#8c8498'); R(g, 0, 19, w, U, '#c8c0d4'); for (let x = 3; x < w; x += 7) R(g, x, 19.5, U, 2.5, '#6b6478'); R(g, 0, 0, w, 7, rc); R(g, 0, 0, w, 1, lite(rc, 0.35)); R(g, 0, 1, w, U, dark(rc, 0.3)); for (let x = 0; x < w; x += 2) R(g, x, 2, U, 4.5, dark(rc, 0.25)); R(g, 0, 6, w, 1, dark(rc, 0.5)); for (const x of [0, w - 1]) R(g, x, 0, 1, 22, dark(c, 0.5)); }
  put(s, (x0 + x1) / 2, y, w / 2, 21); block(x0, y - 7, x1, y); M.SHD.push([(x0 + x1) / 2, y + 1, w / 2, 2.5]);
}
function wallV(x, y0, y1, c = '#e8d8b0', rc = '#4a4660') {
  const HT = 15;
  for (let y = y0; y < y1; y += 16) {
    const n = Math.min(16, y1 - y), last = y + n >= y1, s = mk(8, n + (last ? HT : 0)), g = s.g;
    R(g, 0, 0, 8, n, rc); R(g, 3.5, 0, 1, n, lite(rc, 0.35)); R(g, 0, 0, 1, n, dark(rc, 0.45)); R(g, 7, 0, 1, n, dark(rc, 0.45)); for (let k = 0; k < n; k += 2) { R(g, 1, k, 2.5, U, dark(rc, 0.25)); R(g, 4.5, k, 2.5, U, dark(rc, 0.25)); }
    if (last) { R(g, 1, n, 6, HT - 3, c); R(g, 1, n, 6, 1.5, dark(c, 0.4)); R(g, 1, n, U, HT - 3, lite(c, 0.4)); R(g, 6.5, n, U, HT - 3, dark(c, 0.3)); R(g, 0.5, n + HT - 3, 7, 3, '#8c8498'); R(g, 0.5, n + HT - 3, 7, U, '#c8c0d4'); }
    put(s, x, y + n, 4, n + HT);
  }
  block(x - 4, y0, x + 4, y1);
}
// start a ride scene that ends at another map: rideTo({ label, name, go: [mapId, x, y], spr, speed, dur })
function rideTo(o) { G.state = 'ride'; G.ride = Object.assign({ t: 0, dur: 4 }, o); Snd.play(null); Snd.fx('train'); emit('ride', G.ride); }
// the bullet-train gate that links cities, and a wooden signpost you can read
function shinkansen(x, y) { prop('shsign', x + 20, y + 5, 3); M.SPOTS.push({ x, y: y + 7, r: 14, label: 'SHINKANSEN', shink: 1 }); M.sk = [x, y + 12]; }
// a bus stop that opens the city's line, like a station
function busStop(x, y) { prop('busstop', x, y, 2); M.SPOTS.push({ x, y: y + 7, r: 14, label: 'BUS', train: 1 }); M.st = [x, y + 12]; }
// rooftops seen from above, for the blocked ground behind a row of shops
function roofs(x0, y0, x1, y1, seed) { const g = M.ground.g, r = RNG(seed || x0 + y0); block(x0, y0, x1, y1); for (let y = y0; y < y1; y += 6) for (let x = x0; x < x1; x += 12) { const k = (x / 12 + y / 6) % 2; R(g, x, y, 12, 6, k ? '#4a4458' : '#3a3448'); R(g, x, y, 12, U, '#6a6478'); } for (let k = 0; k < (x1 - x0) * (y1 - y0) / 2400; k++) { const x = x0 + r() * (x1 - x0 - 14), y = y0 + r() * (y1 - y0 - 10); R(g, x, y, 10, 7, '#8a8496'); R(g, x, y, 10, 1, '#b8b0c6'); R(g, x + 2, y + 2, 2, 2, '#5a5468'); } }
// a row of buildings along the bottom edge, seen from behind the street
function bottomRow(seed) { const rnd = RNG(seed || M.w); for (let x = 24; x < M.w + 10;) { const w = 40 + (rnd() * 4 | 0) * 8; tower(x, M.h + 62, w, 62 + (rnd() * 3 | 0) * 6); x += w + 3; } block(0, M.h - 6, M.w, M.h); }
function signpost(x, y, lines) { prop('sign', x, y, 3); M.SPOTS.push({ x, y: y + 5, r: 12, label: 'READ', lines }); }
// city(): register a city and claim every map defined since the last one
function city(def) { CITIES[def.id] = def; for (const id in MAPS) if (!MAPS[id].city) MAPS[id].city = def.id; return def; }
