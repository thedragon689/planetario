precision highp float;

uniform float uTime;
uniform vec3 uSunDirection;
uniform float uWaterLevel;
uniform float uTemperature;
uniform vec3 uTint;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
    mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x),
    f.y
  );
  return mix(n, mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x), f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

vec3 biomeColor(float temp, float humidity, float height) {
  if (temp < 0.25 || height > 0.82) return vec3(0.9, 0.95, 1.0);
  if (temp < 0.35) return vec3(0.7, 0.8, 0.6);
  if (temp < 0.45) return vec3(0.2, 0.5, 0.2);
  if (temp < 0.6) return vec3(0.3, 0.7, 0.2);
  if (humidity < 0.3) return vec3(0.8, 0.7, 0.4);
  return vec3(0.1, 0.6, 0.1);
}

void main() {
  vec3 p = normalize(vWorldPosition) * 2.0;
  float height = fbm(p + uTime * 0.01);
  height = height * 0.5 + 0.5;
  float humidity = fbm(p * 1.5 + 100.0);
  humidity = humidity * 0.5 + 0.5;
  float latitude = abs(vNormal.y);
  float localTemp = uTemperature * (1.0 - latitude * 0.35);

  vec3 color = biomeColor(localTemp, humidity, height) * uTint;

  if (height < uWaterLevel) {
    float depth = (uWaterLevel - height) / max(uWaterLevel, 0.001);
    vec3 shallow = vec3(0.0, 0.5, 0.7);
    vec3 deep = vec3(0.0, 0.1, 0.3);
    color = mix(shallow, deep, depth);
  }

  float light = max(dot(vNormal, uSunDirection), 0.0);
  vec3 ambient = color * 0.18;
  vec3 diffuse = color * light * 0.82;
  float atmosphere = pow(1.0 - max(dot(vNormal, normalize(uSunDirection)), 0.0), 3.0);
  vec3 atmo = vec3(0.5, 0.7, 1.0) * atmosphere * 0.25;

  gl_FragColor = vec4(ambient + diffuse + atmo, 1.0);
}
