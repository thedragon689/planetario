# Changelog

Tutte le modifiche rilevanti a **Planetario 3D** sono documentate in questo file.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/2.0.0/),
e il progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

## [Unreleased]

### Added

- (nessuna voce al momento)

### Changed

- (nessuna voce al momento)

## [2.2.0] — 2026-07-13

### Added

- Temi visivi (4 preset) e palette dinamiche per scena
- Glassmorphism 2.0 su pannelli HUD
- Shader volumetrici: nebulosa raymarch, lente buchi neri, aurora, polvere, pianeti procedurali
- Bussola 3D nel canvas; gesture mobile (swipe, pinch, long press)
- Bottom sheet mobile e menu contestuale
- Layout UI anti-overlap (`phase-ui-layout.css`)
- Animazioni pannello info con GSAP

### Changed

- Colonna sonora: *Cosmos* (Vangelis) predefinita; *Oxygène IV* (Jarre) per l'esplorazione
- Documentazione ristrutturata (README, CHANGELOG, `docs/`)

### Fixed

- Click silenziosi su oggetti (raycaster e hitbox Terra)
- Parse error TypeScript in `geminiAdvanced.ts`
- Attenuazione guida navigazione con chat aperta (`html.chat-open`)

### Removed

- Timeline cosmica (slider era storica): UI, store, `earthEra.ts`, test correlati

## [2.1.0] — 2026-06-01

### Added

- Gemini Vision (upload foto in chat) e contenuti creativi (storie, haiku, what-if)
- Profilo utente (Esploratore / Studente / Ricercatore), streak, quiz adattivo
- Griglia spaziotemporale, alone materia oscura, equazione di Drake, evoluzione stellare
- HUD coordinate (RA/Dec, eclittiche, galattiche, alt-az) e spettro stellare
- Modalità cinema, relax e notte stellata
- Skill tree, carte collezionabili, achievement nascosti
- Comandi vocali, descrizione audio, accessibilità avanzata
- Sessioni condivise demo, telemetria opt-in, feedback con screenshot, i18n IT/EN

## [2.0.0] — 2026-04-01

### Added

- Scene **Esopianeti** e **Oggetti Estremi**; nebulose estese; corpi minori e nube di Oort
- Top bar (breadcrumb, Ctrl+K), sidebar, pannelli a schede, preferiti, bussola, confronto oggetti
- Ephemeris e controlli tempo (Sistema Solare); punti di Lagrange; righello cosmico; WebXR
- Timeline cosmica slider (rimossa in 2.2.0)
- Strutture a larga scala, sonde spaziali, barra scala, NASA APOD
- Texture procedurali, atmosfere planetarie, sonificazione, percorsi didattici, editor sistemi
- Pannello eventi astronomici

## [1.0.0] — 2026-01-15

### Added

- Foundation: TypeScript, Zustand, EventBus, Zod, error handling, PWA
- Scene Terra → Wormhole, shader GLSL, post-processing, transizioni GSAP
- Assistente Gemini (RAG), guida vocale, integrazioni NASA/Wikipedia
- Qualità adattiva, colonna sonora, minimappa, tour guidato
- KTX2, IBL, instancing, WebGPU sperimentale, quiz Gemini
- Vitest, ESLint, CI GitHub Actions, Husky, Lighthouse, Sentry opzionale

### Fixed

- Import Vite `.js` vs `.ts`; Service Worker disabilitato in dev
- Fallback TTS browser su errori Gemini; loader KTX2/IBL/HDRI

<!-- Imposta URL repository prima del publish -->
[Unreleased]: https://github.com/OWNER/planetario/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/OWNER/planetario/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/OWNER/planetario/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/OWNER/planetario/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/OWNER/planetario/releases/tag/v1.0.0
