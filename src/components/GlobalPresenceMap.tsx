import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  MapPin,
  Building2,
  Wrench,
  Flag,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Phone,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { GlobalFacility, GLOBAL_FACILITIES, FacilityType } from '../data/globalPresence';
import { MagneticButton } from './MagneticButton';

interface GlobalPresenceMapProps {
  onSelectFacility?: (facility: GlobalFacility) => void;
  onBookAppointment?: (facility: GlobalFacility) => void;
}

export const GlobalPresenceMap: React.FC<GlobalPresenceMapProps> = ({
  onSelectFacility,
  onBookAppointment,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [geoData, setGeoData] = useState<d3.GeoPermissibleObjects | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<GlobalFacility>(GLOBAL_FACILITIES[0]);
  const [hoveredFacility, setHoveredFacility] = useState<GlobalFacility | null>(null);
  const [filterType, setFilterType] = useState<'all' | FacilityType>('all');
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Filtered facilities based on active category
  const filteredFacilities = useMemo(() => {
    if (filterType === 'all') return GLOBAL_FACILITIES;
    return GLOBAL_FACILITIES.filter((f) => f.type === filterType);
  }, [filterType]);

  // Width and height of SVG viewport
  const width = 960;
  const height = 500;

  // D3 Projection and Path Generator
  const projection = useMemo(() => {
    return d3
      .geoNaturalEarth1()
      .scale(158)
      .translate([width / 2, height / 2 + 15]);
  }, [width, height]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Load GeoJSON data on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/data/world.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load world map');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setGeoData(data);
          setIsMapReady(true);
        }
      })
      .catch((err) => {
        console.warn('World map GeoJSON load error, fallback will display grid:', err);
        setIsMapReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Zoom behavior setup
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('#map-content-group');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;
  }, [isMapReady]);

  // Smooth zoom to selected facility
  const zoomToFacility = (facility: GlobalFacility) => {
    setSelectedFacility(facility);
    onSelectFacility?.(facility);

    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const [x, y] = projection(facility.coordinates) || [width / 2, height / 2];

    const svg = d3.select(svgRef.current);
    const targetScale = 3.8;

    svg
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(targetScale)
          .translate(-x, -y)
      );
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.4);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 0.7);
  };

  // Color helper based on facility category
  const getTypeColor = (type: FacilityType) => {
    switch (type) {
      case 'showroom':
        return '#FF5A1F'; // Apex Orange
      case 'service':
        return '#00E5FF'; // Tech Cyan
      case 'track':
        return '#10B981'; // Racing Emerald
    }
  };

  const getTypeLabel = (type: FacilityType) => {
    switch (type) {
      case 'showroom':
        return 'Atelier Showroom';
      case 'service':
        return 'Precision Skunkworks';
      case 'track':
        return 'Proving Grounds';
    }
  };

  const getTypeIcon = (type: FacilityType) => {
    switch (type) {
      case 'showroom':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'service':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'track':
        return <Flag className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Filter and Telemetry Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
            <Navigation className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                // D3.JS REAL-TIME GLOBAL TELEMETRY
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-wider text-white">
              Worldwide Network Architecture
            </h3>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                : 'glass-panel text-white/70 hover:text-white border border-white/10'
            }`}
          >
            All Facilities (19)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('showroom')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              filterType === 'showroom'
                ? 'bg-[#FF5A1F] text-white font-bold shadow-[0_0_15px_rgba(255,90,31,0.5)]'
                : 'glass-panel text-white/70 hover:text-[#FF5A1F] border border-white/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
            <span>Showrooms (8)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('service')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              filterType === 'service'
                ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.5)]'
                : 'glass-panel text-white/70 hover:text-[#00E5FF] border border-white/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
            <span>Service Hubs (6)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('track')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              filterType === 'track'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'glass-panel text-white/70 hover:text-emerald-400 border border-white/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Proving Tracks (5)</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Stage */}
      <div
        ref={containerRef}
        className="relative w-full rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#0a0a0d] to-[#040406] shadow-2xl group"
      >
        {/* Subtle Map Ambient Watermark */}
        <div className="absolute top-4 left-5 pointer-events-none z-10 flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
          <span>PROJECTION: NATURAL EARTH I // INTERACTIVE VECTOR ENGINE</span>
        </div>

        {/* Map Floating Zoom & Reset Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 rounded-xl glass-panel border border-white/15 text-white hover:text-[#FF5A1F] hover:border-[#FF5A1F]/50 transition-all cursor-pointer shadow-lg"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 rounded-xl glass-panel border border-white/15 text-white hover:text-[#FF5A1F] hover:border-[#FF5A1F]/50 transition-all cursor-pointer shadow-lg"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2.5 rounded-xl glass-panel border border-white/15 text-white hover:text-[#FF5A1F] hover:border-[#FF5A1F]/50 transition-all cursor-pointer shadow-lg"
            title="Reset Worldwide View"
            aria-label="Reset world view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* SVG Visualization Canvas */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto aspect-[16/9] cursor-grab active:cursor-grabbing select-none"
        >
          <defs>
            {/* Glow filters for interactive pins */}
            <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Ocean futuristic subtle gradient */}
            <radialGradient id="ocean-glow" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#0d0e14" />
              <stop offset="100%" stopColor="#040407" />
            </radialGradient>
          </defs>

          {/* Oceanic background plane */}
          <rect width={width} height={height} fill="url(#ocean-glow)" />

          {/* Map Group Container (Transformed via D3 Zoom) */}
          <g id="map-content-group">
            {/* Graticule Latitude/Longitude Grid Lines */}
            <path
              d={pathGenerator(d3.geoGraticule10()) || ''}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="0.75"
              strokeDasharray="2 3"
            />

            {/* Equator & Prime Meridian subtle accent line */}
            <path
              d={pathGenerator(d3.geoGraticule().step([90, 90])()) || ''}
              fill="none"
              stroke="rgba(255, 90, 31, 0.08)"
              strokeWidth="1"
            />

            {/* Countries GeoJSON Polygons */}
            {geoData && (
              <g className="countries-layer">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(geoData as any).features?.map((feature: any, i: number) => {
                  const d = pathGenerator(feature);
                  if (!d) return null;
                  return (
                    <path
                      key={feature.id || i}
                      d={d}
                      fill="#121318"
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth="0.6"
                      className="transition-colors duration-200 hover:fill-[#1b1c24]"
                    />
                  );
                })}
              </g>
            )}

            {/* Flight Connecting Arcs between apex headquarters and selected facility */}
            {selectedFacility && (
              <g className="flight-arcs">
                {(() => {
                  const hqCoords: [number, number] = [10.9257, 44.6471]; // Modena Headquarters
                  const start = projection(hqCoords);
                  const end = projection(selectedFacility.coordinates);
                  if (!start || !end) return null;

                  // Curvature for trajectory line
                  const dx = end[0] - start[0];
                  const dy = end[1] - start[1];
                  const dr = Math.sqrt(dx * dx + dy * dy) * 1.25;

                  return (
                    <path
                      d={`M ${start[0]},${start[1]} A ${dr},${dr} 0 0,1 ${end[0]},${end[1]}`}
                      fill="none"
                      stroke="url(#arc-gradient)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="opacity-70 animate-pulse"
                    />
                  );
                })()}
                <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.9" />
                </linearGradient>
              </g>
            )}

            {/* Interactive Facilities Markers */}
            <g className="facilities-layer">
              {filteredFacilities.map((facility) => {
                const pos = projection(facility.coordinates);
                if (!pos) return null;
                const [cx, cy] = pos;

                const isSelected = selectedFacility?.id === facility.id;
                const isHovered = hoveredFacility?.id === facility.id;
                const color = getTypeColor(facility.type);

                return (
                  <g
                    key={facility.id}
                    transform={`translate(${cx}, ${cy})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      zoomToFacility(facility);
                    }}
                    onMouseEnter={() => setHoveredFacility(facility)}
                    onMouseLeave={() => setHoveredFacility(null)}
                  >
                    {/* Animated Pulsating Radar Wave Ring */}
                    <circle
                      r={isSelected ? '14' : isHovered ? '11' : '7'}
                      fill="none"
                      stroke={color}
                      strokeWidth={isSelected ? '1.8' : '1'}
                      className="animate-ping opacity-60 origin-center"
                      style={{ animationDuration: isSelected ? '1.8s' : '3s' }}
                    />

                    {/* Outer halo */}
                    <circle
                      r={isSelected ? '10' : '6.5'}
                      fill={color}
                      fillOpacity={isSelected ? 0.35 : 0.18}
                      stroke={color}
                      strokeWidth={isSelected ? '1.5' : '0.8'}
                    />

                    {/* Core pinpoint center */}
                    <circle
                      r={isSelected ? '4.5' : '3.2'}
                      fill={color}
                      className="transition-transform duration-300"
                    />

                    {/* Target Reticle if Selected */}
                    {isSelected && (
                      <g className="animate-spin" style={{ animationDuration: '18s' }}>
                        <circle
                          r="18"
                          fill="none"
                          stroke={color}
                          strokeWidth="0.8"
                          strokeDasharray="2 4"
                          opacity="0.8"
                        />
                      </g>
                    )}

                    {/* Floating City Label on Hover or Selection */}
                    {(isSelected || isHovered) && (
                      <g transform="translate(0, -18)" className="pointer-events-none">
                        <rect
                          x={-facility.city.length * 4.2 - 10}
                          y="-14"
                          width={facility.city.length * 8.4 + 20}
                          height="20"
                          rx="6"
                          fill="#08080a"
                          stroke={color}
                          strokeWidth="1"
                          opacity="0.95"
                        />
                        <text
                          y="0"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          letterSpacing="0.08em"
                        >
                          {facility.city.toUpperCase()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Bottom Legend Overlay on Map Canvas */}
        <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-card border border-white/10 backdrop-blur-xl bg-black/60">
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]" />
              <span className="text-white/80">Atelier Showrooms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="text-white/80">Skunkworks Service</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              <span className="text-white/80">Proving Tracks</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-white/50 flex items-center gap-2">
            <span>Scroll or drag map to explore</span>
            <span>•</span>
            <span className="text-[#FF5A1F] font-bold">19 Worldwide Hubs</span>
          </div>
        </div>
      </div>

      {/* Quick City Jump Carousel Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-[11px] font-mono uppercase text-white/40 shrink-0 flex items-center gap-1 pl-1">
          <Activity className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <span>Quick Hub Jump:</span>
        </span>
        {GLOBAL_FACILITIES.map((facility) => {
          const isSelected = selectedFacility?.id === facility.id;
          const color = getTypeColor(facility.type);

          return (
            <button
              key={facility.id}
              type="button"
              onClick={() => zoomToFacility(facility)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                  : 'glass-panel text-white/80 hover:text-white border border-white/10 hover:border-white/25'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span>{facility.city}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Facility Inspector Flyout Telemetry Card */}
      {selectedFacility && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/15 bg-black/85 shadow-2xl relative overflow-hidden">
          {/* Accent glow corner */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: getTypeColor(selectedFacility.type) }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Left Column: Facility identity and status */}
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 border"
                  style={{
                    backgroundColor: `${getTypeColor(selectedFacility.type)}20`,
                    borderColor: `${getTypeColor(selectedFacility.type)}50`,
                    color: getTypeColor(selectedFacility.type),
                  }}
                >
                  {getTypeIcon(selectedFacility.type)}
                  <span>{getTypeLabel(selectedFacility.type)}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>

              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold font-display uppercase tracking-wider text-white">
                  {selectedFacility.name}
                </h4>
                <p className="text-xs font-mono text-white/60 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />
                  <span>
                    {selectedFacility.city}, {selectedFacility.country}
                  </span>
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#BEBEBE] leading-relaxed">
                {selectedFacility.description}
              </p>

              {/* Status Pill */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs flex items-center justify-between">
                <span className="text-white/50 text-[10px]">CURRENT OPS:</span>
                <span className="text-[#FF5A1F] font-bold text-[11px] tracking-wide">
                  {selectedFacility.status}
                </span>
              </div>
            </div>

            {/* Middle Column: Architectural & Engineering Telemetry */}
            <div className="space-y-3 lg:col-span-1 glass-panel p-5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block pb-1 border-b border-white/10">
                // FACILITY TELEMETRY & CAPABILITIES
              </span>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-white/40 font-mono text-[10px] block">
                    Dimensions / Scale:
                  </span>
                  <p className="text-white font-medium font-display text-sm mt-0.5">
                    {selectedFacility.areaOrLength}
                  </p>
                </div>

                <div>
                  <span className="text-white/40 font-mono text-[10px] block">
                    Engineering Specialty:
                  </span>
                  <p className="text-white font-medium mt-0.5">
                    {selectedFacility.specialty}
                  </p>
                </div>

                <div>
                  <span className="text-white/40 font-mono text-[10px] block">
                    Certified Personnel:
                  </span>
                  <p className="text-white font-medium mt-0.5">
                    {selectedFacility.personnel}
                  </p>
                </div>

                <div>
                  <span className="text-white/40 font-mono text-[10px] block">
                    Active Fleet / Feature:
                  </span>
                  <p className="text-[#00E5FF] font-medium font-mono text-[11px] mt-0.5">
                    {selectedFacility.featuredModel}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Address, Concierge & Direct Action Booking */}
            <div className="space-y-4 lg:col-span-1 glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-white/50 tracking-widest font-bold block pb-1 border-b border-white/10">
                  // PRIVATE CONCIERGE & ACCESS
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-white/40 font-mono text-[10px] block">Address:</span>
                    <p className="text-white font-mono text-[11px] mt-0.5">
                      {selectedFacility.address}
                    </p>
                  </div>

                  <div>
                    <span className="text-white/40 font-mono text-[10px] block">
                      Dedicated Telemetry Line:
                    </span>
                    <p className="text-white font-mono text-[11px] mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>{selectedFacility.phone}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-white/40 font-mono text-[10px] block">Timezone:</span>
                    <p className="text-white font-mono text-[11px] mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>{selectedFacility.timezone}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Booking Buttons */}
              <div className="pt-3 space-y-2">
                <MagneticButton
                  variant="primary"
                  onClick={() => onBookAppointment?.(selectedFacility)}
                  className="w-full py-3.5 text-xs font-bold justify-center"
                >
                  Schedule Private Facility Tour
                  <ChevronRight className="w-4 h-4 ml-1" />
                </MagneticButton>

                <div className="text-[10px] font-mono text-center text-white/40">
                  24/7 Flying Doctor air-freight support on standby worldwide.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
