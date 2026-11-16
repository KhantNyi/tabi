'use strict';
// ---------- runtime: walking, doors, the train line, stamps, saving ----------
const GAME = { title: 'TABI', save: 'tabi' }; // the game's name lives here and nowhere else
const CITY = CITIES[new URLSearchParams(location.search).get('city')] || Object.values(CITIES)[0];
const G = { state: 'title', t: 0, cx: 0, cy: 0, fade: 1, flash: 0, banner: 0, stamps: {}, figs: {}, fit: 0, cats: {}, tgt: null, fx: [], back: null, dist: CITY.start, hasSave: false };
const pl = { x: 70, y: 204, dir: 'd', mv: false, wt: 0, ph: 0, act: null }, PRT = [];
const FITS = ['#3fa7a0', '#f06a8c', '#f2c14e', '#8a6aff', '#3a3a4e', '#f4f1e6', '#e0563f', '#5aa85a'], FITN = ['TEAL JACKET', 'PINK HOODIE', 'YELLOW RAINCOAT', 'PURPLE BOMBER', 'BLACK COAT', 'WHITE SHIRT', 'RED TRACK TOP', 'GREEN PARKA'];
const plLook = i => LOOKS['pl' + i] || (LOOKS['pl' + i] = makeLook(Object.assign({}, PLAYER_LOOK, { shirt: FITS[i] })));
function save() { try { localStorage.setItem(GAME.save + '-' + CITY.id, JSON.stringify({ stamps: G.stamps, figs: G.figs, fit: G.fit, cats: G.cats, dist: G.dist })); } catch (e) { } }
function load() { try { const s = JSON.parse(localStorage.getItem(GAME.save + '-' + CITY.id)); if (s && s.stamps) { G.stamps = s.stamps; G.figs = s.figs || {}; G.fit = s.fit || 0; G.cats = s.cats || {}; if (MAPS[s.dist]) G.dist = s.dist; G.hasSave = true; } } catch (e) { } }
const count = o => Object.keys(o).length, STAMPS = CITY.stamps, STN = CITY.line, NST = Object.keys(STAMPS).length;
function build(id) {
  const d = MAPS[id]; newMap(id, d.tw || 20, d.th || 12, !!d.indoor); M.def = d; M.night = d.night; M.hs = []; M.vs = [];
  if (d.lay) d.lay(); if (!d.indoor) paintGround(); d.deco(); markRoads();
  M.OBJ.sort((a, b) => a.y - b.y); for (const [x, y, rx, ry] of M.SHD) ell(M.ground.g, x, y, rx, ry, d.indoor ? 'rgba(20,10,30,0.22)' : 'rgba(22,30,50,0.26)');
  return BUILT[id] = M;
}
// follow the player, stop at the map edges, and centre maps smaller than the view (rooms on a wide screen)
const camX = () => M.w <= W ? (M.w - W) / 2 : Math.max(0, Math.min(M.w - W, pl.x - W / 2)), camY = () => M.h <= H ? (M.h - H) / 2 : Math.max(0, Math.min(M.h - H, pl.y - 12 - H / 2));
function camSnap() { G.cx = camX(); G.cy = camY(); }
function go(id, x, y, dir) {
  M = BUILT[id] || build(id); const st = M.st || [160, 182]; pl.x = x != null ? x : st[0]; pl.y = y != null ? y : st[1]; pl.dir = dir || 'd'; pl.mv = false; pl.act = null; G.fade = 1; G.tgt = null; G.fx = []; camSnap();
  if (!M.indoor) { G.dist = id; G.banner = 3.5; save(); } else G.banner = 2.5; Snd.play(M.def.music || 'tokyo');
}
function step(e, dx, dy) { let m = false; if (dx && !hit(e.x + dx, e.y)) { e.x += dx; m = true; } if (dy && !hit(e.x, e.y + dy)) { e.y += dy; m = true; } return m; }
function say(e, s) { e.say = s; e.sayT = 1.6 + s.length * 0.05; Snd.fx('talk'); }
function dialog(lines, then) { G.state = 'dialog'; G.dlg = { lines, i: 0, t: 0, then }; }
function award(id) { if (G.stamps[id]) { G.state = 'play'; return; } G.stamps[id] = 1; G.state = 'got'; G.got = { id, t: 0 }; G.flash = 0.6; Snd.fx('stamp'); save(); }
function interact() {
  const t = G.tgt; if (!t) return;
  if (t.cat) { t.cat.purr = 1.2; G.fx.push({ x: t.cat.x, y: t.cat.y - 10, t: 0, icon: 'heart' }); Snd.fx('heart'); G.cats[M.id] = 1; save(); return; }
  const sp = t.spot; if (!sp) { const n = t.npc; say(n, n.lines[n.li++ % n.lines.length]); return; }
  if (sp.door) { G.back = { map: M.id, x: pl.x, y: pl.y }; Snd.fx('page'); go(sp.door, 160, 182, 'u'); }
  else if (sp.train) { G.state = 'line'; G.line = { sel: (STN.findIndex(s => s[0] === M.id) + 1) % STN.length }; Snd.fx('page'); }
  else if (sp.mini) { G.state = 'mini'; G.mg = { k: sp.mini, sp, t: 0 }; MG[sp.mini].init(G.mg); Snd.fx('ui'); }
  else if (sp.act) { G.state = 'event'; G.ev = { sp, t: 0 }; pl.mv = false; pl.dir = sp.act === 'hold' ? 'd' : 'u'; }
  else { Snd.fx(sp.fx || 'ui'); dialog(sp.lines); }
}
function endMini(win, lines) { const sp = G.mg.sp; G.mg = null; G.state = 'play'; dialog(lines, win && sp.stamp ? () => award(sp.stamp) : null); }

function update(dt) {
  G.t += dt; if (G.fade > 0 && G.state !== 'title') G.fade = Math.max(0, G.fade - dt * 2); if (G.flash > 0) G.flash -= dt * 2; if (G.banner > 0) G.banner -= dt;
  if (KP.m) Snd.toggle();
  const st = G.state;
  if (st === 'title') { if (KP.n && G.hasSave) { G.stamps = {}; G.figs = {}; G.cats = {}; G.fit = 0; G.dist = CITY.start; G.hasSave = false; pl.F = plLook(0); go(CITY.start); G.banner = 0; Snd.fx('ui'); } else if (KP.a) { if (TOUCH) fullscreen(true); G.state = 'play'; G.banner = 3.5; G.fade = 0; Snd.play(M.def.music); Snd.fx('ui'); } }
  else if (st === 'play') {
    let dx = (K.r ? 1 : 0) - (K.l ? 1 : 0), dy = (K.d ? 1 : 0) - (K.u ? 1 : 0); pl.mv = !!(dx || dy);
    if (pl.mv) { const h = dx < 0 ? 'l' : dx > 0 ? 'r' : null, v = dy < 0 ? 'u' : dy > 0 ? 'd' : null; if (pl.dir !== h && pl.dir !== v) pl.dir = h || v; if (dx && dy) { dx *= 0.7071; dy *= 0.7071; } const w0 = pl.wt; if (!step(pl, dx * 72 * dt, dy * 72 * dt)) pl.mv = false; pl.wt += dt; if (pl.mv && Math.floor(pl.wt / 0.27) !== Math.floor(w0 / 0.27) && Snd.ctx) Snd.noise(Snd.ctx.currentTime, 0.035, 0.018, 500, 1600, Snd.sfx); } else pl.wt = 0;
    if (M.indoor && pl.y > 188 && G.back) { const b = G.back; G.back = null; Snd.fx('page'); go(b.map, b.x, b.y, 'd'); G.banner = 0; }
    let best = null, bd = 1e9; const tryT = (x, y, r, o) => { const d = Math.hypot(x - pl.x, (y - pl.y) * 1.3); if (d < r && d < bd) { bd = d; best = o; } };
    for (const s of M.SPOTS) tryT(s.x, s.y, s.r, { spot: s, label: s.label });
    for (const n of M.ACT) { if (n.cat) tryT(n.x, n.y, 15, { cat: n, x: n.x, y: n.y + 12, label: 'PET' }); else if (n.spot) tryT(n.x, n.y + 16, 22, { spot: n.spot, label: n.spot.label }); else if (n.lines) tryT(n.x, n.y, 20, { npc: n, x: n.x, y: n.y, label: 'TALK' }); }
    G.tgt = best; if (KP.a) interact(); else if (KP.b) { G.state = 'book'; Snd.fx('page'); }
  } else if (st === 'event') {
    const ev = G.ev, sp = ev.sp, t0 = ev.t; ev.t += dt; const cross = s => t0 < s && ev.t >= s;
    if (sp.act === 'bow') { pl.act = (ev.t > 0.7 && ev.t < 1.2) || (ev.t > 1.5 && ev.t < 2) ? 'bow' : 'back'; if (cross(0.15)) Snd.fx('coin'); if (cross(0.35)) Snd.fx('bell'); if (cross(2.2) || cross(2.45)) Snd.fx('clap'); }
    else if (sp.act === 'snap') { pl.act = 'back'; if (cross(0.8)) { Snd.fx('shutter'); G.flash = 1; } }
    else { pl.act = ev.t > 0.3 ? 'cheer' : null; if (cross(0.4) || cross(1.1)) Snd.fx(sp.fx || 'munch'); }
    if (ev.t > (sp.act === 'bow' ? 2.9 : 1.9)) { pl.act = null; dialog(G.stamps[sp.stamp] ? [sp.lines[1]] : sp.lines, () => award(sp.stamp)); }
  } else if (st === 'dialog') {
    const d = G.dlg, L = d.lines[d.i]; d.t += dt; if (d.t * 42 < L.length && Math.floor(d.t * 14) !== Math.floor((d.t - dt) * 14)) Snd.fx('talk');
    if (KP.a || KP.x) { if (d.t * 42 < L.length) d.t = 99; else if (++d.i >= d.lines.length) { G.state = 'play'; G.dlg = null; if (d.then) d.then(); } else { d.t = 0; Snd.fx('ui'); } }
  } else if (st === 'got') { G.got.t += dt; pl.act = 'cheer'; pl.dir = 'd'; if (G.got.t > 2.6 || (G.got.t > 0.6 && KP.a)) { pl.act = null; G.state = 'play'; if (count(G.stamps) === NST && !G.done) { G.done = 1; Snd.fx('yay'); dialog(['THAT IS EVERY STAMP IN ' + CITY.name + '!', 'THE CITY IS STILL YOURS TO WANDER FOR AS LONG AS YOU LIKE.']); } } }
  else if (st === 'book') { if (KP.b || KP.a || KP.x) { G.state = 'play'; Snd.fx('page'); } }
  else if (st === 'mini') { G.mg.t += dt; const m = G.mg; MG[m.k].update(m, dt); if (G.mg === m && KP.x && m.k !== 'dress') { G.mg = null; G.state = 'play'; } }
  else if (st === 'line') { const n = STN.length, L = G.line; if (KP.l) { L.sel = (L.sel + n - 1) % n; Snd.fx('ui'); } if (KP.r) { L.sel = (L.sel + 1) % n; Snd.fx('ui'); } if (KP.x || KP.b) G.state = 'play'; else if (KP.a) { if (STN[L.sel][0] === M.id) G.state = 'play'; else { G.state = 'ride'; G.ride = { to: L.sel, t: 0 }; Snd.play(null); Snd.fx('train'); } } }
  else if (st === 'ride') { G.ride.t += dt; if (Math.floor(G.ride.t * 3.4) !== Math.floor((G.ride.t - dt) * 3.4) && Snd.ctx) { Snd.noise(Snd.ctx.currentTime, 0.05, 0.05, 150, 700, Snd.sfx); Snd.noise(Snd.ctx.currentTime + 0.09, 0.05, 0.04, 150, 700, Snd.sfx); } if (G.ride.t > 3.4) { G.state = 'play'; go(STN[G.ride.to][0]); } }

  if (st !== 'ride' && st !== 'line' && st !== 'mini') {
    for (const n of M.ACT) {
      if (n.sayT > 0) n.sayT -= dt; if (n.cat) { if (n.purr > 0) n.purr -= dt; continue; }
      if (n.pa) { const tg = n.to ? n.pb : n.pa, tx = tg[0] - n.x, ty = tg[1] - n.y, d = Math.hypot(tx, ty); if (n.wait > 0) { n.wait -= dt; n.mv = false; continue; } if (d < 2) { n.to ^= 1; n.wait = 0.4 + (n.ph % 3) * 0.5; continue; } n.x += tx / d * n.sp * dt; n.y += ty / d * n.sp * dt; n.mv = true; n.wt += dt; n.dir = Math.abs(tx) > Math.abs(ty) ? (tx < 0 ? 'l' : 'r') : (ty < 0 ? 'u' : 'd'); continue; }
      const ddx = pl.x - n.x, ddy = pl.y - n.y;
      if (!n.rad) { if (n.sayT > 0 && !n.spot) n.dir0 = n.dir0 || n.dir; continue; }
      if (Math.hypot(ddx, ddy) < 24 || n.sayT > 0) { n.mv = false; n.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx < 0 ? 'l' : 'r') : (ddy < 0 ? 'u' : 'd'); n.wait = 0.8; continue; }
      if (n.wait > 0) { n.wait -= dt; n.mv = false; if (n.wait <= 0) { const a = n.rnd() * 6.283, r = n.rnd() * n.rad; n.tx = n.hx + Math.cos(a) * r; n.ty = n.hy + Math.sin(a) * r * 0.4; n.tt = 5; } continue; }
      const tx = n.tx - n.x, ty = n.ty - n.y, d = Math.hypot(tx, ty); n.tt -= dt;
      if (d < 2 || n.tt < 0 || !step(n, tx / d * 20 * dt, ty / d * 20 * dt)) { n.mv = false; n.wait = 1 + n.rnd() * 3.5; continue; }
      n.mv = true; n.wt += dt; n.dir = Math.abs(tx) > Math.abs(ty) ? (tx < 0 ? 'l' : 'r') : (ty < 0 ? 'u' : 'd');
    }
    for (const c of M.CARS) { const ahead = (pl.x - c.x) * Math.sign(c.v); if (!(Math.abs(pl.y - 4 - c.y) < 13 && ahead > 0 && ahead < 40)) c.x += c.v * dt; if (c.x > M.w + 40) c.x = -40; if (c.x < -40) c.x = M.w + 40; }
    for (const p of PRT) { p.x += (p.vx + Math.sin(G.t * 1.3 + p.ph) * 6) * dt; p.y += p.vy * dt; if (p.y > H + 4) { p.y = -4; p.x = Math.random() * (W + 60); } if (p.x < -6) p.x = W + 4; }
    for (const f of G.fx) f.t += dt; G.fx = G.fx.filter(f => f.t < 1.1);
    const tx = camX(), ty = camY(), k = Math.min(1, dt * 7); G.cx += (tx - G.cx) * k; G.cy += (ty - G.cy) * k;
  }
  for (const q in KP) KP[q] = 0;
}

// ---------- drawing ----------
function drawActor(e, cx, cy) {
  const x = e.x - cx, y = e.y - cy;
  if (e.cat) { ell(ctx, x, y, 4.5, 1.5, 'rgba(22,40,44,0.3)'); ctx.drawImage(SPR.cat[e.k], snap(x - 7), snap(y - 12)); return; }
  ell(ctx, x, y, 6, 2, 'rgba(22,30,50,0.32)'); ctx.drawImage(frameOf(e), snap(x - 10), snap(y - 27));
}
function drawWorld() {
  const cx = snap(G.cx), cy = snap(G.cy), t = G.t;
  if (cx < 0 || cy < 0 || cx + W > M.w || cy + H > M.h) R(ctx, 0, 0, W, H, '#15101f');
  ctx.drawImage(M.ground, -cx, -cy);
  if (G.state === 'play') for (const s of M.SPOTS) if (s.stamp && !G.stamps[s.stamp]) for (let k = 0; k < 10; k++) { const a = k * 0.6283 + t * 0.8; R(ctx, s.x - cx + Math.cos(a) * 9, s.y - cy - 1 + Math.sin(a) * 3.5, 1, U, k % 2 ? '#fff8e0' : '#ffd84a'); }
  const list = [pl];
  for (const o of M.OBJ) { const dx = o.x - o.ox - cx, dy = o.y - o.oy - cy; if (dx < W + 2 && dy < H && dx + o.spr.lw > -2 && dy + o.spr.lh > 0) list.push(o); }
  for (const e of M.ACT) if (e.x - cx > -20 && e.x - cx < W + 20 && e.y - cy > -4 && e.y - cy < H + 30) list.push(e);
  for (const c of M.CARS) if (c.x - cx > -40 && c.x - cx < W + 40) list.push(c);
  list.sort((a, b) => a.y - b.y);
  for (const o of list) {
    if (o.F || o.cat) { drawActor(o, cx, cy); continue; }
    if (o.v) { ell(ctx, o.x - cx, o.y - cy, 14, 2.5, 'rgba(22,30,50,0.35)'); ctx.drawImage(SPR.car[o.k][o.v > 0 ? 0 : 1], snap(o.x - cx - 16), snap(o.y - cy - 16)); continue; }
    const s = o.spr, dx = snap(o.x - o.ox - cx), dy = snap(o.y - o.oy - cy);
    if (o.split) { const off = snap(Math.sin(t * 1.1 + o.x * 0.031 + o.y * 0.017) * o.sw); ctx.drawImage(s, 0, 0, s.lw, o.split, dx + off, dy, s.lw, o.split); ctx.drawImage(s, 0, o.split, s.lw, s.lh - o.split, dx, dy + o.split, s.lw, s.lh - o.split); } else ctx.drawImage(s, dx, dy);
  }
  if (M.def.tint) { ctx.globalCompositeOperation = 'multiply'; R(ctx, 0, 0, W, H, M.def.tint); ctx.globalCompositeOperation = 'lighter'; for (const [x, y, r, c] of M.LIGHTS) { if (x - cx < -r || x - cx > W + r || y - cy < -r || y - cy > H + r) continue; ctx.drawImage(glowSpr(r, c), snap(x - cx - r), snap(y - cy - r)); } ctx.globalCompositeOperation = 'source-over'; }
  if (M.def.petals) for (const p of PRT) { R(ctx, p.x, p.y, 1.5, 1, p.c); p1(ctx, p.x + (Math.sin(t * 4 + p.ph) > 0 ? 1.5 : -U), p.y + U, p.c); }
  for (const f of G.fx) { ctx.globalAlpha = Math.max(0, 1 - f.t); ctx.drawImage(ICON[f.icon], snap(f.x - cx - ICON[f.icon].lw / 2), snap(f.y - cy - 8 - f.t * 14)); ctx.globalAlpha = 1; }
  if (G.state === 'event' && G.ev.sp.act === 'hold' && G.ev.t > 0.3) ctx.drawImage(ICON[STAMPS[G.ev.sp.stamp][1]], snap(pl.x - cx - 7), snap(pl.y - cy - 46 + Math.sin(t * 6)));
  if (G.state === 'play') for (const s of M.SPOTS.concat(M.ACT.filter(n => n.spot).map(n => ({ x: n.x, y: n.y - 4, stamp: n.spot.stamp, door: 0 })))) {
    const x = s.x - cx, st = s.stamp && !G.stamps[s.stamp]; if (!st && !s.door && !s.train) continue; const y = s.y - cy - (s.door || s.train ? 30 : 36) + Math.round(Math.abs(Math.sin(t * 3 + s.x)) * 3), c = st ? '#ffd84a' : s.train ? '#5ad88a' : '#fff8e8';
    if (x < -10 || x > W + 10 || y < -10 || y > H) continue; R(ctx, x - 2.5, y - 5, 5, 5, '#1d1626'); R(ctx, x - 3.5, y, 7, 1.5, '#1d1626'); R(ctx, x - 2.5, y + 1.5, 5, 1, '#1d1626'); R(ctx, x - 1.5, y + 2.5, 3, 1, '#1d1626'); R(ctx, x - 0.5, y + 3.5, 1, 1, '#1d1626'); R(ctx, x - 1.5, y - 4, 3, 5, c); R(ctx, x - 2.5, y + 0.5, 5, 1, c); R(ctx, x - 1.5, y + 1.5, 3, 1, c); R(ctx, x - 0.5, y + 2.5, 1, 1, c);
  }
  for (const n of M.ACT) if (n.sayT > 0) { const ls = wrap(n.say, 110), w = Math.max(...ls.map(l => tw(l))) + 8, h = ls.length * 7 + 6, x = Math.max(2, Math.min(W - w - 2, n.x - cx - w / 2)), y = Math.max(2, n.y - cy - 32 - h); panel(x, y, w, h); ls.forEach((l, i) => txt(ctx, l, x + 4, y + 4 + i * 7, '#3a2e40')); }
}
function ringS(cx, cy, icon, on) { if (on) { disc(ctx, cx, cy, 9, '#c8382e'); disc(ctx, cx, cy, 8, '#f8f0dc'); ctx.drawImage(stampOf(icon), cx - 7, cy - 7); } else { disc(ctx, cx, cy, 9, '#d9cba8'); disc(ctx, cx, cy, 8, '#f8f0dc'); txt(ctx, '?', cx - 1, cy - 2, '#d9cba8'); } }
function drawRide() {
  const r = G.ride, t = r.t, ox = Math.floor((W - W0) / 2), oy = Math.floor((H - H0) / 2); R(ctx, 0, 0, W, H, '#2a2a3a'); R(ctx, 0, oy + 122, W, H, '#3f7a5a'); R(ctx, 0, oy + 122, W, 2, '#5aa85a'); for (let x = ((ox + 30) % 44) - 44; x < W; x += 44) { R(ctx, x, oy + 6, 1, 14, '#c8c0d4'); disc(ctx, x + 0.5, oy + 24 + Math.sin(G.t * 3 + x), 4, '#f4f1e6'); disc(ctx, x + 0.5, oy + 24 + Math.sin(G.t * 3 + x), 2.5, '#2a2a3a'); }
  ctx.save(); ctx.translate(ox, oy); ctx.save(); ctx.beginPath(); ctx.rect(20, 34, 280, 84); ctx.clip();
  const s = SPR.ride, o = (G.t * 150) % 320; ctx.drawImage(s, o, 0, 320, 84, 20, 34, 320, 84); ctx.drawImage(s, o - 320, 0, 320, 84, 20, 34, 320, 84); for (let x = 300 - (G.t * 420) % 90; x > 0; x -= 90) R(ctx, x, 34, 3, 84, '#3a3a4e'); ctx.restore();
  for (const x of [20, 112, 206, 298]) R(ctx, x - 2, 30, 4, 92, '#c8c0d4'); R(ctx, 16, 30, 288, 4, '#c8c0d4'); R(ctx, 16, 118, 288, 4, '#c8c0d4');
  panel(70, 136, 180, 32); txtC(ctx, 'NEXT STOP', 160, 142, '#8a7a6a'); txtC(ctx, STN[r.to][1], 160, 152, '#3f9a5a', null, 2); ctx.restore();
  const a = t < 0.4 ? 1 - t / 0.4 : t > 3 ? (t - 3) / 0.4 : 0; if (a > 0) { ctx.globalAlpha = Math.min(1, a); R(ctx, 0, 0, W, H, '#100c1c'); ctx.globalAlpha = 1; }
}
function at(dx, dy, fn) { ctx.save(); ctx.translate(dx, dy); fn(); ctx.restore(); }
function drawUI() {
  const st = G.state, t = G.t, ox = Math.floor((W - W0) / 2), oy = Math.floor((H - H0) / 2);
  if (G.flash > 0) { ctx.globalAlpha = Math.min(1, G.flash); R(ctx, 0, 0, W, H, '#ffffff'); ctx.globalAlpha = 1; }
  if (st === 'play') { panel(4, 4, 44, 15); ctx.drawImage(stampOf('torii'), 6, 4.5); txt(ctx, count(G.stamps) + '/' + NST, 21, 9, '#c8382e'); if (!M.indoor) txt(ctx, M.def.name, W - 5 - tw(M.def.name), 7, '#fff8e8', '#1d1626'); }
  if (st === 'play' && G.tgt) { const g = G.tgt, w = tw('E') + 9 + tw(g.label), ax = g.x != null ? g.x : pl.x, ay = g.x != null ? g.y : pl.y, x = Math.max(3, Math.min(W - w - 3, ax - snap(G.cx) - w / 2)), y = Math.max(22, ay - snap(G.cy) - 43); const kw = keycap(x, y, 'E'); txt(ctx, g.label, x + kw + 3, y + 2, '#fff8e8', '#1d1626'); }
  if (st === 'play' && G.banner > 0) { const a = Math.min(1, G.banner, (3.5 - G.banner) * 2 + 0.3); ctx.globalAlpha = Math.max(0, Math.min(1, a)); R(ctx, 0, 60, W, M.def.sub ? 30 : 20, 'rgba(29,22,38,0.75)'); txtC(ctx, M.def.name, W / 2, 65, '#fff8e8', '#1d1626', 2); if (M.def.sub) txtC(ctx, M.def.sub, W / 2, 80, '#ffd98a', null); ctx.globalAlpha = 1; }
  if (st === 'dialog') at(ox, H - H0, () => { const d = G.dlg, L = d.lines[d.i], n = Math.floor(d.t * 42); panel(16, 130, 288, 42); wrap(L, 268).forEach((l, i, a) => { const before = a.slice(0, i).join(' ').length + (i ? 1 : 0); txt(ctx, l.slice(0, Math.max(0, n - before)), 26, 138 + i * 9, '#3a2e40'); }); if (n >= L.length && t % 0.8 < 0.5) { R(ctx, 292, 163, 5, 1, '#c8382e'); R(ctx, 293, 164, 3, 1, '#c8382e'); R(ctx, 294, 165, 1, 1, '#c8382e'); } });
  if (st === 'got') at(ox, 0, () => { const s = STAMPS[G.got.id], k = Math.min(1, G.got.t * 5), y = 22 - (1 - k) * 30; panel(74, y, 172, 38); ring(96, y + 19, s[1], true); txt(ctx, 'NEW STAMP!', 114, y + 8, '#c8382e', null, 2); txt(ctx, s[0], 114, y + 24, '#3a2e40'); });
  if (st === 'mini') { R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.6)'); at(ox, oy, () => { panel(44, 20, 232, 126); MG[G.mg.k].draw(G.mg); if (!TOUCH) txtC(ctx, 'ESC TO LEAVE', 160, 152, '#c8e0ec', '#1d1626'); }); }
  if (st === 'book') {
    R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.6)'); ctx.save(); ctx.translate(ox, oy); panel(8, 6, 304, 168); txtC(ctx, CITY.name + ' STAMP BOOK', 160, 12, '#c8382e', null, 2);
    STN.forEach(([id, name], i) => { const x = 18 + (i % 2) * 148, y = 30 + (i >> 1) * 32; txt(ctx, name, x, y, '#3a2e40'); if (i >> 1) R(ctx, x, y - 4, 136, 1, '#eadfc4'); Object.keys(STAMPS).filter(k => STAMPS[k][2] === id).forEach((k, j) => ringS(x + 12 + j * 24, y + 17, STAMPS[k][1], !!G.stamps[k])); });
    R(ctx, 18, 158, 284, 1, '#eadfc4'); txtC(ctx, 'STAMPS ' + count(G.stamps) + '/' + NST + '   FIGURES ' + count(G.figs) + '/6   CATS ' + count(G.cats) + '/' + CITY.cats, 160, 163, '#8a7a6a'); ctx.restore();
  }
  if (st === 'line') {
    R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.7)'); ctx.save(); ctx.translate(ox, oy); panel(20, 10, 280, 160); txtC(ctx, 'WHERE TO?', 160, 17, '#3f9a5a', null, 2); const L = G.line, n = STN.length, P = i => { const a = -1.5708 + i / n * 6.2832; return [160 + Math.cos(a) * 86, 92 + Math.sin(a) * 40]; };
    for (let k = 0; k < 120; k++) { const a = k / 120 * 6.2832; R(ctx, 160 + Math.cos(a) * 86 - 1, 92 + Math.sin(a) * 40 - 1, 3, 3, '#5aa85a'); }
    STN.forEach(([id, name], i) => { const [x, y] = P(i), on = i === L.sel, here = id === M.id, got = Object.keys(STAMPS).filter(k => STAMPS[k][2] === id), have = got.filter(k => G.stamps[k]).length; disc(ctx, x, y, on ? 6 : 4.5, '#1d1626'); disc(ctx, x, y, on ? 5 : 3.5, here ? '#f2c14e' : on ? '#e0452f' : '#fff8e8'); const ty = y + (Math.sin(-1.5708 + i / n * 6.2832) < -0.2 ? -19 : 8), txx = Math.max(26 + tw(name) / 2, Math.min(294 - tw(name) / 2, x + Math.cos(-1.5708 + i / n * 6.2832) * 22)); txtC(ctx, name, txx, ty, on ? '#c8382e' : '#3a2e40'); txtC(ctx, have + '/' + got.length, txx, ty + 7, have === got.length ? '#3f9a5a' : '#b8a888'); });
    ctx.drawImage(ICON.train, 153, 80); txtC(ctx, STN[L.sel][0] === M.id ? 'YOU ARE HERE' : 'TO ' + STN[L.sel][1], 160, 98, '#3a2e40'); txtC(ctx, '< >  CHOOSE     E  RIDE     ESC  BACK', 160, 160, '#8a7a6a'); ctx.restore();
  }
  if (st === 'title') { R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.5)'); ctx.save(); ctx.translate(ox, oy); txtO(ctx, GAME.title + ' ' + CITY.name, 160, 40, '#fff8e8', '#1d1626', 4); txtO(ctx, CITY.tagline, 160, 72, '#ffd98a', '#1d1626'); if (t % 1 < 0.65) txtO(ctx, TOUCH ? 'TAP TO START' : 'PRESS E TO START', 160, 102, '#fff8e8', '#1d1626', 2); txtO(ctx, TOUCH ? 'PAD TO WALK - E TO INTERACT - BOOK FOR STAMPS' : 'ARROWS/WASD WALK - E INTERACT - TAB BOOK - M MUSIC - F FULLSCREEN', 160, 156, '#fff8e8', '#1d1626'); if (G.hasSave) txtO(ctx, 'YOUR STAMPS ARE SAVED - N TO START OVER', 160, 166, '#c8e0ec', '#1d1626'); ctx.restore(); }
  if (G.fade > 0 && st !== 'title') { ctx.globalAlpha = G.fade; R(ctx, 0, 0, W, H, '#100c1c'); ctx.globalAlpha = 1; }
}

// ---------- boot ----------
(function boot() {
  buildIcons(); buildSprites(); if (CITY.sprites) CITY.sprites(); load();
  SPR.ride = (() => { const c = mk(320, 84), g = c.g, r = RNG(12); dgrad(g, 0, 0, 320, 84, ['#7ab8e8', '#a8d4f0', '#e8f0f8']); skyline(g, 0, 320, 70, 8, 40, '#a8b8d0', r); skyline(g, 0, 320, 84, 10, 34, '#6a7a98', r); return c; })();
  for (let i = 0; i < 30; i++) PRT.push({ x: Math.random() * (W + 60), y: Math.random() * H, vx: -9 - Math.random() * 9, vy: 7 + Math.random() * 9, ph: Math.random() * 6.283, c: i % 2 ? '#f9a8c8' : '#ffe0ec' });
  pl.F = plLook(G.fit);
  const q = new URLSearchParams(location.search);
  try {
    go(q.get('map') || G.dist); G.fade = 0; G.banner = 0;
    if (q.has('map') || q.has('x')) { G.state = 'play'; if (MAPS[q.get('map')].indoor) { G.back = { map: CITY.start, x: 70, y: 204 }; pl.x = 160; pl.y = 180; } if (q.has('x')) { pl.x = +q.get('x'); pl.y = +q.get('y'); } camSnap(); }
    if (q.get('st') === 'book') G.state = 'book'; if (q.get('st') === 'line') { G.state = 'line'; G.line = { sel: 2 }; } if (q.get('st') === 'ride') { G.state = 'ride'; G.ride = { to: 3, t: 1 }; }
    if (q.has('mini')) { G.state = 'mini'; G.mg = { k: q.get('mini'), sp: {}, t: +(q.get('mt') || 0) }; MG[G.mg.k].init(G.mg); }
    if (q.has('sim')) { const sr = RNG(+q.get('seed') || 1); for (let i = 0, n = +q.get('sim'); i < n; i++) { if (i % 50 === 0) { K.l = K.r = K.u = K.d = 0; K['lrud'[sr() * 4 | 0]] = 1; if (sr() < 0.4) K['lrud'[sr() * 4 | 0]] = 1; } if (i % 15 === 0) KP.a = 1; if (i % 400 === 399) KP.x = 1; update(1 / 60); } K.l = K.r = K.u = K.d = 0; }
  } catch (e) { G.err = String(e.stack || e); }
  let last = performance.now();
  function frame(now) {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
    try { if (!G.err) { update(dt); if (G.state === 'ride') drawRide(); else { drawWorld(); drawUI(); } } } catch (e) { console.error(e); G.err = String(e.stack || e); }
    if (G.err) { R(ctx, 0, 0, W, 60, '#400'); wrap(G.err.replace(/\s+/g, ' '), 300).slice(0, 7).forEach((l, i) => txt(ctx, l, 4, 4 + i * 7, '#fff')); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
