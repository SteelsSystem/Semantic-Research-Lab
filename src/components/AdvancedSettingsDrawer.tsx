import React from 'react';
import {
  X,
  Sliders,
  Cpu,
  Radio,
  Palette,
  ShieldCheck,
  FileCode,
  Info,
  Layers,
  Sparkles,
  HelpCircle,
  Mic,
  Maximize2,
} from 'lucide-react';
import {
  SessionModelType,
  TextModelType,
  VoicePersona,
  LanguageCode,
  VisualState,
} from '../types/cognitive';

interface AdvancedSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  // Models & Live
  selectedModel: SessionModelType;
  onSelectModel: (m: SessionModelType) => void;
  selectedTextModel: TextModelType;
  onSelectTextModel: (m: TextModelType) => void;
  liveConnected: boolean;
  // Voice & Audio
  selectedVoice: VoicePersona;
  onSelectVoice: (v: VoicePersona) => void;
  vadThreshold: number;
  onChangeVadThreshold: (val: number) => void;
  isPttMode: boolean;
  onTogglePttMode: (enabled: boolean) => void;
  dspEnabled: boolean;
  onToggleDsp: (enabled: boolean) => void;
  synthesizeTtsOnText: boolean;
  onToggleSynthesizeTts: (enabled: boolean) => void;
  highDemandResilient: boolean;
  onToggleHighDemandResilient: (enabled: boolean) => void;
  patientMode: boolean;
  onTogglePatientMode: (enabled: boolean) => void;
  // 3D Visual & OKLab
  particleCount: number;
  onChangeParticleCount: (n: number) => void;
  visualState: VisualState;
  onChangeVisualState: (fn: (prev: VisualState) => VisualState) => void;
  // Epistemic Prompt Context
  systemPromptOverride: string;
  onChangeSystemPromptOverride: (val: string) => void;
  onOpenProviderSettings: () => void;
}

export function AdvancedSettingsDrawer({
  isOpen,
  onClose,
  lang,
  selectedModel,
  onSelectModel,
  selectedTextModel,
  onSelectTextModel,
  liveConnected,
  selectedVoice,
  onSelectVoice,
  vadThreshold,
  onChangeVadThreshold,
  isPttMode,
  onTogglePttMode,
  dspEnabled,
  onToggleDsp,
  synthesizeTtsOnText,
  onToggleSynthesizeTts,
  highDemandResilient,
  onToggleHighDemandResilient,
  patientMode,
  onTogglePatientMode,
  particleCount,
  onChangeParticleCount,
  visualState,
  onChangeVisualState,
  systemPromptOverride,
  onChangeSystemPromptOverride,
  onOpenProviderSettings,
}: AdvancedSettingsDrawerProps) {
  if (!isOpen) return null;

  const isCs = lang === 'cs';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md bg-[#0B0E17] border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#07090E]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              {isCs ? 'Rozšířené Parametry & Nastavení' : 'Advanced Parameters & Settings'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCs ? 'Zavřít panel nastavení' : 'Close settings drawer'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-200">
          {/* Quick link to Provider Settings modal */}
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-cyan-300 block">
                {isCs ? 'Providery & Lokální Modely' : 'Providers & Local Models'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isCs ? 'Ollama, llama.cpp, vlastní Gemini API klíč' : 'Ollama, llama.cpp, custom Gemini API key'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProviderSettings();
              }}
              className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-[11px] transition-colors whitespace-nowrap"
            >
              {isCs ? 'Nastavit' : 'Configure'}
            </button>
          </div>

          {/* Section 1: AI Model Architectures */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isCs ? '01. AI Modely & Architektura' : '01. AI Models & Architecture'}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">
                    {isCs ? 'Hlasový Live Model' : 'Live Voice Model'}
                  </label>
                  <span
                    className="text-[10px] text-slate-500 cursor-help"
                    title={isCs ? 'Model obsluhující obousměrný WebRTC audio stream s nízkou latencí.' : 'Model powering duplex WebRTC audio stream with low latency.'}
                  >
                    ⓘ
                  </span>
                </div>
                <select
                  value={selectedModel}
                  onChange={(e) => onSelectModel(e.target.value as SessionModelType)}
                  disabled={liveConnected}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-3.8-live-extended-thinking">gemini-3.8-live-extended-thinking</option>
                  <option value="gemini-3.8-live">gemini-3.8-live (Nízká latence)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">
                    {isCs ? 'Model textové disputace' : 'Text Disputation Model'}
                  </label>
                  <span
                    className="text-[10px] text-slate-500 cursor-help"
                    title={isCs ? 'Model pro hloubkovou analýzu premis a generování větvících otázek.' : 'Model for deep premise deconstruction and branching questions.'}
                  >
                    ⓘ
                  </span>
                </div>
                <select
                  value={selectedTextModel}
                  onChange={(e) => onSelectTextModel(e.target.value as TextModelType)}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Rychlý & reaktivní)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Vysoká propustnost)</option>
                  <option value="gemini-flash-latest">gemini-flash-latest</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Hluboké uvažování)</option>
                  <option value="auto-resilient">auto-resilient (Adaptivní záloha)</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-slate-800" />

          {/* Section 2: Audio & Voice Parameters */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isCs ? '02. Hlas & Akustické Parametry' : '02. Voice & Acoustic Parameters'}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  {isCs ? 'Syntetizovaný Hlas' : 'Voice Persona'}
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => onSelectVoice(e.target.value as VoicePersona)}
                  disabled={liveConnected}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="Zephyr">Zephyr (Analytický)</option>
                  <option value="Fenrir">Fenrir (Baryton)</option>
                  <option value="Kore">Kore (Exaktní)</option>
                  <option value="Charon">Charon (Hluboký)</option>
                  <option value="Puck">Puck (Dynamický)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span
                    className="text-slate-400 cursor-help"
                    title={isCs ? 'Hladina RMS, při které váš hlas okamžitě přeruší odpověď modelu (barge-in).' : 'RMS level that immediately cuts off model speech when you speak.'}
                  >
                    VAD Práh Přerušení (RMS) ⓘ
                  </span>
                  <span className="font-mono text-cyan-400">{vadThreshold.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={0.02}
                  max={0.2}
                  step={0.005}
                  value={vadThreshold}
                  onChange={(e) => onChangeVadThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#07090E] border border-slate-800">
                <span
                  className="text-slate-300 cursor-help"
                  title={isCs ? 'Ztlumí mikrofon, dokud nestisknete mezerník nebo tlačítko mikrofonu.' : 'Keeps mic muted until spacebar or button is pressed.'}
                >
                  Push-to-Talk (PTT) ⓘ
                </span>
                <input
                  type="checkbox"
                  checked={isPttMode}
                  onChange={(e) => onTogglePttMode(e.target.checked)}
                  className="accent-cyan-400 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#07090E] border border-slate-800">
                <span
                  className="text-slate-300 cursor-help"
                  title={isCs ? 'Aktivuje Downward Expander a Studio Limiter pro potlačení šumu.' : 'Enables Downward Expander and Peak Limiter noise suppression.'}
                >
                  DSP Expander & Limiter ⓘ
                </span>
                <input
                  type="checkbox"
                  checked={dspEnabled}
                  onChange={(e) => onToggleDsp(e.target.checked)}
                  className="accent-cyan-400 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#07090E] border border-slate-800">
                <span
                  className="text-slate-300 cursor-help"
                  title={isCs ? 'Automaticky přečte sokratovskou odpověď syntetizovaným hlasem.' : 'Automatically read out Socratic responses with synthetic voice.'}
                >
                  Automatická hlasová odpověď ⓘ
                </span>
                <input
                  type="checkbox"
                  checked={synthesizeTtsOnText}
                  onChange={(e) => onToggleSynthesizeTts(e.target.checked)}
                  className="accent-cyan-400 cursor-pointer w-4 h-4"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-800" />

          {/* Section 3: 3D Sphere & OKLab Visual Controls */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isCs ? '03. 3D Sféra & OKLab Kolorimetrie' : '03. 3D Sphere & OKLab Color'}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Počet GPU Částic</span>
                  <span className="font-mono text-cyan-400">{particleCount.toLocaleString()}</span>
                </div>
                <select
                  value={particleCount}
                  onChange={(e) => onChangeParticleCount(Number(e.target.value))}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value={100000}>100 000 částic (Úsporný)</option>
                  <option value={120000}>120 000 částic (Standardní)</option>
                  <option value={180000}>180 000 částic (Vysoký)</option>
                  <option value={250000}>250 000 částic (Ultra detail)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Světlost L (Lightness)</span>
                  <span className="font-mono text-cyan-400">{visualState.L.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.95}
                  step={0.01}
                  value={visualState.L}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeVisualState((prev) => ({ ...prev, L: val }));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Turbulence (Curl Noise)</span>
                  <span className="font-mono text-cyan-400">{visualState.turbulence.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  value={visualState.turbulence}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeVisualState((prev) => ({ ...prev, turbulence: val }));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Hustota Částic (Density)</span>
                  <span className="font-mono text-cyan-400">{visualState.density.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.8}
                  step={0.05}
                  value={visualState.density}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeVisualState((prev) => ({ ...prev, density: val }));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-800" />

          {/* Section 4: Epistemic Custom Prompt Injection */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isCs ? '04. Epistemické Zadání & Prompt' : '04. Epistemic Prompt Context'}</span>
            </h3>

            <div>
              <label className="block text-slate-400 mb-1">
                {isCs ? 'Vlastní filozofický axiom / instrukce' : 'Custom Philosophical Grounding'}
              </label>
              <textarea
                value={systemPromptOverride}
                onChange={(e) => onChangeSystemPromptOverride(e.target.value)}
                placeholder={isCs ? 'Např.: Soustřeď se na epistemologický status vnímání a radikální skepticismus...' : 'e.g. Prioritize epistemological fallibilism and aporia...'}
                rows={3}
                className="w-full bg-[#07090E] border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#07090E] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">Auto-saved to localStorage</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            {isCs ? 'Hotovo' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
