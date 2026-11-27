# 🎵 MeloSpace — Learn. Play. Create.

### A hands-first, AI-powered spatial music studio for Meta VR

<p align="center">
  <strong>Making music education accessible to everyone — one virtual instrument at a time.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-Hackathon%20Prototype-blueviolet" />
  <img src="https://img.shields.io/badge/Platform-Meta%20VR-blue" />
  <img src="https://img.shields.io/badge/XR-Meta%20IWSDK-orange" />
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow" />
</p>

---

## 🌌 The Dream Behind MeloSpace

Imagine a world where a student doesn't need to buy an expensive piano to learn piano, doesn't need to purchase a guitar to practice guitar, and doesn't need to pay for expensive music lessons to begin their musical journey.

Imagine opening a virtual music studio, sitting comfortably, reaching out with your hands, and playing instruments that you might never have the opportunity to own in real life.

Now imagine having an AI music teacher beside you — someone who can explain music theory, guide your practice, teach you new instruments, help you improve, and eventually help you create your own music.

**That is the dream behind MeloSpace.**

I want to build more than a VR music game. I want to create a complete virtual music-learning and creation environment where technology can make music education more accessible, interactive, and affordable.

My long-term vision is to bring **7,000+ musical instruments** into one virtual environment, supported by AI-powered learning, practice, collaboration, and music creation.

This is a long-term vision, not a claim about the current prototype.

## 💡 The Problem I Want to Solve

Learning music can be expensive and difficult to access.

- Musical instruments can cost a lot of money.
- Music classes and personal tutors are not affordable or available to everyone.
- Beginners often don't know where or how to start.
- Practicing without guidance can become frustrating.
- Exploring different instruments requires access to those instruments.
- Traditional learning experiences don't always provide interactive, personalized feedback.

I believe spatial computing and AI can create another way to learn and experience music.

## 🚀 What I Want MeloSpace to Become

The larger vision has four connected experiences:

| Experience | Long-term vision |
|---|---|
| **Learn** | AI-guided music lessons, music theory, instrument tutorials, and personalized learning paths. |
| **Play** | Realistic virtual instruments that people can interact with using their hands. |
| **Create** | A virtual music studio for composing, experimenting, recording, and producing music. |
| **Progress** | Practice history, performance feedback, achievements, and personalized improvement plans. |

### 🎹 7,000+ Virtual Instruments — The Big Vision

I want users to eventually explore a huge collection of instruments, including:

- Piano, keyboard, and synthesizers
- Acoustic and electric guitars
- Bass guitars
- Drums and percussion
- Traditional and cultural instruments
- Orchestral and classical instruments
- Electronic and experimental instruments
- Instruments from different musical traditions around the world

The goal is not simply to display 3D models. I want instruments to become playable, responsive, and useful for learning and creating music.

### 🤖 AI Music Teacher

The future AI tutor should be able to:

- Explain musical concepts in beginner-friendly language.
- Guide users through instrument lessons.
- Help users understand mistakes.
- Recommend what to practice next.
- Explain chords, scales, rhythm, and music theory.
- Support users as they progress from beginner to advanced levels.

The AI should complement actual musical interaction, not replace it. Performance evaluation should be based on real playing events rather than invented AI scores.

### 🌍 A Music Studio Without Physical Boundaries

I envision a shared virtual environment where people can eventually:

- Learn different instruments.
- Practice together.
- Join virtual bands.
- Create music collaboratively.
- Explore instruments from different cultures.
- Learn from AI tutors and other musicians.

---

## 🛠️ What I Have Built So Far

MeloSpace is currently an early working prototype focused on establishing the core experience.

The current implementation includes:

- A spatial music studio built using Meta IWSDK.
- A virtual one-octave piano with 13 keys.
- Piano note interaction and synthesized audio.
- Hands-first and gaze-tracking capabilities configured for XR.
- Beginner lesson flow and reference-note playback.
- Practice sessions and deterministic performance evaluation.
- Tempo controls and a metronome.
- An AI tutor integration pipeline using a server-side Gemini proxy.
- A guest-first experience with local progress storage.

### Current implementation status

| Feature | Status |
|---|---|
| Spatial studio and navigation | Implemented |
| 13-key virtual piano | Implemented |
| Synthesized piano audio | Prototype |
| Beginner lessons and scoring | Implemented |
| Metronome | Implemented; hardware verification pending |
| Hand and gaze interaction | Implemented; hardware verification pending |
| Gemini tutor pipeline | Implemented; real Gemini testing pending |
| Sampled realistic instruments | Not implemented |
| Guitar, bass, and drums | Planned |
| AI voice tutor | Planned |
| Music creation studio | Planned |
| User accounts and cloud progress | Planned |
| 7,000+ playable instruments | Long-term vision |

**Transparency:** The current piano uses prototype synthesized audio. Sampled instrument libraries are not bundled. Some XR interactions and the real Gemini integration still need testing on compatible hardware and with live services.

## ❤️ The Reality Behind This Hackathon Project

I want to be honest about what this project represents and what I could achieve during this hackathon.

I am building MeloSpace as a solo developer.

The idea is much bigger than the amount of time, technical experience, hardware, development resources, and tools I currently have available.

Building a complete spatial music platform is not just about creating a 3D interface. It involves several difficult areas:

- XR development and hand-tracking interactions.
- Realistic instrument modeling and sound generation.
- Low-latency audio processing.
- Music theory and learning systems.
- AI integration and personalized tutoring.
- Hardware compatibility and performance optimization.
- Testing on actual Meta VR devices.
- A large instrument library and the infrastructure to support it.

I do not have a complete team of XR engineers, audio engineers, music educators, AI researchers, and 3D artists behind me. I am learning and building across these areas myself, with limited access to the hardware and tools required for a project of this scale.

**I could not build the entire dream as a fully functional product alone within this hackathon.**

That does not mean the idea is finished. It means this submission represents an early step toward something much bigger.

I chose to build a foundation around the core experience: a virtual piano, music interaction, lessons, scoring, and an AI tutor pipeline.

I would love to take this much further with the right collaborators, technical guidance, hardware access, and development resources.

I am sharing the project honestly — including what works, what is incomplete, and what I hope to build next.

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| TypeScript | Application logic |
| Meta IWSDK 1.1.0 | Spatial and XR application framework |
| Three.js through IWSDK | 3D rendering |
| WebXR | Immersive VR experience |
| IWER | Desktop XR development and emulation |
| UIKit through IWSDK | Spatial user interface |
| Web Audio API | Instrument audio and synthesis |
| Vite | Development server and build tooling |
| Vitest | Unit testing |
| Zod | Validation of AI tutor tools |
| Gemini API | Planned/optional AI tutor backend integration |
| Node.js | AI tutor server |

## 🏗️ Architecture

```text
MeloSpace
│
├── src/
│   ├── app/          # Application state and lesson sessions
│   ├── audio/        # Audio engine, instruments, metronome
│   ├── lesson/       # Lessons and performance evaluation
│   ├── music/        # Musical notes and piano input
│   ├── tutor/        # AI tutor client and tool definitions
│   └── xr/           # Spatial studio, piano and UI
│
├── server/
│   ├── tutor-server.ts
│   └── tutor-core.ts
│
├── tests/
│   └── Unit and end-to-end test files
│
└── docs/
    ├── Architecture
    ├── Product specification
    ├── Feature status
    ├── Roadmap
    ├── Test report
    └── Deployment
```

The Gemini API key is intended to stay on the server, not in frontend environment variables. The core piano and lesson experience is designed to work without the AI tutor being available.

## 🧪 Testing and Verification

The project's included test report documents:

- 31 passing unit tests.
- TypeScript type-checking and production build success.
- Browser-based piano interaction and lesson-flow testing.
- IWER-based XR session entry and exit testing.
- Mock Gemini tutor tool-call testing.
- Rejection of invalid tutor actions.

These results are from the project's documented sandbox testing. They do **not** establish that the application has been validated on a physical Meta headset, or that real Gemini integration is fully working.

## 💻 Getting Started

### Requirements

- Node.js 22 recommended.
- npm.
- A modern browser.
- A compatible Meta VR device for physical XR testing.

### Installation

```bash
git clone https://github.com/Aluro7in/MeloSpace.git
cd MeloSpace

npm install
npm run dev
```

Open the HTTPS development URL printed by Vite (normally `https://localhost:8081`).

### Run tests

```bash
npm test
```

### Type-check

```bash
npm run typecheck
```

### Production build

```bash
npm run build
```

### Optional Gemini tutor server

Create a local `.env` file based on `.env.example` and configure the Gemini API key on the server side.

```bash
npm run tutor-server
```

Never commit your actual `.env` file or expose your Gemini API key in frontend code.

For more details, see the `docs/` directory.

---

## 🌿 GitHub Branches — Which Version Should You Use?

This repository contains separate branches for the project foundation and development versions.

| Branch | Purpose | Recommended use |
|---|---|---|
| `main` | Main repository baseline | Reference the primary branch |
| `setup/ai-studio-ready` | AI Studio-ready foundation and setup work | Explore the starter/setup version |
| `developed-project-v2` | Developed MeloSpace prototype | **Use this branch for the current hackathon implementation** |

To use the developed version:

```bash
git clone -b developed-project-v2 https://github.com/Aluro7in/MeloSpace.git
cd MeloSpace
npm install
npm run dev
```

You can switch branches in an existing clone:

```bash
git switch developed-project-v2
```

The branches are separate development snapshots. The full long-term vision described in this README is not implemented across all branches.

---

## 🗺️ What's Next?

My roadmap for MeloSpace:

1. Test and improve the current piano experience on physical Meta VR hardware.
2. Add realistic piano samples and improve audio quality.
3. Improve hand tracking, gaze interaction, and spatial UI comfort.
4. Complete and validate the Gemini AI tutor integration.
5. Add voice-based music teaching.
6. Introduce guitar, bass, and drums.
7. Build a proper music creation environment.
8. Add user profiles, learning history, and cloud progress.
9. Expand toward a large library of playable instruments.
10. Explore collaborative music sessions and virtual bands.

---

## 🤝 The People Who Could Help Make This Possible

MeloSpace is currently a solo-developed project, but the complete vision needs a multidisciplinary team.

I would love to collaborate with:

- XR and spatial computing developers.
- Audio engineers and sound designers.
- Music educators and musicians.
- AI/ML engineers.
- 3D artists and interaction designers.
- Developers interested in accessible music education.

If you believe in making music learning more accessible through technology, I would love to connect.

---

## 🎯 Final Thought

I started MeloSpace with a simple thought:

**What if the ability to learn and play music did not depend on whether someone could afford an instrument?**

I know the current prototype is only a small part of what I imagine. But I believe ambitious ideas need a starting point, and this is mine.

I want MeloSpace to become a place where a child can discover the piano, a beginner can learn guitar, a musician can experiment with new sounds, and anyone can explore the world of music without needing to own thousands of instruments.

**One virtual studio. Thousands of instruments. A world of music waiting to be explored.**

*This is not the finished dream. This is where I am starting.*

---

<p align="center">
  <strong>MeloSpace — Learn. Play. Create.</strong><br/>
  Built with curiosity, ambition, and a dream to make music accessible.
</p>

**Developer:** Mohd Owais  
**GitHub:** [@Aluro7in](https://github.com/Aluro7in)  
**Repository:** [MeloSpace](https://github.com/Aluro7in/MeloSpace)
