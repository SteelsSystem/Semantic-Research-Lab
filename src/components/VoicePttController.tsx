import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Sliders,
  Sparkles,
  ShieldCheck,
  Volume2,
  Activity,
  Layers,
  Check
} from 'lucide-react';
import { LanguageCode } from '../types/cognitive';
import { TRANSLATIONS } from '../utils/i18n';

interface VoicePttControllerProps {
  isLiveConnected: boolean;
  isPttMode: boolean;
  isPttActive: boolean;
  dspEnabled: boolean;
  rmsInput: number;
  onPttPressChange: (pressed: boolean) => void;
  onTogglePttMode: (enabled: boolean) => void;
  onToggleDsp: (enabled: boolean) => void;
  onStartLive: () => void;
  lang: LanguageCode;
}

export function VoicePttController({
  isLiveConnected,
  isPttMode,
  isPttActive,
  dspEnabled,
  rmsInput,
  onPttPressChange,
  onTogglePttMode,
  onToggleDsp,
  onStartLive,
  lang,
}: VoicePttControllerProps) {
  const [showDspDetails, setShowDspDetails] = useState(false);
  const [isLockedOn, setIsLockedOn] = useState(false);
  const isMouseDownRef = useRef(false);

  // Keyboard shortcut listener: Spacebar for Push-to-Talk
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space' || e.repeat) return;
      if (!isPttMode || !isLiveConnected) return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return; // Don't intercept Space while typing in input fields
      }

      e.preventDefault();
      onPttPressChange(true);
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code !== 'Space') return;
      if (!isPttMode || !isLiveConnected) return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      e.preventDefault();
      if (!isLockedOn) {
        onPttPressChange(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPttMode, isLiveConnected, isLockedOn, onPttPressChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isLiveConnected) {
      onStartLive();
      return;
    }
    if (!isPttMode) return;

    isMouseDownRef.current = true;
    onPttPressChange(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isPttMode || !isLiveConnected) return;

    isMouseDownRef.current = false;
    if (!isLockedOn) {
      onPttPressChange(false);
    }
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiveConnected) {
      onStartLive();
      return;
    }
    const next = !isLockedOn;
    setIsLockedOn(next);
    onPttPressChange(next);
  };

  // Determine current mic transmission state
  const isTransmitting = isLiveConnected && (!isPttMode || isPttActive || isLockedOn);

  return (
    <div className="relative flex flex-col items-center">
      {/* Active Transmission Halo Rings */}
      {isTransmitting && (
        <>
          <span className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
          <span className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse pointer-events-none" />
        </>
      )}

      {/* Main Universal Microphone PTT Button */}
      <div className="flex items-center gap-3 bg-[#0B0E17]/95 border border-slate-800 rounded-full p-1.5 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`relative group flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all select-none ${
            !isLiveConnected
              ? 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-200'
              : isTransmitting
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 border border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
              : 'bg-[#0E1422] border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-[#121A2C]'
          }`}
        >
          {/* Universal Microphone Icon with dynamic reactive styling */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              !isLiveConnected
                ? 'bg-slate-800 text-slate-400'
                : isTransmitting
                ? 'bg-white text-emerald-700 shadow-inner'
                : 'bg-cyan-500/20 text-cyan-300'
            }`}
          >
            {isTransmitting ? (
              <Mic className="w-4 h-4 animate-pulse" />
            ) : !isLiveConnected ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </div>

          {/* Text Labels */}
          <div className="text-left pr-1">
            <div className="text-xs font-bold tracking-tight flex items-center gap-1.5">
              <span>
                {!isLiveConnected
                  ? 'Start Gemini Live API'
                  : isTransmitting
                  ? 'TRANSMITTING TO AGENT'
                  : isPttMode
                  ? 'HOLD SPACE TO TALK'
                  : 'OPEN MIC ACTIVE'}
              </span>
              {isTransmitting && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400 leading-tight">
              {!isLiveConnected
                ? 'Click to connect duplex stream'
                : isPttMode
                ? 'Push-to-Talk (Default)'
                : 'Continuous audio stream'}
            </div>
          </div>
        </button>

        {/* Lock Mic Button (for hands-free latch in PTT mode) */}
        {isLiveConnected && isPttMode && (
          <button
            type="button"
            onClick={handleToggleLock}
            title={isLockedOn ? 'Unlock PTT' : 'Lock Mic Open'}
            className={`px-2.5 py-2 rounded-full text-[11px] font-mono font-semibold transition-colors flex items-center gap-1 ${
              isLockedOn
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>{isLockedOn ? 'LOCKED' : 'LATCH'}</span>
          </button>
        )}

        {/* PTT Mode Switcher Pill */}
        <div className="flex items-center bg-[#07090E] border border-slate-800 rounded-full p-0.5 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => onTogglePttMode(true)}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              isPttMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Push-to-Talk: Only transmits when holding Space or clicking button (Default)"
          >
            PTT (Default)
          </button>
          <button
            type="button"
            onClick={() => onTogglePttMode(false)}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              !isPttMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Open Mic: Streams continuously without pressing"
          >
            Open Mic
          </button>
        </div>

        {/* Sound Engineer DSP Status Badge */}
        <button
          type="button"
          onClick={() => setShowDspDetails(!showDspDetails)}
          className={`px-2.5 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-1.5 border transition-colors ${
            dspEnabled
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
          title="Click to view Studio DSP Audio Strip details"
        >
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">Studio DSP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
      </div>

      {/* Sound Engineer DSP Channel Strip Inspector Dropdown */}
      {showDspDetails && (
        <div className="absolute bottom-full mb-3 w-80 sm:w-96 bg-[#090D16] border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl z-50 text-xs text-slate-200 space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5 font-mono text-xs">
              <Sliders className="w-3.5 h-3.5" />
              <span>Studio DSP Microphone Channel Strip</span>
            </span>
            <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                checked={dspEnabled}
                onChange={(e) => onToggleDsp(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span className="font-mono text-slate-300">{dspEnabled ? 'ACTIVE' : 'BYPASS'}</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-[#07090E] border border-slate-800">
              <span className="text-cyan-400 block font-semibold">1. High-Pass Filter</span>
              <span className="text-slate-400">85 Hz Butterworth (Cuts HVAC, plosives & desk thumps)</span>
            </div>
            <div className="p-2 rounded bg-[#07090E] border border-slate-800">
              <span className="text-cyan-400 block font-semibold">2. Clarity Presence EQ</span>
              <span className="text-slate-400">2.8 kHz (+3.5 dB boost for speech intelligibility)</span>
            </div>
            <div className="p-2 rounded bg-[#07090E] border border-slate-800">
              <span className="text-cyan-400 block font-semibold">3. Downward Expander</span>
              <span className="text-slate-400">-36.5 dB floor gate (Eliminates room tone & clicks)</span>
            </div>
            <div className="p-2 rounded bg-[#07090E] border border-slate-800">
              <span className="text-cyan-400 block font-semibold">4. Vocal Leveler</span>
              <span className="text-slate-400">Comp 3.5:1 (3ms attack / 140ms release)</span>
            </div>
            <div className="p-2 rounded bg-[#07090E] border border-slate-800 col-span-2">
              <span className="text-emerald-400 block font-semibold">5. Brickwall Peak Limiter & De-Clicker</span>
              <span className="text-slate-400">-1.5 dB ceiling (20:1 ratio) + 12ms anti-click PTT soft ramp</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800 flex items-center justify-between">
            <span>Live Mic RMS: <strong className="text-slate-200">{(rmsInput * 100).toFixed(1)}%</strong></span>
            <span className="text-emerald-400 font-semibold">Clean Signal to Agent</span>
          </div>
        </div>
      )}
    </div>
  );
}
