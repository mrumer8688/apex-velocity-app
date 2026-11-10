import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface CarAudioMetadata {
  id: string;
  category?: string;
  name?: string;
  subtitle?: string;
  power?: string;
  specs?: {
    engine?: string;
  };
}

interface AudioContextType {
  isEngineSoundOn: boolean;
  toggleEngineSound: () => void;
  volume: number;
  setVolume: (v: number) => void;
  // Car engine rev sound integration
  playCarRevSound: (car: CarAudioMetadata) => void;
  stopCarRevSound: () => void;
  isRevving: boolean;
  revvingCarId: string | null;
  // Backward compatibility
  isPlaying: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMusic: () => void;
  resumeMusic: () => void;
  stopMusic: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isEngineSoundOn: false,
  toggleEngineSound: () => {},
  volume: 0.6,
  setVolume: () => {},
  playCarRevSound: () => {},
  stopCarRevSound: () => {},
  isRevving: false,
  revvingCarId: null,
  isPlaying: false,
  isMuted: true,
  toggleMute: () => {},
  mute: () => {},
  unmute: () => {},
  toggleMusic: () => {},
  resumeMusic: () => {},
  stopMusic: () => {},
});

// Helper for soft-clipping saturation curve for realistic exhaust growl
function createDistortionCurve(amount: number = 22, samples: number = 22050): Float32Array {
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEngineSoundOn, setIsEngineSoundOn] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [revvingCarId, setRevvingCarId] = useState<string | null>(null);

  // Web Audio API refs for procedural engine rumble
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const engineNodesRef = useRef<{
    subOsc: OscillatorNode;
    camOsc: OscillatorNode;
    airFilter: BiquadFilterNode;
    noiseGain: GainNode;
    lfo: OscillatorNode;
  } | null>(null);

  // Audio element fallback/layer for authentic background supercar recording
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Active car rev synthesizer nodes ref
  const activeRevRef = useRef<{
    stop: () => void;
    carId: string;
    timeoutId: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  // Helper to safely get or initialize the Web Audio Context
  const getOrCreateAudioContext = useCallback((): AudioContext | null => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Initialize or resume engine sound synthesizer (background idle roar)
  const startEngineSound = useCallback(async () => {
    try {
      // 1. Audio Element loop using the user uploaded supercar engine sound
      if (!audioElRef.current) {
        const audio = new Audio('/audio/apex-engine-sound.mp3');
        audio.loop = true;
        audio.volume = volume * 0.7;
        audioElRef.current = audio;
      } else {
        audioElRef.current.volume = volume * 0.7;
      }

      const playPromise = audioElRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser requires gesture or file not supported
        });
      }

      // 2. Web Audio API procedural V8/V10 mechanical engine roar & rumble
      const ctx = getOrCreateAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Stop previous procedural nodes if any
      if (engineNodesRef.current) {
        try {
          engineNodesRef.current.subOsc.stop();
          engineNodesRef.current.camOsc.stop();
          engineNodesRef.current.lfo.stop();
        } catch {
          // Ignore
        }
        engineNodesRef.current = null;
      }

      // Master Gain for smooth fade-in
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, volume * 0.28),
        ctx.currentTime + 0.4
      );
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Sub-bass exhaust rumble oscillator (36 Hz deep idle pulse)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(36, ctx.currentTime);

      // Cam / cylinder harmonic oscillator (72 Hz firing pulse)
      const camOsc = ctx.createOscillator();
      camOsc.type = 'triangle';
      camOsc.frequency.setValueAtTime(72, ctx.currentTime);

      // Low frequency oscillator for RPM idle rhythm modulation (around 1.8 Hz subtle flutter)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(1.8, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(4, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(subOsc.frequency);
      lfoGain.connect(camOsc.frequency);

      // Lowpass resonant filter simulating exhaust pipes and engine manifold
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'lowpass';
      airFilter.frequency.setValueAtTime(240, ctx.currentTime);
      airFilter.Q.setValueAtTime(3.5, ctx.currentTime);

      // White/pink noise buffer for exhaust hiss / turbo intake airflow
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(620, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.8, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      // Connect oscillators through filter into master gain
      subOsc.connect(airFilter);
      camOsc.connect(airFilter);
      airFilter.connect(masterGain);

      subOsc.start();
      camOsc.start();
      lfo.start();
      whiteNoise.start();

      engineNodesRef.current = {
        subOsc,
        camOsc,
        airFilter,
        noiseGain,
        lfo,
      };
    } catch (err) {
      console.warn('Audio start failed or blocked:', err);
    }
  }, [volume, getOrCreateAudioContext]);

  // Stop engine sound with smooth fade out
  const stopEngineSound = useCallback(() => {
    // Fade out audio element
    if (audioElRef.current) {
      try {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
      } catch {
        // Ignore
      }
    }

    // Fade out Web Audio master gain smoothly
    if (audioCtxRef.current && masterGainRef.current) {
      try {
        const ctx = audioCtxRef.current;
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, ctx.currentTime);
        masterGainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        setTimeout(() => {
          if (engineNodesRef.current) {
            try {
              engineNodesRef.current.subOsc.stop();
              engineNodesRef.current.camOsc.stop();
              engineNodesRef.current.lfo.stop();
            } catch {
              // Ignore
            }
            engineNodesRef.current = null;
          }
        }, 350);
      } catch {
        // Ignore
      }
    }
  }, []);

  // Update volume live
  useEffect(() => {
    if (audioElRef.current && isEngineSoundOn) {
      audioElRef.current.volume = volume * 0.7;
    }
    if (audioCtxRef.current && masterGainRef.current && isEngineSoundOn) {
      masterGainRef.current.gain.setValueAtTime(Math.max(0.001, volume * 0.28), audioCtxRef.current.currentTime);
    }
  }, [volume, isEngineSoundOn]);

  const toggleEngineSound = useCallback(() => {
    setIsEngineSoundOn((prev) => {
      const next = !prev;
      if (next) {
        startEngineSound();
      } else {
        stopEngineSound();
      }
      return next;
    });
  }, [startEngineSound, stopEngineSound]);

  // Duck background idle engine gain during rev
  const duckBackgroundIdle = useCallback((duck: boolean) => {
    if (audioCtxRef.current && masterGainRef.current && isEngineSoundOn) {
      try {
        const ctx = audioCtxRef.current;
        const targetGain = duck ? Math.max(0.001, volume * 0.08) : Math.max(0.001, volume * 0.28);
        masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, ctx.currentTime);
        masterGainRef.current.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.15);
      } catch {
        // Ignore
      }
    }
  }, [volume, isEngineSoundOn]);

  // Stop currently playing car rev cleanly
  const stopCarRevSound = useCallback(() => {
    if (activeRevRef.current) {
      activeRevRef.current.stop();
      if (activeRevRef.current.timeoutId) {
        clearTimeout(activeRevRef.current.timeoutId);
      }
      activeRevRef.current = null;
    }
    setRevvingCarId(null);
    duckBackgroundIdle(false);
  }, [duckBackgroundIdle]);

  // Play bespoke procedural engine rev for specific car model
  const playCarRevSound = useCallback(
    async (car: CarAudioMetadata) => {
      // If already revving this car, ignore to let full rev cycle play
      if (activeRevRef.current && activeRevRef.current.carId === car.id) {
        return;
      }

      // Stop previous rev if active
      if (activeRevRef.current) {
        stopCarRevSound();
      }

      const ctx = getOrCreateAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          // Ignore
        }
      }

      duckBackgroundIdle(true);
      setRevvingCarId(car.id);

      const t0 = ctx.currentTime;
      const effectiveVol = Math.max(0.08, volume);

      // Determine car powertrain profile
      const category = car.category || '';
      const engineStr = (car.specs?.engine || car.subtitle || car.name || '').toLowerCase();
      const isElectric =
        category === 'Electric GT' ||
        category === 'Cyber-Coupe' ||
        engineStr.includes('electric') ||
        engineStr.includes('electromagnetic') ||
        engineStr.includes('magnet');

      const isV12 =
        category === 'Track Edition' ||
        engineStr.includes('v12') ||
        engineStr.includes('stradale') ||
        car.name.toLowerCase().includes('phantom') ||
        car.name.toLowerCase().includes('ferrari');

      const isFlat6 =
        engineStr.includes('flat-6') ||
        car.name.toLowerCase().includes('porsche') ||
        car.name.toLowerCase().includes('gt3');

      // Master rev gain node connected to destination
      const revMasterGain = ctx.createGain();
      revMasterGain.gain.setValueAtTime(0.001, t0);
      revMasterGain.connect(ctx.destination);

      const allNodesToStop: OscillatorNode[] = [];
      const noiseSourcesToStop: AudioBufferSourceNode[] = [];

      let revDuration = 1.45; // seconds

      if (isElectric) {
        // === ELECTRIC HYPERCAR / CYBER GT HIGH-TORQUE TURBINE SPOOL ===
        revDuration = 1.35;

        // Peak volume envelope
        revMasterGain.gain.exponentialRampToValueAtTime(effectiveVol * 0.42, t0 + 0.18);
        revMasterGain.gain.setValueAtTime(effectiveVol * 0.42, t0 + 0.7);
        revMasterGain.gain.exponentialRampToValueAtTime(0.0001, t0 + revDuration);

        // Sub-bass electromagnetic torque pulse
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(55, t0);
        subOsc.frequency.exponentialRampToValueAtTime(140, t0 + 0.4);
        subOsc.frequency.exponentialRampToValueAtTime(45, t0 + revDuration);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.3, t0);
        subOsc.connect(subGain);
        subGain.connect(revMasterGain);
        subOsc.start(t0);
        allNodesToStop.push(subOsc);

        // Stator coil high-frequency flux whine
        const whineOsc1 = ctx.createOscillator();
        whineOsc1.type = 'triangle';
        whineOsc1.frequency.setValueAtTime(160, t0);
        whineOsc1.frequency.exponentialRampToValueAtTime(760, t0 + 0.45);
        whineOsc1.frequency.exponentialRampToValueAtTime(840, t0 + 0.7);
        whineOsc1.frequency.exponentialRampToValueAtTime(220, t0 + revDuration);

        const whineOsc2 = ctx.createOscillator();
        whineOsc2.type = 'sine';
        whineOsc2.frequency.setValueAtTime(320, t0);
        whineOsc2.frequency.exponentialRampToValueAtTime(1520, t0 + 0.45);
        whineOsc2.frequency.exponentialRampToValueAtTime(440, t0 + revDuration);

        const statorFilter = ctx.createBiquadFilter();
        statorFilter.type = 'bandpass';
        statorFilter.frequency.setValueAtTime(300, t0);
        statorFilter.frequency.exponentialRampToValueAtTime(1800, t0 + 0.5);
        statorFilter.frequency.exponentialRampToValueAtTime(400, t0 + revDuration);
        statorFilter.Q.setValueAtTime(4.2, t0);

        whineOsc1.connect(statorFilter);
        whineOsc2.connect(statorFilter);
        statorFilter.connect(revMasterGain);

        whineOsc1.start(t0);
        whineOsc2.start(t0);
        allNodesToStop.push(whineOsc1, whineOsc2);
      } else {
        // === COMBUSTION SUPERCARS (V8 / V10 / V12 / FLAT-6) ===
        revDuration = 1.55;

        // Pitch profile setup
        let idleFreq = 88;
        let blipFreq = 260;
        let peakFreq = 540;
        let settleFreq = 95;
        let filterPeak = 2800;

        if (isV12) {
          // Screaming high-pitch V12 symphony
          idleFreq = 120;
          blipFreq = 340;
          peakFreq = 680;
          settleFreq = 125;
          filterPeak = 3400;
        } else if (isFlat6) {
          // Raspy dry Flat-6 boxer punch
          idleFreq = 100;
          blipFreq = 310;
          peakFreq = 590;
          settleFreq = 105;
          filterPeak = 3000;
        }

        // Master Gain Envelope
        revMasterGain.gain.exponentialRampToValueAtTime(effectiveVol * 0.48, t0 + 0.12);
        revMasterGain.gain.setValueAtTime(effectiveVol * 0.48, t0 + 0.65);
        revMasterGain.gain.exponentialRampToValueAtTime(0.0001, t0 + revDuration);

        // Primary Cylinder Firing Oscillator (Sawtooth)
        const primaryOsc = ctx.createOscillator();
        primaryOsc.type = 'sawtooth';
        primaryOsc.frequency.setValueAtTime(idleFreq, t0);
        // Initial aggressive throttle blip
        primaryOsc.frequency.exponentialRampToValueAtTime(blipFreq, t0 + 0.14);
        // Slight throttle dip
        primaryOsc.frequency.exponentialRampToValueAtTime(blipFreq * 0.88, t0 + 0.24);
        // Peak redline rev surge
        primaryOsc.frequency.exponentialRampToValueAtTime(peakFreq, t0 + 0.52);
        // Deceleration overrun
        primaryOsc.frequency.exponentialRampToValueAtTime(peakFreq * 0.55, t0 + 0.85);
        // Return to idle
        primaryOsc.frequency.exponentialRampToValueAtTime(settleFreq, t0 + revDuration);

        // Sub-harmonic oscillator (Triangle, 0.5x frequency) for deep chest punch
        const subOsc = ctx.createOscillator();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(idleFreq * 0.5, t0);
        subOsc.frequency.exponentialRampToValueAtTime(peakFreq * 0.5, t0 + 0.52);
        subOsc.frequency.exponentialRampToValueAtTime(settleFreq * 0.5, t0 + revDuration);

        // Harmonic mechanical cam & valve oscillator
        const camOsc = ctx.createOscillator();
        camOsc.type = 'square';
        camOsc.frequency.setValueAtTime(idleFreq * 2, t0);
        camOsc.frequency.exponentialRampToValueAtTime(peakFreq * 1.5, t0 + 0.52);
        camOsc.frequency.exponentialRampToValueAtTime(settleFreq * 2, t0 + revDuration);

        const camGain = ctx.createGain();
        camGain.gain.setValueAtTime(0.08, t0);
        camOsc.connect(camGain);

        // Soft-clipping distortion for mechanical exhaust rasp
        const distortion = ctx.createWaveShaper();
        distortion.curve = createDistortionCurve(isV12 ? 30 : 22) as unknown as Float32Array;
        distortion.oversample = '2x';

        // Tuned Exhaust Manifold & Resonant Filter
        const exhaustFilter = ctx.createBiquadFilter();
        exhaustFilter.type = 'lowpass';
        exhaustFilter.frequency.setValueAtTime(320, t0);
        exhaustFilter.frequency.exponentialRampToValueAtTime(filterPeak, t0 + 0.52);
        exhaustFilter.frequency.exponentialRampToValueAtTime(380, t0 + revDuration);
        exhaustFilter.Q.setValueAtTime(isFlat6 ? 3.8 : 3.0, t0);

        primaryOsc.connect(distortion);
        subOsc.connect(distortion);
        camGain.connect(distortion);

        distortion.connect(exhaustFilter);
        exhaustFilter.connect(revMasterGain);

        primaryOsc.start(t0);
        subOsc.start(t0);
        camOsc.start(t0);
        allNodesToStop.push(primaryOsc, subOsc, camOsc);

        // Turbocharger / Induction Roar (Shaped Noise)
        try {
          const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * revDuration), ctx.sampleRate);
          const channel = noiseBuffer.getChannelData(0);
          for (let i = 0; i < channel.length; i++) {
            channel[i] = Math.random() * 2 - 1;
          }

          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuffer;

          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(700, t0);
          noiseFilter.frequency.exponentialRampToValueAtTime(2400, t0 + 0.52);
          noiseFilter.frequency.exponentialRampToValueAtTime(600, t0 + revDuration);
          noiseFilter.Q.setValueAtTime(2.2, t0);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.001, t0);
          noiseGain.gain.exponentialRampToValueAtTime(0.035, t0 + 0.45);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + revDuration);

          noiseSrc.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(revMasterGain);

          noiseSrc.start(t0);
          noiseSourcesToStop.push(noiseSrc);
        } catch {
          // Ignore noise buffer issues if any
        }
      }

      // Safe stop function for this rev instance
      const stopInstance = () => {
        try {
          const now = ctx.currentTime;
          revMasterGain.gain.cancelScheduledValues(now);
          revMasterGain.gain.setValueAtTime(revMasterGain.gain.value, now);
          revMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.12);

          setTimeout(() => {
            allNodesToStop.forEach((osc) => {
              try {
                osc.stop();
                osc.disconnect();
              } catch {
                // Ignore
              }
            });
            noiseSourcesToStop.forEach((src) => {
              try {
                src.stop();
                src.disconnect();
              } catch {
                // Ignore
              }
            });
            try {
              revMasterGain.disconnect();
            } catch {
              // Ignore
            }
          }, 150);
        } catch {
          // Ignore
        }
      };

      // Set timeout to cleanly reset state when rev cycle concludes
      const timeoutId = setTimeout(() => {
        stopInstance();
        setRevvingCarId((prev) => (prev === car.id ? null : prev));
        duckBackgroundIdle(false);
        if (activeRevRef.current?.carId === car.id) {
          activeRevRef.current = null;
        }
      }, revDuration * 1000);

      activeRevRef.current = {
        stop: stopInstance,
        carId: car.id,
        timeoutId,
      };
    },
    [volume, getOrCreateAudioContext, duckBackgroundIdle, stopCarRevSound]
  );

  // Clean up all audio on unmount
  useEffect(() => {
    return () => {
      stopEngineSound();
      stopCarRevSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopEngineSound, stopCarRevSound]);

  return (
    <AudioContext.Provider
      value={{
        isEngineSoundOn,
        toggleEngineSound,
        volume,
        setVolume,
        playCarRevSound,
        stopCarRevSound,
        isRevving: revvingCarId !== null,
        revvingCarId,
        isPlaying: isEngineSoundOn,
        isMuted: !isEngineSoundOn,
        toggleMute: toggleEngineSound,
        mute: () => {
          if (isEngineSoundOn) toggleEngineSound();
        },
        unmute: () => {
          if (!isEngineSoundOn) toggleEngineSound();
        },
        toggleMusic: toggleEngineSound,
        resumeMusic: () => {
          if (!isEngineSoundOn) toggleEngineSound();
        },
        stopMusic: () => {
          if (isEngineSoundOn) toggleEngineSound();
        },
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
