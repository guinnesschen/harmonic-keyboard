import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals } from "./chords";

function generateBasicChord(rootNote: number, intervals: number[]): number[] {
  const baseOctave = 60; // Middle C
  return intervals.map(interval => baseOctave + rootNote + interval);
}

function rotateArray<T>(arr: T[], positions: number): T[] {
  const pos = positions % arr.length;
  return [...arr.slice(pos), ...arr.slice(0, pos)];
}

function isCompleteChord(voicing: ChordVoicing): boolean {
  return voicing.root !== -1 && voicing.quality !== undefined;
}

function getBassNoteForPosition(rootNote: number, intervals: number[], position: string): number {
  // For root position, bass note is the root note
  if (position === "root") return rootNote;

  // Get the interval for the desired bass note based on position
  const index = position === "first" ? 1 : position === "second" ? 2 : 3;
  return (rootNote + intervals[index % intervals.length]) % 12;
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  const voicing = { ...desired };
  let notes: number[] = [];

  // Get intervals for the chord quality
  const intervals = getChordIntervals(desired.quality);

  // Calculate the bass note based on position
  const bassNote = getBassNoteForPosition(desired.root, intervals, desired.position);
  voicing.bass = bassNote + 48; // Put in bass octave
  notes.push(voicing.bass);

  // Generate basic chord tones starting from root
  let chordTones = generateBasicChord(desired.root, intervals);

  // Apply the chord position by rotating the intervals
  let rotationAmount = 0;
  switch (desired.position) {
    case "first":
      rotationAmount = 1;
      break;
    case "second":
      rotationAmount = 2;
      break;
    case "thirdseventh":
      rotationAmount = 3;
      break;
    default: // root position
      rotationAmount = 0;
  }
  chordTones = rotateArray(chordTones, rotationAmount);

  // Apply voice leading logic if we have a previous chord
  if (previous && previous.notes.length > 0) {
    const isCurrentComplete = isCompleteChord(desired);
    const wasPreviousComplete = isCompleteChord(previous);

    if (isCurrentComplete && wasPreviousComplete) {
      // Full voice leading between complete chords
      const prevChordTones = previous.notes.filter(
        note => note !== previous.bass
      );

      chordTones = chordTones.map(note => {
        const closestPrevNote = prevChordTones.reduce((closest, prevNote) => {
          return Math.abs(note - prevNote) < Math.abs(note - closest) ? prevNote : closest;
        }, prevChordTones[0]);

        // Try to keep the note within an octave of the closest previous note
        const octaveAdjustment = Math.round((closestPrevNote - note) / 12) * 12;
        if (Math.abs(octaveAdjustment) <= 12) {
          return note + octaveAdjustment;
        }
        return note;
      });
    }
  }

  // Add the chord tones
  notes.push(...chordTones);

  // Sort notes but ensure bass note stays at the bottom
  if (voicing.bass !== -1) {
    notes = notes.filter(note => note !== voicing.bass);
    notes.sort((a, b) => a - b);
    notes.unshift(voicing.bass);
  } else {
    notes.sort((a, b) => a - b);
  }

  // Remove duplicates while maintaining order
  notes = Array.from(new Set(notes));

  return {
    ...voicing,
    notes
  };
}