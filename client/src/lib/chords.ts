import { ChordQuality } from "@shared/schema";

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
    case ChordQuality.Major:
      return [0, 4, 7]; // Root, major third, perfect fifth
    case ChordQuality.Minor:
      return [0, 3, 7]; // Root, minor third, perfect fifth
    case ChordQuality.Dominant7:
      return [0, 4, 7, 10]; // Root, major third, perfect fifth, minor seventh
    case ChordQuality.DomSus:
      return [0, 5, 7, 10];
    case ChordQuality.Diminished7:
      return [0, 3, 6, 9]; // Root, minor third, diminished fifth, diminished seventh
    case ChordQuality.HalfDiminished7:
      return [0, 3, 6, 10]; // Root, minor third, diminished fifth, minor seventh
    case ChordQuality.Minor7:
      return [0, 3, 7, 10]; // Root, minor third, perfect fifth, minor seventh
    case ChordQuality.MinMaj7:
      return [0, 3, 7, 11];
    case ChordQuality.Aug:
      return [0, 4, 8]; // Root, major third, augmented fifth
    case ChordQuality.Sus:
      return [0, 5, 7]; // Root, perfect fourth, perfect fifth
    case ChordQuality.Add9:
      return [0, 2, 4, 7];
    case ChordQuality.MinAdd9:
      return [0, 2, 3, 7];
    case ChordQuality.Major7:
      return [0, 4, 7, 11]; // Root, major third, perfect fifth, major seventh
    default:
      return [0, 4, 7]; // Default to major triad
  }
}

export function midiNoteToNoteName(midiNote: number): string {
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function noteNameToMidi(noteName: string): number {
  const note = noteName.slice(0, -1);
  const octave = parseInt(noteName.slice(-1));
  const noteIndex = NOTE_NAMES.indexOf(note);
  return noteIndex + (octave + 1) * 12;
}
