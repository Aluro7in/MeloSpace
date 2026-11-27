/** Note name <-> MIDI helpers and the one-octave piano layout (C4–C5). */
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export function noteNameToMidi(name: string): number {
  const m = /^([A-G])(#?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`Invalid note name: ${name}`);
  const idx = NOTE_NAMES.indexOf((m[1] + m[2]) as (typeof NOTE_NAMES)[number]);
  if (idx < 0) throw new Error(`Invalid note name: ${name}`);
  return (parseInt(m[3], 10) + 1) * 12 + idx; // C4 = 60, A4 = 69
}

export function midiToNoteName(midi: number): string {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export interface PianoKeyDef {
  /** Stable identifier, e.g. "key-C4", "key-C#4". */
  id: string;
  note: string;
  midi: number;
  isBlack: boolean;
  /** White keys: index among white keys. Black keys: index of the white key they sit after. */
  whiteIndex: number;
}

const WHITE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const BLACK_AFTER: Record<string, string> = {
  C4: 'C#4', D4: 'D#4', F4: 'F#4', G4: 'G#4', A4: 'A#4',
};

export const PIANO_KEYS: readonly PianoKeyDef[] = (() => {
  const keys: PianoKeyDef[] = [];
  WHITE.forEach((note, i) => {
    keys.push({ id: `key-${note}`, note, midi: noteNameToMidi(note), isBlack: false, whiteIndex: i });
    const b = BLACK_AFTER[note];
    if (b) keys.push({ id: `key-${b}`, note: b, midi: noteNameToMidi(b), isBlack: true, whiteIndex: i });
  });
  return keys;
})();

export const keyByMidi = (midi: number) => PIANO_KEYS.find((k) => k.midi === midi);
export const keyByNote = (note: string) => PIANO_KEYS.find((k) => k.note === note);
export const isPianoNote = (note: string) => PIANO_KEYS.some((k) => k.note === note);
