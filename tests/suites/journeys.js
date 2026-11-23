// The airport journey in Japan (check-in, security, the gate, boarding by group, the cabin, landing, the passport desk and
// the bags), then a hotel and a ryokan bath.
suite('airport', 'haneda', (t, h) => {
  const J = AIR.J;
  go('haneda', 200, 600, 'u'); h.step(5);
  pl.x = 186; pl.y = 340; h.walk('u', 90); const shut = pl.y; t.ok(shut > 300, 'security is shut to you without a boarding pass (y ' + Math.round(shut) + ')');
  h.use('PUT YOUR THINGS'); h.until(() => G.state === 'play', 600); t.ok(!J.secured, 'the trays turn you away before check-in');
  h.use('CHECK IN'); h.step(12, false);
  AIR.checkin('osa_kansai'); K.a = 1; h.step(80, false); K.a = 0; h.step(100, false); KP.a = 1; h.step(2, false); h.until(() => G.state === 'play', 900);
  t.ok(J.checked && J.dest === 'osa_kansai' && J.no && J.row, 'check-in gives a flight, a row and a seat to Osaka (' + J.no + ' ' + J.row + J.seat + ')');
  h.use('PUT YOUR THINGS'); ['l', 'd', 'l', 'r', 'l', 'l', 'r', 'l'].forEach(k => { KP[k] = 1; h.step(1); h.step(25); }); h.until(() => G.state === 'play', 900);
  t.ok(J.secured, 'sorting the trays gets you through security');
  pl.x = 186; pl.y = 340; h.walk('u', 90); t.ok(pl.y < shut - 20, 'and the way to the gates opens (y ' + Math.round(pl.y) + ')');
  h.use('BOARD AT GATE'); h.until(() => G.state === 'play', 600); t.ok(M.id !== 'cabin', 'boarding before your group is called does not let you on');
  G.state = 'play'; pl.x = 186; pl.y = 214; t.ok(h.until(() => J.group >= 3, 2400), 'the groups are called in turn, up to yours');
  h.use('BOARD AT GATE'); t.ok(h.until(() => M.id === 'cabin' && G.state === 'play', 900), 'with your group called, you board');
  h.use('SIT IN'); t.ok(h.until(() => G.state === 'ride' && G.ride.plane, 1500), 'sitting in your seat, the plane takes off');
  h.until(() => G.ride && G.ride.meal === 1, 900); KP.r = 1; h.step(1); KP.a = 1; h.step(1); t.ok(G.ride.pick != null, 'a drink from the trolley');
  t.ok(h.until(() => G.state === 'play' && M.id === 'osa_kansai', 2400), 'and you land at Kansai'); h.step(30);
  t.ok(G.stamps.flight, 'with the flight stamp'); t.ok(h.free(), 'on open ground (' + h.at() + ')');
  h.use('SHOW YOUR PASSPORT'); h.until(() => G.state === 'play', 600); t.ok(!J.pp && /BAGGAGE/.test(h.hud()), 'off a domestic flight, the passport booths send you on to baggage claim (' + h.hud() + ')');
  const b = h.spot('FIND YOUR SUITCASE'); b.fn(b);
  h.until(() => { if (G.state !== 'mini') return true; const me = G.mg.cases.find(c => c.me); if (Math.abs(((me.a - 0.25 + 1.5) % 1) - 0.5) < 0.012) KP.a = 1; return false; }, 6000); h.until(() => G.state === 'play', 600);
  t.ok(J.bag, 'your own suitcase off the belt');

  // a hotel: the lobby, a room you need to check in for, and back out the way you came
  go('tokyo'); h.step(2); const hd = M.SPOTS.find(s => s.door === 'ht_tokyo'); G.tgt = { spot: hd }; pl.x = hd.x; pl.y = hd.y; interact(); h.step(5);
  t.eq(M.id, 'ht_tokyo', 'the hotel door opens on the lobby');
  delete (G.inn || {}).tokyo; h.use('TAKE THE LIFT'); h.until(() => G.state === 'play', 600); t.eq(M.id, 'ht_tokyo', 'the lift will not take you up before check-in');
  h.use('CHECK IN'); h.until(() => G.state === 'play', 600); h.use('TAKE THE LIFT'); h.step(5); t.eq(M.id, 'hr_tokyo', 'checked in, the lift goes up to your room');
  G.state = 'play'; pl.x = 160; pl.y = 180; h.walk('d', 40); h.step(3); t.eq(M.id, 'ht_tokyo', 'out of the room, back to the lobby');
  G.state = 'play'; pl.x = 160; pl.y = 180; h.walk('d', 40); h.step(3); t.eq(M.id, 'tokyo', 'out of the lobby, back on the street'); t.ok(h.free(), 'on open ground');

  // the ryokan bath: you wash before you soak
  go('hb_kyoto'); h.step(2); h.use('SOAK'); h.until(() => G.state === 'play', 600); t.ok(!M.washed, 'you may not soak before washing');
  h.use('WASH FIRST'); h.until(() => G.state === 'play', 600); h.use('SOAK'); h.until(() => G.state === 'play', 600); t.ok(M.washed, 'washed, you soak');
});

// The prologue: from the menu to Bangkok's airport, every step of leaving Thailand, and the flight to Haneda.
suite('bangkok', 'shibuya', (t, h) => {
  const B = BKK.BK;
  try { localStorage.removeItem(GAME.save); } catch (e) { }
  G.hasSave = false; G.arrived = 0; G.begun = false; G.state = 'menu'; MENU.open('main'); h.step(10, false); KP.a = 1; h.step(10, false); KP.u = 1; h.step(2, false); KP.a = 1; h.step(10, false); KP.a = 1; h.step(5, false);
  t.eq(M.id, 'bkk_land', 'START, then FROM BANGKOK, begins at Suvarnabhumi'); h.step(60); G.state = 'play';
  h.use('SHOW YOUR PASSPORT'); h.until(() => G.state === 'play', 600); t.ok(!B.stamped, 'passport control turns you back before check-in');
  pl.x = 416; pl.y = 260; h.walk('u', 120); const shut = pl.y; t.ok(shut > 200, 'the way to the gates is shut (y ' + Math.round(shut) + ')');
  h.use('READ THE BOARD'); h.until(() => G.state === 'play', 600);
  h.use('CHECK IN'); KP.a = 1; h.step(1); h.step(90); K.a = 1; h.step(80); K.a = 0; h.step(100); KP.r = 1; h.step(1); h.step(20); KP.a = 1; h.step(1); h.until(() => G.state === 'play', 900);
  t.ok(B.checked && B.seat && G.stamps.bkk_pass, 'check-in: a seat and the boarding pass stamp');
  h.use('SHOW YOUR PASSPORT'); h.until(() => G.state === 'play', 900); t.ok(G.stamps.bkk_exit, 'the exit stamp in your passport');
  h.use('PUT YOUR THINGS'); ['l', 'd', 'l', 'r', 'l', 'l', 'r', 'l'].forEach(k => { KP[k] = 1; h.step(1); h.step(25); }); h.until(() => G.state === 'play', 900); t.ok(B.secured, 'through security');
  pl.x = 416; pl.y = 170; h.walk('u', 120); t.ok(pl.y < shut - 20, 'and the way to the gates opens (y ' + Math.round(pl.y) + ')');
  h.use('TO THE GATES'); h.step(5); t.eq(M.id, 'bkk_air', 'airside');
  const mn = M.ACT.find(a => a.spot && a.spot.stamp === 'bkk_food'); G.tgt = { spot: mn.spot }; interact(); h.until(() => G.state === 'play', 900);
  h.use('TAKE A PHOTO'); h.until(() => G.state === 'play', 900); t.ok(G.stamps.bkk_food && G.stamps.bkk_churn, 'mango sticky rice and the photo of the Churning');
  pl.x = 480; pl.y = 400; h.step(30); t.ok(B.change, 'the gate changes'); h.use('ASK AT GATE D3'); h.until(() => G.state === 'play', 600);
  pl.x = 404; pl.y = 130; G.state = 'play'; h.step(30); h.use('BOARD THE PLANE'); h.until(() => G.state === 'play', 600); t.ok(M.id !== 'bkk_plane', 'boarding before your group is called does not let you on');
  G.state = 'play'; pl.x = 404; pl.y = 130; t.ok(h.until(() => B.group >= 3, 2400), 'the groups are called up to yours');
  h.use('BOARD THE PLANE'); t.ok(h.until(() => M.id === 'bkk_plane' && G.state === 'play', 900), 'and you board');
  h.use('SIT IN 27'); t.ok(h.until(() => G.state === 'ride' && G.ride.plane, 1500) && G.stamps.bkk_board, 'seat 27, the boarding stamp, and off');
  h.until(() => G.ride && G.ride.meal === 1, 900); KP.r = 1; h.step(1); KP.a = 1; h.step(1);
  t.ok(h.until(() => G.state === 'play' && M.id === 'haneda', 2400), 'landing at Haneda'); h.step(60); t.ok(G.stamps.bkk_meal, 'with the meal stamp'); t.ok(h.free(), 'on open ground (' + h.at() + ')');
  G.state = 'play'; AIR.fly('bkk'); t.ok(h.until(() => G.state === 'play' && M.id === 'bkk_land', 2400), 'a flight back to Bangkok');
  t.ok(!B.checked && CITY.id === 'bangkok', 'starts the airport over');
});

// The express lane: straight to your seat, from Haneda, from Bangkok, and from the start menu; and saying no to it.
suite('express', 'haneda', (t, h) => {
  const J = AIR.J;
  go('haneda'); h.step(3); h.use('EXPRESS'); t.ok(G.state === 'menu' && G.menu.kind === 'flight' && G.menu.express, 'Haneda\'s express desk opens the flight list');
  h.step(15); G.menu.sel = 0; KP.a = 1; h.step(1); t.ok(J.dest && J.exp, 'choosing a flight sets up an express trip to ' + J.dest);
  t.ok(h.until(() => G.state === 'ride', 600), 'and goes straight to the flight'); t.ok(h.until(() => G.state === 'play', 4000), 'which lands');
  t.ok(!J.landed && J.bag && J.pp, 'with nothing to do on arrival: no passport queue, no bags (at ' + M.id + ')');

  go('bkk_land'); h.step(3); h.use('EXPRESS'); t.eq(G.state + '/' + (G.menu && G.menu.kind), 'menu/express', 'Bangkok\'s express desk asks first');
  h.step(15); G.menu.sel = 0; KP.a = 1; h.step(1); t.ok(h.until(() => G.state === 'ride', 600), 'yes goes straight to the flight');
  t.ok(h.until(() => G.state === 'play', 4000) && M.id === 'haneda', 'which lands at Haneda'); t.ok(!J.landed && J.bag, 'with nothing to do on arrival');

  go('bkk_land'); h.step(3); h.use('EXPRESS'); h.step(15); G.menu.sel = 1; KP.a = 1; h.step(2); t.ok(G.state === 'play' && M.id === 'bkk_land', 'no leaves you in the terminal');

  G.hasSave = false; G.arrived = 0; MENU.open('begin'); h.step(1); h.step(15); G.menu.sel = 1; KP.a = 1; h.step(1);
  t.ok(h.until(() => G.state === 'ride', 600), 'FROM BANGKOK, EXPRESS on the start menu goes straight to the flight');
  t.ok(h.until(() => G.state === 'play', 4000) && M.id === 'haneda', 'and lands at Haneda');
});
