import React, { useState, useEffect } from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';
import { GlobalPresenceMap } from '../components/GlobalPresenceMap';
import { GlobalFacility } from '../data/globalPresence';
import { Globe, Plane, ShieldCheck, Clock, MapPin, Zap, Compass, Truck } from 'lucide-react';

interface GlobalPresenceSectionProps {
  onOpenTestDrive?: (carId?: string) => void;
  onOpenDelivery?: () => void;
}

export const GlobalPresenceSection: React.FC<GlobalPresenceSectionProps> = ({
  onOpenTestDrive,
  onOpenDelivery,
}) => {
  // Global flight clocks (Tokyo, London, New York, Dubai, UTC)
  const [times, setTimes] = useState<{ [city: string]: string }>({});

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const formatTime = (tz: string) =>
        now.toLocaleTimeString('en-US', {
          timeZone: tz,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

      setTimes({
        Tokyo: formatTime('Asia/Tokyo'),
        London: formatTime('Europe/London'),
        Dubai: formatTime('Asia/Dubai'),
        NewYork: formatTime('America/New_York'),
        UTC: formatTime('UTC'),
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBookFacilityVisit = (facility: GlobalFacility) => {
    onOpenTestDrive?.();
  };

  return (
    <section id="global" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll Parallax Background */}
      <ParallaxSectionBackground glowColor="cyan" accentText="GLOBAL" speed={-0.14} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center">
          <SectionHeading
            eyebrow="GLOBAL FOOTPRINT & INFRASTRUCTURE"
            title="WORLDWIDE APEX"
            highlightText="PRESENCE"
            subtitle="Explore our international ecosystem of bespoke commissioning ateliers, skunkworks precision service centers, and FIA-grade proving grounds across Europe, the Americas, Asia, and the Middle East."
            centered
          />

          {/* Real-time Global Flight Clocks Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-full glass-panel border border-white/10 text-xs font-mono">
            <span className="text-[#00E5FF] font-bold flex items-center gap-1.5 px-2">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              <span>SYNCED CLOCKS:</span>
            </span>
            <div className="flex items-center gap-4 text-white/80">
              <div>
                <span className="text-white/40 text-[10px] mr-1.5">TYO</span>
                <span className="text-white font-bold">{times.Tokyo || '--:--:--'}</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] mr-1.5">DXB</span>
                <span className="text-white font-bold">{times.Dubai || '--:--:--'}</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] mr-1.5">LON</span>
                <span className="text-white font-bold">{times.London || '--:--:--'}</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] mr-1.5">NYC</span>
                <span className="text-white font-bold">{times.NewYork || '--:--:--'}</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] mr-1.5">UTC</span>
                <span className="text-[#FF5A1F] font-bold">{times.UTC || '--:--:--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Key Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 hover:border-[#00E5FF]/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl sm:text-3xl font-black font-display text-white group-hover:text-[#00E5FF] transition-colors">
                19
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/15 flex items-center justify-center text-[#00E5FF]">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs font-mono uppercase text-white/80 font-bold block">
              Global Facilities
            </span>
            <span className="text-[11px] font-mono text-white/40 mt-1 block">
              Across 12 sovereign nations & financial capitals
            </span>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 hover:border-[#FF5A1F]/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl sm:text-3xl font-black font-display text-white group-hover:text-[#FF5A1F] transition-colors">
                5
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FF5A1F]/15 flex items-center justify-center text-[#FF5A1F]">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs font-mono uppercase text-white/80 font-bold block">
              Official Proving Tracks
            </span>
            <span className="text-[11px] font-mono text-white/40 mt-1 block">
              Nürburgring, Spa, Mojave Desert, Fuji, Yas Marina
            </span>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 hover:border-emerald-400/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl sm:text-3xl font-black font-display text-white group-hover:text-emerald-400 transition-colors">
                &lt; 4h
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Plane className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs font-mono uppercase text-white/80 font-bold block">
              Flying Doctor Response
            </span>
            <span className="text-[11px] font-mono text-white/40 mt-1 block">
              Air-freight master technicians deployed worldwide
            </span>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl sm:text-3xl font-black font-display text-white group-hover:text-amber-400 transition-colors">
                100%
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs font-mono uppercase text-white/80 font-bold block">
              Monitored Telemetry
            </span>
            <span className="text-[11px] font-mono text-white/40 mt-1 block">
              Satellite-linked powertrain and battery health
            </span>
          </div>
        </div>

        {/* Interactive D3 World Map Visualization */}
        <GlobalPresenceMap
          onBookAppointment={handleBookFacilityVisit}
        />

        {/* Global Distribution & Delivery Options CTA Banner */}
        {onOpenDelivery && (
          <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-black/80 via-[#FF5A1F]/10 to-black/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 flex items-center justify-center text-[#FF5A1F] shrink-0 shadow-[0_0_15px_rgba(255,90,31,0.3)]">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold font-display uppercase text-white">
                  Apex Global Delivery & Shipping Timelines
                </h4>
                <p className="text-xs text-white/60 mt-0.5">
                  Calculate real-time shipping options and door-to-door transit hours from our nearest distribution center to your coordinates.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenDelivery}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF3B00] text-black font-mono text-xs uppercase font-extrabold tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-lg flex items-center gap-2 whitespace-nowrap glow-orange"
            >
              <Truck className="w-4 h-4" />
              <span>Calculate Shipping Options</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
