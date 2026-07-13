/** Calcoli scientifici leggeri per strumenti v2.1 */

export interface DrakeParams {
  R: number;
  fp: number;
  ne: number;
  fl: number;
  fi: number;
  fc: number;
  L: number;
}

export function drakeEquation(p: DrakeParams): number {
  return p.R * p.fp * p.ne * p.fl * p.fi * p.fc * p.L;
}

export interface EsiInput {
  radiusEarth: number;
  massEarth: number;
  fluxEarth: number;
  tempK?: number;
}

/** Earth Similarity Index semplificato (0–1) */
export function earthSimilarityIndex({ radiusEarth, massEarth, fluxEarth }: EsiInput): number {
  const r = Math.abs(1 - radiusEarth);
  const m = Math.abs(1 - massEarth);
  const f = Math.abs(1 - fluxEarth);
  const esi = 1 - Math.sqrt((r * r + m * m + f * f) / 3);
  return Math.max(0, Math.min(1, esi));
}

/** Raggio di Schwarzschild in km per massa solare */
export function schwarzschildRadiusKm(massSolar: number): number {
  return 2.95 * massSolar;
}

export const STELLAR_STAGES = [
  { id: 'cloud', label: 'Nube molecolare', ageMyr: 0, color: '#8899aa', size: 1.2, luminosity: 0.01 },
  { id: 'protostar', label: 'Protostella', ageMyr: 0.5, color: '#ff6644', size: 0.8, luminosity: 0.3 },
  { id: 'main', label: 'Sequenza principale', ageMyr: 50, color: '#fff4cc', size: 1, luminosity: 1 },
  { id: 'red_giant', label: 'Gigante rossa', ageMyr: 5000, color: '#ff4422', size: 2.8, luminosity: 120 },
  { id: 'planetary', label: 'Nebulosa planetaria', ageMyr: 5100, color: '#66ccff', size: 1.5, luminosity: 0.5 },
  { id: 'white_dwarf', label: 'Nana bianca', ageMyr: 5200, color: '#ddeeff', size: 0.15, luminosity: 0.02 },
] as const;

export const SPECTRAL_LINES: Record<string, Array<{ nm: number; label: string }>> = {
  G: [{ nm: 656, label: 'Hα' }, { nm: 486, label: 'Hβ' }, { nm: 589, label: 'Na D' }],
  K: [{ nm: 656, label: 'Hα' }, { nm: 766, label: 'K' }],
  M: [{ nm: 656, label: 'Hα' }, { nm: 850, label: 'TiO' }],
  A: [{ nm: 486, label: 'Hβ' }, { nm: 656, label: 'Hα' }],
};

export function spectralClassFromTemp(tempK: number): string {
  if (tempK >= 30000) return 'O';
  if (tempK >= 10000) return 'B';
  if (tempK >= 7500) return 'A';
  if (tempK >= 6000) return 'F';
  if (tempK >= 5200) return 'G';
  if (tempK >= 3700) return 'K';
  return 'M';
}

/** RA/Dec mock da id oggetto (demo client-side) */
export function mockEquatorialCoords(objectId: string): { ra: string; dec: string } {
  let h = 0;
  for (let i = 0; i < objectId.length; i++) h = (h * 31 + objectId.charCodeAt(i)) % 360;
  const raH = (h % 24) + (h % 60) / 60;
  const dec = (h % 181) - 90;
  const sign = dec >= 0 ? '+' : '';
  return {
    ra: `${Math.floor(raH)}h ${Math.floor((raH % 1) * 60)}m`,
    dec: `${sign}${dec.toFixed(1)}°`,
  };
}
