import { midiToFrequency } from '../music/notes';
import type { Instrument, Voice } from './instrument';

/**
 * PROTOTYPE synthesized piano-like tone (additive partials + decay envelope).
 * It is NOT a sampled piano. Swap in SampleInstrument once licensed samples exist.
 */
export class SynthPianoInstrument implements Instrument {
  readonly id = 'piano';
  readonly kind = 'prototype-synth' as const;
  readonly label = 'Prototype synth piano (not sampled)';
  async load(): Promise<void> {}

  createVoice(ctx: BaseAudioContext, dest: AudioNode, midi: number, velocity: number, when: number): Voice {
    const f0 = midiToFrequency(midi);
    const gain = ctx.createGain();
    const peak = 0.35 * Math.max(0.05, Math.min(1, velocity));
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(peak, when + 0.006);
    gain.gain.exponentialRampToValueAtTime(peak * 0.35, when + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 6);
    gain.connect(dest);

    const partials = [[1, 1], [2, 0.45], [3, 0.2], [4, 0.1], [5, 0.05]] as const;
    const oscs = partials.map(([mult, amp]) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f0 * mult;
      const g = ctx.createGain();
      g.gain.value = amp;
      o.connect(g).connect(gain);
      o.start(when);
      o.stop(when + 6.1);
      return o;
    });

    let ended = false;
    const cbs: Array<() => void> = [];
    const finish = () => {
      if (ended) return;
      ended = true;
      try { gain.disconnect(); } catch { /* already disconnected */ }
      cbs.forEach((cb) => cb());
    };
    oscs[0].onended = finish;

    return {
      release(t: number) {
        const at = Math.max(t, when + 0.01);
        gain.gain.cancelScheduledValues(at);
        gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0002), at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
        oscs.forEach((o) => { try { o.stop(at + 0.3); } catch { /* already stopped */ } });
      },
      stop() {
        oscs.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } });
        finish();
      },
      onEnded(cb) { if (ended) cb(); else cbs.push(cb); },
    };
  }
}
