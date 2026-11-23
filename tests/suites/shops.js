// Shops: fill a basket from the shelves, go through each shop's till ritual, and do the things you can do after.
// pay() works through the till like a player: E to every question (the first answer, usually yes) and on to the end.

suite('shops', 'kb_tokyo', (t, h) => {
  // (helpers live inside the suite: its code runs in the game frame, which cannot see this page)
  const s = {};
  s.take = (label, picks) => { if (!h.use(label)) return false; h.step(12, false); for (const i of picks) { G.mg.i = i; KP.a = 1; h.step(1); } KP.x = 1; h.step(1); return G.state === 'play'; };
  s.pay = () => { const seen = []; if (!h.use('PAY AT THE TILL')) return null; let n = 0; while (G.state === 'mini' && G.mg.k === 'till' && n++ < 4000 && !G.err) { const m = G.mg, st = m.steps[m.si]; if (st && !seen.includes(st)) seen.push(st); if (st && st.k !== 'scan' && (st.k !== 'act' || st.art === 'box')) KP.a = 1; update(1 / 60); if (n % 3 === 0) h.paint(); } return seen; };
  s.said = (seen, re) => seen.some(st => re.test(st.q || st.text || ''));

  // ---------- the konbini ----------
  go('kb_tokyo'); h.step(5); let K = SHOP.kago();
  t.ok(!SHOP.hud(), 'an empty basket shows nothing on screen');
  t.ok(s.take('BROWSE ONIGIRI AND BENTO', [0, 3]), 'a salmon onigiri and a karaage bento off the chiller');
  t.ok(s.take('PICK A DRINK', [0]) && s.take('HOT SNACKS', [4]), 'a drink from the fridge and a coffee cup from the hot case');
  t.eq(K.items.length, 4, 'four things in the basket'); t.ok(/BASKET: 4/.test(SHOP.hud() || ''), 'and the screen says so (' + SHOP.hud() + ')');
  const drink = K.items.find(i => i.drink != null).drink; delete G.cans[drink];
  const seen = s.pay();
  t.ok(seen && s.said(seen, /ATATAMEMASU/) && seen.some(st => st.art === 'warm'), 'the till offers to warm the bento, and the microwave runs');
  t.ok(s.said(seen, /OHASHI/) && s.said(seen, /FUKURO/) && s.said(seen, /POINTO/), 'it asks about chopsticks, a bag and a point card');
  t.ok(G.state === 'play' && !K.items.length && K.paid.length === 4, 'paid: the basket is empty and four things are yours');
  t.ok(G.cans[drink], 'the drink goes in your collection of drinks tried');
  h.use('MAKE A COFFEE'); h.until(() => G.state === 'play', 600); t.ok(!K.cups && K.trash.some(r => r[0] === 'PAPER CUP'), 'the paid-for cup makes a coffee');
  h.use('SIT AT THE EAT-IN'); t.ok(G.state === 'mini' && G.mg.k === 'onigiri' && G.mg.ph === 'open', 'at the eat-in, the onigiri goes straight to the three pulls');
  ['d', 'l', 'r'].forEach(k => { KP[k] = 1; h.step(1); h.step(5); }); const torn = G.mg && G.mg.torn; h.until(() => G.state === 'play', 600); t.ok(!torn, 'pulled in the right order, the nori stays whole');
  h.use('SIT AT THE EAT-IN'); h.until(() => G.state === 'play', 600); h.use('SIT AT THE EAT-IN'); h.until(() => G.state === 'play', 600);
  t.ok(!K.paid.some(SHOP.edible), 'the bento and the drink, eaten'); t.ok(K.trash.length >= 4, 'leaving rubbish (' + K.trash.map(r => r[0]).join(', ') + ')');
  h.use('SORT YOUR RUBBISH'); t.ok(G.state === 'mini' && G.mg.k === 'sort', 'the bins'); const sm = G.mg;
  for (let n = 0; n < 2000 && G.state === 'mini'; n++) { const m = G.mg; if (!m.res && m.q[m.i]) KP[['l', 'd', 'r'][m.q[m.i][1]]] = 1; update(1 / 60); }
  h.until(() => G.state === 'play', 600); t.ok(sm.q.length && sm.ok === sm.q.length && !K.trash.length, 'every piece in the right bin (' + sm.ok + ' of ' + sm.q.length + ')');
  h.use('ASK TO USE THE TOILET'); h.until(() => G.state === 'mini', 300); t.eq(G.mg && G.mg.k, 'washlet', 'the clerk says douzo, and there is the control panel');
  h.step(15, false); G.mg.i = 2; KP.a = 1; h.step(15, false); G.mg.i = 5; KP.a = 1; h.step(1); t.ok(h.until(() => G.state === 'play', 600), 'dry, then flush, and out');
  // walking out with something unpaid puts it back, and an umbrella has to be paid for
  G.umbrella = 0; h.use('BUY AN UMBRELLA'); h.until(() => G.state === 'play', 300); t.ok(K.items.some(i => i.umb), 'the umbrella goes in the basket');
  G.state = 'play'; pl.x = M.w / 2; pl.y = M.h - 14; h.walk('d', 30); t.ok(M.id !== 'kb_tokyo' && !G.umbrella, 'walking out without paying leaves it behind (now at ' + M.id + ')');
  go('kb_tokyo'); h.step(2); K = SHOP.kago(); t.ok(!K.items.length, 'back inside, the basket starts empty');
  h.use('BUY AN UMBRELLA'); h.until(() => G.state === 'play', 300); s.pay(); h.until(() => G.state === 'play', 300); t.ok(G.umbrella, 'paid for at the till, the umbrella is yours');
  // the people come and go
  const at = M.ACT.filter(a => a.path).map(a => a.x + ',' + a.y + ',' + !!a.hide).join('|'); h.step(1500);
  t.ok(M.ACT.filter(a => a.path).map(a => a.x + ',' + a.y + ',' + !!a.hide).join('|') !== at && M.ACT.some(a => a.path && !a.hide && a.staff === undefined), 'shoppers come in, walk the aisles and leave');

  // ---------- the figure shop ----------
  go('figures'); h.step(3); G.caps = {};
  h.use('CAPSULES: CATS IN CUPS'); t.eq(G.state + '/' + (G.mg && G.mg.k), 'mini/capsule', 'a capsule machine');
  h.until(() => G.mg && G.mg.t > 2.2, 600); KP.a = 1; h.step(1); h.until(() => G.state === 'play', 600); t.eq(count(G.caps.cats || {}), 1, 'one of the four cats in cups');
  delete G.stamps.fig; h.use('TURN THE HANDLE'); h.until(() => G.mg && G.mg.t > 2.5, 600); KP.a = 1; h.step(1); h.until(() => G.state === 'play', 900); t.ok(G.stamps.fig, 'the HERO machine gives a figure and the stamp');
  h.use('UP THE STAIRS TO 2F'); h.step(3); t.eq(M.id, 'figures2', 'up the stairs to the second floor');
  K = SHOP.kago(); t.ok(s.take('BROWSE THE BOXED FIGURES', [5]), 'the boxed gold dragon from behind the counter');
  const fs = s.pay(); t.ok(fs && fs.some(st => st.art === 'box') && s.said(fs, /TAX FREE/), 'the clerk opens the box for you to check, and offers tax free');
  t.ok(K.paid.some(i => i.k === 'figbox'), 'and it is yours');
  delete G.caps.rare; h.use('LOOK IN CASE 108'); h.until(() => G.state === 'play', 600); t.ok(G.caps.rare, 'the first edition, found in case 108');
  h.use('DIG IN THE JUNK BIN'); h.until(() => G.state === 'play', 300);
  G.state = 'play'; pl.x = M.w / 2; pl.y = M.h - 12; h.walk('d', 30); t.eq(M.id, 'figures', 'down the stairs to the capsule floor');
  t.ok(SHOP.kago() === K, 'the same basket on both floors');

  // ---------- the boutique ----------
  go('kawaii'); h.step(3); K = SHOP.kago();
  h.use('USE THE FITTING ROOM'); t.ok(G.state === 'dialog' && /BRING/.test(G.dlg.lines[0]), 'nothing to try: bring something first'); h.until(() => G.state === 'play', 300);
  t.ok(s.take('BROWSE THE RACKS', [1]), 'the yellow raincoat over your arm');
  h.use('USE THE FITTING ROOM'); h.until(() => G.state === 'mini', 300); t.ok(G.mg && G.mg.k === 'fitting' && M.fitting, 'shoes off, and the curtain shuts');
  h.step(15, false); KP.a = 1; h.step(1); h.step(110, false); KP.a = 1; h.step(1); h.until(() => G.state === 'play', 300); t.ok(!M.fitting && K.items[0].tried, 'it fits, and the curtain opens again');
  delete G.stamps.fit; G.fit = 0; const bs = s.pay(); t.ok(bs && bs.some(st => st.art === 'wrap'), 'wrapped in tissue at the till');
  t.eq(G.fit, 2, 'you wear it out of the shop');
  const staff = M.ACT.find(a => a.calls); let bowed = false, bowY = 0; for (let n = 0; n < 900 && (staff.escort || !G.stamps.fit); n++) { if (G.state === 'got' || G.state === 'dialog') KP.a = 1; update(1 / 60); if (staff.act === 'bow') { bowed = true; bowY = staff.y; } }
  t.ok(bowed && Math.abs(bowY - (M.h - 24)) < 4, 'she carries the bag to the door and bows');
  t.ok(G.stamps.fit, 'NEW OUTFIT, stamped'); h.until(() => !staff.escort, 900); t.ok(Math.hypot(staff.x - staff.hx, staff.y - staff.hy) < 3, 'and goes back to her place');
});
