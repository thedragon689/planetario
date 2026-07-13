/** Ephemeris semplificata — longitudine media eliocentrica (gradi). */

const J2000 = 2451545.0;

const ORBITAL_PERIODS_DAYS: Record<string, number> = {
  mercury: 87.969,
  venus: 224.701,
  earth: 365.256,
  mars: 686.98,
  jupiter: 4332.59,
  saturn: 10759.22,
  uranus: 30688.5,
  neptune: 60182,
  pluto: 90560,
};

const MEAN_MOTION_DEG_PER_DAY: Record<string, number> = {
  mercury: 4.0923,
  venus: 1.6021,
  earth: 0.9856,
  mars: 0.524,
  jupiter: 0.0831,
  saturn: 0.0335,
  uranus: 0.0117,
  neptune: 0.006,
  pluto: 0.004,
};

const EPOCH_LONGITUDE: Record<string, number> = {
  mercury: 252.25,
  venus: 181.98,
  earth: 100.46,
  mars: 355.43,
  jupiter: 34.35,
  saturn: 50.08,
  uranus: 314.05,
  neptune: 304.35,
  pluto: 238.93,
};

export function julianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate()
    + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  let a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
    - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function daysSinceJ2000(date: Date): number {
  return julianDay(date) - J2000;
}

export function meanLongitudeDeg(planetId: string, date: Date): number {
  const days = daysSinceJ2000(date);
  const motion = MEAN_MOTION_DEG_PER_DAY[planetId] ?? 0.9856;
  const epoch = EPOCH_LONGITUDE[planetId] ?? 0;
  return (epoch + motion * days) % 360;
}

export function orbitAngleRad(planetId: string, date: Date): number {
  return (meanLongitudeDeg(planetId, date) * Math.PI) / 180;
}

export function getOrbitalPeriodDays(planetId: string): number | null {
  return ORBITAL_PERIODS_DAYS[planetId] ?? null;
}
