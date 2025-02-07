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
      notes: [...desired.notes] // Return a copy of the notes array
    };
  }

  // Generate all possible notes for this chord based on intervals
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Calculate base note (middle C = 60) and generate all chord tones
  const baseNote = desired.root + 60;
  let chordTones = allIntervals.map(interval => baseNote + interval);

  // For the initial chord, spread the notes across octaves
  if (!previous) {
    chordTones = chordTones.map((note, i) => {
      const octaveOffset = Math.floor(i / 3) * 12; // Group notes in threes across octaves
      return note + octaveOffset;
    });
  } else {
    // Voice leading - move each note to the closest available chord tone
    chordTones = previous.notes.map(prevNote => {
      const possibleNotes = [...chordTones];
      // Add octaves above and below for more voice leading options
      possibleNotes.push(...chordTones.map(n => n + 12));
      possibleNotes.push(...chordTones.map(n => n - 12));
      return findClosestNote(prevNote, possibleNotes);
    });
  }

  // Start with an empty notes array
  let voicingNotes: number[] = [];

  // Always include the bass note first if specified
  if (desired.bass !== -1) {
    voicingNotes.push(desired.bass);
  }

  // Add chord tones in the middle register
  voicingNotes.push(...chordTones);

  // Add melody note if specified
  if (desired.melody !== -1 && !voicingNotes.includes(desired.melody)) {
    voicingNotes.push(desired.melody);
  }

  // Remove any duplicate notes and sort
  voicingNotes = [...new Set(voicingNotes)].sort((a, b) => a - b);

  return {
    ...desired,
    notes: voicingNotes
  };
}