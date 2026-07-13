import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  window: 'readonly',
  navigator: 'readonly',
  fetch: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  location: 'readonly',
  Audio: 'readonly',
  AudioContext: 'readonly',
  URL: 'readonly',
  Blob: 'readonly',
  Buffer: 'readonly',
  process: 'readonly',
  self: 'readonly',
  caches: 'readonly',
  AbortController: 'readonly',
  SpeechSynthesisUtterance: 'readonly',
  atob: 'readonly',
};

export default [
  js.configs.recommended,
  prettier,
  {
    ignores: ['dist/**', 'node_modules/**', 'src/**/*.ts'],
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: browserGlobals,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
