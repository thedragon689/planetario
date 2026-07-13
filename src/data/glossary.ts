export interface GlossaryEntry {
  term: string;
  definition: string;
  simple?: string;
}

let cached: GlossaryEntry[] | null = null;

export async function loadGlossary(): Promise<GlossaryEntry[]> {
  if (cached) return cached;
  const res = await fetch('/data/glossary.json');
  if (!res.ok) throw new Error('Glossario non disponibile');
  const data = await res.json();
  cached = (data.entries || []) as GlossaryEntry[];
  return cached;
}

export function searchGlossary(entries: GlossaryEntry[], query: string, limit = 20): GlossaryEntry[] {
  const q = query.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (!q) return entries.slice(0, limit);
  return entries
    .filter(
      (e) =>
        e.term.toLowerCase().includes(q)
        || e.definition.toLowerCase().includes(q)
        || e.simple?.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export function linkGlossaryTerms(text: string, entries: GlossaryEntry[]): string {
  let result = text;
  const sorted = [...entries].sort((a, b) => b.term.length - a.term.length);
  sorted.slice(0, 80).forEach((e) => {
    const re = new RegExp(`\\b(${e.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
    result = result.replace(re, '<span class="glossary-link" data-term="$1" title="$1">$1</span>');
  });
  return result;
}
