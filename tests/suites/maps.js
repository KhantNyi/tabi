// Every map: built from nothing, played and drawn for five seconds, with no error, using only art it is entitled to.
// Before each map everything built is let go, as if the game had just started there, so a map that quietly borrows a
// picture from another city (which then happened to be painted already) is caught, not hidden by the order maps run in.
suite('maps', 'shibuya', (t, h) => {
  for (const id of Object.keys(MAPS)) {
    G.err = null; for (const k in BUILT) delete BUILT[k]; RECENT.length = 0; dropCitySprites(new Set()); LAZY.miss.length = 0;
    const d = MAPS[id]; if (d.indoor) { const c = CITIES[d.city] || CITY; G.back = { map: c.start, x: 160, y: 182 }; G.bstack = []; }
    try { go(id); G.state = 'play'; G.banner = 0; for (let k = 0; k < 300 && !G.err; k++) { update(1 / 60); if (k % 3 === 0) h.paint(); } } catch (e) { G.err = String(e.stack || e); }
    t.ok(!G.err, id + ' builds, plays and draws' + (G.err ? ': ' + G.err.slice(0, 300) : ''));
    t.ok(!LAZY.miss.length, id + ' uses only its own city\'s art, the shared art, or cities it names in needs' + (LAZY.miss.length ? ' (borrowed ' + LAZY.miss.join(', ') + ')' : ''));
  }
  G.err = null;
});

// Every spot (and every NPC you can talk to, and every cat) can be walked to from where the map puts you.
suite('reach', 'shibuya', (t, h) => {
  const TIDE = { miyajima: ['TOUCH THE TORII'] }; // out on the sand only at low tide, by design
  for (const id of Object.keys(MAPS)) {
    const d = MAPS[id]; if (d.indoor) { const c = CITIES[d.city] || CITY; G.back = { map: c.start, x: 160, y: 182 }; G.bstack = []; }
    go(id); const st = M.st || [160, 182], wk = h.walkable(st[0], st[1]);
    if (!t.ok(wk, id + ': the start ' + st + ' is not inside a wall')) continue;
    const bad = [];
    for (const s of M.SPOTS) if (!wk.reaches(s.x, s.y, s.r) && !(TIDE[id] || []).some(l => (s.label || '').indexOf(l) === 0)) bad.push((s.label || '?') + ' at ' + s.x + ',' + s.y);
    for (const n of M.ACT) { if (n.spot && !wk.reaches(n.x, n.y + 16, 22)) bad.push('talking to ' + n.spot.label); if (n.cat && !wk.reaches(n.x, n.y, 15)) bad.push('the cat at ' + n.x + ',' + n.y); }
    t.ok(!bad.length, id + ': everything can be walked to' + (bad.length ? ' (not: ' + bad.join(' | ') + ')' : ''));
  }
});
