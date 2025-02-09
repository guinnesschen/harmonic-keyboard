import { getChordIntervals } from "./chords";
import type { ChordVoicing } from "@shared/schema";

const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6
const VOICE_COUNT = 5;

/**
 * Generate all possible voicings for the given chord
 */
function generateAllVoicings(bassNote: number, chordTones: number[]): number[][] {
  const voicings: number[][] = [];
  const bassPC = bassNote % 12;

  // Find the lowest valid bass note for this chord
  let bass = MIN_NOTE + bassPC;
  while (bass < MIN_NOTE) bass += 12;
  if (bass > MAX_NOTE - 12) return []; // No room for upper voices

  // Generate all possible combinations of upper voices
  function generateUpperVoices(position: number, current: number[], lastNote: number) {
    if (current.length === VOICE_COUNT) {
      voicings.push([...current]);
      return;
    }

    // For each chord tone, try all possible octaves above the last note
    for (const tone of chordTones) {
      let note = lastNote + 1 + ((12 - ((lastNote + 1) % 12) + tone) % 12);
      while (note <= MAX_NOTE) {
        generateUpperVoices(position + 1, [...current, note], note);
        note += 12;
      }
    }
  }

  generateUpperVoices(1, [bass], bass);
  return voicings;
}

/**
 * Calculate voice movement cost between two voicings
 */
function calculateMovementCost(prev: number[], next: number[]): number {
  // Bass notes are fixed, start with their movement cost
  let cost = Math.abs(prev[0] - next[0]);

  // For upper voices, try all permutations to find minimal movement
  const prevUpper = prev.slice(1);
  const nextUpper = next.slice(1);

  function* permutations(arr: number[]): Generator<number[]> {
    if (arr.length <= 1) {
      yield arr;
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of permutations(rest)) {
        yield [arr[i], ...perm];
      }
    }
  }

  let minUpperCost = Infinity;
  for (const perm of permutations(nextUpper)) {
    let upperCost = 0;
    for (let i = 0; i < prevUpper.length; i++) {
      upperCost += Math.abs(prevUpper[i] - perm[i]);
    }
    minUpperCost = Math.min(minUpperCost, upperCost);
  }

  return cost + minUpperCost;
}

/**
 * Create initial evenly-spaced voicing
 */
function createInitialVoicing(bassNote: number, chordTones: number[]): number[] {
  const bassPC = bassNote % 12;
  let bass = MIN_NOTE + bassPC;
  while (bass < MIN_NOTE) bass += 12;

  const voicing = [bass];
  let lastNote = bass;

  // Add remaining voices with roughly equal spacing (major third)
  for (let i = 1; i < VOICE_COUNT; i++) {
    const targetInterval = 4; // Major third spacing
    const tone = chordTones[i % chordTones.length];
    const targetNote = lastNote + targetInterval;

    // Find the closest note of the right pitch class above the last note
    let note = lastNote + ((12 - (lastNote % 12) + tone) % 12);
    while (note < targetNote) note += 12;
    while (note > targetNote + 6) note -= 12;

    if (note > MAX_NOTE) note -= 12;
    voicing.push(note);
    lastNote = note;
  }

  return voicing;
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  // Get chord tones as pitch classes (0-11)
  const intervals = getChordIntervals(desired.quality);
  const chordTones = [...new Set(intervals.map(interval => 
    (desired.root + interval) % 12
  ))];

  // If this is the first chord, create an evenly-spaced voicing
  if (!previous?.notes?.length) {
    const notes = createInitialVoicing(desired.bass, chordTones);
    return { ...desired, notes };
  }

  // Generate all possible voicings
  const allVoicings = generateAllVoicings(desired.bass, chordTones);

  // If no valid voicings found, fallback to initial voicing
  if (!allVoicings.length) {
    const notes = createInitialVoicing(desired.bass, chordTones);
    return { ...desired, notes };
  }

  // Find the voicing with minimal movement from previous
  let bestVoicing = allVoicings[0];
  let minCost = calculateMovementCost(previous.notes, bestVoicing);

  for (const voicing of allVoicings) {
    const cost = calculateMovementCost(previous.notes, voicing);
    if (cost < minCost) {
      minCost = cost;
      bestVoicing = voicing;
    }
  }

  return { ...desired, notes: bestVoicing };
}