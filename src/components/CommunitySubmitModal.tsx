import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, MapPin, Tag, CheckCircle2, ShieldCheck, Camera } from 'lucide-react';
import { CommunityPost } from '../data/communityPulse';
import { CARS_DATA } from '../data/cars';
import { MagneticButton } from './MagneticButton';

interface CommunitySubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (post: CommunityPost) => void;
}

export const CommunitySubmitModal: React.FC<CommunitySubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
}) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [carModel, setCarModel] = useState(CARS_DATA[0].name);
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('#ApexVelocity #BespokeOwner');
  const [platform, setPlatform] = useState<'instagram' | 'x' | 'youtube' | 'apex-club'>('instagram');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !caption.trim()) return;

    const matchedCar = CARS_DATA.find((c) => c.name === carModel) || CARS_DATA[0];

    const newPost: CommunityPost = {
      id: `post-user-${Date.now()}`,
      author: {
        name: name.trim(),
        handle: handle.startsWith('@') ? handle.trim() : `@${handle.trim() || 'apex_member'}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        badge: `Verified ${matchedCar.name} Owner`,
        verified: true,
        carOwned: matchedCar.name,
        carId: matchedCar.id,
      },
      platform,
      timestamp: 'Just now',
      timeSecondsAgo: 2,
      location: location.trim() || 'Global Atelier, Private Circuit',
      image: matchedCar.image,
      caption: caption.trim(),
      tags: tags
        .split(' ')
        .filter((t) => t.trim().startsWith('#'))
        .concat(['#ApexVelocity', '#CommunityPulse']),
      likes: 1,
      commentsCount: 0,
      sharesCount: 0,
      likedByUser: true,
      category: 'lifestyle',
      telemetrySnippet: {
        label: 'VERIFIED TRANSMISSION',
        value: 'LIVE BROADCAST',
      },
    };

    onSubmitPost(newPost);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1400);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 25 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg glass-card rounded-3xl border border-white/20 bg-black/95 shadow-2xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 flex items-center justify-center text-[#FF5A1F]">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] block">
                  OWNER VERIFICATION TRANSMISSION
                </span>
                <h3 className="text-lg font-black font-display uppercase tracking-wider text-white">
                  Tag Your Apex Moment
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full glass-panel border border-white/15 text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {submitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold font-display uppercase text-white">
                Live Broadcast Synced!
              </h4>
              <p className="text-xs font-mono text-white/60">
                Your post is now pulsing live across the global owner feed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 block mb-1.5">
                    Your Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Liam Vance"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF5A1F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 block mb-1.5">
                    Social Handle:
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@liam_apex"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF5A1F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 block mb-1.5">
                    Select Your Apex Spec:
                  </label>
                  <select
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="w-full bg-[#121216] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#FF5A1F] focus:outline-none cursor-pointer"
                  >
                    {CARS_DATA.map((c) => (
                      <option key={c.id} value={c.name} className="bg-[#121216]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-white/60 block mb-1.5">
                    Platform:
                  </label>
                  <select
                    value={platform}
                    onChange={(e) =>
                      setPlatform(e.target.value as 'instagram' | 'x' | 'youtube' | 'apex-club')
                    }
                    className="w-full bg-[#121216] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#FF5A1F] focus:outline-none cursor-pointer"
                  >
                    <option value="instagram" className="bg-[#121216]">Instagram</option>
                    <option value="x" className="bg-[#121216]">X (Twitter)</option>
                    <option value="youtube" className="bg-[#121216]">YouTube</option>
                    <option value="apex-club" className="bg-[#121216]">Apex Private Network</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-white/60 block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#FF5A1F]" />
                  <span>Location / Track Tag:</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Silverstone Circuit, UK or Beverly Hills, CA"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-white/60 block mb-1.5">
                  Owner Caption / Review:
                </label>
                <textarea
                  required
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share your driving telemetry, handover thoughts, or track impressions..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF5A1F] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-white/60 block mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-[#00E5FF]" />
                  <span>Hashtags:</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="#ApexVelocity #TrackDay #BespokeSpec"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF5A1F] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3">
                <MagneticButton
                  variant="primary"
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold justify-center"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Publish To Community Pulse
                </MagneticButton>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
