import * as THREE from 'three';
import { COLORS } from '../config.js';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.cosmicBlack);
  scene.fog = new THREE.FogExp2(COLORS.cosmicBlack, 0.00006);
  scene.userData._fog = scene.fog;
  scene.userData._fogCosmic = new THREE.FogExp2(COLORS.cosmicBlack, 0.000014);

  const groups = {
    earth: new THREE.Group(),
    solarSystem: new THREE.Group(),
    milkyWay: new THREE.Group(),
    localGroup: new THREE.Group(),
    observable: new THREE.Group(),
    wormhole: new THREE.Group(),
    nebulae: new THREE.Group(),
    exoplanets: new THREE.Group(),
    extremeObjects: new THREE.Group(),
    famousStars: new THREE.Group(),
    labels: new THREE.Group(),
  };

  Object.values(groups).forEach((g) => scene.add(g));

  return { scene, groups };
}
