import { GEMINI, CHAT_SYSTEM_PROMPT } from '../config.js';
import { buildChatContext } from './knowledgeBase.js';

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiGenerateResponse {
  candidates?: GeminiCandidate[];
}

function buildGenerateUrl(model: string) {
  if (import.meta.env.DEV) {
    return `${GEMINI.proxyRoot}/models/${model}:generateContent`;
  }
  return `${GEMINI.apiRoot}/models/${model}:generateContent?key=${encodeURIComponent(GEMINI.apiKey)}`;
}

async function requestGemini(model: string, payload: object) {
  const response = await fetch(buildGenerateUrl(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json?.error?.message || `Gemini API ${response.status}`);
  return json;
}

function extractText(json: GeminiGenerateResponse) {
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n')?.trim()
    || 'Analisi non disponibile.';
}

export async function analyzeAstronomyImage(
  imageBase64: string,
  mimeType: string,
  userPrompt: string,
  session: Record<string, unknown> = {},
  catalog?: unknown,
  index?: unknown
) {
  const context = catalog && index
    ? buildChatContext(catalog, index, userPrompt || 'identifica oggetti', session)
    : '';
  const systemInstruction = `${CHAT_SYSTEM_PROMPT}\n\nAnalizza l'immagine astronomica caricata. Identifica oggetti celesti, stima tipo e costellazione se possibile. Confronta con il catalogo se pertinente.\n\n${context}`;

  const payload = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{
      role: 'user',
      parts: [
        { text: userPrompt || 'Cosa vedi in questa immagine astronomica?' },
        { inlineData: { mimeType, data: imageBase64.replace(/^data:[^;]+;base64,/, '') } },
      ],
    }],
    generationConfig: { temperature: 0.4, maxOutputTokens: GEMINI.maxOutputTokens },
  };

  const models = [GEMINI.model, ...GEMINI.fallbackModels.filter((m) => m !== GEMINI.model)];
  for (const model of models) {
    try {
      const json = await requestGemini(model, payload);
      return extractText(json);
    } catch (err) {
      if ((err as Error).message?.includes('not found')) continue;
      throw err;
    }
  }
  throw new Error('MODEL_NOT_FOUND');
}

export type CreativeKind = 'story' | 'haiku' | 'whatif' | 'translate';

const CREATIVE_PROMPTS: Record<CreativeKind, string> = {
  story: 'Scrivi una breve storia per bambini (8-10 anni) ispirata all\'oggetto celeste in focus. Massimo 150 parole, tono meravigliato.',
  haiku: 'Scrivi un haiku in italiano (5-7-5 sillabe) ispirato all\'oggetto celeste in focus.',
  whatif: 'Proponi un ipotesi scientifica "e se..." plausibile legata all\'oggetto in focus. Spiega conseguenze in 2 paragrafi brevi.',
  translate: 'Traduci la richiesta dell\'utente nella lingua indicata mantenendo precisione astronomica.',
};

export async function generateCreativeContent(
  kind: CreativeKind,
  objectName: string,
  extra = '',
  session: Record<string, unknown> = {},
  catalog?: unknown,
  index?: unknown
) {
  const base = CREATIVE_PROMPTS[kind];
  const context = catalog && index
    ? buildChatContext(catalog, index, objectName, session)
    : '';
  const prompt = `${base}\n\nOggetto: ${objectName}\n${extra}`;

  const payload = {
    systemInstruction: { parts: [{ text: `${CHAT_SYSTEM_PROMPT}\n\n${context}` }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: GEMINI.maxOutputTokens },
  };

  const json = await requestGemini(GEMINI.model, payload);
  return extractText(json);
}
