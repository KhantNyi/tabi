'use strict';
// ---------- Tabi's tests ----------
// Each suite plays the real game in a fresh frame (../index.html?test&map=...). Its code is sent into that frame and run
// there, so it sees the game's own globals (G, M, pl, go, update, SPR ...) just as the game's scripts do, and drives
// the game the way a player would: keys held, E pressed, frames stepped by hand rather than in real time.
// ?test gives the game a save of its own (see GAME in main.js), so running these never touches a real one.
const SUITES = [];
// suite(name, map to start on, fn(t, h)): t records checks, h is the toolkit below, made inside the game's frame
function suite(name, map, fn) { SUITES.push({ name, map, fn }); }

// the toolkit, built inside the game frame so its names are the game's
const TOOLKIT = function () {
  const h = {};
  // draw the current frame the way main.js does, so drawing code runs too
  h.paint = () => { if (G.state === 'ride') { const r = G.ride; if (r.plane) { AIR.drawFlight(r); if (r.over) r.over(r); } else if (r.ship) PLACES.drawShip(r); else if (r.sleep) DAY.drawSleep(r); else drawRide(); } else if (G.state === 'scrap') AIR.scrapDraw(); else { drawWorld(); drawUI(); } };
  // step n frames; dialogs and 'got it' cards are clicked through unless auto is false
  h.step = (n, auto) => { for (let k = 0; k < n; k++) { if (auto !== false && (G.state === 'dialog' || G.state === 'got')) KP.a = 1; update(1 / 60); if (k % 3 === 0) h.paint(); if (G.err) return; } };
  h.until = (cond, max) => { let n = 0; while (!cond() && n < (max || 3000) && !G.err) { h.step(5); n += 5; } return cond(); };
  h.spot = lab => M.SPOTS.find(s => s.label && s.label.indexOf(lab) === 0);
  // stand on a spot and press E
  h.use = lab => { const s = h.spot(lab); if (!s) return false; G.state = 'play'; pl.x = s.x; pl.y = s.y; G.tgt = { spot: s }; interact(); return true; };
  // hold a direction for n frames
  h.walk = (dir, n) => { for (let i = 0; i < n; i++) { K[dir] = 1; update(1 / 60); } K[dir] = 0; };
  h.hud = () => M.def.hud ? String(M.def.hud()) : '';
  h.at = () => Math.round(pl.x) + ',' + Math.round(pl.y);
  // everywhere you can walk to from (x, y) on this map, in 4px cells; .reaches(spot) says whether a spot's circle is in it
  h.walkable = (x, y) => {
    const W4 = M.SW, H4 = M.SH, seen = new Uint8Array(W4 * H4), ok = (i, j) => i >= 0 && j >= 0 && i < W4 && j < H4 && !hit(i * 4 + 2, j * 4 + 3);
    let q = [[Math.floor(x / 4), Math.floor(y / 4)]]; if (!ok(q[0][0], q[0][1])) return null; seen[q[0][1] * W4 + q[0][0]] = 1;
    while (q.length) { const n = []; for (const [i, j] of q) for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = i + a, v = j + b; if (ok(u, v) && !seen[v * W4 + u]) { seen[v * W4 + u] = 1; n.push([u, v]); } } q = n; }
    return { reaches(px, py, r) { for (let j = Math.floor((py - r) / 4); j <= (py + r) / 4; j++) for (let i = Math.floor((px - r) / 4); i <= (px + r) / 4; i++) if (i >= 0 && j >= 0 && i < W4 && j < H4 && seen[j * W4 + i] && Math.hypot(i * 4 + 2 - px, (j * 4 + 3 - py) * 1.3) < r) return true; return false; } };
  };
  // can the player take a step in any direction from where they stand?
  h.free = () => [[2, 0], [-2, 0], [0, 2], [0, -2]].filter(d => !hit(pl.x + d[0], pl.y + d[1])).length > 0 && !hit(pl.x, pl.y);
  return h;
};

// ---------- running ----------
const OUT = document.getElementById('o'), TALLY = { pass: 0, fail: 0 };
const line = (s, cls) => { const d = document.createElement('span'); d.textContent = s + '\n'; if (cls) d.className = cls; OUT.appendChild(d); };
function runSuite(s) {
  return new Promise(done => {
    try { localStorage.removeItem('tabi-test'); } catch (e) { }
    const f = document.createElement('iframe'); let fails = 0, n = 0;
    f.style.cssText = 'width:640px;height:360px;border:0;position:absolute;left:-9999px';
    const t = {
      ok(cond, what) { n++; if (!cond) { fails++; TALLY.fail++; line('  FAIL ' + what, 'fail'); } else TALLY.pass++; return !!cond; },
      eq(got, want, what) { return t.ok(got === want, what + ' (wanted ' + JSON.stringify(want) + ', got ' + JSON.stringify(got) + ')'); },
      log(s) { line('  ' + s, 'log'); },
    };
    f.onload = () => setTimeout(() => {
      const w = f.contentWindow;
      try {
        const err = () => w.eval('G.err'); // (the game's globals are consts, not properties of its window, so they are reached through eval)
        if (err()) throw new Error('the game failed to start: ' + err());
        w.eval('G.state = "play"; G.banner = 0');
        const h = w.eval('(' + TOOLKIT + ')()');
        w.eval('(' + s.fn + ')')(t, h);
        t.ok(!err(), 'no error in the game' + (err() ? ': ' + err().slice(0, 400) : ''));
      } catch (e) { fails++; TALLY.fail++; line('  FAIL threw ' + String(e.stack || e).slice(0, 600), 'fail'); }
      line((fails ? 'FAIL ' : 'PASS ') + s.name + '  (' + n + ' checks)', fails ? 'fail head' : 'pass head');
      document.body.removeChild(f); done();
    }, 200);
    f.src = '../index.html?test&map=' + s.map;
    document.body.appendChild(f);
  });
}
async function runAll() {
  const only = new URLSearchParams(location.search).get('only'), pick = only ? only.split(',') : null;
  const list = SUITES.filter(s => !pick || pick.includes(s.name));
  if (!list.length) line('no suite called ' + only + '. there are: ' + SUITES.map(s => s.name).join(', '), 'fail');
  for (const s of list) await runSuite(s);
  line((TALLY.fail ? 'FAILED: ' : 'ALL PASSED: ') + TALLY.pass + ' passed, ' + TALLY.fail + ' failed', TALLY.fail ? 'fail head' : 'pass head');
  line('DONE');
}
