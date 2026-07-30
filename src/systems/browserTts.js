import { CHAT_VOICE } from '../config.js';

const FALLBACK = CHAT_VOICE.browserFallback || CHAT_VOICE;

function voiceLabel(voice) {
  return `${voice.name} ${voice.lang || ''}`.toLowerCase();
}

function matchesHints(label, hints = []) {
  return hints.some((hint) => label.includes(hint));
}

function isLikelyMale(voice) {
  return matchesHints(voiceLabel(voice), FALLBACK.avoidVoiceHints);
}

function isLikelyFemale(voice) {
  return matchesHints(voiceLabel(voice), FALLBACK.preferredVoiceHints);
}

function scoreVoice(voice) {
  const label = voiceLabel(voice);
  let score = 0;

  if (voice.lang?.toLowerCase().startsWith('it')) score += 20;
  if (isLikelyFemale(voice)) score += 28;
  if (matchesHints(label, FALLBACK.naturalVoiceHints)) score += 18;
  if (label.includes('google')) score += 8;
  if (label.includes('microsoft')) score += 6;
  if (voice.default) score += 1;
  if (isLikelyMale(voice)) score -= 80;
  if (matchesHints(label, FALLBACK.avoidVoiceHints)) score -= 40;

  return score;
}

function pickVoice(voices) {
  if (!voices.length) return null;

  const italian = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('it'));
  let pool = italian.length ? italian : voices;

  const notMale = pool.filter((voice) => !isLikelyMale(voice));
  if (notMale.length) pool = notMale;

  const female = pool.filter((voice) => isLikelyFemale(voice));
  if (female.length) pool = female;

  const naturalFemale = pool.filter((voice) => (
    isLikelyFemale(voice) && matchesHints(voiceLabel(voice), FALLBACK.naturalVoiceHints)
  ));
  if (naturalFemale.length) pool = naturalFemale;

  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
}

function splitSpeechChunks(text, maxLen = 320) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  if (normalized.length <= maxLen) return [normalized];

  const sentences = normalized.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [normalized];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const part = sentence.trim();
    if (!part) continue;
    const next = current ? `${current} ${part}` : part;
    if (next.length <= maxLen) {
      current = next;
      continue;
    }
    if (current) chunks.push(current);
    if (part.length <= maxLen) {
      current = part;
    } else {
      for (let i = 0; i < part.length; i += maxLen) {
        chunks.push(part.slice(i, i + maxLen));
      }
      current = '';
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function createBrowserTts() {
  let utterance = null;
  let speaking = false;
  let selectedVoice = null;
  let speakToken = 0;

  function isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  function refreshVoices() {
    if (!isSupported()) return [];
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) selectedVoice = pickVoice(voices);
    return voices;
  }

  if (isSupported()) {
    refreshVoices();
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
  }

  function stop() {
    if (!isSupported()) return;
    speakToken += 1;
    window.speechSynthesis.cancel();
    utterance = null;
    speaking = false;
  }

  function getVoiceName() {
    return selectedVoice?.name || 'guida italiana';
  }

  function getVoiceLabel() {
    return `Sistema · ${getVoiceName()}`;
  }

  function warmUp() {
    if (!isSupported()) return;
    refreshVoices();
    const probe = new SpeechSynthesisUtterance('');
    probe.volume = 0;
    window.speechSynthesis.speak(probe);
    window.speechSynthesis.cancel();
  }

  function speakChunk(text) {
    return new Promise((resolve, reject) => {
      const next = new SpeechSynthesisUtterance(text);
      if (selectedVoice) next.voice = selectedVoice;
      next.lang = FALLBACK.lang || CHAT_VOICE.lang;
      next.rate = FALLBACK.rate ?? CHAT_VOICE.rate;
      next.pitch = FALLBACK.pitch ?? CHAT_VOICE.pitch;
      next.volume = FALLBACK.volume ?? CHAT_VOICE.volume;

      next.onend = () => {
        utterance = null;
        resolve();
      };
      next.onerror = (event) => {
        utterance = null;
        reject(new Error(event.error || 'BROWSER_TTS_ERROR'));
      };

      utterance = next;
      window.speechSynthesis.speak(next);
    });
  }

  async function synthesize(text) {
    if (!isSupported()) throw new Error('BROWSER_TTS_UNSUPPORTED');

    const chunks = splitSpeechChunks(text);
    if (!chunks.length) return;

    stop();
    refreshVoices();
    speaking = true;
    const token = ++speakToken;

    try {
      for (const chunk of chunks) {
        if (token !== speakToken) return;
        await speakChunk(chunk);
      }
    } finally {
      if (token === speakToken) {
        speaking = false;
        utterance = null;
      }
    }
  }

  return {
    synthesize,
    stop,
    warmUp,
    isSupported,
    isSpeaking: () => speaking,
    getVoiceName,
    getVoiceLabel,
    splitSpeechChunks,
  };
}
