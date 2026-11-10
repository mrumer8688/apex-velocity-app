import React from 'react';
import { motion } from 'motion/react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      label: 'Acceleration',
      value: '1.89',
      unit: 'sec',
      subtext: '0-100 KM/H QUAD LAUNCH',
    },
    {
      label: 'Power Output',
      value: '1,914',
      unit: 'hp',
      subtext: 'QUAD-MOTOR TORQUE VECTORING',
    },
    {
      label: 'Top Velocity',
      value: '412',
      unit: 'km/h',
      subtext: 'ACTIVE AERO OPTIMIZED',
    },
    {
      label: 'Handling Lateral',
      value: '1.25',
      unit: 'G',
      subtext: 'ACTIVE CORNERING CONTROL',
    },
  ];

  return (
    <section className="relative z-20 border-y border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto divide-y md:divide-y-0 md:divide-x divide-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="p-6 sm:p-8 flex flex-col justify-between hover:bg-white/5 transition-colors duration-300"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-mono mb-2">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-[#FF5A1F] uppercase font-bold font-mono tracking-wider">
                {stat.unit}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1 font-mono italic">
              {stat.subtext}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
