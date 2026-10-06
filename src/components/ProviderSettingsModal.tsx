import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Key,
  Sliders,
  Download,
  Upload,
  CheckCircle2,
  X,
  Volume2,
  Layers,
  Sparkles,
  Shield,
  FileCode,
  Terminal,
} from 'lucide-react';
import { ProviderRegistry, DEFAULT_PROVIDER_SETTINGS } from '../utils/providerRegistry';
import { ProviderSettings } from '../types/providers';

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  onVectorStoreChanged?: () => void;
}

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  lang = 'cs',
  onVectorStoreChanged,
}) => {
  const registry = ProviderRegistry.getInstance();
  const [settings, setSettings] = useState<ProviderSettings>(registry.getSettings());
  const [activeTab, setActiveTab] = useState<'providers' | 'models' | 'storage' | 'dsp'>('providers');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [modelDownloadProgress, setModelDownloadProgress] = useState<Record<string, number>>({});
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(registry.getSettings());
      setSaveStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    registry.updateSettings(settings);
    setSaveStatus(lang === 'cs' ? 'Nastavení uloženo' : 'Settings saved');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleExportMemory = async () => {
    const store = registry.getVectorStore();
    const dump = await store.exportDump();
    const blob = new Blob([dump], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaporsphere-memory-store-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMemory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const count = await registry.getVectorStore().importDump(text);
      setImportStatus(lang === 'cs' ? `Importováno ${count} konceptů.` : `Imported ${count} concepts.`);
      if (onVectorStoreChanged) onVectorStoreChanged();
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: any) {
      setImportStatus(`Chyba: ${err.message}`);
    }
  };

  const handleSimulateModelDownload = (modelName: string) => {
    setModelDownloadProgress((prev) => ({ ...prev, [modelName]: 5 }));
    const interval = setInterval(() => {
      setModelDownloadProgress((prev) => {
        const cur = prev[modelName] || 0;
        if (cur >= 100) {
          clearInterval(interval);
          return { ...prev, [modelName]: 100 };
        }
        return { ...prev, [modelName]: cur + 15 };
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B0E17] border border-cyan-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#07090E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>{lang === 'cs' ? 'Desktop & Kognitivní Provider Konfigurace' : 'Desktop & Cognitive Provider Setup'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ADR 002 Solo Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'cs'
                  ? 'Nativní Tauri desktop architektura, offline modely llama.cpp, lokální vektorová paměť a studiové DSP.'
                  : 'Native Tauri host, offline llama.cpp models, local vector storage and studio audio DSP.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#090D16] px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'providers'
                ? 'border-cyan-400 text-cyan-300 bg-[#0B0E17]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{lang === 'cs' ? 'AI Providery' : 'AI Providers'}</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'models'
                ? 'border-cyan-400 text-cyan-300 bg-[#0B0E17]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{lang === 'cs' ? 'Lokální Modely (llama.cpp / Ollama)' : 'Local Models'}</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'storage'
                ? 'border-cyan-400 text-cyan-300 bg-[#0B0E17]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{lang === 'cs' ? 'Lokální Paměť (sqlite-vec)' : 'Vector Storage'}</span>
          </button>

          <button
            onClick={() => setActiveTab('dsp')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'dsp'
                ? 'border-cyan-400 text-cyan-300 bg-[#0B0E17]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{lang === 'cs' ? 'Univerzální DSP Worklet' : 'Audio DSP Worklet'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI Providers */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Gemini Server Proxy */}
                <div
                  onClick={() => setSettings({ ...settings, activeProviderId: 'gemini_proxy' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.activeProviderId === 'gemini_proxy'
                      ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-400/50'
                      : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-100">Gemini Live & Flash</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Cloud Duplex
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Integrovaný obousměrný WebSocket stream s modálním hlasem a ultra-rychlou syntézou.
                  </p>
                  <div className="text-[11px] font-mono text-cyan-400">gemini-2.5-flash</div>
                </div>

                {/* 2. Ollama Local */}
                <div
                  onClick={() => setSettings({ ...settings, activeProviderId: 'ollama_local' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.activeProviderId === 'ollama_local'
                      ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-400/50'
                      : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-100">Ollama (Offline)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Local IPC
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Lokální inference na GPU/CPU. Plně soukromé, žádná data neopouštějí váš disk.
                  </p>
                  <div className="text-[11px] font-mono text-amber-400">{settings.selectedLocalModel}</div>
                </div>

                {/* 3. Tauri Native llama.cpp */}
                <div
                  onClick={() => setSettings({ ...settings, activeProviderId: 'tauri_ipc' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.activeProviderId === 'tauri_ipc'
                      ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-400/50'
                      : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-100">Tauri Rust Native</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Rust FFI
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Nativní integrace přes Rust C-Bindings přímo do GGUF modelů bez externího démona.
                  </p>
                  <div className="text-[11px] font-mono text-purple-400">llama.cpp embedded</div>
                </div>
              </div>

              {/* Provider Details & Custom Key configuration */}
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Vlastní Gemini API Klíč (Bypass Rate Limits & Quotas)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Můžete zadat svůj vlastní Google AI Studio API klíč. Klíč je uložen pouze ve vašem lokálním prohlížeči / desktop sandboxu.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={settings.userGeminiApiKey}
                    onChange={(e) => setSettings({ ...settings, userGeminiApiKey: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#0B0E17] border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                  {settings.userGeminiApiKey && (
                    <button
                      onClick={() => setSettings({ ...settings, userGeminiApiKey: '' })}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300"
                    >
                      Smazat
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Ollama Server URL (výchozí: http://localhost:11434)
                  </label>
                  <input
                    type="text"
                    value={settings.ollamaBaseUrl}
                    onChange={(e) => setSettings({ ...settings, ollamaBaseUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B0E17] border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Local Models (llama.cpp) */}
          {activeTab === 'models' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">GGUF Modely na lokálním disku</h3>
                  <p className="text-xs text-slate-400">
                    Sokratovská dekonstrukce běží v Rust/llama.cpp runtime bez odesílání jediného tokenu na internet.
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
                  Cesta: ~/.vaporsphere/models/
                </div>
              </div>

              {/* Model Cards */}
              {[
                {
                  id: 'llama-3.2-3b',
                  name: 'Llama 3.2 3B Instruct (GGUF Q4_K_M)',
                  size: '2.02 GB',
                  vram: '2.4 GB VRAM / RAM',
                  desc: 'Blesková inference vhodná pro dialog v reálném čase, formulaci oponentských tezí a reflexi axiomů.',
                  downloaded: true,
                },
                {
                  id: 'mistral-7b-v0.3',
                  name: 'Mistral 7B Instruct v0.3 (GGUF Q4_K_M)',
                  size: '4.37 GB',
                  vram: '5.2 GB VRAM / RAM',
                  desc: 'Hluboká sémantická analýza, postgraduální epistemologická syntéza a komplexní izomorfismy.',
                  downloaded: false,
                },
                {
                  id: 'qwen-2.5-7b',
                  name: 'Qwen 2.5 7B Math & Logic (GGUF Q4_K_M)',
                  size: '4.68 GB',
                  vram: '5.5 GB VRAM / RAM',
                  desc: 'Exaktní fyzikální modely, matematické důkazy a teorie komplexních systémů.',
                  downloaded: false,
                },
              ].map((m) => {
                const progress = modelDownloadProgress[m.id];
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#090D16] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200">{m.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {m.size}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {m.vram}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{m.desc}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
                      {m.downloaded || progress === 100 ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Připraveno</span>
                        </div>
                      ) : progress !== undefined ? (
                        <div className="w-32 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSimulateModelDownload(m.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Stáhnout GGUF</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: Local Vector Storage (sqlite-vec) */}
          {activeTab === 'storage' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Lokální Vektorové Úložiště (sqlite-vec & JSON Dump)
                </h3>
                <p className="text-xs text-slate-400">
                  Nahrazuje vzdálený PostgreSQL / pgvector. Vaše paměť případů, izomorfismů a sémantických embeddingů je uložena v jediném souboru.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-medium text-xs">
                    <Download className="w-4 h-4" />
                    <span>Záloha paměti (Export JSON)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Stáhněte veškeré uložené epistemologické koncepty a jejich embeddingy do čitelného souboru JSON.
                  </p>
                  <button
                    onClick={handleExportMemory}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportovat do souboru</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
                    <Upload className="w-4 h-4" />
                    <span>Obnovení paměti (Import JSON)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Načtěte koncepty a embeddingy z předchozího výzkumu do lokálního vektorového prostoru.
                  </p>
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Vybrat soubor JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportMemory}
                      className="hidden"
                    />
                  </label>
                  {importStatus && (
                    <p className="text-xs font-mono text-cyan-300 mt-1">{importStatus}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Universal Audio DSP Worklet */}
          {activeTab === 'dsp' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Univerzální AudioWorklet & DSP Channel Strip
                </h3>
                <p className="text-xs text-slate-400">
                  Studiové zpracování mikrofonního signálu chráněné Vitest testy pro eliminaci plosiv, šumu a digitálního zkreslení.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2.5">
                  <span className="text-xs font-mono text-cyan-300 font-semibold">1. High-Pass Filter (HPF)</span>
                  <div className="text-xs text-slate-400">
                    Mezní frekvence: <strong className="text-slate-200">85 Hz (12 dB/oct)</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Odřezává mechanické otřesy stolu, rezonance ventilátoru a nízkofrekvenční rázové vlny hlásek P/B.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2.5">
                  <span className="text-xs font-mono text-cyan-300 font-semibold">2. Downward Expander</span>
                  <div className="text-xs text-slate-400">
                    Práh: <strong className="text-slate-200">-36.5 dB</strong> | Útlum šumu: <strong className="text-slate-200">-28 dB</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    V tichu plynule potlačuje hluk místnosti bez nepříjemného usekávání konců vět.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2.5">
                  <span className="text-xs font-mono text-cyan-300 font-semibold">3. Vocal Dynamics Compressor</span>
                  <div className="text-xs text-slate-400">
                    Práh: <strong className="text-slate-200">-22 dB</strong> | Poměr: <strong className="text-slate-200">3.5:1</strong> | Attack: <strong className="text-slate-200">3 ms</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Vyrovnává dynamiku hlasu tak, aby tichý šepot i hlasitá argumentace měly shodnou srozumitelnost.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2.5">
                  <span className="text-xs font-mono text-cyan-300 font-semibold">4. Brickwall Peak Limiter</span>
                  <div className="text-xs text-slate-400">
                    Strop: <strong className="text-slate-200">-1.5 dBFS</strong> | Attack: <strong className="text-slate-200">1 ms</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Absolutní ochrana proti přebuzení a digitálnímu ořezu signálu vstupujícího do AI modelu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#07090E]">
          <div className="text-xs font-mono text-cyan-400">
            {saveStatus ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveStatus}</span>
              </span>
            ) : (
              <span>Aktivní: {settings.activeProviderId}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Zavřít
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors"
            >
              Uložit nastavení
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
