/**
 * AquaPave 3D Interactive Scrollytelling Explorer — Main Orchestrator
 * Bootstraps the WebGL Scene, procedural layers, particle simulation,
 * pin projector, and GSAP ScrollTrigger timeline.
 */

import * as THREE from './vendor/three.module.js';
import { createSceneManager } from './scene-manager.js';
import { createLayer1 } from './layers/layer1-slab.js';
import { createLayer2 } from './layers/layer2-geotextile.js';
import { createLayer3 } from './layers/layer3-sand.js';
import { createLayer4 } from './layers/layer4-charcoal.js';
import { createLayer5 } from './layers/layer5-pumice.js';
import { createLayer6 } from './layers/layer6-underdrain.js';
import { createLayer7 } from './layers/layer7-separator.js';
import { createContainmentCase } from './layers/containment-case.js';
import { createParticleFlowSystem } from './particles.js';
import { createPinProjector } from './pin-projector.js';
import { createScrollytellingController } from './scrollytelling.js';

function setViewportStatus(title, detail, isError = false) {
  const status = document.getElementById('viewport-status');
  if (!status) return;
  status.hidden = false;
  status.classList.toggle('is-error', isError);
  const titleEl = status.querySelector('strong');
  const detailEl = status.querySelector('span');
  if (titleEl) titleEl.textContent = title;
  if (detailEl) detailEl.textContent = detail;
}

function hideViewportStatus() {
  const status = document.getElementById('viewport-status');
  if (status) status.hidden = true;
}

export function init3DExplorer() {
  const canvasContainer = document.getElementById('canvas-container');
  if (!canvasContainer) {
    console.error('3D Explorer Error: #canvas-container element not found.');
    return;
  }

  try {
    start3DExplorer(canvasContainer);
  } catch (error) {
    console.error('3D Explorer Error:', error);
    setViewportStatus(
      '3D model could not start',
      'WebGL may be unavailable or blocked. Enable hardware acceleration and reload the page.',
      true
    );
  }
}

function start3DExplorer(canvasContainer) {
  // 1. WebGL Support Verification
  const testCanvas = document.createElement('canvas');
  const gl = testCanvas.getContext('webgl2') ||
    testCanvas.getContext('webgl') ||
    testCanvas.getContext('experimental-webgl');
  if (!gl) {
    setViewportStatus(
      '3D model unavailable',
      'This browser could not create a WebGL context. Enable hardware acceleration and reload the page.',
      true
    );
    return;
  }

  // 2. Initialize Three.js Scene, Camera, Lights, and Renderer
  const sceneManager = createSceneManager(canvasContainer);
  const { scene, camera, renderer, controls } = sceneManager;

  // Master group containing all prototype components
  const prototypeGroup = new THREE.Group();
  prototypeGroup.name = 'AquaPave_Assembly';
  scene.add(prototypeGroup);

  // 3. Construct Procedural Layers (Layers 1 to 7)
  const layer1 = createLayer1();
  const layer2 = createLayer2();
  const layer3 = createLayer3();
  const layer4 = createLayer4();
  const layer5 = createLayer5();
  const layer6 = createLayer6();
  const layer7 = createLayer7();

  const layers = [layer1, layer2, layer3, layer4, layer5, layer6, layer7];
  layers.forEach(layer => prototypeGroup.add(layer.group));

  // 4. Construct Acrylic Containment Casing
  const containmentCase = createContainmentCase();
  prototypeGroup.add(containmentCase.group);

  // 5. Construct 150-Droplet Gravity Flow Particle System
  const particleSystem = createParticleFlowSystem(150);
  prototypeGroup.add(particleSystem.mesh);
  particleSystem.setActive(false); // only runs on demand or in Section 8

  // 6. Initialize 3D-to-2D Callout Pin Projector
  const pinProjector = createPinProjector(canvasContainer, camera);

  // Bidirectional interaction: clicking a pin highlights narrative card item
  pinProjector.onPinSelect((pinId) => {
    const activeSection = document.querySelector('.narrative-section.is-active');
    if (activeSection) {
      const pinItem = activeSection.querySelector(`.spec-pin-item[data-pin="${pinId}"]`);
      if (pinItem) {
        document.querySelectorAll('.spec-pin-item').forEach(el => el.classList.remove('is-highlighted'));
        pinItem.classList.add('is-highlighted');
        pinItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });

  // Clicking a spec item on the left card highlights the 3D pin
  document.addEventListener('click', (e) => {
    const pinItem = e.target.closest('.spec-pin-item');
    if (pinItem) {
      const pinId = parseInt(pinItem.dataset.pin, 10);
      document.querySelectorAll('.spec-pin-item').forEach(el => el.classList.remove('is-highlighted'));
      pinItem.classList.add('is-highlighted');
      pinProjector.highlightPin(pinId);
    }
  });

  // 7. Initialize GSAP ScrollTrigger Scrollytelling Engine
  const scrollytelling = createScrollytellingController({
    camera,
    controls,
    layers,
    containmentCase,
    pinProjector,
    particleSystem
  });

  // 8. Bind Floating Controls Bar
  const btnToggleOrbit = document.getElementById('toggle-orbit');
  if (btnToggleOrbit) {
    btnToggleOrbit.addEventListener('click', () => {
      const nowActive = !sceneManager.isFreeOrbit();
      sceneManager.setFreeOrbit(nowActive);
      btnToggleOrbit.classList.toggle('is-active', nowActive);
      btnToggleOrbit.setAttribute('aria-pressed', nowActive ? 'true' : 'false');
      const label = nowActive ? 'Lock Timeline' : '360° Orbit';
      btnToggleOrbit.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg><span>${label}</span>`;
    });
  }

  const btnToggleFlow = document.getElementById('toggle-flow');
  if (btnToggleFlow) {
    btnToggleFlow.addEventListener('click', () => {
      const nowActive = !particleSystem.isActive();
      particleSystem.setActive(nowActive);
      btnToggleFlow.classList.toggle('is-active', nowActive);
      btnToggleFlow.setAttribute('aria-pressed', nowActive ? 'true' : 'false');
      const label = nowActive ? 'Stop Flow' : 'Simulate Flow';
      btnToggleFlow.innerHTML = `<span class="ctrl-indicator" aria-hidden="true"></span><span>${label}</span>`;
    });
  }

  // Quick Jump Layer Selector Pills
  document.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSec = parseInt(btn.dataset.jump, 10);
      scrollytelling.jumpToSection(targetSec);
    });
  });

  // 9. Main Animation & Render Loop
  const clock = new THREE.Clock();
  let firstFrame = true;

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Update particle simulation
    particleSystem.update(delta);

    // Update OrbitControls if enabled
    if (controls && sceneManager.isFreeOrbit()) {
      controls.update();
    }

    // Update 3D-to-2D pin coordinates
    pinProjector.update();

    renderer.render(scene, camera);

    if (firstFrame) {
      firstFrame = false;
      hideViewportStatus();
    }
  }

  // Immediate first frame render
  renderer.render(scene, camera);
  hideViewportStatus();

  animate();

  // Trigger initial state (Section 0)
  scrollytelling.activateSection(0);
}

// Auto-boot if loaded directly in browser
if (typeof document !== 'undefined') {
  if (document.getElementById('canvas-container')) {
    init3DExplorer();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DExplorer);
  } else {
    init3DExplorer();
  }
}

