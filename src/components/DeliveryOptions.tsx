import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck,
  Plane,
  Ship,
  Zap,
  MapPin,
  Navigation,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Compass,
  ArrowRight,
  Package,
  Layers,
  Globe,
  Sliders,
  X,
  Radio,
} from 'lucide-react';
import { CARS_DATA as CARS } from '../data/cars';
import { CarModel } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic } from '../utils/haptics';

export interface DistributionCenter {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  region: string;
  coordinates: [number, number]; // [lon, lat]
  hubType: string;
  runwayAccess: boolean;
  climateVaultCapacity: string;
  customsClearanceSpeed: string;
  transporterFleet: string[];
}

export const DISTRIBUTION_CENTERS: DistributionCenter[] = [
  {
    id: 'austin-americas',
    name: 'Apex Americas Central Hub',
    code: 'AGL-AMER-ATX',
    city: 'Austin, Texas',
    country: 'United States',
    region: 'Americas',
    coordinates: [-97.7431, 30.2672],
    hubType: 'Master Skunkworks & Logistics Center',
    runwayAccess: true,
    climateVaultCapacity: '64 Climate-Isolated Pods',
    customsClearanceSpeed: 'Pre-Approved FAA Priority Clearance',
    transporterFleet: ['4x Antonov AN-124 Charter slots', '12x Hydraulic Air-Ride Transporters'],
  },
  {
    id: 'modena-europe',
    name: 'Apex Motor Valley European Hub',
    code: 'AGL-EUR-MOD',
    city: 'Modena',
    country: 'Italy',
    region: 'Europe',
    coordinates: [10.9257, 44.6471],
    hubType: 'Powertrain Foundry & European Dispatch',
    runwayAccess: true,
    climateVaultCapacity: '80 Monocoque Vaults',
    customsClearanceSpeed: 'EU Diplomatic Homologation Protocol',
    transporterFleet: ['Dedicated Alitalia Cargo Flights', '16x Carbon-Sealed Transporters'],
  },
  {
    id: 'silverstone-uk',
    name: 'Apex Silverstone Northern Europe Hub',
    code: 'AGL-EUR-SIL',
    city: 'Silverstone',
    country: 'United Kingdom',
    region: 'Europe',
    coordinates: [-1.0169, 52.0786],
    hubType: 'Aerodynamics Center & UK Depot',
    runwayAccess: true,
    climateVaultCapacity: '40 Trackside Cells',
    customsClearanceSpeed: 'UK Civil Aviation Fast-Track',
    transporterFleet: ['6x Trackside Express Haulers', 'Helicopter Direct Dispatch'],
  },
  {
    id: 'dubai-middle-east',
    name: 'Apex Middle East & Africa Hub',
    code: 'AGL-MEA-DXB',
    city: 'Dubai DIFC / Al Maktoum',
    country: 'United Arab Emirates',
    region: 'Middle East',
    coordinates: [55.2797, 25.2048],
    hubType: 'Super-Gateway & Desert Vault Complex',
    runwayAccess: true,
    climateVaultCapacity: '120 Hyperbaric Cleanrooms',
    customsClearanceSpeed: 'GCC Royal Protocol Express (2hr)',
    transporterFleet: ['Emirates SkyCargo VIP Priority', '8x Climate-Monitored Road Trains'],
  },
  {
    id: 'tokyo-asia-pacific',
    name: 'Apex Asia-Pacific Hub Tokyo',
    code: 'AGL-APAC-TYO',
    city: 'Tokyo / Haneda Precision Depot',
    country: 'Japan',
    region: 'Asia',
    coordinates: [139.7671, 35.6762],
    hubType: 'East Asia Logistics Terminal',
    runwayAccess: true,
    climateVaultCapacity: '50 Sealed Automated Silos',
    customsClearanceSpeed: 'Japan Customs Certified Fast-Pass',
    transporterFleet: ['ANA Cargo Dedicated Charters', 'Shinkansen Express Palletized Rail'],
  },
  {
    id: 'singapore-gateway',
    name: 'Apex Southeast Asia Changi Gateway',
    code: 'AGL-APAC-SIN',
    city: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    coordinates: [103.8585, 1.2838],
    hubType: 'Equatorial Free-Port Bonded Facility',
    runwayAccess: true,
    climateVaultCapacity: '45 Dehumidified Chambers',
    customsClearanceSpeed: 'Singapore Bonded Free-Port Instant Pass',
    transporterFleet: ['Singapore Airlines Cargo Bay', 'Luxury Yacht Tender Roll-On'],
  },
  {
    id: 'sydney-oceania',
    name: 'Apex Australasia Flying Doctor Hub',
    code: 'AGL-OCE-SYD',
    city: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    coordinates: [151.2093, -33.8688],
    hubType: 'Aviation Precinct & Rapid Deployment',
    runwayAccess: true,
    climateVaultCapacity: '30 Solar Climate Bays',
    customsClearanceSpeed: 'Australian Border Force Biosecurity Pass',
    transporterFleet: ['Qantas Freight VIP Priority', '4x Trans-Nullarbor Transporters'],
  },
];

export interface ClientLocationPreset {
  name: string;
  country: string;
  region: string;
  coordinates: [number, number]; // [lon, lat]
}

export const LOCATION_PRESETS: ClientLocationPreset[] = [
  { name: 'New York City, NY', country: 'United States', region: 'Americas', coordinates: [-74.006, 40.7128] },
  { name: 'Los Angeles, CA', country: 'United States', region: 'Americas', coordinates: [-118.2437, 34.0522] },
  { name: 'Miami, FL', country: 'United States', region: 'Americas', coordinates: [-80.1918, 25.7617] },
  { name: 'Toronto, ON', country: 'Canada', region: 'Americas', coordinates: [-79.3832, 43.6532] },
  { name: 'London, Mayfair', country: 'United Kingdom', region: 'Europe', coordinates: [-0.1444, 51.5098] },
  { name: 'Monaco / Monte Carlo', country: 'Monaco', region: 'Europe', coordinates: [7.4246, 43.7384] },
  { name: 'Zurich / Geneva', country: 'Switzerland', region: 'Europe', coordinates: [8.5417, 47.3769] },
  { name: 'Frankfurt / Stuttgart', country: 'Germany', region: 'Europe', coordinates: [9.1829, 48.7758] },
  { name: 'Dubai, DIFC', country: 'United Arab Emirates', region: 'Middle East', coordinates: [55.2797, 25.2048] },
  { name: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East', coordinates: [46.6753, 24.7136] },
  { name: 'Tokyo, Ginza', country: 'Japan', region: 'Asia', coordinates: [139.7671, 35.6762] },
  { name: 'Singapore, Marina Bay', country: 'Singapore', region: 'Asia', coordinates: [103.8585, 1.2838] },
  { name: 'Hong Kong, Central', country: 'Hong Kong', region: 'Asia', coordinates: [114.1694, 22.3193] },
  { name: 'Sydney, Point Piper', country: 'Australia', region: 'Oceania', coordinates: [151.25, -33.86] },
  { name: 'São Paulo, Jardins', country: 'Brazil', region: 'Americas', coordinates: [-46.66, -23.56] },
];

// Calculate great-circle distance between two [lon, lat] coordinates via Haversine
function calculateHaversineDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Calculate compass bearing from coord1 to coord2
function calculateBearing(coord1: [number, number], coord2: [number, number]): { degrees: number; compass: string } {
  const [lon1, lat1] = coord1.map((v) => (v * Math.PI) / 180);
  const [lon2, lat2] = coord2.map((v) => (v * Math.PI) / 180);

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const compassPoints = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(brng / 22.5) % 16;

  return { degrees: Math.round(brng), compass: compassPoints[index] };
}

export type DeliveryTierId = 'air-priority' | 'enclosed-transporter' | 'maritime-vault' | 'helo-jet-rapid';

export interface DeliveryTier {
  id: DeliveryTierId;
  name: string;
  icon: typeof Plane;
  tagline: string;
  description: string;
  basePrepTimeHours: number;
  speedKmh: number;
  available: boolean;
  unavailabilityReason?: string;
  securityRating: string;
  climateControl: string;
  priceEstimate: string;
  badgeText: string;
}

interface DeliveryOptionsProps {
  initialCar?: CarModel | null;
  onClose?: () => void;
  isModal?: boolean;
}

export const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({
  initialCar,
  onClose,
  isModal = false,
}) => {
  const { isSunset } = useTheme();
  const { t } = useLanguage();

  // Selected vehicle for delivery
  const [selectedCar, setSelectedCar] = useState<CarModel>(initialCar || CARS[0]);

  // User location state
  const [userCoord, setUserCoord] = useState<[number, number]>([-74.006, 40.7128]); // default NYC
  const [locationName, setLocationName] = useState<string>('New York City, NY (East Coast Americas)');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccess, setLocationSuccess] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Selected delivery tier
  const [selectedTierId, setSelectedTierId] = useState<DeliveryTierId>('air-priority');

  // Imperial vs Metric toggle
  const [isMetric, setIsMetric] = useState<boolean>(true);

  // Booking confirmation toast
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Detect user geolocation automatically
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    triggerHaptic();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lon = Number(position.coords.longitude.toFixed(4));
        setUserCoord([lon, lat]);
        setLocationName(`Current GPS Coordinates (${lat}° N, ${lon}° E)`);
        setIsLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation detection error:', err);
        setLocationError('Location access was denied or timed out. Please select from presets.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  // Compute distances to all distribution centers
  const distributionCenterDistances = useMemo(() => {
    return DISTRIBUTION_CENTERS.map((dc) => {
      const distanceKm = calculateHaversineDistanceKm(dc.coordinates, userCoord);
      const distanceMiles = Math.round(distanceKm * 0.621371);
      const bearing = calculateBearing(dc.coordinates, userCoord);

      return {
        ...dc,
        distanceKm,
        distanceMiles,
        bearing,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [userCoord]);

  // Nearest distribution center
  const nearestDC = distributionCenterDistances[0];

  // Delivery options & formulas
  const deliveryTiers: DeliveryTier[] = useMemo(() => {
    const distKm = nearestDC.distanceKm;

    // Check overland availability (roughly < 3,500 km and on same continent/landmass)
    const isOverlandFeasible = distKm <= 3500;

    return [
      {
        id: 'air-priority',
        name: 'Apex Air-Freight Priority Charter',
        icon: Plane,
        tagline: 'Boeing 777F / Antonov Climate Capsule Direct',
        description:
          'Dedicated climate-isolated cargo flight in hermetically sealed titanium freight crate. Real-time dual-band satcom telemetry link.',
        basePrepTimeHours: 18,
        speedKmh: 820,
        available: true,
        securityRating: 'Level 5 Armed Courier Escort',
        climateControl: 'Hermetic N2 Purge (18°C - 21°C Constant)',
        priceEstimate: 'COMPLIMENTARY WITH ALLOCATION',
        badgeText: 'FASTEST INTERCONTINENTAL',
      },
      {
        id: 'enclosed-transporter',
        name: 'Apex White-Glove Enclosed Transporter',
        icon: Truck,
        tagline: 'Hydraulic Air-Ride Transporter with Dual Master Drivers',
        description:
          'Overland bespoke multi-axle air-ride hauler with full carbon belly-pan support and non-stop twin-driver transit.',
        basePrepTimeHours: 12,
        speedKmh: 85,
        available: isOverlandFeasible,
        unavailabilityReason: 'Distance exceeds 3,500 km or trans-oceanic flight required.',
        securityRating: 'GPS Locked & Kinetic Sensors',
        climateControl: 'Active Hepa Micro-filtration',
        priceEstimate: 'INCLUDED WITH WHITE-GLOVE SERVICE',
        badgeText: 'OPTIMAL CONTINENTAL',
      },
      {
        id: 'helo-jet-rapid',
        name: 'Apex VIP Rapid Runway / Helo Direct',
        icon: Zap,
        tagline: 'Private Airfield, Superyacht Helipad, or Race Circuit Handover',
        description:
          'Express delivery directly to private airport hangars, motor-racing pits, or luxury estate landing pads under 36 hours.',
        basePrepTimeHours: 10,
        speedKmh: 750,
        available: true,
        securityRating: 'Direct Factory Test Driver Handover',
        climateControl: 'Pre-Delivery Run-In Complete',
        priceEstimate: 'ON-DEMAND VIP CONCIERGE',
        badgeText: 'ULTRA VIP EXPEDITED',
      },
      {
        id: 'maritime-vault',
        name: 'Apex Hermetic Ocean Vault Pod',
        icon: Ship,
        tagline: 'Nitrogen-Shielded Dehumidified Container Liner',
        description:
          'For multi-vehicle collector deliveries or sea-freight transfers. Nitrogen-charged 40ft container with desiccant atmosphere.',
        basePrepTimeHours: 48,
        speedKmh: 42,
        available: distKm > 2000,
        unavailabilityReason: 'Recommended only for intercontinental transit > 2,000 km.',
        securityRating: 'Tamper-Evident Satellite Seal',
        climateControl: 'Dry Inert Gas Sealed',
        priceEstimate: 'SUSTAINABLE MARITIME CREDIT',
        badgeText: 'COLLECTOR FLEET & LOW EMISSION',
      },
    ];
  }, [nearestDC.distanceKm]);

  // Selected Tier
  const activeTier = deliveryTiers.find((t) => t.id === selectedTierId) || deliveryTiers[0];

  // Calculated Shipping Timeline
  const timelineCalculation = useMemo(() => {
    const distKm = nearestDC.distanceKm;

    // Calculate transit hours based on tier speed
    const transitHours = Math.max(2, Math.round(distKm / activeTier.speedKmh));
    const customsAndPrepHours = activeTier.basePrepTimeHours;
    const totalHours = customsAndPrepHours + transitHours;

    // Days calculation (24h per day)
    const businessDaysMin = Math.max(1, Math.floor(totalHours / 24));
    const businessDaysMax = businessDaysMin + (activeTier.id === 'maritime-vault' ? 4 : 1);

    // Estimated arrival date from today
    const now = new Date();
    const arrivalDateMin = new Date(now.getTime() + businessDaysMin * 24 * 60 * 60 * 1000);
    const arrivalDateMax = new Date(now.getTime() + businessDaysMax * 24 * 60 * 60 * 1000);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedArrival = `${arrivalDateMin.toLocaleDateString(undefined, dateOptions)} - ${arrivalDateMax.toLocaleDateString(undefined, dateOptions)}`;

    // Milestones
    const milestones = [
      {
        title: 'Factory PDI & Carbon Monocoque Telemetry Lock',
        duration: '10 - 14 Hours',
        location: `${nearestDC.city} Cleanroom`,
        detail: 'Laser chassis alignment, fluids degassing, and telemetry crypto-key pairing.',
        icon: ShieldCheck,
      },
      {
        title: `Dispatch from ${nearestDC.code}`,
        duration: '2 - 4 Hours',
        location: nearestDC.name,
        detail: `Loaded into ${activeTier.name} with live satellite telemetry pinging every 10s.`,
        icon: Package,
      },
      {
        title: 'Air / Overland Transit Corridor',
        duration: `${transitHours} Hours (${isMetric ? `${distKm.toLocaleString()} km` : `${nearestDC.distanceMiles.toLocaleString()} miles`})`,
        location: `Direct Bearing ${nearestDC.bearing.compass} (${nearestDC.bearing.degrees}°)`,
        detail: `Continuous climate monitoring at 20°C with 0.05G shock threshold protection.`,
        icon: activeTier.icon,
      },
      {
        title: 'Priority Customs Homologation & Arrival Hub',
        duration: '4 - 8 Hours',
        location: 'Destination Port / Jet Terminal',
        detail: 'Pre-cleared diplomatic registration paperwork and street-legal homologation seal.',
        icon: MapPin,
      },
      {
        title: 'White-Glove Handover by Master Test Driver',
        duration: 'Immediate on Arrival',
        location: locationName,
        detail: 'Bespoke carbon key casing presentation, telemetry pairing to mobile app, and track briefing.',
        icon: CheckCircle,
      },
    ];

    return {
      distKm,
      transitHours,
      totalHours,
      businessDaysMin,
      businessDaysMax,
      formattedArrival,
      milestones,
    };
  }, [nearestDC, activeTier, isMetric, locationName]);

  const primaryAccent = isSunset ? '#FFAA33' : '#FF5A1F';

  return (
    <div
      className={`relative w-full ${
        isModal
          ? 'max-w-4xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-5 sm:p-8 border border-white/15 bg-black/95 backdrop-blur-2xl shadow-2xl my-6'
          : 'glass-card rounded-3xl p-5 sm:p-8 border border-white/10 bg-black/70 backdrop-blur-xl shadow-xl'
      }`}
    >
      {/* Modal Close Button if in modal */}
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-panel text-white/70 hover:text-white transition-colors cursor-pointer z-20 border border-white/10"
          aria-label="Close delivery options"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider mb-2 border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 text-[#FF5A1F]">
            <Truck className="w-3.5 h-3.5" />
            <span>Apex Global Logistics & Shipping Calculator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display uppercase text-white flex items-center gap-2">
            <span>Delivery Options</span>
            <span className="text-white/40 text-lg font-mono font-normal">| Real-Time Transit</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Instant timeline calculations based on your geographic coordinates relative to our global distribution centers in Austin, Modena, Silverstone, Dubai, Tokyo, and Singapore.
          </p>
        </div>

        {/* Units & Quick Controls */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setIsMetric(true)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              isMetric
                ? isSunset ? 'bg-[#FFAA33] text-black font-bold' : 'bg-[#FF5A1F] text-white font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            KM (Metric)
          </button>
          <button
            type="button"
            onClick={() => setIsMetric(false)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              !isMetric
                ? isSunset ? 'bg-[#FFAA33] text-black font-bold' : 'bg-[#FF5A1F] text-white font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            MILES (Imperial)
          </button>
        </div>
      </div>

      {/* Vehicle Allocation Selector */}
      <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-white/60 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Selected Hypercar Allocation</span>
          </span>
          <span className="text-xs font-mono text-[#00E5FF]">
            Monocoque Status: Factory Validated • Ready for Dispatch
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {CARS.map((car) => {
            const isSelected = selectedCar.id === car.id;
            return (
              <button
                key={car.id}
                type="button"
                onClick={() => {
                  setSelectedCar(car);
                  triggerHaptic();
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isSunset
                      ? 'border-[#FFAA33] bg-[#FFAA33]/15 shadow-[0_0_12px_rgba(255,170,51,0.3)]'
                      : 'border-[#FF5A1F] bg-[#FF5A1F]/15 shadow-[0_0_12px_rgba(255,90,31,0.3)]'
                    : 'border-white/10 bg-black/40 hover:border-white/30 text-white/70'
                }`}
              >
                <div className="text-[11px] font-bold font-display uppercase truncate text-white">
                  {car.name}
                </div>
                <div className="text-[10px] font-mono text-white/50 truncate">
                  {car.specs.weight}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Geolocation Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Location Input / Detection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl border border-white/10 bg-black/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Your Destination</span>
              </span>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors cursor-pointer disabled:opacity-50"
                title="Detect location automatically via GPS"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Acquiring...' : 'Use My GPS'}</span>
              </button>
            </div>

            {/* Current Selected Location Indicator */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span className="truncate">{locationName}</span>
                {locationSuccess && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-white/50 mt-1 flex items-center gap-2">
                <span>Lat: {userCoord[1].toFixed(2)}°</span>
                <span>•</span>
                <span>Lon: {userCoord[0].toFixed(2)}°</span>
              </div>
            </div>

            {locationError && (
              <div className="text-[11px] text-amber-400 flex items-center gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Presets Dropdown / Quick Select */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-1.5">
                Select Global Metro Preset:
              </label>
              <select
                aria-label="Select client location preset"
                value={locationName}
                onChange={(e) => {
                  const preset = LOCATION_PRESETS.find((p) => p.name === e.target.value);
                  if (preset) {
                    setUserCoord(preset.coordinates);
                    setLocationName(`${preset.name} (${preset.country})`);
                    triggerHaptic();
                  }
                }}
                className="w-full bg-black/70 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
              >
                {LOCATION_PRESETS.map((p) => (
                  <option key={p.name} value={p.name} className="bg-black text-white">
                    {p.name} — {p.country} ({p.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nearest Distribution Center Card */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#BEBEBE]">
                // OPTIMAL FULFILLMENT HUB
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                NEAREST DISPATCH
              </span>
            </div>

            <div>
              <div className="text-sm font-bold font-display uppercase text-white flex items-center gap-2">
                <span>{nearestDC.name}</span>
                <span className="text-xs font-mono text-[#FF5A1F]">[{nearestDC.code}]</span>
              </div>
              <div className="text-xs text-white/70 mt-0.5">
                {nearestDC.city}, {nearestDC.country}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/10">
              <div>
                <span className="text-white/40 block text-[10px]">DIRECT DISTANCE:</span>
                <span className="text-white font-bold text-sm">
                  {isMetric
                    ? `${nearestDC.distanceKm.toLocaleString()} km`
                    : `${nearestDC.distanceMiles.toLocaleString()} miles`}
                </span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">RADIAL BEARING:</span>
                <span className="text-[#00E5FF] font-bold text-sm flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>
                    {nearestDC.bearing.compass} ({nearestDC.bearing.degrees}°)
                  </span>
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-white/60 p-2 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span>Vault Capacity:</span>
                <span className="text-white">{nearestDC.climateVaultCapacity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Customs Speed:</span>
                <span className="text-emerald-400">{nearestDC.customsClearanceSpeed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2-Cols: Shipping Tiers & Timeline Calculation */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shipping Tiers Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliveryTiers.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              const Icon = tier.icon;
              return (
                <button
                  key={tier.id}
                  type="button"
                  disabled={!tier.available}
                  onClick={() => {
                    if (tier.available) {
                      setSelectedTierId(tier.id);
                      triggerHaptic();
                    }
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                    !tier.available
                      ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                      : isSelected
                      ? isSunset
                        ? 'border-[#FFAA33] bg-[#FFAA33]/10 shadow-[0_0_15px_rgba(255,170,51,0.25)] ring-1 ring-[#FFAA33]'
                        : 'border-[#FF5A1F] bg-[#FF5A1F]/10 shadow-[0_0_15px_rgba(255,90,31,0.25)] ring-1 ring-[#FF5A1F]'
                      : 'border-white/10 bg-white/5 hover:border-white/30 text-white/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-xl ${
                          isSelected
                            ? isSunset ? 'bg-[#FFAA33] text-black' : 'bg-[#FF5A1F] text-white'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-display uppercase text-white">
                          {tier.name}
                        </div>
                        <div className="text-[10px] font-mono text-white/50">
                          {tier.tagline}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/70 leading-relaxed my-2">
                    {tier.description}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#00E5FF]">{tier.badgeText}</span>
                    <span className="text-white/60">{tier.priceEstimate}</span>
                  </div>

                  {!tier.available && tier.unavailabilityReason && (
                    <div className="mt-2 text-[10px] font-mono text-amber-400">
                      ℹ️ {tier.unavailabilityReason}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeline & Estimated Handover Breakdown */}
          <div className="p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-black/80 to-white/[0.03] space-y-5">
            {/* Arrival Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                  ESTIMATED DOORSTEP HANDOVER TIMELINE
                </span>
                <div className="text-xl sm:text-2xl font-extrabold font-display uppercase text-white mt-0.5">
                  {timelineCalculation.businessDaysMin} - {timelineCalculation.businessDaysMax} Business Days
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target Arrival: {timelineCalculation.formattedArrival}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                  TOTAL CALIBRATED TRANSIT
                </span>
                <div className="text-lg font-bold font-mono text-[#00E5FF]">
                  ~{timelineCalculation.totalHours} Hours
                </div>
                <div className="text-[10px] font-mono text-white/40">
                  Prep: {activeTier.basePrepTimeHours}h • Transit: {timelineCalculation.transitHours}h
                </div>
              </div>
            </div>

            {/* Step-by-Step Logistics Milestones */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-white/60 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Logistics Chain & Telemetry Security Pipeline</span>
              </h3>

              <div className="relative pl-6 space-y-4 border-l border-white/15 ml-3">
                {timelineCalculation.milestones.map((m, idx) => {
                  const StepIcon = m.icon;
                  return (
                    <div key={idx} className="relative group">
                      {/* Node Bullet */}
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          idx === 0
                            ? 'bg-emerald-500 border-white'
                            : 'bg-black border-white/40'
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <StepIcon className="w-3.5 h-3.5 text-[#FF5A1F]" />
                          <span>{m.title}</span>
                        </span>
                        <span className="text-[10px] font-mono text-white/50">
                          {m.duration} • {m.location}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
                        {m.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Handover Concierge CTA */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-white/60 font-mono">
                Security Guarantee: 100% Insured in-transit with biometric factory driver hand-off.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBookingConfirmed(true);
                    triggerHaptic();
                    setTimeout(() => setBookingConfirmed(false), 4500);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                    isSunset
                      ? 'bg-[#FFAA33] hover:bg-[#ffbe5b] text-black shadow-[0_0_15px_rgba(255,170,51,0.3)]'
                      : 'bg-gradient-to-r from-[#FF5A1F] to-[#FF3B00] text-black hover:brightness-110 shadow-[0_0_15px_rgba(255,90,31,0.3)]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reserve Handover Window</span>
                </button>
              </div>
            </div>

            {/* Confirmation Toast */}
            <AnimatePresence>
              {bookingConfirmed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Delivery Handover Window Reserved for <strong>{selectedCar.name}</strong> from <strong>{nearestDC.name}</strong> to <strong>{locationName}</strong>.
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50">Tracking PIN #APX-9482</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
