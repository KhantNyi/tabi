'use strict';
// ---------- Tokyo: eight districts on one train line, the rooms inside their buildings, and what there is to do ----------
// A city registers itself with city(). Its districts and rooms go in the shared MAPS table, so their ids must not clash with other cities.
(function () {
  const LINE = [['shibuya', 'SHIBUYA'], ['harajuku', 'HARAJUKU'], ['shinjuku', 'SHINJUKU'], ['ueno', 'UENO'], ['asakusa', 'ASAKUSA'], ['akiba', 'AKIHABARA'], ['tokyo', 'TOKYO STATION'], ['tower', 'TOKYO TOWER']];
  const STAMPS = {
    hachi: ['HACHIKO', 'dog', 'shibuya'], scramble: ['SCRAMBLE CROSSING', 'camera', 'shibuya'], ramen: ['SHOYU RAMEN', 'ramen', 'shibuya'],
    crepe: ['HARAJUKU CREPE', 'crepe', 'harajuku'], meiji: ['MEIJI SHRINE', 'torii', 'harajuku'], fit: ['NEW OUTFIT', 'shirt', 'harajuku'],
    view: ['NIGHT VIEW', 'sun', 'shinjuku'], yaki: ['YAKITORI ALLEY', 'stick', 'shinjuku'],
    panda: ['UENO PANDA', 'panda', 'ueno'], bone: ['DINOSAUR HALL', 'bone', 'ueno'],
    kaminari: ['THUNDER GATE', 'lantern', 'asakusa'], omikuji: ['FORTUNE SLIP', 'omikuji', 'asakusa'], sky: ['SKYTREE', 'sky', 'asakusa'],
    crane: ['CRANE GAME PRIZE', 'claw', 'akiba'], fig: ['CAPSULE FIGURE', 'fig', 'akiba'], denki: ['ELECTRIC TOWN', 'gacha', 'akiba'],
    brick: ['RED BRICK STATION', 'train', 'tokyo'], sushi: ['CONVEYOR SUSHI', 'sushi', 'tokyo'], sweets: ['DEPACHIKA SWEETS', 'mochi', 'tokyo'],
    tower: ['TOKYO TOWER', 'tower', 'tower'], zojo: ['ZOJOJI TEMPLE', 'buddha', 'tower']
  };

  // ---------- north up the avenues ----------
  // Shibuya, Shinjuku, Akihabara and Tokyo Station each get a district to the north, reached by walking up the avenue that
  // crosses the main street: Center Gai's shops, Omoide Yokocho's yakitori alleys, Akihabara's back streets of parts stalls,
  // and the palace moat behind Marunouchi. north() (world.js) builds the old map lower down and adds these rows on top.
  const NORTH = 12, ND = NORTH * T; // tiles added on top of each street map, and the same in world units
  const shopRow = (list, y, x0 = 26, o = {}) => { let x = x0; list.forEach(([sign, sc, w, h, extra], i) => { tower(x + w / 2, y, w, h, Object.assign({ c: TWC[(i * 3 + x0) % TWC.length], sign, sc, lit: 0.45 }, o, extra)); x += w + 6; }); };
  const CENTER_GAI = { avenue: 10, lay() { tRect(PL, 0, 4.3, 40, 11.6); }, deco() {
    block(0, 0, M.w, 52);
    shopRow([['CAFE', '#f2c14e', 58, 40], ['RECORDS', '#5aa8e0', 62, 46], ['KARAOKE', '#f06a8c', 66, 44, { vs: 5, vc: '#f06a8c' }], ['SHOES', '#8a6aff', 56, 38], ['CREPES', '#f06a8c', 54, 36, { c: '#f8d8e0' }], ['PURIKURA', '#5ad88a', 66, 44, { vs: 4, vc: '#5ad88a' }], ['RAMEN', '#e0563f', 56, 38], ['VINTAGE', '#c8a070', 60, 42]], 66);
    put(SPR.cgai, 312, 178, 36, 41); block(276, 172, 282, 178); block(342, 172, 348, 178);
    for (const x of [110, 230, 410, 530]) prop('lamp', x, 186, 2); prop('vend2', 56, 182, 6); prop('vend3', 596, 182, 6); prop('bench', 170, 184, 9); prop('bench', 460, 184, 9);
    crowd(6, 40, 104, 600, 104, 6); crowd(6, 600, 142, 40, 142, 6);
    npc('teen', 200, 124, { tint: '#5aa8e0', lines: ['I SING HERE EVERY SATURDAY. TWO PEOPLE STOPPED TODAY.', 'ONE OF THEM WAS MY MUM.'] });
    npc('office', 452, 86, { dir: 'u', lines: ['THE PHOTO BOOTH GIVES YOU GIANT EYES AND A CAT NOSE.', 'I LOOK INCREDIBLE. NOTHING LIKE ME.'] });
    npc('kid', 120, 90, { rad: 20, lines: ['THIS STREET IS WHERE EVERY FASHION IN JAPAN STARTS.', 'MY MUM SAYS IT IS WHERE EVERY FASHION GOES TO DIE.'] });
  } };
  const YOKOCHO = { avenue: 10, lay() { tRect(AS, 0, 4, 40, 12, PV); }, deco() {
    block(0, 0, M.w, 52); const NO = ['#8a2a24', '#3d5a80', '#5a8a5a', '#c8382e', '#6a4a8a'];
    // a row of tiny yakitori stalls along the top, another back to back across the middle, and two narrow lanes between them
    for (let x = 26, i = 0; x < M.w - 20; x += 42, i++) house(x, 66, 36, 20, { noren: NO[i % 5], rh: 12, lantern: true, sign: i % 4 ? null : 'YAKITORI' });
    for (let x = 50, i = 0; x < M.w - 30; x += 44, i++) { if (Math.abs(x - 168) < 44 || Math.abs(x - 430) < 30) continue; house(x, 138, 38, 18, { noren: NO[(i + 2) % 5], rh: 11, lantern: true }); block(x - 19, 104, x + 19, 138); }
    for (const [x, y, d] of [[96, 84, 'u'], [270, 84, 'u'], [520, 84, 'u'], [330, 156, 'u']]) npc(['salary', 'office', 'salary', 'tourist'][x % 4], x, y, { dir: d, lines: [['TWO MORE SKEWERS AND A BEER. THEN HOME.', 'I SAID THAT TWO HOURS AGO.'], ['THERE ARE SIX SEATS IN THIS BAR. I HAVE SAT IN ALL OF THEM.'], ['THIS ALLEY HAS BEEN HERE SINCE THE WAR. SO HAS THE COOK.'], ['THE SMOKE GETS IN YOUR HAIR AND STAYS FOR DAYS.', 'THAT IS PART OF THE PRICE.']][x % 4] });
    M.SPOTS.push({ x: 190, y: 92, r: 14, label: 'SMELL THE GRILL', fx: 'munch', lines: ['CHARCOAL, SOY AND CHICKEN FAT DRIP AND HISS.', 'A COOK WAVES A FAN AT THE GRILL AND THE SMOKE ROLLS DOWN THE ALLEY TOWARDS YOU.'] });
    crowd(3, 40, 96, 600, 96, 4); crowd(4, 600, 172, 40, 172, 4); prop('vend', 600, 182, 6);
  } };
  const BACKSTREETS = { avenue: 10, lay() { tRect(AS, 0, 4.2, 40, 12, PV); }, deco() {
    block(0, 0, M.w, 52);
    shopRow([['PARTS', '#5ad8f0', 50, 40], ['MAID CAFE', '#f06a8c', 70, 46, { vs: 5, vc: '#ffd84a' }], ['TRAINS', '#f2c14e', 52, 40], ['ANIME', '#8a6aff', 58, 44], ['CARDS', '#5ad88a', 50, 38], ['RETRO', '#f2a03a', 56, 42], ['FIGURES', '#e0563f', 60, 44], ['DOLLS', '#f0a8c0', 52, 40], ['RADIOS', '#5aa8e0', 52, 40]], 66);
    for (let i = 0; i < 8; i++) fur('gacha', 216 + i * 13, 150, i % 3); M.SPOTS.push({ x: 262, y: 160, r: 18, label: 'CAPSULE MACHINES', mini: 'gacha' });
    for (const [x, t] of [[90, 'CABLES! CHIPS! SWITCHES! ALL ONE HUNDRED YEN!'], [540, 'THIS VACUUM TUBE IS SIXTY YEARS OLD. IT STILL GLOWS.']]) { prop('stall', x, 170, 13); npc('salary', x, 182, { tint: '#5a6a4a', lines: [t] }); }
    npc('maiko', 128, 86, { tint: '#3a3a4e', lines: ['WELCOME HOME! WE HAVE TABLES AT THE CAFE UPSTAIRS!', 'SAY MOE MOE KYUN AND THE OMELETTE GETS A HEART ON IT.'] });
    crowd(5, 40, 100, 600, 100, 6); crowd(5, 600, 128, 40, 128, 6);
  } };
  const MARUNOUCHI = { ground: GR, avenue: 9, lay() { tRect(WA, 0, 0.9, 42, 3.4); tRect(VL, 0, 4.6, 42, 7.4); tRect(VL, 23.5, 7.4, 27.5, 9); }, deco() {
    ledge([[0, 0], [336, 0], [672, 0]], 14, 'stone'); bridge(318, 16, 354, 56, '#8a8496', '#c8c0b4');
    npc('salary', 336, 26, { dir: 'd', tint: '#3a3a4e', lines: ['THE PALACE GATE OPENS TWICE A YEAR: NEW YEAR AND THE EMPEROR\'S BIRTHDAY.', 'TODAY IS NOT ONE OF THOSE DAYS.'] });
    for (let x = 30; x < M.w; x += 58) { plant('pine', x + hsh(x, 3) * 14, 160 + hsh(x, 7) * 16, 1); } for (const x of [140, 260, 470, 590]) prop('bench', x, 130, 9); for (const x of [200, 520]) prop('lantern', x, 70, 4);
    crowd(5, 30, 96, 640, 96, 6); crowd(5, 640, 112, 30, 112, 6);
    npc('granny', 600, 92, { rad: 20, lines: ['I WALK ROUND THE PALACE EVERY MORNING. FIVE KILOMETRES.', 'THE JOGGERS GO THE OTHER WAY. THEY ARE ALL WRONG.'] });
    npc('tourist', 120, 80, { dir: 'u', lines: ['THOSE STONES IN THE WALL WEIGH AS MUCH AS A HOUSE.', 'NOBODY USED MORTAR. THEY JUST FIT.'] });
  } };

  MAPS.shibuya = north({ zones: [[0, 0, 640, ND - 4, 'CENTER GAI', 'SHOPS, SONGS AND PHOTO BOOTHS'], [0, ND - 4, 640, 640, 'SHIBUYA', 'THE BUSIEST CROSSING IN THE WORLD']], name: 'SHIBUYA', sub: 'THE BUSIEST CROSSING IN THE WORLD', tw: 40, th: 28, music: 'tokyo',
    lay() { tRect(PV, 0, 0, 40, 28); tRect(PL, 8, 9, 17.5, 12.5); roads([[13, 3]], [[18, 3]]); },
    deco() {
      const g = M.ground.g; for (let k = 0; k < 9; k++) { R(g, 291 + k * 5, 211 + k * 5, 4, 2, '#e8e4f0'); R(g, 331 - k * 5, 211 + k * 5, 4, 2, '#e8e4f0'); }
      station(70, 192, 'SHIBUYA');
      tower(206, 142, 132, 78, { c: '#7a7a98', scr: [14, 10, 104, 40], scrc: ['#f06a8c', '#f2c14e', '#5ad8f0'] });
      prop('hachi', 206, 178, 7); plant('ginkgo', 142, 172, 1); plant('ginkgo', 268, 172, 1); prop('bench', 168, 190, 9); prop('bench', 244, 190, 9);
      tower(390, 192, 64, 116, { c: '#d0d0e0', sign: 'MODE 109', sc: '#f06a8c', to: 'mode', vs: 6, vsx: 50, gx: 6 });
      tower(474, 192, 76, 92, { c: '#6a7a94', scr: [8, 8, 60, 34], sign: 'BOOKS', sc: '#3f7ab0' });
      house(570, 192, 64, 30, { sign: 'RAMEN', noren: '#c8382e', roofCol: '#3d3852', rh: 16, lantern: true, to: 'ramen' });
      cityEdge(0, 70); prop('vend', 430, 190, 6); prop('vend2', 612, 190, 6);
      for (const [x, y] of [[90, 300], [200, 310], [420, 300], [540, 312], [600, 290]]) plant('ginkgo', x, y, 1); plaza(392); prop('bench', 140, 300, 9); prop('bench', 480, 296, 9); prop('vend3', 250, 290, 6);
      stampSpot('hachi', 206, 188, 'TAKE A PHOTO', 'snap', ['HACHIKO WAITED HERE FOR HIS OWNER EVERY DAY FOR TEN YEARS.', 'EVERYONE IN TOKYO MEETS THEIR FRIENDS BY THIS STATUE.'], 15, { frame: [146, 130, 120, 72] });
      stampSpot('scramble', 312, 232, 'TAKE A PHOTO', 'snap', ['THE LIGHTS CHANGE AND A THOUSAND PEOPLE CROSS AT ONCE.', 'SOMEHOW NOBODY BUMPS INTO ANYBODY.'], 13);
      cars(228, -1, 3); cars(251, 1, 3); crowd(3, 280, 200, 280, 266, 6); crowd(3, 344, 266, 344, 200, 6); crowd(6, 40, 200, 600, 200, 6); crowd(6, 600, 266, 40, 266, 8); crowd(3, 296, 214, 328, 250, 4);
      npc('teen', 180, 196, { lines: ['I AM WAITING FOR MY FRIEND. SHE IS ALWAYS LATE.', 'MEET AT HACHIKO, SHE SAID. SO DID EVERYONE ELSE.'], tint: '#f2c14e' });
      npc('tourist', 232, 198, { lines: ['IS THIS THE FAMOUS DOG?', 'I WATCHED THE FILM. I CRIED.'] }); M.ACT.push({ cat: true, x: 520, y: 300, k: 0 });
    } }, NORTH, CENTER_GAI);
  MAPS.harajuku = { name: 'HARAJUKU', sub: 'CREPES, COLOUR AND A QUIET FOREST SHRINE', tw: 32, th: 30, music: 'kyoto', petals: 1,
    lay() { tRect(FR, 0, 0, 32, 11.5); tRect(PV, 0, 11.5, 32, 30); tRect(VL, 14.5, 3, 16.5, 11.5); tRect(VL, 10, 3, 21, 7.5); tRect(PL, 14, 11.5, 17, 20); roads([[20, 2]], []); },
    deco() {
      put(SPR.hallG, 248, 92, 88, 90); block(188, 70, 308, 92); prop('box', 248, 100, 7); put(SPR.toriiW, 248, 176, 42, 69); block(214, 172, 222, 176); block(274, 172, 282, 176);
      for (const y of [130, 156]) for (const x of [222, 274]) prop('lantern', x, y, 4); woods(40, 180, 1);
      const rnd = RNG(8); for (let y = 60; y < 182; y += 15) for (let x = 44; x < 470; x += 17) { const px = x + rnd() * 8, py = y + rnd() * 7; if (Math.abs(px - 248) > 100 || (py > 124 && Math.abs(px - 248) > 34)) plant(rnd() < 0.5 ? 'pine' : 'green', px, py, 1); }
      put(SPR.arch, 248, 306, 48, 49); block(204, 302, 212, 306); block(284, 302, 292, 306);
      station(70, 304, 'HARAJUKU'); house(166, 304, 60, 28, { sign: 'CREPES', roof: 'awning', roofCol: '#f06a8c', glow: '#ffe0ec', to: 'crepe', wall: '#f4d8e0', beam: '#c86a8a' });
      tower(334, 304, 66, 84, { c: '#f0b8d0', sign: 'KAWAII', sc: '#8a6aff', to: 'kawaii', vs: 5, vc: '#ffd84a', wc: '#fff0b0' }); tower(410, 304, 60, 70, { c: '#b8e0d8', sign: 'SWEETS', sc: '#f06a8c' }); tower(474, 304, 50, 96, { c: '#d8c8f0' });
      for (const y of [210, 250]) { tower(180, y, 56, 40, { c: y > 220 ? '#f8d8a8' : '#c8e0f8', sign: y > 220 ? 'SHOES' : 'TOYS', sc: '#5aa8e0' }); tower(316, y, 56, 40, { c: y > 220 ? '#d8f0c8' : '#f8c8c8', sign: y > 220 ? 'VINTAGE' : 'IDOLS', sc: '#f2a03a' }); }
      sideTowers(200); prop('stall', 290, 296, 10); prop('vend2', 124, 302, 6);
      for (const [x, y] of [[60, 400], [150, 420], [280, 410], [400, 396], [460, 430]]) plant('sakura', x, y, 1); prop('bench', 210, 400, 9); prop('bench', 340, 420, 9);
      stampSpot('meiji', 248, 110, 'PRAY', 'bow', ['THE CITY NOISE STOPS AT THE EDGE OF THE FOREST.', 'A HUNDRED THOUSAND TREES, ALL PLANTED BY HAND.']);
      cars(342, -1, 2); cars(350, 1, 2); crowd(6, 232, 200, 232, 300, 10); crowd(6, 264, 300, 264, 200, 10); crowd(5, 40, 314, 470, 314, 5); crowd(3, 248, 120, 248, 190, 8);
      npc('teen', 300, 300, { lines: ['WELCOME! TRY OUR RAINBOW COTTON CANDY!', 'IT IS BIGGER THAN YOUR HEAD!'], tint: '#8a6aff' }); npc('monk', 290, 112, { lines: ['WALK ON THE SIDE OF THE PATH. THE MIDDLE IS FOR THE GODS.'] }); M.ACT.push({ cat: true, x: 380, y: 400, k: 1 });
    } };
  MAPS.shinjuku = north({ zones: [[0, 0, 640, ND - 4, 'OMOIDE YOKOCHO', 'MEMORY LANE: SMOKE AND SKEWERS'], [0, ND - 4, 640, 640, 'SHINJUKU', 'NEON, TOWERS AND TINY ALLEY BARS']], name: 'SHINJUKU', sub: 'NEON, TOWERS AND TINY ALLEY BARS', tw: 40, th: 28, music: 'osaka', night: 1, tint: '#7078c0',
    lay() { tRect(PV, 0, 0, 40, 28); roads([[13, 3]], [[9, 3]]); },
    deco() {
      station(70, 192, 'SHINJUKU');
      tower(262, 192, 96, 150, { c: '#8a94b0', sign: 'CITY HALL', sc: '#5a6a9a', to: 'deck', lab: 'GO UP', gx: 4, ww: 2, gy: 5, top: false, art: (g, x, t) => { R(g, x + 30, t, 36, 40, 'rgba(0,0,0,0)'); g.clearRect(x + 32, t - 2, 32, 44); } });
      tower(356, 192, 52, 136, { c: '#6a7aa0', gx: 4, ww: 2 }); tower(424, 192, 60, 84, { c: '#5a4a9a', sign: 'ARCADE', sc: '#f06a8c', to: 'arcade', vs: 7, vc: '#5ad8f0' });
      house(500, 192, 52, 28, { sign: 'YAKITORI', noren: '#8a2a24', rh: 14, lantern: true, to: 'izakaya' }); house(562, 192, 50, 28, { sign: 'BAR', noren: '#3d5a80', rh: 14, lantern: '#f2c14e' }); house(612, 192, 40, 28, { noren: '#5a8a5a', rh: 14, lantern: true });
      cityEdge(); lamps(206); lamps(272, '#ffd0f0');
      for (const [x, c] of [[110, '#f06a8c'], [240, '#5ad8f0'], [380, '#ffd84a'], [520, '#8a6aff']]) { tower(x, 330, 46, 50, { c: '#4a4a6a', sign: ['KARAOKE', 'PACHINKO', 'CURRY', 'HOTEL'][x % 4], sc: c, vs: 4, vc: c }); }
      prop('vend', 318, 190, 6); prop('vend3', 466, 190, 6); plaza(396);
      cars(228, -1, 4); cars(251, 1, 4); crowd(8, 40, 200, 610, 200, 6); crowd(8, 610, 266, 40, 266, 8); crowd(4, 138, 200, 138, 268, 6); crowd(4, 214, 268, 214, 200, 6);
      npc('salary', 520, 200, { lines: ['ONE MORE SKEWER AND THEN I GO HOME. PROBABLY.', 'THE LAST TRAIN IS A SUGGESTION.'] }); npc('office', 300, 200, { lines: ['THE VIEW FROM THE TOP IS FREE, YOU KNOW.'] }); M.ACT.push({ cat: true, x: 590, y: 200, k: 2 });
    } }, NORTH, YOKOCHO);
  MAPS.akiba = north({ zones: [[0, 0, 640, ND - 4, 'BACK STREETS', 'PARTS, CAPSULES AND MAID CAFES'], [0, ND - 4, 640, 640, 'AKIHABARA', 'ELECTRIC TOWN']], name: 'AKIHABARA', sub: 'ELECTRIC TOWN', tw: 40, th: 28, music: 'osaka', night: 1, tint: '#9088c8',
    lay() { tRect(PV, 0, 0, 40, 28); roads([[13, 3]], [[24, 3]]); },
    deco() {
      station(70, 192, 'AKIHABARA');
      tower(168, 192, 60, 96, { c: '#f2c14e', sign: 'FIGURES', sc: '#e0563f', to: 'figures', vs: 8, vc: '#5ad8f0' });
      tower(268, 192, 104, 120, { c: '#e0563f', sign: 'RADIO HALL', sc: '#f2c14e', st: '#1d1626', scr: [10, 10, 84, 36], scrc: ['#ffd84a', '#f06a8c', '#8a6aff'], vs: 6, vsx: 88, vc: '#ffd84a' });
      tower(350, 192, 44, 76, { c: '#5aa8e0', sign: 'MANGA', sc: '#f06a8c' });
      tower(482, 192, 70, 100, { c: '#8a6aff', sign: 'GAME CENTER', sc: '#5ad88a', st: '#1d1626', to: 'arcade', vs: 8, vc: '#f06a8c' }); tower(566, 192, 64, 70, { c: '#3a3a5a', sign: 'RETRO GAMES', sc: '#f2a03a', vs: 5, vc: '#5ad88a' });
      cityEdge(); lamps(206, '#d0e8ff'); lamps(272, '#ffd0f0');
      for (const [x, c] of [[120, '#5ad8f0'], [250, '#f06a8c'], [520, '#ffd84a']]) tower(x, 330, 50, 56, { c: '#4a4a6a', sign: ['PC PARTS', 'IDOL CAFE', 'CARDS'][x % 3], sc: c, vs: 5, vc: c });
      plaza(396); M.SPOTS.push({ x: 566, y: 199, r: 12, label: 'LOOK', lines: ['SHELVES OF GREY CARTRIDGES FROM THIRTY YEARS AGO.', 'YOU CAN HEAR SOMEONE PLAYING A FAMILIAR TUNE INSIDE.'] });
      stampSpot('denki', 268, 204, 'TAKE A PHOTO', 'snap', ['EIGHT FLOORS OF CABLES, CHIPS AND BLINKING LIGHTS.', 'IF IT RUNS ON ELECTRICITY, SOMEBODY HERE SELLS IT.'], 13);
      cars(228, -1, 3); cars(251, 1, 3); crowd(7, 40, 200, 610, 200, 6); crowd(7, 610, 266, 40, 266, 8); crowd(4, 378, 200, 378, 268, 6); crowd(4, 438, 268, 438, 200, 6);
      npc('maiko', 320, 200, { lines: ['WELCOME HOME, TRAVELLER! THE CAFE IS UPSTAIRS!', 'TODAY\'S SPECIAL IS OMELETTE RICE WITH A KETCHUP CAT!'], tint: '#3a3a4e' }); npc('kid', 200, 200, { lines: ['I HAVE BEEN TRYING FOR THE GOLD DRAGON ALL WEEK.'] });
    } }, NORTH, BACKSTREETS);
  MAPS.asakusa = { name: 'ASAKUSA', sub: 'OLD TOKYO UNDER THE BIG RED LANTERN', tw: 40, th: 34, music: 'kyoto', petals: 1,
    lay() { tRect(FR, 0, 0, 40, 26.5); tOval(GR, 20, 13.5, 16.5, 10.5); tOval(GR, 34, 13, 6, 7); tOval(GR, 7.5, 18, 7, 7.5); tOval(GR, 29, 21, 9, 5); tRect(GR, 1.5, 22.5, 38.5, 26.5); tRect(PV, 0, 26.5, 40, 34); tRect(VL, 11, 6, 29, 15.5); tRect(PL, 18.5, 15.5, 21.5, 26.5); roads([[30, 2]], []); },
    deco() {
      put(SPR.hall, 320, 150, 88, 90); block(260, 128, 380, 150); door(320, 150, 'sensoji'); fur('burner', 320, 214);
      put(SPR.pagoda, 196, 196, 52, 130); block(166, 178, 226, 196); put(SPR.skytree, 566, 192, 33, 197); block(546, 182, 586, 192);
      put(SPR.kaminari, 320, 440, 55, 85); block(276, 434, 300, 440); block(340, 434, 364, 440);
      for (let y = 266; y < 420; y += 30) for (const x of [280, 360]) prop('stall', x, y, 13);
      for (const y of [170, 200, 230]) for (const x of [296, 344]) prop('lantern', x, y, 4);
      for (const [x, y] of [[120, 130], [150, 250], [100, 330], [220, 300], [200, 380], [430, 130], [470, 240], [420, 330], [520, 300], [500, 400], [590, 330], [250, 110], [400, 110]]) plant(hsh(x, y) < 0.6 ? 'sakura' : 'pine', x, y, 1);
      station(70, 448, 'ASAKUSA'); house(170, 448, 60, 28, { sign: 'KIMONO', noren: '#8a6aff', rh: 14, lantern: true }); house(470, 448, 60, 28, { sign: 'TEMPURA', noren: '#f2a03a', rh: 14, lantern: true }); house(560, 448, 56, 28, { sign: 'SENBEI', noren: '#3f7a5a', rh: 14 });
      sideTowers(470); prop('rick', 410, 456, 9); wild(['green', 'pine', 'green2', 'sakura']); prop('vend', 124, 446, 6);
      stampSpot('kaminari', 320, 458, 'TAKE A PHOTO', 'snap', ['THE THUNDER GATE, WITH A LANTERN AS TALL AS A BUS.', 'THE GODS OF WIND AND THUNDER STAND GUARD ON EITHER SIDE.'], 13);
      // the Skytree rises past the top of the map, so its photo is a postcard: the tower over the Sumida river and its red bridge
      stampSpot('sky', 560, 210, 'TAKE A PHOTO', 'snap', ['THE SKYTREE, 634 METRES OF STEEL ACROSS THE RIVER.', 'OLD TOKYO IN FRONT, NEW TOKYO BEHIND.'], 16, { photo(g, w, h) {
        const r = RNG(8), by = Math.round(h * 0.7); dgrad(g, 0, 0, w, by, ['#78b4e6', '#a8d2f0', '#e2ecf4']); for (const [x, y, a] of [[w * 0.18, 12, 16], [w * 0.8, 20, 12]]) { ell(g, x, y, a, 2, '#f4f8fc'); ell(g, x + 4, y - 1.5, a * 0.5, 1.5, '#ffffff'); }
        skyline(g, 0, w, by, 6, 20, '#a8b4cc', r); g.imageSmoothingEnabled = true; g.drawImage(SPR.skytree, Math.round(w * 0.6) - 18, by - 104, 36, 110); g.imageSmoothingEnabled = false; skyline(g, 0, w, by + 1, 3, 11, '#7c88a8', r);
        R(g, 0, by, w, h - by, '#4a8ec0'); for (let k = 0; k < 14; k++) R(g, r() * w, by + 8 + r() * (h - by - 10), 3 + r() * 6, U, 'rgba(255,255,255,0.5)');
        R(g, 0, by + 3, w, 3, '#c0442f'); R(g, 0, by + 3, w, U, '#e8705a'); for (let x = 6; x < w; x += 22) { R(g, x, by + 6, 2, 6, '#a8382a'); for (let k = 0; k < 9; k++) R(g, x + 2 + k * 2.2, by + 6 + Math.abs(k - 4) * 0.8, 2.2, U, '#c0442f'); }
      } });
      M.SPOTS.push({ x: 320, y: 224, r: 13, label: 'WAFT THE SMOKE', fx: 'wind', lines: ['YOU WAVE THE INCENSE SMOKE OVER YOUR HEAD.', 'IT IS SAID TO MAKE YOU WISER. YOU FEEL ABOUT THE SAME.'] });
      cars(502, -1, 2); cars(510, 1, 2); crowd(8, 308, 250, 308, 430, 10); crowd(8, 332, 430, 332, 250, 10); crowd(5, 40, 456, 600, 456, 5); crowd(3, 250, 180, 400, 190, 6);
      npc('yukata', 426, 462, { lines: ['RICKSHAW RIDE? I KNOW EVERY BACK STREET.', 'MY LEGS ARE STRONGER THAN ANY TAXI.'] }); npc('granny', 274, 300, { lines: ['FRESH MELON BREAD! STILL WARM!', 'NO EATING WHILE WALKING, DEAR.'] }); npc('kimono', 380, 200, { rad: 30, lines: ['DRAW A FORTUNE INSIDE THE HALL.', 'IF IT IS BAD LUCK, JUST TIE IT UP AND LEAVE IT.'] }); M.ACT.push({ cat: true, x: 232, y: 214, k: 0 });
    } };
  MAPS.ueno = { name: 'UENO', sub: 'PARK, PANDAS AND MUSEUMS', tw: 40, th: 30, music: 'nara', petals: 1,
    lay() { tRect(FR, 0, 0, 40, 22.5); tOval(GR, 20, 14, 17.5, 9.2); tOval(GR, 9, 13, 7.5, 8); tOval(GR, 31, 15.5, 8, 7); tOval(GR, 20, 6.5, 7, 4); tRect(GR, 3, 19.5, 37.5, 22.5); tRect(PV, 0, 22.5, 40, 30); roads([[26, 2]], []); tRoad(DT, [[8.5, 22.6], [9, 20], [9, 11.5]], 0.9, GR); tRoad(DT, [[14.5, 22.6], [14.5, 20]], 0.8, GR); tRoad(DT, [[9, 20], [20.5, 20], [20.5, 9.5]], 0.9, GR); tRoad(DT, [[20.5, 20], [33, 21], [36, 16], [33, 10.5], [20.5, 13]], 0.8, GR); tOval(WA, 28, 16, 5.5, 3.2); },
    deco() {
      tower(144, 168, 76, 34, { c: '#8fc97a', sign: 'UENO ZOO', sc: '#3f7a5a', to: 'zoo', top: false }); plant('bush', 96, 168, 1); plant('bush', 192, 168, 1);
      tower(328, 136, 128, 48, { c: '#e8e0d0', sign: 'MUSEUM', sc: '#5a4a48', to: 'museum', top: false, lit: 0, art: (g, x, t, b) => { roof(g, x + 64, t - 12, 20, 70, 13, '#6a7a8a'); for (let i = 0; i < 9; i++) { R(g, x + 6 + i * 14.5, t + 2, 4, 44, '#f8f4ea'); R(g, x + 6 + i * 14.5, t + 2, 1, 44, '#ffffff'); R(g, x + 9 + i * 14.5, t + 2, 1, 44, '#c8c0b0'); } R(g, x + 54, b - 18, 20, 18, '#3a2630'); R(g, x + 56, b - 16, 16, 16, '#ffd98a'); } });
      prop('saigo', 250, 300, 7); for (const [x, y] of [[388, 232], [470, 262], [450, 240]]) put(SPR.swan, x, y, 11, 17);
      for (let x = 60; x < 330; x += 34) { plant('sakura', x + 190, 300, 1); if (x < 250) plant('sakura', x + 40, 292, 1); } for (let y = 200; y < 300; y += 34) { plant('sakura', 120, y, 1); plant('sakura', 172, y + 10, 1); plant('sakura', 306, y, 1); plant('sakura', 352, y + 12, 1); }
      ledge([[0, 348], [320, 346], [640, 348]], 12, 'stone'); block(0, 358, 640, 370); steps(136, 347, 24, 22); steps(232, 347, 24, 22);
      for (const [x, y] of [[230, 120], [240, 220], [430, 120], [520, 130], [580, 190], [600, 280], [560, 340], [70, 240], [66, 120], [420, 340], [500, 190]]) plant(hsh(x, y) < 0.5 ? 'green2' : 'pine', x, y, 1);
      for (const [x, y] of [[226, 330], [300, 336], [400, 300], [470, 300]]) prop('bench', x, y, 9); for (const [x, y] of [[360, 266], [520, 270]]) prop('lantern', x, y, 4);
      station(70, 384, 'UENO'); house(180, 384, 60, 28, { sign: 'BENTO', noren: '#e0563f', rh: 14 }); tower(290, 384, 70, 44, { c: '#c8b8a0', sign: 'AMEYOKO MARKET', sc: '#e0563f' }); tower(400, 384, 60, 48, {}); tower(480, 384, 70, 44, { sign: 'KISSATEN', sc: '#8a5a3a' }); tower(570, 384, 60, 48, {});
      sideTowers(410); prop('vend', 112, 400, 6); wild(['green', 'green2', 'pine', 'sakura', 'green']);
      M.SPOTS.push({ x: 250, y: 308, r: 12, label: 'READ', lines: ['A BRONZE SAMURAI OUT WALKING HIS DOG.', 'PEOPLE HAVE MET UNDER THIS STATUE FOR A HUNDRED YEARS.'] }); M.SPOTS.push({ x: 448, y: 300, r: 30, label: 'WATCH', lines: ['SWAN BOATS PEDAL IN LAZY CIRCLES AMONG THE LOTUS LEAVES.'] });
      cars(438, -1, 2); cars(446, 1, 2); crowd(5, 40, 394, 600, 394, 5); crowd(5, 150, 322, 330, 322, 6); crowd(3, 146, 190, 146, 310, 6); crowd(3, 328, 150, 328, 310, 6);
      npc('kid', 180, 186, { lines: ['PANDAS! PANDAS! PANDAS!', 'DAD SAYS WE CAN SEE THE PANDAS AGAIN AFTER LUNCH.'] }); npc('granny', 420, 310, { rad: 24, lines: ['THE LOTUS FLOWERS OPEN EARLY IN THE MORNING.', 'I FEED THE DUCKS. THE SIGN SAYS NOT TO. I DO ANYWAY.'] }); M.ACT.push({ cat: true, x: 276, y: 306, k: 2 });
    } };
  MAPS.tower = { name: 'TOKYO TOWER', sub: 'SHIBA PARK AT DUSK', tw: 40, th: 30, music: 'tokyo', night: 1, tint: '#d8a0a8',
    lay() { tRect(FR, 0, 0, 40, 22.5); tOval(GR, 17, 16, 15, 8); tOval(GR, 32, 12.5, 8, 7); tOval(GR, 8, 10, 6, 6); tRect(GR, 2, 19.5, 38.5, 22.5); tRect(PV, 0, 22.5, 40, 30); tRect(PL, 13, 16, 28, 22.5); tRect(VL, 29, 12, 38, 19); tRoad(DT, [[28, 20], [33.5, 20], [33.5, 18]], 0.9, GR); roads([[26, 2]], []); },
    deco() {
      put(SPR.ttower, 328, 318, 56, 229); block(286, 306, 306, 318); block(350, 306, 370, 318); M.LIGHTS.push([328, 250, 40, '#ff9a5a'], [328, 170, 26, '#ffb070']);
      tower(328, 312, 44, 24, { c: '#f0e8dc', sign: 'TOWER', sc: '#ff6f3c', to: 'tdeck', lab: 'GO UP', top: false, lit: 1 });
      put(SPR.hall, 536, 262, 88, 90); block(476, 240, 596, 262); prop('box', 536, 270, 7); for (const x of [504, 568]) prop('lantern', x, 292, 4);
      ledge([[464, 306], [608, 306]], 10, 'stone'); steps(536, 306, 24, 14); wallV(462, 196, 306); wallV(610, 196, 306);
      for (const [x, y] of [[90, 150], [150, 220], [100, 300], [200, 160], [220, 280], [420, 180], [440, 300], [600, 320], [470, 320], [240, 100], [400, 100], [560, 120], [160, 110], [80, 230]]) plant(hsh(x, y) < 0.4 ? 'maple' : hsh(x, y) < 0.7 ? 'green' : 'pine', x, y, 1);
      for (const [x, y] of [[236, 340], [420, 340]]) { prop('lamp', x, y, 2); M.LIGHTS.push([x - 4, y - 28, 20, '#ffe8a8']); } prop('bench', 260, 350, 9); prop('bench', 396, 350, 9);
      station(70, 384, 'ONARIMON'); tower(190, 384, 60, 46, { sign: 'CAFE', sc: '#8a5a3a' }); tower(480, 384, 70, 44, { sign: 'SOUVENIRS', sc: '#ff6f3c' }); tower(570, 384, 60, 48, {}); tower(400, 384, 60, 40, {});
      sideTowers(410); lamps(398); wild(['green', 'maple', 'pine', 'green2', 'green']);
      stampSpot('zojo', 536, 280, 'PRAY', 'bow', ['A TEMPLE SIX HUNDRED YEARS OLD, WITH THE TOWER RIGHT BEHIND IT.', 'THE BELL IS RUNG 108 TIMES ON NEW YEAR\'S EVE.']);
      cars(438, -1, 2); cars(446, 1, 2); crowd(5, 40, 394, 600, 394, 5); crowd(4, 240, 330, 420, 356, 8); crowd(2, 480, 300, 590, 320, 6);
      npc('tourist', 290, 344, { lines: ['IT IS THIRTEEN METRES TALLER THAN THE ONE IN PARIS.', 'THEY PAINT IT ORANGE AND WHITE SO PLANES CAN SEE IT.'] }); npc('kimono', 370, 350, { lines: ['IT LIGHTS UP WHEN THE SUN GOES DOWN. JUST WAIT.'] }); M.ACT.push({ cat: true, x: 500, y: 290, k: 1 });
    } };
  MAPS.tokyo = north({ zones: [[0, 0, 672, ND - 4, 'MARUNOUCHI', 'THE PALACE MOAT AND ITS STONE WALLS'], [0, ND - 4, 672, 640, 'TOKYO STATION', 'RED BRICK, GINZA GLASS']], name: 'TOKYO STATION', sub: 'RED BRICK, GINZA GLASS', tw: 42, th: 28, music: 'tokyo',
    lay() { tRect(PV, 0, 0, 42, 28); tRect(PL, 2, 16, 23, 17); roads([[17, 3]], [[24, 3]]); },
    deco() {
      put(SPR.brick, 196, 256, 150, 95); block(52, 238, 340, 256); M.SPOTS.push({ x: 150, y: 263, r: 14, label: 'TRAINS', train: 1 }); M.st = [150, 268]; shinkansen(246, 256);
      house(470, 256, 60, 28, { sign: 'SUSHI', noren: '#3d5a80', rh: 14, lantern: true, to: 'sushi' }); put(SPR.clock, 580, 256, 35, 118); block(551, 240, 609, 256); door(580, 256, 'mall', 'ENTER STORE');
      tower(644, 256, 40, 96, { c: '#b8c8d8' }); cityEdge();
      for (const [x, y] of [[80, 366], [180, 372], [300, 362], [470, 370], [580, 364]]) plant('ginkgo', x, y, 1); prop('bench', 130, 360, 9); prop('bench', 240, 360, 9); prop('vend', 520, 254, 6); lamps(270);
      for (const [x, c, s] of [[110, '#6a7a94', 'BANK'], [260, '#8a94b0', 'HOTEL'], [520, '#a8a0b8', 'GINZA SIX']]) tower(x, 400, 80, 40, { c, sign: s, sc: '#3a3a5a' });
      stampSpot('brick', 110, 268, 'TAKE A PHOTO', 'snap', ['THREE DOMES AND A MILLION RED BRICKS, BUILT IN 1914.', 'BULLET TRAINS LEAVE FROM BEHIND IT EVERY FEW MINUTES.']);
      cars(292, -1, 3); cars(315, 1, 3); crowd(7, 40, 264, 640, 264, 5); crowd(7, 640, 330, 40, 330, 8); crowd(4, 378, 264, 378, 332, 6); crowd(4, 438, 332, 438, 264, 6);
      npc('salary', 250, 268, { lines: ['PLATFORM TWENTY-THREE... OR WAS IT THIRTY-TWO?', 'I HAVE WORKED HERE TEN YEARS AND STILL GET LOST INSIDE.'] }); npc('office', 600, 268, { lines: ['THE BASEMENT FOOD HALL IS THE BEST PART OF THE STORE.'] });
    } }, NORTH, MARUNOUCHI);

  // ---------- rooms ----------
  MAPS.ramen = { indoor: 1, name: 'RAMEN SHOP', deco() {
    room({ wall: '#8a4a38', art: (g, r) => { wallShelf(g, 20, 70, ['#f4f1e6', '#e0563f', '#3a3a4e'], r); wallShelf(g, 230, 70, ['#f2c14e', '#8a5a3a', '#f4f1e6'], r); poster(g, 110, 10, 44, 16, '#c8382e', 'SHOYU 800'); poster(g, 162, 10, 44, 16, '#f2a03a', 'MISO 850'); for (const x of [100, 220]) chochin(g, x, 30, '#e0452f'); } });
    fur('counter', 160, 92, 208); for (let x = 68; x <= 252; x += 26) fur('stool', x, 106);
    eaters([68, 120, 198, 250], 104, ['SLURP. SLURP. SLUUURP.', 'EXTRA NOODLES, PLEASE!', 'THIS BROTH TOOK TWO DAYS TO MAKE.', 'I COME HERE EVERY FRIDAY.']);
    npc('chef', 130, 72, { lines: ['IRASSHAI! SIT ANYWHERE YOU LIKE!', 'SLURPING IS A COMPLIMENT HERE.'] }); npc('chef', 200, 72, { dir: 'l', lines: ['ONE SHOYU, COMING UP!'] });
    fur('booth', 50, 160); fur('booth', 270, 160); fur('plant', 20, 70); fur('plant', 300, 70); npc('kid', 50, 150, { lines: ['THE EGG IS THE BEST PART.'] });
    M.SPOTS.push({ x: 160, y: 108, r: 12, label: 'EAT RAMEN', stamp: 'ramen', act: 'hold', fx: 'slurp', lines: ['THE BOWL ARRIVES STEAMING, WITH A SOFT EGG AND TWO SLICES OF PORK.', 'YOU DRINK THE BROTH TO THE LAST DROP.'] });
  } };
  function fashion(id, name, wall, col, stamp) { MAPS[id] = { indoor: 1, name, deco() {
    room({ wall, floor: 'tile', t1: '#f8f0f4', t2: lite(col, 0.6), mat: col, art: (g, r) => { for (const x of [24, 250]) wallShelf(g, x, 46, ['#f06a8c', '#5aa8e0', '#f2c14e', '#f4f1e6', '#8a6aff'], r); R(g, 140, 8, 40, 36, '#8a8496'); R(g, 142, 10, 36, 32, '#cfeaff'); R(g, 146, 12, 4, 28, '#ffffff'); poster(g, 86, 10, 44, 14, col, 'NEW IN'); poster(g, 192, 10, 44, 14, '#1d1626', 'SALE'); } });
    for (const [x, y, k] of [[50, 96, 0], [270, 96, 3], [50, 150, 2], [270, 150, 5], [110, 124, 1], [210, 124, 4]]) fur('rack', x, y, k);
    fur('counter', 160, 84, 60, '#f4f1e6'); fur('till', 176, 78); fur('plant', 20, 176); fur('plant', 300, 176);
    const k = npc('office', 160, 66, { tint: col, lines: ['WELCOME!'] }); k.spot = { label: 'TRY SOMETHING ON', mini: 'dress', stamp };
    npc('teen', 80, 126, { rad: 26, tint: '#f2c14e', lines: ['DOES THIS COME IN A SMALLER SIZE?', 'I ALREADY OWN FOUR OF THESE.'] }); npc('office', 240, 160, { rad: 26, lines: ['EVERYTHING HERE IS SO CUTE I CANNOT CHOOSE.'] }); npc('teen', 220, 100, { dir: 'u', tint: '#5aa8e0', lines: ['HMM. THE BLUE OR THE OTHER BLUE?'] });
  } }; }
  fashion('mode', 'MODE 109', '#f0d0dc', '#f06a8c'); fashion('kawaii', 'KAWAII BOUTIQUE', '#e0d4f8', '#8a6aff', 'fit');
  MAPS.crepe = { indoor: 1, name: 'CREPE CAFE', deco() {
    room({ wall: '#ffe0ec', floor: 'tile', t1: '#fff8f0', t2: '#f8d0dc', mat: '#f06a8c', art: g => { poster(g, 30, 10, 56, 26, '#f06a8c', 'STRAWBERRY'); poster(g, 96, 10, 56, 26, '#8a5a3a', 'CHOCO BANANA'); poster(g, 168, 10, 56, 26, '#5aa85a', 'MATCHA'); poster(g, 234, 10, 56, 26, '#f2a03a', 'CUSTARD'); } });
    fur('counter', 160, 84, 120, '#f8d0dc'); fur('till', 200, 78); const k = npc('teen', 150, 66, { tint: '#f06a8c', lines: ['HI!'] }); k.spot = { label: 'ORDER A CREPE', stamp: 'crepe', act: 'hold', fx: 'munch', lines: ['A WARM CREPE ROLLED INTO A CONE, STUFFED WITH CREAM AND STRAWBERRIES.', 'YOU GET CREAM ON YOUR NOSE. WORTH IT.'] };
    for (const [x, y] of [[56, 124], [264, 124], [56, 168], [264, 168]]) fur('booth', x, y, '#f06a8c'); fur('table', 160, 150, 2); fur('plant', 20, 70); fur('plant', 300, 70);
    npc('teen', 56, 114, { tint: '#8a6aff', lines: ['WE QUEUED FORTY MINUTES FOR THIS.'] }); npc('kid', 264, 158, { lines: ['MINE HAS A WHOLE SLICE OF CAKE IN IT!'] }); npc('office', 190, 152, { dir: 'l', lines: ['TAKING A PHOTO BEFORE I EAT IT. OBVIOUSLY.'] });
  } };
  MAPS.izakaya = { indoor: 1, name: 'YAKITORI ALLEY', deco() {
    room({ wall: '#4a3028', art: (g, r) => { wallShelf(g, 24, 60, ['#5aa85a', '#f4f1e6', '#8a5a3a', '#f2c14e'], r); wallShelf(g, 236, 60, ['#5aa8e0', '#f4f1e6', '#e0563f'], r); for (let x = 96; x < 230; x += 22) chochin(g, x, 8, x % 44 ? '#e0452f' : '#f2c14e'); poster(g, 104, 30, 112, 12, '#f4e6c0', ''); txtC(g, 'SKEWERS 150 YEN', 160, 33, '#8a2a24'); } });
    fur('counter', 160, 92, 220); for (let x = 62; x <= 258; x += 28) fur('stool', x, 106, '#3a3a4e');
    eaters([62, 90, 202, 258], 104, ['KANPAI!', 'MY BOSS IS A FOOL. ANOTHER ROUND!', 'THE CHICKEN SKIN ONES. TRUST ME.', 'I MISSED THE LAST TRAIN ON PURPOSE.']);
    npc('chef', 160, 72, { lines: ['SALT OR SAUCE?', 'I HAVE FANNED THIS GRILL FOR FORTY YEARS.'] }); fur('table', 60, 160, 1); fur('table', 260, 160, 3); npc('salary', 80, 162, { dir: 'l', lines: ['ZZZ...'] }); npc('office', 240, 162, { dir: 'r', lines: ['HE DOES THIS EVERY WEEK.'] });
    M.SPOTS.push({ x: 146, y: 108, r: 12, label: 'ORDER SKEWERS', stamp: 'yaki', act: 'hold', fx: 'munch', lines: ['SMOKE, CHARCOAL AND SWEET SOY. SIX SKEWERS DISAPPEAR.', 'THE STRANGER NEXT TO YOU POURS YOU A DRINK.'] });
  } };
  function deck(id, name, stamp, cols, lit, lines) { MAPS[id] = { indoor: 1, name, deco() {
    room({ wall: '#3a3a5a', floor: 'carpet', carpet: '#3a4a7a', art: (g, r) => { dgrad(g, 16, 8, 288, 34, cols); if (id === 'tdeck') { mountain(g, 250, 42, 30, 20, '#6a5a8a', r, '#f4f1e6'); } skyline(g, 16, 304, 42, 4, 22, '#2a2a4a', r, { lit, wc: '#ffd98a', wc2: '#ff8a6a' }); R(g, 8, 42, 304, 6, '#2a2a40'); R(g, 8, 4, 304, 4, '#2a2a40'); R(g, 8, 4, 8, 44, '#2a2a40'); R(g, 304, 4, 8, 44, '#2a2a40'); for (let x = 88; x < 300; x += 72) R(g, x, 8, 2, 34, '#2a2a40'); } });
    for (const x of [60, 132, 204, 276]) fur('scope', x, 66); fur('plant', 20, 176); fur('plant', 300, 176); fur('booth', 60, 150, '#5a6a9a'); fur('booth', 260, 150, '#5a6a9a');
    M.SPOTS.push({ x: 168, y: 58, r: 14, label: 'LOOK OUT', stamp, act: 'snap', lines });
    npc('tourist', 96, 60, { dir: 'u', lines: ['I CAN SEE MY HOTEL FROM HERE! I THINK.'] }); npc('kid', 240, 60, { dir: 'u', lines: ['THE CARS LOOK LIKE ANTS!'] }); npc('office', 200, 130, { rad: 30, lines: ['ON A CLEAR DAY YOU CAN SEE MOUNT FUJI.'] }); npc('salary', 60, 140, { lines: ['I COME UP HERE TO THINK.'] });
  } }; }
  deck('deck', 'OBSERVATION DECK - 45F', 'view', ['#1a1a40', '#2a2a5a', '#5a3a6a'], 0.5, ['THE CITY GOES ON FOREVER IN EVERY DIRECTION, ALL LIT UP.', 'THIRTY-SEVEN MILLION PEOPLE LIVE DOWN THERE.']);
  deck('tdeck', 'TOKYO TOWER - MAIN DECK', 'tower', ['#3a3a70', '#a85a7a', '#ffa05a'], 0.3, ['150 METRES UP. THE SUN SETS BEHIND MOUNT FUJI.', 'THERE IS A GLASS PANEL IN THE FLOOR. YOU STEP ON IT VERY CAREFULLY.']);
  MAPS.arcade = { indoor: 1, name: 'GAME CENTER', music: 'osaka', deco() {
    room({ wall: '#2a2a4a', floor: 'carpet', carpet: '#3a2a5a', mat: '#f06a8c', art: g => { for (let x = 20; x < 300; x += 46) { poster(g, x, 10, 38, 18, ['#f06a8c', '#5ad8f0', '#ffd84a', '#8a6aff'][x % 4], ['PLAY', 'WIN', 'UFO', '100 YEN'][x % 4]); } R(g, 8, 36, 304, 1, '#f06a8c'); R(g, 8, 40, 304, 1, '#5ad8f0'); } });
    for (let i = 0; i < 6; i++) { fur('cab', 34 + i * 20, 80, ['#5a4a9a', '#9a4a5a', '#4a8a7a'][i % 3]); fur('cab', 186 + i * 20, 80, ['#9a8a3a', '#5a4a9a', '#9a4a5a'][i % 3]); }
    fur('crane', 70, 140, '#f06a8c'); fur('crane', 110, 140, '#5aa8e0'); fur('crane', 250, 140, '#f2a03a'); fur('gacha', 290, 100, 1); fur('gacha', 290, 126, 2);
    M.SPOTS.push({ x: 90, y: 148, r: 16, label: 'PLAY CRANE GAME', mini: 'crane', stamp: 'crane' }, { x: 250, y: 148, r: 12, label: 'PLAY CRANE GAME', mini: 'crane', stamp: 'crane' });
    npc('teen', 54, 88, { dir: 'u', tint: '#5aa8e0', lines: ['NOT NOW. BOSS FIGHT.'] }); npc('kid', 206, 88, { dir: 'u', lines: ['JUST ONE MORE COIN...'] }); npc('salary', 150, 150, { dir: 'l', lines: ['I HAVE SPENT 3000 YEN ON THIS BEAR. IT IS PERSONAL NOW.'] }); npc('teen', 200, 130, { rad: 24, tint: '#f06a8c', lines: ['THE TRICK IS TO PUSH IT, NOT GRAB IT.'] });
  } };
  MAPS.figures = { indoor: 1, name: 'FIGURE SHOP', music: 'osaka', deco() {
    room({ wall: '#f2c14e', floor: 'tile', t1: '#f4f1e6', t2: '#d8d0c0', mat: '#e0563f', art: (g, r) => { for (const x of [16, 86, 190, 260]) wallShelf(g, x, 46, ['#f06a8c', '#5aa8e0', '#8a6aff', '#5aa85a', '#e0563f', '#f4f1e6'], r); poster(g, 138, 10, 44, 16, '#e0563f', 'NEW!'); } });
    for (const [x, y, k] of [[60, 104, 0], [110, 104, 1], [210, 104, 2], [260, 104, 3], [60, 150, 4], [260, 150, 5]]) fur('cas', x, y, k);
    for (const x of [130, 146, 162, 178]) fur('gacha', x, 150, x % 3); fur('counter', 160, 80, 50, '#f4f1e6'); fur('till', 170, 74);
    M.SPOTS.push({ x: 154, y: 158, r: 16, label: 'TURN THE HANDLE', mini: 'gacha', stamp: 'fig' });
    npc('teen', 160, 64, { tint: '#e0563f', lines: ['THE GOLD DRAGON IS ONE IN SIX. GOOD LUCK.', 'NO REFUNDS ON CAPSULES!'] }); npc('salary', 90, 118, { dir: 'u', lines: ['FIRST EDITION. MINT IN BOX. I NEED A MOMENT.'] }); npc('kid', 236, 118, { dir: 'u', lines: ['I WANT THAT ONE. AND THAT ONE. AND THAT ONE.'] }); npc('tourist', 220, 160, { rad: 20, lines: ['MY SUITCASE IS ALREADY FULL OF THESE.'] });
  } };
  MAPS.sensoji = { indoor: 1, name: 'SENSO-JI MAIN HALL', music: 'kyoto', deco() {
    room({ wall: '#7a2a24', mat: '#8a2a24', art: g => { for (let x = 20; x < 300; x += 40) { R(g, x, 4, 5, 44, '#c0442f'); R(g, x, 4, 1, 44, '#e86a50'); } for (const x of [70, 250]) chochin(g, x, 6, '#e0452f', 2); R(g, 8, 30, 304, 2, '#f2c14e'); } });
    fur('altar', 160, 88); put(SPR.box, 160, 104, 9, 10); block(152, 98, 168, 104); for (const x of [100, 220]) fur('burner', x, 96);
    fur('counter', 268, 150, 44, '#c0442f'); const k = npc('monk', 268, 132, { lines: ['SHAKE THE BOX AND SEE.'] }); k.spot = { label: 'DRAW A FORTUNE', mini: 'omikuji', stamp: 'omikuji' };
    M.SPOTS.push({ x: 160, y: 112, r: 12, label: 'PRAY', fx: 'bell', lines: ['YOU DROP A FIVE YEN COIN AND PUT YOUR HANDS TOGETHER.', 'THE GOLD GLOWS IN THE CANDLELIGHT.'] });
    npc('granny', 120, 124, { dir: 'u', lines: ['I HAVE COME HERE EVERY MORNING SINCE I WAS A GIRL.'] }); npc('tourist', 204, 126, { dir: 'u', lines: ['SHH. I AM MAKING A WISH.'] }); npc('kimono', 70, 160, { rad: 24, lines: ['MINE SAID SMALL BLESSING. I WILL TAKE IT.'] });
  } };
  MAPS.zoo = { indoor: 1, name: 'PANDA HOUSE', music: 'nara', deco() {
    room({ wall: '#b8d8a8', floor: 'tile', t1: '#e8e0d0', t2: '#d8d0c0', art: (g, r) => { R(g, 8, 48, 304, 60, '#64b054'); for (let i = 0; i < 160; i++) R(g, 10 + r() * 300, 50 + r() * 56, U, 2, r() < 0.5 ? '#3c8440' : '#8fd070'); for (let x = 16; x < 310; x += 18) bamboo(g, x + r() * 8, 46, 30 + r() * 10, '#5aa85a', r); R(g, 8, 108, 304, 3, '#8a5a3a'); for (let x = 8; x < 312; x += 10) R(g, x, 100, 2, 11, '#a8744a'); R(g, 8, 101, 304, 1.5, '#c89a6a'); poster(g, 130, 8, 60, 14, '#3f7a5a', 'GIANT PANDA'); } });
    block(0, 0, 320, 112); fur('panda', 110, 86); fur('panda', 222, 80); fur('plant', 20, 176); fur('plant', 300, 176);
    M.SPOTS.push({ x: 160, y: 118, r: 16, label: 'TAKE A PHOTO', stamp: 'panda', act: 'snap', lines: ['ONE PANDA IS EATING BAMBOO. THE OTHER IS ASLEEP ON ITS FACE.', 'A HUNDRED PEOPLE SAY "KAWAII" AT THE SAME TIME.'] });
    eaters([60, 100, 216, 262], 120, ['KAWAII!', 'IT MOVED! DID YOU SEE? IT MOVED!', 'THEY EAT FOR FOURTEEN HOURS A DAY. LIVING THE DREAM.', 'LOOK AT ITS LITTLE EARS!']); npc('kid', 180, 160, { rad: 30, lines: ['I WANT TO BE A PANDA WHEN I GROW UP.'] });
  } };
  MAPS.museum = { indoor: 1, name: 'NATIONAL MUSEUM', music: 'nara', deco() {
    room({ wall: '#e8e0d0', floor: 'tile', t1: '#d8d0c0', t2: '#c8beae', mat: '#5a4a48', art: g => { for (const [x, c] of [[24, '#5a8ab0'], [80, '#b85a4a'], [204, '#5a9a6a'], [260, '#c8a04a']]) { R(g, x - 2, 8, 40, 28, '#d9b04a'); R(g, x, 10, 36, 24, c); disc(g, x + 12, 20, 6, lite(c, 0.4)); R(g, x, 26, 36, 8, dark(c, 0.3)); } poster(g, 136, 10, 48, 12, '#3a3346', 'DINOSAURS'); } });
    fur('bones', 160, 118); for (const x of [112, 208]) { R(M.ground.g, x, 122, 1, 8, '#d9b04a'); } R(M.ground.g, 108, 126, 104, 1, '#c8382e');
    fur('cas', 50, 100, 2); fur('cas', 270, 100, 4); fur('cas', 50, 156, 1); fur('cas', 270, 156, 3); fur('plant', 20, 70); fur('plant', 300, 70);
    M.SPOTS.push({ x: 160, y: 132, r: 16, label: 'LOOK UP', stamp: 'bone', act: 'snap', lines: ['A WHOLE DINOSAUR, PUT BACK TOGETHER BONE BY BONE.', 'ITS TEETH ARE AS LONG AS YOUR HAND.'] });
    npc('salary', 230, 136, { lines: ['PLEASE DO NOT TOUCH THE EXHIBITS.', 'NOT EVEN A LITTLE.'], tint: '#3a5a8a' }); npc('kid', 110, 140, { dir: 'u', lines: ['RAWR!'] }); npc('granny', 60, 116, { dir: 'u', lines: ['THIS TEA BOWL IS OLDER THAN THE CITY.'] }); npc('office', 200, 170, { rad: 30, lines: ['I COULD SPEND ALL DAY IN HERE.'] });
  } };
  MAPS.mall = { indoor: 1, name: 'DEPARTMENT STORE - FOOD HALL', deco() {
    room({ wall: '#f4eedc', floor: 'tile', t1: '#fff8f0', t2: '#f0e4d0', mat: '#8a2a24', art: (g, r) => { wallShelf(g, 16, 60, ['#f06a8c', '#f2c14e', '#f4f1e6', '#8fc97a'], r); wallShelf(g, 244, 60, ['#5aa8e0', '#e0563f', '#f2c14e', '#8a6aff'], r); poster(g, 84, 10, 46, 14, '#f06a8c', 'SWEETS'); poster(g, 190, 10, 46, 14, '#5aa8e0', 'TOYS 2F'); R(g, 136, 8, 48, 36, '#d9b04a'); R(g, 138, 10, 44, 34, '#3a3346'); txtC(g, 'B1 FOOD', 160, 14, '#ffd98a'); txtC(g, '1F BAGS', 160, 23, '#ffd98a'); txtC(g, '2F TOYS', 160, 32, '#ffd98a'); } });
    fur('counter', 70, 96, 90, '#f8d0dc'); fur('counter', 250, 96, 90, '#d0e8f8'); fur('cas', 70, 150, 1); fur('cas', 110, 150, 3); fur('cas', 230, 150, 5); fur('escal', 290, 180); fur('plant', 20, 176); fur('table', 160, 130, 4);
    const a = npc('office', 70, 76, { tint: '#f06a8c', lines: ['HI'] }); a.spot = { label: 'TRY A SAMPLE', stamp: 'sweets', act: 'hold', fx: 'munch', lines: ['A STRAWBERRY WRAPPED IN SOFT RICE CAKE, IN A BOX LIKE A JEWEL.', 'THE BASEMENT OF EVERY TOKYO DEPARTMENT STORE IS A FOOD PARADISE.'] };
    npc('office', 250, 76, { tint: '#5aa8e0', lines: ['GIFT WRAPPING IS FREE. IT TAKES ME ELEVEN SECONDS.', 'WOULD YOU LIKE A BAG FOR YOUR BAG?'] });
    npc('granny', 110, 112, { dir: 'u', lines: ['TWO BOXES OF THE CHESTNUT ONES, PLEASE.'] }); npc('kimono', 210, 150, { rad: 28, lines: ['I ONLY CAME FOR ONE THING. THAT WAS TWO HOURS AGO.'] }); npc('kid', 180, 170, { rad: 30, lines: ['CAN WE GO TO THE TOY FLOOR NOW? NOW? NOW?'] }); npc('salary', 250, 112, { dir: 'u', lines: ['SOMETHING FOR MY WIFE. SOMETHING EXPENSIVE-LOOKING.'] });
  } };
  MAPS.sushi = { indoor: 1, name: 'CONVEYOR SUSHI', deco() {
    room({ wall: '#e8dcc0', art: (g, r) => { for (const [x, s, c] of [[24, 'TUNA', '#d8404a'], [84, 'SALMON', '#f08a5a'], [200, 'EGG', '#d8a82a'], [256, 'SHRIMP', '#e08a70']]) poster(g, x, 10, 46, 14, c, s); wallShelf(g, 136, 48, ['#f4f1e6', '#3a3a4e', '#5aa85a'], r); } });
    fur('belt', 160, 104, 200); fur('belt', 160, 150, 200); for (let x = 70; x <= 250; x += 30) { fur('stool', x, 118, '#3d5a80'); fur('stool', x, 164, '#3d5a80'); }
    eaters([70, 130, 250], 116, ['EIGHT PLATES SO FAR. DO NOT JUDGE ME.', 'THE COLOUR OF THE PLATE IS THE PRICE.', 'WASABI. TOO MUCH WASABI.']); eaters([100, 220], 162, ['GRAB IT BEFORE IT GOES ROUND AGAIN!', 'TEA IS FREE. THE TAP IS RIGHT THERE.']);
    npc('chef', 160, 78, { lines: ['WHATEVER PASSES, TAKE IT! FRESH THIS MORNING!'] }); M.SPOTS.push({ x: 190, y: 120, r: 12, label: 'SIT DOWN', mini: 'sushi', stamp: 'sushi' });
  } };

  concourse('tk_shinkansen', { name: 'TOKYO STATION', hub: 'tokyo', music: 'tokyo', track: 14, dest: 'KYOTO', bento: ['MAKUNOUCHI', 'A LITTLE BOX OF EVERYTHING: GRILLED SALMON, RICE, A ROLLED OMELETTE, PICKLES.'] });
  city({
    id: 'tokyo', name: 'TOKYO', tagline: 'EIGHT DISTRICTS - ONE TRAIN LINE - NO HURRY',
    start: 'shibuya', hub: 'tokyo', concourse: 'tk_shinkansen', line: LINE, stamps: STAMPS, cats: 7,
    sprites() { // landmark art only this city needs
      one('ttower', 110, 230, g => { for (let i = 0; i < 444; i++) { const t = i / 444, hw = snap(1 + 222 * 0.19 * Math.pow(Math.max(0, t - 0.1) / 0.9, 2.1)); if (t < 0.12) continue; const k = t >= 0.8 ? snap((t - 0.8) / 0.2 * hw * 0.6) : 0, c = Math.floor(t * 9) % 2 ? '#e8d8c0' : '#d8552c'; if (k < 1.5) R(g, 55 - hw, 6 + i / 2, hw * 2, U, c); else { R(g, 55 - hw, 6 + i / 2, hw - k, U, c); R(g, 55 + k, 6 + i / 2, hw - k, U, c); } } tokyoTower(g, 55, 228, 222); }, 1); one('box', 16, 10, g => { R(g, 1, 2, 14, 8, '#8a5a3a'); R(g, 1, 2, 14, 3, '#5a3a28'); for (let x = 2; x < 15; x += 2) R(g, x, 2, 1, 3, '#a8744a'); R(g, 6, 6.5, 4, 2, '#f2c14e'); }, 1);
      one('hachi', 18, 26, g => { R(g, 2, 16, 14, 9, '#8c8498'); R(g, 2, 16, 14, 1, '#c8c0d4'); R(g, 1, 24, 16, 2, '#6b6478'); dogStatue(g, 3, 16, '#a8845a'); }, 1);
      one('skytree', 64, 196, g => { // a tripod base, a lattice shaft narrowing as it rises, two observation decks and the antenna
        for (let y = 40; y < 194; y++) {
          const t = (y - 40) / 154, hw = 3.5 + 8.5 * Math.pow(t, 1.25) + (y > 170 ? (y - 170) * 0.55 : 0), x0 = 32 - hw;
          R(g, x0, y, hw * 2, 1, '#b8c6de'); R(g, 32, y, hw, 1, '#94a6c6'); R(g, x0, y, 1, 1, '#d8e2f2');
          for (let x = Math.ceil(x0 + 1); x < 32 + hw - 1; x += 3) if ((x + y) % 6 < 1.5 || (x - y + 600) % 6 < 1.5) p1(g, x, y, '#7a8cb0');
        }
        for (const x of [17, 32, 47]) R(g, x - 2, 186, 4, 10, '#7a8cb0');
        ell(g, 32, 100, 14, 5, '#5a6a8a'); R(g, 18, 96, 28, 8, '#5a6a8a'); R(g, 18, 98, 28, 3, '#ffe6a0'); for (let x = 19; x < 46; x += 3) R(g, x, 98, U, 3, '#5a6a8a'); R(g, 18, 96, 28, U, '#c8d4e8');
        ell(g, 32, 72, 9, 3, '#5a6a8a'); R(g, 23, 70, 18, 5, '#5a6a8a'); R(g, 23, 71.5, 18, 2, '#cfe8ff'); R(g, 23, 70, 18, U, '#c8d4e8');
        for (let y = 2; y < 42; y++) { const hw = y < 20 ? 1 : 1.5 + (y - 20) * 0.08; R(g, 32 - hw, y, hw * 2, 1, y % 6 < 3 ? '#e8eef8' : '#b8c6de'); } disc(g, 32, 2, 1.4, '#ff5a4a');
        R(g, 6, 194, 52, 2, '#6b6478');
      }, 1);
      one('kaminari', 110, 86, g => { roof(g, 55, 4, 26, 54, 22, '#3d3852'); R(g, 10, 26, 90, 6, '#b8402f'); R(g, 10, 26, 90, 1, '#e86a50'); for (const x of [12, 34, 68, 90]) { R(g, x, 32, 8, 52, '#c0442f'); R(g, x, 32, 2, 52, '#e86a50'); R(g, x + 6, 32, 2, 52, '#8a2a20'); R(g, x - 1, 82, 10, 3, '#8c8498'); } R(g, 14, 36, 18, 46, '#3a2228'); R(g, 78, 36, 18, 46, '#3a2228'); R(g, 19, 48, 8, 30, '#5a8a6a'); disc(g, 23, 46, 4, '#7ab08a'); R(g, 83, 48, 8, 30, '#b85a4a'); disc(g, 87, 46, 4, '#e08a6a'); chochin(g, 55, 32, '#e0452f', 3.6); R(g, 52, 42, 6, 14, '#1d1626'); R(g, 53.5, 43, 3, 2, '#f2c14e'); R(g, 53.5, 47, 3, 1, '#f2c14e'); R(g, 54.5, 46, 1, 8, '#f2c14e'); R(g, 53, 51, 4, 1, '#f2c14e'); });
      one('cgai', 72, 42, g => { for (const x of [2, 66]) { R(g, x, 4, 4, 38, '#c8382e'); R(g, x, 4, 1.5, 38, '#f06a5a'); } R(g, 4, 2, 64, 15, '#1d2a44'); R(g, 5, 3, 62, 13, '#2f4a7a'); R(g, 5, 3, 62, U, '#5a7aa8'); txt(g, 'CENTER GAI', 16, 7, '#ffd84a'); for (let x = 8; x < 66; x += 6) disc(g, x, 1, 1, x % 12 ? '#ffd84a' : '#f06a8c'); }, 1);
      one('arch', 96, 50, g => { for (const x of [4, 86]) { R(g, x, 10, 6, 40, '#f06a8c'); R(g, x, 10, 1.5, 40, '#ffa8c0'); R(g, x + 4.5, 10, 1.5, 40, '#b8405c'); } R(g, 2, 6, 92, 14, '#1d1626'); R(g, 3, 7, 90, 12, '#f06a8c'); R(g, 3, 7, 90, 1.5, '#ffa8c0'); txtC(g, 'TAKESHITA STREET', 48, 11, '#fff8e8'); for (let i = 0; i < 9; i++) disc(g, 8 + i * 10, 4, 2.5, ['#ffd84a', '#5ad8f0', '#ff8a6a', '#8fd070'][i % 4]); });
      one('brick', 300, 96, g => { R(g, 6, 40, 288, 56, '#a84a38'); for (let y = 42; y < 96; y += 3) { R(g, 6, y, 288, U, '#8a3a2c'); for (let x = 8 + (y % 6) * 1.5; x < 294; x += 6) p1(g, x, y + 1, '#c86a50'); } R(g, 6, 40, 288, 3, '#f4eedc'); R(g, 6, 66, 288, 2, '#f4eedc'); for (let x = 14; x < 290; x += 12) { for (const y of [48, 74]) { R(g, x - 1, y - 1, 7, 13, '#f4eedc'); R(g, x, y, 5, 11, '#4a6a8a'); R(g, x, y, 5, 2, '#cfeaff'); R(g, x + 2.25, y, U, 11, '#f4eedc'); } } for (const cx of [60, 150, 240]) { const big = cx === 150; R(g, cx - 22, 26, 44, 16, '#a84a38'); R(g, cx - 22, 26, 44, 2, '#f4eedc'); ell(g, cx, 26, big ? 20 : 18, big ? 16 : 13, '#4a5a6a'); ell(g, cx - 3, 23, big ? 14 : 12, big ? 10 : 8, '#6a7a8a'); R(g, cx - 22, 26, 44, 1, '#f4eedc'); R(g, cx - 0.5, 4, 1, 8, '#f2c14e'); disc(g, cx, 34, 3.5, '#f4eedc'); p1(g, cx, 33, '#1d1626'); R(g, cx, 34, 1.5, U, '#1d1626'); } R(g, 138, 76, 24, 20, '#3a2630'); R(g, 140, 78, 20, 18, '#ffd98a'); R(g, 149.5, 78, 1, 18, '#3a2630'); R(g, 126, 70, 48, 4, '#f4eedc'); });
      one('clock', 70, 120, g => { bldg(g, 6, 118, 58, 70, { c: '#d8d0c0', lit: 0.3, gx: 7, ww: 4, wh: 5, gy: 9, foot: 24, top: false }, RNG(5)); R(g, 6, 96, 58, 22, '#4a4458'); R(g, 8, 98, 54, 18, '#ffd98a'); for (let x = 16; x < 60; x += 9) R(g, x, 98, U, 18, '#4a4458'); R(g, 23, 20, 24, 30, '#d8d0c0'); R(g, 23, 20, 24, 2, '#f4eedc'); R(g, 23, 20, 2, 30, '#f4eedc'); roof(g, 35, 12, 6, 15, 9, '#4a8a7a'); R(g, 34.5, 4, 1, 9, '#4a8a7a'); disc(g, 35, 35, 9, '#3a3346'); disc(g, 35, 35, 8, '#fff8e8'); R(g, 34.5, 29, 1, 6, '#1d1626'); R(g, 35, 34.5, 5, 1, '#1d1626'); for (let k = 0; k < 12; k++) p1(g, 35 + Math.cos(k * 0.5236) * 7, 35 + Math.sin(k * 0.5236) * 7, '#1d1626'); });
      one('swan', 22, 18, g => { ell(g, 10, 13, 9, 4, '#e8e4f0'); ell(g, 9, 12, 8, 3, '#ffffff'); R(g, 15, 3, 3, 9, '#ffffff'); R(g, 15, 2, 5, 3, '#ffffff'); R(g, 19, 3, 2, 1, '#f2a03a'); p1(g, 17.5, 3, '#1d1626'); R(g, 3, 9, 9, 2, '#f06a8c'); R(g, 0, 16, 22, 1, '#a6dcee'); }, 1);
      one('saigo', 18, 34, g => { R(g, 2, 24, 14, 9, '#8c8498'); R(g, 2, 24, 14, 1, '#c8c0d4'); R(g, 5, 9, 8, 15, '#6a8a7a'); R(g, 5, 9, 2, 15, '#8ab0a0'); disc(g, 9, 6, 4, '#6a8a7a'); disc(g, 8, 5, 2, '#8ab0a0'); R(g, 13, 19, 4, 5, '#6a8a7a'); R(g, 15, 17, 2, 2, '#6a8a7a'); }, 1);
      one('rick', 26, 20, g => { disc(g, 8, 14, 5, '#2a2430'); disc(g, 8, 14, 3.5, '#c8c0d4'); disc(g, 8, 14, 1, '#2a2430'); R(g, 4, 5, 10, 7, '#c8382e'); R(g, 4, 2, 2, 10, '#2a2430'); R(g, 4, 2, 9, 2, '#2a2430'); R(g, 12, 11, 13, 1, '#2a2430'); R(g, 5, 6, 8, 2, '#e86a50'); }, 1);
      icon('dog', g => { R(g, 2, 5, 6, 6, '#c9824a'); R(g, 5, 1, 5, 5, '#c9824a'); R(g, 5, 0, 1, 2, '#93603a'); R(g, 9, 0, 1, 2, '#93603a'); P(g, 8, 3, '#2a2430'); R(g, 10, 4, 2, 1, '#f6ead4'); R(g, 1, 3, 1, 4, '#c9824a'); R(g, 3, 10, 1, 2, '#93603a'); R(g, 7, 10, 1, 2, '#93603a'); });
      icon('crepe', g => { for (let i = 0; i < 7; i++) R(g, 3 + i * 0.5, 5 + i, 6 - i, 1, '#f2d98a'); R(g, 2, 3, 8, 3, '#fff8e8'); R(g, 3, 2, 3, 2, '#f06a8c'); R(g, 7, 2, 2, 2, '#e0452f'); P(g, 5, 4, '#8a5a3a'); });
      icon('panda', g => { disc(g, 6, 6, 5, '#f8f4ea'); R(g, 1, 1, 3, 3, '#2a2430'); R(g, 8, 1, 3, 3, '#2a2430'); R(g, 3, 5, 2, 3, '#2a2430'); R(g, 7, 5, 2, 3, '#2a2430'); P(g, 6, 8, '#2a2430'); });
      icon('bone', g => { R(g, 2, 5, 8, 2, '#f4eedc'); for (const [x, y] of [[1, 4], [1, 7], [9, 4], [9, 7]]) R(g, x, y, 2, 2, '#f4eedc'); });
      icon('fig', g => { R(g, 4, 5, 4, 5, '#5aa8e0'); disc(g, 6, 3, 2.5, '#f6cfa6'); R(g, 4, 1, 4, 2, '#f06a8c'); R(g, 2, 10, 8, 2, '#3a3346'); R(g, 2, 5, 2, 1, '#5aa8e0'); R(g, 8, 4, 2, 1, '#5aa8e0'); });
      icon('shirt', g => { R(g, 3, 2, 6, 9, '#f06a8c'); R(g, 0, 2, 3, 3, '#f06a8c'); R(g, 9, 2, 3, 3, '#f06a8c'); R(g, 5, 2, 2, 1, '#fff8e8'); R(g, 3, 6, 6, 1, '#fff8e8'); });
      icon('sky', g => { R(g, 5, 0, 1, 2, '#e8f0ff'); R(g, 5, 2, 2, 2, '#c8d4e8'); R(g, 4, 4, 4, 1, '#5a6a8a'); R(g, 5, 5, 2, 3, '#c8d4e8'); R(g, 4, 8, 4, 2, '#a8b8d4'); R(g, 3, 10, 6, 2, '#a8b8d4'); });
      icon('claw', g => { R(g, 5, 0, 2, 4, '#9a94a8'); R(g, 3, 4, 6, 1, '#c8c0d4'); R(g, 3, 5, 1, 3, '#c8c0d4'); R(g, 8, 5, 1, 3, '#c8c0d4'); disc(g, 6, 9, 2.5, '#f06a8c'); P(g, 5, 8, '#1d1626'); P(g, 7, 8, '#1d1626'); });
      icon('stick', g => { line(g, 1, 11, 11, 1, '#c9a070'); R(g, 3, 7, 3, 3, '#b86a3a'); R(g, 5, 5, 3, 3, '#d9903a'); R(g, 7, 3, 3, 3, '#b86a3a'); P(g, 6, 6, '#5aa85a'); });
    }
  });
})();
