import React from 'react';

interface SectionDividerProps {
  accent?: boolean;
  className?: string;
  glow?: boolean;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  accent = false,
  className = '',
  glow = false,
}) => {
  return (
    <div
      className={`relative w-full flex items-center justify-center py-1 sm:py-2 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center justify-center">
        {/* Ambient back-glow for major highlighted transitions */}
        {(accent || glow) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-12 bg-gradient-to-r from-transparent via-[#FF5A1F]/20 to-transparent blur-xl pointer-events-none" />
        )}

        {/* Base horizontal gradient line fading smoothly to edges */}
        <div className="w-full h-[1px] relative flex items-center justify-center">
          {accent ? (
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF5A1F]/40 to-transparent">
              <div className="absolute inset-x-1/4 -top-[1px] h-[3px] bg-gradient-to-r from-transparent via-[#FF5A1F]/60 to-transparent blur-[0.5px]" />
            </div>
          ) : (
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent">
              <div className="absolute inset-x-1/3 -top-[0.5px] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          )}

          {/* Precision center apex diamond pip */}
          <div className="absolute flex items-center justify-center">
            {accent ? (
              <div className="relative flex items-center justify-center">
                <div className="w-2 h-2 rotate-45 bg-[#FF5A1F] shadow-[0_0_10px_#FF5A1F] rounded-[1px]" />
                <div className="absolute -inset-1 bg-[#FF5A1F]/30 rotate-45 blur-[2px]" />
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rotate-45 bg-white/30 rounded-[0.5px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
