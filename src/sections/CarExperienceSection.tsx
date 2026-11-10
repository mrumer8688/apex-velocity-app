import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Gauge,
  Sparkles,
  Play,
  Pause,
  ExternalLink,
  ShieldCheck,
  BatteryCharging,
  Maximize2,
} from 'lucide-react';
import { CARS_DATA } from '../data/cars';
import { CarModel } from '../types';
import { SectionHeading } from '../components/SectionHeading';
import { MagneticButton } from '../components/MagneticButton';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';

interface CarExperienceSectionProps {
  onSelectCar: (car: CarModel) => void;
  onOpenTestDrive: (carId: string) => void;
}

export const CarExperienceSection: React.FC<CarExperienceSectionProps> = ({
  onSelectCar,
  onOpenTestDrive,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-cycle through vehicles every 5 seconds if enabled
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CARS_DATA.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const activeCar = CARS_DATA[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CARS_DATA.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CARS_DATA.length) % CARS_DATA.length);
  };

  return (
    <section id="experience" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll-Triggered Parallax Background */}
      <ParallaxSectionBackground glowColor="orange" accentText="STUDIO" speed={-0.18} />

      {/* Ambient background glow matching vehicle color tone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-r from-[#FF5A1F]/15 via-[#FF2A00]/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-grid-dots opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="APEX LIVE ATELIER"
          title="DYNAMIC VEHICLE"
          highlightText="CYCLE & SPECS"
          subtitle="Explore our bespoke fleet with real-time telemetry, automated cycle rotations, and race-spec chassis analysis."
          centered
        />

        {/* Master Showcase Box */}
        <div className="mt-12 glass-card rounded-3xl border border-white/15 p-6 sm:p-8 lg:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden bg-black/60">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            {/* Live Status indicator */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A1F] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF5A1F]" />
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#FF5A1F] font-bold">
                LIVE VEHICLE CYCLE ({currentIndex + 1} OF {CARS_DATA.length})
              </span>
            </div>

            {/* Quick Play/Pause and Next/Prev controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-2 border transition-colors cursor-pointer ${
                  isAutoPlaying
                    ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border-[#FF5A1F]/50 hover:bg-[#FF5A1F]/30'
                    : 'bg-white/5 text-gray-400 border-white/15 hover:text-white hover:bg-white/10'
                }`}
                title={isAutoPlaying ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>AUTO-CYCLE: ON</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>AUTO-CYCLE: PAUSED</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous car"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next car"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Vehicle Spotlight & Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
            {/* Visual Viewport (Left 7 Cols) */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-white/15 bg-black/80 group shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeCar.id}
                    src={activeCar.image}
                    alt={activeCar.name}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-[#FF5A1F] text-black font-bold tracking-widest shadow-lg shadow-[#FF5A1F]/30 glow-orange">
                    {activeCar.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-black/60 backdrop-blur-md text-white border border-white/20 font-medium">
                    {activeCar.specs.drivetrain}
                  </span>
                </div>

                {/* Inspect Modal Button */}
                <button
                  onClick={() => onSelectCar(activeCar)}
                  className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-[#FF5A1F] text-white hover:text-black backdrop-blur-md border border-white/20 transition-all duration-300 cursor-pointer group/btn"
                  title="Expand Full Modal Specs"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                      STARTING ACQUISITION
                    </span>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight">
                      {activeCar.price}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F]">
                      ACCELERATION BENCHMARK
                    </span>
                    <div className="text-lg sm:text-xl font-mono font-bold text-gray-200">
                      0-60 in {activeCar.acceleration}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicator Dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {CARS_DATA.map((car, idx) => (
                  <button
                    key={car.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-10 bg-[#FF5A1F] glow-orange'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to car ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Telemetry & Actions (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCar.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5"
                >
                  {/* Title and Subtitle */}
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F] mb-1">
                      HYPER-MOD SPECIFICATION
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white uppercase italic leading-none">
                      {activeCar.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 mt-2 font-light leading-relaxed">
                      {activeCar.subtitle}
                    </p>
                  </div>

                  {/* 3-Column Telemetry Metrics */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-gray-400">
                        <Zap className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>POWER</span>
                      </div>
                      <div className="text-sm sm:text-base font-black font-mono text-white mt-1">
                        {activeCar.power}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-gray-400">
                        <Gauge className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>TOP SPEED</span>
                      </div>
                      <div className="text-sm sm:text-base font-black font-mono text-white mt-1">
                        {activeCar.topSpeed}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-gray-400">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>0-60 MPH</span>
                      </div>
                      <div className="text-sm sm:text-base font-black font-mono text-white mt-1">
                        {activeCar.acceleration.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Secondary Engineering Attributes */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-2">
                        <BatteryCharging className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        DRIVE ARCHITECTURE
                      </span>
                      <span className="text-white font-bold">{activeCar.specs.engine}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        CHASSIS COMPOSITION
                      </span>
                      <span className="text-white font-bold">{activeCar.specs.chassis}</span>
                    </div>
                  </div>

                  {/* Quick Car Selector Row */}
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">
                      QUICK FLEET SELECTOR
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {CARS_DATA.map((car, idx) => (
                        <button
                          key={car.id}
                          onClick={() => {
                            setCurrentIndex(idx);
                            setIsAutoPlaying(false);
                          }}
                          className={`py-2 px-1 rounded-xl text-center text-[10px] font-mono uppercase transition-all duration-300 cursor-pointer border ${
                            idx === currentIndex
                              ? 'bg-[#FF5A1F] text-black font-bold border-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/30 glow-orange'
                              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span className="block font-bold">0{idx + 1}</span>
                          <span className="block text-[8px] truncate mt-0.5">
                            {car.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <MagneticButton
                      variant="primary"
                      onClick={() => onOpenTestDrive(activeCar.id)}
                      className="w-full py-3.5 px-6 text-xs font-bold uppercase tracking-widest text-center"
                    >
                      Book Test Drive
                    </MagneticButton>

                    <button
                      onClick={() => onSelectCar(activeCar)}
                      className="w-full py-3.5 px-6 text-xs font-mono uppercase font-bold tracking-wider rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 cursor-pointer border border-white/15 flex items-center justify-center gap-2"
                    >
                      <span>Full Specs & Gallery</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
