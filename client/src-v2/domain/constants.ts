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

// Default chord qualities by inversion and bass note (hand-picked for C major)
// Index is bass note pitch class (0=C, 1=C#, 2=D, etc.)
export const DEFAULT_QUALITIES: Record<'root' | 'first' | 'second' | 'third', Record<number, ChordQuality>> = {
  // Root position: diatonic triads in C major
  root: {
    0: 'major',           // C
    1: 'major',           // Db
    2: 'minor',           // D
    3: 'major',           // Eb
    4: 'minor',           // E
    5: 'major',           // F
    6: 'diminished7',     // F#/Gb
    7: 'major',           // G
    8: 'major',           // Ab
    9: 'minor',           // A
    10: 'major',          // Bb
    11: 'halfDiminished7', // B
  },
  // First inversion: bass is the 3rd
  first: {
    0: 'minor',           // C in bass = Am/C
    1: 'major',           // Db
    2: 'major',           // D in bass = Bb/D
    3: 'minor',           // Eb
    4: 'major',           // E in bass = C/E
    5: 'minor',           // F in bass = Dm/F
    6: 'major',           // Gb
    7: 'minor',           // G in bass = Em/G
    8: 'minor',           // Ab
    9: 'major',           // A in bass = F/A
    10: 'minor',          // Bb
    11: 'major',          // B in bass = G/B
  },
  // Second inversion: bass is the 5th
  second: {
    0: 'major',           // C in bass = F/C
    1: 'major',           // Db
    2: 'major',           // D in bass = G/D
    3: 'major',           // Eb
    4: 'minor',           // E in bass = Am/E
    5: 'major',           // F
    6: 'major',           // Gb
    7: 'major',           // G in bass = C/G
    8: 'major',           // Ab
    9: 'minor',           // A in bass = Dm/A
    10: 'major',          // Bb
    11: 'minor',          // B in bass = Em/B
  },
  // Third inversion: bass is the 7th (implies 7th chord)
  third: {
    0: 'minor7',          // C in bass = Dm7/C
    1: 'major7',          // Db
    2: 'minor7',          // D in bass = Em7/D
    3: 'major7',          // Eb
    4: 'major7',          // E in bass = Fmaj7/E
    5: 'dominant7',       // F in bass = G7/F
    6: 'major7',          // Gb
    7: 'minor7',          // G in bass = Am7/G
    8: 'major7',          // Ab
    9: 'minor7',          // A in bass = Bm7b5/A
    10: 'dominant7',      // Bb in bass = C7/Bb (if treating as dominant)
    11: 'major7',         // B in bass = Cmaj7/B
  },
};
