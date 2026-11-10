import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, CheckCircle, Sparkles, User, Mail, Phone, Car } from 'lucide-react';
import { CARS_DATA } from '../data/cars';
import { MagneticButton } from './MagneticButton';

import { triggerHaptic } from '../utils/haptics';

interface TestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCarId?: string;
}

export const TestDriveModal: React.FC<TestDriveModalProps> = ({
  isOpen,
  onClose,
  selectedCarId,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    modelId: selectedCarId || CARS_DATA[0].id,
    date: '',
    location: 'Monaco Atelier',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full glass-panel text-white hover:text-[#FF5A1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center mx-auto border border-[#FF5A1F]/40 glow-orange">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold font-display uppercase text-white">
                RESERVATION CONFIRMED
              </h3>
              <p className="text-[#BEBEBE] max-w-md mx-auto text-sm leading-relaxed">
                Thank you, <span className="text-white font-semibold">{formData.fullName}</span>. An Apex Concierge specialist has been assigned to prepare your private test drive at <span className="text-[#FF5A1F] font-semibold">{formData.location}</span>.
              </p>
              <div className="pt-4 text-xs font-mono text-[#BEBEBE]">
                CONFIRMATION REF: <span className="text-[#FF5A1F]">APX-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="space-y-2 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F]">
                  <Sparkles className="w-3.5 h-3.5" />
                  VIP CONCIERGE EXPERIENCE
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display uppercase text-white">
                  BOOK PRIVATE TEST DRIVE
                </h3>
                <p className="text-xs sm:text-sm text-[#BEBEBE]">
                  Experience raw electric torque and aerodynamic precision in a controlled private track environment.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#BEBEBE] mb-2 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#FF5A1F]" /> Select Apex Hypercar Model
                  </label>
                  <select
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5A1F] text-sm"
                  >
                    {CARS_DATA.map((car) => (
                      <option key={car.id} value={car.id} className="bg-[#101010]">
                        {car.name} — {car.price} ({car.power})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BEBEBE] mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#FF5A1F]" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alexander Vance"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5A1F] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BEBEBE] mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#FF5A1F]" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vance@apex.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5A1F] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BEBEBE] mb-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#FF5A1F]" /> Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5A1F] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BEBEBE] mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FF5A1F]" /> Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5A1F] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#BEBEBE] mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" /> Location
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5A1F] text-sm"
                    >
                      <option value="Monaco Atelier">Monaco Track Atelier</option>
                      <option value="Dubai Autodrome">Dubai Autodrome</option>
                      <option value="Los Angeles Experience Center">Los Angeles Center</option>
                      <option value="Nürburgring Test Center">Nürburgring Test Center</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <MagneticButton
                    variant="primary"
                    type="submit"
                    className="w-full py-4 text-center justify-center font-bold"
                  >
                    Confirm VIP Reservation
                  </MagneticButton>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
