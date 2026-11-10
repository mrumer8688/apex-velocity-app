import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Zap,
  Gauge,
  Flame,
  Power,
  RotateCw,
  Activity,
} from 'lucide-react';
import { CarModel } from '../types';
import { audioEngine, EngineTelemetry, PowertrainProfile } from '../utils/audioEngine';
import { triggerHaptic } from '../utils/haptics';

interface EngineSoundControlProps {
  car: CarModel;
  compact?: boolean;
}

export const EngineSoundControl: React.FC<EngineSoundControlProps> = ({ car, compact = false }) => {
  const [telemetry, setTelemetry] = useState<EngineTelemetry>(audioEngine.getTelemetry());

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((data) => {
      setTelemetry(data);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // When car changes, stop previous engine if running
  useEffect(() => {
    return () => {
      audioEngine.stopEngine();
    };
  }, [car.id]);

  const handleToggleEngine = () => {
    if (telemetry.isRunning || telemetry.isStarting) {
      audioEngine.stopEngine();
      triggerHaptic('light');
    } else {
      audioEngine.startEngine(car);
    }
  };

  const handleRev = (ratio: number = 0.88) => {
    if (!telemetry.isRunning && !telemetry.isStarting) {
      audioEngine.startEngine(car);
      setTimeout(() => {
        audioEngine.revEngine(ratio);
      }, 1600);
    } else {
      audioEngine.revEngine(ratio);
    }
  };

  const rpmPercent = Math.min(100, Math.round((telemetry.currentRpm / telemetry.maxRpm) * 100));
  const isRedline = telemetry.currentRpm >= telemetry.redlineRpm;

  return (
    <div
      className={`rounded-2xl border border-white/15 bg-gradient-to-b from-[#121218]/90 to-[#07070a]/90 backdrop-blur-xl ${
        compact ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6'
      } shadow-2xl space-y-4`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              telemetry.isRunning
                ? 'bg-[#FF5A1F]/20 border-[#FF5A1F] text-[#FF5A1F] shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            {telemetry.isStarting ? (
              <RotateCw className="w-4 h-4 animate-spin text-[#FF5A1F]" />
            ) : telemetry.isRunning ? (
              <Flame className="w-4 h-4 text-[#FF5A1F] animate-pulse" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                // ACOUSTIC ENGINE SOUND SYNTHESIS
              </span>
              {telemetry.isRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-white">
              {car.name} Sound Profile
            </h4>
          </div>
        </div>

        {/* Powertrain Badge */}
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
          {telemetry.powertrainType === 'electric_flux'
            ? '⚡ QUAD FLUX INVERTER'
            : telemetry.powertrainType === 'v12'
            ? '🔥 6.5L V12 SYMPHONY'
            : telemetry.powertrainType === 'v8_turbo'
            ? '💨 TWIN-TURBO V8'
            : '⚡ TITANIUM HYBRID'}
        </span>
      </div>

      {/* Live RPM Digital Gauge & Frequency Bars */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-white/40 block">Tachometer</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono transition-colors ${
                  isRedline ? 'text-red-500 animate-pulse' : telemetry.isRunning ? 'text-white' : 'text-white/40'
                }`}
              >
                {telemetry.currentRpm.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-[#FF5A1F]">RPM</span>
            </div>
          </div>

          {telemetry.boostPressurePsi > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#00E5FF] block">Turbo Boost</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-white">
                +{telemetry.boostPressurePsi} <span className="text-xs text-white/50">PSI</span>
              </span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-white/40 block">Redline</span>
            <span className="text-xs sm:text-sm font-mono text-red-400 font-bold">
              {telemetry.redlineRpm.toLocaleString()} RPM
            </span>
          </div>
        </div>

        {/* Dynamic RPM Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-75 rounded-full ${
              isRedline
                ? 'bg-gradient-to-r from-[#FF5A1F] via-orange-500 to-red-600 shadow-[0_0_12px_#ef4444]'
                : 'bg-gradient-to-r from-emerald-500 via-[#00E5FF] to-[#FF5A1F]'
            }`}
            style={{ width: `${rpmPercent}%` }}
          />
        </div>

        {/* Live Audio Visualizer Frequency Bars */}
        <div className="flex items-end justify-between h-5 gap-1 pt-1 opacity-80">
          {[40, 65, 85, 95, 75, 60, 90, 100, 70, 80, 50, 85, 65, 95, 55, 70].map((baseHeight, i) => {
            const activeScale = telemetry.isRunning ? 0.3 + (rpmPercent / 100) * 0.7 : 0.05;
            const dynamicHeight = Math.max(4, Math.round(baseHeight * activeScale));
            return (
              <div
                key={i}
                className={`w-full rounded-full transition-all duration-75 ${
                  isRedline ? 'bg-red-500' : 'bg-[#FF5A1F]'
                }`}
                style={{ height: `${dynamicHeight}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive Controls: Engine Start & Throttle Rev Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Ignition Start/Stop Button */}
        <button
          type="button"
          onClick={handleToggleEngine}
          className={`w-full sm:w-auto flex-1 py-3.5 px-5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg ${
            telemetry.isRunning
              ? 'bg-red-600/20 hover:bg-red-600 text-white border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'bg-[#FF5A1F] hover:bg-[#ff723b] text-black border-white/20 shadow-[0_0_25px_rgba(255,90,31,0.3)]'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>
            {telemetry.isStarting
              ? 'Cranking Starter...'
              : telemetry.isRunning
              ? 'Cut Ignition'
              : 'Start Engine (Ignition)'}
          </span>
        </button>

        {/* Interactive Throttle Rev Button */}
        <button
          type="button"
          onClick={() => handleRev(0.92)}
          onMouseDown={() => handleRev(0.95)}
          onTouchStart={() => handleRev(0.95)}
          disabled={telemetry.isStarting}
          className="w-full sm:w-auto py-3.5 px-6 rounded-xl border border-white/20 bg-white/10 hover:bg-[#FF5A1F]/20 hover:border-[#FF5A1F]/60 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 group"
          title="Hold or click to rev the engine"
        >
          <Flame
            className={`w-4 h-4 text-[#FF5A1F] transition-transform duration-200 ${
              telemetry.isRevving ? 'scale-125 animate-bounce' : 'group-hover:scale-110'
            }`}
          />
          <span>Rev Throttle</span>
        </button>
      </div>

      {/* Powertrain Description */}
      <p className="text-[11px] font-mono text-white/50 text-center">
        {telemetry.profileName}
      </p>
    </div>
  );
};
