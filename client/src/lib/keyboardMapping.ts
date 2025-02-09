import {
  ChordQuality,
  ChordPosition,
  type ChordVoicing,
  type QualityKeyMapping,
} from "@shared/schema";
import { getDefaultQuality, getChordIntervals } from "./chordConfig";

// Define keyboard mappings (all lowercase for consistent comparison)
const BASS_KEYS = "zsxdcvgbhnjm,l.;/";
const POSITION_KEYS = "01234"; // Number row for inversions, including root position

// Default quality key mappings
let qualityKeyMappings: QualityKeyMapping[] = [
  { key: "Q", quality: ChordQuality.Major, enabled: true },
  { key: "W", quality: ChordQuality.Major7, enabled: true },
  { key: "E", quality: ChordQuality.Dominant7, enabled: true },
  { key: "R", quality: ChordQuality.Minor, enabled: true },
  { key: "T", quality: ChordQuality.Minor7, enabled: true },
  { key: "Y", quality: ChordQuality.Diminished7, enabled: true },
  { key: "U", quality: ChordQuality.HalfDiminished7, enabled: true },
  { key: "I", quality: ChordQuality.DomSus, enabled: true },
  { key: "O", quality: ChordQuality.Sus, enabled: true },
  { key: "P", quality: ChordQuality.Aug, enabled: true },
  { key: "5", quality: ChordQuality.MinMaj7, enabled: true },
  { key: "6", quality: ChordQuality.Add9, enabled: true },
  { key: "7", quality: ChordQuality.MinAdd9, enabled: true },
];

// Single source of truth for pressed keys
const pressedKeys = new Set<string>();

export function updateQualityKeyMappings(newMappings: QualityKeyMapping[]) {
  qualityKeyMappings = newMappings;
}

export function getQualityKeyMappings(): QualityKeyMapping[] {
  return qualityKeyMappings;
}

function getEnabledQualityKeys(): string {
  return qualityKeyMappings
    .filter((mapping) => mapping.enabled)
    .map((mapping) => mapping.key.toLowerCase())
    .join("");
}

function getNoteFromKey(key: string, keyMap: string): number {
  const index = keyMap.indexOf(key.toLowerCase());
  return index;
}

function getQualityFromKey(
  key: string,
  position: ChordPosition = ChordPosition.Root,
): ChordQuality {
  // If a quality key is pressed, find the corresponding quality from mappings
  const qualityKey = Array.from(pressedKeys).find((key) =>
    getEnabledQualityKeys().includes(key.toLowerCase()),
  );

  if (qualityKey) {
    const mapping = qualityKeyMappings.find(
      (m) => m.key.toLowerCase() === qualityKey.toLowerCase() && m.enabled,
    );
    if (mapping) {
      return mapping.quality;
    }
  }

  // Get the bass key being pressed
  const bassKey = Array.from(pressedKeys).find((key) =>
    BASS_KEYS.includes(key.toLowerCase()),
  );
  if (!bassKey) {
    return ChordQuality.Major;
  }

  // Use the default quality based on position and bass note
  const noteIndex = getNoteFromKey(bassKey, BASS_KEYS);
  switch (position) {
    case ChordPosition.Root:
      return getDefaultQuality("root", noteIndex);
    case ChordPosition.First:
      return getDefaultQuality("first", noteIndex);
    case ChordPosition.Second:
      return getDefaultQuality("second", noteIndex);
    case ChordPosition.Third:
      return getDefaultQuality("third", noteIndex);
    default:
      return ChordQuality.Major;
  }
}

function getPositionFromKey(key: string): ChordPosition {
  const positionMap: Record<string, ChordPosition> = {
    "0": ChordPosition.Root,
    "1": ChordPosition.First,
    "2": ChordPosition.Second,
    "3": ChordPosition.Third,
  };
  return positionMap[key] || ChordPosition.Root;
}

// Calculate root note based on bass note and position
function calculateRootFromBassAndFunction(
  bassNote: number,
  position: ChordPosition,
  quality: ChordQuality,
): number {
  const intervals = getChordIntervals(quality);

  let offset = 0;
  switch (position) {
    case ChordPosition.First: // Bass is the third
      offset = -intervals[1]; // Subtract the third interval
      break;
    case ChordPosition.Second: // Bass is the fifth
      offset = -intervals[2]; // Subtract the fifth interval
      break;
    case ChordPosition.Third: // Bass is the seventh
      offset = -intervals[3]; // Subtract the seventh interval
      break;
    default: // Root position
      offset = 0;
  }

  // Calculate root note and normalize to 0-11 range
  return (bassNote + offset + 12) % 12;
}

export function generateVoicingFromKeyState(): ChordVoicing | null {
  const currentKeys = Array.from(pressedKeys).map((key) => key.toLowerCase());

  if (currentKeys.includes(" ")) {
    return null;
  }

  const bassKey = currentKeys.find((key) => BASS_KEYS.includes(key));
  const qualityKey = currentKeys.find((key) =>
    getEnabledQualityKeys().includes(key),
  );
  const positionKey = currentKeys.find((key) => POSITION_KEYS.includes(key));

  // If no bass note is pressed, return null
  if (!bassKey) {
    return null;
  }

  // Get the basic parameters
  const bassNote = getNoteFromKey(bassKey, BASS_KEYS);
  const position = positionKey
    ? getPositionFromKey(positionKey)
    : ChordPosition.Root;
  const quality = qualityKey
    ? getQualityFromKey(qualityKey, position)
    : getQualityFromKey(bassKey, position);

  const rootNote = calculateRootFromBassAndFunction(
    bassNote,
    position,
    quality,
  );

  return {
    root: rootNote,
    bass: bassNote + 48,
    quality,
    position,
    notes: [], // Will be populated by voiceLeading.ts
  };
}

export function handleKeyPress(e: KeyboardEvent): void {
  const key = e.key.toLowerCase();
  pressedKeys.add(key);
}

export function handleKeyRelease(e: KeyboardEvent): boolean {
  const key = e.key.toLowerCase();
  pressedKeys.delete(key);

  return pressedKeys.size === 0;
}

export function getKeyboardLayout() {
  return {
    qualityKeys: getEnabledQualityKeys().toUpperCase().split(""),
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
    0: "z,", // C
    1: "sl", // C#
    2: "x.", // D
    3: "d;", // D#
    4: "c/", // E
    5: "v", // F
    6: "g", // F#
    7: "b", // G
    8: "h", // G#
    9: "n", // A
    10: "j", // A#
    11: "m", // B
  };

  return keyMap[noteIndex] || null;
}
