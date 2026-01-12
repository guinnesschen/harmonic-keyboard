import * as Tone from "tone";
import type { ChordVoicing } from "../domain/types";
import type { SynthSettings } from "./types";
import { soundPresets } from "./types";

const defaultSettings: SynthSettings = soundPresets["Warm Piano"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, overrides: Partial<T>): T {
  const result = { ...base } as T;
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const overrideValue = overrides[key];
    if (overrideValue === undefined) continue;
    const baseValue = result[key];
    if (isObject(baseValue) && isObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue as Partial<typeof baseValue>) as T[typeof key];
    } else {
      result[key] = overrideValue as T[typeof key];
    }
  }
  return result;
}

export class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private chorus: Tone.Chorus | null = null;
  private eq: Tone.EQ3 | null = null;
  private compressor: Tone.Compressor | null = null;
  private distortion: Tone.Distortion | null = null;
  private settings: SynthSettings = defaultSettings;
  private isInitialized = false;

  async init(settings: Partial<SynthSettings> = {}): Promise<void> {
    if (this.isInitialized) return;
    await Tone.start();

    this.settings = deepMerge(defaultSettings, settings);

    this.reverb = new Tone.Reverb({
      decay: this.settings.effects.reverb.decay,
      wet: this.settings.effects.reverb.wet,
    }).toDestination();

    this.chorus = new Tone.Chorus({
      depth: this.settings.effects.chorus.depth,
      frequency: this.settings.effects.chorus.frequency,
      wet: this.settings.effects.chorus.wet,
    }).connect(this.reverb);

    this.eq = new Tone.EQ3({
      low: this.settings.effects.eq.low,
      mid: this.settings.effects.eq.mid,
      high: this.settings.effects.eq.high,
    }).connect(this.chorus);

    this.compressor = new Tone.Compressor({
      threshold: this.settings.effects.compression.threshold,
      ratio: this.settings.effects.compression.ratio,
      attack: this.settings.effects.compression.attack,
      release: this.settings.effects.compression.release,
    }).connect(this.eq);

    this.distortion = new Tone.Distortion({
      distortion: this.settings.effects.distortion.distortion,
      wet: this.settings.effects.distortion.wet,
    }).connect(this.compressor);

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: this.settings.oscillator.type,
      },
      envelope: this.settings.envelope,
    }).connect(this.distortion);

    this.synth.volume.value = this.settings.volume;
    this.isInitialized = true;
  }

  updateSettings(settings: Partial<SynthSettings>): void {
    if (!this.synth) return;

    this.settings = deepMerge(this.settings, settings);

    if (settings.oscillator) {
      this.synth.set({ oscillator: { type: this.settings.oscillator.type } });
    }
    if (settings.envelope) {
      this.synth.set({ envelope: this.settings.envelope });
    }
    if (settings.volume !== undefined) {
      this.synth.volume.value = this.settings.volume;
    }

    if (settings.effects) {
      if (settings.effects.reverb && this.reverb) {
        this.reverb.set(this.settings.effects.reverb);
      }
      if (settings.effects.chorus && this.chorus) {
        this.chorus.set(this.settings.effects.chorus);
      }
      if (settings.effects.eq && this.eq) {
        this.eq.set(this.settings.effects.eq);
      }
      if (settings.effects.compression && this.compressor) {
        this.compressor.set(this.settings.effects.compression);
      }
      if (settings.effects.distortion && this.distortion) {
        this.distortion.set(this.settings.effects.distortion);
      }
    }
  }

  playVoicing(voicing: ChordVoicing | null): void {
    if (!this.synth) return;

    this.synth.releaseAll();
    if (!voicing || !voicing.notes.length) return;

    const frequencies = voicing.notes.map((note) =>
      Tone.Frequency(note, "midi").toFrequency(),
    );
    this.synth.triggerAttack(frequencies);
  }

  stop(): void {
    if (!this.synth) return;
    this.synth.releaseAll();
  }

  dispose(): void {
    this.stop();
    this.synth?.dispose();
    this.reverb?.dispose();
    this.chorus?.dispose();
    this.eq?.dispose();
    this.compressor?.dispose();
    this.distortion?.dispose();
    this.synth = null;
    this.reverb = null;
    this.chorus = null;
    this.eq = null;
    this.compressor = null;
    this.distortion = null;
    this.isInitialized = false;
  }

  getSettings(): SynthSettings {
    return this.settings;
  }
}
