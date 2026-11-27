// Mock of Google's generateContent endpoint, used ONLY to test the MeloSpace tool-call pipeline offline.
import { createServer } from 'node:http';
createServer((req, res) => {
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
    const { contents } = JSON.parse(b);
    const last = contents[contents.length - 1];
    const fr = last.parts.find((p) => p.functionResponse);
    const text = last.parts.map((p) => p.text ?? '').join(' ').toLowerCase();
    let parts;
    if (fr) parts = [{ text: `Done: ${JSON.stringify(fr.functionResponse.response)}` }];
    else if (text.includes('slower')) parts = [{ functionCall: { name: 'set_tempo', args: { bpm: 60 } } }];
    else if (text.includes('first lesson')) parts = [{ functionCall: { name: 'start_lesson', args: { lessonId: 'piano-first-five' } } }];
    else if (text.includes('hack')) parts = [{ functionCall: { name: 'eval_js', args: { code: 'alert(1)' } } }, { functionCall: { name: 'set_tempo', args: { bpm: 9999 } } }];
    else parts = [{ text: 'Hello from the mock.' }];
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ candidates: [{ content: { role: 'model', parts } }] }));
  });
}).listen(9999);
