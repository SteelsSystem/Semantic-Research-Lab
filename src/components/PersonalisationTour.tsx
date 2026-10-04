import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Palette,
  Radio,
  Sliders,
  ShieldCheck,
  Layers,
  Waves,
  Cpu,
  Volume2
} from 'lucide-react';
import { LanguageCode, UserPersonalization } from '../types/cognitive';
import { TRANSLATIONS } from '../utils/i18n';

interface PersonalisationTourProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  personalization: UserPersonalization;
  onUpdatePersonalization: (settings: Partial<UserPersonalization>) => void;
  onOpenPlans: () => void;
}

export function PersonalisationTour({
  isOpen,
  onClose,
  lang,
  personalization,
  onUpdatePersonalization,
  onOpenPlans,
}: PersonalisationTourProps) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const STEPS = [
    {
      title: '01. Socratic Cognitive Partner',
      subtitle: 'Beyond standard chatbots',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Welcome to the <strong>Semantic Research Lab</strong>. This application is an intellectual sparring partner designed for postgraduate-level dialectic disputation across epistemology, non-equilibrium physics, bioethics, and institutional systems.
          </p>
          <p>
            Rather than agreeing passively or flattering your prompts, the engine uses <em>Socratic Elenctics</em> to unearth your unstated axioms, challenge premises, and map structural isomorphisms across disciplines.
          </p>
        </div>
      ),
    },
    {
      title: '02. Research Cases & Topics Management',
      subtitle: 'Isolated inquiry dossiers',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Notice the dedicated <strong>Topics & Cases Bar</strong> at the very top of the window. Every distinct line of inquiry is managed as an independent research case with its own saved transcripts, visual states, and clarification requests.
          </p>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
            ✦ Total Topics Processed Badge: Keep count of all intellectual cases investigated.
          </div>
          <p>
            You can pin important cases, rename them, or export the entire history to JSON at any time.
          </p>
        </div>
      ),
    },
    {
      title: '03. GPU OKLab VaporSphere',
      subtitle: 'Perceptual fluid physics',
      icon: <Palette className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            The 3D particle sphere runs entirely on your GPU via Three.js with up to 250,000 particles. It does not use arbitrary colors—it synthesizes light within the <strong>perceptual OKLab / OKLCh color space</strong> simulating human LMS cone responses.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
            <li><strong className="text-indigo-400">Deep Indigo:</strong> Ontological inquiries & consciousness</li>
            <li><strong className="text-cyan-400">Crystalline Azure:</strong> Theoretical physics & thermodynamic entropy</li>
            <li><strong className="text-emerald-400">Emerald / Amber:</strong> Bioethics & CRISPR gene networks</li>
            <li><strong className="text-rose-400">Cobalt / Terracotta:</strong> Socioeconomic friction & bifurcations</li>
          </ul>
        </div>
      ),
    },
    {
      title: '04. Gemini Live API Duplex Audio',
      subtitle: 'Real-time conversation with Barge-in',
      icon: <Radio className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Experience native, bidirectional 16kHz audio streaming powered by <code>gemini-3.8-live-extended-thinking</code>.
          </p>
          <p>
            <strong>Instant Barge-In:</strong> You never have to wait for the model to finish speaking. If you speak up, client-side VAD immediately interrupts model playback and hands you the floor.
          </p>
          <p className="text-slate-400 text-[11px]">
            Your acoustic frequencies also directly modulate the turbulence and radius of the vapor sphere in real time.
          </p>
        </div>
      ),
    },
    {
      title: '05. Elenctics & Clarification Requests',
      subtitle: 'Interactive dialectic deconstruction',
      icon: <Sliders className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Every model response generates structured epistemological outputs:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
            <li><strong>Hidden Axioms:</strong> Unspoken boundary conditions in your argument.</li>
            <li><strong>Structural Isomorphisms:</strong> Conceptual bridges into other sciences.</li>
            <li><strong>Clarification Requests:</strong> 2-3 specific questions from the model asking you to specify details, which you can answer with 1 click.</li>
            <li><strong>Branching Paths:</strong> Jump deeper vertically, extrapolate laterally, or adopt the counter-thesis.</li>
          </ul>
        </div>
      ),
    },
    {
      title: '06. Personalisation & Aesthetic Calibration',
      subtitle: 'Tailor the interface to your senses',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-4 text-xs">
          {/* Accent theme */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">{t.themeAccent}</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'cyan', label: 'Cyan Neon', hex: '#06B6D4' },
                { id: 'emerald', label: 'Emerald Synth', hex: '#10B981' },
                { id: 'amber', label: 'Amber Gold', hex: '#F59E0B' },
                { id: 'violet', label: 'Violet Void', hex: '#8B5CF6' },
                { id: 'rose', label: 'Ruby Laser', hex: '#F43F5E' },
              ].map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdatePersonalization({ themeAccent: color.id as any })}
                  className={`p-2 rounded border flex flex-col items-center gap-1.5 transition-all ${
                    personalization.themeAccent === color.id
                      ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400'
                      : 'bg-[#07090E] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-slate-300">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dialectic rigour */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">{t.dialecticRigour}</label>
            <select
              value={personalization.dialecticRigour}
              onChange={(e) => onUpdatePersonalization({ dialecticRigour: e.target.value as any })}
              className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="academic">Postgraduate Academic (Exacting, no flattery)</option>
              <option value="socratic">Socratic Inquisitor (Continuous elenctic questioning)</option>
              <option value="peer_review">Strict Peer Reviewer (Methodological scrutiny)</option>
              <option value="accessible">Conceptual Tutor (Accessible pedagogical analogies)</option>
            </select>
          </div>

          {/* Binaural Focus Frequency (432Hz) */}
          <div className="p-2.5 rounded bg-[#07090E] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-200 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.ambientHum}</span>
              </span>
              <p className="text-slate-400 text-[10px] mt-0.5">{t.ambientHumDesc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={personalization.ambientAudio}
                onChange={(e) => onUpdatePersonalization({ ambientAudio: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      ),
    },
    {
      title: '07. Equitable Tiers & Cloud Coordination',
      subtitle: 'Free, Pro, Unlimited & ADMIN',
      icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            To maintain high availability and prevent rate exhaustion, the interface features a balanced subscription structure:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="font-semibold text-cyan-300">Free Explorer:</span>
              <p className="text-slate-400 mt-0.5">20 turns/day, Flash-Lite, standard 100k GPU particles.</p>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="font-semibold text-emerald-300">Pro & Unlimited:</span>
              <p className="text-slate-400 mt-0.5">Full Live duplex stream, 250k particles, vector embeddings.</p>
            </div>
          </div>
          <p>
            <strong>ADMIN Mode:</strong> Gives full root tokens, direct WebSocket packet inspection, and quota bypass hooks for orchestrating Cloud SQL, Firebase, and Workspace.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenPlans();
              }}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Explore Full Subscription Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ),
    },
  ];

  const activeStepData = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#090D16] border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#07090E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30">
              {activeStepData.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                  {t.tourTitle} ({currentStep + 1}/{STEPS.length})
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">{activeStepData.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6 min-h-[220px]">
          <span className="text-[11px] font-mono text-cyan-400/80 block mb-2">
            {activeStepData.subtitle}
          </span>
          {activeStepData.content}
        </div>

        {/* Footer Navigation */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#07090E] flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-5 bg-cyan-400' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-1.5 rounded border border-slate-800 text-slate-300 hover:border-slate-700 text-xs transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.tourBack}</span>
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <span>{t.tourNext}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.tourFinish}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
