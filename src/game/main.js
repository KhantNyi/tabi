'use strict';
// ---------- runtime: walking, doors, trains between districts and cities, stamps, saving ----------
const GAME = { title: 'TABI', save: 'tabi' }; // the game's name lives here and nowhere else
const CLIST = Object.values(CITIES); // every city, in the order index.html loads them
let CITY = CITIES[new URLSearchParams(location.search).get('city')] || CLIST[0]; // the city you are in; go() keeps it in step with the map
const G = { state: 'title', t: 0, cx: 0, cy: 0, fade: 1, flash: 0, banner: 0, stamps: {}, figs: {}, fit: 0, cats: {}, cans: {}, tgt: null, fx: [], back: null, dist: CITY.start, hasSave: false };
const pl = { x: 70, y: 204, dir: 'd', mv: false, wt: 0, ph: 0, act: null }, PRT = [];
const FITS = ['#3fa7a0', '#f06a8c', '#f2c14e', '#8a6aff', '#3a3a4e', '#f4f1e6', '#e0563f', '#5aa85a', '#c8486a', '#4a6fa5', '#f0a8c0', '#5a8a6a'], KIMONO = 8, OBI = ['#f2c14e', '#f4f1e6', '#8a6aff', '#e8c070'], FITN = ['TEAL JACKET', 'PINK HOODIE', 'YELLOW RAINCOAT', 'PURPLE BOMBER', 'BLACK COAT', 'WHITE SHIRT', 'RED TRACK TOP', 'GREEN PARKA', 'RED KIMONO', 'INDIGO YUKATA', 'SAKURA KIMONO', 'MOSS KIMONO']; // from KIMONO on, rented in Kyoto
const plLook = i => LOOKS['pl' + i] || (LOOKS['pl' + i] = makeLook(Object.assign({}, PLAYER_LOOK, i >= KIMONO ? { robe: FITS[i], obi: OBI[i - KIMONO], shirt: FITS[i], pants: FITS[i], shoes: '#f4f1e6', pack: null } : { shirt: FITS[i] })));
// one save for the whole trip (older saves were kept per city under 'tabi-tokyo')
function save() { try { localStorage.setItem(GAME.save, JSON.stringify({ v: 2, stamps: G.stamps, figs: G.figs, fit: G.fit, cats: G.cats, cans: G.cans, dist: G.dist })); } catch (e) { } }
function load() { try { const s = JSON.parse(localStorage.getItem(GAME.save) || localStorage.getItem(GAME.save + '-' + CLIST[0].id)); if (s && s.stamps) { G.stamps = s.stamps; G.figs = s.figs || {}; G.fit = s.fit || 0; G.cats = s.cats || {}; G.cans = s.cans || {}; if (MAPS[s.dist]) G.dist = s.dist; G.hasSave = true; } } catch (e) { } }
const count = o => Object.keys(o).length, STAMPS = {}, SCITY = {}; for (const c of CLIST) for (const k in c.stamps) { STAMPS[k] = c.stamps[k]; SCITY[k] = c; }
const nst = c => count(c.stamps), got = c => Object.keys(c.stamps).filter(k => G.stamps[k]).length, catsIn = c => Object.keys(G.cats).filter(k => (MAPS[k.split(':')[0]] || {}).city === c.id).length;
const areas = c => c.areas || c.line; // the sections of a city's page in the stamp book
const SOON = [['kawaguchiko', 'MT FUJI'], ['kyoto', 'KYOTO'], ['osaka', 'OSAKA']].filter(c => !CITIES[c[0]]); // on the map, not built yet
const JPOS = { tokyo: [214, 44, 214, 26, 0], kawaguchiko: [164, 46, 164, 8, 0], kyoto: [70, 38, 50, 22, 0], osaka: [46, 58, 38, 54, -1], nara: [74, 62, 82, 59, 1] }; // dot x,y then label x,y,align on the Japan map
function build(id) {
  const d = MAPS[id]; newMap(id, d.tw || 20, d.th || 12, !!d.indoor); M.def = d; M.night = d.night; M.hs = []; M.vs = [];
  if (d.lay) d.lay(); if (!d.indoor) { blockTer(WA); paintGround(); } d.deco(); markRoads();
  M.OBJ.sort((a, b) => a.y - b.y); for (const [x, y, rx, ry] of M.SHD) ell(M.ground.g, x, y, rx, ry, d.indoor ? 'rgba(20,10,30,0.22)' : 'rgba(22,30,50,0.26)');
  return BUILT[id] = M;
}
// follow the player, stop at the map edges, and centre maps smaller than the view (rooms on a wide screen)
// lookUp: [y0, y1] on a map lifts the camera toward a view at the top of it (Fuji), fully above y0 and easing off by y1
const lookUp = () => { const L = M.def.lookUp; if (!L) return 0; const k = Math.max(0, Math.min(1, (L[1] - pl.y) / (L[1] - L[0]))); return k * k * (3 - 2 * k) * H * 0.26; };
const camX = () => M.w <= W ? (M.w - W) / 2 : Math.max(0, Math.min(M.w - W, pl.x - W / 2)), camY = () => M.h <= H ? (M.h - H) / 2 : Math.max(0, Math.min(M.h - H, pl.y - 12 - H / 2 - lookUp()));
const zoneAt = (x, y) => (M.def.zones || []).find(z => x >= z[0] && x < z[2] && y >= z[1] && y < z[3]) || null;
function camSnap() { G.cx = camX(); G.cy = camY(); }
function go(id, x, y, dir) {
  M = BUILT[id] || build(id); CITY = CITIES[M.def.city] || CITY; const st = M.st || [160, 182]; pl.x = x != null ? x : st[0]; pl.y = y != null ? y : st[1]; pl.dir = dir || 'd'; pl.mv = false; pl.act = null; G.fade = 1; G.tgt = null; G.fx = []; G.zn = zoneAt(pl.x, pl.y); G.zb = 0; camSnap();
  if (!M.indoor) { G.dist = id; G.banner = 3.5; save(); } else G.banner = 2.5; Snd.play(M.def.music || 'tokyo');
}
function step(e, dx, dy) { let m = false; if (dx && !hit(e.x + dx, e.y)) { e.x += dx; m = true; } if (dy && !hit(e.x, e.y + dy)) { e.y += dy; m = true; } return m; }
function say(e, s) { e.say = s; e.sayT = 1.6 + s.length * 0.05; Snd.fx('talk'); }
function dialog(lines, then) { G.state = 'dialog'; G.dlg = { lines, i: 0, t: 0, then }; }
function award(id) { if (G.stamps[id]) { G.state = 'play'; return; } G.stamps[id] = 1; G.state = 'got'; G.got = { id, t: 0 }; G.flash = 0.6; Snd.fx('stamp'); save(); }
function interact() {
  const t = G.tgt; if (!t) return;
  if (t.act) { t.act.use(t.act); return; }
  if (t.cat) { t.cat.purr = 1.2; G.fx.push({ x: t.cat.x, y: t.cat.y - 10, t: 0, icon: 'heart' }); Snd.fx('heart'); G.cats[t.cat.id ? M.id + ':' + t.cat.id : M.id] = 1; save(); return; }
  const sp = t.spot; if (!sp) { const n = t.npc; say(n, n.lines[n.li++ % n.lines.length]); return; }
  if (sp.door) { G.back = { map: M.id, x: pl.x, y: pl.y }; Snd.fx('page'); go(sp.door, 160, 182, 'u'); }
  else if (sp.train) { G.state = 'line'; G.line = { sel: (CITY.line.findIndex(s => s[0] === M.id) + 1) % CITY.line.length }; Snd.fx('page'); }
  else if (sp.shink) { G.state = 'japan'; G.jp = { sel: (CLIST.indexOf(CITY) + 1) % CLIST.length }; Snd.fx('page'); }
  else if (sp.fn) sp.fn(sp);
  else if (sp.mini) { G.state = 'mini'; G.mg = { k: sp.mini, sp, t: 0 }; MG[sp.mini].init(G.mg); Snd.fx('ui'); }
  else if (sp.act) { G.state = 'event'; G.ev = { sp, t: 0 }; pl.mv = false; pl.dir = sp.act === 'hold' ? 'd' : 'u'; }
  else { Snd.fx(sp.fx || 'ui'); dialog(sp.lines); }
}
function endMini(win, lines) { const sp = G.mg.sp; G.mg = null; G.state = 'play'; dialog(lines, win && sp.stamp ? () => award(sp.stamp) : null); }

function update(dt) {
  G.t += dt; if (G.fade > 0 && G.state !== 'title') G.fade = Math.max(0, G.fade - dt * 2); if (G.flash > 0) G.flash -= dt * 2; if (G.banner > 0) G.banner -= dt;
  if (KP.m) Snd.toggle();
  const st = G.state;
  if (G.photo) { const p = G.photo; p.t += dt; if (st !== 'event' && st !== 'dialog') p.out += dt; if (p.out > 0.35) G.photo = null; }
  if (TAP) { const tp = TAP; TAP = null; if (st === 'title' || st === 'dialog' || st === 'got') KP.a = 1; else if (st === 'book') { if (CLIST.length > 1 && tp.x < W * 0.28) KP.l = 1; else if (CLIST.length > 1 && tp.x > W * 0.72) KP.r = 1; else KP.b = 1; }
    else if (st === 'japan') { const i = jpHit(tp); if (i < 0) { if (!jpBox().inside(tp)) KP.x = 1; } else if (i === G.jp.sel) KP.a = 1; else { G.jp.sel = i; Snd.fx('ui'); } }
    else if (st === 'line') { const i = lineHit(tp); if (i < 0) { if (!lineBox().inside(tp)) KP.x = 1; } else if (i === G.line.sel) KP.a = 1; else { G.line.sel = i; Snd.fx('ui'); } } }
  if (st === 'title') { if (KP.n && G.hasSave) { G.stamps = {}; G.figs = {}; G.cats = {}; G.cans = {}; G.fit = 0; G.hasSave = false; pl.F = plLook(0); go(CLIST[0].start); G.banner = 0; Snd.fx('ui'); } else if (KP.a) { if (TOUCH) fullscreen(true); G.state = 'play'; G.banner = 3.5; G.fade = 0; Snd.play(M.def.music); Snd.fx('ui'); } }
  else if (st === 'play') {
    let dx = (K.r ? 1 : 0) - (K.l ? 1 : 0), dy = (K.d ? 1 : 0) - (K.u ? 1 : 0);
    if (JOY.on) { dx = JOY.x; dy = JOY.y; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } }
    pl.mv = !!(dx || dy);
    if (pl.mv) { if (JOY.on) { if (Math.abs(dx) > Math.abs(dy) * 1.15) pl.dir = dx < 0 ? 'l' : 'r'; else if (Math.abs(dy) > Math.abs(dx) * 1.15) pl.dir = dy < 0 ? 'u' : 'd'; } else { const h = dx < 0 ? 'l' : dx > 0 ? 'r' : null, v = dy < 0 ? 'u' : dy > 0 ? 'd' : null; if (pl.dir !== h && pl.dir !== v) pl.dir = h || v; if (dx && dy) { dx *= 0.7071; dy *= 0.7071; } } const w0 = pl.wt; if (!step(pl, dx * 72 * dt, dy * 72 * dt)) pl.mv = false; pl.wt += dt; if (pl.mv && Math.floor(pl.wt / 0.27) !== Math.floor(w0 / 0.27) && Snd.ctx) Snd.noise(Snd.ctx.currentTime, 0.035, 0.018, 500, 1600, Snd.sfx); } else pl.wt = 0;
    if (M.def.zones) { const z = zoneAt(pl.x, pl.y); if (z && z !== G.zn) { G.zn = z; if (G.banner <= 0) G.zb = 2.6; } if (G.zb > 0) G.zb -= dt; }
    if (M.indoor && pl.y > 188 && G.back) { const b = G.back; G.back = null; Snd.fx('page'); go(b.map, b.x, b.y, 'd'); G.banner = 0; }
    let best = null, bd = 1e9; const tryT = (x, y, r, o) => { const d = Math.hypot(x - pl.x, (y - pl.y) * 1.3); if (d < r && d < bd) { bd = d; best = o; } };
    for (const s of M.SPOTS) tryT(s.x, s.y, s.r, { spot: s, label: s.label });
    for (const n of M.ACT) { if (n.cat) tryT(n.x, n.y, 15, { cat: n, x: n.x, y: n.y + 12, label: 'PET' }); else if (n.use) tryT(n.x, n.y + 2, 17, { act: n, x: n.x, y: n.y + 10, label: n.label(n) }); else if (n.spot) tryT(n.x, n.y + 16, 22, { spot: n.spot, label: n.spot.label }); else if (n.lines) tryT(n.x, n.y, 20, { npc: n, x: n.x, y: n.y, label: 'TALK' }); }
    G.tgt = best; if (KP.a) interact(); else if (KP.b) { G.state = 'book'; G.bk = CLIST.indexOf(CITY); Snd.fx('page'); }
  } else if (st === 'event') {
    const ev = G.ev, sp = ev.sp, t0 = ev.t; ev.t += dt; const cross = s => t0 < s && ev.t >= s;
    if (sp.act === 'bow') { pl.act = (ev.t > 0.7 && ev.t < 1.2) || (ev.t > 1.5 && ev.t < 2) ? 'bow' : 'back'; if (cross(0.15)) Snd.fx('coin'); if (cross(0.35)) Snd.fx('bell'); if (cross(2.2) || cross(2.45)) Snd.fx('clap'); }
    else if (sp.act === 'snap') { pl.act = 'back'; if (cross(0.8)) { Snd.fx('shutter'); G.flash = 1; G.snapReq = sp; } }
    else { pl.act = ev.t > 0.3 ? 'cheer' : null; if (cross(0.4) || cross(1.1)) Snd.fx(sp.fx || 'munch'); }
    if (ev.t > (sp.act === 'bow' ? 2.9 : sp.act === 'snap' ? 2.3 : 1.9)) { pl.act = null; dialog(G.stamps[sp.stamp] ? [sp.lines[1]] : sp.lines, () => award(sp.stamp)); }
  } else if (st === 'dialog') {
    const d = G.dlg, L = d.lines[d.i]; d.t += dt; if (d.t * 42 < L.length && Math.floor(d.t * 14) !== Math.floor((d.t - dt) * 14)) Snd.fx('talk');
    if (KP.a || KP.x) { if (d.t * 42 < L.length) d.t = 99; else if (++d.i >= d.lines.length) { G.state = 'play'; G.dlg = null; if (d.then) d.then(); } else { d.t = 0; Snd.fx('ui'); } }
  } else if (st === 'got') { G.got.t += dt; pl.act = 'cheer'; pl.dir = 'd'; if (G.got.t > 2.6 || (G.got.t > 0.6 && KP.a)) { pl.act = null; G.state = 'play'; const c = SCITY[G.got.id]; if (got(c) === nst(c)) { Snd.fx('yay'); dialog(count(G.stamps) === count(STAMPS) && CLIST.length > 1 ? ['THAT IS EVERY STAMP ON THE WHOLE TRIP!', 'YOUR BOOK IS FULL. THE ROADS ARE STILL YOURS TO WANDER.'] : ['THAT IS EVERY STAMP IN ' + c.name + '!', 'IT IS STILL YOURS TO WANDER FOR AS LONG AS YOU LIKE.']); } } }
  else if (st === 'book') { const n = CLIST.length; if (n > 1 && (KP.l || KP.r)) { G.bk = (G.bk + (KP.r ? 1 : n - 1)) % n; Snd.fx('page'); } else if (KP.b || KP.a || KP.x) { G.state = 'play'; Snd.fx('page'); } }
  else if (st === 'mini') { G.mg.t += dt; const m = G.mg; MG[m.k].update(m, dt); if (G.mg === m && KP.x && m.k !== 'dress' && m.k !== 'vend') { G.mg = null; G.state = 'play'; } }
  else if (st === 'line') { const STN = CITY.line, n = STN.length, L = G.line; if (KP.u) { L.sel = (L.sel + n - 1) % n; Snd.fx('ui'); } if (KP.d) { L.sel = (L.sel + 1) % n; Snd.fx('ui'); } if (KP.l) { L.sel = (L.sel + n - 1) % n; Snd.fx('ui'); } if (KP.r) { L.sel = (L.sel + 1) % n; Snd.fx('ui'); } if (KP.x || KP.b) G.state = 'play'; else if (KP.a) { if (STN[L.sel][0] === M.id) G.state = 'play'; else { G.state = 'ride'; G.ride = { to: L.sel, t: 0 }; Snd.play(null); Snd.fx('train'); } } }
  else if (st === 'japan') { const n = CLIST.length, J = G.jp; if (KP.u || KP.l) { J.sel = (J.sel + n - 1) % n; Snd.fx('ui'); } if (KP.d || KP.r) { J.sel = (J.sel + 1) % n; Snd.fx('ui'); } if (KP.x || KP.b) G.state = 'play'; else if (KP.a) { if (CLIST[J.sel] === CITY) G.state = 'play'; else { G.state = 'ride'; G.ride = { city: CLIST[J.sel], t: 0, dur: 5.6 }; Snd.play(null); Snd.fx('train'); } } }
  else if (st === 'ride') { G.ride.t += dt; if (Math.floor(G.ride.t * 3.4) !== Math.floor((G.ride.t - dt) * 3.4) && Snd.ctx) { Snd.noise(Snd.ctx.currentTime, 0.05, 0.05, 150, 700, Snd.sfx); Snd.noise(Snd.ctx.currentTime + 0.09, 0.05, 0.04, 150, 700, Snd.sfx); } if (G.ride.t > (G.ride.dur || 3.4)) { const r = G.ride; G.state = 'play'; if (r.go) go(...r.go); else if (r.city) { go(r.city.hub || r.city.start); if (M.sk) { pl.x = M.sk[0]; pl.y = M.sk[1]; camSnap(); } } else go(CITY.line[r.to][0]); } }

  if (st !== 'ride' && st !== 'line' && st !== 'japan' && st !== 'mini') {
    for (const n of M.ACT) {
      if (n.sayT > 0) n.sayT -= dt; if (n.cat) { if (n.purr > 0) n.purr -= dt; continue; } if (n.upd) { n.upd(n, dt); continue; }
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
  const x = e.x - cx, y = e.y - cy; if (e.draw) { e.draw(e, x, y); return; }
  if (e.cat) { ell(ctx, x, y, 4.5, 1.5, 'rgba(22,40,44,0.3)'); ctx.drawImage(SPR.cat[e.k], snap(x - 7), snap(y - 12)); return; }
  ell(ctx, x, y, 6, 2, 'rgba(22,30,50,0.32)'); ctx.drawImage(frameOf(e), snap(x - 10), snap(y - 27));
}
function drawWorld() {
  const cx = snap(G.cx), cy = snap(G.cy), t = G.t;
  if (cx < 0 || cy < 0 || cx + W > M.w || cy + H > M.h) R(ctx, 0, 0, W, H, '#15101f');
  if (cx >= 0 && cy >= 0 && cx + W <= M.w && cy + H <= M.h) ctx.drawImage(M.ground, cx, cy, W, H, 0, 0, W, H); else ctx.drawImage(M.ground, -cx, -cy);
  if (G.state === 'play') for (const s of M.SPOTS) if (s.stamp && !G.stamps[s.stamp]) for (let k = 0; k < 10; k++) { const a = k * 0.6283 + t * 0.8; R(ctx, s.x - cx + Math.cos(a) * 9, s.y - cy - 1 + Math.sin(a) * 3.5, 1, U, k % 2 ? '#fff8e0' : '#ffd84a'); }
  const list = G.hidePl ? [] : [pl];
  for (const o of M.OBJ) { const dx = o.x - o.ox - cx, dy = o.y - o.oy - cy; if (dx < W + 2 && dy < H && dx + o.spr.lw > -2 && dy + o.spr.lh > 0) list.push(o); }
  for (const e of M.ACT) if (e.x - cx > -20 && e.x - cx < W + 20 && e.y - cy > -4 && e.y - cy < H + 30) list.push(e);
  for (const c of M.CARS) if (c.x - cx > -40 && c.x - cx < W + 40) list.push(c);
  list.sort((a, b) => a.y - b.y);
  for (const o of list) {
    if (o.F || o.cat || o.draw) { drawActor(o, cx, cy); continue; }
    if (o.v) { ell(ctx, o.x - cx, o.y - cy, 14, 2.5, 'rgba(22,30,50,0.35)'); ctx.drawImage(SPR.car[o.k][o.v > 0 ? 0 : 1], snap(o.x - cx - 16), snap(o.y - cy - 16)); continue; }
    const s = o.spr, dx = snap(o.x - o.ox - cx), dy = snap(o.y - o.oy - cy);
    if (o.split) { const off = snap(Math.sin(t * 1.1 + o.x * 0.031 + o.y * 0.017) * o.sw); ctx.drawImage(s, 0, 0, s.lw, o.split, dx + off, dy, s.lw, o.split); ctx.drawImage(s, 0, o.split, s.lw, s.lh - o.split, dx, dy + o.split, s.lw, s.lh - o.split); } else ctx.drawImage(s, dx, dy);
  }
  if (M.def.tint) { ctx.globalCompositeOperation = 'multiply'; R(ctx, 0, 0, W, H, M.def.tint); ctx.globalCompositeOperation = 'lighter'; for (const [x, y, r, c] of M.LIGHTS) { if (x - cx < -r || x - cx > W + r || y - cy < -r || y - cy > H + r) continue; ctx.drawImage(glowSpr(r, c), snap(x - cx - r), snap(y - cy - r)); } ctx.globalCompositeOperation = 'source-over'; }
  if (M.def.petals) for (const p of PRT) { R(ctx, p.x, p.y, 1.5, 1, p.c); p1(ctx, p.x + (Math.sin(t * 4 + p.ph) > 0 ? 1.5 : -U), p.y + U, p.c); }
  for (const f of G.fx) { ctx.globalAlpha = Math.max(0, 1 - f.t); ctx.drawImage(ICON[f.icon], snap(f.x - cx - ICON[f.icon].lw / 2), snap(f.y - cy - 8 - f.t * 14)); ctx.globalAlpha = 1; }
  if (G.state === 'event' && G.ev.sp.act === 'hold' && G.ev.t > 0.3) ctx.drawImage(ICON[STAMPS[G.ev.sp.stamp][1]], snap(pl.x - cx - 7), snap(pl.y - cy - 46 + Math.sin(t * 6)));
  if (G.state === 'play') for (const s of M.SPOTS.concat(M.ACT.filter(n => n.spot).map(n => ({ x: n.x, y: n.y - 4, stamp: n.spot.stamp, door: 0 })))) {
    const x = s.x - cx, st = s.stamp && !G.stamps[s.stamp]; if (!st && !s.door && !s.train && !s.shink) continue; const y = s.y - cy - (s.door || s.train || s.shink ? 30 : 36) + Math.round(Math.abs(Math.sin(t * 3 + s.x)) * 3), c = st ? '#ffd84a' : s.train ? '#5ad88a' : s.shink ? '#6ab8f0' : '#fff8e8';
    if (x < -10 || x > W + 10 || y < -10 || y > H) continue; R(ctx, x - 2.5, y - 5, 5, 5, '#1d1626'); R(ctx, x - 3.5, y, 7, 1.5, '#1d1626'); R(ctx, x - 2.5, y + 1.5, 5, 1, '#1d1626'); R(ctx, x - 1.5, y + 2.5, 3, 1, '#1d1626'); R(ctx, x - 0.5, y + 3.5, 1, 1, '#1d1626'); R(ctx, x - 1.5, y - 4, 3, 5, c); R(ctx, x - 2.5, y + 0.5, 5, 1, c); R(ctx, x - 1.5, y + 1.5, 3, 1, c); R(ctx, x - 0.5, y + 2.5, 1, 1, c);
  }
  if (!G.hidePl) for (const n of M.ACT) if (n.sayT > 0) { const ls = wrap(n.say, 110), w = Math.max(...ls.map(l => tw(l))) + 8, h = ls.length * 7 + 6, x = Math.max(2, Math.min(W - w - 2, n.x - cx - w / 2)), y = Math.max(2, n.y - cy - 32 - h); panel(x, y, w, h); ls.forEach((l, i) => txt(ctx, l, x + 4, y + 4 + i * 7, '#3a2e40')); }
}
// ---------- photos ----------
// When the shutter goes, the world is drawn once more without you in it and the view in front of you is copied onto a card.
// A spot can aim the frame (aim() gives the centre x and top y on screen), or paint the picture itself (photo(g, w, h)).
const CARD_Y = () => TOUCH ? 30 : 6; // the card's top; it is sized so the dialog box under it never covers the caption
function takePhoto(sp) {
  const room = H - 42 - (TOUCH && H > W ? 110 : 8) - 30 - CARD_Y(), ph = Math.round(Math.min(106, room)), pw = Math.round(Math.min(160, W - 28, ph * 1.52)), c = mk(pw, ph);
  if (sp.photo) sp.photo(c.g, pw, ph);
  else {
    G.hidePl = true; drawWorld(); G.hidePl = false;
    const a = sp.aim ? sp.aim() : [pl.x - snap(G.cx), pl.y - snap(G.cy) + 10 - ph];
    const x = Math.round(Math.max(0, Math.min(W - pw, a[0] - pw / 2))), y = Math.round(Math.max(0, Math.min(H - ph, a[1])));
    _di.call(c.g, cv, x * S, y * S, pw * S, ph * S, 0, 0, pw, ph);
  }
  const d = new Date(), two = n => String(n).padStart(2, '0'), st = STAMPS[sp.stamp], title = st ? st[0] : sp.label || '';
  let place = (G.zn && !M.indoor ? G.zn[4] : M.def.name).split(' - ')[0]; if (place === title) place = M.def.name === title ? CITY.name : M.def.name;
  G.photo = { img: c, t: 0, out: 0, title, place, date: "'" + two(d.getFullYear() % 100) + ' ' + two(d.getMonth() + 1) + ' ' + two(d.getDate()) };
}
// the card: an instant photo that drops in, develops out of a cream haze, and carries a caption and an orange date print
function drawPhoto() {
  const p = G.photo, img = p.img, pw = img.lw, ph = img.lh, cw = pw + 10, ch = ph + 27, k = Math.min(1, p.t / 0.4), o = Math.min(1, p.out / 0.35);
  const e = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2), x = Math.round((W - cw) / 2), y = Math.round(CARD_Y() - (1 - e) * 26 + o * o * 40);
  const a = Math.min(1, k * 3) * (1 - o); if (a <= 0) return; ctx.globalAlpha = a;
  R(ctx, x + 2, y + 3, cw, ch, 'rgba(16,12,28,0.4)'); R(ctx, x, y, cw, ch, '#fbf6ea'); R(ctx, x, y, cw, U, '#ffffff'); R(ctx, x, y + ch - 1, cw, 1, '#d9cba8'); R(ctx, x + cw - U, y, U, ch, '#e4d8bc');
  R(ctx, x + 5 - U, y + 5 - U, pw + 2 * U, ph + 2 * U, '#3a2e40'); ctx.drawImage(img, x + 5, y + 5);
  const dv = Math.max(0, Math.min(1, 1 - (p.t - 0.25) / 1.5)); // develops: the haze lifts, the darks come through first
  if (dv > 0) { ctx.globalAlpha = a * dv; R(ctx, x + 5, y + 5, pw, ph, '#ece2c6'); ctx.globalAlpha = a * dv * 0.5; R(ctx, x + 5, y + 5, pw, ph, '#8aa0b4'); ctx.globalAlpha = a; }
  if (dv < 0.4) { ctx.globalAlpha = a * Math.min(1, (0.4 - dv) * 4); txt(ctx, p.date, x + 5 + pw - tw(p.date) - 4, y + 5 + ph - 9, '#ff9a3a', '#5a2410'); ctx.globalAlpha = a; }
  txtC(ctx, p.title, x + cw / 2, y + ph + 10, '#3a2e40'); txtC(ctx, p.place, x + cw / 2, y + ph + 18, '#a89878');
  const tx = x + cw / 2 - 13, ty = y - 4; ctx.globalAlpha = a * 0.85; R(ctx, tx, ty, 26, 9, '#f2a8c0'); for (let i = 0; i < 26; i += 3) R(ctx, tx + i, ty + 2, 1.5, 5, '#f8c8d8'); for (let j = 0; j < 9; j += 2) { R(ctx, tx - U, ty + j, U, 1, '#f2a8c0'); R(ctx, tx + 26, ty + j + 1, U, 1, '#f2a8c0'); }
  ctx.globalAlpha = 1;
}
function ringS(cx, cy, icon, on) { if (on) { disc(ctx, cx, cy, 9, '#c8382e'); disc(ctx, cx, cy, 8, '#f8f0dc'); ctx.drawImage(stampOf(icon), cx - 7, cy - 7); } else { disc(ctx, cx, cy, 9, '#d9cba8'); disc(ctx, cx, cy, 8, '#f8f0dc'); txt(ctx, '?', cx - 1, cy - 2, '#d9cba8'); } }
function drawRide() {
  const r = G.ride, t = r.t, ox = Math.floor((W - W0) / 2), oy = Math.floor((H - H0) / 2); R(ctx, 0, 0, W, H, '#2a2a3a'); R(ctx, 0, oy + 122, W, H, '#3f7a5a'); R(ctx, 0, oy + 122, W, 2, '#5aa85a'); for (let x = ((ox + 30) % 44) - 44; x < W; x += 44) { R(ctx, x, oy + 6, 1, 14, '#c8c0d4'); disc(ctx, x + 0.5, oy + 24 + Math.sin(G.t * 3 + x), 4, '#f4f1e6'); disc(ctx, x + 0.5, oy + 24 + Math.sin(G.t * 3 + x), 2.5, '#2a2a3a'); }
  ctx.save(); ctx.translate(ox, oy); ctx.save(); ctx.beginPath(); ctx.rect(20, 34, 280, 84); ctx.clip();
  const s = r.spr || (r.city ? SPR.ride2 : SPR.ride), o = (G.t * (r.speed || (r.city ? 46 : 150))) % 320; ctx.drawImage(s, o, 0, 320, 84, 20, 34, 320, 84); ctx.drawImage(s, o - 320, 0, 320, 84, 20, 34, 320, 84); for (let x = 300 - (G.t * (r.city ? 760 : 420)) % (r.city ? 150 : 90); x > 0; x -= r.city ? 150 : 90) R(ctx, x, 34, 3, 84, '#3a3a4e'); ctx.restore();
  for (const x of [20, 112, 206, 298]) R(ctx, x - 2, 30, 4, 92, '#c8c0d4'); R(ctx, 16, 30, 288, 4, '#c8c0d4'); R(ctx, 16, 118, 288, 4, '#c8c0d4');
  panel(70, 136, 180, 32); txtC(ctx, r.label || (r.city ? 'SHINKANSEN TO' : 'NEXT STOP'), 160, 142, '#8a7a6a'); txtC(ctx, r.name || (r.city ? r.city.name : CITY.line[r.to][1]), 160, 152, r.city || r.go ? '#3f7ab0' : '#3f9a5a', null, 2); ctx.restore();
  const dur = r.dur || 3.4, a = t < 0.4 ? 1 - t / 0.4 : t > dur - 0.4 ? (t - dur + 0.4) / 0.4 : 0; if (a > 0) { ctx.globalAlpha = Math.min(1, a); R(ctx, 0, 0, W, H, '#100c1c'); ctx.globalAlpha = 1; }
}
// the train line as a list (narrow screens) and which row a tap hit; on wide screens a tap on a stop's name picks it
const shinkHint = () => { const h = CLIST.length > 1 && CITY.line.find(s => s[0] === CITY.hub); return !h ? null : M.id === CITY.hub ? ['OTHER CITIES: SHINKANSEN', 'BLUE SIGN BY THIS STATION'] : ['OTHER CITIES: SHINKANSEN', 'FROM ' + h[1]]; };
function lineBox() { const STN = CITY.line, w = W < W0 ? W - 24 : 280, h = W < W0 ? 44 + STN.length * 24 + (shinkHint() ? 18 : 0) : 160, x = Math.floor((W - w) / 2), y = Math.max(4, Math.floor((H - h) / 2)); return { x, y, w, h, inside: p => p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h }; }
function lineHit(p) {
  const b = lineBox(), n = CITY.line.length;
  if (W < W0) { const i = Math.floor((p.y - b.y - 26) / 24); return p.x >= b.x && p.x <= b.x + b.w && i >= 0 && i < n ? i : -1; }
  const ox = Math.floor((W - W0) / 2), oy = Math.floor((H - H0) / 2); let best = -1, bd = 22;
  for (let i = 0; i < n; i++) { const a = -1.5708 + i / n * 6.2832, x = ox + 160 + Math.cos(a) * 86, y = oy + 92 + Math.sin(a) * 40, d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = i; } }
  return best;
}
// the map of Japan you pick a city from: a list on narrow screens, a map otherwise
const jpRows = () => CLIST.map(c => [c.id, c.name, c]).concat(SOON);
function jpBox() { const w = W < W0 ? W - 24 : 280, h = W < W0 ? 44 + jpRows().length * 24 : 160, x = Math.floor((W - w) / 2), y = Math.max(4, Math.floor((H - h) / 2)); return { x, y, w, h, inside: p => p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h }; }
function jpHit(p) {
  const b = jpBox(), n = CLIST.length;
  if (W < W0) { const i = Math.floor((p.y - b.y - 26) / 24); return p.x >= b.x && p.x <= b.x + b.w && i >= 0 && i < n ? i : -1; }
  let best = -1, bd = 24; CLIST.forEach((c, i) => { const q = JPOS[c.id], d = Math.hypot(p.x - (b.x + 8 + q[0]), p.y - (b.y + 20 + q[1])); if (d < bd) { bd = d; best = i; } }); return best;
}
function at(dx, dy, fn) { ctx.save(); ctx.translate(dx, dy); fn(); ctx.restore(); }
function drawUI() {
  const st = G.state, t = G.t, ox = Math.floor((W - W0) / 2), oy = Math.floor((H - H0) / 2);
  if (G.photo) drawPhoto();
  if (G.flash > 0) { ctx.globalAlpha = Math.min(1, G.flash); R(ctx, 0, 0, W, H, '#ffffff'); ctx.globalAlpha = 1; }
  if (st === 'play') { panel(4, 4, 44, 15); ctx.drawImage(stampOf('torii'), 6, 4.5); txt(ctx, got(CITY) + '/' + nst(CITY), 21, 9, '#c8382e'); const hd = CITY.hud && CITY.hud(); if (hd) { const w = 18 + tw(hd[1]); panel(51, 4, w, 15); ctx.drawImage(ICON[hd[0]], 53, 4.5); txt(ctx, hd[1], 67, 9, '#3a2e40'); } if (!M.indoor) { const nm = G.zn ? G.zn[4] : M.def.name; if (TOUCH) txt(ctx, nm, 5, 22, '#fff8e8', '#1d1626'); else txt(ctx, nm, W - 5 - tw(nm), 7, '#fff8e8', '#1d1626'); } }
  if (st === 'play' && G.zb > 0 && G.zn) { const z = G.zn, a = Math.max(0, Math.min(1, G.zb, (2.6 - G.zb) * 3)), w = Math.max(tw(z[4], 2), tw(z[5])) + 20, x = Math.floor((W - w) / 2), y = TOUCH ? 34 : 26; ctx.globalAlpha = a; panel(x, y, w, 26); txtC(ctx, z[4], W / 2, y + 5, '#c8382e', null, 2); txtC(ctx, z[5], W / 2, y + 17, '#8a7a6a'); ctx.globalAlpha = 1; }
  if (st === 'play' && G.tgt) { const g = G.tgt, w = tw('E') + 9 + tw(g.label), ax = g.x != null ? g.x : pl.x, ay = g.x != null ? g.y : pl.y, x = Math.max(3, Math.min(W - w - 3, ax - snap(G.cx) - w / 2)), y = Math.max(TOUCH ? 32 : 22, ay - snap(G.cy) - 43); const kw = keycap(x, y, 'E'); txt(ctx, g.label, x + kw + 3, y + 2, '#fff8e8', '#1d1626'); }
  if (st === 'play' && G.banner > 0) { const a = Math.min(1, G.banner, (3.5 - G.banner) * 2 + 0.3); ctx.globalAlpha = Math.max(0, Math.min(1, a)); R(ctx, 0, 60, W, M.def.sub ? 30 : 20, 'rgba(29,22,38,0.75)'); txtC(ctx, M.def.name, W / 2, 65, '#fff8e8', '#1d1626', 2); if (M.def.sub) txtC(ctx, M.def.sub, W / 2, 80, '#ffd98a', null); ctx.globalAlpha = 1; }
  if (st === 'dialog') { const d = G.dlg, L = d.lines[d.i], n = Math.floor(d.t * 42), dw = Math.min(288, W - 12), ls = wrap(L, dw - 20), dh = Math.max(42, ls.length * 9 + 16), dx = Math.floor((W - dw) / 2), dy = H - dh - (TOUCH && H > W ? 110 : 8);
    panel(dx, dy, dw, dh); ls.forEach((l, i, a) => { const before = a.slice(0, i).join(' ').length + (i ? 1 : 0); txt(ctx, l.slice(0, Math.max(0, n - before)), dx + 10, dy + 8 + i * 9, '#3a2e40'); });
    if (n >= L.length && t % 0.8 < 0.5) { const ax = dx + dw - 12, ay = dy + dh - 9; R(ctx, ax, ay, 5, 1, '#c8382e'); R(ctx, ax + 1, ay + 1, 3, 1, '#c8382e'); R(ctx, ax + 2, ay + 2, 1, 1, '#c8382e'); } }
  if (st === 'got') at(ox, TOUCH ? 14 : 0, () => { const s = STAMPS[G.got.id], k = Math.min(1, G.got.t * 5), y = 22 - (1 - k) * 30; panel(74, y, 172, 38); ring(96, y + 19, s[1], true); txt(ctx, 'NEW STAMP!', 114, y + 8, '#c8382e', null, 2); txt(ctx, s[0], 114, y + 24, '#3a2e40'); });
  if (st === 'mini') { R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.6)'); at(ox, oy, () => { panel(44, 20, 232, 126); MG[G.mg.k].draw(G.mg); if (!TOUCH) txtC(ctx, 'ESC TO LEAVE', 160, 152, '#c8e0ec', '#1d1626'); }); }
  if (st === 'book') {
    const BC = CLIST[G.bk] || CITY, AR = areas(BC), many = CLIST.length > 1, head = (many ? '< ' : '') + BC.name + ' STAMP BOOK' + (many ? ' >' : ''), foot = 'STAMPS ' + got(BC) + '/' + nst(BC) + '  FIGURES ' + count(G.figs) + '/6  CATS ' + catsIn(BC) + '/' + BC.cats + '  CANS ' + count(G.cans) + '/' + DRINKS.length, keys = k => Object.keys(BC.stamps).filter(q => BC.stamps[q][2] === k);
    R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.6)');
    if (W < W0) {
      const bw = W - 12, bh = 52 + AR.length * 22 + (many ? 9 : 0), bx = 6, by = Math.max(4, Math.floor((H - bh) / 2)); panel(bx, by, bw, bh); txtC(ctx, BC.name + ' STAMP BOOK', W / 2, by + 7, '#c8382e', null, tw(BC.name + ' STAMP BOOK', 2) > bw - 12 ? 1 : 2);
      AR.forEach(([id, name], i) => { const y = by + 28 + i * 22; if (i) R(ctx, bx + 8, y - 3, bw - 16, 1, '#eadfc4'); txt(ctx, name, bx + 9, y + 6, '#3a2e40'); keys(id).forEach((k, j) => ringS(bx + bw - 15 - j * 20, y + 8, STAMPS[k][1], !!G.stamps[k])); });
      txtC(ctx, foot, W / 2, by + bh - (many ? 23 : 14), '#8a7a6a'); if (many) txtC(ctx, '< TAP THE SIDES TO TURN THE PAGE >', W / 2, by + bh - 13, '#b8a888');
    } else at(ox, oy, () => {
      panel(8, 6, 304, 168); txtC(ctx, head, 160, 12, '#c8382e', null, 2); const rh = AR.length > 8 ? 26 : 32;
      AR.forEach(([id, name], i) => { const x = 18 + (i % 2) * 148, y = 30 + (i >> 1) * rh; txt(ctx, name, x, y, '#3a2e40'); if (i >> 1) R(ctx, x, y - 4, 136, 1, '#eadfc4'); keys(id).forEach((k, j) => ringS(x + 12 + j * 24, y + 17, STAMPS[k][1], !!G.stamps[k])); });
      R(ctx, 18, 158, 284, 1, '#eadfc4'); txtC(ctx, foot.replace(/  /g, '   ') + (many ? '      ' + (CLIST.indexOf(BC) + 1) + '/' + CLIST.length : ''), 160, 163, '#8a7a6a');
    });
  }
  if (st === 'japan') {
    const J = G.jp, b = jpBox(), rows = jpRows(), sel = CLIST[J.sel], here = sel === CITY; R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.7)'); panel(b.x, b.y, b.w, b.h); txtC(ctx, 'SHINKANSEN', W / 2, b.y + 7, '#3f7ab0', null, 2);
    if (W < W0) {
      for (let k = 0; k < rows.length - 1; k++) R(ctx, b.x + 15, b.y + 36 + k * 24, 2, 24, k < CLIST.length - 1 ? '#3f7ab0' : '#c8c0d4');
      rows.forEach(([id, name, c], i) => { const y = b.y + 26 + i * 24, on = i === J.sel, hr = c === CITY; if (on) R(ctx, b.x + 4, y, b.w - 8, 20, '#dcecf8'); disc(ctx, b.x + 16, y + 10, on ? 5.5 : 4.5, c ? '#1d1626' : '#b8b0c0'); disc(ctx, b.x + 16, y + 10, on ? 4.5 : 3.5, hr ? '#f2c14e' : on ? '#e0452f' : '#fff8e8');
        txt(ctx, name, b.x + 28, y + 5, !c ? '#b8a888' : on ? '#c8382e' : '#3a2e40'); txt(ctx, !c ? 'COMING SOON' : hr ? 'YOU ARE HERE' : got(c) + '/' + nst(c) + ' STAMPS', b.x + 28, y + 12, !c ? '#c8c0b0' : hr ? '#e08a1a' : got(c) === nst(c) ? '#3f9a5a' : '#b8a888'); });
      txtC(ctx, here ? TOUCH ? 'TAP AGAIN TO STAY' : 'E TO STAY' : TOUCH ? 'TAP AGAIN TO RIDE' : 'E TO RIDE', W / 2, b.y + b.h - 12, '#8a7a6a');
    } else at(b.x + 8, b.y + 20, () => {
      ctx.drawImage(SPR.japan, 0, 0);
      rows.forEach(([id, name, c], i) => { const q = JPOS[id]; if (!q) return; const [x, y, lx, ly, al] = q, on = i === J.sel, hr = c === CITY, sub = !c ? 'SOON' : got(c) + '/' + nst(c), tx = s2 => al < 0 ? lx - tw(s2) : al > 0 ? lx : lx - tw(s2) / 2;
        if (on) { const r = 8 + Math.sin(t * 5) * 1.2; disc(ctx, x, y, r, 'rgba(255,255,255,0.45)'); } disc(ctx, x, y, on ? 5.5 : 4, c ? '#1d1626' : '#7a8a98'); disc(ctx, x, y, on ? 4.5 : 3, hr ? '#f2c14e' : on ? '#e0452f' : c ? '#fff8e8' : '#c8d4dc');
        txt(ctx, name, tx(name), ly, !c ? '#5a7a8a' : on ? '#c8382e' : '#2a2430', '#f8f4e8'); txt(ctx, sub, tx(sub), ly + 7, !c ? '#6a8a9a' : got(c) === nst(c) ? '#2a7a4a' : '#5a5068', '#f8f4e8'); });
      txtC(ctx, here ? 'YOU ARE HERE' : 'TO ' + sel.name + ' - ' + sel.tagline, 132, 119, '#3a2e40'); txtC(ctx, '< >  CHOOSE     E  RIDE     ESC  BACK', 132, 129, '#8a7a6a');
    });
  }
  if (st === 'line' && W < W0) {
    const L = G.line, b = lineBox(), STN = CITY.line; R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.7)'); panel(b.x, b.y, b.w, b.h); txtC(ctx, 'WHERE TO?', W / 2, b.y + 7, '#3f9a5a', null, 2);
    for (let k = 0; k < STN.length - 1; k++) R(ctx, b.x + 15, b.y + 36 + k * 24, 2, 24, '#5aa85a');
    STN.forEach(([id, name], i) => { const y = b.y + 26 + i * 24, on = i === L.sel, here = id === M.id, got = Object.keys(STAMPS).filter(k => STAMPS[k][2] === id), have = got.filter(k => G.stamps[k]).length;
      if (on) R(ctx, b.x + 4, y, b.w - 8, 20, '#f2e2c0'); disc(ctx, b.x + 16, y + 10, on ? 5.5 : 4.5, '#1d1626'); disc(ctx, b.x + 16, y + 10, on ? 4.5 : 3.5, here ? '#f2c14e' : on ? '#e0452f' : '#fff8e8');
      txt(ctx, name, b.x + 28, y + 5, on ? '#c8382e' : '#3a2e40'); txt(ctx, here ? 'YOU ARE HERE' : have + '/' + got.length + ' STAMPS', b.x + 28, y + 12, here ? '#e08a1a' : have === got.length ? '#3f9a5a' : '#b8a888'); });
    txtC(ctx, STN[L.sel][0] === M.id ? TOUCH ? 'TAP AGAIN TO STAY' : 'E TO STAY' : TOUCH ? 'TAP AGAIN TO RIDE' : 'E TO RIDE', W / 2, b.y + b.h - 12, '#8a7a6a'); const sh = shinkHint(); if (sh) { txtC(ctx, sh[0], W / 2, b.y + b.h - 30, '#3f7ab0'); txtC(ctx, sh[1], W / 2, b.y + b.h - 23, '#3f7ab0'); }
  } else if (st === 'line') {
    R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.7)'); ctx.save(); ctx.translate(ox, oy); panel(20, 10, 280, 160); txtC(ctx, 'WHERE TO?', 160, 17, '#3f9a5a', null, 2); const L = G.line, STN = CITY.line, n = STN.length, P = i => { const a = -1.5708 + i / n * 6.2832; return [160 + Math.cos(a) * 86, 92 + Math.sin(a) * 40]; };
    for (let k = 0; k < 120; k++) { const a = k / 120 * 6.2832; R(ctx, 160 + Math.cos(a) * 86 - 1, 92 + Math.sin(a) * 40 - 1, 3, 3, '#5aa85a'); }
    STN.forEach(([id, name], i) => { const [x, y] = P(i), on = i === L.sel, here = id === M.id, got = Object.keys(STAMPS).filter(k => STAMPS[k][2] === id), have = got.filter(k => G.stamps[k]).length; disc(ctx, x, y, on ? 6 : 4.5, '#1d1626'); disc(ctx, x, y, on ? 5 : 3.5, here ? '#f2c14e' : on ? '#e0452f' : '#fff8e8'); const ty = y + (Math.sin(-1.5708 + i / n * 6.2832) < -0.2 ? -19 : 8), txx = Math.max(26 + tw(name) / 2, Math.min(294 - tw(name) / 2, x + Math.cos(-1.5708 + i / n * 6.2832) * 22)); txtC(ctx, name, txx, ty, on ? '#c8382e' : '#3a2e40'); txtC(ctx, have + '/' + got.length, txx, ty + 7, have === got.length ? '#3f9a5a' : '#b8a888'); });
    ctx.drawImage(ICON.train, 153, 80); txtC(ctx, STN[L.sel][0] === M.id ? 'YOU ARE HERE' : 'TO ' + STN[L.sel][1], 160, 98, '#3a2e40'); const sh = shinkHint(); if (sh) { txtC(ctx, sh[0], 160, 109, '#3f7ab0'); txtC(ctx, sh[1], 160, 116, '#3f7ab0'); } txtC(ctx, '< >  CHOOSE     E  RIDE     ESC  BACK', 160, 160, '#8a7a6a'); ctx.restore();
  }
  if (st === 'title') { R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.5)'); ctx.save(); ctx.translate(ox, oy); txtO(ctx, GAME.title + ' ' + CITY.name, 160, 40, '#fff8e8', '#1d1626', 4); txtO(ctx, CITY.tagline, 160, 72, '#ffd98a', '#1d1626'); if (t % 1 < 0.65) txtO(ctx, TOUCH ? 'TAP TO START' : 'PRESS E TO START', 160, 102, '#fff8e8', '#1d1626', 2); txtO(ctx, TOUCH ? 'DRAG LEFT SIDE TO WALK - E TO INTERACT' : 'ARROWS/WASD WALK - E INTERACT - TAB BOOK - M MUSIC - F FULLSCREEN', 160, 156, '#fff8e8', '#1d1626'); if (G.hasSave) txtO(ctx, TOUCH ? 'YOUR STAMPS ARE SAVED' : 'YOUR STAMPS ARE SAVED - N TO START OVER', 160, 166, '#c8e0ec', '#1d1626'); ctx.restore(); }
  if (G.fade > 0 && st !== 'title') { ctx.globalAlpha = G.fade; R(ctx, 0, 0, W, H, '#100c1c'); ctx.globalAlpha = 1; }
}

// ---------- boot ----------
(function boot() {
  buildIcons(); buildSprites(); for (const c of CLIST) { if (c.sprites) c.sprites(); Object.assign(MG, c.minis || {}); } load();
  SPR.ride = (() => { const c = mk(320, 84), g = c.g, r = RNG(12); dgrad(g, 0, 0, 320, 84, ['#7ab8e8', '#a8d4f0', '#e8f0f8']); skyline(g, 0, 320, 70, 8, 40, '#a8b8d0', r); skyline(g, 0, 320, 84, 10, 34, '#6a7a98', r); return c; })();
  // the countryside from the shinkansen window, and the map of central Japan you pick a city on
  SPR.ride2 = (() => { const c = mk(320, 84), g = c.g, r = RNG(31); dgrad(g, 0, 0, 320, 84, ['#8ac4f0', '#b8dcf4', '#f0f4f0']); for (const [x, y, w] of [[40, 14, 26], [250, 20, 34], [150, 8, 18]]) { ell(g, x, y, w, 4, '#ffffff'); ell(g, x + w * 0.3, y - 3, w * 0.5, 4, '#ffffff'); } mountain(g, 205, 62, 74, 50, '#7a8ac0', r, '#f8f4ee'); for (let x = -20; x < 340; x += 38) ell(g, x + r() * 20, 64, 34 + r() * 16, 10 + r() * 6, '#6a9a78'); for (let x = -10; x < 330; x += 26) ell(g, x + r() * 14, 68, 22, 7, '#5a8a5a'); R(g, 0, 64, 320, 20, '#8fc97a'); for (let y = 66; y < 84; y += 3) R(g, 0, y, 320, U, '#64b054'); for (let x = 0; x < 320; x += 40) { R(g, x + 12, 70, 14, 14, y2(x)); } function y2(x) { return x % 80 ? '#c8d85a' : '#74bf5e'; } for (const x of [60, 96, 232, 290]) { R(g, x, 58, 12, 8, '#f4eedc'); roof(g, x + 6, 53, 3, 9, 5, '#4a4660'); R(g, x + 4, 61, 3, 5, '#6a4638'); } for (let x = 8; x < 320; x += 64) { R(g, x, 46, 1, 20, '#6b6478'); R(g, x - 3, 48, 7, 1, '#6b6478'); } return c; })();
  SPR.japan = (() => { const c = mk(264, 112), g = c.g, L = '#9ccf7e', D = '#5a9a5a', SEA = ['#6ab4e0', '#7ac0e8', '#8accf0'], land = [[52, 36, 46, 34], [68, 84, 26, 26], [132, 28, 60, 34], [216, 30, 44, 32], [240, 64, 12, 18], [172, 70, 7, 13]], seas = [[110, 66, 10, 12], [30, 70, 12, 12], [222, 60, 6, 10], [78, 22, 4, 8], [2, 78, 26, 16]];
    dgrad(g, 0, 0, 264, 112, SEA); for (let y = 4; y < 112; y += 7) for (let x = (y * 5) % 23; x < 264; x += 23) R(g, x, y, 4, U, '#b0e0f8');
    R(g, 0, 0, 264, 24, D); for (const [x, y, a, b] of land) ell(g, x, y, a + 1.5, b + 1.5, D); R(g, 0, 0, 264, 22.5, L); for (const [x, y, a, b] of land) ell(g, x, y, a, b, L);
    for (const [x, y, a, b] of seas) { ell(g, x, y, a + 1.5, b + 1.5, D); ell(g, x, y, a, b, SEA[1]); }
    const r = RNG(9); for (let i = 0; i < 60; i++) { const x = 8 + r() * 250, y = 2 + r() * 60; if ((x > 96 && x < 196 && y < 44) || r() < 0.12) { R(g, x - 2, y + 2, 5, 1, '#6aa85a'); R(g, x - 1, y + 1, 3, 1, '#6aa85a'); R(g, x, y, 1, 1, '#7ab86a'); } }
    for (let i = 0; i < 16; i++) { const w = i * 0.85; R(g, 164 - w, 22 + i, w * 2 + 1, 1, i < 5 ? '#f8f4ee' : '#7a8ac0'); } R(g, 160, 27, 2, 1, '#f8f4ee'); R(g, 166, 27, 2, 1, '#f8f4ee');
    const way = (pts, col) => { for (let k = 1; k < pts.length; k++) { const [ax, ay] = pts[k - 1], [bx, by] = pts[k], n = Math.hypot(bx - ax, by - ay) / 3 | 0; for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n; R(g, x - 0.5, y - 0.5, 1.5, 1.5, col); } } };
    way([[214, 44], [198, 58], [170, 62], [140, 60], [112, 48], [70, 38], [46, 58]], '#3f5a9a'); way([[70, 38], [74, 62]], '#3f5a9a'); way([[170, 62], [164, 46]], '#3f5a9a'); return c; })();
  for (let i = 0; i < 30; i++) PRT.push({ x: Math.random() * (W + 60), y: Math.random() * H, vx: -9 - Math.random() * 9, vy: 7 + Math.random() * 9, ph: Math.random() * 6.283, c: i % 2 ? '#f9a8c8' : '#ffe0ec' });
  pl.F = plLook(G.fit);
  const q = new URLSearchParams(location.search);
  try {
    go(q.get('map') || (q.has('city') && MAPS[G.dist].city !== CITY.id ? CITY.start : G.dist)); G.fade = 0; G.banner = 0;
    if (q.has('map') || q.has('x')) { G.state = 'play'; if (MAPS[q.get('map')].indoor) { const h = MAPS[CITY.hub || CITY.start]; build(CITY.start); G.back = { map: CITY.start, x: BUILT[CITY.start].st ? BUILT[CITY.start].st[0] : 70, y: BUILT[CITY.start].st ? BUILT[CITY.start].st[1] : 204 }; M = BUILT[q.get('map')]; pl.x = 160; pl.y = 180; } if (q.has('x')) { pl.x = +q.get('x'); pl.y = +q.get('y'); } camSnap(); G.zn = zoneAt(pl.x, pl.y); }
    if (q.get('st') === 'book') { G.state = 'book'; G.bk = CLIST.indexOf(CITY); } if (q.get('st') === 'japan') { G.state = 'japan'; G.jp = { sel: +(q.get('sel') || 0) }; } if (q.get('st') === 'shink') { G.state = 'ride'; G.ride = { city: CLIST[CLIST.length - 1], t: 1.5, dur: 5.6 }; } if (q.get('st') === 'line') { G.state = 'line'; G.line = { sel: 2 }; } if (q.get('st') === 'ride') { G.state = 'ride'; G.ride = { to: 3, t: 1 }; }
    if (q.has('mini')) { G.state = 'mini'; G.mg = { k: q.get('mini'), sp: {}, t: +(q.get('mt') || 0) }; MG[G.mg.k].init(G.mg); }
    if (q.has('sim')) { const sr = RNG(+q.get('seed') || 1); for (let i = 0, n = +q.get('sim'); i < n; i++) { if (i % 50 === 0) { K.l = K.r = K.u = K.d = 0; K['lrud'[sr() * 4 | 0]] = 1; if (sr() < 0.4) K['lrud'[sr() * 4 | 0]] = 1; } if (i % 15 === 0) KP.a = 1; if (i % 400 === 399) KP.x = 1; update(1 / 60); } K.l = K.r = K.u = K.d = 0; }
    if (q.has('ov')) { removeEventListener('resize', fit); W = M.w; H = M.h; cv.width = W * S; cv.height = H * S; ctx.imageSmoothingEnabled = false; ctx.setTransform(S, 0, 0, S, 0, 0); const k = Math.min(innerWidth / W, innerHeight / H); cv.style.width = W * k + 'px'; cv.style.height = H * k + 'px'; G.state = 'play'; G.banner = 0; camSnap(); }
  } catch (e) { G.err = String(e.stack || e); }
  let last = performance.now();
  function frame(now) {
    if (now - last < 14) { requestAnimationFrame(frame); return; }
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
    try { if (!G.err) { update(dt); if (G.snapReq) { const sp = G.snapReq; G.snapReq = null; takePhoto(sp); } if (G.state === 'ride') drawRide(); else { drawWorld(); drawUI(); } } } catch (e) { console.error(e); G.err = String(e.stack || e); }
    if (G.err) { R(ctx, 0, 0, W, 60, '#400'); wrap(G.err.replace(/\s+/g, ' '), 300).slice(0, 7).forEach((l, i) => txt(ctx, l, 4, 4 + i * 7, '#fff')); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
