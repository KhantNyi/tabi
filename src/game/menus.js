'use strict';
// ---------- menus: the main menu, the pause menu, settings, how to play, starting over, joining a room ----------
// Every menu is a column of big buttons: arrow keys and E, or a single tap on a button. Esc, or a tap outside the buttons,
// goes back. On tall (upright phone) screens the buttons grow. Screens opened from a menu (the stamp book, PLAY TOGETHER)
// come back to it when they close: G.ret holds which menu that is.
const MENU = (function () {
  const box = document.getElementById('code');
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  let hits = [];
  // from: the menu (or 'tog') this one was opened from; G.mstack remembers the way back
  function open(kind, from) { G.mstack = from ? (G.mstack || []).concat(from) : []; G.state = 'menu'; G.menu = { kind, sel: 0, t: 0 }; Snd.fx('page'); if (kind === 'join') { box.value = ''; setTimeout(() => { try { box.focus({ preventScroll: true }); } catch (e) { } }, 0); } }
  // open something that is not a menu (the book, PLAY TOGETHER), and come back to this menu after it
  const sub = fn => () => { G.ret = G.menu.kind; fn(); };
  // close a screen: back to the menu it came from, or to the walk
  function done() { const r = G.ret; G.ret = null; if (r === 'tog') NET.open(); else if (r) open(r); else G.state = 'play'; }
  function back() { const st = G.mstack || []; if (!st.length) return false; const prev = st.pop(); if (prev === 'tog') NET.open(); else { G.state = 'menu'; G.menu = { kind: prev, sel: 0, t: 0 }; G.mstack = st; } return true; }
  function start() {
    G.begun = true; G.state = 'play'; G.banner = 3.5; G.fade = 0; Snd.play(M.def.music); Snd.fx('ui'); if (TOUCH) fullscreen(true);
    if (G.seen !== GAME.version) { if (G.hasSave) NET.say('UPDATED TO VERSION ' + GAME.version + '. SEE WHAT IS NEW IN THE MAIN MENU.', 6); G.seen = GAME.version; save(); }
  }
  function reset() { G.stamps = {}; G.figs = {}; G.cats = {}; G.cans = {}; G.fit = 0; G.hasSave = false; G.begun = false; pl.F = plLook(0); go(CLIST[0].start); G.banner = 0; save(); open('main'); Snd.fx('page'); }
  const news = () => { G.state = 'book'; G.bk = BOOKP().length - 1; G.cl = 0; G.seen = GAME.version; save(); };
  const where = () => (G.zn && !M.indoor ? G.zn[4] : M.def.name.split(' - ')[0]);
  const togSub = () => NET.on ? 'ROOM ' + NET.code + ' - ' + (OTHERS.length ? OTHERS.length + 1 + ' OF YOU' : 'WAITING FOR FRIENDS') : 'EXPLORE WITH FRIENDS';
  const code = () => { const v = box.value.toUpperCase(), m = /ROOM=([A-Z0-9]+)/.exec(v); return (m ? m[1] : v).replace(/[^A-Z0-9]/g, '').slice(0, 8); }; // a pasted invite link works too
  function join() { const c = code(); if (c.length < 4) { Snd.fx('land'); return; } box.blur(); NET.join(c); Snd.fx('yay'); NET.open(); }
  const HELP = TOUCH
    ? ['WALK: DRAG ANYWHERE ON THE LEFT SIDE OF THE SCREEN.', 'E: TALK, LOOK, GO IN, BUY. X: BACK.', 'BOOK: YOUR STAMPS. THE MENU BUTTON: EVERYTHING ELSE.', 'TAP TO MOVE ON IN A CONVERSATION OR TO PICK FROM A LIST.']
    : ['ARROWS OR WASD: WALK. E, SPACE OR ENTER: TALK, LOOK, GO IN, BUY.', 'TAB OR B: STAMP BOOK. ESC OR P: THIS MENU.', 'T: PLAY TOGETHER. C: SAY SOMETHING. M: SOUND. F: FULLSCREEN.', 'IN THE STAMP BOOK, LEFT AND RIGHT TURN THE PAGE.'];
  // what each menu holds. t: label, s: a line under it, v: a value you change with left/right (or a tap), go: what E does
  const ITEMS = {
    main: () => [
      G.hasSave || G.begun ? { t: 'CONTINUE', s: where() + ', ' + CITY.name + ' - ' + count(G.stamps) + ' STAMPS', go: start } : { t: 'START YOUR TRIP', s: 'FROM ' + CITY.name, go: start },
      { t: 'PLAY TOGETHER', s: togSub(), go: sub(NET.open) },
      { t: 'WHAT IS NEW', s: 'VERSION ' + GAME.version, badge: G.seen !== GAME.version, go: sub(news) },
      { t: 'SETTINGS', s: 'SOUND, SCREEN, YOUR NAME, CONTROLS', go: () => open('settings', 'main') },
      (G.hasSave || G.begun) && { t: 'NEW TRIP', s: 'START AGAIN FROM TOKYO', go: () => open('confirm', 'main') }
    ],
    pause: () => [
      { t: 'BACK TO THE WALK', go: () => { G.state = 'play'; Snd.fx('page'); } },
      { t: 'STAMP BOOK', s: got(CITY) + ' OF ' + nst(CITY) + ' STAMPS IN ' + CITY.name, go: sub(() => { G.state = 'book'; G.bk = CLIST.indexOf(CITY); }) },
      { t: 'PLAY TOGETHER', s: togSub(), go: sub(NET.open) },
      NET.on && { t: 'SAY SOMETHING', s: 'A BOW, A CHEER OR A FEW WORDS', go: NET.openSay },
      { t: 'SETTINGS', go: () => open('settings', 'pause') },
      { t: 'MAIN MENU', go: () => open('main') }
    ],
    settings: () => [
      { t: 'SOUND', v: Snd.on ? 'ON' : 'OFF', lr: () => { Snd.toggle(); save(); } },
      FS_OK && { t: 'FULLSCREEN', v: isFs() ? 'ON' : 'OFF', lr: () => fullscreen() },
      { t: 'YOUR NAME', s: 'WHAT FRIENDS SEE ABOVE YOUR HEAD', v: G.name, lr: d => { G.name = NAMES[(NAMES.indexOf(G.name) + (d < 0 ? NAMES.length - 1 : 1)) % NAMES.length]; save(); } },
      { t: 'HOW TO PLAY', go: () => open('help', 'settings') },
      { t: 'BACK', go: back }
    ],
    help: () => [{ t: 'BACK', go: back }],
    confirm: () => [{ t: 'KEEP MY TRIP', go: back }, { t: 'START OVER', s: 'THIS CANNOT BE UNDONE', red: true, go: reset }],
    join: () => [{ t: 'JOIN', s: code().length >= 4 ? 'ROOM ' + code() : 'TYPE THE CODE FIRST', off: code().length < 4, go: join }, { t: 'BACK', go: back }]
  };
  const HEAD = {
    pause: () => [where(), CITY.name], settings: () => ['SETTINGS'], help: () => ['HOW TO PLAY', ...HELP],
    confirm: () => ['START A NEW TRIP?', 'YOUR STAMPS, FIGURES, CATS AND DRINKS WILL ALL BE GONE.'],
    join: () => ['JOIN A ROOM', 'TYPE THE CODE YOUR FRIEND SENT YOU, OR PASTE THEIR INVITE LINK.']
  };
  const items = () => ITEMS[G.menu.kind]().filter(Boolean);

  function update(dt) {
    const m = G.menu, L = items(); m.t += dt; m.sel = Math.min(m.sel, L.length - 1);
    if (KP.u) { m.sel = (m.sel + L.length - 1) % L.length; Snd.fx('ui'); } if (KP.d) { m.sel = (m.sel + 1) % L.length; Snd.fx('ui'); }
    const it = L[m.sel];
    if ((KP.l || KP.r) && it.lr) { it.lr(KP.l ? -1 : 1); Snd.fx('ui'); }
    else if (KP.a && m.t > 0.15) use(it);
    else if (KP.x || KP.p || KP.b) { if (m.kind === 'pause') { G.state = 'play'; Snd.fx('page'); } else if (back()) Snd.fx('page'); }
  }
  function use(it) { if (it.off) { Snd.fx('land'); return; } if (it.lr) { it.lr(1); Snd.fx('ui'); } else it.go(); }
  function tap(p) {
    const h = hits.find(b => p.x >= b[0] && p.x <= b[0] + b[2] && p.y >= b[1] && p.y <= b[1] + b[3]);
    if (h) { G.menu.sel = h[4]; use(items()[h[4]]); } else if (G.menu.kind === 'pause') G.state = 'play'; else back();
  }

  // ---- drawing
  function button(x, y, w, h, it, sel, big) {
    panel(x, y, w, h); if (sel) { R(ctx, x + 2, y + 2, w - 4, h - 4, '#fff4d8'); R(ctx, x + 2, y + 2, 3, h - 4, '#c8382e'); }
    const sc = big ? 2 : 1, col = it.off ? '#b8a888' : it.red ? '#c8382e' : sel ? '#c8382e' : '#3a2e40', ty = it.s ? y + (big ? 5 : 4) : y + (h - 5 * sc) / 2;
    txt(ctx, it.t, x + 11, ty, col, null, sc);
    if (it.s) txt(ctx, it.s, x + 11, ty + 5 * sc + (big ? 4 : 3), '#a89878');
    if (it.v != null) { const v = '< ' + it.v + ' >'; txt(ctx, v, x + w - 9 - tw(v, sc), y + (h - 5 * sc) / 2, sel ? '#c8382e' : '#6a5a6a', null, sc); }
    if (it.badge) { const bx = x + w - 30, by = y + (h - 9) / 2; R(ctx, bx, by, 22, 9, '#c8382e'); txt(ctx, 'NEW', bx + 5, by + 2, '#fff8e8'); }
  }
  function draw() {
    const m = G.menu, L = items(), big = H >= 300, hs = L.map(i => big ? 30 : i.s ? 21 : 15), gap = big ? 7 : 3, bw = Math.min(big ? 250 : 230, W - 20), x = Math.floor((W - bw) / 2);
    R(ctx, 0, 0, W, H, m.kind === 'main' ? 'rgba(16,12,28,0.5)' : 'rgba(16,12,28,0.72)');
    const head = m.kind === 'main' ? null : HEAD[m.kind](), lines = head ? head.slice(1).flatMap(l => wrap(l, bw - 8)) : [];
    const logo = big ? 7 : 4, headH = m.kind === 'main' ? logo * 5 + (big ? 30 : 18) : 10 + (lines.length ? 6 + lines.length * 8 : 0) + (big ? 14 : 8), boxH = m.kind === 'join' ? (big ? 40 : 30) : 0;
    const total = headH + boxH + hs.reduce((a, h) => a + h + gap, 0), y0 = Math.max(6, Math.floor((H - total) / 2 - (big && TOUCH ? 30 : 0)));
    let y = y0;
    if (m.kind === 'main') {
      txtO(ctx, GAME.title, W / 2, y, '#fff8e8', '#1d1626', logo); txtO(ctx, 'A SLOW WALK THROUGH JAPAN', W / 2, y + logo * 5 + (big ? 10 : 6), '#ffd98a', '#1d1626'); y += headH;
    } else {
      txtO(ctx, head[0], W / 2, y, m.kind === 'confirm' ? '#ffb0a0' : '#fff8e8', '#1d1626', 2); y += 16; lines.forEach((l, i) => txtO(ctx, l, W / 2, y + i * 8, '#e4d8bc', '#1d1626')); y = y0 + headH;
    }
    if (m.kind === 'join') { place(x, y, bw, boxH - 8); y += boxH; }
    hits = [];
    L.forEach((it, i) => { button(x, y, bw, hs[i], it, i === m.sel, big); hits.push([x, y, bw, hs[i], i]); y += hs[i] + gap; });
    const foot = m.kind === 'main' ? 'VERSION ' + GAME.version + (TOUCH ? '' : '   ARROWS AND E TO CHOOSE') : TOUCH ? (m.kind === 'pause' ? 'TAP OUTSIDE TO GO BACK TO THE WALK' : '') : 'ESC TO GO BACK';
    if (foot) txtO(ctx, foot, W / 2, Math.min(H - 9, y + 4), '#c8e0ec', '#1d1626');
  }
  // the room code box is a real text field, laid over the canvas where the menu leaves room for it
  function place(x, y, w, h) {
    const r = cv.getBoundingClientRect(), k = r.width / W, s = box.style;
    s.display = 'block'; s.left = r.left + x * k + 'px'; s.top = r.top + y * k + 'px'; s.width = w * k + 'px'; s.height = h * k + 'px'; s.fontSize = Math.max(16, Math.round(h * k * 0.55)) + 'px';
  }
  function sync() { if (!(G.state === 'menu' && G.menu.kind === 'join') && box.style.display !== 'none') { box.style.display = 'none'; if (document.activeElement === box) box.blur(); scrollTo(0, 0); } }
  box.addEventListener('input', () => { if (/room=/i.test(box.value)) box.value = code(); }); // a pasted invite link becomes its code
  box.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); join(); } else if (e.key === 'Escape') { e.preventDefault(); box.blur(); back(); } });
  return { open, done, update, draw, tap, sync };
})();
