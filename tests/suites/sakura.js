// Cherry blossom: Ueno in hanami season (the weeping cherry, picnics on blue sheets, lanterns, catching a petal), and
// the cherries along the palace moat.
suite('sakura', 'ueno', (t, h) => {
  go('ueno'); h.step(5);
  const cherries = M.OBJ.filter(o => o.kind === 'sakura');
  t.ok(cherries.length >= 20, 'Ueno is full of cherry trees (' + cherries.length + ')');
  t.ok(M.OBJ.some(o => o.spr === SPR.shidare), 'with the old weeping cherry in the middle of the park');
  t.ok(SPR.sakura.every(c => c.lw > 56), 'cherries are wider than other trees, spreading rather than round');
  t.ok(M.ACT.filter(a => a.draw === sitting).length >= 6, 'people sit on blue sheets under the trees (' + M.ACT.filter(a => a.draw === sitting).length + ')');
  t.ok((M.NLx || []).length >= 9, 'paper lanterns strung along the avenue, to light up at dusk');
  delete G.stamps.hanami; h.use('JOIN THE HANAMI'); h.until(() => G.state === 'play', 900); t.ok(G.stamps.hanami, 'joining a hanami picnic: the HANAMI IN UENO stamp');
  // a bot that keeps its hands under the lowest petal
  h.use('CATCH A FALLING PETAL'); const m = G.mg; t.eq(G.state + '/' + (m && m.k), 'mini/petal', 'under the weeping cherry, catch a falling petal');
  for (let n = 0; n < 60 * 25 && G.state === 'mini'; n++) { const p = m.p.slice().sort((a, b) => b.y - a.y)[0]; K.l = K.r = 0; if (p) { if (p.x < m.hx - 2) K.l = 1; else if (p.x > m.hx + 2) K.r = 1; } update(1 / 60); if (n % 4 === 0) h.paint(); }
  K.l = K.r = 0; h.until(() => G.state === 'play', 300); t.ok(m.got, 'a steady pair of hands catches one, and you make a wish');
  // the palace moat: Chidorigafuchi
  go('tokyo'); h.step(3); const moat = M.OBJ.filter(o => o.kind === 'sakura' && o.y < 80);
  t.ok(moat.length >= 10, 'cherries lean out over the palace moat (' + moat.length + ')');
});
