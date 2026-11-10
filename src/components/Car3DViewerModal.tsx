import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Camera,
  Layers,
  Palette,
  Disc,
} from 'lucide-react';
import { CarModel } from '../types';
import { CarConfigState, PaintType, WheelStyle } from '../types/configurator';
import {
  buildPhotorealisticCar,
  createCarbonTexture,
  createTireTreadTexture,
  createBrakeDiscTexture,
  createBodyMaterial,
  createWheelMaterial,
  updateWheelsGroup,
  CarModelContainer,
} from '../utils/carGeometry';
import { triggerHaptic } from '../utils/haptics';

interface Car3DViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarModel | null;
}

const COLOR_SWATCHES = [
  { name: 'Apex Crimson', color: '#D61C1C', type: 'metallic' as PaintType },
  { name: 'Obsidian Nero', color: '#141416', type: 'carbon' as PaintType },
  { name: 'Cyber Cyan', color: '#00E5FF', type: 'pearl' as PaintType },
  { name: 'Solaris Gold', color: '#EAB308', type: 'metallic' as PaintType },
  { name: 'Monaco Amethyst', color: '#7C3AED', type: 'pearl' as PaintType },
  { name: 'Emerald GT', color: '#059669', type: 'metallic' as PaintType },
  { name: 'Stealth Grey', color: '#374151', type: 'matte' as PaintType },
  { name: 'Titanium White', color: '#F3F4F6', type: 'gloss' as PaintType },
];

const WHEEL_STYLES: { id: WheelStyle; label: string }[] = [
  { id: 'spoke10', label: '10-Spoke Forged' },
  { id: 'turbofan', label: 'Aero Turbofan' },
  { id: 'concave', label: 'Deep 5-Spoke' },
];

const WHEEL_FINISHES = [
  { id: 'silver', label: 'Silver Chrome', color: '#D0D0D0' },
  { id: 'black', label: 'Satin Nero', color: '#18181B' },
  { id: 'bronze', label: 'Brushed Bronze', color: '#B87333' },
  { id: 'gold', label: 'Bespoke Gold', color: '#D4AF37' },
] as const;

export const Car3DViewerModal: React.FC<Car3DViewerModalProps> = ({
  isOpen,
  onClose,
  car,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Active configuration state
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

  const [activeTab, setActiveTab] = useState<'paint' | 'wheels' | 'camera'>('paint');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Three.js mutable scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carContainerRef = useRef<CarModelContainer | null>(null);
  const texturesRef = useRef<{
    carbon: THREE.CanvasTexture;
    tread: THREE.CanvasTexture;
    disc: THREE.CanvasTexture;
  } | null>(null);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 6.2, theta: 0.8, phi: 1.25 });
  const targetLookAt = useRef(new THREE.Vector3(0, 0.45, 0));

  // Initialize car color based on selected car prop when opened
  useEffect(() => {
    if (!car) return;
    const nameLower = (car.name + ' ' + car.subtitle).toLowerCase();
    let initialColor = '#D61C1C';
    let initialPaint: PaintType = 'metallic';

    if (nameLower.includes('cyan') || nameLower.includes('vortex')) {
      initialColor = '#00E5FF';
      initialPaint = 'pearl';
    } else if (nameLower.includes('amber') || nameLower.includes('solaris')) {
      initialColor = '#EAB308';
    } else if (nameLower.includes('amethyst')) {
      initialColor = '#7C3AED';
      initialPaint = 'pearl';
    } else if (nameLower.includes('emerald')) {
      initialColor = '#059669';
    } else if (nameLower.includes('stealth') || nameLower.includes('mantis') || nameLower.includes('shadow')) {
      initialColor = '#141416';
      initialPaint = 'carbon';
    } else if (nameLower.includes('white') || nameLower.includes('speedster')) {
      initialColor = '#F3F4F6';
      initialPaint = 'gloss';
    }

    setConfig((prev) => ({
      ...prev,
      paintColor: initialColor,
      paintType: initialPaint,
      underglowColor: initialColor,
    }));
  }, [car]);

  // Set up 3D Scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060608);
    scene.fog = new THREE.FogExp2(0x060608, 0.05);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 3. Renderer setup
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Lighting (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(6, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Cool Sky / Warm Ground Hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x4466aa, 0x111122, 1.2);
    scene.add(hemiLight);

    // Warm Rim / Back Light
    const rimLight = new THREE.DirectionalLight(0xff5a1f, 1.8);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    // 5. Studio Stage Floor & Contact Grounding Shadow
    const floorGeo = new THREE.CircleGeometry(12, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x08080a,
      roughness: 0.45,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Concentric Studio Grid Rings
    const ringGeo = new THREE.RingGeometry(2.5, 2.54, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    // Soft Radial Contact Shadow directly under car
    const shadowGeo = new THREE.PlaneGeometry(5.2, 2.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005;
    scene.add(contactShadow);

    // 6. Build Photorealistic 3D Car Model
    const carbonTex = createCarbonTexture();
    const treadTex = createTireTreadTexture();
    const discTex = createBrakeDiscTexture();
    texturesRef.current = { carbon: carbonTex, tread: treadTex, disc: discTex };

    const carContainer = buildPhotorealisticCar(config, carbonTex, treadTex, discTex);
    scene.add(carContainer.rootGroup);
    carContainerRef.current = carContainer;

    // 7. Mouse & Touch Orbit Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      triggerHaptic('orbit');
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= dx * 0.007;
      sphericalRef.current.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.04, sphericalRef.current.phi - dy * 0.006));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(3.8, Math.min(10.5, sphericalRef.current.radius + e.deltaY * 0.005));
    };

    // Touch support
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        triggerHaptic('orbit');
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - prevMouseRef.current.x;
        const dy = e.touches[0].clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        sphericalRef.current.theta -= dx * 0.007;
        sphericalRef.current.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.04, sphericalRef.current.phi - dy * 0.006));
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = touchStartDist - dist;
        touchStartDist = dist;
        sphericalRef.current.radius = Math.max(3.8, Math.min(10.5, sphericalRef.current.radius + delta * 0.01));
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd);

    // 8. Resize Handler
    const onResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 9. Animation Tick Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth auto-rotation when user is not manually rotating
      if (config.autoRotate && !isDraggingRef.current) {
        sphericalRef.current.theta += delta * 0.25;
      }

      // Convert spherical coordinates to Cartesian camera position
      const { radius, theta, phi } = sphericalRef.current;
      const targetX = radius * Math.sin(phi) * Math.sin(theta);
      const targetY = radius * Math.cos(phi);
      const targetZ = radius * Math.sin(phi) * Math.cos(theta);

      // Smooth camera damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 10, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 10, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 10, delta);
      camera.lookAt(targetLookAt.current);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);

      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isOpen]);

  // Update Paint Material dynamically
  const handleColorChange = useCallback((newColor: string, newType: PaintType) => {
    setConfig((prev) => {
      const next = { ...prev, paintColor: newColor, paintType: newType, underglowColor: newColor };
      if (carContainerRef.current) {
        const bodyMat = createBodyMaterial(next);
        carContainerRef.current.bodyMaterial = bodyMat;

        // Traverse bodyGroup and re-apply updated material
        carContainerRef.current.bodyGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && child.name !== 'carbon') {
            (child as THREE.Mesh).material = bodyMat;
          }
        });
        carContainerRef.current.frontBumperGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && child.name !== 'carbon') {
            (child as THREE.Mesh).material = bodyMat;
          }
        });
        carContainerRef.current.rearBumperGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && child.name !== 'carbon') {
            (child as THREE.Mesh).material = bodyMat;
          }
        });

        // Update underglow light
        carContainerRef.current.underglowLight.color.set(newColor);
      }
      return next;
    });
  }, []);

  // Update Wheels dynamically
  const handleWheelStyleChange = useCallback((style: WheelStyle) => {
    setConfig((prev) => {
      const next = { ...prev, wheelStyle: style };
      if (carContainerRef.current) {
        updateWheelsGroup(
          carContainerRef.current.wheelsGroup,
          next,
          carContainerRef.current.tireMaterial,
          carContainerRef.current.wheelMaterial,
          carContainerRef.current.discMaterial,
          carContainerRef.current.caliperMaterial
        );
      }
      return next;
    });
  }, []);

  const handleWheelFinishChange = useCallback((finish: 'silver' | 'black' | 'bronze' | 'gold') => {
    setConfig((prev) => {
      const next = { ...prev, wheelColor: finish };
      if (carContainerRef.current) {
        const wheelMat = createWheelMaterial(finish);
        carContainerRef.current.wheelMaterial = wheelMat;
        updateWheelsGroup(
          carContainerRef.current.wheelsGroup,
          next,
          carContainerRef.current.tireMaterial,
          wheelMat,
          carContainerRef.current.discMaterial,
          carContainerRef.current.caliperMaterial
        );
      }
      return next;
    });
  }, []);

  // Camera Presets
  const setCameraPreset = (preset: 'three_quarter' | 'profile' | 'front' | 'rear') => {
    switch (preset) {
      case 'three_quarter':
        sphericalRef.current = { radius: 6.2, theta: 0.8, phi: 1.25 };
        break;
      case 'profile':
        sphericalRef.current = { radius: 5.6, theta: Math.PI / 2, phi: 1.35 };
        break;
      case 'front':
        sphericalRef.current = { radius: 5.4, theta: 0.05, phi: 1.32 };
        break;
      case 'rear':
        sphericalRef.current = { radius: 5.5, theta: Math.PI, phi: 1.28 };
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-2xl select-none">
        {/* Top Header Bar */}
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 glass-panel py-2 px-4 rounded-full border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#BEBEBE]">
              3D Bespoke Studio //
            </span>
            <span className="text-xs font-bold font-display uppercase tracking-wider text-white">
              {car?.name || 'Apex Velocity'}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {/* Auto Rotate Toggle */}
            <button
              type="button"
              onClick={() => setConfig((p) => ({ ...p, autoRotate: !p.autoRotate }))}
              className={`p-2.5 rounded-full border text-xs transition-colors cursor-pointer ${
                config.autoRotate
                  ? 'bg-[#FF5A1F]/20 border-[#FF5A1F] text-[#FF5A1F]'
                  : 'glass-panel border-white/15 text-white/70 hover:text-white'
              }`}
              title="Toggle Auto-Rotation"
              aria-label="Toggle Auto-Rotation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close Studio Overlay */}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full glass-panel border border-white/15 text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
              title="Close 3D Viewer"
              aria-label="Close 3D Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 3D Scene Viewport Container (100% Unobstructed Center) */}
        <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />

        {/* Floating Instruction Telemetry */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none text-center">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase bg-black/40 px-3 py-1 rounded-full border border-white/5">
            Drag to Rotate 360° • Scroll / Pinch to Zoom
          </span>
        </div>

        {/* Collapsible Bottom Control Dock (Strictly Following Three.js Guidelines) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 pointer-events-none flex flex-col items-center">
          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-black/80 border border-white/15 text-[10px] font-mono text-[#BEBEBE] hover:text-white transition-colors cursor-pointer shadow-lg"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-[#FF5A1F]" />
                <span>Show Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-[#FF5A1F]" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>

          {/* Unified Horizontal Control Dock */}
          <AnimatePresence>
            {!isDockCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto w-full glass-card rounded-2xl border border-white/15 p-4 shadow-2xl backdrop-blur-xl bg-black/80 space-y-3.5"
              >
                {/* Control Tabs */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('paint')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'paint'
                          ? 'bg-[#FF5A1F] text-white font-bold'
                          : 'text-[#BEBEBE] hover:text-white'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Paint & Finish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('wheels')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'wheels'
                          ? 'bg-[#FF5A1F] text-white font-bold'
                          : 'text-[#BEBEBE] hover:text-white'
                      }`}
                    >
                      <Disc className="w-3.5 h-3.5" />
                      <span>Wheels & Rims</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('camera')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'camera'
                          ? 'bg-[#FF5A1F] text-white font-bold'
                          : 'text-[#BEBEBE] hover:text-white'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera Views</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-[#FF5A1F] uppercase hidden sm:block">
                    LIVE PBR RENDERING
                  </span>
                </div>

                {/* Tab 1: Paint Customization */}
                {activeTab === 'paint' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#BEBEBE]">
                        Color Palette:
                      </span>
                      <span className="text-xs font-bold text-white font-display uppercase">
                        {COLOR_SWATCHES.find((s) => s.color === config.paintColor)?.name || 'Custom'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.name}
                          type="button"
                          onClick={() => handleColorChange(swatch.color, swatch.type)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative shrink-0 ${
                            config.paintColor === swatch.color
                              ? 'border-[#FF5A1F] scale-110 shadow-[0_0_10px_rgba(255,90,31,0.6)]'
                              : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: swatch.color }}
                          title={`${swatch.name} (${swatch.type})`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2: Wheels Customization */}
                {activeTab === 'wheels' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Wheel Rim Style */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#BEBEBE] block">
                        Rim Architecture:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {WHEEL_STYLES.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => handleWheelStyleChange(w.id)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-mono uppercase border transition-all cursor-pointer ${
                              config.wheelStyle === w.id
                                ? 'bg-[#FF5A1F]/20 border-[#FF5A1F] text-[#FF5A1F] font-bold'
                                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                            }`}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wheel Finish */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#BEBEBE] block">
                        Rim Finish / Metal:
                      </span>
                      <div className="flex items-center gap-2">
                        {WHEEL_FINISHES.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => handleWheelFinishChange(f.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                              config.wheelColor === f.id
                                ? 'bg-white/15 border-white text-white font-bold'
                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/20"
                              style={{ backgroundColor: f.color }}
                            />
                            <span>{f.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Camera Views */}
                {activeTab === 'camera' && (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setCameraPreset('three_quarter')}
                      className="flex-1 py-2 rounded-lg text-[11px] font-mono uppercase bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                    >
                      Orbit 3/4
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraPreset('profile')}
                      className="flex-1 py-2 rounded-lg text-[11px] font-mono uppercase bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                    >
                      Profile Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraPreset('front')}
                      className="flex-1 py-2 rounded-lg text-[11px] font-mono uppercase bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                    >
                      Front Hero
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraPreset('rear')}
                      className="flex-1 py-2 rounded-lg text-[11px] font-mono uppercase bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                    >
                      Rear Wing
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatePresence>
  );
};
