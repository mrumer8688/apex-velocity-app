import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Gauge, Shield, Battery, CheckCircle, ChevronRight, Sparkles, Scan, Scale, TrendingUp, Flame, Truck, Sliders, Cpu, Activity } from 'lucide-react';
import { CarModel } from '../types';
import { MagneticButton } from './MagneticButton';
import { CarARViewerModal } from './CarARViewerModal';
import { CarPerformanceSimulation } from './CarPerformanceSimulation';
import { CarMilestonesTimeline } from './CarMilestonesTimeline';
import { DeliveryOptions } from './DeliveryOptions';
import { InteractiveVehicleConfigurator } from './InteractiveVehicleConfigurator';

interface CarDetailModalProps {
  car: CarModel | null;
  onClose: () => void;
  onReserve: (carId: string) => void;
  onOpenCompare?: (car: CarModel) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  onClose,
  onReserve,
  onOpenCompare,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [arModalOpen, setArModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'techSpecs' | 'architecture' | 'simulation' | 'delivery' | 'configurator'>('techSpecs');

  if (!car) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-5xl glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-full glass-panel text-white hover:text-[#FF5A1F] transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Gallery Viewer */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/10 group">
                <img
                  src={car.gallery[activeImageIndex] || car.image}
                  alt={car.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-black/60 text-[#FF5A1F] border border-[#FF5A1F]/30 backdrop-blur-md">
                    {car.category}
                  </span>
                  <span className="text-xl font-bold font-display text-white">
                    {car.price}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {car.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative rounded-xl overflow-hidden w-20 h-14 shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#FF5A1F] scale-105 shadow-md shadow-[#FF5A1F]/30'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${car.name} thumbnail ${idx}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Vehicle Provenance & Bespoke Certification Badge */}
              <div className="p-3.5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5A1F] block tracking-wider font-bold">
                      ATELIER CERTIFIED SPEC
                    </span>
                    <span className="text-xs text-white/80 font-mono">
                      {car.specs.chassis.split(' ')[0] || 'Carbon'} Monocoque Chassis
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-white/70">
                  {car.category}
                </span>
              </div>
            </div>

            {/* Right: Specs & Info */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#FF5A1F] tracking-widest mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> {car.subtitle}
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display uppercase text-white">
                  {car.name}
                </h2>
                <p className="text-sm text-[#BEBEBE] mt-3 leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Key Highlights Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-panel p-3.5 rounded-xl text-center border border-white/10">
                  <div className="text-[#FF5A1F] font-mono text-xs uppercase mb-0.5 flex justify-center items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> ACCEL
                  </div>
                  <div className="text-base sm:text-lg font-bold font-display text-white">
                    {car.acceleration}
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl text-center border border-white/10">
                  <div className="text-[#FF5A1F] font-mono text-xs uppercase mb-0.5 flex justify-center items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" /> TOP SPEED
                  </div>
                  <div className="text-base sm:text-lg font-bold font-display text-white">
                    {car.topSpeed}
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl text-center border border-white/10">
                  <div className="text-[#FF5A1F] font-mono text-xs uppercase mb-0.5 flex justify-center items-center gap-1">
                    <Battery className="w-3.5 h-3.5" /> POWER
                  </div>
                  <div className="text-base sm:text-lg font-bold font-display text-white">
                    {car.power}
                  </div>
                </div>
              </div>

              {/* Tab Switcher for Technical Specifications, Architecture & Features, D3 Simulation, Delivery, and 3D Config */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-white/10 mb-4 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setModalTab('techSpecs')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      modalTab === 'techSpecs'
                        ? 'bg-[#FF5A1F] text-black font-bold shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                        : 'text-white/70 hover:text-[#FF5A1F]'
                    }`}
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Technical Specs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('architecture')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      modalTab === 'architecture'
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Features</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('simulation')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      modalTab === 'simulation'
                        ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                        : 'text-white/70 hover:text-[#00E5FF]'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Dynamics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('delivery')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      modalTab === 'delivery'
                        ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF3B00] text-black font-bold shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                        : 'text-white/70 hover:text-[#FF5A1F]'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('configurator')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      modalTab === 'configurator'
                        ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF3B00] text-black font-bold shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                        : 'text-white/70 hover:text-[#FF5A1F]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>3D Config</span>
                  </button>
                </div>

                {modalTab === 'techSpecs' ? (
                  <div className="space-y-4">
                    {/* Telemetry Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[#FF5A1F]" />
                        <span className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                          // TECHNICAL SPECIFICATIONS
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/50 uppercase">
                        ATELIER BENCHMARK
                      </span>
                    </div>

                    {/* Primary Futuristic Grid: Engine Power, Top Speed, Acceleration Figures */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Engine Power Card */}
                      <div className="group p-4 rounded-2xl glass-panel border border-white/10 hover:border-[#FF5A1F]/50 bg-gradient-to-b from-white/[0.04] to-black/60 transition-all shadow-lg flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                              ENGINE POWER
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
                              <Flame className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="font-orbitron font-black text-2xl sm:text-3xl text-[#FF5A1F] tracking-tight group-hover:scale-105 transition-transform origin-left">
                            {car.power}
                          </div>
                          <span className="text-[10px] font-mono text-white/60 block mt-1">
                            {parseInt(car.power.replace(/[^0-9]/g, ''))
                              ? `~${Math.round(parseInt(car.power.replace(/[^0-9]/g, '')) * 0.7457)} kW Output`
                              : 'Dyno Verified'}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1">
                            <span>OUTPUT</span>
                            <span className="text-[#FF5A1F]">MAX TUNED</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-[#FF5A1F] to-[#FF3B00] h-full rounded-full w-[94%]" />
                          </div>
                        </div>
                      </div>

                      {/* 2. Top Speed Card */}
                      <div className="group p-4 rounded-2xl glass-panel border border-white/10 hover:border-cyan-400/50 bg-gradient-to-b from-white/[0.04] to-black/60 transition-all shadow-lg flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                              TOP SPEED
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                              <Gauge className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="font-orbitron font-black text-2xl sm:text-3xl text-cyan-400 tracking-tight group-hover:scale-105 transition-transform origin-left">
                            {car.topSpeed}
                          </div>
                          <span className="text-[10px] font-mono text-white/60 block mt-1">
                            {parseInt(car.topSpeed.replace(/[^0-9]/g, ''))
                              ? `~${Math.round(parseInt(car.topSpeed.replace(/[^0-9]/g, '')) * 1.60934)} KM/H`
                              : 'V-Max Velocity'}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1">
                            <span>AERODYNAMICS</span>
                            <span className="text-cyan-400">OPTIMAL</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-500 to-cyan-300 h-full rounded-full w-[92%]" />
                          </div>
                        </div>
                      </div>

                      {/* 3. Acceleration Card */}
                      <div className="group p-4 rounded-2xl glass-panel border border-white/10 hover:border-emerald-400/50 bg-gradient-to-b from-white/[0.04] to-black/60 transition-all shadow-lg flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                              ACCELERATION
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                              <Zap className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="font-orbitron font-black text-2xl sm:text-3xl text-emerald-400 tracking-tight group-hover:scale-105 transition-transform origin-left">
                            {car.acceleration}
                          </div>
                          <span className="text-[10px] font-mono text-white/60 block mt-1">
                            0-60 MPH // Sprint Time
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1">
                            <span>LAUNCH G</span>
                            <span className="text-emerald-400">SUB-2S</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-full rounded-full w-[96%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clean Secondary Specifications Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      {/* Powertrain Detail */}
                      <div className="p-3 rounded-xl glass-panel border border-white/10 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-[#FF5A1F] shrink-0 mt-0.5">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">
                            Powertrain & Architecture
                          </span>
                          <p className="text-white font-medium text-xs mt-0.5 leading-snug">
                            {car.specs.engine}
                          </p>
                        </div>
                      </div>

                      {/* Drivetrain Detail */}
                      <div className="p-3 rounded-xl glass-panel border border-white/10 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-cyan-400 shrink-0 mt-0.5">
                          <Gauge className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">
                            Drivetrain & Traction
                          </span>
                          <p className="text-white font-medium text-xs mt-0.5 leading-snug">
                            {car.specs.drivetrain}
                          </p>
                        </div>
                      </div>

                      {/* Chassis Detail */}
                      <div className="p-3 rounded-xl glass-panel border border-white/10 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-purple-400 shrink-0 mt-0.5">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">
                            Chassis & Structure
                          </span>
                          <p className="text-white font-medium text-xs mt-0.5 leading-snug">
                            {car.specs.chassis}
                          </p>
                        </div>
                      </div>

                      {/* Curb Weight */}
                      <div className="p-3 rounded-xl glass-panel border border-white/10 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-amber-400 shrink-0 mt-0.5">
                          <Scale className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase text-white/40 block">
                            Curb Weight
                          </span>
                          <p className="text-white font-medium text-xs mt-0.5 leading-snug">
                            {car.specs.weight}
                          </p>
                        </div>
                      </div>

                      {/* Battery / Range Detail */}
                      {(car.specs.batteryCapacity || car.range) && (
                        <div className="p-3 rounded-xl glass-panel border border-white/10 flex items-start gap-3 sm:col-span-2">
                          <div className="p-2 rounded-lg bg-white/5 text-emerald-400 shrink-0 mt-0.5">
                            <Battery className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {car.specs.batteryCapacity && (
                              <div>
                                <span className="text-[10px] font-mono uppercase text-white/40 block">
                                  High-Voltage Battery
                                </span>
                                <p className="text-white font-medium text-xs mt-0.5">
                                  {car.specs.batteryCapacity}
                                </p>
                              </div>
                            )}
                            {car.range && (
                              <div>
                                <span className="text-[10px] font-mono uppercase text-white/40 block">
                                  Estimated Range
                                </span>
                                <p className="text-white font-medium text-xs mt-0.5">
                                  {car.range}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : modalTab === 'architecture' ? (
                  <div className="space-y-4">
                    {/* Specs Breakdown */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-[#BEBEBE]">
                        // MECHANICAL ARCHITECTURE
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <div>
                          <span className="text-[#BEBEBE]">Powertrain:</span>
                          <p className="text-white font-medium">{car.specs.engine}</p>
                        </div>
                        <div>
                          <span className="text-[#BEBEBE]">Drivetrain:</span>
                          <p className="text-white font-medium">{car.specs.drivetrain}</p>
                        </div>
                        <div>
                          <span className="text-[#BEBEBE]">Chassis:</span>
                          <p className="text-white font-medium">{car.specs.chassis}</p>
                        </div>
                        <div>
                          <span className="text-[#BEBEBE]">Curb Weight:</span>
                          <p className="text-white font-medium">{car.specs.weight}</p>
                        </div>
                        {car.specs.batteryCapacity && (
                          <div>
                            <span className="text-[#BEBEBE]">Battery:</span>
                            <p className="text-white font-medium">{car.specs.batteryCapacity}</p>
                          </div>
                        )}
                        {car.specs.chargingTime && (
                          <div>
                            <span className="text-[#BEBEBE]">Charging:</span>
                            <p className="text-white font-medium">{car.specs.chargingTime}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Features list */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-[#BEBEBE]">
                        // BESPOKE HIGHLIGHT FEATURES
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {car.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white">
                            <CheckCircle className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : modalTab === 'simulation' ? (
                  /* D3.js Performance Simulation Tool */
                  <CarPerformanceSimulation car={car} />
                ) : modalTab === 'delivery' ? (
                  /* Real-Time Geographic Delivery Options Calculator */
                  <div className="pt-1">
                    <DeliveryOptions initialCar={car} />
                  </div>
                ) : (
                  /* Interactive 3D Vehicle Configurator */
                  <div className="pt-1">
                    <InteractiveVehicleConfigurator initialCar={car} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <MagneticButton
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onReserve(car.id);
                  }}
                  className="flex-1 w-full py-4 justify-center font-bold"
                >
                  Reserve This Spec <ChevronRight className="w-4 h-4" />
                </MagneticButton>

                {onOpenCompare && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCompare(car);
                    }}
                    className="w-full sm:w-auto py-4 px-5 rounded-full border border-white/15 bg-white/5 hover:bg-[#FF5A1F]/15 hover:border-[#FF5A1F]/50 text-white font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
                    title="Compare with another hypercar"
                  >
                    <Scale className="w-4 h-4 text-[#FF5A1F] group-hover:scale-110 transition-transform" />
                    <span>Compare</span>
                  </button>
                )}

                <MagneticButton
                  variant="secondary"
                  onClick={() => setArModalOpen(true)}
                  className="w-full sm:w-auto py-4 px-6 justify-center font-bold text-xs flex items-center gap-2 group"
                >
                  <Scan className="w-4 h-4 text-[#FF5A1F] group-hover:scale-110 transition-transform" />
                  <span>View in AR</span>
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Scrollable Horizontal Timeline: Design Evolution & Engineering Milestones */}
          <CarMilestonesTimeline car={car} />
        </motion.div>

        {/* Camera AR Projection Modal */}
        <CarARViewerModal
          isOpen={arModalOpen}
          onClose={() => setArModalOpen(false)}
          car={car}
        />
      </div>
    </AnimatePresence>
  );
};
