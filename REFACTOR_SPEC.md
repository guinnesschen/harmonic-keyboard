# Harmonic Keyboard - Clean Architecture Specification

## Executive Summary

This document specifies a complete rewrite of the Harmonic Keyboard application using clean architecture principles. The original codebase was "vibe coded" during feature discovery. Now that requirements are clear, we can design an elegant, maintainable system from scratch.

---

## Core Concept

The Harmonic Keyboard is a digital instrument that abstracts away individual notes, allowing musicians to think and play directly in terms of **chords and harmony**.

### Control System (Stenograph-Style)
- **Bass Notes**: `zsxdcvgbhnjm,l.;/` (17 chromatic keys)
- **Chord Quality**: `QWERTYUIOP567` (13 chord types: Major, Minor, Dom7, etc.)
- **Inversions**: `0-4` (root position, 1st, 2nd, 3rd inversion)

### Intelligence Layer
- **Automatic Voice Leading**: Uses Wasserstein distance optimization to find chord voicings with minimal voice movement
- **5-Voice Voicings**: [bass, voice1, voice2, voice3, voice4] spanning C3-C6
- **Real-time Audio Synthesis**: Tone.js-based synthesis with configurable effects chain

### Secondary Feature
- **Boss-Style Loop Pedal**: Record, overdub, quantize drum patterns with visual waveform display

---

## Architecture Principles

1. **Zero Global Mutable State** - All state in React Context or Zustand stores
2. **Pure Functions** - Music theory and algorithms are side-effect free
3. **Single Responsibility** - Each module/component has one clear purpose
4. **Dependency Injection** - Audio engines are singletons, injected via context
5. **Type Safety First** - Comprehensive TypeScript with no `any` types
6. **Testability** - All core logic unit tested
7. **Performance** - Memoization, debouncing, optimized algorithms

---

## Directory Structure

```
src/
├── core/                          # Pure business logic (ZERO React/UI dependencies)
│   ├── music/
│   │   ├── theory.ts             # Single source of truth for chords, intervals
│   │   ├── voiceLeading.ts       # Voice leading algorithm (optimized)
│   │   ├── keyboardLayout.ts     # Key mapping constants
│   │   └── noteUtils.ts          # MIDI/frequency conversions
│   │
│   ├── keyboard/
│   │   ├── KeyboardState.ts      # Keyboard state machine (immutable)
│   │   ├── ChordParser.ts        # Parse pressed keys → chord intent
│   │   └── types.ts              # Core types
│   │
│   └── constants.ts              # All magic numbers centralized
│
├── audio/                        # Audio engines (Singleton classes)
│   ├── AudioEngine.ts            # Main audio context manager (singleton)
│   ├── HarmonicSynthesizer.ts   # Chord synthesis engine
│   ├── DrumRecorder.ts           # Loop pedal engine
│   ├── EffectsChain.ts           # Modular effects system
│   └── presets.ts                # Sound presets
│
├── state/                        # State management
│   ├── stores/
│   │   ├── keyboardStore.ts     # Keyboard state (Zustand)
│   │   ├── audioStore.ts        # Audio state (Zustand)
│   │   ├── settingsStore.ts     # Settings with localStorage persistence
│   │   └── drumStore.ts         # Drum machine state
│   │
│   └── hooks/
│       ├── useKeyboardInput.ts  # Keyboard event handling
│       ├── useChordPlayback.ts  # Chord generation + playback
│       ├── useAudioInit.ts      # Audio initialization
│       └── useDrumRecorder.ts   # Drum recording logic
│
├── components/                   # React components (small, focused)
│   ├── instrument/
│   │   ├── HarmonicKeyboard.tsx     # Main keyboard instrument
│   │   ├── ChordDisplay.tsx         # Chord name display
│   │   ├── KeyboardGuide.tsx        # Visual keyboard hints
│   │   └── PianoVisualization.tsx   # Piano keyboard visual
│   │
│   ├── drums/
│   │   ├── DrumMachine.tsx          # Loop pedal interface
│   │   ├── WaveformDisplay.tsx      # Audio waveform + progress
│   │   ├── RecordButton.tsx         # Record control
│   │   └── QuantizeButton.tsx       # Quantize control
│   │
│   ├── settings/
│   │   ├── SettingsModal.tsx        # Settings dialog
│   │   ├── SoundControls.tsx        # Audio parameters
│   │   └── PresetSelector.tsx       # Sound preset picker
│   │
│   ├── layout/
│   │   ├── AppLayout.tsx            # Main layout
│   │   └── Header.tsx               # Top navigation
│   │
│   └── ui/                          # Keep existing shadcn/ui components
│
├── lib/
│   ├── utils.ts                 # General utilities
│   └── errors.ts                # Error types and boundaries
│
├── App.tsx                      # Root component
└── main.tsx                     # Entry point
```

---

## Detailed Module Specifications

### 1. Core Music Layer (`core/music/`)

#### `theory.ts` - Single Source of Truth
```typescript
/**
 * Core music theory definitions
 * - All chord intervals defined once
 * - Note name conversions
 * - Pitch class arithmetic
 */

export const ChordQuality = {
  Major: 'major',
  Minor: 'minor',
  Dominant7: 'dominant7',
  Minor7: 'minor7',
  Major7: 'major7',
  Diminished7: 'diminished7',
  HalfDiminished7: 'halfdiminished7',
  DomSus: 'domsus',
  Sus: 'sus',
  Aug: 'aug',
  MinMaj7: 'minmaj7',
  Add9: 'add9',
  MinAdd9: 'minadd9',
} as const;

export type ChordQuality = typeof ChordQuality[keyof typeof ChordQuality];

export const ChordPosition = {
  Root: 'root',
  First: 'first',
  Second: 'second',
  Third: 'third',
} as const;

export type ChordPosition = typeof ChordPosition[keyof typeof ChordPosition];

// Chord intervals (semitones from root)
export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  [ChordQuality.Major]: [0, 4, 7],
  [ChordQuality.Minor]: [0, 3, 7],
  [ChordQuality.Dominant7]: [0, 4, 7, 10],
  [ChordQuality.Minor7]: [0, 3, 7, 10],
  [ChordQuality.Major7]: [0, 4, 7, 11],
  [ChordQuality.Diminished7]: [0, 3, 6, 9],
  [ChordQuality.HalfDiminished7]: [0, 3, 6, 10],
  [ChordQuality.DomSus]: [0, 5, 7, 10],
  [ChordQuality.Sus]: [0, 5, 7],
  [ChordQuality.Aug]: [0, 4, 8],
  [ChordQuality.MinMaj7]: [0, 3, 7, 11],
  [ChordQuality.Add9]: [0, 2, 4, 7],
  [ChordQuality.MinAdd9]: [0, 2, 3, 7],
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export interface ChordIntent {
  root: number;        // Pitch class (0-11)
  bass: number;        // MIDI note (48-84)
  quality: ChordQuality;
  position: ChordPosition;
}

export interface ChordVoicing extends ChordIntent {
  notes: number[];     // 5 MIDI notes
}

// Pure functions for chord theory
export function getChordIntervals(quality: ChordQuality): readonly number[] {
  return CHORD_INTERVALS[quality];
}

export function midiToNoteName(midi: number): string {
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}

export function noteNameToMidi(noteName: string): number {
  const note = noteName.slice(0, -1);
  const octave = parseInt(noteName.slice(-1));
  const pitchClass = NOTE_NAMES.indexOf(note as typeof NOTE_NAMES[number]);
  if (pitchClass === -1) throw new Error(`Invalid note name: ${noteName}`);
  return pitchClass + (octave + 1) * 12;
}

export function normalizePitchClass(pc: number): number {
  return ((pc % 12) + 12) % 12;
}
```

#### `voiceLeading.ts` - Optimized Voice Leading
```typescript
/**
 * Voice leading algorithm with optimizations
 * - Caches voicing generation results
 * - Uses pruning to reduce search space
 * - Implements Wasserstein distance for minimal movement
 */

import { ChordIntent, ChordVoicing, getChordIntervals } from './theory';
import { VOICING_RANGE, VOICE_COUNT } from '../constants';

// Voicing cache for performance
const voicingCache = new Map<string, number[][]>();

function getCacheKey(bassMidi: number, quality: string): string {
  return `${bassMidi}-${quality}`;
}

/**
 * Generate all valid voicings for a chord
 * Optimizations:
 * - Cache results per bass note + quality
 * - Early termination when max voicings reached
 * - Prune voicings with extreme spreads
 */
export function generateAllVoicings(
  bassMidi: number,
  chordTones: number[],
  quality: string
): number[][] {
  const cacheKey = getCacheKey(bassMidi, quality);
  if (voicingCache.has(cacheKey)) {
    return voicingCache.get(cacheKey)!;
  }

  const voicings: number[][] = [];
  const bassPitchClass = bassMidi % 12;

  // Ensure bass is in valid range
  let bass = bassMidi;
  while (bass < VOICING_RANGE.MIN) bass += 12;
  while (bass > VOICING_RANGE.MAX - 24) bass -= 12; // Leave room for upper voices

  function generateUpperVoices(current: number[], lastNote: number): void {
    if (current.length === VOICE_COUNT) {
      voicings.push([...current]);
      return;
    }

    // Try each chord tone in all valid octaves
    for (const tone of chordTones) {
      let note = lastNote + 1 + ((12 - ((lastNote + 1) % 12) + tone) % 12);

      while (note <= VOICING_RANGE.MAX) {
        // Prune: skip if spread between voices is too large (> 12 semitones)
        if (note - lastNote <= 12) {
          generateUpperVoices([...current, note], note);
        }
        note += 12;
      }
    }
  }

  generateUpperVoices([bass], bass);
  voicingCache.set(cacheKey, voicings);
  return voicings;
}

/**
 * Calculate movement cost using Wasserstein distance
 * Finds optimal voice assignment via permutations
 */
function calculateMovementCost(prevNotes: number[], nextNotes: number[]): number {
  // Bass movement is fixed
  const bassCost = Math.abs(prevNotes[0] - nextNotes[0]);

  // Find optimal upper voice assignment
  const prevUpper = prevNotes.slice(1);
  const nextUpper = nextNotes.slice(1);

  let minCost = Infinity;

  // Generate all permutations and find minimum
  function permute(arr: number[], l: number, r: number): void {
    if (l === r) {
      let cost = 0;
      for (let i = 0; i < prevUpper.length; i++) {
        cost += Math.abs(prevUpper[i] - arr[i]);
      }
      minCost = Math.min(minCost, cost);
    } else {
      for (let i = l; i <= r; i++) {
        [arr[l], arr[i]] = [arr[i], arr[l]];
        permute(arr, l + 1, r);
        [arr[l], arr[i]] = [arr[i], arr[l]];
      }
    }
  }

  permute([...nextUpper], 0, nextUpper.length - 1);
  return bassCost + minCost;
}

/**
 * Create initial evenly-spaced voicing (used for first chord)
 */
function createInitialVoicing(bassMidi: number, chordTones: number[]): number[] {
  const voicing = [bassMidi];
  let lastNote = bassMidi;

  // Space voices roughly by major thirds (4 semitones)
  for (let i = 1; i < VOICE_COUNT; i++) {
    const tone = chordTones[i % chordTones.length];
    let note = lastNote + 4; // Target major third spacing

    // Find closest chord tone above target
    while ((note % 12) !== tone) {
      note++;
      if (note > VOICING_RANGE.MAX) {
        note = lastNote + 1 + ((12 - ((lastNote + 1) % 12) + tone) % 12);
        break;
      }
    }

    voicing.push(Math.min(note, VOICING_RANGE.MAX));
    lastNote = note;
  }

  return voicing;
}

/**
 * Generate optimal voicing for a chord intent
 * Uses previous voicing to minimize voice movement
 */
export function generateOptimalVoicing(
  intent: ChordIntent,
  previousVoicing: ChordVoicing | null
): ChordVoicing {
  const intervals = getChordIntervals(intent.quality);
  const chordTones = [...new Set(intervals.map(i => (intent.root + i) % 12))];

  // First chord: use evenly-spaced voicing
  if (!previousVoicing || previousVoicing.notes.length === 0) {
    return {
      ...intent,
      notes: createInitialVoicing(intent.bass, chordTones),
    };
  }

  // Generate all valid voicings
  const allVoicings = generateAllVoicings(intent.bass, chordTones, intent.quality);

  if (allVoicings.length === 0) {
    return {
      ...intent,
      notes: createInitialVoicing(intent.bass, chordTones),
    };
  }

  // Find voicing with minimal movement
  let bestVoicing = allVoicings[0];
  let minCost = calculateMovementCost(previousVoicing.notes, bestVoicing);

  for (const voicing of allVoicings) {
    const cost = calculateMovementCost(previousVoicing.notes, voicing);
    if (cost < minCost) {
      minCost = cost;
      bestVoicing = voicing;
    }
  }

  return {
    ...intent,
    notes: bestVoicing,
  };
}

// Export cache clearing for testing
export function clearVoicingCache(): void {
  voicingCache.clear();
}
```

#### `keyboardLayout.ts` - Key Mappings
```typescript
/**
 * Keyboard layout and mapping constants
 * Defines the physical keyboard layout for the instrument
 */

import { ChordQuality, ChordPosition } from './theory';

export const BASS_KEYS = 'zsxdcvgbhnjm,l.;/' as const;
export const POSITION_KEYS = '01234' as const;

// Default quality mappings (configurable by user)
export interface QualityKeyMapping {
  key: string;
  quality: ChordQuality;
  label: string;
  enabled: boolean;
}

export const DEFAULT_QUALITY_MAPPINGS: QualityKeyMapping[] = [
  { key: 'Q', quality: ChordQuality.Major, label: 'Major', enabled: true },
  { key: 'W', quality: ChordQuality.Major7, label: 'Maj7', enabled: true },
  { key: 'E', quality: ChordQuality.Dominant7, label: 'Dom7', enabled: true },
  { key: 'R', quality: ChordQuality.Minor, label: 'Minor', enabled: true },
  { key: 'T', quality: ChordQuality.Minor7, label: 'Min7', enabled: true },
  { key: 'Y', quality: ChordQuality.Diminished7, label: 'Dim7', enabled: true },
  { key: 'U', quality: ChordQuality.HalfDiminished7, label: 'ø7', enabled: true },
  { key: 'I', quality: ChordQuality.DomSus, label: 'Dom Sus', enabled: true },
  { key: 'O', quality: ChordQuality.Sus, label: 'Sus', enabled: true },
  { key: 'P', quality: ChordQuality.Aug, label: 'Aug', enabled: true },
  { key: '5', quality: ChordQuality.MinMaj7, label: 'MinMaj7', enabled: true },
  { key: '6', quality: ChordQuality.Add9, label: 'Add9', enabled: true },
  { key: '7', quality: ChordQuality.MinAdd9, label: 'Min Add9', enabled: true },
];

// Default quality per position (context-sensitive defaults)
export type PositionDefaults = Record<ChordPosition, Record<number, ChordQuality>>;

export const POSITION_DEFAULT_QUALITIES: PositionDefaults = {
  [ChordPosition.Root]: {
    0: ChordQuality.Major,      // C
    1: ChordQuality.Minor,      // C#
    2: ChordQuality.Minor,      // D
    3: ChordQuality.Major,      // D#
    4: ChordQuality.Minor,      // E
    5: ChordQuality.Major,      // F
    6: ChordQuality.Dominant7,  // F#
    7: ChordQuality.Major,      // G
    8: ChordQuality.Minor,      // G#
    9: ChordQuality.Minor,      // A
    10: ChordQuality.Major,     // A#
    11: ChordQuality.Diminished7, // B
  },
  [ChordPosition.First]: {
    0: ChordQuality.Major,
    1: ChordQuality.Diminished7,
    2: ChordQuality.Minor,
    3: ChordQuality.Major,
    4: ChordQuality.Minor,
    5: ChordQuality.Major,
    6: ChordQuality.Dominant7,
    7: ChordQuality.Major,
    8: ChordQuality.Minor,
    9: ChordQuality.Minor,
    10: ChordQuality.Major,
    11: ChordQuality.Dominant7,
  },
  [ChordPosition.Second]: {
    0: ChordQuality.Major,
    1: ChordQuality.Minor,
    2: ChordQuality.Minor,
    3: ChordQuality.Major,
    4: ChordQuality.Dominant7,
    5: ChordQuality.Major,
    6: ChordQuality.Dominant7,
    7: ChordQuality.Major,
    8: ChordQuality.Minor,
    9: ChordQuality.Minor,
    10: ChordQuality.Major,
    11: ChordQuality.Diminished7,
  },
  [ChordPosition.Third]: {
    0: ChordQuality.Dominant7,
    1: ChordQuality.Dominant7,
    2: ChordQuality.Minor7,
    3: ChordQuality.Dominant7,
    4: ChordQuality.Dominant7,
    5: ChordQuality.Major7,
    6: ChordQuality.Dominant7,
    7: ChordQuality.Dominant7,
    8: ChordQuality.Minor7,
    9: ChordQuality.Minor7,
    10: ChordQuality.Dominant7,
    11: ChordQuality.HalfDiminished7,
  },
};
```

#### `ChordParser.ts` - Parse Keyboard Input
```typescript
/**
 * Parse pressed keys into chord intent
 * Pure function that takes key set, returns chord intent
 */

import { ChordIntent, ChordPosition, ChordQuality, getChordIntervals, normalizePitchClass } from '../music/theory';
import { BASS_KEYS, POSITION_KEYS, QualityKeyMapping, POSITION_DEFAULT_QUALITIES } from '../music/keyboardLayout';

export class ChordParser {
  constructor(private qualityMappings: QualityKeyMapping[]) {}

  /**
   * Parse pressed keys into a chord intent
   * Returns null if no valid chord can be formed
   */
  parse(pressedKeys: Set<string>): ChordIntent | null {
    const keys = Array.from(pressedKeys).map(k => k.toLowerCase());

    // Ignore spacebar
    if (keys.includes(' ')) return null;

    // Find components
    const bassKey = keys.find(k => BASS_KEYS.includes(k));
    const positionKey = keys.find(k => POSITION_KEYS.includes(k));
    const qualityKey = keys.find(k =>
      this.qualityMappings.some(m => m.key.toLowerCase() === k && m.enabled)
    );

    // Must have bass note
    if (!bassKey) return null;

    // Determine position
    const position = this.parsePosition(positionKey);

    // Determine quality
    const quality = qualityKey
      ? this.parseQuality(qualityKey)
      : this.getDefaultQuality(bassKey, position);

    // Calculate bass MIDI note (C3 = 48)
    const bassNote = BASS_KEYS.indexOf(bassKey);
    const bassMidi = 48 + bassNote;

    // Calculate root note from bass + position
    const root = this.calculateRoot(bassMidi, position, quality);

    return {
      root,
      bass: bassMidi,
      quality,
      position,
    };
  }

  private parsePosition(key: string | undefined): ChordPosition {
    if (!key) return ChordPosition.Root;

    const positionMap: Record<string, ChordPosition> = {
      '0': ChordPosition.Root,
      '1': ChordPosition.First,
      '2': ChordPosition.Second,
      '3': ChordPosition.Third,
    };

    return positionMap[key] || ChordPosition.Root;
  }

  private parseQuality(key: string): ChordQuality {
    const mapping = this.qualityMappings.find(
      m => m.key.toLowerCase() === key.toLowerCase() && m.enabled
    );
    return mapping?.quality || ChordQuality.Major;
  }

  private getDefaultQuality(bassKey: string, position: ChordPosition): ChordQuality {
    const bassNote = BASS_KEYS.indexOf(bassKey);
    return POSITION_DEFAULT_QUALITIES[position][bassNote] || ChordQuality.Major;
  }

  private calculateRoot(bassMidi: number, position: ChordPosition, quality: ChordQuality): number {
    const intervals = getChordIntervals(quality);
    const bassPitchClass = bassMidi % 12;

    let offset = 0;
    switch (position) {
      case ChordPosition.First:
        offset = -intervals[1]; // Bass is the 3rd, subtract to get root
        break;
      case ChordPosition.Second:
        offset = -intervals[2]; // Bass is the 5th
        break;
      case ChordPosition.Third:
        offset = -intervals[3]; // Bass is the 7th
        break;
      default:
        offset = 0; // Root position
    }

    return normalizePitchClass(bassPitchClass + offset);
  }

  updateQualityMappings(mappings: QualityKeyMapping[]): void {
    this.qualityMappings = mappings;
  }
}
```

---

### 2. Audio Layer (`audio/`)

#### `AudioEngine.ts` - Singleton Audio Manager
```typescript
/**
 * Singleton audio context manager
 * Ensures single Tone.js context, coordinates all audio
 */

import * as Tone from 'tone';

class AudioEngineClass {
  private initialized = false;
  private context: Tone.BaseContext | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Tone.start();
      this.context = Tone.getContext();
      this.initialized = true;
      console.log('Audio engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw new AudioInitializationError('Could not start audio context', { cause: error });
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getContext(): Tone.BaseContext {
    if (!this.context) {
      throw new AudioInitializationError('Audio engine not initialized');
    }
    return this.context;
  }

  async cleanup(): Promise<void> {
    if (!this.initialized) return;

    await Tone.Transport.stop();
    this.initialized = false;
    this.context = null;
  }
}

export const AudioEngine = new AudioEngineClass();

export class AudioInitializationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AudioInitializationError';
  }
}
```

#### `HarmonicSynthesizer.ts` - Chord Synthesis
```typescript
/**
 * Harmonic synthesizer for chord playback
 * Manages Tone.js PolySynth and effects chain
 */

import * as Tone from 'tone';
import { ChordVoicing } from '../core/music/theory';
import { AudioEngine } from './AudioEngine';
import { EffectsChain, EffectsSettings } from './EffectsChain';

export interface SynthSettings {
  oscillatorType: 'sine' | 'square' | 'triangle' | 'sawtooth';
  oscillatorSpread: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
}

export class HarmonicSynthesizer {
  private synth: Tone.PolySynth | null = null;
  private effectsChain: EffectsChain;
  private currentNotes: number[] = [];

  constructor() {
    this.effectsChain = new EffectsChain();
  }

  async initialize(settings: SynthSettings, effects: EffectsSettings): Promise<void> {
    if (!AudioEngine.isInitialized()) {
      await AudioEngine.initialize();
    }

    // Initialize effects chain
    this.effectsChain.initialize(effects);

    // Create synth
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: settings.oscillatorType,
        spread: settings.oscillatorSpread,
      },
      envelope: {
        attack: settings.attack,
        decay: settings.decay,
        sustain: settings.sustain,
        release: settings.release,
      },
    });

    this.synth.volume.value = settings.volume;
    this.synth.connect(this.effectsChain.getInput());
  }

  playChord(voicing: ChordVoicing | null): void {
    if (!this.synth) {
      console.warn('Synthesizer not initialized');
      return;
    }

    // Release current notes
    this.releaseAll();

    // Play new voicing
    if (voicing && voicing.notes.length > 0) {
      const frequencies = voicing.notes.map(midi =>
        Tone.Frequency(midi, 'midi').toFrequency()
      );

      this.synth.triggerAttack(frequencies);
      this.currentNotes = voicing.notes;
    }
  }

  releaseAll(): void {
    if (this.synth && this.currentNotes.length > 0) {
      this.synth.releaseAll();
      this.currentNotes = [];
    }
  }

  updateSettings(settings: Partial<SynthSettings>): void {
    if (!this.synth) return;

    if (settings.oscillatorType !== undefined) {
      this.synth.set({
        oscillator: { type: settings.oscillatorType },
      });
    }

    if (settings.attack !== undefined || settings.decay !== undefined ||
        settings.sustain !== undefined || settings.release !== undefined) {
      this.synth.set({
        envelope: {
          attack: settings.attack,
          decay: settings.decay,
          sustain: settings.sustain,
          release: settings.release,
        },
      });
    }

    if (settings.volume !== undefined) {
      this.synth.volume.value = settings.volume;
    }
  }

  updateEffects(effects: Partial<EffectsSettings>): void {
    this.effectsChain.updateSettings(effects);
  }

  dispose(): void {
    this.releaseAll();
    this.synth?.dispose();
    this.effectsChain.dispose();
    this.synth = null;
  }
}
```

#### `EffectsChain.ts` - Modular Effects
```typescript
/**
 * Modular effects chain for synthesis
 * Chain: Input → Distortion → EQ → Compressor → Chorus → Reverb → Output
 */

import * as Tone from 'tone';

export interface EffectsSettings {
  reverb: {
    decay: number;
    wet: number;
  };
  chorus: {
    depth: number;
    frequency: number;
    wet: number;
  };
  eq: {
    low: number;
    mid: number;
    high: number;
  };
  compression: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  distortion: {
    amount: number;
    wet: number;
  };
}

export class EffectsChain {
  private input: Tone.Gain;
  private distortion: Tone.Distortion;
  private eq: Tone.EQ3;
  private compressor: Tone.Compressor;
  private chorus: Tone.Chorus;
  private reverb: Tone.Reverb;
  private initialized = false;

  constructor() {
    this.input = new Tone.Gain(1);
    this.distortion = new Tone.Distortion();
    this.eq = new Tone.EQ3();
    this.compressor = new Tone.Compressor();
    this.chorus = new Tone.Chorus();
    this.reverb = new Tone.Reverb();
  }

  initialize(settings: EffectsSettings): void {
    if (this.initialized) return;

    // Setup signal chain
    this.input.connect(this.distortion);
    this.distortion.connect(this.eq);
    this.eq.connect(this.compressor);
    this.compressor.connect(this.chorus);
    this.chorus.connect(this.reverb);
    this.reverb.toDestination();

    // Apply initial settings
    this.updateSettings(settings);
    this.initialized = true;
  }

  getInput(): Tone.Gain {
    return this.input;
  }

  updateSettings(settings: Partial<EffectsSettings>): void {
    if (settings.distortion) {
      this.distortion.set({
        distortion: settings.distortion.amount,
        wet: settings.distortion.wet,
      });
    }

    if (settings.eq) {
      this.eq.set({
        low: settings.eq.low,
        mid: settings.eq.mid,
        high: settings.eq.high,
      });
    }

    if (settings.compression) {
      this.compressor.set(settings.compression);
    }

    if (settings.chorus) {
      this.chorus.set({
        depth: settings.chorus.depth,
        frequency: settings.chorus.frequency,
        wet: settings.chorus.wet,
      });
    }

    if (settings.reverb) {
      this.reverb.set({
        decay: settings.reverb.decay,
        wet: settings.reverb.wet,
      });
    }
  }

  dispose(): void {
    this.input.dispose();
    this.distortion.dispose();
    this.eq.dispose();
    this.compressor.dispose();
    this.chorus.dispose();
    this.reverb.dispose();
  }
}
```

#### `DrumRecorder.ts` - Loop Pedal Engine
```typescript
/**
 * Drum machine / loop pedal engine
 * Boss-style workflow: Record → Play → Overdub
 */

import * as Tone from 'tone';
import { AudioEngine } from './AudioEngine';

export interface DrumSample {
  name: string;
  path: string;
}

export interface MIDIEvent {
  time: number;           // Seconds from loop start
  sample: string;         // Sample name
}

export enum RecorderState {
  Idle = 'idle',
  Recording = 'recording',
  Playing = 'playing',
  Overdubbing = 'overdubbing',
}

export class DrumRecorder {
  private players = new Map<string, Tone.Player>();
  private mixChannel: Tone.Channel;
  private recorder: Tone.Recorder | null = null;

  private state: RecorderState = RecorderState.Idle;
  private midiEvents: MIDIEvent[] = [];
  private recordStartTime = 0;
  private loopDuration = 0;
  private loopStartTime = 0;

  private samples: DrumSample[] = [];
  private initialized = false;

  constructor() {
    this.mixChannel = new Tone.Channel().toDestination();
  }

  async initialize(samples: DrumSample[]): Promise<void> {
    if (this.initialized) return;
    if (!AudioEngine.isInitialized()) {
      await AudioEngine.initialize();
    }

    this.samples = samples;

    // Load all samples
    const loadPromises = samples.map(async (sample) => {
      const player = new Tone.Player({
        url: sample.path,
        onload: () => console.log(`Loaded: ${sample.name}`),
      }).connect(this.mixChannel);

      this.players.set(sample.name, player);
    });

    await Promise.all(loadPromises);
    this.initialized = true;
  }

  // Boss-style workflow
  startRecording(): void {
    this.state = RecorderState.Recording;
    this.midiEvents = [];
    this.recordStartTime = Tone.now();
  }

  stopRecording(): void {
    if (this.state !== RecorderState.Recording) return;

    this.loopDuration = Tone.now() - this.recordStartTime;
    this.state = RecorderState.Playing;
    this.startLoop();
  }

  startOverdub(): void {
    if (this.state !== RecorderState.Playing) return;
    this.state = RecorderState.Overdubbing;
  }

  stopOverdub(): void {
    if (this.state !== RecorderState.Overdubbing) return;
    this.state = RecorderState.Playing;
  }

  stop(): void {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    this.state = RecorderState.Idle;
  }

  clear(): void {
    this.stop();
    this.midiEvents = [];
    this.loopDuration = 0;
  }

  triggerSample(sampleName: string): void {
    const player = this.players.get(sampleName);
    if (!player) return;

    // Record event if recording/overdubbing
    if (this.state === RecorderState.Recording || this.state === RecorderState.Overdubbing) {
      const eventTime = Tone.now() - this.recordStartTime;
      this.midiEvents.push({
        time: this.state === RecorderState.Overdubbing
          ? eventTime % this.loopDuration  // Wrap to loop duration
          : eventTime,
        sample: sampleName,
      });
    }

    // Play immediately
    player.stop();
    player.start();
  }

  quantize(gridSize: 16 | 32 | 64 = 16): void {
    if (this.midiEvents.length === 0 || this.loopDuration === 0) return;

    const bpm = Tone.Transport.bpm.value;
    const gridInterval = (60 / bpm) * (4 / (gridSize / 4));

    this.midiEvents = this.midiEvents.map(event => ({
      ...event,
      time: Math.round(event.time / gridInterval) * gridInterval,
    }));

    // Restart loop with quantized events
    if (this.state === RecorderState.Playing || this.state === RecorderState.Overdubbing) {
      this.stop();
      this.startLoop();
    }
  }

  private startLoop(): void {
    if (this.midiEvents.length === 0) return;

    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Schedule all events in a loop
    this.midiEvents.forEach(event => {
      Tone.Transport.schedule(() => {
        const player = this.players.get(event.sample);
        player?.start();
      }, event.time);
    });

    Tone.Transport.setLoopPoints(0, this.loopDuration);
    Tone.Transport.loop = true;
    Tone.Transport.start();
  }

  getState(): RecorderState {
    return this.state;
  }

  getMIDIEvents(): MIDIEvent[] {
    return [...this.midiEvents];
  }

  getLoopDuration(): number {
    return this.loopDuration;
  }

  dispose(): void {
    this.stop();
    this.players.forEach(player => player.dispose());
    this.mixChannel.dispose();
    this.recorder?.dispose();
  }
}
```

#### `presets.ts` - Sound Presets
```typescript
/**
 * Sound presets for the synthesizer
 */

import { SynthSettings } from './HarmonicSynthesizer';
import { EffectsSettings } from './EffectsChain';

export interface SoundPreset {
  synth: SynthSettings;
  effects: EffectsSettings;
}

export const SOUND_PRESETS: Record<string, SoundPreset> = {
  'Warm Piano': {
    synth: {
      oscillatorType: 'triangle',
      oscillatorSpread: 15,
      attack: 0.05,
      decay: 0.1,
      sustain: 0.7,
      release: 0.8,
      volume: -12,
    },
    effects: {
      distortion: { amount: 0.2, wet: 0.1 },
      eq: { low: 2, mid: 0, high: -2 },
      compression: { threshold: -20, ratio: 4, attack: 0.003, release: 0.25 },
      chorus: { depth: 0.3, frequency: 2.5, wet: 0.2 },
      reverb: { decay: 1.5, wet: 0.3 },
    },
  },
  'Digital Clear': {
    synth: {
      oscillatorType: 'sine',
      oscillatorSpread: 5,
      attack: 0.02,
      decay: 0.1,
      sustain: 0.8,
      release: 0.5,
      volume: -10,
    },
    effects: {
      distortion: { amount: 0.1, wet: 0.05 },
      eq: { low: 0, mid: 2, high: 3 },
      compression: { threshold: -18, ratio: 3, attack: 0.002, release: 0.2 },
      chorus: { depth: 0.2, frequency: 4, wet: 0.15 },
      reverb: { decay: 1, wet: 0.2 },
    },
  },
  'Lo-fi Dreams': {
    synth: {
      oscillatorType: 'triangle',
      oscillatorSpread: 30,
      attack: 0.1,
      decay: 0.2,
      sustain: 0.6,
      release: 1.2,
      volume: -14,
    },
    effects: {
      distortion: { amount: 0.4, wet: 0.3 },
      eq: { low: 4, mid: -2, high: -4 },
      compression: { threshold: -25, ratio: 6, attack: 0.01, release: 0.3 },
      chorus: { depth: 0.6, frequency: 0.8, wet: 0.5 },
      reverb: { decay: 3, wet: 0.4 },
    },
  },
  'Cinematic Pad': {
    synth: {
      oscillatorType: 'sine',
      oscillatorSpread: 40,
      attack: 0.3,
      decay: 0.4,
      sustain: 0.8,
      release: 2.5,
      volume: -15,
    },
    effects: {
      distortion: { amount: 0.2, wet: 0.15 },
      eq: { low: 3, mid: 1, high: 2 },
      compression: { threshold: -25, ratio: 5, attack: 0.05, release: 0.4 },
      chorus: { depth: 0.7, frequency: 2, wet: 0.4 },
      reverb: { decay: 4, wet: 0.5 },
    },
  },
  'Vintage OP': {
    synth: {
      oscillatorType: 'sawtooth',
      oscillatorSpread: 25,
      attack: 0.04,
      decay: 0.15,
      sustain: 0.6,
      release: 0.8,
      volume: -13,
    },
    effects: {
      distortion: { amount: 0.3, wet: 0.2 },
      eq: { low: 2, mid: -1, high: 1 },
      compression: { threshold: -22, ratio: 4, attack: 0.005, release: 0.2 },
      chorus: { depth: 0.5, frequency: 3.5, wet: 0.3 },
      reverb: { decay: 1.8, wet: 0.25 },
    },
  },
};

export type PresetName = keyof typeof SOUND_PRESETS;
```

---

### 3. State Management (`state/`)

#### `stores/keyboardStore.ts` - Keyboard State (Zustand)
```typescript
/**
 * Keyboard state store
 * Manages pressed keys (replaces global mutable state)
 */

import { create } from 'zustand';

interface KeyboardState {
  pressedKeys: Set<string>;
  pressKey: (key: string) => void;
  releaseKey: (key: string) => void;
  clearKeys: () => void;
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
  pressedKeys: new Set(),

  pressKey: (key: string) => set((state) => {
    const newSet = new Set(state.pressedKeys);
    newSet.add(key.toLowerCase());
    return { pressedKeys: newSet };
  }),

  releaseKey: (key: string) => set((state) => {
    const newSet = new Set(state.pressedKeys);
    newSet.delete(key.toLowerCase());
    return { pressedKeys: newSet };
  }),

  clearKeys: () => set({ pressedKeys: new Set() }),
}));
```

#### `stores/audioStore.ts` - Audio State
```typescript
/**
 * Audio state store
 * Tracks current voicing, previous voicing, initialization status
 */

import { create } from 'zustand';
import { ChordVoicing } from '../../core/music/theory';

interface AudioState {
  currentVoicing: ChordVoicing | null;
  previousVoicing: ChordVoicing | null;
  isInitialized: boolean;

  setCurrentVoicing: (voicing: ChordVoicing | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentVoicing: null,
  previousVoicing: null,
  isInitialized: false,

  setCurrentVoicing: (voicing) => set((state) => ({
    currentVoicing: voicing,
    previousVoicing: state.currentVoicing,
  })),

  setInitialized: (initialized) => set({ isInitialized: initialized }),
}));
```

#### `stores/settingsStore.ts` - Settings with Persistence
```typescript
/**
 * Settings store with localStorage persistence
 * Replaces the fake TanStack Query implementation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QualityKeyMapping, DEFAULT_QUALITY_MAPPINGS } from '../../core/music/keyboardLayout';
import { SOUND_PRESETS, PresetName } from '../../audio/presets';

interface Settings {
  currentPreset: PresetName;
  qualityMappings: QualityKeyMapping[];
  masterVolume: number;
}

interface SettingsState extends Settings {
  updatePreset: (preset: PresetName) => void;
  updateQualityMappings: (mappings: QualityKeyMapping[]) => void;
  updateMasterVolume: (volume: number) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  currentPreset: 'Warm Piano',
  qualityMappings: DEFAULT_QUALITY_MAPPINGS,
  masterVolume: -12,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updatePreset: (preset) => set({ currentPreset: preset }),
      updateQualityMappings: (mappings) => set({ qualityMappings: mappings }),
      updateMasterVolume: (volume) => set({ masterVolume: volume }),
      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'harmonic-keyboard-settings',
    }
  )
);
```

#### `stores/drumStore.ts` - Drum Machine State
```typescript
/**
 * Drum machine state
 * Manages recording state, MIDI events, playback
 */

import { create } from 'zustand';
import { RecorderState, MIDIEvent } from '../../audio/DrumRecorder';

interface DrumState {
  state: RecorderState;
  midiEvents: MIDIEvent[];
  loopDuration: number;
  audioBlob: Blob | null;

  setState: (state: RecorderState) => void;
  setMIDIEvents: (events: MIDIEvent[]) => void;
  setLoopDuration: (duration: number) => void;
  setAudioBlob: (blob: Blob | null) => void;
  clear: () => void;
}

export const useDrumStore = create<DrumState>((set) => ({
  state: RecorderState.Idle,
  midiEvents: [],
  loopDuration: 0,
  audioBlob: null,

  setState: (state) => set({ state }),
  setMIDIEvents: (events) => set({ midiEvents: events }),
  setLoopDuration: (duration) => set({ loopDuration: duration }),
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  clear: () => set({
    state: RecorderState.Idle,
    midiEvents: [],
    loopDuration: 0,
    audioBlob: null,
  }),
}));
```

---

### 4. Custom Hooks (`state/hooks/`)

#### `useKeyboardInput.ts` - Keyboard Event Handling
```typescript
/**
 * Keyboard input hook
 * Handles keydown/keyup events, updates keyboard store
 */

import { useEffect } from 'react';
import { useKeyboardStore } from '../stores/keyboardStore';

export function useKeyboardInput(enabled: boolean = true) {
  const { pressKey, releaseKey, clearKeys } = useKeyboardStore();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      pressKey(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      releaseKey(e.key);
    };

    const handleBlur = () => {
      clearKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, pressKey, releaseKey, clearKeys]);
}
```

#### `useChordPlayback.ts` - Chord Generation + Playback
```typescript
/**
 * Chord playback hook
 * Combines chord parsing, voice leading, and playback
 * Replaces scattered logic in Instrument.tsx
 */

import { useEffect, useRef, useMemo } from 'react';
import { useKeyboardStore } from '../stores/keyboardStore';
import { useAudioStore } from '../stores/audioStore';
import { useSettingsStore } from '../stores/settingsStore';
import { ChordParser } from '../../core/keyboard/ChordParser';
import { generateOptimalVoicing } from '../../core/music/voiceLeading';
import { HarmonicSynthesizer } from '../../audio/HarmonicSynthesizer';
import { SOUND_PRESETS } from '../../audio/presets';
import { debounce } from '../../lib/utils';

const DEBOUNCE_MS = 80;

export function useChordPlayback(synthesizer: HarmonicSynthesizer) {
  const pressedKeys = useKeyboardStore(state => state.pressedKeys);
  const { currentVoicing, previousVoicing, setCurrentVoicing } = useAudioStore();
  const { qualityMappings, currentPreset } = useSettingsStore();

  const chordParser = useMemo(
    () => new ChordParser(qualityMappings),
    [qualityMappings]
  );

  // Debounced update function
  const updateVoicing = useMemo(
    () => debounce(() => {
      // Parse pressed keys to chord intent
      const intent = chordParser.parse(pressedKeys);

      if (intent) {
        // Generate optimal voicing with voice leading
        const voicing = generateOptimalVoicing(intent, previousVoicing);

        // Update store
        setCurrentVoicing(voicing);

        // Play audio
        synthesizer.playChord(voicing);
      } else {
        // No valid chord, release all notes
        setCurrentVoicing(null);
        synthesizer.releaseAll();
      }
    }, DEBOUNCE_MS),
    [chordParser, pressedKeys, previousVoicing, setCurrentVoicing, synthesizer]
  );

  // Trigger update when keys change
  useEffect(() => {
    updateVoicing();
  }, [pressedKeys, updateVoicing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synthesizer.releaseAll();
    };
  }, [synthesizer]);
}
```

#### `useAudioInit.ts` - Audio Initialization
```typescript
/**
 * Audio initialization hook
 * Lazy-initializes audio on first user interaction
 */

import { useEffect, useState } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { useSettingsStore } from '../stores/settingsStore';
import { AudioEngine } from '../../audio/AudioEngine';
import { HarmonicSynthesizer } from '../../audio/HarmonicSynthesizer';
import { SOUND_PRESETS } from '../../audio/presets';

export function useAudioInit() {
  const [synthesizer] = useState(() => new HarmonicSynthesizer());
  const { setInitialized } = useAudioStore();
  const currentPreset = useSettingsStore(state => state.currentPreset);

  const initialize = async () => {
    try {
      await AudioEngine.initialize();

      const preset = SOUND_PRESETS[currentPreset];
      await synthesizer.initialize(preset.synth, preset.effects);

      setInitialized(true);
      return synthesizer;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      synthesizer.dispose();
    };
  }, [synthesizer]);

  return { synthesizer, initialize };
}
```

#### `useDrumRecorder.ts` - Drum Recording Logic
```typescript
/**
 * Drum recorder hook
 * Manages drum machine state and playback
 */

import { useState, useEffect } from 'react';
import { useDrumStore } from '../stores/drumStore';
import { DrumRecorder, RecorderState } from '../../audio/DrumRecorder';
import { AudioEngine } from '../../audio/AudioEngine';

const DRUM_SAMPLES = [
  { name: 'kick', path: './sounds/kick.wav' },
  { name: 'snare', path: './sounds/snare.wav' },
  { name: 'hihat', path: './sounds/hihat.wav' },
  { name: 'openhat', path: './sounds/openhat.wav' },
  { name: 'crash', path: './sounds/crash.wav' },
  { name: 'rimshot', path: './sounds/rimshot.wav' },
  { name: 'clap', path: './sounds/clap.wav' },
];

export function useDrumRecorder() {
  const [recorder] = useState(() => new DrumRecorder());
  const [initialized, setInitialized] = useState(false);
  const { setState, setMIDIEvents, setLoopDuration, clear } = useDrumStore();

  const initialize = async () => {
    if (initialized) return;

    try {
      await AudioEngine.initialize();
      await recorder.initialize(DRUM_SAMPLES);
      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize drum recorder:', error);
      throw error;
    }
  };

  const handleSpacebar = () => {
    const state = recorder.getState();

    switch (state) {
      case RecorderState.Idle:
        recorder.startRecording();
        setState(RecorderState.Recording);
        break;

      case RecorderState.Recording:
        recorder.stopRecording();
        setState(RecorderState.Playing);
        setMIDIEvents(recorder.getMIDIEvents());
        setLoopDuration(recorder.getLoopDuration());
        break;

      case RecorderState.Playing:
        recorder.startOverdub();
        setState(RecorderState.Overdubbing);
        break;

      case RecorderState.Overdubbing:
        recorder.stopOverdub();
        setState(RecorderState.Playing);
        setMIDIEvents(recorder.getMIDIEvents());
        break;
    }
  };

  const handleClear = () => {
    recorder.clear();
    clear();
  };

  const handleQuantize = (gridSize: 16 | 32 | 64 = 16) => {
    recorder.quantize(gridSize);
    setMIDIEvents(recorder.getMIDIEvents());
  };

  const triggerSample = (sampleName: string) => {
    recorder.triggerSample(sampleName);
  };

  useEffect(() => {
    return () => {
      recorder.dispose();
    };
  }, [recorder]);

  return {
    recorder,
    initialized,
    initialize,
    handleSpacebar,
    handleClear,
    handleQuantize,
    triggerSample,
  };
}
```

---

### 5. Constants (`core/constants.ts`)

```typescript
/**
 * All magic numbers centralized
 */

export const VOICING_RANGE = {
  MIN: 48,  // C3
  MAX: 84,  // C6
} as const;

export const VOICE_COUNT = 5;

export const TIMING = {
  DEBOUNCE_MS: 80,
  ANIMATION_FPS: 60,
} as const;

export const DRUM_GRID_SIZES = [16, 32, 64] as const;

export const KEYBOARD_LAYOUT = {
  BASS_KEYS: 'zsxdcvgbhnjm,l.;/',
  POSITION_KEYS: '01234',
  SPACEBAR: ' ',
} as const;
```

---

## Component Design

### Component Principles
1. **Small & Focused** - Each component has ONE clear responsibility
2. **Dumb UI** - Components receive data via props, minimal logic
3. **Custom Hooks** - Extract complex logic into reusable hooks
4. **Composition** - Build complex UIs from simple components

### Key Components

#### `HarmonicKeyboard.tsx` - Main Instrument
```typescript
/**
 * Main keyboard instrument component
 * Coordinates keyboard input, chord generation, and display
 */

import { useKeyboardInput } from '../../state/hooks/useKeyboardInput';
import { useAudioInit } from '../../state/hooks/useAudioInit';
import { useChordPlayback } from '../../state/hooks/useChordPlayback';
import { useAudioStore } from '../../state/stores/audioStore';
import ChordDisplay from './ChordDisplay';
import KeyboardGuide from './KeyboardGuide';
import PianoVisualization from './PianoVisualization';

export default function HarmonicKeyboard() {
  const { synthesizer, initialize } = useAudioInit();
  const { isInitialized } = useAudioStore();

  // Auto-initialize on first keypress
  useKeyboardInput(true);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useChordPlayback(synthesizer);

  const currentVoicing = useAudioStore(state => state.currentVoicing);

  return (
    <div className="flex flex-col h-full">
      <ChordDisplay voicing={currentVoicing} />
      <KeyboardGuide voicing={currentVoicing} />
      <PianoVisualization voicing={currentVoicing} />
    </div>
  );
}
```

#### `DrumMachine.tsx` - Loop Pedal
```typescript
/**
 * Drum machine component
 * Boss-style loop pedal with recording, overdubbing, quantization
 */

import { useDrumRecorder } from '../../state/hooks/useDrumRecorder';
import { useDrumStore } from '../../state/stores/drumStore';
import WaveformDisplay from './WaveformDisplay';
import RecordButton from './RecordButton';
import QuantizeButton from './QuantizeButton';

export default function DrumMachine() {
  const {
    initialized,
    initialize,
    handleSpacebar,
    handleClear,
    handleQuantize,
    triggerSample,
  } = useDrumRecorder();

  const { state, audioBlob } = useDrumStore();

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        handleSpacebar();
      }
      // ... drum trigger keys
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSpacebar, triggerSample]);

  return (
    <div className="flex flex-col items-center gap-4">
      <WaveformDisplay audioBlob={audioBlob} state={state} />

      <div className="flex gap-2">
        <RecordButton state={state} onToggle={handleSpacebar} />
        <QuantizeButton onQuantize={handleQuantize} />
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}
```

---

## Testing Strategy

### Test Coverage Requirements
- **Unit tests** for all core logic (music theory, voice leading, chord parsing)
- **Integration tests** for audio engines
- **Component tests** for UI components
- **E2E tests** for critical user flows

### Testing Tools
- **Vitest** - Fast, Vite-native testing
- **Testing Library** - React component testing
- **MSW** - API mocking (if needed)

### Example Test Structure
```typescript
// core/music/voiceLeading.test.ts
describe('generateOptimalVoicing', () => {
  it('generates 5-voice voicing within range', () => {
    const intent = {
      root: 0,
      bass: 48,
      quality: ChordQuality.Major,
      position: ChordPosition.Root,
    };

    const voicing = generateOptimalVoicing(intent, null);

    expect(voicing.notes).toHaveLength(5);
    expect(voicing.notes[0]).toBeGreaterThanOrEqual(48);
    expect(voicing.notes[4]).toBeLessThanOrEqual(84);
  });

  it('minimizes voice movement between chords', () => {
    // Test that C Major → Am uses optimal voice leading
    const cmaj = generateOptimalVoicing({
      root: 0,
      bass: 48,
      quality: ChordQuality.Major,
      position: ChordPosition.Root,
    }, null);

    const am = generateOptimalVoicing({
      root: 9,
      bass: 57,
      quality: ChordQuality.Minor,
      position: ChordPosition.Root,
    }, cmaj);

    // Calculate movement
    const movement = cmaj.notes.reduce((sum, note, i) =>
      sum + Math.abs(note - am.notes[i]), 0
    );

    // Movement should be reasonable (< 20 semitones total)
    expect(movement).toBeLessThan(20);
  });
});
```

---

## Performance Optimizations

1. **Voice Leading Cache** - Cache generated voicings per bass+quality
2. **Memoization** - Use React.memo and useMemo for expensive computations
3. **Debouncing** - Debounce keyboard input to reduce re-renders
4. **Web Workers** - Move voice leading computation to worker (future)
5. **Lazy Loading** - Code-split components, lazy load audio samples

---

## Error Handling

### Error Boundaries
```typescript
// lib/errors.tsx
export class AudioInitializationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AudioInitializationError';
  }
}

export class AudioErrorBoundary extends React.Component<Props, State> {
  // Catch audio-related errors, show user-friendly message
}
```

### Graceful Degradation
- If audio fails to initialize, show error message
- If drum samples fail to load, disable drum machine
- If voice leading times out, fall back to simple voicing

---

## Migration Plan

### Phase 1: Core Infrastructure
1. Set up new `src/` directory structure
2. Implement core music layer (pure functions)
3. Write comprehensive tests for music logic
4. **Validation**: All tests pass, music theory correct

### Phase 2: Audio Layer
1. Implement audio engines (singleton pattern)
2. Implement effects chain
3. Add presets
4. **Validation**: Audio plays correctly, effects work

### Phase 3: State Management
1. Set up Zustand stores
2. Implement custom hooks
3. Add localStorage persistence
4. **Validation**: State updates correctly, persists across sessions

### Phase 4: UI Components
1. Migrate components one-by-one
2. Connect to new state management
3. Test each component
4. **Validation**: UI matches original, no regressions

### Phase 5: Integration & Polish
1. Integrate all pieces
2. Performance testing
3. Accessibility audit
4. Documentation
5. **Validation**: Full app works, performance good

### Phase 6: Cutover
1. Delete old codebase
2. Rename `src/` directory
3. Update imports
4. Final smoke test

---

## Dependencies

### Keep Existing
- React 18.3.1
- TypeScript 5.6+
- Vite 5.4+
- Tone.js 15.0+
- Tailwind CSS 3.4+
- shadcn/ui components
- Framer Motion (animations)
- Lucide React (icons)

### Add New
- **Zustand** - State management (lightweight alternative to Context)
- **Vitest** - Testing framework
- **@testing-library/react** - Component testing
- **@testing-library/user-event** - User interaction testing

### Remove
- TanStack Query (not actually being used)
- Drizzle ORM (unused)
- Database libraries (unused)
- Auth libraries (unused)

---

## Success Criteria

### Functional Requirements
✅ All existing features work identically
✅ Keyboard input feels responsive (< 50ms latency)
✅ Voice leading produces smooth transitions
✅ Drum machine records/plays/overdubs correctly
✅ Settings persist across sessions

### Non-Functional Requirements
✅ Zero global mutable state
✅ 80%+ test coverage on core logic
✅ No TypeScript `any` types
✅ Bundle size < 500KB (gzipped)
✅ Lighthouse score > 90

### Code Quality
✅ Clear separation of concerns
✅ Every module has single responsibility
✅ All magic numbers in constants file
✅ Comprehensive JSDoc on complex functions
✅ Consistent code style (Prettier + ESLint)

---

## Notes for Implementation Agent

### Implementation Order
1. Start with `core/music/` - pure functions, no dependencies
2. Write tests as you go (TDD approach)
3. Then `audio/` layer - requires Tone.js
4. Then `state/` - requires Zustand
5. Finally `components/` - requires everything

### Key Principles
- **NO global mutable state** - this is non-negotiable
- **Pure functions first** - separate business logic from side effects
- **Test everything** - especially core algorithms
- **Small commits** - one module at a time

### Common Pitfalls to Avoid
- Don't duplicate chord interval definitions
- Don't put business logic in components
- Don't skip error handling
- Don't use `any` type
- Don't forget cleanup (dispose audio nodes)

### Questions to Ask
- Does this module have a single, clear responsibility?
- Can this be tested without mocking?
- Is this pure or impure? (Separate accordingly)
- Will this scale to 1000+ chords?

---

## Appendix: File Manifest

This rewrite will create approximately **40 new files**:

**Core** (10 files)
- theory.ts
- voiceLeading.ts
- keyboardLayout.ts
- noteUtils.ts
- KeyboardState.ts
- ChordParser.ts
- types.ts
- constants.ts
- + 2 test files

**Audio** (6 files)
- AudioEngine.ts
- HarmonicSynthesizer.ts
- DrumRecorder.ts
- EffectsChain.ts
- presets.ts
- + 1 test file

**State** (9 files)
- keyboardStore.ts
- audioStore.ts
- settingsStore.ts
- drumStore.ts
- useKeyboardInput.ts
- useChordPlayback.ts
- useAudioInit.ts
- useDrumRecorder.ts
- + 1 test file

**Components** (10 files)
- HarmonicKeyboard.tsx
- ChordDisplay.tsx
- KeyboardGuide.tsx
- PianoVisualization.tsx
- DrumMachine.tsx
- WaveformDisplay.tsx
- RecordButton.tsx
- QuantizeButton.tsx
- SettingsModal.tsx
- SoundControls.tsx

**Other** (5 files)
- App.tsx
- main.tsx
- utils.ts
- errors.tsx
- README.md

**Keep from original**: All shadcn/ui components (~50 files)

---

## End of Specification

This specification provides a complete architectural blueprint for reimplementing the Harmonic Keyboard with clean, maintainable code. The new codebase will be:

- **Elegant** - Clear separation of concerns, pure functions
- **Maintainable** - Well-tested, documented, type-safe
- **Performant** - Optimized algorithms, proper memoization
- **Scalable** - Easy to add new features

Ready for implementation by a coding agent! 🚀
