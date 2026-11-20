'use strict';
// ---------- the far cities: pieces Hiroshima, Kamakura, Sapporo and Okinawa share ----------
// gateway(): where a city's travellers leave for other cities when it has no shinkansen sign (a ship's gangway, a JR desk).
// passer(): a train or tram running past on the shared clock, so friends see the same one. It rings its bell, crossing
//   gates come down for it, and it nudges you off the rails rather than through you.
// frost(): snow on every upward-facing edge of a snowy map's buildings, trees and props, and icicles under the eaves.
// weather(): falling snow, footprints that fade, and breath that steams in the cold. shore(): waves washing up a beach.
// TRAVEL: how you get from one city to another. By rail unless a city says otherwise: Sapporo is flown to (via 'plane')
// and Okinawa is sailed to (via 'ship'), each with its own scene; a flight or a voyage to a city without its own airport
// or port ends with a train the rest of the way.
const PLACES = (function () {
  const rnd = Math.random, pick = a => a[rnd() * a.length | 0];
  const S = () => Snd.ctx && Snd.ctx.state === 'running' ? Snd.ctx.currentTime + 0.01 : 0;
  const tone = (type, f, t, d, v, o) => Snd.tone(type, f, t, d, v, Object.assign({ bus: Snd.sfx }, o || {}));
  const SND = {
    kankan(v) { const t = S(); if (t) { tone('square', 932, t, 0.12, 0.028 * v, { lp: 2600, pluck: 1 }); tone('square', 784, t + 0.004, 0.12, 0.02 * v, { lp: 2600, pluck: 1 }); } },
    ding(v) { const t = S(); if (t) { tone('triangle', 1568, t, 0.45, 0.05 * v, { pluck: 1, echo: 1 }); tone('triangle', 1568, t + 0.2, 0.6, 0.05 * v, { pluck: 1, echo: 1 }); } },
    horn(v) { const t = S(); if (t) { tone('sawtooth', 98, t, 1.7, 0.07 * v, { lp: 520, at: 0.12, rel: 0.4 }); tone('sawtooth', 147, t, 1.7, 0.045 * v, { lp: 640, at: 0.12, rel: 0.4 }); } },
    wave(v) { const t = S(); if (t) { Snd.noise(t, 1.5, 0.05 * v, 250, 1300, Snd.sfx); Snd.noise(t + 0.35, 1.1, 0.03 * v, 1600, 5200, Snd.sfx); } },
    gull(v) { const t = S(); if (t) { tone('sine', 1900, t, 0.16, 0.026 * v, { slide: 1250 }); tone('sine', 1800, t + 0.21, 0.24, 0.022 * v, { slide: 1150 }); } },
    whistle(v) { const t = S(); if (t) { tone('sine', 988, t, 1.3, 0.045 * v, { vib: 1, at: 0.06 }); tone('sine', 1319, t, 1.3, 0.035 * v, { vib: 1, at: 0.06 }); tone('sine', 1568, t + 0.02, 1.25, 0.025 * v, { vib: 1, at: 0.06 }); Snd.noise(t, 1.4, 0.04 * v, 2400, 7000, Snd.sfx); } },
    rumble(v) { const t = S(); if (t) { Snd.noise(t, 0.28, 0.05 * v, 60, 420, Snd.sfx); Snd.noise(t + 0.14, 0.2, 0.03 * v, 60, 420, Snd.sfx); } },
    drum(big) { const t = S(); if (t) { tone('sine', big ? 82 : 150, t, big ? 0.45 : 0.18, big ? 0.32 : 0.2, { slide: big ? 40 : 70, pluck: 1 }); Snd.noise(t, 0.05, big ? 0.08 : 0.12, 300, big ? 1200 : 2600, Snd.sfx); } },
    crunch() { const t = S(); if (t) { Snd.noise(t, 0.07, 0.03, 700, 2600, Snd.sfx); Snd.noise(t + 0.04, 0.05, 0.02, 1400, 4200, Snd.sfx); } },
    swish() { const t = S(); if (t) Snd.noise(t, 0.5, 0.05, 900, 4200, Snd.sfx); },
    blow() { const t = S(); if (t) Snd.noise(t, 0.25, 0.03, 300, 1100, Snd.sfx); },
    pop() { const t = S(); if (t) { tone('sine', 520, t, 0.08, 0.08, { slide: 1400, pluck: 1 }); Snd.noise(t, 0.05, 0.08, 1500, 5000, Snd.sfx); } }
  };
  const near = (x, y, r) => Math.max(0, 1 - Math.hypot(x - pl.x, y - pl.y) / r);

  // ---------- leaving a city ----------
  function gateway(x, y, label, spr) { if (spr !== false) prop(spr || 'shsign', x + 20, y + 5, 3); M.SPOTS.push({ x, y: y + 7, r: 14, label, shink: 1 }); M.sk = [x, y + 12]; }

  // ---------- trains and trams that pass by ----------
  // o: { y: the rails, cars: [sprites facing right], period: seconds between passes, speed, dir: 1, -1 or 0 (each way in turn), off: clock offset,
  //      cross: [x, ...] (crossings with gates), bell: 'kankan' | 'ding', band: half the height of the track bed,
  //      lift: how high an elevated line runs above the ground (a monorail): nothing is pushed out of its way }
  function passer(o) {
    const flips = o.cars.map(flip), len = o.cars.reduce((s, c) => s + c.lw - 2, 0), band = o.band || 7;
    const span = () => { const T = worldTime() + (o.off || 0), p = T % o.period, run = (M.w + len + 160) / o.speed, dir = o.dir || (Math.floor(T / o.period) % 2 ? -1 : 1); if (p > run) return null; const x0 = dir > 0 ? -len - 80 + p * o.speed : M.w + 80 - p * o.speed; return [x0, x0 + len, p / run, dir]; };
    const gates = (o.cross || []).map(x => ({ x, arm: 0, t: 0, down: 0 })), solid = new Set();
    const shove = (x0, x1) => { if (!o.lift && pl.x > x0 - 6 && pl.x < x1 + 6 && Math.abs(pl.y - o.y) < band + 5 && G.state === 'play') { const dn = pl.y >= o.y; pl.y = o.y + (dn ? band + 6 : -band - 1); } };
    M.ACT.push({ x: 0, y: o.y + band, sayT: 0, always: 1, pass: 1, rt: 0,
      upd(e, dt) {
        const s = span(); e.s = s;
        for (const q of gates) { const want = s && (s[3] > 0 ? s[1] > q.x - 220 && s[0] < q.x + 30 : s[0] < q.x + 220 && s[1] > q.x - 30) ? 1 : 0; q.down = want; q.arm += (want - q.arm) * Math.min(1, dt * 2.6); q.t += dt;
          if (want && q.t > 0.36) { q.t = 0; const v = near(q.x, o.y, 300); if (v > 0) SND.kankan(v); }
          const key = q.x; if (want && q.arm > 0.6 && !solid.has(key)) { if (Math.abs(pl.x - q.x) < 22 && Math.abs(pl.y - o.y) < band + 4) shove(q.x - 22, q.x + 22); block(q.x - 20, o.y - band, q.x + 20, o.y + band, 1); solid.add(key); } else if (!want && solid.has(key)) { block(q.x - 20, o.y - band, q.x + 20, o.y + band, 0); solid.delete(key); } }
        if (s) { shove(s[0], s[1]); e.rt += dt; if (e.rt > 0.22) { e.rt = 0; const v = near(Math.max(s[0], Math.min(s[1], pl.x)), o.y, 220); if (v > 0.05) SND.rumble(v); } if (o.bell === 'ding' && !e.rang && s[2] > 0.2 && near((s[0] + s[1]) / 2, o.y, 160) > 0.3) { e.rang = 1; SND.ding(0.8); } } else e.rang = 0;
      },
      draw(e, x, y) { const cx = e.x - x, s = e.s; if (!s) return; const bob = Math.floor(G.t * 9) % 2 ? U : 0; let px = s[0];
        ell(ctx, (s[0] + s[1]) / 2 - cx, y - band + 6, (s[1] - s[0]) / 2 + 4, 3, o.lift ? 'rgba(22,30,50,0.15)' : 'rgba(22,30,50,0.3)');
        const list = s[3] > 0 ? o.cars.slice().reverse() : o.cars; list.forEach((c, i) => { const sp = s[3] > 0 ? c : flips[o.cars.indexOf(c)]; if (px - cx < W + 4 && px + c.lw - cx > -4) ctx.drawImage(sp, snap(px - cx), snap(y - band + 4 - c.lh - (o.lift || 0) + ((i % 2) ? bob : 0))); px += c.lw - 2; });
      } });
    // the crossings: posts on both sides, arms that swing down, and two red lights taking turns
    for (const q of gates) for (const side of [-1, 1]) M.ACT.push({ x: q.x + side * 24, y: o.y + (side < 0 ? -band - 1 : band + 9), sayT: 0,
      draw(e, x, y) { const a = q.arm, on = q.down && Math.floor(G.t * 2.8) % 2, ax = side < 0 ? 1 : -1;
        R(ctx, x - 1, y - 26, 2, 26, '#f4f1e6'); for (let k = 0; k < 26; k += 6) R(ctx, x - 1, y - 26 + k, 2, 3, '#1d1626'); R(ctx, x - 5, y - 30, 10, 5, '#1d1626'); disc(ctx, x - 2.5, y - 27.5, 1.6, on ? '#ff3a2a' : '#5a1a1a'); disc(ctx, x + 2.5, y - 27.5, 1.6, !on && q.down ? '#ff3a2a' : '#5a1a1a');
        if (on || q.down) { ctx.globalAlpha = 0.35; disc(ctx, x + (on ? -2.5 : 2.5), y - 27.5, 4, '#ff6a4a'); ctx.globalAlpha = 1; }
        R(ctx, x - 3, y - 22, 6, 4, '#f2c14e'); R(ctx, x - 3, y - 22, 6, 1, '#1d1626'); txt(ctx, 'X', x - 1.5, y - 21.5, '#1d1626');
        const L = 26, ang = (1 - a) * -1.45; for (let k = 0; k < L; k += 1) { const px = x + ax * Math.cos(ang) * k, py = y - 14 + Math.sin(ang) * k; R(ctx, px - U, py - U, 1.5, 1.5, (k / 4 | 0) % 2 ? '#f2c14e' : '#1d1626'); } } });
    return { span };
  }

  // ---------- snow ----------
  const FROSTED = new WeakMap(); // let go of a map's frosted sprites along with the map
  function frostCanvas(c) {
    if (FROSTED.has(c)) return FROSTED.get(c);
    const o = mk(c.lw, c.lh); o.g.drawImage(c, 0, 0); const w = o.width, h = o.height, im = o.g.getImageData(0, 0, w, h), d = im.data, al = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) al[i] = d[i * 4 + 3];
    const set = (j, r, g, b, a) => { d[j * 4] = r; d[j * 4 + 1] = g; d[j * 4 + 2] = b; if (a != null) d[j * 4 + 3] = a; };
    for (let y = 1; y < h - 1; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (al[i] < 200) continue;
      if (al[i - w] === 0) { const n = 2 + (((x * 7 + y * 3) % 5) < 2 ? 1 : 0) + (((x >> 2) * 13 + y) % 7 === 0 ? 1 : 0); for (let k = 1; k <= n && y + k < h; k++) { const j = (y + k) * w + x; if (al[j] < 200) break; if (k === n) set(j, 196, 210, 232); else set(j, 250, 252, 255); } }
      else if (al[i + w] === 0 && y < h * 0.7 && ((x * 31 + y * 17) % 23) === 0) { const L = 2 + (x * 5 + y) % 5; for (let k = 1; k <= L && y + k < h; k++) { const j = (y + k) * w + x; if (al[j]) break; set(j, k === L ? 230 : 200, k === L ? 244 : 228, 255, 230); } } }
    o.g.putImageData(im, 0, 0); FROSTED.set(c, o); return o;
  }
  function frost() { for (const o of M.OBJ) if (o.spr && o.spr.lw && !o.base) { o.base = o.spr; o.spr = frostCanvas(o.spr); } } // o.base keeps the plain sprite, which is what benches and stalls are recognised by
  // falling snow in three layers, footprints in it, and breath in the cold. Call weather({ snow, breath }) in deco.
  function weather(o) {
    const prints = [], flakes = [], puffs = []; let last = null, side = 0, lt = G.t, breathT = 1;
    for (let i = 0; i < 140; i++) flakes.push({ x: rnd() * 400, y: rnd() * 300, z: i % 3, ph: rnd() * 6.283 });
    M.ACT.push({ x: 0, y: -1e6, sayT: 0, always: 1, draw(e, x, y) { const cx = e.x - x, cy = e.y - y; for (const p of prints) { const a = Math.max(0, 1 - (G.t - p.t) / 30) * 0.5; if (a <= 0) continue; const px = p.x - cx, py = p.y - cy; if (px < -4 || px > W + 4 || py < -4 || py > H + 4) continue; ctx.globalAlpha = a; ell(ctx, px, py, p.v ? 0.9 : 1.3, p.v ? 1.3 : 0.9, '#8a9ab8'); } ctx.globalAlpha = 1; } });
    const snowy = t => t === GR || t === FR || t === DT || t === VL;
    return {
      tick() { if (pl.ride || G.state !== 'play') { last = null; return; } if (!last) last = [pl.x, pl.y]; if (Math.hypot(pl.x - last[0], pl.y - last[1]) > 6) { side ^= 1; const v = pl.dir === 'u' || pl.dir === 'd', ox = v ? (side ? 1.8 : -1.8) : 0, oy = v ? 0 : (side ? 1.2 : -1.2); if (snowy(terr(pl.x, pl.y))) { prints.push({ x: pl.x + ox, y: pl.y + oy - 1, v, t: G.t }); if (prints.length > 180) prints.shift(); } last = [pl.x, pl.y]; } },
      over(cx, cy) {
        const dt = Math.min(0.05, G.t - lt); lt = G.t; const n = G.lowFx ? 50 : 140, wind = Math.sin(worldTime() / 7) * 14 + Math.sin(worldTime() / 2.3) * 4;
        if (o.snow) for (let i = 0; i < n; i++) { const f = flakes[i], sp = [7, 12, 20][f.z]; f.y += sp * dt; f.x += (wind * (0.4 + f.z * 0.3) + Math.sin(G.t * 1.4 + f.ph) * 4) * dt;
          const sx = ((f.x - cx * (0.4 + f.z * 0.3)) % (W + 8) + W + 8) % (W + 8) - 4, sy = ((f.y - cy * (0.4 + f.z * 0.3)) % (H + 8) + H + 8) % (H + 8) - 4;
          if (f.z === 2) { R(ctx, sx, sy, 1.5, 1.5, '#ffffff'); p1(ctx, sx + U, sy - U, '#e8f0ff'); } else R(ctx, sx, sy, f.z ? 1 : U, f.z ? 1 : U, f.z ? '#f4f8ff' : '#dce6f4'); }
        if (o.breath && !G.lowFx && G.state === 'play') { breathT -= dt; if (breathT <= 0) { breathT = 1.8 + rnd() * 1.2; const who = [pl].concat(M.ACT.filter(a => a.F && !a.hide && Math.abs(a.x - pl.x) < W / 2 && Math.abs(a.y - pl.y) < H / 2).slice(0, 3)); for (const a of who) if (rnd() < 0.8 && !a.ride) { const fx = a.dir === 'l' ? -3 : a.dir === 'r' ? 3 : 0; puffs.push({ x: a.x + fx, y: a.y - 19, t: 0, vx: fx * 2 + (rnd() - 0.5) * 3 }); } }
          for (const p of puffs) { p.t += dt; p.x += p.vx * dt; p.y -= 5 * dt; const a = Math.max(0, 1 - p.t / 1.3); if (a <= 0) continue; ctx.globalAlpha = a * 0.55; disc(ctx, p.x - cx, p.y - cy, 1.2 + p.t * 2.2, '#ffffff'); } ctx.globalAlpha = 1; while (puffs.length && puffs[0].t > 1.3) puffs.shift(); }
      }
    };
  }

  // ---------- the sea ----------
  // shore(y0, y1): waves rolling up a beach whose sea is to the north. The water's edge is found in each column between
  // rows y0 and y1; each wave slides up the sand as a line of foam, leaves it dark and wet, and draws back.
  function shore(y0, y1, o = {}) {
    const edge = []; for (let x = 0; x < M.w; x += 2) { let e = null; for (let y = y0; y < y1; y++) if (terr(x, y) === WA && terr(x, y + 1) !== WA) { e = y; break; } edge.push(e); }
    let next = 0;
    M.ACT.push({ x: 0, y: -1e6 + 1, sayT: 0, always: 1, draw(e, x, y) {
      const cx = e.x - x, cy = e.y - y, T = worldTime(), per = o.period || 6.5, i0 = Math.max(0, Math.floor(cx / 2) - 1), i1 = Math.min(edge.length, Math.ceil((cx + W) / 2) + 1);
      for (let w = 0; w < 2; w++) { const p = ((T / per) + w * 0.5) % 1, reach = p < 0.45 ? Math.sin(p / 0.45 * 1.5708) : Math.cos((p - 0.45) / 0.55 * 1.5708), up = reach * (o.reach || 9), wet = p > 0.45 ? 1 - (p - 0.45) / 0.55 : 0;
        for (let i = i0; i < i1; i++) { const ey = edge[i]; if (ey == null) continue; const px = i * 2 - cx, wob = Math.sin(i * 0.21 + w * 2 + T * 0.4) * 2.2 + Math.sin(i * 0.07 + T * 0.2) * 1.5, fy = ey + up + wob - 2 - cy; if (fy < -6 || fy > H + 6) continue;
          if (wet > 0) { ctx.globalAlpha = wet * 0.22; R(ctx, px, ey - cy, 2, up + wob + 1, '#3a4a5a'); }
          ctx.globalAlpha = 0.5 + reach * 0.4; R(ctx, px, ey - cy + 1, 2, Math.max(0, up + wob - 1), o.film || 'rgba(170,236,240,0.6)'); ctx.globalAlpha = 0.85 * (0.4 + reach * 0.6); R(ctx, px, fy, 2, 1.5, '#ffffff'); if ((i + w) % 3 === 0) p1(ctx, px + 1, fy - 1, '#f4fbff'); }
        ctx.globalAlpha = 1;
        if (w === 0 && p < 0.05 && next <= T) { next = T + per * 0.6; let best = 0; for (let i = 0; i < edge.length; i += 8) if (edge[i] != null) best = Math.max(best, near(i * 2, edge[i], 200)); if (best > 0) SND.wave(best); }
      } } });
  }
  // something that bobs in the sea or floats over it, drawn each frame: sprite at (x, y) rocking a little
  function bobber(spr, x, y, o = {}) { M.ACT.push({ x, y, sayT: 0, ph: rnd() * 6, draw(e, sx, sy) { const b = Math.sin(G.t * (o.f || 1.6) + e.ph) * (o.a || 0.8); ell(ctx, sx, sy + 1, spr.lw * 0.4, 2, 'rgba(20,50,80,0.25)'); ctx.drawImage(spr, snap(sx - spr.lw / 2), snap(sy - spr.lh + b)); if (Math.sin(G.t * 1.2 + e.ph) > 0.92) { ctx.globalAlpha = 0.6; R(ctx, sx - spr.lw * 0.45, sy + 0.5, spr.lw * 0.9, U, '#ffffff'); ctx.globalAlpha = 1; } } }); }

  // ---------- travelling between cities ----------
  const modeOf = (a, b) => a.via === 'plane' || b.via === 'plane' ? 'plane' : a.via === 'ship' || b.via === 'ship' ? 'ship' : 'rail';
  const portOf = c => Object.keys(AIR.PORTS).find(k => MAPS[k] && MAPS[k].city === c.id);
  const local = (a, b) => a.local === b.id || b.local === a.id;
  function label(dest) { const m = modeOf(CITY, dest); return m === 'plane' ? 'FLY TO' : m === 'ship' ? 'CRUISE TO' : local(CITY, dest) || dest.rail || CITY.rail ? 'TRAIN TO' : 'SHINKANSEN TO'; }
  const onward = (dest, lab, then) => () => { G.state = 'ride'; G.ride = { city: dest, t: 0, dur: 4.2, label: lab, then }; Snd.fx('train'); };
  function travel(dest) {
    const m = modeOf(CITY, dest), from = CITY;
    if (m === 'rail') { G.state = 'ride'; G.ride = { city: dest, t: 0, dur: local(from, dest) ? 4.2 : 5.6, label: label(dest) }; Snd.play(null); Snd.fx('train'); emit('ride', G.ride); return; }
    if (m === 'plane') { const p = portOf(dest), sea = dest.id === 'okinawa' || from.id === 'okinawa', snow = dest.id === 'sapporo';
      const fl = () => { if (STAMPS.flight && !G.stamps.flight) award('flight'); };
      if (p) AIR.fly(p, { sea, snow, fuji: !snow && from.id !== 'sapporo' });
      else { G.state = 'ride'; G.ride = { plane: 1, t: 0, dur: 8, label: 'FLIGHT TO', name: dest.name, sea, snow, fuji: !snow && from.id !== 'sapporo', then: onward(dest, 'AIRPORT TRAIN TO', fl) }; Snd.play(null); }
      emit('ride', G.ride); return; }
    G.state = 'ride'; G.ride = { ship: 1, t: 0, dur: 12, label: 'CRUISE TO', name: dest.name }; Snd.play(null); SND.horn(1);
    if (dest.dock) { G.ride.go = dest.dock; G.ride.then = () => { NET.say('LAND HO! WELCOME TO ' + dest.name + '.', 4); if (dest.cruiseStamp && STAMPS[dest.cruiseStamp] && !G.stamps[dest.cruiseStamp]) award(dest.cruiseStamp); }; }
    else G.ride.then = onward(dest, 'TRAIN TO');
    emit('ride', G.ride);
  }

  // ---------- the voyage: a cruise ship crossing the sea, from day through sunset and night to dawn ----------
  const SKY = [[0, '#4a9ae0', '#86c4ee', '#d4ecf6', '#2a78b4'], [0.26, '#5aa2e0', '#a4cceb', '#f2e4cc', '#3482b4'], [0.4, '#40407e', '#c66a8a', '#f8aa5a', '#4a5488'], [0.52, '#0c0e2c', '#1a1e4c', '#38386a', '#0f1736'], [0.78, '#12163a', '#262a58', '#544878', '#162040'], [0.9, '#4866ac', '#e298a0', '#f8d49c', '#4a6894'], [1, '#4a9ae0', '#8ccaee', '#e4f2f8', '#2a78b4']];
  function skyAt(p) { let i = 0; while (i < SKY.length - 2 && p > SKY[i + 1][0]) i++; const a = SKY[i], b = SKY[i + 1], k = Math.max(0, Math.min(1, (p - a[0]) / (b[0] - a[0]))); return [1, 2, 3, 4].map(j => mix(a[j], b[j], k)); }
  function shipTick(r, dt) { const t0 = r.t - dt; if (Math.floor(r.t * 0.9) !== Math.floor(t0 * 0.9)) SND.wave(0.5); if ((r.t < 2 || r.t > r.dur - 2.4) && Math.floor(r.t * 0.7) !== Math.floor(t0 * 0.7)) SND.gull(0.7); if (t0 < r.dur - 2.2 && r.t >= r.dur - 2.2) SND.horn(0.8); }
  function drawShip(r) {
    const p = Math.min(1, r.t / r.dur), t = G.t, [s0, s1, s2, sea] = skyAt(p), hz = Math.round(H * 0.47), night = p > 0.44 && p < 0.88 ? Math.min(1, (p - 0.44) / 0.08, (0.88 - p) / 0.06) : 0;
    dgrad(ctx, 0, 0, W, hz, [s0, s1, s2]);
    if (night > 0) { ctx.globalAlpha = night; for (let k = 0; k < 90; k++) { const sx = hsh(k, 3) * W, sy = hsh(k, 7) * hz * 0.92, tw_ = Math.sin(t * (1 + hsh(k, 9) * 3) + k) > 0.6; p1(ctx, sx, sy, tw_ ? '#ffffff' : '#a8b0d8'); }
      if (p > 0.6 && p < 0.66) { const q = (p - 0.6) / 0.06, x = W * (0.8 - q * 0.5), y = hz * (0.1 + q * 0.25); for (let k = 0; k < 10; k++) { ctx.globalAlpha = night * (1 - k / 10); R(ctx, x + k * 2, y - k * 0.8, 1.5, U, '#ffffff'); } } ctx.globalAlpha = 1; }
    // the sun goes down ahead of the ship, the moon crosses the night, and the sun comes up again behind
    const arc = (q, x0, x1, top) => [x0 + (x1 - x0) * q, hz - Math.sin(q * Math.PI) * top];
    if (p < 0.47) { const [x, y] = arc(0.35 + p / 0.47 * 0.65, W * 0.15, W * 0.86, hz * 0.85); ctx.globalAlpha = 0.25; disc(ctx, x, y, 14, '#fff4c0'); ctx.globalAlpha = 1; disc(ctx, x, y, 7, p > 0.3 ? '#ffb060' : '#fff8d8'); }
    if (p > 0.5 && p < 0.9) { const [x, y] = arc((p - 0.5) / 0.4, W * 0.1, W * 0.9, hz * 0.8); disc(ctx, x, y, 6, '#f4f0dc'); disc(ctx, x + 2, y - 1, 5, mix(s0, '#f4f0dc', 0.15)); }
    if (p > 0.84) { const [x, y] = arc((p - 0.84) / 0.5, W * 0.12, W * 0.9, hz * 0.9); ctx.globalAlpha = 0.3; disc(ctx, x, y, 14, '#ffd8a0'); ctx.globalAlpha = 1; disc(ctx, x, y, 7, '#ffd08a'); }
    // islands slide past on the horizon
    for (let k = 0; k < 3; k++) { const ix = ((k * 173 - t * 6) % (W + 160) + W + 160) % (W + 160) - 80, iw = 30 + k * 14; ell(ctx, ix, hz, iw, 5 + k * 2, mix(sea, '#1d2a3a', 0.35)); ell(ctx, ix - iw * 0.3, hz - 2, iw * 0.4, 4 + k, mix(sea, '#24364a', 0.3)); }
    // the sea, the light on it, and its rolling stripes
    dgrad(ctx, 0, hz, W, H - hz, [sea, dark(sea, 0.35)]); R(ctx, 0, hz, W, U, mix(s2, '#ffffff', 0.3));
    for (let y = hz + 3, k = 0; y < H; y += 3 + k * 0.6, k++) { const sp = 10 + k * 5, o = (t * sp) % 24; ctx.globalAlpha = 0.25 + Math.min(0.3, k * 0.02); for (let x = -o; x < W; x += 24) R(ctx, x + (k * 7) % 24, y, 6 + k, U, lite(sea, 0.35)); } ctx.globalAlpha = 1;
    const lx = p < 0.47 ? arc(0.35 + p / 0.47 * 0.65, W * 0.15, W * 0.86, 1)[0] : p < 0.9 ? arc((p - 0.5) / 0.4, W * 0.1, W * 0.9, 1)[0] : arc((p - 0.84) / 0.5, W * 0.12, W * 0.9, 1)[0];
    ctx.globalAlpha = 0.55; for (let y = hz + 2, k = 0; y < H * 0.95; y += 2.5, k++) { const w = 3 + k * 0.7; if (Math.sin(t * 3 + k * 1.7) > -0.2) R(ctx, lx - w / 2 + Math.sin(t * 2 + k) * 2, y, w, U, p > 0.5 && p < 0.88 ? '#e8ecf8' : '#fff0c0'); } ctx.globalAlpha = 1;
    // dolphins by day, playing at the bow
    const sk = Math.min(1, (W - 16) / 240), wl = Math.round(H * 0.66), sx = Math.round(W / 2 - 120 * sk), bob = Math.sin(t * 1.3) * 1.2, roll = Math.sin(t * 0.9) * 0.012;
    if (p < 0.38 || p > 0.92) for (let k = 0; k < 3; k++) { const q = ((t * 0.45 + k * 0.33) % 1.6); if (q > 1) continue; const dx = sx + 240 * sk + 10 + k * 16 + q * 50, dy = wl + 6 - Math.sin(q * Math.PI) * 18, a = Math.cos(q * Math.PI) * 0.9; ctx.save(); ctx.translate(dx, dy); ctx.rotate(-a); ell(ctx, 0, 0, 6, 2, '#5a6a8a'); ell(ctx, 0, -0.5, 5, 1.2, '#8a9ab8'); R(ctx, -1, -3, 2, 2, '#5a6a8a'); R(ctx, -8, -1.5, 3, 3, '#5a6a8a'); ctx.restore(); if (q < 0.08 || (q > 0.92 && q < 1)) { ctx.globalAlpha = 0.7; R(ctx, dx - 3, wl + 5, 6, 1, '#ffffff'); ctx.globalAlpha = 1; } }
    // the ship, rolling gently, with its wake and bow wave, smoke from the funnel and its windows lit at night
    ctx.save(); ctx.translate(sx + 120 * sk, Math.round(wl + bob)); ctx.scale(sk, sk); // no roll: a rotated sprite this wide splits into tiles ctx.drawImage(SPR.liner, -120, -86);
    if (night > 0.2) for (const [wx, wy] of LINERWIN) if (hsh(wx, wy) < 0.72) R(ctx, wx - 120, wy - 86, 2, 1.5, hsh(wx + 1, wy) < 0.2 ? '#bfe8ff' : '#ffd98a');
    if (night > 0.2) { ctx.globalAlpha = 0.35; for (let k = 0; k < 5; k++) disc(ctx, -96 + k * 40, -40, 9, '#ffd98a'); ctx.globalAlpha = 1; disc(ctx, 84, -64, 1, Math.floor(t * 1.5) % 2 ? '#ff4a3a' : '#5a1a1a'); }
    ctx.restore();
    ctx.globalAlpha = 0.85; for (let k = 0; k < 26; k++) { const q = (k / 26 + t * 0.35) % 1, wx = sx - q * 70, wy = wl + 2 + Math.sin(k * 1.9 + t * 2) * (1 + q * 3); R(ctx, wx, wy, 5 - q * 3, 1, '#ffffff'); } for (let k = 0; k < 6; k++) R(ctx, sx + 226 * sk + k * 2, wl - 1 + Math.sin(t * 6 + k) * 1.2, 2, 1, '#ffffff'); ctx.globalAlpha = 1;
    for (let k = 0; k < 7; k++) { const q = (k / 7 + t * 0.12) % 1; ctx.globalAlpha = (1 - q) * 0.4; disc(ctx, sx + 100 * sk - q * 60 * sk, wl - 84 * sk - q * 22 + bob, (2 + q * 6) * sk, night > 0.5 ? '#8a8aa0' : '#e8e8f0'); } ctx.globalAlpha = 1;
    // gulls near the coasts
    if (p < 0.14 || p > 0.84) for (let k = 0; k < 5; k++) { const gx = ((k * 61 + t * (14 + k * 3)) % (W + 40)) - 20, gy = hz * (0.3 + (k % 3) * 0.18) + Math.sin(t * 1.5 + k) * 6, f = Math.sin(t * 9 + k * 2) > 0 ? 2 : -0.5; line1(ctx, gx - 4, gy - f, gx, gy, '#f4f4f8'); line1(ctx, gx, gy, gx + 4, gy - f, '#f4f4f8'); }
    const bw = Math.min(210, W - 20), by = Math.min(H - 40, wl + 26); panel(W / 2 - bw / 2, by, bw, 32); txtC(ctx, r.label, W / 2, by + 6, '#8a7a6a'); txtC(ctx, r.name, W / 2, by + 16, '#2f5ab0', null, tw(r.name, 2) > bw - 10 ? 1 : 2);
    txtC(ctx, p < 0.3 ? 'OUT ON THE OPEN SEA' : p < 0.46 ? 'SUNSET ON DECK' : p < 0.86 ? 'A NIGHT ON THE WAVES' : 'MORNING. LAND AHEAD!', W / 2, Math.max(6, by - 12), '#fff8e8', '#1d1626');
    const a = r.t < 0.5 ? 1 - r.t / 0.5 : r.t > r.dur - 0.5 ? (r.t - r.dur + 0.5) / 0.5 : 0; if (a > 0) { ctx.globalAlpha = Math.min(1, a); R(ctx, 0, 0, W, H, '#100c1c'); ctx.globalAlpha = 1; }
  }
  // the liner: white decks stepping up from a long hull, lifeboats, a blue funnel. Its windows are listed for the night.
  const LINERWIN = [];
  function sprites() {
    one('liner', 240, 90, g => {
      for (let y = 56; y < 88; y++) { const x0 = 10 + Math.pow((y - 56) / 32, 2) * 14, x1 = 236 - (y - 56) * 1.05; R(g, x0, y, x1 - x0, 1, y < 60 ? '#ffffff' : y > 80 ? '#c8382e' : y > 75 ? '#1f2f5a' : y === 75 ? '#f2c14e' : '#f4f2ee'); }
      for (const y of [64, 70]) for (let x = 24; x < 214 - (y - 64) * 2; x += 5) { R(g, x, y, 1.5, 1.5, '#2a3a5a'); LINERWIN.push([x, y]); }
      const deck = (x0, x1, y0, y1, rows) => { R(g, x0, y0, x1 - x0, y1 - y0, '#f8f6f2'); R(g, x0, y0, x1 - x0, 1, '#ffffff'); R(g, x0, y1 - 1, x1 - x0, 1, '#c8c4bc'); for (let r = 0; r < rows; r++) { const yy = y0 + 2.5 + r * 4; R(g, x0 + 2, yy, x1 - x0 - 4, 2, '#3a5a8a'); for (let x = x0 + 4; x < x1 - 4; x += 4) { R(g, x, yy - 0.5, U, 3, '#e8e4dc'); LINERWIN.push([x + 1.5, yy + 0.25]); } } };
      deck(28, 214, 44, 56, 3); deck(42, 204, 32, 44, 3); deck(56, 190, 22, 32, 2); deck(150, 188, 14, 22, 1); R(g, 152, 16, 34, 3, '#1d2a44'); R(g, 152, 16, 34, 1, '#5a7aa8');
      for (let x = 46; x < 180; x += 22) { R(g, x, 47, 14, 5, '#f08a2a'); R(g, x, 47, 14, 1.5, '#ffb060'); R(g, x + 1, 46, U, 2, '#8a8496'); R(g, x + 12.5, 46, U, 2, '#8a8496'); }
      for (let i = 0; i < 22; i++) { const w = 9 - i * 0.12; R(g, 104 - w, 22 - i, w * 2, 1, i > 18 ? '#1d1626' : i > 12 ? '#2f5ab0' : i > 9 ? '#c8382e' : '#2f5ab0'); } R(g, 100, 6, 2, 2, '#f4f1e6');
      R(g, 172, 2, 1.5, 12, '#6b6478'); R(g, 168, 5, 9, 1, '#6b6478'); R(g, 166, 9, 13, 1, '#6b6478'); disc(g, 172.5, 2, 1.2, '#c8c0d4');
      for (let x = 30; x < 212; x += 3) R(g, x, 43, 1, 1, '#c8c4bc'); for (let x = 44; x < 202; x += 3) R(g, x, 31, 1, 1, '#c8c4bc');
      R(g, 4, 54, 16, 2, '#c8c4bc'); for (let x = 5; x < 20; x += 3) R(g, x, 51, U, 3, '#8a8496'); R(g, 2, 51, 18, U, '#8a8496');
    }, 1);
    txt(SPR.liner.g, 'TABI MARU', 160, 59, '#2f5ab0');
    one('gangway', 30, 34, g => { for (let i = 0; i < 18; i++) R(g, 2 + i, 32 - i * 1.6, 12, 2, i % 2 ? '#c8c4bc' : '#e8e4dc'); line1(g, 2, 26, 20, -1, '#6b6478'); line1(g, 14, 30, 30, 4, '#6b6478'); R(g, 0, 31, 16, 3, '#8a8496'); }, 1);
    icon('wave', g => { for (let k = 0; k < 3; k++) { R(g, 1 + k, 4 + k * 3, 10 - k * 2, 1.5, '#3f7ab0'); R(g, 2 + k, 3.5 + k * 3, 3, 1, '#8ad0f0'); } R(g, 0, 11, 12, 1, '#2a5a8a'); });
    icon('ship', g => { R(g, 1, 7, 10, 3, '#f4f1e6'); R(g, 1, 9, 10, 1, '#2f5ab0'); R(g, 3, 4, 7, 3, '#f4f1e6'); R(g, 3, 5, 7, 1, '#3a5a8a'); R(g, 5, 1, 2, 3, '#2f5ab0'); R(g, 0, 11, 12, 1, '#7ac8dc'); });
  }

  return { SND, gateway, passer, frost, frostCanvas, weather, shore, bobber, travel, label, modeOf, drawShip, shipTick, sprites };
})();
const gateway = PLACES.gateway;
