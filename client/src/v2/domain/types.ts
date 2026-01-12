export type PitchClass = number;
export type MidiNote = number;

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

export const ChordInversion = {
  Root: "root",
  First: "first",
  Second: "second",
  Third: "third",
} as const;

export type ChordQuality = typeof ChordQuality[keyof typeof ChordQuality];
export type ChordInversion = typeof ChordInversion[keyof typeof ChordInversion];

export type ChordQualityConfig = {
  root: Record<PitchClass, ChordQuality>;
  first: Record<PitchClass, ChordQuality>;
  second: Record<PitchClass, ChordQuality>;
  third: Record<PitchClass, ChordQuality>;
};

export interface ChordIntent {
  root: PitchClass;
  bass: MidiNote;
  quality: ChordQuality;
  inversion: ChordInversion;
}

export interface ChordVoicing {
  intent: ChordIntent;
  notes: MidiNote[];
}

export interface QualityKeyMapping {
  key: string;
  quality: ChordQuality;
  enabled: boolean;
}

export const LEGAL_QUALITY_KEYS = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;

export type LegalQualityKey = typeof LEGAL_QUALITY_KEYS[number];
