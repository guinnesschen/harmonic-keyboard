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
  // Create a new voicing based on the desired voicing
  const voicing = { ...desired };

  // If no quality is selected (root === -1) or no root note, just return the basic voicing
  if (desired.root === -1) {
    return {
      ...desired,
      notes: [...desired.notes]
    };
  }

  // Initialize notes array with bass note if present
  let notes: number[] = [];
  if (desired.bass !== -1) {
    notes.push(desired.bass);
  }

  // Get intervals for the chord quality and extensions
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Generate all chord tones based on root note
  const rootNote = desired.root + 60; // Middle C = 60
  const chordTones = allIntervals.map(interval => rootNote + interval);

  // If we have a previous voicing, use voice leading
  if (previous && previous.notes.length > 0) {
    // Get previous chord tones (excluding bass and melody)
    const prevChordTones = previous.notes.filter(
      note => note !== previous.bass && note !== previous.melody
    );

    // Generate possible positions for each note (including octaves above and below)
    const possiblePositions = [
      ...chordTones,
      ...chordTones.map(note => note + 12), // Add octave above
      ...chordTones.map(note => note - 12)  // Add octave below
    ];

    // Move each previous note to the closest new position
    const ledVoices = prevChordTones.map(prevNote =>
      findClosestNote(prevNote, possiblePositions)
    );

    // Add the voice-led notes
    notes.push(...ledVoices);
  } else {
    // For new chords, spread the notes across octaves
    notes.push(...chordTones.map((note, i) => {
      // Spread notes across octaves based on position in chord
      const octaveOffset = Math.floor(i / 3) * 12;
      return note + octaveOffset;
    }));
  }

  // Add melody note if specified and not already included
  if (desired.melody !== -1 && !notes.includes(desired.melody)) {
    notes.push(desired.melody);
  }

  // Sort notes and remove duplicates
  notes = Array.from(new Set(notes)).sort((a, b) => a - b);

  return {
    ...voicing,
    notes
  };
}