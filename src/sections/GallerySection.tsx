import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, Sparkles } from 'lucide-react';
import { GALLERY_DATA } from '../data/gallery';
import { GalleryItem } from '../types';
import { SectionHeading } from '../components/SectionHeading';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';

export const GallerySection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll-Triggered Parallax Background */}
      <ParallaxSectionBackground glowColor="neutral" accentText="EXHIBITION" speed={-0.14} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="VISUAL EXPERIENCE"
          title="PHOTOGRAPHIC"
          highlightText="GALLERY"
          subtitle="Explore atmospheric renders and track captures from our global ateliers."
          centered
        />

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_DATA.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => setSelectedImage(item)}
              className="relative rounded-2xl overflow-hidden glass-card group cursor-pointer border border-white/10 aspect-[4/3]"
            >
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] font-mono text-[#FF5A1F] uppercase tracking-widest">
                  {item.category}
                </span>
                <h4 className="text-lg font-bold font-display uppercase text-white flex items-center justify-between">
                  <span>{item.title}</span>
                  <Maximize2 className="w-5 h-5 text-[#FF5A1F]" />
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full glass-card p-4 rounded-3xl border border-white/10"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 p-2 rounded-full glass-panel text-white hover:text-[#FF5A1F] z-20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="rounded-2xl overflow-hidden aspect-[16/9]">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 flex items-center justify-between text-white">
                <div>
                  <span className="text-xs font-mono text-[#FF5A1F] uppercase">
                    {selectedImage.category}
                  </span>
                  <h3 className="text-xl font-bold font-display uppercase">
                    {selectedImage.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
