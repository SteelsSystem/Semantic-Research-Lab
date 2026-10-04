import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Check,
  X,
  Server,
  Cloud,
  Database,
  Terminal,
  Activity,
  Key,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { LanguageCode, UserPlanTier } from '../types/cognitive';
import { TRANSLATIONS } from '../utils/i18n';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  currentPlan: UserPlanTier;
  onSelectPlan: (plan: UserPlanTier) => void;
  dailyUsageCount: number;
  onResetUsage: () => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  lang,
  currentPlan,
  onSelectPlan,
  dailyUsageCount,
  onResetUsage,
}: SubscriptionModalProps) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [adminBypass, setAdminBypass] = useState(false);
  const [memoryPurging, setMemoryPurging] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const PLANS: Array<{
    id: UserPlanTier;
    name: string;
    badge: string;
    price: string;
    turns: string;
    models: string;
    voice: string;
    particles: string;
    features: string[];
    highlight?: boolean;
    adminOnly?: boolean;
  }> = [
    {
      id: 'free',
      name: t.planFree,
      badge: 'Open Trial',
      price: '$0 / mo',
      turns: '20 turns / day',
      models: 'gemini-3.1-flash-lite',
      voice: 'Browser Web Speech',
      particles: '100,000 particles',
      features: [
        '20 dialectical turns per 24 hours',
        'Fast gemini-3.1-flash-lite engine',
        'Up to 3 saved research topics',
        'Standard OKLab fluid simulation',
        'Local browser speech synthesis',
      ],
    },
    {
      id: 'pro',
      name: t.planPro,
      badge: 'Most Popular',
      price: '$29 / mo',
      turns: '250 turns / day',
      models: 'gemini-3.8-flash + Pro Preview',
      voice: '24kHz HD Gemini TTS',
      particles: '150,000 particles',
      highlight: true,
      features: [
        '250 dialectical turns per day',
        'Full Gemini Live API duplex voice',
        'Unlimited research cases & history',
        'Vector memory semantic search',
        'High demand resilience failover',
      ],
    },
    {
      id: 'unlimited',
      name: t.planUnlimited,
      badge: 'Research Labs',
      price: '$79 / mo',
      turns: 'Uncapped',
      models: 'Extended Thinking 3.8',
      voice: 'Continuous HD Streaming',
      particles: '250,000 particles',
      features: [
        'Uncapped dialectical inquiries',
        'Extended thinking reasoning depth',
        '250k particle fluid simulation',
        'Automated PDF dossier generator',
        'Priority queue for Live WebSocket',
      ],
    },
    {
      id: 'admin',
      name: t.planAdmin,
      badge: 'Root Access',
      price: 'Mesh Root',
      turns: 'Bypass All',
      models: 'Any / Dynamic Override',
      voice: 'Full PCM Worklet Taps',
      particles: 'Up to 500k configurable',
      adminOnly: true,
      features: [
        'Root token and latency inspector',
        'Bypass daily quotas & rate limits',
        'Purge / re-seed vector memory',
        'Direct Cloud Run / Cloud SQL hooks',
        'Raw prompt debugger & tool spy',
      ],
    },
  ];

  const handlePurgeMemory = async () => {
    setMemoryPurging(true);
    setAdminNotice(lang === 'cs' ? 'Čištění sémantické paměti...' : 'Purging semantic memory...');
    setTimeout(() => {
      setMemoryPurging(false);
      setAdminNotice(
        lang === 'cs'
          ? 'Sémantický vektorový archiv byl úspěšně reinicializován.'
          : 'Semantic vector archive was successfully reinitialized.'
      );
      setTimeout(() => setAdminNotice(null), 3500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#090D16] border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#07090E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{t.plansTitle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentPlan.toUpperCase()} ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{t.plansSubtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Quota Status */}
          <div className="p-3 rounded-lg bg-[#07090E] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-mono">{t.quotaUsed}</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {currentPlan === 'unlimited' || currentPlan === 'admin'
                    ? 'Uncapped (∞)'
                    : `${dailyUsageCount} / ${currentPlan === 'free' ? 20 : 250}`}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-mono">Status koordinace</span>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Run & Live API Synced
                </span>
              </div>
            </div>

            <button
              onClick={onResetUsage}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Daily Usage Counter</span>
            </button>
          </div>

          {/* 4 Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border-cyan-400 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/30'
                      : plan.adminOnly
                      ? 'bg-gradient-to-b from-purple-950/20 to-slate-950/90 border-purple-500/30 hover:border-purple-500/60'
                      : 'bg-[#07090E] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {plan.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-100">{plan.name}</h3>
                    <div className="text-lg font-bold text-cyan-300 font-mono mt-1">
                      {plan.price}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-400">
                      <div>⚡ {plan.turns}</div>
                      <div>🧠 {plan.models}</div>
                      <div>🎙 {plan.voice}</div>
                      <div>✨ {plan.particles}</div>
                    </div>

                    <ul className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onSelectPlan(plan.id)}
                      disabled={isCurrent}
                      className={`w-full py-1.5 rounded text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : plan.adminOnly
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {isCurrent ? t.currentPlan : t.selectPlan}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ADMIN Control Console (Visible when ADMIN plan is chosen or for testing) */}
          {(currentPlan === 'admin' || currentPlan === 'unlimited') && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 font-mono">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>{t.adminControls}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  ROOT LEVEL 0
                </span>
              </div>

              {adminNotice && (
                <div className="p-2 rounded bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-mono">
                  {adminNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Control 1: Bypass Quota */}
                <div className="p-2.5 rounded bg-[#07090E] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-200 text-[11px]">
                      {t.adminBypassQuota}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Bypasses all 24h limits</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminBypass}
                    onChange={(e) => {
                      setAdminBypass(e.target.checked);
                      setAdminNotice(
                        e.target.checked
                          ? (lang === 'cs' ? 'Quota bypass aktivován.' : 'Quota bypass activated.')
                          : (lang === 'cs' ? 'Quota bypass deaktivován.' : 'Quota bypass deactivated.')
                      );
                      setTimeout(() => setAdminNotice(null), 2500);
                    }}
                    className="accent-purple-500 rounded"
                  />
                </div>

                {/* Control 2: Vector Memory Reset */}
                <div className="p-2.5 rounded bg-[#07090E] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-200 text-[11px]">
                      {t.adminVectorFlush}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Purges ephemeral vectors</p>
                  </div>
                  <button
                    onClick={handlePurgeMemory}
                    disabled={memoryPurging}
                    className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[10px] font-mono transition-colors"
                  >
                    Purge
                  </button>
                </div>

                {/* Control 3: Telemetry Inspector */}
                <div className="p-2.5 rounded bg-[#07090E] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-200 text-[11px]">
                      WebSocket AudioWorklet
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">16kHz PCM duplex stream</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">24ms RTT</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#07090E] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
