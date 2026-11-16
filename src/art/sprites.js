'use strict';
// ---------- characters (drawn on the fine half-unit grid: coordinates below are device pixels) ----------
function personFrame(o, pose) {
  const c = mk(18, 26), g = c.g;
  const r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect((x + 2) / S, (y + 4) / S, w / S, h / S); };
  let bob = 0, fl = [0, 0], bl = [0, 0], arm = 'down', hdx = 0, hdy = 0, sw = 0, sit = false, blink = false;
  const wm = /^walk(\d)$/.exec(pose);
  if (wm) { // 8 frame walk cycle: feet travel on a circle, body rises as the legs pass, arms counter-swing
    const a = wm[1] / 8 * 6.2832, c = Math.cos(a), sn = Math.sin(a);
    fl = [Math.round(4.4 * c), Math.round(Math.max(0, -sn) * 3.4)]; bl = [Math.round(-4.4 * c), Math.round(Math.max(0, sn) * 3.4)];
    bob = Math.round(2 * Math.abs(c)) - 1; arm = 'swing'; sw = -c;
  }
  switch (pose) {
    case 'idle1': bob = 1; break;
    case 'blink': blink = true; break;
    case 'land': bob = 3; fl = [3, 0]; bl = [-3, 0]; arm = 'swing'; sw = 0.7; break;
    case 'sit': sit = true; bob = 5; break;
    case 'jump': fl = [2, 4]; bl = [-2, 2]; arm = 'up'; break;
    case 'fall': fl = [2, 0]; bl = [-4, 0]; arm = 'up'; break;
    case 'pray0': arm = 'fwd'; break;
    case 'pray1': arm = 'fwd'; hdx = 3; hdy = 4; bob = 2; break;
    case 'eat0': arm = 'mouth'; break;
    case 'eat1': arm = 'fwd'; break;
    case 'photo': arm = 'cam'; break;
    case 'cheer': arm = 'up'; bob = -2; break;
  }
  const by = 18 + bob, hy = 1 + bob + hdy;
  const sh = o.shirt, shD = dark(sh, 0.28), shM = dark(sh, 0.12), shL = lite(sh, 0.2), pa = o.pants, paD = dark(pa, 0.3), paL = lite(pa, 0.15);
  const sk = o.skin, skD = mix(sk, '#b8604a', 0.32), skL = lite(sk, 0.3), robe = o.robe, hair = o.hair, hrL = lite(hair, 0.28), hrD = dark(hair, 0.3), ink = '#3a2434';
  // back arm
  if (arm === 'sb') { r(18, by + 3, 4, 7, shD); r(20, by + 10, 4, 3, skD); }
  if (arm === 'swing' && sw < -0.25) { const o = Math.round(-sw * 4); r(15 + o, by + 3, 4, 7, shD); r(16 + o, by + 10, 4, 3, skD); }
  if (arm === 'up' || arm === 'fwd') r(18, by + 2, 6, 4, shD);
  // backpack with bedroll
  if (o.pack) {
    const p = o.pack, pd = dark(p, 0.28), pl2 = lite(p, 0.3);
    r(3, by + 1, 8, 14, p); r(4, by, 6, 1, p); r(3, by + 1, 8, 2, pl2); r(3, by + 1, 1, 14, pd); r(3, by + 13, 8, 2, pd);
    r(4, by + 8, 6, 5, dark(p, 0.12)); r(4, by + 8, 6, 1, pl2); r(6, by + 10, 2, 1, '#f2d98a');
    r(4, by - 3, 7, 3, '#e9d9a8'); r(4, by - 3, 7, 1, '#fff6dc'); r(6, by - 3, 1, 3, '#a8885a'); r(9, by - 3, 1, 3, '#a8885a');
  }
  // legs
  if (robe) {
    const rD = dark(robe, 0.25), rL = lite(robe, 0.18);
    r(10, 32, 12, 14, robe); r(10, 32, 2, 14, rD); r(15, 34, 1, 12, rD); r(19, 33, 2, 12, rL); r(10, 45, 12, 1, rD);
    r(12 + Math.sign(bl[0]) * 2, 46, 4, 2, '#f6efe2'); r(17 + Math.sign(fl[0]) * 2, 46, 4, 2, '#f6efe2');
    r(11 + Math.sign(bl[0]) * 2, 47, 6, 1, '#6b4630'); r(16 + Math.sign(fl[0]) * 2, 47, 6, 1, '#6b4630');
  } else {
    const leg = (x, d, col, cd, cl) => {
      if (sit) { const sh2 = o.shoes; r(x + 1, 37, 9, 5, col); r(x + 1, 41, 9, 1, cd); r(x + 7, 40, 5, 5, col); r(x + 7, 40, 1, 5, cd); r(x + 6, 45, 7, 3, sh2); r(x + 6, 47, 7, 1, dark(sh2, 0.4)); return; }
      r(x + Math.round(d[0] / 2), 32, 5, 7, col); r(x + d[0], 39, 5, 6 - d[1], col); r(x + d[0], 39, 1, 6 - d[1], cd); if (cl) r(x + d[0] + 3, 34, 1, 10 - d[1], cl);
      const sy = 45 - d[1], s = o.shoes; r(x + d[0] - 1, sy, 7, 3, s); r(x + d[0] + 4, sy, 2, 1, lite(s, 0.35)); r(x + d[0] - 1, sy + 2, 7, 1, dark(s, 0.4)); r(x + d[0], sy, 3, 1, dark(s, 0.15));
    };
    leg(11, bl, paD, dark(paD, 0.2), null); leg(16, fl, pa, paD, paL);
  }
  // body
  r(10, by, 12, 15, sh); r(10, by, 2, 15, shD); r(12, by, 1, 15, shM); r(20, by + 1, 2, 9, shL);
  if (robe) {
    const ob = o.obi || '#e9c46a', rD = dark(robe, 0.25);
    r(10, by, 12, 15, robe); r(10, by, 2, 15, rD); r(20, by + 1, 2, 6, lite(robe, 0.18));
    r(15, by, 5, 1, '#f8f0e0'); r(16, by + 1, 4, 1, '#f8f0e0'); r(17, by + 2, 3, 1, '#f8f0e0'); r(18, by + 3, 2, 2, '#f8f0e0'); r(17, by + 3, 1, 4, rD);
    r(10, by + 8, 12, 5, ob); r(10, by + 8, 12, 1, lite(ob, 0.35)); r(10, by + 12, 12, 1, dark(ob, 0.3)); r(10, by + 8, 2, 5, dark(ob, 0.25));
    r(12, by + 4, 1, 1, lite(robe, 0.45)); r(13, by + 6, 1, 1, lite(robe, 0.45));
  } else {
    r(10, by + 12, 12, 3, pa); r(10, by + 12, 12, 1, dark(pa, 0.35)); r(18, by + 12, 2, 1, '#e9c46a');
    if (o.inner) { r(17, by, 4, 12, o.inner); r(17, by, 1, 12, dark(o.inner, 0.18)); r(16, by, 1, 5, shL); }
    if (o.tie) { r(18, by + 1, 2, 8, o.tie); r(18, by + 1, 2, 2, lite(o.tie, 0.25)); r(18, by + 9, 1, 1, o.tie); }
    r(13, by, 6, 1, shM);
  }
  if (o.cam && arm !== 'cam') { r(15, by, 1, 2, ink); r(16, by + 2, 1, 2, ink); r(17, by + 4, 1, 2, ink); r(16, by + 6, 6, 4, '#2b2b3a'); r(16, by + 6, 6, 1, '#4a4a60'); r(19, by + 7, 2, 2, '#a8ecff'); r(19, by + 7, 1, 1, '#ffffff'); }
  // head
  const hx = 8 + hdx;
  r(hx + 6, hy + 15, 5, 3, skD);
  r(hx, hy + 3, 16, 12, sk); r(hx + 1, hy + 2, 14, 15, sk); r(hx + 2, hy + 16, 10, 1, skD); r(hx + 13, hy + 4, 2, 6, skL);
  r(hx + 6, hy + 9, 2, 3, skD); r(hx + 6, hy + 10, 1, 1, sk);
  r(hx + 1, hy, 14, 2, hair); r(hx, hy + 1, 16, 5, hair); r(hx, hy + 5, 5, 9, hair); r(hx + 5, hy + 5, 3, 3, hair); r(hx + 1, hy + 14, 3, 1, hair);
  r(hx + 8, hy + 5, 2, 2, hair); r(hx + 11, hy + 5, 3, 1, hair); r(hx + 15, hy + 5, 1, 2, hair);
  r(hx + 3, hy + 1, 8, 1, hrL); r(hx + 2, hy + 2, 3, 1, hrL); r(hx + 12, hy + 2, 2, 1, hrL);
  r(hx, hy + 9, 2, 5, hrD);
  if (o.long) { r(hx - 1, hy + 4, 4, 17, hair); r(hx - 1, hy + 10, 1, 11, hrD); r(hx + 1, hy + 6, 1, 12, hrL); }
  if (o.bun) { r(hx + 3, hy - 3, 8, 4, hair); r(hx + 4, hy - 4, 6, 1, hair); r(hx + 5, hy - 3, 4, 1, hrL); r(hx + 12, hy - 1, 2, 2, '#ff6b8a'); r(hx + 13, hy + 1, 1, 3, '#ffe08a'); r(hx + 12, hy - 1, 1, 1, '#ffc2d0'); }
  if (blink) { r(hx + 10, hy + 11, 2, 1, ink); r(hx + 14, hy + 11, 2, 1, ink); } else { r(hx + 10, hy + 9, 2, 3, ink); r(hx + 14, hy + 9, 2, 3, ink); r(hx + 10, hy + 9, 1, 1, '#ffffff'); r(hx + 14, hy + 9, 1, 1, '#ffffff'); }
  r(hx + 12, hy + 13, 3, 1, mix(sk, '#ff6a6a', 0.5)); r(hx + 8, hy + 12, 2, 1, mix(sk, '#ff7a7a', 0.3)); r(hx + 13, hy + 15, 2, 1, '#b85a50');
  if (o.hat) {
    const ht = o.hat, hd = dark(ht, 0.2);
    r(hx - 1, hy - 1, 18, 5, ht); r(hx + 1, hy - 3, 14, 2, ht); r(hx + 2, hy - 3, 9, 1, lite(ht, 0.4)); r(hx - 1, hy + 3, 18, 1, hd); r(hx - 1, hy - 1, 2, 4, hd);
    if (o.brim) { r(hx - 4, hy + 3, 24, 2, ht); r(hx - 4, hy + 4, 24, 1, hd); } else { r(hx + 12, hy + 3, 9, 2, hd); r(hx + 12, hy + 3, 9, 1, ht); }
  }
  // front arm
  const a = robe ? lite(robe, 0.12) : lite(sh, 0.1), ad = dark(a, 0.22);
  if (arm === 'down') { r(13, by + 2, 5, 9, a); r(13, by + 2, 1, 9, ad); r(13, by + 10, 5, 1, ad); r(13, by + 11, 5, 3, sk); r(13, by + 13, 5, 1, skD); }
  else if (arm === 'swing') { const o1 = Math.round(sw * 2), o2 = Math.round(sw * 4.5), o3 = Math.round(sw * 5.5); r(13 + o1, by + 2, 5, 5, a); r(13 + Math.round((o1 + o2) / 2), by + 5, 5, 3, a); r(13 + o2, by + 7, 5, 4, a); r(13 + o1, by + 2, 1, 5, ad); r(13 + o2, by + 10, 5, 1, ad); r(13 + o3, by + 11, 4, 3, sk); r(13 + o3, by + 13, 4, 1, skD); }
  else if (arm === 'sf') { r(15, by + 2, 5, 6, a); r(17, by + 6, 5, 5, a); r(15, by + 2, 1, 6, ad); r(20, by + 10, 4, 3, sk); r(20, by + 12, 4, 1, skD); }
  else if (arm === 'sb') { r(11, by + 2, 5, 6, a); r(9, by + 6, 5, 5, a); r(9, by + 10, 5, 1, ad); r(7, by + 10, 4, 3, sk); r(7, by + 12, 4, 1, skD); }
  else if (arm === 'up') { r(17, by + 2, 7, 4, a); r(21, by - 6, 4, 10, a); r(21, by - 6, 1, 8, ad); r(21, by - 9, 4, 3, sk); r(24, by - 9, 1, 3, skL); }
  else if (arm === 'fwd') { r(15, by + 2, 5, 4, a); r(17, by + 4, 7, 4, a); r(17, by + 7, 7, 1, ad); r(24, by + 4, 3, 4, sk); r(24, by + 7, 3, 1, skD); }
  else if (arm === 'mouth') { r(15, by + 2, 7, 4, a); r(21, by - 2, 4, 6, a); r(21, by - 5, 4, 3, sk); for (let i = 0; i < 6; i++) { r(24 + i, by - 6 - i, 1, 1, '#ead9b0'); r(26 + i, by - 5 - i, 1, 1, '#d9c490'); } }
  else if (arm === 'cam') { r(15, by + 2, 7, 4, a); r(21, by - 4, 4, 8, a); r(23, hy + 6, 9, 7, '#2b2b3a'); r(23, hy + 6, 9, 1, '#4a4a60'); r(25, hy + 4, 4, 2, '#2b2b3a'); r(28, hy + 8, 4, 4, '#5a6a88'); r(29, hy + 9, 2, 2, '#a8ecff'); r(29, hy + 9, 1, 1, '#ffffff'); r(24, hy + 7, 1, 1, '#ffd84a'); }
  return outline(c);
}
const PLAYER_LOOK = { skin: '#f6cfa6', hair: '#6b4630', shirt: '#3fa7a0', inner: '#f4efe2', pants: '#3d4a7a', shoes: '#e9e4d8', pack: '#e0563f', cam: true };
const NPC_LOOKS = {
  salary: { skin: '#f1c9a0', hair: '#2a2430', shirt: '#343a5c', inner: '#eef0f5', tie: '#b8404a', pants: '#2c3050', shoes: '#1c1a24' },
  office: { skin: '#f6d3b0', hair: '#3a2a2a', shirt: '#e9e2d4', pants: '#565a80', shoes: '#2a2430', long: true },
  kid: { skin: '#f6cfa6', hair: '#2a2430', shirt: '#f4f1e6', pants: '#34406e', shoes: '#f4f1e6', hat: '#ffd84a', brim: true, pack: '#c8382e' },
  teen: { skin: '#f1c9a0', hair: '#c9824a', shirt: '#f06a8c', pants: '#3a3a52', shoes: '#f4f1e6' },
  maiko: { skin: '#fbeee6', hair: '#1c1822', robe: '#d8486a', obi: '#f2c14e', shirt: '#d8486a', pants: '#d8486a', shoes: '#fff', bun: true },
  kimono: { skin: '#f6d3b0', hair: '#2a2430', robe: '#4a6fa5', obi: '#e8e0c8', shirt: '#4a6fa5', pants: '#4a6fa5', shoes: '#fff', bun: true },
  yukata: { skin: '#f1c9a0', hair: '#2a2430', robe: '#3d5a80', obi: '#1c2440', shirt: '#3d5a80', pants: '#3d5a80', shoes: '#fff' },
  monk: { skin: '#f1c9a0', hair: '#f1c9a0', robe: '#c9742a', obi: '#7a4520', shirt: '#c9742a', pants: '#c9742a', shoes: '#fff' },
  granny: { skin: '#f1c9a0', hair: '#cfc9d6', shirt: '#8a6fa8', pants: '#5a5068', shoes: '#3a3040', bun: true },
  tourist: { skin: '#e0a878', hair: '#3a2a2a', shirt: '#f2b84a', pants: '#6a7a5a', shoes: '#f4f1e6', hat: '#f4f1e6', pack: '#4a8a6a', cam: true },
  chef: { skin: '#f1c9a0', hair: '#2a2430', shirt: '#f4f1e6', pants: '#34406e', shoes: '#2a2430', hat: '#f4f1e6' }
};


function dogStatue(g, x, y, c) { // sitting dog, x,y = bottom-left
  const d = dark(c, 0.3), l = lite(c, 0.3);
  R(g, x + 2, y - 8, 6, 8, c); R(g, x + 5, y - 13, 6, 6, c); R(g, x + 10, y - 10, 2, 2, lite(c, 0.2));
  R(g, x + 5, y - 14.5, 1.5, 2, c); R(g, x + 9, y - 14.5, 1.5, 2, c); R(g, x + 8.5, y - 11, 1, 1, d); p1(g, x + 8.5, y - 11, l);
  R(g, x + 7, y - 4, 2, 4, d); R(g, x + 1, y - 9, 1, 4, c); P(g, x + 2, y - 10, c);
  R(g, x + 2, y - 8, 1, 8, d); R(g, x + 5.5, y - 13, 4, 0.5, l); R(g, x + 3.5, y - 8, 3, 0.5, l); R(g, x + 11.5, y - 9.5, 0.5, 0.5, d); R(g, x + 6, y - 1, 3, 1, c); R(g, x + 5.5, y - 7.5, 2.5, 0.5, d);
}

// ---------- icons (12x12) ----------
const ICON = {};
function buildIcons() {
  const I = (n, fn) => { const c = mk(12, 12); fn(c.g); ICON[n] = outline(epx(c)); };
  const bowl = (g, c, top) => { ell(g, 6, 7, 5, 3, c); R(g, 1, 6, 11, 1, lite(c, 0.4)); R(g, 2, 5, 9, 2, top); R(g, 4, 10, 4, 1, dark(c, 0.3)); };
  I('ramen', g => { bowl(g, '#e0563f', '#f2c879'); R(g, 3, 5, 2, 1, '#f8f0e0'); P(g, 7, 5, '#5aa85a'); R(g, 8, 5, 2, 1, '#f09a9a'); line(g, 8, 1, 6, 5, '#ead9b0'); line(g, 10, 1, 8, 5, '#ead9b0'); });
  I('sushi', g => { R(g, 1, 6, 10, 4, '#f8f4ea'); R(g, 1, 9, 10, 1, '#d9d2c4'); R(g, 0, 4, 12, 3, '#f0775a'); R(g, 2, 4, 2, 3, '#f8a890'); R(g, 6, 4, 2, 3, '#f8a890'); R(g, 5, 4, 2, 6, '#2a3a34'); });
  I('gacha', g => { disc(g, 6, 6, 5, '#f4f1e6'); R(g, 1, 6, 11, 5, '#f06a8c'); disc(g, 6, 6, 5, 'rgba(0,0,0,0)'); g.clearRect(0, 11, 12, 1); g.clearRect(0, 10, 3, 1); g.clearRect(9, 10, 3, 1); g.clearRect(0, 8, 1, 3); g.clearRect(11, 8, 1, 3); R(g, 3, 3, 2, 2, '#fff'); R(g, 1, 6, 11, 1, '#d8486a'); });
  I('camera', g => { R(g, 1, 4, 10, 7, '#3a3a4e'); R(g, 3, 2, 4, 2, '#3a3a4e'); disc(g, 6, 7, 2, '#a8ecff'); P(g, 6, 7, '#fff'); P(g, 9, 5, '#ffd84a'); });
  I('torii', g => { R(g, 0, 2, 12, 2, '#e0452f'); R(g, 1, 5, 10, 1, '#e0452f'); R(g, 2, 4, 2, 8, '#e0452f'); R(g, 8, 4, 2, 8, '#e0452f'); R(g, 0, 1, 12, 1, '#2a2430'); });
  I('heart', g => { R(g, 1, 3, 4, 4, '#f06a8c'); R(g, 7, 3, 4, 4, '#f06a8c'); R(g, 2, 2, 2, 1, '#f06a8c'); R(g, 8, 2, 2, 1, '#f06a8c'); R(g, 1, 5, 10, 2, '#f06a8c'); R(g, 2, 7, 8, 1, '#f06a8c'); R(g, 3, 8, 6, 1, '#f06a8c'); R(g, 4, 9, 4, 1, '#f06a8c'); R(g, 5, 10, 2, 1, '#f06a8c'); P(g, 2, 3, '#ffc2d0'); });
  I('dango', g => { line(g, 1, 11, 11, 1, '#c9a070'); disc(g, 3, 9, 2, '#8fc97a'); disc(g, 6, 6, 2, '#f8f4ea'); disc(g, 9, 3, 2, '#f7a8c0'); });
  I('fan', g => { for (let i = 0; i < 7; i++) line(g, 6, 11, 0 + i * 2, 4 - Math.round(Math.sin(i / 6 * Math.PI) * 3), i % 2 ? '#f7d6c0' : '#e0563f'); R(g, 5, 10, 2, 2, '#6b4630'); });
  I('tako', g => { R(g, 0, 8, 12, 3, '#c9a070'); R(g, 0, 10, 12, 1, '#93603a'); for (const x of [2, 6, 10]) { disc(g, x, 6, 2, '#d9903a'); R(g, x - 1, 4, 3, 1, '#6b3a20'); P(g, x, 3, '#8fc97a'); } });
  I('okono', g => { ell(g, 6, 7, 5, 4, '#d9a05a'); ell(g, 6, 6, 5, 3, '#8a4a28'); line(g, 2, 5, 5, 8, '#f8f0e0'); line(g, 5, 4, 8, 8, '#f8f0e0'); line(g, 8, 4, 10, 7, '#f8f0e0'); P(g, 4, 5, '#5aa85a'); P(g, 8, 6, '#5aa85a'); });
  I('gift', g => { R(g, 1, 4, 10, 7, '#f2c14e'); R(g, 1, 4, 10, 2, '#f8dc8a'); R(g, 5, 4, 2, 7, '#e0563f'); R(g, 1, 7, 10, 1, '#e0563f'); R(g, 3, 2, 2, 2, '#e0563f'); R(g, 7, 2, 2, 2, '#e0563f'); });
  I('mochi', g => { ell(g, 6, 7, 5, 3, '#8fc97a'); R(g, 2, 5, 7, 1, '#b8e0a0'); R(g, 1, 10, 10, 1, '#c9a070'); P(g, 4, 6, '#e8f4d8'); });
  I('senbei', g => { disc(g, 6, 6, 5, '#d9a05a'); disc(g, 5, 5, 3, '#e8bc7a'); P(g, 4, 4, '#93603a'); P(g, 8, 6, '#93603a'); P(g, 6, 8, '#93603a'); P(g, 7, 3, '#93603a'); });
  I('omikuji', g => { R(g, 3, 0, 6, 12, '#f8f4ea'); R(g, 3, 0, 6, 2, '#e0452f'); R(g, 5, 3, 2, 1, '#2a2430'); R(g, 4, 5, 4, 1, '#2a2430'); R(g, 5, 7, 2, 1, '#2a2430'); R(g, 4, 9, 4, 1, '#2a2430'); });
  I('deer', g => { ell(g, 5, 7, 4, 2, '#bd8550'); R(g, 2, 8, 1, 4, '#93603a'); R(g, 7, 8, 1, 4, '#93603a'); R(g, 8, 3, 2, 4, '#bd8550'); R(g, 8, 2, 4, 2, '#bd8550'); P(g, 9, 0, '#f6ead4'); P(g, 9, 1, '#f6ead4'); P(g, 4, 6, '#f6ead4'); P(g, 6, 7, '#f6ead4'); });
  I('bamboo', g => { R(g, 3, 0, 2, 12, '#5aa85a'); R(g, 7, 2, 2, 10, '#3f8a4a'); R(g, 3, 4, 2, 1, '#2f5d3a'); R(g, 3, 8, 2, 1, '#2f5d3a'); R(g, 7, 6, 2, 1, '#2f5d3a'); line(g, 5, 2, 8, 0, '#8fc97a'); line(g, 9, 4, 11, 3, '#8fc97a'); });
  I('tower', g => { R(g, 5, 0, 2, 3, '#f4f1e6'); R(g, 4, 3, 4, 3, '#ff7a42'); R(g, 3, 6, 6, 1, '#f4f1e6'); R(g, 3, 7, 2, 5, '#ff7a42'); R(g, 7, 7, 2, 5, '#ff7a42'); R(g, 2, 10, 2, 2, '#ff7a42'); R(g, 8, 10, 2, 2, '#ff7a42'); });
  I('castle', g => { R(g, 1, 9, 10, 3, '#9a93a8'); R(g, 2, 6, 8, 3, '#f4f1e6'); R(g, 1, 5, 10, 1, '#3f8a7a'); R(g, 3, 3, 6, 2, '#f4f1e6'); R(g, 2, 2, 8, 1, '#3f8a7a'); R(g, 5, 0, 2, 2, '#3f8a7a'); P(g, 4, 0, '#f2c14e'); P(g, 7, 0, '#f2c14e'); });
  I('crab', g => { ell(g, 6, 7, 4, 3, '#f0553a'); R(g, 0, 3, 2, 3, '#f0553a'); R(g, 10, 3, 2, 3, '#f0553a'); P(g, 2, 6, '#f0553a'); P(g, 9, 6, '#f0553a'); P(g, 4, 5, '#fff'); P(g, 8, 5, '#fff'); R(g, 1, 9, 1, 2, '#f0553a'); R(g, 10, 9, 1, 2, '#f0553a'); R(g, 3, 10, 1, 2, '#f0553a'); R(g, 8, 10, 1, 2, '#f0553a'); });
  I('pagoda', g => { for (let i = 0; i < 4; i++) { R(g, 2 + i * 0.7, 9 - i * 3, 8 - i * 1.4, 1, '#3a3550'); R(g, 4, 10 - i * 3, 4, 2, '#b8402f'); } R(g, 6, 0, 1, 2, '#f2c14e'); });
  I('gold', g => { R(g, 1, 10, 10, 2, '#5aa8a0'); R(g, 3, 6, 6, 4, '#f2c14e'); R(g, 1, 5, 10, 1, '#6b4630'); R(g, 4, 2, 4, 3, '#f8dc8a'); R(g, 3, 1, 6, 1, '#6b4630'); P(g, 6, 0, '#f2c14e'); });
  I('billiken', g => { R(g, 3, 4, 6, 8, '#f2c14e'); R(g, 4, 0, 4, 4, '#f8dc8a'); P(g, 5, 0, '#f2c14e'); P(g, 6, 0, '#f2c14e'); P(g, 5, 2, '#6b4630'); P(g, 7, 2, '#6b4630'); R(g, 2, 10, 8, 2, '#d9a03a'); });
  I('buddha', g => { ell(g, 6, 8, 5, 3, '#c9a04a'); R(g, 4, 2, 4, 5, '#d9b45a'); R(g, 4, 1, 4, 1, '#3a3550'); P(g, 5, 4, '#6b4630'); P(g, 7, 4, '#6b4630'); R(g, 2, 10, 8, 2, '#a8843a'); });
  I('lantern', g => { R(g, 4, 0, 4, 1, '#3a3550'); R(g, 3, 1, 6, 2, '#6b6478'); R(g, 4, 3, 4, 4, '#ffd98a'); R(g, 5, 7, 2, 4, '#8c8498'); R(g, 3, 11, 6, 1, '#6b6478'); });
  I('sun', g => { disc(g, 6, 6, 3, '#ffb84a'); for (const [x, y] of [[6, 0], [6, 11], [0, 6], [11, 6], [2, 2], [10, 2], [2, 10], [10, 10]]) P(g, x, y, '#ffd98a'); });
  // collectibles (7x7)
  const S = (n, fn) => { const c = mk(7, 7); fn(c.g); ICON[n] = outline(epx(c)); };
  S('petal', g => { R(g, 2, 0, 3, 2, '#f9a8c8'); R(g, 0, 2, 2, 3, '#f9a8c8'); R(g, 5, 2, 2, 3, '#f9a8c8'); R(g, 2, 5, 3, 2, '#f9a8c8'); R(g, 2, 2, 3, 3, '#ffe0ec'); P(g, 3, 3, '#ffd84a'); P(g, 3, 0, '#ffe0ec'); P(g, 0, 3, '#ffe0ec'); });
  S('leaf', g => { R(g, 2, 1, 3, 4, '#f0703a'); R(g, 0, 2, 7, 2, '#f0703a'); P(g, 3, 0, '#f0703a'); P(g, 1, 4, '#f0703a'); P(g, 5, 4, '#f0703a'); R(g, 3, 2, 1, 5, '#b8402f'); P(g, 2, 2, '#ffb05a'); });
  S('ball', g => { disc(g, 3, 3, 3, '#d9903a'); R(g, 1, 1, 5, 2, '#6b3a20'); P(g, 3, 0, '#8fc97a'); P(g, 2, 4, '#f0c070'); });
  S('cracker', g => { disc(g, 3, 3, 3, '#e8bc7a'); P(g, 2, 2, '#93603a'); P(g, 4, 4, '#93603a'); P(g, 4, 1, '#93603a'); });
}
const _stamps = {};
function stampOf(name) { return _stamps[name] || (_stamps[name] = tint(ICON[name], '#c8382e', 1)); }

// ---------- nature ----------
const U = 1 / S; // one device pixel, in world units
function blob(g, cx, cy, r, cols, rnd) {
  const dk = dark(cols[0], 0.25), hl = lite(cols[2], 0.3);
  disc(g, cx, cy + 0.5, r, dk); disc(g, cx, cy, r, cols[0]);
  for (let i = 0; i < r * 2; i++) { const a = rnd() * 6.283, rr = r * 0.92; disc(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0.8 + rnd() * 1.1, a > 0.4 && a < 2.7 ? dk : cols[0]); }
  if (r > 3) disc(g, cx - r * 0.14, cy - r * 0.2, r * 0.76, cols[1]);
  if (r > 4) { disc(g, cx - r * 0.3, cy - r * 0.42, r * 0.36, cols[2]); disc(g, cx + r * 0.2, cy - r * 0.1, r * 0.18, cols[2]); }
  for (let i = 0; i < r * r * 0.55; i++) { // leaf flecks: light up-left, dark down-right
    const a = rnd() * 6.283, d = Math.sqrt(rnd()) * r * 0.95, dx = Math.cos(a) * d, dy = Math.sin(a) * d, t = (dx + dy * 1.3) / r, q = rnd();
    const col = t < -0.45 ? (q < 0.5 ? hl : cols[1]) : t < 0.25 ? (q < 0.5 ? cols[2] : cols[0]) : (q < 0.6 ? dk : cols[1]);
    R(g, cx + dx, cy + dy, q < 0.35 ? 1 : U, U, col);
  }
}
function canopy(g, cx, cy, w, h, cols, rnd, n) {
  const bl = [], dk = dark(cols[0], 0.25), m = Math.round(n * 2.2);
  ell(g, cx, cy + 1, w * 0.3, h * 0.3, dk); ell(g, cx, cy, w * 0.3, h * 0.3, cols[0]); // one solid mass, then leafy clumps over it
  for (let i = 0; i < m; i++) { const a = rnd() * 6.283, d = Math.pow(rnd(), 0.6), r = 3.5 + rnd() * 4.5; bl.push([cx + Math.cos(a) * d * (w / 2 - r * 0.4), cy + Math.sin(a) * d * (h / 2 - r * 0.3), r]); }
  bl.sort((p, q) => q[1] - p[1]);
  for (const b of bl) blob(g, b[0], b[1], b[2], cols, rnd);
}
const LEAF = {
  sakura: ['#b8608c', '#ee96b8', '#fcd0de'], sakuraN: ['#8a4a80', '#c878a8', '#f0a8c8'],
  maple: ['#93342a', '#d9602c', '#f6a03c'], maple2: ['#a84a24', '#e8883a', '#fcc85a'], mapleR: ['#7a2430', '#c03838', '#f06a4a'],
  green: ['#2f5d3a', '#4f8a4b', '#8fc97a'], green2: ['#3a6a4a', '#6aa85a', '#b0dc8a'], pine: ['#1f4a3a', '#2f6a4a', '#5a9a5a'],
  night: ['#1c2a44', '#2a4458', '#4a6a70']
};
function trunk(g, x, base, h, w0, tc, sway) {
  const hi = lite(tc, 0.22), lo = dark(tc, 0.3), n = Math.round(h * S);
  for (let i = 0; i < n; i++) {
    const t = i / n, y = base - (i + 1) * U, wv = snap(Math.sin(i * 0.065 + x) * sway * t), w = Math.max(1.5, snap(w0 * (1 - t * 0.5) + (i < 8 ? (8 - i) * 0.3 : 0))), x0 = snap(x - w / 2) + wv;
    R(g, x0, y, w, U, tc); R(g, x0, y, Math.max(U, snap(w * 0.22)), U, hi); R(g, x0 + w - Math.max(U, snap(w * 0.3)), y, Math.max(U, snap(w * 0.3)), U, lo);
    const k = (i * 7 + Math.round(x) * 3) % 13; if (k < 2 && w > 2) p1(g, x0 + w * 0.45, y, lo); else if (k === 5 && w > 2.5) p1(g, x0 + w * 0.3, y, hi);
  }
}
function tree(g, x, base, h, cols, rnd, o = {}) {
  const tc = o.trunk || '#5a3a40', w0 = o.tw || 4;
  trunk(g, x, base, h, w0, tc, 1.5);
  const bh = base - h * 0.75, lo = dark(tc, 0.25);
  line(g, x, bh, x - h * 0.22, bh - h * 0.2, tc); line1(g, x, bh + 1, x - h * 0.22, bh - h * 0.2 + 1, lo);
  line(g, x, bh + 3, x + h * 0.25, bh - h * 0.15, tc); line1(g, x, bh + 4, x + h * 0.25, bh - h * 0.15 + 1, lo);
  canopy(g, x, base - h - (o.up || 0), o.cw || h * 0.95, o.ch || h * 0.55, cols, rnd, o.n || 12);
}
function pine(g, x, base, h, rnd, cols = LEAF.pine) {
  trunk(g, x, base, h, 3, '#5a3c3c', 2);
  const n = 3 + (h / 16 | 0), dk = dark(cols[0], 0.25);
  for (let k = 0; k < n; k++) {
    const y = base - h * (0.45 + 0.6 * k / n), rx = (n - k) * 3 + 5 + rnd() * 3, ox = (rnd() - 0.5) * 10, cx = x + ox;
    ell(g, cx, y + 0.5, rx, 3, dk); ell(g, cx, y, rx, 3, cols[0]); ell(g, cx - 1, y - 1, rx - 2, 2, cols[1]); ell(g, cx - rx * 0.15, y - 1.8, rx * 0.55, 0.9, cols[2]);
    for (let i = 0; i < rx * 5; i++) { const px = cx + (rnd() * 2 - 1) * rx * 0.9, py = y + (rnd() * 2 - 1) * 2.2; R(g, px, py, U, rnd() < 0.5 ? 1 : U, py < y - 0.5 ? cols[2] : py > y + 1 ? dk : cols[1]); }
    for (let px = cx - rx + 1; px < cx + rx - 1; px += 1 + rnd()) R(g, px, y + 2.5 + rnd(), U, 1, cols[0]);
  }
}
function bamboo(g, x, base, h, col, rnd) {
  const w = rnd() < 0.35 ? 3 : 2, lean = (rnd() - 0.5) * 0.08, hi = lite(col, 0.32), lo = dark(col, 0.35), md = dark(col, 0.15), n = Math.round(h * S);
  for (let i = 0; i < n; i++) {
    const xx = snap(x + lean * i * U), y = base - (i + 1) * U, k = i % 22;
    if (k === 20) { R(g, xx - U, y, w + 1, U, lo); continue; } if (k === 21) { R(g, xx - U, y, w + 1, U, hi); continue; }
    R(g, xx, y, w, U, col); R(g, xx, y, U, U, hi); R(g, xx + w - U, y, U, U, lo); if (w > 2) R(g, xx + w - 1, y, U, U, md);
  }
  for (let k = 0; k < 10; k++) {
    const i = h * (0.45 + rnd() * 0.55), lx = x + lean * i, ly = base - i, d = rnd() < 0.5 ? -1 : 1, len = 3 + rnd() * 5;
    line1(g, lx, ly, lx + d * len * 0.5, ly - 1, md);
    for (let j = 0; j < 3; j++) { const a = lx + d * (len * 0.3 + j * len * 0.25), b = ly - 0.5 - j * 0.3; line1(g, a, b, a + d * 2.5, b + 1.5 + rnd(), j % 2 ? hi : col); line1(g, a, b + U, a + d * 2, b + 1.5, col); }
  }
}
function bush(g, x, base, w, cols, rnd) { canopy(g, x, base - 4, w, 6, cols, rnd, Math.max(3, w / 4 | 0)); }
function mountain(g, cx, base, hw, h, col, rnd, snow) {
  const n = Math.round(h * S), sh = dark(col, 0.14), sn2 = snow ? dark(snow, 0.12) : null;
  for (let i = 0; i < n; i++) {
    const t = i / n, y = base - h + i * U, w = snap(2 + hw * Math.pow(t, 1.35) + Math.sin(i * 0.35) * 1.2 + Math.sin(i * 0.9) * 0.5);
    R(g, cx - w, y, w * 2, U, col); R(g, cx + snap(w * 0.15 + Math.sin(i * 0.5) * 2), y, w - snap(w * 0.15 + Math.sin(i * 0.5) * 2), U, sh);
    if (snow && t < 0.4) { const j = (Math.sin(i * 0.95) * 0.5 + 0.5) * t * 16 + (Math.sin(i * 2.3) * 0.5 + 0.5) * t * 6, sw = Math.max(0.5, snap(w - j)); R(g, cx - sw, y, sw * 2, U, snow); R(g, cx + snap(sw * 0.2), y, sw - snap(sw * 0.2), U, sn2); }
  }
}

// ---------- architecture ----------
function roof(g, cx, y, ht, hb, h, c) { // tiled roof with curved eaves
  const hi = lite(c, 0.34), lo = dark(c, 0.48), md = dark(c, 0.2), l2 = lite(c, 0.14), n = Math.round(h * S);
  cx = snap(cx);
  for (let j = 0; j < n; j++) {
    const t = n > 1 ? j / (n - 1) : 1, hw = snap(ht + (hb - ht) * Math.pow(t, 1.6)), yy = y + j * U, x0 = cx - hw;
    if (j < 2) { R(g, x0, yy, hw * 2, U, j ? l2 : hi); continue; }
    if (j === n - 1) { R(g, x0, yy, hw * 2, U, lo); continue; }
    R(g, x0, yy, hw * 2, U, (j - 2) % 5 === 4 && j < n - 3 ? md : c);
    if (j === n - 2) { for (let x = cx - hw + U; x < cx + hw - U; x += 1.5) { R(g, x, yy, 1, U, hi); p1(g, x + 1, yy, lo); } continue; }
    for (let x = 0.75; x < hw - U; x += 1.5) { p1(g, cx + x, yy, md); p1(g, cx + x + U, yy, l2); p1(g, cx - x - U, yy, md); p1(g, cx - x, yy, l2); }
    p1(g, x0, yy, lo); p1(g, cx + hw - U, yy, lo);
  }
  for (let k = 0; k < 4; k++) { const d = (k + 1) * U; R(g, cx - hb - d, y + h - 1 - k * U - U, U, 1, lo); R(g, cx + hb + d - U, y + h - 1 - k * U - U, U, 1, lo); }
}
function pagoda(g, cx, base, tiers, w, o = {}) {
  const wall = o.wall || '#b8402f', rc = o.roof || '#3d3852', bh = o.bh || 8, rh = o.rh || 6, st = o.step || 4, wd = dark(wall, 0.35), wl = lite(wall, 0.2), pn = o.panel || '#f1e2c4';
  let y = base - 3; R(g, cx - w / 2 - 5, y, w + 10, 3, '#8c8498'); R(g, cx - w / 2 - 5, y, w + 10, U, '#c8c0d4'); R(g, cx - w / 2 - 5, y + 1.5, w + 10, U, '#6b6478');
  for (let x = cx - w / 2 - 3; x < cx + w / 2 + 4; x += 4) R(g, x, y + U, U, 3 - U, '#6b6478');
  for (let k = 0; k < tiers; k++) {
    const bw = w - k * st, x0 = Math.round(cx - bw / 2);
    R(g, x0, y - bh, bw, bh, wall); R(g, x0, y - bh, bw, 2, wd); R(g, x0, y - bh, U, bh, wl); R(g, x0 + bw - 1, y - bh, 1, bh, wd);
    for (let x = x0 + 2; x < x0 + bw - 3; x += 4) { R(g, x, y - bh + 3, 2, bh - 5, pn); R(g, x, y - bh + 3, 2, U, dark(pn, 0.3)); R(g, x + 1 - U / 2, y - bh + 3, U, bh - 5, dark(pn, 0.25)); R(g, x, y - bh + 3 + (bh - 5) / 2, 2, U, dark(pn, 0.25)); }
    R(g, x0 - 1, y - 2, bw + 2, 1, dark(wall, 0.45)); R(g, x0 - 1, y - 2, bw + 2, U, wl);
    for (let x = x0 - 1; x < x0 + bw + 1; x += 1.5) R(g, x, y - 1.5, U, 1.5, wd);
    y -= bh; roof(g, cx, y - rh + 1, bw / 2 - 2, bw / 2 + 7, rh, rc);
    for (let x = cx - bw / 2 - 3; x < cx + bw / 2 + 3; x += 1) p1(g, x, y + 1, wd); // rafter tails
    y -= rh - 2;
  }
  const gc = '#d9b04a', gl = '#fff0b0'; R(g, cx, y - 14, 1, 15, gc); R(g, cx, y - 14, U, 15, gl); for (let i = 0; i < 5; i++) { R(g, cx - 1.5 + i * 0.2, y - 2.5 - i * 2.2, 4 - i * 0.4, U, gc); R(g, cx - 1, y - 2 - i * 2.2, 3, U, dark(gc, 0.3)); } disc(g, cx + U, y - 14, 0.8, gl);
  return y - 14;
}
function torii(g, cx, base, w, h, c = '#e0452f') {
  const d = dark(c, 0.3), l = lite(c, 0.3), k = '#2a2430', pw = Math.max(2, w / 9 | 0), x0 = Math.round(cx - w / 2), x1 = Math.round(cx + w / 2 - pw);
  for (const x of [x0, x1]) { R(g, x, base - h + 5, pw, h - 5, c); R(g, x, base - h + 5, Math.max(U, pw * 0.25), h - 5, l); R(g, x + pw - Math.max(U, snap(pw * 0.3)), base - h + 5, Math.max(U, snap(pw * 0.3)), h - 5, d); R(g, x - 1, base - 3, pw + 2, 3, k); R(g, x - 1, base - 3, pw + 2, U, '#5a5068'); R(g, x - U, base - 4, pw + 1, 1, '#3a3346'); }
  R(g, x0 - 2, base - h + 9, w + 4, 2, c); R(g, x0 - 2, base - h + 9, w + 4, U, l); R(g, x0 - 2, base - h + 11, w + 4, 1, d);
  R(g, x0 - 5, base - h + 2, w + 10, 3, c); R(g, x0 - 5, base - h + 2, w + 10, U, l); R(g, x0 - 5, base - h + 4.5, w + 10, U, d);
  R(g, x0 - 5, base - h, w + 10, 2, k); R(g, x0 - 5, base - h, w + 10, U, '#5a5068');
  for (let i = 0; i < 4; i++) { R(g, x0 - 5.5 - i * U, base - h - i * U - U, U, 2, k); R(g, x0 + w + 5 + i * U, base - h - i * U - U, U, 2, k); }
  R(g, cx - 2, base - h + 5, 4, 4, k); R(g, cx - 1.5, base - h + 5.5, 3, 3, '#f2c14e'); R(g, cx - 1.5, base - h + 5.5, 3, U, '#fff0b0'); R(g, cx - U, base - h + 6, 1, 2, '#8a5a20');
}
function stoneLantern(g, x, base, lit = true, moss = false) {
  const s = '#8c8498', sd = '#6b6478', sl = '#b8b0c6', sk = '#514a60';
  R(g, x - 4, base - 2, 9, 2, sd); R(g, x - 4, base - 2, 9, U, s); R(g, x - 3, base - 3, 7, 1, s);
  R(g, x - 2, base - 9, 5, 6, s); R(g, x - 2, base - 9, 1, 6, sl); R(g, x + 2, base - 9, 1, 6, sd);
  R(g, x - 4, base - 11, 9, 2, s); R(g, x - 4, base - 11, 9, U, sl); R(g, x - 4, base - 9.5, 9, U, sk);
  R(g, x - 3, base - 16, 7, 5, sd); R(g, x - 2, base - 15, 5, 3, lit ? '#ffd98a' : '#3a3346'); if (lit) { R(g, x - 2, base - 15, 5, 1, '#fff3c0'); } R(g, x, base - 15, U, 3, sd); R(g, x - 2, base - 13.5, 5, U, sd);
  R(g, x - 5, base - 18, 11, 2, s); R(g, x - 3, base - 20, 7, 2, s); R(g, x - 1, base - 22, 3, 2, sd); R(g, x - 5, base - 18, 11, U, sl); R(g, x - 3, base - 20, 7, U, sl); R(g, x - 5, base - 16.5, 11, U, sk); R(g, x - 0.5, base - 23, 2, 1, s);
  R(g, x - 5.5, base - 18.5, U, 1, s); R(g, x + 6, base - 18.5, U, 1, s);
  for (const [a, b] of [[-1, -6], [1.5, -8], [-3, -19], [2, -17.5], [-2.5, -1.5]]) p1(g, x + a, base + b, sk);
  if (moss) { R(g, x - 5, base - 19, 6, 1, '#6aa85a'); R(g, x - 3, base - 21, 4, 1, '#6aa85a'); R(g, x - 4, base - 3, 5, 1, '#4f8a4b'); for (const [a, b] of [[-4.5, -18], [-2, -17.5], [-1, -20], [-3.5, -2], [0, -2.5], [-2, -9.5]]) p1(g, x + a, base + b, '#8fc97a'); }
}
function chochin(g, x, y, c = '#e0452f', big = 1) { // paper lantern, x,y = top centre
  const rx = 3 * big, ry = 4 * big, k = '#2a2430';
  R(g, x - big, y, big * 2 + 1, 1, k); R(g, x - big, y, big * 2 + 1, U, '#5a5068'); ell(g, x + U, y + ry + 1, rx, ry, c);
  ell(g, x + U + rx * 0.3, y + ry + 1, rx * 0.62, ry * 0.94, dark(c, 0.14));
  ell(g, x + U - rx * 0.35, y + ry + 0.6, rx * 0.36, ry * 0.7, lite(c, 0.22));
  for (let i = -ry + 1; i < ry; i += big > 1 ? 1.5 : 1) { const w = snap(rx * Math.sqrt(1 - i * i / (ry * ry))); R(g, x + U - w, y + ry + 1 + i, w * 2, U, dark(c, 0.3)); }
  R(g, x - rx + 1.5, y + 2.5, U, ry * 0.9, lite(c, 0.55)); R(g, x - big, y + ry * 2 + 1, big * 2 + 1, 1, k);
  R(g, x, y + ry * 2 + 2, U, big, '#e9c46a');
}
function vending(g, x, base, c = '#f4f1e6') {
  const d = dark(c, 0.3), k = '#3a3346';
  R(g, x, base - 20, 12, 20, c); R(g, x, base - 20, 12, U, lite(c, 0.4)); R(g, x + 11, base - 20, 1, 20, d); R(g, x, base - 20, U, 20, lite(c, 0.25)); R(g, x, base - 1, 12, 1, d);
  R(g, x + 1, base - 18.5, 10, 10, k); R(g, x + 1.5, base - 18, 9, 9, '#d8f2ff'); R(g, x + 1.5, base - 18, 9, 1, '#ffffff');
  const cc = ['#e0563f', '#5aa8e0', '#f2c14e', '#5aa85a', '#f06a8c', '#8a6aff'];
  for (let r = 0; r < 3; r++) { R(g, x + 1.5, base - 15.5 + r * 3, 9, U, '#9ab8c8'); for (let i = 0; i < 6; i++) { const col = cc[(i + r * 2) % 6]; R(g, x + 2 + i * 1.5, base - 17.5 + r * 3, 1, 2, col); p1(g, x + 2 + i * 1.5, base - 17.5 + r * 3, lite(col, 0.5)); p1(g, x + 2 + i * 1.5, base - 15 + r * 3, i % 2 ? '#e0563f' : '#5aa8e0'); } }
  R(g, x + 2, base - 7.5, 8, 1.5, k); R(g, x + 2.5, base - 7, 4, U, '#5ad88a'); R(g, x + 9, base - 8, 1, 2.5, '#c8c0d0'); p1(g, x + 9, base - 7, '#e0563f');
  R(g, x + 3, base - 4.5, 6, 3, k); R(g, x + 3.5, base - 4, 5, U, '#6b6478');
}
function bench(g, x, base) {
  const w = '#a8744a', l = '#d09a66', d = '#7a5236', k = '#4a3040';
  R(g, x, base - 6, 18, 2, w); R(g, x, base - 6, 18, U, l); R(g, x, base - 4.5, 18, U, d); R(g, x, base - 5, 18, U, d);
  R(g, x, base - 11, 18, 2, w); R(g, x, base - 11, 18, U, l); R(g, x, base - 9.5, 18, U, d); R(g, x, base - 8.5, 18, 1, w); R(g, x, base - 8.5, 18, U, l);
  for (const a of [1, 15]) { R(g, x + a, base - 4, 2, 4, k); R(g, x + a, base - 4, U, 4, '#6b5068'); R(g, x + a + 0.5, base - 11.5, 1, 6, k); }
  for (let i = 4.5; i < 18; i += 4.5) { R(g, x + i, base - 6, U, 1.5, d); R(g, x + i, base - 11, U, 1.5, d); }
}
function streetLamp(g, x, base, h, c = '#3a3346') {
  const l = lite(c, 0.25);
  R(g, x, base - h, 2, h, c); R(g, x, base - h + 1, U, h - 1, l); R(g, x - 1, base - 2, 4, 2, c); R(g, x - 0.5, base - 3, 3, 1, c); R(g, x - 5, base - h, 7, 1, c); R(g, x - 5, base - h, 7, U, l);
  R(g, x - 6.5, base - h + 0.5, 5, 1, c); R(g, x - 6, base - h + 1, 4, 2, '#fff1c0'); R(g, x - 6, base - h + 1, 4, U, '#ffffff'); R(g, x - 5.5, base - h + 3, 3, U, '#ffd98a');
  R(g, x - U, base - h * 0.45, 3, U, l);
}
function kanji(g, x, y, c, rnd) {
  R(g, x, y, 5, 1, c); R(g, x + 2, y, 1, 5, c);
  if (rnd() < 0.6) R(g, x, y + 2, 5, 1, c); if (rnd() < 0.5) R(g, x, y + 4, 5, 1, c);
  if (rnd() < 0.5) { P(g, x, y + 3, c); P(g, x + 4, y + 3, c); } if (rnd() < 0.4) { R(g, x, y + 1, 1, 3, c); R(g, x + 4, y + 1, 1, 3, c); }
}
function vsign(g, x, y, n, col, bg, rnd) { // vertical sign with n glyphs
  const h = n * 7 + 3;
  R(g, x - U, y - U, 10, h + 1, '#0e0c1c'); R(g, x, y, 9, h, bg); R(g, x, y, 9, U, col); R(g, x, y + h - U, 9, U, col); R(g, x, y, U, h, col); R(g, x + 9 - U, y, U, h, col);
  R(g, x + 1, y + 1, 7, U, dark(col, 0.5)); R(g, x + 1, y + h - 1.5, 7, U, dark(col, 0.5));
  for (let i = 0; i < n; i++) kanji(g, x + 2, y + 3 + i * 7, col, rnd);
  R(g, x - 1.5, y + 3, 1, 1, '#4a4458'); R(g, x - 1.5, y + h - 4, 1, 1, '#4a4458');
}
function bldg(g, x, base, w, h, o, rnd) {
  const c = o.c, top = base - h, c2 = dark(c, 0.14), cl = lite(c, 0.2), fr = dark(c, 0.4), off = dark(c, 0.5), gl = mix(off, '#9ab0e0', 0.3);
  R(g, x, top, w, h, c); R(g, x, top, 1, h, cl); R(g, x + w - 2, top, 2, h, dark(c, 0.3)); R(g, x + w - 2.5, top, U, h, c2);
  R(g, x - U, top - U, w + 1, 1.5, lite(c, 0.35)); R(g, x, top + 1, w, U, fr);
  const ww = o.ww || 3, wh = o.wh || 3, gx = o.gx || 5, gy = o.gy || 6, lit = o.lit == null ? 0.5 : o.lit;
  for (let yy = top + 4; yy < base - (o.foot || 8); yy += gy) {
    R(g, x + 1, yy + wh + 1, w - 3.5, U, c2); R(g, x + 1, yy + wh + 1.5, w - 3.5, U, cl);
    for (let xx = x + 3; xx < x + w - ww - 2; xx += gx) {
      const on = rnd() < lit; R(g, xx - U, yy - U, ww + 1, wh + 1, fr);
      if (on) {
        const wc = rnd() < 0.8 ? (o.wc || '#ffd98a') : '#bfe8ff'; R(g, xx, yy, ww, wh, wc); R(g, xx, yy, ww, U, lite(wc, 0.6));
        const q = rnd(); if (q < 0.3) R(g, xx, yy, ww, snap(wh * (0.3 + rnd() * 0.4)), lite(wc, 0.35)); else if (q < 0.5) R(g, xx, yy + wh - 1, ww, 1, dark(wc, 0.3)); else if (q < 0.62) { R(g, xx + 1, yy + wh - 1.5, 1, 1.5, dark(wc, 0.55)); p1(g, xx + 1.25, yy + wh - 2, dark(wc, 0.55)); }
        if (ww >= 3) R(g, xx + snap(ww / 2) - U / 2, yy, U, wh, dark(wc, 0.35));
      } else { R(g, xx, yy, ww, wh, off); p1(g, xx + U, yy + U, gl); p1(g, xx + 1, yy + 1, gl); if (ww >= 3) R(g, xx + snap(ww / 2) - U / 2, yy, U, wh, fr); }
      R(g, xx - U, yy + wh + U, ww + 1, U, cl);
    }
  }
  if (o.top !== false) {
    if (rnd() < 0.6) { R(g, x + 3, top - 4.5, 6, 4, dark(c, 0.2)); R(g, x + 3, top - 4.5, 6, U, cl); R(g, x + 3, top - 4.5, U, 4, c); for (let i = 0; i < 3; i++) R(g, x + 4, top - 3.5 + i, 4, U, dark(c, 0.4)); }
    if (rnd() < 0.5) { R(g, x + w - 6, top - 9.5, U, 9, dark(c, 0.3)); R(g, x + w - 7, top - 6, 2.5, U, dark(c, 0.3)); R(g, x + w - 6.5, top - 10.5, 1.5, 1, '#ff5a5a'); }
    if (rnd() < 0.4) { R(g, x + w / 2, top - 3, 5, 2.5, dark(c, 0.3)); R(g, x + w / 2, top - 3, 5, U, c); disc(g, x + w / 2 + 2.5, top - 4, 1.5, dark(c, 0.2)); }
    for (let xx = x + 1; xx < x + w - 1; xx += 2) R(g, xx, top - 2, U, 1.5, fr); R(g, x, top - 2.5, w, U, fr);
  }
}
function skyline(g, x0, x1, base, minh, maxh, col, rnd, o = {}) {
  const hi = lite(col, 0.1), lo = dark(col, 0.12);
  for (let x = x0; x < x1;) {
    const w = 8 + rnd() * 16 | 0, h = minh + rnd() * rnd() * (maxh - minh) | 0;
    R(g, x, base - h, w, h + 40, col); R(g, x, base - h, w, U, hi); R(g, x, base - h, U, h, hi); R(g, x + w - 1, base - h, 1, h + 40, lo);
    if (rnd() < 0.3) { R(g, x + 2, base - h - 3, w - 4, 3, col); R(g, x + 2, base - h - 3, w - 4, U, hi); }
    if (rnd() < 0.2) { R(g, x + w / 2, base - h - 8, U, 8, col); p1(g, x + w / 2, base - h - 8.5, '#ff7a7a'); }
    if (o.lit) for (let yy = base - h + 3; yy < base; yy += 3) for (let xx = x + 1.5; xx < x + w - 2; xx += 2) if (rnd() < o.lit) R(g, xx, yy, 1, 1.5, rnd() < 0.8 ? o.wc : (o.wc2 || o.wc));
    else if (h > 14) for (let yy = base - h + 3; yy < base; yy += 3) R(g, x + 1, yy, w - 2.5, U, lo);
    x += w + (rnd() < 0.3 ? 2 : 0);
  }
}
function tokyoTower(g, cx, base, h) {
  const c1 = '#ff6f3c', c2 = '#fff0d0', n = Math.round(h * S);
  for (let i = 0; i < n; i++) {
    const t = i / n, y = base - h + i * U, hw = snap(1 + h * 0.19 * Math.pow(Math.max(0, t - 0.1) / 0.9, 2.1));
    const col = Math.floor(t * 9) % 2 ? c2 : c1, dk = dark(col, 0.28), lt = lite(col, 0.3);
    if (t < 0.12) { R(g, cx, y, U, U, col); continue; }
    const lw = hw > 6 ? 1.5 : hw > 3 ? 1 : U;
    R(g, cx - hw, y, lw, U, col); R(g, cx + hw - lw + U, y, lw, U, col); p1(g, cx - hw, y, lt); p1(g, cx + hw, y, dk);
    if (t >= 0.8) { // arched legs
      const k = snap((t - 0.8) / 0.2 * hw * 0.6); if (k < 1.5) R(g, cx - hw, y, hw * 2 + U, U, col); else { R(g, cx - k - 1, y, 1, U, col); R(g, cx + k + U, y, 1, U, col); if (i % 8 === 0) { R(g, cx - hw, y, hw - k, U, col); R(g, cx + k, y, hw - k, U, col); } }
      continue;
    }
    if (i % 12 === 0) { R(g, cx - hw, y, hw * 2 + U, U, col); continue; }
    if (hw > 1.5) { const ph = (i % 12) / 12, d = snap(ph * hw * 2); p1(g, cx - hw + d, y, dk); p1(g, cx + hw - d, y, dk); p1(g, cx, y, col); if (hw > 5) { const d2 = snap(ph * hw); p1(g, cx - hw + d2, y, col); p1(g, cx + hw - d2, y, col); } }
    else R(g, cx - hw, y, hw * 2 + U, U, col);
  }
  const d = (t, hw, hh) => { const y = base - h + Math.round(t * h); R(g, cx - hw, y, hw * 2 + 1, hh, '#fff0d0'); R(g, cx - hw, y, hw * 2 + 1, U, '#ffffff'); R(g, cx - hw, y + hh - 1, hw * 2 + 1, 1, '#c9744a'); for (let x = cx - hw + 0.5; x < cx + hw; x += 1) R(g, x, y + 1, U, hh - 2.5, '#ffb040'); R(g, cx - hw - U, y - U, hw * 2 + 2, U, '#c9744a'); };
  d(0.3, 3, 3); d(0.56, 8, 5);
}
// timber wall with plank lines
function planks(g, x, y, w, h, c, rnd) {
  const d = dark(c, 0.22), l = lite(c, 0.1);
  R(g, x, y, w, h, c);
  for (let xx = x + 2; xx < x + w; xx += 2.5) { R(g, xx, y, U, h, d); if (rnd() < 0.5) R(g, xx + U, y + rnd() * h * 0.6, U, 2 + rnd() * 5, l); if (rnd() < 0.18) p1(g, xx + 1, y + 2 + rnd() * (h - 4), d); }
}
// generic little shop / machiya. x = left edge, sits on GY. returns roof top y.
function shopArt(g, x, w, h, o, rnd) {
  const y = GY - h, wall = o.wall || '#6a4638', wd = dark(wall, 0.35), beam = o.beam || '#3a2630', bl = lite(beam, 0.22), glow = o.glow || '#ffd98a', gl2 = lite(glow, 0.45), gd = dark(glow, 0.22);
  planks(g, x, y, w, h, wall, rnd);
  R(g, x, y, 2, h, beam); R(g, x + w - 2, y, 2, h, beam); R(g, x, y, w, 2, beam); R(g, x, y, U, h, bl); R(g, x + w - 2, y, U, h, bl); R(g, x, y + 2, w, U, dark(beam, 0.4));
  R(g, x + 2, GY - 7, w - 4, 7, wd); R(g, x + 2, GY - 7, w - 4, U, lite(wall, 0.15)); R(g, x, GY - 1.5, w, 1.5, '#6b6478'); R(g, x, GY - 1.5, w, U, '#9a93a8');
  const dw = o.dw || Math.round(w * 0.42), dx = x + (o.dx != null ? o.dx : (w - dw) >> 1), dy = y + (o.sign ? 13 : 6);
  R(g, dx, dy, dw, GY - dy, glow); R(g, dx, dy, dw, snap((GY - dy) * 0.3), gl2); R(g, dx, GY - 12, dw, 12, gd);
  // counter, stools and things on the shelf
  for (let i = 1; i < dw - 2; i += 3.5) { const hh = 1.5 + (i * 7 % 3) * 0.5; R(g, dx + i, GY - 14 - hh, 1.5, hh, dark(glow, 0.38)); p1(g, dx + i, GY - 14 - hh, gd); }
  R(g, dx, GY - 14, dw, U, dark(glow, 0.45));
  R(g, dx, GY - 9, dw, 2, '#9a6a44'); R(g, dx, GY - 9, dw, U, '#c89a6a'); R(g, dx, GY - 7.5, dw, U, '#6b4630');
  for (let i = 2; i < dw - 2; i += 6) { R(g, dx + i, GY - 6, 2, 6, '#5a3a32'); R(g, dx + i, GY - 6, U, 6, '#7a5446'); R(g, dx + i - 1, GY - 7, 4, 1, '#7a4a3a'); R(g, dx + i - 1, GY - 7, 4, U, '#a8704a'); }
  R(g, dx - 1, dy, 1, GY - dy, beam); R(g, dx + dw, dy, 1, GY - dy, beam); R(g, dx - 1, dy, U, GY - dy, bl);
  // side windows with fine lattice
  const lat = (lx, lw) => { if (lw < 5) return; R(g, lx - U, dy + 2.5, lw + 1, 13, beam); R(g, lx, dy + 3, lw, 12, glow); R(g, lx, dy + 3, lw, 4, gl2); for (let i = 0; i < lw; i += 1) R(g, lx + i, dy + 3, U, 12, beam); R(g, lx, dy + 6.5, lw, U, beam); R(g, lx, dy + 10.5, lw, U, beam); R(g, lx - 1, dy + 15.5, lw + 2, 1, wd); R(g, lx - 1, dy + 15.5, lw + 2, U, lite(wall, 0.2)); };
  lat(x + 4, dx - x - 7); lat(dx + dw + 3, x + w - dx - dw - 7);
  if (o.noren && o._nor) o._nor.push({ x: dx, y: dy, w: dw, c: o.noren });
  else if (o.noren) {
    const n = Math.max(2, dw / 7 | 0), sw = dw / n, nc = o.noren, nd = dark(nc, 0.28), nl = lite(nc, 0.22);
    R(g, dx - 1, dy - U, dw + 2, 1, '#8a5a3a');
    for (let i = 0; i < n; i++) { const nx = dx + i * sw; R(g, nx, dy + U, sw - U, 8, nc); R(g, nx, dy + U, U, 8, nl); R(g, nx + sw - 1, dy + U, U, 8, nd); R(g, nx, dy + 8, sw - U, U, nd); R(g, nx + U, dy + 8.5, sw - 1.5, U, nd); disc(g, nx + sw / 2 - U, dy + 4, 1.4, '#f8f0e0'); disc(g, nx + sw / 2 - U, dy + 4, 0.7, nc); }
  }
  if (o.sign) { const sw = tw(o.sign) + 8, sx = x + ((w - sw) >> 1); R(g, sx - U, y + 2.5, sw + 1, 10, '#5a3a28'); R(g, sx, y + 3, sw, 9, o.signBg || '#f4e6c0'); R(g, sx, y + 3, sw, U, '#fff8e0'); R(g, sx, y + 11, sw, 1, '#b8a070'); for (let i = 0; i < sw; i += 3) p1(g, sx + i + (i * 3 % 2) * U, y + 4 + (i * 5 % 7), '#e0d0a8'); txt(g, o.sign, sx + 4, y + 5, o.signCol || '#8a2a24'); }
  let top = y;
  if (o.roof === 'awning') {
    const ac = o.roofCol || '#e0563f', ad = dark(ac, 0.3), wh = '#f8f4ea';
    for (let i = 0; i < w + 6; i += 4) { const cc = (i / 4) % 2 ? wh : ac, ww = Math.min(4, w + 6 - i); R(g, x - 3 + i, y - 5, ww, 6, cc); R(g, x - 3 + i, y - 5, ww, U, lite(cc, 0.4)); R(g, x - 3 + i, y - 0.5, ww, U, dark(cc, 0.2)); R(g, x - 3 + i, y + 1, ww, 1, cc); R(g, x - 3 + i + U, y + 2, ww - 1, U, cc); R(g, x - 3 + i + ww - U, y + 1, U, 1, dark(cc, 0.3)); }
    R(g, x - 3, y + 0.5, w + 6, U, ad); R(g, x, y - 7, w, 2, beam); R(g, x, y - 7, w, U, bl); top = y - 5;
  }
  else { const rh = o.rh || 9; roof(g, x + w / 2, y - rh + 1, w / 2 - 4, w / 2 + 5, rh, o.roofCol || '#3d3852'); top = y - rh + 1; }
  if (o.upper) { // second storey above the roof
    const uh = o.upper, uy = top - uh + 3; planks(g, x + 3, uy, w - 6, uh, wall, rnd); R(g, x + 3, uy, w - 6, 1, beam); R(g, x + 3, uy, 1, uh, beam); R(g, x + w - 4, uy, 1, uh, beam);
    R(g, x + 5.5, uy + 3.5, w - 11, uh - 7, beam); R(g, x + 6, uy + 4, w - 12, uh - 8, glow); R(g, x + 6, uy + 4, w - 12, 2, gl2);
    for (let i = 6; i < w - 6; i += 1) R(g, x + i, uy + 4, U, uh - 8, beam); R(g, x + 6, uy + 4 + (uh - 8) / 2, w - 12, U, beam);
    R(g, x + 4, uy + uh - 4, w - 8, 1, '#7a5446'); R(g, x + 4, uy + uh - 4, w - 8, U, '#a8704a');
    roof(g, x + w / 2, uy - 7, w / 2 - 8, w / 2 + 3, 8, o.roofCol || '#3d3852');
    roof(g, x + w / 2, top, w / 2 - 4, w / 2 + 5, o.rh || 9, o.roofCol || '#3d3852');
  }
  if (o.lantern) chochin(g, x + 5, y + 4, o.lantern === true ? '#e0452f' : o.lantern);
  return top;
}
function templeHall(g, cx, base, w, h, o = {}) {
  const wall = o.wall || '#c0442f', rc = o.roof || '#4a4660', pl = o.plaster || '#efe3c8', n = o.bays || 6, wl = lite(wall, 0.25), wd = dark(wall, 0.35), door = o.door || '#7a3a2a';
  R(g, cx - w / 2 - 10, base - 4, w + 20, 4, '#8c8498'); R(g, cx - w / 2 - 10, base - 4, w + 20, U, '#c8c0d4'); R(g, cx - w / 2 - 6, base - 6, w + 12, 2, '#9a93a8'); R(g, cx - w / 2 - 6, base - 6, w + 12, U, '#c8c0d4');
  R(g, cx - w / 2 - 10, base - 2, w + 20, U, '#6b6478'); for (let x = cx - w / 2 - 8; x < cx + w / 2 + 10; x += 6) { R(g, x, base - 4 + U, U, 1.5, '#6b6478'); R(g, x + 3, base - 1.5, U, 1.5, '#6b6478'); }
  const by = base - 6 - h, x0 = Math.round(cx - w / 2);
  R(g, x0, by, w, h, pl); R(g, x0, by + 4, w, 1.5, dark(pl, 0.18));
  const bw = (w - 3) / n;
  for (let i = 0; i < n; i++) {
    const mid = Math.abs(i - (n - 1) / 2) < 1, bx = x0 + i * bw + 3, ww = bw - 3;
    if (mid) { R(g, bx, by + 5, ww, h - 5, '#2a1a22'); R(g, bx, by + 5, ww, 2, '#1a1018'); R(g, bx + 1, base - 16, ww - 2, 10, '#3a2228'); }
    else { R(g, bx, by + 5, ww, h - 5, door); for (let k = 1; k < ww; k += 1.5) R(g, bx + k, by + 6, U, h - 13, dark(door, 0.35)); R(g, bx, by + 5 + (h - 12) / 2, ww, U, dark(door, 0.35)); R(g, bx, base - 13, ww, U, lite(door, 0.25)); R(g, bx + 1, base - 12, ww - 2, 5, dark(door, 0.15)); }
  }
  for (let i = 0; i <= n; i++) { const px = x0 + Math.round(i * bw); R(g, px, by, 3, h, wall); R(g, px, by, U, h, wl); R(g, px + 2.5, by, U, h, wd); R(g, px - U, base - 7.5, 4, 1.5, '#8c8498'); }
  R(g, x0, by, w, 4, wall); R(g, x0, by, w, U, wl); R(g, x0, by + 4, w, 1, dark(wall, 0.4));
  for (let x = x0 + 1; x < x0 + w - 1; x += 2) { R(g, x, by + 1.5, 1, 1.5, '#f2c14e'); p1(g, x, by + 1.5, '#fff0b0'); }
  const rh = o.rh || Math.round(h * 0.85);
  for (let x = x0 - 8; x < x0 + w + 8; x += 1) R(g, x, by - 1, U, 1.5, wd);
  roof(g, cx, by - rh + 2, w * 0.3, w / 2 + 14, rh, rc);
  R(g, cx - w * 0.3 - 1, by - rh, w * 0.6 + 2, 2, dark(rc, 0.35)); R(g, cx - w * 0.3 - 1, by - rh, w * 0.6 + 2, U, lite(rc, 0.3)); for (let x = cx - w * 0.3; x < cx + w * 0.3; x += 1.5) p1(g, x, by - rh + 1, lite(rc, 0.15));
  if (o.gold) { R(g, cx - w * 0.3 - 2, by - rh - 4, 3, 5, '#f2c14e'); R(g, cx + w * 0.3 - 1, by - rh - 4, 3, 5, '#f2c14e'); }
  return by - rh;
}
