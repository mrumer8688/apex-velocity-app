import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Gauge,
  Scale,
  Camera,
  RotateCcw,
  MessageSquare,
  ChevronRight,
  Check,
} from 'lucide-react';
import { CARS_DATA } from '../data/cars';
import { GLOBAL_FACILITIES } from '../data/globalPresence';
import { CarModel } from '../types';

interface VoiceConciergeProps {
  onSelectCar?: (car: CarModel) => void;
  onOpenTestDrive?: (carId?: string) => void;
  onOpenCompare?: (carA?: CarModel, carB?: CarModel) => void;
  onOpenAR?: (car?: CarModel) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  carHighlight?: CarModel;
}

export const VoiceConcierge: React.FC<VoiceConciergeProps> = ({
  onSelectCar,
  onOpenTestDrive,
  onOpenCompare,
  onOpenAR,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');

  // Audio Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Web Speech Recognition Ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Chat message history
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'concierge',
      text: 'Good day. I am your Apex Velocity Voice Assistant. Speak to query vehicle telemetry, navigate sections, or command our 3D and AR systems.',
    },
  ]);

  // Suggested Voice Commands
  const SUGGESTED_PROMPTS = [
    'What is the top speed of Chronos V12?',
    'Show me the Valkyrie GT in AR',
    'Compare Chronos and Valkyrie',
    'Take me to the 360 Atelier',
    'Tell me about global service hubs',
    'Book a test drive',
  ];

  // Initialize Speech Synthesis & Voice Output
  const speakText = useCallback(
    (text: string) => {
      if (voiceMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.98;

      // Select a refined English voice if available
      const voices = window.speechSynthesis.getVoices();
      const luxuryVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Premium') ||
            v.name.includes('Google UK English Male') ||
            v.name.includes('Daniel') ||
            v.name.includes('Serena'))
      );
      if (luxuryVoice) utterance.voice = luxuryVoice;

      window.speechSynthesis.speak(utterance);
    },
    [voiceMuted]
  );

  // Process Natural Language Voice Query
  const processVoiceCommand = useCallback(
    (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return;

      // Add user message to history
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: query,
      };
      setMessages((prev) => [...prev, userMsg]);
      setTranscript('');

      let answer = '';
      let action: { label: string; onClick: () => void } | undefined = undefined;
      let matchedCar: CarModel | undefined = undefined;

      // 1. Navigation Commands
      if (q.includes('cars') || q.includes('fleet') || q.includes('collection') || q.includes('models')) {
        answer = 'Navigating to the Apex Fleet Showcase. Explore our flagship models engineered for maximum velocity.';
        const el = document.getElementById('cars');
        el?.scrollIntoView({ behavior: 'smooth' });
        action = {
          label: 'View Fleet Showcase',
          onClick: () => document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' }),
        };
      } else if (
        q.includes('atelier') ||
        q.includes('configurator') ||
        q.includes('customize') ||
        q.includes('paint') ||
        q.includes('interior') ||
        q.includes('360')
      ) {
        answer = 'Navigating to our hypercar collection. Select any vehicle to explore 3D visualizers, specs, and acoustic engine profiles.';
        const el = document.getElementById('cars');
        el?.scrollIntoView({ behavior: 'smooth' });
        action = {
          label: 'Explore Fleet Collection',
          onClick: () => document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' }),
        };
      } else if (
        q.includes('location') ||
        q.includes('showroom') ||
        q.includes('service') ||
        q.includes('track') ||
        q.includes('global') ||
        q.includes('presence')
      ) {
        answer = 'Navigating to our Global Presence Network. Apex Velocity operates 19 world hubs across Europe, the Americas, Asia, and the Middle East with 24/7 Flying Doctor air-freight service.';
        const el = document.getElementById('global');
        el?.scrollIntoView({ behavior: 'smooth' });
        action = {
          label: 'View Global Network Map',
          onClick: () => document.getElementById('global')?.scrollIntoView({ behavior: 'smooth' }),
        };
      } else if (
        q.includes('pulse') ||
        q.includes('community') ||
        q.includes('social') ||
        q.includes('owner') ||
        q.includes('feed')
      ) {
        answer = 'Navigating to Community Pulse. Here is our live authenticated stream of owner deliveries, track days, and midnight runs.';
        const el = document.getElementById('pulse');
        el?.scrollIntoView({ behavior: 'smooth' });
        action = {
          label: 'View Community Pulse',
          onClick: () => document.getElementById('pulse')?.scrollIntoView({ behavior: 'smooth' }),
        };
      } else if (q.includes('test drive') || q.includes('book') || q.includes('schedule') || q.includes('reserve')) {
        answer = 'Opening private test drive and concierge reservation. Our liaisons will coordinate your private track session.';
        onOpenTestDrive?.();
        action = {
          label: 'Open Test Drive Reservation',
          onClick: () => onOpenTestDrive?.(),
        };
      } else if (q.includes('compare')) {
        answer = 'Opening the head-to-head Vehicle Comparison benchmark. You can analyze acceleration, top speed, and power-to-weight ratios side by side.';
        // Check if specific cars were requested to compare
        const carA = CARS_DATA.find((c) => q.includes(c.name.toLowerCase().split(' ')[1] || '')) || CARS_DATA[0];
        const carB = CARS_DATA.find((c) => c.id !== carA.id) || CARS_DATA[1];
        onOpenCompare?.(carA, carB);
        action = {
          label: 'Launch Comparison Benchmark',
          onClick: () => onOpenCompare?.(carA, carB),
        };
      } else if (q.includes('ar') || q.includes('augmented') || q.includes('camera') || q.includes('environment')) {
        const targetCar = CARS_DATA.find((c) => {
          const parts = c.name.toLowerCase().split(' ');
          return parts.some((p) => p.length >= 3 && q.includes(p));
        }) || CARS_DATA[0];

        answer = `Launching Camera Augmented Reality viewer for the ${targetCar.name}. You can place and inspect a photorealistic 1:1 scale virtual hypercar in your actual physical environment.`;
        onOpenAR?.(targetCar);
        action = {
          label: `Open ${targetCar.name} in AR`,
          onClick: () => onOpenAR?.(targetCar),
        };
      }

      // 2. Specific Car Telemetry & Specs Queries
      else if (q.includes('chronos') || q.includes('v12')) {
        matchedCar = CARS_DATA[0];
        answer = `The Apex Chronos V12 is our flagship hypercar. It delivers 1,450 horsepower, accelerates 0 to 60 in ${matchedCar.acceleration}, and achieves a top speed of ${matchedCar.topSpeed}. Starting at ${matchedCar.price}.`;
        action = {
          label: 'Inspect Chronos V12 Spec',
          onClick: () => onSelectCar?.(matchedCar!),
        };
      } else if (q.includes('valkyrie')) {
        matchedCar = CARS_DATA[1];
        answer = `The Apex Valkyrie GT is our extreme track-focused weapon. Developing 1,600 horsepower, it achieves 0 to 60 in ${matchedCar.acceleration} with ${matchedCar.topSpeed} top speed and active ground-effect downforce.`;
        action = {
          label: 'Inspect Valkyrie GT Spec',
          onClick: () => onSelectCar?.(matchedCar!),
        };
      } else if (q.includes('spectre')) {
        matchedCar = CARS_DATA[2];
        answer = `The Apex Spectre GT is an all-electric grand tourer. Quad electromagnetic motors produce 1,520 horsepower with 420 miles of range and 800-volt solid-state charging architecture.`;
        action = {
          label: 'Inspect Spectre GT Spec',
          onClick: () => onSelectCar?.(matchedCar!),
        };
      } else if (q.includes('fastest') || q.includes('speed record')) {
        matchedCar = CARS_DATA[0];
        answer = `The fastest road car in our collection is the Apex Chronos V12 and Valkyrie GT, both clocking over 260 miles per hour with sub-2-second acceleration.`;
        action = {
          label: 'Compare Top Speeds',
          onClick: () => onOpenCompare?.(CARS_DATA[0], CARS_DATA[1]),
        };
      } else if (q.includes('electric') || q.includes('battery') || q.includes('ev')) {
        matchedCar = CARS_DATA[2];
        answer = `Our flagship electric vehicle is the Apex Spectre GT, delivering 1,520 horsepower with instantaneous torque vectoring and zero emissions.`;
        action = {
          label: 'View Spectre Electric Spec',
          onClick: () => onSelectCar?.(matchedCar!),
        };
      } else if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
        answer = `Apex hypercar commissions range from $1,650,000 for the Cyber-Coupe to $3,200,000 for the track-ready Valkyrie GT. Full performance specifications and reserve options are available for each vehicle.`;
        action = {
          label: 'Explore Fleet Specifications',
          onClick: () => document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' }),
        };
      } else {
        answer = `Understood. Apex Velocity engineering specializes in ultra-performance hypercars, hybrid V12 powertrains, and bespoke aerodynamic architecture. How may I assist your commissioning journey?`;
        action = {
          label: 'Browse Complete Collection',
          onClick: () => document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' }),
        };
      }

      // Add Concierge answer to history
      const conciergeMsg: Message = {
        id: `concierge-${Date.now()}`,
        sender: 'concierge',
        text: answer,
        action,
        carHighlight: matchedCar,
      };

      setMessages((prev) => [...prev, conciergeMsg]);
      speakText(answer);
    },
    [onSelectCar, onOpenTestDrive, onOpenCompare, onOpenAR, speakText]
  );

  // Initialize Microphone & Web Audio Frequency Visualizer
  const startAudioVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);
      setPermissionError(null);

      // Web Audio API Pipeline
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Canvas Rendering Loop
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

          // Futuristic gradient color
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#00E5FF');
          gradient.addColorStop(0.6, '#FF5A1F');
          gradient.addColorStop(1, '#FFFFFF');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

          x += barWidth;
        }

        animFrameRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();
      return true;
    } catch (err: unknown) {
      console.warn('Microphone access denied or unavailable:', err);
      setHasMicPermission(false);
      setPermissionError(
        err instanceof Error ? err.message : 'Microphone access denied. Please grant microphone permissions.'
      );
      return false;
    }
  }, []);

  const stopAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Initialize Web Speech Recognition
  const startListening = useCallback(async () => {
    setIsListening(true);
    setTranscript('');

    const micOk = await startAudioVisualizer();
    if (!micOk) {
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          processVoiceCommand(currentTranscript);
          stopListening();
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioVisualizer();
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        // Recognition already running or error
      }
    } else {
      // Fallback if browser lacks SpeechRecognition: Simulate listen duration
      setTimeout(() => {
        if (transcript) {
          processVoiceCommand(transcript);
        }
        stopListening();
      }, 4000);
    }
  }, [startAudioVisualizer, processVoiceCommand]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    stopAudioVisualizer();
  }, [stopAudioVisualizer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopListening]);

  // Global event listener for external open triggers (e.g. Navbar)
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      startListening();
    };
    window.addEventListener('open-voice-concierge', handleOpen);
    return () => window.removeEventListener('open-voice-concierge', handleOpen);
  }, [startListening]);

  // Escape key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        stopListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stopListening]);

  return (
    <>
      {/* Floating Luxury Voice Concierge Trigger Beacon (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Pulsating Voice Beacon Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              startListening();
            } else {
              stopListening();
            }
          }}
          className={`relative group p-3.5 sm:p-4 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isListening
              ? 'bg-[#FF5A1F] border-white text-black shadow-[0_0_30px_#FF5A1F] scale-110'
              : 'bg-black/85 border-white/20 text-white hover:border-[#FF5A1F] hover:text-[#FF5A1F]'
          }`}
          title="Apex Voice Assistant (Click to Speak)"
          aria-label="Voice Assistant"
        >
          {/* Animated ping ring when listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-[#FF5A1F] animate-ping opacity-70 pointer-events-none" />
          )}

          <div className="relative z-10 flex items-center gap-2">
            <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider hidden md:inline">
              {isListening ? 'Listening...' : 'Voice Assistant'}
            </span>
          </div>
        </button>
      </div>

      {/* Full Luxury Voice Concierge HUD Modal */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false);
                stopListening();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl glass-card rounded-3xl border border-white/20 bg-black/95 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 flex items-center justify-center text-[#FF5A1F]">
                    <Mic className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                        // LIVE MICROPHONE TELEMETRY INTERFACE
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black font-display uppercase tracking-wider text-white">
                      Apex Voice Assistant
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Voice audio toggle */}
                  <button
                    type="button"
                    onClick={() => setVoiceMuted(!voiceMuted)}
                    className="p-2 rounded-xl glass-panel border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title={voiceMuted ? 'Unmute Voice Assistant' : 'Mute Voice Assistant'}
                  >
                    {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00E5FF]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      stopListening();
                    }}
                    className="p-2 rounded-xl glass-panel border border-white/10 text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
                    aria-label="Close Voice Assistant"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-Time Audio Frequency Waveform Visualizer & Microphone Stage */}
              <div className="p-6 bg-gradient-to-b from-[#0a0a0f] to-[#040406] border-b border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                {/* Visualizer Canvas */}
                <div className="relative w-full h-16 sm:h-20 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={80}
                    className="w-full max-w-md h-full select-none"
                  />
                  {!isListening && (
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono text-white/40">
                      Tap the microphone below to begin voice command
                    </div>
                  )}
                </div>

                {/* Big Center Microphone Orb Button */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    className={`relative p-5 rounded-full border transition-all duration-300 cursor-pointer shadow-2xl ${
                      isListening
                        ? 'bg-[#FF5A1F] border-white text-black shadow-[0_0_35px_#FF5A1F] scale-110'
                        : 'bg-white/10 border-white/20 text-white hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/20'
                    }`}
                  >
                    {isListening ? (
                      <Mic className="w-7 h-7 animate-pulse text-black" />
                    ) : (
                      <Mic className="w-7 h-7 text-[#FF5A1F]" />
                    )}
                  </button>

                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                    {isListening ? (
                      <span className="text-[#FF5A1F] animate-pulse">● Listening for voice command...</span>
                    ) : (
                      <span>Tap To Speak</span>
                    )}
                  </span>
                </div>

                {/* Live Transcript Display */}
                {transcript && (
                  <div className="w-full p-3 rounded-2xl bg-white/5 border border-[#00E5FF]/40 text-xs font-mono text-white">
                    <span className="text-[10px] text-[#00E5FF] uppercase block mb-1">Live Transcribing:</span>
                    <p className="text-sm font-medium">"{transcript}"</p>
                  </div>
                )}

                {/* Microphone Permission Warning if Denied */}
                {permissionError && (
                  <div className="p-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
                    {permissionError}
                  </div>
                )}
              </div>

              {/* Chat & Response History Log */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 max-h-64 font-sans text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#FF5A1F] text-black font-medium'
                          : 'glass-panel border border-white/15 text-white/90 bg-white/[0.04]'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Interactive Action Button for Concierge Answers */}
                      {msg.action && (
                        <div className="mt-2.5 pt-2 border-t border-white/15">
                          <button
                            type="button"
                            onClick={() => {
                              msg.action?.onClick();
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-mono text-[11px] font-bold uppercase transition-all cursor-pointer shadow-sm"
                          >
                            <span>{msg.action.label}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Voice Commands Bar */}
              <div className="p-3 sm:p-4 border-t border-white/10 bg-white/[0.02] space-y-2">
                <span className="text-[10px] font-mono uppercase text-white/40 block">
                  Quick Voice Prompts (Tap or Say):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => processVoiceCommand(prompt)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-mono text-white/70 hover:text-white bg-white/5 hover:bg-[#FF5A1F]/15 border border-white/10 hover:border-[#FF5A1F]/50 shrink-0 transition-all cursor-pointer"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Query Input Option (Microphone fallback & quick typed commands) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (textInput.trim()) {
                    processVoiceCommand(textInput);
                    setTextInput('');
                  }
                }}
                className="p-3 sm:p-4 border-t border-white/10 bg-black/60 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Or type a voice command (e.g. 'Show Valkyrie in AR', 'Top speed of Chronos')..."
                  className="flex-1 bg-white/5 border border-white/15 focus:border-[#FF5A1F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 font-mono outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#ff7743] disabled:opacity-40 disabled:hover:bg-[#FF5A1F] text-black font-mono text-xs font-bold uppercase transition-all cursor-pointer shrink-0"
                >
                  Ask
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
