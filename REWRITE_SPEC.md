# Harmonic Keyboard v2 - Complete Rewrite Specification

## Overview

The Harmonic Keyboard is a browser-based musical instrument that abstracts away individual notes, letting you play directly in terms of **chords and harmony**. You express chords by pressing up to three keys simultaneously:

1. **Bass note** (which note is in the bass)
2. **Chord quality** (major, minor, dominant7, etc.)
3. **Inversion** (which chord tone is in the bass)

The system then uses **automatic voice leading** to ensure smooth transitions between chords.

---

## Architecture Principles

1. **Pure domain logic** - All music theory code is pure TypeScript with no dependencies
2. **Separation of concerns** - Domain, audio, state, and UI are cleanly separated
3. **React best practices** - Context for global state, hooks for reusable logic
4. **Type safety** - Strict TypeScript throughout
5. **Testability** - Domain logic is 100% unit testable
6. **Simplicity** - No unnecessary abstractions, minimal dependencies

---

## Directory Structure

```
src/
├── domain/                    # Pure TypeScript - NO React, NO Tone.js
│   ├── types.ts              # All type definitions
│   ├── constants.ts          # Musical constants (intervals, ranges, etc.)
│   ├── chord.ts              # Chord construction utilities
│   ├── voiceLeading.ts       # Voice leading algorithm
│   └── keyMapping.ts         # Keyboard → musical intent mapping
│
├── audio/                     # Tone.js abstraction layer
│   ├── ChordSynth.ts         # Synth + effects for chord instrument
│   ├── DrumKit.ts            # Drum samples and triggering
│   ├── presets.ts            # Sound presets
│   └── types.ts              # Audio-specific types
│
├── state/                     # React Context providers
│   ├── AudioContext.tsx      # Audio initialization and settings
│   ├── KeyboardContext.tsx   # Tracks pressed keys (React state, not global!)
│   └── StorageContext.tsx    # LocalStorage persistence
│
├── hooks/                     # Custom React hooks
│   ├── useKeyboard.ts        # Keyboard event handling
│   ├── useChordPlayer.ts     # Combines keyboard → voicing → audio
│   ├── useDrumPlayer.ts      # Drum keyboard handling
│   └── usePersistedState.ts  # localStorage wrapper
│
├── components/                # React components
│   ├── App.tsx               # Root component with providers
│   ├── Layout.tsx            # Main layout with header
│   ├── piano/                # Piano instrument UI
│   │   ├── PianoView.tsx     # Main piano view
│   │   ├── ChordDisplay.tsx  # Current chord name/notes
│   │   └── KeyboardGuide.tsx # Visual keyboard guide
│   ├── drums/                # Drum machine UI
│   │   ├── DrumView.tsx      # Main drum view
│   │   ├── DrumPad.tsx       # Individual drum pad
│   │   └── LoopRecorder.tsx  # Recording/playback controls
│   ├── settings/             # Settings UI
│   │   ├── SettingsDialog.tsx
│   │   ├── SoundControls.tsx
│   │   └── KeyMappingEditor.tsx
│   └── ui/                   # Minimal UI primitives (only what's needed)
│       ├── Button.tsx
│       ├── Dialog.tsx
│       ├── Slider.tsx
│       └── Select.tsx
│
├── main.tsx                  # Entry point
└── index.css                 # Tailwind + minimal custom CSS
```

---

## Domain Layer Specification

### `domain/types.ts`

```typescript
// Pitch class (0-11, where 0 = C)
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// MIDI note number (0-127)
export type MidiNote = number;

// Chord qualities supported
export type ChordQuality =
  | 'major'
  | 'minor'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'diminished7'
  | 'halfDiminished7'
  | 'augmented'
  | 'sus4'
  | 'dominant7sus4'
  | 'minorMajor7'
  | 'add9'
  | 'minorAdd9';

// Chord inversion (which chord tone is in the bass)
export type Inversion = 0 | 1 | 2 | 3; // root, 1st, 2nd, 3rd

// The user's intent before voice leading
export interface ChordIntent {
  bassNote: PitchClass;      // Which note should be in the bass
  quality: ChordQuality;     // What type of chord
  inversion: Inversion;      // Which inversion
}

// A fully voiced chord ready to play
export interface ChordVoicing {
  root: PitchClass;          // The root of the chord
  quality: ChordQuality;     // Chord type
  inversion: Inversion;      // Inversion
  notes: MidiNote[];         // Actual MIDI notes to play (5 voices)
}

// Keyboard state
export interface KeyboardState {
  pressedKeys: Set<string>;  // Currently held keys (lowercase)
}

// Key mapping configuration
export interface QualityKeyMapping {
  key: string;               // The keyboard key (uppercase)
  quality: ChordQuality;     // What quality it triggers
  enabled: boolean;          // Whether this mapping is active
}
```

### `domain/constants.ts`

```typescript
import type { ChordQuality, PitchClass } from './types';

// Voice range limits
export const VOICE_RANGE = {
  min: 48,  // C3
  max: 84,  // C6
} as const;

export const VOICE_COUNT = 5;

// Keyboard layout
export const BASS_KEYS = 'zsxdcvgbhnjm,l.;/' as const;
export const INVERSION_KEYS = '0123' as const;

// Starting MIDI note for bass (C3)
export const BASS_OCTAVE_START = 48;

// Chord intervals (semitones from root)
export const CHORD_INTERVALS: Record<ChordQuality, readonly number[]> = {
  major:           [0, 4, 7],
  minor:           [0, 3, 7],
  dominant7:       [0, 4, 7, 10],
  major7:          [0, 4, 7, 11],
  minor7:          [0, 3, 7, 10],
  diminished7:     [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],
  augmented:       [0, 4, 8],
  sus4:            [0, 5, 7],
  dominant7sus4:   [0, 5, 7, 10],
  minorMajor7:     [0, 3, 7, 11],
  add9:            [0, 4, 7, 14],
  minorAdd9:       [0, 3, 7, 14],
} as const;

// Note names for display
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Quality display names
export const QUALITY_NAMES: Record<ChordQuality, string> = {
  major: 'maj',
  minor: 'min',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'min7',
  diminished7: 'dim7',
  halfDiminished7: 'm7b5',
  augmented: 'aug',
  sus4: 'sus4',
  dominant7sus4: '7sus4',
  minorMajor7: 'mM7',
  add9: 'add9',
  minorAdd9: 'madd9',
} as const;

// Default quality key mappings
export const DEFAULT_QUALITY_MAPPINGS: readonly { key: string; quality: ChordQuality }[] = [
  { key: 'Q', quality: 'major' },
  { key: 'W', quality: 'major7' },
  { key: 'E', quality: 'dominant7' },
  { key: 'R', quality: 'minor' },
  { key: 'T', quality: 'minor7' },
  { key: 'Y', quality: 'diminished7' },
  { key: 'U', quality: 'halfDiminished7' },
  { key: 'I', quality: 'dominant7sus4' },
  { key: 'O', quality: 'sus4' },
  { key: 'P', quality: 'augmented' },
  { key: '5', quality: 'minorMajor7' },
  { key: '6', quality: 'add9' },
  { key: '7', quality: 'minorAdd9' },
] as const;
```

### `domain/chord.ts`

```typescript
import type { ChordQuality, PitchClass, Inversion, ChordIntent } from './types';
import { CHORD_INTERVALS, NOTE_NAMES, QUALITY_NAMES } from './constants';

/**
 * Get the intervals (in semitones) for a chord quality
 */
export function getChordIntervals(quality: ChordQuality): readonly number[] {
  return CHORD_INTERVALS[quality];
}

/**
 * Get pitch classes for a chord (root + intervals mod 12)
 */
export function getChordPitchClasses(root: PitchClass, quality: ChordQuality): PitchClass[] {
  const intervals = getChordIntervals(quality);
  return intervals.map(interval => ((root + interval) % 12) as PitchClass);
}

/**
 * Calculate the root note from bass note and inversion
 *
 * If bass is the 3rd (1st inversion), root is bass - interval[1]
 * If bass is the 5th (2nd inversion), root is bass - interval[2]
 * etc.
 */
export function calculateRootFromBass(
  bassNote: PitchClass,
  inversion: Inversion,
  quality: ChordQuality
): PitchClass {
  const intervals = getChordIntervals(quality);
  const offset = intervals[inversion] ?? 0;
  return ((bassNote - offset + 12) % 12) as PitchClass;
}

/**
 * Format a chord for display (e.g., "Cmaj7", "F#min")
 */
export function formatChordName(root: PitchClass, quality: ChordQuality): string {
  return `${NOTE_NAMES[root]}${QUALITY_NAMES[quality]}`;
}

/**
 * Format a chord with bass note (e.g., "Cmaj7/E")
 */
export function formatChordWithBass(
  root: PitchClass,
  quality: ChordQuality,
  bassNote: PitchClass
): string {
  const chordName = formatChordName(root, quality);
  if (root === bassNote) {
    return chordName;
  }
  return `${chordName}/${NOTE_NAMES[bassNote]}`;
}
```

### `domain/voiceLeading.ts`

```typescript
import type { ChordIntent, ChordVoicing, PitchClass, MidiNote } from './types';
import { VOICE_RANGE, VOICE_COUNT } from './constants';
import { getChordPitchClasses, calculateRootFromBass } from './chord';

/**
 * Generate a chord voicing with optimal voice leading from previous chord.
 *
 * Algorithm:
 * 1. Calculate root from bass + inversion
 * 2. Get all pitch classes for the chord
 * 3. Generate candidate voicings within range
 * 4. If previous voicing exists, find candidate with minimum voice movement
 * 5. Otherwise, create balanced initial voicing
 */
export function generateVoicing(
  intent: ChordIntent,
  previous: ChordVoicing | null
): ChordVoicing {
  const root = calculateRootFromBass(intent.bassNote, intent.inversion, intent.quality);
  const pitchClasses = getChordPitchClasses(root, intent.quality);

  // Find bass note in correct octave
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
 * Create an initial evenly-spaced voicing (no previous chord to lead from)
 */
function createInitialVoicing(bassNote: MidiNote, pitchClasses: PitchClass[]): MidiNote[] {
  const notes: MidiNote[] = [bassNote];
  let lastNote = bassNote;

  // Add remaining voices with ~major 3rd spacing
  for (let i = 1; i < VOICE_COUNT; i++) {
    const targetPitchClass = pitchClasses[i % pitchClasses.length];
    let note = lastNote + 4; // Start roughly a major 3rd up

    // Find nearest note of correct pitch class
    const pcDiff = (targetPitchClass - (note % 12) + 12) % 12;
    note += pcDiff;

    // Keep in range
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

    // Try each pitch class in valid octaves
    for (const pc of pitchClasses) {
      // Find first occurrence above lastNote
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
 * Calculate total voice movement cost.
 * Bass moves directly; upper voices can be permuted to minimize movement.
 */
function calculateMovementCost(prev: MidiNote[], next: MidiNote[]): number {
  // Bass movement is fixed
  let cost = Math.abs(prev[0] - next[0]);

  // For upper voices, find optimal pairing
  const prevUpper = prev.slice(1);
  const nextUpper = next.slice(1);

  // Try all permutations of upper voices (4! = 24, manageable)
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
```

### `domain/keyMapping.ts`

```typescript
import type { ChordIntent, ChordQuality, Inversion, PitchClass, QualityKeyMapping } from './types';
import { BASS_KEYS, INVERSION_KEYS, DEFAULT_QUALITY_MAPPINGS } from './constants';

/**
 * Parse currently pressed keys into a chord intent.
 * Returns null if no valid chord can be formed (no bass key pressed).
 */
export function parseKeyboardState(
  pressedKeys: Set<string>,
  qualityMappings: QualityKeyMapping[]
): ChordIntent | null {
  const keys = Array.from(pressedKeys).map(k => k.toLowerCase());

  // Find bass key
  const bassKey = keys.find(k => BASS_KEYS.includes(k));
  if (!bassKey) return null;

  // Get bass note (index in BASS_KEYS = pitch class)
  const bassNote = BASS_KEYS.indexOf(bassKey) as PitchClass;

  // Find quality key
  const enabledQualityKeys = qualityMappings
    .filter(m => m.enabled)
    .map(m => m.key.toLowerCase());

  const qualityKey = keys.find(k => enabledQualityKeys.includes(k));

  let quality: ChordQuality = 'major'; // default
  if (qualityKey) {
    const mapping = qualityMappings.find(
      m => m.key.toLowerCase() === qualityKey && m.enabled
    );
    if (mapping) quality = mapping.quality;
  }

  // Find inversion key
  const inversionKey = keys.find(k => INVERSION_KEYS.includes(k));
  const inversion = (inversionKey ? parseInt(inversionKey, 10) : 0) as Inversion;

  return { bassNote, quality, inversion };
}

/**
 * Get the keyboard layout for display
 */
export function getKeyboardLayout(qualityMappings: QualityKeyMapping[]) {
  return {
    bassKeys: BASS_KEYS.toUpperCase().split(''),
    inversionKeys: INVERSION_KEYS.split(''),
    qualityKeys: qualityMappings
      .filter(m => m.enabled)
      .map(m => m.key),
  };
}

/**
 * Create default quality mappings
 */
export function createDefaultQualityMappings(): QualityKeyMapping[] {
  return DEFAULT_QUALITY_MAPPINGS.map(m => ({
    ...m,
    enabled: true,
  }));
}

/**
 * Get note name for a bass key (for display)
 */
export function getBassKeyNote(key: string): string | null {
  const index = BASS_KEYS.indexOf(key.toLowerCase());
  if (index === -1) return null;
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[index % 12];
}
```

---

## Audio Layer Specification

### `audio/types.ts`

```typescript
export interface SynthSettings {
  oscillator: {
    type: 'sine' | 'square' | 'triangle' | 'sawtooth';
    spread: number;
  };
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  effects: {
    reverb: { decay: number; wet: number };
    chorus: { depth: number; frequency: number; wet: number };
    eq: { low: number; mid: number; high: number };
    compression: { threshold: number; ratio: number; attack: number; release: number };
    distortion: { distortion: number; wet: number };
  };
  volume: number;
}

export type DrumSound = 'kick' | 'snare' | 'hihat' | 'openhat' | 'crash' | 'rimshot' | 'clap';

export interface DrumEvent {
  time: number;        // Seconds from loop start
  sound: DrumSound;
}
```

### `audio/presets.ts`

```typescript
import type { SynthSettings } from './types';

export const PRESETS: Record<string, SynthSettings> = {
  'Warm Piano': {
    oscillator: { type: 'triangle', spread: 15 },
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.8 },
    effects: {
      reverb: { decay: 1.5, wet: 0.3 },
      chorus: { depth: 0.3, frequency: 2.5, wet: 0.2 },
      eq: { low: 2, mid: 0, high: -2 },
      compression: { threshold: -20, ratio: 4, attack: 0.003, release: 0.25 },
      distortion: { distortion: 0.2, wet: 0.1 },
    },
    volume: -12,
  },
  'Lo-fi Dreams': {
    oscillator: { type: 'triangle', spread: 30 },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 1.2 },
    effects: {
      reverb: { decay: 3, wet: 0.4 },
      chorus: { depth: 0.6, frequency: 0.8, wet: 0.5 },
      eq: { low: 4, mid: -2, high: -4 },
      compression: { threshold: -25, ratio: 6, attack: 0.01, release: 0.3 },
      distortion: { distortion: 0.4, wet: 0.3 },
    },
    volume: -14,
  },
  'Digital Clear': {
    oscillator: { type: 'sine', spread: 5 },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.5 },
    effects: {
      reverb: { decay: 1, wet: 0.2 },
      chorus: { depth: 0.2, frequency: 4, wet: 0.15 },
      eq: { low: 0, mid: 2, high: 3 },
      compression: { threshold: -18, ratio: 3, attack: 0.002, release: 0.2 },
      distortion: { distortion: 0.1, wet: 0.05 },
    },
    volume: -10,
  },
  'Cinematic Pad': {
    oscillator: { type: 'sine', spread: 40 },
    envelope: { attack: 0.3, decay: 0.4, sustain: 0.8, release: 2.5 },
    effects: {
      reverb: { decay: 4, wet: 0.5 },
      chorus: { depth: 0.7, frequency: 2, wet: 0.4 },
      eq: { low: 3, mid: 1, high: 2 },
      compression: { threshold: -25, ratio: 5, attack: 0.05, release: 0.4 },
      distortion: { distortion: 0.2, wet: 0.15 },
    },
    volume: -15,
  },
  'Vintage OP': {
    oscillator: { type: 'sawtooth', spread: 25 },
    envelope: { attack: 0.04, decay: 0.15, sustain: 0.6, release: 0.8 },
    effects: {
      reverb: { decay: 1.8, wet: 0.25 },
      chorus: { depth: 0.5, frequency: 3.5, wet: 0.3 },
      eq: { low: 2, mid: -1, high: 1 },
      compression: { threshold: -22, ratio: 4, attack: 0.005, release: 0.2 },
      distortion: { distortion: 0.3, wet: 0.2 },
    },
    volume: -13,
  },
};

export const DEFAULT_PRESET = 'Warm Piano';
```

### `audio/ChordSynth.ts`

```typescript
import * as Tone from 'tone';
import type { SynthSettings } from './types';
import type { MidiNote } from '../domain/types';
import { PRESETS, DEFAULT_PRESET } from './presets';

/**
 * ChordSynth manages a polyphonic synthesizer with effects chain.
 *
 * Signal chain: Synth → Distortion → Compressor → EQ → Chorus → Reverb → Out
 */
export class ChordSynth {
  private synth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private chorus: Tone.Chorus | null = null;
  private eq: Tone.EQ3 | null = null;
  private compressor: Tone.Compressor | null = null;
  private distortion: Tone.Distortion | null = null;
  private initialized = false;

  async initialize(settings: SynthSettings = PRESETS[DEFAULT_PRESET]): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    // Build effects chain (end to start)
    this.reverb = new Tone.Reverb(settings.effects.reverb).toDestination();
    this.chorus = new Tone.Chorus(settings.effects.chorus).connect(this.reverb);
    this.eq = new Tone.EQ3(settings.effects.eq).connect(this.chorus);
    this.compressor = new Tone.Compressor(settings.effects.compression).connect(this.eq);
    this.distortion = new Tone.Distortion(settings.effects.distortion).connect(this.compressor);

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: settings.oscillator.type },
      envelope: settings.envelope,
    }).connect(this.distortion);

    this.synth.volume.value = settings.volume;
    this.initialized = true;
  }

  /**
   * Play a chord (array of MIDI notes)
   */
  playChord(notes: MidiNote[]): void {
    if (!this.synth) return;

    this.synth.releaseAll();

    if (notes.length === 0) return;

    const frequencies = notes.map(note => Tone.Frequency(note, 'midi').toFrequency());
    this.synth.triggerAttack(frequencies);
  }

  /**
   * Release all notes
   */
  release(): void {
    this.synth?.releaseAll();
  }

  /**
   * Update synth settings
   */
  updateSettings(settings: Partial<SynthSettings>): void {
    if (!this.synth) return;

    if (settings.oscillator) {
      this.synth.set({ oscillator: { type: settings.oscillator.type } });
    }
    if (settings.envelope) {
      this.synth.set({ envelope: settings.envelope });
    }
    if (settings.volume !== undefined) {
      this.synth.volume.value = settings.volume;
    }
    if (settings.effects) {
      const { reverb, chorus, eq, compression, distortion } = settings.effects;
      if (reverb) this.reverb?.set(reverb);
      if (chorus) this.chorus?.set(chorus);
      if (eq) this.eq?.set(eq);
      if (compression) this.compressor?.set(compression);
      if (distortion) this.distortion?.set(distortion);
    }
  }

  /**
   * Apply a preset by name
   */
  applyPreset(name: string): void {
    const preset = PRESETS[name];
    if (preset) this.updateSettings(preset);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.synth?.dispose();
    this.reverb?.dispose();
    this.chorus?.dispose();
    this.eq?.dispose();
    this.compressor?.dispose();
    this.distortion?.dispose();
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
```

### `audio/DrumKit.ts`

```typescript
import * as Tone from 'tone';
import type { DrumSound, DrumEvent } from './types';

const DRUM_SAMPLES: Record<DrumSound, string> = {
  kick: '/sounds/kick.wav',
  snare: '/sounds/snare.wav',
  hihat: '/sounds/hihat.wav',
  openhat: '/sounds/openhat.wav',
  crash: '/sounds/crash.wav',
  rimshot: '/sounds/rimshot.wav',
  clap: '/sounds/clap.wav',
};

/**
 * DrumKit manages drum sample playback and recording.
 */
export class DrumKit {
  private players = new Map<DrumSound, Tone.Player>();
  private output: Tone.Channel;
  private initialized = false;

  // Recording state
  private recording = false;
  private recordStartTime = 0;
  private recordedEvents: DrumEvent[] = [];

  constructor() {
    this.output = new Tone.Channel().toDestination();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    const loadPromises = Object.entries(DRUM_SAMPLES).map(([name, path]) => {
      return new Promise<void>((resolve, reject) => {
        const player = new Tone.Player({
          url: path,
          onload: () => resolve(),
          onerror: reject,
        }).connect(this.output);

        this.players.set(name as DrumSound, player);
      });
    });

    await Promise.all(loadPromises);
    this.initialized = true;
  }

  /**
   * Trigger a drum sound
   */
  trigger(sound: DrumSound): void {
    if (!this.initialized) return;

    const player = this.players.get(sound);
    if (!player) return;

    // Record if recording
    if (this.recording) {
      this.recordedEvents.push({
        time: Tone.now() - this.recordStartTime,
        sound,
      });
    }

    player.stop();
    player.start();
  }

  /**
   * Start recording drum hits
   */
  startRecording(): void {
    this.recordStartTime = Tone.now();
    this.recordedEvents = [];
    this.recording = true;
  }

  /**
   * Stop recording and return events
   */
  stopRecording(): DrumEvent[] {
    this.recording = false;
    return [...this.recordedEvents];
  }

  /**
   * Quantize events to a grid (e.g., 16th notes)
   */
  quantize(events: DrumEvent[], gridSize: number, bpm: number): DrumEvent[] {
    const gridInterval = 60 / (bpm * (gridSize / 4));

    return events.map(event => ({
      ...event,
      time: Math.round(event.time / gridInterval) * gridInterval,
    }));
  }

  /**
   * Play back recorded events
   */
  playEvents(events: DrumEvent[]): void {
    const startTime = Tone.now();

    for (const event of events) {
      const player = this.players.get(event.sound);
      if (player) {
        player.start(startTime + event.time);
      }
    }
  }

  dispose(): void {
    this.players.forEach(p => p.dispose());
    this.output.dispose();
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
```

---

## State Layer Specification

### `state/AudioContext.tsx`

```typescript
import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react';
import { ChordSynth } from '../audio/ChordSynth';
import { DrumKit } from '../audio/DrumKit';
import type { SynthSettings } from '../audio/types';
import { PRESETS, DEFAULT_PRESET } from '../audio/presets';

interface AudioContextValue {
  // Initialization
  initialized: boolean;
  initialize: () => Promise<void>;

  // Chord synth
  chordSynth: ChordSynth;
  synthSettings: SynthSettings;
  setSynthSettings: (settings: Partial<SynthSettings>) => void;
  currentPreset: string;
  setPreset: (name: string) => void;

  // Drum kit
  drumKit: DrumKit;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const chordSynthRef = useRef(new ChordSynth());
  const drumKitRef = useRef(new DrumKit());

  const [initialized, setInitialized] = useState(false);
  const [synthSettings, setSynthSettingsState] = useState<SynthSettings>(PRESETS[DEFAULT_PRESET]);
  const [currentPreset, setCurrentPreset] = useState(DEFAULT_PRESET);

  const initialize = useCallback(async () => {
    if (initialized) return;

    await Promise.all([
      chordSynthRef.current.initialize(synthSettings),
      drumKitRef.current.initialize(),
    ]);

    setInitialized(true);
  }, [initialized, synthSettings]);

  const setSynthSettings = useCallback((settings: Partial<SynthSettings>) => {
    setSynthSettingsState(prev => ({ ...prev, ...settings }));
    chordSynthRef.current.updateSettings(settings);
  }, []);

  const setPreset = useCallback((name: string) => {
    const preset = PRESETS[name];
    if (preset) {
      setSynthSettingsState(preset);
      chordSynthRef.current.applyPreset(name);
      setCurrentPreset(name);
    }
  }, []);

  return (
    <AudioContext.Provider value={{
      initialized,
      initialize,
      chordSynth: chordSynthRef.current,
      synthSettings,
      setSynthSettings,
      currentPreset,
      setPreset,
      drumKit: drumKitRef.current,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
}
```

### `state/KeyboardContext.tsx`

```typescript
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface KeyboardContextValue {
  pressedKeys: Set<string>;
  addKey: (key: string) => void;
  removeKey: (key: string) => void;
  clearKeys: () => void;
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null);

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const addKey = useCallback((key: string) => {
    setPressedKeys(prev => new Set(prev).add(key.toLowerCase()));
  }, []);

  const removeKey = useCallback((key: string) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(key.toLowerCase());
      return next;
    });
  }, []);

  const clearKeys = useCallback(() => {
    setPressedKeys(new Set());
  }, []);

  // Handle blur to clear keys when window loses focus
  useEffect(() => {
    const handleBlur = () => clearKeys();
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [clearKeys]);

  return (
    <KeyboardContext.Provider value={{ pressedKeys, addKey, removeKey, clearKeys }}>
      {children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (!context) throw new Error('useKeyboard must be used within KeyboardProvider');
  return context;
}
```

### `state/StorageContext.tsx`

```typescript
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { QualityKeyMapping } from '../domain/types';
import type { SynthSettings } from '../audio/types';
import { createDefaultQualityMappings } from '../domain/keyMapping';
import { PRESETS, DEFAULT_PRESET } from '../audio/presets';

interface StoredSettings {
  qualityMappings: QualityKeyMapping[];
  synthSettings: SynthSettings;
  currentPreset: string;
}

const STORAGE_KEY = 'harmonic-keyboard-settings';

const DEFAULT_SETTINGS: StoredSettings = {
  qualityMappings: createDefaultQualityMappings(),
  synthSettings: PRESETS[DEFAULT_PRESET],
  currentPreset: DEFAULT_PRESET,
};

interface StorageContextValue {
  settings: StoredSettings;
  updateSettings: (update: Partial<StoredSettings>) => void;
  resetSettings: () => void;
}

const StorageContext = createContext<StorageContextValue | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSettings = useCallback((update: Partial<StoredSettings>) => {
    setSettings(prev => ({ ...prev, ...update }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <StorageContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used within StorageProvider');
  return context;
}
```

---

## Hooks Specification

### `hooks/useChordPlayer.ts`

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { useKeyboard } from '../state/KeyboardContext';
import { useAudio } from '../state/AudioContext';
import { useStorage } from '../state/StorageContext';
import { parseKeyboardState } from '../domain/keyMapping';
import { generateVoicing } from '../domain/voiceLeading';
import type { ChordVoicing } from '../domain/types';

interface UseChordPlayerOptions {
  enabled: boolean;  // Only active when piano instrument is selected
}

export function useChordPlayer({ enabled }: UseChordPlayerOptions) {
  const { pressedKeys, addKey, removeKey } = useKeyboard();
  const { initialized, initialize, chordSynth } = useAudio();
  const { settings } = useStorage();

  const prevVoicingRef = useRef<ChordVoicing | null>(null);
  const currentVoicingRef = useRef<ChordVoicing | null>(null);

  // Update voicing when keys change
  useEffect(() => {
    if (!enabled || !initialized) return;

    const intent = parseKeyboardState(pressedKeys, settings.qualityMappings);

    if (!intent) {
      chordSynth.release();
      prevVoicingRef.current = currentVoicingRef.current;
      currentVoicingRef.current = null;
      return;
    }

    const voicing = generateVoicing(intent, prevVoicingRef.current);
    currentVoicingRef.current = voicing;
    chordSynth.playChord(voicing.notes);
  }, [pressedKeys, enabled, initialized, settings.qualityMappings, chordSynth]);

  // Keyboard event handlers
  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (!enabled || e.repeat) return;

    if (!initialized) {
      await initialize();
    }

    addKey(e.key);
  }, [enabled, initialized, initialize, addKey]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    removeKey(e.key);
  }, [enabled, removeKey]);

  // Attach listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  return {
    currentVoicing: currentVoicingRef.current,
  };
}
```

### `hooks/useDrumPlayer.ts`

```typescript
import { useEffect, useCallback, useState } from 'react';
import { useAudio } from '../state/AudioContext';
import type { DrumSound, DrumEvent } from '../audio/types';

const DRUM_KEY_MAP: Record<string, DrumSound> = {
  'a': 'kick',
  's': 'snare',
  'd': 'hihat',
  'f': 'openhat',
  'g': 'crash',
  'h': 'rimshot',
  'j': 'clap',
};

interface UseDrumPlayerOptions {
  enabled: boolean;
}

type LoopState = 'idle' | 'recording' | 'playing' | 'overdubbing';

export function useDrumPlayer({ enabled }: UseDrumPlayerOptions) {
  const { initialized, initialize, drumKit } = useAudio();

  const [loopState, setLoopState] = useState<LoopState>('idle');
  const [recordedEvents, setRecordedEvents] = useState<DrumEvent[]>([]);
  const [loopDuration, setLoopDuration] = useState(0);

  // Trigger a drum sound
  const triggerDrum = useCallback((sound: DrumSound) => {
    if (!initialized) return;
    drumKit.trigger(sound);
  }, [initialized, drumKit]);

  // Keyboard handler
  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (!enabled || e.repeat) return;

    const sound = DRUM_KEY_MAP[e.key.toLowerCase()];
    if (!sound) return;

    if (!initialized) {
      await initialize();
    }

    triggerDrum(sound);
  }, [enabled, initialized, initialize, triggerDrum]);

  // Space bar for loop control
  const handleSpace = useCallback((e: KeyboardEvent) => {
    if (!enabled || e.key !== ' ') return;
    e.preventDefault();

    switch (loopState) {
      case 'idle':
        drumKit.startRecording();
        setLoopState('recording');
        break;
      case 'recording':
        const events = drumKit.stopRecording();
        setRecordedEvents(events);
        setLoopDuration(events.length > 0 ? events[events.length - 1].time + 0.5 : 4);
        setLoopState('playing');
        break;
      case 'playing':
        drumKit.startRecording();
        setLoopState('overdubbing');
        break;
      case 'overdubbing':
        const newEvents = drumKit.stopRecording();
        setRecordedEvents(prev => [...prev, ...newEvents]);
        setLoopState('playing');
        break;
    }
  }, [enabled, loopState, drumKit]);

  // Quantize recorded events
  const quantize = useCallback((gridSize: number = 16, bpm: number = 120) => {
    setRecordedEvents(prev => drumKit.quantize(prev, gridSize, bpm));
  }, [drumKit]);

  // Clear loop
  const clearLoop = useCallback(() => {
    setRecordedEvents([]);
    setLoopDuration(0);
    setLoopState('idle');
  }, []);

  // Attach listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleSpace);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleSpace);
    };
  }, [enabled, handleKeyDown, handleSpace]);

  return {
    loopState,
    recordedEvents,
    loopDuration,
    triggerDrum,
    quantize,
    clearLoop,
  };
}
```

---

## Component Specifications

### `components/App.tsx`

```typescript
import { useState } from 'react';
import { AudioProvider } from '../state/AudioContext';
import { KeyboardProvider } from '../state/KeyboardContext';
import { StorageProvider } from '../state/StorageContext';
import { Layout } from './Layout';
import { PianoView } from './piano/PianoView';
import { DrumView } from './drums/DrumView';

type Instrument = 'piano' | 'drums';

export function App() {
  const [instrument, setInstrument] = useState<Instrument>('piano');

  return (
    <StorageProvider>
      <AudioProvider>
        <KeyboardProvider>
          <Layout instrument={instrument} onInstrumentChange={setInstrument}>
            {instrument === 'piano' ? <PianoView /> : <DrumView />}
          </Layout>
        </KeyboardProvider>
      </AudioProvider>
    </StorageProvider>
  );
}
```

### Component Size Guidelines

Each component should be **under 150 lines**. If larger, split into sub-components.

| Component | Responsibility | Max Lines |
|-----------|---------------|-----------|
| `Layout.tsx` | Header, navigation, modals | 100 |
| `PianoView.tsx` | Piano instrument container | 50 |
| `ChordDisplay.tsx` | Show current chord name/notes | 80 |
| `KeyboardGuide.tsx` | Visual keyboard layout | 120 |
| `DrumView.tsx` | Drum machine container | 50 |
| `DrumPad.tsx` | Single drum pad | 40 |
| `LoopRecorder.tsx` | Recording/playback controls | 80 |
| `SettingsDialog.tsx` | Settings modal container | 60 |
| `SoundControls.tsx` | Synth/effects controls | 150 |
| `KeyMappingEditor.tsx` | Quality key configuration | 100 |

---

## Implementation Notes

### What to Keep from Original

1. **Voice leading algorithm** - The core logic is sound, just needs cleanup
2. **Keyboard mapping concept** - The 3-dimensional chord control is great
3. **Audio presets** - The 5 presets sound good
4. **Drum samples** - Reuse the .wav files

### What to Remove

1. **57 unused shadcn/ui components** - Only include what's actually used
2. **Server/backend code** - This is a pure client-side app
3. **Drizzle ORM** - Not needed
4. **React Query** - Overkill for this app
5. **Sheet music panel** - Not implemented, remove

### Key Differences from Original

| Aspect | Original | New |
|--------|----------|-----|
| Keyboard state | Global mutable `Set` | React Context |
| Audio init | Scattered in components | Centralized in AudioProvider |
| Settings | Not persisted | localStorage via StorageContext |
| Types | Spread across files | Single `types.ts` |
| Constants | Magic numbers inline | `constants.ts` |
| Chord intervals | Duplicated | Single source of truth |
| Components | 400+ line files | Max 150 lines each |

---

## Testing Requirements

### Unit Tests (domain/)

```typescript
// domain/__tests__/voiceLeading.test.ts
describe('generateVoicing', () => {
  it('creates initial voicing without previous chord');
  it('minimizes voice movement from previous chord');
  it('keeps all voices within range');
  it('handles all chord qualities');
  it('handles all inversions');
});

// domain/__tests__/chord.test.ts
describe('calculateRootFromBass', () => {
  it('returns bass note for root position');
  it('calculates root from 1st inversion');
  it('calculates root from 2nd inversion');
  it('calculates root from 3rd inversion');
});

// domain/__tests__/keyMapping.test.ts
describe('parseKeyboardState', () => {
  it('returns null when no bass key pressed');
  it('returns major chord by default');
  it('uses quality key when pressed');
  it('uses inversion key when pressed');
});
```

---

## File Count Comparison

| Category | Original | New |
|----------|----------|-----|
| Domain logic | 5 files | 4 files |
| Audio | 2 files | 4 files |
| State | 1 file | 3 files |
| Hooks | 1 file | 3 files |
| Components | 72 files | ~15 files |
| **Total** | **~80 files** | **~30 files** |

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tone": "^15.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^5.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^2.0.0"
  }
}
```

**Removed dependencies:**
- `@tanstack/react-query` (overkill)
- `wouter` (single page, no routing needed)
- `framer-motion` (use CSS transitions)
- `drizzle-orm` (no backend)
- `express` (no backend)
- 40+ Radix UI packages (only include what's used)

---

## Summary

This specification describes a clean rewrite that:

1. **Preserves the core innovation** - The 3-dimensional chord control with voice leading
2. **Fixes architectural issues** - Proper React state management, clean separation
3. **Reduces complexity** - ~30 files instead of ~80, ~150 line max per component
4. **Adds missing features** - Settings persistence, proper error handling
5. **Is fully testable** - Pure domain logic with no side effects
6. **Is maintainable** - Clear boundaries, single sources of truth

The implementing agent should follow this spec exactly, starting with the domain layer (pure TypeScript, no dependencies), then audio, then state, then hooks, then components.
