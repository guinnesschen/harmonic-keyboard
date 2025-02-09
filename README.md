# harmonic-keyboard

A musical instrument that generates dynamic chord voicings using intelligent voice leading algorithms. It works by mapping chord intent (bass note + quality + inversion) to concrete voicings that minimize total semitone movement between consecutive chords.

## How It Works

The instrument operates at a higher level of abstraction than traditional digital music tools. Instead of working with individual notes, you work directly with chord intents - expressing harmony through three simple parameters:

- Bass note (the lowest sounding pitch)
- Chord quality (major, minor, dominant, etc.)  
- Inversion (which chord tone appears in the bass)

Each chord requires only three keypresses to fully specify. The voicing engine then generates a full 5-voice realization optimized for voice leading with the previous chord.

## Voice Leading Implementation

The voice leading algorithm uses a variant of the Wasserstein distance (Earth Mover's Distance) to compute optimal transitions between chord voicings. For any two consecutive chords:

1. It represents each chord as a set of pitch points
2. Computes the minimal total semitone movement needed to transform one pitch set into another 
3. Finds the mapping between voices that achieves this minimal movement
4. Maintains proper spacing between voices throughout the transition

The engine maintains 5 voices (bass + 4 upper voices) and can double pitches when needed for triads. This creates full, piano-like voicings while ensuring smooth voice leading transitions between chords.

## Controls

The interface maps approximately 500 unique chords through three parameters:

1. **Bass Notes**: Bottom two keyboard rows specify the bass note
2. **Chord Quality**: Hold a quality modifier (Q-U keys) while pressing a bass note
   - Q - Major triad
   - W - Major seventh  
   - E - Dominant seventh
   - R - Minor triad
   - T - Minor seventh
   - Y - Diminished seventh
   - U - Half-diminished
3. **Inversions**: Numbers 0-3 specify the chord inversion
   - 0: Root position  
   - 1: First inversion (third in bass)
   - 2: Second inversion (fifth in bass)
   - 3: Third inversion (seventh in bass, for seventh chords)

Example: To play C/E (C major first inversion), hold Q (major quality) + 1 (first inversion), then press the key mapped to E.

## Technical Stack

- TypeScript/React frontend for UI and state management
- Tone.js for audio synthesis and effects processing
- Custom voice leading algorithms implemented in TypeScript
- Modular audio pipeline with configurable:
  - Oscillator types and spread
  - ADSR envelope
  - Effects chain (reverb, chorus, EQ, compression, distortion)
  - Real-time parameter modulation

The codebase emphasizes type safety, component reusability, and efficient state management for real-time audio processing.