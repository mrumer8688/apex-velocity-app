import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import {
  ArrowUpRight,
  Flame,
  Sparkles,
  Gauge,
  Zap,
  Disc,
  Scale,
  Scan,
  Shield,
  Flag,
  SlidersHorizontal,
  Activity,
} from 'lucide-react';
import { CARS_DATA } from '../data/cars';
import { CarModel } from '../types';
import { SectionHeading } from '../components/SectionHeading';
import { MagneticButton } from '../components/MagneticButton';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';
import { Car3DViewerModal } from '../components/Car3DViewerModal';
import { ThemeToggle } from '../components/ThemeToggle';

export type PerformanceMode = 'road' | 'track';

export interface PerformanceStats {
  horsepower: string;
  torque: string;
  acceleration: string;
  topSpeed: string;
  modeLabel: string;
  badgeLabel: string;
  themeColor: string;
  bgGlow: string;
}

export function calculatePerformanceStats(car: CarModel, mode: PerformanceMode): PerformanceStats {
  const hpRaw = parseInt(car.power.replace(/[^0-9]/g, '')) || 1600;
  const speedRaw = parseInt(car.topSpeed.replace(/[^0-9]/g, '')) || 260;
  const accelNum = parseFloat(car.acceleration.replace(/[^0-9.]/g, '')) || 2.0;

  if (mode === 'track') {
    const trackHp = hpRaw;
    const trackTorque = Math.round(trackHp * 0.94);
    return {
      horsepower: `${trackHp.toLocaleString()} HP`,
      torque: `${trackTorque.toLocaleString()} lb-ft`,
      acceleration: `${accelNum.toFixed(1)}s`,
      topSpeed: `${speedRaw} mph`,
      modeLabel: 'Track Apex Mode',
      badgeLabel: 'UNRESTRICTED / ESC TRACK',
      themeColor: '#FF5A1F',
      bgGlow: 'rgba(255, 90, 31, 0.25)',
    };
  } else {
    const roadHp = Math.round(hpRaw * 0.72);
    const roadTorque = Math.round(roadHp * 0.94);
    const roadAccel = (accelNum + 0.45).toFixed(1);
    const roadSpeed = Math.round(speedRaw * 0.82);
    return {
      horsepower: `${roadHp.toLocaleString()} HP`,
      torque: `${roadTorque.toLocaleString()} lb-ft`,
      acceleration: `${roadAccel}s`,
      topSpeed: `${roadSpeed} mph`,
      modeLabel: 'Road GT Mode',
      badgeLabel: 'STREET LEGAL / ESC ACTIVE',
      themeColor: '#00E5FF',
      bgGlow: 'rgba(0, 229, 255, 0.25)',
    };
  }
}

interface VehicleShowcaseCardProps {
  car: CarModel;
  idx: number;
  currentMode: PerformanceMode;
  stats: PerformanceStats;
  onSelectCar: (car: CarModel) => void;
  onOpenTestDrive: (carId: string) => void;
  onOpenCompare?: (carA?: CarModel, carB?: CarModel) => void;
  onToggleCarMode: (carId: string, mode: PerformanceMode) => void;
  onOpen3DViewer: (car: CarModel) => void;
}

const VehicleShowcaseCard: React.FC<VehicleShowcaseCardProps> = ({
  car,
  idx,
  currentMode,
  stats,
  onSelectCar,
  onOpenTestDrive,
  onOpenCompare,
  onToggleCarMode,
  onOpen3DViewer,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Framer Motion cursor tracking values for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth physics-based spring dampening for luxury tactile feel
  const springConfig = { damping: 24, stiffness: 220, mass: 0.1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Subtle 3D tilt angles (±7 degrees max for smooth, non-distorting perspective)
  const rotateX = useTransform(springY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);

  // Dynamic light reflection highlights tracking the cursor
  const glareX = useTransform(springX, [-0.5, 0.5], ['20%', '80%']);
  const glareY = useTransform(springY, [-0.5, 0.5], ['20%', '80%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Normalized -0.5 to 0.5 from center of the card
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="relative" style={{ perspective: 1200 }}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{
          scale: 1.018,
          transition: { duration: 0.25, ease: 'easeOut' },
        }}
        className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 group flex flex-col justify-between relative will-change-transform shadow-2xl transition-colors duration-300"
      >
        {/* Subtle Dynamic Surface Reflection tracking mouse movement */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 380px at ${glareX} ${glareY}, rgba(255, 255, 255, 0.08), transparent 75%)`,
          }}
        />

        <div style={{ transformStyle: 'preserve-3d' }}>
          {/* Image Container with Zoom & Gradient */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={car.image}
              alt={car.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

            {/* Category Tag & Live Mode Indicator */}
            <div
              className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10"
              style={{ transform: 'translateZ(18px)' }}
            >
              <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-black/60 text-[#FF5A1F] border border-[#FF5A1F]/30 backdrop-blur-md">
                {car.category}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-[9px] font-mono uppercase font-bold backdrop-blur-md flex items-center gap-1 transition-all"
                style={{
                  backgroundColor: `${stats.themeColor}20`,
                  color: stats.themeColor,
                  border: `1px solid ${stats.themeColor}50`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: stats.themeColor }}
                />
                {currentMode === 'track' ? 'TRACK TUNE' : 'ROAD TUNE'}
              </span>
            </div>

            {/* Price Tag */}
            <div
              className="absolute top-4 right-4 z-10"
              style={{ transform: 'translateZ(18px)' }}
            >
              <span className="px-3 py-1 rounded-full text-xs font-bold font-display bg-white/10 text-white border border-white/20 backdrop-blur-md">
                {car.price}
              </span>
            </div>

            {/* Floating 'Quick Specs' Sidebar (Expands on Hover) */}
            <div
              className="absolute top-14 right-4 z-20 flex flex-col items-end"
              style={{ transform: 'translateZ(24px)' }}
            >
              {/* Collapsed Pill Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/75 text-white/80 border border-white/15 backdrop-blur-md shadow-md transition-all duration-300 group-hover:border-[#FF5A1F]/60 group-hover:text-[#FF5A1F]">
                <Gauge className="w-3 h-3 text-[#FF5A1F]" />
                <span>Quick Specs</span>
                <span className="text-[9px] text-white/50 group-hover:translate-x-0.5 transition-transform duration-200">
                  ▸
                </span>
              </div>

              {/* Expanded Floating Sidebar Drawer on Hover */}
              <div className="mt-2 w-64 p-4 rounded-2xl glass-card border border-white/20 shadow-2xl backdrop-blur-2xl bg-black/90 transition-all duration-300 opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
                  <span
                    className="text-[9px] font-mono uppercase font-bold tracking-wider"
                    style={{ color: stats.themeColor }}
                  >
                    // {stats.badgeLabel}
                  </span>
                  <span className="text-[9px] font-mono text-[#BEBEBE]">
                    {currentMode.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Horsepower Output */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#BEBEBE] flex items-center gap-1.5">
                      <Flame className="w-3 h-3" style={{ color: stats.themeColor }} /> Horsepower:
                    </span>
                    <span className="font-bold font-display" style={{ color: stats.themeColor }}>
                      {stats.horsepower}
                    </span>
                  </div>

                  {/* Torque Output */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#BEBEBE] flex items-center gap-1.5">
                      <Zap className="w-3 h-3" style={{ color: stats.themeColor }} /> Torque:
                    </span>
                    <span className="font-bold font-display" style={{ color: stats.themeColor }}>
                      {stats.torque}
                    </span>
                  </div>

                  {/* 0-60 MPH */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#BEBEBE] flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-white/70" /> 0-60 MPH:
                    </span>
                    <span className="font-bold font-display text-white">{stats.acceleration}</span>
                  </div>

                  {/* Top Speed */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#BEBEBE] flex items-center gap-1.5">
                      <Gauge className="w-3 h-3 text-white/70" /> Top Speed:
                    </span>
                    <span className="font-bold font-display text-white">{stats.topSpeed}</span>
                  </div>

                  {/* Weight & Powertrain */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#BEBEBE]">
                    <span>Weight:</span>
                    <span className="text-white font-medium">{car.specs.weight.split(' ')[0]} lbs</span>
                  </div>
                </div>

                {/* Direct 3D Viewer Launch Button inside Quick Specs Sidebar */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen3DViewer(car);
                  }}
                  className="mt-3 w-full py-2 px-3 rounded-xl text-[10px] font-mono uppercase bg-[#FF5A1F]/20 hover:bg-[#FF5A1F] border border-[#FF5A1F]/60 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(255,90,31,0.3)]"
                >
                  <Disc className="w-3 h-3 text-[#FF5A1F] hover:text-white" />
                  <span>3D Model Viewer & Colors</span>
                </button>

                {/* Compare Specs Shortcut */}
                {onOpenCompare && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const otherCar = CARS_DATA.find((c) => c.id !== car.id) || CARS_DATA[0];
                      onOpenCompare(car, otherCar);
                    }}
                    className="mt-2 w-full py-2 px-3 rounded-xl text-[10px] font-mono uppercase bg-white/10 hover:bg-[#FF5A1F] hover:text-black border border-white/20 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Scale className="w-3 h-3 text-[#FF5A1F]" />
                    <span>Compare With Another</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info Content */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#FF5A1F] uppercase tracking-wider block">
                {car.subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display uppercase text-white group-hover:text-[#FF5A1F] transition-colors">
                {car.name}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#BEBEBE] line-clamp-2 leading-relaxed">
              {car.description}
            </p>

            {/* Performance Mode Switcher: Track Mode vs Road Mode */}
            <div className="bg-black/55 border border-white/10 rounded-2xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: stats.themeColor,
                    boxShadow: `0 0 10px ${stats.themeColor}`,
                  }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#BEBEBE]">
                  Performance Mode:
                </span>
                <span
                  className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border"
                  style={{
                    color: stats.themeColor,
                    borderColor: `${stats.themeColor}50`,
                    backgroundColor: `${stats.themeColor}15`,
                  }}
                >
                  {currentMode === 'track' ? 'Track Apex' : 'Road GT'}
                </span>
              </div>

              {/* Interactive Segment Buttons */}
              <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-xl border border-white/10 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCarMode(car.id, 'road');
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentMode === 'road'
                      ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="Road Mode: Street legal calibration with smooth torque delivery and maximum range"
                >
                  <Shield className="w-3 h-3" />
                  <span>Road Mode</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCarMode(car.id, 'track');
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentMode === 'track'
                      ? 'bg-[#FF5A1F] text-white font-bold shadow-[0_0_14px_rgba(255,90,31,0.5)] glow-orange'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="Track Mode: Unrestricted power with apex torque delivery and aggressive aero"
                >
                  <Flag className="w-3 h-3" />
                  <span>Track Mode</span>
                </button>
              </div>
            </div>

            {/* Key Metrics Row Adjusting Dynamically based on Mode */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10">
              {/* Horsepower Metric */}
              <div className="text-center p-2.5 rounded-xl glass-panel relative overflow-hidden transition-all duration-300">
                <span className="text-[9px] font-mono text-[#BEBEBE] flex items-center justify-center gap-1">
                  <Flame className="w-2.5 h-2.5" style={{ color: stats.themeColor }} />
                  HORSEPOWER
                </span>
                <motion.span
                  key={`hp-${currentMode}-${car.id}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs sm:text-sm font-extrabold font-display block mt-1 transition-colors"
                  style={{ color: stats.themeColor }}
                >
                  {stats.horsepower}
                </motion.span>
                <span className="text-[8px] font-mono text-white/40 block mt-0.5 uppercase">
                  {currentMode === 'track' ? 'Track Peak' : 'Street GT'}
                </span>
              </div>

              {/* Torque Metric */}
              <div className="text-center p-2.5 rounded-xl glass-panel relative overflow-hidden transition-all duration-300">
                <span className="text-[9px] font-mono text-[#BEBEBE] flex items-center justify-center gap-1">
                  <Zap className="w-2.5 h-2.5" style={{ color: stats.themeColor }} />
                  TORQUE
                </span>
                <motion.span
                  key={`tq-${currentMode}-${car.id}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs sm:text-sm font-extrabold font-display block mt-1 transition-colors"
                  style={{ color: stats.themeColor }}
                >
                  {stats.torque}
                </motion.span>
                <span className="text-[8px] font-mono text-white/40 block mt-0.5 uppercase">
                  {currentMode === 'track' ? 'Full Vector' : 'Linear ESC'}
                </span>
              </div>

              {/* 0-60 MPH */}
              <div className="text-center p-2.5 rounded-xl glass-panel">
                <span className="text-[9px] font-mono text-[#BEBEBE] block">0-60 MPH</span>
                <motion.span
                  key={`acc-${currentMode}-${car.id}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs sm:text-sm font-bold text-white font-display block mt-1"
                >
                  {stats.acceleration}
                </motion.span>
                <span className="text-[8px] font-mono text-white/40 block mt-0.5 uppercase">
                  {currentMode === 'track' ? 'Launch Ctrl' : 'Smooth'}
                </span>
              </div>

              {/* Top Speed */}
              <div className="text-center p-2.5 rounded-xl glass-panel">
                <span className="text-[9px] font-mono text-[#BEBEBE] block">TOP SPEED</span>
                <motion.span
                  key={`spd-${currentMode}-${car.id}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs sm:text-sm font-bold text-white font-display block mt-1"
                >
                  {stats.topSpeed}
                </motion.span>
                <span className="text-[8px] font-mono text-white/40 block mt-0.5 uppercase">
                  {currentMode === 'track' ? 'V-Max' : 'Governed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons with 3D Viewer & Compare Buttons */}
        <div
          className="p-6 sm:p-8 pt-0 flex flex-wrap sm:flex-nowrap items-center gap-2.5"
          style={{ transform: 'translateZ(14px)' }}
        >
          <MagneticButton
            variant="primary"
            onClick={() => onSelectCar(car)}
            className="flex-1 text-xs font-bold py-3.5 min-w-[120px]"
          >
            View Details <ArrowUpRight className="w-4 h-4" />
          </MagneticButton>

          {/* Side-by-Side Compare Button */}
          {onOpenCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const otherCar = CARS_DATA.find((c) => c.id !== car.id) || CARS_DATA[0];
                onOpenCompare(car, otherCar);
              }}
              className="py-3 px-3.5 rounded-2xl glass-panel border border-white/15 text-white hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-all flex items-center gap-1.5 text-xs font-mono tracking-wider cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(255,90,31,0.25)]"
              title={`Compare ${car.name} side-by-side with another hypercar`}
            >
              <Scale className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}

          <MagneticButton
            variant="secondary"
            onClick={() => onOpenTestDrive(car.id)}
            className="text-xs py-3.5"
          >
            Test Drive
          </MagneticButton>
        </div>
      </motion.div>
    </div>
  );
};

interface CarShowcaseSectionProps {
  onSelectCar: (car: CarModel) => void;
  onOpenTestDrive: (carId: string) => void;
  onOpenCompare?: (carA?: CarModel, carB?: CarModel) => void;
  onOpenAR?: (car: CarModel) => void;
}

export const CarShowcaseSection: React.FC<CarShowcaseSectionProps> = ({
  onSelectCar,
  onOpenTestDrive,
  onOpenCompare,
  onOpenAR,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [viewer3DCar, setViewer3DCar] = useState<CarModel | null>(null);
  const [fleetMode, setFleetMode] = useState<PerformanceMode>('track');
  const [carModes, setCarModes] = useState<Record<string, PerformanceMode>>({});

  const getCarPerformanceMode = (carId: string): PerformanceMode => {
    return carModes[carId] || fleetMode;
  };

  const handleToggleCarMode = (carId: string, mode: PerformanceMode) => {
    setCarModes((prev) => ({
      ...prev,
      [carId]: mode,
    }));
  };

  const handleSetFleetMode = (mode: PerformanceMode) => {
    setFleetMode(mode);
    const updated: Record<string, PerformanceMode> = {};
    CARS_DATA.forEach((c) => {
      updated[c.id] = mode;
    });
    setCarModes(updated);
  };

  const categories = ['All', 'Hypercar', 'Electric GT', 'Cyber-Coupe', 'Track Edition', 'Concept'];

  const filteredCars = activeFilter === 'All'
    ? CARS_DATA
    : CARS_DATA.filter((c) => c.category === activeFilter);

  return (
    <section id="cars" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll-Triggered Parallax Background */}
      <ParallaxSectionBackground glowColor="amber" accentText="HYPERCARS" speed={-0.16} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center">
          <SectionHeading
            eyebrow="FLEET SHOWCASE & 3D STUDIO"
            title="BESPOKE HYPERCAR"
            highlightText="COLLECTION"
            subtitle="Explore our flagship lineup engineered for unprecedented performance. Inspect every angle, benchmark side-by-side, and customize in real-time 3D."
            centered
          />

          {/* Quick Launch Action Banners */}
          <div className="mt-2 mb-8 flex flex-wrap items-center justify-center gap-3">
            {onOpenAR && (
              <button
                type="button"
                onClick={() => onOpenAR(filteredCars[0] || CARS_DATA[0])}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider bg-white/5 border border-white/15 text-white hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.15)] group"
              >
                <Scan className="w-3.5 h-3.5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                <span>Camera AR Studio</span>
              </button>
            )}

            {onOpenCompare && (
              <button
                type="button"
                onClick={() =>
                  onOpenCompare(
                    filteredCars[0] || CARS_DATA[0],
                    filteredCars[1] || CARS_DATA[1]
                  )
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider bg-[#FF5A1F]/15 border border-[#FF5A1F]/40 text-white hover:bg-[#FF5A1F] hover:text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(255,90,31,0.2)] group font-semibold"
              >
                <Scale className="w-3.5 h-3.5 text-[#FF5A1F] group-hover:text-black transition-colors" />
                <span>Compare Hypercars Benchmark</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Category Tabs, Fleet Mode Switcher & Ambient Lighting Mood Switcher */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-12 sm:mb-16">
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-[#FF5A1F] text-white glow-orange font-bold'
                    : 'glass-panel text-[#BEBEBE] hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* Global Fleet Calibration Switcher */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/15 rounded-full p-1 backdrop-blur-md shadow-lg">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 pl-3 pr-1 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-[#FF5A1F]" />
                <span className="hidden sm:inline">Fleet Tune:</span>
              </span>
              <button
                type="button"
                onClick={() => handleSetFleetMode('road')}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  fleetMode === 'road'
                    ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                    : 'text-[#BEBEBE] hover:text-white'
                }`}
                title="Calibrate whole fleet for Road Mode"
              >
                <Shield className="w-3 h-3" />
                <span>Road Mode</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetFleetMode('track')}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  fleetMode === 'track'
                    ? 'bg-[#FF5A1F] text-white font-bold glow-orange shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                    : 'text-[#BEBEBE] hover:text-white'
                }`}
                title="Calibrate whole fleet for Track Mode"
              >
                <Flag className="w-3 h-3" />
                <span>Track Mode</span>
              </button>
            </div>

            {/* Ambient Lighting Mood Control */}
            <div className="flex items-center gap-2.5 shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredCars.map((car, idx) => {
            const currentMode = getCarPerformanceMode(car.id);
            const stats = calculatePerformanceStats(car, currentMode);

            return (
              <VehicleShowcaseCard
                key={car.id}
                car={car}
                idx={idx}
                currentMode={currentMode}
                stats={stats}
                onSelectCar={onSelectCar}
                onOpenTestDrive={onOpenTestDrive}
                onOpenCompare={onOpenCompare}
                onToggleCarMode={handleToggleCarMode}
                onOpen3DViewer={(selectedCar) => setViewer3DCar(selectedCar)}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive 3D Model Viewer Modal Overlay */}
      <Car3DViewerModal
        isOpen={viewer3DCar !== null}
        onClose={() => setViewer3DCar(null)}
        car={viewer3DCar}
      />
    </section>
  );
};
