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
  private mainOutput: Tone.Destination;
  private initialized: boolean = false;

  constructor() {
    this.players = new Map();
    this.mixBus = new Tone.Channel();
    this.compressor = new Tone.Compressor();
    this.eq = new Tone.EQ3();
    this.mainOutput = Tone.Destination;

    // Set up audio routing
    this.eq.connect(this.compressor);
    this.compressor.connect(this.mixBus);
    this.mixBus.connect(this.mainOutput);
  }

  async initialize(settings: DrumMixSettings = defaultDrumMixSettings) {
    if (this.initialized) return;

    await Tone.start();
    
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

    // Create players for each sample
    for (const [name, path] of Object.entries(samples)) {
      const player = new Tone.Player({
        url: path,
        onload: () => {
          console.log(`Loaded drum sample: ${name}`);
        },
      }).connect(this.eq);
      this.players.set(name, player);
    }

    this.applyMixSettings(settings);
    this.initialized = true;
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
    const player = this.players.get(name);
    if (!player) return;

    // Create a new buffer source for each trigger to allow overlapping
    player.start();
  }

  cleanup() {
    this.players.forEach(player => player.dispose());
    this.mixBus.dispose();
    this.compressor.dispose();
    this.eq.dispose();
  }
}

// Create a singleton instance
export const drumAudioEngine = new DrumAudioEngine();
