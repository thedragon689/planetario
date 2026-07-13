import { initSentry } from './core/sentry.js';
import { initTheme, injectColorBlindFilters } from './ui/theme.js';
import { initVisualThemes } from './ui/visualTheme.js';
import { initResponsiveLayout } from './ui/responsiveLayout.js';
import { FEATURES } from './config.js';
import { PlanetarioApp } from './app.js';

initSentry();
injectColorBlindFilters();
initTheme();
if (FEATURES.visualThemes) initVisualThemes();
if (FEATURES.mobileGestures || FEATURES.glassV22) {
  initResponsiveLayout();
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
} else if ('serviceWorker' in navigator) {
  // In dev lo SW rompe HMR e i chunk Vite: rimuovi eventuali registrazioni residue.
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
  if ('caches' in window) {
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
  }
}

const app = new PlanetarioApp();

if (import.meta.env.DEV) {
  window.__planetario = app;
}

app.init().catch((err) => {
  console.error('Planetario init failed:', err);
  const status = document.querySelector('.loading-status');
  const msg = err?.message || 'Errore di inizializzazione';
  if (status) status.textContent = `Errore: ${msg}`;
});
