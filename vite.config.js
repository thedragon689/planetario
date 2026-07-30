import './polyfills/node20.js';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { geminiProxy } from './vite-plugin-gemini-proxy.js';

const nasaProxy = {
  '/nasa-assets': {
    target: 'https://images-assets.nasa.gov',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/nasa-assets/, ''),
  },
};

export default defineConfig(({ mode }) => {
  return {
  plugins: [
    glsl(),
    geminiProxy(mode),
  ],
  server: {
    port: 5174,
    strictPort: true,
    host: '127.0.0.1',
    open: true,
    hmr: {
      host: '127.0.0.1',
      // Port omitted: HMR follows server.port (also when using CLI --port).
    },
    proxy: nasaProxy,
  },
  preview: {
    proxy: nasaProxy,
  },
  build: { target: 'esnext', chunkSizeWarningLimit: 2000 },
  };
});
