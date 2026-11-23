'use strict';
// ---------- minigames: each has init(m), update(m, dt) and draw(m), and finishes by calling endMini(won, lines) ----------
const SUSHI = [['TUNA', '#d8404a'], ['SALMON', '#f08a5a'], ['EGG', '#f2d04a'], ['SHRIMP', '#f8b8a0'], ['CUCUMBER ROLL', '#5aa85a']], FIGS = ['MAGICAL GIRL', 'ROBOT PILOT', 'CAT KNIGHT', 'SPACE IDOL', 'NINJA FROG', 'GOLD DRAGON'], FIGC = ['#f06a8c', '#5aa8e0', '#e8a050', '#8a6aff', '#5aa85a', '#f2c14e'];
const FORT = [['GREAT BLESSING', 'EVERYTHING YOU START TODAY WILL GO WELL.'], ['BLESSING', 'A VERY GOOD MEAL IS COMING YOUR WAY.'], ['SMALL BLESSING', 'WALK SLOWLY AND YOU WILL FIND IT.'], ['FUTURE BLESSING', 'NOT YET. BUT SOON.'], ['SMALL CURSE', 'TIE THIS PAPER TO THE RACK AND FORGET ABOUT IT.']];
// ---------- the vending machine ----------
// Choose a drink, pay, and it clunks into the tray. Then the four-digit lucky number spins: stop all four reels on the same
// digit (ATARI) and the machine gives you a second drink free. Every drink you try goes into your collection (G.cans).
const DRINKS = [ // name, hot, price, colour, shape, the label on the shelf, what it is like
  ['GREEN TEA', 0, 140, '#5aa85a', 'bottle', 'UNSWEETENED, FROM THE FIRST PICKING OF THE YEAR.', 'COLD AND A LITTLE BITTER, LIKE A SHADY TEMPLE GARDEN IN A BOTTLE.'],
  ['MELON SODA', 0, 150, '#4ac878', 'can', 'BRIGHT GREEN. EXTRA FIZZ.', 'IT TASTES OF NO MELON YOU HAVE EVER EATEN, AND YOU LOVE IT.'],
  ['MILK SODA', 0, 150, '#f4f1e6', 'can', 'A FIZZY YOGURT DRINK. THE BLUE DOTS ARE FAMOUS.', 'CREAMY, FIZZY AND A LITTLE SOUR. MUCH NICER THAN IT SOUNDS.'],
  ['SPORTS DRINK', 0, 150, '#5aa8e0', 'bottle', 'FOR WALKING ALL DAY. ALSO FOR SITTING ALL DAY.', 'IT TASTES FAINTLY OF SALT AND VERY MUCH OF BLUE. YOUR LEGS FEEL READY FOR ANOTHER TEMPLE.'],
  ['MILK TEA', 1, 130, '#d8a878', 'tall', 'ROYAL MILK TEA. IT SAYS ROYAL RIGHT THERE ON THE CAN.', 'SWEET AND WARM. YOU HOLD IT IN BOTH HANDS FOR A WHILE BEFORE YOU OPEN IT.'],
  ['CAN COFFEE', 1, 130, '#3a4a7a', 'short', 'TINY CAN. BIG FEELINGS.', 'VERY STRONG AND VERY SWEET. A MAN IN A SUIT NODS AT YOU WITH RESPECT.'],
  ['CORN SOUP', 1, 130, '#f2c14e', 'can', 'SOUP. HOT. FROM A MACHINE. YES, REALLY.', 'CREAMY AND SWEET. THE LAST FEW KERNELS REFUSE TO LEAVE THE CAN, NO MATTER HOW YOU TAP IT.'],
  ['OSHIRUKO', 1, 140, '#a84a48', 'can', 'SWEET RED BEAN SOUP WITH A RICE CAKE INSIDE.', 'THICK, HOT AND SWEET. THE LITTLE RICE CAKE SLIDES OUT ON THE LAST SIP.']
];
const COINS = { 130: [100, 10, 10, 10], 140: [100, 10, 10, 10, 10], 150: [100, 50] };
function drinkSpr(k, ghost) {
  const key = (ghost ? 'drinkG' : 'drink') + k; if (FUR[key]) return FUR[key];
  if (ghost) return FUR[key] = tint(drinkSpr(k), '#e4d8bc', 1);
  const [, , , col, shape] = DRINKS[k], c = mk(9, 16), g = c.g, l = lite(col, 0.35), d = dark(col, 0.3);
  if (shape === 'bottle') {
    const liq = k === 0 ? '#b8d080' : '#dceef8';
    R(g, 3, 0, 3, 2, col); R(g, 3, 0, 3, U, l); R(g, 3.5, 2, 2, 2, '#eef6f8'); R(g, 2, 4, 5, 1.5, '#eef6f8'); R(g, 1, 5, 7, 11, liq); R(g, 1, 5, U, 11, '#ffffff'); R(g, 7.5, 5, U, 11, dark(liq, 0.25));
    R(g, 1, 8, 7, 4.5, col); R(g, 1, 8, 7, U, l); R(g, 3, 9, 3, 2.5, '#f8f4ea'); if (k === 0) { R(g, 4, 9.5, 1, 1.5, '#5aa85a'); p1(g, 4.5, 9.5, '#8fd070'); } else R(g, 3.5, 10, 2, U, '#5aa8e0'); R(g, 1, 15, 7, 1, dark(liq, 0.3));
  } else {
    const h = shape === 'short' ? 10 : shape === 'tall' ? 14 : 12, w = shape === 'short' ? 6 : 7, x = (9 - w) / 2, y = 16 - h;
    R(g, x, y, w, h, col); R(g, x, y, w, 1.5, '#c8c0d4'); R(g, x, y, w, U, '#f4f1f8'); R(g, x + 1, y + U, 1.5, U, '#8a8496'); R(g, x, 15, w, 1, '#a8a0b4');
    if (k === 1) { R(g, x, y + 6, w, 3, dark(col, 0.2)); for (const [a, b] of [[1.5, 3], [4, 4.5], [2.5, 9.5], [5, 11]]) p1(g, x + a, y + b, '#e8fff0'); }
    else if (k === 2) { for (const [a, b] of [[1.5, 3], [4.5, 4], [2.5, 6.5], [5, 8.5], [1.5, 9.5], [3.5, 11]]) disc(g, x + a, y + b, 0.7, '#4a7ad8'); }
    else if (k === 4) { R(g, x, y + 4, w, 5, '#f8f0e0'); R(g, x + 2, y + 5.5, 3, 2, '#8a5a3a'); R(g, x, y + 4, w, U, '#c8a070'); }
    else if (k === 5) { R(g, x, y + 4, w, 3, '#8a5a3a'); R(g, x, y + 4, w, U, '#f2c14e'); R(g, x + 1.5, y + 5, 3, U, '#f8f0e0'); }
    else if (k === 6) { R(g, x + 1.5, y + 4, 4, 6, '#ffe08a'); for (let i = 0; i < 6; i++) p1(g, x + 2 + (i % 2) * 1.5, y + 4.5 + (i >> 1) * 2, '#e8a830'); R(g, x + 5, y + 3.5, 1, 4, '#5aa85a'); }
    else if (k === 7) { disc(g, x + 3.5, y + 7, 2.2, '#f8f0e0'); for (const [a, b] of [[1.5, 3], [5, 4], [1.5, 10.5], [5.5, 10]]) p1(g, x + a, y + b, '#5a2028'); }
    R(g, x + U, y + 1.5, U, h - 2.5, l); R(g, x + w - 1, y + 1.5, 1, h - 2.5, d);
  }
  return FUR[key] = outline(c);
}
function vendDone(m) {
  const gift = m.gift ? m.got.pop() : -1, kinds = [...new Set(m.got)], fresh = kinds.filter(k => !G.cans[k]); for (const k of kinds) G.cans[k] = 1; save();
  const n = count(G.cans), L = m.atari ? ['ATARI! FOUR OF A KIND. THE MACHINE PLAYS A LITTLE TUNE AND DROPS A SECOND DRINK, FREE.'] : [];
  for (const k of m.got) L.push(DRINKS[k][0] + '. ' + DRINKS[k][6]);
  if (gift >= 0) { L.push('YOU GIVE THE ' + DRINKS[gift][0] + ' TO ' + m.gift.name + '. THEY LOOK VERY PLEASED.'); emit('gift', { to: m.gift, d: gift }); }
  if (fresh.length) L.push(n === DRINKS.length ? 'THAT IS EVERY DRINK IN THE MACHINE. YOU ARE NOW A VENDING MACHINE EXPERT.' : 'NEW FOR YOUR COLLECTION: ' + n + ' OF ' + DRINKS.length + ' DRINKS TRIED.');
  endMini(true, L);
}
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
  vend: {
    init(m) { m.vc = (m.sp && m.sp.vc) || '#f4f1e6'; m.i = 0; m.ph = 'pick'; m.pt = 0; m.free = false; m.got = []; m.coins = []; m.reel = [0, 1, 2, 3].map(() => Math.random() * 10 | 0); m.stop = 4; m.shake = 0; m.drop = 1; m.atari = false; m.sayT = 0; },
    update(m, dt) {
      const t0 = m.pt; m.pt += dt; const cross = s => t0 < s && m.pt >= s; if (m.shake > 0) m.shake -= dt; if (m.sayT > 0) m.sayT -= dt; m.drop = Math.min(1, m.drop + dt * 3.5);
      if (KP.x) { if (m.got.length) vendDone(m); else { G.mg = null; G.state = 'play'; } return; }
      if (m.ph === 'pick') {
        const c = m.i % 4, r = m.i >> 2;
        if (KP.l) { m.i = r * 4 + (c + 3) % 4; Snd.fx('ui'); } if (KP.r) { m.i = r * 4 + (c + 1) % 4; Snd.fx('ui'); } if (KP.u || KP.d) { m.i = (m.i + 4) % 8; Snd.fx('ui'); }
        if (KP.a && m.t > 0.2) { m.ph = 'pay'; m.pt = 0; m.coins = m.free ? [] : COINS[DRINKS[m.i][2]]; }
      } else if (m.ph === 'pay') { // coins in, the button, then the clunk
        const done = m.coins.length * 0.16 + 0.15;
        for (let j = 0; j < m.coins.length; j++) if (cross(j * 0.16 + 0.14)) Snd.fx('clink');
        if (cross(done)) Snd.fx('ui');
        if (cross(done + 0.3)) { Snd.fx('gacon'); m.shake = 0.22; m.got.push(m.i); m.drop = 0; m.say = m.free ? 'ENJOY!' : 'ARIGATO!'; m.sayT = 1.3; }
        if (m.pt > done + 1) { m.pt = 0; if (m.free) m.ph = 'take'; else { m.ph = 'roll'; m.stop = 0; } }
      } else if (m.ph === 'roll') { // LED digits that tick over, each reel a little faster than the one before; you get the digit you see
        for (let r = m.stop; r < 4; r++) { const p0 = m.reel[r]; m.reel[r] += dt * (5 + r * 0.6); if (r === m.stop && Math.floor(m.reel[r]) !== Math.floor(p0)) Snd.fx('beep'); }
        if (KP.a) { m.reel[m.stop] = Math.floor(m.reel[m.stop]); m.stop++; Snd.fx('ui'); if (m.stop === 4) { m.ph = 'judge'; m.pt = 0; } }
      } else if (m.ph === 'judge') {
        if (m.pt > 0.7) { const d = m.reel.map(p => Math.floor(p) % 10); m.pt = 0; if (d.every(v => v === d[0])) { m.ph = 'atari'; m.atari = true; Snd.fx('atari'); m.say = 'ATARI! ONE MORE!'; m.sayT = 2.2; } else { m.ph = 'take'; Snd.fx('land'); } }
      } else if (m.ph === 'atari') { if (m.pt > 2.4) { m.ph = 'pick'; m.free = true; m.pt = 0; } }
      else if (m.ph === 'take' && m.pt > 0.3) { m.pal = m.atari && m.got.length > 1 ? NET.near(80) : null; if (KP.a) vendDone(m); else if (KP.r && m.pal) { m.gift = m.pal; vendDone(m); } } // a friend nearby can have the free one
    },
    draw(m) {
      const vc = m.vc, X = 56 + (m.shake > 0 ? Math.round(Math.sin(G.t * 70)) : 0), at = m.ph === 'atari', blink = G.t % 0.3 < 0.15, D = DRINKS[m.i], RX = 152;
      txtC(ctx, 'VENDING MACHINE', 160, 30, '#c8382e', null, 2);
      // the machine: lit sign, a window of drinks with price tags and buttons, the lucky number, the coin slot and the tray
      R(ctx, X - 1, 41, 86, 92, '#1d1626'); R(ctx, X, 42, 84, 90, vc); R(ctx, X, 42, 84, U, lite(vc, 0.6)); R(ctx, X, 42, 1.5, 90, lite(vc, 0.25)); R(ctx, X + 82, 42, 2, 90, dark(vc, 0.22));
      for (let i = 0; i < 10; i++) { const on = at ? ((G.t * 14 | 0) + i) % 3 === 0 : (i + (G.t * 1.5 | 0)) % 2 === 0; disc(ctx, X + 6 + i * 8, 44.5, 1.2, on ? '#ffe86a' : dark(vc, 0.18)); }
      R(ctx, X + 4, 47, 76, 59, '#3a3346'); R(ctx, X + 5, 48, 74, 57, at && blink ? '#fff4c8' : '#e4f6ff'); R(ctx, X + 5, 76, 74, 1.5, '#9ab8c8');
      for (let i = 0; i < 8; i++) {
        const cx = X + 14.25 + (i % 4) * 18.5, y0 = 49 + (i >> 2) * 28, hot = DRINKS[i][1], sel = i === m.i && m.ph === 'pick';
        if (sel && (blink || !m.free)) { R(ctx, cx - 9, y0 - 1, 18, 27, '#ffd84a'); R(ctx, cx - 8, y0, 16, 25, at ? '#fff4c8' : '#f8fcff'); }
        ctx.drawImage(drinkSpr(i), snap(cx - 5.5), y0);
        R(ctx, cx - 8, y0 + 18, 16, 6, hot ? '#e0453a' : '#3f7ab0'); txtC(ctx, m.free ? 'FREE' : String(DRINKS[i][2]), cx, y0 + 18.5, '#fff8e8');
        R(ctx, cx - 3, y0 + 25, 6, 1.5, m.ph !== 'pick' ? '#8a8496' : sel ? '#5ad88a' : m.free && !blink ? '#8a8496' : '#c8f0d0');
      }
      R(ctx, X + 8, 49, 1.5, 54, 'rgba(255,255,255,0.55)'); R(ctx, X + 11, 49, U, 54, 'rgba(255,255,255,0.4)');
      if (at) txtO(ctx, 'ATARI!', X + 42, 68, blink ? '#ffd84a' : '#fff8e8', '#c8382e', 3);
      R(ctx, X + 6, 108, 38, 12, '#1d1626');
      for (let r = 0; r < 4; r++) {
        const x = X + 8 + r * 9, idle = m.ph === 'pick' || m.ph === 'pay', col = idle ? '#6a2a24' : r < m.stop ? '#ff6a48' : '#c84434';
        R(ctx, x, 109, 8, 10, '#2a1418'); if (!(at && blink)) txt(ctx, String(Math.floor(m.reel[r]) % 10), x + 1, 109, col, null, 2);
      }
      R(ctx, X + 52, 108, 12, 12, dark(vc, 0.15)); R(ctx, X + 52, 108, 12, U, dark(vc, 0.4)); R(ctx, X + 57.5, 110, 1, 7, '#1d1626'); R(ctx, X + 68, 109, 8, 5, '#c8c0d4'); R(ctx, X + 68, 109, 8, U, '#ffffff'); R(ctx, X + 68, 116, 8, 3, '#1d1626');
      R(ctx, X + 14, 122, 56, 8, '#1d1626');
      ctx.save(); ctx.beginPath(); ctx.rect(X + 14, 122, 56, 8); ctx.clip();
      m.got.forEach((k, j) => { const last = j === m.got.length - 1, y = 124 - (last ? (1 - m.drop) * 12 - Math.abs(Math.sin(m.drop * 9)) * (1 - m.drop) * 3 : 0), x = X + 20 + j * 16, c = DRINKS[k][3]; R(ctx, x, y, 12, 5, c); R(ctx, x, y, 12, U, lite(c, 0.4)); R(ctx, x, y, 1.5, 5, '#c8c0d4'); R(ctx, x + 10.5, y, 1.5, 5, '#a8a0b4'); });
      ctx.restore(); R(ctx, X + 14, 122, 56, 2.5, 'rgba(170,190,210,0.6)'); R(ctx, X + 14, 122, 56, U, 'rgba(255,255,255,0.7)');
      if (m.sayT > 0) txtO(ctx, m.say, X + 42, 96 - Math.min(1, (1.3 - m.sayT) * 4) * 4, '#fff8e8', '#3a2e40');
      // what is on the label, or the rules of the lucky number while it spins
      if (m.ph === 'roll' || m.ph === 'judge' || at) {
        txt(ctx, 'LUCKY NUMBER', RX, 46, '#c8382e', null, 2); wrap('STOP ALL FOUR ON THE SAME NUMBER AND THE NEXT DRINK IS FREE.', 114).forEach((l, i) => txt(ctx, l, RX, 60 + i * 7, '#6a5a6a'));
      } else {
        txt(ctx, D[0], RX, 46, '#3a2e40', null, tw(D[0], 2) > 114 ? 1 : 2); R(ctx, RX, 58, 21, 7, D[1] ? '#e0453a' : '#3f7ab0'); txtC(ctx, D[1] ? 'HOT' : 'COLD', RX + 10.5, 59, '#fff8e8'); txt(ctx, m.free ? 'FREE!' : D[2] + ' YEN', RX + 25, 59, m.free ? '#c8382e' : '#3a2e40');
        wrap(D[5], 114).slice(0, 4).forEach((l, i) => txt(ctx, l, RX, 70 + i * 7, '#6a5a6a'));
      }
      txt(ctx, 'DRINKS TRIED ' + count(G.cans) + '/' + DRINKS.length, RX, 101, '#8a7a6a'); DRINKS.forEach((_, k) => ctx.drawImage(drinkSpr(k, !G.cans[k]), RX - 1 + k * 13, 108));
      if (m.ph === 'pay' && m.coins.length) { const done = m.coins.length * 0.16 + 0.15; m.coins.forEach((v, j) => { const k = (m.pt - j * 0.16) / 0.14; if (k < 0 || k >= 1 || m.pt > done) return; const x = X + 100 - k * 42, y = 113 - Math.sin(k * 3.14) * 6; disc(ctx, x, y, 2.6, '#1d1626'); disc(ctx, x, y, 2.1, v === 10 ? '#d08a4a' : '#d8d4e0'); if (v === 50) disc(ctx, x, y, 0.7, '#1d1626'); p1(ctx, x - 1, y - 1, '#ffffff'); }); }
      const B = { pick: m.free ? 'ATARI! PICK ONE MORE, IT IS FREE' : '< > CHOOSE - E BUY', pay: m.pt > m.coins.length * 0.16 + 0.45 ? 'GACON!' : m.free ? '' : 'CLINK... CLINK...', roll: 'E TO STOP NUMBER ' + (m.stop + 1) + ' OF 4', judge: '...', atari: 'ATARI!! ATARI!!', take: m.pal ? 'E TAKE BOTH - > GIVE ONE TO ' + m.pal.name : m.atari ? 'E TO TAKE THEM BOTH' : 'NOT THIS TIME. E TO TAKE YOUR DRINK' };
      txtC(ctx, B[m.ph], 160, 136, '#3a2e40');
    }
  },
  // catch a cherry petal before it touches the ground and your wish comes true, they say
  petal: {
    init(m) { m.hx = 160; m.p = []; m.next = 0.4; m.done = 0; m.got = 0; m.miss = 0; },
    update(m, dt) {
      if (m.done) { if (m.t > m.done + 1.3) endMini(false, m.got ? ['A PETAL LANDS IN YOUR CUPPED HANDS. THEY SAY IF YOU CATCH ONE BEFORE IT TOUCHES THE GROUND, YOUR WISH COMES TRUE.', 'YOU MAKE A WISH. YOU DO NOT TELL ANYONE WHAT IT WAS.'] : ['THE PETALS SLIP PAST YOUR FINGERS EVERY TIME, SWAYING JUST AS YOU REACH. HARDER THAN IT LOOKS.', 'A CHILD NEARBY CATCHES ONE FIRST TRY AND LOOKS AT YOU WITH PITY.']); return; }
      if (K.l) m.hx = Math.max(64, m.hx - 80 * dt); if (K.r) m.hx = Math.min(256, m.hx + 80 * dt);
      m.next -= dt; if (m.next <= 0 && m.p.length < 3) { m.p.push({ x: 72 + Math.random() * 176, y: 44, ph: Math.random() * 6.3, vy: 13 + Math.random() * 7, sw: 14 + Math.random() * 12 }); m.next = 0.9 + Math.random() * 1.1; }
      for (const p of m.p) { p.y += p.vy * dt; p.x += Math.sin(m.t * 2.2 + p.ph) * p.sw * dt; if (!p.gone && p.y > 104 && p.y < 112 && Math.abs(p.x - m.hx) < 10) { p.gone = 1; m.got = 1; m.done = m.t; Snd.fx('yay'); } else if (!p.gone && p.y > 118) { p.gone = 1; m.miss++; Snd.fx('ui'); } }
      m.p = m.p.filter(p => !p.gone); if (m.t > 18 && !m.done) m.done = m.t;
    },
    draw(m) {
      txtC(ctx, 'CATCH A FALLING PETAL', 160, 26, '#c8486a');
      for (let x = 52; x < 270; x += 9) { disc(ctx, x, 40 + Math.sin(x * 0.3) * 2, 4, '#eeb2c6'); disc(ctx, x - 1, 39 + Math.sin(x * 0.3) * 2, 2.2, '#fdebf1'); } line(ctx, 48, 42, 272, 38, '#46323a');
      R(ctx, 52, 118, 216, 2, '#8a6a48'); for (let x = 56; x < 266; x += 7) R(ctx, x, 116 + (x % 3), 2, U, '#f9c8d8');
      for (const p of m.p) { const f = Math.sin(m.t * 5 + p.ph); ell(ctx, p.x, p.y, 3.2, 1.6 + Math.abs(f) * 1.2, '#f4b0c8'); ell(ctx, p.x - 0.6, p.y - 0.4, 1.8, 0.9 + Math.abs(f) * 0.6, '#fdebf1'); R(ctx, p.x + 2.4, p.y - 0.5, 1, 1, '#f8f0e8'); }
      const hx = m.hx; ell(ctx, hx, 111, 12, 4.5, '#d8a070'); ell(ctx, hx, 110, 11, 3.8, '#f6cfa6'); ell(ctx, hx, 109.5, 7, 1.8, '#e8b890'); R(ctx, hx - 0.5, 106.5, 1, 7, '#d8a070'); for (const s2 of [-1, 1]) R(ctx, hx + s2 * 11, 107, 2, 5, '#f6cfa6');
      if (m.got) { ell(ctx, hx + 3, 108.5, 3, 1.6, '#f4b0c8'); txtC(ctx, 'CAUGHT ONE!', 160, 92, '#c8486a'); }
      txtC(ctx, m.done ? '' : '< > MOVE YOUR HANDS UNDER A PETAL', 160, 129, '#8a7a6a');
    }
  },
  dress: {
    init(m) { m.kim = !!(m.sp && m.sp.kimono); m.lo = m.kim ? KIMONO : 0; m.n = m.kim ? FITS.length - KIMONO : KIMONO; m.i = G.fit >= m.lo && G.fit < m.lo + m.n ? G.fit : m.lo; }, update(m) { const j = m.i - m.lo; if (KP.l) { m.i = m.lo + (j + m.n - 1) % m.n; Snd.fx('ui'); } if (KP.r) { m.i = m.lo + (j + 1) % m.n; Snd.fx('ui'); } if (KP.x || KP.b) { G.mg = null; G.state = 'play'; } else if (KP.a && m.t > 0.2) { G.fit = m.i; pl.F = plLook(m.i); save(); Snd.fx('yay'); endMini(m.kim || m.i !== 0, m.kim ? ['YOU WALK OUT IN A ' + FITN[m.i] + ', WOODEN SANDALS CLACKING ON THE STONES.', 'THREE TOURISTS ASK TO TAKE YOUR PHOTO.'] : ['YOU WALK OUT WEARING THE ' + FITN[m.i] + '. IT SUITS YOU.']); } },
    draw(m) {
      txtC(ctx, m.kim ? 'KIMONO RENTAL' : 'FITTING ROOM', 160, 30, '#c8382e', null, 2); R(ctx, 128, 44, 64, 72, '#8a8496'); R(ctx, 131, 47, 58, 66, '#cfeaff'); R(ctx, 135, 49, 5, 62, '#ffffff'); const f = plLook(m.i).d[Math.floor(G.t * 2) % 2 ? 0 : 5]; ctx.drawImage(f, 140, 54, 40, 56);
      txt(ctx, '<', 112, 78, '#c8382e', null, 2); txt(ctx, '>', 200, 78, '#c8382e', null, 2); FITS.slice(m.lo, m.lo + m.n).forEach((c, j) => { const i = m.lo + j, x = 160 - m.n * 7 + j * 14; R(ctx, x, 120, 10, 6, '#1d1626'); R(ctx, x + 1, 121, 8, 4, c); if (i === m.i) R(ctx, x, 127, 10, 1, '#c8382e'); }); txtC(ctx, FITN[m.i] + ' - E TO WEAR IT', 160, 132, '#3a2e40');
    }
  }
};

