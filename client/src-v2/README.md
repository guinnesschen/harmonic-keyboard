# Harmonic Keyboard v2

A clean rewrite of the Harmonic Keyboard with improved architecture.

## Running v2

From the project root:

```bash
npm run dev:v2
```

Then open http://localhost:5173/index-v2.html

## Architecture

```
src-v2/
├── domain/           # Pure TypeScript - music theory
│   ├── types.ts      # Type definitions
│   ├── constants.ts  # Musical constants
│   ├── chord.ts      # Chord utilities
│   ├── voiceLeading.ts
│   └── keyMapping.ts
│
├── audio/            # Tone.js abstraction
│   ├── ChordSynth.ts
│   ├── DrumKit.ts
│   └── presets.ts
│
├── state/            # React Context
│   ├── AudioContext.tsx
│   ├── KeyboardContext.tsx
│   └── StorageContext.tsx
│
├── hooks/            # Custom hooks
│   ├── useChordPlayer.ts
│   └── useDrumPlayer.ts
│
└── components/       # UI components
    ├── piano/
    ├── drums/
    ├── settings/
    └── ui/
```

## Key Improvements over v1

1. **No global mutable state** - Keyboard tracking in React Context
2. **Settings persistence** - Uses localStorage
3. **Clean separation** - Domain logic has no dependencies
4. **Smaller components** - Max ~150 lines each
5. **Fewer dependencies** - Only React, Tone.js, Tailwind
