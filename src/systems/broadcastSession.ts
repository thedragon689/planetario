export type SessionRole = 'leader' | 'follower';

export interface SessionMessage {
  type: 'navigate' | 'select' | 'chat' | 'ping';
  scene?: string;
  objectId?: string;
  text?: string;
  from: string;
  at: number;
}

const CHANNEL = 'planetario-shared-session';

export function createBroadcastSession(name: string) {
  const id = `user-${Math.random().toString(36).slice(2, 8)}`;
  const displayName = name || `Esploratore ${id.slice(-4)}`;
  let role: SessionRole = 'leader';
  let channel: BroadcastChannel | null = null;
  const listeners = new Set<(msg: SessionMessage) => void>();

  function ensureChannel() {
    if (typeof BroadcastChannel === 'undefined') return null;
    if (!channel) {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (ev) => {
        const msg = ev.data as SessionMessage;
        if (msg.from === id) return;
        listeners.forEach((fn) => fn(msg));
      };
    }
    return channel;
  }

  return {
    id,
    displayName,
    isSupported: () => typeof BroadcastChannel !== 'undefined',
    setRole(r: SessionRole) { role = r; },
    getRole: () => role,
    onMessage(fn: (msg: SessionMessage) => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    broadcast(msg: Omit<SessionMessage, 'from' | 'at'>) {
      if (role !== 'leader') return;
      const ch = ensureChannel();
      ch?.postMessage({ ...msg, from: id, at: Date.now() });
    },
    ping() {
      ensureChannel()?.postMessage({ type: 'ping', from: id, at: Date.now() });
    },
    close() {
      channel?.close();
      channel = null;
      listeners.clear();
    },
  };
}
