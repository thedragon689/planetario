# Roadmap — Planetario 3D

Stato di avanzamento del progetto. Per le release pubblicate vedi [CHANGELOG](../CHANGELOG.md).

## Versioni

| Versione | Data | Focus |
|----------|------|-------|
| **2.2.x** | 2026-07 | Grafica/UI v2.2, layout, rimozione timeline cosmica |
| **2.1.x** | 2026-06 | AI avanzata, profilo, strumenti didattici, accessibilità |
| **2.0.x** | 2026-04 | Contenuti estesi, UI Fase B–F, simulazioni |
| **1.0.x** | 2026-01 | Foundation, scene base, Gemini, PWA |

## Stato per fase

### v2.2 — Grafica e UI ✅

| Area | Stato | Note |
|------|-------|------|
| Temi visivi + palette scena | ✅ | `src/config/visualThemes.ts` |
| Shader volumetrici | ✅ | nebula, blackhole lens, aurora, dust |
| Bussola 3D, gesture mobile | ✅ | `compass3d.ts`, `gestures.ts` |
| Layout anti-overlap | ✅ | `phase-ui-layout.css` |
| Timeline cosmica (slider era) | ❌ rimossa | v2.2.0 — vedi CHANGELOG |

### v2.1 — Supplementare ✅

Gemini Vision, profilo utente, Drake, coordinate HUD, cinema/relax, gamification estesa, i18n, telemetria.  
Spec: [PROMPT_MASTER_v2.1_Supplementare.md](./PROMPT_MASTER_v2.1_Supplementare.md)

### v2.0 — Contenuti e simulazioni ✅

| Fase | Stato | Highlight |
|------|-------|-----------|
| A Contenuti | ✅ | Esopianeti, estremi, nebulose, corpi minori |
| B UI/UX | ✅ | Top bar, sidebar, pannelli, preferiti |
| C Simulazioni | ✅ | Ephemeris, tempo, Lagrange, WebXR |
| D Gamification | ✅ | XP, achievement, tour, glossario |
| E Strutture / sonde | ✅ | Laniakea, CMB, Voyager, APOD |
| F Visual / educativo | ✅ | Procedurali, sonificazione, percorsi |

Spec: [PROMPT_MASTER_v2.0.md](./PROMPT_MASTER_v2.0.md) · Dettaglio storico: [ROADMAP_v2.md](./ROADMAP_v2.md)

### v1.0 — Foundation ✅

TypeScript, Zustand, Zod, post-processing, Gemini RAG, PWA, KTX2, IBL, CI/Vitest.

## Backlog futuro

- Sostituire `OWNER` in `package.json` → `repository.url` e link CHANGELOG
- Tag git annotati `v1.0.0` … `v2.2.0` dopo il primo push su GitHub

## Feature flags

Configurazione centralizzata in `src/config.ts` → `FEATURES`. Matrice scena × flag: [README § Feature Matrix](../README.md#-scene-e-feature-matrix).
