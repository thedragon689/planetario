import * as THREE from 'three';

export function createWebXRManager(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement
) {
  let session: XRSession | null = null;

  async function enterVR() {
    if (!navigator.xr) throw new Error('WebXR non supportato');
    const supported = await navigator.xr.isSessionSupported('immersive-vr');
    if (!supported) throw new Error('VR non disponibile su questo dispositivo');

    session = await navigator.xr.requestSession('immersive-vr', {
      optionalFeatures: ['local-floor', 'bounded-floor'],
    });
    await renderer.xr.setSession(session);
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
    session.addEventListener('end', () => {
      session = null;
      renderer.setAnimationLoop(null);
    });
    return true;
  }

  async function enterAR() {
    if (!navigator.xr) throw new Error('WebXR non supportato');
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) throw new Error('AR non disponibile');

    session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: canvas.parentElement as HTMLElement },
    });
    await renderer.xr.setSession(session);
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
    session.addEventListener('end', () => {
      session = null;
      renderer.setAnimationLoop(null);
    });
    return true;
  }

  function exit() {
    session?.end();
  }

  function isActive() {
    return !!session;
  }

  renderer.xr.enabled = true;

  return { enterVR, enterAR, exit, isActive };
}

export async function checkWebXRSupport() {
  if (!navigator.xr) return { vr: false, ar: false };
  const [vr, ar] = await Promise.all([
    navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
    navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
  ]);
  return { vr, ar };
}
