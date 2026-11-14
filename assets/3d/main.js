/**
 * AquaPave 3D Interactive Scrollytelling Explorer — Main Orchestrator
 * Bootstraps the WebGL Scene, procedural layers, particle simulation,
 * pin projector, and GSAP ScrollTrigger timeline.
 */

import * as THREE from 'three';
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

export function init3DExplorer() {
  const canvasContainer = document.getElementById('canvas-container');
  if (!canvasContainer) {
    console.error('3D Explorer Error: #canvas-container element not found.');
    return;
  }

  // 1. WebGL Support Verification
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl && !window.WebGLRenderingContext) {
      canvasContainer.innerHTML = `
        <div class="webgl-fallback" style="padding: 40px; color: #8FA6B8; font-family: monospace;">
          <p>WebGL is not enabled in your current browser.</p>
        </div>
      `;
      return;
    }
  } catch (e) {}

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
      btnToggleOrbit.textContent = nowActive ? 'Lock Scroll Timeline' : 'Free 360° Orbit';
    });
  }

  const btnToggleFlow = document.getElementById('toggle-flow');
  if (btnToggleFlow) {
    btnToggleFlow.addEventListener('click', () => {
      const nowActive = !particleSystem.isActive();
      particleSystem.setActive(nowActive);
      btnToggleFlow.classList.toggle('is-active', nowActive);
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
  }

  animate();

  // Trigger initial state (Section 0)
  scrollytelling.activateSection(0);
}

// Auto-boot if loaded directly in browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DExplorer);
  } else {
    init3DExplorer();
  }
}

