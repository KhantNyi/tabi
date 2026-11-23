// Local stations: in from the street, a ticket from the machines outside the gates, through, up to the platform, a train
// that keeps time, and a ride to another stop. Then in and out of every station building in every city.
suite('stations', 'shibuya', (t, h) => {
  let T = 1000; window.worldTime = () => T; const PER = 32, at = p => { T = 1600 * PER + p; h.step(1); };
  // at a station's TRAINS sign you choose: walk in, or express; walkIn() takes the first
  const walkIn = lab => { h.use(lab || 'TRAINS'); if (G.state === 'menu' && G.menu.kind === 'train') G.menu.walk(); };
  G.ic = 0; G.tix = {}; G.trainX = 0;
  go('shibuya'); h.step(3);
  const door = h.spot('TRAINS'); t.eq(door && door.door, 'stn_tokyo', 'Shibuya\'s TRAINS sign is a door into the station');
  h.use('TRAINS'); t.ok(G.state === 'menu' && G.menu.kind === 'train', 'the TRAINS sign asks: walk in, or express');
  t.eq(G.menu.sel, 0, 'walking in is the first choice the first time'); h.step(15, false); KP.a = 1; h.step(3);
  t.eq(M.id, 'stn_tokyo', 'walking in takes you inside'); t.eq(M.from, 'shibuya', 'the station knows which street you came from');
  t.ok(/^[A-Z ]+ STATION$/.test(M.def.name) && !/STATION STATION/.test(M.def.name), 'the station is named for its stop (' + M.def.name + ')');
  t.ok(/TICKET/.test(h.hud()), 'without a ticket, the hud says where the machines are (' + h.hud() + ')');

  // the gates are shut to you, but the machines, the IC card machine, the kiosk and the way out are not
  let wk = h.walkable(pl.x, pl.y);
  for (const lab of ['BUY A TICKET', 'IC CARD', 'BUY SOMETHING', 'OUT TO']) { const s = h.spot(lab); t.ok(s && wk.reaches(s.x, s.y, s.r), 'without a ticket you can walk to ' + lab); }
  const board = h.spot('BOARD THE TRAIN'); t.ok(!wk.reaches(board.x, board.y, board.r), 'without a ticket the platform is shut off');
  G.state = 'play'; pl.x = 216; pl.y = 252; h.walk('u', 80); h.step(30); t.ok(pl.y > 226, 'walking at the gates with no ticket, they stay shut (y ' + Math.round(pl.y) + ')');

  // buy one
  h.use('BUY A TICKET'); t.eq(G.state + '/' + (G.mg && G.mg.k), 'mini/ticket', 'the machine opens the ticket game');
  G.mg.sel = G.mg.opts.indexOf(G.mg.fare); KP.a = 1; h.step(1); h.until(() => G.state === 'play', 900);
  t.ok(G.tix.tokyo, 'paying the right fare gives you a Tokyo ticket');
  G.state = 'play'; pl.x = 216; pl.y = 252; h.walk('u', 90); t.ok(pl.y < 226, 'with a ticket, the gates let you through (y ' + Math.round(pl.y) + ')');
  pl.x = 240; pl.y = 200; h.walk('u', 120); const up = h.walkable(pl.x, pl.y); t.ok(pl.y < 200 && up && up.reaches(board.x, board.y, board.r), 'and up the stairs onto the platform (y ' + Math.round(pl.y) + ')');

  // the train keeps time: no doors, no boarding
  at(20.5); h.use('BOARD THE TRAIN'); t.ok(G.state !== 'line', 'with no train in, you cannot board'); h.until(() => G.state === 'play', 600);
  at(9); h.use('BOARD THE TRAIN'); t.eq(G.state, 'line', 'with the doors open, BOARD THE TRAIN opens the line map');
  const here = CITY.line.findIndex(s => s[0] === 'shibuya'); G.line.sel = here; KP.a = 1; h.step(1);
  t.ok(G.state !== 'ride', 'choosing the stop you are at does not ride anywhere');
  at(9); h.use('BOARD THE TRAIN'); G.line.sel = (here + 2) % CITY.line.length; const want = CITY.line[G.line.sel][0]; KP.a = 1; h.step(1);
  t.ok(h.until(() => G.state === 'play' && M.id === want, 4000), 'riding two stops on arrives at ' + want + ' (at ' + M.id + ')');

  // back in, and out by the street door
  walkIn(); h.step(3); h.use('OUT TO THE STREET'); h.step(3); t.eq(M.id, want, 'OUT TO THE STREET goes back where you came in');
  t.ok(h.free(), 'and you can walk away from the door');
  // from inside the gates with no ticket: the way out always opens
  G.tix = {}; walkIn(); h.step(2); G.state = 'play'; pl.x = 216; pl.y = 220; h.walk('d', 60); t.ok(pl.y > 236, 'leaving from the platform side, the gates open even with no ticket (y ' + Math.round(pl.y) + ')');

  // every station building in every city
  for (const id in MAPS) {
    if (/^stn_|cabin|^bkk/.test(id) || MAPS[id].indoor) continue;
    go(id); h.step(2); const s = M.SPOTS.find(q => q.door && /^stn_/.test(q.door)); if (!s) continue;
    walkIn(s.label); h.step(4);
    t.ok(/^stn_/.test(M.id) && M.from === id && !/STATION STATION/.test(M.def.name), id + ': in through ' + s.label + ' to ' + M.def.name);
    h.use('OUT TO THE STREET'); h.step(2); t.ok(M.id === id && h.free(), id + ': and back out onto open ground (at ' + M.id + ' ' + h.at() + ')');
    if (G.err) break;
  }

  // express: from the street straight to the line map, no ticket machine, no gates, no wait
  G.ic = 0; G.tix = {}; G.trainX = 0; go('shibuya'); h.step(3);
  h.use('TRAINS'); h.step(15, false); G.menu.sel = 1; KP.a = 1; h.step(1);
  t.ok(G.state === 'line' && G.line.express, 'EXPRESS goes straight to the line map');
  const here2 = CITY.line.findIndex(s => s[0] === 'shibuya'); G.line.sel = (here2 + 2) % CITY.line.length; const want2 = CITY.line[G.line.sel][0]; KP.a = 1; h.step(1);
  t.eq(G.state, 'ride', 'and onto a train, with no ticket machine even without a ticket or an IC card');
  t.ok(h.until(() => G.state === 'play' && M.id === want2, 4000), 'arriving at ' + want2 + ' (at ' + M.id + ')'); t.ok(!G.tix.tokyo, 'no ticket was needed');
  h.use('TRAINS'); t.eq(G.menu && G.menu.sel, 1, 'next time, express is the choice that comes up first');
  KP.x = 1; h.step(2); t.eq(G.state, 'play', 'ESC closes the choice and you stay on the street');
});
