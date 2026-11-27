import { LESSONS, getLesson } from '../lesson/lessons';
import type { AppState } from '../app/store';

/** Only the relevant context is shared with the tutor — no unrelated user data. */
export function buildTutorContext(s: AppState) {
  const l = s.lessonId ? getLesson(s.lessonId) : undefined;
  return {
    instrument: s.instrumentId,
    tempo: s.tempo,
    metronomeOn: s.metronomeOn,
    lessonPhase: s.lessonPhase,
    activeLesson: l ? { id: l.id, title: l.title, difficulty: l.difficulty, notes: l.notes.map((n) => n.note) } : null,
    targetNote: s.highlighted[0] ?? null,
    latestResult: s.currentResult
      ? { lessonId: s.currentResult.lessonId, score: s.currentResult.score, completed: s.currentResult.completed,
          correctNotes: s.currentResult.correctNotes, incorrectNotes: s.currentResult.incorrectNotes,
          missedNotes: s.currentResult.missedNotes, timingAccuracy: s.currentResult.timingAccuracy }
      : null,
    catalogue: LESSONS.map((x) => ({ id: x.id, title: x.title, difficulty: x.difficulty })),
  };
}
export type TutorContext = ReturnType<typeof buildTutorContext>;
