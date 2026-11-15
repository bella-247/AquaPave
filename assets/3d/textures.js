/**
 * AquaPave 3D Explorer - Procedural Canvas Texture Generator
 * Synthesizes high-resolution PBR bump and roughness maps procedurally via HTML5 Canvas.
 * Eliminates all external image downloads for instant lazy loading and zero asset latency.
 */

import * as THREE from './vendor/three.module.js';

const textureCache = new Map();

/**
 * Creates a cellular noise texture representing porous pervious concrete
 * (ACI 522R-10: 15%–35% void ratio with 10–20 mm aggregate and no fine sand)
 */
export function createConcreteTexture(size = 512) {
  if (textureCache.has('concrete')) return textureCache.get('concrete');

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base cementitious matrix tone
  ctx.fillStyle = '#6E7682';
  ctx.fillRect(0, 0, size, size);

  // Aggregate granules (10-20mm representation)
  const numPebbles = 380;
  for (let i = 0; i < numPebbles; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 6 + Math.random() * 12;
    const shade = 90 + Math.floor(Math.random() * 50);

    ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 8})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle edge contour
    ctx.strokeStyle = 'rgba(30, 35, 42, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Interconnected macropores (voids where water infiltrates)
  ctx.fillStyle = '#181C22';
  const numVoids = 420;
  for (let i = 0; i < numVoids; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rx = 3 + Math.random() * 7;
    const ry = 2 + Math.random() * 5;
    const rot = Math.random() * Math.PI;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set('concrete', texture);
  return texture;
}

/**
 * Creates a woven fibrous texture representing the non-woven geotextile membrane
 */
export function createGeotextileTexture(size = 256) {
  if (textureCache.has('geotextile')) return textureCache.get('geotextile');

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#262D38';
  ctx.fillRect(0, 0, size, size);

  // Micro-filament crosshatch weave
  ctx.strokeStyle = 'rgba(75, 88, 106, 0.55)';
  ctx.lineWidth = 1;
  const spacing = 4;
  for (let x = 0; x < size; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + size * 0.2, size);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + size * 0.15);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  textureCache.set('geotextile', texture);
  return texture;
}

/**
 * Creates fine silica sand grain noise texture
 */
export function createSandTexture(size = 512) {
  if (textureCache.has('sand')) return textureCache.get('sand');

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#D4A373';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(0, 212 + noise));     // R
    data[i + 1] = Math.min(255, Math.max(0, 163 + noise)); // G
    data[i + 2] = Math.min(255, Math.max(0, 115 + noise)); // B
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  textureCache.set('sand', texture);
  return texture;
}

/**
 * Creates rough faceted carbon granules texture (crushed wood charcoal / activated carbon)
 */
export function createCharcoalTexture(size = 512) {
  if (textureCache.has('charcoal')) return textureCache.get('charcoal');

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#16181C';
  ctx.fillRect(0, 0, size, size);

  // Faceted angular fractured carbon grains
  const numFacets = 450;
  for (let i = 0; i < numFacets; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const sz = 4 + Math.random() * 9;
    const tone = 20 + Math.floor(Math.random() * 32);

    ctx.fillStyle = `rgb(${tone}, ${tone}, ${tone + 4})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + sz, y + sz * 0.3);
    ctx.lineTo(x + sz * 0.6, y + sz);
    ctx.lineTo(x - sz * 0.4, y + sz * 0.7);
    ctx.closePath();
    ctx.fill();

    // Sharp highlights on cleavage planes
    ctx.strokeStyle = 'rgba(80, 88, 100, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  textureCache.set('charcoal', texture);
  return texture;
}

/**
 * Creates vesicle-pitted volcanic rock texture (local Rift Valley pumice)
 */
export function createPumiceTexture(size = 512) {
  if (textureCache.has('pumice')) return textureCache.get('pumice');

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#A3ABB7';
  ctx.fillRect(0, 0, size, size);

  // Porous vesicular cavities (pitted micro-voids)
  const numPits = 550;
  for (let i = 0; i < numPits; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rad = 2 + Math.random() * 6;

    // Pit shadow interior
    ctx.fillStyle = 'rgba(55, 62, 72, 0.75)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();

    // Subtle edge rim reflection
    ctx.strokeStyle = 'rgba(235, 240, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x - 0.5, y - 0.5, rad * 0.9, 0, Math.PI * 1.2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set('pumice', texture);
  return texture;
}

/**
 * Creates 10–20 mm sub-angular river pea gravel texture
 */
export function createGravelTexture(size = 512) {
  if (textureCache.has('gravel')) return textureCache.get('gravel');

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#48505C';
  ctx.fillRect(0, 0, size, size);

  const numStones = 280;
  for (let i = 0; i < numStones; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 14;
    const shade = 65 + Math.floor(Math.random() * 45);

    ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 5})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.4), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(20, 24, 30, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set('gravel', texture);
  return texture;
}

