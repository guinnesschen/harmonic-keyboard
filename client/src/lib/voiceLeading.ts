import { getChordIntervals } from "./chords";
import type { ChordVoicing } from "@shared/schema";

// Constants for voice range limits
const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6
const VOICE_COUNT = 5;

/**
 * Get all possible notes for a pitch class within range
 */
function getPitchClassNotesInRange(pitchClass: number, min: number, max: number): number[] {
  const notes: number[] = [];
  const startOctave = Math.floor(min / 12);
  const endOctave = Math.floor(max / 12);

  for (let octave = startOctave; octave <= endOctave; octave++) {
    const note = (octave * 12) + (pitchClass % 12);
    if (note >= min && note <= max) {
      notes.push(note);
    }
  }
  return notes;
}

/**
 * Generate all possible 5-note voicings for given chord tones
 */
function generatePossibleVoicings(bassNote: number, chordTones: number[]): number[][] {
  const voicings: number[][] = [];
  const bassOctaves = getPitchClassNotesInRange(bassNote % 12, MIN_NOTE, MAX_NOTE - 12);

  // Start with the lowest possible bass note that allows room for upper voices
  const bass = bassOctaves[0];
  if (!bass) return [];

  // Get all possible notes for each chord tone above the bass
  const upperVoiceOptions = chordTones
    .map(tone => getPitchClassNotesInRange(tone, bass + 1, MAX_NOTE))
    .filter(notes => notes.length > 0);

  if (upperVoiceOptions.length === 0) return [[bass]];

  // Generate combinations for upper voices
  function generateCombinations(
    position: number,
    currentVoicing: number[],
    remainingCount: number
  ) {
    if (currentVoicing.length === VOICE_COUNT) {
      voicings.push([...currentVoicing]);
      return;
    }

    // If we need more notes than available chord tones, reuse tones
    const availableNotes = upperVoiceOptions[position % upperVoiceOptions.length];

    for (const note of availableNotes) {
      if (currentVoicing.length === 0 || note > currentVoicing[currentVoicing.length - 1]) {
        generateCombinations(
          (position + 1) % upperVoiceOptions.length,
          [...currentVoicing, note],
          remainingCount - 1
        );
      }
    }
  }

  generateCombinations(0, [bass], VOICE_COUNT - 1);
  return voicings;
}

/**
 * Calculate total voice movement cost between two voicings
 */
function calculateVoiceMovementCost(prev: number[], next: number[]): number {
  let minCost = Infinity;

  // Try all possible permutations of matching voices (except bass)
  function permute(arr: number[], start: number): void {
    if (start === arr.length - 1) {
      // Calculate cost for this permutation
      let cost = Math.abs(prev[0] - next[0]); // Bass movement
      for (let i = 1; i < arr.length; i++) {
        cost += Math.abs(prev[i] - arr[i]);
      }
      minCost = Math.min(minCost, cost);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      // Swap elements to generate permutation
      [arr[start], arr[i]] = [arr[i], arr[start]];
      permute(arr, start + 1);
      // Restore original order
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  }

  // Start permutations from index 1 (after bass)
  const upperVoices = next.slice(1);
  permute(upperVoices, 0);
  return minCost;
}

/**
 * Create an initial evenly-spaced voicing when there's no previous chord
 */
function createInitialVoicing(bassNote: number, chordTones: number[]): number[] {
  const bass = getPitchClassNotesInRange(bassNote % 12, MIN_NOTE, MAX_NOTE - 12)[0];
  if (!bass) return [];

  const voicing = [bass];
  let lastNote = bass;

  // Add remaining voices with roughly equal spacing
  const toneCount = chordTones.length;
  for (let i = 1; i < VOICE_COUNT; i++) {
    const targetPitch = lastNote + 4; // Aim for roughly a major third spacing
    const tone = chordTones[i % toneCount];
    const possibleNotes = getPitchClassNotesInRange(tone, lastNote + 1, Math.min(targetPitch + 5, MAX_NOTE));

    if (possibleNotes.length > 0) {
      // Find the note closest to our target pitch
      const note = possibleNotes.reduce((closest, current) => 
        Math.abs(current - targetPitch) < Math.abs(closest - targetPitch) ? current : closest
      );
      voicing.push(note);
      lastNote = note;
    } else {
      // If we can't find a note in the desired range, just move up by 3 semitones
      const fallbackNote = Math.min(lastNote + 3, MAX_NOTE);
      voicing.push(fallbackNote);
      lastNote = fallbackNote;
    }
  }

  return voicing;
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  // Get all chord tones as pitch classes (0-11)
  const intervals = getChordIntervals(desired.quality);
  const chordTones = Array.from(new Set(
    intervals.map(interval => (desired.root + interval) % 12)
  ));

  let chosenVoicing: number[];

  if (!previous?.notes || previous.notes.length === 0) {
    // No previous chord - create an initial voicing
    chosenVoicing = createInitialVoicing(desired.bass, chordTones);
  } else {
    // Generate all possible voicings
    const possibleVoicings = generatePossibleVoicings(desired.bass, chordTones);

    if (possibleVoicings.length === 0) {
      // Fallback to initial voicing if we couldn't generate any valid options
      chosenVoicing = createInitialVoicing(desired.bass, chordTones);
    } else {
      // Find the voicing with minimal movement from previous
      let minCost = Infinity;
      let bestVoicing = possibleVoicings[0];

      for (const voicing of possibleVoicings) {
        const cost = calculateVoiceMovementCost(previous.notes, voicing);
        if (cost < minCost) {
          minCost = cost;
          bestVoicing = voicing;
        }
      }

      chosenVoicing = bestVoicing;
    }
  }

  // Ensure we have a valid voicing
  if (!chosenVoicing || chosenVoicing.length === 0) {
    chosenVoicing = [desired.bass];
  }

  // Fill to VOICE_COUNT if needed (failsafe)
  while (chosenVoicing.length < VOICE_COUNT) {
    const lastNote = chosenVoicing[chosenVoicing.length - 1];
    chosenVoicing.push(Math.min(lastNote + 4, MAX_NOTE));
  }

  return {
    ...desired,
    notes: chosenVoicing,
  };
}