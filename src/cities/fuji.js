'use strict';
// ---------- Kawaguchiko: a lake town under Mount Fuji. One big map, plus a ropeway up to a small summit ----------
// Fuji hides in cloud for part of every half minute. The Fuji photos only count while the peak is clear,
// and the HUD says which it is, so the player learns to wait for it.
(function () {
  const STAMPS = {
    kw_mirror: ['MIRROR FUJI', 'fuji', 'kw_lake'],
    kw_chureito: ['CHUREITO PAGODA', 'pagoda', 'kw_hill'],
    kw_flowers: ['OISHI PARK FLOWERS', 'flower', 'kw_park'],
    kw_onsen: ['LAKESIDE ONSEN', 'onsen', 'kw_town'], kw_hoto: ['HOTO NOODLES', 'pot', 'kw_town'],
    kw_summit: ['FUJI FROM THE TOP', 'camera', 'kw_summit'], kw_dango: ['TANUKI DANGO', 'dango', 'kw_summit'], kw_bell: ['BELL OF THE SKY', 'heart', 'kw_summit']
  };
  const AREAS = [['kw_lake', 'LAKESHORE'], ['kw_hill', 'PAGODA HILL'], ['kw_park', 'OISHI PARK'], ['kw_town', 'TOWN'], ['kw_summit', 'MT KACHIKACHI']];

  // ---------- the clouds on Fuji ----------
  const cover = () => { const p = (G.t / 30 + 0.35) % 1; return p < 0.5 ? 1 : p < 0.58 ? 1 - (p - 0.5) / 0.08 : p < 0.92 ? 0 : (p - 0.92) / 0.08; };
  const clear = () => cover() < 0.2;
  const BLOBS = [[-36, 7, 22, 7], [-12, 2, 26, 8], [16, 5, 24, 7], [40, 11, 20, 6], [-54, 15, 18, 5], [2, 15, 30, 6], [30, 19, 22, 5]];
  function puffs(g, sx, sy, sc) { // the cloud cap, parting sideways as it clears
    const c = cover(); if (c <= 0.01) return; g.globalAlpha = Math.min(1, c * 1.2) * 0.95;
    for (const [dx, dy, rx, ry] of BLOBS) { const ox = (dx + Math.sign(dx || 1) * (1 - c) * 70) * sc; ell(g, sx + ox, sy + dy * sc + 1, rx * sc, ry * sc, '#d8e0ec'); ell(g, sx + ox - 2, sy + dy * sc - 1, rx * sc * 0.9, ry * sc * 0.8, '#ffffff'); }
    g.globalAlpha = 1;
  }

  // ---------- Fuji on the horizon ----------
  // Fuji is twenty kilometres away, so walking down to the shore should hardly move it. The skyline (sky, mountain, far treeline)
  // stays pinned to the world until it would scroll off the top of the view; then it holds there and slides down over the far
  // water instead, squeezing the lake the way distance does. It can slide at most `slide` units, which stops short of anything
  // you can walk on, so walking on into the park and the town scrolls it away as normal.
  // With `mirror`, the still water under it holds an upside-down Fuji, the "sakasa Fuji" the lake is famous for.
  const HZ = { bot: 0, top: 0 }; // where the skyline's bottom edge and summit were last drawn on screen; photos are framed from it
  let SKYC = null, RFC = null;
  const canvasFor = (c, w, h) => c && c.lw >= w && c.lh === h ? c : mk(Math.max(320, w), h);
  function horizon(spr, base, slide, cl, mirror) {
    const mask = mirror ? waterMask(base + slide + 80, mirror) : null;
    M.ACT.push({ x: 0, y: base + slide, sayT: 0, upd(e) { e.x = pl.x; }, draw(e, x, y) {
      const h = spr.lh, cx = snap(G.cx), cy = e.y - y, hold = Math.min(h, Math.max(cl.peak + 8, Math.round(H * 0.42))); // never so low that the sky runs out
      const bot = snap(base - cy + Math.max(0, Math.min(slide, hold - (base - cy))));
      HZ.bot = bot; HZ.top = bot - cl.peak;
      // and it drifts sideways at a third of your pace, so it stays in view as you walk the shore
      const c0 = (spr.lw - W) / 2, sx = snap(Math.max(0, Math.min(spr.lw - W, c0 + (cx - c0) * 0.35)));
      SKYC = canvasFor(SKYC, W, h); const s = SKYC.g; s.clearRect(0, 0, SKYC.lw, h); s.drawImage(spr, -sx, 0); puffs(s, cl.x - sx, cl.y, cl.sc);
      ctx.drawImage(SKYC, 0, 0, W, h, 0, bot - h, W, h);
      if (mask) reflect(mask, bot, cx, cy);
    } });
  }
  // the reflection: rows of the skyline, upside down, squashed onto the foreshortened water and wobbling a little,
  // kept to the lake by a mask of its water (so it never paints over the shore or the pier)
  function reflect(mask, bot, cx, cy) {
    const rh = Math.min(Math.floor(H - bot), 110), src = SKYC.lh - 3; if (rh <= 0) return;
    RFC = canvasFor(RFC, W, 110); const g = RFC.g; g.clearRect(0, 0, RFC.lw, 110);
    for (let r = 0; r < rh; r++) {
      const q = src - Math.floor(r / 0.55); if (q < 0) break;
      g.globalAlpha = Math.max(0, 1 - r / 95); g.drawImage(SKYC, 0, q, W, 1, snap(Math.sin(G.t * 1.6 + r * 0.6) * Math.min(1.5, 0.25 + r * 0.03)), r, W, 1);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, -cx, -(bot + cy)); g.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.42; ctx.drawImage(RFC, 0, 0, W, rh, 0, bot, W, rh); ctx.globalAlpha = 1;
  }
  // the lake's open water, from the painted terrain, down to world row h, less the rects in cuts (a pier)
  function waterMask(h, cuts) {
    const c = mk(M.w, h), DW = M.DW, n = Math.min(h * S, M.DH), im = c.g.createImageData(DW, n), d = new Uint32Array(im.data.buffer);
    for (let i = 0; i < DW * n; i++) if (M.TY[i] === WA) d[i] = 0xffffffff;
    c.g.putImageData(im, 0, 0); for (const [x, y, w, hh] of cuts) c.g.clearRect(x, y, w, hh); return c;
  }
  const CLOUDY = [['THE CLOUDS HAVE SWALLOWED THE SUMMIT.', 'FUJI IS SHY. WAIT A LITTLE AND TRY AGAIN.'], ['A WHITE BLANKET SITS ON THE PEAK.', 'THE LOCALS SAY IT CLEARS IF YOU ARE PATIENT.'], ['NOTHING BUT CLOUD WHERE THE MOUNTAIN SHOULD BE.', 'KEEP AN EYE ON THE SKY AT THE TOP OF THE SCREEN.']];
  // a Fuji photo frames the mountain where it stands on screen, summit at the top (the summit lookout). Two are painted as
  // postcards instead: the mirror, whose reflection needs more height than a small screen has, and Chureito, where Fuji is
  // off behind the trees
  const aimFuji = () => [W / 2, HZ.top - 5];
  function fujiSpot(id, x, y, verb, lines, r, shot) {
    M.SPOTS.push({ x, y, r: r || 15, label: verb, stamp: id, fn() {
      if (!clear()) { Snd.fx('wind'); dialog(CLOUDY[(G.t | 0) % CLOUDY.length]); return; }
      G.state = 'event'; G.ev = { sp: Object.assign({ act: 'snap', stamp: id, lines }, shot || { aim: aimFuji }), t: 0 }; pl.mv = false; pl.dir = 'u';
    } });
  }
  // the mirror postcard: Fuji over the far trees, and the same Fuji upside down in the still lake
  function mirrorPhoto(g, w, h) {
    const hz = Math.round(h * 0.56), top = mk(w, hz), t = top.g, r = RNG(17);
    dgrad(t, 0, 0, w, hz, ['#8ac0ec', '#b4d8f2', '#e4eef6']); for (const [x, y, a] of [[w * 0.14, 8, 14], [w * 0.86, 13, 11]]) { ell(t, x, y, a, 2, '#f4f8fc'); ell(t, x + 4, y - 1.5, a * 0.5, 1.5, '#ffffff'); }
    mountain(t, w / 2, hz - 5, w * 0.56, hz - 13, '#6a7ab8', r, '#f8f4ee');
    for (let x = 0; x < w; x += 2) { const th = 3 + hsh(x, 5) * 4; R(t, x, hz - th, 2, th, x % 6 ? '#3f6a4a' : '#4f7a5a'); }
    g.drawImage(top, 0, 0); dgrad(g, 0, hz, w, h - hz, ['#4f92c0', '#3a76a6']);
    g.globalAlpha = 0.6; for (let y = 0; y < h - hz; y++) { const q = hz - 1 - Math.floor(y / 0.8); if (q < 0) break; g.drawImage(top, 0, q, w, 1, snap(Math.sin(y * 1.7) * 0.5), hz + y, w, 1); } g.globalAlpha = 1;
    for (let k = 0; k < 16; k++) R(g, r() * w, hz + 2 + r() * (h - hz - 3), 3 + r() * 7, U, 'rgba(255,255,255,0.55)');
    g.drawImage(SPR.swan, Math.round(w * 0.1), h - 19);
  }
  // the Chureito postcard: the red pagoda among the cherry trees, the town below, and Fuji filling the sky behind
  function chureitoPhoto(g, w, h) {
    const r = RNG(41); dgrad(g, 0, 0, w, h, ['#8ac0ec', '#b4d8f2', '#e8eef4']);
    for (const [x, y, a] of [[24, 12, 18], [128, 8, 14], [96, 20, 10]]) { ell(g, x, y, a, 2.5, '#f4f8fc'); ell(g, x + 5, y - 2, a * 0.5, 2, '#ffffff'); }
    mountain(g, w * 0.64, h * 0.7, w * 0.62, h * 0.56, '#6a7ab8', r, '#f8f4ee');
    for (let x = -10; x < w + 10; x += 14) ell(g, x + r() * 8, h * 0.72, 12 + r() * 8, 4 + r() * 2, '#7a98a8');
    for (let x = w * 0.3; x < w + 6; x += 7) { const y = h * 0.74 + r() * 5, c = ['#e8e0d0', '#c8b8a8', '#a8b4c8'][r() * 3 | 0]; R(g, x, y, 6, 4, c); R(g, x - 0.5, y - 1.5, 7, 1.5, dark(c, 0.45)); }
    pagoda(g, w * 0.24, h * 1.02, 5, 26, { bh: 6, rh: 5, step: 3 });
    for (let i = 0; i < 46; i++) { const a = i / 46, x = a < 0.5 ? a * 2 * w * 0.5 - 6 : w - (a - 0.5) * 2 * w * 0.3 + 6, y = h - 2 - r() * (a < 0.5 ? 22 : 14) + (a < 0.5 ? 0 : 6), k = 4 + r() * 5; disc(g, x, y + 1, k, '#d87aa0'); disc(g, x - 1, y, k, '#f2a8c4'); disc(g, x - 2, y - 1, k * 0.5, '#ffd8e6'); }
  }
  const ropeway = (label, name, go) => () => rideTo({ label, name, go, spr: SPR.rope, speed: 26, dur: 4.2 });

  // ---------- the lake ----------
  MAPS.kawaguchiko = { name: 'KAWAGUCHIKO', sub: 'MOUNT FUJI ACROSS A QUIET LAKE', tw: 60, th: 46, music: 'fuji', lookUp: [372, 440],
    zones: [[440, 284, 530, 350, 'THE PIER', 'A JETTY OUT INTO THE LAKE'], [0, 384, 280, 600, 'CHUREITO PAGODA', 'A HILLSIDE STAIR TO A RED PAGODA'], [576, 340, 960, 540, 'OISHI PARK', 'LAVENDER AND KOCHIA BY THE WATER'],
      [280, 400, 576, 600, 'LAKESIDE INN', 'HOT SPRINGS WITH A VIEW'], [0, 600, 960, 736, 'KAWAGUCHIKO', 'A LAKE TOWN UNDER THE MOUNTAIN'], [0, 176, 960, 400, 'LAKE KAWAGUCHI', 'THE CLASSIC VIEW OF FUJI']],
    lay() {
      tRect(FR, 0, 0, 60, 46);
      tRect(GR, 1, 10, 59, 26); tOval(GR, 30, 26, 14, 3);
      tRect(WA, 0, 0, 60, 18.7); tOval(WA, 30, 18.7, 25, 2.2); tOval(WA, 47, 18.7, 6, 0.9); tOval(WA, 12, 18.7, 5, 0.6);
      // the pagoda hill: two terraces stepping up toward the lake, walled in by trees
      tRect(GR, 1, 24.5, 16.5, 41); tRect(FR, 1, 22.5, 16.5, 24.5); tRect(FR, 16.5, 22.5, 18.5, 37);
      tRect(GR, 18.5, 26, 36.5, 41); tRect(GR, 36.5, 22, 59, 41); tRect(FR, 35.5, 26, 37, 33.5);
      tRect(PV, 1, 41, 59, 44.5);
      const P = (pts, w) => tRoad(DT, pts, w || 0.7, GR);
      P([[1.5, 21.2], [10, 20.6], [18, 22], [24, 22.6], [30, 22], [36, 22.4], [44, 21], [52, 21], [58.5, 21.6]], 0.8);
      P([[30.5, 41], [30.5, 36], [29.8, 30], [30.5, 26], [30.5, 21.5]]); P([[19, 38.5], [22, 34], [26, 31], [29.8, 30]], 0.6); P([[22, 41], [22, 35.6]], 0.6);
      P([[30.2, 30], [35, 31], [38, 34.5], [44, 34.6], [47.5, 34.4]], 0.6); P([[47.5, 34.4], [47.5, 36.5], [52, 38.5], [54.5, 41]], 0.6);
      P([[47.5, 32.5], [47.5, 28], [44, 25], [40, 22.4]], 0.6); P([[47.5, 28], [52, 26], [56, 22]], 0.6);
      P([[12.5, 41.2], [12.5, 36.8]]); P([[12.5, 35.5], [8, 33], [4.5, 31]], 0.6); P([[4.5, 29.5], [6, 27], [10, 26.4]], 0.6);
    },
    deco() {
      const g = M.ground.g;
      horizon(SPR.fujiBig, 176, 116, { x: 480, y: 92, sc: 0.85, peak: 88 }, [[452, 296, 64, 22], [468, 312, 32, 30]]);
      // ---- the pagoda hill
      ledge([[16, 480], [140, 478], [264, 481]], 12, 'stone'); steps(72, 480, 24, 16);
      ledge([[16, 576], [140, 574], [264, 577]], 12, 'stone'); steps(200, 576, 24, 16);
      put(SPR.pagoda, 104, 452, 52, 130); block(78, 436, 130, 452);
      fujiSpot('kw_chureito', 168, 464, 'TAKE A PHOTO', ['THE RED PAGODA, THE CHERRY BLOSSOM, AND FUJI FLOATING BEHIND THEM.', 'IT IS THE PICTURE ON EVERY POSTER OF JAPAN. NOW IT IS YOURS TOO.'], 16, { photo: chureitoPhoto });
      for (const [x, y] of [[36, 420], [228, 420], [246, 462], [30, 548], [112, 520], [244, 540], [40, 620], [150, 628], [250, 630]]) plant('sakura', x, y, 1);
      signpost(232, 652, ['CHUREITO PAGODA. 398 STEPS TO THE TOP.', '(SOMEONE HAS SCRATCHED OUT 398 AND WRITTEN "MANY".)']);
      npc('granny', 150, 548, { rad: 16, lines: ['TAKE THE STEPS SLOWLY. THE PAGODA IS NOT GOING ANYWHERE.', 'FROM THE TOP, THE MOUNTAIN LOOKS CLOSE ENOUGH TO TOUCH.'] });
      npc('tourist', 196, 448, { dir: 'u', lines: ['I HAVE BEEN HERE SINCE SUNRISE WAITING FOR THE CLOUDS TO MOVE.', 'THEY MOVE. THEN THEY COME BACK. THEN THEY MOVE.'] });
      // ---- the pier and the lake
      bridge(472, 314, 496, 340, '#8a6a48', '#b8905a'); R(g, 452, 296, 64, 20, '#b8905a'); for (let x = 452; x < 516; x += 4) R(g, x, 296, U, 20, '#8a6a48'); R(g, 452, 296, 64, U, '#d8b07a'); R(g, 452, 316, 64, 3, 'rgba(20,30,60,0.3)'); block(452, 296, 516, 316, 0);
      for (const x of [452, 512]) { prop('post', x + 2, 314, 2); }
      fujiSpot('kw_mirror', 484, 304, 'LOOK ACROSS', ['THE WATER IS SO STILL THAT THERE ARE TWO FUJIS, ONE THE RIGHT WAY UP.', 'A FISH JUMPS AND THE SECOND MOUNTAIN SHIVERS.'], 16, { photo: mirrorPhoto });
      for (const [x, y] of [[392, 320], [566, 314], [640, 306], [300, 308]]) put(SPR.swan, x, y, 11, 17);
      npc('tourist', 530, 352, { rad: 20, lines: ['MY CAMERA HAS FOUR HUNDRED PHOTOS OF A CLOUD.', 'THE MOUNTAIN IS IN THERE SOMEWHERE.'] });
      npc('kid', 380, 360, { rad: 24, lines: ['WHY IS THE TOP WHITE?', 'IS IT SUGAR?'] });
      for (const [x, y] of [[90, 330], [210, 354], [330, 386], [620, 380], [700, 350], [860, 352], [930, 380]]) plant(hsh(x, y) < 0.5 ? 'sakura' : 'green2', x, y, 1);
      for (const x of [150, 420, 560, 800]) prop('bench', x, 372, 9);
      // ---- Oishi park: lavender rows and kochia on a raised bank
      ledge([[584, 528], [700, 526], [820, 530], [944, 527]], 11, 'earth'); steps(760, 528, 24, 15, '#b89868');
      for (let y = 382; y < 514; y += 11) for (let x = 600; x < 800; x += 6) { if (terr(x, y) !== GR || terr(x - 4, y) !== GR || terr(x + 4, y) !== GR || terr(x, y + 3) !== GR) continue; R(g, x - 3, y + 1, 7, 1.5, '#3c8440'); ell(g, x, y - 1, 3.6, 2.6, '#6a4aa8'); ell(g, x - 0.5, y - 2, 3, 2, hsh(x, y) < 0.5 ? '#8a6ac8' : '#9a78d8'); p1(g, x - 1.5, y - 3, '#d0c0f8'); p1(g, x + 1, y - 2.5, '#b8a0f0'); }
      for (let y = 392; y < 512; y += 22) for (let x = 812 + (y / 22 & 1) * 11; x < 930; x += 22) if (terr(x, y) === GR && !hit(x, y)) { const k = SPR.kochia[(x / 11 + y) % 3 ? 0 : 1]; put(k, x, y, k.lw / 2, k.lh - 1); block(x - 6, y - 5, x + 6, y); M.SHD.push([x, y, 8, 2]); }
      stampSpot('kw_flowers', 700, 470, 'TAKE A PHOTO', 'snap', ['ROWS OF LAVENDER RUN DOWN TO THE WATER, AND THE BEES ARE VERY BUSY.', 'THE ROUND BUSHES TURN BRIGHT RED IN AUTUMN. RIGHT NOW THEY ARE FLUFFY AND GREEN.']);
      prop('stall', 640, 560, 13); npc('office', 640, 572, { tint: '#8a6ac8', lines: ['LAVENDER SOFT SERVE! IT TASTES LIKE A FIELD!', 'A NICE FIELD. NOT A MUDDY ONE.'] }); prop('bench', 720, 566, 9);
      npc('kimono', 880, 440, { rad: 24, lines: ['THE PARK IS NAMED AFTER THE BIG STONE BY THE GATE.', 'NOBODY LOOKS AT THE STONE. EVERYONE LOOKS AT FUJI.'] }); M.ACT.push({ cat: true, id: 'field', x: 610, y: 456, k: 0 });
      // ---- the inn, the town and the ropeway
      house(352, 560, 84, 30, { sign: 'LAKESIDE INN', noren: '#3f7ab0', rh: 16, lantern: true, to: 'k_onsen' });
      for (const [x, y] of [[300, 520], [412, 516], [470, 470]]) plant('maple', x, y, 1); prop('lanternM', 300, 572, 4); prop('lanternM', 406, 572, 4); M.ACT.push({ cat: true, id: 'inn', x: 428, y: 584, k: 2 });
      house(320, 656, 52, 26, { sign: 'GIFTS', noren: '#5a8a5a', rh: 14 }); tower(416, 656, 92, 44, { c: '#e8d8c0', sign: 'KAWAGUCHIKO', sc: '#c8382e', wc: '#bfe8ff', gx: 7, ww: 4, roofCol: '#a84a38' }); shinkansen(416, 656); M.st = [416, 674];
      prop('busstop', 520, 650, 2); npc('salary', 534, 662, { lines: ['THE RETRO BUS GOES ROUND THE LAKE EVERY FIFTEEN MINUTES.', 'I HAVE BEEN WAITING FOR TWENTY. THAT IS ALSO TRADITIONAL.'] });
      house(600, 656, 56, 28, { sign: 'HOTO', noren: '#c8382e', rh: 14, lantern: true, to: 'k_hoto' }); house(668, 656, 50, 26, { sign: 'CAFE', noren: '#8a5a3a', rh: 14 }); house(736, 656, 50, 26, { sign: 'MUSIC BOX', noren: '#8a6aff', rh: 14 });
      tower(880, 656, 76, 50, { c: '#d8c8b0', sign: 'ROPEWAY', sc: '#e0563f', wc: '#bfe8ff' }); M.SPOTS.push({ x: 880, y: 663, r: 14, label: 'RIDE THE ROPEWAY', fn: ropeway('ROPEWAY UP TO', 'MT KACHIKACHI', ['k_summit']) });
      for (const x of [260, 470, 790]) prop('vend', x, 652, 6); for (const x of [180, 560, 820]) prop('lamp', x, 712, 2);
      npc('granny', 300, 690, { lines: ['ON A CLEAR WINTER MORNING YOU CAN SEE EVERY LINE OF SNOW ON IT.', 'IN SUMMER IT HIDES ALL DAY. MOODY MOUNTAIN.'] }); npc('teen', 700, 690, { rad: 30, tint: '#5aa8e0', lines: ['THE ROPEWAY TAKES THREE MINUTES. THE VIEW TAKES YOUR BREATH AWAY.', 'THERE IS A BELL AT THE TOP. RING IT WITH SOMEONE YOU LIKE.'] });
      crowd(4, 60, 700, 940, 700, 6); crowd(3, 940, 676, 60, 676, 6);
      wild(['green', 'pine', 'green2', 'pine', 'green']); M.LIGHTS = [];
    } };

  // ---------- the top of the ropeway ----------
  MAPS.k_summit = { name: 'MT KACHIKACHI', sub: 'THE TANUKI AND THE RABBIT', tw: 40, th: 24, music: 'fuji', lookUp: [150, 230],
    lay() { tRect(FR, 0, 0, 40, 24); tRect(WA, 0, 0, 40, 6.75); tRect(PL, 8, 6.5, 32, 9); tOval(GR, 20, 15, 15, 7.5); tRect(GR, 15, 18, 25, 24); tRoad(DT, [[20, 23.5], [20, 15], [14, 13], [12, 10.5]], 0.6, GR); tRoad(DT, [[20, 15], [26, 13], [28, 10.5]], 0.6, GR); },
    deco() {
      horizon(SPR.fujiS, 108, 0, { x: 320, y: 14, sc: 0.75, peak: 100 }); block(0, 0, 640, 112);
      fujiSpot('kw_summit', 320, 124, 'TAKE A PHOTO', ['FROM UP HERE THE LAKE IS A MIRROR AND THE TOWN IS A TOY.', 'AND FUJI FILLS THE WHOLE SKY, AS IF IT WERE STANDING RIGHT BEHIND YOU.'], 18);
      put(SPR.bellH, 320, 200, 15, 33); block(308, 194, 332, 200); stampSpot('kw_bell', 320, 210, 'RING THE BELL', 'bow', ['DONG. THE SOUND ROLLS DOWN THE HILL AND OUT OVER THE WATER.', 'THEY SAY IF TWO PEOPLE RING IT TOGETHER, THEY STAY TOGETHER.']);
      prop('tanuki', 200, 212, 7); prop('usagi', 440, 212, 6);
      M.SPOTS.push({ x: 200, y: 220, r: 12, label: 'READ', lines: ['AN OLD STORY: A TANUKI PLAYED TRICKS ON A FARMER, AND A CLEVER RABBIT GOT EVEN.', 'THE MOUNTAIN IS NAMED FOR THE CRACKLE OF THE FIRE IN THE STORY. KACHI KACHI.'] });
      prop('stall', 430, 268, 13); const d = npc('granny', 430, 280, { lines: ['DANGO!'] }); d.spot = { label: 'BUY DANGO', stamp: 'kw_dango', act: 'hold', fx: 'munch', lines: ['THREE SOFT DUMPLINGS ON A STICK, GRILLED AND BRUSHED WITH SWEET SOY.', 'THE STICK HAS A LITTLE TANUKI BURNED INTO IT.'] };
      tower(320, 368, 70, 34, { c: '#d8c8b0', sign: 'ROPEWAY', sc: '#e0563f', wc: '#bfe8ff', top: false }); M.SPOTS.push({ x: 320, y: 375, r: 13, label: 'RIDE DOWN', fn: ropeway('ROPEWAY DOWN TO', 'LAKE KAWAGUCHI', ['kawaguchiko', 880, 676, 'd']) }); M.st = [320, 380];
      for (const [x, y] of [[150, 170], [490, 170], [170, 290], [470, 300], [230, 330], [410, 330]]) plant(hsh(x, y) < 0.5 ? 'pine' : 'maple', x, y, 1); prop('bench', 250, 150, 9); prop('bench', 390, 150, 9);
      npc('teen', 352, 132, { dir: 'u', tint: '#f06a8c', lines: ['WE RANG THE BELL. NOW WE HAVE TO STAY TOGETHER FOREVER.', 'HE SAYS HE DID NOT KNOW THAT. HE IS STAYING ANYWAY.'] }); npc('salary', 262, 140, { dir: 'u', lines: ['I COME UP AT LUNCH. IT IS CHEAPER THAN THERAPY.'] }); M.ACT.push({ cat: true, id: 'top', x: 470, y: 240, k: 1 });
      wild(['pine', 'green', 'maple']); M.LIGHTS = [];
    } };

  // ---------- rooms ----------
  MAPS.k_onsen = { indoor: 1, name: 'LAKESIDE INN - HOT SPRING', music: 'fuji', deco() {
    room({ wall: '#b8a888', floor: 'tile', t1: '#c8c4bc', t2: '#b8b4ac', mat: '#3f7ab0', art: (g, r) => {
      R(g, 50, 6, 220, 38, '#5a3a28'); dgrad(g, 52, 8, 216, 32, ['#8ac4f0', '#b8dcf4', '#e8f0f4']); mountain(g, 160, 40, 72, 28, '#6a7ab8', r, '#f8f4ee'); R(g, 52, 36, 216, 4, '#5a8a7a'); for (const x of [104, 160, 216]) R(g, x, 8, 2, 32, '#5a3a28');
      ell(g, 160, 122, 96, 38, '#6b6478'); ell(g, 160, 120, 92, 35, '#8c8498'); for (let k = 0; k < 28; k++) { const a = k / 28 * 6.283; disc(g, 160 + Math.cos(a) * 88, 120 + Math.sin(a) * 32, 5 + (k * 7 % 3), k % 2 ? '#9a93a8' : '#7a7488'); }
      ell(g, 160, 122, 82, 28, '#5ab0c8'); ell(g, 156, 118, 70, 22, '#7ac8dc'); for (let k = 0; k < 12; k++) R(g, 100 + k * 10, 112 + (k * 7 % 18), 6, U, '#c8f0f8');
      for (const [x, y] of [[120, 104], [168, 98], [204, 108]]) { ell(g, x, y, 9, 3, 'rgba(255,255,255,0.35)'); ell(g, x + 4, y - 5, 6, 2.5, 'rgba(255,255,255,0.25)'); }
      R(g, 16, 150, 18, 10, '#c89a6a'); R(g, 16, 150, 18, 1, '#f0d0a0'); R(g, 286, 150, 18, 10, '#c89a6a'); R(g, 286, 150, 18, 1, '#f0d0a0');
    } });
    block(72, 88, 248, 154);
    M.SPOTS.push({ x: 160, y: 164, r: 14, label: 'SLIP INTO THE WATER', stamp: 'kw_onsen', act: 'hold', fx: 'wind', lines: ['HOT WATER FROM DEEP UNDER THE MOUNTAIN, AND FUJI FRAMED IN THE WINDOW.', 'EVERY MUSCLE YOU OWN SAYS THANK YOU.'] });
    npc('granny', 52, 160, { lines: ['TEN MINUTES IN, TEN MINUTES OUT. THEN AGAIN.', 'I HAVE DONE THIS EVERY DAY FOR FIFTY YEARS. LOOK AT MY SKIN.'] }); npc('salary', 270, 166, { tint: '#f4f1e6', lines: ['I HAVE BEEN IN SINCE LUNCH. I AM BASICALLY SOUP NOW.'] }); npc('kid', 220, 176, { rad: 20, lines: ['NO RUNNING, NO SPLASHING, NO SWIMMING. WHAT IS LEFT?', 'SITTING. JUST SITTING.'] });
    fur('plant', 20, 70); fur('plant', 300, 70);
  } };
  MAPS.k_hoto = { indoor: 1, name: 'HOTO NOODLE HOUSE', music: 'fuji', deco() {
    room({ wall: '#7a5a40', floor: 'tatami', mat: '#c8382e', art: (g, r) => { wallShelf(g, 20, 64, ['#f2c14e', '#e08a3a', '#f4f1e6', '#5aa85a'], r); poster(g, 100, 10, 56, 16, '#c8382e', 'HOTO 1200'); poster(g, 164, 10, 56, 16, '#e08a3a', 'PUMPKIN'); for (const x of [250, 290]) chochin(g, x, 12, '#e0452f'); } });
    fur('counter', 160, 84, 120, '#a8744a'); npc('chef', 140, 64, { lines: ['THICK NOODLES, PUMPKIN, MISO, ALL BUBBLING IN ONE IRON POT.', 'IT IS WHAT FARMERS ATE IN THE COLD. NOW EVERYONE DOES.'] });
    for (const [x, y, k] of [[70, 120, 1], [250, 120, 3], [70, 166, 2], [250, 166, 4]]) fur('table', x, y, k); eaters([50, 230], 118, ['THE PUMPKIN MELTS INTO THE SOUP. THAT IS THE BEST BIT.', 'I CANNOT FEEL MY TONGUE. WORTH IT.']); npc('tourist', 90, 164, { dir: 'l', lines: ['THE POT IS STILL BOILING ON THE TABLE. HOW?'] });
    const k = npc('kimono', 190, 66, { tint: '#c8382e', lines: ['WELCOME!'] }); k.spot = { label: 'ORDER HOTO', stamp: 'kw_hoto', act: 'hold', fx: 'slurp', lines: ['THE IRON POT ARRIVES STILL BUBBLING: FLAT NOODLES, PUMPKIN, MUSHROOMS AND MISO.', 'YOU BURN YOUR TONGUE ON THE FIRST BITE AND KEEP GOING ANYWAY.'] };
    fur('plant', 20, 176); fur('plant', 300, 176);
  } };

  city({
    id: 'kawaguchiko', name: 'KAWAGUCHIKO', tagline: 'MOUNT FUJI ACROSS A QUIET LAKE',
    start: 'kawaguchiko', hub: 'kawaguchiko', line: [], areas: AREAS, stamps: STAMPS, cats: 4,
    hud: () => ['fuji', clear() ? 'CLEAR' : 'CLOUDY'],
    sprites() {
      const scene = (w, h, cx, hw, mh, seed) => { const c = mk(w, h), g = c.g, r = RNG(seed);
        dgrad(g, 0, 0, w, h - 8, ['#7ab8e8', '#a8d4f0', '#dcecf4']); for (let k = 0; k < w / 120; k++) { const x = r() * w, y = 8 + r() * (h * 0.3); ell(g, x, y, 16 + r() * 18, 3, '#f4f8fc'); ell(g, x + 6, y - 2, 9, 2.5, '#ffffff'); }
        mountain(g, cx, h - 14, hw, mh, '#6a7ab8', r, '#f8f4ee'); for (let x = -20; x < w + 20; x += 34) ell(g, x + r() * 20, h - 14, 30 + r() * 20, 8 + r() * 5, '#5a8a8a');
        for (let x = 0; x < w; x += 3) { const t = 6 + hsh(x, seed) * 7; R(g, x, h - 8 - t, 3, t + 8, x % 9 ? '#3f6a4a' : '#4f7a5a'); p1(g, x + 1, h - 8 - t, '#5a8a5a'); } R(g, 0, h - 2, w, 2, '#2f5a6a'); return c; };
      SPR.fujiBig = scene(960, 176, 480, 170, 74, 3); SPR.fujiS = scene(640, 108, 320, 280, 86, 7);
      { const g = SPR.fujiS.g; R(g, 0, 100, 640, 8, '#8a6a48'); R(g, 0, 100, 640, 1, '#c4a070'); for (let x = 2; x < 640; x += 12) R(g, x, 94, 2, 14, '#8a6a48'); R(g, 0, 95, 640, 1.5, '#a8845a'); }
      SPR.rope = (() => { const c = mk(320, 84), g = c.g, r = RNG(21); dgrad(g, 0, 0, 320, 84, ['#7ab8e8', '#a8d4f0', '#e8f0f4']); mountain(g, 230, 50, 90, 46, '#6a7ab8', r, '#f8f4ee'); R(g, 0, 48, 320, 10, '#4a9ac8'); R(g, 0, 48, 320, 1, '#8ad0f0'); for (let x = 0; x < 320; x += 4) R(g, x, 52 + (x % 12 === 0 ? 2 : 0), 2, U, '#8ad0f0'); for (let x = -10; x < 330; x += 14) { const y = 58 + Math.sin(x / 40) * 4; ell(g, x, y + 14, 12, 16, '#4f7a5a'); ell(g, x + 4, y + 10, 7, 9, '#5a8a5a'); } line1(g, 0, 20, 320, 6, '#3a3346'); return c; })();
      variants('kochia', 2, (rnd, i) => { const c = mk(18, 16), g = c.g, col = i ? '#d8483a' : '#6ab85a'; ell(g, 9, 9.5, 8, 6, dark(col, 0.3)); ell(g, 9, 8.5, 7.5, 6, col); ell(g, 7, 6.5, 4, 3, lite(col, 0.3)); for (let k = 0; k < 14; k++) p1(g, 3 + rnd() * 12, 4 + rnd() * 9, dark(col, 0.2)); return outline(c); });
      one('tanuki', 22, 28, g => { ell(g, 11, 20, 8, 7, '#8a6a48'); ell(g, 11, 22, 5, 4, '#e8d8b0'); disc(g, 11, 10, 6, '#8a6a48'); R(g, 6, 9, 10, 3, '#3a2a28'); disc(g, 9, 10, 1, '#f4f1e6'); disc(g, 13, 10, 1, '#f4f1e6'); p1(g, 11, 12.5, '#1d1626'); ell(g, 11, 4.5, 9, 2, '#d8b860'); ell(g, 11, 3.5, 5, 2.5, '#e8c870'); R(g, 17, 16, 4, 7, '#c8a070'); R(g, 18, 14, 2, 2, '#c8a070'); R(g, 1, 26, 20, 2, '#6b6478'); }, 1);
      one('usagi', 16, 26, g => { ell(g, 8, 19, 6, 6, '#f4f1e6'); disc(g, 8, 10, 4.5, '#f4f1e6'); R(g, 5, 0, 2, 8, '#f4f1e6'); R(g, 9, 0, 2, 8, '#f4f1e6'); R(g, 5.5, 1, 1, 5, '#f0b8c0'); R(g, 9.5, 1, 1, 5, '#f0b8c0'); p1(g, 6.5, 10, '#c8382e'); p1(g, 9.5, 10, '#c8382e'); R(g, 1, 24, 14, 2, '#6b6478'); }, 1);
      one('bellH', 30, 34, g => { for (const x of [3, 25]) { R(g, x, 6, 2.5, 28, '#c0442f'); R(g, x, 6, U, 28, '#e86a50'); } for (let i = 0; i < 12; i++) { const a = i / 11 * 3.1416, x = 15 - Math.cos(a) * 11, y = 10 - Math.sin(a) * 8; R(g, x - 1, y - 1, 2.5, 2.5, '#e0452f'); } disc(g, 15, 13, 4, '#d9b04a'); R(g, 11, 13, 8, 4, '#d9b04a'); R(g, 11, 16.5, 8, 1, '#8a6a2a'); disc(g, 15, 18, 1, '#8a6a2a'); R(g, 1, 32, 28, 2, '#6b6478'); }, 1);
      icon('fuji', g => { for (let i = 0; i < 9; i++) R(g, 6 - i * 0.6, 2 + i, i * 1.2 + 1, 1, i < 3 ? '#f8f4ee' : '#6a7ab8'); R(g, 0, 10, 12, 2, '#5aa85a'); });
      icon('onsen', g => { ell(g, 6, 9, 5, 2.5, '#3f7ab0'); ell(g, 6, 8.5, 4, 1.8, '#7ac8dc'); for (const x of [3, 6, 9]) { R(g, x, 1, 1, 2, '#e0563f'); R(g, x + 1, 3, 1, 2, '#e0563f'); R(g, x, 5, 1, 2, '#e0563f'); } });
      icon('pot', g => { ell(g, 6, 7, 5.5, 3.5, '#3a3a4e'); R(g, 0.5, 4.5, 11, 2, '#5a5a6e'); R(g, 2, 4, 8, 1.5, '#f2d98a'); R(g, 3, 3, 3, 1.5, '#e08a3a'); R(g, 7, 3, 2, 1.5, '#5aa85a'); R(g, 0, 5, 1, 1.5, '#3a3a4e'); R(g, 11, 5, 1, 1.5, '#3a3a4e'); });
      icon('flower', g => { for (const x of [2, 5, 8]) { R(g, x, 1 + (x % 2), 2, 6, '#8a6ac8'); R(g, x, 1 + (x % 2), 1, 6, '#b8a0f0'); R(g, x + 0.5, 7, 1, 4, '#5aa85a'); } });
    }
  });
})();
