'use strict';
// ---------- menus: the title screen, the menu while walking, your traveller, settings, how to play, starting over, joining ----------
// The title screen is its own painted scene (Fuji at dusk, a pagoda, sakura, a shinkansen gliding past) with the menu as a
// list of words and a cursor. Every other menu is a dark card in the same style. Arrow keys and E, or one tap on a line;
// Esc, or a tap outside, goes back. Screens opened from a menu (the stamp book, PLAY TOGETHER) come back to it when they
// close: G.ret holds which menu that is, and G.mstack the way back through menus.
const MENU = (function () {
  const box = document.getElementById('code');
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  let hits = [], scene = null, seal = null;
  // from: the menu (or 'tog') this one was opened from; o: extra state (first: the traveller screen before a new trip)
  function open(kind, from, o) { G.mstack = from ? (G.mstack || []).concat(from) : []; G.state = 'menu'; G.menu = Object.assign({ kind, sel: 0, t: 0 }, o); Snd.fx('page'); if (kind === 'join') { box.value = ''; setTimeout(() => { try { box.focus({ preventScroll: true }); } catch (e) { } }, 0); } }
  // open something that is not a menu (the book, PLAY TOGETHER), and come back to this menu after it
  const sub = fn => () => { G.ret = G.menu.kind; fn(); };
  // close a screen: back to the menu it came from, or to the walk
  function done() { const r = G.ret; G.ret = null; if (r === 'tog') NET.open(); else if (r) open(r); else G.state = 'play'; }
  function back() { const st = G.mstack || []; if (!st.length) return false; const prev = st.pop(); if (prev === 'tog') NET.open(); else { G.state = 'menu'; G.menu = { kind: prev, sel: 0, t: 0 }; G.mstack = st; } return true; }
  function start() {
    G.begun = true; G.state = 'play'; G.banner = 3.5; G.fade = 1; Snd.play(M.def.music); Snd.fx('ui'); if (TOUCH) fullscreen(true);
    if (!G.hasSave && !G.arrived) { if ((G.beginAt === 'bkk' || G.beginAt === 'bkx') && window.BKK) { BKK.begin(); if (G.beginAt === 'bkx') BKK.express(); } else AIR.intro(); }
    if (G.seen !== GAME.version) { if (G.hasSave) NET.say('UPDATED TO VERSION ' + GAME.version + '. SEE WHAT IS NEW IN THE MAIN MENU.', 6); G.seen = GAME.version; save(); }
  }
  function reset() { G.stamps = {}; G.figs = {}; G.cats = {}; G.cans = {}; G.ema = {}; G.knots = {}; G.steps = 0; G.ic = 0; G.arrived = 0; G.umbrella = 0; G.inn = {}; G.dayOff = 0; G.tix = {}; G.seats = 0; G.fit = 0; G.hasSave = false; G.begun = false; pl.F = plLook(0); go(CLIST[0].start); G.banner = 0; save(); open('main'); Snd.fx('page'); }
  const news = () => { G.state = 'book'; G.bk = BOOKP().length - 1; G.cl = 0; G.seen = GAME.version; save(); };
  const where = () => (G.zn && !M.indoor ? G.zn[4] : M.def.name.split(' - ')[0]);
  const togSub = () => NET.on ? 'ROOM ' + NET.code + ' - ' + (OTHERS.length ? OTHERS.length + 1 + ' OF YOU' : 'WAITING FOR FRIENDS') : 'EXPLORE WITH FRIENDS';
  const code = () => { const v = box.value.toUpperCase(), m = /ROOM=([A-Z0-9]+)/.exec(v); return (m ? m[1] : v).replace(/[^A-Z0-9]/g, '').slice(0, 8); }; // a pasted invite link works too
  function join() { const c = code(); if (c.length < 4) { Snd.fx('land'); return; } box.blur(); NET.join(c); Snd.fx('yay'); NET.open(); }
  const dress = () => { pl.F = plLook(G.fit); save(); };
  const HELP = TOUCH
    ? ['WALK: DRAG ANYWHERE ON THE LEFT SIDE OF THE SCREEN.', 'E: TALK, LOOK, GO IN, BUY. X: BACK.', 'BOOK: YOUR STAMPS. THE MENU BUTTON: EVERYTHING ELSE.', 'TAP TO MOVE ON IN A CONVERSATION OR TO PICK FROM A LIST.']
    : ['ARROWS OR WASD: WALK. E, SPACE OR ENTER: TALK, LOOK, GO IN, BUY.', 'TAB OR B: STAMP BOOK. ESC OR P: THIS MENU.', 'T: PLAY TOGETHER. C: SAY SOMETHING. M: SOUND. F: FULLSCREEN.', 'IN THE STAMP BOOK, LEFT AND RIGHT TURN THE PAGE.'];
  // what each menu holds. t: label, s: a line about it, v: a value changed with left/right (or a tap), sw: a colour swatch, go: what E does
  const ITEMS = {
    main: () => [
      G.hasSave || G.begun ? { t: 'CONTINUE', s: where() + ', ' + CITY.name + ' - ' + count(G.stamps) + ' STAMPS', go: start } : { t: 'START YOUR TRIP', s: 'CHOOSE YOUR TRAVELLER, THEN FLY TO JAPAN', go: () => open('look', 'main', { first: true }) },
      (G.hasSave || G.begun) && { t: 'YOUR TRAVELLER', s: 'HAIR, CLOTHES, BAG', go: () => open('look', 'main') },
      { t: 'PLAY TOGETHER', s: togSub(), go: sub(NET.open) },
      { t: 'WHAT IS NEW', s: 'VERSION ' + GAME.version + ': ' + CHANGELOG[0][2], badge: G.seen !== GAME.version, go: sub(news) },
      { t: 'SETTINGS', s: 'SOUND, SCREEN, YOUR NAME, CONTROLS', go: () => open('settings', 'main') },
      (G.hasSave || G.begun) && { t: 'NEW TRIP', s: 'START AGAIN FROM THE BEGINNING', go: () => open('confirm', 'main') }
    ],
    pause: () => [
      { t: 'BACK TO THE WALK', go: () => { G.state = 'play'; Snd.fx('page'); } },
      { t: 'STAMP BOOK', s: got(CITY) + ' OF ' + nst(CITY) + ' STAMPS IN ' + CITY.name, go: sub(() => { G.state = 'book'; G.bk = CLIST.indexOf(CITY); }) },
      { t: 'YOUR TRAVELLER', s: 'HAIR, CLOTHES, BAG', go: () => open('look', 'pause') },
      { t: 'PLAY TOGETHER', s: togSub(), go: sub(NET.open) },
      NET.on && { t: 'SAY SOMETHING', s: 'A BOW, A CHEER OR A FEW WORDS', go: NET.openSay },
      { t: 'SETTINGS', s: 'SOUND, SCREEN, YOUR NAME, CONTROLS', go: () => open('settings', 'pause') },
      { t: 'MAIN MENU', go: () => open('main') }
    ],
    look: () => {
      const L = G.look, ch = (k, d) => { L[k] = (L[k] + (d < 0 ? LOOKOPT[k].length - 1 : 1)) % LOOKOPT[k].length; dress(); };
      const nm = k => { const o = LOOKOPT[k][L[k]]; return Array.isArray(o) ? o[0] : o; }, sw = k => Array.isArray(LOOKOPT[k][L[k]]) ? LOOKOPT[k][L[k]][1] : null;
      return [
        { t: 'HAIR', v: nm('hair'), lr: d => ch('hair', d) },
        { t: 'HAIR COLOUR', v: nm('hc'), sw: sw('hc'), lr: d => ch('hc', d) },
        { t: 'SKIN', v: '', sw: sw('sk'), lr: d => ch('sk', d) },
        { t: 'TOP', v: FITN[G.fit], sw: FITS[G.fit], s: G.fit >= KIMONO ? 'A KIMONO FROM KYOTO. CHANGE IT FOR A JACKET HERE.' : 'MORE AT THE HARAJUKU FITTING ROOM AND THE KYOTO KIMONO SHOP', lr: d => { G.fit = G.fit >= KIMONO ? 0 : (G.fit + (d < 0 ? KIMONO - 1 : 1)) % KIMONO; dress(); } },
        { t: 'BOTTOMS', v: nm('bot'), lr: d => ch('bot', d) },
        { t: L.bot ? 'SKIRT COLOUR' : 'TROUSER COLOUR', v: nm('bc'), sw: sw('bc'), lr: d => ch('bc', d) },
        { t: 'BAG', v: nm('bag'), sw: sw('bag'), s: 'A CAP TAKES THE COLOUR OF THE BAG', lr: d => ch('bag', d) },
        { t: 'SURPRISE ME', go: () => { for (const k of LOOK_KEYS) L[k] = Math.random() * LOOKOPT[k].length | 0; G.fit = Math.random() * KIMONO | 0; dress(); Snd.fx('yay'); } },
        G.menu.first ? { t: "LET'S GO", s: 'YOU CAN CHANGE ALL THIS LATER.', hi: true, go: () => open('begin', 'look', { first: true }) } : { t: 'DONE', go: back }
      ];
    },
    settings: () => [
      { t: 'SOUND', v: Snd.on ? 'ON' : 'OFF', lr: () => { Snd.toggle(); save(); } },
      FS_OK && { t: 'FULLSCREEN', v: isFs() ? 'ON' : 'OFF', lr: () => fullscreen() },
      { t: 'YOUR NAME', s: 'WHAT FRIENDS SEE ABOVE YOUR HEAD', v: G.name, lr: d => { G.name = NAMES[(NAMES.indexOf(G.name) + (d < 0 ? NAMES.length - 1 : 1)) % NAMES.length]; save(); } },
      { t: 'HOW TO PLAY', go: () => open('help', 'settings') },
      { t: 'BACK', go: back }
    ],
    help: () => [{ t: 'BACK', go: back }],
    begin: () => [{ t: 'FROM BANGKOK', s: 'CHECK IN AT SUVARNABHUMI AIRPORT AND FLY TO TOKYO. ABOUT TEN MINUTES.', hi: true, go: () => { G.beginAt = 'bkk'; start(); } }, { t: 'FROM BANGKOK, EXPRESS', s: 'SKIP CHECK-IN, PASSPORTS AND SECURITY: STRAIGHT ONTO THE PLANE.', go: () => { G.beginAt = 'bkx'; start(); } }, { t: 'STRAIGHT TO TOKYO', s: 'BEGIN WITH THE LANDING AT HANEDA.', go: () => { G.beginAt = 'hnd'; start(); } }],
    flight: () => { const P = AIR.PORTS, me = G.menu.port; return Object.keys(P).filter(k => k !== me).map(k => ({ t: 'TO ' + P[k].name, s: P[k].intl ? 'ABOUT SIX HOURS, OVER THE SEA.' : 'ABOUT AN HOUR. A WINDOW SEAT, OF COURSE.', go: () => (G.menu.express ? AIR.express : AIR.checkin)(k) })).concat([{ t: 'FLY HOME', s: 'END YOUR TRIP WITH A SCRAPBOOK. YOU CAN KEEP WANDERING AFTER.', go: AIR.home }, { t: 'NOT YET', go: () => { G.state = 'play'; Snd.fx('page'); } }]); },
    express: () => [{ t: 'YES, STRAIGHT TO MY SEAT', s: 'NO STAMPS FOR THE STEPS YOU SKIP.', hi: true, go: () => G.menu.yes() }, { t: 'NO, THE WHOLE AIRPORT', go: () => { G.state = 'play'; Snd.fx('page'); } }],
    confirm: () => [{ t: 'KEEP MY TRIP', go: back }, { t: 'START OVER', s: 'THIS CANNOT BE UNDONE', red: true, go: reset }],
    join: () => [{ t: 'JOIN', s: code().length >= 4 ? 'ROOM ' + code() : 'TYPE THE CODE FIRST', off: code().length < 4, go: join }, { t: 'BACK', go: back }]
  };
  const HEAD = {
    begin: () => ['WHERE DOES YOUR TRIP BEGIN?', 'YOU CAN FLY BACK TO BANGKOK FROM ANY AIRPORT LATER.'],
    flight: () => [(AIR.PORTS[G.menu.port] || {}).name || 'GATE', G.menu.express ? 'EXPRESS: NO QUEUES, STRAIGHT TO YOUR SEAT. WHERE TO?' : 'WHERE ARE YOU FLYING TODAY?'],
    pause: () => [where(), CITY.name], look: () => [G.menu.first ? 'WHO IS TRAVELLING?' : 'YOUR TRAVELLER'], settings: () => ['SETTINGS'], help: () => ['HOW TO PLAY', ...HELP],
    express: () => ['EXPRESS LANE', 'SKIP CHECK-IN, PASSPORT CONTROL AND SECURITY?'],
    confirm: () => ['START A NEW TRIP?', 'YOUR STAMPS, FIGURES, CATS AND DRINKS WILL ALL BE GONE.'],
    join: () => ['JOIN A ROOM', 'TYPE THE CODE YOUR FRIEND SENT YOU, OR PASTE THEIR INVITE LINK.']
  };
  const items = () => ITEMS[G.menu.kind]().filter(Boolean);

  function update(dt) {
    const m = G.menu, L = items(); m.t += dt; m.sel = Math.min(m.sel, L.length - 1);
    if (m.kind === 'main' && Snd.track !== 'fuji') Snd.play('fuji'); // the title has its own tune
    if (KP.u) { m.sel = (m.sel + L.length - 1) % L.length; Snd.fx('ui'); } if (KP.d) { m.sel = (m.sel + 1) % L.length; Snd.fx('ui'); }
    const it = L[m.sel];
    if ((KP.l || KP.r) && it.lr) { it.lr(KP.l ? -1 : 1); Snd.fx('ui'); }
    else if (KP.a && m.t > 0.15) use(it);
    else if (KP.x || KP.p || KP.b) { if (m.kind === 'pause' || m.kind === 'flight' || m.kind === 'express') { G.state = 'play'; Snd.fx('page'); } else if (back()) Snd.fx('page'); }
  }
  function use(it, d) { if (it.off) { Snd.fx('land'); return; } if (it.lr) { it.lr(d || 1); Snd.fx('ui'); } else it.go(); }
  function tap(p) {
    const h = hits.find(b => p.x >= b[0] && p.x <= b[0] + b[2] && p.y >= b[1] && p.y <= b[1] + b[3]);
    if (!h) { if (G.menu.kind === 'pause' || G.menu.kind === 'flight' || G.menu.kind === 'express') G.state = 'play'; else back(); return; }
    G.menu.sel = h[4]; use(items()[h[4]], h[5] != null && Math.abs(p.x - h[5]) < 12 ? -1 : 1); // on a value, a tap on the left arrow steps back
  }

  // ---- the title scene: painted once per screen size, then lanterns, stars, petals and a passing train on top
  const horizon = () => Math.round(H * (H > W ? 0.8 : 0.66)); // lower on an upright phone, so the sky fills it
  function paintScene() {
    if (scene && scene.lw === W && scene.lh === H) return scene;
    const c = mk(W, H), g = c.g, r = RNG(77), hz = horizon();
    dgrad(g, 0, 0, W, hz + 2, ['#191432', '#33285a', '#6e4478', '#c8707e', '#f4ae84']);
    for (let i = 0; i < W * H / 700; i++) { const y = r() * hz * 0.5; p1(g, r() * W, y, r() < 0.25 ? '#fff8e8' : '#9a88c8'); }
    disc(g, W * 0.25, hz - 4, 16, '#ffd29a'); disc(g, W * 0.25, hz - 4, 12, '#ffe6bc');
    for (let i = 0; i < 4; i++) { const y = 12 + r() * hz * 0.45, x = r() * W; ell(g, x, y, 18 + r() * 22, 1.5, '#8a6a9a'); ell(g, x + 6, y - 1, 10, 1, '#a88aa8'); }
    const fh = Math.min(H * 0.4, 130), fw = Math.min(W * 0.46, fh * 2.7); mountain(g, W * 0.66, hz, fw, fh, '#4a3a72', r, '#f6d0dc');
    for (let x = -30; x < W + 30; x += 26) ell(g, x + r() * 18, hz + 3, 26 + r() * 22, 8 + r() * 5, '#2c2246');
    ell(g, W * 0.15, hz + 4, 46, 16, '#231b3a'); pagoda(g, W * 0.15, hz - 4, 5, 22, { wall: '#3c2444', roof: '#1a1228', panel: '#6a4058', bh: 5, rh: 4, step: 3 });
    R(g, 0, hz + 6, W, H - hz, '#1e1730'); R(g, 0, hz + 21, W, 2.5, '#352a4e'); R(g, 0, hz + 21, W, U, '#6a5a88'); // the rail embankment
    for (const left of [1, 0]) { // sakura in the near corners
      const bx = left ? W * 0.07 : W * 0.93; R(g, bx - 1.5, H - H * 0.2, 3, H * 0.2, '#2a1a26');
      for (let i = 0; i < 16; i++) { const x = bx + (r() - 0.5) * W * 0.28, y = H - H * 0.2 - r() * H * 0.12; disc(g, x, y, 5 + r() * 7, '#9a4a78'); disc(g, x - 1, y - 1, 4 + r() * 5, '#d87aa4'); disc(g, x - 2, y - 2, 1.5 + r() * 2.5, '#ffc4da'); }
    }
    return scene = c;
  }
  function drawScene() {
    ctx.drawImage(paintScene(), 0, 0); const t = G.t, hz = horizon();
    for (let i = 0; i < 14; i++) { const a = Math.sin(t * 1.7 + i * 2.1); if (a > 0.6) p1(ctx, hsh(i, 3) * W, hsh(i, 9) * hz * 0.45, '#ffffff'); }
    const p = t % 17; if (p < 4) { // a shinkansen glides along the embankment every so often
      const x = W + 10 - p / 4 * (W + 240), y = hz + 14;
      ell(ctx, x + 3, y + 3.5, 10, 3.5, '#f4f1e6'); R(ctx, x + 3, y, 200, 7, '#f4f1e6'); R(ctx, x + 3, y + 4.5, 200, 1, '#3f7ab0'); R(ctx, x + 3, y + 6, 200, 1, '#c8c0d4');
      for (let k = 12; k < 200; k += 5) R(ctx, x + k, y + 1.5, 3, 1.5, '#ffe6a0'); for (let k = 40; k < 200; k += 40) R(ctx, x + k, y, U, 7, '#c8c0d4');
    }
    for (const [lx, ph] of [[W * 0.06, 0], [W * 0.94, 1.7]]) { const sw = Math.sin(t * 1.3 + ph) * 1.5; R(ctx, lx, 0, U, 10, '#2a2430'); chochin(ctx, lx + sw, 10, '#e0452f', 2); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glowSpr(18, '#ff8a4a'), lx + sw - 18, 2); ctx.globalCompositeOperation = 'source-over'; }
    for (const q of PRT) { R(ctx, q.x, q.y, 1.5, 1, q.c); p1(ctx, q.x + (Math.sin(t * 4 + q.ph) > 0 ? 1.5 : -U), q.y + U, q.c); }
  }
  // the red seal by the logo, like the stamps in your book
  function sealOf(s) { if (seal && seal.lw === s) return seal; const c = mk(s, s), g = c.g; R(g, 0, 0, s, s, '#c8382e'); R(g, 1, 1, s - 2, s - 2, '#d8483a'); R(g, 2, 2, s - 4, U, '#ff8a7a'); const k = Math.floor((s - 4) / 12) || 1, ic = tint(ICON.torii, '#fff8e8', 1); g.drawImage(ic, (s - ic.lw * k) / 2, (s - ic.lh * k) / 2, ic.lw * k, ic.lh * k); return seal = c; }

  function drawMain(L) {
    const m = G.menu, big = H >= 300, lg = big ? 9 : H >= 220 ? 6 : 5, rh = big ? 30 : TOUCH ? 19 : 16, top = Math.round(big ? H * 0.12 : Math.max(10, (H - (lg * 5 + 24 + L.length * rh + 30)) / 2));
    drawScene();
    const lw = tw(GAME.title, lg), ss = lg * 5, lx = Math.round(W / 2 - (lw + ss + lg * 2) / 2);
    txtO(ctx, GAME.title, lx + lw / 2, top, '#fff8e8', '#1d1626', lg); ctx.drawImage(sealOf(ss), lx + lw + lg * 2, top + Math.sin(G.t * 1.2) * 0.5);
    txtO(ctx, 'A SLOW WALK THROUGH JAPAN', W / 2, top + ss + (big ? 10 : 7), '#ffd8a8', '#1d1626');
    let y = top + ss + (big ? 34 : 22); hits = [];
    L.forEach((it, i) => {
      const sel = i === m.sel, w = tw(it.t, 2), x = Math.round(W / 2 - w / 2), ty = y + (rh - 10) / 2;
      if (sel) { R(ctx, W / 2 - w / 2 - 22, y + 1, w + 44, rh - 2, 'rgba(20,12,36,0.55)'); ctx.drawImage(ICON.torii, x - 17 + Math.round(Math.sin(G.t * 6) * 1), ty - 1); }
      txtO(ctx, it.t, W / 2, ty, sel ? '#ffd84a' : '#fff8e8', '#1d1626', 2);
      if (it.badge) { const bx = x + w + 6; R(ctx, bx, ty + 1, 21, 8, '#c8382e'); txt(ctx, 'NEW', bx + 4, ty + 2.5, '#fff8e8'); }
      hits.push([Math.min(x - 24, W / 2 - 80), y, Math.max(w + 48, 160), rh, i]); y += rh;
    });
    const it = L[m.sel]; if (it && it.s) wrap(it.s, W - 30).slice(0, 2).forEach((l, i) => txtO(ctx, l, W / 2, y + 5 + i * 8, '#e8d4c0', '#1d1626'));
    txtO(ctx, 'V' + GAME.version, 14, H - 10, '#a898c0', '#1d1626'); if (!TOUCH) txtO(ctx, 'ARROWS AND E', W - 14 - tw('ARROWS AND E') / 2, H - 10, '#a898c0', '#1d1626');
  }
  // the cards: a title, a few lines of text, rows (label on the left, value on the right), and a note about the chosen row
  function preview(x, y, w, h) {
    R(ctx, x, y, w, h, 'rgba(255,248,232,0.06)'); R(ctx, x, y + h - 1, w, 1, 'rgba(255,248,232,0.15)');
    const F = pl.F, k = Math.floor(G.t * 7), d = ['d', 'r', 'u', 'l'][Math.floor(G.t / 1.8) % 4], fr = d === 'd' ? F.d[1 + k % 4] : d === 'u' ? F.u[1 + k % 4] : F.s['walk' + k % 8][d === 'l' ? 1 : 0];
    const sc = Math.max(2, Math.min(5, Math.floor((h - 10) / fr.lh))), fx = Math.round(x + w / 2 - fr.lw * sc / 2), fy = Math.round(y + h - 6 - fr.lh * sc);
    ell(ctx, x + w / 2, y + h - 7, 6 * sc, 1.6 * sc, 'rgba(10,6,20,0.45)'); ctx.drawImage(fr, fx, fy, fr.lw * sc, fr.lh * sc);
  }
  function drawCard(L) {
    const m = G.menu, big = H >= 300, look = m.kind === 'look', side = look && !big, head = HEAD[m.kind]();
    const sc = big || (TOUCH && L.length <= 7) ? 2 : 1, rh = big ? 26 : sc === 2 ? 19 : 14, pw = Math.min(W - 12, side ? 330 : big ? 280 : 270), lw = side ? 104 : 0;
    const lines = head.slice(1).flatMap(l => wrap(l, pw - 24)), boxH = m.kind === 'join' ? (big ? 36 : 28) : 0, prevH = look && big ? 104 : 0, note = 16;
    const ph = 26 + (lines.length ? lines.length * 8 + 6 : 0) + boxH + prevH + L.length * rh + note, x = Math.floor((W - pw) / 2), y = Math.max(4, Math.floor((H - ph) / 2 - (big && TOUCH ? 20 : 0)));
    R(ctx, 0, 0, W, H, 'rgba(12,8,24,0.62)');
    R(ctx, x, y, pw, ph, 'rgba(24,16,40,0.94)'); R(ctx, x, y, pw, U, '#fff8e8'); R(ctx, x, y + ph - U, pw, U, '#fff8e8'); R(ctx, x, y, U, ph, '#fff8e8'); R(ctx, x + pw - U, y, U, ph, '#fff8e8');
    R(ctx, x + 3, y + 3, pw - 6, U, 'rgba(255,248,232,0.25)'); R(ctx, x + 3, y + ph - 3, pw - 6, U, 'rgba(255,248,232,0.25)');
    txtO(ctx, head[0], W / 2, y + 8, m.kind === 'confirm' ? '#ff9a8a' : '#ffd84a', '#1d1626', 2);
    let yy = y + 26; lines.forEach((l, i) => txt(ctx, l, W / 2 - tw(l) / 2, yy + i * 8, '#e4d8c8')); if (lines.length) yy += lines.length * 8 + 6;
    if (boxH) { place(x + 12, yy, pw - 24, boxH - 8); yy += boxH; }
    if (look) { if (side) preview(x + 8, yy, lw - 12, L.length * rh); else { preview(x + 10, yy, pw - 20, prevH - 8); yy += prevH; } }
    const rx = x + 6 + lw, rw = pw - 12 - lw; hits = [];
    const vs = L.every(it => it.v == null || tw(it.t, sc) + tw('< ' + it.v + ' >', sc) + (it.sw ? 14 : 0) + 24 < rw) ? sc : 1; // one size for every value on the card
    L.forEach((it, i) => {
      const sel = i === m.sel, ry = yy + i * rh, ty = ry + (rh - 5 * sc) / 2, col = it.off ? '#8a7a8a' : it.red ? '#ff8a7a' : it.hi ? '#ffd84a' : sel ? '#ffd84a' : '#fff8e8';
      if (sel) { R(ctx, rx, ry + 1, rw, rh - 2, 'rgba(255,248,232,0.1)'); R(ctx, rx, ry + 1, 2, rh - 2, '#e0452f'); }
      txt(ctx, it.t, rx + 8, ty, col, null, sc); let ax = null;
      if (it.v != null) {
        const v = it.v, gx = rx + rw - 8, vw = tw(v, vs), sw = it.sw ? 9 : 0, aw = tw('>', vs);
        const vx = gx - aw - 4 - vw - (sw && v ? sw + 3 : sw), vy = ry + (rh - 5 * vs) / 2, c2 = sel ? '#ffd84a' : '#c8b8d8';
        txt(ctx, '>', gx - aw, vy, c2, null, vs); if (v) txt(ctx, v, vx + (sw ? sw + 3 : 0), vy, sel ? '#fff8e8' : '#c8b8d8', null, vs);
        if (sw) { R(ctx, vx - U, ry + rh / 2 - 4 - U, sw + 2 * U, 8 + 2 * U, '#fff8e8'); R(ctx, vx, ry + rh / 2 - 4, sw, 8, it.sw); }
        ax = vx - 6 - tw('<', vs); txt(ctx, '<', ax, vy, c2, null, vs); ax += tw('<', vs) / 2;
      }
      hits.push([rx, ry, rw, rh, i, ax]);
    });
    const it = L[m.sel], n = it && it.s ? it.s : !TOUCH ? (m.kind === 'pause' ? 'ESC TO GO BACK TO THE WALK' : 'ESC TO GO BACK') : '';
    if (n) txtC(ctx, wrap(n, pw - 16)[0], W / 2, y + ph - 12, '#a898b8');
  }
  function draw() { const L = items(); if (G.menu.kind === 'main') drawMain(L); else drawCard(L); }
  // the room code box is a real text field, laid over the canvas where the menu leaves room for it
  function place(x, y, w, h) {
    const r = cv.getBoundingClientRect(), k = r.width / W, s = box.style;
    s.display = 'block'; s.left = r.left + x * k + 'px'; s.top = r.top + y * k + 'px'; s.width = w * k + 'px'; s.height = h * k + 'px'; s.fontSize = Math.max(16, Math.round(h * k * 0.55)) + 'px';
  }
  function sync() { if (!(G.state === 'menu' && G.menu.kind === 'join') && box.style.display !== 'none') { box.style.display = 'none'; if (document.activeElement === box) box.blur(); scrollTo(0, 0); } }
  box.addEventListener('input', () => { const m = /room=([a-z0-9]{4,})/i.exec(box.value); if (m) box.value = m[1].toUpperCase().slice(0, 8); }); // a pasted invite link becomes its code
  box.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); join(); } else if (e.key === 'Escape') { e.preventDefault(); box.blur(); back(); } });
  return { open, done, update, draw, tap, sync, title: () => G.state === 'menu' && G.menu.kind === 'main' };
})();
