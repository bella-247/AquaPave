/**
 * Layer 5: Lower Sub-Base Bed — Local Volcanic Pumice Media
 * Lead Disciplines: Chemical & Environmental Engineering
 * Specs: Cation Exchange & Mineral Sorption | Targets: Pb (0.53 mg/L) & Zn (1.98 mg/L)
 */

import * as THREE from 'three';
import { createPumiceTexture } from '../textures.js';

export function createLayer5(dimensions = { width: 5.0, depth: 3.0, height: 0.8 }) {
  const { width: W, depth: D, height: H } = dimensions;
  const group = new THREE.Group();
  group.name = 'Layer5_VolcanicPumice';

  const pumiceTex = createPumiceTexture();

  const geom = new THREE.BoxGeometry(W, H, D, 8, 2, 8);
  const material = new THREE.MeshStandardMaterial({
    map: pumiceTex,
    bumpMap: pumiceTex,
    bumpScale: 0.045,
    roughness: 0.86,
    metalness: 0.05,
    color: '#9CA3AF',
    transparent: true,
    opacity: 1.0
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Exact 3D Pin Placement from Addendum
  const localPins = [
    { id: 1, name: 'Vesicular Volcanic Pumice Matrix', position: new THREE.Vector3(-1.4, 0, D / 2) },
    { id: 2, name: 'Heavy Metal Cation Exchange Sites', position: new THREE.Vector3(0.3, H / 2, -0.2) },
    { id: 3, name: 'Locally Sourced Low-Cost Media (SDG 1 & 9)', position: new THREE.Vector3(W / 2, 0, 0.5) }
  ];

  function setHighlight(active) {
    if (active) {
      material.emissive = new THREE.Color('#28A7AC');
      material.emissiveIntensity = 0.25;
      material.opacity = 1.0;
    } else {
      material.emissive = new THREE.Color(0x000000);
      material.emissiveIntensity = 0;
      material.opacity = 0.22;
    }
  }

  return {
    group,
    mesh,
    localPins,
    setHighlight,
    setOpacity: (val) => { material.opacity = val; },
    layerHeight: H
  };
}

