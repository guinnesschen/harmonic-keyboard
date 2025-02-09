import * as Tone from "tone";
import type { ChordVoicing } from "@shared/schema";

interface SynthSettings {
  oscillator: {
    type: "sine" | "square" | "triangle" | "sawtooth";
    spread: number;
  };
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  effects: {
    reverb: {
      decay: number;
      wet: number;
    };
    chorus: {
      depth: number;
      frequency: number;
      wet: number;
    };
    eq: {
      low: number;
      mid: number;
      high: number;
    };
    compression: {
      threshold: number;
      ratio: number;
      attack: number;
      release: number;
    };
    distortion: {
      distortion: number;
      wet: number;
    };
  };
  volume: number;
}

export const soundPresets = {
  "Warm Piano": {
    oscillator: {
      type: "triangle",
      spread: 15
    },
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.7,
      release: 0.8
    },
    effects: {
      reverb: {
        decay: 1.5,
        wet: 0.3
      },
      chorus: {
        depth: 0.3,
        frequency: 2.5,
        wet: 0.2
      },
      eq: {
        low: 2,
        mid: 0,
        high: -2
      },
      compression: {
        threshold: -20,
        ratio: 4,
        attack: 0.003,
        release: 0.25
      },
      distortion: {
        distortion: 0.2,
        wet: 0.1
      }
    },
    volume: -12
  },
  "Lo-fi Dreams": {
    oscillator: {
      type: "triangle",
      spread: 30
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.6,
      release: 1.2
    },
    effects: {
      reverb: {
        decay: 3,
        wet: 0.4
      },
      chorus: {
        depth: 0.6,
        frequency: 0.8,
        wet: 0.5
      },
      eq: {
        low: 4,
        mid: -2,
        high: -4
      },
      compression: {
        threshold: -25,
        ratio: 6,
        attack: 0.01,
        release: 0.3
      },
      distortion: {
        distortion: 0.4,
        wet: 0.3
      }
    },
    volume: -14
  },
  "Digital Clear": {
    oscillator: {
      type: "sine",
      spread: 5
    },
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.8,
      release: 0.5
    },
    effects: {
      reverb: {
        decay: 1,
        wet: 0.2
      },
      chorus: {
        depth: 0.2,
        frequency: 4,
        wet: 0.15
      },
      eq: {
        low: 0,
        mid: 2,
        high: 3
      },
      compression: {
        threshold: -18,
        ratio: 3,
        attack: 0.002,
        release: 0.2
      },
      distortion: {
        distortion: 0.1,
        wet: 0.05
      }
    },
    volume: -10
  },
  "Cinematic Pad": {
    oscillator: {
      type: "sine",
      spread: 40
    },
    envelope: {
      attack: 0.3,
      decay: 0.4,
      sustain: 0.8,
      release: 2.5
    },
    effects: {
      reverb: {
        decay: 4,
        wet: 0.5
      },
      chorus: {
        depth: 0.7,
        frequency: 2,
        wet: 0.4
      },
      eq: {
        low: 3,
        mid: 1,
        high: 2
      },
      compression: {
        threshold: -25,
        ratio: 5,
        attack: 0.05,
        release: 0.4
      },
      distortion: {
        distortion: 0.2,
        wet: 0.15
      }
    },
    volume: -15
  },
  "Vintage OP": {
    oscillator: {
      type: "sawtooth",
      spread: 25
    },
    envelope: {
      attack: 0.04,
      decay: 0.15,
      sustain: 0.6,
      release: 0.8
    },
    effects: {
      reverb: {
        decay: 1.8,
        wet: 0.25
      },
      chorus: {
        depth: 0.5,
        frequency: 3.5,
        wet: 0.3
      },
      eq: {
        low: 2,
        mid: -1,
        high: 1
      },
      compression: {
        threshold: -22,
        ratio: 4,
        attack: 0.005,
        release: 0.2
      },
      distortion: {
        distortion: 0.3,
        wet: 0.2
      }
    },
    volume: -13
  }
} as const;

export type SoundPresetName = keyof typeof soundPresets;

let synth: Tone.PolySynth;
let reverb: Tone.Reverb;
let chorus: Tone.Chorus;
let eq: Tone.EQ3;
let compressor: Tone.Compressor;
let distortion: Tone.Distortion;

const defaultSettings: SynthSettings = soundPresets["Warm Piano"];

export async function initAudio(settings: Partial<SynthSettings> = {}): Promise<void> {
  await Tone.start();

  const mergedSettings = { ...defaultSettings, ...settings };

  // Create effects chain
  reverb = new Tone.Reverb({
    decay: mergedSettings.effects.reverb.decay,
    wet: mergedSettings.effects.reverb.wet
  }).toDestination();

  chorus = new Tone.Chorus({
    depth: mergedSettings.effects.chorus.depth,
    frequency: mergedSettings.effects.chorus.frequency,
    wet: mergedSettings.effects.chorus.wet
  }).connect(reverb);

  eq = new Tone.EQ3({
    low: mergedSettings.effects.eq.low,
    mid: mergedSettings.effects.eq.mid,
    high: mergedSettings.effects.eq.high
  }).connect(chorus);

  compressor = new Tone.Compressor({
    threshold: mergedSettings.effects.compression.threshold,
    ratio: mergedSettings.effects.compression.ratio,
    attack: mergedSettings.effects.compression.attack,
    release: mergedSettings.effects.compression.release
  }).connect(eq);

  distortion = new Tone.Distortion({
    distortion: mergedSettings.effects.distortion.distortion,
    wet: mergedSettings.effects.distortion.wet
  }).connect(compressor);

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: mergedSettings.oscillator.type
    },
    envelope: mergedSettings.envelope
  }).connect(distortion);

  synth.volume.value = mergedSettings.volume;
}

export function updateSynthSettings(settings: Partial<SynthSettings>): void {
  if (!synth) return;

  if (settings.oscillator) {
    synth.set({
      oscillator: {
        type: settings.oscillator.type
      }
    });
  }
  if (settings.envelope) {
    synth.set({ envelope: settings.envelope });
  }
  if (settings.volume !== undefined) {
    synth.volume.value = settings.volume;
  }
  if (settings.effects) {
    const { reverb: reverbSettings, chorus: chorusSettings, eq: eqSettings, compression: compressionSettings, distortion: distortionSettings } = settings.effects;

    if (reverbSettings) {
      reverb.set(reverbSettings);
    }
    if (chorusSettings) {
      chorus.set(chorusSettings);
    }
    if (eqSettings) {
      eq.set(eqSettings);
    }
    if (compressionSettings) {
      compressor.set(compressionSettings);
    }
    if (distortionSettings) {
      distortion.set(distortionSettings);
    }
  }
}

export function playChord(voicing: ChordVoicing | null) {
  if (!synth) return;

  // Stop all currently playing notes
  synth.releaseAll();

  // If no voicing is provided or no notes to play, return
  if (!voicing || !voicing.notes.length) {
    return;
  }

  // Convert MIDI notes to frequencies
  const frequencies = voicing.notes.map(note =>
    Tone.Frequency(note, "midi").toFrequency()
  );

  // Play the new notes
  synth.triggerAttack(frequencies);
}

export type { SynthSettings };