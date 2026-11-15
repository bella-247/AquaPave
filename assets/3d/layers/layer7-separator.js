/**
 * Layer 7: Post-Filtration Skimming & IoT Storage — Baffled Oil Separator, Reuse Tank & ESP32 Node
 * Lead Disciplines: Electromechanical, ECE & Software Engineering
 * Specs: Stokes' Law Separator (A ≥ 0.04 m²) | ESP32 Telemetry | Targets: <20 NTU, <50 mg/L TSS, <5 mg/L O&G
 */

import * as THREE from '../vendor/three.module.js';

export function createLayer7(dimensions = { width: 4.8, depth: 2.2, height: 1.1 }) {
  const { width: W, depth: D, height: H } = dimensions;
  const group = new THREE.Group();
  group.name = 'Layer7_BaffledSeparatorAndIoT';

  // Common glass/acrylic material for separator & tank walls
  const acrylicMat = new THREE.MeshStandardMaterial({
    color: '#DCE8F5',
    transparent: true,
    opacity: 0.35,
    roughness: 0.15,
    metalness: 0.05,
    depthWrite: false
  });

  // -------------------------------------------------------------
  // Chamber A: Baffled Stokes' Law Oil-Water Separator (Left sub-unit)
  // -------------------------------------------------------------
  const chAWidth = W * 0.46;
  const chAGeom = new THREE.BoxGeometry(chAWidth, H, D);
  const chAMesh = new THREE.Mesh(chAGeom, acrylicMat);
  chAMesh.position.set(-W / 4, 0, 0);
  group.add(chAMesh);

  // 3 Vertical Baffles inside Chamber A
  const baffleMat = new THREE.MeshStandardMaterial({
    color: '#38BDF8',
    transparent: true,
    opacity: 0.65,
    roughness: 0.3
  });
  const baffleSpacing = chAWidth / 4;
  for (let i = 0; i < 3; i++) {
    // Alternating underflow and overflow baffle geometry
    const isUnderflow = (i % 2 === 0);
    const bHeight = H * 0.75;
    const bGeom = new THREE.BoxGeometry(0.04, bHeight, D - 0.1);
    const bMesh = new THREE.Mesh(bGeom, baffleMat);
    const bY = isUnderflow ? (H - bHeight) / 2 : -(H - bHeight) / 2;
    bMesh.position.set(-W / 2 + (i + 1) * baffleSpacing, bY, 0);
    group.add(bMesh);
  }

  // Golden floating oil film in compartment 1 (simulated free-phase hydrocarbons)
  const oilGeom = new THREE.BoxGeometry(baffleSpacing - 0.05, 0.05, D - 0.1);
  const oilMat = new THREE.MeshStandardMaterial({
    color: '#EAB308',
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.8
  });
  const oilMesh = new THREE.Mesh(oilGeom, oilMat);
  oilMesh.position.set(-W / 2 + baffleSpacing / 2, H / 2 - 0.06, 0);
  group.add(oilMesh);

  // -------------------------------------------------------------
  // Chamber B: Clarified Water Reuse Tank (Right sub-unit)
  // -------------------------------------------------------------
  const chBWidth = W * 0.48;
  const chBGeom = new THREE.BoxGeometry(chBWidth, H * 1.05, D);
  const chBMesh = new THREE.Mesh(chBGeom, acrylicMat);
  chBMesh.position.set(W / 4 + 0.1, 0.02, 0);
  group.add(chBMesh);

  // Clarified water body inside Chamber B (crystal-clear aqua-teal)
  const waterGeom = new THREE.BoxGeometry(chBWidth - 0.08, H * 0.82, D - 0.08);
  const waterMat = new THREE.MeshStandardMaterial({
    color: '#28A7AC',
    transparent: true,
    opacity: 0.65,
    roughness: 0.1,
    metalness: 0.1
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.position.set(W / 4 + 0.1, -H * 0.08, 0);
  group.add(waterMesh);

  // -------------------------------------------------------------
  // IoT Enclosure & Sensors on Chamber B
  // -------------------------------------------------------------
  // ESP32 Enclosure box
  const espGeom = new THREE.BoxGeometry(0.5, 0.22, 0.4);
  const espMat = new THREE.MeshStandardMaterial({
    color: '#0F172A',
    roughness: 0.4,
    metalness: 0.6
  });
  const espMesh = new THREE.Mesh(espGeom, espMat);
  espMesh.position.set(W / 4 + 0.3, H / 2 + 0.15, -0.3);
  group.add(espMesh);

  // Pulsing Status LED on ESP32
  const ledGeom = new THREE.SphereGeometry(0.04, 12, 12);
  const ledMat = new THREE.MeshBasicMaterial({ color: '#10B981' });
  const ledMesh = new THREE.Mesh(ledGeom, ledMat);
  ledMesh.position.set(W / 4 + 0.45, H / 2 + 0.27, -0.3);
  group.add(ledMesh);

  // Ultrasonic Level Sensor Cylinders (Transmitter + Receiver)
  const probeMat = new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.8, roughness: 0.2 });
  for (let s of [-0.08, 0.08]) {
    const probeGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16);
    const probeMesh = new THREE.Mesh(probeGeom, probeMat);
    probeMesh.position.set(W / 4 + 0.15 + s, H / 2 + 0.08, 0.3);
    group.add(probeMesh);
  }

  // Optical Turbidity Probe dipping into water
  const turbGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.6, 16);
  const turbMat = new THREE.MeshStandardMaterial({ color: '#38BDF8', metalness: 0.5, roughness: 0.2 });
  const turbMesh = new THREE.Mesh(turbGeom, turbMat);
  turbMesh.position.set(W / 4 - 0.4, H / 2 - 0.2, 0.0);
  group.add(turbMesh);

  // Exact 3D Pin Placement from Addendum
  const localPins = [
    { id: 1, name: "Baffled Stokes' Law Separator (API 421)", position: new THREE.Vector3(-0.8, H / 2, 0.0) },
    { id: 2, name: 'Non-Potable Reuse Tank (SDG 6.3 & 6.4)', position: new THREE.Vector3(1.4, 0, 0.4) },
    { id: 3, name: 'ESP32 Smart Telemetry & Clogging Node', position: new THREE.Vector3(1.4, H / 2 + 0.4, -0.3) }
  ];

  function setHighlight(active) {
    if (active) {
      waterMat.color.set('#38BDF8');
      ledMat.color.set('#00FFCC');
      acrylicMat.opacity = 0.55;
    } else {
      waterMat.color.set('#28A7AC');
      ledMat.color.set('#10B981');
      acrylicMat.opacity = 0.22;
    }
  }

  return {
    group,
    mesh: chAMesh,
    waterMesh,
    localPins,
    setHighlight,
    setOpacity: (val) => {
      acrylicMat.opacity = val * 0.38;
      waterMat.opacity = val * 0.62;
      oilMat.opacity = val * 0.8;
    },
    layerHeight: H
  };
}

