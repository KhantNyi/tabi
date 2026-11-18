'use strict';
// ---------- Osaka: four districts on the loop line ----------
// Dotonbori has two levels, the street and the canal walk below it, joined by steps and bridges, with a temple hidden
// behind the shops down a gap in the row. The castle sits inside two moats behind stone walls; Shinsekai's tower stands
// on legs you can walk under; Kuromon is a straight market arcade, because markets are.
(function () {
  const LINE = [['osa_namba', 'NAMBA'], ['osa_kuromon', 'KUROMON'], ['osa_shinsekai', 'SHINSEKAI'], ['osa_castle', 'OSAKA CASTLE']];
  const STAMPS = {
    osa_runman: ['THE RUNNING MAN', 'runner', 'osa_namba'], osa_crab: ['GIANT CRAB', 'crab', 'osa_namba'], osa_tako: ['TAKOYAKI', 'tako', 'osa_namba'], osa_okono: ['OKONOMIYAKI', 'okono', 'osa_namba'], osa_hozen: ['HOZEN-JI', 'lantern', 'osa_namba'], osa_cruise: ['TOMBORI CRUISE', 'boat', 'osa_namba'],
    osa_market: ['KUROMON TASTING', 'fish', 'osa_kuromon'],
    osa_tower: ['TSUTENKAKU', 'tsuten', 'osa_shinsekai'], osa_billiken: ['BILLIKEN\'S FEET', 'billiken', 'osa_shinsekai'], osa_kushi: ['KUSHIKATSU', 'kushi', 'osa_shinsekai'],
    osa_castle: ['OSAKA CASTLE', 'castle', 'osa_castle'], osa_keep: ['VIEW FROM THE KEEP', 'sun', 'osa_castle'], osa_plum: ['PLUM GROVE', 'plum', 'osa_castle']
  };
  const V = { taste: {} };
  const NEON = ['#ff6aa8', '#5ad8f0', '#ffd84a', '#8a6aff', '#ff8a4a'];

  // ---------- Dotonbori ----------
  MAPS.osa_namba = { name: 'DOTONBORI', sub: 'EAT UNTIL YOU DROP', tw: 48, th: 27, music: 'osaka', night: 1, tint: '#7078c0',
    zones: [[520, 0, 768, 150, 'HOZEN-JI YOKOCHO', 'A LANTERN ALLEY BEHIND THE SHOPS'], [0, 226, 768, 340, 'DOTONBORI CANAL', 'NEON ON THE WATER'], [0, 0, 768, 432, 'DOTONBORI', 'EAT UNTIL YOU DROP']],
    lay() { tRect(PL, 0, 0, 48, 27); tRect(WA, 0, 17, 48, 21); tRect(VL, 33, 2, 46, 8.5); },
    deco() {
      const g = M.ground.g;
      roofs(0, 0, 528, 146); roofs(736, 0, 768, 146); roofs(528, 0, 736, 32);
      ledge([[0, 224], [384, 222], [768, 224]], 12, 'stone'); steps(120, 224, 24, 16); steps(640, 224, 24, 16);
      bridge(216, 218, 240, 342, '#8a8496', '#b8b0c0'); bridge(368, 218, 400, 342, '#8a8496', '#b8b0c0');
      // the north row of shops, with a gap at 584-608 into the alley
      station(64, 160, 'NAMBA'); shinkansen(140, 160);
      house(196, 160, 52, 28, { sign: 'TAKOYAKI', noren: '#e0563f', rh: 14, lantern: true, to: 'o_tako' });
      tower(300, 160, 110, 100, { c: '#4a4a6a', art: (q, x, t) => { const bx = x + 6, bw = 98, by = t + 6; R(q, bx - 2, by - 2, bw + 4, 54, '#1d1626'); dgrad(q, bx, by, bw, 50, ['#3a7ad8', '#6ab0f0', '#a8d8f8']); for (let k = 0; k < 3; k++) R(q, bx, by + 38 + k * 4, bw, 1, '#f4f1e6'); const cx = bx + bw / 2; R(q, cx - 3, by + 14, 6, 13, '#f4f1e6'); disc(q, cx, by + 10, 4, '#f6cfa6'); line(q, cx - 3, by + 15, cx - 12, by + 4, '#f6cfa6'); line(q, cx + 3, by + 15, cx + 12, by + 4, '#f6cfa6'); line(q, cx - 2, by + 27, cx - 9, by + 36, '#3a5aa8'); line(q, cx + 2, by + 27, cx + 6, by + 37, '#3a5aa8'); R(q, cx - 3, by + 25, 6, 3, '#3a5aa8'); for (let k = 0; k < bw + 4; k += 4) { R(q, bx - 2 + k, by - 2, 2, 2, NEON[(k / 4) % 5]); R(q, bx - 2 + k, by + 50, 2, 2, NEON[(k / 4 + 2) % 5]); } } });
      house(404, 160, 56, 28, { sign: 'RAMEN', noren: '#c8382e', rh: 14, lantern: true }); house(484, 160, 72, 30, { sign: 'CRAB', noren: '#c8382e', rh: 14, lantern: true }); put(SPR.crab, 484, 161, 46, 82);
      house(554, 160, 52, 28, { sign: 'OKONOMIYAKI', noren: '#e08a3a', rh: 14, lantern: '#f2c14e', to: 'o_okono' });
      tower(650, 160, 64, 80, { c: '#5a4a9a', sign: 'KARAOKE', sc: '#f06a8c', vs: 5, vc: '#5ad8f0' }); tower(730, 160, 64, 90, { c: '#3a3a5a', vs: 6, vc: '#ffd84a' });
      stampSpot('osa_runman', 384, 292, 'TAKE A PHOTO', 'snap', ['THE RUNNING MAN ON HIS BLUE TRACK, ARMS UP, FINISHING A RACE THAT NEVER ENDS.', 'EVERYONE ON THE BRIDGE IS DOING HIS POSE FOR THEIR PHOTO. SO ARE YOU.'], 14);
      stampSpot('osa_crab', 484, 176, 'TAKE A PHOTO', 'snap', ['A CRAB AS BIG AS A CAR, WAVING ITS CLAWS AND LEGS OVER THE DOOR.', 'IT HAS BEEN WAVING SINCE 1960. IT HAS NEVER ONCE BEEN TIRED.']);
      // Hozen-ji, behind the shops
      put(SPR.hozen, 632, 82, 55, 68); block(600, 66, 664, 82); prop('fudo', 696, 112, 6); for (const x of [552, 720]) prop('lanternM', x, 128, 4); for (const x of [556, 600, 700]) M.LIGHTS.push([x, 60, 18, '#ffb070']);
      stampSpot('osa_hozen', 696, 124, 'SPLASH WATER', 'bow', ['YOU LADLE WATER OVER THE STATUE AND MAKE A WISH. EVERYONE DOES, SO HE IS COVERED IN THICK GREEN MOSS.', 'A HUNDRED STEPS FROM THE NEON AND IT IS AS QUIET AS A FOREST.']);
      npc('granny', 580, 100, { lines: ['MOST PEOPLE WALK RIGHT PAST THE GAP BETWEEN THE SHOPS.', 'THE LANTERNS HERE HAVE BEEN LIT EVERY NIGHT FOR SEVENTY YEARS.'] }); M.ACT.push({ cat: true, id: 'alley', x: 560, y: 60, k: 1 });
      // the canal
      for (const [x, y] of [[560, 316], [130, 302]]) put(SPR.cruise, x, y, 28, 14); for (let x = 40; x < 768; x += 80) M.LIGHTS.push([x, 300, 22, NEON[(x / 80 | 0) % 5]]);
      M.LIGHTS.push([300, 90, 48, '#8ac0ff'], [484, 120, 30, '#ff6a4a'], [650, 120, 24, '#f06a8c'], [196, 140, 20, '#ffd98a']);
      for (const x of [60, 300, 500, 700]) prop('lamp', x, 262, 2);
      npc('chef', 230, 182, { lines: ['TAKOYAKI! FRESH OFF THE IRON! MIND YOUR TONGUE, THEY ARE LAVA INSIDE!'] }); npc('salary', 440, 252, { lines: ['IN OSAKA WE SAY KUIDAORE. EAT UNTIL YOU DROP.', 'I HAVE DROPPED TWICE TONIGHT. I AM GOING FOR THREE.'] });
      npc('teen', 300, 360, { tint: '#ffd84a', lines: ['THE BOAT GOES UNDER ALL THE BRIDGES. THE GUIDE TELLS JOKES THE WHOLE WAY.', 'OSAKA PEOPLE ARE CONTRACTUALLY OBLIGED TO BE FUNNY.'] });
      crowd(7, 40, 190, 740, 190, 10); crowd(6, 740, 250, 40, 250, 6); crowd(3, 384, 222, 384, 340, 3); crowd(5, 40, 380, 740, 380, 10); bottomRow(77);
    } };

  // ---------- Kuromon Market ----------
  const taste = (id, lines) => () => { V.taste[id] = 1; Snd.fx('munch'); const n = count(V.taste); dialog(n < 3 ? lines.concat(['(' + n + ' OF 3 STALLS TASTED)']) : lines, n >= 3 ? () => award('osa_market') : null); };
  MAPS.osa_kuromon = { name: 'KUROMON MARKET', sub: 'OSAKA\'S KITCHEN', tw: 44, th: 24, music: 'osaka',
    lay() { tRect(PL, 0, 0, 44, 24); },
    deco() {
      const g = M.ground.g; roofs(0, 0, 704, 130);
      for (let x = 0; x < 704; x += 32) R(g, x, 188, 16, 6, 'rgba(255,255,255,0.12)');
      const SH = [[40, 'FISH', '#3d5a80'], [104, 'FRUIT', '#5aa85a'], [168, 'PICKLES', '#c8a04a'], [232, 'TUNA', '#c8382e'], [296, 'SCALLOPS', '#3f7ab0'], [360, 'FUGU', '#5a8a8a'], [424, 'TEA', '#5a8a5a'], [488, 'CRAB', '#c8382e'], [552, 'KNIVES', '#3a3a4e'], [616, 'SWEETS', '#f06a8c'], [680, 'TOFU', '#f4f1e6']];
      for (const [x, s, c] of SH) house(x, 144, 56, 28, { sign: s, noren: c, rh: 14, roof: 'awning', roofCol: c === '#f4f1e6' ? '#5a8a5a' : c });
      prop('fugu', 384, 150, 0);
      for (let x = 30; x < 700; x += 52) if (x < 300 || x > 380) { prop(x % 3 ? 'stall' : 'fishbox', x, 238, 12); }
      const v = (name, x, label, id, tint, lines) => { const n = npc(name, x, 160, { tint, lines: ['IRASSHAI!'] }); n.spot = { label, fn: taste(id, lines) }; };
      v('chef', 296, 'TRY A SCALLOP', 'scallop', '#3f7ab0', ['A SCALLOP THE SIZE OF YOUR PALM, GRILLED IN ITS SHELL WITH BUTTER AND SOY.', 'THE MAN BLOWTORCHES THE TOP FOR YOU. JUST FOR FUN.']);
      v('salary', 232, 'TRY THE TUNA', 'tuna', '#c8382e', ['A SLICE OF FATTY TUNA SO SOFT IT MELTS BEFORE YOU CAN CHEW.', 'THE FISHMONGER WATCHES YOUR FACE AND NODS. HE HAS SEEN THAT FACE BEFORE.']);
      v('granny', 104, 'TRY A STRAWBERRY', 'berry', '#5aa85a', ['ONE STRAWBERRY AS BIG AS AN EGG, ON A STICK. IT COSTS AS MUCH AS LUNCH.', 'IT IS WORTH IT. DO NOT TELL ANYONE.']);
      roofs(0, 248, 320, 322); roofs(368, 248, 704, 322);
      for (const [x, s] of [[60, 'DRUGSTORE'], [140, 'COFFEE'], [230, 'GIFTS'], [420, 'BAKERY'], [500, 'BOOKS']]) tower(x, 336, 64, 40, { sign: s, sc: '#3f7ab0' });
      station(620, 336, 'NIPPOMBASHI'); bottomRow(81);
      npc('granny', 470, 200, { rad: 30, lines: ['I HAVE SHOPPED HERE FOR SIXTY YEARS. THE TUNA MAN KNEW MY MOTHER.'] }); npc('tourist', 160, 210, { rad: 30, lines: ['I CAME FOR BREAKFAST. IT IS NOW THREE O\'CLOCK.'] }); npc('kid', 344, 290, { lines: ['THE FUGU IS POISONOUS IF YOU COOK IT WRONG. DAD SAYS THIS MAN NEVER COOKS IT WRONG.'] }); M.ACT.push({ cat: true, x: 600, y: 210, k: 2 });
      crowd(7, 20, 180, 690, 180, 8); crowd(7, 690, 214, 20, 214, 8); crowd(3, 344, 250, 344, 360, 6); crowd(4, 20, 360, 690, 360, 6);
    } };

  // ---------- Shinsekai ----------
  MAPS.osa_shinsekai = { name: 'SHINSEKAI', sub: 'THE NEW WORLD, A HUNDRED YEARS OLD', tw: 40, th: 26, music: 'osaka', night: 1, tint: '#8a78c0',
    lay() { tRect(PL, 0, 0, 40, 26); },
    deco() {
      const g = M.ground.g; roofs(0, 0, 640, 178);
      house(56, 192, 56, 28, { sign: 'KUSHIKATSU', noren: '#c8382e', rh: 14, lantern: true, to: 'o_kushi' }); tower(130, 192, 60, 60, { c: '#5a4a9a', sign: 'SMART BALL', sc: '#f06a8c', vs: 4, vc: '#ffd84a' }); house(210, 192, 56, 28, { sign: 'SHOGI', noren: '#3d5a80', rh: 14 });
      tower(320, 192, 64, 70, { c: '#3a3a5a', sign: 'DOTE-YAKI', sc: '#e08a3a', vs: 5, vc: '#ff6aa8' }); house(420, 192, 56, 28, { sign: 'FUGU', noren: '#5a8a8a', rh: 14, lantern: true }); prop('fugu', 450, 186, 0);
      tower(500, 192, 60, 64, { c: '#4a4a6a', sign: 'ARCADE', sc: '#5ad88a', st: '#1d1626', vs: 5, vc: '#5ad8f0' }); house(590, 192, 56, 28, { sign: 'KUSHIKATSU', noren: '#8a2a24', rh: 14, lantern: true });
      put(SPR.tsuten, 320, 272, 45, 204); block(282, 266, 289, 272); block(351, 266, 358, 272);
      R(g, 286, 250, 68, 22, 'rgba(255,224,138,0.12)');
      stampSpot('osa_tower', 320, 292, 'LOOK UP', 'snap', ['TSUTENKAKU: TOWER REACHING TO HEAVEN. IT STANDS ON FOUR LEGS RIGHT OVER THE STREET.', 'THE LIGHTS ON TOP CHANGE COLOUR WITH TOMORROW\'S WEATHER.'], 14);
      prop('billikenS', 250, 286, 6); stampSpot('osa_billiken', 250, 296, 'RUB HIS FEET', 'bow', ['BILLIKEN, THE GOD OF THINGS AS THEY OUGHT TO BE, GRINS AT YOU.', 'HIS FEET ARE WORN SMOOTH BY A HUNDRED YEARS OF PEOPLE TICKLING THEM FOR LUCK.'], 12);
      roofs(0, 306, 288, 338); roofs(352, 306, 640, 338);
      for (const [x, s, c] of [[60, 'JAN JAN', '#c8382e'], [140, 'SHOOTING', '#5ad888'], [220, 'BATHHOUSE', '#3f7ab0'], [420, 'KUSHIKATSU', '#c8382e'], [490, 'RETRO TOYS', '#f2c14e']]) house(x, 352, 60, 28, { sign: s, noren: c, rh: 14, lantern: true });
      station(580, 352, 'EBISUCHO'); bottomRow(91);
      M.LIGHTS.push([320, 150, 44, '#ffe08a'], [320, 100, 22, '#4ad0f0'], [320, 200, 30, '#ff6aa8'], [130, 150, 22, '#f06a8c'], [500, 150, 22, '#5ad88a'], [56, 180, 18, '#ffd98a'], [590, 180, 18, '#ffd98a']);
      npc('salary', 200, 230, { lines: ['THE RULE AT THE KUSHIKATSU COUNTER: NO DOUBLE DIPPING IN THE SAUCE.', 'BREAK IT AND THE WHOLE COUNTER WILL TURN AND LOOK AT YOU.'] }); npc('granny', 470, 240, { rad: 20, lines: ['THIS WAS THE NEW WORLD IN 1912. A FUNFAIR, A TOWER, AND A ROLLER COASTER.', 'NOW IT IS THE OLD NEW WORLD. I LIKE IT BETTER.'] });
      npc('kid', 140, 370, { lines: ['THE SHOOTING GALLERY HAS CORK GUNS. I WON A RUBBER DUCK.'] }); M.ACT.push({ cat: true, x: 540, y: 380, k: 0 });
      crowd(6, 20, 220, 620, 220, 10); crowd(6, 620, 250, 20, 250, 8); crowd(3, 320, 220, 320, 400, 8); crowd(5, 20, 380, 620, 380, 8);
    } };

  // ---------- Osaka Castle ----------
  const arc = (cx, cy, rx, ry) => { const p = []; for (let k = 0; k <= 40; k++) { const a = Math.PI - k / 40 * Math.PI; p.push([Math.round((cx + rx * Math.cos(a)) * 16), Math.round((cy + ry * Math.sin(a)) * 16)]); } return p; };
  MAPS.osa_castle = { name: 'OSAKA CASTLE', sub: 'BEHIND TWO MOATS AND A WALL OF GIANT STONES', tw: 48, th: 42, music: 'kyoto',
    zones: [[260, 170, 510, 300, 'THE KEEP', 'FIVE ROOFS AND A GOLD TIGER'], [0, 470, 768, 672, 'PLUM GROVE', 'THE PARK OUTSIDE THE WALLS'], [0, 0, 768, 470, 'OSAKA CASTLE', 'BEHIND TWO MOATS']],
    lay() {
      tRect(FR, 0, 0, 48, 42); tOval(GR, 24, 18, 22.5, 15.5); tRect(GR, 0, 31, 48, 38); tRect(PL, 0, 38, 48, 42);
      tOval(WA, 24, 17, 19.5, 12.5); tOval(GR, 24, 17, 16.5, 9.8); tOval(WA, 24, 15, 9, 5.5); tOval(VL, 24, 15, 6.6, 3.8);
      tRoad(DT, [[24, 38], [24, 29.5]], 0.9); tRoad(DT, [[24, 26.5], [24, 20.5]], 0.8, GR);
      tRoad(DT, [[24, 24.5], [13, 22.5], [9, 17], [13, 11], [24, 8.4], [35, 11], [39, 17], [35, 22.5], [24, 24.5]], 0.6, GR);
      tRoad(DT, [[3, 31], [8, 30.5], [16, 31.5], [24, 31]], 0.6, GR); tRoad(DT, [[24, 33], [32, 34], [40, 33], [45, 31]], 0.6, GR);
    },
    deco() {
      ledge(arc(24, 17, 16.5, 9.8), 14, 'stone'); ledge(arc(24, 15, 6.6, 3.8), 16, 'stone');
      bridge(372, 424, 396, 478, '#8a6448', '#b8905a'); bridge(372, 296, 396, 334, '#8a6448', '#b8905a');
      put(SPR.keep, 384, 270, 110, 219); block(300, 246, 468, 270); door(384, 270, 'o_keep', 'ENTER THE KEEP');
      stampSpot('osa_castle', 300, 380, 'TAKE A PHOTO', 'snap', ['FIVE GREEN ROOFS, WHITE WALLS, AND GOLD TIGERS AND FISH GLINTING AT EVERY CORNER.', 'SOME OF THE STONES IN THE WALLS WEIGH MORE THAN A HUNDRED TONNES. NOBODY QUITE KNOWS HOW THEY GOT HERE.']);
      for (const [x, y] of [[160, 250], [180, 330], [600, 250], [590, 330], [260, 170], [510, 170], [220, 390], [560, 390]]) plant('pine', x, y, 1);
      for (let y = 512; y < 600; y += 26) for (let x = 470 + (y / 26 & 1) * 18; x < 750; x += 40) plant(hsh(x, y) < 0.7 ? 'plum' : 'sakura', x, y, 1);
      for (const [x, y] of [[80, 530], [160, 560], [240, 520], [300, 580]]) plant('sakura', x, y, 1); for (const x of [120, 330, 450]) prop('bench', x, 596, 9);
      stampSpot('osa_plum', 620, 600, 'TAKE A PHOTO', 'snap', ['A THOUSAND PLUM TREES IN WHITE AND PINK, AND THE CASTLE FLOATING ABOVE THEM.', 'PLUM BLOSSOM COMES A MONTH BEFORE THE CHERRIES. THE SMART PEOPLE COME NOW.']);
      station(110, 608, 'MORINOMIYA'); block(0, 666, 768, 672);
      npc('yukata', 420, 360, { tint: '#3a3a4e', lines: ['I AM A NINJA. THE CASTLE HIRED ME FOR PHOTOS.', 'THE SECRET OF NINJA WORK IS MOSTLY STANDING STILL.'] }); npc('tourist', 384, 500, { rad: 20, lines: ['THE BIG BRIDGE GOES OVER THE OUTER MOAT, THE SMALL ONE OVER THE INNER.', 'TWO MOATS! WHO WERE THEY EXPECTING?'] });
      npc('granny', 560, 560, { rad: 24, lines: ['THE PLUMS SMELL SWEETER THAN THE CHERRIES. NOBODY BELIEVES ME UNTIL THEY TRY.'] }); M.ACT.push({ cat: true, x: 640, y: 380, k: 2 });
      crowd(4, 384, 640, 384, 300, 6); crowd(4, 40, 624, 740, 624, 6); crowd(3, 200, 300, 560, 300, 30);
      wild(['green', 'pine', 'green2', 'sakura']); M.LIGHTS = [];
    } };

  // ---------- rooms ----------
  MAPS.o_tako = { indoor: 1, name: 'TAKOYAKI STAND', music: 'osaka', deco() {
    room({ wall: '#f8d8a0', floor: 'tile', t1: '#f4f1e6', t2: '#e8dcc8', mat: '#e0563f', art: g => { poster(g, 24, 10, 80, 16, '#e0563f', '8 FOR 500 YEN'); poster(g, 216, 10, 80, 16, '#3a3a4e', 'EXTRA SAUCE'); disc(g, 160, 24, 14, '#e0563f'); disc(g, 160, 20, 10, '#f06a5a'); for (let k = 0; k < 6; k++) R(g, 150 + k * 4, 32, 2, 10, '#e0563f'); disc(g, 155, 19, 2, '#fff'); disc(g, 165, 19, 2, '#fff'); } });
    fur('counter', 160, 96, 200, '#c89a6a'); const k = npc('chef', 160, 74, { lines: ['WANT TO TRY TURNING THEM?'] }); k.spot = { label: 'TURN THE TAKOYAKI', mini: 'tako', stamp: 'osa_tako' };
    npc('chef', 220, 74, { dir: 'l', lines: ['THE TRICK IS A QUICK FLICK OF THE PICK. LIKE THIS. LIKE THIS!'] }); eaters([90, 230], 128, ['HOT HOT HOT HOT HOT.', 'I HAVE BURNED MY MOUTH ON EVERY ONE. EIGHT FOR EIGHT.']);
    fur('table', 70, 170, 1); fur('table', 250, 170, 3); fur('plant', 20, 70); fur('plant', 300, 70);
  } };
  MAPS.o_okono = { indoor: 1, name: 'OKONOMIYAKI HOUSE', music: 'osaka', deco() {
    room({ wall: '#e8d0a0', mat: '#e08a3a', art: (g, r) => { wallShelf(g, 20, 64, ['#e08a3a', '#f4f1e6', '#5aa85a', '#c8382e'], r); poster(g, 110, 10, 100, 16, '#e08a3a', 'COOK IT YOURSELF'); for (const x of [240, 280]) chochin(g, x, 12, '#e0452f'); } });
    for (const [x, y] of [[90, 110], [230, 110], [90, 160], [230, 160]]) fur('booth', x, y, '#8a5a3a'); npc('teen', 90, 100, { lines: ['YOU FLIP IT WITH TWO SPATULAS. I GOT MOST OF IT ON THE GRILL.'] }); npc('salary', 230, 150, { lines: ['CABBAGE, BATTER, PORK, SAUCE, MAYONNAISE, FISH FLAKES THAT DANCE IN THE HEAT.', 'OKONOMI MEANS WHATEVER YOU LIKE. I LIKE ALL OF IT.'] });
    const k = npc('office', 160, 70, { tint: '#e08a3a', lines: ['WELCOME!'] }); k.spot = { label: 'ORDER OKONOMIYAKI', stamp: 'osa_okono', act: 'hold', fx: 'munch', lines: ['A FAT PANCAKE OF CABBAGE AND PORK SIZZLES ON THE GRILL IN FRONT OF YOU.', 'THE FISH FLAKES ON TOP WAVE IN THE HEAT AS IF THEY WERE ALIVE.'] };
    fur('counter', 160, 88, 60, '#a8744a'); fur('plant', 20, 176); fur('plant', 300, 176);
  } };
  MAPS.o_kushi = { indoor: 1, name: 'KUSHIKATSU COUNTER', music: 'osaka', deco() {
    room({ wall: '#8a4a38', mat: '#c8382e', art: (g, r) => { wallShelf(g, 20, 70, ['#f2c14e', '#c89a6a', '#e0563f'], r); poster(g, 100, 10, 120, 16, '#f4e6c0', ''); txtC(g, 'NO DOUBLE DIPPING!', 160, 15, '#c8382e'); for (let x = 240; x < 300; x += 20) chochin(g, x, 10, '#f2c14e'); } });
    fur('counter', 160, 92, 220); for (let x = 62; x <= 258; x += 28) fur('stool', x, 106, '#3a3a4e'); eaters([62, 118, 202, 258], 104, ['BEEF, LOTUS ROOT, QUAIL EGG, CHEESE. DEEP-FRIED, ALL OF IT.', 'I DIPPED TWICE ONCE. I STILL HAVE NIGHTMARES.', 'THE CABBAGE IS FREE. IT IS FOR SCOOPING MORE SAUCE. CLEVER.', 'ONE MORE PLATE. THEN HOME. MAYBE.']);
    npc('chef', 160, 72, { lines: ['ONE DIP ONLY, PLEASE. THE SAUCE POT IS SHARED.', 'WANT MORE SAUCE? USE THE CABBAGE.'] });
    M.SPOTS.push({ x: 146, y: 108, r: 12, label: 'ORDER KUSHIKATSU', stamp: 'osa_kushi', act: 'hold', fx: 'munch', lines: ['A PLATE OF GOLDEN SKEWERS, CRISP AND HOT. YOU DIP EACH ONE IN THE SAUCE. ONCE.', 'THE CHEF GIVES YOU A SMALL, APPROVING NOD.'] });
  } };
  MAPS.o_keep = { indoor: 1, name: 'OSAKA CASTLE - 8TH FLOOR', music: 'kyoto', deco() {
    room({ wall: '#3a2a28', floor: 'wood', mat: '#3f7a5a', art: (g, r) => { dgrad(g, 16, 8, 288, 34, ['#8ac4f0', '#b8dcf4', '#e8f0f4']); skyline(g, 16, 304, 34, 4, 18, '#8a94b0', r); R(g, 16, 34, 288, 8, '#5a9a6a'); R(g, 16, 36, 288, 2, '#4a9ac8'); R(g, 8, 42, 304, 6, '#2a1a18'); R(g, 8, 4, 304, 4, '#2a1a18'); for (let x = 88; x < 300; x += 72) R(g, x, 8, 2, 34, '#2a1a18'); R(g, 8, 4, 8, 44, '#2a1a18'); R(g, 304, 4, 8, 44, '#2a1a18'); } });
    for (const x of [60, 132, 204, 276]) fur('scope', x, 66); fur('cas', 60, 150, 2); fur('cas', 260, 150, 6); fur('cas', 160, 160, 7);
    M.SPOTS.push({ x: 168, y: 58, r: 14, label: 'LOOK OUT', stamp: 'osa_keep', act: 'snap', lines: ['THE WHOLE CITY AROUND YOU, AND RIGHT BELOW, THE GREEN RING OF THE MOAT.', 'THE WARLORD WHO BUILT THIS WANTED A CASTLE NOBODY COULD TAKE. HE NEARLY MANAGED IT.'] });
    npc('tourist', 96, 60, { dir: 'u', lines: ['THE LIFT ONLY GOES TO THE FIFTH FLOOR. I CLIMBED THE REST.'] }); npc('monk', 220, 140, { rad: 20, lines: ['THE ARMOUR IN THE CASES BELONGED TO REAL SAMURAI. THEY WERE SHORTER THAN YOU THINK.'] }); npc('kid', 260, 60, { dir: 'u', lines: ['I CAN SEE THE NINJA FROM HERE!'] });
  } };

  // ---------- takoyaki: turn each ball when it is golden, before it burns ----------
  const TAKO = {
    init(m) { m.b = [0, 1, 2, 3, 4, 5, 6, 7].map(() => ({ c: Math.random() * 0.35, sp: 0.16 + Math.random() * 0.08, fx: 0 })); m.sel = 0; m.got = 0; m.time = 45; m.msg = ''; m.mt = 0; m.done = 0; },
    update(m, dt) {
      if (m.done) { if (m.t > m.done + 1.2) endMini(true, ['SIX PERFECT BALLS, GOLDEN OUTSIDE AND MOLTEN INSIDE, WITH A PIECE OF OCTOPUS IN EACH.', 'THE COOK SAYS YOU HAVE OSAKA HANDS. IT IS THE HIGHEST PRAISE THERE IS.']); return; }
      m.time -= dt; if (m.mt > 0) m.mt -= dt; for (const b of m.b) { b.c += b.sp * dt; if (b.fx > 0) b.fx -= dt; }
      if (KP.l) m.sel = (m.sel + 7) % 8; if (KP.r) m.sel = (m.sel + 1) % 8; if (KP.u || KP.d) m.sel = (m.sel + 4) % 8; if (KP.l || KP.r || KP.u || KP.d) Snd.fx('ui');
      if (KP.a) { const b = m.b[m.sel]; if (b.c < 0.55) { m.msg = 'NOT YET - STILL RUNNY'; Snd.fx('talk'); } else if (b.c <= 1) { m.got++; b.fx = 0.6; b.c = 0; b.sp = 0.16 + Math.random() * 0.1; Snd.fx('pick'); m.msg = ['PERFECT!', 'GOLDEN!', 'NICE TURN!'][m.got % 3]; if (m.got >= 6) { m.done = m.t; Snd.fx('yay'); } } else { b.c = 0; m.msg = 'BURNT! FRESH BATTER IN.'; Snd.fx('land'); } m.mt = 0.8; }
      if (!m.done && m.time <= 0) endMini(false, ['HALF OF THEM RUNNY, HALF OF THEM CHARCOAL.', 'THE COOK TAKES THE PICK BACK, VERY GENTLY. HAVE ANOTHER GO.']);
    },
    draw(m) {
      txtC(ctx, 'TAKOYAKI', 160, 30, '#c8382e', null, 2); R(ctx, 94, 50, 132, 62, '#2a2a3a'); R(ctx, 96, 52, 128, 58, '#3a3a4e');
      m.b.forEach((b, i) => { const x = 114 + (i % 4) * 31, y = 67 + (i >> 2) * 27, c = b.c < 0.55 ? mix('#f4e8c0', '#e8c070', b.c / 0.55) : b.c <= 1 ? '#e0a040' : mix('#8a4a28', '#3a2418', Math.min(1, (b.c - 1) * 3));
        disc(ctx, x, y, 11, '#1d1626'); if (b.fx > 0) { disc(ctx, x, y, 9, '#b8702a'); R(ctx, x - 6, y - 2, 12, 2, '#5a2a18'); for (let k = -6; k < 6; k += 2) R(ctx, x + k, y + (k % 4 ? 1 : 2), 2, 1, '#fff8e8'); } else { disc(ctx, x, y, 9, c); if (b.c >= 0.55 && b.c <= 1) disc(ctx, x - 3, y - 3, 2 + Math.sin(G.t * 8) * 0.5, '#fff0b0'); }
        if (i === m.sel) { R(ctx, x - 13, y - 13, 26, 1.5, '#c8382e'); R(ctx, x - 13, y + 11.5, 26, 1.5, '#c8382e'); R(ctx, x - 13, y - 13, 1.5, 26, '#c8382e'); R(ctx, x + 11.5, y - 13, 1.5, 26, '#c8382e'); } });
      for (let i = 0; i < 6; i++) disc(ctx, 130 + i * 12, 118, 4, i < m.got ? '#e0a040' : '#d9cba8'); R(ctx, 70, 125, 180 * Math.max(0, m.time) / 45, 2, m.time < 10 ? '#c8382e' : '#8a7a6a');
      txtC(ctx, m.done ? 'ALL DONE!' : m.mt > 0 ? m.msg : 'ARROWS PICK A BALL - E TURNS IT WHEN GOLDEN', 160, 132, '#3a2e40');
    }
  };

  concourse('os_shinkansen', { name: 'SHIN-OSAKA', hub: 'osa_namba', music: 'osaka', track: 26, dest: 'TOKYO', bento: ['TAKO MESHI', 'RICE COOKED WITH OCTOPUS AND GINGER. OSAKA PUTS OCTOPUS IN EVERYTHING, AND IS RIGHT TO.'] });
  city({
    id: 'osaka', name: 'OSAKA', tagline: 'EAT UNTIL YOU DROP', start: 'osa_namba', hub: 'osa_namba', concourse: 'os_shinkansen', line: LINE, stamps: STAMPS, cats: 5, minis: { tako: TAKO },
    sprites() {
      one('crab', 92, 42, g => { for (const s of [-1, 1]) { for (let k = 0; k < 4; k++) { const x = 46 + s * (22 + k * 5); line(g, 46 + s * 14, 26 + k * 2, x, 34 + k * 1.5, '#c0302a'); line(g, x, 34 + k * 1.5, x + s * 4, 41, '#c0302a'); } line(g, 46 + s * 16, 18, 46 + s * 30, 8, '#e0452f'); ell(g, 46 + s * 34, 6, 8, 5, '#e0452f'); ell(g, 46 + s * 34, 5, 6, 3, '#f06a5a'); R(g, 46 + s * 30 - 3, 6, 6, 1.5, '#8a2a24'); } ell(g, 46, 24, 20, 12, '#c0302a'); ell(g, 46, 22, 18, 10, '#e0452f'); ell(g, 42, 18, 8, 4, '#f06a5a'); for (const x of [40, 52]) { R(g, x, 6, 1.5, 8, '#c0302a'); disc(g, x + 0.75, 5, 2.5, '#f4f1e6'); disc(g, x + 0.75, 5, 1.2, '#1d1626'); } }, 1);
      one('cruise', 56, 18, g => { ell(g, 28, 12, 26, 5, '#f4f1e6'); R(g, 4, 9, 48, 4, '#f4f1e6'); R(g, 4, 12, 48, 2, '#3f7ab0'); R(g, 12, 3, 30, 7, '#5ad8f0'); R(g, 12, 3, 30, 1, '#bfe8ff'); for (let x = 15; x < 40; x += 6) R(g, x, 4, 3, 4, '#3a3a5a'); R(g, 0, 16, 56, 1, '#a6dcee'); }, 1);
      one('hozen', 110, 70, g => templeHall(g, 55, 68, 70, 22, { bays: 4, wall: '#7a3a2a', roof: '#3d3852', door: '#5a2a20', rh: 18 }));
      one('fudo', 22, 32, g => { R(g, 1, 24, 20, 8, '#8c8498'); R(g, 1, 24, 20, 1, '#c8c0d4'); ell(g, 11, 16, 7, 9, '#3f7a3a'); disc(g, 11, 6, 5, '#3f7a3a'); for (let k = 0; k < 40; k++) p1(g, 5 + (k * 7 % 13), 2 + (k * 11 % 22), k % 2 ? '#6aa85a' : '#2f5a2a'); R(g, 16, 4, 1.5, 16, '#5a8a5a'); disc(g, 9, 6, 1, '#1d1626'); disc(g, 13, 6, 1, '#1d1626'); }, 1);
      one('fishbox', 26, 16, g => { R(g, 1, 6, 24, 10, '#a8844a'); R(g, 1, 6, 24, 1, '#d8b070'); R(g, 2, 3, 22, 4, '#dceef8'); for (let k = 0; k < 4; k++) { ell(g, 5 + k * 5.5, 4.5, 3, 1.3, k % 2 ? '#8a94b0' : '#c84a3a'); p1(g, 3 + k * 5.5, 4.5, '#1d1626'); } R(g, 0, 15, 26, 1, '#5a3a28'); }, 1);
      one('fugu', 22, 30, g => { R(g, 10, 14, 2, 16, '#6b6478'); disc(g, 11, 9, 8, '#e8c070'); disc(g, 11, 10, 6, '#f4e0a0'); for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; p1(g, 11 + Math.cos(a) * 8.5, 9 + Math.sin(a) * 8.5, '#8a6a2a'); } disc(g, 8, 7, 1.5, '#fff'); p1(g, 8, 7, '#1d1626'); ell(g, 11, 13, 2, 1, '#c8382e'); }, 1);
      one('billikenS', 18, 30, g => { R(g, 1, 24, 16, 6, '#8c8498'); R(g, 1, 24, 16, 1, '#c8c0d4'); ell(g, 9, 18, 6, 6, '#e8b040'); disc(g, 9, 9, 5, '#f2c14e'); R(g, 7, 1, 4, 5, '#f2c14e'); R(g, 8, 0, 2, 2, '#f2c14e'); R(g, 6, 8, 2, 1, '#1d1626'); R(g, 10, 8, 2, 1, '#1d1626'); R(g, 7, 11, 4, 1, '#8a5a20'); R(g, 4, 22, 3, 2, '#f8dc8a'); R(g, 11, 22, 3, 2, '#f8dc8a'); }, 1);
      variants('plum', 2, (rnd, i) => { const c = mk(56, 62); tree(c.g, 28, 60, 24 + i * 2, ['#c8a0b8', '#f4d8e4', '#ffffff'], rnd, { cw: 34, ch: 24, n: 14, up: 2 }); return c; });
      const tsuten = (g, cx, base, rnd) => { const c = '#8a90b4', d = '#5c6288', h = 134;
        for (let i = 0; i < h; i++) { const y = base - i; let hw; if (i < 44) hw = Math.round(9 + (1 - i / 44) * (1 - i / 44) * 15); else if (i < 98) hw = 8; else if (i < 116) hw = 13; else if (i < 124) hw = 7; else hw = 1;
          if (i >= 98 && i < 116) { R(g, cx - hw, y, hw * 2 + 1, 1, i % 6 < 2 ? '#ffe08a' : '#3a3f66'); continue; } if (i >= 116) { R(g, cx - hw, y, hw * 2 + 1, 1, i < 124 ? '#4ad0f0' : c); continue; }
          R(g, cx - hw, y, 2, 1, c); R(g, cx + hw - 1, y, 2, 1, c);
          if (i < 44) { if (i > 30) R(g, cx - hw, y, hw * 2 + 1, 1, i % 4 ? d : c); else if (i % 6 === 0) { R(g, cx - hw, y, 6, 1, c); R(g, cx + hw - 5, y, 6, 1, c); } }
          else { if (i % 6 === 0) R(g, cx - hw, y, hw * 2 + 1, 1, c); else { const p = (i % 6) / 6 * hw * 2; P(g, cx - hw + p, y, d); P(g, cx + hw - p, y, d); } } }
        for (let i = 0; i < 6; i++) kanji(g, cx - 2, base - 92 + i * 8, i % 2 ? '#ff6aa8' : '#ffe08a', rnd); };
      one('tsuten', 90, 206, g => { g.save(); g.scale(1.5, 1.5); tsuten(g, 30, 136, RNG(5)); g.restore(); });
      const osakaCastle = (g, cx, base) => { for (let i = 0; i < 28; i++) { const hw = 30 + Math.round(i * 0.55); R(g, cx - hw, base - 28 + i, hw * 2, 1, i % 4 === 0 ? '#5c5878' : '#74709a'); } let y = base - 28;
        for (const [w, h] of [[54, 12], [42, 11], [30, 10], [20, 9]]) { R(g, cx - w / 2, y - h, w, h, '#f4f0e4'); R(g, cx - w / 2, y - h, w, 2, '#d0c8ba'); for (let x = cx - w / 2 + 3; x < cx + w / 2 - 3; x += 5) R(g, x, y - h + 4, 2, 3, '#3a3550'); R(g, cx - w / 2, y - 2, w, 1, '#d9b04a'); y -= h; roof(g, cx, y - 5, w / 2 - 3, w / 2 + 6, 6, '#3f8a7a'); y -= 4; }
        R(g, cx - 5, y - 3, 2, 3, '#f2c14e'); R(g, cx + 4, y - 3, 2, 3, '#f2c14e'); };
      one('keep', 220, 220, g => { g.save(); g.scale(2.2, 2.2); osakaCastle(g, 50, 99.5); g.restore(); });
      icon('runner', g => { R(g, 0, 0, 12, 12, '#3a7ad8'); disc(g, 6, 2.5, 1.5, '#f6cfa6'); R(g, 5, 4, 2, 4, '#f4f1e6'); line(g, 5, 4, 2, 1, '#f6cfa6'); line(g, 7, 4, 10, 1, '#f6cfa6'); line(g, 5, 8, 3, 11, '#f4f1e6'); line(g, 7, 8, 9, 11, '#f4f1e6'); });
      icon('fish', g => { ell(g, 6, 6, 5, 2.5, '#8a94b0'); ell(g, 6, 5.5, 4, 1.5, '#c8d0e0'); R(g, 10, 4, 2, 5, '#8a94b0'); P(g, 3, 5, '#1d1626'); });
      icon('tsuten', g => { R(g, 5, 2, 2, 7, '#8a90b4'); R(g, 4, 3, 4, 2, '#ffe08a'); R(g, 5.5, 0, 1, 2, '#4ad0f0'); line(g, 5, 9, 2, 12, '#8a90b4'); line(g, 7, 9, 10, 12, '#8a90b4'); });
      icon('kushi', g => { for (const x of [3, 6, 9]) { R(g, x, 0, 1, 12, '#c8a070'); R(g, x - 1, 2, 3, 6, '#d9903a'); R(g, x - 1, 2, 3, 1, '#f0c070'); } });
      icon('plum', g => { for (const [x, y] of [[3, 4], [8, 3], [6, 8]]) { disc(g, x, y, 2.5, '#f4d8e4'); P(g, x, y, '#e0563f'); } line(g, 1, 11, 10, 2, '#6a4a38'); });
    }
  });
})();
