'use strict';
// ---------- Bangkok: Suvarnabhumi Airport, where a trip can begin ----------
// A new trip can start here instead of landing straight at Haneda. A taxi drops you at the kerb of the departures hall.
// Inside, under the great roof: the board says your flight to Tokyo checks in at row M. Check in (passport, suitcase on
// the scale, window or aisle), get your boarding pass, then passport control for the departure stamp and security, where
// everything goes in the right tray. Airside: the Churning of the Milk Ocean, giant yaksha guardians, duty free and a food
// court, and a long concourse with moving walkways. Your gate changes once, the way gates do. At the gate the groups are
// called in turn; at yours, the pass is scanned, you walk the jet bridge, find your seat, and fly through the night to
// Tokyo, with dinner on the way. You land at Haneda's arrivals, and Japan begins.
// The HUD always says what is next, and an arrow at the edge of the screen points the way, so nobody gets lost or late.
// The city is a prologue: it is in the stamp book but not on the map of Japan. Any Japanese airport gate can fly you back.
(function () {
  const STAMPS = {
    bkk_spirit: ['SPIRIT HOUSE', 'spirit', 'bkk_land'], bkk_pass: ['BOARDING PASS', 'bpass', 'bkk_land'], bkk_exit: ['DEPARTURE STAMP', 'passport', 'bkk_land'],
    bkk_churn: ['CHURNING OF THE OCEAN', 'naga', 'bkk_air'], bkk_food: ['MANGO STICKY RICE', 'mango', 'bkk_air'],
    bkk_board: ['FOUND YOUR SEAT', 'seat', 'bkk_plane'], bkk_meal: ['DINNER AT 35000 FEET', 'tray', 'bkk_plane']
  };
  const rnd = Math.random, pick = a => a[rnd() * a.length | 0];
  const S = () => Snd.ctx && Snd.ctx.state === 'running' ? Snd.ctx.currentTime + 0.01 : 0;
  const tone = (type, f, t, d, v, o) => Snd.tone(type, f, t, d, v, Object.assign({ bus: Snd.sfx }, o || {}));
  const pinpon = () => { const t = S(); if (t) { tone('sine', nf('G5'), t, 0.5, 0.06, { pluck: 1, echo: 1 }); tone('sine', nf('E5'), t + 0.28, 0.5, 0.06, { pluck: 1, echo: 1 }); tone('sine', nf('C5'), t + 0.56, 0.9, 0.06, { pluck: 1, echo: 1 }); } };
  const beep = () => { const t = S(); if (t) tone('square', 1760, t, 0.1, 0.03, { lp: 3000 }); };
  // where you are in the journey
  const BK = { checked: 0, stamped: 0, secured: 0, seat: 'A', change: 0, bstart: 0, group: 0, seated: 0, airT: 0, meal: 0 };
  const PASS = () => 'TA 641  BKK - HND  SEAT 27' + BK.seat + '  GATE ' + (BK.change ? 'D7' : 'D3') + '  GROUP 3';
  // pseudo Thai lettering for the bilingual signs: loops, hooks and tails at the pixel scale
  function thai(g, x, y, n, c) { for (let i = 0; i < n; i++) { const k = (i * 7 + n) % 5, px = x + i * 4; R(g, px, y + 1, U, 3, c); R(g, px + 2, y + 1, U, 3, c); R(g, px, y + 3.5, 2.5, U, c); if (k === 0) p1(g, px, y, c); else if (k === 1) R(g, px + 2, y - 1, U, 2, c); else if (k === 2) R(g, px, y + 1, 2.5, U, c); else if (k === 3) { R(g, px + 2, y - 1, U, 2, c); p1(g, px + 3, y - 1.5, c); } } }
  // a hanging sign: dark board, a word in English and the same in Thai under it
  function hang(g, x, y, s, col, w) { const ww = w || tw(s) + 12; R(g, x - ww / 2 - 1, y - 1, ww + 2, 17, '#1d1626'); R(g, x - ww / 2, y, ww, 15, col || '#2a3a5a'); txtC(g, s, x, y + 2.5, '#f4f1e6'); thai(g, x - (Math.min(s.length, 8) * 2), y + 9, Math.min(s.length, 8), '#f2c14e'); R(g, x - 0.5, y - 10, 1, 9, '#6b6478'); }
  // the edge-of-screen arrow toward what is next, and the HUD line
  function next() { const id = M.id;
    if (id === 'bkk_land') { if (!BK.checked) return [632, 366, 'CHECK IN AT ROW M']; if (!BK.stamped) return [416, 236, 'PASSPORT CONTROL']; if (!BK.secured) return [380, 176, 'SECURITY']; return [416, 116, 'TO THE GATES']; }
    if (id === 'bkk_air') { if (!BK.change) return [404, 290, 'GATE D3']; if (BK.group < 3) return [404, 104, BK.bstart ? 'GATE D7 - BOARDING GROUP ' + Math.max(1, BK.group) : 'GATE CHANGED: D7']; return [404, 104, 'BOARD NOW: GATE D7']; }
    if (id === 'bkk_plane') return BK.seated ? null : [seatX(27), 96, 'FIND SEAT 27' + BK.seat]; return null; }
  function arrow(cx, cy) { const n = next(); if (!n || G.state !== 'play') return; const dx = n[0] - pl.x, dy = n[1] - pl.y, d = Math.hypot(dx, dy); if (d < 60) return;
    const sx = n[0] - cx, sy = n[1] - cy, on = sx > 10 && sx < W - 10 && sy > 30 && sy < H - 10; if (on) { const b = Math.abs(Math.sin(G.t * 4)) * 3; R(ctx, sx - 2, sy - 38 - b, 4, 6, '#f2c14e'); R(ctx, sx - 4, sy - 33 - b, 8, 1.5, '#f2c14e'); R(ctx, sx - 3, sy - 31.5 - b, 6, 1, '#f2c14e'); R(ctx, sx - 2, sy - 30.5 - b, 4, 1, '#f2c14e'); R(ctx, sx - 1, sy - 29.5 - b, 2, 1, '#f2c14e'); return; }
    const a = Math.atan2(dy, dx), r = Math.min(W, H) * 0.4, ax = W / 2 + Math.cos(a) * Math.min(W / 2 - 14, r * 1.5), ay = H / 2 + Math.sin(a) * Math.min(H / 2 - 14, r), p = 1 + Math.sin(G.t * 5) * 0.15; ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.scale(p, p); ctx.fillStyle = '#1d1626'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -6); ctx.lineTo(-2, 0); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.moveTo(6.5, 0); ctx.lineTo(-4, -4.5); ctx.lineTo(-1.5, 0); ctx.lineTo(-4, 4.5); ctx.closePath(); ctx.fill(); ctx.restore(); }
  let annT = 12;
  function announce(dt, lines) { annT -= dt; if (annT <= 0) { annT = 26 + rnd() * 10; pinpon(); NET.say(pick(lines), 4); } }
  // a modern shopfront: glass, a lit sign, the goods inside
  const shop = (x, y, w, sign, c) => tower(x, y, w, 34, { c: '#e8e4ec', sign, sc: c, top: false, lit: 0.8, wc: '#ffe8b0', gx: 6, ww: 4 });
  // a gap in a wall that opens once a step is done: open(gap) clears its cells, close(gap) fills them
  const gate = (x0, y0, x1, y1, on) => block(x0, y0, x1, y1, on ? 0 : 1);

  // ---------- the departures hall (landside) ----------
  const ISL = [['J', 'SIAM SKY', 200, 352, '#3f9a5a'], ['K', 'MEKONG AIR', 416, 352, '#c8382e'], ['M', 'TABI AIR', 632, 352, '#2f5ab0'], ['P', 'CHAO PHRAYA AIR', 200, 472, '#8a6aff'], ['N', 'LOTUS JET', 416, 472, '#f06a8c'], ['L', 'ORCHID AIRWAYS', 632, 472, '#e08a3a']];
  const FLIGHTS = [['TA 641', 'TOKYO HANEDA', '23:55', 'M'], ['SS 202', 'PHUKET', '23:10', 'J'], ['MK 88', 'HANOI', '23:40', 'K'], ['OA 711', 'SINGAPORE', '00:15', 'L'], ['LJ 15', 'SEOUL', '00:30', 'N'], ['CP 9', 'TAIPEI', '00:45', 'P']];
  MAPS.bkk_land = { station: 1, name: 'SUVARNABHUMI AIRPORT', sub: 'DEPARTURES - BANGKOK', tw: 52, th: 42, music: 'bangkok',
    zones: [[0, 560, 832, 672, 'DEPARTURES KERB', 'LEVEL 4'], [0, 96, 832, 226, 'PASSPORT CONTROL', 'AND SECURITY'], [0, 226, 832, 560, 'CHECK-IN HALL', 'ROWS J TO P']],
    lay() { tRect(PL, 0, 0, 52, 36); tRect(PV, 0, 36, 52, 38); tRect(AS, 0, 38, 52, 42); },
    hud: () => { const n = next(); return n ? 'NEXT: ' + n[2] : null; },
    tick() { gate(404, 214, 428, 223, BK.stamped); gate(404, 146, 428, 154, BK.secured); if (G.state !== 'play') return;
      const inArch = Math.abs(pl.x - 416) < 12 && pl.y > 140 && pl.y < 162; if (inArch && !M.inArch) { M.inArch = 1; beep(); } else if (!inArch) M.inArch = 0;
      announce(1 / 60, ['TABI AIR FLIGHT TA 641 TO TOKYO HANEDA IS NOW CHECKING IN AT ROW M.', 'PLEASE DO NOT LEAVE YOUR BAGGAGE UNATTENDED.', 'SAWASDEE KHA. WELCOME TO SUVARNABHUMI AIRPORT.', 'PASSENGERS ARE REMINDED THAT LIQUIDS OVER ONE HUNDRED MILLILITRES CANNOT BE TAKEN THROUGH SECURITY.']); },
    over(cx, cy) { arrow(cx, cy); },
    deco() {
      stationSprites(); const g = M.ground.g, r = RNG(11);
      // the floor: big pale stone slabs, with the shadows of the roof trusses falling across it
      R(g, 0, 96, 832, 480, '#e4ded2'); for (let y = 96; y < 576; y += 32) for (let x = (y / 32 & 1) * 16; x < 832; x += 32) R(g, x, y, 32, 32, (x + y) % 64 ? '#e0dace' : '#e8e2d6'); for (let k = 0; k < 60; k++) R(g, r() * 832, 100 + r() * 470, 30, U, 'rgba(255,255,255,0.5)');
      for (let x = -200; x < 1000; x += 72) for (let y = 96; y < 576; y += 2) R(g, x + (y - 96) * 0.4, y, 3, 2, 'rgba(90,80,100,0.06)');
      // the back: the glass wall onto airside, the door to the gates, and security and passport control in front of it
      R(g, 0, 0, 832, 96, '#2a3446'); for (let x = 0; x < 832; x += 24) R(g, x, 0, 1, 96, '#3a4a60'); R(g, 0, 90, 832, 6, '#8a94a6'); block(0, 0, 832, 100);
      R(g, 392, 60, 48, 36, '#5a6a8a'); R(g, 394, 62, 44, 34, '#bfe8ff'); hang(g, 416, 40, 'ALL GATES', '#f2c14e'); txtC(g, 'D', 416, 84, '#2a3446');
      M.SPOTS.push({ x: 416, y: 112, r: 16, label: 'TO THE GATES', fn: () => { if (!BK.secured) { dialog(['THE DOOR TO THE GATES. SECURITY FIRST, THOUGH.']); return; } Snd.fx('page'); go('bkk_air', 480, 712, 'u'); } });
      R(g, 0, 146, 832, 8, '#8a8496'); R(g, 0, 146, 832, 1, '#c8c0d4'); block(0, 146, 404, 154); block(428, 146, 832, 154);
      put(SPR.arch, 416, 162, 17, 39); block(399, 156, 404, 162); block(428, 156, 433, 162); put(SPR.xray, 352, 162, 23, 21); block(330, 154, 376, 162); put(SPR.xray, 480, 162, 23, 21); block(458, 154, 502, 162);
      npc('office', 452, 176, { tint: '#3a3a5a', dir: 'l', lines: ['TRAYS ARE ON THE LEFT. LAPTOP OUT, LIQUIDS OUT, POCKETS EMPTY.'] }); npc('office', 300, 176, { tint: '#3a3a5a', dir: 'r', lines: ['NEXT, PLEASE. THANK YOU KHA.'] });
      M.SPOTS.push({ x: 380, y: 178, r: 14, label: 'PUT YOUR THINGS IN THE TRAYS', fn: () => { if (!BK.stamped) { dialog(['PASSPORT CONTROL IS FIRST, JUST BEHIND YOU.']); return; } if (BK.secured) { dialog(['YOU ARE THROUGH. YOUR TRAYS ARE ALREADY STACKED BACK UP.']); return; } G.state = 'mini'; G.mg = { k: 'tray', sp: {}, t: 0 }; MG.tray.init(G.mg); Snd.fx('ui'); } });
      R(g, 0, 154, 280, 60, '#c8c0b4'); R(g, 552, 154, 280, 60, '#c8c0b4'); for (let x = 0; x < 280; x += 20) R(g, x, 154, 1, 60, '#b8b0a4'); for (let x = 552; x < 832; x += 20) R(g, x, 154, 1, 60, '#b8b0a4'); block(0, 154, 280, 214); block(552, 154, 832, 214);
      hang(g, 160, 186, 'DUTY FREE AFTER SECURITY', '#3f7ab0'); hang(g, 690, 186, 'GATES A - G', '#3f7ab0');
      R(g, 0, 214, 832, 9, '#6a5a8a'); R(g, 0, 214, 832, 1, '#9a8ab8'); block(0, 214, 404, 223); block(428, 214, 832, 223);
      for (const x of [336, 372, 460, 496]) { put(SPR.booth, x, 223, 17, 29); npc('office', x, 208, { tint: '#3a4a3a', dir: 'd', lines: ['SAWASDEE KRAP. PASSPORT AND BOARDING PASS, PLEASE.'] }); }
      M.SPOTS.push({ x: 416, y: 236, r: 15, label: 'SHOW YOUR PASSPORT', fn: () => { if (!BK.checked) { Snd.fx('talk'); dialog(['THE OFFICER LOOKS FOR YOUR BOARDING PASS. YOU DO NOT HAVE ONE YET.', '"CHECK IN FIRST, KRAP. YOUR AIRLINE IS ON THE BIG BOARD BY THE DOORS."']); return; } if (BK.stamped) { dialog(['YOU ARE ALREADY STAMPED OUT. THROUGH YOU GO.']); return; } Snd.fx('stamp');
        dialog(['THE OFFICER CHECKS YOUR FACE AGAINST THE PHOTO, SCANS YOUR PASSPORT, AND PRESSES YOUR FINGERS TO A LITTLE GREEN GLASS.', 'THUNK. A DEPARTURE STAMP WITH A LITTLE PLANE ON IT. "HAVE A GOOD TRIP KRAP."'], () => { BK.stamped = 1; award('bkk_exit'); }); } });
      
      // the check-in islands: an airline each, a letter on a board above, and queues in front
      for (const [L, name, x, y, c] of ISL) {
        put(SPR['isl' + L], x, y, 56, 47); block(x - 54, y - 30, x + 54, y);
        M.ACT.push({ x, y: y + 0.5, sayT: 0, always: 1, draw(e, sx, sy) { const by = sy - 92; R(ctx, sx - 1, by - 20, 2, 20, '#6b6478'); R(ctx, sx - 30, by - 1, 60, 24, '#1d1626'); R(ctx, sx - 29, by, 58, 22, '#2a3446'); txtC(ctx, L, sx - 18, by + 4, '#f2c14e', null, 2); txt(ctx, name.split(' ')[0], sx - 6, by + 3, '#f4f1e6'); txt(ctx, (name.split(' ')[1] || ''), sx - 6, by + 11, c === '#2f5ab0' ? '#8ab0f0' : lite(c, 0.3)); } });
        for (let k = -1; k <= 1; k++) npc('office', x + k * 30, y - 34, { tint: c, dir: 'd', lines: L === 'M' ? ['SAWASDEE KHA! TABI AIR TO TOKYO. COME TO THE DESK, PLEASE.'] : ['SAWASDEE KHA. THIS IS ' + name + '. TOKYO? THAT IS TABI AIR, ROW M.'] });
        for (let q = 0; q < 2; q++) { R(g, x - 40, y + 21 + q * 10, 80, 1, '#2f5ab0'); R(g, x - 40, y + 21 + q * 10, 80, U, '#5a8ae0'); } for (let q = 0; q < 2; q++) for (const px of [x - 40, x, x + 40]) put(SPR.stan, px, y + 24 + q * 10, 2, 9);
        if (L === 'M') M.SPOTS.push({ x, y: y + 12, r: 14, label: 'CHECK IN', fn: () => { if (BK.checked) { dialog(['YOU ARE ALL CHECKED IN. ' + PASS() + '.']); return; } G.state = 'mini'; G.mg = { k: 'checkin', sp: { stamp: 'bkk_pass' }, t: 0 }; MG.checkin.init(G.mg); Snd.fx('ui'); } });
        else M.SPOTS.push({ x, y: y + 12, r: 14, label: 'ASK AT ' + name, lines: ['"SAWASDEE KHA. THIS IS ' + name + '. TOKYO? THAT IS TABI AIR, OVER AT ROW M."', 'SHE POINTS. EVERYONE HERE POINTS WITH THEIR WHOLE HAND, PALM UP. IT IS MORE POLITE.'] }); }
      for (const [x, y] of [[592, 392], [612, 398], [660, 396]]) M.ACT.push(Object.assign(npc(pick(['tourist', 'teen', 'salary']), x, y, { dir: 'u', lines: ['WE ARE GOING TO TOKYO TOO. FIRST TIME! ARE YOU EXCITED?', 'I PACKED THREE JACKETS. MY MOTHER SAYS IT IS COLD THERE.'] }), { qh: x }));
      // the big departure board by the doors
      M.ACT.push({ x: 416, y: 540, sayT: 0, always: 1, last: -1, flip: 0, draw(e, sx, sy) { const bw = 196, bx = sx - bw / 2, by = sy - 74; for (const k of [bx + 20, bx + bw - 20]) R(ctx, k, by - 26, 1, 26, '#6b6478'); R(ctx, bx - 2, by - 2, bw + 4, 48, '#2a2430'); R(ctx, bx, by, bw, 44, '#120e1a'); txt(ctx, 'DEPARTURES', bx + 4, by + 2, '#f2c14e'); thai(ctx, bx + 52, by + 2.5, 5, '#c8a040');
        const n = Math.floor(worldTime() / 30); if (e.last !== n) { e.last = n; e.flip = 0.7; } if (e.flip > 0) e.flip -= 1 / 60; const FL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        FLIGHTS.forEach((f, i) => { const yy = by + 10 + i * 5.6; [[f[0], 4, '#f4f1e6'], [f[1], 40, i === 0 ? '#ffd84a' : '#c8c0d4'], [f[2], 118, '#f4f1e6'], [f[3], 146, '#5ad88a'], [i === 0 ? 'CHECK-IN' : 'ON TIME', 160, i === 0 ? (G.t % 1 < 0.6 ? '#5ad88a' : '#2a6a4a') : '#c8c0d4']].forEach(([s, ox, c]) => { let q = s; if (e.flip > 0 && i % 2) q = s.split('').map((ch, j) => ch === ' ' || e.flip < 0.7 - j * 0.04 ? ch : FL[(j * 7 + (G.t * 30 | 0)) % FL.length]).join(''); txt(ctx, q, bx + ox, yy, c); }); }); } });
      M.SPOTS.push({ x: 416, y: 552, r: 18, label: 'READ THE BOARD', fn: () => { Snd.fx('page'); dialog(['TA 641, TOKYO HANEDA, 23:55. CHECK-IN: ROW M.', 'ROW M IS AT THE BACK OF THE HALL, ON THE RIGHT. THE LETTERS HANG ABOVE EACH ROW.']); } });
      // round the sides: a mini mart, SIM cards and money, information, a charging tower, the wrapping machine and garlands
      shop(70, 300, 64, 'SIM CARDS', '#3f9a5a'); M.SPOTS.push({ x: 70, y: 307, r: 14, label: 'LOOK', lines: ['A SIM CARD FOR JAPAN, READY TO GO. THE MAN PUTS IT IN YOUR PHONE FOR YOU AND IT JUST WORKS.', 'NOW YOU CAN GET LOST IN TOKYO AND FIND YOURSELF AGAIN ON A MAP.'] });
      shop(70, 430, 64, 'EXCHANGE', '#f2c14e'); M.SPOTS.push({ x: 70, y: 437, r: 14, label: 'CHANGE MONEY', lines: ['BAHT TO YEN. THE YEN NOTES ARE BIGGER, AND THERE ARE FAR MORE NOUGHTS ON THEM.', 'TEN THOUSAND OF ANYTHING FEELS RICH. IT IS NOT. ENJOY IT ANYWAY.'] });
      shop(766, 300, 64, 'INFO', '#2f5ab0'); npc('office', 766, 316, { tint: '#2f5ab0', lines: ['TOKYO? ROW M FOR CHECK-IN, THEN PASSPORT CONTROL AT THE BACK. THE ARROW ON YOUR SCREEN KNOWS THE WAY, KHA.'] });
      shop(766, 430, 64, 'MINI MART', '#e0563f'); M.SPOTS.push({ x: 766, y: 437, r: 14, label: 'BUY A SNACK', fn: () => { Snd.fx('munch'); dialog([pick(['A BAG OF SEAWEED CRISPS, SPICY. FOR THE PLANE. YOU EAT HALF OF THEM BEFORE THE PLANE.', 'A TOASTED HAM AND CHEESE SANDWICH, PRESSED HOT BY THE CLERK. THE BEST AIRPORT FOOD IN THE WORLD, SOME SAY.', 'A BOTTLE OF THAI ICED TEA, ORANGE AND SWEET AND VERY COLD.']), 'THE CLERK SAYS "KHOP KHUN KHA" AND SMILES. YOU WILL MISS THAT SMILE.']); } });
      put(SPR.desk, 78, 500, 31, 21); block(48, 492, 108, 500); M.ACT.push({ x: 78, y: 500.5, sayT: 0, always: 1, draw(e, sx, sy) { const by = sy - 58; R(ctx, sx - 1, by + 12, 2, 10, '#6b6478'); R(ctx, sx - 27, by - 1, 54, 14, '#1d1626'); R(ctx, sx - 26, by, 52, 12, '#c8a040'); R(ctx, sx - 26, by, 52, U, '#f2d880'); txtC(ctx, 'EXPRESS', sx, by + 3.5, '#1d1626'); } }); npc('office', 78, 484, { tint: '#c8a040', dir: 'd', lines: ['SAWASDEE KHA. EXPRESS LANE: NO QUEUES, STRAIGHT ONTO THE PLANE.'] });
      M.SPOTS.push({ x: 78, y: 510, r: 14, label: 'EXPRESS: STRAIGHT TO YOUR SEAT', fn: () => MENU.open('express', null, { yes: express }) });
      put(SPR.wrapper, 300, 524, 15, 33); block(286, 516, 314, 524); M.SPOTS.push({ x: 300, y: 534, r: 13, label: 'WRAP YOUR SUITCASE', fn: () => { const t = S(); if (t) Snd.noise(t, 2.2, 0.04, 600, 2400, Snd.sfx); M.wrapT = G.t; dialog(['THE MAN SPINS YOUR SUITCASE ON A TURNTABLE AND WRAPS IT IN GREEN PLASTIC, ROUND AND ROUND, UNTIL IT LOOKS LIKE A SWEET.', 'NOTHING WILL GET INTO IT. NOTHING WILL GET OUT. YOU WILL NEED SCISSORS IN TOKYO.']); } });
      M.ACT.push({ x: 300, y: 524.5, sayT: 0, draw(e, sx, sy) { const sp = G.t - (M.wrapT || -9) < 3; ctx.save(); ctx.translate(sx, sy - 16); ctx.scale(sp ? Math.cos(G.t * 9) : 1, 1); R(ctx, -6, -8, 12, 14, '#5aa85a'); R(ctx, -6, -8, 12, 2, '#8ad88a'); for (let k = -6; k < 8; k += 3) R(ctx, -6, k, 12, U, '#3f8a4a'); ctx.restore(); } });
      put(SPR.garland, 540, 524, 15, 27); block(526, 518, 554, 524); npc('granny', 560, 532, { tint: '#f2c14e', lines: ['PHUANG MALAI: JASMINE AND MARIGOLD, THREADED BY HAND THIS MORNING.', 'FOR LUCK ON YOUR JOURNEY. SMELL IT. NOW YOU WILL REMEMBER BANGKOK.'] });
      put(SPR.charger, 766, 520, 9, 33); block(758, 514, 774, 520); M.SPOTS.push({ x: 766, y: 530, r: 12, label: 'CHARGE YOUR PHONE', lines: ['YOU PLUG IN. FOURTEEN PERCENT. THE PERSON NEXT TO YOU IS ON TWO, AND PRAYING.'] });
      for (const x of [140, 712]) { prop('bench', x, 410, 9); } prop('vend3', 150, 530, 6); for (let k = 0; k < 4; k++) put(SPR.trolley, 40 + k * 12, 540, 10, 16);
      // the glass front and its doors, which slide open as you come near
      R(g, 0, 560, 832, 16, '#a8c8dc'); for (let x = 0; x < 832; x += 16) R(g, x, 560, 1, 16, '#6a8aa8'); R(g, 0, 560, 832, 1, '#ffffff');
      for (const [a, b] of [[0, 176], [224, 392], [440, 608], [656, 832]]) block(a, 562, b, 574);
      for (const dx of [200, 416, 632]) { R(g, dx - 24, 560, 48, 16, '#d8ccb8'); M.ACT.push({ x: dx, y: 575, sayT: 0, draw(e, sx, sy) { const o = Math.max(0, 1 - Math.hypot(pl.x - e.x, pl.y - e.y) / 50) * 22; for (const s of [-1, 1]) { R(ctx, sx + s * (o + 12) - 11, sy - 18, 22, 18, 'rgba(190,226,248,0.8)'); R(ctx, sx + s * (o + 12) - 11, sy - 18, 22, 1, '#ffffff'); R(ctx, sx + s * (o + 12) - 11 + (s > 0 ? 0 : 21), sy - 18, 1, 18, '#6a8aa8'); } R(ctx, sx - 24, sy - 20, 48, 3, '#6a8aa8'); txtC(ctx, 'DEPARTURES', sx, sy - 27, '#2f5ab0'); } }); }
      // outside: the kerb, a spirit house with its offerings, a street cat, and the taxis
      put(SPR.spirith, 96, 600, 13, 43); block(86, 594, 106, 600); stampSpot('bkk_spirit', 120, 600, 'MAKE A WAI', 'bow', ['A LITTLE SPIRIT HOUSE ON A POST, GOLD AND RED, WITH FLOWER GARLANDS, INCENSE, AND A BOTTLE OF RED SODA WITH A STRAW IN IT.', 'THE SPIRITS OF THE PLACE LIVE HERE, SO THEY LEAVE THE BUILDING ALONE. YOU PRESS YOUR PALMS TOGETHER AND ASK FOR A GOOD FLIGHT.'], 12);
      M.ACT.push({ cat: true, x: 60, y: 600, k: 0 });
      for (let x = 6; x < 832; x += 14) R(g, x, 639.5, 7, 1, '#e8e4f0'); for (let x = 0; x < 832; x += 24) R(g, x, 606, 12, 2, x % 48 ? '#f4f1e6' : '#c8382e');
      for (let i = 0; i < 4; i++) M.ACT.push({ x: 0, y: 626 + (i % 2) * 22, sayT: 0, always: 1, i, draw(e, sx, sy) { const cx = e.x - sx, per = 22 + e.i * 5, p = ((worldTime() + e.i * 9) % per) / per, dir = e.i % 2 ? -1 : 1, X = dir > 0 ? -60 + p * (832 + 120) : 892 - p * 952, spr = SPR.taxi[e.i % 2][dir > 0 ? 0 : 1]; ell(ctx, X - cx, sy, 14, 2.5, 'rgba(22,30,50,0.35)'); ctx.drawImage(spr, snap(X - cx - 16), snap(sy - 16)); } });
      npc('monk', 300, 440, { rad: 20, lines: ['WE ARE GOING TO A TEMPLE IN KYOTO. WE TRAVEL LIGHT.', 'ONE BAG EACH. AND THE BAG IS MOSTLY SNACKS.'] }); npc('teen', 520, 400, { rad: 30, tint: '#f06a8c', lines: ['MY FIRST TIME FLYING ALONE. MY MUM IS WAVING FROM THE DOOR. SHE HAS BEEN WAVING FOR TWENTY MINUTES.'] });
      npc('tourist', 140, 470, { rad: 24, lines: ['I CAME FOR A WEEK. I STAYED FOR A MONTH. NOW I AM GOING TO JAPAN BECAUSE MY VISA ENDS.'] });
      crowd(5, 40, 520, 790, 520, 8); crowd(4, 790, 260, 40, 260, 8); crowd(3, 300, 400, 530, 400, 30);
      M.st = [200, 600]; M.LIGHTS = [];
    } };

  // ---------- airside: the Churning of the Milk Ocean, the guardians, the shops and concourse D ----------
  const GATES = [['D1', 404, 400], ['D3', 404, 290], ['D5', 404, 200], ['D7', 404, 104], ['D2', 556, 400], ['D4', 556, 290], ['D6', 556, 200], ['D8', 556, 104]];
  const DEST = { D1: 'SINGAPORE', D2: 'HANOI', D4: 'SEOUL', D5: 'PHUKET', D6: 'TAIPEI', D8: 'MANILA' };
  MAPS.bkk_air = { station: 1, name: 'SUVARNABHUMI AIRPORT', sub: 'AIRSIDE - CONCOURSE D', tw: 60, th: 46, music: 'bangkok',
    zones: [[380, 0, 580, 440, 'CONCOURSE D', 'GATES D1 TO D8'], [0, 440, 960, 736, 'DEPARTURE HALL', 'THE CHURNING OF THE MILK OCEAN']],
    lay() { tRect(PL, 0, 0, 60, 46); },
    hud: () => { const n = next(); return n ? 'NEXT: ' + n[2] : null; },
    tick() { if (G.state !== 'play' && G.state !== 'sit') return; const dt = 1 / 60; BK.airT += dt;
      if (G.state === 'play') { if (pl.x > 452 && pl.x < 472 && pl.y > 60 && pl.y < 420) step(pl, 0, -40 / 60); else if (pl.x > 488 && pl.x < 508 && pl.y > 60 && pl.y < 420) step(pl, 0, 40 / 60); }
      if (!BK.change && (pl.y < 420 || BK.airT > 50)) { BK.change = 1; pinpon(); NET.say('GATE CHANGE: TABI AIR TA 641 TO TOKYO NOW DEPARTS FROM GATE D7. GATE D7.', 6); }
      if (BK.change && !BK.bstart && Math.hypot(pl.x - 404, pl.y - 120) < 130) BK.bstart = G.t;
      if (BK.bstart) { const g = BK.group, e = G.t - BK.bstart, ng = e > 18 ? 3 : e > 11 ? 2 : e > 4 ? 1 : 0; if (ng > g) { BK.group = ng; pinpon(); NET.say(ng < 3 ? 'TA 641 TO TOKYO: NOW BOARDING GROUP ' + ng + '. GROUP ' + ng + ' ONLY, PLEASE.' : 'TA 641 TO TOKYO: NOW BOARDING GROUP 3. THAT IS YOU!', 5);
        for (const a of M.ACT) if (a.pax && a.pax === ng) { a.go = 1; a.rad = 0; } } }
      for (const a of M.ACT) if (a.go) { if (a.y > 74) { a.y -= 24 * dt; a.x += (392 - a.x) * dt * 2; a.mv = true; a.wt += dt; a.dir = 'u'; } else a.hide = 1; }
      if (G.state === 'play') announce(dt, ['THIS IS A FINAL CALL FOR SIAM SKY FLIGHT SS 202 TO PHUKET AT GATE D5.', 'PLEASE KEEP YOUR BELONGINGS WITH YOU AT ALL TIMES.', 'WELCOME TO SUVARNABHUMI. SMOKING IS ONLY PERMITTED IN THE SMOKING ROOMS.']); },
    over(cx, cy) { arrow(cx, cy); },
    deco() {
      stationSprites(); const g = M.ground.g, r = RNG(23);
      // outside the windows: the apron, planes at their stands, jet bridges, a tug going round
      R(g, 0, 0, 960, 440, '#8a8a96'); for (let i = 0; i < 1200; i++) R(g, r() * 960, r() * 440, 2, U, i % 2 ? '#7e7e8a' : '#969aa6'); for (const x of [120, 840]) for (let y = 0; y < 440; y += 4) R(g, x, y, 1, 2, '#e8c84a');
      for (const [x, y, L] of [[230, 110, 1], [230, 300, 1], [730, 110, 0], [730, 300, 0]]) { put(L ? SPR.jetL : SPR.jet, x, y, 112, 65); const bx = L ? 330 : 586; R(g, bx, y - 34, 50, 14, '#c8c4cc'); R(g, bx, y - 34, 50, 2, '#e4e0ec'); for (let k = 0; k < 50; k += 6) R(g, bx + k, y - 32, 1, 12, '#8a8496'); }
      M.ACT.push({ x: 0, y: 420, sayT: 0, always: 1, t: rnd() * 30, draw(e, sx, sy) { e.t += 1 / 60; const p = (e.t % 26) / 26, X = p < 0.5 ? -80 + p * 2 * 450 : 370 - (p - 0.5) * 2 * 450; ctx.drawImage(SPR.tug, snap(X - (e.x - sx) - 48), snap(sy - 30)); } });
      block(0, 0, 380, 440); block(580, 0, 960, 440); block(380, 0, 580, 30);
      for (const x of [380, 576]) { R(g, x, 24, 4, 416, '#d8e8f4'); R(g, x, 24, 4, U, '#ffffff'); for (let y = 24; y < 440; y += 24) R(g, x, y, 4, 1, '#8a9aaa'); }
      // the concourse: polished floor, the two moving walkways, the gates either side
      R(g, 384, 24, 192, 420, '#e4ded2'); for (let y = 24; y < 444; y += 24) R(g, 384, y, 192, U, '#d4cec2'); R(g, 384, 24, 192, 8, '#2a3446');
      M.ACT.push({ x: 480, y: 30, sayT: 0, always: 1, draw(e, sx, sy) { for (const [x0, dir] of [[452, -1], [488, 1]]) { const lx = sx + (x0 - 480); R(ctx, lx, sy + 30, 20, 390, '#3a3a4e'); R(ctx, lx - 1.5, sy + 30, 1.5, 390, '#8a8496'); R(ctx, lx + 20, sy + 30, 1.5, 390, '#8a8496'); const o = ((G.t * 24) % 12) * dir; for (let k = 0; k < 34; k++) { const yy = sy + 34 + k * 12 + o; if (yy > sy + 30 && yy < sy + 416) { R(ctx, lx + 5, yy, 10, 1, '#f2c14e'); R(ctx, lx + 7, yy + dir, 6, 1, '#f2c14e'); } } } } });
      for (const [gt, x, y] of GATES) { const west = x < 480; put(SPR.gdesk, x, y, 15, 19); block(x - 14, y - 8, x + 14, y);
        M.ACT.push({ x, y: y + 0.4, sayT: 0, always: 1, gt, draw(e, sx, sy) { const by = sy - 40, mine = gt === 'D7' || gt === 'D3', dest = gt === 'D7' ? (BK.change ? 'TOKYO' : 'NANNING') : gt === 'D3' ? (BK.change ? 'CHANGED - SEE D7' : 'TOKYO') : DEST[gt];
          R(ctx, sx - 22, by, 44, 18, '#1d1626'); R(ctx, sx - 21, by + 1, 42, 16, '#2a3446'); txt(ctx, gt, sx - 19, by + 3, '#f2c14e'); txt(ctx, dest.length > 9 ? dest.slice(0, 9) : dest, sx - 19, by + 10, mine && dest === 'TOKYO' ? '#5ad88a' : dest.startsWith('CHANGED') ? '#ff8a6a' : '#c8c0d4'); if (dest.startsWith('CHANGED') && G.t % 1 < 0.5) R(ctx, sx + 12, by + 3, 6, 5, '#ff8a6a'); } });
        const sx = west ? 426 : 534; for (const dy of [22, 40]) { prop('seats', sx, y + dy, 26); M.SPOTS.push({ x: sx, y: y + dy + 7, r: 9, label: 'SIT DOWN', fn: (q => () => RIDES.sitAt({ x: q[0], y: q[1] }))([sx, y + dy]) }); }
        R(g, west ? 384 : 566, y - 16, 10, 22, '#5a6a8a'); }
      M.SPOTS.push({ x: 404, y: 298, r: 14, label: 'ASK AT GATE D3', fn: () => { Snd.fx('talk'); dialog(BK.change ? ['"TA 641? THE GATE HAS CHANGED, KHA. GATE D7, RIGHT AT THE END, ON THIS SIDE."', 'SHE POINTS UP THE CONCOURSE WITH HER WHOLE HAND.'] : ['"TA 641 TO TOKYO? YES, THIS GATE. BOARDING STARTS IN A LITTLE WHILE. PLEASE HAVE A SEAT."']); } });
      M.SPOTS.push({ x: 404, y: 112, r: 15, label: 'BOARD THE PLANE', fn: board });
      npc('office', 404, 92, { tint: '#2f5ab0', dir: 'd', lines: ['TA 641 TO TOKYO. WE BOARD BY GROUPS. PLEASE LISTEN FOR YOURS, KHA.'] });
      // people waiting at D7 who board before you, group by group, and a sleeper at D5
      [[426, 126, 1], [426, 144, 1], [440, 122, 2], [412, 142, 2], [434, 140, 2], [418, 128, 1]].forEach(([x, y, gp], i) => { const n = npc(['tourist', 'salary', 'teen', 'granny', 'office', 'kid'][i], x, y, { dir: 'u', lines: [gp === 1 ? 'GROUP ONE. THAT IS US. WE ALWAYS BOARD FIRST AND THEN SIT THERE FOR AN HOUR.' : 'GROUP TWO. WE ARE IN THE MIDDLE OF EVERYTHING.'] }); n.pax = gp; });
      npc('salary', 534, 222, { dir: 'd', lines: ['ZZZ...', '(HE HAS BEEN ASLEEP SINCE PHUKET WAS CALLED. HE IS GOING TO PHUKET.)'] });
      // the junction board
      M.ACT.push({ x: 480, y: 432, sayT: 0, always: 1, draw(e, sx, sy) { const bw = 104, bx = sx - bw / 2, by = sy - 50; R(ctx, bx - 2, by - 2, bw + 4, 34, '#2a2430'); R(ctx, bx, by, bw, 30, '#120e1a'); txt(ctx, 'GATES', bx + 3, by + 2, '#f2c14e'); const rows = [['TA 641 TOKYO', BK.change ? 'D7' : 'D3', BK.change ? (G.t % 1 < 0.6 ? 'GATE CHANGE' : '') : 'ON TIME'], ['SS 202 PHUKET', 'D5', 'FINAL CALL'], ['MK 88 HANOI', 'D2', 'ON TIME']];
        rows.forEach((q, i) => { const yy = by + 9 + i * 6.5; txt(ctx, q[0], bx + 3, yy, i === 0 ? '#ffd84a' : '#c8c0d4'); txt(ctx, q[1], bx + 58, yy, '#5ad88a'); txt(ctx, q[2], bx + 68, yy, i === 0 && BK.change ? '#ff8a6a' : '#c8c0d4'); }); R(ctx, sx - 1, by - 14, 2, 12, '#6b6478'); } });
      // the hall: polished floor with the light from the roof falling across it
      R(g, 0, 440, 960, 296, '#e4ded2'); for (let y = 440; y < 736; y += 32) for (let x = (y / 32 & 1) * 16; x < 960; x += 32) R(g, x, y, 32, 32, (x + y) % 64 ? '#e0dace' : '#e8e2d6'); for (let x = -300; x < 1200; x += 70) for (let y = 440; y < 736; y += 2) R(g, x + (y - 440) * 0.5, y, 3, 2, 'rgba(90,80,100,0.06)');
      R(g, 0, 440, 380, 6, '#8a8496'); R(g, 580, 440, 380, 6, '#8a8496'); block(0, 436, 380, 446); block(580, 436, 960, 446); block(0, 726, 960, 736); block(0, 446, 8, 736); block(952, 446, 960, 736);
      // the Churning of the Milk Ocean: gods and demons pulling the great serpent to churn the sea for the elixir of life
      put(SPR.churn, 480, 606, 160, 125); block(326, 588, 634, 606); R(g, 320, 606, 320, 10, 'rgba(120,180,220,0.35)');
      stampSpot('bkk_churn', 480, 640, 'TAKE A PHOTO', 'snap', ['THE CHURNING OF THE MILK OCEAN: GODS ON ONE SIDE, DEMONS ON THE OTHER, PULLING THE GREAT SERPENT BACK AND FORTH TO CHURN THE SEA.', 'IN THE STORY THEY CHURN FOR A THOUSAND YEARS TO FIND THE ELIXIR OF LIFE. YOU HAVE TWENTY MINUTES BEFORE BOARDING.'], 18, { frame: [310, 470, 340, 150] });
      for (const x of [300, 660]) { put(SPR.orchids, x, 610, 13, 23); block(x - 10, 604, x + 10, 610); }
      for (const [x, k] of [[420, 0], [540, 1]]) { put(SPR['yaksha' + k], x, 486, 22, 97); block(x - 12, 478, x + 12, 486); }
      M.SPOTS.push({ x: 480, y: 492, r: 14, label: 'LOOK UP', lines: ['TWO GIANT YAKSHA GUARD THE WAY TO THE GATES: DEMON GUARDIANS WITH TALL GOLD CROWNS, FANGS AND CLUBS.', 'THEY LOOK FIERCE SO THAT NOTHING BAD GETS PAST. YOU ARE NOT BAD. THEY LET YOU THROUGH.'] });
      // shops and the food court
      tower(110, 520, 140, 60, { c: '#2a2a3a', sign: 'DUTY FREE', sc: '#f2c14e', st: '#1d1626', wc: '#ffd98a', lit: 0.9 }); M.SPOTS.push({ x: 110, y: 527, r: 16, label: 'BROWSE DUTY FREE', lines: ['PERFUME, WHISKY, GIANT TOBLERONE-SHAPED CHOCOLATE THAT IS NOT CALLED THAT, AND A WALL OF DRIED MANGO.', 'YOU BUY NOTHING. YOU SMELL OF SIX PERFUMES.'] });
      shop(250, 520, 70, 'THAI SILK', '#8a6aff'); M.SPOTS.push({ x: 250, y: 527, r: 14, label: 'LOOK', lines: ['SCARVES OF THAI SILK THAT CHANGE COLOUR AS THEY MOVE, PURPLE TO GREEN TO GOLD.', 'THE WOMAN SHOWS YOU HOW TO TELL REAL SILK: IT IS COOL, THEN WARM. YOURS IS ONLY COOL. YOU PUT IT BACK.'] });
      shop(720, 520, 70, 'DRIED MANGO', '#f2c14e'); shop(850, 520, 80, 'ELEPHANT PANTS', '#3f7ab0'); M.SPOTS.push({ x: 850, y: 527, r: 14, label: 'LOOK', lines: ['BAGGY TROUSERS PRINTED WITH LITTLE ELEPHANTS. EVERY TRAVELLER IN THAILAND OWNS A PAIR. NOW SO DO YOU, NEARLY.'] });
      shop(110, 690, 76, 'BOAT NOODLES', '#c8382e'); M.SPOTS.push({ x: 110, y: 697, r: 14, label: 'EAT BOAT NOODLES', fn: () => { Snd.fx('slurp'); dialog(['A LITTLE BOWL OF DARK, RICH NOODLE SOUP WITH BEEF AND MORNING GLORY. THEY USED TO SELL IT FROM BOATS ON THE CANALS.', 'THE BOWLS ARE SMALL ON PURPOSE. YOU ARE MEANT TO HAVE SIX. YOU HAVE TWO. YOU HAVE A PLANE TO CATCH.']); } });
      shop(250, 690, 90, 'STICKY RICE', '#f2c14e'); const mg = npc('granny', 250, 706, { tint: '#f2c14e', dir: 'd', lines: ['MANGO STICKY RICE! THE LAST GOOD MANGO BEFORE JAPAN!'] }); mg.spot = { label: 'BUY MANGO STICKY RICE', stamp: 'bkk_food', act: 'hold', fx: 'munch', lines: ['SWEET STICKY RICE IN COCONUT CREAM, A WHOLE RIPE MANGO SLICED BESIDE IT, AND CRUNCHY YELLOW BEANS ON TOP.', 'THE MANGOES IN JAPAN COST AS MUCH AS A TAXI. YOU EAT THIS ONE VERY SLOWLY.'] };
      shop(700, 690, 76, 'THAI TEA', '#e08a3a'); M.SPOTS.push({ x: 700, y: 697, r: 14, label: 'BUY A THAI TEA', fn: () => { Snd.fx('slurp'); dialog(['ORANGE TEA, SWEET CONDENSED MILK, A MOUNTAIN OF ICE, IN A PLASTIC BAG WITH A STRAW AND A STRING HANDLE.', 'YOU HAVE TO FINISH IT BEFORE THE GATE. THIS IS NOT A PROBLEM.']); } });
      for (const x of [820, 860]) { put(SPR.mchair, x, 690, 9, 19); block(x - 8, 684, x + 8, 690); } M.SPOTS.push({ x: 840, y: 700, r: 14, label: 'TRY A MASSAGE CHAIR', fn: () => { const t = S(); if (t) for (let k = 0; k < 8; k++) Snd.noise(t + k * 0.22, 0.12, 0.03, 120, 600, Snd.sfx); dialog(['YOU PUT A COIN IN. THE CHAIR GRABS YOUR SHOULDERS, KNEADS YOUR BACK, AND ROLLS UP AND DOWN YOUR SPINE LIKE A RIVER STONE.', 'TEN MINUTES LATER YOU ARE SOUP. GOOD SOUP.']); } });
      prop('vend3', 600, 700, 6); for (const x of [420, 540]) prop('bench', x, 690, 9);
      npc('monk', 380, 660, { rad: 20, lines: ['THE GODS PULL ONE WAY, THE DEMONS THE OTHER, AND BETWEEN THEM THE WORLD GETS MADE.', 'IT IS A GOOD STORY TO SEE BEFORE A LONG JOURNEY.'] }); npc('kid', 620, 660, { rad: 24, tint: '#5ad8f0', lines: ['THE GREEN DEMON HAS FANGS! MUM SAYS HE IS A GOOD GUY. HE DOES NOT LOOK LIKE A GOOD GUY.'] });
      npc('tourist', 160, 600, { rad: 30, lines: ['I HAVE BEEN WALKING FOR TWENTY MINUTES AND I AM STILL NOT AT MY GATE. THIS AIRPORT IS A COUNTRY.'] });
      crowd(6, 20, 560, 940, 560, 10); crowd(5, 940, 650, 20, 650, 10); crowd(3, 420, 420, 420, 60, 4); crowd(3, 540, 60, 540, 420, 4);
      M.st = [480, 712]; M.LIGHTS = [];
    } };
  function board() { if (!BK.change || BK.group < 3) { Snd.fx('talk'); dialog([BK.change ? '"GROUP ' + (BK.group || 1) + ' ONLY, KHA. YOU ARE GROUP 3. PLEASE HAVE A SEAT, WE WILL CALL YOU."' : '"THIS FLIGHT IS NANNING, KHA. TOKYO IS AT D3 FOR NOW. CHECK THE BOARD."']); return; }
    beep(); setTimeout(beep, 120); G.back = null; dialog(['THE SCANNER BEEPS GREEN. "SEAT 27' + BK.seat + '. HAVE A NICE FLIGHT, KHA." SHE GIVES YOU A SMALL WAI.', 'DOWN THE JET BRIDGE: THE FLOOR SLOPES, THE AIR SMELLS OF JET FUEL AND COFFEE, AND THEN THE CABIN DOOR AND A SMILE.'], () => go('bkk_plane', 36, 96, 'r')); }

  // ---------- on board: find your seat ----------
  const seatX = row => 78 + (row - 10) * 20, SEATY = { A: 36, B: 52, C: 68, D: 124, E: 140, F: 156 };
  MAPS.bkk_plane = { indoor: 1, station: 1, name: 'TA 641 TO TOKYO', sub: 'BOEING CABIN, ROWS 10 TO 39', tw: 44, th: 12, music: 'bangkok', floor: 'tile',
    hud: () => { const n = next(); return n ? 'NEXT: ' + n[2] : null; },
    enter() { BK.seated = 0; NET.say('WELCOME ABOARD TABI AIR FLIGHT 641 TO TOKYO. PLEASE FIND YOUR SEAT. YOUR ROW NUMBER IS ON THE FLOOR BY EACH ROW.', 5); },
    tick() { const t = S(); if (t && Math.floor(G.t * 1.5) !== Math.floor((G.t - 1 / 60) * 1.5)) Snd.noise(t, 0.7, 0.012, 80, 400, Snd.sfx); if (BK.seated === 2 && G.state === 'play') { BK.seated = 3; takeoff(); } },
    over(cx, cy) { arrow(cx, cy); },
    deco() { M.floor = 'tile'; const g = M.ground.g, r = RNG(5);
      R(g, 0, 0, 704, 192, '#15101f'); ell(g, 680, 96, 40, 78, '#e8e4ec'); R(g, 10, 18, 670, 156, '#e8e4ec'); R(g, 10, 18, 670, 3, '#ffffff'); R(g, 10, 171, 670, 3, '#c8c4cc');
      for (let x = 30; x < 670; x += 20) for (const y of [21, 168]) { ell(g, x, y + 1.5, 4, 2, '#2a3a5a'); ell(g, x - 1, y + 1, 2, 1, '#5a7aa8'); }
      R(g, 20, 86, 650, 20, '#3a4a7a'); for (let x = 20; x < 670; x += 6) R(g, x, 86, 3, 20, '#344470'); R(g, 20, 86, 650, 1, '#5a6a9a'); R(g, 20, 105, 650, 1, '#2a3460');
      for (let row = 10; row < 40; row++) { const x = seatX(row); txtC(g, String(row), x, 88, row === 27 ? '#f2c14e' : '#8a9ac8'); for (const [s, y] of Object.entries(SEATY)) { R(g, x - 7, y - 7, 14, 12, '#2f3a6a'); R(g, x - 7, y - 7, 14, 3, '#4a5a9a'); R(g, x + (y < 96 ? -7 : -7), y - 7, 2, 12, '#24305a'); } }
      R(g, 640, 30, 30, 50, '#d8d4dc'); txtC(g, 'GALLEY', 655, 50, '#8a8496'); R(g, 640, 110, 30, 52, '#d8d4dc'); txtC(g, 'WC', 655, 132, '#8a8496'); R(g, 14, 30, 28, 50, '#d8d4dc'); R(g, 14, 110, 28, 52, '#d8d4dc');
      block(0, 0, 704, 86); block(0, 106, 704, 192); block(670, 0, 704, 192); block(0, 0, 18, 192);
      // passengers in their seats, and a few still putting bags away
      const COL = ['#2a2430', '#5a3a28', '#c9824a', '#3a2a2a', '#cfc9d6', '#1c1822'];
      M.ACT.push({ x: 0, y: 1, sayT: 0, always: 1, draw(e, sx, sy) { const cx = e.x - sx, cy = e.y - sy + 1; for (let row = 10; row < 40; row++) for (const [s, y] of Object.entries(SEATY)) { if (row === 27 && s === BK.seat) { if (BK.seated) { const x = seatX(row) - cx; disc(ctx, x, y - cy - 2, 4, '#f1c9a0'); R(ctx, x - 4, y - cy - 6, 8, 3, '#3a2a2a'); R(ctx, x - 5, y - cy + 1, 10, 4, pl.F === pl.F ? '#3f7ab0' : '#3f7ab0'); } continue; } if (hsh(row, s.charCodeAt(0)) < 0.18) continue; const x = seatX(row) - cx, yy = y - cy; if (x < -10 || x > W + 10) continue; const h = hsh(row * 3, s.charCodeAt(0)); disc(ctx, x, yy - 2, 3.6, COL[(h * 6) | 0]); R(ctx, x - 4, yy + 1, 8, 4, ['#e0563f', '#5aa8e0', '#f2c14e', '#5aa85a', '#f4f1e6', '#8a6aff'][(h * 37 | 0) % 6]); if (h > 0.85) R(ctx, x - 2, yy - 6, 4, 2, '#f4f1e6'); } } });
      npc('office', 200, 96, { tint: '#2f5ab0', dir: 'l', lines: ['WELCOME ABOARD, KHA. SEAT 27? FURTHER DOWN, ON THE LEFT AND RIGHT OF THE AISLE.'] }); npc('office', 600, 96, { tint: '#2f5ab0', dir: 'l', lines: ['PLEASE STOW YOUR BAG IN THE OVERHEAD LOCKER OR UNDER THE SEAT IN FRONT.'] });
      npc('salary', 300, 96, { dir: 'u', lines: ['ONE MOMENT... MY BAG DOES NOT FIT... IT FITS. IT FITS!'] });
      M.SPOTS.push({ x: seatX(27), y: 96, r: 13, label: 'SIT IN 27', fn: sitDown });
      M.st = [36, 96]; M.LIGHTS = [];
    } };
  function sitDown() { Snd.fx('ui'); BK.seated = 1; G.hidePl = 1; const w = BK.seat === 'A';
    dialog([w ? '27A: THE WINDOW SEAT. OUTSIDE, THE LIGHTS OF THE AIRPORT, AND A MAN WITH TWO ORANGE WANDS.' : '27C: THE AISLE. YOU CAN STRETCH ONE LEG OUT, AND NOBODY HAS TO CLIMB OVER YOU.', 'THE SEATBELT CLICKS. THE CREW WALK THE AISLE CLOSING LOCKERS. ONE OF THEM SHOWS YOU HOW TO WEAR A LIFE JACKET, VERY SERIOUSLY.'], () => { award('bkk_board'); BK.seated = 2; }); }
  // ---------- the flight: take-off over Bangkok, dinner, the night, Fuji, Haneda ----------
  const MEAL = [['CHICKEN', 'GREEN CURRY WITH CHICKEN AND JASMINE RICE. IT IS GENUINELY SPICY. THE MAN NEXT TO YOU ASKS FOR SECONDS.'], ['FISH', 'TERIYAKI SALMON WITH RICE AND A LITTLE PICKLE. A FIRST TASTE OF JAPAN, AT THIRTY-FIVE THOUSAND FEET.']];
  function takeoff() { G.hidePl = 0; G.state = 'ride'; Snd.play(null); pinpon();
    G.ride = { plane: 1, t: 0, dur: 18, label: 'TA 641 TO', name: 'TOKYO HANEDA', go: ['haneda', 580, 184, 'd'], sea: 1, fuji: false, meal: 0, pick: 0,
      upd(r, dt) { if (r.t > 5 && r.meal === 0) { r.meal = 1; Snd.fx('chime'); } if (r.meal === 1) { if (TAP) { r.pick = TAP.x > W / 2 ? 1 : 0; TAP = null; KP.a = 1; } if (KP.l) r.pick = 0; if (KP.r) r.pick = 1; if (KP.l || KP.r) Snd.fx('ui'); if (KP.a || r.t > 11) { r.meal = 2; r.mt = r.t; Snd.fx('munch'); } } },
      over(r) { const p = Math.min(1, r.t / r.dur), bw = Math.min(W - 20, 200), bx = (W - bw) / 2, by = 6; panel(bx, by, bw, 20); txt(ctx, 'BKK', bx + 6, by + 4, '#3a2e40'); txt(ctx, 'HND', bx + bw - 18, by + 4, '#3a2e40'); for (let x = bx + 22; x < bx + bw - 22; x += 3) p1(ctx, x, by + 14, '#8a7a6a');
        const px = bx + 22 + (bw - 44) * p; R(ctx, px - 3, by + 13, 7, 2, '#2f5ab0'); R(ctx, px - 1, by + 11, 2, 6, '#2f5ab0'); const left = Math.max(0, Math.round((1 - p) * 345)); txtC(ctx, Math.floor(left / 60) + 'H ' + String(left % 60).padStart(2, '0') + 'M TO TOKYO', W / 2, by + 4, '#8a7a6a');
        if (r.meal === 1) { const w = Math.min(W - 20, 220), x = (W - w) / 2, y = H * 0.62; panel(x, y, w, 34); txtC(ctx, '"CHICKEN OR FISH?"', W / 2, y + 5, '#3a2e40'); MEAL.forEach(([n], i) => { const bx2 = x + 10 + i * (w / 2 - 5); R(ctx, bx2, y + 16, w / 2 - 15, 12, r.pick === i ? '#c8382e' : '#5a5468'); txtC(ctx, n, bx2 + (w / 2 - 15) / 2, y + 19, '#fff8e8'); }); }
        else if (r.meal === 2 && r.t - r.mt < 3.5) { const w = Math.min(W - 16, 260), lines = wrap(MEAL[r.pick][1], w - 12), y = H * 0.62; panel((W - w) / 2, y, w, 8 + lines.length * 7); lines.forEach((l, i) => txtC(ctx, l, W / 2, y + 4 + i * 7, '#3a2e40')); } },
      then: () => { G.arrived = 1; save(); AIR.landed(1); G.banner = 4; if (BK.exp) { BK.exp = 0; AIR.skipArrival(); NET.say('WELCOME TO JAPAN! EXPRESS: STRAIGHT THROUGH, YOUR BAG IS BY THE EXIT.', 6); } else NET.say('WELCOME TO JAPAN! FOLLOW THE GREEN SIGNS TO ARRIVALS.', 6); award('bkk_meal'); } }; }

  // ---------- check-in: passport, suitcase on the scale, window or aisle, and your boarding pass ----------
  const CHECKIN = {
    init(m) { m.ph = 'pass'; m.lift = 0; m.kg = 0; m.seat = 0; m.pt = 0; m.done = 0; },
    update(m, dt) { m.pt += dt;
      if (m.ph === 'pass') { if (KP.a) { m.ph = 'type'; m.pt = 0; Snd.fx('page'); } }
      else if (m.ph === 'type') { if (Math.floor(m.pt * 12) !== Math.floor((m.pt - dt) * 12)) Snd.fx('talk'); if (m.pt > 1.2) { m.ph = 'bag'; m.pt = 0; } }
      else if (m.ph === 'bag') { if (K.a) m.lift = Math.min(1, m.lift + dt * 0.9); else m.lift = Math.max(0, m.lift - dt * 1.4); if (m.lift >= 1) { m.ph = 'scale'; m.pt = 0; Snd.fx('land'); } }
      else if (m.ph === 'scale') { m.kg = Math.min(18.6, m.kg + dt * 22); if (m.pt > 1.4) { m.ph = 'seat'; m.pt = 0; } }
      else if (m.ph === 'seat') { if (KP.l || KP.r) { m.seat ^= 1; Snd.fx('ui'); } if (KP.a && m.pt > 0.2) { BK.seat = m.seat ? 'C' : 'A'; m.ph = 'print'; m.pt = 0; Snd.fx('gacon'); } }
      else if (m.ph === 'print') { if (m.pt > 2) { BK.checked = 1; endMini(true, ['"HERE IS YOUR BOARDING PASS, KHA. GATE D3, BOARDING AT 23:25, GROUP 3. YOUR BAG GOES ALL THE WAY TO TOKYO."', 'SHE CIRCLES THE GATE AND THE TIME IN PEN, AND POINTS TOWARD PASSPORT CONTROL AT THE BACK OF THE HALL.']); } } },
    draw(m) { txtC(ctx, 'CHECK-IN: ROW M', 160, 26, '#2f5ab0', null, 2); R(ctx, 56, 38, 208, 80, '#e8e4ec'); R(ctx, 56, 96, 208, 22, '#c89a6a'); R(ctx, 56, 96, 208, 2, '#f0d0a0');
      if (m.ph === 'pass' || m.ph === 'type') { const x = m.ph === 'type' ? 170 : 120; R(ctx, x, 80, 20, 14, '#8a2a3a'); R(ctx, x, 80, 20, 2, '#b84a5a'); disc(ctx, x + 10, 87, 3, '#f2c14e'); R(ctx, 200, 50, 40, 28, '#2a2430'); R(ctx, 202, 52, 36, 22, m.ph === 'type' ? '#5a8ae0' : '#3a4a6a'); if (m.ph === 'type') for (let k = 0; k < 4; k++) R(ctx, 205, 55 + k * 4, 6 + ((m.pt * 30 + k * 5) % 24), 1, '#ffffff'); txtC(ctx, m.ph === 'pass' ? 'E: HAND OVER YOUR PASSPORT' : 'SHE TYPES VERY FAST...', 160, 130, '#3a2e40'); return; }
      R(ctx, 70, 92, 60, 6, '#8a8496'); R(ctx, 140, 90, 110, 8, '#5a5468'); for (let x = 140 + ((G.t * 20) % 8); x < 250; x += 8) R(ctx, x, 92, 3, 1, '#8a8496');
      if (m.ph === 'bag') { const y = 92 - m.lift * 14; R(ctx, 84, y - 26, 32, 26, '#2f5ab0'); R(ctx, 84, y - 26, 32, 2, '#5a8ae0'); R(ctx, 96, y - 30, 8, 4, '#2a2430'); R(ctx, 110, y - 22, 3, 8, '#e0452f'); R(ctx, 70, 104, 60, 4, '#d9cba8'); R(ctx, 70, 104, 60 * m.lift, 4, '#5ad88a'); txtC(ctx, 'HOLD E TO LIFT YOUR SUITCASE ONTO THE SCALE', 160, 130, '#3a2e40'); return; }
      if (m.ph === 'scale') { R(ctx, 84, 66, 32, 26, '#2f5ab0'); R(ctx, 96, 62, 8, 4, '#2a2430'); R(ctx, 76, 44, 48, 14, '#1d1626'); txtC(ctx, m.kg.toFixed(1) + ' KG', 100, 48, m.kg > 23 ? '#ff6a4a' : '#5ad88a'); txtC(ctx, 'LIMIT 23 KG. FINE!', 160, 130, '#3a2e40'); return; }
      if (m.ph === 'seat') { txtC(ctx, '"WINDOW OR AISLE?"', 160, 50, '#3a2e40'); [['WINDOW 27A', 0], ['AISLE 27C', 1]].forEach(([s, v], i) => { const x = 82 + i * 82; R(ctx, x, 64, 74, 18, m.seat === v ? '#c8382e' : '#5a5468'); txtC(ctx, s, x + 37, 70, '#fff8e8'); }); txtC(ctx, '< > CHOOSE, E TO CONFIRM', 160, 130, '#3a2e40'); return; }
      const q = Math.min(1, m.pt / 0.8); R(ctx, 80, 46, 160, 40 * q, '#f4ead4'); R(ctx, 80, 46, 160, 2, '#2f5ab0'); if (q >= 1) { txt(ctx, 'BOARDING PASS  TABI AIR', 84, 50, '#2f5ab0'); txt(ctx, 'TA 641  BKK > HND', 84, 58, '#3a2e40'); txt(ctx, 'SEAT 27' + (m.seat ? 'C' : 'A') + '  GROUP 3', 84, 66, '#3a2e40'); txt(ctx, 'GATE D3  BOARDING 23:25', 84, 74, '#c8382e'); for (let x = 200; x < 236; x += 2) R(ctx, x, 60, 1, 18, (x * 7) % 3 ? '#1d1626' : '#f4ead4'); }
      R(ctx, 150 + Math.min(80, m.pt * 60), 74, 20, 16, '#2f5ab0'); txtC(ctx, 'YOUR BOARDING PASS!', 160, 130, '#3a2e40'); }
  };
  // ---------- security: each thing in the right place: a tray, your bag, or the bin ----------
  const ITEMS = [['LAPTOP', 'l', '#3a3a4e'], ['A BIG BOTTLE OF WATER', 'd', '#5ab8e8'], ['YOUR JACKET', 'l', '#c8382e'], ['A PAPERBACK BOOK', 'r', '#f2c14e'], ['LITTLE BOTTLES IN A CLEAR BAG', 'l', '#bfe8ff'], ['PHONE, KEYS AND COINS', 'l', '#8a8496'], ['A BAG OF DRIED MANGO', 'r', '#f2a03a'], ['YOUR BELT', 'l', '#6a4a30']];
  const TRAY = {
    init(m) { m.i = 0; m.miss = 0; m.fly = null; m.msg = ''; m.mt = 0; m.done = 0; },
    update(m, dt) { if (m.mt > 0) m.mt -= dt; if (m.fly) { m.fly.t += dt * 3; if (m.fly.t >= 1) { m.fly = null; m.i++; if (m.i >= ITEMS.length) m.done = m.t; } return; }
      if (m.done) { if (m.t > m.done + 1.5) { BK.secured = 1; endMini(true, ['THE TRAYS ROLL INTO THE MACHINE. YOU WALK THROUGH THE ARCH. IT DOES NOT BEEP. YOU FEEL ODDLY PROUD.', 'ON THE OTHER SIDE: YOUR THINGS, STILL WARM FROM THE X-RAY, AND THE DOOR TO THE GATES.']); } return; }
      const k = KP.l ? 'l' : KP.r ? 'r' : KP.d ? 'd' : null; if (!k) return; const it = ITEMS[m.i];
      if (k === it[1]) { m.fly = { t: 0, to: k }; Snd.fx(k === 'd' ? 'land' : 'pick'); } else { m.miss++; m.msg = it[1] === 'l' ? 'THAT GOES IN A TRAY OF ITS OWN' : it[1] === 'r' ? 'THAT CAN STAY IN YOUR BAG' : 'TOO BIG: OVER 100ML. IN THE BIN!'; m.mt = 1.4; beep(); } },
    draw(m) { txtC(ctx, 'SECURITY', 160, 26, '#3a3a5a', null, 2); R(ctx, 56, 92, 208, 10, '#8a8496'); R(ctx, 56, 92, 208, 1, '#c8c0d4');
      R(ctx, 64, 74, 46, 18, '#c8c4cc'); R(ctx, 66, 76, 42, 14, '#9a96a2'); txtC(ctx, 'TRAY <', 87, 66, '#3a2e40'); R(ctx, 210, 70, 40, 22, '#2f5ab0'); R(ctx, 210, 70, 40, 3, '#5a8ae0'); txtC(ctx, '> BAG', 230, 62, '#3a2e40'); R(ctx, 146, 106, 28, 14, '#5a5468'); txtC(ctx, 'BIN', 160, 109, '#f4f1e6');
      if (m.i < ITEMS.length) { const it = ITEMS[m.fly ? Math.min(m.i, ITEMS.length - 1) : m.i]; let x = 160, y = 60; if (m.fly) { const q = m.fly.t, tx = m.fly.to === 'l' ? 87 : m.fly.to === 'r' ? 230 : 160, ty = m.fly.to === 'd' ? 110 : 80; x += (tx - 160) * q; y += (ty - 60) * q - Math.sin(q * Math.PI) * 14; }
        R(ctx, x - 10, y - 7, 20, 14, it[2]); R(ctx, x - 10, y - 7, 20, 2, lite(it[2], 0.4)); if (!m.fly) txtC(ctx, it[0], 160, 42, '#3a2e40'); }
      for (let i = 0; i < ITEMS.length; i++) disc(ctx, 126 + i * 10, 122, 2.5, i < m.i ? '#5ad88a' : '#d9cba8');
      txtC(ctx, m.mt > 0 ? m.msg : m.done ? 'ALL CLEAR!' : '< TRAY    > BAG    V BIN', 160, 132, m.mt > 0 ? '#c8382e' : '#3a2e40'); }
  };

  // the prologue starts here: a taxi pulls away, and the doors are in front of you
  function begin() { Object.assign(BK, { exp: 0, checked: 0, stamped: 0, secured: 0, seat: 'A', change: 0, bstart: 0, group: 0, seated: 0, airT: 0 }); G.arrived = 1; G.hidePl = 0; go('bkk_land', 200, 600, 'u'); save();
    M.ACT.push({ temp: 1, x: 230, y: 628, sayT: 0, always: 1, t: 0, upd(e, dt) { e.t += dt; if (e.t > 1) e.x += (e.t - 1) * 80 * dt; if (e.x > 900) e.dead = 1; }, draw(e, sx, sy) { ell(ctx, sx, sy, 14, 2.5, 'rgba(22,30,50,0.35)'); ctx.drawImage(SPR.taxi[0][0], snap(sx - 16), snap(sy - 16)); } });
    NET.say('SUVARNABHUMI AIRPORT, BANGKOK. YOUR FLIGHT TO TOKYO LEAVES AT 23:55. THE BOARD INSIDE SAYS WHERE TO CHECK IN.', 7); G.banner = 4; }

  city({
    id: 'bangkok', name: 'BANGKOK', tagline: 'WHERE THE TRIP BEGINS', start: 'bkk_land', hub: 'bkk_land', line: [], areas: [['bkk_land', 'DEPARTURES HALL'], ['bkk_air', 'CONCOURSE D'], ['bkk_plane', 'ON BOARD']], stamps: STAMPS, cats: 1, prologue: 1, minis: { checkin: CHECKIN, tray: TRAY },
    icons() { // the little pictures for the stamp book and the bag: painted at boot, since they show up everywhere
      icon('spirit', g => { R(g, 5, 7, 2, 5, '#c8c0b4'); R(g, 2, 3, 8, 5, '#c8382e'); R(g, 1, 1, 10, 2, '#2f6a4a'); R(g, 5, 0, 2, 1, '#f2c14e'); R(g, 4, 5, 4, 3, '#2a1a18'); });
      icon('bpass', g => { R(g, 0, 2, 12, 8, '#f4ead4'); R(g, 0, 2, 12, 1.5, '#2f5ab0'); R(g, 1, 5, 6, 1, '#3a2e40'); R(g, 1, 7, 4, 1, '#c8382e'); for (let x = 8; x < 11; x += 1) R(g, x, 4, U, 5, '#1d1626'); });
      icon('naga', g => { for (let x = 1; x < 11; x++) R(g, x, 7 + Math.sin(x) * 1, 1, 2, '#3f8a4a'); disc(g, 2, 4, 2, '#6ab86a'); R(g, 5, 1, 2, 6, '#8a8496'); disc(g, 6, 1, 1.4, '#3a5ac8'); });
      icon('mango', g => { ell(g, 7, 5, 4, 2.8, '#f2b030'); ell(g, 6, 4.5, 2.5, 1.5, '#f8d070'); ell(g, 4, 8.5, 3.5, 2, '#f4f1e6'); R(g, 1, 10, 10, 1, '#c8a070'); });
      icon('seat', g => { R(g, 3, 1, 6, 6, '#2f3a6a'); R(g, 3, 1, 6, 1.5, '#4a5a9a'); R(g, 2, 7, 8, 4, '#2f3a6a'); txt(g, '27', 3, 2, '#f2c14e'); });
      icon('tray', g => { R(g, 0, 3, 12, 8, '#c8c4cc'); R(g, 1, 4, 5, 4, '#f4f1e6'); disc(g, 3.5, 6, 1.5, '#5aa85a'); R(g, 7, 4, 4, 3, '#e8c060'); R(g, 7, 8, 4, 2, '#c8382e'); });
    },
    sprites() {
      ISL.forEach(([L, name, , , c]) => one('isl' + L, 112, 48, g => { R(g, 4, 0, 104, 14, dark(c, 0.2)); R(g, 4, 0, 104, 2, lite(c, 0.3)); R(g, 6, 4, 100, 6, '#8a8496'); for (let x = 8; x < 104; x += 6) R(g, x, 6, 3, 1, '#5a5468'); R(g, 0, 14, 112, 18, '#f4f1e6'); R(g, 0, 14, 112, 2, '#ffffff'); R(g, 0, 30, 112, 2, c);
        for (const x of [26, 56, 86]) { R(g, x - 7, 16, 14, 9, '#2a2430'); R(g, x - 6, 17, 12, 6, '#5a8ae0'); R(g, x - 14, 32, 10, 8, '#c8c0d4'); R(g, x - 14, 32, 10, 1, '#ffffff'); } R(g, 0, 32, 112, 16, '#e8e4ec'); R(g, 0, 46, 112, 2, '#8a8496'); }, 1));
      one('stan', 6, 10, g => { R(g, 2, 1, 2, 8, '#c8c4cc'); R(g, 2, 1, 1, 8, '#ffffff'); R(g, 1, 0, 4, 2, '#8a8496'); ell(g, 3, 9, 3, 1, '#6b6478'); }, 1);
      one('wrapper', 30, 34, g => { R(g, 2, 28, 26, 6, '#8a8496'); ell(g, 15, 28, 13, 3, '#c8c0d4'); R(g, 24, 4, 3, 26, '#6b6478'); R(g, 22, 4, 7, 4, '#3a3a4e'); R(g, 0, 0, 14, 7, '#3f9a5a'); txt(g, 'WRAP', 1, 0.5, '#ffffff'); }, 1);
      one('garland', 30, 28, g => { R(g, 2, 12, 26, 16, '#8a5a3a'); R(g, 2, 12, 26, 2, '#c89a6a'); for (let k = 0; k < 5; k++) { const x = 5 + k * 5; for (let y = 0; y < 12; y += 2) disc(g, x, y + 1, 1.3, y % 4 ? '#f4f1e6' : '#f2a03a'); R(g, x - 1, 11, 2, 2, '#c8382e'); } }, 1);
      one('charger', 18, 34, g => { R(g, 4, 0, 10, 32, '#3a3a4e'); R(g, 4, 0, 10, 2, '#6a6a7e'); for (let y = 6; y < 30; y += 6) { R(g, 2, y, 14, 2, '#5a5a6e'); R(g, 6, y + 2, 1, 3, '#f2c14e'); R(g, 11, y + 2, 1, 3, '#f2c14e'); } R(g, 5, 2, 8, 3, '#5ad8f0'); R(g, 2, 32, 14, 2, '#8a8496'); }, 1);
      one('trolley', 20, 16, g => { R(g, 2, 4, 14, 7, '#c8c4cc'); for (let x = 3; x < 16; x += 3) R(g, x, 4, U, 7, '#8a8496'); R(g, 15, 0, 2, 11, '#8a8496'); disc(g, 4, 13, 2, '#2a2430'); disc(g, 14, 13, 2, '#2a2430'); }, 1);
      one('gdesk', 30, 20, g => { R(g, 1, 6, 28, 12, '#e8e4ec'); R(g, 1, 6, 28, 1.5, '#ffffff'); R(g, 1, 10, 28, 2, '#2f5ab0'); R(g, 10, 0, 10, 7, '#2a2430'); R(g, 11, 1, 8, 4, '#5a8ae0'); R(g, 1, 18, 28, 2, '#8a8496'); }, 1);
      one('mchair', 18, 20, g => { R(g, 3, 0, 12, 12, '#3a3a4e'); R(g, 3, 0, 12, 2, '#6a6a7e'); R(g, 1, 8, 16, 8, '#2a2a3a'); R(g, 2, 16, 14, 4, '#1d1626'); R(g, 6, 3, 6, 4, '#c8382e'); }, 1);
      one('orchids', 26, 24, g => { R(g, 6, 16, 14, 8, '#8a5a3a'); R(g, 6, 16, 14, 1.5, '#c89a6a'); for (let k = 0; k < 12; k++) { const x = 3 + (k * 7 % 20), y = 2 + (k * 5 % 12); disc(g, x, y, 2, k % 3 ? '#c870d8' : '#f4f1e6'); p1(g, x, y, '#f2c14e'); } }, 1);
      one('spirith', 26, 44, g => { R(g, 11, 22, 4, 22, '#c8c0b4'); R(g, 4, 20, 18, 4, '#f2c14e'); R(g, 6, 10, 14, 11, '#c8382e'); R(g, 6, 10, 14, 1, '#f06a5a'); R(g, 10, 13, 6, 8, '#2a1a18'); R(g, 11, 15, 4, 4, '#f2c14e'); roof(g, 13, 2, 3, 11, 9, '#2f6a4a'); R(g, 12, 0, 2, 3, '#f2c14e'); R(g, 2, 9, 3, 2, '#f2c14e'); R(g, 21, 9, 3, 2, '#f2c14e'); for (let k = 0; k < 4; k++) disc(g, 6 + k * 4.5, 20, 1.2, k % 2 ? '#f2a03a' : '#f4f1e6'); R(g, 18, 17, 2, 4, '#e0452f'); R(g, 18.5, 14, 1, 3, '#f4f1e6'); }, 1);
      SPR.taxi = ['#f06aa8', '#5ac85a'].map((c, i) => { const k = mk(32, 16), g = k.g; R(g, 1, 7, 30, 6, c); R(g, 1, 7, 30, 1, lite(c, 0.4)); R(g, 1, 12, 30, 1, dark(c, 0.35)); R(g, 7, 2, 17, 6, c); R(g, 9, 3.5, 6, 3.5, '#bfe8ff'); R(g, 16, 3.5, 6, 3.5, '#bfe8ff'); if (i) R(g, 1, 9, 30, 2, '#f2d040'); R(g, 12, 0.5, 7, 2, '#f4f1e6'); disc(g, 7, 13, 2.5, '#1d1626'); disc(g, 24, 13, 2.5, '#1d1626'); disc(g, 7, 13, 1, '#9a94a8'); disc(g, 24, 13, 1, '#9a94a8'); R(g, 29.5, 8.5, 1.5, 2, '#fff0b0'); const o = outline(k), fo = flip(o); for (const q of [o, fo]) txt(q.g, 'TAXI', 12.5, 0, '#1d1626'); return [o, fo]; });
      // the yaksha: giant temple guardians in armour, with tall tapering crowns, fangs and great clubs
      [['#3f9a5a', '#2a6a3a'], ['#c8382e', '#8a2a24']].forEach(([c, d], i) => one('yaksha' + i, 44, 98, g => { R(g, 6, 92, 32, 6, '#8c8498'); R(g, 6, 92, 32, 1.5, '#c8c0d4');
        R(g, 14, 70, 7, 22, d); R(g, 23, 70, 7, 22, d); R(g, 12, 88, 10, 4, '#f2c14e'); R(g, 22, 88, 10, 4, '#f2c14e'); R(g, 11, 44, 22, 28, '#f2c14e'); for (let y = 46; y < 70; y += 4) R(g, 12, y, 20, 1, '#c8a020'); R(g, 11, 60, 22, 4, '#c8382e');
        R(g, 6, 44, 6, 22, c); R(g, 32, 44, 6, 22, c); R(g, 33, 26, 4, 64, '#8a6a3a'); disc(g, 35, 26, 4, '#f2c14e'); R(g, 32, 62, 6, 4, c);
        disc(g, 22, 34, 9, c); disc(g, 22, 36, 7, lite(c, 0.15)); disc(g, 18, 32, 2.5, '#f4f1e6'); disc(g, 26, 32, 2.5, '#f4f1e6'); disc(g, 18, 32, 1.2, '#1d1626'); disc(g, 26, 32, 1.2, '#1d1626'); R(g, 17, 39, 10, 2, '#1d1626'); R(g, 17, 40, 2, 3, '#f4f1e6'); R(g, 25, 40, 2, 3, '#f4f1e6');
        for (let k = 0; k < 18; k++) { const w = 10 - k * 0.5; R(g, 22 - w, 24 - k, w * 2, 1, k % 3 === 0 ? '#c8a020' : '#f2c14e'); } R(g, 21, 4, 2, 4, '#f2c14e'); for (let k = 0; k < 5; k++) p1(g, 16 + k * 3, 22, '#e0452f'); }, 1));
      // the Churning of the Milk Ocean: the serpent stretched between two teams, the mountain in the middle on a turtle, Vishnu on top
      one('churn', 320, 126, g => { R(g, 6, 112, 308, 14, '#8c8498'); R(g, 6, 112, 308, 2, '#c8c0d4'); for (let x = 10; x < 312; x += 16) R(g, x, 114, U, 12, '#6b6478');
        dgrad(g, 10, 98, 300, 14, ['#c8e8f8', '#f4fbff']); for (let x = 14; x < 306; x += 7) R(g, x, 101 + (x % 5), 4, U, '#ffffff'); for (let x = 18; x < 300; x += 23) ell(g, x, 106, 5, 1.2, '#a8d0e8');
        // the mountain, the turtle under it and Vishnu on top
        ell(g, 160, 104, 26, 8, '#5a7a4a'); ell(g, 160, 102, 22, 6, '#7a9a5a'); for (let k = 0; k < 6; k++) disc(g, 146 + k * 6, 101, 1.5, '#5a7a4a'); disc(g, 184, 101, 4, '#7a9a5a'); P(g, 186, 100, '#1d1626');
        for (let y = 26; y < 100; y++) { const w = 8 + (y - 26) * 0.06; R(g, 160 - w, y, w * 2, 1, y % 6 < 3 ? '#9a94a6' : '#8a8496'); R(g, 160 - w, y, 2, 1, '#b8b2c4'); }
        R(g, 154, 10, 12, 16, '#3a5ac8'); R(g, 152, 16, 16, 3, '#f2c14e'); disc(g, 160, 8, 4.5, '#3a5ac8'); for (let k = 0; k < 9; k++) { const w = 4 - k * 0.42; R(g, 160 - w, 3 - k, w * 2, 1, '#f2c14e'); } for (const s of [-1, 1]) { line1(g, 160 + s * 5, 14, 160 + s * 12, 6, '#3a5ac8'); line1(g, 160 + s * 5, 17, 160 + s * 13, 20, '#3a5ac8'); disc(g, 160 + s * 12, 5, 1.6, s < 0 ? '#f2c14e' : '#f4f1e6'); }
        // the people pulling: demons on the left lean left, gods on the right lean right, all hauling on the serpent
        const fig = (x, dir, skin, body) => { const hx = x - dir * 7, hy = 62; for (let k = 0; k < 4; k++) { R(g, x - 1 + (k - 1.5) * 0.5, 90 + k * 3.4, 3, 3.4, body); } line1(g, x, 92, x + dir * 6, 104, dark(body, 0.3)); line1(g, x + 0.5, 92, x + dir * 6 + 0.5, 104, dark(body, 0.3)); line1(g, x, 92, x - dir * 3, 104, dark(body, 0.3)); line1(g, x + 0.5, 92, x - dir * 3 + 0.5, 104, dark(body, 0.3));
          for (let k = 0; k <= 10; k++) { const q = k / 10; R(g, x + (hx - x) * q - 2, 90 + (hy + 6 - 90) * q - 1, 4.5, 3, body); } R(g, x - 2.5 + (hx - x) * 0.4, 82, 5, 1.5, '#f2c14e'); disc(g, hx, hy, 3.6, skin); disc(g, hx - dir, hy + 1, 2.5, lite(skin, 0.15)); P(g, hx + dir * 1.5, hy - 0.5, '#1d1626'); if (dir < 0) { P(g, hx + 1, hy + 2.5, '#ffffff'); }
          for (let k = 0; k < 9; k++) { const w = 3 - k * 0.32; R(g, hx - w, hy - 4 - k, w * 2, 1, k % 3 ? '#f2c14e' : '#c8a020'); } line1(g, hx + dir * 0.5, hy + 8, x + dir * 6, 77, skin); line1(g, hx + dir * 0.5, hy + 9, x + dir * 7, 79, skin); };
        for (let k = 0; k < 7; k++) fig(36 + k * 15, -1, ['#3f9a5a', '#c8382e', '#3a5ac8', '#8a6aff', '#3f9a5a', '#c8382e', '#3a5ac8'][k], ['#2a4a6a', '#6a2a2a', '#3a3a5a', '#4a2a5a', '#6a2a2a', '#2a4a6a', '#4a2a5a'][k]);
        for (let k = 0; k < 7; k++) fig(196 + k * 15, 1, ['#f6cfa6', '#f2c14e', '#f8e0b8', '#f6cfa6', '#f2c14e', '#f8e0b8', '#f6cfa6'][k], ['#f2c14e', '#f4f1e6', '#e8c070', '#f4f1e6', '#f2c14e', '#e8c070', '#f4f1e6'][k]);
        // the serpent Vasuki through every pair of hands and round the mountain, its heads raised at the demons' end
        for (let x = 22; x < 304; x++) { const y = 76 + Math.sin(x / 15) * 1.5; R(g, x, y, 1, 6, '#3f8a4a'); R(g, x, y, 1, 1.5, '#7ac87a'); R(g, x, y + 5, 1, 1, '#2a5a32'); if (x % 4 === 0) R(g, x, y + 2, 1.5, 1.5, '#2f6a3a'); if (x % 4 === 2) p1(g, x, y + 3.5, '#c8d860'); }
        for (let k = 0; k < 7; k++) { const a = -2.3 + k * 0.42, hx = 18 + Math.cos(a) * 11, hy = 66 + Math.sin(a) * 13; line1(g, 22, 78, hx, hy, '#3f8a4a'); disc(g, hx, hy, 3.4, '#3f8a4a'); disc(g, hx - 0.5, hy - 0.8, 2.2, '#6ab86a'); p1(g, hx - 1, hy - 0.5, '#f2c14e'); } ell(g, 20, 72, 8, 9, '#3f8a4a'); ell(g, 20, 72, 5, 6, '#c8d860');
        for (let k = 0; k < 10; k++) R(g, 304 + Math.cos(k * 0.7) * 6, 72 - k * 1.5, 2, 2, '#3f8a4a'); }, 1);
    }
  });
  // a flight back to Bangkok from any Japanese gate lands you at the kerb, ready to check in again
  AIR.PORTS.bkk = { name: 'SUVARNABHUMI AIRPORT', short: 'BANGKOK', code: 'BKK', go: ['bkk_land', 200, 600, 'u'], msg: 'SAWASDEE KHA! WELCOME BACK TO BANGKOK.', intl: 1, then: () => Object.assign(BK, { checked: 0, stamped: 0, secured: 0, change: 0, bstart: 0, group: 0, seated: 0, airT: 0 }) };
  // the express lane: all of it done for you, and straight into seat 27A
  function express() { Object.assign(BK, { checked: 1, stamped: 1, secured: 1, seat: 'A', change: 1, bstart: 0, group: 3, seated: 3, exp: 1 }); G.back = null; beep(); setTimeout(beep, 120);
    dialog(['"EXPRESS, KHA? THIS WAY." YOUR BAG IS TAGGED FOR TOKYO, YOUR PASSPORT STAMPED AT A LITTLE DESK OF ITS OWN, AND SOMEONE WALKS YOU PAST SECURITY AND EVERY QUEUE.', 'DOWN THE JET BRIDGE TO SEAT 27A. A SMALL WAI FROM THE CREW, SEATBELT ON, AND THE DOORS CLOSE.'], takeoff); }
  window.BKK = { begin, express, BK };
})();
