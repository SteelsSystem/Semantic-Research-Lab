import React, { useState, useEffect } from 'react';
import { Sliders, Activity } from 'lucide-react';
import { AudioSpectrumMetrics } from '../types/cognitive';
import { DuplexAudioEngine } from '../utils/audioEngine';

interface SpectrumTelemetryBarProps {
  getAudioEngine: () => DuplexAudioEngine | null;
  lang?: string;
}

/**
 * Isolated high-performance spectrum telemetry component.
 * Polls audio spectrum metrics at 20Hz internally so the root App component
 * does NOT re-render 20 times per second, ensuring butter-smooth typing and UI responsiveness.
 */
export const SpectrumTelemetryBar = React.memo(function SpectrumTelemetryBar({
  getAudioEngine,
  lang = 'cs',
}: SpectrumTelemetryBarProps) {
  const [metrics, setMetrics] = useState<AudioSpectrumMetrics>({
    lowBand: 0,
    midBand: 0,
    highBand: 0,
    rmsInput: 0,
    rmsOutput: 0,
    bargeInActive: false,
  });

  useEffect(() => {
    let lastRenderTime = 0;
    const interval = setInterval(() => {
      const engine = getAudioEngine();
      if (!engine) return;

      const m = engine.getSpectrumMetrics();
      const now = performance.now();

      // Only re-render if signal has changed noticeably or 100ms passed
      if (
        now - lastRenderTime > 80 ||
        Math.abs(m.lowBand - metrics.lowBand) > 0.04 ||
        Math.abs(m.midBand - metrics.midBand) > 0.04 ||
        m.bargeInActive !== metrics.bargeInActive
      ) {
        lastRenderTime = now;
        setMetrics(m);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [getAudioEngine, metrics.lowBand, metrics.midBand, metrics.bargeInActive]);

  const isCs = lang === 'cs';

  return (
    <div className="p-3 bg-[#07090E]/90 border-t border-slate-800/80 backdrop-blur-sm space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">
            {isCs ? 'Vstup RMS:' : 'Input RMS:'}{' '}
            <strong className="text-slate-200">{(metrics.rmsInput * 100).toFixed(1)}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 ${
              metrics.bargeInActive ? 'text-amber-400 font-semibold' : 'text-emerald-400'
            }`}
          >
            {metrics.bargeInActive
              ? isCs ? '▲ BARGE-IN PŘERUŠENÍ' : '▲ BARGE-IN TRIGGERED'
              : isCs ? '● DUPLEX NOMINÁLNÍ' : '● DUPLEX NOMINAL'}
          </span>
        </div>
      </div>

      {/* 3-Band Speech Formant Frequency Meter */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
        {/* Band 1: F0 Fundamental (0-250 Hz) */}
        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>F0 (0-250Hz)</span>
            <span className="text-cyan-400">{(metrics.lowBand * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-transform duration-75 origin-left"
              style={{ transform: `scaleX(${Math.max(0.02, metrics.lowBand)})` }}
            />
          </div>
        </div>

        {/* Band 2: F1/F2 Formants (250-2500 Hz) */}
        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>F1/F2 Formanty</span>
            <span className="text-emerald-400">{(metrics.midBand * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-transform duration-75 origin-left"
              style={{ transform: `scaleX(${Math.max(0.02, metrics.midBand)})` }}
            />
          </div>
        </div>

        {/* Band 3: F3/F4 Sibilants (2500-8000 Hz) */}
        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>F3/F4 Sibilanty</span>
            <span className="text-indigo-400">{(metrics.highBand * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-transform duration-75 origin-left"
              style={{ transform: `scaleX(${Math.max(0.02, metrics.highBand)})` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
