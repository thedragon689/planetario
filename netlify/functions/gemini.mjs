const GEMINI_ORIGIN = 'https://generativelanguage.googleapis.com';

function resolveApiKey() {
  return String(
    process.env.GOOGLE_AI_API_KEY ||
      process.env.VITE_GOOGLE_AI_API_KEY ||
      ''
  ).trim();
}

export async function handler(event) {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = resolveApiKey();
  if (!apiKey || apiKey === 'la_tua_chiave_qui') {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'API_KEY_MISSING' } }),
    };
  }

  const path = String(event.path || '')
    .replace(/^\/\.netlify\/functions\/gemini/, '')
    .replace(/^\/api\/gemini/, '');
  const targetUrl = `${GEMINI_ORIGIN}/v1beta${path}?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: event.httpMethod === 'POST' ? event.body : undefined,
    });
    const text = await response.text();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: err.message || 'GEMINI_PROXY_ERROR' } }),
    };
  }
}
