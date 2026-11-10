import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS_DATA } from '../data/faqs';
import { SectionHeading } from '../components/SectionHeading';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQS_DATA[0].id);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="ATELIER INQUIRIES"
          title="FREQUENTLY ASKED"
          highlightText="QUESTIONS"
          subtitle="Everything you need to know about purchasing, warranty, and track telemetry."
          centered
        />

        <div className="space-y-4">
          {FAQS_DATA.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-lg font-bold font-display uppercase text-white flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-[#FF5A1F] shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#FF5A1F] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-sm text-[#BEBEBE] leading-relaxed border-t border-white/5 pt-4"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
