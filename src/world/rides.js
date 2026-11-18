'use strict';
// ---------- rides and small rituals ----------
// Rides come in two kinds. A tour follows a route while someone else does the work: a rickshaw puller jogging through
// Asakusa or the bamboo at Arashiyama, a guide on the Dotonbori canal cruise. They talk about what you pass, and a rickshaw
// lets you hop off (it finishes the loop alone). A boat you steer yourself: swan boats at Ueno and Kawaguchiko, a rowing
// boat at Arashiyama. It drifts, bumps the banks, and goes back to its dock when you are done.
// The rest are small things to do: sit on any bench, bow to people (they bow back), wash your hands at a shrine's basin,
// hang a wish plaque or tie a fortune on its rack (both stay there), and feed the koi in temple ponds.
// Vehicles are actors in M.ACT that draw you inside them; while you ride, pl follows the vehicle so the camera, the
// pigeons and the passers-by all react as usual. Drawing is procedural but small, and every effect thins out when the
// frame budget is tight (G.lowFx, set by the frame loop).
const RIDES = (function () {
  const rnd = Math.random, pick = a => a[rnd() * a.length | 0];
  let fx = [];
  const lowFx = () => !!G.lowFx;
  const S = () => Snd.ctx && Snd.ctx.state === 'running' ? Snd.ctx.currentTime + 0.01 : 0;
  const tone = (type, f, t, d, v, o) => Snd.tone(type, f, t, d, v, Object.assign({ bus: Snd.sfx }, o || {}));
  const SND = {
    splash(v) { const t = S(); if (t) { Snd.noise(t, 0.18, 0.05 * v, 900, 3400, Snd.sfx); tone('sine', 900 + rnd() * 300, t, 0.06, 0.02 * v, { slide: 300, pluck: 1 }); } },
    plip() { const t = S(); if (t) tone('sine', 1400 + rnd() * 600, t, 0.05, 0.035, { slide: 500, pluck: 1 }); },
    pour() { const t = S(); if (t) { Snd.noise(t, 1.1, 0.04, 600, 2400, Snd.sfx); Snd.noise(t + 0.5, 0.8, 0.03, 1200, 4000, Snd.sfx); } },
    clack(v) { const t = S(); if (t) { tone('square', 340, t, 0.03, 0.025 * v, { lp: 1500 }); tone('square', 260, t + 0.05, 0.03, 0.02 * v, { lp: 1500 }); } },
    bump() { const t = S(); if (t) { Snd.noise(t, 0.08, 0.06, 100, 500, Snd.sfx); tone('triangle', 110, t, 0.12, 0.05, { pluck: 1 }); } },
    rattle(v) { const t = S(); if (t) Snd.noise(t, 0.04, 0.012 * v, 300, 1200, Snd.sfx); }
  };
  const water = (x, y) => terr(x, y) === WA;
  const free = (x, y) => !hit(x, y) && x > 8 && x < M.w - 8 && y > 8 && y < M.h - 4;
  // a spot on the water near (x, y) with room for a boat
  function findWater(x, y, r = 18) { for (let d = 0; d < 90; d += 3) for (let a = 0; a < 6.283; a += 0.4) { const px = Math.round(x + Math.cos(a) * d), py = Math.round(y + Math.sin(a) * d * 0.8); if (water(px, py) && water(px - r, py) && water(px + r, py) && water(px, py - 6) && water(px, py + 5)) return [px, py]; } return null; }
  function landNear(x, y) { for (let d = 0; d < 60; d += 3) for (let a = 0; a < 6.283; a += 0.5) { const px = Math.round(x + Math.cos(a) * d), py = Math.round(y + Math.sin(a) * d); if (free(px, py) && free(px + 5, py) && free(px - 5, py) && !water(px, py)) return [px, py]; } return [x, y]; }
  const crop = (fr, x, y, rows) => ctx.drawImage(fr, 0, 0, fr.lw, rows, snap(x - 10), snap(y), fr.lw, rows);
  const dirOf = (vx, vy) => Math.abs(vx) >= Math.abs(vy) * 0.8 ? (vx < 0 ? 'l' : 'r') : (vy < 0 ? 'u' : 'd');

  // ---------- the rickshaw ----------
  const LACQ = '#2a2024', LACQ2 = '#4a3a40', RED = '#c8382e', WOOD = '#8a5a3a', WOOD2 = '#b8865a';
  function wheelSide(x, y, r, a, far) { const c = far ? '#3a3036' : LACQ; disc(ctx, x, y, r, c); disc(ctx, x, y, r - 1.2, far ? '#6a5a5a' : '#d8c8b0'); disc(ctx, x, y, r - 1.8, c);
    if (!far) for (let k = 0; k < 6; k++) { const q = a + k * 1.0472; line1(ctx, x, y, x + Math.cos(q) * (r - 1.6), y + Math.sin(q) * (r - 1.6), '#c8b090'); } disc(ctx, x, y, 1.2, far ? '#6a5a5a' : '#f2c14e'); }
  function wheelEnd(x, y, r, a) { ell(ctx, x, y, 2.6, r, LACQ); ell(ctx, x, y, 1.6, r - 1, '#c8b090'); for (let k = 0; k < 3; k++) { const q = a + k * 2.094, yy = y + Math.sin(q) * (r - 1.6); if (Math.cos(q) > -0.2) R(ctx, x - 1.2, yy - 0.4, 2.4, 0.8, LACQ); } R(ctx, x - 1.5, y - 0.8, 3, 1.6, '#f2c14e'); }
  // the cart, with its puller and you in it. (x, y): the axle on the ground. d: facing. e.rot: wheel angle. e.bob: bounce
  function drawRickshaw(e, x, y) {
    const d = e.face || 'r', s = d === 'l' ? -1 : 1, b = e.bob || 0, PF = e.pullF, fi = d === 'l' ? 1 : 0, you = e.rider && !G.hidePl ? pl.F : null;
    const puller = (px, py) => { const fr = e.mv ? (d === 'l' || d === 'r' ? PF.s['walk' + Math.floor(e.wt * 13) % 8][fi] : PF[d === 'u' ? 'u' : 'd'][1 + Math.floor(e.wt * 9) % 4]) : (d === 'u' ? PF.u[0] : d === 'd' ? PF.d[0] : PF.s.idle0[fi]);
      const lean = e.mv && (d === 'l' || d === 'r') ? s * 1 : 0; ell(ctx, px, py, 6, 2, 'rgba(22,30,50,0.32)'); ctx.drawImage(fr, snap(px - 10 + lean), snap(py - 27 - (e.mv ? Math.abs(Math.sin(e.wt * 13 * Math.PI / 4)) : 0))); };
    ell(ctx, x + (d === 'l' || d === 'r' ? s * 6 : 0), y, d === 'l' || d === 'r' ? 18 : 13, 2.6, 'rgba(22,30,50,0.32)');
    if (d === 'l' || d === 'r') {
      const yy = y - b;
      wheelSide(x - s * 1.5, yy - 9, 8.5, -(e.rot || 0) * s, 1);
      R(ctx, x - 10 * s - (s < 0 ? 4 : 0), yy - 34, 4, 22, LACQ); for (let k = 0; k < 5; k++) R(ctx, x - (10 - k * 1.5) * s - (s < 0 ? 2 : 0), yy - 35 + k * 0.6, 2, 1, LACQ2);
      R(ctx, x - (s > 0 ? 9 : -9) - (s < 0 ? 15 : 0), yy - 21, 15, 9, LACQ); R(ctx, x - (s > 0 ? 9 : -9) - (s < 0 ? 15 : 0), yy - 21, 15, 1, LACQ2); R(ctx, x - (s > 0 ? 9 : -9) - (s < 0 ? 15 : 0), yy - 13, 15, 1, RED);
      if (you) { crop(you.s.idle0[fi], x + s * 1, yy - 37, 17); R(ctx, x - (s > 0 ? 5 : -5) - (s < 0 ? 12 : 0), yy - 23, 12, 4, RED); R(ctx, x - (s > 0 ? 5 : -5) - (s < 0 ? 12 : 0), yy - 23, 12, U, '#e8705a'); }
      R(ctx, x + (s > 0 ? 6 : -12), yy - 10, 6, 2, WOOD); R(ctx, x + (s > 0 ? 6 : -12), yy - 10, 6, U, WOOD2);
      line1(ctx, x + s * 5, yy - 13, x + s * 23, yy - 15 + b * 0.5, '#6a4028'); line1(ctx, x + s * 5, yy - 13.5, x + s * 23, yy - 15.5 + b * 0.5, WOOD2);
      wheelSide(x, yy - 8.5, 8.5, (e.rot || 0) * s, 0);
      if (e.going) puller(x + s * 25, y);
    } else if (d === 'd') { // coming toward you: the puller in front, then the cart
      const yy = y - b; R(ctx, x - 11, yy - 36, 22, 13, LACQ); R(ctx, x - 10, yy - 35, 20, 1, LACQ2);
      if (you) crop(you.d[0], x, yy - 36, 17); R(ctx, x - 9, yy - 22, 18, 10, LACQ); R(ctx, x - 8, yy - 21, 16, 4, RED); R(ctx, x - 8, yy - 21, 16, U, '#e8705a'); R(ctx, x - 9, yy - 13, 18, 1, RED);
      wheelEnd(x - 11, yy - 9, 8.5, e.rot || 0); wheelEnd(x + 11, yy - 9, 8.5, e.rot || 0);
      for (const k of [-6, 6]) { line1(ctx, x + k, yy - 12, x + k * 0.9, y + 8, '#6a4028'); line1(ctx, x + k + 0.5, yy - 12, x + k * 0.9 + 0.5, y + 8, WOOD2); }
      if (e.going) puller(x, y + 18);
    } else { // going away: the puller ahead, then the back of the cart with your head above the hood
      if (e.going) puller(x, y - 22);
      const yy = y - b; for (const k of [-6, 6]) { line1(ctx, x + k, yy - 12, x + k * 0.8, y - 20, '#6a4028'); line1(ctx, x + k + 0.5, yy - 12, x + k * 0.8 + 0.5, y - 20, WOOD2); }
      if (you) crop(you.u[0], x, yy - 37, 12);
      R(ctx, x - 11, yy - 30, 22, 9, LACQ); R(ctx, x - 11, yy - 30, 22, 1, LACQ2); R(ctx, x - 9, yy - 22, 18, 10, LACQ); R(ctx, x - 9, yy - 14, 18, 1, RED); R(ctx, x - 3, yy - 19, 6, 3, '#f2c14e');
      wheelEnd(x - 11, yy - 9, 8.5, e.rot || 0); wheelEnd(x + 11, yy - 9, 8.5, e.rot || 0);
    }
  }

  // ---------- boats ----------
  function drawSwan(e, x, y) {
    const s = e.face === 'l' ? -1 : 1, b = Math.sin(G.t * 2.2 + e.ph) * 0.6, yy = y + b, fi = s < 0 ? 1 : 0, you = e.rider && !G.hidePl ? pl.F : null;
    ell(ctx, x, y + 1, 15, 3.5, 'rgba(20,40,70,0.25)');
    ell(ctx, x - s * 2, yy - 4, 14, 5.5, '#d8d4e4'); ell(ctx, x - s * 2, yy - 5, 13, 4.5, '#ffffff');
    if (you) crop(you.s.idle0[fi], x - s * 3, yy - 22, 15);
    R(ctx, x - s * 2 - 10, yy - 9, 20, 3, '#f06a8c'); R(ctx, x - s * 2 - 10, yy - 9, 20, U, '#ff9ab8');
    const sw = Math.sin(G.t * 1.6 + e.ph) * 0.7; R(ctx, x + s * 8 - 1.5 + sw, yy - 21, 3.5, 14, '#ffffff'); R(ctx, x + s * 8 - (s > 0 ? 1.5 : 2) + sw, yy - 21, 1, 14, '#d8d4e4'); ell(ctx, x + s * 10 + sw, yy - 21, 3.5, 2.5, '#ffffff'); R(ctx, x + s * 13 + sw - (s < 0 ? 3 : 0), yy - 21.5, 3, 1.5, '#f2a03a'); p1(ctx, x + s * 10.5 + sw, yy - 22, '#1d1626');
    R(ctx, x - s * 14 - 1, yy - 9, 2, 3, '#ffffff'); R(ctx, x - 14, yy - 1.5, 28, 1, 'rgba(255,255,255,0.6)');
  }
  function drawRow(e, x, y) {
    const s = e.face === 'l' ? -1 : 1, b = Math.sin(G.t * 2 + e.ph) * 0.5, yy = y + b, fi = s < 0 ? 0 : 1, you = e.rider && !G.hidePl ? pl.F : null, ph = e.row || 0, a = Math.sin(ph) * 0.7, dip = Math.cos(ph) > 0;
    ell(ctx, x, y + 1, 15, 3, 'rgba(20,40,70,0.25)');
    const oar = (oy, col) => { const ox = x + Math.cos(1.57 + a) * 2, ex = x - s * Math.sin(a) * 14, ey = yy + oy + (dip ? 3 : -1); line1(ctx, ox, yy - 7 + oy * 0.2, ex, ey, col); R(ctx, ex - 1.5, ey - 0.5, 3, 1.5, col); };
    oar(-4, '#8a6448');
    ell(ctx, x, yy - 4, 14, 4.5, '#6a4028'); ell(ctx, x, yy - 5, 13, 3.5, WOOD); ell(ctx, x, yy - 5.5, 11, 2.5, '#5a3a28'); R(ctx, x - 1, yy - 8, 2, 4, WOOD2);
    if (you) crop(you.s.idle0[fi], x, yy - 22, 16);
    oar(3, '#b8865a'); R(ctx, x - 14, yy - 1.5, 28, 1, 'rgba(255,255,255,0.5)');
  }
  function drawCruise(e, x, y) {
    const s = e.face === 'l' ? -1 : 1, b = Math.sin(G.t * 1.8) * 0.5, yy = y + b, GF = e.guideF;
    ell(ctx, x, y + 1, 30, 4, 'rgba(20,40,70,0.3)');
    ell(ctx, x, yy - 4, 30, 5, '#d8d4e4'); R(ctx, x - 28, yy - 9, 56, 6, '#f4f1e6'); R(ctx, x - 28, yy - 5, 56, 2, '#3f7ab0'); ell(ctx, x + s * 27, yy - 6, 4, 3.5, '#f4f1e6');
    const seats = [-18, -9, 0, 9]; seats.forEach((k, i) => { const F = i === 2 && e.rider && !G.hidePl ? pl.F : e.pax[i]; if (F) crop(F.s.idle0[s < 0 ? 1 : 0], x - s * k, yy - 24, 15); });
    R(ctx, x - 24, yy - 25, 48, 2, '#5ad8f0'); R(ctx, x - 24, yy - 25, 48, U, '#bfe8ff'); for (const k of [-24, -8, 8, 22]) R(ctx, x + k, yy - 24, 1.5, 15, '#c8c0d4');
    ctx.drawImage(GF.s.idle0[s < 0 ? 1 : 0], snap(x + s * 22 - 10), snap(yy - 33)); R(ctx, x + s * 26, yy - 38, 1, 12, '#6b6478'); R(ctx, x + s * 26 + (s > 0 ? 0 : -6), yy - 38, 6, 4, '#ffd84a');
    R(ctx, x - 30, yy - 1.5, 60, 1, 'rgba(255,255,255,0.6)');
    // under a bridge: draw the deck again on top so the boat slides beneath it
    for (const [x0, y0, x1, y1] of M.BR || []) { const l = Math.max(x0, x - 32), r = Math.min(x1, x + 32); if (r > l && y > y0 && y - 40 < y1) { const cx = e.x - x, cy = e.y - y, top = Math.max(y0, e.y - 42); ctx.drawImage(M.ground, l, top, r - l, Math.min(y1, e.y + 6) - top, l - cx, top - cy, r - l, Math.min(y1, e.y + 6) - top); } }
  }
  function wake(e, k) { if (lowFx() && rnd() < 0.5) return; fx.push({ k: 'ring', x: e.x - (e.face === 'l' ? -1 : 1) * k + (rnd() - 0.5) * 3, y: e.y + (rnd() - 0.5) * 2, t: 0, life: 1.6 }); }

  // ---------- tours ----------
  // each stand: where the puller waits, the route (a loop back to the stand) and what is said along the way
  const TOURS = {
    asakusa: { kind: 'rick', stamp: 'rickshaw', at: [410, 466], speed: 46, look: ['yukata', '#2a3a5a'],
      route: [[320, 468], [320, 446, 'THE THUNDER GATE! THAT LANTERN WEIGHS SEVEN HUNDRED KILOS.'], [320, 330, 'NAKAMISE STREET. THESE STALLS HAVE SOLD SNACKS FOR THREE HUNDRED YEARS.'], [320, 252], [362, 238], [362, 178, 'WAVE THE INCENSE SMOKE OVER YOUR HEAD FOR WISDOM. OR DO NOT. YOU LOOK WISE ALREADY.'], [320, 166, 'SENSO-JI. TWO FISHERMEN FOUND A GOLDEN STATUE IN THEIR NET, AND THIS TEMPLE WAS BUILT FOR IT.'], [278, 172], [278, 206, 'THE FIVE-STOREY PAGODA. THEY SAY A RELIC OF THE BUDDHA RESTS INSIDE.'], [278, 238], [320, 252], [320, 446], [320, 468], [600, 468, 'AND THERE: THE SKYTREE. OLD TOKYO, NEW TOKYO, ONE VIEW.'], [410, 466, 'HERE WE ARE! THANK YOU FOR RIDING WITH ME.']] },
    kyo_arashi: { kind: 'rick', stamp: 'ky_rick', at: [556, 386], speed: 44, look: ['yukata', '#2a3a5a'],
      route: [[176, 388], [176, 352, 'INTO THE BAMBOO! LISTEN TO IT CREAK.'], [160, 288], [112, 224, 'SOME OF THESE STALKS GROW A METRE IN A SINGLE DAY.'], [128, 160], [96, 112], [160, 64, 'THE LIGHT IS GREEN UP HERE, LIKE BEING UNDER WATER.'], [240, 80], [272, 144], [330, 176, 'A SIDE GATE INTO TENRYU-JI. A SHORTCUT. DO NOT TELL THE MONKS.'], [360, 178], [432, 200, 'THIS GARDEN IS SEVEN HUNDRED YEARS OLD, AND THE HILLS ARE PART OF IT.'], [432, 300], [432, 386], [556, 386, 'BACK IN TOWN. THE TOFU SHOP IS STILL OPEN, IF YOU ARE HUNGRY.']] },
    osa_namba: { kind: 'cruise', stamp: 'osa_cruise', at: [690, 300], dock: [690, 252], speed: 30, look: ['office', '#3f7ab0'], board: 'TAKE THE CANAL CRUISE',
      route: [[600, 304, 'WELCOME ABOARD THE TOMBORI RIVER CRUISE! HANDS INSIDE THE BOAT, PLEASE.'], [400, 304, 'EBISU BRIDGE. WHEN THE TIGERS WIN, PEOPLE JUMP OFF IT. INTO THIS. DO NOT JUMP.'], [300, 304, 'THE RUNNING MAN HAS BEEN RUNNING SINCE 1935. HE HAS NOT ARRIVED YET.'], [80, 300, 'TURNING ROUND! HOLD ON TO YOUR TAKOYAKI.'], [60, 296], [80, 292], [480, 292, 'THAT CRAB HAS BEEN WAVING FOR SIXTY YEARS. ME TOO. NOBODY TAKES MY PHOTO.'], [690, 300, 'THANK YOU! PLEASE CLAP. CLAPPING IS FREE.']] }
  };
  const BOATS = { ueno: { kind: 'swan', stamp: 'swanboat', dock: [448, 314], label: 'RENT A SWAN BOAT' }, kawaguchiko: { kind: 'swan', stamp: 'kw_swan', dock: [452, 300], label: 'RENT A SWAN BOAT' }, kyo_arashi: { kind: 'row', stamp: 'ky_row', dock: [300, 424], label: 'RENT A ROWING BOAT' } };

  function tourActor(T) {
    const F = look(T.look[0], T.look[1]);
    return { tour: T, x: T.at[0], y: T.at[1], face: 'l', mv: false, wt: 0, rot: 0, bob: 0, ph: 0, sayT: 0, i: 0, pullF: F, guideF: F, pax: [look('tourist'), look('teen', '#5ad8f0'), null, look('granny')], always: 1,
      draw(e, x, y) { if (T.kind === 'rick') drawRickshaw(e, x, y); else drawCruise(e, x, y); },
      upd(e, dt) { if (!e.going) { e.mv = false; e.bob *= 0.9; if (T.kind === 'cruise') { e.face = 'l'; } return; }
        const p = T.route[e.i], dx = p[0] - e.x, dy = p[1] - e.y, d = Math.hypot(dx, dy), sp = T.speed * Math.min(1, 0.35 + e.go * 0.9) * (d < 14 && e.i === T.route.length - 1 ? Math.max(0.3, d / 14) : 1);
        e.go = Math.min(1, (e.go || 0) + dt * 0.8);
        if (d < 2) { if (p[2]) say(e, p[2]); e.i++; if (e.i >= T.route.length) { finish(e); } return; }
        const mx = dx / d * Math.min(d, sp * dt), my = dy / d * Math.min(d, sp * dt); e.x += mx; e.y += my; e.mv = true; e.wt += dt * (sp / 46); e.rot += Math.hypot(mx, my) / 8.5;
        const f = dirOf(dx, dy); if (f !== e.face) e.face = f; e.bob = Math.abs(Math.sin(e.wt * 13 * Math.PI / 4)) * 0.8;
        if (e.rider) { pl.x = e.x; pl.y = e.y; }
        if (T.kind === 'rick') { const g = terr(e.x, e.y); if ((g === DT || g === VL) && rnd() < dt * (lowFx() ? 4 : 10)) fx.push({ k: 'dust', x: e.x + (rnd() - 0.5) * 12, y: e.y, t: 0, life: 0.8 }); if (Math.floor(e.rot / 1.4) !== Math.floor((e.rot - Math.hypot(mx, my) / 8.5) / 1.4)) SND.rattle(e.rider ? 1 : 0.4); }
        else if (rnd() < dt * 6) wake(e, 30);
      } };
  }
  function startTour(e) { const T = e.tour; e.going = true; e.i = 0; e.go = 0; e.rider = true; if (e.stand) e.stand.hide = 1; G.state = 'tour'; G.ridee = e; pl.ride = e; pl.mv = false; say(e, T.kind === 'rick' ? pick(['HOLD ON! HERE WE GO!', 'COMFORTABLE? THEN OFF WE GO!']) : 'CASTING OFF!'); Snd.fx(T.kind === 'rick' ? 'clap' : 'chime'); }
  function finish(e) { const T = e.tour; e.going = false; e.i = 0; e.x = T.at[0]; e.y = T.at[1]; e.face = T.kind === 'rick' ? 'l' : 'l'; if (e.stand) e.stand.hide = 0;
    if (e.rider) { e.rider = false; pl.ride = null; const [lx, ly] = T.dock ? T.dock : landNear(e.x - 30, e.y + 10); pl.x = lx; pl.y = ly; pl.dir = 'd'; G.state = 'play'; G.ridee = null; Snd.fx('yay'); if (T.stamp && STAMPS[T.stamp]) dialog([T.kind === 'rick' ? 'THE PULLER BOWS, A LITTLE OUT OF BREATH, AND HANDS YOU A PHOTO OF YOUR RIDE.' : 'THE BOAT BUMPS GENTLY INTO THE DOCK. EVERYONE CLAPS, INCLUDING THE GUIDE.'], () => award(T.stamp)); } }
  function hopOff(e) { if (e.tour.kind !== 'rick') { say(e, 'PLEASE WAIT UNTIL WE DOCK!'); return; } e.rider = false; pl.ride = null; G.ridee = null; const [lx, ly] = landNear(e.x + 18, e.y + 6); pl.x = lx; pl.y = ly; pl.dir = 'd'; G.state = 'play'; say(e, 'MIND THE STEP! I WILL TAKE THE CART BACK.'); Snd.fx('page'); }

  // ---------- boats you steer ----------
  function boatActor(B, wx, wy) { return { boat: B, x: wx, y: wy, vx: 0, vy: 0, face: 'r', ph: rnd() * 6, row: 0, sayT: 0, rider: true, temp: 1, always: 1, t: 0,
    draw(e, x, y) { if (B.kind === 'row') drawRow(e, x, y); else drawSwan(e, x, y); } }; }
  function startBoat(B) {
    const w = findWater(B.dock[0], B.dock[1]); if (!w) { dialog(['THE BOATS ARE ALL OUT RIGHT NOW. COME BACK IN A MINUTE.']); return; }
    const e = boatActor(B, w[0], w[1]); e.face = w[0] < pl.x ? 'l' : 'r'; M.ACT.push(e); G.state = 'boat'; G.ridee = e; pl.ride = e; pl.x = e.x; pl.y = e.y; SND.splash(1); Snd.fx('ui');
    NET.say && NET.say(TOUCH ? 'STEER WITH THE STICK. E AT THE DOCK TO RETURN THE BOAT.' : 'STEER WITH THE ARROWS. E AT THE DOCK TO RETURN THE BOAT.', 4);
  }
  function endBoat(e, quick) { const B = e.boat, long = e.t > 20; e.dead = 1; pl.ride = null; G.ridee = null; pl.x = B.dock[0]; pl.y = B.dock[1]; pl.dir = 'd'; G.state = 'play'; if (quick) G.fade = 1; Snd.fx('page');
    if (B.stamp && STAMPS[B.stamp] && long) dialog([B.kind === 'row' ? 'YOU TIE THE BOAT UP. YOUR ARMS ACHE IN THE BEST WAY.' : 'YOU STEP OUT ONTO THE DOCK, LEGS STILL PEDALLING A LITTLE.'], () => award(B.stamp));
    else if (B.stamp && !G.stamps[B.stamp]) dialog(['BACK ALREADY? STAY OUT A LITTLE LONGER NEXT TIME.']); }
  function boatTick(e, dt) {
    let ix = (K.r ? 1 : 0) - (K.l ? 1 : 0), iy = (K.d ? 1 : 0) - (K.u ? 1 : 0); if (JOY.on) { ix = JOY.x; iy = JOY.y; } const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
    const top = e.boat.kind === 'row' ? 34 : 30, k = Math.min(1, dt * 1.6); e.vx += (ix * top - e.vx) * k; e.vy += (iy * top * 0.75 - e.vy) * k; e.t += dt;
    const nx = e.x + e.vx * dt, ny = e.y + e.vy * dt, okAt = (x, y) => water(x - 12, y) && water(x + 12, y) && water(x, y - 5) && water(x, y + 4);
    if (okAt(nx, e.y)) e.x = nx; else { if (Math.abs(e.vx) > 12) SND.bump(); e.vx *= -0.35; } if (okAt(e.x, ny)) e.y = ny; else { if (Math.abs(e.vy) > 12) SND.bump(); e.vy *= -0.35; }
    if (Math.abs(e.vx) > 3) e.face = e.vx < 0 ? 'l' : 'r'; const spd = Math.hypot(e.vx, e.vy);
    if (e.boat.kind === 'row') { if (spd > 4) { const r0 = e.row; e.row += dt * 5; if (Math.cos(r0) <= 0 && Math.cos(e.row) > 0) { SND.splash(0.5); for (let q = 0; q < (lowFx() ? 1 : 3); q++) fx.push({ k: 'drop', x: e.x + (rnd() - 0.5) * 20, y: e.y + 2, vy: -14 - rnd() * 8, t: 0, life: 0.5 }); } } }
    else if (spd > 4 && rnd() < dt * 8) fx.push({ k: 'drop', x: e.x - (e.face === 'l' ? -1 : 1) * 14, y: e.y - 2, vy: -10 - rnd() * 8, t: 0, life: 0.45 });
    if (spd > 5 && rnd() < dt * spd / 4) wake(e, 13);
    pl.x = e.x; pl.y = e.y;
    const dd = Math.hypot(e.x - e.boat.dock[0], e.y - e.boat.dock[1]); G.tgt = dd < 46 ? { x: e.x, y: e.y - 4, label: 'RETURN THE BOAT', boat: e } : null;
  }

  // ---------- benches ----------
  function sitAt(b) { G.state = 'sit'; pl.sit = { x: b.x, y: b.y, t: 0 }; pl.x = b.x; pl.y = b.y + 0.5; pl.dir = 'd'; pl.mv = false; Snd.fx('ui');
    const cats = M.ACT.filter(c => c.cat && Math.hypot(c.x - b.x, c.y - b.y) < 240); if (cats.length && rnd() < 0.7) { const c = cats.reduce((a, q) => Math.hypot(q.x - b.x, q.y - b.y) < Math.hypot(a.x - b.x, a.y - b.y) ? q : a); c.fol = 14; } }
  function drawSit(x, y) { const F = pl.F, fr = F.d[Math.floor(G.t * 1.2) % 4 === 0 ? 5 : 0]; crop(fr, x, y - 22, 17); for (const k of [-2.5, 0.5]) { R(ctx, x + k, y - 5, 2, 4, '#3a3a52'); R(ctx, x + k - 0.5, y - 1.5, 3, 1.5, '#e9e4d8'); } }

  // ---------- shrines: a water basin, and a rack for wish plaques and fortunes ----------
  const WISH = ['GOOD HEALTH FOR MY FAMILY', 'TO SEE THIS PLACE AGAIN', 'TO PASS MY EXAMS', 'A HAPPY YEAR', 'TO FIND MY WAY', 'THAT MY FRIENDS ARE WELL'];
  function shrine(sp) {
    const offs = [[-58, 26], [58, 26], [-72, 6], [72, 6], [-44, 44], [44, 44], [-90, 20], [90, 20], [-58, -6], [58, -6], [-36, 14], [36, 14], [-48, 36], [48, 36], [-24, 30], [24, 30]], ok = (x, y, w) => { for (let k = -w; k <= w; k += 4) if (!free(x + k, y) || !free(x + k, y - 8) || terr(x + k, y) === WA || terr(x + k, y) === AS) return false; return !M.SPOTS.some(s => Math.hypot(s.x - x, s.y - y) < 22); };
    const stand = (x, y) => [-8, 8].every(dx => free(x + dx, y + 9) && free(x + dx - 4, y + 11) && free(x + dx + 4, y + 11)); // room to stand at both ends of the rack
    const got = []; for (const [dx, dy] of offs) { const x = Math.round(sp.x + dx), y = Math.round(sp.y + dy); if (ok(x, y, 14) && (got.length === 0 || stand(x, y)) && !got.some(g => Math.abs(g[0] - x) < 40 && Math.abs(g[1] - y) < 20)) got.push([x, y]); if (got.length === 2) break; }
    if (got[0]) { const [x, y] = got[0]; prop('chozu', x, y, 12); M.SPOTS.push({ x, y: y + 7, r: 13, label: 'WASH YOUR HANDS', fn: () => purify(x, y) }); M.ACT.push({ x, y: y + 0.4, sayT: 0, always: 0, draw: (e, sx, sy) => { if (lowFx()) return; const t = G.t * 3; for (let k = 0; k < 3; k++) R(ctx, sx + 5 + Math.sin(t + k) * 0.3, sy - 12 + k * 2, U, 2, 'rgba(200,236,255,0.8)'); ell(ctx, sx + 5, sy - 6, 2 + Math.sin(t * 2) * 0.5, 0.7, 'rgba(255,255,255,0.5)'); } }); }
    if (got[1]) { const [x, y] = got[1]; prop('rackS', x, y, 14); const at = dx => free(x + dx, y + 9) && free(x + dx - 4, y + 11) && free(x + dx + 4, y + 11); if (at(-8)) M.SPOTS.push({ x: x - 8, y: y + 7, r: 11, label: 'HANG A WISH', fn: () => { G.state = 'mini'; G.mg = { k: 'ema', sp: { x, y }, t: 0 }; MG.ema.init(G.mg); Snd.fx('ui'); } }); if (at(8)) M.SPOTS.push({ x: x + 8, y: y + 7, r: 11, label: 'TIE A FORTUNE', fn: () => tieFortune() });
      M.ACT.push({ x, y: y + 0.4, sayT: 0, draw: (e, sx, sy) => { const n = Math.min(16, (G.knots[M.id] || 0)); for (let k = 0; k < n; k++) { const kx = sx + 2 + (k % 6) * 2.2, ky = sy - 20 + (k / 6 | 0) * 2.6; R(ctx, kx, ky, 1.5, 1.2, '#ffffff'); p1(ctx, kx + 0.5, ky + 1.2, '#d8d4e4'); } const w = G.ema[M.id]; if (w != null) { R(ctx, sx - 11, sy - 18, 5, 4, '#f2c14e'); R(ctx, sx - 10.5, sy - 17.5, 4, 3, '#e8c890'); p1(ctx, sx - 9, sy - 16.5, '#c8382e'); } } }); }
  }
  function purify(x, y) { G.state = 'event'; G.ev = { sp: { act: 'wash', lines: [] }, t: 0, x, y }; pl.dir = 'u'; pl.mv = false; SND.pour(); }
  function tieFortune() { const f = FORT[rnd() * FORT.length | 0]; G.knots[M.id] = (G.knots[M.id] || 0) + 1; save(); Snd.fx('page'); dialog(['YOU DRAW A FORTUNE: ' + f[0] + '. ' + f[1], f[0].includes('CURSE') ? 'YOU FOLD THE BAD LUCK INTO A KNOT AND TIE IT TO THE RACK. GONE.' : 'YOU TIE IT TO THE RACK ANYWAY, SO THE GOOD LUCK STAYS HERE TOO.']); }
  const EMA = {
    init(m) { m.i = 0; m.done = 0; },
    update(m) { if (m.done) { if (m.t > m.done + 0.8) { G.mg = null; G.state = 'play'; dialog(['YOU HANG YOUR PLAQUE AMONG THE OTHERS: "' + WISH[m.i] + '".', 'IT CLACKS GENTLY AGAINST ITS NEIGHBOURS IN THE BREEZE.']); } return; }
      if (KP.l) { m.i = (m.i + WISH.length - 1) % WISH.length; Snd.fx('ui'); } if (KP.r) { m.i = (m.i + 1) % WISH.length; Snd.fx('ui'); } if (KP.u) { m.i = (m.i + WISH.length - 1) % WISH.length; Snd.fx('ui'); } if (KP.d) { m.i = (m.i + 1) % WISH.length; Snd.fx('ui'); }
      if (KP.a && m.t > 0.2) { G.ema[M.id] = m.i; save(); m.done = m.t; SND.clack(1); } },
    draw(m) { txtC(ctx, 'WRITE A WISH', 160, 30, '#c8382e', null, 2); const sw = m.done ? Math.sin((m.t - m.done) * 20) * 2 : 0;
      R(ctx, 120, 48 + sw * 0.3, 80, 52, '#8a5a3a'); R(ctx, 122, 50 + sw * 0.3, 76, 48, '#e8c890'); R(ctx, 122, 50 + sw * 0.3, 76, 2, '#f8e0b0'); for (let k = 0; k < 4; k++) R(ctx, 120 + k * 0, 46 - k, 80 - k * 0, 1, '#5a3a28'); disc(ctx, 160, 52 + sw * 0.3, 2, '#5a3a28');
      wrap(WISH[m.i], 68).forEach((l, i) => txtC(ctx, l, 160, 66 + i * 9 + sw * 0.3, '#3a2e40'));
      txt(ctx, '<', 106, 70, '#c8382e', null, 2); txt(ctx, '>', 206, 70, '#c8382e', null, 2); for (let i = 0; i < WISH.length; i++) disc(ctx, 145 + i * 6, 110, 1.5, i === m.i ? '#c8382e' : '#d9cba8');
      txtC(ctx, m.done ? 'CLACK.' : TOUCH ? '< > CHOOSE - E TO HANG IT' : 'ARROWS CHOOSE - E TO HANG IT', 160, 132, '#3a2e40'); }
  };

  // ---------- koi ----------
  const PONDS = { kyo_kinkaku: [304, 222, [300, 330]], kyo_arashi: [384, 208, [350, 232]], nara: [384, 714, [338, 664]], ueno: [448, 256, null] };
  const KOI = [['#f06a2a', '#ffffff'], ['#ffffff', '#e0452f'], ['#f2c14e', '#f2c14e'], ['#2a2430', '#f06a2a'], ['#f8f4ea', '#3a3346']];
  function koi(x, y, i) { const c = KOI[i % KOI.length]; M.ACT.push({ koi: 1, x, y, hx: x, hy: y, tx: x, ty: y, a: rnd() * 6.28, sp: 0, c, sayT: 0, t: rnd() * 3, food: 0,
    upd(e, dt) { e.t -= dt; if (e.food > 0) e.food -= dt; if (e.t <= 0 && e.food <= 0) { e.t = 2 + rnd() * 3; for (let k = 0; k < 8; k++) { const px = e.hx + (rnd() - 0.5) * 70, py = e.hy + (rnd() - 0.5) * 40; if (water(px, py) && water(px + 6, py) && water(px - 6, py)) { e.tx = px; e.ty = py; break; } } }
      const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy), want = e.food > 0 ? 32 : d > 3 ? 9 : 0; e.sp += (want - e.sp) * Math.min(1, dt * 2); if (d > 1) { const ta = Math.atan2(dy, dx); let da = ta - e.a; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; e.a += da * Math.min(1, dt * 3); }
      const nx = e.x + Math.cos(e.a) * e.sp * dt, ny = e.y + Math.sin(e.a) * e.sp * dt; if (water(nx, ny)) { e.x = nx; e.y = ny; } else e.a += 2; },
    draw(e, x, y) { if (x < -8 || x > W + 8) return; const ca = Math.cos(e.a), sa = Math.sin(e.a) * 0.6, w = Math.sin(G.t * 8 + e.hx) * (0.4 + e.sp * 0.03); ctx.globalAlpha = 0.85;
      disc(ctx, x - ca * 4 - sa * w, y - sa * 4 + ca * w * 0.5, 1.2, e.c[1]); disc(ctx, x - ca * 2, y - sa * 2, 1.7, e.c[0]); disc(ctx, x, y, 1.9, e.c[0]); disc(ctx, x + ca * 2.2, y + sa * 2.2, 1.5, e.c[1]); if (e.food > 0 && e.near) disc(ctx, x + ca * 3.4, y + sa * 3.4, 0.8, '#1d1626');
      ctx.globalAlpha = 1; } }); }
  function feed(P) { const t = findWater(P[2][0], P[2][1], 6) || [P[0], P[1]]; Snd.fx('page'); for (let k = 0; k < (lowFx() ? 5 : 10); k++) fx.push({ k: 'pellet', x: t[0] + (rnd() - 0.5) * 14, y: t[1] + (rnd() - 0.5) * 8, t: 0, life: 6 });
    let n = 0; for (const e of M.ACT) if (e.koi) { e.food = 6; e.tx = t[0] + (rnd() - 0.5) * 10; e.ty = t[1] + (rnd() - 0.5) * 6; e.near = 1; n++; } say(pl, pick(['COME ON, FISH!', 'HERE YOU GO!'])); setTimeout(() => { for (let k = 0; k < 6; k++) setTimeout(() => { SND.plip(); fx.push({ k: 'ring', x: t[0] + (rnd() - 0.5) * 12, y: t[1] + (rnd() - 0.5) * 6, t: 0, life: 1 }); }, k * 260); }, 900);
    if (!n) dialog(['NOTHING COMES. THE FISH MUST BE ASLEEP.']); }

  // ---------- building it into the maps ----------
  function build() {
    if (M.indoor) return;
    M.BR = M.BR || [];
    for (const o of M.OBJ) if (o.spr === SPR.bench && free(o.x, o.y + 8) && free(o.x - 4, o.y + 10) && free(o.x + 4, o.y + 10)) M.SPOTS.push({ x: o.x, y: o.y + 6, r: 10, label: 'SIT DOWN', fn: () => sitAt(o) });
    for (const sp of M.SPOTS.slice()) if ((sp.act === 'bow' && sp.label === 'PRAY') || sp.label === 'WAFT THE SMOKE') shrine(sp);
    const T = TOURS[M.id]; if (T) {
      const e = tourActor(T); M.ACT.push(e);
      if (T.kind === 'rick') { const old = M.OBJ.find(o => o.spr === SPR.rick); if (old) M.OBJ.splice(M.OBJ.indexOf(old), 1); const pul = M.ACT.find(n => n.lines && n.lines.some(l => /RICKSHAW/.test(l))); if (pul) { e.stand = pul; pul.spot = { label: 'RIDE THE RICKSHAW', fn: () => startTour(e) }; pul.x = T.at[0] + 22; pul.y = T.at[1] + 2; pul.hx = pul.x; pul.hy = pul.y; pul.F = e.pullF; pul.dir = 'l'; } block(T.at[0] - 12, T.at[1] - 4, T.at[0] + 12, T.at[1]); }
      else M.SPOTS.push({ x: T.dock[0], y: T.dock[1] + 6, r: 15, label: T.board, fn: () => startTour(e) });
    }
    const B = BOATS[M.id]; if (B) { M.SPOTS.push({ x: B.dock[0], y: B.dock[1] + 4, r: 14, label: B.label, fn: () => startBoat(B) }); const w = findWater(B.dock[0], B.dock[1]); if (w) M.ACT.push({ x: w[0] + 26, y: w[1] + 2, face: 'l', ph: 1, sayT: 0, draw(e, x, y) { if (G.ridee && G.ridee.boat === B) return; (B.kind === 'row' ? drawRow : drawSwan)(e, x, y); } }); }
    const P = PONDS[M.id]; if (P) { let n = 0; for (let i = 0; i < 60 && n < 7; i++) { const x = P[0] + (rnd() - 0.5) * 120, y = P[1] + (rnd() - 0.5) * 60; if (water(x, y) && water(x + 8, y) && water(x - 8, y)) { koi(x, y, n); n++; } } if (P[2] && n) M.SPOTS.push({ x: P[2][0], y: P[2][1], r: 13, label: 'FEED THE KOI', fn: () => feed(P) }); }
  }

  // ---------- each frame ----------
  let bowSeen = 0;
  function tick(dt, st) {
    // bow, and people near you bow back
    if (pl.act === 'bow' && !bowSeen) { bowSeen = 1; for (const n of M.ACT) { const d = Math.hypot(n.x - pl.x, n.y - pl.y); if (d > 56) continue; if (n.F && !n.temp && n.F.bow) { n.act = 'bow'; n.actT = 0.9 + rnd() * 0.4; n.dir = 'u'; } else if (n.deer) { n.st = 'bow'; n.t = 1.3; } } }
    if (pl.act !== 'bow') bowSeen = 0;
    for (const n of M.ACT) if (n.actT > 0) { n.actT -= dt; if (n.actT <= 0) { n.act = null; n.dir = n.dir0 || 'd'; } }
    for (const p of fx) { p.t += dt; if (p.k === 'drop') { p.vy += 60 * dt; p.y += p.vy * dt; } else if (p.k === 'dust') p.y -= 6 * dt; }
    fx = fx.filter(p => p.t < p.life); if (fx.length > 140) fx.splice(0, fx.length - 140);
    if (st === 'boat' && G.ridee) boatTick(G.ridee, dt);
  }
  // the states a ride puts the game in
  function update(dt, st) {
    if (st === 'tour') { const e = G.ridee; if (!e) { G.state = 'play'; return; } if (KP.x) hopOff(e); }
    else if (st === 'boat') { const e = G.ridee; if (!e) { G.state = 'play'; return; } if (KP.a && G.tgt && G.tgt.boat) endBoat(e); else if (KP.x) endBoat(e, true); }
    else if (st === 'sit') { const s = pl.sit; s.t += dt; if (K.l || K.r || K.u || K.d || (JOY.on && Math.hypot(JOY.x, JOY.y) > 0.4) || KP.a || KP.x) { pl.sit = null; pl.y = s.y + 9; G.state = 'play'; Snd.fx('ui'); } }
  }
  // the hand-washing at a basin, played as an event
  function washEvent(ev, dt) { const t0 = ev.t; ev.t += dt; pl.act = ev.t > 0.3 && ev.t < 2.1 ? 'back' : null; if (t0 < 0.4 && ev.t >= 0.4) for (let k = 0; k < 6; k++) fx.push({ k: 'drop', x: ev.x + 4 + (rnd() - 0.5) * 6, y: ev.y - 6, vy: -4 - rnd() * 6, t: 0, life: 0.6 });
    if (ev.t > 2.4) { pl.act = null; G.washed = M.id; dialog(['LEFT HAND, RIGHT HAND, A SIP FROM YOUR CUPPED PALM, THEN THE LADLE RINSED UPRIGHT.', 'THE WATER IS COLD. YOU FEEL READY TO PRAY.']); } }
  function drawFx(cx, cy) {
    for (const p of fx) { const x = p.x - cx, y = p.y - cy, a = 1 - p.t / p.life; if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      if (p.k === 'ring') { const r = 3 + p.t * 9; ctx.globalAlpha = a * 0.7; for (let k = 0; k < 14; k++) { const q = k * 0.4488; p1(ctx, x + Math.cos(q) * r, y + Math.sin(q) * r * 0.4, '#e8f8ff'); } }
      else if (p.k === 'drop') { ctx.globalAlpha = a; R(ctx, x, y, 1, 1, '#d8f4ff'); }
      else if (p.k === 'dust') { ctx.globalAlpha = a * 0.5; disc(ctx, x, y - 1, 1.5 + p.t * 3, '#d8c090'); }
      else if (p.k === 'pellet') { ctx.globalAlpha = Math.min(1, a * 3); R(ctx, x, y, 1, 1, '#8a5a2a'); }
      ctx.globalAlpha = 1; }
  }

  function sprites() {
    one('chozu', 30, 30, g => { R(g, 2, 26, 26, 4, '#8c8498'); R(g, 4, 16, 22, 11, '#a8a2b4'); R(g, 4, 16, 22, 1.5, '#d8d4e4'); R(g, 6, 17.5, 18, 3, '#4a8ac0'); R(g, 6, 17.5, 18, 1, '#8ad0f0'); for (const x of [8, 13, 18]) { R(g, x, 15, 1, 3, '#b8a070'); ell(g, x + 1, 14.5, 1.5, 1, '#d8c090'); }
      for (const x of [2, 26]) { R(g, x, 4, 2, 23, '#8a5a3a'); R(g, x, 4, U, 23, '#b8865a'); } roof(g, 15, 0, 6, 16, 6, '#4a4660'); R(g, 20, 6, 2, 9, '#6a8a3a'); R(g, 21, 6, 2, 1, '#8ab05a'); }, 1);
    one('rackS', 34, 28, g => { for (const x of [2, 30]) { R(g, x, 6, 2, 22, '#6a4a30'); R(g, x, 6, U, 22, '#a8744a'); } R(g, 0, 5, 34, 2, '#5a3a28'); R(g, 0, 5, 34, U, '#8a5a3a'); R(g, 4, 12, 26, 1, '#5a3a28'); R(g, 4, 18, 26, 1, '#5a3a28');
      for (let k = 0; k < 5; k++) { R(g, 5 + k * 3, 7, 2.5, 3, '#e8c890'); p1(g, 5.5 + k * 3, 8, '#c8382e'); } for (let k = 0; k < 6; k++) { R(g, 18 + (k % 3) * 3.5, 13 + (k / 3 | 0) * 2.5, 1.5, 1.2, '#ffffff'); } }, 1);
    icon('rickshaw', g => { disc(g, 4, 8, 3.5, '#2a2430'); disc(g, 4, 8, 2.2, '#d8c8b0'); disc(g, 4, 8, 1, '#2a2430'); R(g, 1, 3, 6, 4, '#c8382e'); R(g, 1, 1, 2, 6, '#2a2430'); line(g, 6, 6, 11, 5, '#8a5a3a'); });
    icon('swan', g => { ell(g, 6, 8, 5, 2.5, '#ffffff'); R(g, 8, 2, 1.5, 6, '#ffffff'); R(g, 8, 2, 3, 1.5, '#ffffff'); P(g, 11, 3, '#f2a03a'); R(g, 2, 7, 6, 1, '#f06a8c'); R(g, 0, 11, 12, 1, '#7ac8dc'); });
    icon('oar', g => { ell(g, 6, 8, 5.5, 2, '#8a5a3a'); line(g, 1, 2, 10, 11, '#c8a070'); R(g, 9, 9, 3, 3, '#c8a070'); R(g, 0, 11, 12, 1, '#7ac8dc'); });
    icon('boat', g => { R(g, 1, 6, 10, 3, '#f4f1e6'); R(g, 1, 8, 10, 1, '#3f7ab0'); R(g, 3, 3, 6, 3, '#5ad8f0'); R(g, 0, 10, 12, 1, '#7ac8dc'); });
  }
  return { build, tick, update, drawFx, drawSit, washEvent, sprites, EMA, TOURS, BOATS, startTour, startBoat, drawRickshaw }; // drawRickshaw is exposed for testing
})();
