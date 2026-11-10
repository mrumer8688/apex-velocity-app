import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Sparkles,
  Sliders,
  Compass,
  CheckCircle,
  Eye,
  Layers,
  Zap,
  Gauge,
  Film,
  Flame,
  ArrowRight,
  Disc,
  Radio,
} from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';
import { MagneticButton } from '../components/MagneticButton';
import { triggerHaptic } from '../utils/haptics';

interface CinematicFilmSectionProps {
  onOpenTestDrive?: (carId?: string) => void;
  onNavigateToConfigurator?: () => void;
}

interface VideoChapter {
  id: string;
  time: number;
  label: string;
  tagline: string;
  highlight: string;
}

const VIDEO_CHAPTERS: VideoChapter[] = [
  {
    id: 'ignition',
    time: 0,
    label: '00:00 · SILHOUETTE IGNITION',
    tagline: 'Bi-LED Matrix Laser Beams pierce the darkness and fog',
    highlight: 'Laser Headlights',
  },
  {
    id: 'aero',
    time: 2.8,
    label: '00:03 · AERO PROFILE',
    tagline: 'Overhead track spotlights reveal sculpted carbon contours',
    highlight: 'Monocoque Silhouette',
  },
  {
    id: 'velocity',
    time: 4.8,
    label: '00:05 · AUTOBAHN VELOCITY',
    tagline: 'Nocturnal rolling velocity with glowing full-width rear lightbar',
    highlight: 'Continuous Lightbar',
  },
  {
    id: 'wheels',
    time: 6.8,
    label: '00:07 · KINETIC SPOKE',
    tagline: 'High-RPM forged alloy wheel spin & drilled ceramic discs',
    highlight: 'Carbon Ceramics',
  },
  {
    id: 'studio',
    time: 8.2,
    label: '00:08 · NEON ATELIER',
    tagline: 'Suspended cyan neon light columns reflect off midnight lacquer',
    highlight: 'Atmospheric Studio',
  },
];

export const CinematicFilmSection: React.FC<CinematicFilmSectionProps> = ({
  onOpenTestDrive,
  onNavigateToConfigurator,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showHudOverlay, setShowHudOverlay] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Local asset paths
  const videoSrc = '/assets/aistudio/Creating_car_video_in_dark_20261019000955_7cf71208.mp4';
  const posterSrc = '/assets/aistudio/cinematic_poster.jpg';

  // Controls auto-hide timeout
  const controlsTimeoutRef = useRef<number | null>(null);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  }, [isPlaying]);

  // Attempt autoplay muted on mount (respecting mobile browser policies)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    setIsMuted(true);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Browser requires user gesture
          setIsPlaying(false);
        });
    }

    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Update active chapter based on time
  useEffect(() => {
    const cur = currentTime;
    for (let i = VIDEO_CHAPTERS.length - 1; i >= 0; i--) {
      if (cur >= VIDEO_CHAPTERS[i].time - 0.2) {
        setActiveChapterIndex(i);
        break;
      }
    }
  }, [currentTime]);

  // Play / Pause Toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    triggerHaptic('light');
    setHasUserInteracted(true);

    if (video.paused || video.ended) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          resetControlsTimeout();
        })
        .catch((err) => {
          console.warn('Playback error:', err);
        });
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  }, [resetControlsTimeout]);

  // Mute / Unmute Toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    triggerHaptic('light');
    setHasUserInteracted(true);

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted && video.volume === 0) {
      video.volume = volume || 0.8;
    }
  }, [isMuted, volume]);

  // Volume slider handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      } else if (newVol === 0 && !isMuted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  // Speed selector
  const handleSpeedChange = (speed: number) => {
    triggerHaptic('selection');
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Loop toggle
  const toggleLoop = () => {
    triggerHaptic('light');
    const next = !isLooping;
    setIsLooping(next);
    if (videoRef.current) {
      videoRef.current.loop = next;
    }
  };

  // Time update listener
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const cur = video.currentTime;
    const dur = video.duration || 10;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress((cur / dur) * 100);
  };

  // Seek video from timeline click/drag
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = progressTrackRef.current;
    const video = videoRef.current;
    if (!track || !video || !duration) return;

    const rect = track.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetRatio = clickX / rect.width;
    const targetTime = targetRatio * duration;

    video.currentTime = targetTime;
    setCurrentTime(targetTime);
    setProgress(targetRatio * 100);
    triggerHaptic('selection');
  };

  // Hover over timeline for timestamp preview
  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = progressTrackRef.current;
    if (!track || !duration) return;
    const rect = track.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    setHoverPos(clickX);
    setHoverTime(ratio * duration);
  };

  // Seek to specific chapter
  const seekToChapter = (chapter: VideoChapter, index: number) => {
    const video = videoRef.current;
    if (!video) return;
    triggerHaptic('selection');
    setActiveChapterIndex(index);
    video.currentTime = chapter.time;
    setCurrentTime(chapter.time);
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    triggerHaptic('light');
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Format time utility
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
  };

  const handleConfiguratorClick = () => {
    if (onNavigateToConfigurator) {
      onNavigateToConfigurator();
    } else {
      const el = document.getElementById('cars');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="film"
      className="relative py-24 sm:py-32 bg-[#050505] text-white overflow-hidden select-none"
    >
      {/* Background Parallax Typography & Dynamic Glow */}
      <ParallaxSectionBackground glowColor="orange" accentText="CINEMA" speed={-0.12} />

      {/* Atmospheric Neon & Midnight Glow Orbs */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#00E5FF]/10 via-[#00E5FF]/5 to-transparent blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-bl from-[#FF5A1F]/15 via-[#FF2A00]/8 to-transparent blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none" />

      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-700 ${
          isTheaterMode ? 'max-w-[100vw] px-2 sm:px-4' : 'max-w-7xl'
        }`}
      >
        {/* Section Heading */}
        <div className="flex flex-col items-center">
          <SectionHeading
            eyebrow="APEX CINEMATIC FILM // NOCTURNAL EDITION"
            title="THE MIDNIGHT"
            highlightText="ATELIER"
            subtitle="Witness the raw kinetic spirit of the Apex Taycan E-GT Prototype awakening in the dark. Experience laser illumination, high-speed Autobahn velocity, and neon studio engineering in cinematic 4K."
            centered
          />
        </div>

        {/* Video Cinema Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          ref={containerRef}
          onMouseMove={resetControlsTimeout}
          onMouseEnter={() => setShowControls(true)}
          className={`relative rounded-3xl overflow-hidden border border-white/20 bg-black/90 shadow-[0_20px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-500 group ${
            isFullscreen ? 'rounded-none border-none h-screen w-screen' : ''
          }`}
        >
          {/* Top Video Stage Bar (Zero-Pill Header Metadata) */}
          <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto">
            {/* Left metadata info with clean typographic separators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A1F] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5A1F]" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                  APEX PROTOTYPE REVEAL
                </span>
              </div>
              <span className="text-white/40 hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-mono text-cyan-400 hidden sm:inline">
                4K UHD 60FPS
              </span>
              <span className="text-white/40 hidden md:inline" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-mono text-white/60 hidden md:inline">
                ANAMORPHIC CINE
              </span>
            </div>

            {/* Right Quick Actions (HUD toggle, Theater Mode) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Telemetry HUD Toggle */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowHudOverlay(!showHudOverlay);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                  showHudOverlay
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'bg-black/60 text-white/60 border-white/10 hover:text-white'
                }`}
                title="Toggle Technical HUD Overlay"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">HUD DATA</span>
              </button>

              {/* Theater Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsTheaterMode(!isTheaterMode);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer hidden md:flex items-center gap-1.5 ${
                  isTheaterMode
                    ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border-[#FF5A1F]/50 shadow-[0_0_12px_rgba(255,90,31,0.25)]'
                    : 'bg-black/60 text-white/60 border-white/10 hover:text-white'
                }`}
                title={isTheaterMode ? 'Exit Theater Mode' : 'Wide Theater Mode'}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{isTheaterMode ? 'STANDARD' : 'THEATER'}</span>
              </button>
            </div>
          </div>

          {/* HTML5 Video Element */}
          <div
            className="relative aspect-video w-full bg-black flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              playsInline
              preload="auto"
              loop={isLooping}
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-cover select-none"
            />

            {/* Subtle Vignette & Anamorphic Lens Flare Line */}
            <div className="absolute inset-0 pointer-events-none bg-radial-[circle_at_center,transparent_60%,rgba(0,0,0,0.6)_100%]" />
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent pointer-events-none" />

            {/* Director Telemetry HUD Overlay (When enabled) */}
            <AnimatePresence>
              {showHudOverlay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none p-6 sm:p-8 flex flex-col justify-between"
                >
                  {/* Top-Right Camera Grid Corner Markers */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span>REC [00:{formatTime(currentTime)}]</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/50 tracking-wider">
                        ISO 800 · 1/120s · f/1.9
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-[10px] font-mono text-white/80 uppercase tracking-widest">
                        APEX SKUNKWORKS VAULT 04
                      </div>
                      <div className="text-[10px] font-mono text-[#FF5A1F]">
                        CHASSIS E-GT #001
                      </div>
                    </div>
                  </div>

                  {/* Center Crosshairs */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none opacity-40">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-white" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-white" />
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-[1px] bg-white" />
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-[1px] bg-white" />
                    <div className="absolute inset-2 border border-white/20 rounded-full" />
                  </div>

                  {/* Bottom-Left Live Chapter Indicator */}
                  <div className="flex items-end justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#FF5A1F]">
                        ACTIVE SEQUENCE
                      </div>
                      <div className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white">
                        {VIDEO_CHAPTERS[activeChapterIndex]?.highlight}
                      </div>
                      <div className="text-[11px] font-mono text-white/60">
                        {VIDEO_CHAPTERS[activeChapterIndex]?.tagline}
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-mono text-white/40">POWERTRAIN</div>
                      <div className="text-xs font-mono text-cyan-300 font-semibold">
                        DUAL PERMANENT MAGNET · 934 HP
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Large Floating Center Play / Pause Indicator */}
            <AnimatePresence>
              {(!isPlaying || showControls) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="p-4 sm:p-5 rounded-full bg-black/60 border border-white/25 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] text-white hover:scale-110 hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-all">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unmute Prompt Callout on Initial Autoplay */}
            <AnimatePresence>
              {isMuted && isPlaying && !hasUserInteracted && (
                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="absolute bottom-24 sm:bottom-28 right-6 z-30 px-3.5 py-2 rounded-xl bg-black/80 border border-cyan-400/50 backdrop-blur-md text-cyan-300 text-xs font-mono flex items-center gap-2 hover:bg-cyan-500/20 transition-all cursor-pointer shadow-lg"
                >
                  <VolumeX className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>CLICK TO UNMUTE AUDIO</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Custom Playback Controller Bar */}
          <div
            className={`p-4 sm:p-6 bg-gradient-to-t from-black via-black/90 to-black/40 border-t border-white/10 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}
          >
            {/* Scrubber Timeline Bar */}
            <div className="relative mb-4 group/timeline select-none">
              <div
                ref={progressTrackRef}
                onClick={handleSeek}
                onMouseMove={handleTimelineMouseMove}
                onMouseEnter={() => setIsHoveringTimeline(true)}
                onMouseLeave={() => setIsHoveringTimeline(false)}
                className="relative h-2 sm:h-2.5 bg-white/10 rounded-full cursor-pointer overflow-hidden transition-all group-hover/timeline:h-3.5"
              >
                {/* Buffered fill */}
                <div className="absolute inset-y-0 left-0 w-full bg-white/5" />

                {/* Progress bar with dynamic gradient */}
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF5A1F] via-[#FF8A00] to-cyan-400 rounded-full transition-all duration-75 relative"
                  style={{ width: `${progress}%` }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_#00E5FF] scale-0 group-hover/timeline:scale-100 transition-transform" />
                </div>
              </div>

              {/* Hover Time Tooltip */}
              {isHoveringTimeline && hoverTime !== null && (
                <div
                  className="absolute -top-8 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-cyan-300 pointer-events-none -translate-x-1/2 shadow-lg"
                  style={{ left: `${hoverPos}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}

              {/* Chapter markers on timeline */}
              <div className="absolute inset-0 pointer-events-none flex">
                {VIDEO_CHAPTERS.map((ch) => {
                  const percent = (ch.time / duration) * 100;
                  return (
                    <div
                      key={ch.id}
                      className="absolute top-0 bottom-0 w-[2px] bg-white/30 hover:bg-cyan-400 transition-colors"
                      style={{ left: `${percent}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bottom Row Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left Controls: Play/Pause, Replay, Time */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-[#FF5A1F] transition-all cursor-pointer flex items-center justify-center border border-white/10"
                  aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Restart Video */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      setCurrentTime(0);
                      if (videoRef.current.paused) {
                        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                      }
                    }
                  }}
                  className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Time Display */}
                <div className="text-xs font-mono tabular-nums text-white/80">
                  <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
                  <span className="text-white/30 mx-1">/</span>
                  <span className="text-white/50">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls: Volume, Speed, Looping, Fullscreen */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Volume Slider & Toggle */}
                <div className="flex items-center gap-2 group/volume">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF5A1F]"
                    title="Volume"
                  />
                </div>

                {/* Speed Selector */}
                <div className="hidden sm:flex items-center gap-1 border border-white/15 rounded-lg p-0.5 bg-black/40">
                  {[0.5, 1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                        playbackSpeed === spd
                          ? 'bg-[#FF5A1F] text-white font-bold'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Loop Toggle */}
                <button
                  type="button"
                  onClick={toggleLoop}
                  className={`p-2 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                    isLooping
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'text-white/40 border-transparent hover:text-white'
                  }`}
                  title={isLooping ? 'Looping enabled' : 'Looping disabled'}
                >
                  LOOP
                </button>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Scene Chapters Navigation */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FF5A1F]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                // JUMP TO FILM SEQUENCE
              </span>
            </div>
            <div className="text-xs font-mono text-white/50 hidden sm:block">
              Click any chapter to seek instant playback
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {VIDEO_CHAPTERS.map((ch, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => seekToChapter(ch, idx)}
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-white/[0.08] border-[#FF5A1F] shadow-[0_0_20px_rgba(255,90,31,0.25)]'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.05]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF5A1F] to-cyan-400" />
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono ${
                        isActive ? 'text-[#FF5A1F] font-bold' : 'text-white/40'
                      }`}
                    >
                      {ch.label}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-ping" />
                    )}
                  </div>
                  <h4 className="text-sm font-display font-bold uppercase text-white truncate">
                    {ch.highlight}
                  </h4>
                  <p className="text-[11px] text-white/50 leading-snug line-clamp-2 mt-1">
                    {ch.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Film Engineering Callout & Quick Launch Pad */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.03] via-black/40 to-white/[0.01] p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-cyan-400">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>BESPOKE RACING COMMISSION</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
              BRING THIS CINEMATIC VISION TO LIFE
            </h3>
            <p className="text-sm text-white/60 leading-relaxed font-normal">
              Every detail seen in this film—from the high-gloss metallic lacquer to the monoblock forged wheels and carbon fiber aerodynamics—can be customized in real-time in our interactive 3D studio.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            {/* Configure in 3D Button */}
            <MagneticButton
              variant="outline"
              onClick={handleConfiguratorClick}
              className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 flex items-center gap-2"
            >
              <Disc className="w-4 h-4 text-cyan-400" />
              <span>CUSTOMIZE IN 3D</span>
            </MagneticButton>

            {/* Book Allocation Button */}
            <MagneticButton
              variant="primary"
              onClick={() => onOpenTestDrive?.('taycan-egt')}
              className="flex items-center gap-2"
            >
              <span>REQUEST TRACK DRIVE</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
};
