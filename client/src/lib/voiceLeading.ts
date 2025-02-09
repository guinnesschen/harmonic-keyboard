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
function findClosestNote(target: number, possibleNotes: number[]): number | null {
  if (possibleNotes.length === 0) return null;

  return possibleNotes.reduce((closest, current) => {
    const currentDist = Math.abs(current - target);
    const closestDist = Math.abs(closest - target);
    return currentDist < closestDist ? current : closest;
  }, possibleNotes[0]);
}

/**
 * Determine the optimal bass octave that allows room for upper voices
 */
function findOptimalBassOctave(desiredBassNote: number): number {
  // Get all possible bass notes in the valid range
  const bassClass = desiredBassNote % 12;
  const possibleBassNotes = getAllPossibleNotes(bassClass, MIN_NOTE, MAX_NOTE - 12);

  if (possibleBassNotes.length === 0) {
    return MIN_NOTE + bassClass; // Fallback to lowest possible octave
  }

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

  // Convert chord tones to array and ensure we have at least one tone
  const availableTones = Array.from(chordTones);
  if (availableTones.length === 0) return [actualBassNote];

  // Ensure we have enough voices to cover all chord tones
  let remainingVoices = VOICE_COUNT - 1;
  const requiredTones = new Set(chordTones);
  requiredTones.delete(bassClass); // Bass note is already covered

  if (actualBassNote <= OPEN_VOICING_THRESHOLD) {
    // For lower bass notes, create an open voicing
    const fifth = (bassClass + 7) % 12;
    if (chordTones.has(fifth)) {
      const fifthNotes = getAllPossibleNotes(fifth, actualBassNote + 5, actualBassNote + 9);
      if (fifthNotes.length > 0) {
        const fifthNote = findClosestNote(actualBassNote + 7, fifthNotes);
        if (fifthNote !== null) {
          voices.push(fifthNote);
          requiredTones.delete(fifth);
          remainingVoices--;
        }
      }
    }

    // Add remaining required tones
    let lastNote = voices[voices.length - 1];
    while (remainingVoices > 0) {
      let nextTone: number;
      if (requiredTones.size > 0) {
        nextTone = Array.from(requiredTones)[0];
        requiredTones.delete(nextTone);
      } else {
        nextTone = availableTones[voices.length % availableTones.length];
      }

      const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
      const nextNote = findClosestNote(lastNote + 3, possibleNotes);
      if (nextNote !== null) {
        voices.push(nextNote);
        lastNote = nextNote;
      }
      remainingVoices--;
    }
  } else {
    // For higher bass notes, use close position
    let lastNote = actualBassNote;
    while (remainingVoices > 0) {
      let nextTone: number;
      if (requiredTones.size > 0) {
        nextTone = Array.from(requiredTones)[0];
        requiredTones.delete(nextTone);
      } else {
        nextTone = availableTones[voices.length % availableTones.length];
      }

      const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
      const nextNote = findClosestNote(lastNote + 3, possibleNotes);
      if (nextNote !== null) {
        voices.push(nextNote);
        lastNote = nextNote;
      }
      remainingVoices--;
    }
  }

  // Ensure we have exactly VOICE_COUNT voices
  while (voices.length < VOICE_COUNT && voices.length > 0) {
    const lastNote = voices[voices.length - 1];
    const nextTone = availableTones[voices.length % availableTones.length];
    const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
    const nextNote = findClosestNote(lastNote + 3, possibleNotes);
    if (nextNote !== null) {
      voices.push(nextNote);
    } else {
      voices.push(lastNote + 4); // Fallback: move up a major third if no valid note found
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
  const actualBassNote = findOptimalBassOctave(bassNote);
  const bassClass = bassNote % 12;
  const requiredTones = new Set(chordTones);
  requiredTones.delete(bassClass);

  // Initialize with fixed bass note
  const newVoices: number[] = [actualBassNote];
  const remainingVoices = previousVoices.slice(1);

  // First pass: Try to move each voice to its closest available note
  for (const voice of remainingVoices) {
    let moved = false;

    // First try uncovered tones
    if (requiredTones.size > 0) {
      const possibleNotes: number[] = [];
      for (const tone of requiredTones) {
        const notes = getAllPossibleNotes(tone, actualBassNote, MAX_NOTE)
          .filter(note => note > actualBassNote);
        if (notes.length > 0) {
          const closest = findClosestNote(voice.currentNote, notes);
          if (closest !== null) {
            possibleNotes.push(closest);
          }
        }
      }

      if (possibleNotes.length > 0) {
        const newNote = findClosestNote(voice.currentNote, possibleNotes);
        if (newNote !== null) {
          newVoices.push(newNote);
          requiredTones.delete(newNote % 12);
          moved = true;
        }
      }
    }

    // If we couldn't move to an uncovered tone, move to any chord tone
    if (!moved) {
      const possibleNotes = Array.from(chordTones)
        .flatMap(tone => getAllPossibleNotes(tone, actualBassNote, MAX_NOTE))
        .filter(note => note > actualBassNote);

      if (possibleNotes.length > 0) {
        const newNote = findClosestNote(voice.currentNote, possibleNotes);
        if (newNote !== null) {
          newVoices.push(newNote);
          requiredTones.delete(newNote % 12);
        }
      }
    }
  }

  // Second pass: Ensure all required tones are covered
  if (requiredTones.size > 0) {
    for (const tone of requiredTones) {
      let minDistance = Infinity;
      let bestVoiceIndex = 1;
      let bestNote = newVoices[1];

      for (let i = 1; i < newVoices.length; i++) {
        const currentVoice = newVoices[i];
        const possibleNotes = getAllPossibleNotes(tone, actualBassNote, MAX_NOTE)
          .filter(note => note > actualBassNote);

        if (possibleNotes.length > 0) {
          const closestNote = findClosestNote(currentVoice, possibleNotes);
          if (closestNote !== null) {
            const distance = Math.abs(closestNote - currentVoice);
            if (distance < minDistance) {
              minDistance = distance;
              bestVoiceIndex = i;
              bestNote = closestNote;
            }
          }
        }
      }

      if (minDistance !== Infinity) {
        newVoices[bestVoiceIndex] = bestNote;
      }
    }
  }

  // Fill remaining voices if needed
  while (newVoices.length < VOICE_COUNT && newVoices.length > 0) {
    const lastNote = newVoices[newVoices.length - 1];
    const availableTones = Array.from(chordTones);
    const nextTone = availableTones[newVoices.length % availableTones.length];
    const possibleNotes = getAllPossibleNotes(nextTone, lastNote, lastNote + 6);
    const nextNote = findClosestNote(lastNote + 3, possibleNotes);
    if (nextNote !== null) {
      newVoices.push(nextNote);
    } else {
      newVoices.push(lastNote + 4); // Fallback
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
    voices = createDefaultVoicing(desired.bass, chordTones);
  } else {
    const previousVoices = previous.notes.map(note => ({
      currentNote: note
    }));
    voices = findOptimalVoiceMovements(previousVoices, chordTones, desired.bass);
  }

  // Ensure we have a valid voicing
  if (voices.length === 0) {
    voices = [desired.bass]; // Fallback to just the bass note if something went wrong
  }

  return {
    ...desired,
    notes: voices
  };
}