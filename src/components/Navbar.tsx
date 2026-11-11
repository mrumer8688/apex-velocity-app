import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, Search, Scale, Scan, ArrowRight, Truck, Gauge } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { GlobalSearchModal } from './GlobalSearchModal';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CarModel } from '../types';

interface NavbarProps {
  onOpenTestDrive: () => void;
  onSelectCar?: (car: CarModel) => void;
  onOpenCompare?: () => void;
  onOpenAR?: () => void;
  onOpenDelivery?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTestDrive,
  onSelectCar,
  onOpenCompare,
  onOpenAR,
  onOpenDelivery,
}) => {
  const { isSunset } = useTheme();
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { name: t('nav.home', 'Home'), href: '#hero', id: 'hero' },
    { name: t('nav.about', 'About'), href: '#about', id: 'about' },
    { name: t('nav.fleet', 'Fleet'), href: '#cars', id: 'cars' },
    { name: t('nav.experience', 'Experience'), href: '#experience', id: 'experience' },
    { name: t('nav.film', 'Cinema'), href: '#film', id: 'film' },
    { name: t('nav.global', 'Global'), href: '#global', id: 'global' },
    { name: t('nav.pulse', 'Pulse'), href: '#pulse', id: 'pulse' },
    { name: t('nav.contact', 'Contact'), href: '#contact', id: 'contact' },
  ];

  // Active section tracked via scroll spy
  const activeSection = useScrollSpy(
    navLinks.map((l) => l.id),
    160
  );

  // Scroll listener that tracks scroll depth for dynamic glassmorphic blur and shadow intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on Escape key or resize to desktop if desired
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const yOffset = -75;
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
    }
  };

  // Compute dynamic glassmorphic parameters based on scroll depth
  const blurPx = Math.min(36, Math.max(8, 8 + (scrollY / 250) * 28)); // Smooth blur from 8px up to 36px
  const bgAlpha = Math.min(0.94, 0.35 + (scrollY / 250) * 0.59); // From translucent 0.35 to obsidian 0.94
  const borderAlpha = Math.min(0.2, 0.07 + (scrollY / 250) * 0.13); // From 0.07 to 0.20
  const shadowSpread = Math.min(45, 15 + (scrollY / 250) * 30);
  const shadowAlpha = Math.min(0.75, 0.35 + (scrollY / 250) * 0.4);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out select-none"
        style={{
          backdropFilter: `blur(${blurPx}px)`,
          WebkitBackdropFilter: `blur(${blurPx}px)`,
          backgroundColor: `rgba(5, 5, 5, ${bgAlpha})`,
          borderBottom: `1px solid rgba(255, 255, 255, ${borderAlpha})`,
          boxShadow: `0 12px ${shadowSpread}px -8px rgba(0, 0, 0, ${shadowAlpha}), 0 1px 0 rgba(255, 255, 255, ${borderAlpha * 0.5})`,
          paddingTop: scrollY > 40 ? '0.75rem' : '1.25rem',
          paddingBottom: scrollY > 40 ? '0.75rem' : '1.25rem',
        }}
      >
        {/* Full-width container with guaranteed safe margins and flex alignment */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 min-w-0">
          {/* Brand Logo - Futuristic Wordmark */}
          <div className="flex items-center shrink-0">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, '#hero')}
              className="flex items-center group shrink-0 focus:outline-none cursor-pointer"
              aria-label="Apex Motors Home"
            >
              <div className="flex flex-col py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-orbitron font-black tracking-[0.22em] text-lg sm:text-2xl uppercase bg-gradient-to-r from-white via-zinc-100 to-[#FF5A1F] bg-clip-text text-transparent group-hover:drop-shadow-[0_0_16px_rgba(255,90,31,0.5)] transition-all duration-300 leading-none">
                    APEX
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F] animate-pulse" />
                </div>
                <span className="font-orbitron font-bold tracking-[0.38em] text-[8px] sm:text-[9.5px] uppercase text-[#FF5A1F] mt-1 group-hover:text-white transition-colors duration-300 leading-none">
                  VELOCITY
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Nav Links - All 8 links permanently visible without any being hidden */}
          <nav className="hidden md:flex items-center justify-center gap-0.5 xl:gap-1 px-2.5 xl:px-3.5 py-1 rounded-full glass-panel border border-white/10 backdrop-blur-md shrink-0 shadow-lg mx-auto">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-2 xl:px-2.5 py-1 text-[10px] xl:text-[11px] font-mono uppercase tracking-wider rounded-full transition-all duration-300 group/navlink cursor-pointer whitespace-nowrap inline-flex items-center ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {/* Active glass pill indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-full bg-[#FF5A1F]/15 border border-[#FF5A1F]/35 shadow-[0_0_12px_rgba(255,90,31,0.2)] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1 xl:gap-1.5">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shadow-[0_0_6px_#FF5A1F] animate-pulse" />
                    )}
                    <span>{link.name}</span>
                  </span>

                  {/* Active underline indicator with glowing shadow */}
                  {isActive ? (
                    <motion.span
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF5A1F] rounded-full shadow-[0_0_8px_#FF5A1F]"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  ) : (
                    /* Subtle primary accent underline animation on hover */
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF5A1F] rounded-full scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 ease-out origin-center pointer-events-none" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Controls: Equipped with intuitive icons and full functionality */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto min-w-0 pr-1">
            {/* 1. Global Fleet Search Trigger with Search Icon & Keyboard Shortcut */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-2 rounded-full transition-all duration-300 border text-xs font-mono tracking-wider cursor-pointer bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-[#FF5A1F]/50 hover:bg-[#FF5A1F]/10 group shrink-0"
              aria-label="Search fleet and technology"
              title="Search fleet & technology (⌘K)"
            >
              <Search className="w-4 h-4 text-[#FF5A1F] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium hidden 2xl:inline text-white/70 group-hover:text-white">
                Search
              </span>
              <kbd className="hidden 2xl:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-white/60 border border-white/15">
                ⌘K
              </kbd>
            </button>

            {/* 2. Ambient Lighting Theme Toggle with Sun/Moon Icons & Real-Time Mood Switching */}
            <ThemeToggle compact className="shrink-0" />

            {/* 3. Multi-Language Selector with Globe & Country Flags */}
            <LanguageSelector compact className="hidden sm:inline-block shrink-0" />

            {/* 4. Head-to-Head Compare Modal Trigger with Scale Icon */}
            {onOpenCompare && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-2 rounded-full transition-all duration-300 border text-xs font-mono tracking-wider cursor-pointer bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-[#FF5A1F]/50 hover:bg-[#FF5A1F]/10 group shrink-0"
                aria-label={t('nav.compare', 'Compare Hypercars')}
                title={t('nav.compare', 'Compare Hypercars Side-by-Side')}
              >
                <Scale className="w-4 h-4 text-[#FF5A1F] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium hidden 2xl:inline text-white/70 group-hover:text-white">
                  {t('nav.compare', 'Compare')}
                </span>
              </button>
            )}


            {/* 6. Primary Action Button: VIP Test Drive with Tachometer/Gauge Icon & Modal Booking */}
            <MagneticButton
              variant="primary"
              onClick={onOpenTestDrive}
              className="hidden sm:inline-flex py-2 px-3.5 sm:px-4 lg:px-5 text-xs font-semibold tracking-wider whitespace-nowrap shrink-0 shadow-md group cursor-pointer"
              title="Book VIP Track & Road Test Drive"
              aria-label="Book VIP Test Drive"
            >
              <Gauge className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300 shrink-0" />
              <span>{t('nav.testDrive', 'Test Drive')}</span>
            </MagneticButton>

            {/* 7. Compact Mobile Test Drive Button with Gauge Icon */}
            <button
              type="button"
              onClick={onOpenTestDrive}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF3B00] text-black font-mono text-[11px] uppercase font-bold tracking-wider hover:brightness-110 transition-all glow-orange whitespace-nowrap shrink-0 cursor-pointer"
              title="Book VIP Test Drive"
              aria-label="Book VIP Test Drive"
            >
              <Gauge className="w-3.5 h-3.5 text-black shrink-0" />
              <span>{t('nav.testDrive', 'Drive')}</span>
            </button>

            {/* 8. Mobile-Only Menu Button with Animated Icon & Full Telemetry Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 sm:p-2.5 rounded-xl glass-panel border border-white/15 text-white hover:text-[#FF5A1F] hover:border-[#FF5A1F]/50 transition-all focus:outline-none cursor-pointer flex items-center justify-center group shrink-0"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              title="Menu & Concierge"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#FF5A1F]" />
              ) : (
                <Menu className="w-5 h-5 text-white group-hover:text-[#FF5A1F] transition-colors" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Luxury Drawer Menu (Opens for Mobile & Tablet when Hamburger is clicked) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex justify-end"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md sm:max-w-lg h-full bg-[#08080a] border-l border-white/15 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-black tracking-[0.22em] text-lg text-white uppercase leading-none">
                      APEX
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F] animate-pulse" />
                  </div>
                  <span className="font-orbitron font-bold tracking-[0.32em] text-[9px] text-[#FF5A1F] uppercase mt-1">
                    VELOCITY ATELIER
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-[#FF5A1F]" />
                </button>
              </div>

              {/* Navigation Links with Active Highlighting */}
              <div className="space-y-1.5 sm:space-y-2 py-6">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block mb-2 px-2">
                  Navigation
                </span>
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`flex items-center justify-between text-lg sm:text-xl font-display uppercase tracking-wider py-2.5 px-3.5 rounded-xl transition-all ${
                        isActive
                          ? 'text-[#FF5A1F] font-extrabold bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 shadow-[0_0_15px_rgba(255,90,31,0.15)]'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F] animate-pulse" />
                        )}
                        <span>{link.name}</span>
                      </div>
                      {isActive ? (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 tracking-widest font-semibold">
                          CURRENT
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-white/30" />
                      )}
                    </a>
                  );
                })}
              </div>

              {/* Hypercar Tools & Concierge Cards */}
              <div className="space-y-3 pt-6 border-t border-white/10">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block px-1">
                  Hypercar Suite & Telemetry
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {/* Search Fleet */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 flex flex-col items-center justify-center gap-1.5 transition-colors hover:border-[#FF5A1F]/40 hover:bg-[#FF5A1F]/10 text-center cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-white/80">
                      Search Fleet
                    </span>
                  </button>

                  {/* Compare Hypercars */}
                  {onOpenCompare && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenCompare();
                      }}
                      className="p-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 flex flex-col items-center justify-center gap-1.5 transition-colors hover:border-[#FF5A1F]/40 hover:bg-[#FF5A1F]/10 text-center cursor-pointer"
                    >
                      <Scale className="w-4 h-4 text-[#FF5A1F]" />
                      <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-white/80">
                        Compare Specs
                      </span>
                    </button>
                  )}

                  {/* Launch Camera AR Viewer */}
                  {onOpenAR && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAR();
                      }}
                      className="p-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 flex flex-col items-center justify-center gap-1.5 transition-colors hover:border-[#FF5A1F]/40 hover:bg-[#FF5A1F]/10 text-center cursor-pointer"
                    >
                      <Scan className="w-4 h-4 text-[#FF5A1F]" />
                      <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-white/80">
                        AR Camera
                      </span>
                    </button>
                  )}

                  {/* Delivery Options & Shipping Calculator */}
                  {onOpenDelivery && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDelivery();
                      }}
                      className="p-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 flex flex-col items-center justify-center gap-1.5 transition-colors hover:border-[#FF5A1F]/40 hover:bg-[#FF5A1F]/10 text-center cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-[#FF5A1F]" />
                      <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-white/80">
                        Delivery Calc
                      </span>
                    </button>
                  )}
                </div>

                {/* Ambient Lighting Mood Control */}
                <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 space-y-2 mt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/50 block">
                      Ambient Lighting Mood
                    </span>
                    <span className={`text-[10px] font-mono uppercase font-bold ${isSunset ? 'text-[#FFAA33]' : 'text-[#FF5A1F]'}`}>
                      {isSunset ? 'Sunset (Golden Hour)' : 'Midnight (Dark)'}
                    </span>
                  </div>
                  <ThemeToggle className="w-full justify-center" />
                </div>

                {/* Multi-Language Selection in Mobile Drawer */}
                <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">
                      {t('lang.language', 'Language')}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      7 Global Regions
                    </span>
                  </div>
                  <LanguageSelector />
                </div>

                {/* VIP Test Drive Primary CTA */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTestDrive();
                  }}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#FF5A1F] via-[#FF3B00] to-[#E03000] text-black font-mono text-xs uppercase font-extrabold tracking-widest glow-orange shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer mt-3"
                >
                  <span>Book VIP Test Drive Experience</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-Time Global Fleet & Technology Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCar={(car) => onSelectCar?.(car)}
        onOpenTestDrive={onOpenTestDrive}
      />
    </>
  );
};
