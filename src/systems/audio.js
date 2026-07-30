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

function isBenignAudioError(err) {
  if (!err) return false;
  if (err.name === 'AbortError') return true;
  const message = String(err.message || err);
  return message.includes('aborted') || message.includes('interrupted');
}

function waitForCanPlay(el) {
  const minReady =
    typeof HTMLMediaElement !== 'undefined' ? HTMLMediaElement.HAVE_FUTURE_DATA : 3;
  if (el.readyState >= minReady) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(el.error || new Error('Caricamento audio non riuscito'));
    };
    const cleanup = () => {
      el.removeEventListener('canplay', onReady);
      el.removeEventListener('error', onError);
    };

    el.addEventListener('canplay', onReady, { once: true });
    el.addEventListener('error', onError, { once: true });
    el.load();
  });
}

export function createAudio() {
  let trackA = null;
  let trackB = null;
  let activeTrack = 'a';
  let crossfadeTimer = null;
  let crossfadeGeneration = 0;
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

  function clearCrossfadeTimer() {
    if (crossfadeTimer) {
      clearInterval(crossfadeTimer);
      crossfadeTimer = null;
    }
  }

  function cancelCrossfade() {
    crossfadeGeneration += 1;
    clearCrossfadeTimer();
  }

  async function prepareTrack(el, src) {
    if (!src) return;

    const needsNewSrc = !el.src || !sameTrackSrc(el.src, src);
    if (needsNewSrc) {
      el.pause();
      el.src = src;
      el.currentTime = 0;
    }

    await waitForCanPlay(el);
  }

  async function resume() {
    initTracks();
    const resumes = [];
    if (warpCtx?.state === 'suspended') resumes.push(warpCtx.resume());
    if (spatialCtx?.state === 'suspended') resumes.push(spatialCtx.resume());
    if (resumes.length) await Promise.all(resumes);
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

    const generation = ++crossfadeGeneration;
    clearCrossfadeTimer();

    try {
      await prepareTrack(to, src);
    } catch (err) {
      if (isBenignAudioError(err)) return;
      throw err;
    }

    if (generation !== crossfadeGeneration) return;

    to.volume = 0;
    if (!enabled) return;

    try {
      await to.play();
    } catch (err) {
      if (isBenignAudioError(err)) return;
      throw err;
    }

    if (generation !== crossfadeGeneration) {
      to.pause();
      return;
    }

    const duration = AUDIO.crossfadeMs || 4000;
    const steps = 40;
    const fromStart = from.paused ? 0 : from.volume;
    let step = 0;

    clearCrossfadeTimer();
    crossfadeTimer = setInterval(() => {
      if (generation !== crossfadeGeneration) {
        clearCrossfadeTimer();
        return;
      }

      step += 1;
      const t = easeInOutQuad(Math.min(1, step / steps));
      if (!from.paused) from.volume = fromStart * (1 - t);
      to.volume = targetVolume * t;
      if (step >= steps) {
        clearCrossfadeTimer();
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

    const intro = AUDIO.soundtrack;
    enabled = true;
    try {
      await crossfadeTo(intro.src, playlistVolume(intro));
      introPlayed = true;
    } catch (err) {
      enabled = false;
      throw err;
    }
  }

  function setSceneVolume(sceneKey) {
    initTracks();
    currentScene = sceneKey;
    const playlist = getPlaylist(sceneKey);
    const track = getActive();
    const vol = playlistVolume(playlist);
    if (!track.src || !sameTrackSrc(track.src, playlist.src)) {
      track.pause();
      track.src = playlist.src;
      track.currentTime = 0;
    }
    track.volume = vol;
    if (enabled && track.paused && track.src) {
      prepareTrack(track, playlist.src)
        .then(() => track.play())
        .catch((err) => {
          if (!isBenignAudioError(err)) {
            console.warn('Riproduzione audio bloccata dal browser:', err);
          }
        });
    }
  }

  async function toggle() {
    initTracks();
    const active = getActive();

    if (active.paused) {
      try {
        if (!introPlayed) {
          await playIntroIfNeeded();
        } else {
          enabled = true;
          const playlist = getPlaylist(currentScene);
          await prepareTrack(active, playlist.src);
          active.volume = playlistVolume(playlist);
          await active.play();
        }
      } catch (err) {
        if (!isBenignAudioError(err)) {
          console.warn('Riproduzione audio bloccata dal browser:', err);
        }
        enabled = false;
      }
    } else {
      cancelCrossfade();
      trackA?.pause();
      trackB?.pause();
      enabled = false;
    }
    return isEnabled();
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
    initTracks();
    return enabled && Boolean((trackA && !trackA.paused) || (trackB && !trackB.paused));
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
