import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 720 } });
const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,200)); });
await p.goto('https://localhost:8081/?debug=1', { timeout: 60000 });
await p.waitForTimeout(10000);
console.log(JSON.stringify(await p.evaluate(async () => ({ hasXR: !!navigator.xr, vrSupported: navigator.xr ? await navigator.xr.isSessionSupported('immersive-vr') : null, app: !!window.__melospace }))));
// Click "Enter VR" in the nav panel
await p.evaluate(() => window.__melospace.world.launchXR()); await p.waitForTimeout(6000);
console.log(JSON.stringify(await p.evaluate(() => { const w = window.__melospace?.world; return { session: !!w?.session, vis: w?.visibilityState?.value, mode: w?.session?.mode, inputSources: w?.session ? w.session.inputSources.length : null }; })));
// press a key while in XR (via real piano input path) then end session -> no stuck notes
await p.evaluate(async () => { const m = window.__melospace; m.input.press('key-G4', 7); });
console.log('held in XR', JSON.stringify(await p.evaluate(() => window.__melospace.input.heldKeys)));
await p.evaluate(() => window.__melospace.world.exitXR()); await p.waitForTimeout(2500);
console.log('after exit', JSON.stringify(await p.evaluate(() => ({ held: window.__melospace.input.heldKeys, session: !!window.__melospace.world.session, vis: window.__melospace.world.visibilityState.value, voices: window.__melospace.audio.voiceCount }))));
console.log('errors', JSON.stringify(errs.slice(0,5)));
await p.screenshot({ path: '/tmp/shot4.png' });
await b.close();
