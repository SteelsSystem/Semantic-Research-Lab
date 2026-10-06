import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Download,
  Cpu,
  Laptop,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  FileCode,
  FolderDown,
  RefreshCw
} from 'lucide-react';
import { LanguageCode } from '../types/cognitive';

interface InstallHubViewProps {
  lang: LanguageCode;
}

type OsTab = 'cachyos' | 'linux' | 'macos' | 'windows' | 'source';

export function InstallHubView({ lang }: InstallHubViewProps) {
  const [selectedTab, setSelectedTab] = useState<OsTab>('cachyos');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const isCs = lang === 'cs';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0C1220] via-[#0E172A] to-[#131F38] border border-cyan-500/30 shadow-xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Download className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isCs ? '1-Řádková instalace pro desktop & GitHub Releases' : '1-Line Desktop Installation & GitHub Releases'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  v0.2.0 Standalone
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isCs
                  ? 'Nativní Tauri hostitel, offline lokální LLM (llama.cpp) a audio DSP matematika bez závislosti na cloudu.'
                  : 'Native Tauri host, offline local LLM (llama.cpp), and audio DSP mathematics with zero cloud lock-in.'}
              </p>
            </div>
          </div>

          <a
            href="https://github.com/vaporsphere/vaporsphere/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>GitHub Releases</span>
          </a>
        </div>
      </div>

      {/* OS Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#07090E] border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setSelectedTab('cachyos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            selectedTab === 'cachyos'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>CachyOS & Arch Linux</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-900/40 text-current">
            x86-64-v3/v4
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab('linux')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            selectedTab === 'linux'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Ubuntu, Debian & Generic Linux</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab('macos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            selectedTab === 'macos'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>macOS (Apple Silicon & Intel)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab('windows')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            selectedTab === 'windows'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Windows (PowerShell 1-Liner)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab('source')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            selectedTab === 'source'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>{isCs ? 'Stavba ze zdrojáků' : 'Build from Source'}</span>
        </button>
      </div>

      {/* Tab 1: CachyOS & Arch Linux */}
      {selectedTab === 'cachyos' && (
        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-cyan-200 flex items-center gap-2">
                <span>CachyOS & Arch Linux: Blesková instalace</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                  DOPORUČENO PRO CACHYOS
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isCs
                  ? 'CachyOS disponuje optimalizovaným jádrem BORE a instrukčními sadami x86-64-v3/v4. Níže máte 2 ultra-jednoduché metody instalace:'
                  : 'CachyOS features the BORE kernel and x86-64-v3/v4 microarchitecture optimization. Choose either method below:'}
              </p>
            </div>
          </div>

          {/* Option A: 1-Line Universal Script */}
          <div className="p-4 rounded-xl bg-[#07090E] border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{isCs ? 'Metoda A: 1-řádkový automatický instalátor (AppImage + Desktop Ikona)' : 'Method A: 1-Line Automatic Installer'}</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install.sh | bash',
                    'cachyos-curl'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'cachyos-curl' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isCs ? 'Zkopírováno!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCs ? 'Kopírovat příkaz' : 'Copy Command'}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto select-all">
              curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install.sh | bash
            </pre>

            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>{isCs ? 'Automaticky nainstaluje webkit2gtk-4.1 a libayatana-appindicator přes pacman' : 'Automatically installs webkit2gtk-4.1 via pacman'}</li>
              <li>{isCs ? 'Stáhne nejnovější binárku z GitHub Releases do ~/.local/bin/vaporsphere' : 'Downloads latest binary into ~/.local/bin/vaporsphere'}</li>
              <li>{isCs ? 'Zaregistruje desktopovou ikonu a položku v menu (KDE / GNOME / Hyprland / Rofi)' : 'Registers desktop entry for your application launcher'}</li>
            </ul>
          </div>

          {/* Option B: Arch PKGBUILD */}
          <div className="p-4 rounded-xl bg-[#07090E] border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{isCs ? 'Metoda B: Nativní Arch / CachyOS balíček (makepkg -si)' : 'Method B: Native Arch / CachyOS PKGBUILD'}</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/PKGBUILD -o PKGBUILD && makepkg -si',
                    'cachyos-pkgbuild'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'cachyos-pkgbuild' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isCs ? 'Zkopírováno!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCs ? 'Kopírovat příkaz' : 'Copy Command'}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto select-all">
              curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/PKGBUILD -o PKGBUILD && makepkg -si
            </pre>

            <p className="text-[11px] text-slate-400">
              {isCs
                ? 'Vytvoří a nainstaluje oficiální balíček spravovaný přímo správcem pacman (lze kdykoliv čistě odinstalovat přes pacman -R vaporsphere-bin).'
                : 'Builds and installs an official package managed by pacman.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Ubuntu / Debian / Generic Linux */}
      {selectedTab === 'linux' && (
        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-cyan-200">Ubuntu, Debian, Fedora & Generic Linux</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isCs
                ? 'Univerzální instalátor automaticky detekuje vaši distribuci a nainstaluje běhové knihovny i desktopovou integraci.'
                : 'Universal installer automatically detects your distribution, packages, and desktop entries.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#07090E] border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>1-Line Terminal Install</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-linux.sh | bash',
                    'linux-generic'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'linux-generic' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isCs ? 'Zkopírováno!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCs ? 'Kopírovat příkaz' : 'Copy Command'}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto select-all">
              curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-linux.sh | bash
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: macOS */}
      {selectedTab === 'macos' && (
        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-cyan-200">macOS (Apple Silicon M1/M2/M3/M4 & Intel)</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isCs
                ? 'Skript automaticky stáhne nejnovější DMG, nainstaluje VaporSphere.app do /Applications a odstraní Gatekeeper karanténní atribut.'
                : 'Script downloads the latest DMG, installs VaporSphere.app into /Applications, and clears macOS quarantine flags.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#07090E] border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                <span>macOS Terminal 1-Liner</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-macos.sh | bash',
                    'macos-curl'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'macos-curl' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isCs ? 'Zkopírováno!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCs ? 'Kopírovat příkaz' : 'Copy Command'}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto select-all">
              curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-macos.sh | bash
            </pre>

            <p className="text-[11px] text-slate-400">
              {isCs
                ? 'Po dokončení spustíte aplikaci ze Spotlightu nebo příkazem `vaporsphere` v libovolném terminálu.'
                : 'Launch directly from Spotlight, Launchpad, or by running `vaporsphere`.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Windows (.EXE Setup & PowerShell) */}
      {selectedTab === 'windows' && (
        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-cyan-200 flex items-center gap-2">
              <span>Windows 10 / 11 (.EXE Setup Installer & PowerShell)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                NSIS .EXE
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isCs
                ? 'Stáhněte si standardní instalační program .EXE (průvodce instalací s ikonou na ploše a v nabídce Start), nebo použijte 1-řádkový terminálový příkaz:'
                : 'Download the standard .EXE setup wizard (creates desktop icon and Start Menu shortcuts) or use the 1-line terminal command:'}
            </p>
          </div>

          {/* Option 1: Direct .EXE Download */}
          <div className="p-4 rounded-xl bg-[#07090E] border border-cyan-900/60 flex flex-wrap items-center justify-between gap-3 shadow-md shadow-cyan-950/20">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>{isCs ? 'Přímé stažení Windows .EXE instalátoru' : 'Direct Download Windows .EXE Setup'}</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                VaporSphere_0.2.0_x64-setup.exe (~18 MB, bez nutnosti administrátorských práv)
              </p>
            </div>
            <a
              href="https://github.com/vaporsphere/vaporsphere/releases/latest/download/VaporSphere_0.2.0_x64-setup.exe"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isCs ? 'Stáhnout .EXE Instalátor' : 'Download .EXE Installer'}</span>
            </a>
          </div>

          {/* Option 2: PowerShell 1-Liner */}
          <div className="p-4 rounded-xl bg-[#07090E] border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>PowerShell 1-Liner (Automatické stažení a tichá instalace)</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'irm https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-windows.ps1 | iex',
                    'win-ps'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'win-ps' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isCs ? 'Zkopírováno!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCs ? 'Kopírovat příkaz' : 'Copy Command'}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto select-all">
              irm https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-windows.ps1 | iex
            </pre>
          </div>

          {/* Option 3: Command Prompt (CMD) 1-Liner */}
          <div className="p-4 rounded-xl bg-[#07090E] border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Příkazový řádek (CMD) 1-Liner</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-windows.cmd -o install.cmd && install.cmd',
                    'win-cmd'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'win-cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isCs ? 'Zkopírováno!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCs ? 'Kopírovat příkaz' : 'Copy Command'}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto select-all">
              curl -fsSL https://raw.githubusercontent.com/vaporsphere/vaporsphere/main/scripts/install-windows.cmd -o install.cmd && install.cmd
            </pre>
          </div>
        </div>
      )}

      {/* Tab 5: Build from Source */}
      {selectedTab === 'source' && (
        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-cyan-200">{isCs ? 'Kompilace přímo z repozitáře' : 'Compile from Repository'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isCs
                ? 'Vyžaduje Node.js 20+ a Rust toolchain (cargo).'
                : 'Requires Node.js 20+ and the Rust toolchain (cargo).'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#07090E] border border-slate-800/90 space-y-2.5 font-mono text-xs text-cyan-300">
            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 overflow-x-auto select-all">
{`git clone https://github.com/vaporsphere/vaporsphere.git
cd vaporsphere
npm install
npm test              # Ověří Vitest audio DSP matematiku
npm run build         # Sestaví Vite frontend
cargo tauri build     # Vytvoří finální nativní desktopovou binárku`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
