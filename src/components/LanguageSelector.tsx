import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SupportedLanguage, LANGUAGES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
}) => {
  const { language, setLanguage, currentLanguageInfo, t } = useLanguage();
  const { isSunset } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer select-none ${
          isSunset
            ? 'bg-[#1a0e07]/85 border-[#FFAA33]/40 text-[#FFCC80] hover:border-[#FFAA33] shadow-[0_0_12px_rgba(255,170,51,0.2)]'
            : 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10'
        }`}
        aria-label={t('lang.selectLanguage', 'Select Language')}
        title={`${t('lang.language', 'Language')}: ${currentLanguageInfo.nativeName} (${currentLanguageInfo.code.toUpperCase()})`}
      >
        <span className="text-sm leading-none">{currentLanguageInfo.flag}</span>
        <Globe className={`w-3.5 h-3.5 ${isSunset ? 'text-[#FFAA33]' : 'text-[#00E5FF]'}`} />
        {!compact && (
          <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
            {currentLanguageInfo.code.toUpperCase()}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-white/50 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute right-0 mt-2 w-48 sm:w-52 rounded-2xl border p-2 backdrop-blur-2xl z-50 shadow-2xl ${
              isSunset
                ? 'bg-[#160b05]/95 border-[#FFAA33]/40 shadow-[0_12px_36px_rgba(0,0,0,0.9),0_0_24px_rgba(255,170,51,0.18)]'
                : 'bg-black/90 border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.9),0_0_20px_rgba(0,229,255,0.12)]'
            }`}
          >
            <div className="px-2.5 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
              <span className={`text-[9px] font-mono uppercase tracking-widest font-bold ${isSunset ? 'text-[#FFAA33]' : 'text-[#00E5FF]'}`}>
                {t('lang.selectLanguage', 'Select Language')}
              </span>
              <span className="text-[9px] font-mono text-white/40">7 REGIONS</span>
            </div>

            <div className="space-y-1">
              {LANGUAGES.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? isSunset
                          ? 'bg-[#FFAA33]/20 text-[#FFAA33] border border-[#FFAA33]/50 font-bold'
                          : 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 font-bold'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <div className="text-left">
                        <span className="block text-xs font-medium text-white">
                          {item.nativeName}
                        </span>
                        <span className="block text-[9px] text-white/50 uppercase">
                          {item.name} ({item.code.toUpperCase()})
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${isSunset ? 'text-[#FFAA33]' : 'text-[#00E5FF]'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
