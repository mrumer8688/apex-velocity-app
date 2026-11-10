import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  Palette,
  Disc,
  Armchair,
  Sun,
  Shield,
  Eye,
  Check,
  ChevronRight,
  Maximize2,
  Share2,
  Download,
  Flame,
  Zap,
  Sliders,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  Gauge,
  Box,
} from 'lucide-react';
import { CarModel } from '../types';
import { CARS_DATA } from '../data/cars';
import {
  CarConfigState,
  PaintType,
  WheelStyle,
  SeatMaterial,
  TrimMaterial,
  CaliperColor,
} from '../types/configurator';
import {
  buildPhotorealisticCar,
  createCarbonTexture,
  createTireTreadTexture,
  createBrakeDiscTexture,
  createBodyMaterial,
  createWheelMaterial,
  updateWheelsGroup,
  updateInteriorGroup,
  CarModelContainer,
} from '../utils/carGeometry';
import { MagneticButton } from './MagneticButton';
import { triggerHaptic } from '../utils/haptics';

export interface InteractiveVehicleConfiguratorProps {
  initialCar?: CarModel;
  onBookCommission?: (specDetails: {
    car: CarModel;
    config: CarConfigState;
    totalPrice: string;
  }) => void;
  standalone?: boolean;
  className?: string;
}

// Curated Bespoke Paint Finishes
const BESPOKE_PAINTS = [
  { name: 'Apex Rosso Corsa', color: '#D61C1C', type: 'metallic' as PaintType, cost: 0, tag: 'Signature' },
  { name: 'Obsidian Nero Carbon', color: '#141416', type: 'carbon' as PaintType, cost: 18500, tag: 'Exposed Weave' },
  { name: 'Cyber Cyan Pearl', color: '#00E5FF', type: 'pearl' as PaintType, cost: 8500, tag: 'Tri-Coat' },
  { name: 'Solaris Liquid Gold', color: '#EAB308', type: 'metallic' as PaintType, cost: 12000, tag: 'Metallic' },
  { name: 'Monaco Amethyst', color: '#7C3AED', type: 'pearl' as PaintType, cost: 14500, tag: 'Color-Shift' },
  { name: 'British Racing Emerald', color: '#059669', type: 'metallic' as PaintType, cost: 6500, tag: 'Heritage' },
  { name: 'Nardo Stealth Grey', color: '#374151', type: 'matte' as PaintType, cost: 7200, tag: 'Satin Matte' },
  { name: 'Glacier Pearl White', color: '#F3F4F6', type: 'pearl' as PaintType, cost: 5000, tag: 'High-Reflectance' },
  { name: 'Titanium Bronze', color: '#92400E', type: 'metallic' as PaintType, cost: 9800, tag: 'Deep Flake' },
  { name: 'Sapphire Electric Blue', color: '#2563EB', type: 'metallic' as PaintType, cost: 7800, tag: 'Electric' },
  { name: 'Sunset Flame Orange', color: '#EA580C', type: 'pearl' as PaintType, cost: 8900, tag: 'Luminescent' },
  { name: 'Acid Toxic Green', color: '#65A30D', type: 'gloss' as PaintType, cost: 6200, tag: 'Track Special' },
];

const PAINT_TYPES: { id: PaintType; label: string; desc: string }[] = [
  { id: 'metallic', label: 'Metallic', desc: 'High-depth metallic flake flakes with multi-angle specular brilliance.' },
  { id: 'matte', label: 'Satin Matte', desc: 'Soft-touch velvet anti-reflective sheen designed for stealth presence.' },
  { id: 'carbon', label: 'Raw Carbon Weave', desc: 'Lightweight exposed 3K vacuum-infused pre-preg carbon fiber.' },
  { id: 'pearl', label: 'Pearl Tri-Coat', desc: 'Multi-layer iridescent pearl lacquer that transitions with sunlight.' },
  { id: 'gloss', label: 'Piano Gloss', desc: 'Mirror-polished ultra-smooth high-gloss finish with dual clearcoats.' },
  { id: 'chrome', label: 'Liquid Chrome', desc: 'Electro-plated specular chrome surface with deep reflective depth.' },
];

// Bespoke Interior Materials (Seats & Upholstery)
const INTERIOR_SEATS: {
  id: SeatMaterial;
  name: string;
  cost: number;
  desc: string;
  previewColor: string;
  textureLabel: string;
}[] = [
  {
    id: 'leather_black',
    name: 'Nero Alcantara & Orange Stitching',
    cost: 8500,
    desc: 'High-friction lightweight micro-suede with hand-tied Apex Orange perimeter stitching.',
    previewColor: '#18181B',
    textureLabel: 'Ultra-Grip Micro-Suede',
  },
  {
    id: 'leather_red',
    name: 'Rosso Corsa Full-Grain Leather',
    cost: 11000,
    desc: 'Bespoke hand-selected Italian aniline leather sourced from Northern Tuscany.',
    previewColor: '#991B1B',
    textureLabel: 'Italian Aniline Hide',
  },
  {
    id: 'carbon_bucket',
    name: 'Monocoque Carbon Racing Buckets',
    cost: 16500,
    desc: 'FIA-certified ultra-lightweight carbon shell with anatomical high-density padding.',
    previewColor: '#09090B',
    textureLabel: '3K Twill Carbon Shell',
  },
  {
    id: 'alcantara',
    name: 'Arctic White Semi-Aniline Leather',
    cost: 9500,
    desc: 'Perforated climate-controlled luxury leather with cooling air-flow channels.',
    previewColor: '#F4F4F5',
    textureLabel: 'Perforated Hide',
  },
];

// Interior Trim Accents
const INTERIOR_TRIMS: {
  id: TrimMaterial;
  name: string;
  cost: number;
  desc: string;
  previewColor: string;
}[] = [
  {
    id: 'carbon',
    name: 'Raw Matte Twill Carbon Fiber',
    cost: 6500,
    desc: 'Exposed structural carbon weave with a satin anti-reflective tactile finish.',
    previewColor: '#27272A',
  },
  {
    id: 'aluminum',
    name: 'Aerospace Anodized Aluminum',
    cost: 3500,
    desc: 'Precision CNC-machined lightweight aluminum accents with chamfered edges.',
    previewColor: '#CBD5E1',
  },
  {
    id: 'bronze',
    name: 'Liquid Brushed Bronze Alloy',
    cost: 5200,
    desc: 'Hand-burnished liquid bronze trim offering warmth and timeless automotive patina.',
    previewColor: '#B45309',
  },
];

// Ambient Mood Lights
const AMBIENT_LIGHTS = [
  { name: 'Apex Orange', color: '#FF5A1F' },
  { name: 'Cyber Cyan', color: '#00E5FF' },
  { name: 'Cyber Violet', color: '#A855F7' },
  { name: 'Crimson Racing', color: '#EF4444' },
  { name: 'Pure White LED', color: '#F8FAFC' },
];

// Wheel Spoke Designs
const WHEEL_DESIGNS: {
  id: WheelStyle;
  name: string;
  cost: number;
  desc: string;
  badge: string;
}[] = [
  {
    id: 'spoke10',
    name: '10-Spoke Forged Magnesium',
    cost: 0,
    desc: 'CAD-optimized ultra-thin spoke architecture reducing rotational unsprung mass.',
    badge: 'Standard Forged',
  },
  {
    id: 'turbofan',
    name: 'Aero Downforce Turbofan Disc',
    cost: 14500,
    desc: 'Formula-E inspired carbon disc drawing turbulent air away from brake rotors for 18% less drag.',
    badge: 'Active Downforce',
  },
  {
    id: 'concave',
    name: 'Deep Concave 5-Spoke Monoblock',
    cost: 12000,
    desc: 'Aggressive offset monoblock forged aluminum with structural structural gussets.',
    badge: 'Aggressive Stance',
  },
  {
    id: 'diamond',
    name: 'Diamond-Cut Multi-Rib Track Spec',
    cost: 9500,
    desc: 'Precision diamond-faced machining with contrasting black barrel accents.',
    badge: 'Track Spec',
  },
  {
    id: 'beadlock',
    name: 'Centerlock Formula-E Aero Edition',
    cost: 16800,
    desc: 'Quick-release single centerlock nut in anodized aluminum with directional aero vanes.',
    badge: 'Race Centerlock',
  },
];

// Wheel Finishes
const WHEEL_FINISHES = [
  { id: 'silver', name: 'Silver Chrome Mirror', color: '#D0D0D0' },
  { id: 'black', name: 'Satin Nero Black', color: '#18181B' },
  { id: 'bronze', name: 'Brushed Bronze Patina', color: '#B87333' },
  { id: 'gold', name: '24K Bespoke Gold', color: '#D4AF37' },
  { id: 'chrome', name: 'Liquid Titanium Gunmetal', color: '#71717A' },
] as const;

// Caliper Colors
const CALIPER_COLORS: { color: CaliperColor; name: string; hex: string }[] = [
  { color: '#FF5A1F', name: 'Apex Orange', hex: '#FF5A1F' },
  { color: '#FF1E00', name: 'Brembo Red', hex: '#FF1E00' },
  { color: '#FFD700', name: 'Solaris Yellow', hex: '#FFD700' },
  { color: '#00E5FF', name: 'Cyber Cyan', hex: '#00E5FF' },
  { color: '#39FF14', name: 'Acid Green', hex: '#39FF14' },
  { color: '#111111', name: 'Stealth Nero', hex: '#111111' },
];

// Studio Lighting Modes
type StudioLightingMode = 'studio' | 'neon' | 'sunset' | 'track';

// Camera Angle Presets
type CameraPreset = 'front_34' | 'side_profile' | 'interior' | 'wheels' | 'rear_wing' | 'top_aero';

export const InteractiveVehicleConfigurator: React.FC<InteractiveVehicleConfiguratorProps> = ({
  initialCar,
  onBookCommission,
  standalone = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Selected Car in Atelier
  const [selectedCar, setSelectedCar] = useState<CarModel>(initialCar || CARS_DATA[0]);

  // Active Customization Category Tab
  const [activeTab, setActiveTab] = useState<'paint' | 'interior' | 'wheels' | 'summary'>('paint');

  // Config State
  const [config, setConfig] = useState<CarConfigState>({
    paintColor: '#D61C1C',
    paintType: 'metallic',
    clearcoat: 1.0,
    roughness: 0.12,
    wheelStyle: 'spoke10',
    wheelColor: 'silver',
    tireType: 'street',
    caliperColor: '#FF5A1F',
    frontBumper: 'gt',
    rearBumper: 'stock',
    hood: 'stock',
    roof: 'carbon',
    spoiler: 'gt3',
    sideSkirts: 'stock',
    headlightStyle: 'matrix',
    headlightsOn: true,
    underglowOn: true,
    underglowColor: '#FF5A1F',
    rideHeight: 'track',
    seatMaterial: 'leather_black',
    trimMaterial: 'carbon',
    interiorAmbientColor: '#FF5A1F',
    autoRotate: true,
    cinematicMode: false,
    showStudioFloor: true,
  });

  const [activePreset, setActivePreset] = useState<CameraPreset>('front_34');
  const [studioLight, setStudioLight] = useState<StudioLightingMode>('studio');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carContainerRef = useRef<CarModelContainer | null>(null);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 5.4, theta: Math.PI / 4, phi: Math.PI / 2.6 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.5, 0));

  // Lights for dynamic studio switching
  const lightsRef = useRef<{
    keySpot: THREE.SpotLight;
    rimLight: THREE.DirectionalLight;
    warmFill: THREE.DirectionalLight;
    floorMat: THREE.MeshStandardMaterial;
  } | null>(null);

  // Textures cache
  const texturesRef = useRef<{
    carbon: THREE.CanvasTexture;
    tread: THREE.CanvasTexture;
    disc: THREE.CanvasTexture;
  } | null>(null);

  // Synchronize initial car if prop changes
  useEffect(() => {
    if (initialCar) {
      setSelectedCar(initialCar);
    }
  }, [initialCar]);

  // Update Camera Position from Spherical Coordinates
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const s = sphericalRef.current;
    const target = targetLookAtRef.current;

    const x = s.radius * Math.sin(s.phi) * Math.sin(s.theta) + target.x;
    const y = s.radius * Math.cos(s.phi) + target.y;
    const z = s.radius * Math.sin(s.phi) * Math.cos(s.theta) + target.z;

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  }, []);

  // Smooth View Angle Transition
  const setCameraPreset = useCallback(
    (preset: CameraPreset) => {
      setActivePreset(preset);
      triggerHaptic('light');

      switch (preset) {
        case 'front_34':
          targetLookAtRef.current.set(0, 0.45, 0);
          sphericalRef.current = { radius: 5.4, theta: Math.PI / 4, phi: Math.PI / 2.6 };
          break;
        case 'side_profile':
          targetLookAtRef.current.set(0, 0.45, 0);
          sphericalRef.current = { radius: 5.2, theta: Math.PI / 2, phi: Math.PI / 2.3 };
          break;
        case 'interior':
          // Zoom into cockpit interior seats & steering wheel through windshield
          targetLookAtRef.current.set(-0.15, 0.55, 0.1);
          sphericalRef.current = { radius: 2.1, theta: Math.PI / 7, phi: Math.PI / 2.8 };
          break;
        case 'wheels':
          // Zoom into front-left custom wheel spoke design and caliper
          targetLookAtRef.current.set(0.9, 0.35, 1.25);
          sphericalRef.current = { radius: 2.4, theta: Math.PI / 2.4, phi: Math.PI / 2.2 };
          break;
        case 'rear_wing':
          targetLookAtRef.current.set(0, 0.5, -0.4);
          sphericalRef.current = { radius: 4.8, theta: Math.PI, phi: Math.PI / 2.5 };
          break;
        case 'top_aero':
          targetLookAtRef.current.set(0, 0.4, 0);
          sphericalRef.current = { radius: 5.8, theta: Math.PI / 5, phi: Math.PI / 6 };
          break;
      }
      updateCameraPosition();
    },
    [updateCameraPosition]
  );

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // 1. Scene & Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060608);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer with High-Precision Shadows & Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv).texture;

    // Key Studio Spotlights
    const keySpot = new THREE.SpotLight(0xffffff, 4.5);
    keySpot.position.set(4, 7, 5);
    keySpot.angle = Math.PI / 4;
    keySpot.penumbra = 0.5;
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    scene.add(keySpot);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 2.0);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const warmFill = new THREE.DirectionalLight(0xff5a1f, 1.8);
    warmFill.position.set(5, 3, -3);
    scene.add(warmFill);

    // Reflective Studio Floor Grid
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07070a,
      roughness: 0.18,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle studio grid circle
    const gridHelper = new THREE.GridHelper(16, 32, 0xff5a1f, 0x222226);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    lightsRef.current = { keySpot, rimLight, warmFill, floorMat };

    // 5. Generate Procedural Textures
    const carbonTex = createCarbonTexture();
    const treadTex = createTireTreadTexture();
    const discTex = createBrakeDiscTexture();
    texturesRef.current = { carbon: carbonTex, tread: treadTex, disc: discTex };

    // 6. Build Initial Photorealistic 3D Car
    const carModelContainer = buildPhotorealisticCar(config, carbonTex, treadTex, discTex);
    scene.add(carModelContainer.rootGroup);
    carContainerRef.current = carModelContainer;

    // 7. Animation Loop with 360 Smooth Inertia
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-Rotate continuous 360
      if (config.autoRotate && !isDraggingRef.current && activePreset !== 'interior') {
        sphericalRef.current.theta += 0.0035;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pmremGenerator.dispose();
    };
  }, []);

  // Handle Dynamic Studio Lighting Changes
  useEffect(() => {
    if (!lightsRef.current || !sceneRef.current) return;
    const { keySpot, rimLight, warmFill, floorMat } = lightsRef.current;

    switch (studioLight) {
      case 'studio':
        keySpot.color.setHex(0xffffff);
        keySpot.intensity = 4.5;
        rimLight.color.setHex(0x00e5ff);
        rimLight.intensity = 2.0;
        warmFill.color.setHex(0xff5a1f);
        warmFill.intensity = 1.8;
        floorMat.color.setHex(0x07070a);
        sceneRef.current.background = new THREE.Color(0x060608);
        break;
      case 'neon':
        keySpot.color.setHex(0x00e5ff);
        keySpot.intensity = 3.8;
        rimLight.color.setHex(0xa855f7);
        rimLight.intensity = 3.2;
        warmFill.color.setHex(0x00e5ff);
        warmFill.intensity = 2.4;
        floorMat.color.setHex(0x040409);
        sceneRef.current.background = new THREE.Color(0x020205);
        break;
      case 'sunset':
        keySpot.color.setHex(0xffaa55);
        keySpot.intensity = 4.0;
        rimLight.color.setHex(0xea580c);
        rimLight.intensity = 2.8;
        warmFill.color.setHex(0xff3300);
        warmFill.intensity = 2.2;
        floorMat.color.setHex(0x0d0705);
        sceneRef.current.background = new THREE.Color(0x0a0503);
        break;
      case 'track':
        keySpot.color.setHex(0xf8fafc);
        keySpot.intensity = 5.2;
        rimLight.color.setHex(0xffffff);
        rimLight.intensity = 2.2;
        warmFill.color.setHex(0x94a3b8);
        warmFill.intensity = 1.6;
        floorMat.color.setHex(0x111116);
        sceneRef.current.background = new THREE.Color(0x0a0a0e);
        break;
    }
  }, [studioLight]);

  // 360 Drag Interaction Handlers (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    triggerHaptic('orbit');
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevPointerRef.current.x;
    const deltaY = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= deltaX * 0.007;
    sphericalRef.current.phi = Math.max(0.2, Math.min(Math.PI / 2.05, sphericalRef.current.phi - deltaY * 0.006));

    updateCameraPosition();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Zoom with Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(1.8, Math.min(9.0, sphericalRef.current.radius + e.deltaY * 0.005));
    updateCameraPosition();
  };

  // REAL-TIME REFLECTION: Dynamic 3D updates when Paint, Interior, or Wheels change
  useEffect(() => {
    if (!carContainerRef.current) return;
    const container = carContainerRef.current;

    // 1. Exterior Body Paint Update
    const newBodyMat = createBodyMaterial(config);
    container.bodyMaterial = newBodyMat;
    container.bodyGroup.traverse((obj) => {
      if (
        obj instanceof THREE.Mesh &&
        obj.material !== container.carbonMaterial &&
        obj.material !== container.glassMaterial
      ) {
        obj.material = newBodyMat;
      }
    });

    // 2. Interior Materials Update
    const seatColor =
      config.seatMaterial === 'leather_red'
        ? 0x991b1b
        : config.seatMaterial === 'alcantara'
        ? 0xf4f4f5
        : config.seatMaterial === 'carbon_bucket'
        ? 0x111111
        : 0x18181b;

    container.interiorMaterial.color.setHex(seatColor);
    container.interiorMaterial.roughness = config.seatMaterial === 'alcantara' ? 0.7 : 0.3;

    // Update interior trim accents (aluminum, bronze, carbon)
    const trimColor =
      config.trimMaterial === 'aluminum'
        ? 0xcbd5e1
        : config.trimMaterial === 'bronze'
        ? 0xb45309
        : 0x27272a;

    container.chromeMaterial.color.setHex(trimColor);

    // Rebuild interior group with updated materials
    if (texturesRef.current) {
      updateInteriorGroup(
        container.interiorGroup,
        config,
        container.interiorMaterial,
        container.carbonMaterial,
        container.chromeMaterial
      );
    }

    // 3. Wheel Finishes, Spoke Geometry & Calipers Update
    const newWheelMat = createWheelMaterial(config.wheelColor);
    container.wheelMaterial = newWheelMat;
    container.caliperMaterial.color.set(config.caliperColor);

    if (texturesRef.current) {
      updateWheelsGroup(
        container.wheelsGroup,
        config,
        container.tireMaterial,
        newWheelMat,
        container.discMaterial,
        container.caliperMaterial
      );
    }
  }, [config]);

  // Tab change auto-camera helper to highlight customized area
  const handleTabChange = (tab: 'paint' | 'interior' | 'wheels' | 'summary') => {
    setActiveTab(tab);
    triggerHaptic('light');

    if (tab === 'interior') {
      setCameraPreset('interior');
    } else if (tab === 'wheels') {
      setCameraPreset('wheels');
    } else if (tab === 'paint' && activePreset === 'interior') {
      setCameraPreset('front_34');
    }
  };

  // Pricing Calculation
  const priceCalculation = useMemo(() => {
    const rawPrice = selectedCar.price.replace(/[$,]/g, '');
    const baseMSRP = parseInt(rawPrice, 10) || 2800000;

    const paintItem = BESPOKE_PAINTS.find((p) => p.color.toLowerCase() === config.paintColor.toLowerCase());
    const paintCost = paintItem ? paintItem.cost : 5000;

    const seatItem = INTERIOR_SEATS.find((s) => s.id === config.seatMaterial);
    const seatCost = seatItem ? seatItem.cost : 8500;

    const trimItem = INTERIOR_TRIMS.find((t) => t.id === config.trimMaterial);
    const trimCost = trimItem ? trimItem.cost : 6500;

    const wheelItem = WHEEL_DESIGNS.find((w) => w.id === config.wheelStyle);
    const wheelCost = wheelItem ? wheelItem.cost : 0;

    const total = baseMSRP + paintCost + seatCost + trimCost + wheelCost;

    return {
      baseMSRP,
      paintCost,
      seatCost,
      trimCost,
      wheelCost,
      total,
      formattedTotal: `$${total.toLocaleString()}`,
    };
  }, [selectedCar, config]);

  // Copy Specification Link
  const handleCopySpec = () => {
    const spec = {
      model: selectedCar.name,
      paint: config.paintColor,
      paintType: config.paintType,
      seats: config.seatMaterial,
      trim: config.trimMaterial,
      wheels: config.wheelStyle,
      wheelColor: config.wheelColor,
      caliper: config.caliperColor,
      totalPrice: priceCalculation.formattedTotal,
    };
    navigator.clipboard?.writeText?.(JSON.stringify(spec, null, 2));
    setIsCopied(true);
    triggerHaptic('success');
    setTimeout(() => setIsCopied(false), 2400);
  };

  // Download Specification Summary
  const handleDownloadSpec = () => {
    const spec = {
      apexCommissionId: `APX-${Date.now().toString(36).toUpperCase()}`,
      carModel: selectedCar.name,
      vinSeries: `APX-COMM-${Math.floor(Math.random() * 9000 + 1000)}`,
      commissionDate: new Date().toISOString(),
      paintSpecification: {
        color: config.paintColor,
        type: config.paintType,
        clearcoat: config.clearcoat,
        roughness: config.roughness,
      },
      interiorSpecification: {
        seats: config.seatMaterial,
        trim: config.trimMaterial,
        ambientLighting: config.interiorAmbientColor,
      },
      wheelsSpecification: {
        spokeDesign: config.wheelStyle,
        finish: config.wheelColor,
        calipers: config.caliperColor,
      },
      pricingBreakdown: priceCalculation,
    };

    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Apex-${selectedCar.id}-Specification.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    triggerHaptic('success');
    setTimeout(() => setDownloadSuccess(false), 2400);
  };

  return (
    <div
      className={`relative w-full rounded-3xl border border-white/15 bg-black/90 shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Header Bar: Model Switcher & Live Price */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
        {/* Left: Model Selector & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 flex items-center justify-center text-[#FF5A1F]">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
                INTERACTIVE VEHICLE CONFIGURATOR
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                3D Real-Time
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedCar.id}
                onChange={(e) => {
                  const car = CARS_DATA.find((c) => c.id === e.target.value);
                  if (car) {
                    setSelectedCar(car);
                    triggerHaptic('selection');
                  }
                }}
                className="bg-transparent text-lg sm:text-xl font-display font-black uppercase text-white outline-none cursor-pointer border-b border-white/20 hover:border-[#FF5A1F] transition-colors py-0.5 pr-2"
              >
                {CARS_DATA.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#121214] text-white text-sm">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Live Total Commission Price & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 block uppercase">Bespoke Commission Price</span>
            <span className="text-lg sm:text-2xl font-display font-black text-white text-gradient-orange">
              {priceCalculation.formattedTotal}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySpec}
              className="p-2.5 rounded-xl glass-panel border border-white/15 text-white/80 hover:text-white hover:border-[#FF5A1F]/50 transition-all cursor-pointer"
              title="Copy Spec Summary"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleDownloadSpec}
              className="p-2.5 rounded-xl glass-panel border border-white/15 text-white/80 hover:text-white hover:border-[#FF5A1F]/50 transition-all cursor-pointer"
              title="Download Build JSON"
            >
              {downloadSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Area: 3D Viewport & Control Dock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] lg:min-h-[660px]">
        {/* 3D WebGL Car Viewer Canvas (Left/Center - 7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 relative bg-gradient-to-b from-[#09090c] to-[#040406] flex items-center justify-center overflow-hidden min-h-[400px] sm:min-h-[480px]">
          {/* Three.js Canvas Container */}
          <div
            ref={mountRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
            style={{ touchAction: 'none' }}
          />

          {/* Interactive HUD Overlay: Active Spec Ticker */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px]"
                style={{ backgroundColor: config.paintColor, boxShadow: `0 0 8px ${config.paintColor}` }}
              />
              <span className="text-white font-bold">{config.paintType.toUpperCase()} PAINT</span>
              <span className="text-white/40">·</span>
              <span className="text-[#FF5A1F]">{config.wheelStyle.toUpperCase()}</span>
            </div>
          </div>

          {/* Top-Right: Camera Angle Presets & Lighting Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
            {/* Camera Presets Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15">
              {(
                [
                  { id: 'front_34', label: '3/4 Stance' },
                  { id: 'side_profile', label: 'Profile' },
                  { id: 'interior', label: 'Cockpit' },
                  { id: 'wheels', label: 'Wheels' },
                  { id: 'rear_wing', label: 'Aero' },
                  { id: 'top_aero', label: 'Top' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCameraPreset(p.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase transition-all cursor-pointer ${
                    activePreset === p.id
                      ? 'bg-[#FF5A1F] text-black font-bold shadow-[0_0_8px_#FF5A1F]'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Studio Environment Lighting Toggles */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15">
              {(
                [
                  { id: 'studio', label: 'Studio' },
                  { id: 'neon', label: 'Cyber' },
                  { id: 'sunset', label: 'Sunset' },
                  { id: 'track', label: 'Track' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setStudioLight(m.id);
                    triggerHaptic('light');
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase transition-all cursor-pointer ${
                    studioLight === m.id
                      ? 'bg-white/20 text-white font-bold border border-white/30'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom HUD: Orbit drag prompt & auto-rotate toggle */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-mono text-white/50 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hidden sm:inline-block">
              🖱️ Click & Drag to Orbit 360° · Scroll to Zoom
            </span>

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase backdrop-blur-md border transition-all flex items-center gap-1.5 cursor-pointer ${
                  config.autoRotate
                    ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border-[#FF5A1F]/40'
                    : 'bg-black/60 text-white/70 border-white/15 hover:text-white'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${config.autoRotate ? 'animate-spin' : ''}`} />
                <span>360° Auto-Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => setCameraPreset('front_34')}
                className="p-1.5 rounded-xl bg-black/60 text-white/70 hover:text-white border border-white/15 cursor-pointer backdrop-blur-md"
                title="Reset Camera"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Customization Control Panel (Right - 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#08080a] flex flex-col justify-between">
          <div>
            {/* Category Navigation Tabs */}
            <div className="grid grid-cols-4 p-2 gap-1 border-b border-white/10 bg-black/40">
              <button
                type="button"
                onClick={() => handleTabChange('paint')}
                className={`py-2 px-1 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'paint'
                    ? 'bg-[#FF5A1F] text-black font-black shadow-[0_0_12px_rgba(255,90,31,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Paint</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('interior')}
                className={`py-2 px-1 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'interior'
                    ? 'bg-[#FF5A1F] text-black font-black shadow-[0_0_12px_rgba(255,90,31,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Armchair className="w-4 h-4" />
                <span>Interior</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('wheels')}
                className={`py-2 px-1 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'wheels'
                    ? 'bg-[#FF5A1F] text-black font-black shadow-[0_0_12px_rgba(255,90,31,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Disc className="w-4 h-4" />
                <span>Wheels</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('summary')}
                className={`py-2 px-1 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-[#FF5A1F] text-black font-black shadow-[0_0_12px_rgba(255,90,31,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Summary</span>
              </button>
            </div>

            {/* Tab Body Contents */}
            <div className="p-4 sm:p-6 space-y-6 max-h-[500px] overflow-y-auto">
              {/* TAB 1: CAR PAINT CUSTOMIZER */}
              {activeTab === 'paint' && (
                <div className="space-y-6">
                  {/* Paint Finish Types */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block mb-2">
                      // 01. FINISH COAT SPECIFICATION
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {PAINT_TYPES.map((pt) => {
                        const isSelected = config.paintType === pt.id;
                        return (
                          <button
                            key={pt.id}
                            type="button"
                            onClick={() => {
                              setConfig((prev) => ({
                                ...prev,
                                paintType: pt.id,
                                roughness: pt.id === 'matte' ? 0.6 : pt.id === 'gloss' ? 0.05 : 0.14,
                                clearcoat: pt.id === 'matte' ? 0.0 : 1.0,
                              }));
                              triggerHaptic('selection');
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-[#FF5A1F]/10 text-white font-bold'
                                : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20'
                            }`}
                          >
                            <span className="text-xs font-mono block leading-tight">{pt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Curated Paint Color Swatches */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold">
                        // 02. BESPOKE COLOR PALETTE
                      </span>
                      <span className="text-[10px] font-mono text-white/40">12 Curated Formulas</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5">
                      {BESPOKE_PAINTS.map((p) => {
                        const isSelected = config.paintColor.toLowerCase() === p.color.toLowerCase();
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setConfig((prev) => ({
                                ...prev,
                                paintColor: p.color,
                                paintType: p.type,
                              }));
                              triggerHaptic('selection');
                            }}
                            className={`group relative p-2 rounded-xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-white/[0.08] shadow-[0_0_12px_rgba(255,90,31,0.25)]'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-full border border-white/25 shadow-md flex items-center justify-center transition-transform group-hover:scale-110"
                              style={{ backgroundColor: p.color }}
                            >
                              {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                            </div>
                            <span className="text-[9px] font-mono text-white/80 truncate w-full text-center">
                              {p.name.split(' ')[1] || p.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                    <span className="text-[10px] font-mono uppercase text-white/60 block">
                      Custom Studio Formula & Clearcoat
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.paintColor}
                        onChange={(e) => {
                          setConfig((prev) => ({ ...prev, paintColor: e.target.value }));
                        }}
                        className="w-10 h-10 rounded-lg bg-transparent border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.paintColor.toUpperCase()}
                        onChange={(e) => {
                          if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                            setConfig((prev) => ({ ...prev, paintColor: e.target.value }));
                          }
                        }}
                        className="flex-1 bg-black/60 border border-white/15 px-3 py-1.5 rounded-lg text-xs font-mono text-white uppercase outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    {/* Clearcoat & Roughness Sliders */}
                    <div className="space-y-2 pt-1 text-xs font-mono">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-white/60">Clearcoat Lacquer:</span>
                        <span className="text-[#FF5A1F]">{Math.round(config.clearcoat * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.clearcoat}
                        onChange={(e) => setConfig((prev) => ({ ...prev, clearcoat: parseFloat(e.target.value) }))}
                        className="w-full accent-[#FF5A1F] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INTERIOR MATERIALS CUSTOMIZER */}
              {activeTab === 'interior' && (
                <div className="space-y-6">
                  {/* Seat Upholstery Options */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block mb-2">
                      // 01. SEATING UPHOLSTERY & CABIN SPEC
                    </span>
                    <div className="space-y-2.5">
                      {INTERIOR_SEATS.map((seat) => {
                        const isSelected = config.seatMaterial === seat.id;
                        return (
                          <div
                            key={seat.id}
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, seatMaterial: seat.id }));
                              triggerHaptic('selection');
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-[#FF5A1F]/10 shadow-[0_0_15px_rgba(255,90,31,0.2)]'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                                  style={{ backgroundColor: seat.previewColor }}
                                />
                                <div>
                                  <h5 className="text-xs font-mono font-bold text-white">{seat.name}</h5>
                                  <span className="text-[10px] font-mono text-[#FF5A1F]">{seat.textureLabel}</span>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-white/90">
                                {seat.cost === 0 ? 'Included' : `+$${seat.cost.toLocaleString()}`}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">{seat.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dashboard & Center Console Trim Accents */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block mb-2">
                      // 02. DASHBOARD & CONSOLE TRIM
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {INTERIOR_TRIMS.map((trim) => {
                        const isSelected = config.trimMaterial === trim.id;
                        return (
                          <div
                            key={trim.id}
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, trimMaterial: trim.id }));
                              triggerHaptic('selection');
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-[#FF5A1F]/10'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-3.5 h-3.5 rounded border border-white/20"
                                style={{ backgroundColor: trim.previewColor }}
                              />
                              <span className="text-xs font-mono font-bold text-white">{trim.name}</span>
                            </div>
                            <span className="text-xs font-mono text-white/80">
                              {trim.cost === 0 ? 'Included' : `+$${trim.cost.toLocaleString()}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ambient Mood LED Lighting */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block mb-2">
                      // 03. COCKPIT AMBIENT LIGHTING
                    </span>
                    <div className="flex items-center gap-2">
                      {AMBIENT_LIGHTS.map((light) => {
                        const isSelected = config.interiorAmbientColor === light.color;
                        return (
                          <button
                            key={light.name}
                            type="button"
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, interiorAmbientColor: light.color }));
                              triggerHaptic('light');
                            }}
                            className={`flex-1 py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-[#FF5A1F]/20 text-white'
                                : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                            }`}
                          >
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full mb-1 shadow-sm"
                              style={{ backgroundColor: light.color }}
                            />
                            <span className="text-[9px] font-mono block truncate">{light.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WHEEL DESIGNS CUSTOMIZER */}
              {activeTab === 'wheels' && (
                <div className="space-y-6">
                  {/* Wheel Spoke Styles */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block mb-2">
                      // 01. FORGED WHEEL ARCHITECTURE
                    </span>
                    <div className="space-y-2.5">
                      {WHEEL_DESIGNS.map((wheel) => {
                        const isSelected = config.wheelStyle === wheel.id;
                        return (
                          <div
                            key={wheel.id}
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, wheelStyle: wheel.id }));
                              triggerHaptic('selection');
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-[#FF5A1F]/10 shadow-[0_0_15px_rgba(255,90,31,0.2)]'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-mono font-bold text-white">{wheel.name}</h5>
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[#FF5A1F]">
                                    {wheel.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-white/50 mt-1">{wheel.desc}</p>
                              </div>
                              <span className="text-xs font-mono font-bold text-white shrink-0 ml-3">
                                {wheel.cost === 0 ? 'Standard' : `+$${wheel.cost.toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Wheel Finishes */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block mb-2">
                      // 02. RIM SURFACE FINISH
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {WHEEL_FINISHES.map((wf) => {
                        const isSelected = config.wheelColor === wf.id;
                        return (
                          <button
                            key={wf.id}
                            type="button"
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, wheelColor: wf.id }));
                              triggerHaptic('selection');
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-[#FF5A1F]/10 text-white font-bold'
                                : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0"
                              style={{ backgroundColor: wf.color }}
                            />
                            <span className="text-xs font-mono truncate">{wf.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Caliper Colors */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block mb-2">
                      // 03. HIGH-PERFORMANCE BRAKE CALIPERS
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {CALIPER_COLORS.map((cal) => {
                        const isSelected = config.caliperColor === cal.color;
                        return (
                          <button
                            key={cal.name}
                            type="button"
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, caliperColor: cal.color }));
                              triggerHaptic('light');
                            }}
                            className={`p-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-[#FF5A1F]/15 text-white'
                                : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: cal.hex }}
                            />
                            <span className="text-[10px] font-mono truncate">{cal.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CONFIGURATION SUMMARY & TELEMETRY */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase text-[#FF5A1F] tracking-widest font-bold block">
                    // BESPOKE COMMISSION SPECIFICATION
                  </span>

                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-white/60">Selected Hypercar</span>
                      <span className="text-white font-bold">{selectedCar.name}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-white/60">Base MSRP</span>
                      <span className="text-white">${priceCalculation.baseMSRP.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-white/60">Exterior Paint ({config.paintType})</span>
                      <span className="text-white">
                        {priceCalculation.paintCost === 0
                          ? 'Included'
                          : `+$${priceCalculation.paintCost.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-white/60">Interior Seating & Trim</span>
                      <span className="text-white">
                        +${(priceCalculation.seatCost + priceCalculation.trimCost).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-white/60">Forged Wheels Architecture</span>
                      <span className="text-white">
                        {priceCalculation.wheelCost === 0
                          ? 'Included'
                          : `+$${priceCalculation.wheelCost.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-sm font-bold">
                      <span className="text-[#FF5A1F]">TOTAL COMMISSION</span>
                      <span className="text-white">{priceCalculation.formattedTotal}</span>
                    </div>
                  </div>

                  {/* Telemetry Impact Stats */}
                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-white/60">
                      <span>0-60 MPH Acceleration</span>
                      <span className="text-white font-bold">{selectedCar.acceleration}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/60">
                      <span>Max Top Speed</span>
                      <span className="text-white font-bold">{selectedCar.topSpeed}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/60">
                      <span>Total Horsepower</span>
                      <span className="text-white font-bold">{selectedCar.power}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Dock Action Bar */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setConfig({
                  paintColor: '#D61C1C',
                  paintType: 'metallic',
                  clearcoat: 1.0,
                  roughness: 0.12,
                  wheelStyle: 'spoke10',
                  wheelColor: 'silver',
                  tireType: 'street',
                  caliperColor: '#FF5A1F',
                  frontBumper: 'gt',
                  rearBumper: 'stock',
                  hood: 'stock',
                  roof: 'carbon',
                  spoiler: 'gt3',
                  sideSkirts: 'stock',
                  headlightStyle: 'matrix',
                  headlightsOn: true,
                  underglowOn: true,
                  underglowColor: '#FF5A1F',
                  rideHeight: 'track',
                  seatMaterial: 'leather_black',
                  trimMaterial: 'carbon',
                  interiorAmbientColor: '#FF5A1F',
                  autoRotate: true,
                  cinematicMode: false,
                  showStudioFloor: true,
                });
                triggerHaptic('medium');
              }}
              className="px-3 py-3 rounded-2xl glass-panel border border-white/15 text-xs font-mono text-white/70 hover:text-white transition-all cursor-pointer"
              title="Reset to Factory Baseline"
            >
              Reset
            </button>

            <MagneticButton
              variant="primary"
              onClick={() => {
                onBookCommission?.({
                  car: selectedCar,
                  config,
                  totalPrice: priceCalculation.formattedTotal,
                });
                triggerHaptic('success');
              }}
              className="flex-1 py-3 text-xs font-bold justify-center"
            >
              Book Bespoke Commission
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
};
