import { PERFORMANCE } from '../config.js';
import type { QualityLevel } from '../types/catalog.js';

export interface BenchmarkResult {
  avgFps: number;
  suggestedQuality: QualityLevel;
}

/** Deriva il tier qualità da FPS medi (usato anche nei test). */
export function suggestQualityFromFps(
  avgFps: number,
  { isMobile = false }: { isMobile?: boolean } = {}
): QualityLevel {
  let quality: QualityLevel =
    avgFps >= PERFORMANCE.benchmarkHighFps
      ? 'high'
      : avgFps >= PERFORMANCE.benchmarkMediumFps
        ? 'medium'
        : 'low';
  if (isMobile && quality === 'high') quality = 'medium';
  return quality;
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
          suggestedQuality: suggestQualityFromFps(avgFps, { isMobile }),
        });
      }
    }

    requestAnimationFrame(frame);
  });
}
