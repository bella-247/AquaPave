/**
 * Containment Frame — Waterproofed Acrylic Bench-Scale Prototype Enclosure
 * Footprint: 50 cm × 30 cm bench-scale prototype frame with perimeter silicone gasket
 * Used in Section 0 (Unified Assembled Stack) & Section 8 (Reassembly)
 */

import * as THREE from 'three';

export function createContainmentCase(dimensions = { width: 5.25, depth: 3.25, height: 4.2 }) {
  const { width: W, depth: D, height: H } = dimensions;
  const group = new THREE.Group();
  group.name = 'Containment_Enclosure';

  // 1. Transparent acrylic outer wall container
  const acrylicMat = new THREE.MeshPhysicalMaterial({
    color: '#E0F2FE',
    transparent: true,
    opacity: 0.35,
    roughness: 0.08,
    metalness: 0.02,
    transmission: 0.92,
    thickness: 0.6,
    depthWrite: false
  });

  // Base tray
  const baseGeom = new THREE.BoxGeometry(W, 0.08, D);
  const baseMat = new THREE.MeshStandardMaterial({
    color: '#0F172A',
    roughness: 0.7,
    metalness: 0.3
  });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.y = -H / 2;
  group.add(baseMesh);

  // 4 Transparent Walls (Front, Back, Left, Right)
  const wallThickness = 0.06;

  // Front & Back walls
  const fbGeom = new THREE.BoxGeometry(W, H, wallThickness);
  const frontWall = new THREE.Mesh(fbGeom, acrylicMat);
  frontWall.position.z = D / 2;
  group.add(frontWall);

  const backWall = new THREE.Mesh(fbGeom, acrylicMat);
  backWall.position.z = -D / 2;
  group.add(backWall);

  // Left & Right walls
  const lrGeom = new THREE.BoxGeometry(wallThickness, H, D);
  const leftWall = new THREE.Mesh(lrGeom, acrylicMat);
  leftWall.position.x = -W / 2;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(lrGeom, acrylicMat);
  rightWall.position.x = W / 2;
  group.add(rightWall);

  // 2. Structural Corner Framing Brackets (Black anodized aluminum / sealed frame)
  const frameMat = new THREE.MeshStandardMaterial({
    color: '#1E293B',
    roughness: 0.4,
    metalness: 0.7
  });

  const cornerGeom = new THREE.BoxGeometry(0.12, H + 0.04, 0.12);
  const corners = [
    [-W / 2, 0, -D / 2],
    [W / 2, 0, -D / 2],
    [-W / 2, 0, D / 2],
    [W / 2, 0, D / 2]
  ];
  for (let [cx, cy, cz] of corners) {
    const cMesh = new THREE.Mesh(cornerGeom, frameMat);
    cMesh.position.set(cx, cy, cz);
    group.add(cMesh);
  }

  // 3. Perimeter Waterproof Silicone Sealant Gasket Lip
  const lipGeom = new THREE.BoxGeometry(W + 0.1, 0.08, D + 0.1);
  const lipMat = new THREE.MeshStandardMaterial({
    color: '#0D7377',
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
    opacity: 0.75
  });
  const lipMesh = new THREE.Mesh(lipGeom, lipMat);
  lipMesh.position.y = H / 2;
  group.add(lipMesh);

  function setOpacity(val) {
    acrylicMat.opacity = val * 0.35;
    lipMat.opacity = val * 0.75;
    baseMat.opacity = val;
    frameMat.opacity = val;
  }

  return {
    group,
    setOpacity
  };
}

