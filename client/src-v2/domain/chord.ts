import type { ChordQuality, PitchClass, Inversion } from './types';
import { CHORD_INTERVALS, NOTE_NAMES, QUALITY_NAMES } from './constants';

/**
 * Get the intervals (in semitones) for a chord quality
 */
export function getChordIntervals(quality: ChordQuality): readonly number[] {
  return CHORD_INTERVALS[quality];
}

/**
 * Get pitch classes for a chord (root + intervals mod 12)
 */
export function getChordPitchClasses(root: PitchClass, quality: ChordQuality): PitchClass[] {
  const intervals = getChordIntervals(quality);
  return [...new Set(intervals.map((interval) => ((root + interval) % 12) as PitchClass))];
}

/**
 * Calculate the root note from bass note and inversion
 */
export function calculateRootFromBass(
  bassNote: PitchClass,
  inversion: Inversion,
  quality: ChordQuality
): PitchClass {
  const intervals = getChordIntervals(quality);
  const offset = intervals[inversion] ?? 0;
  return ((bassNote - offset + 12) % 12) as PitchClass;
}

/**
 * Format a chord for display (e.g., "Cmaj7", "F#min")
 */
export function formatChordName(root: PitchClass, quality: ChordQuality): string {
  return `${NOTE_NAMES[root]}${QUALITY_NAMES[quality]}`;
}

/**
 * Format a chord with bass note (e.g., "Cmaj7/E")
 */
export function formatChordWithBass(
  root: PitchClass,
  quality: ChordQuality,
  bassNote: PitchClass
): string {
  const chordName = formatChordName(root, quality);
  if (root === bassNote) {
    return chordName;
  }
  return `${chordName}/${NOTE_NAMES[bassNote]}`;
}

/**
 * Get the note name for a MIDI note
 */
export function getMidiNoteName(midiNote: number): string {
  const pitchClass = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}
