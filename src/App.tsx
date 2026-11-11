import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { TestDriveModal } from './components/TestDriveModal';
import { CarDetailModal } from './components/CarDetailModal';
import { CompareVehiclesModal } from './components/CompareVehiclesModal';
import { CarARViewerModal } from './components/CarARViewerModal';
import { DeliveryOptions } from './components/DeliveryOptions';
import { LoadingProgressBar } from './components/LoadingProgressBar';
import { SectionDivider } from './components/SectionDivider';
import { FloatingSectionProgress } from './components/FloatingSectionProgress';
import { AmbientLightingOverlay } from './components/AmbientLightingOverlay';
import { AnimatePresence, motion } from 'motion/react';

import { HeroSection } from './sections/HeroSection';
import { StatsSection } from './sections/StatsSection';
import { AboutSection } from './sections/AboutSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { CarShowcaseSection } from './sections/CarShowcaseSection';
import { CarExperienceSection } from './sections/CarExperienceSection';
import { CinematicFilmSection } from './sections/CinematicFilmSection';
import { GallerySection } from './sections/GallerySection';
import { WhyChooseUsSection } from './sections/WhyChooseUsSection';
import { GlobalPresenceSection } from './sections/GlobalPresenceSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { CommunityPulseSection } from './sections/CommunityPulseSection';
import { FaqSection } from './sections/FaqSection';
import { ContactSection } from './sections/ContactSection';

import { useLenis } from './hooks/useLenis';
import { CARS_DATA } from './data/cars';
import { CarModel } from './types';

export default function App() {
  // Initialize Lenis smooth scroll
  useLenis();

  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [selectedCarForTestDrive, setSelectedCarForTestDrive] = useState<string | undefined>(undefined);
  const [activeCarModal, setActiveCarModal] = useState<CarModel | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareCarA, setCompareCarA] = useState<CarModel | null>(null);
  const [compareCarB, setCompareCarB] = useState<CarModel | null>(null);
  const [arModalCar, setArModalCar] = useState<CarModel | null>(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);

  const handleOpenTestDrive = (carId?: string) => {
    setSelectedCarForTestDrive(carId);
    setTestDriveOpen(true);
  };

  const handleOpenCompare = (carA?: CarModel | null, carB?: CarModel | null) => {
    const firstCar = carA || CARS_DATA[0];
    const secondCar =
      carB ||
      (firstCar.id === CARS_DATA[0].id ? CARS_DATA[1] : CARS_DATA[0]);
    setCompareCarA(firstCar);
    setCompareCarB(secondCar);
    setCompareModalOpen(true);
  };

  const handleOpenAR = (car?: CarModel | null) => {
    setArModalCar(car || CARS_DATA[0]);
  };

  const handleOpenDelivery = () => {
    setDeliveryModalOpen(true);
  };

  const handleExploreCars = () => {
    const carsEl = document.getElementById('cars');
    if (carsEl) {
      carsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF5A1F] selection:text-white relative font-sans">
      {/* Dynamic Ambient Lighting Overlay: Midnight vs Sunset Golden Hour */}
      <AmbientLightingOverlay />

      {/* Sleek slim loading progress bar during automotive assets initialization */}
      <LoadingProgressBar />

      {/* Custom Glowing Cursor */}
      <CustomCursor />

      {/* Sticky Glassmorphism Header Navbar with Global Search & Compare */}
      <Navbar
        onOpenTestDrive={() => handleOpenTestDrive()}
        onSelectCar={(car) => setActiveCarModal(car)}
        onOpenCompare={() => handleOpenCompare()}
        onOpenAR={() => handleOpenAR()}
        onOpenDelivery={() => handleOpenDelivery()}
      />

      {/* Persistent Floating Section Progress Indicator on the Right */}
      <FloatingSectionProgress />

      {/* Main Content Sections */}
      <main>
        {/* Fullscreen Video Hero with Cars Animating */}
        <HeroSection
          onExploreCars={handleExploreCars}
          onOpenTestDrive={() => handleOpenTestDrive()}
          onSelectCar={(car) => setActiveCarModal(car)}
        />

        {/* Subtle Horizontal Gradient Divider */}
        <SectionDivider glow />

        {/* Animated Key Statistics */}
        <StatsSection />

        {/* Subtle Horizontal Gradient Divider */}
        <SectionDivider accent />

        {/* About Atelier Section */}
        <AboutSection onOpenTestDrive={() => handleOpenTestDrive()} />

        {/* Subtle Horizontal Gradient Divider */}
        <SectionDivider />

        {/* 6 Pillars Tech Features */}
        <FeaturesSection />

        {/* Subtle Horizontal Gradient Divider with accent */}
        <SectionDivider accent glow />

        {/* Filterable Vehicle Collection */}
        <CarShowcaseSection
          onSelectCar={(car) => setActiveCarModal(car)}
          onOpenTestDrive={(carId) => handleOpenTestDrive(carId)}
          onOpenCompare={(carA, carB) => handleOpenCompare(carA, carB)}
          onOpenAR={(car) => handleOpenAR(car)}
        />

        {/* Subtle Horizontal Gradient Divider with accent glow */}
        <SectionDivider accent glow />

        {/* Dynamic Vehicle Experience & Live Cycle Showcase */}
        <CarExperienceSection
          onSelectCar={(car) => setActiveCarModal(car)}
          onOpenTestDrive={(carId) => handleOpenTestDrive(carId)}
        />

        {/* Subtle Horizontal Gradient Divider with glow */}
        <SectionDivider glow />

        {/* The Midnight Atelier: Cinematic Film Showcase */}
        <CinematicFilmSection
          onOpenTestDrive={(carId) => handleOpenTestDrive(carId)}
          onNavigateToConfigurator={() => {
            const el = document.getElementById('cars');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Subtle Horizontal Gradient Divider */}
        <SectionDivider />

        {/* Photographic Gallery */}
        <GallerySection />

        {/* Subtle Horizontal Gradient Divider */}
        <SectionDivider />

        {/* Timeline & Heritage */}
        <WhyChooseUsSection />

        {/* Subtle Horizontal Gradient Divider with accent */}
        <SectionDivider accent glow />

        {/* Interactive D3.js Global Presence Network */}
        <GlobalPresenceSection
          onOpenTestDrive={() => handleOpenTestDrive()}
          onOpenDelivery={() => handleOpenDelivery()}
        />

        {/* Subtle Horizontal Gradient Divider */}
        <SectionDivider />

        {/* Owner & Racer Testimonials */}
        <TestimonialsSection />

        {/* Subtle Horizontal Gradient Divider with glow */}
        <SectionDivider glow />

        {/* Real-time Community Pulse Social Stream */}
        <CommunityPulseSection onSelectCar={(car) => setActiveCarModal(car)} />

        {/* Subtle Horizontal Gradient Divider */}
        <SectionDivider />

        {/* Accordion FAQs */}
        <FaqSection />

        {/* Subtle Horizontal Gradient Divider with accent */}
        <SectionDivider accent glow />

        {/* Contact & Concierge Form */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <TestDriveModal
        isOpen={testDriveOpen}
        onClose={() => setTestDriveOpen(false)}
        selectedCarId={selectedCarForTestDrive}
      />

      <CarDetailModal
        car={activeCarModal}
        onClose={() => setActiveCarModal(null)}
        onReserve={(carId) => handleOpenTestDrive(carId)}
        onOpenCompare={(car) => handleOpenCompare(car)}
      />

      {/* Dedicated Side-by-Side Compare Vehicles Modal */}
      <CompareVehiclesModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        carA={compareCarA}
        carB={compareCarB}
        onOpenTestDrive={(carId) => handleOpenTestDrive(carId)}
      />

      {/* Camera Augmented Reality Virtual Hypercar Placement Modal */}
      <CarARViewerModal
        isOpen={arModalCar !== null}
        onClose={() => setArModalCar(null)}
        car={arModalCar}
      />

      {/* Real-Time Geographic Delivery Options & Shipping Calculator Modal */}
      <AnimatePresence>
        {deliveryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto"
          >
            <DeliveryOptions
              isModal
              initialCar={activeCarModal}
              onClose={() => setDeliveryModalOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
