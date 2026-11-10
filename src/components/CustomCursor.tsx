import React from 'react';
import { motion } from 'motion/react';
import { useCursorPosition } from '../hooks/useCursorPosition';

export const CustomCursor: React.FC = () => {
  const { position, isHovered } = useCursorPosition();

  // Hide custom cursor on mobile touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <>
      {/* Outer Glow Circle */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full border border-[#FF5A1F]/40 bg-[#FF5A1F]/10 backdrop-blur-[2px]"
        animate={{
          x: position.x - (isHovered ? 28 : 16),
          y: position.y - (isHovered ? 28 : 16),
          width: isHovered ? 56 : 32,
          height: isHovered ? 56 : 32,
          scale: isHovered ? 1.25 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 28,
          mass: 0.1,
        }}
      />
      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 w-2 h-2 rounded-full bg-[#FF5A1F] glow-orange"
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          scale: isHovered ? 0.5 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 800,
          damping: 35,
        }}
      />
    </>
  );
};
