import { createServer } from 'node:http';
import { handleTurn } from './tutor-core';

// Credentials stay on the server: GEMINI_API_KEY is read from the process env, never VITE_*.
const PORT = Number(process.env.TUTOR_PORT ?? 8787);
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'; // configurable; evaluate others via env
const ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:8081,https://localhost:8081').split(',');
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 30;
}

createServer(async (req, res) => {
  const origin = req.headers.origin ?? '';
  const allowed = ORIGINS.includes(origin);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (allowed) { headers['access-control-allow-origin'] = origin; headers['access-control-allow-headers'] = 'content-type'; headers['vary'] = 'Origin'; }
  if (req.method === 'OPTIONS') { res.writeHead(allowed ? 204 : 403, headers).end(); return; }
  if (req.method === 'GET' && req.url === '/api/tutor/health') { res.writeHead(200, headers).end(JSON.stringify({ ok: true, configured: !!process.env.GEMINI_API_KEY, model: MODEL })); return; }
  if (req.method !== 'POST' || req.url !== '/api/tutor/turn') { res.writeHead(404, headers).end('{"error":"not found"}'); return; }
  if (!allowed) { res.writeHead(403, headers).end('{"error":"origin not allowed"}'); return; }
  if (limited(req.socket.remoteAddress ?? 'x')) { res.writeHead(429, headers).end('{"error":"rate limited"}'); return; }
  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 64_000) { res.writeHead(413, headers).end('{"error":"too large"}'); return; } }
  let json: unknown;
  try { json = JSON.parse(body); } catch { res.writeHead(400, headers).end('{"error":"bad json"}'); return; }
  const out = await handleTurn(json, { apiKey: process.env.GEMINI_API_KEY, model: MODEL, baseUrl: process.env.GEMINI_BASE_URL });
  res.writeHead(out.type === 'error' ? out.status : 200, headers).end(JSON.stringify(out));
}).listen(PORT, () => console.log(`MeloSpace tutor server on :${PORT} (model ${MODEL}, key ${process.env.GEMINI_API_KEY ? 'set' : 'MISSING'})`));
