/**
 * Device-independent piano input state. XR pointer events (ray, gaze+pinch, poke)
 * are translated into press/release calls; this class guarantees:
 *  - one note-on per key regardless of how many pointers hold it (no duplicates)
 *  - note-off only when the last holder releases
 *  - releaseAll() for tracking loss / session end (no stuck notes)
 */
export interface PianoListener {
  noteOn(midi: number, keyId: string): void;
  noteOff(midi: number, keyId: string): void;
}

export class PianoInput {
  private holders = new Map<string, Set<number>>();
  private pointerKey = new Map<number, string>();
  constructor(private keyMidi: (keyId: string) => number | undefined, private l: PianoListener) {}

  get heldKeys(): string[] { return [...this.holders.keys()]; }

  press(keyId: string, pointerId: number): void {
    const midi = this.keyMidi(keyId);
    if (midi === undefined) return;
    const prev = this.pointerKey.get(pointerId);
    if (prev === keyId) return; // duplicate pointerdown
    if (prev) this.release(pointerId);
    this.pointerKey.set(pointerId, keyId);
    let set = this.holders.get(keyId);
    if (!set) { set = new Set(); this.holders.set(keyId, set); }
    const wasEmpty = set.size === 0;
    set.add(pointerId);
    if (wasEmpty) this.l.noteOn(midi, keyId);
  }

  release(pointerId: number): void {
    const keyId = this.pointerKey.get(pointerId);
    if (!keyId) return;
    this.pointerKey.delete(pointerId);
    const set = this.holders.get(keyId);
    if (!set) return;
    set.delete(pointerId);
    if (set.size === 0) {
      this.holders.delete(keyId);
      const midi = this.keyMidi(keyId);
      if (midi !== undefined) this.l.noteOff(midi, keyId);
    }
  }

  releaseAll(): void {
    for (const pid of [...this.pointerKey.keys()]) this.release(pid);
  }
}
