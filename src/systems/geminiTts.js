import { CHAT_VOICE, GEMINI } from '../config.js';

const TTS_MODELS = [
  CHAT_VOICE.geminiModel,
  ...CHAT_VOICE.geminiFallbackModels.filter((model) => model !== CHAT_VOICE.geminiModel),
];

function buildTtsUrl(model) {
  if (import.meta.env.DEV) {
    return `${GEMINI.proxyRoot}/models/${model}:generateContent`;
  }

  return `${GEMINI.apiRoot}/models/${model}:generateContent?key=${encodeURIComponent(GEMINI.apiKey)}`;
}

function parseSampleRate(mimeType = '') {
  const match = mimeType.match(/rate=(\d+)/i);
  return match ? Number(match[1]) : 24000;
}

function decodeBase64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function pcm16ToAudioBuffer(audioCtx, bytes, sampleRate) {
  const aligned = bytes.byteLength - (bytes.byteLength % 2);
  const pcm = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + aligned);
  const int16 = new Int16Array(pcm);
  const buffer = audioCtx.createBuffer(1, int16.length, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < int16.length; i += 1) {
    channel[i] = int16[i] / 32768;
  }

  return buffer;
}

function buildPayload(text) {
  return {
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        languageCode: CHAT_VOICE.geminiLang,
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: CHAT_VOICE.geminiVoice },
        },
      },
    },
  };
}

function extractAudioPart(json) {
  const parts = json.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) {
      return {
        data: inline.data,
        mimeType: inline.mimeType || inline.mime_type || 'audio/L16;rate=24000',
      };
    }
  }
  return null;
}

function parseRetryDelayMs(message = '') {
  const match = message.match(/retry in ([\d.]+)s/i);
  return match ? Math.ceil(Number(match[1]) * 1000) + 250 : 22000;
}

function normalizeTtsError(json, status, retryAfterHeader) {
  const message = json?.error?.message || `Gemini TTS ${status}`;
  if (
    status === 429 ||
    message === 'RATE_LIMIT_EXCEEDED' ||
    message.toLowerCase().includes('quota')
  ) {
    const err = new Error('QUOTA_EXCEEDED');
    const headerMs = Number(retryAfterHeader) * 1000;
    err.retryAfterMs = headerMs || parseRetryDelayMs(message) || 60_000;
    throw err;
  }
  throw new Error(message);
}

async function requestTts(model, text) {
  const response = await fetch(buildTtsUrl(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload(`${CHAT_VOICE.geminiPrompt}${text}`)),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    normalizeTtsError(json, response.status, response.headers.get('Retry-After'));
  }

  const audio = extractAudioPart(json);
  if (!audio) {
    const finish = json.candidates?.[0]?.finishReason;
    throw new Error(`Gemini TTS: audio mancante (${finish || 'nessun candidato'})`);
  }
  return audio;
}

  async function fetchAudio(text) {
  let lastError;
  for (const model of TTS_MODELS) {
    try {
      return await requestTts(model, text);
    } catch (err) {
      lastError = err;
      if (err.message === 'QUOTA_EXCEEDED') throw err;
      const lower = String(err.message).toLowerCase();
      if (!lower.includes('not found') && !lower.includes('not supported') && !lower.includes('audio mancante')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('Gemini TTS non disponibile');
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function createGeminiTts({ hasApiKey }) {
  let audioCtx = null;
  let userUnlocked = false;
  let currentSource = null;
  let speaking = false;
  let prefetchChain = Promise.resolve();
  let prefetchPausedUntil = 0;
  const rawCache = new Map();
  const bufferCache = new Map();
  const deferredDecode = new Map();
  const MAX_CACHE = 80;

  function unlock() {
    userUnlocked = true;
    if (!audioCtx && typeof AudioContext !== 'undefined') {
      audioCtx = new AudioContext();
    }
    if (audioCtx?.state === 'suspended') {
      void audioCtx.resume();
    }
    for (const cacheKey of [...deferredDecode.keys()]) {
      decodeDeferred(cacheKey);
    }
  }

  function ensureAudioContext() {
    if (!userUnlocked) return null;
    if (!audioCtx && typeof AudioContext !== 'undefined') {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  }

  function trimCache() {
    while (bufferCache.size > MAX_CACHE) {
      const oldest = bufferCache.keys().next().value;
      bufferCache.delete(oldest);
      rawCache.delete(oldest);
      deferredDecode.delete(oldest);
    }
  }

  function stopPlayback() {
    if (currentSource) {
      try {
        currentSource.stop();
      } catch {
        // already stopped
      }
      currentSource.disconnect();
      currentSource = null;
    }
    speaking = false;
  }

  function playBuffer(buffer) {
    const ctx = ensureAudioContext();
    if (!ctx) throw new Error('Web Audio API non disponibile');

    return new Promise((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        if (currentSource === source) currentSource = null;
        resolve();
      };
      currentSource = source;
      if (ctx.state === 'suspended') {
        ctx.resume().finally(() => source.start(0));
      } else {
        source.start(0);
      }
    });
  }

  async function decodeAndCache(cacheKey, audio) {
    const sampleRate = parseSampleRate(audio.mimeType);
    const bytes = decodeBase64ToBytes(audio.data);
    if (bytes.byteLength < 200) throw new Error('Gemini TTS: audio troppo corto');

    const ctx = ensureAudioContext();
    if (!ctx) {
      deferredDecode.set(cacheKey, { bytes, sampleRate });
      return null;
    }

    const buffer = pcm16ToAudioBuffer(ctx, bytes, sampleRate);
    bufferCache.set(cacheKey, buffer);
    deferredDecode.delete(cacheKey);
    trimCache();
    return buffer;
  }

  function decodeDeferred(cacheKey) {
    const pending = deferredDecode.get(cacheKey);
    if (!pending) return null;
    const ctx = ensureAudioContext();
    if (!ctx) return null;
    const buffer = pcm16ToAudioBuffer(ctx, pending.bytes, pending.sampleRate);
    bufferCache.set(cacheKey, buffer);
    deferredDecode.delete(cacheKey);
    trimCache();
    return buffer;
  }

  function pausePrefetch(ms = 60_000) {
    prefetchPausedUntil = Math.max(prefetchPausedUntil, Date.now() + ms);
  }

  function isPrefetchPaused() {
    return Date.now() < prefetchPausedUntil;
  }

  function handlePrefetchError(err) {
    if (err?.message === 'QUOTA_EXCEEDED') {
      pausePrefetch(err.retryAfterMs || 60_000);
    }
  }

  function queuePrefetch(task) {
    prefetchChain = prefetchChain
      .then(() => wait(CHAT_VOICE.geminiPrefetchGapMs || 350))
      .then(task)
      .catch((err) => {
        handlePrefetchError(err);
      });
  }

  function prefetch(text, cacheKey, { priority = false } = {}) {
    if ((!hasApiKey?.() && !import.meta.env.DEV) || !text?.trim() || !cacheKey) return;
    if (bufferCache.has(cacheKey) || rawCache.has(cacheKey)) return;
    if (isPrefetchPaused()) return;

    const job = async () => {
      const audio = await fetchAudio(text);
      if (userUnlocked) {
        await decodeAndCache(cacheKey, audio);
      } else {
        const sampleRate = parseSampleRate(audio.mimeType);
        const bytes = decodeBase64ToBytes(audio.data);
        if (bytes.byteLength < 200) throw new Error('Gemini TTS: audio troppo corto');
        deferredDecode.set(cacheKey, { bytes, sampleRate });
      }
      return audio;
    };

    const promise = new Promise((resolve, reject) => {
      queuePrefetch(async () => {
        try {
          resolve(await job());
        } catch (err) {
          reject(err);
        }
      });
    });

    rawCache.set(cacheKey, promise);
    promise.catch((err) => {
      rawCache.delete(cacheKey);
      bufferCache.delete(cacheKey);
      handlePrefetchError(err);
    });
  }

  function isReady(cacheKey) {
    return Boolean(cacheKey && (bufferCache.has(cacheKey) || deferredDecode.has(cacheKey)));
  }

  async function ensureBuffer(text, cacheKey) {
    if (cacheKey && bufferCache.has(cacheKey)) {
      return bufferCache.get(cacheKey);
    }

    if (cacheKey) {
      const deferred = decodeDeferred(cacheKey);
      if (deferred) return deferred;
    }

    if (cacheKey && rawCache.has(cacheKey)) {
      try {
        await rawCache.get(cacheKey);
        if (bufferCache.has(cacheKey)) return bufferCache.get(cacheKey);
        const deferred = decodeDeferred(cacheKey);
        if (deferred) return deferred;
      } catch {
        rawCache.delete(cacheKey);
      }
    }

    const audio = await fetchAudio(text);
    if (!cacheKey) {
      const ctx = ensureAudioContext();
      if (!ctx) throw new Error('Web Audio API non disponibile');
      const sampleRate = parseSampleRate(audio.mimeType);
      const bytes = decodeBase64ToBytes(audio.data);
      return pcm16ToAudioBuffer(ctx, bytes, sampleRate);
    }

    const buffer = await decodeAndCache(cacheKey, audio);
    if (buffer) return buffer;
    return decodeDeferred(cacheKey);
  }

  async function synthesize(text, _models, { cacheKey } = {}) {
    if (!hasApiKey?.() && !import.meta.env.DEV) throw new Error('API_KEY_MISSING');

    unlock();
    speaking = true;
    try {
      const ctx = ensureAudioContext();
      if (!ctx) throw new Error('Web Audio API non disponibile');
      if (ctx.state === 'suspended') await ctx.resume();

      if (cacheKey && bufferCache.has(cacheKey)) {
        await playBuffer(bufferCache.get(cacheKey));
        return;
      }

      const buffer = await ensureBuffer(text, cacheKey);
      if (!buffer) throw new Error('Gemini TTS: decodifica audio non disponibile');
      await playBuffer(buffer);
    } finally {
      speaking = false;
    }
  }

  return {
    synthesize,
    prefetch,
    isReady,
    unlock,
    stop: stopPlayback,
    isSupported: () => import.meta.env.DEV || Boolean(hasApiKey?.()),
    isSpeaking: () => speaking,
    setSpeaking(value) {
      speaking = Boolean(value);
    },
    getVoiceLabel: () => `Google · ${CHAT_VOICE.geminiVoice}`,
  };
}
