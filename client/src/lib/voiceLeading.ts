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
  // If no quality is selected (root === -1), just return the explicitly pressed notes
  if (desired.root === -1) {
    return {
      ...desired,
      notes: [...desired.notes]
    };
  }

  // Generate intervals based on the chord quality
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Start with the bass note
  let voicingNotes: number[] = [];
  if (desired.bass !== -1) {
    voicingNotes.push(desired.bass);
  }

  // Generate chord tones in the middle register
  const baseNote = desired.root + 60; // Middle C = 60
  const chordTones = allIntervals.map(interval => baseNote + interval);

  if (!previous) {
    // For new chords, spread the notes across a comfortable range
    voicingNotes.push(...chordTones);
  } else {
    // Voice leading - move each chord tone to the nearest available position
    const prevChordTones = previous.notes.filter(note => note !== previous.bass && note !== previous.melody);
    const voicingOptions = [
      ...chordTones,
      ...chordTones.map(note => note + 12), // Add octave above
      ...chordTones.map(note => note - 12)  // Add octave below
    ];

    const ledVoices = prevChordTones.map(prevNote => 
      findClosestNote(prevNote, voicingOptions)
    );
    voicingNotes.push(...ledVoices);
  }

  // Add melody note if specified
  if (desired.melody !== -1 && !voicingNotes.includes(desired.melody)) {
    voicingNotes.push(desired.melody);
  }

  // Remove duplicates and sort
  voicingNotes = Array.from(new Set(voicingNotes)).sort((a, b) => a - b);

  return {
    ...desired,
    notes: voicingNotes
  };
}