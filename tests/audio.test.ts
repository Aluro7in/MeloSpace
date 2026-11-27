import { describe, expect, it } from 'vitest';
import { AudioEngine } from '../src/audio/audio-engine';
import type { Instrument, Voice } from '../src/audio/instrument';

/** Fake context/instrument: verifies engine bookkeeping (not sound quality). */
function fake() {
  const events: string[] = [];
  const voices: Array<{ midi: number; stopped: boolean; released: boolean; end: () => void }> = [];
  const inst: Instrument = {
    id: 'piano', kind: 'prototype-synth', label: 'fake', async load() {},
    createVoice(_c, _d, midi): Voice {
      const cbs: Array<() => void> = [];
      const v = { midi, stopped: false, released: false, end: () => cbs.forEach((c) => c()) };
      voices.push(v);
      return { release() { v.released = true; events.push(`rel${midi}`); }, stop() { v.stopped = true; v.end(); }, onEnded(cb) { cbs.push(cb); } };
    },
  };
  const ctx: any = { state: 'running', currentTime: 1, resume: async () => {}, close: async () => { ctx.state = 'closed'; }, destination: {}, createGain: () => ({ gain: { value: 1, setTargetAtTime() {} }, connect() {} }) };
  const engine = new AudioEngine(3, () => ctx);
  return { engine, inst, voices, events, ctx };
}

describe('AudioEngine', () => {
  it('noteOn/noteOff release the right voice; retrigger does not duplicate', async () => {
    const { engine, inst, voices } = fake();
    await engine.setInstrument(inst); await engine.ensureStarted();
    engine.noteOn(60); engine.noteOn(60);
    expect(voices).toHaveLength(2);
    expect(voices[0].released).toBe(true);
    engine.noteOff(60);
    expect(voices[1].released).toBe(true);
  });
  it('polyphony cap steals oldest', async () => {
    const { engine, inst, voices } = fake();
    await engine.setInstrument(inst); await engine.ensureStarted();
    [60, 62, 64, 65].forEach((m) => engine.noteOn(m));
    expect(voices[0].stopped).toBe(true);
    expect(engine.voiceCount).toBeLessThanOrEqual(3);
  });
  it('allNotesOff releases all held notes', async () => {
    const { engine, inst, voices } = fake();
    await engine.setInstrument(inst); await engine.ensureStarted();
    engine.noteOn(60); engine.noteOn(64);
    engine.allNotesOff();
    expect(voices.every((v) => v.released)).toBe(true);
  });
  it('volume is clamped; dispose cleans up', async () => {
    const { engine, inst, ctx } = fake();
    await engine.setInstrument(inst); await engine.ensureStarted();
    engine.setVolume(5); expect(engine.getVolume()).toBe(1);
    engine.setVolume(-1); expect(engine.getVolume()).toBe(0);
    engine.noteOn(60);
    await engine.dispose();
    expect(ctx.state).toBe('closed');
    expect(engine.voiceCount).toBe(0);
  });
  it('schedule returns end time and spawns voices at scheduled times', async () => {
    const { engine, inst, voices } = fake();
    await engine.setInstrument(inst); await engine.ensureStarted();
    const end = engine.schedule([{ midi: 60, startSec: 0, durationSec: 0.5 }, { midi: 62, startSec: 1, durationSec: 0.5 }], 2);
    expect(voices).toHaveLength(2);
    expect(end).toBeCloseTo(3.5);
  });
});
