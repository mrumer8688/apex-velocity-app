/**
 * Apex Velocity High-Fidelity Automotive Audio Engine
 * Real-time procedural Web Audio sound synthesis of distinct hypercar powertrains:
 * - V12 Naturally Aspirated (Screaming high-rev Formula-inspired harmonics)
 * - Twin-Turbo V8 Hybrid (Throaty guttural burble with active turbo spool and wastegate blow-off)
 * - Quad-Motor Electric Flux (Futuristic high-torque magnetic stator whine and coil charging)
 * - Concept / Stradale Hybrid (Instant electric launch transitioning into high-velocity titanium exhaust)
 */

import { CarModel } from '../types';
import { triggerHaptic } from './haptics';

export type PowertrainProfile = 'v12' | 'v8_turbo' | 'electric_flux' | 'hybrid_stradale';

export interface EngineTelemetry {
  isRunning: boolean;
  isStarting: boolean;
  isRevving: boolean;
  currentRpm: number;
  idleRpm: number;
  maxRpm: number;
  redlineRpm: number;
  profileName: string;
  powertrainType: PowertrainProfile;
  boostPressurePsi: number; // For turbo powertrains
}

type TelemetryListener = (telemetry: EngineTelemetry) => void;

class AudioEngineController {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isStarting: boolean = false;
  private isRevving: boolean = false;
  private currentRpm: number = 0;
  private idleRpm: number = 850;
  private maxRpm: number = 9500;
  private redlineRpm: number = 8500;
  private boostPressurePsi: number = 0;
  private activeCar: CarModel | null = null;
  private activeProfile: PowertrainProfile = 'v12';

  // Audio Nodes
  private masterGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private harmonicOscs: OscillatorNode[] = [];
  private harmonicGains: GainNode[] = [];
  private mainFilter: BiquadFilterNode | null = null;
  private waveshaper: WaveShaperNode | null = null;

  // Turbo / Noise Nodes
  private turboGain: GainNode | null = null;
  private turboFilter: BiquadFilterNode | null = null;
  private turboOsc: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;

  // Electric Inverter Nodes
  private electricOsc1: OscillatorNode | null = null;
  private electricOsc2: OscillatorNode | null = null;
  private electricGain: GainNode | null = null;

  // Animation / Telemetry Loop
  private animFrameId: number | null = null;
  private listeners: Set<TelemetryListener> = new Set();
  private targetRpm: number = 0;

  constructor() {
    // Lazy initialized on first user gesture
  }

  private initAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Determine engine acoustic profile from CarModel specs
   */
  public detectProfile(car: CarModel): PowertrainProfile {
    const text = `${car.name} ${car.specs.engine} ${car.category}`.toLowerCase();
    if (text.includes('v12') || text.includes('phantom') || text.includes('chronos') || text.includes('ferrari') || text.includes('amethyst')) {
      return 'v12';
    }
    if (text.includes('electric') || text.includes('permanent magnet') || text.includes('quad flux') || text.includes('axial') || text.includes('aetheris') || text.includes('spectre')) {
      return 'electric_flux';
    }
    if (text.includes('twin-turbo') || text.includes('v8') || text.includes('valkyrie') || text.includes('track beast') || text.includes('mantis') || text.includes('shadow')) {
      return 'v8_turbo';
    }
    return 'hybrid_stradale';
  }

  public getProfileDisplayName(profile: PowertrainProfile): string {
    switch (profile) {
      case 'v12':
        return 'Naturally Aspirated 6.5L V12 (12-Cylinder Symphony)';
      case 'v8_turbo':
        return 'Twin-Turbocharged 4.0L V8 Hybrid (Active Wastegate)';
      case 'electric_flux':
        return 'Quad Axial-Flux Electromagnetic Inverter (Sub-Zero Cryo)';
      case 'hybrid_stradale':
        return 'Titanium-Exhaust Hybrid Stradale (Instantaneous Torque)';
    }
  }

  private createDistortionCurve(amount: number = 40): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Generate Pink/Brownish Noise Buffer for combustion air intake and turbocharger rush
   */
  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.12;
    }
    return buffer;
  }

  /**
   * Start Engine sequence
   */
  public async startEngine(car: CarModel): Promise<void> {
    const ctx = this.initAudioContext();
    this.stopEngineNodes();

    this.activeCar = car;
    this.activeProfile = this.detectProfile(car);
    this.isStarting = true;
    this.isRunning = false;
    this.isRevving = false;

    // Set RPM limits based on profile
    if (this.activeProfile === 'v12') {
      this.idleRpm = 850;
      this.redlineRpm = 8800;
      this.maxRpm = 9500;
    } else if (this.activeProfile === 'v8_turbo') {
      this.idleRpm = 750;
      this.redlineRpm = 8200;
      this.maxRpm = 8800;
    } else if (this.activeProfile === 'electric_flux') {
      this.idleRpm = 0;
      this.redlineRpm = 18000;
      this.maxRpm = 20000;
    } else {
      this.idleRpm = 800;
      this.redlineRpm = 8500;
      this.maxRpm = 9000;
    }

    this.currentRpm = 0;
    this.targetRpm = 0;
    this.notifyTelemetry();

    // Trigger physical ignition haptic feedback on mobile
    triggerHaptic('ignition');

    // 1. Build Master & Main Chain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    this.engineGain = ctx.createGain();
    this.engineGain.gain.setValueAtTime(0, ctx.currentTime);
    this.engineGain.connect(this.masterGain);

    const now = ctx.currentTime;

    // --- Powertrain Specific Startup Sequence ---
    if (this.activeProfile === 'electric_flux') {
      // Electric Flux Startup: High Voltage Pre-Charge Swell + Magnetic Harmonic Chime
      const bootGain = ctx.createGain();
      bootGain.gain.setValueAtTime(0, now);
      bootGain.gain.linearRampToValueAtTime(0.35, now + 0.35);
      bootGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      bootGain.connect(this.masterGain);

      // Low transformer induction hum
      const humOsc = ctx.createOscillator();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(45, now);
      humOsc.frequency.exponentialRampToValueAtTime(110, now + 1.4);
      humOsc.connect(bootGain);
      humOsc.start(now);
      humOsc.stop(now + 1.8);

      // High voltage inverter triad chord
      [440, 660, 880].forEach((freq) => {
        const chordOsc = ctx.createOscillator();
        chordOsc.type = 'triangle';
        chordOsc.frequency.setValueAtTime(freq, now + 0.2);
        chordOsc.connect(bootGain);
        chordOsc.start(now + 0.2);
        chordOsc.stop(now + 1.8);
      });

      // After 1.2s, transition to ready idle state
      setTimeout(() => {
        this.isStarting = false;
        this.isRunning = true;
        this.targetRpm = 800;
        this.setupContinuousNodes();
        this.startTelemetryLoop();
      }, 1200);

      return;
    }

    // --- Combustion / Hybrid Startup Sequence (V12 & V8 Turbo) ---
    // 1. Starter Motor Cranking (High-pitched whir + rhythmic compression clicks)
    const starterGain = ctx.createGain();
    starterGain.gain.setValueAtTime(0, now);
    starterGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    starterGain.gain.setValueAtTime(0.4, now + 0.65);
    starterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    starterGain.connect(this.masterGain);

    const starterOsc = ctx.createOscillator();
    starterOsc.type = 'sawtooth';
    starterOsc.frequency.setValueAtTime(160, now);
    starterOsc.frequency.exponentialRampToValueAtTime(280, now + 0.7);
    starterOsc.connect(starterGain);
    starterOsc.start(now);
    starterOsc.stop(now + 0.9);

    // Starter Cranking Clicks
    for (let i = 0; i < 4; i++) {
      const clickTime = now + 0.12 * i;
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(80, clickTime);
      clickGain.gain.setValueAtTime(0.25, clickTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickOsc.start(clickTime);
      clickOsc.stop(clickTime + 0.05);
    }

    // 2. Combustion Ignition Burst (0.72s into sequence)
    const ignitionTime = now + 0.72;
    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(0, ignitionTime);
    boomGain.gain.linearRampToValueAtTime(0.65, ignitionTime + 0.08);
    boomGain.gain.exponentialRampToValueAtTime(0.01, ignitionTime + 1.2);
    boomGain.connect(this.masterGain);

    const boomOsc = ctx.createOscillator();
    boomOsc.type = 'sawtooth';
    boomOsc.frequency.setValueAtTime(this.activeProfile === 'v12' ? 140 : 90, ignitionTime);
    boomOsc.frequency.exponentialRampToValueAtTime(60, ignitionTime + 1.0);
    boomOsc.connect(boomGain);
    boomOsc.start(ignitionTime);
    boomOsc.stop(ignitionTime + 1.2);

    // Startup Throttle Flare (RPM climbs to 3,200 RPM then settles into idle)
    this.currentRpm = 250;
    const flareDuration = 1.6;
    const startTime = Date.now() + 720;

    const flareInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed < 0) return;
      if (elapsed > flareDuration) {
        clearInterval(flareInterval);
        this.isStarting = false;
        this.isRunning = true;
        this.targetRpm = this.idleRpm;
        this.setupContinuousNodes();
        this.startTelemetryLoop();
        return;
      }

      // Sine curve flare to 3,200 RPM
      const progress = elapsed / flareDuration;
      if (progress < 0.35) {
        // Fast flare up
        this.currentRpm = 800 + Math.sin((progress / 0.35) * (Math.PI / 2)) * 2400;
      } else {
        // Smooth settle down to idle
        const settleProgress = (progress - 0.35) / 0.65;
        this.currentRpm = 3200 - settleProgress * (3200 - this.idleRpm);
      }
      this.notifyTelemetry();
    }, 30);
  }

  /**
   * Setup continuous idle / rev sound synthesis nodes
   */
  private setupContinuousNodes(): void {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Reset harmonic arrays
    this.harmonicOscs = [];
    this.harmonicGains = [];

    // Main Filter & Waveshaper Distortion
    this.mainFilter = ctx.createBiquadFilter();
    this.mainFilter.type = 'lowpass';
    this.mainFilter.frequency.setValueAtTime(1400, ctx.currentTime);
    this.mainFilter.Q.setValueAtTime(3.5, ctx.currentTime);

    this.waveshaper = ctx.createWaveShaper();
    this.waveshaper.curve = this.createDistortionCurve(this.activeProfile === 'v12' ? 35 : 55) as Float32Array<ArrayBuffer>;
    this.waveshaper.oversample = '4x';

    this.engineGain = ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.4, ctx.currentTime);

    // Assembly
    this.engineGain.connect(this.waveshaper);
    this.waveshaper.connect(this.mainFilter);
    this.mainFilter.connect(this.masterGain);

    if (this.activeProfile === 'electric_flux') {
      // Dual high-torque electromagnetic frequency generators
      this.electricOsc1 = ctx.createOscillator();
      this.electricOsc1.type = 'sine';
      this.electricOsc2 = ctx.createOscillator();
      this.electricOsc2.type = 'triangle';

      this.electricGain = ctx.createGain();
      this.electricGain.gain.setValueAtTime(0.3, ctx.currentTime);

      this.electricOsc1.connect(this.electricGain);
      this.electricOsc2.connect(this.electricGain);
      this.electricGain.connect(this.mainFilter);

      this.electricOsc1.start();
      this.electricOsc2.start();
    } else {
      // Combustion Cylinder Harmonics Stack
      // V12: Fundamental, 2nd, 3rd, 6th harmonics (Formula-1 high pitch)
      // V8 Turbo: Fundamental, 1.5x, 2nd, 4th harmonics with deeper rumble
      const harmonicMultipliers =
        this.activeProfile === 'v12'
          ? [1.0, 1.5, 2.0, 3.0, 6.0]
          : [0.8, 1.0, 2.0, 3.5];

      const relativeVolumes =
        this.activeProfile === 'v12'
          ? [0.45, 0.25, 0.2, 0.15, 0.08]
          : [0.55, 0.35, 0.2, 0.1];

      harmonicMultipliers.forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';

        const g = ctx.createGain();
        g.gain.setValueAtTime(relativeVolumes[idx] || 0.1, ctx.currentTime);

        osc.connect(g);
        g.connect(this.engineGain!);

        osc.start();
        this.harmonicOscs.push(osc);
        this.harmonicGains.push(g);
      });

      // Turbo Spool Whistle (for V8 Turbo)
      if (this.activeProfile === 'v8_turbo') {
        this.turboGain = ctx.createGain();
        this.turboGain.gain.setValueAtTime(0, ctx.currentTime);

        this.turboFilter = ctx.createBiquadFilter();
        this.turboFilter.type = 'bandpass';
        this.turboFilter.frequency.setValueAtTime(2800, ctx.currentTime);
        this.turboFilter.Q.setValueAtTime(6.0, ctx.currentTime);

        this.turboOsc = ctx.createOscillator();
        this.turboOsc.type = 'sine';
        this.turboOsc.frequency.setValueAtTime(2600, ctx.currentTime);

        this.turboOsc.connect(this.turboFilter);
        this.turboFilter.connect(this.turboGain);
        this.turboGain.connect(this.masterGain);

        this.turboOsc.start();
      }
    }
  }

  /**
   * Interactive Rev / Accelerate Engine
   * Smoothly revs engine up to target RPM and decelerates with overrun exhaust crackles
   */
  public revEngine(targetRatio: number = 0.88): void {
    if (!this.isRunning && !this.isStarting) {
      if (this.activeCar) {
        this.startEngine(this.activeCar);
      }
      return;
    }

    this.isRevving = true;
    triggerHaptic('rev');

    const target = this.idleRpm + (this.redlineRpm - this.idleRpm) * targetRatio;
    this.targetRpm = target;

    // Overrun crackle effect when throttle drops after peak
    setTimeout(() => {
      this.targetRpm = this.idleRpm;
      this.isRevving = false;
      this.playExhaustCrackles();
    }, 1400);
  }

  /**
   * Authentic overrun exhaust crackles & pops on deceleration
   */
  private playExhaustCrackles(): void {
    if (!this.ctx || !this.masterGain || this.activeProfile === 'electric_flux') return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Wastegate blow-off hiss for V8 Turbo
    if (this.activeProfile === 'v8_turbo') {
      const hissBuf = ctx.createBuffer(1, ctx.sampleRate * 0.45, ctx.sampleRate);
      const data = hissBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
      }
      const hissSource = ctx.createBufferSource();
      hissSource.buffer = hissBuf;
      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = 'bandpass';
      hissFilter.frequency.setValueAtTime(3600, now);
      hissFilter.Q.setValueAtTime(3.0, now);

      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0.3, now);
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      hissSource.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(this.masterGain);
      hissSource.start(now);
    }

    // 2-4 Pop-and-Bang Crackles
    const popCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < popCount; i++) {
      const popTime = now + 0.15 + i * (0.08 + Math.random() * 0.12);
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();

      popOsc.type = 'square';
      popOsc.frequency.setValueAtTime(60 + Math.random() * 80, popTime);
      popGain.gain.setValueAtTime(0.32, popTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.05);

      popOsc.connect(popGain);
      popGain.connect(this.masterGain);

      popOsc.start(popTime);
      popOsc.stop(popTime + 0.06);
    }
  }

  /**
   * Continuous Telemetry & Frequency Update Loop
   */
  private startTelemetryLoop(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const update = () => {
      if (!this.isRunning) return;

      // Smooth RPM interpolation
      const diff = this.targetRpm - this.currentRpm;
      const rate = diff > 0 ? 0.085 : 0.045; // Fast acceleration, gradual engine-braking decel
      this.currentRpm += diff * rate;

      // Small natural idle vibration wobble
      if (Math.abs(diff) < 20) {
        this.currentRpm = this.idleRpm + (Math.sin(Date.now() * 0.015) * 22);
      }

      this.currentRpm = Math.max(0, Math.min(this.maxRpm, this.currentRpm));

      // Calculate Boost PSI for turbo
      const rpmRatio = (this.currentRpm - this.idleRpm) / (this.redlineRpm - this.idleRpm);
      this.boostPressurePsi = Math.max(0, parseFloat((rpmRatio * 28.5).toFixed(1)));

      // Update Audio Nodes Realtime
      this.applyAcousticParameters();

      this.notifyTelemetry();
      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  /**
   * Map Engine RPM to Oscillator Pitch, Filter Frequencies, and Boost Whistle
   */
  private applyAcousticParameters(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const rpm = this.currentRpm;

    if (this.activeProfile === 'electric_flux') {
      // Electric Axial Flux Inverter frequencies
      const baseFreq = 80 + (rpm / this.maxRpm) * 2800;
      if (this.electricOsc1) this.electricOsc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      if (this.electricOsc2) this.electricOsc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
      if (this.mainFilter) {
        this.mainFilter.frequency.setValueAtTime(Math.min(12000, baseFreq * 2.2), ctx.currentTime);
      }
      return;
    }

    // Combustion RPM -> Cylinder Firing Frequency
    // 4-Stroke Engine: (RPM / 60) * (Cylinders / 2)
    const numCylinders = this.activeProfile === 'v12' ? 12 : 8;
    const baseCylinderFreq = (rpm / 60) * (numCylinders / 2);

    const harmonicMultipliers =
      this.activeProfile === 'v12'
        ? [1.0, 1.5, 2.0, 3.0, 6.0]
        : [0.8, 1.0, 2.0, 3.5];

    this.harmonicOscs.forEach((osc, idx) => {
      const mult = harmonicMultipliers[idx] || 1;
      const freq = Math.max(20, baseCylinderFreq * mult);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
    });

    // Dynamic Filter Opening with RPM (Exhaust roar becomes brighter and louder)
    if (this.mainFilter) {
      const filterFreq = 900 + (rpm / this.maxRpm) * 4500;
      this.mainFilter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
    }

    // Turbo Spool Whistle & Air Volume
    if (this.activeProfile === 'v8_turbo' && this.turboOsc && this.turboGain && this.turboFilter) {
      const turboPitch = 2200 + (rpm / this.maxRpm) * 3200;
      const turboVolume = Math.pow(Math.max(0, (rpm - 2000) / (this.redlineRpm - 2000)), 1.5) * 0.18;
      this.turboOsc.frequency.setValueAtTime(turboPitch, ctx.currentTime);
      this.turboFilter.frequency.setValueAtTime(turboPitch, ctx.currentTime);
      this.turboGain.gain.setValueAtTime(turboVolume, ctx.currentTime);
    }
  }

  /**
   * Stop Engine & Clean shutdown
   */
  public stopEngine(): void {
    if (this.ctx && this.masterGain && this.isRunning) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    }

    setTimeout(() => {
      this.stopEngineNodes();
      this.isRunning = false;
      this.isStarting = false;
      this.isRevving = false;
      this.currentRpm = 0;
      this.targetRpm = 0;
      this.notifyTelemetry();
    }, 600);
  }

  private stopEngineNodes(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.harmonicOscs.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {}
    });
    this.harmonicOscs = [];
    this.harmonicGains = [];

    if (this.turboOsc) {
      try {
        this.turboOsc.stop();
        this.turboOsc.disconnect();
      } catch {}
      this.turboOsc = null;
    }

    if (this.electricOsc1) {
      try {
        this.electricOsc1.stop();
        this.electricOsc1.disconnect();
      } catch {}
      this.electricOsc1 = null;
    }

    if (this.electricOsc2) {
      try {
        this.electricOsc2.stop();
        this.electricOsc2.disconnect();
      } catch {}
      this.electricOsc2 = null;
    }
  }

  public getTelemetry(): EngineTelemetry {
    return {
      isRunning: this.isRunning,
      isStarting: this.isStarting,
      isRevving: this.isRevving,
      currentRpm: Math.round(this.currentRpm),
      idleRpm: this.idleRpm,
      maxRpm: this.maxRpm,
      redlineRpm: this.redlineRpm,
      profileName: this.getProfileDisplayName(this.activeProfile),
      powertrainType: this.activeProfile,
      boostPressurePsi: this.boostPressurePsi,
    };
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener(this.getTelemetry());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyTelemetry(): void {
    const data = this.getTelemetry();
    this.listeners.forEach((l) => l(data));
  }
}

// Global Singleton Instance
export const audioEngine = new AudioEngineController();
