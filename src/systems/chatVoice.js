import { CHAT_VOICE } from '../config.js';
import { createGeminiTts } from './geminiTts.js';
import { createBrowserTts } from './browserTts.js';

function stripForSpeech(text) {
  return String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createChatVoice({ onSpeakStart, onSpeakEnd, hasApiKey } = {}) {
  let enabled = true;
  let speaking = false;
  let queueToken = 0;
  let lastError = null;
  let activeProvider = 'google';
  let geminiCooldownUntil = 0;

  const geminiTts = createGeminiTts({ hasApiKey });
  const browserTts = createBrowserTts();

  function markGeminiCooldown(ms = 60_000) {
    geminiCooldownUntil = Math.max(geminiCooldownUntil, Date.now() + ms);
  }

  function googleAvailable() {
    if (Date.now() < geminiCooldownUntil) return false;
    return import.meta.env.DEV || geminiTts.isSupported();
  }

  function browserAvailable() {
    return browserTts.isSupported();
  }

  function voiceAvailable() {
    return googleAvailable() || browserAvailable();
  }

  function stop() {
    queueToken += 1;
    speaking = false;
    geminiTts.stop();
    browserTts.stop();
    onSpeakEnd?.();
  }

  function prefetchGoogle(text, cacheKey, { priority = false } = {}) {
    const plain = stripForSpeech(text);
    if (!plain || !enabled || !googleAvailable()) return;
    geminiTts.prefetch(plain, cacheKey, { priority });
  }

  function isCached(cacheKey) {
    return geminiTts.isReady(cacheKey);
  }

  function getLastError() {
    return lastError;
  }

  function getVoiceName() {
    return activeProvider === 'browser'
      ? browserTts.getVoiceName()
      : CHAT_VOICE.geminiVoice;
  }

  function getVoiceLabel() {
    return activeProvider === 'browser'
      ? browserTts.getVoiceLabel()
      : geminiTts.getVoiceLabel();
  }

  async function speakBrowserInternal(text) {
    if (!browserAvailable()) {
      lastError = new Error('BROWSER_TTS_UNSUPPORTED');
      throw lastError;
    }
    activeProvider = 'browser';
    await browserTts.synthesize(text);
  }

  async function speakGoogle(text, { cacheKey, allowFallback = true } = {}) {
    if (!enabled) return;

    const plain = stripForSpeech(text);
    if (!plain) return;

    const token = ++queueToken;
    stop();
    queueToken = token;
    speaking = true;
    geminiTts.setSpeaking(true);
    lastError = null;

    const cached = cacheKey && geminiTts.isReady(cacheKey);
    if (!cached) onSpeakStart?.();

    try {
      if (googleAvailable()) {
        try {
          await geminiTts.synthesize(plain, null, { cacheKey });
          activeProvider = 'google';
          return;
        } catch (err) {
          lastError = err;
          markGeminiCooldown(err?.retryAfterMs || 60_000);

          if (!allowFallback || !browserAvailable()) {
            throw err;
          }

          console.info('[Planetario] Gemini TTS non disponibile, uso voce browser:', err.message);
        }
      } else if (!allowFallback || !browserAvailable()) {
        lastError = new Error('API_KEY_MISSING');
        throw lastError;
      }

      if (token !== queueToken) return;
      await speakBrowserInternal(plain);
    } finally {
      if (token === queueToken) {
        speaking = false;
        geminiTts.setSpeaking(false);
        onSpeakEnd?.();
      }
    }
  }

  async function speak(text, options = {}) {
    await speakGoogle(text, options);
  }

  function toggle() {
    enabled = !enabled;
    if (!enabled) stop();
    return enabled;
  }

  return {
    speak,
    speakGoogle,
    prefetchGoogle,
    isCached,
    getLastError,
    stop,
    toggle,
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) stop();
      return enabled;
    },
    warmUp() {
      browserTts.warmUp();
    },
    isEnabled: () => enabled,
    isSupported: () => voiceAvailable(),
    isGoogleAvailable: () => googleAvailable(),
    isBrowserAvailable: () => browserAvailable(),
    isSpeaking: () => speaking,
    getVoiceName,
    getVoiceLabel,
    usesGoogleVoice: () => activeProvider === 'google',
    usesFallbackVoice: () => activeProvider === 'browser',
    getActiveProvider: () => activeProvider,
  };
}
