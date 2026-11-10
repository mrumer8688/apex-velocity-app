import * as THREE from 'three';
import { CarConfigState } from '../types/configurator';

// Helper to generate a carbon fiber canvas texture
export function createCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = '#222222';
    for (let y = 0; y < 128; y += 8) {
      for (let x = 0; x < 128; x += 8) {
        if ((x / 8 + y / 8) % 2 === 0) {
          ctx.fillRect(x, y, 4, 4);
          ctx.fillRect(x + 4, y + 4, 4, 4);
        } else {
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(x + 4, y, 4, 4);
          ctx.fillRect(x, y + 4, 4, 4);
          ctx.fillStyle = '#222222';
        }
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// Helper to generate tire tread bump map
export function createTireTreadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#000000'; // Depth grooves
    // V-shape directional tread pattern
    for (let y = 0; y < 256; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y + 12);
      ctx.lineTo(256, y);
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(20, y + 8);
      ctx.lineTo(100, y + 16);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(236, y + 8);
      ctx.lineTo(156, y + 16);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 16);
  return texture;
}

// Helper to create brake disc texture
export function createBrakeDiscTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, 0, 256, 256);

    // Concentric machining rings
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    for (let r = 20; r < 120; r += 3) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cross-drilled holes
    ctx.fillStyle = '#111111';
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI * 2) / 36;
      const r1 = 60 + (i % 3) * 18;
      const x = 128 + Math.cos(angle) * r1;
      const y = 128 + Math.sin(angle) * r1;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export interface CarModelContainer {
  rootGroup: THREE.Group;
  bodyGroup: THREE.Group;
  frontBumperGroup: THREE.Group;
  rearBumperGroup: THREE.Group;
  hoodGroup: THREE.Group;
  roofGroup: THREE.Group;
  spoilerGroup: THREE.Group;
  sideSkirtsGroup: THREE.Group;
  wheelsGroup: THREE.Group;
  headlightsGroup: THREE.Group;
  interiorGroup: THREE.Group;
  underglowLight: THREE.PointLight;
  headlightLights: THREE.SpotLight[];
  taillightLights: THREE.PointLight[];

  // Materials
  bodyMaterial: THREE.MeshPhysicalMaterial;
  glassMaterial: THREE.MeshPhysicalMaterial;
  carbonMaterial: THREE.MeshStandardMaterial;
  chromeMaterial: THREE.MeshStandardMaterial;
  wheelMaterial: THREE.MeshStandardMaterial;
  caliperMaterial: THREE.MeshStandardMaterial;
  discMaterial: THREE.MeshStandardMaterial;
  tireMaterial: THREE.MeshStandardMaterial;
  interiorMaterial: THREE.MeshStandardMaterial;
}

export function buildPhotorealisticCar(
  config: CarConfigState,
  carbonTex: THREE.CanvasTexture,
  treadTex: THREE.CanvasTexture,
  discTex: THREE.CanvasTexture
): CarModelContainer {
  const rootGroup = new THREE.Group();

  // Root height adjustment based on Ride Height
  const heightOffset = config.rideHeight === 'slam' ? -0.08 : config.rideHeight === 'offroad' ? 0.12 : 0;
  rootGroup.position.y = 0.52 + heightOffset;

  // --- Base Materials ---
  const carbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    map: carbonTex,
    roughness: 0.3,
    metalness: 0.4,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    metalness: 0.98,
    roughness: 0.05,
    envMapIntensity: 2.0,
  });

  const bodyMaterial = createBodyMaterial(config);

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050810,
    metalness: 0.1,
    roughness: 0.02,
    transmission: 0.92,
    transparent: true,
    opacity: 0.85,
    ior: 1.52,
    thickness: 0.5,
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x181818,
    bumpMap: treadTex,
    bumpScale: 0.04,
    roughness: 0.75,
    metalness: 0.1,
  });

  const discMaterial = new THREE.MeshStandardMaterial({
    map: discTex,
    color: 0xd0d0d0,
    metalness: 0.9,
    roughness: 0.25,
  });

  const caliperMaterial = new THREE.MeshStandardMaterial({
    color: config.caliperColor,
    metalness: 0.7,
    roughness: 0.2,
  });

  const wheelMaterial = createWheelMaterial(config.wheelColor);

  const interiorMaterial = new THREE.MeshStandardMaterial({
    color: config.seatMaterial === 'leather_red' ? 0x881111 : config.seatMaterial === 'alcantara' ? 0x222222 : 0x111111,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Groups
  const bodyGroup = new THREE.Group();
  const frontBumperGroup = new THREE.Group();
  const rearBumperGroup = new THREE.Group();
  const hoodGroup = new THREE.Group();
  const roofGroup = new THREE.Group();
  const spoilerGroup = new THREE.Group();
  const sideSkirtsGroup = new THREE.Group();
  const wheelsGroup = new THREE.Group();
  const headlightsGroup = new THREE.Group();
  const interiorGroup = new THREE.Group();

  rootGroup.add(bodyGroup);
  rootGroup.add(frontBumperGroup);
  rootGroup.add(rearBumperGroup);
  rootGroup.add(hoodGroup);
  rootGroup.add(roofGroup);
  rootGroup.add(spoilerGroup);
  rootGroup.add(sideSkirtsGroup);
  rootGroup.add(wheelsGroup);
  rootGroup.add(headlightsGroup);
  rootGroup.add(interiorGroup);

  // --- 1. CORE BODY SHELL (Smooth Curves & Fender Flares) ---
  // Lower Fuselage
  const mainFuselageShape = new THREE.Shape();
  mainFuselageShape.moveTo(-1.05, -2.1);
  mainFuselageShape.lineTo(1.05, -2.1);
  mainFuselageShape.lineTo(1.08, -0.5);
  mainFuselageShape.lineTo(1.0, 1.8);
  mainFuselageShape.lineTo(0.7, 2.25);
  mainFuselageShape.lineTo(-0.7, 2.25);
  mainFuselageShape.lineTo(-1.0, 1.8);
  mainFuselageShape.lineTo(-1.08, -0.5);

  const extrudeSettings = {
    steps: 2,
    depth: 0.55,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.08,
    bevelSegments: 5,
  };

  const bodyGeo = new THREE.ExtrudeGeometry(mainFuselageShape, extrudeSettings);
  bodyGeo.rotateX(Math.PI / 2);
  bodyGeo.center();
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
  bodyMesh.position.set(0, 0.22, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyGroup.add(bodyMesh);

  // Front Fenders (Left & Right Sculpted Arches)
  const fenderGeo = new THREE.CylinderGeometry(0.5, 0.54, 0.42, 32, 1, false, 0, Math.PI);
  fenderGeo.rotateZ(Math.PI / 2);

  const frontFenderLeft = new THREE.Mesh(fenderGeo, bodyMaterial);
  frontFenderLeft.position.set(-0.95, 0.18, 1.35);
  frontFenderLeft.rotation.y = -0.1;
  frontFenderLeft.castShadow = true;

  const frontFenderRight = new THREE.Mesh(fenderGeo, bodyMaterial);
  frontFenderRight.position.set(0.95, 0.18, 1.35);
  frontFenderRight.rotation.y = 0.1;
  frontFenderRight.castShadow = true;

  bodyGroup.add(frontFenderLeft);
  bodyGroup.add(frontFenderRight);

  // Rear Haunches (Wide muscle shoulders)
  const rearFenderGeo = new THREE.CylinderGeometry(0.52, 0.56, 0.45, 32, 1, false, 0, Math.PI);
  rearFenderGeo.rotateZ(Math.PI / 2);

  const rearFenderLeft = new THREE.Mesh(rearFenderGeo, bodyMaterial);
  rearFenderLeft.position.set(-1.0, 0.22, -1.35);
  rearFenderLeft.castShadow = true;

  const rearFenderRight = new THREE.Mesh(rearFenderGeo, bodyMaterial);
  rearFenderRight.position.set(1.0, 0.22, -1.35);
  rearFenderRight.castShadow = true;

  bodyGroup.add(rearFenderLeft);
  bodyGroup.add(rearFenderRight);

  // Side Mirrors
  const mirrorArmGeo = new THREE.BoxGeometry(0.2, 0.03, 0.04);
  const mirrorCapGeo = new THREE.BoxGeometry(0.24, 0.12, 0.14);

  const mirrorLeftGroup = new THREE.Group();
  mirrorLeftGroup.position.set(-0.92, 0.58, 0.5);
  const mirrorArmL = new THREE.Mesh(mirrorArmGeo, carbonMaterial);
  const mirrorCapL = new THREE.Mesh(mirrorCapGeo, bodyMaterial);
  mirrorCapL.position.set(-0.12, 0.04, 0);
  mirrorCapL.rotation.y = 0.2;
  mirrorLeftGroup.add(mirrorArmL, mirrorCapL);

  const mirrorRightGroup = new THREE.Group();
  mirrorRightGroup.position.set(0.92, 0.58, 0.5);
  const mirrorArmR = new THREE.Mesh(mirrorArmGeo, carbonMaterial);
  const mirrorCapR = new THREE.Mesh(mirrorCapGeo, bodyMaterial);
  mirrorCapR.position.set(0.12, 0.04, 0);
  mirrorCapR.rotation.y = -0.2;
  mirrorRightGroup.add(mirrorArmR, mirrorCapR);

  bodyGroup.add(mirrorLeftGroup, mirrorRightGroup);

  // Side Air Scoops / Intakes
  const scoopGeo = new THREE.BoxGeometry(0.15, 0.35, 0.6);
  const scoopLeft = new THREE.Mesh(scoopGeo, carbonMaterial);
  scoopLeft.position.set(-0.96, 0.15, -0.4);
  scoopLeft.rotation.y = 0.15;
  const scoopRight = new THREE.Mesh(scoopGeo, carbonMaterial);
  scoopRight.position.set(0.96, 0.15, -0.4);
  scoopRight.rotation.y = -0.15;
  bodyGroup.add(scoopLeft, scoopRight);

  // --- 2. ROOF & CANOPY GLASS ---
  updateRoofGroup(roofGroup, config, bodyMaterial, glassMaterial, carbonMaterial);

  // --- 3. HOOD ---
  updateHoodGroup(hoodGroup, config, bodyMaterial, carbonMaterial);

  // --- 4. FRONT BUMPER ---
  updateFrontBumperGroup(frontBumperGroup, config, bodyMaterial, carbonMaterial, chromeMaterial);

  // --- 5. REAR BUMPER & DIFFUSER ---
  updateRearBumperGroup(rearBumperGroup, config, bodyMaterial, carbonMaterial, chromeMaterial);

  // --- 6. SPOILER / ACTIVE AERO WING ---
  updateSpoilerGroup(spoilerGroup, config, bodyMaterial, carbonMaterial);

  // --- 7. SIDE SKIRTS ---
  updateSideSkirtsGroup(sideSkirtsGroup, config, bodyMaterial, carbonMaterial);

  // --- 8. HEADLIGHTS & TAILLIGHTS ---
  const headlightLights: THREE.SpotLight[] = [];
  const taillightLights: THREE.PointLight[] = [];
  updateHeadlightsGroup(headlightsGroup, config, carbonMaterial, headlightLights, taillightLights);

  // --- 9. INTERIOR (COCKPIT & SEATS) ---
  updateInteriorGroup(interiorGroup, config, interiorMaterial, carbonMaterial, chromeMaterial);

  // --- 10. WHEELS, TIRES & BRAKES ---
  updateWheelsGroup(wheelsGroup, config, tireMaterial, wheelMaterial, discMaterial, caliperMaterial);

  // --- 11. UNDERGLOW LIGHT ---
  const underglowLight = new THREE.PointLight(
    new THREE.Color(config.underglowColor),
    config.underglowOn ? 6 : 0,
    6
  );
  underglowLight.position.set(0, -0.2, 0);
  rootGroup.add(underglowLight);

  return {
    rootGroup,
    bodyGroup,
    frontBumperGroup,
    rearBumperGroup,
    hoodGroup,
    roofGroup,
    spoilerGroup,
    sideSkirtsGroup,
    wheelsGroup,
    headlightsGroup,
    interiorGroup,
    underglowLight,
    headlightLights,
    taillightLights,

    bodyMaterial,
    glassMaterial,
    carbonMaterial,
    chromeMaterial,
    wheelMaterial,
    caliperMaterial,
    discMaterial,
    tireMaterial,
    interiorMaterial,
  };
}

export function createBodyMaterial(config: CarConfigState): THREE.MeshPhysicalMaterial {
  const color = new THREE.Color(config.paintColor);

  switch (config.paintType) {
    case 'matte':
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.2,
        roughness: 0.5,
        clearcoat: 0.1,
        clearcoatRoughness: 0.8,
        reflectivity: 0.2,
      });

    case 'metallic':
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.88,
        roughness: 0.15,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
        reflectivity: 0.9,
      });

    case 'pearl':
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.6,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        iridescence: 0.8,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
      });

    case 'chrome':
      return new THREE.MeshPhysicalMaterial({
        color: 0xeeeeee,
        metalness: 0.98,
        roughness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        reflectivity: 1.0,
      });

    case 'carbon':
      return new THREE.MeshPhysicalMaterial({
        color: 0x1f1f1f,
        metalness: 0.4,
        roughness: config.roughness ?? 0.25,
        clearcoat: config.clearcoat ?? 0.8,
        clearcoatRoughness: 0.1,
      });

    case 'frozen':
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.35,
        roughness: config.roughness ?? 0.45,
        clearcoat: config.clearcoat ?? 0.3,
        clearcoatRoughness: 0.6,
        reflectivity: 0.4,
      });

    case 'gloss':
    default:
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.5,
        roughness: config.roughness ?? 0.08,
        clearcoat: config.clearcoat ?? 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 0.8,
      });
  }
}

export function createWheelMaterial(finish: string): THREE.MeshStandardMaterial {
  switch (finish) {
    case 'black':
      return new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.85,
        roughness: 0.25,
      });
    case 'bronze':
      return new THREE.MeshStandardMaterial({
        color: 0xb87333,
        metalness: 0.9,
        roughness: 0.2,
      });
    case 'gold':
      return new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.92,
        roughness: 0.18,
      });
    case 'chrome':
      return new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        metalness: 0.98,
        roughness: 0.02,
      });
    case 'silver':
    default:
      return new THREE.MeshStandardMaterial({
        color: 0xd0d0d0,
        metalness: 0.9,
        roughness: 0.15,
      });
  }
}

// --- SUB-GROUP UPDATERS FOR MODULAR CUSTOMIZATION ---

export function updateRoofGroup(
  group: THREE.Group,
  config: CarConfigState,
  bodyMat: THREE.Material,
  glassMat: THREE.Material,
  carbonMat: THREE.Material
) {
  group.clear();

  const roofMat = config.roof === 'carbon' ? carbonMat : config.roof === 'panoramic' ? glassMat : bodyMat;

  // Canopy Roof Structure
  const canopyGeo = new THREE.BoxGeometry(1.35, 0.48, 1.85);
  const canopyMesh = new THREE.Mesh(canopyGeo, roofMat);
  canopyMesh.position.set(0, 0.68, -0.1);
  canopyMesh.castShadow = true;

  // Glass Windshield
  const windshieldGeo = new THREE.BoxGeometry(1.28, 0.04, 1.0);
  const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMat);
  windshieldMesh.position.set(0, 0.72, 0.7);
  windshieldMesh.rotation.x = -Math.PI / 6;

  // Rear Window
  const rearWinGeo = new THREE.BoxGeometry(1.2, 0.04, 0.85);
  const rearWinMesh = new THREE.Mesh(rearWinGeo, glassMat);
  rearWinMesh.position.set(0, 0.72, -0.9);
  rearWinMesh.rotation.x = Math.PI / 6;

  // Pillars (A-Pillars & B-Pillars)
  const pillarGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.6);
  const pillarL1 = new THREE.Mesh(pillarGeo, carbonMat);
  pillarL1.position.set(-0.64, 0.65, 0.7);
  pillarL1.rotation.z = -0.25;

  const pillarR1 = new THREE.Mesh(pillarGeo, carbonMat);
  pillarR1.position.set(0.64, 0.65, 0.7);
  pillarR1.rotation.z = 0.25;

  group.add(canopyMesh, windshieldMesh, rearWinMesh, pillarL1, pillarR1);
}

export function updateHoodGroup(
  group: THREE.Group,
  config: CarConfigState,
  bodyMat: THREE.Material,
  carbonMat: THREE.Material
) {
  group.clear();

  const hoodMat = config.hood === 'carbon' ? carbonMat : bodyMat;

  // Curved Hood Plate
  const hoodGeo = new THREE.BoxGeometry(1.3, 0.08, 1.4);
  const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
  hoodMesh.position.set(0, 0.42, 1.38);
  hoodMesh.rotation.x = 0.08;
  hoodMesh.castShadow = true;
  group.add(hoodMesh);

  // NACA Vents or Carbon Scoop Additions
  if (config.hood === 'naca') {
    const ventGeo = new THREE.BoxGeometry(0.35, 0.05, 0.45);
    const ventLeft = new THREE.Mesh(ventGeo, carbonMat);
    ventLeft.position.set(-0.3, 0.45, 1.35);
    ventLeft.rotation.x = 0.12;

    const ventRight = new THREE.Mesh(ventGeo, carbonMat);
    ventRight.position.set(0.3, 0.45, 1.35);
    ventRight.rotation.x = 0.12;

    group.add(ventLeft, ventRight);
  }
}

export function updateFrontBumperGroup(
  group: THREE.Group,
  config: CarConfigState,
  bodyMat: THREE.Material,
  carbonMat: THREE.Material,
  chromeMat: THREE.Material
) {
  group.clear();

  // Primary Bumper Core
  const bumperGeo = new THREE.BoxGeometry(1.85, 0.35, 0.45);
  const bumperMesh = new THREE.Mesh(bumperGeo, bodyMat);
  bumperMesh.position.set(0, 0.12, 2.22);
  bumperMesh.castShadow = true;
  group.add(bumperMesh);

  // Grille Mesh Intake
  const grilleGeo = new THREE.BoxGeometry(1.1, 0.18, 0.1);
  const grilleMesh = new THREE.Mesh(grilleGeo, carbonMat);
  grilleMesh.position.set(0, 0.1, 2.42);
  group.add(grilleMesh);

  // Style Variations
  if (config.frontBumper === 'gt') {
    // Carbon Front Splitter
    const splitterGeo = new THREE.BoxGeometry(1.98, 0.04, 0.45);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, -0.06, 2.35);
    group.add(splitter);
  } else if (config.frontBumper === 'cyber') {
    // Razor Sharp Angled Splitter with Orange Trim
    const splitterGeo = new THREE.BoxGeometry(2.05, 0.05, 0.5);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, -0.06, 2.38);

    const accentGeo = new THREE.BoxGeometry(2.06, 0.02, 0.04);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff5a1f, emissiveIntensity: 0.5 });
    const accent = new THREE.Mesh(accentGeo, accentMat);
    accent.position.set(0, -0.05, 2.62);

    group.add(splitter, accent);
  } else if (config.frontBumper === 'widebody') {
    // Flared Wide Splitter + Dual Dive Planes
    const splitterGeo = new THREE.BoxGeometry(2.15, 0.06, 0.55);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, -0.05, 2.4);

    const divePlaneL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.2), carbonMat);
    divePlaneL.position.set(-0.98, 0.2, 2.28);
    divePlaneL.rotation.z = -0.3;

    const divePlaneR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.2), carbonMat);
    divePlaneR.position.set(0.98, 0.2, 2.28);
    divePlaneR.rotation.z = 0.3;

    group.add(splitter, divePlaneL, divePlaneR);
  }
}

export function updateRearBumperGroup(
  group: THREE.Group,
  config: CarConfigState,
  bodyMat: THREE.Material,
  carbonMat: THREE.Material,
  chromeMat: THREE.Material
) {
  group.clear();

  // Rear Bumper Body
  const rearBodyGeo = new THREE.BoxGeometry(1.9, 0.4, 0.42);
  const rearBodyMesh = new THREE.Mesh(rearBodyGeo, bodyMat);
  rearBodyMesh.position.set(0, 0.18, -2.12);
  rearBodyMesh.castShadow = true;
  group.add(rearBodyMesh);

  // Carbon Diffuser Base
  const diffuserGeo = new THREE.BoxGeometry(1.82, 0.25, 0.45);
  const diffuserMesh = new THREE.Mesh(diffuserGeo, carbonMat);
  diffuserMesh.position.set(0, -0.02, -2.15);
  group.add(diffuserMesh);

  // Exhaust Tips
  const exhaustMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.95,
    roughness: 0.1,
  });

  if (config.rearBumper === 'f1') {
    // Quad Titanium Exhaust Tips
    [-0.25, -0.1, 0.1, 0.25].forEach((x) => {
      const tipGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16);
      const tip = new THREE.Mesh(tipGeo, exhaustMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(x, 0.05, -2.35);
      group.add(tip);
    });
  } else {
    // Dual Exhausts
    [-0.45, 0.45].forEach((x) => {
      const tipGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
      const tip = new THREE.Mesh(tipGeo, exhaustMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(x, 0.05, -2.32);
      group.add(tip);
    });
  }
}

export function updateSpoilerGroup(
  group: THREE.Group,
  config: CarConfigState,
  bodyMat: THREE.Material,
  carbonMat: THREE.Material
) {
  group.clear();

  if (config.spoiler === 'clean') return;

  if (config.spoiler === 'lip') {
    const lipGeo = new THREE.BoxGeometry(1.75, 0.06, 0.22);
    const lipMesh = new THREE.Mesh(lipGeo, carbonMat);
    lipMesh.position.set(0, 0.46, -2.1);
    lipMesh.rotation.x = 0.1;
    group.add(lipMesh);
  } else if (config.spoiler === 'gt3') {
    // GT3 Swan Neck Wing
    const wingGeo = new THREE.BoxGeometry(2.1, 0.05, 0.42);
    const wingMesh = new THREE.Mesh(wingGeo, carbonMat);
    wingMesh.position.set(0, 0.88, -2.05);
    wingMesh.castShadow = true;

    // Struts
    const strutGeo = new THREE.BoxGeometry(0.04, 0.35, 0.18);
    const strutL = new THREE.Mesh(strutGeo, carbonMat);
    strutL.position.set(-0.65, 0.72, -2.05);
    const strutR = new THREE.Mesh(strutGeo, carbonMat);
    strutR.position.set(0.65, 0.72, -2.05);

    group.add(wingMesh, strutL, strutR);
  } else if (config.spoiler === 'speedtail') {
    // Curved Hypercar Speedtail Wing
    const wingGeo = new THREE.BoxGeometry(2.25, 0.06, 0.48);
    const wingMesh = new THREE.Mesh(wingGeo, carbonMat);
    wingMesh.position.set(0, 0.96, -2.08);
    wingMesh.castShadow = true;

    const strutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45);
    const strutL = new THREE.Mesh(strutGeo, carbonMat);
    strutL.position.set(-0.75, 0.75, -2.08);
    const strutR = new THREE.Mesh(strutGeo, carbonMat);
    strutR.position.set(0.75, 0.75, -2.08);

    group.add(wingMesh, strutL, strutR);
  }
}

export function updateSideSkirtsGroup(
  group: THREE.Group,
  config: CarConfigState,
  bodyMat: THREE.Material,
  carbonMat: THREE.Material
) {
  group.clear();

  const skirtGeo = new THREE.BoxGeometry(0.12, 0.12, 2.6);
  const skirtMat = config.sideSkirts === 'widebody' ? carbonMat : bodyMat;

  const skirtL = new THREE.Mesh(skirtGeo, skirtMat);
  skirtL.position.set(-0.98, -0.02, 0);

  const skirtR = new THREE.Mesh(skirtGeo, skirtMat);
  skirtR.position.set(0.98, -0.02, 0);

  group.add(skirtL, skirtR);
}

export function updateHeadlightsGroup(
  group: THREE.Group,
  config: CarConfigState,
  carbonMat: THREE.Material,
  headlightLights: THREE.SpotLight[],
  taillightLights: THREE.PointLight[]
) {
  group.clear();
  headlightLights.length = 0;
  taillightLights.length = 0;

  // Front Headlight Assemblies
  const lightColor = config.headlightStyle === 'cyber' ? 0xff5a1f : 0xffffff;
  const lensMat = new THREE.MeshBasicMaterial({ color: lightColor });

  const headlightGeo = new THREE.BoxGeometry(0.38, 0.08, 0.12);

  const headL = new THREE.Mesh(headlightGeo, lensMat);
  headL.position.set(-0.62, 0.38, 2.22);

  const headR = new THREE.Mesh(headlightGeo, lensMat);
  headR.position.set(0.62, 0.38, 2.22);

  group.add(headL, headR);

  // Spotlights projecting beam
  const spotL = new THREE.SpotLight(lightColor, config.headlightsOn ? 12 : 0, 15, Math.PI / 6, 0.3);
  spotL.position.set(-0.62, 0.38, 2.25);
  spotL.target.position.set(-0.62, 0.2, 10);
  group.add(spotL);
  group.add(spotL.target);
  headlightLights.push(spotL);

  const spotR = new THREE.SpotLight(lightColor, config.headlightsOn ? 12 : 0, 15, Math.PI / 6, 0.3);
  spotR.position.set(0.62, 0.38, 2.25);
  spotR.target.position.set(0.62, 0.2, 10);
  group.add(spotR);
  group.add(spotR.target);
  headlightLights.push(spotR);

  // Rear Continuous Lightbar
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
  const lightbarGeo = new THREE.BoxGeometry(1.78, 0.06, 0.06);
  const lightbar = new THREE.Mesh(lightbarGeo, tailMat);
  lightbar.position.set(0, 0.42, -2.14);
  group.add(lightbar);

  const tailPoint = new THREE.PointLight(0xff0022, 3, 5);
  tailPoint.position.set(0, 0.42, -2.2);
  group.add(tailPoint);
  taillightLights.push(tailPoint);
}

export function updateInteriorGroup(
  group: THREE.Group,
  config: CarConfigState,
  interiorMat: THREE.Material,
  carbonMat: THREE.Material,
  chromeMat: THREE.Material
) {
  group.clear();

  // Bucket Seats (Driver & Passenger)
  const seatBackGeo = new THREE.BoxGeometry(0.42, 0.65, 0.12);
  const seatBottomGeo = new THREE.BoxGeometry(0.42, 0.12, 0.48);

  // Driver Seat
  const driverSeat = new THREE.Group();
  const dBack = new THREE.Mesh(seatBackGeo, interiorMat);
  dBack.position.set(-0.35, 0.52, -0.2);
  dBack.rotation.x = -0.15;

  const dBottom = new THREE.Mesh(seatBottomGeo, interiorMat);
  dBottom.position.set(-0.35, 0.25, 0.0);

  driverSeat.add(dBack, dBottom);

  // Passenger Seat
  const passengerSeat = new THREE.Group();
  const pBack = new THREE.Mesh(seatBackGeo, interiorMat);
  pBack.position.set(0.35, 0.52, -0.2);
  pBack.rotation.x = -0.15;

  const pBottom = new THREE.Mesh(seatBottomGeo, interiorMat);
  pBottom.position.set(0.35, 0.25, 0.0);

  passengerSeat.add(pBack, pBottom);

  // Headrests
  const headrestGeo = new THREE.BoxGeometry(0.24, 0.2, 0.1);
  const dHead = new THREE.Mesh(headrestGeo, interiorMat);
  dHead.position.set(-0.35, 0.9, -0.25);
  driverSeat.add(dHead);

  const pHead = new THREE.Mesh(headrestGeo, interiorMat);
  pHead.position.set(0.35, 0.9, -0.25);
  passengerSeat.add(pHead);

  // Steering Wheel
  const wheelRimGeo = new THREE.TorusGeometry(0.14, 0.02, 12, 32);
  const wheelRim = new THREE.Mesh(wheelRimGeo, carbonMat);
  wheelRim.position.set(-0.35, 0.58, 0.32);
  wheelRim.rotation.x = 0.2;

  // Horizontal Dashboard Trim Bar (reflects trimMaterial: Aluminum, Bronze, Carbon)
  const dashTrimGeo = new THREE.BoxGeometry(1.28, 0.04, 0.1);
  const dashTrim = new THREE.Mesh(dashTrimGeo, chromeMat);
  dashTrim.position.set(0, 0.54, 0.34);

  // Central Transmission Tunnel / Console Trim
  const consoleTrimGeo = new THREE.BoxGeometry(0.18, 0.1, 0.75);
  const consoleTrim = new THREE.Mesh(consoleTrimGeo, chromeMat);
  consoleTrim.position.set(0, 0.26, 0.0);

  group.add(driverSeat, passengerSeat, wheelRim, dashTrim, consoleTrim);
}

export function updateWheelsGroup(
  group: THREE.Group,
  config: CarConfigState,
  tireMat: THREE.Material,
  wheelMat: THREE.Material,
  discMat: THREE.Material,
  caliperMat: THREE.Material
) {
  group.clear();

  const wheelPositions = [
    [-0.98, 0.0, 1.35], // Front Left
    [0.98, 0.0, 1.35], // Front Right
    [-1.0, 0.0, -1.35], // Rear Left
    [1.0, 0.0, -1.35], // Rear Right
  ];

  wheelPositions.forEach(([x, y, z], idx) => {
    const wheelAssembly = new THREE.Group();
    wheelAssembly.position.set(x, y, z);
    const isRight = x > 0;

    // 1. Tire Rubber Ring
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 32);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, tireMat);
    tireMesh.castShadow = true;
    wheelAssembly.add(tireMesh);

    // 2. Rim Face & Spokes
    const rimFaceGroup = buildRimFace(config.wheelStyle, wheelMat, isRight);
    wheelAssembly.add(rimFaceGroup);

    // 3. Brake Disc Rotor
    const discGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.03, 32);
    discGeo.rotateZ(Math.PI / 2);
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.x = isRight ? -0.05 : 0.05;
    wheelAssembly.add(discMesh);

    // 4. Brake Caliper Block
    const caliperGeo = new THREE.BoxGeometry(0.08, 0.16, 0.2);
    const caliperMesh = new THREE.Mesh(caliperGeo, caliperMat);
    caliperMesh.position.set(isRight ? -0.05 : 0.05, 0.12, 0);
    wheelAssembly.add(caliperMesh);

    group.add(wheelAssembly);
  });
}

function buildRimFace(style: string, wheelMat: THREE.Material, isRight: boolean): THREE.Group {
  const rimGroup = new THREE.Group();

  if (style === 'turbofan') {
    // Aerodisc Flat Turbo Cover
    const discGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.04, 32);
    discGeo.rotateZ(Math.PI / 2);
    const discMesh = new THREE.Mesh(discGeo, wheelMat);
    discMesh.position.x = isRight ? 0.08 : -0.08;
    rimGroup.add(discMesh);
  } else if (style === 'concave') {
    // Deep Dish 5-Spoke
    const spokeCount = 5;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i * Math.PI * 2) / spokeCount;
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.28, 0.04);
      const spoke = new THREE.Mesh(spokeGeo, wheelMat);
      spoke.position.set(isRight ? 0.08 : -0.08, Math.sin(angle) * 0.14, Math.cos(angle) * 0.14);
      spoke.rotation.x = angle;
      rimGroup.add(spoke);
    }
  } else {
    // Standard 10-Spoke / Diamond Cut
    const spokeCount = 10;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i * Math.PI * 2) / spokeCount;
      const spokeGeo = new THREE.BoxGeometry(0.03, 0.3, 0.03);
      const spoke = new THREE.Mesh(spokeGeo, wheelMat);
      spoke.position.set(isRight ? 0.1 : -0.1, Math.sin(angle) * 0.15, Math.cos(angle) * 0.15);
      spoke.rotation.x = angle;
      rimGroup.add(spoke);
    }
  }

  return rimGroup;
}
