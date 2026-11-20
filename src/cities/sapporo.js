'use strict';
// ---------- Sapporo, in February: the Snow Festival ----------
// Snow falls on every map here (it keeps your footprints for a while, and your breath steams). Odori Park is lined with
// sculptures of snow and ice, with the TV Tower at its end and the old clock tower across the road; there is a slide to go
// down, a snowball stall and grilled corn. Susukino is neon and ice at night, with an alley of ramen shops. Otaru, along the
// coast, is a canal of old warehouses lit by gas lamps and snow candles, with glass to blow, music boxes, and a clock
// that runs on steam and whistles on the hour (here, every minute and a half, so nobody has to wait too long).
// Sapporo is a flight from Tokyo, not a train: the city's travellers leave from the airport sign by the station.
(function () {
  const LINE = [['sap_odori', 'ODORI'], ['sap_susukino', 'SUSUKINO'], ['sap_otaru', 'OTARU'], ['cts', 'NEW CHITOSE AIRPORT']];
  const STAMPS = {
    sap_snow: ['SNOW FESTIVAL', 'snowf', 'sap_odori'], sap_tower: ['TV TOWER', 'tvt', 'sap_odori'], sap_clock: ['THE CLOCK TOWER', 'clockt', 'sap_odori'], sap_slide: ['DOWN THE SNOW SLIDE', 'sled', 'sap_odori'], sap_snowball: ['SNOWBALL CHAMPION', 'sball', 'sap_odori'], sap_corn: ['GRILLED CORN', 'corn', 'sap_odori'],
    sap_ice: ['ICE SCULPTURES', 'ice', 'sap_susukino'], sap_ramen: ['MISO RAMEN', 'ramen', 'sap_susukino'], sap_lamb: ['JINGISUKAN', 'lamb', 'sap_susukino'],
    sap_canal: ['OTARU CANAL', 'canal', 'sap_otaru'], sap_glass: ['GLASS BLOWER', 'vase', 'sap_otaru'], sap_mbox: ['MUSIC BOX', 'mbox', 'sap_otaru'], sap_steam: ['THE STEAM CLOCK', 'steamc', 'sap_otaru']
  };
  const rnd = Math.random, pick = a => a[rnd() * a.length | 0];
  const COAT = ['#c8382e', '#3f7ab0', '#2a3a5a', '#f2c14e', '#5aa85a', '#f4f1e6', '#8a6aff'];
  const snowy = () => { M.wx = PLACES.weather({ snow: 1, breath: 1 }); };
  const shrub = (k, x, y) => { const s = SPR[k][(x * 7 + y) % SPR[k].length]; put(s, x, y, s.lw / 2, s.lh - 1); block(x - 4, y - 3, x + 4, y); M.SHD.push([x, y, 6, 2]); };
  const tree = (k, x, y) => { plant(k, x, y, 1); };
  // a little crowd in winter coats, walking a line
  const coats = (n, ax, ay, bx, by, jit) => { const s = M.ACT.length; crowd(n, ax, ay, bx, by, jit); M.ACT.slice(s).forEach((a, i) => { if (a.F) a.F = look(WALK[i % 3 === 0 ? 7 : i % 5], COAT[(i + ax) % COAT.length]); }); };

  // ---------- Odori Park ----------
  let slideT = -9;
  MAPS.sap_odori = { name: 'ODORI PARK', sub: 'THE SNOW FESTIVAL', tw: 56, th: 36, music: 'sapporo', snow: 1,
    zones: [[760, 160, 896, 416, 'SAPPORO TV TOWER', 'A TOWER WITH A CLOCK'], [150, 0, 300, 120, 'THE CLOCK TOWER', 'RINGING SINCE 1881'], [0, 160, 896, 416, 'ODORI PARK', 'THE SNOW FESTIVAL'], [0, 0, 896, 576, 'SAPPORO', 'THE SNOW FESTIVAL']],
    lay() { tRect(PL, 0, 0, 56, 6); tRect(PV, 0, 6, 56, 7.5); tRect(AS, 0, 7.5, 56, 10); tRect(GR, 0, 10, 56, 26); tRect(DT, 0, 17.5, 56, 18.5); for (const x of [9.5, 27.5, 45.5]) tRect(DT, x, 10, x + 1, 26); tRect(AS, 0, 26, 56, 28.5); tRect(PV, 0, 28.5, 56, 36); },
    tick() { M.wx && M.wx.tick(); }, over(cx, cy) { M.wx && M.wx.over(cx, cy); },
    deco() {
      const g = M.ground.g, r = RNG(7); roofs(0, 0, 896, 40);
      // the north side: the clock tower among the office blocks, the airport sign and the subway
      for (let x = 30; x < 896;) { const w = 44 + (r() * 4 | 0) * 8; if (Math.abs(x - 220) > 60 && Math.abs(x - 380) > 62 && Math.abs(x - 660) > 56) tower(x, 96, w, 50 + (r() * 4 | 0) * 9, { top: true, c: ['#8a8aa8', '#a89a94', '#7a8a9a', '#b0a8a0'][r() * 4 | 0] }); x += w + 6; }
      DAY.konbini(380, 96, 'sapporo'); DAY.hotel(660, 96, 'sapporo', 60); put(SPR.tokeidai, 220, 96, 34, 71); block(186, 82, 254, 96);
      stampSpot('sap_clock', 220, 112, 'TAKE A PHOTO', 'snap', ['A WHITE WOODEN HALL WITH A RED STAR AND A CLOCK, SMALL AMONG THE OFFICE BLOCKS.', 'IT WAS BUILT IN 1878 FOR AN AGRICULTURAL COLLEGE, AND ITS CLOCK HAS STRUCK THE HOURS EVER SINCE.'], 14, { frame: [170, 10, 100, 100] });
      gateway(80, 104, 'FLIGHTS TO OTHER CITIES', 'airsign'); M.SPOTS.push({ x: 520, y: 111, r: 14, label: 'SUBWAY', train: 1 }); prop('subway', 540, 104, 3); M.st = [520, 116];
      for (let x = 6; x < 896; x += 14) { R(g, x, 139.5, 7, 1, '#e8e4f0'); R(g, x, 435.5, 7, 1, '#e8e4f0'); } for (const x of [160, 448, 736]) { zebra(g, x - 18, 121, 36, 38); zebra(g, x - 18, 417, 36, 38); }
      cars(132, 1, 4); cars(150, -1, 3); cars(428, 1, 3); cars(446, -1, 4);
      // the snow castle, the owl, the ice and the snowmen
      put(SPR.snowcastle, 300, 272, 80, 109); block(226, 244, 374, 272);
      stampSpot('sap_snow', 300, 318, 'TAKE A PHOTO', 'snap', ['A CASTLE OF PACKED SNOW TALLER THAN A HOUSE, WITH TOWERS, A GATE AND WINDOWS OF BLUE ICE.', 'SIX STUDENTS MADE SIX SNOWMEN HERE IN 1950. NOW TWO MILLION PEOPLE COME TO SEE WHAT THE SNOW CAN DO.'], 16, { frame: [210, 150, 180, 140] });
      put(SPR.snowowl, 560, 268, 35, 73); block(530, 252, 590, 268); M.SPOTS.push({ x: 560, y: 282, r: 14, label: 'LOOK', lines: ['A GIANT OWL OF SNOW, EVERY FEATHER CARVED WITH A SPOON.', 'THE CARVERS WORK THROUGH THE NIGHT IN THE COLD. IT HAS TO BE COLD, OR THE OWL WOULD CRY.'] });
      for (const [x, y, k] of [[400, 386, 'icefish'], [700, 380, 'iceswan']]) { put(SPR[k], x, y, SPR[k].lw / 2, SPR[k].lh - 1); block(x - 12, y - 6, x + 12, y); M.ACT.push({ x, y: y + 0.4, sayT: 0, draw(e, sx, sy) { if (G.lowFx) return; for (let q = 0; q < 3; q++) { const t = (G.t * 0.7 + q * 0.33 + x * 0.01) % 1; if (t < 0.25) { const gx = sx - 8 + ((q * 37 + x) % 16), gy = sy - 10 - ((q * 23 + x) % 24); ctx.globalAlpha = 1 - t * 4; R(ctx, gx - 1.5, gy, 4, U, '#ffffff'); R(ctx, gx, gy - 1.5, U, 4, '#ffffff'); } } ctx.globalAlpha = 1; } }); }
      for (const [x, y] of [[120, 220], [380, 200], [470, 360], [610, 330], [90, 360], [770, 200]]) { prop('snowman', x, y, 4); }
      // the snow slide: up the ladder, down the chute
      put(SPR.snowslide, 640, 278, 18, 105); block(626, 182, 654, 274);
      M.SPOTS.push({ x: 640, y: 176, r: 14, label: 'SLIDE DOWN', stamp: 'sap_slide', fn: () => { G.state = 'event'; G.ev = { sp: { act: 'slide', stamp: 'sap_slide', fx: 'jump', lines: ['WHOOOSH. THE CHUTE IS POLISHED ICE, AND YOU HIT THE BOTTOM IN A SPRAY OF SNOW.', 'THE CHILDREN IN THE QUEUE GIVE YOU A SERIOUS NOD. YOU ARE ONE OF THEM NOW.'] }, t: 0 }; pl.mv = false; pl.dir = 'd'; slideT = G.t; PLACES.SND.swish();
        M.ACT.push({ temp: 1, x: 640, y: 180, sayT: 0, always: 1, t: 0, upd(e, dt) { e.t += dt; const q = Math.min(1, Math.max(0, (e.t - 0.15) / 1.2)); pl.x = 640; pl.y = 180 + q * q * 110; e.y = pl.y - 0.2; if (q > 0 && q < 1 && rnd() < 0.8) e.sp.push({ x: pl.x + (rnd() - 0.5) * 10, y: pl.y, vx: (rnd() - 0.5) * 40, vy: -20 - rnd() * 30, t: 0 }); for (const p of e.sp) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt; } if (e.t > 3) e.dead = 1; }, sp: [],
          draw(e, x, y) { const cx = e.x - x, cy = e.y - y; R(ctx, pl.x - cx - 7, pl.y - cy - 2, 14, 3, '#c8382e'); R(ctx, pl.x - cx - 7, pl.y - cy - 2, 14, 1, '#f06a5a'); R(ctx, pl.x - cx - 8, pl.y - cy + 1, 16, 1, '#6b6478'); for (const p of e.sp) { if (p.t > 0.6) continue; ctx.globalAlpha = 1 - p.t / 0.6; R(ctx, p.x - cx, p.y - cy, 1.5, 1.5, '#ffffff'); } ctx.globalAlpha = 1; } }); } });
      npc('kid', 610, 176, { tint: '#f2c14e', lines: ['THE QUEUE IS LONG BUT IT IS WORTH IT. I HAVE BEEN DOWN NINE TIMES.'] });
      // the snowball stall and the corn wagon
      prop('ballbooth', 196, 392, 16); const sb = npc('salary', 228, 392, { tint: '#3f7ab0', dir: 'l', lines: ['SNOWBALL TOSS! KNOCK DOWN FIVE BEARS, WIN A PRIZE!'] }); sb.spot = { label: 'PLAY SNOWBALL TOSS', mini: 'snowball', stamp: 'sap_snowball' };
      prop('cornstall', 500, 396, 14); const cn = npc('granny', 528, 398, { tint: '#c8382e', dir: 'l', lines: ['CORN AND POTATOES, HOT FROM THE GRILL! BUTTER ON TOP!'] }); cn.spot = { label: 'BUY GRILLED CORN', stamp: 'sap_corn', act: 'hold', fx: 'munch', lines: ['A WHOLE COB OF HOKKAIDO CORN, GRILLED BLACK IN STRIPES AND BRUSHED WITH SOY AND BUTTER.', 'YOUR HANDS ARE FINALLY WARM. YOUR FACE IS COVERED IN BUTTER. IT IS FINE.'] };
      // the TV tower at the end of the park
      put(SPR.tvtower, 820, 300, 40, 239); block(790, 288, 850, 300);
      M.ACT.push({ x: 820, y: 300.5, sayT: 0, always: 1, draw(e, x, y) { const d = new Date(), s = String(d.getHours()).padStart(2, '0') + (d.getSeconds() % 2 ? ':' : ' ') + String(d.getMinutes()).padStart(2, '0'); R(ctx, x - 13, y - 132, 26, 9, '#1d1626'); txt(ctx, s, x - 10, y - 130, '#ffb040'); if (Math.floor(G.t * 1.5) % 2) disc(ctx, x, y - 239, 1, '#ff3a2a'); } });
      stampSpot('sap_tower', 820, 318, 'LOOK UP', 'snap', ['THE TV TOWER, ORANGE STEEL WITH A GIANT CLOCK HALFWAY UP, AT THE END OF THE PARK.', 'FROM ITS DECK THE WHOLE FESTIVAL IS LAID OUT BELOW YOU LIKE A WHITE RIBBON.'], 15, { frame: [770, 20, 100, 290] });
      // trees and benches, people in coats, and the south side
      for (let x = 30; x < 880; x += 52) { tree(hsh(x, 1) < 0.5 ? 'snowpine' : 'bare', x, 176); tree(hsh(x, 2) < 0.5 ? 'bare' : 'snowpine', x + 20, 410); }
      for (const x of [100, 360, 600]) prop('bench', x, 340, 9);
      for (let x = 40; x < 896;) { const w = 48 + (r() * 3 | 0) * 8; tower(x, 570, w, 50 + (r() * 3 | 0) * 8, { c: ['#8a8aa8', '#a89a94', '#7a8a9a'][r() * 3 | 0], sign: x % 3 === 0 ? pick(['SOUP CURRY', 'CAFE', 'BOOKS', 'GLOVES']) : null, sc: '#3f7ab0' }); x += w + 8; }
      npc('tourist', 340, 330, { rad: 30, tint: '#f2c14e', lines: ['IT IS MINUS EIGHT. MY CAMERA BATTERY HAS GIVEN UP. SO HAVE MY TOES.'] }); npc('teen', 460, 220, { rad: 30, tint: '#f06a8c', lines: ['WALK LIKE A PENGUIN ON THE ICE. SHORT STEPS. EVERYONE HERE DOES IT.'] });
      npc('salary', 120, 300, { rad: 24, tint: '#2a3a5a', lines: ['THE ARMY BUILDS THE BIGGEST SCULPTURES. THEY TRAIN FOR IT ALL YEAR, A LITTLE.'] }); npc('granny', 720, 300, { rad: 20, tint: '#8a6aff', lines: ['TWO HUNDRED SCULPTURES, AND ONE WEEK LATER THEY KNOCK THEM ALL DOWN.', 'THAT IS WHAT MAKES THEM BEAUTIFUL, MY HUSBAND SAYS. HE IS A POET. A COLD ONE.'] });
      M.ACT.push({ cat: true, x: 860, y: 500, k: 1 });
      coats(7, 20, 288, 880, 288, 6); coats(5, 880, 480, 20, 480, 10); coats(4, 160, 170, 160, 400, 4); coats(4, 448, 400, 448, 170, 4); coats(4, 20, 108, 880, 108, 4);
      block(0, 570, 896, 576); M.LIGHTS = []; snowy(); PLACES.frost();
    } };

  // ---------- Susukino ----------
  MAPS.sap_susukino = { name: 'SUSUKINO', sub: 'NEON ON THE SNOW', tw: 44, th: 28, music: 'sapporo', snow: 1, night: 1, tint: '#7880c8',
    zones: [[280, 100, 420, 180, 'RAMEN YOKOCHO', 'AN ALLEY OF RAMEN SHOPS'], [0, 0, 704, 448, 'SUSUKINO', 'NEON ON THE SNOW']],
    lay() { tRect(PL, 0, 0, 44, 9); tRect(PV, 0, 9, 44, 20); tRect(AS, 0, 20, 44, 23); tRect(PV, 0, 23, 44, 28); },
    tick() { M.wx && M.wx.tick(); }, over(cx, cy) { M.wx && M.wx.over(cx, cy); },
    deco() {
      const g = M.ground.g; roofs(0, 0, 704, 50);
      const NE = ['#ff6aa8', '#5ad8f0', '#ffd84a', '#8a6aff', '#ff8a4a'];
      tower(60, 144, 92, 110, { c: '#3a3a5a', vs: 8, vc: '#ff6aa8', scr: [10, 14, 70, 30], sign: 'KARAOKE', sc: '#f06a8c' }); tower(170, 144, 100, 120, { c: '#4a4a6a', vs: 7, vc: '#5ad8f0', art: (q, x, t) => { R(q, x + 10, t + 10, 80, 40, '#1d1626'); for (let k = 0; k < 7; k++) R(q, x + 14 + k * 11, t + 14, 8, 32, NE[k % 5]); } });
      put(SPR.yokocho, 340, 144, 30, 49); block(312, 132, 368, 144); door(340, 144, 's_ramen', 'RAMEN ALLEY');
      tower(450, 144, 86, 96, { c: '#5a4a9a', sign: 'JINGISUKAN', sc: '#c8382e', vs: 6, vc: '#ffd84a' }); tower(560, 144, 80, 104, { c: '#3a3a5a', vs: 7, vc: '#8a6aff', sign: 'BAR', sc: '#8a6aff' }); tower(660, 144, 76, 88, { c: '#4a3a5a', vs: 5, vc: '#ff8a4a' });
      const lb = npc('chef', 450, 160, { lines: ['JINGISUKAN! LAMB ON A DOME-SHAPED GRILL, LIKE A GENGHIS KHAN HELMET!'] }); lb.spot = { label: 'TRY JINGISUKAN', stamp: 'sap_lamb', act: 'hold', fx: 'munch', lines: ['SLICES OF LAMB SIZZLE ON A HUMPED IRON GRILL, AND THE JUICES RUN DOWN TO COOK THE ONIONS AND SPROUTS AROUND THE EDGE.', 'YOUR COAT WILL SMELL OF IT FOR THREE DAYS. EVERYONE\'S DOES. IT IS A KIND OF BADGE.'] };
      // the ice sculptures down the middle of the street, lit from inside
      const ICE = [[110, 'icefish', '#5ad8f0'], [220, 'iceswan', '#ff6aa8'], [352, 'icebig', '#8a6aff'], [480, 'icefish', '#ffd84a'], [590, 'iceswan', '#5ad8f0']];
      for (const [x, k, c] of ICE) { const y = k === 'icebig' ? 262 : 252; put(SPR[k], x, y, SPR[k].lw / 2, SPR[k].lh - 1); block(x - (k === 'icebig' ? 24 : 12), y - 6, x + (k === 'icebig' ? 24 : 12), y); M.LIGHTS.push([x, y - 14, k === 'icebig' ? 40 : 26, c]);
        M.ACT.push({ x, y: y + 0.4, sayT: 0, draw(e, sx, sy) { if (G.lowFx) return; for (let q = 0; q < 3; q++) { const t = (G.t * 0.8 + q * 0.33 + x * 0.013) % 1; if (t < 0.25) { const gx = sx - 10 + ((q * 37 + x) % 20), gy = sy - 10 - ((q * 23 + x) % 30); ctx.globalAlpha = 1 - t * 4; R(ctx, gx - 1.5, gy, 4, U, '#ffffff'); R(ctx, gx, gy - 1.5, U, 4, '#ffffff'); } } ctx.globalAlpha = 1; } }); }
      stampSpot('sap_ice', 352, 296, 'TAKE A PHOTO', 'snap', ['A WHALE LEAPING OUT OF A WAVE, ALL CARVED FROM CLEAR ICE AND LIT PURPLE FROM INSIDE.', 'THE ICE COMES FROM THE RIVER IN BLOCKS. THE CARVERS USE CHAINSAWS, THEN CHISELS, THEN THEIR BREATH.'], 15, { frame: [290, 180, 130, 120] });
      for (let x = 30; x < 704; x += 70) prop('lamp', x, 318, 2);
      // the tram loop, and the subway
      for (const y of [334, 346]) { R(g, 0, y, 704, 1, '#8a8496'); R(g, 0, y, 704, U, '#c8c0d4'); } PLACES.passer({ y: 340, cars: [SPR.stram], period: 20, speed: 54, dir: 0, bell: 'ding', band: 9 });
      prop('subway', 120, 400, 3); M.SPOTS.push({ x: 104, y: 407, r: 14, label: 'SUBWAY', train: 1 }); M.st = [104, 418];
      npc('salary', 250, 300, { rad: 30, tint: '#2a3a5a', lines: ['ONE MORE BOWL OF RAMEN, THEN HOME. THAT IS WHAT I SAID THREE BOWLS AGO.'] }); npc('teen', 520, 290, { rad: 30, tint: '#f06a8c', lines: ['THE ICE IS SO CLEAR YOU CAN READ A NEWSPAPER THROUGH IT. I TRIED.'] }); npc('office', 620, 200, { rad: 20, tint: '#f4f1e6', lines: ['MISO RAMEN WAS BORN HERE, IN THE ALLEY. THE SOUP KEEPS YOU ALIVE ALL WINTER.'] });
      M.LIGHTS.push([60, 100, 40, '#ff6aa8'], [170, 90, 46, '#5ad8f0'], [340, 120, 30, '#ffb070'], [450, 110, 34, '#ffd84a'], [560, 100, 36, '#8a6aff'], [660, 110, 30, '#ff8a4a']); for (let x = 30; x < 704; x += 70) M.LIGHTS.push([x - 4, 290, 18, '#ffe8a8']);
      coats(6, 20, 196, 680, 196, 10); coats(5, 680, 300, 20, 300, 6); coats(4, 20, 400, 680, 400, 10); M.ACT.push({ cat: true, x: 290, y: 180, k: 2 });
      bottomRow(91); snowy(); PLACES.frost();
    } };
  MAPS.s_ramen = { indoor: 1, name: 'RAMEN YOKOCHO', music: 'sapporo', deco() {
    room({ wall: '#8a5a3a', floor: 'wood', mat: '#c8382e', art: (g, r) => { wallShelf(g, 20, 64, ['#f2c14e', '#c8382e', '#f4f1e6'], r); poster(g, 100, 10, 120, 16, '#c8382e', 'MISO - SHIO - SHOYU'); for (const x of [250, 280]) chochin(g, x, 10, '#e0452f'); ell(g, 160, 40, 30, 4, 'rgba(255,255,255,0.12)'); } });
    fur('counter', 160, 92, 220, '#6a4028'); for (let x = 62; x <= 258; x += 28) fur('stool', x, 106, '#3a3a4e');
    const k = npc('chef', 160, 72, { lines: ['ONE MISO? LISTEN CAREFULLY TO THE ORDER.'] }); k.spot = { label: 'ORDER MISO RAMEN', mini: 'ramen', stamp: 'sap_ramen' };
    eaters([62, 90, 230, 258], 104, ['CORN AND BUTTER ON RAMEN. ONLY HOKKAIDO WOULD THINK OF IT. ONLY HOKKAIDO WAS RIGHT.', 'I CAME IN FROM MINUS TEN. NOW I AM SWEATING. THIS IS THE SAPPORO WAY.', 'SLURP LOUDLY. IT IS POLITE, AND IT COOLS THE NOODLES.', 'THE SOUP HAS BEEN SIMMERING SINCE THIS MORNING. SO HAVE I.']);
  } };

  // ---------- Otaru ----------
  const steaming = () => (worldTime() % 90) < 6;
  MAPS.sap_otaru = { name: 'OTARU', sub: 'A CANAL TOWN IN THE SNOW', tw: 52, th: 34, music: 'sapporo', snow: 1, night: 1, tint: '#a0a0d8',
    zones: [[0, 120, 832, 300, 'OTARU CANAL', 'GAS LAMPS AND SNOW CANDLES'], [0, 300, 832, 544, 'SAKAIMACHI', 'GLASS, MUSIC BOXES AND STEAM']],
    lay() { tRect(PL, 0, 0, 52, 9); tRect(PV, 0, 8.75, 52, 10); tRect(WA, 0, 10, 52, 16); tRect(PV, 0, 16, 52, 34); },
    tick() { M.wx && M.wx.tick(); if (steaming() && !M.whis) { M.whis = 1; const v = Math.max(0, 1 - Math.hypot(pl.x - 700, pl.y - 430) / 300); if (v > 0) { PLACES.SND.whistle(v); setTimeout(() => PLACES.SND.whistle(v * 0.8), 1500); } } else if (!steaming()) M.whis = 0; },
    over(cx, cy) { M.wx && M.wx.over(cx, cy); },
    deco() {
      const g = M.ground.g; roofs(0, 0, 832, 80);
      // the warehouses across the water, stone and iron, from the herring days
      for (let x = 70; x < 832; x += 128) { put(SPR.kura, x, 142, 60, 69); block(x - 58, 128, x + 58, 142); M.LIGHTS.push([x - 30, 120, 16, '#ffd98a'], [x + 30, 120, 16, '#ffd98a']); }
      // the canal: its reflections, the snow candles and gas lamps along the near bank, and a bridge over it
      for (let x = 0; x < 832; x += 6) R(g, x, 162, 4, U, 'rgba(255,255,255,0.3)');
      for (let x = 24; x < 832; x += 34) { if (Math.abs(x - 420) < 30) continue; prop('snowcandle', x, 262, 0); M.LIGHTS.push([x, 256, 10, '#ffc070']); }
      for (let x = 60; x < 832; x += 120) { prop('gaslamp', x, 286, 2); M.LIGHTS.push([x, 252, 26, '#ffd98a']); }
      bridge(400, 150, 440, 262, '#5a5468', '#8a8496');
      stampSpot('sap_canal', 300, 286, 'TAKE A PHOTO', 'snap', ['THE CANAL AT DUSK: STONE WAREHOUSES, GAS LAMPS COMING ON, A ROW OF LITTLE CANDLES IN THE SNOW ALONG THE WATER.', 'THE SNOW CANDLES ARE MADE BY THE TOWN EVERY FEBRUARY. THERE ARE THOUSANDS. EACH ONE IS SOMEBODY\'S HANDS.'], 15, { frame: [180, 70, 240, 200] });
      npc('yukata', 560, 290, { tint: '#2a3a5a', lines: ['CANAL CRUISE! FORTY MINUTES, BLANKETS PROVIDED!'] });
      // Sakaimachi: the shops, glass and music boxes, and the steam clock at the corner
      const SH = [[90, 'GLASS', '#3f7ab0', 'o_glass'], [180, 'SUSHI', '#8a5a3a'], [270, 'CHEESECAKE', '#f2c14e'], [470, 'SAKE', '#5a8a5a'], [560, 'MUSIC BOX', '#8a6aff', 'o_music'], [650, 'CRAFTS', '#c8382e']];
      for (const [x, s, c, to] of SH) house(x, 360, 76, 30, { sign: s, noren: c, rh: 14, lantern: '#ffd98a', to, upper: 16 });
      for (const [x] of SH) M.LIGHTS.push([x, 340, 26, '#ffd98a']);
      put(SPR.steamclock, 760, 430, 12, 61); block(752, 424, 768, 430);
      M.ACT.push({ x: 760, y: 430.5, sayT: 0, always: 1, puffs: [], draw(e, x, y) { const on = steaming(); if (on && !G.lowFx && rnd() < 0.5) e.puffs.push({ x: (rnd() - 0.5) * 6, y: -58, vx: (rnd() - 0.5) * 8, t: 0 }); for (const p of e.puffs) { p.t += 1 / 60; p.x += p.vx / 60; p.y -= 14 / 60; } e.puffs = e.puffs.filter(p => p.t < 1.6); for (const p of e.puffs) { ctx.globalAlpha = (1 - p.t / 1.6) * 0.7; disc(ctx, x + p.x, y + p.y, 2 + p.t * 4, '#f4f4f8'); } ctx.globalAlpha = 1; if (on) for (let k = 0; k < 3; k++) { const q = (G.t * 0.8 + k / 3) % 1; ctx.globalAlpha = 1 - q; txt(ctx, k % 2 ? 'o' : 'O', x + 8 + q * 14, y - 50 - q * 16, '#fff8e8'); } ctx.globalAlpha = 1; } });
      M.SPOTS.push({ x: 744, y: 440, r: 15, label: 'WAIT FOR THE WHISTLE', stamp: 'sap_steam', fn: () => { if (!steaming()) { const s = 90 - Math.floor(worldTime() % 90); Snd.fx('talk'); dialog(['THE STEAM CLOCK TICKS AND HISSES QUIETLY. ITS NEXT WHISTLE IS IN ' + s + ' SECONDS.', 'STAND HERE WHEN IT GOES. EVERYONE ON THE CORNER WILL STOP AND LOOK UP.']); return; } G.state = 'event'; G.ev = { sp: { act: 'snap', stamp: 'sap_steam', lines: ['THE CLOCK WHISTLES A LITTLE TUNE IN FIVE NOTES, AND STEAM POURS OUT OF THE PIPES AT THE TOP.', 'IT WAS MADE IN CANADA, BY THE MAN WHO MADE THE ONE IN VANCOUVER. IT RUNS ON REAL STEAM.'], frame: [700, 340, 120, 110] }, t: 0 }; pl.mv = false; pl.dir = 'u'; } });
      npc('granny', 720, 470, { rad: 20, tint: '#8a6aff', lines: ['IT WHISTLES EVERY QUARTER HOUR. I SET MY OVEN BY IT.'] }); npc('teen', 380, 420, { rad: 30, tint: '#f06a8c', lines: ['THE CHEESECAKE SHOP GIVES OUT FREE SAMPLES. I HAVE BEEN IN FIVE TIMES.', 'I SAID I WAS FIVE DIFFERENT PEOPLE.'] });
      station(110, 500, 'OTARU'); prop('bench', 240, 460, 9); prop('vend', 300, 470, 6);
      for (let x = 30; x < 832; x += 100) if (x > 200) prop('gaslamp', x, 476, 2);
      coats(6, 20, 280, 810, 280, 6); coats(5, 810, 400, 20, 400, 8); coats(4, 20, 452, 700, 452, 10); M.ACT.push({ cat: true, x: 500, y: 300, k: 0 });
      bottomRow(67); snowy(); PLACES.frost();
    } };
  // the canal cruise: out past the warehouses, round, under the bridge and back
  RIDES.TOURS.sap_otaru = { kind: 'cruise', stamp: null, at: [560, 230], dock: [560, 274], speed: 28, look: ['yukata', '#2a3a5a'], board: 'TAKE THE CANAL CRUISE',
    route: [[480, 226, 'WELCOME ABOARD! THESE WAREHOUSES HELD HERRING. A HUNDRED YEARS AGO THIS TOWN WAS RICHER THAN SAPPORO.'], [120, 222, 'THE CANAL WAS NEARLY FILLED IN FOR A ROAD. THE TOWN FOUGHT FOR TEN YEARS TO SAVE IT. THEY WON.'], [60, 214], [80, 198, 'TURNING. MIND THE ICE ON THE WATER.'], [400, 196, 'UNDER THE BRIDGE. DUCK. NO, NOT REALLY.'], [740, 200, 'SIXTY-THREE GAS LAMPS. THEY COME ON BY THEMSELVES NOW. I MISS THE MAN WHO LIT THEM.'], [780, 214], [740, 228], [560, 230, 'THANK YOU! THE BLANKETS STAY ON THE BOAT, PLEASE.']] };
  MAPS.o_glass = { indoor: 1, name: 'GLASS WORKSHOP', music: 'sapporo', deco() {
    room({ wall: '#4a4458', floor: 'tile', t1: '#5a5468', t2: '#4a4458', mat: '#3f7ab0', art: (g, r) => { R(g, 120, 10, 80, 34, '#2a2430'); dgrad(g, 130, 16, 60, 24, ['#ffd040', '#ff8020', '#c83010']); for (let k = 0; k < 8; k++) { const x = 20 + k * 10; R(g, x, 18 + (k % 2) * 4, 6, 10, ['#5ad8f0', '#8a6aff', '#5aa85a', '#f06a8c'][k % 4]); R(g, x + 1, 19 + (k % 2) * 4, 1, 8, '#ffffff'); } for (let k = 0; k < 8; k++) { const x = 220 + k * 10; disc(g, x, 30, 4, ['#f2c14e', '#5ad8f0', '#c8382e', '#8a6aff'][k % 4]); p1(g, x - 1, 28, '#ffffff'); } } });
    M.LIGHTS = [[160, 30, 50, '#ff8a3a']]; fur('counter', 160, 96, 140, '#5a5468');
    const k = npc('chef', 160, 74, { tint: '#3a3a4e', lines: ['WANT TO BLOW A FLOAT? GENTLY. GLASS IS PATIENT. YOU MUST BE TOO.'] }); k.spot = { label: 'BLOW GLASS', mini: 'glass', stamp: 'sap_glass' };
    npc('tourist', 80, 150, { rad: 20, lines: ['OTARU MADE GLASS FLOATS FOR THE FISHING NETS. NOW IT MAKES EVERYTHING ELSE.'] }); npc('kid', 250, 150, { rad: 20, lines: ['THE FURNACE IS ONE THOUSAND TWO HUNDRED DEGREES. I AM NOT ALLOWED NEAR IT. I AM NEAR IT.'] });
  } };
  MAPS.o_music = { indoor: 1, name: 'MUSIC BOX HALL', music: 'sapporo', deco() {
    room({ wall: '#6a4a38', floor: 'wood', mat: '#8a6aff', art: (g, r) => { for (const x of [20, 92, 196, 268]) wallShelf(g, x, 36, ['#c89a6a', '#8a5a3a', '#f2c14e', '#f4f1e6', '#5a8a5a'], r); R(g, 140, 8, 40, 36, '#3a2630'); disc(g, 160, 24, 12, '#f2c14e'); disc(g, 160, 24, 10, '#f4ead4'); R(g, 159, 16, 2, 9, '#3a2630'); R(g, 159, 23, 7, 2, '#3a2630'); } });
    for (const [x, y] of [[80, 110], [160, 120], [240, 110], [100, 160], [220, 160]]) fur('cas', x, y, (x + y) % 8);
    M.SPOTS.push({ x: 160, y: 136, r: 15, label: 'WIND A MUSIC BOX', stamp: 'sap_mbox', fn: () => { const N = ['G5', 'B5', 'D6', 'G6', 'F#6', 'D6', 'E6', 'C6', 'B5', 'A5', 'G5']; N.forEach((n, i) => setTimeout(() => { if (Snd.ctx) Snd.tone('sine', nf(n) * 2, Snd.ctx.currentTime + 0.01, 1.2, 0.06, { pluck: 1, echo: 1, bus: Snd.sfx }); }, i * 260)); Snd.fx('page');
      dialog(['YOU TURN THE LITTLE KEY. THE DRUM ROLLS, AND A TINY STEEL COMB PLAYS A TUNE YOU ALMOST KNOW.', 'THERE ARE THIRTY THOUSAND MUSIC BOXES IN THIS HALL. THE ROOM SOUNDS LIKE SNOW WOULD, IF SNOW MADE A SOUND.'], () => award('sap_mbox')); } });
    npc('kimono', 260, 150, { rad: 20, tint: '#8a6aff', lines: ['YOU CAN CHOOSE THE TUNE AND THEY BUILD THE BOX AROUND IT.'] }); npc('granny', 60, 160, { rad: 20, lines: ['MY HUSBAND BOUGHT ME ONE HERE IN 1972. IT STILL PLAYS. HE STILL DOES NOT.'] });
  } };

  // ---------- snowball toss: knock down six bears as they pop up ----------
  const SNOWB = {
    init(m) { m.cx = 160; m.cy = 76; m.pop = [0, 1, 2, 3, 4].map(i => ({ x: 84 + i * 38, up: 0, t: 1 + rnd() * 2, hit: 0 })); m.balls = []; m.got = 0; m.time = 40; m.done = 0; m.fx = []; },
    update(m, dt) { if (m.done) { if (m.t > m.done + 1.2) endMini(true, ['FIVE BEARS DOWN! THE STALL MAN HANDS YOU A KNITTED HAT WITH EARS ON IT.', 'YOUR FINGERS ARE NUMB. IT WAS COMPLETELY WORTH IT.']); return; }
      m.time -= dt; if (m.time <= 0) { endMini(false, ['TIME! THE BEARS GO BACK TO SLEEP. YOUR ARM DOES TOO.', '"EVERYONE THROWS TOO LATE," SAYS THE STALL MAN. "THROW WHERE THEY WILL BE."']); return; }
      const ix = (K.r ? 1 : 0) - (K.l ? 1 : 0) + (JOY.on ? JOY.x : 0), iy = (K.d ? 1 : 0) - (K.u ? 1 : 0) + (JOY.on ? JOY.y : 0); m.cx = Math.max(70, Math.min(250, m.cx + ix * 170 * dt)); m.cy = Math.max(52, Math.min(100, m.cy + iy * 80 * dt));
      for (const p of m.pop) { p.t -= dt; if (p.hit > 0) { p.hit -= dt; p.up = Math.max(0, p.up - dt * 4); continue; } if (p.t <= 0) { if (p.up < 0.5) { p.up = 1; p.t = 1.5 + rnd() * 0.9; } else { p.up = 0; p.t = 0.5 + rnd() * 1.4; } } }
      if (KP.a) { m.balls.push({ x0: 160, y0: 128, x1: m.cx, y1: m.cy, t: 0 }); PLACES.SND.swish(); }
      for (const b of m.balls) { b.t += dt / 0.35; if (b.t >= 1 && !b.done) { b.done = 1; for (let k = 0; k < 8; k++) m.fx.push({ x: b.x1, y: b.y1, vx: (rnd() - 0.5) * 60, vy: -rnd() * 50, t: 0 }); const p = m.pop.find(q => q.up > 0.6 && !q.hit && Math.abs(q.x - b.x1) < 16 && b.y1 > 56 && b.y1 < 98); if (p) { p.hit = 0.8; m.got++; Snd.fx('pick'); if (m.got >= 5) { m.done = m.t; Snd.fx('yay'); } } else Snd.fx('land'); } }
      m.balls = m.balls.filter(b => b.t < 1.1); for (const f of m.fx) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 120 * dt; } m.fx = m.fx.filter(f => f.t < 0.6); },
    draw(m) {
      txtC(ctx, 'SNOWBALL TOSS', 160, 26, '#3f7ab0', null, 2); dgrad(ctx, 56, 38, 208, 50, ['#2a2a4a', '#5a5a8a']); for (let k = 0; k < 20; k++) p1(ctx, 60 + (k * 53 % 200), 42 + (k * 17 % 40), '#ffffff');
      for (const p of m.pop) { const h = p.up * 24, x = p.x, y = 92; if (h > 1) { ctx.save(); ctx.beginPath(); ctx.rect(x - 16, 60, 32, 32); ctx.clip(); const by = y - h; ell(ctx, x, by + 12, 10, 12, p.hit > 0 ? '#c8a070' : '#8a5a3a'); disc(ctx, x - 7, by + 1, 3, '#8a5a3a'); disc(ctx, x + 7, by + 1, 3, '#8a5a3a'); ell(ctx, x, by + 9, 4, 3, '#d8b080'); P(ctx, x - 3, by + 5, '#1d1626'); P(ctx, x + 3, by + 5, '#1d1626'); if (p.hit > 0) { R(ctx, x - 4, by + 4, 2, 1, '#1d1626'); R(ctx, x + 2, by + 4, 2, 1, '#1d1626'); } ctx.restore(); } }
      R(ctx, 56, 88, 208, 16, '#f4f8fc'); for (let x = 56; x < 264; x += 6) ell(ctx, x + 3, 88, 4, 2.5, '#ffffff'); R(ctx, 56, 103, 208, 1, '#c8d4e4');
      for (const b of m.balls) { const t = Math.min(1, b.t), x = b.x0 + (b.x1 - b.x0) * t, y = b.y0 + (b.y1 - b.y0) * t - Math.sin(t * Math.PI) * 24, r = 4 - t * 2; disc(ctx, x, y, r, '#ffffff'); p1(ctx, x - 1, y - 1, '#c8d4e4'); }
      for (const f of m.fx) { ctx.globalAlpha = 1 - f.t / 0.6; R(ctx, f.x, f.y, 1.5, 1.5, '#ffffff'); } ctx.globalAlpha = 1;
      const c = '#c8382e'; R(ctx, m.cx - 6, m.cy, 4, 1, c); R(ctx, m.cx + 3, m.cy, 4, 1, c); R(ctx, m.cx, m.cy - 6, 1, 4, c); R(ctx, m.cx, m.cy + 3, 1, 4, c);
      for (let i = 0; i < 5; i++) disc(ctx, 136 + i * 12, 112, 3.5, i < m.got ? '#8a5a3a' : '#d9cba8'); R(ctx, 70, 120, 180 * Math.max(0, m.time) / 40, 2, m.time < 10 ? '#c8382e' : '#8a7a6a');
      txtC(ctx, m.done ? 'FIVE BEARS!' : TOUCH ? 'AIM WITH THE STICK - E TO THROW' : 'ARROWS AIM - E TO THROW', 160, 128, '#3a2e40');
    }
  };

  // ---------- miso ramen: listen to the chef, then add the toppings in the order he called them ----------
  const TOP = [['CORN', '#f2d040'], ['BUTTER', '#f8e8a0'], ['PORK', '#e8a888'], ['EGG', '#f8c040'], ['NORI', '#2a3a2a'], ['ONION', '#5aa85a'], ['SPROUTS', '#f4f1e6']];
  const RAMEN = {
    init(m) { const idx = [0, 1, 2, 3, 4, 5, 6].sort(() => rnd() - 0.5); m.want = idx.slice(0, 4); m.ph = 'call'; m.ct = 0; m.got = []; m.sel = 3; m.lives = 2; m.msg = ''; m.mt = 0; m.done = 0; },
    update(m, dt) { if (m.mt > 0) m.mt -= dt; if (m.done) { if (m.t > m.done + 1.6) endMini(true, ['A DEEP BOWL OF MISO RAMEN, THE SOUP ALMOST ORANGE, WITH EVERYTHING ON TOP IN JUST THE RIGHT PLACE.', 'THE CHEF WATCHES YOU TAKE THE FIRST SLURP, AND NODS ONCE. THAT IS A LOT, FROM HIM.']); return; }
      if (m.ph === 'call') { const t0 = m.ct; m.ct += dt; if (Math.floor(m.ct / 1.1) !== Math.floor(t0 / 1.1) && m.ct < m.want.length * 1.1) Snd.fx('talk'); if (m.ct > m.want.length * 1.1 + 0.4) m.ph = 'pick'; return; }
      if (KP.l) { m.sel = (m.sel + 6) % 7; Snd.fx('ui'); } if (KP.r) { m.sel = (m.sel + 1) % 7; Snd.fx('ui'); }
      if (KP.a) { if (m.sel === m.want[m.got.length]) { m.got.push(m.sel); Snd.fx('pick'); if (m.got.length >= m.want.length) { m.done = m.t; Snd.fx('slurp'); } } else { m.lives--; m.msg = 'THE CHEF FROWNS: NOT THAT ONE, NOT YET'; m.mt = 1.2; Snd.fx('land'); if (m.lives <= 0) endMini(false, ['THE CHEF TAKES THE BOWL BACK, VERY GENTLY, AND STARTS A NEW ONE.', '"LISTEN TO THE ORDER," HE SAYS. "THE ORDER IS EVERYTHING."']); } } },
    draw(m) {
      txtC(ctx, 'MISO RAMEN', 160, 26, '#c8382e', null, 2);
      ell(ctx, 160, 78, 38, 14, '#c8382e'); ell(ctx, 160, 74, 36, 11, '#e88a3a'); ell(ctx, 160, 73, 33, 9, '#d87a2a'); for (let k = 0; k < 8; k++) R(ctx, 132 + k * 7, 72 + (k % 2), 5, 1, '#f2d890');
      m.got.forEach((i, k) => { const a = k / 4 * 6.283 + 0.5, x = 160 + Math.cos(a) * 18, y = 73 + Math.sin(a) * 4.5, c = TOP[i][1]; if (TOP[i][0] === 'CORN') for (let q = 0; q < 6; q++) disc(ctx, x - 4 + (q % 3) * 3, y - 1 + (q / 3 | 0) * 2, 1, c); else if (TOP[i][0] === 'EGG') { ell(ctx, x, y, 4, 3, '#f8f4ea'); disc(ctx, x, y, 1.8, c); } else if (TOP[i][0] === 'NORI') R(ctx, x - 2, y - 8, 5, 9, c); else ell(ctx, x, y, 5, 2.5, c); });
      if (!G.lowFx) for (let k = 0; k < 3; k++) { ctx.globalAlpha = 0.25; R(ctx, 146 + k * 12 + Math.sin(G.t * 2 + k) * 2, 52 - ((G.t * 10 + k * 5) % 12), 2, 5, '#ffffff'); } ctx.globalAlpha = 1;
      if (m.ph === 'call') { const i = Math.min(m.want.length - 1, Math.floor(m.ct / 1.1)), on = m.ct < m.want.length * 1.1; panel(196, 38, 64, 20); if (on) { txtC(ctx, (i + 1) + '. ' + TOP[m.want[i]][0], 228, 45, '#3a2e40'); } else txtC(ctx, 'GO!', 228, 45, '#c8382e'); txtC(ctx, 'LISTEN TO THE ORDER...', 160, 128, '#3a2e40'); return; }
      TOP.forEach(([n, c], i) => { const x = 70 + i * 30, y = 108, on = i === m.sel; R(ctx, x - 11, y - 8, 22, 14, on ? '#fff0c0' : '#f4ead4'); R(ctx, x - 11, y - 8, 22, 1, '#ffffff'); ell(ctx, x, y - 1, 6, 3.5, c); if (on) { R(ctx, x - 12, y - 9, 24, 1, '#c8382e'); R(ctx, x - 12, y + 6, 24, 1, '#c8382e'); } });
      txtC(ctx, TOP[m.sel][0], 160, 120, '#3a2e40'); for (let i = 0; i < 2; i++) disc(ctx, 250 + i * 8, 28, 2.5, i < m.lives ? '#c8382e' : '#d9cba8');
      txtC(ctx, m.mt > 0 ? m.msg : 'IN ORDER: < > CHOOSE, E TO ADD (' + m.got.length + '/' + m.want.length + ')', 160, 130, '#3a2e40');
    }
  };

  // ---------- blowing glass: hold E to blow the bubble up to the ring, and let go in time ----------
  const PIECES = [['A FLOAT', 0.5], ['A CUP', 0.7], ['A VASE', 0.85]];
  const GLASS = {
    init(m) { m.i = 0; m.r = 0.15; m.pops = 0; m.done = 0; m.msg = ''; m.mt = 0; m.wait = 0; m.col = ['#5ad8f0', '#8a6aff', '#5aa85a'][rnd() * 3 | 0]; m.shards = []; m.made = []; },
    update(m, dt) { if (m.mt > 0) m.mt -= dt; for (const s of m.shards) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 90 * dt; } m.shards = m.shards.filter(s => s.t < 0.8);
      if (m.done) { if (m.t > m.done + 1.4) endMini(true, ['A FLOAT, A CUP AND A VASE, STILL WARM, COOLING SLOWLY IN THE ANNEALING OVEN.', 'THE MASTER SAYS THEY WILL BE READY TOMORROW. HE SAYS THE CUP IS A LITTLE WONKY. HE SAYS THAT IS CHARM.']); return; }
      if (m.wait > 0) { m.wait -= dt; if (m.wait <= 0) { m.r = 0.15; } return; }
      const want = PIECES[m.i][1];
      if (K.a) { m.r += dt * 0.32; if (Math.floor(m.r * 30) !== Math.floor((m.r - dt * 0.32) * 30)) PLACES.SND.blow(); if (m.r > want + 0.1) { m.pops++; PLACES.SND.pop(); for (let k = 0; k < 14; k++) m.shards.push({ x: 0, y: 0, vx: (rnd() - 0.5) * 120, vy: -rnd() * 80, t: 0 }); m.msg = 'POP! TOO MUCH BREATH'; m.mt = 1.2; m.wait = 0.8; if (m.pops >= 3) endMini(false, ['THREE BUBBLES, THREE POPS. THE FLOOR IS GLITTERING.', 'THE MASTER SWEEPS IT UP, SMILING. "GLASS FORGIVES. TRY AGAIN TOMORROW."']); } }
      else if (m.r > 0.2 && m.wait <= 0) { if (Math.abs(m.r - want) < 0.07) { m.made.push([m.i, m.col]); m.i++; Snd.fx('pick'); m.msg = 'LOVELY!'; m.mt = 1; m.wait = 0.7; m.col = ['#5ad8f0', '#8a6aff', '#5aa85a', '#f06a8c'][rnd() * 4 | 0]; if (m.i >= PIECES.length) { m.done = m.t; Snd.fx('yay'); } } else { m.msg = 'TOO SMALL - KEEP BLOWING NEXT TIME'; m.mt = 1; m.wait = 0.6; Snd.fx('talk'); } } },
    draw(m) {
      txtC(ctx, 'GLASS BLOWING', 160, 26, '#3f7ab0', null, 2); R(ctx, 56, 38, 208, 80, '#2a2430'); dgrad(ctx, 60, 42, 40, 72, ['#ffd040', '#ff8020', '#a82010']); ctx.globalAlpha = 0.2 + Math.sin(G.t * 9) * 0.05; disc(ctx, 80, 78, 30, '#ff8020'); ctx.globalAlpha = 1;
      R(ctx, 110, 77, 70, 2, '#8a8496'); R(ctx, 110, 77, 70, U, '#c8c0d4'); const cx = 196, cy = 78, want = PIECES[Math.min(m.i, PIECES.length - 1)][1];
      if (!m.done) { const rr = want * 30; for (let a = 0; a < 6.283; a += 0.25) p1(ctx, cx + Math.cos(a + G.t) * rr, cy + Math.sin(a + G.t) * rr * 0.9, '#5ad88a'); }
      if (m.wait <= 0 || m.mt <= 0) { const r = m.r * 30, hot = Math.max(0, 1 - (m.t % 100) * 0); disc(ctx, cx, cy, r + 1, '#3a2430'); disc(ctx, cx, cy, r, mix('#ff9030', m.col, 0.35)); ctx.globalAlpha = 0.6; disc(ctx, cx - r * 0.3, cy - r * 0.3, r * 0.35, '#fff0c0'); ctx.globalAlpha = 1; R(ctx, cx - r - 2, cy - 1, 3, 2, '#c8c0d4'); }
      for (const s of m.shards) { ctx.globalAlpha = 1 - s.t / 0.8; R(ctx, cx + s.x, cy + s.y, 1.5, 1, m.col); } ctx.globalAlpha = 1;
      m.made.forEach(([i, c], k) => { const x = 232 + k * 10, y = 112; if (i === 0) disc(ctx, x, y - 3, 3, c); else if (i === 1) R(ctx, x - 2.5, y - 6, 5, 6, c); else { ell(ctx, x, y - 3, 3, 3, c); R(ctx, x - 1.5, y - 9, 3, 4, c); } });
      for (let i = 0; i < 3; i++) R(ctx, 64 + i * 6, 122, 4, 4, i < m.pops ? '#c8382e' : '#eadfc4');
      txtC(ctx, m.mt > 0 ? m.msg : m.done ? 'ALL THREE!' : 'NOW ' + PIECES[m.i][0] + ': HOLD E TO BLOW, LET GO AT THE GREEN RING', 160, 130, '#3a2e40');
    }
  };

  airport('cts', { name: 'NEW CHITOSE AIRPORT', short: 'SAPPORO', code: 'CTS', sub: 'THE DOOR TO HOKKAIDO', gate: 3, music: 'sapporo', welcome: 'WELCOME TO HOKKAIDO', other: 'haneda', city: ['sap_odori', 'ODORI PARK'], view: 'snow',
    tip: 'THERE IS A RAMEN STREET UPSTAIRS WITH TEN SHOPS. SOME PEOPLE FLY HERE JUST FOR THAT, AND FLY HOME.' });
  city({
    id: 'sapporo', name: 'SAPPORO', tagline: 'SNOW, RAMEN AND A CANAL TOWN', start: 'sap_odori', hub: 'sap_odori', line: LINE, areas: LINE.slice(0, 3), stamps: STAMPS, cats: 3, via: 'plane', rideSpr: 'rideSnow', gate: ['FLIGHTS', 'THE PLANE SIGN HERE'], minis: { snowball: SNOWB, ramen: RAMEN, glass: GLASS },
    hud: () => M.id === 'sap_otaru' ? ['steamc', steaming() ? 'WHISTLING NOW!' : 'WHISTLE IN ' + (90 - Math.floor(worldTime() % 90)) + 'S'] : M.indoor || M.def.airport ? null : ['snowf', 'MINUS ' + (6 + Math.floor(worldTime() / 600) % 5) + ' DEGREES'],
    sprites() {
      variants('snowpine', 3, (rnd_, i) => { const c = mk(64, 62); pine(c.g, 32, 60, 40 + i * 3, rnd_, ['#1f3a3a', '#2f5a4a', '#4a7a6a']); return PLACES.frostCanvas(c); });
      variants('bare', 3, (rnd_, i) => { const c = mk(56, 62), g = c.g; trunk(g, 28, 60, 34 + i * 3, 3, '#5a4434', 0); const br = (x, y, a, l, d) => { if (d > 4 || l < 2) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; line1(g, x, y, x2, y2, d < 2 ? '#5a4434' : '#7a6454'); br(x2, y2, a - 0.45 - rnd_() * 0.2, l * 0.7, d + 1); br(x2, y2, a + 0.45 + rnd_() * 0.2, l * 0.7, d + 1); }; br(28, 30 - i * 2, -1.5708, 12, 0); return PLACES.frostCanvas(c); });
      one('tokeidai', 68, 74, g => { R(g, 4, 46, 60, 26, '#f4f1e6'); for (let y = 48; y < 72; y += 2.5) R(g, 4, y, 60, U, '#d8d4cc'); for (const x of [10, 22, 42, 54]) { R(g, x, 52, 5, 8, '#3a5a8a'); R(g, x, 52, 5, 1, '#8ab0d0'); } R(g, 30, 58, 8, 14, '#6a4028'); roof(g, 34, 36, 22, 34, 11, '#c8382e'); R(g, 24, 22, 20, 16, '#f4f1e6'); roof(g, 34, 14, 8, 13, 8, '#c8382e'); disc(g, 34, 28, 6, '#f4f1e6'); disc(g, 34, 28, 5, '#2a2430'); disc(g, 34, 28, 4.2, '#f8f4e8'); R(g, 33.5, 25, 1, 3.5, '#2a2430'); R(g, 34, 27.5, 3, 1, '#2a2430'); R(g, 32, 6, 4, 8, '#f4f1e6'); line1(g, 34, 0, 34, 6, '#6b6478'); R(g, 29, 40, 10, 2, '#c8382e'); txt(g, '*', 32, 39, '#c8382e'); R(g, 2, 72, 64, 2, '#8c8498'); }, 1);
      one('snowcastle', 160, 112, g => { const S_ = '#f4f8fc', SH = '#c8d4e8', SD = '#a8b8d4', IC = '#8ac8e8';
        R(g, 10, 60, 140, 48, S_); R(g, 110, 60, 40, 48, SH); for (let x = 10; x < 150; x += 10) R(g, x, 54, 6, 7, S_); R(g, 10, 104, 140, 4, SD);
        for (const [x, w, h] of [[10, 22, 80], [128, 22, 80], [62, 36, 100]]) { R(g, x, 110 - h, w, h - 4, S_); R(g, x + w * 0.6, 110 - h, w * 0.4, h - 4, SH); for (let k = 0; k < w; k += 6) R(g, x + k, 104 - h, 4, 7, S_); roof(g, x + w / 2, 104 - h - 18, 1, w / 2 + 3, 18, '#d8e4f4'); }
        R(g, 70, 76, 20, 30, '#5a7aa8'); ell(g, 80, 76, 10, 8, '#5a7aa8'); for (const [x, y] of [[18, 46], [136, 46], [74, 28], [80, 48], [30, 72], [124, 72]]) { R(g, x, y, 6, 8, IC); R(g, x, y, 6, 1.5, '#e8f8ff'); }
        for (let k = 0; k < 20; k++) R(g, 12 + (k * 37 % 136), 62 + (k * 13 % 40), 3, U, SD); }, 1);
      one('snowowl', 70, 76, g => { const S_ = '#f4f8fc', SH = '#c8d4e8'; R(g, 6, 68, 58, 8, '#d8e2ee'); ell(g, 35, 46, 26, 26, S_); ell(g, 46, 46, 14, 24, SH); ell(g, 35, 20, 20, 16, S_); for (const s of [-1, 1]) { R(g, 35 + s * 14 - 2, 4, 4, 8, S_); disc(g, 35 + s * 8, 20, 7, '#e8f0f8'); disc(g, 35 + s * 8, 20, 4.5, '#f2c14e'); disc(g, 35 + s * 8, 20, 2.4, '#1d1626'); p1(g, 34 + s * 8, 19, '#ffffff'); } R(g, 33, 24, 4, 5, '#c8a040'); for (let y = 36; y < 66; y += 5) for (let x = 18 + (y % 10); x < 54; x += 8) { line1(g, x, y, x + 3, y + 3, SH); line1(g, x + 6, y, x + 3, y + 3, SH); } }, 1);
      for (const [k, w, h, f] of [['icefish', 30, 40, 0], ['iceswan', 30, 40, 1], ['icebig', 56, 60, 2]]) one(k, w, h, g => { const I1 = 'rgba(190,236,250,0.85)', I2 = 'rgba(140,210,240,0.85)', I3 = '#ffffff'; R(g, 2, h - 6, w - 4, 6, I2); R(g, 2, h - 6, w - 4, 1, I3);
        if (f === 0) { ell(g, w / 2, h * 0.5, 9, 13, I1); line1(g, w / 2 - 6, h * 0.25, w / 2 + 8, h * 0.08, I1); R(g, w / 2 - 4, h * 0.72, 8, 6, I1); disc(g, w / 2 - 2, h * 0.4, 1.4, I3); }
        else if (f === 1) { ell(g, w / 2, h * 0.68, 11, 6, I1); R(g, w / 2 + 4, h * 0.25, 3, 18, I1); ell(g, w / 2 + 3, h * 0.25, 4, 3, I1); for (let k = 0; k < 4; k++) line1(g, w / 2 - 10 + k * 3, h * 0.62, w / 2 - 6 + k * 3, h * 0.42, I2); }
        else { ell(g, w / 2, h * 0.55, 22, 12, I1); ell(g, w / 2 + 8, h * 0.45, 10, 8, I2); line1(g, w / 2 - 20, h * 0.5, w / 2 - 26, h * 0.3, I1); line1(g, w / 2 - 20, h * 0.5, w / 2 - 24, h * 0.7, I1); for (let k = 0; k < 5; k++) ell(g, 8 + k * 10, h - 9, 6, 4, I2); disc(g, w / 2 + 14, h * 0.48, 1.5, '#1d3a5a'); }
        for (let k = 0; k < 6; k++) R(g, 4 + (k * 7 % (w - 8)), 6 + (k * 11 % (h - 14)), 1, 3, I3); });
      one('snowman', 14, 22, g => { disc(g, 7, 16, 5.5, '#f4f8fc'); disc(g, 7, 8, 4, '#f4f8fc'); ell(g, 8, 17, 3, 4, '#d8e2ee'); P(g, 5.5, 7, '#1d1626'); P(g, 8.5, 7, '#1d1626'); R(g, 7, 8.5, 3, 1, '#f08a2a'); R(g, 3, 3, 8, 2, '#c8382e'); R(g, 4, 0, 6, 3, '#c8382e'); R(g, 3, 11, 8, 1.5, '#3f7ab0'); }, 1);
      one('snowslide', 36, 108, g => { R(g, 6, 0, 24, 14, '#8a6448'); for (let y = 0; y < 14; y += 3) R(g, 6, y, 24, 1, '#6a4a30'); for (let y = 12; y < 104; y++) { const w = 12; R(g, 18 - w, y, w * 2, 1, y % 6 < 3 ? '#e8f0fa' : '#dce6f4'); R(g, 18 - w, y, 2, 1, '#5a8ac8'); R(g, 16 + w, y, 2, 1, '#5a8ac8'); } ell(g, 18, 104, 16, 4, '#f4f8fc'); }, 1);
      one('ballbooth', 40, 34, g => { R(g, 2, 14, 36, 20, '#3f7ab0'); R(g, 4, 16, 32, 10, '#f4f8fc'); for (let k = 0; k < 5; k++) { disc(g, 8 + k * 6, 21, 2, '#8a5a3a'); } R(g, 2, 26, 36, 3, '#c89a6a'); for (let i = 0; i < 10; i++) R(g, i * 4, 6, 4, 8, i % 2 ? '#f4f1e6' : '#3f7ab0'); R(g, 0, 5, 40, 1.5, '#2a5a8a'); }, 1);
      one('cornstall', 34, 32, g => { R(g, 2, 14, 30, 14, '#c8382e'); R(g, 2, 14, 30, 1.5, '#f06a5a'); R(g, 4, 10, 26, 5, '#3a3a4e'); for (let k = 0; k < 5; k++) { R(g, 6 + k * 5, 8, 3.5, 4, '#f2d040'); R(g, 6 + k * 5, 8, 3.5, 1, '#2a2430'); } for (const x of [8, 26]) disc(g, x, 29, 3, '#2a2430'); R(g, 6, 2, 22, 6, '#f4f1e6'); txt(g, 'CORN', 9, 2.5, '#c8382e'); }, 1);
      one('tvtower', 80, 242, g => { const C = '#e8642a', CD = '#b84a1a';
        for (let i = 0; i < 160; i++) { const y = 240 - i, hw = Math.max(5, 36 - i * 0.22); R(g, 40 - hw, y, 2, 1, C); R(g, 40 + hw - 2, y, 2, 1, C); if (i % 10 === 0) R(g, 40 - hw, y, hw * 2, 1, C); else { const p = (i % 10) / 10 * hw * 2; p1(g, 40 - hw + p, y, CD); p1(g, 40 + hw - p, y, CD); } }
        R(g, 22, 104, 36, 8, '#f4f1e6'); R(g, 22, 104, 36, 1, '#ffffff'); R(g, 26, 100, 28, 4, '#c8d0dc'); R(g, 20, 70, 40, 16, '#f4f1e6'); R(g, 20, 72, 40, 6, '#3a4a6a'); for (let x = 22; x < 58; x += 4) R(g, x, 72, 2, 6, '#6a8ab0'); R(g, 20, 86, 40, 2, CD);
        for (let i = 0; i < 70; i++) { const y = 70 - i, hw = Math.max(1, 8 - i * 0.1); R(g, 40 - hw, y, hw * 2, 1, i % 8 < 4 ? C : '#f4f1e6'); } R(g, 39, 0, 2, 4, '#c8c0d4'); }, 1);
      one('airsign', 26, 28, g => { R(g, 12, 12, 2, 16, '#6b6478'); R(g, 0, 0, 26, 13, '#1d1626'); R(g, 1, 1, 24, 11, '#3f7ab0'); R(g, 5, 5.5, 16, 2, '#f4f1e6'); R(g, 10, 2.5, 4, 8, '#f4f1e6'); R(g, 4, 4, 3, 2, '#f4f1e6'); }, 1);
      one('subway', 14, 26, g => { R(g, 6, 10, 2, 16, '#6b6478'); disc(g, 7, 6, 6, '#3a8a4a'); disc(g, 7, 6, 4.5, '#f4f1e6'); txt(g, 'S', 5.5, 3.5, '#3a8a4a'); }, 1);
      one('yokocho', 60, 52, g => { for (const x of [4, 52]) R(g, x, 10, 4, 42, '#3a2630'); R(g, 0, 6, 60, 8, '#c8382e'); R(g, 0, 6, 60, 1.5, '#f06a5a'); txt(g, 'RAMEN', 18, 7.5, '#ffd84a'); for (let k = 0; k < 6; k++) chochin(g, 8 + k * 9, 16, '#e0452f'); R(g, 10, 30, 40, 22, '#1d1626'); dgrad(g, 12, 32, 36, 20, ['#ffb060', '#8a4a20']); }, 1);
      one('stram', 70, 30, g => { R(g, 2, 8, 66, 18, '#f4f1e6'); R(g, 2, 19, 66, 7, '#2a6a4a'); R(g, 2, 18, 66, 1, '#5ad88a'); ell(g, 2, 16, 3, 9, '#f4f1e6'); ell(g, 67, 16, 3, 9, '#f4f1e6'); for (let x = 6; x < 64; x += 7) { R(g, x, 10, 5, 6, '#2a3a5a'); R(g, x, 10, 5, 1, '#6a8ab0'); } R(g, 2, 7, 66, 1.5, '#c8c0d0'); for (const x of [14, 52]) { disc(g, x, 27, 2.5, '#2a2430'); disc(g, x + 6, 27, 2.5, '#2a2430'); } line1(g, 30, 7, 36, 0, '#3a3446'); line1(g, 42, 7, 36, 0, '#3a3446'); for (let x = 4; x < 66; x += 3) R(g, x, 7, 2, 1, '#ffffff'); }, 1);
      one('kura', 120, 72, g => { R(g, 4, 30, 112, 40, '#8a8496'); for (let y = 30; y < 70; y += 5) for (let x = 4 + ((y / 5) % 2) * 6; x < 116; x += 12) { R(g, x, y, 11, 4.5, '#9a94a6'); R(g, x, y, 11, U, '#b8b0c4'); } roof(g, 60, 10, 46, 60, 22, '#3a3446'); for (const x of [26, 94]) { R(g, x - 8, 42, 16, 28, '#2a2430'); ell(g, x, 42, 8, 5, '#2a2430'); R(g, x - 7, 44, 14, 26, '#3a3a4e'); R(g, x - U, 44, 1, 26, '#1d1626'); } for (const x of [50, 70]) { R(g, x - 4, 40, 8, 8, '#1d1626'); R(g, x - 3, 41, 6, 6, '#ffd98a'); } R(g, 0, 70, 120, 2, '#5a5468'); }, 1);
      one('snowcandle', 8, 8, g => { ell(g, 4, 5.5, 4, 2.6, '#f4f8fc'); ell(g, 4, 4.5, 3, 2, '#ffffff'); R(g, 3, 3, 2, 2, '#ffc070'); P(g, 3.5, 2.5, '#fff0c0'); });
      one('gaslamp', 12, 42, g => { R(g, 5, 10, 2, 32, '#2a2430'); R(g, 3, 38, 6, 4, '#2a2430'); R(g, 2, 2, 8, 9, '#2a2430'); R(g, 3, 3, 6, 7, '#ffd98a'); R(g, 3, 3, 6, 2, '#fff4c0'); R(g, 1, 1, 10, 2, '#2a2430'); R(g, 5, 0, 2, 1, '#2a2430'); }, 1);
      one('steamclock', 24, 64, g => { R(g, 4, 56, 16, 8, '#5a4a3a'); R(g, 6, 22, 12, 34, '#8a6a3a'); R(g, 6, 22, 3, 34, '#a8844a'); for (const x of [8, 12, 16]) R(g, x, 4 + (x % 8), 2, 18 - (x % 8), '#8a8496'); R(g, 4, 18, 16, 4, '#6a5a4a'); disc(g, 12, 32, 5, '#f4ead4'); disc(g, 12, 32, 5, 'rgba(0,0,0,0)'); R(g, 11.5, 28.5, 1, 4, '#2a2430'); R(g, 12, 31.5, 3, 1, '#2a2430'); R(g, 8, 44, 8, 8, '#3a3a4e'); R(g, 9, 45, 6, 6, '#ffd98a'); }, 1);
      SPR.rideSnow = (() => { const c = mk(320, 84), g = c.g, r = RNG(71); dgrad(g, 0, 0, 320, 84, ['#9aa8c8', '#c8d0e0', '#e8ecf4']); skyline(g, 0, 320, 64, 10, 34, '#a8b0c8', r); for (let x = 0; x < 320; x += 3) R(g, x, 64 - (hsh(x, 3) * 3), 3, 1, '#f4f8fc'); R(g, 0, 64, 320, 20, '#e4eaf4'); for (let x = -10; x < 330; x += 22) { const h = 10 + r() * 12; R(g, x, 84 - h, 18, h, '#c8b8a8'); R(g, x - 1, 84 - h - 3, 20, 3, '#f4f8fc'); } for (let k = 0; k < 80; k++) p1(g, r() * 320, r() * 84, '#ffffff'); return c; })();
      icon('snowf', g => { for (let k = 0; k < 3; k++) { const a = k * 1.047; line(g, 6 - Math.cos(a) * 5, 6 - Math.sin(a) * 5, 6 + Math.cos(a) * 5, 6 + Math.sin(a) * 5, '#5ab8e8'); } disc(g, 6, 6, 1.4, '#ffffff'); });
      icon('tvt', g => { line(g, 2, 12, 5, 3, '#e8642a'); line(g, 10, 12, 7, 3, '#e8642a'); R(g, 4, 5, 4, 2, '#f4f1e6'); R(g, 5.5, 0, 1, 3, '#e8642a'); R(g, 3, 8, 6, 1, '#e8642a'); });
      icon('clockt', g => { R(g, 1, 7, 10, 5, '#f4f1e6'); R(g, 0, 6, 12, 1.5, '#c8382e'); R(g, 4, 2, 4, 5, '#f4f1e6'); R(g, 3, 1, 6, 1.5, '#c8382e'); disc(g, 6, 4.5, 1.5, '#2a2430'); });
      icon('sled', g => { R(g, 1, 6, 10, 3, '#c8382e'); R(g, 1, 6, 10, 1, '#f06a5a'); R(g, 0, 10, 12, 1, '#6b6478'); R(g, 0, 9, 1, 2, '#6b6478'); line(g, 1, 4, 4, 1, '#ffffff'); line(g, 4, 4, 7, 1, '#ffffff'); });
      icon('sball', g => { disc(g, 6, 6, 4.5, '#f4f8fc'); disc(g, 5, 5, 2, '#ffffff'); P(g, 8, 8, '#c8d4e4'); P(g, 4, 8, '#c8d4e4'); });
      icon('corn', g => { ell(g, 6, 6, 2.6, 5, '#f2d040'); for (let y = 2; y < 11; y += 2) R(g, 4, y, 4, U, '#c8a020'); line(g, 3, 11, 1, 6, '#5aa85a'); line(g, 9, 11, 11, 6, '#5aa85a'); });
      icon('ice', g => { R(g, 2, 2, 8, 9, '#bfe8f8'); R(g, 2, 2, 8, 1, '#ffffff'); R(g, 3, 4, 1, 5, '#ffffff'); R(g, 7, 5, 2, 5, '#8ac8e8'); R(g, 0, 11, 12, 1, '#8a6aff'); });
      icon('lamb', g => { ell(g, 6, 8, 5.5, 3, '#3a3a4e'); ell(g, 6, 6, 4.5, 3, '#5a5a6e'); R(g, 3, 5, 3, 2, '#e8a888'); R(g, 7, 6, 3, 2, '#d88878'); R(g, 1, 9, 2, 1, '#5aa85a'); R(g, 9, 9, 2, 1, '#f4f1e6'); });
      icon('canal', g => { R(g, 0, 0, 12, 4, '#8a8496'); R(g, 1, 1, 3, 3, '#ffd98a'); R(g, 8, 1, 3, 3, '#ffd98a'); R(g, 0, 4, 12, 6, '#3a5a8a'); R(g, 2, 6, 3, 1, '#ffd98a'); R(g, 0, 10, 12, 2, '#f4f8fc'); });
      icon('vase', g => { ell(g, 6, 8, 3.5, 3.5, '#5ad8f0'); R(g, 4.5, 1, 3, 5, '#5ad8f0'); R(g, 4, 1, 4, 1, '#8ae8f8'); P(g, 5, 7, '#ffffff'); });
      icon('mbox', g => { R(g, 1, 4, 10, 7, '#8a5a3a'); R(g, 1, 4, 10, 1, '#c89a6a'); R(g, 1, 1, 10, 3, '#a8744a'); R(g, 4, 6, 4, 3, '#f2c14e'); R(g, 11, 6, 1, 2, '#f2c14e'); });
      icon('steamc', g => { R(g, 4, 4, 4, 8, '#8a6a3a'); disc(g, 6, 6, 1.6, '#f4ead4'); R(g, 4.5, 1, 1, 3, '#8a8496'); R(g, 6.5, 2, 1, 2, '#8a8496'); disc(g, 3, 1, 1.5, '#ffffff'); disc(g, 9, 0.5, 1.4, '#ffffff'); });
    }
  });
})();
