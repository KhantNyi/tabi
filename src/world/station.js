'use strict';
// ---------- the big stations: a crowded shinkansen concourse between the city and the train ----------
// At Tokyo, Kyoto and Osaka the blue shinkansen sign leads into the station rather than straight onto a train. It has two
// levels. Up top, the platform, with the train waiting at it and its roof catching the light. A stone wall drops from the
// platform's edge to the concourse below; escalators go down through it, and shops and the departure board are built into
// it. On the concourse, commuters hurry across in streams (walk into one and it carries you a little way), then ticket gates
// and, at the bottom, the doors out to the city. Yellow EXIT signs and blue SHINKANSEN signs point the way, as in a real
// station. Nothing to win or lose: the board counts down to the next train, and another always comes.
// concourse(id, { name, hub, music, track, dest, bento: [name, what it is] }) defines the map; the city lists it as concourse.
const STA = { sprites: false, doors: [192, 320, 448], esc: [224, 416] };
function stationSprites() {
  if (STA.sprites) return; STA.sprites = true;
  one('n700', 640, 96, g => { // the train in 3/4: its long roof on top, the white side below, nose to the left
    for (let y = 8; y < 34; y++) { const x0 = Math.round(68 - (y - 8) * 1.4); R(g, x0, y, 640 - x0, 1, y < 10 ? '#f4f2ee' : y % 7 === 3 ? '#b8b4ac' : '#d4d0c8'); }
    for (let x = 160; x < 640; x += 160) { R(g, x - 2, 9, 4, 25, '#a8a49c'); R(g, x - 2, 9, 4, U, '#e8e4dc'); }
    for (const x of [262, 582]) { R(g, x - 6, 12, 12, 2, '#3a3446'); line1(g, x - 6, 12, x, 4, '#3a3446'); line1(g, x + 6, 12, x, 4, '#3a3446'); R(g, x - 4, 3, 8, U, '#3a3446'); }
    for (let y = 34; y < 82; y++) { const x0 = Math.max(0, Math.round(34 - (y - 34) * 0.95)); R(g, x0, y, 640 - x0, 1, y < 36 ? '#ffffff' : '#f4f1e6'); if (y >= 60 && y < 64) R(g, x0, y, 640 - x0, 1, '#2f5ab0'); if (y === 66) R(g, x0 + 2, y, 638 - x0, 1, '#2f5ab0'); }
    R(g, 34, 38, 26, 8, '#1d2a44'); R(g, 36, 39, 18, 1, '#5a7aa8');
    for (let x = 70; x < 640; x += 10) if (!STA.doors.some(d => Math.abs(x + 3 - d) < 12) && (x + 20) % 160 > 18) R(g, x, 44, 7, 8, '#2a3a5a');
    for (const x of STA.doors) { R(g, x - 8, 37, 16, 41, '#e4e0d8'); R(g, x - 8, 37, U, 41, '#b8b4ac'); R(g, x + 8 - U, 37, U, 41, '#b8b4ac'); R(g, x - U / 2, 37, U, 41, '#c8c4bc'); R(g, x - 6, 42, 5, 10, '#2a3a5a'); R(g, x + 1, 42, 5, 10, '#2a3a5a'); }
    for (let x = 160; x < 640; x += 160) { R(g, x - 2, 34, 4, 48, '#5a5468'); R(g, x - 3, 36, 6, 44, '#3a3446'); }
    R(g, 10, 80, 630, 5, '#8a8496'); R(g, 10, 80, 630, U, '#c8c0d4'); for (let x = 60; x < 640; x += 80) { disc(g, x, 87, 4, '#2a2430'); disc(g, x + 16, 87, 4, '#2a2430'); }
  });
  one('gate', 10, 18, g => { R(g, 0, 2, 10, 16, '#b8b0c0'); R(g, 0, 2, 10, 3, '#e4dcec'); R(g, 0, 17, 10, 1, '#6b6478'); R(g, 1, 6, 8, 4, '#2a3a5a'); R(g, 2, 7, 3, 2, '#5ad88a'); R(g, 6, 7, 2, 2, '#e0563f'); R(g, 9, 2, 1, 16, '#8a8496'); }, 1);
  one('pillar', 18, 56, g => { R(g, 1, 0, 16, 56, '#e4ddd0'); R(g, 1, 0, 3, 56, '#f8f2e6'); R(g, 14, 0, 3, 56, '#b8b0a4'); R(g, 0, 52, 18, 4, '#9a9288'); R(g, 0, 0, 18, 3, '#c8c0b4'); R(g, 3, 14, 12, 20, '#3f7ab0'); R(g, 4, 15, 10, 8, '#f2c14e'); R(g, 4, 25, 10, 1, '#f4f1e6'); R(g, 4, 28, 7, 1, '#f4f1e6'); }, 1);
  // hanging signs: yellow for the way out, blue for the trains, each with an arrow
  const hang = (name, w, col, ink, text, up) => one(name, w, 34, g => { R(g, w / 2 - 1, 0, 2, 16, '#6b6478'); R(g, 0, 15, w, 17, '#1d1626'); R(g, 1, 16, w - 2, 15, col); R(g, 1, 16, w - 2, U, lite(col, 0.4)); txt(g, text, 13, 21, ink); const ax = 6, ay = 23.5; for (let i = 0; i < 4; i++) R(g, ax - i + 0.5, up ? ay - 2 + i : ay + 2 - i, i * 2 + 1, 1, ink); R(g, ax, up ? ay + 2 : ay - 4, 1.5, 3, ink); }, 1);
  hang('exitsign', 40, '#f2c14e', '#1d1626', 'EXIT', false); hang('upsign', 64, '#2f5ab0', '#fff8e8', 'SHINKANSEN', true);
}
const BUMP = ['SUMIMASEN!', 'OOPS, SORRY!', 'GOMEN!', 'EXCUSE ME!', 'COMING THROUGH!'];
const departs = () => 150 - Math.floor(worldTime()) % 150; // a Nozomi every two and a half minutes, the same for everyone
const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
// one commuter in a stream: walks the lane and wraps round off the side of the map. If you are in the way they slow down,
// and carry you a little way along and out of their lane.
function commuter(n, dt) {
  const dx = pl.x - n.x, dy = pl.y - n.y, close = Math.abs(dx) < 9 && Math.abs(dy) < 6 && G.state === 'play';
  const v = close && Math.sign(dx) === Math.sign(n.vx) ? n.vx * 0.25 : n.vx;
  n.x += v * dt; n.wt += dt; if (n.x > M.w + 14) n.x = -14; else if (n.x < -14) n.x = M.w + 14;
  if (n.bump > 0) n.bump -= dt;
  if (close) { step(pl, v * dt * 0.6, (dy >= 0 ? 1 : -1) * 22 * dt); if (n.bump <= 0) { n.bump = 4; say(n, BUMP[(n.ph * 7 + (G.t | 0)) % BUMP.length]); Snd.fx('land'); } }
}
function concourse(id, o) {
  const leave = () => { Snd.fx('page'); go(o.hub); if (M.sk) { pl.x = M.sk[0]; pl.y = M.sk[1] + 16; pl.dir = 'd'; camSnap(); } };
  MAPS[id] = { station: 1, name: o.name, sub: 'SHINKANSEN TO ' + o.dest, tw: 40, th: 36, music: o.music,
    hud: () => 'NOZOMI ' + o.track + ' - DEPARTS IN ' + mmss(departs()),
    zones: [[0, 0, 640, 222, o.name, 'SHINKANSEN PLATFORM ' + o.track], [0, 222, 640, 576, o.name, 'FOLLOW THE YELLOW SIGNS TO THE EXIT']],
    lay() { tRect(PL, 0, 0, 40, 36); },
    // walking out through the doors at the bottom takes you out to the city; so does E on the doormat
    tick() { if (pl.y > 566 && Math.abs(pl.x - 320) < 46 && G.state === 'play') leave(); },
    deco() {
      stationSprites(); const g = M.ground.g, x2 = M.w;
      // up top: the far track, the train and the platform
      R(g, 0, 0, x2, 100, '#2e2a38'); for (let y = 3; y < 10; y += 3) R(g, 0, y, x2, 1, '#3e3848'); R(g, 0, 4, x2, 1, '#8a8496');
      put(SPR.n700, 320, 99, 320, 95); block(0, 0, x2, 102);
      R(g, 0, 100, x2, 6, '#e8c84a'); for (let x = 2; x < x2; x += 4) for (const y of [101.5, 104]) p1(g, x, y, '#c8a830'); R(g, 0, 106, x2, 1, '#f8f6f0');
      for (const x of STA.doors) { M.SPOTS.push({ x, y: 112, r: 16, label: 'BOARD THE SHINKANSEN', shink: 1 }); R(g, x - 10, 108, 20, 6, '#d8d0b8'); txtC(g, String(STA.doors.indexOf(x) + 5), x, 108.5, '#8a7a5a'); }
      for (const x of [160, 288, 352, 480]) put(SPR.exitsign, x, 168, 20, 33);
      npc('salary', 300, 124, { dir: 'u', lines: ['THE GREEN CAR IS FOR PEOPLE WHOSE COMPANIES PAY.', 'I AM IN CAR SEVEN, WITH EVERYBODY ELSE.'] });
      npc('tourist', 470, 130, { dir: 'u', lines: ['THEY CLEAN THE WHOLE TRAIN IN SEVEN MINUTES. I TIMED IT.', 'THEY BOWED TO US WHEN THEY FINISHED.'] });
      npc('granny', 150, 150, { lines: ['I HAVE MY BENTO, MY TEA AND MY SEAT. NOW I AM HAPPY.'] }); prop('bench', 500, 186, 9);
      // the platform's edge: a stone wall down to the concourse, with escalators, shops and the departure board in it
      ledge([[0, 200], [320, 200], [x2, 200]], 22, 'stone'); for (const x of STA.esc) { steps(x, 198, 40, 26, '#a8a4a0'); for (const sx of [x - 24, x + 20]) { R(g, sx, 190, 4, 36, '#3a3446'); R(g, sx, 190, 4, 1.5, '#6a6478'); } }
      block(0, 120, 124, 200); block(516, 120, x2, 200); // behind the shops
      tower(62, 226, 108, 46, { c: '#d8c8b0', sign: 'EKIBEN', sc: '#c8382e', top: false, lit: 0.6 }); tower(578, 226, 108, 46, { c: '#c8d4e0', sign: 'SOUVENIRS', sc: '#3f7ab0', top: false, lit: 0.6 });
      M.SPOTS.push({ x: 62, y: 234, r: 16, label: 'BUY AN EKIBEN', lines: ['EKIBEN: ' + o.bento[0] + '.', o.bento[1], 'YOU WILL EAT IT ON THE TRAIN, WATCHING THE COUNTRY GO PAST. THAT IS THE RULE.'] });
      M.SPOTS.push({ x: 578, y: 234, r: 16, label: 'LOOK', lines: ['BOXES OF LITTLE CAKES FOR THE OFFICE, TWELVE TO A BOX.', 'ONE FOR EACH COLLEAGUE. IT IS EXPECTED.'] });
      R(g, 252, 200, 136, 22, '#1d1626'); R(g, 254, 202, 132, 18, '#120e1a');
      M.ACT.push({ x: 320, y: 223, sayT: 0, always: true, draw(e, x, y) { // the board: the next trains and a clock
        const bx = x - 66, by = y - 21, t = departs(), dep = new Date(Date.now() + t * 1000), hm = q => String(q.getHours()).padStart(2, '0') + ':' + String(q.getMinutes()).padStart(2, '0');
        txt(ctx, 'NOZOMI ' + hm(dep), bx + 3, by + 2, '#ff9a3a'); txt(ctx, o.dest, bx + 70, by + 2, '#ffd84a'); txt(ctx, hm(new Date()), bx + 108, by + 2, '#f4f1e6');
        txt(ctx, 'TRACK ' + o.track, bx + 3, by + 10, '#c87a3a'); txt(ctx, t < 30 && G.t % 1 < 0.5 ? 'BOARDING' : 'IN ' + mmss(t), bx + 70, by + 10, t < 30 ? '#5ad88a' : '#c8c0d4');
      } });
      // the gates below the escalators, with low barriers between, and blue signs back up to the trains
      for (const x of STA.esc) { for (const gx of [x - 46, x - 20, x + 20, x + 46]) { put(SPR.gate, gx, 262, 5, 17); block(gx - 3, 254, gx + 3, 262); } put(SPR.upsign, x, 290, 32, 33); }
      for (const [a, b] of [[0, STA.esc[0] - 49], [STA.esc[0] + 49, STA.esc[1] - 49], [STA.esc[1] + 49, 640]]) { /* a lane runs straight down from each escalator */ R(g, a, 252, b - a, 10, '#a89a8a'); R(g, a, 252, b - a, 2, '#d8ccb8'); R(g, a, 261, b - a, 1, '#6a6058'); block(a, 252, b, 262); }
      // the concourse: tall pillars, and streams of people crossing both ways
      for (const px of [128, 272, 368, 512]) for (const py of [348, 448]) { /* clear of the lines down from each escalator and to the doors */ put(SPR.pillar, px, py, 9, 55); block(px - 8, py - 6, px + 8, py); M.SHD.push([px, py, 12, 3]); }
      for (let k = 0; k < 9; k++) { const x = 40 + k * 70, y = 300 + (k % 3) * 70; R(g, x, y, 30, 1, 'rgba(255,255,255,0.35)'); R(g, x + 6, y + 2, 18, 1, 'rgba(255,255,255,0.25)'); } // ceiling lights caught in the floor
      const lanes = [[284, 1, 46], [304, -1, 38], [324, 1, 56], [370, -1, 50], [392, 1, 42], [414, -1, 60], [472, 1, 40], [494, -1, 52]];
      lanes.forEach(([ly, dir, sp], k) => { const n = 3 + (k % 3); for (let i = 0; i < n; i++) { const r = RNG(k * 31 + i * 7 + id.length), wi = (k * 5 + i * 3) % WALK.length; M.ACT.push({ F: look(WALK[wi], WCOL[(k * 3 + i) % WCOL.length]), x: (i + r() * 0.6) * x2 / n, y: ly + (r() - 0.5) * 6, vx: dir * (sp + r() * 14), dir: dir > 0 ? 'r' : 'l', mv: true, wt: r() * 2, ph: k * 7 + i, sayT: 0, bump: 0, upd: commuter }); } });
      // the way out: signs, an arrow on the floor, and glass doors with daylight behind them
      for (const x of [96, 544]) put(SPR.exitsign, x, 470, 20, 33); put(SPR.exitsign, 320, 536, 20, 33);
      for (let i = 0; i < 4; i++) R(g, 314 - i * 3, 512 + i * 3, 12 + i * 6, 3, 'rgba(242,193,78,0.55)'); R(g, 317, 498, 6, 14, 'rgba(242,193,78,0.55)'); txtC(g, 'EXIT', 320, 528, '#c8a040');
      R(g, 0, 568, x2, 8, '#3a3446'); R(g, 270, 566, 100, 10, '#fff4d0'); for (let x = 270; x < 370; x += 20) R(g, x, 566, 1, 10, '#a8a090'); block(0, 572, 270, 576); block(370, 572, x2, 576);
      txtC(g, o.name, 320, 548, '#b8ac98'); prop('vend', 180, 556, 6); prop('vend3', 460, 556, 6); prop('bench', 110, 552, 9); prop('bench', 530, 552, 9);
      M.SPOTS.push({ x: 320, y: 562, r: 18, label: 'OUT TO THE CITY', fn: leave });
      M.st = [320, 550]; M.LIGHTS = [];
    } };
}
