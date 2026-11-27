import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ ignoreHTTPSErrors: true, viewport: { width: 800, height: 450 } });
await p.goto('https://127.0.0.1:4173/?debug=1'); await p.waitForTimeout(5000);
const out = await p.evaluate(async () => {
  const m = window.__melospace; await m.audio.ensureStarted();
  const ctx = m.audio.ctx; const an = ctx.createAnalyser(); an.fftSize = 32768; an.smoothingTimeConstant = 0; m.audio.output.connect(an);
  const res = {};
  for (const [name, midi] of [['E4', 64], ['C4', 60], ['C5', 72]]) {
    m.audio.noteOn(midi); await new Promise(r => setTimeout(r, 400));
    const d = new Float32Array(an.frequencyBinCount); an.getFloatFrequencyData(d);
    let pk = 0; for (let i = 1; i < d.length; i++) if (d[i] > d[pk]) pk = i;
    res[name] = { peakHz: +(pk * ctx.sampleRate / an.fftSize).toFixed(1), dB: +d[pk].toFixed(1) };
    m.audio.noteOff(midi); await new Promise(r => setTimeout(r, 1500));
  }
  const tail = new Float32Array(an.frequencyBinCount); an.getFloatFrequencyData(tail);
  res.afterRelease_maxdB = +Math.max(...tail).toFixed(1); res.voices = m.audio.voiceCount; res.sampleRate = ctx.sampleRate;
  return res;
});
console.log(JSON.stringify(out, null, 1));
await b.close();
