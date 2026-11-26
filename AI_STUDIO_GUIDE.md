# Import and start MeloSpace in Google AI Studio

The repository is an existing **IWSDK + Three.js + TypeScript + Vite** app. Import it; do not create a new AI Studio React or Android application.

## 1. Import the private repository

1. Open [Google AI Studio](https://aistudio.google.com/).
2. Switch to **Build** mode.
3. In the project/files import control, choose **Import from GitHub**.
4. Authorize the Google AI Studio GitHub App. This authorization is separate from the ChatGPT GitHub connection. Grant access to the private repository `Aluro7in/MeloSpace`.
5. Select repository `Aluro7in/MeloSpace` and branch `setup/ai-studio-ready`.
6. Import the existing codebase.

If the repository is missing, open the GitHub App access/configuration page from the import flow and grant access to this repository, then retry. Keep the repo private.

## 2. Project settings

- Use Build mode for the existing web project.
- Choose High thinking/reasoning when available.
- Use the repository's existing Node/Vite project and scripts.
- Do not create a React, Next.js or Android shell.
- Do not replace the IWSDK manifest, scripts, Vite plugin or module entry.
- Do not enable Maps, Google Workspace, SQL, image/video generation or unrelated integrations for the first milestone.

## 3. Add project instructions

Paste the complete contents of `AI_STUDIO_SYSTEM_INSTRUCTIONS.md` into AI Studio's project instructions/custom instructions area if it is available. Keep `AGENTS.md` in the imported repository context.

## 4. Install dependencies and verify first

The import agent must inspect `package.json`, install dependencies, and report the installed versions before coding. If the workspace does not install automatically, run:

```bash
npm install
npm run typecheck
npm run build
```

The dependency versions in this branch follow the current official Meta IWSDK repository package metadata. If installation reports a missing/unpublished package version, stop and check the current official Meta scaffold/release rather than substituting a different XR framework.

## 5. First development task

Open `prompts/01_INITIAL_BUILD_PROMPT.md`, copy the entire prompt and submit it in the Build prompt box. It first audits the SDK and then instructs the agent to create the seated piano slice.

## 6. API keys and integrations

No Gemini key is required for the first task. Do not paste a Gemini key in source code, browser storage, commits or `VITE_*` variables. Later, add it only through a server-side secret manager and server-side route. Firebase is not required yet.

## 7. Branch and GitHub sync

Keep the import connected to `setup/ai-studio-ready`. Review all diffs before pushing. Do not merge to `main` until the app builds and the first milestone has been reviewed.
