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
