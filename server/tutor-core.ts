import { z } from 'zod';
import { geminiFunctionDeclarations, validateToolCall } from '../src/tutor/tools';

export const SYSTEM_PROMPT = `You are the MeloSpace music tutor: warm, clear, concise, encouraging, never childish.
You help beginners learn piano inside the MeloSpace app. You can operate the app ONLY through the provided tools.
Rules:
- When the learner asks you to do something the tools can do (start a lesson, slow down, show the next note, play the example, metronome, practice, results, next lesson), CALL THE TOOL instead of describing it.
- Never invent practice results. For performance questions call get_practice_result and explain only what it returns.
- Only use lesson ids from the catalogue in the context. Tempo must be 40-160 BPM; "slower" means roughly 10-20 BPM lower than the current tempo.
- Keep replies to 1-3 short sentences. Do not claim an action succeeded unless a tool result says ok.`;

const partSchema = z.object({
  text: z.string().max(4000).optional(),
  functionCall: z.object({ name: z.string(), args: z.record(z.string(), z.unknown()).optional() }).optional(),
  functionResponse: z.object({ name: z.string(), response: z.record(z.string(), z.unknown()) }).optional(),
});
const contentSchema = z.object({ role: z.enum(['user', 'model']), parts: z.array(partSchema).min(1).max(8) });

export const turnRequestSchema = z.object({
  contents: z.array(contentSchema).min(1).max(40),
  context: z.record(z.string(), z.unknown()),
});

export interface GeminiDeps {
  apiKey: string | undefined;
  model: string;
  fetchImpl?: typeof fetch;
  /** Override for tests only; defaults to the Google Generative Language API. */
  baseUrl?: string;
}

export type TurnResponse =
  | { type: 'text'; text: string; contents: z.infer<typeof contentSchema>[] }
  | { type: 'tool_calls'; calls: Array<{ name: string; args: Record<string, unknown> }>; rejected: Array<{ name: string; error: string }>; contents: z.infer<typeof contentSchema>[] }
  | { type: 'error'; status: number; error: string };

/** One Gemini round-trip. Tool calls are validated here (allowlist + schema) before reaching the client. */
export async function handleTurn(raw: unknown, deps: GeminiDeps): Promise<TurnResponse> {
  const parsed = turnRequestSchema.safeParse(raw);
  if (!parsed.success) return { type: 'error', status: 400, error: 'Invalid request' };
  if (!deps.apiKey) return { type: 'error', status: 503, error: 'Tutor not configured (missing GEMINI_API_KEY on server)' };
  const { contents, context } = parsed.data;
  const f = deps.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await f(`${deps.baseUrl ?? 'https://generativelanguage.googleapis.com'}/v1beta/models/${encodeURIComponent(deps.model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': deps.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nCurrent app context (JSON): ${JSON.stringify(context)}` }] },
        contents,
        tools: [{ functionDeclarations: geminiFunctionDeclarations }],
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
      }),
    });
  } catch {
    return { type: 'error', status: 502, error: 'Gemini unreachable' };
  }
  if (!res.ok) return { type: 'error', status: 502, error: `Gemini error ${res.status}` };
  const data: any = await res.json().catch(() => null);
  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  if (!parts.length) return { type: 'error', status: 502, error: 'Empty Gemini response' };
  const modelContent = { role: 'model' as const, parts: parts.map((p) => (p.functionCall ? { functionCall: { name: p.functionCall.name, args: p.functionCall.args ?? {} } } : { text: String(p.text ?? '') })) };
  const next = [...contents, modelContent];
  const fc = parts.filter((p) => p.functionCall);
  if (fc.length) {
    const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
    const rejected: Array<{ name: string; error: string }> = [];
    for (const p of fc.slice(0, 4)) {
      const v = validateToolCall(p.functionCall.name, p.functionCall.args);
      if (v.ok) calls.push({ name: v.name, args: v.args }); else rejected.push({ name: v.name, error: v.error });
    }
    return { type: 'tool_calls', calls, rejected, contents: next };
  }
  return { type: 'text', text: parts.map((p) => p.text ?? '').join('').trim(), contents: next };
}
