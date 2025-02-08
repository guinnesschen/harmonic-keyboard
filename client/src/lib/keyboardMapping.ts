import {
  ChordQuality,
  ChordPosition,
  InversionMode,
  type ChordVoicing,
} from "@shared/schema";

// Define keyboard mappings (all lowercase for consistent comparison)
const BASS_KEYS = "zsxdcvgbhnjm";
const QUALITY_KEYS = "qwertyu";  // One key per chord quality, 'u' added for HalfDiminished7
const POSITION_KEYS = "12345";  // Number row for inversions

// Single source of truth for pressed keys
const pressedKeys = new Set<string>();

function getNoteFromKey(key: string, keyMap: string): number {
  const index = keyMap.indexOf(key.toLowerCase());
  return index;
}

function getQualityFromKey(key: string): ChordQuality {
  const qualityMap: Record<string, ChordQuality> = {
    "q": ChordQuality.Major,
    "w": ChordQuality.Major7,
    "e": ChordQuality.Dominant7,
    "r": ChordQuality.Minor,
    "t": ChordQuality.Minor7,
    "y": ChordQuality.Diminished7,
    "u": ChordQuality.HalfDiminished7,
  };
  return qualityMap[key] || ChordQuality.Major;
}

function getPositionFromKey(key: string): ChordPosition {
  const positionMap: Record<string, ChordPosition> = {
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

export function generateVoicingFromKeyState(inversionMode: InversionMode = InversionMode.Traditional): ChordVoicing | null {
  // Convert to array and lowercase for consistent comparison
  const currentKeys = Array.from(pressedKeys).map(key => key.toLowerCase());

  // Find first matching key of each type
  const bassKey = currentKeys.find(key => BASS_KEYS.includes(key));
  const qualityKey = currentKeys.find(key => QUALITY_KEYS.includes(key));
  const positionKey = currentKeys.find(key => POSITION_KEYS.includes(key));

  // If no bass note is pressed, return null
  if (!bassKey) {
    return null;
  }

  // Get the basic parameters
  const bassNote = getNoteFromKey(bassKey, BASS_KEYS);
  const quality = qualityKey ? getQualityFromKey(qualityKey) : ChordQuality.Major;
  const position = positionKey ? getPositionFromKey(positionKey) : ChordPosition.Root;

  if (inversionMode === InversionMode.Traditional) {
    // In traditional mode, bassKey determines the root note
    return {
      root: bassNote,
      bass: -1, // Will be set by voiceLeading.ts based on position
      quality,
      position,
      notes: [], // Will be populated by voiceLeading.ts
    };
  } else {
    // In functional mode, bassKey determines the actual bass note
    // and position determines what function that note serves in the chord
    const rootNote = calculateRootFromBassAndFunction(bassNote, position, quality);

    return {
      root: rootNote,
      bass: bassNote + 48, // Set the actual bass note (in octave 3)
      quality,
      position,
      notes: [], // Will be populated by voiceLeading.ts
    };
  }
}

export function handleKeyPress(e: KeyboardEvent): void {
  pressedKeys.add(e.key.toLowerCase());
}

export function handleKeyRelease(e: KeyboardEvent): boolean {
  pressedKeys.delete(e.key.toLowerCase());
  return pressedKeys.size === 0;
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

// Helper function to convert MIDI notes back to keyboard keys
export function getMidiNoteKey(midiNote: number): string | null {
  const noteIndex = midiNote % 12;
  // Map note indices to piano keys (both white and black)
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