// A bot plays minigames to the end, the way a careful player would, and must win each one and get its stamp.
suite('minigames', 'kam_town', (t, h) => {
  const games = [['orizuru', 'hir_crane'], ['layers', 'hir_okono'], ['manju', 'miy_manju'], ['surf', 'kam_surf'], ['snowball', 'sap_snowball'], ['ramen', 'sap_ramen'], ['glass', 'sap_glass'], ['eisa', 'oki_eisa']];
  const play = {
    orizuru: m => { if (m.ft > 0.35 && m.i < 8) KP[['u', 'l', 'd', 'r', 'u', 'l', 'u', 'd'][m.i]] = 1; },
    layers: m => { const top = m.st[m.st.length - 1]; if (!m.drop && Math.abs(m.x - top.x) < 1.5) KP.a = 1; },
    manju: m => { const md = m.molds.find(q => Math.abs(q.x - 160) < 12 && !q.judged); K.a = md && md.f < 0.8 ? 1 : 0; },
    surf: m => { K.u = K.d = 0; if (m.ph === 'wait') { if ((m.t * 60 | 0) % 4 === 0 && m.wx > 120) KP.a = 1; } else if (m.ph === 'pop') KP.a = 1; else if (m.y > m.zone + 0.03) K.u = 1; else if (m.y < m.zone - 0.03) K.d = 1; },
    snowball: m => { K.l = K.r = K.u = K.d = 0; const p = m.pop.find(q => q.up > 0.6 && !q.hit); if (!p) return; if (m.cx < p.x - 2) K.r = 1; else if (m.cx > p.x + 2) K.l = 1; if (m.cy < 76) K.d = 1; else if (m.cy > 80) K.u = 1; if (Math.abs(m.cx - p.x) < 4 && !m.balls.length) KP.a = 1; },
    ramen: m => { if (m.ph !== 'pick') return; const w = m.want[m.got.length]; if (w == null) return; if (m.sel !== w) KP.r = 1; else KP.a = 1; },
    glass: m => { const want = [0.5, 0.7, 0.85][Math.min(m.i, 2)]; K.a = m.wait <= 0 && m.r < want - 0.01 ? 1 : 0; },
    eisa: m => { if (m.notes.find(q => !q.hit && Math.abs(q.t - m.clock) < 0.03)) KP.a = 1; },
  };
  for (const [k, st] of games) {
    delete G.stamps[st]; G.state = 'mini'; G.mg = { k, sp: { stamp: st }, t: 0 }; MG[k].init(G.mg); let fr = 0;
    while (fr < 60 * 120 && !G.err) { if (G.state === 'mini') play[k](G.mg); else if (G.state === 'dialog' || G.state === 'got') KP.a = 1; else break; update(1 / 60); fr++; if (fr % 4 === 0 && G.state === 'mini') h.paint(); }
    K.a = K.u = K.d = K.l = K.r = 0;
    t.ok(G.stamps[st], k + ': won, with the stamp ' + st + ' (' + (fr / 60).toFixed(1) + 's)');
  }
});
