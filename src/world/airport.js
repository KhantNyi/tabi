'use strict';
// ---------- airports: where a trip begins, where you can fly between cities, and where it can end ----------
// airport(id, o) builds a terminal the way concourse() builds a station. Behind the glass at the top, the airfield: your
// plane at its jet bridge, tugs pulling baggage carts, others taxiing past. Below it the building splits in two:
//   departures on the left: the gate lounge (rows of seats, the desk where you choose a flight), then security lanes
//   whose arches beep as you walk through, then the check-in counters;
//   arrivals on the right: the door you step out of after a flight, a moving walkway, the immigration booths, the
//   baggage carousel turning with everyone's suitcases, then customs.
// Both open into the main hall: a departure board whose letters flip, an IC card machine, a money exchange, information,
// shops, travellers wheeling suitcases, announcements with their two-note chime, and at the bottom the trains and buses.
// A new trip starts with a landing at Haneda (AIR.intro). From any gate you can fly to the other airport, or fly home:
// that ends the trip with a scrapbook, and you can still keep wandering after it.
const AIR = (function () {
  const rnd = Math.random, pick = a => a[rnd() * a.length | 0];
  const S = () => Snd.ctx && Snd.ctx.state === 'running' ? Snd.ctx.currentTime + 0.01 : 0;
  const tone = (type, f, t, d, v, o) => Snd.tone(type, f, t, d, v, Object.assign({ bus: Snd.sfx }, o || {}));
  const SND = {
    pinpon() { const t = S(); if (t) { tone('sine', nf('E6'), t, 0.6, 0.06, { pluck: 1, echo: 1 }); tone('sine', nf('C6'), t + 0.32, 0.9, 0.06, { pluck: 1, echo: 1 }); } },
    beep() { const t = S(); if (t) tone('square', 1760, t, 0.12, 0.03, { lp: 3000 }); },
    roar(v) { const t = S(); if (t) { Snd.noise(t, 0.5, 0.06 * v, 120, 900, Snd.sfx); Snd.noise(t, 0.5, 0.03 * v, 1500, 4000, Snd.sfx); } },
    hum() { const t = S(); if (t) Snd.noise(t, 0.45, 0.02, 80, 500, Snd.sfx); },
    flap() { const t = S(); if (t) for (let k = 0; k < 6; k++) Snd.noise(t + k * 0.03, 0.02, 0.015, 1500, 4000, Snd.sfx); }
  };
  const PORTS = {}; // id -> { name, short, code, city }

  // ---------- sprites ----------
  function sprites() {
    // a jet in profile, nose to the right: white body, blue belly line and tail, the near wing and engine toward you
    one('jet', 224, 66, g => {
      for (let y = 0; y < 22; y++) { const x0 = 8 + y * 0.75, x1 = 30 + y * 0.9; R(g, x0, y, x1 - x0, 1, y < 2 ? '#4a7ad0' : '#2f5ab0'); } disc(g, 22, 10, 4, '#f4f1e6'); disc(g, 22, 10, 2.6, '#c8382e');
      for (let y = 20; y < 40; y++) { const tl = 30 - (y < 26 ? (26 - y) * 2.5 : 0) - (y > 34 ? (y - 34) * 3 : 0); R(g, Math.max(14, tl), y, 186 - Math.max(14, tl), 1, y < 22 ? '#ffffff' : y > 34 ? '#d8d4cc' : '#f4f1e6'); }
      ell(g, 196, 30, 18, 10, '#f4f1e6'); ell(g, 198, 27, 14, 6, '#ffffff'); ell(g, 212, 31, 4, 4, '#d8d4cc'); R(g, 200, 24, 9, 3, '#2a3a5a'); R(g, 200, 24, 9, U, '#5a7aa8');
      R(g, 28, 33, 176, 2, '#2f5ab0'); for (let x = 46; x < 180; x += 5) R(g, x, 25, 2, 2.5, '#3a4a6a'); for (const x of [40, 120, 182]) { R(g, x, 23, 5, 9, '#e4e0d8'); R(g, x, 23, 5, U, '#b8b4ac'); }
      ell(g, 18, 25, 12, 2.5, '#d8d4cc');
      for (let y = 34; y < 54; y++) { const a = 92 - (y - 34) * 1.7, b = 124 - (y - 34) * 2.4; R(g, a, y, b - a, 1, y < 36 ? '#e4e0e8' : '#c8c4cc'); } R(g, 58, 53, 18, 1.5, '#a8a4b0'); R(g, 60, 52, 3, 2, '#e0452f');
      ell(g, 104, 46, 12, 5.5, '#a8a4b0'); ell(g, 103, 45, 11, 4, '#c8c4cc'); ell(g, 114, 46, 3, 4.5, '#3a3446'); ell(g, 114, 46, 1.5, 3, '#6a6478');
      for (const [x, y] of [[64, 44], [150, 44], [190, 42]]) { R(g, x, 38, 1.5, y - 38, '#6b6478'); disc(g, x + 0.5, y + 2, 2.6, '#2a2430'); disc(g, x + 0.5, y + 2, 1, '#8a8496'); }
    }, 1);
    SPR.jetL = flip(SPR.jet); txt(SPR.jet.g, 'TABI AIR', 67, 27.5, '#2f5ab0'); txt(SPR.jetL.g, 'TABI AIR', SPR.jet.lw - 67 - tw('TABI AIR'), 27.5, '#2f5ab0'); // the name is painted after flipping, so it reads the right way on both
    one('seats', 58, 16, g => { for (let k = 0; k < 4; k++) { const x = 1 + k * 14; R(g, x, 1, 12, 7, '#2f5ab0'); R(g, x, 1, 12, 1.5, '#5a8ae0'); R(g, x, 7, 12, 3, '#3a6ac0'); R(g, x + 1, 10, 10, 1, '#1d2a50'); } R(g, 0, 11, 58, 1.5, '#b8b4c4'); for (const x of [3, 28, 53]) R(g, x, 12, 1.5, 4, '#8a8496'); }, 1);
    one('arch', 34, 40, g => { for (const x of [1, 29]) { R(g, x, 4, 4, 36, '#b8b4c4'); R(g, x, 4, 1, 36, '#e4e0ec'); R(g, x + 3, 4, 1, 36, '#8a8496'); } R(g, 1, 0, 32, 5, '#b8b4c4'); R(g, 1, 0, 32, 1, '#e4e0ec'); R(g, 13, 1.5, 8, 2, '#2a3a5a'); R(g, 14, 2, 2, 1, '#5ad88a'); }, 1);
    one('xray', 46, 22, g => { R(g, 0, 10, 46, 9, '#8a8496'); R(g, 0, 10, 46, 1, '#c8c0d4'); for (let x = 2; x < 46; x += 4) R(g, x, 12, 2, 1, '#5a5468'); R(g, 14, 0, 18, 12, '#d8d4e0'); R(g, 14, 0, 18, 1, '#ffffff'); R(g, 15, 9, 16, 3, '#2a2430'); for (const x of [16, 20, 24, 28]) R(g, x, 9.5, 2, 2, '#1d1626'); R(g, 0, 19, 2, 3, '#6b6478'); R(g, 44, 19, 2, 3, '#6b6478'); R(g, 4, 8, 8, 2, '#c8c0d4'); }, 1);
    one('booth', 34, 30, g => { R(g, 1, 12, 32, 18, '#c8c0d4'); R(g, 1, 12, 32, 1.5, '#ffffff'); R(g, 1, 28, 32, 2, '#8a8496'); R(g, 3, 1, 28, 11, '#bfe8ff'); R(g, 3, 1, 28, 1, '#ffffff'); R(g, 3, 1, 1, 11, '#8ab0d0'); R(g, 30, 1, 1, 11, '#8ab0d0'); R(g, 6, 16, 22, 3, '#2f5ab0'); }, 1);
    one('desk', 62, 22, g => { R(g, 0, 6, 62, 14, '#e8e4ec'); R(g, 0, 6, 62, 1.5, '#ffffff'); R(g, 0, 18, 62, 2, '#8a8496'); R(g, 0, 10, 62, 3, '#2f5ab0'); for (const x of [14, 46]) { R(g, x - 5, 0, 10, 7, '#2a2430'); R(g, x - 4, 1, 8, 4, '#5a8ae0'); } }, 1);
    one('kiosk', 16, 26, g => { R(g, 1, 2, 14, 24, '#3f9a5a'); R(g, 1, 2, 14, 1.5, '#8fd070'); R(g, 3, 5, 10, 7, '#1d2a44'); R(g, 4, 6, 8, 5, '#5ad8f0'); R(g, 5, 14, 6, 2, '#f4f1e6'); R(g, 4, 18, 8, 1, '#1d1626'); R(g, 0, 25, 16, 1, '#2a5a3a'); }, 1);
    one('tug', 96, 20, g => { R(g, 2, 6, 18, 9, '#f2c14e'); R(g, 2, 6, 18, 1, '#ffe08a'); R(g, 10, 2, 8, 5, '#bfe8ff'); for (let k = 0; k < 3; k++) { const x = 26 + k * 23; R(g, x, 6, 20, 9, '#8a8496'); R(g, x, 6, 20, 1, '#c8c0d4'); for (let j = 0; j < 3; j++) R(g, x + 2 + j * 6, 3, 5, 4, ['#e0563f', '#2f5ab0', '#3f9a5a', '#f06a8c'][(k + j) % 4]); R(g, x - 4, 10, 4, 1, '#2a2430'); } for (let x = 5; x < 96; x += 11.5) disc(g, x, 16, 2.4, '#2a2430'); }, 1);
    icon('passport', g => { R(g, 2, 1, 8, 10, '#8a2a3a'); R(g, 2, 1, 8, 1, '#b84a5a'); disc(g, 6, 6, 2, '#f2c14e'); R(g, 3, 9, 6, 1, '#f2c14e'); });
    icon('suitcase', g => { R(g, 2, 3, 8, 8, '#2f5ab0'); R(g, 2, 3, 8, 1, '#5a8ae0'); R(g, 4, 1, 4, 2, '#2a2430'); R(g, 2, 7, 8, 1, '#1d2a50'); R(g, 7, 4, 2, 3, '#e0452f'); });
    icon('plane', g => { R(g, 1, 5, 10, 2, '#f4f1e6'); R(g, 4, 2, 3, 8, '#c8c4cc'); R(g, 1, 3, 2, 3, '#2f5ab0'); R(g, 9, 5, 2, 2, '#2a3a5a'); });
    icon('ticket', g => { R(g, 0, 3, 12, 7, '#f4f1e6'); R(g, 0, 3, 12, 1, '#ffffff'); R(g, 8, 3, U, 7, '#8a8496'); R(g, 2, 5, 5, 1, '#2f5ab0'); R(g, 2, 7, 3, 1, '#2f5ab0'); P(g, 10, 5, '#e0452f'); });
  }

  // ---------- people with suitcases ----------
  const CASEC = ['#2f5ab0', '#e0563f', '#3a3a4e', '#f2c14e', '#8a6aff', '#3f9a5a', '#c8c0d4', '#f06a8c'];
  function traveller(ly, dir, sp, i, k) { const r = RNG(k * 31 + i * 7), x2 = M.w;
    M.ACT.push({ F: look(WALK[(k * 5 + i * 3) % WALK.length], WCOL[(k * 3 + i) % WCOL.length]), x: (i + r() * 0.6) * x2 / 4, y: ly + (r() - 0.5) * 6, vx: dir * (sp + r() * 10), dir: dir > 0 ? 'r' : 'l', mv: true, wt: r() * 2, ph: k * 7 + i, sayT: 0, bump: 0, cc: CASEC[(i + k) % CASEC.length], upd: commuter,
      draw(e, x, y) { const s = e.vx > 0 ? 1 : -1, cx = x - s * 9; ell(ctx, x, y, 6, 2, 'rgba(22,30,50,0.32)'); ell(ctx, cx, y, 4, 1.4, 'rgba(22,30,50,0.25)'); R(ctx, cx - 3.5, y - 12, 7, 10, e.cc); R(ctx, cx - 3.5, y - 12, 7, 1, lite(e.cc, 0.35)); R(ctx, cx - 3.5, y - 7, 7, U, dark(e.cc, 0.3)); line1(ctx, cx + s * 2, y - 12, x - s * 3, y - 15, '#6b6478'); disc(ctx, cx - 2, y - 1, 1, '#1d1626'); disc(ctx, cx + 2, y - 1, 1, '#1d1626'); ctx.drawImage(frameOf(e), snap(x - 10), snap(y - 27)); } }); }

  // ---------- the departure board ----------
  const CITIESX = ['OSAKA', 'SAPPORO', 'NAHA', 'FUKUOKA', 'SEOUL', 'TAIPEI', 'LONDON', 'HONOLULU', 'SINGAPORE', 'PARIS', 'SYDNEY', 'NEW YORK'];
  function boardRows(code, other) { const base = Math.floor(worldTime() / 40), out = []; for (let k = 0; k < 5; k++) { const n = base + k, c = k === 0 && other ? other : CITIESX[(n * 7) % CITIESX.length], hhmm = new Date(Date.now() + (k * 40 + 40 - worldTime() % 40) * 1000); out.push(['TA ' + String((n * 37) % 900 + 100), c === 'OSAKA' && code === 'KIX' ? 'TOKYO' : c, String(hhmm.getHours()).padStart(2, '0') + ':' + String(hhmm.getMinutes()).padStart(2, '0'), k === 0 ? 'BOARDING' : k === 1 ? 'GATE OPEN' : 'ON TIME']); } return out; }
  const FLAPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function drawBoard(e, x, y, code, other) {
    const bw = 196, bh = 40, bx = x - bw / 2, by = y - 70; for (const k of [bx + 20, bx + bw - 20]) R(ctx, k, by - 30, 1, 30, '#8a8496');
    R(ctx, bx - 2, by - 2, bw + 4, bh + 4, '#2a2430'); R(ctx, bx, by, bw, bh, '#120e1a'); txt(ctx, 'DEPARTURES', bx + 4, by + 2, '#f2c14e'); txt(ctx, code, bx + bw - 4 - tw(code), by + 2, '#8a8496');
    const rows = boardRows(code, other), n = Math.floor(worldTime() / 40); if (e.last !== n) { e.last = n; e.flip = 0.8; if (Math.hypot(e.x - pl.x, e.y - pl.y) < 200) SND.flap(); } if (e.flip > 0) e.flip -= 1 / 60;
    rows.forEach((r, i) => { const yy = by + 10 + i * 6; [[r[0], 4, '#f4f1e6'], [r[1], 40, '#ffd84a'], [r[2], 112, '#f4f1e6'], [r[3], 140, r[3] === 'BOARDING' ? (G.t % 1 < 0.6 ? '#5ad88a' : '#2a6a4a') : '#c8c0d4']].forEach(([s, ox, c]) => { let q = s; if (e.flip > 0 && i < 3) q = s.split('').map((ch, j) => ch === ' ' || (e.flip < 0.8 - j * 0.04) ? ch : FLAPS[(j * 7 + (G.t * 30 | 0)) % FLAPS.length]).join(''); txt(ctx, q, bx + ox, yy, c); }); R(ctx, bx, yy + 5.5, bw, U, '#2a2430'); });
  }

  // ---------- the terminal ----------
  function airport(id, o) {
    PORTS[id] = { name: o.name, short: o.short, code: o.code, passport: o.passport };
    const X2 = 768, gate = o.gate, arrive = [580, 184];
    MAPS[id] = { station: 1, airport: 1, name: o.name, sub: o.sub, tw: 48, th: 44, music: o.music,
      hud: () => 'GATE ' + gate + ' - ' + (boardRows(o.code, PORTS[o.other] && PORTS[o.other].short)[0][3]),
      zones: [[0, 150, 372, 320, 'DEPARTURES', 'GATE ' + gate], [396, 150, X2, 336, 'ARRIVALS', o.welcome], [0, 320, 372, 456, 'SECURITY AND CHECK-IN', 'TICKETS AND PASSPORTS READY'], [396, 336, X2, 456, 'BAGGAGE CLAIM', 'CAROUSEL 3'], [0, 456, X2, 704, o.name, 'TRAINS, BUSES, SHOPS']],
      lay() { tRect(PL, 0, 0, 48, 44); },
      tick() { // the moving walkway carries you, and the arches beep as you walk through
        if (G.state !== 'play') return; if (pl.x > 708 && pl.x < 732 && pl.y > 178 && pl.y < 286) step(pl, 0, 40 / 60);
        const lane = [90, 186, 282].find(x => Math.abs(pl.x - x) < 12), on = lane && pl.y > 322 && pl.y < 342; if (on && !M.inArch) { M.inArch = 1; SND.beep(); const gd = M.ACT.find(n => n.guard === lane); if (gd) say(gd, pick(['PLEASE PROCEED.', 'THANK YOU. ENJOY YOUR FLIGHT.', 'ALL CLEAR.'])); } else if (!on) M.inArch = 0;
        if ((M.annT = (M.annT || 18) - 1 / 60) <= 0) { M.annT = 32 + rnd() * 10; SND.pinpon(); NET.say(pick(['FLIGHT TA ' + (100 + (worldTime() | 0) % 800) + ' TO ' + (PORTS[o.other] ? PORTS[o.other].short : 'OSAKA') + ' IS NOW BOARDING AT GATE ' + gate + '.', 'PLEASE DO NOT LEAVE YOUR BAGGAGE UNATTENDED.', 'THE MONORAIL TO THE CITY LEAVES FROM THE LOWER LEVEL.', 'WELCOME TO ' + o.name + '. WE HOPE YOU HAD A PLEASANT FLIGHT.']), 4); }
      },
      deco() {
        stationSprites(); const g = M.ground.g;
        // ---- the airfield behind the glass
        R(g, 0, 0, X2, 150, '#8a8a96'); for (let i = 0; i < 900; i++) R(g, rnd() * X2, rnd() * 150, 2, U, i % 2 ? '#7e7e8a' : '#969aa6');
        if (o.view === 'snow') { R(g, 0, 0, X2, 16, '#e4eaf4'); for (let x = 0; x < X2; x += 22) { R(g, x + 4, 2, 10, 10, '#3f6a5a'); R(g, x + 3, 2, 12, 3, '#f4f8fc'); } for (let i = 0; i < 300; i++) R(g, rnd() * X2, 50 + rnd() * 100, 3, U, '#e4eaf4'); } else if (o.view === 'sea') { dgrad(g, 0, 0, X2, 20, ['#6ab4e0', '#4a9ac8']); for (let x = 0; x < X2; x += 9) R(g, x, 6 + (x % 27) / 3, 5, U, '#b0e0f8'); } else { R(g, 0, 0, X2, 14, '#5a9a6a'); for (let x = 0; x < X2; x += 40) { R(g, x, 4, 26, 6, '#7a8a9a'); R(g, x + 3, 2, 8, 4, '#8a9aaa'); } }
        R(g, 0, 26, X2, 22, '#4a4a56'); for (let x = 0; x < X2; x += 26) R(g, x, 36, 14, 1.5, '#f4f1e6'); for (let x = 6; x < X2; x += 26) { p1(g, x, 27, '#ffd84a'); p1(g, x, 46.5, '#ffd84a'); }
        for (const y of [70, 112]) for (let x = 0; x < X2; x += 4) R(g, x, y, 2, 1, '#e8c84a'); for (const x of [210, 590]) for (let y = 70; y < 150; y += 4) R(g, x, y, 1, 2, '#e8c84a');
        put(SPR.jetL, 230, 132, 112, 65); put(SPR.jetL, 610, 132, 112, 65);
        for (const [x0, x1] of [[150, 186], [530, 566]]) { R(g, x0, 104, x1 - x0, 46, '#c8c4cc'); R(g, x0, 104, x1 - x0, 2, '#e4e0ec'); R(g, x0 + 4, 108, x1 - x0 - 8, 38, '#a8a4b0'); for (let y = 110; y < 146; y += 6) R(g, x0 + 4, y, x1 - x0 - 8, U, '#8a8496'); R(g, x0 + 10, 146, 16, 4, '#6b6478'); }
        M.ACT.push({ x: 0, y: 128, sayT: 0, always: 1, t: rnd() * 30, draw(e, x, y) { e.t += 1 / 60; const p = (e.t % 30) / 30, tx = p < 0.5 ? -100 + p * 2 * (X2 + 200) : X2 + 100 - (p - 0.5) * 2 * (X2 + 200); ctx.drawImage(SPR.tug, snap(tx - (e.x - x) - 48), snap(y - 18)); if (p > 0.5) { /* coming back empty-handed is fine */ } } });
        M.ACT.push({ x: 0, y: 47, sayT: 0, always: 1, t: rnd() * 40, draw(e, x, y) { e.t += 1 / 60; const p = (e.t % 40) / 40; if (p > 0.6) return; const tx = X2 + 140 - p / 0.6 * (X2 + 280); ctx.save(); ctx.translate(tx - (e.x - x), y - 16); ctx.scale(0.5, 0.5); ctx.drawImage(SPR.jetL, -112, -66); ctx.restore(); } });
        // the glass wall
        R(g, 0, 150, X2, 8, '#d8e8f4'); R(g, 0, 150, X2, 1, '#ffffff'); R(g, 0, 157, X2, 1, '#8a9aaa'); for (let x = 0; x < X2; x += 32) R(g, x, 150, 2, 8, '#8a9aaa'); block(0, 0, X2, 160);
        R(g, 0, 158, X2, 546, '#dcd8d0'); for (let y = 158; y < 704; y += 16) for (let x = (y / 16 & 1) * 16; x < X2; x += 32) R(g, x, y, 16, 16, '#d4d0c8'); for (let k = 0; k < 40; k++) R(g, rnd() * X2, 170 + rnd() * 520, 24, U, 'rgba(255,255,255,0.4)');
        // the partition between departures and arrivals
        R(g, 372, 158, 24, 298, '#c8d8e4'); R(g, 372, 158, 2, 298, '#ffffff'); R(g, 394, 158, 2, 298, '#8a9aaa'); for (let y = 170; y < 456; y += 28) R(g, 372, y, 24, 1, '#a8b8c4'); block(372, 158, 396, 456);
        // ---- departures: the gate lounge
        put(SPR.desk, 186, 190, 31, 21); block(156, 182, 216, 190); npc('office', 176, 176, { tint: '#2f5ab0', lines: ['GATE ' + gate + '. WHERE WOULD YOU LIKE TO FLY TODAY?'] }); npc('office', 200, 176, { tint: '#2f5ab0', dir: 'd', lines: ['WE BOW TO EVERY PLANE AS IT PUSHES BACK. IT IS ONLY POLITE.'] });
        M.SPOTS.push({ x: 186, y: 198, r: 15, label: 'BOARD AT GATE ' + gate, fn: () => MENU.open('flight', null, { port: id }) });
        txtC(g, 'GATE ' + gate, 186, 162, '#2f5ab0');
        for (const y of [240, 282]) for (const x of [52, 120, 252, 320]) { prop('seats', x, y, 26); M.SPOTS.push({ x, y: y + 7, r: 10, label: 'SIT DOWN', fn: () => RIDES.sitAt({ x, y }) }); }
        npc('tourist', 120, 226, { dir: 'd', lines: ['MY FLIGHT IS DELAYED. I HAVE EATEN FOUR SANDWICHES.'] }); npc('salary', 290, 268, { dir: 'd', lines: ['I FLY TO OSAKA AND BACK TWICE A WEEK. I KNOW EVERY CLOUD.'] }); npc('kid', 340, 214, { rad: 20, lines: ['THAT PLANE IS AS BIG AS A HOUSE!', 'TWO HOUSES!'] });
        if (o.window) M.SPOTS.push({ x: 86, y: 168, r: 16, label: 'LOOK OUT', stamp: o.window[0], act: 'snap', lines: o.window[1] });
        // security: three lanes, each with an arch, an x-ray belt and a guard
        R(g, 0, 318, 372, 6, '#8a8496'); R(g, 0, 318, 372, 1, '#c8c0d4'); for (const [a, b] of [[0, 76], [104, 172], [200, 268], [296, 372]]) block(a, 316, b, 324);
        for (const x of [90, 186, 282]) { put(SPR.arch, x, 340, 17, 39); block(x - 17, 334, x - 12, 340); block(x + 12, 334, x + 17, 340); prop('xray', x + 40, 340, 22); M.ACT.push(Object.assign(npc('office', x - 30, 346, { tint: '#3a3a4e', dir: 'r', lines: ['NO LIQUIDS OVER A HUNDRED MILLILITRES, PLEASE.'] }), { guard: x })); }
        txtC(g, 'SECURITY', 186, 306, '#8a8496');
        // check-in counters, with an aisle to security
        for (const x of [60, 140, 220]) { put(SPR.desk, x, 420, 31, 21); block(x - 30, 412, x + 30, 420); npc('office', x, 404, { tint: '#3f9a5a', dir: 'd', lines: ['CHECK-IN IS OPEN. HAVE A NICE FLIGHT.'] }); M.SPOTS.push({ x, y: 430, r: 14, label: 'CHECK IN', fn: checkIn }); }
        for (let x = 30; x < 250; x += 10) { R(g, x, 380, 1, 8, '#8a8496'); } R(g, 30, 381, 220, 1, '#c8382e');
        // ---- arrivals: the door from the plane, a moving walkway, immigration
        R(g, 556, 158, 48, 4, '#3f9a5a'); txtC(g, 'ARRIVALS', 580, 164, '#3f9a5a');
        M.ACT.push({ x: 720, y: 290, sayT: 0, always: 1, draw(e, x, y) { const top = y - 112; R(ctx, x - 12, top, 24, 112, '#3a3a4e'); R(ctx, x - 12, top, 2, 112, '#8a8496'); R(ctx, x + 10, top, 2, 112, '#8a8496'); const o2 = (G.t * 20) % 10; for (let k = -1; k < 12; k++) { const yy = top + k * 10 + o2; if (yy > top && yy < y - 3) { R(ctx, x - 4, yy, 8, 1, '#f2c14e'); R(ctx, x - 2, yy + 1, 4, 1, '#f2c14e'); } } } });
        for (let k = 0; k < 6; k++) { const x = 420 + k * 46; R(g, x, 250, 1, 10, '#8a8496'); } R(g, 420, 251, 230, 1, '#2f5ab0');
        for (const x of [440, 500, 560, 620, 680]) { put(SPR.booth, x, 304, 17, 29); block(x - 16, 292, x + 16, 304); npc('salary', x, 290, { tint: '#2a3a5a', dir: 'u', lines: ['WELCOME.'] }); }
        M.SPOTS.push({ x: 560, y: 282, r: 15, label: 'SHOW YOUR PASSPORT', fn: passport });
        // baggage claim: a carousel turning with everyone's suitcases
        ell(g, 580, 384, 118, 30, '#3a3446'); ell(g, 580, 382, 112, 26, '#5a5468'); ell(g, 580, 382, 92, 16, '#8a8496'); ell(g, 580, 381, 90, 14, '#c8c0d4'); block(466, 360, 694, 404);
        M.ACT.push({ x: 580, y: 384, sayT: 0, always: 1, draw(e, x, y) { const t = G.t * 0.04; for (let k = 0; k < 14; k++) { const a = (k / 14 + t) * 6.283, cx = x + Math.cos(a) * 102, cy = y - 2 + Math.sin(a) * 21, c = CASEC[k % CASEC.length]; R(ctx, cx - 4, cy - 6, 8, 6, c); R(ctx, cx - 4, cy - 6, 8, 1, lite(c, 0.35)); R(ctx, cx - 1, cy - 7, 2, 1, '#2a2430'); } } });
        M.SPOTS.push({ x: 580, y: 418, r: 16, label: 'FIND YOUR SUITCASE', fn: () => { G.state = 'mini'; G.mg = { k: 'bags', sp: { stamp: o.bagStamp }, t: 0 }; MG.bags.init(G.mg); Snd.fx('ui'); } });
        npc('granny', 490, 420, { dir: 'u', lines: ['MINE IS THE GREEN ONE WITH THE RIBBON. THEY ARE ALL GREEN WITH A RIBBON.'] }); npc('tourist', 680, 420, { dir: 'u', lines: ['EVERY SUITCASE COMES OUT THE SAME WAY UP. THE STAFF TURN THEM.'] });
        // customs, with a green NOTHING TO DECLARE gap
        for (const [a, b] of [[396, 556], [604, X2]]) { R(g, a, 446, b - a, 8, '#8a8496'); R(g, a, 446, b - a, 1, '#c8c0d4'); block(a, 444, b, 454); } R(g, 556, 446, 48, 3, '#3f9a5a'); txtC(g, 'NOTHING TO DECLARE', 580, 438, '#3f9a5a'); npc('office', 520, 432, { tint: '#3a3a4e', dir: 'r', lines: ['ANYTHING TO DECLARE? NO? WELCOME, AND ENJOY YOUR STAY.'] });
        // ---- the main hall
        M.ACT.push({ x: 384, y: 512, sayT: 0, always: 1, draw(e, x, y) { drawBoard(e, x, y, o.code, PORTS[o.other] && PORTS[o.other].short); } });
        for (const x of [120, 300, 468, 648]) { put(SPR.pillar || SPR.desk, x, 576, SPR.pillar ? 9 : 31, SPR.pillar ? 55 : 21); block(x - 8, 570, x + 8, 576); }
        for (const x of [40, 58]) prop('kiosk', x, 520, 8); M.SPOTS.push({ x: 49, y: 528, r: 14, label: 'BUY AN IC CARD', fn: icCard });
        put(SPR.desk, 140, 506, 31, 21); block(110, 498, 170, 506); npc('office', 140, 490, { tint: '#c8382e', lines: ['YEN? WE CHANGE ANY MONEY.'] }); M.SPOTS.push({ x: 140, y: 514, r: 14, label: 'CHANGE MONEY', lines: ['YOU CHANGE SOME MONEY. THE NOTES HAVE FAMOUS FACES ON THEM, AND THE COINS HAVE HOLES IN THE MIDDLE.', 'THE CLERK COUNTS IT TWICE AND HANDS IT OVER WITH BOTH HANDS.'] });
        put(SPR.desk, 384, 640, 31, 21); block(354, 632, 414, 640); npc('office', 384, 624, { tint: '#f06a8c', lines: ['INFORMATION! TRAINS TO THE CITY ARE DOWNSTAIRS ON THE LEFT. BUSES ON THE RIGHT.', o.tip] });
        house(620, 520, 56, 28, { sign: 'SORABEN', noren: '#e0563f', rh: 12 }); house(700, 520, 52, 28, { sign: 'GIFTS', noren: '#2f5ab0', rh: 12 });
        M.SPOTS.push({ x: 620, y: 527, r: 14, label: 'LOOK', lines: ['SORABEN: SKY BENTO, MADE SMALL ENOUGH FOR A TRAY TABLE.', 'THE ONE WITH THE TINY FISH-SHAPED SOY BOTTLE IS THE MOST POPULAR. OBVIOUSLY.'] }); M.SPOTS.push({ x: 700, y: 527, r: 14, label: 'LOOK', lines: ['BOXES OF BISCUITS SHAPED LIKE THE CITY\'S LANDMARKS.', 'EVERY OFFICE IN JAPAN RUNS ON SOUVENIR BISCUITS.'] });
        if (o.deck) { R(g, 470, 462, 60, 30, '#a8a4a0'); for (let y = 462; y < 492; y += 3) R(g, 470, y, 60, 1.5, y % 6 ? '#c8c4c0' : '#8a8680'); for (const sx of [466, 530]) R(g, sx, 456, 4, 40, '#3a3446'); txtC(g, 'OBSERVATION DECK', 500, 450, '#2f5ab0'); block(466, 456, 470, 496); block(530, 456, 534, 496); M.SPOTS.push({ x: 500, y: 478, r: 16, label: 'UP TO THE OBSERVATION DECK', fn: () => { Snd.fx('page'); go(o.deck); } }); }
        const lanes = [[548, 1, 44], [600, -1, 40], [660, 1, 48]]; lanes.forEach(([ly, dir, sp], k) => { for (let i = 0; i < 4; i++) traveller(ly, dir, sp, i, k); });
        // the way out: trains on the left, buses on the right
        R(g, 0, 684, X2, 20, '#3a3446'); for (const [x, t, c] of [[200, 'TRAINS', '#3f9a5a'], [580, 'BUSES', '#2f5ab0']]) { R(g, x - 40, 680, 80, 24, '#fff4d0'); for (let k = x - 40; k < x + 40; k += 16) R(g, k, 680, 1, 24, '#a8a090'); R(g, x - 30, 668, 60, 9, c); txtC(g, t, x, 670, '#fff8e8'); }
        block(0, 690, 160, 704); block(240, 690, 540, 704); block(620, 690, X2, 704);
        M.SPOTS.push({ x: 200, y: 680, r: 18, label: 'TRAINS', train: 1 }); M.SPOTS.push({ x: 580, y: 680, r: 18, label: 'BUS TO THE CITY', fn: () => rideTo({ label: 'AIRPORT BUS TO', name: o.city[1], go: [o.city[0]], speed: 120, dur: 4 }) });
        M.st = [200, 664]; M.arrive = arrive; M.LIGHTS = [];
      } };
    if (o.deck) deckMap(o.deck, id);
  }

  // ---------- Haneda's observation deck ----------
  function deckMap(id, port) {
    MAPS[id] = { station: 1, name: 'OBSERVATION DECK', sub: 'THE RUNWAY, THE BAY AND FUJI', tw: 40, th: 24, music: 'fuji', lookUp: [210, 330],
      lay() { tRect(PL, 0, 0, 40, 24); },
      deco() {
        const g = M.ground.g, X2 = 640, r = RNG(41);
        dgrad(g, 0, 0, X2, 56, ['#7ab8e8', '#a8d4f0', '#dcecf4']); mountain(g, 360, 55, 92, 46, '#7a8ac0', r, '#f8f4ee'); for (let x = -20; x < 660; x += 30) ell(g, x + r() * 20, 56, 26, 5, '#6a8a9a');
        R(g, 0, 54, X2, 30, '#4a8ec0'); for (let k = 0; k < 40; k++) R(g, r() * X2, 58 + r() * 24, 4 + r() * 8, U, 'rgba(255,255,255,0.5)'); skyline(g, 0, 170, 58, 4, 12, '#8a94b0', r); skyline(g, 520, 640, 58, 3, 9, '#8a94b0', r);
        R(g, 0, 84, X2, 86, '#6a6a74'); R(g, 0, 104, X2, 46, '#4a4a56'); for (let x = 0; x < X2; x += 30) R(g, x, 126, 16, 2, '#f4f1e6'); for (const y of [106, 147]) R(g, 0, y, X2, 1, '#f4f1e6');
        for (let x = 20; x < X2; x += 40) R(g, x, 96, 18, 2, '#f2c14e'); R(g, 0, 170, X2, 10, '#c8d8e4'); R(g, 0, 170, X2, 1, '#ffffff'); for (let x = 0; x < X2; x += 24) R(g, x, 166, 2, 14, '#8a9aaa'); block(0, 0, X2, 182);
        M.ACT.push({ x: 0, y: 150, sayT: 0, always: 1, t: 4, draw(e, x, y) { e.t += 1 / 60; const T = 16, k = Math.floor(e.t / T), p = (e.t % T) / T, off = e.x - x;
          for (let i = 0; i < 16; i++) { const lx = i * 42 + 10 - off; if (Math.sin(G.t * 4 + i) > 0.3) { R(ctx, lx, y - 45, 2, 1, '#ff6a4a'); R(ctx, lx, y - 4, 2, 1, '#5ad8f0'); } }
          let px, z; const take = k % 2 === 0; if (take) { const q = Math.min(1, p * 1.25); px = 760 - (q * q) * 980; z = px < 360 ? Math.pow((360 - px) / 300, 1.6) * 90 : 0; } else { const q = Math.min(1, p * 1.25); px = -260 + (1 - (1 - q) * (1 - q)) * 980; z = px < 300 ? Math.pow((300 - px) / 560, 1.2) * 130 : 0; }
          if (p >= 0.8) return; const sx = px - off, sy = y - 22; ell(ctx, sx, sy + 16, 50 - Math.min(40, z * 0.3), 4, 'rgba(22,30,50,' + Math.max(0.05, 0.3 - z * 0.002) + ')');
          ctx.drawImage(take ? SPR.jetL : SPR.jet, snap(sx - 112), snap(sy - 52 - z)); const near = Math.abs(sx - 320) < 260 ? 1 - Math.abs(sx - 320) / 260 : 0; if (near > 0 && z < 60 && Math.floor(e.t * 2) !== Math.floor((e.t - 1 / 60) * 2)) SND.roar(near * (take ? 1 : 0.7)); } });
        for (const x of [80, 200, 440, 560]) fur('scope', x, 200); for (const x of [140, 500]) prop('bench', x, 300, 9); prop('vend', 420, 352, 6);
        stampSpot('skydeck', 320, 204, 'TAKE A PHOTO', 'snap', ['A JET LIFTS OFF RIGHT IN FRONT OF YOU, THE BAY BEHIND IT AND FUJI FAR AWAY ON THE LEFT.', 'THE PLANE-SPOTTERS NEXT TO YOU ALL TAKE THE SAME PHOTO AT ONCE.'], 18);
        npc('salary', 260, 214, { dir: 'u', lines: ['THAT ONE IS GOING TO SAPPORO. I CAN TELL BY THE WAY IT TURNS.', 'NOBODY BELIEVES ME. I AM USUALLY RIGHT.'] }); npc('kid', 380, 216, { dir: 'u', lines: ['THEY LAND EVERY TWO MINUTES! I COUNTED!'] }); npc('tourist', 520, 230, { rad: 20, lines: ['MY LENS IS LONGER THAN MY ARM.'] });
        M.SPOTS.push({ x: 320, y: 372, r: 16, label: 'BACK INSIDE', fn: () => { Snd.fx('page'); go(port, 500, 500, 'd'); } }); M.st = [320, 356]; M.LIGHTS = [];
      } };
  }

  // ---------- things to do in the terminal ----------
  function passport() { const st = PORTS[M.id] && PORTS[M.id].passport; Snd.fx('stamp');
    dialog(['THE OFFICER LOOKS AT YOUR PASSPORT, THEN AT YOU, THEN AT YOUR PASSPORT.', 'THUNK. A NEAT STAMP WITH TODAY\'S DATE. "WELCOME TO JAPAN."'], st && STAMPS[st] ? () => award(st) : null); }
  function checkIn() { const n = CLIST.filter(c => Object.keys(c.stamps).some(k => G.stamps[k])).length; Snd.fx('page');
    dialog(['YOUR SUITCASE GOES ON THE SCALE: ' + (12 + n * 3) + ' KILOS. ' + (n > 1 ? 'IT WAS 12 WHEN YOU ARRIVED. SOUVENIRS ARE HEAVY.' : 'NICE AND LIGHT. FOR NOW.'), 'IT GLIDES AWAY ON THE BELT. SEE YOU AT THE OTHER END.']); }
  function icCard() { Snd.fx('coin'); setTimeout(() => SND.beep(), 400); if (G.ic) { dialog(['YOUR CARD STILL HAS PLENTY ON IT. THE MACHINE BEEPS HAPPILY ANYWAY.']); return; } G.ic = 1; save(); dialog(['A LITTLE CARD WITH A BIRD ON IT. TAP IT ON ANY GATE AND THE TRAINS ARE YOURS.', 'IT WORKS IN EVERY CITY. FROM NOW ON THE GATES GO PI! WHEN YOU PASS.']); }

  // ---------- flying ----------
  function fly(to, o) { const P = PORTS[to], sea = to === 'oka' || M.id === 'oka', snow = to === 'cts' || M.id === 'cts'; G.state = 'ride'; G.ride = Object.assign({ plane: 1, t: 0, dur: 8, label: 'FLIGHT TO', name: P.name, go: [to, 580, 184, 'd'], fuji: !snow, sea, snow: to === 'cts', then: () => { NET.say('WELCOME TO ' + P.short + '. FOLLOW THE SIGNS TO ARRIVALS.', 4); if (STAMPS.flight && !G.stamps.flight) award('flight'); } }, o || {}); Snd.play(null); SND.pinpon(); }
  function intro() { const H_ = Object.keys(PORTS)[0]; G.arrived = 1; save(); fly(H_, { label: 'NOW LANDING AT', dur: 6.5, landing: 1, then: () => { G.banner = 4; NET.say('WELCOME TO JAPAN! FOLLOW THE GREEN SIGNS TO ARRIVALS.', 6); } }); }
  function home() { const back = M.id; G.state = 'ride'; G.ride = { plane: 1, t: 0, dur: 8, label: 'FLIGHT HOME', name: 'SAYONARA, JAPAN', go: [back, 186, 214, 'd'], then: () => { G.state = 'scrap'; G.scrap = { t: 0, sel: 0 }; Snd.play('fuji'); } }; Snd.play(null); SND.pinpon(); }
  // the view from a window seat: take-off, the cloud sea (with Fuji poking through), the descent, the landing
  function drawFlight(r) {
    const p = Math.min(1, r.t / r.dur), alt = r.landing ? Math.max(0, 1 - p * 1.6) : p < 0.25 ? p / 0.25 : p > 0.72 ? Math.max(0, (1 - p) / 0.28) : 1;
    R(ctx, 0, 0, W, H, '#d8d4cc'); for (let y = 0; y < H; y += 6) R(ctx, 0, y, W, 1, '#d0ccc4');
    const cx = W / 2, cy = Math.min(H * 0.42, H / 2 - 20), rx = Math.min(W * 0.3, 96), ry = rx * 0.78;
    for (const k of [-1, 1]) { const sx = cx + k * rx * 2.4; ell(ctx, sx, cy, rx * 0.55, ry * 0.55, '#b8b4ac'); ell(ctx, sx, cy, rx * 0.48, ry * 0.48, '#7ab8e8'); }
    ell(ctx, cx, cy, rx + 9, ry + 9, '#c8c4bc'); ell(ctx, cx, cy, rx + 5, ry + 5, '#a8a49c');
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.clip();
    dgrad(ctx, cx - rx, cy - ry, rx * 2, ry * 2, alt > 0.6 ? ['#3a7ad8', '#6ab0f0', '#bfe0f8'] : ['#6ab0f0', '#a8d4f0', '#e8f0f4']);
    const sc = G.t * (alt > 0.2 ? 30 : 90), gy = cy + ry * 0.15 + alt * ry * 1.7;
    if (gy < cy + ry) { const GC = r.sea && alt > 0.12 ? ['#2a8ac8', '#5ab8e0', '#e8f8ff', '#3a9ad0', '#d8c890', '#2a8ac8'] : r.snow ? ['#e4eaf4', '#c8d4e4', '#f8fbff', '#a8b4c8', '#8a9ab0', '#e4eaf4'] : ['#6a9a6a', '#8aba6a', '#c8d85a', '#a8a4b0', '#8a94b0', '#5a8a5a']; R(ctx, cx - rx, gy, rx * 2, ry * 2, GC[0]); for (let k = 0; k < 30; k++) { const x = ((k * 53 - sc * (1 + k % 3 * 0.3)) % (rx * 2 + 60) + rx * 2 + 60) % (rx * 2 + 60) + cx - rx - 30, y = gy + 3 + (k % 6) * 6; R(ctx, x, y, 14 + k % 4 * 6, 4, GC[1 + k % 5]); }
      if (alt < 0.3) { R(ctx, cx - rx, gy - 3, rx * 2, 6, '#4a4a56'); for (let x = (cx - rx) - (sc * 2) % 18; x < cx + rx; x += 18) R(ctx, x, gy - 0.5, 8, 1, '#f4f1e6'); } }
    const cl = alt > 0.5 ? cy + ry * (0.9 - alt * 0.6) : cy + ry * 1.5 - alt * ry; if (alt > 0.15) { R(ctx, cx - rx, cl + 6, rx * 2, ry * 2, '#f4f8fc'); for (let k = 0; k < 14; k++) { const x = ((k * 37 - G.t * 22) % (rx * 2 + 40) + rx * 2 + 40) % (rx * 2 + 40) + cx - rx - 20; ell(ctx, x, cl + 4 + (k % 3) * 3, 14 + k % 4 * 4, 5, '#ffffff'); ell(ctx, x - 4, cl + 7 + (k % 3) * 3, 10, 3, '#e4ecf4'); } }
    if (r.fuji && !r.landing && p > 0.32 && p < 0.7) { const fx = cx + rx - (p - 0.32) / 0.38 * rx * 2.4; for (let i = 0; i < 26; i++) { const w = 2 + i * 1.3; R(ctx, fx - w, cl + 4 - 26 + i, w * 2, 1, i < 8 ? '#f8f4ee' : '#8a94c0'); } }
    for (let k = 0; k < 4; k++) { const x = ((k * 71 - G.t * 60) % (rx * 2 + 80) + rx * 2 + 80) % (rx * 2 + 80) + cx - rx - 40; if (alt > 0.2) { ctx.globalAlpha = 0.7; ell(ctx, x, cy - ry * 0.5 + k * 9, 18, 3, '#ffffff'); ctx.globalAlpha = 1; } }
    const wy = cy + ry * 0.32 - (alt - 0.5) * 3, poly = (pts, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) ctx.lineTo(q[0], q[1]); ctx.closePath(); ctx.fill(); };
    poly([[cx - rx * 0.3, wy], [cx + rx * 1.1, wy + 5], [cx + rx * 1.1, wy + 26], [cx + rx * 0.2, wy + 22]], '#c8c4cc'); poly([[cx - rx * 0.3, wy], [cx + rx * 1.1, wy + 5], [cx + rx * 1.1, wy + 7], [cx - rx * 0.25, wy + 2]], '#ecebf0');
    poly([[cx + rx * 0.05, wy + 18], [cx + rx * 1.1, wy + 22], [cx + rx * 1.1, wy + 26], [cx + rx * 0.2, wy + 22]], '#a8a4b0'); ell(ctx, cx + rx * 0.45, wy + 27, 14, 6, '#9a96a2'); ell(ctx, cx + rx * 0.45, wy + 26, 13, 4.5, '#b8b4c0'); ell(ctx, cx + rx * 0.45 - 12, wy + 27, 2.5, 4.5, '#3a3446');
    if (G.t % 1.2 < 0.15) disc(ctx, cx + rx * 0.98, wy + 6, 1.5, '#ff4a4a');
    ctx.restore();
    R(ctx, cx - rx - 2, cy - ry - 2, rx * 2 + 4, ry * 0.3, '#c8c4bc'); R(ctx, cx - rx - 2, cy - ry * 0.7, rx * 2 + 4, 1.5, '#a8a49c');
    const bw = Math.min(200, W - 20), by = Math.min(H - 40, cy + ry + 18); panel(cx - bw / 2, by, bw, 32); txtC(ctx, r.label, cx, by + 6, '#8a7a6a'); txtC(ctx, r.name, cx, by + 16, '#2f5ab0', null, tw(r.name, 2) > bw - 10 ? 1 : 2);
    const a = r.t < 0.5 ? 1 - r.t / 0.5 : r.t > r.dur - 0.5 ? (r.t - r.dur + 0.5) / 0.5 : 0; if (a > 0) { ctx.globalAlpha = Math.min(1, a); R(ctx, 0, 0, W, H, '#100c1c'); ctx.globalAlpha = 1; }
  }
  function rideTick(r, dt) { if (Math.floor(r.t * 2.2) !== Math.floor((r.t - dt) * 2.2)) SND.hum(); if (r.t - dt < 0.6 && r.t >= 0.6 && !r.landing) SND.roar(0.8); if (r.t - dt < r.dur - 1.2 && r.t >= r.dur - 1.2) SND.roar(0.5); }

  // ---------- your suitcase on the carousel ----------
  const BAGS = {
    init(m) { const mine = (LOOKOPT.bag[G.look.bag] || [0, '#2f5ab0'])[1] || '#2f5ab0'; m.cases = []; for (let k = 0; k < 12; k++) m.cases.push({ a: k / 12, c: k === 7 ? mine : k % 3 === 0 ? mine : CASEC[(k * 5) % CASEC.length], tag: k === 7 ? '#e0452f' : k % 3 === 0 ? '#f2c14e' : null, me: k === 7 }); m.msg = ''; m.mt = 0; m.done = 0; m.mine = mine; },
    update(m, dt) { for (const c of m.cases) c.a = (c.a + dt * 0.045) % 1; if (m.mt > 0) m.mt -= dt;
      if (m.done) { if (m.t > m.done + 1) endMini(true, ['YOU HAUL YOUR SUITCASE OFF THE BELT. THE RED RIBBON WAS A GOOD IDEA.', 'SOMEONE HAS ALREADY TURNED IT HANDLE-UP FOR YOU.']); return; }
      if (KP.a) { const near = m.cases.map(c => [c, Math.abs(((c.a - 0.25 + 1.5) % 1) - 0.5)]).sort((a, b) => a[1] - b[1])[0]; if (near[1] < 0.03) { if (near[0].me) { m.done = m.t; Snd.fx('yay'); } else { m.msg = near[0].tag === '#f2c14e' ? 'NOT YOURS: YELLOW RIBBON.' : 'NOT YOURS AT ALL.'; m.mt = 1.2; Snd.fx('land'); } } else { m.msg = 'NOTHING IN FRONT OF YOU.'; m.mt = 0.8; Snd.fx('talk'); } } },
    draw(m) { txtC(ctx, 'BAGGAGE CLAIM', 160, 30, '#c8382e', null, 2); const x = 160, y = 82;
      ell(ctx, x, y + 4, 108, 32, '#3a3446'); ell(ctx, x, y + 2, 102, 28, '#5a5468'); ell(ctx, x, y + 2, 82, 16, '#c8c0d4'); R(ctx, x - 12, y + 26, 24, 6, 'rgba(242,193,78,0.5)');
      m.cases.slice().sort((a, b) => Math.sin(a.a * 6.283) - Math.sin(b.a * 6.283)).forEach(c => { const a = c.a * 6.283, cx = x + Math.cos(a) * 92, cy = y + Math.sin(a) * 22; R(ctx, cx - 6, cy - 9, 12, 9, c.c); R(ctx, cx - 6, cy - 9, 12, 1.5, lite(c.c, 0.35)); R(ctx, cx - 2, cy - 11, 4, 2, '#2a2430'); if (c.tag) R(ctx, cx + 3, cy - 8, 2, 4, c.tag); });
      R(ctx, 252, 46, 34, 26, '#f4f1e6'); R(ctx, 252, 46, 34, 1, '#ffffff'); txtC(ctx, 'YOURS', 269, 48, '#8a7a6a'); R(ctx, 262, 56, 14, 10, m.mine); R(ctx, 271, 57, 2, 5, '#e0452f');
      txtC(ctx, m.done ? 'GOT IT!' : m.mt > 0 ? m.msg : 'E WHEN YOUR SUITCASE (RED RIBBON) IS IN THE YELLOW BOX', 160, 132, '#3a2e40'); }
  };

  // ---------- the scrapbook at the end of a trip ----------
  function scrapUpdate(dt) { const s = G.scrap; s.t += dt; if (KP.u || KP.d) { s.sel ^= 1; Snd.fx('ui'); } if (TAP) { const tp = TAP; TAP = null; const b = scrapButtons(); b.forEach((q, i) => { if (tp.x >= q[0] && tp.x <= q[0] + q[2] && tp.y >= q[1] && tp.y <= q[1] + q[3]) { s.sel = i; KP.a = 1; } }); }
    if (KP.a && s.t > 1) { if (s.sel === 0) { G.state = 'play'; G.scrap = null; Snd.play(M.def.music); Snd.fx('page'); } else { G.scrap = null; MENU.open('confirm', 'main'); } } }
  const scrapButtons = () => { const w = Math.min(150, W - 40), x = Math.floor((W - w) / 2), y = H - 46; return [[x, y, w, 15], [x, y + 18, w, 15]]; };
  function scrapDraw() {
    const s = G.scrap, t = s.t; R(ctx, 0, 0, W, H, '#2a2236'); for (let k = 0; k < 40; k++) p1(ctx, (k * 97) % W, (k * 61) % H, '#5a4a6a');
    const pw = Math.min(W - 16, 300), ph = Math.min(H - 60, 220), px = Math.floor((W - pw) / 2), py = 8; R(ctx, px + 2, py + 2, pw, ph, '#1a1424'); R(ctx, px, py, pw, ph, '#f4ead4'); R(ctx, px + pw / 2 - U, py, 1, ph, '#d8c8a8');
    txtC(ctx, 'YOUR TRIP', W / 2, py + 6, '#c8382e', null, 2);
    const visited = CLIST.filter(c => Object.keys(c.stamps).some(k => G.stamps[k])), lines = [['CITIES', visited.length + ' OF ' + CLIST.length], ['STAMPS', count(G.stamps) + ' OF ' + count(STAMPS)], ['CATS PETTED', count(G.cats)], ['DRINKS TRIED', count(G.cans)], ['FIGURES', count(G.figs)], ['WISHES HUNG', count(G.ema || {})], ['STEPS', Math.floor(G.steps || 0).toLocaleString('en').replace(/,/g, ' ')]];
    const lx = px + 10; lines.forEach(([a, b], i) => { if (t < 0.3 + i * 0.18) return; txt(ctx, a, lx, py + 24 + i * 10, '#8a7a6a'); txt(ctx, String(b), px + pw / 2 - 8 - tw(String(b)), py + 24 + i * 10, '#3a2e40'); });
    txt(ctx, visited.map(c => c.name).join(', ') || 'JUST THE AIRPORT', lx, py + 24 + lines.length * 10 + 4, '#3f7ab0');
    const got_ = Object.keys(G.stamps).filter(k => STAMPS[k]), cols = Math.max(1, Math.floor((pw / 2 - 16) / 16)); got_.slice(0, cols * Math.floor((ph - 40) / 16)).forEach((k, i) => { if (t < 0.6 + i * 0.05) return; const x = px + pw / 2 + 10 + (i % cols) * 16, y = py + 26 + (i / cols | 0) * 16; ctx.save(); ctx.translate(x + 6, y + 6); ctx.rotate(((i * 37) % 9 - 4) * 0.04); ctx.drawImage(stampOf(STAMPS[k][1]), -6, -6); ctx.restore(); });
    if (t > 1.6) txtC(ctx, 'THANK YOU FOR TRAVELLING', W / 2, py + ph - 12, '#8a7a6a');
    const b = scrapButtons(); [['KEEP WANDERING', 'BACK TO THE AIRPORT'], ['START A NEW TRIP', '']].forEach(([a], i) => { const [x, y, w, h] = b[i]; R(ctx, x, y, w, h, i === s.sel ? '#c8382e' : '#3a3046'); txtC(ctx, a, x + w / 2, y + 5, '#fff8e8'); });
  }

  return { airport, sprites, fly, intro, home, drawFlight, rideTick, scrapUpdate, scrapDraw, PORTS, minis: { bags: BAGS } };
})();
const airport = AIR.airport;
