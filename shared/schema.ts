import { z } from "zod";

export const ChordQuality = {
  Major: "major",
  Minor: "minor", 
  Dominant7: "dominant7",
  Diminished7: "diminished7",
  HalfDiminished7: "halfdiminished7",
  Minor7: "minor7",
  Major7: "major7",
  DomSus: "domsus",
  Sus: "sus",
  Aug: "aug",
  MinMaj7: "minmaj7",
  Add9: "add9",
  MinAdd9: "minadd9",
} as const;

export const ChordPosition = {
  Root: "root",
  First: "first",
  Second: "second",
  Third: "third",
} as const;

export type ChordQuality = typeof ChordQuality[keyof typeof ChordQuality];
export type ChordPosition = typeof ChordPosition[keyof typeof ChordPosition];

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

// New type for quality key mapping configuration
export interface QualityKeyMapping {
  key: string;
  quality: ChordQuality;
  enabled: boolean;
}

export const LEGAL_QUALITY_KEYS = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '5', '6', '7', '8', '9'] as const;
export type LegalQualityKey = typeof LEGAL_QUALITY_KEYS[number];