'use strict';
// ---------- everyday Japan: the time of day, the weather, convenience stores, hotels, ticket machines ----------
// The clock: a day lasts 24 real minutes (one game hour a minute) on the clock everyone shares, so friends see the same
// sky. Streets darken through a golden hour and a pink dusk into a blue night; street lamps, lanterns, vending machines,
// shop doors and windows come on, and crickets start up in the parks. Maps that are always night (Dotonbori, Gion, the
// neon of Susukino) stay that way. Sleeping at a hotel moves your own clock on to the next morning (alone; when playing
// together the shared clock wins).
// The weather: now and then it rains, more in some cities than others (in Sapporo it snows instead). The light goes grey,
// streaks of rain fall, drops splash, and people put up umbrellas. Buy a clear plastic one at a konbini and you will too.
// Every city has a konbini (shelves, a basket and a till: see shops.js; and something you can only get there) and a hotel or inn to sleep in. The first time you ride a city's line without an
// IC card, you buy a ticket from the machine: find your stop's fare on the map above it.
const DAY = (function () {
  const LEN = 1440, rnd = Math.random, pick = a => a[rnd() * a.length | 0];
  const S = () => Snd.ctx && Snd.ctx.state === 'running' ? Snd.ctx.currentTime + 0.01 : 0;
  const tone = (type, f, t, d, v, o) => Snd.tone(type, f, t, d, v, Object.assign({ bus: Snd.sfx }, o || {}));
  const off = () => NET.on ? 0 : (G.dayOff || 0);
  const hour = () => ((((worldTime() + off()) / LEN) % 1) + 1) % 1 * 24;
  // the colour the world is multiplied by through the day, and how far the lights are on
  const KEY = [[0, '#5a62a8', 1], [4.6, '#5a62a8', 1], [5.6, '#c8a0c8', 0.6], [6.6, '#f4e6e0', 0.12], [8, '#ffffff', 0], [16, '#ffffff', 0], [17.2, '#f8d8b0', 0.1], [18.3, '#d89098', 0.55], [19.3, '#5a62a8', 1], [24, '#5a62a8', 1]];
  function ambient(h) { let i = 0; while (i < KEY.length - 2 && h > KEY[i + 1][0]) i++; const a = KEY[i], b = KEY[i + 1], k = (h - a[0]) / (b[0] - a[0] || 1); return [mix(a[1], b[1], k), a[2] + (b[2] - a[2]) * k]; }
  // rain comes in spells of eight minutes on the shared clock; some spells are wet
  function rain() { if (!M || M.def.snow || CITY.id === 'sapporo') return 0; const T = worldTime(), slot = Math.floor(T / 480), p = (T % 480) / 480, w = hsh(slot, 77), c = CITY.id === 'okinawa' ? 0.2 : 0.28; if (w >= c) return 0; return Math.max(0, Math.min(1, p / 0.12, (1 - p) / 0.12)) * (w < c * 0.35 ? 1 : 0.6); }
  const cycles = () => M && !M.indoor && !M.def.station && !M.night;
  function dark() { if (!M || M.indoor || M.def.station) return 0; if (M.night) return 1; return Math.min(1, ambient(hour())[1] + rain() * 0.3); }
  function label() { const h = hour(), hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10; return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); }
  const hudIcon = () => rain() > 0.15 ? 'rainc' : dark() > 0.5 ? 'moon' : 'sun';

  // ---------- lights that come on at night: gathered once when a map is built ----------
  function build() {
    const NL = M.NL = (M.NLx || []).slice(), base = o => o.base || o.spr;
    for (const o of M.OBJ) { const s = base(o);
      if (s === SPR.lamp) NL.push([o.x - 4, o.y - 28, 20, '#ffe8a8']); else if (s === SPR.lantern || s === SPR.lanternM) NL.push([o.x, o.y - 14, 13, '#ffb070']);
      else if (s === SPR.vend || s === SPR.vend2 || s === SPR.vend3) NL.push([o.x, o.y - 11, 15, '#cfeaff']); else if (s === SPR.gaslamp) NL.push([o.x, o.y - 36, 24, '#ffd98a']); else if (s === SPR.konbini) NL.push([o.x, o.y - 14, 34, '#e8f4ff']); }
    for (const s of M.SPOTS) { if (s.door) NL.push([s.x, s.y - 18, 22, '#ffd98a']); else if (s.train || s.shink) NL.push([s.x, s.y - 22, 26, '#ffe8c0']); }
  }
  function light(cx, cy, t) {
    const [tc, dk0] = ambient(hour()), rn = rain(), col = rn > 0 ? mix(tc, mix(tc, '#9aa4b8', 0.6), rn) : tc, dk = Math.min(1, dk0 + rn * 0.3);
    if (col !== '#ffffff') { ctx.globalCompositeOperation = 'multiply'; R(ctx, 0, 0, W, H, col); }
    if (dk > 0.05 && M.NL) { ctx.globalCompositeOperation = 'lighter'; for (const [x, y, r, c, a] of M.NL) { if (x - cx < -r || x - cx > W + r || y - cy < -r || y - cy > H + r) continue; const h = hsh(x, y); ctx.globalAlpha = dk * (a || 0.85) * (0.9 + Math.sin(t * 2 + h * 9) * 0.1); ctx.drawImage(glowSpr(r, c), snap(x - cx - r), snap(y - cy - r)); } ctx.globalAlpha = 1; }
    ctx.globalCompositeOperation = 'source-over';
  }
  // ---------- rain ----------
  const drops = [], splash = []; let lt = 0;
  function weather(cx, cy) {
    const rn = rain(); if (rn <= 0 || M.indoor || M.def.station) return; const dt = Math.min(0.05, G.t - lt); lt = G.t; const n = Math.floor((G.lowFx ? 60 : 150) * rn);
    while (drops.length < n) drops.push({ x: rnd() * (W + 40), y: rnd() * H, l: 4 + rnd() * 5, v: 180 + rnd() * 80 }); drops.length = Math.min(drops.length, n);
    ctx.globalAlpha = 0.45; for (const d of drops) { d.y += d.v * dt; d.x -= d.v * 0.18 * dt; if (d.y > H) { d.y = -8; d.x = rnd() * (W + 40); } line1(ctx, d.x, d.y, d.x - d.l * 0.18, d.y + d.l, '#d8e4f8'); }
    if (!G.lowFx) for (let k = 0; k < rn * 5; k++) splash.push({ x: rnd() * W, y: rnd() * H, t: 0 });
    for (const s of splash) { s.t += dt; const a = 1 - s.t / 0.25; if (a <= 0) continue; ctx.globalAlpha = a * 0.6; const r = 1 + s.t * 10; p1(ctx, s.x - r, s.y, '#e8f0ff'); p1(ctx, s.x + r, s.y, '#e8f0ff'); p1(ctx, s.x, s.y - r * 0.5, '#e8f0ff'); }
    while (splash.length && splash[0].t > 0.25) splash.shift(); ctx.globalAlpha = 1;
  }
  // umbrellas over people in the rain: yours if you have bought one, theirs mostly
  const UMB = ['#2a3a5a', '#c8382e', '#3a3a4e', '#f06a8c', '#3f9a5a', '#f2c14e', 'clear', 'clear', 'clear'];
  function umb(e, x, y) { if (!M || M.indoor || M.def.station || rain() < 0.15 || e.ride || e.sit) return; if (e === pl ? !G.umbrella : (e.umb === undefined ? (e.umb = rnd() < 0.8 ? pick(UMB) : 0) : e.umb) === 0) return;
    const c = e === pl ? 'clear' : e.umb, ux = x + (e.dir === 'l' ? -2 : 2), uy = y - 31; R(ctx, ux - U / 2, uy, U, 18, '#6b6478');
    if (c === 'clear') ctx.globalAlpha = 0.55; for (let i = 0; i < 6; i++) { const w = 12 * Math.sqrt(1 - Math.pow((5 - i) / 6, 2)); R(ctx, ux - w, uy - 6 + i, w * 2, 1, c === 'clear' ? '#e8f0f8' : i < 2 ? lite(c, 0.25) : c); }
    for (const k of [-8, -3, 3, 8]) R(ctx, ux + k, uy - 1, U, 1.5, c === 'clear' ? '#ffffff' : dark(c, 0.35)); ctx.globalAlpha = 1; R(ctx, ux - U / 2, uy - 8, U, 2, '#6b6478'); }
  // ---------- each frame: the sound of rain, crickets after dark, a hint about umbrellas ----------
  let rt = 0, ct = 3, hinted = -1;
  function tick(dt) {
    const rn = rain(); rt -= dt; const t = S();
    if (rn > 0 && rt <= 0 && t) { rt = 0.3; const v = M.indoor || M.def.station ? 0.35 : 1; Snd.noise(t, 0.5, 0.02 * rn * v, 2600, 8000, Snd.sfx); Snd.noise(t + 0.1, 0.4, 0.012 * rn * v, 400, 1300, Snd.sfx); if (rn > 0.9 && rnd() < 0.004 && !M.indoor) { Snd.noise(t, 2.4, 0.08, 40, 260, Snd.sfx); G.flash = Math.max(G.flash, 0.35); } }
    ct -= dt; if (ct <= 0 && t) { ct = 0.6 + rnd() * 1.2; if (cycles() && dark() > 0.7 && rn < 0.1) { let green = 0; for (let k = 0; k < 8; k++) { const g = terr(pl.x + Math.cos(k) * 50, pl.y + Math.sin(k) * 40); if (g === GR || g === FR) green++; } if (green > 3) for (let k = 0; k < 4; k++) tone('sine', 4200 + rnd() * 400, t + k * 0.05, 0.03, 0.006, { pluck: 1 }); } }
    const slot = Math.floor(worldTime() / 480); if (rn > 0.3 && !G.umbrella && hinted !== slot && G.state === 'play' && !M.indoor && !M.def.station) { hinted = slot; NET.say('IT IS RAINING. A KONBINI WILL SELL YOU AN UMBRELLA.', 4); }
  }

  // ---------- convenience stores and hotels ----------
  // what you can only get at each city's konbini, and where it stands (for the stamp book)
  const LOCAL = { tokyo: ['TAMAGO SANDO', 'shibuya', 'A SOFT WHITE SANDWICH OF EGG MAYONNAISE, CRUSTS CUT OFF, SO GOOD THAT CHEFS ABROAD COPY IT.'],
    kamakura: ['SHIRASU ONIGIRI', 'kam_town', 'A RICE BALL FULL OF TINY WHITEBAIT CAUGHT OFF THE BEACH THIS MORNING. ONLY HERE.'],
    kawaguchiko: ['SHINGEN MOCHI', 'kw_town', 'SOFT RICE CAKES IN SOYBEAN FLOUR, WITH A LITTLE BOTTLE OF BROWN SUGAR SYRUP TO POUR. IT GETS EVERYWHERE.'],
    kyoto: ['MATCHA PARFAIT', 'kyo_station', 'LAYERS OF MATCHA CREAM, JELLY AND RED BEANS IN A CUP. EVEN THE KONBINI IN KYOTO IS ELEGANT.'],
    nara: ['PERSIMMON LEAF SUSHI', 'na_town', 'MACKEREL SUSHI WRAPPED IN PERSIMMON LEAVES, AN OLD NARA WAY OF KEEPING FISH FRESH. YOU DO NOT EAT THE LEAF.'],
    osaka: ['PORK BUN', 'osa_namba', 'A HOT, FAT STEAMED BUN FULL OF PORK AND ONION. OSAKA SAYS ITS BUNS ARE THE BEST. OSAKA SAYS THAT ABOUT EVERYTHING.'],
    hiroshima: ['LEMON CAKE', 'hir_town', 'A LITTLE LEMON-SHAPED SPONGE IN WHITE CHOCOLATE, MADE WITH LEMONS FROM THE ISLANDS. SOUR, THEN SWEET.'],
    sapporo: ['HOKKAIDO MILK PUDDING', 'sap_odori', 'A PUDDING SO RICH AND WOBBLY IT HARDLY HOLDS ITS SHAPE. THE COWS UP HERE ARE VERY PROUD.'],
    okinawa: ['PORK TAMAGO ONIGIRI', 'oki_kokusai', 'A SLICE OF FRIED PORK AND AN OMELETTE IN RICE AND SEAWEED. OKINAWA\'S FAVOURITE BREAKFAST, HOT FROM THE COUNTER.'] };
  const MUSIC = { tokyo: 'tokyo', kamakura: 'kamakura', kawaguchiko: 'fuji', kyoto: 'kyoto', nara: 'nara', osaka: 'osaka', hiroshima: 'hiroshima', sapporo: 'sapporo', okinawa: 'okinawa' };
  const RYOKAN = { kamakura: 1, kawaguchiko: 1, kyoto: 1, nara: 1, hiroshima: 1 };
  function konbini(x, y, cid) { put(SPR.konbini, x, y, 38, 49); block(x - 36, y - 14, x + 36, y); M.SHD.push([x, y + 1, 40, 3]); door(x, y, 'kb_' + cid, 'KONBINI'); }
  function hotel(x, y, cid, w) { if (RYOKAN[cid]) house(x, y, w || 64, 30, { sign: 'RYOKAN', noren: '#3d5a80', rh: 16, lantern: true, to: 'ht_' + cid, lab: 'STAY AT THE INN' }); else tower(x, y, w || 60, 84, { c: '#c8c0b8', sign: 'HOTEL', sc: '#3d5a80', to: 'ht_' + cid, lab: 'STAY AT THE HOTEL', lit: 0.5 }); }
  const chime = () => { const t = S(); if (t) ['E6', 'C6', 'D6', 'G5', 'G5', 'D6', 'E6', 'C6'].forEach((n, i) => tone('sine', nf(n), t + i * 0.18, 0.3, 0.04, { pluck: 1, echo: 1 })); };
  for (const cid in MUSIC) {
    // The konbini, laid out like the real thing: the open chiller of onigiri and bento and the wall of drink fridges at
    // the back, aisles of snacks, noodles, sweets and daily goods, an ice cream chest, the till with its hot case, and
    // along the window the magazines, the bins, the umbrella stand and the eat-in counter. Fill a basket, pay at the till
    // (it asks the things a konbini asks), then eat at the counter, make a coffee, sort your rubbish, use the toilet.
    MAPS['kb_' + cid] = { indoor: 1, city: cid, name: 'KONBINI', tw: 24, th: 14, shop: 'kb_' + cid, style: 'konbini', front: 1, music: MUSIC[cid], hud: () => SHOP.hud(), tick: () => SHOP.tick(),
      enter() { chime(); SHOP.enter(); const c = M.ACT.find(a => a.clerk); if (c) say(c, 'IRASSHAIMASE!'); M.ACT.filter(a => a.staff).forEach((a, i) => { a.greet = 0.7 + i * 0.6; }); },
      deco() {
        SHOP.sprites(); const L = LOCAL[cid];
        room({ wall: '#f4f4f0', floor: 'tile', t1: '#f2f2ee', t2: '#e2e2de', mat: '#3f9a5a', art: (g, r) => {
          R(g, 8, 4, 368, 5, '#3f9a5a'); R(g, 8, 9, 368, 2, '#5ab8e8'); R(g, 8, 11, 368, 1.5, '#f08a2a'); txt(g, 'OPEN 24 HOURS', 256, 4.5, '#ffffff');
          // the open chiller: onigiri on top, bento in the middle, sandwiches at the bottom, every one with a yellow price tag
          R(g, 12, 14, 112, 32, '#5a6a7a'); R(g, 14, 16, 108, 29, '#e8f0f4'); R(g, 14, 16, 108, 1, '#ffffff');
          for (let s = 0; s < 3; s++) {
            const y = 24 + s * 9; R(g, 14, y, 108, 1.5, '#a8b8c4');
            for (let x = 17; x < 117; x += 7) {
              const c = ['#f08a6a', '#f4ead4', '#c8382e', '#c8783a', '#5aa85a'][(x / 7 + s) % 5 | 0];
              if (s === 0) { R(g, x + 1.5, y - 6, 2, 1, '#f8f8f4'); R(g, x + 0.5, y - 5, 4, 2, '#f8f8f4'); R(g, x, y - 3, 5, 3, '#1d2a24'); p1(g, x + 2, y - 4.5, c); }
              else if (s === 1) { R(g, x, y - 5, 6, 5, '#2a2430'); R(g, x + 0.5, y - 4.5, 2.5, 4, '#f8f8f4'); R(g, x + 3, y - 4.5, 2.5, 4, c); }
              else { R(g, x, y - 5, 5, 5, '#f4ead4'); R(g, x, y - 3, 5, 1.5, ['#f2d040', '#e8a0a0', '#8fc97a'][x % 3]); }
              R(g, x, y + 0.5, 4, 1, '#f2d040');
            }
          }
          poster(g, 30, 4, 76, 8, '#e0563f', 'ONIGIRI BENTO SANDO');
          // the drink fridges: glass doors, bottles and cans on every shelf, the last door all beer
          for (let i = 0; i < 8; i++) { const x = 132 + i * 22; R(g, x, 14, 20, 32, '#c8d8e4'); R(g, x + 1, 15, 18, 30, '#e8f4fc'); for (let s = 0; s < 3; s++) for (let k = 0; k < 4; k++) { const c = i === 7 ? ['#f2c14e', '#e8e4ec', '#c8a040'][(k + s) % 3] : ['#e0563f', '#5aa8e0', '#f2c14e', '#5aa85a', '#f4f1e6', '#8a6aff'][(i + s * 3 + k) % 6]; R(g, x + 3 + k * 4, 17 + s * 9, 3, 7, c); R(g, x + 3 + k * 4, 17 + s * 9, 3, 1, lite(c, 0.4)); } R(g, x + 1, 15, 1, 30, '#ffffff'); R(g, x + 17, 26, 1, 8, '#8a8496'); }
          poster(g, 196, 4, 48, 8, '#3f7ab0', 'DRINKS');
          // the toilet, at the back, as in every konbini: ask first
          R(g, 324, 12, 40, 34, '#d8d4dc'); R(g, 330, 16, 28, 30, '#c8c0d4'); R(g, 330, 16, 28, 1, '#e8e4ec'); R(g, 353, 30, 2, 4, '#8a8496'); R(g, 334, 20, 20, 9, '#f4f4f0'); disc(g, 339, 22.5, 1.3, '#3f7ab0'); R(g, 338, 24, 2, 4, '#3f7ab0'); disc(g, 349, 22.5, 1.3, '#e0452f'); R(g, 347.5, 24, 3, 4, '#e0452f'); txt(g, 'TOILET', 333, 5, '#3a2e40');
          // the front window, either side of the door
          R(g, 8, M.h - 8, M.w / 2 - 22, 2, '#bfe0f0'); R(g, M.w / 2 + 14, M.h - 8, M.w / 2 - 22, 2, '#bfe0f0');
        } });
        // aisles: snacks and noodles, then daily goods and sweets; the ice cream chest and the local special at the end
        for (const [s, x, y] of [['kgSnack', 110, 100], ['kgNoodle', 200, 100], ['kgGoods', 110, 150], ['kgSweet', 200, 150]]) { put(SPR[s], x, y, 32, 27); block(x - 30, y - 8, x + 30, y); }
        SHOP.shelf(110, 112, 'BROWSE THE SNACKS', SHOP.SNACKS); SHOP.shelf(200, 112, 'BROWSE NOODLES AND BREAD', SHOP.NOODLES);
        SHOP.shelf(110, 162, 'BROWSE DAILY GOODS', SHOP.GOODS); SHOP.shelf(200, 162, 'BROWSE THE SWEETS', SHOP.SWEETS);
        put(SPR.kFreezer, 262, 104, 15, 19); block(248, 96, 276, 104); SHOP.shelf(262, 116, 'BROWSE THE ICE CREAM', SHOP.ICE);
        put(SPR.endcap, 262, 152, 13, 33); block(252, 146, 272, 152); M.SPOTS.push({ x: 262, y: 163, r: 13, label: 'ONLY HERE: ' + L[0], stamp: 'kb_' + cid, act: 'hold', fx: 'munch', lines: [L[2], 'THE LABEL SAYS LIMITED TO THIS REGION. YOU WILL THINK ABOUT IT ON THE TRAIN HOME.'] });
        SHOP.shelf(68, 60, 'BROWSE ONIGIRI AND BENTO', SHOP.BENTO, { r: 16 }); SHOP.shelf(220, 60, 'PICK A DRINK', SHOP.fridge, { r: 18, title: 'THE DRINKS FRIDGE' });
        M.SPOTS.push({ x: 344, y: 60, r: 14, label: 'ASK TO USE THE TOILET', fn: () => { const c = M.ACT.find(a => a.clerk); if (c) say(c, 'DOUZO!'); dialog(['"SUMIMASEN, TOIRE O KARITE MO II DESU KA?" MAY I USE THE TOILET?', 'THE CLERK SAYS "DOUZO!" AND POINTS. IT IS SPOTLESS.'], () => { G.state = 'mini'; G.mg = { k: 'washlet', sp: { label: 'TOILET' }, t: 0 }; MG.washlet.init(G.mg); }); } });
        // the till: cigarettes, the microwave and the receipt printer behind, two registers, the hot case on the counter
        put(SPR.kBack, 332, 100, 44, 25); block(288, 90, 376, 100); put(SPR.kGate, 287, 126, 3, 15); block(284, 100, 290, 126);
        fur('counter', 332, 140, 88, '#e8e8e8'); fur('till', 306, 126); fur('till', 346, 126);
        const ck = npc('office', 318, 114, { tint: '#3f9a5a', lines: ['IRASSHAIMASE! WE ARE OPEN EVERY HOUR OF EVERY DAY. EVEN THAT ONE.', 'YOU CAN PAY BILLS, POST LETTERS, BUY CONCERT TICKETS AND SEND YOUR SUITCASE TO THE AIRPORT. ALSO SNACKS.'] }); ck.clerk = 1;
        M.ACT.push({ x: 362, y: 141, sayT: 0, draw(e, sx, sy) { R(ctx, sx - 12, sy - 22, 24, 10, '#c8c0b0'); R(ctx, sx - 11, sy - 21, 22, 8, '#fff0c0'); for (let k = 0; k < 4; k++) { disc(ctx, sx - 8 + k * 5, sy - 15, 2, '#d8902a'); p1(ctx, sx - 9 + k * 5, sy - 16, '#f8d080'); } if (!G.lowFx) { ctx.globalAlpha = 0.3; R(ctx, sx - 6 + Math.sin(G.t * 2) * 2, sy - 28 - (G.t * 6 % 6), 2, 4, '#ffffff'); ctx.globalAlpha = 1; } } });
        SHOP.shelf(362, 152, 'HOT SNACKS', SHOP.HOT, { title: 'THE HOT CASE, AND COFFEE CUPS' }); SHOP.till(316, 152);
        // the machines on the side wall
        put(SPR.atm, 22, 120, 7, 21); block(15, 114, 29, 120); M.SPOTS.push({ x: 26, y: 130, r: 11, label: 'LOOK AT THE MACHINES', lines: ['A CASH MACHINE THAT TAKES FOREIGN CARDS, A COPIER, AND A TICKET MACHINE FOR CONCERTS AND THEME PARKS.', 'THE KONBINI IS ALSO A POST OFFICE, A BANK AND A BOX OFFICE. IT IS EVERYTHING.'] });
        // along the window: magazines, the bins, the umbrellas, the door, then the coffee machine and the eat-in counter
        put(SPR.magrack, 56, 210, 16, 23); put(SPR.magrack, 92, 210, 16, 23); block(40, 204, 108, 210);
        M.SPOTS.push({ x: 74, y: 196, r: 13, label: 'READ A MAGAZINE', lines: ['A MANGA MAGAZINE AS THICK AS A BRICK. SOMEONE NEXT TO YOU HAS BEEN STANDING HERE READING FOR AN HOUR.', 'THAT IS ALLOWED. IT IS CALLED TACHIYOMI: STANDING READING.'] });
        put(SPR.kBins, 132, 212, 20, 21); block(113, 206, 151, 212); SHOP.sortSpot(132, 198);
        put(SPR.ustand, 168, 212, 7, 19); block(162, 206, 174, 212);
        M.SPOTS.push({ x: 168, y: 200, r: 11, label: 'BUY AN UMBRELLA', fn: () => { if (G.umbrella) { dialog(['YOU ALREADY HAVE ONE. EVERYONE IN JAPAN OWNS SIX OF THESE, LEFT IN SIX DIFFERENT PLACES.']); return; } const K = SHOP.kago(); if (!K.items.some(i => i.umb)) K.items.push(Object.assign({}, SHOP.UMBRELLA)); Snd.fx('pick'); dialog(['A CLEAR PLASTIC UMBRELLA, FIVE HUNDRED YEN. INTO THE BASKET IT GOES. PAY FOR IT AT THE TILL.']); } });
        put(SPR.coffeem, 232, 213, 8, 21); block(225, 206, 239, 213); M.SPOTS.push({ x: 232, y: 199, r: 11, label: 'MAKE A COFFEE', fn: SHOP.coffee });
        put(SPR.kEatin, 300, 212, 64, 13); block(240, 204, 364, 212); for (const x of [258, 282, 306, 330]) put(SPR.kStool, x, 202, 4, 9); put(SPR.kPot, 352, 213, 5, 14);
        M.SPOTS.push({ x: 290, y: 194, r: 14, label: 'SIT AT THE EAT-IN', fn: SHOP.eatIn });
        // the people: a second clerk stocking shelves, someone reading, someone eating, and shoppers coming and going
        const st = SHOP.shopper('teen', '#3f9a5a', [[60, 124, 0], [62, 124, 5, 'u'], [150, 124, 0], [176, 124, 6, 'u'], [150, 124, 0]], ['IRASSHAIMASE! THE NEW SWEETS COME IN ON TUESDAYS. I KNOW THEM ALL BY NAME.', 'THE ONIGIRI ARE THROWN AWAY AT MIDNIGHT IF NOBODY BUYS THEM. SO, PLEASE, BUY THEM.']);
        st.staff = 1; st.carry = 1; st.carryC = '#5aa8e0'; st.draw = SHOP.staffDraw;
        npc('salary', 108, 198, { dir: 'd', lines: ['SHH. CHAPTER NINE. THE RIVAL IS ABOUT TO TURN UP.'] });
        npc('office', 330, 200, { dir: 'd', lines: ['LUNCH. EVERY DAY. THE SAME SEAT. THE SAME CURRY. I AM VERY HAPPY.'] });
        const a = SHOP.shopper('salary', null, [[192, 214, -12], [192, 180, 0], [155, 176, 0], [155, 66, 0], [66, 66, 3, 'u'], [155, 66, 0], [155, 176, 0], [300, 162, 4, 'u'], [230, 180, 0]], ['DINNER. BREAKFAST. LUNCH. ALL FROM HERE. I REGRET NOTHING.']); a.hide = true; a.pw = 2;
        const b = SHOP.shopper('teen', '#f06a8c', [[192, 214, -18], [192, 180, 0], [240, 176, 0], [240, 66, 0], [220, 66, 3, 'u'], [240, 66, 0], [240, 120, 0], [110, 120, 4, 'u'], [155, 120, 0], [155, 176, 0], [300, 162, 4, 'u'], [230, 180, 0]], ['THE NEW CRISPS ARE STRAWBERRY SHORTCAKE FLAVOUR. I AM AFRAID, AND I MUST KNOW.']); b.hide = true; b.pw = 9;
      } };
    // the hotel: a lobby with the front desk, and your room upstairs; a ryokan also has a shoe-off entrance and a bath
    const ry = RYOKAN[cid], checkedIn = () => (G.inn || {})[cid];
    MAPS['ht_' + cid] = { indoor: 1, city: cid, name: ry ? 'RYOKAN - ENTRANCE' : 'HOTEL LOBBY', music: MUSIC[cid], enter() { const c = M.ACT.find(a => a.clerk); if (c) say(c, ry ? 'IRASSHAIMASE. WELCOME HOME.' : 'WELCOME. CHECKING IN?'); }, deco() {
      if (ry) room({ wall: '#c8a878', floor: 'wood', mat: '#3d5a80', art: (g, r) => {
          for (let k = 0; k < 6; k++) { const x = 16 + k * 14; R(g, x, 10, 12, 34, '#8a6448'); R(g, x + 1, 11, 10, 15, '#a8805a'); R(g, x + 1, 28, 10, 15, '#a8805a'); disc(g, x + 6, 18, 1, '#f2c14e'); disc(g, x + 6, 35, 1, '#f2c14e'); }
          R(g, 120, 6, 80, 40, '#e8dcc0'); R(g, 150, 10, 20, 32, '#f4ecd8'); for (let k = 0; k < 4; k++) R(g, 151, 13 + k * 7, 18, U, '#3a2e40'); R(g, 124, 30, 10, 14, '#5a8a5a'); disc(g, 129, 28, 4, '#c8382e'); disc(g, 192, 28, 5, '#8a6448');
          R(g, 226, 4, 84, 42, '#3d5a80'); for (let x = 228; x < 308; x += 16) R(g, x, 4, 14, 26, '#4a6a9a'); disc(g, 268, 18, 6, '#f4f1e6'); txtC(g, 'YU', 268, 15, '#3d5a80'); } });
      else room({ wall: '#d8d0c4', floor: 'tile', t1: '#e8e2d6', t2: '#d8d0c4', mat: '#3d5a80', art: (g, r) => { R(g, 20, 8, 60, 34, '#5a6a8a'); R(g, 22, 10, 56, 30, '#8a9ab8'); txtC(g, 'HOTEL', 50, 20, '#f4f1e6'); for (const x of [230, 270]) { R(g, x, 10, 34, 36, '#8a8496'); R(g, x + 2, 12, 15, 34, '#c8c4cc'); R(g, x + 17, 12, 15, 34, '#b8b4bc'); R(g, x + 12, 4, 10, 5, '#2a2430'); txt(g, '1', x + 15, 4.5, '#f2c14e'); } poster(g, 110, 14, 80, 14, '#3d5a80', 'BREAKFAST 7-10'); } });
      fur('counter', 90, 92, 110, ry ? '#8a6448' : '#e8e4ec'); const ck = npc(ry ? 'kimono' : 'office', 90, 72, { tint: '#3d5a80', lines: ry ? ['WELCOME. PLEASE TAKE OFF YOUR SHOES AND STEP UP; THE SLIPPERS ARE YOURS WHILE YOU STAY.', 'DINNER IS IN YOUR ROOM AT SIX. THE BATH IS DOWN THE CORRIDOR, OPEN ALL NIGHT.'] : ['GOOD EVENING. MAY I HAVE YOUR NAME? AH, YES. ONE NIGHT.', 'YOUR ROOM IS ON THE NINTH FLOOR. BREAKFAST IS FROM SEVEN.'] }); ck.clerk = 1;
      M.SPOTS.push({ x: 90, y: 106, r: 14, label: 'CHECK IN', fn: () => { G.inn = G.inn || {}; if (G.inn[cid]) { dialog([ry ? '"YOUR ROOM IS READY. TAKE YOUR TIME, AND ENJOY THE BATH."' : '"YOUR KEY CARD, AGAIN? IT IS IN YOUR POCKET. EVERYONE DOES THAT."']); return; } G.inn[cid] = 1; save(); Snd.fx('coin');
        dialog(ry ? ['SHE BOWS, WRITES YOUR NAME IN A BOOK WITH A BRUSH, AND GIVES YOU A HEAVY OLD KEY ON A WOODEN TAG.', '"YOUR ROOM IS UP THE STAIRS, CALLED PINE. THE YUKATA IS FOLDED ON THE SHELF. THE BATH IS THROUGH THE BLUE CURTAIN."'] : ['THE CLERK SLIDES A KEY CARD ACROSS THE DESK WITH BOTH HANDS, AND A MAP OF THE AREA WITH THREE RAMEN SHOPS CIRCLED.', '"THE LIFTS ARE ON THE RIGHT. CHECK-OUT IS AT TEN. HAVE A RESTFUL NIGHT."']); } });
      const toRoom = () => { if (!checkedIn()) { Snd.fx('talk'); dialog([ry ? '"PLEASE CHECK IN FIRST, AT THE DESK."' : 'THE LIFT NEEDS A KEY CARD. THE FRONT DESK IS ON THE LEFT.']); return; } (G.bstack = G.bstack || []).push(G.back); G.back = { map: M.id, x: pl.x, y: pl.y + 8 }; Snd.fx(ry ? 'page' : 'chime'); go('hr_' + cid, 160, 182, 'u'); };
      if (ry) { M.SPOTS.push({ x: 160, y: 60, r: 15, label: 'UP THE STAIRS TO YOUR ROOM', fn: toRoom }); M.SPOTS.push({ x: 268, y: 60, r: 15, label: 'TO THE BATH', fn: () => { (G.bstack = G.bstack || []).push(G.back); G.back = { map: M.id, x: pl.x, y: pl.y + 8 }; Snd.fx('page'); go('hb_' + cid, 160, 182, 'u'); } });
        M.SPOTS.push({ x: 50, y: 70, r: 13, label: 'PUT YOUR SHOES AWAY', lines: ['YOU SLIDE YOUR SHOES INTO A LITTLE WOODEN LOCKER AND TAKE THE KEY, A WOODEN PLANK WITH A NUMBER BURNED INTO IT.', 'THE SLIPPERS ARE TOO SMALL. THEY ARE ALWAYS TOO SMALL. THAT IS PART OF IT.'] });
        R(M.ground.g, 8, 152, 304, 24, '#8a8496'); for (let x = 8; x < 312; x += 16) R(M.ground.g, x, 152, 1, 24, '#6b6478'); R(M.ground.g, 8, 150, 304, 3, '#5a3a28'); txtC(M.ground.g, 'SHOES OFF HERE', 160, 160, '#c8c0d4'); }
      else { M.SPOTS.push({ x: 264, y: 60, r: 15, label: 'TAKE THE LIFT', fn: toRoom }); for (const [x, y] of [[200, 140], [250, 140]]) fur('booth', x, y, '#5a6a8a'); prop('vend', 300, 160, 6); npc('salary', 230, 150, { rad: 16, lines: ['CHECK-IN IS AT THREE. I HAVE BEEN HERE SINCE TWO. I AM VERY GOOD AT WAITING.'] }); }
      fur('plant', 20, 176); fur('plant', 300, 176);
    } };
    MAPS['hr_' + cid] = { indoor: 1, city: cid, name: ry ? 'RYOKAN - YOUR ROOM' : 'HOTEL - ROOM 912', music: MUSIC[cid], deco() {
      room(ry ? { wall: '#e8dcc0', floor: 'tatami', mat: '#3d5a80', art: (g, r) => { R(g, 20, 6, 50, 40, '#8a6448'); R(g, 22, 8, 46, 36, '#e8e0d0'); R(g, 40, 12, 10, 26, '#f4ecd8'); for (let k = 0; k < 4; k++) R(g, 41, 14 + k * 6, 8, U, '#3a2e40'); R(g, 90, 12, 40, 30, '#c89a6a'); R(g, 92, 30, 36, 10, '#3d5a80'); R(g, 92, 30, 36, 2, '#5a7aa8'); for (const x of [240, 268]) { R(g, x, 8, 26, 34, '#c89a6a'); for (let y = 8; y < 42; y += 6) R(g, x, y, 26, U, '#8a6448'); for (let k = 0; k < 26; k += 6) R(g, x + k, 8, U, 34, '#8a6448'); } } }
        : { wall: '#d8d0c8', floor: 'carpet', carpet: '#5a6a8a', mat: '#3d5a80', art: (g, r) => { R(g, 30, 10, 60, 30, '#8a8496'); R(g, 32, 12, 56, 26, '#2a2430'); R(g, 34, 14, 52, 22, '#3a4a6a'); poster(g, 110, 14, 50, 14, '#3d5a80', 'NO SMOKING'); R(g, 250, 10, 50, 32, '#2a2430'); R(g, 252, 12, 46, 28, '#3a4a6a'); } });
      M.ACT.push({ x: 0, y: -1e5, sayT: 0, always: 1, draw(e, sx, sy) { const cx = e.x - sx, cy = e.y - sy, wx = (ry ? 240 : 252) - cx, wy = (ry ? 8 : 12) - cy, ww = ry ? 54 : 46, wh = ry ? 34 : 28, h = hour(), [tc, dk] = ambient(h); ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
        dgrad(ctx, wx, wy, ww, wh, [mix('#6ab0f0', '#101838', dk), mix('#b8dcf4', '#2a2c5a', dk), mix('#e8f0f4', tc, 0.5)]); if (dk > 0.5) for (let k = 0; k < 8; k++) p1(ctx, wx + hsh(k, 3) * ww, wy + hsh(k, 5) * wh * 0.6, '#ffffff');
        for (let x = 0; x < ww; x += 6) { const bh = 6 + hsh(x, cid.length) * 14; R(ctx, wx + x, wy + wh - bh, 5, bh, mix('#8a94b0', '#2a2a3a', dk)); if (dk > 0.4) for (let y = wy + wh - bh + 2; y < wy + wh; y += 3) if (hsh(x, y) < 0.4) p1(ctx, wx + x + 1 + (y % 3), y, '#ffd98a'); }
        if (rain() > 0.1) { ctx.globalAlpha = 0.5; for (let k = 0; k < 12; k++) R(ctx, wx + ((k * 13 + G.t * 30) % ww), wy + ((k * 7 + G.t * 90) % wh), U, 3, '#d8e4f8'); ctx.globalAlpha = 1; } ctx.restore(); if (ry) for (let k = 0; k < ww; k += 6) R(ctx, wx + k, wy, U, wh, '#8a6448'); } });
      if (ry) { put(SPR.futon, 200, 150, 22, 20); block(180, 132, 222, 150); fur('table', 110, 130, 2);
        M.SPOTS.push({ x: 110, y: 142, r: 13, label: 'POUR SOME TEA', fn: () => { Snd.fx('slurp'); dialog(['GREEN TEA FROM THE POT ON THE LOW TABLE, AND A LITTLE SWEET IN A PAPER WRAPPER.', 'THE SWEET IS THERE SO THE TEA IS NOT TOO BITTER ON AN EMPTY STOMACH. THE RYOKAN THINKS OF EVERYTHING.']); } });
        M.SPOTS.push({ x: 110, y: 64, r: 13, label: 'PUT ON THE YUKATA', lines: ['A COTTON YUKATA, BLUE AND WHITE, AND A PADDED JACKET ON TOP. LEFT SIDE OVER RIGHT. ALWAYS LEFT OVER RIGHT.', 'NOW YOU CAN WALK TO THE BATH, AND TO DINNER, AND EVEN OUT INTO THE STREET. EVERYONE DOES.'] }); }
      else { put(SPR.hbed, 210, 150, 26, 31); block(186, 124, 236, 150); fur('table', 80, 140, 4); M.SPOTS.push({ x: 80, y: 152, r: 13, label: 'MAKE A CUP OF TEA', fn: () => { Snd.fx('slurp'); dialog(['THE LITTLE KETTLE BOILS IN NINETY SECONDS. TEA BAGS, INSTANT COFFEE, AND A PAPER CUP OF PLUM-FLAVOURED SOMETHING.', 'ON THE DESK: A FOLDER OF RAMEN SHOPS, PYJAMAS IN THE DRAWER, AND A HUMIDIFIER WHIRRING POLITELY.']); } });
        M.SPOTS.push({ x: 40, y: 150, r: 12, label: 'LOOK IN THE BATHROOM', lines: ['A TINY BATHROOM, ALL ONE MOULDED PIECE, LIKE THE INSIDE OF A PLASTIC EGG. THE TOILET HAS MORE BUTTONS THAN THE TV.', 'THE BATH IS SHORT AND VERY DEEP. YOU SIT IN IT, UP TO YOUR CHIN.'] }); }
      M.SPOTS.push({ x: ry ? 200 : 210, y: 162, r: 15, label: 'SLEEP', fn: sleep });
    } };
    // the ryokan's bath: wash first, sitting on a little stool, then into the hot water
    if (ry) MAPS['hb_' + cid] = { indoor: 1, city: cid, name: 'RYOKAN - THE BATH', music: MUSIC[cid], deco() { M.washed = 0;
      room({ wall: '#b8a888', floor: 'tile', t1: '#c8c4bc', t2: '#b8b4ac', mat: '#3d5a80', art: (g, r) => { R(g, 60, 6, 200, 38, '#5a3a28'); dgrad(g, 62, 8, 196, 32, ['#4a6a5a', '#7a9a7a', '#b8d0b0']); for (let x = 64; x < 256; x += 9) { R(g, x, 18 + (x % 13), 3, 22, '#3a5a3a'); } for (const x of [120, 200]) R(g, x, 8, 2, 32, '#5a3a28');
        ell(g, 180, 122, 84, 34, '#6b6478'); ell(g, 180, 120, 80, 31, '#8c8498'); ell(g, 180, 122, 70, 25, '#5ab0c8'); ell(g, 176, 118, 58, 19, '#7ac8dc'); for (let k = 0; k < 10; k++) R(g, 130 + k * 10, 112 + (k * 7 % 16), 6, U, '#c8f0f8');
        for (let k = 0; k < 4; k++) { const y = 70 + k * 26; R(g, 20, y - 8, 4, 14, '#c8c4bc'); disc(g, 22, y - 10, 2, '#e8e4dc'); R(g, 30, y, 10, 6, '#c89a6a'); R(g, 30, y, 10, 1, '#e8c090'); ell(g, 46, y + 4, 4, 2, '#e8c890'); } } });
      block(102, 92, 262, 150);
      M.ACT.push({ x: 180, y: 90, sayT: 0, draw(e, sx, sy) { if (G.lowFx) return; for (let k = 0; k < 4; k++) { const q = (G.t * 0.3 + k / 4) % 1; ctx.globalAlpha = (1 - q) * 0.35; ell(ctx, sx - 40 + k * 26, sy + 20 - q * 30, 10 + q * 8, 4, '#ffffff'); } ctx.globalAlpha = 1; } });
      M.SPOTS.push({ x: 40, y: 104, r: 15, label: 'WASH FIRST', fn: () => { M.washed = 1; const t = Snd.ctx && Snd.ctx.currentTime; if (t) Snd.noise(t + 0.01, 1.4, 0.04, 800, 3000, Snd.sfx); dialog(['YOU SIT ON A LITTLE WOODEN STOOL, SOAP DOWN, AND RINSE OFF WITH A BUCKET FROM THE TAP. EVERY BIT OF SOAP GOES.', 'THE BATH IS FOR SOAKING, NEVER FOR WASHING. NOW YOU ARE READY.']); } });
      M.SPOTS.push({ x: 180, y: 160, r: 16, label: 'SOAK IN THE BATH', fn: () => { if (!M.washed) { Snd.fx('talk'); const o = M.ACT.find(a => a.elder); if (o) say(o, 'AH-AH! WASH FIRST!'); dialog(['AN OLD MAN IN THE WATER CLEARS HIS THROAT, VERY POLITELY, AND NODS AT THE ROW OF STOOLS BY THE WALL.', 'WASH FIRST. EVERYONE WASHES FIRST.']); return; }
        Snd.fx('wind'); dialog(['YOU LOWER YOURSELF IN, SLOWLY. THE WATER IS VERY HOT, AND THEN IT IS PERFECT. A SMALL TOWEL FOLDED ON YOUR HEAD, AS IS PROPER.', 'OUTSIDE THE WINDOW, BAMBOO. INSIDE YOU, SOMETHING UNKNOTS THAT YOU DID NOT KNOW WAS KNOTTED.']); } });
      // bathers: heads above the water, towels folded on top
      for (const [x, y, hair, el] of [[214, 118, '#cfc9d6', 1], [150, 128, '#2a2430', 0], [236, 132, '#3a2a2a', 0]]) M.ACT.push({ x, y, sayT: 0, elder: el, lines: el ? ['THE TOWEL GOES ON YOUR HEAD, NOT IN THE WATER.', 'THIS WATER COMES FROM UNDER THE MOUNTAIN. MY GRANDFATHER SAID IT CURED HIS KNEES.'] : ['TEN MINUTES IN, TEN OUT, TEN IN. THEN BEER. THAT IS THE RULE.'], li: 0,
        draw(e, sx, sy) { const b = Math.sin(G.t * 1.2 + x) * 0.4; ell(ctx, sx, sy + 3, 7, 2.2, 'rgba(255,255,255,0.35)'); R(ctx, sx - 5, sy - 1 + b, 10, 4, '#f1c9a0'); disc(ctx, sx, sy - 4 + b, 4.2, '#f1c9a0'); R(ctx, sx - 4, sy - 9 + b, 8, 3, hair); R(ctx, sx - 4.5, sy - 11 + b, 9, 2.5, '#ffffff'); R(ctx, sx - 4.5, sy - 11 + b, 9, U, '#e8f0f8'); P(ctx, sx - 1.5, sy - 4 + b, '#3a2a2a'); P(ctx, sx + 1.5, sy - 4 + b, '#3a2a2a'); R(ctx, sx - 7, sy + 2, 14, 2, 'rgba(122,200,220,0.7)'); } });
    } };
  }
  // ---------- sleeping until morning ----------
  function sleep() { const h = hour();
    if (NET.on) { dialog(['YOUR FRIENDS ARE STILL OUT AND ABOUT. NOBODY SLEEPS WHILE THE PARTY IS ON.']); return; }
    if (h >= 6 && h < 15) { dialog(['IT IS THE MIDDLE OF THE DAY. YOU LIE DOWN, STARE AT THE CEILING, AND GET UP AGAIN.', 'COME BACK TONIGHT.']); return; }
    const add = ((31 - h) % 24) * LEN / 24; G.state = 'ride'; G.ride = { sleep: 1, t: 0, dur: 5, h0: h, add, then: () => { G.dayOff = ((G.dayOff || 0) + add) % LEN; save(); Snd.play(M.def.music); Snd.fx('chime'); dialog(RYOKAN[CITY.id] ? ['GOOD MORNING! BREAKFAST ARRIVES ON A TRAY: GRILLED FISH, MISO SOUP, RICE, PICKLES AND A RAW EGG TO STIR IN.', 'OUTSIDE, THE CITY IS JUST WAKING UP.'] : ['GOOD MORNING! THE CURTAINS SLIDE BACK ON THEIR OWN. DOWNSTAIRS, A BREAKFAST BUFFET OF CURRY, CROISSANTS AND NATTO.', 'OUTSIDE, THE CITY IS JUST WAKING UP.']); } }; Snd.play(null); }
  function drawSleep(r) { const p = Math.min(1, r.t / r.dur), h = (r.h0 + ((31 - r.h0) % 24) * p) % 24, [tc, dk] = ambient(h);
    R(ctx, 0, 0, W, H, mix('#2a2236', '#c8b8a0', 1 - dk)); const cx = W / 2, cy = H / 2;
    R(ctx, cx - 60, cy - 50, 120, 60, mix('#101838', '#a8d4f0', 1 - dk)); for (let k = 0; k < 12; k++) if (dk > 0.4) p1(ctx, cx - 58 + hsh(k, 1) * 116, cy - 48 + hsh(k, 2) * 40, '#ffffff');
    for (let x = -58, k = 0; x < 58; x += 9, k++) { const bh = 8 + hsh(k, 9) * 18; R(ctx, cx + x, cy + 10 - bh, 8, bh, mix('#8a94b0', '#1d2238', dk)); if (dk > 0.35) for (let y = cy + 12 - bh; y < cy + 8; y += 3) for (let q = 1; q < 7; q += 3) if (hsh(k * 7 + q, y | 0) < 0.35 * dk) p1(ctx, cx + x + q, y, '#ffd98a'); }
    for (let k = 0; k < 3; k++) { const x = cx - 70 + ((G.t * 6 + k * 50) % 140); if (x > cx - 56 && x < cx + 50) { ctx.globalAlpha = 0.5; ell(ctx, x, cy - 40 + k * 9, 9, 2, mix('#3a3e6a', '#ffffff', 1 - dk)); ctx.globalAlpha = 1; } }
    const sy = cy + 10 - (1 - dk) * 46; if (dk < 0.8) disc(ctx, cx + 30, sy, 7, '#ffd08a'); else disc(ctx, cx - 30, cy - 34, 5, '#f4f0dc'); R(ctx, cx - 62, cy - 52, 124, 2, '#8a6448'); R(ctx, cx - 62, cy + 10, 124, 2, '#8a6448'); R(ctx, cx - 1, cy - 50, 2, 60, '#8a6448');
    R(ctx, cx - 40, cy + 24, 80, 18, '#f4f1e6'); R(ctx, cx - 14, cy + 22, 54, 20, '#3d5a80'); R(ctx, cx - 14, cy + 22, 54, 2, '#5a7aa8'); disc(ctx, cx - 26, cy + 30, 6, pl.F === pl.F ? '#f1c9a0' : '#f1c9a0'); R(ctx, cx - 32, cy + 24, 12, 4, '#3a2a2a');
    for (let k = 0; k < 3; k++) { const q = (G.t * 0.6 + k / 3) % 1; ctx.globalAlpha = 1 - q; txt(ctx, 'Z', cx - 20 + q * 14 + k * 4, cy + 14 - q * 26, '#f4f1e6', '#1d1626', 1 + (k === 2 ? 1 : 0)); } ctx.globalAlpha = 1;
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 6) * 10; panel(cx - 30, cy + 50, 60, 16); txtC(ctx, String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), cx, cy + 55, '#3a2e40');
    const a = r.t < 0.6 ? 1 - r.t / 0.6 : r.t > r.dur - 0.6 ? (r.t - r.dur + 0.6) / 0.6 : 0; if (a > 0) { ctx.globalAlpha = Math.min(1, a); R(ctx, 0, 0, W, H, '#100c1c'); ctx.globalAlpha = 1; } }

  // ---------- the ticket machine: find your fare on the map above it and press that button ----------
  const fareTo = (a, b, n) => { const d = Math.min(Math.abs(a - b), n - Math.abs(a - b)); return 150 + (d - 1) * 40; };
  const TICKET = {
    init(m) { const L = CITY.line, n = L.length, here = Math.max(0, L.findIndex(s => s[0] === (M.from || M.id))); m.here = here; m.to = m.sp.to; m.fare = fareTo(here, m.to, n); const opts = [m.fare, m.fare + 40, Math.max(110, m.fare - 40), m.fare + 80].filter((v, i, a) => a.indexOf(v) === i); while (opts.length < 4) opts.push(opts[opts.length - 1] + 40); m.opts = opts.sort(() => rnd() - 0.5); m.sel = 0; m.done = 0; m.msg = ''; m.mt = 0; },
    update(m, dt) { if (m.mt > 0) m.mt -= dt; if (m.done) { if (m.t > m.done + 1.1) { G.tix = G.tix || {}; G.tix[CITY.id] = 1; save(); if (m.sp.buy) endMini(true, ['THE MACHINE SAYS ARIGATO GOZAIMASHITA, AND OUT COMES YOUR TICKET, STILL WARM.', 'IT WILL OPEN ANY GATE IN THE CITY TODAY. KEEP IT: THE EXIT GATE WANTS IT BACK.']); else { G.mg = null; rideLine(m.to); } } return; }
      if (KP.l) { m.sel = (m.sel + 3) % 4; Snd.fx('ui'); } if (KP.r) { m.sel = (m.sel + 1) % 4; Snd.fx('ui'); }
      if (KP.a) { if (m.opts[m.sel] === m.fare) { m.done = m.t; Snd.fx('coin'); setTimeout(() => Snd.fx('gacon'), 500); } else { m.msg = m.opts[m.sel] < m.fare ? 'TOO CHEAP: THE GATE WOULD STOP YOU' : 'THAT IS MORE THAN YOU NEED'; m.mt = 1.3; Snd.fx('talk'); } } },
    draw(m) { const L = CITY.line, n = L.length; txtC(ctx, 'TICKET MACHINE', 160, 26, '#3f7ab0', null, 2);
      R(ctx, 54, 36, 212, 50, '#f4f8fc'); R(ctx, 54, 36, 212, 1, '#ffffff'); const y = 60, x0 = 66, x1 = 254; R(ctx, x0, y, x1 - x0, 2, '#5aa85a');
      L.forEach((s, i) => { const x = x0 + (x1 - x0) * (n > 1 ? i / (n - 1) : 0.5), here = i === m.here; disc(ctx, x, y + 1, 3.5, '#1d1626'); disc(ctx, x, y + 1, 2.5, here ? '#f2c14e' : i === m.to ? '#e0452f' : '#ffffff'); const nm = s[1].slice(0, 9).trim(); txtC(ctx, nm, x, i % 2 ? y + 7 : y - 13, i === m.to ? '#c8382e' : '#3a2e40'); txtC(ctx, here ? 'HERE' : String(fareTo(m.here, i, n)), x, i % 2 ? y + 14 : y - 20, here ? '#c8a020' : '#3f7ab0'); });
      m.opts.forEach((v, i) => { const x = 72 + i * 46, on = i === m.sel; R(ctx, x, 94, 38, 16, on ? '#c8382e' : '#3a3046'); R(ctx, x, 94, 38, 1, lite(on ? '#c8382e' : '#3a3046', 0.4)); txtC(ctx, v + ' YEN', x + 19, 99, '#fff8e8'); });
      if (m.done) { const q = Math.min(1, (m.t - m.done) / 0.6); R(ctx, 140, 116 - q * 8, 40, 10, '#f4ead4'); R(ctx, 140, 116 - q * 8, 40, 1, '#ffffff'); txt(ctx, m.fare + '', 146, 118 - q * 8, '#3a2e40'); }
      txtC(ctx, m.mt > 0 ? m.msg : m.done ? 'THERE IS YOUR TICKET!' : 'FIND ' + L[m.to][1] + ' ON THE MAP. < > THEN E', 160, 130, '#3a2e40'); }
  };
  // ---------- an onigiri: choose one, pay, and open it in three pulls without tearing the seaweed ----------
  const ONI = [['SALMON', '#f08a6a'], ['TUNA MAYO', '#f4ead4'], ['PICKLED PLUM', '#c8382e'], ['KOMBU', '#3a2a24']];
  const OPEN = [['d', 'PULL TAB 1 DOWN THE MIDDLE'], ['l', 'PULL CORNER 2 TO THE LEFT'], ['r', 'PULL CORNER 3 TO THE RIGHT']];
  const ONIGIRI = {
    init(m) { m.ph = 'pick'; m.sel = 0; m.bag = 0; m.i = 0; m.torn = 0; m.pt = 0; m.done = 0; if (m.sp && m.sp.oni != null) { m.sel = m.sp.oni; m.ph = 'open'; } },
    update(m, dt) { m.pt += dt;
      if (m.ph === 'pick') { if (KP.l) { m.sel = (m.sel + 3) % 4; Snd.fx('ui'); } if (KP.r) { m.sel = (m.sel + 1) % 4; Snd.fx('ui'); } if (KP.a) { m.ph = 'pay'; m.pt = 0; Snd.fx('page'); } }
      else if (m.ph === 'pay') { if (KP.l || KP.r) { m.bag ^= 1; Snd.fx('ui'); } if (KP.a && m.pt > 0.3) { m.ph = 'paid'; m.pt = 0; if (G.ic) Snd.fx('beep'); else Snd.fx('coin'); } }
      else if (m.ph === 'paid') { if (m.pt > 1) { m.ph = 'open'; m.pt = 0; } }
      else if (m.ph === 'open') { const k = KP.u ? 'u' : KP.d ? 'd' : KP.l ? 'l' : KP.r ? 'r' : null; if (k) { if (k !== OPEN[m.i][0]) { m.torn = 1; Snd.fx('land'); } else PLACES.SND.swish(); m.i++; m.pt = 0; if (m.i >= 3) { m.ph = 'eat'; m.pt = 0; } } }
      else if (m.ph === 'eat') { if (m.pt > 1.2) endMini(true, m.torn ? ['THE SEAWEED TEARS AND STAYS STUCK IN THE WRAPPER. YOU EAT IT IN TWO HALVES, AND IT IS STILL GOOD.', 'THE ORDER IS ON THE WRAPPER: 1, 2, 3. NEXT TIME.'] : ['THE WRAPPER COMES AWAY IN THREE NEAT PULLS AND THE SEAWEED FOLDS ROUND THE RICE, STILL CRISP. ' + ONI[m.sel][0] + ' INSIDE.', 'THE PLASTIC KEEPS THE SEAWEED DRY UNTIL THE LAST SECOND. SOMEBODY THOUGHT VERY HARD ABOUT THIS.']); } },
    draw(m) { txtC(ctx, 'KONBINI', 160, 26, '#3f9a5a', null, 2); const tri = (x, y, s, c, nori) => { ctx.fillStyle = '#f8f8f4'; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s * 0.7); ctx.lineTo(x - s, y + s * 0.7); ctx.closePath(); ctx.fill(); if (nori) R(ctx, x - s * 0.45, y - s * 0.1, s * 0.9, s * 0.8, '#1d2a24'); disc(ctx, x, y + s * 0.15, s * 0.22, c); };
      if (m.ph === 'pick') { R(ctx, 60, 82, 200, 4, '#c8c0b0'); ONI.forEach(([n, c], i) => { const x = 85 + i * 50; tri(x, 64, 14, c, 1); R(ctx, x - 16, 46, 32, 34, 'rgba(220,240,250,0.25)'); if (i === m.sel) { R(ctx, x - 18, 44, 36, 1, '#c8382e'); R(ctx, x - 18, 86, 36, 1, '#c8382e'); } txtC(ctx, n.split(' ')[0], x, 90, '#3a2e40'); }); txtC(ctx, '< > CHOOSE, E TO TAKE IT TO THE TILL', 160, 130, '#3a2e40'); return; }
      if (m.ph === 'pay' || m.ph === 'paid') { R(ctx, 70, 40, 180, 70, '#2a2430'); R(ctx, 74, 44, 172, 30, '#3a8a5a'); txt(ctx, ONI[m.sel][0] + ' ONIGIRI', 80, 48, '#ffffff'); txt(ctx, '150 YEN', 80, 58, '#f2c14e');
        if (m.ph === 'pay') { txtC(ctx, 'DO YOU NEED A BAG? (3 YEN)', 160, 80, '#f4f1e6'); [['NO, THANKS', 0], ['YES, PLEASE', 1]].forEach(([s, v], i) => { const x = 90 + i * 74; R(ctx, x, 90, 66, 12, m.bag === v ? '#c8382e' : '#5a5468'); txtC(ctx, s, x + 33, 93, '#fff8e8'); }); txtC(ctx, '< > CHOOSE, E TO PAY ' + (G.ic ? 'WITH YOUR IC CARD' : 'IN COINS'), 160, 130, '#3a2e40'); }
        else { txtC(ctx, G.ic ? 'PI!' : 'CHING CHING', 160, 84, '#5ad88a', null, 2); txtC(ctx, 'ARIGATOU GOZAIMASHITA!', 160, 130, '#3a2e40'); } return; }
      const x = 160, y = 76, s = 30; tri(x, y, s, ONI[m.sel][1], m.ph === 'eat' && !m.torn); if (m.torn && m.ph === 'eat') { R(ctx, x - 10, y, 8, 10, '#1d2a24'); R(ctx, x + 4, y + 4, 6, 6, '#1d2a24'); }
      if (m.ph === 'open') { ctx.globalAlpha = 0.6; const c2 = '#c8e0f0'; if (m.i < 1) R(ctx, x - 2, y - s, 4, s * 1.7, '#e0452f'); if (m.i < 2) { ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s * 0.7); ctx.lineTo(x - s, y + s * 0.7); ctx.closePath(); ctx.fill(); } if (m.i < 3) { ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s * 0.7); ctx.lineTo(x, y + s * 0.7); ctx.closePath(); ctx.fill(); } ctx.globalAlpha = 1;
        for (let i = 0; i < 3; i++) if (i >= m.i) { const [tx, ty] = [[x, y - s - 4], [x - s * 0.7, y + s * 0.5], [x + s * 0.7, y + s * 0.5]][i]; disc(ctx, tx, ty, 4, '#e0452f'); txtC(ctx, String(i + 1), tx, ty - 2, '#ffffff'); }
        txtC(ctx, OPEN[m.i] ? OPEN[m.i][1] + ' (' + { d: 'DOWN', l: 'LEFT', r: 'RIGHT' }[OPEN[m.i][0]] + ')' : '', 160, 130, '#3a2e40'); }
      else txtC(ctx, m.torn ? 'OOPS...' : 'PERFECT!', 160, 130, '#3a2e40'); }
  };

  function sprites() {
    one('konbini', 76, 50, g => { R(g, 2, 8, 72, 40, '#f8f8f4'); R(g, 2, 8, 72, 1.5, '#ffffff'); R(g, 2, 12, 72, 4, '#3f9a5a'); R(g, 2, 16, 72, 2, '#5ab8e8'); R(g, 2, 18, 72, 1.5, '#f08a2a'); R(g, 6, 22, 64, 24, '#2a3a4a'); R(g, 7, 23, 62, 22, '#e8f4fc'); for (let x = 10; x < 66; x += 6) for (let s = 0; s < 3; s++) R(g, x, 26 + s * 6, 4, 4, ['#e0563f', '#f2c14e', '#5aa8e0', '#5aa85a'][(x + s) % 4]); R(g, 30, 30, 16, 16, '#c8d8e4'); R(g, 37.5, 30, 1, 16, '#8a94a6'); R(g, 7, 23, 62, 1, '#ffffff'); txt(g, '24H', 56, 9, '#3f9a5a'); R(g, 0, 46, 76, 3, '#8a8496'); R(g, 4, 0, 26, 8, '#3f9a5a'); txt(g, 'KONBINI', 5, 1.5, '#ffffff'); }, 1);
    one('gondola', 64, 24, g => { R(g, 2, 4, 60, 18, '#e8e8e4'); R(g, 2, 4, 60, 1, '#ffffff'); for (let r = 0; r < 2; r++) for (let x = 5; x < 59; x += 6) { const c = r ? ['#f2c14e', '#e0563f', '#5aa8e0', '#f06a8c'][(x / 6 | 0) % 4] : '#f4f4f0'; R(g, x, 6 + r * 8, 5, 6, c); if (!r) { R(g, x + 1, 8, 3, 3, '#1d2a24'); } } R(g, 0, 22, 64, 2, '#a8a4a0'); }, 1);
    one('coffeem', 16, 22, g => { R(g, 1, 0, 14, 22, '#3a3a4e'); R(g, 1, 0, 14, 1.5, '#6a6a7e'); R(g, 3, 3, 10, 5, '#5ad8f0'); R(g, 5, 10, 6, 6, '#1d1626'); R(g, 6, 13, 4, 3, '#f4f1e6'); R(g, 3, 18, 10, 2, '#8a8496'); }, 1);
    one('ustand', 14, 20, g => { R(g, 2, 12, 10, 8, '#8a8496'); for (let k = 0; k < 5; k++) { R(g, 3 + k * 2, 0, 1, 14, '#c8d8e4'); R(g, 2.5 + k * 2, 0, 2, 2, '#e8f0f8'); } }, 1);
    one('endcap', 26, 34, g => { R(g, 1, 4, 24, 28, '#f2c14e'); R(g, 1, 0, 24, 6, '#c8382e'); txt(g, 'ONLY', 4, 0.5, '#ffffff'); for (let s = 0; s < 3; s++) for (let k = 0; k < 4; k++) R(g, 3 + k * 5.5, 9 + s * 8, 4.5, 5, ['#f4f1e6', '#f8d080', '#e8c890'][(s + k) % 3]); R(g, 0, 32, 26, 2, '#a8a4a0'); }, 1);
    one('magrack', 32, 24, g => { R(g, 1, 2, 30, 20, '#8a8496'); for (let k = 0; k < 6; k++) { const c = ['#f06a8c', '#5aa8e0', '#f2c14e', '#e0563f', '#5aa85a', '#8a6aff'][k]; R(g, 2 + k * 5, 3 + (k % 2) * 8, 4, 9, c); R(g, 2 + k * 5, 3 + (k % 2) * 8, 4, 2, '#f4f1e6'); } }, 1);
    one('atm', 14, 22, g => { R(g, 1, 0, 12, 22, '#5a6a8a'); R(g, 3, 3, 8, 6, '#5ad8f0'); R(g, 3, 11, 8, 4, '#c8c0d4'); R(g, 4, 17, 6, 1, '#1d1626'); }, 1);
    one('futon', 44, 22, g => { R(g, 0, 2, 44, 18, '#f4f1e6'); R(g, 0, 2, 44, 1, '#ffffff'); R(g, 12, 3, 32, 17, '#3d5a80'); R(g, 12, 3, 32, 2, '#5a7aa8'); for (let k = 16; k < 44; k += 8) R(g, k, 6, 4, 4, '#f4f1e6'); R(g, 2, 6, 9, 6, '#ffffff'); R(g, 0, 20, 44, 2, '#b8c078'); }, 1);
    one('hbed', 52, 32, g => { R(g, 0, 0, 52, 8, '#6a4a38'); R(g, 2, 6, 48, 24, '#f4f4f0'); R(g, 2, 6, 48, 1, '#ffffff'); R(g, 4, 8, 18, 6, '#ffffff'); R(g, 28, 8, 18, 6, '#ffffff'); R(g, 2, 16, 48, 14, '#e8e4ec'); R(g, 2, 16, 48, 2, '#5a6a8a'); R(g, 0, 30, 52, 2, '#4a3a2a'); }, 1);
    icon('kbag', g => { R(g, 2, 3, 8, 8, '#f8f8f4'); R(g, 2, 5, 8, 1.5, '#3f9a5a'); R(g, 2, 6.5, 8, 1, '#5ab8e8'); R(g, 3.5, 1, 1, 3, '#c8c0d4'); R(g, 7.5, 1, 1, 3, '#c8c0d4'); R(g, 4, 8, 4, 2, '#f2c14e'); });
    icon('moon', g => { disc(g, 6, 6, 5, '#f4f0dc'); disc(g, 8, 4.5, 4, 'rgba(0,0,0,0)'); g.globalCompositeOperation = 'destination-out'; disc(g, 8.5, 4.5, 4, '#000'); g.globalCompositeOperation = 'source-over'; });
    icon('rainc', g => { ell(g, 6, 4, 5, 3, '#c8d0e0'); ell(g, 4, 4.5, 3, 2.5, '#e0e8f0'); for (const x of [3, 6, 9]) R(g, x, 8, 1, 3, '#5aa8e0'); });
  }
  // each city's konbini special goes in its stamp book
  for (const cid in LOCAL) if (CITIES[cid]) CITIES[cid].stamps['kb_' + cid] = ['KONBINI: ' + LOCAL[cid][0], 'kbag', LOCAL[cid][1]];
  return { hour, ambient, rain, dark, cycles, label, icon: hudIcon, build, light, weather, umb, tick, konbini, hotel, sleep, drawSleep, sprites, minis: { ticket: TICKET, onigiri: ONIGIRI } };
})();
