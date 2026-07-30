import { loadEnv } from 'vite';
import https from 'node:https';
import { URL } from 'node:url';

const GEMINI_ORIGIN = 'https://generativelanguage.googleapis.com';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 80;

function createRateLimiter(max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const bucket = hits.get(key) || [];
    const recent = bucket.filter((t) => now - t < windowMs);
    if (recent.length >= max) return false;
    recent.push(now);
    hits.set(key, recent);
    return true;
  };
}

function resolveApiKey(env = {}) {
  return String(env.VITE_GOOGLE_AI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY || '').trim();
}

function geminiRequest(targetUrl, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const req = https.request(
      {
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(body?.length ? { 'Content-Length': body.length } : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 502,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.on('error', reject);
    if (body?.length) req.write(body);
    req.end();
  });
}

function createGeminiProxyMiddleware(getApiKey) {
  const allowRequest = createRateLimiter();

  return (req, res, next) => {
    if (!req.url?.startsWith('/api/gemini/')) {
      next();
      return;
    }

    const clientKey = req.socket?.remoteAddress || 'local';
    if (!allowRequest(clientKey)) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Retry-After', '60');
      res.end(JSON.stringify({ error: { message: 'RATE_LIMIT_EXCEEDED' } }));
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey || apiKey === 'la_tua_chiave_qui') {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: { message: 'API_KEY_MISSING' } }));
      return;
    }

    const targetPath = req.url.replace('/api/gemini', '/v1beta');
    const targetUrl = `${GEMINI_ORIGIN}${targetPath}?key=${encodeURIComponent(apiKey)}`;
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      const body = Buffer.concat(chunks);

      try {
        const response = await geminiRequest(targetUrl, req.method, body);
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(response.body);
      } catch (err) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: { message: err.message } }));
      }
    });
  };
}

export function geminiProxy(mode = 'development') {
  const bootEnv = loadEnv(mode, process.cwd(), 'VITE_');
  let getApiKey = () => resolveApiKey(bootEnv);

  return {
    name: 'gemini-proxy',
    configureServer(server) {
      getApiKey = () => resolveApiKey(server.config.env);
      server.middlewares.use(createGeminiProxyMiddleware(() => getApiKey()));
    },
    configurePreviewServer(server) {
      getApiKey = () => resolveApiKey(server.config.env);
      server.middlewares.use(createGeminiProxyMiddleware(() => getApiKey()));
    },
  };
}
