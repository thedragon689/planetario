import type { QualityLevel } from '../types/catalog.js';

export interface BenchmarkResult {
  avgFps: number;
  suggestedQuality: QualityLevel;
}

/**
 * Benchmark iniziale (~3s) per suggerire la qualità grafica.
 */
export function runRenderBenchmark(
  renderFrame: () => void,
  { durationMs = 3000, minSamples = 30 }: { durationMs?: number; minSamples?: number } = {}
): Promise<BenchmarkResult> {
  return new Promise((resolve) => {
    const samples: number[] = [];
    let last = performance.now();
    let elapsed = 0;

    function frame(now: number) {
      renderFrame();
      const dt = now - last;
      last = now;
      if (dt > 0) samples.push(1000 / dt);
      elapsed += dt;

      if (elapsed < durationMs || samples.length < minSamples) {
        requestAnimationFrame(frame);
      } else {
        const avgFps = samples.reduce((a, b) => a + b, 0) / samples.length;
        resolve({
          avgFps,
          suggestedQuality: avgFps >= 55 ? 'high' : avgFps >= 32 ? 'medium' : 'low',
        });
      }
    }

    requestAnimationFrame(frame);
  });
}
