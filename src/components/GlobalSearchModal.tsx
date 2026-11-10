import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Zap,
  Gauge,
  ArrowRight,
  Sparkles,
  Flame,
  Shield,
  Cpu,
  BatteryCharging,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { CARS_DATA } from '../data/cars';
import { FEATURES_DATA } from '../data/features';
import { CarModel, FeatureItem } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCar: (car: CarModel) => void;
  onOpenTestDrive: (carId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCar,
  onOpenTestDrive,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cars' | 'tech'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keyboard shortcut ⌘K / Ctrl+K / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanQuery = query.toLowerCase().trim();

  // Filter cars
  const matchedCars = CARS_DATA.filter((car) => {
    if (!cleanQuery) return true;
    return (
      car.name.toLowerCase().includes(cleanQuery) ||
      car.subtitle.toLowerCase().includes(cleanQuery) ||
      car.category.toLowerCase().includes(cleanQuery) ||
      car.power.toLowerCase().includes(cleanQuery) ||
      car.topSpeed.toLowerCase().includes(cleanQuery) ||
      car.specs.engine.toLowerCase().includes(cleanQuery) ||
      car.description.toLowerCase().includes(cleanQuery)
    );
  });

  // Filter technology pillars
  const matchedTech = FEATURES_DATA.filter((tech) => {
    if (!cleanQuery) return true;
    return (
      tech.title.toLowerCase().includes(cleanQuery) ||
      tech.description.toLowerCase().includes(cleanQuery) ||
      tech.highlight.toLowerCase().includes(cleanQuery)
    );
  });

  const handleSelectCar = (car: CarModel) => {
    onClose();
    onSelectCar(car);
  };

  const handleSelectTech = () => {
    onClose();
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl glass-card rounded-3xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)] bg-black/90 overflow-hidden flex flex-col mb-12"
        >
          {/* Search Header Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
            <Search className="w-5 h-5 text-[#FF5A1F] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search flagship fleet, 0-60mph, V12, technology pillars, autonomous..."
              className="w-full bg-transparent text-white placeholder-white/40 text-sm sm:text-base font-sans outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase bg-white/10 text-white/70 hover:text-white border border-white/15 transition-colors cursor-pointer"
            >
              ESC
            </button>
          </div>

          {/* Quick Filter Pill Tabs */}
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-white/[0.02] border-b border-white/5 overflow-x-auto">
            <span className="text-[10px] font-mono uppercase text-[#BEBEBE] mr-1">Filter:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#FF5A1F] text-white font-bold'
                  : 'bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              All ({matchedCars.length + matchedTech.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('cars')}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === 'cars'
                  ? 'bg-[#FF5A1F] text-white font-bold'
                  : 'bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              Hypercars ({matchedCars.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('tech')}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === 'tech'
                  ? 'bg-[#FF5A1F] text-white font-bold'
                  : 'bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              Tech Pillars ({matchedTech.length})
            </button>
          </div>

          {/* Search Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Section 1: Hypercars */}
            {(selectedCategory === 'all' || selectedCategory === 'cars') && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                    // HYPERCAR FLEET ({matchedCars.length})
                  </span>
                  <span className="text-[10px] font-mono text-white/40">Click to view full specs</span>
                </div>

                {matchedCars.length === 0 ? (
                  <div className="p-4 text-center text-xs text-white/40 font-mono">
                    No hypercars matching "{query}"
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedCars.map((car) => (
                      <div
                        key={car.id}
                        onClick={() => handleSelectCar(car)}
                        className="group flex items-center gap-3.5 p-3 rounded-2xl glass-panel border border-white/10 hover:border-[#FF5A1F]/60 hover:bg-[#FF5A1F]/10 transition-all cursor-pointer"
                      >
                        <div className="w-16 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                          <img
                            src={car.image}
                            alt={car.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/10 text-[#FF5A1F]">
                              {car.category}
                            </span>
                            <span className="text-[10px] font-mono text-white/50">{car.price}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold font-display uppercase text-white truncate group-hover:text-[#FF5A1F] transition-colors mt-0.5">
                            {car.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-white/60 mt-0.5">
                            <span>{car.acceleration}</span>
                            <span>•</span>
                            <span className="text-[#FF5A1F] font-bold">{car.power}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#FF5A1F] group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section 2: Technology Pillars */}
            {(selectedCategory === 'all' || selectedCategory === 'tech') && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                    // ENGINEERING & TECHNOLOGY PILLARS ({matchedTech.length})
                  </span>
                  <span className="text-[10px] font-mono text-white/40">Click to explore atelier</span>
                </div>

                {matchedTech.length === 0 ? (
                  <div className="p-4 text-center text-xs text-white/40 font-mono">
                    No technology pillars matching "{query}"
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedTech.map((tech) => (
                      <div
                        key={tech.id}
                        onClick={handleSelectTech}
                        className="group flex items-start gap-3.5 p-3.5 rounded-2xl glass-panel border border-white/10 hover:border-[#FF5A1F]/60 hover:bg-[#FF5A1F]/10 transition-all cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 flex items-center justify-center shrink-0 text-[#FF5A1F]">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-mono uppercase text-[#FF5A1F] font-bold block">
                            {tech.highlight}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold font-display uppercase text-white group-hover:text-[#FF5A1F] transition-colors mt-0.5">
                            {tech.title}
                          </h4>
                          <p className="text-[11px] text-[#BEBEBE] line-clamp-1 mt-0.5">
                            {tech.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#FF5A1F] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {matchedCars.length === 0 && matchedTech.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <Search className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-sm font-mono text-white/60">
                  No matching hypercars or technology found for "{query}".
                </p>
                <button
                  type="button"
                  onClick={() => onOpenTestDrive()}
                  className="px-5 py-2.5 rounded-full text-xs font-mono uppercase bg-[#FF5A1F] text-white font-bold hover:scale-105 transition-transform cursor-pointer"
                >
                  Contact Concierge Directly
                </button>
              </div>
            )}
          </div>

          {/* Search Footer Bar */}
          <div className="p-3.5 bg-black/70 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50 px-6">
            <span>Navigation: Click any result or press ESC to dismiss</span>
            <div className="flex items-center gap-3">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/15">⌘K</kbd> anywhere</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
