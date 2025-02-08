import {
  ChordQuality,
  ChordPosition,
  type ChordVoicing,
} from "@shared/schema";

// Define keyboard mappings (all lowercase for consistent comparison)
const BASS_KEYS = "zsxdcvgbhnjm";
const QUALITY_KEYS = "qwertyuiop";
const POSITION_KEYS = "asdfghjkl";

// Single source of truth for pressed keys
const pressedKeys = new Set<string>();

function getNoteFromKey(key: string, keyMap: string): number {
  const index = keyMap.indexOf(key.toLowerCase());
  return index;
}

function getQualityFromKey(key: string): ChordQuality {
  const qualityMap: Record<string, ChordQuality> = {
    "q": ChordQuality.Major,
    "w": ChordQuality.Minor,
    "e": ChordQuality.Dominant7,
    "r": ChordQuality.Diminished,
    "t": ChordQuality.Augmented,
    "y": ChordQuality.Minor7,
    "u": ChordQuality.Major7,
  };
  return qualityMap[key] || ChordQuality.Major;
}

function getPositionFromKey(key: string): ChordPosition {
  const positionMap: Record<string, ChordPosition> = {
    "a": ChordPosition.Root,
    "s": ChordPosition.First,
    "d": ChordPosition.Second,
    "f": ChordPosition.ThirdSeventh,
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

  const voicing: ChordVoicing = {
    root: -1,
    bass: -1,
    quality: ChordQuality.Major,
    position: ChordPosition.Root,
    notes: [],
  };

  // Process bass note
  const bassIndex = getNoteFromKey(bassKey, BASS_KEYS);
  voicing.bass = bassIndex + 48; // Bass octave

  // If we have a quality selected, set the root to the bass note
  // (this will be adjusted by position/inversion later)
  if (qualityKey) {
    voicing.root = bassIndex;
    voicing.quality = getQualityFromKey(qualityKey);
  } else {
    voicing.root = -1; // No chord quality selected, just play single notes
  }

  // Process position/inversion if both quality and position are present
  if (qualityKey && positionKey) {
    voicing.position = getPositionFromKey(positionKey);
  }

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
    positionKeys: POSITION_KEYS.toUpperCase().split(""),
    bassKeys: BASS_KEYS.toUpperCase().split(""),
  };
}

export function getActiveKeys(): string[] {
  return Array.from(pressedKeys);
}