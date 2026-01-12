export interface SynthSettings {
  oscillator: {
    type: 'sine' | 'square' | 'triangle' | 'sawtooth';
    spread: number;
  };
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  effects: {
    reverb: { decay: number; wet: number };
    chorus: { depth: number; frequency: number; wet: number };
    eq: { low: number; mid: number; high: number };
    compression: { threshold: number; ratio: number; attack: number; release: number };
    distortion: { distortion: number; wet: number };
  };
  volume: number;
}

export type DrumSound = 'kick' | 'snare' | 'hihat' | 'openhat' | 'crash' | 'rimshot' | 'clap';

export interface DrumEvent {
  time: number;
  sound: DrumSound;
}

export type LoopState = 'idle' | 'recording' | 'playing' | 'overdubbing';
