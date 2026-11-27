import { evaluate } from '../lesson/evaluator';
import { getLesson } from '../lesson/lessons';
import type { Lesson } from '../lesson/types';
import { keyByNote, noteNameToMidi } from '../music/notes';
import type { AudioEngine } from '../audio/audio-engine';
import type { Store } from './store';
import type { NoteOnEvent } from '../lesson/types';

/** Drives a lesson: intro -> reference -> practice -> result. Scoring is local and deterministic. */
export class LessonSession {
  private events: NoteOnEvent[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private store: Store, private audio: AudioEngine) {}

  get lesson(): Lesson | undefined {
    const id = this.store.state.lessonId;
    return id ? getLesson(id) : undefined;
  }

  /** Lesson with the learner-selected tempo applied. */
  private effective(): Lesson | undefined {
    const l = this.lesson;
    return l ? { ...l, bpm: this.store.state.tempo } : undefined;
  }

  select(lessonId: string): boolean {
    const l = getLesson(lessonId);
    if (!l) return false;
    this.clearTimers();
    this.events = [];
    this.store.set({
      lessonId, lessonPhase: 'intro', tempo: l.bpm, targetIndex: 0, highlighted: [],
      currentResult: null, feedback: 'Press "Hear example", then "Start practice".', destination: 'learn',
    });
    return true;
  }

  async playReference(): Promise<boolean> {
    const l = this.effective();
    if (!l) return false;
    await this.audio.ensureStarted();
    this.clearTimers();
    const spb = 60 / l.bpm;
    const ref = l.reference ?? l.notes;
    const start = this.audio.now + 0.15;
    this.audio.schedule(ref.map((n) => ({ midi: noteNameToMidi(n.note), startSec: n.startBeat * spb, durationSec: n.durationBeats * spb * 0.9 })), start);
    this.store.set({ lessonPhase: 'reference', feedback: 'Listen to the example...' });
    // Display-only highlighting; audio itself is scheduled on the audio clock above.
    ref.forEach((n) => {
      this.timers.push(setTimeout(() => this.store.set({ highlighted: [n.note] }), (0.15 + n.startBeat * spb) * 1000));
    });
    const endMs = (0.15 + Math.max(...ref.map((n) => n.startBeat + n.durationBeats)) * spb) * 1000;
    this.timers.push(setTimeout(() => {
      if (this.store.state.lessonPhase === 'reference') this.store.set({ lessonPhase: 'intro', highlighted: [], feedback: 'Your turn - press Start Practice.' });
    }, endMs));
    return true;
  }

  async startPractice(): Promise<boolean> {
    const l = this.effective();
    if (!l) return false;
    await this.audio.ensureStarted();
    this.clearTimers();
    this.events = [];
    this.store.set({
      lessonPhase: 'practice', targetIndex: 0, highlighted: [l.notes[0].note],
      currentResult: null, feedback: `Play ${l.notes[0].note}.`,
    });
    return true;
  }

  /** Called with every real piano note-on (audio-clock timestamp). */
  handleNoteOn(midi: number, time: number): void {
    if (this.store.state.lessonPhase !== 'practice') return;
    const l = this.effective();
    if (!l) return;
    this.events.push({ midi, time });
    const r = evaluate(l, this.events, { finalize: false });
    const next = r.correctNotes;
    if (next >= l.notes.length) { this.finish(); return; }
    this.store.set({ targetIndex: next, highlighted: [l.notes[next].note], feedback: r.lastFeedback });
  }

  stopPractice(): boolean {
    if (this.store.state.lessonPhase !== 'practice') return false;
    this.finish();
    return true;
  }

  private finish() {
    const l = this.effective();
    if (!l) return;
    const result = evaluate(l, this.events, { finalize: true });
    this.store.addRecord({
      lessonId: l.id, at: Date.now(), score: result.score, completed: result.completed,
      timingAccuracy: result.timingAccuracy, correctNotes: result.correctNotes,
      incorrectNotes: result.incorrectNotes, missedNotes: result.missedNotes,
    });
    this.store.set({ lessonPhase: 'result', currentResult: result, highlighted: [], feedback: result.lastFeedback });
  }

  retry() { return this.startPractice(); }

  highlight(notes: string[]) {
    this.store.set({ highlighted: notes.filter((n) => keyByNote(n)) });
  }

  clearTimers() { this.timers.forEach(clearTimeout); this.timers = []; }
  dispose() { this.clearTimers(); }
}
