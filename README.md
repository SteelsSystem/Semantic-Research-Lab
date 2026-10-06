# VaporSphere Dialectical Lab

Autonomous Socratic Elenctics, OKLab Acoustic Particle Engine & Local Offline Intelligence (Tauri v2 Desktop Host).

---

## 🚀 GitHub Automated Multi-Platform Releases (On Push)

Every push to `main` / `master` and every tag (`v*`) automatically builds and publishes full native releases for each operating system:

* **Windows**: `VaporSphere_*_x64-setup.exe` (NSIS Setup Wizard), `.msi`, and portable `.zip`
* **Linux**: `VaporSphere_*_amd64.AppImage`, `.deb`, and CachyOS / Arch Linux package bundle
* **macOS**: `VaporSphere_*_universal.dmg` (Universal binary for Apple Silicon M1–M4 & Intel Macs)

Workflows included:
* `.github/workflows/release-windows.yml` — Dedicated Windows `.EXE` and MSI release
* `.github/workflows/release-linux.yml` — Dedicated Linux AppImage, deb, and CachyOS release
* `.github/workflows/release-macos.yml` — Dedicated macOS universal DMG release
* `.github/workflows/release.yml` — Unified multi-platform release

---

## ⚡ 1-Line Installation Commands

The installer scripts dynamically query your GitHub repository releases:

### 🐧 Linux (CachyOS, Arch, Ubuntu, Debian, Fedora)

**Method A — 1-Line Universal Script:**
```bash
curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPOSITORY:-vaporsphere/vaporsphere}/main/scripts/install.sh | bash
```

**Method B — Native CachyOS / Arch Linux PKGBUILD:**
```bash
# Optimized for x86-64-v3/v4 CPU microarchitectures
curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPOSITORY:-vaporsphere/vaporsphere}/main/scripts/PKGBUILD -o PKGBUILD && makepkg -si
```

**Method C — Dedicated Linux Installer with AppImage:**
```bash
curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPOSITORY:-vaporsphere/vaporsphere}/main/scripts/install-linux.sh | bash
```

---

### 🪟 Windows 10 & 11 (.EXE Setup Wizard & PowerShell)

**Method A — Standard Windows .EXE Setup Wizard:**
* Download the `VaporSphere_*_x64-setup.exe` installer from your repository's Releases page.
* Double-click to launch the setup wizard (creates Desktop and Start Menu shortcuts).

**Method B — 1-Line PowerShell Installation:**
```powershell
irm https://raw.githubusercontent.com/$($env:GITHUB_REPOSITORY ?? "vaporsphere/vaporsphere")/main/scripts/install-windows.ps1 | iex
```

**Method C — Command Prompt (CMD) Setup Assistant:**
```cmd
curl -fsSL https://raw.githubusercontent.com/%GITHUB_REPOSITORY%/main/scripts/install-windows.cmd -o install.cmd && install.cmd
```

---

### 🍎 macOS (Apple Silicon M-Series & Intel)

**Method A — 1-Line Terminal Command:**
```bash
curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPOSITORY:-vaporsphere/vaporsphere}/main/scripts/install-macos.sh | bash
```

**Method B — Direct DMG Disk Image:**
* Download `VaporSphere_*_universal.dmg` from the Releases page.
* Double-click to open and drag `VaporSphere.app` to `/Applications`.

---

## 🛠️ Building & Packaging Locally

You can test and generate all releases locally without requiring GitHub Actions:

```bash
# 1. Install dependencies & verify audio DSP tests
npm install
npm test

# 2. Build production assets
npm run build

# 3. Generate multi-platform icon suite
python3 scripts/generate-icons.py

# 4. Package portable distributions (Windows .zip, Linux tar.gz, macOS tar.gz)
node scripts/package-portable.js

# 5. Build native desktop binary via Tauri (requires Rust)
npm run tauri build
```

---

## 🔬 Core Capabilities
* **ADR 002 Solo Mode**: Standalone desktop lab with zero multi-user telemetry.
* **OKLab Acoustic Synthesis**: Asymmetric envelope ballistics with Downward Expander & 85Hz HPF.
* **Provider Flexibility**: Seamless switching between Gemini API, local Ollama, or Tauri native llama.cpp.
* **High-Capacity Vector Memory**: Persistent IndexedDB storage + sqlite-vec semantic search.
