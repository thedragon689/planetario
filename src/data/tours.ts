import type { SceneKey } from '../types/catalog.js';
import { SCENES } from '../config.js';

export interface TourStep {
  scene: SceneKey;
  objectId?: string;
  message: string;
}

export interface GuidedTourPreset {
  id: string;
  title: string;
  description: string;
  steps: TourStep[];
}

export const TOUR_PRESETS: GuidedTourPreset[] = [
  {
    id: 'solar-system',
    title: 'Tour del Sistema Solare',
    description: 'Dal Sole ai pianeti giganti.',
    steps: [
      { scene: SCENES.SOLAR_SYSTEM, objectId: 'sun', message: 'Partiamo dal Sole, la nostra stella.' },
      { scene: SCENES.SOLAR_SYSTEM, objectId: 'earth', message: 'La Terra, l’unico mondo conosciuto con vita.' },
      { scene: SCENES.SOLAR_SYSTEM, objectId: 'jupiter', message: 'Giove, il gigante gassoso che protegge le orbite interne.' },
      { scene: SCENES.SOLAR_SYSTEM, objectId: 'saturn', message: 'Saturno e i suoi spettacolari anelli.' },
    ],
  },
  {
    id: 'habitable-exoplanets',
    title: 'Esopianeti abitabili',
    description: 'Mondi extrasolari nella zona Goldilocks.',
    steps: [
      { scene: SCENES.EXOPLANETS, objectId: 'trappist-1e', message: 'TRAPPIST-1 e: candidato roccioso nella zona abitabile.' },
      { scene: SCENES.EXOPLANETS, objectId: 'proxima-b', message: 'Proxima b, il vicino di casa a 4,2 anni luce.' },
      { scene: SCENES.EXOPLANETS, objectId: 'kepler-452b', message: 'Kepler-452 b, il “cugino” della Terra.' },
    ],
  },
  {
    id: 'extreme-objects',
    title: 'Caccia agli oggetti estremi',
    description: 'Buchi neri, pulsar e onde gravitazionali.',
    steps: [
      { scene: SCENES.EXTREME, objectId: 'sagittarius-a', message: 'Sagittarius A*, il buco nero al centro della Via Lattea.' },
      { scene: SCENES.EXTREME, objectId: 'm87-star', message: 'M87*, fotografato dall’Event Horizon Telescope.' },
      { scene: SCENES.EXTREME, objectId: 'gw150914', message: 'GW150914, la prima onda gravitazionale rilevata.' },
      { scene: SCENES.EXTREME, objectId: 'crab-pulsar', message: 'Il Crab Pulsar, un faro cosmico che ruota 30 volte al secondo.' },
    ],
  },
];
