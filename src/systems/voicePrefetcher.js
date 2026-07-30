import { CHAT_VOICE } from '../config.js';
import { buildNarrationForObject } from './companionNarration.js';
import { getObjectsForScene } from './companionSceneCatalog.js';

export function createVoicePrefetcher({ voice, getSession, getDatasets }) {
  let sceneToken = 0;

  function prefetchObject(data, { priority = false, compact = true } = {}) {
    if (!data || !voice?.isEnabled?.() || !voice?.isGoogleAvailable?.()) return;
    const narration = buildNarrationForObject(data, getSession?.() || {}, { compact });
    if (!narration) return;
    voice.prefetchGoogle(narration, data.id || data.name, { priority });
  }

  function prefetchScene(sceneKey) {
    const token = ++sceneToken;
    const objects = getObjectsForScene(sceneKey, getDatasets?.() || {}).slice(0, 2);

    objects.forEach((obj, index) => {
      window.setTimeout(() => {
        if (token !== sceneToken) return;
        prefetchObject(obj, { priority: index === 0 });
      }, index * CHAT_VOICE.geminiPrefetchStaggerMs);
    });
  }

  return { prefetchObject, prefetchScene };
}
