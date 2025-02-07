import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals, getExtensionIntervals } from "./chords";

function generateBasicChord(rootNote: number, intervals: number[]): number[] {
  // Generate the basic chord in the middle register (around middle C)
  const baseOctave = 60; // Middle C
  return intervals.map(interval => baseOctave + rootNote + interval);
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  const voicing = { ...desired };
  let notes: number[] = [];

  // If no quality is selected or no root note, just return single notes
  if (desired.root === -1) {
    if (desired.bass !== -1) notes.push(desired.bass);
    if (desired.melody !== -1) notes.push(desired.melody);
    return { ...desired, notes };
  }

  // Get intervals for the chord quality and extensions
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Always start by generating a basic chord
  const basicChord = generateBasicChord(desired.root, allIntervals);

  // Add the bass note if specified
  if (desired.bass !== -1) {
    notes.push(desired.bass);
  }

  // Add the chord tones
  notes.push(...basicChord);

  // Add melody note if specified
  if (desired.melody !== -1 && !notes.includes(desired.melody)) {
    notes.push(desired.melody);
  }

  // Sort notes from low to high and remove duplicates
  notes = Array.from(new Set(notes)).sort((a, b) => a - b);

  // Apply voice leading only if we have a previous chord
  if (previous && previous.notes.length > 0) {
    const prevNotes = previous.notes.filter(
      note => note !== previous.bass && note !== previous.melody
    );

    // Adjust each note to be closer to the previous chord's notes
    notes = notes.map(note => {
      const closestPrevNote = prevNotes.reduce((closest, prevNote) => {
        return Math.abs(note - prevNote) < Math.abs(note - closest) ? prevNote : closest;
      }, prevNotes[0]);

      // Try to keep the note within an octave of the closest previous note
      const octaveAdjustment = Math.round((closestPrevNote - note) / 12) * 12;
      if (Math.abs(octaveAdjustment) <= 12) {
        return note + octaveAdjustment;
      }
      return note;
    });

    // Sort again after voice leading adjustments
    notes = Array.from(new Set(notes)).sort((a, b) => a - b);
  }

  return {
    ...voicing,
    notes
  };
}