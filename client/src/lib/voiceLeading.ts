import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals } from "./chords";

// Constants for voice range limits
const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6
const VOICE_COUNT = 5; // Always use 5 voices (bass + 4 upper voices)

// G3 is the threshold for different voicing styles
const OPEN_VOICING_THRESHOLD = 55; // G3 in MIDI

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
 * Score a voicing based on its spacing characteristics
 */
function scoreVoicing(voicing: number[], bassNote: number): number {
  let score = 0;
  const intervals = [];

  // Calculate intervals between adjacent voices
  for (let i = 1; i < voicing.length; i++) {
    intervals.push(voicing[i] - voicing[i-1]);
  }

  if (bassNote <= OPEN_VOICING_THRESHOLD) {
    // For lower bass notes (C3-G3), prefer open voicing
    // Want ~7 semitones (perfect 5th) between bass and next note
    score -= Math.abs(intervals[0] - 7) * 2;

    // Want remaining voices to be closer together (2-4 semitones apart)
    for (let i = 1; i < intervals.length; i++) {
      score -= Math.abs(intervals[i] - 3) * 1.5;
    }
  } else {
    // For higher bass notes (>G3), prefer close position
    // Want all voices relatively close together (2-4 semitones)
    for (let interval of intervals) {
      score -= Math.abs(interval - 3) * 1.5;
    }
  }

  return score;
}

/**
 * Select the best default voicing based on the bass note range
 */
function selectDefaultVoicing(
  candidates: number[][],
  bassNote: number
): number[] {
  if (candidates.length === 0) return [];

  // Find voicing with best spacing characteristics
  return candidates.reduce((best, current) => {
    const currentScore = scoreVoicing(current, bassNote);
    const bestScore = scoreVoicing(best, bassNote);
    return currentScore > bestScore ? current : best;
  }, candidates[0]);
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

  // For triads, allow doubling of root or fifth
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
    }, allVoicings[0]);
  } else {
    // Use range-based default voicing selection
    selectedVoicing = selectDefaultVoicing(allVoicings, desired.bass);
  }

  return {
    ...desired,
    notes: selectedVoicing
  };
}