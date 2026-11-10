import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Rotate3D,
  Radio,
} from 'lucide-react';
import heroPosterImg from '../assets/images/apex_hero_poster_1785141175569.jpg';

interface AtelierVideoShowcaseProps {
  onToggle3DStudio?: () => void;
  show3DToggle?: boolean;
}

export const AtelierVideoShowcase: React.FC<AtelierVideoShowcaseProps> = ({
  onToggle3DStudio,
  show3DToggle = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');
  const [durationStr, setDurationStr] = useState('00:00');
  const [videoError, setVideoError] = useState(false);

  // Local high-definition automotive cinematic media source
  const videoSrc = '/assets/aistudio/Creating_car_video_in_dark_20261019000955_7cf71208.mp4';
  const posterSrc = '/assets/aistudio/cinematic_poster.jpg';

  // Autoplay attempt on mount
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && !videoError) {
      videoEl.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [videoError]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setProgress((cur / dur) * 100);

      const curMin = Math.floor(cur / 60);
      const curSec = Math.floor(cur % 60);
      const durMin = Math.floor(dur / 60);
      const durSec = Math.floor(dur % 60);

      setCurrentTimeStr(`${String(curMin).padStart(2, '0')}:${String(curSec).padStart(2, '0')}`);
      setDurationStr(`${String(durMin).padStart(2, '0')}:${String(durSec).padStart(2, '0')}`);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(pos * 100);
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl overflow-hidden glass-card p-3 sm:p-5 border border-white/15 glow-orange-lg shadow-2xl group/showcase"
    >
      {/* Ambient Pulsing Background Laser Glow Animation */}
      <motion.div
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -inset-1 bg-gradient-to-r from-[#FF5A1F]/20 via-[#FF2A00]/10 to-[#00E5FF]/10 blur-3xl pointer-events-none rounded-3xl"
      />

      {/* Top Header Bar */}
      <div className="relative z-20 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-md rounded-2xl mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#FF2A00] flex items-center justify-center glow-orange text-white">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#FF5A1F]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              MUSTANG FASTBACK 1968 REVEAL
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display uppercase text-white tracking-wide">
              REDISCOVER THE <span className="text-[#FF5A1F]">CLASSICS</span>
            </h3>
          </div>
        </div>

        {/* 3D Switcher */}
        {show3DToggle && onToggle3DStudio && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle3DStudio}
            className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Rotate3D className="w-4 h-4 text-[#FF5A1F]" />
            SWITCH TO 3D STUDIO
          </motion.button>
        )}
      </div>

      {/* Main Video Frame */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[480px] bg-black rounded-2xl overflow-hidden group">
        {!videoError ? (
          <motion.video
            animate={{ scale: isPlaying ? 1.02 : 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            ref={videoRef}
            poster={heroPosterImg}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover transition-transform duration-1000 cursor-pointer"
            onClick={togglePlayPause}
          >
            <source src={videoSrc} type="video/mp4" />
          </motion.video>
        ) : (
          <img
            src={heroPosterImg}
            alt="Mustang Fastback 1968"
            className="w-full h-full object-cover"
          />
        )}

        {/* Cyberpunk HUD Frame Corner Reticles */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#FF5A1F] pointer-events-none z-10 opacity-70" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#FF5A1F] pointer-events-none z-10 opacity-70" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#FF5A1F] pointer-events-none z-10 opacity-70" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#FF5A1F] pointer-events-none z-10 opacity-70" />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Floating Title Watermark Banner */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="text-2xl sm:text-4xl font-black font-display tracking-wider text-white uppercase opacity-90 drop-shadow-2xl">
            MUSTANG <span className="text-[#FF5A1F]">FASTBACK</span>
          </div>
          <p className="text-xs sm:text-sm font-mono text-gray-300 uppercase tracking-widest mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
            LOOKS FAST STANDING STILL • 1968 FUTURA MOD
          </p>
        </div>

        {/* Play / Pause Center Overlay Indicator when Paused */}
        {!isPlaying && (
          <div
            onClick={togglePlayPause}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-full bg-[#FF5A1F] text-black flex items-center justify-center glow-orange shadow-2xl"
            >
              <Play className="w-10 h-10 fill-black ml-1.5" />
            </motion.div>
          </div>
        )}

        {/* Bottom Video Controls Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-black/80 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl space-y-2.5">
          {/* Progress Seek Bar */}
          <div
            onClick={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group/bar"
          >
            <div
              className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF2A00] rounded-full transition-all duration-150 relative glow-orange"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/bar:scale-100 transition-transform" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Play / Pause Video */}
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-xl glass-panel text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
                aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              {/* Video Audio Mute */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl glass-panel text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
                aria-label={isMuted ? 'Unmute Video' : 'Mute Video'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-[#FF5A1F]" />}
              </button>
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-mono text-gray-300">
              <span className="text-white font-bold">{currentTimeStr}</span> / {durationStr}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-xl glass-panel text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
