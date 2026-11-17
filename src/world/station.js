'use strict';
// ---------- the big stations: a crowded shinkansen concourse between the city and the train ----------
// At Tokyo, Kyoto and Osaka the blue shinkansen sign leads into the station rather than straight onto a train: an entrance
// hall with a bento shop, a concourse where commuters hurry across in streams, ticket gates, stairs up to the platform, and
// the train waiting there. Walk into a stream and it carries you along (and someone says sumimasen), so you pick your gaps.
// Nothing to win or lose: the next train is never far away, and the board counts down to it.
// concourse(id, { name, hub, music, track, bento: [name, what it is], dest }) defines the map; the city lists it as concourse.
const STA = { sprites: false };
function stationSprites() {
  if (STA.sprites) return; STA.sprites = true;
  one('n700', 640, 58, g => { // the train from the side, nose to the left: white, a blue stripe, a band of windows, three doors
    for (let y = 16; y < 50; y++) { const t = (y - 16) / 34, x0 = Math.round(42 * (1 - Math.sqrt(t))); R(g, x0, y, 640 - x0, 1, y < 18 ? '#ffffff' : y < 21 ? '#ece8e0' : '#f4f1e6'); if (y > 35 && y < 39) R(g, x0, y, 640 - x0, 1, '#2f5ab0'); if (y === 41) R(g, x0 + 4, y, 636 - x0, 1, '#2f5ab0'); }
    for (let x = 52; x < 640; x += 10) if ((x + 30) % 160 > 24) R(g, x, 25, 7, 6, '#2a3a5a'); R(g, 16, 24, 20, 6, '#1d2a44'); R(g, 18, 25, 14, 1, '#5a7aa8');
    for (const x of [112, 272, 432]) { R(g, x - 7, 19, 14, 29, '#e2ded6'); R(g, x - 7, 19, U, 29, '#b8b4ac'); R(g, x + 7 - U, 19, U, 29, '#b8b4ac'); R(g, x - 4, 23, 8, 8, '#2a3a5a'); R(g, x - U, 19, U, 29, '#c8c4bc'); }
    for (let x = 160; x < 640; x += 160) { R(g, x - 1, 16, 2, 34, '#5a5468'); R(g, x - 3, 18, 6, 30, '#3a3446'); }
    R(g, 8, 48, 632, 4, '#8a8496'); R(g, 8, 48, 632, U, '#c8c0d4'); for (let x = 60; x < 640; x += 80) { disc(g, x, 53, 3.5, '#2a2430'); disc(g, x + 14, 53, 3.5, '#2a2430'); }
  });
  one('gate', 8, 16, g => { R(g, 0, 2, 8, 14, '#b8b0c0'); R(g, 0, 2, 8, 2, '#e4dcec'); R(g, 0, 15, 8, 1, '#6b6478'); R(g, 1, 5, 6, 3, '#2a3a5a'); R(g, 2, 6, 2, 1, '#5ad88a'); R(g, 4, 6, 2, 1, '#5ad88a'); R(g, 7, 2, 1, 14, '#8a8496'); }, 1);
  one('pillar', 16, 46, g => { R(g, 1, 0, 14, 46, '#e4ddd0'); R(g, 1, 0, 2, 46, '#f8f2e6'); R(g, 13, 0, 2, 46, '#b8b0a4'); R(g, 0, 43, 16, 3, '#9a9288'); R(g, 3, 12, 10, 16, '#3f7ab0'); R(g, 4, 13, 8, 6, '#f2c14e'); R(g, 4, 21, 8, 1, '#f4f1e6'); R(g, 4, 23, 6, 1, '#f4f1e6'); }, 1);
  one('hsign', 44, 34, g => { R(g, 21, 0, 2, 20, '#6b6478'); R(g, 0, 18, 44, 16, '#1d2a44'); R(g, 1, 19, 42, 14, '#2f4a7a'); R(g, 1, 19, 42, U, '#5a7aa8'); txt(g, 'SHINKANSEN', 3, 24, '#f4f1e6'); }, 1);
}
const BUMP = ['SUMIMASEN!', 'OOPS, SORRY!', 'GOMEN!', 'EXCUSE ME!', 'COMING THROUGH!'];
const departs = () => 150 - Math.floor(worldTime()) % 150; // a Nozomi every two and a half minutes, the same for everyone
const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
// one commuter in a stream: walks the lane and wraps round off the side of the map. If you are in the way they slow down,
// and you get carried along with them and nudged out of the lane.
function commuter(n, dt) {
  const dx = pl.x - n.x, dy = pl.y - n.y, close = Math.abs(dx) < 9 && Math.abs(dy) < 6 && G.state === 'play' && !pl.hide;
  const v = close && Math.sign(dx) === Math.sign(n.vx) ? n.vx * 0.3 : n.vx;
  n.x += v * dt; n.wt += dt; if (n.x > M.w + 14) n.x = -14; else if (n.x < -14) n.x = M.w + 14;
  if (n.bump > 0) n.bump -= dt;
  if (close) { step(pl, v * dt, (dy >= 0 ? 1 : -1) * 18 * dt); if (n.bump <= 0) { n.bump = 4; say(n, BUMP[(n.ph * 7 + (G.t | 0)) % BUMP.length]); Snd.fx('land'); } }
}
function concourse(id, o) {
  MAPS[id] = { name: o.name, sub: 'SHINKANSEN TO ' + o.dest, tw: 40, th: 34, music: o.music,
    hud: () => 'NOZOMI ' + o.track + ' - DEPARTS IN ' + mmss(departs()),
    lay() { tRect(PL, 0, 0, 40, 34); },
    deco() {
      stationSprites(); const g = M.ground.g, x2 = M.w;
      // the far track and the train along the top, and the platform edge
      R(g, 0, 0, x2, 80, '#2e2a38'); for (let y = 4; y < 16; y += 3) R(g, 0, y, x2, 1, '#3e3848'); for (const y of [6, 13]) R(g, 0, y, x2, 1, '#8a8496');
      put(SPR.n700, 320, 76, 320, 58); block(0, 0, x2, 80);
      R(g, 0, 78, x2, 6, '#e8c84a'); for (let x = 2; x < x2; x += 4) for (const y of [79.5, 82]) p1(g, x, y, '#c8a830'); R(g, 0, 84, x2, 1, '#f8f6f0');
      for (const x of [112, 272, 432]) M.SPOTS.push({ x, y: 92, r: 15, label: 'BOARD THE SHINKANSEN', shink: 1 });
      for (const x of [192, 352, 512]) { put(SPR.hsign, x, 128, 22, 33); }
      for (const x of [40, 600]) prop('bench', x, 136, 9);
      npc('salary', 300, 100, { dir: 'u', lines: ['THE GREEN CAR IS FOR PEOPLE WHOSE COMPANIES PAY.', 'I AM IN CAR SEVEN, WITH EVERYBODY ELSE.'] });
      npc('tourist', 470, 104, { dir: 'u', lines: ['THEY CLEAN THE WHOLE TRAIN IN SEVEN MINUTES. I TIMED IT.', 'THEY BOWED TO US WHEN THEY FINISHED.'] });
      npc('granny', 560, 132, { lines: ['I HAVE MY BENTO, MY TEA AND MY SEAT. NOW I AM HAPPY.'] });
      // the wall down to the concourse: stairs at each end and the departure board between them
      R(g, 0, 150, x2, 28, '#d4ccbe'); R(g, 0, 150, x2, 2, '#f0e8da'); for (let x = 0; x < x2; x += 16) R(g, x, 152, U, 26, '#bcb4a6'); R(g, 0, 176, x2, 2, '#8a8276');
      block(0, 146, x2, 178); steps(160, 150, 48, 28, '#c4bcb0'); steps(480, 150, 48, 28, '#c4bcb0');
      R(g, 214, 150, 212, 26, '#1d1626'); R(g, 216, 152, 208, 22, '#120e1a');
      M.ACT.push({ x: 320, y: 178, sayT: 0, always: true, draw(e, x, y) { // the board: a clock, the next trains, the countdown
        const bx = x - 104, by = y - 26, d = new Date(), t = departs(), dep = new Date(Date.now() + t * 1000), hm = q => String(q.getHours()).padStart(2, '0') + ':' + String(q.getMinutes()).padStart(2, '0');
        txt(ctx, 'NOZOMI ' + hm(dep), bx + 4, by + 3, '#ff9a3a'); txt(ctx, 'TRACK ' + o.track, bx + 72, by + 3, '#ff9a3a'); txt(ctx, o.dest, bx + 118, by + 3, '#ffd84a');
        txt(ctx, 'HIKARI ' + hm(new Date(dep.getTime() + 600000)), bx + 4, by + 11, '#c87a3a'); txt(ctx, 'TRACK ' + (o.track + 1), bx + 72, by + 11, '#c87a3a');
        txt(ctx, t < 30 && G.t % 1 < 0.5 ? 'NOW BOARDING' : 'IN ' + mmss(t), bx + 118, by + 11, t < 30 ? '#5ad88a' : '#c8c0d4'); txt(ctx, hm(d), bx + 182, by + 3, '#f4f1e6');
      } });
      // ticket gates in front of each stair, with low barriers between
      for (const [a, b] of [[124, 196], [444, 516]]) for (let gx = a; gx <= b; gx += 24) { put(SPR.gate, gx, 214, 4, 15); block(gx - 4, 206, gx + 4, 214); }
      for (const [a, b] of [[0, 120], [200, 440], [520, x2]]) { R(g, a, 204, b - a, 10, '#a89a8a'); R(g, a, 204, b - a, 2, '#d8ccb8'); R(g, a, 213, b - a, 1, '#6a6058'); block(a, 204, b, 214); }
      // the concourse: pillars, and streams of people crossing it both ways
      for (const px of [96, 320, 544]) for (const py of [300, 396]) { put(SPR.pillar, px, py, 8, 45); block(px - 7, py - 5, px + 7, py); M.SHD.push([px, py, 10, 2.5]); }
      const lanes = [[236, 1, 46], [256, -1, 38], [276, 1, 56], [322, -1, 50], [344, 1, 42], [366, -1, 60], [420, 1, 40], [444, -1, 52]];
      lanes.forEach(([ly, dir, sp], k) => { const n = 4 + (k % 3); for (let i = 0; i < n; i++) { const r = RNG(k * 31 + i * 7 + id.length), wi = (k * 5 + i * 3) % WALK.length; M.ACT.push({ F: look(WALK[wi], WCOL[(k * 3 + i) % WCOL.length]), x: (i + r() * 0.6) * x2 / n, y: ly + (r() - 0.5) * 6, vx: dir * (sp + r() * 14), dir: dir > 0 ? 'r' : 'l', mv: true, wt: r() * 2, ph: k * 7 + i, sayT: 0, bump: 0, upd: commuter }); } });
      // the entrance hall: bento, souvenirs, and the way out to the city
      R(g, 0, 470, x2, 2, '#c8c0b4'); R(g, 0, 528, x2, 16, '#3a3446'); R(g, 270, 528, 100, 16, '#8ab0d0'); for (let x = 270; x < 370; x += 20) R(g, x, 528, 1, 16, '#5a6a88'); block(0, 532, 270, 544); block(370, 532, x2, 544);
      txtC(g, o.name, 320, 486, '#c8bca8');
      prop('stall', 96, 506, 13); const b = npc('office', 96, 518, { tint: '#c8382e', lines: ['EKIBEN! STATION BENTO!'] }); b.spot = { label: 'BUY AN EKIBEN', lines: ['EKIBEN: ' + o.bento[0] + '.', o.bento[1], 'YOU WILL EAT IT ON THE TRAIN, WATCHING THE COUNTRY GO PAST. THAT IS THE RULE.'] };
      prop('stall', 544, 506, 13); npc('kimono', 544, 518, { lines: ['SOUVENIRS FOR THE OFFICE! EVERY BOX HAS TWELVE LITTLE CAKES IN IT.', 'ONE FOR EACH COLLEAGUE. IT IS EXPECTED.'] });
      prop('vend', 200, 508, 6); prop('vend3', 440, 508, 6);
      M.SPOTS.push({ x: 320, y: 526, r: 16, label: 'OUT TO THE CITY', fn() { Snd.fx('page'); go(o.hub); if (M.sk) { pl.x = M.sk[0]; pl.y = M.sk[1] + 4; pl.dir = 'd'; camSnap(); } } });
      M.st = [320, 514]; M.LIGHTS = [];
    } };
}
