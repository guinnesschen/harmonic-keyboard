import type { ChordIntent, ChordQuality, Inversion, PitchClass, QualityKeyMapping } from './types';
import { BASS_KEYS, INVERSION_KEYS, DEFAULT_QUALITY_MAPPINGS, NOTE_NAMES, DEFAULT_QUALITIES } from './constants';

const INVERSION_NAMES: Record<Inversion, 'root' | 'first' | 'second' | 'third'> = {
  0: 'root',
  1: 'first',
  2: 'second',
  3: 'third',
};

/**
 * Get the default chord quality for a given bass note and inversion.
 * These are hand-picked defaults optimized for the key of C major.
 */
function getDefaultQuality(bassNote: PitchClass, inversion: Inversion): ChordQuality {
  const inversionName = INVERSION_NAMES[inversion];
  return DEFAULT_QUALITIES[inversionName][bassNote] ?? 'major';
}

/**
 * Parse currently pressed keys into a chord intent.
 * Returns null if no valid chord can be formed.
 */
export function parseKeyboardState(
  pressedKeys: Set<string>,
  qualityMappings: QualityKeyMapping[]
): ChordIntent | null {
  const keys = Array.from(pressedKeys).map((k) => k.toLowerCase());

  // Find bass key
  const bassKey = keys.find((k) => BASS_KEYS.includes(k));
  if (!bassKey) return null;

  // Get bass note (index in BASS_KEYS = pitch class, wrapping at 12)
  const bassIndex = BASS_KEYS.indexOf(bassKey);
  const bassNote = (bassIndex % 12) as PitchClass;

  // Find inversion key first (needed for default quality lookup)
  const inversionKey = keys.find((k) => INVERSION_KEYS.includes(k));
  const inversion = (inversionKey ? parseInt(inversionKey, 10) : 0) as Inversion;

  // Find quality key
  const enabledQualityKeys = qualityMappings.filter((m) => m.enabled).map((m) => m.key.toLowerCase());
  const qualityKey = keys.find((k) => enabledQualityKeys.includes(k));

  let quality: ChordQuality;
  if (qualityKey) {
    // Explicit quality key pressed
    const mapping = qualityMappings.find((m) => m.key.toLowerCase() === qualityKey && m.enabled);
    quality = mapping?.quality ?? 'major';
  } else {
    // No quality key - use hand-picked default based on bass note and inversion
    quality = getDefaultQuality(bassNote, inversion);
  }

  return { bassNote, quality, inversion };
}

/**
 * Get the keyboard layout for display
 */
export function getKeyboardLayout(qualityMappings: QualityKeyMapping[]) {
  return {
    bassKeys: BASS_KEYS.toUpperCase().split(''),
    inversionKeys: INVERSION_KEYS.split(''),
    qualityKeys: qualityMappings.filter((m) => m.enabled).map((m) => m.key),
  };
}

/**
 * Create default quality mappings
 */
export function createDefaultQualityMappings(): QualityKeyMapping[] {
  return DEFAULT_QUALITY_MAPPINGS.map((m) => ({
    ...m,
    enabled: true,
  }));
}

/**
 * Get note name for a bass key index
 */
export function getBassKeyNoteName(index: number): string {
  return NOTE_NAMES[index % 12];
}

/**
 * Check if a key is a bass key
 */
export function isBassKey(key: string): boolean {
  return BASS_KEYS.includes(key.toLowerCase());
}

/**
 * Check if a key is an inversion key
 */
export function isInversionKey(key: string): boolean {
  return INVERSION_KEYS.includes(key);
}

/**
 * Check if a key is a quality key
 */
export function isQualityKey(key: string, qualityMappings: QualityKeyMapping[]): boolean {
  return qualityMappings.some((m) => m.key.toLowerCase() === key.toLowerCase() && m.enabled);
}
