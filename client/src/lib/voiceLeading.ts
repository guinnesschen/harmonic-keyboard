import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals, getExtensionIntervals } from "./chords";

function findClosestNote(target: number, possibilities: number[]): number {
  return possibilities.reduce((closest, current) => {
    return Math.abs(current - target) < Math.abs(closest - target) ? current : closest;
  });
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  // Start with a copy of the desired voicing
  const voicing = { ...desired };
  let notes: number[] = [];

  // If no quality is selected (root === -1), just return the explicitly pressed notes
  if (desired.root === -1) {
    return {
      ...desired,
      notes: [...desired.notes]
    };
  }

  // Always start with the bass note
  if (desired.bass !== -1) {
    notes.push(desired.bass);
  }

  // Generate the chord tones based on quality
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Calculate all chord tones in the middle register
  const middleC = 60;
  const rootPitch = desired.root + middleC;
  let chordTones = allIntervals.map(interval => rootPitch + interval);

  // If we have a previous voicing, use voice leading
  if (previous && previous.notes.length > 0) {
    const prevNotes = previous.notes.filter(n => n !== previous.bass && n !== previous.melody);
    const possibleNotes = [
      ...chordTones,
      ...chordTones.map(n => n + 12), // Add octave above
      ...chordTones.map(n => n - 12)  // Add octave below
    ];

    // Move each previous note to the closest new chord tone
    chordTones = prevNotes.map(prevNote => 
      findClosestNote(prevNote, possibleNotes)
    );
  }

  // Add all chord tones to our notes array
  notes.push(...chordTones);

  // Add melody note if specified
  if (desired.melody !== -1 && !notes.includes(desired.melody)) {
    notes.push(desired.melody);
  }

  // Remove duplicates and sort
  notes = Array.from(new Set(notes)).sort((a, b) => a - b);

  return {
    ...voicing,
    notes
  };
}