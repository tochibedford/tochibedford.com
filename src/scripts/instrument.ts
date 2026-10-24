import { entries, HOME_TITLE, PAGE_WORDS, pageTitle, type Entry } from "../data/work";

/* ------------------------------------------------------------------ *
 * Key map. Three letter rows, three instruments, all F minor pentatonic.
 * The number row is drums, from the conz.xo trapties kit (808 tuned to F).
 * ------------------------------------------------------------------ */
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"] as const;
const ROW_SOURCE = ["keys", "pluck", "bass"] as const;
const DIGITS = "1234567890";
const DRUM_ROW = 3;
const PAD_CHORDS = [
  // root = semitones from F, so the 808 (tuned to F) can follow the chord
  { id: "fm9", name: "Fm9", root: 0 },
  { id: "dbmaj7", name: "D♭maj7", root: -4 },
  { id: "abmaj9", name: "A♭maj9", root: 3 },
  { id: "eb69", name: "E♭6/9", root: -2 },
];
// Final mix, set by ear on the temporary mixer and sound lab (11 Oct 2026).
const MIX = { keys: 0.17, pluck: 0.08, bass: 0.62, swell: 0.24, swell2: 0.5, drums: 0.32 };
const PAD_LEVEL = 0.25; // set by ear on the old Ambience slider
const FETCH_AT_ONCE = 6;
// Per-drum trims for keys 1-0. 1 = kick (Grime God "Drum Stall"), 2 = 808 (Deviants "Spinz", tuned to F1).
const DRUM_GAIN: Record<string, number> = { "1": 0.38, "2": 0.61, "3": 0.68, "4": 0.53, "5": 0.53, "6": 0.72, "7": 0.39, "8": 0.66, "9": 0.65, "0": 0.43 };

/* High notes on the keys and pluck get harsh, so tone follows pitch: further right on the
 * row, the low-pass closes and the level dips. Curves bend so most of the change happens
 * on the last few keys. */
const TONE = {
  keys: { from: 18000, to: 4200, dipDb: 14 },
  pluck: { from: 14000, to: 3600, dipDb: 11 },
};
function toneFor(row: number, col: number) {
  const src = ROW_SOURCE[row];
  if (src !== "keys" && src !== "pluck") return null;
  const t = col / (ROWS[row].length - 1);
  const c = TONE[src];
  return { cutoff: c.from * Math.pow(c.to / c.from, Math.pow(t, 1.4)), gain: Math.pow(10, (-c.dipDb * Math.pow(t, 1.6)) / 20) };
}

type Hit = { row: number; col: number; sample: string; level: number };
function lookup(ch: string): Hit | null {
  const d = DIGITS.indexOf(ch);
  if (d > -1)
    return { row: DRUM_ROW, col: d, sample: ch === "1" ? "kick" : `drum-${ch}`, level: MIX.drums * DRUM_GAIN[ch] };
  for (let r = 0; r < 3; r++) {
    const c = ROWS[r].indexOf(ch);
    if (c > -1) return { row: r, col: c, sample: `${ROW_SOURCE[r]}-${ch}`, level: MIX[ROW_SOURCE[r]] };
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Settings, kept per browser. Storage can be missing or throw.
 * ------------------------------------------------------------------ */
type Settings = { on: boolean; amb: boolean };
const STORE = "tb-sound-v3";
function readSettings(): Settings {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || "null");
    if (s && typeof s.on === "boolean" && typeof s.amb === "boolean") return s;
  } catch {}
  return { on: true, amb: true };
}
function saveSettings(s: Settings) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {}
}

/* ------------------------------------------------------------------ *
 * Audio engine
 * ------------------------------------------------------------------ */
class Engine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  fx!: GainNode;
  padBus!: GainNode;
  buffers = new Map<string, AudioBuffer>();
  raw = new Map<string, Promise<ArrayBuffer>>();
  started = false;
  chord = 0;
  padVoices: { src: AudioBufferSourceNode; gain: GainNode }[] = [];
  padTimer: number | undefined;
  lastByKey = new Map<string, { src: AudioBufferSourceNode; gain: GainNode }>();
  /** The last note asked for while audio was still locked, so the first tap isn't silent. */
  pending: { args: Parameters<Engine["hit"]>; at: number } | null = null;
  /** Called once, the first time audio is actually running. */
  onLive: (() => void) | null = null;
  live = false;
  settings = readSettings();

  constructor() {
    // Start downloading right away so the first keypress has something to play. Playable notes
    // come first, smallest first; the pad and swells aren't needed until a moment after the first tap.
    const names = [
      ...[...DIGITS].filter((d) => d !== "1").map((d) => `drum-${d}`),
      "kick",
      ...[...ROWS[2]].map((ch) => `bass-${ch}`),
      ...[...ROWS[0]].map((ch) => `keys-${ch}`),
      ...[...ROWS[1]].map((ch) => `pluck-${ch}`),
      `pad-${PAD_CHORDS[0].id}`,
      // the first chord change goes to PAD_CHORDS[1], so its swells are next
      ...PAD_CHORDS.slice(1).flatMap((c) => [`swell-${c.id}`, `swell2-${c.id}`, `pad-${c.id}`]),
      `swell-${PAD_CHORDS[0].id}`,
      `swell2-${PAD_CHORDS[0].id}`,
    ];
    // A few downloads at a time, in that order. Fired all at once, every file shares the
    // connection and they all land near the end, so the first tap waits on the whole set.
    const queue = names.map((n) => {
      let go!: () => void;
      const turn = new Promise<void>((r) => (go = r));
      this.raw.set(
        n,
        turn.then(() =>
          fetch(`/sounds/${n}.mp3`).then((r) => {
            if (!r.ok) throw new Error(`${n}: ${r.status}`);
            return r.arrayBuffer();
          })
        )
      );
      return go;
    });
    const next = () => queue.shift()?.();
    for (const p of this.raw.values()) p.then(next, next);
    for (let i = 0; i < FETCH_AT_ONCE; i++) next();
  }

  /**
   * iPhones only let audio start from the end of a touch (touchend / click), never from the
   * moment a finger lands. So this runs on every finger lift and key press until audio is live,
   * and plays one silent sample, which is what actually wakes Safari's audio up.
   */
  unlock() {
    this.ensure();
    const ctx = this.ctx;
    if (!ctx || ctx.state === "running") return;
    try {
      const s = ctx.createBufferSource();
      s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      s.connect(ctx.destination);
      s.start(0);
    } catch {}
    this.start();
  }

  /** Must run inside a user gesture. */
  async start() {
    // iPhones mute web audio when the ringer switch is on silent unless the page says it plays media
    try {
      const as = (navigator as any).audioSession;
      if (as && as.type !== "playback") as.type = "playback";
    } catch {}
    this.ensure();
    if (!this.ctx) return;
    if (this.ctx.state !== "running") await this.ctx.resume().catch(() => {});
    if (this.ctx.state !== "running") return;
    this.playPending();
    if (!this.live) {
      this.live = true;
      this.onLive?.();
    }
    if (!this.started) {
      this.started = true;
      this.padLoop(true);
    }
  }

  /** Creates the (suspended) context and decodes everything. Safe before any gesture. */
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.fx = this.ctx.createGain();
      this.padBus = this.ctx.createGain();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -10;
      comp.ratio.value = 3;
      this.fx.connect(this.master);
      this.padBus.connect(this.master);
      this.master.connect(comp).connect(this.ctx.destination);
      this.applySettings();
      // decode in the background; failures just mean that key stays silent
      for (const [name, p] of this.raw) {
        p.then((ab) => this.ctx!.decodeAudioData(ab))
          .then((buf) => {
            this.buffers.set(name, buf);
            if (name === `pad-${PAD_CHORDS[this.chord].id}` && this.started && !this.padVoices.length) this.padLoop(true);
            if (this.pending?.args[0] === name) this.playPending();
          })
          .catch(() => {});
      }
    }
  }

  /** Plays the note held back by hit(), once audio is running and its sample is in, if it was
   * asked for a moment ago (a tap, not a long drag). */
  playPending() {
    const p = this.pending;
    if (!p || this.ctx?.state !== "running" || !this.buffers.has(p.args[0])) return;
    this.pending = null;
    if (performance.now() - p.at < 600) this.hit(...p.args);
  }

  applySettings() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.settings.on ? 1 : 0, t, 0.08);
    this.padBus.gain.setTargetAtTime(this.settings.amb ? PAD_LEVEL : 0, t, 0.25);
  }

  set(s: Partial<Settings>) {
    this.settings = { ...this.settings, ...s };
    saveSettings(this.settings);
    this.applySettings();
  }

  hit(sample: string, key: string, level: number, tone: { cutoff: number; gain: number } | null = null, rate = 1) {
    const ctx = this.ctx;
    const buf = this.buffers.get(sample);
    if (!ctx) return;
    // while audio is still locked or the note is still downloading, notes would pile up and all
    // fire at once later; keep only the latest
    if (!buf || ctx.state !== "running") {
      this.pending = { args: [sample, key, level, tone, rate], at: performance.now() };
      return;
    }
    const t = ctx.currentTime;
    // retriggering the same key: duck the previous note quickly so tails don't pile up
    const prev = this.lastByKey.get(key);
    if (prev) {
      prev.gain.gain.cancelScheduledValues(t);
      prev.gain.gain.setTargetAtTime(0, t, 0.03);
      prev.src.stop(t + 0.2);
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    src.playbackRate.value = rate;
    gain.gain.value = level * (tone ? tone.gain : 1);
    if (tone) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = tone.cutoff;
      lp.Q.value = 0.5; // gentle shoulder, no resonant bump
      src.connect(lp).connect(gain);
    } else src.connect(gain);
    gain.connect(this.fx);
    src.start(t);
    const v = { src, gain };
    this.lastByKey.set(key, v);
    src.onended = () => {
      if (this.lastByKey.get(key) === v) this.lastByKey.delete(key);
    };
  }

  /* The pad: each chord clip is ~8 s of sustain plus release. We start a fresh copy every
   * 6.5 s and crossfade, which loops smoothly regardless of MP3 encoder padding. */
  padLoop(first = false) {
    const ctx = this.ctx;
    window.clearTimeout(this.padTimer);
    if (!ctx) return;
    const buf = this.buffers.get(`pad-${PAD_CHORDS[this.chord].id}`);
    if (!buf) return; // decode callback restarts us
    const t = ctx.currentTime + 0.02;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    const fadeIn = first ? 3 : 2.2;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(1, t + fadeIn);
    gain.gain.setValueAtTime(1, t + 6.6);
    gain.gain.linearRampToValueAtTime(0, Math.min(buf.duration, 9.4) + t);
    src.connect(gain).connect(this.padBus);
    src.start(t);
    const v = { src, gain };
    this.padVoices.push(v);
    src.onended = () => (this.padVoices = this.padVoices.filter((x) => x !== v));
    this.padTimer = window.setTimeout(() => this.padLoop(), 6500);
  }

  /** Move the pad to the next chord and play the matching swell. Returns the new chord name. */
  advance(): string {
    this.chord = (this.chord + 1) % PAD_CHORDS.length;
    const ctx = this.ctx;
    if (ctx) {
      const t = ctx.currentTime;
      for (const v of this.padVoices) {
        v.gain.gain.cancelScheduledValues(t);
        v.gain.gain.setValueAtTime(v.gain.gain.value, t);
        v.gain.gain.linearRampToValueAtTime(0, t + 2.5);
        v.src.stop(t + 2.6);
      }
      this.padVoices = [];
      this.hit(`swell-${PAD_CHORDS[this.chord].id}`, "swell", MIX.swell);
      this.hit(`swell2-${PAD_CHORDS[this.chord].id}`, "swell2", MIX.swell2);
      if (this.started) this.padLoop();
    }
    return PAD_CHORDS[this.chord].name;
  }

  /** Playback rate that puts the F-tuned 808 on the current chord's root. */
  rootRate() {
    return Math.pow(2, PAD_CHORDS[this.chord].root / 12);
  }

  setHidden(hidden: boolean) {
    if (!this.ctx || !this.started) return;
    if (hidden) this.ctx.suspend().catch(() => {});
    else this.ctx.resume().catch(() => {});
  }
}

/* ------------------------------------------------------------------ *
 * Visuals
 * ------------------------------------------------------------------ */
type Thing =
  | { kind: "letter"; ch: string; x: number; y: number; color: string; life: number; s: number }
  | { kind: "ring"; x: number; y: number; color: string; life: number; r: number }
  | { kind: "dots"; x: number; y: number; color: string; life: number; a: number }
  | { kind: "bar"; y: number; color: string; life: number; dir: number }
  | { kind: "col"; x: number; w: number; color: string; life: number }
  | { kind: "comic"; style: ComicStyle; x: number; y: number; r: number; rot: number; seed: number[]; fill: string; fill2?: string; life: number; decay: number }
  | { kind: "focus"; x: number; y: number; seed: number[]; life: number }
  | { kind: "flash"; life: number };

/* Comic-book hit shapes for the drums, after the POW/BAM/ZAP panels: thick navy ink,
 * offset shadow, halftone dots. Each drum has its own shape. */
type ComicStyle = "pow" | "bam" | "zap" | "clap" | "spark" | "bolt" | "ticks" | "puff";
const COMIC_ALPHA = 0.38; // how present the comic layer is
const rand = (n: number) => Array.from({ length: n }, () => Math.random());
const easeOutBack = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);

function css(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

class Stage {
  cv: HTMLCanvasElement;
  cx: CanvasRenderingContext2D;
  W = 0;
  H = 0;
  dpr = 1;
  things: Thing[] = [];
  running = false;
  reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  C = { ground: "", chalk: "", blush: "", deep: "", yellow: "", red: "" };
  dots: CanvasPattern | null = null;
  // comics are drawn opaque on their own layer, then faded as one image
  layer = document.createElement("canvas");
  lcx = this.layer.getContext("2d")!;
  // On touch screens a drag fires many notes at once, so every effect is drawn smaller there.
  fx = matchMedia("(hover: none)").matches ? 0.5 : 1;
  /** Where a key's effect should start, in CSS px (the pad you touched), if anywhere. */
  anchor: ((ch: string) => { x: number; y: number } | null) | null = null;

  constructor(cv: HTMLCanvasElement) {
    this.cv = cv;
    this.cx = cv.getContext("2d")!;
    this.C = { ground: css("--ground"), chalk: css("--chalk"), blush: css("--blush"), deep: css("--deep"), yellow: css("--pow-yellow"), red: css("--pow-red") };
    // The blue comes from CSS, and the canvas only holds pixels while something is animating.
    // iOS Safari throws away canvas memory when it's under pressure (lots of decoded audio here),
    // and a canvas it has dropped shows up black. Releasing it while idle, and rebuilding it
    // whenever the page comes back, means there's nothing for it to drop.
    this.measure();
    addEventListener("resize", () => (this.running ? this.size() : this.measure()));
    const revive = () => {
      if (document.hidden) return;
      this.release();
      if (this.things.length) this.size();
    };
    document.addEventListener("visibilitychange", revive);
    addEventListener("pageshow", revive);
    cv.addEventListener("contextrestored", revive);
  }
  /** Screen size in canvas pixels, kept current even while the canvas is released. */
  measure() {
    this.dpr = Math.min(2, devicePixelRatio || 1);
    this.W = Math.round(innerWidth * this.dpr);
    this.H = Math.round(innerHeight * this.dpr);
  }
  size() {
    this.measure();
    this.cv.width = this.W;
    this.cv.height = this.H;
    this.layer.width = this.W;
    this.layer.height = this.H;
    // halftone dot tile, sized to the screen's pixel density
    const t = document.createElement("canvas");
    const n = Math.round(9 * this.dpr);
    t.width = t.height = n;
    const tc = t.getContext("2d")!;
    tc.fillStyle = this.C.deep;
    tc.beginPath();
    tc.arc(n / 2, n / 2, n * 0.2, 0, Math.PI * 2);
    tc.fill();
    this.dots = this.lcx.createPattern(t, "repeat");
  }
  /** Frees both canvases' memory. The CSS background shows through. */
  release() {
    this.cv.width = this.cv.height = 0;
    this.layer.width = this.layer.height = 0;
  }
  clear() {
    this.cx.clearRect(0, 0, this.W, this.H);
  }
  kick() {
    if (!this.running) {
      this.running = true;
      this.size();
      requestAnimationFrame(() => this.draw());
    }
  }
  spawn(ch: string, row: number, col: number) {
    const { W, H, C, fx, dpr } = this;
    const at = this.anchor?.(ch);
    const size = Math.min(H * 0.34, W * 0.3) * fx;
    if (row === DRUM_ROW) {
      // drums: a thin column at the key's position, plus that drum's comic hit
      const x = at ? at.x * dpr : W * (0.06 + 0.88 * ((col + 0.5) / 10));
      this.things.push({ kind: "col", x, w: W * (col === 0 ? 0.04 : 0.016) * (fx < 1 ? 0.7 : 1), color: col % 2 ? C.blush : C.chalk, life: 1 });
      // the digit itself, big like the letters, above the comic hit
      const dy = at ? at.y * dpr : H * (0.42 + (Math.random() - 0.5) * 0.12);
      this.things.push({ kind: "letter", ch, x, y: dy, color: C.chalk, life: 1, s: size });
      this.drum(ch, x, at ? dy : undefined);
      return;
    }
    const cols = ROWS[row].length;
    const x = at ? at.x * dpr : W * (0.12 + 0.76 * ((col + 0.5) / cols));
    const y = at ? at.y * dpr : H * (0.3 + row * 0.19) + (Math.random() - 0.5) * H * 0.06;
    const color = [C.chalk, C.blush, C.deep][row];
    this.things.push({ kind: "letter", ch, x, y, color, life: 1, s: size });
    if (row === 0) this.things.push({ kind: "ring", x, y, color: C.chalk, life: 1, r: H * 0.05 * fx });
    if (row === 1) this.things.push({ kind: "dots", x, y, color: C.blush, life: 1, a: Math.random() * Math.PI });
    if (row === 2) this.things.push({ kind: "bar", y, color: C.deep, life: 1, dir: col % 2 ? 1 : -1 });
    if (this.things.length > 60) this.things.splice(0, this.things.length - 60);
    this.kick();
  }
  /** A soft ring spreading from a point given in CSS px (the "sound on" tap). */
  ripple(x: number, y: number) {
    const { dpr, H, C } = this;
    this.things.push({ kind: "ring", x: x * dpr, y: y * dpr, color: C.chalk, life: 1, r: H * 0.01 });
    this.things.push({ kind: "ring", x: x * dpr, y: y * dpr, color: C.blush, life: 1, r: H * 0.04 });
    this.kick();
  }
  /** One comic hit for a drum key. x is that key's column. */
  drum(d: string, x: number, near?: number) {
    const { W, H, C } = this;
    const m = Math.min(W, H) * (this.fx < 1 ? 0.6 : 1);
    const y = near ?? H * (0.3 + Math.random() * 0.4);
    const jx = x + (Math.random() - 0.5) * W * 0.06;
    const rot = (Math.random() - 0.5) * 0.5;
    // keep every burst fully on screen, even for the keys at either end of the row
    const fit = (v: number, r: number, max: number) => Math.min(max - r * 1.15, Math.max(r * 1.15, v));
    const add = (style: ComicStyle, r: number, fill: string, fill2?: string, decay = 0.03, dx = 0, dy = 0) =>
      this.things.push({ kind: "comic", style, x: fit(jx + dx, r, W), y: fit(y + dy, r, H), r, rot, seed: rand(32), fill, fill2, life: 1, decay });
    switch (d) {
      case "1": add("pow", m * 0.24, C.yellow, C.red, 0.026); break; // kick
      case "2": add("bam", m * 0.2, C.blush, undefined, 0.024); this.things.push({ kind: "ring", x: jx, y, color: C.chalk, life: 1, r: m * 0.16 }); break; // 808
      case "3": add("zap", m * 0.2, C.red, C.yellow); break; // snare
      case "4": add("clap", m * 0.11, C.chalk, undefined, 0.032, -m * 0.085, 0); add("clap", m * 0.11, C.yellow, undefined, 0.032, m * 0.085, -m * 0.045); break; // clap
      case "5": add("spark", m * 0.075, C.chalk, undefined, 0.045); break; // hat
      case "6": add("spark", m * 0.07, C.yellow, undefined, 0.045); break; // hat 2
      case "7": add("bolt", m * 0.16, C.yellow, undefined, 0.03); break; // open hat
      case "8": add("ticks", m * 0.11, C.chalk, undefined, 0.05); break; // rim
      case "9": add("puff", m * 0.13, C.yellow, undefined, 0.032); break; // tom
      case "0": // crash
        this.things.push({ kind: "focus", x: jx, y, seed: rand(64), life: 1 });
        add("pow", m * 0.28, C.red, C.yellow, 0.02);
        break;
    }
    if (this.things.length > 80) this.things.splice(0, this.things.length - 80);
    this.kick();
  }
  /** The unlock hit: speed lines and a big burst in the middle. */
  bam() {
    const { W, H, C } = this;
    const m = Math.min(W, H);
    const x = W * (0.3 + Math.random() * 0.15);
    const y = H * (0.45 + (Math.random() - 0.5) * 0.1);
    this.things.push({ kind: "focus", x, y, seed: rand(64), life: 1 });
    this.things.push({ kind: "comic", style: "pow", x, y, r: m * 0.3, rot: (Math.random() - 0.5) * 0.3, seed: rand(32), fill: C.yellow, fill2: C.red, life: 1, decay: 0.016 });
    this.kick();
  }
  private shapePath(style: ComicStyle, r: number, seed: number[]) {
    const cx = this.cx;
    cx.beginPath();
    const star = (n: number, inner: number, jag: number) => {
      for (let i = 0; i < n * 2; i++) {
        const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 === 0 ? r * (1 - jag / 2 + jag * seed[i % 32]) : r * inner * (0.85 + 0.3 * seed[(i + 7) % 32]);
        i ? cx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : cx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      cx.closePath();
    };
    const cloud = (lobes: number, spread: number, size: number) => {
      for (let i = 0; i < lobes; i++) {
        const a = (i / lobes) * Math.PI * 2;
        const lx = Math.cos(a) * r * spread, ly = Math.sin(a) * r * spread * 0.82;
        cx.moveTo(lx + r * size, ly);
        cx.arc(lx, ly, r * size * (0.85 + 0.3 * seed[i]), 0, Math.PI * 2);
      }
      cx.moveTo(r * 0.75, 0);
      cx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    };
    switch (style) {
      case "pow": star(13, 0.58, 0.45); break;
      case "zap": star(9, 0.3, 0.55); break;
      case "clap": star(10, 0.5, 0.35); break;
      case "spark": star(4, 0.22, 0.1); break;
      case "bam": cloud(9, 0.72, 0.42); break;
      case "puff": cloud(7, 0.62, 0.45); break;
      case "bolt": {
        const P = [[-0.15, -1], [0.45, -1], [0.1, -0.2], [0.5, -0.2], [-0.35, 1], [-0.05, 0.1], [-0.45, 0.1]];
        P.forEach(([px, py], i) => (i ? cx.lineTo(px * r, py * r) : cx.moveTo(px * r, py * r)));
        cx.closePath();
        break;
      }
      case "ticks":
        for (const a of [-0.9, 0, 0.9]) {
          const ux = Math.cos(a - Math.PI / 2), uy = Math.sin(a - Math.PI / 2);
          cx.moveTo(ux * r * 0.35, uy * r * 0.35);
          cx.lineTo(ux * r, uy * r);
        }
        break;
    }
  }
  private drawComic(t: Extract<Thing, { kind: "comic" }>) {
    const { cx, C, dpr } = this;
    const k = 1 - t.life;
    const pop = Math.min(1, k / 0.14);
    const sc = this.reduce ? 1 : Math.max(0.01, easeOutBack(pop));
    cx.save();
    cx.globalAlpha = t.life < 0.35 ? t.life / 0.35 : 1;
    cx.translate(t.x, t.y);
    cx.rotate(t.rot + k * 0.08);
    cx.scale(sc, sc);
    const ink = Math.max(3, t.r * 0.06) ;
    cx.lineJoin = "round";
    cx.lineCap = "round";
    if (t.style === "ticks") {
      this.shapePath("ticks", t.r, t.seed);
      cx.strokeStyle = C.deep;
      cx.lineWidth = ink * 3.2;
      cx.stroke();
      cx.strokeStyle = t.fill;
      cx.lineWidth = ink * 1.6;
      cx.stroke();
      cx.restore();
      return;
    }
    // offset shadow
    const off = t.r * 0.07;
    cx.translate(off, off);
    this.shapePath(t.style, t.r, t.seed);
    cx.fillStyle = C.deep;
    cx.fill();
    cx.translate(-off, -off);
    // ink outline, then fill on top so only the outer edge shows
    this.shapePath(t.style, t.r, t.seed);
    cx.strokeStyle = C.deep;
    cx.lineWidth = ink * 2;
    cx.stroke();
    cx.fillStyle = t.fill;
    cx.fill();
    if (this.dots) {
      const a = cx.globalAlpha;
      cx.globalAlpha = a * 0.28;
      cx.fillStyle = this.dots;
      cx.fill();
      cx.globalAlpha = a;
    }
    // second, smaller layer inside (the red-in-yellow look)
    if (t.fill2) {
      const inner = t.style === "zap" ? 0.42 : 0.56;
      cx.rotate(0.2);
      this.shapePath(t.style, t.r * inner, t.seed.slice(5).concat(t.seed.slice(0, 5)));
      cx.lineWidth = ink * 1.4;
      cx.stroke();
      cx.fillStyle = t.fill2;
      cx.fill();
    }
    cx.restore();
    void dpr;
  }
  private drawFocus(t: Extract<Thing, { kind: "focus" }>) {
    const { cx, W, H, C } = this;
    const far = Math.hypot(W, H);
    const k = 1 - t.life;
    cx.save();
    cx.globalAlpha = Math.max(0, t.life) * 0.8;
    cx.fillStyle = C.deep;
    for (let i = 0; i < t.seed.length; i++) {
      const a = (i / t.seed.length) * Math.PI * 2 + t.seed[(i + 3) % t.seed.length] * 0.05;
      const w = 0.012 + 0.02 * t.seed[i];
      const r0 = Math.min(W, H) * (0.22 + 0.25 * t.seed[(i + 11) % t.seed.length]) * (1 - k * 0.3);
      cx.beginPath();
      cx.moveTo(t.x + Math.cos(a) * r0, t.y + Math.sin(a) * r0);
      cx.lineTo(t.x + Math.cos(a - w) * far, t.y + Math.sin(a - w) * far);
      cx.lineTo(t.x + Math.cos(a + w) * far, t.y + Math.sin(a + w) * far);
      cx.closePath();
      cx.fill();
    }
    cx.restore();
  }
  flash() {
    this.things.push({ kind: "flash", life: 1 });
    this.kick();
  }
  draw() {
    const { cx, W, H, C, dpr } = this;
    this.clear();
    // comic hits sit in the background: drawn first, faded, so letters and text stay on top
    const isComic = (t: Thing) => t.kind === "comic" || t.kind === "focus";
    const comics = this.things.filter(isComic);
    if (comics.length) {
      const main = this.cx;
      this.cx = this.lcx;
      this.lcx.clearRect(0, 0, W, H);
      try {
        for (const t of comics) {
          if (t.kind === "focus") this.drawFocus(t);
          else if (t.kind === "comic") this.drawComic(t);
        }
      } finally {
        this.cx = main;
      }
      cx.globalAlpha = COMIC_ALPHA;
      cx.drawImage(this.layer, 0, 0);
      cx.globalAlpha = 1;
    }
    const cols = this.things.filter((t) => t.kind === "col");
    const order = [...cols, ...this.things.filter((t) => !isComic(t) && t.kind !== "col")];
    for (const t of comics) t.life -= this.reduce ? 0.07 : t.kind === "comic" ? t.decay : 0.03;
    for (const t of order) {
      const k = 1 - t.life;
      cx.globalAlpha = Math.max(0, t.life);
      switch (t.kind) {
        case "flash":
          cx.fillStyle = C.blush;
          cx.globalAlpha = Math.max(0, t.life) * 0.9;
          cx.fillRect(0, 0, W, H);
          break;
        case "letter":
          cx.fillStyle = t.color;
          cx.font = `900 ${t.s * (1 + k * 0.25)}px Unbounded, "Arial Black", sans-serif`;
          cx.textAlign = "center";
          cx.textBaseline = "middle";
          cx.fillText(t.ch.toUpperCase(), t.x, t.y - k * H * 0.05 * this.fx);
          break;
        case "ring":
          cx.strokeStyle = t.color;
          cx.lineWidth = 6 * dpr * t.life * (this.fx < 1 ? 0.6 : 1);
          cx.beginPath();
          cx.arc(t.x, t.y, t.r + k * H * 0.45 * this.fx, 0, Math.PI * 2);
          cx.stroke();
          break;
        case "dots":
          cx.fillStyle = t.color;
          for (let i = 0; i < 10; i++) {
            const a = t.a + (i / 10) * Math.PI * 2;
            const r = k * H * 0.3 * this.fx;
            cx.beginPath();
            cx.arc(t.x + Math.cos(a) * r, t.y + Math.sin(a) * r, (10 * dpr * t.life + 2) * (this.fx < 1 ? 0.6 : 1), 0, Math.PI * 2);
            cx.fill();
          }
          break;
        case "col": {
          cx.globalAlpha = Math.max(0, t.life) * 0.55;
          cx.fillStyle = t.color;
          const h = H * Math.min(1, k * 4 + 0.15);
          cx.fillRect(t.x - t.w / 2, 0, t.w, h);
          break;
        }
        case "bar": {
          cx.fillStyle = t.color;
          const w = W * Math.min(1, k * 2.2);
          cx.fillRect(t.dir > 0 ? 0 : W - w, t.y - H * 0.025 * this.fx, w, H * 0.05 * this.fx);
          break;
        }
      }
      t.life -= this.reduce ? 0.07 : t.kind === "comic" ? t.decay : t.kind === "focus" ? 0.03 : t.kind === "flash" ? 0.035 : 0.02;
    }
    cx.globalAlpha = 1;
    this.things = this.things.filter((t) => t.life > 0);
    if (this.things.length) requestAnimationFrame(() => this.draw());
    else {
      this.running = false;
      this.release();
    }
  }
}

/* ------------------------------------------------------------------ *
 * Page wiring
 * ------------------------------------------------------------------ */
const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

export function boot() {
  const engine = new Engine();
  engine.ensure();
  // wake audio on the first finger lift, click or key, wherever it happens on the page
  for (const t of ["touchend", "pointerup", "click", "keydown"])
    addEventListener(t, () => engine.unlock(), { capture: true, passive: true });
  const stage = new Stage($("#stage"));
  const bufEl = $("#buf");
  const card = $("#card");
  const cardBody = $("#cardbody");
  const cardWord = $("#cardword");
  const chordEl = $("#chord");
  const listEl = $<HTMLDialogElement>("#list");
  const ghost = $<HTMLInputElement>("#ghost");
  const soundBtn = $<HTMLButtonElement>("#sound");
  const ambBtn = $<HTMLButtonElement>("#ambience");
  const byWord = new Map(entries.map((e) => [e.word, e]));
  const found = new Set<string>();
  let buffer = "";

  // sound controls
  const renderSound = () => {
    soundBtn.setAttribute("aria-pressed", String(engine.settings.on));
    soundBtn.querySelector(".label")!.textContent = engine.settings.on ? "Sound on" : "Sound off";
    ambBtn.setAttribute("aria-pressed", String(engine.settings.amb));
    ambBtn.querySelector(".label")!.textContent = engine.settings.amb ? "Ambience on" : "Ambience off";
  };
  renderSound();
  soundBtn.addEventListener("click", () => {
    engine.start();
    engine.set({ on: !engine.settings.on });
    renderSound();
  });
  ambBtn.addEventListener("click", () => {
    engine.start();
    engine.set({ amb: !engine.settings.amb });
    renderSound();
  });
  document.addEventListener("visibilitychange", () => engine.setHidden(document.hidden));

  let onPress: (ch: string) => void = () => {};
  // after 10 quiet seconds the page settles back to its opening state, prompt and all
  let idleTimer = 0;
  const settle = () => {
    document.body.classList.remove("played");
    buffer = "";
    bufEl.textContent = "";
  };
  function press(ch: string) {
    engine.start();
    document.body.classList.add("played");
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(settle, 10000);
    const hit = lookup(ch);
    if (!hit) return;
    engine.hit(hit.sample, ch, hit.level, toneFor(hit.row, hit.col));
    stage.spawn(ch, hit.row, hit.col);
    onPress(ch);
    buffer = (buffer + ch).slice(-24);
    bufEl.textContent = buffer;
    for (const [w, e] of byWord) {
      if (buffer.endsWith(w)) {
        buffer = "";
        window.setTimeout(() => unlock(e), 110);
        break;
      }
    }
  }

  /** Plays a drum key without typing it. Pass show=false for sound only. */
  function drumHit(d: string, rate = 1, show = true) {
    const h = lookup(d);
    if (!h) return;
    engine.hit(h.sample, "drum" + d, h.level, null, rate);
    if (show) stage.spawn(d, DRUM_ROW, h.col);
  }

  function unlock(e: Entry) {
    const chord = engine.advance();
    chordEl.textContent = chord;
    // the landing: kick, 808 on the new chord's root, crash, and the big burst
    drumHit("1", 1, false);
    drumHit("2", engine.rootRate(), false);
    drumHit("0", 1, false);
    stage.bam();
    found.add(e.word);
    document.querySelectorAll(`[data-word="${e.word}"]`).forEach((b) => b.classList.add("found"));
    window.setTimeout(() => (bufEl.textContent = ""), 450);
    openCard(e);
  }

  let autoTimers: number[] = [];
  function autotype(word: string) {
    autoTimers.forEach(clearTimeout);
    autoTimers = [];
    buffer = "";
    [...word].forEach((ch, i) => autoTimers.push(window.setTimeout(() => press(ch), i * 105)));
  }

  // The address bar follows the card: "/word" while it's open, "/" once it closes, so whatever is
  // open can be shared and the back button closes it. Words without a page of their own stay on "/".
  const wordFromPath = () => location.pathname.replace(/^\/+|\/+$/g, "");
  function showUrl(e: Entry | null) {
    const page = e && PAGE_WORDS.has(e.word) ? e : null;
    if (wordFromPath() !== (page?.word ?? "")) history.pushState(null, "", page ? `/${page.word}` : "/");
    document.title = page ? pageTitle(page) : HOME_TITLE;
  }

  /** Pass push=false when the address bar already shows this card (arriving on its page, or back/forward). */
  function openCard(e: Entry, push = true) {
    cardWord.textContent = `You played “${e.word}”`;
    const links = (e.links || [])
      .map((l) => `<a href="${l.href}" ${l.href.startsWith("/") ? "" : 'rel="noopener" target="_blank"'}>${l.label}${l.href.startsWith("/") ? "" : " ↗"}</a>`)
      .join("");
    const email =
      e.word === "hello"
        ? `<div class="mailrow"><span class="mail">tochibedford.work@gmail.com</span><button class="copy" type="button">Copy email</button></div>`
        : "";
    // projects show their link right under the title, like a subtitle; About, Résumé and Hello keep theirs at the bottom
    const linkUp = e.group !== "Me" && links;
    cardBody.innerHTML = `<p class="meta">${e.meta}</p><h2 id="cardtitle">${e.title}</h2>
      ${linkUp ? `<div class="sublinks">${links}</div>` : ""}
      ${e.body.map((p) => `<p>${p}</p>`).join("")}
      ${e.note ? `<p class="note">${e.note}</p>` : ""}
      ${e.stack?.length ? `<ul class="tags">${e.stack.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}
      ${email}${linkUp ? "" : `<div class="links">${links}</div>`}`;
    const copy = cardBody.querySelector<HTMLButtonElement>(".copy");
    copy?.addEventListener("click", () => {
      navigator.clipboard?.writeText("tochibedford.work@gmail.com").then(
        () => (copy.textContent = "Copied"),
        () => (copy.textContent = "Select the address to copy")
      );
    });
    card.classList.add("open");
    card.setAttribute("aria-hidden", "false");
    card.removeAttribute("inert");
    fitTitle();
    if (push) showUrl(e);
  }
  // Titles wrap between words but never inside one. If a single word is wider than the card
  // (a long name on a narrow phone), the title shrinks just enough for that word to fit.
  function fitTitle() {
    const h = document.getElementById("cardtitle");
    if (!h) return;
    h.style.fontSize = "";
    if (h.scrollWidth > h.clientWidth + 1) {
      const size = parseFloat(getComputedStyle(h).fontSize);
      h.style.fontSize = `${Math.floor(size * (h.clientWidth / h.scrollWidth) * 0.98)}px`;
    }
  }
  addEventListener("resize", () => card.classList.contains("open") && fitTitle());
  function closeCard(push = true) {
    const wasOpen = card.classList.contains("open");
    card.classList.remove("open");
    card.setAttribute("aria-hidden", "true");
    card.setAttribute("inert", "");
    if (wasOpen && push) showUrl(null);
  }
  $("#close").addEventListener("click", () => closeCard());
  addEventListener("popstate", () => {
    const e = byWord.get(wordFromPath());
    if (e && PAGE_WORDS.has(e.word)) openCard(e, false);
    else closeCard(false);
    document.title = e ? pageTitle(e) : HOME_TITLE;
  });

  // projects sheet (phones): slides up from the Projects button, closes before a project plays
  const sheet = $("#sheet");
  const scrim = $("#scrim");
  const projBtn = $<HTMLButtonElement>("#projbtn");
  const sheetOpen = () => sheet.classList.contains("open");
  function openSheet() {
    closeCard();
    sheet.style.transform = "";
    sheet.classList.add("open");
    scrim.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    sheet.removeAttribute("inert");
    projBtn.setAttribute("aria-expanded", "true");
    engine.start();
  }
  function closeSheet() {
    sheet.style.transform = "";
    sheet.classList.remove("open");
    scrim.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    sheet.setAttribute("inert", "");
    projBtn.setAttribute("aria-expanded", "false");
  }
  projBtn.addEventListener("click", openSheet);
  scrim.addEventListener("click", closeSheet);
  $("#sheetclose").addEventListener("click", closeSheet);
  // swipe the sheet's top down to close it
  const grab = $("#sheetgrab");
  let dragY: number | null = null;
  grab.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragY = e.clientY;
    sheet.classList.add("dragging");
    grab.setPointerCapture(e.pointerId);
  });
  grab.addEventListener("pointermove", (e) => {
    if (dragY === null) return;
    sheet.style.transform = `translateY(${Math.max(0, e.clientY - dragY)}px)`;
  });
  const endDrag = (e: PointerEvent) => {
    if (dragY === null) return;
    const dy = e.clientY - dragY;
    dragY = null;
    sheet.classList.remove("dragging");
    if (dy > 80) closeSheet();
    else sheet.style.transform = "";
  };
  grab.addEventListener("pointerup", endDrag);
  grab.addEventListener("pointercancel", endDrag);

  // word index + list view buttons
  document.querySelectorAll<HTMLButtonElement>("[data-word]").forEach((b) =>
    b.addEventListener("click", () => {
      if (listEl.open) listEl.close();
      if (b.closest("#sheet")) {
        // let the sheet slide away first, then play the word
        closeSheet();
        window.setTimeout(() => autotype(b.dataset.word!), 340);
      } else autotype(b.dataset.word!);
    })
  );
  const openList = () => {
    closeCard();
    closeSheet();
    listEl.showModal();
  };
  $("#openlist").addEventListener("click", openList);
  document.querySelectorAll("[data-openlist]").forEach((b) => b.addEventListener("click", openList));
  $("#closelist").addEventListener("click", () => listEl.close());

  // keyboard
  addEventListener("keydown", (ev) => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (ev.key === "Escape") {
      if (sheetOpen()) closeSheet();
      else closeCard();
      return;
    }
    if (listEl.open || sheetOpen()) return;
    const t = ev.target as HTMLElement;
    if (t.closest("input[type=range], textarea")) return;
    if (t.closest("button, a") && (ev.key === "Enter" || ev.key === " ")) return;
    if (ev.repeat) return;
    const ch = ev.key.toLowerCase();
    if (/^[a-z0-9]$/.test(ch)) {
      ev.preventDefault();
      press(ch);
    }
  });

  // phones: tap a band of the screen to play its row, and a real input for the keyboard
  ghost.addEventListener("input", () => {
    const v = ghost.value.toLowerCase();
    ghost.value = "";
    for (const ch of v) if (/[a-z0-9]/.test(ch)) press(ch);
  });
  // Tap or drag on the background to play. The open space between the header and the typed
  // letters is split into four bands laid out like the keyboard: drums (1-0) on top, then the
  // Q, A and Z rows. Dragging plays every key your finger crosses, once per key.
  const band = () => {
    const top = $(".top").getBoundingClientRect().bottom;
    const bottom = $(".buffer").getBoundingClientRect().top;
    return bottom - top > 120 ? { top, bottom } : { top: 0, bottom: innerHeight };
  };
  const keyAt = (x: number, y: number, b: { top: number; bottom: number }) => {
    const r = Math.min(3, Math.max(0, Math.floor(((y - b.top) / (b.bottom - b.top)) * 4)));
    const keys = r === 0 ? DIGITS : ROWS[r - 1];
    return keys[Math.min(keys.length - 1, Math.max(0, Math.floor((x / innerWidth) * keys.length)))];
  };

  // Ghost pads (touch screens only): every key sits faintly where you'd tap it, drifting a little
  // as if suspended in water. No borders; they light up for a moment when played.
  const padEls = new Map<string, HTMLElement>();
  if (matchMedia("(hover: none)").matches) {
    const layer = document.createElement("div");
    layer.className = "pads";
    layer.setAttribute("aria-hidden", "true");
    const rows = [DIGITS, ...ROWS];
    rows.forEach((keys, r) =>
      [...keys].forEach((k, i) => {
        const el = document.createElement("span");
        el.className = "pad";
        el.textContent = k;
        el.dataset.r = String(r);
        el.dataset.i = String(i);
        el.dataset.n = String(keys.length);
        // each one drifts on its own slow loop so they never move in step
        el.style.setProperty("--dur", `${9 + Math.random() * 7}s`);
        el.style.setProperty("--delay", `${-Math.random() * 16}s`);
        el.style.setProperty("--dx", `${(Math.random() - 0.5) * 10}px`);
        el.style.setProperty("--dy", `${4 + Math.random() * 6}px`);
        el.style.setProperty("--rot", `${(Math.random() - 0.5) * 6}deg`);
        layer.appendChild(el);
        padEls.set(k, el);
      }),
    );
    stage.cv.after(layer);
    const place = () => {
      const b = band();
      const h = (b.bottom - b.top) / 4;
      const size = Math.min(h * 0.55, (innerWidth / 10) * 0.9);
      layer.style.setProperty("--pad-size", `${size}px`);
      padEls.forEach((el) => {
        const r = +el.dataset.r!, i = +el.dataset.i!, n = +el.dataset.n!;
        el.style.left = `${((i + 0.5) / n) * innerWidth}px`;
        el.style.top = `${b.top + (r + 0.5) * h}px`;
      });
    };
    place();
    addEventListener("resize", place);
    document.fonts?.ready.then(place);
  }
  if (padEls.size)
    stage.anchor = (ch) => {
      const el = padEls.get(ch);
      return el ? { x: parseFloat(el.style.left), y: parseFloat(el.style.top) } : null;
    };
  onPress = (ch) => {
    const el = padEls.get(ch);
    if (!el) return;
    el.classList.remove("hit");
    void el.offsetWidth; // restart the flash
    el.classList.add("hit");
  };
  let drag: { id: number; last: string; b: { top: number; bottom: number } } | null = null;
  // Phones start "locked": audio can only begin on a finger lift, so the first tap is framed as
  // turning the sound on. When it goes live the pads light up outward from that tap.
  let lastTouch = { x: innerWidth / 2, y: innerHeight / 2 };
  if (padEls.size && engine.ctx?.state !== "running") {
    document.body.classList.add("locked");
    engine.onLive = () => {
      const { x, y } = lastTouch;
      const far = Math.hypot(innerWidth, innerHeight);
      padEls.forEach((el) => {
        const d = Math.hypot(parseFloat(el.style.left) - x, parseFloat(el.style.top) - y);
        el.style.transitionDelay = `${(d / far) * 0.7}s`;
      });
      stage.ripple(x, y);
      document.body.classList.remove("locked");
      window.setTimeout(() => padEls.forEach((el) => (el.style.transitionDelay = "")), 1600);
    };
  }
  stage.cv.addEventListener("pointerdown", (e) => {
    lastTouch = { x: e.clientX, y: e.clientY };
    const b = band();
    const k = keyAt(e.clientX, e.clientY, b);
    drag = { id: e.pointerId, last: k, b };
    stage.cv.setPointerCapture(e.pointerId);
    press(k);
  });
  stage.cv.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const k = keyAt(e.clientX, e.clientY, drag.b);
    if (k !== drag.last) {
      drag.last = k;
      press(k);
    }
  });
  const endPlay = (e: PointerEvent) => {
    if (drag && e.pointerId === drag.id) drag = null;
  };
  stage.cv.addEventListener("pointerup", endPlay);
  stage.cv.addEventListener("pointercancel", endPlay);


  // Arriving on "/foundry" (or an old "/#foundry" link) opens that card straight away. There's
  // no typing animation: audio can't start before the first tap, so it would play in silence.
  // The word waits in the typed buffer instead, and the card's label becomes a button to play it.
  const hash = location.hash.slice(1).toLowerCase();
  if (byWord.has(hash) && PAGE_WORDS.has(hash)) {
    history.replaceState(null, "", `/${hash}`);
    document.title = pageTitle(byWord.get(hash)!);
  }
  const arrived = byWord.get(wordFromPath()) ?? byWord.get(hash);
  if (arrived) {
    openCard(arrived, false);
    found.add(arrived.word);
    document.querySelectorAll(`[data-word="${arrived.word}"]`).forEach((b) => b.classList.add("found"));
    document.body.classList.add("played");
    bufEl.textContent = arrived.word;
    idleTimer = window.setTimeout(settle, 10000);
    cardWord.innerHTML = `<button class="textbtn" type="button">Play “${arrived.word}”</button>`;
    cardWord.querySelector("button")!.addEventListener("click", () => autotype(arrived.word));
  }
}
