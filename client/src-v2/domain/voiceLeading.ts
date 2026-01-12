import type { ChordIntent, ChordVoicing, PitchClass, MidiNote } from './types';
import { VOICE_RANGE, VOICE_COUNT } from './constants';
import { getChordPitchClasses, calculateRootFromBass } from './chord';

/**
 * Generate a chord voicing with optimal voice leading from previous chord.
 */
export function generateVoicing(
  intent: ChordIntent,
  previous: ChordVoicing | null
): ChordVoicing {
  const root = calculateRootFromBass(intent.bassNote, intent.inversion, intent.quality);
  const pitchClasses = getChordPitchClasses(root, intent.quality);

  const bassNote = findBassNote(intent.bassNote);

  if (!previous) {
    return {
      root,
      quality: intent.quality,
      inversion: intent.inversion,
      notes: createInitialVoicing(bassNote, pitchClasses),
    };
  }

  const candidates = generateCandidateVoicings(bassNote, pitchClasses);

  if (candidates.length === 0) {
    return {
      root,
      quality: intent.quality,
      inversion: intent.inversion,
      notes: createInitialVoicing(bassNote, pitchClasses),
    };
  }

  const bestVoicing = findMinimalMovement(previous.notes, candidates);

  return {
    root,
    quality: intent.quality,
    inversion: intent.inversion,
    notes: bestVoicing,
  };
}

/**
 * Find the bass note in the appropriate octave
 */
function findBassNote(pitchClass: PitchClass): MidiNote {
  let note = VOICE_RANGE.min + pitchClass;
  while (note < VOICE_RANGE.min) note += 12;
  return note;
}

/**
 * Create an initial evenly-spaced voicing
 */
function createInitialVoicing(bassNote: MidiNote, pitchClasses: PitchClass[]): MidiNote[] {
  const notes: MidiNote[] = [bassNote];
  let lastNote = bassNote;

  for (let i = 1; i < VOICE_COUNT; i++) {
    const targetPitchClass = pitchClasses[i % pitchClasses.length];
    let note = lastNote + 4;

    const pcDiff = (targetPitchClass - (note % 12) + 12) % 12;
    note += pcDiff;

    if (note > VOICE_RANGE.max) note -= 12;

    notes.push(note);
    lastNote = note;
  }

  return notes;
}

/**
 * Generate all valid voicings for the given bass and pitch classes
 */
function generateCandidateVoicings(bassNote: MidiNote, pitchClasses: PitchClass[]): MidiNote[][] {
  const voicings: MidiNote[][] = [];

  function buildVoicing(current: MidiNote[], lastNote: MidiNote): void {
    if (current.length === VOICE_COUNT) {
      voicings.push([...current]);
      return;
    }

    for (const pc of pitchClasses) {
      let note = lastNote + 1 + ((pc - ((lastNote + 1) % 12) + 12) % 12);

      while (note <= VOICE_RANGE.max) {
        buildVoicing([...current, note], note);
        note += 12;
      }
    }
  }

  buildVoicing([bassNote], bassNote);
  return voicings;
}

/**
 * Find the voicing with minimal total movement from previous
 */
function findMinimalMovement(previous: MidiNote[], candidates: MidiNote[][]): MidiNote[] {
  let best = candidates[0];
  let bestCost = Infinity;

  for (const candidate of candidates) {
    const cost = calculateMovementCost(previous, candidate);
    if (cost < bestCost) {
      bestCost = cost;
      best = candidate;
    }
  }

  return best;
}

/**
 * Calculate total voice movement cost
 */
function calculateMovementCost(prev: MidiNote[], next: MidiNote[]): number {
  let cost = Math.abs(prev[0] - next[0]);

  const prevUpper = prev.slice(1);
  const nextUpper = next.slice(1);

  cost += minPermutationCost(prevUpper, nextUpper);

  return cost;
}

/**
 * Find minimum cost assignment of prev voices to next voices
 */
function minPermutationCost(prev: MidiNote[], next: MidiNote[]): number {
  let minCost = Infinity;

  for (const perm of permutations(next)) {
    let cost = 0;
    for (let i = 0; i < prev.length; i++) {
      cost += Math.abs(prev[i] - perm[i]);
    }
    minCost = Math.min(minCost, cost);
  }

  return minCost;
}

/**
 * Generate all permutations of an array
 */
function* permutations<T>(arr: T[]): Generator<T[]> {
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
