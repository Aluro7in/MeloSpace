# MeloSpace architecture

## Runtime structure

```text
IWSDK managed Vite app
├── iwsdk.config.json
├── public/scenes/          Declarative native IWSDK scene
├── public/ui/              UIKitML spatial UI assets
├── src/index.ts            World creation and system registration
├── src/assets.ts           Asset manifest
├── src/components.ts       Custom ECS component manifest
└── src/features/           Piano, audio, lessons and progress modules (next milestone)
```

## XR and input

IWSDK owns the WebXR session, world lifecycle, ECS, and input integration. The app requests VR mode, hand tracking and gaze tracking. The desktop development profile uses IWER with the Meta VR Glasses device preset. Gaze targets an interactable; pinch commits selection through the supported ray-pointer flow.

Do not run a second renderer or request a second WebXR session.

## Piano and audio

Piano keys should be data-driven. Each key maps to a stable ID, label and MIDI note. A reusable audio engine handles note-on/note-off. The first prototype can synthesize tones with Web Audio; properly licensed multisampled piano audio can be considered later.

## Lesson engine

The lesson owns the expected sequence, attempt state, timestamps and scoring rules. It consumes verified piano note events. The lesson evaluator is deterministic and independent of any LLM.

## Future tutor

Gemini is an optional coach, not the source of truth for music state. When added, it must be server-side and use typed allowlisted tools. It may ask the app to highlight a note, change tempo or play a reference note, but cannot invent scores or execute arbitrary code.

## Future persistence

Start with guest/local progress. Introduce Firebase Auth/Firestore only when there is a tested requirement for accounts or cross-device progress.

## Comfort

- Piano and essential controls stay in front of the seated user.
- Avoid forced locomotion, standing, turning, or reaching behind.
- Keep current instructions legible and reduce visual clutter.
