export interface VoiceCommandHandlers {
  onNavigate?: (target: string) => void;
  onZoom?: (direction: 'in' | 'out') => void;
  onNextScene?: () => void;
  onPrevScene?: () => void;
  onTogglePanel?: (name: string) => void;
}

const COMMANDS: Array<{ patterns: RegExp[]; action: (h: VoiceCommandHandlers, m: RegExpMatchArray) => void }> = [
  { patterns: [/vai a (.+)/i, /go to (.+)/i], action: (h, m) => h.onNavigate?.(m[1].trim()) },
  { patterns: [/zoom indietro/i, /zoom out/i], action: (h) => h.onZoom?.('out') },
  { patterns: [/zoom avanti/i, /zoom in/i], action: (h) => h.onZoom?.('in') },
  { patterns: [/prossima scena/i, /next scene/i], action: (h) => h.onNextScene?.() },
  { patterns: [/scena precedente/i, /previous scene/i], action: (h) => h.onPrevScene?.() },
  { patterns: [/apri profilo/i], action: (h) => h.onTogglePanel?.('profile') },
  { patterns: [/apri glossario/i], action: (h) => h.onTogglePanel?.('glossary') },
];

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export function createVoiceCommands(handlers: VoiceCommandHandlers) {
  const win = window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

  let recognition: SpeechRecognitionInstance | null = null;
  let active = false;
  let indicator: HTMLElement | null = null;

  function ensureIndicator(root: HTMLElement) {
    if (indicator) return;
    indicator = document.createElement('div');
    indicator.className = 'voice-indicator';
    indicator.hidden = true;
    indicator.textContent = '🎤 Ascolto…';
    root.appendChild(indicator);
  }

  function handleTranscript(text: string) {
    for (const cmd of COMMANDS) {
      for (const pat of cmd.patterns) {
        const m = text.match(pat);
        if (m) {
          cmd.action(handlers, m);
          return true;
        }
      }
    }
    return false;
  }

  return {
    isSupported: () => Boolean(SpeechRecognition),
    isActive: () => active,
    start(root: HTMLElement) {
      if (!SpeechRecognition || active) return false;
      ensureIndicator(root);
      recognition = new SpeechRecognition();
      recognition.lang = 'it-IT';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (ev: unknown) => {
        const results = (ev as { results: Array<{ 0: { transcript: string } }> }).results;
        const text = results[results.length - 1][0].transcript;
        handleTranscript(text);
      };
      recognition.onend = () => {
        if (active) recognition?.start();
      };
      recognition.start();
      active = true;
      if (indicator) indicator.hidden = false;
      return true;
    },
    stop() {
      active = false;
      recognition?.stop();
      recognition = null;
      if (indicator) indicator.hidden = true;
    },
    toggle(root: HTMLElement) {
      if (active) this.stop();
      else this.start(root);
      return active;
    },
  };
}
