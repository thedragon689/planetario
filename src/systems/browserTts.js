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

export function createBrowserTts() {
  let utterance = null;
  let speaking = false;
  let selectedVoice = null;

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

  async function synthesize(text) {
    if (!isSupported()) throw new Error('BROWSER_TTS_UNSUPPORTED');

    const plain = String(text || '').trim();
    if (!plain) return;

    stop();
    refreshVoices();
    speaking = true;

    return new Promise((resolve, reject) => {
      const next = new SpeechSynthesisUtterance(plain);
      if (selectedVoice) next.voice = selectedVoice;
      next.lang = FALLBACK.lang || CHAT_VOICE.lang;
      next.rate = FALLBACK.rate ?? CHAT_VOICE.rate;
      next.pitch = FALLBACK.pitch ?? CHAT_VOICE.pitch;
      next.volume = FALLBACK.volume ?? CHAT_VOICE.volume;

      next.onend = () => {
        speaking = false;
        utterance = null;
        resolve();
      };
      next.onerror = (event) => {
        speaking = false;
        utterance = null;
        reject(new Error(event.error || 'BROWSER_TTS_ERROR'));
      };

      utterance = next;
      window.speechSynthesis.speak(next);
    });
  }

  return {
    synthesize,
    stop,
    warmUp,
    isSupported,
    isSpeaking: () => speaking,
    getVoiceName,
    getVoiceLabel,
  };
}
