// Pitch class (0-11, where 0 = C)
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// MIDI note number (0-127)
export type MidiNote = number;

// Chord qualities supported
export type ChordQuality =
  | 'major'
  | 'minor'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'diminished7'
  | 'halfDiminished7'
  | 'augmented'
  | 'sus4'
  | 'dominant7sus4'
  | 'minorMajor7'
  | 'add9'
  | 'minorAdd9';

// Chord inversion (which chord tone is in the bass)
export type Inversion = 0 | 1 | 2 | 3;

// The user's intent before voice leading
export interface ChordIntent {
  bassNote: PitchClass;
  quality: ChordQuality;
  inversion: Inversion;
}

// A fully voiced chord ready to play
export interface ChordVoicing {
  root: PitchClass;
  quality: ChordQuality;
  inversion: Inversion;
  notes: MidiNote[];
}

// Key mapping configuration
export interface QualityKeyMapping {
  key: string;
  quality: ChordQuality;
  enabled: boolean;
}
