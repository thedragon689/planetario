import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * vec2(offset);
      float vig = 1.0 - dot(uv, uv);
      vig = clamp(pow(vig, darkness), 0.0, 1.0);
      gl_FragColor = vec4(color.rgb * vig, color.a);
    }
  `,
};

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.0015 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec2 dir = vUv - 0.5;
      float r = texture2D(tDiffuse, vUv + dir * amount).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * amount).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

const MotionBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    velocity: { value: new THREE.Vector2(0, 0) },
    intensity: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 velocity;
    uniform float intensity;
    varying vec2 vUv;
    void main() {
      vec4 sum = vec4(0.0);
      float samples = 8.0;
      for (float i = 0.0; i < 8.0; i++) {
        vec2 offset = velocity * (i / samples - 0.5) * intensity;
        sum += texture2D(tDiffuse, vUv + offset);
      }
      gl_FragColor = sum / samples;
    }
  `,
};

const GodRaysShader = {
  uniforms: {
    tDiffuse: { value: null },
    uLightPos: { value: new THREE.Vector2(0.5, 0.5) },
    uExposure: { value: 0.35 },
    uDecay: { value: 0.96 },
    uDensity: { value: 0.85 },
    uWeight: { value: 0.45 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uLightPos;
    uniform float uExposure;
    uniform float uDecay;
    uniform float uDensity;
    uniform float uWeight;
    varying vec2 vUv;
    void main() {
      vec2 delta = uLightPos - vUv;
      vec2 step = delta * uDensity / 32.0;
      vec2 coord = vUv;
      float illumination = 0.0;
      float decay = 1.0;
      for (int i = 0; i < 32; i++) {
        coord += step;
        vec3 sampleColor = texture2D(tDiffuse, coord).rgb;
        illumination += dot(sampleColor, vec3(0.299, 0.587, 0.114)) * decay * uWeight;
        decay *= uDecay;
      }
      vec3 base = texture2D(tDiffuse, vUv).rgb;
      gl_FragColor = vec4(base + vec3(1.0, 0.85, 0.5) * illumination * uExposure, 1.0);
    }
  `,
};

export function createPostProcessing(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms.resolution.value.set(1 / size.x, 1 / size.y);
  composer.addPass(fxaaPass);

  const smaaPass = new SMAAPass(size.x * renderer.getPixelRatio(), size.y * renderer.getPixelRatio());
  composer.addPass(smaaPass);

  const bokehPass = new BokehPass(scene, camera, {
    focus: 10,
    aperture: 0.00015,
    maxblur: 0.01,
  });
  composer.addPass(bokehPass);

  const bloomPass = new UnrealBloomPass(size, 0.8, 0.4, 0.85);
  composer.addPass(bloomPass);

  const filmPass = new FilmPass(0.15, 0.025, 648, false);
  composer.addPass(filmPass);

  const vignettePass = new ShaderPass(VignetteShader);
  composer.addPass(vignettePass);

  const chromaPass = new ShaderPass(ChromaticAberrationShader);
  composer.addPass(chromaPass);

  const godRaysPass = new ShaderPass(GodRaysShader);
  godRaysPass.enabled = false;
  composer.addPass(godRaysPass);

  const motionBlurPass = new ShaderPass(MotionBlurShader);
  composer.addPass(motionBlurPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  const state = { sceneKey: 'earth', qualityLevel: 'high' };

  return {
    composer,
    passes: {
      renderPass,
      fxaaPass,
      smaaPass,
      bokehPass,
      bloomPass,
      filmPass,
      vignettePass,
      chromaPass,
      godRaysPass,
      motionBlurPass,
      outputPass,
    },
    setSceneProfile(sceneKey) {
      state.sceneKey = sceneKey;
      const isDirect = sceneKey === 'earth' || sceneKey === 'solar_system';
      const isCosmicOverview = sceneKey === 'local_group' || sceneKey === 'observable' || sceneKey === 'milky_way' || sceneKey === 'exoplanets' || sceneKey === 'extreme_objects';
      const isWormhole = sceneKey === 'wormhole';
      bokehPass.enabled = !isDirect && !isCosmicOverview && !isWormhole;
      motionBlurPass.enabled = !isDirect || isWormhole;
      chromaPass.enabled = !isDirect || isWormhole;
      filmPass.enabled = (!isDirect && !isCosmicOverview) || isWormhole;
      bloomPass.enabled = sceneKey !== 'earth';
      godRaysPass.enabled = sceneKey === 'solar_system';
      smaaPass.enabled = !isDirect;
      fxaaPass.enabled = isDirect;
      vignettePass.enabled = (!isDirect && !isCosmicOverview) || isWormhole;
      if (isWormhole) {
        bloomPass.strength = 1.85;
        chromaPass.uniforms.amount.value = 0.0045;
        motionBlurPass.uniforms.intensity.value = 0.22;
        filmPass.uniforms.intensity.value = 0.22;
        vignettePass.uniforms.darkness.value = 1.35;
        vignettePass.uniforms.offset.value = 1.05;
      } else if (isCosmicOverview) {
        vignettePass.uniforms.darkness.value = 0.65;
        vignettePass.uniforms.offset.value = 1.15;
      } else {
        vignettePass.uniforms.darkness.value = 1.2;
        vignettePass.uniforms.offset.value = 1.0;
      }
      bloomPass.strength = sceneKey === 'solar_system' ? 0.45 : (isCosmicOverview ? 1.25 : 0.8);
    },
    isEarthView() {
      if (state.sceneKey === 'earth' || state.sceneKey === 'solar_system') return true;
      if (state.qualityLevel === 'low') return true;
      return false;
    },
    setQuality(level) {
      state.qualityLevel = level;
      const presets = {
        high: { bloom: 0.9, film: 0.15, dof: 0.01, smaa: true, fxaa: false, chroma: 0.0015 },
        medium: { bloom: 0.6, film: 0.1, dof: 0.006, smaa: true, fxaa: false, chroma: 0.001 },
        low: { bloom: 0.35, film: 0, dof: 0, smaa: false, fxaa: true, chroma: 0 },
      };
      const settings = presets[level] || presets.medium;

      bloomPass.strength = settings.bloom * (state.sceneKey === 'local_group' || state.sceneKey === 'observable' || state.sceneKey === 'milky_way' || state.sceneKey === 'exoplanets' || state.sceneKey === 'extreme_objects' ? 1.35 : 1);
      bokehPass.enabled = level !== 'low' && state.sceneKey !== 'earth' && state.sceneKey !== 'solar_system'
        && state.sceneKey !== 'local_group' && state.sceneKey !== 'observable' && state.sceneKey !== 'milky_way' && state.sceneKey !== 'exoplanets' && state.sceneKey !== 'extreme_objects';
      filmPass.enabled = level !== 'low' && state.sceneKey !== 'earth' && state.sceneKey !== 'solar_system';
      chromaPass.enabled = level !== 'low' && state.sceneKey !== 'earth' && state.sceneKey !== 'solar_system';
      motionBlurPass.enabled = level !== 'low' && state.sceneKey !== 'earth' && state.sceneKey !== 'solar_system';
      vignettePass.enabled = level !== 'low' && state.sceneKey !== 'earth' && state.sceneKey !== 'solar_system';
      smaaPass.enabled = settings.smaa && state.sceneKey !== 'earth' && state.sceneKey !== 'solar_system';
      fxaaPass.enabled = settings.fxaa || state.sceneKey === 'earth' || state.sceneKey === 'solar_system';

      if (state.sceneKey !== 'earth' && state.sceneKey !== 'solar_system') {
        if (filmPass.enabled) filmPass.uniforms.intensity.value = settings.film;
        if (bokehPass.enabled) bokehPass.uniforms.maxblur.value = settings.dof;
        if (chromaPass.enabled) chromaPass.uniforms.amount.value = settings.chroma;
      }
    },
    shouldUseComposer() {
      if (state.sceneKey === 'earth' || state.sceneKey === 'solar_system') return false;
      if (state.qualityLevel === 'low') return false;
      return true;
    },
    setMotionBlur(intensity, velocity = new THREE.Vector2(0, 0)) {
      motionBlurPass.uniforms.intensity.value = intensity;
      motionBlurPass.uniforms.velocity.value.copy(velocity);
    },
    setBloomStrength(strength) {
      bloomPass.strength = strength;
    },
    setSunScreenPosition(ndc = new THREE.Vector3()) {
      godRaysPass.uniforms.uLightPos.value.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);
    },
    setFocus(focus, maxblur) {
      bokehPass.uniforms.focus.value = focus;
      if (maxblur !== undefined) bokehPass.uniforms.maxblur.value = maxblur;
    },
    resize(width, height, pixelRatio) {
      composer.setSize(width, height);
      fxaaPass.material.uniforms.resolution.value.set(1 / width, 1 / height);
      smaaPass.setSize(width * pixelRatio, height * pixelRatio);
      bloomPass.resolution.set(width, height);
    },
  };
}
