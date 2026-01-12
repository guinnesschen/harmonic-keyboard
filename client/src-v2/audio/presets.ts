import type { SynthSettings } from './types';

export const PRESETS: Record<string, SynthSettings> = {
  'Warm Piano': {
    oscillator: { type: 'triangle', spread: 15 },
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.8 },
    effects: {
      reverb: { decay: 1.5, wet: 0.3 },
      chorus: { depth: 0.3, frequency: 2.5, wet: 0.2 },
      eq: { low: 2, mid: 0, high: -2 },
      compression: { threshold: -20, ratio: 4, attack: 0.003, release: 0.25 },
      distortion: { distortion: 0.2, wet: 0.1 },
    },
    volume: -12,
  },
  'Lo-fi Dreams': {
    oscillator: { type: 'triangle', spread: 30 },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 1.2 },
    effects: {
      reverb: { decay: 3, wet: 0.4 },
      chorus: { depth: 0.6, frequency: 0.8, wet: 0.5 },
      eq: { low: 4, mid: -2, high: -4 },
      compression: { threshold: -25, ratio: 6, attack: 0.01, release: 0.3 },
      distortion: { distortion: 0.4, wet: 0.3 },
    },
    volume: -14,
  },
  'Digital Clear': {
    oscillator: { type: 'sine', spread: 5 },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.5 },
    effects: {
      reverb: { decay: 1, wet: 0.2 },
      chorus: { depth: 0.2, frequency: 4, wet: 0.15 },
      eq: { low: 0, mid: 2, high: 3 },
      compression: { threshold: -18, ratio: 3, attack: 0.002, release: 0.2 },
      distortion: { distortion: 0.1, wet: 0.05 },
    },
    volume: -10,
  },
  'Cinematic Pad': {
    oscillator: { type: 'sine', spread: 40 },
    envelope: { attack: 0.3, decay: 0.4, sustain: 0.8, release: 2.5 },
    effects: {
      reverb: { decay: 4, wet: 0.5 },
      chorus: { depth: 0.7, frequency: 2, wet: 0.4 },
      eq: { low: 3, mid: 1, high: 2 },
      compression: { threshold: -25, ratio: 5, attack: 0.05, release: 0.4 },
      distortion: { distortion: 0.2, wet: 0.15 },
    },
    volume: -15,
  },
  'Vintage OP': {
    oscillator: { type: 'sawtooth', spread: 25 },
    envelope: { attack: 0.04, decay: 0.15, sustain: 0.6, release: 0.8 },
    effects: {
      reverb: { decay: 1.8, wet: 0.25 },
      chorus: { depth: 0.5, frequency: 3.5, wet: 0.3 },
      eq: { low: 2, mid: -1, high: 1 },
      compression: { threshold: -22, ratio: 4, attack: 0.005, release: 0.2 },
      distortion: { distortion: 0.3, wet: 0.2 },
    },
    volume: -13,
  },
};

export const DEFAULT_PRESET = 'Warm Piano';
export const PRESET_NAMES = Object.keys(PRESETS);
