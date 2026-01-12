# Harmonic Keyboard Refactor - Quick Start Guide

Welcome! This directory contains everything you need to implement a clean, production-grade version of the Harmonic Keyboard.

---

## 📋 Documents in This Package

### 1. **REFACTOR_SPEC.md** (Main Specification)
- **1,000+ line comprehensive architectural specification**
- Complete module specifications with code examples
- Directory structure and file organization
- Detailed API designs for every component
- Testing strategy and requirements
- **Start here** to understand the full architecture

### 2. **IMPLEMENTATION_CHECKLIST.md** (Task List)
- **150+ concrete implementation tasks** broken into 6 phases
- Checkbox format - track your progress
- Estimated time: 40-50 hours
- Clear dependencies between tasks
- Success criteria for each phase
- **Use this** as your day-to-day task tracker

### 3. **ARCHITECTURE_COMPARISON.md** (Old vs New)
- **Side-by-side comparisons** of old vs new patterns
- Shows WHY the new architecture is better
- Highlights anti-patterns in old code
- Demonstrates improvements in:
  - State management
  - Code organization
  - Performance
  - Testing
  - Type safety
- **Read this** to understand the philosophy shift

---

## 🚀 Quick Start for Implementation Agent

### Step 1: Read the Specification (30 minutes)
```bash
# Read the main spec
cat REFACTOR_SPEC.md

# Optional: Compare with old architecture
cat ARCHITECTURE_COMPARISON.md
```

### Step 2: Set Up Your Environment (15 minutes)
```bash
# Create new source directory
mkdir -p client/src-new/{core,audio,state,components,lib}

# Install new dependencies
npm install zustand vitest @testing-library/react @testing-library/user-event

# Remove unused dependencies
npm uninstall @tanstack/react-query drizzle-orm connect-pg-simple passport openai
```

### Step 3: Start Building (Phase 1)
```bash
# Open the checklist
cat IMPLEMENTATION_CHECKLIST.md

# Start with core/constants.ts
touch client/src-new/core/constants.ts

# Follow the checklist step-by-step
# ✅ Check off tasks as you complete them
```

### Step 4: Test as You Go
```bash
# Run tests after each module
npm test

# Ensure high coverage
npm run test:coverage
```

---

## 📚 Implementation Order

**Follow this order strictly** - later phases depend on earlier ones:

1. **Phase 1: Core Infrastructure** (Pure functions, no dependencies)
   - `core/constants.ts`
   - `core/music/theory.ts`
   - `core/music/voiceLeading.ts`
   - `core/music/keyboardLayout.ts`
   - `core/keyboard/ChordParser.ts`
   - ✅ **Checkpoint**: All tests pass, music logic correct

2. **Phase 2: Audio Layer** (Singleton audio engines)
   - `audio/AudioEngine.ts`
   - `audio/EffectsChain.ts`
   - `audio/HarmonicSynthesizer.ts`
   - `audio/DrumRecorder.ts`
   - `audio/presets.ts`
   - ✅ **Checkpoint**: Audio plays correctly

3. **Phase 3: State Management** (Zustand stores + hooks)
   - Stores: keyboard, audio, settings, drum
   - Hooks: useKeyboardInput, useChordPlayback, useAudioInit, useDrumRecorder
   - ✅ **Checkpoint**: State updates correctly, persists

4. **Phase 4: UI Components** (React components)
   - Instrument components (keyboard, display, guide, piano)
   - Drum components (machine, waveform, controls)
   - Settings components (modal, controls, presets)
   - Layout components (app, header)
   - ✅ **Checkpoint**: UI matches original, no regressions

5. **Phase 5: Integration & Testing** (E2E tests, optimization)
   - Full app integration
   - Comprehensive testing
   - Performance optimization
   - Accessibility audit
   - ✅ **Checkpoint**: Production-ready

6. **Phase 6: Cutover** (Replace old codebase)
   - Final validation
   - Migration
   - Cleanup
   - ✅ **Checkpoint**: Deployed successfully

---

## 🎯 Key Principles (Don't Forget!)

### ❌ Avoid These Anti-Patterns

1. **Global Mutable State**
   ```typescript
   // ❌ BAD
   const pressedKeys = new Set<string>();

   // ✅ GOOD
   const useKeyboardStore = create<State>((set) => ({ ... }));
   ```

2. **Business Logic in Components**
   ```typescript
   // ❌ BAD (component with 400 lines of logic)
   export default function Component() {
     const [state, setState] = useState();
     // ... 300 lines of business logic ...
     return <div>...</div>;
   }

   // ✅ GOOD (logic in custom hook)
   export default function Component() {
     const { data, actions } = useBusinessLogic();
     return <div>...</div>;
   }
   ```

3. **Duplicated Constants**
   ```typescript
   // ❌ BAD (defined in multiple files)
   const MIN_NOTE = 48;

   // ✅ GOOD (single source of truth)
   import { VOICING_RANGE } from '../constants';
   ```

### ✅ Follow These Patterns

1. **Pure Functions for Business Logic**
   - Music theory, voice leading, chord parsing
   - Zero side effects
   - Easy to test

2. **Singleton for Audio Resources**
   - Single audio context
   - Centralized management
   - Proper cleanup

3. **Immutable State Updates**
   - Zustand with immutable patterns
   - No direct mutations
   - Predictable state changes

4. **Small, Focused Components**
   - Each component < 100 lines
   - Single responsibility
   - Extract logic to hooks

5. **Comprehensive Testing**
   - Write tests WHILE coding (not after)
   - 80%+ coverage on core logic
   - Integration tests for audio

---

## 📊 Progress Tracking

Use this to track your overall progress:

```
Phase 1: Core Infrastructure     [ ] 0/40 tasks
Phase 2: Audio Layer             [ ] 0/25 tasks
Phase 3: State Management        [ ] 0/30 tasks
Phase 4: UI Components           [ ] 0/35 tasks
Phase 5: Integration & Testing   [ ] 0/15 tasks
Phase 6: Cutover                 [ ] 0/10 tasks

Total: [ ] 0/155 tasks completed
```

---

## 🧪 Testing Requirements

### Unit Tests (Required for Phase Completion)
- ✅ All pure functions tested
- ✅ Edge cases covered
- ✅ Error scenarios tested

### Integration Tests (Required for Phase 2+)
- ✅ Audio engines work together
- ✅ State updates propagate correctly
- ✅ Components render with real state

### E2E Tests (Required for Phase 5)
- ✅ Play chord sequence
- ✅ Record + overdub drum loop
- ✅ Change presets
- ✅ Settings persist

### Coverage Target: 80%+ on Core Logic

---

## 🐛 Common Issues & Solutions

### Issue: "Audio won't play"
- ✅ Check if `AudioEngine.initialize()` was called
- ✅ Ensure user interaction before audio (browser requirement)
- ✅ Check browser console for errors
- ✅ Verify Tone.js context state

### Issue: "State not updating"
- ✅ Check if using immutable updates in Zustand
- ✅ Verify store is imported correctly
- ✅ Check React DevTools for state changes

### Issue: "Tests failing"
- ✅ Clear voicing cache between tests
- ✅ Mock Tone.js in tests (use `vi.mock()`)
- ✅ Check async operations have proper `await`

### Issue: "Voice leading slow"
- ✅ Verify voicing cache is working
- ✅ Check if pruning is enabled
- ✅ Profile with browser dev tools

---

## 📦 File Structure Preview

After completion, your `src-new/` should look like:

```
src-new/
├── core/
│   ├── constants.ts                    ✅ All magic numbers
│   ├── music/
│   │   ├── theory.ts                   ✅ Music theory definitions
│   │   ├── voiceLeading.ts             ✅ Voice leading algorithm
│   │   ├── keyboardLayout.ts           ✅ Key mappings
│   │   └── noteUtils.ts                ✅ MIDI/freq conversions
│   └── keyboard/
│       ├── KeyboardState.ts            ✅ Keyboard state machine
│       ├── ChordParser.ts              ✅ Key → chord intent
│       └── types.ts                    ✅ Core types
│
├── audio/
│   ├── AudioEngine.ts                  ✅ Singleton audio manager
│   ├── HarmonicSynthesizer.ts          ✅ Chord synthesis
│   ├── DrumRecorder.ts                 ✅ Loop pedal engine
│   ├── EffectsChain.ts                 ✅ Effects routing
│   └── presets.ts                      ✅ Sound presets
│
├── state/
│   ├── stores/
│   │   ├── keyboardStore.ts            ✅ Keyboard state
│   │   ├── audioStore.ts               ✅ Audio state
│   │   ├── settingsStore.ts            ✅ Settings (persisted)
│   │   └── drumStore.ts                ✅ Drum machine state
│   └── hooks/
│       ├── useKeyboardInput.ts         ✅ Keyboard events
│       ├── useChordPlayback.ts         ✅ Chord generation + play
│       ├── useAudioInit.ts             ✅ Audio initialization
│       └── useDrumRecorder.ts          ✅ Drum recording logic
│
├── components/
│   ├── instrument/
│   │   ├── HarmonicKeyboard.tsx        ✅ Main instrument
│   │   ├── ChordDisplay.tsx            ✅ Chord name display
│   │   ├── KeyboardGuide.tsx           ✅ Visual hints
│   │   └── PianoVisualization.tsx      ✅ Piano keyboard
│   ├── drums/
│   │   ├── DrumMachine.tsx             ✅ Loop pedal
│   │   ├── WaveformDisplay.tsx         ✅ Waveform + progress
│   │   ├── RecordButton.tsx            ✅ Record control
│   │   └── QuantizeButton.tsx          ✅ Quantize control
│   ├── settings/
│   │   ├── SettingsModal.tsx           ✅ Settings dialog
│   │   ├── SoundControls.tsx           ✅ Audio params
│   │   └── PresetSelector.tsx          ✅ Preset picker
│   ├── layout/
│   │   ├── AppLayout.tsx               ✅ Main layout
│   │   └── Header.tsx                  ✅ Navigation
│   └── ui/                             ✅ Keep existing shadcn
│
├── lib/
│   ├── utils.ts                        ✅ Utilities
│   └── errors.tsx                      ✅ Error boundaries
│
├── App.tsx                             ✅ Root component
└── main.tsx                            ✅ Entry point
```

---

## ✅ Definition of Done

A task is complete when:

1. ✅ Code is written according to specification
2. ✅ Tests are written and passing
3. ✅ TypeScript compiles with no errors
4. ✅ No `any` types used
5. ✅ Documented with JSDoc (for complex functions)
6. ✅ Committed to git with clear message
7. ✅ Checkmark added in `IMPLEMENTATION_CHECKLIST.md`

---

## 🎓 Learning Resources

If you need clarification on concepts:

- **Zustand**: https://github.com/pmndrs/zustand
- **Tone.js**: https://tonejs.github.io/
- **Vitest**: https://vitest.dev/
- **Voice Leading**: Read the existing `voiceLeading.ts` for algorithm details
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## 💬 Questions?

If the specification is unclear:

1. Check `ARCHITECTURE_COMPARISON.md` for examples
2. Look at the old code for reference (but don't copy the anti-patterns!)
3. Ask for clarification with specific questions
4. Reference the spec section by heading

---

## 🎉 Success Criteria

You're done when:

### Functional
- ✅ All existing features work identically
- ✅ Keyboard feels responsive (< 50ms latency)
- ✅ Voice leading produces smooth transitions
- ✅ Settings persist across sessions

### Technical
- ✅ Zero global mutable state
- ✅ 80%+ test coverage on core logic
- ✅ No `any` types
- ✅ Bundle < 500KB gzipped
- ✅ Lighthouse score > 90

### Quality
- ✅ Clean separation of concerns
- ✅ All magic numbers in constants
- ✅ Comprehensive error handling
- ✅ Consistent code style

---

## 🚀 Let's Build!

You have everything you need:

- ✅ **Comprehensive specification** (1,000+ lines)
- ✅ **Detailed checklist** (150+ tasks)
- ✅ **Architecture examples** (old vs new)
- ✅ **Clear success criteria**

Time to turn this "vibe coded" prototype into a **production-grade masterpiece**! 🎹✨

**Estimated Time**: 40-50 hours of focused work

**Start Command**:
```bash
# Read the spec
cat REFACTOR_SPEC.md

# Open the checklist
cat IMPLEMENTATION_CHECKLIST.md

# Create the first file
mkdir -p client/src-new/core
touch client/src-new/core/constants.ts

# Let's go! 🚀
```

Good luck! 🎵
