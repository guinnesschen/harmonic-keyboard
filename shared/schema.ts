import { z } from "zod";

export const ChordQuality = {
  Major: "major",
  Minor: "minor", 
  Dominant7: "dominant7",
  Diminished7: "diminished7",  // Full diminished (1, ♭3, ♭5, ♭♭7)
  HalfDiminished7: "halfdiminished7", // Half diminished (1, ♭3, ♭5, ♭7)
  Minor7: "minor7",
  Major7: "major7",
} as const;

export const ChordPosition = {
  Root: "root",        // Root position (1-3-5)
  First: "first",      // First inversion (3-5-1)
  Second: "second",    // Second inversion (5-1-3)
  ThirdSeventh: "thirdseventh",  // For seventh chords (7-1-3-5)
} as const;

export type ChordQuality = typeof ChordQuality[keyof typeof ChordQuality];
export type ChordPosition = typeof ChordPosition[keyof typeof ChordPosition];

export const InversionMode = {
  Traditional: "traditional", // Bass key is root, inversion modifies voicing
  Functional: "functional",  // Bass key is actual bass, inversion determines its function
} as const;

export const StickyMode = {
  Off: "off",         // Notes stop when keys are released
  On: "on",          // Notes persist, individual modifiers update the chord
} as const;

export type InversionMode = typeof InversionMode[keyof typeof InversionMode];
export type StickyMode = typeof StickyMode[keyof typeof StickyMode];

export interface ChordVoicing {
  notes: number[];     // MIDI note numbers
  bass: number;        // The actual bass note being played
  quality: ChordQuality;
  position: ChordPosition;
  root: number;        // The root note of the chord (0-11 for C through B)
}