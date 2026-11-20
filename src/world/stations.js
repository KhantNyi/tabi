'use strict';
// ---------- train stations you walk through ----------
// A city's station building has a door: inside, a concourse with ticket machines, an IC card machine, a kiosk, the staff
// window and coin lockers, then the ticket gates (an IC card beeps you through; a ticket goes in the slot and pops out the
// other side; with neither, the flaps snap shut), and up the stairs, the platform. There the station's name board shows the
// stops either side, the LED board counts down, people queue at the marks on the floor, and the train runs on the shared
// clock: it pulls in, the doors open with a chime, the departure melody plays, the doors close and off it goes. Board while
// the doors are open to choose your stop. One station map per city; it knows which street you came in from (M.from).
const STATIONS = (function () {
  const S = () => Snd.ctx && Snd.ctx.state === 'running' ? Snd.ctx.currentTime + 0.01 : 0;
  const tone = (type, f, t, d, v, o) => Snd.tone(type, f, t, d, v, Object.assign({ bus: Snd.sfx }, o || {}));
  // each city's line colour and name, and the little tune its platforms play before the doors close
  const LINE = { tokyo: ['#5aa85a', 'TOKYO RAIL'], osaka: ['#e0453a', 'OSAKA METRO'], kyoto: ['#3f7ab0', 'JR KYOTO'], kamakura: ['#3f8a4a', 'ENODEN'], hiroshima: ['#c8382e', 'SANYO LINE'], sapporo: ['#5ab8e8', 'HAKODATE LINE'], okinawa: ['#2aa8b8', 'YUI RAIL'] };
  const MEL = { tokyo: ['E5', 'G5', 'C6', 'B5', 'G5', 'A5', 'B5', 'C6'], osaka: ['G5', 'E5', 'C5', 'E5', 'G5', 'C6', 'G5', 'E5'], kyoto: ['D5', 'F5', 'A5', 'D6', 'C6', 'A5', 'F5', 'D5'], kamakura: ['C5', 'E5', 'G5', 'E5', 'F5', 'A5', 'G5', 'C6'], hiroshima: ['G5', 'B5', 'D6', 'G6', 'F#6', 'D6', 'B5', 'G5'], sapporo: ['E5', 'F#5', 'B5', 'E6', 'D6', 'B5', 'A5', 'B5'], okinawa: ['C5', 'E5', 'F5', 'G5', 'B5', 'C6', 'B5', 'G5'] };
  const PER = 32, GX = [185, 216, 248, 279], CAB = [170, 200, 232, 264, 294];
  const from = () => M.from || (G.back && G.back.map), idx = () => CITY.line.findIndex(s => s[0] === from());
  const stopName = () => { if (M.sn) return M.sn; const i = idx(); return (i < 0 ? CITY.name : CITY.line[i][1]).replace(/ STATION$/, ''); };
  const nbr = d => { const L = CITY.line, i = idx(); return i < 0 ? '' : L[(i + d + L.length) % L.length][1]; };
  const phase = () => worldTime() % PER, doorsOpen = () => { const p = phase(); return p > 6 && p < 14; };
  const wait = () => Math.ceil(PER - phase()) || PER, paid = cid => G.ic || (G.tix || {})[cid];
  // where the train is: braking in 0-5s, standing 5-15s (doors open 6-14), pulling out 15-20s, then gone
  function trainX() { const p = phase(), stop = 240; if (p < 5) { const q = p / 5; return stop - (1 - q) * (1 - q) * 520; } if (p < 15) return stop; if (p < 20) { const q = (p - 15) / 5; return stop + q * q * 560; } return null; }
  let made = false;
  function sprites() { if (made) return; made = true; stationSprites();
    for (const cid in LINE) { const c = LINE[cid][0]; one('ctrain_' + cid, 92, 30, g => { R(g, 2, 4, 88, 22, '#d8dce4'); R(g, 2, 4, 88, 2, '#ffffff'); R(g, 2, 15, 88, 3, c); R(g, 2, 24, 88, 2, '#8a8e9a'); for (let x = 6; x < 86; x += 8) { R(g, x, 7, 6, 6, '#2a3a5a'); R(g, x, 7, 6, 1, '#6a8ab0'); } for (const x of [18, 44, 70]) { R(g, x, 6, 10, 18, '#c8ccd4'); R(g, x + 4.5, 6, 1, 18, '#8a8e9a'); R(g, x + 1, 8, 3, 6, '#2a3a5a'); R(g, x + 6, 8, 3, 6, '#2a3a5a'); } for (const x of [12, 80]) disc(g, x, 27, 2.5, '#2a2430'); R(g, 40, 1, 12, 3, '#3a3446'); }, 1); }
    one('tmachine', 18, 30, g => { R(g, 1, 0, 16, 30, '#3f7ab0'); R(g, 1, 0, 16, 2, '#6a9ae0'); R(g, 3, 4, 12, 9, '#1d2a44'); R(g, 4, 5, 10, 7, '#5ad8f0'); for (let k = 0; k < 6; k++) R(g, 4 + (k % 3) * 4, 15 + (k / 3 | 0) * 3, 3, 2, '#f4f1e6'); R(g, 6, 23, 6, 2, '#1d1626'); R(g, 0, 29, 18, 1, '#2a4a7a'); }, 1);
    one('icm', 16, 30, g => { R(g, 1, 0, 14, 30, '#3f9a5a'); R(g, 1, 0, 14, 2, '#8fd070'); R(g, 3, 4, 10, 8, '#1d2a44'); R(g, 4, 5, 8, 6, '#bfe8ff'); disc(g, 8, 18, 3, '#f2c14e'); R(g, 5, 24, 6, 2, '#1d1626'); }, 1);
    one('kiosk2', 44, 30, g => { R(g, 0, 12, 44, 18, '#c8382e'); R(g, 0, 12, 44, 2, '#f06a5a'); R(g, 2, 16, 40, 10, '#f4f1e6'); for (let k = 0; k < 8; k++) R(g, 4 + k * 5, 18, 4, 6, ['#e0563f', '#5aa8e0', '#f2c14e', '#5aa85a'][k % 4]); R(g, 4, 0, 36, 12, '#f4f1e6'); txt(g, 'KIOSK', 12, 3, '#c8382e'); }, 1);
    one('lockers', 30, 30, g => { R(g, 0, 0, 30, 30, '#8a8496'); for (let y = 1; y < 29; y += 7) for (let x = 1; x < 29; x += 7) { R(g, x, y, 6, 6, '#c8c4cc'); R(g, x + 4, y + 2, 1, 2, '#3a3446'); } }, 1);
    one('psign', 96, 30, g => { R(g, 0, 0, 96, 24, '#1d1626'); R(g, 1, 1, 94, 22, '#ffffff'); R(g, 1, 16, 94, 7, '#2a3a5a'); R(g, 46, 24, 4, 6, '#6b6478'); }, 1);
  }
  const chime = () => { const t = S(); if (t) { tone('sine', nf('E6'), t, 0.4, 0.04, { pluck: 1, echo: 1 }); tone('sine', nf('C6'), t + 0.25, 0.6, 0.04, { pluck: 1, echo: 1 }); } };
  const buzz = () => { const t = S(); if (t) { tone('square', 990, t, 0.15, 0.04, { lp: 3000 }); tone('square', 660, t + 0.18, 0.2, 0.04, { lp: 3000 }); } };
  const pi = () => { const t = S(); if (t) tone('square', 1760, t, 0.08, 0.03, { lp: 3000 }); };
  function station(cid) {
    const col = LINE[cid];
    MAPS['stn_' + cid] = { station: 1, city: cid, name: 'STATION', sub: col[1], tw: 30, th: 20, music: 'tokyo',
      zones: [[0, 0, 480, 150, 'PLATFORM 1', col[1]], [0, 150, 480, 320, 'STATION', 'TICKET GATES']],
      enter() { if (G.back) M.from = G.back.map; const B = BUILT[from()], sp = B && B.SPOTS.find(s => s.door === 'stn_' + cid); M.sn = sp && sp.sn; M.def.name = stopName() + ' STATION'; M.ok = 0; M.lastP = null; const mu = (MAPS[from()] || {}).music; if (mu) { M.def.music = mu; Snd.play(mu); } },
      hud: () => { const p = phase(); if (pl.y > 226 && !M.ok && !paid(M.def.city)) return 'NEED A TICKET: THE BLUE MACHINES, BOTTOM LEFT'; return doorsOpen() ? 'DOORS OPEN: BOARD NOW' : p < 6 ? 'A TRAIN IS ARRIVING' : p < 20 ? 'THE TRAIN IS LEAVING' : 'NEXT TRAIN IN ' + wait() + 'S'; },
      lay() { tRect(PL, 0, 0, 30, 20); },
      tick() { const p = phase(), t0 = M.lastP == null ? p : M.lastP; M.lastP = p; const cross = s => t0 < s && p >= s, near = pl.y < 170;
        if (cross(0.2) && near) { chime(); NET.say('A TRAIN IS ARRIVING AT PLATFORM 1. PLEASE STAND BEHIND THE YELLOW LINE.', 3); }
        if (cross(6) && near) { const t = S(); if (t) { tone('sine', nf('A5'), t, 0.5, 0.04, { pluck: 1 }); tone('sine', nf('F#5'), t + 0.3, 0.7, 0.04, { pluck: 1 }); } }
        if (cross(10.5) && near) { const t = S(); if (t) (MEL[cid] || MEL.tokyo).forEach((n, i) => tone('triangle', nf(n), t + i * 0.18, 0.3, 0.05, { pluck: 1, echo: 1 })); }
        if (cross(13.6) && near) NET.say('THE DOORS ARE CLOSING. PLEASE DO NOT RUSH ONTO THE TRAIN.', 3);
        if ((p < 5 || (p > 15 && p < 20)) && near && Math.floor(p * 4) !== Math.floor(t0 * 4)) { const t = S(); if (t) Snd.noise(t, 0.2, 0.025, 80, 500, Snd.sfx); }
        // the gates: shut without a ticket or a card; always open to anyone on the platform side, going out
        if (!M.ok && paid(cid) && pl.y > 238 && pl.y < 252 && Math.abs(pl.x - 232) < 64 && G.state === 'play') { M.ok = 1; M.flap = G.t; if (G.ic) pi(); else Snd.fx('page'); }
        if (pl.y < 226) M.ok = 1; /* the way out reads your ticket too, but always lets you go */ const open = M.ok; block(166, 228, 298, 236, open ? 0 : 1); for (const x of CAB) block(x - 3, 228, x + 3, 238);
        if (!open && pl.y > 236 && pl.y < 242 && Math.abs(pl.x - 232) < 62 && !M.buzzed) { M.buzzed = 1; buzz(); NET.say('PIN-PON! TICKETS AND IC CARDS: THE MACHINES BOTTOM LEFT.', 3); } if (pl.y > 250) M.buzzed = 0; },
      deco() { sprites(); const g = M.ground.g;
        // the track and the platform edge, with its yellow bumps
        R(g, 0, 0, 480, 44, '#5a5468'); for (let x = 0; x < 480; x += 6) R(g, x, 6, 3, 32, '#6b6478'); for (const y of [12, 30]) { R(g, 0, y, 480, 1.5, '#8a8496'); R(g, 0, y, 480, U, '#d8d4e0'); } block(0, 0, 480, 46);
        R(g, 0, 44, 480, 106, '#d8d4cc'); R(g, 0, 44, 480, 2, '#f4f1e6'); R(g, 0, 47, 480, 4, '#f2c14e'); for (let x = 1; x < 480; x += 2) p1(g, x, 48 + (x % 4 ? 0 : 1.5), '#c8a020');
        for (const x of [64, 128, 192, 288, 352, 416]) { R(g, x - 10, 54, 20, 1, '#f4f1e6'); for (let k = 0; k < 3; k++) { R(g, x - 8 + k, 58 + k * 6, 1, 4, '#f4f1e6'); R(g, x + 7 - k, 58 + k * 6, 1, 4, '#f4f1e6'); } }
        // the name board: this stop big, the stops either side small
        put(SPR.psign, 240, 118, 48, 29); block(232, 112, 248, 118);
        M.ACT.push({ x: 240, y: 118.5, sayT: 0, always: 1, draw(e, sx, sy) { const by = sy - 29, n = stopName(); txtC(ctx, n, sx, by + 4, '#1d1626', null, n.length > 10 ? 1 : 2); txt(ctx, '< ' + nbr(-1).slice(0, 10), sx - 46, by + 18, '#f4f1e6'); const nx = nbr(1).slice(0, 10) + ' >'; txt(ctx, nx, sx + 46 - tw(nx), by + 18, '#f4f1e6'); } });
        // the LED board, counting down
        M.ACT.push({ x: 120, y: 104, sayT: 0, always: 1, draw(e, sx, sy) { const by = sy - 40; R(ctx, sx - 1, by + 16, 2, 24, '#6b6478'); R(ctx, sx - 40, by, 80, 16, '#1d1626'); R(ctx, sx - 39, by + 1, 78, 14, '#120e1a'); const p = phase(); txt(ctx, 'LOCAL  ' + nbr(1).slice(0, 9), sx - 37, by + 2.5, '#ff9a3a'); txt(ctx, doorsOpen() ? 'NOW BOARDING' : p < 6 ? 'ARRIVING' : p < 20 ? 'DEPARTING' : 'IN ' + wait() + 'S', sx - 37, by + 9, doorsOpen() && G.t % 1 < 0.6 ? '#5ad88a' : '#c8c0d4'); } }); block(118, 100, 122, 104);
        for (const x of [160, 320]) { put(SPR.pillar, x, 108, 9, 55); block(x - 8, 102, x + 8, 108); } /* the roof's pillars, with the station's maps on them */
        for (const x of [70, 410]) prop('bench', x, 136, 9); prop('vend', 452, 130, 6); prop('vend3', 24, 130, 6);
        // the train: in on the shared clock, doors open, the melody, doors shut, away. People get off, then on.
        M.ACT.push({ x: 0, y: 46, sayT: 0, always: 1, draw(e, sx, sy) { const tx = trainX(); if (tx == null) return; const cx = -sx, spr = SPR['ctrain_' + cid], p = phase(), open = doorsOpen() ? Math.min(1, (p - 6) / 0.6, (14 - p) / 0.6) : 0;
          for (let k = -2; k <= 2; k++) { const x = tx + k * 90 - cx - 46; if (x > W + 4 || x + 92 < -4) continue; ctx.drawImage(spr, snap(x), snap(sy - 32)); if (open > 0) for (const dx of [18, 44, 70]) R(ctx, x + dx + 5 - open * 5, sy - 26, open * 10, 18, '#ffe8b0'); }
          if (open > 0 && !G.lowFx) for (let k = 0; k < 5; k++) { const off = p < 9.5, q = off ? (p - 6.4 - k * 0.5) / 1.4 : (p - 9.8 - k * 0.6) / 1.4; if (q < 0 || q > 1) continue; const x = tx - 180 + k * 90 + 18 - cx, f = frameOf({ F: look(WALK[(k + 2) % WALK.length], WCOL[k + 1]), dir: off ? 'd' : 'u', mv: true, wt: G.t + k, ph: k }); ctx.drawImage(f, snap(x - f.width / 2 / S), snap(sy - 20 + (off ? q : 1 - q) * 26 - f.height / S + 12)); } } });
        M.SPOTS.push({ x: 240, y: 64, r: 24, label: 'BOARD THE TRAIN', fn: () => { if (!doorsOpen()) { Snd.fx('talk'); const p = phase(); dialog([p < 6 ? 'THE TRAIN IS STILL PULLING IN. STAND BEHIND THE YELLOW LINE, AND LET PEOPLE OFF FIRST.' : p < 20 ? 'THE DOORS HAVE SHUT. YOU WATCH IT GO. THE NEXT ONE IS IN ' + wait() + ' SECONDS.' : 'NO TRAIN YET. THE BOARD SAYS ' + wait() + ' SECONDS.', 'NOBODY RUNS FOR A TRAIN HERE. ANOTHER ALWAYS COMES.']); return; }
          Snd.fx('page'); G.state = 'line'; G.line = { sel: (idx() + 1) % CITY.line.length }; } });
        for (const [x, y] of [[64, 74], [62, 86], [128, 76], [194, 78], [352, 74], [354, 88], [418, 78]]) npc(WALK[(x + y) % WALK.length], x, y, { dir: 'u', tint: WCOL[(x >> 3) % WCOL.length], lines: [['THE TRAIN STOPS WITH ITS DOORS RIGHT ON THESE MARKS. EVERY TIME. TO THE CENTIMETRE.', 'WE QUEUE IN TWO LINES, AND LET EVERYONE OFF FIRST.', 'IF THE TRAIN IS ONE MINUTE LATE, THEY GIVE YOU A NOTE FOR YOUR BOSS.'][(x + y) % 3]] });
        // the stairs up to the platform, and the wall either side
        for (let k = 0; k < 8; k++) { R(g, 200, 150 + k * 5, 80, 5, k % 2 ? '#c8c4bc' : '#d8d4cc'); R(g, 200, 150 + k * 5, 80, U, '#f4f1e6'); } R(g, 0, 150, 200, 40, '#8a8496'); R(g, 280, 150, 200, 40, '#8a8496'); R(g, 0, 150, 200, 2, '#c8c0d4'); R(g, 280, 150, 200, 2, '#c8c0d4'); block(0, 150, 198, 190); block(282, 150, 480, 190);
        [36, 176, 304, 444].forEach((x, i) => { R(g, x - 15, 155, 30, 30, '#f4f1e6'); R(g, x - 14, 156, 28, 28, ['#f06a8c', '#5aa8e0', '#f2c14e', '#8a6aff'][(i + cid.length) % 4]); R(g, x - 10, 160, 20, 12, '#ffffff'); disc(g, x, 166, 4, ['#e0563f', '#3f9a5a', '#2f5ab0', '#c8382e'][(i * 3 + 1) % 4]); R(g, x - 10, 176, 20, 2, '#ffffff'); }); /* the posters on the walls by the stairs */
        R(g, 60, 160, 80, 14, col[0]); txtC(g, 'PLATFORM 1', 100, 162, '#ffffff'); txtC(g, col[1], 100, 168, '#ffffff'); R(g, 340, 160, 80, 14, '#f2c14e'); txtC(g, 'EXIT  v', 380, 165, '#1d1626');
        // the concourse: the gates, and everything around them
        R(g, 0, 190, 480, 130, '#e4ded2'); for (let y = 190; y < 320; y += 16) for (let x = (y / 16 & 1) * 16; x < 480; x += 32) R(g, x, y, 16, 16, '#dcd6ca'); R(g, 0, 228, 166, 10, '#b8b0a4'); R(g, 298, 228, 182, 10, '#b8b0a4'); block(0, 226, 166, 238); block(298, 226, 480, 238);
        for (const x of CAB) { put(SPR.gate, x, 238, 5, 17); R(g, x - 4, 238, 8, 2, '#3f7ab0'); }
        M.ACT.push({ x: 232, y: 238.5, sayT: 0, draw(e, sx, sy) { const o = M.ok; for (const x of GX) { const lx = sx + x - 232; if (o) { R(ctx, lx - 9, sy - 12, 2, 4, '#e0563f'); R(ctx, lx + 7, sy - 12, 2, 4, '#e0563f'); } else { R(ctx, lx - 9, sy - 12, 8, 4, '#e0563f'); R(ctx, lx + 1, sy - 12, 8, 4, '#e0563f'); R(ctx, lx - 9, sy - 12, 18, U, '#ff9a8a'); } } } });
        M.SPOTS.push({ x: 232, y: 252, r: 18, label: 'THROUGH THE TICKET GATES', fn: () => { if (paid(cid)) { if (G.ic) pi(); M.ok = 1; M.flap = G.t; dialog([G.ic ? 'YOU TAP YOUR IC CARD ON THE BLUE PAD. PI! THE FLAPS SWING OPEN.' : 'YOU FEED YOUR TICKET INTO THE SLOT. IT SHOOTS THROUGH THE MACHINE AND POPS UP ON THE OTHER SIDE. YOU TAKE IT BACK.']); return; } buzz(); dialog(['PIN-PON! THE FLAPS SNAP SHUT IN FRONT OF YOU.', 'YOU NEED A TICKET FROM THE BLUE MACHINES BY THE WAY IN (BOTTOM LEFT), OR AN IC CARD FROM THE GREEN ONE NEXT TO THEM.']); } });
        // ticket machines, with the fare map above them; the IC card machine
        /* on the street side of the gates, by the way in */ for (const x of [24, 46, 68]) prop('tmachine', x, 300, 8); R(g, 10, 250, 74, 18, '#f4f1e6'); txtC(g, 'TICKETS', 47, 252, col[0]); R(g, 14, 261, 66, 1.5, col[0]); for (let k = 0; k < 10; k++) disc(g, 17 + k * 7, 262, 1.5, col[0]);
        M.SPOTS.push({ x: 46, y: 308, r: 16, label: 'BUY A TICKET', fn: () => { const L = CITY.line, i = Math.max(0, idx()); G.state = 'mini'; G.mg = { k: 'ticket', sp: { to: (i + 1 + ((G.t * 7 | 0) % Math.max(1, L.length - 1))) % L.length, buy: 1 }, t: 0 }; MG.ticket.init(G.mg); Snd.fx('ui'); } });
        prop('icm', 104, 300, 7); M.SPOTS.push({ x: 104, y: 308, r: 12, label: 'IC CARD MACHINE', fn: () => { Snd.fx('coin'); setTimeout(pi, 400); if (G.ic) { dialog(['YOU PUT IN A THOUSAND YEN. THE SCREEN BOWS, AND YOUR BALANCE GOES UP.']); return; } G.ic = 1; save(); dialog(['A LITTLE CARD WITH A PENGUIN ON IT. TAP IT ON ANY GATE, IN ANY CITY, AND THE TRAINS ARE YOURS.', 'IT PAYS AT KONBINI AND VENDING MACHINES TOO. THE PENGUIN IS VERY CAPABLE.']); } });
        put(SPR.kiosk2, 400, 300, 22, 29); block(378, 292, 422, 300); M.SPOTS.push({ x: 400, y: 308, r: 13, label: 'BUY SOMETHING AT THE KIOSK', fn: () => { Snd.fx('coin'); dialog([['A CAN OF HOT COFFEE, SO SWEET AND SO HOT YOU HAVE TO HOLD IT BY THE RIM.', 'A RICE BALL AND A NEWSPAPER, FOLDED SMALL LIKE EVERYONE ELSE\'S, FOR READING ON A CROWDED TRAIN.', 'A PACK OF GUM AND A TINY BOTTLE OF ENERGY DRINK THAT TASTES OF MEDICINE AND CONFIDENCE.'][(G.t | 0) % 3], 'THE KIOSK LADY HAS YOUR CHANGE READY BEFORE YOU HAVE FINISHED PAYING.']); } });
        put(SPR.lockers, 452, 300, 15, 29); block(436, 292, 468, 300); M.SPOTS.push({ x: 452, y: 308, r: 12, label: 'LOOK', lines: ['COIN LOCKERS. FOR THREE HUNDRED YEN YOUR SUITCASE CAN SLEEP HERE ALL DAY.', 'NUMBER 14 HAS BEEN LOCKED FOR A WEEK. NOBODY KNOWS WHAT IS INSIDE. THE STAFF HAVE THEORIES.'] });
        R(g, 140, 268, 40, 18, '#8a8496'); R(g, 142, 270, 36, 10, '#bfe8ff'); txtC(g, 'STAFF', 160, 281, '#f4f1e6'); block(140, 282, 180, 288); npc('office', 160, 279, { tint: '#2a3a5a', dir: 'd', lines: ['GOOD MORNING. LOST SOMETHING? WE FOUND FOUR HUNDRED UMBRELLAS THIS MONTH.', 'THE NEXT TRAIN IS ON THE BOARD UPSTAIRS. IT WILL BE ON TIME. IT IS ALWAYS ON TIME.'] });
        for (let i = 0; i < 5; i++) walker(i * 3 + cid.length, 200, 256 + (i % 2) * 10, 470, 256 + (i % 2) * 10);
        M.SPOTS.push({ x: 240, y: 308, r: 16, label: 'OUT TO THE STREET', fn: () => { const b = G.back; G.back = null; Snd.fx('page'); if (b) go(b.map, b.x, b.y + 8, 'd'); else go(CITIES[cid].hub); } });
        R(g, 210, 312, 60, 8, '#fff4d0'); txtC(g, 'EXIT', 240, 314, '#c8a040'); M.st = [240, 296];
      } };
  }
  for (const cid in LINE) station(cid);
  return { sprites, LINE, has: cid => !!LINE[cid] };
})();
