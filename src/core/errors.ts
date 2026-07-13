import { APP_EVENTS } from '../types/events.js';
import type { EventBus } from './eventBus.js';

export class AppError extends Error {
  readonly recoverable: boolean;
  readonly code?: string;

  constructor(message: string, { recoverable = true, code }: { recoverable?: boolean; code?: string } = {}) {
    super(message);
    this.name = 'AppError';
    this.recoverable = recoverable;
    this.code = code;
  }
}

/**
 * Esegue un'operazione async con fallback e notifica UX opzionale.
 */
export async function withFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  { label = 'operazione', eventBus }: { label?: string; eventBus?: EventBus } = {}
): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`${label} fallita:`, message);
    eventBus?.emit(APP_EVENTS.ERROR, { message: `${label}: ${message}`, recoverable: true });
    return fallback;
  }
}

export function showFatalError(container: HTMLElement | null, message: string) {
  if (!container) return;
  const banner = document.createElement('div');
  banner.className = 'error-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = `
    <p><strong>Errore</strong> — ${escapeHtml(message)}</p>
    <button type="button">Ricarica</button>
  `;
  banner.querySelector('button')?.addEventListener('click', () => location.reload());
  container.appendChild(banner);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function assertWebGL(canvas: HTMLCanvasElement): WebGLRenderingContext | WebGL2RenderingContext {
  const gl =
    canvas.getContext('webgl2', { antialias: true, powerPreference: 'high-performance' }) ||
    canvas.getContext('webgl', { antialias: true, powerPreference: 'high-performance' });

  if (!gl) {
    throw new AppError(
      'WebGL non è disponibile su questo dispositivo. Prova un browser aggiornato o abilita l\'accelerazione hardware.',
      { recoverable: false, code: 'WEBGL_UNAVAILABLE' }
    );
  }
  return gl;
}
