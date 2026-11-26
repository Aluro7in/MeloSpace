# MeloSpace

MeloSpace is a hands-first immersive music learning and creation studio for Meta VR. It aims to make learning and playing instruments accessible without requiring a physical instrument or private lessons, while still supporting regular practice and creative exploration.

This branch is the **IWSDK foundation and AI Studio handoff**. The first milestone is deliberately focused: a seated one-octave piano (C4–C5), responsive sound, gaze-and-pinch selection, and one beginner lesson.

## Stack

- Meta Immersive Web SDK (IWSDK) — XR lifecycle, ECS, input and scene runtime
- Three.js via IWSDK's `super-three` alias
- TypeScript + Vite
- IWER desktop XR emulator
- Web Audio API for the first sound engine
- Gemini tutor later, through a server-side integration only
- Firebase later, only when accounts and cross-device progress are necessary

Do not replace this foundation with React, Next.js, React Three Fiber, React Three XR, A-Frame, Babylon.js, or native Android.

## Requirements

Use Node.js 22.12+ (22.x) or Node.js 24+. Node 20.19+ is also supported by the current IWSDK package metadata.

## Install and run

```bash
npm install
npm run dev
```

The IWSDK CLI manages the development runtime and IWER integration. Use the runtime URL printed by the CLI.

```bash
npm run typecheck
npm run build
npm run dev:status
npm run dev:down
```

For desktop input testing, select **Gaze + Hands** in the IWER input-mode controls. Desktop emulation is not a substitute for validating the actual target hardware.

## Google AI Studio

Read [AI_STUDIO_GUIDE.md](./AI_STUDIO_GUIDE.md), then import this private GitHub repo in Google AI Studio Build mode. Keep the project on branch `setup/ai-studio-ready` for the first pass.

1. Read [AGENTS.md](./AGENTS.md).
2. Paste [AI_STUDIO_SYSTEM_INSTRUCTIONS.md](./AI_STUDIO_SYSTEM_INSTRUCTIONS.md) into the project instructions/custom instructions field if available.
3. Run the complete prompt in [prompts/01_INITIAL_BUILD_PROMPT.md](./prompts/01_INITIAL_BUILD_PROMPT.md).

## Build order

1. Verify SDK install, schema, Vite and IWER runtime.
2. Build the seated studio shell.
3. Build the C4–C5 piano and reliable note playback.
4. Add one C4–G4 beginner lesson with deterministic scoring.
5. Add guest progress and free play.
6. Add Gemini tutoring only after the core piano loop is verified.
7. Expand to guitar, drums and other instruments later.

## Status

This branch contains the IWSDK app shell, current project configuration, starter spatial welcome panel, development docs and AI Studio prompts. It does **not** yet contain the playable piano or lesson engine. Dependencies still need to be installed and verified in AI Studio or a local environment. No API secrets are committed.

## References

- [Meta IWSDK project setup](https://developers.meta.com/vr/documentation/iwsdk/guides/01-project-setup/)
- [Meta IWSDK documentation](https://developers.meta.com/vr/documentation/iwsdk/)
- [Meta VR Glasses gaze + pinch example](https://github.com/meta/immersive-web-sdk/tree/main/examples/gaze-pinch)
- [IWSDK create CLI](https://github.com/meta/immersive-web-sdk/tree/main/packages/create)
- [Google AI Studio Build mode](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
