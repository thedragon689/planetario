# Troubleshooting — Planetario 3D

Guida alla risoluzione dei problemi più comuni. Per l'onboarding rapido vedi [README](../README.md#-quick-start).

## Rendering e performance

| Problema | Soluzione |
|----------|-----------|
| Schermata nera / errore WebGL | Browser aggiornato; accelerazione hardware attiva nelle impostazioni OS/GPU |
| FPS bassi | Qualità adattiva automatica al boot; pulsante **◆** per override manuale high/medium/low |
| Elementi UI sovrapposti | Hard refresh (`Ctrl+Shift+R`); breakpoint layout a 768 px e 1200 px |

## Gemini, chat e voce

| Problema | Soluzione |
|----------|-----------|
| `API_KEY_MISSING` in chat | Crea `.env` con `VITE_GOOGLE_AI_API_KEY` e riavvia `npm run dev` |
| `RATE_LIMIT_EXCEEDED` / TTS 429 | Fallback automatico alla voce del browser; prefetch in pausa ~60 s |
| Chat non risponde | Verifica proxy dev `/api/gemini`; controlla quota su Google AI Studio |

## Audio e asset

| Problema | Soluzione |
|----------|-----------|
| Musica non parte | Clicca **♪** o interagisci con la pagina (policy autoplay dei browser) |
| Brani mancanti | Esegui `npm run convert-assets` dopo aver aggiunto WMA in `musica/` |
| Icona tab / PWA non aggiornata | Hard refresh; in Firefox svuota dati sito e unregister service worker |

## Sviluppo

| Problema | Soluzione |
|----------|-----------|
| Chunk Vite non caricano in dev | SW disattivato in dev; cancella cache sito se persistono errori |
| JSON non valido in console | Controlla `public/data/`; warning Zod non bloccano l'avvio |
| `typecheck` / `lint` falliscono | `npm run typecheck` e `npm run lint` per dettaglio; fix in `src/` |
| Build fallisce | `npm run build` con Node ≥ 18; verifica import `.js` per moduli TS |

## Segnalare un bug

1. Riproduci con `npm run dev` e annota browser + OS.
2. Apri la console (F12) e copia errori.
3. Se attivo, verifica `VITE_SENTRY_DSN` in produzione.
