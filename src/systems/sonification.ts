import type { createAudio } from './audio.js';

type AudioApi = ReturnType<typeof createAudio>;

export function createSonification(audio: AudioApi) {
  let ctx: AudioContext | null = null;
  let activeOsc: OscillatorNode | null = null;
  let activeGain: GainNode | null = null;
  let pulseTimer: ReturnType<typeof setInterval> | null = null;

  function ensureCtx() {
    if (!ctx && typeof AudioContext !== 'undefined') ctx = new AudioContext();
    return ctx;
  }

  function stop() {
    if (pulseTimer) {
      clearInterval(pulseTimer);
      pulseTimer = null;
    }
    try {
      activeOsc?.stop();
    } catch {
      /* already stopped */
    }
    activeOsc = null;
    activeGain = null;
  }

  function playTone(frequency: number, duration = 0.35, type: OscillatorType = 'sine', volume = 0.06) {
    const c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    stop();

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, c.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration + 0.05);
    activeOsc = osc;
    activeGain = gain;
  }

  function playPulsar(periodSec = 0.033) {
    const c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    stop();

    const intervalMs = Math.max(40, periodSec * 1000);
    pulseTimer = setInterval(() => {
      audio.playSpatialTone?.({ frequency: 880 + Math.random() * 120, duration: 0.04, x: 0, z: -1 });
    }, intervalMs);
  }

  function playExoplanet(orbitalPeriodDays = 365) {
    const freq = 220 + Math.log10(Math.max(1, orbitalPeriodDays)) * 80;
    playTone(freq, 0.6, 'triangle', 0.05);
  }

  function playVariableStar(periodDays = 5) {
    const c = ensureCtx();
    if (!c) return;
    stop();
    const osc = c.createOscillator();
    const gain = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 330;
    lfo.frequency.value = 1 / Math.max(0.5, periodDays);
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(c.destination);
    lfo.start();
    osc.start();
    activeOsc = osc;
    activeGain = gain;
    setTimeout(() => stop(), 4000);
  }

  function sonifyObject(data: Record<string, unknown>) {
    const type = String(data.type || data.category || '').toLowerCase();
    const id = String(data.id || '');

    if (type.includes('pulsar') || id.includes('pulsar')) {
      playPulsar(0.033);
      return 'pulsar';
    }
    if (type.includes('esopian') || id.includes('trappist') || id.includes('proxima')) {
      const days = parseFloat(String(data.orbitalPeriodDays || data.orbitalPeriod || '365').replace(/[^\d.]/g, '')) || 365;
      playExoplanet(days);
      return 'exoplanet';
    }
    if (type.includes('variabil') || id === 'betelgeuse') {
      playVariableStar(400);
      return 'variable';
    }
  }

  function detectKind(data: Record<string, unknown>): string {
    const type = String(data.type || '').toLowerCase();
    if (type.includes('pulsar')) return 'pulsar';
    if (type.includes('esopian')) return 'exoplanet';
    if (type.includes('variabil')) return 'variable';
    return 'default';
  }

  return { sonifyObject, stop, detectKind, playTone };
}
