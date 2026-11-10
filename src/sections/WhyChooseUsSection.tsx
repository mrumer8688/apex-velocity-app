import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { TIMELINE_DATA } from '../data/timeline';
import { SectionHeading } from '../components/SectionHeading';

const ICONS = [Zap, Award, ShieldCheck, Sparkles];

export const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden border-t border-white/10">
      {/* Ambient background lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#FF5A1F]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="HERITAGE & INNOVATION"
          title="THE APEX"
          highlightText="TIMELINE"
          subtitle="Explore the technological breakthroughs defining our trajectory toward total electric dominance."
          centered
        />

        {/* Horizontal Row Timeline Container */}
        <div className="relative mt-14 sm:mt-20">
          {/* Connecting glowing milestone track for large screens */}
          <div className="hidden lg:block absolute top-[18px] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-transparent via-[#FF5A1F]/60 to-transparent z-0 pointer-events-none" />

          {/* Cards arranged in a row with grid responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {TIMELINE_DATA.map((event, idx) => {
              const IconComponent = ICONS[idx % ICONS.length];
              const isLatest = idx === TIMELINE_DATA.length - 1;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }}
                  className="group flex flex-col h-full cursor-default"
                >
                  {/* Step Indicator & Glowing Node */}
                  <div className="flex items-center gap-2.5 mb-4 pl-1">
                    <div className="relative flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-[#050505] flex items-center justify-center border-2 border-[#FF5A1F] shadow-[0_0_12px_rgba(255,90,31,0.5)] group-hover:scale-125 transition-transform duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
                      </div>
                      {isLatest && (
                        <span className="absolute -inset-1 rounded-full bg-[#FF5A1F]/40 animate-ping pointer-events-none" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-[#BEBEBE] group-hover:text-[#FF5A1F] transition-colors uppercase">
                      Phase 0{idx + 1}
                    </span>
                  </div>

                  {/* Card Body with Glass Effect and Hover Animations */}
                  <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 group-hover:border-[#FF5A1F]/50 transition-all duration-300 flex flex-col justify-between flex-1 relative overflow-hidden bg-black/40 backdrop-blur-xl group-hover:shadow-[0_12px_36px_rgba(255,90,31,0.18)]">
                    {/* Corner Ambient Glow */}
                    <div className="absolute -right-12 -top-12 w-28 h-28 bg-[#FF5A1F]/10 rounded-full blur-2xl group-hover:bg-[#FF5A1F]/25 transition-all duration-500 pointer-events-none" />

                    <div>
                      {/* Year & Milestone Badge */}
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-3xl font-black font-display text-[#FF5A1F] tracking-tight group-hover:translate-x-1 transition-transform duration-300 inline-block">
                          {event.year}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/30 font-semibold tracking-wider">
                          {isLatest ? 'ACTIVE' : 'MILESTONE'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold font-display uppercase text-white group-hover:text-[#FF5A1F] transition-colors leading-snug">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#BEBEBE] mt-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Achievement Footer */}
                    <div className="mt-6 pt-3.5 border-t border-white/10 flex items-start gap-2.5 text-xs font-mono">
                      <IconComponent className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="leading-snug text-white/80 group-hover:text-white transition-colors">
                        {event.achievement}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
