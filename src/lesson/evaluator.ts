import { midiToNoteName, noteNameToMidi } from '../music/notes';
import type { Lesson, NoteOnEvent, NoteReport, PracticeResult, UnexpectedNote } from './types';

export interface EvaluateOptions {
  /** When true, expected notes not yet played are counted as missed. */
  finalize: boolean;
}

/**
 * Deterministic practice evaluation. Same lesson + same events => same result.
 *
 * Matching: expected notes are worked through in order. A note-on with the expected
 * pitch advances the sequence; any other pitch is an "unexpected" (wrong-key) event
 * and does not advance it.
 *
 * Timing: interval-based. The first correct note starts the exercise (delta 0). Each later
 * matched note is judged by the spacing from the previous matched note against the expected
 * spacing: delta = (t - tPrev) - (beat - beatPrev) * 60/bpm. This judges rhythm, not reaction
 * speed, and does not accumulate drift for a steady learner at a slightly different pace.
 *
 * Score: within tolerance = 1 point, matched outside tolerance = 0.5, missed = 0;
 * base = points/N*100; minus 3 per wrong key (max 30); floored at 0.
 */
export function evaluate(lesson: Lesson, events: readonly NoteOnEvent[], opts: EvaluateOptions): PracticeResult {
  const expected = lesson.notes;
  const secPerBeat = 60 / lesson.bpm;
  const tolSec = lesson.timingToleranceMs / 1000;
  const notes: NoteReport[] = expected.map((n, i) => ({ index: i, expectedNote: n.note, status: 'pending' }));
  const unexpected: UnexpectedNote[] = [];
  let extra = 0;
  let pointer = 0;
  let prev: { time: number; beat: number } | undefined;
  let lastFeedback = 'Ready when you are.';

  for (const ev of events) {
    if (pointer >= expected.length) {
      extra++;
      lastFeedback = 'Exercise already complete.';
      continue;
    }
    const exp = expected[pointer];
    if (ev.midi === noteNameToMidi(exp.note)) {
      const delta = prev ? ev.time - prev.time - (exp.startBeat - prev.beat) * secPerBeat : 0;
      prev = { time: ev.time, beat: exp.startBeat };
      let status: NoteReport['status'] = 'correct';
      if (delta < -tolSec) status = 'early';
      else if (delta > tolSec) status = 'late';
      notes[pointer] = { index: pointer, expectedNote: exp.note, status, deltaMs: Math.round(delta * 1000) };
      lastFeedback =
        status === 'correct' ? `Correct - ${exp.note}!`
        : status === 'early' ? 'Right note, a little early.'
        : 'Right note, a little late.';
      pointer++;
    } else {
      unexpected.push({ midi: ev.midi, note: midiToNoteName(ev.midi), expectedNote: exp.note, time: ev.time });
      lastFeedback = `That was ${midiToNoteName(ev.midi)}. Look for ${exp.note}.`;
    }
  }
  void extra;

  if (opts.finalize) {
    for (let i = pointer; i < expected.length; i++) {
      notes[i] = { index: i, expectedNote: expected[i].note, status: 'missed' };
    }
  }

  const matched = notes.filter((n) => n.status === 'correct' || n.status === 'early' || n.status === 'late');
  const within = notes.filter((n) => n.status === 'correct').length;
  const missed = notes.filter((n) => n.status === 'missed').length;
  const points = within + 0.5 * (matched.length - within);
  const base = (points / expected.length) * 100;
  const penalty = Math.min(30, 3 * unexpected.length);
  const score = Math.max(0, Math.round(base - penalty));
  const timingAccuracy = matched.length === 0 ? 0 : Math.round((within / matched.length) * 1000) / 1000;
  const allMatched = matched.length === expected.length;
  const completed = opts.finalize && allMatched && score >= lesson.completion.minScore;

  if (opts.finalize) {
    lastFeedback = completed ? 'Exercise completed - well done!'
      : allMatched ? 'All notes played - tighten the rhythm and try again.'
      : `You missed ${missed} note${missed === 1 ? '' : 's'}. Try again.`;
  }

  const recommendedNextStep = !opts.finalize ? 'Keep going.'
    : completed ? (lesson.nextLessonId ? `Next lesson: ${lesson.nextLessonId}` : 'Lesson set complete - replay for accuracy.')
    : `Retry ${lesson.id}, perhaps at a slower tempo.`;

  return {
    lessonId: lesson.id,
    totalNotes: expected.length,
    correctNotes: matched.length,
    incorrectNotes: unexpected.length,
    missedNotes: missed,
    timingAccuracy,
    completed,
    score,
    recommendedNextStep,
    notes,
    unexpected,
    finalized: opts.finalize,
    lastFeedback,
  };
}
