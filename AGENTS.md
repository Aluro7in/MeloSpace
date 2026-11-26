# MeloSpace — agent instructions

## Mission
Build MeloSpace: a seated, hands-first immersive music learning and creation studio for Meta VR. Prioritize a genuinely playable one-octave piano and a trustworthy beginner lesson over mock screens or a long feature list.

## Non-negotiable architecture
- Meta Immersive Web SDK (IWSDK) owns the XR session, world lifecycle, scene integration and input.
- Use Three.js through IWSDK and the repository's configured `three` alias.
- TypeScript + Vite only for the app runtime.
- Keep project settings in `iwsdk.config.json`, authored scene content in `public/scenes/*.iwsdk.scene.json`, and runtime systems in TypeScript.
- Use `World.create(..., projectOptions)` and `virtual:iwsdk-project`.
- Keep the `iwsdkDev()` Vite plugin and managed CLI workflow.
- Preserve the `three: npm:super-three@0.185.0` alias and matching npm override.

Do not migrate to React, Next.js, React Three Fiber, React Three XR, A-Frame, Babylon.js, Unity, or native Android as the XR runtime. Do not create a second renderer, scene graph, or WebXR session.

## Input and comfort
- Primary interaction: gaze targeting + hand pinch selection, following the official IWSDK gaze/pinch example and installed API.
- Keep the application seated-first. Piano and essential controls remain in front of the seated player.
- No forced locomotion, standing, room-scale navigation, passthrough or room scanning in the first milestone.
- Support desktop mouse/keyboard and IWER emulation for rapid development.

## Product sequence
1. C4–C5 piano: 8 white keys and 5 black keys.
2. Reliable note-on/note-off and responsive sound.
3. Beginner lesson: C4 → D4 → E4 → F4 → G4.
4. Deterministic scoring from actual note and timing events.
5. Free play and a compact progress summary.
6. Gemini tutor, only after the core loop works.
7. Other instruments after piano quality is verified.

## Audio
- Use Web Audio API for the first sound engine unless licensed piano samples are supplied.
- Mark oscillator sound as synthesized prototype audio; do not call it realistic sampled piano.
- Handle AudioContext resume after a user gesture and support note release, envelopes and modest polyphony.
- Do not include copyrighted samples or recordings without clear rights.

## Lesson integrity
- Lesson state and scoring are deterministic and independent of Gemini.
- Store the expected note, played note and timestamp for each attempt.
- Do not let an LLM fabricate note history, practice scores or completion state.

## Gemini and secrets
- No Gemini model call is required for the first piano task.
- Never expose API keys in browser code, source files, commits, screenshots, logs or `VITE_*` variables.
- Add Gemini only through a secure server-side route and a typed, allowlisted tool interface.
- Validate tutor action arguments; never allow arbitrary code execution or direct score mutation.

## Engineering discipline
1. Inspect repository files and installed versions before changing code.
2. Read the installed IWSDK schema and type declarations, plus official examples, before using any unfamiliar API.
3. Never invent SDK methods, component names, event names, manifest fields or CLI flags.
4. Keep changes small and preserve this architecture.
5. Run `npm run typecheck` and `npm run build` after substantial changes whenever the environment allows.
6. Report exact failures if a command cannot run; never claim a test passed unless it ran.
7. Do not claim physical headset or glasses validation unless that hardware was actually used.
8. Mark placeholders and incomplete features clearly.
9. Do not add Firebase, auth, payments, analytics or a database before the local piano/lesson loop works.
10. Work on `setup/ai-studio-ready` or a dedicated feature branch, not `main`, until reviewed.

## Completion report
List changed files, commands actually executed and results, what works versus what is a stub, blockers/manual steps, and whether testing was browser/emulator-only or on physical hardware.
