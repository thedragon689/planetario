export const BREAKPOINTS = {
  compact: 360,
  largePhone: 480,
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
} as const;

export type LayoutBreakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveLayoutOptions {
  onBreakpoint?: (bp: LayoutBreakpoint) => void;
}

export function resolveLayoutBreakpoint(width: number): LayoutBreakpoint {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
}

export function resolveWidthTier(width: number): 'compact' | 'phone' | 'largePhone' | 'tablet' | 'desktop' {
  if (width <= BREAKPOINTS.compact) return 'compact';
  if (width < BREAKPOINTS.largePhone) return 'phone';
  if (width <= BREAKPOINTS.mobile) return 'largePhone';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
}

export function initResponsiveLayout(options: ResponsiveLayoutOptions = {}) {
  let current: LayoutBreakpoint | null = null;
  const mobileMq = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`);

  function apply() {
    const width = window.innerWidth;
    const bp = mobileMq.matches ? 'mobile' : resolveLayoutBreakpoint(width);
    if (bp === current) {
      document.documentElement.dataset.widthTier = resolveWidthTier(width);
      document.body.classList.toggle('layout-compact', width <= BREAKPOINTS.compact);
      document.body.classList.toggle('layout-large-phone', width >= BREAKPOINTS.largePhone && width <= BREAKPOINTS.mobile);
      return;
    }
    current = bp;
    document.body.classList.remove('layout-mobile', 'layout-tablet', 'layout-desktop');
    document.body.classList.add(`layout-${bp}`);
    document.documentElement.dataset.layout = bp;
    document.documentElement.dataset.widthTier = resolveWidthTier(width);
    document.body.classList.toggle('layout-compact', width <= BREAKPOINTS.compact);
    document.body.classList.toggle('layout-large-phone', width >= BREAKPOINTS.largePhone && width <= BREAKPOINTS.mobile);
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
