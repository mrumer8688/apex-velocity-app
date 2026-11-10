import { GalleryItem } from '../types';

import heroPoster from '../assets/images/apex_hero_poster_1785141175569.jpg';
import redPhantom from '../assets/images/hypercar_red_phantom_1785141193540.jpg';
import blackMantis from '../assets/images/hypercar_black_mantis_1785141210537.jpg';
import shadowGt3 from '../assets/images/josh-berquist-pjxe3p4u5aI-unsplash.jpg';
import interiorLuxury from '../assets/images/interior_luxury_1785141240879.jpg';
import porscheFlagship from '../assets/images/porsche_supercar_flagship_1792048299805.jpg';
import ferrariRosso from '../assets/images/ferrari_rosso_italia_1792048883287.jpg';
import amethystHypercar from '../assets/images/monaco_amethyst_hypercar_1792048884242.jpg';
import titaniumTrack from '../assets/images/titanium_track_beast_1792048884683.jpg';
import emeraldGt from '../assets/images/emerald_gt_bespoke_1792048884907.jpg';
import cyberSpeedster from '../assets/images/cyber_white_speedster_1792048885845.jpg';
import stealthCoupe from '../assets/images/stealth_monochrome_coupe_1792048885848.jpg';
import sapphireStradale from '../assets/images/sapphire_stradale_gt_1792048886579.jpg';
import coastalWidebody from '../assets/images/coastal_widebody_exotic_1792048887841.jpg';
import bmwMShadow from '../assets/images/bmw_m_shadow_coupe_1792048887559.jpg';

export const GALLERY_DATA: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Phantom Velocity X in Motion',
    category: 'Track Test',
    image: redPhantom,
    aspectRatio: 'wide'
  },
  {
    id: 'gal-porsche',
    title: 'Porsche Mission Hyper-GT Prototype',
    category: 'Flagship Aero',
    image: porscheFlagship,
    aspectRatio: 'wide'
  },
  {
    id: 'gal-ferrari',
    title: 'Rosso Stradale GT Circuit Test',
    category: 'Scuderia Track',
    image: ferrariRosso,
    aspectRatio: 'wide'
  },
  {
    id: 'gal-amethyst',
    title: 'Monaco Harbor Twilight Unveil',
    category: 'Bespoke Roadster',
    image: amethystHypercar,
    aspectRatio: 'tall'
  },
  {
    id: 'gal-valkyrie',
    title: 'Valkyrie Apex-27 Apex Apex-Speed',
    category: 'Le Mans Prototype',
    image: titaniumTrack,
    aspectRatio: 'wide'
  },
  {
    id: 'gal-emerald',
    title: 'Emerald Gran Turismo Pavilion',
    category: 'Architectural GT',
    image: emeraldGt,
    aspectRatio: 'tall'
  },
  {
    id: 'gal-cyber',
    title: 'Cyber-Aero Speedster Runway Launch',
    category: 'Cybernetic Spec',
    image: cyberSpeedster,
    aspectRatio: 'wide'
  },
  {
    id: 'gal-stealth',
    title: 'Nocturne Stealth Carbon Monocoque',
    category: 'Stealth Aero',
    image: stealthCoupe,
    aspectRatio: 'tall'
  },
  {
    id: 'gal-sapphire',
    title: 'Sapphire Stradale Villa Sunset',
    category: 'Riviera Grand Tourer',
    image: sapphireStradale,
    aspectRatio: 'wide'
  },
  {
    id: 'gal-pacifica',
    title: 'Pacifica Widebody Coastal Run',
    category: 'High-Downforce Canyon',
    image: coastalWidebody,
    aspectRatio: 'wide'
  },
  {
    id: 'gal-bmw',
    title: 'M-Heritage Shadow Wet Circuit',
    category: 'Precision Track',
    image: bmwMShadow,
    aspectRatio: 'square'
  },
  {
    id: 'gal-2',
    title: 'Stealth Aerodynamics Detail',
    category: 'Exterior Design',
    image: blackMantis,
    aspectRatio: 'tall'
  },
  {
    id: 'gal-3',
    title: 'Cockpit Architecture & HUD',
    category: 'Interior Luxury',
    image: interiorLuxury,
    aspectRatio: 'square'
  },
  {
    id: 'gal-4',
    title: '1968 Futura Silk Unveil',
    category: 'Heritage Special',
    image: heroPoster,
    aspectRatio: 'wide'
  },
  {
    id: 'gal-5',
    title: 'Shadow GT3 Golden Hour Port',
    category: 'GT Experience',
    image: shadowGt3,
    aspectRatio: 'tall'
  }
];
