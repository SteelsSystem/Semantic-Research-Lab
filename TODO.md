# Semantic Research Lab — Development Roadmap & Service Mesh (TODO.md)

This document outlines ongoing architectural initiatives, subscription tier logic, and the balanced coordination strategy with auxiliary cloud infrastructure (Google Cloud Run, Cloud SQL, Firebase, and Google Workspace).

---

## 1. Subscription Tiers & Equitable Resource Balancing

To prevent service denial, rate exhaustion, and unbalanced billing while providing researchers and enterprise administrators with unconstrained capabilities, the platform maintains four distinct access strata:

| Resource Dimension | Free Explorer | Pro Researcher | Unlimited Scholar | ADMIN & Root Mesh |
| :--- | :--- | :--- | :--- | :--- |
| **Target Audience** | Casual learners, quick trials | Academics, PhD candidates, engineers | Enterprise research teams, think tanks | Systems architects, root operators |
| **Dialectic Inquiries / Day** | 20 turns / 24h | 250 turns / 24h | Uncapped | Uncapped (Bypass Quotas) |
| **Model Access** | `gemini-3.1-flash-lite` | `gemini-3.8-flash` + `gemini-3.1-pro-preview` | All models + Extended Thinking | Unrestricted + Model Override |
| **Gemini Live Duplex Voice** | 10 mins audio / session | 120 mins audio / session | Uncapped continuous stream | Continuous + Debug packet inspector |
| **TTS Audio Synthesis** | Browser Web Speech API | 24kHz HD Gemini TTS (Zephyr/Fenrir) | HD Multi-Persona TTS + Caching | Raw PCM stream + AudioWorklet taps |
| **GPU Particle Field** | 100,000 particles | 150,000 particles | 250,000 particles | Configurable (up to 500,000) |
| **Research Cases (Topics)** | Max 3 active cases | Unlimited cases | Unlimited + Cloud Sync | Global Case Index + Export All |
| **Semantic Vector Memory** | Local ephemeral store | Top-5 cosine vector search | Full vector archive + embeddings | Direct Vector Purge / Seed / Re-index |
| **High Demand Failover** | Standard queue | Priority Exponential Backoff | Highest-tier priority bypass | Zero-wait dedicated pool |
| **PDF & Data Exports** | Standard text summary | Full Case JSON + Standard PDF | High-Resolution Analytical Report | Automated Batch Dossier Generation |

---

## 2. Multi-Service Coordination Strategy (Balanced Approach)

The application acts as a central cognitive orchestrator. In future iterations, it coordinates with external microservices without creating tight couplings or breaking offline resilience:

### A. Google Cloud Run (Hosting & Autoscaling)
- [x] Stateless containerization with multi-stage Dockerfile and healthchecks.
- [ ] Auto-scale from 0 to N instances based on CPU utilization and active WebSocket duplex connections.
- [ ] Session affinity (sticky sessions) for persistent Gemini Live WebSocket channels.

### B. Relational Data Layer (Cloud SQL / PostgreSQL)
- [ ] Asynchronous persistence of research cases into structured schemas via Drizzle ORM (`cases`, `transcripts`, `analysis_nodes`).
- [ ] Multi-tenant partitioning for Enterprise research teams.
- [ ] Free tier fallback: LocalStorage persistence operates transparently if Cloud SQL is unreachable.

### C. Authentication & State (Firebase Auth & Firestore)
- [ ] User role verification (Free, Pro, Unlimited, ADMIN claims).
- [ ] Real-time sync of case transcripts across desktop and mobile browsers via Firestore listeners.
- [ ] Secure row-level security rules enforcing topic isolation per authenticated user ID.

### D. Google Workspace Ecosystem (Client-Side OAuth)
- [ ] Google Drive export: Directly save completed research case briefs as Google Docs.
- [ ] Google Sheets sync: Stream quantitative telemetry (OKLab L, a, b values and audio spectrum metrics) into analysis sheets.
- [ ] Google Calendar integration: Schedule asynchronous Socratic debate sessions with reminder triggers.

---

## 3. Immediate Implementation Tasks (Active Sprint)

- [x] **Top Case Manager Bar**: Build isolated case switcher above the workspace with topics counter badge.
- [x] **Initial Open Entry Hub**: Provide seamless onboarding with quick domain selectors and tour launcher.
- [x] **Interactive Personalisation Tour**: 7-step guided highlight tour + aesthetic calibration drawer.
- [x] **Multi-Language Engine**: Default English with 8 world languages + Czech.
- [x] **Subscription Modal**: Interactive UI for testing plan limits and toggling Admin mode.
- [x] **PDF Documentation**: Generate one-click downloadable manual via `jsPDF`.
- [x] **Push-to-Talk (Hard Default)**: Universal microphone controller with dynamic color change, Spacebar hold shortcut, and open mic toggle.
- [x] **Studio Sound Engineer DSP Chain**: Downward expander, 85Hz HPF, 2.8kHz clarity presence EQ, vocal leveling compressor, brickwall peak limiter, and 12ms anti-click soft ramps.
- [ ] **Vector Database Remote Synchronization**: Connect local in-memory vector store with Cloud SQL `pgvector`.
- [ ] **Multi-Voice Dual Debater Mode**: Allow two synthetic personas (e.g. Zephyr vs Fenrir) to engage in dialectical disputation with each other while user moderates.
- [ ] **Offline PWA Worker**: Cache Three.js particle shaders and OKLab conversion math for disconnected mode.
