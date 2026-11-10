import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  RotateCcw,
  Maximize2,
  Minimize2,
  Scan,
  Sparkles,
  Palette,
  Download,
  AlertCircle,
  QrCode,
  Activity,
} from 'lucide-react';
import { CarModel } from '../types';
import { ARTelemetryHUD } from './ARTelemetryHUD';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ARColorPickerDrawer } from './ARColorPickerDrawer';
import { CarConfigState, PaintType } from '../types/configurator';
import {
  buildPhotorealisticCar,
  createCarbonTexture,
  createTireTreadTexture,
  createBrakeDiscTexture,
  createBodyMaterial,
  CarModelContainer,
} from '../utils/carGeometry';

interface CarARViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarModel | null;
}

const AR_COLOR_OPTIONS = [
  { name: 'Apex Crimson', color: '#D61C1C', type: 'metallic' as PaintType },
  { name: 'Obsidian Nero', color: '#141416', type: 'carbon' as PaintType },
  { name: 'Cyber Cyan', color: '#00E5FF', type: 'pearl' as PaintType },
  { name: 'Solaris Gold', color: '#EAB308', type: 'metallic' as PaintType },
  { name: 'Monaco Amethyst', color: '#7C3AED', type: 'pearl' as PaintType },
];

export const CarARViewerModal: React.FC<CarARViewerModalProps> = ({
  isOpen,
  onClose,
  car,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const { isSunset } = useTheme();
  const { t } = useLanguage();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scaleMode, setScaleMode] = useState<'tabletop' | 'fullscale'>('tabletop');
  const [paintColor, setPaintColor] = useState('#D61C1C');
  const [paintType, setPaintType] = useState<PaintType>('metallic');
  const [clearcoat, setClearcoat] = useState(1.0);
  const [roughness, setRoughness] = useState(0.12);
  const [colorDrawerOpen, setColorDrawerOpen] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [arRotation, setArRotation] = useState({ x: 0.1, y: 0.6 });

  // 3D Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carContainerRef = useRef<CarModelContainer | null>(null);
  const carRootRef = useRef<THREE.Group | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // AR Interaction (rotation and scale)
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ y: 0.6, x: 0.1 });
  const scaleRef = useRef(1.0);

  // Initialize paint from car
  useEffect(() => {
    if (!car) return;
    const nameLower = car.name.toLowerCase();
    if (nameLower.includes('cyan') || nameLower.includes('vortex')) {
      setPaintColor('#00E5FF');
      setPaintType('pearl');
    } else if (nameLower.includes('amber') || nameLower.includes('solaris')) {
      setPaintColor('#EAB308');
      setPaintType('metallic');
    } else if (nameLower.includes('mantis') || nameLower.includes('stealth')) {
      setPaintColor('#141416');
      setPaintType('carbon');
    } else {
      setPaintColor('#D61C1C');
      setPaintType('metallic');
    }
  }, [car]);

  // Request Mobile / Webcam Video Stream
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not available in this browser environment');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setCameraError(null);
      } catch (err: unknown) {
        if (mounted) {
          console.warn('AR Camera access issue:', err);
          setCameraError(
            err instanceof Error
              ? err.message
              : 'Camera access denied or unavailable. Running in simulated AR Studio mode.'
          );
          setCameraActive(false);
        }
      }
    }

    initCamera();

    return () => {
      mounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isOpen]);

  // Three.js AR Scene Setup
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Transparent Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    // 3. Renderer with transparent background to overlay live camera
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // for snapshots
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Lighting Rig suited for real-world AR projection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 7, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x333333, 1.5);
    scene.add(ambientLight);

    // 5. Contact Shadow on floor plane
    const shadowGeo = new THREE.PlaneGeometry(6, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(64, 64, 15, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.45)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.52;
    scene.add(contactShadow);

    // 6. Build 3D Car Model
    const carbonTex = createCarbonTexture();
    const treadTex = createTireTreadTexture();
    const discTex = createBrakeDiscTexture();

    const initialConfig: CarConfigState = {
      paintColor,
      paintType,
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
      autoRotate: false,
      cinematicMode: false,
      showStudioFloor: false,
    };

    const carContainer = buildPhotorealisticCar(initialConfig, carbonTex, treadTex, discTex);
    const carRoot = carContainer.rootGroup;
    carRoot.position.set(0, -0.5, 0);
    scene.add(carRoot);
    carContainerRef.current = carContainer;
    carRootRef.current = carRoot;

    // 7. AR Gesture Handling (1-finger rotate, 2-finger scale)
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      rotationRef.current.y += dx * 0.009;
      rotationRef.current.x = Math.max(-0.2, Math.min(0.4, rotationRef.current.x + dy * 0.005));
      setArRotation({ x: rotationRef.current.x, y: rotationRef.current.y });
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch support for mobile camera AR
    let touchDistance = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistance = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - prevMouseRef.current.x;
        const dy = e.touches[0].clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        rotationRef.current.y += dx * 0.009;
        rotationRef.current.x = Math.max(-0.2, Math.min(0.4, rotationRef.current.x + dy * 0.005));
        setArRotation({ x: rotationRef.current.x, y: rotationRef.current.y });
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = dist - touchDistance;
        touchDistance = dist;

        scaleRef.current = Math.max(0.35, Math.min(2.4, scaleRef.current + delta * 0.005));
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd);

    // Resize
    const onResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 8. Render Tick Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (carRoot) {
        carRoot.rotation.y = rotationRef.current.y;
        carRoot.rotation.x = rotationRef.current.x;

        const currentScale = scaleRef.current;
        carRoot.scale.set(currentScale, currentScale, currentScale);
        contactShadow.scale.set(currentScale, currentScale, currentScale);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
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

  // Handle real-time color & paint finish change in AR
  const handleColorChange = useCallback((
    color: string,
    type: PaintType,
    customClearcoat?: number,
    customRoughness?: number
  ) => {
    setPaintColor(color);
    setPaintType(type);
    const activeClearcoat = customClearcoat !== undefined ? customClearcoat : clearcoat;
    const activeRoughness = customRoughness !== undefined ? customRoughness : roughness;
    if (customClearcoat !== undefined) setClearcoat(customClearcoat);
    if (customRoughness !== undefined) setRoughness(customRoughness);

    if (carContainerRef.current) {
      const dummyConfig = {
        paintColor: color,
        paintType: type,
        clearcoat: activeClearcoat,
        roughness: activeRoughness,
      } as CarConfigState;

      const bodyMat = createBodyMaterial(dummyConfig);
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
      carContainerRef.current.underglowLight.color.set(color);
    }
  }, [clearcoat, roughness]);

  // Scale mode toggle
  const handleScaleToggle = (mode: 'tabletop' | 'fullscale') => {
    setScaleMode(mode);
    if (mode === 'tabletop') {
      scaleRef.current = 0.55;
    } else {
      scaleRef.current = 1.35;
    }
  };

  // Reset orientation
  const handleReset = () => {
    rotationRef.current = { y: 0.6, x: 0.1 };
    scaleRef.current = scaleMode === 'tabletop' ? 0.55 : 1.35;
  };

  // Take Snapshot
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;

    try {
      // Create combined canvas for camera + 3D model
      const canvas = document.createElement('canvas');
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw camera video feed if active
        if (videoRef.current && cameraActive) {
          ctx.drawImage(videoRef.current, 0, 0, w, h);
        } else {
          ctx.fillStyle = '#0a0a0c';
          ctx.fillRect(0, 0, w, h);
        }

        // Draw 3D WebGL Canvas on top
        const webglCanvas = rendererRef.current.domElement;
        ctx.drawImage(webglCanvas, 0, 0, w, h);

        // Watermark
        ctx.fillStyle = '#FF5A1F';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('APEX VELOCITY // AR ATELIER', 24, h - 30);

        // Export and trigger download
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const link = document.createElement('a');
        link.download = `apex-${car?.name.toLowerCase().replace(/\s+/g, '-') || 'hypercar'}-ar.jpg`;
        link.href = dataUrl;
        link.click();

        setSnapshotSuccess(true);
        setTimeout(() => setSnapshotSuccess(false), 2500);
      }
    } catch (e) {
      console.warn('Snapshot failed:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex flex-col bg-black overflow-hidden select-none">
        {/* Real Mobile Camera Video Stream Background */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Fallback Simulated Floor Grid when camera is unavailable or loading */}
        {!cameraActive && (
          <div className="absolute inset-0 bg-[#060608] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_60%,#000_70%,transparent_100%)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF5A1F]/10 blur-[120px] rounded-full" />
          </div>
        )}

        {/* Transparent WebGL 3D Car Overlay Canvas */}
        <div ref={mountRef} className="w-full h-full relative z-10 cursor-grab active:cursor-grabbing" />

        {/* Top AR Header & Controls */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 glass-panel py-2 px-4 rounded-full border border-white/15 backdrop-blur-md">
            <span
              className={`w-2 h-2 rounded-full ${
                cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-[#FF5A1F]'
              }`}
            />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/80">
              {cameraActive ? t('ar.cameraLive', 'AR CAMERA LIVE') : t('ar.studioLive', 'AR STUDIO VIEW')}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-xs font-bold font-display uppercase text-white truncate max-w-[130px] sm:max-w-none">
              {car?.name || 'Hypercar'}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {/* Real-Time Telemetry HUD Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowTelemetry((s) => !s);
              }}
              className={`p-2 sm:px-3 sm:py-2 rounded-full glass-panel border transition-all cursor-pointer flex items-center gap-1.5 ${
                showTelemetry
                  ? isSunset
                    ? 'border-[#FFAA33]/70 bg-[#FFAA33]/20 text-[#FFAA33] shadow-[0_0_14px_rgba(255,170,51,0.4)]'
                    : 'border-[#00E5FF]/60 bg-[#00E5FF]/15 text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'border-white/15 text-white/60 hover:text-white'
              }`}
              title={showTelemetry ? 'Hide Telemetry HUD' : 'Show Telemetry HUD'}
              aria-label="Toggle Telemetry HUD"
            >
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase font-bold hidden sm:inline">
                {showTelemetry ? t('ar.hudOn', 'HUD ON') : t('ar.hudOff', 'HUD')}
              </span>
            </button>

            {/* Reset Orientation */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-full glass-panel border border-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={t('ar.reset', 'Reset Position')}
              aria-label={t('ar.reset', 'Reset Position')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Exit AR */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2.5 rounded-full glass-panel border border-white/15 text-white transition-colors cursor-pointer ${
                isSunset ? 'hover:text-[#FFAA33]' : 'hover:text-[#FF5A1F]'
              }`}
              title="Close AR Viewer"
              aria-label="Close AR Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Real-Time Telemetry HUD Overlay: Live Torque & Speed Metrics */}
        {showTelemetry && car && (
          <ARTelemetryHUD car={car} rotation={arRotation} />
        )}

        {/* Camera Permission / Fallback Alert Toast */}
        {cameraError && (
          <div className="absolute top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-20 pointer-events-none">
            <div className="glass-card p-3 rounded-2xl border border-amber-500/30 bg-black/85 flex items-start gap-2.5 shadow-xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] font-mono text-white/80 leading-relaxed">
                <span>Camera feed not detected. Projecting into simulated AR Atelier.</span>
              </div>
            </div>
          </div>
        )}

        {/* Center Reticle & Interaction Hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center z-0">
          <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center opacity-40 animate-pulse">
            <Scan className="w-8 h-8 text-[#FF5A1F]/60" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/60 bg-black/60 px-3 py-1 rounded-full border border-white/10 mt-3 inline-block">
            {t('ar.dragHint', 'Drag to Rotate • Pinch to Scale')}
          </span>
        </div>

        {/* Bottom AR Control Dock */}
        <footer className="absolute bottom-6 inset-x-0 z-20 flex flex-col items-center gap-3 px-4 pointer-events-none">
          {/* Snapshot Confirmation Badge */}
          <AnimatePresence>
            {snapshotSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-card px-4 py-2 rounded-full border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('ar.saved', 'AR Snapshot Saved to Gallery')}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unified Controls Card */}
          <div className="pointer-events-auto glass-card rounded-3xl border border-white/20 p-3.5 sm:p-4 bg-black/85 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-xl w-full">
            {/* Scale Presets: Tabletop vs 1:1 Full Scale */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => handleScaleToggle('tabletop')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  scaleMode === 'tabletop'
                    ? isSunset ? 'bg-[#FFAA33] text-black font-bold' : 'bg-[#FF5A1F] text-white font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Minimize2 className="w-3 h-3" />
                <span>{t('ar.deskScale', 'Desk (1:10)')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleScaleToggle('fullscale')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  scaleMode === 'fullscale'
                    ? isSunset ? 'bg-[#FFAA33] text-black font-bold' : 'bg-[#FF5A1F] text-white font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                <span>{t('ar.fullScale', '1:1 Scale')}</span>
              </button>
            </div>

            {/* Dynamic Paint & Finish Lab Launcher + Quick Swatches */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setColorDrawerOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-mono transition-all cursor-pointer ${
                  colorDrawerOpen
                    ? isSunset
                      ? 'bg-[#FFAA33]/25 border-[#FFAA33] text-[#FFAA33] shadow-[0_0_12px_rgba(255,170,51,0.4)]'
                      : 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                    : 'bg-white/5 border-white/15 text-white/80 hover:text-white hover:border-white/30'
                }`}
                title={t('ar.paintFinish', 'Open Paint & Finish Lab')}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/40 shadow-sm shrink-0"
                  style={{ backgroundColor: paintColor }}
                />
                <Palette className={`w-3.5 h-3.5 ${isSunset ? 'text-[#FFAA33]' : 'text-[#00E5FF]'}`} />
                <span className="font-bold uppercase tracking-wider text-[11px] hidden sm:inline">
                  {paintType}
                </span>
              </button>

              {/* Quick Preset Swatches with Tooltip */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[140px] sm:max-w-none">
                {AR_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => handleColorChange(opt.color, opt.type)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      paintColor.toLowerCase() === opt.color.toLowerCase()
                        ? isSunset
                          ? 'border-[#FFAA33] scale-110 shadow-[0_0_8px_#FFAA33]'
                          : 'border-[#00E5FF] scale-110 shadow-[0_0_8px_#00E5FF]'
                        : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: opt.color }}
                    title={`${opt.name} (${opt.type})`}
                  />
                ))}
              </div>
            </div>

            {/* Shutter / Snapshot Camera Button */}
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-white/90 text-black text-xs font-bold font-mono uppercase transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              title={t('ar.capture', 'Capture AR Photo')}
            >
              <Camera className={`w-4 h-4 ${isSunset ? 'text-[#FF5520]' : 'text-[#FF5A1F]'}`} />
              <span>{t('ar.capture', 'Capture')}</span>
            </button>
          </div>
        </footer>

        {/* Dynamic Color-Picker & Paint Finish Lab Drawer Component */}
        <ARColorPickerDrawer
          currentColor={paintColor}
          currentFinish={paintType}
          clearcoat={clearcoat}
          roughness={roughness}
          onColorChange={handleColorChange}
          isOpen={colorDrawerOpen}
          onClose={() => setColorDrawerOpen(false)}
        />
      </div>
    </AnimatePresence>
  );
};
