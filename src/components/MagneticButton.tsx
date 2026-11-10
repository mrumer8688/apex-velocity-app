import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  ...props
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    // Dampened and clamped to prevent button from spilling outside its container
    const rawX = (e.clientX - (left + width / 2)) * 0.22;
    const rawY = (e.clientY - (top + height / 2)) * 0.22;
    const x = Math.max(-12, Math.min(12, rawX));
    const y = Math.max(-8, Math.min(8, rawY));
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#FF5A1F] text-white hover:bg-[#FF7340] glow-orange font-semibold shadow-lg shadow-[#FF5A1F]/20';
      case 'secondary':
        return 'bg-[#101010] text-white hover:bg-[#1A1A1A] border border-white/10 hover:border-[#FF5A1F]/50';
      case 'outline':
        return 'bg-transparent text-white border border-[#FF5A1F] hover:bg-[#FF5A1F]/10 text-[#FF5A1F]';
      case 'glass':
        return 'glass-panel text-white hover:border-[#FF5A1F]/50 hover:bg-white/10';
      default:
        return 'bg-[#FF5A1F] text-white';
    }
  };

  const hasCustomPadding = /p[xy]?-\d/.test(className);
  const paddingClasses = hasCustomPadding ? '' : 'px-7 py-3.5';
  const hasCustomTextSize = /text-(xs|sm|base|lg|xl)/.test(className);
  const textSizeClass = hasCustomTextSize ? '' : 'text-sm';

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 250, damping: 20, mass: 0.1 }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full tracking-wider uppercase transition-all duration-300 select-none overflow-hidden group cursor-pointer ${paddingClasses} ${textSizeClass} ${getVariantStyles()} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
    </motion.button>
  );
};

