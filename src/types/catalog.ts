/** Tipi per il catalogo astronomico JSON. */

export interface AstronomicalEntity {
  id: string;
  name: string;
  type?: string;
  catalog?: string;
  description?: string;
  diameter?: string;
  radius?: number;
  mass?: string;
  distance?: string;
  temperature?: string;
  orbitalPeriod?: string;
  orbitalVelocity?: string;
  distanceFromSun?: number;
  rotationSpeed?: number;
  orbitSpeed?: number;
  texture?: string;
  facts?: string[];
  sources?: string[];
  nasa_images?: string[];
  tilt?: number;
  category?: string;
  marker?: { scenes?: string[] };
}

export interface PlanetDataset {
  planets: AstronomicalEntity[];
}

export interface MoonDataset {
  moons: AstronomicalEntity[];
}

export interface StarDataset {
  stars: AstronomicalEntity[];
}

export interface GalaxyDataset {
  galaxies: AstronomicalEntity[];
  catalog?: {
    clusters?: Record<string, { label: string; radius: number }>;
  };
}

export interface SunData extends AstronomicalEntity {
  coreColor?: string;
  coronaColor?: string;
}

export interface NasaMission {
  name: string;
  launch: string;
  status: string;
  description?: string;
  distance?: string;
}

export interface NasaDataset {
  missions?: NasaMission[];
  phenomena?: { name: string; description?: string }[];
}

export type QualityLevel = 'high' | 'medium' | 'low';

export type SceneKey =
  | 'earth'
  | 'solar_system'
  | 'milky_way'
  | 'exoplanets'
  | 'extreme_objects'
  | 'local_group'
  | 'observable'
  | 'wormhole';

export type ExoplanetClassification =
  | 'rocky'
  | 'super_earth'
  | 'hot_jupiter'
  | 'mini_neptune'
  | 'ice_giant'
  | 'gas_giant';

export interface ExoplanetEntity extends AstronomicalEntity {
  classification?: ExoplanetClassification;
  hostStar?: string;
  constellation?: string;
  radiusEarth?: number;
  massEarth?: number | null;
  semiMajorAxisAu?: number;
  orbitalPeriodDays?: number;
  equilibriumTempK?: number;
  habitable?: boolean;
  habitabilityScore?: number;
  discoveryYear?: number;
  discoveryMethod?: string;
  jwst?: {
    atmosphere?: string;
    spectroscopy?: string;
  };
}

export interface ExoplanetSystem {
  id: string;
  name: string;
  hostStar?: {
    name?: string;
    spectral?: string;
    temperature?: number;
  };
  distanceLy?: number;
  constellation?: string;
  description?: string;
  marker?: {
    position?: [number, number, number];
    scale?: number;
  };
  habitableZone?: {
    innerAu: number;
    outerAu: number;
  };
  planets: ExoplanetEntity[];
}

export interface ExoplanetDataset {
  catalog?: {
    version?: string;
    sources?: string[];
    notes?: string;
  };
  systems: ExoplanetSystem[];
}

export interface ChatSession {
  scene: SceneKey;
  sceneLabel: string;
  selectedObject?: AstronomicalEntity | null;
}
