import type { Instrument, Voice } from './instrument';

export interface ScheduledNote { midi: number; startSec: number; durationSec: number }

/**
 * Web Audio engine: context lifecycle, master volume, polyphony cap, note-on/off,
 * scheduled playback on the audio clock, and cleanup. Independent of XR and of Gemini.
 */
export class AudioEngine {
  ctx?: AudioContext;
  private master?: GainNode;
  private instrument?: Instrument;
  private active = new Map<number, Voice[]>(); // held (manual) voices per midi
  private all = new Set<Voice>();
  private volume = 0.8;
  readonly maxPolyphony: number;

  constructor(maxPolyphony = 16, private ctxFactory: () => AudioContext = () => new AudioContext()) {
    this.maxPolyphony = maxPolyphony;
  }

  get state(): AudioContextState | 'none' { return this.ctx?.state ?? 'none'; }
  /** Audio-clock time in seconds (performance timestamps use this). */
  get now(): number { return this.ctx?.currentTime ?? 0; }
  get instrumentInfo() { return this.instrument ? { id: this.instrument.id, kind: this.instrument.kind, label: this.instrument.label } : undefined; }
  get voiceCount() { return this.all.size; }
  /** Master bus (metronome and instruments connect here). */
  get output(): AudioNode | undefined { return this.master; }

  /** Must be called from a user gesture the first time (browser autoplay policy). */
  async ensureStarted(): Promise<void> {
    if (!this.ctx) {
      this.ctx = this.ctxFactory();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      if (this.instrument) await this.instrument.load(this.ctx);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  async setInstrument(inst: Instrument): Promise<void> {
    this.allNotesOff();
    this.instrument = inst;
    if (this.ctx) await inst.load(this.ctx);
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.01);
  }
  getVolume() { return this.volume; }

  private spawn(midi: number, velocity: number, when: number): Voice | undefined {
    if (!this.ctx || !this.master || !this.instrument) return undefined;
    if (this.all.size >= this.maxPolyphony) {
      const oldest = this.all.values().next().value as Voice | undefined;
      oldest?.stop();
      if (oldest) this.all.delete(oldest);
    }
    const v = this.instrument.createVoice(this.ctx, this.master, midi, velocity, when);
    this.all.add(v);
    v.onEnded(() => {
      this.all.delete(v);
      const list = this.active.get(midi);
      if (list) {
        const i = list.indexOf(v);
        if (i >= 0) list.splice(i, 1);
        if (!list.length) this.active.delete(midi);
      }
    });
    return v;
  }

  /** Immediate note-on. Re-triggering a held note releases the previous voice first (no duplicates). */
  noteOn(midi: number, velocity = 0.8): void {
    if (!this.ctx) return;
    this.noteOff(midi);
    const v = this.spawn(midi, velocity, this.ctx.currentTime);
    if (v) this.active.set(midi, [v]);
  }

  noteOff(midi: number): void {
    if (!this.ctx) return;
    const list = this.active.get(midi);
    if (!list) return;
    list.forEach((v) => v.release(this.ctx!.currentTime));
    this.active.delete(midi);
  }

  /** Tracking loss / session end / tab hidden: release everything. */
  allNotesOff(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const list of this.active.values()) list.forEach((v) => v.release(t));
    this.active.clear();
  }

  /** Schedule notes on the audio clock; returns the audio time the sequence ends. */
  schedule(notes: ScheduledNote[], startAt: number): number {
    let end = startAt;
    for (const n of notes) {
      const v = this.spawn(n.midi, 0.7, startAt + n.startSec);
      v?.release(startAt + n.startSec + n.durationSec);
      end = Math.max(end, startAt + n.startSec + n.durationSec);
    }
    return end;
  }

  stopAll(): void {
    this.active.clear();
    for (const v of [...this.all]) v.stop();
    this.all.clear();
  }

  async dispose(): Promise<void> {
    this.stopAll();
    if (this.ctx && this.ctx.state !== 'closed') await this.ctx.close();
    this.ctx = undefined;
    this.master = undefined;
  }
}
