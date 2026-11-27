import type { PracticeResult } from '../lesson/types';

export type Destination = 'studio' | 'learn' | 'play' | 'create' | 'progress';
export type LessonPhase = 'idle' | 'intro' | 'reference' | 'practice' | 'result';

export interface PracticeRecord {
  lessonId: string;
  at: number;
  score: number;
  completed: boolean;
  timingAccuracy: number;
  correctNotes: number;
  incorrectNotes: number;
  missedNotes: number;
}

export interface AppState {
  destination: Destination;
  instrumentId: 'piano';
  tempo: number;
  volume: number;
  metronomeOn: boolean;
  lessonId: string | null;
  lessonPhase: LessonPhase;
  /** Index of the next target note during practice. */
  targetIndex: number;
  highlighted: string[];
  feedback: string;
  currentResult: PracticeResult | null;
  history: PracticeRecord[];
  tutorStatus: 'idle' | 'thinking' | 'unavailable';
  tutorMessage: string;
  audioStatus: string;
}

const KEY = 'melospace.history.v1';

export class Store {
  state: AppState;
  private subs = new Set<(s: AppState) => void>();

  constructor(private storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = safeStorage()) {
    this.state = {
      destination: 'studio', instrumentId: 'piano', tempo: 72, volume: 0.8, metronomeOn: false,
      lessonId: null, lessonPhase: 'idle', targetIndex: 0, highlighted: [], feedback: '',
      currentResult: null, history: this.loadHistory(), tutorStatus: 'idle',
      tutorMessage: 'Hi! Ask me to start a lesson, slow down, or explain your result.',
      audioStatus: 'Audio starts on your first tap.',
    };
  }

  private loadHistory(): PracticeRecord[] {
    try { const raw = this.storage?.getItem(KEY); return raw ? (JSON.parse(raw) as PracticeRecord[]) : []; }
    catch { return []; }
  }

  set(patch: Partial<AppState>) {
    this.state = { ...this.state, ...patch };
    this.subs.forEach((f) => f(this.state));
  }

  addRecord(r: PracticeRecord) {
    const history = [...this.state.history, r].slice(-200);
    try { this.storage?.setItem(KEY, JSON.stringify(history)); } catch { /* storage unavailable: keep in memory */ }
    this.set({ history });
  }

  subscribe(f: (s: AppState) => void) { this.subs.add(f); return () => this.subs.delete(f); }
}

function safeStorage() {
  try { return typeof localStorage !== 'undefined' ? localStorage : undefined; } catch { return undefined; }
}
