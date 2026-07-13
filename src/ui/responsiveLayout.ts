export type LayoutBreakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveLayoutOptions {
  onBreakpoint?: (bp: LayoutBreakpoint) => void;
}

export function initResponsiveLayout(options: ResponsiveLayoutOptions = {}) {
  let current: LayoutBreakpoint | null = null;

  function resolve(width: number): LayoutBreakpoint {
    if (width < 768) return 'mobile';
    if (width < 1200) return 'tablet';
    return 'desktop';
  }

  function apply() {
    const bp = resolve(window.innerWidth);
    if (bp === current) return;
    current = bp;
    document.body.classList.remove('layout-mobile', 'layout-tablet', 'layout-desktop');
    document.body.classList.add(`layout-${bp}`);
    document.documentElement.dataset.layout = bp;
    options.onBreakpoint?.(bp);
  }

  apply();
  window.addEventListener('resize', apply);
  return { getBreakpoint: () => current ?? resolve(window.innerWidth) };
}
