import * as Tone from 'tone';
import type { DrumSound, DrumEvent } from './types';

const DRUM_SAMPLES: Record<DrumSound, string> = {
  kick: '/sounds/kick.wav',
  snare: '/sounds/snare.wav',
  hihat: '/sounds/hihat.wav',
  openhat: '/sounds/openhat.wav',
  crash: '/sounds/crash.wav',
  rimshot: '/sounds/rimshot.wav',
  clap: '/sounds/clap.wav',
};

/**
 * DrumKit manages drum sample playback and recording.
 */
export class DrumKit {
  private players = new Map<DrumSound, Tone.Player>();
  private output: Tone.Channel;
  private initialized = false;

  // Recording state
  private recording = false;
  private recordStartTime = 0;
  private recordedEvents: DrumEvent[] = [];

  constructor() {
    this.output = new Tone.Channel().toDestination();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    const loadPromises = Object.entries(DRUM_SAMPLES).map(([name, path]) => {
      return new Promise<void>((resolve, reject) => {
        const player = new Tone.Player({
          url: path,
          onload: () => resolve(),
          onerror: reject,
        }).connect(this.output);

        this.players.set(name as DrumSound, player);
      });
    });

    await Promise.all(loadPromises);
    this.initialized = true;
  }

  trigger(sound: DrumSound): void {
    if (!this.initialized) return;

    const player = this.players.get(sound);
    if (!player) return;

    if (this.recording) {
      this.recordedEvents.push({
        time: Tone.now() - this.recordStartTime,
        sound,
      });
    }

    player.stop();
    player.start();
  }

  startRecording(): void {
    this.recordStartTime = Tone.now();
    this.recordedEvents = [];
    this.recording = true;
  }

  stopRecording(): DrumEvent[] {
    this.recording = false;
    return [...this.recordedEvents];
  }

  isRecording(): boolean {
    return this.recording;
  }

  quantize(events: DrumEvent[], gridSize: number, bpm: number): DrumEvent[] {
    const gridInterval = 60 / (bpm * (gridSize / 4));

    return events.map((event) => ({
      ...event,
      time: Math.round(event.time / gridInterval) * gridInterval,
    }));
  }

  playEvents(events: DrumEvent[]): void {
    const startTime = Tone.now();

    for (const event of events) {
      const player = this.players.get(event.sound);
      if (player) {
        player.start(startTime + event.time);
      }
    }
  }

  setVolume(db: number): void {
    this.output.volume.value = db;
  }

  dispose(): void {
    this.players.forEach((p) => p.dispose());
    this.output.dispose();
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
