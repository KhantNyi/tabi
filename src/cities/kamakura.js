'use strict';
// ---------- Kamakura: an old capital by the sea, an hour from Tokyo. Three stops on the little Enoden line ----------
// The town climbs from the station along Komachi-dori to Tsurugaoka Hachimangu, whose hall stands at the top of a long
// stair above two ponds. At Hase, the Great Buddha sits in the open air (you can go inside him), and Hasedera climbs a
// hillside of hydrangeas to a view of the bay. By the sea, the Enoden rattles over a level crossing right above the
// beach: the gates come down, the bells ring, and for a moment the train, the crossing and the sea are one picture.
// Surfers wait on the swell, and the kites overhead are waiting for you to unwrap your lunch.
(function () {
  const LINE = [['kam_town', 'KAMAKURA'], ['kam_hase', 'HASE'], ['kam_shore', 'KAMAKURAKOKOMAE']];
  const STAMPS = {
    kam_hachiman: ['HACHIMANGU', 'hgu', 'kam_town'], kam_dove: ['DOVE BISCUIT', 'dove', 'kam_town'], kam_lotus: ['GENJI POND', 'lotus', 'kam_town'], kam_rick: ['KAMAKURA RICKSHAW', 'rickshaw', 'kam_town'],
    kam_buddha: ['THE GREAT BUDDHA', 'kbud', 'kam_hase'], kam_inside: ['INSIDE THE BUDDHA', 'inside', 'kam_hase'], kam_ajisai: ['HYDRANGEA PATH', 'ajisai', 'kam_hase'], kam_view: ['HASEDERA VIEW', 'bay', 'kam_hase'],
    kam_crossing: ['THE CROSSING', 'enoden', 'kam_shore'], kam_surf: ['CAUGHT A WAVE', 'surf', 'kam_shore'], kam_kite: ['ROBBED BY A KITE', 'kite', 'kam_shore']
  };
  const rnd = Math.random;

  // ---------- Kamakura: Komachi-dori and Tsurugaoka Hachimangu ----------
  MAPS.kam_town = { name: 'KAMAKURA', sub: 'THE OLD CAPITAL BY THE SEA', tw: 48, th: 42, music: 'kamakura',
    zones: [[440, 40, 680, 230, 'HACHIMANGU', 'THE SHRINE OF THE WARRIOR GODS'], [380, 230, 768, 400, 'GENJI AND HEIKE PONDS', 'WHITE LOTUS AND RED LOTUS'], [480, 400, 640, 672, 'DANKAZURA', 'A RAISED PATH UNDER CHERRY TREES'], [0, 440, 480, 530, 'KOMACHI-DORI', 'SNACKS ALL THE WAY UP'], [0, 0, 768, 672, 'KAMAKURA', 'THE OLD CAPITAL BY THE SEA']],
    lay() {
      tRect(FR, 0, 0, 48, 42); tRect(VL, 29, 4.5, 41, 13); tRect(GR, 24, 13, 47, 24.5);
      tOval(WA, 27.5, 20.5, 3.6, 2.6); tOval(WA, 42.5, 20.5, 3.6, 2.6); tRect(WA, 26, 22.8, 46, 24.3);
      tRect(VL, 33.5, 13, 36.5, 22.8); tRect(VL, 31, 15.5, 39, 19.5); tRect(GR, 31, 24.3, 39, 42); tRect(DT, 34.25, 24.3, 35.75, 42);
      tRect(PL, 0, 25, 24, 29.5); tRect(PV, 0, 29.5, 34.25, 32.5); tRect(PV, 0, 32.5, 31, 42); tRect(PV, 0, 40, 48, 42);
    },
    deco() {
      const g = M.ground.g;
      roofs(0, 400, 384, 436);
      // the upper terrace: the stair, the hall, the old ginkgo
      ledge([[384, 206], [560, 206], [736, 208]], 18, 'stone'); steps(560, 206, 32, 22, '#c8c0b4');
      put(SPR.hongu, 560, 150, 88, 90); block(482, 110, 638, 150); for (const x of [500, 620]) prop('lantern', x, 192, 4);
      stampSpot('kam_hachiman', 560, 166, 'PRAY', 'bow', ['TWO BOWS, TWO CLAPS, ONE BOW. THE SOUND ECHOES OFF THE RED HALL.', 'THE SHOGUNS PRAYED HERE FOR VICTORY. YOU PRAY FOR GOOD WEATHER AT THE BEACH.']);
      plant('ginkgo', 626, 238, 1); plant('ginkgo', 494, 236, 1); npc('monk', 470, 160, { rad: 20, lines: ['A GREAT GINKGO STOOD BY THE STAIR FOR A THOUSAND YEARS. A STORM TOOK IT IN 2010.', 'ITS STUMP SENT UP NEW SHOOTS. THOSE ARE THEM. WE ARE PATIENT HERE.'] });
      // the dance stage, the ponds and the drum bridge
      put(SPR.maiden, 560, 282, 35, 43); block(530, 268, 590, 282);
      for (const [cx, col] of [[440, '#f8f4ee'], [680, '#f06a8c']]) for (let k = 0; k < 16; k++) { const a = k * 2.4, r = 10 + (k * 13 % 40), x = cx + Math.cos(a) * r, y = 330 + Math.sin(a) * r * 0.55; ell(g, x, y, 5, 2.6, '#3f8a4a'); ell(g, x - 0.5, y - 0.5, 4, 2, '#5aa85a'); if (k % 3 === 0) { disc(g, x + 1, y - 1.5, 1.6, col); p1(g, x + 1, y - 2, '#ffe08a'); } }
      bridge(548, 360, 572, 394, '#c0442f', '#b8905a');
      stampSpot('kam_lotus', 424, 262, 'TAKE A PHOTO', 'snap', ['GENJI POND, WITH WHITE LOTUS, AND ACROSS THE PATH HEIKE POND, WITH RED.', 'THE TWO CLANS FOUGHT A WAR. NOW THEIR FLOWERS SHARE A GARDEN AND NOBODY MINDS.'], 16, { frame: [372, 230, 140, 140] });
      npc('kimono', 640, 260, { rad: 24, tint: '#f06a8c', lines: ['I RENTED THIS KIMONO BY THE STATION. I CANNOT RUN IN IT. I DO NOT NEED TO.'] });
      npc('granny', 520, 330, { lines: ['THE STAGE IS FOR DANCES AT THE FESTIVAL. A WEDDING USED IT THIS MORNING.', 'THE BRIDE WORE WHITE, AND THE PIGEONS ALL CAME TO WATCH.'] });
      // the raised path under the cherry trees, and the great torii at its foot
      for (let y = 412; y < 600; y += 30) { plant('sakura', 522, y, 1); plant('sakura', 598, y + 14, 1); }
      put(SPR.bigtorii, 560, 620, 48, 79); block(522, 614, 532, 620); block(588, 614, 598, 620);
      // Komachi-dori
      const SH = [[40, 'CREPES', '#f06a8c'], [104, 'DOVES', '#f2c14e'], [168, 'SENBEI', '#c89a6a'], [232, 'MATCHA', '#5a8a5a'], [296, 'SHIRASU', '#3f7ab0']];
      for (const [x, s, c] of SH) house(x, 470, 58, 28, { sign: s, noren: c, rh: 14, lantern: x % 128 === 40 ? true : null }); DAY.konbini(364, 470, 'kamakura'); DAY.hotel(431, 470, 'kamakura', 46);
      const d = npc('granny', 104, 486, { tint: '#f2c14e', lines: ['DOVE BISCUITS! THE DOVE IS THE SHRINE\'S MESSENGER!'] }); d.spot = { label: 'BUY A DOVE BISCUIT', stamp: 'kam_dove', act: 'hold', fx: 'munch', lines: ['A BUTTERY BISCUIT SHAPED LIKE A DOVE, IN A YELLOW TIN.', 'YOU EAT THE HEAD FIRST. EVERYONE DOES. NOBODY KNOWS WHY.'] };
      npc('chef', 296, 486, { lines: ['SHIRASU: TINY WHITEBAIT, CAUGHT THIS MORNING OFF THE BEACH.', 'ON RICE, ON TOAST, IN ICE CREAM. YES, ICE CREAM.'] }); npc('teen', 40, 492, { tint: '#f06a8c', lines: ['THIS STREET IS JUST SNACKS FROM THE STATION TO THE SHRINE.', 'I HAVE EATEN MY WAY UP. NOW I MUST EAT MY WAY DOWN.'] });
      npc('yukata', 452, 556, { tint: '#2a3a5a', lines: ['RICKSHAW? UP TO THE TORII AND BACK. I KNOW EVERY STONE.'] });
      // the station
      station(140, 618, 'KAMAKURA'); gateway(244, 618, 'TRAINS TO OTHER CITIES');
      for (const x of [330, 400]) prop('vend', x, 612, 6); prop('bench', 60, 570, 9); prop('lamp', 300, 560, 2); prop('lamp', 20, 560, 2);
      npc('salary', 210, 560, { lines: ['THE BLUE TRAIN GOES TO TOKYO. THE LITTLE GREEN ONE GOES TO THE SEA.', 'I TAKE THE BLUE ONE. I DREAM ABOUT THE GREEN ONE.'] }); npc('kid', 380, 548, { rad: 24, lines: ['THERE IS A GIANT BUDDHA TWO STOPS AWAY. HE IS AS TALL AS OUR HOUSE.', 'TALLER. HE IS SITTING DOWN AND STILL TALLER.'] });
      M.ACT.push({ cat: true, x: 340, y: 270, k: 0 }); M.ACT.push({ cat: true, id: 'shop', x: 20, y: 506, k: 2 });
      crowd(6, 20, 500, 540, 500, 10); crowd(4, 560, 640, 560, 420, 4); crowd(3, 540, 230, 580, 230, 20); crowd(4, 20, 580, 460, 580, 10);
      bottomRow(43); wild(['green', 'pine', 'green2', 'sakura'], 2); M.LIGHTS = [];
    } };

  // ---------- Hase: the Great Buddha and Hasedera ----------
  // the bay from Hasedera's terrace, painted as a postcard
  function bayPhoto(g, w, h) { const r = RNG(23); dgrad(g, 0, 0, w, h * 0.45, ['#7ab8e8', '#a8d4f0', '#e4eef4']); mountain(g, w * 0.86, h * 0.45, w * 0.22, h * 0.16, '#8a9ac8', r, '#f8f4ee');
    dgrad(g, 0, h * 0.45, w, h * 0.3, ['#3e8aa8', '#68b2b4']); for (let k = 0; k < 18; k++) R(g, r() * w, h * 0.47 + r() * h * 0.25, 4 + r() * 8, U, 'rgba(255,255,255,0.5)');
    for (let x = 0; x < w; x += 2) { const y = h * 0.72 + Math.sin(x / w * 3.1) * h * 0.06; R(g, x, y, 2, 2, '#c8b89a'); R(g, x, y - 1, 2, 1, '#ffffff'); }
    for (let x = -4; x < w; x += 7) { const y = h * 0.8 + r() * 4, c = ['#e8e0d0', '#b8a898', '#8a94b0'][r() * 3 | 0]; R(g, x, y, 6, 4, c); R(g, x - 0.5, y - 1.5, 7, 1.5, dark(c, 0.45)); }
    for (let k = 0; k < 30; k++) { const x = r() * w, y = h - 2 - r() * 10, c = ['#5a7ad0', '#a8c0f0', '#c890d8', '#f0a8c8'][k % 4]; disc(g, x, y, 3 + r() * 2, dark(c, 0.3)); disc(g, x - 0.5, y - 0.5, 2.5, c); } }
  MAPS.kam_hase = { name: 'HASE', sub: 'A GREAT BUDDHA AND A HILL OF FLOWERS', tw: 44, th: 38, music: 'kamakura',
    zones: [[0, 60, 350, 500, 'KOTOKU-IN', 'THE GREAT BUDDHA OF KAMAKURA'], [360, 0, 704, 500, 'HASEDERA', 'A TEMPLE ON A HILLSIDE OF HYDRANGEAS'], [0, 0, 704, 608, 'HASE', 'A GREAT BUDDHA AND A HILL OF FLOWERS']],
    lay() {
      tRect(FR, 0, 0, 44, 38); tRect(VL, 2, 5, 21, 31); tRect(PV, 0, 31, 44, 38);
      tRect(GR, 23, 19, 43, 31); tOval(WA, 31, 26.5, 3.5, 1.8); tRect(VL, 25, 8, 43, 19); tRect(GR, 24, 2, 36, 8);
      tRoad(DT, [[33, 31], [33, 27.5], [35.5, 24], [35, 21]], 0.7, GR); tRoad(DT, [[27, 7.6], [28.5, 5.5], [31, 6.4], [33.5, 4.2], [34.5, 3]], 0.6, GR);
    },
    deco() {
      const g = M.ground.g;
      // the Great Buddha, in the open air since a tsunami took his hall in 1498
      put(SPR.kbuddha, 184, 300, 65, 127); block(122, 262, 246, 300); fur('burner', 184, 352);
      stampSpot('kam_buddha', 184, 392, 'TAKE A PHOTO', 'snap', ['THIRTEEN METRES OF BRONZE, SITTING VERY STILL, EYES HALF CLOSED.', 'HIS HALL WAS WASHED AWAY FIVE HUNDRED YEARS AGO. HE STAYED. HE HAS SAT OUT EVERY STORM SINCE.'], 16, { frame: [104, 160, 160, 210] });
      door(266, 300, 'k_inside', 'GO INSIDE HIM'); prop('waraji', 300, 210, 8); M.SPOTS.push({ x: 300, y: 218, r: 13, label: 'READ', lines: ['A PAIR OF STRAW SANDALS, EACH ONE TALLER THAN YOU.', 'CHILDREN FROM A TOWN UP NORTH WEAVE A NEW PAIR FOR HIM EVERY FEW YEARS, SO HE CAN GO FOR A WALK.'] });
      for (const [x, y] of [[60, 120], [310, 120], [56, 230], [320, 330], [52, 420], [300, 440], [100, 470]]) plant(hsh(x, y) < 0.6 ? 'pine' : 'green', x, y, 1);
      npc('tourist', 150, 360, { dir: 'u', lines: ['HE IS HOLLOW, YOU KNOW. FOR TWENTY YEN YOU CAN STAND INSIDE HIS CHEST.'] }); npc('kid', 230, 400, { rad: 20, lines: ['WHY IS HE GREEN?', 'MUM SAYS HE WAS GOLD ONCE. THE RAIN TOOK THE GOLD. THE RAIN IS A THIEF.'] });
      npc('monk', 90, 300, { rad: 16, lines: ['HE HAS SAT HERE SINCE 1252. THE HALL AROUND HIM DID NOT LAST. HE DID.'] });
      // Hasedera: the gate, the pond and the little stone Jizo, then the stair to the hall
      put(SPR.hgate, 528, 498, 34, 46); block(496, 492, 506, 498); block(550, 492, 560, 498);
      for (let r = 0; r < 3; r++) for (let x = 392; x < 452; x += 8) { const s = SPR.kjizo; put(s, x + (r % 2) * 4, 360 + r * 12, s.lw / 2, s.lh - 1); } block(388, 350, 458, 386); M.SPOTS.push({ x: 424, y: 394, r: 14, label: 'LOOK', lines: ['HUNDREDS OF LITTLE STONE JIZO IN RED BIBS AND KNITTED HATS.', 'JIZO LOOKS AFTER CHILDREN AND TRAVELLERS. SOMEBODY KNITS THEM NEW HATS EVERY WINTER.'] });
      ledge([[368, 300], [528, 298], [704, 302]], 20, 'stone'); steps(560, 298, 32, 24);
      put(SPR.kannon, 560, 210, 80, 82); block(488, 176, 632, 210);
      M.SPOTS.push({ x: 560, y: 224, r: 15, label: 'LOOK', lines: ['INSIDE, A KANNON NINE METRES TALL, CARVED FROM ONE CAMPHOR TREE, GLOWS GOLD IN THE DARK.', 'THE LEGEND SAYS SHE WAS SET ADRIFT AT SEA AND WASHED UP HERE, ON THIS VERY SHORE.'] });
      for (const x of [430, 470]) prop('lantern', x, 270, 4); prop('bench', 600, 268, 9);
      // the lookout over the bay
      for (let x = 640; x < 700; x += 6) { R(g, x, 196, 2, 12, '#8a6448'); } R(g, 640, 198, 60, 2, '#a8805a'); R(g, 640, 198, 60, U, '#c8a070'); block(640, 190, 704, 206);
      stampSpot('kam_view', 664, 222, 'LOOK OUT', 'snap', ['THE WHOLE BAY BELOW: THE BEACH CURVING AWAY, THE ROOFS OF THE TOWN, SURFERS LIKE SPECKS.', 'ON A CLEAR DAY FUJI STANDS AT THE FAR END OF THE WATER. TODAY IS A CLEAR DAY.'], 16, { photo: bayPhoto });
      // the hydrangea path, above the terrace
      ledge([[384, 126], [480, 126], [576, 128]], 14, 'earth'); steps(432, 126, 24, 16, '#b89868');
      const AJ = SPR.ajisai; for (let y = 44; y < 122; y += 9) for (let x = 392 + (y % 18 ? 0 : 7); x < 570; x += 13) { if (terr(x, y) !== GR || terr(x, y + 4) !== GR || terr(x + 8, y) !== GR || terr(x - 8, y) !== GR || hit(x, y)) continue; const s = AJ[(x * 3 + y) % AJ.length]; put(s, x, y, s.lw / 2, s.lh - 1); block(x - 5, y - 3, x + 5, y); }
      stampSpot('kam_ajisai', 512, 92, 'TAKE A PHOTO', 'snap', ['A WHOLE HILLSIDE OF HYDRANGEAS, BLUE AND PURPLE AND PINK, ALL THE WAY UP.', 'THE COLOUR DEPENDS ON THE SOIL. NOBODY HAS TOLD THE PINK ONES THEY ARE IN THE WRONG PLACE.'], 15);
      npc('office', 472, 60, { rad: 16, tint: '#5a7ad0', lines: ['IN JUNE THE QUEUE FOR THIS PATH IS AN HOUR LONG.', 'IT IS WORTH IT. DO NOT TELL THE QUEUE.'] });
      // the street and Hase station
      station(110, 560, 'HASE'); for (const x of [260, 330, 640]) prop('stall', x, 598, 12); npc('granny', 330, 584, { dir: 'd', lines: ['DAIBUTSU SENBEI! RICE CRACKERS AS BIG AS YOUR FACE!'] }); npc('chef', 640, 584, { dir: 'd', lines: ['SWEET POTATO SOFT SERVE. PURPLE, LIKE THE HYDRANGEAS.'] });
      prop('vend', 410, 536, 6); prop('bench', 450, 540, 9); npc('teen', 440, 520, { rad: 30, tint: '#5aa8e0', lines: ['THE ENODEN RUNS ALONG THE SEA AFTER THIS STOP. SIT ON THE LEFT.'] }); M.ACT.push({ cat: true, x: 640, y: 400, k: 1 });
      crowd(5, 20, 520, 690, 520, 8); crowd(3, 184, 500, 184, 420, 20); crowd(3, 528, 520, 560, 320, 6);
      bottomRow(29); wild(['green', 'pine', 'green2', 'maple'], 2); M.LIGHTS = [];
    } };
  MAPS.k_inside = { indoor: 1, name: 'INSIDE THE GREAT BUDDHA', music: 'kamakura', deco() {
    room({ wall: '#4a6a5e', floor: 'tile', t1: '#5a5a62', t2: '#4a4a52', mat: '#5a8a7a', art: (g, r) => {
      for (let y = 4; y < 48; y += 8) for (let x = 8; x < 312; x += 20) { R(g, x + (y % 16 ? 10 : 0), y, 1, 8, '#2f4a40'); for (let k = 2; k < 18; k += 4) p1(g, x + k + (y % 16 ? 10 : 0), y + 1, '#7a9a8a'); } for (let x = 8; x < 312; x += 1) if (r() < 0.05) R(g, x, 4 + r() * 40, U, 3 + r() * 8, '#3a5a4e');
      for (const x of [110, 210]) { R(g, x - 10, 8, 20, 14, '#1d2a24'); dgrad(g, x - 9, 9, 18, 12, ['#fff4c8', '#f8e0a0']); R(g, x - 9, 9, 18, 1, '#ffffff'); }
      ell(g, 160, 120, 60, 40, 'rgba(255,240,190,0.08)'); } });
    M.LIGHTS = [[110, 30, 40, '#fff0c0'], [210, 30, 40, '#fff0c0']];
    M.SPOTS.push({ x: 160, y: 120, r: 16, label: 'LOOK UP', stamp: 'kam_inside', act: 'snap', lines: ['YOU ARE STANDING INSIDE HIS CHEST. THE BRONZE WALLS ARE PATCHED AND RIVETED LIKE AN OLD SHIP.', 'LIGHT COMES IN THROUGH TWO WINDOWS IN HIS BACK. IT IS COOL, AND VERY QUIET.'] });
    npc('tourist', 100, 140, { dir: 'u', lines: ['THEY CAST HIM IN THIRTY PIECES AND JOINED THEM. YOU CAN SEE THE SEAMS.'] }); npc('granny', 220, 150, { dir: 'u', lines: ['I CAME IN HERE AS A GIRL. HE HAS NOT CHANGED A BIT. I HAVE.'] });
  } };

  // ---------- by the sea: the crossing, the beach and the surf ----------
  let ENO = null;
  const kiteSteal = () => { G.state = 'event'; G.ev = { sp: { act: 'kite', stamp: 'kam_kite', fx: 'munch', lines: ['A KITE DROPS OUT OF THE SKY AND TAKES THE BUN RIGHT OUT OF YOUR HAND. YOU FEEL THE WIND OF ITS WINGS.', 'THE SIGNS ON THE BEACH DID WARN YOU. THEY HAVE A PICTURE OF A BIRD ON THEM AND EVERYTHING.'] }, t: 0 }; pl.mv = false; pl.dir = 'd';
    const k = { temp: 1, x: pl.x, y: pl.y + 1, sayT: 0, t: 0, always: 1, upd(e, dt) { e.t += dt; if (e.t > 0.95 && !e.got) { e.got = 1; PLACES.SND.swish(); say(pl, 'HEY!'); } if (e.t > 3) e.dead = 1; },
      draw(e, x, y) { const t = e.t, px = x, py = y - 20; let bx, by, hold = t > 0.95; if (t < 0.95) { const q = t / 0.95; bx = px + 120 * (1 - q) * (1 - q); by = py - 110 * (1 - q) + Math.sin(q * 3) * 4; } else { const q = (t - 0.95) / 1.6; bx = px - q * 150; by = py - q * q * 120 - q * 30; }
        if (!hold && t > 0.2) { R(ctx, px + 3, py + 6, 5, 3, '#e8c890'); R(ctx, px + 3, py + 6, 5, 1, '#f8e0b0'); }
        const f = Math.sin(t * (hold ? 18 : 6)) * 4; ctx.globalAlpha = 0.3; ell(ctx, bx, y + 2, 7, 1.5, '#1d1626'); ctx.globalAlpha = 1; drawKite(bx, by, f, 1.4); if (hold) { R(ctx, bx - 2, by + 3, 5, 3, '#e8c890'); } } }; M.ACT.push(k); };
  function drawKite(x, y, f, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); line1(ctx, -9, -f, -3, 0, '#5a4030'); line1(ctx, 9, -f, 3, 0, '#5a4030'); line1(ctx, -9, -f + 0.5, -3, 0.5, '#7a5a40'); line1(ctx, 9, -f + 0.5, 3, 0.5, '#7a5a40'); ell(ctx, 0, 0, 3.5, 1.6, '#6a4a34'); R(ctx, -1, 1, 2, 2.5, '#4a3424'); R(ctx, -0.5, 3, 1, 1, '#8a6a4a'); disc(ctx, 0, -1.4, 1.2, '#7a5a40'); ctx.restore(); }
  MAPS.kam_shore = { name: 'SHICHIRIGAHAMA', sub: 'THE CROSSING ABOVE THE SEA', tw: 50, th: 36, music: 'kamakura', sea: 'ocean', sand: 'grey', lookUp: [200, 330],
    zones: [[360, 380, 440, 440, 'THE CROSSING', 'WAIT FOR THE GREEN TRAIN'], [0, 0, 800, 300, 'SHICHIRIGAHAMA BEACH', 'SURF, SAND AND KITES'], [0, 0, 800, 576, 'KAMAKURAKOKOMAE', 'THE CROSSING ABOVE THE SEA']],
    lay() { tRect(WA, 0, 0, 50, 13); tRect(DT, 0, 13, 50, 18.75); tOval(WA, 10, 13, 6, 1.1); tOval(WA, 33, 13.1, 8, 1.4); tOval(DT, 22, 12.9, 5, 0.9); tOval(DT, 46, 12.8, 4, 0.8);
      tRect(PV, 0, 18.75, 50, 19.5); tRect(AS, 0, 19.5, 50, 22.5); tRect(PV, 0, 22.5, 50, 25); tRect(VL, 0, 25, 50, 27); tRect(PV, 24, 25, 26.5, 27); tRect(PV, 0, 27, 50, 36); },
    deco() {
      const g = M.ground.g, r = RNG(5);
      // the horizon: Fuji far off on the left, Enoshima and its lighthouse, sails
      dgrad(g, 0, 0, 800, 40, ['#8ac4ec', '#b4dcf2', '#e8f2f4']); mountain(g, 120, 40, 54, 24, '#8a9ac8', r, '#f8f4ee'); for (let x = -20; x < 820; x += 30) ell(g, x + r() * 10, 40, 22, 3, '#9ab4c8');
      ell(g, 236, 40, 26, 9, '#4f7a5a'); ell(g, 230, 37, 16, 7, '#5a8a5a'); R(g, 238, 22, 3, 12, '#e8e4dc'); R(g, 236, 20, 7, 3, '#c8c4bc'); R(g, 262, 39, 40, 1.5, '#8a8496'); R(g, 0, 40, 800, 1, '#ffffff'); block(0, 0, 800, 48);
      for (const [x, y] of [[420, 60], [600, 52], [700, 70]]) { R(g, x, y - 8, 1, 9, '#f4f1e6'); for (let k = 0; k < 7; k++) R(g, x + 1, y - 8 + k, 6 - k * 0.8, 1, '#ffffff'); R(g, x - 3, y + 1, 10, 1.5, '#3a3a4e'); }
      // surfers waiting on the swell
      for (const [x, y] of [[90, 150], [140, 120], [340, 160], [480, 140], [520, 170], [720, 130]]) PLACES.bobber(SPR.surfer, x, y, { a: 1.4, f: 1.2 });
      PLACES.shore(150, 260, { period: 7, reach: 10 });
      // the beach: a hut selling shirasu buns, and a sign about the kites
      put(SPR.beachhut, 560, 268, 34, 33); block(530, 256, 590, 268); M.SPOTS.push({ x: 560, y: 278, r: 14, label: 'BUY A SHIRASU BUN', stamp: 'kam_kite', fn: () => kiteSteal() }); npc('chef', 600, 268, { dir: 'l', lines: ['SHIRASU BUNS! EAT THEM UNDER THE ROOF, OR THE KITES WILL!'] });
      signpost(486, 268, ['BEWARE OF KITES! (A PICTURE OF A BIRD STEALING A SANDWICH.)', 'THEY ARE CLEVER, AND QUICK, AND THEY HAVE NO MANNERS AT ALL.']);
      for (const [x, y, c] of [[120, 250, '#f06a8c'], [300, 240, '#5aa8e0'], [680, 252, '#f2c14e']]) { put(SPR['brolly' + (c === '#f06a8c' ? 0 : c === '#5aa8e0' ? 1 : 2)], x, y, 15, 27); block(x - 2, y - 3, x + 2, y); }
      put(SPR.boards, 220, 266, 15, 25); block(206, 258, 234, 266); const coach = npc('teen', 248, 264, { tint: '#2a6a8a', dir: 'l', lines: ['WANT TO TRY? I WILL PUSH YOU INTO YOUR FIRST WAVE.'] }); coach.spot = { label: 'TRY SURFING', mini: 'surf', stamp: 'kam_surf' };
      npc('tourist', 380, 250, { rad: 30, lines: ['THE SAND HERE IS GREY. IT IS VOLCANIC. FROM FUJI, MAYBE.', 'IT GETS VERY HOT. RUN.'] }); npc('kid', 160, 236, { rad: 20, tint: '#f2c14e', lines: ['I AM DIGGING TO AMERICA. I AM NEARLY THERE.'] });
      // the sea wall and the coast road, with gaps and steps down to the sand
      for (const [a, b] of [[0, 150], [186, 560], [596, 800]]) wallH(a, b, 304, '#c8c0b0', '#8a8496');
      for (const x of [150, 560]) for (let k = 0; k < 4; k++) { R(g, x, 300 - k * 3, 36, 3, k % 2 ? '#b8b0a4' : '#c8c0b4'); R(g, x, 300 - k * 3, 36, U, '#e0d8cc'); }
      for (let x = 8; x < 800; x += 14) R(g, x, 335.5, 7, 1, '#e8e4f0'); zebra(g, 384, 313, 40, 46); cars(326, 1, 3); cars(348, -1, 3);
      // the Enoden: the track, the crossing and the little station
      for (const y of [410, 422]) { R(g, 0, y, 800, 1.5, '#8a8496'); R(g, 0, y, 800, U, '#d8d4e0'); } for (let x = 2; x < 800; x += 6) R(g, x, 408, 3, 17, 'rgba(90,70,60,0.35)');
      block(0, 404, 384, 428); block(424, 404, 800, 428);
      ENO = PLACES.passer({ y: 416, cars: [SPR.enoden, SPR.enoden], period: 20, speed: 72, dir: 0, cross: [404] });
      R(g, 600, 432, 170, 14, '#c8c0b4'); R(g, 600, 432, 170, 1.5, '#f2c14e'); R(g, 600, 445, 170, 1, '#8a8496'); put(SPR.shelter, 690, 446, 24, 30); block(668, 438, 712, 446);
      M.SPOTS.push({ x: 640, y: 452, r: 16, label: 'TRAINS', train: 1 }); /* an open-air halt: straight onto the line */ M.st = [640, 466];
      stampSpot('kam_crossing', 404, 474, 'TAKE A PHOTO', 'snap', ['THE BELLS RING, THE BARS COME DOWN, AND THE GREEN TRAIN RATTLES ACROSS WITH THE SEA RIGHT BEHIND IT.', 'PEOPLE COME FROM ALL OVER THE WORLD FOR THIS ONE CROSSING. NOW YOU KNOW WHY.'], 15, { frame: [300, 230, 210, 230], need: 'train' });
      // the town up the slope
      for (const [x, s, c] of [[90, 'CAFE', '#8a5a3a'], [200, 'SURF SHOP', '#2a6a8a'], [300, 'BAKERY', '#e08a3a']]) house(x, 500, 64, 28, { sign: s, noren: c, rh: 14 });
      for (const [x, s, c] of [[520, 'GIFTS', '#5a8a5a'], [600, 'RAMEN', '#c8382e']]) house(x, 500, 56, 28, { sign: s, noren: c, rh: 14 });
      for (const x of [700, 760]) prop('vend', x, 496, 6); prop('bench', 460, 470, 9); prop('lamp', 450, 440, 2);
      npc('salary', 360, 470, { lines: ['THE TRAIN COMES EVERY FEW MINUTES. STAND HERE AND WAIT FOR IT.', 'THE PHOTO IS ONLY RIGHT WHEN THE TRAIN IS IN IT.'] }); npc('granny', 700, 540, { rad: 20, lines: ['I HAVE LIVED BY THIS CROSSING ALL MY LIFE. NOW THERE IS A QUEUE TO STAND ON IT.'] });
      M.ACT.push({ cat: true, x: 760, y: 470, k: 0 }); crowd(5, 20, 380, 780, 380, 6); crowd(4, 20, 560, 780, 560, 6); crowd(4, 30, 220, 780, 222, 20);
      bottomRow(31); M.LIGHTS = [];
    },
    // two kites wheel high over the beach, all day
    over(cx, cy) { const T = worldTime(); for (let k = 0; k < 3; k++) { const a = T * (0.25 + k * 0.07) + k * 2, x = 200 + k * 230 + Math.cos(a) * 60 - cx * 0.6, y = 70 + k * 20 + Math.sin(a) * 26 - cy * 0.6; if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue; drawKite(x, y, Math.sin(T * 2 + k) * 1.2, 1); } }
  };

  // ---------- surfing: paddle into a wave, stand up in time, then stay in the pocket ----------
  const SURF = {
    init(m) { m.ph = 'wait'; m.wx = -20; m.pad = 0; m.tries = 3; m.rt = 0; m.y = 0.5; m.zone = 0.5; m.bal = 1; m.msg = ''; m.mt = 0; m.sp = m.sp || {}; m.fx = []; m.done = 0; m.pt = 0; },
    update(m, dt) {
      for (const p of m.fx) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 60 * dt; } m.fx = m.fx.filter(p => p.t < 0.7); if (m.mt > 0) m.mt -= dt;
      if (m.done) { if (m.t > m.done + 1.4) endMini(true, ['YOU RIDE IT ALL THE WAY IN, STANDING, AND STEP OFF INTO THE SHALLOWS LIKE YOU MEANT TO.', 'THE COACH IS CLAPPING. SO ARE TWO STRANGERS AND A DOG.']); return; }
      const fail = (s) => { m.tries--; m.msg = s; m.mt = 1.6; m.ph = 'wait'; m.wx = -40; m.pad = 0; Snd.fx('land'); PLACES.SND.wave(1); if (m.tries <= 0) endMini(false, ['THE SEA WINS THIS TIME. IT USUALLY DOES.', 'THE COACH WRINGS OUT YOUR T-SHIRT AND SAYS EVERYONE FALLS. TRY AGAIN.']); };
      if (m.ph === 'wait') { m.wx += 30 * dt; m.pad = Math.max(0, m.pad - dt * 0.45); if (KP.a) { m.pad = Math.min(1, m.pad + 0.17); PLACES.SND.blow(); for (let k = 0; k < 2; k++) m.fx.push({ x: 196 + (rnd() - 0.5) * 8, y: 78, vx: (rnd() - 0.5) * 30, vy: -30, t: 0 }); }
        if (m.wx > 178 && m.pad > 0.5) { m.ph = 'pop'; m.pt = 0; } else if (m.wx > 214) fail('TOO SLOW! PADDLE HARDER WHEN IT COMES.'); }
      else if (m.ph === 'pop') { m.pt += dt; m.wx += 30 * dt; if (KP.a) { m.ph = 'ride'; m.rt = 0; m.bal = 1; m.y = 0.5; Snd.fx('jump'); } else if (m.pt > 0.9) fail('TOO LATE TO STAND UP!'); }
      else if (m.ph === 'ride') { m.rt += dt; m.zone = 0.5 + Math.sin(m.rt * 1.2) * 0.28 + Math.sin(m.rt * 2.7 + 1) * 0.1;
        const up = K.u || (JOY.on && JOY.y < -0.3), dn = K.d || (JOY.on && JOY.y > 0.3); if (up) m.y -= dt * 0.75; if (dn) m.y += dt * 0.75; m.y = Math.max(0.05, Math.min(0.95, m.y));
        const off = Math.abs(m.y - m.zone); if (off > 0.15) m.bal -= dt * (0.5 + off * 2.4); else m.bal = Math.min(1, m.bal + dt * 0.25);
        if (rnd() < dt * 30) m.fx.push({ x: 184 - 6, y: 54 + m.y * 46, vx: -40 - rnd() * 30, vy: -20 - rnd() * 20, t: 0 });
        if (Math.floor(m.rt * 2) !== Math.floor((m.rt - dt) * 2)) PLACES.SND.blow();
        if (m.bal <= 0) fail('WIPEOUT!'); else if (m.rt > 7) { m.done = m.t; Snd.fx('yay'); } }
    },
    draw(m) {
      txtC(ctx, 'SURFING', 160, 26, '#2a6a8a', null, 2); const X0 = 54, X1 = 266, Y0 = 38, Y1 = 122; ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, X1 - X0, Y1 - Y0); ctx.clip();
      dgrad(ctx, X0, Y0, X1 - X0, 30, ['#8ac4ec', '#d8eef6']); R(ctx, X0, Y0 + 28, X1 - X0, 1, '#ffffff');
      const F = pl.F;
      if (m.ph === 'ride') { // the face of the wave, the curl chasing from the left, the pocket to stay in
        dgrad(ctx, X0, Y0 + 14, X1 - X0, Y1 - Y0 - 14, ['#2a7aa0', '#5ab4c8', '#3a8ab0']);
        for (let x = X0; x < X1; x += 2) { const top = Y0 + 16 + Math.sin(x / 20 + m.rt * 3) * 1.5; R(ctx, x, top, 2, 2, '#ffffff'); if ((x + (m.rt * 60 | 0)) % 12 < 4) R(ctx, x, top + 3, 2, 1, '#bfe8f0'); }
        for (let k = 0; k < 10; k++) { const yy = Y0 + 24 + k * 9, o = (m.rt * (40 + k * 6)) % 30; for (let x = X0 - o; x < X1; x += 30) R(ctx, x, yy, 12, U, 'rgba(255,255,255,0.35)'); }
        const cx = X0 + 22 + Math.sin(m.rt * 2) * 3; for (let k = 0; k < 18; k++) { const a = k / 18 * 5, r = 22 - k; disc(ctx, cx + Math.cos(a) * r * 0.6, Y0 + 40 + Math.sin(a) * r, 3, k % 2 ? '#ffffff' : '#d8f4f8'); }
        const zy = Y0 + 16 + m.zone * 46; ctx.globalAlpha = 0.18 + Math.sin(G.t * 6) * 0.05; R(ctx, X0 + 60, zy - 8, X1 - X0 - 60, 16, '#5ad88a'); ctx.globalAlpha = 1;
        const sy = Y0 + 16 + m.y * 46, sx = 184, tilt = (m.zone - m.y) * 0.8; ctx.save(); ctx.translate(sx, sy); ctx.rotate(tilt * 0.5); ell(ctx, 0, 2, 13, 2.4, '#f4f1e6'); ell(ctx, 0, 1.4, 12, 1.4, '#f2c14e'); R(ctx, -12, 2, 24, U, '#2a6a8a'); ctx.drawImage(F.s.idle0[0], -10, -26); ctx.restore();
      } else { // the swell coming in, with you lying on your board
        const sea = x => Y0 + 64 - 22 * Math.exp(-Math.pow((x - m.wx) / 26, 2)); dgrad(ctx, X0, Y0 + 29, X1 - X0, Y1 - Y0 - 29, ['#3e8aa8', '#2c6a96']);
        for (let x = X0; x < X1; x += 2) { const y = sea(x); R(ctx, x, y, 2, Y1 - y, '#3a8ab0'); R(ctx, x, y, 2, 1.5, '#8ad0e0'); if (sea(x - 2) - y > 0.6) R(ctx, x, y - 1, 2, 2, '#ffffff'); }
        for (let k = 0; k < 6; k++) R(ctx, X0 + ((k * 47 + G.t * 12) % (X1 - X0)), Y0 + 34 + k * 3, 10, U, 'rgba(255,255,255,0.4)');
        const by = sea(196), bob = Math.sin(G.t * 2) * 0.5; ctx.save(); ctx.translate(196, by + bob); ctx.rotate(Math.atan2(sea(204) - sea(188), 16)); ell(ctx, 0, 0, 13, 2.4, '#f4f1e6'); ell(ctx, 0, -0.6, 12, 1.4, '#f2c14e'); ctx.save(); ctx.rotate(-1.5708); ctx.drawImage(F.d[0], -13, -10, 20, 27); ctx.restore();
        const arm = Math.sin(G.t * (m.pad > 0.2 ? 14 : 3)) * 3; R(ctx, -2 + arm, 1, 4, 1.5, F === pl.F ? '#f1c9a0' : '#f1c9a0'); ctx.restore();
        if (m.ph === 'pop' && G.t % 0.4 < 0.25) txtC(ctx, 'STAND UP! (E)', 196, by - 22, '#c8382e', '#fff8e8');
        R(ctx, 70, 114, 60, 4, '#1d1626'); R(ctx, 71, 115, 58 * m.pad, 2, m.pad > 0.5 ? '#5ad88a' : '#f2c14e'); txt(ctx, 'PADDLE', 70, 107, '#fff8e8', '#1d1626');
      }
      for (const p of m.fx) { ctx.globalAlpha = 1 - p.t / 0.7; R(ctx, p.x, p.y, 1.5, 1.5, '#ffffff'); } ctx.globalAlpha = 1; ctx.restore();
      for (let k = 0; k < 3; k++) { const x = 230 + k * 10; ell(ctx, x, 26, 4, 1.4, k < m.tries ? '#f2c14e' : '#d9cba8'); }
      if (m.ph === 'ride') { R(ctx, 70, 126, 80, 3, '#d9cba8'); R(ctx, 70, 126, 80 * m.bal, 3, m.bal < 0.35 ? '#c8382e' : '#5ad88a'); R(ctx, 170, 126, 80, 3, '#d9cba8'); R(ctx, 170, 126, 80 * Math.min(1, m.rt / 7), 3, '#3f7ab0'); txt(ctx, 'BALANCE', 70, 131, '#8a7a6a'); txt(ctx, 'RIDE', 170, 131, '#8a7a6a'); }
      else txtC(ctx, m.mt > 0 ? m.msg : m.ph === 'pop' ? 'NOW! STAND UP!' : TOUCH ? 'TAP E FAST TO PADDLE AS THE WAVE COMES' : 'TAP E FAST TO PADDLE AS THE WAVE COMES', 160, 130, '#3a2e40');
      if (m.ph === 'ride' && m.mt <= 0) txtC(ctx, m.done ? 'YOU ARE SURFING!' : 'UP AND DOWN: STAY IN THE GREEN', 160, 138, '#3a2e40');
    }
  };

  // a rickshaw from the station, up the raised path and back down Komachi-dori
  RIDES.TOURS.kam_town = { kind: 'rick', stamp: 'kam_rick', at: [440, 560], speed: 44, look: ['yukata', '#2a3a5a'],
    route: [[480, 560], [560, 560, 'THE DANKAZURA! THE SHOGUN RAISED THIS PATH SO HIS WIFE COULD WALK TO THE SHRINE WITH DRY FEET.'], [560, 440, 'EVERY ONE OF THESE CHERRY TREES BLOOMS AT ONCE IN APRIL. LIKE RIDING THROUGH A PINK CLOUD.'], [560, 404, 'THE RED BRIDGE. WE TURN HERE. THE SHRINE IS UP THOSE STAIRS, AND MY LEGS ARE NOT.'], [560, 640, 'THE GREAT TORII. THE SEA IS STRAIGHT AHEAD, TWO KILOMETRES THAT WAY.'], [470, 650], [300, 590], [60, 590, 'KAMAKURA STATION! BLUE TRAINS TO TOKYO, LITTLE GREEN ONES TO THE SEA.'], [40, 500], [300, 496, 'KOMACHI-DORI. IF YOU SMELL SOMETHING, IT IS THE SENBEI.'], [440, 500], [440, 560, 'HERE WE ARE! COME BACK IN APRIL FOR THE BLOSSOM.']] };
  // the crossing photo only counts with a train in it
  const crossShot = MAPS.kam_shore.deco; MAPS.kam_shore.deco = function () { crossShot(); const sp = M.SPOTS.find(s => s.stamp === 'kam_crossing'); if (sp) { const st = Object.assign({}, sp); delete sp.act; sp.fn = () => { const s = ENO && ENO.span(), ok = s && s[1] > 300 && s[0] < 520; if (!ok) { Snd.fx('talk'); dialog(['NO TRAIN YET. THE PICTURE NEEDS THE TRAIN IN IT.', 'LISTEN FOR THE BELLS AT THE CROSSING, THEN TRY AGAIN.']); return; } G.state = 'event'; G.ev = { sp: st, t: 0 }; pl.mv = false; pl.dir = 'u'; }; } };

  city({
    id: 'kamakura', name: 'KAMAKURA', tagline: 'THE OLD CAPITAL BY THE SEA', start: 'kam_town', hub: 'kam_town', line: LINE, stamps: STAMPS, cats: 4, local: 'tokyo', rideSpr: 'rideSea', gate: ['JR LINE', 'THE BLUE SIGN HERE'], minis: { surf: SURF },
    icons() { // the little pictures for the stamp book and the bag: painted at boot, since they show up everywhere
      icon('hgu', g => { R(g, 1, 4, 10, 6, '#d8382e'); R(g, 0, 2, 12, 2, '#2a2a3a'); R(g, 3, 5, 2, 5, '#f4ecd8'); R(g, 7, 5, 2, 5, '#f4ecd8'); R(g, 0, 10, 12, 2, '#8c8498'); });
      icon('dove', g => { ell(g, 6, 7, 4.5, 3, '#f2c14e'); disc(g, 9, 4.5, 2, '#f2c14e'); R(g, 10.5, 4.5, 1.5, 1, '#d8902a'); P(g, 9, 4, '#5a3a20'); line(g, 2, 7, 0, 4, '#d8a03a'); });
      icon('lotus', g => { for (const [x, y] of [[3, 6], [9, 6], [6, 3]]) ell(g, x, y + 2, 2.5, 3.5, '#f8f4ee'); ell(g, 6, 7, 2, 3, '#f9a8c8'); R(g, 0, 10, 12, 2, '#5aa85a'); });
      icon('kbud', g => { ell(g, 6, 9, 5, 3, '#5e8a7c'); R(g, 3, 4, 6, 6, '#5e8a7c'); disc(g, 6, 3, 2.5, '#7aa494'); P(g, 6, 0.5, '#5e8a7c'); R(g, 0, 11, 12, 1, '#8c8498'); });
      icon('inside', g => { R(g, 0, 0, 12, 12, '#3a5a4e'); for (let y = 2; y < 12; y += 3) R(g, 0, y, 12, U, '#2a443a'); R(g, 4, 2, 4, 4, '#fff0c0'); R(g, 5, 7, 2, 4, '#1d2a24'); });
      icon('ajisai', g => { for (const [x, y, c] of [[4, 4, '#5a7ad0'], [8, 4, '#9a5ad0'], [6, 7, '#e06a9a'], [3, 8, '#6a9ae0'], [9, 8, '#a8c0f0']]) disc(g, x, y, 2.4, c); R(g, 5, 10, 2, 2, '#3f8a4a'); });
      icon('bay', g => { R(g, 0, 0, 12, 5, '#8ac4ec'); R(g, 0, 5, 12, 4, '#3e8aa8'); R(g, 0, 9, 12, 3, '#c8b89a'); for (let i = 0; i < 4; i++) R(g, 8 - i * 0.5, 1 + i, i + 1, 1, i ? '#8a9ac8' : '#f8f4ee'); });
      icon('enoden', g => { R(g, 0, 3, 12, 7, '#f4ead0'); R(g, 0, 7, 12, 3, '#2f7a4a'); R(g, 2, 4, 2, 2, '#2a3a5a'); R(g, 5, 4, 2, 2, '#2a3a5a'); R(g, 8, 4, 2, 2, '#2a3a5a'); R(g, 5, 0, 3, 3, '#3a3446'); R(g, 0, 11, 12, 1, '#8a8496'); });
      icon('surf', g => { line(g, 2, 11, 10, 1, '#f2c14e'); line(g, 3, 11, 11, 1, '#f06a8c'); R(g, 0, 8, 12, 4, '#5ab4c8'); R(g, 1, 7, 4, 1, '#ffffff'); });
      icon('kite', g => { line(g, 0, 3, 6, 6, '#6a4a34'); line(g, 12, 3, 6, 6, '#6a4a34'); ell(g, 6, 6, 2.5, 1.5, '#6a4a34'); R(g, 4, 8, 4, 3, '#e8c890'); });
    },
    sprites() {
      one('hongu', 176, 92, g => templeHall(g, 88, 90, 108, 30, { wall: '#d8382e', roof: '#2a2a3a', plaster: '#f4ecd8', door: '#8a2a24', gold: 1 }));
      one('kannon', 160, 84, g => templeHall(g, 80, 82, 100, 28, { wall: '#6a4a38', roof: '#4a4a5a', plaster: '#e8dcc4', door: '#4a3028', bays: 5 }));
      one('maiden', 70, 46, g => { R(g, 2, 34, 66, 10, '#8a5a3a'); R(g, 2, 34, 66, 1.5, '#c89a6a'); R(g, 0, 43, 70, 3, '#8c8498'); for (const x of [6, 32, 60]) { R(g, x, 14, 3, 21, '#d8382e'); R(g, x, 14, 1, 21, '#f06a5a'); } roof(g, 35, 2, 18, 36, 13, '#2a2a3a'); for (let x = 8; x < 62; x += 4) R(g, x, 36, 2, 1, '#6a4028'); }, 1);
      one('bigtorii', 96, 82, g => torii(g, 48, 81, 74, 76));
      one('hgate', 68, 48, g => { R(g, 2, 44, 64, 4, '#8c8498'); for (const x of [8, 56]) { R(g, x, 16, 4, 29, '#6a4a38'); R(g, x, 16, 1.5, 29, '#8a6a50'); } R(g, 8, 20, 52, 3, '#5a3a28'); roof(g, 34, 0, 14, 36, 18, '#4a4a5a'); }, 1);
      one('waraji', 30, 34, g => { R(g, 0, 0, 30, 30, '#8a6a4a'); R(g, 0, 0, 30, 1, '#a8885a'); for (const x of [3, 16]) { ell(g, x + 5.5, 15, 5.5, 13, '#c8a860'); for (let y = 4; y < 27; y += 2) R(g, x + 1, y, 9, U, '#a88848'); R(g, x + 5, 3, 1, 24, '#8a6a3a'); } R(g, 14, 30, 2, 4, '#6a4a30'); }, 1);
      one('kjizo', 9, 14, g => { R(g, 1, 12, 7, 2, '#8c8498'); ell(g, 4.5, 9, 3.5, 3.5, '#a8a2b4'); disc(g, 4.5, 4, 3, '#b8b2c4'); R(g, 2, 7, 5, 3, '#d8382e'); R(g, 2, 7, 5, 1, '#f06a5a'); ell(g, 4.5, 1.6, 3.2, 1.6, '#d8382e'); p1(g, 3.5, 4, '#6a6478'); p1(g, 5.5, 4, '#6a6478'); }, 1);
      SPR.ajisai = [['#2a3a8a', '#5a7ad0', '#a8c0f0'], ['#5a2a7a', '#9a5ad0', '#d0a8f0'], ['#8a2a5a', '#e06a9a', '#f8b8d0'], ['#2a4a8a', '#6a9ae0', '#c8e0f8']].map((cols, i) => { const c = mk(16, 12), g = c.g, r = RNG(i * 7 + 3); ell(g, 8, 9, 7.5, 3.5, '#2f5d3a'); for (let k = 0; k < 9; k++) { const x = 3 + r() * 10, y = 3 + r() * 5; disc(g, x, y, 2.2, cols[0]); disc(g, x - 0.4, y - 0.4, 1.6, cols[1]); p1(g, x - 0.6, y - 0.8, cols[2]); } return outline(c); });
      // the Great Buddha: bronze gone green, hands resting in his lap, eyes half closed, on a stone base
      one('kbuddha', 130, 128, g => { const B = '#5e8a7c', BD = '#40685a', BL = '#7aa494', BH = '#9cc4b2';
        R(g, 4, 114, 122, 14, '#8c8498'); R(g, 4, 114, 122, 1.5, '#c8c0d4'); for (let x = 8; x < 124; x += 12) R(g, x, 116, U, 12, '#6b6478'); R(g, 12, 106, 106, 9, '#9a93a8'); R(g, 12, 106, 106, 1, '#c8c0d4');
        for (let k = 0; k < 10; k++) { const x = 20 + k * 10; ell(g, x, 106, 6, 3, BD); ell(g, x, 105, 5, 2.2, B); }
        ell(g, 65, 98, 54, 14, BD); ell(g, 65, 96, 52, 12, B); for (let k = 0; k < 6; k++) line1(g, 22 + k * 16, 92 + (k % 2) * 3, 34 + k * 16, 104, BD);
        for (let y = 46; y < 94; y++) { const hw = 21 + (y - 46) * 0.62; R(g, 65 - hw, y, hw * 2, 1, B); R(g, 65 + hw * 0.45, y, hw * 0.55, 1, BD); R(g, 65 - hw, y, 2, 1, BL); }
        for (let k = 0; k < 5; k++) { line1(g, 48 - k * 5, 52 + k * 7, 56 - k * 2, 92, BD); line1(g, 82 + k * 5, 52 + k * 7, 74 + k * 2, 92, BD); }
        line1(g, 52, 47, 65, 64, BD); line1(g, 78, 47, 65, 64, BD); R(g, 60, 48, 10, 14, BL);
        ell(g, 65, 86, 15, 6, BD); ell(g, 65, 85, 14, 5, BL); ell(g, 60, 84, 5, 3, BH); ell(g, 70, 84, 5, 3, B); R(g, 63, 81, 4, 2, BD);
        R(g, 57, 38, 16, 10, B); R(g, 57, 44, 16, 1, BD); R(g, 57, 41, 16, 1, BD);
        for (const s of [-1, 1]) { R(g, 65 + s * 16 - (s < 0 ? 3 : 0), 22, 3, 22, B); R(g, 65 + s * 16 - (s < 0 ? 3 : 0), 22, 1, 22, BD); }
        ell(g, 65, 28, 15, 18, B); ell(g, 63, 30, 12, 15, BL); for (let y = 10; y < 22; y += 2.5) for (let x = 52 + (y % 5 ? 1.2 : 0); x < 79; x += 2.5) { const dx = x - 65, dy = y - 24; if (dx * dx / 196 + dy * dy / 260 < 1) { disc(g, x, y, 1.1, BD); p1(g, x - 0.5, y - 0.5, BH); } }
        disc(g, 65, 9, 6, B); for (let k = 0; k < 8; k++) disc(g, 61 + (k % 3) * 4, 6 + (k / 3 | 0) * 3, 1, BD);
        R(g, 56, 29, 7, 1, BD); R(g, 67, 29, 7, 1, BD); R(g, 57, 30, 5, U, '#2a3a34'); R(g, 68, 30, 5, U, '#2a3a34'); disc(g, 65, 25, 0.9, BH); R(g, 64, 31, 2, 6, BD); R(g, 62, 37, 6, 1, BD); R(g, 61, 40, 8, 1, BD); R(g, 62, 40.5, 6, U, '#9cc4b2');
        for (let k = 0; k < 12; k++) { const x = 30 + (k * 37 % 70), y = 50 + (k * 23 % 40); R(g, x, y, U, 4 + k % 4, '#4a7464'); } }, 1);
      one('surfer', 24, 22, g => { ell(g, 12, 19, 11, 2, '#f4f1e6'); ell(g, 12, 18.5, 10, 1.2, '#f06a8c'); R(g, 9, 9, 6, 9, '#1d2a3a'); disc(g, 12, 7, 3, '#e0a878'); R(g, 9, 4, 6, 2.5, '#3a2a2a'); R(g, 6, 12, 3, 1.5, '#1d2a3a'); R(g, 15, 12, 3, 1.5, '#1d2a3a'); R(g, 0, 20, 24, 1, 'rgba(255,255,255,0.6)'); }, 1);
      one('beachhut', 68, 36, g => { R(g, 4, 14, 60, 20, '#d8c8a0'); for (let x = 6; x < 64; x += 4) R(g, x, 14, U, 20, '#b8a880'); R(g, 14, 18, 40, 10, '#3a2e30'); R(g, 15, 19, 38, 8, '#ffd98a'); R(g, 14, 27, 40, 2, '#a8744a'); for (let i = 0; i < 17; i++) R(g, i * 4, 6, 4, 9, i % 2 ? '#f4f1e6' : '#3f7ab0'); R(g, 0, 5, 68, 1.5, '#2a5a8a'); R(g, 0, 14, 68, 1, '#2a5a8a'); R(g, 18, 0, 32, 6, '#f4e6c0'); txt(g, 'SHIRASU', 20, 0.5, '#2a5a8a'); R(g, 4, 34, 60, 2, '#8a8496'); }, 1);
      one('boards', 30, 26, g => { R(g, 2, 22, 26, 3, '#6a4a30'); for (let k = 0; k < 4; k++) { const c = ['#f06a8c', '#5aa8e0', '#f2c14e', '#f4f1e6'][k]; ell(g, 6 + k * 6, 12, 2.6, 11, dark(c, 0.3)); ell(g, 6 + k * 6, 12, 2, 10.5, c); R(g, 5.5 + k * 6, 2, 1, 20, lite(c, 0.4)); } }, 1);
      one('shelter', 48, 32, g => { for (const x of [4, 42]) R(g, x, 10, 2, 22, '#6b6478'); R(g, 0, 6, 48, 5, '#3f9a5a'); R(g, 0, 6, 48, 1, '#8fd070'); R(g, 6, 22, 36, 3, '#c89a6a'); R(g, 14, 0, 20, 7, '#f4f1e6'); txt(g, 'KOKOMAE', 15, 0.5, '#3f9a5a'); }, 1);
      // the Enoden: a little two-tone tram car, cream above and green below, with a pantograph
      one('enoden', 64, 30, g => { R(g, 3, 10, 58, 16, '#f4ead0'); R(g, 3, 18, 58, 8, '#2f7a4a'); R(g, 3, 18, 58, 1, '#4f9a6a'); ell(g, 3, 18, 3, 8, '#f4ead0'); ell(g, 61, 18, 3, 8, '#f4ead0'); ell(g, 3, 22, 3, 4, '#2f7a4a'); ell(g, 61, 22, 3, 4, '#2f7a4a'); R(g, 3, 9, 58, 1.5, '#c8c0b0');
        for (let x = 8; x < 58; x += 7) { R(g, x, 12, 5, 5, '#2a3a5a'); R(g, x, 12, 5, 1, '#6a8ab0'); } R(g, 28, 12, 6, 13, '#d8ceb4'); R(g, 0.5, 13, 2.5, 4, '#2a3a5a'); R(g, 61, 13, 2.5, 4, '#2a3a5a');
        disc(g, 1.5, 22, 1, '#fff0b0'); disc(g, 62.5, 22, 1, '#fff0b0'); for (const x of [12, 50]) { disc(g, x, 27, 2.6, '#2a2430'); disc(g, x + 6, 27, 2.6, '#2a2430'); } line1(g, 26, 9, 32, 2, '#3a3446'); line1(g, 38, 9, 32, 2, '#3a3446'); R(g, 26, 2, 12, 1, '#3a3446'); }, 1);
      SPR.rideSea = (() => { const c = mk(320, 84), g = c.g, r = RNG(44); dgrad(g, 0, 0, 320, 84, ['#7ab8e8', '#a8d4f0', '#e8f0f4']); mountain(g, 60, 34, 40, 18, '#8a9ac8', r, '#f8f4ee'); ell(g, 230, 34, 20, 7, '#4f7a5a'); R(g, 234, 20, 2, 10, '#e8e4dc');
        dgrad(g, 0, 34, 320, 24, ['#3e8aa8', '#68b2b4']); for (let k = 0; k < 30; k++) R(g, r() * 320, 36 + r() * 20, 4 + r() * 8, U, 'rgba(255,255,255,0.5)'); R(g, 0, 56, 320, 6, '#c8b89a'); for (let x = 0; x < 320; x += 3) R(g, x, 56 + Math.sin(x / 9) * 1, 3, 1, '#ffffff');
        R(g, 0, 62, 320, 6, '#5a5a6a'); for (let x = 0; x < 320; x += 20) R(g, x, 64.5, 10, U, '#e8e4f0'); for (let x = -6; x < 330; x += 22) { const h = 8 + r() * 10, cc = ['#e8e0d0', '#c8b8a8', '#a8b4c8', '#f4f1e6'][r() * 4 | 0]; R(g, x, 84 - h, 18, h, cc); R(g, x - 1, 84 - h - 3, 20, 3, dark(cc, 0.5)); } return c; })();
    }
  });
})();
