# Roadmap v2.0 — Planetario 3D

> **Nota:** documento storico. Per lo stato attuale usa [ROADMAP.md](./ROADMAP.md).

Riferimento completo: [PROMPT_MASTER_v2.0.md](./PROMPT_MASTER_v2.0.md)

## Fase A — Contenuti astronomici (completata)

| Voce | Stato | Note |
|------|-------|------|
| Catalogo esopianeti + scena dedicata | ✅ | `public/data/exoplanets.json`, scena `exoplanets`, marker 3D con zona abitabile |
| Nebulose planetarie / H II estese | ✅ | Granchio, Orione, Anello, Velo, Nord America in `phenomena.js` |
| Buchi neri (Sgr A*, M87*) | ✅ | Scena `extreme_objects`, shader disco accrezione, jet, lente |
| Asteroidi, comete, Kuiper | ✅ | `small-bodies.json`, orbite Sistema Solare, nube Oort |
| Catalogo stelle esteso (Hipparcos) | ✅ | Deneb, Altair, Spica, Albireo, SN 1987A (+ esistenti) |

## Fase B — UI/UX (completata)

| Voce | Stato | Note |
|------|-------|------|
| Tema chiaro/scuro + alto contrasto | ✅ | `uiStore`, `theme.ts`, CSS variabili |
| Daltonismo (3 filtri) | ✅ | SVG filters su canvas |
| Font size + animazioni ridotte | ✅ | Settings panel |
| Sidebar gerarchica | ✅ | `sidebar.ts` |
| Breadcrumb + ricerca globale | ✅ | `topBar.ts`, Ctrl+K |
| Filtri ricerca avanzati | ✅ | Dropdown categoria in top bar |
| Pannello a schede + bookmark + share | ✅ | `panel.js` ridisegnato |
| Pagina preferiti + export JSON/CSV | ✅ | `bookmarksView.ts` |
| Timeline cosmica (slider) | ❌ rimossa | v2.2.0 — vedi [ROADMAP.md](./ROADMAP.md) |
| Bussola 3D | ✅ | `compass3d.ts` — nel canvas |
| Pannello comparativo | ✅ | `comparePanel.ts` — split-screen due oggetti |
| Indicatore warp | ✅ | `warpIndicator.ts` — durante transizioni scena |

## Fase C — Simulazioni (completata)

| Voce | Stato | Note |
|------|-------|------|
| Ephemeris orbitale | ✅ | `ephemeris.ts`, posizioni pianeti da data simulazione |
| Controlli tempo | ✅ | `timeControls.ts`, `timeStore.ts` — data, velocità 1×–10000×, pausa |
| Era cosmica + scala universo | ✅ | Slider collegato a `universeScaleFromGyr` |
| Punti di Lagrange L1–L5 | ✅ | `lagrangePoints.js` — toggle in Sistema Solare |
| Righello cosmico | ✅ | `cosmicRuler.ts` — misura distanza tra due clic |
| Confronto dimensioni | ✅ | `sizeCompare.ts` — barre comparative raggi |
| WebXR (VR opt-in) | ✅ | `webxr.ts` — pulsante VR se supportato |

## Fase D — Gamification (completata)

| Voce | Stato | Note |
|------|-------|------|
| XP, livelli, achievement | ✅ | `gamificationStore.ts`, pannello achievement |
| Glossario astronomico | ✅ | `glossary.ts` (20 voci base, estendibile) |
| Tour guidati predefiniti | ✅ | `tours.ts`, `tourRunner.ts` — 3 percorsi |
| Hook eventi app | ✅ | visite scene/oggetti, quiz 100%, screenshot, glossario |
| HUD XP | ✅ | Livello e punti in `hud.js` |

## Feature flags (`src/config.ts`)

```ts
FEATURES.exoplanets      // scena e marker esopianeti
FEATURES.extendedNebulae // 8 nebulose invece di 3
FEATURES.extremeObjects  // scena buchi neri, pulsar, magnetar
FEATURES.smallBodies     // asteroidi, comete, Kuiper, Oort
FEATURES.timeSimulation  // ephemeris + controlli tempo
FEATURES.gamification    // XP, achievement, glossario
FEATURES.webxr           // sessione VR opzionale
FEATURES.lagrangePoints  // L1–L5 nel Sistema Solare
FEATURES.cosmicRuler     // strumento misura
FEATURES.sizeCompare     // confronto dimensioni
FEATURES.largeScaleStructures // filamenti, vuoti, superammassi, CMB
FEATURES.spaceProbes     // Voyager, New Horizons, Parker, Juno
FEATURES.apodWidget      // tab Notizie con NASA APOD
FEATURES.scenePlaylists   // crossfade audio per scena
```

## Fase E — Visual & Audio (in corso)

| Voce | Stato | Note |
|------|-------|------|
| Strutture a larga scala (§3.1.4) | ✅ | Laniakea, Shapley, Sloan, Boötes, filamenti, CMB |
| Traiettorie sonde (§3.1.5) | ✅ | 5 sonde con waypoint e trail gradiente |
| Playlist tematica + crossfade | ✅ | `AUDIO.playlists`, `audio.js` |
| Barra scala dinamica | ✅ | `scaleBar.ts` |
| Tab Notizie APOD + arXiv in Fonti | ✅ | `apod.ts`, `panel.js` |
| Texture procedurali / atmosfera avanzata | ✅ | Worley/crateri, atmosfere multi-pianeta |
| Sonificazione dati | ✅ | `sonification.ts` |
| Percorsi didattici | ✅ | `learning-paths.json`, progress persistito |
| Glossario esteso (248+ termini) | ✅ | `public/data/glossary.json` |
| Editor sistema planetario | ✅ | `planetEditor.ts`, `customSystemsStore` |
| Eventi astronomici | ✅ | `astro-events.json`, toast in avvio |

## Feature flags aggiuntivi

```ts
FEATURES.proceduralTextures
FEATURES.planetAtmospheres
FEATURES.sonification
FEATURES.learningPaths
FEATURES.extendedGlossary
FEATURES.planetEditor
FEATURES.astroEvents
```

## Fase G — v2.1 Supplementare (client-side MVP)

Riferimento: [PROMPT_MASTER_v2.1_Supplementare.md](./PROMPT_MASTER_v2.1_Supplementare.md)

| Area | Stato | Note |
|------|-------|------|
| Gemini Vision + creativi | ✅ | `geminiAdvanced.ts`, chat con foto/storia/haiku |
| Profilo adattivo + quiz difficoltà | ✅ | `userProfileStore.ts` |
| Drake, evoluzione stellare, spettro | ✅ | Pannelli dedicati |
| Griglia spaziotempo + materia oscura | ✅ | `spacetimeGrid.js`, `darkMatterHalo.js` |
| Cinema, relax, notte stellata | ✅ | `cinemaMode.ts`, `relaxMode.ts`, `starryNight.ts` |
| Skill tree + collezionabili + achievement nascosti | ✅ | Gamification estesa |
| Comandi vocali + audio description + a11y | ✅ | Web Speech API, OpenDyslexic |
| Sessioni BroadcastChannel + telemetria + feedback | ✅ | Demo locale senza backend |
| i18n IT/EN | ✅ | `src/i18n/` |
| Multiplayer WebRTC, galleria community, monetizzazione | ⏳ | Richiedono backend/infrastruttura |

Feature flags v2.1 in `config.ts`: `geminiVision`, `userProfile`, `sharedSessions`, `spacetimeGrid`, `drakeCalculator`, `cinemaMode`, `voiceCommands`, `telemetry`, ecc.
