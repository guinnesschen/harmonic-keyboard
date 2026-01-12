// Types
export type {
  PitchClass,
  MidiNote,
  ChordQuality,
  Inversion,
  ChordIntent,
  ChordVoicing,
  QualityKeyMapping,
} from './types';

// Constants
export {
  VOICE_RANGE,
  VOICE_COUNT,
  BASS_KEYS,
  INVERSION_KEYS,
  BASS_OCTAVE_START,
  CHORD_INTERVALS,
  NOTE_NAMES,
  QUALITY_NAMES,
  DEFAULT_QUALITY_MAPPINGS,
  DEFAULT_QUALITIES,
  DRUM_KEY_MAP,
  DRUM_SOUNDS,
} from './constants';

// Chord utilities
export {
  getChordIntervals,
  getChordPitchClasses,
  calculateRootFromBass,
  formatChordName,
  formatChordWithBass,
  getMidiNoteName,
} from './chord';

// Voice leading
export { generateVoicing } from './voiceLeading';

// Key mapping
export {
  parseKeyboardState,
  getKeyboardLayout,
  createDefaultQualityMappings,
  getBassKeyNoteName,
  isBassKey,
  isInversionKey,
  isQualityKey,
} from './keyMapping';
