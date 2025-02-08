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
  lfo: {
    frequency: number;
    depth: number;
    target: "volume" | "filter" | "pitch" | "none";
    waveform: "sine" | "square" | "triangle" | "sawtooth";
  };
  volume: number;
}

let synth: Tone.PolySynth;
let reverb: Tone.Reverb;
let chorus: Tone.Chorus;
let eq: Tone.EQ3;
let compressor: Tone.Compressor;
let distortion: Tone.Distortion;
let lfo: Tone.LFO;
let filter: Tone.Filter;

const defaultSettings: SynthSettings = {
  oscillator: {
    type: "triangle",
    spread: 20
  },
  envelope: {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.3,
    release: 1
  },
  effects: {
    reverb: {
      decay: 2,
      wet: 0.3
    },
    chorus: {
      depth: 0.5,
      frequency: 4,
      wet: 0.3
    },
    eq: {
      low: 0,
      mid: 0,
      high: 0
    },
    compression: {
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    },
    distortion: {
      distortion: 0.4,
      wet: 0.2
    }
  },
  lfo: {
    frequency: 1,
    depth: 0.5,
    target: "none",
    waveform: "sine"
  },
  volume: -12
};

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

  // Create filter for LFO modulation
  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    rolloff: -12
  }).connect(distortion);

  // Create and configure LFO
  lfo = new Tone.LFO({
    frequency: mergedSettings.lfo.frequency,
    min: -mergedSettings.lfo.depth * 50,
    max: mergedSettings.lfo.depth * 50,
    type: mergedSettings.lfo.waveform
  });

  // Connect LFO based on target
  if (mergedSettings.lfo.target === "filter") {
    lfo.connect(filter.frequency);
  } else if (mergedSettings.lfo.target === "volume") {
    lfo.connect(synth.volume);
  }

  if (mergedSettings.lfo.target !== "none") {
    lfo.start();
  }

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: mergedSettings.oscillator.type
    },
    envelope: mergedSettings.envelope
  }).connect(filter);

  synth.volume.value = mergedSettings.volume;
}

export function updateSynthSettings(settings: Partial<SynthSettings>): void {
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
  if (settings.lfo) {
    lfo.stop();
    lfo.disconnect();

    lfo.frequency.value = settings.lfo.frequency;
    lfo.min = -settings.lfo.depth * 50;
    lfo.max = settings.lfo.depth * 50;
    lfo.type = settings.lfo.waveform;

    // Reconnect LFO based on new target
    if (settings.lfo.target === "filter") {
      lfo.connect(filter.frequency);
    } else if (settings.lfo.target === "volume") {
      lfo.connect(synth.volume);
    }

    if (settings.lfo.target !== "none") {
      lfo.start();
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