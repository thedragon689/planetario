import * as THREE from 'three';
import gsap from 'gsap';
import { collectRaycastTargets, findSelectable, resolveSelectableTarget } from './clickTargets.js';

const DRAG_THRESHOLD_PX = 5;
const DRAG_THRESHOLD_TOUCH_PX = 12;
const UI_ROOT_ID = 'ui-root';
const LOADING_SCREEN_ID = 'loading-screen';

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function pickHit(hits) {
  for (const hit of hits) {
    const object = resolveSelectableTarget(hit.object);
    if (object) return { object, hit };
  }
  return null;
}

function isDev() {
  return typeof import.meta !== 'undefined' && import.meta.env?.DEV;
}

export function createRaycaster(
  camera,
  domElement,
  selectableObjects,
  isTransitioning = () => false,
  { orbitControls = null } = {}
) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const pointerDownPos = new THREE.Vector2();
  const eventRoot = domElement.parentElement || domElement;
  const uiRoot = document.getElementById(UI_ROOT_ID);
  const loadingScreen = document.getElementById(LOADING_SCREEN_ID);

  let hovered = null;
  let selected = null;
  let isDragging = false;
  let pointerActive = false;
  let pointerType = 'mouse';
  let selectionHandled = false;
  let suspendOrbitControls = false;
  const callbacks = { onSelect: null, onHover: null, onDeselect: null, onPointerDown: null };

  function debugLog(...args) {
    if (isDev()) console.log('[Raycaster]', ...args);
  }

  function isWithinCanvas(event) {
    const rect = domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  /** True se un layer UI interattivo copre il punto (non il canvas). */
  function hasBlockingOverlay(event) {
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) return true;

    const stack = document.elementsFromPoint(event.clientX, event.clientY);
    for (const el of stack) {
      if (el === domElement) return false;
      if (uiRoot?.contains(el)) {
        const style = window.getComputedStyle(el);
        if (style.pointerEvents !== 'none') return true;
      }
    }
    return false;
  }

  function canHandlePointerEvent(event) {
    if (!isWithinCanvas(event)) return false;
    if (hasBlockingOverlay(event)) return false;
    return true;
  }

  function updateMouseFromEvent(event) {
    const rect = domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return true;
  }

  function getIntersects(event) {
    if (!updateMouseFromEvent(event)) return [];
    raycaster.setFromCamera(mouse, camera);
    const targets = collectRaycastTargets(selectableObjects());
    if (!targets.length) return [];
    return raycaster.intersectObjects(targets, false);
  }

  function dragThreshold() {
    return pointerType === 'touch' ? DRAG_THRESHOLD_TOUCH_PX : DRAG_THRESHOLD_PX;
  }

  function setOrbitEnabled(enabled) {
    if (orbitControls) orbitControls.enabled = enabled;
  }

  function setHighlight(object, active) {
    if (!object) return;
    object.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      if (child.material.emissive) {
        if (active) {
          if (!child.userData._origEmissive) {
            child.userData._origEmissive = child.material.emissive.clone();
            child.userData._origEmissiveIntensity = child.material.emissiveIntensity ?? 0;
          }
          child.material.emissive.set(0x56ccf2);
          child.material.emissiveIntensity = 0.4;
        } else if (child.userData._origEmissive) {
          child.material.emissive.copy(child.userData._origEmissive);
          child.material.emissiveIntensity = child.userData._origEmissiveIntensity;
        }
      } else if (child.material.isShaderMaterial) {
        if (active) {
          if (!child.userData._origScale) child.userData._origScale = child.scale.clone();
          child.scale.copy(child.userData._origScale).multiplyScalar(1.03);
        } else if (child.userData._origScale) {
          child.scale.copy(child.userData._origScale);
        }
      } else if (child.material.color) {
        if (active) {
          if (!child.userData._origColor) child.userData._origColor = child.material.color.clone();
          child.material.color.set(0x56ccf2);
        } else if (child.userData._origColor) {
          child.material.color.copy(child.userData._origColor);
        }
      }
    });
  }

  function pulseClickFeedback(object) {
    if (!object) return;
    const target = object.isGroup || object.isMesh ? object : object.parent || object;
    const base = { x: target.scale.x, y: target.scale.y, z: target.scale.z };
    gsap.to(target.scale, {
      x: base.x * 1.08,
      y: base.y * 1.08,
      z: base.z * 1.08,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      onComplete: () => target.scale.set(base.x, base.y, base.z),
    });
  }

  function updateHover(event) {
    if (!canHandlePointerEvent(event)) {
      if (hovered) {
        setHighlight(hovered, false);
        hovered = null;
      }
      domElement.style.cursor = 'default';
      callbacks.onHover?.(null);
      return;
    }

    const picked = pickHit(getIntersects(event));

    if (hovered && hovered !== picked?.object) {
      setHighlight(hovered, false);
      hovered = null;
    }

    if (picked) {
      const obj = picked.object;
      if (obj !== hovered) {
        hovered = obj;
        setHighlight(hovered, true);
        callbacks.onHover?.(obj, picked.hit);
      }
      domElement.style.cursor = 'pointer';
    } else {
      domElement.style.cursor = 'default';
      callbacks.onHover?.(null);
    }
  }

  function handleSelection(event) {
    if (isTransitioning()) {
      debugLog('selezione ignorata: transizione attiva');
      return;
    }
    if (!canHandlePointerEvent(event)) {
      debugLog('selezione ignorata: overlay UI o fuori canvas');
      return;
    }

    const targets = collectRaycastTargets(selectableObjects());
    const picked = pickHit(getIntersects(event));
    if (isDev()) {
      if (picked) {
        debugLog('selezionato', picked.object.userData?.id ?? picked.object.name);
      } else if (targets.length) {
        debugLog('nessun hit — clicca sul disco del pianeta, non sullo sfondo');
      }
    }

    if (picked) {
      const obj = picked.object;
      if (selected && selected !== obj) {
        setHighlight(selected, false);
        callbacks.onDeselect?.(selected);
      }
      selected = obj;
      setHighlight(selected, true);
      pulseClickFeedback(obj);
      callbacks.onSelect?.(obj, picked.hit);
      return;
    }

    if (selected) {
      setHighlight(selected, false);
      callbacks.onDeselect?.(selected);
      selected = null;
      callbacks.onSelect?.(null);
    }
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    if (!canHandlePointerEvent(event)) return;

    selectionHandled = false;
    isDragging = false;
    pointerActive = true;
    pointerType = event.pointerType || 'mouse';
    pointerDownPos.set(event.clientX, event.clientY);

    const picked = pickHit(getIntersects(event));
    if (picked) {
      suspendOrbitControls = true;
      setOrbitEnabled(false);
      callbacks.onPointerDown?.(picked.object, picked.hit);
    }
  }

  function onPointerMove(event) {
    if (pointerActive) {
      const dist = pointerDownPos.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
      if (dist > dragThreshold()) isDragging = true;
    }
    if (!isDragging) updateHover(event);
  }

  function onPointerUp(event) {
    if (event.button !== 0) return;
    if (!pointerActive) return;
    pointerActive = false;

    if (suspendOrbitControls) {
      suspendOrbitControls = false;
      setOrbitEnabled(true);
    }

    if (isDragging) {
      isDragging = false;
      return;
    }

    selectionHandled = true;
    handleSelection(event);
  }

  function onClick(event) {
    if (event.button !== 0) return;
    if (selectionHandled) return;
    if (!canHandlePointerEvent(event)) return;
    handleSelection(event);
  }

  function onPointerLeave() {
    pointerActive = false;
    isDragging = false;
    selectionHandled = false;
    if (suspendOrbitControls) {
      suspendOrbitControls = false;
      setOrbitEnabled(true);
    }
    if (hovered) {
      setHighlight(hovered, false);
      hovered = null;
    }
    domElement.style.cursor = 'default';
    callbacks.onHover?.(null);
  }

  const listenerOpts = { capture: true };
  domElement.style.touchAction = 'none';

  eventRoot.addEventListener('pointerdown', onPointerDown, listenerOpts);
  eventRoot.addEventListener('pointermove', onPointerMove, listenerOpts);
  eventRoot.addEventListener('pointerup', onPointerUp, listenerOpts);
  eventRoot.addEventListener('pointerleave', onPointerLeave, listenerOpts);
  eventRoot.addEventListener('pointercancel', onPointerLeave, listenerOpts);
  eventRoot.addEventListener('click', onClick, listenerOpts);

  if (isDev()) {
    const roots = selectableObjects();
    const targets = collectRaycastTargets(roots);
    debugLog('inizializzato', {
      canvasInDom: document.contains(domElement),
      eventRoot: eventRoot.id || eventRoot.tagName,
      selectableRoots: roots.length,
      raycastMeshes: targets.length,
    });
  }

  return {
    onSelect: (fn) => { callbacks.onSelect = fn; },
    onHover: (fn) => { callbacks.onHover = fn; },
    onDeselect: (fn) => { callbacks.onDeselect = fn; },
    onPointerDown: (fn) => { callbacks.onPointerDown = fn; },
    getSelected: () => selected,
    getDebugInfo() {
      const roots = selectableObjects();
      const targets = collectRaycastTargets(roots);
      return { roots: roots.length, targets: targets.length };
    },
    clearSelection() {
      if (selected) setHighlight(selected, false);
      selected = null;
      if (hovered) setHighlight(hovered, false);
      hovered = null;
      domElement.style.cursor = 'default';
    },
    dispose() {
      eventRoot.removeEventListener('pointerdown', onPointerDown, listenerOpts);
      eventRoot.removeEventListener('pointermove', onPointerMove, listenerOpts);
      eventRoot.removeEventListener('pointerup', onPointerUp, listenerOpts);
      eventRoot.removeEventListener('pointerleave', onPointerLeave, listenerOpts);
      eventRoot.removeEventListener('pointercancel', onPointerLeave, listenerOpts);
      eventRoot.removeEventListener('click', onClick, listenerOpts);
    },
  };
}
