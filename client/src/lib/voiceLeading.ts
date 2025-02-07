import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals, getExtensionIntervals } from "./chords";

function generateBasicChord(rootNote: number, intervals: number[]): number[] {
  const baseOctave = 60; // Middle C
  return intervals.map(interval => baseOctave + rootNote + interval);
}

function isCompleteChord(voicing: ChordVoicing): boolean {
  // A complete chord needs at least:
  // 1. A root note (from bass)
  // 2. A quality selection
  return voicing.root !== -1 && voicing.quality !== undefined;
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  const voicing = { ...desired };
  let notes: number[] = [];

  // Handle single note cases (no chord quality selected)
  if (desired.root === -1) {
    if (desired.bass !== -1) notes.push(desired.bass);
    if (desired.melody !== -1) notes.push(desired.melody);
    return { ...desired, notes };
  }

  // Get intervals for the chord quality and extensions
  const baseIntervals = getChordIntervals(desired.quality);
  const extensionIntervals = getExtensionIntervals(desired.extension);
  const allIntervals = [...baseIntervals, ...extensionIntervals];

  // Always add the bass note first if specified
  if (desired.bass !== -1) {
    notes.push(desired.bass);
  }

  // Generate basic chord tones
  let chordTones = generateBasicChord(desired.root, allIntervals);

  // Apply voice leading logic based on chord completeness
  if (previous && previous.notes.length > 0) {
    const isCurrentComplete = isCompleteChord(desired);
    const wasPreviousComplete = isCompleteChord(previous);

    if (isCurrentComplete && wasPreviousComplete) {
      // Full voice leading between complete chords
      const prevChordTones = previous.notes.filter(
        note => note !== previous.bass && note !== previous.melody
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

  // Add melody note if specified and not already included
  if (desired.melody !== -1 && !notes.includes(desired.melody)) {
    notes.push(desired.melody);
  }

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