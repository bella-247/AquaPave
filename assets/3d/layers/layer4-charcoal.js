/**
 * Layer 4: Middle Sub-Base Bed — Crushed Wood Charcoal / Activated Carbon
 * Lead Disciplines: Chemical Engineering
 * Specs: Physical-Chemical Adsorption | Targets: 12–325 mg/L O&G & ~13 mg/L Anionic Surfactants
 */

import * as THREE from '../vendor/three.module.js';
import { createCharcoalTexture } from '../textures.js';

export function createLayer4(dimensions = { width: 5.0, depth: 3.0, height: 0.8 }) {
  const { width: W, depth: D, height: H } = dimensions;
  const group = new THREE.Group();
  group.name = 'Layer4_ActivatedCarbon';

  const charcoalTex = createCharcoalTexture();

  const geom = new THREE.BoxGeometry(W, H, D, 8, 2, 8);
  const material = new THREE.MeshStandardMaterial({
    map: charcoalTex,
    bumpMap: charcoalTex,
    bumpScale: 0.05,
    roughness: 0.94,
    metalness: 0.12,
    color: '#1C1E23',
    transparent: true,
    opacity: 1.0
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Exact 3D Pin Placement from Addendum
  const localPins = [
    { id: 1, name: 'High-Surface-Area Carbon Granules', position: new THREE.Vector3(-1.5, 0.1, D / 2) },
    { id: 2, name: 'Anionic Surfactant & Detergent Capture', position: new THREE.Vector3(0.0, H / 2, 0.0) },
    { id: 3, name: 'Dual-Stage Polishing Performance', position: new THREE.Vector3(1.6, -H / 2, 0.6) }
  ];

  function setHighlight(active) {
    if (active) {
      material.emissive = new THREE.Color('#0D7377');
      material.emissiveIntensity = 0.35;
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

