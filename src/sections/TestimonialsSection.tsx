import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonials';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';

export const TestimonialsSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const nextTestimonial = () => {
    setActiveIdx((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  const prevTestimonial = () => {
    setActiveIdx((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  };

  const current = TESTIMONIALS_DATA[activeIdx];

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="COLLECTOR ENDORSEMENTS"
          title="OWNER & RACER"
          highlightText="REVIEWS"
          subtitle="Read firsthand experiences from drivers, aerospace engineers, and endurance racers."
          centered
        />

        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 sm:p-12 relative border border-white/10">
            <Quote className="w-12 h-12 text-[#FF5A1F]/30 absolute top-6 right-6" />

            <div className="space-y-6">
              {/* Star Rating */}
              <div className="flex gap-1 text-[#FF5A1F]">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-lg sm:text-2xl font-normal text-white italic leading-relaxed">
                "{current.comment}"
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#FF5A1F]"
                  />
                  <div>
                    <h4 className="text-lg font-bold font-display uppercase text-white">
                      {current.name}
                    </h4>
                    <p className="text-xs text-[#BEBEBE]">
                      {current.role} • <span className="text-[#FF5A1F]">{current.company}</span> ({current.location})
                    </p>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTestimonial}
                    className="p-3 rounded-full glass-panel text-white hover:text-[#FF5A1F] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="p-3 rounded-full glass-panel text-white hover:text-[#FF5A1F] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
