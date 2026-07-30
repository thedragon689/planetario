import { describe, expect, it } from 'vitest';
import { resolveLayoutBreakpoint } from '../src/ui/responsiveLayout.js';

describe('resolveLayoutBreakpoint', () => {
  it('classifica mobile fino a 768px', () => {
    expect(resolveLayoutBreakpoint(320)).toBe('mobile');
    expect(resolveLayoutBreakpoint(768)).toBe('mobile');
  });

  it('classifica tablet tra 769px e 1199px', () => {
    expect(resolveLayoutBreakpoint(769)).toBe('tablet');
    expect(resolveLayoutBreakpoint(1024)).toBe('tablet');
    expect(resolveLayoutBreakpoint(1199)).toBe('tablet');
  });

  it('classifica desktop da 1200px in su', () => {
    expect(resolveLayoutBreakpoint(1200)).toBe('desktop');
    expect(resolveLayoutBreakpoint(1440)).toBe('desktop');
  });
});
