/**
 * Layer 3: Upper Sub-Base Bed — Washed River Sand Layer
 * Lead Disciplines: Chemical & Environmental Engineering
 * Specs: Depth Filtration | Target Influent: 186–561 mg/L TSS & 187–483 NTU Turbidity
 */

import * as THREE from '../vendor/three.module.js';
import { createSandTexture } from '../textures.js';

export function createLayer3(dimensions = { width: 5.0, depth: 3.0, height: 0.6 }) {
  const { width: W, depth: D, height: H } = dimensions;
  const group = new THREE.Group();
  group.name = 'Layer3_RiverSand';

  const sandTex = createSandTexture();

  const geom = new THREE.BoxGeometry(W, H, D, 6, 2, 6);
  const material = new THREE.MeshStandardMaterial({
    map: sandTex,
    bumpMap: sandTex,
    bumpScale: 0.035,
    roughness: 0.82,
    metalness: 0.03,
    color: '#D4A373',
    transparent: true,
    opacity: 1.0
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Exact 3D Pin Placement from Addendum
  const localPins = [
    { id: 1, name: 'Graded Washed Silica Sand Matrix', position: new THREE.Vector3(-1.0, H / 2, 0.5) },
    { id: 2, name: 'Anti-Blinding Pre-Filter Barrier', position: new THREE.Vector3(0.8, -H / 2, D / 2) },
    { id: 3, name: 'Uniform Hydraulic Distribution', position: new THREE.Vector3(1.8, 0, 0.0) }
  ];

  function setHighlight(active) {
    if (active) {
      material.emissive = new THREE.Color('#D4A373');
      material.emissiveIntensity = 0.3;
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

