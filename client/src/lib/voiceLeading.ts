import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals } from "./chords";

function rotateArray<T>(arr: T[], positions: number): T[] {
  const pos = positions % arr.length;
  return [...arr.slice(pos), ...arr.slice(0, pos)];
}

// Constants for voice range limits
const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6

// Calculate the total voice movement cost between two voicings
function calculateVoiceMovementCost(voices1: number[], voices2: number[]): number {
  // Ensure both arrays have the same length
  if (voices1.length !== voices2.length) return Infinity;

  let minCost = Infinity;
  const n = voices1.length;

  // Try all possible permutations of the second voicing
  // We'll do this efficiently by rotating the array
  for (let i = 0; i < n; i++) {
    let cost = 0;
    const rotatedVoices = rotateArray(voices2.slice(1), i);

    // Bass note is always paired with bass note
    cost += Math.abs(voices1[0] - voices2[0]);

    // Calculate cost for upper voices
    for (let j = 1; j < n; j++) {
      cost += Math.abs(voices1[j] - rotatedVoices[j - 1]);
    }

    minCost = Math.min(minCost, cost);
  }

  return minCost;
}

// Find the closest octave of a note within the valid range
function findClosestOctave(note: number, target: number): number {
  const baseNote = note % 12;
  let bestNote = note;
  let minDistance = Math.abs(note - target);

  // Try different octaves
  for (let octave = Math.floor(MIN_NOTE / 12); octave <= Math.floor(MAX_NOTE / 12); octave++) {
    const candidate = baseNote + octave * 12;
    if (candidate >= MIN_NOTE && candidate <= MAX_NOTE) {
      const distance = Math.abs(candidate - target);
      if (distance < minDistance) {
        minDistance = distance;
        bestNote = candidate;
      }
    }
  }

  return bestNote;
}

// Generate default voicing based on bass note position
function generateDefaultVoicing(bassNote: number): number[] {
  const isLowerHalf = bassNote < 60; // Middle C (60) is the dividing point
  const root = bassNote % 12;
  const fifth = (root + 7) % 12;
  const third = (root + 4) % 12;

  // Convert pitch classes to actual MIDI notes
  const upperRoot = findClosestOctave(root, bassNote + 12);
  const upperFifth = findClosestOctave(fifth, upperRoot + 7);
  const upperThird = findClosestOctave(third, upperRoot + 4);
  const topFifth = findClosestOctave(fifth, upperFifth + 5);

  if (isLowerHalf) {
    // Lower keyboard pattern: [root, root, fifth, third, fifth]
    return [
      bassNote,
      upperRoot,
      upperFifth,
      upperThird,
      topFifth
    ].sort((a, b) => a - b);
  } else {
    // Upper keyboard pattern: [root, fifth, root, third, fifth]
    return [
      bassNote,
      findClosestOctave(fifth, bassNote + 7),
      upperRoot,
      upperThird,
      topFifth
    ].sort((a, b) => a - b);
  }
}

// Generate all possible 5-note voicings for a given set of required notes
function generatePossibleVoicings(
  requiredPitchClasses: Set<number>,
  bassNote: number
): number[][] {
  const voicings: number[][] = [];
  const upperVoiceRange = Array.from(
    { length: MAX_NOTE - MIN_NOTE + 1 },
    (_, i) => MIN_NOTE + i
  ).filter(note => note > bassNote);

  // Add the default voicing first
  voicings.push(generateDefaultVoicing(bassNote));

  // Convert pitch classes to all possible octaves within range
  const possibleNotes = Array.from(requiredPitchClasses).flatMap(pc =>
    upperVoiceRange.filter(note => note % 12 === pc)
  );

  // Generate all possible 4-note combinations for upper voices
  function generateCombinations(
    notes: number[],
    count: number,
    start: number,
    current: number[]
  ) {
    if (current.length === count) {
      voicings.push([bassNote, ...current]);
      return;
    }

    for (let i = start; i < notes.length; i++) {
      // Skip if the note is too close to the previous note
      if (current.length > 0 && notes[i] - current[current.length - 1] < 2) {
        continue;
      }
      generateCombinations(notes, count, i + 1, [...current, notes[i]]);
    }
  }

  generateCombinations(possibleNotes, 4, 0, []);
  return voicings;
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  // Get intervals for the chord quality
  const intervals = getChordIntervals(desired.quality);

  // Calculate the bass note based on position
  const bassNote = desired.bass;

  // Generate basic chord tones starting from root
  const requiredPitchClasses = new Set(
    intervals.map(interval => (desired.root + interval) % 12)
  );

  // Generate all possible 5-note voicings
  const possibleVoicings = generatePossibleVoicings(requiredPitchClasses, bassNote);

  if (!previous) {
    // If no previous voicing, use the default voicing (first in the array)
    return {
      ...desired,
      notes: possibleVoicings[0]
    };
  }

  // Find the voicing with minimum movement from previous
  let bestVoicing = possibleVoicings[0];
  let minMovement = Infinity;

  possibleVoicings.forEach(voicing => {
    const movement = calculateVoiceMovementCost(previous.notes, voicing);
    if (movement < minMovement) {
      minMovement = movement;
      bestVoicing = voicing;
    }
  });

  return {
    ...desired,
    notes: bestVoicing
  };
}