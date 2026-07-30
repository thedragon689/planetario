import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/config.js', () => ({
  SCENES: { EARTH: 'earth' },
  AUDIO: {
    soundtrack: {
      src: '/assets/audio/cosmos-main-title.mp3',
      title: 'Cosmos',
      artist: 'Vangelis',
      loop: true,
      volume: 0.72,
    },
    crossfadeMs: 40,
    playlists: {
      earth: {
        src: '/assets/audio/oxygene-part-4.mp3',
        title: 'Oxygene',
        artist: 'Jarre',
        volume: 0.7,
      },
    },
  },
}));

class MockAudio {
  loop = false;
  preload = '';
  src = '';
  volume = 1;
  currentTime = 0;
  paused = true;
  readyState = 4;
  _preDuckVolume: number | null = null;

  load() {}

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
}

describe('createAudio', () => {
  it('starts soundtrack on toggle within the same user gesture turn', async () => {
    vi.stubGlobal('Audio', MockAudio);
    vi.stubGlobal('AudioContext', undefined);

    const { createAudio } = await import('../src/systems/audio.js');
    const audio = createAudio();

    const on = await audio.toggle();
    expect(on).toBe(true);
    expect(audio.isEnabled()).toBe(true);
  });

  it('reports disabled when play() is rejected', async () => {
    class RejectingAudio extends MockAudio {
      play() {
        return Promise.reject(new Error('NotAllowedError'));
      }
    }

    vi.stubGlobal('Audio', RejectingAudio);
    vi.stubGlobal('AudioContext', undefined);

    const { createAudio } = await import('../src/systems/audio.js');
    const audio = createAudio();

    const on = await audio.toggle();
    expect(on).toBe(false);
    expect(audio.isEnabled()).toBe(false);
  });
});
