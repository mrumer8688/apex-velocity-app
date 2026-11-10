import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette,
  Sparkles,
  Check,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Pipette,
  Layers,
} from 'lucide-react';
import { PaintType } from '../types/configurator';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../utils/haptics';

export interface BespokeColorOption {
  name: string;
  hex: string;
  recommendedFinish: PaintType;
  category: 'Heritage' | 'Exotic' | 'Stealth' | 'Track';
}

export const BESPOKE_COLOR_PALETTE: BespokeColorOption[] = [
  { name: 'Apex Crimson', hex: '#D61C1C', recommendedFinish: 'metallic', category: 'Heritage' },
  { name: 'Cyber Cyan', hex: '#00E5FF', recommendedFinish: 'pearl', category: 'Exotic' },
  { name: 'Solaris Gold', hex: '#EAB308', recommendedFinish: 'metallic', category: 'Exotic' },
  { name: 'Monaco Amethyst', hex: '#7C3AED', recommendedFinish: 'pearl', category: 'Exotic' },
  { name: 'Verde Mantis', hex: '#10B981', recommendedFinish: 'pearl', category: 'Track' },
  { name: 'Obsidian Nero', hex: '#141416', recommendedFinish: 'carbon', category: 'Stealth' },
  { name: 'Liquid Sterling', hex: '#E2E8F0', recommendedFinish: 'chrome', category: 'Heritage' },
  { name: 'Gulf Heritage Blue', hex: '#38BDF8', recommendedFinish: 'metallic', category: 'Heritage' },
  { name: 'Rosso Corsa', hex: '#EF4444', recommendedFinish: 'gloss', category: 'Heritage' },
  { name: 'Frozen Pearl White', hex: '#F8FAFC', recommendedFinish: 'frozen', category: 'Exotic' },
  { name: 'British Racing Emerald', hex: '#065F46', recommendedFinish: 'metallic', category: 'Track' },
  { name: 'Electrum Rose Gold', hex: '#FB7185', recommendedFinish: 'metallic', category: 'Exotic' },
  { name: 'Stealth Satin Grey', hex: '#4B5563', recommendedFinish: 'matte', category: 'Stealth' },
  { name: 'Miami Neon Violet', hex: '#D946EF', recommendedFinish: 'pearl', category: 'Exotic' },
  { name: 'Papaya Racing Flame', hex: '#FF5A1F', recommendedFinish: 'metallic', category: 'Track' },
];

export const PAINT_FINISH_TYPES: { id: PaintType; nameKey: string; desc: string }[] = [
  { id: 'metallic', nameKey: 'ar.metallic', desc: 'Specular Flake & High Lustre' },
  { id: 'matte', nameKey: 'ar.matte', desc: 'Velvet Satin Non-Reflective' },
  { id: 'pearl', nameKey: 'ar.pearl', desc: 'Multi-Tone Iridescent Shift' },
  { id: 'chrome', nameKey: 'ar.chrome', desc: 'Mirror-Polished Liquid Metal' },
  { id: 'carbon', nameKey: 'ar.carbon', desc: 'Woven Carbon Fiber Weave' },
  { id: 'frozen', nameKey: 'ar.frozen', desc: 'Icy Frosted Soft Reflections' },
];

interface ARColorPickerDrawerProps {
  currentColor: string;
  currentFinish: PaintType;
  clearcoat?: number;
  roughness?: number;
  onColorChange: (color: string, finish: PaintType, clearcoat?: number, roughness?: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ARColorPickerDrawer: React.FC<ARColorPickerDrawerProps> = ({
  currentColor,
  currentFinish,
  clearcoat = 0.9,
  roughness = 0.15,
  onColorChange,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const { isSunset } = useTheme();

  const [customHex, setCustomHex] = useState(currentColor);
  const [selectedFinish, setSelectedFinish] = useState<PaintType>(currentFinish);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [showAdvancedSliders, setShowAdvancedSliders] = useState(false);
  const [sliderClearcoat, setSliderClearcoat] = useState(clearcoat);
  const [sliderRoughness, setSliderRoughness] = useState(roughness);

  const handleApplyColor = (color: string, finish: PaintType = selectedFinish) => {
    setCustomHex(color);
    setSelectedFinish(finish);
    onColorChange(color, finish, sliderClearcoat, sliderRoughness);
    triggerHaptic('selection');
  };

  const handleFinishChange = (finish: PaintType) => {
    setSelectedFinish(finish);
    onColorChange(customHex, finish, sliderClearcoat, sliderRoughness);
    triggerHaptic('light');
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onColorChange(val, selectedFinish, sliderClearcoat, sliderRoughness);
      triggerHaptic('light');
    }
  };

  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHex(val);
    onColorChange(val, selectedFinish, sliderClearcoat, sliderRoughness);
  };

  const handleClearcoatSlider = (val: number) => {
    setSliderClearcoat(val);
    onColorChange(customHex, selectedFinish, val, sliderRoughness);
  };

  const handleRoughnessSlider = (val: number) => {
    setSliderRoughness(val);
    onColorChange(customHex, selectedFinish, sliderClearcoat, val);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className={`pointer-events-auto fixed bottom-24 sm:bottom-28 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[420px] max-h-[72vh] rounded-3xl border backdrop-blur-2xl p-4 sm:p-5 z-30 shadow-2xl flex flex-col overflow-hidden ${
            isSunset
              ? 'bg-[#150a04]/95 border-[#FFAA33]/40 shadow-[0_12px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(255,170,51,0.2)]'
              : 'bg-black/95 border-white/20 shadow-[0_12px_45px_rgba(0,0,0,0.95),0_0_25px_rgba(0,229,255,0.15)]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <h3 className="text-xs font-display font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Palette className={`w-3.5 h-3.5 ${isSunset ? 'text-[#FFAA33]' : 'text-[#00E5FF]'}`} />
                  <span>{t('ar.colorFinishLab', 'Apex Bespoke Color Lab')}</span>
                </h3>
                <span className="text-[9px] font-mono text-white/50 block">
                  {currentFinish.toUpperCase()} FINISH • {currentColor.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Close Color Lab"
              aria-label="Close Color Lab"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 scrollbar-thin">
            {/* 1. Paint Finish Type Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 flex items-center gap-1">
                  <Layers className={`w-3 h-3 ${isSunset ? 'text-[#FFAA33]' : 'text-[#00E5FF]'}`} />
                  <span>{t('ar.finishType', 'Finish Type')}</span>
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase ${isSunset ? 'text-[#FFAA33]' : 'text-[#00E5FF]'}`}>
                  {selectedFinish}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {PAINT_FINISH_TYPES.map((finish) => {
                  const isActive = selectedFinish === finish.id;
                  return (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => handleFinishChange(finish.id)}
                      className={`px-2.5 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                        isActive
                          ? isSunset
                            ? 'bg-[#FFAA33]/20 border-[#FFAA33] text-[#FFAA33] font-bold shadow-[0_0_12px_rgba(255,170,51,0.3)]'
                            : 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20'
                      }`}
                      title={finish.desc}
                    >
                      <span className="truncate w-full text-center">
                        {t(finish.nameKey, finish.id)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Selection: Presets vs Custom Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
                  {activeTab === 'presets'
                    ? t('ar.presetBespoke', 'Curated Bespoke Shades')
                    : t('ar.customColor', 'Custom Hex / Palette')}
                </span>

                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('presets')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors cursor-pointer ${
                      activeTab === 'presets'
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Bespoke
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors cursor-pointer ${
                      activeTab === 'custom'
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {activeTab === 'presets' ? (
                /* Curated Hypercar Swatch Grid */
                <div className="grid grid-cols-5 gap-2">
                  {BESPOKE_COLOR_PALETTE.map((item) => {
                    const isSelected = currentColor.toLowerCase() === item.hex.toLowerCase();
                    return (
                      <button
                        key={item.hex}
                        type="button"
                        onClick={() => handleApplyColor(item.hex, item.recommendedFinish)}
                        className={`group relative aspect-square rounded-2xl border-2 transition-transform duration-200 cursor-pointer flex items-center justify-center shadow-md ${
                          isSelected
                            ? isSunset
                              ? 'border-[#FFAA33] scale-105 shadow-[0_0_12px_#FFAA33]'
                              : 'border-[#00E5FF] scale-105 shadow-[0_0_12px_#00E5FF]'
                            : 'border-white/20 hover:scale-105 hover:border-white/50'
                        }`}
                        style={{ backgroundColor: item.hex }}
                        title={`${item.name} (${item.recommendedFinish})`}
                      >
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Dynamic Custom Hex Color Picker */
                <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Live Native Color Eye-dropper preview */}
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 shrink-0 shadow-lg cursor-pointer">
                      <input
                        type="color"
                        value={customHex.startsWith('#') && customHex.length === 7 ? customHex : '#D61C1C'}
                        onChange={handleNativeColorInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Click to open color spectrum"
                      />
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: customHex }}
                      >
                        <Pipette className="w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none" />
                      </div>
                    </div>

                    {/* Hex Text Input */}
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-mono text-white/50 uppercase block">
                        Hex Code Input:
                      </label>
                      <div className="flex items-center gap-1.5 bg-black/50 border border-white/15 rounded-xl px-2.5 py-1.5 focus-within:border-[#00E5FF]">
                        <span className="text-xs font-mono text-white/40">#</span>
                        <input
                          type="text"
                          value={customHex.replace('#', '')}
                          onChange={(e) => handleHexInputChange({ ...e, target: { ...e.target, value: `#${e.target.value}` } } as any)}
                          maxLength={6}
                          className="w-full bg-transparent text-xs font-mono font-bold text-white uppercase focus:outline-none"
                          placeholder="RRGGBB"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Spectrum Quick Sliders */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-white/40 uppercase block">Spectrum Quick Strip</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {['#FF0033', '#FF6600', '#FFCC00', '#33CC33', '#00CCCC', '#0066FF', '#7F00FF', '#FF007F', '#FFFFFF', '#111111'].map((quickHex) => (
                        <button
                          key={quickHex}
                          type="button"
                          onClick={() => handleApplyColor(quickHex)}
                          className="w-6 h-6 rounded-lg border border-white/20 shrink-0 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: quickHex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Advanced Specular & Surface Finish Sliders */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAdvancedSliders((v) => !v)}
                className="w-full flex items-center justify-between text-[10px] font-mono uppercase text-white/60 hover:text-white transition-colors cursor-pointer py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3 h-3" />
                  <span>{t('ar.clearcoat', 'Specular & Roughness Precision')}</span>
                </span>
                {showAdvancedSliders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <AnimatePresence>
                {showAdvancedSliders && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3 pt-2"
                  >
                    {/* Clearcoat Slider */}
                    <div>
                      <div className="flex justify-between text-[9px] font-mono text-white/60 mb-1">
                        <span>{t('ar.clearcoat', 'Clearcoat Specular')}</span>
                        <span className="font-bold text-white">{Math.round(sliderClearcoat * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={sliderClearcoat}
                        onChange={(e) => handleClearcoatSlider(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF5A1F]"
                      />
                    </div>

                    {/* Roughness Slider */}
                    <div>
                      <div className="flex justify-between text-[9px] font-mono text-white/60 mb-1">
                        <span>{t('ar.roughness', 'Surface Roughness')}</span>
                        <span className="font-bold text-white">{Math.round(sliderRoughness * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.85"
                        step="0.03"
                        value={sliderRoughness}
                        onChange={(e) => handleRoughnessSlider(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Preset Color Label Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-white/50 shrink-0">
            <span>REAL-TIME SHADER COMPUTE</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE 3D ACTIVE
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
