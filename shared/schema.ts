import { z } from "zod";

export const ChordQuality = {
  Major: "major",
  Minor: "minor", 
  Dominant7: "dominant7",
  Diminished: "diminished",
  Augmented: "augmented",
  Minor7: "minor7",
  Major7: "major7",
} as const;

export const ChordExtension = {
  None: "none",
  Add9: "add9",
  Add11: "add11",
  Add13: "add13",
  Sharp11: "sharp11",
} as const;

export type ChordQuality = typeof ChordQuality[keyof typeof ChordQuality];
export type ChordExtension = typeof ChordExtension[keyof typeof ChordExtension];

export interface ChordVoicing {
  notes: number[]; // MIDI note numbers
  bass: number;
  melody: number;
  quality: ChordQuality;
  extension: ChordExtension;
  root: number; // 0-11 representing C through B
}
