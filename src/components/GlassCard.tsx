import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
  tiltEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowOnHover = true,
}) => {
  return (
    <motion.div
      whileHover={
        glowOnHover
          ? { y: -6, transition: { duration: 0.3, ease: 'easeOut' } }
          : undefined
      }
      className={`glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Subtle top subtle lighting highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  );
};
