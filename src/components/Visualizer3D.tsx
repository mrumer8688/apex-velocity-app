import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import {
  Rotate3D,
  Sparkles,
  Sliders,
  Camera,
  Layers,
  Palette,
  Disc,
  Sun,
  Eye,
  Maximize2,
  Download,
  Check,
  Shield,
  Gauge,
  Zap,
  ChevronRight,
  Info,
} from 'lucide-react';

import {
  CarConfigState,
  ConfigCategory,
  PaintType,
  WheelStyle,
  CaliperColor,
  FrontBumperStyle,
  RearBumperStyle,
  HoodStyle,
  RoofStyle,
  SpoilerStyle,
  LightStyle,
  RideHeight,
  SeatMaterial,
  TrimMaterial,
} from '../types/configurator';

import {
  buildPhotorealisticCar,
  createCarbonTexture,
  createTireTreadTexture,
  createBrakeDiscTexture,
  createBodyMaterial,
  createWheelMaterial,
  updateRoofGroup,
  updateHoodGroup,
  updateFrontBumperGroup,
  updateRearBumperGroup,
  updateSpoilerGroup,
  updateSideSkirtsGroup,
  updateHeadlightsGroup,
  updateInteriorGroup,
  updateWheelsGroup,
  CarModelContainer,
} from '../utils/carGeometry';

import { MagneticButton } from './MagneticButton';
import { triggerHaptic } from '../utils/haptics';

const INITIAL_CONFIG: CarConfigState = {
  paintColor: '#FF5A1F', // Apex Crimson Orange default
  paintType: 'metallic',
  clearcoat: 1.0,
  roughness: 0.1,

  wheelStyle: 'spoke10',
  wheelColor: 'bronze',
  tireType: 'street',
  caliperColor: '#FF1E00',

  frontBumper: 'gt',
  rearBumper: 'f1',
  hood: 'carbon',
  roof: 'carbon',
  spoiler: 'gt3',
  sideSkirts: 'widebody',
  headlightStyle: 'matrix',
  headlightsOn: true,
  underglowOn: true,
  underglowColor: '#FF5A1F',
  rideHeight: 'track',

  seatMaterial: 'carbon_bucket',
  trimMaterial: 'carbon',
  interiorAmbientColor: '#FF5A1F',

  autoRotate: false,
  cinematicMode: false,
  showStudioFloor: true,
};

export const Visualizer3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Configurator state
  const [config, setConfig] = useState<CarConfigState>(INITIAL_CONFIG);
  const [activeCategory, setActiveCategory] = useState<ConfigCategory>('paint');
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carContainerRef = useRef<CarModelContainer | null>(null);

  // Textures
  const carbonTexRef = useRef<THREE.CanvasTexture | null>(null);
  const treadTexRef = useRef<THREE.CanvasTexture | null>(null);
  const discTexRef = useRef<THREE.CanvasTexture | null>(null);

  // Target Camera Interpolation
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(4.2, 1.6, 5.2));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.4, 0));

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505');
    scene.fog = new THREE.FogExp2('#050505', 0.05);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.copy(targetCamPosRef.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
    controls.minDistance = 2.0;
    controls.maxDistance = 12.0;
    controls.target.copy(targetLookAtRef.current);
    controls.addEventListener('start', () => triggerHaptic('orbit'));
    controlsRef.current = controls;

    // 5. Studio Environment Map Generator (PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv).texture;
    scene.environment = envTexture;

    // 6. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.SpotLight(0xffffff, 8.0, 30, Math.PI / 4, 0.4);
    mainKeyLight.position.set(6, 10, 6);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    mainKeyLight.shadow.bias = -0.0001;
    scene.add(mainKeyLight);

    const rimLight1 = new THREE.PointLight(0xff5a1f, 4.0, 15);
    rimLight1.position.set(-5, 4, -5);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0x00d5ff, 2.5, 15);
    rimLight2.position.set(5, 3, -4);
    scene.add(rimLight2);

    // Studio Reflective Floor & Grid
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.15,
      metalness: 0.85,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const grid = new THREE.GridHelper(30, 30, 0xff5a1f, 0x222222);
    grid.position.y = 0;
    scene.add(grid);

    // Soft Shadow Disk Underneath Car
    const shadowGeo = new THREE.CircleGeometry(2.4, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.65,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    scene.add(shadowMesh);

    // 7. Textures Initialization
    carbonTexRef.current = createCarbonTexture();
    treadTexRef.current = createTireTreadTexture();
    discTexRef.current = createBrakeDiscTexture();

    // 8. Build Photorealistic Car
    const carModel = buildPhotorealisticCar(
      config,
      carbonTexRef.current,
      treadTexRef.current,
      discTexRef.current
    );
    scene.add(carModel.rootGroup);
    carContainerRef.current = carModel;

    // 9. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Camera lerp transition to target position/lookAt
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.05);
        controlsRef.current.target.lerp(targetLookAtRef.current, 0.05);
        controlsRef.current.update();
      }

      // Auto-rotation if enabled
      if (config.autoRotate && carContainerRef.current) {
        carContainerRef.current.rootGroup.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize listener
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      pmremGenerator.dispose();
      renderer.dispose();
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // --- DYNAMIC RE-SHADING & PART UPDATES ---
  useEffect(() => {
    const car = carContainerRef.current;
    if (!car) return;

    // 1. Ride Height adjustment
    const heightOffset = config.rideHeight === 'slam' ? -0.08 : config.rideHeight === 'offroad' ? 0.12 : 0;
    car.rootGroup.position.y = 0.52 + heightOffset;

    // 2. Paint Finish update
    const newBodyMat = createBodyMaterial(config);
    car.bodyGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material === car.bodyMaterial) {
        child.material = newBodyMat;
      }
    });
    car.bodyMaterial = newBodyMat;

    // 3. Wheel Finish update
    const newWheelMat = createWheelMaterial(config.wheelColor);
    car.wheelMaterial = newWheelMat;

    // 4. Caliper Color update
    car.caliperMaterial.color.set(config.caliperColor);

    // 5. Modular Group Updates
    if (carbonTexRef.current && chromeTexAvailable()) {
      updateRoofGroup(car.roofGroup, config, newBodyMat, car.glassMaterial, car.carbonMaterial);
      updateHoodGroup(car.hoodGroup, config, newBodyMat, car.carbonMaterial);
      updateFrontBumperGroup(car.frontBumperGroup, config, newBodyMat, car.carbonMaterial, car.chromeMaterial);
      updateRearBumperGroup(car.rearBumperGroup, config, newBodyMat, car.carbonMaterial, car.chromeMaterial);
      updateSpoilerGroup(car.spoilerGroup, config, newBodyMat, car.carbonMaterial);
      updateSideSkirtsGroup(car.sideSkirtsGroup, config, newBodyMat, car.carbonMaterial);
      updateHeadlightsGroup(car.headlightsGroup, config, car.carbonMaterial, car.headlightLights, car.taillightLights);
      updateInteriorGroup(car.interiorGroup, config, car.interiorMaterial, car.carbonMaterial, car.chromeMaterial);
      updateWheelsGroup(car.wheelsGroup, config, car.tireMaterial, newWheelMat, car.discMaterial, car.caliperMaterial);
    }

    // 6. Underglow Light Update
    car.underglowLight.color.set(config.underglowColor);
    car.underglowLight.intensity = config.underglowOn ? 6 : 0;
  }, [config]);

  const chromeTexAvailable = () => true;

  // --- CAMERA ANGLE FOCUS PRESETS ---
  const focusCameraOn = (category: ConfigCategory) => {
    setActiveCategory(category);

    switch (category) {
      case 'paint':
        targetCamPosRef.current.set(4.2, 1.6, 5.2);
        targetLookAtRef.current.set(0, 0.4, 0);
        break;
      case 'body':
        targetCamPosRef.current.set(3.2, 1.2, 3.8);
        targetLookAtRef.current.set(0, 0.3, 1.2); // Focus front aero
        break;
      case 'wheels':
        targetCamPosRef.current.set(2.2, 0.5, 1.8);
        targetLookAtRef.current.set(0.9, 0.2, 1.35); // Focus front wheel
        break;
      case 'lighting':
        targetCamPosRef.current.set(-2.5, 1.2, -3.8);
        targetLookAtRef.current.set(0, 0.5, -1.8); // Focus rear wing & lightbar
        break;
      case 'interior':
        targetCamPosRef.current.set(-0.8, 1.3, 0.4);
        targetLookAtRef.current.set(-0.35, 0.5, 0.0); // Focus cockpit
        break;
      case 'camera':
      default:
        targetCamPosRef.current.set(0, 4.5, 6.0);
        targetLookAtRef.current.set(0, 0.2, 0);
        break;
    }
  };

  // --- SNAPSHOT DOWNLOAD FUNCTION ---
  const handleTakeSnapshot = () => {
    if (!rendererRef.current) return;

    // Render frame
    rendererRef.current.render(sceneRef.current!, cameraRef.current!);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = `Apex_Velocity_Hypercar_${config.paintType.toUpperCase()}_Config.png`;
    link.href = dataUrl;
    link.click();

    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 3000);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-card border border-white/10 flex flex-col justify-between">
      {/* Top Bar Header */}
      <div className="relative z-20 p-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] backdrop-blur-md">
            <Rotate3D className="w-3.5 h-3.5 animate-spin" /> AAA REAL-TIME 3D STUDIO
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-display uppercase text-white mt-1 drop-shadow-md">
            APEX ATELIER CONFIGURATOR
          </h3>
        </div>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfig({ ...config, autoRotate: !config.autoRotate })}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase border transition-all flex items-center gap-2 ${
              config.autoRotate
                ? 'bg-[#FF5A1F] text-black font-bold border-[#FF5A1F]'
                : 'glass-panel text-white border-white/10 hover:border-[#FF5A1F]/50'
            }`}
          >
            <Rotate3D className="w-4 h-4" />
            360° Rotate: {config.autoRotate ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleTakeSnapshot}
            className="px-3.5 py-2 rounded-xl text-xs font-mono uppercase bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2"
          >
            {snapshotSuccess ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-[#FF5A1F]" />
            )}
            {snapshotSuccess ? 'SAVED PNG' : 'CAPTURE SHOT'}
          </button>

          <button
            onClick={() => setSpecModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-mono uppercase bg-[#FF5A1F] text-black font-bold border border-[#FF5A1F] hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Gauge className="w-4 h-4" />
            VIEW SPECS
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount Frame */}
      <div
        ref={canvasContainerRef}
        className="relative w-full h-[520px] sm:h-[620px] cursor-grab active:cursor-grabbing bg-radial from-[#151515] via-[#080808] to-[#020202]"
      >
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* Overlay Direction Hint */}
        <div className="absolute bottom-6 left-6 z-10 pointer-events-none hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400 glass-panel px-3.5 py-1.5 rounded-full border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
          ORBIT 360° • PINCH TO ZOOM • REAL-TIME PBR REFLECTIONS
        </div>
      </div>

      {/* Configurator Navigation Categories */}
      <div className="relative z-20 border-t border-white/10 bg-black/60 backdrop-blur-2xl p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {[
            { id: 'paint', label: 'FINISH & PAINT', icon: Palette },
            { id: 'body', label: 'AERO & BODYWORK', icon: Layers },
            { id: 'wheels', label: 'WHEELS & STANCE', icon: Disc },
            { id: 'lighting', label: 'LIGHTING & WING', icon: Sun },
            { id: 'interior', label: 'COCKPIT & INTERIOR', icon: Eye },
            { id: 'camera', label: 'STUDIO VIEWS', icon: Camera },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => focusCameraOn(cat.id as ConfigCategory)}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5A1F] text-black font-bold shadow-lg shadow-[#FF5A1F]/30 glow-orange'
                    : 'glass-panel text-gray-300 hover:text-white border-white/10 hover:border-[#FF5A1F]/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* --- CATEGORY CONTROLS PANELS --- */}
        <div className="min-h-[120px] flex items-center justify-between">
          {/* 1. PAINT & FINISH PANEL */}
          {activeCategory === 'paint' && (
            <div className="w-full space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#FF5A1F]" /> CHOOSE PAINT TYPE:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['metallic', 'gloss', 'matte', 'pearl', 'chrome', 'carbon'] as PaintType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setConfig({ ...config, paintType: type })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase border transition-all ${
                        config.paintType === type
                          ? 'bg-[#FF5A1F]/20 text-white border-[#FF5A1F]'
                          : 'glass-panel text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="text-xs font-mono uppercase text-gray-400">COLOR PRESET:</span>
                {[
                  { name: 'Apex Crimson', hex: '#FF5A1F' },
                  { name: 'Cyber Black', hex: '#0A0A0A' },
                  { name: 'Titanium Silver', hex: '#D0D0D0' },
                  { name: 'Quantum Blue', hex: '#0055FF' },
                  { name: 'Racing Green', hex: '#00A859' },
                  { name: 'Midnight Violet', hex: '#5800FF' },
                  { name: 'Electric Gold', hex: '#FFD700' },
                  { name: 'Pure Pearl', hex: '#FFFFFF' },
                ].map((swatch) => (
                  <button
                    key={swatch.name}
                    onClick={() => setConfig({ ...config, paintColor: swatch.hex })}
                    className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                      config.paintColor === swatch.hex
                        ? 'border-white scale-110 glow-orange'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                    title={swatch.name}
                  >
                    {config.paintColor === swatch.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-mono uppercase text-gray-400">CUSTOM HEX:</span>
                  <input
                    type="color"
                    value={config.paintColor}
                    onChange={(e) => setConfig({ ...config, paintColor: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. AERO & BODYWORK PANEL */}
          {activeCategory === 'body' && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">FRONT BUMPER</span>
                <select
                  value={config.frontBumper}
                  onChange={(e) => setConfig({ ...config, frontBumper: e.target.value as FrontBumperStyle })}
                  className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                >
                  <option value="stock">Apex OEM Bumper</option>
                  <option value="gt">GT Track Splitter</option>
                  <option value="cyber">Cyber Razor Bumper</option>
                  <option value="widebody">Widebody Competition Bumper</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">REAR DIFFUSER</span>
                <select
                  value={config.rearBumper}
                  onChange={(e) => setConfig({ ...config, rearBumper: e.target.value as RearBumperStyle })}
                  className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                >
                  <option value="stock">Stock Quad Diffuser</option>
                  <option value="f1">F1 Venturi Quad Tips</option>
                  <option value="extreme">Extreme Aero Carbon Diffuser</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">HOOD SCOOP</span>
                <select
                  value={config.hood}
                  onChange={(e) => setConfig({ ...config, hood: e.target.value as HoodStyle })}
                  className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                >
                  <option value="stock">OEM Smooth Hood</option>
                  <option value="carbon">Exposed Carbon Fibre Hood</option>
                  <option value="naca">NACA Duct Power Hood</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">CANOPY ROOF</span>
                <select
                  value={config.roof}
                  onChange={(e) => setConfig({ ...config, roof: e.target.value as RoofStyle })}
                  className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                >
                  <option value="body">Body Color Match Roof</option>
                  <option value="carbon">Carbon Fiber Roof</option>
                  <option value="panoramic">Panoramic Glass Roof</option>
                </select>
              </div>
            </div>
          )}

          {/* 3. WHEELS & STANCE PANEL */}
          {activeCategory === 'wheels' && (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">WHEEL DESIGN</span>
                  <select
                    value={config.wheelStyle}
                    onChange={(e) => setConfig({ ...config, wheelStyle: e.target.value as WheelStyle })}
                    className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                  >
                    <option value="spoke10">Forged 10-Spoke</option>
                    <option value="turbofan">Track Turbofan Aerodisc</option>
                    <option value="concave">Deep Dish Concave 5-Spoke</option>
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">RIM FINISH</span>
                  <select
                    value={config.wheelColor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        wheelColor: e.target.value as 'silver' | 'black' | 'bronze' | 'gold' | 'chrome',
                      })
                    }
                    className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                  >
                    <option value="bronze">Apex Anodized Bronze</option>
                    <option value="black">Cyber Satin Black</option>
                    <option value="silver">Brushed Aluminum</option>
                    <option value="gold">Champion Gold</option>
                    <option value="chrome">Mirror Chrome</option>
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">BREMBO CALIPERS</span>
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { hex: '#FF1E00', name: 'Race Red' },
                      { hex: '#FFD700', name: 'Brembo Gold' },
                      { hex: '#FF5A1F', name: 'Apex Orange' },
                      { hex: '#00E5FF', name: 'Cyan Blue' },
                      { hex: '#111111', name: 'Stealth Black' },
                    ].map((cal) => (
                      <button
                        key={cal.name}
                        onClick={() => setConfig({ ...config, caliperColor: cal.hex as CaliperColor })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          config.caliperColor === cal.hex ? 'border-white scale-110 glow-orange' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: cal.hex }}
                        title={cal.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">SUSPENSION STANCE</span>
                  <div className="flex items-center gap-2">
                    {(['track', 'slam', 'offroad'] as RideHeight[]).map((rh) => (
                      <button
                        key={rh}
                        onClick={() => setConfig({ ...config, rideHeight: rh })}
                        className={`flex-1 py-2 rounded-xl text-xs font-mono uppercase border transition-all ${
                          config.rideHeight === rh
                            ? 'bg-[#FF5A1F] text-black font-bold border-[#FF5A1F]'
                            : 'glass-panel text-gray-300 border-white/10'
                        }`}
                      >
                        {rh === 'slam' ? 'SLAMMED' : rh === 'track' ? 'TRACK' : 'LIFTED'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. LIGHTING & WING PANEL */}
          {activeCategory === 'lighting' && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">ACTIVE REAR SPOILER</span>
                <select
                  value={config.spoiler}
                  onChange={(e) => setConfig({ ...config, spoiler: e.target.value as SpoilerStyle })}
                  className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                >
                  <option value="gt3">GT3 Swan-Neck Carbon Wing</option>
                  <option value="speedtail">Hypercar Speedtail Wing</option>
                  <option value="lip">Flush Ducktail Lip</option>
                  <option value="clean">No Wing (Clean Deck)</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">HEADLIGHT ILLUMINATION</span>
                <button
                  onClick={() => setConfig({ ...config, headlightsOn: !config.headlightsOn })}
                  className={`w-full py-2.5 rounded-xl text-xs font-mono uppercase border transition-all flex items-center justify-center gap-2 ${
                    config.headlightsOn
                      ? 'bg-[#FF5A1F]/20 text-white border-[#FF5A1F]'
                      : 'glass-panel text-gray-400 border-white/10'
                  }`}
                >
                  <Sun className="w-4 h-4 text-[#FF5A1F]" />
                  LED Headlights: {config.headlightsOn ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">UNDERGLOW NEON</span>
                <button
                  onClick={() => setConfig({ ...config, underglowOn: !config.underglowOn })}
                  className={`w-full py-2.5 rounded-xl text-xs font-mono uppercase border transition-all flex items-center justify-center gap-2 ${
                    config.underglowOn
                      ? 'bg-[#FF5A1F]/20 text-white border-[#FF5A1F]'
                      : 'glass-panel text-gray-400 border-white/10'
                  }`}
                >
                  <Zap className="w-4 h-4 text-[#FF5A1F]" />
                  Underglow: {config.underglowOn ? 'ON' : 'OFF'}
                </button>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">UNDERGLOW COLOR</span>
                <input
                  type="color"
                  value={config.underglowColor}
                  onChange={(e) => setConfig({ ...config, underglowColor: e.target.value })}
                  className="w-full h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 5. COCKPIT & INTERIOR PANEL */}
          {activeCategory === 'interior' && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">RECARO SEATS</span>
                <select
                  value={config.seatMaterial}
                  onChange={(e) => setConfig({ ...config, seatMaterial: e.target.value as SeatMaterial })}
                  className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                >
                  <option value="carbon_bucket">Full Carbon Fiber Bucket Seats</option>
                  <option value="alcantara">Perforated Alcantara Suede</option>
                  <option value="leather_red">Crimson Racing Leather</option>
                  <option value="leather_black">Nappa Black Leather</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">STEERING WHEEL TRIM</span>
                <select
                  value={config.trimMaterial}
                  onChange={(e) => setConfig({ ...config, trimMaterial: e.target.value as TrimMaterial })}
                  className="w-full bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono uppercase focus:border-[#FF5A1F]"
                >
                  <option value="carbon">Exposed Carbon Fiber Trim</option>
                  <option value="aluminum">Brushed Aluminum Accent</option>
                  <option value="bronze">Anodized Bronze Accent</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-400 mb-1.5">CAMERA INTERIOR SNAP</span>
                <button
                  onClick={() => focusCameraOn('interior')}
                  className="w-full py-2.5 rounded-xl text-xs font-mono uppercase bg-[#FF5A1F] text-black font-bold flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> FOCUS COCKPIT VIEW
                </button>
              </div>
            </div>
          )}

          {/* 6. STUDIO VIEWS PANEL */}
          {activeCategory === 'camera' && (
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Front 3/4 View', pos: [4.2, 1.6, 5.2], look: [0, 0.4, 0] },
                { label: 'Side Profile', pos: [0, 1.2, 6.2], look: [0, 0.4, 0] },
                { label: 'Rear Wing Aero', pos: [-3.5, 1.4, -4.2], look: [0, 0.4, -1.5] },
                { label: "Bird's Eye Overhead", pos: [0, 6.5, 0.1], look: [0, 0, 0] },
              ].map((view, i) => (
                <button
                  key={i}
                  onClick={() => {
                    targetCamPosRef.current.set(view.pos[0], view.pos[1], view.pos[2]);
                    targetLookAtRef.current.set(view.look[0], view.look[1], view.look[2]);
                  }}
                  className="p-3 rounded-xl glass-panel text-white text-xs font-mono uppercase border border-white/10 hover:border-[#FF5A1F] hover:bg-white/5 transition-all text-center flex flex-col items-center gap-1"
                >
                  <Camera className="w-4 h-4 text-[#FF5A1F]" />
                  {view.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- HYPERCAR SPECIFICATION MODAL --- */}
      {specModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-8 rounded-3xl border border-white/20 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-[#FF5A1F]" />
                <h3 className="text-xl font-bold font-display uppercase text-white">
                  APEX VELOCITY BUILD SPECIFICATION
                </h3>
              </div>
              <button
                onClick={() => setSpecModalOpen(false)}
                className="p-2 rounded-full glass-panel hover:text-[#FF5A1F] text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Total Output</span>
                <span className="text-2xl font-black font-display text-white">1,914 HP</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">0-100 KM/H</span>
                <span className="text-2xl font-black font-display text-[#FF5A1F]">1.82 SEC</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Aero Downforce</span>
                <span className="text-2xl font-black font-display text-white">
                  {config.spoiler === 'gt3' ? '850 KG' : config.spoiler === 'speedtail' ? '720 KG' : '450 KG'}
                </span>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Curb Weight</span>
                <span className="text-2xl font-black font-display text-white">
                  {config.roof === 'carbon' ? '1,420 KG' : '1,460 KG'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-gray-300 divide-y divide-white/10">
              <div className="flex justify-between py-2">
                <span>Paint Finish:</span>
                <span className="text-white uppercase">
                  {config.paintType} ({config.paintColor})
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span>Front Aero Bumper:</span>
                <span className="text-white uppercase">{config.frontBumper}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Rear Diffuser & Exhaust:</span>
                <span className="text-white uppercase">{config.rearBumper}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Wheel Package:</span>
                <span className="text-white uppercase">
                  {config.wheelStyle} ({config.wheelColor})
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span>Active Spoiler:</span>
                <span className="text-white uppercase">{config.spoiler}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <MagneticButton variant="glass" onClick={() => setSpecModalOpen(false)}>
                Close
              </MagneticButton>
              <MagneticButton variant="primary" onClick={handleTakeSnapshot}>
                Download PNG Build
              </MagneticButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
