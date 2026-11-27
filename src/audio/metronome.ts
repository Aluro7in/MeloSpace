/**
 * Metronome using the standard lookahead scheduler: a coarse timer wakes up often,
 * but every click is scheduled on the AudioContext clock, so timing is not bound to
 * JS timer jitter. Beat callbacks (visual) are queued with audio times.
 */
export class Metronome {
  private timer?: ReturnType<typeof setInterval>;
  private nextBeatTime = 0;
  private beat = 0;
  private bpm = 72;
  private running = false;
  readonly lookaheadSec = 0.12;
  /** Beats scheduled but not yet "displayed": {time, beatInBar}. */
  private pending: Array<{ time: number; beat: number }> = [];

  constructor(private getCtx: () => AudioContext | undefined, private getDest: () => AudioNode | undefined, public beatsPerBar = 4) {}

  get isRunning() { return this.running; }
  getBpm() { return this.bpm; }
  setBpm(bpm: number) { this.bpm = Math.max(40, Math.min(160, Math.round(bpm))); }

  start(): void {
    const ctx = this.getCtx();
    if (!ctx || this.running) return;
    this.running = true;
    this.beat = 0;
    this.nextBeatTime = ctx.currentTime + 0.06;
    this.tick();
    this.timer = setInterval(() => this.tick(), 25);
  }

  stop(): void {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.pending = [];
  }

  /** Call every frame: returns the beat (0-based in bar) whose audio time has passed, if any. */
  pollVisualBeat(): number | undefined {
    const ctx = this.getCtx();
    if (!ctx) return undefined;
    let out: number | undefined;
    while (this.pending.length && this.pending[0].time <= ctx.currentTime) out = this.pending.shift()!.beat;
    return out;
  }

  private tick() {
    const ctx = this.getCtx();
    const dest = this.getDest();
    if (!ctx || !dest || !this.running) return;
    while (this.nextBeatTime < ctx.currentTime + this.lookaheadSec) {
      this.click(ctx, dest, this.nextBeatTime, this.beat % this.beatsPerBar === 0);
      this.pending.push({ time: this.nextBeatTime, beat: this.beat % this.beatsPerBar });
      this.nextBeatTime += 60 / this.bpm;
      this.beat++;
    }
  }

  private click(ctx: AudioContext, dest: AudioNode, when: number, accent: boolean) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = accent ? 1600 : 1000;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.3, when + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    o.connect(g).connect(dest);
    o.start(when);
    o.stop(when + 0.06);
    o.onended = () => g.disconnect();
  }
}
