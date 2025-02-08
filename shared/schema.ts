import { z } from "zod";

export const ChordQuality = {
  Major: "major",
  Minor: "minor", 
  Dominant7: "dominant7",
  Diminished7: "diminished7",
  HalfDiminished7: "halfdiminished7",
  Minor7: "minor7",
  Major7: "major7",
} as const;

export const ChordPosition = {
  Root: "root",
  First: "first",
  Second: "second",
  Third: "third",
} as const;

export const StickyMode = {
  Off: "off",
  On: "on",
} as const;

export type ChordQuality = typeof ChordQuality[keyof typeof ChordQuality];
export type ChordPosition = typeof ChordPosition[keyof typeof ChordPosition];
export type StickyMode = typeof StickyMode[keyof typeof StickyMode];

// Type for chord quality configuration
export type ChordQualityConfig = {
  root: Record<number, ChordQuality>;
  first: Record<number, ChordQuality>;
  second: Record<number, ChordQuality>;
  third: Record<number, ChordQuality>;
};

export interface ChordVoicing {
  notes: number[];
  bass: number;
  quality: ChordQuality;
  position: ChordPosition;
  root: number;
}