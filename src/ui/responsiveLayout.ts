export type LayoutBreakpoint = 'mobile' | 'tablet' | 'desktop';

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1200,
} as const;

export interface ResponsiveLayoutOptions {
  onBreakpoint?: (bp: LayoutBreakpoint) => void;
}

export function resolveLayoutBreakpoint(width: number): LayoutBreakpoint {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

export function initResponsiveLayout(options: ResponsiveLayoutOptions = {}) {
  let current: LayoutBreakpoint | null = null;
  const mobileMq = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`);

  function apply() {
    const bp = mobileMq.matches
      ? 'mobile'
      : resolveLayoutBreakpoint(window.innerWidth);
    if (bp === current) return;
    current = bp;
    document.body.classList.remove('layout-mobile', 'layout-tablet', 'layout-desktop');
    document.body.classList.add(`layout-${bp}`);
    document.documentElement.dataset.layout = bp;
    options.onBreakpoint?.(bp);
  }

  apply();
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
  mobileMq.addEventListener('change', apply);

  return {
    getBreakpoint: () => current ?? resolveLayoutBreakpoint(window.innerWidth),
    destroy() {
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
      mobileMq.removeEventListener('change', apply);
    },
  };
}
