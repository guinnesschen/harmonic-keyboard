import {
  ChordQuality,
  ChordPosition,
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

export function generateVoicingFromKeyState(): ChordVoicing | null {
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

  // The root note comes from the bass key
  const rootIndex = getNoteFromKey(bassKey, BASS_KEYS);

  const voicing: ChordVoicing = {
    root: rootIndex,
    bass: -1, // Will be set by voiceLeading.ts based on position
    quality: qualityKey ? getQualityFromKey(qualityKey) : ChordQuality.Major,
    position: positionKey ? getPositionFromKey(positionKey) : ChordPosition.Root,
    notes: [], // Will be populated by voiceLeading.ts
  };

  return voicing;
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