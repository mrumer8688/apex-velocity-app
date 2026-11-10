import ferrariImg from '../assets/images/ferrari_rosso_italia_1792048883287.jpg';
import bmwImg from '../assets/images/bmw_m_shadow_coupe_1792048887559.jpg';
import monacoImg from '../assets/images/monaco_amethyst_hypercar_1792048884242.jpg';
import trackImg from '../assets/images/titanium_track_beast_1792048884683.jpg';
import emeraldImg from '../assets/images/emerald_gt_bespoke_1792048884907.jpg';
import cyberWhiteImg from '../assets/images/cyber_white_speedster_1792048885845.jpg';
import sapphireImg from '../assets/images/sapphire_stradale_gt_1792048886579.jpg';
import coastalImg from '../assets/images/coastal_widebody_exotic_1792048887841.jpg';
import solarisImg from '../assets/images/hypercar_amber_solaris_1792045662629.jpg';
import interiorImg from '../assets/images/interior_luxury_1785141240879.jpg';

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    badge: string;
    verified: boolean;
    carOwned: string;
    carId?: string;
  };
  platform: 'instagram' | 'x' | 'youtube' | 'apex-club';
  timestamp: string;
  timeSecondsAgo: number;
  location: string;
  image: string;
  caption: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  sharesCount: number;
  likedByUser?: boolean;
  category: 'track' | 'delivery' | 'night' | 'lifestyle';
  telemetrySnippet?: {
    label: string;
    value: string;
  };
}

export const COMMUNITY_POSTS_INITIAL: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      name: 'Kenji Takahashi',
      handle: '@kenji_apex',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badge: 'Chassis #014 Chronos V12',
      verified: true,
      carOwned: 'Apex Chronos V12',
      carId: 'car-1',
    },
    platform: 'instagram',
    timestamp: '8m ago',
    timeSecondsAgo: 480,
    location: 'Shuto Expressway C1, Tokyo',
    image: bmwImg,
    caption: 'Tokyo at 3:00 AM. 1,450 HP through the tunnels is absolute cinema. The titanium exhaust reverberation is unlike anything else on this planet. #ApexVelocity #TokyoMidnight #ChronosV12',
    tags: ['#TokyoMidnight', '#ApexVelocity', '#ChronosV12', '#NightDrive'],
    likes: 1240,
    commentsCount: 84,
    sharesCount: 192,
    category: 'night',
    telemetrySnippet: {
      label: 'EXHAUST TEMP',
      value: '782°C',
    },
  },
  {
    id: 'post-2',
    author: {
      name: 'Maximilian von Berg',
      handle: '@max_nordschleife',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      badge: 'Valkyrie GT Club Member',
      verified: true,
      carOwned: 'Apex Valkyrie GT',
      carId: 'car-2',
    },
    platform: 'x',
    timestamp: '22m ago',
    timeSecondsAgo: 1320,
    location: 'Nürburgring Nordschleife, Germany',
    image: trackImg,
    caption: 'Clean sub-6:40 lap on the first morning stint! The active aero downforce through Flugplatz and Schwedenkreuz glues the front axle like no other road-legal hypercar. Telemetry data downloaded directly to the skunkworks pit. #ApexTrackClub #GreenHell #ApexValkyrie',
    tags: ['#ApexTrackClub', '#Nurburgring', '#ApexValkyrie', '#TrackTelemetry'],
    likes: 3410,
    commentsCount: 246,
    sharesCount: 512,
    category: 'track',
    telemetrySnippet: {
      label: 'LATERAL G-FORCE',
      value: '2.14 G',
    },
  },
  {
    id: 'post-3',
    author: {
      name: 'Sheikh Rashid Al-Falasi',
      handle: '@rashid_dxb_racing',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      badge: 'VIP Delivery #007',
      verified: true,
      carOwned: 'Apex Cyber-GT Gold Edition',
      carId: 'car-4',
    },
    platform: 'apex-club',
    timestamp: '45m ago',
    timeSecondsAgo: 2700,
    location: 'DIFC Private Vault, Dubai',
    image: cyberWhiteImg,
    caption: 'Official handover day at the Apex DIFC Atelier! The 24K gold foil thermal barrier beneath the carbon hood is pure craftsmanship. Huge thanks to the commissioning team for flying in from Modena. #ApexDelivery #DubaiSupercars #HandoverDay',
    tags: ['#ApexDelivery', '#DubaiSupercars', '#BespokeSpec', '#HandoverDay'],
    likes: 4890,
    commentsCount: 310,
    sharesCount: 884,
    category: 'delivery',
    telemetrySnippet: {
      label: 'ODOMETER',
      value: '18 MILES',
    },
  },
  {
    id: 'post-4',
    author: {
      name: 'Elena Rostova',
      handle: '@elena_monaco_gt',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Amethyst Speciale Owner',
      verified: true,
      carOwned: 'Apex Spectre GT Amethyst',
      carId: 'car-3',
    },
    platform: 'instagram',
    timestamp: '1h ago',
    timeSecondsAgo: 3600,
    location: 'Port Hercule, Monte Carlo',
    image: monacoImg,
    caption: 'Parked along the harbor in Monte Carlo right in front of the yacht club. The color-shifting amethyst carbon sparkles under the Mediterranean sun. Truly rolling sculpture. #ApexVelocity #MonacoGP #BespokeSpec',
    tags: ['#MonacoGP', '#ApexVelocity', '#BespokeSpec', '#SupercarLifestyle'],
    likes: 2780,
    commentsCount: 165,
    sharesCount: 420,
    category: 'lifestyle',
    telemetrySnippet: {
      label: 'SOLAR RADIATION',
      value: '940 W/m²',
    },
  },
  {
    id: 'post-5',
    author: {
      name: 'Julian Montgomery',
      handle: '@j_montgomery_car',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      badge: 'Rosso Corsa Commission #03',
      verified: true,
      carOwned: 'Apex Chronos Stradale',
      carId: 'car-1',
    },
    platform: 'x',
    timestamp: '2h ago',
    timeSecondsAgo: 7200,
    location: 'Stelvio Pass, Italian Alps',
    image: ferrariImg,
    caption: 'Sunrise over the 48 hairpins of Passo dello Stelvio. Rear-wheel steering and instant hybrid torque pull you out of corners with zero hesitation. Best road in Europe with the best machine. #ApexVelocity #AlpineTour #DynoRun',
    tags: ['#AlpineTour', '#ApexVelocity', '#StelvioPass', '#TrackTelemetry'],
    likes: 1980,
    commentsCount: 112,
    sharesCount: 298,
    category: 'track',
    telemetrySnippet: {
      label: 'ELEVATION GAIN',
      value: '2,757 METERS',
    },
  },
  {
    id: 'post-6',
    author: {
      name: 'Carter Sterling',
      handle: '@carter_pch_drive',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      badge: 'West Coast Apex Ambassador',
      verified: true,
      carOwned: 'Apex Valkyrie Widebody',
      carId: 'car-2',
    },
    platform: 'youtube',
    timestamp: '3h ago',
    timeSecondsAgo: 10800,
    location: 'Bixby Creek Bridge, Big Sur, CA',
    image: coastalImg,
    caption: 'Full Pacific Coast Highway road trip documented for YouTube Shorts! From Beverly Hills to Carmel-by-the-Sea. Zero drone lag, pure naturally aspirated symphony. Full 4K onboard video live now! #ApexVelocity #PCHDrive #HypercarRoadTrip',
    tags: ['#PCHDrive', '#ApexVelocity', '#HypercarRoadTrip', '#NightDrive'],
    likes: 5120,
    commentsCount: 420,
    sharesCount: 1240,
    category: 'lifestyle',
    telemetrySnippet: {
      label: 'DISTANCE LOGGED',
      value: '428 MILES',
    },
  },
  {
    id: 'post-7',
    author: {
      name: 'Oliver Sinclaire',
      handle: '@oliver_mayfair',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      badge: 'British Racing Green #002',
      verified: true,
      carOwned: 'Apex Emerald GT Bespoke',
      carId: 'car-5',
    },
    platform: 'apex-club',
    timestamp: '4h ago',
    timeSecondsAgo: 14400,
    location: 'Berkeley Square, London',
    image: emeraldImg,
    caption: 'Bespoke hand-rubbed British Racing Green paintwork with titanium pinstriping. Collecting keys from the Mayfair Atelier this afternoon. The attention to detail inside the carbon cockpit is surgical. #BespokeSpec #ApexDelivery #LondonMayfair',
    tags: ['#BespokeSpec', '#ApexDelivery', '#LondonMayfair'],
    likes: 3190,
    commentsCount: 188,
    sharesCount: 460,
    category: 'delivery',
    telemetrySnippet: {
      label: 'PAINT THICKNESS',
      value: '140 MICRONS',
    },
  },
  {
    id: 'post-8',
    author: {
      name: 'Marc St. Laurent',
      handle: '@marc_alpine_apex',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      badge: 'Ice Drift Certification #01',
      verified: true,
      carOwned: 'Apex Sapphire Stradale',
      carId: 'car-6',
    },
    platform: 'instagram',
    timestamp: '5h ago',
    timeSecondsAgo: 18000,
    location: 'Lake St. Moritz, Switzerland',
    image: sapphireImg,
    caption: 'Sub-zero winter testing on frozen ice! Quad electric motors with independent torque vectoring make a 45-degree controlled drift look effortless. Heated steering wheel and thermal management on point! #ApexTrackClub #StMoritz #IceDrift',
    tags: ['#ApexTrackClub', '#StMoritz', '#IceDrift', '#TrackTelemetry'],
    likes: 4250,
    commentsCount: 290,
    sharesCount: 750,
    category: 'track',
    telemetrySnippet: {
      label: 'AMBIENT TEMP',
      value: '-14°C',
    },
  },
  {
    id: 'post-9',
    author: {
      name: 'Victoria Hastings',
      handle: '@victoria_bespoke',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      badge: 'Atelier Commission #088',
      verified: true,
      carOwned: 'Apex Chronos Bespoke Cockpit',
      carId: 'car-1',
    },
    platform: 'instagram',
    timestamp: '6h ago',
    timeSecondsAgo: 21600,
    location: 'Apex Atelier Modena, Italy',
    image: interiorImg,
    caption: 'First look inside my personalized cockpit: hand-stitched Alcantara, forged carbon paddles, and our family crest laser-etched onto the titanium steering wheel hub. Master artisan Marco did an extraordinary job! #ApexDelivery #BespokeSpec #Craftsmanship',
    tags: ['#ApexDelivery', '#BespokeSpec', '#Craftsmanship'],
    likes: 2130,
    commentsCount: 94,
    sharesCount: 310,
    category: 'delivery',
    telemetrySnippet: {
      label: 'STITCHING STROKES',
      value: '18,420 HAND TIES',
    },
  },
];
