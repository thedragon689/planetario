export function createRelaxMode(controls: { autoRotate?: boolean; autoRotateSpeed?: number }) {
  let active = false;
  let prevSpeed = 0;

  return {
    isActive: () => active,
    enable() {
      if (active) return;
      active = true;
      prevSpeed = controls.autoRotateSpeed ?? 0;
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.15;
      }
    },
    disable() {
      if (!active) return;
      active = false;
      if (controls) {
        controls.autoRotate = false;
        controls.autoRotateSpeed = prevSpeed;
      }
    },
    toggle() {
      if (active) this.disable();
      else this.enable();
      return active;
    },
  };
}
