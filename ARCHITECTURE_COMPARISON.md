# Architecture Comparison: Old vs New

This document highlights the key architectural improvements in the refactored codebase.

---

## State Management

### ❌ Old (Global Mutable State)
```typescript
// keyboardMapping.ts
const pressedKeys = new Set<string>(); // Module-level mutable state

export function handleKeyPress(e: KeyboardEvent): void {
  pressedKeys.add(e.key.toLowerCase());
}
```

**Problems:**
- Global mutable state shared across module
- Impossible to test in isolation
- Race conditions possible
- No way to track changes

### ✅ New (Zustand Store)
```typescript
// state/stores/keyboardStore.ts
export const useKeyboardStore = create<KeyboardState>((set) => ({
  pressedKeys: new Set(),

  pressKey: (key: string) => set((state) => {
    const newSet = new Set(state.pressedKeys);
    newSet.add(key.toLowerCase());
    return { pressedKeys: newSet };
  }),
}));
```

**Benefits:**
- Immutable updates
- Testable in isolation
- React-integrated
- Predictable state changes

---

## Business Logic Separation

### ❌ Old (Mixed Concerns)
```typescript
// Instrument.tsx (147 lines)
export default function Instrument({ chordQualities, defaultSettings }) {
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(null);

  // Manual debouncing
  let updateTimeout: NodeJS.Timeout | null = null;
  let lastUpdateTime = 0;
  const DEBOUNCE_TIME = 80;

  const updateVoicing = () => {
    const now = Date.now();
    if (now - lastUpdateTime < DEBOUNCE_TIME) {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        performUpdate();
      }, DEBOUNCE_TIME);
      return;
    }
    performUpdate();
  };

  // ... 100+ more lines mixing UI and business logic
}
```

**Problems:**
- Business logic in UI component
- Manual debouncing implementation
- Hard to test chord generation separately
- Large component doing too much

### ✅ New (Clean Separation)
```typescript
// components/instrument/HarmonicKeyboard.tsx (30 lines)
export default function HarmonicKeyboard() {
  const { synthesizer, initialize } = useAudioInit();

  useKeyboardInput(true);
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

**Benefits:**
- Component is just UI rendering
- Business logic in custom hooks
- Testable independently
- Clear, readable code

---

## Chord Definitions

### ❌ Old (Duplicated)
```typescript
// chords.ts
export function getChordIntervals(quality: ChordQuality): number[] {
  switch (quality) {
    case ChordQuality.Major: return [0, 4, 7];
    // ...
  }
}

// chordConfig.ts
export const chordIntervals: Record<ChordQuality, number[]> = {
  [ChordQuality.Major]: [0, 4, 7],
  // ... SAME DEFINITIONS AGAIN
};
```

**Problems:**
- Chord intervals defined in TWO places
- Risk of inconsistency
- Violates DRY principle

### ✅ New (Single Source of Truth)
```typescript
// core/music/theory.ts
export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  [ChordQuality.Major]: [0, 4, 7],
  [ChordQuality.Minor]: [0, 3, 7],
  // ... defined ONCE
};

export function getChordIntervals(quality: ChordQuality): readonly number[] {
  return CHORD_INTERVALS[quality];
}
```

**Benefits:**
- Single source of truth
- Impossible to have inconsistency
- Easy to add new chord types

---

## Magic Numbers

### ❌ Old (Scattered Constants)
```typescript
// voiceLeading.ts
const MIN_NOTE = 48; // C3
const MAX_NOTE = 84; // C6
const VOICE_COUNT = 5;

// Instrument.tsx
const DEBOUNCE_TIME = 80;

// DrumMachine.tsx
const gridSizes = [16, 32, 64];
```

**Problems:**
- Constants scattered across files
- No centralized configuration
- Hard to maintain consistency

### ✅ New (Centralized)
```typescript
// core/constants.ts
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
```

**Benefits:**
- All constants in one place
- Easy to find and modify
- Type-safe with `as const`

---

## Settings Management

### ❌ Old (Fake Persistence)
```typescript
// useSettings.ts
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => {
      // In a full implementation, this would load from local storage or backend
      return initialSettings; // Just returns defaults
    },
  });
}
```

**Problems:**
- TanStack Query used unnecessarily
- Settings don't actually persist
- Confusing abstraction

### ✅ New (Real Persistence)
```typescript
// state/stores/settingsStore.ts
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currentPreset: 'Warm Piano',
      qualityMappings: DEFAULT_QUALITY_MAPPINGS,
      updatePreset: (preset) => set({ currentPreset: preset }),
      // ...
    }),
    {
      name: 'harmonic-keyboard-settings', // localStorage key
    }
  )
);
```

**Benefits:**
- Actually persists to localStorage
- Simple, direct API
- Automatic hydration
- No unnecessary abstraction

---

## Audio Context Management

### ❌ Old (Duplicated Initialization)
```typescript
// audio.ts
let synth: Tone.PolySynth;
export async function initAudio(settings: Partial<SynthSettings>): Promise<void> {
  await Tone.start();
  // ... initialize synth
}

// drumAudio.ts
class DrumAudioEngine {
  async startAudioContext() {
    await Tone.start(); // DUPLICATE
    // ...
  }
}
```

**Problems:**
- Audio context initialization duplicated
- No centralized management
- Multiple `Tone.start()` calls

### ✅ New (Singleton Pattern)
```typescript
// audio/AudioEngine.ts
class AudioEngineClass {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await Tone.start();
    this.initialized = true;
  }
}

export const AudioEngine = new AudioEngineClass();

// Used by both synth and drums
await AudioEngine.initialize();
```

**Benefits:**
- Single audio context
- Centralized management
- No duplicate initialization
- Clean singleton pattern

---

## Voice Leading Performance

### ❌ Old (Brute Force)
```typescript
// voiceLeading.ts
function generateAllVoicings(bassNote: number, chordTones: number[]): number[][] {
  const voicings: number[][] = [];

  // Generates ALL possible voicings every time
  // No caching, no optimization

  return voicings; // Could be 1000+ voicings
}
```

**Problems:**
- Regenerates voicings every time
- Tests ALL permutations
- Potentially slow for complex chords

### ✅ New (Cached + Pruned)
```typescript
// core/music/voiceLeading.ts
const voicingCache = new Map<string, number[][]>();

export function generateAllVoicings(
  bassMidi: number,
  chordTones: number[],
  quality: string
): number[][] {
  const cacheKey = getCacheKey(bassMidi, quality);
  if (voicingCache.has(cacheKey)) {
    return voicingCache.get(cacheKey)!; // Cache hit!
  }

  // Generate with pruning (skip large spreads)
  const voicings: number[][] = [];
  // ... pruned generation ...

  voicingCache.set(cacheKey, voicings);
  return voicings;
}
```

**Benefits:**
- Cache avoids regeneration
- Pruning reduces search space
- Faster chord changes
- Testable cache behavior

---

## Component Size

### ❌ Old (Large Components)
```typescript
// DrumMachine.tsx (409 lines!)
export default function DrumMachine() {
  // State management
  const [state, setState] = useState<RecorderState>(RecorderState.Idle);
  const [midiEvents, setMidiEvents] = useState<MIDIEvent[]>([]);

  // Audio initialization
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    drumAudioEngine.initialize().then(/* ... */);
  }, []);

  // Recording logic
  const startRecording = () => { /* ... */ };
  const stopRecording = () => { /* ... */ };

  // MIDI logic
  const quantize = () => { /* ... */ };

  // Keyboard handling
  const handleKey = (e: KeyboardEvent) => { /* ... */ };

  // Rendering
  return (/* 100+ lines of JSX */);
}
```

**Problems:**
- 409 lines in one file
- Multiple responsibilities
- Hard to test individual pieces
- Hard to understand flow

### ✅ New (Small, Focused)
```typescript
// components/drums/DrumMachine.tsx (60 lines)
export default function DrumMachine() {
  const {
    initialize,
    handleSpacebar,
    handleQuantize,
    triggerSample,
  } = useDrumRecorder(); // Logic extracted to hook

  const { state, audioBlob } = useDrumStore(); // State in store

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex flex-col items-center gap-4">
      <WaveformDisplay audioBlob={audioBlob} state={state} />
      <RecordButton state={state} onToggle={handleSpacebar} />
      <QuantizeButton onQuantize={handleQuantize} />
    </div>
  );
}
```

**Benefits:**
- 60 lines vs 409
- Logic in custom hook
- State in Zustand store
- Easy to understand
- Testable components

---

## Testing

### ❌ Old (No Tests)
```
tests/
  (empty)
```

**Problems:**
- Zero test coverage
- No confidence in refactoring
- No regression detection
- Critical algorithms untested

### ✅ New (Comprehensive Tests)
```typescript
// core/music/voiceLeading.test.ts
describe('generateOptimalVoicing', () => {
  it('generates 5-voice voicing within range', () => {
    const intent = { root: 0, bass: 48, quality: ChordQuality.Major, position: ChordPosition.Root };
    const voicing = generateOptimalVoicing(intent, null);

    expect(voicing.notes).toHaveLength(5);
    expect(voicing.notes[0]).toBeGreaterThanOrEqual(48);
    expect(voicing.notes[4]).toBeLessThanOrEqual(84);
  });

  it('minimizes voice movement between chords', () => {
    const cmaj = generateOptimalVoicing({ root: 0, bass: 48, quality: ChordQuality.Major, position: ChordPosition.Root }, null);
    const am = generateOptimalVoicing({ root: 9, bass: 57, quality: ChordQuality.Minor, position: ChordPosition.Root }, cmaj);

    const movement = cmaj.notes.reduce((sum, note, i) => sum + Math.abs(note - am.notes[i]), 0);
    expect(movement).toBeLessThan(20);
  });
});
```

**Benefits:**
- 80%+ coverage target
- Confidence in refactoring
- Regression detection
- Algorithm correctness verified

---

## Error Handling

### ❌ Old (No Error Boundaries)
```typescript
// Instrument.tsx
export default function Instrument() {
  // If audio init fails, app crashes
  await initAudio(defaultSettings);

  // No try-catch, no error boundary
}
```

**Problems:**
- Errors crash entire app
- No graceful degradation
- Poor user experience

### ✅ New (Error Boundaries + Handling)
```typescript
// lib/errors.tsx
export class AudioErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error) {
    if (error instanceof AudioInitializationError) {
      this.setState({ error, hasError: true });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error">
          <h1>Audio Error</h1>
          <p>Could not initialize audio. Please check your permissions.</p>
          <button onClick={this.retry}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// audio/AudioEngine.ts
async initialize(): Promise<void> {
  try {
    await Tone.start();
  } catch (error) {
    throw new AudioInitializationError('Could not start audio', { cause: error });
  }
}
```

**Benefits:**
- Errors caught gracefully
- User-friendly error messages
- Retry mechanisms
- App doesn't crash

---

## Type Safety

### ❌ Old (Inconsistent)
```typescript
// Some files use:
import type { ChordVoicing } from "@shared/schema";

// Others use:
import { type ChordVoicing } from "@shared/schema";

// Some missing types
function playChord(voicing: any) { // 😱
  // ...
}
```

**Problems:**
- Inconsistent import style
- Some `any` types
- Less type safety

### ✅ New (Strict TypeScript)
```typescript
// Consistent style
import type { ChordVoicing } from '../core/music/theory';

// No any types
function playChord(voicing: ChordVoicing | null): void {
  // ...
}

// Strict tsconfig
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitAny": true
}
```

**Benefits:**
- Complete type safety
- Consistent style
- Catch errors at compile time
- Better IDE support

---

## Dependency Management

### ❌ Old (Bloated)
```json
{
  "dependencies": {
    "@tanstack/react-query": "5.60.5",  // Barely used
    "drizzle-orm": "0.39.1",            // Not used
    "connect-pg-simple": "...",         // Not used
    "passport": "...",                  // Not used
    "openai": "..."                     // Not used
  }
}
```

**Problems:**
- Unused dependencies
- Larger bundle size
- Security vulnerabilities
- Confusing codebase

### ✅ New (Lean)
```json
{
  "dependencies": {
    "react": "18.3.1",
    "tone": "15.0.4",
    "zustand": "4.4.7",  // Simple state management
    "framer-motion": "11.18.2",
    "tailwindcss": "3.4.14"
  }
}
```

**Benefits:**
- Only what's needed
- Smaller bundle
- Faster installs
- Clear dependencies

---

## Summary: Key Improvements

| Aspect | Old | New | Improvement |
|--------|-----|-----|-------------|
| **State Management** | Global mutable | Zustand stores | ✅ Predictable, testable |
| **Business Logic** | Mixed in components | Separate modules | ✅ Clean separation |
| **Chord Definitions** | Duplicated | Single source | ✅ DRY principle |
| **Constants** | Scattered | Centralized | ✅ Maintainable |
| **Settings** | Fake persistence | Real localStorage | ✅ Actually works |
| **Audio Context** | Duplicated | Singleton | ✅ Centralized |
| **Voice Leading** | Brute force | Cached + pruned | ✅ Performance |
| **Component Size** | 400+ lines | 60 lines avg | ✅ Readable |
| **Tests** | 0% coverage | 80%+ target | ✅ Confidence |
| **Error Handling** | None | Boundaries + try-catch | ✅ Resilient |
| **Type Safety** | Inconsistent | Strict TypeScript | ✅ Safe |
| **Dependencies** | Bloated | Lean | ✅ Minimal |

---

## Philosophy Shift

### Old: "Vibe Coding"
- Write code as you discover requirements
- Mix concerns freely
- Duplicate when convenient
- Test later (never)
- "It works" is good enough

### New: "Craft"
- Design before implementing
- Clear separation of concerns
- DRY principle religiously
- Test as you build
- "It works elegantly" is the goal

---

## Conclusion

The refactored codebase transforms a **functional prototype** into a **production-grade application** through:

1. **Clean Architecture** - Clear boundaries between layers
2. **Testability** - Every module can be tested in isolation
3. **Maintainability** - Easy to understand and modify
4. **Performance** - Optimized critical paths
5. **Type Safety** - Comprehensive TypeScript usage
6. **Error Handling** - Graceful degradation

The result: A codebase worthy of the brilliant instrument it powers. 🎹✨
