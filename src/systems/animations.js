import gsap from 'gsap';

/** Normalize selectors, NodeLists, and arrays into GSAP-safe element arrays. */
export function gsapTargets(target) {
  if (!target) return [];
  return gsap.utils.toArray(target);
}

export function createAnimationLoop(callback) {
  const callbacks = Array.isArray(callback) ? callback : [callback];
  const clock = { elapsed: 0, delta: 0, last: performance.now() };

  function tick(now) {
    clock.delta = (now - clock.last) / 1000;
    clock.last = now;
    clock.elapsed += clock.delta;

    callbacks.forEach((cb) => cb(clock.elapsed, clock.delta));
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
  return clock;
}

export function animateRotation(object, speed, axis = 'y') {
  return gsap.to(object.rotation, {
    [axis]: `+=${Math.PI * 2}`,
    duration: speed,
    repeat: -1,
    ease: 'none',
  });
}

import { orbitAngleRad } from './ephemeris.js';

/** Rivoluzione e rotazione dei pianeti attorno al Sole. */
export function animatePlanets(planets, delta, options = {}) {
  const { useEphemeris, simulationDate } = options;
  planets.forEach((p) => {
    p.mesh.rotation.y += p.data.rotationSpeed * delta;
    if (useEphemeris && simulationDate) {
      p.orbitGroup.rotation.y = orbitAngleRad(p.data.id, simulationDate);
    } else {
      p.orbitGroup.rotation.y += p.data.orbitSpeed * delta;
    }
  });
}

/** Rivoluzione e rotazione delle lune attorno al pianeta genitore. */
export function animateMoons(moons, delta) {
  moons.forEach((m) => {
    m.mesh.rotation.y += m.data.rotationSpeed * delta;
    m.orbitGroup.rotation.y += m.data.orbitSpeed * delta;
  });
}

/** Plasma solare animato nello shader volumetrico. */
export function animateSun(sun, time) {
  if (sun.material?.uniforms?.uTime) {
    sun.material.uniforms.uTime.value = time;
  }
}

/** Aggiorna il noise temporale degli anelli di Saturno. */
export function animateSaturnRings(planets, time) {
  planets.forEach((p) => {
    if (p.rings?.material?.uniforms?.uTime) {
      p.rings.material.uniforms.uTime.value = time;
    }
  });
}

export function pulseEmissive(material, min = 0.2, max = 0.8, duration = 2) {
  return gsap.to(material, {
    emissiveIntensity: max,
    duration,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    onUpdate: () => {
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = min + (max - min) * material.emissiveIntensity;
      }
    },
  });
}

export function fadeIn(element, duration = 1) {
  return gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration, ease: 'power2.out' });
}

export function slideIn(element, direction = 'left', duration = 0.8) {
  const from = { opacity: 0 };
  if (direction === 'left') from.x = -60;
  else if (direction === 'right') from.x = 60;
  else if (direction === 'up') from.y = -40;
  else from.y = 40;

  return gsap.fromTo(element, from, { opacity: 1, x: 0, y: 0, duration, ease: 'power3.out' });
}
