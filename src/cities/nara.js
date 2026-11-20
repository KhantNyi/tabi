'use strict';
// ---------- Nara: one big walk with no trains. A town, a pond below a ledge, a deer park, a walled temple, two hillsides and a forest shrine ----------
// The map is carved out of forest rather than drawn as a box: lay() cuts the walkable shape, wild() grows the woods around it,
// and ledges, steps, bridges and walls give it levels and loops.
(function () {
  const STAMPS = {
    n_pagoda: ['KOFUKU-JI PAGODA', 'pagoda', 'na_town'], n_mochi: ['FRESH MOCHI', 'mochi', 'na_town'],
    n_deer: ['DEER FRIEND', 'deer', 'na_park'], n_uki: ['FLOATING PAVILION', 'fan', 'na_park'],
    n_gate: ['GREAT SOUTH GATE', 'torii', 'na_todai'], n_buddha: ['GREAT BUDDHA', 'buddha', 'na_todai'], n_pillar: ['BUDDHA\'S NOSTRIL', 'gold', 'na_todai'],
    n_view: ['NIGATSU-DO VIEW', 'sun', 'na_hill'], n_matcha: ['HILLSIDE MATCHA', 'dango', 'na_hill'], n_waka: ['MOUNT WAKAKUSA', 'camera', 'na_hill'], n_kasuga: ['KASUGA LANTERNS', 'lantern', 'na_hill']
  };
  const AREAS = [['na_town', 'TOWN AND POND'], ['na_todai', 'TODAI-JI'], ['na_park', 'DEER PARK'], ['na_hill', 'HILLS AND SHRINES']];
  const V = { senbei: 0, fed: 0 }; // what you are carrying; not saved

  // ---------- deer: they wander, bow when petted, and follow anyone holding crackers ----------
  function deerUpd(d, dt) {
    d.t -= dt; const dx = pl.x - d.x, dy = pl.y - d.y, far = Math.hypot(dx, dy);
    if (d.st === 'bow' || d.st === 'eat') { d.mv = false; if (d.t <= 0) { d.st = 'idle'; d.t = 0.6 + d.rnd() * 2; } return; }
    if (V.senbei > 0 && far < 84) { d.fl = dx < 0 ? 1 : 0; d.graze = 0; if (far > 19 && step(d, dx / far * 36 * dt, dy / far * 36 * dt)) { d.mv = true; d.wt += dt; } else d.mv = false; d.st = 'idle'; d.t = 0.5; return; }
    if (d.st === 'idle') { d.mv = false; if (d.t <= 0) { const a = d.rnd() * 6.283, r = 10 + d.rnd() * 38; d.tx = d.hx + Math.cos(a) * r; d.ty = d.hy + Math.sin(a) * r * 0.6; d.st = 'walk'; d.t = 4; } return; }
    const tx = d.tx - d.x, ty = d.ty - d.y, n = Math.hypot(tx, ty);
    if (n < 2 || d.t <= 0 || !step(d, tx / n * 15 * dt, ty / n * 15 * dt)) { d.st = 'idle'; d.mv = false; d.t = 1.5 + d.rnd() * 5; d.graze = d.rnd() < 0.45; return; }
    d.mv = true; d.wt += dt; if (Math.abs(tx) > 1) d.fl = tx < 0 ? 1 : 0;
  }
  function deerDraw(d, x, y) {
    const pose = d.st === 'bow' ? 'bow' : d.st === 'eat' || (d.graze && !d.mv) ? 'eat' : d.mv ? 'walk' + Math.floor(d.wt * 7) % 4 : 'idle';
    ell(ctx, x, y, 8, 2, 'rgba(22,30,50,0.3)'); ctx.drawImage(SPR.deer[d.male][pose][d.fl], snap(x - 14), snap(y - 20));
  }
  const SHY = ['(BOWS POLITELY)', '(SNIFFS YOUR POCKETS)', '(STARES AT YOUR MAP. HUNGRILY.)', '(BOWS. THEN BOWS AGAIN, IN CASE.)', '(NIBBLES YOUR SLEEVE)'];
  function deerUse(d) {
    d.fl = pl.x < d.x ? 1 : 0;
    if (V.senbei > 0) {
      V.senbei--; V.fed++; d.st = 'eat'; d.t = 1.5; d.graze = 0; G.fx.push({ x: d.x, y: d.y - 14, t: 0, icon: 'heart' }); Snd.fx('munch');
      if (V.fed >= 3 && !G.stamps.n_deer) dialog(['THREE DEER FED, AND EVERY ONE OF THEM BOWED FIRST.', 'THEY HAVE BEEN CALLED MESSENGERS OF THE GODS FOR THIRTEEN HUNDRED YEARS.'], () => award('n_deer'));
      else if (!V.senbei) say(d, 'ALL GONE.');
    } else { d.st = 'bow'; d.t = 1.3; Snd.fx('ui'); say(d, SHY[Math.floor(d.rnd() * SHY.length)]); }
  }
  function deer(x, y, male) { const rnd = RNG(x * 7 + y * 3); M.ACT.push({ deer: 1, x, y, hx: x, hy: y, male: male ? 1 : 0, fl: rnd() < 0.5 ? 1 : 0, st: 'idle', t: rnd() * 4, graze: rnd() < 0.5, mv: false, wt: rnd() * 3, rnd, sayT: 0, upd: deerUpd, draw: deerDraw, use: deerUse, label: () => V.senbei > 0 ? 'FEED' : 'PET' }); }

  // ---------- the map ----------
  MAPS.nara = { name: 'NARA', sub: 'A THOUSAND DEER AND ONE GREAT BUDDHA', tw: 64, th: 56, music: 'nara', tint: '#fff0dc',
    zones: [[0, 540, 340, 596, 'SANJO STREET', 'THE ROAD FROM THE STATION'], [84, 596, 284, 792, 'NARAMACHI', 'OLD MERCHANT LANES'], [272, 420, 524, 544, 'KOFUKU-JI', 'THE FIVE-STOREY PAGODA'], [284, 622, 530, 820, 'SARUSAWA POND', 'FIFTY-TWO STEPS BELOW THE TEMPLE'],
      [484, 40, 752, 424, 'TODAI-JI', 'HOME OF THE GREAT BUDDHA'], [752, 40, 1024, 288, 'NIGATSU-DO', 'THE HALL ON THE HILLSIDE'], [800, 290, 1024, 566, 'MOUNT WAKAKUSA', 'A GRASS HILL ABOVE THE CITY'],
      [770, 668, 1024, 896, 'KASUGA TAISHA', 'SHRINE OF THREE THOUSAND LANTERNS'], [484, 744, 744, 896, 'UKIMIDO', 'THE FLOATING PAVILION'], [490, 426, 800, 744, 'DEER PARK', 'THEY BOW IF YOU BOW FIRST']],
    lay() {
      tRect(FR, 0, 0, 64, 56);
      // Sarusawa pond lies in a hollow below the street
      tOval(GR, 24, 44, 8.5, 6.5); tRect(GR, 17.5, 37, 34.5, 39); tOval(WA, 24, 44.6, 5, 3);
      tRoad(DT, [[17.6, 44.6], [19, 41], [24, 39.6], [29, 41], [30.6, 44.6], [29, 48.4], [24, 49.6], [19, 48.4], [17.6, 44.6]], 0.55, GR);
      // town: one street from the station, and a loop of lanes around a block with a walled garden inside it
      tRect(PV, 1.5, 34, 21, 37); tRect(PV, 1.5, 37, 8, 48.5); tRect(PV, 15, 37, 17.5, 48.5); tRect(PV, 5.5, 46, 18, 48.5); tRect(PV, 8, 43.5, 15, 46);
      tRect(GR, 8, 37.5, 15, 43.5); tOval(WA, 11.6, 40.2, 1.5, 0.8); tRoad(DT, [[8.2, 40.6], [9.6, 40.9], [10.4, 42.4], [13.6, 42.6]], 0.45, GR);
      // Kofuku-ji court, and the way down to the pond
      tRect(VL, 17, 27, 32.5, 34); tRect(PL, 23.5, 36.5, 25.5, 38.6);
      // the deer park, carved out of the forest
      tRoad(GR, [[20, 35.5], [26, 35.2], [31, 34.6]], 1.7); tOval(GR, 40, 37, 9.5, 9); tOval(GR, 38.5, 30, 6, 3.2); tOval(GR, 46, 41, 5, 4); tRoad(GR, [[31, 45.5], [36, 44.5]], 1.5); tOval(GR, 50, 32.5, 3.4, 2.7);
      tRoad(WA, [[33.6, 30.6], [37, 30], [41, 31.2], [46, 30.3]], 0.45);
      // Todai-ji: a gated approach and a walled court
      tRect(VL, 36.5, 17.5, 40.5, 29); tRect(VL, 30.5, 5.5, 46.5, 17.5); tOval(WA, 33.7, 15, 2, 1.1);
      // Nigatsu-do: three terraces up the hillside
      tRect(GR, 46.5, 14, 63, 17.5); tRect(VL, 48.5, 8.75, 63, 14); tRect(VL, 50, 3.5, 63, 8.75);
      // Mount Wakakusa
      tOval(GR, 58, 26.5, 8, 8.5); tRoad(GR, [[58, 17], [58.6, 19.6]], 1.3);
      // Kasuga Taisha in the woods, the floating pavilion, and the path that joins them
      tRoad(GR, [[46, 41.5], [49.5, 44], [52, 49], [56, 51.8], [58.5, 51.5]], 1.4); tOval(VL, 58.5, 48, 4.3, 4.2);
      tOval(GR, 38, 50, 8, 4.2); tOval(WA, 38, 50.8, 5.5, 2.4); tRoad(GR, [[52, 49.3], [47.5, 50.2], [45, 50.5]], 1.2);
      // footpaths
      const P = (pts, w) => tRoad(DT, pts, w || 0.7, GR);
      P([[21, 35.5], [26, 35.2], [31, 34.6], [35, 34]], 0.9); P([[35, 34], [38.5, 32.5], [38.5, 28.6]], 0.9); P([[35, 34], [38, 38], [39, 43], [38, 46.6]]); P([[38, 38], [43, 38.5], [46, 41.5], [49.5, 44], [52, 49], [56, 51.8], [58.5, 51.5]]);
      P([[43, 38.5], [46, 35], [49.5, 33], [52, 31.5], [57, 30], [60.5, 28.6]]); P([[60.5, 26.4], [57, 25], [53.75, 23.6]]); P([[53.75, 21.2], [57, 20.4], [61, 20.6]]); P([[58.6, 19.6], [58, 17], [57, 16.2]]);
      P([[46.5, 15.8], [52, 16], [57, 16.2]]); P([[30.6, 45.4], [33, 45], [36, 44.5], [38.6, 43.2]]); P([[52, 49.3], [47.5, 50.2], [45, 50.5]]); P([[38, 46.6], [33.5, 48.4], [32, 50.6]], 0.6);
    },
    deco() {
      const g = M.ground.g;
      // ---- levels: ledges and the stairs through them
      ledge([[280, 612], [340, 609], [392, 608], [470, 611], [552, 607]], 13, 'stone'); steps(392, 608, 24, 18);
      ledge([[764, 226], [840, 224], [930, 226], [1024, 224]], 12, 'stone'); steps(832, 224, 24, 16);
      ledge([[788, 142], [860, 140], [950, 142], [1024, 140]], 12, 'stone'); steps(944, 141, 24, 16);
      ledge([[790, 438], [880, 434], [960, 438], [1024, 435]], 11, 'earth'); steps(968, 437, 24, 15, '#b89868');
      ledge([[806, 358], [870, 354], [940, 358], [1024, 355]], 11, 'earth'); steps(856, 355, 24, 15, '#b89868');
      // ---- bridges: the stone one on the temple approach, and the red one out to the pavilion
      bridge(604, 472, 628, 502, '#8c8498', '#c8c0b4'); bridge(508, 804, 584, 820);
      R(g, 584, 798, 56, 28, '#b8905a'); for (let x = 584; x < 640; x += 4) R(g, x, 798, U, 28, '#8a6a48'); R(g, 584, 826, 56, 3, 'rgba(20,30,60,0.3)'); block(584, 800, 640, 826, 0);
      put(SPR.ukimido, 612, 806, 30, 55); block(596, 796, 628, 806); { const c = mk(56, 9), q = c.g; R(q, 0, 2, 56, 1.5, '#c0442f'); R(q, 0, 2, 56, U, '#e88a6a'); R(q, 0, 5, 56, 1, '#7a2a20'); for (let x = 0; x <= 54; x += 9) { R(q, x, 0, 2, 9, '#c0442f'); R(q, x, 0, U, 9, '#e88a6a'); } put(c, 612, 829, 28, 8); }
      // ---- town
      tower(72, 544, 92, 44, { c: '#e8e0d0', sign: 'NARA STATION', sc: '#3f7ab0', wc: '#bfe8ff', gx: 7, ww: 4 }); shinkansen(72, 544); M.st = [72, 562];
      DAY.konbini(170, 544, 'nara'); house(236, 544, 56, 28, { sign: 'MOCHI', noren: '#5aa85a', rh: 14, lantern: '#f2c14e', to: 'n_mochi' });
      DAY.hotel(54, 646, 'nara', 50); house(54, 722, 50, 26, { noren: '#8a2a24', rh: 14, lantern: true }); block(24, 600, 84, 646); block(24, 676, 84, 722);
      house(156, 736, 46, 26, { sign: 'INK', noren: '#3a3a4e', rh: 14 }); house(212, 736, 46, 26, { sign: 'PICKLES', noren: '#c8a04a', rh: 14, lantern: true }); block(128, 698, 240, 736);
      wallH(128, 240, 603); wallV(132, 603, 634); wallV(132, 664, 698); wallV(236, 603, 698);
      plant('maple', 214, 636, 1); plant('bush', 150, 618, 1); plant('bush', 222, 686, 1); prop('lantern', 154, 684, 4); prop('bench', 196, 690, 9); M.LIGHTS.push([154, 668, 18, '#ffd98a']);
      M.ACT.push({ cat: true, id: 'garden', x: 176, y: 668, k: 0 }); npc('granny', 206, 664, { lines: ['YOU FOUND MY GARDEN. MOST PEOPLE WALK STRAIGHT PAST THE GAP IN THE WALL.', 'THE MAPLE WAS PLANTED BY MY GRANDFATHER.'] });
      prop('vend', 126, 542, 6); prop('bench', 300, 596, 9); for (const x of [150, 250]) { prop('lamp', x, 594, 2); M.LIGHTS.push([x - 4, 566, 20, '#ffe8a8']); }
      signpost(318, 548, ['EAST: THE DEER PARK AND TODAI-JI.', 'DOWN THE STONE STEPS: SARUSAWA POND.']);
      // ---- Kofuku-ji
      put(SPR.hallG, 352, 500, 88, 90); block(292, 478, 412, 500); put(SPR.pagoda, 466, 514, 52, 130); block(438, 496, 494, 514); for (const x of [322, 382]) prop('lantern', x, 520, 4);
      stampSpot('n_pagoda', 466, 530, 'TAKE A PHOTO', 'snap', ['FIVE STOREYS OF DARK WOOD, FIFTY METRES TALL.', 'IT HAS BURNED DOWN FIVE TIMES. THEY KEEP BUILDING IT AGAIN.']);
      // ---- the pond in the hollow
      for (const [x, y] of [[300, 664], [330, 760], [420, 800], [470, 660], [490, 740]]) plant('green2', x, y, 1); prop('bench', 352, 646, 9); prop('bench', 438, 646, 9); for (const [x, y] of [[340, 716], [404, 742]]) { plant('rock', x, y, 1); }
      M.SPOTS.push({ x: 384, y: 660, r: 14, label: 'LOOK', lines: ['THE PAGODA STANDS UPSIDE DOWN IN THE WATER.', 'TURTLES SUN THEMSELVES ON THE ROCKS, PILED THREE DEEP.'] });
      npc('granny', 440, 664, { rad: 18, lines: ['FIFTY-TWO STEPS UP TO THE TEMPLE. I COUNT THEM EVERY MORNING.', 'THE WILLOWS ARE PRETTIEST JUST BEFORE DARK.'] });
      // ---- deer park
      prop('stall', 664, 560, 13); const v = npc('granny', 664, 574, { lines: ['DEER CRACKERS!'] }); v.spot = { label: 'BUY DEER CRACKERS', fn() { if (V.senbei > 0) { dialog(['YOU STILL HAVE ' + V.senbei + '. FEED THOSE FIRST, DEAR.']); return; } V.senbei = 5; Snd.fx('coin'); dialog(['A STACK OF FIVE DEER CRACKERS, TIED WITH A PAPER BAND.', 'EVERY DEER IN THE PARK HAS JUST LOOKED UP AT ONCE.']); } };
      signpost(566, 536, ['NORTH: THE GREAT SOUTH GATE AND THE GREAT BUDDHA.', 'EAST: MOUNT WAKAKUSA AND KASUGA SHRINE.', 'SOUTH: THE FLOATING PAVILION.']);
      for (const [k, x, y] of [['sakura', 540, 620], ['maple', 700, 640], ['pine', 610, 690], ['green2', 720, 540], ['maple', 560, 700], ['ginkgo', 680, 720], ['sakura', 760, 610], ['pine', 520, 560], ['ginkgo', 588, 446], ['maple', 652, 448]]) plant(k, x, y, 1);
      prop('bench', 620, 610, 9); prop('bench', 716, 690, 9); prop('lantern', 590, 512, 4); prop('lantern', 642, 512, 4);
      const dr = RNG(77); for (let i = 0, n = 0; i < 80 && n < 15; i++) { const a = dr() * 6.283, r = Math.sqrt(dr()), x = Math.round(640 + Math.cos(a) * r * 136), y = Math.round(604 + Math.sin(a) * r * 124); if (!hit(x, y) && !hit(x + 8, y) && !hit(x - 8, y) && terr(x, y) === GR) { deer(x, y, n % 4 === 0); n++; } }
      for (const [x, y, m] of [[616, 446, 1], [596, 400, 0], [400, 532, 0], [330, 690, 1], [470, 770, 0], [880, 500, 0], [930, 520, 1], [900, 400, 0], [820, 700, 0], [560, 780, 0], [700, 250, 0], [800, 260, 1]]) deer(x, y, m);
      npc('tourist', 600, 584, { rad: 22, lines: ['ONE OF THEM ATE MY MAP.', 'I DID NOT EVEN HAVE A CRACKER. JUST THE MAP.'] }); npc('kid', 700, 604, { rad: 26, lines: ['IF YOU BOW, THEY BOW BACK! WATCH!', 'I NAMED THAT ONE BISCUIT.'] }); npc('office', 560, 660, { rad: 20, lines: ['THEY KNOW EXACTLY WHO IS HOLDING CRACKERS.', 'HIDE THEM BEHIND YOUR BACK AND THEY STILL KNOW.'] });
      // ---- Todai-ji: the gate, the walls, the hall
      put(SPR.nandai, 616, 420, 62, 99); block(560, 412, 604, 420); block(628, 412, 672, 420);
      stampSpot('n_gate', 616, 444, 'TAKE A PHOTO', 'snap', ['THE GREAT SOUTH GATE, HELD UP BY EIGHTEEN PILLARS EACH CUT FROM ONE TREE.', 'TWO WOODEN GUARDIANS EIGHT METRES TALL GLARE DOWN FROM INSIDE IT.'], 13);
      wallH(488, 588, 296); wallH(644, 744, 296); wallV(490, 96, 296); wallV(742, 96, 234); wallV(742, 266, 296);
      put(SPR.daibutsu, 616, 180, 130, 149); block(524, 152, 708, 180); door(616, 180, 'n_daibutsu');
      for (const x of [588, 644]) for (const y of [216, 256]) prop('lantern', x, y, 4); fur('burner', 616, 240);
      M.SPOTS.push({ x: 616, y: 250, r: 13, label: 'WAFT THE SMOKE', fx: 'wind', lines: ['YOU FAN THE INCENSE SMOKE TOWARD YOUR FACE.', 'THE HALL IN FRONT OF YOU IS THE BIGGEST WOODEN BUILDING YOU HAVE EVER SEEN.'] });
      for (const [x, y] of [[520, 200], [712, 190], [700, 272], [560, 276]]) plant(hsh(x, y) < 0.5 ? 'pine' : 'sakura', x, y, 1);
      npc('monk', 660, 200, { lines: ['THE HALL WAS A THIRD BIGGER BEFORE THE FIRE. THIS IS THE SMALL ONE.', 'THE WAY TO NIGATSU-DO IS THROUGH THE GAP IN THE EAST WALL.'] }); npc('tourist', 566, 232, { dir: 'u', lines: ['I CANNOT FIT IT ALL IN ONE PHOTO.'] });
      crowd(4, 608, 300, 608, 462, 8); crowd(3, 626, 462, 626, 300, 6);
      // ---- Nigatsu-do
      for (let x = 788; x < 1010; x += 30) { if (Math.abs(x - 832) > 18) prop('lanternM', x, 220, 4); if (x > 800 && Math.abs(x - 944) > 18) prop('lanternM', x + 10, 136, 4); }
      house(900, 198, 56, 26, { sign: 'TEA HOUSE', noren: '#5a8a5a', rh: 14, lantern: true, to: 'n_tea' }); prop('bench', 984, 200, 9); plant('maple', 800, 186, 1);
      put(SPR.nigatsu, 880, 112, 75, 85); block(828, 92, 932, 112); prop('box', 880, 120, 7);
      stampSpot('n_view', 992, 128, 'LOOK OUT', 'snap', ['FROM THE BALCONY THE WHOLE OF NARA LIES BELOW, WITH THE GREAT HALL\'S ROOF ABOVE THE TREES.', 'EVERY MARCH, MONKS RUN ALONG THIS RAIL WITH BURNING TORCHES.'], 16);
      M.ACT.push({ cat: true, id: 'hill', x: 838, y: 128, k: 2 }); npc('monk', 920, 126, { lines: ['THE WATER CEREMONY HAS BEEN HELD HERE EVERY YEAR SINCE 752. WITHOUT MISSING ONE.'] }); npc('kimono', 960, 190, { rad: 16, lines: ['THE TEA HOUSE HAS THE BEST VIEW OF ANY TEA HOUSE I KNOW.'] });
      signpost(776, 262, ['UP THE STEPS: NIGATSU-DO.', 'SOUTH-EAST ALONG THE RIDGE: MOUNT WAKAKUSA.']);
      // ---- Mount Wakakusa
      plant('pine', 936, 318, 1); prop('bench', 962, 334, 9); for (const [x, y] of [[850, 480], [990, 500], [900, 540], [840, 400], [1000, 410]]) plant(hsh(x, y) < 0.5 ? 'sakura' : 'green2', x, y, 1);
      stampSpot('n_waka', 992, 336, 'TAKE A PHOTO', 'snap', ['NOTHING BUT GRASS AND SKY, AND THE CITY SPREAD OUT LIKE A MAP.', 'ONCE A YEAR THEY SET THE WHOLE HILL ON FIRE. ON PURPOSE.'], 15);
      npc('kid', 900, 470, { rad: 30, lines: ['WE ROLLED ALL THE WAY DOWN!', 'MUM SAYS THE GRASS STAINS ARE NEVER COMING OUT.'] }); signpost(826, 512, ['MOUNT WAKAKUSA. TWO FLIGHTS OF LOG STEPS TO THE TOP.']);
      // ---- Kasuga Taisha
      put(SPR.kasuga, 936, 744, 70, 83); block(890, 722, 982, 744); prop('box', 936, 752, 7); put(SPR.torii, 936, 816, 30, 49); block(914, 812, 922, 816); block(950, 812, 958, 816);
      for (const y of [772, 794]) for (const x of [906, 966]) { prop('lanternM', x, y, 4); M.LIGHTS.push([x, y - 14, 16, '#ffd98a']); }
      const lp = [[46.4, 41.5], [49.5, 44], [52, 49], [56, 51.8], [58.3, 51.6]]; for (let k = 1; k < lp.length; k++) { const [ax, ay] = lp[k - 1], [bx, by] = lp[k], n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) * 16 / 28)), ux = (by - ay), uy = -(bx - ax), ul = Math.hypot(ux, uy); for (let i = 0; i < n; i++) for (const sd of [-1, 1]) { const x = Math.round((ax + (bx - ax) * i / n) * 16 + ux / ul * 15 * sd), y = Math.round((ay + (by - ay) * i / n) * 16 + uy / ul * 15 * sd); if (!hit(x, y) && terr(x, y) !== DT) { prop('lanternM', x, y, 3); if ((i + k) % 2) M.LIGHTS.push([x, y - 14, 14, '#ffd98a']); } } }
      stampSpot('n_kasuga', 936, 762, 'PRAY', 'bow', ['THREE THOUSAND LANTERNS, STONE ALONG THE PATH AND BRONZE UNDER THE EAVES.', 'TWICE A YEAR EVERY ONE OF THEM IS LIT AT ONCE.']);
      npc('maiko', 972, 770, { tint: '#f4f1e6', lines: ['EACH LANTERN WAS GIVEN BY SOMEONE WITH A WISH.', 'SOME OF THE WISHES ARE FOUR HUNDRED YEARS OLD.'] });
      // ---- the floating pavilion
      stampSpot('n_uki', 612, 818, 'REST A WHILE', 'snap', ['A SIX-SIDED PAVILION STANDING IN THE WATER, WITH ITS OWN REFLECTION FOR COMPANY.', 'A HERON LANDS ON THE RAIL AND PRETENDS YOU ARE NOT THERE.'], 14);
      for (const [x, y] of [[500, 760], [716, 770], [690, 860], [520, 868]]) plant(hsh(x, y) < 0.5 ? 'green2' : 'sakura', x, y, 1); prop('bench', 560, 770, 9); M.ACT.push({ cat: true, id: 'pond', x: 668, y: 768, k: 1 });
      npc('yukata', 640, 772, { lines: ['YOU CAN HIRE A ROWING BOAT IN SUMMER.', 'IN AUTUMN YOU JUST SIT. THAT IS BETTER.'] });
      // ---- the forest closes round everything else
      wild(['green', 'pine', 'green', 'green2', 'green', 'pine', 'green2', 'maple']);
      crowd(4, 130, 572, 330, 572, 8); crowd(3, 340, 566, 530, 552, 6);
      M.LIGHTS = []; // daytime: no lamp glows
    } };

  // ---------- rooms ----------
  MAPS.n_daibutsu = { indoor: 1, name: 'THE GREAT BUDDHA HALL', music: 'kyoto', deco() {
    room({ wall: '#5a3a30', floor: 'tile', t1: '#a8a2ae', t2: '#98929e', mat: '#7a3a2a', art: g => {
      for (let x = 14; x < 310; x += 42) { R(g, x, 4, 6, 44, '#7a4a34'); R(g, x, 4, 1.5, 44, '#a8744a'); }
      const B = '#5a7068', BL = '#7c9688', BD = '#3a4a48';
      disc(g, 160, 54, 47, '#8a6a2a'); disc(g, 160, 54, 45, '#d9b04a'); disc(g, 160, 54, 34, '#c09a3a'); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; disc(g, 160 + Math.cos(a) * 39.5, 54 + Math.sin(a) * 39.5, 3.2, '#f2c14e'); disc(g, 160 + Math.cos(a) * 39.5, 54 + Math.sin(a) * 39.5 - 1, 1.4, '#fff0b0'); }
      ell(g, 160, 120, 66, 11, '#4a3a28'); ell(g, 160, 117, 64, 10, '#8a7a4a'); for (let k = 0; k < 9; k++) { ell(g, 104 + k * 14, 116, 8, 6, '#a89a5a'); ell(g, 104 + k * 14, 114.5, 6, 4, '#c4b672'); } R(g, 100, 108, 120, 3, '#c4b672');
      ell(g, 160, 104, 54, 13, B); ell(g, 160, 82, 40, 27, B); ell(g, 150, 76, 22, 15, BL); ell(g, 160, 107, 46, 7, BL);
      for (let k = 0; k < 6; k++) { R(g, 132 + k * 9, 84 + Math.abs(k - 2.5) * 2, 1, 16 - Math.abs(k - 2.5) * 2, BD); } R(g, 124, 100, 72, 1, BD); R(g, 140, 68, 40, 1.5, BD); R(g, 150, 71, 24, 1, BD);
      R(g, 118, 70, 13, 17, B); R(g, 118, 70, 13, 1.5, BL); for (let k = 1; k < 4; k++) R(g, 118 + k * 3.2, 71, U, 8, BD); R(g, 122, 86, 12, 12, B); ell(g, 196, 101, 11, 4, BL); R(g, 188, 100, 16, 1, BD);
      ell(g, 160, 50, 15, 17, B); ell(g, 156, 48, 9, 12, BL); R(g, 144, 46, 2.5, 13, B); R(g, 173.5, 46, 2.5, 13, B); ell(g, 160, 40, 15.5, 9, '#2c3c46'); disc(g, 160, 31, 6, '#2c3c46'); for (let k = 0; k < 16; k++) p1(g, 148 + (k * 7 % 25), 34 + (k * 5 % 9), '#4a5c68');
      R(g, 151, 50, 7, 1, BD); R(g, 162, 50, 7, 1, BD); disc(g, 160, 45.5, 1.2, '#f2c14e'); R(g, 159.5, 50, 1, 6, BD); R(g, 158, 56, 4, U, BD); R(g, 156, 59, 8, 1, BD);
      R(g, 132, 128, 56, 9, '#7a3a2a'); R(g, 132, 128, 56, 1.5, '#f2c14e'); R(g, 132, 136, 56, 1, '#4a2a20'); for (const x of [138, 180]) { R(g, x, 121, 2, 7, '#f4f1e6'); R(g, x + 0.5, 118, 1, 3, '#ffb84a'); } ell(g, 160, 127, 8, 2.5, '#d9b04a'); R(g, 159.5, 119, 1, 7, '#8a8496');
    } });
    block(94, 50, 226, 138); for (const x of [56, 264]) prop('npillar', x, 132, 8); prop('nhole', 264, 132, 0);
    M.SPOTS.push({ x: 160, y: 150, r: 14, label: 'PRAY', stamp: 'n_buddha', act: 'bow', lines: ['FIFTEEN METRES OF BRONZE, SEATED, ONE HAND RAISED.', 'EACH FINGER IS AS TALL AS YOU ARE.'] });
    M.SPOTS.push({ x: 264, y: 140, r: 13, label: 'CRAWL THROUGH', stamp: 'n_pillar', act: 'hold', fx: 'jump', lines: ['THE HOLE IN THE PILLAR IS THE SIZE OF THE BUDDHA\'S NOSTRIL. YOU BREATHE IN AND WRIGGLE.', 'YOU POP OUT THE OTHER SIDE. THAT IS GOOD LUCK FOR A YEAR.'] });
    npc('kid', 238, 148, { dir: 'r', lines: ['MY TURN NEXT! I AM SMALL, I WILL FIT EASY.'] }); npc('salary', 222, 164, { dir: 'r', lines: ['I GOT STUCK LAST YEAR. I AM JUST WATCHING THIS TIME.'] });
    npc('monk', 84, 150, { lines: ['IT TOOK HALF THE BRONZE IN JAPAN TO CAST HIM.', 'HIS HEAD HAS FALLEN OFF TWICE IN EARTHQUAKES. HE DOES NOT SEEM TO MIND.'] }); npc('tourist', 190, 156, { dir: 'u', lines: ['...', 'SORRY. I FORGOT WHAT I WAS GOING TO SAY. LOOK AT HIM.'] }); npc('granny', 120, 168, { dir: 'u', lines: ['I CAME HERE ON A SCHOOL TRIP SIXTY YEARS AGO. HE HAS NOT AGED A DAY.'] });
    fur('plant', 20, 176); fur('plant', 300, 176);
  } };
  MAPS.n_mochi = { indoor: 1, name: 'MOCHI SHOP', music: 'nara', deco() {
    room({ wall: '#e8dcc0', mat: '#5aa85a', art: (g, r) => { wallShelf(g, 196, 100, ['#a8d08a', '#f4f1e6', '#f9a8c8', '#c8a04a'], r); poster(g, 24, 10, 60, 16, '#5aa85a', 'YOMOGI MOCHI'); poster(g, 92, 10, 60, 16, '#c8382e', 'POUNDED FAST'); for (const x of [40, 150]) chochin(g, x, 30, '#f2c14e'); } });
    fur('counter', 246, 92, 100, '#c8d8a0'); fur('till', 280, 86); npc('office', 240, 72, { tint: '#5aa85a', lines: ['STILL WARM! FILLED WITH SWEET RED BEAN, DUSTED WITH ROASTED SOY FLOUR.', 'EAT IT WITHIN THE HOUR. AFTER THAT IT IS JUST A RICE CAKE.'] });
    prop('usu', 104, 128, 11); npc('chef', 76, 126, { dir: 'r', tint: '#f4f1e6', lines: ['HAI!'] }); npc('chef', 132, 126, { dir: 'l', tint: '#5aa85a', lines: ['YOISHO!', 'WE HIT IT THREE TIMES A SECOND. NOBODY HAS LOST A FINGER. YET.'] });
    M.SPOTS.push({ x: 104, y: 138, r: 14, label: 'POUND MOCHI', mini: 'mochi', stamp: 'n_mochi' });
    fur('booth', 60, 176, '#5aa85a'); fur('booth', 260, 150, '#5aa85a'); fur('plant', 20, 70); fur('plant', 300, 176); eaters([190, 220], 110, ['IT STRETCHES LIKE CHEESE!', 'I BOUGHT SIX. THEY ARE ALL FOR ME.']); npc('kid', 160, 150, { rad: 22, lines: ['THEY GO SO FAST YOU CANNOT SEE THE HAMMER!'] });
  } };
  MAPS.n_tea = { indoor: 1, name: 'HILLSIDE TEA HOUSE', music: 'kyoto', deco() {
    room({ wall: '#d8c8a0', floor: 'tatami', mat: '#5a8a5a', art: (g, r) => { R(g, 60, 8, 200, 34, '#5a3a28'); dgrad(g, 62, 10, 196, 30, ['#ffd8a0', '#ffe8c8', '#f8f0e0']); for (let x = 62; x < 258; x += 30) ell(g, x + r() * 20, 40, 24, 8 + r() * 5, '#6a9a78'); ell(g, 160, 40, 40, 5, '#4a7a5a'); roof(g, 150, 30, 6, 16, 5, '#4a4660'); R(g, 62, 36, 196, 4, '#3a6a4a'); for (const x of [111, 160, 209]) R(g, x, 10, 1.5, 30, '#5a3a28'); R(g, 62, 24, 196, 1, '#5a3a28'); poster(g, 20, 12, 28, 26, '#f4eedc', ''); R(g, 32, 16, 3, 18, '#3a2e40'); R(g, 28, 20, 11, 2, '#3a2e40'); poster(g, 272, 12, 28, 26, '#f4eedc', ''); disc(g, 286, 25, 7, '#c8382e'); } });
    for (const [x, y, k] of [[70, 110, 0], [250, 110, 2], [70, 160, 4], [250, 160, 1]]) fur('table', x, y, k); fur('counter', 160, 84, 70, '#c89a6a'); fur('plant', 20, 70); fur('plant', 300, 70);
    const k = npc('kimono', 160, 66, { tint: '#5a8a5a', lines: ['WELCOME.'] }); k.spot = { label: 'ORDER MATCHA', stamp: 'n_matcha', act: 'hold', fx: 'slurp', lines: ['A BOWL OF THICK GREEN TEA, WHISKED TO A FOAM, AND THREE DUMPLINGS ON A STICK.', 'IT IS BITTER, THEN SWEET. THE HILL IS VERY QUIET.'] };
    npc('granny', 92, 112, { dir: 'l', lines: ['TURN THE BOWL TWICE BEFORE YOU DRINK. NOBODY KNOWS WHY ANY MORE.'] }); npc('tourist', 228, 162, { dir: 'r', lines: ['MY LEGS HAVE GONE TO SLEEP. HOW DOES ANYONE KNEEL THIS LONG?'] }); npc('monk', 272, 112, { dir: 'l', lines: ['I COME DOWN FROM THE HALL FOR ONE BOWL A DAY. SOMETIMES TWO.'] });
  } };

  // ---------- mochi pounding: hit E while the turner's hand is out of the bowl ----------
  const MOCHI = {
    init(m) { m.hits = 0; m.ph = 0; m.sw = 0; m.msg = ''; m.mt = 0; m.sp = 0.9; m.done = 0; },
    update(m, dt) {
      m.ph = (m.ph + dt * m.sp) % 1; if (m.sw > 0) m.sw -= dt * 3.5; if (m.mt > 0) m.mt -= dt;
      if (m.done) { if (m.t > m.done + 1.1) endMini(true, ['EIGHT CLEAN HITS. THE MOCHI IS SMOOTH, GREEN AND STILL STEAMING.', 'THEY HAND YOU ONE. IT IS THE SOFTEST THING YOU HAVE EVER EATEN.']); return; }
      if (KP.a && m.sw <= 0.25) { m.sw = 1; if (m.ph > 0.5 && m.ph < 0.96) { m.hits++; m.sp = 0.9 + m.hits * 0.1; Snd.fx('land'); m.msg = ['PETTAN!', 'YOISHO!', 'HAI!'][m.hits % 3]; if (m.hits >= 8) { m.done = m.t; Snd.fx('yay'); } } else { Snd.fx('talk'); m.msg = 'CAREFUL! HIS HAND IS IN THERE!'; } m.mt = 0.7; }
    },
    draw(m) {
      txtC(ctx, 'MOCHI POUNDING', 160, 30, '#c8382e', null, 2); for (let i = 0; i < 8; i++) disc(ctx, 118 + i * 12, 48, 4, i < m.hits ? '#5aa85a' : '#d9cba8');
      const hit_ = m.sw > 0.6, hand = m.ph < 0.45 && !m.done;
      R(ctx, 136, 88, 48, 26, '#8a5a3a'); R(ctx, 136, 88, 3, 26, '#a8744a'); R(ctx, 180, 88, 4, 26, '#6a4028'); R(ctx, 134, 112, 52, 3, '#5a3a28'); ell(ctx, 160, 88, 24, 7, '#a8744a'); ell(ctx, 160, 88, 19, 5, '#3a2630'); ell(ctx, 160, 88 + (hit_ ? 1 : 0), hit_ ? 17 : 14, hit_ ? 3.5 : 5, '#a8d08a'); ell(ctx, 156, 87, 7, 2, '#c8e8a8');
      const hx = hand ? 148 + Math.sin(m.ph / 0.45 * 3.1416) * 8 : 112; R(ctx, 76, 80, hx - 76, 8, '#f4f1e6'); R(ctx, 76, 80, hx - 76, 1, '#ffffff'); R(ctx, hx - 2, 80, 9, 8, '#f1c9a0'); R(ctx, hx + 5, 82, 3, 5, '#f1c9a0'); disc(ctx, 70, 70, 9, '#f1c9a0'); R(ctx, 61, 60, 18, 6, '#f4f1e6'); R(ctx, 62, 79, 16, 24, '#f4f1e6');
      const k = Math.max(0, m.sw), my = hit_ ? 76 : 76 - (1 - Math.max(0, (k - 0.0) / 0.6)) * 26, mx = hit_ ? 162 : 162 + (1 - k / 0.6) * 22; line(ctx, mx + 6, my, 236, my + 18 + (hit_ ? 6 : 0), '#c89a6a'); R(ctx, mx - 9, my - 7, 18, 13, '#b8845a'); R(ctx, mx - 9, my - 7, 18, 2, '#dcb080'); R(ctx, mx - 9, my + 4, 18, 2, '#8a5a3a'); disc(ctx, 246, 68, 9, '#f1c9a0'); R(ctx, 237, 58, 18, 6, '#5aa85a'); R(ctx, 238, 77, 16, 26, '#5aa85a');
      R(ctx, 70, 120, 180, 5, '#d9cba8'); R(ctx, 160, 120, 83, 5, '#8fd070'); R(ctx, 69 + 180 * m.ph, 118, 3, 9, '#c8382e');
      txtC(ctx, m.done ? 'DONE!' : m.mt > 0 ? m.msg : 'PRESS E WHILE THE HAND IS OUT OF THE BOWL', 160, 132, '#3a2e40');
    }
  };

  city({
    id: 'nara', name: 'NARA', tagline: 'A THOUSAND DEER AND ONE GREAT BUDDHA',
    start: 'nara', hub: 'nara', line: [], areas: AREAS, stamps: STAMPS, cats: 3,
    minis: { mochi: MOCHI },
    hud: () => V.senbei > 0 ? ['senbei', 'X' + V.senbei] : null,
    sprites() {
      const deerFrame = (pose, male) => {
        const c = mk(26, 20), g = c.g, b = '#c48a54', bd = '#96623c', bl = '#dca872', w = '#f8ecd6', k = '#3a2a2e';
        const wk = /walk(\d)/.exec(pose), o_ = wk ? [0, 1, 0, -1][+wk[1]] : 0, o2_ = wk ? [1, 0, -1, 0][+wk[1]] : 0;
        [5 + o_, 9 - o2_ * 0.5, 13 - o_, 17 + o2_ * 0.5].forEach((x, i) => { const col = i % 2 ? b : bd; R(g, x, 11.5, 1.5, 6, col); R(g, x, 11.5, 0.5, 6, dark(col, 0.18)); R(g, x, 17.5, 1.5, 1.5, k); });
        ell(g, 11, 10, 7, 3.2, b); ell(g, 10.5, 9, 6, 1.8, bl); ell(g, 11, 12.4, 5.5, 0.8, w); ell(g, 12, 11.2, 5, 1, bd); ell(g, 11.5, 10.6, 5.5, 1.2, b);
        for (const [x, y] of [[7, 8.5], [8.5, 9.5], [10, 8], [11.5, 9.5], [13, 8.5], [14.5, 9.5], [9, 10.5], [12.5, 10.5], [15, 8], [6, 10]]) p1(g, x, y, w);
        R(g, 3, 7.5, 1.5, 3, w); R(g, 3.5, 7.5, 1, 1, b);
        let hx, hy;
        if (pose === 'bow') { R(g, 16, 8, 3, 3, b); R(g, 18, 10, 2, 3, b); R(g, 18, 10, 0.5, 3, bd); hx = 18; hy = 12; }
        else if (pose === 'eat') { R(g, 16, 9, 3, 3, b); R(g, 18, 11, 2, 4, b); R(g, 18, 11, 0.5, 4, bd); hx = 18; hy = 14; }
        else { R(g, 16, 6, 3, 4, b); R(g, 17, 3, 2, 4, b); R(g, 17, 3, 0.5, 5, bd); R(g, 18.5, 4, 0.5, 4, w); hx = 17; hy = 1; }
        R(g, hx, hy, 5, 3, b); R(g, hx + 0.5, hy - 0.5, 3.5, 0.5, b); R(g, hx, hy, 4, 0.5, bl); R(g, hx + 3.5, hy + 1, 2.5, 2, bl); R(g, hx + 3.5, hy + 2.5, 2.5, 0.5, w);
        R(g, hx + 5.5, hy + 1, 0.5, 1, k); R(g, hx + 2, hy + 0.5, 1, 1, k); p1(g, hx + 2, hy + 0.5, '#ffffff'); R(g, hx - 1, hy - 1.5, 1.5, 2, bd); p1(g, hx - 0.5, hy - 1, '#f0b8a0');
        if (male) { line1(g, hx + 1, hy - 0.5, hx + 1.5, hy - 3.5, w); line1(g, hx + 1.5, hy - 2, hx + 3, hy - 3, w); line1(g, hx + 1.5, hy - 2.5, hx, hy - 3.5, w); }
        return outline(c);
      };
      SPR.deer = [0, 1].map(male => { const f = {}; for (const p of ['idle', 'walk0', 'walk1', 'walk2', 'walk3', 'bow', 'eat']) { const r = deerFrame(p === 'idle' ? 'walk0' : p, male); f[p] = [r, flip(r)]; } return f; });
      const W_ = '#7a4a34', WD = '#5a3828', RF = '#4a4660';
      // the Great Buddha Hall: two roofs, the upper one drawn first
      one('daibutsu', 260, 150, g => { templeHall(g, 130, 94, 118, 20, { bays: 5, rh: 30, wall: W_, roof: RF, door: WD, gold: 1 }); templeHall(g, 130, 149, 176, 34, { bays: 7, rh: 27, wall: W_, roof: RF, door: WD }); R(g, 108, 84, 44, 5, '#3a3650'); roof(g, 130, 74, 6, 24, 11, '#5a5674'); });
      // the Great South Gate: six pillars, the middle bay open
      one('nandai', 124, 100, g => {
        roof(g, 62, 2, 30, 60, 20, RF); R(g, 16, 22, 92, 10, W_); R(g, 16, 22, 92, 1.5, lite(W_, 0.3)); for (let x = 20; x < 104; x += 8) R(g, x, 25, 5, 5, '#efe3c8'); roof(g, 62, 30, 46, 62, 16, RF);
        R(g, 8, 46, 108, 5, W_); R(g, 8, 46, 108, 1, lite(W_, 0.3)); R(g, 8, 50, 108, 1, dark(W_, 0.4)); for (let x = 9; x < 116; x += 2) R(g, x, 47.5, 1, 1.5, '#f2c14e');
        for (const [x0, c] of [[14, '#b85a4a'], [78, '#5a8a6a']]) { R(g, x0, 51, 32, 46, '#2a1a22'); R(g, x0 + 10, 64, 12, 30, c); disc(g, x0 + 16, 61, 5, lite(c, 0.25)); R(g, x0 + 5, 68, 6, 4, c); R(g, x0 + 21, 72, 6, 4, c); for (let x = x0 + 2; x < x0 + 32; x += 4) R(g, x, 51, U, 46, W_); R(g, x0, 76, 32, 1, W_); }
        for (const x of [10, 28, 46, 74, 92, 110]) { R(g, x, 51, 4, 47, W_); R(g, x, 51, 1, 47, lite(W_, 0.3)); R(g, x + 3, 51, 1, 47, dark(W_, 0.4)); R(g, x - 1, 96, 6, 3, '#8c8498'); R(g, x - 1, 96, 6, U, '#c8c0d4'); }
      });
      one('nigatsu', 150, 86, g => { for (let x = 30; x <= 120; x += 15) { R(g, x, 66, 2.5, 20, WD); R(g, x, 66, U, 20, lite(WD, 0.3)); } R(g, 24, 72, 102, 1.5, WD); templeHall(g, 75, 70, 98, 24, { bays: 5, wall: W_, roof: '#5a4a48', door: WD, rh: 22 }); R(g, 20, 60, 110, 2, lite(W_, 0.2)); R(g, 20, 54, 110, 1, W_); for (let x = 20; x <= 130; x += 6) R(g, x, 54, 1, 7, W_); for (const x of [40, 110]) chochin(g, x, 40, '#f4eedc'); });
      one('kasuga', 140, 84, g => { templeHall(g, 70, 83, 84, 24, { bays: 5, wall: '#e0452f', roof: '#7a5a44', plaster: '#f8f4ea', door: '#c0442f', rh: 20 }); for (let x = 30; x <= 110; x += 8) { R(g, x - U, 55, U, 3, '#8a6a2a'); R(g, x - 1.5, 58, 3, 4, '#d9b04a'); R(g, x - 1.5, 58, 3, U, '#fff0b0'); R(g, x - 1, 59.5, 2, 1.5, '#ffe8a0'); } });
      one('ukimido', 60, 56, g => { R(g, 4, 50, 52, 5, '#8a6a48'); R(g, 4, 50, 52, 1, '#c4a070'); for (const x of [8, 20, 37, 49]) { R(g, x, 22, 3, 28, W_); R(g, x, 22, 1, 28, lite(W_, 0.3)); } R(g, 8, 40, 44, 1.5, W_); for (let x = 9; x < 52; x += 4) R(g, x, 41, U, 9, W_); R(g, 6, 20, 48, 3, W_); roof(g, 30, 4, 3, 31, 17, '#5a4a48'); R(g, 29.5, 0, 1.5, 5, '#d9b04a'); disc(g, 30.2, 0.5, 1.3, '#f2c14e'); });
      one('npillar', 22, 96, g => { R(g, 3, 0, 16, 92, '#8a4a34'); R(g, 3, 0, 3, 92, '#b06a4a'); R(g, 15, 0, 4, 92, '#5a2e22'); for (let y = 6; y < 90; y += 13) R(g, 3, y, 16, U, '#5a2e22'); R(g, 1, 90, 20, 6, '#8c8498'); R(g, 1, 90, 20, 1, '#c8c0d4'); });
      one('nhole', 22, 96, g => { R(g, 6, 80, 10, 9, '#1d1018'); R(g, 6, 80, 10, 1, '#3a2018'); R(g, 5, 79, 12, 1, '#b06a4a'); });
      one('usu', 30, 26, g => { R(g, 3, 6, 24, 18, '#8a5a3a'); R(g, 3, 6, 3, 18, '#a8744a'); R(g, 23, 6, 4, 18, '#6a4028'); R(g, 2, 23, 26, 3, '#5a3a28'); ell(g, 15, 6, 12, 4, '#a8744a'); ell(g, 15, 6, 9, 2.6, '#3a2630'); ell(g, 15, 6, 7, 2, '#a8d08a'); R(g, 3, 13, 24, 1, '#5a3a28'); }, 1);
    }
  });
})();
