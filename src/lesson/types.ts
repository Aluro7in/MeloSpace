export interface LessonNote {
  note: string;          // e.g. "C4"
  startBeat: number;     // beats from lesson start
  durationBeats: number;
}

export interface LessonCompletion {
  /** Minimum score (0-100) required to mark the lesson completed. */
  minScore: number;
  /** All notes must be matched in order. */
  requireAllNotes: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  instrumentId: 'piano';
  difficulty: 'beginner' | 'elementary';
  objective: string;
  bpm: number;
  notes: LessonNote[];
  instructions: string[];
  /** Notes played in the reference demonstration (defaults to `notes`). */
  reference?: LessonNote[];
  /** Timing tolerance in milliseconds, configurable per lesson. */
  timingToleranceMs: number;
  completion: LessonCompletion;
  nextLessonId?: string;
}

export interface NoteOnEvent {
  midi: number;
  /** Seconds on the AudioContext clock (performance timestamp, not display time). */
  time: number;
}

export type NoteStatus = 'pending' | 'correct' | 'early' | 'late' | 'missed';

export interface NoteReport {
  index: number;
  expectedNote: string;
  status: NoteStatus;
  /** actual - expected, ms (negative = early). Undefined if not matched. */
  deltaMs?: number;
}

export interface UnexpectedNote {
  midi: number;
  note: string;
  expectedNote: string;
  time: number;
}

export interface PracticeResult {
  lessonId: string;
  totalNotes: number;
  correctNotes: number;       // right key played in sequence (any timing)
  incorrectNotes: number;     // wrong keys pressed
  missedNotes: number;        // expected notes never played (only counted when finalized)
  timingAccuracy: number;     // 0..1 — share of matched notes within tolerance
  completed: boolean;
  score: number;              // 0..100, deterministic
  recommendedNextStep: string;
  notes: NoteReport[];
  unexpected: UnexpectedNote[];
  finalized: boolean;
  /** Plain-language feedback for the most recent event. */
  lastFeedback: string;
}
