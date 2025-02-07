import {
  ChordQuality,
  ChordExtension,
  type ChordVoicing,
} from "@shared/schema";

const BASS_KEYS = "ZSXDCVGBHNJM";
const MELODY_KEYS = "QWERTYUIOP";
const QUALITY_KEYS = "1234567";
const EXTENSION_KEYS = "890-=";

// Track the most recently pressed key for each category
interface KeyState {
  bass: string | null;
  melody: string | null;
  quality: string | null;
  extension: string | null;
}

const keyState: KeyState = {
  bass: null,
  melody: null,
  quality: null,
  extension: null,
};

function getNoteFromKey(key: string, keyMap: string): number | null {
  const index = keyMap.indexOf(key.toUpperCase());
  return index !== -1 ? index : null;
}

function getQualityFromKey(key: string): ChordQuality | null {
  const qualityMap: Record<string, ChordQuality> = {
    "1": ChordQuality.Major,
    "2": ChordQuality.Minor,
    "3": ChordQuality.Dominant7,
    "4": ChordQuality.Diminished,
    "5": ChordQuality.Augmented,
    "6": ChordQuality.Minor7,
    "7": ChordQuality.Major7,
  };
  return qualityMap[key] || null;
}

function getExtensionFromKey(key: string): ChordExtension | null {
  const extensionMap: Record<string, ChordExtension> = {
    "8": ChordExtension.None,
    "9": ChordExtension.Add9,
    "0": ChordExtension.Add11,
    "-": ChordExtension.Add13,
    "=": ChordExtension.Sharp11,
  };
  return extensionMap[key] || null;
}

export function handleKeyPress(
  e: KeyboardEvent,
  currentVoicing: ChordVoicing | null,
): ChordVoicing | null {
  const key = e.key.toLowerCase();

  // Update key state based on the category of the pressed key
  if (BASS_KEYS.toLowerCase().includes(key)) {
    keyState.bass = key;
  } else if (MELODY_KEYS.toLowerCase().includes(key)) {
    keyState.melody = key;
  } else if (QUALITY_KEYS.includes(key)) {
    keyState.quality = key;
  } else if (EXTENSION_KEYS.includes(key)) {
    keyState.extension = key;
  } else {
    return null; // Not a valid key
  }

  // Initialize voicing with default values
  const voicing: ChordVoicing = {
    root: -1,
    bass: -1,
    melody: -1,
    quality: ChordQuality.Major,
    extension: ChordExtension.None,
    notes: [],
  };

  // If we have a bass note, set the root and bass note
  if (keyState.bass) {
    const bassIndex = getNoteFromKey(keyState.bass, BASS_KEYS)!;
    voicing.root = bassIndex;
    voicing.bass = bassIndex + 48; // Bass octave
  }

  // If we have a quality selected, update it
  if (keyState.quality) {
    voicing.quality = getQualityFromKey(keyState.quality)!;
  } else {
    // If no quality is selected, only play single notes
    voicing.root = -1;
  }

  // Add melody note if present
  if (keyState.melody) {
    const melodyIndex = getNoteFromKey(keyState.melody, MELODY_KEYS)!;
    voicing.melody = melodyIndex + 72; // Melody octave
  }

  // Set extension if quality is selected
  if (keyState.quality && keyState.extension) {
    voicing.extension = getExtensionFromKey(keyState.extension)!;
  }

  // Initialize notes array with bass note if present
  voicing.notes = [];
  if (voicing.bass !== -1) {
    voicing.notes.push(voicing.bass);
  }

  // Add melody note if present
  if (voicing.melody !== -1) {
    voicing.notes.push(voicing.melody);
  }

  return voicing;
}

export function handleKeyRelease(e: KeyboardEvent): boolean {
  const key = e.key.toLowerCase();

  // Clear the released key from the appropriate category
  if (BASS_KEYS.toLowerCase().includes(key) && keyState.bass === key) {
    keyState.bass = null;
  } else if (MELODY_KEYS.toLowerCase().includes(key) && keyState.melody === key) {
    keyState.melody = null;
  } else if (QUALITY_KEYS.includes(key) && keyState.quality === key) {
    keyState.quality = null;
  } else if (EXTENSION_KEYS.includes(key) && keyState.extension === key) {
    keyState.extension = null;
  }

  // Return whether all keys are released
  return !keyState.bass && !keyState.melody && !keyState.quality && !keyState.extension;
}

export function getKeyboardLayout() {
  return {
    melodyKeys: MELODY_KEYS.split(""),
    bassKeys: BASS_KEYS.split(""),
    qualityKeys: QUALITY_KEYS.split(""),
    extensionKeys: EXTENSION_KEYS.split(""),
  };
}

export function getActiveKeys() {
  return Object.values(keyState).filter(key => key !== null) as string[];
}