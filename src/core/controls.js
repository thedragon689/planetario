import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SCENES } from '../config.js';

const EPS = 0.001;

/** Profili OrbitControls per scena — cosmic con orbita sferica completa. */
export const CONTROL_PROFILES = {
  [SCENES.EARTH]: {
    minDistance: 1.2,
    maxDistance: 8,
    minPolarAngle: EPS,
    maxPolarAngle: Math.PI - EPS,
    rotateSpeed: 0.45,
    zoomSpeed: 0.7,
    panSpeed: 0.5,
    dampingFactor: 0.06,
    enablePan: true,
    screenSpacePanning: true,
  },
  [SCENES.SOLAR_SYSTEM]: {
    minDistance: 4,
    maxDistance: 220,
    minPolarAngle: EPS,
    maxPolarAngle: Math.PI - EPS,
    rotateSpeed: 0.5,
    zoomSpeed: 0.85,
    panSpeed: 0.55,
    dampingFactor: 0.055,
    enablePan: true,
    screenSpacePanning: false,
  },
  [SCENES.MILKY_WAY]: {
    minDistance: 120,
    maxDistance: 2800,
    minPolarAngle: EPS,
    maxPolarAngle: Math.PI - EPS,
    rotateSpeed: 0.6,
    zoomSpeed: 1,
    panSpeed: 0.7,
    dampingFactor: 0.06,
    enablePan: true,
    screenSpacePanning: false,
  },
  [SCENES.EXOPLANETS]: {
    minDistance: 80,
    maxDistance: 2200,
    minPolarAngle: EPS,
    maxPolarAngle: Math.PI - EPS,
    rotateSpeed: 0.58,
    zoomSpeed: 0.95,
    panSpeed: 0.68,
    dampingFactor: 0.06,
    enablePan: true,
    screenSpacePanning: false,
  },
  [SCENES.EXTREME]: {
    minDistance: 100,
    maxDistance: 2600,
    minPolarAngle: EPS,
    maxPolarAngle: Math.PI - EPS,
    rotateSpeed: 0.55,
    zoomSpeed: 0.9,
    panSpeed: 0.65,
    dampingFactor: 0.06,
    enablePan: true,
    screenSpacePanning: false,
  },
  [SCENES.LOCAL_GROUP]: {
    minDistance: 60,
    maxDistance: 9000,
    minPolarAngle: EPS,
    maxPolarAngle: Math.PI - EPS,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    rotateSpeed: 0.7,
    zoomSpeed: 1.15,
    panSpeed: 0.85,
    dampingFactor: 0.065,
    enablePan: true,
    screenSpacePanning: false,
  },
  [SCENES.OBSERVABLE]: {
    minDistance: 100,
    maxDistance: 18000,
    minPolarAngle: EPS,
    maxPolarAngle: Math.PI - EPS,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    rotateSpeed: 0.72,
    zoomSpeed: 1.2,
    panSpeed: 0.9,
    dampingFactor: 0.07,
    enablePan: true,
    screenSpacePanning: false,
  },
  [SCENES.WORMHOLE]: {
    minDistance: 2,
    maxDistance: 40,
    minPolarAngle: EPS,
    maxPolarAngle: Math.PI - EPS,
    rotateSpeed: 0.55,
    zoomSpeed: 0.9,
    panSpeed: 0.4,
    dampingFactor: 0.05,
    enablePan: false,
    screenSpacePanning: false,
  },
};

export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
  };

  applyControlProfile(controls, SCENES.EARTH);
  return controls;
}

export function applyControlProfile(controls, sceneKey) {
  const profile = CONTROL_PROFILES[sceneKey] || CONTROL_PROFILES[SCENES.EARTH];

  controls.minDistance = profile.minDistance;
  controls.maxDistance = profile.maxDistance;
  controls.minPolarAngle = profile.minPolarAngle;
  controls.maxPolarAngle = profile.maxPolarAngle;
  controls.minAzimuthAngle = profile.minAzimuthAngle ?? -Infinity;
  controls.maxAzimuthAngle = profile.maxAzimuthAngle ?? Infinity;
  controls.rotateSpeed = profile.rotateSpeed;
  controls.zoomSpeed = profile.zoomSpeed;
  controls.panSpeed = profile.panSpeed ?? 0.5;
  controls.dampingFactor = profile.dampingFactor;
  controls.enablePan = profile.enablePan ?? true;
  controls.screenSpacePanning = profile.screenSpacePanning ?? false;
  controls.enableRotate = true;
}
