import React, { useState } from 'react';
import {
  FileText,
  Download,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Cpu,
  Layers,
  Sparkles,
  Radio,
  Palette,
  ShieldCheck,
  Check
} from 'lucide-react';
import { LanguageCode } from '../types/cognitive';
import { TRANSLATIONS } from '../utils/i18n';
import { generateSimpleGuidePdf, GUIDE_SECTIONS } from '../utils/pdfGenerator';
import { InstallHubView } from './InstallHubView';

interface DocumentationViewProps {
  lang: LanguageCode;
}

export function DocumentationView({ lang }: DocumentationViewProps) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      generateSimpleGuidePdf();
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 400);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#0C1220] via-slate-900 to-[#121A2E] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded bg-cyan-500/10 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              {t.simpleGuide} · v2.0
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{t.docsTitle}</h2>
          <p className="text-xs text-slate-400 max-w-2xl">{t.docsSubtitle}</p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-950" />
              <span>{lang === 'cs' ? 'PDF Stáhnuto!' : 'PDF Downloaded!'}</span>
            </>
          ) : downloading ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>{t.generatingPdf}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{t.downloadPdf}</span>
            </>
          )}
        </button>
      </div>

      {/* 1-Click Multi-Platform Installation Hub (CachyOS/Linux, macOS, Windows) */}
      <InstallHubView lang={lang} />

      {/* Guide Chapters in Clear, Plain English/Czech */}
      <div className="space-y-4">
        {GUIDE_SECTIONS.map((sec, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[#090D16] border border-slate-800/80 hover:border-slate-700 transition-colors space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                0{idx + 1}
              </span>
              <h3 className="text-sm font-bold text-cyan-200">{sec.title}</h3>
            </div>

            <div className="space-y-2 pl-8">
              {sec.points.map((pt, pIdx) => (
                <div key={pIdx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 mt-1.5 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fast Operational Cheat Sheet */}
      <div className="p-5 rounded-xl bg-[#07090E] border border-slate-800 space-y-3 text-xs">
        <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Quick Operational Cheat Sheet</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-mono">
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-cyan-300 font-bold block mb-1">To Interrupt Model:</span>
            <span className="text-slate-400">Speak normally into mic. Local VAD detects voice and immediately silences playback.</span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-cyan-300 font-bold block mb-1">To Switch Cases:</span>
            <span className="text-slate-400">Click the active case pill on top to switch topics or click (+) to start a fresh case.</span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-cyan-300 font-bold block mb-1">Kill-Switch:</span>
            <span className="text-slate-400">Click the red "Silence Kill-Switch" button in the top bar to stop all audio instantaneously.</span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-cyan-300 font-bold block mb-1">Change Language:</span>
            <span className="text-slate-400">Use the flag selector in the top right to switch between English (default), Czech, and 7 other languages.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
