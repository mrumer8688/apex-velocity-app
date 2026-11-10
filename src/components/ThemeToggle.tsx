import React from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', compact = false }) => {
  const { theme, toggleTheme, setTheme, isSunset } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer select-none group ${
          isSunset
            ? 'bg-gradient-to-r from-[#221008] to-[#2e1509] border-[#FF8A00]/50 text-[#FFB866] hover:border-[#FF8A00] shadow-[0_0_15px_rgba(255,138,0,0.25)]'
            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-[#FF5A1F]/50 hover:bg-[#FF5A1F]/10'
        } ${className}`}
        aria-label={`Toggle ambient lighting. Currently ${isSunset ? 'Sunset (Golden Hour)' : 'Midnight'}`}
        title={`Ambient Lighting: ${isSunset ? 'Sunset (Golden Hour)' : 'Midnight'} — Click to toggle`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {isSunset ? (
            <Sun className="w-4 h-4 text-[#FFAA33] animate-[spin_12s_linear_infinite]" />
          ) : (
            <Moon className="w-4 h-4 text-[#FF5A1F] group-hover:scale-110 transition-transform" />
          )}
        </div>
        <span className="text-[11px] font-medium hidden 2xl:inline uppercase tracking-widest">
          {isSunset ? 'Sunset' : 'Midnight'}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSunset
              ? 'bg-[#FFAA33] shadow-[0_0_6px_#FFAA33] animate-pulse'
              : 'bg-[#FF5A1F] shadow-[0_0_6px_#FF5A1F]'
          }`}
        />
      </button>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full border transition-all duration-500 glass-panel ${
        isSunset
          ? 'border-[#FF8A00]/40 bg-[#160c07]/90 shadow-[0_0_20px_rgba(255,138,0,0.18)]'
          : 'border-white/10 bg-black/60 shadow-[0_0_20px_rgba(0,0,0,0.5)]'
      } ${className}`}
      role="radiogroup"
      aria-label="Ambient Lighting Showcase Theme"
    >
      {/* Midnight Option */}
      <button
        type="button"
        role="radio"
        aria-checked={!isSunset}
        onClick={() => setTheme('midnight')}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          !isSunset
            ? 'text-white font-bold'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        {!isSunset && (
          <motion.span
            layoutId="activeThemeCapsule"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF5A1F]/20 to-[#FF3B00]/20 border border-[#FF5A1F]/40 shadow-[0_0_12px_rgba(255,90,31,0.3)] -z-10"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <Moon className={`w-3.5 h-3.5 ${!isSunset ? 'text-[#FF5A1F]' : 'text-gray-400'}`} />
        <span>Midnight</span>
      </button>

      {/* Sunset Option */}
      <button
        type="button"
        role="radio"
        aria-checked={isSunset}
        onClick={() => setTheme('sunset')}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          isSunset
            ? 'text-[#FFAA33] font-bold'
            : 'text-gray-400 hover:text-[#FFAA33]'
        }`}
      >
        {isSunset && (
          <motion.span
            layoutId="activeThemeCapsule"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF8A00]/25 to-[#F59E0B]/25 border border-[#FF8A00]/60 shadow-[0_0_16px_rgba(255,138,0,0.4)] -z-10"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <Sun className={`w-3.5 h-3.5 ${isSunset ? 'text-[#FFAA33]' : 'text-gray-400'}`} />
        <span>Sunset</span>
      </button>
    </div>
  );
};
