# MeloSpace — initial implementation prompt

Read `AGENTS.md`, `AI_STUDIO_SYSTEM_INSTRUCTIONS.md`, `README.md`, and `docs/ARCHITECTURE.md` before editing. Treat them as project requirements.

You are working in the existing `Aluro7in/MeloSpace` repository on branch `setup/ai-studio-ready`. It is a Meta IWSDK + Three.js + TypeScript + Vite project. Do not regenerate it as React, Next.js, React Three Fiber, React Three XR, A-Frame, Babylon.js or Android. Do not add a second renderer or WebXR session.

## Phase 1 — audit before changing files

1. Inspect the repository tree, `package.json`, `vite.config.ts`, `iwsdk.config.json`, scene JSON, source entry point and scripts.
2. Install dependencies if they are not present.
3. Report installed versions of `@iwsdk/core`, `@iwsdk/cli`, `@iwsdk/vite-plugin-dev`, `three`, TypeScript and Vite.
4. Inspect the installed IWSDK manifest schema and type declarations. Confirm the current gaze/hand and Meta VR Glasses emulator settings.
5. Run the baseline typecheck and production build before feature work.
6. If dependency install fails, report the exact error and stop. Do not silently replace IWSDK with another framework.

## Phase 2 — first playable product slice

### A. Seated studio

- Build a compact, polished virtual music studio with a calm, premium visual identity.
- The user remains seated. Place the piano and all essential controls directly ahead at comfortable reach distance/height.
- Avoid locomotion, room-scale navigation, standing, forced turning and any requirement for room scanning.
- Keep composition in the IWSDK scene JSON and runtime logic in TypeScript systems/modules.
- Use Learn and Play modes only when they actually work.

### B. One-octave piano

Build C4 through C5 inclusive:
- White keys: C4, D4, E4, F4, G4, A4, B4, C5.
- Black keys: C#4, D#4, F#4, G#4, A#4.
- Put the black keys in correct piano positions and provide clear visual distinction.
- Use reusable, data-driven piano key definitions and MIDI note numbers.
- Make every key a selectable target through IWSDK's supported interaction components and events. Inspect the installed SDK example and type declarations before choosing the exact APIs.
- Primary interaction is gaze targeting plus hand pinch selection.
- Ensure the desktop IWER emulator can test the interaction. Include a practical browser mouse/keyboard fallback if necessary.

### C. Audio engine

- Create a reusable Web Audio module with separate note-on and note-off methods.
- Map MIDI pitches/frequencies correctly.
- Resume AudioContext only after an intentional user gesture.
- Support modest polyphony and short attack/release envelopes to avoid clicks.
- If original or licensed piano samples are not available, use a clearly labeled synthesized prototype tone. Do not call it sampled piano realism.
- Clean up audio nodes and active voices when notes are released or the runtime stops.

### D. First beginner lesson

Implement the sequence C4 → D4 → E4 → F4 → G4.
- Show the current expected note before every attempt.
- Capture the actual played MIDI note and timestamp.
- Store expected note, played note, and timestamp in an event log.
- Calculate correctness and timing with explicit deterministic rules and configurable tolerance.
- Provide correct, incorrect, retry and completion feedback.
- Do not use Gemini to score or fabricate results.

### E. Scope limits

- Keep the first milestone to a working studio, piano, audio engine, one lesson and basic local progress.
- Do not implement Create, social features, payments, accounts, multiplayer, Firebase, guitar or drums yet.
- Do not add a Gemini call. Keep future tutor integration documented only.

## Phase 3 — verification

1. Run `npm run typecheck`.
2. Run `npm run build`.
3. Run the managed IWSDK dev server if supported and inspect the browser preview/console.
4. Test piano notes and note release, including browser audio gesture behavior.
5. Test lesson correctness and retry behavior against repeatable note events.
6. Report which tests were run and their results.
7. Do not claim physical Meta VR Glasses or Quest testing unless performed on that hardware.

## Required completion report

List changed files, actual dependency versions, typecheck/build results, what can be played, any stubs, emulator/browser tests performed, and remaining physical hardware validation. Never report a command as passed unless it ran successfully.
