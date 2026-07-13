import { buildNarrationForObject } from './companionNarration.js';

export function createNavigationCompanion({ voice, getSession, root }) {
  const bar = document.createElement('aside');
  bar.className = 'companion-bar';
  bar.setAttribute('aria-live', 'polite');
  bar.setAttribute('aria-label', 'Guida vocale di navigazione');
  bar.innerHTML = `
    <div class="companion-bar-icon" aria-hidden="true">✦</div>
    <div class="companion-bar-copy">
      <p class="companion-bar-label">Guida di navigazione</p>
      <p class="companion-bar-object">Esplora il catalogo e clicca un oggetto</p>
      <p class="companion-bar-text"></p>
    </div>
    <button type="button" class="companion-bar-voice" data-action="companion-voice" aria-pressed="true" aria-label="Disattiva guida vocale" title="Guida vocale Google">🔊</button>
  `;
  root.appendChild(bar);

  const labelEl = bar.querySelector('.companion-bar-label');
  const objectEl = bar.querySelector('.companion-bar-object');
  const textEl = bar.querySelector('.companion-bar-text');
  const voiceBtn = bar.querySelector('[data-action="companion-voice"]');
  let currentId = null;
  let announceToken = 0;
  let lastData = null;
  let lastNarration = '';

  function voiceProviderLabel() {
    if (!voice?.isEnabled?.()) return 'Guida di navigazione';
    if (voice.usesFallbackVoice?.()) return 'Voce di sistema';
    if (voice.isGoogleAvailable?.()) return 'Voce Google';
    return 'Voce di sistema';
  }

  function voiceStatusLabel() {
    return `${voiceProviderLabel()} · ${voice?.getVoiceName?.() || 'Aoede'}`;
  }

  function syncVoiceButton() {
    if (!voice) return;
    const active = voice.isEnabled();
    voiceBtn.textContent = active ? '🔊' : '🔇';
    voiceBtn.setAttribute('aria-pressed', String(active));
    voiceBtn.setAttribute('aria-label', active ? 'Disattiva guida vocale' : 'Attiva guida vocale');
    voiceBtn.classList.toggle('is-muted', !active);
    bar.classList.toggle('companion-bar--muted', !active);
  }

  function setIdle() {
    currentId = null;
    bar.classList.remove('companion-bar--active', 'companion-bar--loading', 'companion-bar--ready');
    labelEl.textContent = 'Guida di navigazione';
    objectEl.textContent = 'Esplora il catalogo e clicca un oggetto';
    textEl.textContent = voice?.isEnabled()
      ? (voice?.isGoogleAvailable?.()
        ? 'La guida Google ti accompagnerà a voce ad ogni selezione.'
        : 'La voce di sistema ti accompagnerà ad ogni selezione.')
      : 'Guida vocale disattivata.';
  }

  function prefetchObject(data, options = {}) {
    if (!data || !voice?.isEnabled() || !voice?.isGoogleAvailable?.()) return;
    const narration = buildNarrationForObject(data, getSession?.() || {}, { compact: true });
    if (!narration) return;
    voice.prefetchGoogle(narration, data.id || data.name, options);
  }

  async function announceObject(data) {
    if (!data) {
      stop();
      return;
    }

    const narration = buildNarrationForObject(data, getSession?.() || {}, { compact: true });
    if (!narration) return;

    const cacheKey = data.id || data.name;
    const googleReady = voice?.isGoogleAvailable?.();
    const cached = googleReady && voice?.isCached?.(cacheKey);
    const token = ++announceToken;

    lastData = data;
    lastNarration = narration;
    currentId = cacheKey;
    bar.classList.add('companion-bar--active');
    bar.classList.remove('companion-bar--error', 'companion-bar--fallback');
    bar.classList.toggle('companion-bar--loading', googleReady && !cached);
    bar.classList.toggle('companion-bar--ready', Boolean(cached) || !googleReady);
    bar.classList.toggle('companion-bar--fallback', !googleReady);
    labelEl.textContent = voiceStatusLabel();
    objectEl.textContent = data.name;
    textEl.textContent = narration;

    if (!voice?.isEnabled()) {
      bar.classList.remove('companion-bar--loading');
      return;
    }

    if (googleReady && !cached) {
      voice.prefetchGoogle(narration, cacheKey, { priority: true });
    }

    try {
      await voice.speakGoogle(narration, { cacheKey, allowFallback: true });
      if (token !== announceToken) return;

      bar.classList.remove('companion-bar--loading', 'companion-bar--error');
      bar.classList.add('companion-bar--ready');
      bar.classList.toggle('companion-bar--fallback', voice.usesFallbackVoice?.());
      labelEl.textContent = voiceStatusLabel();

      if (voice.usesFallbackVoice?.() && googleReady) {
        textEl.textContent = `${narration} (voce di sistema attiva: Google non disponibile al momento.)`;
      }
    } catch (err) {
      if (token !== announceToken) return;
      bar.classList.remove('companion-bar--loading');
      bar.classList.add('companion-bar--error');
      labelEl.textContent = 'Guida vocale non disponibile';
      if (err.message === 'QUOTA_EXCEEDED' || err.message === 'RATE_LIMIT_EXCEEDED') {
        textEl.textContent = 'Limite API vocale raggiunto. Uso la voce di sistema se disponibile.';
      } else if (err.message === 'API_KEY_MISSING') {
        textEl.textContent = 'Configura VITE_GOOGLE_AI_API_KEY nel file .env oppure abilita la sintesi vocale del browser.';
      } else if (err.message === 'BROWSER_TTS_UNSUPPORTED') {
        textEl.textContent = 'Né la voce Google né la sintesi vocale del browser sono disponibili su questo dispositivo.';
      } else {
        textEl.textContent = `Errore guida vocale: ${err.message}`;
      }
    }
  }

  function stop() {
    announceToken += 1;
    voice?.stop();
    setIdle();
  }

  voiceBtn.addEventListener('click', () => {
    if (!voice) return;
    voice.toggle();
    syncVoiceButton();
    if (!voice.isEnabled()) {
      stop();
      textEl.textContent = 'Guida vocale disattivata.';
    } else if (lastData) {
      announceObject(lastData);
    } else {
      setIdle();
    }
  });

  syncVoiceButton();
  setIdle();

  return {
    element: bar,
    announceObject,
    prefetchObject,
    stop,
    syncVoiceButton,
    isEnabled: () => voice?.isEnabled?.() ?? false,
  };
}
