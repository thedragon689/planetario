import { renderSimpleMarkdown } from '../utils/markdown.js';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMessage(text, role = 'bot') {
  if (role === 'bot') return renderSimpleMarkdown(text);
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function createChat(root, { gemini, geminiQuiz, getSession, onOpenChange, voice, companion, suggestFollowUps, onQuizPerfect, onQuizScore, onCreative, onVisionImage, getQuizDifficulty } = {}) {
  const widget = document.createElement('aside');
  widget.className = 'chat-widget';
  widget.setAttribute('aria-label', 'Assistente didattico');
  widget.innerHTML = `
    <header class="chat-header">
      <div class="chat-header-info">
        <span class="chat-badge">Gemini</span>
        <h2 class="chat-title">Guida astronomica</h2>
        <p class="chat-subtitle">Companion Google · voce Aoede</p>
      </div>
      <div class="chat-header-actions">
        <button type="button" class="chat-btn-icon" data-action="quiz" aria-label="Avvia quiz astronomico" title="Quiz sulla scena">?</button>
        <button type="button" class="chat-btn-icon chat-btn-voice" data-action="voice" aria-label="Disattiva voce della guida" aria-pressed="true" title="Voce della guida">🔊</button>
        <button type="button" class="chat-btn-icon" data-action="clear" aria-label="Nuova conversazione" title="Nuova conversazione">↺</button>
        <button type="button" class="chat-btn-icon" data-action="close" aria-label="Chiudi chat">&times;</button>
      </div>
    </header>
    <div class="chat-messages" role="log" aria-live="polite"></div>
    <form class="chat-form">
      <textarea
        class="chat-input"
        rows="2"
        placeholder="Chiedi qualcosa sul catalogo…"
        aria-label="Messaggio per l'assistente"
      ></textarea>
      <button type="submit" class="chat-send" aria-label="Invia messaggio">➤</button>
    </form>
    <div class="chat-creative-row" hidden>
      <button type="button" class="chat-creative-btn" data-creative="story">Storia</button>
      <button type="button" class="chat-creative-btn" data-creative="haiku">Haiku</button>
      <button type="button" class="chat-creative-btn" data-creative="whatif">What if</button>
      <button type="button" class="chat-vision-btn" data-action="vision">📷 Foto</button>
      <input type="file" class="chat-vision-input" accept="image/*" />
    </div>
    <p class="chat-footnote"></p>
  `;
  root.appendChild(widget);

  const messagesEl = widget.querySelector('.chat-messages');
  const form = widget.querySelector('.chat-form');
  const input = widget.querySelector('.chat-input');
  const footnote = widget.querySelector('.chat-footnote');
  const sendBtn = widget.querySelector('.chat-send');
  const voiceBtn = widget.querySelector('[data-action="voice"]');
  const quizBtn = widget.querySelector('[data-action="quiz"]');
  const creativeRow = widget.querySelector('.chat-creative-row');
  const visionInput = widget.querySelector('.chat-vision-input');
  let quizIndex = 0;
  let activeQuiz = null;

  function updateVoiceButton() {
    if (!voiceBtn || !voice) return;
    const active = voice.isEnabled();
    voiceBtn.textContent = active ? '🔊' : '🔇';
    voiceBtn.setAttribute('aria-pressed', String(active));
    voiceBtn.setAttribute(
      'aria-label',
      active ? 'Disattiva voce della guida' : 'Attiva voce della guida'
    );
    voiceBtn.classList.toggle('is-muted', !active);
  }

  function maybeSpeak(text) {
    voice?.speak(text);
  }

  function addMessage(role, text, { loading = false, speak = false } = {}) {
    const el = document.createElement('article');
    el.className = `chat-msg chat-msg--${role}${loading ? ' chat-msg--loading' : ''}`;
    el.innerHTML = loading
      ? '<span class="chat-spinner"></span> Sto preparando una spiegazione semplice…'
      : formatMessage(text, role);
    messagesEl.appendChild(el);
    scrollToBottom();
    if (speak && !loading && text && widget.classList.contains('open')) {
      maybeSpeak(text);
    }
    return el;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setOpen(open) {
    widget.classList.toggle('open', open);
    onOpenChange?.(open);
    if (open) {
      input.focus();
      scrollToBottom();
    }
  }

  function showWelcome() {
    if (!gemini.hasApiKey()) {
      addMessage('bot', 'Salva il file `.env` con la tua chiave reale da Google AI Studio, poi riavvia il server:\n\nVITE_GOOGLE_AI_API_KEY=AIza...\n\nnpm run dev');
      input.disabled = true;
      sendBtn.disabled = true;
      if (creativeRow) creativeRow.hidden = true;
      footnote.textContent = 'Chiave API non salvata nel file .env';
      return;
    }

    if (creativeRow && (onCreative || onVisionImage)) creativeRow.hidden = false;

    addMessage(
      'bot',
      'Ciao! Sono la tua guida nel planetario.\n\nPosso spiegarti pianeti, lune, stelle, galassie e missioni usando solo i dati del catalogo caricato. Prova a chiedermi qualcosa su ciò che stai esplorando — userò analogie semplici e paragrafi brevi.',
      { speak: false }
    );
    footnote.textContent = voice?.isSupported()
      ? (voice.isGoogleAvailable?.()
        ? `Voce Google: ${voice.getVoiceName()}`
        : `Voce di sistema: ${voice.getVoiceName()}`)
      : `Modello chat: ${gemini.getModel()}`;
  }

  function renderQuizQuestion(q) {
    const el = document.createElement('article');
    el.className = 'chat-msg chat-msg--bot chat-msg--quiz';
    el.dataset.questionId = q.id;
    el.innerHTML = `
      <p class="chat-quiz-title">${escapeHtml(q.question)}</p>
      <div class="chat-quiz-choices">
        ${q.choices.map((choice, i) => `
          <button type="button" class="chat-quiz-choice" data-choice="${i}">${escapeHtml(choice)}</button>
        `).join('')}
      </div>
    `;
    el.querySelectorAll('.chat-quiz-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        const choiceIndex = Number(btn.dataset.choice);
        const result = geminiQuiz?.answerQuestion(q.id, choiceIndex);
        if (!result) return;
        el.querySelectorAll('.chat-quiz-choice').forEach((b) => { b.disabled = true; });
        btn.classList.add(result.correct ? 'is-correct' : 'is-wrong');
        addMessage('bot', result.correct
          ? `Esatto! ${result.explanation}`
          : `Non proprio. ${result.explanation}`, { speak: false });
        quizIndex += 1;
        const next = activeQuiz?.[quizIndex];
        if (next) {
          setTimeout(() => renderQuizQuestion(next), 600);
        } else {
          addMessage('bot', `Quiz completato: **${result.score}/${result.total}** risposte corrette.`, { speak: true });
          if (result.score === result.total) onQuizPerfect?.();
          if (result.total) {
            const pct = Math.round((result.score / result.total) * 100);
            onQuizScore?.(pct);
          }
          activeQuiz = null;
          quizIndex = 0;
        }
      });
    });
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  async function startQuiz() {
    if (!geminiQuiz || !gemini.hasApiKey()) {
      addMessage('bot', 'Configura la chiave Gemini nel file .env per usare il quiz.');
      return;
    }
    setOpen(true);
    voice?.stop();
    const loading = addMessage('bot', '', { loading: true });
    try {
      activeQuiz = await geminiQuiz.generateQuiz(getSession?.() || {}, getQuizDifficulty?.() || 'medium');
      loading.remove();
      addMessage('bot', 'Ecco un breve quiz sulla scena che stai esplorando. Scegli una risposta per ogni domanda.');
      quizIndex = 0;
      if (activeQuiz[0]) renderQuizQuestion(activeQuiz[0]);
    } catch (err) {
      loading.remove();
      addMessage('bot', `Non riesco a generare il quiz: ${err.message}`);
    }
  }

  function clearConversation() {
    voice?.stop();
    gemini.clearHistory();
    geminiQuiz?.reset();
    activeQuiz = null;
    quizIndex = 0;
    messagesEl.innerHTML = '';
    showWelcome();
  }

  function addFollowUpChips() {
    if (!suggestFollowUps) return;
    const questions = suggestFollowUps(getSession?.() || {});
    if (!questions?.length) return;

    const row = document.createElement('div');
    row.className = 'chat-followups';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Domande suggerite');
    questions.forEach((q) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-followup-btn';
      btn.textContent = q;
      btn.addEventListener('click', () => {
        input.value = q;
        form.requestSubmit();
      });
      row.appendChild(btn);
    });
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || gemini.isBusy()) return;

    voice?.stop();
    input.value = '';
    addMessage('user', text);
    const loadingEl = addMessage('bot', '', { loading: true });
    sendBtn.disabled = true;
    input.disabled = true;

    try {
      const reply = await gemini.sendMessage(text, getSession?.() || {});
      loadingEl.remove();
      addMessage('bot', reply);
      addFollowUpChips();
      if (voice?.isEnabled()) {
        try {
          await voice.speak(reply);
        } catch (err) {
          addMessage('bot', err.message === 'QUOTA_EXCEEDED'
            ? 'Limite voce Google raggiunto e la voce di sistema non è disponibile. Riprova tra un minuto.'
            : `Guida vocale non disponibile: ${err.message}`);
        }
      }
    } catch (err) {
      loadingEl.remove();
      const code = err.message;
      const friendly = {
        API_KEY_MISSING: 'Configura VITE_GOOGLE_AI_API_KEY nel file .env e riavvia il server.',
        API_KEY_PLACEHOLDER: 'Il file .env contiene ancora il testo di esempio. Salva la chiave reale (Ctrl+S) e riavvia npm run dev.',
        API_KEY_INVALID: 'La chiave API non è valida. Verifica che sia quella di Google AI Studio (https://aistudio.google.com/apikey), senza spazi extra, e riavvia npm run dev.',
        MODEL_NOT_FOUND: 'Il modello Gemini configurato non è disponibile per la tua chiave. Ho provato i fallback automatici senza successo.',
        QUOTA_EXCEEDED: 'Hai superato il limite di richieste gratuite di Gemini. Riprova tra qualche minuto.',
        EMPTY_MESSAGE: 'Scrivi una domanda prima di inviare.',
        BUSY: 'Attendi la risposta in corso…',
      }[code] || `Non riesco a rispondere: ${err.message}`;
      addMessage('bot', friendly);
    } finally {
      sendBtn.disabled = !gemini.hasApiKey();
      input.disabled = !gemini.hasApiKey();
      input.focus();
    }
  }

  widget.querySelector('[data-action="close"]').addEventListener('click', () => setOpen(false));
  widget.querySelector('[data-action="clear"]').addEventListener('click', clearConversation);
  quizBtn?.addEventListener('click', startQuiz);
  voiceBtn?.addEventListener('click', () => {
    if (!voice) return;
    voice.toggle();
    updateVoiceButton();
    companion?.syncVoiceButton();
    if (!voice.isEnabled()) voice.stop();
  });
  form.addEventListener('submit', handleSubmit);

  creativeRow?.querySelectorAll('[data-creative]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const kind = btn.dataset.creative;
      const obj = getSession?.()?.selectedObject;
      if (!obj?.name || !onCreative) {
        addMessage('bot', 'Seleziona un oggetto celeste prima di generare contenuti creativi.');
        return;
      }
      const loading = addMessage('bot', '', { loading: true });
      try {
        const text = await onCreative(kind, obj);
        loading.remove();
        addMessage('bot', text);
      } catch (err) {
        loading.remove();
        addMessage('bot', `Generazione non riuscita: ${err.message}`);
      }
    });
  });

  widget.querySelector('[data-action="vision"]')?.addEventListener('click', () => visionInput?.click());
  visionInput?.addEventListener('change', async () => {
    const file = visionInput.files?.[0];
    if (!file || !onVisionImage) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const loading = addMessage('bot', '', { loading: true });
      try {
        const reply = await onVisionImage(String(reader.result), file.type, input.value.trim());
        loading.remove();
        addMessage('bot', reply);
      } catch (err) {
        loading.remove();
        addMessage('bot', `Analisi immagine fallita: ${err.message}`);
      }
      visionInput.value = '';
    };
    reader.readAsDataURL(file);
  });

  if (voice) {
    updateVoiceButton();
    if (!voice.isSupported()) {
      voiceBtn.disabled = true;
      voiceBtn.title = 'Sintesi vocale non supportata dal browser';
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  showWelcome();

  return {
    element: widget,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!widget.classList.contains('open')),
    isOpen: () => widget.classList.contains('open'),
    ask(question) {
      if (!question || gemini.isBusy()) return;
      input.value = question;
      form.requestSubmit();
    },
    notifySelection(objectData) {
      if (!objectData) return;
      if (widget.classList.contains('open')) {
        footnote.textContent = `Oggetto in focus: ${objectData.name}`;
      }
    },
  };
}
