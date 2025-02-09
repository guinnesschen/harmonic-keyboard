# Harmonova

Harmonova is an advanced musical exploration platform that generates dynamic chord voicings with intelligent, context-aware voice leading algorithms. It provides an intuitive, ergonomic interface for exploring complex harmonic landscapes with minimal physical effort.

## Overview

This instrument operates at a higher level of abstraction than traditional digital music tools. Instead of working with individual notes, you work directly with chord intents - expressing harmony through a concise three-dimensional control space of bass notes, chord quality, and inversion. This approach makes it possible to achieve fluid chord progressions with minimal hand movement, as each chord requires only three keypresses to fully specify.

## Key Features

- **Intuitive Chord Control System**: Map approximately 500 unique chords through three simple parameters
- **Real-time Audio Generation**: Dynamic sound synthesis with configurable oscillators and effects
- **Intelligent Voice Leading**: Sophisticated algorithms for smooth chord transitions
- **Interactive Piano Visualization**: Real-time visual feedback of chord voicings
- **Flexible Sound Design**: Comprehensive synth parameter control
- **Responsive Interface**: Optimized for both desktop and mobile experiences

## Technical Implementation

### Frontend (TypeScript + React)
- Built with React and TypeScript for type-safe, component-based architecture
- Uses `Tone.js` for high-performance audio synthesis and processing
- Implements custom hooks for keyboard event handling and audio state management
- Features a responsive UI built with shadcn/ui and Tailwind CSS

### Core Engine
- **Voice Leading Algorithm**: Uses an optimized implementation of the Wasserstein distance (Earth Mover's Distance) to compute optimal voice transitions between chords
- **Chord Generation**: Maintains a five-voice system (bass + four upper voices) with intelligent pitch spacing
- **Real-time Audio Processing**: Features a sophisticated audio pipeline with:
  - Configurable oscillator types and spread
  - ADSR envelope control
  - Modular effects chain (reverb, chorus, EQ, compression, distortion)
  - Real-time parameter modulation

### State Management
- Implements a custom keyboard state management system
- Uses React Query for efficient data handling
- Features debounced chord updates for smooth performance

## Usage

The interface uses a three-part control system:

1. **Bass Notes**: Bottom two keyboard rows specify the bass note
2. **Chord Quality**: Hold a quality modifier (Q-U keys) while pressing a bass note
3. **Inversions**: Numbers 0-3 specify the chord inversion

Example: To play C/E (C major first inversion)
- Hold Q (major quality) + 1 (first inversion)
- Press the key mapped to E (bass note)

## Technical Stack

- TypeScript/React frontend
- Tone.js for audio processing
- shadcn/ui + Tailwind CSS for styling
- Custom voice leading algorithms
- Modular audio effects chain

## Development

This project is built with modern web technologies and best practices. The codebase emphasizes:
- Strong typing with TypeScript
- Component reusability
- Clear separation of concerns
- Efficient state management
- Performant real-time audio processing

---

Built with ♪♫ by Team Harmonova
