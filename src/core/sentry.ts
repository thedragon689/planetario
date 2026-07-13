import * as Sentry from '@sentry/browser';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,
    beforeSend(event) {
      if (import.meta.env.DEV) return null;
      return event;
    },
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.captureException(error, { extra: context });
}
