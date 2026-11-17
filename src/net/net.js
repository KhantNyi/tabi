'use strict';
// ---------- playing together ----------
// Friends in the same room see each other walk around, dressed as they are, with name tags. Everyone keeps their own stamp
// book and save. A few things are better with two: group photos, ringing the summit bell together, riding a train together
// and giving a friend your ATARI drink, each with a stamp on the TOGETHER page of the book.
// Nothing here touches the network until you start or join a room. A room is a short code (plus an invite link when the game
// is hosted). Players are animal nicknames and talk in preset phrases only, so a stranger who guessed a code could wave at
// you and nothing more.
// Transport: WebRTC between the players with Trystero (public Nostr relays introduce them, then they talk directly), fetched
// from a CDN the first time you join. ?net=local swaps in a BroadcastChannel between tabs of one browser, for testing.
// The world itself (people, cars, petals) stays local: it is scenery, so nobody notices it differs between screens.
const NAMES = ['TANUKI', 'KITSUNE', 'USAGI', 'NEKO', 'TSURU', 'KAME', 'SHIKA', 'TORA', 'KOI', 'SARU', 'FUKURO', 'PANDA'];
const NCOL = ['#e8a050', '#ff8a5a', '#f4f1e6', '#f2c14e', '#f06a8c', '#5ad88a', '#d8b088', '#ffd84a', '#ff6a6a', '#c8a070', '#b8a0f0', '#a8d8f0'];
const PHRASES = [['BOW', 'bow'], ['CHEER', 'cheer'], ['HELLO!'], ['LOOK!'], ['OVER HERE!'], ['WAIT FOR ME!'], ["LET'S GO!"], ['SUGOI!'], ['ITADAKIMASU!'], ['BYE BYE!']];
const TSTAMPS = { t_photo: ['GROUP PHOTO', 'camera'], t_bell: ['BELL FOR TWO', 'heart'], t_ride: ['TRAVEL TOGETHER', 'train'], t_gift: ['A DRINK FOR A FRIEND', 'gift'] };
const NET = (function () {
  const CODE_CH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', LIB = 'https://cdn.jsdelivr.net/npm/trystero@0.26.0/+esm', APP = 'tabi-a-slow-walk-through-japan';
  const N = { on: false, code: '', status: '', link: '', queue: [], invite: null, toast: null, copied: 0, hits: [], box: null, myBell: -1e9, bellDone: -1e9 };
  let tx = null, last = 0, sent = '';
  const now = () => performance.now(), peer = id => OTHERS.find(o => o.id === id), colOf = n => NCOL[Math.max(0, NAMES.indexOf(n))];
  const newCode = () => Array.from({ length: 4 }, () => CODE_CH[Math.random() * CODE_CH.length | 0]).join('');
  N.name = () => NAMES[Math.random() * NAMES.length | 0];
  N.later = fn => N.queue.push(fn); // runs when you are next free to walk (not mid-dialog, menu or minigame)
  N.say = (s, t) => { N.toast = { s, t: t || 3 }; };
  N.near = r => { let best = null, bd = r; for (const o of OTHERS) { if (o.map !== M.id || o.stale || o.ride) continue; const d = Math.hypot(o.x - pl.x, o.y - pl.y); if (d < bd) { bd = d; best = o; } } return best; };

  // ---- transports: each gives send(kind, data, to?) and leave(), and calls cb.join / cb.leave / cb.msg
  function local(code, cb) {
    const ch = new BroadcastChannel('tabi-' + code), me = Math.random().toString(36).slice(2, 10);
    ch.onmessage = e => { const m = e.data; if (m.to && m.to !== me) return; if (m.k === 'hi') { cb.join(m.from); if (!m.to) ch.postMessage({ k: 'hi', from: me, to: m.from }); } else if (m.k === 'bye') cb.leave(m.from); else cb.msg(m.k, m.d, m.from); };
    ch.postMessage({ k: 'hi', from: me });
    return { send(k, d, to) { ch.postMessage({ k, d, from: me, to }); }, leave() { ch.postMessage({ k: 'bye', from: me }); ch.close(); } };
  }
  async function p2p(code, cb) {
    const { joinRoom } = await import(LIB), room = joinRoom({ appId: APP }, 'room-' + code), A = { st: room.makeAction('st'), ev: room.makeAction('ev') };
    room.onPeerJoin = id => cb.join(id); room.onPeerLeave = id => cb.leave(id);
    A.st.onMessage = (d, m) => cb.msg('st', d, m.peerId); A.ev.onMessage = (d, m) => cb.msg('ev', d, m.peerId);
    return { send(k, d, to) { if (to) A[k].send(d, { target: to }); else A[k].send(d); }, leave() { room.leave(); } };
  }
  const cb = {
    join(id) { sendState(id); },
    leave(id) { const i = OTHERS.findIndex(o => o.id === id); if (i < 0) return; N.say(OTHERS[i].name + ' HAS GONE'); OTHERS.splice(i, 1); },
    msg(k, d, id) { if (k === 'st') state(id, d); else event(id, d); }
  };
  // what I look like to everyone else, about ten times a second while it changes and once a second otherwise
  const mine = () => ({ m: M.id, x: Math.round(pl.x), y: Math.round(pl.y), d: pl.dir, mv: pl.mv, a: pl.act, f: G.fit, n: G.name, b: G.state === 'play' || G.state === 'event' ? 0 : 1, r: G.state === 'ride' ? 1 : 0 });
  function sendState(to) { if (!tx) return; const s = mine(); tx.send('st', s, to); if (!to) { sent = JSON.stringify(s); last = now(); } }
  function state(id, d) {
    let o = peer(id); const fresh = !o;
    if (fresh) { o = { id, remote: true, x: d.x, y: d.y, wt: 0, ph: Math.random() * 6, alpha: 0, sayT: 0 }; OTHERS.push(o); }
    if (o.fit !== d.f) { o.fit = d.f; o.F = plLook(d.f); }
    if (o.map !== d.m || Math.hypot(d.x - o.x, d.y - o.y) > 60) { o.x = d.x; o.y = d.y; }
    Object.assign(o, { map: d.m, tx: d.x, ty: d.y, dir: d.d, mv: d.mv, act: d.a || null, busy: d.b, ride: d.r, name: d.n, col: colOf(d.n), last: now() });
    if (fresh) { N.say(d.n + ' IS HERE!'); Snd.fx('heart'); }
  }
  function event(id, d) {
    const o = peer(id), nm = o ? o.name : 'A FRIEND';
    if (d.k === 'say' && o && !PHRASES[d.i][1]) { o.say = PHRASES[d.i][0]; o.sayT = 2.4; if (o.map === M.id) Snd.fx('talk'); }
    else if (d.k === 'bell') { if (o) o.bell = now(); if (d.m === M.id && now() - N.myBell < 5000) together(nm); }
    else if (d.k === 'ride' && o && d.m === M.id && G.state === 'play' && Math.hypot(o.x - pl.x, o.y - pl.y) < 110) { N.invite = { from: id, name: nm, r: d.r, s: d.s, t: 8 }; Snd.fx('ui'); }
    else if (d.k === 'joined') N.later(() => award('t_ride'));
    else if (d.k === 'gift') N.later(() => { G.cans[d.d] = 1; save(); Snd.fx('heart'); dialog([nm + ' GIVES YOU A ' + DRINKS[d.d][0] + ' FROM THE VENDING MACHINE.', DRINKS[d.d][6]]); });
  }

  // ---- joining and leaving
  N.join = async code => {
    if (tx) N.leave();
    N.code = code; N.on = true; N.status = 'CONNECTING...'; document.body.classList.add('mp');
    N.link = /^https?:$/.test(location.protocol) ? location.origin + location.pathname + '?room=' + code : '';
    try { history.replaceState(null, '', location.pathname + '?room=' + code); } catch (e) { }
    try {
      const t = await (QS_LOCAL ? local : p2p)(code, cb);
      if (N.code !== code) { t.leave(); return; } tx = t; N.status = 'WAITING FOR FRIENDS'; sendState();
    } catch (e) { console.error(e); if (N.code === code) N.status = 'COULD NOT CONNECT. CHECK YOUR INTERNET.'; }
  };
  N.leave = () => { if (tx) tx.leave(); tx = null; N.on = false; N.code = ''; N.invite = null; OTHERS.length = 0; document.body.classList.remove('mp'); try { history.replaceState(null, '', location.pathname); } catch (e) { } };
  const QS_LOCAL = new URLSearchParams(location.search).get('net') === 'local';
  addEventListener('beforeunload', () => { if (tx) tx.leave(); });

  // ---- every frame, whatever the game is doing
  N.update = dt => {
    const t = now(), k = Math.min(1, dt * 12);
    for (const o of OTHERS) {
      o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; if (o.mv) o.wt += dt; if (o.sayT > 0) o.sayT -= dt;
      o.stale = t - o.last > 4000; const a = o.ride ? 0 : o.stale ? 0.35 : 1; o.alpha += (a - o.alpha) * Math.min(1, dt * 5); // a quiet friend (a hidden tab) fades
    }
    for (let i = OTHERS.length - 1; i >= 0; i--) if (t - OTHERS[i].last > 60000) OTHERS.splice(i, 1);
    if (tx) { const s = JSON.stringify(mine()); if ((s !== sent && t - last > 100) || t - last > 1000) sendState(); }
    if (N.invite && (N.invite.t -= dt) <= 0) N.invite = null;
    if (N.toast && (N.toast.t -= dt) <= 0) N.toast = null;
    if (N.copied > 0) N.copied -= dt;
    if (N.queue.length && G.state === 'play' && G.fade <= 0) N.queue.shift()();
  };

  // ---- moments
  function together(nm) {
    if (now() - N.bellDone < 8000) return; N.bellDone = now();
    for (const o of [pl].concat(OTHERS.filter(o => o.map === M.id))) for (let k = 0; k < 3; k++) G.fx.push({ x: o.x + (k - 1) * 7, y: o.y - 18 - k * 4, t: -k * 0.2, icon: 'heart' });
    N.later(() => { Snd.fx('heart'); dialog(['YOU AND ' + nm + ' RANG THE BELL TOGETHER.', 'THE SOUND ROLLS DOWN THE HILL AND OUT OVER THE LAKE, AND KEEPS GOING FOR A VERY LONG TIME.'], () => award('t_bell')); });
  }
  on('act', sp => { if (!tx || sp.stamp !== 'kw_bell') return; N.myBell = now(); tx.send('ev', { k: 'bell', m: M.id }); const o = OTHERS.find(o => o.map === M.id && now() - (o.bell || -1e9) < 5000); if (o) together(o.name); });
  on('photo', p => { if (p.with.length) N.later(() => award('t_photo')); });
  on('say', i => { if (tx) tx.send('ev', { k: 'say', i }); });
  on('gift', g => { if (tx) tx.send('ev', { k: 'gift', d: g.d }, g.to.id); N.later(() => award('t_gift')); });
  // travel together: a friend standing near you gets asked to come along, and rides to the same place
  const rideName = r => r.city ? 'THE SHINKANSEN TO ' + r.city.name : r.go ? 'THE ' + r.label + ' ' + r.name : 'THE TRAIN TO ' + CITY.line[r.to][1];
  on('ride', r => { if (!tx || r.with) return; const spr = r.spr ? Object.keys(SPR).find(k => SPR[k] === r.spr) : null; tx.send('ev', { k: 'ride', m: M.id, s: rideName(r), r: { to: r.to, city: r.city && r.city.id, go: r.go, label: r.label, name: r.name, spr, speed: r.speed, dur: r.dur } }); });
  N.accept = () => {
    const v = N.invite; N.invite = null; if (!v) return; const d = v.r;
    G.ride = d.city ? { city: CITIES[d.city], t: 0, dur: 5.6 } : d.go ? { go: d.go, label: d.label, name: d.name, spr: SPR[d.spr], speed: d.speed, dur: d.dur, t: 0 } : { to: d.to, t: 0 };
    Object.assign(G.ride, { with: v.name, withId: v.from }); G.state = 'ride'; Snd.play(null); Snd.fx('train');
  };
  on('arrived', r => { if (!r.with) return; if (!hit(pl.x + 16, pl.y)) { pl.x += 16; camSnap(); } if (tx) tx.send('ev', { k: 'joined' }, r.withId); N.later(() => award('t_ride')); });

  // ---- what you see while walking: name tags, arrows to friends off screen, the room, invitations and notes
  N.tags = (cx, cy) => {
    for (const o of OTHERS) {
      if (o.map !== M.id || o.alpha < 0.05 || o.sayT > 0) continue; const x = o.x - cx, y = o.y - cy - 37;
      ctx.globalAlpha = o.alpha; txtC(ctx, o.name, x, y, o.col, '#1d1626');
      if (o.busy) for (let k = 0; k < 3; k++) R(ctx, x - 4.5 + k * 3.5, y - 5 - (Math.floor(G.t * 3) % 3 === k ? 1 : 0), 1.5, 1.5, '#fff8e8');
      ctx.globalAlpha = 1;
    }
  };
  N.hud = () => {
    const cx = snap(G.cx), cy = snap(G.cy);
    for (const o of OTHERS) {
      if (o.map !== M.id || o.alpha < 0.3) continue; const sx = o.x - cx, sy = o.y - 14 - cy; if (sx > -4 && sx < W + 4 && sy > -10 && sy < H + 10) continue;
      const ax = Math.max(9, Math.min(W - 9, sx)), ay = Math.max(30, Math.min(H - 10, sy)), a = Math.atan2(sy - ay, sx - ax);
      disc(ctx, ax, ay, 5, '#1d1626'); disc(ctx, ax, ay, 4, o.col); for (let k = 5; k < 9; k++) R(ctx, ax + Math.cos(a) * k - 1, ay + Math.sin(a) * k - 1, 2, 2, k < 8 ? '#1d1626' : o.col);
      const s = o.name, lx = ax < W / 2 ? ax + 9 : ax - 9 - tw(s); txt(ctx, s, lx, ay - 2, o.col, '#1d1626');
    }
    if (N.on) { const s = 'ROOM ' + N.code + ' - ' + (OTHERS.length ? OTHERS.length + 1 + ' OF YOU' : N.status); if (TOUCH) txt(ctx, s, 5, 30, '#c8e0ec', '#1d1626'); else txtC(ctx, s, W / 2, 7, '#c8e0ec', '#1d1626'); }
    const by = H - (TOUCH && H > W ? 150 : TOUCH ? 34 : 30);
    if (N.invite) {
      const v = N.invite, l1 = v.name + ' IS TAKING ' + v.s + '.', l2 = TOUCH ? 'PRESS E TO GO TOO' : 'E TO GO TOO - ESC TO STAY', w = Math.min(W - 8, Math.max(tw(l1), tw(l2)) + 16), x = Math.floor((W - w) / 2);
      panel(x, by - 6, w, 24); txtC(ctx, l1, W / 2, by - 1, '#3a2e40'); txtC(ctx, l2, W / 2, by + 7, G.t % 0.8 < 0.5 ? '#c8382e' : '#8a7a6a');
    } else if (N.toast) { const s = N.toast.s, ls = wrap(s, W - 30), w = Math.max(...ls.map(l => tw(l))) + 14, x = Math.floor((W - w) / 2); ctx.globalAlpha = Math.min(1, N.toast.t * 3); panel(x, by, w, ls.length * 7 + 7); ls.forEach((l, i) => txtC(ctx, l, W / 2, by + 4 + i * 7, '#3a2e40')); ctx.globalAlpha = 1; }
  };

  // ---- the PLAY TOGETHER menu (T): your name, start or join a room, invite friends, see where everyone is
  const rows = () => N.on ? ['name', 'invite', 'leave'] : ['name', 'start', 'join'];
  N.open = () => { G.state = 'tog'; G.tog = { sel: 1, edit: -1, code: (N.code || 'TABI').split('') }; Snd.fx('page'); };
  function share() {
    if (N.link && navigator.share && TOUCH) { navigator.share({ title: GAME.title, text: 'Come for a walk through Japan with me', url: N.link }).catch(() => { }); return; }
    try { navigator.clipboard.writeText(N.link || N.code).catch(() => { }); } catch (e) { }
    N.copied = 2; Snd.fx('pick');
  }
  N.updTog = () => {
    const T = G.tog, RW = rows();
    if (T.edit >= 0) { // typing a room code, arcade style
      const c = T.code, k = CODE_CH.indexOf(c[T.edit]);
      if (KP.u || KP.d) { c[T.edit] = CODE_CH[(Math.max(0, k) + (KP.u ? 1 : CODE_CH.length - 1)) % CODE_CH.length]; Snd.fx('ui'); }
      if (KP.l && T.edit > 0) { T.edit--; Snd.fx('ui'); } if (KP.r && T.edit < 3) { T.edit++; Snd.fx('ui'); }
      if (KP.a) { T.edit = -1; T.sel = 1; N.join(c.join('')); Snd.fx('yay'); } else if (KP.x || KP.b) T.edit = -1;
      return;
    }
    if (KP.u) { T.sel = (T.sel + RW.length - 1) % RW.length; Snd.fx('ui'); } if (KP.d) { T.sel = (T.sel + 1) % RW.length; Snd.fx('ui'); }
    const r = RW[T.sel];
    if (r === 'name' && (KP.l || KP.r || KP.a)) { G.name = NAMES[(NAMES.indexOf(G.name) + (KP.l ? NAMES.length - 1 : 1)) % NAMES.length]; save(); Snd.fx('ui'); }
    else if (KP.a && r === 'start') { N.join(newCode()); T.sel = 1; Snd.fx('yay'); }
    else if (KP.a && r === 'join') { T.edit = 0; Snd.fx('ui'); }
    else if (KP.a && r === 'invite') share();
    else if (KP.a && r === 'leave') { N.leave(); T.sel = 1; Snd.fx('page'); }
    else if (KP.x || KP.b || KP.t) { G.state = 'play'; Snd.fx('page'); }
  };
  const where = o => { if (o.ride) return 'ON THE WAY'; if (o.map === M.id) return 'RIGHT HERE'; const d = MAPS[o.map]; if (!d) return '...'; const c = CITIES[d.city]; return d.name.split(' - ')[0] + (c && c !== CITY ? ', ' + c.name : ''); };
  N.drawTog = () => {
    const T = G.tog, RW = rows(), pw = Math.min(264, W - 12), ph = 160, x = Math.floor((W - pw) / 2), y = Math.max(4, Math.floor((H - ph) / 2)), mx = W / 2;
    N.hits = []; N.box = [x, y, pw, ph]; R(ctx, 0, 0, W, H, 'rgba(16,12,28,0.7)'); panel(x, y, pw, ph); txtC(ctx, 'PLAY TOGETHER', mx, y + 7, '#c8382e', null, 2);
    if (N.on) { txtC(ctx, 'ROOM', mx, y + 21, '#8a7a6a'); txtC(ctx, N.code, mx, y + 29, '#3a2e40', null, 3); txtC(ctx, OTHERS.length ? OTHERS.length + 1 + ' TRAVELLERS' : N.status, mx, y + 46, OTHERS.length ? '#3f9a5a' : '#b8a888'); }
    else wrap('WALK AROUND JAPAN WITH FRIENDS. EVERYONE KEEPS THEIR OWN STAMP BOOK, AND SOME THINGS ARE BETTER DONE TOGETHER.', pw - 20).slice(0, 4).forEach((l, i) => txtC(ctx, l, mx, y + 22 + i * 7, '#6a5a6a'));
    const LBL = { start: 'START A NEW ROOM', leave: 'LEAVE THE ROOM', invite: N.copied > 0 ? 'COPIED!' : N.link ? (TOUCH && navigator.share ? 'SHARE THE INVITE LINK' : 'COPY THE INVITE LINK') : 'COPY THE ROOM CODE' };
    RW.forEach((r, i) => {
      const ry = y + 56 + i * 15, sel = i === T.sel && T.edit < 0, c = sel ? '#c8382e' : '#3a2e40';
      if (sel) R(ctx, x + 6, ry, pw - 12, 13, '#f2e2c0'); N.hits.push([x + 6, ry, pw - 12, 13, i]);
      if (r === 'name') { txt(ctx, 'YOUR NAME', x + 12, ry + 4, c); const s = '< ' + G.name + ' >'; txt(ctx, s, x + pw - 12 - tw(s), ry + 4, c); disc(ctx, x + pw - 18 - tw(s), ry + 6.5, 2.5, '#3a2e40'); disc(ctx, x + pw - 18 - tw(s), ry + 6.5, 1.8, colOf(G.name)); }
      else if (r === 'join') { txt(ctx, T.edit >= 0 ? 'E TO JOIN' : 'JOIN A ROOM', x + 12, ry + 4, T.edit >= 0 ? '#c8382e' : c); T.code.forEach((ch, j) => { const lx = x + pw - 12 - (4 - j) * 11, ed = T.edit === j; R(ctx, lx, ry + 1, 9, 11, ed ? '#c8382e' : '#e4d8bc'); txtC(ctx, ch, lx + 4.5, ry + 4, ed ? '#fff8e8' : '#3a2e40'); N.hits.unshift([lx, ry, 9, 13, 'c' + j]); }); }
      else txt(ctx, LBL[r], x + 12, ry + 4, c);
    });
    if (N.on && OTHERS.length) OTHERS.slice(0, 4).forEach((o, i) => { const yy = y + 105 + i * 8; disc(ctx, x + 14, yy + 2, 2.5, '#3a2e40'); disc(ctx, x + 14, yy + 2, 1.8, o.col); txt(ctx, o.name, x + 20, yy, '#3a2e40'); const s = where(o); txt(ctx, s, x + pw - 12 - tw(s), yy, '#8a7a6a'); });
    else wrap(N.on ? (N.link ? 'SEND FRIENDS THE LINK, OR THEY CAN PRESS T IN THEIR GAME AND JOIN WITH THIS CODE.' : 'FRIENDS OPEN THE GAME, PRESS T AND JOIN WITH THIS CODE.') : 'ONE OF YOU STARTS A ROOM. THE OTHERS JOIN WITH ITS CODE.', pw - 24).slice(0, 3).forEach((l, i) => txtC(ctx, l, mx, y + 106 + i * 7, '#a89878'));
    txtC(ctx, TOUCH ? 'TAP TO CHOOSE - TAP OUTSIDE TO CLOSE' : T.edit >= 0 ? 'UP/DOWN LETTER - LEFT/RIGHT MOVE - E JOIN' : 'UP/DOWN CHOOSE - E SELECT - ESC CLOSE', mx, y + ph - 11, '#b8a888');
  };
  const inBox = (p, b) => b && p.x >= b[0] && p.x <= b[0] + b[2] && p.y >= b[1] && p.y <= b[1] + b[3];
  N.tapTog = p => {
    const T = G.tog, h = N.hits.find(b => inBox(p, b)), RW = rows();
    if (!h) { if (T.edit >= 0) T.edit = -1; else if (!inBox(p, N.box)) KP.x = 1; return; }
    const k = h[4];
    if (typeof k === 'string') { const j = +k[1]; T.sel = RW.indexOf('join'); if (T.edit !== j) { T.edit = j; Snd.fx('ui'); } else KP.u = 1; return; }
    if (T.edit >= 0) { if (RW[k] === 'join') KP.a = 1; else T.edit = -1; return; }
    if (RW[k] === 'name') { T.sel = k; KP.r = 1; } else if (k === T.sel) KP.a = 1; else { T.sel = k; Snd.fx('ui'); }
  };

  // ---- SAY SOMETHING (C): a bow, a cheer or a preset phrase in a speech bubble
  N.openSay = () => { G.state = 'say'; G.sayI = G.sayI || 0; Snd.fx('ui'); };
  function choose(i) { const [s, em] = PHRASES[i]; G.state = 'play'; if (em) { pl.em = em; pl.emT = 1.6; Snd.fx(em === 'bow' ? 'clap' : 'yay'); } else say(pl, s); emit('say', i); }
  N.updSay = () => {
    const n = PHRASES.length; let i = G.sayI; if (KP.u) i -= 2; if (KP.d) i += 2; if (KP.l) i--; if (KP.r) i++; i = (i + n) % n;
    if (i !== G.sayI) { G.sayI = i; Snd.fx('ui'); } if (KP.a) choose(i); else if (KP.x || KP.b || KP.c) G.state = 'play';
  };
  N.drawSay = () => {
    const n = PHRASES.length, pw = Math.min(200, W - 12), cw = (pw - 16) / 2, ph = 34 + Math.ceil(n / 2) * 14, x = Math.floor((W - pw) / 2), y = H - ph - (TOUCH && H > W ? 120 : 12);
    N.hits = []; N.box = [x, y, pw, ph]; panel(x, y, pw, ph); txtC(ctx, 'SAY SOMETHING', W / 2, y + 6, '#c8382e', null, 2);
    PHRASES.forEach(([s, em], i) => { const bx = x + 8 + (i % 2) * cw, by = y + 20 + (i >> 1) * 14, sel = i === G.sayI; if (sel) R(ctx, bx, by, cw - 2, 12, '#f2e2c0'); txt(ctx, (em ? '* ' : '') + s, bx + 4, by + 4, sel ? '#c8382e' : em ? '#8a5a3a' : '#3a2e40'); N.hits.push([bx, by, cw - 2, 12, i]); });
    if (!N.on) txtC(ctx, 'ONLY YOU CAN HEAR YOU. PRESS T TO PLAY TOGETHER.', W / 2, y + ph - 9, '#b8a888');
  };
  N.tapSay = p => { const h = N.hits.find(b => inBox(p, b)); if (h) choose(h[4]); else if (!inBox(p, N.box)) KP.x = 1; };
  return N;
})();
