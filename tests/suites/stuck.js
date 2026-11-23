// Never stuck: wherever a ride, a flight, a ship or a door puts you down, you can walk away.
suite('stuck', 'shibuya', (t, h) => {
  const chk = what => { if (G.state === 'play') h.step(2); t.ok(h.free(), what + ': you can walk away (at ' + M.id + ' ' + h.at() + (hit(pl.x, pl.y) ? ', inside something solid' : '') + ')'); };
  const done = () => { for (let k = 0; k < 5; k++) { if (G.state === 'dialog' || G.state === 'got') KP.a = 1; update(1 / 60); } };
  // the shinkansen into every city
  for (const c of CLIST) { if (c.prologue) continue; go(CITY.hub || CITY.start); G.ride = { city: c, t: 999 }; G.state = 'ride'; update(1 / 60); done(); chk('the shinkansen to ' + c.id); }
  // out of every shinkansen concourse
  for (const c of CLIST) { if (!c.concourse) continue; go(c.concourse); pl.x = 320; pl.y = 568; G.state = 'play'; h.step(2); chk('out of the ' + c.id + ' shinkansen concourse'); }
  // boats: on, then off at once
  for (const id in RIDES.BOATS) { go(id); const B = RIDES.BOATS[id], s = M.SPOTS.find(q => q.label === B.label); G.state = 'play'; pl.x = s.x; pl.y = s.y; G.tgt = { spot: s }; interact(); done(); KP.x = 1; update(1 / 60); done(); chk('off the boat at ' + id); }
  // tours that end at a dock
  for (const id in RIDES.TOURS) { const T = RIDES.TOURS[id]; if (!T.dock) continue; go(id); pl.x = T.dock[0]; pl.y = T.dock[1]; G.state = 'play'; h.step(2); chk('the end of the tour at ' + id); }
  // every airport arrival and every ship's dock
  for (const p in AIR.PORTS) { const g = AIR.PORTS[p].go || [p, 580, 184]; go(g[0], g[1], g[2]); G.state = 'play'; chk('landing at ' + p); }
  for (const c of CLIST) if (Array.isArray(c.dock)) { go(c.dock[0], c.dock[1], c.dock[2]); G.state = 'play'; chk('the ship into ' + c.id); }
  // every door on every street: in, then out again the way a player would
  for (const id of Object.keys(MAPS).filter(k => !MAPS[k].indoor)) {
    go(id); const doors = M.SPOTS.filter(s => s.door);
    for (const d of doors) {
      go(id); const s = M.SPOTS.find(q => q.door === d.door && q.x === d.x); G.state = 'play'; pl.x = s.x; pl.y = s.y; G.tgt = { spot: s }; interact(); if (G.state === 'menu' && G.menu.kind === 'train') G.menu.walk(); done();
      if (M.id === id) continue; const inside = M.id;
      if (M.indoor) { G.state = 'play'; pl.x = M.w / 2; pl.y = M.h - 6; for (let j = 0; j < 30 && M.id === inside; j++) { K.d = 1; update(1 / 60); } K.d = 0; }
      else { const o = M.SPOTS.find(q => /^OUT TO|^EXIT/.test(q.label || '')); if (o) { pl.x = o.x; pl.y = o.y; G.tgt = { spot: o }; interact(); update(1 / 60); } }
      if (!t.ok(M.id !== inside, 'you can leave ' + inside + ' (in from ' + id + ')')) continue;
      chk('back out of ' + inside);
    }
    if (G.err) break;
  }
});
