import { getLesson, LESSONS } from '../lesson/lessons';
import type { AudioEngine } from '../audio/audio-engine';
import type { Metronome } from '../audio/metronome';
import { validateToolCall } from '../tutor/tools';
import type { LessonSession } from './lesson-session';
import type { Store } from './store';

export interface ToolOutcome { ok: boolean; result?: unknown; error?: string }

/** Executes validated tutor tool calls against REAL application state. */
export class Dispatcher {
  constructor(private store: Store, private session: LessonSession, private audio: AudioEngine, private metronome: Metronome) {}

  async execute(name: unknown, args: unknown): Promise<ToolOutcome> {
    const v = validateToolCall(name, args); // client re-validates; never trust the wire
    if (!v.ok) return { ok: false, error: v.error };
    const a = v.args as Record<string, any>;
    const s = this.store.state;
    switch (v.name) {
      case 'select_instrument':
        if (a.instrument !== 'piano') return { ok: false, error: `${a.instrument} is not available yet. Only piano is playable.` };
        this.store.set({ instrumentId: 'piano' });
        return { ok: true, result: { instrument: 'piano' } };
      case 'start_lesson':
        this.session.select(a.lessonId);
        return { ok: true, result: { lessonId: a.lessonId, phase: this.store.state.lessonPhase } };
      case 'set_tempo':
        this.store.set({ tempo: a.bpm });
        this.metronome.setBpm(a.bpm);
        return { ok: true, result: { bpm: a.bpm } };
      case 'highlight_notes':
        this.session.highlight(a.notes);
        return { ok: true, result: { highlighted: this.store.state.highlighted } };
      case 'play_reference': {
        if (a.lessonId && a.lessonId !== s.lessonId) this.session.select(a.lessonId);
        if (!this.store.state.lessonId) return { ok: false, error: 'No active lesson. Start a lesson first.' };
        await this.session.playReference();
        return { ok: true, result: { playing: this.store.state.lessonId } };
      }
      case 'toggle_metronome': {
        const on = typeof a.enabled === 'boolean' ? a.enabled : !s.metronomeOn;
        await this.audio.ensureStarted();
        this.metronome.setBpm(s.tempo);
        on ? this.metronome.start() : this.metronome.stop();
        this.store.set({ metronomeOn: on });
        return { ok: true, result: { metronomeOn: on, bpm: s.tempo } };
      }
      case 'start_practice': {
        if (a.lessonId && a.lessonId !== s.lessonId) this.session.select(a.lessonId);
        if (!this.store.state.lessonId) return { ok: false, error: 'No active lesson. Start a lesson first.' };
        await this.session.startPractice();
        return { ok: true, result: { practicing: this.store.state.lessonId, firstNote: this.store.state.highlighted[0] } };
      }
      case 'stop_practice':
        return this.session.stopPractice()
          ? { ok: true, result: this.store.state.currentResult }
          : { ok: false, error: 'No practice session is active.' };
      case 'get_practice_result': {
        const r = s.currentResult;
        if (r) return { ok: true, result: r };
        const last = s.history[s.history.length - 1];
        return last ? { ok: true, result: last } : { ok: false, error: 'No practice result exists yet.' };
      }
      case 'recommend_next_lesson':
        return { ok: true, result: this.recommend() };
    }
  }

  recommend() {
    const h = this.store.state.history;
    const done = new Set(h.filter((r) => r.completed).map((r) => r.lessonId));
    const last = h[h.length - 1];
    let pick = last && !last.completed ? getLesson(last.lessonId) : undefined; // retry unfinished
    if (!pick) pick = LESSONS.find((l) => !done.has(l.id));
    return pick
      ? { lessonId: pick.id, title: pick.title, reason: last && !last.completed && last.lessonId === pick.id ? 'Retry to complete it' : 'Next lesson you have not completed' }
      : { lessonId: null, reason: 'All lessons completed' };
  }
}
