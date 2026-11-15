/**
 * Layer 1: Surface Wash Pad — Pervious Concrete Slab
 * Lead Disciplines: Civil & Architectural Engineering
 * Standard: ACI 522R-10 | 15%–35% Voids (~20% Target) | w/c = 0.27–0.34
 */

import * as THREE from '../vendor/three.module.js';
import { createConcreteTexture } from '../textures.js';

export function createLayer1(dimensions = { width: 5.0, depth: 3.0, height: 0.75 }) {
  const { width: W, depth: D, height: H } = dimensions;
  const group = new THREE.Group();
  group.name = 'Layer1_PerviousSlab';

  const concreteTex = createConcreteTexture();

  // Create sloped apron slab geometry (2%–5% grade on top surface)
  const geom = new THREE.BoxGeometry(W, H, D, 10, 2, 8);
  const pos = geom.attributes.position;
  // Apply a subtle 3.5% slope along the Z-axis (drainage apron inclination)
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (y > 0) {
      // Top surface points: slope downwards from back (z < 0) to front (z > 0)
      const slopeOffset = (-z / D) * 0.08;
      pos.setY(i, y + slopeOffset);
    }
  }
  geom.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    map: concreteTex,
    bumpMap: concreteTex,
    bumpScale: 0.04,
    roughness: 0.88,
    metalness: 0.04,
    color: '#8A929E',
    transparent: true,
    opacity: 1.0
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Subtle perimeter curb / seal lip
  const curbGeom = new THREE.BoxGeometry(W + 0.1, 0.08, D + 0.1);
  const curbMat = new THREE.MeshStandardMaterial({
    color: '#1F2937',
    roughness: 0.6,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85
  });
  const curbMesh = new THREE.Mesh(curbGeom, curbMat);
  curbMesh.position.y = H / 2 + 0.02;
  group.add(curbMesh);

  // Exact 3D Pin Placement from Addendum
  const localPins = [
    { id: 1, name: 'Pore Matrix (15%–35% Voids)', position: new THREE.Vector3(-1.2, H / 2, 0.4) },
    { id: 2, name: 'Alkaline Buffering (pH 8.0–9.5)', position: new THREE.Vector3(0.5, 0, D / 2) },
    { id: 3, name: '2%–5% Slope & Perimeter Seal', position: new THREE.Vector3(W / 2, H / 2, -0.5) }
  ];

  function setHighlight(active) {
    if (active) {
      material.emissive = new THREE.Color('#0D7377');
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
    setOpacity: (val) => { material.opacity = val; curbMat.opacity = val * 0.85; },
    layerHeight: H
  };
}

