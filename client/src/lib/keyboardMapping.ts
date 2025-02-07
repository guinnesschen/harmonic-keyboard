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

  if (!currentVoicing) {
    if (bassNote !== null) {
      return {
        root: bassNote,
        bass: bassNote + 48, // Bass octave
        melody: bassNote + 72, // Melody octave
        quality: ChordQuality.Major,
        extension: ChordExtension.None,
        notes: []
      };
    }
    return null;
  }

  const newVoicing = { ...currentVoicing };

  if (bassNote !== null) {
    newVoicing.root = bassNote;
    newVoicing.bass = bassNote + 48;
  }
  if (melodyNote !== null) {
    newVoicing.melody = melodyNote + 72;
  }
  if (quality !== null) {
    newVoicing.quality = quality;
  }
  if (extension !== null) {
    newVoicing.extension = extension;
  }

  return newVoicing;
}

export function handleKeyRelease(e: KeyboardEvent) {
  activeKeys.delete(e.key);
}

export function getKeyboardLayout() {
  return {
    melodyKeys: MELODY_KEYS.split(""),
    bassKeys: BASS_KEYS.split(""),
    qualityKeys: QUALITY_KEYS.split(""),
    extensionKeys: EXTENSION_KEYS.split("")
  };
}
