import { AUDIO, SCENES } from '../config.js';

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function normalizeSrc(src) {
  if (!src) return '';
  try {
    const url = new URL(src, window.location.origin);
    return url.pathname;
  } catch {
    return src.split('?')[0];
  }
}

function sameTrackSrc(a, b) {
  const na = normalizeSrc(a);
  const nb = normalizeSrc(b);
  return na && nb && na === nb;
}

export function createAudio() {
  let trackA = null;
  let trackB = null;
  let activeTrack = 'a';
  let crossfadeTimer = null;
  let warpCtx = null;
  let spatialCtx = null;
  let spatialGain = null;
  let enabled = false;
  let currentScene = SCENES.EARTH;
  let introPlayed = false;

  function createTrackElement() {
    const el = new Audio();
    el.loop = AUDIO.soundtrack.loop;
    el.preload = 'auto';
    return el;
  }

  function initTracks() {
    if (!trackA) trackA = createTrackElement();
    if (!trackB) trackB = createTrackElement();
    return activeTrack === 'a' ? trackA : trackB;
  }

  function getPlaylist(sceneKey) {
    return AUDIO.playlists?.[sceneKey] || AUDIO.soundtrack;
  }

  function getActive() {
    initTracks();
    return activeTrack === 'a' ? trackA : trackB;
  }

  function getInactive() {
    initTracks();
    return activeTrack === 'a' ? trackB : trackA;
  }

  function playlistVolume(playlist) {
    return playlist.volume ?? AUDIO.soundtrack.volume;
  }

  async function resume() {
    initTracks();
    if (warpCtx?.state === 'suspended') await warpCtx.resume();
  }

  function ensureWarpContext() {
    if (!warpCtx && typeof AudioContext !== 'undefined') {
      warpCtx = new AudioContext();
    }
    return warpCtx;
  }

  function ensureSpatialContext() {
    if (spatialCtx) return spatialCtx;
    if (typeof AudioContext === 'undefined') return null;
    spatialCtx = new AudioContext();
    spatialGain = spatialCtx.createGain();
    const spatialPanner = spatialCtx.createPanner();
    spatialPanner.panningModel = 'HRTF';
    spatialPanner.distanceModel = 'inverse';
    spatialPanner.refDistance = 1;
    spatialPanner.maxDistance = 50;
    spatialPanner.rolloffFactor = 1;
    spatialPanner.connect(spatialGain);
    spatialGain.connect(spatialCtx.destination);
    spatialGain.gain.value = 0.15;
    return spatialCtx;
  }

  function playSpatialTone({ frequency = 220, duration = 0.4, x = 0, y = 0, z = -2 } = {}) {
    const ctx = ensureSpatialContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.setPosition(x, y, z);
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(spatialGain);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.05);
  }

  async function crossfadeTo(src, targetVolume, { sceneKey } = {}) {
    initTracks();
    if (sceneKey) currentScene = sceneKey;

    const from = getActive();
    const to = getInactive();

    if (from.src && sameTrackSrc(from.src, src) && !from.paused) {
      from.volume = targetVolume;
      return;
    }

    to.src = src;
    to.volume = 0;
    to.currentTime = 0;

    if (enabled) {
      try {
        await to.play();
      } catch {
        return;
      }
    }

    const duration = AUDIO.crossfadeMs || 4000;
    const steps = 40;
    const fromStart = from.paused ? 0 : from.volume;
    let step = 0;

    clearInterval(crossfadeTimer);
    crossfadeTimer = setInterval(() => {
      step += 1;
      const t = easeInOutQuad(Math.min(1, step / steps));
      if (!from.paused) from.volume = fromStart * (1 - t);
      to.volume = targetVolume * t;
      if (step >= steps) {
        clearInterval(crossfadeTimer);
        from.pause();
        activeTrack = activeTrack === 'a' ? 'b' : 'a';
        getActive().volume = targetVolume;
      }
    }, duration / steps);
  }

  async function crossfadeToScene(sceneKey) {
    if (!AUDIO.playlists) {
      setSceneVolume(sceneKey);
      return;
    }

    const playlist = getPlaylist(sceneKey);
    await crossfadeTo(playlist.src, playlistVolume(playlist), { sceneKey });
  }

  /** Primo avvio: Cosmos (Vangelis); crossfade alla scena solo in navigazione */
  async function playIntroIfNeeded() {
    if (introPlayed || !AUDIO.playlists) return;
    introPlayed = true;
    enabled = true;

    const intro = AUDIO.soundtrack;
    await crossfadeTo(intro.src, playlistVolume(intro));
  }

  function setSceneVolume(sceneKey) {
    initTracks();
    currentScene = sceneKey;
    const playlist = getPlaylist(sceneKey);
    const track = getActive();
    const vol = playlistVolume(playlist);
    if (!track.src || !sameTrackSrc(track.src, playlist.src)) {
      track.src = playlist.src;
      track.currentTime = 0;
    }
    track.volume = vol;
    if (enabled && track.paused && track.src) {
      track.play().catch(() => {});
    }
  }

  async function toggle() {
    const track = initTracks();
    if (!track.src) {
      const playlist = getPlaylist(currentScene);
      track.src = playlist.src;
      track.volume = playlistVolume(playlist);
    }

    if (track.paused) {
      try {
        if (!introPlayed) {
          await playIntroIfNeeded();
        } else {
          await track.play();
        }
        enabled = true;
      } catch (err) {
        console.warn('Riproduzione audio bloccata dal browser:', err);
        enabled = false;
      }
    } else {
      trackA?.pause();
      trackB?.pause();
      enabled = false;
    }
    return enabled;
  }

  function playWarp() {
    const ctx = ensureWarpContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 200;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 2.5);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.8);
  }

  function isEnabled() {
    const track = getActive();
    return enabled && track && !track.paused;
  }

  function duck(factor = AUDIO.duckFactor ?? 0.28) {
    const track = getActive();
    if (!track) return;
    if (track._preDuckVolume == null) track._preDuckVolume = track.volume;
    track.volume = Math.max(0.02, track._preDuckVolume * factor);
  }

  function unduck() {
    const track = getActive();
    if (!track || track._preDuckVolume == null) return;
    track.volume = track._preDuckVolume;
    track._preDuckVolume = null;
  }

  function formatTrackLabel(playlist) {
    if (!playlist) return 'Colonna sonora';
    const artist = playlist.artist ? ` — ${playlist.artist}` : '';
    return `${playlist.title || 'Musica'}${artist}`;
  }

  return {
    init: initTracks,
    resume,
    setSceneVolume,
    crossfadeToScene,
    playIntroIfNeeded,
    playWarp,
    playSpatialTone,
    toggle,
    duck,
    unduck,
    isEnabled,
    getCurrentScene: () => currentScene,
    getTrackInfo: () => getPlaylist(currentScene),
    getTrackLabel: () => formatTrackLabel(getPlaylist(currentScene)),
  };
}
