import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { ParallaxSectionBackground } from '../components/ParallaxSectionBackground';
import { InteractiveVehicleConfigurator } from '../components/InteractiveVehicleConfigurator';
import { CarModel } from '../types';
import { CarConfigState } from '../types/configurator';

interface AtelierConfiguratorSectionProps {
  onOpenTestDrive?: (carId?: string) => void;
}

export const AtelierConfiguratorSection: React.FC<AtelierConfiguratorSectionProps> = ({
  onOpenTestDrive,
}) => {
  const handleBookCommission = (specDetails: {
    car: CarModel;
    config: CarConfigState;
    totalPrice: string;
  }) => {
    onOpenTestDrive?.(specDetails.car.id);
  };

  return (
    <section id="configurator" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Scroll Parallax Background */}
      <ParallaxSectionBackground glowColor="orange" accentText="ATELIER" speed={-0.15} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center">
          <SectionHeading
            eyebrow="BESPOKE DESIGN COMMISSIONING"
            title="ATELIER 360°"
            highlightText="CONFIGURATOR"
            subtitle="Tailor every contour to your personal racing vision. Customize bespoke exterior car paint, hand-selected interior materials, and forged wheel designs in an interactive real-time 3D car studio."
            centered
          />
        </div>

        {/* Interactive 3D Vehicle Configurator Studio */}
        <InteractiveVehicleConfigurator onBookCommission={handleBookCommission} standalone />
      </div>
    </section>
  );
};
