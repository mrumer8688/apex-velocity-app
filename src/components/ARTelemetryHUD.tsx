import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gauge,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Radar,
  Sun,
  Moon,
  AlertTriangle,
  Radio,
  CornerUpRight,
  CornerUpLeft,
  MoveRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { CarModel } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ARTelemetryHUDProps {
  car: CarModel;
  rotation?: { x: number; y: number };
}

interface SpeedTrap {
  id: string;
  name: string;
  location: string;
  recordSpeed: number;
  currentSpeed: number;
  passed: boolean;
}

interface GPoint {
  x: number;
  y: number;
  alpha: number;
}

interface TrackPhase {
  name: string;
  turnCode: string;
  turnName: string;
  targetLatG: number;
  targetLongG: number;
  sector: 'S1' | 'S2' | 'S3';
  radiusMeters: number; // Corner radius in meters (9999 = straight)
  turnDirection: 'LEFT' | 'RIGHT' | 'STRAIGHT';
  apexSpeedTargetMph: number;
  bankAngleDeg: number;
}

export const ARTelemetryHUD: React.FC<ARTelemetryHUDProps> = ({ car, rotation = { x: 0, y: 0 } }) => {
  const { isSunset, toggleTheme } = useTheme();
  const { t: translate } = useLanguage();

  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [speedUnit, setSpeedUnit] = useState<'MPH' | 'KMH'>('MPH');
  const [isThrottling, setIsThrottling] = useState(false);
  const [launchControlActive, setLaunchControlActive] = useState(false);

  // Track Lap Timer State
  const [lapTimerRunning, setLapTimerRunning] = useState(true);
  const [lapNumber, setLapNumber] = useState(2);
  const [lapElapsedMs, setLapElapsedMs] = useState(48320);
  const [bestLapMs, setBestLapMs] = useState(78410); // 01:18.410 benchmark
  const [lapDeltaSeconds, setLapDeltaSeconds] = useState(-0.38);
  const [currentSector, setCurrentSector] = useState<'S1' | 'S2' | 'S3'>('S2');

  // Baseline performance parameters
  const maxSpeedMph = parseInt(car.topSpeed) || 270;
  const isElectric =
    car.specs.engine.toLowerCase().includes('electric') ||
    car.specs.engine.toLowerCase().includes('magnet') ||
    !!car.specs.batteryCapacity;

  const hpValue = parseInt(car.power.replace(/[^0-9]/g, '')) || 1500;
  const peakTorqueNm = Math.round(hpValue * 1.15);

  // Simulated Track Corners sequence with authentic radii (Spa-Francorchamps / Apex Circuit)
  const trackPhases: TrackPhase[] = useMemo(
    () => [
      {
        name: 'MAIN STRAIGHT ACCEL',
        turnCode: 'STR-1',
        turnName: 'Pit Straight',
        targetLatG: 0.05,
        targetLongG: 1.35,
        sector: 'S1',
        radiusMeters: 9999,
        turnDirection: 'STRAIGHT',
        apexSpeedTargetMph: 220,
        bankAngleDeg: 0,
      },
      {
        name: 'TURN 1 BRAKING ZONE',
        turnCode: 'T1-ENTRY',
        turnName: 'La Source Approach',
        targetLatG: 0.35,
        targetLongG: -1.75,
        sector: 'S1',
        radiusMeters: 110,
        turnDirection: 'RIGHT',
        apexSpeedTargetMph: 58,
        bankAngleDeg: 1.5,
      },
      {
        name: 'TURN 1 APEX RIGHT',
        turnCode: 'T1-APEX',
        turnName: 'La Source Hairpin',
        targetLatG: 1.62,
        targetLongG: 0.25,
        sector: 'S1',
        radiusMeters: 45,
        turnDirection: 'RIGHT',
        apexSpeedTargetMph: 46,
        bankAngleDeg: 2.0,
      },
      {
        name: 'CHICANE FLICK LEFT',
        turnCode: 'T3-RADILLON',
        turnName: 'Raidillon Crest',
        targetLatG: -1.52,
        targetLongG: 0.55,
        sector: 'S2',
        radiusMeters: 88,
        turnDirection: 'LEFT',
        apexSpeedTargetMph: 142,
        bankAngleDeg: 4.0,
      },
      {
        name: 'EAU ROUGE COMPRESSION',
        turnCode: 'T2-EAU ROUGE',
        turnName: 'Eau Rouge Compression',
        targetLatG: 0.88,
        targetLongG: 1.25,
        sector: 'S2',
        radiusMeters: 260,
        turnDirection: 'RIGHT',
        apexSpeedTargetMph: 190,
        bankAngleDeg: 7.5,
      },
      {
        name: 'HIGH-SPEED CAROUSEL',
        turnCode: 'T10-POUHON',
        turnName: 'Double Apex Pouhon',
        targetLatG: -1.68,
        targetLongG: 0.35,
        sector: 'S2',
        radiusMeters: 145,
        turnDirection: 'LEFT',
        apexSpeedTargetMph: 165,
        bankAngleDeg: 3.0,
      },
      {
        name: 'BACK STRAIGHT SPRINT',
        turnCode: 'STR-2',
        turnName: 'Kemmel High-Speed Vector',
        targetLatG: 0.0,
        targetLongG: 1.50,
        sector: 'S3',
        radiusMeters: 9999,
        turnDirection: 'STRAIGHT',
        apexSpeedTargetMph: 245,
        bankAngleDeg: 0,
      },
      {
        name: 'BUS STOP CHICANE',
        turnCode: 'T19-BUS STOP',
        turnName: 'Bus Stop Chicane',
        targetLatG: 1.58,
        targetLongG: -1.65,
        sector: 'S3',
        radiusMeters: 38,
        turnDirection: 'RIGHT',
        apexSpeedTargetMph: 44,
        bankAngleDeg: 1.0,
      },
    ],
    []
  );

  // Speed Traps calculated from car velocity
  const [speedTraps, setSpeedTraps] = useState<SpeedTrap[]>([
    {
      id: 'trap-1',
      name: 'TRAP 1',
      location: 'Turn 3 Exit',
      recordSpeed: Math.round(maxSpeedMph * 0.68),
      currentSpeed: Math.round(maxSpeedMph * 0.65),
      passed: true,
    },
    {
      id: 'trap-2',
      name: 'TRAP 2',
      location: 'Kemmel Straight',
      recordSpeed: Math.round(maxSpeedMph * 0.84),
      currentSpeed: Math.round(maxSpeedMph * 0.81),
      passed: true,
    },
    {
      id: 'trap-3',
      name: 'V-MAX',
      location: 'Finish Line',
      recordSpeed: Math.round(maxSpeedMph * 0.98),
      currentSpeed: Math.round(maxSpeedMph * 0.92),
      passed: false,
    },
  ]);

  // Live telemetry values
  const [speed, setSpeed] = useState(0);
  const [torque, setTorque] = useState(85);
  const [rpm, setRpm] = useState(1050);
  const [gear, setGear] = useState<number | 'N' | 'P' | 'D'>('N');
  const [boostPsi, setBoostPsi] = useState(0.2);

  // Real-time Cornering & G-Force Simulation
  const [lateralG, setLateralG] = useState(0.0);
  const [longitudinalG, setLongitudinalG] = useState(0.0);
  const [peakLateralG, setPeakLateralG] = useState(1.68);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [gTrail, setGTrail] = useState<GPoint[]>([]);

  // Simulation Refs
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const currentSpeedRef = useRef(0);
  const currentGearRef = useRef<number>(1);
  const lapTimeRef = useRef(48320);
  const cornerPhaseTimeRef = useRef(0);

  const gearRatios = [3.8, 2.7, 1.9, 1.4, 1.1, 0.9, 0.75];

  // Active track corner phase
  const activeTrackPhase = trackPhases[activePhaseIndex] || trackPhases[0];

  // Live simulation update loop
  const updateTelemetry = useCallback((now: number) => {
    const dt = Math.max(0, Math.min((now - (lastTimeRef.current || now)) / 1000, 0.1));
    lastTimeRef.current = now;

    // 1. Lap Timer Progression
    if (lapTimerRunning) {
      lapTimeRef.current += dt * 1000;
      setLapElapsedMs(Math.round(lapTimeRef.current));

      // Lap rollover around 82.4 seconds
      if (lapTimeRef.current >= 82400) {
        lapTimeRef.current = 0;
        setLapNumber((l) => l + 1);
        setBestLapMs((prev) => Math.min(prev, 78410 + (Math.random() * 600 - 300)));
        setLapDeltaSeconds(parseFloat((-0.45 + Math.random() * 0.9).toFixed(2)));
        triggerHaptic('success');
      }
    }

    // 2. Simulated Track Cornering Phase Evolution with Safe Indexing
    cornerPhaseTimeRef.current = Math.max(0, cornerPhaseTimeRef.current + dt);
    const safePhasesLength = Math.max(1, trackPhases.length);
    const rawIdx = Math.floor(cornerPhaseTimeRef.current / 4.2);
    const currentPhaseIdx = ((rawIdx % safePhasesLength) + safePhasesLength) % safePhasesLength;
    setActivePhaseIndex(currentPhaseIdx);
    const currentPhase = trackPhases[currentPhaseIdx] || trackPhases[0] || {
      name: 'MAIN STRAIGHT ACCEL',
      turnCode: 'STR-1',
      turnName: 'Pit Straight',
      targetLatG: 0.05,
      targetLongG: 1.35,
      sector: 'S1',
      radiusMeters: 9999,
      turnDirection: 'STRAIGHT',
      apexSpeedTargetMph: 220,
      bankAngleDeg: 0,
    };
    if (currentPhase && currentPhase.sector) {
      setCurrentSector(currentPhase.sector);
    }

    // 3. User Steering Bias from 3D dragging + Track Cornering
    const userYawBias = Math.sin(rotation?.y || 0) * 1.1;
    const baseLatG = (currentPhase?.targetLatG ?? 0) + userYawBias;
    const currentLatG = parseFloat((baseLatG + (Math.random() * 0.08 - 0.04)).toFixed(2));
    setLateralG(currentLatG);

    if (Math.abs(currentLatG) > peakLateralG) {
      setPeakLateralG(Math.abs(currentLatG));
    }

    // 4. Throttle / Acceleration Dynamics
    if (isThrottling) {
      const accelFactor = launchControlActive ? 46 : 32;
      currentSpeedRef.current = Math.min(
        maxSpeedMph,
        currentSpeedRef.current + accelFactor * dt
      );

      // Gear logic
      const speedNorm = currentSpeedRef.current;
      let targetGear = 1;
      if (speedNorm > 195) targetGear = 7;
      else if (speedNorm > 155) targetGear = 6;
      else if (speedNorm > 120) targetGear = 5;
      else if (speedNorm > 85) targetGear = 4;
      else if (speedNorm > 55) targetGear = 3;
      else if (speedNorm > 30) targetGear = 2;
      else targetGear = 1;

      if (targetGear !== currentGearRef.current) {
        currentGearRef.current = targetGear;
        triggerHaptic('medium');
      }

      const gearRatio = gearRatios[targetGear - 1] || 1.0;
      const calculatedRpm = Math.min(
        9200,
        Math.max(2500, (currentSpeedRef.current * 38 * gearRatio) + (Math.random() * 80 - 40))
      );

      const rpmRatio = calculatedRpm / 7200;
      const torqueMultiplier = Math.sin(Math.min(Math.PI, rpmRatio * Math.PI * 0.85)) * 0.95 + 0.1;
      const currentTorque = Math.round(peakTorqueNm * torqueMultiplier + (Math.random() * 30 - 15));
      const targetBoost = isElectric ? 0 : Math.min(26.5, rpmRatio * 26.5 * 1.05);

      setSpeed(Math.round(currentSpeedRef.current));
      setTorque(currentTorque);
      setRpm(Math.round(calculatedRpm));
      setGear(isElectric ? 'D' : targetGear);
      setBoostPsi(parseFloat(targetBoost.toFixed(1)));
      setLongitudinalG(parseFloat((1.35 + Math.random() * 0.35).toFixed(2)));

      // Update speed traps live
      setSpeedTraps((prev) =>
        prev.map((trap, idx) => {
          if (idx === 0 && currentSpeedRef.current >= trap.recordSpeed * 0.9) {
            return { ...trap, currentSpeed: Math.max(trap.currentSpeed, Math.round(currentSpeedRef.current)), passed: true };
          }
          if (idx === 1 && currentSpeedRef.current >= trap.recordSpeed * 0.85) {
            return { ...trap, currentSpeed: Math.max(trap.currentSpeed, Math.round(currentSpeedRef.current)), passed: true };
          }
          if (idx === 2 && currentSpeedRef.current >= trap.recordSpeed * 0.92) {
            return { ...trap, currentSpeed: Math.max(trap.currentSpeed, Math.round(currentSpeedRef.current)), passed: true };
          }
          return trap;
        })
      );
    } else {
      // Deceleration / Auto Cruising
      if (currentSpeedRef.current > 0) {
        currentSpeedRef.current = Math.max(0, currentSpeedRef.current - 18 * dt);
        const targetGear = Math.max(1, Math.min(7, Math.ceil(currentSpeedRef.current / 30)));
        currentGearRef.current = targetGear;

        const coastRpm = Math.max(1050, currentSpeedRef.current * 25);
        setSpeed(Math.round(currentSpeedRef.current));
        setRpm(Math.round(coastRpm));
        setTorque(Math.round(140 + Math.random() * 20));
        setGear(currentSpeedRef.current < 2 ? 'N' : (isElectric ? 'D' : targetGear));
        setBoostPsi(parseFloat(Math.max(0.1, boostPsi - 12 * dt).toFixed(1)));
        setLongitudinalG(parseFloat(((currentPhase?.targetLongG ?? 1.0) * 0.8).toFixed(2)));
      } else {
        // Idle state with subtle engine vibration
        setSpeed(0);
        setGear('N');
        setRpm(1050 + Math.round(Math.sin(now * 0.005) * 45));
        setTorque(Math.round(85 + Math.sin(now * 0.004) * 8));
        setBoostPsi(0.2);
        setLongitudinalG(parseFloat(((currentPhase?.targetLongG ?? 0.5) * 0.3).toFixed(2)));
      }
    }

    // 5. Update G-Force comet trail history
    setGTrail((prev) => {
      const nextPoint = {
        x: Math.max(-1.9, Math.min(1.9, currentLatG)),
        y: Math.max(-1.9, Math.min(1.9, currentPhase?.targetLongG ?? 0)),
        alpha: 1.0,
      };
      const updated = [nextPoint, ...prev.slice(0, 5)].map((p) => ({
        ...p,
        alpha: p.alpha * 0.75,
      }));
      return updated;
    });

    animFrameRef.current = requestAnimationFrame(updateTelemetry);
  }, [
    lapTimerRunning,
    isThrottling,
    launchControlActive,
    maxSpeedMph,
    peakTorqueNm,
    isElectric,
    rotation.y,
    boostPsi,
    peakLateralG,
    trackPhases,
  ]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(updateTelemetry);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateTelemetry]);

  // Format milliseconds into MM:SS.mmm format
  const formatLapTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(ms % 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  };

  const handleResetLapTimer = () => {
    lapTimeRef.current = 0;
    setLapElapsedMs(0);
    setLapDeltaSeconds(-0.12);
    triggerHaptic('light');
  };

  // 4-Wheel Torque Distribution calculated dynamically
  const steerBias = Math.sin(rotation.y || 0) + (lateralG * 0.4);
  const flTorque = Math.max(10, Math.min(40, Math.round(25 - steerBias * 8)));
  const frTorque = Math.max(10, Math.min(40, Math.round(25 + steerBias * 8)));
  const rlTorque = Math.max(10, Math.min(40, Math.round(25 - steerBias * 6)));
  const rrTorque = Math.max(10, Math.min(40, Math.round(25 + steerBias * 6)));

  const displayedSpeed = speedUnit === 'MPH' ? speed : Math.round(speed * 1.60934);
  const displayedTorque = Math.round(speedUnit === 'MPH' ? torque * 0.737562 : torque);
  const torqueUnitLabel = speedUnit === 'MPH' ? 'lb-ft' : 'Nm';

  // RPM percentage for tachometer progress bar
  const rpmPct = Math.min(100, Math.max(0, ((rpm - 1000) / 8000) * 100));

  // Combined Total G-Force
  const combinedG = parseFloat(Math.sqrt(lateralG * lateralG + longitudinalG * longitudinalG).toFixed(2));
  const gripAdhesionPct = Math.min(100, Math.round((combinedG / 2.0) * 100));

  // ─────────────────────────────────────────────────────────────────────────
  // PREDICTED LATERAL LOAD SIMULATION BASED ON TRACK CORNER RADIUS:
  // Physics formula: a_lat = v^2 / R, G_lat = a_lat / 9.80665
  // Accounts for vehicle speed, aero downforce coefficient, and track banking
  // ─────────────────────────────────────────────────────────────────────────
  const cornerRadiusMeters = activeTrackPhase.radiusMeters;
  const isStraightaway = cornerRadiusMeters >= 5000;

  // Effective speed used for prediction: current live speed, or realistic corner approach velocity
  const effectiveSimSpeedMph = Math.max(speed, activeTrackPhase.apexSpeedTargetMph * 0.85);
  const effectiveSimSpeedMps = effectiveSimSpeedMph * 0.44704;

  // Uncorrected centripetal G = v^2 / (g * R)
  const rawPredictedCentripetalG = isStraightaway
    ? 0.0
    : (effectiveSimSpeedMps * effectiveSimSpeedMps) / (9.80665 * cornerRadiusMeters);

  // Aerodynamic downforce multiplier increases available tire friction & stabilizes chassis
  const aeroDownforceFactor = 1.0 + Math.min(0.4, Math.pow(effectiveSimSpeedMph / 220, 2) * 0.35);
  // Bank angle reduction of lateral slip component
  const bankReduction = Math.sin((activeTrackPhase.bankAngleDeg * Math.PI) / 180) * 0.35;
  const netPredictedG = Math.max(0, rawPredictedCentripetalG * (1 - bankReduction));

  // Signed predicted lateral G (Right turn = positive G vector, Left turn = negative G vector)
  const signedPredictedLatG = activeTrackPhase.turnDirection === 'LEFT'
    ? -netPredictedG
    : (activeTrackPhase.turnDirection === 'RIGHT' ? netPredictedG : 0);

  const displayPredictedAbsG = parseFloat(netPredictedG.toFixed(2));
  const displaySignedPredictedG = parseFloat(signedPredictedLatG.toFixed(2));

  // Dynamic Tire Adhesion Limit for current vehicle & aero load
  const maxAdhesionLimitG = parseFloat((2.0 * aeroDownforceFactor).toFixed(2));
  const lateralGripMargin = parseFloat((maxAdhesionLimitG - displayPredictedAbsG).toFixed(2));
  const isNearLimit = displayPredictedAbsG > 1.6;
  const isOverLimit = displayPredictedAbsG > maxAdhesionLimitG;

  // Clamped coordinate for radar indicator [-1.95, +1.95]
  const radarPredictedX = Math.max(-1.95, Math.min(1.95, displaySignedPredictedG));
  const radarPredictedY = Math.max(-1.95, Math.min(1.95, activeTrackPhase.targetLongG));

  // ─────────────────────────────────────────────────────────────────────────
  // THEME COLOR SCHEME (Dynamically Synced with Ambient Lighting: Midnight vs Sunset)
  // Provides ultra-high contrast readability in both ambient lighting states
  // ─────────────────────────────────────────────────────────────────────────
  const t = useMemo(() => {
    if (isSunset) {
      // Warm Golden Hour (Sunset Theme)
      return {
        isSunset: true,
        primary: '#FFAA33', // Vibrant golden-hour amber
        primaryLight: '#FFCC66',
        primaryDark: '#B36B00',
        primaryBg: 'rgba(255, 170, 51, 0.15)',
        primaryBorder: 'border-[#FFAA33]/40',
        primaryText: 'text-[#FFAA33]',
        primaryGlow: '0 0 15px rgba(255, 170, 51, 0.45)',

        secondary: '#FF5520', // Sunset incandescent flame coral
        secondaryText: 'text-[#FF5520]',
        secondaryBg: 'bg-[#FF5520]/20',
        secondaryBorder: 'border-[#FF5520]/40',

        // Cards & Panels
        cardBg: 'bg-[#140b05]/90', // Warm deep espresso obsidian
        cardBorder: 'border-[#FFAA33]/25',
        cardShadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_20px_rgba(255,170,51,0.14)]',
        panelBg: 'bg-[#1b0e06]/80',

        // Typography & Badges
        textPrimary: 'text-white',
        textMuted: 'text-[#e2c7b5]/80',
        textDim: 'text-[#c8a186]/55',
        badgeBg: 'bg-[#2b170c]/80 border border-[#FFAA33]/30',

        // Dynamic Radar Accents
        radarBg: 'bg-[#100702]/90',
        radarRing: 'border-[#FFAA33]/25',
        radarDashRing: 'border-[#FFAA33]/35',
        radarAxis: 'bg-[#FFAA33]/25',
        radarBallBg: 'bg-[#FFAA33]',
        radarBallShadow: 'shadow-[0_0_12px_#FFAA33]',
        predictedTargetBorder: 'border-[#FFD700]',
        predictedTargetBg: 'bg-[#FFD700]/30',
        predictedTargetGlow: 'shadow-[0_0_10px_#FFD700]',

        speedGlow: 'drop-shadow-[0_0_18px_rgba(255,170,51,0.5)]',
        sectorS2Class: 'bg-[#FFAA33] text-black font-extrabold shadow-[0_0_8px_rgba(255,170,51,0.6)]',
      };
    } else {
      // Deep Stealth Cyber (Midnight Theme)
      return {
        isSunset: false,
        primary: '#00E5FF', // Electric Cyber Cyan
        primaryLight: '#66EFFF',
        primaryDark: '#0088A3',
        primaryBg: 'rgba(0, 229, 255, 0.15)',
        primaryBorder: 'border-[#00E5FF]/40',
        primaryText: 'text-[#00E5FF]',
        primaryGlow: '0 0 15px rgba(0, 229, 255, 0.4)',

        secondary: '#FF5A1F', // Apex Flame Orange
        secondaryText: 'text-[#FF5A1F]',
        secondaryBg: 'bg-[#FF5A1F]/20',
        secondaryBorder: 'border-[#FF5A1F]/40',

        // Cards & Panels
        cardBg: 'bg-black/85',
        cardBorder: 'border-white/15',
        cardShadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.95),0_0_20px_rgba(0,229,255,0.08)]',
        panelBg: 'bg-white/5',

        // Typography & Badges
        textPrimary: 'text-white',
        textMuted: 'text-white/60',
        textDim: 'text-white/40',
        badgeBg: 'bg-white/5 border border-white/10',

        // Dynamic Radar Accents
        radarBg: 'bg-black/60',
        radarRing: 'border-white/15',
        radarDashRing: 'border-white/20',
        radarAxis: 'bg-white/15',
        radarBallBg: 'bg-[#00E5FF]',
        radarBallShadow: 'shadow-[0_0_12px_#00E5FF]',
        predictedTargetBorder: 'border-[#00FFCC]',
        predictedTargetBg: 'bg-[#00FFCC]/30',
        predictedTargetGlow: 'shadow-[0_0_10px_#00FFCC]',

        speedGlow: 'drop-shadow-[0_0_18px_rgba(0,229,255,0.4)]',
        sectorS2Class: 'bg-[#00E5FF] text-black font-extrabold shadow-[0_0_8px_rgba(0,229,255,0.6)]',
      };
    }
  }, [isSunset]);

  return (
    <div className="absolute inset-x-0 top-16 sm:top-20 z-20 pointer-events-none px-2 sm:px-6 select-none max-h-[82vh] overflow-y-auto scrollbar-none">
      {/* Floating Header Bar for HUD Status, Theme Synchronization & Quick Actions */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-2 pointer-events-auto">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${t.cardBg} border ${t.primaryBorder} backdrop-blur-xl shadow-lg transition-colors duration-500`}>
          <Activity className={`w-3.5 h-3.5 ${t.primaryText} animate-pulse`} />
          <span className={`text-[10px] font-mono tracking-widest ${t.primaryText} font-bold uppercase`}>
            {translate('telemetry.title', 'TELEMETRY & LAP TIMER')}
          </span>
          <span className="text-white/30 hidden xs:inline">•</span>
          <span className={`text-[10px] font-mono ${t.textMuted} uppercase hidden xs:inline truncate max-w-[140px]`}>
            {car.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Ambient Lighting Dynamic Sync Pill / Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono border flex items-center gap-1.5 transition-all cursor-pointer ${
              isSunset
                ? 'border-[#FFAA33]/50 bg-[#FFAA33]/15 text-[#FFAA33] hover:bg-[#FFAA33]/25 shadow-[0_0_10px_rgba(255,170,51,0.25)] font-bold'
                : 'border-white/15 bg-black/60 text-white/80 hover:text-white hover:border-[#00E5FF]/60'
            }`}
            title={`Ambient Lighting: ${isSunset ? 'Sunset (Golden Hour)' : 'Midnight'}. Click to toggle sync.`}
            aria-label="Toggle ambient lighting theme"
          >
            {isSunset ? (
              <Sun className="w-3 h-3 text-[#FFAA33] animate-[spin_12s_linear_infinite]" />
            ) : (
              <Moon className="w-3 h-3 text-[#00E5FF]" />
            )}
            <span className="uppercase tracking-wider hidden sm:inline">
              {isSunset ? 'SUNSET HUD' : 'MIDNIGHT HUD'}
            </span>
          </button>

          {/* Unit Toggle MPH / KMH */}
          <button
            type="button"
            onClick={() => setSpeedUnit((u) => (u === 'MPH' ? 'KMH' : 'MPH'))}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${t.cardBorder} ${t.cardBg} ${t.textMuted} hover:text-white transition-colors cursor-pointer`}
            title="Toggle speed units"
          >
            {speedUnit}
          </button>

          {/* Minimize / Expand HUD */}
          <button
            type="button"
            onClick={() => setHudCollapsed((c) => !c)}
            className={`p-1.5 rounded-full border ${t.cardBorder} ${t.cardBg} ${t.textMuted} hover:${t.primaryText} transition-colors cursor-pointer`}
            title={hudCollapsed ? 'Expand Telemetry HUD' : 'Collapse Telemetry HUD'}
            aria-label="Toggle Telemetry HUD"
          >
            {hudCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!hudCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="max-w-5xl mx-auto space-y-2.5 sm:space-y-3 pointer-events-auto"
          >
            {/* TOP BAR: Dynamic Track Lap Timer & Speed Traps Strip */}
            <div className={`glass-card rounded-2xl p-2.5 sm:p-3 border ${t.cardBorder} ${t.cardBg} ${t.cardShadow} backdrop-blur-2xl flex flex-col lg:flex-row items-center justify-between gap-3 transition-colors duration-500`}>
              {/* Lap Timer Counter & Delta */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-xl ${isSunset ? 'bg-[#FFAA33]/15 border border-[#FFAA33]/35' : 'bg-[#00E5FF]/10 border border-[#00E5FF]/30'} flex items-center justify-center`}>
                    <Timer className={`w-3.5 h-3.5 ${t.primaryText}`} />
                  </div>
                  <div>
                    <span className={`text-[9px] font-mono ${t.textDim} uppercase tracking-widest block`}>
                      LAP {String(lapNumber).padStart(2, '0')} // SPA CIRCUIT
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider tabular-nums">
                      {formatLapTime(lapElapsedMs)}
                    </span>
                  </div>
                </div>

                {/* Delta Pill */}
                <div className="flex flex-col items-end sm:items-start pl-2 border-l border-white/10">
                  <span className={`text-[9px] font-mono ${t.textDim} uppercase`}>
                    {translate('telemetry.deltaToBest', 'DELTA TO BEST')}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold">
                    <span className={lapDeltaSeconds < 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {lapDeltaSeconds < 0 ? `${lapDeltaSeconds}s` : `+${lapDeltaSeconds}s`}
                    </span>
                    <span className={`text-[9px] ${t.textDim}`}>({formatLapTime(bestLapMs)})</span>
                  </div>
                </div>

                {/* Sector Lights: S1, S2, S3 */}
                <div className={`hidden sm:flex items-center gap-1 p-1 rounded-xl ${t.badgeBg}`}>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${currentSector === 'S1' ? 'bg-[#A855F7] text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    S1
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${currentSector === 'S2' ? t.sectorS2Class : 'bg-white/10 text-white/40'}`}>
                    S2
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${currentSector === 'S3' ? 'bg-[#FF5520] text-white animate-pulse' : 'bg-white/10 text-white/40'}`}>
                    S3
                  </div>
                </div>

                {/* Lap Timer Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLapTimerRunning((r) => !r)}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer"
                    title={lapTimerRunning ? 'Pause Lap Timer' : 'Resume Lap Timer'}
                  >
                    {lapTimerRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetLapTimer}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="Reset Lap Clock"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Real-Time Speed Traps Telemetry */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end overflow-x-auto scrollbar-none pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                <span className={`text-[9px] font-mono uppercase tracking-widest ${t.textDim} hidden xl:inline shrink-0`}>
                  {translate('telemetry.speedTraps', 'SPEED TRAPS')}:
                </span>
                {speedTraps.map((trap) => {
                  const trapSpeedDisplay = speedUnit === 'MPH' ? trap.currentSpeed : Math.round(trap.currentSpeed * 1.60934);
                  const trapRecordDisplay = speedUnit === 'MPH' ? trap.recordSpeed : Math.round(trap.recordSpeed * 1.60934);

                  return (
                    <div
                      key={trap.id}
                      className={`px-2.5 py-1.5 rounded-xl border ${t.cardBorder} bg-white/[0.03] hover:border-${isSunset ? '[#FFAA33]' : '[#00E5FF]'}/50 transition-colors shrink-0`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8px] font-mono ${t.primaryText} font-bold uppercase`}>{trap.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSunset ? 'bg-[#FFAA33]' : 'bg-emerald-400'} animate-pulse`} />
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xs font-mono font-bold text-white tabular-nums">
                          {trapSpeedDisplay}
                        </span>
                        <span className={`text-[8px] font-mono ${t.textDim} uppercase`}>{speedUnit}</span>
                      </div>
                      <span className={`text-[8px] font-mono ${t.textDim} block`}>
                        V-Max: {trapRecordDisplay}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* THREE-COLUMN TELEMETRY WINGS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5">
              {/* LEFT WING: Torque & Powertrain Vectoring */}
              <div className={`glass-card rounded-2xl p-3 sm:p-3.5 border ${t.cardBorder} ${t.cardBg} ${t.cardShadow} backdrop-blur-xl flex flex-col justify-between transition-colors duration-500`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-mono uppercase tracking-widest ${t.secondaryText} flex items-center gap-1 font-bold`}>
                    <Zap className="w-3 h-3" />
                    <span>{translate('telemetry.torque', 'TORQUE VECTORING')}</span>
                  </span>
                  <span className={`text-[9px] font-mono ${t.textDim} uppercase`}>
                    {isElectric ? 'Quad-Motor Inverter' : 'Twin-Scroll Hybrid'}
                  </span>
                </div>

                {/* Instantaneous Torque Readout */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                      {displayedTorque.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-mono ${t.secondaryText} ml-1 uppercase font-semibold`}>
                      {torqueUnitLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-mono ${t.textDim} block`}>PEAK BENCHMARK</span>
                    <span className="text-xs font-mono font-bold text-white/90">
                      {peakTorqueNm} Nm
                    </span>
                  </div>
                </div>

                {/* 4-Wheel Torque Distribution Graph */}
                <div className={`p-2 rounded-xl bg-white/[0.03] border ${t.cardBorder} flex items-center justify-between gap-2`}>
                  <div className="w-8 h-10 border border-white/20 rounded-md relative flex items-center justify-center shrink-0">
                    <div className="w-3 h-6 bg-white/10 rounded-sm" />
                    <span className={`absolute -top-1 -left-1 w-2 h-2 rounded-full ${t.radarBallBg} ${t.radarBallShadow}`} />
                    <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${t.radarBallBg} ${t.radarBallShadow}`} />
                    <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[#FF5520] shadow-[0_0_6px_#FF5520]" />
                    <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-[#FF5520] shadow-[0_0_6px_#FF5520]" />
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-mono flex-1">
                    <div className="flex justify-between">
                      <span className={t.textDim}>FL:</span>
                      <span className={`${t.primaryText} font-bold`}>{flTorque}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={t.textDim}>FR:</span>
                      <span className={`${t.primaryText} font-bold`}>{frTorque}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={t.textDim}>RL:</span>
                      <span className="text-[#FF5520] font-bold">{rlTorque}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={t.textDim}>RR:</span>
                      <span className="text-[#FF5520] font-bold">{rrTorque}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER WING: Digital Speedometer & Tachometer */}
              <div className={`glass-card rounded-2xl p-3 sm:p-4 border ${t.primaryBorder} ${t.cardBg} ${t.cardShadow} backdrop-blur-2xl flex flex-col justify-between items-center text-center relative overflow-hidden group transition-colors duration-500`}>
                <div className="w-full flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-mono uppercase tracking-widest ${t.primaryText} flex items-center gap-1 font-bold`}>
                    <Gauge className="w-3 h-3" />
                    <span>{translate('telemetry.velocity', 'VELOCITY DYNAMICS')}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-white px-2 py-0.5 rounded-md bg-white/10 border border-white/15">
                    {translate('telemetry.gear', 'GEAR')} {gear}
                  </span>
                </div>

                {/* Large Digital Speed Readout with Theme-Glow */}
                <div className="my-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tighter ${t.speedGlow}`}>
                      {displayedSpeed}
                    </span>
                    <span className={`text-xs font-mono ${t.primaryText} uppercase font-bold tracking-wider`}>
                      {speedUnit}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono ${t.textDim} block`}>
                    Top Speed Rating: {car.topSpeed}
                  </span>
                </div>

                {/* RPM Progress Bar with F1 Shift Lights */}
                <div className="w-full space-y-1.5 mt-2">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className={t.textDim}>{rpm.toLocaleString()} RPM</span>
                    <span className={rpm > 7800 ? 'text-red-400 font-bold animate-pulse' : t.textDim}>
                      {rpm > 7800 ? 'SHIFT POINT' : '9,000 MAX'}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex gap-0.5 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-75 ${
                        rpm > 7800
                          ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 shadow-[0_0_10px_#ef4444]'
                          : isSunset
                          ? 'bg-gradient-to-r from-[#FFAA33] to-[#FF5520]'
                          : 'bg-gradient-to-r from-emerald-400 to-[#00E5FF]'
                      }`}
                      style={{ width: `${rpmPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT WING: Real-Time G-Force Radar & Predictive Lateral Load Meter */}
              <div className={`glass-card rounded-2xl p-3 sm:p-3.5 border ${t.cardBorder} ${t.cardBg} ${t.cardShadow} backdrop-blur-xl flex flex-col justify-between transition-colors duration-500`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-mono uppercase tracking-widest ${t.primaryText} flex items-center gap-1 font-bold`}>
                    <Radar className={`w-3 h-3 ${t.primaryText} animate-spin-slow`} />
                    <span>{translate('telemetry.chassisRadar', 'CHASSIS G-RADAR')}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-mono ${t.textDim} uppercase`}>
                      PEAK {peakLateralG}G
                    </span>
                  </div>
                </div>

                {/* High-Tech G-Force Radar & Predictive Lateral Load Display */}
                <div className="flex items-center justify-between gap-2.5 my-1">
                  {/* Circular G-Force Friction Radar with Predicted Lateral Target Reticle */}
                  <div className={`w-20 h-20 rounded-full border ${t.radarRing} relative flex items-center justify-center ${t.radarBg} shrink-0 shadow-inner overflow-hidden`}>
                    {/* Concentric Calibration Rings (0.5G, 1.0G, 1.5G, 2.0G) */}
                    <div className={`absolute w-16 h-16 rounded-full border ${t.radarRing} pointer-events-none`} />
                    <div className={`absolute w-11 h-11 rounded-full border ${t.radarDashRing} border-dashed pointer-events-none`} />
                    <div className={`absolute w-6 h-6 rounded-full border ${t.radarRing} pointer-events-none`} />

                    {/* Crosshair Axes */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-full h-[1px] ${t.radarAxis}`} />
                      <div className={`h-full w-[1px] ${t.radarAxis} absolute`} />
                    </div>

                    {/* G-Trail Breadcrumbs (Comet Trail) */}
                    {gTrail.map((p, i) => (
                      <div
                        key={i}
                        className={`absolute w-1.5 h-1.5 rounded-full ${t.radarBallBg} pointer-events-none`}
                        style={{
                          left: `${50 + (p.x / 2.0) * 40}%`,
                          top: `${50 - (p.y / 2.0) * 40}%`,
                          opacity: p.alpha * 0.6,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    ))}

                    {/* PREDICTIVE LATERAL TARGET RETICLE: Predicted Lateral Apex Load */}
                    {!isStraightaway && (
                      <motion.div
                        className={`absolute w-3.5 h-3.5 rounded-full border-2 border-dashed ${t.predictedTargetBorder} ${t.predictedTargetBg} ${t.predictedTargetGlow} z-10 pointer-events-none flex items-center justify-center`}
                        animate={{
                          x: (radarPredictedX / 2.0) * 36,
                          y: -(radarPredictedY / 2.0) * 36,
                          scale: [1, 1.15, 1],
                        }}
                        transition={{
                          scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
                          x: { type: 'spring', stiffness: 300, damping: 25 },
                          y: { type: 'spring', stiffness: 300, damping: 25 },
                        }}
                        title={`Predicted Apex Load: ${displayPredictedAbsG}G (${activeTrackPhase.turnDirection})`}
                      >
                        <div className={`w-1 h-1 rounded-full ${t.radarBallBg}`} />
                      </motion.div>
                    )}

                    {/* Live Dynamic G-Ball */}
                    <motion.div
                      className={`w-3 h-3 rounded-full ${t.radarBallBg} ${t.radarBallShadow} z-20`}
                      animate={{
                        x: (lateralG / 2.0) * 36,
                        y: -(longitudinalG / 2.0) * 36,
                      }}
                      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                    />
                  </div>

                  {/* Cornering Telemetry & Predicted Lateral Load Readout */}
                  <div className="text-[9px] font-mono space-y-1 text-right flex-1">
                    {/* Live Lateral vs Longitudinal */}
                    <div className="flex justify-between">
                      <span className={t.textDim}>LATERAL:</span>
                      <span className={`font-bold ${Math.abs(lateralG) > 1.2 ? t.primaryText : 'text-white'}`}>
                        {lateralG >= 0 ? `+${lateralG}` : lateralG} G
                      </span>
                    </div>

                    {/* PREDICTED LATERAL LOAD (Key Feature) */}
                    <div className="flex justify-between items-center py-0.5 px-1 rounded bg-white/[0.04] border border-white/5">
                      <span className={`${t.primaryText} font-bold text-[8px] flex items-center gap-0.5`}>
                        <TrendingUp className="w-2.5 h-2.5" />
                        {translate('telemetry.predicted', 'PREDICTED')}:
                      </span>
                      <span className={`font-mono font-black ${isOverLimit ? 'text-red-400 animate-pulse' : isNearLimit ? 'text-amber-400' : t.primaryText}`}>
                        {isStraightaway ? '0.00 G' : `${displaySignedPredictedG >= 0 ? '+' : ''}${displaySignedPredictedG} G`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className={t.textDim}>COMBINED:</span>
                      <span className={`${t.primaryText} font-bold`}>{combinedG} G</span>
                    </div>

                    <div className="flex justify-between pt-0.5 border-t border-white/10">
                      <span className={`text-[8px] ${t.textDim}`}>GRIP LIMIT:</span>
                      <span className={`font-bold text-[8px] ${isOverLimit ? 'text-red-400' : 'text-emerald-400'}`}>
                        {maxAdhesionLimitG}G ({gripAdhesionPct}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* TRACK CORNER RADIUS & PREDICTION METRICS BADGE */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  {/* Predicted Lateral Load Status & Corner Radius Information */}
                  <div className={`p-1.5 rounded-xl ${t.badgeBg} flex items-center justify-between gap-1 text-[8px] font-mono`}>
                    <div className="flex items-center gap-1">
                      {activeTrackPhase.turnDirection === 'LEFT' ? (
                        <CornerUpLeft className={`w-3 h-3 ${t.primaryText}`} />
                      ) : activeTrackPhase.turnDirection === 'RIGHT' ? (
                        <CornerUpRight className={`w-3 h-3 ${t.primaryText}`} />
                      ) : (
                        <MoveRight className="w-3 h-3 text-white/50" />
                      )}
                      <div>
                        <span className="text-white font-bold block truncate max-w-[110px]">
                          {activeTrackPhase.turnName}
                        </span>
                        <span className={t.textDim}>
                          {isStraightaway ? `${translate('telemetry.straight', 'STRAIGHT')} // R = ∞` : `${translate('telemetry.radius', 'RADIUS')}: ${cornerRadiusMeters}m`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[7.5px] uppercase block tracking-wider font-semibold text-white/40">
                        {translate('telemetry.lateralMargin', 'LATERAL MARGIN')}
                      </span>
                      <span
                        className={`text-[9px] font-bold ${
                          isOverLimit
                            ? 'text-red-400 animate-pulse'
                            : lateralGripMargin < 0.35
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {isStraightaway ? 'SAFE' : `${lateralGripMargin >= 0 ? '+' : ''}${lateralGripMargin}G`}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Hold-to-Accel & Launch Control */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onMouseDown={() => {
                        setIsThrottling(true);
                        triggerHaptic('rev');
                      }}
                      onMouseUp={() => setIsThrottling(false)}
                      onMouseLeave={() => setIsThrottling(false)}
                      onTouchStart={() => {
                        setIsThrottling(true);
                        triggerHaptic('rev');
                      }}
                      onTouchEnd={() => setIsThrottling(false)}
                      className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
                        isThrottling
                          ? isSunset
                            ? 'bg-gradient-to-r from-[#FFAA33] to-[#FF5520] text-black shadow-[0_0_20px_rgba(255,170,51,0.6)]'
                            : 'bg-gradient-to-r from-[#00E5FF] to-[#FF5A1F] text-black shadow-[0_0_20px_rgba(0,229,255,0.6)]'
                          : 'bg-white/10 text-white hover:bg-white/15 border border-white/20'
                      }`}
                    >
                      <Play className={`w-3 h-3 ${isThrottling ? 'fill-black' : 'fill-white'}`} />
                      <span>{isThrottling ? translate('telemetry.pulling', 'PULLING...') : translate('telemetry.holdToAccel', 'HOLD TO ACCEL')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLaunchControlActive((l) => !l);
                        triggerHaptic('selection');
                      }}
                      className={`px-2 py-2 rounded-xl border text-[10px] font-mono transition-colors cursor-pointer ${
                        launchControlActive
                          ? `${t.secondaryBorder} ${t.secondaryBg} ${t.secondaryText} font-bold shadow-[0_0_10px_rgba(255,85,32,0.3)]`
                          : 'border-white/15 bg-white/5 text-white/50 hover:text-white'
                      }`}
                      title="Toggle Launch Control"
                    >
                      {translate('telemetry.launchControl', 'LC')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
