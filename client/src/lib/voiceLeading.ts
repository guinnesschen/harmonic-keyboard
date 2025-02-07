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

  // Generate the basic chord tones
  let chordTones = generateBasicChord(desired.root, allIntervals);

  // Always add the bass note first if specified
  if (desired.bass !== -1) {
    notes.push(desired.bass);
  }

  // Apply voice leading to chord tones if we have a previous chord
  if (previous && previous.notes.length > 0) {
    // Get previous chord tones excluding bass and melody
    const prevChordTones = previous.notes.filter(
      note => note !== previous.bass && note !== previous.melody
    );

    // Adjust each chord tone to be closer to the previous chord's notes
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

  // Add the voice-led chord tones
  notes.push(...chordTones);

  // Add melody note if specified and not already included
  if (desired.melody !== -1 && !notes.includes(desired.melody)) {
    notes.push(desired.melody);
  }

  // Sort notes but ensure bass note stays at the bottom
  if (desired.bass !== -1) {
    // Remove bass note before sorting other notes
    notes = notes.filter(note => note !== desired.bass);
    notes.sort((a, b) => a - b);
    // Re-add bass note at the beginning
    notes.unshift(desired.bass);
  } else {
    notes.sort((a, b) => a - b);
  }

  return {
    ...voicing,
    notes
  };
}