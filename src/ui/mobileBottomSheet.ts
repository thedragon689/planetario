/** Bottom sheet mobile per pannello info */
export function initMobileBottomSheet(panel: HTMLElement) {
  if (!panel) return { destroy() {} };

  panel.classList.add('mobile-bottom-sheet');
  const handle = document.createElement('div');
  handle.className = 'bottom-sheet-handle';
  handle.innerHTML = '<span class="handle-bar"></span>';
  panel.prepend(handle);

  let dragStartY = 0;
  let dragging = false;
  let startTransform = 0;

  function applyLayout() {
    const mobile = document.documentElement.dataset.layout === 'mobile';
    panel.classList.toggle('mobile-bottom-sheet-active', mobile);
    if (!mobile) {
      panel.style.transform = '';
    }
  }

  applyLayout();
  window.addEventListener('resize', applyLayout);

  function onTouchStart(e: TouchEvent) {
    if (document.documentElement.dataset.layout !== 'mobile') return;
    if (!panel.classList.contains('visible')) return;
    dragStartY = e.touches[0].clientY;
    dragging = true;
    startTransform = 0;
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging) return;
    const dy = Math.max(0, e.touches[0].clientY - dragStartY);
    panel.style.transform = `translateY(${dy}px)`;
  }

  function onTouchEnd(e: TouchEvent) {
    if (!dragging) return;
    dragging = false;
    const dy = e.changedTouches[0].clientY - dragStartY;
    if (dy > panel.offsetHeight * 0.22) {
      panel.classList.remove('visible');
      panel.style.transform = '';
      panel.dispatchEvent(new CustomEvent('bottomsheet-close'));
    } else {
      panel.style.transform = '';
    }
  }

  handle.addEventListener('touchstart', onTouchStart, { passive: true });
  handle.addEventListener('touchmove', onTouchMove, { passive: true });
  handle.addEventListener('touchend', onTouchEnd, { passive: true });

  return {
    destroy() {
      window.removeEventListener('resize', applyLayout);
      handle.removeEventListener('touchstart', onTouchStart);
      handle.removeEventListener('touchmove', onTouchMove);
      handle.removeEventListener('touchend', onTouchEnd);
      handle.remove();
      panel.classList.remove('mobile-bottom-sheet', 'mobile-bottom-sheet-active');
    },
  };
}
