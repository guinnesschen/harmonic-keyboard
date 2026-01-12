import type { ChordQuality } from './types';

// Voice range limits
export const VOICE_RANGE = {
  min: 48, // C3
  max: 84, // C6
} as const;

export const VOICE_COUNT = 5;

// Keyboard layout
export const BASS_KEYS = 'zsxdcvgbhnjm,l.;/' as const;
export const INVERSION_KEYS = '0123' as const;

// Starting MIDI note for bass (C3)
export const BASS_OCTAVE_START = 48;

// Chord intervals (semitones from root)
export const CHORD_INTERVALS: Record<ChordQuality, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],
  augmented: [0, 4, 8],
  sus4: [0, 5, 7],
  dominant7sus4: [0, 5, 7, 10],
  minorMajor7: [0, 3, 7, 11],
  add9: [0, 4, 7, 14],
  minorAdd9: [0, 3, 7, 14],
} as const;

// Note names for display
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Quality display names
export const QUALITY_NAMES: Record<ChordQuality, string> = {
  major: 'maj',
  minor: 'min',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'min7',
  diminished7: 'dim7',
  halfDiminished7: 'm7b5',
  augmented: 'aug',
  sus4: 'sus4',
  dominant7sus4: '7sus4',
  minorMajor7: 'mM7',
  add9: 'add9',
  minorAdd9: 'madd9',
} as const;

// Default quality key mappings
export const DEFAULT_QUALITY_MAPPINGS: readonly { key: string; quality: ChordQuality }[] = [
  { key: 'Q', quality: 'major' },
  { key: 'W', quality: 'major7' },
  { key: 'E', quality: 'dominant7' },
  { key: 'R', quality: 'minor' },
  { key: 'T', quality: 'minor7' },
  { key: 'Y', quality: 'diminished7' },
  { key: 'U', quality: 'halfDiminished7' },
  { key: 'I', quality: 'dominant7sus4' },
  { key: 'O', quality: 'sus4' },
  { key: 'P', quality: 'augmented' },
  { key: '5', quality: 'minorMajor7' },
  { key: '6', quality: 'add9' },
  { key: '7', quality: 'minorAdd9' },
] as const;

// Drum sounds and their keyboard mappings
export const DRUM_KEY_MAP: Record<string, string> = {
  a: 'kick',
  s: 'snare',
  d: 'hihat',
  f: 'openhat',
  g: 'crash',
  h: 'rimshot',
  j: 'clap',
} as const;

export const DRUM_SOUNDS = ['kick', 'snare', 'hihat', 'openhat', 'crash', 'rimshot', 'clap'] as const;
