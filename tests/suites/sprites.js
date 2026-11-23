// City art is painted when a city is first visited and let go when its maps are, and painting it again gives the same pictures.
suite('sprites', 'shibuya', (t, h) => {
  const made = () => Object.keys(LAZY.made).filter(k => LAZY.made[k]).sort().join(',');
  const has = k => Object.keys(SPR).includes(k); // (asking SPR.k for a missing k would go and paint it)
  const mb = () => { let p = 0; for (const k of Object.keys(SPR)) { const v = SPR[k]; for (const c of Array.isArray(v) ? v.flat(3) : [v]) if (c && c.width) p += c.width * c.height; } return p * 4 / 1e6; };
  const sum = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let a = 0; for (let i = 0; i < d.length; i += 7) a = (a * 31 + d[i]) | 0; return a; };

  t.eq(made(), 'tokyo', 'starting in Shibuya paints Tokyo\'s art and no other city\'s');
  t.ok(mb() < 10, 'the art painted at the start is under 10 MB (it is ' + mb().toFixed(1) + ' MB)');
  for (const c of CLIST) for (const k in c.stamps || {}) { const ic = c.stamps[k][1]; if (typeof ic === 'string') t.ok(ICON[ic], c.id + ' stamp ' + k + ' has its icon ' + ic + ' from the start'); }

  // each city, visited: its art and what it needs, nothing more
  for (const c of CLIST) {
    for (const k in BUILT) delete BUILT[k]; RECENT.length = 0; dropCitySprites(new Set());
    go(c.start); h.step(2);
    t.eq(made(), [c.id].concat(c.needs || []).sort().join(','), 'visiting ' + c.id + ' paints its own art' + (c.needs ? ' and ' + c.needs : ''));
  }

  // Kyoto's art goes once none of its maps are kept, and comes back the same
  go('kyo_gion'); h.step(2); const key = LAZY.keys.kyoto.find(k => SPR[k] && SPR[k].width), before = sum(SPR[key]), n = LAZY.keys.kyoto.length;
  t.ok(key && n > 5, 'Kyoto painted its art (' + n + ' pictures)');
  for (const id of ['shibuya', 'harajuku', 'shinjuku', 'akiba', 'asakusa', 'ueno', 'tower']) { go(id); h.step(2); }
  t.ok(!LAZY.made.kyoto && !has(key), 'after six other maps, Kyoto\'s art is let go');
  t.ok(LAZY.made.tokyo, 'and Tokyo\'s, still in use, is kept');
  go('kyo_gion'); h.step(2);
  t.ok(has(key) && LAZY.keys.kyoto.length === n, 'back in Kyoto, its art is painted again');
  t.eq(sum(SPR[key]), before, 'and the picture ' + key + ' comes out exactly as before');
  t.ok(!LAZY.miss.length, 'nothing went looking for art in the wrong city' + (LAZY.miss.length ? ': ' + LAZY.miss.join(', ') : ''));
});
