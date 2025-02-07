import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals, getExtensionIntervals } from "./chords";

function findClosestNote(target: number, possibilities: number[]): number {
  return possibilities.reduce((closest, current) => {
    return Math.abs(current - target) < Math.abs(closest - target) ? current : closest;
  });
}

function generateDefaultVoicing(rootNote: number, intervals: number[]): number[] {
  // For the first chord, generate a comfortable voicing in the middle register
  return intervals.map(interval => rootNote + interval);
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  // Create a new voicing based on the desired voicing
  const voicing = { ...desired };
  let notes: number[] = [];

  // If no quality is selected (root === -1) or no root note, just return the explicitly pressed notes
  if (desired.root === -1) {
    // Add bass note if present
    if (desired.bass !== -1) {
      notes.push(desired.bass);
    }
    // Add melody note if present
    if (desired.melody !== -1) {
      notes.push(desired.melody);
    }
    return {
      ...desired,
      notes
    };
  }

  // Get intervals for the chord quality and extensions
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Calculate the root note (middle C = 60)
  const rootNote = desired.root + 60;

  // Start with the bass note if present
  if (desired.bass !== -1) {
    notes.push(desired.bass);
  }

  // Handle chord tones differently based on whether we have a previous voicing
  if (!previous) {
    // For the first chord, generate a simple voicing in the middle register
    const defaultVoicing = generateDefaultVoicing(rootNote, allIntervals);
    notes.push(...defaultVoicing);
  } else {
    // For subsequent chords, use voice leading
    const chordTones = [
      ...allIntervals.map(interval => rootNote + interval - 12), // Lower octave
      ...allIntervals.map(interval => rootNote + interval),      // Middle octave
      ...allIntervals.map(interval => rootNote + interval + 12)  // Upper octave
    ];

    const prevChordTones = previous.notes.filter(
      note => note !== previous.bass && note !== previous.melody
    );

    // Move each previous note to the closest new chord tone
    const ledVoices = prevChordTones.map(prevNote =>
      findClosestNote(prevNote, chordTones)
    );

    notes.push(...ledVoices);
  }

  // Add melody note if specified and not already included
  if (desired.melody !== -1 && !notes.includes(desired.melody)) {
    notes.push(desired.melody);
  }

  // Remove duplicates and sort from low to high
  notes = Array.from(new Set(notes)).sort((a, b) => a - b);

  return {
    ...voicing,
    notes
  };
}