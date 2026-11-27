import type { Instrument, Voice } from './instrument';

/**
 * Sampled instrument: maps MIDI notes to licensed/original audio files.
 * No samples are bundled yet — see docs. Provide {midi: url} and it pitch-matches
 * missing notes from the nearest sample via playbackRate.
 */
export class SampleInstrument implements Instrument {
  readonly kind = 'sampled' as const;
  private buffers = new Map<number, AudioBuffer>();
  constructor(readonly id: string, readonly label: string, private urls: Record<number, string>) {}

  async load(ctx: BaseAudioContext): Promise<void> {
    await Promise.all(Object.entries(this.urls).map(async ([midi, url]) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sample load failed (${res.status}): ${url}`);
      this.buffers.set(Number(midi), await ctx.decodeAudioData(await res.arrayBuffer()));
    }));
  }

  createVoice(ctx: BaseAudioContext, dest: AudioNode, midi: number, velocity: number, when: number): Voice {
    const roots = [...this.buffers.keys()];
    if (!roots.length) throw new Error('No samples loaded');
    const root = roots.reduce((a, b) => (Math.abs(b - midi) < Math.abs(a - midi) ? b : a));
    const src = ctx.createBufferSource();
    src.buffer = this.buffers.get(root)!;
    src.playbackRate.value = Math.pow(2, (midi - root) / 12);
    const g = ctx.createGain();
    g.gain.value = Math.max(0.05, Math.min(1, velocity));
    src.connect(g).connect(dest);
    src.start(when);
    let ended = false;
    const cbs: Array<() => void> = [];
    src.onended = () => { ended = true; try { g.disconnect(); } catch { /* noop */ } cbs.forEach((c) => c()); };
    return {
      release(t) {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + 0.2);
        try { src.stop(t + 0.25); } catch { /* noop */ }
      },
      stop() { try { src.stop(); } catch { /* noop */ } },
      onEnded(cb) { if (ended) cb(); else cbs.push(cb); },
    };
  }
}
