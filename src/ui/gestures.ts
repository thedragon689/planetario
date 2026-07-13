const SWIPE_THRESHOLD = 56;
const SWIPE_MAX_TIME = 600;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_DIST = 24;
const LONG_PRESS_MS = 520;
const PINCH_ZOOM_SENS = 0.35;

export interface GesturePosition {
  x: number;
  y: number;
}

export interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onPinchEnd?: () => void;
  onDoubleTap?: (position: GesturePosition) => void;
  onLongPress?: (position: GesturePosition) => void;
  enabled?: () => boolean;
}

/** Gesture touch native (swipe, pinch, doppio tap, long press) */
export function createGestureHandler(target: HTMLElement, options: GestureOptions = {}) {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let pinchStartDist = 0;
  let pinching = false;

  function clearLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function touchDist(touches: TouchList) {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function onTouchStart(e: TouchEvent) {
    if (options.enabled && !options.enabled()) return;

    if (e.touches.length === 2) {
      pinching = true;
      pinchStartDist = touchDist(e.touches);
      clearLongPress();
      return;
    }

    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    startTime = Date.now();

    clearLongPress();
    longPressTimer = setTimeout(() => {
      options.onLongPress?.({ x: t.clientX, y: t.clientY });
      longPressTimer = null;
    }, LONG_PRESS_MS);
  }

  function onTouchMove(e: TouchEvent) {
    if (options.enabled && !options.enabled()) return;

    if (pinching && e.touches.length === 2 && pinchStartDist > 0) {
      const dist = touchDist(e.touches);
      const scale = dist / pinchStartDist;
      options.onPinch?.(scale);
      return;
    }

    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    const moved = Math.hypot(t.clientX - startX, t.clientY - startY);
    if (moved > 14) clearLongPress();
  }

  function onTouchEnd(e: TouchEvent) {
    if (options.enabled && !options.enabled()) return;
    clearLongPress();

    if (pinching) {
      if (e.touches.length < 2) {
        pinching = false;
        pinchStartDist = 0;
        options.onPinchEnd?.();
      }
      return;
    }

    const t = e.changedTouches[0];
    if (!t) return;

    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const elapsed = Date.now() - startTime;

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2 && elapsed < SWIPE_MAX_TIME) {
      if (dx < 0) options.onSwipeLeft?.();
      else options.onSwipeRight?.();
      return;
    }

    if (Math.abs(dy) > SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx) * 1.2 && elapsed < SWIPE_MAX_TIME) {
      if (dy < 0) options.onSwipeUp?.();
      else options.onSwipeDown?.();
      return;
    }

    const now = Date.now();
    const dist = Math.hypot(t.clientX - lastTapX, t.clientY - lastTapY);
    if (now - lastTapTime < DOUBLE_TAP_MS && dist < DOUBLE_TAP_DIST) {
      options.onDoubleTap?.({ x: t.clientX, y: t.clientY });
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;
    lastTapX = t.clientX;
    lastTapY = t.clientY;
  }

  function onTouchCancel() {
    clearLongPress();
    pinching = false;
    pinchStartDist = 0;
  }

  target.addEventListener('touchstart', onTouchStart, { passive: true });
  target.addEventListener('touchmove', onTouchMove, { passive: true });
  target.addEventListener('touchend', onTouchEnd, { passive: true });
  target.addEventListener('touchcancel', onTouchCancel, { passive: true });

  return {
    destroy() {
      clearLongPress();
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
      target.removeEventListener('touchcancel', onTouchCancel);
    },
  };
}

export { PINCH_ZOOM_SENS };
