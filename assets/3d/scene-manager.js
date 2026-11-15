/**
 * AquaPave Three.js Scene Manager
 * Sets up the WebGL environment, lighting, floor grid, camera, and render loop.
 * Configured specifically for zero scroll-hijacking inside Google Sites iframes.
 */

import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

export function createSceneManager(containerEl) {
  const width = containerEl.clientWidth || window.innerWidth * 0.6;
  const height = containerEl.clientHeight || window.innerHeight;

  // 1. Scene
  const scene = new THREE.Scene();
  // Deep navy blueprint environment fog
  scene.fog = new THREE.FogExp2('#071321', 0.035);

  // 2. Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(7.5, 5.5, 9.5); // Default axonometric view
  camera.lookAt(0, 0, 0);

  // 3. Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  // Cap pixel ratio to 2 to prevent GPU memory crashes on Retina screens
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  containerEl.appendChild(renderer.domElement);

  // 4. Lighting Rig
  // Ambient fill
  const ambientLight = new THREE.AmbientLight('#B0C4DE', 0.85);
  scene.add(ambientLight);

  // Primary Sun / Key Light
  const keyLight = new THREE.DirectionalLight('#FFFFFF', 1.8);
  keyLight.position.set(10, 14, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -6;
  keyLight.shadow.camera.right = 6;
  keyLight.shadow.camera.top = 6;
  keyLight.shadow.camera.bottom = -6;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  // Environmental Rim Light (AquaPave Teal)
  const rimLight = new THREE.DirectionalLight('#28A7AC', 1.4);
  rimLight.position.set(-8, 6, -8);
  scene.add(rimLight);

  // Fill Light (Warm ground bounce)
  const fillLight = new THREE.DirectionalLight('#60A5FA', 0.6);
  fillLight.position.set(0, -6, 5);
  scene.add(fillLight);

  // 5. Subtle 3D CAD Floor Grid
  const gridHelper = new THREE.GridHelper(16, 24, '#0D7377', '#1E3A5F');
  gridHelper.position.y = -3.2;
  // Make grid lines semi-transparent
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.35;
  scene.add(gridHelper);

  // 6. OrbitControls (Strictly customized for Google Sites Iframe Compatibility)
  let controls = null;
  try {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    // CRITICAL: Disable wheel zoom so scrolling over the 3D model drives the page narrative
    controls.enableZoom = false;
    controls.enableRotate = false; // Disabled by default; enabled in Free 360° mode
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2 + 0.15; // Prevent camera going underground
  } catch (err) {
    console.warn('OrbitControls initialization fallback:', err);
  }

  let freeOrbitMode = false;

  function setFreeOrbit(enable) {
    freeOrbitMode = enable;
    if (controls) {
      controls.enableRotate = enable;
      controls.enableZoom = enable; // Only enable zoom in explicit free orbit mode
    }
    if (enable) {
      containerEl.classList.add('free-orbit-active');
    } else {
      containerEl.classList.remove('free-orbit-active');
    }
  }

  // 7. Resize Observer
  const resizeObserver = new ResizeObserver(() => {
    const newW = containerEl.clientWidth;
    const newH = containerEl.clientHeight;
    if (newW > 0 && newH > 0) {
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    }
  });
  resizeObserver.observe(containerEl);

  return {
    scene,
    camera,
    renderer,
    controls,
    setFreeOrbit,
    isFreeOrbit: () => freeOrbitMode,
    dispose: () => {
      resizeObserver.disconnect();
      renderer.dispose();
    }
  };
}

