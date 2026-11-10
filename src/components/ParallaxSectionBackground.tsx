import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ParallaxSectionBackgroundProps {
  glowColor?: 'orange' | 'cyan' | 'amber' | 'neutral';
  accentText?: string;
  speed?: number; // Speed factor: e.g. -0.2 (slower) or 0.2
  secondarySpeed?: number;
  showGrid?: boolean;
  className?: string;
}

export const ParallaxSectionBackground: React.FC<ParallaxSectionBackgroundProps> = ({
  glowColor = 'orange',
  accentText,
  speed = -0.15,
  secondarySpeed = 0.22,
  showGrid = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Calculate subtle vertical parallax translation values (in pixels)
  const yOrb1 = useTransform(scrollYProgress, [0, 1], [-50 * Math.abs(speed * 5), 70 * Math.abs(speed * 5)]);
  const yOrb2 = useTransform(scrollYProgress, [0, 1], [60 * Math.abs(secondarySpeed * 4), -80 * Math.abs(secondarySpeed * 4)]);
  const yWatermark = useTransform(scrollYProgress, [0, 1], [-35, 45]);
  const yGrid = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const opacityGlow = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.45, 0.25]);

  // Color mapping
  const glowMap = {
    orange: {
      primary: 'rgba(255, 90, 31, 0.14)',
      secondary: 'rgba(255, 42, 0, 0.08)',
      highlight: 'rgba(255, 122, 0, 0.06)',
    },
    cyan: {
      primary: 'rgba(0, 210, 255, 0.12)',
      secondary: 'rgba(0, 140, 255, 0.08)',
      highlight: 'rgba(0, 255, 220, 0.05)',
    },
    amber: {
      primary: 'rgba(245, 158, 11, 0.14)',
      secondary: 'rgba(217, 119, 6, 0.08)',
      highlight: 'rgba(251, 191, 36, 0.05)',
    },
    neutral: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(180, 180, 180, 0.05)',
      highlight: 'rgba(255, 90, 31, 0.06)',
    },
  }[glowColor];

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
    >
      {/* Subtle Scroll-Drifting High-Tech Grid */}
      {showGrid && (
        <motion.div
          style={{ y: yGrid }}
          className="absolute -inset-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"
        />
      )}

      {/* Floating Parallax Volumetric Glow Orb 1 */}
      <motion.div
        style={{
          y: yOrb1,
          opacity: opacityGlow,
          background: `radial-gradient(circle, ${glowMap.primary} 0%, ${glowMap.secondary} 45%, transparent 75%)`,
        }}
        className="absolute -top-24 -left-20 w-[550px] h-[550px] rounded-full blur-[130px] will-change-transform"
      />

      {/* Floating Parallax Volumetric Glow Orb 2 */}
      <motion.div
        style={{
          y: yOrb2,
          opacity: opacityGlow,
          background: `radial-gradient(circle, ${glowMap.secondary} 0%, ${glowMap.highlight} 50%, transparent 80%)`,
        }}
        className="absolute -bottom-24 -right-20 w-[600px] h-[600px] rounded-full blur-[150px] will-change-transform"
      />

      {/* Technical Automotive Architectural Watermark / Coordinates */}
      {accentText && (
        <motion.div
          style={{ y: yWatermark }}
          className="absolute right-6 top-1/3 select-none pointer-events-none hidden xl:block opacity-[0.035]"
        >
          <span className="text-[120px] font-black font-display tracking-tighter text-white uppercase leading-none block whitespace-nowrap">
            {accentText}
          </span>
        </motion.div>
      )}

      {/* Sleek diagonal speed streak */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,90,31,0.03)_0%,transparent_60%)]" />
    </div>
  );
};
