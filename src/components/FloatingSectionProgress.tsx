import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useScrollSpy } from '../hooks/useScrollSpy';

interface SectionItem {
  id: string;
  name: string;
  code: string;
  subtitle: string;
}

const SECTIONS: SectionItem[] = [
  { id: 'hero', name: 'Overview', code: '01', subtitle: 'Apex Velocity' },
  { id: 'about', name: 'About', code: '02', subtitle: 'Craft & Heritage' },
  { id: 'cars', name: 'Fleet', code: '03', subtitle: 'Hypercar Fleet' },
  { id: 'experience', name: 'Studio', code: '04', subtitle: 'Dynamic Vehicle' },
  { id: 'film', name: 'Cinema', code: '05', subtitle: 'The Midnight Atelier' },
  { id: 'gallery', name: 'Gallery', code: '06', subtitle: 'Exhibition' },
  { id: 'global', name: 'Global', code: '07', subtitle: 'Worldwide Hubs' },
  { id: 'pulse', name: 'Pulse', code: '08', subtitle: 'Community Feed' },
  { id: 'contact', name: 'Concierge', code: '09', subtitle: 'Inquire & Book' },
];

export const FloatingSectionProgress: React.FC = () => {
  const { scrollProgress } = useScrollProgress();
  const activeSectionId = useScrollSpy(
    SECTIONS.map((s) => s.id),
    220
  );
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const navOffset = 90;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - navOffset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth',
    });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeSectionId);
  const currentSection = SECTIONS[activeIndex] || SECTIONS[0];

  return (
    <aside
      aria-label="Page section progress"
      className="fixed right-3 lg:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center select-none pointer-events-none"
    >
      <div className="pointer-events-auto flex flex-col items-center glass-panel rounded-full py-4 px-2.5 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] group/dock">
        {/* Top Header Mini Telemetry */}
        <div className="mb-3 flex flex-col items-center">
          <span className="text-[8px] font-mono tracking-widest text-[#FF5A1F] uppercase font-bold opacity-80">
            APEX
          </span>
          <span className="text-[7px] font-mono text-[#BEBEBE] tracking-tighter">
            {currentSection.code}/06
          </span>
        </div>

        {/* Section Waypoints & Vertical Rail Track */}
        <div className="relative flex flex-col items-center gap-5 py-2">
          {/* Continuous Orange Track Fill Indicator */}
          <div className="absolute top-1 bottom-1 w-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-gradient-to-b from-[#FF5A1F] via-[#FF7A00] to-[#FF2A00] rounded-full shadow-[0_0_8px_#FF5A1F]"
              style={{
                height: `${Math.min(100, Math.max(4, scrollProgress))}%`,
              }}
              transition={{ ease: 'easeOut', duration: 0.15 }}
            />
          </div>

          {/* Discrete Waypoints for Each Major Section */}
          {SECTIONS.map((section, idx) => {
            const isActive = activeSectionId === section.id;
            const isHovered = hoveredSection === section.id;

            return (
              <div key={section.id} className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleScrollToSection(section.id)}
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                  className="relative z-10 p-1.5 rounded-full transition-transform duration-300 focus:outline-none cursor-pointer"
                  aria-label={`Scroll to ${section.name}`}
                >
                  {/* Outer Active Pulse Aura */}
                  {isActive && (
                    <motion.span
                      layoutId="activeSectionOrb"
                      className="absolute inset-0 rounded-full bg-[#FF5A1F]/30 border border-[#FF5A1F] shadow-[0_0_12px_rgba(255,90,31,0.6)] animate-pulse"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}

                  {/* Waypoint Dot */}
                  <span
                    className={`block transition-all duration-300 rounded-full ${
                      isActive
                        ? 'w-2.5 h-2.5 bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F] scale-110'
                        : isHovered
                        ? 'w-2 h-2 bg-white scale-125'
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                </button>

                {/* Floating Left Flyout Tooltip on Hover or Active Focus */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-9 top-1/2 -translate-y-1/2 whitespace-nowrap z-50 pointer-events-none"
                    >
                      <div className="glass-card px-3 py-1.5 rounded-xl border border-white/20 shadow-xl flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#FF5A1F] font-bold">
                          {section.code}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold font-display uppercase tracking-wide text-white">
                            {section.name}
                          </span>
                          <span className="text-[9px] font-mono text-[#BEBEBE]">
                            {section.subtitle}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Percentage Readout & Scroll to Top */}
        <div className="mt-3 pt-2 border-t border-white/10 flex flex-col items-center">
          {scrollProgress > 20 ? (
            <button
              type="button"
              onClick={handleScrollToTop}
              className="p-1 rounded-full text-[#BEBEBE] hover:text-[#FF5A1F] hover:bg-white/5 transition-colors cursor-pointer"
              title="Return to top"
              aria-label="Return to top"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-white/20 my-1" />
          )}

          <span className="text-[8px] font-mono text-white/70 tracking-tighter">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>
    </aside>
  );
};
