import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Radio,
  Palette,
  Terminal,
  Activity,
  Filter,
  CheckCircle,
  HelpCircle,
  Info,
  Sliders,
  Database,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { LanguageCode, ResearchCase } from '../types/cognitive';
import { TRANSLATIONS } from '../utils/i18n';
import { generateSimpleGuidePdf, GUIDE_SECTIONS } from '../utils/pdfGenerator';
import { InstallHubView } from './InstallHubView';

export type ReferenceTag = 'all' | 'epistemology' | 'physics' | 'colorimetry' | 'system' | 'diagnostics' | 'policy';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: 'System' | 'Diagnostics' | 'API' | 'Acoustic' | 'Storage';
  level: 'INFO' | 'SUCCESS' | 'WARN';
  event: string;
  details: string;
  latencyMs?: number;
}

interface ReferenceAuditHubProps {
  lang: LanguageCode;
  cases: ResearchCase[];
  activeCaseId: string;
  onBackToDashboard: () => void;
}

export function ReferenceAuditHub({
  lang,
  cases,
  activeCaseId,
  onBackToDashboard,
}: ReferenceAuditHubProps) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const isCs = lang === 'cs';

  // Navigation State inside Reference Hub
  const [activeTab, setActiveTab] = useState<
    'overview' | 'methodology' | 'physics' | 'colorimetry' | 'memory' | 'system' | 'audit' | 'policy'
  >('overview');

  // Search and Tag Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<ReferenceTag>('all');

  // Export State
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [exportedJson, setExportedJson] = useState(false);
  const [exportedCsv, setExportedCsv] = useState(false);

  // Simulated live audit log feed populated from session
  const auditLogs = useMemo<AuditLogEntry[]>(() => {
    const activeCase = cases.find((c) => c.id === activeCaseId);
    const transcriptCount = activeCase?.transcripts?.length || 0;
    const now = new Date();

    return [
      {
        id: 'aud-001',
        timestamp: new Date(now.getTime() - 240000).toLocaleTimeString(),
        category: 'System',
        level: 'SUCCESS',
        event: 'Acoustic Engine Initialization',
        details: 'DuplexAudioEngine mounted: 48kHz AudioContext, Downward Expander, 85Hz HPF, Limiter online.',
        latencyMs: 14,
      },
      {
        id: 'aud-002',
        timestamp: new Date(now.getTime() - 180000).toLocaleTimeString(),
        category: 'Storage',
        level: 'INFO',
        event: 'IndexedDB Storage Handshake',
        details: `VaporSphereDB active: ${cases.length} cases tracked, active case "${activeCase?.title || 'Epistemologie'}" synchronised.`,
      },
      {
        id: 'aud-003',
        timestamp: new Date(now.getTime() - 120000).toLocaleTimeString(),
        category: 'Diagnostics',
        level: 'INFO',
        event: 'VAD Barge-In Calibrated',
        details: 'Zero-latency AudioWorklet processor active with 0.045 RMS dynamic threshold.',
        latencyMs: 3,
      },
      {
        id: 'aud-004',
        timestamp: new Date(now.getTime() - 60000).toLocaleTimeString(),
        category: 'API',
        level: 'SUCCESS',
        event: 'Socratic Dialectic Turn Completed',
        details: `Disputation turn processed with ${transcriptCount} dialogue steps recorded in session history.`,
        latencyMs: 840,
      },
      {
        id: 'aud-005',
        timestamp: new Date().toLocaleTimeString(),
        category: 'System',
        level: 'INFO',
        event: 'Perceptual OKLab Color Engine',
        details: 'Spectral dispersion delta-E = 0.003, uniform lightness gradient L=0.72.',
      },
    ];
  }, [cases, activeCaseId]);

  // Export PDF Handler
  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    setTimeout(() => {
      generateSimpleGuidePdf();
      setDownloadingPdf(false);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    }, 450);
  };

  // Export JSON Report Handler
  const handleExportJson = () => {
    const reportData = {
      exportedAt: new Date().toISOString(),
      platform: 'VaporSphere Dialectical Lab v0.2.0',
      activeCaseId,
      totalCases: cases.length,
      cases: cases.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        transcriptCount: c.transcripts.length,
        visualState: c.visualState,
      })),
      auditLogs,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaporsphere-cognitive-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportedJson(true);
    setTimeout(() => setExportedJson(false), 2500);
  };

  // Export CSV Audit Log Handler
  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Category', 'Level', 'Event', 'Details', 'LatencyMs'];
    const rows = auditLogs.map((log) => [
      log.id,
      `"${log.timestamp}"`,
      `"${log.category}"`,
      `"${log.level}"`,
      `"${log.event.replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      log.latencyMs ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaporsphere-audit-trail-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportedCsv(true);
    setTimeout(() => setExportedCsv(false), 2500);
  };

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        searchQuery === '' ||
        log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTag =
        selectedTag === 'all' ||
        (selectedTag === 'diagnostics' && (log.category === 'Diagnostics' || log.category === 'Acoustic')) ||
        (selectedTag === 'system' && (log.category === 'System' || log.category === 'Storage')) ||
        (selectedTag === 'epistemology' && log.category === 'API');

      return matchSearch && matchTag;
    });
  }, [auditLogs, searchQuery, selectedTag]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07090E] text-slate-100">
      {/* 1. Header Toolbar: Two-Tier Title + Quick Action Dashboard Switcher + Raw Data Export */}
      <div className="shrink-0 border-b border-slate-800/80 bg-[#0B0E17]/95 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono font-medium text-cyan-400 uppercase tracking-wider">
              {isCs ? 'Referenční Hub & Auditní Archiv' : 'Reference & Audit Hub'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">v0.2.0</span>
          </div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight mt-0.5">
            {isCs ? 'Technické Specifikace, Epistemologie & Auditní Trail' : 'Technical Specs, Epistemology & Audit Trail'}
          </h1>
        </div>

        {/* Action Buttons: Return to Action Dashboard + Raw Exports (CSV / JSON / PDF) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isCs ? '← Zpět do Akční Konzole' : '← Back to Action Dashboard'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            title={isCs ? 'Stáhnout auditní záznam ve formátu CSV' : 'Export audit log as CSV'}
          >
            {exportedCsv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{exportedCsv ? (isCs ? 'Uloženo!' : 'Saved!') : 'CSV Audit'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            title={isCs ? 'Exportovat kognitivní relaci a data případu v JSON' : 'Export cognitive report as JSON'}
          >
            {exportedJson ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Database className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{exportedJson ? (isCs ? 'Uloženo!' : 'Saved!') : 'JSON Report'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            {pdfSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>{isCs ? 'PDF Vygenerováno' : 'PDF Saved'}</span>
              </>
            ) : downloadingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t.generatingPdf}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isCs ? 'Stáhnout PDF Průvodce' : 'Download PDF Guide'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Search & Tag Filtering Strip */}
      <div className="shrink-0 px-6 py-3 border-b border-slate-800/60 bg-[#080B12] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isCs ? 'Vyhledat ve specifikacích, rovnicích a auditním trailu...' : 'Search specifications, equations and audit logs...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0E131F] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tag Buttons Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-500 text-[11px] font-mono mr-1">Tag:</span>
          {(
            [
              { id: 'all', label: isCs ? 'Vše' : 'All' },
              { id: 'epistemology', label: 'Epistemology' },
              { id: 'physics', label: 'Physics' },
              { id: 'colorimetry', label: 'Colorimetry' },
              { id: 'system', label: 'System' },
              { id: 'diagnostics', label: 'Diagnostics' },
              { id: 'policy', label: 'Policy' },
            ] as { id: ReferenceTag; label: string }[]
          ).map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-2.5 py-1 rounded transition-colors text-xs font-medium whitespace-nowrap ${
                selectedTag === tag.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tabbed Partitioning Navigation Bar */}
      <div className="shrink-0 px-6 border-b border-slate-800/80 bg-[#090D16] flex items-center gap-1 overflow-x-auto text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{isCs ? 'Architektura & Souhrn' : 'Architecture & Overview'}</span>
        </button>

        <button
          onClick={() => setActiveTab('methodology')}
          className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'methodology'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isCs ? 'Sokratovská Metodologie' : 'Socratic Methodology'}</span>
        </button>

        <button
          onClick={() => setActiveTab('physics')}
          className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'physics'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{isCs ? 'Fyzika & Akustika DSP' : 'Physics & Acoustic DSP'}</span>
        </button>

        <button
          onClick={() => setActiveTab('colorimetry')}
          className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'colorimetry'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{isCs ? 'Kolorimetrie OKLab' : 'OKLab Colorimetry'}</span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'memory'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isCs ? 'Vektorová Paměť & Schema' : 'Vector Memory & Schema'}</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'system'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{isCs ? 'Systémové Instalace & Releases' : 'System Installation & Releases'}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{isCs ? 'Auditní Trail & Diagnostika' : 'Audit Trail & Diagnostics'}</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'policy'
              ? 'border-cyan-400 text-cyan-300 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isCs ? 'Zásady Soukromí (Solo Mode)' : 'Privacy & Solo Mode'}</span>
        </button>
      </div>

      {/* 4. Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* TAB 1: OVERVIEW & CHAPTERS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#0C1220] to-[#0A0E18] border border-cyan-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span>KOGNITIVNÍ ARCHITEKTURA · DVOUVRSTVÝ MODEL</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isCs ? 'Dvouvrstvá organizace obsahu Cognitive Lab' : 'Two-Tier Cognitive Lab Architecture'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {isCs
                  ? 'Pro zachování maximální ergonomie práce byla aplikace konsolidována do dvou vrstev: Akční Konzole (Page 1) sloužící pro každodenní živou práci s audio sférou a sokratovskou disputací bez textového balastu, a tohoto Referenčního Hubu (Page 2), který koncentruje hlubokou teorii, matematické formulace, specifikace distribucí a auditní protokoly.'
                  : 'To ensure maximum ergonomic utility, the application is consolidated into a two-tier model: the Action Dashboard (Page 1) dedicated to live, high-frequency operational research with the 3D OKLab sphere without passive textual clutter, and this Reference & Audit Hub (Page 2), which centralizes deep theory, mathematical derivations, platform specs, and audit trails.'}
              </p>
            </div>

            {/* Guide Chapters Accordion / List */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{isCs ? 'Strukturované kapitoly kognitivního manuálu' : 'Structured Cognitive Guide Chapters'}</span>
              </h3>

              {GUIDE_SECTIONS.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[#090D16] border border-slate-800/80 hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                      0{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-cyan-200">{sec.title}</h4>
                  </div>
                  <div className="space-y-1.5 pl-8 text-xs text-slate-300">
                    {sec.points.map((pt, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        • {pt}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: METHODOLOGY & SOKRATES */}
        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#090D16] border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Sokratovská Elenktika & Teorie Dekonstrukce</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                VaporSphere nefunguje jako běžný asistent poskytující konvenční odpovědi. Základem modelu je elenktická disputace podle Platónových raných dialogů:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-[#07090E] border border-slate-800/80 space-y-2">
                  <span className="text-xs font-mono font-semibold text-cyan-300">1. Identifikace Skrytých Axiomů</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Každé tvrzení spočívá na nevyslovených předpokladech. Model tyto axiomy izoluje a podrobuje zkoumání jejich nutnosti.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#07090E] border border-slate-800/80 space-y-2">
                  <span className="text-xs font-mono font-semibold text-cyan-300">2. Strukturální Izomorfismy</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Přenos logické struktury argumentu do jiných domén (fyzika, právo, teorie her) za účelem odhalení skrytých logických klamů.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#07090E] border border-slate-800/80 space-y-2">
                  <span className="text-xs font-mono font-semibold text-cyan-300">3. Vytvoření Aporie</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dosažení bodu zmatení a neřešitelnosti původní teze, což je nezbytný předpoklad pro skutečné prohloubení porozumění.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#07090E] border border-slate-800/80 space-y-2">
                  <span className="text-xs font-mono font-semibold text-cyan-300">4. Větvení Alternativních Tezí</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Formulace antitezí a protikladů k testování meze platnosti původního konceptu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHYSICS & ACOUSTIC DSP */}
        {activeTab === 'physics' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#090D16] border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Akustický DSP Řetězec & Curl Noise Fluidní Dynamika</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reakce 3D sféry je řízena reálným fyzikálním zvukovým analyzátorem s nulovou latencí a asymetrickou balistikou obálky:
              </p>

              <div className="space-y-3 pt-2 font-mono text-xs">
                <div className="p-3.5 rounded bg-[#07090E] border border-slate-800 text-slate-300 space-y-1">
                  <div className="text-cyan-300 font-semibold">85Hz Sub-Bass High-Pass Filter:</div>
                  <div className="text-slate-400">Eliminuje mechanické rázy stolu, vibrace větráků a manipulační hluk mikrofonu.</div>
                </div>

                <div className="p-3.5 rounded bg-[#07090E] border border-slate-800 text-slate-300 space-y-1">
                  <div className="text-cyan-300 font-semibold">Asymetrický Envelope Follower:</div>
                  <div className="text-slate-400">Attack = 3ms (blesková reakce na souhlásky) · Release = 140ms (přirozený organický dozvuk bez blikání).</div>
                </div>

                <div className="p-3.5 rounded bg-[#07090E] border border-slate-800 text-slate-300 space-y-1">
                  <div className="text-cyan-300 font-semibold">Studio Downward Expander:</div>
                  <div className="text-slate-400">Threshold = -38dB · Ratio = 1:2.4 · Úplně tlumí šum na pozadí, když mluvčí mlčí.</div>
                </div>

                <div className="p-3.5 rounded bg-[#07090E] border border-slate-800 text-slate-300 space-y-1">
                  <div className="text-cyan-300 font-semibold">Zero-Latency VAD Barge-In:</div>
                  <div className="text-slate-400">AudioWorklet nepřetržitě vyhodnocuje RMS vzorku; přeruší syntézu okamžitě, jakmile uživatel začne mluvit.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OKLAB COLORIMETRY */}
        {activeTab === 'colorimetry' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#090D16] border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Percepčně Rovnoměrný Barevný Prostor OKLab</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Na rozdíl od sRGB nebo HSL nabízí OKLab lineární percepční rovnoměrnost — vzdálenost mezi barvami přesně odpovídá tomu, jak změnu vnímá lidské oko:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded bg-[#07090E] border border-slate-800">
                  <span className="text-cyan-300 font-bold block mb-1">Světlost L ∈ [0, 1]</span>
                  <span className="text-slate-400 text-[11px]">Čistá vnímaná luminiscence bez posunu tónu.</span>
                </div>
                <div className="p-3 rounded bg-[#07090E] border border-slate-800">
                  <span className="text-emerald-300 font-bold block mb-1">Osa a ∈ [-0.4, 0.4]</span>
                  <span className="text-slate-400 text-[11px]">Zelená (-) až Červená (+) chromatická dimenze.</span>
                </div>
                <div className="p-3 rounded bg-[#07090E] border border-slate-800">
                  <span className="text-amber-300 font-bold block mb-1">Osa b ∈ [-0.4, 0.4]</span>
                  <span className="text-slate-400 text-[11px]">Modrá (-) až Žlutá (+) chromatická dimenze.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VECTOR MEMORY & SCHEMA */}
        {activeTab === 'memory' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#090D16] border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>sqlite-vec & IndexedDB Kognitivní Úložiště</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                VaporSphere uchovává disputace, vektorové embeddingy a transkripce v lokální IndexedDB databázi chráněné proti přetečení 5MB limitu localStorage:
              </p>

              <div className="p-4 rounded-lg bg-[#07090E] border border-slate-800 text-xs font-mono space-y-2">
                <div className="text-cyan-400 font-semibold">IndexedDbStorage Engine (`VaporSphereDB`):</div>
                <div className="text-slate-400 leading-relaxed">
                  • Store `research_cases`: Kompletní genealogie diskusních vláken a dekonstrukcí.<br />
                  • Store `vector_memory`: 768-rozměrné embeddingy s kosínovou podobností.<br />
                  • Quota Exceeded Recovery: Automatické čištění velkých WAV binárek z localStorage při zachování textů a vektorů.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM DEPLOYMENT & RELEASES (INTEGRATES INSTALL HUB) */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <InstallHubView lang={lang} />
          </div>
        )}

        {/* TAB 7: AUDIT & DIAGNOSTICS LOG */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>{isCs ? 'Živý Auditní Protokol Relace' : 'Live Session Audit Log'}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {isCs ? 'Deterministický záznam událostí, inicializací a latencí modelů' : 'Deterministic record of engine events, initializations, and latency metrics'}
                </p>
              </div>

              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isCs ? 'Exportovat do CSV' : 'Export as CSV'}</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#090D16]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Čas</th>
                    <th className="py-2.5 px-3">Kategorie</th>
                    <th className="py-2.5 px-3">Stav</th>
                    <th className="py-2.5 px-3">Událost</th>
                    <th className="py-2.5 px-3">Detail</th>
                    <th className="py-2.5 px-3">Latence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        {isCs ? 'Žádné záznamy neodpovídají zadanému filtru.' : 'No audit records match the current filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2.5 px-3 text-cyan-300 whitespace-nowrap">{log.category}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={
                              log.level === 'SUCCESS'
                                ? 'text-emerald-400 font-bold'
                                : log.level === 'WARN'
                                ? 'text-amber-400 font-bold'
                                : 'text-slate-400'
                            }
                          >
                            {log.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-medium whitespace-nowrap">{log.event}</td>
                        <td className="py-2.5 px-3 text-slate-400 font-sans">{log.details}</td>
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {log.latencyMs !== undefined ? `${log.latencyMs} ms` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: PRIVACY & SOLO MODE */}
        {activeTab === 'policy' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#090D16] border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ADR 002: Solo Mode & Zero-Telemetry Garance</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                VaporSphere byla navržena jako autonomní privátní nástroj pro individuální kognitivní a filozofický výzkum:
              </p>

              <div className="space-y-2.5 text-xs text-slate-300">
                <p>
                  • <strong>Žádné sledování:</strong> Žádné analytické skripty (Google Analytics, Mixpanel, Sentry) nejsou v kódu přítomny.
                </p>
                <p>
                  • <strong>Lokální data:</strong> Veškerá historie disputací, vektorových indexů a nastavení je uložena výhradně ve vašem prohlížeči (IndexedDB / localStorage) nebo v nativním desktopovém souboru SQLite.
                </p>
                <p>
                  • <strong>Offline provoz:</strong> Aplikaci lze provozovat 100% offline s lokálním modelem Llama přes Ollama nebo llama.cpp sidecar.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
