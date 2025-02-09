import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals } from "./chords";

// Constants for voice range limits
const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6
const VOICE_COUNT = 5; // Always use 5 voices (bass + 4 upper voices)

/**
 * Calculates the total voice movement cost between two voicings.
 * A deterministic measure of total voice movement.
 */
function calculateVoiceMovementCost(
  oldVoices: number[],
  newVoices: number[],
): number {
  // Both arrays must be sorted to ensure deterministic comparison
  const sortedOld = [...oldVoices].sort((a, b) => a - b);
  const sortedNew = [...newVoices].sort((a, b) => a - b);

  return sortedOld.reduce((sum, oldNote, index) => {
    return sum + Math.abs(oldNote - sortedNew[index]);
  }, 0);
}

/**
 * Generates all possible combinations of notes for the chord,
 * ensuring all required chord tones are present.
 */
function generatePossibleVoicings(
  bassNote: number,
  chordTones: Set<number>,
  doubledTones: number[] = []
): number[][] {
  const allVoicings: number[][] = [];
  const upperVoices: number[] = [];

  // Convert chord tones to MIDI notes in all possible octaves
  const possibleNotes = Array.from(chordTones).concat(doubledTones).flatMap(tone => {
    const notes = [];
    for (let octave = Math.floor(MIN_NOTE / 12); octave <= Math.floor(MAX_NOTE / 12); octave++) {
      const note = tone + (octave * 12);
      if (note >= MIN_NOTE && note <= MAX_NOTE && note > bassNote) {
        notes.push(note);
      }
    }
    return notes;
  }).sort((a, b) => a - b);

  // Helper function to recursively build voicings
  function buildVoicing(currentVoicing: number[], remainingCount: number) {
    if (currentVoicing.length === VOICE_COUNT - 1) { // -1 because bass note is fixed
      // Check if all required chord tones are present
      const pitchClasses = new Set([...currentVoicing, bassNote].map(note => note % 12));
      if (Array.from(chordTones).every(tone => pitchClasses.has(tone))) {
        allVoicings.push([bassNote, ...currentVoicing]);
      }
      return;
    }

    const lastNote = currentVoicing.length > 0 ? currentVoicing[currentVoicing.length - 1] : bassNote;

    for (const note of possibleNotes) {
      if (note > lastNote) { // Ensure voices are arranged in ascending order
        buildVoicing([...currentVoicing, note], remainingCount - 1);
      }
    }
  }

  buildVoicing(upperVoices, VOICE_COUNT - 1);
  return allVoicings;
}

/**
 * Creates a default spread voicing pattern based on chord type.
 * Returns a deterministic voicing following [1,5,1,3,5] for triads
 * and [1,5,7,3,5] for seventh chords.
 */
function createDefaultSpreadPattern(
  bassNote: number,
  intervals: number[],
  candidates: number[][]
): number[] {
  if (candidates.length === 0) return [];

  const isSeventhChord = intervals.length >= 4;
  const targetIntervals = isSeventhChord
    ? [0, 7, 10, 4, 7] // Seventh chord: 1-5-7-3-5
    : [0, 7, 12, 4, 7]; // Triad: 1-5-1-3-5

  // Select most compact voicing matching target intervals
  return candidates.reduce((best: number[], current: number[]) => {
    let currentScore = 0;
    let bestScore = 0;

    // Compare each voice's interval from the bass
    for (let i = 1; i < current.length; i++) {
      const currentInterval = ((current[i] - current[0]) + 12) % 12;
      const bestInterval = ((best[i] - best[0]) + 12) % 12;
      const targetInterval = targetIntervals[i];

      // Calculate how well each interval matches the target
      currentScore += Math.abs(currentInterval - targetInterval);
      bestScore += Math.abs(bestInterval - targetInterval);
    }

    return currentScore < bestScore ? current : best;
  });
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  // Get basic chord information
  const intervals = getChordIntervals(desired.quality);

  // Calculate all required chord tones as pitch classes (0-11)
  const chordTones = new Set(intervals.map(interval => 
    (desired.root + interval) % 12
  ));

  // For triads, prefer doubling the root or fifth
  let doubledTones: number[] = [];
  if (intervals.length < 4) {
    doubledTones = [
      desired.root % 12,
      (desired.root + 7) % 12 // fifth
    ];
  }

  // Generate all possible valid voicings
  const allVoicings = generatePossibleVoicings(
    desired.bass,
    chordTones,
    doubledTones
  );

  if (allVoicings.length === 0) {
    return { ...desired, notes: [] };
  }

  // Select voicing based on previous chord or default pattern
  let selectedVoicing: number[];
  if (previous?.notes && previous.notes.length === VOICE_COUNT) {
    // Find voicing with minimal movement from previous
    selectedVoicing = allVoicings.reduce((best, current) => {
      const currentCost = calculateVoiceMovementCost(previous.notes, current);
      const bestCost = calculateVoiceMovementCost(previous.notes, best);
      return currentCost < bestCost ? current : best;
    }, allVoicings[0]); // Provide a default best voicing to avoid errors
  } else {
    // Use default spread pattern
    selectedVoicing = createDefaultSpreadPattern(desired.bass, intervals, allVoicings);
  }

  return {
    ...desired,
    notes: selectedVoicing
  };
}