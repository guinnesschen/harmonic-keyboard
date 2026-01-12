# Harmonic Keyboard Rewrite - Implementation Checklist

This checklist breaks down the rewrite into concrete, implementable tasks. Check off each item as you complete it.

---

## Phase 1: Core Infrastructure ✨

### 1.1 Project Setup
- [ ] Create `client/src-new/` directory structure
- [ ] Install new dependencies: `zustand`, `vitest`, `@testing-library/react`, `@testing-library/user-event`
- [ ] Remove unused dependencies: `@tanstack/react-query`, `drizzle-orm`, database libs
- [ ] Set up Vitest configuration
- [ ] Set up test utilities and helpers

### 1.2 Core Constants (`core/constants.ts`)
- [ ] Create `core/constants.ts`
- [ ] Define `VOICING_RANGE` constants
- [ ] Define `VOICE_COUNT` constant
- [ ] Define `TIMING` constants
- [ ] Define `KEYBOARD_LAYOUT` constants
- [ ] Export all constants with proper types

### 1.3 Music Theory (`core/music/theory.ts`)
- [ ] Create `core/music/theory.ts`
- [ ] Define `ChordQuality` enum
- [ ] Define `ChordPosition` enum
- [ ] Create `CHORD_INTERVALS` mapping
- [ ] Define `NOTE_NAMES` array
- [ ] Implement `ChordIntent` interface
- [ ] Implement `ChordVoicing` interface
- [ ] Implement `getChordIntervals()` function
- [ ] Implement `midiToNoteName()` function
- [ ] Implement `noteNameToMidi()` function
- [ ] Implement `normalizePitchClass()` function
- [ ] Write unit tests for all functions

### 1.4 Voice Leading (`core/music/voiceLeading.ts`)
- [ ] Create `core/music/voiceLeading.ts`
- [ ] Implement voicing cache (Map)
- [ ] Implement `getCacheKey()` function
- [ ] Implement `generateAllVoicings()` function
- [ ] Implement `calculateMovementCost()` function (Wasserstein distance)
- [ ] Implement `createInitialVoicing()` function
- [ ] Implement `generateOptimalVoicing()` main function
- [ ] Implement `clearVoicingCache()` utility
- [ ] Write unit tests for:
  - [ ] Initial voicing generation
  - [ ] Voice leading optimization
  - [ ] Cache behavior
  - [ ] Edge cases (no valid voicings, extreme ranges)

### 1.5 Keyboard Layout (`core/music/keyboardLayout.ts`)
- [ ] Create `core/music/keyboardLayout.ts`
- [ ] Define `BASS_KEYS` constant
- [ ] Define `POSITION_KEYS` constant
- [ ] Define `QualityKeyMapping` interface
- [ ] Create `DEFAULT_QUALITY_MAPPINGS` array
- [ ] Define `PositionDefaults` type
- [ ] Create `POSITION_DEFAULT_QUALITIES` mapping (context-sensitive defaults)
- [ ] Write tests for key mappings

### 1.6 Chord Parser (`core/keyboard/ChordParser.ts`)
- [ ] Create `core/keyboard/ChordParser.ts`
- [ ] Implement `ChordParser` class
- [ ] Implement `parse()` method
- [ ] Implement `parsePosition()` helper
- [ ] Implement `parseQuality()` helper
- [ ] Implement `getDefaultQuality()` helper
- [ ] Implement `calculateRoot()` helper
- [ ] Implement `updateQualityMappings()` method
- [ ] Write unit tests for:
  - [ ] Basic chord parsing
  - [ ] Inversion handling
  - [ ] Quality overrides
  - [ ] Default quality selection
  - [ ] Root calculation from bass + position

---

## Phase 2: Audio Layer 🎵

### 2.1 Audio Engine (`audio/AudioEngine.ts`)
- [ ] Create `audio/AudioEngine.ts`
- [ ] Implement `AudioEngineClass` singleton
- [ ] Implement `initialize()` method
- [ ] Implement `isInitialized()` method
- [ ] Implement `getContext()` method
- [ ] Implement `cleanup()` method
- [ ] Define `AudioInitializationError` class
- [ ] Write integration tests

### 2.2 Effects Chain (`audio/EffectsChain.ts`)
- [ ] Create `audio/EffectsChain.ts`
- [ ] Define `EffectsSettings` interface
- [ ] Implement `EffectsChain` class
- [ ] Implement effects nodes (reverb, chorus, eq, compressor, distortion)
- [ ] Implement `initialize()` method
- [ ] Implement `getInput()` method
- [ ] Implement `updateSettings()` method
- [ ] Implement `dispose()` method
- [ ] Write tests for signal routing

### 2.3 Harmonic Synthesizer (`audio/HarmonicSynthesizer.ts`)
- [ ] Create `audio/HarmonicSynthesizer.ts`
- [ ] Define `SynthSettings` interface
- [ ] Implement `HarmonicSynthesizer` class
- [ ] Implement `initialize()` method
- [ ] Implement `playChord()` method
- [ ] Implement `releaseAll()` method
- [ ] Implement `updateSettings()` method
- [ ] Implement `updateEffects()` method
- [ ] Implement `dispose()` method
- [ ] Write integration tests

### 2.4 Drum Recorder (`audio/DrumRecorder.ts`)
- [ ] Create `audio/DrumRecorder.ts`
- [ ] Define `DrumSample`, `MIDIEvent`, `RecorderState` types
- [ ] Implement `DrumRecorder` class
- [ ] Implement `initialize()` method (load samples)
- [ ] Implement `startRecording()` method
- [ ] Implement `stopRecording()` method
- [ ] Implement `startOverdub()` method
- [ ] Implement `stopOverdub()` method
- [ ] Implement `stop()` and `clear()` methods
- [ ] Implement `triggerSample()` method
- [ ] Implement `quantize()` method
- [ ] Implement `startLoop()` private method
- [ ] Implement getters for state/events/duration
- [ ] Implement `dispose()` method
- [ ] Write integration tests for Boss-style workflow

### 2.5 Presets (`audio/presets.ts`)
- [ ] Create `audio/presets.ts`
- [ ] Define `SoundPreset` interface
- [ ] Create "Warm Piano" preset
- [ ] Create "Digital Clear" preset
- [ ] Create "Lo-fi Dreams" preset
- [ ] Create "Cinematic Pad" preset
- [ ] Create "Vintage OP" preset
- [ ] Export `SOUND_PRESETS` object
- [ ] Export `PresetName` type

---

## Phase 3: State Management 🗂️

### 3.1 Keyboard Store (`state/stores/keyboardStore.ts`)
- [ ] Create `state/stores/keyboardStore.ts`
- [ ] Define `KeyboardState` interface
- [ ] Implement Zustand store
- [ ] Implement `pressKey()` action
- [ ] Implement `releaseKey()` action
- [ ] Implement `clearKeys()` action
- [ ] Write tests for store mutations

### 3.2 Audio Store (`state/stores/audioStore.ts`)
- [ ] Create `state/stores/audioStore.ts`
- [ ] Define `AudioState` interface
- [ ] Implement Zustand store
- [ ] Implement `setCurrentVoicing()` action (with previousVoicing tracking)
- [ ] Implement `setInitialized()` action
- [ ] Write tests for store

### 3.3 Settings Store (`state/stores/settingsStore.ts`)
- [ ] Create `state/stores/settingsStore.ts`
- [ ] Define `Settings` and `SettingsState` interfaces
- [ ] Implement Zustand store with `persist` middleware
- [ ] Define `DEFAULT_SETTINGS`
- [ ] Implement `updatePreset()` action
- [ ] Implement `updateQualityMappings()` action
- [ ] Implement `updateMasterVolume()` action
- [ ] Implement `resetToDefaults()` action
- [ ] Test localStorage persistence

### 3.4 Drum Store (`state/stores/drumStore.ts`)
- [ ] Create `state/stores/drumStore.ts`
- [ ] Define `DrumState` interface
- [ ] Implement Zustand store
- [ ] Implement `setState()` action
- [ ] Implement `setMIDIEvents()` action
- [ ] Implement `setLoopDuration()` action
- [ ] Implement `setAudioBlob()` action
- [ ] Implement `clear()` action
- [ ] Write tests

### 3.5 Keyboard Input Hook (`state/hooks/useKeyboardInput.ts`)
- [ ] Create `state/hooks/useKeyboardInput.ts`
- [ ] Implement `useKeyboardInput()` hook
- [ ] Handle keydown events (with repeat detection)
- [ ] Handle keyup events
- [ ] Handle window blur (clear all keys)
- [ ] Add cleanup on unmount
- [ ] Write tests

### 3.6 Chord Playback Hook (`state/hooks/useChordPlayback.ts`)
- [ ] Create `state/hooks/useChordPlayback.ts`
- [ ] Implement `useChordPlayback()` hook
- [ ] Create memoized `ChordParser` instance
- [ ] Implement debounced `updateVoicing()` function
- [ ] Parse pressed keys → chord intent
- [ ] Generate optimal voicing with voice leading
- [ ] Update audio store
- [ ] Trigger synthesizer playback
- [ ] Add cleanup on unmount
- [ ] Write tests

### 3.7 Audio Init Hook (`state/hooks/useAudioInit.ts`)
- [ ] Create `state/hooks/useAudioInit.ts`
- [ ] Implement `useAudioInit()` hook
- [ ] Create synthesizer instance
- [ ] Implement `initialize()` function
- [ ] Load current preset
- [ ] Update audio store
- [ ] Handle errors
- [ ] Add cleanup on unmount
- [ ] Write tests

### 3.8 Drum Recorder Hook (`state/hooks/useDrumRecorder.ts`)
- [ ] Create `state/hooks/useDrumRecorder.ts`
- [ ] Implement `useDrumRecorder()` hook
- [ ] Define `DRUM_SAMPLES` array
- [ ] Implement `initialize()` function
- [ ] Implement `handleSpacebar()` (Boss-style state machine)
- [ ] Implement `handleClear()`
- [ ] Implement `handleQuantize()`
- [ ] Implement `triggerSample()`
- [ ] Add cleanup on unmount
- [ ] Write tests for state machine transitions

---

## Phase 4: UI Components 🎨

### 4.1 Utilities
- [ ] Create `lib/utils.ts`
- [ ] Implement `debounce()` utility function
- [ ] Implement `cn()` class name utility (keep existing)
- [ ] Create `lib/errors.tsx`
- [ ] Implement `AudioErrorBoundary` component
- [ ] Write tests

### 4.2 Harmonic Keyboard (`components/instrument/HarmonicKeyboard.tsx`)
- [ ] Create `components/instrument/HarmonicKeyboard.tsx`
- [ ] Use `useKeyboardInput()` hook
- [ ] Use `useAudioInit()` hook
- [ ] Use `useChordPlayback()` hook
- [ ] Access `currentVoicing` from store
- [ ] Render `ChordDisplay`
- [ ] Render `KeyboardGuide`
- [ ] Render `PianoVisualization`
- [ ] Add error boundary
- [ ] Write component tests

### 4.3 Chord Display (`components/instrument/ChordDisplay.tsx`)
- [ ] Create `components/instrument/ChordDisplay.tsx`
- [ ] Display chord name (root + quality)
- [ ] Display bass note if not root position
- [ ] Display inversion indicator
- [ ] Add animations (Framer Motion)
- [ ] Style with Tailwind
- [ ] Write component tests

### 4.4 Keyboard Guide (`components/instrument/KeyboardGuide.tsx`)
- [ ] Create `components/instrument/KeyboardGuide.tsx`
- [ ] Display bass key section with labels
- [ ] Display quality key section with labels
- [ ] Display position key section
- [ ] Highlight active keys based on `pressedKeys` store
- [ ] Show enabled/disabled quality keys from settings
- [ ] Style with Tailwind
- [ ] Write component tests

### 4.5 Piano Visualization (`components/instrument/PianoVisualization.tsx`)
- [ ] Create `components/instrument/PianoVisualization.tsx`
- [ ] Render 3-octave piano keyboard (C3-C6)
- [ ] Highlight active notes from `currentVoicing`
- [ ] Different colors for bass vs upper voices
- [ ] Smooth transitions (CSS or Framer Motion)
- [ ] Responsive design
- [ ] Write component tests

### 4.6 Drum Machine (`components/drums/DrumMachine.tsx`)
- [ ] Create `components/drums/DrumMachine.tsx`
- [ ] Use `useDrumRecorder()` hook
- [ ] Access drum store state
- [ ] Initialize on mount
- [ ] Handle keyboard events (spacebar, drum triggers)
- [ ] Render `WaveformDisplay`
- [ ] Render `RecordButton`
- [ ] Render `QuantizeButton`
- [ ] Render Clear button
- [ ] Write component tests

### 4.7 Waveform Display (`components/drums/WaveformDisplay.tsx`)
- [ ] Create `components/drums/WaveformDisplay.tsx`
- [ ] Render canvas element
- [ ] Draw waveform from `audioBlob`
- [ ] Animate progress bar based on loop position
- [ ] Show recording indicator
- [ ] Handle resize
- [ ] Write component tests

### 4.8 Record Button (`components/drums/RecordButton.tsx`)
- [ ] Create `components/drums/RecordButton.tsx`
- [ ] Display state-based label (Record/Stop/Overdub)
- [ ] Apply state-based styling
- [ ] Handle click event
- [ ] Add animations
- [ ] Write component tests

### 4.9 Quantize Button (`components/drums/QuantizeButton.tsx`)
- [ ] Create `components/drums/QuantizeButton.tsx`
- [ ] Render button with dropdown for grid size
- [ ] Options: 16th, 32nd, 64th notes
- [ ] Handle quantize action
- [ ] Disable when no recording
- [ ] Write component tests

### 4.10 Settings Modal (`components/settings/SettingsModal.tsx`)
- [ ] Create `components/settings/SettingsModal.tsx`
- [ ] Use shadcn Dialog component
- [ ] Render preset selector
- [ ] Render quality key mappings editor
- [ ] Render master volume slider
- [ ] Render Reset to Defaults button
- [ ] Connect to settings store
- [ ] Write component tests

### 4.11 Sound Controls (`components/settings/SoundControls.tsx`)
- [ ] Create `components/settings/SoundControls.tsx`
- [ ] Render synth parameter sliders
- [ ] Render effects parameter sliders
- [ ] Update synthesizer in real-time
- [ ] Organize in collapsible sections
- [ ] Write component tests

### 4.12 Preset Selector (`components/settings/PresetSelector.tsx`)
- [ ] Create `components/settings/PresetSelector.tsx`
- [ ] Render preset buttons/dropdown
- [ ] Highlight current preset
- [ ] Load preset on selection
- [ ] Show preset preview on hover
- [ ] Write component tests

### 4.13 Layout Components
- [ ] Create `components/layout/AppLayout.tsx`
- [ ] Create `components/layout/Header.tsx`
- [ ] Render navigation, settings button, help button
- [ ] Instrument switcher (Piano / Drums)
- [ ] Integrate with routing
- [ ] Write component tests

---

## Phase 5: Integration & Testing 🧪

### 5.1 App Integration
- [ ] Create `App.tsx` (root component)
- [ ] Create `main.tsx` (entry point)
- [ ] Set up routing with wouter
- [ ] Add error boundaries at top level
- [ ] Add loading states
- [ ] Test full app flow

### 5.2 Comprehensive Testing
- [ ] Run all unit tests (`npm run test`)
- [ ] Achieve 80%+ coverage on core logic
- [ ] Write E2E tests for critical flows:
  - [ ] Play chord sequence
  - [ ] Change presets
  - [ ] Record drum loop
  - [ ] Overdub drum loop
  - [ ] Quantize recording
- [ ] Test error scenarios
- [ ] Test localStorage persistence

### 5.3 Performance Testing
- [ ] Measure voice leading performance
- [ ] Measure audio latency
- [ ] Measure bundle size
- [ ] Optimize hot paths if needed
- [ ] Test on slower devices

### 5.4 Accessibility Audit
- [ ] Keyboard navigation (beyond instrument controls)
- [ ] Screen reader support for UI controls
- [ ] ARIA labels
- [ ] Focus management
- [ ] Color contrast

### 5.5 Documentation
- [ ] Add JSDoc comments to complex functions
- [ ] Create usage documentation
- [ ] Document architecture decisions
- [ ] Add inline code comments where needed
- [ ] Update README.md

---

## Phase 6: Cutover 🚀

### 6.1 Final Validation
- [ ] All features work identically to original
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Performance metrics meet targets
- [ ] Lighthouse score > 90

### 6.2 Migration
- [ ] Backup original `src/` directory
- [ ] Rename `src-new/` to `src/`
- [ ] Update all import paths in remaining files
- [ ] Update build configuration if needed
- [ ] Test production build

### 6.3 Cleanup
- [ ] Delete old `src/` backup after validation
- [ ] Remove unused dependencies from package.json
- [ ] Clean up any temp files
- [ ] Run final linting pass
- [ ] Final commit

### 6.4 Deployment
- [ ] Test production build locally
- [ ] Deploy to staging environment
- [ ] Smoke test in production-like environment
- [ ] Deploy to production
- [ ] Monitor for errors

---

## Success Metrics

After completion, verify:

### Functional
- ✅ All existing features work
- ✅ Keyboard feels responsive (< 50ms latency)
- ✅ Voice leading is smooth
- ✅ Settings persist across sessions
- ✅ No regressions from original

### Technical
- ✅ Zero global mutable state
- ✅ 80%+ test coverage
- ✅ No `any` types
- ✅ Bundle < 500KB gzipped
- ✅ Clean separation of concerns

### Quality
- ✅ All magic numbers in constants
- ✅ Comprehensive error handling
- ✅ Consistent code style
- ✅ Clear documentation

---

## Estimated Effort

**Total**: ~40-50 hours of focused work

- Phase 1: 10-12 hours
- Phase 2: 8-10 hours
- Phase 3: 10-12 hours
- Phase 4: 12-15 hours
- Phase 5: 8-10 hours
- Phase 6: 2-3 hours

---

## Notes

- Work in order - later phases depend on earlier ones
- Write tests as you go (TDD approach recommended)
- Commit frequently with clear messages
- Run tests after each module completion
- Ask for clarification if specification is unclear

Good luck! 🎹✨
