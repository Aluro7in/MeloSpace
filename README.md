# MeloSpace - Learn. Play. Create.

Hands-first, seated-friendly spatial music studio for Meta VR on Meta IWSDK 1.1.0
(Three.js via IWSDK, TypeScript, Vite, ECS, UIKit, Web Audio, IWER emulator).

```bash
npm install
npm run dev        # https://localhost:8081 (IWER injected on localhost)
npm test           # 31 unit tests
npm run build      # type-check + production build
cp .env.example .env   # set GEMINI_API_KEY in the server environment only
npm run tutor-server   # optional Gemini tutor proxy
```
`MELO_DEVICE=metaVRGlasses npm run dev` emulates Meta VR Glasses.
Debug hooks (`window.__melospace`) only exist with `?debug=1`.
E2E scripts in `tests/e2e/` need `npm i -D playwright` and `CHROMIUM_PATH`.

See `docs/` for spec, architecture, roadmap, feature status, test report, deployment.
