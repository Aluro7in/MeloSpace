import { describe, expect, it } from 'vitest';
import { evaluate } from '../src/lesson/evaluator';
import { getLesson, LESSONS } from '../src/lesson/lessons';
import { noteNameToMidi } from '../src/music/notes';

const lesson = getLesson('piano-first-five')!; // 72 BPM => 0.8333 s/beat, tol 300ms
const spb = 60 / lesson.bpm;
const ev = (note: string, beat: number, offsetSec = 0, t0 = 10) => ({ midi: noteNameToMidi(note), time: t0 + beat * spb + offsetSec });
const perfect = ['C4', 'D4', 'E4', 'F4', 'G4'].map((n, i) => ev(n, i));

describe('evaluator (deterministic)', () => {
  it('perfect run: completed, score 100, timing 1', () => {
    const r = evaluate(lesson, perfect, { finalize: true });
    expect(r).toMatchObject({ completed: true, score: 100, correctNotes: 5, incorrectNotes: 0, missedNotes: 0, timingAccuracy: 1 });
    expect(r.recommendedNextStep).toContain('piano-up-and-down');
  });
  it('is repeatable', () => {
    expect(evaluate(lesson, perfect, { finalize: true })).toEqual(evaluate(lesson, perfect, { finalize: true }));
  });
  it('anchored timing: starting late overall is not penalised', () => {
    const r = evaluate(lesson, perfect.map((e) => ({ ...e, time: e.time + 5 })), { finalize: true });
    expect(r.score).toBe(100);
  });
  it('wrong key: counted, does not advance, then recovery completes', () => {
    const events = [ev('C4', 0), { midi: noteNameToMidi('A4'), time: 10.9 }, ev('D4', 1), ev('E4', 2), ev('F4', 3), ev('G4', 4)];
    const r = evaluate(lesson, events, { finalize: true });
    expect(r.incorrectNotes).toBe(1);
    expect(r.unexpected[0]).toMatchObject({ note: 'A4', expectedNote: 'D4' });
    expect(r.score).toBe(97);
    expect(r.completed).toBe(true);
  });
  it('late note flagged late and scored 0.5', () => {
    const events = perfect.map((e, i) => (i === 2 ? { ...e, time: e.time + 0.5 } : e));
    const r = evaluate(lesson, events, { finalize: true });
    expect(r.notes[2].status).toBe('late');
    expect(r.notes[2].deltaMs).toBe(500);
    expect(r.notes[3].status).toBe('early'); // next note arrives sooner relative to the late one
    expect(r.score).toBe(80);
    expect(r.timingAccuracy).toBe(0.6);
  });
  it('steady learner at a slower pace is not penalised for drift, but a far slower pace is', () => {
    const slow = (k: number) => ['C4', 'D4', 'E4', 'F4', 'G4'].map((n, i) => ({ midi: noteNameToMidi(n), time: 10 + i * spb * k }));
    expect(evaluate(lesson, slow(1.3), { finalize: true })).toMatchObject({ completed: true, score: 100 });
    expect(evaluate(lesson, slow(1.6), { finalize: true }).timingAccuracy).toBeLessThan(0.5);
  });
  it('early note flagged early', () => {
    const events = perfect.map((e, i) => (i === 3 ? { ...e, time: e.time - 0.5 } : e));
    expect(evaluate(lesson, events, { finalize: true }).notes[3].status).toBe('early');
  });
  it('missing notes: counted missed, not completed', () => {
    const r = evaluate(lesson, perfect.slice(0, 3), { finalize: true });
    expect(r).toMatchObject({ correctNotes: 3, missedNotes: 2, completed: false, score: 60 });
    expect(r.lastFeedback).toContain('missed 2');
  });
  it('non-final evaluation never counts missed notes', () => {
    const r = evaluate(lesson, perfect.slice(0, 2), { finalize: false });
    expect(r.missedNotes).toBe(0);
    expect(r.finalized).toBe(false);
  });
  it('empty attempt scores 0', () => {
    expect(evaluate(lesson, [], { finalize: true })).toMatchObject({ score: 0, completed: false, missedNotes: 5 });
  });
  it('first lesson is exactly C4 D4 E4 F4 G4', () => {
    expect(lesson.notes.map((n) => n.note)).toEqual(['C4', 'D4', 'E4', 'F4', 'G4']);
  });
  it('every catalogue lesson can be completed perfectly', () => {
    for (const l of LESSONS) {
      const evs = l.notes.map((n) => ({ midi: noteNameToMidi(n.note), time: 5 + n.startBeat * (60 / l.bpm) }));
      expect(evaluate(l, evs, { finalize: true }).completed).toBe(true);
    }
  });
});
