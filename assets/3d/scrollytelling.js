/**
 * AquaPave GSAP ScrollTrigger Scrollytelling Engine
 * Coordinates camera motions, vertical layer explosion, layer isolation/dimming,
 * and 3D pin registration across the 8 scroll sections.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

export function createScrollytellingController({
  camera,
  controls,
  layers,
  containmentCase,
  pinProjector,
  particleSystem
}) {
  // 1. Calculate Assembled vs Exploded Y Offsets
  // Layers are ordered from Top (Layer 1) to Bottom (Layer 7)
  const assembledY = [];
  const explodedY = [];

  // Compute tight assembled stack Y positions
  // Total stack height: sum of layer heights
  let currentY = 1.6;
  layers.forEach((layer, idx) => {
    assembledY[idx] = currentY;
    currentY -= layer.layerHeight;
  });

  // Exploded Y positions (vertical axonometric spacing)
  const explosionGap = 1.15;
  layers.forEach((layer, idx) => {
    explodedY[idx] = (3 - idx) * explosionGap;
  });

  // Camera preset positions
  const defaultCamPos = new THREE.Vector3(7.5, 5.0, 9.5);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  // Target values to animate towards
  const currentCamPos = defaultCamPos.clone();
  const currentCamTarget = defaultTarget.clone();

  let activeSectionIndex = 0;

  // Initialize all layers to assembled position
  layers.forEach((layer, idx) => {
    layer.group.position.y = assembledY[idx];
    layer.group.scale.set(1, 1, 1);
  });

  // 2. Setup ScrollTriggers for each section
  const sections = document.querySelectorAll('.narrative-section');
  const stageCounter = document.getElementById('stage-indicator');

  sections.forEach((sectionEl, sectionIndex) => {
    ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => activateSection(sectionIndex),
      onEnterBack: () => activateSection(sectionIndex)
    });
  });

  function activateSection(index) {
    activeSectionIndex = index;

    // Update Top-Bar Stage Counter
    if (stageCounter) {
      stageCounter.textContent = index < 10 ? `0${index}` : `${index}`;
    }

    // Highlight active card on left stream
    sections.forEach((sec, idx) => {
      if (idx === index) {
        sec.classList.add('is-active');
      } else {
        sec.classList.remove('is-active');
      }
    });

    if (index === 0) {
      // SECTION 0: Assembled Prototype View
      pinProjector.hideAll();
      containmentCase.setOpacity(1.0);
      particleSystem.setActive(false);

      layers.forEach((layer, idx) => {
        gsap.to(layer.group.position, { y: assembledY[idx], duration: 1.2, ease: 'power2.out' });
        gsap.to(layer.group.scale, { x: 1, y: 1, z: 1, duration: 0.8 });
        layer.setHighlight(false);
        layer.setOpacity(1.0);
      });

      animateCamera(defaultCamPos, defaultTarget);
    } else if (index >= 1 && index <= 7) {
      // SECTIONS 1 to 7: Individual Layer Deep-Dive
      const activeLayerIdx = index - 1;
      const activeLayer = layers[activeLayerIdx];

      containmentCase.setOpacity(0.0); // Hide outer casing during explosion
      particleSystem.setActive(false);

      // Separate layers into exploded positions
      layers.forEach((layer, idx) => {
        gsap.to(layer.group.position, { y: explodedY[idx], duration: 1.0, ease: 'power2.out' });

        if (idx === activeLayerIdx) {
          // Highlight active layer: scale up 1.08x, full opacity, teal glow
          gsap.to(layer.group.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.6 });
          layer.setHighlight(true);
        } else {
          // Dim non-active layers
          gsap.to(layer.group.scale, { x: 1, y: 1, z: 1, duration: 0.6 });
          layer.setHighlight(false);
          layer.setOpacity(0.2);
        }
      });

      // Camera focuses smoothly on the active layer's exploded position
      const layerTargetY = explodedY[activeLayerIdx];
      const targetCamPos = new THREE.Vector3(6.5, layerTargetY + 1.8, 7.8);
      const targetLookAt = new THREE.Vector3(0, layerTargetY, 0);
      animateCamera(targetCamPos, targetLookAt);

      // Register active 3D pins for 2D screen tracking
      pinProjector.setPins(activeLayer.localPins, activeLayer.group);
    } else if (index === 8) {
      // SECTION 8: Reassembly & Full Flow Simulation
      pinProjector.hideAll();
      containmentCase.setOpacity(0.7);
      particleSystem.setActive(true); // Turn on gravity flow simulation

      layers.forEach((layer, idx) => {
        gsap.to(layer.group.position, { y: assembledY[idx], duration: 1.2, ease: 'power2.inOut' });
        gsap.to(layer.group.scale, { x: 1, y: 1, z: 1, duration: 0.8 });
        layer.setHighlight(false);
        layer.setOpacity(1.0);
      });

      // Camera draws back to view entire assembled operation
      const endCamPos = new THREE.Vector3(8.0, 4.5, 9.0);
      const endTarget = new THREE.Vector3(0, -0.4, 0);
      animateCamera(endCamPos, endTarget);
    }
  }

  function animateCamera(targetPos, targetLookAt, duration = 1.1) {
    gsap.to(currentCamPos, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        camera.position.copy(currentCamPos);
      }
    });

    gsap.to(currentCamTarget, {
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (controls) controls.target.copy(currentCamTarget);
        camera.lookAt(currentCamTarget);
      }
    });
  }

  function jumpToSection(idx) {
    const targetEl = document.querySelector(`.narrative-section[data-section="${idx}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return {
    activateSection,
    jumpToSection,
    getActiveSection: () => activeSectionIndex
  };
}

