import { GEMINI } from '../config.js';
import { buildChatContext } from './knowledgeBase.js';
import type { ChatSession } from '../types/catalog.js';

const QUIZ_PROMPT = `Genera un quiz di 3 domande a risposta multipla sul catalogo astronomico fornito.
Rispondi SOLO con JSON valido (nessun markdown) nel formato:
{
  "questions": [
    {
      "id": "q1",
      "question": "testo domanda",
      "choices": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "spiegazione breve basata sul catalogo"
    }
  ]
}
Le risposte errate devono essere plausibili ma sbagliate secondo il catalogo.
Difficoltà richiesta: {DIFFICULTY}.`;

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface GeminiQuizDeps {
  gemini: { hasApiKey: () => boolean; getModel: () => string };
  catalog: string;
  index: { title: string; text: string }[];
}

function buildQuizUrl(model: string) {
  if (GEMINI.useProxy) {
    return `${GEMINI.proxyRoot}/models/${model}:generateContent`;
  }
  return `${GEMINI.apiRoot}/models/${model}:generateContent?key=${encodeURIComponent(GEMINI.apiKey)}`;
}

function parseQuizJson(text: string): QuizQuestion[] {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('QUIZ_PARSE_ERROR');
  const data = JSON.parse(match[0]) as { questions?: QuizQuestion[] };
  if (!Array.isArray(data.questions) || !data.questions.length) {
    throw new Error('QUIZ_EMPTY');
  }
  return data.questions.map((q, i) => ({
    id: q.id || `q${i + 1}`,
    question: String(q.question || ''),
    choices: (q.choices || []).map(String).slice(0, 4),
    correctIndex: Number(q.correctIndex) || 0,
    explanation: String(q.explanation || ''),
  }));
}

export function createGeminiQuiz({ gemini, catalog, index }: GeminiQuizDeps) {
  let currentQuiz: QuizQuestion[] | null = null;
  let score = 0;
  let answered = 0;

  async function generateQuiz(session: ChatSession, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    if (!gemini.hasApiKey()) throw new Error('API_KEY_MISSING');

    const prompt = QUIZ_PROMPT.replace('{DIFFICULTY}', difficulty);
    const context = buildChatContext(catalog, index, 'quiz sulla scena attuale', session);
    const payload = {
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\n${context}` }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    };

    const response = await fetch(buildQuizUrl(gemini.getModel()), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(json?.error?.message || `Gemini ${response.status}`);
    }

    const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    currentQuiz = parseQuizJson(text);
    score = 0;
    answered = 0;
    return currentQuiz;
  }

  function getCurrentQuiz() {
    return currentQuiz;
  }

  function answerQuestion(questionId: string, choiceIndex: number) {
    const q = currentQuiz?.find((item) => item.id === questionId);
    if (!q) return null;
    const correct = choiceIndex === q.correctIndex;
    answered += 1;
    if (correct) score += 1;
    return {
      correct,
      explanation: q.explanation,
      score,
      total: currentQuiz!.length,
      answered,
    };
  }

  function reset() {
    currentQuiz = null;
    score = 0;
    answered = 0;
  }

  return { generateQuiz, getCurrentQuiz, answerQuestion, reset };
}
