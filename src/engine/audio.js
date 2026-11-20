'use strict';
// ---------- chiptune music + sound effects, synthesized live with WebAudio ----------
const NOTE_IX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function nf(n) { // "F#5" -> Hz
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n); if (!m) return 0;
  const s = NOTE_IX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3]) + 1) * 12;
  return 440 * Math.pow(2, (s - 69) / 12);
}
const CH = {
  F: ['F3', 'A3', 'C4', 'E4'], G: ['G3', 'B3', 'D4', 'F4'], Em: ['E3', 'G3', 'B3', 'D4'], Am: ['A3', 'C4', 'E4', 'G4'],
  C: ['C3', 'G3', 'E4', 'B4'], Dm: ['D3', 'F3', 'A3', 'C4'],
  Dq: ['D3', 'A3', 'D4', 'G4'], Gq: ['G3', 'D4', 'G4', 'Bb4'], Ebq: ['Eb3', 'Bb3', 'Eb4', 'G4'], Aq: ['A2', 'A3', 'D4', 'G4'],
  G_: ['G3', 'B3', 'D4', 'G4'], Em_: ['E3', 'G3', 'B3', 'E4'], C_: ['C3', 'E3', 'G3', 'C4'], D_: ['D3', 'F#3', 'A3', 'D4'], Bm_: ['B2', 'D3', 'F#3', 'B3'],
  Fp: ['F3', 'C4', 'F4', 'A4'], Amp: ['A3', 'C4', 'E4', 'A4'], Bbp: ['Bb2', 'F3', 'Bb3', 'D4'], Dmp: ['D3', 'A3', 'D4', 'F4'], Cp: ['C3', 'G3', 'C4', 'E4']
};
const TRACKS = {
  tokyo: {
    bpm: 92, lead: 'soft', arp: [0, 1, 2, 3, 2, 1, 2, 1], drums: 'chill', bass: 'walk',
    chords: 'F G Em Am F G C C F G Em Am Dm G C C',
    mel: ['A5/3 G5/1 E5/2 C5/2 E5/4 -/4', 'D5/2 E5/2 G5/2 B5/2 A5/4 G5/4', 'G5/3 E5/1 D5/2 B4/2 D5/4 -/4', 'C5/2 D5/2 E5/2 G5/2 E5/6 -/2',
      'A5/3 G5/1 E5/2 C5/2 E5/2 G5/2 A5/4', 'B5/4 A5/2 G5/2 D5/4 E5/2 D5/2', 'C5/8 E5/2 G5/2 C6/4', 'G5/6 E5/2 C5/4 -/4',
      'C6/2 A5/2 F5/2 A5/2 C6/4 A5/4', 'B5/2 G5/2 D5/2 G5/2 B5/4 D6/4', 'E6/3 D6/1 B5/2 G5/2 B5/6 -/2', 'A5/2 C6/2 E6/2 C6/2 A5/4 G5/4',
      'F5/2 A5/2 D6/4 C6/2 A5/2 F5/4', 'G5/2 B5/2 D6/4 B5/2 G5/2 F5/4', 'E5/4 G5/4 C6/6 -/2', '-/16']
  },
  kyoto: {
    bpm: 66, lead: 'flute', arp: [0, 1, 2, 3, 2, 3, 1, 2], drums: 'taiko', bass: 'drone', pluck: true,
    chords: 'Dq Dq Gq Dq Ebq Dq Gq Aq Dq Dq Gq Dq Ebq Dq Gq Dq',
    mel: ['A5/6 Bb5/2 A5/4 G5/4', 'D5/8 -/8', 'G5/4 A5/2 Bb5/2 D6/6 -/2', 'A5/8 -/8',
      'Bb5/4 G5/4 Eb5/4 G5/4', 'A5/6 G5/2 D5/8', 'G5/4 Bb5/4 A5/4 G5/4', 'A5/12 -/4',
      'D6/6 Eb6/2 D6/4 Bb5/4', 'A5/8 -/8', 'G5/2 A5/2 Bb5/4 A5/4 G5/4', 'D5/12 -/4',
      'Eb5/4 G5/4 Bb5/4 A5/4', 'G5/4 A5/4 D5/8', 'G5/2 A5/2 Bb5/2 D6/2 Eb6/4 D6/4', 'D6/12 -/4']
  },
  osaka: {
    bpm: 122, lead: 'bright', arp: [0, 2, 1, 2, 0, 2, 1, 3], drums: 'bounce', bass: 'octave',
    chords: 'G_ Em_ C_ D_ G_ Em_ C_ D_ C_ D_ Bm_ Em_ C_ D_ G_ G_',
    mel: ['D5/2 G5/2 B5/2 G5/2 D6/4 B5/4', 'E5/2 G5/2 B5/2 G5/2 E6/4 B5/4', 'C6/2 B5/2 A5/2 G5/2 E5/4 G5/4', 'A5/2 -/2 A5/2 B5/2 A5/4 D5/4',
      'D5/2 G5/2 B5/2 G5/2 D6/4 E6/4', 'D6/2 B5/2 G5/2 B5/2 E5/4 -/4', 'E5/2 G5/2 C6/2 E6/2 D6/4 C6/4', 'B5/2 A5/2 F#5/2 A5/2 D6/6 -/2',
      'E6/4 C6/2 G5/2 C6/4 E6/4', 'D6/4 A5/2 F#5/2 A5/4 D6/4', 'D6/2 B5/2 F#5/2 B5/2 D6/4 F#6/4', 'E6/6 D6/2 B5/4 G5/4',
      'C6/2 E6/2 G6/4 E6/2 C6/2 G5/4', 'F#5/2 A5/2 D6/4 C6/2 A5/2 F#5/4', 'G5/2 B5/2 D6/2 G6/2 D6/4 B5/4', 'G5/8 -/8']
  },
  fuji: {
    bpm: 78, lead: 'soft', arp: [0, 1, 2, 3, 2, 1, 2, 3], drums: 'none', bass: 'walk',
    chords: 'C_ G_ Am F C_ Em F G_ Am Em F C_ Dm G_ C_ C_',
    mel: ['E5/4 G5/4 C6/6 B5/2', 'D6/4 B5/4 G5/8', 'A5/4 C6/4 E6/4 D6/4', 'C6/8 A5/8',
      'G5/2 A5/2 G5/2 E5/2 C5/4 E5/4', 'G5/4 B5/4 E6/8', 'F5/4 A5/4 C6/4 A5/4', 'D6/12 -/4',
      'E6/4 D6/2 C6/2 A5/8', 'G5/4 B5/4 E5/8', 'F5/2 G5/2 A5/4 C6/4 F6/4', 'E6/8 C6/8',
      'D6/4 C6/4 A5/4 F5/4', 'G5/4 B5/4 D6/4 B5/4', 'C6/16', '-/16']
  },
  nara: {
    bpm: 70, lead: 'box', arp: [0, 1, 2, 1, 3, 1, 2, 1], drums: 'none', bass: 'drone',
    chords: 'Fp Amp Bbp Fp Dmp Bbp Cp Fp Fp Amp Bbp Fp Dmp Bbp Cp Fp',
    mel: ['C5/4 F5/4 A5/4 G5/2 F5/2', 'A5/4 C6/4 A5/8', 'D6/4 C6/2 A5/2 F5/4 D5/4', 'C5/4 F5/4 A5/8',
      'D5/4 F5/4 A5/4 D6/4', 'C6/2 D6/2 C6/4 A5/4 F5/4', 'G5/4 C6/4 E5/4 G5/4', 'F5/12 -/4',
      'A5/2 C6/2 F6/4 D6/4 C6/4', 'A5/4 E5/4 C6/8', 'D6/2 C6/2 A5/2 F5/2 D5/4 F5/4', 'A5/8 C5/8',
      'D5/2 F5/2 A5/4 G5/4 F5/4', 'D5/4 F5/4 D6/8', 'C6/4 A5/4 G5/4 E5/4', 'F5/16']
  },
  // Hiroshima: slow and hopeful, a flute over gentle chords
  hiroshima: {
    bpm: 72, lead: 'flute', arp: [0, 1, 2, 3, 2, 1, 2, 3], drums: 'none', bass: 'walk',
    chords: 'C_ G_ Am Em F C_ Dm G_ C_ G_ Am Em F G_ C_ C_',
    mel: ['E5/4 G5/4 C6/6 D6/2', 'D6/4 B5/4 G5/8', 'C6/4 E6/4 A5/8', 'B5/4 G5/4 E5/8',
      'F5/4 A5/4 C6/6 A5/2', 'G5/4 E5/4 C5/8', 'D5/4 F5/4 A5/4 C6/4', 'B5/12 -/4',
      'E6/4 D6/4 C6/4 G5/4', 'D6/4 B5/4 G5/8', 'C6/4 E6/4 A6/6 G6/2', 'G6/4 E6/4 B5/8',
      'A5/4 C6/4 F6/6 E6/2', 'D6/4 B5/4 G5/8', 'E5/4 G5/4 C6/4 E6/4', 'C6/16']
  },
  // Kamakura: the beach, a lazy bossa shuffle
  kamakura: {
    bpm: 100, lead: 'soft', arp: [0, 2, 1, 3, 0, 2, 1, 2], drums: 'surf', bass: 'walk',
    chords: 'C_ Am F G_ C_ Am Dm G_ F G_ Em Am F G_ C_ C_',
    mel: ['E5/2 G5/2 C6/3 B5/1 A5/4 G5/4', 'A5/2 C6/2 E6/4 D6/4 C6/4', 'F5/2 A5/2 C6/4 A5/2 G5/2 F5/4', 'G5/2 B5/2 D6/4 B5/4 G5/4',
      'C6/2 E6/2 G6/3 E6/1 D6/4 C6/4', 'A5/4 C6/2 E6/2 A5/8', 'D6/2 C6/2 A5/2 F5/2 A5/4 D6/4', 'B5/4 A5/2 G5/2 D5/8',
      'F5/4 A5/4 C6/4 F6/4', 'D6/4 B5/4 G5/8', 'E5/2 G5/2 B5/2 E6/2 D6/4 B5/4', 'C6/4 A5/4 E5/8',
      'F5/2 G5/2 A5/2 C6/2 F6/4 E6/4', 'D6/2 C6/2 B5/2 G5/2 D6/8', 'C6/4 G5/4 E5/4 G5/4', 'C6/12 -/4']
  },
  // Sapporo: a music box in the snow, with sleigh bells
  sapporo: {
    bpm: 84, lead: 'box', arp: [0, 1, 2, 3, 2, 1, 3, 2], drums: 'bells', bass: 'drone',
    chords: 'G_ D_ Em_ Bm_ C_ G_ C_ D_ G_ D_ Em_ Bm_ C_ D_ G_ G_',
    mel: ['D5/4 G5/4 B5/4 A5/4', 'F#5/4 A5/4 D6/8', 'E5/4 G5/4 B5/4 E6/4', 'D6/4 B5/4 F#5/8',
      'E5/2 G5/2 C6/4 B5/4 A5/4', 'B5/4 D6/4 G5/8', 'E6/4 D6/4 C6/4 A5/4', 'A5/12 -/4',
      'B5/2 A5/2 G5/4 D6/4 B5/4', 'A5/4 F#5/4 D5/8', 'G5/4 B5/4 E6/4 D6/4', 'D6/4 B5/4 F#5/8',
      'C6/4 E6/4 G6/4 E6/4', 'D6/4 C6/2 A5/2 F#5/8', 'G5/4 B5/4 D6/4 B5/4', 'G5/16']
  },
  // Bangkok: a ranat (a wooden xylophone) in the five-note scale, over the ching and chap of little cymbals
  bangkok: {
    bpm: 98, lead: 'ranat', arp: [0, 1, 2, 1, 3, 1, 2, 1], drums: 'ching', bass: 'walk',
    chords: 'C_ C_ F C_ G_ G_ C_ C_ F F C_ Am Dm G_ C_ C_',
    mel: ['E5/2 G5/2 A5/2 G5/2 E5/4 D5/4', 'C5/2 D5/2 E5/2 G5/2 A5/8', 'A5/2 C6/2 A5/2 G5/2 F5/4 A5/4', 'G5/4 E5/2 D5/2 C5/8',
      'D5/2 E5/2 G5/2 A5/2 G5/4 D5/4', 'G5/2 A5/2 G5/2 E5/2 D5/8', 'E5/2 G5/2 C6/4 A5/2 G5/2 E5/4', 'G5/12 -/4',
      'A5/2 C6/2 D6/2 C6/2 A5/4 G5/4', 'F5/2 A5/2 C6/4 A5/8', 'C6/2 A5/2 G5/2 E5/2 G5/4 E5/4', 'D5/2 E5/2 C5/4 A4/8',
      'D5/2 F5/2 A5/2 D6/2 C6/4 A5/4', 'G5/2 A5/2 G5/2 D5/2 G5/8', 'E5/2 D5/2 C5/2 D5/2 E5/2 G5/2 A5/4', 'C6/12 -/4']
  },
  // Okinawa: the island scale (C E F G B), a three-stringed sanshin, and the kachashi rhythm everyone dances to
  okinawa: {
    bpm: 116, lead: 'sanshin', arp: [0, 2, 1, 2, 0, 2, 3, 2], drums: 'kachashi', bass: 'octave',
    chords: 'C_ C_ Fp C_ C_ G_ C_ C_ Fp Fp C_ C_ G_ G_ C_ C_',
    mel: ['E5/2 F5/2 G5/2 B5/2 C6/4 B5/2 G5/2', 'G5/4 F5/2 E5/2 C5/8', 'F5/2 G5/2 F5/2 E5/2 C5/4 E5/4', 'G5/6 B5/2 G5/8',
      'C6/2 B5/2 G5/2 F5/2 G5/4 E5/4', 'F5/2 E5/2 C5/2 E5/2 G5/8', 'E5/2 F5/2 G5/4 C6/4 B5/4', 'C6/12 -/4',
      'F5/4 E5/2 F5/2 G5/4 C6/4', 'B5/2 G5/2 F5/2 G5/2 E5/8', 'E5/2 G5/2 C6/2 B5/2 G5/4 E5/4', 'F5/2 G5/2 E5/2 C5/2 C5/8',
      'B4/2 C5/2 E5/2 G5/2 B5/4 G5/4', 'F5/4 G5/4 B5/8', 'C6/2 B5/2 G5/2 E5/2 F5/2 E5/2 C5/4', 'C5/12 -/4']
  }
};
for (const k in TRACKS) { // pre-parse
  const T = TRACKS[k]; T.ch = T.chords.split(' ');
  T.notes = T.mel.map(bar => { let s = 0; const out = []; for (const tok of bar.split(' ')) { const [n, l] = tok.split('/'); if (n !== '-') out.push([s, nf(n), +l]); s += +l; } return out; });
}

const Snd = {
  ctx: null, on: true, track: null, step: 0, next: 0, timer: null,
  // Browsers only start sound from a tap, click or key press. iOS is the strictest: it wants touchend or click, may leave the
  // context 'interrupted' after a call or a trip to the home screen, and mutes web audio when the ring switch is on silent
  // unless the page says it is playing media. So: try on every such gesture, resume from any state but running, play a
  // moment of silence to unlock, and ask for the 'playback' audio session where the browser has one.
  init() {
    if (this.ctx) { if (this.ctx.state !== 'running') { const p = this.ctx.resume(); if (p && p.catch) p.catch(() => { }); this.unlock(); } return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
    const c = this.ctx = new AC(); this.unlock();
    this.master = c.createGain(); this.master.gain.value = this.on ? 0.55 : 0; this.master.connect(c.destination); // sound may have been switched off before it started
    this.mus = c.createGain(); this.mus.gain.value = 0.8; this.mus.connect(this.master);
    this.sfx = c.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
    const d = c.createDelay(1); d.delayTime.value = 0.31; const fb = c.createGain(); fb.gain.value = 0.32;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(this.master);
    this.echo = c.createGain(); this.echo.gain.value = 0.35; this.echo.connect(d);
    const n = c.createBuffer(1, c.sampleRate, c.sampleRate), a = n.getChannelData(0);
    for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; this.noiseBuf = n;
    this.timer = setInterval(() => this.tick(), 30);
  },
  unlock() { try { const c = this.ctx, b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); if (c.state !== 'running') c.resume().catch(() => { }); } catch (e) { } },
  toggle() { this.on = !this.on; if (this.master) this.master.gain.value = this.on ? 0.55 : 0; return this.on; },
  // one enveloped oscillator note
  tone(type, f, t, dur, vol, o = {}) {
    const c = this.ctx; if (!c || !f) return;
    const os = c.createOscillator(), g = c.createGain(); os.type = type; os.frequency.setValueAtTime(f, t);
    if (o.slide) os.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.2; lg.gain.value = f * 0.007; l.connect(lg); lg.connect(os.frequency); l.start(t + 0.12); l.stop(t + dur + 0.3); }
    const at = o.at || 0.008;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + at);
    if (o.pluck) g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    else { g.gain.setValueAtTime(vol, t + Math.max(at, dur - 0.04)); g.gain.linearRampToValueAtTime(0.0001, t + dur + (o.rel || 0.04)); }
    let out = g;
    if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; g.connect(fl); out = fl; }
    os.connect(g); out.connect(o.bus || this.mus); if (o.echo) out.connect(this.echo);
    os.start(t); os.stop(t + dur + (o.rel || 0.04) + 0.05);
  },
  noise(t, dur, vol, hp, lp, bus) {
    const c = this.ctx; if (!c) return;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = (hp + lp) / 2; f.Q.value = 0.7;
    s.connect(f); f.connect(g); g.connect(bus || this.mus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
  play(name) { if (this.track === name) return; this.track = name; this.step = 0; if (this.ctx) this.next = this.ctx.currentTime + 0.15; },
  tick() {
    const c = this.ctx; if (!c || !this.track || c.state !== 'running') return;
    const T = TRACKS[this.track], sl = 60 / T.bpm / 4;
    if (this.next < c.currentTime - 0.5) this.next = c.currentTime + 0.05;
    while (this.next < c.currentTime + 0.12) { this.sched(T, this.step, this.next, sl); this.step = (this.step + 1) % (T.ch.length * 16); this.next += sl; }
  },
  sched(T, step, t, sl) {
    const bar = step >> 4, s = step & 15, ch = CH[T.ch[bar]];
    // melody
    for (const n of T.notes[bar]) if (n[0] === s) {
      const d = n[2] * sl;
      if (T.lead === 'soft') this.tone('square', n[1], t, d * 0.92, 0.075, { lp: 1800, vib: d > 0.5, echo: 1 });
      else if (T.lead === 'flute') { this.tone('sine', n[1], t, d * 0.95, 0.16, { at: 0.07, vib: 1, echo: 1, rel: 0.15 }); this.tone('triangle', n[1] * 2, t, d * 0.9, 0.018, { at: 0.09 }); }
      else if (T.lead === 'bright') { this.tone('square', n[1], t, Math.min(d * 0.8, 0.32), 0.07, { lp: 3200, echo: 1 }); }
      else if (T.lead === 'ranat') { this.tone('triangle', n[1] * 2, t, 0.22, 0.12, { pluck: 1, echo: 1 }); this.tone('sine', n[1] * 8, t, 0.05, 0.03, { pluck: 1 }); if (d > 0.4) this.tone('triangle', n[1] * 2, t + 0.09, 0.18, 0.06, { pluck: 1 }); }
      else if (T.lead === 'sanshin') { this.tone('triangle', n[1], t, Math.min(0.5, d), 0.13, { pluck: 1, echo: 1 }); this.tone('sawtooth', n[1] * 2, t, 0.14, 0.03, { pluck: 1, lp: 3200 }); this.tone('square', n[1] * 0.995, t, 0.05, 0.03, { pluck: 1, lp: 1800 }); }
      else { this.tone('sine', n[1] * 2, t, Math.max(0.9, d), 0.13, { pluck: 1, echo: 1 }); this.tone('sine', n[1] * 4, t, 0.4, 0.03, { pluck: 1 }); }
    }
    // arpeggio / accompaniment (8th notes)
    if (s % 2 === 0) {
      const f = nf(ch[T.arp[s >> 1]]) * (T.pluck ? 1 : 2);
      if (T.pluck) { this.tone('triangle', f, t, 1.1, 0.14, { pluck: 1, echo: 1 }); this.tone('sawtooth', f, t, 0.25, 0.02, { pluck: 1, lp: 2500 }); }
      else if (T.lead === 'box') this.tone('triangle', f / 2, t, 0.9, 0.11, { pluck: 1 });
      else this.tone('triangle', f, t, sl * 1.8, 0.06, { pluck: 1 });
    }
    // bass
    const root = nf(ch[0]) / 2, fifth = root * 1.498;
    if (T.bass === 'walk') { if (s === 0) this.tone('triangle', root, t, sl * 5.5, 0.2); if (s === 6) this.tone('triangle', root, t, sl * 1.6, 0.17); if (s === 8) this.tone('triangle', fifth, t, sl * 3.5, 0.18); if (s === 12) this.tone('triangle', root * 2, t, sl * 3, 0.15); }
    else if (T.bass === 'octave') { if (s % 2 === 0) this.tone('triangle', (s % 4 === 0 ? root : root * 2), t, sl * 1.5, 0.19); }
    else if (s === 0) { this.tone('triangle', root, t, sl * 15, 0.13, { at: 0.05, rel: 0.3 }); this.tone('sine', root * 2, t, sl * 15, 0.05, { at: 0.2, rel: 0.3 }); }
    // drums
    if (T.drums === 'chill') {
      if (s === 0 || s === 10) this.tone('sine', 120, t, 0.16, 0.3, { slide: 40, pluck: 1 });
      if (s === 4 || s === 12) this.noise(t, 0.09, 0.07, 1500, 4000);
      if (s % 2 === 0) this.noise(t, 0.03, s % 4 === 2 ? 0.035 : 0.02, 6000, 10000);
    } else if (T.drums === 'bounce') {
      if (s % 4 === 0) this.tone('sine', 130, t, 0.14, 0.3, { slide: 45, pluck: 1 });
      if (s === 4 || s === 12) this.noise(t, 0.1, 0.08, 1200, 3500);
      if (s % 4 === 2) this.noise(t, 0.04, 0.04, 6000, 10000);
    } else if (T.drums === 'kachashi') { // a skipping beat, the castanet clack of the sanba and a drum on the off-beat
      if (s % 4 === 0) this.tone('sine', 110, t, 0.14, 0.26, { slide: 45, pluck: 1 }); if (s === 6 || s === 14) this.tone('sine', 180, t, 0.12, 0.16, { slide: 80, pluck: 1 });
      if (s % 4 === 3 || s === 10) this.tone('square', 2100, t, 0.025, 0.018, { pluck: 1, lp: 4000 }); if (s % 2 === 0) this.noise(t, 0.03, 0.022, 5000, 9000);
    } else if (T.drums === 'ching') { if (s % 4 === 0) { this.tone('triangle', 3150, t, 0.4, 0.016, { pluck: 1 }); this.noise(t, 0.25, 0.02, 6000, 11000); } if (s % 4 === 2) this.noise(t, 0.05, 0.03, 3000, 7000); if (s === 0 || s === 10) this.tone('sine', 140, t, 0.2, 0.18, { slide: 60, pluck: 1 }); if (s === 6) this.tone('sine', 220, t, 0.12, 0.1, { slide: 120, pluck: 1 });
    } else if (T.drums === 'surf') { if (s === 0 || s === 6 || s === 10) this.tone('sine', 115, t, 0.14, 0.24, { slide: 45, pluck: 1 }); if (s === 4 || s === 12) this.noise(t, 0.05, 0.05, 1600, 4000); this.noise(t, 0.025, s % 2 ? 0.012 : 0.02, 5000, 10000);
    } else if (T.drums === 'bells') { if (s === 0) this.tone('sine', 100, t, 0.3, 0.12, { slide: 50, pluck: 1 }); if (s % 2 === 0) { this.noise(t, 0.06, s % 4 === 0 ? 0.03 : 0.018, 6000, 11000); this.tone('sine', 3520 + (s % 8) * 40, t, 0.08, 0.008, { pluck: 1 }); }
    } else if (T.drums === 'taiko') {
      if (s === 0 && bar % 2 === 0) this.tone('sine', 90, t, 0.5, 0.22, { slide: 45, pluck: 1 });
      if (s === 0 && bar % 4 === 3) this.tone('sine', 1760, t, 1.6, 0.03, { pluck: 1, echo: 1 });
    }
  },
  fx(name) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + 0.01, B = { bus: this.sfx };
    const seq = (ns, gap, len, vol, type = 'square', extra = {}) => ns.forEach((n, i) => this.tone(type, nf(n), t + i * gap, len, vol, Object.assign({ pluck: 1, bus: this.sfx, lp: 3000 }, extra)));
    switch (name) {
      case 'jump': this.tone('square', 320, t, 0.11, 0.06, { slide: 620, bus: this.sfx, lp: 2500, pluck: 1 }); break;
      case 'land': this.noise(t, 0.05, 0.05, 200, 900, this.sfx); break;
      case 'pick': seq(['E6', 'B6'], 0.06, 0.18, 0.08, 'triangle', { echo: 1 }); break;
      case 'ui': this.tone('square', 660, t, 0.05, 0.05, B); break;
      case 'talk': this.tone('square', 520 + Math.random() * 120, t, 0.03, 0.03, B); break;
      case 'stamp': this.tone('sine', 150, t, 0.14, 0.4, { slide: 60, pluck: 1, bus: this.sfx }); this.noise(t, 0.07, 0.12, 300, 1500, this.sfx); seq(['C6', 'E6', 'G6', 'C7'], 0.07, 0.3, 0.07, 'triangle', { echo: 1 }); break;
      case 'shutter': this.noise(t, 0.03, 0.2, 2000, 7000, this.sfx); this.noise(t + 0.09, 0.05, 0.16, 1500, 5000, this.sfx); break;
      case 'coin': seq(['B6', 'E7'], 0.07, 0.25, 0.06, 'square'); break;
      case 'bell': for (const [m, v] of [[1, 0.2], [2.4, 0.08], [3.9, 0.05], [5.3, 0.03]]) this.tone('sine', 330 * m, t, 2.2, v, { pluck: 1, bus: this.sfx, echo: 1 }); break;
      case 'clap': this.noise(t, 0.06, 0.25, 900, 3000, this.sfx); this.noise(t + 0.012, 0.05, 0.15, 900, 3000, this.sfx); break;
      case 'slurp': this.tone('sawtooth', 240, t, 0.2, 0.05, { slide: 700, bus: this.sfx, lp: 1400 }); this.noise(t, 0.2, 0.05, 1500, 4000, this.sfx); break;
      case 'munch': this.noise(t, 0.05, 0.12, 500, 1800, this.sfx); this.noise(t + 0.13, 0.05, 0.1, 500, 1800, this.sfx); break;
      case 'yay': seq(['G5', 'C6', 'E6', 'G6'], 0.08, 0.28, 0.07, 'square', { echo: 1 }); break;
      case 'heart': seq(['A5', 'D6', 'F#6'], 0.09, 0.3, 0.08, 'triangle', { echo: 1 }); break;
      case 'wind': this.noise(t, 1.8, 0.07, 400, 1800, this.sfx); seq(['A6', 'E7', 'D7'], 0.35, 1.2, 0.035, 'sine', { echo: 1 }); break;
      case 'train': seq(['C5', 'E5', 'G5', 'C6', 'G5', 'C6', 'E6'], 0.16, 0.5, 0.09, 'triangle', { echo: 1 }); this.noise(t, 2.5, 0.05, 200, 900, this.sfx); break;
      case 'page': this.noise(t, 0.12, 0.08, 1500, 6000, this.sfx); break;
      case 'chime': seq(['E6', 'C6', 'G5', 'C6'], 0.32, 1.1, 0.05, 'sine', { echo: 1 }); break; // the station's ding-dong
      case 'clink': this.tone('triangle', 2350 + Math.random() * 300, t, 0.07, 0.05, { pluck: 1, bus: this.sfx }); this.tone('sine', 3900, t + 0.02, 0.05, 0.02, { pluck: 1, bus: this.sfx }); break;
      case 'gacon': this.tone('sine', 150, t, 0.22, 0.4, { slide: 55, pluck: 1, bus: this.sfx }); this.noise(t, 0.09, 0.2, 150, 900, this.sfx); this.noise(t + 0.05, 0.16, 0.05, 2500, 6000, this.sfx); break;
      case 'beep': this.tone('square', 1320, t, 0.025, 0.018, B); break;
      case 'atari': seq(['C6', 'E6', 'G6', 'C7', 'G6', 'C7', 'E7', 'G7'], 0.07, 0.22, 0.07, 'square', { echo: 1 }); break;
    }
  }
};
