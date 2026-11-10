import { CarModel } from '../types';
import heroPoster from '../assets/images/apex_hero_poster_1785141175569.jpg';
import redPhantom from '../assets/images/hypercar_red_phantom_1785141193540.jpg';
import blackMantis from '../assets/images/hypercar_black_mantis_1785141210537.jpg';
import porscheFlagship from '../assets/images/porsche_supercar_flagship_1792048299805.jpg';
import shadowGt3 from '../assets/images/josh-berquist-pjxe3p4u5aI-unsplash.jpg';
import interiorLuxury from '../assets/images/interior_luxury_1785141240879.jpg';
import cyanVortex from '../assets/images/hypercar_cyan_vortex_1792045662810.jpg';
import amberSolaris from '../assets/images/hypercar_amber_solaris_1792045662629.jpg';

// Newly added car collection assets
import ferrariRosso from '../assets/images/ferrari_rosso_italia_1792048883287.jpg';
import amethystHypercar from '../assets/images/monaco_amethyst_hypercar_1792048884242.jpg';
import titaniumTrack from '../assets/images/titanium_track_beast_1792048884683.jpg';
import emeraldGt from '../assets/images/emerald_gt_bespoke_1792048884907.jpg';
import cyberSpeedster from '../assets/images/cyber_white_speedster_1792048885845.jpg';
import stealthCoupe from '../assets/images/stealth_monochrome_coupe_1792048885848.jpg';
import sapphireStradale from '../assets/images/sapphire_stradale_gt_1792048886579.jpg';
import coastalWidebody from '../assets/images/coastal_widebody_exotic_1792048887841.jpg';
import bmwMShadow from '../assets/images/bmw_m_shadow_coupe_1792048887559.jpg';

export const CARS_DATA: CarModel[] = [
  {
    id: 'phantom-x',
    name: 'Phantom Velocity X',
    subtitle: 'The Pinnacle of Aerodynamic Crimson Power',
    category: 'Hypercar',
    price: '$2,850,000',
    acceleration: '1.9s 0-60 mph',
    topSpeed: '273 mph',
    power: '1,850 HP',
    range: '380 miles',
    image: redPhantom,
    gallery: [redPhantom, heroPoster, interiorLuxury, blackMantis],
    description: 'Forged with vacuum-infused carbon-nanotube monocoque chassis and dual-vector electromagnetic powertrains, the Phantom Velocity X sets a new benchmark for hypercar performance.',
    features: [
      'Active Morphing Aero Wings',
      'Quantum Vectoring Quad Motors',
      'Graphene Solid-State Thermal Battery',
      'Bespoke AR HUD Windshield'
    ],
    specs: {
      engine: 'Quad Electromagnetic Permanent Magnet Motors',
      drivetrain: 'All-Wheel Active Torque Vectoring',
      chassis: 'Full Carbon-Titanium Monocoque',
      weight: '3,210 lbs (1,456 kg)',
      batteryCapacity: '120 kWh High-Density Module',
      chargingTime: '80% in 9 minutes (800V Ultra-Fast)'
    }
  },
  {
    id: 'cyan-vortex',
    name: 'Apex Aetheris Vortex',
    subtitle: 'Electric Cyan Superstructure with Sub-2s Dominance',
    category: 'Hypercar',
    price: '$3,450,000',
    acceleration: '1.75s 0-60 mph',
    topSpeed: '285 mph',
    power: '2,100 HP',
    range: '420 miles',
    image: cyanVortex,
    gallery: [cyanVortex, amberSolaris, porscheFlagship, interiorLuxury],
    description: 'Engineered in zero-drag hyper-windtunnels, the Aetheris Vortex features exposed weave carbon fiber aerodynamic splitters, dual active rear airfoils, and liquid-nitrogen cooling for its quad flux motors.',
    features: [
      'Sub-2-Second Zero-to-Sixty Acceleration',
      'Hex-LED Matrix Active Aero Lights',
      'Active Ground Effect Venturi Tunnels',
      'Formula-E Grade Dual Inverters'
    ],
    specs: {
      engine: 'Apex Quad Flux Axial Electric Powertrain',
      drivetrain: 'Intelligent Real-Time Dynamic AWD',
      chassis: 'Pre-Preg Carbon Fiber & Honeycomb Monocoque',
      weight: '3,120 lbs (1,415 kg)',
      batteryCapacity: '130 kWh Cryo-Cooled Cell Array',
      chargingTime: '80% in 7.5 minutes'
    }
  },
  {
    id: 'amber-solaris',
    name: 'Apex Solaris GT',
    subtitle: 'Metallic Amber Bronze with Continuous Lightbar Architecture',
    category: 'Hypercar',
    price: '$2,650,000',
    acceleration: '2.0s 0-60 mph',
    topSpeed: '268 mph',
    power: '1,750 HP',
    range: '440 miles',
    image: amberSolaris,
    gallery: [amberSolaris, cyanVortex, blackMantis, interiorLuxury],
    description: 'Captured bathed in city neon reflections, the Solaris GT features a flowing organic rear aerodynamic curve, infinity loop LED taillights, and sculpted aero vents for supreme stability at terminal velocity.',
    features: [
      'Signature Continuous Loop LED Taillight Array',
      'Ultra-Light Forged Magnesium Wheels',
      'Variable Camber Electro-Suspension',
      'Acoustic Carbon-Infused Cabin Insulation'
    ],
    specs: {
      engine: 'Tri-Motor Hyper-Synchronous System',
      drivetrain: 'Adaptive Rear-Biased Torque Splitter',
      chassis: 'Hybrid Magnesium-Carbon Aerospace Cage',
      weight: '3,280 lbs (1,488 kg)',
      batteryCapacity: '125 kWh Next-Gen Silicon Anode',
      chargingTime: '80% in 10 minutes'
    }
  },
  {
    id: 'mantis-gt',
    name: 'Mantis Cyber GT',
    subtitle: 'Stealth Aerospace Architecture with Zero Latency Control',
    category: 'Cyber-Coupe',
    price: '$1,950,000',
    acceleration: '2.1s 0-60 mph',
    topSpeed: '252 mph',
    power: '1,500 HP',
    range: '410 miles',
    image: blackMantis,
    gallery: [blackMantis, interiorLuxury, heroPoster, shadowGt3],
    description: 'Designed in collaboration with aerospace engineers, the Mantis Cyber GT features active radar-absorbing matte composite bodywork and neural steering response.',
    features: [
      'Radar-Invisible Carbon Matrix',
      'Biometric Pilot Authentication',
      'Adaptive Electrochromic Glass Roof',
      'Track-Optimized Regenerative Braking'
    ],
    specs: {
      engine: 'Tri-Motor Synchro-Reluctance System',
      drivetrain: 'Rear-Biased AWD with Drift Mode',
      chassis: 'Honeycomb Aluminum-Carbon Composite',
      weight: '3,350 lbs (1,520 kg)',
      batteryCapacity: '110 kWh Solid Architecture',
      chargingTime: '80% in 11 minutes'
    }
  },
  {
    id: 'silver-ghost',
    name: 'Apex Porsche Mission Hyper-GT',
    subtitle: 'Bespoke Aerodynamic Prototype with Quad-Matrix Lighting',
    category: 'Hypercar',
    price: '$2,750,000',
    acceleration: '1.95s 0-60 mph',
    topSpeed: '272 mph',
    power: '1,750 HP',
    range: '410 miles',
    image: porscheFlagship,
    gallery: [porscheFlagship, redPhantom, interiorLuxury, cyanVortex],
    description: 'Forged with sculpted aerodynamic carbon-fiber bodywork, signature quad-matrix LED headlights, and track-engineered active rear wings, delivering razor-sharp agility and hypercar dominance.',
    features: [
      'Quad-Matrix Laser LED Headlights',
      'Active Carbon Aero Wing & Diffuser',
      'Ceramic Composite Yellow Calipers',
      'Ultra-Lightweight Center-Lock Forged Wheels'
    ],
    specs: {
      engine: 'Apex High-Torque Dual Permanent-Magnet Drives',
      drivetrain: 'Torque-Vectoring Electronic Differential AWD',
      chassis: 'Full Monocoque Carbon Core & Titanium Subframe',
      weight: '3,190 lbs (1,447 kg)',
      batteryCapacity: '115 kWh Solid-State Hyper-Array',
      chargingTime: '80% in 9.5 minutes'
    }
  },
  {
    id: 'ghost-gt',
    name: 'Apex Shadow GT3',
    subtitle: 'Stealth Matte Aero Coupe at Golden Hour Harbor',
    category: 'Electric GT',
    price: '$1,850,000',
    acceleration: '2.2s 0-60 mph',
    topSpeed: '245 mph',
    power: '1,450 HP',
    range: '460 miles',
    image: shadowGt3,
    gallery: [shadowGt3, interiorLuxury, redPhantom, heroPoster],
    description: 'Featuring aggressive carbon aero bodywork, yellow ceramic performance brake calipers, and a high-downforce rear wing, the Apex Shadow GT3 is captured in its element at coastal golden hour.',
    features: [
      'High-Downforce Active Carbon Wing',
      'Ceramic Composite Yellow Calipers',
      'Ultra-Lightweight Center-Lock Forged Wheels',
      'Aero-Fender Louvers & Integrated Diffuser'
    ],
    specs: {
      engine: 'High-RPM Dual Vector Electric Powertrain',
      drivetrain: 'Track-Tuned Rear-Biased AWD',
      chassis: 'Matte Black Lightweight Carbon Shell',
      weight: '3,180 lbs (1,442 kg)',
      batteryCapacity: '115 kWh Track Endurance Pack',
      chargingTime: '80% in 12 minutes'
    }
  },
  {
    id: 'mustang-futura',
    name: 'Apex 1968 Futura Fastback',
    subtitle: 'Reimagined Heritage Icon with 2,000 HP Cyber Powertrain',
    category: 'Concept',
    price: '$3,200,000',
    acceleration: '1.8s 0-60 mph',
    topSpeed: '280 mph',
    power: '2,000 HP',
    range: '350 miles',
    image: heroPoster,
    gallery: [heroPoster, redPhantom, blackMantis, interiorLuxury],
    description: 'Directly inspired by our hero unveil video, the 1968 Futura Fastback merges classic American muscle silhouettes with cyber-neon lighting, silk shroud unveils, and raw electric dominance.',
    features: [
      'Custom Unveil Silk Shroud & Auto-Elevate System',
      '3D Holographic Cluster Display',
      'Sequential LED Matrix Tail Assembly',
      'Titanium Ceramic Carbon Brakes'
    ],
    specs: {
      engine: 'Apex Quad-Core Hyper-Drive Unit',
      drivetrain: 'Direct Drive Electronic Differential',
      chassis: 'Bespoke Tubular Chrome-Moly & Carbon',
      weight: '3,100 lbs (1,406 kg)',
      batteryCapacity: '100 kWh Race-Spec Unit',
      chargingTime: '80% in 8 minutes'
    }
  },
  {
    id: 'rosso-stradale',
    name: 'Apex Rosso Stradale GT',
    subtitle: 'Mid-Engine Hybrid Track Weapon in Scarlet Rosso Corsa',
    category: 'Track Edition',
    price: '$2,950,000',
    acceleration: '1.85s 0-60 mph',
    topSpeed: '268 mph',
    power: '1,920 HP',
    range: '410 miles',
    image: ferrariRosso,
    gallery: [ferrariRosso, titaniumTrack, porscheFlagship, interiorLuxury],
    description: 'Forged on legendary Grand Prix asphalt, the Rosso Stradale GT pairs a twin-turbo hybrid V8 core with cutting-edge aerodynamic splitters, ceramic yellow calipers, and active downforce flaps.',
    features: [
      'Twin-Turbo Hybrid High-Rev Powertrain',
      'Ceramic Composite Track Yellow Calipers',
      'Active Dual-Tunnel Front Splitters',
      'Formula Telemetry HUD Cockpit'
    ],
    specs: {
      engine: 'Twin-Turbo V8 Hybrid with Tri-Motor E-Boost',
      drivetrain: 'Dual-Clutch 8-Speed Vectoring AWD',
      chassis: 'Full Monocoque Carbon Fiber Tub',
      weight: '3,120 lbs (1,415 kg)',
      batteryCapacity: '95 kWh Track Hybrid Array',
      chargingTime: '80% in 11 minutes'
    }
  },
  {
    id: 'amethyst-roadster',
    name: 'Apex Monaco Amethyst Hypercar',
    subtitle: 'Royal Purple Carbon Silhouette with Dihedral Butterfly Doors',
    category: 'Hypercar',
    price: '$3,600,000',
    acceleration: '1.90s 0-60 mph',
    topSpeed: '275 mph',
    power: '2,050 HP',
    range: '390 miles',
    image: amethystHypercar,
    gallery: [amethystHypercar, emeraldGt, sapphireStradale, interiorLuxury],
    description: 'An elite bespoke hypercar designed for European Riviera coastal supremacy. Featuring deep metallic royal purple carbon weave, dramatic dihedral doors, and quad titanium exhausts.',
    features: [
      'Dihedral Synchronous Butterfly Doors',
      'Exposed Amethyst-Infused Carbon Weave',
      'Center-Lock Forged Magnesium Wheels',
      'Italian Aniline Leather & Titanium Cabin'
    ],
    specs: {
      engine: 'Quad Hyper-Flux Magnet Motors',
      drivetrain: 'Independent Four-Wheel Torque Vectoring',
      chassis: 'Carbo-Titanium HP62 Monocoque',
      weight: '3,080 lbs (1,397 kg)',
      batteryCapacity: '110 kWh Solid-State Unit',
      chargingTime: '80% in 9 minutes'
    }
  },
  {
    id: 'valkyrie-apex27',
    name: 'Apex Valkyrie Apex-27',
    subtitle: 'Satin Titanium Le Mans Prototype with Swan-Neck Aero Wing',
    category: 'Track Edition',
    price: '$3,850,000',
    acceleration: '1.70s 0-60 mph',
    topSpeed: '290 mph',
    power: '2,200 HP',
    range: '340 miles',
    image: titaniumTrack,
    gallery: [titaniumTrack, ferrariRosso, stealthCoupe, interiorLuxury],
    description: 'Directly derived from endurance prototype racing, the Apex-27 generates over 2,400 lbs of downforce with its radical swan-neck active rear wing and venturi floor aerodynamics.',
    features: [
      'Swan-Neck High-Downforce Active Wing',
      'Full Venturi Underfloor Ground Effect Tunnels',
      'Race-Spec Number 27 Competition Livery',
      'Pneumatic Air-Jack Rapid Pit System'
    ],
    specs: {
      engine: 'Le Mans Prototype Electric Hyper-Core',
      drivetrain: 'Direct-Drive Differential Track AWD',
      chassis: 'Ultra-Stiff Honeycomb Carbon Composite',
      weight: '2,890 lbs (1,310 kg)',
      batteryCapacity: '105 kWh Sprint-Spec Cell Array',
      chargingTime: '80% in 7.5 minutes'
    }
  },
  {
    id: 'emerald-gt',
    name: 'Apex Emerald Gran Turismo',
    subtitle: 'Liquid Emerald Racing Coupe with Forged Bronze Center-Locks',
    category: 'Electric GT',
    price: '$2,100,000',
    acceleration: '2.10s 0-60 mph',
    topSpeed: '255 mph',
    power: '1,650 HP',
    range: '480 miles',
    image: emeraldGt,
    gallery: [emeraldGt, sapphireStradale, bmwMShadow, interiorLuxury],
    description: 'The epitome of high-speed grand touring elegance. Styled in rich metallic racing green with wide muscular rear haunches and bronze multi-spoke wheels, built for cross-continental sprints.',
    features: [
      'Forged Bronze Center-Lock Lightweight Wheels',
      'Active Acoustic Noise Cancellation Cockpit',
      'Dual-Chamber Air Suspension with Geo-Lift',
      'Saddle Brown Heritage Leather & Open-Pore Walnut'
    ],
    specs: {
      engine: 'Tri-Motor High-Efficiency Gran Turismo Drive',
      drivetrain: 'Smart Adaptive All-Wheel Drive',
      chassis: 'Hybrid Aluminum-Carbon GT Architecture',
      weight: '3,450 lbs (1,565 kg)',
      batteryCapacity: '130 kWh Ultra-Long-Range Pack',
      chargingTime: '80% in 13 minutes'
    }
  },
  {
    id: 'cyber-speedster',
    name: 'Apex Cyber-Aero Speedster',
    subtitle: 'Pearl White Cybernetic Prototype with Neon Flux Lighting',
    category: 'Cyber-Coupe',
    price: '$2,650,000',
    acceleration: '1.80s 0-60 mph',
    topSpeed: '280 mph',
    power: '1,980 HP',
    range: '440 miles',
    image: cyberSpeedster,
    gallery: [cyberSpeedster, stealthCoupe, cyanVortex, interiorLuxury],
    description: 'Futuristic aerodynamic design featuring glowing neon blue cybernetic ground effects, active hood louvers, and runway-blistering acceleration with zero engine lag.',
    features: [
      'Signature Cyan Neon Ground-Effect Halo',
      'Active Morphing Front Hood Aero Ducts',
      'Twin Variable-Geometry Rear Spoilers',
      'Neural-Link Driver Predictive Telemetry'
    ],
    specs: {
      engine: 'Apex Dual-Vector Cybernetic Flux Drive',
      drivetrain: 'Dynamic Continuous Torque Vectoring',
      chassis: 'Thermoset Composite Monocoque',
      weight: '3,150 lbs (1,428 kg)',
      batteryCapacity: '118 kWh Cyber-Cell Array',
      chargingTime: '80% in 8.5 minutes'
    }
  },
  {
    id: 'nocturne-stealth',
    name: 'Apex Nocturne Stealth Coupe',
    subtitle: 'Full Carbon-Weave Monocoque with Active Ground Effects',
    category: 'Cyber-Coupe',
    price: '$3,150,000',
    acceleration: '1.88s 0-60 mph',
    topSpeed: '272 mph',
    power: '1,890 HP',
    range: '415 miles',
    image: stealthCoupe,
    gallery: [stealthCoupe, titaniumTrack, shadowGt3, interiorLuxury],
    description: 'Cloaked in matte carbon stealth black with yellow Brembo carbon ceramic calipers and minimalist projector optics, the Nocturne is an understated triumph of pure speed.',
    features: [
      'Full Exposed Matte Carbon Fiber Exterior',
      'Integrated Underbody Diffuser with Vortex Generators',
      'Center-Mount Single Wiper Monoblade',
      'Carbon-Kevlar Lightweight Bucket Seats'
    ],
    specs: {
      engine: 'Apex High-Torque Axial-Flux Electric Unit',
      drivetrain: 'Electronic Locking Differential AWD',
      chassis: 'Pure Carbon Fiber Shell with Titanium Subframes',
      weight: '2,990 lbs (1,356 kg)',
      batteryCapacity: '112 kWh Stealth Pack',
      chargingTime: '80% in 10 minutes'
    }
  },
  {
    id: 'sapphire-stradale',
    name: 'Apex Sapphire Stradale',
    subtitle: 'Long-Tail Aerodynamic Hyper-GT in Royal Metallic Sapphire',
    category: 'Electric GT',
    price: '$2,450,000',
    acceleration: '2.00s 0-60 mph',
    topSpeed: '265 mph',
    power: '1,720 HP',
    range: '450 miles',
    image: sapphireStradale,
    gallery: [sapphireStradale, emeraldGt, coastalWidebody, interiorLuxury],
    description: 'Boasting a streamlined teardrop canopy, extended rear tail geometry for reduced aerodynamic drag, and breathtaking sapphire blue reflections, built for serene ultra-high speeds.',
    features: [
      'Streamlined Long-Tail Low-Drag Silhouette',
      'Panoramic Electrochromic Glass Canopy',
      'Active Rear Aero Ailerons',
      'Three-Seat Central Driving Position'
    ],
    specs: {
      engine: 'High-Speed Hyper-GT Hybrid Powertrain',
      drivetrain: 'Rear-Wheel Biased Intelligent AWD',
      chassis: 'Bespoke Carbon Monocage III',
      weight: '3,250 lbs (1,474 kg)',
      batteryCapacity: '122 kWh Hyper-Range Pack',
      chargingTime: '80% in 12 minutes'
    }
  },
  {
    id: 'pacifica-widebody',
    name: 'Apex Pacifica Widebody GT',
    subtitle: 'High-Downforce Twin-Diffuser Aero Weapon in Matte Graphite',
    category: 'Hypercar',
    price: '$2,300,000',
    acceleration: '2.05s 0-60 mph',
    topSpeed: '260 mph',
    power: '1,680 HP',
    range: '430 miles',
    image: coastalWidebody,
    gallery: [coastalWidebody, bmwMShadow, ferrariRosso, interiorLuxury],
    description: 'Sculpted for twisty coastal highways and canyon passes. Widebody stance, aggressive multi-element rear diffuser, and top-exit sport exhaust tips deliver spine-tingling thrills.',
    features: [
      'Sculpted Widebody Stance with Integrated Air Curtains',
      'Top-Exit Dual Performance Exhaust Ports',
      'Dynamic Variable Drift Mode Control',
      'Alcantara Track Steering Wheel with Shift Lights'
    ],
    specs: {
      engine: 'Apex Twin Axial Motors with Boost Mode',
      drivetrain: 'Rear-Wheel Drive with Electronic Limited Slip',
      chassis: 'Hydroformed Aluminum & Carbon Hybrid',
      weight: '3,180 lbs (1,442 kg)',
      batteryCapacity: '108 kWh Fast-Discharge Array',
      chargingTime: '80% in 11.5 minutes'
    }
  },
  {
    id: 'm-heritage-shadow',
    name: 'Apex M-Heritage Shadow GT',
    subtitle: 'Track-Optimized Matte Graphite Coupe with Gold Ceramic Brakes',
    category: 'Cyber-Coupe',
    price: '$1,950,000',
    acceleration: '2.25s 0-60 mph',
    topSpeed: '250 mph',
    power: '1,520 HP',
    range: '470 miles',
    image: bmwMShadow,
    gallery: [bmwMShadow, coastalWidebody, shadowGt3, interiorLuxury],
    description: 'Precision German track engineering meets futuristic electric adrenaline. Featuring a power-domed sculpted hood, matte graphite finish, carbon fiber roof, and gold ceramic brake calipers.',
    features: [
      'Twin-Kidney High-Flow Carbon Air Intakes',
      'Carbon Fiber Aero Decklid Spoiler',
      'Gold Anodized 6-Piston Ceramic Calipers',
      'M-Sport Variable Ratio Steering Rack'
    ],
    specs: {
      engine: 'Track-Tuned Dual M-Electric Motors',
      drivetrain: 'Switchable RWD / xDrive Intelligent AWD',
      chassis: 'High-Tensile Steel & Carbon Core Subframe',
      weight: '3,380 lbs (1,533 kg)',
      batteryCapacity: '115 kWh Endurance Pack',
      chargingTime: '80% in 12 minutes'
    }
  }
];
