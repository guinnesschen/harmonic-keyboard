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
  // If we don't have an explicit quality selected, just return the basic voicing
  // with only the specified bass and/or melody notes
  const hasQuality = desired.quality !== undefined && desired.root !== -1;
  if (!hasQuality) {
    return {
      ...desired,
      notes: desired.notes.sort((a, b) => a - b) // Ensure notes are sorted
    };
  }

  // If we have a quality selected, generate the full chord voicing
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Generate all possible notes for this chord
  const possibleNotes = allIntervals.map(interval => {
    const baseNote = desired.root + 60; // Middle C = 60
    return baseNote + interval;
  });

  let voicingNotes: number[];

  if (!previous) {
    // Initial voicing - spread notes out evenly
    voicingNotes = possibleNotes.map((note, i) => note + Math.floor(i / 2) * 12);
  } else {
    // Voice leading - move each note to closest available note
    voicingNotes = previous.notes.map(prevNote => 
      findClosestNote(prevNote, possibleNotes)
    );
  }

  // Ensure bass and melody notes are correct
  voicingNotes = voicingNotes.filter(note => note !== desired.bass && note !== desired.melody);
  voicingNotes = [desired.bass, ...voicingNotes, desired.melody];

  // Sort notes from low to high
  voicingNotes.sort((a, b) => a - b);

  return {
    ...desired,
    notes: voicingNotes
  };
}