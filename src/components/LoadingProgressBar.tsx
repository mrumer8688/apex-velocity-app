import React, { useState, useEffect } from 'react';

export const LoadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(12);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Stage 1: Quick burst for instant feedback
    const t1 = setTimeout(() => setProgress(35), 80);
    const t2 = setTimeout(() => setProgress(65), 250);
    const t3 = setTimeout(() => setProgress(88), 500);

    // Asset preloading check
    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
      }, 450);
    };

    // If document is already complete, finish shortly; otherwise listen to load
    if (document.readyState === 'complete') {
      const t4 = setTimeout(handleComplete, 750);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      window.addEventListener('load', handleComplete);
      // Fallback timeout in case some external media takes longer
      const tFallback = setTimeout(handleComplete, 1600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(tFallback);
        window.removeEventListener('load', handleComplete);
      };
    }
  }, []);

  if (!isVisible && progress >= 100) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-opacity duration-500 ease-out ${
        progress >= 100 ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Background track (semi-transparent) */}
      <div className="w-full h-[2.5px] bg-black/40 backdrop-blur-xs relative overflow-hidden">
        {/* Active progress bar */}
        <div
          className="h-full bg-gradient-to-r from-[#FF5A1F] via-[#FF8A00] to-[#FF3B00] shadow-[0_0_12px_#FF5A1F,0_0_24px_rgba(255,90,31,0.8)] transition-all duration-300 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Glowing head point */}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-[1.5px] opacity-90 shadow-[0_0_10px_#ffffff,0_0_20px_#FF5A1F]" />
        </div>
      </div>
    </div>
  );
};
