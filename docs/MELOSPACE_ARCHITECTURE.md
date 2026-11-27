# Architecture (as built)
- **Runtime:** IWSDK 1.1.0 `World.create`, WebXR immersive-vr, local-floor, hand + gaze tracking enabled, locomotion/grabbing off. One renderer, one scene. IWER via `@iwsdk/vite-plugin-dev`.
- **Input:** keys are entities with `RayInteractable` + `PokeInteractable`; `pointerdown/up/leave/cancel` -> `PianoInput` (device-independent, dedupes pointers, `releaseAll` on tracking loss, blur, hidden, session end, input-source removal).
- **UI:** `UIKit` (`@pmndrs/uikit` via IWSDK) panels; `configureUIKitRenderer` once and `root.update()` each frame. Not UIKitML files.
- **Audio:** `AudioEngine` (context, master gain, polyphony cap 16, schedule on audio clock), `Instrument` interface, `SynthPianoInstrument` (PROTOTYPE, not sampled), `SampleInstrument` (ready, no samples bundled), `Metronome` (lookahead scheduler).
- **Lessons:** `lessons.ts` data -> `LessonSession` (intro/reference/practice/result) -> pure `evaluate()`.
- **Tutor:** client `TutorClient` -> `server/tutor-server.ts` -> Gemini REST. Server validates tool name+args (zod allowlist); app `Dispatcher` re-validates and executes against real state; results go back to Gemini.
- **Security:** key only in server env; origin allowlist, 30 req/min/IP, 64 KB body cap; only a minimal context object is sent.
- **Storage:** history in localStorage (guest). No backend DB yet.
