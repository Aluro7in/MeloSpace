import { describe, expect, it } from 'vitest';
import { validateToolCall } from '../src/tutor/tools';
import { handleTurn } from '../server/tutor-core';
import { Store } from '../src/app/store';
import { Dispatcher } from '../src/app/dispatcher';
import { LessonSession } from '../src/app/lesson-session';
import { AudioEngine } from '../src/audio/audio-engine';
import { Metronome } from '../src/audio/metronome';

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

describe('tool validation', () => {
  it('accepts valid calls', () => {
    expect(validateToolCall('set_tempo', { bpm: 60 }).ok).toBe(true);
    expect(validateToolCall('start_lesson', { lessonId: 'piano-first-five' }).ok).toBe(true);
    expect(validateToolCall('highlight_notes', { notes: ['C4', 'F#4'] }).ok).toBe(true);
  });
  it('rejects unknown tool, unknown lesson, bad tempo, bad notes, extra args', () => {
    expect(validateToolCall('run_code', {}).ok).toBe(false);
    expect(validateToolCall('start_lesson', { lessonId: 'nope' }).ok).toBe(false);
    expect(validateToolCall('set_tempo', { bpm: 400 }).ok).toBe(false);
    expect(validateToolCall('set_tempo', { bpm: 10 }).ok).toBe(false);
    expect(validateToolCall('set_tempo', { bpm: 60.5 }).ok).toBe(false);
    expect(validateToolCall('highlight_notes', { notes: ['H9'] }).ok).toBe(false);
    expect(validateToolCall('stop_practice', { x: 1 }).ok).toBe(false);
  });
});

describe('server handleTurn (mock Gemini)', () => {
  const mk = (parts: unknown[], ok = true) => (async () => ({ ok, status: ok ? 200 : 500, json: async () => ({ candidates: [{ content: { parts } }] }) })) as unknown as typeof fetch;
  const body = { contents: [{ role: 'user', parts: [{ text: 'hi' }] }], context: {} };
  it('returns validated tool calls and rejects invalid ones', async () => {
    const r = await handleTurn(body, { apiKey: 'k', model: 'm', fetchImpl: mk([{ functionCall: { name: 'set_tempo', args: { bpm: 50 } } }, { functionCall: { name: 'delete_all', args: {} } }]) });
    expect(r.type).toBe('tool_calls');
    if (r.type === 'tool_calls') { expect(r.calls).toHaveLength(1); expect(r.rejected[0].name).toBe('delete_all'); }
  });
  it('returns text', async () => {
    const r = await handleTurn(body, { apiKey: 'k', model: 'm', fetchImpl: mk([{ text: 'Hello' }]) });
    expect(r).toMatchObject({ type: 'text', text: 'Hello' });
  });
  it('errors without key / on Gemini failure / bad body', async () => {
    expect((await handleTurn(body, { apiKey: undefined, model: 'm' })).type).toBe('error');
    expect((await handleTurn(body, { apiKey: 'k', model: 'm', fetchImpl: mk([], false) })).type).toBe('error');
    expect((await handleTurn({ nope: 1 }, { apiKey: 'k', model: 'm' })).type).toBe('error');
  });
});

describe('Dispatcher against real state', () => {
  const setup = () => {
    const store = new Store(mem());
    const audio = new AudioEngine();
    const metro = new Metronome(() => audio.ctx, () => audio.output);
    const session = new LessonSession(store, audio);
    return { store, d: new Dispatcher(store, session, audio, metro) };
  };
  it('start_lesson / set_tempo change real state', async () => {
    const { store, d } = setup();
    expect((await d.execute('start_lesson', { lessonId: 'piano-first-five' })).ok).toBe(true);
    expect(store.state).toMatchObject({ lessonId: 'piano-first-five', lessonPhase: 'intro', destination: 'learn' });
    await d.execute('set_tempo', { bpm: 55 });
    expect(store.state.tempo).toBe(55);
  });
  it('errors are real: unknown lesson, no result, other instruments', async () => {
    const { d } = setup();
    expect((await d.execute('start_lesson', { lessonId: 'zzz' })).ok).toBe(false);
    expect((await d.execute('get_practice_result', {})).ok).toBe(false);
    expect((await d.execute('select_instrument', { instrument: 'guitar' })).ok).toBe(false);
    expect((await d.execute('stop_practice', {})).ok).toBe(false);
  });
  it('recommend_next_lesson uses catalogue', async () => {
    const { d } = setup();
    expect((await d.execute('recommend_next_lesson', {})).result).toMatchObject({ lessonId: 'piano-first-five' });
  });
});
