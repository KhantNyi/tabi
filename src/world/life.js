'use strict';
// ---------- life: the small things that make a map feel lived in ----------
// Nothing here is a goal. People glance at you, step aside and greet you; shopkeepers call out as you pass; pigeons
// scatter, butterflies wander, a petted cat tags along for a bit. Every so often a little scene plays nearby: a bicycle
// rings past, a crow lands on a lamp, a school group files by, two friends chat (and sometimes mention a stamp you have
// not found), a tourist asks you to take their photo, a festival shrine is carried down the street. Each place has its
// own sounds (water, birds, temple bells, the crossing chirp, station chimes, a busker), and footsteps change with the
// ground. Steam rises from noodle shops, smoke from stalls, leaves fall from trees, water glints, birds cross the sky.
// Scene actors are marked temp and live in M.ACT like everyone else, so they sort, draw and talk with no special code;
// they are cleared whenever you enter a map. Everything is local scenery, so friends in a room each see their own.
const LIFE = (function () {
  const rnd = Math.random, pick = a => a[rnd() * a.length | 0];
  let next = 9, ambT = 0, gap = 0, fx = [], sky = [], skyT = 12, leafT = 0, petalT = 0;
  const outdoors = () => !M.indoor, day = () => !M.indoor && !M.night, station = () => !!M.def.station;
  const dist = (x, y) => Math.hypot(x - pl.x, y - pl.y), loud = (x, y, r) => Math.max(0, 1 - dist(x, y) / r);
  const inView = (x, y, m) => x > G.cx - m && x < G.cx + W + m && y > G.cy - m && y < G.cy + H + m;
  const faceTo = (e, x, y) => { const dx = x - e.x, dy = y - e.y; e.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'l' : 'r') : (dy < 0 ? 'u' : 'd'); };
  const free = (x, y) => !hit(x, y) && !hit(x - 6, y) && !hit(x + 6, y) && x > 8 && x < M.w - 8 && y > 8 && y < M.h - 4;
  const paved = t => t === PV || t === PL || t === VL || t === DT;

  // ---------- sound ----------
  const S = () => Snd.ctx && Snd.ctx.state === 'running' ? Snd.ctx.currentTime + 0.01 : 0;
  const tone = (type, f, t, d, v, o) => Snd.tone(type, f, t, d, v, Object.assign({ bus: Snd.sfx }, o || {}));
  const SND = {
    ring() { const t = S(); if (t) for (let i = 0; i < 2; i++) { tone('triangle', 2700, t + i * 0.16, 0.12, 0.045, { pluck: 1 }); tone('triangle', 3400, t + i * 0.16 + 0.01, 0.1, 0.03, { pluck: 1 }); } },
    caw(v) { const t = S(); if (t) for (let i = 0; i < 2; i++) tone('sawtooth', 640, t + i * 0.3, 0.17, 0.04 * v, { slide: 430, lp: 1600 }); },
    chirp(v) { const t = S(); if (!t) return; const f = 2600 + rnd() * 1400, n = 2 + (rnd() * 3 | 0); for (let i = 0; i < n; i++) tone('sine', f, t + i * 0.09, 0.05, 0.022 * v, { slide: f * 1.35 }); },
    lap(v) { const t = S(); if (t) Snd.noise(t, 0.7, 0.035 * v, 150, 650, Snd.sfx); },
    piyo(v) { const t = S(); if (t) for (let i = 0; i < 4; i++) { tone('sine', 2500, t + i * 0.3, 0.07, 0.03 * v, { slide: 1900 }); tone('sine', 2200, t + i * 0.3 + 0.1, 0.07, 0.025 * v, { slide: 1700 }); } },
    bell(v) { const t = S(); if (t) for (const [m, a] of [[1, 0.09], [2.7, 0.03], [4.2, 0.015]]) tone('sine', 196 * m, t, 3.2, a * v, { pluck: 1 }); },
    chime(v) { const t = S(); if (t) ['E6', 'C6', 'D6', 'G5'].forEach((n, i) => tone('sine', nf(n), t + i * 0.34, 0.9, 0.03 * v, { pluck: 1, echo: 1 })); },
    drum(v) { const t = S(); if (t) { tone('sine', 120, t, 0.3, 0.14 * v, { slide: 50, pluck: 1 }); Snd.noise(t, 0.08, 0.05 * v, 80, 400, Snd.sfx); } },
    flutter(v) { const t = S(); if (t) for (let i = 0; i < 5; i++) Snd.noise(t + i * 0.035, 0.03, 0.04 * v, 600, 2600, Snd.sfx); },
    murmur() { const t = S(); if (t) Snd.noise(t, 0.9, 0.012, 250, 1100, Snd.sfx); },
    whoosh(v) { const t = S(); if (t) Snd.noise(t, 0.5, 0.05 * v, 120, 900, Snd.sfx); },
    note(f, v) { const t = S(); if (t) tone('triangle', f, t, 0.35, 0.05 * v, { pluck: 1, echo: 1 }); }
  };
  // footsteps follow the ground underfoot
  const NOLEAF = { pine: 1, bamboo: 1, snowpine: 1, palm: 1, bare: 1 };
  function foot() {
    const t = S(); if (!t) return; let k;
    if (M.indoor) k = M.floor === 'tatami' ? 'soft' : M.floor === 'wood' ? 'wood' : 'tile';
    else { const g = terr(pl.x, pl.y); k = g === GR || g === FR ? 'grass' : g === DT || g === VL ? 'gravel' : g === WA ? 'wood' : 'stone'; if (M.def.snow && k !== 'wood' && k !== 'stone') k = 'snow'; else if (M.def.sand && g === DT) k = 'sand'; }
    if (k === 'grass') Snd.noise(t, 0.05, 0.016, 250, 900, Snd.sfx);
    else if (k === 'gravel') { Snd.noise(t, 0.045, 0.022, 1600, 5000, Snd.sfx); Snd.noise(t + 0.03, 0.03, 0.014, 1600, 5000, Snd.sfx); }
    else if (k === 'wood') { tone('triangle', 150 + rnd() * 30, t, 0.05, 0.05, { pluck: 1 }); Snd.noise(t, 0.02, 0.01, 400, 1200, Snd.sfx); }
    else if (k === 'soft') Snd.noise(t, 0.06, 0.008, 300, 900, Snd.sfx);
    else if (k === 'snow') { Snd.noise(t, 0.07, 0.026, 700, 2600, Snd.sfx); Snd.noise(t + 0.04, 0.05, 0.016, 1400, 4200, Snd.sfx); }
    else if (k === 'sand') Snd.noise(t, 0.08, 0.014, 350, 1300, Snd.sfx);
    else if (k === 'tile') Snd.noise(t, 0.025, 0.02, 1200, 3200, Snd.sfx);
    else Snd.noise(t, 0.03, 0.02, 700, 2200, Snd.sfx);
  }

  // ---------- words ----------
  const GREET = { osaka: ['MOUKARIMAKKA!', 'HOW ARE YOU DOING?'], kyoto: ['OIDEYASU!', 'WELCOME TO KYOTO.'] };
  const SHOP = { osaka: 'MAIDO! COME ON IN!', kyoto: 'OIDEYASU! TAKE A LOOK!', bangkok: 'SAWASDEE KHA! COME IN!' };
  const greeting = n => { if (CITY.id === 'bangkok') return pick(['SAWASDEE KHA!', 'SAWASDEE KRAP!', 'HAVE A GOOD FLIGHT!', 'HELLO! WHERE ARE YOU FLYING?']); if (G.fit >= KIMONO && rnd() < 0.35) return pick(['WHAT A BEAUTIFUL KIMONO!', 'YOU LOOK LIKE A PAINTING IN THAT KIMONO.', 'KIMONO SUITS YOU!']);
    if (n.spot || n.F === LOOKS.chef) return CITY.id === 'osaka' ? 'MAIDO!' : 'IRASSHAIMASE!';
    return pick((M.night || DAY.dark() > 0.5 ? ['KONBANWA!', 'GOOD EVENING.', 'NICE NIGHT FOR A WALK.'] : ['KONNICHIWA!', 'HELLO!', 'NICE DAY FOR A WALK.']).concat(GREET[CITY.id] || [])); };
  const CHATS = [
    ['DID YOU EAT YET?', 'NOT YET. RAMEN?', 'IT IS ALWAYS RAMEN WITH YOU.'], ['MY BOSS CALLED AGAIN.', 'ON A SUNDAY?', 'HE SAYS SUNDAY IS A STATE OF MIND.'],
    ['I THINK WE ARE LOST.', 'WE ARE NOT LOST. WE ARE EXPLORING.', 'EXPLORING IS LOST WITH A SMILE.'], ['LOOK, A CAT!', 'WHERE?', '...IT LEFT. CATS DO THAT.'],
    ['THE LAST TRAIN IS AT MIDNIGHT.', 'PLENTY OF TIME.', 'YOU SAID THAT LAST WEEK.'], ['MY FEET HURT.', 'WE HAVE ONLY WALKED TEN THOUSAND STEPS.', 'EXACTLY.'],
    ['IS IT GOING TO RAIN?', 'THE APP SAYS SUNNY.', 'THE APP SAID SUNNY YESTERDAY TOO.'], ['I BOUGHT ANOTHER KEYCHAIN.', 'THAT IS YOUR NINTH.', 'EACH ONE IS DIFFERENT!'],
    ['HOW DO YOU SAY THANK YOU AGAIN?', 'ARIGATOU.', 'ARIGATOU! ...BUT TO WHOM?'], ['THAT MACHINE SELLS HOT CORN SOUP.', 'IN A CAN?', 'IN A CAN. LIFE IS GOOD.'],
    ['I LOVE THIS CITY.', 'YOU SAY THAT EVERYWHERE.', 'I LOVE EVERYWHERE.'], ['SHOULD WE TAKE A TAXI?', 'THE DOORS OPEN BY THEMSELVES.', 'THEN YES. OBVIOUSLY YES.']];
  const LOCAL = { osaka: [['THIS TAKOYAKI IS TOO HOT.', 'THEN WAIT.', 'I CANNOT WAIT. THAT IS THE PROBLEM.']], kyoto: [['HOW MANY TEMPLES TODAY?', 'SEVEN.', 'MY KNEES SAY FIVE.']],
    nara: [['A DEER ATE MY TICKET.', 'DID IT BOW FIRST?', 'IT DID. VERY POLITE.']], kawaguchiko: [['CAN YOU SEE THE TOP?', 'NOT RIGHT NOW.', 'IT IS SHY. LIKE YOU.']], tokyo: [['WHICH EXIT?', 'THERE ARE TWO HUNDRED EXITS.', 'THEN ANY OF THEM.']] };
  function chatLines() { // half the time, a tip about a stamp in this city you have not found yet
    const left = Object.keys(CITY.stamps || {}).filter(k => !G.stamps[k]);
    if (left.length && rnd() < 0.5) { const s = CITY.stamps[pick(left)], a = (areas(CITY) || []).find(q => q[0] === s[2]), here = s[2] === M.id || (M.def.city === CITY.id && !(CITY.line || []).length);
      return ['EVERYONE SAYS ' + s[0] + ' IS A MUST.', 'WHERE IS THAT?', here ? 'SOMEWHERE AROUND HERE, I THINK.' : 'OVER IN ' + (a ? a[1] : 'THE NEXT DISTRICT') + '.']; }
    return pick(CHATS.concat(LOCAL[CITY.id] || []));
  }

  // ---------- temporary actors ----------
  const person = (look, x, y, o) => { const a = Object.assign({ temp: 1, F: look, x, y, dir: 'd', mv: false, wt: rnd(), ph: rnd() * 7, sayT: 0, li: 0 }, o); M.ACT.push(a); return a; };
  function walk(a, tx, ty, sp, dt) { const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy); if (d < 1.5) { a.mv = false; return true; } a.x += dx / d * Math.min(d, sp * dt); a.y += dy / d * Math.min(d, sp * dt); a.mv = true; a.wt += dt; faceTo(a, tx, ty); return false; }
  const bubble = (x, y, s) => { const b = { temp: 1, x, y, sayT: 0, draw() { }, upd(e) { if (e.sayT <= 0) e.dead = 1; } }; M.ACT.push(b); say(b, s); };
  // a straight walkable line across the view, off the road, for things that pass by
  function row() {
    const ys = []; for (let y = G.cy + H * 0.3; y < Math.min(M.h - 10, G.cy + H - 14); y += 6) ys.push(Math.round(y)); ys.sort(() => rnd() - 0.5);
    const x0 = Math.max(10, G.cx - 30), x1 = Math.min(M.w - 10, G.cx + W + 30);
    for (const y of ys) { if (Math.abs(y - pl.y) < 10) continue; let ok = 0, n = 0; for (let x = x0; x < x1; x += 12) { n++; if (!hit(x, y) && !hit(x, y - 5) && terr(x, y) !== AS && terr(x, y) !== WA) ok++; } if (n > 6 && ok / n > 0.93) return { y, x0, x1 }; }
    return null;
  }
  function spot(minD, maxD) { for (let i = 0; i < 30; i++) { const x = G.cx + 30 + rnd() * (W - 60), y = G.cy + 40 + rnd() * (H - 60), d = dist(x, y); if (d > minD && d < maxD && free(x, y) && free(x + 16, y) && terr(x, y) !== AS && terr(x, y) !== WA) return [Math.round(x), Math.round(y)]; } return null; }
  const busy = () => M.ACT.some(a => a.scene);

  // ---------- scenes ----------
  const SCENES = {
    bike: { ok: () => outdoors() && !station() && (M.hs.length || M.CARS.length || paved(terr(pl.x, pl.y))), go() {
      const r = row(); if (!r) return false; const dir = rnd() < 0.5 ? 1 : -1, F = look(pick(WALK), pick(WCOL));
      M.ACT.push({ temp: 1, scene: 1, F, x: dir > 0 ? r.x0 - 30 : r.x1 + 30, y: r.y, v: dir, rang: 0, sayT: 0, wt: 0,
        upd(e, dt) { const ahead = (pl.x - e.x) * e.v, slow = Math.abs(pl.y - e.y) < 12 && ahead > 0 && ahead < 46; e.x += e.v * (slow ? 22 : 68) * dt; e.wt += dt;
          if ((!e.rang && inView(e.x, e.y, 0)) || (slow && e.rang < 2 && ahead < 30)) { e.rang++; SND.ring(); if (e.rang === 2) say(e, pick(['SUMIMASEN!', 'COMING THROUGH!'])); }
          if (e.v > 0 ? e.x > G.cx + W + 60 : e.x < G.cx - 60) e.dead = 1; },
        draw(e, x, y) { const fi = e.v < 0 ? 1 : 0, w = e.wt * 9; ell(ctx, x, y, 11, 2, 'rgba(22,30,50,0.3)'); const fr = e.F.s.idle0[fi], px = x + Math.cos(w) * 2, py = y - 6 + Math.sin(w) * 2; ctx.drawImage(fr, 0, 0, fr.lw, 18, snap(x - 10 - e.v * 1), snap(y - 27.5), fr.lw, 18); line1(ctx, x - e.v * 1, y - 10, px, py, '#3a3a52'); line1(ctx, x - e.v * 1 + 0.5, y - 10, px + 0.5, py, '#3a3a52');
          for (const wx of [-7, 7]) { disc(ctx, x + wx, y - 4, 4.2, '#2a2430'); disc(ctx, x + wx, y - 4, 3, '#c8c0d4'); disc(ctx, x + wx, y - 4, 2.2, '#2a2430'); R(ctx, x + wx + Math.cos(w) * 1.8 - 0.5, y - 4.5 + Math.sin(w) * 1.8, 1, 1, '#c8c0d4'); }
          line1(ctx, x - 7, y - 4, x - 1, y - 9, '#c8382e'); line1(ctx, x - 1, y - 9, x + 7, y - 4, '#c8382e'); line1(ctx, x - 1, y - 9, x + 4 * (e.v || 1), y - 11, '#c8382e'); R(ctx, x - 3, y - 11, 4, 1, '#2a2430'); R(ctx, x + 5 * e.v - 1, y - 12, 3, 1, '#6b6478'); } });
      return true; } },
    gust: { w: 0.6, ok: () => outdoors() && day() && !station(), go() {
      const pal = M.def.petals ? ['#f9a8c8', '#ffe0ec', '#f9a8c8'] : CITY.id === 'kyoto' || CITY.id === 'nara' ? ['#d9602c', '#f2c14e', '#6aa85a'] : ['#6aa85a', '#8fd070', '#d8c890'];
      for (let i = 0; i < 26; i++) fx.push({ k: 'leaf', x: G.cx - 20 - rnd() * 80, y: G.cy + rnd() * H, vx: 70 + rnd() * 50, vy: -6 + rnd() * 12, t: 0, life: 4 + rnd() * 2, c: pick(pal), ph: rnd() * 6 });
      SND.whoosh(1); return true; } },
    crow: { w: 0.7, ok: () => outdoors() && day() && !station(), go() {
      const lamps = M.OBJ.filter(o => (o.spr === SPR.lamp || o.spr === SPR.lanternM || o.spr === SPR.sign) && inView(o.x, o.y, -10)); const o = lamps.length ? pick(lamps) : null, sp = o ? null : spot(40, 200); if (!o && !sp) return false;
      const tx = o ? o.x + (o.spr === SPR.lamp ? -5 : 0) : sp[0], ty = o ? o.y + 1 : sp[1], tz = o ? (o.spr === SPR.lamp ? 31 : o.spr === SPR.sign ? 20 : 24) : 0;
      M.ACT.push({ temp: 1, scene: 1, x: tx + 120, y: ty, z: tz + 90, tx, tz, st: 0, t: 0, sayT: 0, fl: 1,
        upd(e, dt) { e.t += dt; if (e.st === 0) { e.x += (e.tx - e.x) * Math.min(1, dt * 2.2); e.z += (e.tz - e.z) * Math.min(1, dt * 2.2); if (Math.abs(e.x - e.tx) < 1.5) { e.st = 1; e.t = 0; } }
          else if (e.st === 1) { if (e.t > 0.6 && !e.cawed) { e.cawed = 1; SND.caw(Math.max(0.3, loud(e.x, e.y, 240))); } if (e.t > 6.5 || dist(e.x, e.y) < 22) { e.st = 2; e.fl = 0; if (dist(e.x, e.y) < 22) SND.flutter(0.7); } }
          else { e.x -= 90 * dt; e.z += 70 * dt; if (e.z > 240) e.dead = 1; } },
        draw(e, x, y) { const fly = e.st !== 1, f = Math.sin(e.t * 22) > 0, s = e.fl ? -1 : 1; if (e.tz === 0 || fly) ell(ctx, x, y, 3, 1, 'rgba(22,30,50,0.25)'); const yy = y - e.z;
          ell(ctx, x, yy - 3, 4, 2.4, '#1d1626'); disc(ctx, x + 3 * s, yy - 5, 1.8, '#1d1626'); R(ctx, x + 4.5 * s - (s < 0 ? 2 : 0), yy - 5.3, 2, 0.8, '#3a3346'); p1(ctx, x + 3.4 * s, yy - 5.6, '#c8c0d4');
          if (fly) { R(ctx, x - 6, yy - (f ? 7 : 3), 5, 1.2, '#2a2430'); R(ctx, x + 1, yy - (f ? 7 : 3), 5, 1.2, '#2a2430'); } else { R(ctx, x - 4 * s - 1, yy - 2.5, 3, 1, '#2a2430'); p1(ctx, x - 0.5, yy - 0.5, '#3a3346'); p1(ctx, x + 1, yy - 0.5, '#3a3346'); } } });
      return true; } },
    school: { w: 0.7, ok: () => outdoors() && day() && !station(), go() {
      const r = row(); if (!r) return false; const dir = rnd() < 0.5 ? 1 : -1, x0 = dir > 0 ? r.x0 - 20 : r.x1 + 20, end = dir > 0 ? r.x1 + 120 : r.x0 - 120;
      const kids = [0, 1, 2, 3, 4].map(i => person(look(i < 4 ? 'kid' : 'office', i < 4 ? null : '#3f7ab0'), x0 - dir * i * 15, r.y + (i % 2 ? 3 : -2), { scene: 1, i, end }));
      for (const k of kids) k.upd = (e, dt) => { if (walk(e, e.end, e.y, 26, dt)) e.dead = 1; if (e.i === 4 && !e.said && inView(e.x, e.y, -30)) { e.said = 1; say(e, 'STAY TOGETHER, EVERYONE!'); } if (e.i === 1 && !e.said && inView(e.x, e.y, -60)) { e.said = 1; say(e, pick(['CAN WE GET ICE CREAM?', 'LOOK! A TOURIST!', 'I CAN SEE A CAT!'])); } };
      return true; } },
    chat: { ok: () => outdoors() || M.ACT.length < 9, go() {
      const s = spot(50, 150); if (!s) return false; const L = chatLines(), a = person(look(pick(WALK), pick(WCOL)), s[0], s[1], { dir: 'r', lines: [L[0], L[2]], li: 0 }), b = person(look(pick(WALK), pick(WCOL)), s[0] + 16, s[1], { dir: 'l', lines: [L[1]], li: 0 });
      Object.assign(a, { scene: 1, L, k: 0, t: 1.2, upd(e, dt) { if (e.k < 99) { e.t -= dt; if (e.t <= 0 && e.k < e.L.length) { say(e.k % 2 ? b : a, e.L[e.k]); e.t = 1.8 + e.L[e.k].length * 0.05; e.k++; } else if (e.t <= -6 && e.k >= e.L.length) { e.k = 99; e.leave = 1; b.leave = 1; } } } });
      for (const p of [a, b]) { const u = p.upd; p.upd = (e, dt) => { if (u) u(e, dt); if (e.leave && e.sayT <= 0) { if (walk(e, e.x + (e === a ? -400 : 400), e.y, 22, dt) || !inView(e.x, e.y, 40)) e.dead = 1; } else if (!e.leave) { e.mv = false; if (dist(e.x, e.y) < 26 && e.sayT <= 0) faceTo(e, pl.x, pl.y); else e.dir = e === a ? 'r' : 'l'; } }; }
      return true; } },
    photo: { w: 0.6, ok: () => outdoors() && !station(), go() {
      const s = spot(110, 190); if (!s) return false;
      const a = person(look('tourist', pick(WCOL)), s[0], s[1], { scene: 1, st: 0, t: 0, lines: ['COULD YOU TAKE OUR PHOTO?'],
        upd(e, dt) { e.t += dt;
          if (e.st === 0) { if (walk(e, pl.x + (e.x < pl.x ? -18 : 18), pl.y, 34, dt) || e.t > 6) { e.st = 1; e.t = 0; faceTo(e, pl.x, pl.y); say(e, 'EXCUSE ME! COULD YOU TAKE OUR PHOTO?'); } }
          else if (e.st === 1) { faceTo(e, pl.x, pl.y); e.mv = false; if (e.t > 12 || dist(e.x, e.y) > 90) { e.st = 3; e.t = 0; say(e, 'NEVER MIND! HAVE A NICE DAY!'); } }
          else if (e.st >= 2) { if (e.t > 2.2 && (walk(e, e.x + (e.x < pl.x ? -500 : 500), e.y, 26, dt) || !inView(e.x, e.y, 40))) e.dead = 1; } },
        use(e) { if (e.st !== 1) return; e.st = 2; e.t = 0; e.use = null; pl.dir = e.x < pl.x ? 'l' : 'r'; Snd.fx('shutter'); G.flash = 0.6; G.fx.push({ x: e.x, y: e.y - 18, t: 0, icon: 'heart' }); setTimeout(() => say(e, 'ARIGATOU! HAVE A GREAT TRIP!'), 400); },
        label: () => 'TAKE THEIR PHOTO' });
      return !!a; } },
    matsuri: { w: 0.25, ok: () => outdoors() && day() && !station(), go() {
      const r = row(); if (!r) return false; const dir = rnd() < 0.5 ? 1 : -1, x0 = dir > 0 ? r.x0 - 40 : r.x1 + 40, end = dir > 0 ? r.x1 + 160 : r.x0 - 160, y = r.y, F = look('yukata', '#f4f1e6'), D = look('yukata', '#c8382e');
      const crew = []; for (let i = 0; i < 6; i++) crew.push(person(F, x0 + (i % 3 - 1) * 15 * dir, y + (i < 3 ? -6 : 6), { scene: 1, end: end + (i % 3 - 1) * 15 * dir, dy: 0 }));
      crew.push(person(D, x0 + 40 * dir, y, { scene: 1, end: end + 40 * dir, drum: 1 }));
      const box = { temp: 1, scene: 1, x: x0, y: y + 0.5, sayT: 0, end, t: 0, upd(e, dt) { e.t += dt; e.x += (dir * 18) * dt; if ((dir > 0 && e.x > e.end) || (dir < 0 && e.x < e.end)) e.dead = 1; if (inView(e.x, e.y, 30) && Math.floor(e.t / 0.55) !== Math.floor((e.t - dt) / 0.55)) SND.drum(Math.max(0.25, loud(e.x, e.y, 300))); },
        draw(e, x, y) { const b = Math.abs(Math.sin(e.t * 5.5)) * 2, yy = y - 26 - b; R(ctx, x - 26, yy + 10, 52, 2, '#6a4a30'); R(ctx, x - 26, yy + 10, 52, U, '#a8744a'); R(ctx, x - 9, yy - 3, 18, 13, '#c8382e'); R(ctx, x - 9, yy - 3, 18, 1, '#e86a50'); R(ctx, x - 9, yy + 4, 18, 1, '#f2c14e'); R(ctx, x - 3, yy, 6, 6, '#2a1a22'); R(ctx, x - 13, yy - 7, 26, 4, '#2a2430'); R(ctx, x - 11, yy - 9, 22, 2, '#3a3346'); disc(ctx, x, yy - 12, 2.2, '#f2c14e'); for (const s of [-1, 1]) { R(ctx, x + s * 12 - 1, yy - 6, 2, 3, '#f2c14e'); R(ctx, x + s * 8, yy + 9, 1, 4, '#f4f1e6'); } } };
      M.ACT.push(box);
      for (const c of crew) c.upd = (e, dt) => { e.x += dir * 18 * dt; e.mv = true; e.wt += dt; e.dir = dir > 0 ? 'r' : 'l'; if ((dir > 0 && e.x > e.end) || (dir < 0 && e.x < e.end)) e.dead = 1; if (!e.drum && inView(e.x, e.y, -20) && rnd() < dt * 0.35 && e.sayT <= 0) say(e, 'WASSHOI!'); if (e.drum && rnd() < dt * 0.2 && e.sayT <= 0) say(e, 'DON! DON!'); };
      return true; } }
  };

  // ---------- reactions ----------
  function react(dt) {
    gap -= dt;
    for (const n of M.ACT) {
      if (n.temp || !n.F) continue; const d = dist(n.x, n.y);
      if (n.pa) { // people walking a route step aside for you
        if (d < 14 && !(n.wait > 0) && !(n.dodge > 0)) { n.wait = 0.5; n.dodge = 3; faceTo(n, pl.x, pl.y); if (gap <= 0 && rnd() < 0.18) { say(n, pick(['SUMIMASEN!', 'OOPS, SORRY!', 'EXCUSE ME!'])); gap = 4; } }
        if (n.dodge > 0) n.dodge -= dt; continue;
      }
      // people standing about glance at you as you come close, and some say hello
      if (d < 30 && !n.near) { n.near = 1; if (!n.rad && n.dir0 == null) n.dir0 = n.dir; if (!n.rad) faceTo(n, pl.x, pl.y); n.look = 2.5;
        if (gap <= 0 && n.sayT <= 0 && !(n.hello > G.t) && rnd() < (n.spot ? 0.55 : 0.32)) { say(n, greeting(n)); n.hello = G.t + 45; gap = 3.5; } }
      else if (d > 40 && n.near) n.near = 0;
      if (n.look > 0) { n.look -= dt; if (!n.rad) { if (n.look > 0 && d < 34) faceTo(n, pl.x, pl.y); else if (n.look <= 0 && n.dir0 != null) { n.dir = n.dir0; n.dir0 = null; } } }
    }
    // shopkeepers call out as you pass their door
    for (const s of M.SPOTS) if (s.door && !M.indoor) { const d = dist(s.x, s.y); if (d < 26 && !(s.called > G.t) && gap <= 0 && rnd() < 0.5) { bubble(s.x, s.y - 4, SHOP[CITY.id] || 'IRASSHAIMASE!'); s.called = G.t + 30; gap = 3; } else if (d < 26) s.called = Math.max(s.called || 0, G.t + 30); }
    // a cat you have just petted follows you for a while
    for (const c of M.ACT) if (c.cat) { if (c.purr > 1.1) c.fol = 7; if (c.fol > 0) { c.fol -= dt; const dx = pl.x - c.x, dy = pl.y - c.y, d = Math.hypot(dx, dy); if (d > 20 && d < 140) step(c, dx / d * 34 * dt, dy / d * 34 * dt); } }
  }

  // ---------- creatures that live on a map ----------
  function pigeon(x, y) { M.ACT.push({ x, y, hx: x, hy: y, z: 0, st: 0, t: rnd() * 3, vx: 0, vy: 0, fl: rnd() < 0.5 ? 1 : -1, sayT: 0, peck: 0,
    upd(e, dt) { e.t -= dt;
      if (e.st === 0) { e.peck = Math.sin(G.t * 9 + e.hx) > 0.6 ? 1 : 0; if (e.t <= 0) { e.t = 1 + rnd() * 3; const nx = e.x + (rnd() - 0.5) * 10, ny = e.y + (rnd() - 0.5) * 6; if (!hit(nx, ny) && Math.hypot(nx - e.hx, ny - e.hy) < 26) { e.fl = nx < e.x ? -1 : 1; e.x = nx; e.y = ny; } }
        const scare = dist(e.x, e.y) < 24 || M.ACT.some(a => a.temp && a.F && Math.hypot(a.x - e.x, a.y - e.y) < 14); if (scare) { e.st = 1; e.t = 1.4 + rnd() * 0.6; const a = Math.atan2(e.y - pl.y, e.x - pl.x) + (rnd() - 0.5); e.vx = Math.cos(a) * 80; e.vy = Math.sin(a) * 40; e.fl = e.vx < 0 ? -1 : 1; if (!LIFE._fl || G.t - LIFE._fl > 0.5) { SND.flutter(loud(e.x, e.y, 200) + 0.2); LIFE._fl = G.t; } } }
      else if (e.st === 1) { e.x += e.vx * dt; e.y += e.vy * dt; e.z = Math.min(34, e.z + 60 * dt); if (e.t <= 0) { e.st = 2; e.t = 8 + rnd() * 6; } }
      else { if (e.t > 0) { e.x += e.vx * dt * 0.3; e.y += e.vy * dt * 0.3; if (e.t < 4 && dist(e.hx, e.hy) > 50) e.t = 0; } else { const dx = e.hx - e.x, dy = e.hy - e.y, d = Math.hypot(dx, dy); e.fl = dx < 0 ? -1 : 1; if (d > 2) { e.x += dx / d * Math.min(d, 70 * dt); e.y += dy / d * Math.min(d, 70 * dt); e.z = Math.min(34, d * 0.4); } else { e.z = 0; e.st = 0; e.t = 1 + rnd() * 2; } } } },
    draw(e, x, y) { const z = e.z, f = e.fl, fly = e.st > 0 && z > 1, yy = y - z; ell(ctx, x, y, fly ? 2.5 : 3, 1, 'rgba(22,30,50,0.25)');
      ell(ctx, x, yy - 2.5, 3.2, 2, '#8a8496'); ell(ctx, x - f * 1, yy - 3, 2, 1.2, '#a8a2b4'); const hy = yy - (e.peck && !fly ? 2.5 : 4.5); disc(ctx, x + f * 2.5, hy, 1.4, '#5a5468'); p1(ctx, x + f * 1.5, hy + 1, '#5a9a8a'); p1(ctx, x + f * 3.6, hy, '#e0a040');
      if (fly) { const w = Math.sin(G.t * 30 + e.hx) > 0; R(ctx, x - 5, yy - (w ? 6 : 3), 4, 1, '#6b6478'); R(ctx, x + 1, yy - (w ? 6 : 3), 4, 1, '#6b6478'); } else { p1(ctx, x - 0.5, yy - 0.5, '#e0563f'); p1(ctx, x + 1, yy - 0.5, '#e0563f'); } } }); }
  function butterfly(x, y, i) { const c = ['#f2c14e', '#f4f1e6', '#8ab0f0', '#f9a8c8'][i % 4]; M.ACT.push({ x, y, hx: x, hy: y, ph: rnd() * 6, c, sayT: 0, upd(e) { const t = G.t * 0.7 + e.ph; e.x = e.hx + Math.sin(t) * 26 + Math.sin(t * 2.3) * 8; e.y = e.hy + Math.cos(t * 0.8) * 12; },
    draw(e, x, y) { const z = 12 + Math.sin(G.t * 3 + e.ph) * 4, w = Math.abs(Math.sin(G.t * 16 + e.ph)) * 2 + 0.5; p1(ctx, x, y, 'rgba(22,30,50,0.25)'); R(ctx, x - w, y - z - 1, w, 2, e.c); R(ctx, x + U, y - z - 1, w, 2, e.c); R(ctx, x, y - z - 1, U, 2, '#2a2430'); } }); }
  function busker(x, y) { const n = npc('teen', x, y, { tint: '#3a3a4e', dir: 'd', lines: ['(SHE NODS AND KEEPS PLAYING.)', 'THIS ONE IS ABOUT THE LAST TRAIN HOME.', 'TIPS GO IN THE GUITAR CASE. SMILES ARE ALSO ACCEPTED.'] });
    n.busk = 1; n.draw = (e, sx, sy) => { ell(ctx, sx, sy, 6, 2, 'rgba(22,30,50,0.32)'); ctx.drawImage(frameOf(e), snap(sx - 10), snap(sy - 27)); const s = Math.sin(G.t * 8) > 0 ? 0.5 : 0; ell(ctx, sx + 1, sy - 11, 4, 3, '#c8864a'); disc(ctx, sx + 1, sy - 11, 1, '#3a2630'); R(ctx, sx + 3, sy - 16 - s, 7, 1.2, '#8a5a3a'); ell(ctx, sx + 7, sy + 3, 6, 2, '#3a2a28'); R(ctx, sx + 2, sy + 2, 10, 1, '#5a3a28'); };
    M.amb.push({ k: 'busk', x, y, r: 170, t: 0, i: 0 }); }

  // ---------- particles: steam, smoke, leaves ----------
  const FOOD = /RAMEN|UDON|NOODLE|HOTO|SOBA|SUSHI|TAKOYAKI|OKONOMIYAKI|KUSHIKATSU|YAKITORI|CREPE|MOCHI|TEA/;
  function build() {
    M.amb = []; M.emit = []; if (M.indoor) return;
    for (const s of M.SPOTS) {
      if (s.door && MAPS[s.door] && FOOD.test(MAPS[s.door].name || '')) M.emit.push({ x: s.x, y: s.y - 46, k: 'steam' });
      if (s.stamp === 'scramble') M.amb.push({ k: 'piyo', x: s.x, y: s.y, r: 220, t: 2 });
      if (s.act === 'bow' || s.label === 'PRAY') M.amb.push({ k: 'bell', x: s.x, y: s.y, r: 300, t: 4 + rnd() * 10 });
      if (s.train) M.amb.push({ k: 'chime', x: s.x, y: s.y, r: 220, t: 8 + rnd() * 10 });
    }
    for (const o of M.OBJ) { const sp = o.base || o.spr; if (sp === SPR.stall && hsh(o.x, o.y) < 0.45) M.emit.push({ x: o.x, y: o.y - 26, k: 'smoke' }); else if (sp === FUR.burner) M.emit.push({ x: o.x, y: o.y - 20, k: 'incense' }); }
    const r = RNG(M.w * 13 + M.h), at = (test, n) => { const out = []; for (let i = 0; i < 400 && out.length < n; i++) { const x = 30 + r() * (M.w - 60), y = 40 + r() * (M.h - 60); if (test(terr(x, y)) && free(x, y) && free(x, y - 8) && !out.some(p => Math.hypot(p[0] - x, p[1] - y) < 140)) out.push([Math.round(x), Math.round(y)]); } return out; };
    if (!M.night && !M.def.station) {
      for (const [x, y] of at(t => t === PL || t === PV || t === VL, 2)) for (let i = 0; i < 4 + (r() * 3 | 0); i++) { const px = x + (r() - 0.5) * 30, py = y + (r() - 0.5) * 14; if (free(px, py)) pigeon(px, py); }
      for (const [x, y] of at(t => t === GR, 3)) butterfly(x, y, x | 0);
    }
    if (M.st && !M.def.station && hsh(M.w, M.h) < 0.6) { for (let i = 0; i < 20; i++) { const x = M.st[0] + 40 + r() * 90, y = M.st[1] + 6 + r() * 30; if (free(x, y) && free(x + 10, y) && terr(x, y) !== AS) { busker(Math.round(x), Math.round(y)); break; } } }
  }
  function puff(e) { const s = e.k === 'steam'; fx.push({ k: e.k, x: e.x + (rnd() - 0.5) * 6, y: e.y, vx: (rnd() - 0.5) * 4 + 3, vy: -(s ? 9 : 7) - rnd() * 4, t: 0, life: s ? 2.2 : 2.8, r: s ? 2 : 2.5 }); }

  // ---------- each frame ----------
  function update(dt, st) {
    if (!M.amb) build();
    if (st === 'play') {
      react(dt);
      next -= dt; if (next <= 0 && !busy()) { const ok = Object.keys(SCENES).filter(k => SCENES[k].ok()), tot = ok.reduce((s, k) => s + (SCENES[k].w || 1), 0); let q = rnd() * tot, k = null; for (const c of ok) { q -= SCENES[c].w || 1; if (q <= 0) { k = c; break; } } next = k && SCENES[k].go() ? 16 + rnd() * 16 : 3; }
    }
    // the ambient sounds of the place
    ambT -= dt; if (ambT <= 0) { ambT = 0.25;
      if (M.indoor) { if (M.ACT.filter(a => a.F).length >= 4 && rnd() < 0.3) SND.murmur(); }
      else {
        let water = 0, green = 0; for (let k = 0; k < 16; k++) { const a = k * 0.3927, rr = 30 + (k % 3) * 30, t = terr(pl.x + Math.cos(a) * rr, pl.y + Math.sin(a) * rr * 0.7); if (t === WA) water = Math.max(water, 1 - rr / 110); if (t === GR || t === FR) green++; }
        if (water && rnd() < 0.18) SND.lap(water); if (green > 6 && day() && rnd() < 0.07) SND.chirp(0.6 + rnd() * 0.4);
        for (const c of M.CARS) { const d = Math.abs(c.x - pl.x); if (Math.abs(c.y - pl.y) < 50 && d < 40 && !(c.wh > G.t)) { c.wh = G.t + 2; SND.whoosh(0.7 - d / 70); } }
        for (const s of M.amb) { s.t -= 0.25; const v = loud(s.x, s.y, s.r); if (s.t > 0 || v <= 0) continue;
          if (s.k === 'piyo') { SND.piyo(v); s.t = 4 + rnd() * 3; } else if (s.k === 'bell') { SND.bell(v); s.t = 20 + rnd() * 14; } else if (s.k === 'chime') { SND.chime(v); s.t = 26 + rnd() * 12; }
          else if (s.k === 'busk') { const MEL = ['E5', 'G5', 'A5', 'C6', 'A5', 'G5', 'E5', 'D5', 'E5', 'G5', 'C6', 'D6', 'C6', 'A5', 'G5', '-']; const n = MEL[s.i++ % MEL.length]; if (n !== '-') SND.note(nf(n), v); s.t = 0.25; if (v > 0.25 && rnd() < 0.35) fx.push({ k: 'note', x: s.x + 2, y: s.y - 24, vx: 4 + rnd() * 4, vy: -12, t: 0, life: 1.6 }); } }
      }
    }
    // steam, smoke and falling leaves near the view
    if (M.emit) for (const e of M.emit) if (inView(e.x, e.y, 40) && rnd() < dt * (e.k === 'incense' ? 3 : 5) * (G.lowFx ? 0.4 : 1)) puff(e);
    leafT -= dt; if (leafT <= 0 && outdoors()) { leafT = G.lowFx ? 0.9 : 0.35; const trees = M.OBJ.filter(o => o.kind && !NOLEAF[o.kind] && inView(o.x, o.y - 40, 0)); if (trees.length) { const o = pick(trees), c = { maple: '#d9602c', ginkgo: '#f2c14e', sakura: '#f9a8c8', plum: '#f4d8e4' }[o.kind]; if (c || rnd() < 0.3) fx.push({ k: 'leaf', x: o.x + (rnd() - 0.5) * 30, y: o.y - 34 - rnd() * 16, vx: 4 + rnd() * 6, vy: 9 + rnd() * 5, t: 0, life: 3.6, c: c || '#6aa85a', ph: rnd() * 6, fall: 1 }); } }
    // a cherry in view sheds petals all the time: a slow pink snow
    petalT -= dt; if (petalT <= 0 && outdoors()) { petalT = G.lowFx ? 0.3 : 0.09; const ss = M.OBJ.filter(o => o.kind === 'sakura' && inView(o.x, o.y - 40, 20)); if (ss.length) { const o = pick(ss), w = o.spr.lw * 0.45; fx.push({ k: 'leaf', x: o.x + (rnd() - 0.5) * w * 2, y: o.y - 18 - rnd() * 32, vx: 5 + rnd() * 9, vy: 7 + rnd() * 6, t: 0, life: 4.4, c: pick(['#f9c8d8', '#fdebf1', '#f4b0c8']), ph: rnd() * 6, fall: 1 }); } }
    for (const p of fx) { p.t += dt; p.x += (p.vx + (p.k === 'leaf' ? Math.sin(G.t * 3 + p.ph) * (p.fall ? 8 : 20) : 0)) * dt; p.y += (p.vy + (p.k === 'leaf' && !p.fall ? Math.cos(G.t * 2.6 + p.ph) * 14 : 0)) * dt; }
    fx = fx.filter(p => p.t < p.life); if (fx.length > 160) fx.splice(0, fx.length - 160);
    // birds crossing the sky
    skyT -= dt; if (skyT <= 0) { skyT = 18 + rnd() * 22; if (day() && outdoors() && !station()) { const n = 3 + (rnd() * 3 | 0), y0 = 14 + rnd() * 40, dir = rnd() < 0.5 ? 1 : -1; for (let i = 0; i < n; i++) sky.push({ x: dir > 0 ? -20 - i * 9 : W + 20 + i * 9, y: y0 + Math.abs(i - n / 2) * 5, v: dir * (34 + rnd() * 4), ph: rnd() * 6 }); } }
    for (const b of sky) b.x += b.v * dt; sky = sky.filter(b => b.x > -60 && b.x < W + 60);
    if (M.ACT.some(a => a.dead)) M.ACT = M.ACT.filter(a => !a.dead);
  }
  function enter() { M.ACT = M.ACT.filter(a => !a.temp); fx = []; sky = []; next = 7 + rnd() * 6; for (const a of M.ACT) { a.near = 0; a.look = 0; if (a.dir0 != null) { a.dir = a.dir0; a.dir0 = null; } } }

  // ---------- drawing ----------
  function drawFx(cx, cy) {
    if (!M.indoor && M.TY && !G.lowFx) { const t = G.t; for (let y = Math.floor(cy / 10) * 10; y < cy + H; y += 10) for (let x = Math.floor(cx / 10) * 10; x < cx + W; x += 10) { const h = hsh(x, y); if (Math.sin(t * (1.5 + h) + h * 40) > 0.94 && terr(x + 5, y + 5) === WA) R(ctx, x + 5 - cx + h * 4, y + 5 - cy, h < 0.5 ? 2 : 1.5, U, '#e8f8ff'); } }
    for (const p of fx) { const x = p.x - cx, y = p.y - cy, a = 1 - p.t / p.life; if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      if (p.k === 'leaf') { ctx.globalAlpha = Math.min(1, a * 2); R(ctx, x, y, 1.5, 1, p.c); p1(ctx, x + (Math.sin(G.t * 6 + p.ph) > 0 ? 1.5 : -U), y + U, p.c); }
      else if (p.k === 'note') { ctx.globalAlpha = a; R(ctx, x, y, 1, 4, '#fff8e8'); R(ctx, x - 1.5, y + 3, 2, 1.5, '#fff8e8'); R(ctx, x + 1, y, 2, 1, '#fff8e8'); }
      else { const r = p.r + p.t * (p.k === 'steam' ? 2.2 : 1.6); ctx.globalAlpha = a * (p.k === 'steam' ? 0.45 : 0.35); disc(ctx, x, y, r, p.k === 'smoke' ? '#c8c0d4' : p.k === 'incense' ? '#d8d4e4' : '#ffffff'); }
      ctx.globalAlpha = 1; }
  }
  function drawSky() { for (const b of sky) { const f = Math.sin(G.t * 9 + b.ph) > 0; R(ctx, b.x - 3, b.y + (f ? -1 : 1), 3, 1, '#3a3346'); R(ctx, b.x, b.y, 1, 1, '#3a3346'); R(ctx, b.x + 1, b.y + (f ? -1 : 1), 3, 1, '#3a3346'); } }

  return { update, enter, foot, drawFx, drawSky, SND, SCENES }; // SCENES is exposed for testing: LIFE.SCENES.bike.go()
})();
