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

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  const voicing = { ...desired };
  let notes: number[] = [];

  // If no quality is selected (root === -1) or no root note, just play the bass note
  if (desired.root === -1) {
    if (desired.bass !== -1) notes.push(desired.bass);
    return { ...desired, notes };
  }

  // Get intervals for the chord quality
  const intervals = getChordIntervals(desired.quality);

  // Always add the bass note first if specified
  if (desired.bass !== -1) {
    notes.push(desired.bass);
  }

  // Generate basic chord tones
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

  // Apply voice leading logic based on chord completeness
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
    } else if (!isCurrentComplete && wasPreviousComplete) {
      // During transition, try to maintain previous chord tones that don't conflict
      const prevNonBassNotes = previous.notes.filter(note => note !== previous.bass);
      chordTones = prevNonBassNotes;
    }
  }

  // Add the chord tones
  notes.push(...chordTones);

  // Sort notes but ensure bass note stays at the bottom
  if (desired.bass !== -1) {
    notes = notes.filter(note => note !== desired.bass);
    notes.sort((a, b) => a - b);
    notes.unshift(desired.bass);
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