import type { Dispatcher } from '../app/dispatcher';
import type { Store } from '../app/store';
import { buildTutorContext } from './context';

type Content = { role: 'user' | 'model'; parts: any[] };

/** Client loop: message -> server(Gemini) -> validated tool calls -> Dispatcher -> real results -> Gemini -> text. */
export class TutorClient {
  private history: Content[] = [];
  constructor(private store: Store, private dispatcher: Dispatcher, private endpoint = (import.meta.env?.VITE_TUTOR_URL as string | undefined) ?? 'http://localhost:8787') {}

  async send(message: string): Promise<void> {
    this.store.set({ tutorStatus: 'thinking' });
    let contents: Content[] = [...this.history, { role: 'user', parts: [{ text: message.slice(0, 500) }] }];
    try {
      for (let step = 0; step < 4; step++) {
        const res = await fetch(`${this.endpoint}/api/tutor/turn`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ contents, context: buildTutorContext(this.store.state) }),
        });
        const out = await res.json();
        if (!res.ok || out.type === 'error') throw new Error(out?.error ?? `HTTP ${res.status}`);
        contents = out.contents;
        if (out.type === 'text') {
          this.history = contents.slice(-20);
          this.store.set({ tutorStatus: 'idle', tutorMessage: out.text || 'Done.' });
          return;
        }
        const responses: any[] = [];
        for (const c of out.calls) {
          const r = await this.dispatcher.execute(c.name, c.args);
          responses.push({ functionResponse: { name: c.name, response: r.ok ? { ok: true, result: r.result ?? null } : { ok: false, error: r.error } } });
        }
        for (const rj of out.rejected) responses.push({ functionResponse: { name: rj.name, response: { ok: false, error: rj.error } } });
        contents = [...contents, { role: 'user', parts: responses }];
      }
      this.store.set({ tutorStatus: 'idle', tutorMessage: 'I did what I could — check the studio.' });
    } catch {
      this.store.set({ tutorStatus: 'unavailable', tutorMessage: 'The tutor is unavailable right now. Piano, lessons and scoring still work.' });
    }
  }
}
