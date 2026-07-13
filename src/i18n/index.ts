import type { Locale } from './types.js';
import it from './locales/it.json';
import en from './locales/en.json';

const bundles: Record<Locale, Record<string, string>> = { it, en };

let current: Locale = 'it';

export function setLocale(locale: Locale) {
  current = locale;
  document.documentElement.lang = locale;
}

export function getLocale(): Locale {
  return current;
}

export function t(key: string, fallback = key): string {
  return bundles[current]?.[key] ?? bundles.it[key] ?? fallback;
}

export const CONSTELLATION_MYTHS: Record<string, Record<Locale, string>> = {
  orion: {
    it: 'Orione, il cacciatore mitologico perseguitato dallo scorpione.',
    en: 'Orion, the mythological hunter pursued by the scorpion.',
  },
  ursa_major: {
    it: 'L\'Orsa Maggiore nella mitologia greca: Callisto trasformata in orsa.',
    en: 'Ursa Major in Greek myth: Callisto transformed into a bear.',
  },
  scorpius: {
    it: 'Scorpione inviato da Artemide o Gaia contro Orione.',
    en: 'Scorpion sent by Artemis or Gaia against Orion.',
  },
};
