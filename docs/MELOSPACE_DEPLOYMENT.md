# Deployment
1. `npm run build`; host `dist/` over HTTPS (WebXR requires it). `base` is `./`.
2. Run the tutor server separately (Node 22): set `GEMINI_API_KEY`, `GEMINI_MODEL`, `ALLOWED_ORIGINS=<your site origin>`; build the frontend with `VITE_TUTOR_URL=https://<tutor host>`. Put it behind HTTPS.
3. The IWER emulator is not injected in production builds.
4. Before release: headset test, add licensed piano samples, add auth to the tutor endpoint if exposed publicly.
