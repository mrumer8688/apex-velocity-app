import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Sparkles,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  Check,
  Instagram,
  Twitter,
  Youtube,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';
import { CommunityPost, COMMUNITY_POSTS_INITIAL } from '../data/communityPulse';
import { CommunitySubmitModal } from '../components/CommunitySubmitModal';
import { CarModel } from '../types';
import { CARS_DATA } from '../data/cars';

interface CommunityPulseSectionProps {
  onSelectCar?: (car: CarModel) => void;
}

export const CommunityPulseSection: React.FC<CommunityPulseSectionProps> = ({
  onSelectCar,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS_INITIAL);
  const [activeFilter, setActiveFilter] = useState<'all' | 'track' | 'delivery' | 'night' | 'lifestyle'>('all');
  const [secondsUntilSync, setSecondsUntilSync] = useState<number>(10);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live countdown timer simulating dynamic synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilSync((prev) => {
        if (prev <= 1) {
          // Trigger a simulated refresh pulse
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter posts
  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter((p) => p.category === activeFilter);

  // Like interaction
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = post.likedByUser;
          return {
            ...post,
            likedByUser: !isLiked,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  // Share interaction
  const handleShare = (post: CommunityPost) => {
    setCopiedPostId(post.id);
    navigator.clipboard?.writeText?.(
      `Check out this verified @ApexVelocity owner post by ${post.author.handle}: "${post.caption.slice(0, 80)}..."`
    );
    setTimeout(() => {
      setCopiedPostId(null);
    }, 2000);
  };

  // Manual refresh / simulate incoming post
  const handleSimulateNewPost = () => {
    setIsRefreshing(true);
    setSecondsUntilSync(12);

    setTimeout(() => {
      const simulatedIncoming: CommunityPost = {
        id: `post-incoming-${Date.now()}`,
        author: {
          name: 'Lucas Laurent',
          handle: '@lucas_apex_f1',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          badge: 'Track Master #009',
          verified: true,
          carOwned: 'Apex Valkyrie GT',
          carId: 'car-2',
        },
        platform: 'x',
        timestamp: 'Just now',
        timeSecondsAgo: 0,
        location: 'Spa-Francorchamps, Belgium',
        image: CARS_DATA[1].image,
        caption: 'Blasting down the Kemmel Straight at 218 MPH in the Valkyrie GT! Engine revving to 9,500 RPM. This telemetry is unreal. #ApexTrackClub #SpaFrancorchamps #EauRouge',
        tags: ['#ApexTrackClub', '#SpaFrancorchamps', '#EauRouge', '#TrackTelemetry'],
        likes: 14,
        commentsCount: 2,
        sharesCount: 5,
        category: 'track',
        telemetrySnippet: {
          label: 'V-MAX KEMMEL',
          value: '218.4 MPH',
        },
      };

      setPosts((prev) => [simulatedIncoming, ...prev]);
      setIsRefreshing(false);
    }, 600);
  };

  // Platform icon helper
  const getPlatformIcon = (platform: CommunityPost['platform']) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      case 'x':
        return <Twitter className="w-3.5 h-3.5 text-sky-400" />;
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5 text-red-500" />;
      case 'apex-club':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A1F]" />;
    }
  };

  return (
    <section id="pulse" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll Parallax Background */}
      <ParallaxSectionBackground glowColor="orange" accentText="COMMUNITY" speed={-0.15} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Section Heading */}
        <div className="flex flex-col items-center">
          <SectionHeading
            eyebrow="GLOBAL OWNERS & SOCIAL STREAM"
            title="COMMUNITY"
            highlightText="PULSE"
            subtitle="Real-time authenticated social transmissions from proud owners worldwide. Track-day telemetry, bespoke handovers, and midnight city drives tagged with #ApexVelocity."
            centered
          />

          {/* Live Status Header Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-full glass-panel border border-white/10 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-[11px]">LIVE SYNC ACTIVE</span>
            </div>

            <span className="text-white/60 text-[11px] hidden sm:inline">
              Next sync: <span className="text-[#FF5A1F] font-bold">{secondsUntilSync}s</span>
            </span>

            <button
              type="button"
              onClick={handleSimulateNewPost}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#FF5A1F]/50 transition-all cursor-pointer"
              title="Simulate incoming post"
            >
              <RefreshCw className={`w-3 h-3 text-[#FF5A1F] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">Refresh Stream</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF5A1F] hover:bg-[#FF3B00] text-black font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(255,90,31,0.4)]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase">Tag Your Spec</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'glass-panel text-white/70 hover:text-white border border-white/10'
            }`}
          >
            All Feeds ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('track')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'track'
                ? 'bg-[#FF5A1F] text-white font-bold glow-orange'
                : 'glass-panel text-white/70 hover:text-[#FF5A1F] border border-white/10'
            }`}
          >
            Track Telemetry (#TrackDay)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('delivery')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'delivery'
                ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'glass-panel text-white/70 hover:text-[#00E5FF] border border-white/10'
            }`}
          >
            Bespoke Handovers (#ApexDelivery)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('night')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'night'
                ? 'bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'glass-panel text-white/70 hover:text-purple-400 border border-white/10'
            }`}
          >
            Night Drives (#TokyoMidnight)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('lifestyle')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'lifestyle'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'glass-panel text-white/70 hover:text-emerald-400 border border-white/10'
            }`}
          >
            VIP Concourse (#MonacoGP)
          </button>
        </div>

        {/* Live Social Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence>
            {filteredPosts.map((post) => {
              const matchedCar = CARS_DATA.find((c) => c.name === post.author.carOwned || c.id === post.author.carId);

              return (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between group shadow-xl bg-gradient-to-b from-white/[0.03] to-transparent"
                >
                  <div>
                    {/* Post Author Card Header */}
                    <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-md"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white font-display">
                              {post.author.name}
                            </span>
                            {post.author.verified && (
                              <span className="w-3.5 h-3.5 rounded-full bg-[#FF5A1F] flex items-center justify-center text-[9px] text-black font-black">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-white/50 block">
                            {post.author.handle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-white/5 border border-white/10">
                          {getPlatformIcon(post.platform)}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">
                          {post.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Media Container with Telemetry Overlay */}
                    <div className="relative aspect-[16/11] overflow-hidden">
                      <img
                        src={post.image}
                        alt="Owner showcase post"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Location Badge */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-black/70 backdrop-blur-md text-white border border-white/15">
                        <MapPin className="w-3 h-3 text-[#FF5A1F]" />
                        <span>{post.location}</span>
                      </div>

                      {/* Live Telemetry Pill Overlay if present */}
                      {post.telemetrySnippet && (
                        <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-[#00E5FF]/40 shadow-lg text-[10px] font-mono">
                          <span className="text-white/40 block text-[9px]">
                            {post.telemetrySnippet.label}
                          </span>
                          <span className="text-[#00E5FF] font-bold text-xs">
                            {post.telemetrySnippet.value}
                          </span>
                        </div>
                      )}

                      {/* Owner Badge */}
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 backdrop-blur-md font-semibold">
                          {post.author.badge}
                        </span>
                      </div>
                    </div>

                    {/* Caption & Content */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
                        {post.caption}
                      </p>

                      {/* Hashtags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono text-[#00E5FF] hover:underline cursor-pointer"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Linked Car Spec Chip */}
                      {matchedCar && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => onSelectCar?.(matchedCar)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-[#FF5A1F]/15 border border-white/10 hover:border-[#FF5A1F]/40 transition-all text-left cursor-pointer group/chip"
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-[#FF5A1F]" />
                              <div>
                                <span className="text-[10px] font-mono text-white/50 block">
                                  SPEC FEATURED:
                                </span>
                                <span className="text-xs font-bold font-display uppercase text-white group-hover/chip:text-[#FF5A1F] transition-colors">
                                  {matchedCar.name} ({matchedCar.power})
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-[#FF5A1F] uppercase font-bold pr-1">
                              View Spec ▸
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Reactions Row */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-white/10 mt-2 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-4">
                      {/* Like button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          post.likedByUser
                            ? 'text-[#FF5A1F] font-bold'
                            : 'text-white/60 hover:text-[#FF5A1F]'
                        }`}
                        aria-label="Like post"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            post.likedByUser ? 'fill-[#FF5A1F] text-[#FF5A1F] scale-110' : ''
                          }`}
                        />
                        <span>{post.likes.toLocaleString()}</span>
                      </button>

                      {/* Comment counter */}
                      <div className="flex items-center gap-1.5 text-white/60">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount}</span>
                      </div>
                    </div>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Share post"
                      aria-label="Share post"
                    >
                      {copiedPostId === post.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[10px]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">Share</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Live Community Marquee Telemetry Ticker */}
        <div className="pt-4 overflow-hidden rounded-2xl glass-panel border border-white/10 p-3 relative bg-black/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#FF5A1F]/20 text-[#FF5A1F] font-mono text-[10px] uppercase font-bold shrink-0 flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>LIVE WIRE</span>
            </span>
            <div className="overflow-hidden whitespace-nowrap relative w-full text-xs font-mono text-white/70">
              <div className="inline-block animate-marquee">
                @kenji_apex: Just clocked 200mph at Fuji straight! • @marcus_london: 1,000-mile inspection completed with zero faults • @al_maktoum_racing: Chronos chassis #021 delivery accepted at DIFC • @sophia_zurich: Alpine pass run at sunrise 🏔️ • @elena_monaco: Port Hercule yacht club concourse • @max_nordschleife: Sub 6:40 lap locked in • @carter_pch: Bixby bridge drone roll completed • 
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Post Submission Modal */}
      <CommunitySubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitPost={(newPost) => setPosts((prev) => [newPost, ...prev])}
      />
    </section>
  );
};
