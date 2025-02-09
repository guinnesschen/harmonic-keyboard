import { getChordIntervals } from "./chords";
import type { ChordVoicing } from "@shared/schema";

// Constants for voice range limits
const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6
const VOICE_COUNT = 5; // Always use 5 voices (bass + 4 upper voices)

// G3 is the threshold for different voicing styles
const OPEN_VOICING_THRESHOLD = 55; // G3 in MIDI

interface Voice {
  currentNote: number;
  isFixed?: boolean;
}

/**
 * Get all possible notes for a given pitch class within our range
 */
function getAllPossibleNotes(pitchClass: number, minNote: number, maxNote: number): number[] {
  const notes = [];
  for (let oct = Math.floor(minNote / 12); oct <= Math.floor(maxNote / 12); oct++) {
    const note = pitchClass + (oct * 12);
    if (note >= minNote && note <= maxNote) {
      notes.push(note);
    }
  }
  return notes;
}

/**
 * Find the closest note from a set of possible notes to a target note
 */
function findClosestNote(target: number, possibleNotes: number[]): number {
  return possibleNotes.reduce((closest, current) => {
    const currentDist = Math.abs(current - target);
    const closestDist = Math.abs(closest - target);
    return currentDist < closestDist ? current : closest;
  });
}

/**
 * Determine the optimal bass octave that allows room for upper voices
 */
function findOptimalBassOctave(desiredBassNote: number): number {
  // Get all possible bass notes in the valid range
  const bassClass = desiredBassNote % 12;
  const possibleBassNotes = getAllPossibleNotes(bassClass, MIN_NOTE, MAX_NOTE - 12);

  // Prefer lower octaves but ensure there's room for upper voices
  return possibleBassNotes[0];
}

/**
 * Creates a default voicing when there's no previous chord
 */
function createDefaultVoicing(bassNote: number, chordTones: Set<number>): number[] {
  const voices: number[] = [];
  const bassClass = bassNote % 12;

  // Find optimal bass octave
  const actualBassNote = findOptimalBassOctave(bassNote);
  voices.push(actualBassNote);

  const isLowBass = actualBassNote <= OPEN_VOICING_THRESHOLD;
  const availableTones = Array.from(chordTones);

  // Ensure we have enough voices to cover all chord tones
  let remainingVoices = VOICE_COUNT - 1;
  let requiredTones = new Set(chordTones);
  requiredTones.delete(bassClass); // Bass note is already covered

  if (isLowBass) {
    // For lower bass notes, create an open voicing
    // Start with a fifth above the bass if available
    const fifth = (bassClass + 7) % 12;
    if (chordTones.has(fifth)) {
      const fifthNote = findClosestNote(actualBassNote + 7, getAllPossibleNotes(fifth, actualBassNote + 5, actualBassNote + 9));
      voices.push(fifthNote);
      requiredTones.delete(fifth);
      remainingVoices--;
    }

    // Add remaining required tones plus any doubles needed to fill voices
    let lastNote = voices[voices.length - 1];
    while (remainingVoices > 0) {
      // Prioritize uncovered chord tones
      let nextTone: number;
      if (requiredTones.size > 0) {
        nextTone = Array.from(requiredTones)[0];
        requiredTones.delete(nextTone);
      } else {
        // If all tones are covered, double some notes
        nextTone = availableTones[voices.length % availableTones.length];
      }

      const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
      const nextNote = findClosestNote(lastNote + 3, possibleNotes);
      voices.push(nextNote);
      lastNote = nextNote;
      remainingVoices--;
    }
  } else {
    // For higher bass notes, use close position
    let lastNote = actualBassNote;
    while (remainingVoices > 0) {
      // Prioritize uncovered chord tones
      let nextTone: number;
      if (requiredTones.size > 0) {
        nextTone = Array.from(requiredTones)[0];
        requiredTones.delete(nextTone);
      } else {
        // If all tones are covered, double some notes
        nextTone = availableTones[voices.length % availableTones.length];
      }

      const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
      const nextNote = findClosestNote(lastNote + 3, possibleNotes);
      voices.push(nextNote);
      lastNote = nextNote;
      remainingVoices--;
    }
  }

  return voices;
}

/**
 * Find optimal voice movements ensuring all chord tones are covered
 */
function findOptimalVoiceMovements(
  previousVoices: Voice[],
  chordTones: Set<number>,
  bassNote: number
): number[] {
  // Find optimal bass octave that allows room for upper voices
  const actualBassNote = findOptimalBassOctave(bassNote);
  const bassClass = bassNote % 12;

  // Track required tones
  const requiredTones = new Set(chordTones);
  requiredTones.delete(bassClass); // Bass is already covered

  // Initialize with fixed bass note
  const newVoices: number[] = [actualBassNote];
  const remainingVoices = previousVoices.slice(1); // Skip bass voice

  // First pass: Move each voice to its closest available note
  for (const voice of remainingVoices) {
    // Prioritize uncovered chord tones
    let nextTone: number;
    let possibleNotes: number[] = [];

    if (requiredTones.size > 0) {
      // Try to move to closest uncovered tone
      for (const tone of requiredTones) {
        const notes = getAllPossibleNotes(tone, actualBassNote, MAX_NOTE)
          .filter(note => note > actualBassNote);
        if (notes.length > 0) {
          const closest = findClosestNote(voice.currentNote, notes);
          possibleNotes.push(closest);
        }
      }

      if (possibleNotes.length > 0) {
        const newNote = findClosestNote(voice.currentNote, possibleNotes);
        newVoices.push(newNote);
        requiredTones.delete(newNote % 12);
        continue;
      }
    }

    // If no uncovered tones available, move to closest chord tone
    possibleNotes = Array.from(chordTones)
      .flatMap(tone => getAllPossibleNotes(tone, actualBassNote, MAX_NOTE))
      .filter(note => note > actualBassNote);

    if (possibleNotes.length > 0) {
      const newNote = findClosestNote(voice.currentNote, possibleNotes);
      newVoices.push(newNote);
      requiredTones.delete(newNote % 12);
    }
  }

  // Second pass: If any required tones are still missing, make necessary adjustments
  if (requiredTones.size > 0) {
    for (const tone of requiredTones) {
      // Find voice that can move to cover the missing tone with minimal movement
      let minDistance = Infinity;
      let bestVoiceIndex = 1; // Start from 1 to skip bass
      let bestNote = newVoices[1];

      // Try each upper voice
      for (let i = 1; i < newVoices.length; i++) {
        const currentVoice = newVoices[i];
        const possibleNotes = getAllPossibleNotes(tone, actualBassNote, MAX_NOTE)
          .filter(note => note > actualBassNote);

        if (possibleNotes.length === 0) continue;

        const closestNote = findClosestNote(currentVoice, possibleNotes);
        const distance = Math.abs(closestNote - currentVoice);

        if (distance < minDistance) {
          minDistance = distance;
          bestVoiceIndex = i;
          bestNote = closestNote;
        }
      }

      if (minDistance !== Infinity) {
        newVoices[bestVoiceIndex] = bestNote;
      }
    }
  }

  // Ensure we have enough voices
  while (newVoices.length < VOICE_COUNT) {
    const lastNote = newVoices[newVoices.length - 1];
    const availableTones = Array.from(chordTones);
    const nextTone = availableTones[newVoices.length % availableTones.length];
    const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
    const nextNote = findClosestNote(lastNote + 3, possibleNotes);
    newVoices.push(nextNote);
  }

  return newVoices;
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  // Get intervals for the chord quality
  const intervals = getChordIntervals(desired.quality);

  // Calculate all required chord tones as pitch classes (0-11)
  const chordTones = new Set(intervals.map(interval => 
    (desired.root + interval) % 12
  ));

  let voices: number[];

  if (!previous?.notes || previous.notes.length === 0) {
    // Create default voicing if no previous chord
    voices = createDefaultVoicing(desired.bass, chordTones);
  } else {
    // Convert previous notes to Voice objects
    const previousVoices = previous.notes.map(note => ({
      currentNote: note
    }));

    // Find optimal voice movements
    voices = findOptimalVoiceMovements(previousVoices, chordTones, desired.bass);
  }

  return {
    ...desired,
    notes: voices
  };
}