import React from 'react';
import { motion } from 'motion/react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  highlightText?: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  highlightText,
  subtitle,
  centered = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 mb-12 sm:mb-16 ${centered ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
          {eyebrow}
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-white leading-[1.1]"
      >
        {title}{' '}
        {highlightText && (
          <span className="text-[#FF5A1F] italic font-light">{highlightText}</span>
        )}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[#BEBEBE] text-base sm:text-lg leading-relaxed font-normal"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
