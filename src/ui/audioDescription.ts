import { SCENE_LABELS, SCENES } from '../config.js';
import type { SceneKey } from '../types/catalog.js';

const SCENE_DESCRIPTIONS: Partial<Record<SceneKey, string>> = {
  [SCENES.EARTH]: 'Ti trovi sulla Terra. Puoi osservare il pianeta blu con atmosfera e nuvole.',
  [SCENES.SOLAR_SYSTEM]: 'Sei nel Sistema Solare. Al centro il Sole; intorno orbitano pianeti rocciosi e giganti gassosi.',
  [SCENES.MILKY_WAY]: 'Vista della Via Lattea con stelle, nebulose e la struttura a spirale.',
  [SCENES.EXOPLANETS]: 'Catalogo di mondi extrasolari attorno ad altre stelle.',
  [SCENES.EXTREME]: 'Oggetti estremi: buchi neri, pulsar e fenomeni ad alta energia.',
  [SCENES.LOCAL_GROUP]: 'Gruppo Locale di galassie vicine alla Via Lattea.',
  [SCENES.OBSERVABLE]: 'Scala cosmica: superammassi, vuoti e radiazione cosmica di fondo.',
  [SCENES.WORMHOLE]: 'Tunnel ipotetico che collega regioni distanti dello spaziotempo.',
};

export function createAudioDescription(speak: (text: string) => void) {
  let enabled = false;
  let lastScene: SceneKey | null = null;
  let lastObject: string | null = null;

  return {
    isEnabled: () => enabled,
    setEnabled(on: boolean) { enabled = on; },
    describeScene(scene: SceneKey) {
      if (!enabled || scene === lastScene) return;
      lastScene = scene;
      const text = SCENE_DESCRIPTIONS[scene] || `Scena attiva: ${SCENE_LABELS[scene] || scene}.`;
      speak(text);
    },
    describeObject(name: string, type?: string) {
      if (!enabled || name === lastObject) return;
      lastObject = name;
      speak(`Oggetto selezionato: ${name}${type ? `, tipo ${type}` : ''}.`);
    },
    reset() {
      lastScene = null;
      lastObject = null;
    },
  };
}
