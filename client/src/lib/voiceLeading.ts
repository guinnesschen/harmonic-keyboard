import type { ChordVoicing } from "@shared/schema";
import { getChordIntervals } from "./chords";

function rotateArray<T>(arr: T[], positions: number): T[] {
  const pos = positions % arr.length;
  return [...arr.slice(pos), ...arr.slice(0, pos)];
}

function isCompleteChord(voicing: ChordVoicing): boolean {
  return voicing.root !== -1 && voicing.quality !== undefined;
}

function getBassNoteForPosition(rootNote: number, intervals: number[], position: string): number {
  if (position === "root") return rootNote;
  const index = position === "first" ? 1 : position === "second" ? 2 : 3;
  return (rootNote + intervals[index % intervals.length]) % 12;
}

// Constants for voice range limits
const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6

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

// Ensure all required chord tones are present and voices are properly spaced
function distributeVoices(
  requiredNotes: Set<number>, 
  previousVoices: number[] | null, 
  bassNote: number
): number[] {
  // Start with the bass note
  const voices = [bassNote];
  const requiredPitchClasses = new Set(Array.from(requiredNotes).map(note => note % 12));

  // If we have previous voices, try to move each voice to the nearest required note
  if (previousVoices && previousVoices.length > 1) {
    const upperVoices = previousVoices.slice(1);

    // For each previous upper voice, find the closest required note
    upperVoices.forEach(prevNote => {
      let bestNote = -1;
      let minDistance = Infinity;

      // Try each required pitch class in different octaves
      requiredPitchClasses.forEach(pitchClass => {
        const baseNote = findClosestOctave(pitchClass, prevNote);
        const distance = Math.abs(baseNote - prevNote);

        if (distance < minDistance && baseNote > bassNote) {
          minDistance = distance;
          bestNote = baseNote;
        }
      });

      if (bestNote !== -1) {
        voices.push(bestNote);
        requiredPitchClasses.delete(bestNote % 12);
      }
    });
  }

  // If we still need more voices or don't have previous voices
  while (voices.length < 5) {
    if (requiredPitchClasses.size > 0) {
      // Add remaining required notes
      const pitchClass = Array.from(requiredPitchClasses)[0];
      const note = findClosestOctave(pitchClass, voices[voices.length - 1] + 4);
      voices.push(note);
      requiredPitchClasses.delete(pitchClass);
    } else {
      // Double appropriate notes (prefer root and fifth)
      const lastNote = voices[voices.length - 1];
      const rootPC = bassNote % 12;
      const fifthPC = (bassNote + 7) % 12;

      // Try to double root or fifth in a higher octave
      const noteToDouble = voices.find(n => n % 12 === rootPC || n % 12 === fifthPC) || voices[1];
      voices.push(findClosestOctave(noteToDouble, lastNote + 4));
    }
  }

  // Sort voices while keeping bass note at bottom
  const upperVoices = voices.slice(1).sort((a, b) => a - b);
  return [bassNote, ...upperVoices];
}

export function generateVoicing(
  desired: ChordVoicing,
  previous: ChordVoicing | null
): ChordVoicing {
  const voicing = { ...desired };

  // Get intervals for the chord quality
  const intervals = getChordIntervals(desired.quality);

  // Calculate the bass note based on position
  const bassNote = getBassNoteForPosition(desired.root, intervals, desired.position);
  voicing.bass = bassNote + 48; // Start in octave 3

  // Generate basic chord tones starting from root
  const requiredNotes = new Set(intervals.map(interval => desired.root + interval));

  // Generate voices with proper voice leading
  const notes = distributeVoices(
    requiredNotes,
    previous?.notes || null,
    voicing.bass
  );

  return {
    ...voicing,
    notes
  };
}