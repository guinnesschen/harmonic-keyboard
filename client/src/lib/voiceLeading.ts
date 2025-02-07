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
  // If no quality is selected (root === -1), just return the basic voicing
  // with the explicitly pressed notes
  if (desired.root === -1) {
    return {
      ...desired,
      notes: [...desired.notes] // Return a copy of the notes array
    };
  }

  // Generate full chord voicing since we have a quality selected
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Generate all possible notes for this chord
  const baseNote = desired.root + 60; // Middle C = 60
  const possibleNotes = allIntervals.map(interval => baseNote + interval);

  let voicingNotes: number[];

  if (!previous) {
    // Initial voicing - spread notes out evenly
    voicingNotes = possibleNotes.map((note, i) => {
      // Spread across octaves based on position in the chord
      return note + Math.floor(i / 2) * 12;
    });
  } else {
    // Voice leading - move each note to closest available note
    voicingNotes = previous.notes.map(prevNote => 
      findClosestNote(prevNote, possibleNotes)
    );
  }

  // Ensure bass note is included if specified
  if (desired.bass !== -1) {
    voicingNotes = voicingNotes.filter(note => note !== desired.bass);
    voicingNotes = [desired.bass, ...voicingNotes];
  }

  // Ensure melody note is included if specified
  if (desired.melody !== -1) {
    voicingNotes = voicingNotes.filter(note => note !== desired.melody);
    voicingNotes.push(desired.melody);
  }

  // Sort notes from low to high
  voicingNotes.sort((a, b) => a - b);

  return {
    ...desired,
    notes: voicingNotes
  };
}