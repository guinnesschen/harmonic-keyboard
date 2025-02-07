import { ChordQuality, ChordExtension } from "@shared/schema";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getChordIntervals(quality: ChordQuality): number[] {
  switch (quality) {
    case ChordQuality.Major:
      return [0, 4, 7];
    case ChordQuality.Minor:
      return [0, 3, 7];
    case ChordQuality.Dominant7:
      return [0, 4, 7, 10];
    case ChordQuality.Diminished:
      return [0, 3, 6];
    case ChordQuality.Augmented:
      return [0, 4, 8];
    case ChordQuality.Minor7:
      return [0, 3, 7, 10];
    case ChordQuality.Major7:
      return [0, 4, 7, 11];
    default:
      return [0, 4, 7];
  }
}

export function getExtensionIntervals(extension: ChordExtension): number[] {
  switch (extension) {
    case ChordExtension.Add9:
      return [14]; // +2 octaves + major second
    case ChordExtension.Add11:
      return [17]; // +2 octaves + perfect fourth
    case ChordExtension.Add13:
      return [21]; // +2 octaves + major sixth
    case ChordExtension.Sharp11:
      return [18]; // +2 octaves + augmented fourth
    default:
      return [];
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
