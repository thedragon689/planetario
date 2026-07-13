attribute float size;
attribute vec3 color;
attribute float opacity;

uniform float uTime;
uniform float uPixelRatio;

varying vec3 vColor;
varying float vOpacity;

void main() {
  vColor = color;
  vOpacity = opacity;
  vec3 pos = position;
  pos.x += sin(uTime * 0.08 + position.z * 0.01) * 0.4;
  pos.y += cos(uTime * 0.06 + position.x * 0.01) * 0.25;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = size * (280.0 / max(-mvPosition.z, 1.0)) * uPixelRatio;
  gl_Position = projectionMatrix * mvPosition;
}
