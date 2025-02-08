import { ChordQuality, type ChordQualityConfig } from "@shared/schema";

export const defaultChordQualities: ChordQualityConfig = {
  root: {
    0: ChordQuality.Major,
    1: ChordQuality.Major,
    2: ChordQuality.Minor,
    3: ChordQuality.Major,
    4: ChordQuality.Minor,
    5: ChordQuality.Major,
    6: ChordQuality.Diminished7,
    7: ChordQuality.Major,
    8: ChordQuality.Major,
    9: ChordQuality.Minor,
    10: ChordQuality.Major,
    11: ChordQuality.HalfDiminished7,
  },
  first: {
    0: ChordQuality.Minor,
    1: ChordQuality.Major,
    2: ChordQuality.Major,
    3: ChordQuality.Minor,
    4: ChordQuality.Major,
    5: ChordQuality.Minor,
    6: ChordQuality.Major,
    7: ChordQuality.Minor,
    8: ChordQuality.Minor,
    9: ChordQuality.Major,
    10: ChordQuality.Minor,
    11: ChordQuality.Major,
  },
  second: {
    0: ChordQuality.Major,
    1: ChordQuality.Major,
    2: ChordQuality.Major,
    3: ChordQuality.Major,
    4: ChordQuality.Minor,
    5: ChordQuality.Major,
    6: ChordQuality.Major,
    7: ChordQuality.Major,
    8: ChordQuality.Major,
    9: ChordQuality.Minor,
    10: ChordQuality.Major,
    11: ChordQuality.Minor,
  },
  third: {
    0: ChordQuality.Minor7,
    1: ChordQuality.Major7,
    2: ChordQuality.Minor7,
    3: ChordQuality.Major7,
    4: ChordQuality.Major7,
    5: ChordQuality.Dominant7,
    6: ChordQuality.Major7,
    7: ChordQuality.Minor7,
    8: ChordQuality.Major7,
    9: ChordQuality.Minor7,
    10: ChordQuality.Dominant7,
    11: ChordQuality.Major7,
  },
};

// Helper function to get the quality based on position and note
export function getDefaultQuality(
  position: keyof ChordQualityConfig,
  noteIndex: number,
): ChordQuality {
  return defaultChordQualities[position][noteIndex] || ChordQuality.Major;
}

export function getChordIntervals(quality: ChordQuality): number[] {
  switch (quality) {
    case ChordQuality.Major:
      return [0, 4, 7];
    case ChordQuality.Minor:
      return [0, 3, 7];
    case ChordQuality.Major7:
      return [0, 4, 7, 11];
    case ChordQuality.Dominant7:
      return [0, 4, 7, 10];
    case ChordQuality.Minor7:
      return [0, 3, 7, 10];
    case ChordQuality.Diminished7:
      return [0, 3, 6, 9];
    case ChordQuality.HalfDiminished7:
      return [0, 3, 6, 10];
    case ChordQuality.DomSus:
      return [0, 5, 7, 10];  // Root, 4th, 5th, b7 (fixed: added b7)
    case ChordQuality.Sus:
      return [0, 5, 7];      // Root, 4th, 5th
    case ChordQuality.Aug:
      return [0, 4, 8];      // Root, 3rd, #5
    case ChordQuality.MinMaj7:
      return [0, 3, 7, 11];  // Root, b3, 5, 7
    case ChordQuality.Add9:
      return [0, 2, 4, 7];   // Root, 2nd/9th, 3rd, 5th
    default:
      return [0, 4, 7];
  }
}