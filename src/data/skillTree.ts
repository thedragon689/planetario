export interface SkillNode {
  id: string;
  branch: 'solar' | 'stars' | 'galaxies' | 'exoplanets';
  title: string;
  description: string;
  requiredXp: number;
  icon: string;
}

export const SKILL_TREE: SkillNode[] = [
  { id: 'solar_planets', branch: 'solar', title: 'Pianeti', description: 'Conosci i 8 pianeti principali', requiredXp: 0, icon: '☿' },
  { id: 'solar_moons', branch: 'solar', title: 'Lune', description: 'Esplora le lune principali', requiredXp: 80, icon: '☽' },
  { id: 'solar_probes', branch: 'solar', title: 'Sonde', description: 'Segui le missioni interplanetarie', requiredXp: 160, icon: '🛰' },
  { id: 'stars_types', branch: 'stars', title: 'Tipi stellari', description: 'Sequenza principale OBAFGKM', requiredXp: 120, icon: '✦' },
  { id: 'stars_evolution', branch: 'stars', title: 'Evoluzione', description: 'Vita di una stella', requiredXp: 240, icon: '◎' },
  { id: 'stars_spectro', branch: 'stars', title: 'Spettroscopia', description: 'Leggi gli spettri stellari', requiredXp: 360, icon: '≋' },
  { id: 'galaxies_types', branch: 'galaxies', title: 'Galassie', description: 'Spirali, ellittiche, irregolari', requiredXp: 200, icon: '◉' },
  { id: 'galaxies_cosmo', branch: 'galaxies', title: 'Cosmologia', description: 'Espansione e materia oscura', requiredXp: 400, icon: '∞' },
  { id: 'exo_habitable', branch: 'exoplanets', title: 'Zone abitabili', description: 'Calcola abitabilità', requiredXp: 150, icon: '⊕' },
  { id: 'exo_atmospheres', branch: 'exoplanets', title: 'Atmosfere', description: 'Biosignatures e spettri', requiredXp: 300, icon: '☁' },
];
