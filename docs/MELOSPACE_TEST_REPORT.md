# Test report (sandbox, headless Chromium + swiftshader, IWER)
- `npm test`: 31/31 pass. `tsc --noEmit`: clean. `vite build`: success.
- Lesson e2e (mouse): reference -> practice -> wrong key "That was A4. Look for C4." -> 5 notes -> result, 0 console errors. Scripted taps were ~1.1 s apart (slow software rendering), which exposed cumulative-drift scoring; evaluator changed to interval-based timing and unit-tested.
- Audio: peaks E4 329.7 Hz, C4 261.1 Hz, C5 523.5 Hz; after release silent, voices 0. Not listened to by a human.
- XR (IWER Quest 3): session true, visible, 2 input sources; exit -> held keys [] , voices 0.
- Tutor (mock Gemini): set_tempo 60 applied; start_lesson applied; eval_js and bpm 9999 rejected; server down -> "unavailable" message, piano works.
- Not tested: physical hardware, real Gemini, latency, FPS, memory.
