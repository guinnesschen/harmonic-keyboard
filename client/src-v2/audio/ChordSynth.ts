import * as Tone from 'tone';
import type { SynthSettings } from './types';
import type { MidiNote } from '../domain/types';
import { PRESETS, DEFAULT_PRESET } from './presets';

/**
 * ChordSynth manages a polyphonic synthesizer with effects chain.
 * Signal chain: Synth -> Distortion -> Compressor -> EQ -> Chorus -> Reverb -> Out
 */
export class ChordSynth {
  private synth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private chorus: Tone.Chorus | null = null;
  private eq: Tone.EQ3 | null = null;
  private compressor: Tone.Compressor | null = null;
  private distortion: Tone.Distortion | null = null;
  private initialized = false;

  async initialize(settings: SynthSettings = PRESETS[DEFAULT_PRESET]): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    // Build effects chain (end to start)
    this.reverb = new Tone.Reverb({
      decay: settings.effects.reverb.decay,
      wet: settings.effects.reverb.wet,
    }).toDestination();

    this.chorus = new Tone.Chorus({
      depth: settings.effects.chorus.depth,
      frequency: settings.effects.chorus.frequency,
      wet: settings.effects.chorus.wet,
    }).connect(this.reverb);

    this.eq = new Tone.EQ3({
      low: settings.effects.eq.low,
      mid: settings.effects.eq.mid,
      high: settings.effects.eq.high,
    }).connect(this.chorus);

    this.compressor = new Tone.Compressor({
      threshold: settings.effects.compression.threshold,
      ratio: settings.effects.compression.ratio,
      attack: settings.effects.compression.attack,
      release: settings.effects.compression.release,
    }).connect(this.eq);

    this.distortion = new Tone.Distortion({
      distortion: settings.effects.distortion.distortion,
      wet: settings.effects.distortion.wet,
    }).connect(this.compressor);

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: settings.oscillator.type },
      envelope: settings.envelope,
    }).connect(this.distortion);

    this.synth.volume.value = settings.volume;
    this.initialized = true;
  }

  playChord(notes: MidiNote[]): void {
    if (!this.synth) return;

    this.synth.releaseAll();

    if (notes.length === 0) return;

    const frequencies = notes.map((note) => Tone.Frequency(note, 'midi').toFrequency());
    this.synth.triggerAttack(frequencies);
  }

  release(): void {
    this.synth?.releaseAll();
  }

  updateSettings(settings: Partial<SynthSettings>): void {
    if (!this.synth) return;

    if (settings.oscillator) {
      this.synth.set({ oscillator: { type: settings.oscillator.type } });
    }
    if (settings.envelope) {
      this.synth.set({ envelope: settings.envelope });
    }
    if (settings.volume !== undefined) {
      this.synth.volume.value = settings.volume;
    }
    if (settings.effects) {
      const { reverb, chorus, eq, compression, distortion } = settings.effects;
      if (reverb) this.reverb?.set(reverb);
      if (chorus) this.chorus?.set(chorus);
      if (eq) this.eq?.set(eq);
      if (compression) this.compressor?.set(compression);
      if (distortion) this.distortion?.set(distortion);
    }
  }

  applyPreset(name: string): void {
    const preset = PRESETS[name];
    if (preset) this.updateSettings(preset);
  }

  dispose(): void {
    this.synth?.dispose();
    this.reverb?.dispose();
    this.chorus?.dispose();
    this.eq?.dispose();
    this.compressor?.dispose();
    this.distortion?.dispose();
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
