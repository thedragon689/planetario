import type { AppEventHandler, AppEventMap, AppEventName } from '../types/events.js';

type ListenerEntry = Set<(payload: AppEventMap[AppEventName]) => void>;

/**
 * Event bus tipizzato per comunicazione decoupled tra moduli.
 */
export function createEventBus() {
  const listeners = new Map<AppEventName, ListenerEntry>();

  function on<K extends AppEventName>(event: K, handler: AppEventHandler<K>) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler as (payload: AppEventMap[AppEventName]) => void);
    return () => off(event, handler);
  }

  function off<K extends AppEventName>(event: K, handler: AppEventHandler<K>) {
    listeners.get(event)?.delete(handler as (payload: AppEventMap[AppEventName]) => void);
  }

  function emit<K extends AppEventName>(event: K, payload: AppEventMap[K]) {
    listeners.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`EventBus handler error [${event}]:`, err);
      }
    });
  }

  function clear() {
    listeners.clear();
  }

  return { on, off, emit, clear };
}

export type EventBus = ReturnType<typeof createEventBus>;
