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
} from 'lucide-react';
import { CarModel } from '../types';
import { CARS_DATA } from '../data/cars';
import { CarConfigState, PaintType, WheelStyle, SeatMaterial, TrimMaterial } from '../types/configurator';
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
import { EngineSoundControl } from './EngineSoundControl';
import { triggerHaptic } from '../utils/haptics';

interface AtelierConfiguratorProps {
  initialCar?: CarModel;
  onBookCommission?: (specDetails: { car: CarModel; config: CarConfigState; totalPrice: string }) => void;
  standalone?: boolean;
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
];

// Bespoke Interior Materials
const INTERIOR_SEATS: { id: SeatMaterial; name: string; cost: number; desc: string; previewColor: string }[] = [
  {
    id: 'leather_black',
    name: 'Nero Alcantara & Orange Stitching',
    cost: 8500,
    desc: 'High-friction lightweight micro-suede with hand-tied Apex Orange perimeter stitching.',
    previewColor: '#18181B',
  },
  {
    id: 'leather_red',
    name: 'Rosso Corsa Full-Grain Leather',
    cost: 11000,
    desc: 'Bespoke hand-selected Italian aniline leather sourced from Northern Tuscany.',
    previewColor: '#991B1B',
  },
  {
    id: 'carbon_bucket',
    name: 'Monocoque Carbon Racing Buckets',
    cost: 16500,
    desc: 'FIA-certified ultra-lightweight carbon shell with anatomical high-density padding.',
    previewColor: '#09090B',
  },
  {
    id: 'alcantara',
    name: 'Arctic White Semi-Aniline Leather',
    cost: 9500,
    desc: 'Perforated climate-controlled luxury leather with cooling air-flow channels.',
    previewColor: '#F4F4F5',
  },
];

// Interior Trim Accents
const INTERIOR_TRIMS: { id: TrimMaterial; name: string; cost: number; desc: string; previewColor: string }[] = [
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

// Ambient Lighting Colors
const AMBIENT_LIGHTS = [
  { name: 'Apex Orange', color: '#FF5A1F' },
  { name: 'Hypercar Cyan', color: '#00E5FF' },
  { name: 'Cyber Violet', color: '#A855F7' },
  { name: 'Crimson Racing', color: '#EF4444' },
  { name: 'Ice White', color: '#F8FAFC' },
];

// Camera Angle Presets
type CameraPreset = 'front_34' | 'side_profile' | 'interior' | 'rear_wing' | 'top_aero';

export const AtelierConfigurator: React.FC<AtelierConfiguratorProps> = ({
  initialCar,
  onBookCommission,
  standalone = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Selected Car in Atelier
  const [selectedCar, setSelectedCar] = useState<CarModel>(initialCar || CARS_DATA[0]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'paint' | 'interior' | 'wheels' | 'acoustics' | 'summary'>('paint');

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
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carContainerRef = useRef<CarModelContainer | null>(null);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 5.4, theta: Math.PI / 4, phi: Math.PI / 2.6 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.5, 0));

  // Textures cache
  const texturesRef = useRef<{
    carbon: THREE.CanvasTexture;
    tread: THREE.CanvasTexture;
    disc: THREE.CanvasTexture;
  } | null>(null);

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
        sphericalRef.current.theta += 0.004;
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

  // Update Camera Position from Spherical Coordinates
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const s = sphericalRef.current;
    const target = targetLookAtRef.current;

    // Spherical to Cartesian
    const x = s.radius * Math.sin(s.phi) * Math.sin(s.theta) + target.x;
    const y = s.radius * Math.cos(s.phi) + target.y;
    const z = s.radius * Math.sin(s.phi) * Math.cos(s.theta) + target.z;

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  }, []);

  // Smooth View Angle Transition
  const setCameraPreset = (preset: CameraPreset) => {
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
  };

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

    // Update spherical angles
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

  // Real-time Material Updates when Config Changes
  useEffect(() => {
    if (!carContainerRef.current) return;
    const container = carContainerRef.current;

    // 1. Exterior Body Paint Update
    const newBodyMat = createBodyMaterial(config);
    container.bodyMaterial = newBodyMat;
    container.bodyGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material !== container.carbonMaterial && obj.material !== container.glassMaterial) {
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

    // Update interior trim accents
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

    // 3. Wheel Finishes & Calipers Update
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

    // 4. Ambient & Underglow Lights
    container.underglowLight.color.set(config.underglowColor);
    container.underglowLight.intensity = config.underglowOn ? 6 : 0;
  }, [config]);

  // Calculate Bespoke Commissioning Additions & Pricing
  const bespokeAdditions = useMemo(() => {
    const selectedPaint = BESPOKE_PAINTS.find((p) => p.color === config.paintColor) || BESPOKE_PAINTS[0];
    const selectedSeat = INTERIOR_SEATS.find((s) => s.id === config.seatMaterial) || INTERIOR_SEATS[0];
    const selectedTrim = INTERIOR_TRIMS.find((t) => t.id === config.trimMaterial) || INTERIOR_TRIMS[0];

    const additions = [
      { name: `Exterior: ${selectedPaint.name} (${selectedPaint.tag})`, cost: selectedPaint.cost },
      { name: `Interior: ${selectedSeat.name}`, cost: selectedSeat.cost },
      { name: `Trim: ${selectedTrim.name}`, cost: selectedTrim.cost },
    ];

    if (config.caliperColor !== '#FF5A1F') {
      additions.push({ name: 'Bespoke Anodized Calipers', cost: 2400 });
    }
    if (config.wheelColor !== 'silver') {
      additions.push({ name: `Custom Forged Wheel Finish (${config.wheelColor})`, cost: 4800 });
    }

    const totalAdditions = additions.reduce((sum, item) => sum + item.cost, 0);

    // Parse base car price
    const baseNumber = parseInt(selectedCar.price.replace(/[$,]/g, ''), 10) || 1850000;
    const finalTotal = baseNumber + totalAdditions;

    return {
      items: additions,
      totalAdditions,
      finalTotal,
      formattedTotal: `$${finalTotal.toLocaleString()}`,
      specCode: `APX-${selectedCar.id.slice(0, 3).toUpperCase()}-${Math.abs(
        config.paintColor.charCodeAt(1) * 31 + config.seatMaterial.length
      ).toString(16).toUpperCase()}-2026`,
    };
  }, [selectedCar, config]);

  // Copy Spec Code
  const handleCopySpecCode = () => {
    navigator.clipboard?.writeText?.(
      `Apex Velocity Bespoke Build: ${selectedCar.name} [Spec: ${bespokeAdditions.specCode}] - ${bespokeAdditions.formattedTotal}`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col space-y-8">
      {/* Top Header Bar & Car Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] font-bold">
              // ATELIER BESPOKE COMMISSIONING STUDIO
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 font-bold">
              360° INTERACTIVE
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-wider text-white mt-1">
            Personalize Your Masterpiece
          </h3>
        </div>

        {/* Vehicle Selector Dropdown */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <span className="text-xs font-mono text-white/50 uppercase shrink-0">Model:</span>
          <select
            value={selectedCar.id}
            onChange={(e) => {
              const found = CARS_DATA.find((c) => c.id === e.target.value);
              if (found) setSelectedCar(found);
            }}
            className="flex-1 lg:flex-initial bg-black/80 border border-white/20 text-white text-xs font-mono py-2.5 px-4 rounded-xl outline-none hover:border-[#FF5A1F] transition-colors cursor-pointer"
          >
            {CARS_DATA.map((car) => (
              <option key={car.id} value={car.id} className="bg-[#121214] text-white">
                {car.name} ({car.power} // {car.price})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* 360 3D Viewport Column (7 Cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div
            className="relative w-full rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#09090d] to-[#040406] shadow-2xl group select-none"
            style={{ height: '520px' }}
          >
            {/* 3D WebGL Canvas Mount */}
            <div
              ref={mountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
            />

            {/* Top Left Floating 360 Drag Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 p-2 px-3 rounded-full glass-card border border-white/15 text-[10px] font-mono text-white/80 backdrop-blur-md pointer-events-none">
              <RotateCcw className="w-3.5 h-3.5 text-[#FF5A1F] animate-spin" style={{ animationDuration: '8s' }} />
              <span>360° Drag to Rotate • Scroll to Zoom</span>
            </div>

            {/* Top Right Quick Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))}
                className={`p-2.5 rounded-xl glass-panel border transition-all cursor-pointer ${
                  config.autoRotate
                    ? 'border-[#FF5A1F] text-[#FF5A1F] bg-[#FF5A1F]/15'
                    : 'border-white/10 text-white/60 hover:text-white'
                }`}
                title="Toggle Auto-Rotation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, underglowOn: !prev.underglowOn }))}
                className={`p-2.5 rounded-xl glass-panel border transition-all cursor-pointer ${
                  config.underglowOn
                    ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/15'
                    : 'border-white/10 text-white/60 hover:text-white'
                }`}
                title="Toggle Underglow Lighting"
              >
                <Sun className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Camera Angle Presets Toolbar */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl glass-card border border-white/15 backdrop-blur-xl bg-black/60">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCameraPreset('front_34')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activePreset === 'front_34'
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Front 3/4
                </button>
                <button
                  type="button"
                  onClick={() => setCameraPreset('side_profile')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activePreset === 'side_profile'
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Side Aero
                </button>
                <button
                  type="button"
                  onClick={() => setCameraPreset('interior')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    activePreset === 'interior'
                      ? 'bg-[#FF5A1F] text-black font-bold shadow-[0_0_12px_rgba(255,90,31,0.5)]'
                      : 'text-[#FF5A1F] hover:bg-white/10'
                  }`}
                >
                  <Armchair className="w-3 h-3" />
                  <span>Cockpit Interior</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCameraPreset('rear_wing')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activePreset === 'rear_wing'
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Rear Downforce
                </button>
                <button
                  type="button"
                  onClick={() => setCameraPreset('top_aero')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activePreset === 'top_aero'
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Top Down
                </button>
              </div>

              {/* Reset Camera View button */}
              <button
                type="button"
                onClick={() => setCameraPreset('front_34')}
                className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-white/50 hover:text-white transition-colors cursor-pointer pr-2"
              >
                <span>Reset View</span>
              </button>
            </div>
          </div>

          {/* Quick Real-Time Telemetry Bar for the Selected Spec */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-mono text-white/40 block">0-60 ACCEL</span>
              <span className="text-sm sm:text-base font-bold font-display text-white">
                {selectedCar.acceleration}
              </span>
            </div>
            <div className="glass-panel p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-mono text-white/40 block">TOP SPEED</span>
              <span className="text-sm sm:text-base font-bold font-display text-white">
                {selectedCar.topSpeed}
              </span>
            </div>
            <div className="glass-panel p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-mono text-white/40 block">POWERTRAIN</span>
              <span className="text-sm sm:text-base font-bold font-display text-[#FF5A1F]">
                {selectedCar.power}
              </span>
            </div>
          </div>

          {/* Integrated Engine Acoustics Quick Console for Currently Selected Hypercar */}
          <EngineSoundControl car={selectedCar} compact />
        </div>

        {/* Configuration Controls Column (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Atelier Navigation Tabs */}
          <div className="flex items-center p-1 rounded-2xl glass-panel border border-white/10 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setActiveTab('paint');
                triggerHaptic('light');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'paint'
                  ? 'bg-[#FF5A1F] text-black font-bold shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Paint</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('interior');
                setCameraPreset('interior'); // Smoothly zoom into cockpit on interior tab click!
                triggerHaptic('light');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'interior'
                  ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              <span>Interior</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('wheels');
                triggerHaptic('light');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'wheels'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>Wheels</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('acoustics');
                triggerHaptic('light');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'acoustics'
                  ? 'bg-[#FF5A1F] text-black font-bold shadow-[0_0_15px_rgba(255,90,31,0.4)]'
                  : 'text-white/70 hover:text-[#FF5A1F]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Acoustics</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('summary');
                triggerHaptic('light');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-amber-400 text-black font-bold shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spec Sheet</span>
            </button>
          </div>

          {/* Tab 1: Exterior Paint Finishes */}
          {activeTab === 'paint' && (
            <div className="space-y-5 glass-card p-5 sm:p-6 rounded-3xl border border-white/15 bg-black/80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5A1F] font-bold">
                    // BESPOKE FINISH PALETTE
                  </span>
                  <span className="text-[11px] font-mono text-white/50">
                    Selected:{' '}
                    <strong className="text-white">
                      {BESPOKE_PAINTS.find((p) => p.color === config.paintColor)?.name}
                    </strong>
                  </span>
                </div>

                {/* Swatches Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {BESPOKE_PAINTS.map((swatch) => {
                    const isSelected = config.paintColor === swatch.color;

                    return (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => {
                          triggerHaptic('colorChange');
                          setConfig((prev) => ({
                            ...prev,
                            paintColor: swatch.color,
                            paintType: swatch.type,
                            roughness: swatch.type === 'matte' ? 0.45 : 0.12,
                            clearcoat: swatch.type === 'matte' ? 0.1 : 1.0,
                          }));
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#FF5A1F] bg-white/10 shadow-[0_0_15px_rgba(255,90,31,0.25)]'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="w-6 h-6 rounded-full border border-white/30 shadow-inner shrink-0"
                            style={{ backgroundColor: swatch.color }}
                          />
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5A1F]" />}
                        </div>
                        <div>
                          <span className="text-[11px] font-display font-bold text-white block leading-tight">
                            {swatch.name}
                          </span>
                          <span className="text-[9px] font-mono text-white/50 block mt-0.5">
                            {swatch.cost === 0 ? 'Included' : `+$${swatch.cost.toLocaleString()}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Finish Texture Parameters */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold block">
                  Clearcoat & Surface Reflectance
                </span>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-white/60 mb-1">
                      <span>Mirror Clearcoat Depth:</span>
                      <span className="text-white font-bold">{Math.round(config.clearcoat * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={config.clearcoat}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, clearcoat: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-[#FF5A1F] h-1.5 bg-white/15 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white/60 mb-1">
                      <span>Surface Micro-Roughness (Gloss vs Satin):</span>
                      <span className="text-white font-bold">{Math.round(config.roughness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.02}
                      max={0.65}
                      step={0.03}
                      value={config.roughness}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, roughness: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-[#00E5FF] h-1.5 bg-white/15 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Bespoke Interior Materials */}
          {activeTab === 'interior' && (
            <div className="space-y-5 glass-card p-5 sm:p-6 rounded-3xl border border-white/15 bg-black/80">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#00E5FF] font-bold block mb-3">
                  // SEAT UPHOLSTERY & SEATING SPECIFICATION
                </span>

                <div className="space-y-2.5">
                  {INTERIOR_SEATS.map((seat) => {
                    const isSelected = config.seatMaterial === seat.id;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          setConfig((prev) => ({ ...prev, seatMaterial: seat.id }));
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-5 h-5 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: seat.previewColor }}
                          />
                          <div>
                            <span className="text-xs font-display font-bold text-white block">
                              {seat.name}
                            </span>
                            <span className="text-[10px] font-mono text-white/50 block mt-0.5">
                              {seat.desc}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <span className="text-xs font-mono font-bold text-[#00E5FF]">
                            +${seat.cost.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interior Trim Architecture */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold block">
                  Dashboard & Center Console Trim
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {INTERIOR_TRIMS.map((trim) => {
                    const isSelected = config.trimMaterial === trim.id;

                    return (
                      <button
                        key={trim.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          setConfig((prev) => ({ ...prev, trimMaterial: trim.id }));
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#FF5A1F] bg-[#FF5A1F]/15'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/30 block mb-2"
                          style={{ backgroundColor: trim.previewColor }}
                        />
                        <span className="text-[11px] font-bold text-white block leading-tight font-display">
                          {trim.name}
                        </span>
                        <span className="text-[9px] font-mono text-[#FF5A1F] block mt-1">
                          +${trim.cost.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ambient Cockpit Illumination Glow */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold">
                    Cockpit Ambient Mood Lighting
                  </span>
                  <span
                    className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: config.interiorAmbientColor, color: config.interiorAmbientColor }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  {AMBIENT_LIGHTS.map((light) => (
                    <button
                      key={light.color}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          interiorAmbientColor: light.color,
                          underglowColor: light.color,
                        }))
                      }
                      className={`w-8 h-8 rounded-full border transition-transform cursor-pointer ${
                        config.interiorAmbientColor === light.color
                          ? 'border-white scale-125 shadow-[0_0_12px_currentColor]'
                          : 'border-white/20 hover:scale-110'
                      }`}
                      style={{ backgroundColor: light.color, color: light.color }}
                      title={light.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Wheels & Aero Finishes */}
          {activeTab === 'wheels' && (
            <div className="space-y-5 glass-card p-5 sm:p-6 rounded-3xl border border-white/15 bg-black/80">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold block mb-3">
                  // FORGED WHEEL ARCHITECTURE
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {(
                    [
                      { id: 'spoke10', label: '10-Spoke Forged' },
                      { id: 'turbofan', label: 'Aero Turbofan' },
                      { id: 'concave', label: 'Deep 5-Spoke' },
                    ] as { id: WheelStyle; label: string }[]
                  ).map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('colorChange');
                        setConfig((prev) => ({ ...prev, wheelStyle: style.id }));
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        config.wheelStyle === style.id
                          ? 'border-[#FF5A1F] bg-[#FF5A1F]/15 font-bold text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wheel Color Finish */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold block">
                  Wheel Metal Finish
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  {[
                    { id: 'silver', label: 'Silver Chrome', color: '#D0D0D0' },
                    { id: 'black', label: 'Satin Nero', color: '#18181B' },
                    { id: 'bronze', label: 'Brushed Bronze', color: '#B87333' },
                    { id: 'gold', label: '24K Gold', color: '#D4AF37' },
                  ].map((wColor) => (
                    <button
                      key={wColor.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('colorChange');
                        setConfig((prev) => ({ ...prev, wheelColor: wColor.id as CarConfigState['wheelColor'] }));
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        config.wheelColor === wColor.id
                          ? 'border-white bg-white/15 font-bold text-white'
                          : 'border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full mx-auto block mb-1 border border-white/30"
                        style={{ backgroundColor: wColor.color }}
                      />
                      <span className="text-[10px] block">{wColor.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brake Calipers Color */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold block">
                  Carbon-Ceramic Caliper Color
                </span>
                <div className="flex items-center gap-3">
                  {[
                    { id: '#FF5A1F', label: 'Apex Orange' },
                    { id: '#FF1E00', label: 'Rosso Red' },
                    { id: '#FFD700', label: 'Racing Yellow' },
                    { id: '#39FF14', label: 'Acid Green' },
                    { id: '#00E5FF', label: 'Cyan Electric' },
                    { id: '#111111', label: 'Carbon Black' },
                  ].map((cal) => (
                    <button
                      key={cal.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('colorChange');
                        setConfig((prev) => ({ ...prev, caliperColor: cal.id as any }));
                      }}
                      className={`w-7 h-7 rounded-full border transition-all cursor-pointer ${
                        config.caliperColor === cal.id
                          ? 'border-white scale-125 shadow-[0_0_10px_currentColor]'
                          : 'border-white/20 hover:scale-110'
                      }`}
                      style={{ backgroundColor: cal.id, color: cal.id }}
                      title={cal.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Engine Acoustics & Exhaust Sound Studio */}
          {activeTab === 'acoustics' && (
            <div className="space-y-4">
              <EngineSoundControl car={selectedCar} />
            </div>
          )}

          {/* Tab 5: Spec Sheet & Price Breakdown */}
          {activeTab === 'summary' && (
            <div className="space-y-5 glass-card p-5 sm:p-6 rounded-3xl border border-white/15 bg-black/80">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] font-bold block">
                    OFFICIAL COMMISSION SPECIFICATION
                  </span>
                  <h4 className="text-lg font-bold font-display uppercase text-white">
                    {selectedCar.name} Bespoke Build
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-white/40 block">SPEC CODE</span>
                  <span className="text-xs font-mono text-[#00E5FF] font-bold">
                    {bespokeAdditions.specCode}
                  </span>
                </div>
              </div>

              {/* Itemized Options */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">Base Vehicle MSRP:</span>
                  <span className="text-white font-bold">{selectedCar.price}</span>
                </div>
                {bespokeAdditions.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/80">{item.name}</span>
                    <span className="text-[#FF5A1F] font-bold">
                      {item.cost === 0 ? 'Included' : `+$${item.cost.toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/50 uppercase block">
                    TOTAL ESTIMATED COMMISSION VALUE:
                  </span>
                  <span className="text-2xl font-black font-display text-white">
                    {bespokeAdditions.formattedTotal}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySpecCode}
                  className="p-2.5 rounded-xl glass-panel border border-white/15 text-white hover:text-[#FF5A1F] transition-all cursor-pointer"
                  title="Copy Spec Summary"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {/* CTA Action */}
              <MagneticButton
                variant="primary"
                onClick={() =>
                  onBookCommission?.({
                    car: selectedCar,
                    config,
                    totalPrice: bespokeAdditions.formattedTotal,
                  })
                }
                className="w-full py-4 text-xs font-bold justify-center"
              >
                Request Commissioning Consultation
                <ChevronRight className="w-4 h-4 ml-1" />
              </MagneticButton>
            </div>
          )}

          {/* Bottom Live Pricing Pill Summary if not on Summary Tab */}
          {activeTab !== 'summary' && (
            <div className="p-4 rounded-2xl glass-card border border-white/15 bg-black/75 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase block">
                  Commission Total:
                </span>
                <span className="text-xl font-bold font-display text-white">
                  {bespokeAdditions.formattedTotal}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider bg-[#FF5A1F]/20 hover:bg-[#FF5A1F] text-white hover:text-black font-bold transition-all border border-[#FF5A1F]/50 cursor-pointer"
              >
                Review Spec ▸
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
