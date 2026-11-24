import {writeFile} from 'node:fs/promises';
// "Throne of Latveria" — an original Doom theme composed for this invitation.
// D minor march at 80 BPM, 16 bars, loops seamlessly. Formant choir, low brass motif,
// driving string ostinato, war drums and anvil strikes. Mid-range is deliberately strong so
// the theme stays audible on phone speakers. No samples and no existing melodies are used.
const sampleRate = 24000, bpm = 80, bars = 16, beat = 60 / bpm, bar = beat * 4;
const duration = bars * bar, count = Math.round(sampleRate * duration);
const midi = n => 440 * 2 ** ((n - 69) / 12);
const TAU = Math.PI * 2;
const dry = new Float32Array(count);
const wrap = t => ((t % duration) + duration) % duration;
// Section intensity per bar: intro, build, full march, climax, settle back into the loop.
const intensity = [.35, .4, .5, .6, .75, .8, .85, .9, 1, 1, 1, 1, 1, 1, .8, .55];
const level = t => { const b = t / bar, i = Math.floor(b) % bars, f = b - Math.floor(b); return intensity[i] * (1 - f) + intensity[(i + 1) % bars] * f; };
// i – VI – iv – V in D minor, one chord per bar.
const chords = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]];
const formants = [[700, 110, 1], [1220, 120, .5], [2600, 170, .25]];
const formant = f => formants.reduce((s, [c, w, g]) => s + g * Math.exp(-(((f - c) / w) ** 2)), 0) + .04;
function add(start, length, fn) {
 const first = Math.floor(start * sampleRate), total = Math.ceil(length * sampleRate);
 for (let k = 0; k < total; k++) { const i = (first + k) % count; dry[(i + count) % count] += fn(k / sampleRate, wrap((first + k) / sampleRate)); }
}
// Choir pad: harmonics shaped by "ah" vowel formants, with crossfades between chords.
for (let b = 0; b < bars; b++) {
 const chord = chords[b % 4];
 add(b * bar - .6, bar + 1.2, (age, t) => {
  const env = Math.sin(Math.min(1, age / 1.2) * Math.PI / 2) ** 2 * Math.sin(Math.min(1, (bar + 1.2 - age) / 1.2) * Math.PI / 2) ** 2;
  let s = 0;
  for (const [v, pitch] of chord.entries()) {
   const f = midi(pitch + 12) * (1 + .004 * Math.sin(TAU * (4.6 + v * .3) * t + v));
   for (let h = 1; h <= 10; h++) s += Math.sin(TAU * f * h * age + v * h) * formant(f * h) / h ** .6;
  }
  return s * env * .022 * (.6 + .4 * level(t));
 });
}
// Low brass motif (original): an eight-bar phrase, entering at bar 5 and repeating at bar 9.
const motif = [[62, 0, 1.5], [57, 1.5, .5], [58, 2, 2], [57, 4, 1], [65, 5, 1], [64, 6, 1], [62, 7, 1], [60, 8, 1.5], [58, 9.5, .5], [57, 10, 2], [62, 12, 1], [57, 13, 1], [58, 14, 1], [61, 15, 1], [62, 16, 4], [69, 20, 1.5], [67, 21.5, .5], [65, 22, 2], [64, 24, 2], [62, 26, 1], [61, 27, 1], [62, 28, 4]];
for (const start of [4, 8]) for (const [pitch, at, len] of motif) {
 const t0 = start * bar + at * beat, length = len * beat;
 for (const octave of [-12, 0]) add(t0, length + .5, (age, t) => {
  const env = Math.min(1, age / .09) * (age < length ? 1 : Math.exp(-(age - length) / .12));
  const bright = .45 + .55 * Math.min(1, age / .25), f = midi(pitch + octave) * (1 + .003 * Math.sin(TAU * 5.2 * age));
  let s = 0; for (let h = 1; h <= 14; h++) s += Math.sin(TAU * f * h * age) * bright ** (h - 1) / h;
  return s * env * (octave ? .085 : .06) * level(t);
 });
}
// String ostinato: staccato eighths following the chord root, from bar 3.
const pattern = [0, 0, 12, 0, 3, 0, 12, 7];
for (let b = 2; b < bars; b++) for (let e = 0; e < 8; e++) {
 const pitch = chords[b % 4][0] + 12 + pattern[e], f = midi(pitch);
 add(b * bar + e * beat / 2, .32, (age, t) => {
  const env = Math.min(1, age / .008) * Math.exp(-age / .08);
  let s = 0; for (let h = 1; h <= 9; h++) s += Math.sin(TAU * f * h * age) / h;
  return s * env * (e % 2 ? .045 : .06) * level(t);
 });
}
// War drums: pitched sine body plus a mid-band skin slap that phone speakers reproduce.
let seed = 7; const noise = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 31) - 1;
const drums = [[0, 1], [1.5, .6], [2, .85], [3, .7], [3.5, .55]];
for (let b = 0; b < bars; b++) for (const [at, gain] of drums) {
 if (b < 2 && at !== 0) continue;
 let low = 0, prev = 0;
 add(b * bar + at * beat, .9, (age, t) => {
  const body = Math.sin(TAU * (55 * age + 70 * .06 * (1 - Math.exp(-age / .06)))) * Math.exp(-age / .28);
  const n = noise(); low += .25 * (n - low); const band = (low - prev) * 2; prev = low;
  return (body * .55 + band * Math.min(1, age / .004) * Math.exp(-age / .045) * .4) * Math.min(1, age / .003) * gain * level(t);
 });
}
// Anvil strikes on the climax downbeats: inharmonic metallic partials.
for (const b of [8, 10, 12, 13]) add(b * bar, 2.5, age => [1, 2.76, 5.4, 8.93].reduce((s, r, i) => s + Math.sin(TAU * 587.3 * r * age) * Math.exp(-age / (.9 / (i + 1))) / (i + 1), 0) * Math.min(1, age / .003) * .07);
// Sustained low drone keeps the loop seamless.
for (let i = 0; i < count; i++) { const t = i / sampleRate; dry[i] += (Math.sin(TAU * midi(38) * t) + .3 * Math.sin(TAU * midi(50) * t)) * .05; }
// Hall reverb: run combs over two passes so the tail wraps cleanly across the loop point.
const combs = [1557, 1617, 1491, 1422].map(d => ({buffer: new Float32Array(Math.round(d * sampleRate / 44100)), index: 0}));
const out = new Float32Array(count);
for (let pass = 0; pass < 2; pass++) for (let i = 0; i < count; i++) {
 let wet = 0; for (const c of combs) { const y = c.buffer[c.index]; c.buffer[c.index] = dry[i] + y * .8; c.index = (c.index + 1) % c.buffer.length; wet += y; }
 if (pass) out[i] = dry[i] + wet * .09;
}
// Gentle tanh limiter, then normalise.
let peak = 0; for (let i = 0; i < count; i++) { out[i] = Math.tanh(out[i] * 1.6); peak = Math.max(peak, Math.abs(out[i])); }
const target = .89, wav = Buffer.alloc(44 + count * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
let squares = 0;
for (let i = 0; i < count; i++) { const v = out[i] * target / peak; squares += v * v; wav.writeInt16LE(Math.round(v * 32767), 44 + i * 2); }
await writeFile(new URL('../dist/assets/doom-theme.wav', import.meta.url), wav);
console.log(JSON.stringify({duration, sampleRate, channels: 1, peak: target, rms: Math.sqrt(squares / count), bytes: wav.length}));
