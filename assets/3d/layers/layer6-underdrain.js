/**
 * Layer 6: Collection Plumbing — Slotted PVC Underdrain & Pea Gravel Bedding
 * Lead Disciplines: Electromechanical Engineering
 * Specs: Slotted PVC Underdrain | 10–20 mm Gravel Surround | Laminar Outflow Conveyance
 */

import * as THREE from 'three';
import { createGravelTexture } from '../textures.js';

export function createLayer6(dimensions = { width: 5.0, depth: 3.0, height: 0.55 }) {
  const { width: W, depth: D, height: H } = dimensions;
  const group = new THREE.Group();
  group.name = 'Layer6_UnderdrainPlumbing';

  const gravelTex = createGravelTexture();

  // 1. Pea gravel bedding base
  const gravelGeom = new THREE.BoxGeometry(W, H, D, 6, 2, 6);
  const gravelMat = new THREE.MeshStandardMaterial({
    map: gravelTex,
    bumpMap: gravelTex,
    bumpScale: 0.04,
    roughness: 0.85,
    metalness: 0.05,
    color: '#525B68',
    transparent: true,
    opacity: 1.0
  });
  const gravelMesh = new THREE.Mesh(gravelGeom, gravelMat);
  gravelMesh.castShadow = true;
  group.add(gravelMesh);

  // 2. Horizontal Slotted PVC Pipe
  const pipeRadius = 0.18;
  const pipeLength = W + 0.8; // Protrudes on the right side towards separator
  const pipeGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLength, 24);
  // Orient horizontally along the X-axis
  pipeGeom.rotateZ(Math.PI / 2);

  const pipeMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.35,
    metalness: 0.15,
    transparent: true,
    opacity: 1.0
  });
  const pipeMesh = new THREE.Mesh(pipeGeom, pipeMat);
  pipeMesh.position.set(0.4, 0, 0); // slightly offset to project rightward
  pipeMesh.castShadow = true;
  group.add(pipeMesh);

  // 3. Procedural Perforated Slots on the PVC pipe
  const slotMat = new THREE.MeshBasicMaterial({ color: '#1E293B' });
  const numSlots = 14;
  for (let i = 0; i < numSlots; i++) {
    const slotGeom = new THREE.BoxGeometry(0.04, pipeRadius * 2.1, 0.08);
    const slotMesh = new THREE.Mesh(slotGeom, slotMat);
    slotMesh.position.set(-W / 2 + 0.4 + i * (W / numSlots), 0, 0);
    group.add(slotMesh);
  }

  // 4. End Cap on the upstream end
  const capGeom = new THREE.CylinderGeometry(pipeRadius * 1.06, pipeRadius * 1.06, 0.08, 20);
  capGeom.rotateZ(Math.PI / 2);
  const capMesh = new THREE.Mesh(capGeom, pipeMat);
  capMesh.position.set(-W / 2 - 0.04 + 0.4, 0, 0);
  group.add(capMesh);

  // Exact 3D Pin Placement from Addendum
  const localPins = [
    { id: 1, name: 'Perforated / Slotted PVC Collector Pipe', position: new THREE.Vector3(0.0, 0, 0.0) },
    { id: 2, name: '10–20 mm Coarse Gravel Envelope', position: new THREE.Vector3(-1.6, H / 2, 0.8) },
    { id: 3, name: 'Stage-Wise Sampling Port (Underdrain)', position: new THREE.Vector3(W / 2 + 0.4, 0, 0.0) }
  ];

  function setHighlight(active) {
    if (active) {
      pipeMat.emissive = new THREE.Color('#28A7AC');
      pipeMat.emissiveIntensity = 0.45;
      gravelMat.emissive = new THREE.Color('#0D7377');
      gravelMat.emissiveIntensity = 0.2;
      pipeMat.opacity = 1.0;
      gravelMat.opacity = 1.0;
    } else {
      pipeMat.emissive = new THREE.Color(0x000000);
      pipeMat.emissiveIntensity = 0;
      gravelMat.emissive = new THREE.Color(0x000000);
      gravelMat.emissiveIntensity = 0;
      pipeMat.opacity = 0.22;
      gravelMat.opacity = 0.22;
    }
  }

  return {
    group,
    mesh: gravelMesh,
    pipeMesh,
    localPins,
    setHighlight,
    setOpacity: (val) => { gravelMat.opacity = val; pipeMat.opacity = val; },
    layerHeight: H
  };
}

