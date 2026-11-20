'use strict';
// ---------- Okinawa: the islands of the south ----------
// You come by sea. The cruise ship docks at Naha's wharf, below a shrine on a cliff over a little beach, and a monorail
// runs above the streets. Kokusai-dori is the main street: red-tiled roofs with lion-dogs on them, a covered market of
// impossibly coloured fish, doughnuts, soba, and eisa drummers dancing in the road (you can join them). Shuri Castle is
// red and gold behind curving limestone walls. At the beach the water goes from white to every blue there is, and a
// glass-bottomed boat floats over the reef: look down through the glass and spot what lives there.
(function () {
  const LINE = [['oki_port', 'NAHA PORT'], ['oki_kokusai', 'KOKUSAI DORI'], ['oki_shuri', 'SHURI CASTLE'], ['oki_beach', 'EMERALD BEACH'], ['oka', 'NAHA AIRPORT']];
  const STAMPS = {
    oki_cruise: ['ARRIVED BY SEA', 'ship', 'oki_port'], oki_naminoue: ['NAMINOUE SHRINE', 'nshrine', 'oki_port'], oki_shisa: ['THE GIANT SHISA', 'shisa', 'oki_port'],
    oki_eisa: ['EISA DRUMMER', 'eisa', 'oki_kokusai'], oki_andagi: ['SATA ANDAGI', 'andagi', 'oki_kokusai'], oki_market: ['MAKISHI MARKET', 'mfish', 'oki_kokusai'], oki_soba: ['OKINAWA SOBA', 'osoba', 'oki_kokusai'],
    oki_gate: ['SHUREIMON', 'sgate', 'oki_shuri'], oki_seiden: ['SHURI CASTLE', 'seiden', 'oki_shuri'],
    oki_reef: ['THE CORAL REEF', 'coral', 'oki_beach'], oki_ice: ['PURPLE SWEET POTATO ICE', 'beniice', 'oki_beach'], oki_shells: ['SEASHELLS', 'shell', 'oki_beach']
  };
  const rnd = Math.random, pick = a => a[rnd() * a.length | 0], V = { shells: 0 };
  const ROOF = '#d8603a', HAW = ['#f06a8c', '#5ad8f0', '#f2c14e', '#5aa85a', '#f4f1e6', '#8a6aff'];
  // people in island shirts, walking a line
  const islanders = (n, ax, ay, bx, by, jit) => { const s = M.ACT.length; crowd(n, ax, ay, bx, by, jit); M.ACT.slice(s).forEach((a, i) => { if (a.F && i % 2) a.F = look(pick(['tourist', 'teen', 'salary', 'office']), HAW[(i + ax) % HAW.length]); }); };
  const shisaOn = (x, y, h) => put(SPR.shisaS, x, y + 0.1, 4, h); // a lion-dog standing guard on a roof
  const palm = (x, y) => plant('palm', x, y, 1);
  const gulls = (cx, cy) => { const T = worldTime(); for (let k = 0; k < 4; k++) { const a = T * (0.3 + k * 0.05) + k * 1.7, x = 150 + k * 200 + Math.cos(a) * 70 - cx * 0.5, y = 60 + k * 18 + Math.sin(a * 1.3) * 20 - cy * 0.5; if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue; const f = Math.sin(T * 8 + k * 2) > 0 ? 2 : -0.5; line1(ctx, x - 4, y - f, x, y, '#ffffff'); line1(ctx, x, y, x + 4, y - f, '#ffffff'); } };
  // the monorail on its beam, high over a street
  function monorail(y, period, off) { const g = M.ground.g; for (let x = 20; x < M.w; x += 120) { R(g, x - 4, y - 6, 8, 10, 'rgba(22,30,50,0.18)'); } for (let x = 20; x < M.w; x += 120) put(SPR.mpillar, x, y, 5, 39); M.ACT.push({ x: 0, y: y - 0.2, sayT: 0, always: 1, draw(e, sx, sy) { R(ctx, 0, sy - 40, W, 5, '#c8c4bc'); R(ctx, 0, sy - 40, W, 1, '#e8e4dc'); R(ctx, 0, sy - 36, W, 1, '#8a8496'); } }); PLACES.passer({ y: y + 6, cars: [SPR.yui, SPR.yui], period, speed: 80, dir: 0, lift: 40, off, band: 6 }); }

  // ---------- Naha Port ----------
  MAPS.oki_port = { name: 'NAHA PORT', sub: 'WHERE THE CRUISE SHIPS COME IN', tw: 50, th: 36, music: 'okinawa', sea: 'tropic', sand: 'white', lookUp: [200, 360],
    zones: [[0, 0, 260, 180, 'NAMINOUE SHRINE', 'A SHRINE ON A CLIFF OVER THE SEA'], [0, 160, 330, 310, 'NAMINOUE BEACH', 'A LITTLE BEACH IN THE CITY'], [340, 140, 800, 240, 'THE CRUISE WHARF', 'THE SHIP IN, THE SHIP OUT'], [0, 0, 800, 576, 'NAHA PORT', 'WHERE THE CRUISE SHIPS COME IN']],
    lay() { tRect(WA, 0, 0, 50, 13); tOval(GR, 8, 5.5, 7, 4.6); tRect(DT, 0, 11, 21, 19); tOval(DT, 10, 11.2, 11, 1.6); tRect(PL, 22, 9.5, 48, 14.5); tRect(PV, 21, 14.5, 50, 19); tRect(PV, 0, 19, 50, 36); tRect(GR, 21, 19, 30, 22); },
    deco() {
      const g = M.ground.g;
      // the headland and its shrine, with steps up from the beach
      ledge([[16, 168], [128, 172], [240, 166]], 16, 'rock'); steps(128, 170, 24, 18, '#c8c0b4');
      put(SPR.nshrineH, 128, 110, 60, 57); block(76, 86, 180, 110); for (const [x, y] of [[50, 140], [206, 130], [60, 70], [200, 60]]) plant('green', x, y, 1);
      stampSpot('oki_naminoue', 128, 124, 'PRAY', 'bow', ['TWO BOWS, TWO CLAPS, ONE BOW. THE WIND COMES STRAIGHT OFF THE SEA AND RINGS THE BELL FOR YOU.', 'SAILORS PRAYED HERE BEFORE THEY SAILED TO CHINA. THE SHRINE WATCHED FOR THEM COMING HOME.']);
      put(SPR.torii, 128, 160, 30, 49); block(108, 154, 116, 160); block(140, 154, 148, 160);
      // the beach under the cliff
      PLACES.shore(140, 330, { period: 7, reach: 9, film: 'rgba(190,250,240,0.6)' });
      for (const [x, y, c] of [[60, 250, 0], [200, 236, 1], [280, 270, 2]]) { put(SPR['brolly' + c], x, y, 15, 27); block(x - 2, y - 3, x + 2, y); }
      npc('kid', 120, 244, { rad: 30, tint: '#5ad8f0', lines: ['THE WATER IS AS WARM AS A BATH. IN WINTER!'] }); npc('granny', 240, 280, { rad: 20, tint: '#f06a8c', lines: ['MENSORE! THAT MEANS WELCOME, HERE. NOBODY ELSE IN JAPAN SAYS IT.'] });
      // the wharf and the ship
      R(g, 352, 152, 416, 2, '#f2c14e'); for (let x = 360; x < 768; x += 40) { R(g, x, 156, 6, 4, '#3a3a4e'); R(g, x + 1, 156, 4, 1, '#6a6a7e'); }
      put(SPR.liner, 560, 156, 120, 86); block(440, 70, 780, 152);
      put(SPR.gangway, 512, 178, 15, 33); gateway(500, 180, 'BOARD THE CRUISE SHIP', false); block(504, 150, 528, 168);
      stampSpot('oki_cruise', 640, 194, 'TAKE A PHOTO', 'snap', ['THE CRUISE SHIP ALONGSIDE, TEN DECKS HIGH, HER FUNNEL BLUE AGAINST A BLUER SKY.', 'SHE SAILED IN AT DAWN, PAST THE ISLANDS, WITH DOLPHINS AT THE BOW. NOW SHE IS RESTING.'], 15, { frame: [440, 60, 340, 110] });
      npc('office', 470, 200, { tint: '#2f5ab0', lines: ['THE SHIP SAILS FOR THE MAINLAND WHEN YOU ARE READY. ONE NIGHT AT SEA.', 'THE SUNSET FROM THE DECK IS INCLUDED. SO ARE THE STARS.'] }); npc('tourist', 700, 210, { rad: 30, lines: ['THERE WERE DOLPHINS! A WHOLE FAMILY OF THEM!', 'NOBODY BELIEVES ME. YOU BELIEVE ME.'] });
      // the terminal, the giant shisa and the monorail
      tower(600, 300, 200, 56, { c: '#f4f1e6', sign: 'NAHA CRUISE TERMINAL', sc: '#2f7ab0', wc: '#bfe8ff', gx: 7, ww: 4 }); shisaOn(520, 300, 64); shisaOn(680, 300, 64);
      put(SPR.shisaB, 380, 330, 25, 55); block(360, 320, 400, 330);
      M.SPOTS.push({ x: 380, y: 342, r: 14, label: 'PAT THE SHISA', stamp: 'oki_shisa', fn: () => { Snd.fx('ui'); G.fx.push({ x: 380, y: 300, t: 0, icon: 'heart' }); dialog(['A LION-DOG AS TALL AS YOU, GLAZED RED AND ORANGE, MOUTH WIDE OPEN.', 'SHISA COME IN PAIRS: ONE MOUTH OPEN TO SCARE BAD LUCK AWAY, ONE CLOSED TO KEEP GOOD LUCK IN. THIS ONE IS THE LOUD ONE.'], () => award('oki_shisa')); } });
      monorail(470, 24, 0); station(140, 540, 'ASAHIBASHI'); M.SPOTS.find(s => s.train).label = 'MONORAIL'; M.st = [140, 552];
      for (const x of [260, 440, 720]) palm(x, 400); for (const x of [40, 330, 560]) palm(x, 540); prop('vend3', 300, 530, 6); prop('bench', 520, 420, 9);
      npc('teen', 300, 380, { rad: 30, tint: '#f2c14e', lines: ['THE MONORAIL IS THE ONLY TRAIN ON THE WHOLE ISLAND. IT IS VERY PROUD OF ITSELF.'] }); M.ACT.push({ cat: true, x: 760, y: 380, k: 0 });
      islanders(6, 360, 270, 780, 270, 8); islanders(5, 20, 440, 780, 440, 8); islanders(4, 20, 230, 320, 230, 20);
      bottomRow(13); M.LIGHTS = [];
    },
    over(cx, cy) { gulls(cx, cy); } };

  // ---------- Kokusai-dori ----------
  const BEAT = 60 / 116, eisaOn = () => true;
  function dancer(x, y, i) { const F = look('yukata', ['#f4f1e6', '#c8382e', '#f2c14e', '#3d5a80'][i % 4]); M.ACT.push({ x, y, sayT: 0, F, ph: i, draw(e, sx, sy) { const T = worldTime() / BEAT + i * 0.25, b = T % 1, jump = Math.max(0, Math.sin(b * Math.PI)) * 3, hit = b < 0.15, fr = F.d[1 + Math.floor(T) % 4];
    ell(ctx, sx, sy, 6, 2, 'rgba(22,30,50,0.3)'); ctx.drawImage(fr, snap(sx - 10), snap(sy - 27 - jump)); disc(ctx, sx + 6, sy - 12 - jump, 4, '#c8382e'); disc(ctx, sx + 6, sy - 12 - jump, 3, '#f4ead4'); const a = hit ? 0.4 : -0.6; line1(ctx, sx + 2, sy - 18 - jump, sx + 2 + Math.cos(a) * 7, sy - 18 - jump + Math.sin(a) * 7, '#8a5a3a');
    R(ctx, sx - 5, sy - 28 - jump, 10, 2, ['#c8382e', '#f2c14e'][i % 2]); } }); }
  MAPS.oki_kokusai = { name: 'KOKUSAI-DORI', sub: 'THE MAIN STREET OF NAHA', tw: 48, th: 28, music: 'okinawa',
    zones: [[300, 200, 470, 320, 'THE EISA', 'DRUMS IN THE STREET'], [0, 0, 768, 448, 'KOKUSAI-DORI', 'THE MAIN STREET OF NAHA']],
    tick() { const T = worldTime() / BEAT; if (Math.floor(T) !== M.lastBeat) { M.lastBeat = Math.floor(T); const v = Math.max(0, 1 - Math.hypot(pl.x - 384, pl.y - 260) / 260); if (v > 0.05 && G.state === 'play') PLACES.SND.drum(Math.floor(T) % 4 === 0); } },
    lay() { tRect(PL, 0, 0, 48, 9.5); tRect(PV, 0, 9.5, 48, 20.5); tRect(AS, 0, 20.5, 48, 23.5); tRect(PV, 0, 23.5, 48, 28); },
    deco() {
      const g = M.ground.g; roofs(0, 0, 768, 112);
      tower(70, 150, 110, 90, { c: '#f2e0c0', sign: 'MAKISHI MARKET', sc: '#c8382e', to: 'o_market', lab: 'INTO THE MARKET', lit: 0.4 });
      const SH = [[180, 'ANDAGI', '#e08a3a'], [250, 'SOBA', '#c8382e', 'o_soba'], [320, 'AWAMORI', '#3d5a80'], [530, 'GLASS', '#5aa85a'], [690, 'ICE', '#8a6aff']];
      for (const [x, s, c, to] of SH) { house(x, 150, 62, 28, { sign: s, noren: c, rh: 14, roofCol: ROOF, wall: '#e8d8b8', beam: '#8a6448', to }); shisaOn(x + 18, 150, 50); }
      DAY.konbini(456, 150, 'okinawa'); DAY.hotel(610, 150, 'okinawa', 60); const an = npc('granny', 180, 166, { tint: '#e08a3a', lines: ['SATA ANDAGI! SUGAR DOUGHNUTS, FRESH FROM THE OIL!'] }); an.spot = { label: 'BUY SATA ANDAGI', stamp: 'oki_andagi', act: 'hold', fx: 'munch', lines: ['A ROUND, CRACKED, GOLDEN DOUGHNUT, CRISP OUTSIDE AND CAKE INSIDE. IT IS SHAPED LIKE A SMILE THAT HAS BURST.', 'THE NAME MEANS SUGAR, OIL, FRIED. IN OKINAWAN THEY SAY EXACTLY WHAT THEY MEAN.'] };
      for (let x = 30; x < 768; x += 92) palm(x, 196);
      // the eisa: drummers dancing in the middle of the road, and a gap in the line for you
      for (let i = 0; i < 4; i++) dancer(320 + i * 34, 252 + (i % 2) * 6, i); M.LIGHTS = [];
      const lead = npc('yukata', 470, 250, { tint: '#c8382e', dir: 'l', lines: ['JOIN US! ONE DRUM, TWO STICKS, AND YOUR WHOLE HEART!'] }); lead.spot = { label: 'JOIN THE EISA', mini: 'eisa', stamp: 'oki_eisa' };
      npc('salary', 250, 280, { rad: 20, tint: '#5ad8f0', lines: ['THE EISA IS FOR THE ANCESTORS, AT OBON. THEY DANCE IT ALL YEAR NOW, FOR US.'] }); npc('teen', 560, 290, { rad: 30, tint: '#f06a8c', lines: ['ALL THE ROOFS HAVE LITTLE LIONS ON THEM. I HAVE COUNTED FORTY-ONE.'] });
      npc('kimono', 640, 210, { rad: 20, tint: '#f2c14e', lines: ['THAT IS BINGATA: OUR DYED CLOTH. THE COLOURS COME FROM THE SEA AND THE FLOWERS.'] }); M.ACT.push({ cat: true, x: 150, y: 290, k: 2 });
      // the road, the monorail over it, and the station
      for (let x = 6; x < 768; x += 14) R(g, x, 351.5, 7, 1, '#e8e4f0'); cars(342, 1, 3); cars(362, -1, 3); monorail(396, 22, 7);
      station(560, 422, 'MAKISHI'); M.SPOTS.find(s => s.train).label = 'MONORAIL'; prop('vend3', 660, 430, 6); prop('bench', 420, 430, 9);
      islanders(7, 20, 222, 748, 222, 10); islanders(5, 748, 300, 20, 300, 8); islanders(4, 20, 400, 600, 400, 6);
      bottomRow(23);
    } };
  MAPS.o_market = { indoor: 1, name: 'MAKISHI PUBLIC MARKET', music: 'okinawa', deco() {
    room({ wall: '#e8e0d0', floor: 'tile', t1: '#d8e0e8', t2: '#c8d0dc', mat: '#2f7ab0', art: (g, r) => { for (let x = 16; x < 304; x += 48) poster(g, x, 10, 40, 12, ['#c8382e', '#2f7ab0', '#5aa85a'][(x / 48 | 0) % 3], ['FISH', 'CRAB', 'PORK', 'SEA GRAPES', 'GOYA', 'FRUIT'][(x / 48 | 0) % 6]); } });
    const fish = ['#2a6aff', '#f2c14e', '#f06a8c', '#5ad8f0', '#c8382e', '#5aa85a', '#8a6aff']; fur('counter', 160, 96, 240, '#dceef8'); M.ACT.push({ x: 160, y: 96.5, sayT: 0, draw(e, x, y) { for (let k = 0; k < 14; k++) { const fx = x - 110 + k * 16, c = fish[k % fish.length]; ell(ctx, fx, y - 14, 6, 2.6, c); ell(ctx, fx - 1, y - 15, 4, 1.2, lite(c, 0.4)); R(ctx, fx + 5, y - 16, 2, 4, c); p1(ctx, fx - 4, y - 15, '#1d1626'); } } });
    const k = npc('chef', 160, 74, { tint: '#2f7ab0', lines: ['CHOOSE A FISH, ANY FISH. UPSTAIRS THEY COOK IT FOR YOU.'] }); k.spot = { label: 'CHOOSE A FISH TO COOK', stamp: 'oki_market', act: 'hold', fx: 'munch', lines: ['A FISH THE COLOUR OF THE SKY, WHICH THE MAN SAYS IS CALLED IRABUCHA. UPSTAIRS THEY FRY HALF AND SLICE THE REST.', 'IT TASTES FAR LESS BLUE THAN IT LOOKS. THE SEA GRAPES POP IN YOUR MOUTH LIKE TINY BUBBLES.'] };
    npc('granny', 60, 150, { rad: 20, lines: ['THIS MARKET STARTED AS A BLACK MARKET AFTER THE WAR. NOW IT IS A WHITE ONE. MOSTLY.'] }); npc('tourist', 260, 150, { rad: 20, lines: ['THAT FISH IS BRIGHT BLUE. THAT ONE IS PINK. I DO NOT TRUST EITHER OF THEM.'] }); fur('table', 80, 176, 1); fur('table', 240, 176, 3);
  } };
  MAPS.o_soba = { indoor: 1, name: 'OKINAWA SOBA', music: 'okinawa', deco() {
    room({ wall: '#f4e0c0', floor: 'tatami', mat: '#c8382e', art: (g, r) => { poster(g, 24, 10, 80, 16, '#c8382e', 'SOKI SOBA'); poster(g, 216, 10, 80, 16, '#5aa85a', 'GOYA'); for (const x of [130, 160, 190]) chochin(g, x, 10, '#e0452f'); } });
    fur('counter', 160, 84, 120, '#a8744a'); for (const [x, y, k] of [[70, 130, 1], [250, 130, 3], [70, 170, 2], [250, 170, 5]]) fur('table', x, y, k);
    const k = npc('chef', 160, 64, { lines: ['SOKI SOBA, ONE? THE PORK RIBS HAVE BEEN COOKING SINCE DAWN.'] }); k.spot = { label: 'ORDER SOKI SOBA', stamp: 'oki_soba', act: 'hold', fx: 'slurp', lines: ['THICK WHEAT NOODLES IN A CLEAR BONITO-AND-PORK BROTH, WITH SOFT PORK RIBS THAT FALL OFF THE BONE.', 'A SPLASH OF CHILLI AWAMORI FROM THE BOTTLE ON THE TABLE. THEN ANOTHER. CAREFUL.'] };
    eaters([50, 230], 128, ['IT IS CALLED SOBA BUT IT HAS NO BUCKWHEAT IN IT. DO NOT ASK. JUST EAT.', 'THE GOYA IS BITTER. THE BITTERNESS IS THE POINT. MY GRANDMOTHER SAYS SO.']);
  } };

  // ---------- Shuri Castle ----------
  MAPS.oki_shuri = { name: 'SHURI CASTLE', sub: 'THE PALACE OF THE RYUKYU KINGS', tw: 44, th: 40, music: 'okinawa',
    zones: [[200, 60, 504, 320, 'THE SEIDEN', 'THE KING\'S HALL'], [260, 440, 450, 560, 'SHUREIMON', 'THE GATE OF COURTESY'], [0, 0, 704, 640, 'SHURI CASTLE', 'THE PALACE OF THE RYUKYU KINGS']],
    lay() { tRect(FR, 0, 0, 44, 40); tOval(VL, 22, 10, 13, 8.5); tRect(PL, 15, 9, 29, 18); tOval(GR, 22, 26, 15, 7); tRect(DT, 20.5, 17, 23.5, 34); tRect(PV, 0, 34, 44, 40); tOval(GR, 7, 11, 4.5, 3.2); tRoad(DT, [[9, 11], [12, 12]], 0.6, VL); },
    deco() {
      const g = M.ground.g;
      // the courtyard: red and white stripes, laid out for ceremonies
      for (let y = 144; y < 288; y += 2) for (let x = 240; x < 464; x += 12) { const k = ((x - 240) / 12 | 0) % 2; R(g, x, y, 12, 2, k ? '#c8502e' : '#ece4d4'); } for (let y = 144; y < 288; y += 2) R(g, 352, y, 1, 2, '#8a3a24');
      put(SPR.seiden, 352, 146, 90, 88); block(266, 110, 438, 146);
      stampSpot('oki_seiden', 352, 296, 'TAKE A PHOTO', 'snap', ['THE SEIDEN: THE KING\'S HALL, RED AS LACQUER, WITH GOLDEN DRAGONS ON ITS PILLARS AND ROOF.', 'IT HAS BURNED DOWN FIVE TIMES AND BEEN BUILT AGAIN FIVE TIMES. THE PAINT ON THIS ONE IS STILL NEW.'], 16, { frame: [250, 30, 204, 140] });
      // the curving walls, Okinawa's own: no corners, the stone flows like a wave
      ledge([[96, 330], [200, 312], [300, 300], [352, 298], [404, 300], [504, 312], [608, 330]], 22, 'stone'); steps(352, 298, 32, 26, '#d8d0c0');
      for (const x of [328, 376]) { put(SPR.wallcap, x, 300, 6, 10); }
      ledge([[48, 470], [180, 452], [280, 444], [352, 442], [424, 444], [524, 452], [656, 470]], 18, 'stone'); steps(352, 442, 32, 22, '#d8d0c0');
      put(SPR.shureimon, 352, 540, 50, 57); block(302, 534, 316, 540); block(388, 534, 402, 540);
      stampSpot('oki_gate', 352, 556, 'TAKE A PHOTO', 'snap', ['SHUREIMON: THE GATE OF COURTESY. THE SIGN SAYS THIS IS A LAND THAT VALUES GOOD MANNERS.', 'ENVOYS FROM CHINA WERE WELCOMED THROUGH HERE. NOW IT IS ON THE TWO THOUSAND YEN NOTE.'], 15, { frame: [290, 470, 124, 80] });
      // the lookout on the west terrace
      for (let x = 60; x < 170; x += 6) R(g, x, 136, 2, 8, '#d8d0c0'); R(g, 56, 138, 118, 2, '#c8c0b0'); block(56, 132, 172, 140);
      M.SPOTS.push({ x: 112, y: 160, r: 14, label: 'LOOK OUT', lines: ['THE WHOLE CITY BELOW, WHITE ROOFS AND WATER TANKS, AND THE SEA ON THREE SIDES.', 'FIVE HUNDRED YEARS AGO THE KINGS LOOKED OUT FROM HERE AND SAW SHIPS FROM CHINA, KOREA, SIAM AND JAPAN.'] });
      for (const [x, y] of [[140, 380], [560, 380], [200, 220], [500, 220], [100, 300], [600, 300], [240, 400], [470, 400]]) plant('green', x, y, 1);
      npc('kimono', 300, 230, { rad: 24, tint: '#f2c14e', lines: ['THIS IS A DANCE COSTUME FROM THE OLD COURT. THE HAT IS SUPPOSED TO BE A FLOWER.', 'IT IS ALSO VERY GOOD AGAINST THE SUN.'] }); npc('granny', 430, 400, { rad: 20, lines: ['WHEN IT BURNED IN 2019, THE WHOLE ISLAND CRIED. THEN EVERYONE GAVE SOMETHING TO BUILD IT AGAIN.'] });
      npc('tourist', 352, 500, { rad: 20, lines: ['THE WALLS ARE CURVED LIKE THAT SO CANNONBALLS BOUNCE OFF. OR BECAUSE IT IS PRETTY. BOTH.'] });
      station(160, 610, 'SHURI'); M.SPOTS.find(s => s.train).label = 'MONORAIL'; prop('vend3', 560, 600, 6);
      islanders(4, 352, 600, 352, 320, 8); islanders(4, 20, 590, 690, 590, 6); bottomRow(31); wild(['green', 'green2', 'palm'], 2); M.LIGHTS = [];
    } };

  // ---------- Emerald Beach, and the glass-bottomed boat ----------
  const SEA_Y = 300, CRIT = [['A SEA TURTLE', 'turtle'], ['A CLOWNFISH', 'clown'], ['A BLUE PARROTFISH', 'parrot'], ['A MANTA RAY', 'ray'], ['AN OCTOPUS', 'octo'], ['A YELLOW BUTTERFLYFISH', 'butter'], ['A LIONFISH', 'lion'], ['A SCHOOL OF BLUE FISH', 'school']];
  let REEF = null, CR = [];
  function makeReef() { // the sea floor under the bay, painted once: pale sand going blue with depth, ripples, rocks, coral and sea grass
    const H_ = SEA_Y + 20, c = mk(M.w, H_), g = c.g, r = RNG(91); for (let y = 0; y < H_; y++) R(g, 0, y, M.w, 1, mix('#2f6e98', '#cfe6d6', Math.min(1, Math.pow(y / H_, 0.8) * 1.1)));
    for (let k = 0; k < 1600; k++) { const x = r() * M.w, y = r() * H_; R(g, x, y, 2 + r() * 4, U, 'rgba(255,255,255,0.16)'); }
    const COL = ['#e86a8a', '#f2a050', '#a86ad8', '#5ac8a8', '#f2d050', '#d8584a', '#6a9ad8', '#f4f1e6'];
    for (let k = 0; k < 520; k++) { const x = r() * M.w, y = 30 + r() * (H_ - 50), s = 1.4 + r() * 3.2, col = COL[(k * 7 + (x | 0)) % COL.length], t = k % 6, d = dark(col, 0.3), l = lite(col, 0.4);
      if (t === 0) { disc(g, x, y, s, d); disc(g, x - U, y - U, s * 0.8, col); for (let q = 0; q < 4; q++) R(g, x - s * 0.6 + q * s * 0.4, y - s * 0.2 + (q % 2) * U, s * 0.3, U, l); }
      else if (t === 1) { for (let q = 0; q < 4; q++) { const a = -1.5708 + (q - 1.5) * 0.45, L = s * (1.2 + (q % 2) * 0.5); line1(g, x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, col); p1(g, x + Math.cos(a) * L, y + Math.sin(a) * L, l); } }
      else if (t === 2) { ell(g, x, y, s * 1.5, s * 0.5, d); ell(g, x, y - U, s * 1.4, s * 0.4, col); R(g, x - s * 0.2, y, s * 0.4, s * 0.8, d); }
      else if (t === 3) { for (let q = 0; q < 7; q++) { const a = q / 7 * 6.283; R(g, x + Math.cos(a) * s * 0.7, y + Math.sin(a) * s * 0.5, U, U * 2, l); } disc(g, x, y, s * 0.35, col); }
      else if (t === 4 && y > H_ * 0.55) { for (let q = 0; q < 5; q++) R(g, x + q * 0.8 - 2, y - s, U, s + (q % 3), q % 2 ? '#4a9a5a' : '#6ab86a'); }
      else { ell(g, x, y, s, s * 0.7, '#6a7486'); ell(g, x - U, y - U, s * 0.8, s * 0.5, '#8a94a6'); } }
    return c; }
  function drawCritter(k, x, y, a, t, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (Math.cos(a) < 0) ctx.scale(-1, 1); const w = Math.sin(t * 8) * 1;
    if (k === 'turtle') { ell(ctx, 0, 0, 7, 5, '#5a7a4a'); for (let q = 0; q < 5; q++) ell(ctx, -3 + (q % 3) * 3, -2 + (q / 3 | 0) * 3, 1.4, 1.1, '#8aa86a'); disc(ctx, 8, -0.5, 2.2, '#8aa86a'); ell(ctx, 3, -5 + w, 3, 1.4, '#8aa86a'); ell(ctx, 3, 5 - w, 3, 1.4, '#8aa86a'); ell(ctx, -5, -4, 2, 1, '#8aa86a'); ell(ctx, -5, 4, 2, 1, '#8aa86a'); }
    else if (k === 'clown') { ell(ctx, 0, 0, 4, 2.2, '#f08a2a'); R(ctx, -1, -2, 1, 4, '#ffffff'); R(ctx, 2, -1.8, 0.8, 3.6, '#ffffff'); R(ctx, -5 - w * 0.3, -1.5, 1.5, 3, '#f08a2a'); p1(ctx, 3, -0.5, '#1d1626'); }
    else if (k === 'parrot') { ell(ctx, 0, 0, 6, 3, '#3a9ad8'); ell(ctx, 1, -1, 4, 1.4, '#5ac8e8'); R(ctx, -7 - w * 0.3, -2, 2, 4, '#2a7ab8'); p1(ctx, 4, -0.5, '#1d1626'); R(ctx, 5, 0, 1.5, 1, '#f2d050'); }
    else if (k === 'ray') { ctx.fillStyle = '#2a3a5a'; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-2, -8 - w * 2); ctx.lineTo(-4, 0); ctx.lineTo(-2, 8 + w * 2); ctx.closePath(); ctx.fill(); R(ctx, -12, -0.4, 8, 0.8, '#2a3a5a'); ell(ctx, 1, 0, 2, 1.2, '#4a5a7a'); }
    else if (k === 'octo') { disc(ctx, 0, -2, 3.5, '#c86a6a'); for (let q = 0; q < 6; q++) line1(ctx, -2 + q * 0.8, 0, -4 + q * 1.6 + Math.sin(t * 4 + q) * 1.5, 5, '#c86a6a'); p1(ctx, 1, -2, '#ffffff'); }
    else if (k === 'butter') { disc(ctx, 0, 0, 3, '#f2d050'); R(ctx, -1, -3, 0.8, 6, '#1d1626'); R(ctx, -4 - w * 0.3, -1, 1.5, 2, '#f2d050'); R(ctx, 3, -0.3, 1.5, 0.6, '#1d1626'); }
    else if (k === 'lion') { ell(ctx, 0, 0, 4, 2, '#c84a3a'); for (let q = 0; q < 7; q++) line1(ctx, -2 + q, -1, -3 + q * 1.2, -5 - (q % 2) * 2 + w, q % 2 ? '#f4f1e6' : '#c84a3a'); R(ctx, -6, -1, 2, 2, '#c84a3a'); }
    else for (let q = 0; q < 9; q++) { const fx = (q % 3) * 4 - 4 + Math.sin(t * 3 + q) * 0.8, fy = (q / 3 | 0) * 3 - 3; ell(ctx, fx, fy, 1.8, 0.8, '#5ab8f0'); }
    ctx.restore(); }
  // the boat: white hull, a striped canopy over the benches, you on board, and a window in the floor that shines
  function drawGlass(e, x, y) { const s = e.face === 'l' ? -1 : 1, b = Math.sin(G.t * 1.8 + e.ph) * 0.6, yy = y + b, you = e.rider && !G.hidePl ? pl.F : null;
    ell(ctx, x, y + 1, 19, 4, 'rgba(20,60,90,0.25)'); ell(ctx, x, yy - 4, 18, 5, '#d8d4e4'); R(ctx, x - 17, yy - 9, 34, 6, '#ffffff'); R(ctx, x - 17, yy - 5, 34, 2, '#2f7ab0'); ell(ctx, x + s * 17, yy - 6, 3, 3.5, '#ffffff');
    R(ctx, x - 6, yy - 8, 12, 2, '#5ad8f0'); if (Math.sin(G.t * 3) > 0.6) R(ctx, x - 5, yy - 8, 3, 1, '#ffffff');
    if (you) ctx.drawImage(you.s.idle0[s < 0 ? 1 : 0], 0, 0, you.s.idle0[0].lw, 15, snap(x - s * 4 - 10), snap(yy - 24), you.s.idle0[0].lw, 15);
    for (const k of [-14, 13]) R(ctx, x + k, yy - 20, 1, 12, '#c8c0d4'); for (let i = 0; i < 8; i++) R(ctx, x - 16 + i * 4, yy - 22, 4, 3, i % 2 ? '#f4f1e6' : '#2f7ab0'); R(ctx, x - 16, yy - 22, 32, U, '#ffffff');
    R(ctx, x - 18, yy - 1.5, 36, 1, 'rgba(255,255,255,0.6)'); }
  function glassTick(e, dt) { e.seen = e.seen || {}; e.nt = (e.nt || 0) - dt;
    for (const c of CR) { c.t += dt; c.a += Math.sin(c.t * 0.7 + c.ph) * dt * 0.6; const nx = c.x + Math.cos(c.a) * c.sp * dt, ny = c.y + Math.sin(c.a) * c.sp * 0.5 * dt; if (terr(nx, ny) === WA && ny < SEA_Y - 20 && ny > 40) { c.x = nx; c.y = ny; } else c.a += 2.5;
      const d = Math.hypot(c.x - e.x, (c.y - e.y) * 1.4); if (d < 34 && !e.seen[c.k]) { e.seen[c.k] = 1; const n = Object.keys(e.seen).length; NET.say('SPOTTED: ' + CRIT.find(q => q[1] === c.k)[0] + '! (' + n + ' OF 5)', 3); Snd.fx('pick'); if (n >= 5 && !G.stamps.oki_reef) { RIDES.BOATS.oki_beach.stamp = 'oki_reef'; NET.say('FIVE! THE CAPTAIN IS IMPRESSED. TAKE THE BOAT BACK TO THE DOCK.', 4); } } } }
  function lens(cx, cy) { const e = G.ridee; if (!e || !e.boat || e.boat.kind !== 'glass' || !REEF) return;
    const lw = Math.min(120, W * 0.38), lh = lw * 0.66, lx = W - lw - 6, ly = TOUCH ? 60 : 26, sc = 2, vw = lw / sc, vh = lh / sc, sx = e.x - vw / 2, sy = e.y - vh / 2;
    R(ctx, lx - 3, ly - 3, lw + 6, lh + 6, '#6a4630'); R(ctx, lx - 2, ly - 2, lw + 4, lh + 4, '#a8744a'); ctx.save(); ctx.beginPath(); ctx.rect(lx, ly, lw, lh); ctx.clip();
    ctx.drawImage(REEF, Math.max(0, sx), Math.max(0, sy), vw, vh, lx, ly, lw, lh);
    for (const c of CR) { const px = lx + (c.x - sx) * sc, py = ly + (c.y - sy) * sc; if (px > lx - 20 && px < lx + lw + 20 && py > ly - 20 && py < ly + lh + 20) drawCritter(c.k, px, py, c.a, c.t, 1.6); }
    ctx.globalAlpha = 0.22; for (let k = 0; k < 26; k++) { const px = lx + ((k * 37 + G.t * 9) % lw), py = ly + ((k * 23 + Math.sin(G.t + k) * 6) % lh + lh) % lh, a = G.t * 0.8 + k; R(ctx, px, py, 4 + Math.sin(a) * 2, U, '#ffffff'); R(ctx, px + 2 + Math.cos(a) * 2, py + 1, U, 3, '#ffffff'); } ctx.globalAlpha = 1; // light dancing on the sea floor
    for (let k = 0; k < 5; k++) { const by = ly + lh - ((G.t * 20 + k * 17) % lh), bx = lx + 10 + k * lw / 5 + Math.sin(G.t * 2 + k) * 3; ctx.globalAlpha = 0.6; disc(ctx, bx, by, 1.2, '#e8f8ff'); } ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.12; R(ctx, lx, ly, lw * 0.3, lh, '#ffffff'); ctx.globalAlpha = 1; ctx.restore();
    const n = Object.keys(e.seen || {}).length; panel(lx, ly - 13, lw, 12); txt(ctx, 'THROUGH THE GLASS', lx + 4, ly - 10, '#2f7ab0'); txt(ctx, n + '/5', lx + lw - 4 - tw(n + '/5'), ly - 10, n >= 5 ? '#3f9a5a' : '#8a7a6a'); }
  MAPS.oki_beach = { name: 'EMERALD BEACH', sub: 'WHITE SAND AND A REEF', tw: 56, th: 40, music: 'okinawa', sea: 'tropic', sand: 'white', lookUp: [260, 420],
    zones: [[0, 0, 896, 300, 'THE REEF', 'EVERY BLUE THERE IS'], [0, 300, 896, 470, 'EMERALD BEACH', 'WHITE SAND, WARM WATER'], [0, 0, 896, 640, 'EMERALD BEACH', 'WHITE SAND AND A REEF']],
    lay() { tRect(WA, 0, 0, 56, 19); tRect(DT, 0, 18.5, 56, 29.5); for (const [x, r] of [[8, 5], [26, 7], [44, 6]]) tOval(DT, x, 18.6, r, 1); tOval(WA, 17, 18.8, 5, 1); tOval(WA, 36, 18.9, 5, 1.1); tRect(PL, 27.25, 15, 28.75, 19.5); tRect(GR, 0, 29.5, 56, 31); tRect(PV, 0, 31, 56, 40); },
    deco() {
      const g = M.ground.g; REEF = makeReef();
      // coral heads seen through the shallows, painted faintly onto the water
      const r = RNG(19); g.globalAlpha = 0.28; for (let k = 0; k < 80; k++) { const x = r() * 896, y = 150 + r() * 130; if (terr(x, y) !== WA) continue; ell(g, x, y, 4 + r() * 8, 2 + r() * 3, ['#a86ad8', '#e86a8a', '#3a7a8a', '#f2a050'][k % 4]); } g.globalAlpha = 1;
      PLACES.shore(200, 340, { period: 6.5, reach: 11, film: 'rgba(190,250,240,0.6)' });
      // the dock and the boat
      for (let y = 240; y < 312; y += 4) R(g, 436, y, 24, 3, '#c8a070'); R(g, 436, 240, 24, 72, 'rgba(0,0,0,0)'); for (const y of [240, 270]) { R(g, 434, y, 2, 6, '#6a4a30'); R(g, 460, y, 2, 6, '#6a4a30'); }
      CR = []; const cr = RNG(3); for (const [name, k] of CRIT) for (let n = 0; n < (k === 'school' || k === 'clown' ? 3 : 1); n++) for (let i = 0; i < 60; i++) { const x = 40 + cr() * 816, y = 60 + cr() * 200; if (terr(x, y) === WA && terr(x + 10, y) === WA) { CR.push({ k, x, y, a: cr() * 6.28, sp: k === 'turtle' || k === 'ray' ? 10 : 7, t: cr() * 9, ph: cr() * 6 }); break; } }
      npc('salary', 476, 318, { tint: '#2f7ab0', dir: 'l', lines: ['THE GLASS-BOTTOMED BOAT! STEER IT OVER THE REEF AND LOOK DOWN. FIND FIVE KINDS OF FISH.', 'THE TURTLE IS SHY. THE OCTOPUS IS SHYER.'] });
      // turtles that come up to breathe now and then
      for (const [x, y, o] of [[200, 120, 0], [640, 180, 9]]) M.ACT.push({ x, y, sayT: 0, draw(e, sx, sy) { const p = ((worldTime() + o) % 18) / 18; if (p > 0.18) return; const q = Math.sin(p / 0.18 * Math.PI); ell(ctx, sx, sy, 7 * q, 2.5 * q, '#5a7a4a'); disc(ctx, sx + 6, sy - 1, 2 * q, '#8aa86a'); ctx.globalAlpha = 0.6; for (let k = 0; k < 10; k++) { const a = k * 0.628; p1(ctx, sx + Math.cos(a) * (6 + q * 6), sy + Math.sin(a) * (2 + q * 2), '#ffffff'); } ctx.globalAlpha = 1; } });
      // the sand: umbrellas, loungers, a hammock, shells to find, and the beach bar
      for (const [x, y, c] of [[120, 380, 0], [240, 400, 1], [600, 390, 2], [760, 380, 0]]) { put(SPR['brolly' + c], x, y, 15, 27); block(x - 2, y - 3, x + 2, y); prop('lounger', x + 18, y + 8, 8); }
      for (const x of [40, 330, 520, 680, 860]) palm(x, 468); put(SPR.hammock, 200, 470, 22, 10); M.SPOTS.push({ x: 200, y: 474, r: 13, label: 'LIE IN THE HAMMOCK', fn: () => RIDES.sitAt({ x: 200, y: 466 }) });
      const SH = [[90, 350], [300, 440], [520, 360], [700, 430], [820, 340], [380, 330], [150, 450]]; V.shells = 0; V.got = {};
      SH.forEach(([x, y], i) => M.ACT.push({ x, y, sayT: 0, shell: 1, k: i, use(e) { e.hide = 1; V.shells++; Snd.fx('pick'); G.fx.push({ x: e.x, y: e.y - 6, t: 0, icon: 'shell' }); if (V.shells >= 5 && !G.stamps.oki_shells) dialog(['FIVE SHELLS: A SPIRAL, A COWRIE, A TINY CONE, A PINK ONE AND ONE WITH A HERMIT CRAB STILL IN IT. YOU PUT THAT ONE BACK.', 'THE SAND HERE IS NOT SAND, MOSTLY. IT IS BITS OF CORAL AND STAR-SHAPED SHELLS, GROUND DOWN BY THE WAVES.'], () => award('oki_shells')); else say(pl, V.shells + ' SHELLS!'); }, label: () => 'PICK UP',
        draw(e, sx, sy) { const c = ['#f8d8e0', '#f4ead4', '#e8c8a0', '#f8f4ee'][e.k % 4]; if (e.k % 2) { ell(ctx, sx, sy - 1, 2.5, 1.6, c); R(ctx, sx - 2, sy - 1.5, 4, U, dark(c, 0.2)); } else { disc(ctx, sx, sy - 1.5, 1.8, c); disc(ctx, sx + 0.5, sy - 1.8, 0.8, dark(c, 0.25)); } if (Math.sin(G.t * 2 + e.k) > 0.9) p1(ctx, sx - 1, sy - 3, '#ffffff'); } }));
      put(SPR.beachbar, 760, 470, 34, 37); block(728, 456, 792, 470); const ice = npc('teen', 730, 480, { tint: '#8a6aff', dir: 'd', lines: ['BENI-IMO! PURPLE SWEET POTATO SOFT SERVE!'] }); ice.spot = { label: 'BUY A PURPLE ICE CREAM', stamp: 'oki_ice', act: 'hold', fx: 'munch', lines: ['A SWIRL OF SOFT SERVE THE COLOUR OF A SUNSET, MADE FROM OKINAWA\'S PURPLE SWEET POTATOES.', 'IT TASTES LIKE A SWEET POTATO THAT WENT TO A VERY GOOD SCHOOL. IT MELTS FASTER THAN YOU CAN EAT IT.'] };
      npc('kid', 440, 380, { rad: 30, tint: '#f2c14e', lines: ['I FOUND A STAR! A SAND STAR! THEY ARE TINY SHELLS SHAPED LIKE STARS!'] }); npc('granny', 300, 360, { rad: 20, tint: '#f06a8c', lines: ['NIFEE DEBIRU. THAT IS THANK YOU, IN THE OLD LANGUAGE. SAY IT TO THE SEA.'] });
      // the road behind the beach, the hotel and the bus
      for (const [x, w, h] of [[120, 150, 90], [380, 110, 70], [620, 160, 100]]) tower(x, 620, w, h, { c: '#f4f1e6', wc: '#bfe8ff', gx: 8, ww: 4, lit: 0.3, sign: x === 380 ? 'BEACH HOTEL' : null, sc: '#2f7ab0' });
      busStop(820, 540); prop('vend3', 760, 540, 6); prop('bench', 860, 600, 9); islanders(5, 20, 520, 876, 520, 10); islanders(4, 20, 420, 876, 420, 30); M.ACT.push({ cat: true, x: 560, y: 520, k: 1 });
      bottomRow(41); M.LIGHTS = [];
    },
    over(cx, cy) { gulls(cx, cy); lens(cx, cy); } };
  RIDES.BOATS.oki_beach = { kind: 'glass', stamp: null, dock: [448, 316], label: 'RIDE THE GLASS-BOTTOM BOAT', top: 30, draw: drawGlass, tick: glassTick, doneLine: 'THE CAPTAIN TIES UP AND SHAKES YOUR HAND. "FIVE! MOST PEOPLE ONLY FIND THE FISH THAT WANT TO BE FOUND."' };

  // ---------- eisa: strike the drum as each beat reaches the circle ----------
  const EISA = {
    init(m) { const pat = [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1]; m.notes = []; pat.forEach((on, i) => { if (on) m.notes.push({ t: 1.6 + i * BEAT * 0.5, big: i % 4 === 0, hit: 0 }); }); m.clock = 0; m.score = 0; m.combo = 0; m.msg = ''; m.mt = 0; m.flash = 0; m.end = m.notes[m.notes.length - 1].t + 1; },
    update(m, dt) { m.clock += dt; if (m.mt > 0) m.mt -= dt; if (m.flash > 0) m.flash -= dt;
      for (const n of m.notes) if (!n.hit && m.clock - n.t > 0.18) { n.hit = -1; m.combo = 0; m.msg = 'MISS'; m.mt = 0.4; }
      if (KP.a) { const n = m.notes.find(q => !q.hit && Math.abs(q.t - m.clock) < 0.18); if (n) { const d = Math.abs(n.t - m.clock); n.hit = d < 0.08 ? 2 : 1; m.score += n.hit; m.combo++; m.msg = d < 0.08 ? 'PERFECT!' : 'GOOD'; m.mt = 0.4; m.flash = 0.15; PLACES.SND.drum(n.big); } else { PLACES.SND.drum(false); m.combo = 0; } }
      if (m.clock > m.end) { const max = m.notes.length * 2, ok = m.score >= max * 0.6; if (ok) endMini(true, ['THE LAST BEAT, AND EVERYONE SHOUTS "HAI-YA!" TOGETHER. YOUR ARMS ARE SHAKING. YOUR HEART IS POUNDING LIKE THE DRUM.', 'THE LEADER TIES A RED HEADBAND ON YOU. "CHIBARIYO," SHE SAYS. KEEP IT UP.']); else endMini(false, ['YOU ARE HALF A BEAT BEHIND THE WHOLE TIME, AND YOU DROP A STICK.', 'NOBODY MINDS. "THE ANCESTORS LIKE ENTHUSIASM," THE LEADER SAYS. "AGAIN!"']); } },
    draw(m) {
      txtC(ctx, 'EISA', 160, 26, '#c8382e', null, 2); R(ctx, 56, 38, 208, 70, '#3a2e40'); for (let x = 60; x < 264; x += 26) chochin(ctx, x, 40, ['#e0452f', '#f2c14e'][(x / 26 | 0) % 2], 0.8);
      const hx = 96, hy = 84; R(ctx, 56, hy - 1, 208, 2, '#5a4a5a'); disc(ctx, hx, hy, 11, m.flash > 0 ? '#fff0c0' : '#5a4a5a'); disc(ctx, hx, hy, 9, '#3a2e40'); disc(ctx, hx, hy, 8, m.flash > 0 ? '#f2c14e' : '#4a3e50');
      for (const n of m.notes) { if (n.hit > 0) continue; const x = hx + (n.t - m.clock) * 110; if (x < 50 || x > 270) continue; const r = n.big ? 7 : 5; disc(ctx, x, hy, r + 1, '#1d1626'); disc(ctx, x, hy, r, n.hit < 0 ? '#6a6a7e' : '#c8382e'); disc(ctx, x, hy, r - 2, n.hit < 0 ? '#8a8a9e' : '#f4ead4'); }
      const F = pl.F, b = (m.clock / BEAT) % 1, jump = Math.max(0, Math.sin(b * Math.PI)) * 3; ctx.drawImage(F.d[1 + Math.floor(m.clock / BEAT) % 4], 210, 52 - jump); disc(ctx, 226, 66 - jump, 5, '#c8382e'); disc(ctx, 226, 66 - jump, 4, '#f4ead4'); line1(ctx, 216, 60 - jump, 216 + (m.flash > 0 ? 8 : 3), 60 - jump + (m.flash > 0 ? 4 : -6), '#8a5a3a');
      txt(ctx, 'COMBO ' + m.combo, 62, 96, '#f2c14e'); R(ctx, 70, 114, 180, 3, '#d9cba8'); R(ctx, 70, 114, 180 * Math.min(1, m.clock / m.end), 3, '#c8382e');
      txtC(ctx, m.mt > 0 ? m.msg : m.clock < 1.4 ? 'GET READY... E WHEN EACH DRUM REACHES THE CIRCLE' : 'E ON THE BEAT!', 160, 126, '#3a2e40');
    }
  };

  airport('oka', { name: 'NAHA AIRPORT', short: 'OKINAWA', code: 'OKA', sub: 'THE ISLANDS OF THE SOUTH', gate: 21, music: 'okinawa', welcome: 'MENSORE! WELCOME TO OKINAWA', other: 'haneda', city: ['oki_kokusai', 'KOKUSAI DORI'], view: 'sea',
    tip: 'THE MONORAIL GOES INTO TOWN. THE CRUISE SHIPS TO THE MAINLAND LEAVE FROM NAHA PORT.' });
  city({
    id: 'okinawa', name: 'OKINAWA', tagline: 'THE ISLANDS OF THE SOUTH', start: 'oki_port', hub: 'oki_port', line: LINE, areas: LINE.slice(0, 4), stamps: STAMPS, cats: 3, via: 'ship', dock: ['oki_port', 500, 200, 'd'], cruiseStamp: 'oki_cruise', rideSpr: 'rideOki', gate: ['CRUISE SHIP', 'THE SHIP AT THE WHARF'], minis: { eisa: EISA },
    sprites() {
      variants('palm', 3, (r, i) => { const c = mk(56, 62), g = c.g, lean = (i - 1) * 4; for (let y = 60; y > 18; y--) { const t = (60 - y) / 42, x = 28 + lean * t * t; R(g, x - 2, y, 4, 1, (y % 4) < 2 ? '#8a6a48' : '#a8845a'); }
        const tx = 28 + lean, ty = 18; for (let k = 0; k < 7; k++) { const a = -2.6 + k * 0.85, len = 18 + (k % 2) * 4; for (let q = 0; q < len; q++) { const px = tx + Math.cos(a) * q, py = ty + Math.sin(a) * q * 0.6 + q * q * 0.025; R(g, px, py, 1.5, 1.5, q > len * 0.7 ? '#5aa85a' : '#3a8a4a'); if (q % 3 === 0) { R(g, px, py + 1, 1, 2.5, '#2f6a3a'); } } } disc(g, tx, ty + 1, 2, '#6a4a30'); disc(g, tx + 2, ty + 2, 1.5, '#8a6a30'); return outline(c); });
      one('nshrineH', 120, 60, g => templeHall(g, 60, 58, 84, 22, { wall: '#c8382e', roof: ROOF, plaster: '#f4ecd8', door: '#8a2a24', bays: 5 }));
      one('shisaS', 8, 8, g => { R(g, 1, 4, 6, 4, '#d8603a'); disc(g, 4, 3, 2.6, '#d8603a'); R(g, 2, 1, 4, 1, '#a8402a'); P(g, 3, 3, '#1d1626'); P(g, 5, 3, '#1d1626'); R(g, 3, 4.5, 2, 1, '#f4f1e6'); });
      one('shisaB', 50, 58, g => { R(g, 4, 48, 42, 10, '#8c8498'); R(g, 4, 48, 42, 1.5, '#c8c0d4'); ell(g, 25, 38, 16, 12, '#d8603a'); ell(g, 25, 18, 15, 14, '#e8703a'); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; disc(g, 25 + Math.cos(a) * 15, 18 + Math.sin(a) * 13, 3, k % 2 ? '#c8502a' : '#f08a4a'); } disc(g, 19, 15, 3, '#f4f1e6'); disc(g, 31, 15, 3, '#f4f1e6'); disc(g, 19, 15, 1.5, '#1d1626'); disc(g, 31, 15, 1.5, '#1d1626'); ell(g, 25, 26, 8, 4, '#8a2a24'); for (let k = 0; k < 5; k++) R(g, 18 + k * 3, 23, 2, 2, '#f4f1e6'); ell(g, 25, 20, 4, 2.5, '#c8502a'); for (const x of [14, 36]) ell(g, x, 47, 5, 3, '#e8703a'); }, 1);
      one('seiden', 180, 92, g => { R(g, 6, 84, 168, 8, '#c8c0b0'); R(g, 20, 44, 140, 42, '#c8382e'); for (let x = 24; x < 156; x += 12) { R(g, x, 50, 8, 34, '#a82a20'); R(g, x + 3, 50, 2, 34, '#f2c14e'); } R(g, 74, 56, 32, 28, '#2a1a18'); R(g, 20, 44, 140, 3, '#f2c14e'); roof(g, 90, 22, 60, 86, 22, ROOF); R(g, 60, 6, 60, 18, '#c8382e'); roof(g, 90, -2, 28, 40, 12, ROOF); for (const x of [56, 124]) { R(g, x, 4, 3, 6, '#f2c14e'); disc(g, x + 1.5, 3, 2, '#f2c14e'); } R(g, 80, 26, 20, 10, '#f2c14e'); R(g, 82, 28, 16, 6, '#3a3a6a'); for (const x of [62, 118]) { R(g, x, 60, 3, 24, '#f2c14e'); for (let y = 62; y < 84; y += 4) R(g, x - 1, y, 5, 1.5, '#d8a030'); } }, 1);
      one('shureimon', 100, 60, g => { R(g, 2, 56, 96, 4, '#8c8498'); for (const x of [14, 46, 78]) { R(g, x, 22, 8, 34, '#c8382e'); R(g, x, 22, 2, 34, '#e86a50'); } R(g, 10, 22, 80, 4, '#a82a20'); roof(g, 50, 8, 34, 50, 14, ROOF); roof(g, 50, -2, 20, 32, 10, ROOF); R(g, 40, 12, 20, 6, '#2a1a18'); R(g, 42, 13, 16, 4, '#f2c14e'); }, 1);
      one('wallcap', 12, 12, g => { R(g, 1, 2, 10, 10, '#d8d0c0'); R(g, 1, 2, 10, 1.5, '#f0e8dc'); ell(g, 6, 2, 5, 1.6, '#e8e0d0'); }, 1);
      one('lounger', 22, 10, g => { R(g, 1, 4, 20, 3, '#f4f1e6'); R(g, 1, 4, 20, 1, '#ffffff'); line1(g, 14, 4, 20, 0, '#f4f1e6'); R(g, 2, 7, 1, 3, '#8a8496'); R(g, 18, 7, 1, 3, '#8a8496'); }, 1);
      one('hammock', 44, 14, g => { R(g, 0, 0, 2, 14, '#8a6a48'); R(g, 42, 0, 2, 14, '#8a6a48'); for (let x = 2; x < 42; x++) { const y = 3 + Math.sin((x - 2) / 40 * Math.PI) * 6; R(g, x, y, 1, 2.5, (x / 3 | 0) % 2 ? '#f06a8c' : '#f2c14e'); } }, 1);
      one('beachbar', 68, 40, g => { for (const x of [4, 62]) R(g, x, 12, 3, 28, '#8a6a48'); R(g, 6, 22, 56, 14, '#c89a6a'); R(g, 6, 22, 56, 1.5, '#e8c090'); for (let x = 8; x < 60; x += 6) R(g, x, 24, 4, 10, '#a8744a'); for (let i = 0; i < 18; i++) R(g, i * 4 - 2, 4, 4, 9, i % 2 ? '#f4e0a0' : '#d8b870'); R(g, -2, 3, 72, 1.5, '#8a6a48'); R(g, 16, 14, 36, 7, '#8a6aff'); txt(g, 'BENI-IMO', 18, 15, '#ffffff'); }, 1);
      one('mpillar', 10, 40, g => { R(g, 2, 0, 6, 40, '#d8d4cc'); R(g, 2, 0, 2, 40, '#ece8e0'); R(g, 0, 0, 10, 3, '#c8c4bc'); }, 1);
      one('yui', 60, 26, g => { R(g, 2, 2, 56, 18, '#f4f1e6'); R(g, 2, 13, 56, 3, '#2aa8b8'); R(g, 2, 16, 56, 1.5, '#f08a2a'); ell(g, 57, 11, 3, 9, '#f4f1e6'); ell(g, 3, 11, 3, 9, '#f4f1e6'); for (let x = 6; x < 54; x += 7) { R(g, x, 5, 5, 6, '#2a3a5a'); R(g, x, 5, 5, 1, '#6a8ab0'); } R(g, 8, 20, 44, 5, '#8a8496'); }, 1);
      SPR.rideOki = (() => { const c = mk(320, 84), g = c.g, r = RNG(81); dgrad(g, 0, 0, 320, 84, ['#5aa8e8', '#9ad0f0', '#e4f2f8']); dgrad(g, 0, 40, 320, 14, ['#2fb6cc', '#5cd6d2']); for (let k = 0; k < 20; k++) R(g, r() * 320, 42 + r() * 10, 6, U, '#ffffff'); for (let x = -8; x < 330; x += 20) { const h = 8 + r() * 14; R(g, x, 84 - h, 16, h, '#f4f1e6'); R(g, x + 2, 84 - h - 2, 4, 2, '#8a8496'); R(g, x + 9, 84 - h - 4, 5, 4, '#c8c0d4'); if (r() < 0.4) R(g, x, 84 - h - 3, 16, 3, ROOF); } for (let k = 0; k < 6; k++) { const x = 20 + k * 56; R(g, x, 50, 1.5, 14, '#8a6a48'); for (let q = 0; q < 5; q++) line1(g, x, 50, x - 6 + q * 3, 46 + (q % 2) * 2, '#3a8a4a'); } return c; })();
      icon('nshrine', g => { R(g, 1, 5, 10, 4, '#c8382e'); R(g, 0, 3, 12, 2, ROOF); R(g, 0, 9, 12, 3, '#5ac8d8'); P(g, 2, 2, '#d8603a'); });
      icon('shisa', g => { disc(g, 6, 5, 4, '#e8703a'); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; P(g, 6 + Math.cos(a) * 4.5, 5 + Math.sin(a) * 4, '#c8502a'); } P(g, 4.5, 4, '#1d1626'); P(g, 7.5, 4, '#1d1626'); R(g, 4, 7, 4, 1.5, '#8a2a24'); R(g, 3, 9, 6, 3, '#d8603a'); });
      icon('eisa', g => { disc(g, 6, 6, 5, '#c8382e'); disc(g, 6, 6, 3.8, '#f4ead4'); line(g, 9, 1, 12, 4, '#8a5a3a'); });
      icon('andagi', g => { disc(g, 6, 7, 4.5, '#c87a2a'); disc(g, 5, 6, 3, '#e8a040'); line(g, 4, 4, 7, 7, '#a85a1a'); P(g, 4, 5, '#f8d080'); });
      icon('mfish', g => { ell(g, 6, 6, 5, 2.5, '#2a8aff'); ell(g, 5, 5.5, 3, 1.2, '#5ac8ff'); R(g, 10, 4, 2, 5, '#2a6ad8'); P(g, 3, 5, '#1d1626'); R(g, 0, 10, 12, 2, '#dceef8'); });
      icon('osoba', g => { ell(g, 6, 7, 5, 3, '#f4f1e6'); R(g, 1, 6, 10, 1, '#d8c890'); R(g, 3, 5, 3, 2, '#a8603a'); R(g, 7, 5, 2, 2, '#5aa85a'); R(g, 4, 10, 4, 1, '#c8c0b0'); });
      icon('sgate', g => { R(g, 2, 5, 2, 6, '#c8382e'); R(g, 8, 5, 2, 6, '#c8382e'); R(g, 1, 3, 10, 2, ROOF); R(g, 3, 1, 6, 2, ROOF); R(g, 0, 11, 12, 1, '#8c8498'); });
      icon('seiden', g => { R(g, 1, 6, 10, 5, '#c8382e'); R(g, 3, 7, 1, 4, '#f2c14e'); R(g, 8, 7, 1, 4, '#f2c14e'); R(g, 0, 4, 12, 2, ROOF); R(g, 3, 2, 6, 2, ROOF); R(g, 5, 7, 2, 4, '#2a1a18'); });
      icon('coral', g => { R(g, 0, 9, 12, 3, '#f0e4c4'); for (const [x, c] of [[2, '#e86a8a'], [6, '#a86ad8'], [10, '#f2a050']]) { R(g, x - 0.5, 4, 1.5, 6, c); R(g, x - 2, 5, 1, 2, c); R(g, x + 1, 3, 1, 2, c); } P(g, 8, 2, '#f2d050'); });
      icon('beniice', g => { R(g, 4, 7, 4, 5, '#d8a060'); for (let k = 0; k < 3; k++) ell(g, 6, 6 - k * 2, 3.5 - k, 1.8, '#a86ad8'); P(g, 6, 0, '#c890f0'); });
      icon('shell', g => { for (let k = 0; k < 5; k++) { const a = -2.4 + k * 0.6; line(g, 6, 10, 6 + Math.cos(a) * 5, 9 + Math.sin(a) * 6, '#f4d8c0'); } ell(g, 6, 7, 5, 4, 'rgba(0,0,0,0)'); R(g, 3, 9, 6, 2, '#e8b8a0'); });
    }
  });
})();
