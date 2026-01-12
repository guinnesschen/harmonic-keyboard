import type { ChordIntent, ChordVoicing, MidiNote } from "./types";
import { spellChord } from "./chords";

const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6
const VOICE_COUNT = 5;

function generateAllVoicings(bassNote: MidiNote, chordTones: number[]): MidiNote[][] {
  const voicings: MidiNote[][] = [];
  const bassPitchClass = bassNote % 12;

  let bass = MIN_NOTE + bassPitchClass;
  while (bass < MIN_NOTE) bass += 12;
  if (bass > MAX_NOTE - 12) return [];

  function generateUpperVoices(current: MidiNote[], lastNote: MidiNote) {
    if (current.length === VOICE_COUNT) {
      voicings.push([...current]);
      return;
    }

    for (const tone of chordTones) {
      let note = lastNote + 1 + ((12 - ((lastNote + 1) % 12) + tone) % 12);
      while (note <= MAX_NOTE) {
        generateUpperVoices([...current, note], note);
        note += 12;
      }
    }
  }

  generateUpperVoices([bass], bass);
  return voicings;
}

function calculateMovementCost(prev: MidiNote[], next: MidiNote[]): number {
  let cost = Math.abs(prev[0] - next[0]);

  const prevUpper = prev.slice(1);
  const nextUpper = next.slice(1);

  function* permutations(arr: MidiNote[]): Generator<MidiNote[]> {
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

function createInitialVoicing(bassNote: MidiNote, chordTones: number[]): MidiNote[] {
  const bassPitchClass = bassNote % 12;
  let bass = MIN_NOTE + bassPitchClass;
  while (bass < MIN_NOTE) bass += 12;

  const voicing = [bass];
  let lastNote = bass;

  for (let i = 1; i < VOICE_COUNT; i++) {
    const targetInterval = 4;
    const tone = chordTones[i % chordTones.length];
    const targetNote = lastNote + targetInterval;

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
  intent: ChordIntent,
  previous: ChordVoicing | null,
): ChordVoicing {
  const chordTones = spellChord(intent);

  if (!previous?.notes?.length) {
    const notes = createInitialVoicing(intent.bass, chordTones);
    return { intent, notes };
  }

  const allVoicings = generateAllVoicings(intent.bass, chordTones);

  if (!allVoicings.length) {
    const notes = createInitialVoicing(intent.bass, chordTones);
    return { intent, notes };
  }

  let bestVoicing = allVoicings[0];
  let minCost = calculateMovementCost(previous.notes, bestVoicing);

  for (const voicing of allVoicings) {
    const cost = calculateMovementCost(previous.notes, voicing);
    if (cost < minCost) {
      minCost = cost;
      bestVoicing = voicing;
    }
  }

  return { intent, notes: bestVoicing };
}

export const VoicingConfig = {
  MIN_NOTE,
  MAX_NOTE,
  VOICE_COUNT,
};
