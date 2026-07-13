import { loadEnv } from 'vite';

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
        const response = await fetch(targetUrl, {
          method: req.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body.length ? body : undefined,
        });

        const text = await response.text();
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(text);
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
