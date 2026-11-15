/**
 * AquaPave Water Flow Simulation — 150-Droplet Instanced Particle System
 * Simulates gravity-driven filtration and contaminant color transformation:
 * Murky brown (raw influent, 187–483 NTU) -> Amber -> Clean crystal aqua (<20 NTU).
 */

import * as THREE from './vendor/three.module.js';

export function createParticleFlowSystem(count = 150, bounds = { width: 4.6, depth: 2.6, topY: 2.2, bottomY: -2.0 }) {
  const { width: W, depth: D, topY, bottomY } = bounds;

  const geom = new THREE.SphereGeometry(0.045, 10, 10);
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85
  });

  const instancedMesh = new THREE.InstancedMesh(geom, mat, count);
  instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  // Per-particle state
  const particles = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  // Color transformation gradient
  const colorRaw = new THREE.Color('#795548');       // Murky brown/oily influent (187–483 NTU)
  const colorFiltered = new THREE.Color('#D97706');  // Amber (oil/TSS adsorption in sand/charcoal)
  const colorPolished = new THREE.Color('#0D9488');  // Mineral polished (pumice cation exchange)
  const colorClean = new THREE.Color('#28A7AC');     // Crystal clarified reuse (<20 NTU)

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * W;
    const y = topY - Math.random() * (topY - bottomY);
    const z = (Math.random() - 0.5) * D;
    const speed = 0.8 + Math.random() * 0.9;

    particles.push({ x, y, z, speed });

    dummy.position.set(x, y, z);
    dummy.scale.setScalar(0.8 + Math.random() * 0.4);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);

    // Initial color based on y
    const progress = (topY - y) / (topY - bottomY);
    getColorForProgress(progress, color);
    instancedMesh.setColorAt(i, color);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

  let active = true;

  function getColorForProgress(p, targetColor) {
    if (p < 0.25) {
      targetColor.copy(colorRaw);
    } else if (p < 0.55) {
      targetColor.copy(colorRaw).lerp(colorFiltered, (p - 0.25) / 0.3);
    } else if (p < 0.8) {
      targetColor.copy(colorFiltered).lerp(colorPolished, (p - 0.55) / 0.25);
    } else {
      targetColor.copy(colorPolished).lerp(colorClean, (p - 0.8) / 0.2);
    }
  }

  function update(delta = 0.016) {
    if (!active) return;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.y -= p.speed * delta;

      // Jitter horizontally slightly as it percolates through pores
      p.x += (Math.random() - 0.5) * 0.01;
      p.z += (Math.random() - 0.5) * 0.01;

      // Clamp within cross-section
      if (p.x < -W / 2) p.x = -W / 2;
      if (p.x > W / 2) p.x = W / 2;
      if (p.z < -D / 2) p.z = -D / 2;
      if (p.z > D / 2) p.z = D / 2;

      // Reset to top when reaching bottom collection tank
      if (p.y <= bottomY) {
        p.y = topY + Math.random() * 0.4;
        p.x = (Math.random() - 0.5) * W;
        p.z = (Math.random() - 0.5) * D;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);

      const progress = Math.min(1.0, Math.max(0.0, (topY - p.y) / (topY - bottomY)));
      getColorForProgress(progress, color);
      instancedMesh.setColorAt(i, color);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
  }

  function setActive(val) {
    active = val;
    instancedMesh.visible = val;
  }

  return {
    mesh: instancedMesh,
    update,
    setActive,
    isActive: () => active
  };
}

