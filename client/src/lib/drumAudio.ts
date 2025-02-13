import * as Tone from "tone";

export interface DrumSampleMap {
  crash: string;
  hihat: string;
  openhat: string;
  snare: string;
  kick: string;
  rimshot: string;
  clap: string;
}

export interface DrumMixSettings {
  volume: number;
  compression: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  eq: {
    low: number;
    mid: number;
    high: number;
  };
}

const defaultDrumMixSettings: DrumMixSettings = {
  volume: -6,
  compression: {
    threshold: -20,
    ratio: 4,
    attack: 0.003,
    release: 0.25,
  },
  eq: {
    low: 0,
    mid: 0,
    high: 0,
  },
};

class DrumAudioEngine {
  private players: Map<string, Tone.Player>;
  private mixBus: Tone.Channel;
  private compressor: Tone.Compressor;
  private eq: Tone.EQ3;
  private mainOutput: Tone.Channel;
  private initialized: boolean = false;
  private loadedSamples: Set<string> = new Set();

  constructor() {
    this.players = new Map();
    this.mixBus = new Tone.Channel();
    this.compressor = new Tone.Compressor();
    this.eq = new Tone.EQ3();
    this.mainOutput = new Tone.Channel().toDestination();

    // Set up audio routing
    this.eq.connect(this.compressor);
    this.compressor.connect(this.mixBus);
    this.mixBus.connect(this.mainOutput);
  }

  async initialize(settings: DrumMixSettings = defaultDrumMixSettings) {
    if (this.initialized) return;

    // Don't start Tone.js here, wait for user interaction

    // Load drum samples
    const samples: DrumSampleMap = {
      crash: "/attached_assets/crash.wav",
      hihat: "/attached_assets/hihat.wav",
      openhat: "/attached_assets/openhat.wav",
      snare: "/attached_assets/snare.wav",
      kick: "/attached_assets/kick.wav",
      rimshot: "/attached_assets/rimshot.wav",
      clap: "/attached_assets/clap.wav",
    };

    try {
      // Create and load players for each sample
      const loadPromises = Object.entries(samples).map(([name, path]) => {
        return new Promise<void>((resolve, reject) => {
          try {
            const player = new Tone.Player({
              url: path,
              onload: () => {
                console.log(`Loaded drum sample: ${name}`);
                this.loadedSamples.add(name);
                resolve();
              },
              onerror: (error) => {
                console.error(`Failed to load drum sample ${name}:`, error);
                reject(error);
              }
            }).connect(this.eq);

            this.players.set(name, player);
          } catch (error) {
            console.error(`Error creating player for ${name}:`, error);
            reject(error);
          }
        });
      });

      await Promise.all(loadPromises);
      this.applyMixSettings(settings);
      this.initialized = true;
      console.log("All drum samples loaded successfully");
    } catch (error) {
      console.error("Failed to load one or more drum samples:", error);
      throw error;
    }
  }

  async startAudioContext() {
    try {
      await Tone.start();
      console.log("Audio context started successfully");
    } catch (error) {
      console.error("Failed to start audio context:", error);
      throw error;
    }
  }

  applyMixSettings(settings: DrumMixSettings) {
    this.mixBus.volume.value = settings.volume;

    this.compressor.threshold.value = settings.compression.threshold;
    this.compressor.ratio.value = settings.compression.ratio;
    this.compressor.attack.value = settings.compression.attack;
    this.compressor.release.value = settings.compression.release;

    this.eq.low.value = settings.eq.low;
    this.eq.mid.value = settings.eq.mid;
    this.eq.high.value = settings.eq.high;
  }

  triggerSample(name: keyof DrumSampleMap) {
    if (!this.initialized || !this.loadedSamples.has(name)) {
      console.warn(`Cannot trigger sample ${name}: not initialized or loaded`);
      return;
    }

    const player = this.players.get(name);
    if (!player) return;

    // Stop the current playback and restart immediately to handle rapid triggers
    player.stop();
    player.start();
  }

  cleanup() {
    this.players.forEach(player => player.dispose());
    this.mixBus.dispose();
    this.compressor.dispose();
    this.eq.dispose();
    this.mainOutput.dispose();
  }
}

// Create a singleton instance
export const drumAudioEngine = new DrumAudioEngine();