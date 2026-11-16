'use strict';
// ---------- top-down basics: canvas, input, noise, people seen from front/back/side, UI bits ----------
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
cv.width = W * S; cv.height = H * S; ctx.imageSmoothingEnabled = false; ctx.scale(S, S);
function fit() { const q = Math.min(innerWidth / (W * S), innerHeight / (H * S)), k = q >= 1 ? Math.floor(q) : q; cv.style.width = Math.floor(W * S * k) + 'px'; cv.style.height = Math.floor(H * S * k) + 'px'; }
addEventListener('resize', fit); fit();
const TOUCH = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
if (TOUCH) document.body.classList.add('touch');

// ---------- input ----------
const K = {}, KP = {};
const KEYS = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', KeyE: 'a', Enter: 'a', Space: 'a', KeyX: 'a', KeyZ: 'a', Tab: 'b', KeyB: 'b', KeyQ: 'b', KeyM: 'm', KeyN: 'n', Escape: 'x' };
function press(k) { if (!K[k]) KP[k] = 1; K[k] = 1; Snd.init(); }
addEventListener('keydown', e => { const k = KEYS[e.code]; if (k) { e.preventDefault(); press(k); } });
addEventListener('keyup', e => { const k = KEYS[e.code]; if (k) K[k] = 0; });
addEventListener('blur', () => { for (const k in K) K[k] = 0; });
for (const el of document.querySelectorAll('[data-k]')) {
  const k = el.dataset.k;
  el.addEventListener('pointerdown', e => { e.preventDefault(); press(k); el.classList.add('on'); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, () => { K[k] = 0; el.classList.remove('on'); });
}
cv.addEventListener('pointerdown', () => { if (G.state === 'title') press('a'); else Snd.init(); });
addEventListener('contextmenu', e => e.preventDefault());
const hsh = (x, y) => { let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) | 0; n = Math.imul(n ^ n >>> 13, 1274126177); return ((n ^ n >>> 16) >>> 0) / 4294967296; };
function vn(x, y) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a = hsh(xi, yi), b = hsh(xi + 1, yi), c = hsh(xi, yi + 1), d = hsh(xi + 1, yi + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; }
const c32 = h => { const [r, g, b] = hex(h); return (255 << 24 | b << 16 | g << 8 | r) >>> 0; };
function tdFrame(o, back, ph, act) {
  const c = mk(18, 26), g = c.g;
  const r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect((x + 2) / S, (y + 4) / S, w / S, h / S); };
  const walk = ph >= 1 && ph <= 4, lL = ph === 1 ? 3 : 0, lR = ph === 3 ? 3 : 0;
  let bob = ph === 2 || ph === 4 || ph === 5 ? 1 : 0, hd = 0;
  if (act === 'bow') { bob = 2; hd = 3; } if (act === 'cheer') bob = -1;
  const by = 18 + bob, hy = 1 + bob + hd;
  const sh = o.shirt, shD = dark(sh, 0.28), shM = dark(sh, 0.12), shL = lite(sh, 0.2), pa = o.pants, paD = dark(pa, 0.3), paL = lite(pa, 0.15);
  const sk = o.skin, skD = mix(sk, '#b8604a', 0.32), skL = lite(sk, 0.3), robe = o.robe, hair = o.hair, hrL = lite(hair, 0.28), hrD = dark(hair, 0.3), ink = '#3a2434';
  if (robe) {
    const rD = dark(robe, 0.25), rL = lite(robe, 0.18), y0 = by + 13;
    r(9, y0, 14, 46 - y0, robe); r(9, y0, 2, 46 - y0, rD); r(20, y0, 2, 46 - y0, rL); if (!back) r(15, y0 + 2, 1, 44 - y0, rD); r(9, 45, 14, 1, rD);
    r(11, 46 - (lL ? 1 : 0), 4, 2, '#f6efe2'); r(17, 46 - (lR ? 1 : 0), 4, 2, '#f6efe2');
  } else {
    const leg = (x, lift, sx) => { r(x, 32, 5, 13 - lift, pa); r(x, 32, 1, 13 - lift, paD); r(x + 3, 34, 1, 10 - lift, paL); const sy = 45 - lift, s = o.shoes; r(sx, sy, 6, 3, s); r(sx, sy + 2, 6, 1, dark(s, 0.4)); if (!back) r(sx + 1, sy, 3, 1, lite(s, 0.35)); };
    leg(10, lL, 9); leg(17, lR, 17); r(15, 32, 2, 3, paD);
  }
  // body
  if (robe) {
    const ob = o.obi || '#e9c46a', rD = dark(robe, 0.25);
    r(9, by, 14, 14, robe); r(9, by, 2, 14, rD); r(20, by + 1, 2, 6, lite(robe, 0.18));
    if (!back) { r(13, by, 6, 1, '#f8f0e0'); r(14, by + 1, 4, 1, '#f8f0e0'); r(15, by + 2, 2, 2, '#f8f0e0'); }
    r(9, by + 8, 14, 5, ob); r(9, by + 8, 14, 1, lite(ob, 0.35)); r(9, by + 12, 14, 1, dark(ob, 0.3));
    if (back) { r(12, by + 6, 8, 8, lite(ob, 0.12)); r(12, by + 6, 8, 1, lite(ob, 0.45)); r(15, by + 8, 2, 4, dark(ob, 0.3)); r(12, by + 13, 8, 1, dark(ob, 0.35)); }
  } else {
    r(9, by, 14, 13, sh); r(9, by, 2, 13, shD); r(11, by, 1, 13, shM); r(20, by + 1, 2, 8, shL); r(9, by + 12, 14, 2, pa); r(9, by + 12, 14, 1, dark(pa, 0.35));
    if (!back) { if (o.inner) { r(14, by, 4, 12, o.inner); r(14, by, 1, 12, dark(o.inner, 0.18)); } if (o.tie) { r(15, by + 1, 2, 8, o.tie); r(15, by + 1, 2, 2, lite(o.tie, 0.25)); } r(13, by, 6, 1, shM); r(15, by + 12, 2, 1, '#e9c46a'); }
  }
  if (o.pack) {
    const p = o.pack, pd = dark(p, 0.28), pl2 = lite(p, 0.3);
    if (back) { r(10, by + 1, 12, 13, p); r(10, by + 1, 12, 2, pl2); r(10, by + 1, 1, 13, pd); r(10, by + 12, 12, 2, pd); r(12, by + 7, 8, 5, dark(p, 0.12)); r(12, by + 7, 8, 1, pl2); r(15, by + 9, 2, 1, '#f2d98a'); r(9, by - 3, 14, 3, '#e9d9a8'); r(9, by - 3, 14, 1, '#fff6dc'); r(12, by - 3, 1, 3, '#a8885a'); r(19, by - 3, 1, 3, '#a8885a'); }
    else { r(10, by, 2, 10, pd); r(20, by, 2, 10, pd); r(10, by, 1, 10, p); r(21, by, 1, 10, p); }
  }
  if (o.cam && !back) { r(12, by, 1, 5, ink); r(19, by, 1, 5, ink); r(13, by + 5, 6, 4, '#2b2b3a'); r(13, by + 5, 6, 1, '#4a4a60'); r(15, by + 6, 2, 2, '#a8ecff'); r(15, by + 6, 1, 1, '#ffffff'); }
  // arms
  const a = robe ? lite(robe, 0.12) : lite(sh, 0.1), ad = dark(a, 0.22), dl = walk ? (ph === 1 ? -1 : ph === 3 ? 1 : 0) : 0;
  if (act === 'cheer') { for (const x of [5, 24]) { r(x, by - 7, 3, 10, a); r(x, by - 7, 1, 10, ad); r(x, by - 10, 3, 3, sk); } r(6, by + 1, 3, 3, a); r(23, by + 1, 3, 3, a); }
  else if (act === 'bow') { r(6, by + 1, 3, 6, a); r(23, by + 1, 3, 6, a); r(6, by + 1, 1, 6, ad); }
  else { r(6, by + 1 + dl, 3, 9, a); r(6, by + 1 + dl, 1, 9, ad); r(6, by + 10 + dl, 3, 3, sk); r(6, by + 12 + dl, 3, 1, skD); r(23, by + 1 - dl, 3, 9, a); r(25, by + 1 - dl, 1, 9, ad); r(23, by + 10 - dl, 3, 3, sk); r(23, by + 12 - dl, 3, 1, skD); }
  // head
  r(13, hy + 15, 6, 3, skD); r(8, hy + 3, 16, 12, sk); r(9, hy + 2, 14, 15, sk); r(10, hy + 16, 12, 1, skD);
  if (back) {
    if (o.long) { r(8, hy + 1, 16, 21, hair); r(8, hy + 12, 1, 10, hrD); r(11, hy + 6, 1, 14, hrL); }
    r(9, hy, 14, 2, hair); r(8, hy + 1, 16, 12, hair); r(9, hy + 13, 14, 2, hair); r(11, hy + 1, 8, 1, hrL); r(10, hy + 3, 2, 6, hrL); r(8, hy + 10, 16, 1, hrD); r(21, hy + 3, 2, 9, hrD);
  } else {
    r(22, hy + 4, 1, 6, skL);
    if (o.long) { r(6, hy + 5, 3, 16, hair); r(23, hy + 5, 3, 16, hair); r(6, hy + 10, 1, 11, hrD); r(24, hy + 7, 1, 12, hrL); }
    r(9, hy, 14, 2, hair); r(8, hy + 1, 16, 5, hair); r(8, hy + 6, 2, 6, hair); r(22, hy + 6, 2, 6, hair); r(10, hy + 6, 3, 2, hair); r(15, hy + 6, 2, 1, hair); r(19, hy + 6, 3, 2, hair); r(11, hy + 1, 8, 1, hrL); r(10, hy + 2, 3, 1, hrL); r(8, hy + 9, 1, 3, hrD);
    if (ph === 6) { r(11, hy + 11, 2, 1, ink); r(19, hy + 11, 2, 1, ink); } else { r(11, hy + 9, 2, 3, ink); r(19, hy + 9, 2, 3, ink); r(11, hy + 9, 1, 1, '#ffffff'); r(19, hy + 9, 1, 1, '#ffffff'); }
    r(9, hy + 13, 2, 1, mix(sk, '#ff6a6a', 0.5)); r(21, hy + 13, 2, 1, mix(sk, '#ff6a6a', 0.5));
    if (act === 'cheer') r(14, hy + 13, 4, 2, '#b85a50'); else r(15, hy + 14, 2, 1, '#b85a50');
  }
  if (o.bun) { r(12, hy - 3, 8, 4, hair); r(13, hy - 4, 6, 1, hair); r(14, hy - 3, 4, 1, hrL); r(20, hy - 1, 2, 2, '#ff6b8a'); r(20, hy - 1, 1, 1, '#ffc2d0'); }
  if (o.hat) {
    const ht = o.hat, hdk = dark(ht, 0.2);
    r(7, hy - 1, 18, 5, ht); r(9, hy - 3, 14, 2, ht); r(10, hy - 3, 9, 1, lite(ht, 0.4)); r(7, hy + 3, 18, 1, hdk); r(7, hy - 1, 2, 4, hdk);
    if (o.brim) { r(4, hy + 3, 24, 2, ht); r(4, hy + 4, 24, 1, hdk); } else if (!back) { r(9, hy + 4, 14, 2, hdk); r(9, hy + 4, 14, 1, ht); }
  }
  return outline(c);
}
function makeLook(o) {
  const F = { s: {}, d: [], u: [] };
  for (const p of ['idle0', 'idle1', 'blink', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6', 'walk7']) { const r = personFrame(o, p); F.s[p] = [r, flip(r)]; }
  for (let i = 0; i < 7; i++) F.d.push(tdFrame(o, false, i)); for (let i = 0; i < 6; i++) F.u.push(tdFrame(o, true, i));
  F.bow = tdFrame(o, true, 0, 'bow'); F.cheer = tdFrame(o, false, 0, 'cheer'); return F;
}
function frameOf(e) {
  const F = e.F; if (e.act === 'bow') return F.bow; if (e.act === 'cheer') return F.cheer; if (e.act === 'back') return F.u[0];
  const side = e.dir === 'l' || e.dir === 'r', fi = e.dir === 'l' ? 1 : 0, q = G.t + e.ph;
  if (e.mv) return side ? F.s['walk' + Math.floor(e.wt * 11) % 8][fi] : F[e.dir][1 + Math.floor(e.wt * 6.5) % 4];
  const bl = q % 4 > 3.86, br = q * 1.6 % 2 < 1;
  if (side) return F.s[bl ? 'blink' : br ? 'idle0' : 'idle1'][fi];
  return e.dir === 'd' ? F.d[bl ? 6 : br ? 0 : 5] : F.u[br ? 0 : 5];
}
function panel(x, y, w, h) { R(ctx, x + 1, y, w - 2, h, '#1d1626'); R(ctx, x, y + 1, w, h - 2, '#1d1626'); R(ctx, x + 1, y + 1, w - 2, h - 2, '#f8f0dc'); R(ctx, x + 2, y + 2, w - 4, 1, '#fffaf0'); R(ctx, x + 2, y + h - 3, w - 4, 1, '#d9cba8'); }
function keycap(x, y, s) { const w = tw(s) + 6; R(ctx, x, y, w, 10, '#1d1626'); R(ctx, x + 1, y + 1, w - 2, 7, '#fff8e8'); R(ctx, x + 1, y + 8, w - 2, 1, '#b8a888'); txt(ctx, s, x + 3, y + 2, '#1d1626'); return w; }
function ring(cx, cy, icon, on) { if (on) { disc(ctx, cx, cy, 11, '#c8382e'); disc(ctx, cx, cy, 9, '#f8f0dc'); ctx.drawImage(stampOf(icon), cx - 7, cy - 7); } else { disc(ctx, cx, cy, 11, '#d9cba8'); disc(ctx, cx, cy, 10, '#f8f0dc'); txt(ctx, '?', cx - 1, cy - 2, '#d9cba8'); } }
