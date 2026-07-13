import { CHAT_SYSTEM_PROMPT, GEMINI } from '../config.js';
import { buildChatContext } from './knowledgeBase.js';

const PLACEHOLDER_KEYS = new Set(['', 'la_tua_chiave_qui', 'la_tua_chiave']);

function isPlaceholderKey(key) {
  return PLACEHOLDER_KEYS.has(String(key || '').trim());
}

function buildGenerateUrl(model) {
  if (import.meta.env.DEV) {
    return `${GEMINI.proxyRoot}/models/${model}:generateContent`;
  }

  return `${GEMINI.apiRoot}/models/${model}:generateContent?key=${encodeURIComponent(GEMINI.apiKey)}`;
}

function normalizeApiError(message = '') {
  const lower = message.toLowerCase();

  if (lower.includes('api key not valid') || lower.includes('api_key_invalid')) {
    return 'API_KEY_INVALID';
  }
  if (lower.includes('not found') || lower.includes('is not supported')) {
    return 'MODEL_NOT_FOUND';
  }
  if (lower.includes('quota') || lower.includes('rate limit')) {
    return 'QUOTA_EXCEEDED';
  }

  return message;
}

async function requestGemini(model, payload) {
  const response = await fetch(buildGenerateUrl(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    const msg = json?.error?.message || `Gemini API ${response.status}`;
    const err = new Error(normalizeApiError(msg));
    err.status = response.status;
    err.rawMessage = msg;
    throw err;
  }

  return json;
}

export function createGeminiChat({ catalog, index }) {
  const history = [];
  let busy = false;

  function hasApiKey() {
    return !isPlaceholderKey(GEMINI.apiKey);
  }

  function clearHistory() {
    history.length = 0;
  }

  function getHistory() {
    return [...history];
  }

  async function sendMessage(userMessage, session = {}) {
    if (!hasApiKey()) {
      throw new Error(isPlaceholderKey(GEMINI.apiKey) ? 'API_KEY_PLACEHOLDER' : 'API_KEY_MISSING');
    }
    if (!userMessage?.trim()) {
      throw new Error('EMPTY_MESSAGE');
    }
    if (busy) {
      throw new Error('BUSY');
    }

    busy = true;

    try {
      const contextBlock = buildChatContext(catalog, index, userMessage, session);
      const systemInstruction = `${CHAT_SYSTEM_PROMPT}\n\n---\n\n${contextBlock}`;

      const contents = [
        ...history.map(({ role, text }) => ({
          role: role === 'user' ? 'user' : 'model',
          parts: [{ text }],
        })),
        {
          role: 'user',
          parts: [{ text: userMessage.trim() }],
        },
      ];

      const payload = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.65,
          topP: 0.9,
          maxOutputTokens: GEMINI.maxOutputTokens,
        },
      };

      const models = [GEMINI.model, ...GEMINI.fallbackModels.filter((m) => m !== GEMINI.model)];
      let json;
      let lastError;

      for (const model of models) {
        try {
          json = await requestGemini(model, payload);
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          if (err.message !== 'MODEL_NOT_FOUND') {
            throw err;
          }
        }
      }

      if (!json) {
        throw lastError || new Error('MODEL_NOT_FOUND');
      }

      const reply =
        json.candidates?.[0]?.content?.parts
          ?.map((p) => p.text)
          .filter(Boolean)
          .join('\n')
          ?.trim() || 'Mi dispiace, non sono riuscito a formulare una risposta.';

      history.push({ role: 'user', text: userMessage.trim() });
      history.push({ role: 'model', text: reply });

      while (history.length > GEMINI.maxHistory * 2) {
        history.splice(0, 2);
      }

      return reply;
    } finally {
      busy = false;
    }
  }

  return {
    sendMessage,
    clearHistory,
    getHistory,
    hasApiKey,
    isBusy: () => busy,
    getModel: () => GEMINI.model,
  };
}
