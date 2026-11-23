// Everyday Japan: a first ride with no IC card, the konbini, a night's sleep, rain, and keeping only a few maps in memory.
suite('everyday', 'shibuya', (t, h) => {
  G.ic = 0; G.tix = {}; go('shibuya'); h.step(2);
  G.state = 'line'; G.line = { sel: 4 }; KP.a = 1; h.step(1); t.eq(G.state + '/' + (G.mg && G.mg.k), 'mini/ticket', 'a first ride with no IC card starts at the ticket machine');
  G.mg.sel = G.mg.opts.indexOf(G.mg.fare); KP.a = 1; h.step(1); h.until(() => G.state !== 'mini', 300);
  t.ok(G.state === 'ride' && G.tix.tokyo, 'paying the fare: a ticket, and the train');
  const seats = G.seats || 0; G.ride.seat = 1; G.ride.t = 1.2; KP.a = 1; h.step(1); t.ok(G.ride.seat === 2 && G.seats === seats + 1, 'offered a seat, E sits you down (and counts it)');
  t.ok(h.until(() => G.state === 'play', 600), 'and you get off at ' + M.id);
  G.state = 'line'; G.line = { sel: 0 }; KP.a = 1; h.step(1); t.eq(G.state, 'ride', 'with a ticket, the next ride needs no machine'); h.until(() => G.state === 'play', 600);

  go('kb_tokyo'); h.step(2);
  delete G.stamps.kb_tokyo; h.use('ONLY HERE'); h.until(() => G.state === 'play', 900); t.ok(G.stamps.kb_tokyo, 'the local special, and its stamp');
  h.use('PICK A DRINK'); t.ok(G.state === 'mini' && G.mg, 'the fridge opens (' + (G.mg && G.mg.k) + ')'); G.mg = null; G.state = 'play';

  go('hr_kyoto'); h.step(2); G.dayOff = ((23 * 60 - worldTime()) % 1440 + 1440) % 1440; const night = DAY.label();
  t.ok(h.use('SLEEP'), 'there is a bed in the room'); h.until(() => G.state === 'play', 900); t.ok(DAY.label() !== night, 'sleeping moves the clock on (' + night + ' to ' + DAY.label() + ')');

  for (const id of ['shibuya', 'harajuku', 'shinjuku', 'ueno', 'asakusa', 'akiba', 'tokyo', 'kam_town', 'kam_hase', 'kam_shore', 'hir_town', 'miyajima', 'sap_odori', 'oki_beach', 'nara', 'shibuya']) { go(id); h.step(10); }
  t.ok(Object.keys(BUILT).length <= 6, 'after sixteen maps, only the last six are kept (' + Object.keys(BUILT).join(', ') + ')');
  const made = Object.keys(LAZY.made).filter(k => LAZY.made[k]), keep = new Set(Object.values(BUILT).map(B => B.def.city)); for (const c of [...keep]) (CITIES[c].needs || []).forEach(n => keep.add(n));
  t.ok(made.every(c => keep.has(c)), 'and only their cities\' art (' + made.join(', ') + ')');

  window.worldTime = () => { let s = 0; while (hsh(s, 77) >= 0.09) s++; return s * 480 + 240 + G.t; }; go('oki_kokusai'); h.step(120);
  t.ok(DAY.rain() > 0.5, 'rain falls on a rainy day (' + DAY.rain().toFixed(2) + ')');
});
