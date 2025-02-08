import {
  ChordQuality,
  ChordPosition,
  InversionMode,
  StickyMode,
  type ChordVoicing,
} from "@shared/schema";

// Define keyboard mappings (all lowercase for consistent comparison)
const BASS_KEYS = "zsxdcvgbhnjm";
const QUALITY_KEYS = "qwertyu";  // One key per chord quality
const POSITION_KEYS = "01234";  // Number row for inversions, including root position

// Single source of truth for pressed keys
const pressedKeys = new Set<string>();

// Store the last generated voicing for sticky mode
let lastGeneratedVoicing: ChordVoicing | null = null;

// Track spacebar state for temporary sticky mode
let isSpacebarPressed = false;

function getNoteFromKey(key: string, keyMap: string): number {
  const index = keyMap.indexOf(key.toLowerCase());
  return index;
}

function getDefaultQualityForFunctionalMode(bassKey: string, position: ChordPosition): ChordQuality {
  // Convert key to note index (0 = C, 1 = C#, etc.)
  const noteIndex = getNoteFromKey(bassKey, BASS_KEYS);

  if (position === ChordPosition.First) {
    // First inversion defaults
    const firstInversionDefaults: Record<number, ChordQuality> = {
      0: ChordQuality.Minor,    // C
      1: ChordQuality.Major,    // C#
      2: ChordQuality.Major,    // D
      3: ChordQuality.Minor,    // D#
      4: ChordQuality.Major,    // E
      5: ChordQuality.Minor,    // F
      6: ChordQuality.Major,    // F#
      7: ChordQuality.Minor,    // G
      8: ChordQuality.Minor,    // G#
      9: ChordQuality.Major,    // A
      10: ChordQuality.Minor,   // A#
      11: ChordQuality.Major,   // B
    };
    return firstInversionDefaults[noteIndex] || ChordQuality.Major;
  }

  if (position === ChordPosition.Second) {
    // Second inversion defaults
    const secondInversionDefaults: Record<number, ChordQuality> = {
      0: ChordQuality.Major,    // C
      1: ChordQuality.Major,    // C#
      2: ChordQuality.Major,    // D
      3: ChordQuality.Major,    // D#
      4: ChordQuality.Minor,    // E
      5: ChordQuality.Major,    // F
      6: ChordQuality.Major,    // F#
      7: ChordQuality.Major,    // G
      8: ChordQuality.Major,    // G#
      9: ChordQuality.Minor,    // A
      10: ChordQuality.Major,   // A#
      11: ChordQuality.Minor,   // B
    };
    return secondInversionDefaults[noteIndex] || ChordQuality.Major;
  }

  if (position === ChordPosition.ThirdSeventh) {
    // Third inversion defaults
    const thirdInversionDefaults: Record<number, ChordQuality> = {
      0: ChordQuality.Minor7,     // C
      1: ChordQuality.Major7,     // C#
      2: ChordQuality.Minor7,     // D
      3: ChordQuality.Major7,     // D#
      4: ChordQuality.Major7,     // E
      5: ChordQuality.Dominant7,  // F
      6: ChordQuality.Major7,     // F#
      7: ChordQuality.Minor7,     // G
      8: ChordQuality.Major7,     // G#
      9: ChordQuality.Minor7,     // A
      10: ChordQuality.Dominant7, // A#
      11: ChordQuality.Major7,    // B
    };
    return thirdInversionDefaults[noteIndex] || ChordQuality.Major7;
  }

  // Root position - keep original defaults
  return ChordQuality.Major;
}

function getQualityFromKey(key: string, position: ChordPosition = ChordPosition.Root, inversionMode: InversionMode = InversionMode.Traditional): ChordQuality {
  // Default chord qualities for white keys (diatonic chords in C major)
  const whiteKeyQualities: Record<string, ChordQuality> = {
    "z": ChordQuality.Major,      // C
    "x": ChordQuality.Minor,      // D
    "c": ChordQuality.Minor,      // E
    "v": ChordQuality.Major,      // F
    "b": ChordQuality.Major,      // G
    "n": ChordQuality.Minor,      // A
    "m": ChordQuality.HalfDiminished7, // B
  };

  // All black keys default to major
  const blackKeyQualities: Record<string, ChordQuality> = {
    "s": ChordQuality.Major,      // C#
    "d": ChordQuality.Major,      // D#
    "g": ChordQuality.Major,      // F#
    "h": ChordQuality.Major,      // G#
    "j": ChordQuality.Major,      // A#
  };

  const qualityMap: Record<string, ChordQuality> = {
    "q": ChordQuality.Major,
    "w": ChordQuality.Major7,
    "e": ChordQuality.Dominant7,
    "r": ChordQuality.Minor,
    "t": ChordQuality.Minor7,
    "y": ChordQuality.Diminished7,
    "u": ChordQuality.HalfDiminished7,
  };

  // If a quality key is pressed, use that
  const qualityKey = Array.from(pressedKeys).find(key => QUALITY_KEYS.includes(key.toLowerCase()));
  if (qualityKey) {
    return qualityMap[qualityKey] || ChordQuality.Major;
  }

  // Get the bass key being pressed
  const bassKey = Array.from(pressedKeys).find(key => BASS_KEYS.includes(key.toLowerCase()));
  if (!bassKey) {
    return ChordQuality.Major;
  }

  // In functional mode, use the new default qualities based on position and bass note
  if (inversionMode === InversionMode.Functional) {
    return getDefaultQualityForFunctionalMode(bassKey, position);
  }

  // In traditional mode, use the original default qualities
  return whiteKeyQualities[bassKey] || blackKeyQualities[bassKey] || ChordQuality.Major;
}

function getPositionFromKey(key: string): ChordPosition {
  const positionMap: Record<string, ChordPosition> = {
    "0": ChordPosition.Root,
    "1": ChordPosition.First,
    "2": ChordPosition.Second,
    "3": ChordPosition.ThirdSeventh,
  };
  return positionMap[key] || ChordPosition.Root;
}

// Helper function to calculate root note in functional mode
function calculateRootFromBassAndFunction(bassNote: number, position: ChordPosition, quality: ChordQuality): number {
  // Get intervals for the current chord quality
  const intervals = getChordIntervals(quality);

  // In functional mode, we need to work backwards from the bass note and its function
  // to determine the root note
  let offset = 0;
  switch (position) {
    case ChordPosition.First: // Bass is the third
      offset = -intervals[1]; // Subtract the third interval
      break;
    case ChordPosition.Second: // Bass is the fifth
      offset = -intervals[2]; // Subtract the fifth interval
      break;
    case ChordPosition.ThirdSeventh: // Bass is the seventh
      offset = -intervals[3]; // Subtract the seventh interval
      break;
    default: // Root position
      offset = 0;
  }

  // Calculate root note and normalize to 0-11 range
  return ((bassNote + offset) + 12) % 12;
}

function getChordIntervals(quality: ChordQuality): number[] {
  switch (quality) {
    case ChordQuality.Major:
      return [0, 4, 7];
    case ChordQuality.Minor:
      return [0, 3, 7];
    case ChordQuality.Major7:
      return [0, 4, 7, 11];
    case ChordQuality.Dominant7:
      return [0, 4, 7, 10];
    case ChordQuality.Minor7:
      return [0, 3, 7, 10];
    case ChordQuality.Diminished7:
      return [0, 3, 6, 9];
    case ChordQuality.HalfDiminished7:
      return [0, 3, 6, 10];
    default:
      return [0, 4, 7];
  }
}

export function generateVoicingFromKeyState(
  inversionMode: InversionMode = InversionMode.Traditional,
  stickyMode: StickyMode = StickyMode.Off
): ChordVoicing | null {
  const currentKeys = Array.from(pressedKeys).map(key => key.toLowerCase());

  // Check if spacebar is pressed
  if (currentKeys.includes(" ")) {
    return null;
  }

  // Determine effective sticky mode (including temporary sticky from spacebar)
  const effectiveStickyMode = stickyMode === StickyMode.On || isSpacebarPressed;

  const bassKey = currentKeys.find(key => BASS_KEYS.includes(key));
  const qualityKey = currentKeys.find(key => QUALITY_KEYS.includes(key));
  const positionKey = currentKeys.find(key => POSITION_KEYS.includes(key));

  if (effectiveStickyMode && lastGeneratedVoicing) {
    // In sticky mode, modify the last voicing based on any new keys
    const voicing = { ...lastGeneratedVoicing };

    // Update quality if a quality key is pressed
    if (qualityKey) {
      voicing.quality = getQualityFromKey(qualityKey, voicing.position, inversionMode);
    }

    // Update position if a position key is pressed
    if (positionKey) {
      const newPosition = getPositionFromKey(positionKey);
      voicing.position = newPosition;
      // Update quality based on new position in functional mode
      if (!qualityKey && inversionMode === InversionMode.Functional && bassKey) {
        voicing.quality = getQualityFromKey(bassKey, newPosition, inversionMode);
      }
    }

    // Update root/bass if a bass key is pressed
    if (bassKey) {
      const bassNote = getNoteFromKey(bassKey, BASS_KEYS);
      if (inversionMode === InversionMode.Traditional) {
        voicing.root = bassNote;
        voicing.bass = -1; // Will be set by voiceLeading.ts
      } else {
        voicing.root = calculateRootFromBassAndFunction(bassNote, voicing.position, voicing.quality);
        voicing.bass = bassNote + 48;
      }
    }

    lastGeneratedVoicing = voicing;
    return voicing;
  }

  // If no bass note is pressed and we're not in sticky mode, return null
  if (!bassKey && !effectiveStickyMode) {
    return null;
  }

  // Get the basic parameters
  const bassNote = bassKey ? getNoteFromKey(bassKey, BASS_KEYS) : (lastGeneratedVoicing?.root || 0);
  const position = positionKey ? getPositionFromKey(positionKey) : ChordPosition.Root;
  // Get quality considering both the quality key and the position/bass note in functional mode
  const quality = qualityKey 
    ? getQualityFromKey(qualityKey, position, inversionMode)
    : getQualityFromKey(bassKey || "", position, inversionMode);

  let voicing: ChordVoicing;
  if (inversionMode === InversionMode.Traditional) {
    voicing = {
      root: bassNote,
      bass: -1, // Will be set by voiceLeading.ts based on position
      quality,
      position,
      notes: [], // Will be populated by voiceLeading.ts
    };
  } else {
    const rootNote = calculateRootFromBassAndFunction(bassNote, position, quality);
    voicing = {
      root: rootNote,
      bass: bassNote + 48, // Set the actual bass note (in octave 3)
      quality,
      position,
      notes: [], // Will be populated by voiceLeading.ts
    };
  }

  lastGeneratedVoicing = voicing;
  return voicing;
}

export function handleKeyPress(e: KeyboardEvent): void {
  const key = e.key.toLowerCase();
  pressedKeys.add(key);

  if (key === " ") {
    isSpacebarPressed = true;
  }
}

export function handleKeyRelease(e: KeyboardEvent, stickyMode: StickyMode = StickyMode.Off): boolean {
  const key = e.key.toLowerCase();
  pressedKeys.delete(key);

  if (key === " ") {
    isSpacebarPressed = false;
    if (stickyMode === StickyMode.On) {
      // In sticky mode, spacebar release clears the chord
      lastGeneratedVoicing = null;
      return true;
    }
  }

  if (stickyMode === StickyMode.On) {
    // In sticky mode, never clear the chord except for spacebar
    return false;
  }

  // In normal mode, clear the chord when all keys are released
  if (pressedKeys.size === 0) {
    lastGeneratedVoicing = null;
    return true;
  }

  return false;
}

export function getKeyboardLayout() {
  return {
    qualityKeys: QUALITY_KEYS.toUpperCase().split(""),
    positionKeys: POSITION_KEYS.split(""),
    bassKeys: BASS_KEYS.toUpperCase().split(""),
  };
}

export function getActiveKeys(): string[] {
  return Array.from(pressedKeys);
}

export function getMidiNoteKey(midiNote: number): string | null {
  const noteIndex = midiNote % 12;
  const keyMap: Record<number, string> = {
    0: 'z',  // C
    1: 's',  // C#
    2: 'x',  // D
    3: 'd',  // D#
    4: 'c',  // E
    5: 'v',  // F
    6: 'g',  // F#
    7: 'b',  // G
    8: 'h',  // G#
    9: 'n',  // A
    10: 'j', // A#
    11: 'm'  // B
  };

  return keyMap[noteIndex] || null;
}