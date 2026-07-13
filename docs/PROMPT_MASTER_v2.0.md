# PROMPT MASTER v2.0 — Planetario 3D: Interstellar Edition
## Miglioramento Globale (UI/UX, Visualizzazione, Contenuti Astronomici, Interattività)

---

## 1. CONTESTO E BASE ATTUALE

Il progetto **Planetario 3D — Interstellar Edition** è un esploratore astronomico 3D interattivo che guida l'utente dalla Terra fino all'universo osservabile, attraversando il Sistema Solare, la Via Lattea, il Gruppo Locale e un effetto wormhole. È costruito su **Vite + Three.js + GSAP + Google Gemini + Zustand + Zod + TypeScript**.

### Stato attuale (completato):
- ✅ 6 scene cinematiche (Terra, Sistema Solare, Via Lattea, Gruppo Locale, Universo Osservabile, Wormhole)
- ✅ Rendering 3D con shader GLSL personalizzati, post-processing (bloom, FXAA, SMAA)
- ✅ Catalogo astronomico JSON validato con Zod
- ✅ Interazione: orbit controls, raycasting, etichette contestuali, pannelli informativi
- ✅ Assistente didattico Gemini (chat in italiano, RAG, follow-up, quiz)
- ✅ Guida vocale Google TTS con fallback browser
- ✅ Integrazione NASA/Wikipedia
- ✅ Qualità adattiva (high/medium/low) con benchmark iniziale
- ✅ Colonna sonora Vangelis (Chariots of Fire)
- ✅ PWA, Service Worker (solo produzione), manifest
- ✅ WebGPU sperimentale, KTX2, IBL, InstancedMesh, audio spaziale HRTF
- ✅ DevEx: Vitest, CI GitHub Actions, Husky, Lighthouse, Sentry

### Stack tecnologico:
Vite | Three.js (WebGL/WebGPU) | GSAP | Google Gemini API | Zod | Zustand | TypeScript

---

## 2. OBIETTIVO

Trasformare Planetario 3D da "visualizzatore astronomico" a **piattaforma educativa immersiva completa**, colmando tutti i gap di contenuto, interattività, accessibilità e coinvolgimento. Il risultato deve essere un'esperienza che compete con software come SpaceEngine, Universe Sandbox e Google Sky, mantenendo la leggerezza web-first.

---

## 3. AMBITI DI MIGLIORAMENTO

### 3.1 NUOVE SCENE E CONTENUTI ASTRONOMICI

#### 3.1.1 Catalogo Esopianeti (Nuova scena / overlay)
- Aggiungere una **scena dedicata agli esopianeti** con dati da Kepler, TESS, JWST
- Visualizzare i sistemi planetari extrasolari con orbite reali (dove disponibili)
- Evidenziare la **zona abitabile (Goldilocks zone)** per ogni stella madre
- Colorare i pianeti in base alla classificazione (super-Terra, gioviano caldo, mini-Nettuno, roccioso)
- Integrare dati JWST: atmosfere rilevate, spettroscopia, temperatura superficiale
- Pannello informativo con: metodo di scoperta, anno scoperta, distanza in anni luce, massa, raggio, temperatura, probabilità abitabilità

#### 3.1.2 Buchi Neri e Oggetti Estremi (Nuova scena)
- **Sagittarius A*** (centro galattico): visualizzazione con disco di accrescimento, jet relativistici, shadow
- **M87***: buco nero supermassiccio con jet da 5000 anni luce
- **Buchi neri stellari**: simulazione effetto lente gravitazionale su stelle di fondo
- **Pulsar/Magnetar**: visualizzazione con getti polari, emissione radio pulsata, campo magnetico
- **Stelle di neutroni**: effetto lente gravitazionale, rappresentazione della superficie
- Shader dedicati per: ergosfera, orizzonte degli eventi, disco di accrescimento (temperatura → colore), jet relativistici

#### 3.1.3 Nebulose Planetarie e Regioni HII (Integrazione scena Via Lattea)
- Aggiungere al catalogo: Nebulosa del Granchio, Nebulosa di Orione, Nebulosa Anello, Nebulosa Velo, Nebulosa Nord America
- Rappresentazione 3D volumetrica con shader nebulosa (particelle + noise 3D)
- Effetto ionizzazione con emissione luminosa (H-α, O-III)
- Pannello con: tipo, distanza, età, stella progenitrice, composizione chimica

#### 3.1.4 Strutture a Larga Scala (Integrazione scena Universo Osservabile)
- **Filamenti cosmici**: visualizzazione della struttura a "spugna" dell'universo
- **Vuoti cosmici**: rappresentazione delle grandi regioni vuote (Boötes void)
- **Superammassi**: Laniakea, Shapley, Sloan Great Wall
- **Radiazione cosmica di fondo (CMB)**: mappa sferica WMAP/Planck come sfondo cosmico
- Simulazione **espansione dell'universo** con slider tempo (Big Bang → oggi → futuro)

#### 3.1.5 Sistema Solare — Approfondimenti
- **Asteroidi principali**: Cerere, Vesta, Palla, Igea con orbite reali
- **Comete periodiche**: Halley, Hale-Bopp, Encke con traiettorie ellittiche
- **Cintura di Kuiper**: Plutone, Eris, Makemake, Haumea con orbite inclinate
- **Nube di Oort**: rappresentazione concettuale esterna
- **Campo magnetico solare**: linee di forza visibili, attività solare (macchie, flare, CME)
- **Traiettorie sonde**: Voyager 1/2, New Horizons, Parker Solar Probe, Juno con percorsi 3D e waypoint
- **Eclissi e transiti**: simulatore interattivo (Terra-Luna-Sole, transiti di Mercurio/Venere)

#### 3.1.6 Stelle Aggiuntive e Cataloghi
- **Catalogo Hipparcos**: ~100.000 stelle con magnitudine, colore, distanza, moto proprio
- **Stelle famose aggiuntive**: Betelgeuse, Rigel, Antares, Vega, Deneb, Altair, Spica, Arcturus
- **Stelle binarie**: Sirius A/B, Alpha Centauri A/B/C (Proxima), Albireo
- **Variabili Cefeidi**: rappresentazione pulsazione periodica
- **Supernove storiche**: SN 1987A, SN 1572 (Tycho), SN 1604 (Kepler) con resti visibili
- **Effetto parallasse**: per stelle entro 100 anni luce, simulazione spostamento con cambio punto di osservazione

---

### 3.2 MIGLIORAMENTI VISUALI E RENDERING

#### 3.2.1 Texture e Materiali
- **Texture procedurali**: per oggetti senza texture NASA disponibili (esopianeti, lune lontane, asteroidi)
  - Usare noise Worley/Simplex per superfici rocciose, gassose, ghiacciate
  - Parametri controllabili: rugosità, colore base, pattern crateri, strisce atmosferiche
- **Texture dinamiche**: nuvole in movimento su Giove/Saturno, macchie solari in evoluzione
- **Bump/Normal map**: per tutti i pianeti rocciosi e lune
- **Specular map**: per oceani e ghiaccio (Terra, Europa, Encelado)

#### 3.2.2 Effetti Atmosferici e Spaziali
- **Atmosfera migliorata**: scattering Rayleigh + Mie per tutti i pianeti con atmosfera
  - Effetto crepuscolare al terminatore
  - Alone solare (corona) visibile durante eclissi
  - Aurora polare (Terra, Giove, Saturno) con shader particellare
- **Anelli di Saturno**: texture dettagliata con divisione di Cassini, risonanze, ombre proiettate
- **Nebulose volumetriche**: raymarching 3D per nebulose con densità variabile
- **Polvere interstellare**: effetto scattering per Via Lattea vista dall'esterno
- **Lente gravitazionale**: shader per distorsione spaziotemporale vicino ai buchi neri

#### 3.2.3 Illuminazione
- **IBL avanzata**: cube map HDR per ogni scena (non solo generica)
  - Terra: cielo diurno/notturno
  - Sistema Solare: luce solare direzionale + riflessi planetari
  - Via Lattea: luce diffusa galattica
- **Shadow mapping**: ombre proiettate da pianeti su lune, da anelli su pianeta
- **God rays volumetrici**: estesi a tutte le scene con sorgente luminosa principale
- **Bloom adattivo**: intensità variabile per scena (stelle = alto, pianeti = medio)

#### 3.2.4 Etichette e UI 3D
- **Label 3D dinamiche**: nomi oggetti che appaiono al passaggio del mouse, con linea guida
- **Info-bubble**: mini pannello 3D fluttuante con dati essenziali (distanza, tipo, magnitudine)
- **Scala visiva**: barra di scala dinamica che si aggiorna con lo zoom
- **Griglia di riferimento**: piano equatoriale, eclittica, meridiani per ogni scena
- **Orbit trails**: traiettorie visibili con gradiente opacità (più recente = più opaco)

---

### 3.3 UI/UX — RIFACIMENTO COMPLETO

#### 3.3.1 Tema e Accessibilità
- **Tema chiaro/scuro**: switch globale con palette ottimizzate per entrambi
- **Modalità alto contrasto**: per utenti con problemi visivi
- **Modalità daltonismo**: filtri colori per protanopia, deuteranopia, tritanopia
- **Font size adattivo**: 3 livelli (small, medium, large)
- **Animazioni ridotte**: rispetto preferenza OS `prefers-reduced-motion`
- **Screen reader support**: ARIA labels su tutti gli elementi interattivi, ruoli semantici

#### 3.3.2 Navigazione e Layout
- **Sidebar navigazione**: albero gerarchico delle scene con sottocategorie esplorabili
  - Terra → Sistema Solare → Via Lattea → Gruppo Locale → Universo → Oggetti Estremi
- **Breadcrumb**: percorso attuale visibile in alto
- **Minimappa 3D**: vista schematica della posizione corrente nell'universo con zoom
- **Timeline cosmica**: slider orizzontale in basso per navigare nel tempo (Big Bang → oggi)
- **Barra di ricerca globale**: ricerca per nome, tipo, costellazione, distanza, con autocomplete
- **Filtri avanzati**: per tipo (pianeta, stella, galassia, nebulosa, buco nero), distanza, magnitudine, scoperta

#### 3.3.3 Pannelli Informativi
- **Pannello oggetto ridisegnato**:
  - Header con nome, tipo, icona categoria, pulsante bookmark, pulsante condividi
  - Schede: Panoramica | Dati tecnici | Galleria | Video NASA | Notizie | 3D Model
  - Dati tecnici in tabella con unità convertibili (metriche/imperiali, anni luce/parsec)
  - Confronto rapido: "Confronta con..." dropdown per paragone dimensioni/distanze
  - Citazione scientifica: link a paper arXiv/Astrophysics Data System
- **Pannello comparativo**: split-screen per confrontare due oggetti affiancati

#### 3.3.4 Sistema di Bookmark e Condivisione
- **Bookmark**: cuore su ogni oggetto, salvato in localStorage/Zustand persist
  - Pagina "I miei oggetti" con griglia personale
  - Esporta lista come JSON/CSV
- **Condivisione**: pulsante con menu a discesa
  - Screenshot istantaneo della vista 3D (canvas.toBlob)
  - Link diretto con URL hash (#obj=SagittariusA)
  - Condivisione social (Web Share API)
  - Generazione card immagine con dati oggetto

#### 3.3.5 HUD e Overlay
- **Compass 3D**: bussola spaziale che indica orientamento rispetto alla galassia
- **Velocità warp**: indicatore durante transizioni scena
- **Coordinate celesti**: RA/Dec o long/lat aggiornate in tempo reale
- **FPS/qualità**: indicatore discreto in angolo (toggle visibilità)
- **Notifiche toast**: eventi astronomici in corso, achievement sbloccati

---

### 3.4 INTERATTIVITÀ E SIMULAZIONI

#### 3.4.1 Simulazioni Fisiche
- **Simulazione orbitale real-time**: posizioni pianeti aggiornate in base alla data odierna (ephemeris semplificata)
  - Slider velocità: 1x, 100x, 1000x, 10000x
  - Data picker per saltare a date specifiche (eclissi storiche, allineamenti)
- **Simulazione gravitazionale N-body**: semplificata per Sistema Solare (perturbazioni)
  - Mostrare effetto gravità di Giove su asteroidi
  - Visualizzare punti di Lagrange (L1-L5) per coppie Terra-Luna, Sole-Giove
- **Simulazione espansione universale**: slider da -13.8 miliardi di anni a +50 miliardi
  - Mostrare formazione primordiale, era della reionizzazione, formazione galassie, futuro freddo

#### 3.4.2 Strumenti di Misura
- **Regolo cosmico**: clicca due punti per misurare distanza angolare e lineare
- **Angolo di vista**: mostra campo visivo in gradi
- **Confronto dimensioni**: modalità "messa in scala" dove oggetti vengono ridimensionati per confronto
  - Esempio: Terra vs Giove vs Sole vs Betelgeuse vs UY Scuti
- **Planetario virtuale**: proiezione sferica del cielo notturno per qualsiasi data/luogo sulla Terra

#### 3.4.3 Editor e Personalizzazione
- **Editor sistema planetario**: crea sistema stellare personalizzato
  - Aggiungi stella (massa, colore, temperatura)
  - Aggiungi pianeti (distanza, dimensione, tipo orbita)
  - Simula stabilità orbitale
  - Salva e condividi sistema creato
- **Tour personalizzato**: sequenza di waypoint con annotazioni
  - Predefiniti: "Tour del Sistema Solare", "Caccia alle supernove", "Esopianeti abitabili"
  - Utente può crearne di propri

---

### 3.5 AUDIO ESPANSO

#### 3.5.1 Colonne Sonore Multiple
- **Playlist tematica** per ogni scena:
  - Terra: ambient/nature
  - Sistema Solare: epico/orchestrale
  - Via Lattea: elettronica/ambient spaziale
  - Oggetti estremi: dark/atmospheric
  - Wormhole: intensa/transizione
- **Crossfade** automatico tra tracce durante transizioni scena
- **Volume indipendente**: musica, effetti, voce, con mixer virtuale

#### 3.5.2 Effetti Sonori e Sonificazione
- **Effetti ambientali**: vento solare, rumore fondo cosmico (CMB sonificato), onde gravitazionali
- **Sonificazione dati**: converte parametri astronomici in audio
  - Pulsar: frequenza di rotazione → click ritmico
  - Esopianeti: periodo orbitale → tono musicale
  - Stelle variabili: luminosità → altezza tono
- **Audio spaziale HRTF** esteso: ogni oggetto selezionato emette suono caratteristico posizionato nello spazio 3D

---

### 3.6 COMPONENTE EDUCATIVO AVANZATO

#### 3.6.1 Percorsi Didattici Strutturati
- **Livelli**: Principiante | Intermedio | Avanzato | Esperto
- **Percorsi tematici**:
  - "Cos'è un buco nero?" (5 tappe: stella → collasso → orizzonte → singolarità → osservazione)
  - "La vita nello spazio" (atmosfera, zone abitabili, biosignatures)
  - "L'espansione dell'universo" (Big Bang, redshift, energia oscura)
  - "Le missioni spaziali" (storiche e attuali con traiettorie)
- **Progress bar** per ogni percorso con badge di completamento

#### 3.6.2 Quiz e Gamification
- **Quiz Gemini migliorato**:
  - Domande multiple choice, vero/falso, associazione immagini
  - Difficoltà adattiva in base alle risposte precedenti
  - Spiegazione dettagliata per ogni risposta (corretta o sbagliata)
  - Modalità sfida a tempo
- **Sistema punteggio**: XP per ogni azione (esplorazione, quiz, condivisione, completamento tour)
- **Achievement/Badge**:
  - "Esploratore del Sistema Solare" (visita tutti i pianeti)
  - "Cacciatore di esopianeti" (scopri 10 esopianeti)
  - "Astrofisico" (completa 5 quiz con punteggio 100%)
  - "Fotografo cosmico" (condividi 10 screenshot)
  - "Pilota del wormhole" (attraversa tutte le scene)
- **Classifica locale**: leaderboard tra sessioni dello stesso browser

#### 3.6.3 Glossario e Riferimenti
- **Glossario astronomico integrato**: ~500 termini con definizioni
  - Link automatico nei pannelli informativi (parole sottolineate)
  - Modalità "spiegazione per bambini": linguaggio semplificato
- **Timeline storica**: eventi astronomici fondamentali con date
  - 1543: Copernico, eliocentrismo
  - 1609: Galileo, telescopio
  - 1915: Einstein, relatività generale
  - 1969: Apollo 11
  - 1990: Hubble
  - 2015: LIGO, onde gravitazionali
  - 2022: JWST prime immagini
- **Link a risorse esterne**: arXiv, NASA ADS, ESA, Wikipedia (IT)

---

### 3.7 INTEGRAZIONI E DATI REAL-TIME

#### 3.7.1 Dati Aggiornati
- **Posizioni pianeti odierne**: integrazione API JPL Horizons (o dati statici pre-calcolati)
- **Eventi astronomici**: eclissi, congiunzioni, meteoriti, transiti (da calcolare o API)
- **Notizie spaziali**: feed RSS NASA/ESA (titoli + link nel pannello info)
- **Immagini Astronomy Picture of the Day (APOD)**: widget giornaliero nella home

#### 3.7.2 WebXR / VR (Fase sperimentale)
- **Modalità VR**: compatibilità WebXR per headset (Meta Quest, etc.)
  - Controller mapping per navigazione
  - Teleportazione istantanea tra oggetti
  - UI radiale in VR
- **Modalità AR**: proiezione oggetti astronomici nella stanza reale (WebXR hit-test)
  - Scala regolabile: "metti Saturno sul tavolo"

---

### 3.8 PERFORMANCE E ARCHITETTURA

#### 3.8.1 Ottimizzazioni
- **Level of Detail (LOD) avanzato**: 5 livelli per mesh complessi (esopianeti, nebulose)
- **Occlusion culling**: non renderizzare oggetti dietro altri oggetti massicci
- **Texture streaming**: caricamento progressivo texture ad alta risoluzione
- **Worker thread**: calcoli orbitali e fisica in Web Worker
- **Instancing esteso**: per campi stellari milioni di oggetti
- **Compressione**: Draco per geometrie, Basis/KTX2 per texture

#### 3.8.2 Persistenza
- **Stato utente salvato**: preferenze, bookmark, progressi quiz, tour completati
- **Sincronizzazione**: opzionale export/import JSON del profilo
- **Cache intelligente**: texture e dati JSON con TTL e invalidazione

---

## 4. STRUTTURA FILE AGGIORNATA

```
planetario/
├── public/
│   ├── data/
│   │   ├── catalogo/           # Cataloghi JSON per categoria
│   │   │   ├── pianeti.json
│   │   │   ├── stelle.json
│   │   │   ├── galassie.json
│   │   │   ├── nebulose.json
│   │   │   ├── esopianeti.json      ← NUOVO
│   │   │   ├── buchi_neri.json      ← NUOVO
│   │   │   ├── asteroidi.json       ← NUOVO
│   │   │   ├── comete.json          ← NUOVO
│   │   │   └── sonde.json           ← NUOVO
│   │   ├── tour/               # Percorsi didattici predefiniti
│   │   ├── quiz/               # Domande quiz per categoria
│   │   └── glossario.json      # Glossario astronomico
│   ├── textures/
│   │   ├── planets/            # Texture pianeti (giorno/notte/bump/spec)
│   │   ├── stars/              # Texture stelle (corone, superfici)
│   │   ├── nebulae/            # Texture nebulose volumetriche
│   │   ├── galaxies/           # Texture galassie
│   │   └── blackholes/         # Texture buchi neri (disco, jet)
│   ├── audio/
│   │   ├── music/              # Colonne sonore multiple
│   │   └── sfx/                # Effetti sonori e sonificazioni
│   └── shaders/                # Shader GLSL (spostati da src/)
├── src/
│   ├── core/
│   │   ├── renderer.ts
│   │   ├── scene.ts
│   │   ├── camera.ts
│   │   ├── postprocessing.ts
│   │   ├── ibl.ts
│   │   ├── ktx2Loader.ts
│   │   ├── apiClient.ts
│   │   └── textureStreaming.ts   ← NUOVO
│   ├── scenes/
│   │   ├── earth.ts
│   │   ├── solarSystem.ts
│   │   ├── milkyWay.ts
│   │   ├── localGroup.ts
│   │   ├── observableUniverse.ts
│   │   ├── wormhole.ts
│   │   ├── exoplanets.ts       ← NUOVO
│   │   ├── blackHoles.ts       ← NUOVO
│   │   └── sceneManager.ts
│   ├── objects/
│   │   ├── planets/
│   │   ├── stars/
│   │   ├── galaxies/
│   │   ├── nebulae/            ← NUOVO
│   │   ├── blackHoles/         ← NUOVO
│   │   ├── exoplanets/         ← NUOVO
│   │   ├── asteroids/          ← NUOVO
│   │   ├── comets/             ← NUOVO
│   │   └── probes/             ← NUOVO
│   ├── shaders/
│   │   ├── atmosphere.glsl
│   │   ├── nebula.glsl         ← NUOVO
│   │   ├── blackhole.glsl      ← NUOVO
│   │   ├── accretionDisk.glsl  ← NUOVO
│   │   ├── aurora.glsl         ← NUOVO
│   │   ├── gravitationalLens.glsl ← NUOVO
│   │   └── proceduralPlanet.glsl  ← NUOVO
│   ├── systems/
│   │   ├── navigation.ts
│   │   ├── audio.ts
│   │   ├── gemini.ts
│   │   ├── nasa.ts
│   │   ├── wikipedia.ts
│   │   ├── orbitalMechanics.ts  ← NUOVO
│   │   ├── sonification.ts      ← NUOVO
│   │   └── bookmarkManager.ts   ← NUOVO
│   ├── ui/
│   │   ├── hud.ts
│   │   ├── panels.ts
│   │   ├── chat.ts
│   │   ├── minimap.ts
│   │   ├── search.ts            ← NUOVO
│   │   ├── filters.ts           ← NUOVO
│   │   ├── bookmarks.ts         ← NUOVO
│   │   ├── comparison.ts        ← NUOVO
│   │   ├── timeline.ts          ← NUOVO
│   │   ├── compass.ts           ← NUOVO
│   │   ├── notifications.ts     ← NUOVO
│   │   ├── themeSwitcher.ts     ← NUOVO
│   │   ├── accessibility.ts     ← NUOVO
│   │   └── vrMenu.ts            ← NUOVO
│   ├── store/
│   │   └── store.ts             # Zustand con slice: user, scene, audio, bookmarks, quiz, theme
│   ├── types/
│   │   └── index.ts             # Tipi TypeScript estesi
│   ├── config.ts
│   ├── app.ts
│   └── main.ts
├── scripts/
│   ├── validate-catalog.mjs
│   ├── convert-assets.mjs
│   ├── generate-procedural-textures.mjs  ← NUOVO
│   └── fetch-ephemeris.mjs               ← NUOVO
├── tests/
│   ├── unit/
│   └── e2e/
├── vite.config.ts
└── package.json
```

---

## 5. ROADMAP IMPLEMENTATIVA

### Fase A — Contenuti Astronomici (Priorità Alta)
1. Catalogo esopianeti (JSON + shader + pannello)
2. Buchi neri (Sagittarius A*, shader lente gravitazionale)
3. Nebulose planetarie (shader volumetrico)
4. Asteroidi, comete, cintura Kuiper
5. Stelle aggiuntive e catalogo esteso

### Fase B — Visual e Rendering (Priorità Alta)
1. Texture procedurali per oggetti senza dati
2. Atmosfera migliorata per tutti i pianeti
3. Aurora, anelli dettagliati, ombre
4. Label 3D dinamiche e info-bubble
5. IBL per-scena e shadow mapping

### Fase C — UI/UX (Priorità Alta)
1. Tema chiaro/scuro + accessibilità
2. Sidebar navigazione gerarchica
3. Ricerca globale + filtri
4. Bookmark + condivisione
5. Pannello comparativo

### Fase D — Interattività (Priorità Media)
1. Simulazione orbitale real-time
2. Editor sistema planetario
3. Strumenti di misura
4. Tour personalizzati
5. Simulazione espansione universale

### Fase E — Audio e Educativo (Priorità Media)
1. Playlist tematica multipla
2. Sonificazione dati
3. Percorsi didattici strutturati
4. Quiz con punteggio e achievement
5. Glossario integrato

### Fase F — WebXR e Real-time (Priorità Bassa/Futuro)
1. WebXR VR/AR
2. Dati posizioni pianeti real-time
3. Eventi astronomici notifiche
4. APOD widget

---

## 6. CRITERI DI QUALITÀ

- **Scientific accuracy**: tutti i dati devono essere verificabili (fonti NASA, ESA, ESO, arXiv)
- **Performance**: 60 FPS su desktop medio, 30 FPS su mobile con qualità adattiva
- **Accessibilità**: WCAG 2.1 AA compliance
- **Responsive**: funzionante da 320px a 4K, touch + mouse + tastiera
- **Localizzazione**: italiano primario, inglese secondario (i18n ready)
- **Progressive enhancement**: funziona senza API key, senza WebGL2, senza audio

---

## 7. NOTE IMPLEMENTATIVE

- Mantenere la filosofia "web-first": nessun download, nessuna installazione obbligatoria
- Tutte le nuove feature devono essere toggle-abili (feature flags in `config.ts`)
- Preferire dati statici pre-calcolati dove possibile per evitare dipendenze da API esterne
- Documentare ogni shader con commenti GLSL dettagliati
- Testare ogni nuova scena con benchmark automatizzato
- Mantenere retrocompatibilità con save esistenti degli utenti

---

*Prompt Master v2.0 — Generato per Planetario 3D: Interstellar Edition*
*Ambito: miglioramento globale completo su tutti i fronti*
