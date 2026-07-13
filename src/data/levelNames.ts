export const LEVEL_NAMES = [
  'Novizio',
  'Osservatore',
  'Esploratore',
  'Astrofilo',
  'Astrofisico',
  'Cosmologo',
] as const;

export function levelTitle(level: number): string {
  const idx = Math.min(Math.max(level - 1, 0), LEVEL_NAMES.length - 1);
  return LEVEL_NAMES[idx];
}

export function xpForLevel(level: number): number {
  return (level - 1) * 200;
}
