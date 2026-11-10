import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, Zap, Gauge } from 'lucide-react';
import { MagneticButton } from '../components/MagneticButton';
import { CARS_DATA } from '../data/cars';
import { CarModel } from '../types';
import heroPosterImg from '../assets/images/apex_hero_poster_1785141175569.jpg';

interface HeroSectionProps {
  onExploreCars: () => void;
  onOpenTestDrive: () => void;
  onSelectCar?: (car: CarModel) => void;
}

const ROTATION_INTERVAL_MS = 4000;

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCars,
  onOpenTestDrive,
}) => {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const yHeroBackground = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yHeroGlow = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroMediaOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  // Cinematic automotive loop video
  const videoSrc = '/videos/hero-mustang-loop.mp4';

  // Ensure background video is always playing and never stopped by audio changes
  useEffect(() => {
    if (videoRef.current && !videoError) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, [videoError]);

  const goToNextCar = useCallback(() => {
    setCurrentCarIndex((prev) => (prev + 1) % CARS_DATA.length);
    setProgress(0);
  }, []);

  const goToPrevCar = useCallback(() => {
    setCurrentCarIndex((prev) => (prev - 1 + CARS_DATA.length) % CARS_DATA.length);
    setProgress(0);
  }, []);

  const goToCar = useCallback((index: number) => {
    setCurrentCarIndex(index);
    setProgress(0);
  }, []);

  // Cars continuously animate and rotate through all models in the hero section
  useEffect(() => {
    if (isPaused) return;

    const stepMs = 50;
    const progressIncrement = (stepMs / ROTATION_INTERVAL_MS) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextCar();
          return 0;
        }
        return prev + progressIncrement;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, goToNextCar]);

  const activeCar = CARS_DATA[currentCarIndex];

  return (
    <section ref={heroRef} id="hero" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background Video & Animated Car Showcase Layer with Scroll-Triggered Parallax Depth */}
      <motion.div
        style={{ y: yHeroBackground, opacity: heroMediaOpacity }}
        className="absolute -top-16 -bottom-16 inset-x-0 w-full overflow-hidden will-change-transform"
      >
        {/* Continuous looping ambient background video */}
        {!videoError ? (
          <video
            ref={videoRef}
            poster={heroPosterImg}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover scale-105 opacity-20"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={heroPosterImg}
            alt="Apex Motors Hero"
            className="w-full h-full object-cover scale-105 opacity-20"
          />
        )}

        {/* Dynamic Animated Car Visual Stage across the Hero Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCar.id}
            initial={{ opacity: 0, scale: 1.08, x: 45 }}
            animate={{ opacity: 0.9, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -45 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <img
              src={activeCar.image}
              alt={activeCar.name}
              className="w-full h-full object-cover object-[65%_center] lg:object-[60%_center]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Left-side Dark Vignette Scrim ensuring Left Text readability while Car shines on center/right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent w-full lg:w-[65%] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/70 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-dots opacity-25 pointer-events-none" />

        {/* Glowing Atmospheric Dynamic Accent Light with Parallax counter-drift */}
        <motion.div
          style={{ y: yHeroGlow }}
          className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] bg-[#FF5A1F] rounded-full blur-[200px] opacity-20 pointer-events-none will-change-transform"
        />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-white rounded-full blur-[180px] opacity-10 pointer-events-none" />
      </motion.div>

      {/* Side Navigation Dots */}
      <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-30 flex-col gap-4 pointer-events-none">
        <div className="w-1 h-12 bg-[#FF5A1F] rounded-full glow-orange" />
        <div className="w-1 h-3 bg-white/20 rounded-full" />
        <div className="w-1 h-3 bg-white/20 rounded-full" />
        <div className="w-1 h-3 bg-white/20 rounded-full" />
      </div>

      {/* Hero Content Container - Content shifted cleanly to the left to optimize layout space */}
      <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-14 xl:px-20 pt-8 mr-auto">
        <div className="max-w-3xl xl:max-w-4xl flex flex-col items-start text-left space-y-7 mr-auto">
          {/* Eyebrow architecture pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.25em] bg-white/5 border border-white/10 text-gray-300 backdrop-blur-md"
          >
            <span className="w-2 h-2 bg-[#FF5A1F] rounded-full animate-pulse glow-orange" />
            <span>THE ALL-ELECTRIC V1 HYPERCAR ARCHITECTURE</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display uppercase italic tracking-tighter leading-[0.9] drop-shadow-2xl text-white text-left"
          >
            EXPERIENCE <br />
            <span className="text-stroke-white italic">THE</span>{' '}
            <span className="text-[#FF5A1F]">FUTURE</span> <br />
            AUTOMOTIVE
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-300 text-base sm:text-lg max-w-2xl font-light leading-relaxed text-left"
          >
            Redefining physical boundaries with carbon-fiber architecture and quad-motor precision. Velocity is not just speed—it's an engineering symphony.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-start gap-4 pt-2"
          >
            <MagneticButton
              variant="primary"
              onClick={onExploreCars}
              className="py-3.5 px-8 text-xs font-bold tracking-[0.2em] uppercase rounded-sm hover:scale-105 transition-transform"
            >
              Explore Fleet
            </MagneticButton>

            <MagneticButton
              variant="glass"
              onClick={onOpenTestDrive}
              className="py-3.5 px-8 text-xs font-bold tracking-[0.2em] uppercase rounded-sm backdrop-blur-md hover:bg-white/10 transition-all border border-white/20"
            >
              Book Test Drive
            </MagneticButton>
          </motion.div>

          {/* Integrated Animated Car Telemetry & Navigation Ticker (No bulky card box) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="pt-4 w-full"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 max-w-2xl">
              {/* Car Live Status */}
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A1F] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5A1F]" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#FF5A1F]">
                      0{currentCarIndex + 1} / 0{CARS_DATA.length}
                    </span>
                    <span className="text-xs font-black font-display uppercase tracking-wider text-white">
                      {activeCar.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/10 text-gray-300 uppercase">
                      {activeCar.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-[#FF5A1F]" /> {activeCar.acceleration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Gauge className="w-2.5 h-2.5 text-[#FF5A1F]" /> {activeCar.topSpeed}
                    </span>
                    <span>•</span>
                    <span className="text-[#FF5A1F] font-bold">{activeCar.power}</span>
                  </div>
                </div>
              </div>

              {/* Progress and controls */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="w-16 bg-white/15 h-1 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="bg-gradient-to-r from-[#FF5A1F] to-[#FFA726] h-full transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* 7 Car Quick Switch Dots */}
                <div className="flex items-center gap-1.5">
                  {CARS_DATA.map((car, idx) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => goToCar(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentCarIndex
                          ? 'w-6 bg-[#FF5A1F] glow-orange'
                          : 'w-2 bg-white/20 hover:bg-white/50'
                      }`}
                      title={car.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 border-l border-white/15 pl-2">
                  <button
                    type="button"
                    onClick={goToPrevCar}
                    className="p-1 rounded-full bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                    title="Previous Car"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNextCar}
                    className="p-1 rounded-full bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                    title="Next Car"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Scroll Indicator - Centered per user focus request */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="pt-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer w-full mx-auto self-center"
            onClick={onExploreCars}
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-mono text-center">
              Scroll to Discover Fleet
            </span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-[#FF5A1F] to-transparent glow-orange mx-auto" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
