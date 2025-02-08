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
  ThirdSeventh: "thirdseventh",
} as const;

export const InversionMode = {
  Traditional: "traditional",
  Functional: "functional",
} as const;

export const StickyMode = {
  Off: "off",
  On: "on",
} as const;

export const BackgroundMode = {
  Animated: "animated",
  Minimal: "minimal",
} as const;

export type ChordQuality = typeof ChordQuality[keyof typeof ChordQuality];
export type ChordPosition = typeof ChordPosition[keyof typeof ChordPosition];
export type InversionMode = typeof InversionMode[keyof typeof InversionMode];
export type StickyMode = typeof StickyMode[keyof typeof StickyMode];
export type BackgroundMode = typeof BackgroundMode[keyof typeof BackgroundMode];

export interface ChordVoicing {
  notes: number[];
  bass: number;
  quality: ChordQuality;
  position: ChordPosition;
  root: number;
}
