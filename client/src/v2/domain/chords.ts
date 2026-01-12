import type { ChordIntent, ChordQuality, MidiNote, PitchClass } from "./types";
import { ChordInversion } from "./types";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export function getChordIntervals(quality: ChordQuality): number[] {
  switch (quality) {
    case "major":
      return [0, 4, 7];
    case "minor":
      return [0, 3, 7];
    case "major7":
      return [0, 4, 7, 11];
    case "dominant7":
      return [0, 4, 7, 10];
    case "minor7":
      return [0, 3, 7, 10];
    case "diminished7":
      return [0, 3, 6, 9];
    case "halfdiminished7":
      return [0, 3, 6, 10];
    case "domsus":
      return [0, 5, 7, 10];
    case "sus":
      return [0, 5, 7];
    case "aug":
      return [0, 4, 8];
    case "minmaj7":
      return [0, 3, 7, 11];
    case "add9":
      return [0, 2, 4, 7];
    case "minadd9":
      return [0, 2, 3, 7];
    default:
      return [0, 4, 7];
  }
}

export function spellChord(intent: ChordIntent): PitchClass[] {
  const intervals = getChordIntervals(intent.quality);
  const chordTones = intervals.map((interval) => (intent.root + interval) % 12);
  return Array.from(new Set(chordTones));
}

export function rootFromBass(
  bassPitchClass: PitchClass,
  quality: ChordQuality,
  inversion: ChordInversion,
): PitchClass {
  const intervals = getChordIntervals(quality);
  const third = intervals[1] ?? 0;
  const fifth = intervals[2] ?? 0;
  const seventh = intervals[3] ?? 0;

  let offset = 0;
  switch (inversion) {
    case ChordInversion.First:
      offset = -third;
      break;
    case ChordInversion.Second:
      offset = -fifth;
      break;
    case ChordInversion.Third:
      offset = -seventh;
      break;
    default:
      offset = 0;
  }

  return (bassPitchClass + offset + 12) % 12;
}

export function midiNoteToNoteName(midiNote: MidiNote): string {
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}
