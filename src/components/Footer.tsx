import React, { useState } from 'react';
import { Shield, Send, ArrowUp, Instagram, Youtube, Twitter, Linkedin, Sparkles } from 'lucide-react';
import { DownloadZipButton } from './DownloadZipButton';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#050505] text-white border-t border-white/10 pt-20 pb-12 overflow-hidden frosted-glass-footer">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#FF5A1F]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FF5A1F] rounded-sm flex items-center justify-center rotate-45 glow-orange">
                <div className="w-4 h-4 bg-[#050505] rounded-sm" />
              </div>
              <span className="font-display text-xl font-bold tracking-[0.2em] text-white uppercase">
                APEX <span className="text-[#FF5A1F]">VELOCITY</span>
              </span>
            </div>

            <p className="text-sm text-[#BEBEBE] leading-relaxed max-w-md">
              Pioneering hyper-electric performance and aerodynamic architecture. Engineered in Monaco and Zurich for those who command the future of speed.
            </p>

            {/* Download Source Code ZIP */}
            <div className="pt-2">
              <DownloadZipButton />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F]">
              // VEHICLES & TECH
            </h4>
            <ul className="space-y-2.5 text-sm text-[#BEBEBE]">
              <li><a href="#cars" className="hover:text-white transition-colors">Phantom Velocity X</a></li>
              <li><a href="#cars" className="hover:text-white transition-colors">Mantis Cyber GT</a></li>
              <li><a href="#cars" className="hover:text-white transition-colors">Silver Ghost GT</a></li>
              <li><a href="#cars" className="hover:text-white transition-colors">1968 Futura Fastback</a></li>
              <li><a href="#experience" className="hover:text-white transition-colors">Live Cycle Studio</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F]">
              // EXPERIENCE
            </h4>
            <ul className="space-y-2.5 text-sm text-[#BEBEBE]">
              <li><a href="#about" className="hover:text-white transition-colors">About Atelier</a></li>
              <li><a href="#experience" className="hover:text-white transition-colors">Vehicle Lab</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Visual Gallery</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Collector Reviews</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Private Track Test</a></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F]">
              // APEX PRIVÉ DISPATCH
            </h4>
            <p className="text-xs text-[#BEBEBE] leading-relaxed">
              Receive confidential unveil dates and private track invitation codes.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 text-xs text-white font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                SUBSCRIBED TO APEX DISPATCH
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5A1F]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#FF5A1F] text-white rounded-lg hover:bg-[#FF7340] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <div className="flex gap-3 pt-2 text-[#BEBEBE]">
              <a href="#" className="p-2 rounded-lg glass-panel hover:text-[#FF5A1F] transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg glass-panel hover:text-[#FF5A1F] transition-colors"><Youtube className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg glass-panel hover:text-[#FF5A1F] transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg glass-panel hover:text-[#FF5A1F] transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#BEBEBE]">
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} APEX VELOCITY INC.</span>
            <a href="#" className="hover:text-white transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-white transition-colors">TERMS</a>
            <a href="#" className="hover:text-white transition-colors">TELEMETRY</a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:border-[#FF5A1F]/50 text-white transition-all group cursor-pointer"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#FF5A1F] group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};
