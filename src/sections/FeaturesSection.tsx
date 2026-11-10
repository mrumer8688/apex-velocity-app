import React from 'react';
import { motion } from 'motion/react';
import { Zap, Cpu, Sparkles, Shield, BatteryCharging, Globe } from 'lucide-react';
import { FEATURES_DATA } from '../data/features';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';

export const FeaturesSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Shield': return <Shield className="w-6 h-6 text-[#FF5A1F]" />;
      case 'BatteryCharging': return <BatteryCharging className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Globe': return <Globe className="w-6 h-6 text-[#FF5A1F]" />;
      default: return <Zap className="w-6 h-6 text-[#FF5A1F]" />;
    }
  };

  return (
    <section className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll-Triggered Parallax Background */}
      <ParallaxSectionBackground glowColor="cyan" accentText="DYNAMICS" speed={-0.15} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="ENGINEERING EXCELLENCE"
          title="CUTTING-EDGE"
          highlightText="TECHNOLOGY"
          subtitle="Discover the six pillars of performance driving our next-generation hypercars."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES_DATA.map((feat, idx) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center glow-orange group-hover:scale-110 transition-transform duration-300">
                    {getIcon(feat.icon)}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[#FF5A1F] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 inline-block">
                      {feat.highlight}
                    </span>
                    <h3 className="text-xl font-bold font-display uppercase text-white group-hover:text-[#FF5A1F] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#BEBEBE] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-mono text-[#BEBEBE]">
                  <span>APEX PATENED SYSTEM</span>
                  <span className="text-[#FF5A1F]">0{idx + 1}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
