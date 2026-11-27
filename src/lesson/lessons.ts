import type { Lesson } from './types';

/** Lessons are pure data: add an entry here and the engine can run it. */
export const LESSONS: readonly Lesson[] = [
  {
    id: 'piano-first-five',
    title: 'Your First Five Notes',
    instrumentId: 'piano',
    difficulty: 'beginner',
    objective: 'Find C, D, E, F and G and play them in order with a steady pulse.',
    bpm: 72,
    timingToleranceMs: 300,
    notes: [
      { note: 'C4', startBeat: 0, durationBeats: 1 },
      { note: 'D4', startBeat: 1, durationBeats: 1 },
      { note: 'E4', startBeat: 2, durationBeats: 1 },
      { note: 'F4', startBeat: 3, durationBeats: 1 },
      { note: 'G4', startBeat: 4, durationBeats: 1 },
    ],
    instructions: [
      'C4 is the white key just left of the two black keys.',
      'Listen to the example, then play each highlighted key in order.',
      'Try to play one note per beat.',
    ],
    completion: { minScore: 60, requireAllNotes: true },
    nextLessonId: 'piano-up-and-down',
  },
  {
    id: 'piano-up-and-down',
    title: 'Up and Back Down',
    instrumentId: 'piano',
    difficulty: 'beginner',
    objective: 'Repeat a phrase: climb from C to G and come back down.',
    bpm: 72,
    timingToleranceMs: 280,
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4', 'C4'].map((note, i) => ({
      note, startBeat: i, durationBeats: 1,
    })),
    instructions: [
      'Play the five notes up, then retrace them back down.',
      'The top note G4 is played once.',
    ],
    completion: { minScore: 65, requireAllNotes: true },
    nextLessonId: 'piano-simple-rhythm',
  },
  {
    id: 'piano-simple-rhythm',
    title: 'Simple Rhythm: Repeated Notes',
    instrumentId: 'piano',
    difficulty: 'elementary',
    objective: 'Play a simple tune with repeated notes and a longer final note.',
    bpm: 80,
    timingToleranceMs: 260,
    notes: [
      { note: 'C4', startBeat: 0, durationBeats: 1 },
      { note: 'C4', startBeat: 1, durationBeats: 1 },
      { note: 'G4', startBeat: 2, durationBeats: 1 },
      { note: 'G4', startBeat: 3, durationBeats: 1 },
      { note: 'A4', startBeat: 4, durationBeats: 1 },
      { note: 'A4', startBeat: 5, durationBeats: 1 },
      { note: 'G4', startBeat: 6, durationBeats: 2 },
    ],
    instructions: [
      'Repeat each key twice: release, then press again.',
      'Hold the last G4 a little longer.',
    ],
    completion: { minScore: 70, requireAllNotes: true },
  },
];

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonIds = () => LESSONS.map((l) => l.id);
