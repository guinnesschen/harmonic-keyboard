import { ChordQuality, type ChordQualityConfig } from "@shared/schema";

export const defaultChordQualities: ChordQualityConfig = {
  root: {
    0: ChordQuality.Major, // C
    1: ChordQuality.Major, // C#/Db
    2: ChordQuality.Minor, // D
    3: ChordQuality.Major, // D#/Eb
    4: ChordQuality.Minor, // E
    5: ChordQuality.Major, // F
    6: ChordQuality.Diminished7, // F#/Gb
    7: ChordQuality.Major, // G
    8: ChordQuality.Major, // G#/Ab
    9: ChordQuality.Minor, // A
    10: ChordQuality.Major, // A#/Bb
    11: ChordQuality.HalfDiminished7, // B
  },
  first: {
    0: ChordQuality.Minor, // C
    1: ChordQuality.Major, // C#
    2: ChordQuality.Major, // D
    3: ChordQuality.Minor, // D#
    4: ChordQuality.Major, // E
    5: ChordQuality.Minor, // F
    6: ChordQuality.Major, // F#
    7: ChordQuality.Minor, // G
    8: ChordQuality.Minor, // G#
    9: ChordQuality.Major, // A
    10: ChordQuality.Minor, // A#
    11: ChordQuality.Major, // B
  },
  second: {
    0: ChordQuality.Major, // C
    1: ChordQuality.Major, // C#
    2: ChordQuality.Major, // D
    3: ChordQuality.Major, // D#
    4: ChordQuality.Minor, // E
    5: ChordQuality.Major, // F
    6: ChordQuality.Major, // F#
    7: ChordQuality.Major, // G
    8: ChordQuality.Major, // G#
    9: ChordQuality.Minor, // A
    10: ChordQuality.Major, // A#
    11: ChordQuality.Minor, // B
  },
  third: {
    0: ChordQuality.Minor7, // C
    1: ChordQuality.Major7, // C#
    2: ChordQuality.Minor7, // D
    3: ChordQuality.Major7, // D#
    4: ChordQuality.Major7, // E
    5: ChordQuality.Dominant7, // F
    6: ChordQuality.Major7, // F#
    7: ChordQuality.Minor7, // G
    8: ChordQuality.Major7, // G#
    9: ChordQuality.Minor7, // A
    10: ChordQuality.Dominant7, // A#
    11: ChordQuality.Major7, // B
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
      return [0, 5, 7, 10];  // Root, 4th, 5th, b7
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