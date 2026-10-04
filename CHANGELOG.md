# Changelog: Semantic Research Lab v2.0 & v2.1

All notable changes to the Multimodal Cognitive Interface & OKLab VaporSphere are documented in this file.

## [2.1.0] - 2026-10-04

### Added
- **Hard Default Push-to-Talk (PTT) with Open Mic Toggle**:
  - Push-to-Talk is enabled as the strict default to prevent accidental room noise, background dialogue, or keyboard thumps from triggering spurious barge-in events.
  - Universal interactive Microphone button:
    - **Idle State:** Sleek dark disc with cool slate/cyan border, universal mic icon (`Mic`), and clear label (`HOLD SPACE TO TALK` / `Push-to-Talk Default`).
    - **Active Transmitting State:** Dynamically transforms into radiant, pulsating Emerald/Teal wave with active acoustic halo rings, animated microphone indicator, and live VU telemetry.
  - Keyboard integration: Holding `Spacebar` (outside of text inputs) instantly opens transmission, releasing Spacebar immediately mutes with smooth de-clicking.
  - Full toggleability: Instant switch between `[ PTT (Default) ]` and `[ Open Mic (Continuous) ]` at any time.
  - Quick Latch mode: Allows clicking "LATCH" to keep mic open hands-free during prolonged expositions.
- **Sound Engineer DSP Microphone Channel Strip**:
  - Embedded professional audio processing pipeline running in the Web Audio API prior to sending 16kHz PCM frames to Gemini Live API:
    1. **85Hz High-Pass Filter (Butterworth):** Eliminates mechanical desk thumps, HVAC rumble, and air plosives.
    2. **2.8kHz Vocal Clarity & Presence EQ (+3.5dB Peaking):** Accentuates consonant and phoneme intelligibility so the Gemini agent perceives subtle nuances with high fidelity.
    3. **7.2kHz De-Hiss Filter:** Cuts high-frequency computer coil whine, electrical hiss, and ultrasonic artifacts.
    4. **Downward Expander / Adaptive Noise Gate:** Silences background room tone and keyboard clatter when user is pausing.
    5. **Studio Vocal Dynamics Compressor (3.5:1 ratio, 3ms attack, 140ms release):** Transparently levels whispered and emphatic speech.
    6. **Brickwall Peak Limiter (-1.5dB ceiling, 20:1 ratio, 1ms attack):** Guarantees zero digital clipping or waveform distortion.
    7. **Anti-Click Soft Fade Ramp (12ms):** Interpolates gain via linear ramps to prevent mechanical mouse and keyboard switch clicks.

## [2.0.0] - 2026-10-04

### Added
- **Entry Hub & Welcome Onboarding Dialog**:
  - Modal presented on initial launch allowing researchers to either start a clean case, pick from curated domain paradoxes, resume previous investigations, or take the interactive personalisation tour.
  - "Do not show again" toggle persisted in client storage, with quick access button in the primary header.
- **Top Research Cases / Topics Management Bar**:
  - Dedicated, isolated top navigation strip positioned above technical workspace views.
  - Case Counter Badge displaying total cases processed (e.g., `[ 4 Topics Processed ]`).
  - Dropdown Case Switcher: instant switching between distinct research investigations without loss of dialogue history, key questions, or GPU sphere visual state.
  - Case actions: Create New Case (`+`), Pin Case, Export Case to JSON, Rename, and Delete.
  - LocalStorage persistence (`cognitive_research_cases_v2`) with 4 pre-seeded high-grade scientific cases (Consciousness & IIT, Dissipative Structures, CRISPR Pleiotropy Bioethics, and Gödelian Incompleteness).
- **Comprehensive Multilingual Support (i18n)**:
  - English (`en`) established as the application-wide DEFAULT language.
  - Retained full support for Czech (`cs`).
  - Added support for 7 most widely used languages: Spanish (`es`), German (`de`), French (`fr`), Japanese (`ja`), Chinese Simplified (`zh`), Arabic (`ar` with RTL layout support), and Portuguese (`pt`).
  - Interactive top bar dropdown for instantaneous language switching across all menus, tools, and telemetry.
- **Interactive Personalisation & Customisation Tour**:
  - 7-step guided walkthrough highlighting key interface capabilities: Topics Architecture, 3D OKLab VaporSphere, Gemini Live Duplex Voice & Barge-In, Socratic Elenctic Analysis, and Subscription Tiers.
  - Customisation drawer allowing users to select:
    - UI Glow Accent Theme (Cyan Neon, Emerald Synth, Amber Gold, Violet Void, Ruby Laser)
    - Dialectical Rigour Level (Post-graduate Academic, Socratic Challenger, Peer Reviewer, Conceptual Tutor)
    - Ambient 432Hz Binaural Focus Carrier Frequency for deep cognitive immersion.
- **Subscription Tiers & Coordinated Cloud Architecture**:
  - Balanced matrix across Free Explorer, Pro Researcher, Unlimited Scholar, and ADMIN Root Mesh.
  - Daily query counters, rate-limit safeguards, and model tiers (`gemini-3.1-flash-lite`, `gemini-3.8-flash`, `gemini-3.1-pro-preview`).
  - ADMIN console mode featuring real-time WebSocket telemetry, token debuggers, raw prompt inspectors, and semantic memory reset tools.
  - Coordinated integration hooks for Google Cloud Run, Cloud SQL (PostgreSQL), Firebase, and Google Workspace.
- **Documentation & PDF Exporter**:
  - Interactive simple-minded operational handbook rendered within the app.
  - Client-side 1-click PDF compiler using `jsPDF` (`Semantic_Research_Lab_User_Guide.pdf`).

### Changed
- Preserved 100% of existing functionality: 3D Three.js OKLab particle simulation, Curl noise physics, bidirectional Gemini Live API proxy with 16kHz PCM streaming, barge-in VAD detection, and semantic vector memory.
- Standardized layout hierarchy: Header separated into Top Case Bar, System Status Bar, and Workspace Navigators.
