import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Gauge, Shield, Battery, CheckCircle, ChevronRight, Sparkles, Scan, Scale, TrendingUp, Flame, Volume2, Truck, Sliders } from 'lucide-react';
import { CarModel } from '../types';
import { MagneticButton } from './MagneticButton';
import { CarARViewerModal } from './CarARViewerModal';
import { CarPerformanceSimulation } from './CarPerformanceSimulation';
import { EngineSoundControl } from './EngineSoundControl';
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
  const [modalTab, setModalTab] = useState<'architecture' | 'audioEngine' | 'simulation' | 'delivery' | 'configurator'>('architecture');

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

              {/* Direct Engine Ignition & Exhaust Sound Control */}
              <div className="pt-2">
                <EngineSoundControl car={car} compact />
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

              {/* Tab Switcher for Architecture vs Engine Acoustics vs D3 Performance Simulation */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-white/10 mb-4 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setModalTab('architecture')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      modalTab === 'architecture'
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Specs & Features
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('audioEngine')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      modalTab === 'audioEngine'
                        ? 'bg-[#FF5A1F] text-black font-bold shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                        : 'text-white/70 hover:text-[#FF5A1F]'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Engine Sound</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('simulation')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      modalTab === 'simulation'
                        ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                        : 'text-white/70 hover:text-[#00E5FF]'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>D3 Dynamics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('delivery')}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      modalTab === 'configurator'
                        ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF3B00] text-black font-bold shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                        : 'text-white/70 hover:text-[#FF5A1F]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>3D Config</span>
                  </button>
                </div>

                {modalTab === 'architecture' ? (
                  <div className="space-y-4">
                    {/* Specs Breakdown */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-[#BEBEBE]">
                        // TECHNICAL ARCHITECTURE
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
                        // HIGHLIGHT FEATURES
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
                ) : modalTab === 'audioEngine' ? (
                  <div className="space-y-4">
                    <EngineSoundControl car={car} />
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
