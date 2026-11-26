# Development workflow

## Requirements and commands

Use supported Node.js (22.12+ on Node 22, or Node 24+).

```bash
npm install
npm run dev
```

The IWSDK CLI owns the managed development runtime. Open the URL and controls that it reports; do not assume a fixed URL.

Checks:

```bash
npm run typecheck
npm run build
npm run dev:status
```

Shutdown:

```bash
npm run dev:down
```

## Desktop XR emulation

1. Start `npm run dev`.
2. Open the managed browser/runtime.
3. Enter XR in IWER.
4. Select **Gaze + Hands**.
5. Use the gaze/cursor and hand emulation to test selection.
6. Confirm that application target feedback responds to interactions.

A desktop IWER run is not proof of real-device tracking.

## Repository safety

Develop on `setup/ai-studio-ready` or a dedicated feature branch. Review diffs before merging to `main`. Never commit API keys, secret environment files, `node_modules`, build output, or audio assets without clear licensing documentation.
