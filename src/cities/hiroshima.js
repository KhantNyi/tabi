'use strict';
// ---------- Hiroshima and Miyajima ----------
// Hiroshima is a city that was rebuilt. Its trams run past the station and the covered Hondori arcade, where a whole
// building is given over to okonomiyaki, made the Hiroshima way: in layers. At Peace Memorial Park, across the river from
// the Atomic Bomb Dome, people leave paper cranes, ring the Peace Bell and stand quietly at the cenotaph. The tone here is
// gentle on purpose.
// A boat goes from the park down the river to Miyajima, an island whose great torii stands out in the sea. The tide comes
// and goes on the shared clock: at high tide the torii and the shrine float on the water; at low tide the sea draws back
// over the sand and you can walk right out to the torii. Deer wander the shore, and the street smells of maple cakes.
(function () {
  const LINE = [['hir_town', 'HIROSHIMA STATION'], ['hir_park', 'PEACE PARK']];
  const AREAS = [['hir_town', 'HIROSHIMA STATION'], ['hir_park', 'PEACE PARK'], ['miyajima', 'MIYAJIMA']];
  const STAMPS = {
    hir_okono: ['HIROSHIMA OKONOMIYAKI', 'hokono', 'hir_town'], hir_lemon: ['SETOUCHI LEMONADE', 'lemon', 'hir_town'], hir_tram: ['THE STREETCAR', 'htram', 'hir_town'],
    hir_dome: ['THE DOME', 'hdome', 'hir_park'], hir_cenotaph: ['A QUIET PRAYER', 'cenot', 'hir_park'], hir_crane: ['A PAPER CRANE', 'orizuru', 'hir_park'], hir_bell: ['THE PEACE BELL', 'pbell', 'hir_park'],
    miy_float: ['THE FLOATING TORII', 'otorii', 'miyajima'], miy_walk: ['WALKED TO THE TORII', 'steps', 'miyajima'], miy_shrine: ['ITSUKUSHIMA SHRINE', 'mshrine', 'miyajima'], miy_manju: ['MOMIJI MANJU', 'manju', 'miyajima'],
    miy_oyster: ['GRILLED OYSTERS', 'oyster', 'miyajima'], miy_deer: ['ISLAND DEER', 'deer', 'miyajima'], miy_scoop: ['THE GIANT SCOOP', 'scoop', 'miyajima'], miy_pagoda: ['TOYOKUNI PAGODA', 'pagoda', 'miyajima']
  };
  const rnd = Math.random, V = { pets: 0 };
  const boatTo = (label, name, go) => () => rideTo({ label, name, go, spr: SPR.rideSeto, speed: 40, dur: 4.6 });

  // ---------- Hiroshima Station and Hondori ----------
  let TRAM = null;
  MAPS.hir_town = { name: 'HIROSHIMA', sub: 'A CITY OF RIVERS AND STREETCARS', tw: 46, th: 30, music: 'hiroshima',
    zones: [[0, 96, 736, 240, 'HONDORI', 'A COVERED ARCADE'], [0, 240, 736, 330, 'AIOI-DORI', 'STREETCARS EVERY FEW MINUTES'], [0, 0, 736, 480, 'HIROSHIMA', 'A CITY OF RIVERS AND STREETCARS']],
    lay() { tRect(PL, 0, 0, 46, 15); tRect(AS, 0, 15, 46, 19.5); tRect(PV, 0, 19.5, 46, 30); },
    deco() {
      const g = M.ground.g; roofs(0, 0, 736, 96);
      // the arcade: tiled floor, shop fronts on the north side, and a glass roof drawn over it all (see over())
      for (let x = 0; x < 736; x += 32) for (let y = 160; y < 240; y += 16) R(g, x + ((y / 16) & 1) * 16, y, 16, 16, 'rgba(255,240,220,0.18)');
      tower(80, 152, 96, 92, { c: '#e8a040', sign: 'OKONOMIMURA', sc: '#c8382e', vs: 6, vc: '#ffd84a', to: 'h_okono', lab: 'OKONOMIMURA', lit: 0.5 });
      house(180, 152, 58, 28, { sign: 'LEMON', noren: '#f2c14e', rh: 14, roof: 'awning', roofCol: '#f2c14e' });
      house(250, 152, 58, 28, { sign: 'MOMIJI', noren: '#e0563f', rh: 14, lantern: true });
      tower(334, 152, 76, 70, { c: '#c8382e', sign: 'BASEBALL', sc: '#f4f1e6', st: '#c8382e', vs: 4, vc: '#f4f1e6' });
      house(420, 152, 60, 28, { sign: 'BAKERY', noren: '#c89a6a', rh: 14 }); DAY.konbini(492, 152, 'hiroshima');
      tower(580, 152, 80, 76, { c: '#5a7a9a', sign: 'DEPARTMENT STORE', sc: '#3f7ab0', lit: 0.5 }); DAY.hotel(672, 152, 'hiroshima', 60);
      const lem = npc('teen', 180, 168, { tint: '#f2c14e', lines: ['LEMONS FROM THE ISLANDS IN THE INLAND SEA! THE SUN GROWS THEM SWEET!'] }); lem.spot = { label: 'BUY A LEMONADE', stamp: 'hir_lemon', act: 'hold', fx: 'slurp', lines: ['A TALL GLASS OF LEMONADE FROM THE SETO ISLANDS, SO SOUR YOUR EARS FOLD BACK.', 'THEN SWEET. THEN SOUR AGAIN. THE MAN SAYS THAT IS HOW YOU KNOW IT IS REAL.'] };
      npc('salary', 334, 172, { tint: '#c8382e', lines: ['THE BASEBALL TEAM IS RED, THE FANS ARE RED, THE CITY GOES RED IN SUMMER.', 'WE HAVE NOT WON SINCE... DO NOT ASK WHEN WE LAST WON.'] }); npc('granny', 250, 168, { lines: ['THE MAPLE CAKES COME FROM MIYAJIMA. TAKE THE FERRY AND EAT THEM HOT.'] });
      for (let x = 24; x < 736; x += 64) prop('lamp', x, 236, 2);
      // the tram street
      for (const y of [272, 284, 296, 308]) { R(g, 0, y, 736, 1, '#8a8496'); R(g, 0, y, 736, U, '#c8c0d4'); } for (let x = 6; x < 736; x += 14) R(g, x, 289.5, 7, 1, '#e8e4f0');
      TRAM = PLACES.passer({ y: 284, cars: [SPR.tramA, SPR.tramB], period: 16, speed: 64, dir: 0, bell: 'ding', band: 10 }); PLACES.passer({ y: 302, cars: [SPR.tramA], period: 22, speed: 58, dir: 0, off: 9, bell: 'ding', band: 7 });
      stampSpot('hir_tram', 200, 330, 'TAKE A PHOTO', 'snap', ['A STREETCAR GLIDES PAST, BELL RINGING, SOME OF THEM NEW, SOME OF THEM SIXTY YEARS OLD.', 'HIROSHIMA KEPT ITS TRAMS WHEN OTHER CITIES PULLED THEM UP. SOME RAN AGAIN ONLY THREE DAYS AFTER THE BOMB.'], 15, { frame: [100, 240, 200, 100] });
      // the station, the shinkansen, and the train and ferry to Miyajima
      station(420, 450, 'HIROSHIMA'); shinkansen(524, 450); for (const x of [190, 260, 640]) prop('vend', x, 446, 6); prop('bench', 110, 400, 9); prop('bench', 680, 400, 9);
      prop('busstop', 300, 450, 2); M.SPOTS.push({ x: 300, y: 457, r: 14, label: 'JR AND FERRY TO MIYAJIMA', fn: boatTo('JR AND FERRY TO', 'MIYAJIMA', ['miyajima', 836, 400, 'd']) });
      npc('office', 360, 410, { lines: ['THE STREETCAR GOES TO THE PEACE PARK. THE TRAIN AND THE FERRY GO TO MIYAJIMA.', 'THE BOAT FROM THE PARK GOES THERE TOO. IT IS THE PRETTIEST WAY.'] }); npc('kid', 600, 370, { rad: 30, lines: ['I FOLDED A THOUSAND CRANES WITH MY CLASS. IT TOOK ALL TERM.'] });
      npc('tourist', 120, 350, { rad: 24, lines: ['IN OSAKA THEY MIX OKONOMIYAKI. HERE THEY LAYER IT. PEOPLE ARGUE ABOUT THIS.'] }); M.ACT.push({ cat: true, x: 700, y: 360, k: 1 });
      crowd(7, 20, 196, 716, 196, 12); crowd(5, 716, 220, 20, 220, 6); crowd(5, 20, 330, 716, 330, 6); crowd(4, 20, 380, 716, 380, 10);
      bottomRow(57); M.LIGHTS = [];
    },
    // the arcade's glass roof: arches and a pale tint over the covered street
    over(cx, cy) { const y0 = 100 - cy, y1 = 240 - cy; if (y1 < 0 || y0 > H) return; ctx.globalAlpha = 0.07; R(ctx, 0, y0 + 50, W, y1 - y0 - 50, '#fff8e8'); ctx.globalAlpha = 0.5; for (let x = -(cx % 64); x < W; x += 64) { R(ctx, x, y0 + 46, 2, y1 - y0 - 46, '#c8c0b4'); } R(ctx, 0, y0 + 46, W, 2, '#c8c0b4'); ctx.globalAlpha = 1; }
  };
  const tramShot = MAPS.hir_town.deco; MAPS.hir_town.deco = function () { tramShot(); const sp = M.SPOTS.find(s => s.stamp === 'hir_tram'), st = Object.assign({}, sp); delete sp.act; sp.fn = () => { const s = TRAM && TRAM.span(); if (!s || s[1] < 60 || s[0] > 340) { Snd.fx('talk'); dialog(['NO STREETCAR JUST NOW. ONE COMES EVERY FEW MINUTES.', 'LISTEN FOR ITS BELL.']); return; } G.state = 'event'; G.ev = { sp: st, t: 0 }; pl.mv = false; pl.dir = 'u'; }; };
  MAPS.h_okono = { indoor: 1, name: 'OKONOMIMURA - 2F', music: 'hiroshima', deco() {
    room({ wall: '#e8c8a0', floor: 'tile', t1: '#f4ece0', t2: '#e8dcc8', mat: '#c8382e', art: (g, r) => { wallShelf(g, 20, 70, ['#c8382e', '#f2c14e', '#5aa85a', '#f4f1e6'], r); poster(g, 104, 10, 112, 16, '#c8382e', 'HIROSHIMA STYLE'); for (const x of [240, 270, 300]) chochin(g, x, 10, '#e0452f'); } });
    fur('counter', 160, 96, 220, '#3a3a4e'); for (let x = 62; x <= 258; x += 28) fur('stool', x, 110, '#c8382e');
    const k = npc('chef', 160, 74, { lines: ['WANT TO BUILD ONE?'] }); k.spot = { label: 'BUILD AN OKONOMIYAKI', mini: 'layers', stamp: 'hir_okono' };
    npc('chef', 230, 74, { dir: 'l', lines: ['CREPE, CABBAGE, SPROUTS, PORK, NOODLES, EGG. IN THAT ORDER. ALWAYS.'] }); eaters([90, 118, 202, 230], 108, ['THE NOODLES ARE THE BEST BIT. DO NOT TELL THE CABBAGE.', 'I EAT IT RIGHT OFF THE GRILL WITH A LITTLE SPATULA. IT IS THE ONLY WAY.', 'TWENTY-FIVE SHOPS ON THREE FLOORS. I AM WORKING MY WAY ROUND.', 'MORE SAUCE. ALWAYS MORE SAUCE.']);
  } };

  // ---------- Peace Memorial Park ----------
  let ring = -9;
  MAPS.hir_park = { name: 'PEACE MEMORIAL PARK', sub: 'A PLACE TO REMEMBER, AND TO HOPE', tw: 50, th: 35, music: 'hiroshima',
    zones: [[592, 80, 800, 300, 'THE ATOMIC BOMB DOME', 'KEPT AS IT WAS LEFT'], [0, 0, 800, 80, 'AIOI-DORI', 'THE TRAM STREET'], [0, 0, 800, 560, 'PEACE MEMORIAL PARK', 'A PLACE TO REMEMBER, AND TO HOPE']],
    lay() {
      tRect(GR, 0, 0, 50, 35); tRect(WA, 0, 0, 3, 35); tRect(WA, 33, 0, 37, 35); tRect(PV, 37, 5, 50, 35); tRect(GR, 39, 7, 48.5, 17);
      tRect(AS, 0, 1.5, 50, 4); tRect(PV, 0, 0, 50, 1.5); tRect(PV, 3, 4, 33, 5);
      tRect(PV, 17.5, 5, 20, 35); tRect(PV, 3, 14.75, 33, 15.75); tRect(PV, 14, 18, 23.5, 21.5); tRect(WA, 15.5, 18.6, 22, 20.9); tRect(PV, 13, 23, 24.5, 27.5);
      tRoad(DT, [[4, 10], [10, 12.5], [17.5, 12.5]], 0.5, GR); tRoad(DT, [[20, 10], [26, 11], [32.5, 9]], 0.5, GR); tRoad(DT, [[20, 30], [27, 31], [32.5, 29]], 0.5, GR); tRoad(DT, [[3, 25], [10, 26], [13, 25]], 0.5, GR);
    },
    deco() {
      const g = M.ground.g;
      // the tram street along the top, over the rivers on Aioi bridge
      for (const y of [36, 48]) { R(g, 0, y, 800, 1, '#8a8496'); R(g, 0, y, 800, U, '#c8c0d4'); } for (const [a, b] of [[0, 48], [528, 592]]) { R(g, a, 22, b - a, 3, '#8a8496'); R(g, a, 22, b - a, 1, '#c8c0d4'); R(g, a, 64, b - a, 3, '#8a8496'); R(g, a, 64, b - a, 1, '#c8c0d4'); }
      PLACES.passer({ y: 42, cars: [SPR.tramA, SPR.tramB], period: 18, speed: 60, dir: 0, bell: 'ding', band: 10 });
      prop('busstop', 680, 78, 2); M.SPOTS.push({ x: 680, y: 85, r: 14, label: 'TRAM', train: 1 }); M.st = [680, 98];
      // the Dome, kept as it was left, behind a low fence
      put(SPR.hdome, 690, 230, 80, 138); block(616, 196, 764, 230); for (let x = 618; x < 768; x += 8) { R(g, x, 236, 1.5, 6, '#6b6478'); } R(g, 616, 237, 152, 1, '#8a8496'); block(612, 232, 770, 240);
      stampSpot('hir_dome', 500, 214, 'LOOK ACROSS THE RIVER', 'snap', ['THE DOME OF THE OLD EXHIBITION HALL, ITS STEEL BARE, ITS WALLS BROKEN, JUST AS THE BLAST LEFT IT ON 6 AUGUST 1945.', 'THE CITY KEPT IT, SO NOBODY WOULD FORGET. EVERYTHING AROUND IT GREW BACK GREEN.'], 18, { frame: [600, 70, 180, 180] });
      npc('granny', 470, 250, { rad: 16, lines: ['MY MOTHER WAS A GIRL HERE THEN. SHE LIVED TO NINETY-ONE.', 'SHE SAID THE BEST THING ANYONE CAN DO HERE IS COME, AND REMEMBER, AND GO HOME AND BE KIND.'] });
      // the children's monument and its cranes
      put(SPR.cmonument, 200, 206, 22, 80); block(186, 198, 214, 206); for (const [x, y] of [[150, 214], [250, 214], [150, 182], [250, 182]]) { put(SPR.cranebooth, x, y, 21, 29); block(x - 20, y - 8, x + 20, y); }
      M.SPOTS.push({ x: 200, y: 224, r: 15, label: 'FOLD A PAPER CRANE', mini: 'orizuru', stamp: 'hir_crane' });
      npc('kid', 230, 236, { rad: 16, tint: '#f06a8c', lines: ['SADAKO WAS TWELVE. SHE FOLDED CRANES IN HOSPITAL TO WISH FOR GETTING WELL.', 'NOW CHILDREN EVERYWHERE SEND CRANES HERE. MILLIONS. SHE IS THE GIRL ON TOP.'] });
      // the peace bell
      put(SPR.pbellH, 420, 198, 23, 45); block(400, 190, 440, 198);
      M.ACT.push({ x: 420, y: 199, sayT: 0, draw(e, x, y) { const a = G.t - ring < 1.2 ? Math.sin((G.t - ring) * 9) * (1.2 - (G.t - ring)) * 4 : 0; R(ctx, x + 8 + a, y - 24, 10, 3, '#8a6448'); R(ctx, x + 8 + a, y - 24, 10, 1, '#b8905a'); line1(ctx, x + 12, y - 40, x + 12 + a, y - 24, '#6b6478'); line1(ctx, x + 16, y - 40, x + 16 + a, y - 24, '#6b6478'); } });
      M.SPOTS.push({ x: 420, y: 210, r: 14, label: 'RING THE BELL', stamp: 'hir_bell', fn: () => { ring = G.t; Snd.fx('bell'); setTimeout(() => Snd.fx('bell'), 1500); pl.dir = 'u'; dialog(['YOU SWING THE LOG. THE BELL SOUNDS LOW AND LONG, AND THE PARK GOES QUIET TO LISTEN.', 'THERE IS NO MAP OF THE WORLD ON ITS SIDE WITH BORDERS. THAT WAS ON PURPOSE.'], () => award('hir_bell')); } });
      // the flame, the pond and the cenotaph, on the line to the Dome
      put(SPR.hflame, 300, 300, 15, 15); block(288, 292, 312, 300); M.ACT.push({ x: 300, y: 300.5, sayT: 0, draw(e, x, y) { if (x < -20 || x > W + 20) return; const t = G.t; for (let k = 0; k < 7; k++) { const h = 6 + Math.sin(t * 9 + k * 1.7) * 2 + (k % 3), fx = x - 4 + k * 1.3 + Math.sin(t * 6 + k) * 0.6; R(ctx, fx, y - 16 - h, 1.3, h, k % 2 ? '#ffb040' : '#ff6a2a'); p1(ctx, fx, y - 16 - h, '#fff0a0'); } ctx.globalAlpha = 0.2 + Math.sin(t * 7) * 0.05; disc(ctx, x, y - 20, 9, '#ffb060'); ctx.globalAlpha = 1; } });
      M.LIGHTS.push([300, 282, 22, '#ffb060']);
      M.SPOTS.push({ x: 300, y: 344, r: 12, label: 'READ', lines: ['THE FLAME OF PEACE HAS BURNED SINCE 1964.', 'IT WILL BE PUT OUT ON THE DAY THE LAST NUCLEAR WEAPON IN THE WORLD IS GONE.'] });
      put(SPR.cenotaph, 300, 404, 31, 33); block(276, 396, 324, 404);
      M.SPOTS.push({ x: 300, y: 416, r: 15, label: 'OFFER A PRAYER', stamp: 'hir_cenotaph', act: 'pray', lines: ['YOU BOW YOUR HEAD. UNDER THE ARCH, A STONE CHEST HOLDS THE NAMES OF THE PEOPLE WHO DIED.', 'THE WORDS ON IT SAY: LET ALL THE SOULS HERE REST IN PEACE, FOR WE SHALL NOT REPEAT THE EVIL.'] });
      for (const x of [240, 360]) { prop('bench', x, 440, 9); } for (const [x, y] of [[248, 360], [352, 360]]) { R(g, x - 10, y, 20, 8, '#f8f4ee'); for (let k = 0; k < 6; k++) disc(g, x - 8 + k * 3.2, y + 3, 1.4, ['#f06a8c', '#f2c14e', '#ffffff', '#c890d8'][k % 4]); }
      // the museum along the bottom, standing on its pillars
      put(SPR.museum, 300, 556, 130, 50); block(170, 532, 430, 556);
      M.SPOTS.push({ x: 300, y: 500, r: 14, label: 'READ', lines: ['THE PEACE MEMORIAL MUSEUM. INSIDE: A WATCH STOPPED AT 8:15, A CHILD\'S TRICYCLE, A SHADOW ON A STONE STEP.', 'PEOPLE COME OUT VERY QUIET. MANY OF THEM GO STRAIGHT TO FOLD A CRANE.'] });
      // the river boat to Miyajima
      R(g, 504, 452, 24, 40, '#a8805a'); for (let y = 452; y < 492; y += 4) R(g, 504, y, 24, U, '#8a6448'); block(504, 452, 528, 492, 0); PLACES.bobber(SPR.cruise, 560, 480, { a: 0.6 });
      M.SPOTS.push({ x: 514, y: 470, r: 15, label: 'BOAT TO MIYAJIMA', fn: boatTo('RIVER BOAT TO', 'MIYAJIMA', ['miyajima', 60, 400, 'd']) });
      bridge(528, 292, 592, 312, '#8a8496', '#b8b0c0');
      // trees, benches, and people walking slowly
      for (const [x, y] of [[80, 120], [130, 300], [80, 380], [110, 470], [420, 290], [460, 380], [480, 120], [380, 470], [70, 200], [460, 470], [160, 420], [440, 130]]) plant(hsh(x, y) < 0.35 ? 'sakura' : hsh(x, y) < 0.7 ? 'green' : 'ginkgo', x, y, 1);
      for (const [x, y] of [[120, 252], [460, 252], [200, 120], [400, 120]]) prop('bench', x, y, 9);
      npc('monk', 340, 430, { rad: 16, lines: ['PEOPLE ASK WHAT THEY SHOULD FEEL HERE. I SAY: WHATEVER YOU FEEL IS RIGHT.'] }); npc('tourist', 280, 180, { rad: 20, lines: ['I CAME FROM VERY FAR AWAY TO STAND HERE FOR FIVE MINUTES. IT WAS WORTH IT.'] });
      npc('office', 680, 300, { rad: 20, lines: ['THEY SAID NOTHING WOULD GROW HERE FOR SEVENTY-FIVE YEARS.', 'THE NEXT SPRING THERE WERE FLOWERS. THE OLEANDER IS THE CITY\'S FLOWER NOW.'] }); npc('salary', 720, 420, { lines: ['THE TRAM RUNS RIGHT PAST. PEOPLE GO TO WORK HERE, EAT LUNCH HERE. IT IS A CITY.'] });
      M.ACT.push({ cat: true, x: 100, y: 330, k: 2 }); crowd(4, 300, 120, 300, 520, 6); crowd(4, 60, 244, 520, 244, 6); crowd(4, 620, 330, 780, 500, 30); crowd(5, 20, 72, 780, 72, 4);
    } };

  // ---------- Miyajima ----------
  // the tide on the shared clock: 0 is the lowest ebb, 1 the highest flood; the water's edge over the sand follows it
  const FL = [184, 712, 88, 400], FT = []; let TWC = null; // the tidal flats: x0, x1, y0, y1; FT: where the sand starts in each column
  const tide = () => 0.5 + 0.5 * Math.cos(worldTime() / 120 * 6.2832), edgeY = (x, L) => FL[2] - 20 + (FL[3] - FL[2] + 6) * L + Math.sin(x / 37 + worldTime() * 0.6) * 3;
  const floorTop = x => x >= 400 && x < 496 ? 336 : x >= 540 && x < 600 ? 340 : FL[3] + 2; // the shrine's floors, which the sea flows under
  const tideName = () => { const L = tide(), up = Math.sin(worldTime() / 120 * 6.2832) < 0; return L > 0.8 ? 'HIGH TIDE' : L < 0.2 ? 'LOW TIDE' : up ? 'TIDE COMING IN' : 'TIDE GOING OUT'; };
  function tideSet() { // which cells of the flats are under water now; the water pushes you gently back to the shore
    const L = tide(); let row = Math.floor(edgeY(FL[0], L) / 4); if (M.tideRow === row) return; M.tideRow = row; const S0 = M.tideBase;
    for (let j = Math.floor(FL[2] / 4); j < Math.ceil(FL[3] / 4); j++) for (let i = Math.floor(FL[0] / 4); i < Math.ceil(FL[1] / 4); i++) { const k = j * M.SW + i, x = i * 4 + 2; if (terr(x, j * 4 + 2) !== DT) continue; M.SOL[k] = S0[k] || (j * 4 + 2 < edgeY(x, L) ? 1 : 0); }
  }
  function deerUse(d) { d.fl = pl.x < d.x ? 1 : 0; d.st = 'bow'; d.t = 1.3; Snd.fx('ui'); say(d, ['(BOWS)', '(SNIFFS YOUR BAG FOR MAPLE CAKES)', '(LOOKS OUT TO SEA, THEN AT YOU)', '(NUDGES YOUR HAND)'][rnd() * 4 | 0]); G.fx.push({ x: d.x, y: d.y - 14, t: 0, icon: 'heart' });
    if (!d.petted) { d.petted = 1; V.pets++; if (V.pets >= 2 && !G.stamps.miy_deer) dialog(['THE ISLAND DEER ARE SMALLER THAN NARA\'S, AND SHYER. THEY COME DOWN TO THE SHORE AT LOW TIDE.', 'ON MIYAJIMA THEY ARE MESSENGERS OF THE GODS TOO. THEY ALSO EAT MAPS.'], () => award('miy_deer')); } }
  function deer(x, y, male) { const r = RNG(x * 5 + y), inFlat = (px, py) => px > FL[0] && px < FL[1] && py < FL[3] + 4;
    M.ACT.push({ deer: 1, x, y, hx: x, hy: y, male: male ? 1 : 0, fl: r() < 0.5 ? 1 : 0, st: 'idle', t: r() * 4, graze: r() < 0.5, mv: false, wt: r() * 3, rnd: r, sayT: 0, use: deerUse, label: () => 'PET',
      upd(d, dt) { d.t -= dt; if (d.st === 'bow') { d.mv = false; if (d.t <= 0) { d.st = 'idle'; d.t = 1 + d.rnd() * 2; } return; }
        if (d.st === 'idle') { d.mv = false; if (d.t <= 0) { const a = d.rnd() * 6.283, rr = 10 + d.rnd() * 40; d.tx = d.hx + Math.cos(a) * rr; d.ty = d.hy + Math.sin(a) * rr * 0.5; if (inFlat(d.tx, d.ty)) { d.t = 1; return; } d.st = 'walk'; d.t = 4; } return; }
        const tx = d.tx - d.x, ty = d.ty - d.y, n = Math.hypot(tx, ty); if (n < 2 || d.t <= 0 || !step(d, tx / n * 14 * dt, ty / n * 14 * dt)) { d.st = 'idle'; d.mv = false; d.t = 1.5 + d.rnd() * 5; d.graze = d.rnd() < 0.5; return; } d.mv = true; d.wt += dt; if (Math.abs(tx) > 1) d.fl = tx < 0 ? 1 : 0; },
      draw(d, sx, sy) { const pose = d.st === 'bow' ? 'bow' : d.graze && !d.mv ? 'eat' : d.mv ? 'walk' + Math.floor(d.wt * 7) % 4 : 'idle'; ell(ctx, sx, sy, 8, 2, 'rgba(22,30,50,0.3)'); ctx.drawImage(SPR.deer[d.male][pose][d.fl], snap(sx - 14), snap(sy - 20)); } }); }
  MAPS.miyajima = { name: 'MIYAJIMA', sub: 'THE ISLAND WHERE THE SHRINE FLOATS', tw: 56, th: 44, music: 'hiroshima', sand: 'grey', lookUp: [200, 420],
    zones: [[200, 60, 700, 330, 'THE GREAT TORII', 'OUT IN THE BAY'], [256, 330, 640, 440, 'ITSUKUSHIMA SHRINE', 'BUILT OVER THE SEA'], [0, 480, 896, 580, 'OMOTESANDO', 'MAPLE CAKES AND OYSTERS'], [0, 0, 896, 704, 'MIYAJIMA', 'THE ISLAND WHERE THE SHRINE FLOATS']],
    lay() {
      tRect(WA, 0, 0, 56, 26); tOval(DT, 28, 15.6, 16.2, 10.2); tOval(DT, 28, 22, 20, 4); tRect(DT, 0, 23.75, 56, 27.5); tRect(PL, 16, 24.5, 40, 27.5); tRect(PL, 33.75, 21.25, 37.5, 24.5); tRect(PL, 25, 21, 31, 24.5);
      tRect(PV, 0, 27.5, 56, 36); tRect(FR, 0, 36, 56, 44); tRect(GR, 5, 36, 14, 41.5); tRoad(DT, [[9.5, 36], [9.5, 38]], 0.8, GR); tRect(GR, 44, 36, 54, 43); tRoad(WA, [[49.5, 36.5], [48.5, 39.5], [50, 43.5]], 0.45, GR);
      tRect(PL, 51, 21, 53.5, 24); tRect(PL, 2.5, 21.5, 5, 24);
    },
    tick() { tideSet(); if (G.state !== 'play') return; const L = tide(); if (pl.x > FL[0] && pl.x < FL[1] && pl.y < FL[3] && terr(pl.x, pl.y) === DT && pl.y - 3 < edgeY(pl.x, L)) { pl.y = Math.min(FL[3] + 8, edgeY(pl.x, L) + 7); if (!M.wet || G.t - M.wet > 6) { M.wet = G.t; PLACES.SND.wave(0.6); NET.say('THE TIDE IS COMING IN. BACK TO THE SHORE!', 3); } } },
    deco() {
      const g = M.ground.g; FT.length = 0; for (let x = FL[0]; x < FL[1]; x += 2) { let f = null; for (let y = 60; y < 420; y++) if (terr(x, y) === DT) { f = y; break; } FT.push(f); }
      // the sea that floods the sand is the same sea as the rest of the bay: tiles of it, copied from the open water
      TWC = mk(FL[1] - FL[0], FL[3] - FL[2] + 40); { const w = TWC.width, h = TWC.height, im = TWC.g.createImageData(w, h), px = new Uint32Array(im.data.buffer), C = ['#3e92c2', '#4aa0ce', '#58aed8'].map(c32), X0 = FL[0] * S, Y0 = (FL[2] - 20) * S;
        for (let Y = 0; Y < h; Y++) for (let X = 0; X < w; X++) { const n = vn((X + X0) / 34, (Y + Y0) / 12) + (hsh(X + X0, Y + Y0) - 0.5) * 0.06; px[Y * w + X] = C[n < 0.42 ? 0 : n < 0.62 ? 1 : 2]; } TWC.g.putImageData(im, 0, 0); } // painted exactly like the open sea around it, so the two meet without a seam
      // the tide: water over the sand up to its edge, foam along it, and the torii's reflection when it stands in the sea
      M.ACT.push({ x: 0, y: -1e6 + 2, sayT: 0, always: 1, draw(e, x, y) { const cx = e.x - x, cy = e.y - y, L = tide(), x0 = Math.max(FL[0], cx), x1 = Math.min(FL[1], cx + W);
        const cw = G.lowFx ? 4 : 2; for (let wx = x0 - (x0 % cw); wx < x1; wx += cw) { const ft = FT[(wx - FL[0]) >> 1]; if (ft == null) continue; const ey = edgeY(wx, L); if (ey <= ft) continue; const top = ft - 2 - cy, bot = Math.min(ey, floorTop(wx)) - cy; if (bot < 0 || top > H || bot <= top) continue;
          const fl = ey > floorTop(wx), sy = top + cy - (FL[2] - 20), hh = Math.max(0, bot - top - (fl ? 0 : 10)); ctx.globalAlpha = 1; if (hh > 0) ctx.drawImage(TWC, wx - FL[0], sy, cw, hh, wx - cx, top, cw, hh); if (fl) continue; /* under the shrine's floors the sea just meets the boards */ ctx.globalAlpha = 0.7; R(ctx, wx - cx, bot - 10, cw, 8, '#6ab8c8'); ctx.globalAlpha = 0.5; R(ctx, wx - cx, bot - 2, cw, 2, '#a8e0e8'); ctx.globalAlpha = 0.9; R(ctx, wx - cx, bot - 1 + Math.sin(wx * 0.3 + G.t * 3) * 0.6, cw, 1, '#ffffff');
          if ((wx + (G.t * 8 | 0)) % 22 < 6) { ctx.globalAlpha = 0.35; R(ctx, wx - cx, bot - 18 - (wx % 7) * 4, 2, U, '#ffffff'); } }
        ctx.globalAlpha = 1;
        if (L > 0.35) { const s = SPR.otoriiR, tx = 448 - cx - s.lw / 2, ty = 176 - cy; if (tx > -s.lw && tx < W && ty < H && ty + s.lh > 0 && edgeY(448, L) > 180) { ctx.globalAlpha = 0.16 * Math.min(1, (L - 0.35) * 3); for (let r = 0; r < s.lh * 0.6; r += 1) { const sr = Math.floor(r / 0.6); if (ty + r + cy > edgeY(448, L) - 4) break; ctx.drawImage(s, 0, sr, s.lw, 1, snap(tx + Math.sin(G.t * 2 + r * 0.5) * 0.8), ty + r, s.lw, 1); } ctx.globalAlpha = 1; } } } });
      put(SPR.otorii, 448, 176, 60, 99); block(406, 168, 420, 176); block(476, 168, 490, 176); block(394, 170, 402, 176); block(494, 170, 502, 176);
      M.SPOTS.push({ x: 448, y: 190, r: 15, label: 'TOUCH THE TORII', stamp: 'miy_walk', fn: () => dialog(['YOU WALKED HERE ON THE SEA FLOOR. THE GREAT PILLARS ARE CAMPHOR TRUNKS, CRUSTED WITH BARNACLES, AND COINS ARE PUSHED INTO EVERY CRACK FOR LUCK.', 'NOTHING HOLDS IT DOWN. IT STANDS ON ITS OWN WEIGHT, AND HAS FOR A HUNDRED AND FIFTY YEARS.'], () => award('miy_walk')) });
      for (const [x, y] of [[320, 220], [560, 250], [380, 300], [620, 160], [260, 140]]) { put(SPR.rock[(x + y) % 3], x, y, 11, 13); block(x - 6, y - 3, x + 6, y); }
      // the shrine: vermilion corridors on posts over the sand, the main hall, and a stage facing the torii
      for (let x = 256; x < 640; x += 3) { R(g, x, 392, 3, 48, (x / 3) % 2 ? '#b8704a' : '#c47a50'); } for (const [a, c, b, d] of [[540, 340, 600, 392], [400, 336, 496, 392]]) for (let x = a; x < b; x += 3) R(g, x, c, 3, d - c, (x / 3) % 2 ? '#b8704a' : '#c47a50');
      R(g, 256, 438, 384, 2, '#6a3a28'); for (let x = 258; x < 640; x += 16) R(g, x, 440, 3, 6, '#c0442f');
      put(SPR.honden, 448, 372, 70, 74); block(392, 336, 504, 372);
      M.SPOTS.push({ x: 448, y: 386, r: 15, label: 'PRAY', stamp: 'miy_shrine', act: 'bow', lines: ['TWO BOWS, TWO CLAPS, ONE BOW. UNDER THE FLOOR YOU CAN HEAR THE SEA MOVING.', 'THE SHRINE WAS BUILT ON THE WATER BECAUSE THE WHOLE ISLAND WAS HOLY. NOBODY WANTED TO DIG IT UP.'] });
      for (const [a, b] of [[256, 392], [496, 540], [600, 640]]) for (let x = a; x < b; x += 32) put(SPR.srail, x + 16, 395, 16, 7); block(256, 388, 392, 395); block(496, 388, 540, 395); block(600, 388, 640, 395);
      for (const x of [540, 600]) { put(SPR.srailV, x, 392, 2, 52); block(x - 2, 340, x + 2, 392); }
      stampSpot('miy_float', 570, 352, 'LOOK OUT TO THE TORII', 'snap', ['THE TORII STANDS IN THE SEA, AND THE SHRINE FLOATS AROUND YOU. THE WHOLE THING SEEMS TO DRIFT ON THE WATER.', 'IT HAS LOOKED LIKE THIS FOR EIGHT HUNDRED YEARS, TWICE A DAY, WHEN THE TIDE IS IN.'], 15, { frame: [360, 60, 180, 160] });
      // the shore promenade with its stone lanterns, the deer, and the piers
      for (let x = 40; x < 896; x += 64) if (x < 240 || x > 660) prop('lantern', x, 452, 4);
      R(g, 816, 336, 40, 48, '#a8805a'); for (let y = 336; y < 384; y += 4) R(g, 816, y, 40, U, '#8a6448'); PLACES.bobber(SPR.ferry, 836, 330, { a: 0.6, f: 1 });
      M.SPOTS.push({ x: 836, y: 392, r: 16, label: 'FERRY TO HIROSHIMA', fn: boatTo('FERRY AND JR TO', 'HIROSHIMA STATION', ['hir_town', 300, 470, 'u']) }); M.st = [836, 410];
      R(g, 40, 344, 40, 40, '#a8805a'); for (let y = 344; y < 384; y += 4) R(g, 40, y, 40, U, '#8a6448'); PLACES.bobber(SPR.cruise, 60, 334, { a: 0.6 });
      M.SPOTS.push({ x: 60, y: 392, r: 16, label: 'BOAT TO PEACE PARK', fn: boatTo('RIVER BOAT TO', 'PEACE PARK', ['hir_park', 514, 478, 'l']) });
      PLACES.shore(300, 420, { period: 8, reach: 6 });
      // Omotesando: the shops, with lanes down to the shore between them
      const SH = [[120, 'MOMIJI MANJU', '#e0563f', 'm_manju'], [200, 'ANAGO', '#8a5a3a'], [280, 'OYSTERS', '#3f7ab0'], [360, 'SCOOPS', '#c89a6a'], [440, 'GIFTS', '#5a8a5a'], [616, 'CAFE', '#6a4a38'], [696, 'CRAFTS', '#8a6aff'], [776, 'SAKE', '#3d5a80']];
      for (const [x, s, c, to] of SH) house(x, 524, 64, 28, { sign: s, noren: c, rh: 14, lantern: x % 160 === 120 ? true : null, to });
      const oy = npc('chef', 280, 540, { lines: ['OYSTERS FROM THE BAY, GRILLED IN THE SHELL!'] }); oy.spot = { label: 'TRY A GRILLED OYSTER', stamp: 'miy_oyster', act: 'hold', fx: 'slurp', lines: ['A FAT OYSTER, GRILLED IN ITS SHELL UNTIL IT HISSES, WITH A DROP OF PONZU.', 'IT TASTES OF THE SEA YOU CAN SEE FROM HERE. THE MAN HANDS YOU A SECOND ONE. FOR LUCK.'] };
      put(SPR.shamoji, 528, 520, 13, 69); block(520, 512, 536, 520); stampSpot('miy_scoop', 528, 538, 'TAKE A PHOTO', 'snap', ['THE WORLD\'S BIGGEST RICE SCOOP. SEVEN METRES OF WOOD, CARVED FROM A TREE TWO HUNDRED AND SEVENTY YEARS OLD.', 'A MONK SAID THE ISLAND SHOULD MAKE SCOOPS. IT HAS MADE THEM EVER SINCE. THIS ONE IS NOT FOR RICE.'], 14);
      npc('granny', 360, 544, { lines: ['A WOODEN SCOOP SCOOPS UP GOOD LUCK. STUDENTS BUY THEM BEFORE EXAMS.'] }); npc('kimono', 650, 500, { rad: 24, tint: '#c8382e', lines: ['COME BACK AT LOW TIDE. YOU CAN WALK RIGHT OUT TO THE TORII.', 'COME BACK AT HIGH TIDE. IT FLOATS. YOU WILL HAVE TO COME BACK TWICE.'] });
      npc('tourist', 160, 470, { rad: 30, lines: ['A DEER ATE MY FERRY TICKET. I AM STAYING FOREVER NOW.'] });
      // the pagoda on its hill, and the maple valley
      put(SPR.pagoda, 150, 640, 52, 130); block(124, 624, 176, 640); put(SPR.torii, 152, 590, 30, 49); block(132, 584, 136, 590); block(168, 584, 172, 590);
      stampSpot('miy_pagoda', 150, 660, 'TAKE A PHOTO', 'snap', ['TOYOKUNI\'S FIVE-STOREY PAGODA, RED AND WHITE ABOVE THE ROOFS OF THE TOWN.', 'FROM UP HERE THE TORII LOOKS LIKE A TOY SOMEBODY LEFT IN THE SEA.'], 14);
      for (const [x, y] of [[730, 620], [800, 640], [840, 610], [760, 670], [830, 680]]) plant('maple', x, y, 1); bridge(760, 618, 800, 632, '#c0442f', '#b8905a'); prop('bench', 724, 660, 9);
      M.SPOTS.push({ x: 760, y: 640, r: 14, label: 'LOOK', lines: ['MOMIJIDANI: MAPLE VALLEY. A STREAM RUNS UNDER RED BRIDGES.', 'THE MAPLE CAKES ON THE STREET ARE SHAPED LIKE THESE LEAVES. NOW YOU KNOW.'] });
      for (const [x, y, m] of [[100, 420], [180, 430, 1], [700, 420], [780, 470, 1], [860, 440], [520, 470], [240, 560], [600, 560, 1], [80, 560], [820, 560]]) deer(x, y, m);
      M.ACT.push({ cat: true, x: 460, y: 470, k: 0 }); crowd(6, 20, 560, 876, 560, 8); crowd(5, 876, 460, 20, 460, 8); crowd(3, 270, 412, 620, 412, 4);
      wild(['green', 'pine', 'maple', 'green2'], 2); M.LIGHTS = [];
      M.tideBase = M.SOL.slice(); M.tideRow = null; tideSet();
    } };
  // the photo of the torii floating only works when the tide is in
  const floatShot = MAPS.miyajima.deco; MAPS.miyajima.deco = function () { floatShot(); const sp = M.SPOTS.find(s => s.stamp === 'miy_float'), st = Object.assign({}, sp); delete sp.act; sp.fn = () => { if (tide() < 0.6) { Snd.fx('talk'); dialog(['THE TIDE IS OUT. THE TORII STANDS ON BARE SAND, AND PEOPLE ARE WALKING ROUND ITS FEET.', 'COME BACK WHEN THE TIDE IS HIGH, AND IT WILL FLOAT. THE NOTE AT THE TOP OF THE SCREEN SAYS WHICH IT IS.']); return; } G.state = 'event'; G.ev = { sp: st, t: 0 }; pl.mv = false; pl.dir = 'u'; }; };
  MAPS.m_manju = { indoor: 1, name: 'MOMIJI MANJU', music: 'hiroshima', deco() {
    room({ wall: '#f4e0c0', floor: 'wood', mat: '#e0563f', art: (g, r) => { poster(g, 24, 10, 90, 16, '#e0563f', 'BAKED HERE'); poster(g, 206, 10, 90, 16, '#8a5a3a', 'CUSTARD - BEAN'); for (let k = 0; k < 7; k++) { const x = 136 + k * 8; ell(g, x, 20, 3, 2.5, '#d8902a'); } } });
    fur('belt', 160, 92, 220); const k = npc('chef', 160, 70, { lines: ['WANT TO POUR THE BATTER?'] }); k.spot = { label: 'MAKE MAPLE CAKES', mini: 'manju', stamp: 'miy_manju' };
    npc('granny', 240, 140, { lines: ['THE MACHINE HAS BEEN TURNING SINCE BEFORE I WAS BORN.', 'BEAN PASTE IS THE OLD WAY. CUSTARD IS FOR CHILDREN. I EAT CUSTARD.'] }); npc('kid', 80, 150, { rad: 20, lines: ['THEY ARE BEST HOT. IT IS THE LAW.'] }); fur('table', 70, 170, 2); fur('table', 250, 170, 4);
  } };

  // ---------- folding a paper crane: press the arrow each fold asks for ----------
  const FOLDS = [['u', 'FOLD IT IN HALF'], ['l', 'AND IN HALF AGAIN'], ['d', 'SQUASH IT INTO A SQUARE'], ['r', 'FOLD THE EDGES IN'], ['u', 'LIFT AND PRESS THE PETAL'], ['l', 'TURN IT OVER, SAME AGAIN'], ['u', 'FOLD UP THE NECK AND TAIL'], ['d', 'PULL OUT THE WINGS']];
  const PAPER = ['#e0452f', '#f06a8c', '#3f7ab0', '#f2c14e', '#5aa85a', '#8a6aff'];
  const SHAPES = [[[0, -26], [26, 0], [0, 26], [-26, 0]], [[-26, 0], [26, 0], [0, 26]], [[0, 0], [26, 0], [0, 26]], [[0, -18], [13, 0], [0, 18], [-13, 0]], [[0, -18], [8, 2], [0, 18], [-8, 2]], [[0, -24], [6, 4], [0, 22], [-6, 4]], [[0, -24], [6, 4], [0, 22], [-6, 4]]];
  const ORI = {
    init(m) { m.i = 0; m.c = PAPER[rnd() * PAPER.length | 0]; m.ft = 9; m.miss = 0; m.done = 0; m.msg = ''; m.mt = 0; m.lim = 2.6; },
    update(m, dt) { if (m.mt > 0) m.mt -= dt; m.ft += dt; m.lim -= dt;
      if (m.done) { if (m.t > m.done + 1.8) endMini(true, ['A LITTLE CRANE, WINGS OUT, STANDING ON YOUR PALM.', 'YOU THREAD IT ONTO A GARLAND WITH A THOUSAND OTHERS, FROM A THOUSAND OTHER HANDS. IT IS A WISH FOR PEACE.']); return; }
      const k = KP.u ? 'u' : KP.d ? 'd' : KP.l ? 'l' : KP.r ? 'r' : null;
      if (k) { if (k === FOLDS[m.i][0]) { m.i++; m.ft = 0; m.lim = Math.max(1.4, 2.6 - m.i * 0.12); PLACES.SND.swish(); if (m.i >= FOLDS.length) { m.done = m.t; Snd.fx('yay'); } } else { m.miss++; m.msg = 'THE PAPER CREASES IN THE WRONG PLACE'; m.mt = 1; Snd.fx('land'); m.lim = 2.6; } }
      else if (m.lim <= 0) { m.miss++; m.msg = 'TOO SLOW - SMOOTH IT OUT AND TRY THAT FOLD AGAIN'; m.mt = 1.2; m.lim = 2.6; Snd.fx('talk'); }
      if (m.miss >= 4) endMini(false, ['THE PAPER IS ALL CREASES NOW, SOFT AS CLOTH.', 'THE GIRL NEXT TO YOU HANDS YOU A FRESH SQUARE. "EVERYBODY\'S FIRST ONE IS A BIT SAD," SHE SAYS.']); },
    draw(m) {
      txtC(ctx, 'FOLD A PAPER CRANE', 160, 26, '#c8382e', null, 2); R(ctx, 108, 40, 104, 74, '#f4ead4'); R(ctx, 108, 40, 104, 1, '#ffffff');
      const cx = 160, cy = 78, c = m.c, d = dark(c, 0.3), poly = (pts, col, s) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(cx + x * s, cy + y * s) : ctx.moveTo(cx + x * s, cy + y * s)); ctx.closePath(); ctx.fill(); };
      const st = Math.min(m.i, SHAPES.length - 1), q = Math.min(1, m.ft / 0.3);
      if (m.i >= 7) { // the crane: body, neck, tail, and wings that open at the last fold
        const w = m.i >= 8 ? Math.min(1, m.ft / 0.4) : 0; poly([[-4, 2], [4, 2], [0, 10]], d, 1); poly([[-3, 2], [-22, -18], [-20, -19], [-1, 0]], c, 1); poly([[3, 2], [22, -16], [23, -14], [1, 4]], c, 1); poly([[-22, -18], [-27, -15], [-20, -17]], d, 1);
        poly([[0, 0], [-18 - w * 8, 8 - w * 14], [-6, 6]], lite(c, 0.15), 1); poly([[0, 0], [18 + w * 8, 8 - w * 14], [6, 6]], d, 1);
      } else { if (m.i > 0 && q < 1) { ctx.globalAlpha = 1 - q; poly(SHAPES[m.i - 1], c, 1); ctx.globalAlpha = 1; } poly(SHAPES[st], c, 0.9 + q * 0.1); ctx.globalAlpha = 0.4; poly(SHAPES[st].map(([x, y]) => [x * 0.5, y * 0.5 + 2]), d, 1); ctx.globalAlpha = 1; if (q < 1) { R(ctx, cx - 26, cy - U, 52 * q, 1, '#ffffff'); } }
      if (!m.done) { const [k, s] = FOLDS[m.i], ax = 236, ay = 76, rot = { u: 0, r: 1.5708, d: 3.1416, l: -1.5708 }[k]; ctx.save(); ctx.translate(ax, ay); ctx.rotate(rot); ctx.fillStyle = '#c8382e'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(9, 0); ctx.lineTo(3, 0); ctx.lineTo(3, 10); ctx.lineTo(-3, 10); ctx.lineTo(-3, 0); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill(); ctx.restore();
        R(ctx, 222, 96, 28, 3, '#d9cba8'); R(ctx, 222, 96, 28 * Math.max(0, m.lim) / 2.6, 3, m.lim < 0.8 ? '#c8382e' : '#5aa85a'); txtC(ctx, s, 160, 120, '#3a2e40'); }
      for (let i = 0; i < FOLDS.length; i++) disc(ctx, 128 + i * 9, 132, 2, i < m.i ? m.c : '#d9cba8'); for (let i = 0; i < 4; i++) R(ctx, 70 + i * 6, 130, 4, 4, i < m.miss ? '#c8382e' : '#eadfc4');
      if (m.mt > 0) txtC(ctx, m.msg, 160, 112, '#c8382e'); else if (m.done) txtC(ctx, 'A CRANE!', 160, 112, '#3f9a5a');
    }
  };

  // ---------- Hiroshima okonomiyaki: drop each layer as it slides over the stack; whatever overhangs is trimmed ----------
  const LAYERS = [['CREPE', '#f0d8a0'], ['CABBAGE', '#9ad070'], ['SPROUTS', '#f4f1e6'], ['PORK', '#f0a8a0'], ['NOODLES', '#e8c060'], ['EGG', '#f8d850'], ['SAUCE', '#6a3a24']];
  const LAY = {
    init(m) { m.st = [{ x: 160, w: 64 }]; m.i = 0; m.x = 110; m.v = 46; m.done = 0; m.msg = ''; m.mt = 0; m.drop = null; m.lives = 3; },
    update(m, dt) { if (m.mt > 0) m.mt -= dt; if (m.done) { if (m.t > m.done + 1.4) endMini(true, ['CREPE, CABBAGE, SPROUTS, PORK, NOODLES, EGG, SAUCE. A TOWER, PRESSED FLAT, AND STILL A TOWER.', 'THE COOK CUTS YOU A WEDGE WITH THE LITTLE SPATULA. YOU EAT IT STRAIGHT OFF THE IRON, THE HIROSHIMA WAY.']); return; }
      if (m.drop) { m.drop.y += dt * 120; if (m.drop.y >= 0) { m.drop = null; } return; }
      const top = m.st[m.st.length - 1], w = top.w; m.x += m.v * dt; if (m.x > 160 + 54) { m.x = 160 + 54; m.v = -Math.abs(m.v); } if (m.x < 160 - 54) { m.x = 160 - 54; m.v = Math.abs(m.v); }
      if (KP.a) { const a0 = Math.max(m.x - w / 2, top.x - top.w / 2), a1 = Math.min(m.x + w / 2, top.x + top.w / 2), nw = a1 - a0;
        if (nw < 18) { Snd.fx('land'); m.lives--; m.msg = 'IT SLIDES OFF! TRY THAT LAYER AGAIN'; m.mt = 1; m.x = m.v > 0 ? 160 - 54 : 160 + 54; if (m.lives <= 0) endMini(false, ['THE LAYERS SLIDE OFF THE STACK AND ACROSS THE GRILL. THE COOK CATCHES THEM WITH A SPATULA WITHOUT LOOKING.', 'HE HANDS YOU A FRESH CREPE. "AGAIN. SLOWER."']); return; }
        m.st.push({ x: (a0 + a1) / 2, w: nw }); m.drop = { y: -8 }; m.i++; Snd.fx(nw > w - 3 ? 'pick' : 'munch'); m.msg = nw > w - 3 ? 'PERFECT!' : nw > w * 0.8 ? 'GOOD' : 'A LITTLE TRIMMED'; m.mt = 0.7; m.v = Math.sign(m.v) * (46 + m.i * 9); m.x = m.v > 0 ? 160 - 54 : 160 + 54;
        if (m.i >= LAYERS.length) { m.done = m.t; Snd.fx('yay'); } } },
    draw(m) {
      txtC(ctx, 'HIROSHIMA OKONOMIYAKI', 160, 26, '#c8382e', null, 2); R(ctx, 70, 108, 180, 10, '#2a2a3a'); R(ctx, 70, 108, 180, 1.5, '#5a5a6e'); for (let x = 74; x < 246; x += 6) R(ctx, x, 110, 3, U, '#4a4a5e');
      if (!G.lowFx) for (let k = 0; k < 5; k++) { const x = 90 + k * 34 + Math.sin(G.t * 2 + k) * 3; ctx.globalAlpha = 0.18; R(ctx, x, 60 + ((G.t * 20 + k * 9) % 40), 2, 6, '#ffffff'); } ctx.globalAlpha = 1;
      const layer = (L, x, w, y) => { const [n, c] = LAYERS[L]; R(ctx, x - w / 2, y, w, 6, c); R(ctx, x - w / 2, y, w, 1, lite(c, 0.4)); R(ctx, x - w / 2, y + 5, w, 1, dark(c, 0.3));
        if (n === 'CABBAGE') for (let k = 0; k < w - 2; k += 3) R(ctx, x - w / 2 + k + 1, y + 1 + (k % 2), 2, 1, '#5aa85a'); else if (n === 'SPROUTS') for (let k = 0; k < w - 2; k += 4) R(ctx, x - w / 2 + k + 1, y + 2, 3, U, '#d8d4c4'); else if (n === 'PORK') for (let k = 0; k < w - 4; k += 8) R(ctx, x - w / 2 + k + 2, y + 1.5, 5, 2, '#f8d0c8');
        else if (n === 'NOODLES') for (let k = 0; k < w - 2; k += 2) R(ctx, x - w / 2 + k, y + 2 + Math.sin(k) * 1, 2, 1, '#c89830'); else if (n === 'EGG') { disc(ctx, x, y + 3, 3, '#f8f4ea'); } else if (n === 'SAUCE') for (let k = 0; k < w - 4; k += 4) R(ctx, x - w / 2 + k + 1, y + 1 + (k / 4 % 2) * 2, 3, U, '#f8f4ea'); };
      const base = 102; m.st.forEach((s, i) => { if (i === 0) { R(ctx, s.x - s.w / 2 - 2, base, s.w + 4, 6, '#3a3a4e'); return; } const y = base - i * 6 + (i === m.st.length - 1 && m.drop ? m.drop.y : 0); layer(i - 1, s.x, s.w, y); });
      if (!m.done && !m.drop) { const top = m.st[m.st.length - 1], y = base - (m.st.length) * 6 - 12; layer(m.i, m.x, top.w, y); txtC(ctx, LAYERS[m.i][0], m.x, y - 9, '#3a2e40'); }
      for (let i = 0; i < LAYERS.length; i++) disc(ctx, 130 + i * 10, 124, 2.5, i < m.i ? LAYERS[i][1] : '#d9cba8'); for (let i = 0; i < 3; i++) R(ctx, 236 + i * 7, 22, 5, 3, i < m.lives ? '#e8c060' : '#eadfc4');
      txtC(ctx, m.done ? 'DONE! SAUCE AND MAYO ON TOP.' : m.mt > 0 ? m.msg : 'E TO DROP THE LAYER ONTO THE STACK', 160, 132, '#3a2e40');
    }
  };

  // ---------- maple cakes: pour batter into each leaf mould as it passes, to the line ----------
  const MANJU = {
    init(m) { m.molds = [0, 1, 2, 3, 4].map(i => ({ x: 70 - i * 46, f: 0, judged: 0, ok: 0 })); m.good = 0; m.n = 0; m.done = 0; m.msg = ''; m.mt = 0; },
    update(m, dt) { if (m.mt > 0) m.mt -= dt; if (m.done) { if (m.t > m.done + 1.4) { if (m.good >= 4) endMini(true, ['A ROW OF GOLDEN MAPLE LEAVES, SOFT AS SPONGE, WITH SWEET BEAN PASTE INSIDE. YOU EAT ONE STRAIGHT AWAY AND BURN YOUR LIP.', 'THE MASTER NODS. HE HAS MADE TWO MILLION OF THESE. YOURS ARE NEARLY AS GOOD.']); else endMini(false, ['SOME ARE HALF A LEAF, SOME ARE A PUDDLE. THEY ALL TASTE GOOD, BUT THE MASTER SHAKES HIS HEAD.', '"POUR TO THE LINE," HE SAYS. "THE LINE IS THERE FOR A REASON."']); } return; }
      for (const md of m.molds) { md.x += 22 * dt; if (Math.abs(md.x - 160) < 12 && !md.judged && (K.a || KP.a)) { md.f = Math.min(1.2, md.f + dt * 0.85); if (Math.floor(md.f * 10) !== Math.floor((md.f - dt * 0.85) * 10)) PLACES.SND.blow(); }
        if (md.x > 190 && !md.judged) { md.judged = 1; m.n++; md.ok = md.f > 0.68 && md.f < 0.95; if (md.ok) { m.good++; m.msg = 'JUST RIGHT!'; Snd.fx('pick'); } else { m.msg = md.f >= 0.95 ? 'TOO MUCH - IT OOZES OUT' : md.f < 0.2 ? 'YOU MISSED IT' : 'NOT ENOUGH'; Snd.fx('talk'); } m.mt = 1; if (m.n >= 5) m.done = m.t; } } },
    draw(m) {
      txtC(ctx, 'MOMIJI MANJU', 160, 26, '#c8382e', null, 2); R(ctx, 54, 96, 212, 10, '#4a4458'); for (let x = 54 + (G.t * 22 % 8); x < 266; x += 8) R(ctx, x, 98, 4, 1, '#6a6478');
      R(ctx, 152, 40, 16, 18, '#c8c0d4'); R(ctx, 156, 58, 8, 6, '#8a8496'); if (K.a) { R(ctx, 159, 64, 2, 22, '#f0d090'); }
      for (const md of m.molds) { if (md.x < 50 || md.x > 270) continue; const x = md.x, y = 88; ell(ctx, x, y + 2, 14, 7, '#3a3446'); ctx.save(); ctx.translate(x, y); const leaf = (s, col) => { for (let k = 0; k < 5; k++) { const a = -1.5708 + (k - 2) * 0.62; ell(ctx, Math.cos(a) * 5 * s, Math.sin(a) * 4 * s, 3.4 * s, 2.2 * s, col); } disc(ctx, 0, 0.5 * s, 4 * s, col); };
        leaf(1.4, '#2a2430'); if (md.f > 0) leaf(1.4 * Math.min(1, Math.sqrt(md.f)), md.judged && md.x > 200 ? '#d8902a' : '#f0d090'); if (md.f > 0.95) { R(ctx, -9, 5, 18, 2, '#f0d090'); } ctx.restore();
        R(ctx, x - 12, 104, 24, 2, '#8a8496'); if (Math.abs(x - 160) < 30) { R(ctx, x + 12, 70, 3, 22, '#d9cba8'); R(ctx, x + 12, 70 + 22 * (1 - 0.95), 3, 22 * (0.95 - 0.68), '#5ad88a'); R(ctx, x + 12, 70 + 22 * (1 - Math.min(1.2, md.f) / 1.2 * 1.2), 3, 1, '#c8382e'); } }
      for (let i = 0; i < 5; i++) disc(ctx, 140 + i * 10, 116, 2.5, i < m.n ? (m.molds[i].ok ? '#d8902a' : '#8a7a6a') : '#d9cba8');
      txtC(ctx, m.mt > 0 ? m.msg : TOUCH ? 'HOLD E TO POUR - STOP IN THE GREEN' : 'HOLD E TO POUR - STOP IN THE GREEN', 160, 128, '#3a2e40');
    }
  };

  concourse('hir_shinkansen', { name: 'HIROSHIMA', hub: 'hir_town', music: 'hiroshima', track: 13, dest: 'TOKYO', bento: ['ANAGO MESHI', 'GRILLED CONGER EEL ON RICE, A RECIPE FROM MIYAJIMA, IN A LITTLE WOODEN BOX THAT SMELLS OF THE GRILL.'] });
  city({
    id: 'hiroshima', name: 'HIROSHIMA', tagline: 'A CITY OF PEACE, AND AN ISLAND SHRINE', start: 'hir_town', hub: 'hir_town', concourse: 'hir_shinkansen', line: LINE, areas: AREAS, stamps: STAMPS, cats: 3, minis: { orizuru: ORI, layers: LAY, manju: MANJU },
    hud: () => M.id === 'miyajima' ? ['wave', tideName()] : null,
    sprites() {
      // the Dome: the shell of the old exhibition hall, walls broken, the steel of its dome left bare
      one('hdome', 160, 140, g => { const W_ = '#b8ae98', WD = '#8a8270', WL = '#d0c8b0';
        R(g, 6, 92, 148, 46, W_); R(g, 6, 92, 148, 1.5, WL); for (let x = 12; x < 150; x += 14) { R(g, x, 100, 7, 10, '#3a3430'); R(g, x, 116, 7, 12, '#3a3430'); R(g, x, 100, 7, 1, '#1d1626'); } R(g, 6, 110, 148, 2, WD); R(g, 6, 136, 148, 2, '#6b6478');
        for (const [x, w] of [[6, 10], [40, 6], [100, 12], [140, 14]]) { for (let k = 0; k < w; k += 2) R(g, x + k, 92 - (k * 7 % 9), 2, (k * 7 % 9), '#15101f'); }
        R(g, 54, 54, 52, 40, W_); R(g, 54, 54, 52, 1.5, WL); for (let x = 58; x < 104; x += 9) { R(g, x, 60, 5, 12, '#3a3430'); R(g, x, 78, 5, 10, '#3a3430'); } R(g, 54, 74, 52, 2, WD);
        for (let k = 0; k < 8; k++) R(g, 60 + k * 5, 52 - (k * 5 % 6), 3, 3 + (k * 5 % 6), W_);
        const cx = 80, cy = 52; for (let a = 0; a <= 12; a++) { const q = Math.PI * a / 12, x = cx - Math.cos(q) * 22, y = cy - Math.sin(q) * 20; line1(g, cx, cy - 20, x, y, '#3a3a44'); } for (let r = 0; r < 4; r++) { const rr = 22 - r * 5.5; for (let a = 0; a <= 24; a++) { const q = Math.PI * a / 24; p1(g, cx - Math.cos(q) * rr, cy - Math.sin(q) * rr * (20 / 22), '#3a3a44'); } }
        R(g, cx - 2, cy - 22, 4, 3, '#3a3a44'); for (let k = 0; k < 10; k++) { R(g, 10 + (k * 37 % 140), 132 - (k * 3 % 6), 6, 4, k % 2 ? WD : '#9a9080'); } R(g, 20, 120, 2, 16, '#5a8a5a'); R(g, 130, 124, 2, 12, '#5a8a5a'); }, 1);
      one('cenotaph', 62, 36, g => { R(g, 4, 30, 54, 6, '#a8a2b4'); R(g, 4, 30, 54, 1, '#d8d4e4'); for (let x = 0; x < 62; x++) { const t = (x - 31) / 31, y = 6 + t * t * 22; R(g, x, y, 1, 3, '#c8c0b4'); R(g, x, y, 1, 1, '#e8e0d4'); } for (const x of [4, 55]) R(g, x, 26, 3, 6, '#b8b0a4'); R(g, 22, 22, 18, 9, '#4a4458'); R(g, 22, 22, 18, 1, '#6a6478'); }, 1);
      one('hflame', 30, 16, g => { R(g, 2, 8, 26, 8, '#8c8498'); R(g, 2, 8, 26, 1, '#c8c0d4'); for (const s of [-1, 1]) { line1(g, 15 + s * 2, 9, 15 + s * 12, 1, '#a8a2b4'); line1(g, 15 + s * 3, 9, 15 + s * 13, 2, '#8c8498'); } R(g, 12, 6, 6, 3, '#6b6478'); }, 1);
      one('cmonument', 44, 82, g => { R(g, 6, 76, 32, 6, '#a8a2b4'); line1(g, 8, 76, 22, 14, '#c8c0b4'); line1(g, 36, 76, 22, 14, '#c8c0b4'); line1(g, 22, 76, 22, 14, '#b8b0a4'); R(g, 18, 56, 8, 10, '#d8a040'); disc(g, 22, 52, 3, '#d8a040');
        R(g, 19, 8, 6, 8, '#d8a040'); disc(g, 22, 5, 2.5, '#d8a040'); line1(g, 19, 10, 13, 2, '#d8a040'); line1(g, 25, 10, 31, 2, '#d8a040'); R(g, 10, 0, 6, 2, '#f8f0c0'); R(g, 28, 0, 6, 2, '#f8f0c0'); R(g, 21, 16, 2, 4, '#d8a040'); }, 1);
      one('cranebooth', 42, 30, g => { R(g, 1, 4, 40, 26, '#c8d8e4'); R(g, 1, 4, 40, 1, '#ffffff'); R(g, 0, 28, 42, 2, '#8a8496'); for (let i = 0; i < 46; i++) { const x = 3 + (i * 7 % 36), y = 7 + (i * 3 % 19); R(g, x, y, 2, 3, PAPER[i % 6]); R(g, x, y, 2, 1, lite(PAPER[i % 6], 0.3)); } R(g, 2, 5, 1, 22, 'rgba(255,255,255,0.6)'); }, 1);
      one('pbellH', 46, 46, g => { R(g, 4, 42, 38, 4, '#a8a2b4'); for (const x of [6, 38]) R(g, x, 14, 2.5, 29, '#c8c0b4'); for (let k = 0; k < 24; k++) { const a = Math.PI * k / 23; R(g, 23 - Math.cos(a) * 20, 14 - Math.sin(a) * 12, 2, 2, '#9ab0a0'); } ell(g, 23, 10, 18, 4, '#b8c8b8'); ell(g, 23, 22, 6, 7, '#6a7a5a'); R(g, 17, 22, 12, 8, '#6a7a5a'); R(g, 17, 29, 12, 1, '#4a5a3a'); disc(g, 21, 22, 1, '#8a9a7a'); }, 1);
      one('museum', 260, 52, g => { R(g, 0, 8, 260, 22, '#d8d0c4'); R(g, 0, 8, 260, 1.5, '#f0e8dc'); for (let x = 4; x < 256; x += 6) R(g, x, 12, 3, 14, '#5a6a7a'); R(g, 0, 28, 260, 2, '#a8a094'); for (let x = 10; x < 260; x += 20) { R(g, x, 30, 5, 22, '#c8c0b4'); R(g, x, 30, 1.5, 22, '#e0d8cc'); } R(g, 0, 50, 260, 2, '#8c8498'); }, 1);
      one('tramA', 72, 30, g => { R(g, 2, 8, 68, 18, '#f4ead0'); R(g, 2, 17, 68, 9, '#3f8a4a'); R(g, 2, 16, 68, 1, '#c8382e'); ell(g, 69, 16, 3, 9, '#f4ead0'); ell(g, 69, 21, 3, 5, '#3f8a4a'); for (let x = 6; x < 64; x += 7) { R(g, x, 10, 5, 5, '#2a3a5a'); R(g, x, 10, 5, 1, '#6a8ab0'); } R(g, 62, 9, 8, 3, '#1d1626'); txt(g, '2', 64, 9, '#f2c14e'); R(g, 2, 7, 68, 1.5, '#c8c0b0'); for (const x of [14, 56]) { disc(g, x, 27, 2.5, '#2a2430'); disc(g, x + 6, 27, 2.5, '#2a2430'); } line1(g, 30, 7, 36, 0, '#3a3446'); line1(g, 42, 7, 36, 0, '#3a3446'); disc(g, 70.5, 21, 1, '#fff0b0'); }, 1);
      one('tramB', 66, 30, g => { R(g, 0, 8, 64, 18, '#f4ead0'); R(g, 0, 17, 64, 9, '#3f8a4a'); R(g, 0, 16, 64, 1, '#c8382e'); ell(g, 1, 16, 3, 9, '#f4ead0'); ell(g, 1, 21, 3, 5, '#3f8a4a'); for (let x = 4; x < 60; x += 7) { R(g, x, 10, 5, 5, '#2a3a5a'); R(g, x, 10, 5, 1, '#6a8ab0'); } R(g, 0, 7, 64, 1.5, '#c8c0b0'); for (const x of [10, 50]) { disc(g, x, 27, 2.5, '#2a2430'); disc(g, x + 6, 27, 2.5, '#2a2430'); } }, 1);
      one('otorii', 120, 100, g => { const C = '#d8402c', D = '#a83020', L = '#f06a50', K = '#2a2430';
        for (const x of [26, 86]) { R(g, x, 18, 9, 80, C); R(g, x, 18, 2.5, 80, L); R(g, x + 6.5, 18, 2.5, 80, D); R(g, x - 1, 92, 11, 6, K); }
        for (const x of [12, 30, 82, 100]) if (x === 12 || x === 100) { R(g, x, 46, 5, 52, C); R(g, x, 46, 1.5, 52, L); R(g, x - 1, 94, 7, 4, K); } for (const s of [[16, 30], [91, 100]]) { R(g, s[0], 56, s[1] - s[0] + 4, 3, C); R(g, s[0], 72, s[1] - s[0] + 4, 3, C); }
        R(g, 14, 30, 92, 5, C); R(g, 14, 30, 92, 1.5, L); R(g, 14, 34, 92, 1, D); R(g, 4, 12, 112, 7, C); R(g, 4, 12, 112, 1.5, L); R(g, 4, 18, 112, 1, D); R(g, 2, 6, 116, 6, K); R(g, 2, 6, 116, 1, '#5a5068');
        for (let i = 0; i < 6; i++) { R(g, 1 - i * U, 5 - i * U, 1.5, 2, K); R(g, 118 + i * U, 5 - i * U, 1.5, 2, K); } R(g, 54, 19, 12, 12, K); R(g, 55, 20, 10, 10, '#f2c14e'); R(g, 59, 22, 2, 6, '#8a5a20'); }, 1);
      SPR.otoriiR = flip(SPR.otorii); { const c = mk(SPR.otorii.lw, SPR.otorii.lh); c.g.save(); c.g.translate(0, c.lh); c.g.scale(1, -1); c.g.drawImage(SPR.otorii, 0, 0); c.g.restore(); SPR.otoriiR = c; }
      one('honden', 140, 76, g => templeHall(g, 70, 74, 112, 26, { wall: '#d8402c', roof: '#5a4434', plaster: '#f8f0e0', door: '#8a2a24', bays: 7 }));
      one('srail', 32, 9, g => { R(g, 0, 2, 32, 2, '#d8402c'); R(g, 0, 2, 32, U, '#f06a50'); R(g, 0, 6, 32, 1.5, '#a83020'); for (let x = 0; x < 32; x += 8) R(g, x, 0, 2, 9, '#d8402c'); });
      one('srailV', 4, 56, g => { R(g, 1, 0, 2, 54, '#d8402c'); R(g, 1, 0, U, 54, '#f06a50'); for (let y = 0; y < 54; y += 10) R(g, 0, y, 4, 2, '#a83020'); });
      one('shamoji', 26, 72, g => { R(g, 3, 66, 20, 6, '#8c8498'); ell(g, 13, 18, 11, 16, '#a8744a'); ell(g, 12, 17, 10, 15, '#c8945a'); ell(g, 10, 13, 5, 7, '#d8a86a'); R(g, 10, 32, 6, 34, '#a8744a'); R(g, 10, 32, 2, 34, '#c8945a'); for (let y = 6; y < 30; y += 4) R(g, 6, y, 14, U, '#a8744a'); }, 1);
      one('ferry', 76, 30, g => { ell(g, 38, 24, 36, 6, '#f4f1e6'); R(g, 4, 18, 68, 6, '#f4f1e6'); R(g, 4, 22, 68, 2, '#c8382e'); R(g, 14, 8, 48, 10, '#f4f1e6'); R(g, 14, 8, 48, 1, '#ffffff'); for (let x = 17; x < 60; x += 6) R(g, x, 11, 4, 4, '#2a3a5a'); R(g, 30, 2, 12, 6, '#f4f1e6'); R(g, 34, 0, 4, 3, '#c8382e'); R(g, 0, 28, 76, 1, '#a6dcee'); }, 1);
      SPR.rideSeto = (() => { const c = mk(320, 84), g = c.g, r = RNG(61); dgrad(g, 0, 0, 320, 84, ['#86bfe8', '#b4d8f0', '#e8f0f4']); for (const [x, w, h] of [[40, 50, 16], [150, 70, 22], [260, 44, 12], [330, 50, 18]]) { ell(g, x, 46, w, h, '#5a8a7a'); ell(g, x - w * 0.3, 44, w * 0.5, h * 0.8, '#6a9a8a'); }
        dgrad(g, 0, 46, 320, 38, ['#4a9ac0', '#3a7aa8']); for (let k = 0; k < 40; k++) R(g, r() * 320, 50 + r() * 32, 4 + r() * 10, U, 'rgba(255,255,255,0.5)'); for (let k = 0; k < 4; k++) { const x = 30 + k * 80; R(g, x, 70, 14, 3, '#8a6448'); for (let j = 0; j < 4; j++) R(g, x + j * 4, 66, 1, 4, '#8a6448'); } return c; })();
      icon('hokono', g => { ell(g, 6, 8, 5.5, 3, '#6a3a24'); ell(g, 6, 7, 5, 2.5, '#e8c060'); R(g, 1.5, 6, 9, 1, '#9ad070'); for (const x of [3, 6, 9]) P(g, x, 6, '#f8f4ea'); });
      icon('lemon', g => { ell(g, 6, 7, 4.5, 3.5, '#f2d040'); ell(g, 5, 6, 2.5, 1.5, '#fff090'); P(g, 1, 7, '#d8a020'); P(g, 11, 7, '#d8a020'); R(g, 6, 2, 3, 1.5, '#5aa85a'); });
      icon('htram', g => { R(g, 0, 3, 12, 7, '#f4ead0'); R(g, 0, 7, 12, 3, '#3f8a4a'); R(g, 0, 6.5, 12, U, '#c8382e'); R(g, 2, 4, 2, 2, '#2a3a5a'); R(g, 6, 4, 2, 2, '#2a3a5a'); R(g, 5, 0, 2, 3, '#3a3446'); R(g, 0, 11, 12, 1, '#8a8496'); });
      icon('hdome', g => { R(g, 1, 7, 10, 5, '#b8ae98'); R(g, 3, 5, 6, 3, '#b8ae98'); for (let k = 0; k < 5; k++) P(g, 3 + k * 1.5, 4 - Math.sin(k / 4 * Math.PI) * 3, '#3a3a44'); R(g, 2, 9, 2, 2, '#3a3430'); R(g, 8, 9, 2, 2, '#3a3430'); });
      icon('cenot', g => { for (let x = 0; x < 12; x++) { const t = (x - 6) / 6; R(g, x, 2 + t * t * 6, 1, 1.5, '#c8c0b4'); } R(g, 4, 7, 4, 3, '#4a4458'); R(g, 0, 10, 12, 2, '#a8a2b4'); });
      icon('orizuru', g => { line(g, 1, 2, 5, 7, '#e0452f'); line(g, 11, 3, 7, 7, '#e0452f'); R(g, 3, 6, 6, 2, '#e0452f'); line(g, 4, 8, 1, 11, '#c03020'); line(g, 8, 8, 11, 10, '#c03020'); P(g, 1, 2, '#c03020'); });
      icon('pbell', g => { ell(g, 6, 3, 5, 1.5, '#b8c8b8'); ell(g, 6, 7, 3, 3.5, '#6a7a5a'); R(g, 3, 7, 6, 3, '#6a7a5a'); R(g, 0, 11, 12, 1, '#a8a2b4'); });
      icon('otorii', g => { R(g, 0, 1, 12, 2, '#d8402c'); R(g, 1, 4, 10, 1, '#d8402c'); R(g, 2, 3, 2, 7, '#d8402c'); R(g, 8, 3, 2, 7, '#d8402c'); R(g, 0, 9, 12, 3, '#3a8ab0'); R(g, 1, 9, 3, 1, '#a8e0e8'); });
      icon('steps', g => { R(g, 0, 0, 12, 12, '#b4a486'); for (const [x, y] of [[3, 9], [7, 7], [3, 5], [7, 3], [3, 1]]) ell(g, x, y + 1, 1.2, 1.6, '#8a7a5a'); });
      icon('mshrine', g => { R(g, 1, 4, 10, 5, '#d8402c'); R(g, 0, 2, 12, 2, '#5a4434'); R(g, 3, 5, 2, 4, '#f8f0e0'); R(g, 7, 5, 2, 4, '#f8f0e0'); R(g, 0, 9, 12, 3, '#3a8ab0'); });
      icon('manju', g => { for (let k = 0; k < 5; k++) { const a = -1.5708 + (k - 2) * 0.62; ell(g, 6 + Math.cos(a) * 3, 6 + Math.sin(a) * 2.5, 2.2, 1.5, '#d8902a'); } disc(g, 6, 7, 2.5, '#d8902a'); P(g, 5, 6, '#f0c060'); });
      icon('oyster', g => { ell(g, 6, 7, 5.5, 4, '#8a8496'); ell(g, 6, 6.5, 4, 2.8, '#d8d0c4'); ell(g, 6, 6.5, 2.5, 1.8, '#f0e8dc'); P(g, 6, 6, '#c8b8a0'); });
      icon('scoop', g => { ell(g, 5, 4, 3.5, 4, '#c8945a'); R(g, 4, 7, 2, 5, '#a8744a'); ell(g, 4, 3, 1.5, 2, '#d8a86a'); });
    }
  });
})();
