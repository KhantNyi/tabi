'use strict';
// ---------- Kyoto: five districts on one bus line ----------
// The station is a grid, as stations are. Everywhere else climbs: a torii tunnel up Inari mountain, a stone lane up to
// Kiyomizu's stage on stilts, a bamboo grove that winds into a temple's side gate, and a loop path round a golden pavilion.
(function () {
  const LINE = [['kyo_station', 'KYOTO STATION'], ['kyo_inari', 'FUSHIMI INARI'], ['kyo_gion', 'GION'], ['kyo_arashi', 'ARASHIYAMA'], ['kyo_kinkaku', 'KINKAKU-JI']];
  const STAMPS = {
    ky_tower: ['KYOTO TOWER', 'ktower', 'kyo_station'],
    ky_fox: ['INARI FOXES', 'fox', 'kyo_inari'], ky_senbon: ['A THOUSAND GATES', 'torii', 'kyo_inari'], ky_udon: ['KITSUNE UDON', 'udon', 'kyo_inari'], ky_yotsu: ['MOUNTAIN LOOKOUT', 'sun', 'kyo_inari'],
    ky_hanami: ['HANAMIKOJI AT DUSK', 'lantern', 'kyo_gion'], ky_pagoda: ['YASAKA PAGODA', 'pagoda', 'kyo_gion'], ky_kiyomizu: ['KIYOMIZU STAGE', 'camera', 'kyo_gion'], ky_otowa: ['OTOWA WATERFALL', 'water', 'kyo_gion'], ky_tea: ['TEA CEREMONY', 'tea', 'kyo_gion'], ky_kimono: ['KIMONO STROLL', 'kimono', 'kyo_gion'],
    ky_bamboo: ['BAMBOO GROVE', 'bamboo', 'kyo_arashi'], ky_bridge: ['MOON CROSSING BRIDGE', 'fan', 'kyo_arashi'], ky_tenryu: ['TENRYU-JI GARDEN', 'buddha', 'kyo_arashi'], ky_monkey: ['MONKEY MOUNTAIN', 'monkey', 'kyo_arashi'], ky_rick: ['BAMBOO RICKSHAW', 'rickshaw', 'kyo_arashi'], ky_row: ['ROWING ON THE RIVER', 'oar', 'kyo_arashi'],
    ky_gold: ['GOLDEN PAVILION', 'gold', 'kyo_kinkaku'], ky_rock: ['ROCK GARDEN', 'rock', 'kyo_kinkaku'], ky_wish: ['LUCKY COIN', 'coin', 'kyo_kinkaku']
  };
  const path = (pts, w, t) => tRoad(t == null ? DT : t, pts, w || 0.7); // paths cut through whatever is there, forest included

  // ---------- Kyoto Station ----------
  MAPS.kyo_station = { name: 'KYOTO STATION', sub: 'GLASS, STEEL AND A WHITE TOWER', tw: 40, th: 26, music: 'tokyo',
    lay() { tRect(PV, 0, 0, 40, 26); tRect(PL, 2, 9, 38, 15); roads([[15, 3]], [[30, 3]]); },
    deco() {
      tower(250, 144, 260, 74, { c: '#a8b4c4', sign: 'KYOTO STATION', sc: '#3f7ab0', wc: '#bfe8ff', gx: 6, ww: 4, gy: 7, top: false }); M.SPOTS.push({ x: 200, y: 151, r: 14, label: 'BUSES', train: 1 }); M.st = [200, 160]; shinkansen(350, 144);
      tower(440, 144, 60, 60, { c: '#c8b8a0', sign: 'PORTA', sc: '#c8382e' }); DAY.hotel(600, 144, 'kyoto', 70);
      put(SPR.kytower, 400, 352, 26, 190); block(376, 338, 424, 352); stampSpot('ky_tower', 456, 362, 'TAKE A PHOTO', 'snap', ['A WHITE TOWER LIKE A CANDLE, LIT TO WATCH OVER A CITY OF TEMPLES.', 'IT WAS BUILT IN 1964. NOT EVERYONE WAS PLEASED. NOW EVERYONE IS.']);
      for (const [x, c, s] of [[110, '#e8d8c0', 'BENTO'], [560, '#c8b8a0', 'SWEETS']]) tower(x, 352, 56, 40, { c, sign: s, sc: '#8a5a3a' }); DAY.konbini(184, 352, 'kyoto');
      cityEdge(1, 110); for (const x of [60, 150, 590]) plant('ginkgo', x, 220, 1); for (const x of [100, 400]) prop('bench', x, 232, 9); prop('vend', 460, 230, 6); prop('busstop', 240, 230, 2); prop('busstop', 290, 230, 2);
      cars(260, -1, 3); cars(276, 1, 3); crowd(6, 40, 200, 600, 200, 10); crowd(5, 600, 226, 40, 226, 6); crowd(3, 480, 300, 480, 380, 6);
      npc('office', 140, 196, { tint: '#3f7ab0', lines: ['WELCOME TO KYOTO! THE CITY BUS GOES EVERYWHERE. ONE DAY PASS, ALL THE TEMPLES YOU CAN STAND.', 'FUSHIMI INARI IS FIRST ON THE LINE. GO EARLY, BEFORE THE CROWDS.'] });
      npc('tourist', 520, 204, { lines: ['THERE ARE SIXTEEN HUNDRED TEMPLES IN THIS CITY.', 'I HAVE SEEN FOUR. I NEED A LONGER HOLIDAY.'] }); M.ACT.push({ cat: true, x: 600, y: 230, k: 2 });
    } };

  // ---------- Fushimi Inari ----------
  function tunnel(x, y0, y1, skip) { const s = SPR.torS; block(x - 19, y1 - 2, x - 10, y0); block(x + 10, y1 - 2, x + 19, y0); for (let y = y0; y > y1; y -= 12) { if (skip && skip.some(k => Math.abs(y - k) < 12)) continue; put(s, x, y, s.lw / 2, s.lh - 1); block(x - 13, y - 3, x - 9, y); block(x + 9, y - 3, x + 13, y); } }
  MAPS.kyo_inari = { name: 'FUSHIMI INARI', sub: 'TEN THOUSAND ORANGE GATES', tw: 40, th: 44, music: 'kyoto',
    zones: [[300, 120, 520, 512, 'SENBON TORII', 'A TUNNEL OF GATES UP THE MOUNTAIN'], [360, 40, 560, 170, 'THE TEA STOP', 'HALFWAY UP, A BOWL OF UDON'], [0, 0, 220, 130, 'YOTSUTSUJI', 'THE CROSSROADS LOOKOUT'], [0, 130, 220, 520, 'THE OLD TRAIL', 'THE QUIET WAY DOWN'], [220, 380, 420, 600, 'INARI SHRINE', 'THE FOXES GUARD THE RICE GOD'], [0, 590, 640, 704, 'INARI', 'THE STATION AND THE SNACK STALLS']],
    lay() {
      tRect(FR, 0, 0, 40, 44); tRect(PL, 0, 37.5, 40, 44); tRect(VL, 14, 24, 26, 37.5);
      path([[25.5, 30], [30, 30], [30, 21.5]], 0.7, DT); path([[30, 21.5], [24, 19.5]], 0.7, DT); path([[24, 19.5], [24, 9]], 0.7, DT);
      tOval(GR, 28, 6.5, 5.5, 3.2); path([[24, 9], [27, 7]], 0.7, DT); path([[23, 6], [15, 5.5], [11, 5]], 0.7, DT); tOval(PL, 7, 4.5, 4.8, 2.6);
      path([[7, 7], [7, 15], [9, 22], [12, 28], [14.5, 30]], 0.7, DT);
    },
    deco() {
      tunnel(480, 466, 352, [416]); ledge([[456, 416], [504, 416]], 12, 'stone'); steps(480, 416, 24, 16);
      tunnel(384, 300, 150, [240]); ledge([[360, 240], [408, 240]], 12, 'stone'); steps(384, 240, 24, 16);
      stampSpot('ky_senbon', 384, 200, 'TAKE A PHOTO', 'snap', ['GATE AFTER GATE AFTER GATE, SO CLOSE TOGETHER THE LIGHT COMES THROUGH IN ORANGE STRIPES.', 'EACH ONE WAS GIVEN BY SOMEONE. THEIR NAMES ARE WRITTEN ON THE BACK.']);
      ledge([[88, 192], [136, 192]], 12, 'stone'); steps(112, 192, 24, 16); ledge([[144, 400], [192, 400]], 12, 'stone'); steps(168, 400, 24, 16);
      // the shrine
      put(SPR.inari, 320, 420, 88, 90); block(260, 398, 380, 420); prop('kitsune', 286, 452, 5); prop('kitsune', 354, 452, 5); for (const y of [480, 530]) for (const x of [262, 378]) prop('lantern', x, y, 4);
      stampSpot('ky_fox', 320, 432, 'PRAY', 'bow', ['TWO STONE FOXES WATCH YOU CLAP. ONE HOLDS A KEY TO THE RICE STORE IN ITS MOUTH.', 'INARI IS THE GOD OF RICE, AND OF BUSINESS. HALF THE SHOPS IN JAPAN HAVE A LITTLE SHRINE TO INARI.']);
      put(SPR.romon, 320, 600, 61, 99); block(262, 592, 304, 600); block(336, 592, 378, 600);
      // the tea stop halfway up, and the lookout
      house(448, 96, 56, 26, { sign: 'UDON', noren: '#e0563f', rh: 14, lantern: true, to: 'k_udon' }); prop('ema', 512, 124, 8); prop('kitsune', 404, 120, 5); prop('bench', 480, 140, 9);
      M.SPOTS.push({ x: 512, y: 132, r: 12, label: 'READ', lines: ['FOX-FACED WISHING PLAQUES. PEOPLE DRAW THE FACES THEMSELVES.', 'MOST OF THE FOXES ARE SMILING. ONE IS WEARING SUNGLASSES.'] });
      stampSpot('ky_yotsu', 112, 64, 'LOOK OUT', 'snap', ['THE WHOLE CITY LIES IN THE VALLEY BELOW, ROOFTOPS ALL THE WAY TO THE HILLS.', 'MOST PEOPLE TURN BACK HERE. THE MOUNTAIN GOES ON FOR HOURS.'], 16);
      prop('bench', 72, 84, 9); prop('kitsune', 160, 52, 5); npc('salary', 150, 84, { dir: 'u', lines: ['I CLIMB IT EVERY SUNDAY. THE GATES NEVER END. I FIND THAT RELAXING.'] });
      // the street
      station(120, 600, 'INARI'); house(500, 600, 56, 28, { sign: 'FOX SNACKS', noren: '#e0563f', rh: 14, lantern: true }); house(570, 600, 56, 28, { sign: 'TORII SHOP', noren: '#c8382e', rh: 14 }); bottomRow(31);
      npc('granny', 520, 616, { lines: ['INARIZUSHI! RICE IN SWEET FRIED TOFU. THE FOXES\' FAVOURITE.', 'THE FOXES CANNOT EAT IT. SO WE DO.'] }); npc('tourist', 432, 470, { rad: 16, lines: ['THE GATES START BEHIND THE SHRINE. JUST KEEP GOING UP.'] });
      npc('teen', 480, 400, { tint: '#f06a8c', lines: ['MY LEGS ARE SHAKING. HOW MANY GATES IS THIS?', 'SOMEBODY SAID TEN THOUSAND. SOMEBODY ELSE SAID THIRTY. I AM NOT COUNTING.'] }); M.ACT.push({ cat: true, x: 210, y: 460, k: 1 });
      crowd(4, 40, 630, 600, 630, 8); crowd(3, 320, 590, 320, 450, 10); crowd(2, 480, 460, 480, 360, 1); crowd(2, 384, 300, 384, 160, 1);
      wild(['green', 'pine', 'green2', 'green'], 3); M.LIGHTS = [];
    } };

  // ---------- Gion and Kiyomizu, at dusk ----------
  MAPS.kyo_gion = { name: 'GION', sub: 'UP THE STONE LANES TO KIYOMIZU', tw: 56, th: 44, music: 'kyoto', night: 1, tint: '#e0b0c0',
    zones: [[600, 100, 896, 340, 'KIYOMIZU STAGE', 'A TERRACE OVER THE TREES'], [700, 340, 896, 520, 'OTOWA WATERFALL', 'THREE STREAMS, THREE WISHES'], [300, 0, 620, 272, 'KIYOMIZU-DERA', 'THE TEMPLE OF PURE WATER'],
      [288, 272, 620, 400, 'SANNENZAKA', 'THE SLOPE OF THREE YEARS'], [256, 400, 720, 524, 'YASAKA PAGODA', 'THE TOWER OF HOKAN-JI'], [0, 560, 896, 704, 'GION', 'HANAMIKOJI AT DUSK']],
    lay() {
      tRect(FR, 0, 0, 56, 44); tRect(PL, 0, 36.5, 56, 44);
      tRect(GR, 16, 25.5, 44, 32); tRect(GR, 18, 17.5, 38, 25); tRect(VL, 20, 2, 38, 17); tRect(VL, 38, 8, 50, 14.5); tRect(DT, 38, 14.5, 50, 20.5);
      path([[49.5, 11], [52.5, 14], [52.5, 21], [50, 26.5]], 0.7); tOval(GR, 48, 28.5, 5, 3.2); path([[44, 29], [40, 29.5]], 0.8);
      path([[32, 37], [32, 31.5]], 1.1, PL); path([[32, 31.5], [30, 28], [26.5, 26]], 1.1, PL); path([[26.5, 24.5], [28, 21], [30, 18]], 1.1, PL); path([[30, 16.5], [30, 13]], 1.1, PL);
    },
    deco() {
      const g = M.ground.g;
      ledge([[256, 512], [480, 510], [704, 512]], 12, 'stone'); steps(512, 512, 24, 16);
      ledge([[288, 400], [448, 398], [608, 400]], 12, 'stone'); steps(424, 400, 24, 16);
      ledge([[320, 272], [460, 270], [608, 272]], 12, 'stone'); steps(480, 272, 24, 16);
      ledge([[816, 288], [864, 288]], 12, 'stone'); steps(840, 288, 24, 16);
      // the stage: a plank deck, and the lattice of stilts under it
      for (let x = 608; x < 800; x += 4) { R(g, x, 128, 4, 104, x % 8 ? '#b8865a' : '#a87a50'); R(g, x, 128, U, 104, '#8a6440'); } R(g, 608, 128, 192, 1, '#d8a878');
      for (let x = 608; x < 800; x += 1) R(g, x, 230, 1, 2, '#6a4430'); for (let x = 610; x < 800; x += 12) { R(g, x, 224, 2, 8, '#6a4430'); }
      R(g, 608, 232, 192, 96, '#3a2a28'); for (let x = 610; x < 800; x += 13) { R(g, x, 232, 4, 96, '#8a6448'); R(g, x, 232, 1, 96, '#b8865a'); R(g, x + 3, 232, 1, 96, '#5a3a28'); }
      for (const y of [246, 270, 294, 318]) { R(g, 608, y, 192, 3, '#8a6448'); R(g, 608, y, 192, 1, '#b8865a'); R(g, 608, y + 3, 192, 1, '#2a1a18'); }
      block(608, 228, 800, 328); block(796, 128, 800, 166); block(796, 190, 800, 232);
      put(SPR.kiyo, 520, 160, 100, 98); block(440, 138, 600, 160); put(SPR.romon, 480, 256, 61, 99); block(422, 248, 464, 256); block(496, 248, 538, 256);
      stampSpot('ky_kiyomizu', 720, 212, 'LOOK OUT', 'snap', ['THE STAGE STANDS ON 139 WOODEN PILLARS, WITHOUT A SINGLE NAIL.', 'BELOW, THE TREES; BEYOND THEM, THE WHOLE CITY GOING PINK IN THE EVENING.'], 18, { frame: [470, 64, 330, 220] });
      npc('monk', 580, 190, { lines: ['TO JUMP OFF THE STAGE OF KIYOMIZU, WE SAY, WHEN SOMEONE TAKES A BIG RISK.', 'PLEASE DO NOT TAKE IT LITERALLY.'] }); npc('tourist', 680, 160, { dir: 'd', rad: 20, lines: ['IT IS EVEN BETTER IN AUTUMN, THEY SAY. I DO NOT SEE HOW.'] });
      // Otowa, down the east trail
      put(SPR.otowa, 768, 436, 40, 59); block(732, 424, 804, 436); M.SPOTS.push({ x: 768, y: 448, r: 15, label: 'DRINK THE WATER', stamp: 'ky_otowa', act: 'hold', fx: 'slurp', lines: ['THREE THIN STREAMS FALL FROM THE ROOF. ONE FOR A LONG LIFE, ONE FOR LOVE, ONE FOR GOOD GRADES.', 'YOU MAY ONLY DRINK FROM ONE. CHOOSING IS THE HARD PART.'] });
      npc('kid', 720, 470, { lines: ['I DRANK FROM ALL THREE. GREEDY, GRANDMA SAYS.'] });
      // level 1: the pagoda and its lane
      put(SPR.kpagoda, 336, 480, 52, 130); block(310, 462, 362, 480); stampSpot('ky_pagoda', 336, 494, 'TAKE A PHOTO', 'snap', ['A FIVE-STOREY PAGODA RISING OUT OF A LANE OF WOODEN HOUSES.', 'IT HAS STOOD HERE FOR FIVE HUNDRED YEARS. THE LANE GREW UP AROUND IT.']);
      house(580, 456, 56, 28, { sign: 'SWEETS', noren: '#f06a8c', rh: 14, lantern: true, wall: '#8a6448' }); house(648, 456, 50, 26, { sign: 'POTTERY', noren: '#3d5a80', rh: 14, wall: '#8a6448' });
      prop('bench', 420, 480, 9); npc('granny', 400, 440, { rad: 20, lines: ['SANNENZAKA. TRIP ON THESE STEPS AND YOU HAVE THREE YEARS OF BAD LUCK.', 'SO WE SELL GOURDS AT THE TOP. THEY CANCEL IT OUT. VERY CONVENIENT.'] });
      // level 2: Sannenzaka shops
      house(352, 340, 56, 28, { sign: 'PICKLES', noren: '#5a8a5a', rh: 14, lantern: true, wall: '#8a6448' }); house(560, 340, 56, 28, { sign: 'FANS', noren: '#8a6aff', rh: 14, lantern: true, wall: '#8a6448' });
      npc('teen', 520, 360, { tint: '#f0a8c0', lines: ['WE RENTED KIMONOS IN GION. I CANNOT WALK FAST IN THESE SANDALS.', 'THAT IS THE POINT, SHE SAYS. SLOW DOWN.'] }); M.ACT.push({ cat: true, id: 'lane', x: 300, y: 360, k: 0 });
      // Gion: Hanamikoji
      const MACHI = [[40, 'SOBA', '#3d5a80'], [104, 'TEA HOUSE', '#5a8a5a', 'k_tea'], [168, null, '#8a2a24'], [232, 'KIMONO', '#c8486a', 'k_kimono'], [296, 'INCENSE', '#3a3a4e'], [360, null, '#8a2a24'], [424, 'SAKE', '#3d5a80'], [600, 'SWEETS', '#f06a8c'], [664, null, '#8a2a24'], [728, 'COMBS', '#c8a04a'], [792, 'SOBA', '#3d5a80'], [856, null, '#5a8a5a']];
      for (const [x, s, c, to] of MACHI) house(x, 584, 56, 28, { sign: s || undefined, noren: c, rh: 14, lantern: true, wall: '#7a5440', beam: '#3a2420', to });
      busStop(470, 610); bottomRow(57);
      stampSpot('ky_hanami', 300, 628, 'TAKE A PHOTO', 'snap', ['WOODEN TEAHOUSES, PAPER LANTERNS, AND A MAIKO HURRYING TO AN APPOINTMENT.', 'NOBODY KNOWS WHAT HAPPENS BEHIND THESE DOORS. THAT IS RATHER THE POINT.']);
      npc('maiko', 200, 620, { rad: 30, lines: ['GOOD EVENING.', '(SHE SMILES AND KEEPS WALKING. SHE IS VERY LATE.)'] }); npc('maiko', 660, 630, { rad: 30, tint: '#8a6aff', lines: ['MY SANDALS ARE TEN CENTIMETRES TALL. I HAVE FALLEN OVER ONLY TWICE.'] });
      npc('salary', 560, 616, { lines: ['THE BUS STOP IS RIGHT THERE. EVERY TEMPLE IN THE CITY IS ON THAT BUS.'] }); M.ACT.push({ cat: true, id: 'gion', x: 760, y: 640, k: 2 });
      crowd(5, 40, 640, 860, 640, 8); crowd(4, 860, 612, 40, 612, 4); crowd(3, 512, 590, 512, 300, 6);
      wild(['green', 'pine', 'green2', 'green', 'maple', 'pine']);
    } };

  // ---------- Arashiyama ----------
  function monkey(x, y) { const rnd = RNG(x * 5 + y); M.ACT.push({ x, y, hx: x, hy: y, fl: 0, t: rnd() * 3, mv: false, wt: 0, rnd, sayT: 0, st: 0,
    upd(m, dt) { m.t -= dt; if (m.t <= 0) { if (m.st) { m.st = 0; m.mv = false; m.t = 1 + m.rnd() * 3; } else { m.st = 1; const a = m.rnd() * 6.283; m.tx = m.hx + Math.cos(a) * 30; m.ty = m.hy + Math.sin(a) * 16; m.t = 2.5; } } if (m.st) { const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy); if (d < 2 || !step(m, dx / d * 26 * dt, dy / d * 26 * dt)) { m.st = 0; m.mv = false; m.t = 1 + m.rnd() * 2; } else { m.mv = true; m.wt += dt; m.fl = dx < 0 ? 1 : 0; } } },
    draw(m, sx, sy) { ell(ctx, sx, sy, 5, 1.5, 'rgba(22,30,50,0.3)'); ctx.drawImage(SPR.monkey[m.mv ? Math.floor(m.wt * 8) % 2 : 0][m.fl], snap(sx - 8), snap(sy - 13)); },
    use(m) { m.fl = pl.x < m.x ? 1 : 0; say(m, ['(STARES AT YOU. UNIMPRESSED.)', '(SCRATCHES. YAWNS.)', '(EYES YOUR SNACKS)', '(TURNS ITS BACK. RUDE.)'][Math.floor(m.rnd() * 4)]); }, label: () => 'WATCH' }); }
  MAPS.kyo_arashi = { name: 'ARASHIYAMA', sub: 'BAMBOO, A RIVER AND A HILL OF MONKEYS', tw: 48, th: 34, music: 'kyoto',
    zones: [[0, 0, 330, 352, 'BAMBOO GROVE', 'THE WIND SOUNDS LIKE RAIN'], [330, 0, 540, 300, 'TENRYU-JI', 'A ZEN GARDEN SEVEN HUNDRED YEARS OLD'], [540, 0, 768, 352, 'IWATAYAMA', 'A HILL OF WILD MONKEYS'], [0, 400, 768, 544, 'TOGETSUKYO', 'THE MOON-CROSSING BRIDGE'], [0, 300, 768, 400, 'ARASHIYAMA', 'A RIVERSIDE TOWN']],
    lay() {
      tRect(FR, 0, 0, 48, 34); tRect(PL, 0, 22, 48, 25); tRect(GR, 0, 25, 48, 27); tRect(WA, 0, 27, 48, 31); tRect(GR, 0, 31, 48, 34);
      path([[11, 22], [10, 18], [7, 14], [8, 10], [6, 7], [10, 4], [15, 5], [17, 9], [20.5, 11]], 0.75);
      tRect(VL, 21, 4, 33, 17); tOval(WA, 24, 13, 2.6, 1.4); path([[27, 17], [27, 22]], 0.9, PL);
      tRect(GR, 35, 3, 47, 21); path([[40, 22], [40, 18], [43, 15], [38, 11], [41, 7], [44, 5]], 0.7);
    },
    deco() {
      ledge([[560, 224], [660, 222], [752, 224]], 11, 'earth'); steps(672, 224, 24, 15, '#b89868'); ledge([[560, 144], [660, 142], [752, 144]], 11, 'earth'); steps(632, 144, 24, 15, '#b89868');
      bridge(384, 428, 408, 500, '#6a4a30', '#a8845a'); stampSpot('ky_bridge', 396, 470, 'TAKE A PHOTO', 'snap', ['THE MOON-CROSSING BRIDGE, SO NAMED BECAUSE AN EMPEROR THOUGHT THE MOON SEEMED TO WALK ACROSS IT.', 'THE MOUNTAINS BEHIND ARE GREEN NOW. IN AUTUMN THEY ARE ON FIRE.'], 15, { frame: [276, 396, 240, 160] });
      for (const [x, y] of [[200, 470], [560, 460], [660, 480]]) put(SPR.boat, x, y, 13, 8);
      npc('yukata', 600, 520, { lines: ['A ROWING BOAT FOR AN HOUR? THE RIVER IS SLOW AND THE DUCKS ARE FRIENDLY.'] }); prop('bench', 120, 420, 9); prop('bench', 520, 420, 9);
      // the bamboo grove and its fences
      for (const [x, y] of [[96, 176], [112, 112]]) prop('fence', x, y, 0);
      stampSpot('ky_bamboo', 120, 230, 'LISTEN', 'snap', ['THE BAMBOO CREAKS AND KNOCKS, AND THE LEAVES HISS LIKE RAIN FAR ABOVE.', 'THE GOVERNMENT LISTS THIS AS ONE OF THE HUNDRED SOUNDS OF JAPAN WORTH SAVING.'], 16);
      npc('tourist', 140, 120, { rad: 14, lines: ['I CAME AT SIX IN THE MORNING TO HAVE IT TO MYSELF.', 'SO DID EVERYONE ELSE.'] });
      // Tenryu-ji, with a side gate from the grove
      put(SPR.tenryu, 432, 150, 88, 90); block(372, 128, 492, 150); wallH(336, 416, 280); wallH(448, 528, 280); wallV(336, 72, 160); wallV(336, 192, 280); wallV(528, 72, 280); wallH(336, 528, 72);
      stampSpot('ky_tenryu', 384, 236, 'SIT BY THE POND', 'snap', ['A POND, A FEW ROCKS, AND THE HILLS BEHIND BORROWED INTO THE GARDEN AS IF THEY WERE PART OF IT.', 'THE MONK WHO DESIGNED IT HAS BEEN GONE SEVEN HUNDRED YEARS. IT STILL WORKS.']);
      plant('pine', 360, 200, 1); plant('maple', 470, 220, 1); plant('maple', 500, 190, 1); npc('monk', 470, 250, { lines: ['THE GARDEN IS NOT FOR LOOKING AT. IT IS FOR SITTING WITH.'] });
      // the monkey hill
      house(700, 96, 56, 26, { sign: 'MONKEY HUT', noren: '#c8a04a', rh: 14 }); stampSpot('ky_monkey', 600, 60, 'LOOK OUT', 'snap', ['THE WHOLE CITY SPREAD OUT BELOW, AND A MONKEY SITTING NEXT TO YOU ENJOYING THE SAME VIEW.', 'THE SIGN SAYS DO NOT LOOK THE MONKEYS IN THE EYE. TOO LATE.'], 16);
      for (const [x, y] of [[580, 80], [640, 100], [690, 130], [600, 120], [720, 60], [660, 60], [740, 130], [620, 180]]) monkey(x, y);
      signpost(624, 330, ['IWATAYAMA MONKEY PARK. A SHORT CLIMB TO THE TOP.', 'PLEASE DO NOT FEED THE MONKEYS OUTSIDE THE HUT.']);
      // the street
      station(80, 352, 'ARASHIYAMA'); for (const [x, s, c] of [[240, 'MATCHA', '#5a8a5a'], [304, 'TOFU', '#f4f1e6'], [512, 'SWEETS', '#f06a8c'], [720, 'CRAFTS', '#8a6aff']]) house(x, 352, 56, 28, { sign: s, noren: c, rh: 14, lantern: true, wall: '#8a6448' });
      prop('rick', 560, 380, 9); npc('yukata', 580, 376, { lines: ['RICKSHAW THROUGH THE BAMBOO? I RUN, YOU SIT.'] }); npc('granny', 360, 376, { lines: ['THE TOFU HERE IS MADE WITH THE RIVER WATER. THAT IS WHY IT IS SO SOFT.'] }); M.ACT.push({ cat: true, x: 450, y: 410, k: 0 });
      crowd(5, 40, 380, 740, 380, 8); crowd(3, 740, 368, 40, 368, 4); crowd(2, 396, 410, 396, 520, 2); crowd(3, 120, 340, 120, 80, 6);
      wild(['bamboo', 'bamboo', 'bamboo', 'green', 'bamboo', 'green2'], 2);
    } };

  // ---------- Kinkaku-ji and Ryoan-ji ----------
  MAPS.kyo_kinkaku = { name: 'KINKAKU-JI', sub: 'A PAVILION COVERED IN GOLD', tw: 44, th: 35, music: 'kyoto',
    zones: [[0, 368, 260, 498, 'RYOAN-JI', 'FIFTEEN STONES IN RAKED GRAVEL'], [540, 108, 704, 308, 'SEKKA-TEI', 'A TEA HOUSE ON THE RISE'], [200, 488, 520, 560, 'KINKAKU-JI', 'THE TEMPLE GATE'], [0, 0, 704, 560, 'KYOKO-CHI', 'THE MIRROR POND']],
    lay() {
      tRect(FR, 0, 0, 44, 35); tRect(GR, 2, 5, 36, 24); tOval(WA, 19, 14, 14, 5.8); tOval(WA, 27, 11, 6, 3.5); tOval(GR, 15, 14.5, 1.8, 1.1); tOval(GR, 23, 16, 1.3, 0.8);
      tRect(GR, 35, 7, 42, 27); tRect(PL, 14, 31, 30, 35); tRect(GR, 2, 24, 16, 32); tRect(VL, 3, 24.5, 15, 28.5);
      path([[22, 31], [22, 22]], 0.8); path([[22, 22], [10, 21.5], [4, 18], [3.5, 11], [6, 7], [12, 6.5], [30, 6.5], [36, 8], [38.5, 12], [38.5, 19], [36, 25], [30, 31.5]], 0.7); path([[14, 32], [9, 30]], 0.7);
    },
    deco() {
      const g = M.ground.g, kk = SPR.kinkaku;
      g.save(); g.globalAlpha = 0.32; g.translate(0, 2 * 132); g.scale(1, -1); g.drawImage(kk, 288 - 70, 132 - 119); g.restore();
      put(kk, 288, 132, 70, 119); block(240, 112, 336, 132);
      stampSpot('ky_gold', 352, 348, 'TAKE A PHOTO', 'snap', ['THE TOP TWO FLOORS ARE COVERED IN REAL GOLD LEAF, AND THE POND GIVES YOU A SECOND ONE FOR FREE.', 'A GOLDEN PHOENIX STANDS ON THE ROOF, AS IF IT MIGHT FLY OFF.'], 16);
      plant('pine', 240, 238, 1); plant('pine', 370, 260, 1); for (const [x, y] of [[80, 168], [120, 348], [480, 348], [580, 348], [600, 428], [40, 108], [560, 128]]) plant(hsh(x, y) < 0.5 ? 'pine' : 'maple', x, y, 1);
      ledge([[560, 288], [620, 286], [672, 288]], 12, 'stone'); steps(616, 288, 24, 16); house(640, 188, 50, 26, { sign: 'SEKKA-TEI', noren: '#5a8a5a', rh: 14 });
      npc('kimono', 600, 218, { lines: ['THE TEA HOUSE IS ON THE RISE SO THE EVENING SUN CATCHES THE GOLD.'] });
      prop('jizo', 620, 378, 4); prop('jizo', 650, 382, 4); stampSpot('ky_wish', 636, 398, 'TOSS A COIN', 'bow', ['YOU TOSS A COIN AT THE LITTLE STONE BOWL. IT RINGS, AND LANDS INSIDE.', 'THAT IS VERY GOOD LUCK, THE MAN NEXT TO YOU SAYS. HIS LANDED IN THE MOSS.']);
      // Ryoan-ji: raked gravel, fifteen stones, a long veranda
      for (let y = 394; y < 454; y += 2.5) R(g, 48, y, 192, U, '#b8b0a0'); const rocks = [[78, 410], [96, 432], [140, 418], [176, 440], [210, 408]];
      for (const [x, y] of rocks) { for (let r = 8; r < 20; r += 3) for (let a = 0; a < 6.283; a += 0.06) p1(g, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.5, '#a8a090'); }
      for (const [x, y] of rocks) plant('rock', x, y + 4, 1); block(48, 392, 240, 456);
      for (let x = 44; x < 244; x += 5) { R(g, x, 456, 5, 16, x % 10 ? '#b8865a' : '#a87a50'); R(g, x, 456, U, 16, '#8a6440'); } R(g, 44, 456, 200, 1, '#d8a878'); R(g, 44, 472, 200, 2, '#5a3a28');
      wallH(40, 248, 392, '#c8a070', '#5a4a48');
      stampSpot('ky_rock', 144, 466, 'SIT AND LOOK', 'snap', ['FIFTEEN STONES IN WHITE GRAVEL. WHEREVER YOU SIT, ONE OF THEM IS ALWAYS HIDDEN.', 'NOBODY KNOWS WHAT IT MEANS. PEOPLE HAVE BEEN SITTING HERE WONDERING FOR FIVE HUNDRED YEARS.'], 16);
      npc('salary', 90, 466, { dir: 'u', lines: ['...', 'I HAVE COUNTED FOURTEEN. FIVE TIMES.'] }); npc('granny', 200, 468, { dir: 'u', lines: ['I DO NOT COUNT THEM. I JUST SIT.'] });
      put(SPR.mon, 352, 496, 30, 50); block(326, 488, 340, 496); block(364, 488, 378, 496); busStop(250, 518); prop('vend', 440, 514, 6);
      npc('tourist', 380, 368, { rad: 20, lines: ['IT BURNED DOWN IN 1950. THEY BUILT IT AGAIN, EVEN SHINIER.'] }); M.ACT.push({ cat: true, x: 560, y: 408, k: 0 });
      crowd(3, 352, 548, 352, 368, 8); crowd(3, 100, 344, 560, 344, 6);
      wild(['pine', 'green', 'green2', 'pine', 'green', 'maple']); M.LIGHTS = [];
    } };

  // ---------- rooms ----------
  MAPS.k_tea = { indoor: 1, name: 'TEA HOUSE', music: 'kyoto', deco() {
    room({ wall: '#e0d0a8', floor: 'tatami', mat: '#5a8a5a', art: (g, r) => { R(g, 120, 6, 80, 40, '#8a6448'); R(g, 124, 8, 72, 36, '#f0e4c8'); R(g, 150, 10, 20, 30, '#f8f4ea'); R(g, 150, 10, 20, 2, '#5a3a28'); for (let k = 0; k < 5; k++) R(g, 155 + (k % 2) * 4, 14 + k * 5, 7, 2, '#3a2e40'); R(g, 178, 32, 8, 10, '#8a6448'); R(g, 181, 22, 1, 10, '#5a8a5a'); disc(g, 182, 21, 3, '#e0563f'); for (const x of [20, 236]) { R(g, x, 8, 64, 34, '#5a3a28'); R(g, x + 2, 10, 60, 30, '#f8f0dc'); for (let k = 0; k < 60; k += 10) R(g, x + 2 + k, 10, 1, 30, '#8a6448'); R(g, x + 2, 25, 60, 1, '#8a6448'); } } });
    const k = npc('kimono', 160, 100, { tint: '#5a8a6a', lines: ['WELCOME.'] }); k.spot = { label: 'JOIN THE CEREMONY', mini: 'tea', stamp: 'ky_tea' };
    for (const x of [100, 220]) npc(x < 160 ? 'granny' : 'tourist', x, 140, { dir: 'u', lines: [x < 160 ? 'TURN THE BOWL TWICE, THEN DRINK IN THREE SIPS.' : 'MY LEGS ARE ASLEEP. DO NOT TELL ANYONE.'] }); fur('plant', 20, 176); fur('plant', 300, 176);
  } };
  MAPS.k_kimono = { indoor: 1, name: 'KIMONO RENTAL', music: 'kyoto', deco() {
    room({ wall: '#f0e0e8', mat: '#c8486a', art: g => { poster(g, 24, 10, 60, 16, '#c8486a', 'RENTAL 3000'); poster(g, 236, 10, 60, 16, '#4a6fa5', 'YUKATA'); R(g, 140, 8, 40, 36, '#8a8496'); R(g, 142, 10, 36, 32, '#cfeaff'); R(g, 146, 12, 4, 28, '#ffffff'); } });
    for (const [x, y, k] of [[50, 100, 0], [270, 100, 3], [50, 150, 5], [270, 150, 1], [110, 130, 2], [210, 130, 4]]) fur('rack', x, y, k); fur('counter', 160, 84, 60, '#f8d0dc'); fur('till', 176, 78);
    const k = npc('maiko', 160, 66, { tint: '#c8486a', lines: ['WELCOME!'] }); k.spot = { label: 'CHOOSE A KIMONO', mini: 'dress', stamp: 'ky_kimono', kimono: 1 };
    npc('teen', 90, 126, { rad: 20, tint: '#f0a8c0', lines: ['THE OBI IS SO TIGHT I CAN ONLY EAT HALF A DUMPLING.'] }); npc('office', 230, 160, { rad: 20, lines: ['THEY DID MY HAIR TOO. I LOOK LIKE A PAINTING.'] }); fur('plant', 20, 176); fur('plant', 300, 176);
  } };
  MAPS.k_udon = { indoor: 1, name: 'KITSUNE UDON', music: 'kyoto', deco() {
    room({ wall: '#c89a6a', mat: '#e0563f', art: (g, r) => { wallShelf(g, 24, 60, ['#f4f1e6', '#e0563f', '#f2c14e'], r); poster(g, 110, 10, 100, 16, '#e0563f', 'KITSUNE UDON 700'); for (const x of [240, 280]) chochin(g, x, 12, '#e0452f'); } });
    fur('counter', 160, 92, 180); for (let x = 90; x <= 230; x += 28) fur('stool', x, 106); eaters([90, 174, 230], 104, ['THE FRIED TOFU IS SWEET. THE FOXES LOVE IT, THEY SAY.', 'I CLIMBED HALFWAY. I DESERVE THIS.', 'SLURP. SORRY. SLURP.']);
    npc('chef', 160, 72, { lines: ['THICK NOODLES, LIGHT BROTH, A SHEET OF SWEET FRIED TOFU ON TOP.', 'THE FOX\'S FAVOURITE, SO IT IS CALLED KITSUNE. FOX UDON.'] });
    M.SPOTS.push({ x: 146, y: 108, r: 12, label: 'ORDER UDON', stamp: 'ky_udon', act: 'hold', fx: 'slurp', lines: ['A BIG BOWL OF UDON WITH A GOLDEN SHEET OF FRIED TOFU, SOAKED IN SWEET BROTH.', 'IT IS EXACTLY WHAT LEGS NEED AFTER A THOUSAND GATES.'] }); fur('plant', 20, 176); fur('plant', 300, 176);
  } };

  // ---------- the tea ceremony: whisk the tea to a froth before it cools ----------
  const TEA = {
    init(m) { m.foam = 0; m.time = 10; m.done = 0; m.wh = 0; },
    update(m, dt) {
      if (m.done) { if (m.t > m.done + 1.4) endMini(true, ['THE TEA IS THICK AND GREEN, WITH A FOAM LIKE A FIELD OF MOSS.', 'YOU TURN THE BOWL TWICE, DRINK IN THREE SIPS, AND BOW. THE HOST BOWS BACK.']); return; }
      m.time -= dt; m.foam = Math.max(0, m.foam - dt * 9);
      if (KP.a || KP.l || KP.r) { m.foam = Math.min(100, m.foam + 7.5); m.wh ^= 1; Snd.fx('talk'); }
      if (m.foam >= 100) { m.done = m.t; Snd.fx('yay'); } else if (m.time <= 0) endMini(false, ['THE TEA IS THIN AND A LITTLE LUMPY.', 'THE HOST SMILES AND QUIETLY MAKES YOU ANOTHER. TRY AGAIN.']);
    },
    draw(m) {
      txtC(ctx, 'TEA CEREMONY', 160, 30, '#c8382e', null, 2); const f = m.foam / 100;
      R(ctx, 96, 104, 128, 6, '#b8c078'); ell(ctx, 160, 98, 30, 12, '#4a3a30'); ell(ctx, 160, 92, 30, 10, '#6a5040'); ell(ctx, 160, 92, 26, 8, '#5a8a3a'); ell(ctx, 160, 91, 6 + f * 19, 2 + f * 6, '#b8d878'); if (f > 0.5) ell(ctx, 156, 90, f * 10, f * 3, '#d8f0a0');
      const wx = 160 + (m.wh ? 9 : -9); R(ctx, wx - 1.5, 52, 3, 30, '#d8c090'); R(ctx, wx - 4, 80, 8, 8, '#e8d8a8'); for (let k = 0; k < 5; k++) R(ctx, wx - 4 + k * 2, 82, U, 6, '#b8a070');
      R(ctx, 70, 116, 180, 5, '#d9cba8'); R(ctx, 70, 116, 180 * f, 5, '#5aa85a'); R(ctx, 70, 123, 180 * Math.max(0, m.time) / 10, 2, m.time < 3 ? '#c8382e' : '#8a7a6a');
      txtC(ctx, m.done ? 'A PERFECT BOWL' : 'TAP E QUICKLY TO WHISK THE TEA TO A FOAM', 160, 132, '#3a2e40');
    }
  };

  concourse('ky_shinkansen', { name: 'KYOTO STATION', hub: 'kyo_station', music: 'kyoto', track: 12, dest: 'TOKYO', bento: ['SABA SUSHI', 'MACKEREL PRESSED ONTO RICE AND WRAPPED IN KELP. KYOTO HAS MADE IT THIS WAY FOR CENTURIES.'] });
  city({
    id: 'kyoto', name: 'KYOTO', tagline: 'A THOUSAND TEMPLES AND ONE BUS PASS',
    start: 'kyo_station', hub: 'kyo_station', concourse: 'ky_shinkansen', line: LINE, stamps: STAMPS, cats: 6, minis: { tea: TEA },
    icons() { // the little pictures for the stamp book and the bag: painted at boot, since they show up everywhere
      icon('ktower', g => { R(g, 5, 3, 2, 7, '#f4f1e6'); R(g, 3, 2, 6, 2, '#e0452f'); R(g, 5.5, 0, 1, 2, '#c8c4bc'); R(g, 2, 10, 8, 2, '#c8c4bc'); });
      icon('fox', g => { R(g, 3, 5, 6, 5, '#f4f1e6'); R(g, 3, 1, 2, 3, '#f4f1e6'); R(g, 7, 1, 2, 3, '#f4f1e6'); R(g, 3, 4, 6, 3, '#f4f1e6'); R(g, 4, 7, 4, 2, '#e0452f'); P(g, 4, 5, '#1d1626'); P(g, 7, 5, '#1d1626'); R(g, 9, 8, 3, 2, '#f4f1e6'); });
      icon('udon', g => { ell(g, 6, 8, 5.5, 3, '#3a3a4e'); R(g, 1, 6, 10, 2, '#f8f0dc'); R(g, 3, 5, 6, 2, '#e0a050'); line(g, 8, 0, 6, 5, '#c8a070'); line(g, 10, 0, 8, 5, '#c8a070'); });
      icon('water', g => { for (const x of [3, 6, 9]) R(g, x, 0, 1, 7, '#7ac8dc'); ell(g, 6, 9, 5, 2, '#3e92c2'); R(g, 4, 8, 4, 1, '#a8dcf0'); });
      icon('tea', g => { ell(g, 6, 8, 5, 3, '#6a5040'); ell(g, 6, 7, 4.5, 2, '#5a8a3a'); ell(g, 6, 6.8, 3, 1, '#b8d878'); R(g, 9, 0, 1.5, 5, '#d8c090'); });
      icon('kimono', g => { R(g, 3, 1, 6, 10, '#c8486a'); R(g, 0, 2, 3, 5, '#c8486a'); R(g, 9, 2, 3, 5, '#c8486a'); R(g, 3, 5, 6, 2, '#f2c14e'); R(g, 5, 1, 2, 4, '#f4f1e6'); });
      icon('monkey', g => { disc(g, 6, 6, 5, '#8a6a50'); disc(g, 6, 7, 3.2, '#e8807a'); P(g, 4.5, 6, '#1d1626'); P(g, 7.5, 6, '#1d1626'); disc(g, 1.5, 6, 1.5, '#8a6a50'); disc(g, 10.5, 6, 1.5, '#8a6a50'); });
      icon('rock', g => { R(g, 0, 9, 12, 3, '#d8d0c0'); for (let x = 0; x < 12; x += 2) P(g, x, 10, '#b8b0a0'); ell(g, 6, 7, 4, 3, '#8c8498'); ell(g, 5, 6, 2.5, 1.5, '#aaa4b8'); });
      icon('coin', g => { disc(g, 6, 6, 5, '#d9b04a'); disc(g, 6, 6, 3.5, '#f2c14e'); R(g, 5, 5, 2, 2, '#8a6a2a'); });
    },
    sprites() {
      variants('bamboo', 3, (rnd, i) => { const c = mk(28, 74), g = c.g; for (let k = 0; k < 4; k++) bamboo(g, 5 + k * 5.5 + rnd() * 2, 73, 56 + rnd() * 14, k % 2 ? '#5aa85a' : '#6ab868', rnd); return c; });
      one('torS', 32, 40, g => torii(g, 16, 39, 24, 34, '#e8502a'), 1);
      one('inari', 176, 92, g => templeHall(g, 88, 90, 108, 30, { wall: '#e8502a', roof: '#5a4a48', plaster: '#f8f4ea', door: '#c0442f', gold: 1 }));
      const gate = (g, wall, rf) => { roof(g, 62, 2, 30, 60, 20, rf); R(g, 16, 22, 92, 10, wall); R(g, 16, 22, 92, 1.5, lite(wall, 0.3)); for (let x = 20; x < 104; x += 8) R(g, x, 25, 5, 5, '#f8f4ea'); roof(g, 62, 30, 46, 62, 16, rf); R(g, 8, 46, 108, 5, wall); R(g, 8, 46, 108, 1, lite(wall, 0.3)); R(g, 8, 50, 108, 1, dark(wall, 0.4)); for (const x0 of [14, 78]) { R(g, x0, 51, 32, 46, dark(wall, 0.55)); R(g, x0 + 4, 55, 24, 38, dark(wall, 0.4)); } for (const x of [10, 28, 46, 74, 92, 110]) { R(g, x, 51, 4, 47, wall); R(g, x, 51, 1, 47, lite(wall, 0.3)); R(g, x + 3, 51, 1, 47, dark(wall, 0.4)); R(g, x - 1, 96, 6, 3, '#8c8498'); } };
      one('romon', 124, 100, g => gate(g, '#e8502a', '#4a4660'));
      one('kitsune', 16, 30, g => { R(g, 1, 20, 14, 10, '#8c8498'); R(g, 1, 20, 14, 1, '#c8c0d4'); ell(g, 8, 15, 5, 6, '#f4f1e6'); disc(g, 8, 7, 3.5, '#f4f1e6'); R(g, 5, 2, 2, 4, '#f4f1e6'); R(g, 9, 2, 2, 4, '#f4f1e6'); R(g, 10, 7, 4, 2, '#f4f1e6'); R(g, 5, 11, 6, 3, '#e0452f'); p1(g, 7, 6.5, '#1d1626'); R(g, 12, 7.5, 3, 1, '#d9b04a'); R(g, 13, 12, 3, 8, '#f4f1e6'); }, 1);
      one('ema', 34, 26, g => { R(g, 2, 6, 2, 20, '#6a4a30'); R(g, 30, 6, 2, 20, '#6a4a30'); R(g, 0, 5, 34, 2, '#5a3a28'); for (let r = 0; r < 2; r++) for (let k = 0; k < 6; k++) { const x = 4 + k * 4.5, y = 8 + r * 7; R(g, x, y, 4, 5, '#e8c890'); R(g, x + 0.5, y + 1, 1, 1, '#c8382e'); R(g, x + 2.5, y + 1, 1, 1, '#c8382e'); R(g, x + 1, y - 1, 1, 1, '#e8c890'); R(g, x + 2.5, y - 1, 1, 1, '#e8c890'); } }, 1);
      one('kiyo', 200, 100, g => templeHall(g, 100, 98, 150, 34, { bays: 7, wall: '#8a5a3a', roof: '#7a5a48', door: '#5a3a28', rh: 30 }));
      one('kpagoda', 104, 132, g => pagoda(g, 52, 130, 5, 54, { bh: 11, rh: 8, step: 6, wall: '#7a4a34', roof: '#3d3852', panel: '#e8dcc0' }));
      one('otowa', 80, 60, g => { R(g, 4, 30, 72, 26, '#8c8498'); R(g, 4, 30, 72, 1, '#c8c0d4'); for (let x = 6; x < 76; x += 8) R(g, x, 32, U, 22, '#6b6478'); roof(g, 40, 6, 22, 40, 14, '#7a5a48'); for (const x of [12, 66]) { R(g, x, 19, 3, 12, '#8a5a3a'); } R(g, 8, 18, 64, 2, '#8a5a3a'); for (const x of [26, 40, 54]) { R(g, x - 1, 20, 3, 2, '#6b6478'); R(g, x - 0.5, 22, 1.5, 30, '#a8dcf0'); R(g, x - 0.5, 22, U, 30, '#ffffff'); } ell(g, 40, 56, 34, 3.5, '#3e92c2'); ell(g, 40, 55.5, 30, 2.5, '#58aed8'); });
      one('tenryu', 176, 92, g => templeHall(g, 88, 90, 108, 30, { wall: '#8a6448', roof: '#4a4660', door: '#5a3a28', plaster: '#efe3c8' }));
      one('fence', 26, 10, g => { for (let x = 1; x < 26; x += 4) { R(g, x, 1, 2, 9, '#a8845a'); R(g, x, 1, U, 9, '#d8b080'); } R(g, 0, 3, 26, 1, '#6a4a30'); R(g, 0, 7, 26, 1, '#6a4a30'); }, 1);
      one('boat', 26, 12, g => { ell(g, 13, 7, 12, 4, '#8a5a3a'); ell(g, 13, 6, 11, 3, '#c89a6a'); R(g, 4, 5, 18, 1, '#6a4028'); R(g, 0, 10, 26, 1, '#a6dcee'); }, 1);
      one('jizo', 12, 20, g => { R(g, 1, 16, 10, 4, '#8c8498'); ell(g, 6, 12, 4, 5, '#a8a2b4'); disc(g, 6, 6, 3.5, '#a8a2b4'); R(g, 2, 9, 8, 4, '#e0452f'); p1(g, 5, 6, '#3a3346'); p1(g, 7, 6, '#3a3346'); }, 1);
      one('mon', 60, 50, g => { roof(g, 30, 0, 12, 32, 14, '#4a4660'); R(g, 6, 13, 48, 4, '#6a4a30'); for (const x of [8, 48]) { R(g, x, 14, 4, 36, '#6a4a30'); R(g, x, 14, 1, 36, '#8a6448'); R(g, x - 1, 47, 6, 3, '#8c8498'); } });
      one('kytower', 52, 192, g => { bldg(g, 1, 191, 50, 36, { c: '#e8e4dc', lit: 0.25, gx: 5, ww: 3, gy: 6, top: false }, RNG(4)); for (let y = 38; y < 156; y++) { const w = 6 + (y - 38) * 0.02; R(g, 26 - w, y, w * 2, 1, '#f4f1e6'); R(g, 26 + w - 2, y, 2, 1, '#c8c4bc'); R(g, 26 - w, y, 1, 1, '#ffffff'); } R(g, 14, 26, 24, 12, '#e8e4dc'); R(g, 14, 26, 24, 1, '#ffffff'); R(g, 14, 30, 24, 4, '#3a4a6a'); for (let x = 15; x < 38; x += 3) R(g, x, 30.5, 2, 3, '#bfe8ff'); R(g, 16, 22, 20, 4, '#e0452f'); R(g, 18, 16, 16, 6, '#f4f1e6'); R(g, 22, 8, 8, 8, '#e0452f'); R(g, 25.5, 0, 1, 9, '#c8c4bc'); });
      SPR.monkey = [0, 1].map(f => { const c = mk(16, 14), g = c.g; ell(g, 8, 9, 5, 4, '#8a6a50'); disc(g, 11, 5, 3.5, '#8a6a50'); disc(g, 12, 5.5, 2.2, '#e8807a'); p1(g, 11.5, 4.5, '#1d1626'); p1(g, 13, 4.5, '#1d1626'); R(g, 3, 12, 2, 2 - f, '#6a4a38'); R(g, 6 + f, 12, 2, 2, '#6a4a38'); R(g, 9, 12, 2, 2 - f, '#6a4a38'); R(g, 12 - f, 12, 2, 2, '#6a4a38'); R(g, 2, 8, 2, 1, '#6a4a38'); const o = outline(c); return [o, flip(o)]; });
      const goldenPavilion = (g, cx, base) => { const wd = '#6b4630', gd = '#f2c14e', gd2 = '#c9962a';
        R(g, cx - 28, base - 12, 56, 12, '#efe3c8'); for (let x = cx - 28; x < cx + 28; x += 7) R(g, x, base - 12, 2, 12, wd); R(g, cx - 32, base - 2, 64, 2, wd); R(g, cx - 30, base - 5, 60, 1, wd);
        R(g, cx - 24, base - 28, 48, 12, gd); for (let x = cx - 24; x < cx + 24; x += 6) R(g, x, base - 28, 1, 12, gd2); R(g, cx - 26, base - 20, 52, 1, gd2);
        R(g, cx - 13, base - 43, 26, 10, '#f8d45a'); R(g, cx - 3, base - 41, 6, 8, gd2); R(g, cx - 10, base - 40, 3, 5, gd2); R(g, cx + 7, base - 40, 3, 5, gd2);
        roof(g, cx, base - 17, 26, 37, 6, '#6b5a4a'); roof(g, cx, base - 34, 15, 32, 7, '#6b5a4a'); roof(g, cx, base - 53, 1, 21, 11, '#6b5a4a'); P(g, cx, base - 56, gd); R(g, cx - 1, base - 55, 3, 1, gd); P(g, cx, base - 54, gd); };
      one('kinkaku', 140, 120, g => { g.save(); g.scale(2, 2); goldenPavilion(g, 35, 59.5); g.restore(); });
    }
  });
})();
