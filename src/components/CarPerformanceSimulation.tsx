import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Zap,
  Gauge,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { CarModel } from '../types';

interface CarPerformanceSimulationProps {
  car: CarModel;
}

type SurfaceType = 'f1_asphalt' | 'street_tarmac' | 'damp' | 'wet';
type LaunchMode = 'track_launch' | 'street' | 'raw';
type DownforceMode = 'low_drag' | 'balanced' | 'high_downforce';

export const CarPerformanceSimulation: React.FC<CarPerformanceSimulationProps> = ({ car }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // User adjustable track surface parameters
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('f1_asphalt');
  const [trackTemp, setTrackTemp] = useState<number>(32); // in Celsius (10°C to 55°C)
  const [launchMode, setLaunchMode] = useState<LaunchMode>('track_launch');
  const [downforceMode, setDownforceMode] = useState<DownforceMode>('balanced');

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(1); // 0 to 1
  const [hoveredPoint, setHoveredPoint] = useState<{
    time: number;
    speed: number;
    gForce: number;
    x: number;
    y: number;
  } | null>(null);

  // Extract base 0-60 and top speed
  const baseAccel = useMemo(() => {
    const match = car.acceleration.replace(/,/g, '').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 2.2;
  }, [car.acceleration]);

  const baseTopSpeed = useMemo(() => {
    const match = car.topSpeed.replace(/,/g, '').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 250;
  }, [car.topSpeed]);

  // Surface friction coefficient (mu)
  const surfaceMu = useMemo(() => {
    switch (surfaceType) {
      case 'f1_asphalt':
        return 1.12;
      case 'street_tarmac':
        return 0.92;
      case 'damp':
        return 0.70;
      case 'wet':
        return 0.48;
    }
  }, [surfaceType]);

  // Temperature friction factor (optimal tire compound window is 30°C - 40°C)
  const tempFactor = useMemo(() => {
    const optimal = 35;
    const diff = Math.abs(trackTemp - optimal);
    return 1 - (diff / 100) * 0.18; // 0.82 to 1.0
  }, [trackTemp]);

  // Launch mode traction efficiency
  const launchEfficiency = useMemo(() => {
    switch (launchMode) {
      case 'track_launch':
        return 1.0; // Perfect slip angle
      case 'street':
        return 0.94; // Conservative torque limit
      case 'raw':
        return 0.86; // Wheelspin penalty initially
    }
  }, [launchMode]);

  // Downforce modifier (high downforce helps high-speed braking and grip, but adds top-speed drag)
  const aeroEffects = useMemo(() => {
    switch (downforceMode) {
      case 'low_drag':
        return { dragMultiplier: 0.92, brakingBonus: 0.95, topSpeedMultiplier: 1.04 };
      case 'balanced':
        return { dragMultiplier: 1.0, brakingBonus: 1.0, topSpeedMultiplier: 1.0 };
      case 'high_downforce':
        return { dragMultiplier: 1.12, brakingBonus: 1.14, topSpeedMultiplier: 0.96 };
    }
  }, [downforceMode]);

  // Computed Real-Time Metrics
  const calculatedAccel60 = useMemo(() => {
    const totalGrip = surfaceMu * tempFactor * launchEfficiency;
    // Lower grip increases 0-60 time
    const adjusted = baseAccel * (1.05 / Math.max(0.4, totalGrip));
    return parseFloat(adjusted.toFixed(2));
  }, [baseAccel, surfaceMu, tempFactor, launchEfficiency]);

  const calculatedAccel100 = useMemo(() => {
    return parseFloat((calculatedAccel60 * 2.15).toFixed(2));
  }, [calculatedAccel60]);

  const calculatedBrakingDistance = useMemo(() => {
    // 60-0 mph stopping distance in feet
    // Physics: d = v^2 / (30 * f), base ~88 ft on F1 asphalt with carbon-ceramics
    const effectiveBrakingMu = surfaceMu * aeroEffects.brakingBonus * (0.85 + tempFactor * 0.15);
    const distanceFeet = (60 * 60) / (30 * effectiveBrakingMu * 1.35);
    return Math.round(distanceFeet);
  }, [surfaceMu, aeroEffects.brakingBonus, tempFactor]);

  const calculatedBrakingTime = useMemo(() => {
    // Time to stop from 60 to 0
    return parseFloat(((calculatedBrakingDistance * 2) / 88 / 1.467).toFixed(2));
  }, [calculatedBrakingDistance]);

  const maxSimTopSpeed = useMemo(() => {
    return Math.round(baseTopSpeed * aeroEffects.topSpeedMultiplier);
  }, [baseTopSpeed, aeroEffects.topSpeedMultiplier]);

  // Generate acceleration curve dataset (Time vs Speed in MPH up to 10 seconds)
  const curveData = useMemo(() => {
    const points: { time: number; speed: number; gForce: number }[] = [];
    const maxT = 10;
    const steps = 50;

    // Acceleration rate parameter derived from calculated 0-60
    const k = 60 / Math.pow(calculatedAccel60, 0.95);

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxT;
      // Exponential saturation curve: speed approaching max
      let speed = maxSimTopSpeed * (1 - Math.exp((-k * Math.pow(t, 0.88)) / maxSimTopSpeed));
      if (t === 0) speed = 0;

      // Approximate instantaneous longitudinal G-Force
      const prevT = Math.max(0, t - 0.2);
      const prevSpeed = maxSimTopSpeed * (1 - Math.exp((-k * Math.pow(prevT, 0.88)) / maxSimTopSpeed));
      const deltaV = (speed - prevSpeed) * 0.44704; // mph to m/s
      const deltaT = Math.max(0.01, t - prevT);
      const accelMs2 = deltaV / deltaT;
      const gForce = parseFloat(Math.min(2.5, Math.max(0.05, accelMs2 / 9.81)).toFixed(2));

      points.push({ time: parseFloat(t.toFixed(2)), speed: Math.round(speed), gForce });
    }
    return points;
  }, [calculatedAccel60, maxSimTopSpeed]);

  // SVG dimensions for D3 chart
  const width = 560;
  const height = 230;
  const margin = { top: 20, right: 30, bottom: 35, left: 45 };

  // D3 Scales
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, 10])
      .range([margin.left, width - margin.right]);
  }, [width, margin.left, margin.right]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, 200])
      .range([height - margin.bottom, margin.top]);
  }, [height, margin.top, margin.bottom]);

  // D3 Line and Area Generators
  const lineGenerator = useMemo(() => {
    return d3
      .line<{ time: number; speed: number }>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(Math.min(200, d.speed)))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale]);

  const areaGenerator = useMemo(() => {
    return d3
      .area<{ time: number; speed: number }>()
      .x((d) => xScale(d.time))
      .y0(yScale(0))
      .y1((d) => yScale(Math.min(200, d.speed)))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale]);

  // Render D3 Axes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat((d) => `${d}s`);

    svg.select<SVGGElement>('.x-axis').call(xAxis).attr('color', 'rgba(255,255,255,0.4)');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => `${d}`);

    svg.select<SVGGElement>('.y-axis').call(yAxis).attr('color', 'rgba(255,255,255,0.4)');
  }, [xScale, yScale]);

  // Simulation run animation loop
  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);

    const startTime = performance.now();
    const duration = 2800; // ms

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      setSimProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSimulating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  // Find simulated point based on progress
  const simulatedActivePoint = useMemo(() => {
    const targetTime = simProgress * 10;
    const closest = curveData.reduce((prev, curr) =>
      Math.abs(curr.time - targetTime) < Math.abs(prev.time - targetTime) ? curr : prev
    );
    return closest;
  }, [curveData, simProgress]);

  // Milestones: 60 MPH and 100 MPH positions
  const point60 = useMemo(() => {
    return {
      x: xScale(calculatedAccel60),
      y: yScale(60),
      time: calculatedAccel60,
    };
  }, [calculatedAccel60, xScale, yScale]);

  const point100 = useMemo(() => {
    return {
      x: xScale(calculatedAccel100),
      y: yScale(100),
      time: calculatedAccel100,
    };
  }, [calculatedAccel100, xScale, yScale]);

  return (
    <div className="w-full space-y-5 rounded-2xl glass-card border border-white/15 p-4 sm:p-6 bg-black/85">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] font-bold block">
              // D3.JS DYNAMIC TELEMETRY SIMULATOR
            </span>
            <h4 className="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-white">
              Track Surface & Acceleration Physics
            </h4>
          </div>
        </div>

        {/* Live Run Button */}
        <button
          type="button"
          onClick={runSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider bg-[#FF5A1F] hover:bg-[#FF3B00] text-black font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(255,90,31,0.4)] disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-black ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Simulating Run...' : 'Simulate Launch'}</span>
        </button>
      </div>

      {/* Surface Control Tuners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {/* Surface Type Selector */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
          <span className="text-[10px] text-white/50 uppercase block">1. Surface Grip:</span>
          <select
            value={surfaceType}
            onChange={(e) => setSurfaceType(e.target.value as SurfaceType)}
            className="w-full bg-[#121216] border border-white/20 text-white text-[11px] py-1.5 px-2.5 rounded-lg outline-none focus:border-[#00E5FF] cursor-pointer"
          >
            <option value="f1_asphalt">Dry F1 Asphalt (μ 1.12)</option>
            <option value="street_tarmac">Public Tarmac (μ 0.92)</option>
            <option value="damp">Damp / Mist (μ 0.70)</option>
            <option value="wet">Wet Standing Water (μ 0.48)</option>
          </select>
        </div>

        {/* Track Temperature Slider */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50 uppercase">2. Track Temp:</span>
            <span className="text-[#FF5A1F] font-bold text-[11px]">{trackTemp}°C</span>
          </div>
          <input
            type="range"
            min={10}
            max={55}
            step={1}
            value={trackTemp}
            onChange={(e) => setTrackTemp(parseInt(e.target.value, 10))}
            className="w-full accent-[#FF5A1F] cursor-pointer h-1.5 bg-white/15 rounded-lg"
          />
          <span className="text-[9px] text-white/40 block">
            {trackTemp >= 30 && trackTemp <= 40 ? '★ Optimal Grip Window' : trackTemp < 30 ? 'Cold Compound' : 'Thermal Degradation'}
          </span>
        </div>

        {/* Launch Control Mode */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
          <span className="text-[10px] text-white/50 uppercase block">3. Launch Logic:</span>
          <select
            value={launchMode}
            onChange={(e) => setLaunchMode(e.target.value as LaunchMode)}
            className="w-full bg-[#121216] border border-white/20 text-white text-[11px] py-1.5 px-2.5 rounded-lg outline-none focus:border-[#FF5A1F] cursor-pointer"
          >
            <option value="track_launch">Apex Boost Launch (Peak)</option>
            <option value="street">Street Traction Control</option>
            <option value="raw">Raw Unassisted Grip</option>
          </select>
        </div>

        {/* Aerodynamic Wing Angle */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
          <span className="text-[10px] text-white/50 uppercase block">4. Active Wing Aero:</span>
          <select
            value={downforceMode}
            onChange={(e) => setDownforceMode(e.target.value as DownforceMode)}
            className="w-full bg-[#121216] border border-white/20 text-white text-[11px] py-1.5 px-2.5 rounded-lg outline-none focus:border-[#00E5FF] cursor-pointer"
          >
            <option value="balanced">Balanced Aero Mode</option>
            <option value="low_drag">Low Drag (Top Speed)</option>
            <option value="high_downforce">High Downforce (Braking)</option>
          </select>
        </div>
      </div>

      {/* D3.js Acceleration Curve SVG Visualization */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#0a0a0f] to-[#040407] p-2 sm:p-4">
        {/* Dynamic Telemetry HUD Overlay in top corner */}
        <div className="absolute top-4 right-5 z-10 flex items-center gap-4 text-xs font-mono bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
          <div>
            <span className="text-[9px] text-white/40 block">CURRENT SPEED</span>
            <span className="text-base font-bold font-display text-white">
              {hoveredPoint ? hoveredPoint.speed : simulatedActivePoint.speed}{' '}
              <span className="text-[10px] text-[#00E5FF] font-mono">MPH</span>
            </span>
          </div>
          <div className="border-l border-white/15 pl-3">
            <span className="text-[9px] text-white/40 block">LONGITUDINAL G</span>
            <span className="text-base font-bold font-display text-[#FF5A1F]">
              {hoveredPoint ? hoveredPoint.gForce : simulatedActivePoint.gForce} G
            </span>
          </div>
          <div className="border-l border-white/15 pl-3">
            <span className="text-[9px] text-white/40 block">TIME</span>
            <span className="text-base font-bold font-mono text-white/90">
              {hoveredPoint ? hoveredPoint.time : simulatedActivePoint.time}s
            </span>
          </div>
        </div>

        {/* Chart SVG */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * width;
            const t = Math.max(0, Math.min(10, xScale.invert(svgX)));
            const closest = curveData.reduce((prev, curr) =>
              Math.abs(curr.time - t) < Math.abs(prev.time - t) ? curr : prev
            );
            setHoveredPoint({
              time: closest.time,
              speed: closest.speed,
              gForce: closest.gForce,
              x: xScale(closest.time),
              y: yScale(Math.min(200, closest.speed)),
            });
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            {/* Acceleration Neon Area Gradient */}
            <linearGradient id="accel-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#00E5FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
            </linearGradient>

            {/* Curve stroke gradient */}
            <linearGradient id="accel-stroke-gradient" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="60%" stopColor="#FF5A1F" />
              <stop offset="100%" stopColor="#FF9F1C" />
            </linearGradient>
          </defs>

          {/* D3 Axis Groups */}
          <g className="x-axis text-[9px] font-mono" transform={`translate(0, ${height - margin.bottom})`} />
          <g className="y-axis text-[9px] font-mono" transform={`translate(${margin.left}, 0)`} />

          {/* Grid lines */}
          <g opacity="0.1">
            {[50, 100, 150, 200].map((s) => (
              <line
                key={s}
                x1={margin.left}
                y1={yScale(s)}
                x2={width - margin.right}
                y2={yScale(s)}
                stroke="#ffffff"
                strokeDasharray="2 3"
              />
            ))}
          </g>

          {/* Filled Area beneath curve */}
          <path d={areaGenerator(curveData) || ''} fill="url(#accel-area-gradient)" />

          {/* Main Acceleration Curve */}
          <path
            d={lineGenerator(curveData) || ''}
            fill="none"
            stroke="url(#accel-stroke-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 60 MPH Milestone Marker Dot */}
          {point60.time <= 10 && (
            <g transform={`translate(${point60.x}, ${point60.y})`}>
              <circle r="5" fill="#FF5A1F" stroke="#ffffff" strokeWidth="1.5" />
              <line y1="0" y2={height - margin.bottom - point60.y} stroke="#FF5A1F" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text y="-8" textAnchor="middle" fill="#FF5A1F" fontSize="9" fontFamily="monospace" fontWeight="bold">
                0-60: {calculatedAccel60}s
              </text>
            </g>
          )}

          {/* 100 MPH Milestone Marker Dot */}
          {point100.time <= 10 && (
            <g transform={`translate(${point100.x}, ${point100.y})`}>
              <circle r="5" fill="#00E5FF" stroke="#ffffff" strokeWidth="1.5" />
              <line y1="0" y2={height - margin.bottom - point100.y} stroke="#00E5FF" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text y="-8" textAnchor="middle" fill="#00E5FF" fontSize="9" fontFamily="monospace" fontWeight="bold">
                0-100: {calculatedAccel100}s
              </text>
            </g>
          )}

          {/* Animated Real-Time Simulation Car Telemetry Dot */}
          {isSimulating && (
            <g transform={`translate(${xScale(simulatedActivePoint.time)}, ${yScale(Math.min(200, simulatedActivePoint.speed))})`}>
              <circle r="12" fill="none" stroke="#FF5A1F" strokeWidth="1.5" className="animate-ping" />
              <circle r="6" fill="#ffffff" stroke="#FF5A1F" strokeWidth="2" />
            </g>
          )}

          {/* Hover Crosshair tracking */}
          {hoveredPoint && (
            <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y})`}>
              <circle r="6" fill="#00E5FF" stroke="#ffffff" strokeWidth="2" />
              <line
                y1={-hoveredPoint.y + margin.top}
                y2={height - margin.bottom - hoveredPoint.y}
                stroke="#00E5FF"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Braking Physics & Distance Visualizer */}
      <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FF5A1F]" />
            <span className="text-xs uppercase text-white font-bold">
              Carbon-Ceramic Braking Telemetry (60 - 0 MPH)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/50 text-[11px]">STOPPING DISTANCE:</span>
            <span className="text-[#00E5FF] font-bold text-sm">{calculatedBrakingDistance} FT</span>
            <span className="text-white/30">|</span>
            <span className="text-white/50 text-[11px]">TIME:</span>
            <span className="text-[#FF5A1F] font-bold text-sm">{calculatedBrakingTime}s</span>
          </div>
        </div>

        {/* Visual Braking Track Meter */}
        <div className="space-y-1">
          <div className="relative w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
            {/* Stopping distance meter */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#00E5FF] to-[#FF5A1F] shadow-[0_0_12px_#00E5FF] transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(15, (calculatedBrakingDistance / 180) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-white/40">
            <span>0 FT (Brake Engaged)</span>
            <span>85 FT (Apex Proving Spec)</span>
            <span>120 FT (Standard)</span>
            <span>180 FT (Maximum Hazard)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
