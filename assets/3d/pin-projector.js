/**
 * AquaPave 3D-to-2D Callout Pin Projector
 * Projects 3D anchor coordinates onto an overlay HTML layer using vector.project(camera).
 * Provides hardware-accelerated translate3d tracking and bidirectional card synchronization.
 */

import * as THREE from 'three';

export function createPinProjector(containerEl, camera) {
  let pinsContainer = document.getElementById('pins-overlay');
  if (!pinsContainer) {
    pinsContainer = document.createElement('div');
    pinsContainer.id = 'pins-overlay';
    containerEl.appendChild(pinsContainer);
  }

  // Create 3 reusable HTML pin elements
  const pinElements = [];
  for (let i = 1; i <= 3; i++) {
    const el = document.createElement('button');
    el.className = 'hotspot-pin';
    el.dataset.pinId = i;
    el.innerHTML = `
      <span class="pin-marker">${i}</span>
      <span class="pin-tooltip"></span>
    `;
    pinsContainer.appendChild(el);
    pinElements.push(el);
  }

  let currentPins = [];
  let currentLayerGroup = null;
  let onPinSelectCallback = null;

  pinElements.forEach(el => {
    el.addEventListener('click', () => {
      const pinId = parseInt(el.dataset.pinId, 10);
      highlightPin(pinId);
      if (onPinSelectCallback) onPinSelectCallback(pinId);
    });
  });

  function setPins(pins, layerGroup) {
    currentPins = pins || [];
    currentLayerGroup = layerGroup;

    pinElements.forEach((el, index) => {
      if (index < currentPins.length) {
        const pin = currentPins[index];
        el.querySelector('.pin-tooltip').textContent = pin.name || `Point ${pin.id}`;
        el.style.display = 'flex';
        el.classList.remove('active');
      } else {
        el.style.display = 'none';
      }
    });
  }

  function highlightPin(id) {
    pinElements.forEach(el => {
      if (parseInt(el.dataset.pinId, 10) === id) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  const tempVec = new THREE.Vector3();

  function update() {
    if (!currentPins.length || !currentLayerGroup) {
      pinElements.forEach(el => { el.style.opacity = '0'; });
      return;
    }

    const width = containerEl.clientWidth;
    const height = containerEl.clientHeight;

    pinElements.forEach((el, index) => {
      if (index >= currentPins.length) {
        el.style.opacity = '0';
        return;
      }

      const pin = currentPins[index];
      // Convert local coordinate to world space
      tempVec.copy(pin.position);
      currentLayerGroup.localToWorld(tempVec);

      // Project onto normalized device coordinates [-1, 1]
      tempVec.project(camera);

      // Behind the camera culling
      if (tempVec.z > 1.0) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      // Convert NDC to screen pixels
      const x = (tempVec.x * 0.5 + 0.5) * width;
      const y = (-(tempVec.y * 0.5) + 0.5) * height;

      // Check bounds
      if (x < 10 || x > width - 10 || y < 10 || y > height - 10) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    });
  }

  return {
    setPins,
    highlightPin,
    update,
    onPinSelect: (cb) => { onPinSelectCallback = cb; },
    hideAll: () => {
      pinElements.forEach(el => { el.style.opacity = '0'; });
    }
  };
}

