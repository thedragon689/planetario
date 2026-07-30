import { describe, expect, it } from 'vitest';
import { suggestQualityFromFps } from '../src/core/benchmark.js';

describe('suggestQualityFromFps', () => {
  it('suggerisce high solo con FPS elevati su desktop', () => {
    expect(suggestQualityFromFps(60)).toBe('high');
    expect(suggestQualityFromFps(52)).toBe('high');
    expect(suggestQualityFromFps(51)).toBe('medium');
  });

  it('suggerisce medium nella fascia intermedia', () => {
    expect(suggestQualityFromFps(40)).toBe('medium');
    expect(suggestQualityFromFps(36)).toBe('medium');
    expect(suggestQualityFromFps(35)).toBe('low');
  });

  it('limita mobile al massimo a medium', () => {
    expect(suggestQualityFromFps(60, { isMobile: true })).toBe('medium');
    expect(suggestQualityFromFps(40, { isMobile: true })).toBe('medium');
    expect(suggestQualityFromFps(30, { isMobile: true })).toBe('low');
  });
});
