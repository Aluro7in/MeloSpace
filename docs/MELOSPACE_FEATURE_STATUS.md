# Feature status
**Verified (headless Chromium / IWER, not hardware):** studio render; navigation; 13 keys via mouse pointer events; full lesson run + scoring; pitch of E4/C4/C5; silence after release; IWER session enter/exit with note cleanup; tutor pipeline against a MOCK Gemini; tool rejection; tutor-down fallback; 31 unit tests; production build.
**Implemented, unverified:** hand pinch, poke, gaze+pinch on keys; metronome audibility/visual beat in-headset; reference playback by ear; localStorage progress across reloads; real Gemini calls; panel comfort in headset.
**Not implemented:** sampled piano, voice tutor, Firebase/accounts, guitar/bass/drums, Create mode (placeholder only), glTF assets.
**Blockers/limits:** synth sound is a prototype; "Gemini 4 Neon" unverifiable - model is `GEMINI_MODEL`; ~6.6 MB main JS chunk; two ERR_NAME_NOT_RESOLVED in the offline sandbox (likely emulator remote assets).
