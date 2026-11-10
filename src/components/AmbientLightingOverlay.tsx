import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export const AmbientLightingOverlay: React.FC = () => {
  const { isSunset } = useTheme();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-1000 select-none"
    >
      <AnimatePresence mode="wait">
        {isSunset ? (
          <motion.div
            key="sunset-lighting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Golden-Hour Sun Ray Flare at Horizon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[55vh] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,140,26,0.22)_0%,rgba(245,158,11,0.12)_35%,rgba(220,38,38,0.04)_65%,transparent_80%)] blur-2xl" />

            {/* Warm Dusk Amber Glow on Left Side */}
            <div className="absolute top-[20vh] -left-[20vw] w-[60vw] h-[70vh] bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.14)_0%,transparent_70%)] blur-3xl" />

            {/* Honey Gold Floor Reflection Rim Light */}
            <div className="absolute bottom-0 right-0 w-[70vw] h-[50vh] bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12)_0%,transparent_70%)] blur-3xl" />

            {/* Subtle Warm Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/[0.04] to-black/40" />
          </motion.div>
        ) : (
          <motion.div
            key="midnight-lighting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Deep Obsidian Starlight Atmosphere with Cool Apex Orange Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[45vh] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,90,31,0.10)_0%,rgba(0,229,255,0.03)_50%,transparent_80%)] blur-3xl" />

            {/* Deep Indigo Cool Shadows on Bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[40vh] bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(10,10,18,0.3)_0%,transparent_70%)] blur-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
