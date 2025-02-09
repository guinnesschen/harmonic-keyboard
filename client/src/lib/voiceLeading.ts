import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals } from "./chords";

// Constants for voice range limits
const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6
const VOICE_COUNT = 5; // Always use 5 voices (bass + 4 upper voices)

// G3 is the threshold for different voicing styles
const OPEN_VOICING_THRESHOLD = 55; // G3 in MIDI

interface Voice {
  currentNote: number;
  isFixed?: boolean; // Used for bass note
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
 * Creates a default voicing when there's no previous chord
 */
function createDefaultVoicing(bassNote: number, chordTones: Set<number>): number[] {
  const voices: number[] = [bassNote];
  const isLowBass = bassNote <= OPEN_VOICING_THRESHOLD;

  // Convert chord tones to array of pitch classes (0-11)
  const availableTones = Array.from(chordTones);

  if (isLowBass) {
    // For lower bass notes, create an open voicing
    // Start with a fifth above the bass
    const fifth = (bassNote % 12 + 7) % 12;
    const fifthNote = findClosestNote(bassNote + 7, getAllPossibleNotes(fifth, bassNote + 5, bassNote + 9));
    voices.push(fifthNote);

    // Add remaining voices in close position above the fifth
    let lastNote = fifthNote;
    for (let i = 0; i < 3; i++) {
      const nextTone = availableTones[i % availableTones.length];
      const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
      const nextNote = findClosestNote(lastNote + 3, possibleNotes);
      voices.push(nextNote);
      lastNote = nextNote;
    }
  } else {
    // For higher bass notes, create a close position voicing
    let lastNote = bassNote;
    for (let i = 0; i < 4; i++) {
      const nextTone = availableTones[i % availableTones.length];
      const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
      const nextNote = findClosestNote(lastNote + 3, possibleNotes);
      voices.push(nextNote);
      lastNote = nextNote;
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
  // Initialize with bass note
  const newVoices: number[] = [bassNote];
  const remainingVoices = previousVoices.slice(1); // Skip bass voice
  const coveredTones = new Set([bassNote % 12]);

  // First pass: Move each voice to its closest available note
  for (const voice of remainingVoices) {
    // Get all possible notes for remaining chord tones
    const availableTones = Array.from(chordTones)
      .filter(tone => !coveredTones.has(tone))
      .flatMap(tone => getAllPossibleNotes(tone, voice.currentNote - 6, voice.currentNote + 6));

    // If no uncovered tones, allow moving to any chord tone
    const possibleNotes = availableTones.length > 0 ? availableTones :
      Array.from(chordTones).flatMap(tone => 
        getAllPossibleNotes(tone, voice.currentNote - 6, voice.currentNote + 6)
      );

    // Find closest available note
    const newNote = findClosestNote(voice.currentNote, possibleNotes);
    newVoices.push(newNote);
    coveredTones.add(newNote % 12);
  }

  // Second pass: If any chord tones are missing, adjust voices to cover them
  const missingTones = Array.from(chordTones).filter(tone => !coveredTones.has(tone));

  if (missingTones.length > 0) {
    // Find the voice that requires minimal movement to cover missing tone
    for (const tone of missingTones) {
      let minDistance = Infinity;
      let bestVoiceIndex = 1; // Start from 1 to skip bass
      let bestNote = newVoices[1];

      for (let i = 1; i < newVoices.length; i++) {
        const currentVoice = newVoices[i];
        const possibleNotes = getAllPossibleNotes(tone, MIN_NOTE, MAX_NOTE);
        const closestNote = findClosestNote(currentVoice, possibleNotes);
        const distance = Math.abs(closestNote - currentVoice);

        if (distance < minDistance) {
          minDistance = distance;
          bestVoiceIndex = i;
          bestNote = closestNote;
        }
      }

      newVoices[bestVoiceIndex] = bestNote;
    }
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