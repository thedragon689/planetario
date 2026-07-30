import { describe, expect, it } from 'vitest';
import { resolveLayoutBreakpoint, resolveWidthTier, BREAKPOINTS } from '../src/ui/responsiveLayout.js';

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

describe('resolveWidthTier', () => {
  it('identifica tier compatti e phone', () => {
    expect(resolveWidthTier(320)).toBe('compact');
    expect(resolveWidthTier(360)).toBe('compact');
    expect(resolveWidthTier(375)).toBe('phone');
    expect(resolveWidthTier(414)).toBe('phone');
  });

  it('identifica large phone, tablet e desktop', () => {
    expect(resolveWidthTier(480)).toBe('largePhone');
    expect(resolveWidthTier(768)).toBe('largePhone');
    expect(resolveWidthTier(1024)).toBe('tablet');
    expect(resolveWidthTier(1280)).toBe('desktop');
  });

  it('espone breakpoint consigliati', () => {
    expect(BREAKPOINTS.compact).toBe(360);
    expect(BREAKPOINTS.largePhone).toBe(480);
    expect(BREAKPOINTS.mobile).toBe(768);
    expect(BREAKPOINTS.tablet).toBe(1024);
  });
});
