import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CurrentBuildState, CustomizationConfig } from '../types';

interface ThreeCarCanvasProps {
  currentBuild?: CurrentBuildState;
  config?: CustomizationConfig;
  lightingPreset?: 'studio' | 'cyberpunk' | 'golden' | 'showroom';
  showWireframe?: boolean;
  isAutoRotating?: boolean;
  activeAnglePreset?: 'front34' | 'side' | 'rear34' | 'top' | 'grille';
  onRotationChange?: (angle: number) => void;
}

export const ThreeCarCanvas: React.FC<ThreeCarCanvasProps> = ({
  currentBuild,
  config,
  lightingPreset = 'studio',
  showWireframe = false,
  isAutoRotating = false,
  activeAnglePreset = 'front34',
  onRotationChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{
    bodyPaint?: THREE.MeshPhysicalMaterial;
    rims?: THREE.MeshStandardMaterial;
    glass?: THREE.MeshPhysicalMaterial;
    headlights?: THREE.MeshStandardMaterial;
    taillights?: THREE.MeshStandardMaterial;
    spoilerGroup?: THREE.Group;
    bodyGroup?: THREE.Group;
  }>({});

  // Orbit & Interaction State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraOrbitRef = useRef({
    radius: 7.2,
    theta: Math.PI / 4, // Azimuthal angle
    phi: Math.PI / 2.6, // Polar angle (clamped above ground)
    target: new THREE.Vector3(0, 0.4, 0),
  });

  // Determine current paint color and finish
  const paintColorHex =
    currentBuild?.paintDetails?.hex ||
    config?.paint?.hex ||
    '#0A0A0B';

  const paintFinish =
    currentBuild?.paintDetails?.finish ||
    config?.paint?.finish ||
    'Metallic';

  const wheelsFinish =
    currentBuild?.wheelsDetails?.finish ||
    'Gloss Black';

  const rideHeight =
    currentBuild?.rideHeight ||
    config?.suspensionLowering ||
    'Stock Height';

  const hasSpoiler =
    Boolean(
      currentBuild?.spoiler ||
      currentBuild?.bodyKit?.toLowerCase().includes('widebody') ||
      currentBuild?.style?.toLowerCase().includes('track') ||
      currentBuild?.style?.toLowerCase().includes('sport') ||
      config?.aesthetic?.name?.toLowerCase().includes('sport') ||
      config?.aesthetic?.name?.toLowerCase().includes('stealth')
    );

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    cameraRef.current = camera;

    // 3. Renderer with high-end physically based shading
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Build 3D Vehicle Geometry & Materials
    const carGroup = new THREE.Group();
    carGroupRef.current = carGroup;
    scene.add(carGroup);

    // Materials
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(paintColorHex),
      metalness: paintFinish === 'Matte' ? 0.2 : 0.85,
      roughness: paintFinish === 'Matte' ? 0.75 : paintFinish === 'Satin' ? 0.4 : 0.18,
      clearcoat: paintFinish === 'Matte' ? 0.05 : 0.95,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    materialsRef.current.bodyPaint = bodyPaintMat;

    const carbonTrimMat = new THREE.MeshStandardMaterial({
      color: 0x111215,
      roughness: 0.45,
      metalness: 0.6,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x05070a,
      transparent: true,
      opacity: 0.85,
      roughness: 0.05,
      metalness: 0.2,
      transmission: 0.6,
      ior: 1.5,
    });
    materialsRef.current.glass = glassMat;

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1c,
      roughness: 0.9,
      metalness: 0.1,
    });

    const getRimColor = () => {
      const finishLower = wheelsFinish.toLowerCase();
      if (finishLower.includes('bronze') || finishLower.includes('gold')) return 0xc29b38;
      if (finishLower.includes('silver') || finishLower.includes('chrome')) return 0xd4d8de;
      if (finishLower.includes('gunmetal')) return 0x4a4d52;
      return 0x18191c; // Gloss Black
    };

    const rimMat = new THREE.MeshStandardMaterial({
      color: getRimColor(),
      roughness: 0.25,
      metalness: 0.9,
    });
    materialsRef.current.rims = rimMat;

    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0xd92626, // Racing Red Caliper
      roughness: 0.3,
      metalness: 0.6,
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    materialsRef.current.headlights = headlightMat;

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    materialsRef.current.taillights = taillightMat;

    // --- CAR CHASSIS GEOMETRY ---
    const bodyGroup = new THREE.Group();
    materialsRef.current.bodyGroup = bodyGroup;

    // Lower Main Body (aerodynamic wedge sports coupe)
    const lowerBodyGeo = new THREE.BoxGeometry(1.82, 0.42, 3.8);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyPaintMat);
    lowerBody.position.y = 0.42;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    bodyGroup.add(lowerBody);

    // Front Hood Slope
    const hoodGeo = new THREE.BoxGeometry(1.78, 0.26, 1.2);
    const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
    hood.position.set(0, 0.48, 1.3);
    hood.rotation.x = 0.08;
    hood.castShadow = true;
    bodyGroup.add(hood);

    // Aerodynamic Cabin / Greenhouse
    const cabinGeo = new THREE.BoxGeometry(1.5, 0.46, 1.9);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.74, -0.15);
    cabin.castShadow = true;
    bodyGroup.add(cabin);

    // Roof Cap (Body Painted)
    const roofGeo = new THREE.BoxGeometry(1.44, 0.08, 1.55);
    const roof = new THREE.Mesh(roofGeo, bodyPaintMat);
    roof.position.set(0, 0.98, -0.18);
    roof.castShadow = true;
    bodyGroup.add(roof);

    // Front Grille & Air Intakes
    const grilleGeo = new THREE.BoxGeometry(1.3, 0.22, 0.1);
    const grilleMesh = new THREE.Mesh(grilleGeo, carbonTrimMat);
    grilleMesh.position.set(0, 0.38, 1.91);
    bodyGroup.add(grilleMesh);

    // Front Lower Splitter
    const splitterGeo = new THREE.BoxGeometry(1.88, 0.06, 0.35);
    const splitterMesh = new THREE.Mesh(splitterGeo, carbonTrimMat);
    splitterMesh.position.set(0, 0.22, 1.88);
    splitterMesh.castShadow = true;
    bodyGroup.add(splitterMesh);

    // Side Aero Skirts
    const leftSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 2.2), carbonTrimMat);
    leftSkirt.position.set(0.94, 0.23, 0);
    const rightSkirt = leftSkirt.clone();
    rightSkirt.position.set(-0.94, 0.23, 0);
    bodyGroup.add(leftSkirt, rightSkirt);

    // Rear Diffuser & Exhaust Tips
    const diffuserGeo = new THREE.BoxGeometry(1.84, 0.16, 0.3);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonTrimMat);
    diffuser.position.set(0, 0.26, -1.9);
    bodyGroup.add(diffuser);

    const exhaustGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
    const leftExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    leftExhaust.rotation.x = Math.PI / 2;
    leftExhaust.position.set(0.5, 0.26, -2.02);
    const rightExhaust = leftExhaust.clone();
    rightExhaust.position.set(-0.5, 0.26, -2.02);
    bodyGroup.add(leftExhaust, rightExhaust);

    // LED Headlight Strips (Dual sharp projectors)
    const hlGeo = new THREE.BoxGeometry(0.38, 0.08, 0.15);
    const leftHeadlight = new THREE.Mesh(hlGeo, headlightMat);
    leftHeadlight.position.set(0.62, 0.49, 1.85);
    leftHeadlight.rotation.y = -0.15;
    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.position.set(-0.62, 0.49, 1.85);
    rightHeadlight.rotation.y = 0.15;
    bodyGroup.add(leftHeadlight, rightHeadlight);

    // LED Taillight Bar
    const tlGeo = new THREE.BoxGeometry(1.68, 0.07, 0.08);
    const taillightBar = new THREE.Mesh(tlGeo, taillightMat);
    taillightBar.position.set(0, 0.52, -1.91);
    bodyGroup.add(taillightBar);

    // Rear GT Wing / Spoiler (Toggleable)
    const spoilerGroup = new THREE.Group();
    materialsRef.current.spoilerGroup = spoilerGroup;
    const wingBladeGeo = new THREE.BoxGeometry(1.72, 0.04, 0.32);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonTrimMat);
    wingBlade.position.set(0, 0.92, -1.78);
    wingBlade.castShadow = true;

    const leftStalk = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.08), carbonTrimMat);
    leftStalk.position.set(0.48, 0.74, -1.78);
    const rightStalk = leftStalk.clone();
    rightStalk.position.set(-0.48, 0.74, -1.78);

    spoilerGroup.add(wingBlade, leftStalk, rightStalk);
    spoilerGroup.visible = hasSpoiler;
    bodyGroup.add(spoilerGroup);

    carGroup.add(bodyGroup);

    // --- 4 WHEELS (TIRES + MULTI-SPOKE RIMS + BRAKE CALIPERS) ---
    const createWheel = () => {
      const wheelGroup = new THREE.Group();

      // Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 28);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Outer Rim Ring
      const rimGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.29, 24);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // Multi-Spokes (5-twin spoke sports pattern)
      for (let i = 0; i < 5; i++) {
        const spokeGeo = new THREE.BoxGeometry(0.04, 0.28, 0.04);
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.rotation.x = (i * Math.PI * 2) / 5;
        wheelGroup.add(spoke);
      }

      // Brake Rotor & Red Caliper
      const rotorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16);
      const rotorMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.3 });
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.rotation.z = Math.PI / 2;
      rotor.position.x = -0.05;
      wheelGroup.add(rotor);

      const caliperGeo = new THREE.BoxGeometry(0.06, 0.12, 0.08);
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(-0.06, 0.12, 0);
      wheelGroup.add(caliper);

      return wheelGroup;
    };

    const wheelPositions = [
      { x: 0.96, y: 0.38, z: 1.15 }, // Front Right
      { x: -0.96, y: 0.38, z: 1.15, flip: true }, // Front Left
      { x: 0.96, y: 0.38, z: -1.18 }, // Rear Right
      { x: -0.96, y: 0.38, z: -1.18, flip: true }, // Rear Left
    ];

    wheelPositions.forEach((pos) => {
      const wheel = createWheel();
      wheel.position.set(pos.x, pos.y, pos.z);
      if (pos.flip) {
        wheel.rotation.y = Math.PI;
      }
      carGroup.add(wheel);
    });

    // 5. Studio Stage Floor & Contact Shadow
    const floorGeo = new THREE.CircleGeometry(6.5, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e15,
      roughness: 0.6,
      metalness: 0.4,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Circular Neon Stage Perimeter Ring
    const ringGeo = new THREE.RingGeometry(5.2, 5.28, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    // 6. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainKeyLight.position.set(5, 8, 5);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    mainKeyLight.shadow.bias = -0.0001;
    scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.4);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x93c5fd, 0.8, 15);
    fillLight.position.set(0, 3, 3);
    scene.add(fillLight);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-turntable rotation
      if (isAutoRotating && !isDraggingRef.current) {
        cameraOrbitRef.current.theta += 0.008;
        if (onRotationChange) {
          const deg = THREE.MathUtils.radToDeg(cameraOrbitRef.current.theta) % 360;
          onRotationChange(deg < 0 ? deg + 360 : deg);
        }
      }

      // Compute camera spherical position
      const { radius, theta, phi, target } = cameraOrbitRef.current;
      const sinPhiRadius = Math.sin(phi) * radius;
      camera.position.x = target.x + sinPhiRadius * Math.sin(theta);
      camera.position.y = target.y + Math.cos(phi) * radius;
      camera.position.z = target.z + sinPhiRadius * Math.cos(theta);
      camera.lookAt(target);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer for dynamic canvas sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Dynamic Paint Material
  useEffect(() => {
    if (!materialsRef.current.bodyPaint) return;
    materialsRef.current.bodyPaint.color.set(paintColorHex);
    materialsRef.current.bodyPaint.metalness = paintFinish === 'Matte' ? 0.15 : 0.85;
    materialsRef.current.bodyPaint.roughness = paintFinish === 'Matte' ? 0.75 : paintFinish === 'Satin' ? 0.4 : 0.18;
    materialsRef.current.bodyPaint.wireframe = showWireframe;
    materialsRef.current.bodyPaint.needsUpdate = true;
  }, [paintColorHex, paintFinish, showWireframe]);

  // Update Wheel Rims Finish
  useEffect(() => {
    if (!materialsRef.current.rims) return;
    const finishLower = wheelsFinish.toLowerCase();
    let col = 0x18191c;
    if (finishLower.includes('bronze') || finishLower.includes('gold')) col = 0xc29b38;
    else if (finishLower.includes('silver') || finishLower.includes('chrome')) col = 0xd4d8de;
    else if (finishLower.includes('gunmetal')) col = 0x4a4d52;

    materialsRef.current.rims.color.setHex(col);
    materialsRef.current.rims.wireframe = showWireframe;
    materialsRef.current.rims.needsUpdate = true;
  }, [wheelsFinish, showWireframe]);

  // Update Spoiler Visibility & Suspension Height
  useEffect(() => {
    if (materialsRef.current.spoilerGroup) {
      materialsRef.current.spoilerGroup.visible = hasSpoiler;
    }
    if (materialsRef.current.bodyGroup) {
      const lowerLower = rideHeight.toLowerCase();
      let yOffset = 0;
      if (lowerLower.includes('lower') || lowerLower.includes('-30') || lowerLower.includes('-25')) {
        yOffset = -0.07;
      } else if (lowerLower.includes('lift') || lowerLower.includes('trail') || lowerLower.includes('+50')) {
        yOffset = 0.1;
      }
      materialsRef.current.bodyGroup.position.y = yOffset;
    }
  }, [hasSpoiler, rideHeight]);

  // Update Angle Presets
  useEffect(() => {
    const orbit = cameraOrbitRef.current;
    switch (activeAnglePreset) {
      case 'front34':
        orbit.theta = Math.PI / 4;
        orbit.phi = Math.PI / 2.7;
        orbit.radius = 7.2;
        break;
      case 'side':
        orbit.theta = Math.PI / 2;
        orbit.phi = Math.PI / 2.5;
        orbit.radius = 6.8;
        break;
      case 'rear34':
        orbit.theta = (Math.PI * 5) / 6;
        orbit.phi = Math.PI / 2.7;
        orbit.radius = 7.2;
        break;
      case 'top':
        orbit.theta = Math.PI / 4;
        orbit.phi = Math.PI / 6;
        orbit.radius = 8.5;
        break;
      case 'grille':
        orbit.theta = 0.05;
        orbit.phi = Math.PI / 2.4;
        orbit.radius = 4.6;
        break;
    }
  }, [activeAnglePreset]);

  // Pointer & Touch Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    const orbit = cameraOrbitRef.current;
    orbit.theta -= deltaX * 0.007;
    orbit.phi = Math.max(0.2, Math.min(Math.PI / 2.15, orbit.phi - deltaY * 0.007));

    if (onRotationChange) {
      const deg = THREE.MathUtils.radToDeg(orbit.theta) % 360;
      onRotationChange(deg < 0 ? deg + 360 : deg);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const orbit = cameraOrbitRef.current;
    orbit.radius = Math.max(3.8, Math.min(12.0, orbit.radius + e.deltaY * 0.005));
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none relative overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  );
};
