import { describe, expect, it } from 'vitest';
import { resolveProxiedUrl } from '../src/core/loader.js';

describe('texture loader NASA proxy', () => {
  it('riscrive URL NASA come path same-origin', () => {
    expect(
      resolveProxiedUrl('https://images-assets.nasa.gov/image/PIA19612/PIA19612~orig.jpg')
    ).toBe('/nasa-assets/image/PIA19612/PIA19612~orig.jpg');
  });

  it('non riscrive path locali', () => {
    expect(resolveProxiedUrl('/assets/textures/planets/earth_diffuse.jpg')).toBe(
      '/assets/textures/planets/earth_diffuse.jpg'
    );
  });
});
