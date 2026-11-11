import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import {
  X,
  ArrowRightLeft,
  Zap,
  Gauge,
  Flame,
  Scale,
  Shield,
  BatteryCharging,
  CheckCircle,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Disc,
  Activity,
  Sliders,
} from 'lucide-react';
import { CARS_DATA } from '../data/cars';
import { CarModel } from '../types';
import { MagneticButton } from './MagneticButton';

interface CompareVehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  carA?: CarModel | null;
  carB?: CarModel | null;
  onOpenTestDrive: (carId: string) => void;
  onOpen3DViewer?: (car: CarModel) => void;
}

// Helpers to extract numbers for visual comparison bars
function parseNum(str: string): number {
  const match = str.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// Compute normalized 0-100 radar chart performance metrics
function computeRadarMetrics(car: CarModel) {
  // 1. Top Speed (e.g. 217 - 285+ mph)
  const speed = parseNum(car.topSpeed) || 200;
  const topSpeedScore = Math.min(99, Math.max(55, Math.round(((speed - 180) / (295 - 180)) * 40 + 58)));

  // 2. Acceleration (0-60 mph, lower is faster)
  const acc = parseNum(car.acceleration) || 2.5;
  const accelerationScore = Math.min(99, Math.max(50, Math.round(((3.4 - acc) / (3.4 - 1.6)) * 45 + 54)));

  // 3. Handling (Lateral G & Agility Index based on curb weight, chassis, downforce aero, and drivetrain)
  const weight = parseNum(car.specs.weight) || 3200;
  const isAWD = car.specs.drivetrain.toLowerCase().includes('awd') || 
                car.specs.drivetrain.toLowerCase().includes('all-wheel') || 
                car.specs.drivetrain.toLowerCase().includes('torque vectoring');
  const hasCarbonChassis = car.specs.chassis.toLowerCase().includes('carbon');
  const hasActiveAero = car.features.some(f => 
    f.toLowerCase().includes('aero') || f.toLowerCase().includes('wing') || f.toLowerCase().includes('ground effect')
  );
  
  let handlingScore = 80;
  handlingScore += Math.max(-6, Math.min(8, Math.round((3400 - weight) / 50)));
  if (isAWD) handlingScore += 6;
  if (hasCarbonChassis) handlingScore += 4;
  if (hasActiveAero) handlingScore += 4;
  handlingScore = Math.min(99, Math.max(60, handlingScore));

  // 4. Braking (Deceleration, Carbon Ceramic/Titanium rotor performance, Active Airbrake)
  let brakingScore = 82;
  const hasCarbonBrakes = car.description.toLowerCase().includes('carbon') || 
                          car.specs.chassis.toLowerCase().includes('titanium') || 
                          car.features.some(f => f.toLowerCase().includes('carbon') || f.toLowerCase().includes('brake'));
  if (hasCarbonBrakes) brakingScore += 6;
  if (hasActiveAero) brakingScore += 5; // Active Airbrake downforce
  brakingScore += Math.max(-6, Math.min(6, Math.round((3300 - weight) / 60)));
  brakingScore = Math.min(99, Math.max(60, brakingScore));

  const lateralG = (1.18 + (handlingScore / 100) * 0.62).toFixed(2);
  const stoppingDist = Math.round(112 - (brakingScore - 60) * 0.38);

  return {
    topSpeedScore,
    accelerationScore,
    handlingScore,
    brakingScore,
    raw: {
      speed: car.topSpeed,
      acc: car.acceleration,
      handling: `${lateralG} G Lateral`,
      braking: `${stoppingDist} ft (60-0 mph)`,
    }
  };
}

export const CompareVehiclesModal: React.FC<CompareVehiclesModalProps> = ({
  isOpen,
  onClose,
  carA: propCarA,
  carB: propCarB,
  onOpenTestDrive,
  onOpen3DViewer,
}) => {
  // Local state so user can freely swap or switch vehicles in the comparison
  const [selectedIdA, setSelectedIdA] = useState<string>(
    propCarA?.id || CARS_DATA[0]?.id || ''
  );
  const [selectedIdB, setSelectedIdB] = useState<string>(
    propCarB?.id || CARS_DATA[1]?.id || ''
  );
  const [radarHoveredMetric, setRadarHoveredMetric] = useState<string | null>(null);

  // Sync if props change or modal opens
  React.useEffect(() => {
    if (isOpen) {
      const defaultA = propCarA?.id || CARS_DATA[0]?.id || '';
      const defaultB =
        propCarB?.id ||
        (defaultA === CARS_DATA[0]?.id ? CARS_DATA[1]?.id : CARS_DATA[0]?.id) ||
        '';
      setSelectedIdA(defaultA);
      setSelectedIdB(defaultB);
    }
  }, [isOpen, propCarA, propCarB]);

  // Stop Lenis when comparison modal is open so mouse wheel scrolls inside benchmark smoothly
  React.useEffect(() => {
    if (isOpen) {
      (window as any).__lenis?.stop();
    } else {
      (window as any).__lenis?.start();
    }
    return () => {
      (window as any).__lenis?.start();
    };
  }, [isOpen]);

  const carA = CARS_DATA.find((c) => c.id === selectedIdA) || CARS_DATA[0];
  const carB = CARS_DATA.find((c) => c.id === selectedIdB) || CARS_DATA[1];

  const handleSwap = () => {
    const temp = selectedIdA;
    setSelectedIdA(selectedIdB);
    setSelectedIdB(temp);
  };

  // Escape key dismiss
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Metric parsing for direct comparative calculations
  const accA = parseNum(carA.acceleration);
  const accB = parseNum(carB.acceleration);
  const speedA = parseNum(carA.topSpeed);
  const speedB = parseNum(carB.topSpeed);
  const hpA = parseNum(carA.power);
  const hpB = parseNum(carB.power);
  const weightA = parseNum(carA.specs.weight);
  const weightB = parseNum(carB.specs.weight);

  // Power to weight ratios (HP per 1,000 lbs)
  const ptwA = weightA > 0 ? (hpA / weightA) * 1000 : 0;
  const ptwB = weightB > 0 ? (hpB / weightB) * 1000 : 0;

  // Winner calculation
  const winnerAcc = accA && accB ? (accA < accB ? 'A' : accA > accB ? 'B' : 'TIE') : null;
  const winnerSpeed = speedA && speedB ? (speedA > speedB ? 'A' : speedA < speedB ? 'B' : 'TIE') : null;
  const winnerHp = hpA && hpB ? (hpA > hpB ? 'A' : hpA < hpB ? 'B' : 'TIE') : null;
  const winnerWeight = weightA && weightB ? (weightA < weightB ? 'A' : weightA > weightB ? 'B' : 'TIE') : null;
  const winnerPtw = ptwA && ptwB ? (ptwA > ptwB ? 'A' : ptwA < ptwB ? 'B' : 'TIE') : null;

  // Dynamic performance metrics for Radar Chart (called unconditionally)
  const metricsA = useMemo(() => computeRadarMetrics(carA), [carA]);
  const metricsB = useMemo(() => computeRadarMetrics(carB), [carB]);

  const radarData = useMemo(() => [
    {
      metric: 'Top Speed',
      carA: metricsA.topSpeedScore,
      carB: metricsB.topSpeedScore,
      rawA: metricsA.raw.speed,
      rawB: metricsB.raw.speed,
      fullMark: 100,
    },
    {
      metric: 'Acceleration',
      carA: metricsA.accelerationScore,
      carB: metricsB.accelerationScore,
      rawA: metricsA.raw.acc,
      rawB: metricsB.raw.acc,
      fullMark: 100,
    },
    {
      metric: 'Handling',
      carA: metricsA.handlingScore,
      carB: metricsB.handlingScore,
      rawA: metricsA.raw.handling,
      rawB: metricsB.raw.handling,
      fullMark: 100,
    },
    {
      metric: 'Braking',
      carA: metricsA.brakingScore,
      carB: metricsB.brakingScore,
      rawA: metricsA.raw.braking,
      rawB: metricsB.raw.braking,
      fullMark: 100,
    },
  ], [metricsA, metricsB]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-lenis-prevent="true"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.3 }}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl glass-card rounded-3xl border border-white/15 bg-black/90 shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto overscroll-contain my-auto flex flex-col"
        >
          {/* Top Modal Header Bar */}
          <div className="sticky top-0 z-30 p-4 sm:p-6 bg-[#080808]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 flex items-center justify-center text-[#FF5A1F]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] block">
                  HEAD-TO-HEAD BENCHMARK
                </span>
                <h3 className="text-base sm:text-xl font-black font-display uppercase tracking-wider text-white">
                  Compare Hypercars
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwap}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-white/15 text-xs font-mono text-white/80 hover:text-white hover:border-[#FF5A1F]/50 transition-all cursor-pointer"
                title="Swap Vehicle Slots"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span className="hidden sm:inline">Swap Slots</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full glass-panel border border-white/15 text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
                aria-label="Close Comparison"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Vehicle Selectors & Visual Stage Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-white/[0.02]">
            {/* Slot A (Left) */}
            <div className="p-5 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-[#FF5A1F] border border-[#FF5A1F]/30 uppercase">
                  Vehicle 01
                </span>

                {/* Car Selector Dropdown */}
                <div className="relative flex-1 max-w-xs">
                  <select
                    value={selectedIdA}
                    onChange={(e) => setSelectedIdA(e.target.value)}
                    className="w-full appearance-none bg-black/60 border border-white/20 text-white text-xs font-mono py-2 px-3 pr-8 rounded-xl outline-none hover:border-[#FF5A1F]/50 transition-colors cursor-pointer"
                  >
                    {CARS_DATA.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#121214] text-white">
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-white/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Car Card Visual Preview */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 shadow-xl group">
                <img
                  src={carA.image}
                  alt={carA.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#FF5A1F] uppercase tracking-wider block">
                      {carA.subtitle}
                    </span>
                    <h4 className="text-lg sm:text-xl font-black font-display uppercase text-white leading-tight">
                      {carA.name}
                    </h4>
                  </div>
                  <span className="text-xs font-bold font-display px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md text-white border border-white/20">
                    {carA.price}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Car A */}
              <div className="flex items-center gap-2 pt-1">
                <MagneticButton
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onOpenTestDrive(carA.id);
                  }}
                  className="flex-1 py-3 text-xs font-bold justify-center"
                >
                  Book Test Drive
                </MagneticButton>
                {onOpen3DViewer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpen3DViewer(carA);
                    }}
                    className="py-3 px-3.5 rounded-2xl glass-panel border border-white/15 text-white hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                    title="View in 3D"
                  >
                    <Disc className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span className="hidden sm:inline">3D</span>
                  </button>
                )}
              </div>
            </div>

            {/* Slot B (Right) */}
            <div className="p-5 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-400 border border-cyan-400/30 uppercase">
                  Vehicle 02
                </span>

                {/* Car Selector Dropdown */}
                <div className="relative flex-1 max-w-xs">
                  <select
                    value={selectedIdB}
                    onChange={(e) => setSelectedIdB(e.target.value)}
                    className="w-full appearance-none bg-black/60 border border-white/20 text-white text-xs font-mono py-2 px-3 pr-8 rounded-xl outline-none hover:border-cyan-400/50 transition-colors cursor-pointer"
                  >
                    {CARS_DATA.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#121214] text-white">
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-white/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Car Card Visual Preview */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 shadow-xl group">
                <img
                  src={carB.image}
                  alt={carB.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      {carB.subtitle}
                    </span>
                    <h4 className="text-lg sm:text-xl font-black font-display uppercase text-white leading-tight">
                      {carB.name}
                    </h4>
                  </div>
                  <span className="text-xs font-bold font-display px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md text-white border border-white/20">
                    {carB.price}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Car B */}
              <div className="flex items-center gap-2 pt-1">
                <MagneticButton
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onOpenTestDrive(carB.id);
                  }}
                  className="flex-1 py-3 text-xs font-bold justify-center"
                >
                  Book Test Drive
                </MagneticButton>
                {onOpen3DViewer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpen3DViewer(carB);
                    }}
                    className="py-3 px-3.5 rounded-2xl glass-panel border border-white/15 text-white hover:border-cyan-400 hover:text-cyan-400 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                    title="View in 3D"
                  >
                    <Disc className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">3D</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Performance Benchmark Gauges & Comparison Rows */}
          <div className="p-5 sm:p-8 space-y-6 border-t border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF5A1F]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                  // TELEMETRY & PERFORMANCE RADAR BENCHMARK
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]" />
                  <span className="text-white/80">{carA.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
                  <span className="text-white/80">{carB.name}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Comparison Radar Chart Card (Recharts) */}
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.04] via-black/40 to-white/[0.01] p-4 sm:p-6 backdrop-blur-xl shadow-xl">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Radar Visualizer Canvas */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
                  <div className="w-full h-[280px] sm:h-[320px] relative min-h-[280px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={240}>
                      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                        <PolarGrid
                          stroke="rgba(255, 255, 255, 0.15)"
                          strokeDasharray="2 2"
                        />
                        <PolarAngleAxis
                          dataKey="metric"
                          tick={({ payload, x, y, textAnchor }) => (
                            <text
                              x={x}
                              y={y}
                              textAnchor={textAnchor}
                              fill={radarHoveredMetric === payload.value ? '#FF5A1F' : 'rgba(255, 255, 255, 0.85)'}
                              fontSize={11}
                              fontFamily="monospace"
                              fontWeight={radarHoveredMetric === payload.value ? 'bold' : 'normal'}
                            >
                              {payload.value}
                            </text>
                          )}
                        />
                        <PolarRadiusAxis
                          angle={45}
                          domain={[0, 100]}
                          stroke="rgba(255, 255, 255, 0.1)"
                          tick={{ fill: 'rgba(255, 255, 255, 0.35)', fontSize: 9, fontFamily: 'monospace' }}
                        />
                        {/* Car A Radar Polygon */}
                        <Radar
                          name={carA.name}
                          dataKey="carA"
                          stroke="#FF5A1F"
                          fill="#FF5A1F"
                          fillOpacity={0.35}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#FF5A1F', stroke: '#ffffff', strokeWidth: 1.5 }}
                        />
                        {/* Car B Radar Polygon */}
                        <Radar
                          name={carB.name}
                          dataKey="carB"
                          stroke="#00E5FF"
                          fill="#00E5FF"
                          fillOpacity={0.25}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#00E5FF', stroke: '#ffffff', strokeWidth: 1.5 }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              const delta = Math.abs(item.carA - item.carB);
                              const leader = item.carA > item.carB ? carA.name : item.carB > item.carA ? carB.name : 'Tied';
                              const leaderColor = item.carA > item.carB ? 'text-[#FF5A1F]' : item.carB > item.carA ? 'text-cyan-400' : 'text-white/60';
                              return (
                                <div className="p-3 rounded-xl border border-white/20 bg-black/95 backdrop-blur-xl shadow-2xl text-xs font-mono space-y-2 min-w-[210px]">
                                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                                    <span className="font-bold text-white uppercase">{item.metric}</span>
                                    <span className="text-[10px] text-white/40">Radar Index</span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[#FF5A1F]">
                                      <span className="truncate max-w-[110px]">{carA.name}:</span>
                                      <span className="font-bold">{item.carA}/100 <span className="text-[10px] text-white/50">({item.rawA})</span></span>
                                    </div>
                                    <div className="flex items-center justify-between text-cyan-400">
                                      <span className="truncate max-w-[110px]">{carB.name}:</span>
                                      <span className="font-bold">{item.carB}/100 <span className="text-[10px] text-white/50">({item.rawB})</span></span>
                                    </div>
                                  </div>
                                  <div className="pt-1 border-t border-white/10 text-[10px] flex items-center justify-between">
                                    <span className="text-white/40">Advantage:</span>
                                    <span className={`font-bold ${leaderColor}`}>
                                      {leader} {delta > 0 && `(+${delta} pts)`}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 text-center mt-1">
                    Hover radar vertices to view normalized indices & empirical specs
                  </span>
                </div>

                {/* Right Side: 4 Core Performance Metric Cards */}
                <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {radarData.map((d) => {
                    const isAWinner = d.carA > d.carB;
                    const isBWinner = d.carB > d.carA;
                    const isHovered = radarHoveredMetric === d.metric;
                    return (
                      <div
                        key={d.metric}
                        onMouseEnter={() => setRadarHoveredMetric(d.metric)}
                        onMouseLeave={() => setRadarHoveredMetric(null)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isHovered
                            ? 'border-[#FF5A1F]/60 bg-white/[0.08] shadow-[0_0_15px_rgba(255,90,31,0.15)] scale-[1.02]'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            {d.metric}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                              isAWinner
                                ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30'
                                : isBWinner
                                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                                : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {isAWinner ? `${carA.name.split(' ')[0]} Win` : isBWinner ? `${carB.name.split(' ')[0]} Win` : 'Tied'}
                          </span>
                        </div>

                        {/* Side-by-side metric comparison values */}
                        <div className="space-y-1 text-[11px] font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-[#FF5A1F] truncate max-w-[90px]">{carA.name}</span>
                            <span className="font-bold text-white">{d.rawA}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-400 truncate max-w-[90px]">{carB.name}</span>
                            <span className="font-bold text-white">{d.rawB}</span>
                          </div>
                        </div>

                        {/* Comparative Visual Bar */}
                        <div className="mt-2 grid grid-cols-2 gap-1.5 h-1.5 rounded-full overflow-hidden bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isAWinner ? 'bg-[#FF5A1F] shadow-[0_0_6px_#FF5A1F]' : 'bg-white/30'
                            }`}
                            style={{ width: `${d.carA}%` }}
                          />
                          <div
                            className={`h-full rounded-full transition-all ${
                              isBWinner ? 'bg-cyan-400 shadow-[0_0_6px_#00E5FF]' : 'bg-white/30'
                            }`}
                            style={{ width: `${d.carB}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Row 1: 0-60 MPH Acceleration */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="text-xs font-mono uppercase text-white/80 font-bold">
                      0-60 MPH Acceleration (Lower is Quicker)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className={`font-bold ${winnerAcc === 'A' ? 'text-[#FF5A1F]' : 'text-white/80'}`}>
                      {carA.acceleration} {winnerAcc === 'A' && '🏆'}
                    </span>
                    <span className="text-white/30">vs</span>
                    <span className={`font-bold ${winnerAcc === 'B' ? 'text-cyan-400' : 'text-white/80'}`}>
                      {carB.acceleration} {winnerAcc === 'B' && '🏆'}
                    </span>
                  </div>
                </div>

                {/* Comparative Visual Bar */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex justify-end">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerAcc === 'A' ? 'bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]' : 'bg-white/40'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(30, (2.8 / (accA || 2.0)) * 60))}%`,
                      }}
                    />
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerAcc === 'B' ? 'bg-cyan-400 shadow-[0_0_8px_#00E5FF]' : 'bg-white/40'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(30, (2.8 / (accB || 2.0)) * 60))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Top Speed */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="text-xs font-mono uppercase text-white/80 font-bold">
                      Top Speed Velocity
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className={`font-bold ${winnerSpeed === 'A' ? 'text-[#FF5A1F]' : 'text-white/80'}`}>
                      {carA.topSpeed} {winnerSpeed === 'A' && '🏆'}
                    </span>
                    <span className="text-white/30">vs</span>
                    <span className={`font-bold ${winnerSpeed === 'B' ? 'text-cyan-400' : 'text-white/80'}`}>
                      {carB.topSpeed} {winnerSpeed === 'B' && '🏆'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex justify-end">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerSpeed === 'A' ? 'bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]' : 'bg-white/40'
                      }`}
                      style={{ width: `${Math.min(100, ((speedA || 200) / 300) * 100)}%` }}
                    />
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerSpeed === 'B' ? 'bg-cyan-400 shadow-[0_0_8px_#00E5FF]' : 'bg-white/40'
                      }`}
                      style={{ width: `${Math.min(100, ((speedB || 200) / 300) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Horsepower Output */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="text-xs font-mono uppercase text-white/80 font-bold">
                      Maximum Power Output
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className={`font-bold ${winnerHp === 'A' ? 'text-[#FF5A1F]' : 'text-white/80'}`}>
                      {carA.power} {winnerHp === 'A' && '🏆'}
                    </span>
                    <span className="text-white/30">vs</span>
                    <span className={`font-bold ${winnerHp === 'B' ? 'text-cyan-400' : 'text-white/80'}`}>
                      {carB.power} {winnerHp === 'B' && '🏆'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex justify-end">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerHp === 'A' ? 'bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]' : 'bg-white/40'
                      }`}
                      style={{ width: `${Math.min(100, ((hpA || 1000) / 2200) * 100)}%` }}
                    />
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerHp === 'B' ? 'bg-cyan-400 shadow-[0_0_8px_#00E5FF]' : 'bg-white/40'
                      }`}
                      style={{ width: `${Math.min(100, ((hpB || 1000) / 2200) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Curb Weight (Lighter is Quicker/More Agile) */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="text-xs font-mono uppercase text-white/80 font-bold">
                      Curb Weight (Lighter is More Agile)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className={`font-bold ${winnerWeight === 'A' ? 'text-[#FF5A1F]' : 'text-white/80'}`}>
                      {carA.specs.weight} {winnerWeight === 'A' && '🏆'}
                    </span>
                    <span className="text-white/30">vs</span>
                    <span className={`font-bold ${winnerWeight === 'B' ? 'text-cyan-400' : 'text-white/80'}`}>
                      {carB.specs.weight} {winnerWeight === 'B' && '🏆'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex justify-end">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerWeight === 'A' ? 'bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]' : 'bg-white/40'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(30, (2600 / (weightA || 3200)) * 85))}%`,
                      }}
                    />
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerWeight === 'B' ? 'bg-cyan-400 shadow-[0_0_8px_#00E5FF]' : 'bg-white/40'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(30, (2600 / (weightB || 3200)) * 85))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Power-to-Weight Ratio */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="text-xs font-mono uppercase text-white/80 font-bold">
                      Power-to-Weight Ratio (HP per 1,000 lbs)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className={`font-bold ${winnerPtw === 'A' ? 'text-[#FF5A1F]' : 'text-white/80'}`}>
                      {ptwA.toFixed(0)} HP/klb {winnerPtw === 'A' && '🏆'}
                    </span>
                    <span className="text-white/30">vs</span>
                    <span className={`font-bold ${winnerPtw === 'B' ? 'text-cyan-400' : 'text-white/80'}`}>
                      {ptwB.toFixed(0)} HP/klb {winnerPtw === 'B' && '🏆'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex justify-end">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerPtw === 'A' ? 'bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]' : 'bg-white/40'
                      }`}
                      style={{
                        width: `${Math.min(100, (ptwA / 650) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        winnerPtw === 'B' ? 'bg-cyan-400 shadow-[0_0_8px_#00E5FF]' : 'bg-white/40'
                      }`}
                      style={{
                        width: `${Math.min(100, (ptwB / 650) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="p-5 sm:p-8 border-t border-white/10 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F] font-bold block">
              // MECHANICAL & STRUCTURAL SPECIFICATIONS
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Car A Specs */}
              <div className="space-y-3 glass-panel p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF5A1F] pb-1 border-b border-white/10">
                  {carA.name} Architecture
                </h4>
                <div>
                  <span className="text-white/40 font-mono block">Powertrain / Engine:</span>
                  <p className="text-white font-medium mt-0.5">{carA.specs.engine}</p>
                </div>
                <div>
                  <span className="text-white/40 font-mono block">Drivetrain:</span>
                  <p className="text-white font-medium mt-0.5">{carA.specs.drivetrain}</p>
                </div>
                <div>
                  <span className="text-white/40 font-mono block">Chassis:</span>
                  <p className="text-white font-medium mt-0.5">{carA.specs.chassis}</p>
                </div>
                <div>
                  <span className="text-white/40 font-mono block">Curb Weight:</span>
                  <p className="text-white font-medium mt-0.5">{carA.specs.weight}</p>
                </div>
                {carA.specs.batteryCapacity && (
                  <div>
                    <span className="text-white/40 font-mono block">Battery Capacity:</span>
                    <p className="text-white font-medium mt-0.5">{carA.specs.batteryCapacity}</p>
                  </div>
                )}
                {carA.range && (
                  <div>
                    <span className="text-white/40 font-mono block">Estimated Range:</span>
                    <p className="text-white font-medium mt-0.5">{carA.range}</p>
                  </div>
                )}
              </div>

              {/* Car B Specs */}
              <div className="space-y-3 glass-panel p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-mono uppercase font-bold text-cyan-400 pb-1 border-b border-white/10">
                  {carB.name} Architecture
                </h4>
                <div>
                  <span className="text-white/40 font-mono block">Powertrain / Engine:</span>
                  <p className="text-white font-medium mt-0.5">{carB.specs.engine}</p>
                </div>
                <div>
                  <span className="text-white/40 font-mono block">Drivetrain:</span>
                  <p className="text-white font-medium mt-0.5">{carB.specs.drivetrain}</p>
                </div>
                <div>
                  <span className="text-white/40 font-mono block">Chassis:</span>
                  <p className="text-white font-medium mt-0.5">{carB.specs.chassis}</p>
                </div>
                <div>
                  <span className="text-white/40 font-mono block">Curb Weight:</span>
                  <p className="text-white font-medium mt-0.5">{carB.specs.weight}</p>
                </div>
                {carB.specs.batteryCapacity && (
                  <div>
                    <span className="text-white/40 font-mono block">Battery Capacity:</span>
                    <p className="text-white font-medium mt-0.5">{carB.specs.batteryCapacity}</p>
                  </div>
                )}
                {carB.range && (
                  <div>
                    <span className="text-white/40 font-mono block">Estimated Range:</span>
                    <p className="text-white font-medium mt-0.5">{carB.range}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Features Checklist Comparison */}
          <div className="p-5 sm:p-8 border-t border-white/10 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F] font-bold block">
              // BESPOKE HIGHLIGHT FEATURES
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                {carA.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl glass-panel text-white/90">
                    <CheckCircle className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {carB.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl glass-panel text-white/90">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Bar */}
          <div className="sticky bottom-0 z-20 p-4 sm:p-5 bg-[#080808]/95 backdrop-blur-xl border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-white/50">
              Select any hypercar from the dropdowns above to update telemetry live.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-mono uppercase bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              Close Benchmark
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
