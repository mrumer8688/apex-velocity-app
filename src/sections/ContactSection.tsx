import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Sparkles } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { MagneticButton } from '../components/MagneticButton';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';

export const ContactSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll-Triggered Parallax Background */}
      <ParallaxSectionBackground glowColor="orange" accentText="CONCIERGE" speed={-0.18} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="GLOBAL ATELIERS"
          title="GET IN TOUCH WITH"
          highlightText="APEX CONCIERGE"
          subtitle="Speak with our private client liaisons or visit our primary track laboratories in Monaco & Dubai."
          centered
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Contact Details & Interactive Map Mock */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
              <h3 className="text-xl font-bold font-display uppercase text-white">
                HEADQUARTERS & TRACK ATELIERS
              </h3>

              <div className="space-y-4 text-sm text-[#BEBEBE]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Monaco Track Atelier</span>
                    <span>7 Avenue des Spélugues, 98000 Monaco</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Concierge Hotline</span>
                    <span>+377 98 06 20 00 (24/7 Global Dispatch)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Encrypted Email</span>
                    <span>concierge@apexvelocity.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Atelier Hours</span>
                    <span>Mon - Sat: 08:00 - 20:00 CET</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Location Map Visualizer Card */}
            <div className="relative rounded-3xl overflow-hidden glass-card h-64 border border-white/10 group p-4 flex flex-col justify-between">
              <div
                className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10 flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-black/80 text-[#FF5A1F] border border-[#FF5A1F]/30">
                  MONACO CIRCUIT LAB
                </span>
                <span className="text-xs font-mono text-emerald-400">● LIVE TRACK OPEN</span>
              </div>

              <div className="relative z-10">
                <h4 className="text-lg font-bold font-display uppercase text-white">
                  Circuit de Monaco
                </h4>
                <p className="text-xs text-[#BEBEBE]">43.7374° N, 7.4272° E</p>
              </div>
            </div>
          </div>

          {/* Right Column: Luxury Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center mx-auto border border-[#FF5A1F]/40 glow-orange">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold font-display uppercase text-white">
                    INQUIRY TRANSMITTED
                  </h3>
                  <p className="text-[#BEBEBE] text-sm max-w-md mx-auto">
                    Your inquiry has been received by our senior client director. Expect confidential contact within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold font-display uppercase text-white">
                    SEND CONFIDENTIAL INQUIRY
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#BEBEBE] mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Elena Rostova"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#BEBEBE] mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rostova@orbit.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#BEBEBE] mb-2">
                      Subject
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Bespoke Commission">Bespoke Vehicle Commission</option>
                      <option value="Private Track Testing">Private Track Testing Session</option>
                      <option value="Fleet Press & Media">Fleet Press & Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#BEBEBE] mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Specify your preferred vehicle configuration, track venue, or questions..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  <MagneticButton
                    variant="primary"
                    type="submit"
                    className="w-full py-4 text-center justify-center font-bold"
                  >
                    Transmit Message <Send className="w-4 h-4 ml-1" />
                  </MagneticButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
