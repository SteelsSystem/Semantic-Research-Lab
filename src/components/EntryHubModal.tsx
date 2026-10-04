import React, { useState } from 'react';
import {
  Compass,
  Plus,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  FileText,
  Volume2,
  Cpu,
  Globe,
  Sliders,
  Check
} from 'lucide-react';
import { DOMAIN_PROFILES, DomainProfile, LanguageCode, ResearchCase } from '../types/cognitive';
import { TRANSLATIONS } from '../utils/i18n';
import { generateSimpleGuidePdf } from '../utils/pdfGenerator';

interface EntryHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  cases: ResearchCase[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onStartNewCase: (title: string, profile?: DomainProfile) => void;
  onStartTour: () => void;
  onOpenDocs: () => void;
  dontShowAgain: boolean;
  onToggleDontShowAgain: (val: boolean) => void;
  onSelectLanguage: (code: LanguageCode) => void;
}

export function EntryHubModal({
  isOpen,
  onClose,
  lang,
  cases,
  activeCaseId,
  onSelectCase,
  onStartNewCase,
  onStartTour,
  onOpenDocs,
  dontShowAgain,
  onToggleDontShowAgain,
  onSelectLanguage,
}: EntryHubModalProps) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [customTitle, setCustomTitle] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DomainProfile | null>(null);

  if (!isOpen) return null;

  const handleLaunchCustomCase = () => {
    onStartNewCase(customTitle || 'New Research Inquiry', selectedDomain || undefined);
    onClose();
  };

  const handleSelectPrebuilt = (profile: DomainProfile) => {
    onStartNewCase(profile.name, profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#090D16] border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Glow header banner */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>{t.welcomeTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.welcomeSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Language Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={lang}
                onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="en">English 🇬🇧</option>
                <option value="cs">Čeština 🇨🇿</option>
                <option value="es">Español 🇪🇸</option>
                <option value="de">Deutsch 🇩🇪</option>
                <option value="fr">Français 🇫🇷</option>
                <option value="ja">日本語 🇯🇵</option>
                <option value="zh">简体中文 🇨🇳</option>
                <option value="ar">العربية 🇸🇦</option>
                <option value="pt">Português 🇧🇷</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 4 Feature Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Card 1: Start New Case */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-[#0c1220] border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider">
                    Tabula Rasa
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {t.entryActionNew}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {t.entryActionNewDesc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={t.hypothesisLabel}
                  className="flex-1 bg-[#07090E] border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleLaunchCustomCase}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded text-xs transition-colors shrink-0"
                >
                  {t.newTopic}
                </button>
              </div>
            </div>

            {/* Card 2: Guided Tour */}
            <button
              onClick={() => {
                onClose();
                onStartTour();
              }}
              className="text-left p-4 rounded-lg bg-gradient-to-br from-slate-900 to-[#0c1220] border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider">
                    Interactive Walkthrough
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-200 group-hover:text-amber-300 transition-colors">
                  {t.entryActionTour}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {t.entryActionTourDesc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs text-amber-400 font-medium">
                <span>Start Personalisation Tour</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Card 3: Resume Cases */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-[#0c1220] border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded bg-purple-500/10 text-purple-400">
                    <Layers className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-purple-300/80">
                    {cases.length} {t.topicsProcessedBadge}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-200">{t.entryActionResume}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.entryActionResumeDesc}</p>
              </div>

              <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {cases.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c.id);
                      onClose();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      c.id === activeCaseId
                        ? 'bg-purple-950/60 border border-purple-500/40 text-purple-200'
                        : 'bg-[#07090E] border border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {c.transcripts.length} turns
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 4: Documentation & PDF */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-[#0c1220] border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider">
                    User Manual (.PDF)
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {t.entryActionDocs}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {t.entryActionDocsDesc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    onClose();
                    onOpenDocs();
                  }}
                  className="text-xs text-emerald-400 font-medium hover:underline flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.navDocs}</span>
                </button>
                <button
                  onClick={generateSimpleGuidePdf}
                  className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>Download .PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Domain Launchers */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.quickDomains}</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">5 Curated Epistemic Paradigms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {DOMAIN_PROFILES.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => handleSelectPrebuilt(prof)}
                  className="text-left p-3 rounded-lg bg-[#07090E] border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400">{prof.subtitle}</span>
                    <h5 className="text-xs font-semibold text-slate-200 mt-0.5 group-hover:text-cyan-300 transition-colors">
                      {prof.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {prof.sampleHypothesis}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-cyan-400/80 font-mono flex items-center gap-1">
                    <span>Launch Paradigm</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#07090E] flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => onToggleDontShowAgain(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span className="text-[11px]">{t.dontShowAgain}</span>
          </label>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <span>{t.enterArena}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
