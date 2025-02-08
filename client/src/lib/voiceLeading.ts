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

// Expand a set of notes to 5 voices by duplicating appropriate notes
function expandToFiveVoices(notes: number[], bassNote: number): number[] {
  // Keep bass note separate
  const upperVoices = notes.filter(n => n !== bassNote).sort((a, b) => a - b);

  while (upperVoices.length < 4) {
    // Find best note to duplicate (prefer root and fifth)
    const noteToDouble = upperVoices.find(note => 
      (note - bassNote) % 12 === 0 || // Root
      (note - bassNote) % 12 === 7    // Fifth
    ) || upperVoices[0];  // Fallback to first note

    // Add the doubled note an octave higher
    upperVoices.push(noteToDouble + 12);
  }

  return [bassNote, ...upperVoices.sort((a, b) => a - b)];
}

// Generate all possible octave transpositions for a note
function generateOctaveTranspositions(note: number, prevNote: number): number[] {
  const baseNote = note % 12;
  const prevOctave = Math.floor(prevNote / 12);
  return [
    baseNote + (prevOctave - 1) * 12,
    baseNote + prevOctave * 12,
    baseNote + (prevOctave + 1) * 12
  ].filter(n => Math.abs(n - prevNote) <= 7); // Limit movement to within a fifth
}

// Find optimal voice assignments to minimize total movement
function findOptimalVoiceAssignment(
  currentNotes: number[],
  previousNotes: number[]
): number[] {
  let bestAssignment = currentNotes;
  let minTotalDistance = Infinity;

  // Generate all possible combinations of octave transpositions
  const possibleAssignments: number[][] = [];

  function generateCombinations(current: number[], index: number) {
    if (index === currentNotes.length) {
      possibleAssignments.push([...current]);
      return;
    }

    const possibleNotes = generateOctaveTranspositions(currentNotes[index], previousNotes[index]);
    for (const note of possibleNotes) {
      current[index] = note;
      generateCombinations(current, index + 1);
    }
  }

  generateCombinations([...currentNotes], 0);

  // Find the combination with minimum total movement
  for (const assignment of possibleAssignments) {
    const totalDistance = assignment.reduce(
      (sum, note, i) => sum + Math.abs(note - previousNotes[i]),
      0
    );

    if (totalDistance < minTotalDistance) {
      minTotalDistance = totalDistance;
      bestAssignment = assignment;
    }
  }

  return bestAssignment;
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
  voicing.bass = bassNote + 48; // Put in bass octave

  // Generate basic chord tones starting from root
  let chordTones = intervals.map(interval => desired.root + interval + 60); // Middle C octave

  // Apply the chord position by rotating the intervals
  let rotationAmount = 0;
  switch (desired.position) {
    case "first":
      rotationAmount = 1;
      break;
    case "second":
      rotationAmount = 2;
      break;
    case "thirdseventh":
      rotationAmount = 3;
      break;
  }
  chordTones = rotateArray(chordTones, rotationAmount);

  // Initial set of notes including bass
  let notes = [voicing.bass, ...chordTones];

  // Expand to 5 voices
  notes = expandToFiveVoices(notes, voicing.bass);

  // Apply voice leading if we have a previous chord
  if (previous && previous.notes.length === 5) {
    // Keep bass separate and apply voice leading to upper voices
    const upperVoices = notes.slice(1);
    const previousUpperVoices = previous.notes.slice(1);

    // Find optimal voice assignment for upper voices
    const optimalUpperVoices = findOptimalVoiceAssignment(
      upperVoices,
      previousUpperVoices
    );

    // Combine bass with optimal upper voices
    notes = [voicing.bass, ...optimalUpperVoices];
  }

  return {
    ...voicing,
    notes
  };
}

function generateBasicChord(rootNote: number, intervals: number[]): number[] {
  const baseOctave = 60; // Middle C
  return intervals.map(interval => baseOctave + rootNote + interval);
}