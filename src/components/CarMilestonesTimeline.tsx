import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Gauge,
  Flame,
  Wind,
  Cpu,
  Trophy,
  History,
  Sparkles,
} from 'lucide-react';
import { CarModel } from '../types';

interface Milestone {
  phase: string;
  year: string;
  title: string;
  category: 'AERODYNAMICS' | 'CHASSIS' | 'POWERTRAIN' | 'TRACK TEST' | 'PRODUCTION';
  description: string;
  metric: string;
  metricLabel: string;
  icon: React.ReactNode;
  status: 'Validated' | 'Certified' | 'Benchmark Set' | 'Production Ready';
}

interface CarMilestonesTimelineProps {
  car: CarModel;
}

// Generate bespoke milestone chronicles based on car specifications
const getCarMilestones = (car: CarModel): Milestone[] => {
  const isElectric = car.power.includes('1,850') || car.power.includes('2,100') || car.specs.engine.toLowerCase().includes('electric') || car.specs.batteryCapacity;
  const topSpeedNum = parseInt(car.topSpeed) || 270;
  const accelVal = car.acceleration.split(' ')[0] || '1.9s';

  return [
    {
      phase: 'STAGE 01',
      year: '2023 Q1',
      title: 'CFD Aero & Morphing Wing Simulation',
      category: 'AERODYNAMICS',
      description: `Over 4,800 hours of supercomputing computational fluid dynamics shaped the active carbon undertray and rear diffuser of the ${car.name}, minimizing drag while maximizing downforce.`,
      metric: 'Cd 0.26',
      metricLabel: 'Aero Efficiency',
      icon: <Wind className="w-4 h-4 text-[#FF5A1F]" />,
      status: 'Validated',
    },
    {
      phase: 'STAGE 02',
      year: '2023 Q4',
      title: 'Carbon-Titanium Monocoque Stress Testing',
      category: 'CHASSIS',
      description: `Vacuum-infused carbon nanotube shell with titanium subframes underwent cryogenic stress testing, delivering unmatched structural rigidity without penalty weight.`,
      metric: car.specs.weight,
      metricLabel: 'Dry Curb Weight',
      icon: <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />,
      status: 'Certified',
    },
    {
      phase: 'STAGE 03',
      year: '2024 Q2',
      title: isElectric ? 'Solid-State Battery & Inverter Dyno Calibration' : 'Twin-Turbo V12 Dyno Output Benchmark',
      category: 'POWERTRAIN',
      description: `Dyno stress tests unlocked ${car.power} through active torque vectoring, engineering instant power delivery and thermal stability under continuous maximum load.`,
      metric: car.power,
      metricLabel: 'Peak Power Output',
      icon: <Cpu className="w-4 h-4 text-[#FFB800]" />,
      status: 'Certified',
    },
    {
      phase: 'STAGE 04',
      year: '2024 Q4',
      title: 'Nürburgring Nordschleife Benchmark Shakedown',
      category: 'TRACK TEST',
      description: `Telemetry verification across the 20.8 km Green Hell verified high-speed cornering stability, sub-${accelVal} launch dynamics, and aerodynamic active brake balance.`,
      metric: `${topSpeedNum} MPH`,
      metricLabel: 'Top Speed Verified',
      icon: <Flame className="w-4 h-4 text-[#FF3B00]" />,
      status: 'Benchmark Set',
    },
    {
      phase: 'STAGE 05',
      year: '2025 - 2026',
      title: 'Bespoke Atelier Commissioning & Telemetry Certification',
      category: 'PRODUCTION',
      description: `Final validation of the ${car.name} production series. Hand-finished carbon fiber weaves, individualized interior cockpits, and satellite telemetry sync.`,
      metric: `${accelVal} 0-60`,
      metricLabel: 'Acceleration Settle',
      icon: <Trophy className="w-4 h-4 text-[#00E5FF]" />,
      status: 'Production Ready',
    },
  ];
};

export const CarMilestonesTimeline: React.FC<CarMilestonesTimelineProps> = ({ car }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const milestones = getCarMilestones(car);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-8 border-t border-white/10 space-y-4">
      {/* Header with Title and Scroll Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest">
            <History className="w-3.5 h-3.5" />
            <span>Apex Skunkworks Engineering Chronicles</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display uppercase text-white mt-0.5 flex items-center gap-2">
            <span>Design Evolution & Milestones</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
              5 Phases
            </span>
          </h3>
        </div>

        {/* Scroll Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-[10px] font-mono text-white/40 hidden md:inline">
            Scroll horizontally →
          </span>
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-[#FF5A1F]/20 hover:border-[#FF5A1F]/50 text-white transition-all cursor-pointer"
            aria-label="Scroll milestones left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-[#FF5A1F]/20 hover:border-[#FF5A1F]/50 text-white transition-all cursor-pointer"
            aria-label="Scroll milestones right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline Track */}
      <div className="relative">
        {/* Glow connector bar behind nodes */}
        <div className="absolute top-[26px] left-6 right-6 h-[2px] bg-gradient-to-r from-[#FF5A1F]/80 via-[#00E5FF]/60 to-[#FF5A1F]/80 shadow-[0_0_10px_rgba(255,90,31,0.5)] -z-0 pointer-events-none hidden sm:block" />

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth select-none scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {milestones.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 rounded-2xl glass-card p-4 sm:p-5 border border-white/10 hover:border-[#FF5A1F]/50 hover:shadow-[0_10px_25px_-5px_rgba(255,90,31,0.2)] transition-all flex flex-col justify-between relative group"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div>
                {/* Node indicator with phase badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-black border border-white/20 group-hover:border-[#FF5A1F] flex items-center justify-center transition-colors shadow-inner">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#FF5A1F] font-bold tracking-wider block">
                        {item.phase}
                      </span>
                      <span className="text-[9px] font-mono text-white/50 block">
                        {item.year}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Milestone Title */}
                <h4 className="text-sm sm:text-base font-display font-bold uppercase text-white group-hover:text-[#FF5A1F] transition-colors leading-snug">
                  {item.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-[#BEBEBE] mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Metrics & Status Pill */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">
                    {item.metricLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-white group-hover:text-[#FF5A1F] transition-colors">
                    {item.metric}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/30 uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                  <span>{item.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
