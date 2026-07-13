export type CollectibleRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CollectibleDef {
  id: string;
  name: string;
  setId: string;
  setName: string;
  rarity: CollectibleRarity;
  icon: string;
  match: (objectId: string, type?: string) => boolean;
}

export const COLLECTIBLE_SETS: Record<string, string> = {
  solar: 'Pianeti del Sistema Solare',
  nebulae: 'Nebulose iconiche',
  blackholes: 'Buchi neri',
  exoplanets: 'Mondi lontani',
  missions: 'Missioni storiche',
};

const PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

export const COLLECTIBLES: CollectibleDef[] = [
  ...PLANETS.map((id) => ({
    id: `card_${id}`,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    setId: 'solar',
    setName: COLLECTIBLE_SETS.solar,
    rarity: 'common' as CollectibleRarity,
    icon: '⊕',
    match: (oid: string) => oid === id,
  })),
  { id: 'card_orion', name: 'Nebulosa di Orione', setId: 'nebulae', setName: COLLECTIBLE_SETS.nebulae, rarity: 'rare', icon: '☁', match: (id) => id.includes('orion') },
  { id: 'card_crab', name: 'Nebulosa del Granchio', setId: 'nebulae', setName: COLLECTIBLE_SETS.nebulae, rarity: 'rare', icon: '☁', match: (id) => id.includes('crab') },
  { id: 'card_sgr_a', name: 'Sagittarius A*', setId: 'blackholes', setName: COLLECTIBLE_SETS.blackholes, rarity: 'epic', icon: '◉', match: (id) => id === 'sagittarius-a' },
  { id: 'card_m87', name: 'M87*', setId: 'blackholes', setName: COLLECTIBLE_SETS.blackholes, rarity: 'epic', icon: '◉', match: (id) => id === 'm87-star' },
  { id: 'card_proxima_b', name: 'Proxima b', setId: 'exoplanets', setName: COLLECTIBLE_SETS.exoplanets, rarity: 'legendary', icon: '⊕', match: (id) => id.includes('proxima') },
  { id: 'card_voyager1', name: 'Voyager 1', setId: 'missions', setName: COLLECTIBLE_SETS.missions, rarity: 'rare', icon: '🛰', match: (id) => id === 'voyager-1' },
  { id: 'card_apollo11', name: 'Apollo 11', setId: 'missions', setName: COLLECTIBLE_SETS.missions, rarity: 'epic', icon: '🚀', match: (id) => id === 'apollo-11' || id === 'moon' },
];

export function findCollectibleForObject(objectId: string, type?: string): CollectibleDef | null {
  return COLLECTIBLES.find((c) => c.match(objectId, type)) ?? null;
}
