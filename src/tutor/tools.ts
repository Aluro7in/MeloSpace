import { z } from 'zod';
import { lessonIds } from '../lesson/lessons';
import { isPianoNote } from '../music/notes';

/** Explicit allowlist. Anything else is rejected before reaching the app. */
export const TOOL_NAMES = [
  'select_instrument', 'start_lesson', 'set_tempo', 'highlight_notes', 'play_reference',
  'toggle_metronome', 'start_practice', 'stop_practice', 'get_practice_result', 'recommend_next_lesson',
] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

export const TEMPO_MIN = 40;
export const TEMPO_MAX = 160;

const lessonId = z.string().refine((v) => lessonIds().includes(v), { message: 'Unknown lessonId' });
const note = z.string().refine(isPianoNote, { message: 'Note must be one of C4–C5 (e.g. "C4", "F#4")' });

export const toolSchemas = {
  select_instrument: z.object({ instrument: z.enum(['piano', 'guitar', 'bass', 'drums']) }).strict(),
  start_lesson: z.object({ lessonId }).strict(),
  set_tempo: z.object({ bpm: z.number().int().min(TEMPO_MIN).max(TEMPO_MAX) }).strict(),
  highlight_notes: z.object({ notes: z.array(note).min(1).max(13) }).strict(),
  play_reference: z.object({ lessonId: lessonId.optional() }).strict(),
  toggle_metronome: z.object({ enabled: z.boolean().optional() }).strict(),
  start_practice: z.object({ lessonId: lessonId.optional() }).strict(),
  stop_practice: z.object({}).strict(),
  get_practice_result: z.object({}).strict(),
  recommend_next_lesson: z.object({}).strict(),
} satisfies Record<ToolName, z.ZodTypeAny>;

export type ValidatedCall =
  | { ok: true; name: ToolName; args: Record<string, unknown> }
  | { ok: false; name: string; error: string };

export function validateToolCall(name: unknown, args: unknown): ValidatedCall {
  if (typeof name !== 'string' || !(TOOL_NAMES as readonly string[]).includes(name)) {
    return { ok: false, name: String(name), error: `Tool not allowed: ${String(name)}` };
  }
  const parsed = toolSchemas[name as ToolName].safeParse(args ?? {});
  if (!parsed.success) {
    return { ok: false, name, error: parsed.error.issues.map((i) => `${i.path.join('.') || 'args'}: ${i.message}`).join('; ') };
  }
  return { ok: true, name: name as ToolName, args: parsed.data as Record<string, unknown> };
}

/** Gemini function declarations (OpenAPI-subset schema). */
export const geminiFunctionDeclarations = [
  { name: 'select_instrument', description: 'Select an instrument. Only "piano" is currently playable.',
    parameters: { type: 'object', properties: { instrument: { type: 'string', enum: ['piano', 'guitar', 'bass', 'drums'] } }, required: ['instrument'] } },
  { name: 'start_lesson', description: 'Open an existing lesson by id.',
    parameters: { type: 'object', properties: { lessonId: { type: 'string', enum: lessonIds() } }, required: ['lessonId'] } },
  { name: 'set_tempo', description: `Set lesson/metronome tempo in BPM (${TEMPO_MIN}-${TEMPO_MAX}).`,
    parameters: { type: 'object', properties: { bpm: { type: 'integer', minimum: TEMPO_MIN, maximum: TEMPO_MAX } }, required: ['bpm'] } },
  { name: 'highlight_notes', description: 'Highlight piano keys (C4–C5 note names such as "C4", "F#4").',
    parameters: { type: 'object', properties: { notes: { type: 'array', items: { type: 'string' } } }, required: ['notes'] } },
  { name: 'play_reference', description: 'Play the reference demonstration of a lesson (defaults to the active lesson).',
    parameters: { type: 'object', properties: { lessonId: { type: 'string', enum: lessonIds() } } } },
  { name: 'toggle_metronome', description: 'Turn the metronome on or off. Omit "enabled" to toggle.',
    parameters: { type: 'object', properties: { enabled: { type: 'boolean' } } } },
  { name: 'start_practice', description: 'Start a practice attempt for the active (or given) lesson.',
    parameters: { type: 'object', properties: { lessonId: { type: 'string', enum: lessonIds() } } } },
  { name: 'stop_practice', description: 'Stop the active practice attempt and score it.', parameters: { type: 'object', properties: {} } },
  { name: 'get_practice_result', description: 'Return the learner\'s actual latest practice result. Never guess results.', parameters: { type: 'object', properties: {} } },
  { name: 'recommend_next_lesson', description: 'Return the recommended next lesson from the real catalogue.', parameters: { type: 'object', properties: {} } },
];
