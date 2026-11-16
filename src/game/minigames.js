'use strict';
// ---------- minigames: each has init(m), update(m, dt) and draw(m), and finishes by calling endMini(won, lines) ----------
const SUSHI = [['TUNA', '#d8404a'], ['SALMON', '#f08a5a'], ['EGG', '#f2d04a'], ['SHRIMP', '#f8b8a0'], ['CUCUMBER ROLL', '#5aa85a']], FIGS = ['MAGICAL GIRL', 'ROBOT PILOT', 'CAT KNIGHT', 'SPACE IDOL', 'NINJA FROG', 'GOLD DRAGON'], FIGC = ['#f06a8c', '#5aa8e0', '#e8a050', '#8a6aff', '#5aa85a', '#f2c14e'];
const FORT = [['GREAT BLESSING', 'EVERYTHING YOU START TODAY WILL GO WELL.'], ['BLESSING', 'A VERY GOOD MEAL IS COMING YOUR WAY.'], ['SMALL BLESSING', 'WALK SLOWLY AND YOU WILL FIND IT.'], ['FUTURE BLESSING', 'NOT YET. BUT SOON.'], ['SMALL CURSE', 'TIE THIS PAPER TO THE RACK AND FORGET ABOUT IT.']];
const nigiri = (x, y, k) => { disc(ctx, x, y, 9, '#c8c0d0'); disc(ctx, x, y - 0.5, 8.5, '#f8f4ea'); disc(ctx, x, y - 0.5, 6, '#e8e4ec'); R(ctx, x - 5, y - 1, 10, 4, '#fffaf0'); R(ctx, x - 6, y - 3.5, 12, 3.5, SUSHI[k][1]); R(ctx, x - 6, y - 3.5, 12, 1, lite(SUSHI[k][1], 0.4)); if (k === 2 || k === 4) R(ctx, x - 1, y - 3.5, 2, 6.5, '#2a3a34'); };
const MG = {
  crane: {
    init(m) { m.x = 90; m.y = 0; m.ph = 0; m.tries = 3; m.got = 0; m.pr = [0, 1, 2, 3, 4].map(i => ({ x: 86 + i * 34 + (Math.random() * 14 - 7), c: FIGC[(i + (Math.random() * 6 | 0)) % 6] })); },
    update(m, dt) {
      if (m.ph === 0) { m.x = Math.max(70, Math.min(250, m.x + ((K.r ? 1 : 0) - (K.l ? 1 : 0)) * 62 * dt)); if (KP.a) { m.ph = 1; Snd.fx('jump'); } }
      else if (m.ph === 1) { m.y += dt * 62; if (m.y >= 56) { m.hit = m.pr.find(p => !p.g && Math.abs(p.x - m.x) < 6.5); m.ph = 2; Snd.fx(m.hit ? 'pick' : 'land'); } }
      else if (m.ph === 2) { m.y -= dt * 46; if (m.y <= 0) { m.y = 0; if (m.hit) { m.hit.g = 1; m.got++; Snd.fx('yay'); } m.tries--; m.hit = null; m.ph = m.got || m.tries <= 0 ? 3 : 0; m.t = 0; } }
      else if (m.t > 1.1) endMini(m.got > 0, m.got ? ['THE CLAW HOLDS! A ROUND LITTLE PLUSH DROPS INTO THE TRAY.'] : ['SO CLOSE. THE CLAW HAS THE GRIP OF A SLEEPY KITTEN.']);
    },
    draw(m) {
      R(ctx, 60, 44, 200, 80, '#cfeaff'); R(ctx, 60, 44, 200, 3, '#f06a8c'); R(ctx, 60, 118, 200, 6, '#f06a8c'); R(ctx, 64, 48, 2, 66, 'rgba(255,255,255,0.6)');
      for (const p of m.pr) { if (p.g) continue; const y = m.hit === p ? 54 + m.y + 12 : 110; disc(ctx, p.x, y, 7, dark(p.c, 0.25)); disc(ctx, p.x, y - 0.5, 6.5, p.c); disc(ctx, p.x - 4, y - 6, 2, p.c); disc(ctx, p.x + 4, y - 6, 2, p.c); R(ctx, p.x - 3, y - 2, 1.5, 1.5, '#1d1626'); R(ctx, p.x + 1.5, y - 2, 1.5, 1.5, '#1d1626'); R(ctx, p.x - 1, y + 1, 2, 1, '#1d1626'); }
      const cy = 50 + m.y; R(ctx, m.x - 0.5, 47, 1, cy - 47, '#6b6478'); R(ctx, m.x - 5, cy, 10, 2, '#9a94a8'); const o = m.ph === 2 ? 2 : 5; R(ctx, m.x - o - 1, cy + 2, 1.5, 7, '#c8c0d4'); R(ctx, m.x + o - 0.5, cy + 2, 1.5, 7, '#c8c0d4'); R(ctx, m.x - o, cy + 8, 2, 1, '#c8c0d4'); R(ctx, m.x + o - 2, cy + 8, 2, 1, '#c8c0d4');
      txtC(ctx, 'CRANE GAME', 160, 30, '#c8382e', null, 2); txtC(ctx, m.ph === 3 ? (m.got ? 'GOT ONE!' : 'NO LUCK...') : 'LEFT / RIGHT TO AIM - E TO DROP - TRIES ' + m.tries, 160, 132, '#3a2e40');
    }
  },
  sushi: {
    init(m) { m.want = Math.random() * 5 | 0; m.score = 0; m.time = 30; m.pl = [0, 1, 2, 3, 4, 5].map(i => ({ x: 70 + i * 44, k: Math.random() * 5 | 0 })); m.msg = 0; },
    update(m, dt) {
      for (const p of m.pl) { p.x -= 42 * dt; if (p.x < 52) { p.x += 264; p.k = Math.random() < 0.4 ? m.want : Math.random() * 5 | 0; } }
      m.time -= dt; if (m.msg > 0) m.msg -= dt;
      if (KP.a) { const p = m.pl.find(q => q.k >= 0 && Math.abs(q.x - 160) < 12); if (p && p.k === m.want) { m.score++; p.k = -1; m.want = Math.random() * 5 | 0; Snd.fx('pick'); m.msg = 0.6; } else { Snd.fx('land'); m.time -= 2; if (p) p.k = -1; } }
      if (m.score >= 3) endMini(true, ['THREE PLATES, EACH ONE BETTER THAN THE LAST.', 'YOU STACK THEM UP AND THE WAITER COUNTS THE BILL.']); else if (m.time <= 0) endMini(false, ['THE PLATES YOU WANTED KEPT SLIDING PAST. YOU SETTLE FOR GREEN TEA.']);
    },
    draw(m) {
      txtC(ctx, 'CONVEYOR SUSHI', 160, 30, '#c8382e', null, 2); R(ctx, 56, 74, 208, 26, '#4a4458'); R(ctx, 56, 74, 208, 2, '#c8c0d4'); R(ctx, 56, 98, 208, 2, '#8a8496'); for (let x = 60 - (G.t * 42) % 10; x < 262; x += 10) if (x > 56) R(ctx, x, 77, U, 20, '#5a5468');
      ctx.save(); ctx.beginPath(); ctx.rect(56, 60, 208, 50); ctx.clip(); for (const p of m.pl) if (p.k >= 0) nigiri(p.x, 87, p.k); ctx.restore();
      R(ctx, 147, 70, 2, 34, '#f2c14e'); R(ctx, 171, 70, 2, 34, '#f2c14e'); R(ctx, 147, 70, 26, 2, '#f2c14e'); R(ctx, 147, 102, 26, 2, '#f2c14e');
      txt(ctx, 'YOU WANT:', 62, 50, '#3a2e40'); nigiri(118, 52, m.want); txt(ctx, SUSHI[m.want][0], 132, 50, '#c8382e'); for (let i = 0; i < 3; i++) disc(ctx, 226 + i * 12, 52, 4, i < m.score ? '#3f9a5a' : '#d9cba8');
      R(ctx, 60, 114, 200, 4, '#d9cba8'); R(ctx, 60, 114, Math.max(0, 200 * m.time / 30), 4, m.time < 8 ? '#c8382e' : '#3f9a5a'); txtC(ctx, m.msg > 0 ? 'ITADAKIMASU!' : 'PRESS E WHEN YOUR PLATE IS IN THE FRAME', 160, 132, '#3a2e40');
    }
  },
  gacha: {
    init(m) { m.f = Math.random() * 6 | 0; }, update(m, dt) { const t0 = m.t - dt; if (t0 < 0.3 && m.t >= 0.3) Snd.fx('coin'); if (t0 < 1.1 && m.t >= 1.1) Snd.fx('land'); if (t0 < 1.9 && m.t >= 1.9) Snd.fx('yay'); if (m.t > 2.4 && KP.a) { const nw = !G.figs[m.f]; G.figs[m.f] = 1; save(); endMini(true, [(nw ? 'NEW FIGURE: ' : 'ANOTHER ') + FIGS[m.f] + '. THAT MAKES ' + count(G.figs) + ' OF 6 IN YOUR COLLECTION.']); } },
    draw(m) {
      txtC(ctx, 'CAPSULE MACHINE', 160, 30, '#c8382e', null, 2); const sh = m.t < 1 ? Math.sin(m.t * 40) * 1 : 0; R(ctx, 132 + sh, 46, 56, 70, '#f4f1e6'); R(ctx, 132 + sh, 46, 56, 2, '#ffffff'); R(ctx, 136 + sh, 50, 48, 36, '#cfeaff'); for (let i = 0; i < 12; i++) disc(ctx, 142 + sh + (i * 17 % 38), 60 + (i * 11 % 22), 4, FIGC[i % 6]); R(ctx, 136 + sh, 90, 48, 20, '#5aa8e0'); disc(ctx, 160 + sh, 100, 6, '#f4f1e6'); R(ctx, 159 + sh + Math.cos(m.t * 8) * (m.t < 1 ? 4 : 0), 99, 2, 2, '#3a3346'); R(ctx, 150, 112, 20, 5, '#1d1626');
      if (m.t > 1.1) { const y = Math.min(122, 112 + (m.t - 1.1) * 40), open = m.t > 1.9; if (!open) { disc(ctx, 204, y, 7, FIGC[m.f]); R(ctx, 197, y, 14, 1, '#1d1626'); disc(ctx, 202, y - 3, 2, '#ffffff'); } else { ctx.drawImage(tint(ICON.fig, FIGC[m.f], 0.45), 190, 84, 42, 42); txtC(ctx, FIGS[m.f], 211, 128, '#c8382e'); } }
      txtC(ctx, m.t > 2.4 ? 'E TO TAKE IT' : 'CLUNK... CLUNK...', 100, 132, '#3a2e40');
    }
  },
  omikuji: {
    init(m) { m.f = Math.random() * FORT.length | 0; }, update(m, dt) { if (m.t < 1.3 && Math.floor(m.t * 8) !== Math.floor((m.t - dt) * 8)) Snd.fx('talk'); if (m.t - dt < 1.4 && m.t >= 1.4) Snd.fx('page'); if (m.t > 2 && KP.a) endMini(true, ['YOUR FORTUNE: ' + FORT[m.f][0] + '.', FORT[m.f][1]]); },
    draw(m) {
      txtC(ctx, 'FORTUNE SLIP', 160, 30, '#c8382e', null, 2); const a = m.t < 1.3 ? Math.sin(m.t * 30) * 4 : 0; R(ctx, 104 + a, 52 - Math.abs(a), 30, 62, '#8a5a3a'); R(ctx, 104 + a, 52 - Math.abs(a), 30, 3, '#c89a6a'); R(ctx, 108 + a, 60 - Math.abs(a), 22, 30, '#c8382e'); txtC(ctx, '100', 119 + a, 72 - Math.abs(a), '#f2c14e'); R(ctx, 116 + a, 49 - Math.abs(a), 6, 3, '#1d1626');
      if (m.t > 1.4) { const k = Math.min(1, (m.t - 1.4) * 3); R(ctx, 158, 110 - k * 62, 76, k * 62, '#fffaf0'); R(ctx, 158, 110 - k * 62, 76, 1, '#d9cba8'); if (k >= 1) { R(ctx, 162, 52, 68, 12, '#c8382e'); txtC(ctx, FORT[m.f][0], 196, 56, '#fff8e8'); wrap(FORT[m.f][1], 64).forEach((l, i) => txtC(ctx, l, 196, 70 + i * 8, '#3a2e40')); } }
      txtC(ctx, m.t > 2 ? 'E TO KEEP IT' : 'SHAKE, SHAKE, SHAKE...', 160, 132, '#3a2e40');
    }
  },
  dress: {
    init(m) { m.i = G.fit; }, update(m) { if (KP.l) { m.i = (m.i + FITS.length - 1) % FITS.length; Snd.fx('ui'); } if (KP.r) { m.i = (m.i + 1) % FITS.length; Snd.fx('ui'); } if (KP.x || KP.b) { G.mg = null; G.state = 'play'; } else if (KP.a && m.t > 0.2) { G.fit = m.i; pl.F = plLook(m.i); save(); Snd.fx('yay'); endMini(m.i !== 0, ['YOU WALK OUT WEARING THE ' + FITN[m.i] + '. IT SUITS YOU.']); } },
    draw(m) {
      txtC(ctx, 'FITTING ROOM', 160, 30, '#c8382e', null, 2); R(ctx, 128, 44, 64, 72, '#8a8496'); R(ctx, 131, 47, 58, 66, '#cfeaff'); R(ctx, 135, 49, 5, 62, '#ffffff'); const f = plLook(m.i).d[Math.floor(G.t * 2) % 2 ? 0 : 5]; ctx.drawImage(f, 140, 54, 40, 56);
      txt(ctx, '<', 112, 78, '#c8382e', null, 2); txt(ctx, '>', 200, 78, '#c8382e', null, 2); FITS.forEach((c, i) => { R(ctx, 105 + i * 14, 120, 10, 6, '#1d1626'); R(ctx, 106 + i * 14, 121, 8, 4, c); if (i === m.i) R(ctx, 105 + i * 14, 127, 10, 1, '#c8382e'); }); txtC(ctx, FITN[m.i] + ' - E TO WEAR IT', 160, 132, '#3a2e40');
    }
  }
};

