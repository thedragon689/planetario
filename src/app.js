import './ui/layout.css';
import { createScene } from './core/scene.js';
import { createCamera, updateCameraAspect, CAMERA_PRESETS } from './core/camera.js';
import { createControls, applyControlProfile } from './core/controls.js';
import { createRenderer, resizeRenderer, usesPostProcessing } from './core/renderer.js';
import { createLighting } from './core/lighting.js';
import { createPostProcessing } from './core/postprocessing.js';
import { loadJSON } from './core/loader.js';
import { createEventBus } from './core/eventBus.js';
import { AppError, showFatalError, withFallback } from './core/errors.js';
import { runRenderBenchmark } from './core/benchmark.js';
import { getAppState } from './store/appStore.js';
import { APP_EVENTS } from './types/events.js';
import { createLodManager, MARKER_LOD_LEVELS } from './systems/lod.js';
import { createMemoryMonitor } from './systems/memoryMonitor.js';
import { createGuidedTour } from './systems/guidedTour.js';
import { createMinimap } from './ui/minimap.js';
import * as THREE from 'three';

import { createEarth } from './objects/earth.js';
import { createAtmosphere } from './objects/atmosphere.js';
import { createSun } from './objects/sun.js';
import { createPlanets } from './objects/planets.js';
import { createMoons } from './objects/moons.js';
import { createSolarSystemController } from './objects/solarSystem.js';
import { createSmallBodies } from './objects/smallBodies.js';
import { createLagrangePoints } from './objects/lagrangePoints.js';

import { createAnimationLoop } from './systems/animations.js';
import { createTransitions } from './systems/transitions.js';
import { createRaycaster } from './systems/raycaster.js';
import { createNavigation } from './systems/navigation.js';
import { createLabels } from './systems/labels.js';
import { createAudio } from './systems/audio.js';
import { createNasaClient } from './systems/nasa.js';
import { createWikipediaClient } from './systems/wikipedia.js';
import { createSceneAssetManager } from './systems/sceneAssets.js';
import { collectDataPositions, computeFraming } from './systems/sceneCamera.js';
import { NEBULA_DATA, WORMHOLE_DATA } from './data/phenomena.js';

import { createHUD } from './ui/hud.js';
import { createPanel } from './ui/panel.js';
import { createBookmarksView } from './ui/bookmarksView.js';
import { createSettingsPanel } from './ui/settingsPanel.js';
import { createSidebar } from './ui/sidebar.js';
import { createToastHost } from './ui/toast.js';
import { createTopBar } from './ui/topBar.js';
import { buildSearchIndex, searchCatalog } from './systems/globalSearch.js';
import { parseShareHash, copyShareLink } from './ui/share.js';
import { uiStore } from './store/uiStore.js';
import { timeStore, getSimulationDate } from './store/timeStore.js';
import { gamificationStore, ACHIEVEMENTS, ALL_ACHIEVEMENTS } from './store/gamificationStore.js';
import { createCosmicRuler } from './systems/cosmicRuler.js';
import { createWebXRManager, checkWebXRSupport } from './systems/webxr.js';
import { createCompass } from './ui/compass.js';
import { createComparePanel } from './ui/comparePanel.js';
import { createWarpIndicator } from './ui/warpIndicator.js';
import { createTimeControls } from './ui/timeControls.js';
import { createGlossaryView } from './ui/glossaryView.js';
import { createAchievementsPanel } from './ui/achievementsPanel.js';
import { createTourRunner } from './ui/tourRunner.js';
import { createSizeCompare } from './ui/sizeCompare.js';
import { createScaleBar } from './ui/scaleBar.js';
import { createProbes } from './objects/probes.js';
import { buildCustomSystemMeshes, disposeCustomSystem } from './objects/customSystem.js';
import { createSonification } from './systems/sonification.js';
import { loadGlossary } from './data/glossary.js';
import { createLearningPathsPanel } from './ui/learningPathsPanel.js';
import { createPlanetEditor } from './ui/planetEditor.js';
import { createAstroEventsPanel } from './ui/astroEventsPanel.js';
import { customSystemsStore } from './store/customSystemsStore.js';
import { createOverlays } from './ui/overlays.js';
import { createModal } from './ui/modal.js';
import { createChat } from './ui/chat.js';
import { createChatVoice } from './systems/chatVoice.js';
import { createNavigationCompanion } from './systems/navigationCompanion.js';
import { createVoicePrefetcher } from './systems/voicePrefetcher.js';
import { buildKnowledgeCatalog, buildKnowledgeIndex, suggestFollowUpQuestions } from './systems/knowledgeBase.js';
import { createGeminiChat } from './systems/gemini.js';
import { createGeminiQuiz } from './systems/geminiQuiz.js';
import { initKTX2Loader } from './core/ktx2Loader.js';
import { loadImageBasedLighting, bindEnvToMaterial } from './core/environment.js';
import { setTextureRenderer } from './core/loader.js';
import { captureError } from './core/sentry.js';
import { findExoplanetInDataset } from './data/exoplanetCatalog.js';
import { findExtremeObjectInDataset } from './data/extremeObjectCatalog.js';
import { SCENE_LABELS, SCENES, PERFORMANCE, FEATURES } from './config.js';
import { createSpacetimeGrid } from './objects/spacetimeGrid.js';
import { createDarkMatterHalo } from './objects/darkMatterHalo.js';
import { analyzeAstronomyImage, generateCreativeContent } from './systems/geminiAdvanced.js';
import { userProfileStore } from './store/userProfileStore.js';
import { collectiblesStore } from './store/collectiblesStore.js';
import { telemetryStore } from './store/telemetryStore.js';
import { createProfilePanel } from './ui/profilePanel.js';
import { applyScenePalette, syncVisualThemePostFX } from './ui/visualTheme.js';
import { createGestureHandler, PINCH_ZOOM_SENS } from './ui/gestures.js';
import { createCompass3D } from './ui/compass3d.js';
import { initMobileBottomSheet } from './ui/mobileBottomSheet.js';
import { createContextMenu } from './ui/contextMenu.js';
import { createDrakeCalculator } from './ui/drakeCalculator.js';
import { createStellarEvolutionPanel } from './ui/stellarEvolution.js';
import { createCoordinatesHud } from './ui/coordinatesHud.js';
import { createSpectrumChart } from './ui/spectrumChart.js';
import { createCinemaMode } from './ui/cinemaMode.js';
import { createStarryNightPanel } from './ui/starryNight.js';
import { createVoiceCommands } from './ui/voiceCommands.js';
import { createAudioDescription } from './ui/audioDescription.js';
import { createFeedbackPanel } from './ui/feedbackPanel.js';
import { createCollectiblesPanel } from './ui/collectiblesPanel.js';
import { createSkillTreePanel } from './ui/skillTreePanel.js';
import { createSharedSessionPanel } from './ui/sharedSessionPanel.js';
import { createRelaxMode } from './ui/relaxMode.js';
import { createToolsHub } from './ui/toolsHub.js';
import { setLocale } from './i18n/index.js';

const QUALITY_LEVELS = ['high', 'medium', 'low'];
const QUALITY_ICONS = ['◆', '◇', '○'];
const COSMIC_SCENES = new Set([
  SCENES.MILKY_WAY,
  SCENES.EXOPLANETS,
  SCENES.EXTREME,
  SCENES.LOCAL_GROUP,
  SCENES.OBSERVABLE,
  SCENES.WORMHOLE,
]);

export class PlanetarioApp {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.container = document.getElementById('app');
    this.uiRoot = document.getElementById('ui-root');
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingProgress = this.loadingScreen.querySelector('.loading-progress');
    this.loadingStatus = this.loadingScreen.querySelector('.loading-status');

    this.eventBus = createEventBus();
    this.updatables = [];
    this.qualityLevel = getAppState().quality || 'high';
    this.planetData = null;
    this._lodUnregister = [];
    this._graticuleOn = true;
  }

  setLoadingProgress(pct, status) {
    this.loadingProgress.style.width = `${pct}%`;
    if (status) this.loadingStatus.textContent = status;
    getAppState().setLoading(pct, status);
    this.eventBus.emit(APP_EVENTS.LOADING_PROGRESS, { pct, status });
  }

  setQualityLevel(level, source = 'manual') {
    this.qualityLevel = level;
    getAppState().setQuality(level);
    this.postFX?.setQuality(level);
    this.postFX?.setSceneProfile(this.navigation?.getCurrent?.() || SCENES.EARTH);
    this.syncQualityUi?.();
    this.eventBus.emit(APP_EVENTS.QUALITY_CHANGED, { level, source });
  }

  async init() {
    try {
      await this._initCore();
    } catch (err) {
      const message = err instanceof AppError ? err.message : (err?.message || 'Errore di inizializzazione');
      captureError(err, { phase: 'init' });
      showFatalError(this.container, message);
      this.eventBus.emit(APP_EVENTS.ERROR, { message, recoverable: false });
      throw err;
    }
  }

  async _initCore() {
    this.setLoadingProgress(5, 'Inizializzazione renderer...');

    const { scene, groups } = createScene();
    this.scene = scene;
    this.groups = groups;

    this.camera = createCamera(this.container);
    this.renderer = await createRenderer(this.canvas);
    setTextureRenderer(this.renderer);
    if (FEATURES.ktx2) await initKTX2Loader(this.renderer);

    this.controls = createControls(this.camera, this.canvas);
    this.lighting = createLighting(this.scene);

    if (usesPostProcessing(this.renderer)) {
      this.postFX = createPostProcessing(this.renderer, this.scene, this.camera);
      this.postFX.setQuality(this.qualityLevel);
    } else {
      this.postFX = this._createDirectPostFX();
    }

    this.lodManager = createLodManager(this.camera);

    if (FEATURES.ibl) {
      this.ibl = await loadImageBasedLighting(this.renderer, this.scene);
    }

    this.setLoadingProgress(15, 'Caricamento dataset astronomici...');
    this.planetData = await loadJSON('/data/planets.json');
    this.moonData = await loadJSON('/data/moons.json');
    this.sunData = await loadJSON('/data/sun.json');
    this.starData = await loadJSON('/data/stars.json');
    this.galaxyData = await loadJSON('/data/galaxies.json');
    this.exoplanetData = await loadJSON('/data/exoplanets.json');
    this.extremeData = await loadJSON('/data/extreme-objects.json');
    this.smallBodiesData = await loadJSON('/data/small-bodies.json');
    this.largeScaleData = await loadJSON('/data/large-scale.json');
    this.probeData = await loadJSON('/data/probes.json');
    this.learningPathsData = await loadJSON('/data/learning-paths.json');
    this.astroEventsData = await loadJSON('/data/astro-events.json');
    this.glossaryEntries = FEATURES.extendedGlossary ? await loadGlossary() : [];
    this.nasaData = await loadJSON('/data/nasa.json');
    this.nasa = createNasaClient();
    this.wikipedia = createWikipediaClient();

    const sunRich = this.starData?.stars?.find((s) => s.id === 'sun');
    const knowledgeCatalog = buildKnowledgeCatalog({
      planets: this.planetData,
      moons: this.moonData,
      stars: this.starData,
      galaxies: this.galaxyData,
      exoplanets: this.exoplanetData,
      extreme: this.extremeData,
      smallBodies: this.smallBodiesData,
      sun: { ...sunRich, ...this.sunData, name: 'Sole' },
      nasa: this.nasaData,
    });
    const knowledgeIndex = buildKnowledgeIndex(knowledgeCatalog);
    this.knowledgeIndex = knowledgeIndex;
    this.knowledgeCatalog = knowledgeCatalog;
    this.geminiChat = createGeminiChat({ catalog: knowledgeCatalog, index: knowledgeIndex });
    this.geminiQuiz = createGeminiQuiz({
      gemini: this.geminiChat,
      catalog: knowledgeCatalog,
      index: knowledgeIndex,
    });
    this._selectedObject = null;

    const earthData = this.planetData.planets.find((p) => p.id === 'earth');

    this.setLoadingProgress(25, 'Creazione Terra fotorealistica...');
    this.earth = await createEarth(groups.earth, this.lighting, earthData);
    this.atmosphere = createAtmosphere(this.earth.group, this.lighting.sun);
    this.updatables.push(this.earth, this.atmosphere);

    this.setLoadingProgress(40, 'Costruzione Sistema Solare...');
    groups.solarSystem.visible = false;
    this.sun = await createSun(groups.solarSystem, this.sunData);
    const planets = await createPlanets(groups.solarSystem, this.sun, this.planetData);
    const moons = await createMoons(planets.bodyMap, this.sun, this.moonData);
    const smallBodies = await createSmallBodies(groups.solarSystem, this.sun, this.smallBodiesData);
    let lagrange = null;
    if (FEATURES.lagrangePoints) {
      const earthEntry = this.planetData.planets.find((p) => p.id === 'earth');
      lagrange = createLagrangePoints(groups.solarSystem, earthEntry?.distanceFromSun || 15);
      lagrange.setVisible(false);
    }
    let probes = null;
    if (FEATURES.spaceProbes) {
      probes = createProbes(groups.solarSystem, this.probeData, {
        getSimulationYear: () => new Date(getSimulationDate()).getFullYear(),
      });
      probes.setVisible(false);
    }
    this.solarSystem = createSolarSystemController(this.sun, planets, moons, smallBodies, lagrange, probes);
    this.lagrange = lagrange;
    this.probes = probes;
    this.customSystemsGroup = new THREE.Group();
    this.customSystemsGroup.name = 'CustomSystems';
    groups.solarSystem.add(this.customSystemsGroup);
    this._activeCustomSystem = null;
    this.smallBodies = smallBodies;
    this.planets = planets;
    this.moons = moons;
    this.updatables.push(this.solarSystem);
    this._bindEnvMaterials();

    this.sceneAssets = createSceneAssetManager({
      groups,
      scene,
      updatables: this.updatables,
      getQualityLevel: () => this.qualityLevel,
    });

    if (FEATURES.spacetimeGrid) {
      this.spacetimeGrid = createSpacetimeGrid(1);
      this.spacetimeGrid.setVisible(false);
      this.scene.add(this.spacetimeGrid.group);
    }
    if (FEATURES.darkMatterHalo) {
      this.darkMatterHalo = createDarkMatterHalo(140);
      this.scene.add(this.darkMatterHalo.group);
      this.updatables.push(this.darkMatterHalo);
    }

    this.setLoadingProgress(90, 'Configurazione UI olografica...');
    this.toast = createToastHost(this.uiRoot);
    this.hud = createHUD(this.uiRoot);
    this.panel = createPanel(this.uiRoot, {
      onClose: () => {
        this.raycaster?.clearSelection();
        this.labels?.setSelected(null);
        this.overlays?.setFocusMode(false);
        this.topBar?.renderBreadcrumb(this.navigation?.getCurrent?.() || SCENES.EARTH, null);
      },
      getCanvas: () => this.canvas,
      getScene: () => this.navigation?.getCurrent?.() || SCENES.EARTH,
      onToast: (message, opts) => this.toast?.show(message, opts),
      onScreenshot: () => {
        if (FEATURES.gamification) gamificationStore.getState().recordScreenshot();
      },
      onCompare: (data) => {
        this.comparePanel?.show(data);
        this.toast?.show('Seleziona il secondo oggetto da confrontare', { type: 'info' });
      },
    });
    this.modal = createModal(this.uiRoot);
    this.audio = createAudio();
    this.chatVoice = createChatVoice({
      hasApiKey: () => this.geminiChat.hasApiKey(),
      onSpeakStart: () => this.audio.duck(),
      onSpeakEnd: () => this.audio.unduck(),
    });

    this.companion = createNavigationCompanion({
      voice: this.chatVoice,
      getSession: () => ({
        scene: this.navigation?.getCurrent?.() || SCENES.EARTH,
        sceneLabel: this.navigation?.getCurrentLabel?.() || SCENE_LABELS[SCENES.EARTH],
      }),
      root: this.uiRoot,
    });

    this.voicePrefetcher = createVoicePrefetcher({
      voice: this.chatVoice,
      getSession: () => ({
        scene: this.navigation?.getCurrent?.() || SCENES.EARTH,
        sceneLabel: this.navigation?.getCurrentLabel?.() || SCENE_LABELS[SCENES.EARTH],
      }),
      getDatasets: () => ({
        planets: this.planetData,
        moons: this.moonData,
        stars: this.starData,
        galaxies: this.galaxyData,
        exoplanets: this.exoplanetData,
        extreme: this.extremeData,
        sun: this.sunData,
      }),
    });

    this.chat = createChat(this.uiRoot, {
      gemini: this.geminiChat,
      geminiQuiz: this.geminiQuiz,
      voice: this.chatVoice,
      companion: this.companion,
      audio: this.audio,
      getSession: () => ({
        scene: this.navigation?.getCurrent?.() || SCENES.EARTH,
        sceneLabel: this.navigation?.getCurrentLabel?.() || SCENE_LABELS[SCENES.EARTH],
        selectedObject: this._selectedObject,
      }),
      onOpenChange: (open) => {
        document.documentElement.classList.toggle('chat-open', open);
        getAppState().setChatOpen(open);
        this.eventBus.emit(APP_EVENTS.CHAT_TOGGLED, { open });
        this.overlays?.setChatActive(open);
      },
      suggestFollowUps: (session) => suggestFollowUpQuestions(session, this.knowledgeIndex),
      onQuizPerfect: () => {
        if (!FEATURES.gamification) return;
        gamificationStore.getState().recordQuizPerfect();
      },
      onQuizScore: (pct) => {
        if (FEATURES.userProfile) userProfileStore.getState().recordQuizScore(pct);
      },
      getQuizDifficulty: () => (FEATURES.userProfile ? userProfileStore.getState().getQuizDifficulty() : 'medium'),
      onCreative: FEATURES.geminiVision
        ? async (kind, obj) => generateCreativeContent(
          kind,
          obj.name,
          '',
          {
            scene: this.navigation?.getCurrent?.(),
            sceneLabel: this.navigation?.getCurrentLabel?.(),
            selectedObject: obj,
          },
          this.knowledgeCatalog,
          this.knowledgeIndex
        )
        : undefined,
      onVisionImage: FEATURES.geminiVision
        ? async (dataUrl, mime, prompt) => analyzeAstronomyImage(
          dataUrl,
          mime,
          prompt,
          {
            scene: this.navigation?.getCurrent?.(),
            selectedObject: this._selectedObject,
          },
          this.knowledgeCatalog,
          this.knowledgeIndex
        )
        : undefined,
    });

    this.sceneServices = {
      getWormhole: () => this.sceneAssets.getWormhole(),
      getStars: () => this.sceneAssets.getStars(),
      ensureScene: (sceneKey) => this.prepareCosmicScene(sceneKey),
      fitCamera: (sceneKey) => this.fitSceneCamera(sceneKey),
      applyControls: (sceneKey) => applyControlProfile(this.controls, sceneKey),
      setCosmicBackdrop: (visible) => this.sceneAssets.setCosmicBackdropVisible(visible),
      updateGalaxyForScene: (sceneKey) => this.sceneAssets.updateGalaxyForScene(sceneKey),
      cleanupScene: (sceneKey) => this.sceneAssets.cleanupScene(sceneKey),
    };

    this.warpIndicator = createWarpIndicator(this.uiRoot);

    this.transitions = createTransitions(
      this.camera,
      this.controls,
      this.postFX,
      (sceneKey) => this.onSceneTransition(sceneKey),
      ({ progress, active, sceneKey }) => {
        if (active) {
          this.warpIndicator.show(SCENE_LABELS[sceneKey] || 'Transito cosmico', progress);
        } else {
          this.warpIndicator.hide();
        }
      }
    );

    this.navigation = createNavigation(
      this.transitions,
      this.groups,
      this.sceneServices,
      this.postFX,
      this.scene,
      (sceneKey, label) => {
        const idx = this.navigation.getIndex();
        getAppState().setScene(sceneKey, label, idx);
        this.eventBus.emit(APP_EVENTS.SCENE_CHANGED, { scene: sceneKey, label, index: idx });
        this.overlays.updateScene(sceneKey, idx);
        this.minimap?.setScene(idx, sceneKey);
        this.sidebar?.setActiveScene(sceneKey);
        this.topBar?.renderBreadcrumb(sceneKey, this._selectedObject?.name || null);
        this.guidedTour?.reset?.();
        this.hud.update(this.camera, label, sceneKey);
        if (FEATURES.scenePlaylists && this.audio.crossfadeToScene) {
          this.audio.crossfadeToScene(sceneKey);
          this.overlays?.controls?.querySelector('[data-action="audio"]')?.setAttribute(
            'title',
            this.audio.getTrackLabel?.() || ''
          );
        } else {
          this.audio.setSceneVolume(sceneKey);
        }
        this.voicePrefetcher?.prefetchScene(sceneKey);
        if (FEATURES.gamification) {
          gamificationStore.getState().visitScene(sceneKey);
          this._syncGamificationHud();
        }
        if (FEATURES.telemetry) {
          telemetryStore.getState().track('scene_visit', sceneKey);
        }
        if (FEATURES.sharedSessions) {
          this.sharedSession?.broadcastNavigate(sceneKey);
        }
        this.audioDescription?.describeScene(sceneKey);
        this._onSceneChangedV21(sceneKey);
        if (FEATURES.scenePalettes) applyScenePalette(sceneKey);
        if (FEATURES.visualThemes) syncVisualThemePostFX(this.postFX, sceneKey);
        this._onSceneChangedV22(sceneKey);
        if (FEATURES.timeSimulation) {
          this.timeControls?.setVisible(sceneKey === SCENES.SOLAR_SYSTEM);
          this.lagrange?.setVisible(sceneKey === SCENES.SOLAR_SYSTEM && this._lagrangeVisible);
          this.probes?.setVisible(sceneKey === SCENES.SOLAR_SYSTEM && this._probesVisible);
        }
        if (!COSMIC_SCENES.has(sceneKey)) {
          const stars = this.sceneAssets.getStars();
          if (stars) stars.points.visible = false;
        }
      },
      this.controls
    );

    this.overlays = createOverlays(this.uiRoot, this.navigation, this.audio, {
      onMissions: () => this.showMissionsModal(),
      onGraticuleToggle: (visible) => {
        this._graticuleOn = visible;
        this.earth?.setGraticuleVisible(visible);
      },
      wikipedia: this.wikipedia,
      onChat: () => {
        this.chat.toggle();
        this.overlays.setChatActive(this.chat.isOpen());
      },
    });
    this.navigation.syncScene();
    this.overlays.updateScene(this.navigation.getCurrent(), this.navigation.getIndex());
    this.postFX.setQuality(this.qualityLevel);

    this._initPhaseBUi();
    this._initPhaseCD();
    this._initPhaseV21();
    this._initPhaseV22();

    this.minimap = createMinimap(this.uiRoot);
    this.minimap.setScene(this.navigation.getIndex(), this.navigation.getCurrent());
    this.memoryMonitor = createMemoryMonitor(this.renderer, this.uiRoot);
    this.guidedTour = createGuidedTour({
      chat: this.chat,
      getScene: () => this.navigation.getCurrent(),
    });
    const toolsDrawer = this.overlays.controls.querySelector('.overlay-tools-drawer');
    if (toolsDrawer && this.guidedTour.button) {
      toolsDrawer.appendChild(this.guidedTour.button);
    }

    this.overlays.controls.querySelector('[data-action="focus"]').addEventListener('click', () => {
      this.raycaster.clearSelection();
      this.labels.setSelected(null);
      this.panel.hide();
      this.overlays.setFocusMode(false);
      this.companion.stop();
      this.transitions.resetToScene(this.navigation.getCurrent());
    });

    let qualityIdx = 0;
    const qualityBtn = this.overlays.controls.querySelector('[data-action="quality"]');
    const syncQualityUi = () => {
      qualityIdx = QUALITY_LEVELS.indexOf(this.qualityLevel);
      if (qualityIdx < 0) qualityIdx = 0;
      qualityBtn.textContent = QUALITY_ICONS[qualityIdx];
    };
    qualityBtn.addEventListener('click', () => {
      qualityIdx = (qualityIdx + 1) % QUALITY_LEVELS.length;
      this.setQualityLevel(QUALITY_LEVELS[qualityIdx], 'manual');
      qualityBtn.textContent = QUALITY_ICONS[qualityIdx];
    });
    this.syncQualityUi = syncQualityUi;

    this.labels = createLabels(this.uiRoot);
    this.labels.add('earth-view', this.earth.earth, 'TERRA', { scene: 'earth' });
    this.labels.add('sun', this.sun.sun, 'SOLE', { scene: 'solar' });
    this.planets.planets.forEach(({ mesh, data }) => {
      const labelId = data.id === 'earth' ? 'earth-solar' : data.id;
      this.labels.add(labelId, mesh, data.name.toUpperCase(), { scene: 'solar' });
    });
    this.moons.moons.forEach(({ mesh, data }) => {
      this.labels.add(data.id, mesh, data.name.toUpperCase(), { scene: 'solar' });
    });
    this.probeData?.probes?.forEach((probe) => {
      this.labels.add(probe.id, this.probes?.probes?.find((p) => p.def.id === probe.id)?.mesh, probe.name.toUpperCase(), { scene: 'solar' });
    });

    this.raycaster = createRaycaster(
      this.camera,
      this.canvas,
      () => this.getSelectableObjects(),
      () => this.transitions?.isActive?.() ?? false,
      { orbitControls: this.controls }
    );

    this.raycaster.onHover((obj) => {
      this.labels.setHovered(obj?.userData?.id ?? null);
      if (!obj) return;
      const data = obj.userData.data || this.findDataById(obj.userData.id);
      if (data) this.companion.prefetchObject(data, { priority: true });
    });

    this.raycaster.onPointerDown((obj) => {
      if (!obj) return;
      const data = obj.userData.data || this.findDataById(obj.userData.id);
      if (data) this.companion.prefetchObject(data, { priority: true });
    });

    this.raycaster.onSelect(async (obj) => {
      if (!obj) {
        this._selectedObject = null;
        getAppState().selectObject(null);
        this.eventBus.emit(APP_EVENTS.OBJECT_DESELECTED, {});
        this.labels.setSelected(null);
        this.panel.hide();
        this.overlays.setFocusMode(false);
        this.companion.stop();
        return;
      }
      const data = obj.userData.data || this.findDataById(obj.userData.id);
      if (!data) {
        console.warn('[Click] Oggetto selezionato senza dati catalogo:', obj.userData);
        this.toast?.show('Dati non disponibili per questo oggetto', { type: 'info' });
        return;
      }

      this._selectedObject = data;
      getAppState().selectObject(data);
      this.eventBus.emit(APP_EVENTS.OBJECT_SELECTED, { object: data });
      if (FEATURES.gamification) {
        gamificationStore.getState().visitObject(data.id, { type: data.type || data.category });
        this._syncGamificationHud();
      }
      this.labels.setSelected(obj.userData.id);
      this.topBar?.renderBreadcrumb(this.navigation.getCurrent(), data.name);
      this.companion.announceObject(data);
      this.chat?.notifySelection(data);
      if (FEATURES.sonification) {
        this.sonification?.sonifyObject(data);
      }
      this.audio.playSpatialTone?.({ frequency: 280 + Math.random() * 80, x: 0.2, z: -1 });

      const searchUrl = this.nasa.getSearchUrl(this.nasa.getQueryForObject(data.id, data.name));
      this.panel.showLoading(data);
      this.overlays.setFocusMode(true);

      const focusDistance = {
        galaxy: 120,
        nebula: 120,
        wormhole: 12,
        star: 55,
        exoplanet: 28,
        black_hole: 45,
        pulsar: 35,
        magnetar: 35,
      }[obj.userData.type] ?? 3;
      this.transitions.focusOnObject(obj, focusDistance);

      const [nasaResults, wikiResult] = await Promise.all([
        withFallback(
          () => this.nasa.searchForObject(data.id, data.name),
          null,
          { label: 'Ricerca NASA', eventBus: this.eventBus }
        ),
        withFallback(
          () => this.wikipedia.getSummaryForObject(data.id, data.name, {
            catalog: data.catalog,
            type: data.type || data.category,
          }),
          null,
          { label: 'Wikipedia', eventBus: this.eventBus }
        ),
      ]);

      this.panel.show(data, { nasaResults, searchUrl, wikiResult });
    });

    this.setupResize();
    this.setupInteraction();

    this.setLoadingProgress(95, 'Benchmark grafico...');
    const benchmark = await runRenderBenchmark(() => {
      this.renderer.render(this.scene, this.camera);
    });
    getAppState().setBenchmarkScore(benchmark.avgFps);
    if (benchmark.suggestedQuality !== this.qualityLevel) {
      this.setQualityLevel(benchmark.suggestedQuality, 'auto');
    }

    this.setLoadingProgress(100, 'Pronto');
    this.startRenderLoop();
    await this.waitForWarmupFrame();
    await this.hideLoading();
    await this._applyShareHash();
    this._showUpcomingAstroEvents();
    this.voicePrefetcher?.prefetchScene(this.navigation.getCurrent());
  }

  _getSearchDatasets() {
    return {
      planets: this.planetData,
      moons: this.moonData,
      stars: this.starData,
      galaxies: this.galaxyData,
      exoplanets: this.exoplanetData,
      extreme: this.extremeData,
      smallBodies: this.smallBodiesData,
      sun: this.sunData,
    };
  }

  _initPhaseBUi() {
    this.searchIndex = buildSearchIndex(this._getSearchDatasets());

    this.settingsPanel = createSettingsPanel(this.uiRoot);
    this.bookmarksView = createBookmarksView(this.uiRoot, {
      onSelect: (id) => this.openObjectById(id),
    });

    this.sidebar = createSidebar(this.uiRoot, {
      onNavigateScene: (sceneKey) => this.navigation.goTo(sceneKey),
      onSelectObject: (_id, filter) => {
        if (filter) this.topBar?.setSearchFilter('', filter);
      },
      onOpenBookmarks: () => this.bookmarksView.show(),
      onOpenSettings: () => this.settingsPanel.show(),
      onOpenGlossary: () => this.glossaryView?.show(),
      onOpenAchievements: () => this.achievementsPanel?.show(),
      onOpenTours: () => this.tourRunner?.show(),
      onOpenLearning: () => this.learningPaths?.show(),
      onOpenEditor: () => this.planetEditor?.show(),
      onOpenEvents: () => this.astroEventsPanel?.show(),
      onOpenProfile: () => this.profilePanel?.show(),
      onOpenTools: () => this.toolsHub?.show(),
      onOpenCollectibles: () => this.collectiblesPanel?.show(),
      onOpenDrake: () => this.drakeCalculator?.show(),
      onOpenCinema: () => this.cinemaMode?.show(),
      onOpenStarry: () => this.starryNight?.show(),
      onOpenSession: () => this.sharedSession?.show(),
      onOpenFeedback: () => this.feedbackPanel?.show(),
      onOpenSkillTree: () => this.skillTreePanel?.show(),
    });

    this.topBar = createTopBar(this.uiRoot, {
      onMenuToggle: () => this.sidebar.toggle(),
      onThemeToggle: () => {
        uiStore.getState().toggleTheme();
        this.toast.show(
          uiStore.getState().theme === 'dark' ? 'Tema scuro attivo' : 'Tema chiaro attivo',
          { type: 'info' }
        );
      },
      onSettingsOpen: () => this.settingsPanel.show(),
      onSearch: (query, filters) => searchCatalog(this.searchIndex, query, filters || {}),
      onSearchSelect: (entry) => this.openObjectById(entry.id, entry.scene),
      onBreadcrumbNavigate: (scene) => {
        if (scene) this.navigation.goTo(scene);
      },
    });

    this.topBar.renderBreadcrumb(this.navigation.getCurrent(), null);
    this.sidebar.setActiveScene(this.navigation.getCurrent());
    this.toast.show('Suggerimento: Ctrl+K per cercare oggetti celesti', { type: 'info', duration: 4500 });
  }

  _initPhaseCD() {
    this._lagrangeVisible = false;
    this._probesVisible = false;

    if (FEATURES.timeSimulation) {
      this.solarSystem.setEphemerisMode(true, () => getSimulationDate());
      this.timeControls = createTimeControls(this.uiRoot);
      this.timeControls.setVisible(this.navigation.getCurrent() === SCENES.SOLAR_SYSTEM);
    }

    this.compass = createCompass(this.uiRoot, () => this.controls.getAzimuthalAngle?.() ?? 0);
    this.scaleBar = createScaleBar(this.uiRoot);

    this.comparePanel = createComparePanel(this.uiRoot, {
      onSearch: (query) => searchCatalog(this.searchIndex, query, {}),
      onSizeCompare: (a, b) => this.sizeCompare?.show(a, b),
    });

    if (FEATURES.gamification) {
      this.glossaryView = createGlossaryView(this.uiRoot, {
        entries: this.glossaryEntries,
        onTermRead: (term) => gamificationStore.getState().recordGlossaryTerm(term),
      });
      this.achievementsPanel = createAchievementsPanel(this.uiRoot);
      let prevUnlocked = [...gamificationStore.getState().unlocked];
      gamificationStore.subscribe((s) => {
        const newest = s.unlocked.find((id) => !prevUnlocked.includes(id));
        if (newest) {
          const ach = ALL_ACHIEVEMENTS.find((a) => a.id === newest);
          if (ach) this.toast?.show(`Achievement: ${ach.title}`, { type: 'success', duration: 4500 });
        }
        prevUnlocked = [...s.unlocked];
        this._syncGamificationHud();
      });
      this._syncGamificationHud();
    }

    this.tourRunner = createTourRunner(this.uiRoot, {
      onToast: (msg) => this.toast?.show(msg, { type: 'info' }),
      onStep: async (step) => {
        if (step.scene) await this.navigation.goTo(step.scene);
        if (step.objectId) await this.openObjectById(step.objectId, step.scene);
        this.companion?.announceObject?.(this.findDataById(step.objectId) || { name: step.message });
      },
    });

    if (FEATURES.learningPaths && this.learningPathsData?.paths) {
      this.learningPaths = createLearningPathsPanel(this.uiRoot, this.learningPathsData.paths, {
        onToast: (msg) => this.toast?.show(msg, { type: 'success' }),
        onStep: async (path, step) => {
          if (step.scene) await this.navigation.goTo(step.scene);
          if (step.objectId) await this.openObjectById(step.objectId, step.scene);
          this.toast?.show(`${path.title}: ${step.title}`, { type: 'info' });
        },
      });
    }

    if (FEATURES.planetEditor) {
      this.planetEditor = createPlanetEditor(this.uiRoot, {
        onToast: (msg) => this.toast?.show(msg, { type: 'success' }),
        onPreview: (id) => this._previewCustomSystem(id),
      });
    }

    if (FEATURES.astroEvents && this.astroEventsData) {
      this.astroEventsPanel = createAstroEventsPanel(this.uiRoot, this.astroEventsData);
    }

    if (FEATURES.sonification) {
      this.sonification = createSonification(this.audio);
    }

    if (FEATURES.extendedGlossary && !FEATURES.gamification && this.glossaryEntries.length) {
      this.glossaryView = createGlossaryView(this.uiRoot, { entries: this.glossaryEntries });
    }

    if (FEATURES.sizeCompare) {
      this.sizeCompare = createSizeCompare(this.uiRoot);
    }

    if (FEATURES.cosmicRuler) {
      this.cosmicRuler = createCosmicRuler(this.scene, this.camera, this.canvas);
    }

    if (FEATURES.webxr) {
      this.webxr = createWebXRManager(this.renderer, this.scene, this.camera, this.canvas);
      checkWebXRSupport().then(({ vr, ar }) => {
        this._webxrSupport = { vr, ar };
      });
    }

    this._injectToolButtons();
  }

  _initPhaseV21() {
    const ui = uiStore.getState();
    if (ui.dyslexicFont) document.documentElement.classList.add('dyslexic-font');
    if (ui.simplifiedUi) document.documentElement.classList.add('simplified-ui');
    if (FEATURES.i18n) setLocale(ui.locale);

    if (FEATURES.userProfile) {
      const streak = userProfileStore.getState().touchDailyStreak();
      if (streak > 1) {
        gamificationStore.getState().addXp(streak * 2);
        this.toast?.show(`Serie giornaliera: ${streak} giorni (+${streak * 2} XP)`, { type: 'success' });
      }
      this.profilePanel = createProfilePanel(this.uiRoot);
    }

    if (FEATURES.drakeCalculator) this.drakeCalculator = createDrakeCalculator(this.uiRoot);
    if (FEATURES.stellarEvolution) this.stellarEvolution = createStellarEvolutionPanel(this.uiRoot);
    if (FEATURES.coordinatesHud) {
      this.coordinatesHud = createCoordinatesHud(this.uiRoot);
      this.coordinatesHud.setVisible(true);
    }
    if (FEATURES.spectrumChart) this.spectrumChart = createSpectrumChart(this.uiRoot);
    if (FEATURES.collectibles) this.collectiblesPanel = createCollectiblesPanel(this.uiRoot);
    if (FEATURES.skillTree) this.skillTreePanel = createSkillTreePanel(this.uiRoot);
    if (FEATURES.feedbackWidget) {
      this.feedbackPanel = createFeedbackPanel(this.uiRoot, (msg) => this.toast?.show(msg, { type: 'success' }));
    }
    if (FEATURES.starryNight) this.starryNight = createStarryNightPanel(this.uiRoot);

    this.toolsHub = createToolsHub(this.uiRoot, {
      onOpenProfile: () => this.profilePanel?.show(),
      onOpenCollectibles: () => this.collectiblesPanel?.show(),
      onOpenSkillTree: () => this.skillTreePanel?.show(),
      onOpenDrake: () => this.drakeCalculator?.show(),
      onOpenCinema: () => this.cinemaMode?.show(),
      onOpenStarry: () => this.starryNight?.show(),
      onOpenStellar: () => this.stellarEvolution?.show(),
      onOpenSpectrum: () => {
        const star = this._selectedObject || { name: 'Sole', temperature: 5778, spectralClass: 'G' };
        this.spectrumChart?.showForStar(star);
      },
      onOpenSession: () => this.sharedSession?.show(),
      onOpenFeedback: () => this.feedbackPanel?.show(),
    });

    if (FEATURES.cinemaMode) {
      this.cinemaMode = createCinemaMode(this.uiRoot, {
        speak: (text) => this.chatVoice?.speak(text),
        onStep: async (step) => {
          if (step.scene) await this.navigation.goTo(step.scene);
          if (step.objectId) await this.openObjectById(step.objectId, step.scene);
        },
        onEnd: () => this.toast?.show('Fine sequenza cinema', { type: 'info' }),
      });
    }

    if (FEATURES.sharedSessions) {
      this.sharedSession = createSharedSessionPanel(this.uiRoot, {
        onFollowNavigate: (scene) => this.navigation.goTo(scene),
        onFollowSelect: (id) => this.openObjectById(id),
        onToast: (msg) => this.toast?.show(msg, { type: 'info' }),
      });
    }

    if (FEATURES.relaxMode) this.relaxMode = createRelaxMode(this.controls);

    if (FEATURES.audioDescription) {
      this.audioDescription = createAudioDescription((text) => this.chatVoice?.speak(text));
    }

    if (FEATURES.voiceCommands) {
      this.voiceCommands = createVoiceCommands({
        onNavigate: (target) => {
          const entry = searchCatalog(this.searchIndex, target, {}).find((e) =>
            e.name?.toLowerCase().includes(target.toLowerCase())
          );
          if (entry) this.openObjectById(entry.id, entry.scene);
          else this.toast?.show(`Oggetto non trovato: ${target}`, { type: 'info' });
        },
        onZoom: (dir) => {
          const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
          const len = offset.length() || 1;
          offset.normalize().multiplyScalar(dir === 'in' ? len * 0.85 : len * 1.15);
          this.camera.position.copy(this.controls.target).add(offset);
        },
        onNextScene: () => this.navigation.next(),
        onPrevScene: () => this.navigation.prev(),
        onTogglePanel: (name) => {
          if (name === 'profile') this.profilePanel?.show();
          if (name === 'glossary') this.glossaryView?.show();
        },
      });
    }

    if (FEATURES.advancedAccessibility) {
      this._sessionStartMs = Date.now();
      this._breakReminderShown = false;
    }

    this._lastSceneKey = this.navigation.getCurrent();
    this._sceneTimeAcc = 0;
    this._sunStareSeconds = 0;
  }

  _onSceneChangedV21(sceneKey) {
    if (this._lastSceneKey && FEATURES.telemetry) {
      telemetryStore.getState().trackSceneTime(this._lastSceneKey, this._sceneTimeAcc);
    }
    this._lastSceneKey = sceneKey;
    this._sceneTimeAcc = 0;
    if (FEATURES.spacetimeGrid && this.spacetimeGrid) {
      const show = sceneKey === SCENES.SOLAR_SYSTEM || sceneKey === SCENES.EXTREME;
      this.spacetimeGrid.setVisible(show);
      if (sceneKey === SCENES.EXTREME) this.spacetimeGrid.setMass(4e6);
      else this.spacetimeGrid.setMass(1);
    }
    if (FEATURES.darkMatterHalo && this.darkMatterHalo) {
      this.darkMatterHalo.setVisible([SCENES.MILKY_WAY, SCENES.LOCAL_GROUP, SCENES.OBSERVABLE].includes(sceneKey));
    }
  }

  _onSceneChangedV22(sceneKey) {
    if (FEATURES.auroraEffect && this.earth?.aurora) {
      this.earth.aurora.setVisible(sceneKey === SCENES.EARTH);
    }
  }

  _initPhaseV22() {
    if (FEATURES.scenePalettes) {
      applyScenePalette(this.navigation.getCurrent());
    }
    if (FEATURES.visualThemes) {
      syncVisualThemePostFX(this.postFX, this.navigation.getCurrent());
      window.addEventListener('visualthemechange', () => {
        syncVisualThemePostFX(this.postFX, this.navigation?.getCurrent?.());
      });
    }

    if (FEATURES.compass3d) {
      this.compass3d = createCompass3D(this.camera, this.lighting);
      if (this.compass?.element) this.compass.element.style.display = 'none';
    }

    if (FEATURES.mobileBottomSheet && this.panel?.element) {
      this._mobileSheet = initMobileBottomSheet(this.panel.element);
      this.panel.element.addEventListener('bottomsheet-close', () => this.panel.hide());
    }

    if (FEATURES.mobileGestures) {
      this._contextMenu = createContextMenu(this.uiRoot);
      let lastPinchScale = 1;

      this._gestureHandler = createGestureHandler(this.canvas, {
        enabled: () => !this.chat?.isOpen?.(),
        onSwipeLeft: () => this.navigation.next(),
        onSwipeRight: () => this.navigation.prev(),
        onSwipeUp: () => {
          if (this._selectedObject && this.panel?.show) {
            this.openObjectById(this._selectedObject.id, this.navigation.getCurrent());
          }
        },
        onSwipeDown: () => this.panel?.hide(),
        onPinch: (scale) => {
          const factor = 1 / ((scale / lastPinchScale) || 1);
          lastPinchScale = scale;
          const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
          offset.multiplyScalar(Math.pow(factor, PINCH_ZOOM_SENS));
          const len = Math.max(0.6, Math.min(8000, offset.length()));
          offset.setLength(len);
          this.camera.position.copy(this.controls.target).add(offset);
        },
        onPinchEnd: () => {
          lastPinchScale = 1;
        },
        onDoubleTap: () => this.fitSceneCamera(this.navigation.getCurrent()),
        onLongPress: ({ x, y }) => {
          this._contextMenu?.show(x, y, (action) => {
            if (action === 'info' && this._selectedObject) {
              this.openObjectById(this._selectedObject.id, this.navigation.getCurrent());
            } else if (action === 'share' && this._selectedObject) {
              copyShareLink({ scene: this.navigation.getCurrent(), objectId: this._selectedObject.id })
                .then(() => this.toast?.show('Link copiato', { type: 'success' }));
            } else if (action === 'bookmark' && this._selectedObject) {
              uiStore.getState().toggleBookmark({
                id: this._selectedObject.id,
                name: this._selectedObject.name,
                type: this._selectedObject.type,
                scene: this.navigation.getCurrent(),
              });
              this.toast?.show('Preferito aggiornato', { type: 'info' });
            }
          });
        },
      });

      if (document.documentElement.dataset.layout === 'mobile') {
        const hint = document.createElement('div');
        hint.className = 'gesture-hint visible';
        hint.textContent = '← → scene · ↑ info · ↓ chiudi · pinch zoom · pressione lunga menu';
        this.uiRoot.appendChild(hint);
        setTimeout(() => hint.classList.remove('visible'), 7000);
      }
    }

    if (FEATURES.glassV22) {
      document.documentElement.classList.add('glass-v22-enabled');
    }
  }

  _injectToolButtons() {
    const controls = this.overlays?.controls;
    if (!controls) return;

    const drawer = controls.querySelector('.overlay-tools-drawer');
    const toolsToggle = controls.querySelector('[data-action="tools-expand"]');
    if (!drawer) return;

    const tools = document.createElement('div');
    tools.className = 'overlay-tools';
    tools.innerHTML = `
      ${FEATURES.sonification ? '<button type="button" class="ctrl-btn" data-tool="sonify" title="Sonifica oggetto">♫</button>' : ''}
      ${FEATURES.spaceProbes ? '<button type="button" class="ctrl-btn" data-tool="probes" title="Sonde spaziali">🛰</button>' : ''}
      ${FEATURES.lagrangePoints ? '<button type="button" class="ctrl-btn" data-tool="lagrange" title="Punti di Lagrange">L</button>' : ''}
      ${FEATURES.cosmicRuler ? '<button type="button" class="ctrl-btn" data-tool="ruler" title="Righello cosmico">📏</button>' : ''}
      ${FEATURES.sizeCompare ? '<button type="button" class="ctrl-btn" data-tool="size" title="Confronto dimensioni">⇅</button>' : ''}
      ${FEATURES.webxr ? '<button type="button" class="ctrl-btn" data-tool="vr" title="WebXR VR">VR</button>' : ''}
      ${FEATURES.voiceCommands ? '<button type="button" class="ctrl-btn" data-tool="voice" title="Comandi vocali">🎤</button>' : ''}
      ${FEATURES.relaxMode ? '<button type="button" class="ctrl-btn" data-tool="relax" title="Modalità relax">☯</button>' : ''}
      ${FEATURES.stellarEvolution ? '<button type="button" class="ctrl-btn" data-tool="stellar" title="Evoluzione stellare">★</button>' : ''}
      ${FEATURES.spectrumChart ? '<button type="button" class="ctrl-btn" data-tool="spectrum" title="Spettro stellare">≋</button>' : ''}
      ${FEATURES.audioDescription ? '<button type="button" class="ctrl-btn" data-tool="describe" title="Descrizione audio scena">🔈</button>' : ''}
    `;
    drawer.appendChild(tools);
    if (!tools.childElementCount && toolsToggle) {
      toolsToggle.hidden = true;
    }

    tools.querySelector('[data-tool="sonify"]')?.addEventListener('click', () => {
      if (!this._selectedObject) {
        this.toast?.show('Seleziona un oggetto da sonificare', { type: 'info' });
        return;
      }
      const kind = this.sonification?.sonifyObject(this._selectedObject);
      this.toast?.show(kind ? `Sonificazione: ${kind}` : 'Suono generico', { type: 'info' });
    });

    tools.querySelector('[data-tool="probes"]')?.addEventListener('click', (e) => {
      this._probesVisible = !this._probesVisible;
      this.probes?.setVisible(this._probesVisible && this.navigation.getCurrent() === SCENES.SOLAR_SYSTEM);
      e.currentTarget.classList.toggle('active', this._probesVisible);
      this.toast?.show(this._probesVisible ? 'Traiettorie sonde visibili' : 'Sonde nascoste', { type: 'info' });
    });

    tools.querySelector('[data-tool="lagrange"]')?.addEventListener('click', (e) => {
      this._lagrangeVisible = !this._lagrangeVisible;
      this.lagrange?.setVisible(this._lagrangeVisible && this.navigation.getCurrent() === SCENES.SOLAR_SYSTEM);
      e.currentTarget.classList.toggle('active', this._lagrangeVisible);
      this.toast?.show(this._lagrangeVisible ? 'Punti L1–L5 visibili' : 'Punti di Lagrange nascosti', { type: 'info' });
    });

    tools.querySelector('[data-tool="ruler"]')?.addEventListener('click', (e) => {
      const active = !this.cosmicRuler?.isActive();
      this.cosmicRuler?.setActive(active);
      e.currentTarget.classList.toggle('active', active);
      this.toast?.show(active ? 'Clicca due punti per misurare' : 'Righello disattivato', { type: 'info' });
    });

    tools.querySelector('[data-tool="size"]')?.addEventListener('click', () => {
      if (!this._selectedObject) {
        this.toast?.show('Seleziona prima un oggetto', { type: 'info' });
        return;
      }
      this.comparePanel?.show(this._selectedObject);
      this.toast?.show('Scegli il secondo oggetto, poi usa Confronto dimensioni', { type: 'info' });
    });

    tools.querySelector('[data-tool="vr"]')?.addEventListener('click', async () => {
      try {
        if (this._webxrSupport?.vr) {
          await this.webxr.enterVR();
          this.toast?.show('Sessione VR avviata', { type: 'success' });
        } else {
          this.toast?.show('WebXR VR non disponibile su questo dispositivo', { type: 'info' });
        }
      } catch (err) {
        this.toast?.show(err?.message || 'WebXR non disponibile', { type: 'info' });
      }
    });

    tools.querySelector('[data-tool="voice"]')?.addEventListener('click', (e) => {
      if (!this.voiceCommands?.isSupported()) {
        this.toast?.show('Riconoscimento vocale non supportato', { type: 'info' });
        return;
      }
      this.voiceCommands.toggle(this.uiRoot);
      e.currentTarget.classList.toggle('active', this.voiceCommands.isActive());
      this.toast?.show(this.voiceCommands.isActive() ? 'Comandi vocali attivi' : 'Comandi vocali disattivati', { type: 'info' });
    });

    tools.querySelector('[data-tool="relax"]')?.addEventListener('click', (e) => {
      const on = this.relaxMode?.toggle();
      e.currentTarget.classList.toggle('active', on);
      this.toast?.show(on ? 'Modalità relax: camera lenta' : 'Modalità relax disattivata', { type: 'info' });
    });

    tools.querySelector('[data-tool="stellar"]')?.addEventListener('click', () => this.stellarEvolution?.show());
    tools.querySelector('[data-tool="spectrum"]')?.addEventListener('click', () => {
      const star = this._selectedObject || { name: 'Sole', temperature: 5778, spectralClass: 'G' };
      this.spectrumChart?.showForStar(star);
    });
    tools.querySelector('[data-tool="describe"]')?.addEventListener('click', (e) => {
      const on = !this.audioDescription?.isEnabled();
      this.audioDescription?.setEnabled(on);
      e.currentTarget.classList.toggle('active', on);
      if (on) this.audioDescription?.describeScene(this.navigation.getCurrent());
      this.toast?.show(on ? 'Descrizione audio attiva' : 'Descrizione audio disattivata', { type: 'info' });
    });
  }

  _previewCustomSystem(systemId) {
    const system = customSystemsStore.getState().getSystem(systemId);
    if (!system) return;
    if (this._activeCustomSystem) {
      disposeCustomSystem(this._activeCustomSystem);
      this._activeCustomSystem = null;
    }
    if (this.navigation.getCurrent() !== SCENES.SOLAR_SYSTEM) {
      this.navigation.goTo(SCENES.SOLAR_SYSTEM);
    }
    this._activeCustomSystem = buildCustomSystemMeshes(system, this.customSystemsGroup);
    this._probesVisible = false;
    this.probes?.setVisible(false);
    this.toast?.show(`Sistema "${system.name}" visualizzato`, { type: 'success' });
  }

  _showUpcomingAstroEvents() {
    if (!FEATURES.astroEvents || !this.astroEventsPanel) return;
    const upcoming = this.astroEventsPanel.getUpcoming().slice(0, 2);
    upcoming.forEach((e, i) => {
      setTimeout(() => {
        this.toast?.show(`${e.title} — ${e.date}`, { type: 'info', duration: 5500 });
      }, 2000 + i * 1200);
    });
  }

  _syncGamificationHud() {
    if (!FEATURES.gamification) return;
    const s = gamificationStore.getState();
    this.hud?.setGamification({ level: s.getLevel(), xp: s.xp, visible: true, title: s.getLevelTitle() });
  }

  async openObjectById(id, sceneHint) {
    const data = this.findDataById(id);
    if (!data) {
      this.toast?.show('Oggetto non trovato nel catalogo', { type: 'info' });
      return;
    }
    if (sceneHint && this.navigation.getCurrent() !== sceneHint) {
      await this.navigation.goTo(sceneHint);
    }
    this._selectedObject = data;
    getAppState().selectObject(data);
    if (FEATURES.gamification) {
      gamificationStore.getState().visitObject(data.id, { type: data.type || data.category });
      this._syncGamificationHud();
    }
    if (FEATURES.userProfile) {
      userProfileStore.getState().recordVisit(data.id, data.type || data.category || 'generale');
    }
    if (FEATURES.collectibles) {
      const card = collectiblesStore.getState().unlockForObject(data.id, data.type || data.category);
      if (card) this.toast?.show(`Carta sbloccata: ${card.name} (${card.rarity})`, { type: 'success' });
    }
    if (FEATURES.coordinatesHud) this.coordinatesHud?.setObject(data.id, data.name);
    if (FEATURES.sharedSessions) this.sharedSession?.broadcastSelect(data.id);
    if (FEATURES.audioDescription) this.audioDescription?.describeObject(data.name, data.type || data.category);
    if (data.id === 'voyager-1' && FEATURES.hiddenAchievements) {
      gamificationStore.getState().recordVoyagerFollow();
    }
    this.topBar?.renderBreadcrumb(this.navigation.getCurrent(), data.name);
    this.panel.showLoading(data);
    this.overlays?.setFocusMode(true);

    const searchUrl = this.nasa.getSearchUrl(this.nasa.getQueryForObject(data.id, data.name));
    const [nasaResults, wikiResult] = await Promise.all([
      withFallback(() => this.nasa.searchForObject(data.id, data.name), null, { label: 'NASA', eventBus: this.eventBus }),
      withFallback(
        () => this.wikipedia.getSummaryForObject(data.id, data.name, {
          catalog: data.catalog,
          type: data.type || data.category,
        }),
        null,
        { label: 'Wikipedia', eventBus: this.eventBus }
      ),
    ]);
    this.panel.show(data, { nasaResults, searchUrl, wikiResult });
  }

  async _applyShareHash() {
    const { scene, objectId } = parseShareHash();
    if (scene) await this.navigation.goTo(scene);
    if (objectId) await this.openObjectById(objectId, scene);
  }

  waitForWarmupFrame() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  fitSceneCamera(sceneKey) {
    if (![SCENES.LOCAL_GROUP, SCENES.OBSERVABLE, SCENES.MILKY_WAY, SCENES.EXOPLANETS, SCENES.EXTREME].includes(sceneKey)) return;

    const points = collectDataPositions(
      this.galaxyData,
      this.starData,
      sceneKey,
      this.exoplanetData,
      this.extremeData
    );
    const framing = computeFraming(points, {
      fov: sceneKey === SCENES.OBSERVABLE ? 72 : sceneKey === SCENES.MILKY_WAY ? 60 : sceneKey === SCENES.EXOPLANETS ? 62 : sceneKey === SCENES.EXTREME ? 64 : 68,
      padding: sceneKey === SCENES.OBSERVABLE ? 1.38 : sceneKey === SCENES.MILKY_WAY ? 1.22 : sceneKey === SCENES.EXOPLANETS ? 1.28 : sceneKey === SCENES.EXTREME ? 1.35 : 1.18,
      minDistance: sceneKey === SCENES.OBSERVABLE ? 920 : sceneKey === SCENES.MILKY_WAY ? 280 : sceneKey === SCENES.EXOPLANETS ? 320 : sceneKey === SCENES.EXTREME ? 380 : 520,
    });

    if (!framing) return;

    CAMERA_PRESETS[sceneKey] = {
      position: framing.position.toArray(),
      target: framing.target.toArray(),
      fov: framing.fov,
    };
  }

  async prepareCosmicScene(sceneKey) {
    if (!COSMIC_SCENES.has(sceneKey)) return;

    await this.sceneAssets.ensureForScene(sceneKey, {
      galaxyData: this.galaxyData,
      starData: this.starData,
      exoplanetData: this.exoplanetData,
      extremeData: this.extremeData,
      largeScaleData: this.largeScaleData,
      phenomenaData: { nebulae: NEBULA_DATA, wormhole: WORMHOLE_DATA },
    });
    this.registerCosmicLabels();
  }

  registerCosmicLabels() {
    if (!this._registeredLabelIds) this._registeredLabelIds = new Set();

    const register = (id, object, name, options = {}) => {
      if (!object || this._registeredLabelIds.has(id)) return;
      this._registeredLabelIds.add(id);
      this.labels.add(id, object, name, { scene: 'cosmic', ...options });
    };

    const milkyWay = this.galaxyData?.galaxies.find((g) => g.id === 'milky_way');
    const galaxy = this.sceneAssets.getGalaxy();
    if (milkyWay && galaxy) {
      register('milky_way', galaxy.points, 'VIA LATTEA');
    }

    const starMarkers = this.sceneAssets.getStarMarkers();
    starMarkers?.markers.forEach(({ mesh, data }) => {
      register(data.id, mesh, data.name.toUpperCase());
    });

    const markers = this.sceneAssets.getGalaxyMarkers();
    markers?.markers.forEach(({ mesh, data }) => {
      register(data.id, mesh, data.name.toUpperCase());
    });

    markers?.clusterAnchors?.forEach(({ anchor, label, clusterId }) => {
      register(`cluster_${clusterId}_${anchor.userData.sceneKey}`, anchor, label, { kind: 'cluster' });
    });

    const nebulae = this.sceneAssets.getNebulae();
    nebulae?.nebulae.forEach(({ mesh }) => {
      const data = mesh.userData.data;
      if (data) register(data.id, mesh, data.name.toUpperCase());
    });

    const exoMarkers = this.sceneAssets.getExoplanetMarkers();
    exoMarkers?.markers.forEach(({ mesh, data }) => {
      register(data.id, mesh, data.name.toUpperCase());
    });

    const extremeMarkers = this.sceneAssets.getExtremeObjects();
    extremeMarkers?.markers.forEach(({ mesh, data }) => {
      register(data.id, mesh, data.name.toUpperCase());
    });

    const largeScale = this.sceneAssets.getLargeScaleStructures();
    largeScale?.getMeshes?.().forEach((mesh) => {
      const data = mesh.userData?.data;
      if (data?.name) register(data.id, mesh, data.name.toUpperCase());
    });

    const wormhole = this.sceneAssets.getWormhole();
    if (wormhole) {
      register('wormhole', wormhole.group, 'WORMHOLE');
    }

    this._registerMarkerLod();
  }

  _registerMarkerLod() {
    this._lodUnregister.forEach((fn) => fn());
    this._lodUnregister = [];

    const markers = this.sceneAssets.getGalaxyMarkers();
    markers?.markers.forEach(({ mesh }) => {
      this._lodUnregister.push(this.lodManager.register(mesh, MARKER_LOD_LEVELS));
    });

    const starMarkers = this.sceneAssets.getStarMarkers();
    starMarkers?.markers.forEach(({ mesh }) => {
      this._lodUnregister.push(this.lodManager.register(mesh, MARKER_LOD_LEVELS));
    });
  }

  showMissionsModal() {
    const missions = (this.nasaData?.missions || [])
      .map((m) => `
        <article class="mission-card">
          <h3>${m.name}</h3>
          <p class="mission-meta">${m.launch} · ${m.status}</p>
          <p>${m.description}</p>
          ${m.distance ? `<small>${m.distance}</small>` : ''}
        </article>
      `)
      .join('');

    const phenomena = (this.nasaData?.phenomena || [])
      .map((p) => `
        <article class="mission-card">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
        </article>
      `)
      .join('');

    this.modal.show(`
      <h2 class="modal-title">Esplorazione NASA</h2>
      <section><h3>Missioni</h3>${missions}</section>
      <section><h3>Fenomeni</h3>${phenomena}</section>
    `);
  }

  findDataById(id) {
    const planet = this.planetData?.planets.find((p) => p.id === id);
    if (planet) return planet;
    const moon = this.moonData?.moons.find((m) => m.id === id);
    if (moon) return moon;
    const asteroid = this.smallBodiesData?.asteroids?.find((a) => a.id === id);
    if (asteroid) return asteroid;
    const comet = this.smallBodiesData?.comets?.find((c) => c.id === id);
    if (comet) return comet;
    const kuiper = this.smallBodiesData?.kuiper?.find((k) => k.id === id);
    if (kuiper) return kuiper;
    if (id === 'oort-cloud') return this.smallBodiesData?.oort;
    const galaxy = this.galaxyData?.galaxies.find((g) => g.id === id);
    if (galaxy) return galaxy;
    const star = this.starData?.stars.find((s) => s.id === id);
    if (star) return star;
    const exoplanet = this.getExoplanetById(id);
    if (exoplanet) return exoplanet;
    const extreme = findExtremeObjectInDataset(this.extremeData, id);
    if (extreme) return extreme;
    const nebula = NEBULA_DATA.find((n) => n.id === id);
    if (nebula) return nebula;
    if (id === 'wormhole') return WORMHOLE_DATA;
    const probe = this.probeData?.probes?.find((p) => p.id === id);
    if (probe) return probe;
    const supercluster = this.largeScaleData?.superclusters?.find((s) => s.id === id);
    if (supercluster) return supercluster;
    const voidObj = this.largeScaleData?.voids?.find((v) => v.id === id);
    if (voidObj) return voidObj;
    if (id === 'cmb') return this.largeScaleData?.cmb;
    if (id === 'sun') {
      const rich = this.starData?.stars.find((s) => s.id === 'sun');
      return { ...rich, ...this.sunData, name: rich?.name || 'Sole' };
    }
    return null;
  }

  getExoplanetById(id) {
    return findExoplanetInDataset(this.exoplanetData, id);
  }

  getSelectableObjects() {
    if (this.transitions?.isActive?.()) return [];

    const objects = [];
    if (this.groups.earth.visible) {
      objects.push(this.earth.group ?? this.earth.earth);
    }
    if (this.groups.solarSystem.visible) {
      objects.push(this.sun.sun, ...this.solarSystem.getMeshes());
      if (this._activeCustomSystem) objects.push(...this._activeCustomSystem.meshes);
    }
    const nebulae = this.sceneAssets.getNebulae();
    if (this.groups.nebulae.visible && nebulae) {
      objects.push(...nebulae.nebulae.map((n) => n.mesh));
    }
    const wormhole = this.sceneAssets.getWormhole();
    if (this.groups.wormhole.visible && wormhole) {
      objects.push(wormhole.group);
    }
    const starMarkers = this.sceneAssets.getStarMarkers();
    if (this.groups.famousStars.visible && starMarkers) {
      objects.push(...starMarkers.getMeshes());
    }
    const exoMarkers = this.sceneAssets.getExoplanetMarkers();
    if (this.groups.exoplanets.visible && exoMarkers) {
      objects.push(...exoMarkers.getMeshes());
    }
    const extremeMarkers = this.sceneAssets.getExtremeObjects();
    if (this.groups.extremeObjects.visible && extremeMarkers) {
      objects.push(...extremeMarkers.getMeshes());
    }
    const markers = this.sceneAssets.getGalaxyMarkers();
    if (this.groups.localGroup.visible && markers) {
      objects.push(...markers.getMeshes().filter((m) =>
        m.userData.data?.marker?.scenes?.includes('local_group')
      ));
    }
    if (this.groups.observable.visible && markers) {
      objects.push(...markers.getMeshes().filter((m) =>
        m.userData.data?.marker?.scenes?.includes('observable')
      ));
    }
    const largeScale = this.sceneAssets.getLargeScaleStructures();
    if (this.groups.observable.visible && largeScale) {
      objects.push(...largeScale.getMeshes());
    }
    return objects.filter(Boolean);
  }

  onSceneTransition(sceneKey) {
    if (sceneKey === SCENES.WORMHOLE) {
      this.audio.resume().then(() => this.audio.playWarp());
    }
  }

  setupResize() {
    const apply = () => {
      updateCameraAspect(this.camera, this.container);
      resizeRenderer(this.renderer, this.container);
      if (this.postFX?.resize) {
        this.postFX.resize(
          this.container.clientWidth,
          this.container.clientHeight,
          this.renderer.getPixelRatio()
        );
      }
    };
    apply();
    window.addEventListener('resize', apply);
  }

  setupInteraction() {
    const resumeAudio = () => {
      this.audio.resume();
      this.chatVoice.warmUp();
    };
    document.addEventListener('pointerdown', resumeAudio, { once: true });
    document.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'ArrowLeft', ' ', 'Enter'].includes(e.key)) resumeAudio();
      if (e.key === 'ArrowRight') this.navigation.next();
      if (e.key === 'ArrowLeft') this.navigation.prev();
      if (e.key === 'Escape') {
        if (this.chat?.isOpen()) {
          this.chat.close();
          return;
        }
        this.panel.hide();
        this.raycaster.clearSelection();
        this.labels.setSelected(null);
        this._selectedObject = null;
        this.overlays.setFocusMode(false);
        this.companion?.stop();
      }
    });
  }

  _showBreakReminder() {
    const overlay = document.createElement('div');
    overlay.className = 'break-reminder';
    overlay.innerHTML = `
      <div class="break-reminder-inner">
        <p>Hai esplorato per 20 minuti. Fai una pausa!</p>
        <button type="button">Continua</button>
      </div>
    `;
    overlay.querySelector('button')?.addEventListener('click', () => overlay.remove());
    this.uiRoot.appendChild(overlay);
  }

  hideLoading() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.loadingScreen.classList.add('hidden');
        this.loadingScreen.setAttribute('aria-hidden', 'true');
        resolve();
      }, 800);
    });
  }

  adaptQuality(fps) {
    const isMobile = window.innerWidth < 768;
    const target = isMobile ? PERFORMANCE.targetFpsMobile : PERFORMANCE.targetFpsDesktop;
    getAppState().setFps(fps);

    if (fps < target - 10 && this.qualityLevel === 'high') {
      this.setQualityLevel('medium', 'auto');
    } else if (fps < target - 15 && this.qualityLevel === 'medium') {
      this.setQualityLevel('low', 'auto');
    }
  }

  _updateSunGodRays() {
    if (!this.sun?.sun || this.navigation.getCurrent() !== SCENES.SOLAR_SYSTEM) return;
    const ndc = new THREE.Vector3();
    this.sun.sun.getWorldPosition(ndc);
    ndc.project(this.camera);
    this.postFX.setSunScreenPosition(ndc);
  }

  _createDirectPostFX() {
    return {
      composer: null,
      setQuality: () => {},
      setSceneProfile: () => {},
      isEarthView: () => true,
      setMotionBlur: () => {},
      setSunScreenPosition: () => {},
      resize: () => {},
    };
  }

  _bindEnvMaterials() {
    const cubeEnv = this.ibl?.cubeEnvironment;
    if (!cubeEnv) return;
    const apply = (material) => bindEnvToMaterial(material, cubeEnv);

    this.planets?.planets.forEach(({ mesh }) => apply(mesh.material));
    this.moons?.moons.forEach(({ mesh }) => apply(mesh.material));
    if (this.earth?.material) apply(this.earth.material);
  }

  startRenderLoop() {
    let frameCount = 0;

    createAnimationLoop((time, delta) => {
      this.controls.update();

      this.updatables.forEach((obj) => {
        if (obj.update) obj.update(time, delta, this.camera);
      });

      this.lodManager?.update();
      this._updateSunGodRays();
      this.memoryMonitor?.update();
      this.minimap?.setCameraYaw(this.controls.getAzimuthalAngle?.() ?? 0);
      this.compass?.update();
      this.compass3d?.update(this.camera);
      this.scaleBar?.update(this.camera.position.length(), this.navigation.getCurrent());

      if (FEATURES.telemetry) this._sceneTimeAcc = (this._sceneTimeAcc || 0) + delta;
      if (FEATURES.hiddenAchievements && this._selectedObject?.id === 'sun') {
        this._sunStareSeconds = (this._sunStareSeconds || 0) + delta;
        if (this._sunStareSeconds >= 30) gamificationStore.getState().recordSunStare(this._sunStareSeconds);
      } else {
        this._sunStareSeconds = 0;
      }

      if (FEATURES.advancedAccessibility && !this._breakReminderShown) {
        if (Date.now() - (this._sessionStartMs || Date.now()) > 20 * 60 * 1000) {
          this._breakReminderShown = true;
          this._showBreakReminder();
        }
      }

      if (FEATURES.timeSimulation && !timeStore.getState().paused) {
        const days = delta * timeStore.getState().timeScale;
        if (days > 0) timeStore.getState().advanceDays(days);
      }

      if (FEATURES.cosmicRuler && this.cosmicRuler?.isActive()) {
        const m = this.cosmicRuler.getMeasurement();
        if (m) {
          this.hud.element.querySelector('[data-dist]').textContent = `${m.distance.toFixed(1)} u`;
        }
      }

      this.labels.update(this.camera, {
        activeScene: (() => {
          const current = this.navigation.getCurrent();
          if (current === SCENES.SOLAR_SYSTEM) return 'solar';
          if (current === SCENES.EARTH) return 'earth';
          if (COSMIC_SCENES.has(current)) return 'cosmic';
          return null;
        })(),
      });

      const fps = this.hud.update(
        this.camera,
        this.navigation.getCurrentLabel(),
        this.navigation.getCurrent()
      );

      frameCount++;
      if (frameCount % 120 === 0) this.adaptQuality(fps);

      if (!usesPostProcessing(this.renderer) || this.postFX.isEarthView()) {
        this.renderer.render(this.scene, this.camera);
      } else {
        this.postFX.composer.render();
      }
    });
  }
}
