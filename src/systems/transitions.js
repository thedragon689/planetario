import gsap from 'gsap';
import * as THREE from 'three';
import { CAMERA_PRESETS } from '../core/camera.js';
import { TRANSITION } from '../config.js';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createTransitions(camera, controls, postFX, onPhaseChange, onProgress) {
  let active = false;
  let tween = null;

  function releaseControls() {
    controls.enabled = true;
    active = false;
    postFX?.setMotionBlur(0);
  }

  function getTargetVectors(sceneKey) {
    const preset = CAMERA_PRESETS[sceneKey];
    if (!preset) return null;
    return {
      position: new THREE.Vector3(...preset.position),
      target: new THREE.Vector3(...preset.target),
      fov: preset.fov,
    };
  }

  function transitionTo(sceneKey, options = {}) {
    if (active) return Promise.resolve(false);

    const target = getTargetVectors(sceneKey);
    if (!target) return Promise.resolve(false);

    active = true;
    const reduced = prefersReducedMotion();
    const duration = reduced ? 0.01 : (options.duration ?? TRANSITION.duration);
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startFov = camera.fov;

    controls.enabled = false;
    if (!reduced) postFX?.setMotionBlur(0.4, new THREE.Vector2(0.002, 0));

    return new Promise((resolve) => {
      const proxy = { t: 0 };
      tween = gsap.to(proxy, {
        t: 1,
        duration,
        ease: reduced ? 'none' : TRANSITION.ease,
        onUpdate: () => {
          camera.position.lerpVectors(startPos, target.position, proxy.t);
          controls.target.lerpVectors(startTarget, target.target, proxy.t);
          camera.fov = THREE.MathUtils.lerp(startFov, target.fov, proxy.t);
          camera.updateProjectionMatrix();
          controls.update();
          onProgress?.({ progress: proxy.t, sceneKey, active: true });

          if (!reduced) {
            const blur = 0.4 * (1 - Math.abs(proxy.t - 0.5) * 2);
            postFX?.setMotionBlur(blur, new THREE.Vector2(0.002 * proxy.t, 0.001));
          }
        },
        onComplete: () => {
          releaseControls();
          onProgress?.({ progress: 1, sceneKey, active: false });
          onPhaseChange?.(sceneKey);
          resolve(true);
        },
        onInterrupt: () => {
          releaseControls();
          onProgress?.({ progress: 0, sceneKey, active: false });
          resolve(false);
        },
      });
    });
  }

  function focusOnObject(object, distance = 3) {
    if (active || !object) return Promise.resolve(false);
    active = true;
    controls.enabled = false;

    const reduced = prefersReducedMotion();
    const worldPos = new THREE.Vector3();
    object.getWorldPosition(worldPos);

    const dir = camera.position.clone().sub(worldPos).normalize();
    if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
    const targetPos = worldPos.clone().add(dir.multiplyScalar(distance));
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();

    return new Promise((resolve) => {
      const proxy = { t: 0 };
      tween = gsap.to(proxy, {
        t: 1,
        duration: reduced ? 0.01 : 2,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.position.lerpVectors(startPos, targetPos, proxy.t);
          controls.target.lerpVectors(startTarget, worldPos, proxy.t);
          controls.update();
        },
        onComplete: () => {
          releaseControls();
          resolve(true);
        },
        onInterrupt: () => {
          releaseControls();
          resolve(false);
        },
      });
    });
  }

  function resetToScene(sceneKey) {
    return transitionTo(sceneKey, { duration: prefersReducedMotion() ? 0.01 : 1.8 });
  }

  return {
    transitionTo,
    focusOnObject,
    resetToScene,
    isActive: () => active,
  };
}
