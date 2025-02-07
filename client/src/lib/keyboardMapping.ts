import {
  ChordQuality,
  ChordExtension,
  type ChordVoicing,
} from "@shared/schema";

// Define keyboard mappings (all lowercase for consistent comparison)
const BASS_KEYS = "zsxdcvgbhnjm";
const MELODY_KEYS = "qwertyuiop";
const QUALITY_KEYS = "1234567";
const EXTENSION_KEYS = "890-=";

// Single source of truth for pressed keys
const pressedKeys = new Set<string>();

function getNoteFromKey(key: string, keyMap: string): number {
  const index = keyMap.indexOf(key.toLowerCase());
  return index;
}

function getQualityFromKey(key: string): ChordQuality {
  const qualityMap: Record<string, ChordQuality> = {
    "1": ChordQuality.Major,
    "2": ChordQuality.Minor,
    "3": ChordQuality.Dominant7,
    "4": ChordQuality.Diminished,
    "5": ChordQuality.Augmented,
    "6": ChordQuality.Minor7,
    "7": ChordQuality.Major7,
  };
  return qualityMap[key] || ChordQuality.Major;
}

function getExtensionFromKey(key: string): ChordExtension {
  const extensionMap: Record<string, ChordExtension> = {
    "8": ChordExtension.None,
    "9": ChordExtension.Add9,
    "0": ChordExtension.Add11,
    "-": ChordExtension.Add13,
    "=": ChordExtension.Sharp11,
  };
  return extensionMap[key] || ChordExtension.None;
}

export function generateVoicingFromKeyState(): ChordVoicing | null {
  // Convert to array and lowercase for consistent comparison
  const currentKeys = Array.from(pressedKeys).map(key => key.toLowerCase());

  // Find first matching key of each type
  const bassKey = currentKeys.find(key => BASS_KEYS.includes(key));
  const melodyKey = currentKeys.find(key => MELODY_KEYS.includes(key));
  const qualityKey = currentKeys.find(key => QUALITY_KEYS.includes(key));
  const extensionKey = currentKeys.find(key => EXTENSION_KEYS.includes(key));

  // If no bass or melody key is pressed, return null
  if (!bassKey && !melodyKey) {
    return null;
  }

  const voicing: ChordVoicing = {
    root: -1,
    bass: -1,
    melody: -1,
    quality: ChordQuality.Major,
    extension: ChordExtension.None,
    notes: [],
  };

  // Process bass note if present
  if (bassKey) {
    const bassIndex = getNoteFromKey(bassKey, BASS_KEYS);
    voicing.root = bassIndex;
    voicing.bass = bassIndex + 48; // Bass octave
  }

  // Process melody note if present
  if (melodyKey) {
    const melodyIndex = getNoteFromKey(melodyKey, MELODY_KEYS);
    voicing.melody = melodyIndex + 72; // Melody octave
  }

  // Process chord quality if present
  if (qualityKey) {
    voicing.quality = getQualityFromKey(qualityKey);
  } else {
    voicing.root = -1; // No chord quality selected, just play single notes
  }

  // Process extension if both quality and extension are present
  if (qualityKey && extensionKey) {
    voicing.extension = getExtensionFromKey(extensionKey);
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
    melodyKeys: MELODY_KEYS.toUpperCase().split(""),
    bassKeys: BASS_KEYS.toUpperCase().split(""),
    qualityKeys: QUALITY_KEYS.split(""),
    extensionKeys: EXTENSION_KEYS.split(""),
  };
}

export function getActiveKeys(): string[] {
  return Array.from(pressedKeys);
}