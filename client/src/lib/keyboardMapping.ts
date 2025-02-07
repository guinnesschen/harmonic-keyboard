import { ChordQuality, ChordExtension, type ChordVoicing } from "@shared/schema";

const BASS_KEYS = "ZSXDCVGBHNJM";
const MELODY_KEYS = "QWERTYUIOP";
const QUALITY_KEYS = "1234567";
const EXTENSION_KEYS = "890-=";

let activeKeys = new Set<string>();

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
    "7": ChordQuality.Major7
  };
  return qualityMap[key] || null;
}

function getExtensionFromKey(key: string): ChordExtension | null {
  const extensionMap: Record<string, ChordExtension> = {
    "8": ChordExtension.None,
    "9": ChordExtension.Add9,
    "0": ChordExtension.Add11,
    "-": ChordExtension.Add13,
    "=": ChordExtension.Sharp11
  };
  return extensionMap[key] || null;
}

export function handleKeyPress(
  e: KeyboardEvent, 
  currentVoicing: ChordVoicing | null
): ChordVoicing | null {
  const key = e.key;
  if (activeKeys.has(key)) return null;
  activeKeys.add(key);

  const bassNote = getNoteFromKey(key, BASS_KEYS);
  const melodyNote = getNoteFromKey(key, MELODY_KEYS);
  const quality = getQualityFromKey(key);
  const extension = getExtensionFromKey(key);

  // Create a new voicing based on currently active keys
  if (bassNote !== null || melodyNote !== null || quality !== null || extension !== null) {
    const voicing: ChordVoicing = {
      root: -1,
      bass: -1,
      melody: -1,
      quality: ChordQuality.Major, // Default, but won't be used unless quality is selected
      extension: ChordExtension.None,
      notes: []
    };

    // Update active bass note
    const activeBassKey = Array.from(activeKeys).find(k => BASS_KEYS.includes(k.toUpperCase()));
    if (activeBassKey) {
      const bassIndex = getNoteFromKey(activeBassKey, BASS_KEYS)!;
      voicing.root = bassIndex;
      voicing.bass = bassIndex + 48;
      voicing.notes = [voicing.bass];
    }

    // Update active melody note
    const activeMelodyKey = Array.from(activeKeys).find(k => MELODY_KEYS.includes(k.toUpperCase()));
    if (activeMelodyKey) {
      const melodyIndex = getNoteFromKey(activeMelodyKey, MELODY_KEYS)!;
      voicing.melody = melodyIndex + 72;
      if (!voicing.notes.includes(voicing.melody)) {
        voicing.notes.push(voicing.melody);
      }
    }

    // Only set quality if explicitly selected
    const activeQualityKey = Array.from(activeKeys).find(k => QUALITY_KEYS.includes(k));
    if (activeQualityKey) {
      voicing.quality = getQualityFromKey(activeQualityKey)!;
    }

    // Only set extension if explicitly selected
    const activeExtensionKey = Array.from(activeKeys).find(k => EXTENSION_KEYS.includes(k));
    if (activeExtensionKey) {
      voicing.extension = getExtensionFromKey(activeExtensionKey)!;
    }

    return voicing;
  }

  return null;
}

export function handleKeyRelease(e: KeyboardEvent): boolean {
  activeKeys.delete(e.key);
  return activeKeys.size === 0;
}

export function getKeyboardLayout() {
  return {
    melodyKeys: MELODY_KEYS.split(""),
    bassKeys: BASS_KEYS.split(""),
    qualityKeys: QUALITY_KEYS.split(""),
    extensionKeys: EXTENSION_KEYS.split("")
  };
}