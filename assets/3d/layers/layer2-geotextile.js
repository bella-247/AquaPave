/**
 * Layer 2: Upper Stabilization Interface — Choker Course & Non-Woven Geotextile
 * Lead Disciplines: Civil & Chemical Engineering
 * Specs: 5–10 mm Choker Aggregate | 2–5 mm Bedding Stone | Non-Woven Polymer Geotextile
 */

import * as THREE from 'three';
import { createGravelTexture, createGeotextileTexture } from '../textures.js';

export function createLayer2(dimensions = { width: 5.0, depth: 3.0, height: 0.35 }) {
  const { width: W, depth: D, height: H } = dimensions;
  const group = new THREE.Group();
  group.name = 'Layer2_ChokerGeotextile';

  const gravelTex = createGravelTexture();
  const geotextileTex = createGeotextileTexture();

  // 1. Choker stone upper bedding layer
  const stoneHeight = H * 0.85;
  const stoneGeom = new THREE.BoxGeometry(W, stoneHeight, D);
  const stoneMat = new THREE.MeshStandardMaterial({
    map: gravelTex,
    bumpMap: gravelTex,
    bumpScale: 0.03,
    roughness: 0.85,
    metalness: 0.08,
    color: '#646D7A',
    transparent: true,
    opacity: 1.0
  });
  const stoneMesh = new THREE.Mesh(stoneGeom, stoneMat);
  stoneMesh.position.y = (H - stoneHeight) / 2;
  stoneMesh.castShadow = true;
  group.add(stoneMesh);

  // 2. Distinct non-woven geotextile membrane sheet (slightly protruding edge)
  const geoHeight = 0.04;
  const geoGeom = new THREE.BoxGeometry(W + 0.16, geoHeight, D + 0.16);
  const geoMat = new THREE.MeshStandardMaterial({
    map: geotextileTex,
    bumpMap: geotextileTex,
    bumpScale: 0.02,
    roughness: 0.92,
    metalness: 0.02,
    color: '#262D38',
    transparent: true,
    opacity: 0.95
  });
  const geoMesh = new THREE.Mesh(geoGeom, geoMat);
  geoMesh.position.y = -H / 2 + geoHeight / 2;
  group.add(geoMesh);

  // Exact 3D Pin Placement from Addendum
  const localPins = [
    { id: 1, name: '5–10 mm Choker & Bedding Stone', position: new THREE.Vector3(-1.4, H / 2, 0.2) },
    { id: 2, name: 'Non-Woven Geotextile Membrane', position: new THREE.Vector3(0.0, -H / 2, D / 2) },
    { id: 3, name: 'Aerobic Hydrocarbon Bioreactor Zone', position: new THREE.Vector3(1.5, 0, -0.3) }
  ];

  function setHighlight(active) {
    if (active) {
      stoneMat.emissive = new THREE.Color('#0D7377');
      stoneMat.emissiveIntensity = 0.25;
      geoMat.emissive = new THREE.Color('#28A7AC');
      geoMat.emissiveIntensity = 0.35;
      stoneMat.opacity = 1.0;
      geoMat.opacity = 0.95;
    } else {
      stoneMat.emissive = new THREE.Color(0x000000);
      stoneMat.emissiveIntensity = 0;
      geoMat.emissive = new THREE.Color(0x000000);
      geoMat.emissiveIntensity = 0;
      stoneMat.opacity = 0.22;
      geoMat.opacity = 0.22;
    }
  }

  return {
    group,
    mesh: stoneMesh,
    localPins,
    setHighlight,
    setOpacity: (val) => { stoneMat.opacity = val; geoMat.opacity = val * 0.95; },
    layerHeight: H
  };
}

