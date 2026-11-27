import { describe, expect, it } from 'vitest';
import { PIANO_KEYS, midiToFrequency, midiToNoteName, noteNameToMidi } from '../src/music/notes';
import { PianoInput } from '../src/music/piano-input';

describe('piano layout and mapping', () => {
  it('has 8 white + 5 black keys, C4..C5, with correct MIDI', () => {
    expect(PIANO_KEYS.filter((k) => !k.isBlack)).toHaveLength(8);
    expect(PIANO_KEYS.filter((k) => k.isBlack)).toHaveLength(5);
    const expected: Record<string, number> = { C4: 60, 'C#4': 61, D4: 62, 'D#4': 63, E4: 64, F4: 65, 'F#4': 66, G4: 67, 'G#4': 68, A4: 69, 'A#4': 70, B4: 71, C5: 72 };
    for (const [n, m] of Object.entries(expected)) expect(noteNameToMidi(n)).toBe(m);
    expect(new Set(PIANO_KEYS.map((k) => k.id)).size).toBe(13);
    PIANO_KEYS.forEach((k) => expect(midiToNoteName(k.midi)).toBe(k.note));
  });
  it('A4 = 440 Hz, C4 ≈ 261.63 Hz', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 5);
    expect(midiToFrequency(60)).toBeCloseTo(261.626, 2);
  });
});

describe('PianoInput', () => {
  const make = () => {
    const log: string[] = [];
    const inp = new PianoInput((id) => PIANO_KEYS.find((k) => k.id === id)?.midi, {
      noteOn: (m) => log.push(`on${m}`), noteOff: (m) => log.push(`off${m}`),
    });
    return { inp, log };
  };
  it('ignores duplicate pointerdown on the same key', () => {
    const { inp, log } = make();
    inp.press('key-C4', 1); inp.press('key-C4', 1);
    expect(log).toEqual(['on60']);
  });
  it('two pointers on one key: one note-on, note-off after last release', () => {
    const { inp, log } = make();
    inp.press('key-C4', 1); inp.press('key-C4', 2); inp.release(1);
    expect(log).toEqual(['on60']);
    inp.release(2);
    expect(log).toEqual(['on60', 'off60']);
  });
  it('polyphony and releaseAll leave no stuck notes', () => {
    const { inp, log } = make();
    inp.press('key-C4', 1); inp.press('key-E4', 2); inp.press('key-G4', 3);
    inp.releaseAll();
    expect(log.filter((l) => l.startsWith('on'))).toHaveLength(3);
    expect(log.filter((l) => l.startsWith('off'))).toHaveLength(3);
    expect(inp.heldKeys).toEqual([]);
  });
  it('unknown key ids are ignored', () => {
    const { inp, log } = make();
    inp.press('key-Z9', 1);
    expect(log).toEqual([]);
  });
});
