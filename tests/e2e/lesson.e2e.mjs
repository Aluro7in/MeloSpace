import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 720 } });
const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,200)); });
await p.goto('https://127.0.0.1:4173/?debug=1');
await p.waitForTimeout(5000);
const st = () => p.evaluate(() => { const s = window.__melospace.store.state; return { phase: s.lessonPhase, hi: s.highlighted, fb: s.feedback, res: s.currentResult && { d: s.currentResult.notes.map(n=>n.status+':'+n.deltaMs), score: s.currentResult.score, done: s.currentResult.completed, c: s.currentResult.correctNotes, w: s.currentResult.incorrectNotes, m: s.currentResult.missedNotes, t: s.currentResult.timingAccuracy }, hist: s.history.length }; });
const keyX = { C4: 488, D4: 531, E4: 574, F4: 617, G4: 660, A4: 703 };
const tap = async (n, hold=120) => { await p.mouse.move(keyX[n], 635); await p.mouse.down(); await p.waitForTimeout(hold); await p.mouse.up(); };
await p.mouse.click(443, 408); await p.waitForTimeout(500);       // start first lesson
await p.mouse.click(433, 408); await p.waitForTimeout(500);       // hear example
console.log('reference', JSON.stringify(await st()));
await p.waitForTimeout(4500);
await p.mouse.click(595, 408); await p.waitForTimeout(400);       // start practice
console.log('practice', JSON.stringify(await st()));
await tap('A4'); await p.waitForTimeout(500);                     // wrong key first
console.log('wrong key', JSON.stringify(await st()));
for (const n of ['C4','D4','E4','F4','G4']) { await tap(n); await p.waitForTimeout(700); }
await p.waitForTimeout(400);
console.log('result', JSON.stringify(await st()));
await p.screenshot({ path: '/tmp/shot3.png' });
console.log('errors', JSON.stringify(errs));
await b.close();
