import * as THREE from 'three';

const _worldPos = new THREE.Vector3();

function isHierarchyVisible(object) {
  let node = object;
  while (node) {
    if (node.visible === false) return false;
    node = node.parent;
  }
  return true;
}

export function createLabels(container) {
  const labels = new Map();
  let hoveredId = null;
  let selectedId = null;

  function setHovered(id) {
    hoveredId = id;
  }

  function setSelected(id) {
    selectedId = id;
  }

  function createLabelElement(name, kind = 'object') {
    const el = document.createElement('div');
    el.className = kind === 'cluster' ? 'cluster-label' : 'object-label';
    el.textContent = name;
    container.appendChild(el);
    return el;
  }

  /**
   * @param {string} id
   * @param {THREE.Object3D} object
   * @param {string} name
   * @param {{ scene?: 'earth' | 'solar' | 'cosmic', kind?: 'object' | 'cluster' }} [options]
   */
  function add(id, object, name, options = {}) {
    const kind = options.kind || 'object';
    labels.set(id, {
      object,
      element: createLabelElement(name, kind),
      name,
      scene: options.scene || 'solar',
      kind,
    });
  }

  function setVisible(id, visible) {
    const entry = labels.get(id);
    if (entry) entry.element.style.display = visible ? 'block' : 'none';
  }

  function update(camera, { activeScene = null } = {}) {
    labels.forEach((entry, id) => {
      const { object, element, scene, kind } = entry;
      if (!activeScene || scene !== activeScene || !isHierarchyVisible(object)) {
        element.style.display = 'none';
        return;
      }

      if (activeScene === 'cosmic' && kind === 'object') {
        const isActive = id === hoveredId || id === selectedId;
        if (!isActive) {
          element.classList.remove('object-label--active');
        } else {
          element.classList.add('object-label--active');
        }
      }

      object.getWorldPosition(_worldPos);
      _worldPos.project(camera);

      const x = (_worldPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-_worldPos.y * 0.5 + 0.5) * window.innerHeight;

      if (_worldPos.z > 1) {
        element.style.display = 'none';
        return;
      }

      element.style.display = 'block';
      const offsetY = kind === 'cluster' ? '-220%' : '-150%';
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${offsetY})`;
      const isActive = id === hoveredId || id === selectedId;
      const minOpacity = kind === 'cluster' ? 0.95 : (isActive ? 1 : 0.88);
      element.style.opacity = String(Math.min(1, Math.max(minOpacity, 1.4 / Math.max(_worldPos.z, 0.15))));
    });
  }

  function dispose() {
    labels.forEach(({ element }) => element.remove());
    labels.clear();
  }

  return { add, update, setVisible, setHovered, setSelected, dispose };
}
