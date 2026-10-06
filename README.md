# VaporSphere Dialectical Lab

[![CI & Audio DSP](https://github.com/vaporsphere/vaporsphere/actions/workflows/ci.yml/badge.svg)](https://github.com/vaporsphere/vaporsphere/actions/workflows/ci.yml)
[![Release](https://github.com/vaporsphere/vaporsphere/actions/workflows/release.yml/badge.svg)](https://github.com/vaporsphere/vaporsphere/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)

Autonomous Socratic Elenctics, OKLab Acoustic Particle Engine & Local Offline Intelligence (Tauri v2 Desktop Host).

---

## ⚡ 1-Line Simple Installation

Choose your operating system below for immediate installation from GitHub Releases:

### 🐧 CachyOS & Arch Linux

CachyOS features x86-64-v3/v4 microarchitecture optimization and the BORE kernel.

**Method A — 1-Line Universal Script (Recommended):**
```bash
curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install.sh | bash
```

**Method B — Native Arch / CachyOS PKGBUILD:**
```bash
curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/PKGBUILD -o PKGBUILD && makepkg -si
```

---

### 🐧 Ubuntu, Debian, Fedora & Generic Linux

Universal AppImage with automatic menu integration:

```bash
curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-linux.sh | bash
```

---

### 🍎 macOS (Apple Silicon M-Series & Intel)

Universal `.dmg` installer with automatic quarantine removal:

```bash
curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-macos.sh | bash
```

---

### 🪟 Windows 10 & 11 (.EXE Setup Installer & Terminal)

**Method A — Standard Windows .EXE Setup Wizard:**
* Download [VaporSphere_0.2.0_x64-setup.exe](https://github.com/vaporsphere/vaporsphere/releases/latest) (NSIS Setup wizard with Start Menu and Desktop shortcuts).

**Method B — 1-Line PowerShell Installation:**
```powershell
irm https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-windows.ps1 | iex
```

**Method C — 1-Line Command Prompt (CMD):**
```cmd
curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-windows.cmd -o install.cmd && install.cmd
```

---

## 📦 GitHub Release Assets

Every release tagged `v*` automatically builds and publishes the following binaries:

| Platform | Format | Architectures |
|---|---|---|
| **Windows** | `VaporSphere_*_x64-setup.exe` (NSIS), `.msi`, `.zip` | `x64` |
| **Linux (CachyOS / Arch / Ubuntu)** | `.AppImage`, `.deb`, `tar.gz` | `x86_64`, `aarch64` |
| **macOS** | `.dmg`, `.app.tar.gz` | `universal` (Apple Silicon + Intel) |

---

## 🛠️ Building from Source

```bash
# 1. Clone repository
git clone https://github.com/vaporsphere/vaporsphere.git
cd vaporsphere

# 2. Install dependencies & verify DSP unit tests
npm install
npm test

# 3. Build standalone production assets
npm run build

# 4. Build native desktop bundle via Tauri
cargo tauri build
```

---

## 🔬 Core Features
* **ADR 002 Solo Mode**: Standalone desktop tool for solo dialectical researchers.
* **OKLab Acoustic Synthesis**: Asymmetric envelope ballistics with Downward Expander & 85Hz HPF.
* **Provider Abstraction**: Switch between Gemini (Cloud/API key), local Ollama, or Tauri native llama.cpp.
* **sqlite-vec Memory**: Offline vector memory retrieval with IndexedDB persistent storage.
