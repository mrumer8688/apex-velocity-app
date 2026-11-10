import React from 'react';
import { motion } from 'motion/react';
import { Zap, Crown, Shield, ArrowRight } from 'lucide-react';
import { MagneticButton } from '../components/MagneticButton';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';
import blackMantisImg from '../assets/images/hypercar_black_mantis_1785141210537.jpg';
import interiorImg from '../assets/images/interior_luxury_1785141240879.jpg';

interface AboutSectionProps {
  onOpenTestDrive: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenTestDrive }) => {
  return (
    <section id="about" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll-Triggered Parallax Background */}
      <ParallaxSectionBackground glowColor="orange" accentText="ATELIER" speed={-0.18} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Typography & Features */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono uppercase bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F]">
                <Shield className="w-3.5 h-3.5" /> ATELIER CRAFTSMANSHIP
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold font-display uppercase text-white leading-[1.05]">
                BEYOND COMPARE <br />
                <span className="text-[#FF5A1F]">AN EXPERIENCE</span>
              </h2>
              <p className="text-[#BEBEBE] text-base sm:text-lg leading-relaxed">
                We don't just engineer hypercars — we curate extraordinary automotive experiences. Every detail is crafted to exceed the expectations of the most discerning global clientele.
              </p>
            </div>

            {/* Feature Bullets matching reference design */}
            <div className="space-y-6 pt-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#FF5A1F]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center shrink-0 border border-[#FF5A1F]/30 glow-orange">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display uppercase text-white">Instant Booking</h4>
                  <p className="text-xs sm:text-sm text-[#BEBEBE] mt-0.5">
                    Reserve your bespoke hypercar or private track session in under 60 seconds with instant telematics allocation.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#FF5A1F]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center shrink-0 border border-[#FF5A1F]/30 glow-orange">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display uppercase text-white">VIP Treatment</h4>
                  <p className="text-xs sm:text-sm text-[#BEBEBE] mt-0.5">
                    White-glove concierge service including enclosed transport delivery and dedicated track master instruction.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="pt-2">
              <MagneticButton
                variant="primary"
                onClick={onOpenTestDrive}
                className="py-4 px-8 font-bold text-sm"
              >
                Reserve Your Experience <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </div>

          {/* Right Column: Composite Visual with Full Widescreen Car Visibility */}
          <div className="lg:col-span-7 relative w-full">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 group shadow-2xl bg-gradient-to-b from-[#121218] via-[#08080a] to-[#040406]">
              {/* Full Car Image Showcase - Widescreen width for complete bumper-to-bumper visibility */}
              <div className="w-full relative flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-28">
                <img
                  src={blackMantisImg}
                  alt="Apex Velocity Mantis GT"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-contain rounded-2xl transition-transform duration-700 group-hover:scale-[1.02] drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                  style={{ width: '100%', minWidth: '100%' }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Floating Overlay Glass Badge positioned cleanly at bottom */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-5 right-3 sm:right-5 glass-card p-3 sm:p-4 rounded-2xl border border-white/15 flex items-center justify-between backdrop-blur-xl bg-black/60">
                <div>
                  <span className="text-[10px] font-mono text-[#FF5A1F] uppercase tracking-widest block">
                    INTERIOR COCKPIT ARCHITECTURE
                  </span>
                  <h4 className="text-sm sm:text-base font-bold font-display uppercase text-white">
                    CARBON & ALCANTARA
                  </h4>
                </div>
                <div className="w-14 sm:w-16 h-10 sm:h-12 rounded-xl overflow-hidden border border-white/20 shrink-0">
                  <img src={interiorImg} alt="Interior detail" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
